import * as babylon from "babylon";
import traverse from "babel-traverse";
import * as t from "babel-types";
var babel = require('babel-core');
const codegen = require('./codegen');

function parseCode(src) {
    var out = babel.transform(src, {
        plugins: [codegen]
    });

    return out.code
}

// var code = 'var a = true ? 5 : 6;\nfalse ? b = 6 : c = 7';
// var code = 'var a = (b === 5) * 5;';
var code = 'var a = (b === 5)*1 + (b != 5)*2;';
console.log(parseCode(code));

module.exports.parseCode = parseCode;
