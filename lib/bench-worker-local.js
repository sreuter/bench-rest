'use strict';

var util = require('util');
var events = require('events');

var workerLocal = module.exports = function (module, fork) {
  return new Worker(module, fork);
};

var Worker = function (module, fork) {
  this._module = module;
  this._fork = fork;
};

util.inherits(Worker, events.EventEmitter);

Worker.prototype.run = function (flow, runOptions) {
  var flowJson = JSON.stringify(flow);
  var runOptionsJson = JSON.stringify(runOptions);

  this._fork(this._module, [flowJson, runOptionsJson])
    .on('message', this._handleMessage.bind(this))
    .on('error', this._handleError.bind(this));

  return this;
};

Worker.prototype._handleMessage = function (message) {
  switch (message.type) {
    case 'progress':
      this.emit('progress', message.data);
      break;
    case 'end':
      this.emit('end', message.data);
      break;
    case 'error':
      this.emit('error', message.data);
      break;
  }
};

Worker.prototype._handleError = function (err) {
  this.emit('error', {err: err, ctxName: 'fork'});
};

