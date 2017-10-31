/*can-construct-super@3.1.2#can-construct-super*/
define([
    'require',
    'exports',
    'module',
    'can-util',
    'can-construct'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        var can = require('can-util');
        var Construct = require('can-construct');
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var isFunction = can.isFunction, fnTest = /xyz/.test(function () {
                return this.xyz;
            }) ? /\b_super\b/ : /.*/, getset = [
                'get',
                'set'
            ], getSuper = function (base, name, fn) {
                return function () {
                    var hasExistingValue = false;
                    var existingValue;
                    var prototype = getPrototypeOf(this);
                    var existingPrototypeValue = prototype._super;
                    if (hasOwnProperty.call(this, '_super')) {
                        hasExistingValue = true;
                        existingValue = this._super;
                        delete this._super;
                    }
                    prototype._super = base[name];
                    var ret = fn.apply(this, arguments);
                    prototype._super = existingPrototypeValue;
                    if (hasExistingValue) {
                        this._super = existingValue;
                    }
                    return ret;
                };
            };
        Construct._defineProperty = function (addTo, base, name, descriptor) {
            var _super = Object.getOwnPropertyDescriptor(base, name);
            if (_super) {
                can.each(getset, function (method) {
                    if (isFunction(_super[method]) && isFunction(descriptor[method])) {
                        descriptor[method] = getSuper(_super, method, descriptor[method]);
                    } else if (!isFunction(descriptor[method])) {
                        descriptor[method] = _super[method];
                    }
                });
            }
            Object.defineProperty(addTo, name, descriptor);
        };
        var getPrototypeOf = Object.getPrototypeOf || function (obj) {
            return obj.__proto__;
        };
        var getPropertyDescriptor = Object.getPropertyDescriptor || function (subject, name) {
            if (name in subject) {
                var pd = Object.getOwnPropertyDescriptor(subject, name);
                var proto = getPrototypeOf(subject);
                while (pd === undefined && proto !== null) {
                    pd = Object.getOwnPropertyDescriptor(proto, name);
                    proto = getPrototypeOf(proto);
                }
                return pd;
            }
        };
        Construct._overwrite = function (addTo, base, name, val) {
            var baseDescriptor = getPropertyDescriptor(base, name);
            var baseValue = baseDescriptor && baseDescriptor.value;
            Object.defineProperty(addTo, name, {
                value: isFunction(val) && isFunction(baseValue) && fnTest.test(val) ? getSuper(base, name, val) : val,
                configurable: true,
                enumerable: true,
                writable: true
            });
        };
        module.exports = Construct;
    }(function () {
        return this;
    }(), require, exports, module));
});