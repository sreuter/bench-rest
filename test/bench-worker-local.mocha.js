'use strict';

var sinon = require('sinon');
var events = require('events');
var assert = require('chai').assert;
var workerLocal = require('../lib/bench-worker-local.js');

suite('bench-worker-local');

test('a local worker passes the flow and runOptions', function () {
  var module = 'someModule';
  var proc = new events.EventEmitter();
  var fork = sinon.stub().returns(proc);
  var flow = {};
  var runOptions = {};
  var worker = workerLocal(module, fork);
  worker.run(flow, runOptions);

  assert.ok(fork.calledOnce);
  assert.equal(fork.args[0][0], module);
  assert.equal(fork.args[0][1][0], JSON.stringify(flow));
  assert.equal(fork.args[0][1][1], JSON.stringify(runOptions));
});

test('a local worker forwards the end event', function () {
  var endListener = sinon.spy();
  var data = {};
  var module = 'someModule';
  var proc = new events.EventEmitter();
  var fork = sinon.stub().returns(proc);
  var flow = {};
  var runOptions = {};
  var worker = workerLocal(module, fork);
  worker.run(flow, runOptions);
  worker.on('end', endListener);

  proc.emit('message', {
    type: 'end',
    data: data
  });

  assert.ok(endListener.calledOnce);
  assert.equal(endListener.args[0][0], data);
});

test('a local worker forwards the progress event', function () {
  var progressListener = sinon.spy();
  var data = {};
  var module = 'someModule';
  var proc = new events.EventEmitter();
  var fork = sinon.stub().returns(proc);
  var flow = {};
  var runOptions = {};
  var worker = workerLocal(module, fork);
  worker.run(flow, runOptions);
  worker.on('progress', progressListener);

  proc.emit('message', {
    type: 'progress',
    data: data
  });

  assert.ok(progressListener.calledOnce);
  assert.equal(progressListener.args[0][0], data);
});

test('a local worker forwards the error event', function () {
  var errorListener = sinon.spy();
  var err = {};
  var module = 'someModule';
  var proc = new events.EventEmitter();
  var fork = sinon.stub().returns(proc);
  var flow = {};
  var runOptions = {};
  var worker = workerLocal(module, fork);
  worker.run(flow, runOptions);
  worker.on('error', errorListener);

  proc.emit('message', {
    type: 'error',
    data: err
  });

  assert.ok(errorListener.calledOnce);
  assert.equal(errorListener.args[0][0], err);
});

test('a local worker forwards process errors', function () {
  var errorListener = sinon.spy();
  var module = 'someModule';
  var proc = new events.EventEmitter();
  var fork = sinon.stub().returns(proc);
  var flow = {};
  var runOptions = {};
  var worker = workerLocal(module, fork);
  var err = new Error();
  worker.run(flow, runOptions);
  worker.on('error', errorListener);

  proc.emit('error', err);

  assert.ok(errorListener.calledOnce);
  assert.equal(errorListener.args[0][0].err, err);
  assert.equal(errorListener.args[0][0].ctxName, 'fork');
});