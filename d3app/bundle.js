require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * arr-flatten <https://github.com/jonschlinkert/arr-flatten>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function flatten(arr) {
  return flat(arr, []);
};

function flat(arr, res) {
  var len = arr.length;
  var i = -1;

  while (len--) {
    var cur = arr[++i];
    if (Array.isArray(cur)) {
      flat(cur, res);
    } else {
      res.push(cur);
    }
  }
  return res;
}
},{}],2:[function(require,module,exports){
'use strict';

module.exports = function union(init) {
  if (!Array.isArray(init)) {
    throw new TypeError('arr-union expects the first argument to be an array.');
  }

  var len = arguments.length;
  var i = 0;

  while (++i < len) {
    var arg = arguments[i];
    if (!arg) continue;

    if (!Array.isArray(arg)) {
      arg = [arg];
    }

    for (var j = 0; j < arg.length; j++) {
      var ele = arg[j];

      if (init.indexOf(ele) >= 0) {
        continue;
      }
      init.push(ele);
    }
  }
  return init;
};

},{}],3:[function(require,module,exports){
var base = require('typewise-core/base')
var codecs = require('./codecs')
var util = require('./util')

//
// extend core sorts defined by typewise with bytewise-specific functionality
//

// byte represents byte tag prefix in encoded form, enforcing binary total order
// type tag is 1 byte, which gives us plenty of room to grow

//
// boundary types
//
base.bound.encode = util.encodeBaseBound

//
// value types
//
var sorts = base.sorts

sorts.void.byte = 0xf0

sorts.null.byte = 0x10


var BOOLEAN = sorts.boolean
BOOLEAN.sorts.false.byte = 0x20
BOOLEAN.sorts.true.byte = 0x21
BOOLEAN.bound.encode = util.encodeBound


var NUMBER = sorts.number
NUMBER.sorts.min.byte = 0x40
NUMBER.sorts.negative.byte = 0x41
NUMBER.sorts.positive.byte = 0x42
NUMBER.sorts.max.byte = 0x43
NUMBER.sorts.negative.codec = codecs.NEGATIVE_FLOAT
NUMBER.sorts.positive.codec = codecs.POSITIVE_FLOAT
NUMBER.bound.encode = util.encodeBound


var DATE = sorts.date
DATE.sorts.negative.byte = 0x51
DATE.sorts.positive.byte = 0x52
DATE.sorts.negative.codec = codecs.PRE_EPOCH_DATE
DATE.sorts.positive.codec = codecs.POST_EPOCH_DATE
DATE.bound.encode = util.encodeBound


var BINARY = sorts.binary
BINARY.byte = 0x60
BINARY.codec = codecs.UINT8
BINARY.bound.encode = util.encodeBound


var STRING = sorts.string
STRING.byte = 0x70
STRING.codec = codecs.UTF8
STRING.bound.encode = util.encodeBound


var ARRAY = sorts.array
ARRAY.byte = 0xa0
ARRAY.codec = codecs.LIST
ARRAY.bound.encode = util.encodeListBound


// var OBJECT = sorts.object
// OBJECT.byte = 0xb0
// OBJECT.codec = codecs.HASH
// OBJECT.bound.encode = util.encodeListBound

module.exports = base

},{"./codecs":4,"./util":6,"typewise-core/base":20}],4:[function(require,module,exports){
(function (Buffer){
var util = require('./util')

var FLOAT_LENGTH = 8

function identity(value) {
  return value
}

function shortlexEncode(codec) {
  return function (source, base) {
    // stupid lazy implementation
    // TODO: allow length getter to be provided
    var length = util.encodeFloat(source.length)
    var body = codec.encode(source, base)
    return Buffer.concat([ length, body ])
  }
}

function shortlexDecode(codec) {
  return function (buffer) {
    // stupid lazy implementation
    return codec.decode(this, buffer.slice(FLOAT_LENGTH))
  }
}

function shortlexParse(codec) {
  // TODO
  return function (buffer, base) {
    throw new Error('NYI')
  }
}

function shortlex(codec) {
  return {
    encode: shortlexEncode(codec),
    decode: shortlexDecode(codec),
    parse: shortlexParse(codec)
  }
}

//
// pairs of encode/decode functions
//
var codecs = exports

codecs.HEX = {
  encode: function (source) {
    return new Buffer(source, 'hex')
  },
  decode: function (buffer) {
    return buffer.toString('hex')
  }
}

codecs.UINT8 = {
  encode: identity,
  decode: identity,
  escape: util.escapeFlat,
  unescape: util.unescapeFlat
}

codecs.UINT8_SHORTLEX = shortlex(codecs.UINT8)

codecs.UTF8 = {
  encode: function (source) {
    return new Buffer(source, 'utf8')
  },
  decode: function (buffer) {
    return buffer.toString('utf8')
  },
  escape: util.escapeFlatLow,
  unescape: util.unescapeFlatLow
}

codecs.UTF8_SHORTLEX = shortlex(codecs.UTF8)

codecs.POSITIVE_FLOAT = {
  length: FLOAT_LENGTH,
  encode: util.encodeFloat,
  decode: util.decodeFloat
}

codecs.NEGATIVE_FLOAT = {
  length: FLOAT_LENGTH,
  encode: util.encodeFloat,
  decode: function (buffer) {
    return util.decodeFloat(buffer, null, true)
  }
}

codecs.POST_EPOCH_DATE = {
  length: FLOAT_LENGTH,
  encode: util.encodeFloat,
  decode: function (buffer) {
    return new Date(util.decodeFloat(buffer))
  }
}

codecs.PRE_EPOCH_DATE = {
  length: FLOAT_LENGTH,
  encode: util.encodeFloat,
  decode: function (buffer) {
    return new Date(util.decodeFloat(buffer, null, true))
  }
}

//
// base encoding for complex structures
//
codecs.LIST = {
  encode: util.encodeList,
  decode: util.decodeList
}

codecs.TUPLE = shortlex(codecs.LIST)

//
// member order is preserved and accounted for in sort (except for number keys)
//
codecs.HASH = {
  // TODO
  // encode: util.encodeHash,
  // decode: util.decodeHash
}

codecs.RECORD = shortlex(codecs.HASH)

}).call(this,require("buffer").Buffer)
},{"./util":6,"buffer":27}],5:[function(require,module,exports){
(function (Buffer){
var assert = require('./util').assert
var base = require('./base')
var codecs = require('./codecs')

var bytewise = exports

//
// expose type information
//
var sorts = bytewise.sorts = base.sorts
bytewise.bound = base.bound
bytewise.compare = base.compare
bytewise.equal = base.equal

//
// generate a buffer with type's byte prefix from source value
//
function serialize(type, source, options) {
  var codec = type.codec
  if (!codec)
    return postEncode(new Buffer([ type.byte ]), options)

  var buffer = codec.encode(source, bytewise)

  if (options && options.nested && codec.escape)
    buffer = codec.escape(buffer)

  var hint = typeof codec.length === 'number' ? (codec.length + 1) : void 0 
  var buffers = [ new Buffer([ type.byte ]), buffer ]
  return postEncode(Buffer.concat(buffers, hint), options)
}

//
// core encode logic
//
bytewise.encode = function(source, options) {

  // check for invalid/incomparable values
  assert(!base.invalid(source), 'Invalid value')

  // encode bound types (ranges)
  var boundary = base.bound.getBoundary(source)
  if (boundary)
    return boundary.encode(source, bytewise)

  // encode standard value-typed sorts
  var order = base.order
  var sort
  for (var i = 0, length = order.length; i < length; ++i) {
    sort = sorts[order[i]]

    if (sort.is(source)) {

      // loop over any subsorts defined on sort
      // TODO: clean up
      var subsorts = sort.sorts ||  { '': sort }
      for (key in subsorts) {
        var subsort = subsorts[key]
        if (subsort.is(source)) 
          return serialize(subsort, source, options)
      }

      // source is an unsupported subsort
      assert(false, 'Unsupported sort value')
    }
  }

  // no type descriptor found
  assert(false, 'Unknown value')
}

//
// core decode logic
//
bytewise.decode = function (buffer, options) {
  // attempt to decode string input using configurable codec
  if (typeof buffer === 'string') {
    buffer = bytewise.stringCodec.encode(buffer)
  }

  assert(!buffer || !buffer.undecodable, 'Encoded value not decodable')

  var byte = buffer[0]
  var type = bytewise.getType(byte)
  assert(type, 'Invalid encoding: ' + buffer)

  // if type provides a decoder it is passed the base type system as second arg
  var codec = type.codec
  if (codec) {
    var decoded = codec.decode(buffer.slice(1), bytewise)

    if (options && options.nested && codec.unescape)
      decoded = codec.unescape(decoded)

    return postDecode(decoded, options)
  }

  // nullary types without a codec must provide a value for their decoded form
  assert('value' in type, 'Unsupported encoding: ' + buffer)
  return postDecode(type.value, options)
}

//
// process top level
//
function postEncode(encoded, options) {
  if (options === null)
    return encoded

  return bytewise.postEncode(encoded, options)
}

//
// invoked after encoding with encoded buffer instance
//
bytewise.postEncode = function (encoded, options) {

  // override buffer toString method to default to hex to help coercion issues
  // TODO: just return pure buffer, do this toString hackery in bytewise
  encoded.toString = function (encoding) {
    if (!encoding)
      return bytewise.stringCodec.decode(encoded)

    return Buffer.prototype.toString.apply(encoded, arguments)
  }

  return encoded
}

function postDecode(decoded, options) {
  if (options === null)
    return decoded

  return bytewise.postDecode(decoded, options)
}

//
// invoked after decoding with decoded value
//
bytewise.postDecode = function (decoded, options) {
  return decoded
}


//
// registry mapping byte prefixes to type descriptors
//
var PREFIX_REGISTRY

function registerType(type) {
  var byte = type && type.byte
  if (byte == null)
    return

  if (byte in PREFIX_REGISTRY)
    assert.deepEqual(type, PREFIX_REGISTRY[byte], 'Duplicate prefix: ' + byte)

  PREFIX_REGISTRY[type.byte] = type
}

function registerTypes(types) {
  for (var key in types) {
    registerType(types[key])
  }
}

//
// look up type descriptor associated with a given byte prefix
//
bytewise.getType = function (byte) {

  // construct and memoize byte prefix registry on first run
  if (!PREFIX_REGISTRY) {
    PREFIX_REGISTRY = {}

    // register sorts
    var sort
    for (var key in sorts) {
      sort = sorts[key]

      // if sort has subsorts register these instead
      sort.sorts ? registerTypes(sort.sorts) : registerType(sort)
    }
  }

  return PREFIX_REGISTRY[byte]
}

bytewise.buffer = true
bytewise.stringCodec = codecs.HEX
bytewise.type = 'bytewise-core'


}).call(this,require("buffer").Buffer)
},{"./base":3,"./codecs":4,"./util":6,"buffer":27}],6:[function(require,module,exports){
(function (Buffer){
var util = exports

//
// buffer compare
//
util.compare = require('typewise-core/collation').bitwise

//
// buffer equality
//
util.equal = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    return

  if (a === b)
    return true

  if (typeof a.equals === 'function')
    return a.equals(b)

  return util.compare(a, b) === 0
}

var assert = util.assert = function (test, message) {
  if (!test)
    throw new TypeError(message)
}

var FLOAT_LENGTH = 8

util.invertBytes = function (buffer) {
  var bytes = []
  for (var i = 0, end = buffer.length; i < end; ++i) {
    bytes.push(~buffer[i])
  }

  return new Buffer(bytes)
}

util.encodeFloat = function (value) {
  var buffer = new Buffer(FLOAT_LENGTH)
  if (value < 0) {
    //
    // write negative numbers as negated positive values to invert bytes
    //
    buffer.writeDoubleBE(-value.valueOf(), 0)
    return util.invertBytes(buffer)
  }

  //
  // normalize -0 values to 0
  //
  buffer.writeDoubleBE(value.valueOf() || 0, 0)
  return buffer
}

util.decodeFloat = function (buffer, base, negative) {
  assert(buffer.length === FLOAT_LENGTH, 'Invalid float encoding length')

  if (negative)
    buffer = util.invertBytes(buffer)

  var value = buffer.readDoubleBE(0)
  return negative ? -value : value
}

//
// sigil for controlling the escapement functions (TODO: clean this up)
//
var SKIP_HIGH_BYTES = {}

util.escapeFlat = function (buffer, options) {
  //
  // escape high and low bytes 0x00 and 0xff (and by necessity, 0x01 and 0xfe)
  //
  var b, bytes = []
  for (var i = 0, end = buffer.length; i < end; ++i) {
    b = buffer[i]

    //
    // escape low bytes with 0x01 and by adding 1
    //
    if (b === 0x01 || b === 0x00)
      bytes.push(0x01, b + 1)

    //
    // escape high bytes with 0xfe and by subtracting 1
    //
    else if (options !== SKIP_HIGH_BYTES && (b === 0xfe || b === 0xff))
      bytes.push(0xfe, b - 1)

    //
    // no escapement needed
    //
    else
      bytes.push(b)
  }

  return new Buffer(bytes)
}

util.unescapeFlat = function (buffer, options) {
  var b, bytes = []
  //
  // don't escape last byte
  //
  for (var i = 0, end = buffer.length; i < end; ++i) {
    b = buffer[i]

    //
    // if low-byte escape tag use the following byte minus 1
    //
    if (b === 0x01)
      bytes.push(buffer[++i] - 1)

    //
    // if high-byte escape tag use the following byte plus 1
    //
    else if (options !== SKIP_HIGH_BYTES && b === 0xfe)
      bytes.push(buffer[++i] + 1)

    //
    // no unescapement needed
    //
    else
      bytes.push(b)
  }
  return new Buffer(bytes)
}

util.escapeFlatLow = function (buffer) {
  return util.escapeFlat(buffer, SKIP_HIGH_BYTES)
}

util.unescapeFlatLow = function (buffer) {
  return util.unescapeFlat(buffer, SKIP_HIGH_BYTES)
}

util.encodeList = function (source, base) {
  // TODO: cycle detection
  var buffers = []
  var undecodable

  for (var i = 0, end = source.length; i < end; ++i) {
    var buffer = base.encode(source[i], null)

    //
    // bypass assertions for undecodable types (i.e. range bounds)
    //
    undecodable || (undecodable = buffer.undecodable)
    if (undecodable) {
      buffers.push(buffer)
      continue
    }

    var sort = base.getType(buffer[0])
    assert(sort, 'List encoding failure: ' + buffer)

    //
    // escape sorts if it requires it and add closing byte for element
    //
    if (sort.codec && sort.codec.escape)
      buffers.push(sort.codec.escape(buffer), new Buffer([ 0x00 ]))

    else
      buffers.push(buffer)
  }

  //
  // close the list with an end byte
  //
  buffers.push(new Buffer([ 0x00 ]))
  buffer = Buffer.concat(buffers)

  //
  // propagate undecoable bit if set
  //
  undecodable && (buffer.undecodable = undecodable)
  return buffer
}

util.decodeList = function (buffer, base) {
  var result = util.parse(buffer, base)

  assert(result[1] === buffer.length, 'Invalid encoding')
  return result[0]
}

util.encodeHash = function (source, base) {
  //
  // packs hash into an array, e.g. `[ k1, v1, k2, v2, ... ]`
  //
  var list = []
  Object.keys(source).forEach(function(key) {
    list.push(key)
    list.push(source[key])
  })
  return util.encodeList(list, base)
}

util.decodeHash = function (buffer, base) {
  var list = util.decodeList(buffer, base)
  var hash = Object.create(null)

  for (var i = 0, end = list.length; i < end; ++i) {
    hash[list[i]] = list[++i]
  }

  return hash
}

//
// base parser for nested/recursive sorts
//
util.parse = function (buffer, base, sort) {
  //
  // parses and returns the first sort on the buffer and total bytes consumed
  //
  var codec = sort && sort.codec
  var index, end

  //
  // nullary
  //
  if (sort && !codec)
    return [ base.decode(new Buffer([ sort.byte ]), null), 0 ]

  //
  // custom parse implementation provided by sort
  //
  if (codec && codec.parse)
    return codec.parse(buffer, base, sort)

  //
  // fixed length sort, decode fixed bytes
  //
  var length = codec && codec.length
  if (typeof length === 'number')
    return [ codec.decode(buffer.slice(0, length)), length ]

  //
  // escaped sort, seek to end byte and unescape
  //
  if (codec && codec.unescape) {
    for (index = 0, end = buffer.length; index < end; ++index) {
      if (buffer[index] === 0x00)
        break
    }

    assert(index < buffer.length, 'No closing byte found for sequence')
    var unescaped = codec.unescape(buffer.slice(0, index))

    //
    // add 1 to index to account for closing tag byte
    //
    return [ codec.decode(unescaped), index + 1 ]
  }

  //
  // recursive sort, resolve each item iteratively
  //
  index = 0
  var list = []
  var next
  while ((next = buffer[index]) !== 0x00) {
    sort = base.getType(next)
    var result = util.parse(buffer.slice(index + 1), base, sort)
    list.push(result[0])

    //
    // offset current index by bytes consumed (plus a byte for the sort tag)
    //
    index += result[1] + 1
    assert(index < buffer.length, 'No closing byte found for nested sequence')
  }

  //
  // return parsed list and bytes consumed (plus a byte for the closing tag)
  //
  return [ list, index + 1 ]
}

//
// helpers for encoding boundary types
//
function encodeBound(data, base) {
  var prefix = data.prefix
  var buffer = prefix ? base.encode(prefix, null) : new Buffer([ data.byte ])

  if (data.upper)
    buffer = Buffer.concat([ buffer, new Buffer([ 0xff ]) ])

  return util.encodedBound(data, buffer)
}

util.encodeBound = function (data, base) {
  return util.encodedBound(data, encodeBound(data, base))
}

util.encodeBaseBound = function (data, base) {
  return util.encodedBound(data, new Buffer([ data.upper ? 0xff : 0x00 ]))
}

util.encodeListBound = function (data, base) {
  var buffer = encodeBound(data, base)

  if (data.prefix) {
    //
    // trim off end byte if a prefix, and do some hackery if an upper bound
    //
    var endByte = buffer[buffer.length - 1]
    buffer = buffer.slice(0, -1)
    if (data.upper)
      buffer[buffer.length - 1] = endByte
  }

  return util.encodedBound(data, buffer)
}

//
// add some metadata to generated buffer instance
//
util.encodedBound = function (data, buffer) {
  buffer.undecodable = true
  return buffer
}

}).call(this,require("buffer").Buffer)
},{"buffer":27,"typewise-core/collation":21}],7:[function(require,module,exports){
// require typewise first to extend with core typewise functionality
require('typewise')

// TODO: bytewise-binary encoding -- no hex parsing or toString hackery
module.exports = require('bytewise-core')

},{"bytewise-core":5,"typewise":24}],8:[function(require,module,exports){
// TODO: standard bytewise encoding constructor
// TODO: enhance binary encoding with optional hex helpers
module.exports = require('./binary')
},{"./binary":7}],9:[function(require,module,exports){
// TODO: initialize and export a standard bytewise encoding, add hex and binary
module.exports = require('./encoding/')

},{"./encoding/":8}],10:[function(require,module,exports){
'use strict';

var isObject = require('is-extendable');

module.exports = function extend(o/*, objects*/) {
  if (!isObject(o)) { o = {}; }

  var len = arguments.length;
  for (var i = 1; i < len; i++) {
    var obj = arguments[i];

    if (isObject(obj)) {
      assign(o, obj);
    }
  }
  return o;
};

function assign(a, b) {
  for (var key in b) {
    if (hasOwn(b, key)) {
      a[key] = b[key];
    }
  }
}

/**
 * Returns true if the given `key` is an own property of `obj`.
 */

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

},{"is-extendable":13}],11:[function(require,module,exports){
/*!
 * get-value <https://github.com/jonschlinkert/get-value>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

module.exports = function(obj, prop, a, b, c) {
  if (!isObject(obj) || !prop) {
    return obj;
  }

  prop = toString(prop);

  // allowing for multiple properties to be passed as
  // a string or array, but much faster (3-4x) than doing
  // `[].slice.call(arguments)`
  if (a) prop += '.' + toString(a);
  if (b) prop += '.' + toString(b);
  if (c) prop += '.' + toString(c);

  if (prop in obj) {
    return obj[prop];
  }

  var segs = prop.split('.');
  var len = segs.length;
  var i = -1;

  while (obj && (++i < len)) {
    var key = segs[i];
    while (key[key.length - 1] === '\\') {
      key = key.slice(0, -1) + '.' + segs[++i];
    }
    obj = obj[key];
  }
  return obj;
};

function isObject(val) {
  return val !== null && (typeof val === 'object' || typeof val === 'function');
}

function toString(val) {
  if (!val) return '';
  if (Array.isArray(val)) {
    return val.join('.');
  }
  return val;
}

},{}],12:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;

var isStandardArguments = function isArguments(value) {
	return toStr.call(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		toStr.call(value) !== '[object Array]' &&
		toStr.call(value.callee) === '[object Function]';
};

var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

},{}],13:[function(require,module,exports){
/*!
 * is-extendable <https://github.com/jonschlinkert/is-extendable>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function isExtendable(val) {
  return typeof val !== 'undefined' && val !== null
    && (typeof val === 'object' || typeof val === 'function');
};

},{}],14:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],15:[function(require,module,exports){
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isArray = require('isarray');

module.exports = function isObject(val) {
  return val != null && typeof val === 'object' && isArray(val) === false;
};

},{"isarray":14}],16:[function(require,module,exports){
/*!
 * set-value <https://github.com/jonschlinkert/set-value>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var toPath = require('to-object-path');
var extend = require('extend-shallow');
var isObject = require('isobject');

module.exports = function(obj, path, val) {
  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(path)) {
    path = toPath(path);
  }

  if (typeof path !== 'string') {
    return obj;
  }

  var segs = path.split('.');
  var len = segs.length, i = -1;
  var res = obj;
  var last;

  while (++i < len) {
    var key = segs[i];

    while (key[key.length - 1] === '\\') {
      key = key.slice(0, -1) + '.' + segs[++i];
    }

    if (i === len - 1) {
      last = key;
      break;
    }

    if (typeof obj[key] !== 'object') {
      obj[key] = {};
    }
    obj = obj[key];
  }

  if (obj.hasOwnProperty(last) && typeof obj[last] === 'object') {
    if (isObject(val)) {
      extend(obj[last], val);
    } else {
      obj[last] = val;
    }

  } else {
    obj[last] = val;
  }
  return res;
};

},{"extend-shallow":10,"isobject":15,"to-object-path":19}],17:[function(require,module,exports){
/*!
 * sort-asc <https://github.com/helpers/sort-asc>
 *
 * Copyright (c) 2014-2015 Jon Schlinkert.
 * Licensed under the MIT License
 */

'use strict';

module.exports = function (a, b) {
  return a === b ? 0 : a.localeCompare(b);
};
},{}],18:[function(require,module,exports){
/*!
 * sort-desc <https://github.com/helpers/sort-desc>
 *
 * Copyright (c) 2014-2015 Jon Schlinkert.
 * Licensed under the MIT License
 */

'use strict';

module.exports = function (a, b) {
  return a === b ? 0 : b.localeCompare(a);
};
},{}],19:[function(require,module,exports){
/*!
 * to-object-path <https://github.com/jonschlinkert/to-object-path>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isArguments = require('is-arguments');
var flatten = require('arr-flatten');

module.exports = function toPath(args) {
  if (isArguments(args)) {
    args = [].slice.call(args);
  } else {
    args = [].slice.call(arguments);
  }
  return flatten(args).join('.');
};

},{"arr-flatten":1,"is-arguments":12}],20:[function(require,module,exports){
(function (Buffer){
var collation = require('./collation')

//
// base type system
//
var base = {}

//
// helper utilities
//

function _valueOf(instance) {
  return instance == null ? instance : instance.valueOf()
}

var _toString = Object.prototype.toString

function _isObject(instance) {
  return instance && _toString.call(instance) === '[object Object]'
}

//
// base typewise compare implementation
//
base.compare = function (a, b) {
  //
  // test for invalid values
  //
  if (base.invalid(a, b))
    return NaN

  //
  // short circuit for identical objects
  //
  if (a === b)
    return 0

  //
  // short circuit for base bound types
  //
  var result = base.bound.compare(a, b)
  if (result !== undefined)
    return result

  //
  // cache typeof and valueOf for both values
  //
  var aTypeOf = typeof a
  var bTypeOf = typeof b
  var aValueOf = _valueOf(a)
  var bValueOf = _valueOf(b)

  //
  // loop over type tags and attempt compare
  //
  var order = base.order
  var sorts = base.sorts
  var sort
  for (var i = 0, length = order.length; i < length; ++i) {
    sort = sorts[order[i]]

    //
    // if first arg is a member of this sort we have an answer
    //
    if (sort.is(a, aTypeOf))
      //
      // if b is the same as a then defer to sort's comparator, else a comes first
      //
      return sort.is(b, bTypeOf) ? sort.compare(aValueOf, bValueOf) : -1

    //
    // if b is this type but not a then b comes first
    //
    if (sort.is(b, bTypeOf))
      return 1
  }

  //
  // values are incomparable as they didn't match against any registered types
  //
  return NaN
}

//
// sort equality test
//
base.equal = function(a, b) {
  return base.compare(a, b) === 0
}

//
// test for top-level incomparability using invalid sort definitions
//
base.invalid = function (a, b) {
  var types = base.invalid
  for (var key in types) {
    var type = types[key]
    if (type && type.is && (type.is(a) || type.is(b)))
      return true
  }
  return false
}

//
// definitions for explicitly invalid/incomparable types
//

base.invalid.NAN = {
  is: function (instance) {
    var valueOf = _valueOf(instance)
    return valueOf !== valueOf
  }
}

base.invalid.ERROR = {
  is: function (instance) {
    return instance && instance instanceof Error
  }
}

//
// definitions for boundary types, unserializable as values
//

function BoundedKey(bound, upper, prefix) {
  this.bound = bound
  this.upper = !!upper
  this.prefix = prefix
}

function Boundary(sort) {
  this.sort = sort
}

Boundary.prototype.lower = function (prefix) {
  return new BoundedKey(this, false, prefix)
}

Boundary.prototype.upper = function (prefix) {
  return new BoundedKey(this, true, prefix)
}

Boundary.prototype.is = function (source) {
  return source instanceof BoundedKey && source.sort === this.sort
}

Boundary.add = function (sort) {
  sort.bound = new Boundary(sort)
}

Boundary.add(base)

base.bound.getBoundary = function (source) {
  return source instanceof BoundedKey && source.bound
}

//
// compare a values against top level bounds (assumes first arg is an instance)
//
base.bound.compare = function (a, b) {
  var aBound = base.bound.is(a)
  var bBound = base.bound.is(b)
  if (aBound) {
    if (bBound && !a.upper === !b.upper)
      return 0
    return a.upper ? 1 : -1
  }

  if (bBound)
    return -base.bound.compare(b, a)
}

//
// helper to register fixed (nullary) types
//
function fixed(value) {
  return {
    is: function (instance) {
      return instance === value
    },
    value: value
  }
}

//
// value types defined as ordered map of "sorts"
//
var sorts = base.sorts = {}

sorts.void = fixed(void 0)
sorts.void.compare = collation.inequality

sorts.null = fixed(null)
sorts.null.compare = collation.inequality

var BOOLEAN = sorts.boolean = {}
BOOLEAN.compare = collation.inequality
BOOLEAN.is = function (instance, typeOf) {
  return (typeOf || typeof instance) === 'boolean'
}

BOOLEAN.sorts = {}
BOOLEAN.sorts.true = fixed(true)
BOOLEAN.sorts.false = fixed(false)

Boundary.add(BOOLEAN)


var NUMBER = sorts.number = {}
NUMBER.compare = collation.difference
NUMBER.is = function (instance, typeOf) {
  return (typeOf || typeof instance) === 'number'
}

NUMBER.sorts = {}
NUMBER.sorts.max = fixed(Number.POSITIVE_INFINITY)
NUMBER.sorts.min = fixed(Number.NEGATIVE_INFINITY)

NUMBER.sorts.positive = {}
NUMBER.sorts.positive.is = function (instance) {
  return instance >= 0
}

NUMBER.sorts.negative = {}
NUMBER.sorts.negative.is = function (instance) {
  return instance < 0
}

Boundary.add(NUMBER)


var DATE = sorts.date = {}
DATE.compare = collation.difference
DATE.is = function (instance) {
  return instance instanceof Date && instance.valueOf() === instance.valueOf()
}

DATE.sorts = {}
DATE.sorts.positive = {}
DATE.sorts.positive.is = function (instance) {
  return instance.valueOf() >= 0
}

DATE.sorts.negative = {}
DATE.sorts.negative.is = function (instance) {
  return instance.valueOf() < 0
}

Boundary.add(DATE)


var BINARY = sorts.binary = {}
BINARY.empty = new Buffer([])
BINARY.compare = collation.bitwise
BINARY.is = Buffer.isBuffer

Boundary.add(BINARY)


var STRING = sorts.string = {}
STRING.empty = ''
STRING.compare = collation.inequality
STRING.is = function (instance, typeOf) {
  return (typeOf || typeof instance) === 'string'
}

Boundary.add(STRING)


var ARRAY = sorts.array = {}
ARRAY.empty = []
ARRAY.compare = collation.recursive.elementwise(base.compare)
ARRAY.is = Array.isArray

Boundary.add(ARRAY)


// var OBJECT = sorts.object = {}
// OBJECT.empty = {}
// OBJECT.compare = collation.recursive.fieldwise(base.compare)
// OBJECT.is = _isObject

// Boundary.add(OBJECT)

//
// default order for instance checking in compare operations
//
base.order = []
for (var key in sorts) {
  base.order.push(key)
}

module.exports = base

}).call(this,require("buffer").Buffer)
},{"./collation":21,"buffer":27}],21:[function(require,module,exports){
//
// generic comparator implementations our types can use
//
var collation = exports

//
// scalar comparisons
//
collation.inequality = function (a, b) {
  return a < b ? -1 : ( a > b ? 1 : 0 )
}

collation.difference = function (a, b) {
  return a - b
}

//
// recursive collations have to be provided a collation function to delegate to
//
collation.recursive = {}

//
// element by element (comparison for list-like structures
//
collation.recursive.elementwise = function (compare, shortlex) {
  return function (a, b) {
    var aLength = a.length
    var bLength = b.length
    var difference

    //
    // short-circuit on length difference for shortlex semantics
    //
    if (shortlex && aLength !== bLength)
        return aLength - bLength

    for (var i = 0, length = Math.min(aLength, bLength); i < length; ++i) {
      if (difference = compare(a[i], b[i]))
        return difference
    }

    return aLength - bLength
  }
}

//
// field by field comparison of record-like structures
//
collation.recursive.fieldwise = function (compare, shortlex) {
  return function (a, b) {
    var aKeys = Object.keys(a)
    var bKeys = Object.keys(b)
    var aLength = aKeys.length
    var bLength = bKeys.length
    var difference

    //
    // short-circuit on length difference for shortlex semantics
    //
    if (shortlex && aLength !== bLength)
        return aLength - bLength

    for (var i = 0, length = Math.min(aLength, bLength); i < length; ++i) {
      //
      // first compare keys
      //
      if (difference = compare(aKeys[i], bKeys[i]))
        return difference

      //
      // then compare values
      //
      if (difference = compare(a[aKeys[i]], b[bKeys[i]]))
        return difference
    }

    return aLength - bLength
  }
}

//
// elementwise compare with inequality can be used for binary equality
//
collation.bitwise = collation.recursive.elementwise(exports.inequality)


},{}],22:[function(require,module,exports){
//
// extend core typewise
//
require('./collation')

module.exports = require('typewise-core/base')

},{"./collation":23,"typewise-core/base":20}],23:[function(require,module,exports){
//
// extend core typewise collations
//
var collation = require('typewise-core/collation')

// TODO: set, map

module.exports = collation

},{"typewise-core/collation":21}],24:[function(require,module,exports){
module.exports = require('./base')

},{"./base":22}],25:[function(require,module,exports){
'use strict';

var isObject = require('is-extendable');
var union = require('arr-union');
var get = require('get-value');
var set = require('set-value');

module.exports = function unionValue(obj, prop, value) {
  if (!isObject(obj)) {
    throw new TypeError('union-value expects the first argument to be an object.');
  }

  if (typeof prop !== 'string') {
    throw new TypeError('union-value expects `prop` to be a string.');
  }

  var arr = arrayify(get(obj, prop));
  set(obj, prop, union(arr, arrayify(value)));
  return obj;
};

function arrayify(val) {
  if (val === null || typeof val === 'undefined') {
    return [];
  }
  if (Array.isArray(val)) {
    return val;
  }
  return [val];
}

},{"arr-union":2,"get-value":11,"is-extendable":13,"set-value":16}],26:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],27:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (value instanceof ArrayBuffer) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (obj instanceof Buffer) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (ArrayBuffer.isView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b instanceof Buffer
}

Buffer.compare = function compare (a, b) {
  if (!(a instanceof Buffer) || !(b instanceof Buffer)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!(buf instanceof Buffer)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (string instanceof Buffer) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || string instanceof ArrayBuffer) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by the `is-buffer` npm package to detect Buffer instances
// in Safari 5-7. Remove this eventually.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!(b instanceof Buffer)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!(target instanceof Buffer)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (val instanceof Buffer) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!(buf instanceof Buffer)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = val instanceof Buffer
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

},{"base64-js":26,"ieee754":28}],28:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],"array-counter":[function(require,module,exports){
'use strict';

function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
}

module.exports = function (arr) {
  if(!isArray(arr)) {
    throw new TypeError('Expected an array.');
  }

  var obj = {};

  for (var i = 0; i < arr.length; i++) {
    if(arr[i] in obj) {
      obj[arr[i]]++;
    }else {
      obj[arr[i]] = 1;
    }
  }

  return obj;
};

},{}],"escape-html":[function(require,module,exports){
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */

'use strict';

/**
 * Module variables.
 * @private
 */

var matchHtmlRegExp = /["'&<>]/;

/**
 * Module exports.
 * @public
 */

module.exports = escapeHtml;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

function escapeHtml(string) {
  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index
    ? html + str.substring(lastIndex, index)
    : html;
}

},{}],"sort-object":[function(require,module,exports){
/*!
 * sort-object <https://github.com/helpers/sort-object>
 *
 * Copyright (c) 2014-2015, Brian Woodward.
 * Licensed under the MIT License
 */

'use strict';

var isObject = require('is-extendable');
var sortDesc = require('sort-desc');
var bytewise = require('bytewise');
var union = require('union-value');
var sortAsc = require('sort-asc');
var get = require('get-value');

var sortFns = {desc: sortDesc, asc: sortAsc};

/**
 * Expose `sort`
 */

module.exports = sort;

function sort(obj, options) {
  if (Array.isArray(options)) {
    options = { keys: options };
  }

  var opts = options || {};
  var prop = opts.prop;
  var getFn = opts.get || function(val) {
    if (prop) return get(val, prop);
  };
  var fn = opts.sort || sortAsc;

  if (Boolean(opts.sortOrder)) {
    fn = sortFns[opts.sortOrder.toLowerCase()];
  }

  var keys = opts.keys || [];

  if (Boolean(opts.sortBy)) {
    keys = opts.sortBy(obj);
    fn = null;
  }

  if (Boolean(opts.keys)) {
    if (!opts.sort && !opts.sortOrder && !opts.sortBy) {
      fn = null;
    }
  }

  var tmp = {};
  var sortBy = {};

  var build = keys.length === 0 ? fromObj : fromKeys;
  build(obj, keys, tmp, sortBy, function(val) {
    return getFn(val, prop);
  });

  if (fn) {
    keys.sort(fn);
  }

  var len = keys.length, i = 0, j = 0;
  var res = {}, prev;
  while (len--) {
    var key = keys[i++];
    if (prev !== key) j = 0;
    var k = get(sortBy, key)[j++];
    res[k] = tmp[k];
    prev = key;
  }
  return res;
}

// build up the sorting information from the `obj`
function fromObj(obj, keys, tmp, sortBy, fn) {
  for (var key in obj) {
    var val = obj[key];
    var item = isObject(val) ? (fn(val) || key) : key;
    item = isObject(item) ? bytewise.encode(JSON.stringify(item)).toString() : item;
    union(sortBy, item, [key]);
    keys.push(item);
    tmp[key] = val;
  }
}

// build up the sorting information from the supplied keys
function fromKeys(obj, keys, tmp, sortBy) {
  var len = keys.length, i = 0;
  while (len--) {
    var key = keys[i++];
    var val = obj[key];
    union(sortBy, key, [key]);
    tmp[key] = val;
  }
}

},{"bytewise":9,"get-value":11,"is-extendable":13,"sort-asc":17,"sort-desc":18,"union-value":25}]},{},[]);
