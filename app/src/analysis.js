const Polynomial = require('polynomial');

var operationCosts = {
  'add': '0',
  'subt': '0',
  'mult': '2x+3', //  = 2x3 + 3x
  'gt': '3x',
  'lt': '3x',
  'not': '0', 
  'xor_bit': '4x'
};


module.exports = function (babel) {
  const t = babel.types;


  function calculateCost(path) {
    var operationName;
    var cost = null;
    try {
      operationName = path.node.callee.property.name;
    } catch(TypeError) {
      operationName = path.node.callee.name;
    }

    if (operationName in operationCosts) {
      cost = operationCosts[operationName];
    }

    return cost;
  }


  function updateGlobalCost(path, cost, functionName) {
    if (path.parentPath === null) {
      var costObject = path.node.costObject;
      if (functionName in costObject) {
        var prevCost = costObject[functionName];
        var newCost = Polynomial(cost).add(Polynomial(prevCost));
        costObject[functionName] = newCost.toString();
      } else {
        costObject[functionName] = cost;
      }
      return;
    }
    
    if (path.node.type === 'FunctionDeclaration') {
      functionName = path.node.id.name;
    }
    // Propagate back up to Program level
    updateGlobalCost(path.parentPath, cost, functionName);
  }

  return {
    visitor: {
      Program(path) {
        path.node.costObject = {};
      },
      CallExpression(path, parent){
        var cost = calculateCost(path);
        var type = path.node.arguments[0].type;

        if (type === 'NumericLiteral') {
          cost = 0;
        }
        if (cost !== null) {
          updateGlobalCost(path, cost, null);          
        }
        // TODO: this should probably be an error
      }
    }
  }
};