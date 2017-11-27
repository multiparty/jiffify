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

// var code = 'var a = b ? 5 : 6';
// console.log(parseCode(code));

module.exports.parseCode = parseCode;
