
const Polynomial = require('polynomial');

var operationCosts = {
    'add': 0,
    'subt': 0,
    'mult': '4x',
    'gt': '3x'
  };

module.exports = function(babel) {
  const t = babel.types;

  function calculateCost(path, parent) {

    var fnName = path.node.callee.property.name;

    var cost = operationCosts[fnName];


  }
  

  return {
    visitor: {
      FunctionDeclaration(path) {
        // console.log('path', path)
      },
      CallExpression(path, parent){
        // console.log('PARENT\n', parent)
          calculateCost(path, parent);
      }
    }
  }

};