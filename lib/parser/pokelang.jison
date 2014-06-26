/* lexical grammar */
%lex
%%
[^\S\n]                 /* skip whitespace */
((\n|\r\n)*)<<EOF>>               return 'EOF'
(\n|\r\n)+  return 'NEWLINE'
\s+                   /* skip whitespace */
\/\/([^(\n\r|\n)])*  return 'COMMENT'
[0-9]+("."[0-9]+)?\b  return 'NUMBER'
"Go!"		return 'GO'
"uses"		return 'USES'
"START"		return 'START'
"IT'S SUPER EFFECTIVE!" return 'EFFECTIVE'
"IT'S NOT VERY EFFECTIVE!" return 'NOT_EFFECTIVE'
"IT HAS NO EFFECT!"		return 'NO_EFFECT'
(Foe)		return 'ENEMY'
"sends out"		return 'SENDS_OUT'
"That's enough!"		return 'ENOUGH'
"calls back"		return 'CALL_BACK'
"Come back!"		return 'COME_BACK'
";" 				  return 'SEMICOLON'
"!" 				  return '!'
(BULBASAUR|IVYSAUR|VENUSAUR|CHARMANDER|CHARMELEON|CHARIZARD|SQUIRTLE|WARTORTLE|BLASTOISE|CATERPIE|METAPOD|BUTTERFREE|WEEDLE|KAKUNA|BEEDRILL|PIDGEY|PIDGEOTTO|PIDGEOT|RATTATA|RATICATE|SPEAROW|FEAROW|EKANS|ARBOK|PIKACHU|RAICHU|SANDSHREW|SANDSLASH|NIDORAN|NIDORINA|NIDOQUEEN|NIDORINO|NIDOKING|CLEFAIRY|CLEFABLE|VULPIX|NINETALES|JIGGLYPUFF|WIGGLYTUFF|ZUBAT|GOLBAT|ODDISH|GLOOM|VILEPLUME|PARAS|PARASECT|VENONAT|VENOMOTH|DIGLETT|DUGTRIO|MEOWTH|PERSIAN|PSYDUCK|GOLDUCK|MANKEY|PRIMEAPE|GROWLITHE|ARCANINE|POLIWAG|POLIWHIRL|POLIWRATH|ABRA|KADABRA|ALAKAZAM|MACHOP|MACHOKE|MACHAMP|BELLSPROUT|WEEPINBELL|VICTREEBEL|TENTACOOL|TENTACRUEL|GEODUDE|GRAVELER|GOLEM|PONYTA|RAPIDASH|SLOWPOKE|SLOWBRO|MAGNEMITE|MAGNETON|FARFETCHD|DODUO|DODRIO|SEEL|DEWGONG|GRIMER|MUK|SHELLDER|CLOYSTER|GASTLY|HAUNTER|GENGAR|ONIX|DROWZEE|HYPNO|KRABBY|KINGLER|VOLTORB|ELECTRODE|EXEGGCUTE|EXEGGUTOR|CUBONE|MAROWAK|HITMONLEE|HITMONCHAN|LICKITUNG|KOFFING|WEEZING|RHYHORN|RHYDON|CHANSEY|TANGELA|KANGASKHAN|HORSEA|SEADRA|GOLDEEN|SEAKING|STARYU|STARMIE|MRMIME|SCYTHER|JYNX|ELECTABUZZ|MAGMAR|PINSIR|TAUROS|MAGIKARP|GYARADOS|LAPRAS|DITTO|EEVEE|VAPOREON|JOLTEON|FLAREON|PORYGON|OMANYTE|OMASTAR|KABUTO|KABUTOPS|AERODACTYL|SNORLAX|ARTICUNO|ZAPDOS|MOLTRES|DRATINI|DRAGONAIR|DRAGONITE|MEWTWO|MEOWTH) return 'POKEMON'
(POUND|KARATECHOP|DOUBLESLAP|COMETPUNCH|MEGAPUNCH|PAYDAY|FIREPUNCH|ICEPUNCH|THUNDERPUNCH|SCRATCH|VICEGRIP|GUILLOTINE|RAZORWIND|SWORDSDANCE|CUT|GUST|WINGATTACK|WHIRLWIND|FLY|BIND|SLAM|VINEWHIP|STOMP|DOUBLEKICK|MEGAKICK|JUMPKICK|ROLLINGKICK|SANDATTACK|HEADBUTT|HORNATTACK|FURYATTACK|HORNDRILL|TACKLE|BODYSLAM|WRAP|TAKEDOWN|THRASH|DOUBLE-EDGE|TAILWHIP|POISONSTING|TWINEEDLE|PINMISSILE|LEER|BITE|GROWL|ROAR|SING|SUPERSONIC|SONICBOOM|DISABLE|ACID|EMBER|FLAMETHROWER|MIST|WATERGUN|HYDROPUMP|SURF|ICEBEAM|BLIZZARD|PSYBEAM|BUBBLEBEAM|AURORABEAM|HYPERBEAM|PECK|DRILLPECK|SUBMISSION|LOWKICK|COUNTER|SEISMICTOSS|STRENGTH|ABSORB|MEGADRAIN|LEECHSEED|GROWTH|RAZORLEAF|SOLARBEAM|POISONPOWDER|STUNSPORE|SLEEPPOWDER|PETALDANCE|STRINGSHOT|DRAGONRAGE|FIRESPIN|THUNDERSHOCK|THUNDERBOLT|THUNDERWAVE|THUNDER|ROCKTHROW|EARTHQUAKE|FISSURE|DIG|TOXIC|CONFUSION|PSYCHIC|HYPNOSIS|MEDITATE|AGILITY|QUICKATTACK|RAGE|TELEPORT|NIGHTSHADE|MIMIC|SCREECH|DOUBLETEAM|RECOVER|HARDEN|MINIMIZE|SMOKESCREEN|CONFUSERAY|WITHDRAW|DEFENSECURL|BARRIER|LIGHTSCREEN|HAZE|REFLECT|FOCUSENERGY|BIDE|METRONOME|MIRRORMOVE|SELFDESTRUCT|EGGBOMB|LICK|SMOG|SLUDGE|BONECLUB|FIREBLAST|WATERFALL|CLAMP|SWIFT|SKULLBASH|SPIKECANNON|CONSTRICT|AMNESIA|KINESIS|SOFT-BOILED|HIGHJUMPKICK|GLARE|DREAMEATER|POISONGAS|BARRAGE|LEECHLIFE|LOVELYKISS|SKYATTACK|TRANSFORM|BUBBLE|DIZZYPUNCH|SPORE|FLASH|PSYWAVE|SPLASH|ACIDARMOR|CRABHAMMER|EXPLOSION|FURYSWIPES|BONEMERANG|REST|ROCKSLIDE|HYPERFANG|SHARPEN|CONVERSION|TRIATTACK|SUPERFANG|SLASH|SUBSTITUTE|STRUGGLE)                     return 'MOVE'
([A-Z]+) 				return 'OPPONENT'
.                     	return 'INVALID'


/lex
/* operator associations and precedence */
%start expressions
%% /* language grammar */

expressions	: prog 
		{return $1;}
    ;

prog: start_battle ending
		{$$ = ['PROG', $1, $2]; console.log($$)}
	;

start_battle: goPokemon NEWLINE foePokemon
		{$$ = ['START', $1, $3]}
	| goPokemon COMMENT NEWLINE foePokemon
		{$$ = ['START', $1, $4]}
	;

turns: turn ending
		{
			if($1) {$$ = ['CONCAT', $1, $2]}
			else {$$ = $2}
		}
	;

ending: NEWLINE turns 
		{ $$ = $2}
	| NEWLINE { $$ = null}
	| EOF { $$ = null}
	| COMMENT ending {$$ = $2}
	;

turn: selfTurn 
		{$$ = $1}
	| enemyTurn
		{$$ = $1}
	| enemySwitchPokemon
		{$$ = $1}
	| selfSwitchPokemon 
		{$$ = $1}
	| effect1
		{$$ = $1}
	| COMMENT {$$ = null}
	;

goPokemon: GO POKEMON '!'
		{$$ = ['GO', $2]}
	;

foePokemon: ENEMY OPPONENT SENDS_OUT POKEMON '!'
		{$$ = ['SENDS_OUT', $2, $4]}
	;

selfTurn: POKEMON USES MOVE '!'
		{$$ =['SELFTURN', $1, $3]}
	;
enemyTurn: ENEMY POKEMON USES MOVE '!'
		{$$ =['ENEMYTURN', $2, $4]}
	;
selfSwitchPokemon: POKEMON '!' ENOUGH COME_BACK NEWLINE goPokemon
		{$$ =['SELFSWITCHPOKEMON', $1, $6[1]]}
	;
enemySwitchPokemon: ENEMY OPPONENT CALL_BACK POKEMON '!' NEWLINE foePokemon 
		{$$ =['ENEMYSWITCHPOKEMON', $2, $4, $7[2]]}
	;

effect1: EFFECTIVE 
		{$$ =['EFFECTIVE']}
	| NOT_EFFECTIVE 
		{$$ =['NOT_EFFECTIVE']}
	| NO_EFFECT
		{$$ =['NO_EFFECT']}
	;