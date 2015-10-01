var exec = require('child_process').exec;

var execute = function (engine, cb) {
  engine.started();
  var input = '[{"param":"address"}]';
  engine.request_io(input);
  engine.once('io', function (obj) {
    obj = JSON.parse(obj);
    exec('nmap ' + obj.address, function (error, stdout, stderr) {
      if (error) {
        throw error;
      }
      engine.console('> nmap ' + obj.address);
      engine.console(stdout);
      engine.console(stderr);
      return cb(engine.ended());
    });
  });
};


module.exports = {
  'execute': execute
};
