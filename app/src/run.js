var babel = require('babel-core');
var codegen = require('./codegen');

function parseCode(src) {
    var out = babel.transform(src, {
        plugins: [codegen]
        }
    );

    var test = babel.transform(out.code, {
        plugins: [codegen]
        }
    );

    return out.code
}

var code = 'var a = (b === 5) * 5 + !(b === 5) * 6;';
console.log(parseCode(code));

module.exports.parseCode = parseCode;
