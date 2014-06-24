var I = require('./interpreter.js'),
    tokeniser = {};

module.exports = tokeniser;

var input,
    blocks,
    symbols = {};

var init = function() {

  createSymbols();

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

    throw "Block not closed."

  }

  return currentBlock();

}

tokeniser.tokenise = tokenise;

var match = function(token) {

  if (symbols[token]) {

    currentBlock().push(I.operation(token));

  } else if (token.match(/\d+/)) {

    currentBlock().push(I.num(Number(token)));

  } else if (token == "{") {

    pushBlock();

  } else if (token =="}") {

    var block = popBlock();
 
    currentBlock().push(I.block(block)); 

  } else {

    throw "Symbol not found: " + token;

  }

}

var currentBlock = function() {

  return blocks[0];

}

var pushBlock = function() {

  blocks.unshift([]);

}

var popBlock = function() {

  return blocks.shift();

}

var createSymbol = function(symbol, callback) {

  symbols[symbol] = callback;

}

var createSymbols = function() {

  createOperations();

}

var createOperations = function() {

  for (operation in I.operations) {
    
    createSymbol(operation, true) 

  }

}


