var express = require('express')
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var proc = require('child_process');
var plugins = [],
	proc_n = null,
	proc = null;

require('fs').readdirSync(__dirname + '/plugins').forEach(function(file) {
  if (file.match(/\.js$/) !== null && file !== 'main.js') {
    var name = file.replace('.js', '');
		plugins.push(name);
	}
})
console.log("Plugins loaded: "+plugins.join(", "));

function p_callback(error, stdout, stderr) {
	io.sockets.emit('console', ""+stdout);
	io.sockets.emit('console', ""+stderr);
	//io.sockets.emit('status', null);
}

io.on('connection', function(socket) {

	socket.on('get_server_list', function(){
		socket.emit('server_list', plugins);
	});

	socket.on('get_status', function(){
		socket.emit('status', proc_n);
	});

	// When the client says to start a server...
	socket.on('start_server', function(name) {
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
						io.sockets.emit('console', ""+data);
					}
				});

				proc.stderr.on('data', function (data) {
					if (data) {
						io.sockets.emit('console', ""+data);
					}
				});

				proc.on('exit', function () {
					proc = proc_n = null;
					io.sockets.emit('status', null);
				});
      }
    });

		io.sockets.emit('status', proc_n);

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
// TODO: NodeJS CWD
app.use(express.static('../www'));
// Server + Socket.io
server.listen(13370);
console.log("Penmode3 [express+socket.io] listening on port 13370");
