import * as babylon from "babylon";
import traverse from "babel-traverse";
import * as t from "babel-types";
const codegen = require('./codegen');


// top-level function called when user inputs code
function parse_code(code) {
    var AST = babylon.parse(code);

    return traversal(AST);
}


// traverse AST, return op code
/*
might be better to detect a function call here instead, and recursively
expand out generated code via the visitor nodes in codegen
 */
function traversal(ast) {
    var op_code = '';
    traverse(ast, {
        enter(path)
        {
            if (t.isVariableDeclarator(path.node)) {
                op_code += codegen.generate_var(path);
            }
        }
    });

    return op_code;
}


// dummy function example.
// TODO: accept user input & pass to tree traversal
function g(a, b) {
    var c = a.add(7);
    return c;
}

var src = 'var c = a + b;';



// const f = String(g);
// const op_code = parse_code(f);

const op_code = parse_code(code);


