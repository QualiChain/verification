/*********************************************************************************
* The MIT License (MIT)                                                          *
*                                                                                *
* Copyright (c) 2019 KMi, The Open University UK                                 *
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

/** Author: Michelle Bachler, KMi, The Open University **/
/** Author: Manoharan Ramachandran, KMi, The Open University **/
/** Author: Kevin Quick, KMi, The Open University **/

var issuers = {};

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
	updateList();
}

function createIssuerAccount(issuerid) {
	var issuer = issuers[issuerid];

	var loginemail = prompt("Please enter the email address for the account login", "");
	if (loginemail != null) {
		console.log(loginemail);

		if (loginemail != "" && !isValidEmail(loginemail)) {
			alert("Please enter a valid login email for this issuer");
			return;
		}

		var message = "Are you sure you want to use the email address:\n "+loginemail+" \nto create an account for issuer:\n"+issuer.name;
		var reply = confirm(message);
		if (reply == true) {

			var handler = function(response) {
				if (response.error) {
					showError(response);
				} else {
					updateList();
					alert("The issuer account record has been created");
				}
			}

			var send = {};
			send.id = issuerid;
			send.loginemail = loginemail;
			makeRequest("POST", cfg.proxy_path+"/issuers/createuseraccount", send, handler);
		} else {
		  // do nothing
		}
	} else {
		alert("You must enter an email address to use for this Issuer Account");
	}
}

function createIssuer() {
	var form = document.getElementById('formRec');

	if (form.url.value != "" && !isValidURI(form.url.value)) {
		alert("Please enter a valid url for this issuer");
		return;
	}

	if (form.email.value != "" && !isValidEmail(form.email.value)) {
		alert("Please enter a valid email for this issuer");
		return;
	}

	if (form.imageurl.value != "" && !isValidURI(form.imageurl.value)) {
		alert("Please enter a valid image url for this endorser");
		return;
	}

	var send = {};
	send.name = demicrosoftize(form.name.value);
	send.description = demicrosoftize(form.description.value);
	send.url = form.url.value;
	send.telephone = form.telephone.value;
	send.email = form.email.value;
	send.imageurl = form.imageurl.value;

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			clearCreateForm();
			updateList();
		}
	}

	makeRequest("POST", cfg.proxy_path+"/issuers/create", send, handler);
}

function updateIssuer() {
	var editform = document.getElementById('formRecEdit');

	if (editform.url.value != "" && !isValidURI(editform.url.value)) {
		alert("Please enter a valid url for this issuer");
		return;
	}

	if (editform.email.value != "" && !isValidEmail(editform.email.value)) {
		alert("Please enter a valid email for this issuer");
		return;
	}

	if (editform.imageurl.value != "" && !isValidURI(editform.imageurl.value)) {
		alert("Please enter a valid image url for this issuer");
		return;
	}

	var send = {};
	send.id = editform.issuerid.value;
	send.name = demicrosoftize(editform.name.value);
	send.description = demicrosoftize(editform.description.value);

	send.url = editform.url.value;
	send.telephone = editform.telephone.value;
	send.email = editform.email.value;
	send.imageurl = editform.imageurl.value;

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			cancelEditForm();
			updateList();
		}
	}

	makeRequest("POST", cfg.proxy_path+"/issuers/update", send, handler);
}

function clearCreateForm() {
	var form = document.getElementById('formRec');

	form.name.value = "";
	form.description.value = "";
	form.url.value = "";
	form.telephone.value = "";
	form.email.value = "";
	form.imageurl.value = "";
}

function showCreateForm() {
	clearCreateForm();

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "block";
	document.getElementById('createFormShowButton').style.display = "none";
}

function cancelCreateForm() {
	clearCreateForm();

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function cancelEditForm() {

	var editform = document.getElementById('formRecEdit');

	editform.issuerid.value = "";
	editform.name.value = "";
	editform.description.value = "";
	editform.url.value = "";
	editform.telephone.value = "";
	editform.email.value = "";
	editform.imageurl.value = "";

	document.getElementById('editDiv').style.display = "none";
	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function editIssuer(issuerid) {
	var issuer = issuers[issuerid];

	var editform = document.getElementById('formRecEdit');

	editform.issuerid.value = issuerid;
	editform.name.value = issuer.name;
	editform.description.value = issuer.description;
	editform.url.value = issuer.url;
	editform.telephone.value = issuer.telephone;
	editform.email.value = issuer.email;
	editform.imageurl.value = issuer.imageurl;

	document.getElementById('createDiv').style.display = "none";
	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "block";
	document.getElementById('createFormShowButton').style.display = "none";
}

function closeViewForm() {

	var viewform = document.getElementById('formRecView');

	viewform.name.value = "";
	viewform.description.value = "";
	viewform.url.value = "";
	viewform.telephone.value = "";
	viewform.email.value = "";
	viewform.imageurl.value = "";

	document.getElementById('editDiv').style.display = "none";
	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function viewIssuer(issuerid) {
	var issuer = issuers[issuerid];

	var viewform = document.getElementById('formRecView');

	viewform.name.value = issuer.name;
	viewform.description.value = issuer.description;
	viewform.url.value = issuer.url;
	viewform.telephone.value = issuer.telephone;
	viewform.email.value = issuer.email;
	viewform.imageurl.value = issuer.imageurl;

	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('viewDiv').style.display = "block";
	document.getElementById('createFormShowButton').style.display = "none";
}

function deleteIssuer(issuerid) {
	var issuer = issuers[issuerid];

	var message = "Are you sure you want to delete the issuer entry for: "+issuer.name;
	var reply = confirm(message);
	if (reply == true) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				clearCreateForm();
				cancelEditForm(); // just reset everything incase it is open;
				updateList();
				alert("The issuer record has been deleted");
			}
		}

		var send = {};
		send.id = issuerid;
		makeRequest("POST", cfg.proxy_path+"/issuers/delete", send, handler);
	} else {
	  // do nothing
	}
}

function updateList(){

	var handler = function(response) {

		issuers = {}
		var thediv =document.getElementById('storedList');
		thediv.innerHTML = "";

		console.log(response.issuers.length);
		if ( !response || !response.issuers || (response.issuers && response.issuers.length == 0) ) {
			thediv.innerHTML = "You have not added any issuers yet";
		} else {
			// clear global variable

			var html = "<center><table style='width:100%;line-height:120%;font-size: 14px;'>";
			html += '<tr>';
			html += '<th width="5%" class="tableheader">ID</th>';
			html += '<th width="30%" class="tableheader">Image</th>';
			html += '<th width="20%" class="tableheader">Name</th>';
			html += '<th width="10%" class="tableheader">View</th>';
			html += '<th width="10%" class="tableheader">Edit</th>';
			html += '<th width="10%" class="tableheader">Delete</th>';
			html += '<th width="15%" class="tableheader">User Account</th>';
			html += '</tr>';

			for (i = 0; i < response.issuers.length; i++) {

				// store to global list by id
				issuers[response.issuers[i].id] = response.issuers[i]

				html += '<tr>';

				html += "<td style='padding: 6px; border: 1px solid grey;'>";
				html += response.issuers[i].id;
				html += "</td>";

				html += '<td style="padding: 6px; border: 1px solid grey;">';
				if (response.issuers[i].imageurl) {
					html += '<img height="50"; src="'+response.issuers[i].imageurl+'"/>';
				} else {
					html += '&nbsp;';
				}
				html += '</td>';

				html += "<td style='padding: 6px; border: 1px solid grey;'>";
				html += response.issuers[i].name;
				html += "</td>";

				html += '<td style="padding: 6px; border: 1px solid grey;">';
				html += '<center><button class="sbut" title="View" onclick="viewIssuer(\''+response.issuers[i].id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/view.png" /></button></center>';
				html += '</td>';

				html += '<td style="padding: 6px; border: 1px solid grey;">';
				if (response.issuers[i].usedInIssuance === false) {
					html += '<center><button class="sbut" title="Edit" onclick="editIssuer(\''+response.issuers[i].id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/edit.png" /></button></center>';
				} else {
					html += '<center>Used</center>';
				}
				html += '</td>';

				var status = parseInt(response.issuers[i].status);

				html += '<td style="padding: 6px; border: 1px solid grey;">';
				if (response.issuers[i].usedInIssuance === true) {
					html += '<center>Used</center>';
				} else if (response.issuers[i].usedInIssuance === false && status == -1) {
					html += '<center><button class="sbut" title="Delete" onclick="deleteIssuer(\''+response.issuers[i].id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/delete.png" /></button></center>';
				} else if (response.issuers[i].usedInIssuance === false && status != -1) {
					html += '<center>Account Exists</center>';
				} else {
					html += "Unavailable";
				}
				html += '</td>';

				html += "<td style='padding: 6px; border: 1px solid grey;'>";
				if (status == -1) {
					html += '<div class="accountstatus" title="Create an login Account for this Issuer. You will be asked to enter an email address for this account. An email will then be sent to complete registration"><img src="'+cfg.proxy_path+'/badges/images/red-light.png" width="16" /><button class="smallsubbut" style="margin-left:10px" onclick="createIssuerAccount(\''+response.issuers[i].id+'\');">Create Account</button>';
				} else if (status == 0) {
					if (response.issuers[i].login) {
						html += '<div class="accountstatus" title="Registration Pending"><img src="'+cfg.proxy_path+'/badges/images/yellow-light.png" width="16" /><span style="padding-left:10px;">'+response.issuers[i].login+'</span></div>';
					} else {
						html += '<div class="accountstatus"><img src="'+cfg.proxy_path+'/badges/images/yellow-light.png" width="16" /><span style="padding-left:10px;">Requested</span></div>';
					}
				} else if (status == 1) {
					if (response.issuers[i].login) {
						html += '<div class="accountstatus" title="Registration Complete"><img style="vertical-align:middle" src="'+cfg.proxy_path+'/badges/images/green-light.png" width="16" /><span style="padding-left:10px;">'+response.issuers[i].login+'</span></div>';
					} else {
						html += '<div class="accountstatus"><img src="'+cfg.proxy_path+'/badges/images/green-light.png" width="16" /><span style="padding-left:10px;">Registered</span></div>';
					}
				} else {
					html += "Unknown";
				}
				html += "</td>";

				html += "</tr>";
			}
			html += "</table></center> <br> <br>";
			thediv.innerHTML = html;
		}
    }

	makeRequest("GET", cfg.proxy_path+"/issuers/list", {}, handler);
}