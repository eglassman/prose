var escape = require('escape-html');
var esprima = require('esprima');

$.getJSON("data/html_vs_js_joined.json", function(data){ 
    console.log(data);
    
    $('body').append('<h3>html</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["html"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-import</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-import"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-include</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-include"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-d3</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-d3"])+'</span></code></pre></div>');
    });

    // $('body').append('<h3>js-d3-tokenized</h3>');
    // data.forEach(function(s){
    //     //console.log(s);
    //     $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+JSON.stringify(esprima.tokenize(s["js-d3"]), null, 4)+'</span></code></pre></div>');
    // });

    $('body').append('<h3>js-d3-parsed</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+JSON.stringify(esprima.parse(s["js-d3"]), null, 4)+'</span></code></pre></div>');
    });
});
