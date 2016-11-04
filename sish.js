(function() {

// S-ish functional JavaScript
// License: MIT
// Author: Yosbel Marín

var slice = Array.prototype.slice;

// Sish(src: Object): Function
//
// Returns a Sish instance wich is a function that calls functions
// contained in its internal scope, previously extracted from `src`,
// it calls functions using the specified name and the rest of passed parameters.
// The Sish instance has the following notation:
//
//     SishInstance(functionName, params...)
//
// Usage example:
//
//     var src = {
//         log: (msg)=> console.log(msg)
//     }
//     var _ = Sish(src)
//     _('log', 'Calling from Sish')
//
// If the name of the function is provided but no more arguments are
// passed the caller will return a reference to the function,
// in the example case `_('log')('msg')` and `to src.log('msg')` will
// do the same
//
// The Sish object has a property named `scope` which has all callable functions
// using that Sish instance, example:
//
//     _.scope.log('Logging to console')

function Sish(src) {
    var prop, scope;

    scope = {
        'import': function(src, propNames) {
            _import(scope, src, propNames);
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

// Publish

if (typeof exports === 'object')
    module.exports = Sish;
else
    this.Sish = Sish;

}.call(this))