var errors = require('../errors/errors.js'),
    util = require('util');

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

    var args = getArgs(def_args);

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

Operation.prototype = Object.create(Instruction.prototype);
Operation.prototype.constructor = Operation;

interpreter.Operation = Operation;

var operation = function(value) {

  return new Operation(value);

}

interpreter.operation = operation;
