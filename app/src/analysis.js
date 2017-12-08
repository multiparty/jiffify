
const Polynomial = require('polynomial');

// put reduce as 0 bc it unrolls to an expression with all the ops
var operationCosts = {
    'add': '0',
    'subt': '0',
    'mult': '4x',
    'gt': '3x',
    'lt': '3x',
    'not': '0',
    'reduce': '0'
  };


module.exports = function(babel) {
  const t = babel.types;

  function calculateCost(path) {

    var fnName;
    try  {
      fnName = path.node.callee.property.name;
    } catch(TypeError) {
      fnName = path.node.callee.name
    }

    if (fnName in operationCosts) {
      var cost = operationCosts[fnName];      
      return cost;
    } else {
      console.error("Unsupported function found");
    }
    return null;
  }


  function updateGlobalCost(path, cost, functionName) {
    if (path.parentPath === null) {
      var costObject = path.node.costObject;
      if (functionName in costObject) {
        var prevCost = costObject[functionName];
        var newCost = Polynomial(cost).add(Polynomial(prevCost))
        costObject[functionName] = newCost.toString();
      } else {
        costObject[functionName] = cost;
      }    
      return;
    }
    if (t.isFunctionDeclaration(path.node.type)) {
      functionName = path.node.id.name;
    }
    updateGlobalCost(path.parentPath, cost, functionName);
  }

  return {
    visitor: {
      Program(path) {
        path.node.costObject = {};
      },
      CallExpression(path, parent){       
          var cost = calculateCost(path, parent);
          updateGlobalCost(path, cost, null);
      }
    }
  }
};