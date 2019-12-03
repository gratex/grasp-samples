let arr = [1, 2, 3];
let x = arr[1];

arr[x];

let o = {};
let y = o["1"];

const old = (arr) => arr[0] + arr[1];
const modern = ([name, surname]) => name + surname;

function modern2([name, surname]) { return name + surname };

function oldf(arr) {
  arr[0] + arr[1];
}
const oldE = function oldf(arr) {
  arr[0] + arr[1];
}

/*
"init": {
,
  "property": {
    "type": "Literal",
    "start": 33,
    "end": 34,
    "value": 1,
    "raw": "1"
  },
  "computed": true
}
{
"init": {
  
  "property": {
    "type": "Literal",
    "start": 61,
    "end": 64,
    "value": "1",
    "raw": "\"1\""
  },
  "computed": true
}
}
]


*/