var parser = require('../lib/parser/pokemon.js');

describe('start', function() {

  it('should parse start', function() {
    var data = "Go! PIKACHU!\nFoe SABRINA sends out BUTTERFREE!\n";
    var result = parser.parse(data);
    var expected = ['PROG', ['START', ['GO', 'PIKACHU'],
      ['SENDS_OUT', 'SABRINA', 'BUTTERFREE']
    ], null];
    expect(result).toEqual(expected);
  });

});

