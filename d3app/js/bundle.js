(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var escape = require('escape-html');

$.getJSON("data/html_vs_js_joined.json", function(data){ 
    console.log(data);
    
    $('body').append('<h3>html</h3>');
    data.forEach(function(s){
        console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["html"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-import</h3>');
    data.forEach(function(s){
        console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-import"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-include</h3>');
    data.forEach(function(s){
        console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-include"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-d3</h3>');
    data.forEach(function(s){
        console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-d3"])+'</span></code></pre></div>');
    });
});

},{"escape-html":2}],2:[function(require,module,exports){
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */

'use strict';

/**
 * Module variables.
 * @private
 */

var matchHtmlRegExp = /["'&<>]/;

/**
 * Module exports.
 * @public
 */

module.exports = escapeHtml;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

function escapeHtml(string) {
  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index
    ? html + str.substring(lastIndex, index)
    : html;
}

},{}]},{},[1]);
