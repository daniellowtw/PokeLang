var R = require('../lib/repl/reader.js'),
    E = require('../lib/errors/errors.js');

R.init();

describe('reader', function() {

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

    it('should throw an error on missing tokens', function() {
      R.reset();
      var data = 'Go!\n';
      expect(function() {
        R.read(data);
      }).toThrow(E.missingTokens('$POKEMON!'));
    });

    it('should throw an error on trailing tokens', function() {
      R.reset();
      var data = 'Go! PIKACHU! asdf\n';
      expect(function() {
        R.read(data);
      }).toThrow(E.trailingTokens('asdf'));
    });

});
