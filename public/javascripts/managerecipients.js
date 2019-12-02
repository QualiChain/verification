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

var recipients = {};

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
	updateList();
}

function createRecipientAccount(recipientid) {
	var recipient = recipients[recipientid];
	var message = "Are you sure you want to verify the email address and create an account for recipient: "+recipient.name;
	var reply = confirm(message);
	if (reply == true) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				updateList();
				alert("The recipient account record has been created");
			}
		}

		var send = {};
		send.id = recipientid;
		makeRequest("POST", cfg.proxy_path+"/recipients/createuseraccount", send, handler);
	} else {
	  // do nothing
	}
}

function createRecipient() {
	var form = document.getElementById('formRec');

	if (form.email.value != "" && !isValidEmail(form.email.value)) {
		alert("Please enter a valid email for this issuer");
		return;
	}

	var send = {};
	send.name = demicrosoftize(form.name.value);
	send.email = form.email.value;
	send.issueruniqueid = demicrosoftize(form.uniqueid.value);

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			clearCreateForm();
			updateList();
		}
	}

	makeRequest("POST", cfg.proxy_path+"/recipients/create", send, handler);
}

function updateRecipient() {
	var editform = document.getElementById('formRecEdit');

	var send = {};
	send.id = editform.recipientid.value;
	send.name = demicrosoftize(editform.name.value);

	var recipient = recipients[send.id];
	if (recipient) {
		var status = parseInt(recipient.status);
		if (status == -1 && recipient.usedInIssuance === false) {
			send.email = editform.email.value;
		}
	}
	send.issueruniqueid = demicrosoftize(editform.uniqueid.value);

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			cancelEditForm();
			updateList();
		}
	}

	makeRequest("POST", cfg.proxy_path+"/recipients/update", send, handler);
}

function clearCreateForm() {
	var form = document.getElementById('formRec');

	form.name.value = "";
	form.email.value = "";
	form.uniqueid.value = "";
}

function showCreateForm() {
	clearCreateForm();

	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "block";
	document.getElementById('createFormShowButton').style.display = "none";
}

function cancelCreateForm() {
	clearCreateForm();

	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function cancelEditForm() {
	var editform = document.getElementById('formRecEdit');

	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
	document.getElementById('editemaildiv').style.display = "block";

	editform.recipientid.value = "";
	editform.name.value = "";
	editform.email.value = "";
	editform.uniqueid.value = "";
}

function editRecipient(recipientid) {
	var recipient = recipients[recipientid];

	var editform = document.getElementById('formRecEdit');

	editform.recipientid.value = recipientid;
	editform.name.value = recipient.name;
	editform.email.value = recipient.email;
	editform.uniqueid.value = recipient.uniqueid;

	// if recipient account status != -1, you can't edit the email address
	var status = parseInt(recipient.status);
	if (status != -1 && recipient.usedInIssuance === false) {
		document.getElementById('editemaildiv').style.display = "none";
	}

	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "block";
	document.getElementById('createFormShowButton').style.display = "none";
}

function deleteRecipient(recipientid) {
	var recipient = recipients[recipientid];

	var message = "Are you sure you want to delete the recipient entry for: "+recipient.name;
	var reply = confirm(message);
	if (reply == true) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				clearCreateForm(); // in case it was open
				cancelEditForm(); // in case it was open
				updateList();
				alert("The recipient record has been deleted");
			}
		}

		var send = {};
		send.id = recipientid;
		makeRequest("POST", cfg.proxy_path+"/recipients/delete", send, handler);
	} else {
	  // do nothing
	}
}

function updateList(){

	var handler = function(response) {

		recipients = {};
		var thediv = document.getElementById('storedList');
		thediv.innerHTML = "";

		if ( !response || !response.recipients || (response.recipients && response.recipients.length == 0) ) {
			thediv.innerHTML = "You have not added any recipients yet";
		} else {
			// clear global variable

			var html = "<center><table style='width:100%;line-height:120%;font-size: 14px;'>";
			html += '<tr>';
			html += '<th width="5%" class="tableheader">ID</th>';
			html += '<th width="30%" class="tableheader">Name</th>';
			html += '<th width="20%" class="tableheader">Email</th>';
			html += '<th width="10%" class="tableheader">Issuer Unique ID</th>';
			html += '<th width="10%" class="tableheader">Edit</th>';
			html += '<th width="10%" class="tableheader">Delete</th>';
			html += '<th width="15%" class="tableheader">User Account</th>';
			html += '</tr>';

			for (i = 0; i < response.recipients.length; i++) {

				// store to global list by id
				recipients[response.recipients[i].id] = response.recipients[i]

				html += "<tr>";

				html += "<td style='padding: 6px; border: 1px solid grey;'>";
				html += response.recipients[i].id;
				html += "</td>";

				html += "<td style='padding: 6px; border: 1px solid grey;'>";
				html += response.recipients[i].name;
				html += "</td>";

				html += "<td style='padding: 6px; border: 1px solid grey;'>";
				html += response.recipients[i].email;
				html += "</td>";

				html += "<td style='padding: 6px; border: 1px solid grey;'>";
				html += response.recipients[i].issueruniqueid;
				html += "</td>";

				html += '<td style="padding: 6px; border: 1px solid grey;">';
				if (response.recipients[i].usedInIssuance === false) {
					html += '<center><button class="sbut" title="Edit this Recipient record" onclick="editRecipient(\''+response.recipients[i].id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/edit.png" /></button></center>';
				} else {
					html += '<center>Used</center>';
				}
				html += '</td>';

				var status = parseInt(response.recipients[i].status);

				html += '<td style="padding: 6px; border: 1px solid grey;">';
				if (response.recipients[i].usedInIssuance === true) {
					html += '<center>Used</center>';
				} else if (response.recipients[i].usedInIssuance === false && status == -1) {
					html += '<center><button class="sbut" title="Delete this Recipient record" onclick="deleteRecipient(\''+response.recipients[i].id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/delete.png" /></center>';
				} else if (response.recipients[i].usedInIssuance === false && status != -1) {
					html += '<center>Account Exists</center>';
				} else {
					html += "Unavailable";
				}
				html += '</td>';

				html += "<td style='padding: 6px; border: 1px solid grey;'>";
				if (status == -1) {
					html += '<div class="accountstatus" title="Create an login Account for this Recipient. An email will be sent to complete registration"><img src="'+cfg.proxy_path+'/badges/images/red-light.png" width="16" /><button class="smallsubbut" onclick="createRecipientAccount(\''+response.recipients[i].id+'\');">Create Account</button></div>';
				} else if (status == 0) {
					html += '<div class="accountstatus" title="Registration Pending"><img src="'+cfg.proxy_path+'/badges/images/yellow-light.png" width="16" /><span style="padding-left:10px;">Requested</span></div>';
				} else if (status == 1) {
					html += '<div class="accountstatus" title="Registration Complete"><img src="'+cfg.proxy_path+'/badges/images/green-light.png" width="16" /><span style="padding-left:10px;">Registered</span></div>';
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


	makeRequest("GET", cfg.proxy_path+"/recipients/list", {}, handler)
}