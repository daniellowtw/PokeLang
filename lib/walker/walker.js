var Walker = {};

module.export = Walker;

var ast = [],
    visitors = {},
    battle = {
      selfTurnTaken: false,
      enemyTurnTaken: false,
      currentPokemon: null,
      enemyPokemon: null,
      currentMove: null
    };

var init = walk(ast) {

  visit('prog', ast);

}

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
         visit('selfTurn', $1);
         break;
       
       case 'ENEMYTURN':
         visit('enemyTurn', $1);
         break;

       case 'ENEMYSWITCHPOKEMON':
         visit('enemySwitchPokemon', $1);
         break;

       case 'SELFSWITCHPOKEMON':
         visit('selfSwitchPokemon', $1);
         break;
       
       case 'SELFTURN':
         visit('selfTurn', $1);
         break;
       
       default:
         checkEffect($$);
         break;

     }

   });
   

  createVisitor('goPokemon', function($$, $2) {

    performSelfTurn();

    expect('GO', $$);

    battle.currentPokemon = $2;

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

  return true;

}

