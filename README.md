exprjs
======

javascript expressions language for safe eval in browser or nodejs
built off of customization of acorn:  http://marijnhaverbeke.nl/acorn/


##Getting Started.
An alternative to eval() supporting javascript syntax for expressiveness and safe execution

Just add exprjs to your package.json, npm install or include lib/expr.js in html script with requirejs

Example:
```javascript
 var P =  require('exprjs');
 var parser = new P();

 var obj1 = {
    one: {two:{three:1}}
 }

 var obj2 = {
    myCall: function(){
        return arguments[0] ;
    }
 };

 var obj3 = {
    one: {two:{three:3}}
 }


 var parsed = parser.parse('myCall(one.two.three) == 1');

 // returns true
 var result = parser.run(parsed,obj1,obj2);

 // using different object input, returns false
 result = parser.run(parsed,obj3,obj2);

 // assignment
 parsed = parser.parse('one.two.three = {one:1, two:"two"}');

 result = parser.run(parsed,obj1,obj2);

 // mathematical expressions
 parsed = parser.parse('1+1*8/4+0x0100');

 result = parser.run(parsed,obj1,obj2);

```

parse() constructs the AST parse tree (can be saved off).  It can be run repeatedly with run() providing different
arguments like obj1, obj2, etc.  The properties and functions of these are the only ones in scope.
