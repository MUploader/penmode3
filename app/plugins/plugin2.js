var exec = require('child_process').exec;

var execute = function (engine) {
  var process = exec('ps aux | grep firefox', function (error, stdout, stderr) {
    if (error) {
      throw error;
    }
    engine.console(stdout);
    engine.console(stderr);
    return engine.ended();
  });
}

module.exports = {
  'execute': execute,
  'io': io
};
