var parser = require('../pokemon.js');
var walker = require('../lib/walker/walker.js');
var fs     = require('fs');
var path   = require('path');

var args = process.argv;
var filePath = path.join(__dirname + args[2]);

fs.readFile(args[2], 'utf-8', function(err, data) {

  if (err) {
    console.log("Error reading file", err);
    return;
  }

  var input = data;

  var ast = parser.parse(input);

  console.log("==Output==");
  console.log(walker.walk(ast));

});


