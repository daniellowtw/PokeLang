var fs = require('fs'),
    reader = require('../lib/repl/reader.js');

var test_files = ['num'
                 ,'add'
                 ,'array'
                 ,'dictionary'
                 ,'string'
                 ,'while'
                 ,'fib'
                 ];

reader.init();

describe('test suite', function() {

  var poke_files = [],
      result_files = [],
      error_files = [],
      poke_files_loaded = 0,
      result_files_loaded = 0;

  for (var i = 0; i < test_files.length; i++) {

    (function(i) {

      it('should pass ' + test_files[i], function() {
  
        var loaded = false;

        var flag = false;
  
        var actual;
  
        var expected;
  
        var done = function() {
 
          flag = true;

        }

        waitsFor(function() {

          return flag;

        }, 'Finished loading files', 500);
 
        runs(function() {

          reader.reset();

          reader.read(actual);

          expect(reader.getStack().toString()).toEqual(expected.substring(0, expected.length - 1));

        });

        var readFile = function(file, callback) {

          return fs.readFile(file, 'utf8', function(err, data) {
         
            if (err) {
  
              throw err; 
  
            }
  
            callback(data);
  
            if (loaded) {
  
              done();
  
            } else {
  
              loaded = true;
   
            }
  
          });

        }

        readFile( './tests/test_files/' + test_files[i] + '.poke.js', function(data) {
 
          actual = data;

        }); 

        readFile( './tests/test_files/' + test_files[i] + '.result.js', function(data) {
 
          expected = data;

        }); 
 
      });
 
    })(i); 
   
  }

});
