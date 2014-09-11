var errors = {};

module.exports = errors;

var PokeLangError = function(name, message) {

  this.name = name;

  this.message = message;

};

PokeLangError.prototype = new Error();

PokeLangError.prototype.constructor = PokeLangError;

PokeLangError.prototype.setLineNumber = function(line) {

  this.line = line;

  this.name = this.name + '@' + line;

};

errors.PokeLangError = PokeLangError;

var createError = function(type) {

  errors[type + 'Error'] = function(name, message) {

    this.name = type + 'Error';

    this.errorName = name;

    this.message = name + (message ? ' - ' + message : '');

  };

  errors[type + 'Error'].prototype = new PokeLangError();

  errors[type + 'Error'].prototype.constructor = errors[type + 'Error'];

};

var initErrors = function() {

  errors.errorTypes = ['Battle',
                       'Semantic',
                       'Syntax',
                       'Interpreter'];

  for (var i = 0; i < errors.errorTypes.length; i++) {

    createError(errors.errorTypes[i]);

  }

};

initErrors();

errors.wrongPokemon = function(expected, actual) {

  return new errors.BattleError('Wrong Pokemon', 'Expected: ' + expected + ' Actual: ' + actual);

};

errors.wrongTurnOrder = function(turn) {

  return new errors.BattleError('Wrong turn order', turn + ' has moved twice before the opponent');

};

errors.unexpectedToken = function(expected, actual) {

  return new errors.SyntaxError('Unexpected token', 'Expected: \'' + expected + '\' Actual: \'' + actual + '\'');

};

errors.pokemonDoesNotKnowMove = function(pokemon, move) {

    return new errors.BattleError('Pokemon does not know move', 'Pokemon: ' + pokemon + ' Move: ' + move);

};

errors.unrecognisedPokemon = function(pokemon) {

  return new errors.SyntaxError('Unrecognised Pokemon', pokemon + ' is not a recognised Pokemon');

};

errors.missingPunctuation = function(punctuation) {

  return new errors.SyntaxError('Missing punctuation', punctuation +  ' expected');

};

errors.missingTokens = function(tokens) {

  return new errors.SyntaxError('Missing tokens', tokens + ' expected');

};

errors.trailingTokens = function(tokens) {

  return new errors.SyntaxError('Trailing tokens', '\'' + tokens + '\' unexpected');

};

errors.invalidTrainerName = function(actual, expected) {

  return new errors.SyntaxError('Invalid trainer name', 'Actual: \'' + actual +  '\' Expected: ' + expected);

};

errors.wrongTypeModifier = function(move, effect, pokemon) {

  var should = effect === 'NO EFFECT' ? 'have ' : 'be ';

  return new errors.BattleError('Wrong type modifier', move + ' should ' + should + effect + ' on ' + pokemon);

};

errors.invalidMove = function(move) {

  return new errors.SyntaxError('Invalid move', move + ' does not have a corresponding instruction');

};

errors.unrecognisedMove = function(move) {

  return new errors.SyntaxError('Unrecognised move', move + ' is not a valid move');

};

errors.blockNotClosed = function() {

  return new errors.InterpreterError('Block not closed');

};

errors.markNotFound = function() {

  return new errors.InterpreterError('Mark not found');

};

errors.arrayOutOfBounds = function(size, key) {

  return new errors.InterpreterError('Array out of bounds', 'Size: ' + size + ' Key: ' + key);

};

errors.symbolNotFound = function(symbol) {

  return new errors.InterpreterError('Symbol not found', symbol + ' is not recognised');

};

errors.wrongEnemyTrainer = function(expected, actual) {

  return new errors.SyntaxError('Wrong enemy trainer', 'Expected: ' + expected + ' Actual: ' + actual);

};

errors.missingKey = function(key) {

  return new errors.InterpreterError('Missing key', 'Key: ' + key + ' does not exist in dictionary');

};

errors.stackSizeTooSmall = function(op, expected, actual) {

  return new errors.InterpreterError('Stack size too small for ' + op, 'Expected: ' + expected + ', Actual: ' + actual);

};

errors.wrongArgument = function(op, i, expected, actual) {

  return new errors.InterpreterError('Wrong argument for ' + op, 'Argument: ' + i + ' Expected: ' + expected + ', Actual: ' + actual);

};

errors.switchNotAllowed = function(trainer) {

  return new errors.BattleError(trainer + ' switched after opponent Pokemon used move', null);

};

errors.noBlockToClose = function() {

  return new errors.InterpreterError('There is no block to close with }', null);

};

errors.missingFoe = function(pokemon) {

  return new errors.SyntaxError('Did you mean \'Foe ' + pokemon + '\'?', null);

};

errors.operationDoesNotHaveCallback = function(op) {

  return new errors.InterpreterError('Operation ', '\'' + op + '\' does not have a callback');

};

errors.unrecognisedOperation = function(op) {

  return new errors.InterpreterError('Unrecognised Operation', '\'' + op + '\' is not recognised');

};

errors.popFromEmptyArray = function() {

  return new errors.InterpreterError('Array out of bounds', 'Attempting to pop from empty array');

};
