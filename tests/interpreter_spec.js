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
