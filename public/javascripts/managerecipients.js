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

var recipients = {};
var table = null;

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
	loadGroupData();
	// updateList();
}

function resendRecipientAccountEmail(recipientid) {
	var recipient = recipients[recipientid];
	var message = "Are you sure you want to send another account registration email to the recipient: \n\n" + recipient.name + "\n\n Using email address:\n\n" + recipient.email;
	var reply = confirm(message);
	if (reply == true) {

		var handler = function (response) {
			if (response.error) {
				showError(response);
			} else {
				updateList();
			}
		}

		var send = {};
		send.id = recipientid;
		makeRequest("POST", cfg.proxy_path + "/recipients/resenduseraccountemail", send, handler);
	} else {
		// do nothing
	}
}

function createRecipientAccount(recipientid) {
	var recipient = recipients[recipientid];
	var message = "Are you sure you want to verify the email address and create an account for recipient: \n\n"+recipient.name+"\n\nUsing email address:\n\n"+recipient.email;
	var reply = confirm(message);
	if (reply == true) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				updateList();
			}
		}

		var send = {};
		send.id = recipientid;
		makeRequest("POST", cfg.proxy_path+"/recipients/createuseraccount", send, handler);
	} else {
	  // do nothing
	}
}

function importBulkRecipients() {
	var form = document.getElementById('formRecBulk');

	if (form.recipientdatafile.value == "") {
		alert("Please select a file before trying to upload.");
	} else if (form.recipientdatafile.value.indexOf(".csv") == -1) {
		alert("Please select a csv file");
	} else {
		document.body.style.cursor = "wait";
		document.getElementById("bulkrecipientimportbutton").disabled = true;

		var message = "Are you sure you want to run a bulk recipient import\n";
		var reply = confirm(message);
		if (reply == true) {
			var formdata = new FormData(form);
			var handler = function(response) {
				if (response.error) {
					showError(response);
				} else {
					if (response.recipientsmissed.length > 0) {
						var message = "The following entries could not be process due to missing or corrupt data:\n\n";
						var count = response.recipientsmissed.length;
						for (var i=0; i<count; i++) {
							var item  = response.recipientsmissed[i];
							message += "Name: "+item.name+", Email: "+item.email+", UniqueID: "+item.issueruniqueid+"\n";
						}
						alert(message);
					}
					if (response.recipientsduplicates.length > 0) {
						var message = "The following entries already existed in the recipients table and where therefore not added through this import:\n\n";
						var count = response.recipientsduplicates.length;
						for (var i=0; i<count; i++) {
							var item  = response.recipientsduplicates[i];
							message += "Name: "+item.name+", Email: "+item.email+", UniqueID: "+item.issueruniqueid+"\n";
						}
						alert(message);
					}

					document.body.style.cursor = "default";
					document.getElementById("bulkrecipientimportbutton").disabled = false;

					clearCreateBulkForm();
					updateList();
				}
			}

			makeFileUploadRequest("POST", cfg.proxy_path+"/recipients/createbulk", formdata, handler);
		}
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
	send.groupid = form.groupid.value;

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

function clearCreateBulkForm() {
	var form = document.getElementById('formRecBulk');
	form.recipientdatafile.value = "";
}

function showCreateBulkForm() {
	clearCreateBulkForm();

	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createButtonsDiv').style.display = "none";

	document.getElementById('createBulkDiv').style.display = "block";
}

function clearCreateForm() {
	var form = document.getElementById('formRec');

	form.name.value = "";
	form.email.value = "";
	form.uniqueid.value = "";
	form.groupid.value = "";
}

function showCreateForm() {
	clearCreateBulkForm();

	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "block";
	document.getElementById('createBulkDiv').style.display = "none";
	document.getElementById('createButtonsDiv').style.display = "none";
}

function cancelCreateBulkForm() {
	clearCreateForm();

	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createBulkDiv').style.display = "none";
	document.getElementById('createButtonsDiv').style.display = "block";
}

function cancelCreateForm() {
	clearCreateForm();

	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createBulkDiv').style.display = "none";
	document.getElementById('createButtonsDiv').style.display = "block";
}

function cancelEditForm() {
	var editform = document.getElementById('formRecEdit');

	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createBulkDiv').style.display = "none";

	document.getElementById('createButtonsDiv').style.display = "block";
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
	editform.uniqueid.value = recipient.issueruniqueid;

	// if recipient account status != -1, you can't edit the email address
	var status = parseInt(recipient.status);
	if (status != -1 && recipient.usedInIssuance === false) {
		document.getElementById('editemaildiv').style.display = "none";
	}

	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "block";
	document.getElementById('createBulkDiv').style.display = "none";
	document.getElementById('createButtonsDiv').style.display = "none";
}

function deleteRecipient(recipientid) {
	var recipient = recipients[recipientid];

	var message = "Are you sure you want to delete the recipient entry for:\n\n"+recipient.name+"\n";
	var reply = confirm(message);
	if (reply == true) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				clearCreateForm(); // in case it was open
				cancelEditForm(); // in case it was open
				updateList();
			}
		}

		var send = {};
		send.id = recipientid;
		makeRequest("POST", cfg.proxy_path+"/recipients/delete", send, handler);
	} else {
	  // do nothing
	}
}

function loadGroupData() {

	//console.log("IN loadGroupData");

	var handler = function (response) {
		if (response.error) {
			showError(response);
		} else {
			groups = {};

			var thediv = document.getElementById('grouplist');

			//console.log(response.badges.length);

			if (response.length == 0) {
				thediv.innerHTML = "Currently there are no active groups to select";
				updateList();
			} else {
				// create list
				var html = '<select name="groupid" id="groupid" style="width: 95%;">';
				html += '<option value="" disabled selected>Select a group</option>'

				for (i = 0; i < response.recipientgroups.length; i++) {
					if (response.recipientgroups[i].status == 1) {
						groups[response.recipientgroups[i].id] = response.recipientgroups[i];
						html += '<option value="' + response.recipientgroups[i].id + '">' + response.recipientgroups[i].name + '</option>';
					}
				}

				html += "</select>";
				thediv.innerHTML = html;

				updateList();
			}
		}
	}

	makeRequest("GET", cfg.proxy_path + "/recipients/groups/list", {}, handler);
}

function updateList(){

	var handler = function(response) {

		recipients = {};
		var data = new Array();

		if ( response && response.recipients && response.recipients.length > 0 ) {
			for (i = 0; i < response.recipients.length; i++) {

				// store to global list by id
				recipients[response.recipients[i].id] = response.recipients[i];
				//console.log(response.recipients[i]);

				data[i] = {};

				data[i].id = response.recipients[i].id;
				data[i].name = response.recipients[i].name;
				data[i].email = response.recipients[i].email;

				if (response.recipients[i].issueruniqueid && response.recipients[i].issueruniqueid != null) {
					data[i].uniqueid = response.recipients[i].issueruniqueid;
				} else {
					data[i].uniqueid = "";
				}

				//Edit
				if (response.recipients[i].usedInIssuance === false) {
					data[i].edit = '<center><button class="sbut" title="Edit this Recipient record" onclick="editRecipient(\''+response.recipients[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/edit.png" /></button></center>';
				} else {
					data[i].edit = '<center>Used</center>';
				}

				var status = parseInt(response.recipients[i].status);

				// Delete
				if (response.recipients[i].usedInIssuance === true) {
					data[i].delete = '<center>Used</center>';
				} else if (response.recipients[i].usedInIssuance === false) { // && status == -1) {
					// you could delete them and the person would still hae a login account but possible no recipient account.
					data[i].delete = '<center><button class="sbut" title="Delete this Recipient record" onclick="deleteRecipient(\''+response.recipients[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/delete.png" /></center>';
				} else if (response.recipients[i].usedInIssuance === false && status != -1) {
					data[i].delete = '<center>Account Exists</center>';
				} else {
					data[i].delete = "Unavailable";
				}

				// User Account
				if (status == -1) {
					data[i].useraccount = '<div class="accountstatus" title="Create an login Account for this Recipient. An email will be sent to complete registration"><img src="' + cfg.proxy_path +'/images/red-light.png" width="16" /><span style="padding-left:10px;"><button class="smallsubbut" onclick="createRecipientAccount(\''+response.recipients[i].id+'\');">Create Account</button></span></div>';
				} else if (status == 0) {
					data[i].useraccount = '<div class="accountstatus" title="Registration Pending"><img src="' + cfg.proxy_path + '/images/yellow-light.png" width="16" /><span style="padding-left:10px;"><button title="An account has been inistialised. Recipient has been email. Awaiting registration completion. Click to send them another registration email." class="smallsubbut" onclick="resendRecipientAccountEmail(\'' + response.recipients[i].id +'\');">Resend Email</button></span></div>';
				} else if (status == 1) {
					data[i].useraccount = '<div class="accountstatus" title="Registration Complete"><img src="'+cfg.proxy_path+'/images/green-light.png" width="16" /><span style="padding-left:10px;">Registered</span></div>';
				} else {
					data[i].useraccount = "Unknown";
				}

				// Account Requested
				if (status == -1 && response.recipients[i].requestedaccount === true) {
					data[i].accountrequest = 'User Requested Account';
				} else {
					data[i].accountrequest = " ";
				}
			}
		}

		if (table != null) table.destroy();

		table = $('#storedList').DataTable({
			"data": data,
			"stateSave": true,
			"columns": [
				{ "data": "id", "title": "ID", "width": "5%" },
				{ "data": "name", "title": "Name", "width": "25%" },
				{ "data": "email" , "title": "Email", "width": "20%" },
				{ "data": "uniqueid" , "title": "Issuer Unique ID", "width": "10%" },
				{ "data": "edit" , "title": "Edit", "width": "5%", "orderable": true },
				{ "data": "delete" , "title": "Delete", "width": "5%", "orderable": true },
				{ "data": "useraccount" , "title": "User Account", "width": "15%" },
				{ "data": "accountrequest" , "title": "Account Request", "width": "15%" }
			],
			"order": [[ 0, "desc" ]]
		});
    }

	makeRequest("GET", cfg.proxy_path+"/recipients/list", {}, handler)
}