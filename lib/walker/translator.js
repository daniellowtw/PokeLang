var errors = require('../errors/errors.js');

var translator = {};

module.exports = translator;

translator.moves = {
  'TACKLE': 'push',
  'EMBER': '+',
  'WATERGUN': '-',
  'FLAMETHROWER': '*',
  'HYDROPUMP': '/',
  'POUND': '==',
  'HEADBUTT': '>',
  'BITE': '>=',
  'HORNATTACK': '<=',
  'BODYSLAM': '<',
  'THUNDERSHOCK': '{',
  'THUNDERBOLT': '}',
  'THUNDER': 'exec',
  'CONFUSION': 'store',
  'PSYBEAM': 'load',
  'EARTHQUAKE': 'ifelse', 
  'SCRATCH': 'while', 
  'ROCKTHROW': 'dup',
  'VINEWHIP': 'swap',
  'RAZORLEAF': 'rot3',
  'MEGAPUNCH': '[',
  'THUNDERPUNCH': ']',
  'FIREPUNCH': 'get',
  'ICEPUNCH': 'put',
  'ROLLINGKICK': 'append',
  'JUMPKICK': 'arrpop',
  'HIJUMPKICK': 'map',
  'MEGAKICK': 'fold',
  'POISONSTING': 'pop',
  'SLASH': 'out'
}

var reverseMoves = (function() {

  var reverse = {};

  for (key in translator.translate) {

    reverse[translator.translate[key]] = key;

  }

  return reverse;

})();

translator.reverseMoves = reverseMoves;

var translateList = function(list) {

  var output = [];

  for (var i = 0; i < list.length; i++) {

    output.push(translator.translate(list[i]));

  }

  return output;

}

translator.translateList = translateList;

var translate = function(key) {

  if (translator.moves[key]) {
  
    return translator.moves[key];

  } else {

    throw new errors.invalidMove(key);

  }

}

translator.translate = translate;

var join = function(list) {

  return list.join(' ');

}

translator.join = join;

