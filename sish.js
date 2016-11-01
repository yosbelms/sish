(function() {

// S-ish functional JavaScript
//
// License: MIT
// author: Yosbel Marín

var slice = Array.prototype.slice;

function sish(source) {
    return function sish(fname) {
        var
        fn = (typeof fname === 'string') ? source[fname] : fname;
        if (typeof fn !== 'function') throw fname + ' is not a function';
        return fn.apply(source || {}, slice.call(arguments, 1));
    }
}

// publish
if (typeof exports === 'object')
    module.exports = sish;
else
    this.sish = sish;

}.call(this))