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

var assertion = {};
var badge = {};
var recipient = {};

var evidences = {};
var table = null;

var protocol = "";
var domain = "";
var badgeissuedid = "";

function initializePage(sprotocol, sdomain, sbadgeissuedid) {

	protocol = sprotocol;
	domain = sdomain;
	badgeissuedid = sbadgeissuedid;

	loadPendingBadgeIssuance();
}

function loadPendingBadgeIssuance() {
	//console.log("IN loadPendingBadgeIssuance");

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			assertion = response;
			if (assertion["badgeid"]) {
				loadBadgeData(assertion["badgeid"]);
			}
		}
	}

	makeRequest("GET", cfg.proxy_path+"/assertions/id/"+badgeissuedid, {}, handler);
}

function loadBadgeData(badgedid){
	//console.log("IN loadBadgeData");

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			badge = response;
			if (badge.title) {
				document.getElementById('badgename').innerHTML = badge.title;
			}

			if (assertion["recipientid"]) {
				loadRecipientData(assertion["recipientid"]);
			}
		}
	}

	makeRequest("GET", cfg.proxy_path+cfg.badges_path+"/id/"+badgedid, {}, handler);
}

function loadRecipientData(recipientid){
	//console.log("IN loadRecipientData");

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			recipient = response;

			if (recipient.name) {
				document.getElementById('recipientname').innerHTML = recipient.name;
			}

			updateList();
		}
	}

	makeRequest("GET", cfg.proxy_path+"/recipients/id/"+recipientid, {}, handler);
}

function createEvidence() {

	var form = document.getElementById('formAddEvid');

	if (form.url.value != "" && !isValidURI(form.url.value)) {
		alert("Please enter a valid url for this evidence");
		return;
	}

	var send = {};
	send.badgeissuedid = badgeissuedid;
	send.name = demicrosoftize(form.name.value);
	send.url = form.url.value;
	send.description = demicrosoftize(form.description.value);
	send.narrative = demicrosoftize(form.narrative.value);
	send.genre = demicrosoftize(form.genre.value);
	send.audience = demicrosoftize(form.audience.value);

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			clearCreateForm();
			updateList();
		}
	}

	makeRequest("POST", cfg.proxy_path+"/evidence/create", send, handler);
}

function clearCreateForm() {
	var theevddiv = document.getElementById('formAddEvid');

	theevddiv.name.value = "";
	theevddiv.url.value = "";
	theevddiv.description.value = "";
	theevddiv.narrative.value = "";
	theevddiv.genre.value = "";
	theevddiv.audience.value = "";
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

function cancelViewForm() {
	var theevddiv = document.getElementById('formViewEvid');

	theevddiv.evidenceid.value = "";
	theevddiv.name.value = "";
	theevddiv.url.value = "";
	theevddiv.description.value = "";
	theevddiv.narrative.value = "";
	theevddiv.genre.value = "";
	theevddiv.audience.value = "";

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function displayEvidence(evidenceid, badgeissuedid) {

	var theevddiv = document.getElementById('formViewEvid');

	theevddiv.evidenceid.value = evidences[evidenceid].id;
	theevddiv.name.value = evidences[evidenceid].name;
	theevddiv.url.value = evidences[evidenceid].url;
	theevddiv.description.value = evidences[evidenceid].description;
	theevddiv.narrative.value = evidences[evidenceid].narrative;
	theevddiv.genre.value = evidences[evidenceid].genre;
	theevddiv.audience.value = evidences[evidenceid].audience;

	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('viewDiv').style.display = "block";
	document.getElementById('createFormShowButton').style.display = "none";
}

function cancelEvidence() {
	cancelEditForm();
}

function cancelEditForm() {
	var theevddiv = document.getElementById('formEditEvid');

	theevddiv.name.value = "";
	theevddiv.url.value = "";
	theevddiv.description.value = "";
	theevddiv.narrative.value = "";
	theevddiv.genre.value = "";
	theevddiv.audience.value = "";

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function editEvidence(evidenceid, badgeissuedid) {

	var theevddiv =document.getElementById('formEditEvid');

	theevddiv.evidenceid.value = evidences[evidenceid].id;
	theevddiv.name.value = evidences[evidenceid].name;
	theevddiv.url.value = evidences[evidenceid].url;
	theevddiv.description.value = evidences[evidenceid].description;
	theevddiv.narrative.value = evidences[evidenceid].narrative;
	theevddiv.genre.value = evidences[evidenceid].genre;
	theevddiv.audience.value = evidences[evidenceid].audience;

	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "block";
	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "none";
}

function updateEvidence() {

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			cancelEditForm();
			updateList();
		}
	}

	var form = document.getElementById('formEditEvid');

	if (form.url.value != "" && !isValidURI(form.url.value)) {
		alert("Please enter a valid url for this evidence");
		return;
	}

	var send = {};
	send.id = form.evidenceid.value;
	send.name = demicrosoftize(form.name.value);
	send.url = form.url.value;
	send.description = demicrosoftize(form.description.value);
	send.narrative = demicrosoftize(form.narrative.value);
	send.genre = demicrosoftize(form.genre.value);
	send.audience = demicrosoftize(form.audience.value);

	makeRequest("POST", cfg.proxy_path+"/evidence/update", send, handler);
}

function deleteEvidence(evidenceid) {
	console.log("this is the ID", evidenceid);

	var message = "Are you sure you want to delete the evidence item: "+evidences[evidenceid].name;
	var reply = confirm(message);
	if (reply == true) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				clearCreateForm(); // in case was open
				cancelEditForm(); // just reset everything incase it is open;
				updateList();
			}
		}

		var send = {};
		send.id = evidenceid;
		makeRequest("POST", cfg.proxy_path+"/evidence/delete", send, handler);
	} else {
	  // do nothing
	}
}

function updateList(){

	var handler = function(response) {

		evidences = {};
		var data = new Array();

		//console.log('RESPONSE: ', response);
		if ( response && response.evidence && response.evidence.length > 0 ) {

			for (i = 0; i < response.evidence.length; i++) {

				var item = response.evidence[i];
				evidences[item.id] = item;

				data[i] = {};
				data[i].id = response.evidence[i].id;
				data[i].name = evidences[item.id].name;

				data[i].view = '<center><button class="sbut" title="View" onclick="displayEvidence(\''+item.id+'\', \''+badgeissuedid+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" /></button></center>';

				if (response.evidence[i].usedInIssuance === false) {
					data[i].edit = '<center><button class="sbut" title="Edit" onclick="editEvidence(\''+item.id+'\', \''+badgeissuedid+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/edit.png" /></button></center>';
				} else {
					data[i].edit = '<center>Used</center>';
				}

				if (response.evidence[i].usedInIssuance === false) {
					data[i].delete = '<center><button class="sbut" title="Delete" onclick="deleteEvidence(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/delete.png" /></button></center>';
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
				{ "data": "view" , "title": "View", "width": "15%", "orderable": false },
				{ "data": "edit" , "title": "Edit", "width": "15%", "orderable": true },
				{ "data": "delete" , "title": "Delete", "width": "15%", "orderable": true },
			],
			"order": [[ 0, "desc" ]]
		});
	}

	makeRequest("GET", cfg.proxy_path+"/evidence/list/"+badgeissuedid, {}, handler);
}