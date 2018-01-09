const babel = require('babel-core');
const jiffify = require('./jiffify');
const carousels = require('carousels');
const costDefinition = require('./costDefinition');

function parseCode(src) {
  var converted = babel.transform(src, {
      plugins: [jiffify]
    }
  );

  if (converted.ast.program.error.length >= 1) {
    return {code: {}, ast: converted.ast.program, costs: {}};
  }
  var costs = carousels(converted.code, costDefinition);
  var errors = converted.ast.program.error;
  return {code: converted.code, costs: costs, errors: errors};

}
module.exports.parseCode = parseCode;
