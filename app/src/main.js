import * as babylon from "babylon";
import traverse from "babel-traverse";


// top-level function called when user inputs code
function parse_code(code) {
    var AST = babylon.parse(code);

    return traversal(AST);
}


// traverse AST, return op code
function traversal(ast) {
    traverse(ast, {
        enter(path)
        {
            if (path.node.type === 'Identifier') {
                console.log(path.node.name)
            }
        }
    });
    return 1;
}


// dummy function example.
// TODO: accept user input & pass to tree traversal
function g(a, b) {
    var c = a + b;
    const d = c + 7;
    return d;
}


const f = String(g);

const op_code = parse_code(f);

console.log(op_code);