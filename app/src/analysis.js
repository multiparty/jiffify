
const Polynomial = require('polynomial');

var operationCosts = {
    'add': '0',
    'subt': '0',
    'mult': '4x',
    'gt': '3x',
    'lt': '3x',
    'not': '0'
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




return {
  visitor: {
    Program(path) {
      path.node.error = [];
    },
    BinaryExpression(path){
      bin_rec_transform(path);
    },
    ForStatement(path) {
      var err = createErrorObj('ForStatement', path.node.loc, 'ForStatements are not supported');
      addError(path.parentPath, err);
    },
    ConditionalExpression(path){
      if (t.isVariableDeclarator(path.parent)) {
        tern_conditional(path);
      }
      else {
        // not part of a variable declaration (is it just an invalid use or are there other cases?)
        console.log("Skipped!");
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
    },
    Identifier(path) {
      var node = path.node;
      // check if identifier is an actual param
      if (checkParam(path, node.name)) {
        var conditional = checkControlLeakage(path.parentPath, node.name);  
        if (conditional) {
          var err = createErrorObj('Leakage', path.node.loc, 'Information leakage from secret share nested in conditional');
          addError(path.parentPath, err);
        } 