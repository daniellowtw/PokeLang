var interpreter = {};

// require
module.exports = interpreter;

// state
var instruction_list = [],
    stack = [],
    dictionary = {},
    operations = {};

// initialises the instruction_list
// and calls exec
var run = function(instructions) {

  clear();

  instruction_list = instructions;

  exec(instruction_list);

  // return the top value of stack
  return stack;

}

interpreter.run = run;

var init = function() {

  initOperations();

}

interpreter.init = init;

var clear = function() {

  stack = [];

}

// shifts the instructions array
// performs the instruction
var exec = function(instructions) {

  var instr = instructions.shift();

  if (instr) {

    perform(instr);

    exec(instructions);

  } else {

    // end of instructions

  }

}

// performs the instr
var perform = function(instr) {

  if (instr.type === "OBJECT") {

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

  createOperation('+', ['NUM', 'NUM'], function(num1, num2) {

    stack.push(num(num1.value + num2.value));

  });

  createOperation('exec', ['BLOCK'], function(block) {

    exec(block.value);

  });

  createOperation('dup', ['*'], function(arg) {

    stack.push(arg);
    stack.push(arg);

  });
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

    throw 'Stack size too small. Expected: ' + def_size + ', Actual: ' + stack.length;

  }

}

var getArgs = function(def_args) {

  var args = stack.splice(stack.length - def_args.length, def_args.length);

  for (var i = 0; i < def_args.length; i++) {

    if (!checkArg(i, def_args[i], args[i])) {

      throw 'Argument ' + i + ': Expected: ' + def_args[i] + ', Actual: ' + args[i].subtype;
    
    }

  }  
  
  return args;

}

// checks if args match
// subtypes are compared
var checkArg = function(i, expected, actual) {

  if (actual && expected === '*') {

    return true;

  }

  if (actual && actual.subtype !== expected) {
   
    return false;

  }

  return true;

}

// instructions
// TODO: change to OO
var  Instruction = function(type, value, subtype) {

    this.type = type;
    this.value = value;
    this.subtype = subtype;

}

var Obj = function(value, subtype) {

  return new Instruction('OBJECT', value, subtype);

}

var num = function(value) {

  return new Obj(value, 'NUM');

}

interpreter.num = num;

var block = function(value) {

  return new Obj(value, 'BLOCK');

}

interpreter.block = block;

var mark = function() {

  return new Obj(value, 'MARK');

}

var operation = function(value) {

  return new Instruction('OPERATION', value);

}

interpreter.operation = operation;
