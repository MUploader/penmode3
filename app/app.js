#!/usr/bin/env node
require('colors');
var argv = require('yargs')
    .example('$0 --www ./www --plugins ./app/plugins -p 13370', '->'.red + ' Start penmode3 on port 13370 with folder')
    .option('www', {describe: 'Load web server from'})
    .option('plugins', {describe: 'Load plugins from'})
    .option('noserve', {alias: 'n', type: 'boolean', describe: 'Don\'t start the web server'})
    .option('port', {alias: 'p', describe: 'Socket.io [+ Server] Port'})
    .help('h')
    .alias('h', 'help')
    .wrap(null)
    .epilog('Do what you want cause a pirate is free! \n' + 'You are a Pirate!'.rainbow)
    .argv;

if (!argv.noserve) {
  var express = require('express');
  var app = express();
  var server = require('http').createServer(app);
  var io = require('socket.io')(server);
} else {
  var io = require('socket.io')();
}

var crypto = require('crypto');
var request = require('request');
var plugins = [];
var proc_n = null;

var jwt = require('./jwt.js');
var login = require('./login.json').login;
var Engine = require('./engine.js');
var Fail = require('./fail.js');
var auth = [];

var WEBPATH = require('path').resolve(__dirname, '../www');
var PLUGINPATH = require('path').resolve(__dirname, './plugins');
var PORT = 13370;

Array.prototype.contains = function (data) {
  return this.indexOf(data) > -1;
};

function setupLogin (cb) {
  var prompt = require('prompt');
  prompt.message = '>'.red;
  prompt.delimiter = ' ';
  prompt.colors = false;
  console.log('Welcome to ' + 'Penmode3'.rainbow);
  console.log('You must add at least 1 user before starting Penmode3\n');
  var schema = {
    properties: {
      username: {
        description: 'Enter your username:',
        type: 'string',
        pattern: /^[a-zA-Z0-9\s\-]+$/,
        message: 'Name must be only letters, number, spaces, or dashes',
        required: true
      },
      password: {
        description: 'Enter your password:',
        type: 'string',
        required: true,
        hidden: true
      },
      repassword: {
        description: 'Confirm your password:',
        type: 'string',
        required: true,
        hidden: true
      }
    }
  };
  prompt.start();
  prompt.get(schema, function (err, result) {
    if (err) {
      return console.log(err.red);
    }
    if (result.password == result.repassword) {
      var user = {};
      user.user = result.username;
      user.pass_sha512 = crypto.createHash('sha512').update(result.password).digest('hex');
      var obj = {};
      obj.login = [];
      obj.login.push(user);
      var path = require('path').resolve(__dirname, './login.json');
      require('fs').writeFile(path, JSON.stringify(obj), function (err) {
        if (err) {
          return console.log(err);
        }
        console.log('User successfully added!'.green);
        login = obj.login;
        return cb();
      });
    } else {
      console.log("Passwords don't match!");
    }
  });
}

// Load Plugins
function loadPlugin() {
  try {
    require('fs').readdirSync(argv.plugins || PLUGINPATH).forEach(function (file) {
      if (file.match(/\.js$/) !== null && file !== 'main.js') {
        var name = file.replace('.js', '');
        plugins.push(name);
      }
    });
    console.log('Plugins loaded: '.green + plugins.join(', '));
  } catch (err) {
    console.log(err.red);
    process.exit();
  }
}

function getTor (cb) {
  request.get({
    url: 'https://check.torproject.org/'
  }, function (err, resp, body) {
    if (!err) {
      if (resp.statusCode === 200) {
        if (body.indexOf('tor-off.png') > -1) {
          return cb(false);
        } else if (body.indexOf('tor-on.png') > -1) {
          return cb(true);
        } else {
          return cb(undefined);
        }
      }
    }
  });
}

function getIP (cb) {
  request.get({
    url: 'http://ipinfo.io/ip',
    json: true
  }, function (err, resp, body) {
    if (!err) {
      if (resp.statusCode === 200) {
        return cb(body);
      }
    }
  });
}

// Socket.io connection
io.on('connection', function (socket) {
  var check_auth = function (socket_id) {
    if (auth.indexOf(socket_id) > -1) {
      return true;
    }
    return false;
  };

  try {
    var salt = crypto.randomBytes(16);
    socket.emit('login_required', salt.toString('hex'));
  } catch (ex) {
    var fail = new Fail('connection', ex);
    socket.emit('fail', fail.stringify());
  }

  socket.on('login', function (webauth) {
    webauth = JSON.parse(webauth);
    var user = null;
    for (var i = 0; i < login.length; i++) {
      if (webauth.username == login[i].user) {
        user = login[i];
      }
    }
    if (user === undefined) {
      var fail = new Fail('login', 'user is undefined');
      socket.emit('fail', fail.stringify());
      return;
    }
    var pass = new Buffer(user.pass_sha512, 'hex');
    crypto.pbkdf2(pass, salt, 1000, 512 / 8, 'sha512', function (err, key) {
      if (err) {
        throw err;
      }
      jwt.verify(webauth.token, key.toString('hex'), function (err, decoded) {
        if (err) {
          throw err;
        }
        if (decoded.user === user.user && decoded.socket == socket.id) {
          console.log(socket.id);
          auth.push(socket.id);
          proc_n = null;
          socket.emit('authenticated');
        }
      });
    });
  });

  socket.on('get_plugin_list', function () {
    if (!check_auth(socket.id)) { socket.emit('login_required'); return; }
    socket.emit('plugin_list', plugins);
  });

  socket.on('get_ip_status', function () {
    if (!check_auth(socket.id)) { socket.emit('login_required'); return; }
    var ip_status = {};
    getIP(function (e_ip) {
      ip_status.ip = e_ip.replace(/\n/g, '');
      getTor(function (tor_status) {
        ip_status.tor = tor_status;
        socket.emit('ip_status', ip_status);
      });
    });
  });

  socket.on('start_plugin', function (name) {
    if (!check_auth(socket.id)) { socket.emit('login_required'); return; }
    // If a server is already running or server doesn't exist
    if (proc_n || !plugins.contains(name)) {
      // Let the user know that it failed.
      var fail = new Fail('start_plugin', proc_n + ' is already running');
      socket.emit('fail', fail.stringify());
      // Stop execution of this callback
      return;
    }

    // Set which server is currently running
    proc_n = name;
    var en = new Engine(socket, proc_n);
    try {
      var plugin_path = require('path').join((argv.plugins || PLUGINPATH), proc_n + '.js');
      require(plugin_path).execute(en, function (f) {
        proc_n = null;
      });
    } catch (ex) {
      var fail = new Fail('start_plugin', 'Plugin file not found ' + plugin_path);
      socket.emit('fail', fail.stringify());
    }
  });

  socket.on('stop', function () {
    proc_n = null;
  });

  socket.on('command', function (cmd) {
    if (!check_auth(socket.id)) { socket.emit('login_required'); return; }
    if (proc_n) {
      socket.emit('console', '> ' + cmd);
    } else {
      var fail = new Fail('command', 'No process Running');
      socket.emit('fail', fail.stringify());
    }
  });
});

function start() {
  var msg = '';
  if (!argv.noserve) {
    // ExpressStatic file server
    app.use(express.static(argv.www || WEBPATH));
    // Server + Socket.io
    server.listen(argv.port || PORT);
    msg = '[express+socket.io]';
  } else {
    io.listen(argv.port || PORT);
    msg = '[socket.io]';
  }
  console.log('Penmode3'.green +
    ' ' + msg + ' listening on port ' + (argv.port || PORT) +
    ' from ' + (argv.www || WEBPATH));
}

if (login.length == 1 && login[0].user == 'toor') {
  setupLogin(function () {
    loadPlugin();
    start();
  })
} else {
  loadPlugin();
  start();
}
