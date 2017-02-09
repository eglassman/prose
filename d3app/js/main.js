var unique = require('uniq');
var arrayCounter = require('array-counter');

var data = [1, 2, 2, 3, 4, 5, 5, 5, 6];

console.log(unique(data));

var arr = ["foo", "bar", 10, 40, "foo", 10, "Hello World"];

console.log(arrayCounter(arr));
