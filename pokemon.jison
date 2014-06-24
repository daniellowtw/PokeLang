/* description: Copied from calculator. */

/* lexical grammar */
%lex
%%

(\;|\n)					return 'NEWLINE'
\s+                   /* skip whitespace */
\\\\.*\n                   /* skip comments */
[0-9]+("."[0-9]+)?\b  return 'NUMBER'
"Go!"		return 'GO'
"uses"		return 'USES'
"START"		return 'START'
"IT'S SUPER EFFECTIVE" return 'EFFECTIVE'
"IT'S NOT EFFECTIVE" return 'NOT_EFFECTIVE'
"IT HAS NO EFFECT"		return 'NO_EFFECT'
(Foe)		return 'ENEMY'
"sends out"		return 'SENDS_OUT'
"That's enough!"		return 'ENOUGH'
"call back"		return 'CALL_BACK'
"Come back!"		return 'COME_BACK'
"*"                   return '*'
"/"                   return '/'
"-"                   return '-'
"+"                   return '+'
"^"                   return '^'
"%"                   return '%'
"("                   return '('
")"                   return ')'
"PI"                  return 'PI'
"E"                   return 'E'
";" 				  return 'SEMICOLON'
<<EOF>>               return 'EOF'
(BULBASAUR|IVYSAUR|VENUSAUR|CHARMANDER|CHARMELEON|CHARIZARD|SQUIRTLE|WARTORTLE|BLASTOISE|CATERPIE|METAPOD|BUTTERFREE|WEEDLE|KAKUNA|BEEDRILL|PIDGEY|PIDGEOTTO|PIDGEOT|RATTATA|RATICATE|SPEAROW|FEAROW|EKANS|ARBOK|PIKACHU|RAICHU|SANDSHREW|SANDSLASH|NIDORAN|NIDORINA|NIDOQUEEN|NIDORINO|NIDOKING|CLEFAIRY|CLEFABLE|VULPIX|NINETALES|JIGGLYPUFF|WIGGLYTUFF|ZUBAT|GOLBAT|ODDISH|GLOOM|VILEPLUME|PARAS|PARASECT|VENONAT|VENOMOTH|DIGLETT|DUGTRIO|MEOWTH|PERSIAN|PSYDUCK|GOLDUCK|MANKEY|PRIMEAPE|GROWLITHE|ARCANINE|POLIWAG|POLIWHIRL|POLIWRATH|ABRA|KADABRA|ALAKAZAM|MACHOP|MACHOKE|MACHAMP|BELLSPROUT|WEEPINBELL|VICTREEBEL|TENTACOOL|TENTACRUEL|GEODUDE|GRAVELER|GOLEM|PONYTA|RAPIDASH|SLOWPOKE|SLOWBRO|MAGNEMITE|MAGNETON|FARFETCHD|DODUO|DODRIO|SEEL|DEWGONG|GRIMER|MUK|SHELLDER|CLOYSTER|GASTLY|HAUNTER|GENGAR|ONIX|DROWZEE|HYPNO|KRABBY|KINGLER|VOLTORB|ELECTRODE|EXEGGCUTE|EXEGGUTOR|CUBONE|MAROWAK|HITMONLEE|HITMONCHAN|LICKITUNG|KOFFING|WEEZING|RHYHORN|RHYDON|CHANSEY|TANGELA|KANGASKHAN|HORSEA|SEADRA|GOLDEEN|SEAKING|STARYU|STARMIE|MRMIME|SCYTHER|JYNX|ELECTABUZZ|MAGMAR|PINSIR|TAUROS|MAGIKARP|GYARADOS|LAPRAS|DITTO|EEVEE|VAPOREON|JOLTEON|FLAREON|PORYGON|OMANYTE|OMASTAR|KABUTO|KABUTOPS|AERODACTYL|SNORLAX|ARTICUNO|ZAPDOS|MOLTRES|DRATINI|DRAGONAIR|DRAGONITE|MEWTWO|MEOWTH)(\!)? return 'POKEMON'
"!"                   return '!'
(.*)?\!                     return 'MOVE'
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
	: prog EOF 
		{ return $1;}
    ;

prog: start_battle ending
		{$$ = ['PROG', $1, $2]}
	;

start_battle: goPokemon NEWLINE foePokemon
		{console.log('starts'); $$ = ['START', $1, $3]}
	;

turns: turn ending
		{$$ = ['TURNS', $1, $2]}
	;

ending: NEWLINE turns 
		{ $$ = ['CONCAT', $2]}
	| NEWLINE { $$ = null}
	;

oldturn: selfTurn NEWLINE enemyTurn
		{$$ = ['SELFTURN_ENEMYTURN', $1, $2]}
	| enemyTurn NEWLINE selfTurn
		{$$ = ['ENEMYTURN_SELFTURN', $1, $2]}
	| selfSwitchPokemon NEWLINE enemyTurn
		{$$ = ['SELFSWITCHPOKEMON_ENEMYTURN', $1, $2]}
	| enemySwitchPokemon NEWLINE selfTurn
		{$$ = ['ENEMYSWITCHPOKEMON_SELFTURN', $1, $2]}
	| selfSwitchPokemon NEWLINE enemySwitchPokemon
		{$$ = ['SELFSWITCHPOKEMON_ENEMYSWITCHPOKEMON', $1, $2]}
	| enemySwitchPokemon NEWLINE selfSwitchPokemon
		{$$ = ['ENEMYSWITCHPOKEMON_SELFSWITCHPOKEMON', $1, $2]}
	;

turn: selfTurn 
		{$$ = ['SELFTURN', $1]}
	| enemyTurn
		{$$ = ['ENEMYTURN', $1]}
	| enemySwitchPokemon
		{$$ = ['ENEMYSWITCHPOKEMON', $1]}
	| selfSwitchPokemon 
		{$$ = ['SELFSWITCHPOKEMON', $1]}
	| effect1
	;

goPokemon: GO POKEMON
		{console.log('go'); $$ = ['GO', $2]}
	;

foePokemon: ENEMY SENDS_OUT POKEMON
		{console.log('sends out'); $$ = ['SENDS_OUT', $3]}
	;

selfTurn: POKEMON USES MOVE
		{$$ =['SELFTURN', $1, $3]}
	;
enemyTurn: ENEMY POKEMON USES MOVE
		{$$ =['ENEMYTURN', $2, $4]}
	;
selfSwitchPokemon: POKEMON ENOUGH COME_BACK NEWLINE goPokemon
		{console.log('selfswitch'); $$ =['SELFSWITCHPOKEMON', $1, $5]}
	;
enemySwitchPokemon: ENEMY CALL_BACK POKEMON NEWLINE foePokemon
		{$$ =['ENEMYSWITCHPOKEMON', $3, $5]}
	;

effect: NEWLINE effect1
| 
;
effect1: EFFECTIVE 
		{$$ =['ENEMYTURN']}
	| NOT_EFFECTIVE 
		{$$ =['ENEMYTURN']}
	| NO_EFFECT
		{$$ =['ENEMYTURN']}
	;