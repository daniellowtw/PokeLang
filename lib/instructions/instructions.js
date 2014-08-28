var errors = require('../errors/errors.js'),
    instructions = {
      instr: {},
      moves: {}
    },
    I,
    init_flag = false;

module.exports = instructions;

var init = function(interpreter) {

  if (init_flag) {

    return;

  }

  I = interpreter;

  createInstructions();

  init_flag = true;

}

instructions.init = init;

var createInstruction = function(name, move, args, callback) {

  instructions.instr[name] = {
    args: args,
    callback: callback
  }

  if (move) {
    instructions.moves[move] = name;
  }

}

var createInstructions = function() {

  // Exec

  createInstruction('exec', 'THUNDER', ['BLOCK'], function(block) {

    I.execList(block.value);

  });

  // Arithmetic 

  createInstruction('+', 'EMBER', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(num1.value + num2.value));

  });

  createInstruction('-', 'WATERGUN', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(num1.value - num2.value));

  });

  createInstruction('*', 'FLAMETHROWER', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(num1.value * num2.value));

  });

  createInstruction('/', 'HYDROPUMP', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(Math.floor(num1.value * num2.value)));

  });

  createInstruction('neg', '', ['NUM'], function(num1) {

    I.exec(I.num(-num1.value));

  });

  createInstruction('abs', '',  ['NUM'], function(num1) {

    I.exec(I.num(Math.abs(num1.value)));

  });

  // Comparison

  createInstruction('>', 'HEADBUTT', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(Number(num1.value > num2.value)));

  });

  createInstruction('>=', 'BITE', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(Number(num1.value >= num2.value)));

  });

  createInstruction('==', 'POUND', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(Number(num1.value == num2.value)));

  });

  createInstruction('<=', 'HORNATTACK', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(Number(num1.value <= num2.value)));

  });

  createInstruction('<', 'BODYSLAM', ['NUM', 'NUM'], function(num1, num2) {

    I.exec(I.num(Number(num1.value < num2.value)));

  });

  // Stack manipulation

  createInstruction('pop', 'POISONSTING', ['*'], function(arg) {

    // do nothing

  });

  createInstruction('dup', 'ROCKTHROW', ['*'], function(arg) {

    I.exec(arg);
    I.exec(arg);

  });

  createInstruction('swap', 'VINEWHIP', ['*', '*'], function(arg1, arg2) {

    I.exec(arg2);
    I.exec(arg1);

  });

  createInstruction('rot3', 'RAZORLEAF', ['*', '*', '*'], function(arg1, arg2, arg3) {

    I.exec(arg3);
    I.exec(arg1);
    I.exec(arg2);

  });

  createInstruction('rot4', '', ['*', '*', '*', '*'], function(arg1, arg2, arg3, arg4) {

    I.exec(arg4);
    I.exec(arg1);
    I.exec(arg2);
    I.exec(arg3);

  });

  createInstruction('rot5', '', ['*', '*', '*', '*', '*'], function(arg1, arg2, arg3, arg4, arg5) {

    I.exec(arg5);
    I.exec(arg1);
    I.exec(arg2);
    I.exec(arg3);
    I.exec(arg4);

  });

  // Control Flow

  createInstruction('ifelse', 'EARTHQUAKE', ['NUM', 'BLOCK', 'BLOCK'], function(num1, block1, block2) {

    if (I.test(num1.value)) {

      I.execList(block1.value);

    } else {

      I.execList(block2.value);

    }

  });

  createInstruction('while', 'SCRATCH', ['BLOCK', 'BLOCK'], function(block1, block2) {

    I.execList(block1.value);

    I.exec(block1);

    I.exec(block2);

    I.exec(I.operation('_while')); 

  });

  createInstruction('_while', '', ['NUM', 'BLOCK', 'BLOCK'], function(num1, block1, block2) {

    if (I.test(num1.value)) {

      I.execList(block2.value);

      I.exec(block1);

      I.exec(block2);

      I.exec(I.operation('while'));

    }

  });

  // Arrays

  createInstruction(']', 'THUNDERPUNCH', ['*'], function(arg) {

    if (arg instanceof I.MarkObj) {

      I.exec(I.array([]));

    } else {

      I.exec(I.operation(']'));

      I.exec(arg);

      I.exec(I.operation('append'));

    }

  });

  createInstruction('put', 'ICEPUNCH', ['ARRAY', '*', 'NUM'], function(arr, arg, num1) {

    if (num1 < 0 || num1 >= arr.value.size) {

      throw errors.arrayOutOfBounds(arr.value.size, num1);

    }

    arr.value[num1] = arg;

    I.exec(arr);

  });

  createInstruction('get', 'FIREPUNCH', ['ARRAY', 'NUM'], function(arr, num1) {

    if (num1 < 0 || num1 >= arr.value.size) {

      throw errors.arrayOutOfBounds(arr.value.size, num1);

    }

    I.exec(arr.value[num1]);

  });

  createInstruction('append', 'ROLLINGKICK', ['ARRAY', '*'], function(arr, arg) {

    arr.value.push(arg);

    I.exec(arr);

  });

  createInstruction('arrpop', 'JUMPKICK', ['ARRAY'], function(arr) {

    I.exec(arr.value.pop());

  });

  createInstruction('map', 'HIJUMPKICK', ['ARRAY', 'BLOCK'], function(arr, block) {

    I.exec(I.mark('['));

    for (var i = 0; i < arr.value.length; i++) {

      I.exec(arr.value[i]);

      I.execList(block.value);

    }

    I.exec(I.operation(']'));

  });

  createInstruction('fold', 'MEGAKICK', ['ARRAY', 'BLOCK'], function(arr, block) {

    for (var i = 0; i < arr.value.length; i++) {

      I.exec(arr.value[i]);

      I.execList(block.value);

    }

  });

  // IO

  createInstruction('outa', 'SLASH', ['NUM'], function(num1) {

    I.out(String.fromCharCode(num1.value));

  });

  createInstruction('outi', 'SWIFT', ['NUM'], function(num1) {

    I.out(num1.value);

  });

  // Dictionary

  createInstruction('store', 'CONFUSION', ['NUM', '*'], function(num1, arg) {

    I.dictionary[num1] = arg;

  });

  createInstruction('load', 'PSYBEAM', ['NUM'], function(num1, arg) {

    if (I.dictionary[num1]) {

      I.exec(I.dictionary[num1]);

    } else {

      throw errors.missingKey(num1); 
   
    }

  });
}
