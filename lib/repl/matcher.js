var pokedex = require('../pokedex/pokedex.js'),
    errors = require('../errors/errors.js');

var matcher = {},
    reader,
    match_cases = {},
    init_flag = false;

module.exports = matcher;

var init = function(r) {

  if (init_flag) {

    return;

  }

  reader = r;

  createMatchCases();
  
  init_flag = true;
  
};

matcher.init = init;

var matchWord = function(actual, expected) {

  return compareWord(actual, expected);

};

matcher.matchWord = matchWord;

var peekWord = function(actual, expected) {

  return !(compareWord(actual, expected) instanceof Error);

};

var compareWord = function(actual, expected) {

  var result = true;

  if (expected[0] === '$') {

    result =  match_cases[expected].call(null, actual);

  } else if (actual !== expected) {

    result =  errors.unexpectedToken(expected, actual, reader.currentLine);

  } 

  return result;

};

var createMatchCase = function(name, callback) {

  match_cases[name] = callback;

};

var createMatchCases = function() {

  createMatchCase('$POKEMON', function(actual) {

    if (!pokedex.pokemon[actual]) {

      return errors.unrecognisedPokemon(actual, reader.currentLine);

    }  

    return true;

  });

  createMatchCase('$POKEMON!', function(actual) {

    var exclamation = actual[actual.length-1];

    if (exclamation !== '!') {

      var result = match_cases.$POKEMON.call(null, actual);

      if (result === true) {

        return errors.missingPunctuation('!', reader.currentLine); 

      } else {

        return result;

      }
    }

    var pokemon_name = removeLastChar(actual);

    return match_cases.$POKEMON.call(null, pokemon_name);

  });

  createMatchCase('$TRAINER', function(actual) {

    if (!actual.match(/[A-Z]+/)) {

      return errors.invalidTrainerName(actual, '[A-Z]+', reader.currentLine);

    }

    return true;

  });

  createMatchCase('$MOVE!', function(actual) {

    var exclamation = actual[actual.length-1];

    if (exclamation !== '!') {

      var result = match_cases.$MOVE.call(null, actual);

      if (result === true) {

        return errors.missingPunctuation('!', reader.currentLine); 

      } else {

        return result;

      }
    }

    var move = removeLastChar(actual);

    return match_cases.$MOVE.call(null, move);

  });

  createMatchCase('$MOVE', function(actual) {

    if (!pokedex.moveList[actual]) {

      throw errors.unrecognisedMove(actual, reader.currentLine);

    }

    return true;

  });

};

var removeLastChar = function(string) {

  return string.substring(0, string.length - 1);

};

matcher.removeLastChar = removeLastChar;
