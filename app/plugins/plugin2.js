var exec = require('child_process').exec;

var p = function(pcb,cb){
  return cb(exec('ps aux | grep firefox',pcb),"exec");
}

module.exports = p;
