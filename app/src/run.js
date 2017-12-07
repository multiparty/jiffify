const babel = require('babel-core');
const jiffify = require('./jiffify');
const analysis = require('./analysis');



function parseCode(src) {
    var converted = babel.transform(
        src, { plugins: [jiffify] }
        );

        // if (converted.ast.program.error.length > 0) {
        //     converted.code = changeErrorCode(converted.code, converted.ast.program.error);
        // }

        var analyzed = babel.transform(
        converted.code, { plugins: [analysis] }
        );
    // return converted code;
    return {code: converted.code, costs: analyzed.ast.program.costObject};
}

module.exports.parseCode = parseCode;
