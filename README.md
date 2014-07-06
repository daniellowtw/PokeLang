# PokeLang
An esoteric programming language where programs are represented as a Pokemon
battle.

http://daniellowtw.github.io/pokelang for demo

## General Overview

- PokeLang consists of a series turns in a Pokemon battle.
- Moves correspond to an operation or object.
- The moves are then transcribed into a stack-oriented language called PokeStack.
- The PokeStack program is then run using a PokeStack interpreter.

### Example Translation

    Go! SQUIRTLE!
    Foe GARY sends out BULBASAUR!
    
    // Turn 1
    Foe GARY calls back BULBASAUR!
    Foe GARY sends out BULBASAUR!           // Pass turn with no action
    SQUIRTLE uses TACKLE!                   // 1
    
    // Turn 2
    Foe GARY calls back BULBASAUR!
    Foe GARY sends out BULBASAUR!           
    SQUIRTLE uses TACKLE!                   // 1
    
    // Turn 3
    SQUIRTLE! That's enough! Come back!
    Go! CHARMANDER!                         
    Foe GARY calls back BULBASAUR!
    Foe GARY sends out BULBASAUR!           
    
    // Turn 4
    CHARMANDER uses EMBER!                 // +
    IT's SUPER EFFECTIVE!
    
    // end

The above program is ( 1 1 + ), which simply adds 1 and 1, resulting in 2.



### Sample move list for arithmetic operations

| Instruction | Move         | Type | Pre             | Post      | Description      |
| ---         | ---          | ---  | ---             | ---       | ---              |
| +           | EMBER        | op   | ( #a #b )       | ( #a+#b ) | addition         |
| -           | WATERGUN     | op   | ( #a #b )       | ( #a-#b ) | subtraction      |
| *           | FLAMETHROWER | op   | ( num 1 num 2 ) | ( #a*#b ) | multiplication   |
| /           | HYDROPUMP    | op   | ( #a #b )       | ( #a/#b ) | integer division |

[View complete move list][1]

[View detailed documentation][2]


Usage
========
`npm install . -g`

`pokelang <file>`



Web Compiler 
========

`bower install` and start a webserver in the public folder.

Running tests
========

Create tests files in tests/test_files and run `npm tests`



[1]: docs/move_list.md
[2]: docs/documentation.md