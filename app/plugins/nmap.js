var exec = require('child_process').exec;

var execute = function (engine, cb) {
  engine.started();
  var process = exec('nmap localhost', function (error, stdout, stderr) {
    if (error) {
      throw error;
    }
    engine.console('nmap localhost');
    engine.console(stdout);
    engine.console(stderr);
    return cb(engine.ended());
  });
}

var io = function () {

}

module.exports = {
  'execute': execute,
  'io': io
};