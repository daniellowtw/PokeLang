var fs = require('fs'),
    path = require('path'),
    errors = require('../errors'),
    R = require('./reader.js'),
    I = require('../interpreter');

R.init();

var inputFunc = function(prompt, error, check) {

  var correctFormat = false;

  I.out(prompt);

  var data;

  while (!correctFormat) {

    var response = fs.readSync(process.stdin.fd, 100, 0, 'utf-8');

    data = response[0].split(/[\r\n]/)[0];

    correctFormat = check.call(null, data);

    if (!correctFormat) {

      I.out(error || prompt);

    }

  }

  return Number(data);

};

I.setInputFunction(inputFunc);

var read = function(data) {

  try {
  
    R.read(data);

  } catch (err) {

    if (err instanceof errors.PokeLangError) {

      err.setLineNumber(R.current_line);

      I.out('\x1B[31m' + err.name + ' - \x1B[39m\n');

      I.out('\x1B[31m' + err.message + '\x1B[39m\n');
  
    } else {
      
      throw err;
    
    }

  }

};

var printPrompt = function() {

  I.out(R.console_prompt + ' ');

};

if (process.argv[2]) {

  fs.readFile(process.argv[2], 'utf8', function(err, data) {

    if (err) {

      console.error('Error opening file: %s', err);
   
      process.exit(1);
 
    }

    read(data);
  
    process.exit(0);

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
