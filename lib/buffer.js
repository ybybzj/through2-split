var through = require('through2');

module.exports = function bufferSplit(cache, encoding, delimiter) {
  delimiter = Buffer.isBuffer(delimiter) ? delimiter : new Buffer(''+delimiter, encoding || 'utf8') ;

  return through(
    function transform(chunk, _, cb) {
      var parts, segFromCache, tail;
      if (!Buffer.isBuffer(chunk)) {
        chunk = new Buffer(chunk, encoding || 'utf8');
      }

      parts = getParts(chunk, delimiter);
      push(parts.shift(), cache);
      segFromCache = getSegFromCache(cache, delimiter);
      if (segFromCache && segFromCache.length) {
        this.push(segFromCache);
      }


      if (parts.length) {
        segFromCache = pop(cache);
        if (segFromCache.length) {
          this.push(segFromCache);
        }
        for (var i = 0, l = parts.length; i < l - 1; i++) {
          if (parts[i].length) {
            this.push(parts[i]);
          }
        }
      }

      tail = parts.pop();
      if (tail) {
        push(tail, cache);
      }
      cb();
    },
    function flush(cb) {
      var segFromCache = pop(cache);
      if (segFromCache.length) {
        this.push(segFromCache);
      }
      cb();
    }
  );
};

function getSegFromCache(cache, delimiter) {
  var buf = Buffer.concat(cache.l, cache.n);
  var idx = buf.indexOf(delimiter);
  var result, remain;
  if (idx !== -1) {
    result = buf.slice(0, idx);
    remain = buf.slice(idx + delimiter.length);
    if (remain.length) {
      cache.l[0] = remain;
      cache.l.length = 1;
    }
    cache.n = remain.length;

  }
  return result;
}

function pop(cache) {
  var buf = Buffer.concat(cache.l, cache.n);
  cache.l.length = 0;
  cache.n = 0;
  return buf;
}

function push(buf, cache) {
  cache.l.push(buf);
  cache.n += buf.length;
}

function getParts(buf, delimiter) {
  var idx = buf.indexOf(delimiter);
  var dlen = delimiter.length;
  var bufs = [];
  while (idx !== -1) {
    bufs.push(buf.slice(0, idx));
    buf = buf.slice(idx + dlen);
    idx = buf.indexOf(delimiter);
  }

  if (buf.length) {
    bufs.push(buf);
  }
  return bufs;
}
