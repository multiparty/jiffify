const babel = require('babel-core');
const jiffify = require('./jiffify');
const analysis = require('./analysis');

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
<<<<<<< HEAD
    var converted = babel.transform(
        src, { plugins: [jiffify] }
        );
=======
    var out = babel.transform(src, {
        plugins: [codegen]
        }
    );

    var test = babel.transform(out.code, {
        plugins: [codegen]
        }
    );
>>>>>>> a6cfc9bc3b5f8fb7ba5c60038b05ff53ac84c482

    console.log(converted.code);

<<<<<<< HEAD
    if (converted.ast.program.error.length > 0) {
        converted.code = changeErrorCode(converted.code, converted.ast.program.error);
    } 

    var analyzed = babel.transform(
    converted.code, { plugins: [analysis] }
    );
    // return converted code;
    return {code: converted.code, costs: analyzed.ast.program.costObject};
}
=======
var code = 'var a = !(b === 5) * 5 + !(b === 5) * 6;';
console.log(parseCode(code));
>>>>>>> a6cfc9bc3b5f8fb7ba5c60038b05ff53ac84c482

module.exports.parseCode = parseCode;
