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

var endorsers = {};
var table = null;

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
	updateList();
}

function createEndorserAccount(endorserid) {
	var endorser = endorsers[endorserid];

	var loginemail = prompt("Please enter the email address for the account login", "");
	if (loginemail !== null) {

		if (loginemail == "" || !isValidEmail(loginemail)) {
			alert("Please enter a valid login email for this endorser");
			return;
		}

		var message = "Are you sure you want to use the email address:\n "+loginemail+" \nto create an account for endorser:\n"+endorser.name;
		var reply = confirm(message);
		if (reply == true) {

			var handler = function(response) {
				if (response.error) {
					showError(response);
				} else {
					updateList();
					alert("The endorser account record has been created");
				}
			}

			var send = {};
			send.id = endorserid;
			send.loginemail = loginemail;
			makeRequest("POST", cfg.proxy_path+"/endorsers/createuseraccount", send, handler);
		}
	}
}

function createEndorser() {
	var form = document.getElementById('formRec');

	if (form.url.value != "" && !isValidURI(form.url.value)) {
		alert("Please enter a valid url for this endorser");
		return;
	}

	if (form.email.value != "" && !isValidEmail(form.email.value)) {
		alert("Please enter a valid email for this endorser");
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

	makeRequest("POST", cfg.proxy_path+"/endorsers/create", send, handler);
}

function updateEndorser() {
	var editform = document.getElementById('formRecEdit');

	if (editform.url.value != "" && !isValidURI(editform.url.value)) {
		alert("Please enter a valid url for this endorser");
		return;
	}

	if (editform.email.value != "" && !isValidEmail(editform.email.value)) {
		alert("Please enter a valid email for this endorser");
		return;
	}

	if (editform.imageurl.value != "" && !isValidURI(editform.imageurl.value)) {
		alert("Please enter a valid image url for this endorser");
		return;
	}

	var send = {};
	send.id = editform.endorserid.value;
	send.name = demicrosoftize(editform.name.value);
	send.description = demicrosoftize(editform.description.value);
	send.url = editform.url.value;
	send.telephone = demicrosoftize(editform.telephone.value);
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

	makeRequest("POST", cfg.proxy_path+"/endorsers/update", send, handler);
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

	editform.endorserid.value = "";
	editform.name.value = "";
	editform.description.value = "";
	editform.url.value = "";
	editform.telephone.value = "";
	editform.email.value = "";
	editform.imageurl.value = "";

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function closeViewForm() {
	var viewform = document.getElementById('formRecView');

	viewform.name.value = "";
	viewform.description.value = "";
	viewform.url.value = "";
	viewform.telephone.value = "";
	viewform.email.value = "";
	viewform.imageurl.value = "";

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function editEndorser(endorserid) {
	var endorser = endorsers[endorserid];

	var editform = document.getElementById('formRecEdit');

	editform.endorserid.value = endorserid;
	editform.name.value = endorser.name;
	editform.description.value = endorser.description;
	editform.url.value = endorser.url;
	editform.telephone.value = demicrosoftize(endorser.telephone);
	editform.email.value = endorser.email;
	editform.imageurl.value = endorser.imageurl;

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "block";
	document.getElementById('createFormShowButton').style.display = "none";
}

function viewEndorser(endorserid) {
	var endorser = endorsers[endorserid];

	var viewform = document.getElementById('formRecView');

	viewform.name.value = endorser.name;
	viewform.description.value = endorser.description;
	viewform.url.value = endorser.url;
	viewform.telephone.value = endorser.telephone;
	viewform.email.value = endorser.email;
	viewform.imageurl.value = endorser.imageurl;

	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('viewDiv').style.display = "block";
	document.getElementById('createFormShowButton').style.display = "none";
}

function deleteEndorser(endorserid) {
	var endorser = endorsers[endorserid];

	var message = "Are you sure you want to delete the endorser entry for: "+endorser.name;
	var reply = confirm(message);
	if (reply == true) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				clearCreateForm(); // in case it was open
				cancelEditForm(); // in case it was open
				updateList();
				alert("The endorser record has been deleted");
			}
		}

		var send = {};
		send.id = endorserid;
		makeRequest("POST", cfg.proxy_path+"/endorsers/delete", send, handler);
	} else {
	  // do nothing
	}
}

function updateList(){

	var handler = function(response) {

		endorsers = {}
		var data = new Array();

		if ( response && response.endorsers && response.endorsers.length > 0 ) {

			for (i = 0; i < response.endorsers.length; i++) {

				// store to global list by id
				endorsers[response.endorsers[i].id] = response.endorsers[i]

				data[i] = {};
				data[i].id = response.endorsers[i].id;

				if (response.endorsers[i].imageurl && response.endorsers[i].imageurl != "") {
					data[i].image = '<img height="50"; src="'+response.endorsers[i].imageurl+'"/>';
				} else {
					data[i].image = ' ';
				}

				data[i].name = response.endorsers[i].name;

				data[i].view = '<center><button class="sbut" title="View" onclick="viewEndorser(\''+response.endorsers[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" /></button></center>';

				if (response.endorsers[i].usedInIssuance === false) {
					data[i].edit = '<center><button class="sbut" title="Edit" onclick="editEndorser(\''+response.endorsers[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/edit.png" /></button></center>';
				} else {
					data[i].edit = '<center>Used</center>';
				}

				var status = parseInt(response.endorsers[i].status);

				if (response.endorsers[i].usedInIssuance === true) {
					data[i].delete = '<center>Used</center>';
				} else if (response.endorsers[i].usedInIssuance === false && status == -1) {
					data[i].delete = '<center><button class="sbut" title="Delete" onclick="deleteEndorser(\''+response.endorsers[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/delete.png" /></button></center>';
				} else if (response.endorsers[i].usedInIssuance === false && status != -1) {
					data[i].delete = '<center>Account Exists</center>';
				} else {
					data[i].delete = "Unavailable";
				}

				if (status == -1) {
					data[i].useraccount = '<div class="accountstatus" title="Create an login Account for this Issuer. You will be asked to enter an email address for this account. An email will then be sent to complete registration"><img src="'+cfg.proxy_path+'/images/red-light.png" width="16" /><button class="smallsubbut" style="margin-left:10px" onclick="createEndorserAccount(\''+response.endorsers[i].id+'\');">Create Account</button>';
				} else if (status == 0) {
					if (response.endorsers[i].login) {
						data[i].useraccount = '<div class="accountstatus" title="Registration Pending"><img src="'+cfg.proxy_path+'/images/yellow-light.png" width="16" /><span style="padding-left:10px;">'+response.endorsers[i].login+'</span></div>';
					} else {
						data[i].useraccount = '<div class="accountstatus"><img src="'+cfg.proxy_path+'/images/yellow-light.png" width="16" /><span style="padding-left:10px;">Requested</span></div>';
					}
				} else if (status == 1) {
					if (response.endorsers[i].login) {
						data[i].useraccount = '<div class="accountstatus" title="Registration Complete"><img style="vertical-align:middle" src="'+cfg.proxy_path+'/images/green-light.png" width="16" /><span style="padding-left:10px;">'+response.endorsers[i].login+'</span></div>';
					} else {
						data[i].useraccount = '<div class="accountstatus"><img src="'+cfg.proxy_path+'/images/green-light.png" width="16" /><span style="padding-left:10px;">Registered</span></div>';
					}
				} else {
					data[i].useraccount = "Unknown";
				}
			}
		}

		if (table != null) table.destroy();

		table = $('#storedList').DataTable({
			"data": data,
			"stateSave": true,
			"columns": [
				{ "data": "id", "title": "ID", "width": "5%" },
				{ "data": "image", "title": "Image", "width": "20%", "orderable": false },
				{ "data": "name", "title": "Name", "width": "30%" },
				{ "data": "view" , "title": "View", "width": "10%" , "orderable": false},
				{ "data": "edit" , "title": "Edit", "width": "10%" , "orderable": true},
				{ "data": "delete" , "title": "Delete", "width": "10%" , "orderable": true},
				{ "data": "useraccount" , "title": "Delete", "width": "15%" },
			],
			"order": [[ 0, "desc" ]]
		});    	}

	makeRequest("GET", cfg.proxy_path+"/endorsers/list", {}, handler);
}