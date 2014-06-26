var P = require('../lib/parser/pokemon.js'),
    W = require('../lib/walker/walker.js'),
    T = require('../lib/interpreter/tokeniser.js'),
    I = require('../lib/interpreter/interpreter.js');

var fs = require('fs');

var test_files = ['num'
                 ,'add'
                 ,'fib'
                 ];

var pokeLang = function(input) {

  return I.run(
           T.tokenise(
             W.walk(
               P.parse(input.trim())
             , true)
           )
         )

}

var stringify = function(list) {

  for (var i = 0; i < list.length; i++) {

    list[i] = list[i].toString();

  }

  return list.join(' ');

}

describe('parser, walker and interpreter', function() {

  it('should import with no error', function() {
  
  });

  it('should parse numbers correctly', function() {

    var battle = ["Go! FLAREON!"
                 ,"Foe SABRINA sends out FLAREON!"
                 ,"FLAREON uses TACKLE!"
                 ,"Foe FLAREON uses TACKLE!"
                 ].join('\n');

    var actual = stringify(pokeLang(battle));

    expect(actual).toEqual('136 136');

  });

  it('should parse numbers and operations correctly', function() {

    var battle = ["Go! FLAREON!"
                 ,"Foe SABRINA sends out FLAREON!"
                 ,"FLAREON uses TACKLE!"
                 ,"Foe FLAREON uses TACKLE!"
                 ,"FLAREON uses EMBER!"
                 ].join('\n');

    var actual = stringify(pokeLang(battle));

    expect(actual).toEqual('272');

  });

});

describe('test suite', function() {

  var poke_files = [],
      result_files = [],
      error_files = [],
      poke_files_loaded = 0,
      result_files_loaded = 0;

  beforeEach(function(done) {

    for (var i = 0; i < test_files.length; i++) {

      (function(i) {
  
        fs.readFile('./tests/test_files/' + test_files[i] + '.poke.js', 'utf8', function(err, data) {
       
          if (err) {

            error_files[i] = err; 

          }

          poke_files[i] = data || "Go! PIKACHU!\nFoe BROCK sends out GEODUDE!";

          poke_files_loaded++;

          if (poke_files_loaded == test_files.length && result_files_loaded == test_files.length) {

            done();

          }

        });

        fs.readFile('./tests/test_files/' + test_files[i] + '.result.js', 'utf8', function(err, data) {
        
          if (err) {

            error_files[i] = err; 

          }

          result_files[i] = data || '';

          result_files_loaded++;

          if (poke_files_loaded == test_files.length && result_files_loaded == test_files.length) {

            done();

          }

        });

      })(i);

    }

  });

  it('should run tests using files in the test_files folder', function(done) {

    for (var i = 0; i < poke_files.length; i++) {
  
      poke_files[i] = stringify(pokeLang(poke_files[i]));
  
    }
  
    expect(poke_files).toEqual(result_files);

    for (var i = 0; i < error_files.length; i++) {
  
      expect(error_files[i]).toEqual(undefined);
  
    }
    done();

  });

});

