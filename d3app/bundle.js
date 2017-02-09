(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var unique = require('uniq');
var arrayCounter = require('array-counter');

var data = [1, 2, 2, 3, 4, 5, 5, 5, 6];

console.log(unique(data));

var arr = ["foo", "bar", 10, 40, "foo", 10, "Hello World"];

console.log(arrayCounter(arr));

},{"array-counter":2,"uniq":3}],2:[function(require,module,exports){
'use strict';

function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
}

module.exports = function (arr) {
  if(!isArray(arr)) {
    throw new TypeError('Expected an array.');
  }

  var obj = {};

  for (var i = 0; i < arr.length; i++) {
    if(arr[i] in obj) {
      obj[arr[i]]++;
    }else {
      obj[arr[i]] = 1;
    }
  }

  return obj;
};

},{}],3:[function(require,module,exports){
"use strict"

function unique_pred(list, compare) {
  var ptr = 1
    , len = list.length
    , a=list[0], b=list[0]
  for(var i=1; i<len; ++i) {
    b = a
    a = list[i]
    if(compare(a, b)) {
      if(i === ptr) {
        ptr++
        continue
      }
      list[ptr++] = a
    }
  }
  list.length = ptr
  return list
}

function unique_eq(list) {
  var ptr = 1
    , len = list.length
    , a=list[0], b = list[0]
  for(var i=1; i<len; ++i, b=a) {
    b = a
    a = list[i]
    if(a !== b) {
      if(i === ptr) {
        ptr++
        continue
      }
      list[ptr++] = a
    }
  }
  list.length = ptr
  return list
}

function unique(list, compare, sorted) {
  if(list.length === 0) {
    return list
  }
  if(compare) {
    if(!sorted) {
      list.sort(compare)
    }
    return unique_pred(list, compare)
  }
  if(!sorted) {
    list.sort()
  }
  return unique_eq(list)
}

module.exports = unique

},{}]},{},[1]);
