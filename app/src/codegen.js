
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
        const expr = t.memberExpression(
            t.identifier(leftName), t.identifier(op));
        return expr;
    }

    function bin_nonleaf(left, right, op) {
        // might not need memberExpression call since lower levels are converted first
        const expr = t.callExpression(
            t.memberExpression(
                left, t.identifier(op)
            ), [right]
        );
        return expr;
    }

    return {
        visitor: {
            BinaryExpression(path){
                if (t.isIdentifier(path.node.left)) {
                    path.replaceWith(
                        t.callExpression(
                            bin_leaf(path.node.left.name, 'add'), [path.node.right]
                        )
                    )
                }
                // this is replacing the whole sub-tree, including the nested binary op
                else {
                    path.replaceWith(
                        t.binaryExpression(
                            '+', path.node.left.left, bin_nonleaf(path.node.left.right, path.node.right, 'add')
                        )
                    )
                }
            }
        }
    }
};

