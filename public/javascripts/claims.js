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

var badgejson;
var jsonhash = "";
var validationdata;
var badgedataurl = "";
var state = {};
var badgetobeclaimed = {};
var isNewAccount = false;

function initializePage(badgeid) {
	var loginarea = document.getElementById('loginarea');
	loginarea.style.visibility = "hidden";

	var changepasswordarea = document.getElementById('changepasswordarea');
	if (changepasswordarea) {
		changepasswordarea.style.visibility = "hidden";
	}

	initialDivs();
}

form = document.getElementById('qualifycheckbadge');

form.onsubmit = function() {
	initialDivs();
	viewfilebadgeinfo();
	return false; // To avoid actual submission of the form
}

function initialDivs() {
	document.getElementById("filevalidation").style.display = "block";
	document.getElementById("personvalidation").style.display = "none";
	document.getElementById("claimbadge").style.display = "none";

	document.getElementById("failuretitle").style.display = "none";
	document.getElementById("failure").style.display = "none";
	document.getElementById("successtitle").style.display = "none";
	document.getElementById("success").style.display = "none";
	document.getElementById("successproceed").style.display = "none";
}

function viewfilebadgeinfo() {
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		var files = document.getElementById('badgetoupload').files;
		if (files.length == 0) {
			alert("Please select a badge file to validate first");
		} else if (files.length > 1) {
			alert("Please select only 1 file");
		} else {
			var fileSelected = files[0];
			var reader = new FileReader();
			reader.onload = function(e) {
				var badgefilebinary = e.target.result;
				var chunks = processbadgedata(badgefilebinary);
				loadbadgeinfo(chunks);
			};
			reader.readAsBinaryString(fileSelected);
		}
	} else {
		alert('The File APIs are not fully supported in this browser.');
	}
}

function loadbadgeinfo(chunks) {
	var badgedata = "";
	var itxt = false;
	if (chunks.iTXt != undefined) {
		itxt = true;
		/*
		for (i = 0; i < chunks['iTXt'].length; i++) {
			bit = chunks['iTXt'][i];
			check = bit.substr(0, 10);
			if (check == "openbadges") {
				badgedata = bit.substr(15);
				badgejson = JSON.parse(badgedata);
				processExtractedJSON(badgejson)
			}
		}
		*/
	} else if (chunks.tEXt != undefined) {
		for (i = 0; i < chunks['tEXt'].length; i++) {
			bit = chunks['tEXt'][i];
			check = bit.substr(0, 10);
			if (check == "openbadges") {
				badgedata = bit.substr(11);
				//badgejson = JSON.parse(badgedata);
				//processExtractedJSON(badgejson)
			}
		}
	}
	if (badgedata == "" && itxt==false) {
		alert('The badge you have selected does not contain any OpenBadge data');
	} else if (itxt) {
		alert("This badge format is not currently supported");
	} else {
		//console.log(badgedata);
		if (isValidURI(badgedata)) {
			// have badgedata need to get badge json to proceed
			badgedataurl = badgedata;
			var handler = function(response) {
				if (response.error) {
					showError(response);
				} else {
					if (response.badge == undefined) {
						console.log("The badge contains invalid badge data");
					} else if (!isValidURI(response.badge)) {
						console.log("The badge contains invalid badge data");
					} else {
						badgejson = response;
						var handler = function(response) {
							if (response.error) {
								showError(response);
							} else {
								if (response.issuer == undefined) {
									console.log("The badge contains invalid badge data");
								} else if (!isValidURI(response.issuer)) {
									console.log("The badge contains invalid badge data");
								} else {
									badgejson.badge = response;
									var handler = function(response) {
										if (response.error) {
											showError(response);
										} else {
											if (response.name == undefined || response.url == undefined) {
												console.log("The badge contains invalid badge data");
											} else {
												badgejson.badge.issuer = response;
												checkForQualification(badgejson);
												//console.log(badgejson);
											}
										}
									}
									var temp = {};
									temp.remoteurl = response.issuer;
									makeRequest("POST", cfg.proxy_path+"/qualifying/loadremotedata", temp, handler);
								}
							}
						}
						var temp = {};
						temp.remoteurl = response.badge;
						makeRequest("POST", cfg.proxy_path+"/qualifying/loadremotedata", temp, handler);
					}
				}
			}
			var temp = {};
			temp.remoteurl = badgedata;
			makeRequest("POST", cfg.proxy_path+"/qualifying/loadremotedata", temp, handler);
		} else {
			alert("The badge you have selected contains invalid badge data");
		}
	}
}

function processbadgedata(content){
	//first character is 137 in file read php version of this code
	var png_signature1 = pack("C8", 137, 80, 78, 71, 13, 10, 26, 10);

	//first character is 63369 seems to be in file read via http
	var png_signature2 = pack("C8", 63369, 80, 78, 71, 13, 10, 26, 10);
	var header = content.substring(0, 8);

	if (header != png_signature1 && header != png_signature2) {
			console.log('This is not a valid PNG image');
	}
	var size = content.length;
	//console.log(size);

	var chunks = new Array();

	// Skip 8 bytes of IHDR image header.
	var position = 8;
	do {
		chunk = unpack('Nsize/a4type', content.substring(position, position + 8));
		if(chunks[chunk['type']] == undefined){
			chunks[chunk['type']]=new Array();
		}
		chunks[chunk['type']][chunks[chunk['type']].length] = content.substring(position + 8, position + 8 + chunk['size']);

		//console.log(chunks[chunk['type']]);
		// Skip 12 bytes chunk overhead.
		position += chunk['size'] + 12;
		//console.log(chunk['type']+" "+chunks[chunk['type']]);
	} while (position < size);

	return chunks
}

function checkForQualification(json){

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {

			//console.log(response);

			document.getElementById("checkresultblock").style.display = "block";
			if (response.qualifies) {
				badgejson.badgeid = response.id;
				document.getElementById("badgeimage").innerHTML = "<img src='" + response.image + "'  style='height: 100px;' />";
				document.getElementById("badgetitle").innerHTML = "<b>" + response.title + "</b>";
				document.getElementById("badgedescription").innerHTML = response.description;

				document.getElementById("claimbadgeimage").innerHTML = "<img src='" + response.image + "'  style='height: 100px;' />";
				document.getElementById("claimbadgetitle").innerHTML = "<b>" + response.title + "</b>";
				document.getElementById("claimbadgedescription").innerHTML = response.description;

				badgetobeclaimed.image = response.image;
				badgetobeclaimed.title = response.title;
				badgetobeclaimed.description = response.description;

				document.getElementById("successtitle").style.display = "block";
				document.getElementById("success").style.display = "block";
				document.getElementById("successproceed").style.display = "block";
			} else {
				document.getElementById("failure").innerHTML = response.message;
				document.getElementById("failuretitle").style.display = "block";
				document.getElementById("failure").style.display = "block";
			}
		}
	}
	var send = {};
	send.title = json.badge.name;
	send.description = json.badge.description;
	send.issuedon = json.issuedOn * 1000;
	send.issuername = json.badge.issuer.name;
	send.issuerurl = json.badge.issuer.url;
	send.badgeurl = badgedataurl;
	//console.log(send);

	makeRequest("POST", cfg.proxy_path + "/qualifying/check/", send, handler);
}

function proceedToUserCheck() {
	document.getElementById("filevalidation").style.display = "none";
	document.getElementById("personvalidation").style.display = "block";
	document.getElementById("claimbadge").style.display = "none";

	// check if signed in and if so if correct user if not have logout advice and then if not signed in have login/create account
	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			//console.log(response);
			state = response;
			if (state.signedon == true && state.identityok == true) {
				// move on to check is badge issued and if not allow the issuing of the badge
				if (state.badgeissued == true) {
					document.getElementById("filevalidation").style.display = "none";
					document.getElementById("personvalidation").style.display = "none";
					document.getElementById("claimbadge").style.display = "block";

					document.getElementById("sout").style.display = "none";
					document.getElementById("usn").style.display = "none";
					document.getElementById("theclaim").style.display = "none";

					document.getElementById("alreadyClaimed").style.display = "block";
				} else {
					// check if recipient account exists and if not create one - ? recipient name needed
					// once created proceed to claim the badge

					claimbadgestep();
				}
			} else if (state.signedon == true && state.identityok == false) {
				document.getElementById("sout").style.display = "block";
				document.getElementById("usn").style.display = "none";
				document.getElementById("pwdsignin").style.display = "none";
			} else {
				document.getElementById("usn").style.display = "block";
				document.getElementById("sout").style.display = "none";
				document.getElementById("pwdsignin").style.display = "none";
			}
		}
	}
	var temp = {};
	temp.identity = badgejson.recipient.identity;
	temp.salt = badgejson.recipient.salt;
	temp.type = badgejson.recipient.type;
	temp.badgeid = badgejson.badgeid;
	//console.log(temp);

	makeRequest("POST", cfg.proxy_path + "/qualifying/checkusermatch", temp, handler);
}

function topassword() {
	// check if signed in and if so if correct user if not have logout advice and then if not signed in have login/create account
	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			//console.log(response);
			state = response;
			if (state.identityok == true) {
				if (state.badgeissued == true) {
					document.getElementById("filevalidation").style.display = "none";
					document.getElementById("personvalidation").style.display = "none";
					document.getElementById("claimbadge").style.display = "block";

					document.getElementById("sout").style.display = "none";
					document.getElementById("usn").style.display = "none";
					document.getElementById("theclaim").style.display = "none";

					document.getElementById("alreadyClaimed").style.display = "block";
				} else {
					// move to enter password/create account based on state.accountexists
					if (state.accountexists == true) {
						if (isNewAccount) {
							document.getElementById("newaccountpwdsignin").style.display = "block";
						} else {
							document.getElementById("pwdsignin").style.display = "block";
						}
						document.getElementById("newaccount").style.display = "none";
					} else {
						isNewAccount = true;
						document.getElementById("newaccount").style.display = "block";
						document.getElementById("pwdsignin").style.display = "none";
					}
					document.getElementById("sout").style.display = "none";
					document.getElementById("usn").style.display = "none";
				}
			} else {
				alert("ERROR: The email address you entered does not match that used when the badge was issued");
			}
		}
	}
	var temp = {};
	temp.identity = badgejson.recipient.identity;
	temp.salt = badgejson.recipient.salt;
	temp.type = badgejson.recipient.type;
	temp.email = document.getElementById("emailfield").value;
	temp.badgeid = badgejson.badgeid;
	//console.log(temp);

	makeRequest("POST", cfg.proxy_path + "/qualifying/checkuseremailmatch", temp, handler);
}

function signuserout() {
	// Null out the cookie.
	var d = new Date();
	d.setTime(0);
	var expires = "expires="+ d.toUTCString();
	document.cookie = "token=;  " + expires + ";path=/";
	document.cookie = "displayname=; " + expires + ";path=/";
	document.cookie = "roles=; " + expires + ";path=/";
	state.signedon = false;
	if (state.signedon == false) {
		document.getElementById("usn").style.display = "block";
		document.getElementById("sout").style.display = "none";
	}
}

function accountsignin() {
	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			//console.log(response);
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
			claimbadgestep();
		}
	}
	var temp = {};
	temp.username = document.getElementById("emailfield").value;
	temp.password = document.getElementById("passwordsigninfield").value;
	//console.log(temp);

	makeRequest("POST", cfg.proxy_path + "/users/signin", temp, handler);
}

function accountsigninnew() {
	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			//console.log(response);
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
			claimbadgestep();
		}
	}
	var temp = {};
	temp.username = document.getElementById("emailfield").value;
	temp.password = document.getElementById("passwordsigninfieldnew").value;
	//console.log(temp);

	makeRequest("POST", cfg.proxy_path + "/users/signin", temp, handler);
}

function accountcreate() {

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			//console.log(response);
			topassword();
		}
	}

	var temp = {};
	temp.username = document.getElementById("usernamefield").value;
	temp.email = document.getElementById("emailfield").value;

	//console.log(temp);

	makeRequest("POST", cfg.proxy_path + "/qualifying/createaccount", temp, handler);
}

function claimbadgestep() {
	document.getElementById("filevalidation").style.display = "none";
	document.getElementById("personvalidation").style.display = "none";
	document.getElementById("claimbadge").style.display = "block";

}


function claimbadge() {

	var temp = {};
	temp.claimsassertion = badgedataurl;
	//temp.recipientname = document.getElementById("usernamefield").value;
	//temp.recipientemail = document.getElementById("emailfield").value;

	var handler = function(response) {
		if (response.error) {
			showError(response);
			document.location.href = cfg.proxy_path+cfg.badges_path+"/claims";
		} else {
			console.log(response);
			//console.log(response.staus);

			document.getElementById("makeclaim").disabled = false;
			document.body.style.cursor = "default";
			if (response.status == "issued") {
				document.location.href = cfg.proxy_path+cfg.badges_path+"/portfolio";
			}

		}
	}
	console.log(temp);
	document.getElementById("makeclaim").disabled = true;
	document.body.style.cursor = "wait";
	makeRequest("POST", cfg.proxy_path+"/assertions/qualifyingclaimassertion", temp, handler);
}



