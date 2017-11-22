import * as babylon from "babylon";
import traverse from "babel-traverse";
import * as t from "babel-types";
var babel = require('babel-core');
const codegen = require('./codegen');


var src = 'var c = a + b;\nvar d = c + b';

var out = babel.transform(src, {
    plugins: [codegen]
});

console.log(out.code);