var T = require('../lib/walker/translator.js');


describe('translator', function() {

  it('should import without error', function() {

  });

  it('should translate empty list', function() {

    var prog = [];
  

    expect(T.translateList(prog)).toEqual([]);
  
  });

  it('should translate correctly', function() {

    var prog = ['TACKLE', 'THUNDERSHOCK'];
  

    expect(T.translateList(prog)).toEqual(['push', '{']);
  
  });

});
