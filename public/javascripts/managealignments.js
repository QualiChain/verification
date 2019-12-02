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

var alignments = {};

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
	editform.code.value = alignment.framework;
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
	viewform.code.value = alignment.framework;
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
				alert("The alignment record has been deleted");
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

		var thediv =document.getElementById('storedList');
		thediv.innerHTML = "";
		alignments = {}

		if ( !response || !response.alignments || (response.alignments && response.alignments.length == 0) ) {
			thediv.innerHTML = "You have not added any alignments yet";
		} else {
			// clear global variable

			var html = "<center><table style='width:100%;line-height:120%;font-size: 14px;'>";
			html += "<tr>";

			html += '<th width="15%" style="background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;">ID</th>';
			html += '<th width="40%" style="background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;">Name</th>';
			html += '<th width="15%" style="background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;">View</th>';
			html += '<th width="15%" style="background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;">Edit</th>';
			html += '<th width="15%" style="background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;">Delete</th>';

			html += "</tr>";
			for (i = 0; i < response.alignments.length; i++) {

				// store to global list by id
				alignments[response.alignments[i].id] = response.alignments[i]

				html += "<tr>";

				html += "<td style='padding: 6px; border: 1px solid grey;'>";
				html += response.alignments[i].id;
				html += "</td>";

				html += "<td style='padding: 6px; border: 1px solid grey;'>";
				html += response.alignments[i].name;
				html += "</td>";

				html += '<td style="padding: 6px; border: 1px solid grey;">';
				html += '<center><button class="sbut" title="View" onclick="viewAlignment(\''+response.alignments[i].id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/view.png" /></button></center>';
				html += '</td>';

				html += '<td style="padding: 6px; border: 1px solid grey;">';
				if (response.alignments[i].usedInIssuance === false) {
					html += '<center><button class="sbut" title="Edit" onclick="editAlignment(\''+response.alignments[i].id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/edit.png" /></button></center>';
				} else {
					html += '<center>Used</center>';
				}
				html += '</td>';

				html += '<td style="padding: 6px; border: 1px solid grey;">';
				if (response.alignments[i].usedInIssuance === false) {
					html += '<center><button class="sbut" title="Delete" onclick="deleteAlignment(\''+response.alignments[i].id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/delete.png" /></button></center>';
				} else {
					html += '<center>Used</center>';
				}
				html += '</td>';

				html += "</tr>";
			}
			html += "</table></center> <br> <br>";
			thediv.innerHTML = html;
		}
	}

	makeRequest("GET", cfg.proxy_path+"/alignments/list", {}, handler);
}