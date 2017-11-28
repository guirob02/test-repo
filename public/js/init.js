// Other JS files required to be loaded first: apis.js, dashboard.js, Chart.min.js jquery.min.js

(function() {
	// Load dashboard body into the index page
	$("#main-container").load( "../html/tabs/dashboard.html", function() {

		// Init Stats on the dashboard
		Api.initStats();
	});

})();
