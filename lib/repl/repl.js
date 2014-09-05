var readline = require('readline'),
    fs = require('fs'),
    path = require('path'),
    errors = require('../errors/errors.js'),
    R = require('./reader.js'),
    I = require('../interpreter/interpreter.js');

R.init();

var inputFunc = function(prompt, error, check) {

  var correctFormat = false;

  I.out(prompt);

  while (!correctFormat) {

    var response = fs.readSync(process.stdin.fd, 100, 0, 'utf-8');

    var data = response[0].split(/[\r\n]/)[0];

    correctFormat = check.call(null, data);

    if (!correctFormat) {

      I.out(error || prompt);

    }

  }

  return data;

}

I.setInputFunction(inputFunc);

var read = function(data) {

  try {
  
    R.read(data)

  } catch (err) {

    if (err instanceof errors.PokeLangError) {

      process.stdout.write('\x1B[31m' + err.name + ' - \x1B[39m\n');

      process.stdout.write('\x1B[31m' + err.message + '\x1B[39m\n');
  
    } else {
      
      throw err
    
    }
  }

}

var printPrompt = function() {

  process.stdout.write(R.console_prompt + ' ');

}

if (process.argv[2]) {

  fs.readFile(process.argv[2], 'utf8', function(err, data) {

    var result;

    if (err) {

      console.error('Error opening file: %s', err);
   
      process.exit(1);
 
    }

    read(data);
  
    process.exit(1);

  }); 

} else {

  process.stdin.resume();
  
  process.stdin.setEncoding('utf8');
  
  printPrompt();
  
  process.stdin.on('data', function(data) {
   
    read(data);
  
    printPrompt();
  
  });

}
