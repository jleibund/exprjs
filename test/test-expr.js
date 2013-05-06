
var Parser =  require('../index'), p = new Parser();
var run = function(expr){
    return p.run(p.parse(expr),obj1)
}

var obj1 = {
    one:1,
    two:'two',
    three:{},
    four:{one:1},
    five:function(){ return arguments; },
    six:{
        one:function() {
            return 1;
        },
        two:function(){
            return 'string'
        },
        three:function(){
            return {one:1};
        },
        four:function(){
            return true;
        }
    },
    seven:function(){
        return false;
    },
    unary:0
};

module.exports.testMath = function(test){
    test.equal(run('1+1'),2);
    test.equal(run('1+2'),3);
    test.equal(run('1+2*8'),17);
    test.equal(run('1/2+2*8'),16.5);
    test.equal(run('1/2+2*8 + 0x0001'),17.5);
    test.done();
}

module.exports.testLiterals = function(test){
    test.equal(run('1'),1);
    test.equal(run('"blue"'),'blue');
    test.equal(run('null'),null);
    test.equal(run('true'),true);
    test.equal(run('false'),false);
    test.equal(run('"do\?it"'),'do\?it');
    test.done();
}

module.exports.testLogicals = function(test){
    test.equal(run('one == one'),true);
    test.equal(run('one != one'),false);
    test.equal(run('one > one'),false);
    test.equal(run('one \< one'),false);
    test.equal(run('one \<= one'),true);
    test.equal(run('one >= one'),true);
    test.equal(run('two == two'),true);
    test.equal(run('two === two'),true);
    test.equal(run('two !== two'),false);
    test.equal(run('one && two'),'two');
    test.equal(run('two && one'),1);
    test.equal(run('true && false'),false);
    test.equal(run('true && (false || true)'),true);
    test.done();
}

module.exports.testUnary = function(test){
    test.equal(run('++unary'),1);
    test.equal(run('unary++'),1);
    test.equal(run('--unary'),1);
    test.equal(run('unary--'),1);
    test.equal(run('!unary'),true);
    test.equal(run('unary'),0);
    test.done();
}

module.exports.testAssignment = function(test){

    test.equal(run('three.f1=1'),1);
    test.equal(run('three.f1'),1);
    test.equal(run('three.f2=2'),2);
    test.equal(run('++three.f2'),3);
    test.equal(run('three.f1 = three.f1 + three.f2'),4);

    run('three.f3 = {}')

    test.equal(run('three.f3.one=1'),1);
    test.equal(run('three.f3').one,1);

    test.equal(run('three.f3.one= (true)?  33: 44'),33);




    var input = {
        one: {two:{three:1}}
    }

    var input2 = {
        one: {two:{three:3}}
    }

    var func = {
        myCall: function(){
            return arguments[0] ;
        }
    };

    test.done();
}

module.exports.testOther = function(test){
//    console.log(p.parse('one[one.length-1]'));
    test.equal(run('"good".match(/good/)')[0],'good');
    test.done();
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
