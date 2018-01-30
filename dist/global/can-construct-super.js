/*[global-shim-start]*/
(function(exports, global, doEval) {
	// jshint ignore:line
	var origDefine = global.define;

	var get = function(name) {
		var parts = name.split("."),
			cur = global,
			i;
		for (i = 0; i < parts.length; i++) {
			if (!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val) {
		var parts = name.split("."),
			cur = global,
			i,
			part,
			next;
		for (i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if (!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod) {
		if (!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, default: true };
		for (var p in mod) {
			if (!esProps[p]) return false;
		}
		return true;
	};

	var hasCjsDependencies = function(deps) {
		return (
			deps[0] === "require" && deps[1] === "exports" && deps[2] === "module"
		);
	};

	var modules =
		(global.define && global.define.modules) ||
		(global._define && global._define.modules) ||
		{};
	var ourDefine = (global.define = function(moduleName, deps, callback) {
		var module;
		if (typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for (i = 0; i < deps.length; i++) {
			args.push(
				exports[deps[i]]
					? get(exports[deps[i]])
					: modules[deps[i]] || get(deps[i])
			);
		}
		// CJS has no dependencies but 3 callback arguments
		if (hasCjsDependencies(deps) || (!deps.length && callback.length)) {
			module = { exports: {} };
			args[0] = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args[1] = module.exports;
			args[2] = module;
		} else if (!args[0] && deps[0] === "exports") {
			// Babel uses the exports and module object.
			module = { exports: {} };
			args[0] = module.exports;
			if (deps[1] === "module") {
				args[1] = module;
			}
		} else if (!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if (globalExport && !get(globalExport)) {
			if (useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	});
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function() {
		// shim for @@global-helpers
		var noop = function() {};
		return {
			get: function() {
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load) {
				doEval(__load.source, global);
			}
		};
	});
})(
	{},
	typeof self == "object" && self.Object == Object ? self : window,
	function(__$source__, __$global__) {
		// jshint ignore:line
		eval("(function() { " + __$source__ + " \n }).call(__$global__);");
	}
);

/*can-construct-super@3.1.3#can-construct-super*/
define('can-construct-super', [
    'require',
    'exports',
    'module',
    'can-util/js/is-function/is-function',
    'can-util/js/each/each',
    'can-construct'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        var canIsFunction = require('can-util/js/is-function/is-function');
        var canEach = require('can-util/js/each/each');
        var Construct = require('can-construct');
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var isFunction = canIsFunction, fnTest = /xyz/.test(function () {
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
                canEach(getset, function (method) {
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
/*[global-shim-end]*/
(function(global) { // jshint ignore:line
	global._define = global.define;
	global.define = global.define.orig;
}
)(typeof self == "object" && self.Object == Object ? self : window);