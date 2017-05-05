# Defactored Example for Using the Generalized Tutorons Library

The following code, included within your html file, will load the generalized tutorons library and wrap the 10th through the 20th characters in the div #ex0 in a span with class 'testing-labeling'. 

You're free change #ex0 to any id of your choosing, the arguments 10 and 20 for region start and end to any character indices of your choosing, and you can name the class whatever you want. Some limitations apply. :)

    <script src="/js/tutorons-library.js"></script>
	<script>
	  document.addEventListener("DOMContentLoaded", function (event) {
	    spanAdder = new tutorons.TutoronsConnection(window);
	    spanAdder.scanDom();
	    spanAdder.addRegions('#ex0',10,20,'testing-labeling');
	  });
	</script>

	<div id=ex0>

	Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheeex containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

	</div>

This generalized library I've included is the original tutorons-library (archived here) with body and arguments of the following to functions replaced as follows:
	
	TutoronsConnection.prototype.addRegions = function (id, region_start, region_end, label) {
	    var parent = this;
	    //regions.forEach(function (r) {
	        var range = parent.window.document.createRange();
	        var node = parent.window.document.querySelector(id);
	        var textNodes = parent.htmlWalker.getTextDescendants(node);
	        var textRanges = parent.htmlWalker.getRangeInText(textNodes, region_start, region_end + 1);
	        range.setStart(textRanges.start.node, textRanges.start.offset);
	        range.setEnd(textRanges.end.node, textRanges.end.offset);
	        parent.markRange(range, label);
	    //});
	};

	TutoronsConnection.prototype.markRange = function (range, label) {

		// fights bloat
	    if (this.isHighlighted(range)) {
	        return;
	    }

	    var parent = this;

	    // Transfer found terms into a span
	    var contents = range.extractContents();
	    var span = this.window.document.createElement('span');
	    span.appendChild(contents);
	    range.insertNode(span);

	    $(span).addClass(label);

	};