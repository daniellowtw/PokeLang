var R = require('../lib/repl/reader.js'),
    E = require('../lib/errors/errors.js'),
    I = require('../lib/interpreter/interpreter.js');

R.init();

describe('reading input', function() {

    it('should read empty input', function() {
      R.reset();
      var data = '';
      R.read(data);
      var result = R.battle;
      var expected = {}; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

    it('should read start of battle with correct Pokemon and trainer names', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe SABRINA sends out BUTTERFREE!';
      R.read(data);
      var result = R.battle;
      var expected = {
        selfPokemon: 'PIKACHU',
        enemyPokemon: 'BUTTERFREE',
        enemyTrainer: 'SABRINA'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

    it('should ignore comments', function() {
      R.reset();
      var data = 'Go! PIKACHU!    \/\/ blahblahblah \nFoe SABRINA sends out BUTTERFREE!      \/\/ comments      \/\/ comments';
      R.read(data);
      var result = R.battle;
      var expected = {
        selfPokemon: 'PIKACHU',
        enemyPokemon: 'BUTTERFREE',
        enemyTrainer: 'SABRINA'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

    it('should ignore extra whitespace', function() {
      R.reset();
      var data = 'Go! PIKACHU!       \nFoe SABRINA    sends    out BUTTERFREE!';
      R.read(data);
      var result = R.battle;
      var expected = {
        selfPokemon: 'PIKACHU',
        enemyPokemon: 'BUTTERFREE',
         enemyTrainer: 'SABRINA'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

    it('should ignore extra newlines', function() {
      R.reset();
      var data = 'Go! PIKACHU!\n\nFoe SABRINA sends out BUTTERFREE!\n\n';
      R.read(data);
      var result = R.battle;
      var expected = {
        selfPokemon: 'PIKACHU',
        enemyPokemon: 'BUTTERFREE',
        enemyTrainer: 'SABRINA'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

    it('should handle separate reads', function() {
      R.reset();
      var data = 'Go! PIKACHU!\n';
      var data2 = 'Foe SABRINA sends out BUTTERFREE!\n';
      R.read(data);
      R.read(data2);
      var result = R.battle;
      var expected = {
        selfPokemon: 'PIKACHU',
        enemyPokemon: 'BUTTERFREE',
        enemyTrainer: 'SABRINA'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

    it('should throw an error on wrong Pokemon name', function() {
      R.reset();
      var data = 'Go! PIKACH!\n';
      expect(function() {
        R.read(data);
      }).toThrow(E.unrecognisedPokemon('PIKACH'));
    });

    it('should throw an error on missing exclamation mark', function() {
      R.reset();
      var data = 'Go! PIKACHU\n';
      expect(function() {
        R.read(data);
      }).toThrow(E.missingPunctuation('!'));
    });

    it('should throw an error on unexpected token', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nEnemy GARY sends out EEVEE!\n';
      expect(function() {
        R.read(data);
      }).toThrow(E.unexpectedToken('>>Foe<< $TRAINER sends out $POKEMON!', '>>Enemy<<'));
    });
   
    it('should throw an error on unexpected token', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe GARY send out EEVEE!\n';
      expect(function() {
        R.read(data);
      }).toThrow(E.unexpectedToken('Foe $TRAINER >>sends<< out $POKEMON!', 'Foe GARY >>send<<'));
    });

    it('should handle no newlines', function() {
      R.reset();
      var data = 'Go! PIKACHU! Foe SABRINA sends out BUTTERFREE!';
      R.read(data);
      var result = R.battle;
      var expected = {
        selfPokemon: 'PIKACHU',
        enemyPokemon: 'BUTTERFREE',
        enemyTrainer: 'SABRINA'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

});

describe('battle checking', function() {

    it('should check if Pokemon knows the move', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe GARY sends out EEVEE!\nPIKACHU uses THUNDERSHOCK!';
      R.read(data);
      var result = R.battle;
      var expected = {
        selfPokemon: 'PIKACHU',
        enemyPokemon: 'EEVEE',
        enemyTrainer: 'GARY'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

    it('should throw an error on unrecognised move', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe GARY sends out EEVEE!\nPIKACHU uses SHOCK!';
      expect(function() {
        R.read(data);
      }).toThrow(E.unrecognisedMove('SHOCK'));
    });

    it('should throw an error on misssing !', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe GARY sends out EEVEE!\nPIKACHU uses THUNDERSHOCK';
      expect(function() {
        R.read(data);
      }).toThrow(E.missingPunctuation('!'));
    });

    it('should throw an error when Pokemon does not know move', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe GARY sends out EEVEE!\nPIKACHU uses TACKLE!';
      expect(function() {
        R.read(data);
      }).toThrow(E.pokemonDoesNotKnowMove('PIKACHU', 'TACKLE'));
    });

    it('should check if move is super effective', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe GARY sends out VAPOREON!\nPIKACHU uses THUNDERSHOCK!\nIt\'s super effective!';
      R.read(data);
      var result = R.battle;
      var expected = {
        selfPokemon: 'PIKACHU',
        enemyPokemon: 'VAPOREON',
        enemyTrainer: 'GARY'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

    it('should check if move is not very effective', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe GARY sends out JOLTEON!\nPIKACHU uses THUNDERSHOCK!\nIt\'s not very effective!';
      R.read(data);
      var result = R.battle;
      var expected = {
        selfPokemon: 'PIKACHU',
        enemyPokemon: 'JOLTEON',
        enemyTrainer: 'GARY'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

    it('should check if move has not effect', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe GARY sends out DUGTRIO!\nPIKACHU uses THUNDERSHOCK!\nIt has no effect!';
      R.read(data);
      var result = R.battle;
      var expected = {
        selfPokemon: 'PIKACHU',
        enemyPokemon: 'DUGTRIO',
        enemyTrainer: 'GARY'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

    it('should throw error on missing effectivness', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe GARY sends out DUGTRIO!\nPIKACHU uses THUNDERSHOCK!\nFoe DUGTRIO uses EARTHQUAKE!';
      var result = R.battle;
      expect(function() {
        R.read(data);
      }).toThrow(E.unexpectedToken('>>It<< has no effect!', '>>Foe<<'));
    });

    it('should throw error on wrong effectivness', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe GARY sends out DUGTRIO!\nPIKACHU uses THUNDERSHOCK!\nIt\'s not very effective!';
      var result = R.battle;
      expect(function() {
        R.read(data);
      }).toThrow(E.unexpectedToken('>>It<< has no effect!', '>>It\'s<<'));
    });

    it('should throw error on wrong Pokemon used', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe GARY sends out EEVEE!\nCHARMANDER uses SCRATCH!';
      var result = R.battle;
      expect(function() {
        R.read(data);
      }).toThrow(E.wrongPokemon('PIKACHU', 'CHARMANDER'));
    });

    it('should handle sequential turns', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe GARY sends out EEVEE!\nPIKACHU uses THUNDERSHOCK!\nFoe EEVEE uses TACKLE!';
      R.read(data);
      var result = R.battle;
      var expected = {
        selfPokemon: 'PIKACHU',
        enemyPokemon: 'EEVEE',
        enemyTrainer: 'GARY'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

    it('should handle simple switching', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe GARY sends out EEVEE!\nPIKACHU! That\'s enough! Come back!\nGo! CHARMANDER!';
      R.read(data);
      var result = R.battle;
      var expected = {
        selfPokemon: 'CHARMANDER',
        enemyPokemon: 'EEVEE',
        enemyTrainer: 'GARY'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

    it('should handle both trainers switching', function() {
      R.reset();
      var data = 'Go! PIKACHU!\nFoe GARY sends out EEVEE!\nFoe GARY calls back EEVEE!\nFoe GARY sends out PIDGEOT!\nPIKACHU! That\'s enough! Come back!\nGo! CHARMANDER!';
      R.read(data);
      var result = R.battle;
      var expected = {
        selfPokemon: 'CHARMANDER',
        enemyPokemon: 'PIDGEOT',
        enemyTrainer: 'GARY'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

    it('should handle multiple turns', function() {
      R.reset();
      var data = ['Go! PIKACHU!'
                 ,'Foe GARY sends out EEVEE!'
                 ,'Foe GARY calls back EEVEE!'
                 ,'Foe GARY sends out BULBASAUR!'
                 ,'PIKACHU! That\'s enough! Come back!'
                 ,'Go! EEVEE!'
                 ,'EEVEE uses TACKLE!'
                 ,'Foe BULBASAUR uses TACKLE!'
                 ].join('\n');
      R.read(data);
      var result = R.battle;
      var expected = {
        selfPokemon: 'EEVEE',
        enemyPokemon: 'BULBASAUR',
        enemyTrainer: 'GARY'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);
    });

    it('should read fib.poke', function() {
      R.reset(); 
      var data = 'Go! SQUIRTLE!\n' + 
        'Foe GARY sends out PIDGEOT!\n' + 
        'Foe GARY calls back PIDGEOT!\n' + 
        'Foe GARY sends out PIDGEOT!\n' + 
        'SQUIRTLE uses TACKLE!                   // 18 <- n\n' + 
        'Foe GARY calls back PIDGEOT!\n' + 
        'Foe GARY sends out BULBASAUR!\n' + 
        'SQUIRTLE uses TACKLE!                   // 1\n' + 
        'SQUIRTLE! That\'s enough! Come back!\n' + 
        'Go! PIKACHU! \n' + 
        'Foe GARY calls back BULBASAUR!\n' + 
        'Foe GARY sends out GEODUDE!\n' + 
        'PIKACHU uses THUNDERSHOCK!              // {\n' + 
        'It has no effect!\n' + 
        'Foe GEODUDE uses ROCKTHROW!            // dup\n' + 
        'PIKACHU! That\'s enough! Come back!\n' + 
        'Go! IVYSAUR!\n' + 
        'Foe GEODUDE uses TACKLE!                // 2\n' + 
        'IVYSAUR! That\'s enough! Come back!\n' + 
        'Go! PIKACHU!\n' + 
        'Foe GARY calls back GEODUDE!\n' + 
        'Foe GARY sends out SLOWPOKE!\n' + 
        'Foe SLOWPOKE uses HEADBUTT!             // >\n' + 
        'PIKACHU uses THUNDERSHOCK!              // {\n' + 
        'It\'s super effective!\n' + 
        'PIKACHU! That\'s enough! Come back!\n' + 
        'Go! BULBASAUR! \n' + 
        'Foe GARY calls back SLOWPOKE!\n' + 
        'Foe GARY sends out GEODUDE!\n' + 
        'BULBASAUR! That\'s enough! Come back!\n' + 
        'Go! BULBASAUR! \n' + 
        'Foe GEODUDE uses ROCKTHROW!            // dup\n' + 
        'BULBASAUR! That\'s enough! Come back!\n' + 
        'Go! BULBASAUR! \n' + 
        'Foe GEODUDE uses TACKLE!                // 1\n' + 
        'BULBASAUR! That\'s enough! Come back!\n' + 
        'Go! BULBASAUR! \n' + 
        'Foe GARY calls back GEODUDE!\n' + 
        'Foe GARY sends out SQUIRTLE!\n' + 
        'Foe SQUIRTLE uses WATERGUN!            // -\n' + 
        'It\'s not very effective!          \n' + 
        'BULBASAUR uses VINEWHIP!               // swap\n' + 
        'It\'s super effective!\n' + 
        'BULBASAUR! That\'s enough! Come back!\n' + 
        'Go! IVYSAUR! \n' + 
        'Foe SQUIRTLE uses TACKLE!               // 2\n' + 
        'IVYSAUR! That\'s enough! Come back!\n' + 
        'Go! BULBASAUR! \n' + 
        'Foe SQUIRTLE uses WATERGUN!            // -\n' + 
        'It\'s not very effective!\n' + 
        'BULBASAUR! That\'s enough! Come back!\n' + 
        'Go! BULBASAUR! \n' + 
        'Foe SQUIRTLE uses TACKLE!               // 1\n' + 
        'Foe GARY calls back SQUIRTLE!\n' + 
        'Foe GARY sends out ALAKAZAM!\n' + 
        'BULBASAUR! That\'s enough! Come back!\n' + 
        'Go! PIKACHU! \n' + 
        'Foe ALAKAZAM uses PSYBEAM!              // load\n' + 
        'PIKACHU uses THUNDER!                   // exec\n' + 
        'PIKACHU! That\'s enough! Come back!\n' + 
        'Go! BULBASAUR! \n' + 
        'Foe GARY calls back ALAKAZAM!\n' + 
        'Foe GARY sends out SQUIRTLE!\n' + 
        'BULBASAUR uses VINEWHIP!               // swap\n' + 
        'It\'s super effective!\n' + 
        'Foe SQUIRTLE uses TACKLE!               // 1\n' + 
        'Foe GARY calls back SQUIRTLE!\n' + 
        'Foe GARY sends out ALAKAZAM!\n' + 
        'BULBASAUR! That\'s enough! Come back!\n' + 
        'Go! PIKACHU! \n' + 
        'Foe ALAKAZAM uses PSYBEAM!              // load\n' + 
        'PIKACHU uses THUNDER!                   // exec\n' + 
        'PIKACHU! That\'s enough! Come back!\n' + 
        'Go! PIKACHU! \n' + 
        'Foe GARY calls back ALAKAZAM!\n' + 
        'Foe GARY sends out CHARIZARD!\n' + 
        'Foe CHARIZARD uses EMBER!               // +\n' + 
        'PIKACHU uses THUNDERBOLT!               // }\n' + 
        'Foe GARY calls back CHARIZARD!\n' + 
        'Foe GARY sends out TENTACRUEL!\n' + 
        'PIKACHU uses THUNDERSHOCK!              // {\n' + 
        'It\'s super effective!\n' + 
        'PIKACHU! That\'s enough! Come back!\n' + 
        'Go! BULBASAUR!\n' + 
        'Foe TENTACRUEL uses POISONSTING!        // pop \n' + 
        'BULBASAUR! That\'s enough! Come back!\n' + 
        'Go! BULBASAUR! \n' + 
        'Foe GARY calls back TENTACRUEL!\n' + 
        'Foe GARY sends out SQUIRTLE!\n' + 
        'BULBASAUR! That\'s enough! Come back!\n' + 
        'Go! BULBASAUR! \n' + 
        'Foe SQUIRTLE uses TACKLE!               // 1 \n' + 
        'BULBASAUR! That\'s enough! Come back!\n' + 
        'Go! PIKACHU! \n' + 
        'Foe GARY calls back SQUIRTLE!\n' + 
        'Foe GARY sends out DUGTRIO!\n' + 
        'PIKACHU uses THUNDERBOLT!               // }\n' + 
        'It has no effect!\n' + 
        'Foe DUGTRIO uses EARTHQUAKE!            // ifelse\n' + 
        'It\'s super effective!\n' + 
        'Foe GARY calls back DUGTRIO!\n' + 
        'Foe GARY sends out ALAKAZAM!  \n' + 
        'PIKACHU uses THUNDERBOLT!               // }\n' + 
        'PIKACHU! That\'s enough! Come back!\n' + 
        'Go! BULBASAUR!\n' + 
        'Foe ALAKAZAM uses CONFUSION!               // store\n' + 
        'It\'s super effective!\n' + 
        'Foe GARY calls back ALAKAZAM!\n' + 
        'Foe GARY sends out BULBASAUR!\n' + 
        'BULBASAUR uses TACKLE!                  // 1\n' + 
        'Foe GARY calls back BULBASAUR!\n' + 
        'Foe GARY sends out ALAKAZAM!\n' + 
        'BULBASAUR! That\'s enough! Come back!\n' + 
        'Go! PIKACHU! \n' + 
        'Foe ALAKAZAM uses PSYBEAM!              // load\n' + 
        'PIKACHU uses THUNDER!                   // exec\n' + 
        'Foe GARY calls back ALAKAZAM!\n' +
        'Foe GARY sends out SANDSLASH!\n' +
        'PIKACHU! That\'s enough! Come back!\n' + 
        'Go! PIKACHU!\n' + 
        'Foe SANDSLASH uses SWIFT!\n'; 

      R.read(data);
      var result = R.battle;
      var expected = {
        selfPokemon: 'PIKACHU',
        enemyPokemon: 'SANDSLASH',
        enemyTrainer: 'GARY'
      }; 
      expect(result.selfPokemon).toEqual(expected.selfPokemon);
      expect(result.enemyPokemon).toEqual(expected.enemyPokemon);
      expect(result.enemyTrainer).toEqual(expected.enemyTrainer);

    });
});

describe('reader with interpreter', function() {

    it('should have the correct stack', function() {
      R.reset();
      var data = ['Go! PIKACHU!'
                 ,'Foe GARY sends out EEVEE!'
                 ,'Foe GARY calls back EEVEE!'
                 ,'Foe GARY sends out BULBASAUR!'
                 ,'PIKACHU! That\'s enough! Come back!'
                 ,'Go! EEVEE!'
                 ,'EEVEE uses TACKLE!'
                 ,'Foe BULBASAUR uses TACKLE!'
                 ].join('\n');
      R.read(data);
      var result = R.getStack();
      var expected = [I.num(1), I.num(133)];
      expect(result).toEqual(expected);
    });

    it('should read blocks correctly', function() {
      R.reset();
      var data = ['Go! PIKACHU!'
                 ,'Foe GARY sends out EEVEE!'
                 ,'PIKACHU uses THUNDERSHOCK!'
                 ,'Foe EEVEE uses TACKLE!'
                 ,'PIKACHU uses THUNDERBOLT!'
                 ].join('\n');
      R.read(data);
      var result = R.getStack();
      var expected = [I.block([I.num(25)])];
      expect(result).toEqual(expected);
    });

    it('should read nested blocks correctly', function() {
      R.reset();
      var data = ['Go! PIKACHU!'
                 ,'Foe GARY sends out EEVEE!'
                 ,'PIKACHU uses THUNDERSHOCK!'
                 ,'Foe EEVEE uses TACKLE!'
                 ,'PIKACHU uses THUNDERSHOCK!'
                 ,'Foe EEVEE uses TACKLE!'
                 ,'PIKACHU uses THUNDERBOLT!'
                 ,'Foe EEVEE uses TACKLE!'
                 ,'PIKACHU uses THUNDERBOLT!'
                 ].join('\n');
      R.read(data);
      var result = R.getStack();
      var expected = [I.block([I.num(25), I.block([I.num(25)]), I.num(25)])];
      expect(result).toEqual(expected);
    });

});
