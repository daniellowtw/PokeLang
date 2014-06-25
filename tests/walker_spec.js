var W = require('../lib/walker/walker.js');

W.init();

describe('walker', function() {

  it('should import without error', function() {

  });

  it('should walk an empty ast', function() {

    expect(W.walk([])).toEqual([]);
  
  });

  it('should walk a simple ast', function() {

    var ast = ["PROG", 
               ["START", ["GO", "CHARMANDER"],
                ["SENDS_OUT", "BUTTERFREE"]
               ],
               ["CONCAT", ["ENEMYTURN", "BUTTERFREE", "TACKLE"],
                ["CONCAT", ["SELFTURN", "CHARMANDER", "SCRATCH"], null
                ]
               ]
              ]

    expect(W.walk(ast)).toEqual(['TACKLE', 'SCRATCH']);
  
  });

  it('should throw an error when Pokemon does not know move', function() {

    var ast = ["PROG", 
               ["START", ["GO", "GEODUDE"],
                ["SENDS_OUT", "GEODUDE"]
               ],
               ["CONCAT", ["ENEMYTURN", "GEODUDE", "SCRATCH"],
                ["CONCAT", ["EFFECTIVE"],
                 ["CONCAT", ["SELFTURN", "GEODUDE", "SCRATCH"], null
                 ]
                ]
               ]
              ]

    expect(function() {W.walk(ast);}).toThrow('GEODUDE does not know move SCRATCH');
  
  });

  it('should throw an error when turn order is wrong', function() {

    var ast = ["PROG", 
               ["START", ["GO", "PIKACHU"],
                ["SENDS_OUT", "STARYU"]
               ],
               ["CONCAT", ["ENEMYTURN", "STARYU", "TACKLE"],
                ["CONCAT", ["EFFECTIVE"],
                 ["CONCAT", ["ENEMYTURN", "STARYU", "TACKLE"], null
                 ]
                ]
               ]
              ]

    expect(function() {W.walk(ast);}).toThrow('Turn order is wrong: enemyTurnTaken');
  
  });
  it('should throw an error on incorrect modifier', function() {

    var ast = ["PROG", 
               ["START", ["GO", "GEODUDE"],
                ["SENDS_OUT", "GEODUDE"]
               ],
               ["CONCAT", ["ENEMYTURN", "GEODUDE", "TACKLE"],
                ["CONCAT", ["EFFECTIVE"],
                 ["CONCAT", ["SELFTURN", "GEODUDE", "SCRATCH"], null
                 ]
                ]
               ]
              ]

    expect(function() {W.walk(ast);}).toThrow('TACKLE should be not very effective on GEODUDE');
  
  });

  it('should check for types correctly', function() {

    var ast = ["PROG", 
               ["START", ["GO", "CHARMANDER"],
                ["SENDS_OUT", "BULBASAUR"]
               ],
               ["CONCAT", ["ENEMYTURN", "BULBASAUR", "VINE WHIP"],
	        ["CONCAT", ["NOT_EFFECTIVE"],
                 ["CONCAT", ["SELFTURN", "CHARMANDER", "EMBER"], 
	          ["CONCAT", ["EFFECTIVE"], null]
	         ]
                ]
               ]
              ]

    expect(W.walk(ast)).toEqual(['VINE WHIP', 'EMBER']);
  
  });

});

describe('walker with translator', function() {

  it('should parse ast correctly', function() {

    var ast = ["PROG", 
               ["START", ["GO", "PIKACHU"],
                ["SENDS_OUT", "BUTTERFREE"]
               ],
               ["CONCAT", ["ENEMYTURN", "BUTTERFREE", "TACKLE"],
                ["CONCAT", ["SELFTURN", "PIKACHU", "THUNDERSHOCK"], null
                ]
               ]
              ]

    var expected = W.walk(ast, true);

    expect(expected).toEqual('25 {');
  
  });

});
