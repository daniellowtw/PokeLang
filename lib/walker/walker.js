var info = require('./pokemon_info.js');

var Walker = {};

module.exports = Walker;

var ast,
    output = [],
    visitors = {},
    battle = {
      selfTurnTaken: false,
      enemyTurnTaken: false,
      currentPokemon: null,
      targetPokemon: null,
      selfPokemon: null,
      enemyPokemon: null,
      currentMove: null
    };

var init = function() {

  initVisitors();
 
}

Walker.init = init;

var walk = function(ast) {

  resetBattle();

  if (ast && ast.length) {

    visit('prog', ast);

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

    battle.selfPokemon = $2;

  });

  createVisitor('foePokemon', function($$, $3) {

    performEnemyTurn();

    expect('SENDS_OUT', $$);

    battle.enemyPokemon = $3;

  });

  createVisitor('selfTurn', function($$, $1, $3) {

    performSelfTurn();

    if (battle.selfPokemon != $1) {

      throw 'Wrong Pokemon. Expected: ' + battle.selfPokemon + ' Actual: ' + $1;

    }

    battle.currentPokemon = battle.selfPokemon;

    battle.targetPokemon = battle.enemyPokemon;

    checkMove($3, battle.selfPokemon);

    battle.currentMove = $3;

    output.push($3)

  });

  createVisitor('enemyTurn', function($$, $2, $4) {

    performEnemyTurn();
   
    if (battle.enemyPokemon != $2) {

      throw 'Wrong Pokemon. Expected: ' + battle.enemyPokemon + ' Actual: ' + $2;

    }

    battle.currentPokemon = battle.enemyPokemon;

    battle.targetPokemon = battle.selfPokemon;

    checkMove($4, battle.enemyPokemon);

    battle.currentMove = $4;

    output.push($4)

  });

  createVisitor('selfSwitchPokemon', function($$, $1, $6) {

    expect('SELFSWITCHPOKEMON', $$);

    if (battle.selfPokemon != $1) {

      throw 'Wrong Pokemon. Expected: ' + battle.selfPokemon + ' Actual: ' + $1;

    }

    visit('goPokemon', $6); 

  });

  createVisitor('enemySwitchPokemon', function($$, $3, $6) {

    expect('ENEMYSWITCHPOKEMON', $$);

    if (battle.enemyPokemon != $3) {

      throw 'Wrong Pokemon. Expected: ' + battle.enemyPokemon + ' Actual: ' + $3;

    }

    visit('foePokemon', $6); 

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

    throw 'Unexpected token. Expected: ' + expected + ', Actual: ' + actual;

  }

}

var performTurn = function(turn) {

  if (battle[turn]) {

    throw 'Turn order is wrong: ' + turn;

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

    throw pokemon + " does not know move " + move;

  }

}

var checkEffect = function(effect) {

  effect = effect;

  var moveType = info.pokemon[battle.currentPokemon]['MOVES'][battle.currentMove]['TYPE'];

  var modifier = 1;

  var enemyType = info.pokemon[battle.targetPokemon]['TYPE'];  

  for (var i = 0; i < enemyType.length; i++) {

    modifier *= info.typeChart[moveType][enemyType[i]];

  }

  if (modifier == 0) {
  
    if (effect != 'NO_EFFECT') {

      throw battle.currentMove + ' should have no effect on ' + battle.targetPokemon;

    }

  } else if (modifier < 1) {

    if (effect != 'NOT_EFFECTIVE') {

      throw battle.currentMove + ' should be not very effective on ' + battle.targetPokemon;

    }
  
  } else if (modifier > 1) {
  
    if (effect != 'EFFECTIVE') {

      throw battle.currentMove + ' should be super effective on ' + battle.targetPokemon;

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

}
