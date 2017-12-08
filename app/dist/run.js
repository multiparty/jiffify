'use strict';

var babel = require('babel-core');
var jiffify = require('./jiffify');
var analysis = require('./analysis');

function changeErrorCode(code, errors) {
    var errorString = "";
    for (var i = 0; i < errors.length; i++) {
        // TODO: actually display this shit
        // console.log('i',errors[i]);
        // errorString = errorString + ('Error: ' + errors[i].text + JSON.stringify(errors[i].location)).toString();
    }
    return errorString;
}

function parseCode(src) {
    var converted = babel.transform(src, { plugins: [jiffify] });

    console.log(converted.code);

    if (converted.ast.program.error.length > 0) {
        converted.code = changeErrorCode(converted.code, converted.ast.program.error);
    }

    var analyzed = babel.transform(converted.code, { plugins: [analysis] });

    // return converted code;
    return { code: converted.code, costs: analyzed.ast.program.costObject };
}

module.exports.parseCode = parseCode;