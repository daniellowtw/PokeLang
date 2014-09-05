var errors = {};

module.exports = errors;

var PokeLangError = function(name, message) {

  this.name = name;

  this.message = message;

}

PokeLangError.prototype = new Error();

PokeLangError.prototype.constructor = PokeLangError;

errors.PokeLangError = PokeLangError;

var createError = function(type) {

  errors[type + 'Error'] = function(name, message, line, pos) {

    line = line ? '@' + line : '';

    this.name = type + 'Error' + line;

    this.errorName = name;
 
    this.message = name + (message ? ' - ' + message : '');

    this.pos = pos;

  }

  errors[type + 'Error'].prototype = new PokeLangError();

  errors[type + 'Error'].prototype.constructor = errors[type + 'Error'];

}

var initErrors = function() {

  errors.errorTypes = ['Battle'
                      ,'Semantic'
                      ,'Syntax'
                      ,'Interpreter'
                      ];

  for (var i = 0; i < errors.errorTypes.length; i++) {

    createError(errors.errorTypes[i]);

  }

}

initErrors();

errors.wrongPokemon = function(expected, actual, line, pos) {

  return new errors.BattleError('Wrong Pokemon', 'Expected: ' + expected + ' Actual: ' + actual, line);

}

errors.wrongTurnOrder = function(turn, line, pos) {

  return new errors.BattleError('Wrong turn order', turn + ' has moved twice before the opponent', line);

}

errors.unexpectedToken = function(expected, actual, line, pos) {
 
  return new errors.SyntaxError('Unexpected token', 'Expected: \'' + expected + '\' Actual: \'' + actual + '\'', line);

}

errors.pokemonDoesNotKnowMove = function(pokemon, move, line, pos) {

    return new errors.BattleError('Pokemon does not know move', 'Pokemon: ' + pokemon + ' Move: ' + move, line);

}

errors.unrecognisedPokemon = function(pokemon, line, pos) {

  return new errors.SyntaxError('Unrecognised Pokemon', pokemon + ' is not a recognised Pokemon', line);

}

errors.missingPunctuation = function(punctuation, line, pos) {

  return new errors.SyntaxError('Missing punctuation', punctuation +  ' expected', line);

}

errors.missingTokens = function(tokens, line, pos) {

  return new errors.SyntaxError('Missing tokens', tokens + ' expected', line);

}

errors.trailingTokens = function(tokens, line, pos) {

  return new errors.SyntaxError('Trailing tokens', '\'' + tokens + '\' unexpected', line);

}

errors.invalidTrainerName = function(actual, expected, line, pos) {

  return new errors.SyntaxError('Invalid trainer name', 'Actual: \'' + actual +  '\' Expected: ' + expected, line);

}

errors.wrongTypeModifier = function(move, effect, pokemon, line, pos) {

  var should = effect === 'NO EFFECT' ? 'have ' : 'be ';

  return new errors.BattleError('Wrong type modifier', move + ' should ' + should + effect + ' on ' + pokemon, line); 

}

errors.invalidMove = function(move, line, pos) {

  return new errors.SyntaxError('Invalid move', move + ' does not have a corresponding instruction', line);

}

errors.unrecognisedMove = function(move, line, pos) {

  return new errors.SyntaxError('Unrecognised move', move + ' is not a valid move', line);

}

errors.blockNotClosed = function(line, pos) {

  return new errors.InterpreterError('Block not closed', line);

}

errors.markNotFound = function(line, pos) {

  return new errors.InterpreterError('Mark not found', line);

}

errors.arrayOutOfBounds = function(size, key, line, pos) {

  return new errors.InterpreterError('Array out of bounds', 'Size: ' + size, ' Key: ' + key, line);

}

errors.symbolNotFound = function(symbol, line, pos) {

  return new errors.InterpreterError('Symbol not found', symbol + ' is not recognised', line);

}

errors.wrongEnemyTrainer = function(expected, actual, line, pos) {

  return new errors.SyntaxError('Wrong enemy trainer', 'Expected: ' + expected + ' Actual: ' + actual, line);

}

errors.missingKey = function(key, line, pos) {
 
  return new errors.InterpreterError('Missing key', 'Key: ' + num + ' does not exist in dictionary', line);

}

errors.stackSizeTooSmall = function(expected, actual, line, pos) {
 
  return new errors.InterpreterError('Stack size too small', 'Expected: ' + expected + ', Actual: ' + actual, line);

}

errors.wrongArgument = function(i, expected, actual, line, pos) {
 
  return new errors.InterpreterError('Wrong argument', 'Argument: ' + i + ' Expected: ' + expected + ', Actual: ' + actual, line);

}

errors.switchNotAllowed = function(trainer, line, pos) {
 
  return new errors.BattleError(trainer + ' switched after opponent Pokemon used move', null, line);

}

errors.noBlockToClose = function(line, pos) {
 
  return new errors.InterpreterError('There is no block to close with }', null, line);

}

errors.missingFoe = function(pokemon, line, pos) {
 
  return new errors.SyntaxError('Did you mean \'Foe ' + pokemon + '\'?', null, line);

}

errors.unrecognisedOperation = function(op, line, pos) {
 
  return new errors.InterpreterError('Unrecognised Operation', '\'' + op + '\' is not recognised', line);

}
