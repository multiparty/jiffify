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

<<<<<<< HEAD
    console.log(converted.code);

    if (converted.ast.program.error.length > 0) {
        converted.code = changeErrorCode(converted.code, converted.ast.program.error);
    }

    var analyzed = babel.transform(converted.code, { plugins: [analysis] });
    // return converted code;
    return { code: converted.code, costs: analyzed.ast.program.costObject };
}
=======
    var test = babel.transform(out.code, {
        plugins: [codegen]
    });

    return out.code;
}

var code = 'var a = !(b === 5) * 5 + !(b === 5) * 6;';
console.log(parseCode(code));
>>>>>>> a6cfc9bc3b5f8fb7ba5c60038b05ff53ac84c482

module.exports.parseCode = parseCode;