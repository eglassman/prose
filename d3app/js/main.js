var unique = require('uniq');
var arrayCounter = require('array-counter');

var data = [1, 2, 2, 3, 4, 5, 5, 5, 6];

console.log(unique(data));

var arr = ["foo", "bar", 10, 40, "foo", 10, "Hello World"];
//var doctype_arr = $('.doctype.compiled').map(function (i,e) {return $(e).text();}).toArray();
var new_arr = [];
$('.doctype.compiled').each(function(i,e){
	console.log(i,e);
	new_arr.push($(e).text());
});
console.log(new_arr)
//var doctype_arr = $('.doctype.compiled').toArray().map(function (i,e){return $(i).text()}); //$('.doctype.compiled').toArray();
//console.log('doctype_arr',doctype_arr)
//var isArrayBool = Array.isArray(doctype_arr);

console.log(arrayCounter(arr));
//console.log(isArrayBool);
//console.log(doctype_arr);
console.log(arrayCounter(new_arr));
