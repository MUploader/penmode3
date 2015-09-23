var io = require('socket.io')(),
 	proc = require('child_process'),
	plugins = [];

require('fs').readdirSync(__dirname + '/plugins').forEach(function(file) {
  if (file.match(/\.js$/) !== null && file !== 'main.js') {
    var name = file.replace('.js', '');
		plugins.push(name);
	}
})

console.log("Plugins loaded: "+plugins.join(", "));

var	server = null,
	mc_server = null;

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
		socket.emit('status', server);
	});

	// When the client says to start a server...
	socket.on('start_server', function(name) {
		// If a server is already running or server doesn't exist
		if (mc_server || !plugins[name]) {
			// Let the user know that it failed.
			socket.emit('fail', 'start_server');
			// Stop execution of this callback
			return;
		}

		// Set which server is currently running
		server = name;

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
					proc = server = null;
					io.sockets.emit('status', null);
				});
      }
      if(type=="exec"){
        //proc();
      }
    });

		io.sockets.emit('status', server);

	}); // End .on('start_server')

	socket.on('command', function(cmd) {
		if (mc_server) {
			io.sockets.emit('console', "Player Command: " + cmd);
			mc_server.stdin.write(cmd + "\r");
		} else {
			socket.emit('fail', cmd);
		}
	});
});


// Allows me to type commands into the Console Window to control the MC Server
process.stdin.resume();
process.stdin.on('data', function (data) {
	if (mc_server) {
		mc_server.stdin.write(data);
	}
});

io.listen(13370);
console.log("Penmode3 [socket.io] listening on port 13370");
