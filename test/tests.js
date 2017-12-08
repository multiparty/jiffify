'use strict';

var expect = require('chai').expect;
var jiffify = require('../app/src/run');

describe('#successCases', function(){
  // it('If statement', function() {
  //   var code = 'function f(a,b){ var a = !(a>b) ? a : b; return a;}';
  //   var result = jiffify.parseCode(code);

  //   var output = 'function f(a, b) {var a = !a.gt(b) ? a : b; return a;})';
  //   expect(result.ast.error).to.equal(undefined);
  //   // expect(result.code.trim()).to.equal(output);
    
  //   // check cost
  // });

  it('Boolean', function() {
    var code = 'function f(a) {var x = true}';
    var result = jiffify.parseCode(code);
    expect(result.code.includes(1)).to.equal(true);

    code = 'function f(a) {var y = 1; if (y===true) {var x = true}}';    
    result = jiffify.parseCode(code);
  });
});

// describe('#errorCases', function() {
//   it('For statement', function() {
//     var code = 'function f(a) { for (var i = 0; i < 10; i++) { var v = i;}}';

//     var result = jiffify.parseCode(code);
//     expect(result.ast.error.length).to.equal(1);
//     expect(result.ast.error[0].text).to.equal('ForStatements are not supported');
//   });

//   it ('Overwriting secret share', function() {
//     var code = 'function f(a,b) {var b = true;}';
//     var result = jiffify.parseCode(code);
//     expect(result.ast.error.length).to.equal(1);
//     expect(result.ast.error[0].name).to.equal("Overwriting");
    
//   });
// });
