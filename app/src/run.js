import * as babylon from "babylon";
import traverse from "babel-traverse";
import * as t from "babel-types";
var babel = require('babel-core');
const codegen = require('./codegen');

var src = 'function fun(a,b) { var d = ((a + b) * 7) / e;\nreturn d;\n}';

var out = babel.transform(src, {
    plugins: [codegen]
});

console.log(out.code);