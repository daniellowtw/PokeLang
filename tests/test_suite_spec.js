var fs = require('fs'),
    path = require('path'),
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

          var characters_to_remove = expected[expected.length - 2] === '\r' ? 2 : 1;

          expected = expected.substring(0, expected.length - characters_to_remove);

          expect(reader.getStack().toString()).toEqual(expected);

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

        readFile(path.join(__dirname, 'test_files/' + test_files[i] + '.poke.js'), function(data) {

          actual = data;

        });

        readFile(path.join(__dirname, 'test_files/' + test_files[i] + '.result.js'), function(data) {

          expected = data;

        });

      });

    })(i);

  }

});

