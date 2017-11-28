
var Upload = function() {

	function csvToArr(strData, strDelimiter) {
	    strDelimiter = (strDelimiter || ";");

	    var objPattern = new RegExp((
	    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
	    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
	    "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");

	    var arrData = [[]];
	    var arrMatches = null;
	    while (arrMatches = objPattern.exec(strData)) {
	        var strMatchedDelimiter = arrMatches[1];
	        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
	            arrData.push([]);
	        };

	        if (arrMatches[2]) {
	            var strMatchedValue = arrMatches[2].replace(
	            new RegExp("\"\"", "g"), "\"");
	        } else {
	            var strMatchedValue = arrMatches[3];
	        };

	        arrData[arrData.length - 1].push(strMatchedValue);
	    };

	    return (arrData);
	};

	function arrToJson(array) {
	    var objArray = [];

	    for (var i = 1; i < array.length; i++) {
	        objArray[i - 1] = {};
	        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
	            var key = array[0][k];
	            objArray[i - 1][key] = array[i][k]
	        }
	    }

	    var json = JSON.stringify(objArray);
	    var str = json.replace(/},/g, "},\r\n");

	    return str;
	};

    return {
    	csvToArr: csvToArr,
    	arrToJson: arrToJson
    };

}();


//Converted file and test parameters
var fileParams = {
		jsn: {},
		name: '',
		type:'',
		title:''
	};

$(document).ready(function() {
	// Upload csv file to convert into an array
	$('#intChooserInput').on('change', function() {
        var reader = new FileReader();
        reader.onload = function () {
        	fileParams.name = fileInput.name;
            fileParams.title = fileInput.name.substr(0, fileInput.name.lastIndexOf('.'));
            fileParams.type = fileInput.name.split('.').pop();
            $('#intFileName').html(fileParams.name);

            $('.upload-description').each(function() {
            	$(this).css('margin','10px 0');
            });

            var csvArr = Upload.csvToArr(reader.result);
            fileParams.jsn = Upload.arrToJson(csvArr);
        };

        // Start reading the file. When it is done, calls the onload event defined above.
        var fileInput = $('#intChooserInput')[0].files[0];
        reader.readAsText(fileInput, 'UTF-8');
	});

	$('#ansChooserInput').on('change', function() {
        var reader = new FileReader();
        reader.onload = function () {
        	fileParams.name = fileInput.name;
            fileParams.title = fileInput.name.substr(0, fileInput.name.lastIndexOf('.'));
            fileParams.type = fileInput.name.split('.').pop();
            $('#ansFileName').html(fileParams.name);

            $('.upload-description').each(function() {
            	$(this).css('margin','10px 0');
            });

            var csvArr = Upload.csvToArr(reader.result);
            fileParams.jsn = Upload.arrToJson(csvArr);
        };

        // Start reading the file. When it is done, calls the onload event defined above.
        var fileInput = $('#ansChooserInput')[0].files[0];
        reader.readAsText(fileInput, 'UTF-8');
	});


	// Send converted file and test parameters to the server for import
	$('#importInt').on('click', function() {
		Api.importIntents(fileParams.jsn);
	});


	$('#importAns').on('click', function() {
		var array = JSON.parse(fileParams.jsn);
		console.log(array);
		for(var i in array) {
			if(array[i].text)
				array[i].text = array[i].text.split('|');
		}
		console.log(array);
		Api.importAnswers(JSON.stringify(array));
	});

});
