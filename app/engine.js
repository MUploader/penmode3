var STATUS = {
  started: 1,
  ended: 2
};

function engine (socket) {
  this.socket = socket;
  this.status = 0;
}

engine.prototype.isRunning = function(){
  return this.status == STATUS.started;
}

engine.prototype.console = function (data) {
  if(!this.isRunning()) { this.started(); }
  this.socket.emit('console', '' + data);
};

engine.prototype.fail = function (msg) {
  if(!this.isRunning()) { this.started(); }
  this.socket.emit('fail', '' + msg);
};

engine.prototype.started = function () {
  this.socket.emit('status', STATUS.started);
  this.status = STATUS.started;
};

engine.prototype.ended = function () {
  this.socket.emit('status', STATUS.ended);
};

module.exports = engine;
