var W = require('../lib/walker/walker.js');
var E = require('../lib/errors/errors.js');

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
                ["SENDS_OUT", "SABRINA", "BUTTERFREE"]
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
                ["SENDS_OUT", "SABRINA", "GEODUDE"]
               ],
               ["CONCAT", ["ENEMYTURN", "GEODUDE", "SCRATCH"],
                ["CONCAT", ["EFFECTIVE"],
                 ["CONCAT", ["SELFTURN", "GEODUDE", "SCRATCH"], null
                 ]
                ]
               ]
              ]

    expect(function() {W.walk(ast);}).toThrow(E.pokemonDoesNotKnowMove('GEODUDE', 'SCRATCH'));
  
  });

  it('should throw an error when turn order is wrong', function() {

    var ast = ["PROG", 
               ["START", ["GO", "PIKACHU"],
                ["SENDS_OUT", "SABRINA", "STARYU"]
               ],
               ["CONCAT", ["ENEMYTURN", "STARYU", "TACKLE"],
                ["CONCAT", ["EFFECTIVE"],
                 ["CONCAT", ["ENEMYTURN", "STARYU", "TACKLE"], null
                 ]
                ]
               ]
              ]

    expect(function() {W.walk(ast);}).toThrow(E.wrongTurnOrder('enemy'));
  
  });

  it('should throw an error on incorrect modifier', function() {

    var ast = ["PROG", 
               ["START", ["GO", "GEODUDE"],
                ["SENDS_OUT", "SABRINA", "GEODUDE"]
               ],
               ["CONCAT", ["ENEMYTURN", "GEODUDE", "TACKLE"],
                ["CONCAT", ["EFFECTIVE"],
                 ["CONCAT", ["SELFTURN", "GEODUDE", "SCRATCH"], null
                 ]
                ]
               ]
              ]

    expect(function() {W.walk(ast);}).toThrow(E.wrongTypeModifier('TACKLE', 'NOT VERY EFFECTIVE', 'GEODUDE'));
  
  });

  it('should check for types correctly', function() {

    var ast = ["PROG", 
               ["START", ["GO", "CHARMANDER"],
                ["SENDS_OUT", "SABRINA", "BULBASAUR"]
               ],
               ["CONCAT", ["ENEMYTURN", "BULBASAUR", "VINEWHIP"],
	        ["CONCAT", ["NOT_EFFECTIVE"],
                 ["CONCAT", ["SELFTURN", "CHARMANDER", "EMBER"], 
	          ["CONCAT", ["EFFECTIVE"], null]
	         ]
                ]
               ]
              ]

    expect(W.walk(ast)).toEqual(['VINEWHIP', 'EMBER']);
  
  });

  it('should throw error when enemy trainer name is wrong', function() {

    var ast = ["PROG", 
               ["START", ["GO", "CHARMANDER"],
                ["SENDS_OUT", "SABRINA", "BULBASAUR"]
               ],
	       ["CONCAT", ["ENEMYSWITCHPOKEMON", "BROCK", "BULBASAUR", "MEWTWO"], null
               ]
              ]

    expect(function() {W.walk(ast);}).toThrow(E.wrongEnemyTrainer("SABRINA", "BROCK"));
  
  });

  it('should throw error when Pokemon switches after enemy uses move', function() {

    var ast = ["PROG", 
               ["START", ["GO", "CHARMANDER"],
                ["SENDS_OUT", "SABRINA", "BULBASAUR"]
               ],
	       ["CONCAT", ["ENEMYTURN", "BULBASAUR", "TACKLE"], 
                ["CONCAT", ["SELFSWITCHPOKEMON", "CHARMANDER", "PIKACHU"], null
                ]
               ]
              ]

    expect(function() {W.walk(ast);}).toThrow(E.switchNotAllowed());
  
  });

});

describe('walker with translator', function() {

  it('should parse ast correctly', function() {

    var ast = ["PROG", 
               ["START", ["GO", "PIKACHU"],
                ["SENDS_OUT", "SABRINA", "BUTTERFREE"]
               ],
               ["CONCAT", ["ENEMYTURN", "BUTTERFREE", "TACKLE"],
                ["CONCAT", ["SELFTURN", "PIKACHU", "THUNDERSHOCK"], null
                ]
               ]
              ]

    var actual = W.walk(ast, true);

    expect(actual).toEqual('25 {');
  
  });

});
