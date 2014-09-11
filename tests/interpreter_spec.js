// require jasmine-node
var I = require('../lib/interpreter'),
    B = require('../lib/repl/battle.js'),
    R = require('../lib/repl/reader.js');

R.init();

describe('addition', function() {

  it('should add 1 and 2', function() {

    var prog = [I.num(1)
               ,I.num(2)
               ,I.operation('+')
               ];

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

describe('blocks', function() {

  it('should initialise correctly', function() {

    var prog = [I.openblock('[')
               ,I.num(2)
               ,I.num(1)
               ,I.closeblock(']')
               ];

    var result = [I.block([I.num(2), I.num(1)])];

    expect(I.run(prog)).toEqual(result);

  });

  it('should initialise empty blocks', function() {

    var prog = [I.openblock('[')
               ,I.closeblock(']')
               ];

    var result = [I.block([])];

    expect(I.run(prog)).toEqual(result);

  });

  it('should nest correctly', function() {

    var prog = [I.openblock('[')
               ,I.openblock(']')
               ,I.closeblock(']')
               ,I.closeblock(']')
               ];

    var result = [I.block([I.block([])])];

    expect(I.run(prog)).toEqual(result);

  });

  it('should put correctly', function() {

    var prog = [I.openblock('[')
               ,I.num(1)
               ,I.closeblock(']')
               ,I.num(2)
               ,I.num(0)
               ,I.operation('put')
               ];

    var result = [I.block([I.num(2)])];

    expect(I.run(prog)).toEqual(result);

  });

  it('should get correctly', function() {

    var prog = [I.openblock('[')
               ,I.num(1)
               ,I.closeblock(']')
               ,I.num(0)
               ,I.operation('get')
               ];

    var result = [I.num(1)];

    expect(I.run(prog)).toEqual(result);

  });

  it('should append correctly', function() {

    var prog = [I.openblock('[')
               ,I.num(1)
               ,I.closeblock(']')
               ,I.num(0)
               ,I.operation('append')
               ];

    var result = [I.block([I.num(1), I.num(0)])];

    expect(I.run(prog)).toEqual(result);

  });

  it('should blockpop correctly', function() {

    var prog = [I.openblock('[')
               ,I.num(1)
               ,I.closeblock(']')
               ,I.operation('blockpop')
               ];

    var result = [I.block([]), I.num(1)];

    expect(I.run(prog)).toEqual(result);

  });

  it('should map correctly', function() {

    var prog = [I.openblock('[')
               ,I.num(1)
               ,I.num(2)
               ,I.num(3)
               ,I.num(4)
               ,I.closeblock(']')
               ,I.block([I.operation('dup'), I.operation('*')])
               ,I.operation('map')
               ];

    var result = [I.block([I.num(1), I.num(4), I.num(9), I.num(16)])];

    expect(I.run(prog)).toEqual(result);

  });

  it('should fold correctly', function() {

    var prog = [I.num(0)
               ,I.openblock('[')
               ,I.num(1)
               ,I.num(2)
               ,I.num(3)
               ,I.num(4)
               ,I.closeblock(']')
               ,I.block([I.operation('+')])
               ,I.operation('fold')
               ];

    var result = [I.num(10)];

    expect(I.run(prog)).toEqual(result);

  });

  it('should fold an block of operations correctly', function() {

    var prog = [I.num(5)
               ,I.openblock('[')
               ,I.block([I.operation('dup')])
               ,I.block([I.operation('*')])
               ,I.closeblock(']')
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

});

