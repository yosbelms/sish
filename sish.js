(function() {

// S-ish functional JavaScript
// License: MIT
// Author: Yosbel Marín

// quick referencing native functions
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
// Also a function reference can be passed
//
//     _(console.log.bind(console), 'Some msg')
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
//

function Sish(src) {
    var scope;

    // set defaults
    scope = {
        'import': function(src, propNames) {
            _import(scope, src, propNames);
        }
    };

    // import initial scope
    _import(scope, src);

    // constructing instance
    function call(fname) {
        var func = typeof fname === 'string' ? scope[fname] : fname;

        // throw if is not a function
        if (typeof func !== 'function') {
            throw fname + ' is not a function';
        }

        // if only one argument return a reference to the function, apply
        return arguments.length === 1 ? func : func.apply(this, slice.call(arguments, 1));
    }

    // register scope
    call.scope = scope;

    return call;
}

// ('import', scope: Object, src: Object, propNames?: Array|Object)
//
// Copies properties from `src` to `scope` filtered by `propNames`,
// if `propNames` is not provided all own properties of `src` will be copied,
// example:
//
//     _('import', console, ['log', 'warn'])
//
//     _('log', 'Some message')
//     _('warn', 'Warrrning!')
//
// Import as alias by using an object as filter:
//
//     _('import', document, {'byId': 'getElementById'})
//
//     var el = _('byId', 'container')

function _import(scope, src, propNames) {
    // if `propNames` is an Object copy using alias
    if (propNames && propNames.constructor === Object) {
        Object.keys(propNames).forEach(function(key) {
            assign(scope, key, src, String(propNames[key]));
        })
    } else {
        // reset `propNames` if is not Array
        propNames = Array.isArray(propNames) ? propNames : Object.keys(src);
        propNames.forEach(function(key) {
            assign(scope, key, src, key);
        })
    }
}

// assign(scope: Object, scopeKey: String, src: Object, srcKey: String)
//
// Reads a property from `src` using `srcKey` and assigns it to `scope`
// using `scopeKey`

function assign(scope, scopeKey, src, srcKey) {
    var value = src[srcKey];

    // check if undefined
    if (value === void 0) {
        throw srcKey + ' is not defined';
    }

    // if value is a function bind before assign
    scope[scopeKey] = typeof value === 'function' ? value.bind(src) : value;
}

// expose Sish
if (typeof exports === 'object') {
    module.exports = Sish;
} else {
    this.Sish = Sish;
}

}.call(this))