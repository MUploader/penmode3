var events = require('events');
var Ansi2html = require('ansi-to-html');
var EpicFail = require('./fail.js');

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
  this.markdown = false;
  this.convert = new Ansi2html();
  events.EventEmitter.call(this);

  socket.on('command', function (msg) {
    if (self.interactive) {
      // String, Int or File. I hope no Plugin will let execute command directly
      // `shutdown -r now`
      if (/^[a-zA-Z0-9\s\-\.\_]+$/.exec(msg) != null) {
        self.emit('command', msg);
      } else {
        self.fail('Command contains illegal character!');
      }
    }
  });

  socket.on('io', function (str_object) {
    self.emit('io', str_object);
  });

  socket.on('stop', function () {
    self.emit('stop');
  });
}

engine.prototype.isRunning = function () {
  return this.status === STATUS.started;
};

engine.prototype.console = function (data, colors) {
  if (!this.isRunning()) { this.started(); }
  if (!this.markdown) {
    if (typeof colors === 'undefined') {
      colors = false;
    }
    if (colors) {
      data = this.convert.toHtml('' + data);
    } else {
      data = '' + data;
    }
    this.socket.emit('console', data);
  }
};

engine.prototype.render = function (data) {
  if (!this.isRunning()) { this.started(); }
  if (this.markdown) {
    this.socket.emit('render', data);
  }
};

engine.prototype.fail = function (msg) {
  if (!this.isRunning()) { this.started(); }
  var fail = new EpicFail(this.proc_n, msg);
  this.socket.emit('fail', fail.stringify());
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

engine.prototype.setMarkdown = function (bool) {
  this.markdown = bool;
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
