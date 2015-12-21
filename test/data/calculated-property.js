var x = 10;
var o = {};

o.x = 10;
o["y"] = 10;

var name;
o["y" + name] = 10;

o[disabled?"hide":"show"]();
