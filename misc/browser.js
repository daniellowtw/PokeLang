var P = require('./../lib/parser/pokelang.js'),
    W = require('./../lib/walker/walker.js'),
    T = require('./../lib/interpreter/tokeniser.js'),
    I = require('./../lib/interpreter/interpreter.js'),
    E = require('./../lib/errors/errors.js'),
    H = require('./../lib/errors/handler.js');

module.exports.testdata = ["Go! SQUIRTLE!","Foe GARY sends out PIDGEOT!","Foe GARY calls back PIDGEOT!","Foe GARY sends out PIDGEOT!","SQUIRTLE uses TACKLE!"].join('\n');
module.exports.P = P;
module.exports.W = W;
module.exports.T = T;
module.exports.I = I;
module.exports.E = E;
module.exports.H = H;
module.exports.compile = function(data){
	I.run(T.tokenise(W.walk(P.parse(data), true)));
}