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

  var output = func || util.print;

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

  interpreter.input = inputFunc || noFunc;

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
