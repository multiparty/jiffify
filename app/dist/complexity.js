"use strict";

module.exports = function (babel) {
    var t = babel.types;

    return {
        visitor: {
            BinaryExpression: function BinaryExpression(path) {
                console.log("Hi!!");
            },
            CallExpression: function CallExpression(path) {
                console.log("HI!");
            }
        }
    };
};