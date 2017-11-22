const util = require('util');
import * as babylon from "babylon";
import traverse from "babel-traverse";
import * as t from "babel-types";


function generate_var(path) {

    let op_code = '';


    const unroll_bin_exp = {
        Identifier(path) {
            if (path.node.isClean) return;
            if (path.key === 'left') {
                op_code += path.node.name + ' ';
            }
            else {
                op_code += path.container.operator + ' ' + path.node.name + ' ';
            }
            path.node.isClean = true;
        },
        NumericLiteral(path) {
            if (path.node.isClean) return;
            if (path.key === 'left') {
                op_code += 'LEFT' + path.node.value + ' ' + path.container.operator + ' ';
            }
            else {
                op_code += path.container.operator + ' ' + path.node.value + ' ';
            }
            path.node.isClean = true;
        }
    };

    const bin_exp = {
        BinaryExpression(path) {
            path.traverse(unroll_bin_exp);
        }

    };

    const declare_var = {
        Identifier(path) {
            if (path.container.type == 'VariableDeclarator') {
                op_code += 'var ' + path.node.name + ' = ';
            }
        }
    };

    path.traverse(declare_var);
    path.traverse(bin_exp);

    return op_code;
}

module.exports.generate_var = generate_var;
