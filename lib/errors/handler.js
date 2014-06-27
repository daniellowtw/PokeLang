var errors = require('./errors.js');

var handler = {};

module.exports = handler;

handler.handle = function(err) {

  for (var i = 0; i < errors.errorTypes.length; i++) {

    if (err instanceof errors[errors.errorTypes[i] + 'Error']) {

      console.error(errors.errorTypes[i] + 'Error:', err.name, err.message ? '- ' + err.message : '');

      process.exit(1);

    }

  }

  throw (err);

}

