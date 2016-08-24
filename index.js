var through = require('through2');
var assert = require('assert');
var streamForString = require('./lib/string');
var streamForBuffer = require('./lib/buffer');
module.exports = function split(opts){
  var delimiter = validDeleimiter(opts) ? opts : (opts || {}).delimiter;
  assert(validDeleimiter(delimiter), '[through2-split] Invalid delimiter option, should be a string or a regexp! given: ' + delimiter);
  var encoding = (Object(opts)===opts ? opts : {}).encoding;
  var stringMode = t(delimiter) === 'RegExp';
  var cache = stringMode ? { l: '' }: {
    l: [],
    n: 0
  };
  
  return stringMode ? streamForString(cache, encoding, delimiter) :
    streamForBuffer(cache, encoding, delimiter);
};

function t(o){
  return (Object.prototype.toString.call(o).match(/\[object (\w+)\]/)||[])[1];
}

function validDeleimiter(d){
  return t(d) === 'String' || t(d) === 'RegExp';
}
