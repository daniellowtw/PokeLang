var W = require('../lib/walker/walker.js');

W.init();

describe('walker', function() {

  it('should import without error', function() {

  });

  it('should walk an empty ast', function() {

    expect(W.walk([])).toEqual([]);
  });

});

