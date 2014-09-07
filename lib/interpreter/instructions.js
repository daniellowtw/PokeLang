var errors = require('../errors'),
    instructions = {
      operations: {},
      objects: {},
      opmoves: {},
      objmoves: {},
      mapping: {}
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

};

instructions.init = init;

var createOpInstruction = function(name, move, args, callback) {

  instructions.operations[name] = {
    args: args,
    callback: callback
  };

  if (move) {
    instructions.opmoves[move] = name;
  }

  if (name) {
    instructions.mapping[name] = move;
  }

};

var createObjInstruction = function(name, move, callback) {

  if (move) {
    instructions.objmoves[move] = callback;
  }

  if (name) {
    instructions.mapping[name] = move;
  }

};

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

  createOpInstruction('skip', 'SLUDGE', [], function() {

    // do nothing

  });

  createOpInstruction('pop', 'POISONSTING', ['*'], function(arg) {

    // do nothing

  });

  createOpInstruction('dup', 'ROCKTHROW', ['*'], function(arg) {

    I.exec(arg);
    I.exec(I.clone(arg));

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

    if (num1 < 0 || num1 >= arr.value.length) {

      throw errors.arrayOutOfBounds(arr.value.length, num1);

    }

    arr.value[num1] = arg;

    I.exec(arr);

  });

  createOpInstruction('get', 'FIREPUNCH', ['ARRAY', 'NUM'], function(arr, num1) {

    if (num1 < 0 || num1 >= arr.value.length) {

      throw errors.arrayOutOfBounds(arr.value.length, num1);

    }

    I.exec(arr.value[num1]);

  });

  createOpInstruction('append', 'ROLLINGKICK', ['ARRAY', '*'], function(arr, arg) {

    arr.value.push(arg);

    I.exec(arr);

  });

  createOpInstruction('join', 'SMOG', ['ARRAY', 'ARRAY'], function(arr1, arr2) {

    var arr = arr1.value.concat(arr2.value);

    I.exec(I.array(arr));

  });

  createOpInstruction('len', 'QUICKATTACK', ['ARRAY'], function(arr) {

    I.exec(I.num(arr.value.length));

  });

  createOpInstruction('arrpop', 'JUMPKICK', ['ARRAY'], function(arr) {

    if (arr.value.length === 0) {

      throw errors.popFromEmptyArray();

    }

    var value = arr.value;

    var element = value.pop();

    I.exec(I.array(value));

    I.exec(element);

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

  createOpInstruction('read', 'ACID', [], function() {

    var result = I.input('Input an integer: ', 'Input was not an integer, try again: ', function(data) {

      var match = data.match(/[-]?[0-9]+/);

      return (match && match[0].length === data.length);

    });

    I.exec(I.num(result));

  });

  // Dictionary

  createOpInstruction('store', 'CONFUSION', ['NUM', '*'], function(num1, arg) {

    I.dictionary[num1.value] = I.clone(arg);

  });

  createOpInstruction('load', 'PSYBEAM', ['NUM'], function(num1, arg) {

    if (I.dictionary[num1.value]) {

      I.exec(I.dictionary[num1.value]);

    } else {

      throw errors.missingKey(num1.value); 
   
    }

  });

  // debug

  createOpInstruction('dict', 'AURORABEAM', [], function() {

    for (var i = 0; i < I.dictionary.length; i++) {
      
      console.log(i + ' ' + I.dictionary[i]);

    }

  });

  createOpInstruction('stack', 'ICEBEAM', [], function() {

    console.log(I.getStack());

  });

  createOpInstruction('debug', 'BLIZZARD', ['*'], function(arg) {

    console.log(arg);

    I.exec(arg);

  });

};

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

};
