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

    perform(num(num1.value + num2.value));

  });

  createOperation('-', ['NUM', 'NUM'], function(num1, num2) {

    perform(num(num1.value - num2.value));

  });

  createOperation('*', ['NUM', 'NUM'], function(num1, num2) {

    perform(num(num1.value * num2.value));

  });

  createOperation('/', ['NUM', 'NUM'], function(num1, num2) {

    perform(num(Math.floor(num1.value * num2.value)));

  });

  createOperation('neg', ['NUM'], function(num) {

    perform(num(-num.value));

  });

  createOperation('abs', ['NUM'], function(num) {

    perform(num(Math.abs(num.value)));

  });

  // Comparison

  createOperation('>', ['NUM', 'NUM'], function(num1, num2) {

    perform(num(Number(num1.value > num2.value)));

  });

  createOperation('>=', ['NUM', 'NUM'], function(num1, num2) {

    perform(num(Number(num1.value >= num2.value)));

  });

  createOperation('==', ['NUM', 'NUM'], function(num1, num2) {

    perform(num(Number(num1.value == num2.value)));

  });

  createOperation('<=', ['NUM', 'NUM'], function(num1, num2) {

    perform(num(Number(num1.value <= num2.value)));

  });

  createOperation('<', ['NUM', 'NUM'], function(num1, num2) {

    perform(num(Number(num1.value < num2.value)));

  });

  // Stack manipulation

  createOperation('pop', ['*'], function(arg) {

    // do nothing

  });

  createOperation('dup', ['*'], function(arg) {

    perform(arg);
    perform(arg);

  });

  createOperation('swap', ['*', '*'], function(arg1, arg2) {

    perform(arg2);
    perform(arg1);

  });

  createOperation('rot3', ['*', '*', '*'], function(arg1, arg2, arg3) {

    perform(arg3);
    perform(arg1);
    perform(arg2);

  });

  createOperation('roll', ['NUM', 'NUM'], function(num1, num2) {

    var head = stack.splice(stack.length - num1.value, num1.value);

    for (var i =0; i < num2.value; i++) {

      head.unshift(head.pop());

    }

    stack.concat(head);

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

    var num = stack[stack.length - 1];

    perform(operation('pop'));

    if (test(num.value)) {

      execList(block2.value);

      perform(block1);

      perform(block2);

      perform(operation('while')); 

    }

  });

  // Dictionary

  createOperation('store', ['NUM', '*'], function(num, arg) {

    dictionary[num] = arg;

  });

  createOperation('load', ['NUM'], function(num, arg) {

    if (dictionary[num]) {

      perform(dictionary[num]);

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

Instruction.prototype.toString = function() {

  if (this.subtype === 'BLOCK') {

    return '{' + this.value.join(' ') + '}'

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

var mark = function() {

  return Obj(value, 'MARK');

}

var operation = function(value) {

  return new Instruction('OPERATION', value);

}

interpreter.operation = operation;
