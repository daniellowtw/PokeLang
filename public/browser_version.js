!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.poke=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

},{}],2:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(_dereq_,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,_dereq_("veCdhC"))
},{"veCdhC":4}],4:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],5:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],6:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_("veCdhC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":5,"inherits":2,"veCdhC":4}],7:[function(_dereq_,module,exports){
var P = _dereq_('./lib/parser/pokelang.js'),
    W = _dereq_('./lib/walker/walker.js'),
    T = _dereq_('./lib/interpreter/tokeniser.js'),
    I = _dereq_('./lib/interpreter/interpreter.js'),
    E = _dereq_('./lib/errors/errors.js'),
    H = _dereq_('./lib/errors/handler.js');

module.exports.testdata = ["Go! SQUIRTLE!","Foe GARY sends out PIDGEOT!","Foe GARY calls back PIDGEOT!","Foe GARY sends out PIDGEOT!","SQUIRTLE uses TACKLE!"].join('\n');
module.exports.P = P;
module.exports.W = W;
module.exports.T = T;
module.exports.I = I;
module.exports.E = E;
module.exports.H = H;
module.exports.compile = function(data){
	poke.I.run(poke.T.tokenise(poke.W.walk(poke.P.parse(data), true)));
}
},{"./lib/errors/errors.js":8,"./lib/errors/handler.js":9,"./lib/interpreter/interpreter.js":10,"./lib/interpreter/tokeniser.js":11,"./lib/parser/pokelang.js":12,"./lib/walker/walker.js":15}],8:[function(_dereq_,module,exports){
var errors = {};

module.exports = errors;

var createError = function(type) {

  errors[type + 'Error'] = function(name, message) {

    this.name = name;
 
    this.message = message || '';

  }

  errors[type + 'Error'].prototype = new Error();

  errors[type + 'Error'].prototype.constructor = errors[type + 'Error'];

}

var initErrors = function() {

  errors.errorTypes = ['Battle'
                      ,'Semantic'
                      ,'Syntax',
                      ,'Interpreter'
                      ];

  for (var i = 0; i < errors.errorTypes.length; i++) {

    createError(errors.errorTypes[i]);

  }

}

initErrors();

errors.wrongPokemon = function(expected, actual) {

  return new errors.BattleError('Wrong Pokemon', 'Expected: ' + expected + ' Actual: ' + actual);

}

errors.wrongTurnOrder = function(turn) {

  return new errors.BattleError('Wrong turn order', turn + ' has moved twice before the opponent');

}

errors.unexpectedToken = function(expected, actual) {
 
  return new errors.SyntaxError('Unexpected token', 'Expected: ' + expected + ' Actual: ' + actual);

}

errors.pokemonDoesNotKnowMove = function(pokemon, move) {

    return new errors.BattleError('Pokemon does not know move', 'Pokemon: ' + pokemon + ' Move: ' + move);

}

errors.unrecognisedPokemon = function(pokemon) {

  return new errors.SyntaxError('Unrecognised Pokemon', pokemon + " is not a recognised Pokemon");

}

errors.wrongTypeModifier = function(move, effect, pokemon) {

  var should = effect === 'NO EFFECT' ? 'have ' : 'be ';

  return new errors.BattleError('Wrong type modifier', move + ' should ' + should + effect + ' on ' + pokemon); 

}

errors.invalidMove = function(move) {

  return new errors.SyntaxError('Invalid move', move + ' does not have a valid instruction');

}

errors.blockNotClosed = function() {

  return new errors.InterpreterError('Block not closed');

}

errors.markNotFound = function() {

  return new errors.InterpreterError('Mark not found');

}

errors.arrayOutOfBounds = function(size, key) {

  return new errors.InterpreterError('Array out of bounds', 'Size: ' + size, ' Key: ' + key);

}

errors.symbolNotFound = function(symbol) {

  return new errors.InterpreterError('Symbol not found', symbol + ' is not recognised');

}

errors.wrongEnemyTrainer = function(expected, actual) {

  return new errors.SyntaxError('Wrong enemy trainer', 'Expected: ' + expected + ' Actual: ' + actual);

}

errors.missingKey = function(key) {
 
  return new errors.InterpreterError('Missing key', 'Key: ' + num + ' does not exist in dictionary');

}

errors.stackSizeTooSmall = function(expected, actual) {
 
  return new errors.InterpreterError('Stack size too small', 'Expected: ' + expected + ', Actual: ' + actual);

}

errors.wrongArgument = function(i, expected, actual) {
 
  return new errors.InterpreterError('Wrong argument', 'Argument: ' + i + ' Expected: ' + expected + ', Actual: ' + actual);

}

},{}],9:[function(_dereq_,module,exports){
(function (process){
var errors = _dereq_('./errors.js');

var handler = {};

module.exports = handler;

handler.handle = function(err) {

  for (var i = 0; i < errors.errorTypes.length; i++) {

    if (err instanceof errors[errors.errorTypes[i] + 'Error']) {

      console.error(errors.errorTypes[i] + 'Error:', err.name, err.message ? '- ' + err.message : '');

      process.exit(1);

    }

  }

  throw (err);

}


}).call(this,_dereq_("veCdhC"))
},{"./errors.js":8,"veCdhC":4}],10:[function(_dereq_,module,exports){
var errors = _dereq_('../errors/errors.js'),
    util = _dereq_('util');

var interpreter = {};

// require
module.exports = interpreter;

// state
var instruction_list = [],
    stack = [],
    dictionary = {},
    operations = {},
    init_flag = false,
    out,
    num,
    array,
    mark,
    block;

// initialises the instruction_list
// and calls exec
var run = function(instructions) {

  clear();

  instruction_list = instructions;

  execList(instruction_list);

  // return the stack
  return stack;

}

interpreter.run = run;

var init = function(out) {

  if (init_flag) {

    return;

  }

  initOperations();

  initInstrConstructors();

  setOutputFunction(out);

  init_flag = true;

}

interpreter.init = init;

var clear = function() {

  stack = [];

}

var execList = function(list) {

  for (var i = 0; i < list.length; i++) {

    exec(list[i]);

  }

}

// shifts the instructions array
// performs the instruction
var exec = function(instr) {

  perform(instr);

}

// performs the instr
var perform = function(instr) {

  if (instr instanceof Obj) {

    return performObj(instr);

  }

  // else
  return performOp(instr);

}

// puts the object on the stack
var performObj = function(obj) {

  stack.push(obj); 

}

var performOp = function(op) {

  operations[op.value].apply(null);

}

var initOperations = function() {

  // Exec

  createOperation('exec', ['BLOCK'], function(block) {

    execList(block.value);

  });

  // Arithmetic 

  createOperation('+', ['NUM', 'NUM'], function(num1, num2) {

    exec(num(num1.value + num2.value));

  });

  createOperation('-', ['NUM', 'NUM'], function(num1, num2) {

    exec(num(num1.value - num2.value));

  });

  createOperation('*', ['NUM', 'NUM'], function(num1, num2) {

    exec(num(num1.value * num2.value));

  });

  createOperation('/', ['NUM', 'NUM'], function(num1, num2) {

    exec(num(Math.floor(num1.value * num2.value)));

  });

  createOperation('neg', ['NUM'], function(num1) {

    exec(num(-num1.value));

  });

  createOperation('abs', ['NUM'], function(num1) {

    exec(num(Math.abs(num1.value)));

  });

  // Comparison

  createOperation('>', ['NUM', 'NUM'], function(num1, num2) {

    exec(num(Number(num1.value > num2.value)));

  });

  createOperation('>=', ['NUM', 'NUM'], function(num1, num2) {

    exec(num(Number(num1.value >= num2.value)));

  });

  createOperation('==', ['NUM', 'NUM'], function(num1, num2) {

    exec(num(Number(num1.value == num2.value)));

  });

  createOperation('<=', ['NUM', 'NUM'], function(num1, num2) {

    exec(num(Number(num1.value <= num2.value)));

  });

  createOperation('<', ['NUM', 'NUM'], function(num1, num2) {

    exec(num(Number(num1.value < num2.value)));

  });

  // Stack manipulation

  createOperation('pop', ['*'], function(arg) {

    // do nothing

  });

  createOperation('dup', ['*'], function(arg) {

    exec(arg);
    exec(arg);

  });

  createOperation('swap', ['*', '*'], function(arg1, arg2) {

    exec(arg2);
    exec(arg1);

  });

  createOperation('rot3', ['*', '*', '*'], function(arg1, arg2, arg3) {

    exec(arg3);
    exec(arg1);
    exec(arg2);

  });

  createOperation('rot4', ['*', '*', '*'], function(arg1, arg2, arg3, arg4) {

    exec(arg4);
    exec(arg1);
    exec(arg2);
    exec(arg3);

  });

  createOperation('rot5', ['*', '*', '*'], function(arg1, arg2, arg3, arg4, arg5) {

    exec(arg5);
    exec(arg1);
    exec(arg2);
    exec(arg3);
    exec(arg4);

  });

  // Control Flow

  createOperation('ifelse', ['NUM', 'BLOCK', 'BLOCK'], function(num1, block1, block2) {

    if (test(num1.value)) {

      execList(block1.value);

    } else {

      execList(block2.value);

    }

  });

  createOperation('while', ['BLOCK', 'BLOCK'], function(block1, block2) {

    execList(block1.value);

    exec(block1);

    exec(block2);

    exec(operation('_while')); 

  });

  createOperation('_while', ['NUM', 'BLOCK', 'BLOCK'], function(num1, block1, block2) {

    if (test(num1.value)) {

      execList(block2.value);

      exec(block1);

      exec(block2);

      exec(operation('while'));

    }

  });

  // Arrays

  createOperation(']', ['*'], function(arg) {

    if (arg instanceof interpreter.MarkObj) {

      exec(array([]));

    } else {

      exec(operation(']'));

      exec(arg);

      exec(operation('append'));

    }

  });

  createOperation('put', ['ARRAY', '*', 'NUM'], function(arr, arg, num1) {

    if (num < 0 || num1 >= arr.value.size) {

      throw errors.arrayOutOfBounds(arr.value.size, num1);

    }

    arr.value[num1] = arg;

    exec(arr);

  });

  createOperation('get', ['ARRAY', 'NUM'], function(arr, num1) {

    if (num < 0 || num1 >= arr.value.size) {

      throw errors.arrayOutOfBounds(arr.value.size, num1);

    }

    exec(arr.value[num1]);

  });

  createOperation('append', ['ARRAY', '*'], function(arr, arg) {

    arr.value.push(arg);

    exec(arr);

  });

  createOperation('arrpop', ['ARRAY'], function(arr) {

    exec(arr.value.pop());

  });

  createOperation('map', ['ARRAY', 'BLOCK'], function(arr, block) {

    exec(mark('['));

    for (var i = 0; i < arr.value.length; i++) {

      exec(arr.value[i]);

      execList(block.value);

    }

    exec(operation(']'));

  });

  createOperation('fold', ['ARRAY', 'BLOCK'], function(arr, block) {

    for (var i = 0; i < arr.value.length; i++) {

      exec(arr.value[i]);

      execList(block.value);

    }

  });

  // IO

  createOperation('out', ['NUM'], function(num1) {

    interpreter.out(String.fromCharCode(num1.value));

  });

  // Dictionary

  createOperation('store', ['NUM', '*'], function(num1, arg) {

    dictionary[num1] = arg;

  });

  createOperation('load', ['NUM'], function(num1, arg) {

    if (dictionary[num1]) {

      exec(dictionary[num1]);

    } else {

      throw errors.missingKey(num1); 
   
    }

  });
}

interpreter.operations = operations;

var test = function(arg) {

  return !!arg;

}

var createOperation = function(value, def_args, callback) {

  operations[value] = function() {

    // check args

    checkStackSize(def_args.length);

    var args = getArgs(def_args, args);

    callback.apply(null, args);

  }

}

var checkStackSize = function(def_size) {

  if (stack.length < def_size) {

    throw errors.stackSizeTooSmall(def_size, stack.length);

  }

}

var getArgs = function(def_args) {

  var args = stack.splice(stack.length - def_args.length, def_args.length);

  for (var i = 0; i < def_args.length; i++) {

    if (!checkArg(def_args[i], args[i])) {

      throw errors.wrongArgument(i, def_args[i], args[i].subtype); 
    
    }

  }  
  
  return args;

}

// checks if args match
// subtypes are compared
var checkArg = function(expected, actual) {

  if (actual) {

    var compareClass = {

      '*': interpreter.Obj,
      'NUM': interpreter.NumObj,
      'MARK': interpreter.MarkObj,
      'ARRAY': interpreter.ArrayObj,
      'BLOCK': interpreter.BlockObj

    }[expected];

    if (compareClass && actual instanceof compareClass) {
     
      return true;

    }

  }

  return false;

}

var setOutputFunction = function(outFunc) {

  interpreter.out = outFunc || util.print;

}

interpreter.setOutputFunction = setOutputFunction;

// instructions
var  Instruction = function(value) {

    this.value = value;

}

Instruction.prototype.toString = function() {

  return this.value;

}

var Obj = function(value) {

  this.value = value;

}

Obj.prototype = new Instruction();
Obj.prototype.constructor = Obj;

interpreter.Obj = Obj;

var createObjConstructor = function(subclass, callback) {

  var objClass = subclass + 'Obj';

  interpreter[objClass] = function(value) {

    this.value = value;

  }

  interpreter[objClass].prototype = new Obj();
  interpreter[objClass].prototype.constructor = interpreter[objClass];

  interpreter[subclass.toLowerCase()] = function(value) {

    return new interpreter[objClass](value);

  }

  if (callback) {

    interpreter[objClass].prototype.toString = callback;

  }
}

var initInstrConstructors = function() {

  createObjConstructor('Num');
  createObjConstructor('Array', arrToString('[', ']')); 
  createObjConstructor('Mark');
  createObjConstructor('Block', arrToString('{', '}'));
  
  num = interpreter.num;
  array = interpreter.array;
  mark = interpreter.mark;
  block = interpreter.block;

}

var arrToString = (function(start, end) {

  return function() {

    var str = start + ' ';

    for (var i = 0; i < this.value.length; i++) {

      str += this.value[i].toString() + ' ';

    }

    return str + end;
      
  }

});

var Operation = function(value) {

  this.value = value;

}

Operation.prototype = new Instruction();
Operation.prototype.constructor = Operation;

interpreter.Operation = Operation;

var operation = function(value) {

  return new Operation(value);

}

interpreter.operation = operation;

},{"../errors/errors.js":8,"util":6}],11:[function(_dereq_,module,exports){
var I = _dereq_('./interpreter.js'),
    errors = _dereq_('../errors/errors.js'),
    tokeniser = {};

module.exports = tokeniser;

var input,
    blocks,
    initFlag = false,
    symbols = {};

var init = function() {

  if (initFlag) {

    return;

  }

  I.init();

  initFlag = true;

}

tokeniser.init = init;

var tokenise = function(input) {

  blocks = [[]];

  var tokens = input.match(/\S+/g);

  if (tokens) {

    for (var i = 0; i < tokens.length; i++) {

      match(tokens[i]);
 
    }

  }

  if (blocks.length > 1) {

    throw new errors.blockNotClosed();

  }

  return currentBlock();

}

tokeniser.tokenise = tokenise;

var match = function(token) {

  if (!token) {

    return;
 
  }

  if (I.operations[token]) {

    push(I.operation(token));

  } else if (token.match(/\d+/)) {

    push(I.num(Number(token)));

  } else if (token == "[") {

    push(I.mark('['));

  } else if (token == "{") {

    pushBlock();

  } else if (token =="}") {

    var block = popBlock();
 
    push(I.block(block)); 

  } else {

    throw errors.symbolNotFound(token);

  }

}

var currentBlock = function() {

  return blocks[0];

}

var push = function(arg) {

  currentBlock().push(arg);

}

var pushBlock = function() {

  blocks.unshift([]);

}

var popBlock = function() {

  return blocks.shift();

}

},{"../errors/errors.js":8,"./interpreter.js":10}],12:[function(_dereq_,module,exports){
(function (process){
/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var pokelang = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"expressions":3,"prog":4,"start_battle":5,"ending":6,"goPokemon":7,"NEWLINE":8,"foePokemon":9,"COMMENT":10,"turns":11,"turn":12,"EOF":13,"selfTurn":14,"enemyTurn":15,"enemySwitchPokemon":16,"selfSwitchPokemon":17,"effect1":18,"GO":19,"POKEMON":20,"!":21,"ENEMY":22,"OPPONENT":23,"SENDS_OUT":24,"USES":25,"MOVE":26,"ENOUGH":27,"COME_BACK":28,"CALL_BACK":29,"EFFECTIVE":30,"NOT_EFFECTIVE":31,"NO_EFFECT":32,"$accept":0,"$end":1},
terminals_: {2:"error",8:"NEWLINE",10:"COMMENT",13:"EOF",19:"GO",20:"POKEMON",21:"!",22:"ENEMY",23:"OPPONENT",24:"SENDS_OUT",25:"USES",26:"MOVE",27:"ENOUGH",28:"COME_BACK",29:"CALL_BACK",30:"EFFECTIVE",31:"NOT_EFFECTIVE",32:"NO_EFFECT"},
productions_: [0,[3,1],[4,2],[5,3],[5,4],[11,2],[6,2],[6,1],[6,1],[6,2],[12,1],[12,1],[12,1],[12,1],[12,1],[12,1],[7,3],[9,5],[14,4],[15,5],[17,6],[16,7],[18,1],[18,1],[18,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:return $$[$0];
break;
case 2:this.$ = ['PROG', $$[$0-1], $$[$0]];
break;
case 3:this.$ = ['START', $$[$0-2], $$[$0]]
break;
case 4:this.$ = ['START', $$[$0-3], $$[$0]]
break;
case 5:
			if($$[$0-1]) {this.$ = ['CONCAT', $$[$0-1], $$[$0]]}
			else {this.$ = $$[$0]}
		
break;
case 6: this.$ = $$[$0]
break;
case 7: this.$ = null
break;
case 8: this.$ = null
break;
case 9:this.$ = $$[$0]
break;
case 10:this.$ = $$[$0]
break;
case 11:this.$ = $$[$0]
break;
case 12:this.$ = $$[$0]
break;
case 13:this.$ = $$[$0]
break;
case 14:this.$ = $$[$0]
break;
case 15:this.$ = null
break;
case 16:this.$ = ['GO', $$[$0-1]]
break;
case 17:this.$ = ['SENDS_OUT', $$[$0-3], $$[$0-1]]
break;
case 18:this.$ =['SELFTURN', $$[$0-3], $$[$0-1]]
break;
case 19:this.$ =['ENEMYTURN', $$[$0-3], $$[$0-1]]
break;
case 20:this.$ =['SELFSWITCHPOKEMON', $$[$0-5], $$[$0][1]]
break;
case 21:this.$ =['ENEMYSWITCHPOKEMON', $$[$0-5], $$[$0-3], $$[$0][2]]
break;
case 22:this.$ =['EFFECTIVE']
break;
case 23:this.$ =['NOT_EFFECTIVE']
break;
case 24:this.$ =['NO_EFFECT']
break;
}
},
table: [{3:1,4:2,5:3,7:4,19:[1,5]},{1:[3]},{1:[2,1]},{6:6,8:[1,7],10:[1,9],13:[1,8]},{8:[1,10],10:[1,11]},{20:[1,12]},{1:[2,2]},{1:[2,7],10:[1,20],11:13,12:14,14:15,15:16,16:17,17:18,18:19,20:[1,21],22:[1,22],30:[1,23],31:[1,24],32:[1,25]},{1:[2,8]},{6:26,8:[1,7],10:[1,9],13:[1,8]},{9:27,22:[1,28]},{8:[1,29]},{21:[1,30]},{1:[2,6]},{6:31,8:[1,7],10:[1,9],13:[1,8]},{8:[2,10],10:[2,10],13:[2,10]},{8:[2,11],10:[2,11],13:[2,11]},{8:[2,12],10:[2,12],13:[2,12]},{8:[2,13],10:[2,13],13:[2,13]},{8:[2,14],10:[2,14],13:[2,14]},{8:[2,15],10:[2,15],13:[2,15]},{21:[1,33],25:[1,32]},{20:[1,34],23:[1,35]},{8:[2,22],10:[2,22],13:[2,22]},{8:[2,23],10:[2,23],13:[2,23]},{8:[2,24],10:[2,24],13:[2,24]},{1:[2,9]},{8:[2,3],10:[2,3],13:[2,3]},{23:[1,36]},{9:37,22:[1,28]},{8:[2,16],10:[2,16],13:[2,16]},{1:[2,5]},{26:[1,38]},{27:[1,39]},{25:[1,40]},{29:[1,41]},{24:[1,42]},{8:[2,4],10:[2,4],13:[2,4]},{21:[1,43]},{28:[1,44]},{26:[1,45]},{20:[1,46]},{20:[1,47]},{8:[2,18],10:[2,18],13:[2,18]},{8:[1,48]},{21:[1,49]},{21:[1,50]},{21:[1,51]},{7:52,19:[1,5]},{8:[2,19],10:[2,19],13:[2,19]},{8:[1,53]},{8:[2,17],10:[2,17],13:[2,17]},{8:[2,20],10:[2,20],13:[2,20]},{9:54,22:[1,28]},{8:[2,21],10:[2,21],13:[2,21]}],
defaultActions: {2:[2,1],6:[2,2],8:[2,8],13:[2,6],26:[2,9],31:[2,5]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 13
break;
case 2:return 8
break;
case 3:/* skip whitespace */
break;
case 4:return 10
break;
case 5:return 'NUMBER'
break;
case 6:return 19
break;
case 7:return 25
break;
case 8:return 'START'
break;
case 9:return 30
break;
case 10:return 31
break;
case 11:return 32
break;
case 12:return 22
break;
case 13:return 24
break;
case 14:return 27
break;
case 15:return 29
break;
case 16:return 28
break;
case 17:return 'SEMICOLON'
break;
case 18:return 21
break;
case 19:return 20
break;
case 20:return 26
break;
case 21:return 23
break;
case 22:return 'INVALID'
break;
}
},
rules: [/^(?:[^\S\n])/,/^(?:((\n|\r\n)*)$)/,/^(?:(\n|\r\n)+)/,/^(?:\s+)/,/^(?:\/\/([^(\n\r|\n)])*)/,/^(?:[0-9]+(\.[0-9]+)?\b)/,/^(?:Go!)/,/^(?:uses\b)/,/^(?:START\b)/,/^(?:IT'S SUPER EFFECTIVE!)/,/^(?:IT'S NOT VERY EFFECTIVE!)/,/^(?:IT HAS NO EFFECT!)/,/^(?:(Foe))/,/^(?:sends out\b)/,/^(?:That's enough!)/,/^(?:calls back\b)/,/^(?:Come back!)/,/^(?:;)/,/^(?:!)/,/^(?:(BULBASAUR|IVYSAUR|VENUSAUR|CHARMANDER|CHARMELEON|CHARIZARD|SQUIRTLE|WARTORTLE|BLASTOISE|CATERPIE|METAPOD|BUTTERFREE|WEEDLE|KAKUNA|BEEDRILL|PIDGEY|PIDGEOTTO|PIDGEOT|RATTATA|RATICATE|SPEAROW|FEAROW|EKANS|ARBOK|PIKACHU|RAICHU|SANDSHREW|SANDSLASH|NIDORAN|NIDORINA|NIDOQUEEN|NIDORINO|NIDOKING|CLEFAIRY|CLEFABLE|VULPIX|NINETALES|JIGGLYPUFF|WIGGLYTUFF|ZUBAT|GOLBAT|ODDISH|GLOOM|VILEPLUME|PARAS|PARASECT|VENONAT|VENOMOTH|DIGLETT|DUGTRIO|MEOWTH|PERSIAN|PSYDUCK|GOLDUCK|MANKEY|PRIMEAPE|GROWLITHE|ARCANINE|POLIWAG|POLIWHIRL|POLIWRATH|ABRA|KADABRA|ALAKAZAM|MACHOP|MACHOKE|MACHAMP|BELLSPROUT|WEEPINBELL|VICTREEBEL|TENTACOOL|TENTACRUEL|GEODUDE|GRAVELER|GOLEM|PONYTA|RAPIDASH|SLOWPOKE|SLOWBRO|MAGNEMITE|MAGNETON|FARFETCHD|DODUO|DODRIO|SEEL|DEWGONG|GRIMER|MUK|SHELLDER|CLOYSTER|GASTLY|HAUNTER|GENGAR|ONIX|DROWZEE|HYPNO|KRABBY|KINGLER|VOLTORB|ELECTRODE|EXEGGCUTE|EXEGGUTOR|CUBONE|MAROWAK|HITMONLEE|HITMONCHAN|LICKITUNG|KOFFING|WEEZING|RHYHORN|RHYDON|CHANSEY|TANGELA|KANGASKHAN|HORSEA|SEADRA|GOLDEEN|SEAKING|STARYU|STARMIE|MRMIME|SCYTHER|JYNX|ELECTABUZZ|MAGMAR|PINSIR|TAUROS|MAGIKARP|GYARADOS|LAPRAS|DITTO|EEVEE|VAPOREON|JOLTEON|FLAREON|PORYGON|OMANYTE|OMASTAR|KABUTO|KABUTOPS|AERODACTYL|SNORLAX|ARTICUNO|ZAPDOS|MOLTRES|DRATINI|DRAGONAIR|DRAGONITE|MEWTWO|MEOWTH))/,/^(?:(POUND|KARATECHOP|DOUBLESLAP|COMETPUNCH|MEGAPUNCH|PAYDAY|FIREPUNCH|ICEPUNCH|THUNDERPUNCH|SCRATCH|VICEGRIP|GUILLOTINE|RAZORWIND|SWORDSDANCE|CUT|GUST|WINGATTACK|WHIRLWIND|FLY|BIND|SLAM|VINEWHIP|STOMP|DOUBLEKICK|MEGAKICK|JUMPKICK|ROLLINGKICK|SANDATTACK|HEADBUTT|HORNATTACK|FURYATTACK|HORNDRILL|TACKLE|BODYSLAM|WRAP|TAKEDOWN|THRASH|DOUBLEEDGE|TAILWHIP|POISONSTING|TWINEEDLE|PINMISSILE|LEER|BITE|GROWL|ROAR|SING|SUPERSONIC|SONICBOOM|DISABLE|ACID|EMBER|FLAMETHROWER|MIST|WATERGUN|HYDROPUMP|SURF|ICEBEAM|BLIZZARD|PSYBEAM|BUBBLEBEAM|AURORABEAM|HYPERBEAM|PECK|DRILLPECK|SUBMISSION|LOWKICK|COUNTER|SEISMICTOSS|STRENGTH|ABSORB|MEGADRAIN|LEECHSEED|GROWTH|RAZORLEAF|SOLARBEAM|POISONPOWDER|STUNSPORE|SLEEPPOWDER|PETALDANCE|STRINGSHOT|DRAGONRAGE|FIRESPIN|THUNDERSHOCK|THUNDERBOLT|THUNDERWAVE|THUNDER|ROCKTHROW|EARTHQUAKE|FISSURE|DIG|TOXIC|CONFUSION|PSYCHIC|HYPNOSIS|MEDITATE|AGILITY|QUICKATTACK|RAGE|TELEPORT|NIGHTSHADE|MIMIC|SCREECH|DOUBLETEAM|RECOVER|HARDEN|MINIMIZE|SMOKESCREEN|CONFUSERAY|WITHDRAW|DEFENSECURL|BARRIER|LIGHTSCREEN|HAZE|REFLECT|FOCUSENERGY|BIDE|METRONOME|MIRRORMOVE|SELFDESTRUCT|EGGBOMB|LICK|SMOG|SLUDGE|BONECLUB|FIREBLAST|WATERFALL|CLAMP|SWIFT|SKULLBASH|SPIKECANNON|CONSTRICT|AMNESIA|KINESIS|SOFTBOILED|HIGHJUMPKICK|GLARE|DREAMEATER|POISONGAS|BARRAGE|LEECHLIFE|LOVELYKISS|SKYATTACK|TRANSFORM|BUBBLE|DIZZYPUNCH|SPORE|FLASH|PSYWAVE|SPLASH|ACIDARMOR|CRABHAMMER|EXPLOSION|FURYSWIPES|BONEMERANG|REST|ROCKSLIDE|HYPERFANG|SHARPEN|CONVERSION|TRIATTACK|SUPERFANG|SLASH|SUBSTITUTE|STRUGGLE))/,/^(?:([A-Z]+))/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof _dereq_ !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = pokelang;
exports.Parser = pokelang.Parser;
exports.parse = function () { return pokelang.parse.apply(pokelang, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = _dereq_('fs').readFileSync(_dereq_('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && _dereq_.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,_dereq_("veCdhC"))
},{"fs":1,"path":3,"veCdhC":4}],13:[function(_dereq_,module,exports){
var info = {};

module.exports = info;

info.pokemon = {
	"BULBASAUR": {
		"INDEX": 1,
		"TYPE": ["GRASS", "POISON"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"LEECH SEED": {
				"TYPE": "GRASS"
			},
			"VINEWHIP": {
				"TYPE": "GRASS"
			},
			"POISON POWDER": {
				"TYPE": "POISON"
			},
			"RAZOR LEAF": {
				"TYPE": "GRASS"
			},
			"GROWTH": {
				"TYPE": "NORMAL"
			},
			"SLEEP POWDER": {
				"TYPE": "GRASS"
			},
			"SOLAR BEAM": {
				"TYPE": "GRASS"
			}
		}
	},
	"IVYSAUR": {
		"INDEX": 2,
		"TYPE": ["GRASS", "POISON"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"LEECH SEED": {
				"TYPE": "GRASS"
			},
			"VINE WHIP": {
				"TYPE": "GRASS"
			},
			"POISON POWDER": {
				"TYPE": "POISON"
			},
			"RAZOR LEAF": {
				"TYPE": "GRASS"
			},
			"GROWTH": {
				"TYPE": "NORMAL"
			},
			"SLEEP POWDER": {
				"TYPE": "GRASS"
			},
			"SOLAR BEAM": {
				"TYPE": "GRASS"
			}
		}
	},
	"VENUSAUR": {
		"INDEX": 3,
		"TYPE": ["GRASS", "POISON"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"LEECH SEED": {
				"TYPE": "GRASS"
			},
			"VINE WHIP": {
				"TYPE": "GRASS"
			},
			"POISON POWDER": {
				"TYPE": "POISON"
			},
			"RAZOR LEAF": {
				"TYPE": "GRASS"
			},
			"GROWTH": {
				"TYPE": "NORMAL"
			},
			"SLEEP POWDER": {
				"TYPE": "GRASS"
			},
			"SOLAR BEAM": {
				"TYPE": "GRASS"
			}
		}
	},
	"CHARMANDER": {
		"INDEX": 4,
		"TYPE": ["FIRE"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"EMBER": {
				"TYPE": "FIRE"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"FLAMETHROWER": {
				"TYPE": "FIRE"
			},
			"FIRE SPIN": {
				"TYPE": "FIRE"
			}
		}
	},
	"CHARMELEON": {
		"INDEX": 5,
		"TYPE": ["FIRE"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"EMBER": {
				"TYPE": "FIRE"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"FLAMETHROWER": {
				"TYPE": "FIRE"
			},
			"FIRE SPIN": {
				"TYPE": "FIRE"
			}
		}
	},
	"CHARIZARD": {
		"INDEX": 6,
		"TYPE": ["FIRE"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"EMBER": {
				"TYPE": "FIRE"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"FLAMETHROWER": {
				"TYPE": "FIRE"
			},
			"FIRE SPIN": {
				"TYPE": "FIRE"
			}
		}
	},
	"SQUIRTLE": {
		"INDEX": 7,
		"TYPE": ["WATER"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"BUBBLE": {
				"TYPE": "WATER"
			},
			"WATERGUN": {
				"TYPE": "WATER"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"WITHDRAW": {
				"TYPE": "WATER"
			},
			"SKULL BASH": {
				"TYPE": "NORMAL"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"WARTORTLE": {
		"INDEX": 8,
		"TYPE": ["WATER"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"BUBBLE": {
				"TYPE": "WATER"
			},
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"WITHDRAW": {
				"TYPE": "WATER"
			},
			"SKULL BASH": {
				"TYPE": "NORMAL"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"BLASTOISE": {
		"INDEX": 9,
		"TYPE": ["WATER"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"BUBBLE": {
				"TYPE": "WATER"
			},
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"WITHDRAW": {
				"TYPE": "WATER"
			},
			"SKULL BASH": {
				"TYPE": "NORMAL"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"CATERPIE": {
		"INDEX": 10,
		"TYPE": ["BUG"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"STRING SHOT": {
				"TYPE": "BUG"
			}
		}
	},
	"METAPOD": {
		"INDEX": 11,
		"TYPE": ["BUG"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"STRING SHOT": {
				"TYPE": "BUG"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			}
		}
	},
	"BUTTERFREE": {
		"INDEX": 12,
		"TYPE": ["BUG", "FLYING"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"STRING SHOT": {
				"TYPE": "BUG"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"POISON POWDER": {
				"TYPE": "POISON"
			},
			"STUN SPORE": {
				"TYPE": "GRASS"
			},
			"SLEEP POWDER": {
				"TYPE": "GRASS"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"WHIRLWIND": {
				"TYPE": "NORMAL"
			},
			"GUST": {
				"TYPE": "NORMAL"
			},
			"PSYBEAM": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"WEEDLE": {
		"INDEX": 13,
		"TYPE": ["BUG", "POISON"],
		"MOVES": {
			"POISON STING": {
				"TYPE": "POISON"
			},
			"STRING SHOT": {
				"TYPE": "BUG"
			}
		}
	},
	"KAKUNA": {
		"INDEX": 14,
		"TYPE": ["BUG", "POISON"],
		"MOVES": {
			"POISON STING": {
				"TYPE": "POISON"
			},
			"STRING SHOT": {
				"TYPE": "BUG"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			}
		}
	},
	"BEEDRILL": {
		"INDEX": 15,
		"TYPE": ["BUG", "POISON"],
		"MOVES": {
			"POISON STING": {
				"TYPE": "POISON"
			},
			"STRING SHOT": {
				"TYPE": "BUG"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"FURY ATTACK": {
				"TYPE": "NORMAL"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"TWIN NEEDLE": {
				"TYPE": "BUG"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			},
			"PIN MISSILE": {
				"TYPE": "BUG"
			},
			"AGILITY": {
				"TYPE": "NORMAL"
			}
		}
	},
	"PIDGEY": {
		"INDEX": 16,
		"TYPE": ["NORMAL", "FLYING"],
		"MOVES": {
			"GUST": {
				"TYPE": "NORMAL"
			},
			"SAND-ATTACK": {
				"TYPE": "NORMAL"
			},
			"QUICK ATTACK": {
				"TYPE": "NORMAL"
			},
			"WHIRLWIND": {
				"TYPE": "NORMAL"
			},
			"WING ATTACK": {
				"TYPE": "FLYING"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"MIRROR MOVE": {
				"TYPE": "FLYING"
			}
		}
	},
	"PIDGEOTTO": {
		"INDEX": 17,
		"TYPE": ["NORMAL", "FLYING"],
		"MOVES": {
			"GUST": {
				"TYPE": "NORMAL"
			},
			"SAND-ATTACK": {
				"TYPE": "NORMAL"
			},
			"QUICK ATTACK": {
				"TYPE": "NORMAL"
			},
			"WHIRLWIND": {
				"TYPE": "NORMAL"
			},
			"WING ATTACK": {
				"TYPE": "FLYING"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"MIRROR MOVE": {
				"TYPE": "FLYING"
			}
		}
	},
	"PIDGEOT": {
		"INDEX": 18,
		"TYPE": ["NORMAL", "FLYING"],
		"MOVES": {
			"GUST": {
				"TYPE": "NORMAL"
			},
			"SAND-ATTACK": {
				"TYPE": "NORMAL"
			},
			"QUICK ATTACK": {
				"TYPE": "NORMAL"
			},
			"WHIRLWIND": {
				"TYPE": "NORMAL"
			},
			"WING ATTACK": {
				"TYPE": "FLYING"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"MIRROR MOVE": {
				"TYPE": "FLYING"
			}
		}
	},
	"RATTATA": {
		"INDEX": 19,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"QUICK ATTACK": {
				"TYPE": "NORMAL"
			},
			"HYPER FANG": {
				"TYPE": "NORMAL"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"SUPER FANG": {
				"TYPE": "NORMAL"
			}
		}
	},
	"RATICATE": {
		"INDEX": 20,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"QUICK ATTACK": {
				"TYPE": "NORMAL"
			},
			"HYPER FANG": {
				"TYPE": "NORMAL"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"SUPER FANG": {
				"TYPE": "NORMAL"
			}
		}
	},
	"SPEAROW": {
		"INDEX": 21,
		"TYPE": ["NORMAL", "FLYING"],
		"MOVES": {
			"PECK": {
				"TYPE": "FLYING"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FURY ATTACK": {
				"TYPE": "NORMAL"
			},
			"MIRROR MOVE": {
				"TYPE": "FLYING"
			},
			"DRILL PECK": {
				"TYPE": "FLYING"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"FEAROW": {
		"INDEX": 22,
		"TYPE": ["NORMAL", "FLYING"],
		"MOVES": {
			"PECK": {
				"TYPE": "FLYING"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FURY ATTACK": {
				"TYPE": "NORMAL"
			},
			"MIRROR MOVE": {
				"TYPE": "FLYING"
			},
			"DRILL PECK": {
				"TYPE": "FLYING"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"EKANS": {
		"INDEX": 23,
		"TYPE": ["POISON"],
		"MOVES": {}
	},
	"ARBOK": {
		"INDEX": 24,
		"TYPE": ["POISON"],
		"MOVES": {}
	},
	"PIKACHU": {
		"INDEX": 25,
		"TYPE": ["ELECTRIC"],
		"MOVES": {
			"THUNDERSHOCK": {
				"TYPE": "ELECTRIC"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"THUNDER WAVE": {
				"TYPE": "ELECTRIC"
			},
			"QUICK ATTACK": {
				"TYPE": "NORMAL"
			},
			"DOUBLE TEAM": {
				"TYPE": "NORMAL"
			},
			"SLAM": {
				"TYPE": "NORMAL"
			},
			"THUNDERBOLT": {
				"TYPE": "ELECTRIC"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"THUNDER": {
				"TYPE": "ELECTRIC"
			},
			"LIGHT SCREEN": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"RAICHU": {
		"INDEX": 26,
		"TYPE": ["ELECTRIC"],
		"MOVES": {}
	},
	"SANDSHREW": {
		"INDEX": 27,
		"TYPE": ["GROUND"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"SAND-ATTACK": {
				"TYPE": "NORMAL"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"POISON STING": {
				"TYPE": "POISON"
			},
			"SWIFT": {
				"TYPE": "NORMAL"
			},
			"FURY SWIPES": {
				"TYPE": "NORMAL"
			}
		}
	},
	"SANDSLASH": {
		"INDEX": 28,
		"TYPE": ["GROUND"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"SAND-ATTACK": {
				"TYPE": "NORMAL"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"POISON STING": {
				"TYPE": "POISON"
			},
			"SWIFT": {
				"TYPE": "NORMAL"
			},
			"FURY SWIPES": {
				"TYPE": "NORMAL"
			}
		}
	},
	"NIDORAN F": {
		"INDEX": 29,
		"TYPE": ["POISON"],
		"MOVES": {
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"DOUBLE KICK": {
				"TYPE": "FIGHTING"
			},
			"POISON STING": {
				"TYPE": "POISON"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"FURY SWIPES": {
				"TYPE": "NORMAL"
			}
		}
	},
	"NIDORINA": {
		"INDEX": 30,
		"TYPE": ["POISON"],
		"MOVES": {
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"DOUBLE KICK": {
				"TYPE": "FIGHTING"
			},
			"POISON STING": {
				"TYPE": "POISON"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"FURY SWIPES": {
				"TYPE": "NORMAL"
			}
		}
	},
	"NIDOQUEEN": {
		"INDEX": 31,
		"TYPE": ["POISON", "GROUND"],
		"MOVES": {
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"DOUBLE KICK": {
				"TYPE": "FIGHTING"
			},
			"POISON STING": {
				"TYPE": "POISON"
			},
			"BODY SLAM": {
				"TYPE": "NORMAL"
			}
		}
	},
	"NIDORAN M": {
		"INDEX": 32,
		"TYPE": ["POISON"],
		"MOVES": {
			"LEER": {
				"TYPE": "NORMAL"
			},
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"HORN ATTACK": {
				"TYPE": "NORMAL"
			},
			"DOUBLE KICK": {
				"TYPE": "FIGHTING"
			},
			"POISON STING": {
				"TYPE": "POISON"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"FURY ATTACK": {
				"TYPE": "NORMAL"
			},
			"HORN DRILL": {
				"TYPE": "NORMAL"
			}
		}
	},
	"NIDORINO": {
		"INDEX": 33,
		"TYPE": ["POISON"],
		"MOVES": {
			"LEER": {
				"TYPE": "NORMAL"
			},
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"HORN ATTACK": {
				"TYPE": "NORMAL"
			},
			"DOUBLE KICK": {
				"TYPE": "FIGHTING"
			},
			"POISON STING": {
				"TYPE": "POISON"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"FURY ATTACK": {
				"TYPE": "NORMAL"
			},
			"HORN DRILL": {
				"TYPE": "NORMAL"
			}
		}
	},
	"NIDOKING": {
		"INDEX": 34,
		"TYPE": ["POISON", "GROUND"],
		"MOVES": {
			"LEER": {
				"TYPE": "NORMAL"
			},
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"HORN ATTACK": {
				"TYPE": "NORMAL"
			},
			"DOUBLE KICK": {
				"TYPE": "FIGHTING"
			},
			"POISON STING": {
				"TYPE": "POISON"
			},
			"THRASH": {
				"TYPE": "NORMAL"
			}
		}
	},
	"CLEFAIRY": {
		"INDEX": 35,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"POUND": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"SING": {
				"TYPE": "NORMAL"
			},
			"DOUBLESLAP": {
				"TYPE": "NORMAL"
			},
			"MINIMIZE": {
				"TYPE": "NORMAL"
			},
			"METRONOME": {
				"TYPE": "NORMAL"
			},
			"DEFENSE CURL": {
				"TYPE": "NORMAL"
			},
			"LIGHT SCREEN": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"CLEFABLE": {
		"INDEX": 36,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"POUND": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"SING": {
				"TYPE": "NORMAL"
			},
			"DOUBLESLAP": {
				"TYPE": "NORMAL"
			},
			"MINIMIZE": {
				"TYPE": "NORMAL"
			},
			"METRONOME": {
				"TYPE": "NORMAL"
			},
			"DEFENSE CURL": {
				"TYPE": "NORMAL"
			},
			"LIGHT SCREEN": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"VULPIX": {
		"INDEX": 37,
		"TYPE": ["FIRE"],
		"MOVES": {
			"EMBER": {
				"TYPE": "FIRE"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"QUICK ATTACK": {
				"TYPE": "NORMAL"
			},
			"ROAR": {
				"TYPE": "NORMAL"
			},
			"CONFUSE RAY": {
				"TYPE": "GHOST"
			},
			"FLAMETHROWER": {
				"TYPE": "FIRE"
			},
			"FIRE SPIN": {
				"TYPE": "FIRE"
			}
		}
	},
	"NINETALES": {
		"INDEX": 38,
		"TYPE": ["FIRE"],
		"MOVES": {}
	},
	"JIGGLYPUFF": {
		"INDEX": 39,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"SING": {
				"TYPE": "NORMAL"
			},
			"POUND": {
				"TYPE": "NORMAL"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"DEFENSE CURL": {
				"TYPE": "NORMAL"
			},
			"DOUBLESLAP": {
				"TYPE": "NORMAL"
			},
			"REST": {
				"TYPE": "PSYCHIC"
			},
			"BODY SLAM": {
				"TYPE": "NORMAL"
			},
			"DOUBLE-EDGE": {
				"TYPE": "NORMAL"
			}
		}
	},
	"WIGGLYTUFF": {
		"INDEX": 40,
		"TYPE": ["NORMAL"],
		"MOVES": {}
	},
	"ZUBAT": {
		"INDEX": 41,
		"TYPE": ["POISON", "FLYING"],
		"MOVES": {
			"LEECH LIFE": {
				"TYPE": "BUG"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"CONFUSE RAY": {
				"TYPE": "GHOST"
			},
			"WING ATTACK": {
				"TYPE": "FLYING"
			},
			"HAZE": {
				"TYPE": "ICE"
			}
		}
	},
	"GOLBAT": {
		"INDEX": 42,
		"TYPE": ["POISON", "FLYING"],
		"MOVES": {
			"LEECH LIFE": {
				"TYPE": "BUG"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"CONFUSE RAY": {
				"TYPE": "GHOST"
			},
			"WING ATTACK": {
				"TYPE": "FLYING"
			},
			"HAZE": {
				"TYPE": "ICE"
			}
		}
	},
	"ODDISH": {
		"INDEX": 43,
		"TYPE": ["GRASS", "POISON"],
		"MOVES": {
			"ABSORB": {
				"TYPE": "GRASS"
			},
			"POISON POWDER": {
				"TYPE": "POISON"
			},
			"STUN SPORE": {
				"TYPE": "GRASS"
			},
			"SLEEP POWDER": {
				"TYPE": "GRASS"
			},
			"ACID": {
				"TYPE": "POISON"
			},
			"SOLAR BEAM": {
				"TYPE": "GRASS"
			}
		}
	},
	"GLOOM": {
		"INDEX": 44,
		"TYPE": ["GRASS", "POISON"],
		"MOVES": {
			"ABSORB": {
				"TYPE": "GRASS"
			},
			"POISON POWDER": {
				"TYPE": "POISON"
			},
			"STUN SPORE": {
				"TYPE": "GRASS"
			},
			"SLEEP POWDER": {
				"TYPE": "GRASS"
			},
			"ACID": {
				"TYPE": "POISON"
			},
			"SOLAR BEAM": {
				"TYPE": "GRASS"
			}
		}
	},
	"VILEPLUME": {
		"INDEX": 45,
		"TYPE": ["GRASS", "POISON"],
		"MOVES": {}
	},
	"PARAS": {
		"INDEX": 46,
		"TYPE": ["BUG", "GRASS"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"STUN SPORE": {
				"TYPE": "GRASS"
			},
			"LEECH LIFE": {
				"TYPE": "GRASS"
			},
			"SPORE": {
				"TYPE": "BUG"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"GROWTH": {
				"TYPE": "NORMAL"
			}
		}
	},
	"PARASECT": {
		"INDEX": 47,
		"TYPE": ["BUG", "GRASS"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"STUN SPORE": {
				"TYPE": "GRASS"
			},
			"LEECH LIFE": {
				"TYPE": "GRASS"
			},
			"SPORE": {
				"TYPE": "BUG"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"GROWTH": {
				"TYPE": "NORMAL"
			}
		}
	},
	"VENONAT": {
		"INDEX": 48,
		"TYPE": ["BUG", "POISON"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"POISON POWDER": {
				"TYPE": "POISON"
			},
			"LEECH LIFE": {
				"TYPE": "GRASS"
			},
			"STUN SPORE": {
				"TYPE": "GRASS"
			},
			"PSYBEAM": {
				"TYPE": "PSYCHIC"
			},
			"SLEEP POWDER": {
				"TYPE": "GRASS"
			},
			"PSYCHIC": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"VENOMOTH": {
		"INDEX": 49,
		"TYPE": ["BUG", "POISON"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"POISON POWDER": {
				"TYPE": "POISON"
			},
			"LEECH LIFE": {
				"TYPE": "GRASS"
			},
			"STUN SPORE": {
				"TYPE": "GRASS"
			},
			"PSYBEAM": {
				"TYPE": "PSYCHIC"
			},
			"SLEEP POWDER": {
				"TYPE": "GRASS"
			},
			"PSYCHIC": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"DIGLETT": {
		"INDEX": 50,
		"TYPE": ["GROUND"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"DIG": {
				"TYPE": "GROUND"
			},
			"SAND-ATTACK": {
				"TYPE": "NORMAL"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"EARTHQUAKE": {
				"TYPE": "GROUND"
			}
		}
	},
	"DUGTRIO": {
		"INDEX": 51,
		"TYPE": ["GROUND"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"DIG": {
				"TYPE": "GROUND"
			},
			"SAND-ATTACK": {
				"TYPE": "NORMAL"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"EARTHQUAKE": {
				"TYPE": "GROUND"
			}
		}
	},
	"MEOWTH": {
		"INDEX": 52,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"PAY DAY": {
				"TYPE": "NORMAL"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			},
			"FURY SWIPES": {
				"TYPE": "NORMAL"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			}
		}
	},
	"PERSIAN": {
		"INDEX": 53,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"PAY DAY": {
				"TYPE": "NORMAL"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			},
			"FURY SWIPES": {
				"TYPE": "NORMAL"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			}
		}
	},
	"PSYDUCK": {
		"INDEX": 54,
		"TYPE": ["WATER"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"FURY SWIPES": {
				"TYPE": "NORMAL"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"GOLDUCK": {
		"INDEX": 55,
		"TYPE": ["WATER"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"FURY SWIPES": {
				"TYPE": "NORMAL"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"MANKEY": {
		"INDEX": 56,
		"TYPE": ["FIGHTING"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"LOW KICK": {
				"TYPE": "FIGHTING"
			},
			"KARATE CHOP": {
				"TYPE": "NORMAL"
			},
			"FURY SWIPES": {
				"TYPE": "NORMAL"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"SEISMIC TOSS": {
				"TYPE": "FIGHTING"
			},
			"THRASH": {
				"TYPE": "NORMAL"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			}
		}
	},
	"PRIMEAPE": {
		"INDEX": 57,
		"TYPE": ["FIGHTING"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"LOW KICK": {
				"TYPE": "FIGHTING"
			},
			"KARATE CHOP": {
				"TYPE": "NORMAL"
			},
			"FURY SWIPES": {
				"TYPE": "NORMAL"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"SEISMIC TOSS": {
				"TYPE": "FIGHTING"
			},
			"THRASH": {
				"TYPE": "NORMAL"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			}
		}
	},
	"GROWLITHE": {
		"INDEX": 58,
		"TYPE": ["FIRE"],
		"MOVES": {
			"BITE": {
				"TYPE": "NORMAL"
			},
			"ROAR": {
				"TYPE": "NORMAL"
			},
			"EMBER": {
				"TYPE": "FIRE"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"TAKE DOWN": {
				"TYPE": "NORMAL"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"FLAMETHROWER": {
				"TYPE": "FIRE"
			}
		}
	},
	"ARCANINE": {
		"INDEX": 59,
		"TYPE": ["FIRE"],
		"MOVES": {}
	},
	"POLIWAG": {
		"INDEX": 60,
		"TYPE": ["WATER"],
		"MOVES": {
			"BUBBLE": {
				"TYPE": "WATER"
			},
			"HYPNOSIS": {
				"TYPE": "PSYCHIC"
			},
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"DOUBLESLAP": {
				"TYPE": "NORMAL"
			},
			"BODY SLAM": {
				"TYPE": "NORMAL"
			},
			"AMNESIA": {
				"TYPE": "PSYCHIC"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"POLIWHIRL": {
		"INDEX": 61,
		"TYPE": ["WATER"],
		"MOVES": {
			"BUBBLE": {
				"TYPE": "WATER"
			},
			"HYPNOSIS": {
				"TYPE": "PSYCHIC"
			},
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"DOUBLESLAP": {
				"TYPE": "NORMAL"
			},
			"BODY SLAM": {
				"TYPE": "NORMAL"
			},
			"AMNESIA": {
				"TYPE": "PSYCHIC"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"POLIWRATH": {
		"INDEX": 62,
		"TYPE": ["WATER"],
		"MOVES": {
			"BUBBLE": {
				"TYPE": "WATER"
			},
			"HYPNOSIS": {
				"TYPE": "PSYCHIC"
			},
			"WATER GUN": {
				"TYPE": "WATER"
			}
		}
	},
	"ABRA": {
		"INDEX": 63,
		"TYPE": ["PSYCHIC"],
		"MOVES": {
			"TELEPORT": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"KADABRA": {
		"INDEX": 64,
		"TYPE": ["PSYCHIC"],
		"MOVES": {
			"TELEPORT": {
				"TYPE": "PSYCHIC"
			},
			"KINESIS": {
				"TYPE": "PSYCHIC"
			},
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"PSYBEAM": {
				"TYPE": "PSYCHIC"
			},
			"RECOVER": {
				"TYPE": "NORMAL"
			},
			"PSYCHIC": {
				"TYPE": "PSYCHIC"
			},
			"REFLECT": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"ALAKAZAM": {
		"INDEX": 65,
		"TYPE": ["PSYCHIC"],
		"MOVES": {
			"TELEPORT": {
				"TYPE": "PSYCHIC"
			},
			"KINESIS": {
				"TYPE": "PSYCHIC"
			},
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"PSYBEAM": {
				"TYPE": "PSYCHIC"
			},
			"RECOVER": {
				"TYPE": "NORMAL"
			},
			"PSYCHIC": {
				"TYPE": "PSYCHIC"
			},
			"REFLECT": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"MACHOP": {
		"INDEX": 66,
		"TYPE": ["FIGHTING"],
		"MOVES": {
			"KARATE CHOP": {
				"TYPE": "NORMAL"
			},
			"LOW KICK": {
				"TYPE": "FIGHTING"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"SEISMIC TOSS": {
				"TYPE": "FIGHTING"
			},
			"SUBMISSION": {
				"TYPE": "FIGHTING"
			}
		}
	},
	"MACHOKE": {
		"INDEX": 67,
		"TYPE": ["FIGHTING"],
		"MOVES": {
			"KARATE CHOP": {
				"TYPE": "NORMAL"
			},
			"LOW KICK": {
				"TYPE": "FIGHTING"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"SEISMIC TOSS": {
				"TYPE": "FIGHTING"
			},
			"SUBMISSION": {
				"TYPE": "FIGHTING"
			}
		}
	},
	"MACHAMP": {
		"INDEX": 68,
		"TYPE": ["FIGHTING"],
		"MOVES": {
			"KARATE CHOP": {
				"TYPE": "NORMAL"
			},
			"LOW KICK": {
				"TYPE": "FIGHTING"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"SEISMIC TOSS": {
				"TYPE": "FIGHTING"
			},
			"SUBMISSION": {
				"TYPE": "FIGHTING"
			}
		}
	},
	"BELLSPROUT": {
		"INDEX": 69,
		"TYPE": ["GRASS", "POISON"],
		"MOVES": {
			"VINE WHIP": {
				"TYPE": "GRASS"
			},
			"GROWTH": {
				"TYPE": "NORMAL"
			},
			"WRAP": {
				"TYPE": "NORMAL"
			},
			"POISON POWDER": {
				"TYPE": "POISON"
			},
			"SLEEP POWDER": {
				"TYPE": "GRASS"
			},
			"STUN SPORE": {
				"TYPE": "GRASS"
			},
			"ACID": {
				"TYPE": "POISON"
			},
			"RAZOR LEAF": {
				"TYPE": "GRASS"
			},
			"SLAM": {
				"TYPE": "NORMAL"
			}
		}
	},
	"WEEPINBELL": {
		"INDEX": 70,
		"TYPE": ["GRASS", "POISON"],
		"MOVES": {
			"VINE WHIP": {
				"TYPE": "GRASS"
			},
			"GROWTH": {
				"TYPE": "NORMAL"
			},
			"WRAP": {
				"TYPE": "NORMAL"
			},
			"POISON POWDER": {
				"TYPE": "POISON"
			},
			"SLEEP POWDER": {
				"TYPE": "GRASS"
			},
			"STUN SPORE": {
				"TYPE": "GRASS"
			},
			"ACID": {
				"TYPE": "POISON"
			},
			"RAZOR LEAF": {
				"TYPE": "GRASS"
			},
			"SLAM": {
				"TYPE": "NORMAL"
			}
		}
	},
	"VICTREEBEL": {
		"INDEX": 71,
		"TYPE": ["GRASS", "POISON"],
		"MOVES": {}
	},
	"TENTACOOL": {
		"INDEX": 72,
		"TYPE": ["WATER", "POISON"],
		"MOVES": {
			"ACID": {
				"TYPE": "POISON"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"WRAP": {
				"TYPE": "NORMAL"
			},
			"POISON STING": {
				"TYPE": "POISON"
			},
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"CONSTRICT": {
				"TYPE": "NORMAL"
			},
			"BARRIER": {
				"TYPE": "PSYCHIC"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"TENTACRUEL": {
		"INDEX": 73,
		"TYPE": ["WATER", "POISON"],
		"MOVES": {
			"ACID": {
				"TYPE": "POISON"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"WRAP": {
				"TYPE": "NORMAL"
			},
			"POISONSTING": {
				"TYPE": "POISON"
			},
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"CONSTRICT": {
				"TYPE": "NORMAL"
			},
			"BARRIER": {
				"TYPE": "PSYCHIC"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"GEODUDE": {
		"INDEX": 74,
		"TYPE": ["ROCK", "GROUND"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"DEFENSE CURL": {
				"TYPE": "NORMAL"
			},
			"ROCKTHROW": {
				"TYPE": "ROCK"
			},
			"SELF DESTRUCT": {
				"TYPE": "NORMAL"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"EARTHQUAKE": {
				"TYPE": "GROUND"
			},
			"EXPLOSION": {
				"TYPE": "NORMAL"
			}
		}
	},
	"GRAVELER": {
		"INDEX": 75,
		"TYPE": ["ROCK", "GROUND"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"DEFENSE CURL": {
				"TYPE": "NORMAL"
			},
			"ROCK THROW": {
				"TYPE": "ROCK"
			},
			"SELF DESTRUCT": {
				"TYPE": "NORMAL"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"EARTHQUAKE": {
				"TYPE": "GROUND"
			},
			"EXPLOSION": {
				"TYPE": "NORMAL"
			}
		}
	},
	"GOLEM": {
		"INDEX": 76,
		"TYPE": ["ROCK", "GROUND"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"DEFENSE CURL": {
				"TYPE": "NORMAL"
			},
			"ROCK THROW": {
				"TYPE": "ROCK"
			},
			"SELF DESTRUCT": {
				"TYPE": "NORMAL"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"EARTHQUAKE": {
				"TYPE": "GROUND"
			},
			"EXPLOSION": {
				"TYPE": "NORMAL"
			}
		}
	},
	"PONYTA": {
		"INDEX": 77,
		"TYPE": ["FIRE"],
		"MOVES": {
			"EMBER": {
				"TYPE": "FIRE"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"STOMP": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"FIRE SPIN": {
				"TYPE": "FIRE"
			},
			"TAKE DOWN": {
				"TYPE": "NORMAL"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"RAPIDASH": {
		"INDEX": 78,
		"TYPE": ["FIRE"],
		"MOVES": {
			"EMBER": {
				"TYPE": "FIRE"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"STOMP": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"FIRE SPIN": {
				"TYPE": "FIRE"
			},
			"TAKE DOWN": {
				"TYPE": "NORMAL"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"SLOWPOKE": {
		"INDEX": 79,
		"TYPE": ["WATER", "PSYCHIC"],
		"MOVES": {
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"HEADBUTT": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"AMNESIA": {
				"TYPE": "PSYCHIC"
			},
			"PSYCHIC": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"SLOWBRO": {
		"INDEX": 80,
		"TYPE": ["WATER", "PSYCHIC"],
		"MOVES": {
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"HEAD BUTT": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"WITHDRAW": {
				"TYPE": "WATER"
			},
			"AMNESIA": {
				"TYPE": "PSYCHIC"
			},
			"PSYCHIC": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"MAGNEMITE": {
		"INDEX": 81,
		"TYPE": ["ELECTRIC"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SONICBOOM": {
				"TYPE": "NORMAL"
			},
			"THUNDERSHOCK": {
				"TYPE": "ELECTRIC"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"THUNDER WAVE": {
				"TYPE": "ELECTRIC"
			},
			"SWIFT": {
				"TYPE": "NORMAL"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			}
		}
	},
	"MAGNETON": {
		"INDEX": 82,
		"TYPE": ["ELECTRIC"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SONICBOOM": {
				"TYPE": "NORMAL"
			},
			"THUNDERSHOCK": {
				"TYPE": "ELECTRIC"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"THUNDER WAVE": {
				"TYPE": "ELECTRIC"
			},
			"SWIFT": {
				"TYPE": "NORMAL"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			}
		}
	},
	"FARFETCH'D": {
		"INDEX": 83,
		"TYPE": ["NORMAL", "FLYING"],
		"MOVES": {
			"PECK": {
				"TYPE": "FLYING"
			},
			"SAND-ATTACK": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FURY ATTACK": {
				"TYPE": "NORMAL"
			},
			"SWORDS DANCE": {
				"TYPE": "NORMAL"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			}
		}
	},
	"DODUO": {
		"INDEX": 84,
		"TYPE": ["NORMAL", "FLYING"],
		"MOVES": {
			"PECK": {
				"TYPE": "FLYING"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"FURY ATTACK": {
				"TYPE": "NORMAL"
			},
			"DRILL PECK": {
				"TYPE": "FLYING"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			},
			"TRI ATTACK": {
				"TYPE": "NORMAL"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"DODRIO": {
		"INDEX": 85,
		"TYPE": ["NORMAL", "FLYING"],
		"MOVES": {
			"PECK": {
				"TYPE": "FLYING"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"FURY ATTACK": {
				"TYPE": "NORMAL"
			},
			"DRILL PECK": {
				"TYPE": "FLYING"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			},
			"TRI ATTACK": {
				"TYPE": "NORMAL"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"SEEL": {
		"INDEX": 86,
		"TYPE": ["WATER"],
		"MOVES": {
			"HEAD BUTT": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"AURORA BEAM": {
				"TYPE": "ICE"
			},
			"REST": {
				"TYPE": "PSYCHIC"
			},
			"TAKE DOWN": {
				"TYPE": "NORMAL"
			},
			"ICE BEAM": {
				"TYPE": "ICE"
			}
		}
	},
	"DEWGONG": {
		"INDEX": 87,
		"TYPE": ["WATER", "ICE"],
		"MOVES": {
			"HEAD BUTT": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"AURORA BEAM": {
				"TYPE": "ICE"
			},
			"REST": {
				"TYPE": "PSYCHIC"
			},
			"TAKE DOWN": {
				"TYPE": "NORMAL"
			},
			"ICE BEAM": {
				"TYPE": "ICE"
			}
		}
	},
	"GRIMER": {
		"INDEX": 88,
		"TYPE": ["POISON"],
		"MOVES": {
			"POUND": {
				"TYPE": "NORMAL"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"POISON GAS": {
				"TYPE": "POISON"
			},
			"MINIMIZE": {
				"TYPE": "NORMAL"
			},
			"SLUDGE": {
				"TYPE": "POISON"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			},
			"ACID ARMOR": {
				"TYPE": "POISON"
			}
		}
	},
	"MUK": {
		"INDEX": 89,
		"TYPE": ["POISON"],
		"MOVES": {
			"POUND": {
				"TYPE": "NORMAL"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"POISON GAS": {
				"TYPE": "POISON"
			},
			"MINIMIZE": {
				"TYPE": "NORMAL"
			},
			"SLUDGE": {
				"TYPE": "POISON"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			},
			"ACID ARMOR": {
				"TYPE": "POISON"
			}
		}
	},
	"SHELLDER": {
		"INDEX": 90,
		"TYPE": ["WATER"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"WITHDRAW": {
				"TYPE": "WATER"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"CLAMP": {
				"TYPE": "WATER"
			},
			"AURORA BEAM": {
				"TYPE": "ICE"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"ICE BEAM": {
				"TYPE": "ICE"
			}
		}
	},
	"CLOYSTER": {
		"INDEX": 91,
		"TYPE": ["WATER", "ICE"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"WITHDRAW": {
				"TYPE": "WATER"
			},
			"SPIKE CANNON": {
				"TYPE": "NORMAL"
			}
		}
	},
	"GASTLY": {
		"INDEX": 92,
		"TYPE": ["GHOST", "POISON"],
		"MOVES": {
			"LICK": {
				"TYPE": "GHOST"
			},
			"CONFUSE RAY": {
				"TYPE": "GHOST"
			},
			"NIGHT SHADE": {
				"TYPE": "GHOST"
			},
			"HYPNOSIS": {
				"TYPE": "PSYCHIC"
			},
			"DREAM EATER": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"HAUNTER": {
		"INDEX": 93,
		"TYPE": ["GHOST", "POISON"],
		"MOVES": {
			"LICK": {
				"TYPE": "GHOST"
			},
			"CONFUSE RAY": {
				"TYPE": "GHOST"
			},
			"NIGHT SHADE": {
				"TYPE": "GHOST"
			},
			"HYPNOSIS": {
				"TYPE": "PSYCHIC"
			},
			"DREAM EATER": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"GENGAR": {
		"INDEX": 94,
		"TYPE": ["GHOST", "POISON"],
		"MOVES": {
			"LICK": {
				"TYPE": "GHOST"
			},
			"CONFUSE RAY": {
				"TYPE": "GHOST"
			},
			"NIGHT SHADE": {
				"TYPE": "GHOST"
			},
			"HYPNOSIS": {
				"TYPE": "PSYCHIC"
			},
			"DREAM EATER": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"ONIX": {
		"INDEX": 95,
		"TYPE": ["ROCK", "GROUND"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			},
			"BIND": {
				"TYPE": "NORMAL"
			},
			"ROCK THROW": {
				"TYPE": "ROCK"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			},
			"SLAM": {
				"TYPE": "NORMAL"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			}
		}
	},
	"DROWZEE": {
		"INDEX": 96,
		"TYPE": ["PSYCHIC"],
		"MOVES": {
			"POUND": {
				"TYPE": "NORMAL"
			},
			"HYPNOSIS": {
				"TYPE": "PSYCHIC"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"HEAD BUTT": {
				"TYPE": "NORMAL"
			},
			"POISON GAS": {
				"TYPE": "POISON"
			},
			"PSYCHIC": {
				"TYPE": "PSYCHIC"
			},
			"MEDITATE": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"HYPNO": {
		"INDEX": 97,
		"TYPE": ["PSYCHIC"],
		"MOVES": {
			"POUND": {
				"TYPE": "NORMAL"
			},
			"HYPNOSIS": {
				"TYPE": "PSYCHIC"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"HEAD BUTT": {
				"TYPE": "NORMAL"
			},
			"POISON GAS": {
				"TYPE": "POISON"
			},
			"PSYCHIC": {
				"TYPE": "PSYCHIC"
			},
			"MEDITATE": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"KRABBY": {
		"INDEX": 98,
		"TYPE": ["WATER"],
		"MOVES": {
			"BUBBLE": {
				"TYPE": "WATER"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"VICEGRIP": {
				"TYPE": "NORMAL"
			},
			"GUILLOTINE": {
				"TYPE": "NORMAL"
			},
			"STOMP": {
				"TYPE": "NORMAL"
			},
			"CRAB HAMMER": {
				"TYPE": "WATER"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			}
		}
	},
	"KINGLER": {
		"INDEX": 99,
		"TYPE": ["WATER"],
		"MOVES": {
			"BUBBLE": {
				"TYPE": "WATER"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"VICEGRIP": {
				"TYPE": "NORMAL"
			},
			"GUILLOTINE": {
				"TYPE": "NORMAL"
			},
			"STOMP": {
				"TYPE": "NORMAL"
			},
			"CRAB HAMMER": {
				"TYPE": "WATER"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			}
		}
	},
	"VOLTORB": {
		"INDEX": 100,
		"TYPE": ["ELECTRIC"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			},
			"SONICBOOM": {
				"TYPE": "NORMAL"
			},
			"SELF DESTRUCT": {
				"TYPE": "NORMAL"
			},
			"LIGHT SCREEN": {
				"TYPE": "PSYCHIC"
			},
			"SWIFT": {
				"TYPE": "NORMAL"
			},
			"EXPLOSION": {
				"TYPE": "NORMAL"
			}
		}
	},
	"ELECTRODE": {
		"INDEX": 101,
		"TYPE": ["ELECTRIC"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			},
			"SONICBOOM": {
				"TYPE": "NORMAL"
			},
			"SELF DESTRUCT": {
				"TYPE": "NORMAL"
			},
			"LIGHT SCREEN": {
				"TYPE": "PSYCHIC"
			},
			"SWIFT": {
				"TYPE": "NORMAL"
			},
			"EXPLOSION": {
				"TYPE": "NORMAL"
			}
		}
	},
	"EXEGGCUTE": {
		"INDEX": 102,
		"TYPE": ["GRASS", "PSYCHIC"],
		"MOVES": {
			"BARRAGE": {
				"TYPE": "NORMAL"
			},
			"HYPNOSIS": {
				"TYPE": "PSYCHIC"
			},
			"REFLECT": {
				"TYPE": "PSYCHIC"
			},
			"LEECH SEED": {
				"TYPE": "GRASS"
			},
			"STUN SPORE": {
				"TYPE": "GRASS"
			},
			"POISON POWDER": {
				"TYPE": "POISON"
			},
			"SOLAR BEAM": {
				"TYPE": "GRASS"
			},
			"SLEEP POWDER": {
				"TYPE": "GRASS"
			}
		}
	},
	"EXEGGUTOR": {
		"INDEX": 103,
		"TYPE": ["GRASS", "PSYCHIC"],
		"MOVES": {
			"BARRAGE": {
				"TYPE": "NORMAL"
			},
			"HYPNOSIS": {
				"TYPE": "PSYCHIC"
			},
			"STOMP": {
				"TYPE": "NORMAL"
			}
		}
	},
	"CUBONE": {
		"INDEX": 104,
		"TYPE": ["GROUND"],
		"MOVES": {
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"BONE CLUB": {
				"TYPE": "GROUND"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"HEADBUTT": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"THRASH": {
				"TYPE": "NORMAL"
			},
			"BONEMERANG": {
				"TYPE": "GROUND"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			}
		}
	},
	"MAROWAK": {
		"INDEX": 105,
		"TYPE": ["GROUND"],
		"MOVES": {
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"BONE CLUB": {
				"TYPE": "GROUND"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"HEADBUTT": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"THRASH": {
				"TYPE": "NORMAL"
			},
			"BONEMERANG": {
				"TYPE": "GROUND"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			}
		}
	},
	"HITMONLEE": {
		"INDEX": 106,
		"TYPE": ["FIGHTING"],
		"MOVES": {
			"DOUBLE KICK": {
				"TYPE": "NORMAL"
			},
			"MEDITATE": {
				"TYPE": "PSYCHIC"
			},
			"ROLLING KICK": {
				"TYPE": "FIGHTING"
			},
			"JUMP KICK": {
				"TYPE": "FIGHTING"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"HI JUMP KICK": {
				"TYPE": "FIGHTING"
			},
			"MEGA KICK": {
				"TYPE": "NORMAL"
			}
		}
	},
	"HITMONCHAN": {
		"INDEX": 107,
		"TYPE": ["FIGHTING"],
		"MOVES": {
			"COMET PUNCH": {
				"TYPE": "NORMAL"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"FIRE PUNCH": {
				"TYPE": "FIRE"
			},
			"ICE PUNCH": {
				"TYPE": "ICE"
			},
			"THUNDER PUNCH": {
				"TYPE": "ELECTRIC"
			},
			"MEGA PUNCH": {
				"TYPE": "NORMAL"
			},
			"COUNTER": {
				"TYPE": "FIGHTING"
			}
		}
	},
	"LICKITUNG": {
		"INDEX": 108,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"WRAP": {
				"TYPE": "NORMAL"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"STOMP": {
				"TYPE": "NORMAL"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"DEFENSE CURL": {
				"TYPE": "NORMAL"
			},
			"SLAM": {
				"TYPE": "NORMAL"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			}
		}
	},
	"KOFFING": {
		"INDEX": 109,
		"TYPE": ["POISON"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SMOG": {
				"TYPE": "POISON"
			},
			"SLUDGE": {
				"TYPE": "POISON"
			},
			"SMOKE SCREEN": {
				"TYPE": "NORMAL"
			},
			"SELF DESTRUCT": {
				"TYPE": "NORMAL"
			},
			"HAZE": {
				"TYPE": "ICE"
			},
			"EXPLOSION": {
				"TYPE": "NORMAL"
			}
		}
	},
	"WEEZING": {
		"INDEX": 110,
		"TYPE": ["POISON"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SMOG": {
				"TYPE": "POISON"
			},
			"SLUDGE": {
				"TYPE": "POISON"
			},
			"SMOKE SCREEN": {
				"TYPE": "NORMAL"
			},
			"SELF DESTRUCT": {
				"TYPE": "NORMAL"
			},
			"HAZE": {
				"TYPE": "ICE"
			},
			"EXPLOSION": {
				"TYPE": "NORMAL"
			}
		}
	},
	"RHYHORN": {
		"INDEX": 111,
		"TYPE": ["GROUND", "ROCK"],
		"MOVES": {
			"HORN ATTACK": {
				"TYPE": "NORMAL"
			},
			"STOMP": {
				"TYPE": "NORMAL"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"FURY ATTACK": {
				"TYPE": "NORMAL"
			},
			"HORN DRILL": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"TAKE DOWN": {
				"TYPE": "NORMAL"
			}
		}
	},
	"RHYDON": {
		"INDEX": 112,
		"TYPE": ["GROUND", "ROCK"],
		"MOVES": {
			"HORN ATTACK": {
				"TYPE": "NORMAL"
			},
			"STOMP": {
				"TYPE": "NORMAL"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"FURY ATTACK": {
				"TYPE": "NORMAL"
			},
			"HORN DRILL": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"TAKE DOWN": {
				"TYPE": "NORMAL"
			}
		}
	},
	"CHANSEY": {
		"INDEX": 113,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"POUND": {
				"TYPE": "NORMAL"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"DOUBLESLAP": {
				"TYPE": "NORMAL"
			},
			"SING": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"MINIMIZE": {
				"TYPE": "NORMAL"
			},
			"DEFENSE CURL": {
				"TYPE": "NORMAL"
			},
			"LIGHT SCREEN": {
				"TYPE": "PSYCHIC"
			},
			"DOUBLE-EDGE": {
				"TYPE": "NORMAL"
			}
		}
	},
	"TANGELA": {
		"INDEX": 114,
		"TYPE": ["GRASS"],
		"MOVES": {
			"CONSTRICT": {
				"TYPE": "NORMAL"
			},
			"BIND": {
				"TYPE": "NORMAL"
			},
			"ABSORB": {
				"TYPE": "GRASS"
			},
			"VINE WHIP": {
				"TYPE": "GRASS"
			},
			"POISON POWDER": {
				"TYPE": "POISON"
			},
			"STUN SPORE": {
				"TYPE": "GRASS"
			},
			"SLEEP POWDER": {
				"TYPE": "GRASS"
			},
			"GROWTH": {
				"TYPE": "NORMAL"
			}
		}
	},
	"KANGASKHAN": {
		"INDEX": 115,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"COMET PUNCH": {
				"TYPE": "NORMAL"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"MEGA PUNCH": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"DIZZY PUNCH": {
				"TYPE": "NORMAL"
			}
		}
	},
	"HORSEA": {
		"INDEX": 116,
		"TYPE": ["WATER"],
		"MOVES": {
			"BUBBLE": {
				"TYPE": "WATER"
			},
			"SMOKE SCREEN": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"SEADRA": {
		"INDEX": 117,
		"TYPE": ["WATER"],
		"MOVES": {
			"BUBBLE": {
				"TYPE": "WATER"
			},
			"SMOKE SCREEN": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"GOLDEEN": {
		"INDEX": 118,
		"TYPE": ["WATER"],
		"MOVES": {
			"PECK": {
				"TYPE": "FLYING"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"HORN ATTACK": {
				"TYPE": "NORMAL"
			},
			"FURY ATTACK": {
				"TYPE": "NORMAL"
			},
			"WATERFALL": {
				"TYPE": "WATER"
			},
			"HORN DRILL": {
				"TYPE": "NORMAL"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"SEAKING": {
		"INDEX": 119,
		"TYPE": ["WATER"],
		"MOVES": {
			"PECK": {
				"TYPE": "FLYING"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"HORN ATTACK": {
				"TYPE": "NORMAL"
			},
			"FURY ATTACK": {
				"TYPE": "NORMAL"
			},
			"WATERFALL": {
				"TYPE": "WATER"
			},
			"HORN DRILL": {
				"TYPE": "NORMAL"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"STARYU": {
		"INDEX": 120,
		"TYPE": ["WATER"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"RECOVER": {
				"TYPE": "NORMAL"
			},
			"SWIFT": {
				"TYPE": "NORMAL"
			},
			"MINIMIZE": {
				"TYPE": "NORMAL"
			},
			"LIGHT SCREEN": {
				"TYPE": "PSYCHIC"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"STARMIE": {
		"INDEX": 121,
		"TYPE": ["WATER"],
		"MOVES": {}
	},
	"MR. MIME": {
		"INDEX": 122,
		"TYPE": ["PSYCHIC"],
		"MOVES": {
			"BARRIER": {
				"TYPE": "PSYCHIC"
			},
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"LIGHT SCREEN": {
				"TYPE": "PSYCHIC"
			},
			"DOUBLESLAP": {
				"TYPE": "NORMAL"
			},
			"MEDITATE": {
				"TYPE": "PSYCHIC"
			},
			"SUBSTITUTE": {
				"TYPE": "NORMAL"
			}
		}
	},
	"SCYTHER": {
		"INDEX": 123,
		"TYPE": ["BUG", "FLYING"],
		"MOVES": {
			"QUICK ATTACK": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"DOUBLE TEAM": {
				"TYPE": "NORMAL"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"SWORDS DANCE": {
				"TYPE": "NORMAL"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"WING ATTACK": {
				"TYPE": "FLYING"
			}
		}
	},
	"JYNX": {
		"INDEX": 124,
		"TYPE": ["ICE", "PSYCHIC"],
		"MOVES": {
			"POUND": {
				"TYPE": "NORMAL"
			},
			"LOVELY KISS": {
				"TYPE": "NORMAL"
			},
			"LICK": {
				"TYPE": "GHOST"
			},
			"DOUBLE SLAP": {
				"TYPE": "NORMAL"
			},
			"ICE PUNCH": {
				"TYPE": "ICE"
			},
			"BODY SLAM": {
				"TYPE": "NORMAL"
			},
			"THRASH": {
				"TYPE": "NORMAL"
			},
			"BLIZZARD": {
				"TYPE": "ICE"
			}
		}
	},
	"ELECTABUZZ": {
		"INDEX": 125,
		"TYPE": ["ELECTRIC"],
		"MOVES": {
			"QUICK ATTACK": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"THUNDERSHOCK": {
				"TYPE": "ELECTRIC"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			},
			"THUNDER PUNCH": {
				"TYPE": "ELECTRIC"
			},
			"LIGHT SCREEN": {
				"TYPE": "PSYCHIC"
			},
			"THUNDER": {
				"TYPE": "ELECTRIC"
			}
		}
	},
	"MAGMAR": {
		"INDEX": 126,
		"TYPE": ["FIRE"],
		"MOVES": {
			"EMBER": {
				"TYPE": "FIRE"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"CONFUSE RAY": {
				"TYPE": "GHOST"
			},
			"FIRE PUNCH": {
				"TYPE": "FIRE"
			},
			"SMOKE SCREEN": {
				"TYPE": "NORMAL"
			},
			"SMOG": {
				"TYPE": "POISON"
			},
			"FLAMETHROWER": {
				"TYPE": "FIRE"
			}
		}
	},
	"PINSIR": {
		"INDEX": 127,
		"TYPE": ["BUG"],
		"MOVES": {
			"VICEGRIP": {
				"TYPE": "NORMAL"
			},
			"BIND": {
				"TYPE": "NORMAL"
			},
			"SEISMIC TOSS": {
				"TYPE": "FIGHTING"
			},
			"GUILLOTINE": {
				"TYPE": "NORMAL"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"SWORDS DANCE": {
				"TYPE": "NORMAL"
			}
		}
	},
	"TAUROS": {
		"INDEX": 128,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"STOMP": {
				"TYPE": "NORMAL"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			},
			"TAKE DOWN": {
				"TYPE": "NORMAL"
			}
		}
	},
	"MAGIKARP": {
		"INDEX": 129,
		"TYPE": ["WATER"],
		"MOVES": {
			"SPLASH": {
				"TYPE": "WATER"
			},
			"TACKLE": {
				"TYPE": "NORMAL"
			}
		}
	},
	"GYARADOS": {
		"INDEX": 130,
		"TYPE": ["WATER", "FLYING"],
		"MOVES": {
			"SPLASH": {
				"TYPE": "WATER"
			},
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"DRAGON RAGE": {
				"TYPE": "DRAGON"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			},
			"HYPER BEAM": {
				"TYPE": "NORMAL"
			}
		}
	},
	"LAPRAS": {
		"INDEX": 131,
		"TYPE": ["WATER", "ICE"],
		"MOVES": {
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"SING": {
				"TYPE": "NORMAL"
			},
			"MIST": {
				"TYPE": "ICE"
			},
			"BODY SLAM": {
				"TYPE": "NORMAL"
			},
			"CONFUSE RAY": {
				"TYPE": "GHOST"
			},
			"ICE BEAM": {
				"TYPE": "ICE"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"DITTO": {
		"INDEX": 132,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"TRANSFORM": {
				"TYPE": "NORMAL"
			}
		}
	},
	"EEVEE": {
		"INDEX": 133,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SAND-ATTACK": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"QUICK ATTACK": {
				"TYPE": "NORMAL"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"FOCUS ENERGY": {
				"TYPE": "NORMAL"
			},
			"TAKE DOWN": {
				"TYPE": "NORMAL"
			}
		}
	},
	"VAPOREON": {
		"INDEX": 134,
		"TYPE": ["WATER"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SAND-ATTACK": {
				"TYPE": "NORMAL"
			},
			"QUICK ATTACK": {
				"TYPE": "NORMAL"
			},
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"AURORA BEAM": {
				"TYPE": "ICE"
			},
			"HAZE": {
				"TYPE": "ICE"
			},
			"ACID ARMOR": {
				"TYPE": "POISON"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"JOLTEON": {
		"INDEX": 135,
		"TYPE": ["ELECTRIC"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SAND-ATTACK": {
				"TYPE": "NORMAL"
			},
			"QUICK ATTACK": {
				"TYPE": "NORMAL"
			},
			"THUNDERSHOCK": {
				"TYPE": "ELECTRIC"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"DOUBLE KICK": {
				"TYPE": "FIGHTING"
			},
			"PIN MISSILE": {
				"TYPE": "BUG"
			},
			"THUNDER WAVE": {
				"TYPE": "ELECTRIC"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"THUNDER": {
				"TYPE": "ELECTRIC"
			}
		}
	},
	"FLAREON": {
		"INDEX": 136,
		"TYPE": ["FIRE"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SAND-ATTACK": {
				"TYPE": "NORMAL"
			},
			"QUICK ATTACK": {
				"TYPE": "NORMAL"
			},
			"EMBER": {
				"TYPE": "FIRE"
			},
			"TAIL WHIP": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"FIRE SPIN": {
				"TYPE": "FIRE"
			},
			"SMOG": {
				"TYPE": "POISON"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FLAMETHROWER": {
				"TYPE": "FIRE"
			}
		}
	},
	"PORYGON": {
		"INDEX": 137,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"SHARPEN": {
				"TYPE": "NORMAL"
			},
			"CONVERSION": {
				"TYPE": "NORMAL"
			},
			"PSYBEAM": {
				"TYPE": "PSYCHIC"
			},
			"RECOVER": {
				"TYPE": "PSYCHIC"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"TRI ATTACK": {
				"TYPE": "NORMAL"
			}
		}
	},
	"OMANYTE": {
		"INDEX": 138,
		"TYPE": ["ROCK", "WATER"],
		"MOVES": {
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"WITHDRAW": {
				"TYPE": "WATER"
			},
			"HORN ATTACK": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"SPIKE CANNON": {
				"TYPE": "NORMAL"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"OMASTAR": {
		"INDEX": 139,
		"TYPE": ["ROCK", "WATER"],
		"MOVES": {
			"WATER GUN": {
				"TYPE": "WATER"
			},
			"WITHDRAW": {
				"TYPE": "WATER"
			},
			"HORN ATTACK": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"SPIKE CANNON": {
				"TYPE": "NORMAL"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"KABUTO": {
		"INDEX": 140,
		"TYPE": ["ROCK", "WATER"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"ABSORB": {
				"TYPE": "GRASS"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"KABUTOPS": {
		"INDEX": 141,
		"TYPE": ["ROCK", "WATER"],
		"MOVES": {
			"SCRATCH": {
				"TYPE": "NORMAL"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"ABSORB": {
				"TYPE": "GRASS"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"HYDRO PUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"AERODACTYL": {
		"INDEX": 142,
		"TYPE": ["ROCK", "FLYING"],
		"MOVES": {
			"WING ATTACK": {
				"TYPE": "FLYING"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"TAKE DOWN": {
				"TYPE": "NORMAL"
			},
			"HYPER BEAM": {
				"TYPE": "NORMAL"
			}
		}
	},
	"SNORLAX": {
		"INDEX": 143,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"HEAD BUTT": {
				"TYPE": "NORMAL"
			},
			"AMNESIA": {
				"TYPE": "PSYCHIC"
			},
			"REST": {
				"TYPE": "PSYCHIC"
			},
			"BODY SLAM": {
				"TYPE": "NORMAL"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"DOUBLE-EDGE": {
				"TYPE": "NORMAL"
			},
			"HYPER BEAM": {
				"TYPE": "NORMAL"
			}
		}
	},
	"ARTICUNO": {
		"INDEX": 144,
		"TYPE": ["ICE", "FLYING"],
		"MOVES": {
			"PECK": {
				"TYPE": "FLYING"
			},
			"ICE BEAM": {
				"TYPE": "ICE"
			},
			"BLIZZARD": {
				"TYPE": "ICE"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"MIST": {
				"TYPE": "ICE"
			}
		}
	},
	"ZAPDOS": {
		"INDEX": 145,
		"TYPE": ["ELECTRIC", "FLYING"],
		"MOVES": {
			"THUNDERSHOCK": {
				"TYPE": "ELECTRIC"
			},
			"DRILL PECK": {
				"TYPE": "FLYING"
			},
			"THUNDER": {
				"TYPE": "ELECTRIC"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"LIGHT SCREEN": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"MOLTRES": {
		"INDEX": 146,
		"TYPE": ["FIRE", "FLYING"],
		"MOVES": {
			"PECK": {
				"TYPE": "FLYING"
			},
			"FIRE SPIN": {
				"TYPE": "FIRE"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"SKY ATTACK": {
				"TYPE": "FLYING"
			}
		}
	},
	"DRATINI": {
		"INDEX": 147,
		"TYPE": ["DRAGON"],
		"MOVES": {
			"WRAP": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"THUNDER WAVE": {
				"TYPE": "ELECTRIC"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"SLAM": {
				"TYPE": "NORMAL"
			},
			"DRAGON RAGE": {
				"TYPE": "DRAGON"
			},
			"HYPER BEAM": {
				"TYPE": "NORMAL"
			}
		}
	},
	"DRAGONAIR": {
		"INDEX": 148,
		"TYPE": ["DRAGON"],
		"MOVES": {
			"WRAP": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"THUNDER WAVE": {
				"TYPE": "ELECTRIC"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"SLAM": {
				"TYPE": "NORMAL"
			},
			"DRAGON RAGE": {
				"TYPE": "DRAGON"
			},
			"HYPER BEAM": {
				"TYPE": "NORMAL"
			}
		}
	},
	"DRAGONITE": {
		"INDEX": 149,
		"TYPE": ["DRAGON", "FLYING"],
		"MOVES": {
			"WRAP": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"THUNDER WAVE": {
				"TYPE": "ELECTRIC"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"SLAM": {
				"TYPE": "NORMAL"
			},
			"DRAGON RAGE": {
				"TYPE": "DRAGON"
			},
			"HYPER BEAM": {
				"TYPE": "NORMAL"
			}
		}
	},
	"MEWTWO": {
		"INDEX": 150,
		"TYPE": ["PSYCHIC"],
		"MOVES": {
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"SWIFT": {
				"TYPE": "NORMAL"
			},
			"BARRIER": {
				"TYPE": "PSYCHIC"
			},
			"PSYCHIC": {
				"TYPE": "PSYCHIC"
			},
			"RECOVER": {
				"TYPE": "PSYCHIC"
			},
			"MIST": {
				"TYPE": "ICE"
			},
			"AMNESIA": {
				"TYPE": "PSYCHIC"
			}
		}
	},
	"MEW": {
		"INDEX": 151,
		"TYPE": ["PSYCHIC"],
		"MOVES": {
			"POUND": {
				"TYPE": "NORMAL"
			},
			"TRANSFORM": {
				"TYPE": "NORMAL"
			},
			"MEGA PUNCH": {
				"TYPE": "NORMAL"
			},
			"METRONOME": {
				"TYPE": "NORMAL"
			},
			"PSYCHIC": {
				"TYPE": "PSYCHIC"
			}
		}
	}
}

info.typeChart = {

  "NORMAL": {

     "NORMAL": 1,
     "FIGHTING": 1,
     "FLYING": 1,
     "POISON": 1,
     "GROUND": 1,
     "ROCK": 0.5,
     "BUG": 1,
     "GHOST": 0,
     "FIRE": 1,
     "WATER": 1,
     "GRASS": 1,
     "ELECTRIC": 1,
     "PSYCHIC": 1,
     "ICE": 1,
     "DRAGON": 1

  },

  "FIGHTING": {

     "NORMAL": 2,
     "FIGHTING": 1,
     "FLYING": 0.5,
     "POISON": 0.5,
     "GROUND": 1,
     "ROCK": 2,
     "BUG": 0.5,
     "GHOST": 0,
     "FIRE": 1,
     "WATER": 1,
     "GRASS": 1,
     "ELECTRIC": 1,
     "PSYCHIC": 0.5,
     "ICE": 2,
     "DRAGON": 1

   },

  "FLYING": {

     "NORMAL": 1,
     "FIGHTING": 2,
     "FLYING": 1,
     "POISON": 1,
     "GROUND": 1,
     "ROCK": 0.5,
     "BUG": 2,
     "GHOST": 1,
     "FIRE": 1,
     "WATER": 1,
     "GRASS": 2,
     "ELECTRIC": 0.5,
     "PSYCHIC": 1,
     "ICE": 1,
     "DRAGON": 1

   },

  "POISON": {

     "NORMAL": 1,
     "FIGHTING": 1,
     "FLYING": 1,
     "POISON": 0.5,
     "GROUND": 0.5,
     "ROCK": 0.5,
     "BUG": 2,
     "GHOST": 0.5,
     "FIRE": 1,
     "WATER": 1,
     "GRASS": 2,
     "ELECTRIC": 1,
     "PSYCHIC": 1,
     "ICE": 1,
     "DRAGON": 1

   },

  "GROUND": {

     "NORMAL": 1,
     "FIGHTING": 1,
     "FLYING": 0,
     "POISON": 2,
     "GROUND": 1,
     "ROCK": 2,
     "BUG": 0.5,
     "GHOST": 1,
     "FIRE": 2,
     "WATER": 1,
     "GRASS": 0.5,
     "ELECTRIC": 2,
     "PSYCHIC": 1,
     "ICE": 1,
     "DRAGON": 1

   },

  "ROCK": {

     "NORMAL": 1,
     "FIGHTING": 0.5,
     "FLYING": 2,
     "POISON": 1,
     "GROUND": 0.5,
     "ROCK": 1,
     "BUG": 2,
     "GHOST": 1,
     "FIRE": 2,
     "WATER": 1,
     "GRASS": 1,
     "ELECTRIC": 1,
     "PSYCHIC": 1,
     "ICE": 2,
     "DRAGON": 1

   },

  "BUG": {

     "NORMAL": 1,
     "FIGHTING": 0.5,
     "FLYING": 0.5,
     "POISON": 2,
     "GROUND": 1,
     "ROCK": 1,
     "BUG": 1,
     "GHOST": 0.5,
     "FIRE": 0.5,
     "WATER": 1,
     "GRASS": 2,
     "ELECTRIC": 1,
     "PSYCHIC": 2,
     "ICE": 1,
     "DRAGON": 1

   },

  "GHOST": {

     "NORMAL": 0,
     "FIGHTING": 1,
     "FLYING": 1,
     "POISON": 1,
     "GROUND": 1,
     "ROCK": 1,
     "BUG": 1,
     "GHOST": 2,
     "FIRE": 1,
     "WATER": 1,
     "GRASS": 1,
     "ELECTRIC": 1,
     "PSYCHIC": 0,
     "ICE": 1,
     "DRAGON": 1

   },
  
  "FIRE": {

     "NORMAL": 1,
     "FIGHTING": 1,
     "FLYING": 1,
     "POISON": 1,
     "GROUND": 1,
     "ROCK": 0.5,
     "BUG": 2,
     "GHOST": 1,
     "FIRE": 0.5,
     "WATER": 0.5,
     "GRASS": 2,
     "ELECTRIC": 1,
     "PSYCHIC": 1,
     "ICE": 2,
     "DRAGON": 0.5

   },

  "WATER": {

     "NORMAL": 1,
     "FIGHTING": 1,
     "FLYING": 1,
     "POISON": 1,
     "GROUND": 2,
     "ROCK": 2,
     "BUG": 1,
     "GHOST": 1,
     "FIRE": 2,
     "WATER": 0.5,
     "GRASS": 0.5,
     "ELECTRIC": 1,
     "PSYCHIC": 1,
     "ICE": 1,
     "DRAGON": 0.5

   },

  "GRASS": {

     "NORMAL": 1,
     "FIGHTING": 1,
     "FLYING": 0.5,
     "POISON": 0.5,
     "GROUND": 2,
     "ROCK": 2,
     "BUG": 0.5,
     "GHOST": 1,
     "FIRE": 0.5,
     "WATER": 2,
     "GRASS": 0.5,
     "ELECTRIC": 1,
     "PSYCHIC": 1,
     "ICE": 1,
     "DRAGON": 0.5

   },

  "ELECTRIC": {

     "NORMAL": 1,
     "FIGHTING": 1,
     "FLYING": 2,
     "POISON": 1,
     "GROUND": 0,
     "ROCK": 1,
     "BUG": 1,
     "GHOST": 1,
     "FIRE": 1,
     "WATER": 2,
     "GRASS": 0.5,
     "ELECTRIC": 0.5,
     "PSYCHIC": 1,
     "ICE": 1,
     "DRAGON": 0.5

   },

  "PSYCHIC": {

     "NORMAL": 1,
     "FIGHTING": 2,
     "FLYING": 1,
     "POISON": 2,
     "GROUND": 1,
     "ROCK": 1,
     "BUG": 1,
     "GHOST": 1,
     "FIRE": 1,
     "WATER": 1,
     "GRASS": 1,
     "ELECTRIC": 1,
     "PSYCHIC": 0.5,
     "ICE": 1,
     "DRAGON": 1

   },

  "ICE": {

     "NORMAL": 1,
     "FIGHTING": 1,
     "FLYING": 2,
     "POISON": 1,
     "GROUND": 2,
     "ROCK": 1,
     "BUG": 1,
     "GHOST": 1,
     "FIRE": 1,
     "WATER": 0.5,
     "GRASS": 2,
     "ELECTRIC": 1,
     "PSYCHIC": 1,
     "ICE": 0.5,
     "DRAGON": 2

   },

  "DRAGON": {

     "NORMAL": 1,
     "FIGHTING": 1,
     "FLYING": 1,
     "POISON": 1,
     "GROUND": 1,
     "ROCK": 1,
     "BUG": 1,
     "GHOST": 1,
     "FIRE": 1,
     "WATER": 1,
     "GRASS": 1,
     "ELECTRIC": 1,
     "PSYCHIC": 1,
     "ICE": 1,
     "DRAGON": 2

   }

}

},{}],14:[function(_dereq_,module,exports){
var errors = _dereq_('../errors/errors.js');

var translator = {};

module.exports = translator;

translator.moves = {
  'TACKLE': 'push',
  'EMBER': '+',
  'WATERGUN': '-',
  'FLAMETHROWER': '*',
  'HYDROPUMP': '/',
  'POUND': '==',
  'HEADBUTT': '>',
  'BITE': '>=',
  'HORNATTACK': '<=',
  'BODY SLAM': '<',
  'THUNDERSHOCK': '{',
  'THUNDERBOLT': '}',
  'THUNDER': 'exec',
  'CONFUSION': 'store',
  'PSYBEAM': 'load',
  'EARTHQUAKE': 'ifelse', 
  'SCRATCH': 'while', 
  'ROCKTHROW': 'dup',
  'VINEWHIP': 'swap',
  'RAZORLEAF': 'rot3',
  'MEGAPUNCH': '[',
  'THUNDERPUNCH': ']',
  'FIREPUNCH': 'get',
  'ICEPUNCH': 'put',
  'ROLLINGKICK': 'append',
  'JUMPKICK': 'arrpop',
  'HIJUMPKICK': 'map',
  'MEGAKICK': 'fold',
  'POISONSTING': 'pop',
  'SLASH': 'out'
}

var reverseMoves = (function() {

  var reverse = {};

  for (key in translator.translate) {

    reverse[translator.translate[key]] = key;

  }

  return reverse;

})();

translator.reverseMoves = reverseMoves;

var translateList = function(list) {

  var output = [];

  for (var i = 0; i < list.length; i++) {

    output.push(translator.translate(list[i]));

  }

  return output;

}

translator.translateList = translateList;

var translate = function(key) {

  if (translator.moves[key]) {
  
    return translator.moves[key];

  } else {

    throw new errors.invalidMove(key);

  }

}

translator.translate = translate;

var join = function(list) {

  return list.join(' ');

}

translator.join = join;


},{"../errors/errors.js":8}],15:[function(_dereq_,module,exports){
var info = _dereq_('./pokedex.js');
var translator = _dereq_('./translator.js');
var errors = _dereq_('../errors/errors.js');

var Walker = {};

module.exports = Walker;

var ast,
    translate_flag = false,
    init_flag = false,
    output = [],
    visitors = {},
    battle = {};

var init = function() {

  if (init_flag) {

    return;

  }

  initVisitors();
  
  init_flag = true;
 
}

Walker.init = init;

var walk = function(ast, flag) {

  resetBattle();

  translate_flag = !!flag;

  if (ast && ast.length) {

    visit('prog', ast);

  }

  if (translate_flag) {

    output = output.join(' ');

  }

  return output;

}

Walker.walk = walk;

var visit = function(name, args) {

  visitors[name].apply(null, args);

}

var initVisitors = function() {

  // prog: start_battle ending

  createVisitor('prog', function($$, $1, $2) {

    expect('PROG', $$);

    visit('start_battle', $1); 

    visit('ending', [$2]); 

  });

  // start_battle: goPokemon NEWLINE foePokemon
 
  createVisitor('start_battle', function($$, $1, $3) {

    expect('START', $$);

    visit('goPokemon', $1); 

    visit('foePokemon', $3); 

  });

  // turns: turn ending

  createVisitor('turns', function($$, $1, $2) {

    expect('CONCAT', $$);

    visit('turn', $1); 

    visit('ending', [$2]); 

  });

  // ending: NEWLINE turns | NEWLINE
  
  createVisitor('ending', function($$) {

    if ($$) {

      visit('turns', $$);

    }

  });

  // turn: selfturn | enemyTurn | enemySwitchPokemon | selfSwitchPokemon | effect1

  createVisitor('turn', function($$, $1, $2, $3) {

     switch ($$) {

       case 'SELFTURN':
         visit('selfTurn', [$$, $1, $2]);
         break;
       
       case 'ENEMYTURN':
         visit('enemyTurn', [$$, $1, $2]);
         break;

       case 'ENEMYSWITCHPOKEMON':
         visit('enemySwitchPokemon', [$$, $1, $2, $3]);
         break;

       case 'SELFSWITCHPOKEMON':
         visit('selfSwitchPokemon', [$$, $1, $2]);
         break;
       
       case 'SELFTURN':
         visit('selfTurn', [$$, $1, $2]);
         break;
       
       default:
         visit('effect1', [$$, $1, $2]); 
         break;

     }

   });
   

  createVisitor('goPokemon', function($$, $2) {

    performSelfTurn();

    expect('GO', $$);

    checkPokemon($2);

    battle.selfPokemon = $2;

  });

  createVisitor('foePokemon', function($$, $2, $4) {

    performEnemyTurn();

    expect('SENDS_OUT', $$);

    checkEnemyTrainer($2);

    checkPokemon($4);

    battle.enemyPokemon = $4;

  });

  createVisitor('selfTurn', function($$, $1, $3) {

    performSelfTurn();

    doTurn($1, $3, 'self');

  });

  createVisitor('enemyTurn', function($$, $2, $4) {

    performEnemyTurn();
   
    doTurn($2, $4, 'enemy');

  });

  createVisitor('selfSwitchPokemon', function($$, $1, $6) {

    expect('SELFSWITCHPOKEMON', $$);

    if (battle.selfPokemon != $1) {

      throw errors.wrongPokemon(battle.selfPokemon, $1);

    }

    performSelfTurn();

    checkPokemon($1);

    battle.selfPokemon = $6;

  });

  createVisitor('enemySwitchPokemon', function($$, $2, $4, $7) {

    expect('ENEMYSWITCHPOKEMON', $$);

    if (battle.enemyPokemon != $4) {

      throw errors.wrongPokemon(battle.enemyPokemon, $4);

    }

    performEnemyTurn();

    checkEnemyTrainer($2);

    checkPokemon($7);

    battle.enemyPokemon = $7;

  });

  createVisitor('effect1', function($$) {

    checkEffect($$); 

  });

}

var createVisitor = function(name, callback) {

  visitors[name] = callback;

}

var expect = function(expected, actual) {

  if (expected != actual) {

    throw errors.unexpectedToken(expected, actual);

  }

}

var performTurn = function(turn) {

  if (battle[turn + 'TurnTaken']) {

    throw errors.wrongTurnOrder(turn);

  } 

  battle[turn + 'TurnTaken'] = true;

  if (battle['selfTurnTaken'] && battle['enemyTurnTaken']) {
   
    battle['selfTurnTaken'] = false;
    battle['enemyTurnTaken'] = false;

  }

}

var performSelfTurn = function() {

  performTurn('self');

}

var performEnemyTurn = function() {

  performTurn('enemy');

}

var checkMove = function(move, pokemon) {

  if (!info.pokemon[pokemon]['MOVES'][move]) {

    throw errors.pokemonDoesNotKnowMove(pokemon, move);

  }

}
var turns= 0 ;
var doTurn = function(pokemon, move, turn) {
turns++;
  var target = turn === 'self' ? 'enemy' : 'self';

  if (battle[turn + 'Pokemon'] != pokemon) {

    throw errors.wrongPokemon(battle[turn + 'Pokemon'], pokemon);

  }

  battle.currentPokemon = battle[turn + 'Pokemon'];

  battle.targetPokemon = battle[target + 'Pokemon'];

  checkMove(move, battle[turn + 'Pokemon']);

  battle.currentMove = move;

  if (translate_flag) {

    move = translator.translate(move);

    if (move === 'push') {

      move = info.pokemon[battle[target + 'Pokemon']]['INDEX'];

      if (move === 151) {

        move = 0;

      }

    }

  }

  output.push(move);

};

var checkEnemyTrainer = function(trainer) {

  if (!battle.enemyTrainer) {

    battle.enemyTrainer = trainer;

  } else {

    if (battle.enemyTrainer !== trainer) {

      throw errors.wrongEnemyTrainer(battle.enemyTrainer, trainer);

    }

  }

}

var checkPokemon = function(pokemon) {

  if(!info.pokemon[pokemon]) {

    throw errors.unrecognisedPokemon(pokemon);

  }

}

var checkEffect = function(effect) {

  var moveType = info.pokemon[battle.currentPokemon]['MOVES'][battle.currentMove]['TYPE'];

  var modifier = 1;

  var enemyType = info.pokemon[battle.targetPokemon]['TYPE'];  

  for (var i = 0; i < enemyType.length; i++) {

    modifier *= info.typeChart[moveType][enemyType[i]];

  }

  if (modifier == 0) {
  
    if (effect !== 'NO_EFFECT') {

      throw errors.wrongTypeModifier(battle.currentMove, 'NO EFFECT', battle.targetPokemon);

    }

  } else if (modifier < 1) {

    if (effect !== 'NOT_EFFECTIVE') {

      throw errors.wrongTypeModifier(battle.currentMove, 'NOT VERY EFFECTIVE', battle.targetPokemon);

    }
  
  } else if (modifier > 1) {
  
    if (effect !== 'EFFECTIVE') {

      throw errors.wrongTypeModifier(battle.currentMove, 'SUPER EFFECTIVE', battle.targetPokemon);

    }
  
  }

}

var resetBattle = function() {

  battle = {
    enemyTrainer: null,
    selfTurnTaken: false,
    enemyTurnTaken: false,
    currentPokemon: null,
    targetPokemon: null,
    selfPokemon: null,
    enemyPokemon: null,
    currentMove: null
  };

  output = [];

}

},{"../errors/errors.js":8,"./pokedex.js":13,"./translator.js":14}]},{},[7])
(7)
});