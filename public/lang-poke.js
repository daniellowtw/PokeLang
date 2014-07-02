// Copyright (C) 2008 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.



/**
 * @fileoverview
 * Registers a language handler for Common Lisp and related languages.
 *
 *
 * To use, include prettify.js and this file in your HTML page.
 * Then put your code in an HTML tag like
 *      <pre class="prettyprint lang-lisp">(my lisp code)</pre>
 * The lang-cl class identifies the language as common lisp.
 * This file supports the following language extensions:
 *     lang-cl - Common Lisp
 *     lang-el - Emacs Lisp
 *     lang-lisp - Lisp
 *     lang-scm - Scheme
 *     lang-lsp - FAT 8.3 filename version of lang-lisp.
 *
 *
 * I used http://www.devincook.com/goldparser/doc/meta-language/grammar-LISP.htm
 * as the basis, but added line comments that start with ; and changed the atom
 * production to disallow unquoted semicolons.
 *
 * "Name"    = 'LISP'
 * "Author"  = 'John McCarthy'
 * "Version" = 'Minimal'
 * "About"   = 'LISP is an abstract language that organizes ALL'
 *           | 'data around "lists".'
 *
 * "Start Symbol" = [s-Expression]
 *
 * {Atom Char}   = {Printable} - {Whitespace} - [()"\'']
 *
 * Atom = ( {Atom Char} | '\'{Printable} )+
 *
 * [s-Expression] ::= [Quote] Atom
 *                  | [Quote] '(' [Series] ')'
 *                  | [Quote] '(' [s-Expression] '.' [s-Expression] ')'
 *
 * [Series] ::= [s-Expression] [Series]
 *            |
 *
 * [Quote]  ::= ''      !Quote = do not evaluate
 *            |
 *
 *
 * I used <a href="http://gigamonkeys.com/book/">Practical Common Lisp</a> as
 * the basis for the reserved word list.
 *
 *
 * @author mikesamuel@gmail.com
 */

PR['registerLangHandler'](
    PR['createSimpleLexer'](
        [
         // A line comment that starts with ;
         [PR['PR_COMMENT'],     /\/\/([^(\n\r|\n)])*/, null, '/'],
         // Whitespace
         [PR['PR_PLAIN'],       /^[\t\n\r \xA0]+/, null, '\t\n\r \xA0']
         // A double quoted, possibly multi-line, string.
        ],
        [
         [PR['PR_ATTRIB_NAME'],      /(It\'s\ssuper\seffective\!|It\'s\snot\svery\seffective\!|It\shas\sno\seffect\!)/],
         [PR['PR_LITERAL'],     /(BULBASAUR|IVYSAUR|VENUSAUR|CHARMANDER|CHARMELEON|CHARIZARD|SQUIRTLE|WARTORTLE|BLASTOISE|CATERPIE|METAPOD|BUTTERFREE|WEEDLE|KAKUNA|BEEDRILL|PIDGEY|PIDGEOTTO|PIDGEOT|RATTATA|RATICATE|SPEAROW|FEAROW|EKANS|ARBOK|PIKACHU|RAICHU|SANDSHREW|SANDSLASH|NIDORAN|NIDORINA|NIDOQUEEN|NIDORINO|NIDOKING|CLEFAIRY|CLEFABLE|VULPIX|NINETALES|JIGGLYPUFF|WIGGLYTUFF|ZUBAT|GOLBAT|ODDISH|GLOOM|VILEPLUME|PARAS|PARASECT|VENONAT|VENOMOTH|DIGLETT|DUGTRIO|MEOWTH|PERSIAN|PSYDUCK|GOLDUCK|MANKEY|PRIMEAPE|GROWLITHE|ARCANINE|POLIWAG|POLIWHIRL|POLIWRATH|ABRA|KADABRA|ALAKAZAM|MACHOP|MACHOKE|MACHAMP|BELLSPROUT|WEEPINBELL|VICTREEBEL|TENTACOOL|TENTACRUEL|GEODUDE|GRAVELER|GOLEM|PONYTA|RAPIDASH|SLOWPOKE|SLOWBRO|MAGNEMITE|MAGNETON|FARFETCHD|DODUO|DODRIO|SEEL|DEWGONG|GRIMER|MUK|SHELLDER|CLOYSTER|GASTLY|HAUNTER|GENGAR|ONIX|DROWZEE|HYPNO|KRABBY|KINGLER|VOLTORB|ELECTRODE|EXEGGCUTE|EXEGGUTOR|CUBONE|MAROWAK|HITMONLEE|HITMONCHAN|LICKITUNG|KOFFING|WEEZING|RHYHORN|RHYDON|CHANSEY|TANGELA|KANGASKHAN|HORSEA|SEADRA|GOLDEEN|SEAKING|STARYU|STARMIE|MRMIME|SCYTHER|JYNX|ELECTABUZZ|MAGMAR|PINSIR|TAUROS|MAGIKARP|GYARADOS|LAPRAS|DITTO|EEVEE|VAPOREON|JOLTEON|FLAREON|PORYGON|OMANYTE|OMASTAR|KABUTO|KABUTOPS|AERODACTYL|SNORLAX|ARTICUNO|ZAPDOS|MOLTRES|DRATINI|DRAGONAIR|DRAGONITE|MEWTWO|MEOWTH)/],
         // A single quote possibly followed by a word that optionally ends with
         // = ! or ?.
         [PR['PR_STRING'],     /(POUND|KARATECHOP|DOUBLESLAP|COMETPUNCH|MEGAPUNCH|PAYDAY|FIREPUNCH|ICEPUNCH|THUNDERPUNCH|SCRATCH|VICEGRIP|GUILLOTINE|RAZORWIND|SWORDSDANCE|CUT|GUST|WINGATTACK|WHIRLWIND|FLY|BIND|SLAM|VINEWHIP|STOMP|DOUBLEKICK|MEGAKICK|JUMPKICK|ROLLINGKICK|SANDATTACK|HEADBUTT|HORNATTACK|FURYATTACK|HORNDRILL|TACKLE|BODYSLAM|WRAP|TAKEDOWN|THRASH|DOUBLE-EDGE|TAILWHIP|POISONSTING|TWINEEDLE|PINMISSILE|LEER|BITE|GROWL|ROAR|SING|SUPERSONIC|SONICBOOM|DISABLE|ACID|EMBER|FLAMETHROWER|MIST|WATERGUN|HYDROPUMP|SURF|ICEBEAM|BLIZZARD|PSYBEAM|BUBBLEBEAM|AURORABEAM|HYPERBEAM|PECK|DRILLPECK|SUBMISSION|LOWKICK|COUNTER|SEISMICTOSS|STRENGTH|ABSORB|MEGADRAIN|LEECHSEED|GROWTH|RAZORLEAF|SOLARBEAM|POISONPOWDER|STUNSPORE|SLEEPPOWDER|PETALDANCE|STRINGSHOT|DRAGONRAGE|FIRESPIN|THUNDERSHOCK|THUNDERBOLT|THUNDERWAVE|THUNDER|ROCKTHROW|EARTHQUAKE|FISSURE|DIG|TOXIC|CONFUSION|PSYCHIC|HYPNOSIS|MEDITATE|AGILITY|QUICKATTACK|RAGE|TELEPORT|NIGHTSHADE|MIMIC|SCREECH|DOUBLETEAM|RECOVER|HARDEN|MINIMIZE|SMOKESCREEN|CONFUSERAY|WITHDRAW|DEFENSECURL|BARRIER|LIGHTSCREEN|HAZE|REFLECT|FOCUSENERGY|BIDE|METRONOME|MIRRORMOVE|SELFDESTRUCT|EGGBOMB|LICK|SMOG|SLUDGE|BONECLUB|FIREBLAST|WATERFALL|CLAMP|SWIFT|SKULLBASH|SPIKECANNON|CONSTRICT|AMNESIA|KINESIS|SOFT-BOILED|HIGHJUMPKICK|GLARE|DREAMEATER|POISONGAS|BARRAGE|LEECHLIFE|LOVELYKISS|SKYATTACK|TRANSFORM|BUBBLE|DIZZYPUNCH|SPORE|FLASH|PSYWAVE|SPLASH|ACIDARMOR|CRABHAMMER|EXPLOSION|FURYSWIPES|BONEMERANG|REST|ROCKSLIDE|HYPERFANG|SHARPEN|CONVERSION|TRIATTACK|SUPERFANG|SLASH|SUBSTITUTE|STRUGGLE)/],
         // A word that optionally ends with = ! or ?.
         [PR['PR_KEYWORD'],     /[A-Z]+\s/, null],

         [PR['PR_PLAIN'],       /^-*(?:[a-z_]|\\[\x21-\x7e])(?:[\w-]*|\\[\x21-\x7e])[=!?]?/i],
         // A printable non-space non-special character

         // [PR['PR_PUNCTUATION'], /^[^\w\t\n\r \xA0()\"\\\';]+/]
        ]),
    ['poke']);
