function mult(a) {
    return a*a; 
}

function chained(a,b,c) {

   return 10 - a + b * c;
}


function ternary(a,b) {
   var c = !(a>b) ? a : b;
   return c;
}

function reduced(a,b,c) {
   var d = [a,b,c];
   return d.reduce('add');
}

function soJiffed(a,b,c) {
   var d = 1 + a + b * c;
   var e = [a,b,c];
   var f = e.reduce('add');
   var g = (d > f) ? d : f;
   return g;
 }


 function f(a,b) { return a | b; }
 
 function f(a,b) {b = true;}
 
 function factorial(n) { if (n === 0) { return; } return n * factorial(n-1);}

 