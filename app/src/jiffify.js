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
  '===': 'eq',
  '==': 'eq',
  '^' : 'xor_bit'
};

// translate functions passed to reduce() into characters stored in AST
var reduce_op_translate = {
  'add': '+',
  'sub': '-',
  'mult': '*'
};

module.exports = function (babel) {
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
      // y.mult(-1)
      var inner_call = t.callExpression(
        t.memberExpression(
          t.identifier(right.name), t.identifier('mult')
        ), [neg_one]);
      // y.mult(-1).add(x)
      expr = t.callExpression(
        t.memberExpression(
          inner_call, t.identifier('add')
        ), [left]
      )
    }
    return expr;
  }

  // transform left-most binary op
  function bin_leaf(path) {
    var left = path.node.left;
    var right = path.node.right;
    var op = op_translate[path.node.operator];
    var expr;
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
      return null;
    }
    return expr;
  }

  // transform all other binary ops
  function bin_nonleaf(path) {
    var left = path.node.left;
    var right = path.node.right;
    var op = op_translate[path.node.operator];
    const expr =
      t.callExpression(
        t.memberExpression(left, t.identifier(op)), [right]
      );
    return expr;
  }

  function checkSupportedOperator(operator, path) {
    if (operator === '&' || operator === '|') {
      var err = createErrorObj('Unsupported operator', path.node.loc, operator + ' are not supported');
      addError(path.parentPath, err);
      return false;
    } 
    return true;
  }
// traverse & transform nodes in a binary op
  function bin_rec_transform(path) {
    if (t.isNumericLiteral(path.node.left) && t.isNumericLiteral(path.node.right)) {
      // something like var a = 1 + 1; (can't jiffify it)
      var err = createErrorObj(
        'UnsupportedOperation', path.node.loc, 'Adding two literals is not supported.'
      );
      addError(path, err);
      return;
    }
    else if (t.isIdentifier(path.node.left)
      || t.isNumericLiteral(path.node.left)
      || t.isUnaryExpression(path.node.left)) {
      if (!checkSupportedOperator(path.node.operator, path)) {
        return;
      }
      if (path.node.operator in op_translate) {
        path.replaceWith(
          bin_leaf(path)
        )
      }
    }
    else {
      bin_rec_transform(path.get('left'));
      path.replaceWith(
        bin_nonleaf(path)
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

  // !(<expr>) ==> not(<expr>)
  function unary_statement(path) {
    if (path.node.operator === '!') {
      path.replaceWith(
        t.callExpression(
          t.Identifier('not'), [path.node.argument]
        )
      )
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
    return {name: name, location: loc, text: text};
  }


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

  // build binary expression from reduce() op and passed array
  function build_binary_tree(elems, op) {
    var op_expr = reduce_op_translate[op];
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
    // too many args
    if (path.node.arguments.length > 1) {
      var err = createErrorObj(
        "TooManyArgs", path.node.loc, 'Can only pass 1 function to reduce()'
      );
      addError(path, err);
    }
    // valid
    else if (valid.has(path.node.arguments[0].value)) {
      var arr_name = path.node.callee.object.name;
      var op = path.node.arguments[0].value;
      var elems = findArray(path, arr_name);
      path.replaceWith(build_binary_tree(elems, op));
    }
    // unsupported function
    else {
      var err = createErrorObj(
        "UnsupportedFunction", path.node.loc, 'Operation passed is not supported for reduce()'
      );
      addError(path, err);
    }
  }

  // go to AST root and retrieve array if it is stored, else return error
  function findArray(path, arr_name) {
    if (t.isProgram(path.node)) {
      // array doesn't exist
      if (path.node.arrays[arr_name] === undefined) {
        var err = createErrorObj(
          'NonexistentArray', path.node.loc, 'Array passed is either undefined or out of scope'
        );
        addError(path, err);
        return;
      }
      // valid
      else {
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

  function checkControlLeakage(path, name) {

    if (path.node.type === 'IfStatement') {
      return true;
    }

    if (path.parentPath === null) {
      return false;
    }

    return checkControlLeakage(path.parentPath, name);
  }

  function checkRecursion(name, path) {
    if (t.isProgram(path)) {
      return false; 
    }

    if (path.node.type === 'FunctionDeclaration') {
      if (name == path.node.id.name) {
        return true;
      }
    }
    return checkRecursion(name, path.parentPath);
  }

  return {
    visitor: {
      Program(path) {
        path.node.error = [];
        path.node.arrays = {};
      },
      ArrayExpression(path) {
        addArray(path, handle_array(path));
      },
      CallExpression(path) {

        if (t.isIdentifier(path.node.callee)) {
          if (checkRecursion(path.node.callee.name, path.parentPath)) {
            var err = createErrorObj("Recursion", path.node.loc, "Recursion branching leaks data on inputs");
            // addError(err, path);
            // addError(err, path.parentPath);
          }
        }


        // <variable>.reduce(<reducer>)
        try {
          if (path.node.callee.property.name === 'reduce') {
            handle_reduce(path);
          }
        }
        catch (TypeError) {
            // some CallExpressions don't have a 'property' attribute,
            // but they're handled by other visitors so skip them
          }
      },
      BinaryExpression(path){
        bin_rec_transform(path);
      },
      ForStatement(path) {
        var err = createErrorObj(
          'ForStatement', path.node.loc, 'ForStatements are not supported'
        );
        addError(path.parentPath, err);
      },
      ConditionalExpression(path){
        if (t.isVariableDeclarator(path.parent) || t.isReturnStatement(path.parent)) {
          tern_conditional(path);
        }
        else {
          // TODO: make sure there are no other valid cases
          console.log("Skipped node with parent type: " + path.parent.type);
        }
      },
      UnaryExpression(path) {
        unary_statement(path);
      },
      AssignmentExpression(path) {
        var node = path.node;
        if (node !== undefined) {
          if (node.left !== undefined) {
            if (node.left.name !== undefined) {
              var overwritten = checkParam(path.parentPath, node.left.name);
              if (overwritten) {
                var err = createErrorObj('Overwriting', node.loc, 'Cannot overwrite secret shares: ' + node.left.name);
                addError(path.parentPath, err);
              }  
            }    
          }      
        }
      },
      Identifier(path) {    
        var node = path.node; 
 
        // check if identifier is an actual param
        if (checkParam(path, node.name)) {
          var conditional = checkControlLeakage(path.parentPath, node.name);  
          if (conditional) {
            var loc = {};
            var err = createErrorObj(
              'Leakage', loc, 'Information leakage from secret share nested in conditional'
            );
            addError(path.parentPath, err);
          } 
        }
      },
      VariableDeclarator(path) {
        var overwritten = checkParam(path.parentPath, path.node.id.name);
        if (overwritten) {
          var err = createErrorObj('Overwriting', path.node.loc, 'Cannot overwrite secret shares: ' + path.node.id.name);
          addError(path.parentPath, err);
        }
      },
      Literal(path) {
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
  }
};

