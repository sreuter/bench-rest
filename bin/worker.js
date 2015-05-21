'use strict';

var benchrest = require('../.');

function benchrestError (err, ctxName) {
  process.send({
    type: 'error',
    data: {
      err: err,
      ctxName: ctxName
    }
  });
}

function benchrestProgress (stats, percent, concurrent, ips) {
  process.send({
    type: 'progress',
    data: {
      stats: stats,
      percent: percent,
      concurrent: concurrent,
      ips: ips
    }
  });
}

function benchrestEnd (stats, errorCount) {
  process.send({
    type: 'end',
    data: {
      stats: stats,
      errorCount: errorCount
    }
  });
}

var flow =  JSON.parse(process.argv[1]);
var runOptions = JSON.parse(process.argv[2]);

benchrest(flow, runOptions)
.on('error', benchrestError)
.on('progress', benchrestProgress)
.on('end', benchrestEnd);
