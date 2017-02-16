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

    $('body').append('<h3>js-canvas</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-canvas"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-time-formatting</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-time-formatting"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-vardec</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-vardec"])+'</span></code></pre></div>');
    });

    
    $('body').append('<h3>js-core-selections-and-vardec</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-core-selections-and-vardec"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-time-scales</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-time-scales"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-scale-quant</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-scale-quant"])+'</span></code></pre></div>');
    });
    
    $('body').append('<h3>js-scale-ordinal</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-scale-ordinal"])+'</span></code></pre></div>');
    });

    
    $('body').append('<h3>js-svg-axis</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-svg-axis"])+'</span></code></pre></div>');
    });

    
    $('body').append('<h3>js-layout-stack</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-layout-stack"])+'</span></code></pre></div>');
    });

    
    $('body').append('<h3>js-core-arrays</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-core-arrays"])+'</span></code></pre></div>');
    });

    
    $('body').append('<h3>js-svg-shapes</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-svg-shapes"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-arc</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-arc"])+'</span></code></pre></div>');
    });

    
    $('body').append('<h3>js-core-selections</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-core-selections"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-pie</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-pie"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-context</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-context"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-request-call</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-request-call"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-request-data</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-request-data"])+'</span></code></pre></div>');
    });

    $('body').append('<h3>js-request-auxfcn</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-request-auxfcn"])+'</span></code></pre></div>');
    }); 

    $('body').append('<h3>js-request-callback</h3>');
    data.forEach(function(s){
        //console.log(s);
        $('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["js-request-callback"])+'</span></code></pre></div>');
    });    

    

   

});
