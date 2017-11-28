
var authEndpoint = '/auth/check';

function checkCredentials(form){
	document.getElementById("wrgCreds").className = "wrongCreds";

	var userCreds = {
			reqID : form.username.value.toLowerCase(),
			reqPass : form.password.value,
			role : 'author'
		}

	var xmlHttp = new XMLHttpRequest();

	xmlHttp.open("GET", authEndpoint+"?usrID="+userCreds.reqID+"&pswID="+userCreds.reqPass+"&role="+userCreds.role, true);
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState === 4 && xmlHttp.status === 200 && xmlHttp.responseText) {
			switch(xmlHttp.responseText){
				case '1':
					createCookie('sessionAS', true, 2);
					createCookie('userID', userCreds.reqID, 2);
					location= "/";
					break;

				case '0':
					document.getElementById("wrgCreds").className = "wrongCredsShow";
					break;
			}
		}
	};

	xmlHttp.send();
}


function createCookie(name,value,hours) {
    var expires = "";
    if (hours) {
        var date = new Date();
        date.setTime(date.getTime() + (hours*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}
