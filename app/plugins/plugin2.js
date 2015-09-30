var exec = require('child_process').exec;

var execute = function (engine, cb) {
  engine.started();
  var process = exec('ps aux | grep firefox', function (error, stdout, stderr) {
    if (error) {
      throw error;
    }
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
