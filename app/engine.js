var events = require('events');

var STATUS = {
  started: 1,
  ended: 2
};

function engine (socket, proc_n) {
  var self = this;
  this.socket = socket;
  this.proc_n = proc_n;
  this.status = 0;
  this.interactive = true;
  events.EventEmitter.call(this);

  socket.on('command', function (msg) {
    if (self.interactive){
      self.emit('command', msg);
    }
  });

  socket.on('io', function (str_object) {
    self.emit('io', str_object);
  });
}

engine.prototype.isRunning = function () {
  return this.status === STATUS.started;
};

engine.prototype.console = function (data) {
  if (!this.isRunning()) { this.started(); }
  this.socket.emit('console', '' + data);
};

engine.prototype.fail = function (msg) {
  if (!this.isRunning()) { this.started(); }
  this.socket.emit('fail', 'Error: event: "' + this.proc_n + '", message: ' + msg);
};

engine.prototype.request_io = function (object) {
  if (typeof object === 'string') {
    this.socket.emit('request_io', object);
  } else {
    this.socket.emit('request_io', JSON.stringify(object));
  }
};

engine.prototype.setInteractive = function (bool) {
  this.interactive = bool;
};

engine.prototype.started = function () {
  this.socket.emit('status', STATUS.started);
  this.status = STATUS.started;
};

engine.prototype.ended = function () {
  this.socket.emit('status', STATUS.ended);
};

engine.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = engine;
