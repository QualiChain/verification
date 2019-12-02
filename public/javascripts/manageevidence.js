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

var DATE_FORMAT = 'd mmm yyyy';
var TIME_FORMAT = 'd/m/yy - H:MM';
var DATE_FORMAT_PHASE = 'd mmm yyyy H:MM';

var assertion = {};
var badge = {};
var recipient = {};

var evidences = {};

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

	makeRequest("GET", cfg.proxy_path+"/badges/id/"+badgedid, {}, handler);
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

function updateList(){

	var handler = function(response) {

		var theevddiv = document.getElementById("storedList");
		theevddiv.innerHTML = "";
		evidences = {};

		//console.log('RESPONSE: ', response);
		if (response.error) {
			showError(response);
		} else {
			if ( !response || !response.evidence || (response.evidence && response.evidence.length == 0) ) {
				theevddiv.innerHTML = "Currently you have no Evidence records";
			} else {
				var html = "";

				html += "<center><table style='width:100%;line-height:120%;font-size: 14px;'>";
				html += "<tr>";

				html += "<th style='font-weight:400; background-color: lightgray; padding: 6px; border: 1px solid grey; text-align: center;'>Name</th>";
				html += "<th style='font-weight:400; background-color: lightgray; padding: 6px; border: 1px solid grey; text-align: center;'>View</th>";

				html += "<th style='font-weight:400; background-color: lightgray; padding: 6px; border: 1px solid grey; text-align: center;'>Edit</th>";

				html += "<th style='font-weight:400; background-color: lightgray; padding: 6px; border: 1px solid grey; text-align: center;'>Delete</th>";

				html += "</tr>";

				for (i = 0; i < response.evidence.length; i++) {
					var item = response.evidence[i];

					evidences[item.id] = item;
					//console.log(item.id);
					html += "<tr style='background-color: #fff;'>";

					html += "<td style='padding: 6px; border: 1px solid grey;'>";
					html += evidences[item.id].name;
					html += "</td>";

					html += '<td style="padding: 6px; border: 1px solid grey;">';
					html += '<center><button class="sbut" title="View" onclick="displayEvidence(\''+item.id+'\', \''+badgeissuedid+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/view.png" /></button></center>';
					html += '</td>';

					html += '<td style="padding: 6px; border: 1px solid grey;">';
					if (response.evidence[i].issued === false) {
						html += '<center><button class="sbut" title="Edit" onclick="editEvidence(\''+item.id+'\', \''+badgeissuedid+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/edit.png" /></button></center>';
					} else {
						html += '<center>Used</center>';
					}
					html += '</td>';

					html += '<td style="padding: 6px; border: 1px solid grey;">';
					if (response.evidence[i].issued === false) {
						html += '<center><button class="sbut" title="Delete" onclick="deleteEvidence(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/delete.png" /></button></center>';
					} else {
						html += '<center>Used</center>';
					}
					html += '</td>';

					html += "</tr>";
				}

				html += "</table>";
				html += "<center><br>";

				theevddiv.innerHTML = html;
			}
		}
	}
	var send = {};
	send.id = badgeissuedid;

	makeRequest("POST", cfg.proxy_path+"/evidence/list", send, handler);
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