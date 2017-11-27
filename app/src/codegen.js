
// translate arithmetic operators to jiff function names
var op_translate = {
    '+':'add',
    '-':'sub',
    '*':'mult',
    '/':'div',
    '<=':'lteq',
    '>=':'gteq',
    '<':'lt',
    '>':'gt',
    '!=':'neq',
    '===':'eq'
};


module.exports = function(babel) {
    const t = babel.types;

    // transform left-most binary op
    function bin_leaf(left, right, op) {
        if (t.isIdentifier(left)) {
            var expr =
                t.callExpression(
                    t.memberExpression(
                        t.identifier(left.name), t.identifier(op)
                    ), [right]
                );
        }
        // TODO: can't actually have an integer in the left-most position,
        // since (i think) jiff doesn't support <constant>.<op>(variable) statements.
        // should probably just return an error message here instead.
        // TODO: flipping them would be easy, but this will have to be handled differently
        // for division once it's implemented (7 / x != x.div(7))
        // TODO: flipping would also be different for subtraction: 7 - a would be a + (-7)
        else if (t.isNumericLiteral(left)) {
                var expr =
                    t.callExpression(
                        t.memberExpression(t.numericLiteral(left.value), t.identifier(op)), [right]
                    );
        }
        else {
            console.log('Unknown parameter type');
            return null
        }
        return expr;
    }

    // transform all other binary ops
    function bin_nonleaf(left, right, op) {
        const expr =
            t.callExpression(
                t.memberExpression(left, t.identifier(op)), [right]
            );
        return expr;
    }

    // traverse & transform nodes in a binary op
    function bin_rec_transform(path) {
        if (t.isIdentifier(path.node.left) || t.isNumericLiteral(path.node.left)) {
            if (path.node.operator in op_translate) {
                path.replaceWith(
                    bin_leaf(
                        path.node.left, path.node.right, op_translate[path.node.operator]
                    )
                )
            }
            else if (eq_ops.has(path.node.operator)) {
                // handle '===' and '!=' here
                // can't do straight equality testing, so need share.<eq_test> (i think)
                // TODO: ask kinan & rawane
            }
        }
        else {
            bin_rec_transform(path.get('left'));
            path.replaceWith(
                bin_nonleaf(
                    path.node.left, path.node.right, op_translate[path.node.operator]
                )
            )
        }
    }

    function tern_conditional(path) {
        
    }

    return {
        visitor: {
            BinaryExpression(path){
                bin_rec_transform(path);
            },
            ConditionalExpression(path){
                if (t.isVariableDeclarator(path.parent)) {
                    console.log("Entered!");
                }
                else {
                    console.log("Skipped!");
                }
            }
        }
    }
};

