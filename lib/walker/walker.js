var Walker = {},
    variables = {},
    output;

Walker.walk = function(ast) {

  // do nothing if empty node
  if (!ast.length) {
    return '';
  }

  // Concat
  if (expect('CONCAT', ast[0])) {

    // walk the child nodes in order
    var first = this.walk(ast[1]);
    var second = this.walk(ast[2]);

    return first + second;

  }

  // Go
  if (expect('GO', ast[0])) {

    // assignment

    setVariable(ast[1]);
    
    return ast[1] + ' = ' + ast[2] + ';\n'; 

  }

  if (expect('ADD', ast[0])) {

    // add
    return ast[1] + ' += ' + ast[2] + ';\n';

  }

  if (expect('SUB', ast[0])) {

    // subtract
    return ast[1] + ' -= ' + ast[2] + ';\n';

  }

  if (expect('ASSIGN', ast[0])) {

    // assign
    return ast[1] + ' = ' + ast[2] + ';\n';

  }

  if (expect('OPPO_ARG', ast[0])) {

    // assign
    return ast[1] + ' NOT DONE ' + ';\n';

  }

  if (expect('ARG', ast[0])) {

    // assign
    return ast[1] + ' NOT DONE ' + ';\n';

  }
    // else
  return 'ERROR' + ast[0] + '\n';

}

Walker.printVariables = function() {

  var output = 'var ';
  var array = [];
  for (key in variables) {

    array.push(keys);

  }

 return output + array.join(',') + ';\n'

}

// returns true iff node === type
var expect = function(type, node) {

  return node === type;

}

// adds Pokemon into variables if not already added
var setVariable = function(pokemon) {

  variables[pokemon] = true;

}

module.exports = Walker;
