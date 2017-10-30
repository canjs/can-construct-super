/* global require, test, stop, start, expect, equal, Promise */
var Construct = require("can-construct-super");
var QUnit = require("steal-qunit");

QUnit.module('can-construct-super');
test('prototype super', function () {
	var A = Construct.extend({
		init: function (arg) {
			this.arg = arg + 1;
		},
		add: function (num) {
			return this.arg + num;
		}
	});
	var B = A({
		init: function (arg) {
			this._super(arg + 2);
		},
		add: function (arg) {
			return this._super(arg + 1);
		}
	});
	var b = new B(1);
	equal(b.arg, 4);
	equal(b.add(2), 7);
});
test('static super', function () {
	var First = Construct.extend({
		raise: function (num) {
			return num;
		}
	}, {});
	var Second = First.extend({
		raise: function (num) {
			return this._super(num) * num;
		}
	}, {});
	equal(Second.raise(2), 4);
});
test('findAll super', function () {
	var Parent = Construct.extend({
		findAll: function () {
			equal(this.shortName, 'child');
			return Promise.resolve();
		},
		shortName: 'parent'
	}, {});
	var Child = Parent.extend({
		findAll: function () {
			return this._super();
		},
		shortName: 'child'
	}, {});
	stop();
	expect(1);
	Child.findAll({});
	start();
});
//!steal-remove-start
// To avoid JSHint complaining about the missing getter
/* jshint ignore:start */
if(Object.getOwnPropertyDescriptor) {
	test("_super supports getters and setters", function () {
		var Person = Construct.extend({
			get age() {
				return 42;
			},

			set name(value) {
				this._name = value;
			},

			get name() {
				return this._name;
			}
		});

		var OtherPerson = Person.extend({
			get age() {
				return this._super() + 8;
			},

			set name(value) {
				this._super(value + '_super');
			}
		});

		var test = new OtherPerson();
		test.base = 2;
		equal(test.age, 50, 'Getter and _super works');
		test.name = 'David';
		equal(test.name, 'David_super', 'Setter ran');
	});
}

QUnit.test("setters not invoked on extension (#9)", function(){

	var extending = true;
	var Base = Construct.extend("Base",{
		set something(value){
			QUnit.ok(!extending, "set not called when not extending");
		},
		get something(){
			QUnit.ok(!extending, "get not called when not extending");
		}
	});

	Base.extend("Extended",{
		something: "value"
	});
	extending = false;
	new Base().something = "foo";
});

QUnit.test("_super isn't always available (#11)", function(){
	var Parent = Construct.extend({
	});

	var Child = Parent.extend({
		init: function () {
			this._super();
			ok(true);
		}
	});
	new Child();
});

QUnit.test("_super should work for sealed instances", function () {
	var A = Construct.extend({
		init: function (arg) {
			this.arg = arg + 1;
		},
		add: function (num) {
			return this.arg + num;
		}
	});
	var B = A({
		init: function (arg) {
			this._super(arg + 2);
		},
		add: function (arg) {
			return this._super(arg + 1);
		}
	});
	var b = new B(1);
	Object.seal(b);
	equal(b.arg, 4, 'should instantiate properly');
	equal(b.add(2), 7, 'should call methods properly');
});
