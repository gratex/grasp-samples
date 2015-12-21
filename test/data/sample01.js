/*jshint unused:false, curly:false */// some of them are intended here as minification demos
function f1() {
	return 10;
}

function f2(a) {
	if (a) {
		return 10;
	} else {
		return 20;
	}
}

//Consolidate Conditional Expression
// http://refactoring.com/catalog/consolidateConditionalExpression.html
function f3(a, b) {

	if (a < 10)
		return 0;
	if (b > 10)
		return 0;
	if (a && b)
		return 20;
}

// http://refactoring.com/catalog/recomposeConditional.html
function recomposeConditional(x) {
	x = x ? x : 10;
	var y = x ? x : 10;
}

function mutatatingMapOperation(orig) {

	return orig.map(function(item) {
		item.test = 10;
		return item;
	});
}

function cloningMapOperation(orig) {

	return orig.map(function(item) {
		var lang; // just mock

		var item2 = lang.mixin({}, item, {
			test : 10
		});
		return item2;
	});
}

function uselessIf(x) {
	if (x) {
		return true;
	} else {
		return false;
	}
}
function uselessIf2(form) {

	form.on("submit", function() {
		if (form.validate()) {
			return true; //default submit
		}
		return false;
	});
}
function onelinerIfElse(_onelinerIfElse, _onelinerIfWithReturn, _onelinerIfWithoutReturn, _twolinerIf) {
	if (_onelinerIfElse) {
		return true;
	} else {
		return false;
	}

	if (_onelinerIfWithReturn) {
		return true;
	}

	if (_onelinerIfWithoutReturn) {
		_onelinerIfWithoutReturn = 10;
	}

	if (_twolinerIf) {
		var x = 1;
		var y = 2;
	}
}

function thenWithErrBack() {

	var p, s, e;
	p.then(s, e);
	p.then(s, e).then(s);
	p.then(s, e).then(s, e).othewise(e);
}

//------------------------------ promise.done samples ----------------

function doneMatch() {
	var x, widget, when, redraw;

	when(x, function(disabled) {
		widget.set("disabled", disabled); // shall match
	});
	x.then(function() {
		return "something"; // shall NOT match
	})//
	.then(function() {
		redraw(); //shall match
	});
}

//------------------------------ cookies samples ----------------
var cookie; //mock
function cookiesOk() {

	cookie("", "", { //no match
		path : ""
	});

	cookie(""); //no match

}
function cookiesWithoutPath() {

	cookie("", "", {}); //match
	cookie("", ""); //match

	cookie("", "", { //match
		x : {
			path : ""
		}
	});
}

function uselessHitch() {

	var lang, x;
	lang.hitch(this, function() {
		this.set(); //usefull, this is used
	});

	lang.hitch(this, function() {
		x.set(); //useless
	});
	lang.hitch(this, function() {
		x.set(); //useless
	}, []);

}
function nestedThens() {
	var x, store, lang, role, error;

	// before:
	x.then(lang.hitch(this, function(store) { // match
		return store.getSubStore("List", role.roleId) // load role detail
		.then(function(store) { //match
			return store.query().then(function(results) {
				return {
					data : results
				};
			});
		});
	})).otherwise(error.errbackDialog);

	//after:
	x.then(function(store) {
		return store.getSubStore("List", role.roleId);
	}).then(function(substore) {
		return substore.query();
	}).then(function(queryResults) {
		return {
			data : queryResults
		};
	}).otherwise(error.errbackDialog);

	function before() {
		var store, partner, row, _this;
		return store.getSubStore("Address", partner).then(function(addressStore) {
			return addressStore.getSubStore("History", row.data)//
			.then(function(addressHistoryStore) {
				var histPromise = addressHistoryStore.query(null, {
					clientVector : _this.clientVector
				});
				histPromise.then(function(data) {
					_this.emit("loaded", {
						detail : {
							path : "Partner-Address-History",
							data : data
						}
					});
				});
				return histPromise;
			});
		});
	}

	function after() {
		var store, partner, row, _this, when;

		var histPromise = store.getSubStore("Address", partner).then(function(addressStore) {
			return addressStore.getSubStore("History", row.data);
		}).then(function(addressHistoryStore) {
			return addressHistoryStore.query(null, {
				clientVector : _this.clientVector
			});
		}).then(function(data) {
			emitLoaded(data);
			return data; //pass data as return
		});

		function emitLoaded(data) {
			_this.emit("loaded", {
				detail : {
					path : "Partner-Address-History",
					data : data
				}
			});
		}
	}
	function after2() {

		var store, partner, row, _this, when;

		var data = store.getSubStore("Address", partner).then(function(addressStore) {
			return addressStore.getSubStore("History", row.data);
		}).then(function(addressHistoryStore) {
			return addressHistoryStore.query(null, {
				clientVector : _this.clientVector
			});
		});
		when(data, emitLoaded);
		return data;

		function emitLoaded(data) {
			_this.emit("loaded", {
				detail : {
					path : "Partner-Address-History",
					data : data
				}
			});
		}
	}
	function after3() {

		var store, partner, row, _this, when;

		var data = store.getSubStore("Address", partner).then(function(addressStore) {
			return addressStore.getSubStore("History", row.data);
		}).then(function(addressHistoryStore) {
			return addressHistoryStore.query(null, {
				clientVector : _this.clientVector
			});
		});
		data.then/*done*/(emitLoaded);
		return data;

		function emitLoaded(data) {
			_this.emit("loaded", {
				detail : {
					path : "Partner-Address-History",
					data : data
				}
			});
		}
	}
	function after4() {
		var store, partner, row, _this;
		return store.getSubStore("Address", partner).then(function(addressStore) {
			return addressStore.getSubStore("History", row.data);
		}).then(function(addressHistoryStore) {
			return queryAndEmit(addressHistoryStore);
		});

		function queryAndEmit(addressHistoryStore) {
			// queries given store, emits event and returns original promise of query
			var histPromise = addressHistoryStore.query(null, {
				clientVector : _this.clientVector
			});
			histPromise.then(function(data) {
				_this.emit("loaded", {
					detail : {
						path : "Partner-Address-History",
						data : data
					}
				});
			});
			return histPromise;
		}
	}
}

function stringSplit(fileType) {
	if ("doc,docx,rtf".split(',').indexOf(fileType) !== -1) {

	}
}

function identity(x) {
	return x;
}

//---- event-not-set-null : 0090-Break Circular Reference event=null  ----

// 'e' is NOT used inside handler
// prevet undefined jshint (only for grasp testing, not runable)
var btnNoLeak;

btnNoLeak.on("click", function(e) {
	//code
});

// 'e' is used inside handler
btnNoLeak.on("click", function(e) {
	event.stop(e);
	//code
});

//'e' is used inside handler
btnNoLeak.on("click", function(e) {
	try {
		event.stop(e);
		//code
	} finally {
		e = null; //avoid leaks
	}
});

function setTitle(domAttr, btn, cont) {

	domAttr.set(btn.titleNode, "title", cont.switchTabTitle);
	domAttr.set(btn.titleNode, 'title', cont.switchTabTitle);
}

function innerHtml_concat(n) {

	n.innerHTML += "aaa";
	n.innerHTML = +"bbb";

	n.innerHTML = n.innerHTML + "ccc";
	n.innerHTML = "ddd" + n.innerHTML;

	n.innerHTML = "eee" + n.innerHTML + "eee";
}

function useless_call(x, encode, encoder) {
	encode(x || "");
	encoder.encode(x || "");
}

function nullerrback(p, s) {
	p.then(s, null);
}
var test, it, x;
test.it("test me", function() {
	return x; // this is sync signature or async, OK
});
it("test.me", function() {
	return x.then(); // this is async signature or async, OK
});
it("test.me.async", function(done) { //DETECTED: mixing done
	return x.then(); // and then in code
});

var membership, done, thePayload;
membership.removeFromDb(thePayload).then(function() {
	done();
});

var vali_fnc = function() {

};

function vali_fnc_declr() {

}
var x = {
	vali_property : function() {

	}
};

// 102
var array, form;
var isValid = true;

array.forEach(this._getRpuForms(), function(form) {
	if (!form.validate()) {
		isValid = false;
	}
}, this);

for ( var i = 0; i < 10; i++) {
	if (!form.validate()) {
		isValid = false;
	}
}

function doubleHithcTest(lang) {
	var doubleHithc = {

		queryFunc : lang.hitch(this, function() {
			return lang.hitch(this, function(item) {
				return !this.gridCoverOptions.store.get(item.coverOptCode);
			});
		})
	};
}

function re_test(x) {

	var l = /test/;
	var n1s = new RegExp("/test/");
	var n1v = new RegExp(x);
	var n1f = new RegExp("/test/", "gim");
}

function _replace() {
	"".replace().replace();
}

require({}, function() {

});
require([], function() {

});

var a;
if (a == {}) { //incorect comp with objects (seen in denovius-bi only)

}

var a = 10, x = {};
x.y = a;
10 + 1;

var xx1 = {
	a : 1
};

var xx2 = {
	a : 1,
	b : 2
};


// grasp 'call[callee=#parseInt]!.arguments:last-child:not([value>=2][value<=36])' -r misc/grasp/
parseInt("aaa");
parseInt("aaa", 10);
parseInt("aaa", 0);
parseInt("aaa", 37);
