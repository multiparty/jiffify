import * as babylon from "babylon";
import traverse from "babel-traverse";
import * as t from "babel-types";
const babel = require('babel-core');
const jiffify = require('./jiffify');
const analysis = require('./analysis');

function parseCode(src) {

    var converted = babel.transform(src, {
        plugins: [jiffify]
    });
    var analyzed = babel.transform(converted.code, {
        plugins: [analysis]
    });
    
    return {code: converted.code, costs: analyzed.ast.program.costObject};
}

module.exports.parseCode = parseCode;
