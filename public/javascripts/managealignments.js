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

var alignments = {};
var table = null;

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
	updateList();
}

function createAlignment() {
	var form = document.getElementById('formRec');

	var send = {};
	send.url = form.url.value;
	send.name = demicrosoftize(form.name.value);
	send.description = demicrosoftize(form.description.value);
	send.code = demicrosoftize(form.code.value);
	send.framework = demicrosoftize(form.framework.value);

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			clearCreateForm();
			updateList();
		}
	}

	makeRequest("POST", cfg.proxy_path+"/alignments/create", send, handler);
}

function updateAlignment() {
	var form = document.getElementById('formRecEdit');

	var send = {};
	send.id = form.alignmentid.value;

	send.url = form.url.value;
	send.name = demicrosoftize(form.name.value);
	send.description = demicrosoftize(form.description.value);
	send.code = demicrosoftize(form.code.value);
	send.framework = demicrosoftize(form.framework.value);

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			cancelEditForm();
			updateList();
		}
	}

	makeRequest("POST", cfg.proxy_path+"/alignments/update", send, handler);
}

function clearCreateForm() {
	var form = document.getElementById('formRec');

	form.name.value = "";
	form.url.value = "";
	form.description.value = "";
	form.code.value = "";
	form.framework.value = "";
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

	editform.alignmentid.value = "";

	editform.name.value = "";
	editform.url.value = "";
	editform.description.value = "";
	editform.code.value = "";
	editform.framework.value = "";

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function closeViewForm() {
	var viewform = document.getElementById('formRecView');

	viewform.name.value = "";
	viewform.url.value = "";
	viewform.description.value = "";
	viewform.code.value = "";
	viewform.framework.value = "";

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function editAlignment(alignmentid) {
	var alignment = alignments[alignmentid];

	var editform = document.getElementById('formRecEdit');

	editform.alignmentid.value = alignmentid;

	editform.name.value = alignment.name;
	editform.url.value = alignment.url;
	editform.description.value = alignment.description;
	editform.code.value = alignment.code;
	editform.framework.value = alignment.framework;

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "block";
	document.getElementById('createFormShowButton').style.display = "none";
}

function viewAlignment(alignmentid) {
	var alignment = alignments[alignmentid];

	var viewform = document.getElementById('formRecView');

	viewform.name.value = alignment.name;
	viewform.url.value = alignment.url;
	viewform.description.value = alignment.description;
	viewform.code.value = alignment.code;
	viewform.framework.value = alignment.framework;

	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('viewDiv').style.display = "block";
	document.getElementById('createFormShowButton').style.display = "none";
}

function deleteAlignment(alignmentid) {
	var alignment = alignments[alignmentid];

	var message = "Are you sure you want to delete the alignment entry for: "+alignment.name;
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
		send.id = alignmentid;
		makeRequest("POST", cfg.proxy_path+"/alignments/delete", send, handler);
	} else {
	  // do nothing
	}
}

function updateList(){

	var handler = function(response) {

		alignments = {}
		var data = new Array();

		if ( response && response.alignments && response.alignments.length > 0 ) {

			for (i = 0; i < response.alignments.length; i++) {

				// store to global list by id
				alignments[response.alignments[i].id] = response.alignments[i]

				data[i] = {};

				data[i].id = response.alignments[i].id;
				data[i].name = response.alignments[i].name;

				data[i].view = '<center><button class="sbut" title="View" onclick="viewAlignment(\''+response.alignments[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" /></button></center>';

				if (response.alignments[i].usedInIssuance === false) {
					data[i].edit = '<center><button class="sbut" title="Edit" onclick="editAlignment(\''+response.alignments[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/edit.png" /></button></center>';
				} else {
					data[i].edit = '<center>Used</center>';
				}

				if (response.alignments[i].usedInIssuance === false) {
					data[i].delete = '<center><button class="sbut" title="Delete" onclick="deleteAlignment(\''+response.alignments[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/delete.png" /></button></center>';
				} else {
					data[i].delete = '<center>Used</center>';
				}
			}
		}

		if (table != null) table.destroy();

		table = $('#storedList').DataTable({
			"data": data,
			"stateSave": true,
			"columns": [
				{ "data": "id", "title": "ID", "width": "5%" },
				{ "data": "name", "title": "Name", "width": "50%" },
				{ "data": "view" , "title": "View", "width": "15%", "orderable": true },
				{ "data": "edit" , "title": "Edit", "width": "15%", "orderable": true },
				{ "data": "delete" , "title": "Delete", "width": "15%", "orderable": true },
			],
			"order": [[ 0, "desc" ]]
		});
	}

	makeRequest("GET", cfg.proxy_path+"/alignments/list", {}, handler);
}