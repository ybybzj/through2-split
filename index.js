var through = require('through2');
var assert = require('assert');
var $util = require('util');
var streamForString = require('./lib/string');
var streamForBuffer = require('./lib/buffer');
module.exports = function split(opts){
  var delimiter = $util.isString(opts) || $util.isRegExp(opts) ? opts : (opts || {}).delimiter;
  assert($util.isString(delimiter) || $util.isRegExp(delimiter), '[through2-split] Invalid delimiter option, should be a string or a regexp! given: ' + delimiter);
  var encoding = (Object(opts)===opts ? opts : {}).encoding;
  var stringMode = $util.isRegExp(delimiter);
  var cache = stringMode ? { l: '' }: {
    l: [],
    n: 0
  };
  
  return stringMode ? streamForString(cache, encoding, delimiter) :
    streamForBuffer(cache, encoding, delimiter);
};
