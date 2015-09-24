var colors = require('colors');

var argv = require('yargs')
    .example('$0 --www ./www --plugins ./app/plugins -p 13370', '->'.red+' Start penmode3 on port 13370 with folder')
		.option('www', {
	    describe: "Load web server from",
	  })
		.option('plugins', {
			describe: "Load plugins from",
		})
		.option('no-serve', {
			describe: "Don't start the web server",
		})
		.option('port', {
			alias: 'p',
			describe: "Socket.io [+ Server] Port",
		})
    .help('h')
    .alias('h', 'help')
		.wrap(null)
    .epilog('Do what you want cause a pirate is free! \n'+'You are a Pirate!'.rainbow)
    .argv;

if(!argv.noServe){
	var express = require('express')
	var app = express();
	var server = require('http').createServer(app);
	var io = require('socket.io')(server);
}else{
	var io = require('socket.io')();
}

var proc = require('child_process');
var plugins = [],
	proc_n = null,
	proc = null;

var jwt = require('./jwt.js');
var login = require('./login.json').login;
var auth = [];

var WEBPATH = require('path').resolve(__dirname,'../www');
var PLUGINPATH = require('path').resolve(__dirname,'./plugins');
var PORT = 13370;
var STATUS = {
	start: 1,
	end: 2,
}

// Load Plugins
require('fs').readdirSync(argv.plugins || PLUGINPATH).forEach(function(file) {
  if (file.match(/\.js$/) !== null && file !== 'main.js') {
    var name = file.replace('.js', '');
		plugins.push(name);
	}
})
console.log("Plugins loaded: "+plugins.join(", "));

// Socket.io connection
io.on('connection', function(socket) {
	var p_callback = function(error, stdout, stderr) {
		socket.emit('console', ""+stdout);
		socket.emit('console', ""+stderr);
		//io.sockets.emit('status', null);
	}

	socket.emit('login_required');

	socket.on('login', function(hash){
		for(var i=0;i<login.length;i++){
			jwt.verify(hash, login[i].pass, function(err, decoded) {
				if(decoded.user===login[i].user){
					console.log(socket.id);
					auth.push(socket.id);
					socket.emit('authenticated');
				}
			});
		}
	});

	socket.on('get_command_list', function(){
		socket.emit('command_list', plugins);
	});

	// When the client says to start a server...
	socket.on('start_command', function(name) {
		// If a server is already running or server doesn't exist
		if (proc || !plugins[name]) {
			// Let the user know that it failed.
			socket.emit('fail', 'start_server');
			// Stop execution of this callback
			return;
		}

		// Set which server is currently running
		proc_n = name;

		require('./plugins/'+plugins[name]+'.js')(p_callback,function(proc,type){
      if(type=="spawn"){
				proc.stdout.on('data', function (data) {
					if (data) {
						socket.emit('console', ""+data);
					}
				});

				proc.stderr.on('data', function (data) {
					if (data) {
						socket.emit('console', ""+data);
					}
				});

				proc.on('exit', function () {
					proc = proc_n = null;
					socket.emit('status', STATUS.end);
				});
      }
    });

		socket.emit('status', STATUS.start);

	}); // End .on('start_server')

	socket.on('command', function(cmd) {
		if (proc) {
			io.sockets.emit('console', "Player Command: " + cmd);
			proc.stdin.write(cmd + "\r");
		} else {
			socket.emit('fail', cmd);
		}
	});
});

// Allows me to type commands into the Console Window
process.stdin.resume();
process.stdin.on('data', function (data) {
	if (proc) {
		proc.stdin.write(data);
	}
});

// ExpressStatic file server
app.use(express.static(argv.www || WEBPATH));
// Server + Socket.io
server.listen(argv.port || PORT);
console.log("Penmode3".green+" [express+socket.io] listening on port "+(argv.port || PORT)+" from "+(argv.www || WEBPATH));
