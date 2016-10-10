/*can-construct-super@3.0.0-pre.0#can-construct-super*/
var can = require('can-util');
var Construct = require('can-construct');
var isFunction = can.isFunction, fnTest = /xyz/.test(function () {
        return this.xyz;
    }) ? /\b_super\b/ : /.*/, getset = [
        'get',
        'set'
    ], getSuper = function (base, name, fn) {
        return function () {
            var tmp = this._super, ret;
            this._super = base[name];
            ret = fn.apply(this, arguments);
            this._super = tmp;
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
Construct._overwrite = function (addTo, base, name, val) {
    addTo[name] = isFunction(val) && isFunction(base[name]) && fnTest.test(val) ? getSuper(base, name, val) : val;
};
module.exports = Construct;