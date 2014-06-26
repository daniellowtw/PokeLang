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


	it('should parse trailing new lines', function() {
		var data = "Go! CHARMELEON!\n\r\nFoe GARY sends out CHARMANDER!\n\n\n\n\rFoe CHARMANDER uses TACKLE!\n\n\n";
		var result = parser.parse(data);
		var expected = ['PROG', ['START', ['GO', 'CHARMELEON'],
				['SENDS_OUT', 'GARY', 'CHARMANDER']
			],
			['CONCAT', ['ENEMYTURN', 'CHARMANDER', 'TACKLE'], null]
		];
		expect(result).toEqual(expected);
	});

	it('should parse comments', function() {
		var data = "Go! CHARMELEON! //this is a comment\n\nFoe GARY sends out CHARMANDER!\n\n//this is a comment\n\nFoe CHARMANDER uses TACKLE!\n\n\n";
		var result = parser.parse(data);
		var expected = ['PROG', ['START', ['GO', 'CHARMELEON'],
				['SENDS_OUT', 'GARY', 'CHARMANDER']
			],
			['CONCAT', ['ENEMYTURN', 'CHARMANDER', 'TACKLE'], null]
		];
		expect(result).toEqual(expected);
	});
});