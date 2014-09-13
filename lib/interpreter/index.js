var errors = require('../errors'),
    instructions = require('./instructions.js'),
    util = require('util');

var interpreter = {};

// require
module.exports = interpreter;

// state
var stack = [],
    dictionary = [],
    operations = {},
    blocks = [],
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

};

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

};

interpreter.init = init;

var reset = function() {

  stack = [];

  dicitonary = [];

  blocks = [];

};

interpreter.reset = reset;

var execList = function(list) {

  for (var i = 0; i < list.length; i++) {

    exec(list[i]);

  }

};

interpreter.execList = execList;

// shifts the instructions array
// performs the instruction
var exec = function(instr) {

  if (instr instanceof interpreter.OpenblockObj) {

    blocks.push([]);

  } else if (instr instanceof interpreter.CloseblockObj) {

    if (blocks.length === 0) {

      throw errors.noBlockToClose();

    }

    var newBlock = blocks.pop();

    exec(block(newBlock));

  } else if (blocks.length > 0) {

    var lastBlock = blocks[blocks.length - 1];

    lastBlock.push(instr);

  } else {

    perform(instr);

  }

};

interpreter.exec = exec;

// performs the instr
var perform = function(instr) {

  if (instr instanceof Obj) {

    return performObj(clone(instr));

  }

  // else
  return performOp(instr);

};

// puts the object on the stack
var performObj = function(obj) {

  stack.push(obj);

};

var performOp = function(op) {

  if (!op || !(operations[op.value])) {

    throw errors.unrecognisedOperation(op);

  }

  operations[op.value].apply(null);

};

interpreter.operations = operations;

var test = function(arg) {

  return !!arg;

};

interpreter.test = test;

var createOperation = function(value, def_args, callback) {

  if (!(callback instanceof Function)) {

    throw errors.operationDoesNotHaveCallback(value);

  }

  operations[value] = function() {

    // check args
    var args = getArgs(def_args, value);

    callback.apply(null, args);

  };

};

var createOperations = function() {

  for (var instr in instructions.operations) {

    createOperation(instr, instructions.operations[instr].args, instructions.operations[instr].callback);

  }

};

var checkStackSize = function(def_args_size, op) {


  if (stack.length < def_args_size) {

    throw errors.stackSizeTooSmall(op, def_args_size, stack.length);

  }

};

var getArgs = function(def_args, op) {

  checkStackSize(def_args.length, op);

  var args = stack.splice(stack.length - def_args.length, def_args.length);

  for (var i = 0; i < def_args.length; i++) {

    if (!checkArg(def_args[i], args[i])) {

      throw errors.wrongArgument(op, i, def_args[i], args[i].subclass);

    }

  }

  return args;

};

// checks if args match
// subclasses are compared
var checkArg = function(expected, actual) {

  if (actual) {

    var compareClass = {

      '*': interpreter.Obj,
      'NUM': interpreter.NumObj,
      'BLOCK': interpreter.BlockObj,

    }[expected];

    if (compareClass && actual instanceof compareClass) {

      return true;

    }

  }

  return false;

};

var setOutputFunction = function(func) {

  var output = func instanceof Function ? func : util.print;

  interpreter.out = function(out) {

    output.call(null, out);

  };

};

interpreter.setOutputFunction = setOutputFunction;

var setInputFunction = function(inputFunc) {

  var noFunc = function() {

    interpreter.out('No input function set\n');

    return 0;

  };

  var func = inputFunc || noFunc;

  interpreter.input = function(prompt, error, check) {

    return func.call(null, prompt, error, check);

  };

};

interpreter.setInputFunction = setInputFunction;

// instructions
var  Instruction = function(value) {

    this.value = value;

};

Instruction.prototype.toString = function() {

  return this.value;

};

var Obj = function(value) {

  this.value = value;

};

Obj.prototype = new Instruction();
Obj.prototype.constructor = Obj;

interpreter.Obj = Obj;

var clone = function(obj) {

  if (!(obj instanceof Obj)) {

    return obj;

  }

  var copy = new obj.constructor();

  var copied_value;

  if (obj.value instanceof Array) {

    copied_value = [];

    for(var i = 0; i < obj.value.length; i++) {

      copied_value.push(clone(obj.value[i]));

    }

  } else {

    copied_value = obj.value;

  }

  copy.value = copied_value;

  return copy;

};

interpreter.clone = clone;

var createObjConstructor = function(subclass, callback) {

  var objClass = subclass + 'Obj';

  interpreter[objClass] = function(value) {

    this.value = value;

    this.subclass = subclass.toUpperCase();

  };

  interpreter[objClass].prototype = Object.create(Obj.prototype);
  interpreter[objClass].prototype.constructor = interpreter[objClass];

  interpreter[subclass.toLowerCase()] = function(value) {

    return new interpreter[objClass](value);

  };

  if (callback) {

    interpreter[objClass].prototype.toString = callback;

  }
};

var initInstrConstructors = function() {

  createObjConstructor('Num');
  createObjConstructor('Block', arrToString('[', ']'));
  createObjConstructor('Openblock');
  createObjConstructor('Closeblock');

  num = interpreter.num;
  closeblock = interpreter.closeblock;
  openblock = interpreter.openblock;
  block = interpreter.block;

};

var arrToString = (function(start, end) {

  return function() {

    var str = start + ' ';

    for (var i = 0; i < this.value.length; i++) {

      str += this.value[i].toString() + ' ';

    }

    return str + end;

  };

});

var Operation = function(value) {

  this.value = value;

};

Operation.prototype = Object.create(Instruction.prototype);
Operation.prototype.constructor = Operation;

interpreter.Operation = Operation;

var operation = function(value) {

  return new Operation(value);

};

interpreter.operation = operation;

var translateMove = function(move) {

  var instruction;

  if (instructions.opmoves[move]) {

    instruction = operation(instructions.opmoves[move]);

  } else if (instructions.objmoves[move]) {

    instruction = instructions.objmoves[move].apply(null);

  } else {

    throw errors.invalidMove(move);
  }

  return instruction;

};

interpreter.translateMove = translateMove;

var getStack = function() {

  return stack.toString();

};

interpreter.getStack = getStack;
