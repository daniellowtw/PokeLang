var readline = require('readline'),
    fs = require('fs'),
    path = require('path'),
    R = require('./reader.js');

R.init();

var read = function(data) {

  try {
  
    R.read(data)

  } catch (err) {

    process.stdout.write('\x1B[31m' + err.name + ' - \x1B[39m\n');

    process.stdout.write('\x1B[31m' + err.message + '\x1B[39m\n');
  
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

}

process.stdin.resume();

process.stdin.setEncoding('utf8');

printPrompt();

process.stdin.on('data', function(data) {
 
  read(data);

  printPrompt();

});
