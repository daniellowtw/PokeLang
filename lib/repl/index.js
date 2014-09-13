(function() {
'use strict';

var fs = require('fs'),
    path = require('path'),
    errors = require('../errors'),
    reader = require('./reader.js'),
    interpreter = require('../interpreter'),
    translator = require('../translator');

var translate_flag = false,
    file = null,
    output_file = null,
    output_flag = false,
    output = '';

reader.init();

translator.init();

var inputFunc = function(prompt, error, check) {

  var correctFormat = false;

  interpreter.out(prompt);

  var data;

  while (!correctFormat) {

    var response = fs.readSync(process.stdin.fd, 100, 0, 'utf-8');

    data = response[0].split(/[\r\n]/)[0];

    correctFormat = check.call(null, data);

    if (!correctFormat) {

      interpreter.out(error || prompt);

    }

  }

  return Number(data);

};

interpreter.setInputFunction(inputFunc);

var read = function(data) {

  if (translate_flag) {

    try {

      output = translator.read(data);

      console.log(output);

    } catch (err) {

      throw err;

    }

  } else {

    try {

      reader.read(data);

    } catch (err) {

      if (err instanceof errors.PokeLangError) {

        err.setLineNumber(reader.current_line);

        interpreter.out('\x1B[31m' + err.name + ' - \x1B[39m\n');

        interpreter.out('\x1B[31m' + err.message + '\x1B[39m\n');

      } else {

        throw err;

      }

    }

  }

};

var printPrompt = function() {

  interpreter.out(reader.console_prompt + ' ');

};

var setOption = function(option) {

  if (option === 't') {

    translate_flag = true;

  }

};

var setLongOption = function(option) {

  if (option === 'translate') {

    setOption('t');

  } else if (option === 'output') {

    setOption('o');

  }


};

var getOption = function(arg) {

  if (arg.indexOf('--') === 0) {

    setLongOption(arg.substring(2));

  } else if (arg.indexOf('-') === 0) {

    setOption(arg.substring(1));

  } else if (file === null) {

    file = arg;

  }

};

var getOptions = function(args) {

  for(var i = 0; i < args.length; i++) {

    getOption(args[i]);

  }

};

if (process.argv.length >= 2) {

  var args = process.argv.slice(2);

  getOptions(args);

  fs.readFile(file, 'utf8', function(err, data) {

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

})();
