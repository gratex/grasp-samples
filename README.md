# grasp-samples

This is our collection of various grasp samples.
Organized by individual syntax constructs, but may be reorganized
later. 
It shall give you inspiration on how the grasp 
(maybe also with other AST based tools). 

Can be used in coding practice checks, QA and refactoring.
See also [anti-babel](https://github.com/gratex/anti-babel) for specific refactoring samples.

Any reviews, and more samples are welcomed (Pull Requests please).

Many codes reference dojo APIs as samples, but try to be framework agnostic.

# Original documentation for grasp tools

start here for basic syntax and samples:
http://www.graspjs.com/docs/

# Forked version of grasp

We are maintaining our own [forked version of grasp](https://github.com/gratex/grasp),
so if you want our enhancements (not yet merged to upstream)
npm install from:

	npm install git+https://github.com/gratex/grasp

<!-- 
curl http://www.graspjs.com/docs/syntax-js/ | cheerio "h3" | prefix "## " 
-->
# Syntax Samples

## program (Program)

### AMD detection

Scan your code base for (dojo) [AMD][AMD] and non AMD files. 
As a code reviewer this can give you quick hint about type and consistency 
of code base you are dealing with. It can also help you to minimize the scope of other queries
to specific files.

	# amd
	grasp -w 'program.body > call[callee=(#define,#require)]'   

	# non amd
	grasp -W 'program.body > call[callee=(#define,#require)]'   
	


## ident (Identifier)

Pure re-assignments (x=y) style

	grasp assign[left=ident][right=ident]

Capital Case identifiers

	grasp '#/^[A-Z_]+$/' -r

Starts with __ (private convention in some frameworks)

	grasp '#/^__/' -r	

Usage of undefined

	grasp '#undefined' -r

Returns identifier, often indicates procedural style or other smell (may need to review the code):
	
	grasp 'return.argument(ident)'	

## literal (Literal)

Since s query and e query both have support for more specific literals
(see http://www.graspjs.com/docs/squery/#literals), do we need this ?

	# Literals in if statement (not very practical, see num and str)
	grasp  'if.test!>literal'  

	# literal containing "/"
	grasp 'bi[op=+][left=literal[value~=/^[\/].*/]]' 

	# concat of string with anything (almost always eval, use parametrized strings of builders)
	grasp 'bi[op=+]:matches([left=str],[right=str])'

	# concat of strings containing one of "/","#","?"	
	grasp 'bi[op=+]:matches([left=literal[value~=/[\/#?]/]],[right=literal[value~=/[\/#?]/]])' 

### str

	# dump 'all strings' (omit prop names)
	grasp --no-filename --no-line-number  -o --no-color --no-bold ':not(prop, member) > str' -r

	# strings containing two backslashes, \\, unescaping sysntax, 
	# maybe use String.raw instead ?
	
	grasp -s 'str[value~=/\\/]' 

## empty (EmptyStatement)

	# e.g for(i=0;i<10;i++);
	grasp 'for!>for.body(empty)'
	
Or better, any loop with empty statement or empty body block

	grasp '*!>loop.body(empty,block:not(block! > *))'

## block (BlockStatement)


Coding style

	# adding missing curly braces
	grasp "if.then:not(block)" -R '{{{}}}' -i 

Empty blocks

	grasp 'block:not(block! > *)'

Empty catch blocks

	# TODO: using catch body ?
	grasp 'catch>block:not(block! > *)' -r 

Empty functions

	# empty function (TODO: s query for other variants)	
	grasp -e 'function $name(__){}' 

One Liner blocks
	
	grasp 'block>*:first-child:last-child'

	# one line if else (useless) why not using && || ?
	grasp -e 'if(__){ __ }else{ __ }'

	# specific one liner blocks (coding horror)
	grasp -e 'if(__){ return _bool }else{ return _bool }'


Block containing something

	block.body:matches

Block not containing something

	# useless dojo hitch, hitch(this,f) where f is not using this at all
	grasp "call[callee=member[prop=#hitch]].arguments:nth(1):matches(func-exp).body:not(block! this)" 

	# TODO: useless ES bind 

	# if without else, that has no return inside the if block
	grasp 'if:not([else]).consequent:not(block! return)	

ifs with return in the if block
	
	grasp 'if:matches(if! block.body:matches(return))' 
	
ifs with return in the if block followed by return 

	grasp 'if:matches(if! block.body:matches(return))!~return' 

ifs with return in the if block followed immediately by return 
	
	grasp '*!>if:matches(if! block.body:matches(return))+return' -r

	# TODO: ifs without else, with return in the if block followed immediately by return 

	# calls only one method, if param number is same, then it is useless 
	# maybe false positive if the purpose is to change args number
	grasp -e "__.hitch(__,function() { this.__() })"
 	
promise.done

dojo does not have done function on promise see 
<https://github.com/cujojs/when/blob/master/docs/api.md#promisethen-vs-promisedone>.
This is grasp query for: find those 'f' in codes: when(x,f) or __.then(f),  and 'f' have no return statement inside

	grasp "call[callee=(#when, member[prop=#then])].arguments:last:matches(func-exp).body:not(block! return)"
	
	grasp '(func-exp,func-dec,prop[val=func-exp])!>call[callee=(#when, member[prop=#then])].arguments:last:matches(func-exp).body:not(block! return)' 


## exp-statement (ExpressionStatement)

	# o["y"] = 10; o["y" + name] = 10
	grasp ' exp-statement assign[left=member[computed=true]]' -r

## if (IfStatement)

see also 
<http://refactoring.com/catalog/recomposeConditional.html>, 
<https://github.com/gkz/grasp/issues/38#issuecomment-48367777> for interesting patterns and refactorings.

Oneliner ifs

	# oneliner ifs shall be refactored
	grasp -e 'if(__){__}' 
	grasp -e 'if($x){$y}' -R '{{x}} && ({{y}})' 

Ifs without else

	grasp 'if:not([else])'

Ifs without else and no return 	

TODO: why is this interesting ? motivation please (basically if that are not quick exits).
I do not like these in code, but need to remember why/when we have used this

	grasp 'if:not([else]).consequent:not(block! return)'

If with single return statements 

Usually used as quick exit inside functions or loops 
(in loops it may indicate filter semantics)

	# TODO: better ? we do not like the first: hack
	grasp 'if.consequent.body:first(return)'

Useless else
	
	# if(){throw}else{...code}, can be if{throw}...code (in most cases)
	# no need for else usually, but of course check the code context
	grasp  'if[else].consequent!>throw'

types of tests

	# between
	grasp -e 'if($x > __ && $x < __){_$}'

	# ifs 'involving number' checks
	grasp 'if.test!>num' 

	# checking length
	grasp -e 'if($x && $x.length){_$}' 
	grasp -s '*[test=member[prop=#length]].test' #includes also ternary

	# check if array/string, checks for  non empty array
	# hard to say, missing semantics
	grasp -e 'if(__.length){__}else{__}'

	# typeof used inside ifs
	grasp "if.test unary[op=typeof]" -r
	
	# if(typeof) and throw
	grasp -s 'if[test=* unary[op=typeof]]! throw' -r ../node/lib/

	# typeof used inside else-if
	grasp -s '(if!.test unary[op=typeof]).alternate:matches(if).test unary[op=typeof]'

	# typeof v = "number", "number" = typeof v (TODO: verify, may have false positives)
	grasp -s "
		bi([left='number'],[right='number'])
		([right=unary[op=typeof]],[left=unary[op=typeof]])
	"

If params, sorted by occurrences
	
	# Top 10 'popular' if statements
	# check for style and coding practices used in ifs (long, unreadable, not semantic, ordering , ...)
	grasp -o --no-filename --line-number=false "if.test" | sort | uniq -c | head -n 10

else if (tests in else if statements)

	grasp -s 'if.alternate:matches(if).test'


Nested ifs

	# TODO: refactor to loop 
	grasp "\
	(if.consequent, if.alternate, for.body, for-in.body, while.body, do-while.body, switch.cases, try.block, try.finalizer) \
	(if.consequent, if.alternate, for.body, for-in.body, while.body, do-while.body, switch.cases, try.block, try.finalizer) \
	(if.consequent, if.alternate, for.body, for-in.body, while.body, do-while.body, switch.cases, try.block, try.finalizer) \
	(if.consequent, if.alternate, for.body, for-in.body, while.body, do-while.body, switch.cases, try.block, try.finalizer):not(block! \
	(if.consequent, if.alternate, for.body, for-in.body, while.body, do-while.body, switch.cases, try.block, try.finalizer)) \
	" 

### if patterns (typical shapes of ifs)
	
	# if() throw;  (without {})
	grasp -s 'if[test][consequent=throw]'

	# ifs with any throws inside
	grasp -s 'if! throw' -r ../node/lib/

	# if followed by return;
	grasp '*! > if + return'

	# if(){...; return} return;
	grasp '*! > if:matches(if! block.body:matches(return)) + return' 

	# set propery if not set already, 
	# TODO: refactor to x || ($x=$y)
	grasp -e 'if(!$x){$x=$y}' 

	# cached property (TODO: other cached, memoized patterns)
	grasp -e 'if(! $x){$x=__} return $x'

	# call if exists
	grasp -e 'if($x){$x()}' 
	grasp -e '$X && $X()' 


	# call if function (TODO: if pattern)
	grasp -e 'typeof $X === "function"?$X():$X

	## assign if truth-y
	# TODO: detector for this:
	if (target._editorRow) {
		// editor form
		target = target._editorRow;
	}
	

	## delete if falsy TODO: detector
	## same as assign if truth-y just with delete

## label (LabeledStatement)
## break (BreakStatement)
## continue (ContinueStatement)
## with (WithStatement)
## switch (SwitchStatement)

## return (ReturnStatement)

	# returning true or false
	grasp '(return! true,return! false)'

	## ifs with return boolean in the if block followed by return of boolean
	grasp 'if:matches(if! block.body:matches((return! true,return! false)))!~(return! true,return! false)' 

### returning inlined function or arrow function 

	grasp 'return>(arrow,func-exp)'

## throw (ThrowStatement)

Throwing strings, mostly not a good idea

	# throw 'error1'
	grasp 'throw.argument(str)'

Throwing anything else then string

	grasp 'throw.argument:not(str)'

which can be new Error 
	
	# throw new Error("whatever");
	grasp 'throw.argument(new[callee=#Error])' -r

or even call to Error() as function

	# throw Error("whatever");
	grasp 'throw.argument(call[callee=#Error])'

or something not mentioned yet ?

	grasp 'throw.argument:not(call[callee=#Error],new[callee=#Error],str)' -r

## try (TryStatement)
## while (WhileStatement)
## do-while (DoWhileStatement)
## for (ForStatement)
## for-in (ForInStatement)

	grasp -e '_for_in'

	grasp  'for-in.left'

### for-in with/without and var, let etc...
	
	# for (var key in signals)	
	grasp -s 'for-in.left:matches(var-decs)' 

	# for (key in headers)
	grasp -s 'for-in.left:not(var-decs)' 

	# with let
	grasp -s 'for-in.left:matches(var-decs[kind=let])' <<< 'for(let k in o){}'

### for-in vs Object.entries

	 # why not using Object.entries ?
	 # with -e query but this is quite exact usage
	 grasp -e 'for(var $k in $o){_$;var $v=$o[$k];_$}' <<< 'for(var k in o){x;var v=o[k];y}'

	 # with squery we can be more lax
	 # TODO: but this is too lax, need to match o[k]
	 # but this will match any y=foo[bar]

	 grasp 'for-in! var-dec[init=member[computed=true]],for-in! assign[left=ident][right=member[computed=true]]'  \
	 <<< 'for(let k in o){foo();v=o[k];bar()}'

	 # we want to detect these typical (anti) samples:
	 for (key in headers) {
	 	const entry = headers[key];
	 	processHeader(this, state, entry[0], entry[1], false);
	 }

### for-in with single return 

	# TODO: motivation ?
	grasp 'call[callee=member[obj=#df][prop=#forIn]]! if block.body:matches(return)' 

### Oneliner for-in
	
	grasp 'for-in!.body *:first-child:last-child' 

	# for in with 'single' push
	# TODO: motivation ?
	grasp 'for-in.body>*:first-child:last-child>call[callee=(member[prop=#push])]' 


## debugger (DebuggerStatement)

	## TODO: remove all debugger statements

## func-dec (FunctionDeclaration)

### constructors

	# functions starting with Capitals
	grasp 'func-dec[id=#/^[A-Z]/]'
	# including expressions ,var-dec[id=#/^[A-Z]/][init=*:matches(arrow,func-exp)])'
	grasp 'func-dec[id=#/^[A-Z]/]'

	# Custom Constructor Pattern
	grasp 'func-dec[id=#/^[A-Z]/].body!>return' 

### func-dec.params
	
	# functions with parameters with specific name pattern
	grasp '(func-dec,func-exp).params:matches(#/Html$/i)'  

	# functions without parameters (zero params)
	grasp 'func-dec:not(func-dec!.params)' -r test

### function defined in another function
	
	grasp '(func-dec,func-exp,arrow)! (func-dec,func-exp,arrow)'

## func-exp (FunctionExpression), 

<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function>

	# event handlers declared on dojo widget 
	grasp "call[callee=#declare].args:nth(1)>prop[key=#/^h[A-Z]/][value=func-exp]"  

	# one liner event handlers declared on dojo widget (do we really need them)
	grasp  '(call[callee=#declare].args:nth(1)>prop[key=#/^h[A-Z]/]>func-exp)!.body>*:first-child:last-child'

### Immediately Invoked Function Expression 
see [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE), and Self-Executing Anonymous Function design patterns.

	grasp -s "call[callee=func-exp]" . -r

	# grasp already has iife in systax, equivalent to:
	call[callee=(func-exp, member[obj=func-exp][prop=(#call, #apply)])]

	grasp -s 'program.body>iife!>iife.args(#window)'

	#TODO: other patterns, IIFE module pattern ...
	
## var-decs (VariableDeclaration)

Too many variables assigned in one single var a=0,b=1,c-2,d=3,e=4,f=5; 

	grasp 'var-decs!>var-dec[init]:nth-child(5)'

How many variables are declared on the same line ?
	
	# var a,b,c,d vs var a, var b, var c style (TODO: improve, multi lines)
	grasp "var-decs var-dec" -r | cut -d":" -f1,2 | sort | uniq -c	

Refactoring var x,y,z to var x;var y; var z;

	grasp var-decs --replace '{{var-dec | each before, "var " | join ";" }};'


## var-dec (VariableDeclarator)


Variables usage, Count of (evil) variables per file

	grasp -c "var-dec" 


### var-dec.id

Names of variables, 
can be used to enforce naming conventions, 
check against 'data dictionary' or simply spell check.

	grasp -o "var-dec.id"

	# top 10 favorite variable names
	grasp -o "var-dec.id" -r | cut -d":" -f3 | sort | uniq -c | sort -k1,1nr | head -n10
	
	  92 i
	  32 p
	  31 args
	  30 u
	  25 l
	  20 id
	  19 r
	  18 _this # indicates no bind, no hitch, using manual storage of _this in the code ?
	  15 s
	  15 w

Finding variables with given name

	grasp -o "var-dec[id=#_this]" -r

### var-dec.init

Declarations without init

	# var x,y,z=1; matches x,y
	grasp 'var-dec:not([init])'

Declaring empty object, array

	# echo "var x={},y={};" | 
	grasp 'var-dec[init=obj:not(obj! > prop[key])]' 

	# declaration of arrays
	grasp 'var-dec[init=arr:not(arr! > *)]'
	
	# names of declared arrays variables (check naming conventions)
	grasp -o 'var-dec[init=arr:not(arr! > *)].id' 

	# TODO: nonempty arrays

Function expressions assigned to variable with given name, finding (one of the styles) validation functions

	# var vali*=function(){}
	grasp 'var-dec[id=#/^vali/][init=func-exp].id' 


	grasp-find-function(){
		name="$1"
		shift
		grasp \
			'func-dec[id=#/^'$name'/],var-dec[id=#/^'"$name"'/][init=func-exp],prop[key=#/^'"$name"'/][val=func-exp]' \
			-r "$@"
	}



## this (ThisExpression)

members (props and method names) used in 
this.XXX or this[XXX] constructions

	grasp -o -s 'member[obj=this].prop'

functions without this

	 grasp "func-dec! this" 

functions/methods without this

  	grasp "func-dec:not(func-dec! this)" 

impure functions, "non methods" without return

	grasp 'func-dec:not(func-dec! return):not(funct-dec! this)'

	# impure arrows ?, TODO: better method detection
	grasp  'arrow:not(arrow! return):not(arrow! this)' 

## arr (ArrayExpression)

	# normalizing to array
	grasp -e '__ || []'


	# empty array
	grasp 'arr:not(arr! > *)'

	# array.last(), traditional syntax
	grasp -e '$x[$x.length-1]'


	# ensure array r.messages || (r.messages = []);
	grasp -e '$x || ($x=[])' 					
	grasp -e '{$x || ($x=[]); $x.push(__);}' 

	


	# array normalization (not very nice)
	# TODO: detector + other patterns
	if (lang.isArray(items.type)) {
		items = items.type;
	} else {
		items = [
			items
		];
	}	

## obj (ObjectExpression)

### obj.props

Property with a certain name:

	grasp 'obj.props[key=#columns])'

Objects {} that have Property with a certain name:

	grasp '*!>obj.props[key=#columns])'

	# or (see prop)
	grasp 'obj! > prop[key=#columns]'

Property with a name matching pattern:
	
	grasp 'func-dec[id=#/^vali/]'

Property with a name matching pattern and specified type:

	# {vali*: function(){}}
	grasp 'prop[key=#/^vali/][val=func-exp]' 

## prop (Property)

### prop[kind]

Find getter setter properties	

	grasp "prop[kind=get]" 
    grasp "prop[kind=set]"

For properties defined with defineProperty use this:
	
	 grasp 'call[callee=member[obj=#Object][prop=#defineProperty]].arguments:nth(2):matches(obj!>prop[key=#get])'

	 grasp 'call[callee=member[obj=#Object][prop=#defineProperty]].arguments:nth(2):matches(obj!>prop[key=#set])'    

For properties defined with defineProperties use this:

	grasp 'call[callee=member[obj=#Object][prop=#defineProperties]].arguments:nth(1):matches(obj! > prop > obj>prop[key=#get])' 
	grasp 'call[callee=member[obj=#Object][prop=#defineProperties]].arguments:nth(1)>prop!>obj>prop[key=#get]' 

### prop[key]

Property can be defined as Indentifier or Literal be carefull
when checking for property 'name'

	key=("test",#test)

	echo 'var x={ test :10}'   | grasp 'prop[key=("test",#test)]'
	echo 'var x={"test":10}'   | grasp 'prop[key=("test",#test)]'

other samples here use mostly Identifier syntax 

Changing property syntax (Literal vs Identifier):

	# To refactor columns["b"] to columns.b (fix JSHint errors)
	grasp -e 'columns[_str]' -i -R 'columns.{{_str | str-slice 1, -1 }}'

	# To refactor columns.b to columns["b"] (fix 'reserved' keywords)
	grasp -s "obj.props[key=#b].key" --replace '"b"' -i "$@"

### Objects {} that have Property with a certain name:

	grasp 'obj! > prop[key=#columns]'


### Object without property with some name

	grasp 'obj:not(obj! > prop[key=#test])' 

	# dojo cookies, setting cookie without setting path (good idea ?)
	grasp 'call[callee=(#cookie)].arguments:tail:last:not(obj!>prop[key=#path])'

### Object with property a but without property b

	grasp '(obj!>prop[key=#a]):not(obj! > prop[key=#b])' 
	
	# or
	grasp 'obj! prop[key=#a]:not(prop[key=#a]!~prop[key=#b])' 

### Object with property with property
	
	# echo 'x={o1:{o2:{enum:[1,2,3]}}}', returns o2
	grasp --no-bold --no-color '(obj > prop! > obj > prop[key=(#enum,#type)]).key'

	# echo 'var x={enums:{x:"test", y:{name:"test"}}}' |\
	grasp "prop[key=#enums].value.properties[value=str].value, prop[key=#enums].value.properties[value=obj].value.properties[key=#name].value"	

### Empty object literal {}

	# empty object literals
	grasp 'obj:not(obj! > prop[key])'


### Props but excluding function expressions 
	
	grasp 'obj prop[val!=func-exp]'

## seq (SequenceExpression)

## unary (UnaryExpression)
	
### typeof 

	grasp unary[op=typeof]  
	
	# comparing type of with something (left sided)
	
	grasp 'biop[op="=="].left[op=typeof]' 

	# are we using paranoid === or ==
	
	grasp 'biop[op="==="].left[op=typeof]' 

	# conditional return based on typeof
	# return (typeof that == "string") ? decomp(that) : clone(that);

	grasp "return!.arg unary[op=typeof]" 



	
## bi (BinaryExpression)
	
### bi.op +

	# Naive (uri building detection)
	# TODO: nicer
	grasp 'bi[op=+]:matches([left="/"],[left="?"],[left="#"],[right="/"],[right="?"],[right="#"])' 

	
	# binary ops with 1
	grasp 'bi:matches([left=1],[right=1])'
	
	#bi ops with -1 (TODO: do I really need to check negative numbers this way ?)
	grasp 'bi[right=unary[op=-][argument.value=1]]' 
	
	grasp 'bi:matches([left=1],[right=1],[left=unary[op=-][argument.value=1]],[right=unary[op=-][argument.value=1]])' 
	
	# comparison operatos (TODO: nicer ?)
	grasp 'bi:matches([op="=="],[op="==="],[op="!=="],[op="!="],[op=">"],[op=">="],[op="<"],[op="<="])' 
	
	# biops with left or right being compare
	grasp 'bi:matches([left=call[callee=(#compare, member[prop=#compare])]],[right=call[callee=(#compare, member[prop=#compare])]])' 
	
	# all combine together:
	
	function grasp_compare(){
		Q_METHOD='[left=call[callee=(#compare, member[prop=#compare])]],[right=call[callee=(#compare, member[prop=#compare])]]'
		Q_OP='[op="=="],[op="==="],[op="!=="],[op="!="],[op=">"],[op=">="],[op="<"],[op="<="]'
		Q_VALUE='[left=1],[right=1],[left=unary[op=-][argument=1]],[right=unary[op=-][argument=1]]'
		Q="bi:matches($Q_OP):matches($Q_VALUE):matches($Q_METHOD)"
		
		grasp "$Q" 
	}


## assign (AssignmentExpression)
	
	

	# assign to identified with this syntax: x=p[k];
	grasp 'assign[left=ident][right=member[computed=true]]' <<< "x=p[k];x=p.k"

 
	# assign to identified with this syntax: x=p.k;
	grasp 'assign[left=ident][right=member[computed=false]]' <<< "x=p[k];x=p.k"

	# var x=; and x= is not the same, must grasp for both
	grasp 'var-dec[init=member[computed=true]],assign[left=ident][right=member[computed=true]]'  \
	<<< 'var v=o[k];w=o[k]'

	# setting value of specific property
	# dojo validation set by code
	grasp -e '__.constraints.__=__'

	# copying from one object to another
	grasp 'assign[left=member][right=member]'

## update (UpdateExpression)
## logic (LogicalExpression)

## cond (ConditionalExpression)

### property name, defined with conditional

	# o[disabled?"show":"hide"](), call one of the methods based on condition
	grasp 'member[computed=true][property=cond]' -r

	# refactoring
	grasp -e '$w[$test?"show":"hide"]()' -i -R '{{w}}.set("hidden", !({{test}}))'  

### Useless ternary if

	grasp -e "__ ? true : false"	

## new (NewExpression)

	# dojo, see deferred antipattern
	grasp -e "new Deferred()"


	# arguments to MS proprietary new ActiveXObject
	grasp -s -o 'new[callee=(#ActiveXObject)].arguments'

## call (CallExpression)

### call.callee, call.member

method call x.y() (array.forEach)
	
	grasp -e 'array.forEach(_$)'
	grasp -s 'call[callee=member[obj=#array][prop=#forEach]]' 

method calls x.*()

	grasp -e 'array.$method(_$)'	
	grasp -s 'call[callee=member[obj=#array][prop=*]]'

method calls array.*, or darray.* 

	 grasp -s 'call[callee=member[obj=(#array,#darray)][prop=(#filter,#map,#forEach,#some,#every)]]'

plain function calls, maches f() but not a.f()

	grasp -s 'call.callee:not(member)'


promises, x.then() or when()

	grasp 'call[callee=(#when, member[prop=#then])]'

#### Find call of function or method with given name

This demonstrates finding all Mocha test methods

	# x.it() or it()
	grasp 'call[callee=(#it, member[prop=#it])]' -r

Function or method CALL with specific name and second parameter is function	

	# x.it(__,function(){}) or it(__,function(){})
	grasp "call[callee=(#it, member[prop=#it])].arguments:nth(1):matches(func-exp)" 

Function or method CALL with specific name, second parameter is function and body contains return

	# x.it(__,function(done){ return }) or it(__,function(done){ return }) 
	grasp "call[callee=(#it, member[prop=#it])]! .arguments:nth(1):matches(func-exp! return).params:first" 

Name of method matches on of specified, but is called on something not matching given name:

	grasp 'call[callee=member[obj=:not(#array,#arayUtil,#darray,#df,call[callee=#query])][prop=(#filter,#map,#forEach,#some,#every,#reduce,#reduceRight)]]'

#### Extracting first method param

Test method descriptions (for docs or review)

	grasp -o 'call[callee=(#it, member[prop=#it])].args:nth(0)'


#### Find innerHtml without encoding

	# applies to dojo set.html and our encoder method names
	grasp "call[callee=(obj, [obj=#html][prop=#set])].args:nth(1):not(call[callee=(obj, [obj=(#encHtml, #enc)])])"


#### Count method usage per file

Count number of features (in BDD tests) 

	grasp --no-color -c 'call[callee=(#it, member[prop=#it])]' -r | grep -v ":0$"

### call.arguments

#### Searching for calls with certain signature

	# call with 1 arg (s query is tricky)
	
	grasp -e 'declare(__)'
	grasp -s 'call[callee=#declare]!.args:nth(0):last-child'

	# call with 2 args (s query is tricky)
	
	grasp -e 'declare(__,__)'
	grasp -s 'call[callee=#declare]!.args:nth(1):last-child'
	

	# dojo hitch signatures
	grasp -e "__.hitch(this,__,__)" 
	grasp -e '__.hitch(__,__,__,$others)' 
	grasp -e '__.hitch(this,function(_$) { _$ },__,$others)' 

	# Replace with 3 params, beware flags
	grasp -e "__.replace(__,__,__)"

	# Replace with inline replacer function	
	grasp -e "__.replace(__,function(__){__})"

	# various replace signatures
	grasp -e '__.replace(_str,_str)'
	grasp -e '__.replace(_regex,_str)'

	# argument not literal 
	grasp -s "call[callee=#require].args:not(literal)"

	# argument not string 
	grasp "call[callee=#require].args:not([value=type(String)])"
	grasp "call[callee=#i18n].args:first:not(literal)"

	# dojo require with one param (TODO: add link to docs)
	grasp -e "require(__)" -r .

	# selenium promise api (incorrect)
	grasp -e "promise.all(__,__)" 
	# selenium promise api (correct)
	grasp -e "promise.all(__)"

	# dojo setter of specific property
	grasp -e '__.set(__,"title",__)'

	# indexOf various patterns usage statistics
	queries="$(cat ./test/indexOf.js | rm-comments | grep "indexOf" | cut -d"=" -f2- | trim | sed "s;str[1];__;g ; s;str[2];_$;g ; s/; *$//" )"
	while read q; do c=$(grasp -e "$q" -r . | wc -l); echo "$q|$c"; done <<< "$queries" 

#### Find calls with at least one arguments 

	# TODO: s query

#### Find async it(done) methods, that use done syntax

	# it('stringifies buffer values', function (done) {
	grasp  'call[callee=(#it, member[prop=#it])].arguments:nth(1):matches(func-exp).params:first'

#### Adding the 4th parameter to 3-parameter calls 

	grasp -i -e 'tsta($a,$b,$c)' -R 'tsta({{a}},{{b}},{{c}},"")' 

#### Changing order of params

	grasp -i -e 'tsta($a,$b,$c,$d)' -R 'tsta({{a}},{{c}},{{b}},{{d}})' 

#### 'Collapsing' params

	# get rid of 3rd param, make it part of 2nd param
	grasp -e 'fn($a,$b,$c)' -R 'fn({{a}}, {{b}} + " " + {{c}})'
	grasp -e 'fn($a,$b,$c)' -R 'fn({{a}}, {{c}}.concat({{b}}))'

#### Detecting Nested Function Calls 

	# ((())) style
	# Map(filter) and filter(map) (dojo style)
	grasp "call[callee.prop=(#map)].args:first(call[callee.prop=(#filter)])" 
	grasp "call[callee.prop=(#filter)].args:first(call[callee.prop=(#map)])" 



#### Find parseInt(__,!10)

	# TODO: parseInt() number not between x and y
	grasp 'call[callee=#parseInt]!.arguments:last-child:not(10)' 



## member (MemberExpression)

### member.computed 
	
	grasp 'member[computed=true]' -r

	# o["y"] = 10; o["y" + name] = 10
	grasp ' exp-statement assign[left=member[computed=true]]' -r

	# o[disabled?"show":"hide"](), call one of the methods based on condition
	grasp 'member[computed=true][property=cond]' -r

	# find method, but not method call
	grasp -s '*:not(call)!>member[prop=#pop]' <<< 'arr.pop()' # not match
	grasp -s '*:not(call)!>member[prop=#pop]' <<< 'if(arr.pop)' # match

#### accessing array item by index

	# a[1],a[0] etc...
	grasp 'member[computed=true].prop[value=type(Number)]' < test/data/arrays.js

	# a[i], a[j]
	grasp 'member[computed=true].prop[&type=Identifier]'

	# functions containing hardcoded a[0],a[1] etc...

	grasp '(func-dec,func-exp,arrow)! member[computed=true].prop[value=type(Number)]' < test/data/arrays.js

	# functions using array destructuring instead

	grasp '(func-dec,func-exp,arrow).params[&type=ArrayPattern]' < test/data/arrays.js

## switch-case (SwitchCase)

## catch (CatchClause)

check naming conventions for errors:

	grasp -o -s "catch.param" -r | cut -d ":" -f3 | sort | uniq -c

sample output shows inconsistent naming convention:

	    9 e
	    3 err
	    8 ex

## statement (Statement)

## dec (Declaration)



## exp (Expression)

## clause (Clause)

## biop (BiOp)

## func (Function)

## for-loop (ForLoop)

	# TODO: for loop without i used inside block {}
	# modifying for loops, TODO: refactor to while ?

	# for with one child
	grasp -e 'for(__;__;__){ __ }' 
	
	
	# for with push
	grasp -e 'for(__;__;__){ __.push(_$) }'


## while-loop (WhileLoop)

## loop (Loop)

	# files with many loops 
	grasp --no-color -c 'loop' -r | grep -v ":0$" | sort -t":" -k2,2nr

	# 'size of loops'
	grasp --no-color -c 'loop>*' -r | grep -v ":0$" | sort -t":" -k2,2nr

	# number if ifs inside the loop (sort of complexity metrics, but there are better detectors)
	grasp --no-color -c 'loop if' -r | grep -v ":0$" | sort -t":" -k2,2nr


	# loop with single push (sort of map ?)
	grasp 'loop!.body>*:first-child:last-child>call[callee=(member[prop=#push])]' 

# Literals 

<http://www.graspjs.com/docs/squery/#Literals>

- 2, 'hi', /re/g, true, null, etc. - matches the specified literal.

- num or Number matches all number literals.

- str or String matches all string literals.

- bool or Boolean matches as boolean literals.

- regex or RegExp matches all regex literals.

- null matches all null literals.

- literal or Literal matches all literals in general

# Misc

## Comment out all console.log calls

	grasp -e 'console.log(_$)' -R '///{{}}' -i 

## Subsequent calls of the same function

	## TODO: push push vs push
	## detector for both
	## see http://jsperf.com/pushpush

	# dojo setters accept objects, no need to call X times
	grasp  -e '{_$;$w.set(_$);$w.set(_$);_$}'

	# dojo put-selector, use chaining instead ?
	grasp -e '{var $x=put(__);put($x,__);}'

## Chaining functions

	grasp -e '__.then(_$).then(_$).then(_$)'

	grasp -e '__.replace(_$).replace(_$)'

## Nested function calls

	# nested then (TODO: what is the difference ?)
	grasp "call[callee=member[prop=#then]].args:first! call[callee=member[prop=#then]]"
	grasp "call[callee=member[prop=#then]].args:first:matches(func-exp! call[callee=member[prop=#then]])"

	# TODO: explain
	grasp  "call[callee=(#hitch, member[prop=#hitch])]! .arguments:nth(1):matches(func-exp! call[callee=(#hitch, member[prop=#hitch])])"

## Identity function

	grasp -e 'function __($a){ return $a;}' 

## Cloning objects

Various ways of cloning objects, some of them are useful but some can be avoided (dojo syntax).

	# Clones
	grasp -e '__.mixin({},$_)' 
	grasp -e 'whitelistMixin(__,{},$_)'
	grasp -e 'blacklistMixin(__,{},$_)'

	# TODO: es cloning patterns, more dojo patterns

## toString conversions

	TODO: 

## first-child, last-child
	
### Detect oneliners 
	
	# TODO: maybe there is better way ?	
	grasp 'for-in!.body>*:first-child:last-child'
	
	# oneliner function
	grasp -e 'function(_$){__}'



## regex, RegExp

	
Extracting regexps from code, useful for review, DRY, safety, correctness

	grasp -o 'new[callee=#RegExp].args:first'

	# regexp build from variables, concats (something else then static strings)
	# are they sanitized ?
	
	grasp '*!>new[callee=#RegExp].args:first:not(String)'

	# regexps build from string (useless, use literal form //) 
	# new RegExp("/test/");

	grasp '*!>new[callee=#RegExp].args:first(String)'
	


## Changing Syntax of Properties

Change syntax from a.enum to a["enum"]

	grasp -s "obj.props[key=#enum].key" --replace '"enum"' -i "$@"

Fixes syntax of 'reserved keywords'

	fix_reserved(){
		echo "[BUILD]: fix_reserved" 1>&2
		# Fixes syntax of 'reserved keywords', 
		# rhino even if es5 still complains about them

		grasp -s "obj.props[key=#enum].key" --replace '"enum"' -i "$@"
		grasp -s "member[prop=#enum]" --replace '{{.obj}}["enum"]' -i "$@"

		grasp -s "obj.props[key=#default].key" --replace '"default"' -i "$@"
		grasp -s "member[prop=#default]" --replace '{{.obj}}["default"]' -i "$@"
	}

# node.js (specific) samples

dynamic require (may be interesting because of browserify and others bundlers)

	# <<< "require(mid)" \
	grasp -s "call[callee=#require].args:not(str)"

require inside function (not on top level)

	grasp -s '(func-dec,func-exp,arrow) call[callee=#require]'

finding all asserts (texts)

	grasp "call[callee=(#assert)].arguments:last:matches(str,TemplateLiteral)" 

refactoring assert to assert.equal

	grasp 
		-s 'call[callee=#assert]! bi[op="=="][right=literal]' \
		-R 'assert.equal({{bi.left}}, {{bi.right}})' \
		<<< "assert(a==2)"

readFileSync and other Sync function usage:
	
	grasp -s 'call[callee=(#/Sync/, member[prop=#/Sync/])]'

Excluding minified files from grasping
	
	# uses minimatch pattern
	grasp -e "module.exports" --exclude="**/*.bundle.js,**/*.min.js" ./node_modules

# dojo framework (specific) samples

## Unit tests

We have lot of unit tests for libs and components (widgets) written in [D.O.H][DOH].
But some of them are runnable without UI, using node.js.
To find these test files, use:

	export GLOB_DOH_TESTS= # put some glob here to limit files scope
	grasp -w -e 'has("host-browser") ||  doh.run()' -r $GLOB_DOH_TESTS

## dojo/_base/config usage 

	# find all requires defines that require config and use the config
	grasp -o -s '(*!>call[callee=(#define,#require)].args:first(arr) > "dojo/_base/config").arguments:last member[obj=#config]' 

## dojo has(), dojo feature detection and browser sniffing:

calls to has (detectors usage)

	grasp --no-color --no-bold  -s 'call[callee=#has].args:first' -o -r | cut -d":" -f3 | sort -u
	
has.add, (detector declarations)

	grasp --no-color --no-bold  -s 'call[callee=member[obj=#has][prop=#add]].args:first' -o -r | cut -d":" -f3 | sort -u



## dojo style inheritance (declare)

files using declare, how many components using dojo inheritance do we have ?

	grasp -w "call[callee=#declare]" -r | wc -l
	
not inherited from anything

	grasp -o "call[callee=#declare].args:nth(0):matches(null)"
	
inherited from empty array ?

	grasp -o "call[callee=#declare].args:nth(0):matches(arr:not(arr! > *))" 

first of parents

	grasp -o "call[callee=#declare].args:nth(0).elements:head" 

inherited from more then one

	grasp -o "call[callee=#declare].args:nth(0).elements:nth(1)" 
		
inherited from Grid, parent is grid

	grasp -o "call[callee=#declare].args:nth(0).elements:first:matches(#Grid)" 
	
inherited or mixed with grid

	grasp -o 'call[callee=#declare].args:nth(0)>#Grid' -r . | wc -l

mixed Grid (does it makes sence ?)

	grasp -o 'call[callee=#declare].args:nth(0).elements:tail:matches(#Grid)' -r | wc -l

## dojo event handlers

	grasp -e '__.on(_str,_$)'

on("click")

	grasp -s 'call[callee=member[prop=#on]].args:nth(0):matches("click")' 

dgrid-* events

	grasp -s 'call[callee=member[prop=#on]].args:nth(0):matches(str[value~=/^dgrid-/])'

multiple events <https://dojotoolkit.org/reference-guide/1.10/dojo/on.html#multiple-events>

	grasp -s 'call[callee=member[prop=#on]].args:nth(0):matches(str[value~=/,/])'

extension events (usage) <https://dojotoolkit.org/reference-guide/1.10/dojo/on.html#extension-events>

	grasp -s 'call[callee=member[prop=#on]].args:nth(0):not(str)'

find extension events (impl), very naive:

	grasp -s "return>call[callee=#on]" 

count "event" popularity

	grasp -s -o 'call[callee=member[prop=#on]].args:nth(0)' -r . | cut -d":" -f3 | sort | uniq -c

emiting events (get event name only)
	
	grasp  -o -s 'call[callee=member[obj=this][prop=#emit]].args:nth(0)'

with sample output:

	    205 eventUtil.refreshCompleteData
	    189 "click"
	    168 eventUtil.rowSelectData
	    105 "dgrid-editor-new-add"
	     88 "lov-select"
	     75 eventUtil.rowDeselectData
	     74 "hide"
	     72 eventUtil.dataChange
	     67 "change"

## Extending _Widget

<https://dojotoolkit.org/reference-guide/1.7/dojo/extend.html#extending-widget>

	grasp -s -o 'call[callee=member[prop=#extend]].callee'

## custom widget getters, setters

<https://dojotoolkit.org/reference-guide/1.10/quickstart/writingWidgets.html#custom-setters-getters>


basic syntax:

	grasp -s -o 'call[callee=#declare].args:last.props[key=#/^_set[A-Z].*Attr$/]'


Custom setters 'modifying html':

	grasp -s -o 'call[callee=#declare].args:last.props[key=#/^_set/] ! call[callee=member[obj=#html][prop=#set]]'

Dojo array comprehensions and lambdas

	 grasp -s 'call[callee=member[obj=(#array,#darray)][prop=(#filter,#map,#forEach,#some,#every)]].args:nth(1):matches(str)'

	 # refactor simple dojoArray.map to arrow or lambdas
	 grasp -e '$darray.map($arr,function($x){ return $x.$y;})' \
		-i -R '{{darray}}.map({{arr}},"return {{x}}.{{y}}")' 

amd statistics
	
	# just a basic grasp, needs more post-processing
	grasp --no-multiline-separator --no-bold --no-color -o 'call[callee=(#define,#require)].args:nth(0)'

constraints.pattern (formatters)

	grasp --no-multiline-separator --no-bold --no-color -o 'obj.props[key=#pattern])'

dojo ready usage <https://dojotoolkit.org/reference-guide/1.10/dojo/ready.html>, who uses it with what priority ? debugging and makeing decisions about your number in ready:

	grasp -o -s 'call[callee=#ready].args:first'

[DOH]: https://dojotoolkit.org/reference-guide/1.9/util/doh.html
[AMD]: https://en.wikipedia.org/wiki/Asynchronous_module_definition

# ES.Next

ECMAScript 2015, Classes, do we really want to use classes ? Some people do:

	grasp "ClassDeclaration" -r ./test

inherited from something

	grasp 'ClassDeclaration!.superClass' -r test

not inherited 

	grasp 'ClassDeclaration:not([superClass])' -r test

ES2015 specification, Template Literals

	grasp 'TemplateLiteral' -r test

useless template literals without any expressions (zero expressions)

	grasp 'TemplateLiteral:not(TemplateLiteral!.expressions)' -r test

default parameters:

	grasp '*.params:matches(AssignmentPattern)'

rest parameter 

	# any
	grasp '*.params(RestElement)'

	# rest parameter (only one)
	grasp '*.params:first(RestElement)'

arrow functions using this

	grasp 'arrow! this'

arrow functions without this
	
	grasp 'arrow:not(arrow! this)'	

arrow functions using arguments (from parent function)

	grasp 'ArrowFunctionExpression! #arguments'	

arrow functions with useless return and block

	grasp 'arrow (arrow!>block>return:first-child)' ./test/data/arrows.js

async function declaration
	
	# not working with standard grasp, use our fork

	grasp -s 'func-dec[async=true]'  
	grasp -s 'func-dec[async=false]'  

prefix each function with async

	grasp -s '(FunctionDeclaration,FunctionExpression,ArrowFunctionExpression)[async=true]' -R 'async {{}}'  

prefix non async funcions with async if they call f2()

	grasp '(func-dec,func-exp,arrow)[async=false]! call[callee=(#f2, member[prop=#f2])]' ./test/data/refactor-sync.js -R 'async {{}}'

prefix non await calls of f2 with await

	 grasp '(func-dec,func-exp,arrow)[async=true] *>call[callee=(#f2, member[prop=#f2])]' ./test/data/await.js -R 'await {{}}'

combine the two above as seqence and you have async refactor	

# CLI and config related hints

##  --parser   

default parser config is:

	# (acorn, {locations: true, ecmaVersion: 6, sourceType: 'module', allowHashBang: true})

You may need to switch some of the settings, see next chapters.

### running with 'other' acorn

'Our' grasp comes with outdated acorn, and new one comes with flow parser.
To use updated version of acorn (with ES2016 support), 
specify path relative to grasp:

	grasp -e 'isFinite(__)' --parser='(../../acorn/dist/acorn.js,{locations: true, ecmaVersion: 9, sourceType: 'module', allowHashBang: true})' -r ../node/lib


### --parser sourceType

If you get error like this:

	Error: Could not parse JavaScript from 'mvc\Output.js'. 'with' in strict mode 

Try:

	grasp -W 'program.body > call[callee=(#define,#require)]'  -r \
		--parser '(acorn, {locations: true, ecmaVersion: 6, sourceType: 'script', allowHashBang: true})'


## only filenames
sometimes you only want filenames printed and parseable output (no colors etc.)

	# file containing 'new Worker()'
	grasp --files-with-matches --no-color 'new[callee=(#Worker)]' -r .


