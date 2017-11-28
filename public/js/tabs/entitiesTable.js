
var EntitiesTable = function() {
	var generateTable = function(entities){
		$('#entitiesTable > tbody').remove();
		var entBody = '';
		var entObj = [];

		for(var i=0; i<entities.length; i++){
			var entExist = false;
			var obj = {
					name : entities[i].entity_name,
					elms : [{
						value : entities[i].value,
						synonyms : JSON.parse(entities[i].synonyms)				
						}
					]
				};
			
			for(var j=0; j<entObj.length; j++) {
			    if(entObj[j].name == entities[i].entity_name) {
			    	entObj[j].elms.push(obj.elms[0]);
			    	entExist = true;
			        break;
			    };
			};
			
		    if(!entExist) {
		    	entObj.push(obj);
		    };	
		};
		
		entTable = generateBody(entObj);
		
		// Refresh table
		$('#entitiesTable').append(entTable);
		Master.initHelpers('table-tools');
	};

    return {
        generateTable: generateTable
    };
}();


// Get intents list once page loaded
jQuery(function(){ 
	Api.getEntities();
});


// Generate pre-formated table row
function generateBody(elment){
	var entTable = '';
	
	for(i=0; i<elment.length; i++) {
		var first = i == 0 ? "open" : "";
		var elmBody = '';
		var entBody =
	        '<tbody class="js-table-sections-header '+first+'">'+
				'<tr>'+
			        '<td class="text-center"><i class="fa fa-angle-right"></i></td>'+
			        '<td class="font-w600">'+elment[i].name+'</td>'+
			        '<td><span class="label label-primary">'+elment[i].elms.length+' value(s)</span></td>'+
			    '</tr>'+
			'</tbody>';
		
		for(j=0; j<elment[i].elms.length; j++){
			var elmTr =
				'<tr>'+
		            '<td class="text-center"></td>'+
		            '<td class="font-w600 text-primary">'+elment[i].elms[j].value+'</td>'+
		            '<td><small>'+elment[i].elms[j].synonyms.length+' synonym(s)</small></td>'+
		        '</tr>';
			
			elmBody += elmTr;
		};
		
		entTable += entBody + '<tbody>'+elmBody+'</tbody>';
	};
	        
	return entTable;
};