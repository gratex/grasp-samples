// grasp -s '(FunctionDeclaration,FunctionExpression,ArrowFunctionExpression)[async=false]' -R 'async {{}}'
async function async1() {

}
const async2 = async function() {

}
const async3 = async () => {}


// grasp -s '(FunctionDeclaration,FunctionExpression,ArrowFunctionExpression)[async=false]' -R 'async {{}}'
function sync1() {

}
const sync2 =  function() {

}
const sync3 =  () => {}