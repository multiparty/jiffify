const util = require('util');
const babylon = require('babylon');
const traverse = require('babel-traverse');

const code = `function f(a,b) {return a * b * c + d + e + f * a;}`;


var AST = babylon.parse(code);

var AST = AST.program.body[0];

const ADD = '+';
const SUB = '-';
const MULT = "*";
const DIV = "/";
const IDENT = "Identifier";

traverseAST(AST);

// function translateOperator(op) {
 
// }

function translateToJiff(tree) {

  if (tree.type === IDENT) {
    return tree.name;
  }

  var l = translateToJiff(tree.left);
  var r = translateToJiff(tree.right);

  var op = '';
  if (tree.operator === ADD) {
    op = ".add("
  } else if (tree.operator === SUB) {
    op = ".sub("
  } else if (tree.operator === MULT) {
    op = ".mult("
  } else if (tree.operator === DIV) {

  }

  return l.concat(op).concat(r).concat(")");
  // return ((l.concat(tree.operator)).concat(r));

  // translateOperator(tree.operator);


}

function traverseAST(AST) {
  if (AST.type === 'FunctionDeclaration') {
    // for (k in AST.body) {
    if (AST.body.body != undefined) {
      var body = AST.body.body;

      for (var i = 0; i < body.length; i++) {
        if (body[i].argument.type === "BinaryExpression") {
          var translated = translateToJiff(body[i].argument);
          console.log("jiff translation: ", translated);     
        }
      }
    }
  }

}