# grasp-samples

This is our collection of various grasp samples.
Organized by individual syntax constructs, but may be reorganized
later. 
It shell give you inspiration on how the grasp 
(maybe also with other AST based tools). 

Can be used in coding practice checks, QA and refactoring.
See also [anti-babel]() for specific refactoring samples.

Any reviews, and more samples are welcomed (Pull Requests please).

Many codes reference dojo APIs as samples, but try to be framework agnostic.

<!-- 
curl http://www.graspjs.com/docs/syntax-js/ | cheerio "h3" | prefix "## " 
-->

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


## literal (Literal)

Since s query and e query both have support for more specific literals
(see http://www.graspjs.com/docs/squery/#literals), do we need this ?

	# Literals in if statement (not very practical, see num and str)
	grasp  'if.test!>literal'  




## empty (EmptyStatement)


## block (BlockStatement)


### Coding style

	# adding missing curly braces
	grasp "if.then:not(block)" -R '{{{}}}' -i 

### Empty blocks

	grasp 'block:not(block! > *)'

Empty catch blocks

	# TODO: using catch body ?
	grasp 'catch>block:not(block! > *)' -r 

### Empty functions

	# empty function (TODO: s query for other variants)	
	grasp -e 'function $name(__){}' 

### One Liner blocks
	
	# one line if else (useless) why not using && || ?
	grasp -e 'if(__){ __ }else{ __ }'


	# specific one liner blocks (coding horror)
	grasp -e 'if(__){ return _bool }else{ return _bool }'

### Block containing something

	block.body:matches

	# ifs with return in the if block
	grasp 'if:matches(if! block.body:matches(return))' 
	
	# ifs with return in the if block followed by return 
	grasp 'if:matches(if! block.body:matches(return))!~return' 

	# ifs with return in the if block followed immediately by return 
	grasp '*!>if:matches(if! block.body:matches(return))+return' -r

	# TODO: ifs without else, with return in the if block followed immediately by return 

### Block not containing something

	# useless dojo hitch, hitch(this,f) where f is not using this at all
	grasp "call[callee=member[prop=#hitch]].arguments:nth(1):matches(func-exp).body:not(block! this)" 

	# TODO: useless ES bind 
	

## expatement (ExpressionStatement)
## if (IfStatement)

### Oneliner ifs

	# oneliner ifs shall be refactored
	grasp -e 'if(__){__}' 
	grasp -e 'if($x){$y}' -R '{{x}} && ({{y}})' 

### Ifs without else

	grasp 'if:not([else])'

### If with single return statements 

Usually used as quick exit inside functions or loops 
(in loops it may indicate filter semantics)

	# TODO: better ? we do not like the first: hack
	grasp 'if.consequent.body:first(return)'

### Ifs without else and no return 	

TODO: why is this interesting ? motivation please (basically if that are not quick exits).
I do not like these in code, but need to remember why/when we have used this

	grasp 'if:not([else]).consequent:not(block! return)'

### Useless else
	
	# if(){throw}else{...code}, can be if{throw}...code (in most cases)
	# no need for else usually, but of course check the code context
	grasp  'if[else].consequent!>throw'

### if(x.length) checking for length

	# check if array/string, checks for  non empty array
	# hard to say, missing semantics
	grasp -e 'if(__.length){__}else{__}'


#### Ternary IF statements

Useless ternary if

	grasp -e "__ ? true : false" 
	# TODO: add refactoring

The most commonly used ternary IF form

	grasp -e '$x ? $x : __' 




### If params sorted by occurrences
	
	# Top 10 'popular' if statements
	# TODO: motivation, sample
	grasp -s -o --no-filename --line-number=false "if.test" | sort | uniq -c | head -n 10

## label (LabeledStatement)
## break (BreakStatement)
## continue (ContinueStatement)
## with (WithStatement)
## switch (SwitchStatement)
## return (ReturnStatement)
## throw (ThrowStatement)
## try (TryStatement)
## while (WhileStatement)
## do-while (DoWhileStatement)
## for (ForStatement)
## for-in (ForInStatement)


#### forIn with single return 

	# TODO: motivation ?
	grasp 'call[callee=member[obj=#df][prop=#forIn]]! if block.body:matches(return)' 

### Oneliner for-in
	
	grasp -s 'for-in!.body *:first-child:last-child' 

	# for in with 'single' push
	# TODO: motivation ?
	grasp -s 'for-in.body>*:first-child:last-child>call[callee=(member[prop=#push])]' 


## debugger (DebuggerStatement)

	## TODO: remove all debugger statements

## func-dec (FunctionDeclaration)

### func-dec.params
	
	# functions with parameters with specific name pattern
	grasp '(func-dec,func-exp).params:matches(#/Html$/i)'  


## func-exp (FunctionExpression)

	# event handlers declared on dojo widget 
	grasp "call[callee=#declare].args:nth(1)>prop[key=#/^h[A-Z]/][value=func-exp]"  

	# one liner event handlers declared on dojo widget (do we really need them)
	grasp  '(call[callee=#declare].args:nth(1)>prop[key=#/^h[A-Z]/]>func-exp)!.body>*:first-child:last-child'


## var-decs (VariableDeclaration)

## var-dec (VariableDeclarator)

### Variables usage

Count of (evil) variables per file

	grasp -c "var-dec" 

How many variables are declared on the same line ?
	
	# var a,b,c,d vs var a, var b, var c style (TODO: improve, multi lines)
	grasp "var-decs var-dec" -r | cut -d":" -f1,2 | sort | uniq -c

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

### Declaring empty object, array

	# echo "var x={},y={};" | 
	grasp 'var-dec[init=obj:not(obj! > prop[key])]' 

	# declaration of arrays
	grasp 'var-dec[init=arr:not(arr! > *)]'
	
	# names of declared arrays variables (check naming conventions)
	grasp -o 'var-dec[init=arr:not(arr! > *)].id' 

	# TODO: nonempty arrays

### Function expressions assigned to variable with given name

finding (one of the styles) validation functions

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

## arr (ArrayExpression)

	# normalizing to array
	grasp -e '__ || []'



	# empty array
	grasp 'arr:not(arr! > *)'

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

### Objects {} that have Property with a certain name:

	grasp 'obj! > prop[key=#columns]'


### Object without property with some name

	grasp 'obj:not(obj! > prop[key=#test])' 

### Object with property a but without property b

	grasp '(obj!>prop[key=#a]):not(obj! > prop[key=#b])' 
	
	# or
	grasp 'obj! prop[key=#a]:not(prop[key=#a]!~prop[key=#b])' 
	

### Empty object literal {}

	# empty object literals
	grasp 'obj:not(obj! > prop[key])'


### Computed property names ES6 

Finding "object[__] = something"

	# TODO: fine tune and exclude some patterns
	grasp -e '__[_exp]=__;' -r 
	
	grasp -s ' exp-statement assign[left=member[computed=true]]' -r


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

	# typeof used inside ifs
	# TODO: motivation ? 
	grasp "if.test unary[op=typeof]" -r
	
	
## bi (BinaryExpression)
	
### bi.op +

	# Naive (uri building detection)
	# TODO: nicer
	grasp -s 'bi[op=+]:matches([left="/"],[left="?"],[left="#"],[right="/"],[right="?"],[right="#"])' 

## assign (AssignmentExpression)

	# setting value of specific property
	# dojo validation set by code
	grasp -e '__.constraints.__=__'
	# set constraints alternative
	grasp -e '__.set("constraints", _$)'

## update (UpdateExpression)
## logic (LogicalExpression)
## cond (ConditionalExpression)
## new (NewExpression)

Extracting regexps from code, useful for review, DRY, safety, correctness

	grasp -o 'new[callee=#RegExp].args:first'

	# regexp build from variables, concats (something else then static strings)
	# are they sanitized ?
	
	grasp '*!>new[callee=#RegExp].args:first:not(String)'

	# regexps build from string (useless, use literal form //) 
	# new RegExp("/test/");

	grasp '*!>new[callee=#RegExp].args:first(String)'

## call (CallExpression)

### call.callee, call.member

	# Promises, x.then() or when()
	grasp 'call[callee=(#when, member[prop=#then])]'

#### Find call of function or method with given name

This demonstrates finding all Mocha test methods

	# x.it() or it()
	grasp 'call[callee=(#it, member[prop=#it])]' -r

Function or method CALL with specific name and second parameter is function	

	# x.it(__,function(){}) or it(__,function(){})
	grasp -s  "call[callee=(#it, member[prop=#it])].arguments:nth(1):matches(func-exp)" 

Function or method CALL with specific name, second parameter is function and body contains return

	# x.it(__,function(done){ return }) or it(__,function(done){ return }) 
	grasp -s  "call[callee=(#it, member[prop=#it])]! .arguments:nth(1):matches(func-exp! return).params:first" 


#### Extracting first method param

Test method descriptions (for docs or review)

	grasp -o 'call[callee=(#it, member[prop=#it])].args:nth(0)'


#### Find innerHtml without encoding

	# applies to dojo set.html and our encoder method names
	grasp -s "call[callee=(obj, [obj=#html][prop=#set])].args:nth(1):not(call[callee=(obj, [obj=(#encHtml, #enc)])])"


#### Count method usage per file

Count number of features (in BDD tests) 

	grasp --no-color -c 'call[callee=(#it, member[prop=#it])]' -r | grep -v ":0$"

### call.arguments

#### Find calls with at least one arguments 

	# TODO:

#### Find async it(done) methods, that use done syntax

	# it('stringifies buffer values', function (done) {
	grasp  'call[callee=(#it, member[prop=#it])].arguments:nth(1):matches(func-exp).params:first'

#### Adding the 4th parameter to 3-parameter calls 

	grasp -i -e 'tsta($a,$b,$c)' -R 'tsta({{a}},{{b}},{{c}},"")' 

#### Changing order of params

	grasp -i -e 'tsta($a,$b,$c,$d)' -R 'tsta({{a}},{{c}},{{b}},{{d}})' 


#### Detecting Nested Function Calls 

	# ((())) style
	# Map(filter) and filter(map) (dojo style)
	grasp -s "call[callee.prop=(#map)].args:first(call[callee.prop=(#filter)])" 
	grasp -s "call[callee.prop=(#filter)].args:first(call[callee.prop=(#map)])" 



### Find parseInt(__,*!number*)

	# TODO: parseInt() number not between x and y
	grasp 'call[callee=#parseInt]!.arguments:last-child:not(10)' 



## member (MemberExpression)

## switch-case (SwitchCase)

## catch (CatchClause)

## statement (Statement)

## dec (Declaration)

dojo style inheritance (declare)

	# files using declare, how many components using dojo inheritance do we have ?
	grasp -w "call[callee=#declare]" -r | wc -l
	
	# not inherited from anything
	grasp -o "call[callee=#declare].args:nth(0):matches(null)"
	
	# inherited from empty array ?
	grasp -o "call[callee=#declare].args:nth(0):matches(arr:not(arr! > *))" 

	# first of parents
	grasp -o "call[callee=#declare].args:nth(0).elements:head" 

	# inherited from more then one
	grasp -o "call[callee=#declare].args:nth(0).elements:nth(1)" 
		
	# inherited from Grid, parent is grid
	grasp -o "call[callee=#declare].args:nth(0).elements:first:matches(#Grid)" 
	
	# inherited or mixed with grid
	grasp -o 'call[callee=#declare].args:nth(0)>#Grid' -r | wc -l

	# mixed Grid (does it makes sence ?)
	grasp -o 'call[callee=#declare].args:nth(0).elements:tail:matches(#Grid)' -r | wc -l

## exp (Expression)

## clause (Clause)

## biop (BiOp)

## func (Function)

## for-loop (ForLoop)

	# TODO: for loop without i used inside block {}
	# modifying for loops, TODO: refactor to while ?

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

# Misc

	

### Subsequent calls of the same function

	## TODO: push push vs push
	## detector for both
	## see http://jsperf.com/pushpush


## first-child, last-child
	
### Detect oneliners 
	
	# TODO: maybe there is better way ?	
	grasp 'for-in!.body>*:first-child:last-child'
	
	# oneliner function
	grasp -e 'function(_$){__}'

## regex, RegExp

	# literal containing "/"
	grasp -s 'bi[op=+][left=literal[value~=/^[\/].*/]]' 

	# concat of strings containing one of "/","#","?"	
	grasp -s 'bi[op=+]:matches([left=literal[value~=/[\/#?]/]],[right=literal[value~=/[\/#?]/]])' 

[AMD]: https://en.wikipedia.org/wiki/Asynchronous_module_definition
