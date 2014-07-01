var info = require('./pokedex.js');
var translator = require('./translator.js');
var errors = require('../errors/errors.js');

var Walker = {};

module.exports = Walker;

var ast,
    translate_flag = false,
    init_flag = false,
    output = [],
    visitors = {},
    battle = {};

var init = function() {

  if (init_flag) {

    return;

  }

  initVisitors();
  
  init_flag = true;
 
}

Walker.init = init;

var walk = function(ast, flag) {

  resetBattle();

  translate_flag = !!flag;

  if (ast && ast.length) {

    visit('prog', ast);

  }

  if (translate_flag) {

    output = output.join(' ');

  }

  return output;

}

Walker.walk = walk;

var visit = function(name, args) {

  visitors[name].apply(null, args);

}

var initVisitors = function() {

  // prog: start_battle ending

  createVisitor('prog', function($$, $1, $2) {

    expect('PROG', $$);

    visit('start_battle', $1); 

    visit('ending', [$2]); 

  });

  // start_battle: goPokemon NEWLINE foePokemon
 
  createVisitor('start_battle', function($$, $1, $3) {

    expect('START', $$);

    visit('goPokemon', $1); 

    visit('foePokemon', $3); 

  });

  // turns: turn ending

  createVisitor('turns', function($$, $1, $2) {

    expect('CONCAT', $$);

    visit('turn', $1); 

    visit('ending', [$2]); 

  });

  // ending: NEWLINE turns | NEWLINE
  
  createVisitor('ending', function($$) {

    if ($$) {

      visit('turns', $$);

    }

  });

  // turn: selfturn | enemyTurn | enemySwitchPokemon | selfSwitchPokemon | effect1

  createVisitor('turn', function($$, $1, $2, $3) {

     switch ($$) {

       case 'SELFTURN':
         visit('selfTurn', [$$, $1, $2]);
         break;
       
       case 'ENEMYTURN':
         visit('enemyTurn', [$$, $1, $2]);
         break;

       case 'ENEMYSWITCHPOKEMON':
         visit('enemySwitchPokemon', [$$, $1, $2, $3]);
         break;

       case 'SELFSWITCHPOKEMON':
         visit('selfSwitchPokemon', [$$, $1, $2]);
         break;
       
       case 'SELFTURN':
         visit('selfTurn', [$$, $1, $2]);
         break;
       
       default:
         visit('effect1', [$$, $1, $2]); 
         break;

     }

   });
   

  createVisitor('goPokemon', function($$, $2) {

    performSelfTurn();

    expect('GO', $$);

    checkPokemon($2);

    battle.selfPokemon = $2;

  });

  createVisitor('foePokemon', function($$, $2, $4) {

    performEnemyTurn();

    expect('SENDS_OUT', $$);

    checkEnemyTrainer($2);

    checkPokemon($4);

    battle.enemyPokemon = $4;

  });

  createVisitor('selfTurn', function($$, $1, $3) {

    disableSwitch();

    performSelfTurn();

    doTurn($1, $3, 'self');

  });

  createVisitor('enemyTurn', function($$, $2, $4) {

    disableSwitch();

    performEnemyTurn();
   
    doTurn($2, $4, 'enemy');

  });

  createVisitor('selfSwitchPokemon', function($$, $1, $6) {

    expect('SELFSWITCHPOKEMON', $$);

    checkSwitchAllowed();

    if (battle.selfPokemon != $1) {

      throw errors.wrongPokemon(battle.selfPokemon, $1);

    }

    performSelfTurn();

    checkPokemon($1);

    battle.selfPokemon = $6;

  });

  createVisitor('enemySwitchPokemon', function($$, $2, $4, $7) {

    expect('ENEMYSWITCHPOKEMON', $$);

    checkSwitchAllowed();

    if (battle.enemyPokemon != $4) {

      throw errors.wrongPokemon(battle.enemyPokemon, $4);

    }

    performEnemyTurn();

    checkEnemyTrainer($2);

    checkPokemon($7);

    battle.enemyPokemon = $7;

  });

  createVisitor('effect1', function($$) {

    expect($$, ['NO_EFFECT', 'NOT_EFFECTIVE', 'EFFECTIVE']); 

    checkEffect($$); 

  });

}

var createVisitor = function(name, callback) {

  visitors[name] = callback;

}

var expect = function(expected, actual) {

  if (actual instanceof Array) {

    for (var i = 0; i < actual.length; i++) {

      if (expected == actual[i]) {
 
        return;

      }

    }

  } else if (expected == actual) {

    return;

  }

  throw errors.unexpectedToken(expected, actual);

}

var performTurn = function(turn) {

  if (battle[turn + 'TurnTaken']) {

    throw errors.wrongTurnOrder(turn);

  } 

  battle[turn + 'TurnTaken'] = true;

  if (battle['selfTurnTaken'] && battle['enemyTurnTaken']) {
   
    battle['selfTurnTaken'] = false;
    battle['enemyTurnTaken'] = false;

    battle.canSwitchPokemon = true;

  }

}

var performSelfTurn = function() {

  performTurn('self');

}

var performEnemyTurn = function() {

  performTurn('enemy');

}

var disableSwitch = function() {

  battle.canSwitchPokemon = false; 

}

var checkSwitchAllowed = function() {

  if (!battle.canSwitchPokemon) {

    throw errors.switchNotAllowed();

  }

}

var checkMove = function(move, pokemon) {

  if (!info.pokemon[pokemon]['MOVES'][move]) {

    throw errors.pokemonDoesNotKnowMove(pokemon, move);

  }

}

var doTurn = function(pokemon, move, turn) {

  var target = turn === 'self' ? 'enemy' : 'self';

  if (battle[turn + 'Pokemon'] != pokemon) {

    throw errors.wrongPokemon(battle[turn + 'Pokemon'], pokemon);

  }

  battle.currentPokemon = battle[turn + 'Pokemon'];

  battle.targetPokemon = battle[target + 'Pokemon'];

  checkMove(move, battle[turn + 'Pokemon']);

  battle.currentMove = move;

  if (translate_flag) {

    move = translator.translate(move);

    if (move === 'push') {

      move = info.pokemon[battle[target + 'Pokemon']]['INDEX'];

      if (move === 151) {

        move = 0;

      }

    }

  }

  output.push(move);

};

var checkEnemyTrainer = function(trainer) {

  if (!battle.enemyTrainer) {

    battle.enemyTrainer = trainer;

  } else {

    if (battle.enemyTrainer !== trainer) {

      throw errors.wrongEnemyTrainer(battle.enemyTrainer, trainer);

    }

  }

}

var checkPokemon = function(pokemon) {

  if(!info.pokemon[pokemon]) {

    throw errors.unrecognisedPokemon(pokemon);

  }

}

var checkEffect = function(effect) {

  var moveType = info.pokemon[battle.currentPokemon]['MOVES'][battle.currentMove]['TYPE'];

  var modifier = 1;

  var enemyType = info.pokemon[battle.targetPokemon]['TYPE'];  

  for (var i = 0; i < enemyType.length; i++) {

    modifier *= info.typeChart[moveType][enemyType[i]];

  }

  if (modifier == 0) {
  
    if (effect !== 'NO_EFFECT') {

      throw errors.wrongTypeModifier(battle.currentMove, 'NO EFFECT', battle.targetPokemon);

    }

  } else if (modifier < 1) {

    if (effect !== 'NOT_EFFECTIVE') {

      throw errors.wrongTypeModifier(battle.currentMove, 'NOT VERY EFFECTIVE', battle.targetPokemon);

    }
  
  } else if (modifier > 1) {
  
    if (effect !== 'EFFECTIVE') {

      throw errors.wrongTypeModifier(battle.currentMove, 'SUPER EFFECTIVE', battle.targetPokemon);

    }
  
  }

}

var resetBattle = function() {

  battle = {
    enemyTrainer: null,
    selfTurnTaken: false,
    enemyTurnTaken: false,
    canSwitchPokemon: false,
    currentPokemon: null,
    targetPokemon: null,
    selfPokemon: null,
    enemyPokemon: null,
    currentMove: null
  };

  output = [];

}
