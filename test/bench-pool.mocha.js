'use strict';

var sinon = require('sinon');
var assert = require('chai').assert;
var benchpool = require('../lib/bench-pool.js');
var EventEmitter = require('events').EventEmitter;

var createMockWorker = function () {
  var worker = new EventEmitter();
  worker.run = sinon.spy();
  return worker;
};

suite('bench-pool');

test('pool distributes load across workers', function () {
  var worker1 = createMockWorker();
  var worker2 = createMockWorker();
  var worker3 = createMockWorker();
  var flow = {};
  var runOptions = {
    limit: 10,
    iterations: 100
  };
  var pool = benchpool([worker1, worker2, worker3]);

  pool.run(flow, runOptions);

  assert.ok(worker1.run.calledOnce);
  assert.equal(worker1.run.args[0][0], flow);
  assert.equal(worker1.run.args[0][1].limit, 4);
  assert.equal(worker1.run.args[0][1].iterations, 34);

  assert.ok(worker2.run.calledOnce);
  assert.equal(worker2.run.args[0][0], flow);
  assert.equal(worker2.run.args[0][1].limit, 3);
  assert.equal(worker2.run.args[0][1].iterations, 33);

  assert.ok(worker3.run.calledOnce);
  assert.equal(worker3.run.args[0][0], flow);
  assert.equal(worker3.run.args[0][1].limit, 3);
  assert.equal(worker3.run.args[0][1].iterations, 33);
});

test('pool distribution mechanism', function () {
  var d1 = benchpool.distribute(10, 3);
  assert.equal(d1.length, 3);
  assert.equal(d1[0], 4);
  assert.equal(d1[1], 3);
  assert.equal(d1[2], 3);

  var d2 = benchpool.distribute(0, 2);
  assert.equal(d2.length, 2);
  assert.equal(d2[0], 0);
  assert.equal(d2[1], 0);

  var d3 = benchpool.distribute(0, 0);
  assert.equal(d3.length, 0);

  var d4 = benchpool.distribute(100, 1);
  assert.equal(d4.length, 1);
  assert.equal(d4[0], 100);

  var d5 = benchpool.distribute(2, 3);
  assert.equal(d5.length, 3);
  assert.equal(d5[0], 1);
  assert.equal(d5[1], 1);
  assert.equal(d5[2], 0);
});

test('pool aggregates worker progress events', function () {
  var worker1 = createMockWorker();
  var worker2 = createMockWorker();
  var worker3 = createMockWorker();
  var progressListener = sinon.spy();
  var flow = {};
  var runOptions = {
    limit: 10,
    iterations: 100
  };
  var pool = benchpool([worker1, worker2, worker3]);
  pool.run(flow, runOptions);
  pool.on('progress', progressListener);

  worker1.emit('progress', {}, 100, 0, 0);
  assert.equal(Math.floor(progressListener.args[0][1]), 33);

  worker2.emit('progress', {}, 50, 50, 50);
  assert.equal(Math.floor(progressListener.args[1][1]), 50);
  assert.equal(Math.floor(progressListener.args[1][2]), 50);
  assert.equal(Math.floor(progressListener.args[1][3]), 50);

  worker3.emit('progress', {}, 50, 50, 50);
  assert.equal(Math.floor(progressListener.args[2][1]), 66);
  assert.equal(Math.floor(progressListener.args[2][2]), 100);
  assert.equal(Math.floor(progressListener.args[2][3]), 100);

  worker3.emit('progress', {}, 100, 0, 0);
  assert.equal(Math.floor(progressListener.args[3][1]), 83);
  assert.equal(Math.floor(progressListener.args[3][2]), 50);
  assert.equal(Math.floor(progressListener.args[3][3]), 50);

  worker2.emit('progress', {}, 100, 0, 0);
  assert.equal(Math.floor(progressListener.args[4][1]), 100);
});


//stats:  { totalElapsed: 583.4705369994044,
//  main:
//   { meter:
//      { mean: 17.150686009596825,
//        count: 10,
//        currentRate: 17.150705246901587,
//        '1MinuteRate': 0,
//        '5MinuteRate': 0,
//        '15MinuteRate': 0 },
//     histogram:
//      { min: 457.89309299737215,
//        max: 576.4819390028715,
//        sum: 4916.303041994572,
//        variance: 1207.508560261525,
//        mean: 491.63030419945716,
//        stddev: 34.74922387998795,
//        count: 10,
//        median: 485.909265499562,
//        p75: 506.83953949809074,
//        p95: 576.4819390028715,
//        p99: 576.4819390028715,
//        p999: 576.4819390028715 } } }


// emitter.emit('progress', statsObj, percent, concurrentCount, ips);
// - ignore statsObj for now
// - devide percent by worker count
//   var percent = (statsObj.main) ? Math.round(statsObj.main.meter.count * 100 / runOptions.iterations) : 0;
// - we sum(concurrentCount)
// - we sum(ips)
//   var ips = (statsObj.main) ? Math.round(statsObj.main.meter.currentRate) : 0; // current iterations per second
//