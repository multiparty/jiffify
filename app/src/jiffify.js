
// // translate arithmetic operators to jiff function names
var op_translate = {
  '+': 'add',
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

/*
 t.callExpression(
 t.memberExpression(
 t.numericLiteral(left.value), t.identifier(op)),
 [right]
 );
 */

module.exports = function(babel) {
  const t = babel.types;

  function handleLeftNumeric(left, right, op) {
      var expr;
      if (op === 'add' || op === 'mult') {
          expr =
              t.callExpression(
                  t.memberExpression(
                      t.identifier(right.name), t.identifier(op)
                  ), [left]
              )
      }
      else if (op === 'sub') {
          // x - y ==> y.mult(-1).add(x)
          var neg_one = t.unaryExpression('-', t.numericLiteral(1), true);
          var inner_call = t.callExpression(
              t.memberExpression(
                  t.identifier(right.name), t.identifier('mult')
              ), [neg_one]);
          expr = t.callExpression(
              t.memberExpression(
                  inner_call, t.identifier('add')
              ), [left]
          )
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
      expr =
        t.callExpression(
          t.memberExpression(
            t.identifier(left.name), t.identifier(op)),
          [right]
        );
    }
    else if (t.isNumericLiteral(left) && t.isIdentifier(right)) {
        expr = handleLeftNumeric(left, right, op);
    }
    else if (t.isUnaryExpression(left)) {
        expr =
            t.callExpression(
                t.memberExpression(
                    left, t.identifier(op)
                ), [right]
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
    if (t.isIdentifier(path.node.left)
        || t.isNumericLiteral(path.node.left)
        || t.isUnaryExpression(path.node.left)) {
        if (path.node.operator in op_translate) {
            path.replaceWith(
                bin_leaf(
                    path.node.left, path.node.right, op_translate[path.node.operator]
                )
            )
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

// transform <cond> ? <expr1> <expr2> to <cond>*<expr1> + !<cond>*expr2
function tern_conditional(path) {
    // handle !<cond> ? <expr1> <expr2> case
    if (t.isUnaryExpression(path.node.test) && path.node.test.operator === '!') {
        var left = t.binaryExpression(
            '*', path.node.test, path.node.consequent
        );
        var right = t.binaryExpression(
            '*', path.node.test.argument, path.node.alternate
        );
        path.replaceWith(
            t.binaryExpression(
                '+', left, right
            )
        )
    }
    // handle <cond> ? <expr1> <expr2> case
    else {
        var left = t.binaryExpression(
            '*', path.node.test, path.node.consequent
        );
        var test_neg = t.unaryExpression('!', path.node.test);
        var right = t.binaryExpression(
            '*', test_neg, path.node.alternate
        );
        path.replaceWith(
            t.binaryExpression(
                '+', left, right
            )
        )
    }
}

function unary_statement(path) {
      if (path.node.operator === '!') {
          path.replaceWith(
              t.callExpression(
                  t.Identifier('not'), [path.node.argument]
              )
          )
      }
}

function handle_array(path) {
      var arr_name = path.parent.id.name;
      var elems = [];
      for (var i = 0; i < path.node.elements.length; i++) {
          elems.push(path.node.elements[i].name);
      }
      var arr_obj = [arr_name, elems];
      return arr_obj;
}

function addError(path, error) {
    if (path.parentPath === null) {
        path.node.error.push(error);
        return;
    }
    addError(path.parentPath, error);
}

function addArray(path, array) {
    if (path.parentPath === null) {
        path.node.arrays[array[0]] = array[1];
        return;
    }
    addError(path.parentPath, array);
}

function createErrorObj(name, loc, text) {
    // console.log('creating error obj')
    return {name: name, location: loc, text: text};
}

return {
    visitor: {
        Program(path) {
            path.node.error = [];
            path.node.arrays = {};
        },
        // temp solution, won't allow users to have arrays with same
        // name in different scopes
        ArrayExpression(path) {
            addArray(path, handle_array(path));
        },
        BinaryExpression(path){
            bin_rec_transform(path);
        },
        ForStatement(path) {
            addError(path.parentPath, {name: 'ForStatement', location: path.node.loc, text: 'ForStatements are not supported'});
        },
        ConditionalExpression(path){
            if (t.isVariableDeclarator(path.parent)) {
                tern_conditional(path);
            }
            else {
                // not part of a variable declaration (is it just an invalid use or are there other cases?)
                console.log("Skipped!");
            }
        },
        UnaryExpression(path) {
            unary_statement(path);
        }
    }
  }
};

