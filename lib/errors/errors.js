var errors = {};

module.exports = errors;

var createError = function(type) {

  errors[type + 'Error'] = function(name, message) {

    this.name = name;
 
    this.message = message || '';

  }

  errors[type + 'Error'].prototype = new Error();

  errors[type + 'Error'].prototype.constructor = errors[type + 'Error'];

}

errors.errorTypes = ['Battle'
                   ,'Semantic'
                   ,'Syntax',
                   ,'Interpreter'
                   ];

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

errors.wrongPokemon = function(expected, actual) {

  return new errors.BattleError('Wrong Pokemon', 'Expected: ' + expected + ' Actual: ' + actual);

}

errors.wrongTurnOrder = function(turn) {

  return new errors.BattleError('Wrong turn order', turn + ' twice in a row');

}

errors.unexpectedToken = function(expected, actual) {
 
  return new errors.SyntaxError('Unexpected token', 'Expected: ' + expected + ' Actual: ' + actual);

}

errors.pokemonDoesNotKnowMove = function(pokemon, move) {

    return new errors.BattleError('Pokemon does not know move', 'Pokemon: ' + pokemon + ' Move: ' + move);

}

errors.unrecognisedPokemon = function(pokemon) {

  return new errors.SyntaxError('Unrecognised Pokemon', pokemon + " is not a recognised Pokemon");

}

errors.wrongTypeModifier = function(move, effect, pokemon) {

  var should = effect === 'NO EFFECT' ? 'have ' : 'be ';

  return new errors.BattleError('Wrong type modifier', move + ' should ' + should + effect + ' on ' + pokemon); 

}

errors.invalidMove = function(move) {

  return new errors.SyntaxError('Invalid move', move + ' does not have a valid instruction');

}

errors.blockNotClosed = function() {

  return new errors.InterpreterError('Block not closed');

}

errors.markNotFound = function() {

  return new errors.InterpreterError('Mark not found');

}

errors.arrayOutOfBounds = function(size, key) {

  return new errors.InterpreterError('Array out of bounds', 'Size: ' + size, ' Key: ' + key);

}

errors.symbolNotFound = function(symbol) {

  return new errors.InterpreterError('Symbol not found', symbol + ' is not recognised');

}

errors.wrongEnemyTrainer = function(expected, actual) {

  return new errors.SyntaxError('Wrong enemy trainer', 'Expected: ' + expected + ' Actual: ' + actual);

}

errors.missingKey = function(key) {
 
  return new errors.InterpreterError('Missing key', 'Key: ' + num + ' does not exist in dictionary');

}

errors.stackSizeTooSmall = function(expected, actual) {
 
  return new errors.InterpreterError('Stack size too small', 'Expected: ' + expected + ', Actual: ' + actual);

}

errors.wrongArgument = function(i, expected, actual) {
 
  return new errors.InterpreterError('Wrong argument', 'Argument: ' + i + ' Expected: ' + expected + ', Actual: ' + actual);

}
