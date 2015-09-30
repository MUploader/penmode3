var spawn = require('child_process').spawn;
var process = null;

var execute = function (engine, cb) {
  engine.started();
  process = spawn('ls', ['-lh', '/usr']);
  engine.console('ls -lh /usr');

  process.stdout.on('data', function (data) {
    if (data) {
      engine.console(data);
    }
  });

  process.stderr.on('data', function (data) {
    if (data) {
      engine.console(data);
    }
  });

  process.on('exit', function () {
    process = null;
    return cb(engine.ended());
  });
};

var io = function (msg) {
  process.stdin.write(msg + '\r');
};

module.exports = {
  'execute': execute,
  'io': io
};
