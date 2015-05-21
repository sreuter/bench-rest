'use strict';

function benchrestMulti(flow, runOptions) {
  benchrest(flow, runOptions)
  .on('error', benchrestError)
  .on('progress', benchrestProgress)
  .on('end', benchrestEnd);
}
