var translator = {};

module.exports = translator;

translator.translate = {
  'TACKLE': 'push',
  'EMBER': '+',
  'BUBBLE': '-',
  'FLAMETHROWER': '*',
  'WATER GUN': '/',
  'POUND': '==',
  'BODY SLAM': '>',
  'BITE': '>=',
  'HORN ATTACK': '<=',
  'HEADBUTT': '<',
  'THUNDDERSHOCK': '{',
  'THUNDERBOLT': '}',
  'THUNDER': 'exec',
  'CONFUSION': 'store',
  'PSYBEAM': 'load',
  'EARTHQUAKE': 'ifelse' 
}

translator.reverse = (function() {

  var reverse = {};

  for (key in translator.translate) {

    reverse[translator.translate[key]] = key;

  }

  return reverse;

})();

