/* description: Copied from calculator. */

/* lexical grammar */
%lex
%%

\s+                   /* skip whitespace */
\,					/*skip comma to make it readable*/
(.*?)(\.) 			/*skip lines ending with a period*/
[0-9]+("."[0-9]+)?\b  return 'NUMBER'
(GO|TRAIN)	return 'VAR'
"SENT OUT" return 'OPPO_ARG'
"SWAP OUT" return 'ARG'
"LOST" return 'LOST'
"RECOVERED" return 'RECOVERED'
"HEALTH" return 'HEALTH'
"USED"		return 'USED'
"SPECIAL POWER" return 'IF'
"CHALLENGE TRAINER" return 'LET'
"LEARNED" return 'LEARNED'
"IT'S SUPER EFFECTIVE" return 'THEN'
"IT HAS NO EFFECT"		return 'ELSE'
"*"                   return '*'
"/"                   return '/'
"-"                   return '-'
"+"                   return '+'
"^"                   return '^'
"!"                   return '!'
"%"                   return '%'
"("                   return '('
")"                   return ')'
"PI"                  return 'PI'
"{"                  return '{'
"}"                  return '}'
"E"                   return 'E'
";" 				  return 'SEMICOLON'
<<EOF>>               return 'EOF'
(Bulbasaur|Ivysaur|Venusaur|Charmander|Charmeleon|Charizard|Squirtle|Wartortle|Blastoise|Caterpie|Metapod|Butterfree|Weedle|Kakuna|Beedrill|Pidgey|Pidgeotto|Pidgeot|Rattata|Raticate|Spearow|Fearow|Ekans|Arbok|Pikachu|Raichu|Sandshrew|Sandslash|Nidoran|Nidorina|Nidoqueen|Nidorino|Nidoking|Clefairy|Clefable|Vulpix|Ninetales|Jigglypuff|Wigglytuff|Zubat|Golbat|Oddish|Gloom|Vileplume|Paras|Parasect|Venonat|Venomoth|Diglett|Dugtrio|Meowth|Persian|Psyduck|Golduck|Mankey|Primeape|Growlithe|Arcanine|Poliwag|Poliwhirl|Poliwrath|Abra|Kadabra|Alakazam|Machop|Machoke|Machamp|Bellsprout|Weepinbell|Victreebel|Tentacool|Tentacruel|Geodude|Graveler|Golem|Ponyta|Rapidash|Slowpoke|Slowbro|Magnemite|Magneton|Farfetchd|Doduo|Dodrio|Seel|Dewgong|Grimer|Muk|Shellder|Cloyster|Gastly|Haunter|Gengar|Onix|Drowzee|Hypno|Krabby|Kingler|Voltorb|Electrode|Exeggcute|Exeggutor|Cubone|Marowak|Hitmonlee|Hitmonchan|Lickitung|Koffing|Weezing|Rhyhorn|Rhydon|Chansey|Tangela|Kangaskhan|Horsea|Seadra|Goldeen|Seaking|Staryu|Starmie|MrMime|Scyther|Jynx|Electabuzz|Magmar|Pinsir|Tauros|Magikarp|Gyarados|Lapras|Ditto|Eevee|Vaporeon|Jolteon|Flareon|Porygon|Omanyte|Omastar|Kabuto|Kabutops|Aerodactyl|Snorlax|Articuno|Zapdos|Moltres|Dratini|Dragonair|Dragonite|Mewtwo|Meowth) return 'POKEMON'
(tackled|TACKLED)			  return 'ADD'
(scratched|SCRATCHED)			  return 'ASSIGN'
(.*)?\!                     return 'MOVE'
. 						return 'INVALID'


/lex

/* operator associations and precedence */

%left '+' '-'
%left '*' '/'
%left '^'
%right '!'
%right '%'
%left UMINUS

%start expressions

%% /* language grammar */

expressions
    : statements EOF {return $1}
    ;

// buggy
statements
	: e ending 
		{ 
        	if ($2 == null) { 
        		console.log($1);
        		return $1;
        	}
        	else {
        		console.log(['CONCAT', $1, $2]);
        		return ['CONCAT', $1, $2];
        	}
		}
	;

ending
	: SEMICOLON e ending { 
		if ($3 == null) { 
			$$ = $2;
		} else {
			$$ = [$2, $3]; 
		}
	}
	| SEMICOLON { $$ = null}
	;

e
    : POKEMON 'ADD' POKEMON
    	{$$ = ['ADD', $1, $3];}
    | POKEMON 'ASSIGN' POKEMON
    	{$$ = ['ASSIGN', $1, $3];}
    | NUMBER
        {$$ = Number(yytext);}
    | E
        {$$ = Math.E;}
    | PI
        {$$ = Math.PI;}
    | VAR POKEMON NUMBER
    	{$$ = [$1, $2, $3]}
    | OPPO_ARG POKEMON
    	{$$ = ['OPPO_ARG', $2]}
    | ARG POKEMON
    	{$$ = ['ARG', $2]}
    | POKEMON LOST NUMBER HEALTH
    	{$$ = ['SUB', $1, $3]}
    | POKEMON RECOVERED NUMBER HEALTH 
    	{$$ = ['ADD', $1, $3]}
    | LET statements LEARNED MOVE
    	{$$ = ['LET', $2, $4]}
    | POKEMON USED MOVE
    	{$$ = ['USED', $1, $3]}
    | MOVE
    	{$$ = ['MOVE', $1]; console.log($1)}
    ;

