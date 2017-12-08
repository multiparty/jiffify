const babel = require('babel-core');
const jiffify = require('./jiffify');
const analysis = require('./analysis');

function parseCode(src) {
  var converted = babel.transform(src, { 
    plugins: [jiffify] }
  );

  if (converted.ast.program.error.length >= 1) {
    console.log("Discovered an error");
    return {code: {}, ast: converted.ast.program, costs: {}};  
  } 
  
  var analyzed = babel.transform(
    converted.code, { plugins: [analysis] }
  );
  return {code: converted.code, ast: analyzed.ast.program, costs: analyzed.ast.program.costObject};      
}

module.exports.parseCode = parseCode;
