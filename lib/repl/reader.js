var pokedex = require('../walker/pokedex.js'),
    errors = require('../errors/errors.js'),
    battle = require('./battle.js');

var reader = {},
    states = {},
    matchCases = {};
    lines = [],
    nextState = 'START',
    init_flag = false,

reader.battle = battle.state;

reader.currentLine = 0;

module.exports = reader;

var init = function() {

  if (init_flag) {

    return;

  }

  createStates();

  createMatchCases();

  battle.init(reader);

  init_flag = true;

}

reader.init = init;

var reset = function() {

  battle.reset();
  reader.battle = battle.state;
  lines = [];
  nextState = 'START';
  reader.currentLine = 0;

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

    var line = lines[i].split(/\/\//)[0];

    line = line.match(/\S+/g);

    if (line) {

      nonEmptyLines.push({line: line
                         ,number: i + 1
                        });

    }

  }
 
  return nonEmptyLines;

}

var getNextLine = function() {

  var nextLine = lines.shift();

  reader.currentLine = nextLine.number;

  return nextLine.line;

}

var lookAhead = function() {

  return lines[0].line[0];

}

var visitNextState = function() {

  states[nextState].apply(null);  

}

var createState = function(name, callback) {

  states[name] = callback; 

}

var createStates = function() {

  createState('START', function() {

    var tokens = getNextLine();

    matchLine(tokens, ['Go!', '$POKEMON!']); 

    battle.selfSwitchPokemon(removeLastChar(tokens[1]));

    nextState = 'START2'; 

  });

  createState('START2', function() {

    var tokens = getNextLine();

    matchLine(tokens, ['Foe', '$TRAINER', 'sends', 'out', '$POKEMON!']); 

    battle.setEnemyTrainer(tokens[1]);

    battle.enemySwitchPokemon(removeLastChar(tokens[4]));

    nextState = '_TURN'; 

  });

  createState('_TURN', function() {

    var lookahead = lookAhead();

    if (peekWord(lookahead, '$POKEMON')) {

      nextState = 'SELFTURN'; 

    } else if (peekWord(lookahead, 'Foe')) {

      nextState = 'ENEMYTURNSWITCH';

    } else if (peekWord(lookahead, '$POKEMON!')) {

      nextState = 'SELFSWITCH';

    } else {

      throw errors.unexpectedToken('$POKEMON OR $POKEMON! OR Foe', lookahead, reader.currentLine + 1);

    }

  });

  createState('SELFTURN', function() {

    var tokens = getNextLine();

    matchLine(tokens, ['$POKEMON', 'uses', '$MOVE!']); 

    battle.selfTurn();

    var pokemon = tokens[0];

    battle.checkSelfPokemon(pokemon);

    var move = removeLastChar(tokens[2]);

    battle.checkPokemonKnowsMove(pokemon, move);

    battle.doMove('SELF', move);
  
    battle.endSelfTurn();

    endOfTurnChecks('SELF', move);

  });

  createState('SELFSWITCH', function() {

    var tokens = getNextLine();

    matchLine(tokens, ['$POKEMON!', 'That\'s', 'enough!', 'Come', 'back!']); 

    battle.selfTurn();

    var pokemon = removeLastChar(tokens[0]);
  
    battle.checkSwitch();

    battle.checkSelfPokemon(pokemon);

    nextState = 'SELFSWITCH2';

  });

  createState('SELFSWITCH2', function() {

    var tokens = getNextLine();

    matchLine(tokens, ['Go!', '$POKEMON!']); 

    var pokemon = removeLastChar(tokens[1]);
  
    battle.selfSwitchPokemon(pokemon);

    battle.endSelfTurn();

    nextState = '_TURN';

  });

  createState('ENEMYTURNSWITCH', function() {

    var tokens = getNextLine();

    if (peekWord(tokens[1], '$POKEMON')) {

      handleEnemyTurn(tokens);

    } else if (peekWord(tokens[1], '$TRAINER')) {

      handleEnemySwitch(tokens);

    } else {

      tokens[1] = '>>' + tokens[1] + '<<';

      throw errors.unexpectedToken('Foe $POKEMON uses $MOVE! OR Foe $TRAINER calls back $POKEMON!', tokens, reader.currentLine);

    }

  });

  createState('ENEMYSWITCH', function() {

    var tokens = getNextLine();

    matchLine(tokens, ['Foe', '$TRAINER', 'sends', 'out', '$POKEMON!']);
  
    battle.checkEnemyTrainer(tokens[1]);

    battle.enemySwitchPokemon(removeLastChar(tokens[4]));

    battle.endEnemyTurn();

    nextState = '_TURN';

  });

  createState('NOEFFECT', function() {

    var tokens = getNextLine();

    matchLine(tokens, ['It', 'has', 'no', 'effect!']);

    nextState = '_TURN';

  });

  createState('NOTVERYEFFECTIVE', function() {

    var tokens = getNextLine();

    matchLine(tokens, ['It\'s', 'not', 'very', 'effective!']);

    nextState = '_TURN';

  });

  createState('SUPEREFFECTIVE', function() {

    var tokens = getNextLine();

    matchLine(tokens, ['It\'s', 'super', 'effective!']);

    nextState = '_TURN';

  });

}

var endOfTurnChecks = function(turn, move) {

    var effectiveness = battle.checkEffectiveness(turn, move);

    if (effectiveness === 0) {

      nextState = 'NOEFFECT';

    } else if (effectiveness < 1) {

      nextState = 'NOTVERYEFFECTIVE';

    } else if (effectiveness > 1) {

      nextState = 'SUPEREFFECTIVE';

    } else {

      nextState = '_TURN';

    }

}

var handleEnemyTurn = function(tokens) {

  matchLine(tokens, ['Foe', '$POKEMON', 'uses', '$MOVE!']); 

  battle.enemyTurn();

  var pokemon = tokens[1];

  battle.checkEnemyPokemon(pokemon);

  var move = removeLastChar(tokens[3]);

  battle.checkPokemonKnowsMove(pokemon, move);

  battle.doMove('ENEMY', move);

  battle.endEnemyTurn();
 
  endOfTurnChecks('ENEMY', move);

}

var handleEnemySwitch = function(tokens) {

  matchLine(tokens, ['Foe', '$TRAINER', 'calls', 'back', '$POKEMON!']);

  battle.enemyTurn();

  battle.checkEnemyTrainer(tokens[1]);

  battle.checkEnemyPokemon(removeLastChar(tokens[4]));

  nextState = 'ENEMYSWITCH';

}

var matchLine = function(actual, expected) {

  for (var i = 0; i < actual.length; i++) {

    if (i >= expected.length) {

      throw errors.trailingTokens(actual.slice(i).join(' '), reader.currentLine);

    }

    var result = matchWord(actual[i], expected[i]);

    if (result instanceof Error) { 

      if (result.errorName === 'Unexpected token') {

        actual[i] = '>>' + actual[i] + '<<';

        expected[i] = '>>' + expected[i] + '<<';

        result =  errors.unexpectedToken(expected.join(' '), actual.join(' '), reader.currentLine);

      }

      throw result;

    }

  }

  if (expected.length > actual.length) {

    throw errors.missingTokens(expected.slice(actual.length).join(' '), reader.currentLine);

  }

}

var matchWord = function(actual, expected) {

  return compareWord(actual, expected);

}

var peekWord = function(actual, expected) {

  return !(compareWord(actual, expected) instanceof Error);

}

var compareWord = function(actual, expected) {

  var result = true;

  if (expected[0] === '$') {

    result =  matchCases[expected].call(null, actual);

  } else if (actual !== expected) {

    result =  errors.unexpectedToken(expected, actual, reader.currentLine);

  } 

  return result;

}

var createMatchCase = function(name, callback) {

  matchCases[name] = callback;

}

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

      var result = matchCases['$POKEMON'].call(null, actual);

      if (result === true) {

        return errors.missingPunctuation('!', reader.currentLine); 

      } else {

        return result;

      }
    }

    var pokemon_name = removeLastChar(actual);

    return matchCases['$POKEMON'].call(null, pokemon_name);

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

      var result = matchCases['$MOVE'].call(null, actual);

      if (result === true) {

        return errors.missingPunctuation('!', reader.currentLine); 

      } else {

        return result;

      }
    }

    var move = removeLastChar(actual);

    return matchCases['$MOVE'].call(null, move);

  });

  createMatchCase('$MOVE', function(actual) {

    if (!pokedex.moveList[actual]) {

      throw errors.unrecognisedMove(actual, reader.currentLine);

    }

    return true;

  });

}

var removeLastChar = function(string) {

  return string.substring(0, string.length - 1);

}

