'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;

// creates a deep copy of the given object
var copy = function (obj) { return JSON.parse(JSON.stringify(obj)); };

// creates an array of the given len with all values set to 0
var arrayOfLength = function (len) {
  var lst = [];
  while (len--) { lst.push(0); }
  return lst;
};

// some math
var sum = function (a, b) { return a + b; };
var total = function (values) { return values.reduce(sum, 0); };
var mean = function (values) { return total(values) / values.length; };

/**
 * Creates a new pool instance.
 * @param {Array<Worker>} workers
 * @returns {Pool}
 */
var benchpool = module.exports = function (workers) {
  return new Pool(workers);
};

/**
 * Distributes flows across a pool of workers.
 * @param {Array<Worker>} workers
 * @constructor
 */
var Pool = function (workers) {
  this._workers = workers;
  this._workerState = {
    percent: arrayOfLength(workers.length),
    ips: arrayOfLength(workers.length),
    concurrentCount: arrayOfLength(workers.length),
  };
};

/**
 * Triggers the following events.
 * @fires Pool#end
 * @fires Pool#error
 * @fires Pool#progress
 */
util.inherits(Pool, EventEmitter);

/**
 * Run the given flow.
 * @param {Object} flow
 * @param {Object} runOptions
 */
Pool.prototype.run = function (flow, runOptions) {
  var iterationDistribution = benchpool.distribute(runOptions.iterations, this._workers.length);
  var limitDistribution = benchpool.distribute(runOptions.limit, this._workers.length);

  this._workers.forEach(function (worker, index) {

    var workerRunOptions = copy(runOptions);
    workerRunOptions.iterations = iterationDistribution[index];
    workerRunOptions.limit = limitDistribution[index];

    worker.on('progress', this._handleWorkerProgress.bind(this, index));
    worker.on('error', this._handleWorkerError.bind(this, index));
    worker.on('end', this._handleWorkerEnd.bind(this, index));

    worker.run(flow, workerRunOptions);

  }, this);
};

Pool.prototype._handleWorkerProgress = function (workerIndex, statsObj, percent, concurrentCount, ips) {
  this._workerState.percent[workerIndex] = percent;
  this._workerState.concurrentCount[workerIndex] = concurrentCount;
  this._workerState.ips[workerIndex] = ips;
  this.emit(
    'progress',
    statsObj,
    mean(this._workerState.percent),
    total(this._workerState.concurrentCount),
    total(this._workerState.ips)
  );
};

Pool.prototype._handleWorkerError = function (workerIndex, err) {};

Pool.prototype._handleWorkerEnd = function (workerIndex) {};

/**
 * Distribute a sum across a given number of buckets.
 * @param {Number} num an integer > 0
 * @param {Number} buckets an integer > 0
 * @returns {Array}
 */
benchpool.distribute = function (num, buckets) {
  var distribution = arrayOfLength(buckets);

  for (var i = 0; i < num; i++) {
    distribution[(i % buckets)]++;
  }

  return distribution;
};