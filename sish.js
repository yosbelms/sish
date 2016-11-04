(function() {

// S-ish functional JavaScript
// License: MIT
// Author: Yosbel Marín

var slice = Array.prototype.slice;

// Sish(src: Object): Function
//
// Returns a function that calls functions of the provided `src`
// using the rest of parameters passed, example:
//
//     var src = {
//         log: (msg)=> console.log(msg)
//     }
//     var _ = Sish(src)
//     _('log', 'Calling from Sish')
//
// if the name of the function is provided and no more arguments are
// provided the caller will return a reference to the function, example:
//
//     _('log') === src.log

function Sish(src) {
    var prop, scope;

    scope = {
        'import': function(src, names) {
            _import(scope, src, names);
        }
    };

    _import(scope, src);

    function call(fname) {
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

    call.scope = scope;
    return call;
}

// _import(scope: Object, src: Object, propNames?: Array)
//
// Copies properties from `src` to `scope` filtered by `propNames`,
// if `propNames` is not provided all own properties of `src` will be copied

function _import(scope, src, propNames) {
    propNames = propNames || Object.keys(src);
    propNames.forEach(function(name) {
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