var info = require('./pokedex.js');
var translator = require('./translator.js');
var errors = require('../errors/errors.js');

var Walker = {};

module.exports = Walker;

var ast,
    translateFlag = false,
    output = [],
    visitors = {},
    battle = {};

var init = function() {

  initVisitors();
 
}

Walker.init = init;

var walk = function(ast, flag) {

  resetBattle();

  translateFlag = !!flag;

  if (ast && ast.length) {

    visit('prog', ast);

  }

  if (translateFlag) {

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

  createVisitor('turn', function($$, $1, $3) {

     switch ($$) {

       case 'SELFTURN':
         visit('selfTurn', [$$, $1, $3]);
         break;
       
       case 'ENEMYTURN':
         visit('enemyTurn', [$$, $1, $3]);
         break;

       case 'ENEMYSWITCHPOKEMON':
         visit('enemySwitchPokemon', [$$, $1, $3]);
         break;

       case 'SELFSWITCHPOKEMON':
         visit('selfSwitchPokemon', [$$, $1, $3]);
         break;
       
       case 'SELFTURN':
         visit('selfTurn', [$$, $1, $3]);
         break;
       
       default:
         visit('effect1', [$$, $1, $3]); 
         break;

     }

   });
   

  createVisitor('goPokemon', function($$, $2) {

    performSelfTurn();

    expect('GO', $$);

    checkPokemon($2);

    battle.selfPokemon = $2;

  });

  createVisitor('foePokemon', function($$, $3) {

    performEnemyTurn();

    expect('SENDS_OUT', $$);

    checkPokemon($3);

    battle.enemyPokemon = $3;

  });

  createVisitor('selfTurn', function($$, $1, $3) {

    performSelfTurn();

    doTurn($1, $3, 'self');

  });

  createVisitor('enemyTurn', function($$, $2, $4) {

    performEnemyTurn();
   
    doTurn($2, $4, 'enemy');

  });

  createVisitor('selfSwitchPokemon', function($$, $1, $6) {

    expect('SELFSWITCHPOKEMON', $$);

    if (battle.selfPokemon != $1) {

      throw errors.wrongPokemon(battle.selfPokemon, $1);

    }

    performSelfTurn();

    checkPokemon($1);

    battle.selfPokemon = $6;

  });

  createVisitor('enemySwitchPokemon', function($$, $3, $6) {

    expect('ENEMYSWITCHPOKEMON', $$);

    if (battle.enemyPokemon != $3) {

      throw errors.wrongPokemon(battle.enemyPokemon, $3);

    }

    performEnemyTurn();

    checkPokemon($3);

    battle.enemyPokemon = $6;

  });

  createVisitor('effect1', function($$) {

    checkEffect($$); 

  });

}

var createVisitor = function(name, callback) {

  visitors[name] = callback;

}

var expect = function(expected, actual) {

  if (expected != actual) {

    throw errors.unexpectedToken(expected, actual);

  }

}

var performTurn = function(turn) {

  if (battle[turn]) {

    throw errors.wrongTurnOrder(turn);

  } 

  battle[turn] = true;

  if (battle['selfTurnTaken'] && battle['enemyTurnTaken']) {
   
    battle['selfTurnTaken'] = false;
    battle['enemyTurnTaken'] = false;

  }

}

var performSelfTurn = function() {

  performTurn('selfTurnTaken');

}

var performEnemyTurn = function() {

  performTurn('enemyTurnTaken');

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

  if (translateFlag) {

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
    selfTurnTaken: false,
    enemyTurnTaken: false,
    currentPokemon: null,
    targetPokemon: null,
    selfPokemon: null,
    enemyPokemon: null,
    currentMove: null
  };

  output = [];

}
