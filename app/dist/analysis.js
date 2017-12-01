'use strict';

var Polynomial = require('polynomial');

var operationCosts = {
  'add': 0,
  'subt': 0,
  'mult': '4x',
  'gt': '3x'
};

module.exports = function (babel) {
  var t = babel.types;

  function calculateCost(path, parent) {

    var fnName = path.node.callee.property.name;

    if (fnName in operationCosts) {
      var cost = operationCosts[fnName];
    } else {
      console.error("Unsupported function found");
    }

    console.log(parent.plugin.visitor.FunctionDeclaration);
    // for (var k in parent.plugin.visitor.FunctionDeclaration) {
    //   console.log(k)
    // }
    // console.log('parent', parent.visitor);

    // console.log(path.node);
  }

  return {
    visitor: {
      FunctionDeclaration: function FunctionDeclaration(path) {
        // console.log('path', path)
      },
      CallExpression: function CallExpression(path, parent) {
        // console.log('PARENT\n', parent)
        calculateCost(path, parent);
      }
    }
  };
};