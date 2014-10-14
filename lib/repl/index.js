(function() {
'use strict';

var fs = require('fs'),
    os = require('os'),
    path = require('path'),
    errors = require('../errors'),
    reader = require('./reader.js'),
    interpreter = require('../interpreter'),
    translator = require('../translator');

var translate_flag = false,
    comment_flag = false,
    file = null,
    output = '';

reader.init();

translator.init();

var inputFunc = function(prompt, error, check) {

  var correctFormat = false;

  interpreter.out(prompt);

  var data;

  var buffer = new Buffer(256);

  while (!correctFormat) {

    var fd = os.platform() === 'linux' ? fs.openSync('/dev/stdin', 'rs') : process.stdin.fd;

    var read_size = fs.readSync(fd, buffer, 0, 256);

    var response = buffer.toString('utf8', 0, read_size);

    data = response.split(/[\r\n]/)[0];

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

  } else if (option === 'c') {

    comment_flag = true;

  } else {

    invalidOption('-' + option);

  }

};

var setLongOption = function(option) {

  if (option === 'translate') {

    setOption('t');

  } else if (option === 'comments') {

    setOption('c');

  } else {

    invalidOption('--' + option);

  }

};

var getOption = function(arg) {

  if (arg.indexOf('--') === 0) {

    setLongOption(arg.substring(2));

  } else if (arg.indexOf('-') === 0) {

    setOption(arg.substring(1));

  } else if (file === null) {

    file = arg;

  } else {

    invalidOption(arg);

  }

};

var invalidOption = function(option) {

  throw new Error("Invalid option '" + option + "'. Type -help to list options");

}

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
