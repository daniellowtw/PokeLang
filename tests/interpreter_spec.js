// require jasmine-node
var I = require('../lib/interpreter/interpreter.js');
var T = require('../lib/interpreter/tokeniser.js');

I.init();
T.init();

describe('addition', function() {

  it('should add 1 and 2', function() {

    var prog = [I.num(1)
               ,I.num(2)
               ,I.operation('+')
               ];

    var result = [I.num(3)];

    expect(I.run(prog)).toEqual(result);

  });

  it('should add 1 and 2 via tokeniser', function() {

    var string = '1 2 +';
     
    var prog = T.tokenise(string);

    var result = [I.num(3)];

    expect(I.run(prog)).toEqual(result);

  });

});

describe('dup', function() {

  it('should duplicate top num of the stack', function() {

    var prog = [I.num(1)
               ,I.num(2)
               ,I.operation('dup')
               ];

    var result = [I.num(1)
                 ,I.num(2)
                 ,I.num(2)
                 ];

    expect(I.run(prog)).toEqual(result);

  });

  it('should duplicate top block of the stack', function() {

    var block = I.block([I.operation('+')]);

    var prog = [I.num(1)
               ,block
               ,I.operation('dup')
               ];

    var result = [I.num(1)
                 ,block
                 ,block
                 ];

    expect(I.run(prog)).toEqual(result);

  });

});

describe('exec', function() {

  it('should exec block', function() {

    var block = I.block([I.operation('+')]);

    var prog = [I.num(1)
               ,I.num(2)
               ,block
               ,I.operation('exec')
               ];

    var result = [I.num(3)];

    expect(I.run(prog)).toEqual(result);

  });

});

describe('while', function() {

  it('should perform a while loop', function() {
  
    var expr = I.block([I.operation('dup')
                       ,I.num(2)
                       ,I.operation('>')
                       ]);

    var block = I.block([I.operation('pop')
                        ]);

    var prog = [I.num(1)
               ,I.num(2)
               ,I.num(3)
               ,I.num(4)
               ,I.num(5)
               ,expr
               ,block
               ,I.operation('while')
               ];

    var result = [I.num(1)
                 ,I.num(2)
                 ];

    expect(I.run(prog)).toEqual(result);

  });

  it('should sum a list of numbers', function() {
  
    var expr = I.block([I.operation('dup')
                       ,I.num(0)
                       ,I.operation('>')
                       ]);

    var block = I.block([I.operation('+')
                        ,I.operation('swap')
                        ]);

    var prog = [I.num(0)
               ,I.num(1)
               ,I.num(2)
               ,I.num(3)
               ,I.num(4)
               ,I.num(5)
               ,expr
               ,block
               ,I.operation('while')
               ,I.operation('+')
               ];

    var result = [I.num(15)
                 ];

    expect(I.run(prog)).toEqual(result);

  });

});

describe('dictionary', function() {

  it('should store and load an object', function() {

    var block = I.block([I.operation('+')]);

    var prog = [I.num(1)
               ,block
               ,I.operation('store')
               ,I.num(5)
               ,I.num(10)
               ,I.num(1)
               ,I.operation('load')
               ,I.operation('exec')
               ];

    var result = [I.num(15)];

    expect(I.run(prog)).toEqual(result);

  });

});

describe('arrays', function() {

  it('should initialise correctly', function() {

    var prog = [I.mark('[')
               ,I.num(2)
               ,I.num(1)
               ,I.operation(']')
               ];

    var result = [I.array([I.num(2), I.num(1)])];

    expect(I.run(prog)).toEqual(result);

  });

  it('should initialise empty arrays', function() {

    var prog = [I.mark('[')
               ,I.operation(']')
               ];

    var result = [I.array([])];

    expect(I.run(prog)).toEqual(result);

  });

  it('should put correctly', function() {

    var prog = [I.mark('[')
               ,I.num(1)
               ,I.operation(']')
               ,I.num(2)
               ,I.num(0)
               ,I.operation('put')
               ];

    var result = [I.array([I.num(2)])];

    expect(I.run(prog)).toEqual(result);

  });

  it('should get correctly', function() {

    var prog = [I.mark('[')
               ,I.num(1)
               ,I.operation(']')
               ,I.num(0)
               ,I.operation('get')
               ];

    var result = [I.num(1)];

    expect(I.run(prog)).toEqual(result);

  });

  it('should append correctly', function() {

    var prog = [I.mark('[')
               ,I.num(1)
               ,I.operation(']')
               ,I.num(0)
               ,I.operation('append')
               ];

    var result = [I.array([I.num(1), I.num(0)])];

    expect(I.run(prog)).toEqual(result);

  });

  it('should arrpop correctly', function() {

    var prog = [I.mark('[')
               ,I.num(1)
               ,I.operation(']')
               ,I.operation('arrpop')
               ];

    var result = [I.num(1)];

    expect(I.run(prog)).toEqual(result);

  });

  it('should map correctly', function() {

    var prog = [I.mark('[')
               ,I.num(1)
               ,I.num(2)
               ,I.num(3)
               ,I.num(4)
               ,I.operation(']')
               ,I.block([I.operation('dup'), I.operation('*')])
               ,I.operation('map')
               ];

    var result = [I.array([I.num(1), I.num(4), I.num(9), I.num(16)])];

    expect(I.run(prog)).toEqual(result);

  });

  it('should fold correctly', function() {

    var prog = [I.num(0)
               ,I.mark('[')
               ,I.num(1)
               ,I.num(2)
               ,I.num(3)
               ,I.num(4)
               ,I.operation(']')
               ,I.block([I.operation('+')])
               ,I.operation('fold')
               ];

    var result = [I.num(10)];

    expect(I.run(prog)).toEqual(result);

  });

  it('should fold an array of operations correctly', function() {

    var prog = [I.num(5)
               ,I.mark('[')
               ,I.block([I.operation('dup')])
               ,I.block([I.operation('*')])
               ,I.operation(']')
               ,I.block([I.operation('exec')])
               ,I.operation('fold')
               ];

    var result = [I.num(25)];

    expect(I.run(prog)).toEqual(result);

  });

});

describe('power', function() {

  it('should perform power through recursion', function() {

    var thenblock = I.block([I.num(1)
                            ,I.operation('-')
                            ,I.operation('swap')
                            ,I.operation('dup')
                            ,I.operation('rot3')
                            ,I.operation('rot3')
                            ,I.num(1)
                            ,I.operation('load')
                            ,I.operation('exec')
                            ,I.operation('*')
                            ]);

    var elseblock = I.block([I.operation('pop')
                            ]);

    var block = I.block([I.operation('dup')
                        ,I.num(1)
                        ,I.operation('>')
                        ,thenblock
                        ,elseblock
                        ,I.operation('ifelse')
                        ]);

    var powerProg = function(x, y) {
      
      return [I.num(1)
	     ,block
             ,I.operation('store')
             ,I.num(x)
             ,I.num(y)
             ,I.num(1)
             ,I.operation('load')
             ,I.operation('exec')
             ];

    }

    expect(I.run(powerProg(5,3))).toEqual([I.num(125)]);

    expect(I.run(powerProg(1,5))).toEqual([I.num(1)]);

    expect(I.run(powerProg(2,1))).toEqual([I.num(2)]);

  });

  it('should perform power through recursion via tokeniser', function() {

    var power = function(x, y) {

      var string = '1 { dup 1 > ' +
                     '{ 1 - swap dup rot3 rot3 1 load exec * } ' +
                     '{ pop } ' +
                     'ifelse '+
                   '} store ' + x + ' ' + y + ' 1 load exec';

      return string;

    }

    expect(I.run(T.tokenise(power(5,3)))).toEqual([I.num(125)]);

    expect(I.run(T.tokenise(power(1,3)))).toEqual([I.num(1)]);

    expect(I.run(T.tokenise(power(2,1)))).toEqual([I.num(2)]);

  });

});

