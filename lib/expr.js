if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function () {
    "use strict";
    var methodRe = /(\s|^)([a-zA-Z_\$][a-zA-Z0-9_\$]*):([a-zA-Z_\$][a-zA-Z0-9_\$]*)\((.*)\)/g;

    /*!
     * Node.JS module "Deep Extend"
     * @version 0.2.5
     * @description Recursive object extending.
     * @author Viacheslav Lotsmanov (unclechu)
     */
    function extend(/*obj_1, [obj_2], [obj_N]*/) {
        if (arguments.length < 1 || typeof arguments[0] !== 'object') {
            return false;
        }

        if (arguments.length < 2) return arguments[0];

        var target = arguments[0];

        // convert arguments to array and cut off target object
        var args = Array.prototype.slice.call(arguments, 1);

        var key, val, src, clone;

        args.forEach(function (obj) {
            if (typeof obj !== 'object') return;

            for (key in obj) {
                if (obj[key] !== void 0) {
                    src = target[key];
                    val = obj[key];

                    if (val === target) continue;

                    if (typeof val !== 'object' || val === null || val instanceof RegExp) {
                        target[key] = val;
                        continue;
                    }

                    if (typeof src !== 'object') {
                        clone = (Array.isArray(val)) ? [] : {};
                        target[key] = extend(clone, val);
                        continue;
                    }

                    if (Array.isArray(val)) {
                        clone = (Array.isArray(src)) ? src : [];
                    } else {
                        clone = (!Array.isArray(src)) ? src : {};
                    }

                    target[key] = extend(clone, val);
                }
            }
        });

        return target;
    };
    /* end copy */

    /*
     Following section is adapted from the acorn parser removing full program capabilities
     like control structures, multi-line programs, loops, this, declarations, etc
     */

    /*
     Copyright (C) 2012 by Marijn Haverbeke <marijnh@gmail.com>

     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"), to deal
     in the Software without restriction, including without limitation the rights
     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the Software is
     furnished to do so, subject to the following conditions:

     The above copyright notice and this permission notice shall be included in
     all copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     THE SOFTWARE.

     Please note that some subdirectories of the CodeMirror distribution
     include their own LICENSE files, and are released under different
     licences.
     */

    var _bracketL = {type: '[', beforeExpr: true},
        _bracketR = {type: ']'},
        _braceL = {type: '{', beforeExpr: true},
        _braceR = {type: '}'},
        _parenL = {type: '(', beforeExpr: true},
        _parenR = {type: ')'},
        _comma = {type: ',', beforeExpr: true},
        _colon = {type: ':', beforeExpr: true},
        _dot = {type: '.'},
        _question = {type: '?', beforeExpr: true};


    var _slash = {binop: 10, beforeExpr: true}, _eq = {isAssign: true, beforeExpr: true};
    var _assign = {isAssign: true, beforeExpr: true}, _plusmin = {binop: 9, prefix: true, beforeExpr: true};
    var _incdec = {postfix: true, prefix: true, isUpdate: true}, _prefix = {prefix: true, beforeExpr: true};
    var _bin1 = {binop: 1, beforeExpr: true}, _bin2 = {binop: 2, beforeExpr: true};
    var _bin3 = {binop: 3, beforeExpr: true}, _bin4 = {binop: 4, beforeExpr: true};
    var _bin5 = {binop: 5, beforeExpr: true}, _bin6 = {binop: 6, beforeExpr: true};
    var _bin7 = {binop: 7, beforeExpr: true}, _bin8 = {binop: 8, beforeExpr: true};
    var _bin10 = {binop: 10, beforeExpr: true};

    var _num = {type: 'num'}, _regexp = {type: 'regexp'}, _string = {type: 'string'},
        _name = {type: 'name'}, _eof = {type: 'eof'};


    var _null = {keyword: 'null', atomValue: null},
        _true = {keyword: "true", atomValue: true},
        _false = {keyword: 'false', atomValue: false},
        _in = {keyword: "in", binop: 7, beforeExpr: true},
        _gt = {keyword: "gt", binop: 7, beforeExpr: true},
        _ge = {keyword: "ge", binop: 7, beforeExpr: true},
        _lt = {keyword: "lt", binop: 7, beforeExpr: true},
        _le = {keyword: "le", binop: 7, beforeExpr: true},
        _ne = {keyword: "ne", binop: 7, beforeExpr: true},
        _eqBin = {keyword: "eq", binop: 7, beforeExpr: true},
        _div = {keyword: "div", binop: 9, prefix: true, beforeExpr: true},
        _mod = {keyword: "mod", binop: 9, prefix: true, beforeExpr: true},
        _and = {keyword: 'and', binop: 9, prefix: true, beforeExpr: true},
        _or = {keyword: 'or', binop: 9, prefix: true, beforeExpr: true},
        _empty = {keyword: 'empty', binop: 7, beforeExpr: true}
        ;

    var keywordTypes = {'null': _null, 'true': _true, 'false': _false, 'in': _in,
        "instanceof": {keyword: "instanceof", binop: 7, beforeExpr: true},
        "typeof": {keyword: "typeof", prefix: true, beforeExpr: true},

        "void": {keyword: 'void', prefix: true, beforeExpr: true},
        "empty": {keyword: 'empty', prefix: true, beforeExpr: true},
        'gt': _gt, 'lt': _lt, 'ne': _ne, 'eq': _eqBin, 'ge': _ge, 'le': _le, 'mod': _mod, 'div': _div,
        'and': _and, 'or': _or
    };

    var lineBreak = /\r\n|[\n\r\u2028\u2029]/g;
    var newline = /[\n\r\u2028\u2029]/;

    // took out slash and semi
    var tokTypes = {bracketL: _bracketL, bracketR: _bracketR, braceL: _braceL, braceR: _braceR,
        parenL: _parenL, parenR: _parenR, comma: _comma, colon: _colon,
        dot: _dot, question: _question, eq: _eq, name: _name, eof: _eof,
        num: _num, regexp: _regexp, string: _string, slash: _slash,
        gt: _gt, ge: _ge, lt: _lt, le: _le, ne: _ne, mod: _mod, div: _div
    };

    for (var kw in keywordTypes) tokTypes[kw] = keywordTypes[kw];


    function makePredicate(words) {
        words = words.split(" ");
        var f = "", cats = [];
        out: for (var i = 0; i < words.length; ++i) {
            for (var j = 0; j < cats.length; ++j)
                if (cats[j][0].length == words[i].length) {
                    cats[j].push(words[i]);
                    continue out;
                }
            cats.push([words[i]]);
        }
        function compareTo(arr) {
            if (arr.length == 1) return f += "return str === " + JSON.stringify(arr[0]) + ";";
            f += "switch(str){";
            for (var i = 0; i < arr.length; ++i) f += "case " + JSON.stringify(arr[i]) + ":";
            f += "return true}return false;";
        }

        if (cats.length > 3) {
            cats.sort(function (a, b) {
                return b.length - a.length;
            });
            f += "switch(str.length){";
            for (var i = 0; i < cats.length; ++i) {
                var cat = cats[i];
                f += "case " + cat[0].length + ":";
                compareTo(cat);
            }
            f += "}";
        } else {
            compareTo(words);
        }
        return new Function("str", f);
    }


    var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/;
    var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
    var nonASCIIidentifierChars = "\u0371-\u0374\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u0620-\u0649\u0672-\u06d3\u06e7-\u06e8\u06fb-\u06fc\u0730-\u074a\u0800-\u0814\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0840-\u0857\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962-\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09d7\u09df-\u09e0\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5f-\u0b60\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2-\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d46-\u0d48\u0d57\u0d62-\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e34-\u0e3a\u0e40-\u0e45\u0e50-\u0e59\u0eb4-\u0eb9\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f41-\u0f47\u0f71-\u0f84\u0f86-\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1029\u1040-\u1049\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u170e-\u1710\u1720-\u1730\u1740-\u1750\u1772\u1773\u1780-\u17b2\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1920-\u192b\u1930-\u193b\u1951-\u196d\u19b0-\u19c0\u19c8-\u19c9\u19d0-\u19d9\u1a00-\u1a15\u1a20-\u1a53\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b46-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1bb0-\u1bb9\u1be6-\u1bf3\u1c00-\u1c22\u1c40-\u1c49\u1c5b-\u1c7d\u1cd0-\u1cd2\u1d00-\u1dbe\u1e01-\u1f15\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2d81-\u2d96\u2de0-\u2dff\u3021-\u3028\u3099\u309a\ua640-\ua66d\ua674-\ua67d\ua69f\ua6f0-\ua6f1\ua7f8-\ua800\ua806\ua80b\ua823-\ua827\ua880-\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8f3-\ua8f7\ua900-\ua909\ua926-\ua92d\ua930-\ua945\ua980-\ua983\ua9b3-\ua9c0\uaa00-\uaa27\uaa40-\uaa41\uaa4c-\uaa4d\uaa50-\uaa59\uaa7b\uaae0-\uaae9\uaaf2-\uaaf3\uabc0-\uabe1\uabec\uabed\uabf0-\uabf9\ufb20-\ufb28\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";
    var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
    var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

    function isIdentifierStart(code) {
        if (code < 65) return code === 36;
        if (code < 91) return true;
        if (code < 97) return code === 95;
        if (code < 123)return true;
        return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
    }

    function isIdentifierChar(code) {
        if (code < 48) return code === 36;
        if (code < 58) return true;
        if (code < 65) return false;
        if (code < 91) return true;
        if (code < 97) return code === 95;
        if (code < 123)return true;
        return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
    }


    var Parser = function (opts) {

        if ((this.isEl = opts && opts.el)) {
            this.isKeyword = makePredicate("null true false instanceof typeof empty gt ge lt le ne eq div mod and or");
        } else {
            this.isKeyword = makePredicate("null true false instanceof typeof");

        }
        this.walker = new Walker();
    }

    /**
     * Parse an expression, save off result for run()
     * @param expr this is the expression
     * @param a callback method wich is passed namespace/function of method;
     */
    Parser.prototype.parse = function (expr, methodCb) {
        if (this.isEl) {
             methodCb ? methodCb : function (_, $0, $1, $2, $3, $4) {
                return $1 + "." + $2 + "(" + $3 + ")";
            };
            expr = expr.replace(methodRe, methodCb);
        }
        this.tok = {pos: 0, end: 0, start: 0, type: null, val: null, regexp: false};
        this.last = {start: 0, end: 0, endLoc: 0};
        this.input = expr + _eof;
        this.inputLen = expr.length;
        this.initTokenState();
        return this.parseTopLevel().body[0];
    }

    /**
     * Run a parsed expression (can run repeatedly on different objects
     * @param expr this is the parsed expression (an AST
     * @param obj1 object you want in scope, note that expressions can modify your object
     * @param obj2 object you want in scope, note that expressions can modify your object
     */
    Parser.prototype.run = function (parsed, obj1, obj2) {
        var clone = extend({}, parsed);
        var args = Array.prototype.slice.call(arguments, 1);
        var input = {refs: args};
        this.walker.simple(clone, handlers, null, input);
        return input.result;
    }

    Parser.prototype.initTokenState = function () {
        this.tok.pos = 0;
        this.skipSpace();
    }

    Parser.prototype.raise = function (pos, message) {
        message += " (" + this.tok.pos + ")";
        var err = new SyntaxError(message);
        err.pos = pos;
        err.raisedAt = this.tok.pos;
        throw err;
    }
    Parser.prototype.finishToken = function (type, val) {
        var tok = this.tok;
        tok.end = tok.pos;
        tok.type = type;
        tok.val = val;
        tok.regexp = type.beforeExpr;
        this.skipSpace();
        return tok;
    }

    Parser.prototype.finishOp = function (type, size) {
        var tok = this.tok;
        var str = this.input.slice(tok.pos, tok.pos + size);
        tok.pos += size;
        this.finishToken(type, str);
    }

    Parser.prototype.skipSpace = function () {
        var tok = this.tok, input = this.input, inputLen = this.inputLen;
        while (tok.pos < inputLen) {
            var ch = input.charCodeAt(tok.pos);
            if (ch === 32) { // ' '
                ++tok.pos;
            } else if (ch === 13) {
                ++tok.pos;
                var next = input.charCodeAt(tok.pos);
                if (next === 10) {
                    ++tok.pos;
                }
            } else if (ch === 10) {
                ++tok.pos;
            } else if (ch < 14 && ch > 8) {
                ++tok.pos;
            } else if ((ch < 14 && ch > 8) || ch === 32 || ch === 160) { // ' ', '\xa0'
                ++tok.pos;
            } else if (ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
                ++tok.pos;
            } else {
                break;
            }
        }
    }

    Parser.prototype.readToken_dot = function () {
        var tok = this.tok, input = this.input;
        var next = input.charCodeAt(tok.pos + 1);
        if (next >= 48 && next <= 57) return this.readNumber(true);
        ++tok.pos;
        return this.finishToken(_dot);
    }

    Parser.prototype.readToken_slash = function () {
        var tok = this.tok, input = this.input;
        var next = input.charCodeAt(tok.pos + 1);
        if (tok.regexp) {
            ++tok.pos;
            return this.readRegexp();
        }
        if (next === 61) return this.finishOp(_assign, 2);
        return this.finishOp(_slash, 1);
    }

    Parser.prototype.readToken_mult_modulo = function () {
        var tok = this.tok, input = this.input;
        var next = input.charCodeAt(tok.pos + 1);
        if (next === 61) return this.finishOp(_assign, 2);
        return this.finishOp(_bin10, 1);
    }

    Parser.prototype.readToken_pipe_amp = function (code) {
        var tok = this.tok, input = this.input;
        var next = input.charCodeAt(tok.pos + 1);
        if (next === code) return this.finishOp(code === 124 ? _bin1 : _bin2, 2);
        if (next === 61) return this.finishOp(_assign, 2);
        return this.finishOp(code === 124 ? _bin3 : _bin5, 1);
    }

    Parser.prototype.readToken_caret = function () {
        var tok = this.tok, input = this.input;
        var next = input.charCodeAt(tok.pos + 1);
        if (next === 61) return this.finishOp(_assign, 2);
        return this.finishOp(_bin4, 1);
    }

    Parser.prototype.readToken_plus_min = function (code) {
        var tok = this.tok, input = this.input;
        var next = input.charCodeAt(tok.pos + 1);
        if (next === code) return this.finishOp(_incdec, 2);
        if (next === 61) return this.finishOp(_assign, 2);
        return this.finishOp(_plusmin, 1);
    }

    Parser.prototype.readToken_lt_gt = function (code) {
        var tok = this.tok, input = this.input;
        var next = input.charCodeAt(tok.pos + 1);
        var size = 1;
        if (next === code) {
            size = code === 62 && input.charCodeAt(tok.pos + 2) === 62 ? 3 : 2;
            if (input.charCodeAt(tok.pos + size) === 61) return this.finishOp(_assign, size + 1);
            return this.finishOp(_bin8, size);
        }
        if (next === 61)
            size = input.charCodeAt(tok.pos + 2) === 61 ? 3 : 2;
        return this.finishOp(_bin7, size);
    }

    Parser.prototype.readToken_eq_excl = function (code) {
        var tok = this.tok, input = this.input;
        var next = input.charCodeAt(tok.pos + 1);
        if (next === 61) return this.finishOp(_bin6, input.charCodeAt(tok.pos + 2) === 61 ? 3 : 2);
        return this.finishOp(code === 61 ? _eq : _prefix, 1);
    }

    Parser.prototype.getTokenFromCode = function (code) {
        var tok = this.tok;
        switch (code) {
            case 46: // '.'
                return this.readToken_dot();
            case 40:
                ++tok.pos;
                return this.finishToken(_parenL);
            case 41:
                ++tok.pos;
                return this.finishToken(_parenR);
            case 44:
                ++tok.pos;
                return this.finishToken(_comma);
            case 91:
                ++tok.pos;
                return this.finishToken(_bracketL);
            case 93:
                ++tok.pos;
                return this.finishToken(_bracketR);
            case 123:
                ++tok.pos;
                return this.finishToken(_braceL);
            case 125:
                ++tok.pos;
                return this.finishToken(_braceR);
            case 58:
                ++tok.pos;
                return this.finishToken(_colon);
            case 63:
                ++tok.pos;
                return this.finishToken(_question);

            case 48: // '0'
                var next = this.input.charCodeAt(tok.pos + 1);
                if (next === 120 || next === 88) return this.readHexNumber();

            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57: // 1-9
                return this.readNumber(false);

            case 34:
            case 39: // '"', "'"
                return this.readString(code);

            case 47: // '/'
                return this.readToken_slash(code);
            case 37:
            case 42: // '%*'
                return this.readToken_mult_modulo();

            case 124:
            case 38: // '|&'
                return this.readToken_pipe_amp(code);

            case 94: // '^'
                return this.readToken_caret();

            case 43:
            case 45: // '+-'
                return this.readToken_plus_min(code);

            case 60:
            case 62: // '<>'
                return this.readToken_lt_gt(code);

            case 61:
            case 33: // '=!'
                return this.readToken_eq_excl(code);

            case 126: // '~'
                return this.finishOp(_prefix, 1);

            default:
                return false;
        }
    }

    Parser.prototype.readToken = function (forceRegexp) {
        this.tok.start = this.tok.pos;
//        if (options.locations) tokStartLoc = new line_loc_t;
        if (forceRegexp) return this.readRegexp();
        if (this.tok.pos >= this.inputLen) return this.finishToken(_eof);

        var code = this.input.charCodeAt(this.tok.pos);
        if (isIdentifierStart(code) || code === 92 /* '\' */) return this.readWord();

        var tok = this.getTokenFromCode(code);

        if (tok === false) {
            var ch = String.fromCharCode(code);
            if (ch === "\\" || nonASCIIidentifierStart.test(ch)) return this.readWord();
            this.raise(this.tok.pos, "Unexpected character '" + ch + "'");
        }
        return tok;
    }

    Parser.prototype.readRegexp = function () {
        var tok = this.tok, input = this.input, inputLen = this.inputLen;
        var content = "", escaped, inClass, start = tok.pos;
        for (; ;) {
            if (tok.pos >= inputLen) this.raise(start, "Unterminated regular expression");
            var ch = input.charAt(tok.pos);
            if (newline.test(ch)) this.raise(start, "Unterminated regular expression");
            if (!escaped) {
                if (ch === "[") inClass = true;
                else if (ch === "]" && inClass) inClass = false;
                else if (ch === "/" && !inClass) break;
                escaped = ch === "\\";
            } else escaped = false;
            ++tok.pos;
        }
        var content = input.slice(start, tok.pos);
        ++tok.pos;
        var mods = this.readWord1();
        if (mods && !/^[gmsiy]*$/.test(mods)) this.raise(start, "Invalid regexp flag");

        return this.finishToken(_regexp, new RegExp(content, mods));
    }

    Parser.prototype.readInt = function (radix, len) {
        var tok = this.tok, start = tok.pos, total = 0, input = this.input;
        for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
            var code = input.charCodeAt(tok.pos), val;
            if (code >= 97) val = code - 97 + 10; // a
            else if (code >= 65) val = code - 65 + 10; // A
            else if (code >= 48 && code <= 57) val = code - 48; // 0-9
            else val = Infinity;
            if (val >= radix) break;
            ++tok.pos;
            total = total * radix + val;
        }
        if (tok.pos === start || len != null && tok.pos - start !== len) return null;

        return total;
    }

    Parser.prototype.readHexNumber = function () {
        var tok = this.tok, input = this.input;
        tok.pos += 2; // 0x
        var val = this.readInt(16);
        if (val == null) this.raise(tok.start + 2, "Expected hexadecimal number");
        if (isIdentifierStart(input.charCodeAt(tok.pos))) this.raise(tok.pos, "Identifier directly after number");
        return this.finishToken(_num, val);
    }

    Parser.prototype.readNumber = function (startsWithDot) {
        var tok = this.tok, input = this.input, inputLen = this.inputLen,
            start = tok.pos, isFloat = false, octal = input.charCodeAt(tok.pos) === 48;
        if (!startsWithDot && this.readInt(10) === null) this.raise(start, "Invalid number");
        if (input.charCodeAt(tok.pos) === 46) {
            ++tok.pos;
            this.readInt(10);
            isFloat = true;
        }
        var next = input.charCodeAt(tok.pos);
        if (next === 69 || next === 101) { // 'eE'
            next = input.charCodeAt(++tok.pos);
            if (next === 43 || next === 45) ++tok.pos; // '+-'
            if (this.readInt(10) === null) this.raise(start, "Invalid number")
            isFloat = true;
        }
        if (isIdentifierStart(input.charCodeAt(tok.pos))) this.raise(tok.pos, "Identifier directly after number");

        var str = input.slice(start, tok.pos), val;
        if (isFloat) val = parseFloat(str);
        else if (!octal || str.length === 1) val = parseInt(str, 10);
        else if (/[89]/.test(str)) this.raise(start, "Invalid number");
//        else if (/[89]/.test(str) || strict) this.raise(start, "Invalid number");
        else val = parseInt(str, 8);
        return this.finishToken(_num, val);
    }

    Parser.prototype.readString = function (quote) {
        var tok = this.tok, input = this.input, inputLen = this.inputLen;
        tok.pos++;
        var out = "";
        for (; ;) {
            if (tok.pos >= inputLen) this.raise(tok.start, "Unterminated string constant");
            var ch = input.charCodeAt(tok.pos);
            if (ch === quote) {
                ++tok.pos;
                return this.finishToken(_string, out);
            }
            if (ch === 92) { // '\'
                ch = input.charCodeAt(++tok.pos);
                var octal = /^[0-7]+/.exec(input.slice(tok.pos, tok.pos + 3));
                if (octal) octal = octal[0];
                while (octal && parseInt(octal, 8) > 255) octal = octal.slice(0, octal.length - 1);
                if (octal === "0") octal = null;
                ++tok.pos;
                if (octal) {
//                    if (strict) raise(tok.pos - 2, "Octal literal in strict mode");
                    out += String.fromCharCode(parseInt(octal, 8));
                    tok.pos += octal.length - 1;
                } else {
                    switch (ch) {
                        case 110:
                            out += "\n";
                            break; // 'n' -> '\n'
                        case 114:
                            out += "\r";
                            break; // 'r' -> '\r'
                        case 120:
                            out += String.fromCharCode(this.readHexChar(2));
                            break; // 'x'
                        case 117:
                            out += String.fromCharCode(this.readHexChar(4));
                            break; // 'u'
                        case 85:
                            out += String.fromCharCode(this.readHexChar(8));
                            break; // 'U'
                        case 116:
                            out += "\t";
                            break; // 't' -> '\t'
                        case 98:
                            out += "\b";
                            break; // 'b' -> '\b'
                        case 118:
                            out += "\v";
                            break; // 'v' -> '\u000b'
                        case 102:
                            out += "\f";
                            break; // 'f' -> '\f'
                        case 48:
                            out += "\0";
                            break; // 0 -> '\0'
                        case 13:
                            if (input.charCodeAt(tok.pos) === 10) ++tok.pos; // '\r\n'
//                        case 10: // ' \n'
//                            if (options.locations) { tokLineStart = tok.pos; ++tokCurLine; }
//                            break;
                        default:
                            out += String.fromCharCode(ch);
                            break;
                    }
                }
            } else {
                if (ch === 13 || ch === 10 || ch === 8232 || ch === 8329) this.raise(tok.start, "Unterminated string constant");
                out += String.fromCharCode(ch); // '\'
                ++tok.pos;
            }
        }
    }

    Parser.prototype.readHexChar = function (len) {
        var n = this.readInt(16, len);
        if (n === null) this.raise(this.tok.start, "Bad character escape sequence");
        return n;
    }

    Parser.prototype.readWord1 = function () {
        var tok = this.tok, input = this.input, inputLen = this.inputLen;
        this.containsEsc = false;
        var word, first = true, start = tok.pos;
        for (; ;) {
            var ch = input.charCodeAt(tok.pos);
            if (isIdentifierChar(ch)) {
                if (this.containsEsc) word += input.charAt(tok.pos);
                ++tok.pos;
            } else if (ch === 92) { // "\"
                if (!this.containsEsc) word = input.slice(start, tok.pos);
                this.containsEsc = true;
                if (input.charCodeAt(++tok.pos) != 117) // "u"
                    this.raise(tok.pos, "Expecting Unicode escape sequence \\uXXXX");
                ++tok.pos;
                var esc = this.readHexChar(4);
                var escStr = String.fromCharCode(esc);
                if (!escStr) this.raise(tok.pos - 1, "Invalid Unicode escape");
                if (!(first ? isIdentifierStart(esc) : isIdentifierChar(esc)))
                    this.raise(tok.pos - 4, "Invalid Unicode escape");
                word += escStr;
            } else {
                break;
            }
            first = false;
        }
        return this.containsEsc ? word : input.slice(start, tok.pos);
    }

    Parser.prototype.readWord = function () {
        var tok = this.tok, input = this.input, inputLen = this.inputLen;
        var word = this.readWord1();
        var type = _name;
        if (!this.containsEsc) {
            if (this.isKeyword(word)) type = keywordTypes[word];
//            else if (options.forbidReserved &&
//                (options.ecmaVersion === 3 ? isReservedWord3 : isReservedWord5)(word) ||
//                strict && isStrictReservedWord(word))
//                raise(tok.start, "The keyword '" + word + "' is reserved");
        }
        return this.finishToken(type, word);
    }

    Parser.prototype.next = function () {
        this.last.start = this.tok.start;
        this.last.end = this.tok.end;
        this.last.endLoc = this.tok.endLoc;
        this.readToken();
    }

    function node_t(start) {
        this.type = null;
        this.start = start;
        this.end = null;
    }

    Parser.prototype.startNode = function () {
        return new node_t(this.tok.start);
    }

    Parser.prototype.startNodeFrom = function (other) {
        var node = new node_t();
        node.start = other.start;
        return node;
    }

    Parser.prototype.finishNode = function (node, type) {
        node.type = type;
        node.end = this.last.end;
        return node;
    }

    Parser.prototype.eat = function (type) {
        if (this.tok.type === type) {
            this.next();
            return true;
        }
    }

    Parser.prototype.expect = function (type) {
        if (this.tok.type === type) this.next();
        else this.unexpected();
    }

    Parser.prototype.unexpected = function () {
        this.raise(this.tok.start, "Unexpected token");
    }

    Parser.prototype.checkLVal = function (expr) {
        if (expr.type !== "Identifier" && expr.type !== "MemberExpression")
            this.raise(expr.start, "Assigning to rvalue");
    }

    Parser.prototype.parseTopLevel = function (program) {
        this.last.start = this.last.end = this.tok.pos;
//        inFunction = strict = null;
        this.labels = [];
        this.readToken();

        var node = program || this.startNode(), first = true;
        if (!program) node.body = [];
        while (this.tok.type !== _eof) {
            var stmt = this.parseStatement();
            node.body.push(stmt);
//            if (first && isUseStrict(stmt)) setStrict(true);
//            first = false;
        }
        return this.finishNode(node, "Program");
    }

    Parser.prototype.parseStatement = function () {
        if (this.tok.type === _slash)
            this.readToken(true);

        var starttype = this.tok.type, node = this.startNode();
        switch (starttype) {
            default:
                var maybeName = this.tok.val, expr = this.parseExpression();
                if (starttype === _name && expr.type === "Identifier" && this.eat(_colon)) {
                    for (var i = 0; i < this.labels.length; ++i)
                        if (this.labels[i].name === maybeName) this.raise(expr.start, "Label '" + maybeName + "' is already declared");
//                    var kind = tok.type.isLoop ? "loop" : tok.type === _switch ? "switch" : null;
//                    labels.push({name: maybeName, kind: kind});
                    this.labels.push({name: maybeName});
                    node.body = this.parseStatement();
                    this.labels.pop();
                    node.label = expr;
                    return this.finishNode(node, "LabeledStatement");
                } else {
                    node.expression = expr;
//                    semicolon();
                    return this.finishNode(node, "ExpressionStatement");
                }
        }
    }

    Parser.prototype.parseExpression = function (noComma, noIn) {
        var expr = this.parseMaybeAssign(noIn);
        if (!noComma && this.tok.type === _comma) {
            var node = this.startNodeFrom(expr);
            node.expressions = [expr];
            while (this.eat(_comma)) node.expressions.push(this.parseMaybeAssign(noIn));
            return this.finishNode(node, "SequenceExpression");
        }
        return expr;
    }

    Parser.prototype.parseMaybeAssign = function (noIn) {
        var left = this.parseMaybeConditional(noIn), tok = this.tok;
        if (tok.type.isAssign) {
            var node = this.startNodeFrom(left);
            node.operator = tok.val;
            node.left = left;
            this.next();
            node.right = this.parseMaybeAssign(noIn);
            this.checkLVal(left);
            return this.finishNode(node, "AssignmentExpression");
        }
        return left;
    }

    Parser.prototype.parseMaybeConditional = function (noIn) {
        var expr = this.parseExprOps(noIn);
        if (this.eat(_question)) {
            var node = this.startNodeFrom(expr);
            node.test = expr;
            node.consequent = this.parseExpression(true);
            this.expect(_colon);
            node.alternate = this.parseExpression(true, noIn);
            return this.finishNode(node, "ConditionalExpression");
        }
        return expr;
    }

    Parser.prototype.parseExprOps = function (noIn) {
        return this.parseExprOp(this.parseMaybeUnary(noIn), -1, noIn);
    }

    Parser.prototype.parseExprOp = function (left, minPrec, noIn) {
        var tok = this.tok, prec = tok.type.binop;
        if (prec != null && (!noIn || tok.type !== _in)) {
            if (prec > minPrec) {
                var node = this.startNodeFrom(left);
                node.left = left;
                node.operator = tok.val;
                this.next();
                node.right = this.parseExprOp(this.parseMaybeUnary(noIn), prec, noIn);
                var node = this.finishNode(node, /^(&&|or|and|\|\||=)$/.test(node.operator) ? "LogicalExpression" : "BinaryExpression");
                return this.parseExprOp(node, minPrec, noIn);
            }
        }
        return left;
    }

    Parser.prototype.parseMaybeUnary = function (noIn) {
        var tok = this.tok;
        if (tok.type.prefix) {
            var node = this.startNode(), update = tok.type.isUpdate;
            node.operator = tok.val;
            node.prefix = true;
            this.next();
            node.argument = this.parseMaybeUnary(noIn);
            if (update) this.checkLVal(node.argument);
//            else if (strict && node.operator === "delete" &&
//                node.argument.type === "Identifier")
//                raise(node.start, "Deleting local variable in strict mode");
            return this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
        }
        var expr = this.parseExprSubscripts();
//        while (tok.type.postfix && !canInsertSemicolon()) {
        while (tok.type.postfix) {
            var node = this.startNodeFrom(expr);
            node.operator = tok.val;
            node.prefix = false;
            node.argument = expr;
            this.checkLVal(expr);
            this.next();
            expr = this.finishNode(node, "UpdateExpression");
        }
        return expr;
    }

    Parser.prototype.parseExprSubscripts = function () {
        return this.parseSubscripts(this.parseExprAtom());
    }

    Parser.prototype.parseSubscripts = function (base, noCalls) {
        if (this.eat(_dot)) {
            var node = this.startNodeFrom(base);
            node.object = base;
            node.property = this.parseIdent(true);
            node.computed = false;
            return this.parseSubscripts(this.finishNode(node, "MemberExpression"), noCalls);
        } else if (this.eat(_bracketL)) {
            var node = this.startNodeFrom(base);
            node.object = base;
            node.property = this.parseExpression();
            node.computed = true;
            this.expect(_bracketR);
            return this.parseSubscripts(this.finishNode(node, "MemberExpression"), noCalls);
        } else if (!noCalls && this.eat(_parenL)) {
            var node = this.startNodeFrom(base);
            node.callee = base;
            node.args = this.parseExprList(_parenR, false);
            return this.parseSubscripts(this.finishNode(node, "CallExpression"), noCalls);
        } else return base;
    }

    Parser.prototype.parseExprAtom = function () {
        var tok = this.tok;
        switch (tok.type) {
//            case _this:
//                var node = startNode();
//                next();
//                return finishNode(node, "ThisExpression");
            case _name:
                return this.parseIdent();
            case _num:
            case _string:
            case _regexp:
                var node = this.startNode();
                node.value = tok.val;
                node.raw = this.input.slice(tok.start, tok.end);
                this.next();
                return this.finishNode(node, "Literal");

            case _null:
            case _true:
            case _false:
                var node = this.startNode();
                node.value = tok.type.atomValue;
                node.raw = tok.type.keyword
                this.next();
                return this.finishNode(node, "Literal");
            case _gt:
            case _ge:
            case _lt:
            case _le:
            case _ne:
            case _eq:
            case _empty:
                var node = this.startNode();
                node.value = tok.type.atomValue;
                node.raw = tok.type.keyword
                this.next()
                return this.finishNode(node, "Expression");

            case _parenL:
//                var tokStartLoc1 = tokStartLoc, tokStart1 = tok.start;
                var tokStart1 = tok.start;
                this.next();
                var val = this.parseExpression();
                val.start = tokStart1;
                val.end = tok.end;
//                if (options.locations) {
//                    val.loc.start = tokStartLoc1;
//                    val.loc.end = tokEndLoc;
//                }
//                if (options.ranges)
//                    val.range = [tokStart1, tok.end];
                this.expect(_parenR);
                return val;

            case _bracketL:
                var node = this.startNode();
                this.next();
                node.elements = this.parseExprList(_bracketR, true, true);
                return this.finishNode(node, "ArrayExpression");

            case _braceL:
                return this.parseObj();

//            case _function:
//                var node = startNode();
//                next();
//                return parseFunction(node, false);

//            case _new:
//                return parseNew();

            default:
                this.unexpected();
        }
    }

    Parser.prototype.parseObj = function () {
        var node = this.startNode(), first = true, sawGetSet = false;
        node.properties = [];
        this.next();
        while (!this.eat(_braceR)) {
            if (!first) {
                this.expect(_comma);
//                if (options.allowTrailingCommas && eat(_braceR)) break;
            } else first = false;

            var prop = {key: this.parsePropertyName()}, isGetSet = false, kind;
            if (this.eat(_colon)) {
                prop.value = this.parseExpression(true);
                kind = prop.kind = "init";
//            } else if (options.ecmaVersion >= 5 && prop.key.type === "Identifier" &&
//                (prop.key.name === "get" || prop.key.name === "set")) {
//                isGetSet = sawGetSet = true;
//                kind = prop.kind = prop.key.name;
//                prop.key = this.parsePropertyName();
//                if (tok.type !== _parenL) this.unexpected();
//                prop.value = this.parseFunction(this.startNode(), false);
            } else this.unexpected();

//            if (prop.key.type === "Identifier" && (strict || sawGetSet)) {
//                for (var i = 0; i < node.properties.length; ++i) {
//                    var other = node.properties[i];
//                    if (other.key.name === prop.key.name) {
//                        var conflict = kind == other.kind || isGetSet && other.kind === "init" ||
//                            kind === "init" && (other.kind === "get" || other.kind === "set");
//                        if (conflict && !strict && kind === "init" && other.kind === "init") conflict = false;
//                        if (conflict) raise(prop.key.start, "Redefinition of property");
//                    }
//                }
//            }
            node.properties.push(prop);
        }
        return this.finishNode(node, "ObjectExpression");
    }

    Parser.prototype.parsePropertyName = function () {
        var tok = this.tok;
        if (tok.type === _num || tok.type === _string) return this.parseExprAtom();
        return this.parseIdent(true);
    }

    Parser.prototype.parseExprList = function (close, allowTrailingComma, allowEmpty) {
//    function parseExprList(close, allowTrailingComma, allowEmpty) {
        var elts = [], first = true, tok = this.tok;
        while (!this.eat(close)) {
            if (!first) {
                this.expect(_comma);
//                if (allowTrailingComma && options.allowTrailingCommas && eat(close)) break;
            } else first = false;

            if (allowEmpty && tok.type === _comma) elts.push(null);
            else elts.push(this.parseExpression(true));
        }
        return elts;
    }

    Parser.prototype.parseIdent = function (liberal) {
        var node = this.startNode(), tok = this.tok;
//        node.name = tok.type === _name ? tok.val : (liberal && !options.forbidReserved && tok.type.keyword) || unexpected();
        node.name = tok.type === _name ? tok.val : (liberal && tok.type.keyword) || this.unexpected();
        this.next();
        return this.finishNode(node, "Identifier");
    }


    /*
     Following section is adapted from the AST walk code removing full program capabilities
     like control structures, multi-line programs, loops, this, declarations, etc
     */

    /*
     Copyright (C) 2012 by Marijn Haverbeke <marijnh@gmail.com>

     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"), to deal
     in the Software without restriction, including without limitation the rights
     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the Software is
     furnished to do so, subject to the following conditions:

     The above copyright notice and this permission notice shall be included in
     all copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     THE SOFTWARE.

     Please note that some subdirectories of the CodeMirror distribution
     include their own LICENSE files, and are released under different
     licences.
     */

    var Walker = function () {
    }

    Walker.prototype.simple = function (node, visitors, base, state) {
//        if (!base) base = exports.base;
        if (!base) base = this.base;
        function c(node, st, override) {
            var type = override || node.type, found = visitors && visitors[type];
            base[type](node, st, c);
            if (found) found(node, st);
        }

        c(node, state);
    };

    // A recursive walk is one where your functions override the default
    // walkers. They can modify and replace the state parameter that's
    // threaded through the walk, and can opt how and whether to walk
    // their child nodes (by calling their third argument on these
    // nodes).
    Walker.prototype.recursive = function (node, state, funcs, base) {
        var visitor = funcs ? exports.make(funcs, base) : base;

        function c(node, st, override) {
            visitor[override || node.type](node, st, c);
        }

        c(node, state);
    };

    function makeTest(test) {
        if (typeof test == "string")
            return function (type) {
                return type == test;
            };
        else if (!test)
            return function () {
                return true;
            };
        else
            return test;
    }

    Walker.prototype.Found = function Found(node, state) {
        this.node = node;
        this.state = state;
    }

    // Find a node with a given start, end, and type (all are optional,
    // null can be used as wildcard). Returns a {node, state} object, or
    // undefined when it doesn't find a matching node.
    Walker.prototype.findNodeAt = function (node, start, end, test, base, state) {
        test = makeTest(test);
        try {
            // todo exports.base
            if (!base) base = this.base;
//            if (!base) base = exports.base;
            var c = function (node, st, override) {
                var type = override || node.type;
                if ((start == null || node.start <= start) &&
                    (end == null || node.end >= end))
                    base[type](node, st, c);
                if (test(type, node) &&
                    (start == null || node.start == start) &&
                    (end == null || node.end == end))
                    throw new Found(node, st);
            };
            c(node, state);
        } catch (e) {
            if (e instanceof Found) return e;
            throw e;
        }
    };

    // Find the innermost node of a given type that contains the given
    // position. Interface similar to findNodeAt.
    Walker.prototype.findNodeAround = function (node, pos, test, base, state) {
        test = makeTest(test);
        try {
            if (!base) base = this.base;
            // todo exports.base
//            if (!base) base = exports.base;
            var c = function (node, st, override) {
                var type = override || node.type;
                if (node.start > pos || node.end < pos) return;
                base[type](node, st, c);
                if (test(type, node)) throw new Found(node, st);
            };
            c(node, state);
        } catch (e) {
            if (e instanceof Found) return e;
            throw e;
        }
    };

    // Find the outermost matching node after a given position.
    Walker.prototype.findNodeAfter = function (node, pos, test, base, state) {
        test = makeTest(test);
        try {
            if (!base) base = this.base;
            // todo exports.base
//            if (!base) base = exports.base;
            var c = function (node, st, override) {
                if (node.end < pos) return;
                var type = override || node.type;
                if (node.start >= pos && test(node, type)) throw new Found(node, st);
                base[type](node, st, c);
            };
            c(node, state);
        } catch (e) {
            if (e instanceof Found) return e;
            throw e;
        }
    };

    // Used to create a custom walker. Will fill in all missing node
    // type properties with the defaults.
    Walker.prototype.make = function (funcs, base) {
        // todo exports.base
//            if (!base) base = exports.base;
        var visitor = {};
        for (var type in base) visitor[type] = base[type];
        for (var type in funcs) visitor[type] = funcs[type];
        return visitor;
    };

    function skipThrough(node, st, c) {
        c(node, st);
    }

    function ignore(node, st, c) {
    }

    // Node walkers.


//    var base = exports.base = {};
    var base = Walker.prototype.base = {};

    base.Program = base.BlockStatement = function (node, st, c) {
        for (var i = 0; i < node.body.length; ++i)
            c(node.body[i], st, "Statement");
    };
    base.Statement = skipThrough;
    base.EmptyStatement = ignore;
    base.ExpressionStatement = function (node, st, c) {
        c(node.expression, st, "Expression");
    };
    base.LabeledStatement = function (node, st, c) {
        c(node.body, st, "Statement");
    };
    base.DebuggerStatement = ignore;

    base.ScopeBody = function (node, st, c) {
        c(node, st, "Statement");
    };

    base.Expression = skipThrough;
//    base.ThisExpression = ignore;
    base.ArrayExpression = function (node, st, c) {
        for (var i = 0; i < node.elements.length; ++i) {
            var elt = node.elements[i];
            if (elt) c(elt, st, "Expression");
        }
    };
    base.ObjectExpression = function (node, st, c) {
        for (var i = 0; i < node.properties.length; ++i)
            c(node.properties[i].value, st, "Expression");
    };
    base.SequenceExpression = function (node, st, c) {
        for (var i = 0; i < node.expressions.length; ++i)
            c(node.expressions[i], st, "Expression");
    };
    base.UnaryExpression = base.UpdateExpression = function (node, st, c) {
        c(node.argument, st, "Expression");
    };
    base.BinaryExpression = base.AssignmentExpression = base.LogicalExpression = function (node, st, c) {
        c(node.left, st, "Expression");
        c(node.right, st, "Expression");
    };
    base.ConditionalExpression = function (node, st, c) {
        c(node.test, st, "Expression");
        c(node.consequent, st, "Expression");
        c(node.alternate, st, "Expression");
    };
    //base.NewExpression = base.CallExpression = function(node, st, c) {
    base.CallExpression = function (node, st, c) {
        c(node.callee, st, "Expression");
        if (node.args) for (var i = 0; i < node.args.length; ++i)
            c(node.args[i], st, "Expression");
    };
    base.MemberExpression = function (node, st, c) {
        c(node.object, st, "Expression");
        if (node.computed) c(node.property, st, "Expression");
    };
    base.EmptyExpression = function (node, st, c) {
        c(node.expression, st, "Expression");

    };
    base.Identifier =  base.Literal = ignore;

    // future objects I may use to add in javascript primitive functions.. e.g. Array.prototype.splice(...)

    var objFuncs = {hasOwnProperty: Object.prototype.hasOwnProperty, isPrototypeOf: Object.prototype.isPrototypeOf, propertyIsEnumerable: Object.prototype.propertyIsEnumerable,
        toString: Object.prototype.toString, toLocaleString: Object.prototype.toLocaleString()};
    var arrayFuncs = {split: Array.prototype.split, splice: Object.prototype.splice, create: Object.prototype.create}
    var stringFuncs = {call: Object.prototype.call, apply: Object.prototype.apply, create: Object.prototype.create}


    // helper function for traversal

    var getTarget = function (field, st, cb) {

        // next lets see its an identifier, if so, its right on one of the state objects
        var isId = field.type == 'Identifier';
        var name = field.name;
        var value, obj, prop;

        var isObj = field.hasOwnProperty('object') && field.hasOwnProperty('property');


        if (isId) {
            // we keep track of how many we found to avoid duplicates in different objects
            var found = 0;

            var len = st.refs && st.refs.length;
            for (var i = 0; i < len; i++) {
                var ref = st.refs[i];
                if (ref && ref[name] != undefined) {
                    obj = ref;
                    prop = name;
                    value = ref[name];
                    found++;
                }
            }
            if (found > 1) throw new Error('environment has duplicate keys named ' + name);
            return cb(value, obj, prop);
        }
        if (isObj) {
            // if we didn't find it we'll try
            obj = field.object && field.object.value;

            if (!obj) {
                var found = 0;

                var len = st.refs && st.refs.length;
                for (var i = 0; i < len; i++) {
                    var ref = st.refs[i];
                    if (ref && ref[field.object.name] != undefined) {
                        obj = ref[field.object.name];
                        found++;
                    }
                }
                if (found > 1) throw new Error('environment has duplicate keys named ' + name);
            }

            prop = field.property && (field.property.name || field.property.value);
            if (obj) {
                value = obj[prop];
            } else {
                throw new Error('no such object ' + obj)
            }
            return cb(value, obj, prop);
        }

        // see if we set a value on the node from a prior operation.
        if (field.hasOwnProperty('value')) return cb(field.value);

    }


    /*
     Following section include the overrides for expression execution on target objects, stored in st.refs
     that produces output on st.result.  Note this modifies AST values inline so nodes must be extended before execution
     */

    var handlers = {
        ExpressionStatement: function (node, st) {
            getTarget(node.expression, st, function (v) {
                st.result = v;
            })
        },
        ObjectExpression: function (node, st) {
            var obj = {};
            if (node.properties) {
                for (var i = 0; i < node.properties.length; i++) {
                    var val = node.properties[i].value;
                    obj[node.properties[i].key.name] = val && val.value;
                }
            }
            node.value = obj;
        },
        SequenceExpression: function (node, st) {
            node.value = (node.expressions && node.expressions.length) ? node.expressions[node.expressions.length - 1].value : null;
        },
        AssignmentExpression: function (node, st) {
//            var operator = node.operator, prefix = node.prefix, obj = node.left.object && node.left.object.value,
//                prop = node.left.property && node.left.property.name || node.left.name, val = node.right.value;

            var operator = node.operator, obj, prop, val;

            getTarget(node.left, st, function (v, o, p) {
                obj = o;
                prop = p;
            });
            getTarget(node.right, st, function (v, o, p) {
                val = v;
            });

            if (!obj)
                throw new Error('cannot operate on variables like "' + prop + '" must be an object in the environment');

            if (operator == '=') {
                obj[prop] = val;
                node.value = val;
            } else {
                throw new Error('operator ' + operator + ' not recognized for assignment operation')
            }
        },
        ConditionalExpression: function (node, st) {
            node.value = (node.test.value) ? node.consequent.value : node.alternate.value;
        },
        UpdateExpression: function (node, st) {
            var obj, prop, value, operator = node.operator, prefix = node.prefix;
            getTarget(node.argument, st, function (val, o, p) {
                obj = o;
                prop = p;
                value = val;
            });
            var newVal = value;
            switch (operator) {
                case '++':
                    newVal = ++obj[prop];
                    break;
                case '--':
                    newVal = --obj[prop];
                    break;
                default :
                    throw new Error('update using operator ' + operator + ' not supported');
            }
            node.value = (prefix) ? newVal : value;
        },
        UnaryExpression: function (node, st) {
            var obj, prop, value, operator = node.operator;
            getTarget(node.argument, st, function (val, o, p) {
                obj = o;
                prop = p;
                value = val;
            });
            var newVal = value;
            switch (operator) {
                case '!':
                    newVal = !obj[prop];
                    break;
                case '~':
                    newVal = ~obj[prop];
                    break;
                case '-':
                    newVal = -obj[prop];
                    break;
                case 'empty':
                    newVal = obj === null || prop === null || obj === undefined || prop === undefined || obj[prop] === null || obj[prop] === undefined || obj[prop].length === 0;
                    break;
                default :
                    throw new Error('unary using operator ' + operator + ' not supported');
            }
            node.value = newVal;
        },
        MemberExpression: function (node, st) {
//            if (!node.value){
            // look it up in state
//                var obj = st[node.object.name];
            var obj, prop, value, operator = node.operator, prefix = node.prefix;
            getTarget(node, st, function (val, o, p) {
                obj = o;
                prop = p;
                value = val;
            });
            node.object.value = obj;
            node.property.value = prop;
            if (obj)
                node.value = obj[prop];
//            }
        },
        Identifier: function (node, st) {
//            if (!node.value){
            // look it up in state
//                var obj = st[node.object.name];
            var obj, prop, value, operator = node.operator, prefix = node.prefix;
            getTarget(node, st, function (val, o, p) {
                obj = o;
                prop = p;
                value = val;
            });

            if (obj && !node.object)
                node.object = {};

            node.object.value = obj;
            if (obj && !node.property)
                node.property = {};

            node.property.value = prop;
            if (obj)
                node.value = obj[prop];
//            }
        },
        CallExpression: function (node, st) {
//            var func = node.callee.name;
//            var found = 0;

            var args = [];
            if (node.args) {
                for (var i = 0; i < node.args.length; i++) {
                    args.push(node.args[i].value);
                }
            }

            var obj, prop;
            getTarget(node.callee, st, function (val, o, p) {
                obj = o;
                prop = p;
            })
            if (typeof obj[prop] == 'function') {
                node.value = obj[prop].apply(obj, args)
            } else {
                throw new Error('property ' + prop + ' on ' + node.callee.name + ' is not a function');
            }
        },
        ArrayExpression: function (node, st) {
            var arr = [];
            if (node.elements) {
                for (var i = 0; i < node.elements.length; i++) {
                    arr.push(node.elements[i].value);
                }
            }
            node.value = arr;
        },
        LogicalExpression: function (node, st) {
            var left, right, operator = node.operator, result = null;
            getTarget(node.left, st, function (val) {
                left = val;
            })
            getTarget(node.right, st, function (val) {
                right = val;
            });
            switch (operator) {
                case 'and':
                case '&&':
                    result = left && right;
                    break;
                case 'or':
                case '||':
                    result = left || right;
                    break;
            }
            node.value = result;
        },
        BinaryExpression: function (node, st) {
            var left, right, operator = node.operator, result = null;
            getTarget(node.left, st, function (val) {
                left = val;
            })
            getTarget(node.right, st, function (val) {
                right = val;
            });
            switch (operator) {
//                case '=':
//                    result = left = right;
//                    break;
                case '+':
                    result = left + right;
                    break;
                case '-':
                    result = left - right;
                    break;
                case '*':
                    result = left * right;
                    break;
                case 'div':
                case '/':
                    result = left / right;
                    break;
                case 'mod':
                case '%':
                    result = left % right;
                    break;
                case 'eq':
                case '==':
                    result = left == right;
                    break;
                case '===':
                    result = left === right;
                    break;
                case 'ne':
                case '!=':
                    result = left != right;
                    break;
                case '!==':
                    result = left !== right;
                    break;
                case 'gt':
                case '>':
                    result = left > right;
                    break;
                case 'lt':
                case '<':
                    result = left < right;
                    break;
                case 'ge':
                case '>=':
                    result = left >= right;
                    break;
                case 'le':
                case '<=':
                    result = left <= right;
                    break;
                case '&':
                    result = left & right;
                    break;
                case '|':
                    result = left | right;
                    break;
                case '^':
                    result = left ^ right;
                    break;
                case '>>':
                    result = left >> right;
                    break;
                case '>>>':
                    result = left >>> right;
                    break;
                case '<<':
                    result = left << right;
                    break;
                case 'and':
                case '&&':
                    result = left && right;
                    break;
                case 'or':
                case '||':
                    result = left || right;
                    break;
                default:
                    throw new Error('operator ' + operator + ' not supported');
            }
            node.value = result;
        }
    };
    Parser.create = function (opts) {
        return new Parser(opts);
    }

    return Parser;

});