!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.pokelang=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
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

exports.isBuffer = require('./support/isBuffer');

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
exports.inherits = require('inherits');

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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":3,"_process":2,"inherits":1}],5:[function(require,module,exports){
var errors = {};

module.exports = errors;

var PokeLangError = function(name, message) {

  this.name = name;

  this.message = message;

}

PokeLangError.prototype = new Error();

PokeLangError.prototype.constructor = PokeLangError;

errors.PokeLangError = PokeLangError;

var createError = function(type) {

  errors[type + 'Error'] = function(name, message, line, pos) {

    line = line ? '@' + line : '';

    this.name = type + 'Error' + line;

    this.errorName = name;
 
    this.message = name + (message ? ' - ' + message : '');

    this.pos = pos;

  }

  errors[type + 'Error'].prototype = new PokeLangError();

  errors[type + 'Error'].prototype.constructor = errors[type + 'Error'];

}

var initErrors = function() {

  errors.errorTypes = ['Battle'
                      ,'Semantic'
                      ,'Syntax'
                      ,'Interpreter'
                      ];

  for (var i = 0; i < errors.errorTypes.length; i++) {

    createError(errors.errorTypes[i]);

  }

}

initErrors();

errors.wrongPokemon = function(expected, actual, line, pos) {

  return new errors.BattleError('Wrong Pokemon', 'Expected: ' + expected + ' Actual: ' + actual, line);

}

errors.wrongTurnOrder = function(turn, line, pos) {

  return new errors.BattleError('Wrong turn order', turn + ' has moved twice before the opponent', line);

}

errors.unexpectedToken = function(expected, actual, line, pos) {
 
  return new errors.SyntaxError('Unexpected token', 'Expected: \'' + expected + '\' Actual: \'' + actual + '\'', line);

}

errors.pokemonDoesNotKnowMove = function(pokemon, move, line, pos) {

    return new errors.BattleError('Pokemon does not know move', 'Pokemon: ' + pokemon + ' Move: ' + move, line);

}

errors.unrecognisedPokemon = function(pokemon, line, pos) {

  return new errors.SyntaxError('Unrecognised Pokemon', pokemon + ' is not a recognised Pokemon', line);

}

errors.missingPunctuation = function(punctuation, line, pos) {

  return new errors.SyntaxError('Missing punctuation', punctuation +  ' expected', line);

}

errors.missingTokens = function(tokens, line, pos) {

  return new errors.SyntaxError('Missing tokens', tokens + ' expected', line);

}

errors.trailingTokens = function(tokens, line, pos) {

  return new errors.SyntaxError('Trailing tokens', '\'' + tokens + '\' unexpected', line);

}

errors.invalidTrainerName = function(actual, expected, line, pos) {

  return new errors.SyntaxError('Invalid trainer name', 'Actual: \'' + actual +  '\' Expected: ' + expected, line);

}

errors.wrongTypeModifier = function(move, effect, pokemon, line, pos) {

  var should = effect === 'NO EFFECT' ? 'have ' : 'be ';

  return new errors.BattleError('Wrong type modifier', move + ' should ' + should + effect + ' on ' + pokemon, line); 

}

errors.invalidMove = function(move, line, pos) {

  return new errors.SyntaxError('Invalid move', move + ' does not have a corresponding instruction', line);

}

errors.unrecognisedMove = function(move, line, pos) {

  return new errors.SyntaxError('Unrecognised move', move + ' is not a valid move', line);

}

errors.blockNotClosed = function(line, pos) {

  return new errors.InterpreterError('Block not closed', line);

}

errors.markNotFound = function(line, pos) {

  return new errors.InterpreterError('Mark not found', line);

}

errors.arrayOutOfBounds = function(size, key, line, pos) {

  return new errors.InterpreterError('Array out of bounds', 'Size: ' + size, ' Key: ' + key, line);

}

errors.symbolNotFound = function(symbol, line, pos) {

  return new errors.InterpreterError('Symbol not found', symbol + ' is not recognised', line);

}

errors.wrongEnemyTrainer = function(expected, actual, line, pos) {

  return new errors.SyntaxError('Wrong enemy trainer', 'Expected: ' + expected + ' Actual: ' + actual, line);

}

errors.missingKey = function(key, line, pos) {
 
  return new errors.InterpreterError('Missing key', 'Key: ' + num + ' does not exist in dictionary', line);

}

errors.stackSizeTooSmall = function(expected, actual, line, pos) {
 
  return new errors.InterpreterError('Stack size too small', 'Expected: ' + expected + ', Actual: ' + actual, line);

}

errors.wrongArgument = function(i, expected, actual, line, pos) {
 
  return new errors.InterpreterError('Wrong argument', 'Argument: ' + i + ' Expected: ' + expected + ', Actual: ' + actual, line);

}

errors.switchNotAllowed = function(trainer, line, pos) {
 
  return new errors.BattleError(trainer + ' switched after opponent Pokemon used move', null, line);

}

errors.noBlockToClose = function(line, pos) {
 
  return new errors.InterpreterError('There is no block to close with }', null, line);

}

errors.missingFoe = function(pokemon, line, pos) {
 
  return new errors.SyntaxError('Did you mean \'Foe ' + pokemon + '\'?', null, line);

}

errors.operationDoesNotHaveCallback = function(op, line, pos) {
 
  return new errors.InterpreterError('Operation ', '\'' + op + '\' does not have a callback', line);

}

errors.unrecognisedOperation = function(op, line, pos) {
 
  return new errors.InterpreterError('Unrecognised Operation', '\'' + op + '\' is not recognised', line);

}

},{}],6:[function(require,module,exports){
var errors = require('../errors/errors.js'),
    instructions = {
      operations: {},
      objects: {},
      opmoves: {},
      objmoves: {}
    },
    I,
    init_flag = false;

module.exports = instructions;

var init = function(interpreter) {

  if (init_flag) {

    return;

  }

  I = interpreter;

  createOpInstructions();

  createObjInstructions();

  init_flag = true;

}

instructions.init = init;

var createOpInstruction = function(name, move, args, callback) {

  instructions.operations[name] = {
    args: args,
    callback: callback
  }

  if (move) {
    instructions.opmoves[move] = name;
  }

}

var createObjInstruction = function(name, move, callback) {

  if (move) {
    instructions.objmoves[move] = callback;
  }

}

var createOpInstructions = function() {

  // Exec

  createOpInstruction('exec', 'THUNDER', ['BLOCK'], function(block) {

    I.execList(block.value);

  });

  // Arithmetic 

  createOpInstruction('+', 'EMBER', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(num1.value + num2.value));

  });

  createOpInstruction('-', 'WATERGUN', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(num1.value - num2.value));

  });

  createOpInstruction('*', 'FLAMETHROWER', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(num1.value * num2.value));

  });

  createOpInstruction('/', 'HYDROPUMP', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(Math.floor(num1.value * num2.value)));

  });

  createOpInstruction('neg', '', ['NUM'], function(num1) {

    I.exec(I.num(-num1.value));

  });

  createOpInstruction('abs', '',  ['NUM'], function(num1) {

    I.exec(I.num(Math.abs(num1.value)));

  });

  // Comparison

  createOpInstruction('>', 'HEADBUTT', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(Number(num1.value > num2.value)));

  });

  createOpInstruction('>=', 'BITE', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(Number(num1.value >= num2.value)));

  });

  createOpInstruction('==', 'POUND', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(Number(num1.value == num2.value)));

  });

  createOpInstruction('<=', 'HORNATTACK', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(Number(num1.value <= num2.value)));

  });

  createOpInstruction('<', 'BODYSLAM', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(Number(num1.value < num2.value)));

  });

  // Stack manipulation

  createOpInstruction('pop', 'POISONSTING', ['*'], function(arg) {

    // do nothing

  });

  createOpInstruction('dup', 'ROCKTHROW', ['*'], function(arg) {

    I.exec(arg);
    I.exec(arg);

  });

  createOpInstruction('swap', 'VINEWHIP', ['*', '*'], function(arg1, arg2) {

    I.exec(arg2);
    I.exec(arg1);

  });

  createOpInstruction('rot3', 'RAZORLEAF', ['*', '*', '*'], function(arg1, arg2, arg3) {

    I.exec(arg3);
    I.exec(arg1);
    I.exec(arg2);

  });

  createOpInstruction('rot4', '', ['*', '*', '*', '*'], function(arg1, arg2, arg3, arg4) {

    I.exec(arg4);
    I.exec(arg1);
    I.exec(arg2);
    I.exec(arg3);

  });

  createOpInstruction('rot5', '', ['*', '*', '*', '*', '*'], function(arg1, arg2, arg3, arg4, arg5) {

    I.exec(arg5);
    I.exec(arg1);
    I.exec(arg2);
    I.exec(arg3);
    I.exec(arg4);

  });

  // Control Flow

  createOpInstruction('ifelse', 'EARTHQUAKE', ['NUM', 'BLOCK', 'BLOCK'], function(num1, block1, block2) {

    if (I.test(num1.value)) {

      I.execList(block1.value);

    } else {

      I.execList(block2.value);

    }

  });

  createOpInstruction('while', 'SCRATCH', ['BLOCK', 'BLOCK'], function(block1, block2) {

    I.execList(block1.value);

    I.exec(block1);

    I.exec(block2);

    I.exec(I.operation('_while')); 

  });

  createOpInstruction('_while', '', ['NUM', 'BLOCK', 'BLOCK'], function(num1, block1, block2) {

    if (I.test(num1.value)) {

      I.execList(block2.value);

      I.exec(block1);

      I.exec(block2);

      I.exec(I.operation('while'));

    }

  });

  // Arrays

  createOpInstruction(']', 'THUNDERPUNCH', ['*'], function(arg) {

    if (arg instanceof I.MarkObj) {

      I.exec(I.array([]));

    } else {

      I.exec(I.operation(']'));

      I.exec(arg);

      I.exec(I.operation('append'));

    }

  });

  createOpInstruction('put', 'ICEPUNCH', ['ARRAY', '*', 'NUM'], function(arr, arg, num1) {

    if (num1 < 0 || num1 >= arr.value.size) {

      throw errors.arrayOutOfBounds(arr.value.size, num1);

    }

    arr.value[num1] = arg;

    I.exec(arr);

  });

  createOpInstruction('get', 'FIREPUNCH', ['ARRAY', 'NUM'], function(arr, num1) {

    if (num1 < 0 || num1 >= arr.value.size) {

      throw errors.arrayOutOfBounds(arr.value.size, num1);

    }

    I.exec(arr.value[num1]);

  });

  createOpInstruction('append', 'ROLLINGKICK', ['ARRAY', '*'], function(arr, arg) {

    arr.value.push(arg);

    I.exec(arr);

  });

  createOpInstruction('arrpop', 'JUMPKICK', ['ARRAY'], function(arr) {

    I.exec(arr.value.pop());

  });

  createOpInstruction('map', 'HIJUMPKICK', ['ARRAY', 'BLOCK'], function(arr, block) {

    I.exec(I.mark('['));

    for (var i = 0; i < arr.value.length; i++) {

      I.exec(arr.value[i]);

      I.execList(block.value);

    }

    I.exec(I.operation(']'));

  });

  createOpInstruction('fold', 'MEGAKICK', ['ARRAY', 'BLOCK'], function(arr, block) {

    for (var i = 0; i < arr.value.length; i++) {

      I.exec(arr.value[i]);

      I.execList(block.value);

    }

  });

  // IO

  createOpInstruction('outa', 'LOWKICK', ['NUM'], function(num1) {

    I.out(String.fromCharCode(num1.value));

  });

  createOpInstruction('outi', 'KARATECHOP', ['NUM'], function(num1) {

    I.out(num1.value);

  });

  createOpInstruction('outn', 'SEISMICTOSS', [], function() {

    I.out('\n');

  });

  createOpInstruction('in', 'ACID', [], function() {

    var result = I.input('Input an integer: ', 'Input was not an integer, try again: ', function(data) {

      var match = data.match(/[-]?[0-9]+/);

      return (match && match[0].length === data.length);

    });

    I.exec(I.num(result));

  });

  // Dictionary

  createOpInstruction('store', 'CONFUSION', ['NUM', '*'], function(num1, arg) {

    I.dictionary[num1.value] = arg;

  })

  createOpInstruction('load', 'PSYBEAM', ['NUM'], function(num1, arg) {

    if (I.dictionary[num1.value]) {

      I.exec(I.dictionary[num1.value]);

    } else {

      throw errors.missingKey(num1.value); 
   
    }

  });
}

var createObjInstructions = function() {

  createObjInstruction('[', 'MEGAPUNCH', function() {

    return I.mark('['); 

  });   
  
  createObjInstruction('{', 'THUNDERSHOCK', function() {

    return I.openblock(); 

  });   

  createObjInstruction('}', 'THUNDERBOLT', function() {

    return I.closeblock(); 

  });   

}

},{"../errors/errors.js":5}],7:[function(require,module,exports){
var errors = require('../errors/errors.js'),
    instructions = require('./instructions.js'),
    util = require('util');

var interpreter = {};

// require
module.exports = interpreter;

// state
var stack = [],
    dictionary = [],
    operations = {},
    init_flag = false,
    out,
    num,
    array,
    mark,
    closeblock,
    block,
    battle;

interpreter.dictionary = dictionary;

// initialises the instruction_list
// and calls exec
var run = function(instructions) {

  reset();

  execList(instructions);

  // return the stack
  return stack;

}

interpreter.run = run;

var init = function(b, options) {

  if (init_flag) {

    return;

  }

  battle = b;

  instructions.init(interpreter);

  createOperations();

  initInstrConstructors();

  setOutputFunction(options && options.out);

  setInputFunction(options && options.input);

  init_flag = true;

}

interpreter.init = init;

var reset = function() {

  stack = [];

  dicitonary = [];

}

interpreter.reset = reset;

var execList = function(list) {

  for (var i = 0; i < list.length; i++) {

    exec(list[i]);

  }

}

interpreter.execList = execList;

// shifts the instructions array
// performs the instruction
var exec = function(instr) {

  perform(instr);

}

interpreter.exec = exec;

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

  if (!(operations[op.value])) {

    throw errors.unrecognisedOperation(op.value);

  }

  operations[op.value].apply(null);

}

interpreter.operations = operations;

var test = function(arg) {

  return !!arg;

}

interpreter.test = test;

var createOperation = function(value, def_args, callback) {

  if (!(callback instanceof Function)) {

    throw errors.operationDoesNotHaveCallback(value, battle.getCurrentLine()); 

  }

  operations[value] = function() {

    // check args
    var args = getArgs(def_args);

    callback.apply(null, args);

  }

}

var createOperations = function() {

  for (instr in instructions.operations) {

    createOperation(instr, instructions.operations[instr].args, instructions.operations[instr].callback);

  }

}

var checkStackSize = function(def_args_size) {

  if (stack.length < def_args_size) {

    throw errors.stackSizeTooSmall(def_args_size, stack.length, battle.getCurrentLine());

  }

}

var getArgs = function(def_args) {

  checkStackSize(def_args.length);

  var args = stack.splice(stack.length - def_args.length, def_args.length);

  for (var i = 0; i < def_args.length; i++) {

    if (!checkArg(def_args[i], args[i])) {

      throw errors.wrongArgument(i, def_args[i], args[i].subclass, battle.getCurrentLine()); 
    
    }

  }  
  
  return args;

}

// checks if args match
// subclasses are compared
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

var setOutputFunction = function(func) {

  var output = func instanceof Function ? func : util.print;

  interpreter.out = function(out) {

    output.call(null, out);

  }

}

interpreter.setOutputFunction = setOutputFunction;

var setInputFunction = function(inputFunc) {

  var noFunc = function() {

    interpreter.out('No input function set\n');

    return 0;

  }

  var func = inputFunc || noFunc;

  interpreter.input = function(prompt, error, check) {

    return func.call(null, prompt, error, check);

  }

}

interpreter.setInputFunction = setInputFunction;

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

    this.subclass = subclass.toUpperCase();

  }

  interpreter[objClass].prototype = Object.create(Obj.prototype);
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
  createObjConstructor('Closeblock');
  createObjConstructor('Openblock');
  createObjConstructor('Block', arrToString('{', '}'));
  
  num = interpreter.num;
  array = interpreter.array;
  mark = interpreter.mark;
  closeblock = interpreter.closeblock;
  openblock = interpreter.openblock;
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

Operation.prototype = Object.create(Instruction.prototype);
Operation.prototype.constructor = Operation;

interpreter.Operation = Operation;

var operation = function(value) {

  return new Operation(value);

}

interpreter.operation = operation;

var translateMove = function(move) {

  var instruction;

  if (instructions.opmoves[move]) {

    instruction = operation(instructions.opmoves[move]);

  } else if (instructions.objmoves[move]) {

    instruction = instructions.objmoves[move].apply(null);  

  }

  return instruction;   

}

interpreter.translateMove = translateMove;

var getStack = function() {

  return stack.toString();

}

interpreter.getStack = getStack;

},{"../errors/errors.js":5,"./instructions.js":6,"util":4}],8:[function(require,module,exports){
var pokedex = {};

module.exports = pokedex;

pokedex.pokemon = {
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
			"LEECHSEED": {
				"TYPE": "GRASS"
			},
			"VINEWHIP": {
				"TYPE": "GRASS"
			},
			"POISONPOWDER": {
				"TYPE": "POISON"
			},
			"RAZORLEAF": {
				"TYPE": "GRASS"
			},
			"GROWTH": {
				"TYPE": "NORMAL"
			},
			"SLEEPPOWDER": {
				"TYPE": "GRASS"
			},
			"SOLARBEAM": {
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
			"LEECHSEED": {
				"TYPE": "GRASS"
			},
			"VINEWHIP": {
				"TYPE": "GRASS"
			},
			"POISONPOWDER": {
				"TYPE": "POISON"
			},
			"RAZORLEAF": {
				"TYPE": "GRASS"
			},
			"GROWTH": {
				"TYPE": "NORMAL"
			},
			"SLEEPPOWDER": {
				"TYPE": "GRASS"
			},
			"SOLARBEAM": {
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
			"LEECHSEED": {
				"TYPE": "GRASS"
			},
			"VINEWHIP": {
				"TYPE": "GRASS"
			},
			"POISONPOWDER": {
				"TYPE": "POISON"
			},
			"RAZORLEAF": {
				"TYPE": "GRASS"
			},
			"GROWTH": {
				"TYPE": "NORMAL"
			},
			"SLEEPPOWDER": {
				"TYPE": "GRASS"
			},
			"SOLARBEAM": {
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
			"FIRESPIN": {
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
			"FIRESPIN": {
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
			"FIRESPIN": {
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
			"TAILWHIP": {
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
			"SKULLBASH": {
				"TYPE": "NORMAL"
			},
			"HYDROPUMP": {
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
			"TAILWHIP": {
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
			"SKULLBASH": {
				"TYPE": "NORMAL"
			},
			"HYDROPUMP": {
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
			"TAILWHIP": {
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
			"SKULLBASH": {
				"TYPE": "NORMAL"
			},
			"HYDROPUMP": {
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
			"STRINGSHOT": {
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
			"STRINGSHOT": {
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
			"STRINGSHOT": {
				"TYPE": "BUG"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"POISONPOWDER": {
				"TYPE": "POISON"
			},
			"STUNSPORE": {
				"TYPE": "GRASS"
			},
			"SLEEPPOWDER": {
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
			"POISONSTING": {
				"TYPE": "POISON"
			},
			"STRINGSHOT": {
				"TYPE": "BUG"
			}
		}
	},
	"KAKUNA": {
		"INDEX": 14,
		"TYPE": ["BUG", "POISON"],
		"MOVES": {
			"POISONSTING": {
				"TYPE": "POISON"
			},
			"STRINGSHOT": {
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
			"POISONSTING": {
				"TYPE": "POISON"
			},
			"STRINGSHOT": {
				"TYPE": "BUG"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"FURYATTACK": {
				"TYPE": "NORMAL"
			},
			"FOCUSENERGY": {
				"TYPE": "NORMAL"
			},
			"TWINNEEDLE": {
				"TYPE": "BUG"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			},
			"PINMISSILE": {
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
			"QUICKATTACK": {
				"TYPE": "NORMAL"
			},
			"WHIRLWIND": {
				"TYPE": "NORMAL"
			},
			"WINGATTACK": {
				"TYPE": "FLYING"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"MIRRORMOVE": {
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
			"QUICKATTACK": {
				"TYPE": "NORMAL"
			},
			"WHIRLWIND": {
				"TYPE": "NORMAL"
			},
			"WINGATTACK": {
				"TYPE": "FLYING"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"MIRRORMOVE": {
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
			"QUICKATTACK": {
				"TYPE": "NORMAL"
			},
			"WHIRLWIND": {
				"TYPE": "NORMAL"
			},
			"WINGATTACK": {
				"TYPE": "FLYING"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"MIRRORMOVE": {
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
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"QUICKATTACK": {
				"TYPE": "NORMAL"
			},
			"HYPERFANG": {
				"TYPE": "NORMAL"
			},
			"FOCUSENERGY": {
				"TYPE": "NORMAL"
			},
			"SUPERFANG": {
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
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"QUICKATTACK": {
				"TYPE": "NORMAL"
			},
			"HYPERFANG": {
				"TYPE": "NORMAL"
			},
			"FOCUSENERGY": {
				"TYPE": "NORMAL"
			},
			"SUPERFANG": {
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
			"FURYATTACK": {
				"TYPE": "NORMAL"
			},
			"MIRRORMOVE": {
				"TYPE": "FLYING"
			},
			"DRILLPECK": {
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
			"FURYATTACK": {
				"TYPE": "NORMAL"
			},
			"MIRRORMOVE": {
				"TYPE": "FLYING"
			},
			"DRILLPECK": {
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
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"THUNDERWAVE": {
				"TYPE": "ELECTRIC"
			},
			"QUICKATTACK": {
				"TYPE": "NORMAL"
			},
			"DOUBLETEAM": {
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
			"LIGHTSCREEN": {
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
			"POISONSTING": {
				"TYPE": "POISON"
			},
			"SWIFT": {
				"TYPE": "NORMAL"
			},
			"FURYSWIPES": {
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
			"POISONSTING": {
				"TYPE": "POISON"
			},
			"SWIFT": {
				"TYPE": "NORMAL"
			},
			"FURYSWIPES": {
				"TYPE": "NORMAL"
			}
		}
	},
	"NIDORANF": {
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
			"DOUBLEKICK": {
				"TYPE": "FIGHTING"
			},
			"POISONSTING": {
				"TYPE": "POISON"
			},
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"FURYSWIPES": {
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
			"DOUBLEKICK": {
				"TYPE": "FIGHTING"
			},
			"POISONSTING": {
				"TYPE": "POISON"
			},
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"FURYSWIPES": {
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
			"DOUBLEKICK": {
				"TYPE": "FIGHTING"
			},
			"POISONSTING": {
				"TYPE": "POISON"
			},
			"BODYSLAM": {
				"TYPE": "NORMAL"
			}
		}
	},
	"NIDORANM": {
		"INDEX": 32,
		"TYPE": ["POISON"],
		"MOVES": {
			"LEER": {
				"TYPE": "NORMAL"
			},
			"TACKLE": {
				"TYPE": "NORMAL"
			},
			"HORNATTACK": {
				"TYPE": "NORMAL"
			},
			"DOUBLEKICK": {
				"TYPE": "FIGHTING"
			},
			"POISONSTING": {
				"TYPE": "POISON"
			},
			"FOCUSENERGY": {
				"TYPE": "NORMAL"
			},
			"FURYATTACK": {
				"TYPE": "NORMAL"
			},
			"HORNDRILL": {
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
			"HORNATTACK": {
				"TYPE": "NORMAL"
			},
			"DOUBLEKICK": {
				"TYPE": "FIGHTING"
			},
			"POISONSTING": {
				"TYPE": "POISON"
			},
			"FOCUSENERGY": {
				"TYPE": "NORMAL"
			},
			"FURYATTACK": {
				"TYPE": "NORMAL"
			},
			"HORNDRILL": {
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
			"HORNATTACK": {
				"TYPE": "NORMAL"
			},
			"DOUBLEKICK": {
				"TYPE": "FIGHTING"
			},
			"POISONSTING": {
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
			"DEFENSECURL": {
				"TYPE": "NORMAL"
			},
			"LIGHTSCREEN": {
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
			"DEFENSECURL": {
				"TYPE": "NORMAL"
			},
			"LIGHTSCREEN": {
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
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"QUICKATTACK": {
				"TYPE": "NORMAL"
			},
			"ROAR": {
				"TYPE": "NORMAL"
			},
			"CONFUSERAY": {
				"TYPE": "GHOST"
			},
			"FLAMETHROWER": {
				"TYPE": "FIRE"
			},
			"FIRESPIN": {
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
			"DEFENSECURL": {
				"TYPE": "NORMAL"
			},
			"DOUBLESLAP": {
				"TYPE": "NORMAL"
			},
			"REST": {
				"TYPE": "PSYCHIC"
			},
			"BODYSLAM": {
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
			"LEECHLIFE": {
				"TYPE": "BUG"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"CONFUSERAY": {
				"TYPE": "GHOST"
			},
			"WINGATTACK": {
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
			"LEECHLIFE": {
				"TYPE": "BUG"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"CONFUSERAY": {
				"TYPE": "GHOST"
			},
			"WINGATTACK": {
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
			"POISONPOWDER": {
				"TYPE": "POISON"
			},
			"STUNSPORE": {
				"TYPE": "GRASS"
			},
			"SLEEPPOWDER": {
				"TYPE": "GRASS"
			},
			"ACID": {
				"TYPE": "POISON"
			},
			"SOLARBEAM": {
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
			"POISONPOWDER": {
				"TYPE": "POISON"
			},
			"STUNSPORE": {
				"TYPE": "GRASS"
			},
			"SLEEPPOWDER": {
				"TYPE": "GRASS"
			},
			"ACID": {
				"TYPE": "POISON"
			},
			"SOLARBEAM": {
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
			"STUNSPORE": {
				"TYPE": "GRASS"
			},
			"LEECHLIFE": {
				"TYPE": "GRASS"
			},
			"SPORE": {
				"TYPE": "BUG"
			},
			"nu": {
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
			"STUNSPORE": {
				"TYPE": "GRASS"
			},
			"LEECHLIFE": {
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
			"POISONPOWDER": {
				"TYPE": "POISON"
			},
			"LEECHLIFE": {
				"TYPE": "GRASS"
			},
			"STUNSPORE": {
				"TYPE": "GRASS"
			},
			"PSYBEAM": {
				"TYPE": "PSYCHIC"
			},
			"SLEEPPOWDER": {
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
			"POISONPOWDER": {
				"TYPE": "POISON"
			},
			"LEECHLIFE": {
				"TYPE": "GRASS"
			},
			"STUNSPORE": {
				"TYPE": "GRASS"
			},
			"PSYBEAM": {
				"TYPE": "PSYCHIC"
			},
			"SLEEPPOWDER": {
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
			"PAYDAY": {
				"TYPE": "NORMAL"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			},
			"FURYSWIPES": {
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
			"PAYDAY": {
				"TYPE": "NORMAL"
			},
			"SCREECH": {
				"TYPE": "NORMAL"
			},
			"FURYSWIPES": {
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
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"FURYSWIPES": {
				"TYPE": "NORMAL"
			},
			"HYDROPUMP": {
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
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"DISABLE": {
				"TYPE": "NORMAL"
			},
			"CONFUSION": {
				"TYPE": "PSYCHIC"
			},
			"FURYSWIPES": {
				"TYPE": "NORMAL"
			},
			"HYDROPUMP": {
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
			"LOWKICK": {
				"TYPE": "FIGHTING"
			},
			"KARATECHOP": {
				"TYPE": "NORMAL"
			},
			"FURYSWIPES": {
				"TYPE": "NORMAL"
			},
			"FOCUSENERGY": {
				"TYPE": "NORMAL"
			},
			"SEISMICTOSS": {
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
			"LOWKICK": {
				"TYPE": "FIGHTING"
			},
			"KARATECHOP": {
				"TYPE": "NORMAL"
			},
			"FURYSWIPES": {
				"TYPE": "NORMAL"
			},
			"FOCUSENERGY": {
				"TYPE": "NORMAL"
			},
			"SEISMICTOSS": {
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
			"TAKEDOWN": {
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
			"WATERGUN": {
				"TYPE": "WATER"
			},
			"DOUBLESLAP": {
				"TYPE": "NORMAL"
			},
			"BODYSLAM": {
				"TYPE": "NORMAL"
			},
			"AMNESIA": {
				"TYPE": "PSYCHIC"
			},
			"HYDROPUMP": {
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
			"WATERGUN": {
				"TYPE": "WATER"
			},
			"DOUBLESLAP": {
				"TYPE": "NORMAL"
			},
			"BODYSLAM": {
				"TYPE": "NORMAL"
			},
			"AMNESIA": {
				"TYPE": "PSYCHIC"
			},
			"HYDROPUMP": {
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
			"WATERGUN": {
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
			"KARATECHOP": {
				"TYPE": "NORMAL"
			},
			"LOWKICK": {
				"TYPE": "FIGHTING"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FOCUSENERGY": {
				"TYPE": "NORMAL"
			},
			"SEISMICTOSS": {
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
			"KARATECHOP": {
				"TYPE": "NORMAL"
			},
			"LOWKICK": {
				"TYPE": "FIGHTING"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FOCUSENERGY": {
				"TYPE": "NORMAL"
			},
			"SEISMICTOSS": {
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
			"KARATECHOP": {
				"TYPE": "NORMAL"
			},
			"LOWKICK": {
				"TYPE": "FIGHTING"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FOCUSENERGY": {
				"TYPE": "NORMAL"
			},
			"SEISMICTOSS": {
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
			"VINEWHIP": {
				"TYPE": "GRASS"
			},
			"GROWTH": {
				"TYPE": "NORMAL"
			},
			"WRAP": {
				"TYPE": "NORMAL"
			},
			"POISONPOWDER": {
				"TYPE": "POISON"
			},
			"SLEEPPOWDER": {
				"TYPE": "GRASS"
			},
			"STUNSPORE": {
				"TYPE": "GRASS"
			},
			"ACID": {
				"TYPE": "POISON"
			},
			"RAZORLEAF": {
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
			"VINEWHIP": {
				"TYPE": "GRASS"
			},
			"GROWTH": {
				"TYPE": "NORMAL"
			},
			"WRAP": {
				"TYPE": "NORMAL"
			},
			"POISONPOWDER": {
				"TYPE": "POISON"
			},
			"SLEEPPOWDER": {
				"TYPE": "GRASS"
			},
			"STUNSPORE": {
				"TYPE": "GRASS"
			},
			"ACID": {
				"TYPE": "POISON"
			},
			"RAZORLEAF": {
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
			"POISONSTING": {
				"TYPE": "POISON"
			},
			"WATERGUN": {
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
			"HYDROPUMP": {
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
			"WATERGUN": {
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
			"HYDROPUMP": {
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
			"DEFENSECURL": {
				"TYPE": "NORMAL"
			},
			"ROCKTHROW": {
				"TYPE": "ROCK"
			},
			"SELFDESTRUCT": {
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
			"DEFENSECURL": {
				"TYPE": "NORMAL"
			},
			"ROCKTHROW": {
				"TYPE": "ROCK"
			},
			"SELFDESTRUCT": {
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
			"DEFENSECURL": {
				"TYPE": "NORMAL"
			},
			"ROCKTHROW": {
				"TYPE": "ROCK"
			},
			"SELFDESTRUCT": {
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
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"STOMP": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"FIRESPIN": {
				"TYPE": "FIRE"
			},
			"TAKEDOWN": {
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
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"STOMP": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"FIRESPIN": {
				"TYPE": "FIRE"
			},
			"TAKEDOWN": {
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
			"WATERGUN": {
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
			"HEADBUTT": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"WATERGUN": {
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
			"THUNDERWAVE": {
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
			"THUNDERWAVE": {
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
			"FURYATTACK": {
				"TYPE": "NORMAL"
			},
			"SWORDSDANCE": {
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
			"FURYATTACK": {
				"TYPE": "NORMAL"
			},
			"DRILLPECK": {
				"TYPE": "FLYING"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			},
			"TRIATTACK": {
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
			"FURYATTACK": {
				"TYPE": "NORMAL"
			},
			"DRILLPECK": {
				"TYPE": "FLYING"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			},
			"TRIATTACK": {
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
			"HEADBUTT": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"AURORABEAM": {
				"TYPE": "ICE"
			},
			"REST": {
				"TYPE": "PSYCHIC"
			},
			"TAKEDOWN": {
				"TYPE": "NORMAL"
			},
			"ICEBEAM": {
				"TYPE": "ICE"
			}
		}
	},
	"DEWGONG": {
		"INDEX": 87,
		"TYPE": ["WATER", "ICE"],
		"MOVES": {
			"HEADBUTT": {
				"TYPE": "NORMAL"
			},
			"GROWL": {
				"TYPE": "NORMAL"
			},
			"AURORABEAM": {
				"TYPE": "ICE"
			},
			"REST": {
				"TYPE": "PSYCHIC"
			},
			"TAKEDOWN": {
				"TYPE": "NORMAL"
			},
			"ICEBEAM": {
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
			"POISONGAS": {
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
			"ACIDARMOR": {
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
			"POISONGAS": {
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
			"ACIDARMOR": {
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
			"AURORABEAM": {
				"TYPE": "ICE"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"ICEBEAM": {
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
			"SPIKECANNON": {
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
			"CONFUSERAY": {
				"TYPE": "GHOST"
			},
			"NIGHTSHADE": {
				"TYPE": "GHOST"
			},
			"HYPNOSIS": {
				"TYPE": "PSYCHIC"
			},
			"DREAMEATER": {
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
			"CONFUSERAY": {
				"TYPE": "GHOST"
			},
			"NIGHTSHADE": {
				"TYPE": "GHOST"
			},
			"HYPNOSIS": {
				"TYPE": "PSYCHIC"
			},
			"DREAMEATER": {
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
			"CONFUSERAY": {
				"TYPE": "GHOST"
			},
			"NIGHTSHADE": {
				"TYPE": "GHOST"
			},
			"HYPNOSIS": {
				"TYPE": "PSYCHIC"
			},
			"DREAMEATER": {
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
			"ROCKTHROW": {
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
			"HEADBUTT": {
				"TYPE": "NORMAL"
			},
			"POISONGAS": {
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
			"HEADBUTT": {
				"TYPE": "NORMAL"
			},
			"POISONGAS": {
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
			"CRABHAMMER": {
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
			"CRABHAMMER": {
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
			"SELFDESTRUCT": {
				"TYPE": "NORMAL"
			},
			"LIGHTSCREEN": {
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
			"SELFDESTRUCT": {
				"TYPE": "NORMAL"
			},
			"LIGHTSCREEN": {
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
			"LEECHSEED": {
				"TYPE": "GRASS"
			},
			"STUNSPORE": {
				"TYPE": "GRASS"
			},
			"POISONPOWDER": {
				"TYPE": "POISON"
			},
			"SOLARBEAM": {
				"TYPE": "GRASS"
			},
			"SLEEPPOWDER": {
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
			"BONECLUB": {
				"TYPE": "GROUND"
			},
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"HEADBUTT": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FOCUSENERGY": {
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
			"BONECLUB": {
				"TYPE": "GROUND"
			},
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"HEADBUTT": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FOCUSENERGY": {
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
			"DOUBLEKICK": {
				"TYPE": "NORMAL"
			},
			"MEDITATE": {
				"TYPE": "PSYCHIC"
			},
			"ROLLINGKICK": {
				"TYPE": "FIGHTING"
			},
			"JUMPKICK": {
				"TYPE": "FIGHTING"
			},
			"FOCUSENERGY": {
				"TYPE": "NORMAL"
			},
			"HI JUMP KICK": {
				"TYPE": "FIGHTING"
			},
			"MEGAKICK": {
				"TYPE": "NORMAL"
			}
		}
	},
	"HITMONCHAN": {
		"INDEX": 107,
		"TYPE": ["FIGHTING"],
		"MOVES": {
			"COMETPUNCH": {
				"TYPE": "NORMAL"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"FIREPUNCH": {
				"TYPE": "FIRE"
			},
			"ICEPUNCH": {
				"TYPE": "ICE"
			},
			"THUNDERPUNCH": {
				"TYPE": "ELECTRIC"
			},
			"MEGAPUNCH": {
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
			"DEFENSECURL": {
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
			"SMOKESCREEN": {
				"TYPE": "NORMAL"
			},
			"SELFDESTRUCT": {
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
			"SMOKESCREEN": {
				"TYPE": "NORMAL"
			},
			"SELFDESTRUCT": {
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
			"HORNATTACK": {
				"TYPE": "NORMAL"
			},
			"STOMP": {
				"TYPE": "NORMAL"
			},
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"FURYATTACK": {
				"TYPE": "NORMAL"
			},
			"HORNDRILL": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"TAKEDOWN": {
				"TYPE": "NORMAL"
			}
		}
	},
	"RHYDON": {
		"INDEX": 112,
		"TYPE": ["GROUND", "ROCK"],
		"MOVES": {
			"HORNATTACK": {
				"TYPE": "NORMAL"
			},
			"STOMP": {
				"TYPE": "NORMAL"
			},
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"FURYATTACK": {
				"TYPE": "NORMAL"
			},
			"HORNDRILL": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"TAKEDOWN": {
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
			"TAILWHIP": {
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
			"DEFENSECURL": {
				"TYPE": "NORMAL"
			},
			"LIGHTSCREEN": {
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
			"VINEWHIP": {
				"TYPE": "GRASS"
			},
			"POISONPOWDER": {
				"TYPE": "POISON"
			},
			"STUNSPORE": {
				"TYPE": "GRASS"
			},
			"SLEEPPOWDER": {
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
			"COMETPUNCH": {
				"TYPE": "NORMAL"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"MEGAPUNCH": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"DIZZYPUNCH": {
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
			"SMOKESCREEN": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"WATERGUN": {
				"TYPE": "WATER"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"HYDROPUMP": {
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
			"SMOKESCREEN": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"WATERGUN": {
				"TYPE": "WATER"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"HYDROPUMP": {
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
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"HORNATTACK": {
				"TYPE": "NORMAL"
			},
			"FURYATTACK": {
				"TYPE": "NORMAL"
			},
			"WATERFALL": {
				"TYPE": "WATER"
			},
			"HORNDRILL": {
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
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"SUPERSONIC": {
				"TYPE": "NORMAL"
			},
			"HORNATTACK": {
				"TYPE": "NORMAL"
			},
			"FURYATTACK": {
				"TYPE": "NORMAL"
			},
			"WATERFALL": {
				"TYPE": "WATER"
			},
			"HORNDRILL": {
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
			"WATERGUN": {
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
			"LIGHTSCREEN": {
				"TYPE": "PSYCHIC"
			},
			"HYDROPUMP": {
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
			"LIGHTSCREEN": {
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
			"QUICKATTACK": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"FOCUSENERGY": {
				"TYPE": "NORMAL"
			},
			"DOUBLETEAM": {
				"TYPE": "NORMAL"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"SWORDSDANCE": {
				"TYPE": "NORMAL"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"WINGATTACK": {
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
			"LOVELYKISS": {
				"TYPE": "NORMAL"
			},
			"LICK": {
				"TYPE": "GHOST"
			},
			"DOUBLESLAP": {
				"TYPE": "NORMAL"
			},
			"ICEPUNCH": {
				"TYPE": "ICE"
			},
			"BODYSLAM": {
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
			"QUICKATTACK": {
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
			"THUNDERPUNCH": {
				"TYPE": "ELECTRIC"
			},
			"LIGHTSCREEN": {
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
			"CONFUSERAY": {
				"TYPE": "GHOST"
			},
			"FIREPUNCH": {
				"TYPE": "FIRE"
			},
			"SMOKESCREEN": {
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
			"SEISMICTOSS": {
				"TYPE": "FIGHTING"
			},
			"GUILLOTINE": {
				"TYPE": "NORMAL"
			},
			"FOCUSENERGY": {
				"TYPE": "NORMAL"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"SLASH": {
				"TYPE": "NORMAL"
			},
			"SWORDSDANCE": {
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
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"RAGE": {
				"TYPE": "NORMAL"
			},
			"TAKEDOWN": {
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
			"DRAGONRAGE": {
				"TYPE": "DRAGON"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"HYDROPUMP": {
				"TYPE": "WATER"
			},
			"HYPERBEAM": {
				"TYPE": "NORMAL"
			}
		}
	},
	"LAPRAS": {
		"INDEX": 131,
		"TYPE": ["WATER", "ICE"],
		"MOVES": {
			"WATERGUN": {
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
			"BODYSLAM": {
				"TYPE": "NORMAL"
			},
			"CONFUSERAY": {
				"TYPE": "GHOST"
			},
			"ICEBEAM": {
				"TYPE": "ICE"
			},
			"HYDROPUMP": {
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
			"QUICKATTACK": {
				"TYPE": "NORMAL"
			},
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"FOCUSENERGY": {
				"TYPE": "NORMAL"
			},
			"TAKEDOWN": {
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
			"QUICKATTACK": {
				"TYPE": "NORMAL"
			},
			"WATERGUN": {
				"TYPE": "WATER"
			},
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"AURORABEAM": {
				"TYPE": "ICE"
			},
			"HAZE": {
				"TYPE": "ICE"
			},
			"ACIDARMOR": {
				"TYPE": "POISON"
			},
			"HYDROPUMP": {
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
			"QUICKATTACK": {
				"TYPE": "NORMAL"
			},
			"THUNDERSHOCK": {
				"TYPE": "ELECTRIC"
			},
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"DOUBLEKICK": {
				"TYPE": "FIGHTING"
			},
			"PINMISSILE": {
				"TYPE": "BUG"
			},
			"THUNDERWAVE": {
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
			"QUICKATTACK": {
				"TYPE": "NORMAL"
			},
			"EMBER": {
				"TYPE": "FIRE"
			},
			"TAILWHIP": {
				"TYPE": "NORMAL"
			},
			"BITE": {
				"TYPE": "NORMAL"
			},
			"FIRESPIN": {
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
			"TRIATTACK": {
				"TYPE": "NORMAL"
			}
		}
	},
	"OMANYTE": {
		"INDEX": 138,
		"TYPE": ["ROCK", "WATER"],
		"MOVES": {
			"WATERGUN": {
				"TYPE": "WATER"
			},
			"WITHDRAW": {
				"TYPE": "WATER"
			},
			"HORNATTACK": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"SPIKECANNON": {
				"TYPE": "NORMAL"
			},
			"HYDROPUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"OMASTAR": {
		"INDEX": 139,
		"TYPE": ["ROCK", "WATER"],
		"MOVES": {
			"WATERGUN": {
				"TYPE": "WATER"
			},
			"WITHDRAW": {
				"TYPE": "WATER"
			},
			"HORNATTACK": {
				"TYPE": "NORMAL"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"SPIKECANNON": {
				"TYPE": "NORMAL"
			},
			"HYDROPUMP": {
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
			"HYDROPUMP": {
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
			"HYDROPUMP": {
				"TYPE": "WATER"
			}
		}
	},
	"AERODACTYL": {
		"INDEX": 142,
		"TYPE": ["ROCK", "FLYING"],
		"MOVES": {
			"WINGATTACK": {
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
			"TAKEDOWN": {
				"TYPE": "NORMAL"
			},
			"HYPERBEAM": {
				"TYPE": "NORMAL"
			}
		}
	},
	"SNORLAX": {
		"INDEX": 143,
		"TYPE": ["NORMAL"],
		"MOVES": {
			"HEADBUTT": {
				"TYPE": "NORMAL"
			},
			"AMNESIA": {
				"TYPE": "PSYCHIC"
			},
			"REST": {
				"TYPE": "PSYCHIC"
			},
			"BODYSLAM": {
				"TYPE": "NORMAL"
			},
			"HARDEN": {
				"TYPE": "NORMAL"
			},
			"DOUBLE-EDGE": {
				"TYPE": "NORMAL"
			},
			"HYPERBEAM": {
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
			"ICEBEAM": {
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
			"DRILLPECK": {
				"TYPE": "FLYING"
			},
			"THUNDER": {
				"TYPE": "ELECTRIC"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"LIGHTSCREEN": {
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
			"FIRESPIN": {
				"TYPE": "FIRE"
			},
			"LEER": {
				"TYPE": "NORMAL"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"SKYATTACK": {
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
			"THUNDERWAVE": {
				"TYPE": "ELECTRIC"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"SLAM": {
				"TYPE": "NORMAL"
			},
			"DRAGONRAGE": {
				"TYPE": "DRAGON"
			},
			"HYPERBEAM": {
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
			"THUNDERWAVE": {
				"TYPE": "ELECTRIC"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"SLAM": {
				"TYPE": "NORMAL"
			},
			"DRAGONRAGE": {
				"TYPE": "DRAGON"
			},
			"HYPERBEAM": {
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
			"THUNDERWAVE": {
				"TYPE": "ELECTRIC"
			},
			"AGILITY": {
				"TYPE": "PSYCHIC"
			},
			"SLAM": {
				"TYPE": "NORMAL"
			},
			"DRAGONRAGE": {
				"TYPE": "DRAGON"
			},
			"HYPERBEAM": {
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
			"MEGAPUNCH": {
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

pokedex.moveList = {
  
  "ABSORB": { "TYPE": "GRASS" },
  "ACID": { "TYPE": "POISON" },
  "ACIDARMOR": { "TYPE": "POISON" },
  "AGILITY": { "TYPE": "PSYCHIC" },
  "AMNESIA": { "TYPE": "PSYCHIC" },
  "AURORABEAM": { "TYPE": "ICE" },
  "BARRAGE": { "TYPE": "NORMAL" },
  "BARRIER": { "TYPE": "PSYCHIC" },
  "BIND": { "TYPE": "NORMAL" },
  "BITE": { "TYPE": "NORMAL" },
  "BLIZZARD": { "TYPE": "ICE" },
  "BODYSLAM": { "TYPE": "NORMAL" },
  "BONECLUB": { "TYPE": "GROUND" },
  "BONEMERANG": { "TYPE": "GROUND" },
  "BUBBLE": { "TYPE": "WATER" },
  "CLAMP": { "TYPE": "WATER" },
  "COMETPUNCH": { "TYPE": "NORMAL" },
  "CONFUSERAY": { "TYPE": "GHOST" },
  "CONFUSION": { "TYPE": "PSYCHIC" },
  "CONSTRICT": { "TYPE": "NORMAL" },
  "CONVERSION": { "TYPE": "NORMAL" },
  "COUNTER": { "TYPE": "FIGHTING" },
  "CRABHAMMER": { "TYPE": "WATER" },
  "DEFENSECURL": { "TYPE": "NORMAL" },
  "DIG": { "TYPE": "GROUND" },
  "DISABLE": { "TYPE": "NORMAL" },
  "DIZZYPUNCH": { "TYPE": "NORMAL" },
  "DOUBLE-EDGE": { "TYPE": "NORMAL" },
  "DOUBLEKICK": { "TYPE": "FIGHTING" },
  "DOUBLESLAP": { "TYPE": "NORMAL" },
  "DOUBLETEAM": { "TYPE": "NORMAL" },
  "DRAGONRAGE": { "TYPE": "DRAGON" },
  "DREAMEATER": { "TYPE": "PSYCHIC" },
  "DRILLPECK": { "TYPE": "FLYING" },
  "EARTHQUAKE": { "TYPE": "GROUND" },
  "EMBER": { "TYPE": "FIRE" },
  "EXPLOSION": { "TYPE": "NORMAL" },
  "FIREPUNCH": { "TYPE": "FIRE" },
  "FIRESPIN": { "TYPE": "FIRE" },
  "FLAMETHROWER": { "TYPE": "FIRE" },
  "FOCUSENERGY": { "TYPE": "NORMAL" },
  "FURYATTACK": { "TYPE": "NORMAL" },
  "FURYSWIPES": { "TYPE": "NORMAL" },
  "GROWL": { "TYPE": "NORMAL" },
  "GROWTH": { "TYPE": "NORMAL" },
  "GUILLOTINE": { "TYPE": "NORMAL" },
  "GUST": { "TYPE": "NORMAL" },
  "HARDEN": { "TYPE": "NORMAL" },
  "HAZE": { "TYPE": "ICE" },
  "HEADBUTT": { "TYPE": "NORMAL" },
  "HIJUMPKICK": { "TYPE": "FIGHTING" },
  "HORNATTACK": { "TYPE": "NORMAL" },
  "HORNDRILL": { "TYPE": "NORMAL" },
  "HYDROPUMP": { "TYPE": "WATER" },
  "HYPERBEAM": { "TYPE": "NORMAL" },
  "HYPERFANG": { "TYPE": "NORMAL" },
  "HYPNOSIS": { "TYPE": "PSYCHIC" },
  "ICEBEAM": { "TYPE": "ICE" },
  "ICEPUNCH": { "TYPE": "ICE" },
  "JUMPKICK": { "TYPE": "FIGHTING" },
  "KARATECHOP": { "TYPE": "NORMAL" },
  "KINESIS": { "TYPE": "PSYCHIC" },
  "LEECHLIFE": { "TYPE": "GRASS" },
  "LEECHSEED": { "TYPE": "GRASS" },
  "LEER": { "TYPE": "NORMAL" },
  "LICK": { "TYPE": "GHOST" },
  "LIGHTSCREEN": { "TYPE": "PSYCHIC" },
  "LOVELYKISS": { "TYPE": "NORMAL" },
  "LOWKICK": { "TYPE": "FIGHTING" },
  "MEDITATE": { "TYPE": "PSYCHIC" },
  "MEGAKICK": { "TYPE": "NORMAL" },
  "MEGAPUNCH": { "TYPE": "NORMAL" },
  "METRONOME": { "TYPE": "NORMAL" },
  "MINIMIZE": { "TYPE": "NORMAL" },
  "MIRRORMOVE": { "TYPE": "FLYING" },
  "MIST": { "TYPE": "ICE" },
  "NIGHTSHADE": { "TYPE": "GHOST" },
  "PAYDAY": { "TYPE": "NORMAL" },
  "PECK": { "TYPE": "FLYING" },
  "PINMISSILE": { "TYPE": "BUG" },
  "POISONGAS": { "TYPE": "POISON" },
  "POISONPOWDER": { "TYPE": "POISON" },
  "POISONSTING": { "TYPE": "POISON" },
  "POUND": { "TYPE": "NORMAL" },
  "PSYBEAM": { "TYPE": "PSYCHIC" },
  "PSYCHIC": { "TYPE": "PSYCHIC" },
  "QUICKATTACK": { "TYPE": "NORMAL" },
  "RAGE": { "TYPE": "NORMAL" },
  "RAZORLEAF": { "TYPE": "GRASS" },
  "RECOVER": { "TYPE": "PSYCHIC" },
  "REFLECT": { "TYPE": "PSYCHIC" },
  "REST": { "TYPE": "PSYCHIC" },
  "ROAR": { "TYPE": "NORMAL" },
  "ROCKTHROW": { "TYPE": "ROCK" },
  "ROLLINGKICK": { "TYPE": "FIGHTING" },
  "SAND-ATTACK": { "TYPE": "NORMAL" },
  "SCRATCH": { "TYPE": "NORMAL" },
  "SCREECH": { "TYPE": "NORMAL" },
  "SEISMICTOSS": { "TYPE": "FIGHTING" },
  "SELFDESTRUCT": { "TYPE": "NORMAL" },
  "SHARPEN": { "TYPE": "NORMAL" },
  "SING": { "TYPE": "NORMAL" },
  "SKULLBASH": { "TYPE": "NORMAL" },
  "SKYATTACK": { "TYPE": "FLYING" },
  "SLAM": { "TYPE": "NORMAL" },
  "SLASH": { "TYPE": "NORMAL" },
  "SLEEPPOWDER": { "TYPE": "GRASS" },
  "SLUDGE": { "TYPE": "POISON" },
  "SMOG": { "TYPE": "POISON" },
  "SMOKESCREEN": { "TYPE": "NORMAL" },
  "SOLARBEAM": { "TYPE": "GRASS" },
  "SONICBOOM": { "TYPE": "NORMAL" },
  "SPIKECANNON": { "TYPE": "NORMAL" },
  "SPLASH": { "TYPE": "WATER" },
  "SPORE": { "TYPE": "BUG" },
  "STOMP": { "TYPE": "NORMAL" },
  "STRINGSHOT": { "TYPE": "BUG" },
  "STUNSPORE": { "TYPE": "GRASS" },
  "SUBMISSION": { "TYPE": "FIGHTING" },
  "SUBSTITUTE": { "TYPE": "NORMAL" },
  "SUPERFANG": { "TYPE": "NORMAL" },
  "SUPERSONIC": { "TYPE": "NORMAL" },
  "SWIFT": { "TYPE": "NORMAL" },
  "SWORDSDANCE": { "TYPE": "NORMAL" },
  "TACKLE": { "TYPE": "NORMAL" },
  "TAILWHIP": { "TYPE": "NORMAL" },
  "TAKEDOWN": { "TYPE": "NORMAL" },
  "TELEPORT": { "TYPE": "PSYCHIC" },
  "THRASH": { "TYPE": "NORMAL" },
  "THUNDER": { "TYPE": "ELECTRIC" },
  "THUNDERBOLT": { "TYPE": "ELECTRIC" },
  "THUNDERPUNCH": { "TYPE": "ELECTRIC" },
  "THUNDERSHOCK": { "TYPE": "ELECTRIC" },
  "THUNDERWAVE": { "TYPE": "ELECTRIC" },
  "TRANSFORM": { "TYPE": "NORMAL" },
  "TRIATTACK": { "TYPE": "NORMAL" },
  "TWINNEEDLE": { "TYPE": "BUG" },
  "VICEGRIP": { "TYPE": "NORMAL" },
  "VINEWHIP": { "TYPE": "GRASS" },
  "WATERFALL": { "TYPE": "WATER" },
  "WATERGUN": { "TYPE": "WATER" },
  "WHIRLWIND": { "TYPE": "NORMAL" },
  "WINGATTACK": { "TYPE": "FLYING" },
  "WITHDRAW": { "TYPE": "WATER" },
  "WRAP": { "TYPE": "NORMAL" },

}

pokedex.typeChart = {

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

},{}],9:[function(require,module,exports){
var errors = require('../errors/errors.js'),
    pokedex = require('../pokedex/pokedex.js'),
    interpreter = require('../interpreter/interpreter.js');

var battle = {
      state: {}
    },
   state = battle.state,
   blocks = [],
   init_flag = false,
   R;

module.exports = battle;

var init = function(reader, inputFunc) {

  if (init_flag) {

    return;

  }

  R = reader;

  interpreter.init(battle, {input: inputFunc});

  init_flag = true;

}

battle.init = init;

var reset = function() {

  interpreter.reset();

  state = battle.state = {};

  blocks = [];

  newTurn();

}

battle.reset = reset;

var selfSwitchPokemon = function(pokemon) {

  state.selfPokemon = pokemon;

}

battle.selfSwitchPokemon = selfSwitchPokemon;

var enemySwitchPokemon = function(pokemon) {

  state.enemyPokemon = pokemon;

}

battle.enemySwitchPokemon = enemySwitchPokemon;

var setEnemyTrainer = function(trainer) {

  state.enemyTrainer = trainer;

}

battle.setEnemyTrainer = setEnemyTrainer;

var checkEnemyTrainer = function(trainer) {

  if (state.enemyTrainer !== trainer) {

    throw errors.wrongEnemyTrainer(state.enemyTrainer, trainer, R.currentLine);

  }

}

battle.checkEnemyTrainer = checkEnemyTrainer;

var checkPokemon = function(turn, pokemon) {

  var opponent = turn === 'self' ? 'enemy' : 'self';

  if (state[turn + 'Pokemon'] !== pokemon) {

    if (state[opponent + 'Pokemon'] === pokemon && turn === 'self') {

      if (state['enemyPokemon'] !== state['selfPokemon']) {

        throw errors.missingFoe(state['enemyPokemon'], R.currentLine);

      }

    }

    throw errors.wrongPokemon(state[turn + 'Pokemon'], pokemon, R.currentLine);

  }

}

var checkSelfPokemon = function(pokemon) {

  checkPokemon('self', pokemon);

}

battle.checkSelfPokemon = checkSelfPokemon;

var checkEnemyPokemon = function(pokemon) {

  checkPokemon('enemy', pokemon);

}

battle.checkEnemyPokemon = checkEnemyPokemon;

var doMove = function(turn, move) {

  state.switchable = false;

  var instruction;

  if (move === 'TACKLE') {

    var index = getPokedexNumber(turn);

    instruction = interpreter.num(index);

  } else {

    instruction = interpreter.translateMove(move); 

  }

  if (instruction instanceof interpreter.OpenblockObj) {

    blocks.push([]);

  } else if (instruction instanceof interpreter.CloseblockObj) {

    if (blocks.length === 0) {

      throw errors.noBlockToClose();

    }

    var block = blocks.pop();

    if (blocks.length === 0) {

      instruction = interpreter.block(block); 

      interpreter.exec(instruction);

    } else {

      blocks[blocks.length - 1].push(interpreter.block(block));

    }

  } else if (blocks.length > 0) {

    blocks[blocks.length - 1].push(instruction);

  } else {

    interpreter.exec(instruction);

  }

}

battle.doMove = doMove;

var getPokedexNumber = function(turn) {

  var pokemon = turn === 'SELF' ? state.enemyPokemon : state.selfPokemon;

  var index = pokedex.pokemon[pokemon]['INDEX'];

  return index === 151 ? 0 : index;

}

var checkPokemonKnowsMove = function(pokemon, move) {

  if (!pokedex.pokemon[pokemon]['MOVES'][move]) {

    throw errors.pokemonDoesNotKnowMove(pokemon, move, R.currentLine);

  } 

}

battle.checkPokemonKnowsMove = checkPokemonKnowsMove;

var selfTurn = function() {

  doTurn('SELF');

}

battle.selfTurn = selfTurn;

var enemyTurn = function() {

  doTurn('ENEMY');

}

battle.enemyTurn = enemyTurn;

var doTurn = function(turn) {

  if (state.turn === turn) {

    throw errors.wrongTurnOrder(turn, R.currentLine);

  }

}

var endSelfTurn = function() {

  endTurn('SELF'); 

}

battle.endSelfTurn = endSelfTurn;

var endEnemyTurn = function() {

  endTurn('ENEMY'); 

}

battle.endEnemyTurn = endEnemyTurn;

var endTurn = function(turn) {

  if (state.turn === 'NEW') {

    state.turn = turn;
 
  } else {

    newTurn();

  }

}

battle.endTurn = endTurn;

var newTurn = function() {

  state.turn = 'NEW';

  state.switchable = true;

}

battle.newTurn = newTurn;

var checkEffectiveness = function(turn, move) {

  var moveType = pokedex.moveList[move]['TYPE'];

  var modifier = 1;

  var pokemon = turn === 'SELF' ? state.enemyPokemon : state.selfPokemon;

  var enemyType = pokedex.pokemon[pokemon]['TYPE'];  

  for (var i = 0; i < enemyType.length; i++) {

    modifier *= pokedex.typeChart[moveType][enemyType[i]];

  }

  return modifier;  

}

battle.checkEffectiveness = checkEffectiveness;

var checkSwitch = function(trainer) {

  if (!state.switchable) {

    throw errors.switchNotAllowed(trainer, R.currentLine);    

  }

}

battle.checkSwitch = checkSwitch;

var getStack = function() {

  return interpreter.getStack();

}

battle.getStack = getStack;

var getBlocks = function() {


}

battle.getBlocks = getBlocks;

var getCurrentLine = function() {

  return R.currentLine;

}

battle.getCurrentLine = getCurrentLine;

},{"../errors/errors.js":5,"../interpreter/interpreter.js":7,"../pokedex/pokedex.js":8}],10:[function(require,module,exports){
var errors = require('../errors/errors.js'),
    R = require('./reader.js'),
    I = require('../interpreter/interpreter.js');

var browser_version = {};

R.init();

module.exports = browser_version;

browser_version.setInputFunction = function(input) {
  
  I.setInputFunction(input);

}

browser_version.setOutputFunction = function(output) {
  
  I.setOutputFunction(output);

}

var read = function(data) {
  
  R.read(data)

}

browser_version.read = read;

},{"../errors/errors.js":5,"../interpreter/interpreter.js":7,"./reader.js":12}],11:[function(require,module,exports){
var pokedex = require('../pokedex/pokedex.js'),
    errors = require('../errors/errors.js');

var matcher = {},
    reader,
    matchCases = {},
    init_flag = false;

module.exports = matcher;

var init = function(r) {

  if (init_flag) {

    return;

  }

  reader = r;

  createMatchCases();
  
  init_flag = true;
  
}

matcher.init = init;

var matchWord = function(actual, expected) {

  return compareWord(actual, expected);

}

matcher.matchWord = matchWord;

var peekWord = function(actual, expected) {

  return !(compareWord(actual, expected) instanceof Error);

}

var compareWord = function(actual, expected) {

  var result = true;

  if (expected[0] === '$') {

    result =  matchCases[expected].call(null, actual);

  } else if (actual !== expected) {

    result =  errors.unexpectedToken(expected, actual, reader.currentLine);

  } 

  return result;

}

var createMatchCase = function(name, callback) {

  matchCases[name] = callback;

}

var createMatchCases = function() {

  createMatchCase('$POKEMON', function(actual) {

    if (!pokedex.pokemon[actual]) {

      return errors.unrecognisedPokemon(actual, reader.currentLine);

    }  

    return true;

  });

  createMatchCase('$POKEMON!', function(actual) {

    var exclamation = actual[actual.length-1];

    if (exclamation !== '!') {

      var result = matchCases['$POKEMON'].call(null, actual);

      if (result === true) {

        return errors.missingPunctuation('!', reader.currentLine); 

      } else {

        return result;

      }
    }

    var pokemon_name = removeLastChar(actual);

    return matchCases['$POKEMON'].call(null, pokemon_name);

  });

  createMatchCase('$TRAINER', function(actual) {

    if (!actual.match(/[A-Z]+/)) {

      return errors.invalidTrainerName(actual, '[A-Z]+', reader.currentLine);

    }

    return true;

  });

  createMatchCase('$MOVE!', function(actual) {

    var exclamation = actual[actual.length-1];

    if (exclamation !== '!') {

      var result = matchCases['$MOVE'].call(null, actual);

      if (result === true) {

        return errors.missingPunctuation('!', reader.currentLine); 

      } else {

        return result;

      }
    }

    var move = removeLastChar(actual);

    return matchCases['$MOVE'].call(null, move);

  });

  createMatchCase('$MOVE', function(actual) {

    if (!pokedex.moveList[actual]) {

      throw errors.unrecognisedMove(actual, reader.currentLine);

    }

    return true;

  });

}

var removeLastChar = function(string) {

  return string.substring(0, string.length - 1);

}

matcher.removeLastChar = removeLastChar;

},{"../errors/errors.js":5,"../pokedex/pokedex.js":8}],12:[function(require,module,exports){
var pokedex = require('../pokedex/pokedex.js'),
    errors = require('../errors/errors.js'),
    battle = require('./battle.js'),
    matcher = require('./matcher.js');

var reader = {},
    states = {},
    read_tokens,
    token_index,
    total_lines,
    possible_states,
    buffer,
    buffer_index,
    init_flag = false;

reader.battle = battle.state;

reader.currentLine = 0;

reader.console_prompt;

module.exports = reader;

var init = function() {

  if (init_flag) {

    return;

  }

  createStates();

  battle.init(reader);

  matcher.init(reader);

  reset();

  init_flag = true;

}

reader.init = init;

var reset = function() {

  battle.reset();
  reader.battle = battle.state;
  read_tokens = [];
  total_lines = 0;
  token_index = 0;
  possible_states = [];
  buffer = [];
  buffer_index = 0;
  setNextState('START');
  setPromptNormal(); 

}

reader.reset = reset;

var read = function(input) {

  tokenise(input);

  try {

    while (token_index < read_tokens.length) {
 
      visitNextState();
 
    }

  } catch (err) {

    clearBuffer();

    setPromptNormal();
  
    setNextState(nextState);

    throw err;

  }
}

reader.read = read;

var tokenise = function(input) {

  var lines = input.split('\n');

  for (var i = 0; i < lines.length; i++) {

    var line = lines[i].split(/\/\//)[0];

    line = line.match(/\S+/g);

    if (line) {

      for (var j = 0; j < line.length; j++) {

        read_tokens.push({

          token: line[j],

          line: i + total_lines

        });

      }

    }

  }

  total_lines += lines.length - 1;

}

var getNextToken = function() {

  var token = read_tokens[token_index];

  token_index++;

  reader.currentLine = token.line + 1;

  return token.token;

}

var visitNextState = function() {

  var token = getNextToken();

  setPromptWaiting();

  if (token === '?') {

    debug();

    setPromptNormal();

    return;

  } else if (token === '*') {

    battle.newTurn(); 

    clearBuffer();

    setNextState('TURN');

    setPromptNormal();

    return;

  }

  var result;

  buffer.push(token);

  // iterate in reverse since we will be deleting elements from array
  for (var i = possible_states.length - 1; i >= 0; i--) {

    var buffer_index = buffer.length - 1;

    var expected = possible_states[i].accept[buffer_index];

    result = matcher.matchWord(buffer[buffer_index], expected);

    if (result instanceof Error) {

      handleResultError(result, buffer[buffer_index], expected);

      possible_states.splice(i, 1);

    } else if (buffer.length === possible_states[i].accept.length) {

      // accept state
      possible_states[i].callback.call(null, buffer);

      clearBuffer();

      setPromptNormal();

      return;

    }

  } 

  if (possible_states.length === 0) {

    throwUnexpectedTokenError(nextState, buffer);

  }

}

var throwUnexpectedTokenError = function(nextState, buffer) {

  var expected_tokens = [];

  for (var i = 0; i < states[nextState].length; i++) {

    var state_tokens = [];

    for (var j = 0; j < states[nextState][i].accept.length; j++) {

      state_tokens.push(states[nextState][i].accept[j]);

      if (j === buffer.length - 1) {

        state_tokens[j] = '>>' + state_tokens[j] + '<<';

      }

    }

    expected_tokens.push(state_tokens.join(' '));

  }

  var actual_tokens = [];

  for (var i = 0; i < buffer.length; i++) {

    actual_tokens.push(buffer[i]);

    if (i === buffer.length - 1) {

      actual_tokens[i] = '>>' + actual_tokens[i] + '<<';

    }

  }

  throw errors.unexpectedToken(expected_tokens.join(' OR \n'), actual_tokens.join(' '), reader.currentLine);

}

var handleResultError = function(result, actual, expected) {

  if (result.errorName === 'Unrecognised Pokemon') {

    if (actual === 'It\'s') {

      return;

    } 

  } 
  
  if (result.errorName !== 'Unexpected token' && possible_states.length === 1) {

    throw result;

  } 

}

var createState = function(name, accept_states) {

  states[name] = accept_states; 

}

var setNextState = function(state) {

  nextState = state;

  possible_states = [];

  for (var i = 0; i < states[state].length; i++) {

    possible_states.push(states[state][i]);

  }

}

var createStates = function() {

  createState('START', [

    {accept: ['Go!', '$POKEMON!'],
     callback: function(tokens) {

       battle.selfSwitchPokemon(matcher.removeLastChar(tokens[1]));

       setNextState('START2');

     }
    }

  ]);

  createState('START2', [

    {accept: ['Foe', '$TRAINER', 'sends', 'out', '$POKEMON!'],
     callback: function(tokens) {

       battle.setEnemyTrainer(tokens[1]);

       battle.enemySwitchPokemon(matcher.removeLastChar(tokens[4]));

       setNextState('TURN'); 

     }
    }

  ]);

  createState('TURN', [ 

    {accept: ['$POKEMON', 'uses', '$MOVE!'],
     callback: function(tokens) {

       battle.selfTurn();
  
       var pokemon = tokens[0];
  
       battle.checkSelfPokemon(pokemon);
  
       var move = matcher.removeLastChar(tokens[2]);
  
       battle.checkPokemonKnowsMove(pokemon, move);
  
       battle.doMove('SELF', move); 
 
       endOfTurnChecks('SELF', move);

    }
   },

    {accept: ['$POKEMON!', 'That\'s', 'enough!', 'Come', 'back!'],
     callback: function(tokens) {

       battle.selfTurn();

       var pokemon = matcher.removeLastChar(tokens[0]);
     
       battle.checkSwitch('Self');

       battle.checkSelfPokemon(pokemon);

       setNextState('SELFSWITCH');

     } 
    },

    {accept: ['Foe', '$TRAINER', 'calls', 'back', '$POKEMON!'],
     callback: function(tokens) {

       battle.enemyTurn();

       battle.checkEnemyTrainer(tokens[1]);
 
       battle.checkSwitch('Foe ' + tokens[1]);     

       battle.checkEnemyPokemon(matcher.removeLastChar(tokens[4]));
     
       setNextState('ENEMYSWITCH');

     }
    },

    {accept: ['Foe', '$POKEMON', 'uses', '$MOVE!'],
     callback: function(tokens) { 

       battle.enemyTurn();

       var pokemon = tokens[1];

       battle.checkEnemyPokemon(pokemon);

       var move = matcher.removeLastChar(tokens[3]);

       battle.checkPokemonKnowsMove(pokemon, move);

       battle.doMove('ENEMY', move);

       endOfTurnChecks('ENEMY', move);

     }
    }

  ]);


  createState('SELFSWITCH', [
    
    {accept: ['Go!', '$POKEMON!'],
     callback: function(tokens) {

       var pokemon = matcher.removeLastChar(tokens[1]);
  
       battle.selfSwitchPokemon(pokemon);

       battle.endSelfTurn();

       setNextState('TURN');

     }
    }

  ]);

  createState('ENEMYSWITCH', [ 

    {accept: ['Foe', '$TRAINER', 'sends', 'out', '$POKEMON!'],
     callback: function(tokens) {

       battle.checkEnemyTrainer(tokens[1]);

       battle.enemySwitchPokemon(matcher.removeLastChar(tokens[4]));

       battle.endEnemyTurn();

       setNextState('TURN');

     }
    }

  ]);

  createState('NOEFFECT', [
    
    {accept: ['It', 'has', 'no', 'effect!'],
     callback: function(tokens) {

       setNextState('TURN');

     }
    }

  ]);

  createState('NOTVERYEFFECTIVE', [
    
    {accept: ['It\'s', 'not', 'very', 'effective!'],
     callback: function(tokens) {

       setNextState('TURN');

     }
    }

  ]);

  createState('SUPEREFFECTIVE', [
    
    {accept: ['It\'s', 'super', 'effective!'],
     callback: function(tokens) {

       setNextState('TURN');

     }
    }

  ]);

}

var endOfTurnChecks = function(turn, move) {

    battle.endTurn(turn);

    var effectiveness = battle.checkEffectiveness(turn, move);

    if (effectiveness === 0) {

      setNextState('NOEFFECT');

    } else if (effectiveness < 1) {

      setNextState('NOTVERYEFFECTIVE');

    } else if (effectiveness > 1) {

      setNextState('SUPEREFFECTIVE');

    } else {

      setNextState('TURN');

    }

}

var clearBuffer = function() {

  buffer = [];
  buffer_index = 0;

}

var debug = function() {

  console.log('\x1B[34m' + 'STACK' + '\x1B[39m');

  console.log(getStack());

  console.log('\x1B[34m' + 'BUFFER' + '\x1B[39m');

  console.log(buffer);

  console.log('buffer_index: ' + buffer_index);

  console.log('\x1B[34m' + 'BATTLE' + '\x1B[39m');

  console.log(battle.state);

  console.log('\x1B[34m' + 'STATE' + '\x1B[39m');

  console.log(nextState);

}

var setPromptNormal = function() {

  reader.console_prompt = 'poke>';

}

var setPromptWaiting = function() {

  reader.console_prompt = '....';

}

var getStack = function() {

  return battle.getStack();

}

reader.getStack = getStack;

var getBlocks = function() {

  return battle.getBlocks();

}

reader.getBlocks = getBlocks;

},{"../errors/errors.js":5,"../pokedex/pokedex.js":8,"./battle.js":9,"./matcher.js":11}]},{},[10])(10)
});