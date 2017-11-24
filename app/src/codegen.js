
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
        const expr = t.callExpression(
            t.memberExpression(
                left, t.identifier(op)
            ), [right]
        );
        return expr;
    }

    function bin_rec_transform(path) {
        if (t.isIdentifier(path.node.left)) {
            path.replaceWith(
                t.callExpression(
                    bin_leaf(path.node.left.name, 'add'), [path.node.right]
                )
            )
        } else {
            bin_rec_transform(path.get('left'));
            path.replaceWith(
                bin_nonleaf(
                    path.node.left, path.node.right, 'add'
                )
            )
        }
    }

    return {
        visitor: {
            BinaryExpression(path){
                bin_rec_transform(path);
            }
        }
    }
};

