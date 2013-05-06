var Parser = new require('../lib/expr');
var p = new Parser({el:true});

var run = function (expr, obj) {
    return p.run(p.parse(expr), obj||{});
}
module.exports = {
    'array return':function(test){

        var items = [1,2,3];
        test.equals(run(' myitems', {myitems:items}), items, 'calling func');

        test.done();
    },
    'myitems[0]':function(test){
        var parse = p.parse('myitems[0]');
        test.equals(p.run(parse, {myitems:['a','b','c']}), 'a');
        test.done();
    }
    ,
    'fn:callme':function(test){
        test.equals(run('fn.callme(1)', {fn:{callme:function(){ return 3}}}), 3, 'calling func');
        test.done();
    }
    ,
    'a and b':function(test){
        test.equals(run('1 and 2'), run('1 && 2'), 'Why do you feel?');
        test.done();
    }
    ,
    'a or b':function(test){
        test.equals(run('1 or 2'), run('1 || 2'));
        test.done();
    },
    'a gt b': function (test) {
        test.equals(run('2 gt 1'), true);
        test.equals(!run('1 gt 2'), true);
        test.done();
    }
    ,
    'test empty ': function (test) {
        test.ok(run('empty test', {test: []}), "empty array test");
        test.ok(!run('empty test', {test: [1]}), "not empty array test");
        test.ok(run('empty test', {test: ''}), "empty string test");
        test.ok(run('empty test', {test: null}), "empty null test");
        test.ok(!run('empty test', {test: 'y'}), "not empty string test");
        test.done();
    },
    'b lt a': function (test) {
        test.ok(!run('2 lt 1', {test: []}), '2 gt 1');
        test.ok(run('1 lt 2', {test: []}), '1 gt 2');
        test.done();
    },
    'a ne b': function (test) {
        test.ok(run('1 ne 2'), '1 ne 2');
        test.ok(!run('1 ne 1'), '1 ne 1');

        test.done();
    },
    'a mod b':function(test){
        test.equals(run('3 mod 6'), 3);
        test.done();
    },
    'a div b':function(test){
        test.equals(run('6 div 3'), 2);
        test.done();
    }
}