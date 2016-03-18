/*jshint unused:false */
/*jshint poorrelation:false */

var str1, str2;

// strange syntaxes (but we use them)
var nContains = ~str1.indexOf(str2);
var bContains = !!~str1.indexOf(str2);
var bDoesNotContain = !~str1.indexOf(str2);
var bStartsWith = !str1.indexOf(str2);
var bDoesNotStartsWith = !!str1.indexOf(str2);

// other syntaxes
var bContains = str1.indexOf(str2) != -1;
var bContains = str1.indexOf(str2) !== -1;
var bContains = str1.indexOf(str2) > -1;
var bContains = str1.indexOf(str2) >= 0;

var bDoesNotContain = str1.indexOf(str2) == -1;
var bDoesNotContain = str1.indexOf(str2) === -1;
var bDoesNotContain = str1.indexOf(str2) < 0;

var bStartsWith = str1.indexOf(str2) == 0;
var bStartsWith = str1.indexOf(str2) === 0;

var bDoesNotStartsWith = str1.indexOf(str2) != 0;
var bDoesNotStartsWith = str1.indexOf(str2) !== 0;

var bContainsButDoesNotStartsWith = str1.indexOf(str2) > 0;
var bContainsButDoesNotStartsWith = str1.indexOf(str2) >= 1;

// errors and mistypes ?
var nonsence = str1.indexOf(str2) >= -1;




//---------------------------------------------------------------------------------
//indexOf samples
//strange syntaxes (but we use them)
var nContains = ~str1.indexOf(str2);				//	OK		
var bContains = !!~str1.indexOf(str2);				//	OK
var bDoesNotContain = !~str1.indexOf(str2);			//	OK
var bStartsWith = !str1.indexOf(str2);				//	OK

//other syntaxes
var bContains = str1.indexOf(str2) != -1;			// OK, BUT ...
var bContains = str1.indexOf(str2) !== -1;			// OK, BUT ...
var bContains = str1.indexOf(str2) > -1;			// DO NOT USE
var bContains = str1.indexOf(str2) >= 0;			// DO NOT USE

var bDoesNotContain = str1.indexOf(str2) == -1;		// OK, BUT ...
var bDoesNotContain = str1.indexOf(str2) === -1; 	// OK, BUT ...
var bDoesNotContain = str1.indexOf(str2) < 0;		// DO NOT USE

var bStartsWith=str1.indexOf(str2) == 0;			// OK
var bStartsWith=str1.indexOf(str2) === 0;			// OK

var bContainsButDoesNotStartsWith = str1.indexOf(str2) > 0;	// OK, BUT ...