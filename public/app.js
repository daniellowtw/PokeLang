var pokemon = ["MEW", "BULBASAUR", "IVYSAUR", "VENUSAUR", "CHARMANDER", "CHARMELEON", "CHARIZARD", "SQUIRTLE", "WARTORTLE", "BLASTOISE", "CATERPIE", "METAPOD", "BUTTERFREE", "WEEDLE", "KAKUNA", "BEEDRILL", "PIDGEY", "PIDGEOTTO", "PIDGEOT", "RATTATA", "RATICATE", "SPEAROW", "FEAROW", "EKANS", "ARBOK", "PIKACHU", "RAICHU", "SANDSHREW", "SANDSLASH", "NIDORANF", "NIDORINA", "NIDOQUEEN", "NIDORANM", "NIDORINO", "NIDOKING", "CLEFAIRY", "CLEFABLE", "VULPIX", "NINETALES", "JIGGLYPUFF", "WIGGLYTUFF", "ZUBAT", "GOLBAT", "ODDISH", "GLOOM", "VILEPLUME", "PARAS", "PARASECT", "VENONAT", "VENOMOTH", "DIGLETT", "DUGTRIO", "MEOWTH", "PERSIAN", "PSYDUCK", "GOLDUCK", "MANKEY", "PRIMEAPE", "GROWLITHE", "ARCANINE", "POLIWAG", "POLIWHIRL", "POLIWRATH", "ABRA", "KADABRA", "ALAKAZAM", "MACHOP", "MACHOKE", "MACHAMP", "BELLSPROUT", "WEEPINBELL", "VICTREEBEL", "TENTACOOL", "TENTACRUEL", "GEODUDE", "GRAVELER", "GOLEM", "PONYTA", "RAPIDASH", "SLOWPOKE", "SLOWBRO", "MAGNEMITE", "MAGNETON", "FARFETCHD", "DODUO", "DODRIO", "SEEL", "DEWGONG", "GRIMER", "MUK", "SHELLDER", "CLOYSTER", "GASTLY", "HAUNTER", "GENGAR", "ONIX", "DROWZEE", "HYPNO", "KRABBY", "KINGLER", "VOLTORB", "ELECTRODE", "EXEGGCUTE", "EXEGGUTOR", "CUBONE", "MAROWAK", "HITMONLEE", "HITMONCHAN", "LICKITUNG", "KOFFING", "WEEZING", "RHYHORN", "RHYDON", "CHANSEY", "TANGELA", "KANGASKHAN", "HORSEA", "SEADRA", "GOLDEEN", "SEAKING", "STARYU", "STARMIE", "MRMIME", "SCYTHER", "JYNX", "ELECTABUZZ", "MAGMAR", "PINSIR", "TAUROS", "MAGIKARP", "GYARADOS", "LAPRAS", "DITTO", "EEVEE", "VAPOREON", "JOLTEON", "FLAREON", "PORYGON", "OMANYTE", "OMASTAR", "KABUTO", "KABUTOPS", "AERODACTYL", "SNORLAX", "ARTICUNO", "ZAPDOS", "MOLTRES", "DRATINI", "DRAGONAIR", "DRAGONITE", "MEWTWO"];
var pokemon_list_by_id = $.map(pokemon, function(value, i) {
    return {
        'name': i.toString(),
        'content': value
    };
});
var pokemon_list_by_name = $.map(pokemon, function(value, i) {
    return {
        'content': i.toString(),
        'name': value
    };
});
var moves = ["POUND", "KARATECHOP*", "DOUBLESLAP", "COMETPUNCH", "MEGAPUNCH", "PAYDAY", "FIREPUNCH", "ICEPUNCH", "THUNDERPUNCH", "SCRATCH", "VICEGRIP", "GUILLOTINE", "RAZORWIND", "SWORDSDANCE", "CUT", "GUST*", "WINGATTACK", "WHIRLWIND", "FLY", "BIND", "SLAM", "VINEWHIP", "STOMP", "DOUBLEKICK", "MEGAKICK", "JUMPKICK", "ROLLINGKICK", "SANDATTACK*", "HEADBUTT", "HORNATTACK", "FURYATTACK", "HORNDRILL", "TACKLE", "BODYSLAM", "WRAP", "TAKEDOWN", "THRASH", "DOUBLE-EDGE", "TAILWHIP", "POISONSTING", "TWINEEDLE", "PINMISSILE", "LEER", "BITE*", "GROWL", "ROAR", "SING", "SUPERSONIC", "SONICBOOM", "DISABLE", "ACID", "EMBER", "FLAMETHROWER", "MIST", "WATERGUN", "HYDROPUMP", "SURF", "ICEBEAM", "BLIZZARD", "PSYBEAM", "BUBBLEBEAM", "AURORABEAM", "HYPERBEAM", "PECK", "DRILLPECK", "SUBMISSION", "LOWKICK", "COUNTER", "SEISMICTOSS", "STRENGTH", "ABSORB", "MEGADRAIN", "LEECHSEED", "GROWTH", "RAZORLEAF", "SOLARBEAM", "POISONPOWDER", "STUNSPORE", "SLEEPPOWDER", "PETALDANCE", "STRINGSHOT", "DRAGONRAGE", "FIRESPIN", "THUNDERSHOCK", "THUNDERBOLT", "THUNDERWAVE", "THUNDER", "ROCKTHROW", "EARTHQUAKE", "FISSURE", "DIG", "TOXIC", "CONFUSION", "PSYCHIC", "HYPNOSIS", "MEDITATE", "AGILITY", "QUICKATTACK", "RAGE", "TELEPORT", "NIGHTSHADE", "MIMIC", "SCREECH", "DOUBLETEAM", "RECOVER", "HARDEN", "MINIMIZE", "SMOKESCREEN", "CONFUSERAY", "WITHDRAW", "DEFENSECURL", "BARRIER", "LIGHTSCREEN", "HAZE", "REFLECT", "FOCUSENERGY", "BIDE", "METRONOME", "MIRRORMOVE", "SELF-DESTRUCT", "EGGBOMB", "LICK", "SMOG", "SLUDGE", "BONECLUB", "FIREBLAST", "WATERFALL", "CLAMP", "SWIFT", "SKULLBASH", "SPIKECANNON", "CONSTRICT", "AMNESIA", "KINESIS", "SOFT-BOILED", "HIGHJUMPKICK", "GLARE", "DREAMEATER", "POISONGAS", "BARRAGE", "LEECHLIFE", "LOVELYKISS", "SKYATTACK", "TRANSFORM", "BUBBLE", "DIZZYPUNCH", "SPORE", "FLASH", "PSYWAVE", "SPLASH", "ACIDARMOR", "CRABHAMMER", "EXPLOSION", "FURYSWIPES", "BONEMERANG", "REST", "ROCKSLIDE", "HYPERFANG", "SHARPEN", "CONVERSION", "TRIATTACK", "SUPERFANG", "SLASH", "SUBSTITUTE", "STRUGGLE"];
var moves_list = $.map(moves, function(value, i) {
    return {
        'name': i.toString(),
        'content': value
    };
});

$('#test').atwho({
    at: "#",
    tpl: '<li data-value="${content}">${name} <small>${content}</small></li>',
    data: pokemon_list_by_id
}).atwho({
    at: "@",
    tpl: '<li data-value="${name}">${name} <small>${content}</small></li>',
    data: pokemon_list_by_name
}).atwho({
    at: ".",
    tpl: '<li data-value="${name}">${name}</li>',
    data: moves
});

angular.module('PokeLang', ['ui.codemirror'])
    .controller('mainCtrl', function($scope) {
            $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        // readOnly: 'nocursor',
        mode: 'javascript',
    };
        $scope.text = "Compiling";
        $scope.text2 = "Done";
        $scope.result = "";
        poke.W.init();
        poke.I.init();
        poke.I.setOutputFunction(function(val) {
            // console.log(val);
            $scope.result += val;
        });
        $scope.stack = [];
        $scope.code = ["Go! SQUIRTLE!",
            "Foe GARY sends out JYNX!",
            "SQUIRTLE uses TACKLE!",
            "Foe GARY calls back JYNX!",
            "Foe GARY sends out JYNX!",
            "SQUIRTLE uses TACKLE!",
            "Foe GARY calls back JYNX!",
            "Foe GARY sends out SCYTHER!",
            "SQUIRTLE! That's enough! Come back!",
            "Go! SQUIRTLE!",
            "Foe SCYTHER uses SLASH!"
        ].join('\n');
        $scope.process = function() {
            // document.querySelector('#toast1').show();
            // console.log($scope.code);
            try {
                $scope.stack = poke.W.walk(poke.P.parse($scope.code), true).split(' ').reverse();
                var result = poke.I.run(poke.T.tokenise(poke.W.walk(poke.P.parse($scope.code), true)));
                // console.log(result);
                if (result[0])
                    $scope.result += result[0].toString();
                // document.querySelector('#toast2').show();
            } catch (err) {
                $scope.result = err.message.toString();
                for (var i = 0; i < poke.E.errorTypes.length; i++) {
                    if (err instanceof poke.E[poke.E.errorTypes[i] + 'Error']) {
                        $scope.result = (poke.E.errorTypes[i] + 'Error:', err.name, err.message ? '- ' + err.message : '');
                    }
                }
            }
            // $scope.compile = function(data){

            // }
            // console.log(poke.compile($scope.code));
        }
    });