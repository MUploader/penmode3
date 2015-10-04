function epicfail (fevent, message) {
  this.f = {};
  this.f.event = fevent;
  this.f.message = message;
  //return this.f;
}

epicfail.prototype.stringify = function () {
  return JSON.stringify(this.f);
};

epicfail.prototype.finalize = function () {
  return this.f;
};

module.exports = epicfail;
