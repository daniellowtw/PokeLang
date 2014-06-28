// require jasmine-node
var I = require('../lib/interpreter/interpreter.js');
var T = require('../lib/interpreter/tokeniser.js');
var E = require('../lib/errors/errors.js');

describe('tokeniser', function() {

  it('should tokenise empty strings', function() {

    var string = '';

    var result = [
                 ];

    expect(T.tokenise(string)).toEqual(result);

  });

  it('should tokenise numbers and operations correctly', function() {

    var string = '1 2 3';

    var result = [I.num(1)
                 ,I.num(2)
                 ,I.num(3)
                 ];

    expect(T.tokenise(string)).toEqual(result);

    string = '1 2 3 +';

    result = [I.num(1)
             ,I.num(2)
             ,I.num(3)
             ,I.operation('+')
             ];

    expect(T.tokenise(string)).toEqual(result);

  });

  it('should tokenise blocks correctly', function() {

    var string = '1 2 3 { + - } load';

    var result = [I.num(1)
                 ,I.num(2)
                 ,I.num(3)
                 ,I.block([I.operation('+')
                          ,I.operation('-')
                          ])
                 ,I.operation('load')
                 ];

    expect(T.tokenise(string)).toEqual(result);

  });

  it('should tokenise nested blocks correctly', function() {

    var string = '1 2 3 { + { swap } +  } load';

    var result = [I.num(1)
                 ,I.num(2)
                 ,I.num(3)
                 ,I.block([I.operation('+')
                          ,I.block([I.operation('swap')])
                          ,I.operation('+')
                          ])
                 ,I.operation('load')
                 ];

    expect(T.tokenise(string)).toEqual(result);

  });

  it('should throw error if a block is not closed', function() {

    var string = '1 2 3 { + { swap } +  load';

    expect(function(){T.tokenise(string);}).toThrow(E.blockNotClosed());

  });

});
