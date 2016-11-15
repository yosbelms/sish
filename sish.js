(function() {

// S-ish functional JavaScript
// License: MIT
// Author: Yosbel Marín

// quick referencing native functions
var slice = Array.prototype.slice;

// Sish(src...: Object): Function
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
//     var logger = {
//         log: (msg)=> console.log(msg)
//     };
//
//     var warnner = {
//         warn: (msg) => console.warn(msg)
//     }
//
//     var _ = Sish(logger, warnner)
//
//     _('log', 'Logging from Sish')
//     _('warn', 'Warning from Sish')
//
// A function reference is also valid.
//
//     _(console.log.bind(console), 'Some msg')
//
// If the name of the function is provided but no more arguments are
// passed the caller will return a reference to the function,
// in the example case `_('log')('msg')` and `to src.log('msg')` will
// do the same.
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

        definedHash: {},

        'import': function(src, propName) {
            _import(scope, src, propName, true);
        },

        def: function(varName, value) {
            if (scope[varName] === void 0) {
                scope.definedHash[varName] = 1;
                return alter(scope, varName, value);
            } else {
                throw varName + ' is already defined';
            }
        },

        alter: curry(function(varName, value) {
            var _path, root = scope;

            if (Array.isArray(varName)) {
                _path   = path(root, varName);
                varName = _path.varName;
                root    = _path.scope;
            }

            if (root[varName] === void 0) {
                throw varName + ' has not been defined';
            } else {
                return alter(root, varName, value);
            }
        }),

        exec: function(fname) {
            var
            args = slice.call(arguments);
            args.push(void 0);
            return call.apply(void 0, args);
        },

        getDefined: function(prefix) {
            var ret = {};
            prefix = prefix ? prefix + '.' : '';
            Object.keys(scope.definedHash).forEach(function(key) {
                if (key.indexOf(prefix) === 0) {
                    ret[key.slice(prefix.length)] = scope[key];
                }
            })
            return ret;
        },

        curry: curry,
    };

    // import initial scope
    slice.call(arguments).forEach(function(src) {
        _import(scope, src);
    })

    // constructing instance
    function call(fname) {
        var func, _path;

        if (Array.isArray(fname)) {
            _path = path(scope, fname);
            func = _path.scope[_path.varName];
        } else {
            func = typeof fname === 'string' ? scope[fname] : fname;
        }

        // if only one argument return a reference to the value
        if (arguments.length === 1) {
            return func;
        }

        // throw if is not a function
        if (typeof func !== 'function') {
            throw fname + ' is not a function';
        }

        // call
        return func.apply(this, slice.call(arguments, 1));
    }

    // register scope
    call.scope = scope;

    return call;
}

// ('import', scope: Object, src: Object, propName?: Array|Object|String)
//
// Copies properties from `src` to `scope` filtered by `propName`,
// if `propName` is not provided all own properties of `src` will be copied,
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
//
// Import with namespace by passing in place of string:
//
//     _('import', document, 'doc')
//
//     var el = _('doc.getElementById', 'container')

function _import(scope, src, propName, checkCollision) {
    // if `propName` is an Object copy using alias
    if (typeof propName === 'string') {
        var
        obj    = {},
        prefix = propName + '.';

        obj[propName] = src;

        copyProp(scope, propName, obj, propName, checkCollision);

        Object.keys(src).forEach(function(key) {
            copyProp(scope, prefix + key, src, key, checkCollision);
        })
    } else if (isObject(propName)) {
        Object.keys(propName).forEach(function(key) {
            copyProp(scope, key, src, String(propName[key]), checkCollision);
        })
    } else {
        // reset `propName` if is not Array
        propName = Array.isArray(propName) ? propName : Object.keys(src);
        propName.forEach(function(key) {
            copyProp(scope, key, src, key, checkCollision);
        })
    }
}

// ('exec', varName: String, param...)
//
// Executes the propvided function using the subsequent parameters

// ('alter', varName: String, value: Any)
//
// Sets `varName` located in the Sish scope to `value`. This function is curried.

function alter(scope, varName, value) {
    return scope[varName] = value;
}

// copyProp(dst: Object, dstKey: String, src: Object, srcKey: String, checkCollision)
//
// Reads a property from `src` using `srcKey` and copies it to `dst`
// using `dstKey`. If `checkCollision` is passed as true it throws if
// the property in `dst` is already taken

function copyProp(dst, dstKey, src, srcKey, checkCollision) {
    // check whether the variable is already setted up
    if (checkCollision && dst[dstKey] !== void 0) {
        throw dstKey + ' is already taken';
    }

    var value = src[srcKey];

    // check if undefined
    if (value === void 0) {
        throw srcKey + ' is not defined';
    }

    // if value is a function bind before copy
    dst[dstKey] = typeof value === 'function' ? value.bind(src) : value;
}

// Return a curried version of the function passed
//
//     var curried = _('curry', (a, b, c) => a + b + c)
//     curried(1, 2)(3)

function curry(func) {
    var args = slice.call(arguments);

    if (func.length <= 1) {
        return func;
    }

    if (args.length > func.length) {
        return func.apply(this, args.slice(1));
    }

    return function curriedFunc() {
        return curry.apply(this, args.concat(slice.call(arguments)));
    }
}


function path(scope, path) {
    var varName,
    idx = -1,
    len = path.length - 1;

    varName = path[0];
    while(++idx < len) {
        scope   = scope[varName];
        varName = path[idx + 1];
    }

    return {scope: scope, varName: varName};
}

function isObject(obj) {
    return obj && obj.constructor === Object
}

// expose Sish
if (typeof exports === 'object') {
    module.exports = Sish;
} else {
    this.Sish = Sish;
}

}.call(this))