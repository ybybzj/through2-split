var through = require('through2');

module.exports = function(cache, encoding, reg) {
  console.log('string mode');
  return through(
    function transform(chunk, _, cb) {
      if (Buffer.isBuffer(chunk)) {
        chunk = chunk.toString(encoding || 'utf8');
      }
      var parts = chunk.split(reg);
      var segFromCache = push(parts.shift(), reg, cache);
      if (segFromCache.length) {
        this.push(segFromCache);
      }
      

      if (parts.length) {
        segFromCache = pop(cache);
        if (segFromCache.length) {
          this.push(segFromCache);
        }
        for (var i = 0, l = parts.length; i < l - 1; i++) {
          if(parts[i].length){
            this.push(parts[i]);
          }
        }
      }

      var tail = parts.pop();
      if(tail){
        push(tail, reg, cache);
      }
      cb();
    },
    function flush(cb) {
      var segFromCache = pop(cache);
      if(segFromCache.length){
        this.push(segFromCache);
      }
      cb();
    }
  );
}

function push(part, reg, cache) {
  var s = cache.l + part;
  var ps = s.split(reg);

  if (ps.length === 2) {
    cache.l = ps[1];
    return ps[0];
  } else {
    cache.l = s;
    return '';
  }
}

function pop(cache) {
  var s = cache.l;
  cache.l = '';
  return s;
}
