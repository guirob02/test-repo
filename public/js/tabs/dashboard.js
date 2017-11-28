
var Dashboard = function() {

	var exportElms= function(intArr, cuName) {
		var x = new CSVExport(intArr, cuName);
		return false;
	};

    return {
    	exportElms: exportElms
    };

    return {
    	exportIntents: exportIntents
    };
}();

//Export intents
$('#exportInt').on('click', function() {
	Api.getIntLabels('export');
});

//Export Answers
$('#exportAns').on('click', function() {
	Api.getAnswers('export');
});

// Replicate Cloudant DB
$('#replicateDocs').on('click', function() {
	Api.replicate();
});




// Initialize Tabs
jQuery('[data-toggle="tabs"] a, .js-tabs a').click(function(e){
    e.preventDefault();
    jQuery(this).tab('show');
});
