var spawn = require('child_process').spawn;

var p = function(pcb,cb){
  return cb(spawn('ls', ['-lh', '/usr']),"spawn");
}

module.exports = p;
