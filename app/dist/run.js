'use strict';

var babel = require('babel-core');
var jiffify = require('./jiffify');
var analysis = require('./analysis');

function parseCode(src) {
  var converted = babel.transform(src, {
    plugins: [jiffify] });

<<<<<<< HEAD
  if (converted.ast.program.error.length >= 1) {
    console.log("Discovered an error");
    return { code: {}, ast: converted.ast.program, costs: {} };
  }

  var analyzed = babel.transform(converted.code, { plugins: [analysis] });
  return { code: converted.code, ast: analyzed.ast.program, costs: analyzed.ast.program.costObject };
=======
    console.log(converted.code);

    if (converted.ast.program.error.length > 0) {
        converted.code = changeErrorCode(converted.code, converted.ast.program.error);
    }

    var analyzed = babel.transform(converted.code, { plugins: [analysis] });

    // return converted code;
    return { code: converted.code, costs: analyzed.ast.program.costObject };
>>>>>>> origin/ben
}

module.exports.parseCode = parseCode;