const Polynomial = require('polynomial');

var operationCosts = {
  'add': '0',
  'subt': '0',
  'mult': 'x(2x + 3) = 2x3 + 3x',
  'gt': '3x',
  'lt': '3x',
  'not': '0', 
  'xor_bit': '4x'
};


module.exports = function (babel) {
  const t = babel.types;


  function calculateCost(path) {
    var operationName;

    try {
      operationName = path.node.callee.property.name;
    } catch(TypeError) {
      operationName = path.node.callee.name;
    }

    console.log(path.node);

    if (operationName in operationCosts) {
      var cost = operationCosts[operationName];
    }


    // if (fnName in operationCosts) {
    //   var cost = operationCosts[fnName];      
    //   return {name: fnName, cost:cost};
    // } else {
    //   console.error("Unsupported function found");
    // }
    // return null;
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
        console.log('cost', cost.cost);

        if (type === 'NumericLiteral') {
          cost.cost = 0;
        }
        if (cost !== null) {
          updateGlobalCost(path, cost.cost, cost.name);          
        }
        // TODO: this should probably be an error
      }
    }
  }
};