var fs = require('fs'),
    instructions = require('../interpreter/instructions.js'),
    pokedex = require('../pokedex');

var translator = {};

var pokemon_who_know_move = {},
    pokemon_number = [],
    state = {};

instructions.init();

for (var pokemon in pokedex.pokemon) {

  var info = pokedex.pokemon[pokemon];

  if (pokemon === 'MEW') {
    
    pokemon_number.unshift(pokemon); 

  } else {

    pokemon_number.push(pokemon); 

  }

  for (var move in info.MOVES) {
  
    if (!pokemon_who_know_move[move]) {

      pokemon_who_know_move[move] = [];

    }

    pokemon_who_know_move[move].push(pokemon);
  
  }

}

state.self_pokemon = 'PIKACHU';
state.enemy_pokemon = 'EEVEE';
state.enemy_trainer = 'GARY';

var output = ''; 

var print = function(string) {

  var eol = require('os').EOL;

  output += string + eol;

};

print('Go! ' + state.self_pokemon + '!\n');
print('Foe ' + state.enemy_trainer + ' sends out ' + state.enemy_pokemon + '!\n');

var move_buffer = [];

var read = function(data) {

  var tokens = tokenise(data);

  for (var i = 0; i < tokens.length; i++) {

    var token = tokens[i];
    
    if (isNumber(token)) {

      doAllMovesInBuffer();

    } else if (instructions.mapping[token]) {


    } else {

      throw {name: 'Invalid token', message: 'Token ' + token + ' is not recognised'};

    }

    move_buffer.push(token);

  }

  doAllMovesInBuffer();
  
};

translator.read = read;

var isNumber = function(string) {

  var match = string.match(/[-]?[0-9]+/);

  return (match && match[0].length === string.length);

};

var doAllMovesInBuffer = function() {

  while(move_buffer.length) {

    if (isNumber(move_buffer[0])) {

      doTackle(move_buffer.shift());

    } else if (move_buffer.length === 1){

      doMoves(move_buffer.shift(), 'skip');

    } else {

      var first = move_buffer.shift();
      var second = move_buffer.shift();

      doMoves(first, second);

    }

  }

};

var doMoves = function(first, second) {

  var first_move = instructions.mapping[first];
  var second_move = instructions.mapping[second];

  var first_pokemon = findPokemonWhoKnowsMove(first_move);
  var second_pokemon = findPokemonWhoKnowsMove(second_move);

  switchSelfPoke(first_pokemon);

  switchEnemyPoke(second_pokemon);

  doSelfMove(first_move, first);

  doEnemyMove(second_move, second);

};

var doTackle = function(number) {

  var random_pokemon = randomPokemon();

  var first_pokemon = pokemon_number[number];
  var second_pokemon = findPokemonWhoKnowsMove('TACKLE');

  switchSelfPoke(random_pokemon);

  switchEnemyPoke(second_pokemon);

  switchSelfPoke(first_pokemon);

  doEnemyMove('TACKLE', number);

};

var findPokemonWhoKnowsMove = function(move) {

  var random = randomNumber(pokemon_who_know_move[move].length);

  return pokemon_who_know_move[move][random];

};

var randomPokemon = function() {

  var random = randomNumber(151);

  return pokemon_number[random];

};

var randomNumber = function(bound) {

  return Math.floor(Math.random() * bound);

};

var switchSelfPoke = function(pokemon) {

  print(state.self_pokemon + '! That\'s enough! Come back!\n');
  
  state.self_pokemon = pokemon; 

  print('Go! ' + state.self_pokemon + '!\n');

};

var switchEnemyPoke = function(pokemon) {

  print('Foe ' + state.enemy_trainer + ' calls back ' + state.enemy_pokemon + '!\n');
  
  state.enemy_pokemon = pokemon; 

  print('Foe ' + state.enemy_trainer + ' sends out ' + state.enemy_pokemon + '!\n');

};

var doSelfMove = function(move, token) {

  comment(state.self_pokemon + ' uses ' + move + '!\n', token);

  checkEffectiveness(move, state.enemy_pokemon);

};

var doEnemyMove = function(move, token) {

  comment('Foe ' + state.enemy_pokemon + ' uses ' + move + '!\n', token);

  checkEffectiveness(move, state.self_pokemon);

};

var comment = function(string, comment) {

  var comment_column = 50;

  var no_of_spaces = comment_column - string.length;
  
  var spaces = '';

  for(var i = 0; i < no_of_spaces; i++) {

    spaces += ' ';

  }

  print(string + spaces + '\/\/ ' + comment + '\n');

};

var checkEffectiveness = function(move, pokemon) {

  var move_type = pokedex.moveList[move].TYPE;

  var modifier = 1;

  var pokemon_type = pokedex.pokemon[pokemon].TYPE;  

  for (var i = 0; i < pokemon_type.length; i++) {

    modifier *= pokedex.typeChart[move_type][pokemon_type[i]];

  }

  if (modifier === 0) {

    print('It has no effect!\n');

  } else if (modifier < 1) {

    print('It\'s not very effective!\n');

  } else if (modifier > 1) {

    print('It\'s super effective!\n');

  }

};

var tokenise = function(input) {

  return input.trim().split(/\s+/);

};

if (process.argv[2]) {

  fs.readFile(process.argv[2], 'utf8', function(err, data) {

    if (err) {

      console.error('Error opening file: %s', err);
   
      process.exit(1);
 
    }

    read(data);

    console.log(output);
  
    process.exit(0);

  }); 

} 

