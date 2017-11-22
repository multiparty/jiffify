const util = require('util');


function translate_op(op) {
    if (op === '+') {
        return 'add';
    }
    else if (op === '-') {
        return 'sub';
    }
    else if (op === '*') {
        return 'mult';
    }
    else if (op === '/') {
        return 'div';
    }
}


module.exports = function(babel) {
    const t = babel.types;

    function bin_leaf(leftName, op) {
        const expr = t.memberExpression(t.identifier(leftName), t.identifier(op));
        return expr;
    }

    return {
        visitor: {
            BinaryExpression(path){
                path.replaceWith(
                    t.callExpression(
                        bin_leaf(path.node.left.name, 'add'), [path.node.right]
                    )
                )
            }
        }
    }
};

