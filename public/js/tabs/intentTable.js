
var IntentTable = function() {
	var generateTable = function(intents){
		$('#intTbody').empty();

		for(var i=0; i<intents.length; i++){
			var intTrCont = generateRow(intents[i], i+1);
			$('#intTbody').append(intTrCont);
		};

		// Init once table generated
		Master.initTables();
	};
	
    return {
        generateTable: generateTable
    };
}();

// Generate pre-formated table row
function generateRow(elment, intNum){
	var editedTags = '';
	if(elment.tags) {
		var tags = elment.tags.split(',');
		var editedTags = '';

		for(i=0; i<tags.length; i++){
			editedTags += '<span class="label label-primary mar-r1x">'+tags[i]+'</span>'
		};
	}
	var displayedText = (elment.displayed_text ? elment.displayed_text : '');
	var tags = (elment.tags ? elment.tags : '');

	var editedTr =
	    '<tr num="'+intNum+'" intID="'+elment.intent_uid+'" intName="'+elment.intent+'" cuName="'+displayedText+'" cuTags="'+tags+'">'+
	        '<td class="text-center">'+intNum+'</td>'+
	        '<td class="font-w600">'+elment.intent+'</td>'+
	        '<td class="hidden-xs">'+displayedText+'</td>'+
	        '<td class="hidden-xs">'+editedTags+'</td>'+
	        '<td class="text-center hidden-xs">'+
	            '<div class="btn-group">'+
	                '<button class="btn btn-xs btn-default editInt" data-toggle="modal" data-target="#modal-popout" title="Edit Intent" type="button"><i class="fa fa-pencil"></i></button>'+
	            '</div>'+
	        '</td>'+
	    '</tr>';

	return editedTr;
};

// Get intents list once page loaded
jQuery(function(){
	Api.getIntLabels('table');
});


// Edit intent labels
$('#intTbody').on('click', '.editInt', function() {
	var parent = $(this).parents('tr');
	var tagList = parent.attr('cuTags')
	
	$('#intID').val(parent.attr('intID'));
	$('#intName').val(parent.attr('intName'));
	$('#cuName').val(parent.attr('cuName'));

	Master.setTags(tagList);
	Master.initHelpers(['tags-inputs']);
});

//Submit intent editing
$('#submitIntEdit').on('click', function() {
	var id = $('#intID').val();
	var form = {
			intent : $('#intName').val(),
			displayed_text : $('#cuName').val(),
			tags : $('#cuTags').val()
		}

	Api.postIntLabel(id, form);
	$('#editContainer').fadeOut(200);
});