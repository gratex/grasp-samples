// this is typical dojo form of 'pluck code'
// name comes from lodash
// see https://lodash.com/docs#pluck
array.map(arr,function(item){
	return {
		x:item.x,
		t:item.y
	}
});