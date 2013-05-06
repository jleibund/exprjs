var requirejs = require('requirejs');
requirejs.config({
    nodeRequire:require,
    baseUrl:__dirname+'/lib'
})
var Parser = requirejs('expr');
module.exports = Parser;