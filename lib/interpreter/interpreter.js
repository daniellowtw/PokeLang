var errors = require('../errors/errors.js');

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

  execList(instruction_list);

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

  createOperation('neg', ['NUM'], function(num) {

    exec(num(-num.value));

  });

  createOperation('abs', ['NUM'], function(num) {

    exec(num(Math.abs(num.value)));

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

  createOperation('ifelse', ['NUM', 'BLOCK', 'BLOCK'], function(num, block1, block2) {

    if (test(num.value)) {

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

  createOperation('_while', ['NUM', 'BLOCK', 'BLOCK'], function(num, block1, block2) {

    if (test(num.value)) {

      execList(block2.value);

      exec(block1);

      exec(block2);

      exec(operation('while'));

    }

  });

  // Arrays

  createOperation(']', ['*'], function(arg) {

    if (arg.subtype === 'MARK') {

      exec(array([]));

    } else {

      exec(operation(']'));

      exec(arg);

      exec(operation('append'));

    }

  });

  createOperation('put', ['ARRAY', '*', 'NUM'], function(arr, arg, num) {

    if (num < 0 || num >= arr.value.size) {

      throw errors.arrayOutOfBounds(arr.value.size, num);

    }

    arr.value[num] = arg;

    exec(arr);

  });

  createOperation('get', ['ARRAY', 'NUM'], function(arr, num) {

    if (num < 0 || num >= arr.value.size) {

      throw errors.arrayOutOfBounds(arr.value.size, num);

    }

    exec(arr.value[num]);

  });

  createOperation('append', ['ARRAY', '*'], function(arr, arg) {

    arr.value.push(arg);

    exec(arr);

  });

  createOperation('arrpop', ['ARRAY'], function(arr) {

    exec(arr.value.pop());

  });

  createOperation('map', ['ARRAY', 'BLOCK'], function(arr, block) {

    exec(mark());

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

  createOperation('out', ['NUM'], function(num) {

    console.log(String.fromCharCode(num.value));

  });

  // Dictionary

  createOperation('store', ['NUM', '*'], function(num, arg) {

    dictionary[num] = arg;

  });

  createOperation('load', ['NUM'], function(num, arg) {

    if (dictionary[num]) {

      exec(dictionary[num]);

    } else {

      throw errors.missingKey(num); 
   
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

    if (!checkArg(i, def_args[i], args[i])) {

      throw errors.wrongArgument(i, def_args[i], args[i].subtype); 
    
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

Instruction.prototype.toString = function() {

  if (this.subtype === 'BLOCK') {

    return '{' + this.value.join(' ') + '}'

  } else if (this.subtype === 'ARRAY') {

    return '[' + this.value.join(' ') + ']'

  } else {

    return this.value;

  }

}

var Obj = function(value, subtype) {

  return new Instruction('OBJECT', value, subtype);

}

var num = function(value) {

  return Obj(value, 'NUM');

}

interpreter.num = num;

var block = function(value) {

  return Obj(value, 'BLOCK');

}

interpreter.block = block;

var array = function(value) {

  return Obj(value, 'ARRAY');

}

interpreter.array = array;

var mark = function() {

  return Obj(']', 'MARK');

}

interpreter.mark = mark;

var operation = function(value) {

  return new Instruction('OPERATION', value);

}

interpreter.operation = operation;
