"use strict";

var _babylon = require("babylon");

var babylon = _interopRequireWildcard(_babylon);

var _babelTraverse = require("babel-traverse");

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

var _babelTypes = require("babel-types");

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

    // return converted.code;
    return { code: converted.code, costs: analyzed.ast.program.costObject };
}

/*
var src = 'function fun(a,b,c) {var a = (b > c) ? b : c; return a;}'

var new_src = parseCode(src);

console.log(new_src);
*/

module.exports.parseCode = parseCode;