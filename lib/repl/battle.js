(function() {
'use strict';

var errors = require('../errors'),
    pokedex = require('../pokedex'),
    interpreter = require('../interpreter');

var battle = {
      state: {}
    },
   state = battle.state,
   blocks = [],
   init_flag = false,
   R;

module.exports = battle;

var init = function(reader, inputFunc) {

  if (init_flag) {

    return;

  }

  R = reader;

  interpreter.init(battle, {input: inputFunc});

  init_flag = true;

};

battle.init = init;

var reset = function() {

  interpreter.reset();

  state = battle.state = {};

  blocks = [];

  newTurn();

};

battle.reset = reset;

var selfSwitchPokemon = function(pokemon) {

  state.selfPokemon = pokemon;

};

battle.selfSwitchPokemon = selfSwitchPokemon;

var enemySwitchPokemon = function(pokemon) {

  state.enemyPokemon = pokemon;

};

battle.enemySwitchPokemon = enemySwitchPokemon;

var setEnemyTrainer = function(trainer) {

  state.enemyTrainer = trainer;

};

battle.setEnemyTrainer = setEnemyTrainer;

var checkEnemyTrainer = function(trainer) {

  if (state.enemyTrainer !== trainer) {

    throw errors.wrongEnemyTrainer(state.enemyTrainer, trainer);

  }

};

battle.checkEnemyTrainer = checkEnemyTrainer;

var checkPokemon = function(turn, pokemon) {

  var opponent = turn === 'self' ? 'enemy' : 'self';

  if (state[turn + 'Pokemon'] !== pokemon) {

    if (state[opponent + 'Pokemon'] === pokemon && turn === 'self') {

      if (state.enemyPokemon !== state.selfPokemon) {

        throw errors.missingFoe(state.enemyPokemon);

      }

    }

    throw errors.wrongPokemon(state[turn + 'Pokemon'], pokemon);

  }

};

var checkSelfPokemon = function(pokemon) {

  checkPokemon('self', pokemon);

};

battle.checkSelfPokemon = checkSelfPokemon;

var checkEnemyPokemon = function(pokemon) {

  checkPokemon('enemy', pokemon);

};

battle.checkEnemyPokemon = checkEnemyPokemon;

var doMove = function(turn, move) {

  state.switchable = false;

  var instruction;

  if (move === 'TACKLE') {

    var index = getPokedexNumber(turn);

    instruction = interpreter.num(index);

  } else {

    instruction = interpreter.translateMove(move);

  }

  interpreter.exec(instruction);

};

battle.doMove = doMove;

var getPokedexNumber = function(turn) {

  var pokemon = turn === 'SELF' ? state.enemyPokemon : state.selfPokemon;

  var index = pokedex.pokemon[pokemon].INDEX;

  return index === 151 ? 0 : index;

};

var checkPokemonKnowsMove = function(pokemon, move) {

  if (!pokedex.pokemon[pokemon].MOVES[move]) {

    throw errors.pokemonDoesNotKnowMove(pokemon, move);

  }

};

battle.checkPokemonKnowsMove = checkPokemonKnowsMove;

var selfTurn = function() {

  doTurn('SELF');

};

battle.selfTurn = selfTurn;

var enemyTurn = function() {

  doTurn('ENEMY');

};

battle.enemyTurn = enemyTurn;

var doTurn = function(turn) {

  if (state.turn === turn) {

    throw errors.wrongTurnOrder(turn);

  }

};

var endSelfTurn = function() {

  endTurn('SELF');

};

battle.endSelfTurn = endSelfTurn;

var endEnemyTurn = function() {

  endTurn('ENEMY');

};

battle.endEnemyTurn = endEnemyTurn;

var endTurn = function(turn) {

  if (state.turn === 'NEW') {

    state.turn = turn;

  } else {

    newTurn();

  }

};

battle.endTurn = endTurn;

var newTurn = function() {

  state.turn = 'NEW';

  state.switchable = true;

};

battle.newTurn = newTurn;

var checkEffectiveness = function(turn, move) {

  var moveType = pokedex.moveList[move].TYPE;

  var modifier = 1;

  var pokemon = turn === 'SELF' ? state.enemyPokemon : state.selfPokemon;

  var enemyType = pokedex.pokemon[pokemon].TYPE;

  for (var i = 0; i < enemyType.length; i++) {

    modifier *= pokedex.typeChart[moveType][enemyType[i]];

  }

  return modifier;

};

battle.checkEffectiveness = checkEffectiveness;

var checkSwitch = function(trainer) {

  if (!state.switchable) {

    throw errors.switchNotAllowed(trainer);

  }

};

battle.checkSwitch = checkSwitch;

var getStack = function() {

  return interpreter.getStack();

};

battle.getStack = getStack;

var getBlocks = function() {


};

battle.getBlocks = getBlocks;

var getCurrentLine = function() {

  return R.currentLine;

};

battle.getCurrentLine = getCurrentLine;

})();
