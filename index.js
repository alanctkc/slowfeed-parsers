'use strict';

var fs = require('fs');

var PARSERS_DIR = __dirname + '/parsers';

var getPath = file => {
  // Get the whole path to the parser directory
  return `${PARSERS_DIR}/${file}`;
};

var parsers = new Map();
fs.readdirSync(PARSERS_DIR)
  .filter(file => {
    // Read only directories
    var stats = fs.statSync(getPath(file));
    return stats && stats.isDirectory();
  })
  .map(file => {
    // Load the parser module into the parsers map
    parsers.set(file, require(getPath(file) + '/parser'));
  });

module.exports = parsers;
