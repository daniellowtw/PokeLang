// require jasmine-node
var I = require('../lib/interpreter/interpreter.js');

I.init();

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

    var prog = [I.num(1)
               ,block
               ,I.operation('store')
               ,I.num(5)
               ,I.num(3)
               ,I.num(1)
               ,I.operation('load')
               ,I.operation('exec')
               ];

    var result = [I.num(125)];

    expect(I.run(prog)).toEqual(result);

  });

});
