/*jshint unused:false */
var test = function() {
	var y, multiliner, multiliner_no_ret, oneliner_no_ret, oneliner_ret, if_with_else;

	if (multiliner) {
		y = 10;
		return y;
	}

	if (multiliner_no_ret) {
		y = 10;
		y = 20;
	}

	if (oneliner_no_ret) {
		y = 10;
	}

	if (oneliner_ret) {
		return y;
	}

	if (if_with_else) {
		return y;
	} else {
		y = 10;
	}
};
var x;
if (x > 20 && x < 20) {
}
var a;
if (a.length) {
	a;
} else {
	a = [
		a
	];
}

function containsOnlyIf() {
	var test;
	if (test) {

	}
}

function shallBeQuickExit() {
	var test;
	if (test) {
		test;
	}
	return false;
}