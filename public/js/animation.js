// The Animation module is designed to handle all the event listeners

var Animation = function() {
	var message;

	var resetMsg = function() {
		if($('#errContainer').children().length == 0) {
			$('#errContainer').append($('<div id="errType">' +
				'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
				'<span id="errMsg"></span>' +
			'</div>'));
		}

    $('#errContainer').fadeOut(0);
		$('#errType').removeClass();
		$('#errMsg').empty();
	};

	var displaySuccess = function(type){
		resetMsg();
		switch(type) {
		    case 'update':
		    	message = "The answer has been updated successfully.";
		        break;
				case 'delete':
					message = "The answer has been deleted successfully.";
					break;
		    case 'import':
		    	message = "The database has been updated successfully.";
		      break;
				case 'replicate':
					message = "The database has been replicated successfully.";
					break;
		    default:
		    	message = type;
					break;
		};

        $('#errType').addClass('alert alert-dismissable fade in alert-success');
        $('#errMsg').append('<strong>Success:</strong> '+message);
        $('#errContainer').fadeIn(300);

				setTimeout(function() {
					$('#errContainer').fadeOut(300, function() {
						$('#errContainer').empty();
					});

				}, 5000);
	};

	var displayError = function(type){
		resetMsg();

		switch(type) {
		    case 'update':
		    	message = "The answer has been update by another user. Please check this modification before submiting yours.";
		      break;
				case 'emptyText':
					message = "Text response cannot be blank.";
					break;
				case 'delete':
					message = "An error occured, the answer has not been deleted.";
					break;
		    case 'import':
		    	message = "Please upload a file before importing to the database.";
		      break;
		    default:
		    	message = "Aknown error occured.";
		};


        $('#errType').addClass('alert alert-dismissable fade in alert-danger');
        $('#errMsg').append('<strong>Error:</strong> '+message);
        $('#errContainer').fadeIn(300);

				setTimeout(function() {
					$('#errContainer').fadeOut(300, function() {
						$('#errContainer').empty();
					});

				}, 5000);
	};

	var displayWarning = function(message) {
		if(message && message != '') {
			resetMsg();
			$('#errType').addClass('alert alert-dismissable fade in alert-warning');
			$('#errMsg').append('<strong>Warning:</strong> '+message);
			$('#errContainer').fadeIn(300);

			setTimeout(function() {
				$('#errContainer').fadeOut(300, function() {
					$('#errContainer').empty();
				});

			}, 5000);
		}
	};

	var loadContainer = function(tabID, action, search) {
		if(action) {
			Master.action = action;
		}
		if(search) {
			Master.search = search;
		} else {
			Master.search = '';
		}

	  $("#main-container").empty();
		$("#main-container").load( "../html/tabs/"+tabID+".html");

		// Clean modal-backdrop if needed
		$('.modal-backdrop').remove();
		$('body').removeClass('modal-open');
	};

    return {
    	displaySuccess: displaySuccess,
    	displayError: displayError,
		displayWarning: displayWarning,
		loadContainer: loadContainer
    };
}();

$(document).ready(function() {

	// Log out
	$('#logOut').on('click', function() {
		eraseCookie('sessionAS');
	   location= "login.html";
	});

	// Load html elemnts for the selected tab
	$("[data-toggle='nav-tabs']").on('click', function() {
		var tabID = this.id;

		// Get selected tab elements using id
	    $("#main-container").empty();
		$("#main-container").load( "../html/tabs/"+tabID+".html");
	});

});
