var pokedex = require('../walker/pokedex.js'),
    errors = require('../errors/errors.js');

var reader = {
      battle: {}  
    },
    states = {},
    matchCases = {};
    lines = [],
    nextState = 'START',
    init_flag = false,
    battle = reader.battle;

module.exports = reader;

var init = function() {

  if (init_flag) {

    return;

  }

  createStates();

  createMatchCases();

  init_flag = true;

}

reader.init = init;

var reset = function() {

  battle = reader.battle = {};
  lines = [];
  nextState = 'START';

}

reader.reset = reset;

var read = function(input) {

  lines = tokenise(input);

  while (lines.length) {

    visitNextState();
  
  }

}

reader.read = read;

var tokenise = function(input) {

  var lines = input.split('\n');

  var nonEmptyLines = [];

  for (var i = 0; i < lines.length; i++) {

    var line = lines[i].match(/\S+/g);

    if (line) {

      nonEmptyLines.push(line);

    }

  }
 
  return nonEmptyLines;

}

var getNextLine = function() {

  return lines.shift();

}

var lookAhead = function() {

  return lines[0][0];

}

var visitNextState = function() {

  states[nextState].apply(null);  

}

var createState = function(name, callback) {

  states[name] = callback; 

}

var createStates = function() {

  createState('START', function() {

    var line = getNextLine();

    matchLine(line, ['Go!', '$POKEMON!']); 

    selfSendsOut(line[1].substring(0, line[1].length-1));

    nextState = 'START2'; 

  });

  createState('START2', function() {

    var line = getNextLine();

    matchLine(line, ['Foe', '$TRAINER', 'sends', 'out', '$POKEMON!']); 

    setEnemyTrainer(line[1]);

    enemySendsOut(line[4].substring(0, line[4].length-1));

    nextState = '_TURN'; 

  });

  createState('_TURN', function() {

    var lookahead = lookAhead();

    if (peekWord(lookahead, '$POKEMON')) {

      nextState = 'SELFTURN'; 

    } else if (peekWord(lookahead, 'Foe')) {

      nextState = 'ENEMYTURN';

    } else if (peekWord(lookahead, '$POKEMON!')) {

      nextState = 'SELFSWITCH';

    } else {

      throw errors.unexpectedToken(['$POKEMON', '$POKEMON!', 'Foe'], lookahead);

    }

  });

}

var matchLine = function(actual, expected) {

  for (var i = 0; i < actual.length; i++) {

    if (i >= expected.length) {

      throw errors.trailingTokens(actual.slice(i));

    }

    matchWord(actual[i], expected[i]);

  }

  if (expected.length > actual.length) {

    throw errors.missingTokens(expected.slice(actual.length));

  }

}

var matchWord = function(actual, expected) {

  compareWord(actual, expected);

}

var peekWord = function(actual, expected) {

  compareWord(actual, expected, true);

}

var compareWord = function(actual, expected, peek) {

  var result = true;

  if (expected[0] === '$') {

    result =  matchCases[expected].call(null, actual);

  } else if (actual !== expected) {

    result =  errors.unexpectedToken(expected, actual);

  } 

  if (result !== true && !peek) {

    throw result;

  }

  return result === true ? true : false;

}

var createMatchCase = function(name, callback) {

  matchCases[name] = callback;

}

var createMatchCases = function() {

  createMatchCase('$POKEMON', function(actual) {

    if (!pokedex.pokemon[actual]) {

      return errors.unrecognisedPokemon(actual);

    }  

    return true;

  });

  createMatchCase('$POKEMON!', function(actual) {

    var exclamation = actual[actual.length-1];

    if (exclamation !== '!') {

      var result = matchCases['$POKEMON'].call(null, actual);

      if (result === true) {

        return errors.missingPunctuation('!'); 

      } else {

        return result;

      }
    }

    var pokemon_name = actual.substring(0, actual.length-1);

    return matchCases['$POKEMON'].call(null, pokemon_name);

  });

  createMatchCase('$TRAINER', function(actual) {

    if (!actual.match(/[A-Z]+/)) {

      return errors.invalidTrainerName(actual, '[A-Z]+');

    }

    return true;

  });

}

var selfSendsOut = function(pokemon) {

  battle.selfPokemon = pokemon;

}

var enemySendsOut = function(pokemon) {

  battle.enemyPokemon = pokemon;

}

var setEnemyTrainer = function(trainer) {

  battle.enemyTrainer = trainer;

}
