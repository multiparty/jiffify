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

    var cost = operationCosts[fnName];

    for (var k in parent) {
      console.log('k', k);
    }
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