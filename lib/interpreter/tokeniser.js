var I = require('./interpreter.js'),
    errors = require('../errors/errors.js'),
    tokeniser = {};

module.exports = tokeniser;

var input,
    blocks,
    symbols = {};

var init = function() {

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
