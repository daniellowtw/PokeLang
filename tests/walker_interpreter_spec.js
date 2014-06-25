var W = require('../lib/walker/walker.js');
var T = require('../lib/interpreter/tokeniser.js');
var I = require('../lib/interpreter/interpreter.js');

describe('walker and interpreter', function() {

  it('should parse and interpret ast', function() {

    var ast = ["PROG", 
               ["START", ["GO", "CATERPIE"],
                ["SENDS_OUT", "FLAREON"]
               ],
               ["CONCAT", ["ENEMYTURN", "FLAREON", "TACKLE"],    // 136
                ["CONCAT", ["SELFTURN", "CATERPIE", "TACKLE"],   // 10
                 ["CONCAT", ["ENEMYTURN", "FLAREON", "EMBER"],   // +
                 ]
                ]
               ]
              ]

    var expected = I.run(T.tokenise(W.walk(ast, true)));

    expect(expected).toEqual([I.num(146)]);
  
  });

  it('should parse and interpret ast with blocks', function() {

    var ast = ["PROG", 
               ["START", ["GO", "JOLTEON"],
                ["SENDS_OUT", "FLAREON"]
               ],
               ["CONCAT", ["ENEMYTURN", "FLAREON", "TACKLE"],                    // 136
                ["CONCAT", ["SELFTURN", "JOLTEON", "TACKLE"],                    // 135
                 ["CONCAT", ["SELFTURN", "JOLTEON", "THUNDERSHOCK"],             // {
                  ["CONCAT", ["ENEMYTURN", "FLAREON", "EMBER"],                  // +
                   ["CONCAT", ["SELFSWITCHPOKEMON", "JOLTEON", "PIKACHU"],
                    ["CONCAT", ["ENEMYSWITCHPOKEMON", "FLAREON", "ALAKAZAM"],
                     ["CONCAT", ["ENEMYSWITCHPOKEMON", "ALAKAZAM", "MEW"],
                      ["CONCAT", ["SELFTURN", "PIKACHU", "THUNDERBOLT"],          // }
                       ["CONCAT", ["SELFTURN", "PIKACHU", "THUNDER"],             // exec 
                       ]
                      ]
                     ]
                    ]
                   ]
                  ]
                 ]
                ]
               ]
              ]

    var expected = I.run(T.tokenise(W.walk(ast, true)));

    expect(expected).toEqual([I.num(271)]);
  
  });

});
