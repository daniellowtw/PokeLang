# PokeLang
An esoteric programming language where programs are represented as a Pokemon
battle.

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

## Structure

- The battle starts with yourself and the enemy trainer sending out a Pokemon. 
- Each trainer can use any number of Pokemon. 
- Each Pokemon have unlimited number of moves.  
- Pokemon can only use the moves they know. 
- Only moves with a corresponding instruction can be used. 
- The list of valid moves can be found in the Move List. 
- The battle is a series of turns.  
- Either trainer can go first, but __switching Pokemon takes priority over making a move__.

##PokeStack
- PokeStack is a stack-oriented language using postfix operators.
- The two key language constructs of PokeStack are objects and operators.
- The program is represented as a list of objects and operators.
- This is known as the Instruction List.
- This program is interpreted by traversing this list.
- Upon encountering an object, the object will be pushed on the stack.
- Upon encountering an operator, the arguments it takes will be popped from the stack. 
- The operator will perform its actions using the arguments and modify the stack. 
- An operator can only take arguments from the top of the stack.

### Notation

| Notation             | Definition                                          |
| ---                  | ---                                                 |
| `( )`                | the stack.                                          |
| `a`                  | any object.                                         |
| `#a`                 | a number.                                           |
| `[]a`                | an array.                                           |
| `{}a`                | a block.                                            |
| `(a b)`              | a and b on the stack, with b being on top.          |
| `( a )[1 : b, 2: c]` | a on the stack, with 1:b and 2:c in the dictionary. |
| ---                  | ---                                                 |
| `( a b ) + ( a+b )`  | an operation on the stack                           |
| `( a b )`            | the stack before the instruction.                   |
| `+`                  | the instruction.                                    |
| `( a+b )`            | the stack after the instruction is performed.       |

### Numbers
Numbers are objects. 
Numbers are represented by integers.

`() #a ( #a )`

### Operations
Operations take a number of arguments, pop them from the stack and perform
actions on them.

The full list of operations can be found by checking the Move List.

For example, the <+> operator

`( a b ) + ( a+b )`

If an operation has the wrong number of arguments (e.g. too few objects on the
stack) or the type of the arguments is wrong (e.g. Block vs Number), an error
will be thrown.

### Blocks
- Blocks are objects.
- A block is a structure used to store objects and operations. 
- Blocks can be nested as they are objects.
- Blocks are created at compile time.

`<{>` represents the start of the block.
`<}>` represents the end of the block.

Note that `<{>` and `<}>` are not operators or objects. 
The entire block is treated as a single object.

`() {}a ( {}a )`

The `<exec>` operator takes a block and after the current node of the Instruction
List, inserts the instructions of the block in order. 
If the argument of `<exec>` is not a block, an error is thrown.

`( 1 { 1 + } ) exec ( 2 )`

Breaking the above down into steps:

`( 1 { 1 + } ) exec ( 1 ) `

The next instruction is then 1 followed by +


`( 1 ) 1 ( 1 1 )`
`( 1 1 ) + ( 2 )`

### Arrays
- Arrays are objects. 
- An array is an indexed collection of objects. 
- Arrays are zero indexed.
- Arrays can be resized. 
- Arrays can be nested, as they are objects themselves.

The `<[>` object marks the start of an array on the stack.

`() [ ( [ )`

The `<]>` operator initialises the array. 
The top object on the stack is then pushed into the tail of the array, repeating
until the `<[>` object is reached.
If the `<[>` object is not reached before the bottom of the stack, an error is
thrown. 

`( [ a b c d e ) ] ( [a,b,c,d,e] ) `

Notice that <[> is an object, existing on the stack while <]> is an operator.

Arrays have the <map> and <fold> operations which take an array and a block.
These are analagous to the map and fold higher order functions in other
languages.
However, since operations are not first class objects, when we map an
operation on an array, we may perform the operation on more than one element
of the array.
The key difference between <map> and <fold> is that <map> maintains the array
while fold does not. 

For example,

`( [1,2] {1 +} ) map ( [2,3] ) `

while

`( [1,2] {1 +} ) fold ( 2 3 ) `
and

`( 0 [1,2] {+} ) fold ( 3 )`

while

`( 0 [1,2] {+} ) map ERR`

since the + operation on the zeroth element lacks a second argument.

Since we are able to store blocks in arrays, it is possible to dynamically
create a block via an array and folding with exec.

`( 5 [{ dup },{ + }] { exec } ) fold ( 10 )`

### Control Flow
The <ifelse> and <while> operations allow for control flow.

The boolean test used is true is >0 and false othewise.

<ifelse> takes 3 blocks, one to test, one for if true and the last for else.

`( 5 { > 4 } { 1 } { 0 } ) ifelse ( 1 )`

<while> takes 2 blocks, one to test and the other as the loop body.

`( 1 2 3 4 5 { dup 2 > } { pop } ) while ( 1 2 )`

Notice the <dup> in the test block. Since testing will pop the number, <dup>
is needed to maintain a copy. 

### Dictionary
- Objects can be stored in a global dictionary. 
- The dictionary stores key-value pairs. 
- A key can be any number, and the value any object.

The <store> takes a key and a object and puts it into the dictionary. 
If there already exists an entry for the key, it will be overwritten.

`( #a b ) store ()[#a: b]`

The <load> operator takes a key and pushes the value from the dictionary on the stack. 
If there does not exist a key-value pair, an error will be thrown.

`( #a )[#a: b] load ( b )[#a: b]`

Using a combination of <load>, <store> and <exec>, subroutines can be defined.

`4 { dup * } store 5 4 load exec 4 load exec `

The `{ dup * }` results in a squaring the top object of the stack.

Performing `{ dup * }` twice on 5 results in 625.

### Printing
The <out> operation takes a Number and prints out its corresponding ASCII
representation.

Strings can then be printed using an array and folding with <out>.

`( [72,101,108,108,111] { out } ) fold ()`

with "Hello" being printed.

### Result
When all instructions have finished, the stack is printed.