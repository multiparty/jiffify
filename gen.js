const util = require('util');
const babylon = require('babylon');
const babel_core = require('babel-core');
const generate = require('babel-generator');

function g(a, b) {
    let c = a + b;
    let d = c + 7;
    return d;
}

var f = String(g);

var AST = babylon.parse(f);

babel_core.traverse(AST, {
    enter(path)
    {
        if (path.node.type === 'Identifier' && path.nodeName === 'c') {
            path.nodeName = 'x';
        }
    }
});



