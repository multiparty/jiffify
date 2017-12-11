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


 function factorial(n) {
     if (n == 1) {
         return 1;
     }
     return n * factorial(n);
 }