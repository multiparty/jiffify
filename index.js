const util = require('util');
const babylon = require('babylon');
const traverse = require('babel-traverse');

const code = `function f(a,b) {return a + b + c + d;}`;


var AST = babylon.parse(code);

var AST = AST.program.body[0];

const ADD = '+';
const SUB = '-';
const MULT = "*";
const DIV = "/";


traverseAST(AST);

function translateOperator(op) {
  if (op === ADD) {
    
  } else if (op === SUB) {

  } else if (op === MULT) {

  } else if (op === DIV) {

  }
}

function translateToJiff(tree) {
  var l = translateToJiff(tree.left);
  var r = translateToJiff(tree.right);

  translateOperator(tree.operator);

}

function traverseAST(AST) {
  if (AST.type === 'FunctionDeclaration') {
    // for (k in AST.body) {
    if (AST.body.body != undefined) {
      var body = AST.body.body;

      for (var i = 0; i < body.length; i++) {
        if (body[i].argument.type === "BinaryExpression") {
          translateToJiff(body[i].argument);

        }
      }
    }
  }
}