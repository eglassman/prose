var escape = require('escape-html');
$.getJSON("data/html_vs_js.json", function(data){ 
	console.log(data);
	data.forEach(function(s){
		console.log(s);
		$('body').append('<div><pre style="margin-top: 0px; margin-bottom: 0px;"><code><span class="'+s["source"]+'">'+escape(s["html"])+'</span></code></pre></div>');
	});
});