var errors = require('../errors/errors.js'),
    pokedex = require('../walker/pokedex.js');

var battle = {
      state: {}
    },
   state = battle.state,
   init_flag = false,
   R;

module.exports = battle;

var init = function(reader) {

  if (init_flag) {

    return;

  }

  R = reader;

  init_flag = true;

}

battle.init = init;

var reset = function() {

  state = battle.state = {};

  newTurn();

}

battle.reset = reset;

var selfSwitchPokemon = function(pokemon) {

  state.selfPokemon = pokemon;

}

battle.selfSwitchPokemon = selfSwitchPokemon;

var enemySwitchPokemon = function(pokemon) {

  state.enemyPokemon = pokemon;

}

battle.enemySwitchPokemon = enemySwitchPokemon;

var setEnemyTrainer = function(trainer) {

  state.enemyTrainer = trainer;

}

battle.setEnemyTrainer = setEnemyTrainer;

var checkEnemyTrainer = function(trainer) {

  if (state.enemyTrainer !== trainer) {

    throw errors.wrongEnemyTrainer(state.enemyTrainer, trainer, R.currentLine);

  }

}

battle.checkEnemyTrainer = checkEnemyTrainer;

var checkPokemon = function(turn, pokemon) {

  if (state[turn + 'Pokemon'] !== pokemon) {

    throw errors.wrongPokemon(state[turn + 'Pokemon'], pokemon, R.currentLine);

  }

}

var checkSelfPokemon = function(pokemon) {

  checkPokemon('self', pokemon);

}

battle.checkSelfPokemon = checkSelfPokemon;

var checkEnemyPokemon = function(pokemon) {

  checkPokemon('enemy', pokemon);

}

battle.checkEnemyPokemon = checkEnemyPokemon;

var doMove = function() {

  state.switchable = false;

}

battle.doMove = doMove;

var checkPokemonKnowsMove = function(pokemon, move) {

  if (!pokedex.pokemon[pokemon]['MOVES'][move]) {

    throw errors.pokemonDoesNotKnowMove(pokemon, move, R.currentLine);

  } 

}

battle.checkPokemonKnowsMove = checkPokemonKnowsMove;

var selfTurn = function() {

  doTurn('SELF');

}

battle.selfTurn = selfTurn;

var enemyTurn = function() {

  doTurn('ENEMY');

}

battle.enemyTurn = enemyTurn;

var doTurn = function(turn) {

  if (state.turn === turn) {

    throw errors.wrongTurnOrder(turn, R.currentLine);

  }

}

var endSelfTurn = function() {

  endTurn('SELF'); 

}

battle.endSelfTurn = endSelfTurn;

var endEnemyTurn = function() {

  endTurn('ENEMY'); 

}

battle.endEnemyTurn = endEnemyTurn;

var endTurn = function(turn) {

  if (state.turn === 'NEW') {

    state.turn = turn;
 
  } else {

    newTurn();

  }

}

var newTurn = function() {

  state.turn = 'NEW';

  state.switchable = true;

}

var checkEffectiveness = function(turn, move) {

  var moveType = pokedex.moveList[move]['TYPE'];

  var modifier = 1;

  var pokemon = turn === 'SELF' ? state.enemyPokemon : state.selfPokemon;

  var enemyType = pokedex.pokemon[pokemon]['TYPE'];  

  for (var i = 0; i < enemyType.length; i++) {

    modifier *= pokedex.typeChart[moveType][enemyType[i]];

  }

  return modifier;  

}

battle.checkEffectiveness = checkEffectiveness;

var checkSwitch = function() {

  if (!state.switchable) {

    throw errors.switchNotAllowed(R.currentLine);    

  }

}

battle.checkSwitch = checkSwitch;