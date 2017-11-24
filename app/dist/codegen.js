'use strict';

function translate_op(op) {
    if (op === '+') {
        return 'add';
    } else if (op === '-') {
        return 'sub';
    } else if (op === '*') {
        return 'mult';
    } else if (op === '/') {
        return 'div';
    }
}

module.exports = function (babel) {
    var t = babel.types;

    // transform left-most binary op
    // TODO: if the left-most value is a a number, gets translated to 5 .<op>(variable) (with the space in there)
    // might not matter since I don't think jiff supports <value>.<op>(operand) statements anyway, but should check
    function bin_leaf(left, right, op) {
        if (t.isIdentifier(left)) {
            var expr = t.callExpression(t.memberExpression(t.identifier(left.name), t.identifier(op)), [right]);
        }
        // if jiff doesn't support <value>.<op>(operand) statements might need to just return error here
        else if (t.isNumericLiteral(left)) {
                var expr = t.callExpression(t.memberExpression(t.numericLiteral(left.value), t.identifier(op)), [right]);
            } else {
                console.log('Unknown parameter type');
                return null;
            }
        return expr;
    }

    // transform all other binary ops
    function bin_nonleaf(left, right, op) {
        var expr = t.callExpression(t.memberExpression(left, t.identifier(op)), [right]);
        return expr;
    }

    // traverse & transform nodes in a binary op
    function bin_rec_transform(path) {
        if (t.isIdentifier(path.node.left) || t.isNumericLiteral(path.node.left)) {
            path.replaceWith(bin_leaf(path.node.left, path.node.right, translate_op(path.node.operator)));
        } else {
            bin_rec_transform(path.get('left'));
            path.replaceWith(bin_nonleaf(path.node.left, path.node.right, translate_op(path.node.operator)));
        }
    }

    return {
        visitor: {
            BinaryExpression: function BinaryExpression(path) {
                bin_rec_transform(path);
            }
        }
    };
};