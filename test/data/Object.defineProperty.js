// grasp 'call[callee=member[obj=#Object][prop=#defineProperty]]'  test/data/Object.defineProperty.js
// grasp 'call[callee=member[obj=#Object][prop=#defineProperty]].arguments:nth(2):matches(obj)'
// FINAL:
//    grasp 'call[callee=member[obj=#Object][prop=#defineProperty]].arguments:nth(2):matches(obj!>prop[key=#get])' 
Object.defineProperty({}, "a", {
  set: function() {

  },
  get: function() {

  }
});
Object.defineProperty({}, "b", {
  value: 10
});

// grasp 'call[callee=member[obj=#Object][prop=#defineProperties]].arguments:nth(1):matches(obj! > prop > obj>prop[key=#get])' test/data/Object.defineProperty.js
// grasp 'call[callee=member[obj=#Object][prop=#defineProperties]].arguments:nth(1)>prop!>obj>prop[key=#get]' test/data/Object.defineProperty.js

Object.defineProperties({}, {
  a: {
    set: function() {},
    get: function() {}
  },
  b: {
    value: 10
  }
});