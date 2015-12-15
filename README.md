# grasp-samples

This is our collection of various grasp samples.
Organized by individual syntax constructs, but may be reorganized
later. It shell give you inspiration on how the grasp (but also other AST based tools) can be used in coding practice.

See also [anti-babel]() for specific refactoring samples.

Any reviews, and more samples are welcomed (Pull Requests please).

<!-- 
curl -s http://www.graspjs.com/docs/syntax-js/ | cheerio "h3" | prefix "## " 
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
	grasp -s 'if.test!>literal'  



## prop (Property)


## empty (EmptyStatement)


## block (BlockStatement)
## exp-statement (ExpressionStatement)
## if (IfStatement)
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
## debugger (DebuggerStatement)
## func-dec (FunctionDeclaration)
## var-decs (VariableDeclaration)

## var-dec (VariableDeclarator)

### Names of variables
can be used to enforce naming conventions, check against 'data dictionary' or simply spell check.

	grasp -s -o "var-dec.id"

	# top 10 favorite variable names
	grasp -s -o "var-dec.id" -r | cut -d":" -f3 | sort | uniq -c | sort -k1,1nr | head -n10
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

Finding variales with given name

	grasp -s -o "var-dec[id=#_this]" -r



## this (ThisExpression)
## arr (ArrayExpression)
## obj (ObjectExpression)
## func-exp (FunctionExpression)
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

	grasp -s "return!.arg unary[op=typeof]" 

	# typeof used inside ifs
	grasp -s "if.test unary[op=typeof]" -r
	
## bi (BinaryExpression)
## assign (AssignmentExpression)
## update (UpdateExpression)
## logic (LogicalExpression)
## cond (ConditionalExpression)
## new (NewExpression)
## call (CallExpression)

### Find call of function or method with given name

This demonstrates finding all Mocha test methods

	# x.it() or it()
	grasp -s "call[callee=(#it, member[prop=#it])]" -r

The later the searches are more specific by adding another constructions
for example:

### Extracting first method param
Test method descriptions (for docs or review)

	grasp -o -s 'call[callee=(#it, member[prop=#it])].args:nth(0)'

### Count method usage per file
Count number of features (in BDD tests) 

	grasp --no-color -c -s 'call[callee=(#it, member[prop=#it])]' -r | grep -v ":0$"

### Find calls with at least one arguments 
Find async it(done) methods, that use done syntax

	# it('stringifies buffer values', function (done) {
	grasp -s  'call[callee=(#it, member[prop=#it])].arguments:nth(1):matches(func-exp).params:first'


## member (MemberExpression)
## switch-case (SwitchCase)
## catch (CatchClause)
## statement (Statement)
## dec (Declaration)
## exp (Expression)
## clause (Clause)
## biop (BiOp)
## func (Function)
## for-loop (ForLoop)
## while-loop (WhileLoop)
## loop (Loop)


[AMD]: https://en.wikipedia.org/wiki/Asynchronous_module_definition
