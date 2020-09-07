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

var DATE_FORMAT = 'd mmm yyyy';
var TIME_FORMAT = 'd/m/yy - H:MM';
var DATE_FORMAT_PHASE = 'd mmm yyyy H:MM';

var groups = {};
var table = null;

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
	updateList();
}

function createRecipientGroup() {
	var form = document.getElementById('formRec');
	var send = {};
	send.name = demicrosoftize(form.name.value);
	send.status = form.status.value;

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			clearCreateForm();
			updateList();
		}
	}
	makeRequest("POST", cfg.proxy_path+"/recipients/groups/create", send, handler);
}

function updateRecipientGroup() {
	var editform = document.getElementById('formRecEdit');
	var send = {};
	send.id = editform.groupid.value;
	send.name = demicrosoftize(editform.name.value);
	send.status = form.status.value;

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			cancelEditForm();
			updateList();
		}
	}
	makeRequest("POST", cfg.proxy_path+"/recipients/groups/update", send, handler);
}

function clearCreateForm() {
	var form = document.getElementById('formRec');
	form.name.value = "";
	form.status.value = 1;
}

function showCreateForm() {
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "block";
	document.getElementById('createButtonsDiv').style.display = "none";
}

function cancelCreateForm() {
	clearCreateForm();
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createButtonsDiv').style.display = "block";
}

function cancelEditForm() {
	var editform = document.getElementById('formRecEdit');
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createButtonsDiv').style.display = "block";
	editform.groupid.value = "";
	editform.name.value = "";
	editform.status.value = 1;
}

function fillEditForm(groupid) {
	var group = groups[groupid];
	var editform = document.getElementById('formRecEdit');
	editform.groupid.value = groupid;
	editform.name.value = group.name;
	editform.status.value = group.status;
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "block";
	document.getElementById('createButtonsDiv').style.display = "none";
}

function updateRecipientGroup() {
	var editform = document.getElementById('formRecEdit');
	var send = {};
	send.id = editform.groupid.value;
	send.name = demicrosoftize(editform.name.value);
	send.status = editform.status.value;
	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			cancelEditForm();
			updateList();
		}
	}
	makeRequest("POST", cfg.proxy_path+"/recipients/groups/update", send, handler);
}

function deleteRecipientGroup(groupid) {
	var group = groups[groupid];
	var message = "Are you sure you want to delete the group entry for:\n\n"+group.name+"\n";
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
		send.id = groupid;
		makeRequest("POST", cfg.proxy_path+"/recipients/groups/delete", send, handler);
	} else {
	  // do nothing
	}
}

function updateList(){
	var handler = function(response) {
		groups = {};
		var data = new Array();
		if ( response && response.recipientgroups && response.recipientgroups.length > 0 ) {
			for (i = 0; i < response.recipientgroups.length; i++) {
				// store to global list by id
				groups[response.recipientgroups[i].id] = response.recipientgroups[i];
				//console.log(response.recipientgroups[i]);
				data[i] = {};
				data[i].id = response.recipientgroups[i].id;
				var cDate = new Date(response.recipientgroups[i].timecreated * 1000);
				var nicedate = cDate.format(DATE_FORMAT);
				data[i].timecreated = nicedate;
				data[i].name = response.recipientgroups[i].name;
				if (response.recipientgroups[i].status === 1){
					data[i].status = 'Active';
				} else {
					data[i].status = 'Inactive';
				}
				//Edit
				data[i].edit = '<center><button class="sbut" title="Edit this Recipient record" onclick="fillEditForm(\''+response.recipientgroups[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/edit.png" /></button></center>';
				// Delete
				data[i].delete = '<center><button class="sbut" title="Delete this Recipient record" onclick="deleteRecipientGroup(\''+response.recipientgroups[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/delete.png" /></button></center>';
			}
		}

		if (table != null) table.destroy();

		table = $('#storedList').DataTable({
			"data": data,
			"stateSave": true,
			"columns": [
				{ "data": "id", "title": "ID", "width": "5%" },
				{ "data": "timecreated", "title": "Time created", "width": "15%", "orderable": true },
				{ "data": "name", "title": "Name", "orderable": true },
				{ "data": "status" , "title": "Status", "width": "10%", "orderable": true },
				{ "data": "edit" , "title": "Edit", "width": "5%" },
				{ "data": "delete" , "title": "Delete", "width": "5%" }
			],
			"order": [[ 0, "desc" ]]
		});
    }
	makeRequest("GET", cfg.proxy_path+"/recipients/groups/list", {}, handler);
}