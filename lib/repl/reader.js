var pokedex = require('../pokedex'),
    errors = require('../errors'),
    battle = require('./battle.js'),
    matcher = require('./matcher.js');

var reader = {},
    states = {},
    read_tokens,
    token_index,
    total_lines,
    possible_states,
    buffer,
    buffer_index,
    init_flag = false;

reader.battle = battle.state;

reader.current_line = 0;

reader.console_prompt = '';

module.exports = reader;

var init = function() {

  if (init_flag) {

    return;

  }

  createStates();

  battle.init(reader);

  matcher.init(reader);

  reset();

  init_flag = true;

};

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
  setPromptNormal(); 

};

reader.reset = reset;

var read = function(input) {

  tokenise(input);

  try {

    while (token_index < read_tokens.length) {
 
      visitNextState();
 
    }

  } catch (err) {

    clearBuffer();
   
    goToLastToken();  

    setPromptNormal();
  
    setNextState(nextState);

    throw err;

  }

};

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

};

var getNextToken = function() {

  var token = read_tokens[token_index];

  token_index++;

  reader.current_line = token.line + 1;

  return token.token;

};

var goToLastToken = function() {

  token_index = read_tokens.length;

};

var visitNextState = function() {

  var token = getNextToken();

  setPromptWaiting();

  if (token === '?') {

    debug();

    setPromptNormal();

    return;

  } else if (token === '*') {

    battle.newTurn(); 

    clearBuffer();

    setNextState('TURN');

    setPromptNormal();

    return;

  }

  var result;

  buffer.push(token);

  // iterate in reverse since we will be deleting elements from array
  for (var i = possible_states.length - 1; i >= 0; i--) {

    var buffer_index = buffer.length - 1;

    var expected = possible_states[i].accept[buffer_index];

    result = matcher.matchWord(buffer[buffer_index], expected);

    if (result instanceof Error) {

      if (result.errorName === 'Unexpected token' && possible_states.length === 1) {

        throwUnexpectedTokenError([possible_states[0].accept], buffer);
      
      }

      handleResultError(result, buffer[buffer_index], expected);

      possible_states.splice(i, 1);

    } else if (buffer.length === possible_states[i].accept.length) {

      // accept state
      possible_states[i].callback.call(null, buffer);

      clearBuffer();

      setPromptNormal();

      return;

    }

  } 

  if (possible_states.length === 0) {

    throwUnexpectedTokenError(getAcceptedTokens(nextState), buffer);

  }

};

var getAcceptedTokens = function(state) {

  var accepted = [];

  for (var i = 0; i < states[state].length; i++) {

    accepted.push(states[state][i].accept);

  }

  return accepted;

};

var throwUnexpectedTokenError = function(accepted, buffer) {

  var expected_tokens = [];

  for (var i = 0; i < accepted.length; i++) {

    var state_tokens = [];

    for (var j = 0; j < accepted[i].length; j++) {

      state_tokens.push(accepted[i][j]);

      if (j === buffer.length - 1) {

        state_tokens[j] = '>>' + state_tokens[j] + '<<';

      }

    }

    expected_tokens.push(state_tokens.join(' '));

  }

  var actual_tokens = [];

  for (var k = 0; k < buffer.length; k++) {

    actual_tokens.push(buffer[k]);

    if (k === buffer.length - 1) {

      actual_tokens[k] = '>>' + actual_tokens[k] + '<<';

    }

  }

  throw errors.unexpectedToken(expected_tokens.join(' OR \n'), actual_tokens.join(' '));

};

var handleResultError = function(result, actual, expected) {

  if (result.errorName === 'Unrecognised Pokemon') {

    if (actual === 'It\'s') {

      return;

    } 

  } 
  
  if (result.errorName !== 'Unexpected token' && possible_states.length === 1) {

    throw result;

  } 

};

var createState = function(name, accept_states) {

  states[name] = accept_states; 

};

var setNextState = function(state) {

  nextState = state;

  possible_states = [];

  for (var i = 0; i < states[state].length; i++) {

    possible_states.push(states[state][i]);

  }

};

var createStates = function() {

  createState('START', [

    {accept: ['Go!', '$POKEMON!'],
     callback: function(tokens) {

       battle.selfSwitchPokemon(matcher.removeLastChar(tokens[1]));

       setNextState('START2');

     }
    }

  ]);

  createState('START2', [

    {accept: ['Foe', '$TRAINER', 'sends', 'out', '$POKEMON!'],
     callback: function(tokens) {

       battle.setEnemyTrainer(tokens[1]);

       battle.enemySwitchPokemon(matcher.removeLastChar(tokens[4]));

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
  
       var move = matcher.removeLastChar(tokens[2]);
  
       battle.checkPokemonKnowsMove(pokemon, move);
  
       battle.doMove('SELF', move); 
 
       endOfTurnChecks('SELF', move);

    }
   },

    {accept: ['$POKEMON!', 'That\'s', 'enough!', 'Come', 'back!'],
     callback: function(tokens) {

       battle.selfTurn();

       var pokemon = matcher.removeLastChar(tokens[0]);
     
       battle.checkSwitch('Self');

       battle.checkSelfPokemon(pokemon);

       setNextState('SELFSWITCH');

     } 
    },

    {accept: ['Foe', '$TRAINER', 'calls', 'back', '$POKEMON!'],
     callback: function(tokens) {

       battle.enemyTurn();

       battle.checkEnemyTrainer(tokens[1]);
 
       battle.checkSwitch('Foe ' + tokens[1]);     

       battle.checkEnemyPokemon(matcher.removeLastChar(tokens[4]));
     
       setNextState('ENEMYSWITCH');

     }
    },

    {accept: ['Foe', '$POKEMON', 'uses', '$MOVE!'],
     callback: function(tokens) { 

       battle.enemyTurn();

       var pokemon = tokens[1];

       battle.checkEnemyPokemon(pokemon);

       var move = matcher.removeLastChar(tokens[3]);

       battle.checkPokemonKnowsMove(pokemon, move);

       battle.doMove('ENEMY', move);

       endOfTurnChecks('ENEMY', move);

     }
    }

  ]);


  createState('SELFSWITCH', [
    
    {accept: ['Go!', '$POKEMON!'],
     callback: function(tokens) {

       var pokemon = matcher.removeLastChar(tokens[1]);
  
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

       battle.enemySwitchPokemon(matcher.removeLastChar(tokens[4]));

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

};

var endOfTurnChecks = function(turn, move) {

    battle.endTurn(turn);

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

};

var clearBuffer = function() {

  buffer = [];
  buffer_index = 0;

};

var debug = function() {

  console.log('\x1B[36m' + 'CURRENT LINE' + '\x1B[39m');

  console.log(reader.current_line);

  console.log('\x1B[36m' + 'STACK' + '\x1B[39m');

  console.log(getStack());

  console.log('\x1B[36m' + 'BUFFER' + '\x1B[39m');

  console.log(buffer);

  console.log('buffer_index: ' + buffer_index);

  console.log('\x1B[36m' + 'BATTLE' + '\x1B[39m');

  console.log(battle.state);

  console.log('\x1B[36m' + 'STATE' + '\x1B[39m');

  console.log(nextState);

};

var setPromptNormal = function() {

  reader.console_prompt = 'poke>';

};

var setPromptWaiting = function() {

  reader.console_prompt = '....';

};

var getStack = function() {

  return battle.getStack();

};

reader.getStack = getStack;

var getBlocks = function() {

  return battle.getBlocks();

};

reader.getBlocks = getBlocks;
