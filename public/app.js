var pokemon=["MEWTWO","BULBASAUR","IVYSAUR","VENUSAUR","CHARMANDER","CHARMELEON","CHARIZARD","SQUIRTLE","WARTORTLE","BLASTOISE","CATERPIE","METAPOD","BUTTERFREE","WEEDLE","KAKUNA","BEEDRILL","PIDGEY","PIDGEOTTO","PIDGEOT","RATTATA","RATICATE","SPEAROW","FEAROW","EKANS","ARBOK","PIKACHU","RAICHU","SANDSHREW","SANDSLASH","NIDORAN","NIDORINA","NIDOQUEEN","NIDORINO","NIDOKING","CLEFAIRY","CLEFABLE","VULPIX","NINETALES","JIGGLYPUFF","WIGGLYTUFF","ZUBAT","GOLBAT","ODDISH","GLOOM","VILEPLUME","PARAS","PARASECT","VENONAT","VENOMOTH","DIGLETT","DUGTRIO","MEOWTH","PERSIAN","PSYDUCK","GOLDUCK","MANKEY","PRIMEAPE","GROWLITHE","ARCANINE","POLIWAG","POLIWHIRL","POLIWRATH","ABRA","KADABRA","ALAKAZAM","MACHOP","MACHOKE","MACHAMP","BELLSPROUT","WEEPINBELL","VICTREEBEL","TENTACOOL","TENTACRUEL","GEODUDE","GRAVELER","GOLEM","PONYTA","RAPIDASH","SLOWPOKE","SLOWBRO","MAGNEMITE","MAGNETON","FARFETCHD","DODUO","DODRIO","SEEL","DEWGONG","GRIMER","MUK","SHELLDER","CLOYSTER","GASTLY","HAUNTER","GENGAR","ONIX","DROWZEE","HYPNO","KRABBY","KINGLER","VOLTORB","ELECTRODE","EXEGGCUTE","EXEGGUTOR","CUBONE","MAROWAK","HITMONLEE","HITMONCHAN","LICKITUNG","KOFFING","WEEZING","RHYHORN","RHYDON","CHANSEY","TANGELA","KANGASKHAN","HORSEA","SEADRA","GOLDEEN","SEAKING","STARYU","STARMIE","MRMIME","SCYTHER","JYNX","ELECTABUZZ","MAGMAR","PINSIR","TAUROS","MAGIKARP","GYARADOS","LAPRAS","DITTO","EEVEE","VAPOREON","JOLTEON","FLAREON","PORYGON","OMANYTE","OMASTAR","KABUTO","KABUTOPS","AERODACTYL","SNORLAX","ARTICUNO","ZAPDOS","MOLTRES","DRATINI","DRAGONAIR","DRAGONITE","MEOWTH"];
var pokemon_list_by_id = $.map(pokemon, function(value, i) {
  return {'name':i.toString(), 'content':value};
});
var pokemon_list_by_name = $.map(pokemon, function(value, i) {
  return {'content':i.toString(), 'name':value};
});
var moves =["Pound","KarateChop*","DoubleSlap","CometPunch","MegaPunch","PayDay","FirePunch","IcePunch","ThunderPunch","Scratch","ViceGrip","Guillotine","RazorWind","SwordsDance","Cut","Gust*","WingAttack","Whirlwind","Fly","Bind","Slam","VineWhip","Stomp","DoubleKick","MegaKick","JumpKick","RollingKick","SandAttack*","Headbutt","HornAttack","FuryAttack","HornDrill","Tackle","BodySlam","Wrap","TakeDown","Thrash","Double-Edge","TailWhip","PoisonSting","Twineedle","PinMissile","Leer","Bite*","Growl","Roar","Sing","Supersonic","SonicBoom","Disable","Acid","Ember","Flamethrower","Mist","WaterGun","HydroPump","Surf","IceBeam","Blizzard","Psybeam","BubbleBeam","AuroraBeam","HyperBeam","Peck","DrillPeck","Submission","LowKick","Counter","SeismicToss","Strength","Absorb","MegaDrain","LeechSeed","Growth","RazorLeaf","SolarBeam","PoisonPowder","StunSpore","SleepPowder","PetalDance","StringShot","DragonRage","FireSpin","ThunderShock","Thunderbolt","ThunderWave","Thunder","RockThrow","Earthquake","Fissure","Dig","Toxic","Confusion","Psychic","Hypnosis","Meditate","Agility","QuickAttack","Rage","Teleport","NightShade","Mimic","Screech","DoubleTeam","Recover","Harden","Minimize","Smokescreen","ConfuseRay","Withdraw","DefenseCurl","Barrier","LightScreen","Haze","Reflect","FocusEnergy","Bide","Metronome","MirrorMove","Self-Destruct","EggBomb","Lick","Smog","Sludge","BoneClub","FireBlast","Waterfall","Clamp","Swift","SkullBash","SpikeCannon","Constrict","Amnesia","Kinesis","Soft-Boiled","HighJumpKick","Glare","DreamEater","PoisonGas","Barrage","LeechLife","LovelyKiss","SkyAttack","Transform","Bubble","DizzyPunch","Spore","Flash","Psywave","Splash","AcidArmor","Crabhammer","Explosion","FurySwipes","Bonemerang","Rest","RockSlide","HyperFang","Sharpen","Conversion","TriAttack","SuperFang","Slash","Substitute","Struggle"];
var moves_list = $.map(moves, function(value, i) {
  return {'name':i.toString(), 'content':value};
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
})

angular.module('PokeLang', [])
    .controller('mainCtrl', function($scope) {
        $scope.text = "Compiling";
        $scope.text2 = "Done";
        $scope.result = "";
            poke.W.init();
            poke.I.init();
        $scope.process = function() {
            document.querySelector('#toast1').show();
            // console.log($scope.code);
            try {
                var result = poke.I.run(poke.T.tokenise(poke.W.walk(poke.P.parse($scope.code), true)));
            } catch (err) {
                $scope.result = err.message.toString();

            }
            // $scope.compile = function(data){
            $scope.result = result[0].toString();
            document.querySelector('#toast2').show();

            // }
            // console.log(poke.compile($scope.code));
        }
    });