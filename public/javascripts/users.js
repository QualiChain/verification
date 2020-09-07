/*********************************************************************************
* The MIT License (MIT)                                                          *
*                                                                                *
* Copyright (c) 2020 KMi, The Open University UK                                 *
*                                                                                *
* Permission is hereby granted, free of charge, to any person obtaining          *
* a copy of this software and associated documentation files (the "Software"),   *
* to deal in the Software without restriction, including without limitation      *
* the rights to use, copy, modify, merge, publish, distribute, sublicense,       *
* and/or sell copies of the Software, and to permit persons to whom the Software *
* is furnished to do so, subject to the following conditions:                    *
*                                                                                *
* The above copyright notice and this permission notice shall be included in     *
* all copies or substantial portions of the Software.                            *
*                                                                                *
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL        *
* THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER     *
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN      *
* THE SOFTWARE.                                                                  *
*                                                                                *
**********************************************************************************/

function forgotpassword(protocol, domain, path) {

	var send = {};
	send.email = document.getElementById("email").value;

	if (send.email == "") {
		alert("Please enter the email address associated with your account");
	} else {
		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				// Null out the cookie - so force them to login again.
				var d = new Date();
				d.setTime(0);
				var expires = "expires="+ d.toUTCString();

				document.cookie = "token=;  " + expires + ";path=/";
				document.cookie = "displayname=; " + expires + ";path=/";
				document.cookie = "roles=; " + expires + ";path=/";

				document.getElementById("email").value = "";
				alert("You will receive an email shortly to reset your password.");
			}
		}

		makeRequest("POST", cfg.proxy_path+"/users/forgotpassword", send, handler);
	}
}

function changepassword(protocol, domain, path) {

	var send = {};
	send.newpassword = document.getElementById("passwordfield").value;
	//console.log(send);

	var confirmpassword = document.getElementById("passwordconfirmation").value;
	if (send.newpassword != confirmpassword) {
		alert("The password confirmation does not match the new password. Please try again");
	} else {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				// Null out the cookie - so force them to login again.
				var d = new Date();
				d.setTime(0);
				var expires = "expires="+ d.toUTCString();
				document.cookie = "token=;  " + expires + ";path=/";
				document.cookie = "displayname=; " + expires + ";path=/";
				document.cookie = "roles=; " + expires + ";path=/";

				if (path.includes("endorsers")) {
					location.href = protocol+"://"+domain+cfg.proxy_path+"/endorsers";
				} else if (path.includes("recipients")) {
					location.href = protocol+"://"+domain+cfg.proxy_path+cfg.badges_path+"/portfolio";
				} else if (path.includes("issuers")) {
					location.href = protocol+"://"+domain+cfg.proxy_path+"/issuers";
				} else {
					location.href = protocol+"://"+domain+cfg.proxy_path+"/";
				}
			}
		}

		makeRequest("POST", cfg.proxy_path+"/users/changepassword", send, handler);
	}
}

function signin(protocol, domain, path, queryobj) {

	var targeturl = protocol+"://"+domain+cfg.proxy_path+path;
	var querystring = "";

	for (var p in queryobj) {
		if (queryobj.hasOwnProperty(p)) {
			if (p != "token") {
				if (querystring != "") querystring += "&";
				querystring += p + "=" + queryobj[p];
			}
		}
	}

	var send = {};
	send.username = document.getElementById("usernamefield").value;
	send.password = document.getElementById("passwordfield").value;
	//console.log(send);

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			var token = ""
			if (response.token != undefined) token = response.token;

			var displayname = ""
			if (response.displayname != undefined) displayname = response.displayname;

			var roles = ""
			if (response.roles != undefined) roles = response.roles;

			if (token != "") {
				var d = new Date();
				// 6 hour expiry
				d.setTime(d.getTime() + (6*60*60*1000));
				var expires = "expires="+ d.toUTCString();
				document.cookie = "token=" + token + "; " + expires + ";path=/";

				if (displayname != "") {
					document.cookie = "displayname=" + displayname + "; " + expires + ";path=/";
				}
				if (displayname != "") {
					document.cookie = "roles=" + roles + "; " + expires + ";path=/";
				}
			}

			if (path.includes("signinpage")) {

				// if they only have one role, take them straight to that roles main page,
				// else if they have more than one role take them to the homepage with all the options.
				if (roles == "issuer") {
					location.href = protocol+"://"+domain+cfg.proxy_path+"/issuers";
				} else if (roles == "recipient") {
					location.href = protocol+"://"+domain+cfg.proxy_path+cfg.badges_path+"/portfolio";
				} else if (roles == "endorser") {
					location.href = protocol+"://"+domain+cfg.proxy_path+"/endorsers";
				} else {
					location.href = protocol+"://"+domain+cfg.proxy_path+"/";
				}
			} else {
				var finalquerystring = "";
				if (querystring != "") {
					finalquerystring = "?" + querystring;
				}
				var redirecturl = targeturl + finalquerystring;
				location.href = redirecturl;
			}
		}
	}

	makeRequest("POST", cfg.proxy_path+"/users/signin", send, handler);
}