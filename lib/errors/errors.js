var errors = {};

module.exports = errors;

var createError = function(type) {

  errors[type + 'Error'] = function(name, message, line, pos) {

    this.name = name;
 
    this.message = message;

    this.line = line;

    this.pos = pos;

  }

  errors[type + 'Error'].prototype = new Error();

  errors[type + 'Error'].prototype.constructor = errors[type + 'Error'];

}

var initErrors = function() {

  errors.errorTypes = ['Battle'
                      ,'Semantic'
                      ,'Syntax',
                      ,'Interpreter'
                      ];

  for (var i = 0; i < errors.errorTypes.length; i++) {

    createError(errors.errorTypes[i]);

  }

}

initErrors();

errors.wrongPokemon = function(expected, actual, line, pos) {

  return new errors.BattleError('Wrong Pokemon', 'Expected: ' + expected + ' Actual: ' + actual);

}

errors.wrongTurnOrder = function(turn, line, pos) {

  return new errors.BattleError('Wrong turn order', turn + ' has moved twice before the opponent');

}

errors.unexpectedToken = function(expected, actual, line, pos) {
 
  return new errors.SyntaxError('Unexpected token', 'Expected: ' + expected + ' Actual: \'' + actual + '\'');

}

errors.pokemonDoesNotKnowMove = function(pokemon, move, line, pos) {

    return new errors.BattleError('Pokemon does not know move', 'Pokemon: ' + pokemon + ' Move: ' + move);

}

errors.unrecognisedPokemon = function(pokemon, line, pos) {

  return new errors.SyntaxError('Unrecognised Pokemon', pokemon + ' is not a recognised Pokemon');

}

errors.missingPunctuation = function(punctuation, line, pos) {

  return new errors.SyntaxError('Missing punctuation', punctuation +  '  expected');

}

errors.missingTokens = function(tokens, line, pos) {

  return new errors.SyntaxError('Missing tokens', tokens + ' expected');

}

errors.trailingTokens = function(tokens, line, pos) {

  return new errors.SyntaxError('Trailing tokens', '\'' + tokens + '\' unexpected');

}

errors.invalidTrainerName = function(actual, expected, line, pos) {

  return new errors.SyntaxError('Invalid trainer name', 'Actual: \'' + actual +  '\' Expected: ' + expected);

}

errors.wrongTypeModifier = function(move, effect, pokemon, line, pos) {

  var should = effect === 'NO EFFECT' ? 'have ' : 'be ';

  return new errors.BattleError('Wrong type modifier', move + ' should ' + should + effect + ' on ' + pokemon); 

}

errors.invalidMove = function(move, line, pos) {

  return new errors.SyntaxError('Invalid move', move + ' does not have a valid instruction');

}

errors.blockNotClosed = function(line, pos) {

  return new errors.InterpreterError('Block not closed');

}

errors.markNotFound = function(line, pos) {

  return new errors.InterpreterError('Mark not found');

}

errors.arrayOutOfBounds = function(size, key, line, pos) {

  return new errors.InterpreterError('Array out of bounds', 'Size: ' + size, ' Key: ' + key);

}

errors.symbolNotFound = function(symbol, line, pos) {

  return new errors.InterpreterError('Symbol not found', symbol + ' is not recognised');

}

errors.wrongEnemyTrainer = function(expected, actual, line, pos) {

  return new errors.SyntaxError('Wrong enemy trainer', 'Expected: ' + expected + ' Actual: ' + actual);

}

errors.missingKey = function(key, line, pos) {
 
  return new errors.InterpreterError('Missing key', 'Key: ' + num + ' does not exist in dictionary');

}

errors.stackSizeTooSmall = function(expected, actual, line, pos) {
 
  return new errors.InterpreterError('Stack size too small', 'Expected: ' + expected + ', Actual: ' + actual);

}

errors.wrongArgument = function(i, expected, actual, line, pos) {
 
  return new errors.InterpreterError('Wrong argument', 'Argument: ' + i + ' Expected: ' + expected + ', Actual: ' + actual);

}

errors.switchNotAllowed = function(line, pos) {
 
  return new errors.BattleError('Trainer switched after enemy Pokemon used move');

}
