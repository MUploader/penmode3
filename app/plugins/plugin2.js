var exec = require('child_process').exec;

var execute = function (engine, cb) {
  engine.started();
  var input = '[{"param":"Process name"}]';
  engine.request_io(input);
  engine.on('io', function (msg) {
    var process = exec('ps aux | grep ' + msg, function (error, stdout, stderr) {
      if (error) {
        throw error;
      }
      engine.console('ps aux | grep ' + msg);
      engine.console(stdout);
      engine.console(stderr);
      return cb(engine.ended());
    });
  });
};

module.exports = {
  'execute': execute
};
