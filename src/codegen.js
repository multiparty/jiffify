import * as babylon from "babylon";
import traverse from "babel-traverse";

function g(a, b) {
    let c = a + b;
    let d = c + 7;
    return d;
}

var f = String(g);

var AST = babylon.parse(f);

traverse(AST, {
    enter(path)
    {
        if (path.node.type === 'Identifier') {
            console.log(path.nodeName)
        }
    }
});

