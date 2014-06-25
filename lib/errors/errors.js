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

var initErrors = function() {

  createError('Battle');

  createError('Semantic');

  createError('Syntax');

  createError('Interpreter');

}

initErrors();

errors.wrongPokemon = function(expected, actual) {

  return new errors.BattleError('Wrong Pokemon', 'Expected: ' + expected + ' Actual: ' + actual);

}

errors.wrongTurnOrder = function(turn) {

  return new errors.BattleError('Wrong turn order', turn + ' has taken two turns in a row');

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

errors.symbolNotFound = function(symbol) {

  return new errors.InterpreterError('Symbol not found', symbol + ' is not recognised');

}
