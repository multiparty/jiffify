'use strict';

// translate arithmetic operators to jiff function names
var op_translate = {
    '+': 'add',
    '-': 'sub',
    '*': 'mult',
    '/': 'div',
    '<=': 'lteq',
    '>=': 'gteq',
    '<': 'lt',
    '>': 'gt',
    '!=': 'neq',
    '===': 'eq'
};

module.exports = function (babel) {
    var t = babel.types;

    // transform left-most binary op
    function bin_leaf(left, right, op) {
        if (t.isIdentifier(left)) {
            var expr = t.callExpression(t.memberExpression(t.identifier(left.name), t.identifier(op)), [right]);
        }
        // TODO: overload arithmetic operators to handle numericLiteral types in left-most position
        else if (t.isNumericLiteral(left)) {
                var expr = t.callExpression(t.memberExpression(t.numericLiteral(left.value), t.identifier(op)), [right]);
            } else if (t.isUnaryExpression(left)) {
                var expr = t.callExpression(t.memberExpression(left, t.identifier(op)), [right]);
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
        // reached left-most value
        // TODO: might not need isUnaryExpression test here after creating visitor for it
        if (t.isIdentifier(path.node.left) || t.isNumericLiteral(path.node.left) || t.isUnaryExpression(path.node.left)) {
            if (path.node.operator in op_translate) {
                path.replaceWith(bin_leaf(path.node.left, path.node.right, op_translate[path.node.operator]));
            } else {
                console.log("Unknown binary operation.");
            }
        } else {
            bin_rec_transform(path.get('left'));
            path.replaceWith(bin_nonleaf(path.node.left, path.node.right, op_translate[path.node.operator]));
        }
    }

    // transform <cond> ? <expr1> <expr2> to <cond>*<expr1> + !<cond>*expr2
    function tern_conditional(path) {
        // handle !<cond> ? <expr1> <expr2> case
        if (t.isUnaryExpression(path.node.test) && path.node.test.operator === '!') {
            var left = t.binaryExpression('*', path.node.test, path.node.consequent);
            var right = t.binaryExpression('*', path.node.test.argument, path.node.alternate);
            path.replaceWith(t.binaryExpression('+', left, right));
        }
        // handle <cond> ? <expr1> <expr2> case
        else {
                var left = t.binaryExpression('*', path.node.test, path.node.consequent);
                var test_neg = t.unaryExpression('!', path.node.test);
                var right = t.binaryExpression('*', test_neg, path.node.alternate);
                path.replaceWith(t.binaryExpression('+', left, right));
            }
    }

    // transform !(<expr>) to not(<expr>) or (<expr>).not()
    function unary_expression(path) {
        // TODO: 'not' is hardcoded here, make general
        var mem = t.memberExpression(path.node.argument, t.identifier('not'));

        path.replaceWith(t.callExpression(mem, []));
    }

    return {
        visitor: {
            BinaryExpression: function BinaryExpression(path) {
                bin_rec_transform(path);
            },
            ConditionalExpression: function ConditionalExpression(path) {
                if (t.isVariableDeclarator(path.parent)) {
                    tern_conditional(path);
                } else {
                    // not part of a variable declaration (is it just an invalid use or are there other cases?)
                    console.log("Skipped!");
                }
            },
            UnaryExpression: function UnaryExpression(path) {
                unary_expression(path);
            }
        }
    };
};