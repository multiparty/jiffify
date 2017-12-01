'use strict';

var babel = require('babel-core');
var jiffify = require('./jiffify');
var analysis = require('./analysis');

function parseCode(src) {

    var converted = babel.transform(src, {
        plugins: [jiffify]
    });
    var analyzed = babel.transform(converted.code, {
        plugins: [analysis]
    });

    return { code: converted.code, costs: analyzed.ast.program.costObject };
}

module.exports.parseCode = parseCode;