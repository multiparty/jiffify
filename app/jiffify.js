const util = require('util');
const babylon = require('babylon');
const traverse = require('babel-traverse');

const ADD = '+';
const SUB = '-';
const MULT = "*";
const DIV = "/";
const IDENT = "Identifier";

function parseCode(code) {
  var AST = babylon.parse(code);

  return traverseAST(AST.program.body[0]);
}

function translateToJiff(tree, params) {

  if (tree.type === IDENT) {
    return tree.name;
  }

  var l = translateToJiff(tree.left, params);
  var r = translateToJiff(tree.right, params);

  var op = '.';
  if (tree.operator === ADD) {
    op = ".add"
  } else if (tree.operator === SUB) {
    op = ".sub"
  } else if (tree.operator === MULT) {
    op = ".mult"
  } else if (tree.operator === DIV) {

  }

  if (!params.includes(r)) {
    op += "_cst";
  }
  op += "(";

  return l.concat(op).concat(r).concat(")");
}

function traverseAST(AST) {

  try {
    if (AST.type === 'FunctionDeclaration') {

      var params = [];
      for (var i = 0; i < AST.params.length; i++) {
        params.push(AST.params[i].name);
      }

      if (AST.body.body != undefined) {
        var body = AST.body.body;
  
        for (var i = 0; i < body.length; i++) {
          if (body[i].argument.type === "BinaryExpression") {
            var translated = translateToJiff(body[i].argument, params);
            return translated; 
          }
        }
      }
    }
  } catch (err) {
    console.error('error', err);
    return null;
  }

}

module.exports.parseCode = parseCode;  