var P = require('./lib/parser/pokelang.js'),
    W = require('./lib/walker/walker.js'),
    T = require('./lib/interpreter/tokeniser.js'),
    I = require('./lib/interpreter/interpreter.js'),
    E = require('./lib/errors/errors.js'),
    fs = require('fs'),
    program = require('commander'),
    pokeLang;

W.init();
I.init();  

program.version('0.1.0');

pokeLang = function(file) {

  fs.readFile(file, 'utf8', function(err, data) {
    var result;

    if (err) {

      console.error("Error opening file: %s", err);

      process.exit(1);

    }

    result =  I.run(
           T.tokenise(
             W.walk(
               P.parse(data)
             , true)
           )
         );

    for (var i = 0; i < result.length; i++) {

      result[i] = result[i].toString();

    }

    console.log(result.join(' '));

  })

}

program
  .command('*')
  .description('Parses a PokeLang file')
  .action(function(file) {

     pokeLang(file);

   });

program.parse(process.argv);
