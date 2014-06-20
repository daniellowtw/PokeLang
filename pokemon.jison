/* description: Copied from calculator. */

/* lexical grammar */
%lex
%%

\s+                   /* skip whitespace */
\,					/*skip comma to make it readable*/
[0-9]+("."[0-9]+)?\b  return 'NUMBER'
(GO|TRAIN)	return 'VAR'
"USED"		return 'USED'
"SPECIAL POWER" return 'IF'
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
"E"                   return 'E'
";" 				  return 'SEMICOLON'
<<EOF>>               return 'EOF'
(Bulbasaur|Ivysaur|Venusaur|Charmander|Charmeleon|Charizard|Squirtle|Wartortle|Blastoise|Caterpie|Metapod|Butterfree|Weedle|Kakuna|Beedrill|Pidgey|Pidgeotto|Pidgeot|Rattata|Raticate|Spearow|Fearow|Ekans|Arbok|Pikachu|Raichu|Sandshrew|Sandslash|Nidoran|Nidorina|Nidoqueen|Nidorino|Nidoking|Clefairy|Clefable|Vulpix|Ninetales|Jigglypuff|Wigglytuff|Zubat|Golbat|Oddish|Gloom|Vileplume|Paras|Parasect|Venonat|Venomoth|Diglett|Dugtrio|Meowth|Persian|Psyduck|Golduck|Mankey|Primeape|Growlithe|Arcanine|Poliwag|Poliwhirl|Poliwrath|Abra|Kadabra|Alakazam|Machop|Machoke|Machamp|Bellsprout|Weepinbell|Victreebel|Tentacool|Tentacruel|Geodude|Graveler|Golem|Ponyta|Rapidash|Slowpoke|Slowbro|Magnemite|Magneton|Farfetchd|Doduo|Dodrio|Seel|Dewgong|Grimer|Muk|Shellder|Cloyster|Gastly|Haunter|Gengar|Onix|Drowzee|Hypno|Krabby|Kingler|Voltorb|Electrode|Exeggcute|Exeggutor|Cubone|Marowak|Hitmonlee|Hitmonchan|Lickitung|Koffing|Weezing|Rhyhorn|Rhydon|Chansey|Tangela|Kangaskhan|Horsea|Seadra|Goldeen|Seaking|Staryu|Starmie|MrMime|Scyther|Jynx|Electabuzz|Magmar|Pinsir|Tauros|Magikarp|Gyarados|Lapras|Ditto|Eevee|Vaporeon|Jolteon|Flareon|Porygon|Omanyte|Omastar|Kabuto|Kabutops|Aerodactyl|Snorlax|Articuno|Zapdos|Moltres|Dratini|Dragonair|Dragonite|Mewtwo|Meowth) return 'POKEMON'
(tackle|TACKLE)			  return 'ADD'
.                     return 'INVALID'


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
    : e ending EOF
        { 
        	if ($2 == null) { 
        		console.log($1);
        		return $1;
        	}
        	else {
        		console.log(['concat', $1, $2]);
        		return ['concat', $1, $2];
        	}
		}
    ;

ending
	: SEMICOLON e ending { 
		if ($3 == null) { 
			$$ = $2;
		} else {
			$$ = ['concat', $2, $3]; 
		}
	}
	| SEMICOLON { $$ = null}
	;

e
    : POKEMON 'ADD' POKEMON
    	{
    		$$ = ['add', $1, $3];
    	}
    | e '!'
        {{
          $$ = (function fact (n) { return n==0 ? 1 : fact(n-1) * n })($1);
        }}
    | e '%'
        {$$ = $1/100;}
    | '-' e %prec UMINUS
        {$$ = -$2;}
    | '(' e ')'
        {$$ = $2;}
    | NUMBER
        {$$ = Number(yytext);}
    | VAR POKEMON NUMBER
    	{console.log($2 + " is now " +$3); $$ = [$1, $2, $3]}
    ;

