var exec = require('child_process').exec;

var execute = function (engine, cb) {
  engine.started();
  var input = '[{"param":"process_name"}]';
  engine.request_io(input);
  engine.once('io', function (obj) {
    obj = JSON.parse(obj);
    exec('ps aux | grep ' + obj.process_name, function (error, stdout, stderr) {
      if (error) {
        throw error;
      }
      engine.console('> ps aux | grep ' + obj.process_name);
      engine.console(stdout);
      engine.console(stderr);
      return cb(engine.ended());
    });
  });
};

module.exports = {
  'execute': execute
};
