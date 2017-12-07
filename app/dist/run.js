'use strict';

var babel = require('babel-core');
var jiffify = require('./jiffify');
var analysis = require('./analysis');

// function changeErrorCode(code, errors) {
//     var errorString = "";
//     for (var i = 0; i < errors.length; i++) {
//        // TODO: actually display this shit
//     //    errorString = JSON.stringify(errors[i]).toString();
//     errorString = "Error: " + JSON.stringify(errors[i].text) + JSON.stringify(errors[i].location);
//         // errorString = errorString + ('Error: ' + errors[i].text + JSON.stringify(errors[i].location)).toString();
//     }
//     return errorString;
// }

function parseCode(src) {
    var converted = babel.transform(src, { plugins: [jiffify] });
    if (converted.ast.program.error.length <= 0) {
        console.log('why????');
        var analyzed = babel.transform(converted.code, { plugins: [analysis] });
        console.log("Successfully parsed");
        return { code: converted.code, ast: analyzed.ast.program, costs: analyzed.ast.program.costObject };
    }
    return { ast: code.ast.program };

    // return converted code;
}

module.exports.parseCode = parseCode;