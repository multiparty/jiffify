const util = require('util');

function translate_op(op) {
    if (op === '+') {
        return '.add(';
    }
    else if (op === '-') {
        return '.sub(';
    }
    else if (op === '*') {
        return '.mult(';
    }
    else if (op === '/') {
        return '.div(';
    }
}


function generate_var(path) {

    let op_code = '';
    var found_leaf = false;

    // when visitor reaches a binary expression, this unrolls the values in it
    const unroll_bin_exp = {
        Identifier(path) {
            if (path.node.isClean) return;
            if (path.key === 'left') {
                // detect left-most leaf in expression
                if (!found_leaf) {
                    op_code += path.node.name;
                    found_leaf = true;
                }
                else {
                    op_code += translate_op(path.parentPath.parent.operator) + path.node.name + ')';
                }
            }
            else {
                op_code += translate_op(path.container.operator) + path.node.name + ')';
            }
            path.node.isClean = true;
        },
        NumericLiteral(path) {
            if (path.node.isClean) return;
            if (path.key === 'left') {
                // detect left-most leaf in expression
                if (!found_leaf) {
                    op_code += path.node.value;
                    found_leaf = true;
                }
                else {
                    op_code += translate_op(path.parentPath.parent.operator) + path.node.value + ')';
                }
            }
            else {
                op_code += translate_op(path.container.operator) + path.node.value + ')';
            }
            path.node.isClean = true;
        }
    };

    // visitor that detects binary expressions
    const bin_exp = {
        BinaryExpression(path) {
            path.traverse(unroll_bin_exp);
        }

    };

    // visitor that detects variable declarations
    const declare_var = {
        Identifier(path) {
            if (path.container.type == 'VariableDeclarator') {
                op_code += 'var ' + path.node.name + ' = ';
            }
        }
    };

    path.traverse(declare_var);
    path.traverse(bin_exp);
    op_code += ';\n';

    return op_code;
}

module.exports.generate_var = generate_var;
