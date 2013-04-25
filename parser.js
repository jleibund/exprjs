var requirejs = require('requirejs');
requirejs.config({
    nodeRequire:require,
    baseUrl:__dirname+'/lib'
})

module.exports = requirejs('expr')