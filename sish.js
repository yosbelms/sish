(function() {

// S-ish functional JavaScript
//
// License: MIT
// author: Yosbel Marín

var slice = Array.prototype.slice;

// return a caller function binded to a `src` object
// if no `src` is provided `this` will be used instead,
// if many `src` are provided all functions will be
// available in the internal `scope` object which will
// receive all properties of the passed `src`
function Sish(src) {
    var prop, scope;

    scope = {
        'import': function(src, names) {
            _import(scope, src, names);
        }
    };

    _import(scope, src);

    // call(Function, args...)
    // executes a function using the provided arguments
    // call(String, args...)
    // finds a property with such name in the `scope` object and executes it
    return function call(fname) {
        var
        fn = (typeof fname === 'string') ?
            scope[fname] :
            fname;

        if (typeof fn !== 'function')
            throw fname + ' is not a function';

        return arguments.length === 1 ?
            fn :
            fn.apply(this, slice.call(arguments, 1));
    }
}

function _import(scope, src, names) {
    names = names || Object.keys(src);
    names.forEach(function(name) {
        prop = src[name];
        scope[name] = (typeof prop === 'function') ?
            prop.bind(src) :
            prop;
    })
}

// publish
if (typeof exports === 'object')
    module.exports = Sish;
else
    this.Sish = Sish;

}.call(this))