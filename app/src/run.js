import * as babylon from "babylon";
import traverse from "babel-traverse";
import * as t from "babel-types";
const babel = require('babel-core');
const jiffify = require('./jiffify');
const analysis = require('./analysis');

function parseCode(src) {

    var src = "function f(a,b){return a*b; }"
    var converted = babel.transform(src, {
        plugins: [jiffify]
    });

    var analyzed = babel.transform(converted.code, {
        plugins: [analysis]
    });
    

    return converted.code
}

module.exports.parseCode = parseCode;
