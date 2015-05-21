'use strict';

var t = require('chai').assert;
var benchmulti = require('../lib/bench-multi.js');

suite('bench-multi');



//test('remote workers', function () {
//  var runOptions = {};
//  var worker1 = new RemoteWorker('another url');
//  var worker2 = new RemoteWorker('some url');
//  var pool = new Pool(runOptions, [worker1, worker2]);
//
//  pool.run();
//  pool.on('error', function () {});
//  pool.on('end', function () {});
//  pool.on('progress', function () {});
//});
//
//test('local workers', function () {
//  var runOptions = {};
//  var worker1 = new LocalWorker();
//  var worker2 = new LocalWorker();
//  var pool = new Pool([worker1, worker2]);
//
//  pool.run(flow, runOptions);
//  pool.on('error', function () {});
//  pool.on('end', function () {});
//  pool.on('progress', function () {});
//});
//
//test('Worker Description', function () {
//  var worker = new LocalWorker();
//  worker.run(flow, runOptions)
//  worker.on('error', function () {});
//  worker.on('end', function () {});
//  worker.on('progress', function () {});
//});

//var runOptions = {
//  limit: concurrency, <- divide by nodes
//  iterations: iterations, <- divide by nodes
//  prealloc: prealloc, <- divide by nodes
//  user: user,
//  password: password,
//  progress: progress
//};