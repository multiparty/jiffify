const util = require('util');
const babylon = require('babylon');

const code = `function f(a,b) {return a + b;}`;


var AST = babylon.parse(code);

var AST = AST.program.body[0];

traverseAST(AST);


function handleChildren(AST) {

  if (AST.argument.type === "BinaryExpression") {
    // console.log(AST.argument) 
    console.log(AST.argument.operator)
  }

  // console.log(AST.argument.type);
  // if (AST.argument.type)
  // for (k in AST.argument) {
    
  // }


}

function traverseAST(AST) {
  if (AST.type === 'FunctionDeclaration') {
    // for (k in AST.body) {
    if (AST.body.body != undefined) {
      var body = AST.body.body;

      for (var i = 0; i < body.length; i++) {
        handleChildren(body[i]);
      }
    }
  }
}