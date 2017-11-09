const util = require('util');
const babylon = require('babylon');

const code = `
    var x = 5;
`;


var AST = babylon.parse(code);


console.log(util.inspect(AST, false, null));