var parser = require('../pokemon.js');

describe('start', function() {

  it('should parse start', function() {
    var data = "Go! PIKACHU!;Foe SABRINA sends out BUTTERFREE!;";
    var result = parser.parse(data);
    var expected = ['PROG', ['START', ['GO', 'PIKACHU'],
      ['SENDS_OUT', 'BUTTERFREE']
    ], null];
    expect(result).toEqual(expected);
  });

});

