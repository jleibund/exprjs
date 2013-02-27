
var Parser =  require('../index.js').Parser;
var p = new Parser();

module.exports.testMath = function(done){
//    console.log(p.parse('1+1'));
//    console.log(p.parse('1+2'));
//    console.log(p.parse('1+2*8'));
//    console.log(p.parse('1/2+2*8'));
//    console.log(p.parse('1/2+2*8 + 0x0100'));
//    console.log(p.parse('1/2+(2*8 + 0x0100)'));
    done.done();
}

//module.exports.testLiterals = function(done){
//    console.log(p.parse('1'));
//    console.log(p.parse('"blue"'));
//    console.log(p.parse('null'));
//    console.log(p.parse('true'));
//    console.log(p.parse('false'));
//    console.log(p.parse('"do\?it"'));
//    done.done();
//}
//
//module.exports.testConditionals = function(done){
//    console.log(p.parse('(one && two || three == 7)'));
//    done.done();
//}

module.exports.testAssignment = function(done){




//    console.log(p.parse('1+1'))

//    w.simple(p.parse('(1==1) && (2 == 1) || true'),handlers,null, result);
//    console.log(result)
//
//    w.simple(p.parse('3+6-1'),handlers,null, result);
//    console.log(result)

//    w.simple(p.parse('true'),handlers,null, result);
//    console.log(result)
//    w.simple(p.parse('do(1)'),handlers,null, result);
//    console.log(result)

//    w.simple(p.parse('{one:do(1), two:3, three:[2,3]}'),handlers,null, result);
//    console.log(result)

//    w.simple(p.parse('one.two.three = 3'),handlers,null, result);
//    console.log(result)

//    w.simple(p.parse('one.two.three = (true) ? 3 : 2'),handlers,null, result);
//    console.log(result)





    var input = {
        one: {two:{three:1}}
    }

    var func = {
        myCall: function(){
            return arguments[0] ;
        }
    };

    var parsed = p.parse('myCall(one.two.three) == 1');

    var end = p.run(parsed,input,func);

    console.log('call1: ',end)

    var parsed2 = p.parse('one.two.three ? 4 : 3');

    end = p.run(parsed2,input,func);

    console.log('result',end)

    console.log('call2 one.two.three=',input.one.two.three)


//    console.log( p.parse('.prototype.toString'));
//    console.log( p.parse('.prototype.toString'));
//    console.log( p.parse('Array',input));



    done.done();
}

module.exports.testOther = function(done){
//    console.log(p.parse('one[one.length-1]'));
    done.done();
}

//module.exports.testUnary = function(done){
//    console.log(p.parse('one++'));
//    console.log(p.parse('++one'));
//    done.done();
//}
//
//module.exports.testTernary = function(done){
//    console.log(p.parse('(one) ? two : three'));
//    console.log(p.parse('one = (1==1) ? two : 7'));
//    done.done();
//}
//
//
//module.exports.testObjects = function(done){
//    console.log(p.parse('{}'));
//    console.log(p.parse('{one:two.three, two:1}'));
//    done.done();
//}

module.exports.testCalls = function(done){
//    console.log(p.parse('doIt()'));
//    console.log(p.parse('doIt(1,2)'));
//    console.log(p.parse('doIt(1,"blue")'));
//    console.log(p.parse('doIt(1,obj.prop)'));
//    console.log(p.parse('obj.doIt(1,66)'));
//    console.log(p.parse('obj.doIt(1,66,{one:[1,2,3], two:"blue", three:3})'));
    done.done();
}
