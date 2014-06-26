;(function() {

  var P = require('./lib/parser/pokelang.js'),
      W = require('./lib/walker/walker.js'),
      T = require('./lib/interpreter/tokeniser.js'),
      I = require('./lib/interpreter/interpreter.js'),
      E = require('./lib/errors/errors.js'),
      fs = require('fs');

  W.init();
  I.init();  

  fs.readFile(process.argv[2], 'utf8', function(err, data) {

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

})();
