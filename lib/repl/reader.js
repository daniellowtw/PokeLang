var pokedex = require('../walker/pokedex.js'),
    errors = require('../errors/errors.js'),
    battle = require('./battle.js');

var reader = {},
    states = {},
    matchCases = {};
    read_tokens = [],
    token_index = 0,
    total_lines = 0,
    possible_states = [];
    buffer = [],
    buffer_index = 0,
    nextState = 'START',
    init_flag = false;

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

  reset();

  init_flag = true;

}

reader.init = init;

var reset = function() {

  battle.reset();
  reader.battle = battle.state;
  read_tokens = [];
  total_lines = 0;
  token_index = 0;
  possible_states = [];
  buffer = [];
  buffer_index = 0;
  setNextState('START');

}

reader.reset = reset;

var read = function(input) {

  tokenise(input);

  while (token_index < read_tokens.length) {

    visitNextState();
 
  }

}

reader.read = read;

var tokenise = function(input) {

  var lines = input.split('\n');

  for (var i = 0; i < lines.length; i++) {

    var line = lines[i].split(/\/\//)[0];

    line = line.match(/\S+/g);

    if (line) {

      for (var j = 0; j < line.length; j++) {

        read_tokens.push({

          token: line[j],

          line: i + total_lines

        });

      }

    }

  }

  total_lines += lines.length - 1;

}

var getNextToken = function() {

  var token = read_tokens[token_index];

  token_index++;

  reader.currentLine = token.line + 1;

  return token.token;

}

var visitNextState = function() {

  var token = getNextToken();

  var result;

  buffer.push(token);

  // iterate in reverse since we will be deleting elements from array
  for (var i = possible_states.length - 1; i >= 0; i--) {

    var buffer_index = buffer.length - 1;

    var expected = possible_states[i].accept[buffer_index];

    result = matchWord(buffer[buffer_index], expected);

    if (result instanceof Error) {

      handleResultError(result);

      possible_states.splice(i, 1);

    } else if (buffer.length === possible_states[i].accept.length) {

      // accept state
      possible_states[i].callback.call(null, buffer);

      clearBuffer();

      return;

    }

  } 

  if (possible_states.length === 0) {

    throwUnexpectedTokenError(nextState, buffer);

  }

}

var throwUnexpectedTokenError = function(nextState, buffer) {

  var expected_tokens = [];

  for (var i = 0; i < states[nextState].length; i++) {

    var state_tokens = [];

    for (var j = 0; j < states[nextState][i].accept.length; j++) {

      state_tokens.push(states[nextState][i].accept[j]);

      if (j === buffer.length - 1) {

        state_tokens[j] = '>>' + state_tokens[j] + '<<';

      }

    }

    expected_tokens.push(state_tokens.join(' '));

  }

  var actual_tokens = [];

  for (var i = 0; i < buffer.length; i++) {

    actual_tokens.push(buffer[i]);

    if (i === buffer.length - 1) {

      actual_tokens[i] = '>>' + actual_tokens[i] + '<<';

    }

  }

  throw errors.unexpectedToken(expected_tokens.join('\n'), actual_tokens.join(' '), reader.currentLine);

}

var handleResultError = function(result) {

  if (!(result.errorName === 'Unexpected token')) {

    if (possible_states.length === 1) {
         
      throw result;

    }

  }

}

var createState = function(name, accept_states) {

  states[name] = accept_states; 

}

var setNextState = function(state) {

  nextState = state;

  possible_states = [];

  for (var i = 0; i < states[state].length; i++) {

    possible_states.push(states[state][i]);

  }

}

var createStates = function() {

  createState('START', [

    {accept: ['Go!', '$POKEMON!'],
     callback: function(tokens) {

       battle.selfSwitchPokemon(removeLastChar(tokens[1]));

       setNextState('START2');

     }
    }

  ]);

  createState('START2', [

    {accept: ['Foe', '$TRAINER', 'sends', 'out', '$POKEMON!'],
     callback: function(tokens) {

       battle.setEnemyTrainer(tokens[1]);

       battle.enemySwitchPokemon(removeLastChar(tokens[4]));

       setNextState('TURN'); 

     }
    }

  ]);

  createState('TURN', [ 

    {accept: ['$POKEMON', 'uses', '$MOVE!'],
     callback: function(tokens) {

       battle.selfTurn();
  
       var pokemon = tokens[0];
  
       battle.checkSelfPokemon(pokemon);
  
       var move = removeLastChar(tokens[2]);
  
       battle.checkPokemonKnowsMove(pokemon, move);
  
       battle.doMove('SELF', move);
      
       battle.endSelfTurn();
  
       endOfTurnChecks('SELF', move);

    }
   },

    {accept: ['$POKEMON!', 'That\'s', 'enough!', 'Come', 'back!'],
     callback: function(tokens) {

       battle.selfTurn();

       var pokemon = removeLastChar(tokens[0]);
     
       battle.checkSwitch();

       battle.checkSelfPokemon(pokemon);

       setNextState('SELFSWITCH');

     } 
    },

    {accept: ['Foe', '$TRAINER', 'calls', 'back', '$POKEMON!'],
     callback: function(tokens) {

       battle.enemyTurn();
     
       battle.checkEnemyTrainer(tokens[1]);
     
       battle.checkEnemyPokemon(removeLastChar(tokens[4]));
     
       setNextState('ENEMYSWITCH');

     }
    },

    {accept: ['Foe', '$POKEMON', 'uses', '$MOVE!'],
     callback: function(tokens) { 

       battle.enemyTurn();

       var pokemon = tokens[1];

       battle.checkEnemyPokemon(pokemon);

       var move = removeLastChar(tokens[3]);

       battle.checkPokemonKnowsMove(pokemon, move);

       battle.doMove('ENEMY', move);

       battle.endEnemyTurn();
      
       endOfTurnChecks('ENEMY', move);

     }
    }

  ]);


  createState('SELFSWITCH', [
    
    {accept: ['Go!', '$POKEMON!'],
     callback: function(tokens) {

       var pokemon = removeLastChar(tokens[1]);
  
       battle.selfSwitchPokemon(pokemon);

       battle.endSelfTurn();

       setNextState('TURN');

     }
    }

  ]);

  createState('ENEMYSWITCH', [ 

    {accept: ['Foe', '$TRAINER', 'sends', 'out', '$POKEMON!'],
     callback: function(tokens) {

       battle.checkEnemyTrainer(tokens[1]);

       battle.enemySwitchPokemon(removeLastChar(tokens[4]));

       battle.endEnemyTurn();

       setNextState('TURN');

     }
    }

  ]);

  createState('NOEFFECT', [
    
    {accept: ['It', 'has', 'no', 'effect!'],
     callback: function(tokens) {

       setNextState('TURN');

     }
    }

  ]);

  createState('NOTVERYEFFECTIVE', [
    
    {accept: ['It\'s', 'not', 'very', 'effective!'],
     callback: function(tokens) {

       setNextState('TURN');

     }
    }

  ]);

  createState('SUPEREFFECTIVE', [
    
    {accept: ['It\'s', 'super', 'effective!'],
     callback: function(tokens) {

       setNextState('TURN');

     }
    }

  ]);

}

var endOfTurnChecks = function(turn, move) {

    var effectiveness = battle.checkEffectiveness(turn, move);

    if (effectiveness === 0) {

      setNextState('NOEFFECT');

    } else if (effectiveness < 1) {

      setNextState('NOTVERYEFFECTIVE');

    } else if (effectiveness > 1) {

      setNextState('SUPEREFFECTIVE');

    } else {

      setNextState('TURN');

    }

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

var clearBuffer = function() {

  buffer = [];
  buffer_index = 0;

}
