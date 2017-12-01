
const Polynomial = require('polynomial');

var operationCosts = {
    'add': '0',
    'subt': '0',
    'mult': '4x',
    'gt': '3x'

    // 'mult': '4x',
    // 'gt': '3x'
  };


module.exports = function(babel) {
  const t = babel.types;

  function calculateCost(path, parent) {

    var fnName = path.node.callee.property.name;

    if (fnName in operationCosts) {
      var cost = operationCosts[fnName];      
      return cost;
    } else {
      console.error("Unsupported function found");
    }
    return null;
  }
  
  // function processBody(body) {
  //   console.log(body);
  // }

  function updateGlobalCost(path, cost, functionName) {
    if (path.parentPath === null) {
      // if (functionName);
      var costObject = path.node.costObject;
      if (functionName in costObject) {
        // update
        var prevCost = costObject[functionName];
        // console.log('prevCost',prevCost, cost);
        var newCost = Polynomial(cost).add(Polynomial(prevCost))
        costObject[functionName] = newCost.toString();
      } else {
        costObject[functionName] = cost;
      }
      console.log('costobj', costObject);
      
      return;
    }
    if (path.node.type === "FunctionDeclaration") {
      functionName = path.node.id.name;
    }

    updateGlobalCost(path.parentPath, cost, functionName);
 
  }


  return {
    visitor: {
      Program(path) {
        path.node.costObject = {};
      },
      FunctionDeclaration(path) {
        // console.log(path.node.body)
      },
      CallExpression(path, parent){
          
          var cost = calculateCost(path, parent);
          console.log('first cost', cost);
          updateGlobalCost(path, cost, null);
      }
    }
  }

};