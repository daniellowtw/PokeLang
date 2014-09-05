var errors = require('../errors/errors.js'),
    R = require('./reader.js'),
    I = require('../interpreter/interpreter.js');

var browser_version = {};

R.init();

module.exports = browser_version;

browser_version.setInputFunction = function(input) {
  
  I.setInputFunction(input);

}

browser_version.setOutputFunction = function(output) {
  
  I.setOutputFunction(output);

}

var read = function(data) {
  
  R.read(data)

}

browser_version.read = read;
