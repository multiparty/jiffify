'use strict';

// // translate arithmetic operators to jiff function names
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

  function handleLeftNumeric(left, right, op) {
    var expr;
    if (op === 'add' || op === 'mult') {
      expr = t.callExpression(t.memberExpression(t.identifier(right.name), t.identifier(op)), [left]);
    } else if (op === 'sub') {
      // x - y ==> y.mult(-1).add(x)
      var neg_one = t.unaryExpression('-', t.numericLiteral(1), true);
      var inner_call = t.callExpression(t.memberExpression(t.identifier(right.name), t.identifier('mult')), [neg_one]);
      expr = t.callExpression(t.memberExpression(inner_call, t.identifier('add')), [left]);
    }
    return expr;
  }

  // transform left-most binary op
  function bin_leaf(left, right, op) {
    var expr;
    if (t.isNumericLiteral(left) && t.isNumericLiteral(right)) {
      // TODO: error message here, don't have enough time to jiffify stuff like 1 + 2 + a
    }
    if (t.isIdentifier(left)) {
      expr = t.callExpression(t.memberExpression(t.identifier(left.name), t.identifier(op)), [right]);
    } else if (t.isNumericLiteral(left) && t.isIdentifier(right)) {
      expr = handleLeftNumeric(left, right, op);
    } else if (t.isUnaryExpression(left)) {
      expr = t.callExpression(t.memberExpression(left, t.identifier(op)), [right]);
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
    if (t.isIdentifier(path.node.left) || t.isNumericLiteral(path.node.left) || t.isUnaryExpression(path.node.left)) {
      if (path.node.operator in op_translate) {
        path.replaceWith(bin_leaf(path.node.left, path.node.right, op_translate[path.node.operator]));
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

  function unary_statement(path) {
    if (path.node.operator === '!') {
      path.replaceWith(t.callExpression(t.Identifier('not'), [path.node.argument]));
    }
  }

  function addError(path, error) {
    if (t.isProgram(path.node)) {
      path.node.error.push(error);
      return;
    }
    addError(path.parentPath, error);
  }

  function createErrorObj(name, loc, text) {
    return { name: name, location: loc, text: text };
  }

  // true if overwritten
  // false if no overwrite


  function checkParam(path, name) {
    if (path.node.type === 'FunctionDeclaration') {
      var params = path.node.params;

      for (var i = 0; i < params.length; i++) {
        if (name === params[i].name) {
          return true;
        }
      }
      return false;
    }

    if (path.parentPath === null) {
      return false;
    }
    return checkParam(path.parentPath, name);
  }

  /*
   REDUCE STUFF BELOW
   */

  // extract array name & elements
  function handle_array(path) {
    var arr_name = path.parent.id.name;
    var elems = [];
    for (var i = 0; i < path.node.elements.length; i++) {
      elems.push(path.node.elements[i].name);
    }
    var arr_obj = [arr_name, elems];
    return arr_obj;
  }

  function translate_reduce_op(op) {
    if (op === 'add') {
      return '+';
    } else if (op === 'sub') {
      return '-';
    } else if (op === 'mult') {
      return '*';
    }
  }

  function build_binary_tree(elems, op) {
    var op_expr = translate_reduce_op(op);
    var final_exp;
    var temp = t.binaryExpression(op_expr, t.identifier(elems[0]), t.identifier(elems[1]));
    for (var i = 2; i < elems.length; i++) {
      // create new bin exp ('+', cur_exp, elems[i])
      final_exp = t.binaryExpression(op_expr, temp, t.identifier(elems[i]));
      temp = final_exp;
    }
    return final_exp;
  }

  // converts statements of the form:
  // var x = y.reduce("<reducer>")
  function handle_reduce(path) {
    var valid = new Set(['add', 'sub', 'mult']);
    // passing a string to reduce() for now, also hardcoding
    // in arguments[0], but we can test to make sure
    // arguments.length === 1 in the future
    if (valid.has(path.node.arguments[0].value)) {
      var arr_name = path.node.callee.object.name;
      var op = path.node.arguments[0].value;
      // retrieve array elements
      var elems = findArray(path, arr_name);
      path.replaceWith(build_binary_tree(elems, op));
    } else {
      // some kind of error stuff here
    }
  }

  function findArray(path, arr_name) {
    if (t.isProgram(path.node)) {
      if (path.node.arrays[arr_name] === undefined) {
        // array not in arrays dict, error handling etc.
      } else {
        return path.node.arrays[arr_name];
      }
    }
    return findArray(path.parentPath, arr_name);
  }

  // insert array into top-level dict in AST
  function addArray(path, array) {
    if (t.isProgram(path.node)) {
      path.node.arrays[array[0]] = array[1];
      return;
    }
    addArray(path.parentPath, array);
  }

  /*
   END REDUCE STUFF
   */

  function checkControlLeakage(path, name) {

    if (path.node.type === 'IfStatement') {
      return true;
    }

    if (path.parentPath === null) {
      return false;
    }

    return checkControlLeakage(path.parentPath, name);
  }

  return {
    visitor: {
      Program: function Program(path) {
        path.node.error = [];
        path.node.arrays = {};
      },

      // temp solution, since it won't allow users to
      // have arrays with same name in different scopes
      ArrayExpression: function ArrayExpression(path) {
        addArray(path, handle_array(path));
      },
      CallExpression: function CallExpression(path) {
        // might be hacky, only handles statements of the form
        // <variable>.reduce(<reducer>)
        if (path.node.callee.property.name === 'reduce') {
          handle_reduce(path);
        }
      },
      BinaryExpression: function BinaryExpression(path) {
        bin_rec_transform(path);
      },
      ForStatement: function ForStatement(path) {
        var err = createErrorObj('ForStatement', path.node.loc, 'ForStatements are not supported');
        addError(path.parentPath, err);
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
        unary_statement(path);
      },
      Identifier: function Identifier(path) {
        var node = path.node;
        // check if identifier is an actual param
        if (checkParam(path, node.name)) {
          var conditional = checkControlLeakage(path.parentPath, node.name);
          if (conditional) {
            var err = createErrorObj('Leakage', path.node.loc, 'Information leakage from secret share nested in conditional');
            addError(path.parentPath, err);
          }
        }
      },
      VariableDeclarator: function VariableDeclarator(path) {
        var overwritten = checkParam(path.parentPath, path.node.id.name);
        if (overwritten) {
          var err = createErrorObj('Overwriting', path.node.loc, 'Cannot overwrite secret shares: ' + path.node.id.name);
          addError(path.parentPath, err);
        }
      },
      Literal: function Literal(path) {
        var node = path.node;
        if (node.type === 'BooleanLiteral') {
          if (node.value === true) {
            path.replaceWith(t.numericLiteral(1));
          } else if (node.value === false) {
            path.replaceWith(t.numericLiteral(0));
          }
        }
      }
    }
  };
};