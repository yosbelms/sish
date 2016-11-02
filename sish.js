(function() {

// S-ish functional JavaScript
//
// License: MIT
// author: Yosbel Marín

var slice = Array.prototype.slice;

// return a caller binded to a `source` object
// if no `source` is provided `this` will be used instead
function sish(source) {

    // call(Function, args...)
    // executes a function using the provided arguments
    // call(String, args...)
    // finds a property with such name in the `source` object and executes it
    return function call(fname) {
        var
        fn = (typeof fname === 'string') ?
            source[fname] :
            fname;

        if (typeof fn !== 'function')
            throw fname + ' is not a function';

        return arguments.length === 1 ?
            fn :
            fn.apply(source || this, slice.call(arguments, 1));
    }
}

// publish
if (typeof exports === 'object')
    module.exports = sish;
else
    this.sish = sish;

}.call(this))