var P = require('./lib/parser/pokelang.js'),
    W = require('./lib/walker/walker.js'),
    T = require('./lib/interpreter/tokeniser.js'),
    I = require('./lib/interpreter/interpreter.js'),
    E = require('./lib/errors/errors.js'),
    H = require('./lib/errors/handler.js'),
    fs = require('fs');

W.init();
I.init();  

module.exports.parse =  function(file) {

  fs.readFile(file, 'utf8', function(err, data) {

    var result;

    if (err) {

      console.error("Error opening file: %s", err);

      process.exit(1);

    }

    try {

      result =  I.run(
             T.tokenise(
               W.walk(
                 P.parse(data)
               , true)
             )
           );

    } catch (err) {

      H.handle(err); 

    }

    for (var i = 0; i < result.length; i++) {

      result[i] = result[i].toString();

    }

    console.log(result.join(' '));

  })

}
