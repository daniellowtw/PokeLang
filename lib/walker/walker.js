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

    visit('ending', $2); 

  });

  // start_battle: goPokemon NEWLINE foePokemon
 
  createVisitor('start_battle', function($$, $1, $3) {

    expect('START', $$);

    visit('goPokemon', $1); 

    visit('foePokemon', $3); 

  });

  // turns: turn ending

  createVisitor('turns', function($$, $1, $2) {

    expect('TURNS', $$);

    visit('turn', $1); 

    visit('ending', $2); 

  });

  // ending: NEWLINE turns | NEWLINE
  
  createVisitor('ending', function($$, $2) {

    if ($$) {

      expect('CONCAT', $$);

      visit('turns', $2);

    }

  });

  // turn: selfturn | enemyTurn | enemySwitchPokemon | selfSwitchPokemon | effect1

  createVisitor('turn', function($$, $1) {

     switch ($$) {

       case 'SELFTURN':
         visit('selfTurn', $$);
         break;
       
       case 'ENEMYTURN':
         visit('enemyTurn', $$);
         break;

       case 'ENEMYSWITCHPOKEMON':
         visit('enemySwitchPokemon', $$);
         break;

       case 'SELFSWITCHPOKEMON':
         visit('selfSwitchPokemon', $$);
         break;
       
       case 'SELFTURN':
         visit('selfTurn', $$);
         break;
       
       default:
         visit('effect1', $$); 
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

    battle.selfPokemon = $3;

  });

  createVisitor('selfTurn', function($$, $1, $3) {

    performSelfTurn();

    battle.currentPokemon = battle.selfPokemon;

    battle.targetPokemon = battle.enemyPokemon;

    battle.currentMove = $3;

    output.push($3)

  });

  createVisitor('enemyTurn', function($$, $2, $4) {

    performEnemyTurn();
   
    battle.currentPokemon = battle.enemyPokemon;

    battle.targetPokemon = battle.selfPokemon;

    battle.currentMove = $4;

    output.push($3)

  });

  createVisitor('selfSwitchPokemon', function($$, $1, $6) {

    performSelfTurn();

    expect('SELFSWITCHPOKEMON', $$);

    visit('goPokemon', $6); 

  });

  createVisitor('enemySwitchPokemon', function($$, $3, $6) {

    performEnemyTurn();

    expect('ENEMYSWITCHPOKEMON', $$);

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

var checkEffect = function(effect) {

  console.log(effect[0]);

  effect = effect[0];

  var moveType = info.pokemon[battle.currentPokemon]['MOVES'][currentMove]['TYPE'];

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

      throw battle.currentMove + ' should have no effect on ' + battle.targetPokemon;

    }
  
  } else if (modifier > 1) {
  
    if (effect != 'EFFECTIVE') {

      throw battle.currentMove + ' should have no effect on ' + battle.targetPokemon;

    }
  
  }

}

