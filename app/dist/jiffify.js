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

  // transform left-most binary op
  function bin_leaf(left, right, op) {
    if (t.isIdentifier(left)) {
      var expr = t.callExpression(t.memberExpression(t.identifier(left.name), t.identifier(op)), [right]);
    }
    // TODO: can't actually have an integer in the left-most position
    // flipping them would be easy, but this will have to be handled differently
    // for division once it's implemented (7 / x != x.div(7))
    // flipping would also be different for subtraction: 7 - a would be a + (-7)
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
    if (t.isIdentifier(path.node.left) || t.isNumericLiteral(path.node.left) || t.isUnaryExpression(path.node.left)) {
      if (path.node.operator in op_translate) {
        path.replaceWith(bin_leaf(path.node.left, path.node.right, op_translate[path.node.operator]));
      } else if (eq_ops.has(path.node.operator)) {
        // handle '===' and '!=' here
        // can't do straight equality testing, so need share.<eq_test> (i think)
        // TODO: ask kinan & rawane
      }
    } else {
      bin_rec_transform(path.get('left'));
      path.replaceWith(bin_nonleaf(path.node.left, path.node.right, op_translate[path.node.operator]));
    }
  }

  // transform <cond> ? <expr1> <expr2> to <cond>*<expr1> + !<cond>*expr2
  function tern_conditional(path) {
    // handle !<cond> ? <expr1> <expr2> case
    if (t.isUnaryExpression(path.node.test) && path.node.test.operator === '!') {}
    // console.log("Hi i am here");5

    // handle <cond> ? <expr1> <expr2> case
    else {
        var left = t.binaryExpression('*', path.node.test, path.node.consequent);
        var test_neg = t.unaryExpression('!', path.node.test);
        var right = t.binaryExpression('*', test_neg, path.node.alternate);
        path.replaceWith(t.binaryExpression('+', left, right));
      }
  }

  function addError(path, error) {
    if (path.parentPath === null) {

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
      }
    }
  };
};