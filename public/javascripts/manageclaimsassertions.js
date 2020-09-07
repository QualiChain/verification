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

var badges = {};
var tableIssued = null;
var tableRevoked = null;

var recipients = {};
var assertions = {};
var protocol = "";
var domain = "";

function initializePage(sprotocol, sdomain) {

	protocol = sprotocol;
	domain = sdomain;

	loadBadgeData();
}

function revokedAssertion(assertionid) {
	var assertion = assertions[assertionid];

	var message = "Are you sure you want to REVOKE the badge issuance entry for: \n\n"+badges[assertion.badgeid].title+"\n\ngiven to: \n\n";
	message += recipients[assertion.recipientid].name+"\n\nThe badge recipient will be email to say their badge has been revoked.";

	var reply = confirm(message);
	if (reply == true) {
		var reason = prompt("Please enter a reason for revoking this badge issuance - not seen by badge recipient", "");
		if (reason != null) {
			var handler = function(response) {
				if (response.error) {
					showError(response);
				} else {
					updateList();
					//alert("The assertion record has been deleted");
				}
			}

			var send = {};
			send.id = assertionid;
			send.revokedreason = reason;
			makeRequest("POST", cfg.proxy_path+"/assertions/revoke", send, handler);
		}
	}
}

function editRevokedAssertion(assertionid) {
	var assertion = assertions[assertionid];

	var reason = prompt("Please enter a reason for revoking this badge issuance", assertion.revokedreason);
	if (reason != null) {
		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				updateList();
			}
		}

		var send = {};
		send.id = assertionid;
		send.revokedreason = reason;
		makeRequest("POST", cfg.proxy_path+"/assertions/updaterevocationreason", send, handler);
	}
}

function manageEvidence(id) {
	var evidencepageurl= protocol+"://"+domain+cfg.proxy_path+"/evidence/?badgeissuedid="+id;
	location.href = evidencepageurl;
}

function getEvidence(badgeissuedid) {

	var handler = function(response) {
		var count = 0;
		if (response && response.evidence && response.evidence.length > 0) {
			count = response.evidence.length;
			document.getElementById('evidencecount-'+badgeissuedid).innerHTML = count;
		}
	}

	makeRequest("GET", cfg.proxy_path+"/evidence/list/"+badgeissuedid, send, handler);
}

function viewFile(id) {
	window.open( cfg.proxy_path+"/assertions/view/"+id, "View Badge");
}

function loadBadgeData(){

	//console.log("IN loadBadgeData");

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			badges = {};

			//console.log(response.badges.length);

			if (response.length == 0) {
				loadRecipientData();
			} else {
				for (i = 0; i < response.badges.length; i++) {
					badges[response.badges[i].id] = response.badges[i];
				}
				loadRecipientData();
			}
		}
	}

	makeRequest("GET", cfg.proxy_path+cfg.badges_path+"/list", {}, handler);
}

function loadRecipientData(){

	//console.log("IN loadRecipientData");

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			recipients = {};

			if (response.length == 0) {
				updateList();
			} else {
				for (i = 0; i < response.recipients.length; i++) {
					recipients[response.recipients[i].id] = response.recipients[i];
				}
				updateList();
			}
		}
	}

	makeRequest("GET", cfg.proxy_path+"/recipients/list", {}, handler);
}

function updateList(){

	//console.log("IN updateList");

	var handler = function(response) {

		assertions = {};

		var dataPending = [];
		var dataIssued = [];
		var dataRevoked = [];

		var countPending = 0;
		var countIssued = 0;
		var countRevoked = 0;

		//console.log(response);

		if ( response && response.items && response.items.length > 0 ) {
			for (i = 0; i < response.items.length; i++) {

				var item = response.items[i];
				assertions[item.id] = item;

				if (item.status=="issued") {
					dataIssued[countIssued] = {};
					dataIssued[countIssued].id = response.items[i].id;
					if (response.items[i].recipientname) {
						dataIssued[countIssued].recipientname = response.items[i].recipientname;
					} else {
						dataIssued[countIssued].recipientname = "Unknown";
					}
					if (response.items[i].recipientemail) {
						dataIssued[countIssued].recipientemail = response.items[i].recipientemail;
					} else {
						dataIssued[countIssued].recipientemail = "Unknown";
					}
					recipients[response.items[i].recipientid] = {};
					recipients[response.items[i].recipientid].name = dataIssued[countIssued].recipientname;
					recipients[response.items[i].recipientid].email = dataIssued[countIssued].recipientemail;

					dataIssued[countIssued].badgename = badges[item.badgeid].title;
					dataIssued[countIssued].version = badges[item.badgeid].version;

					var cDate = new Date(item.issuedon*1000);
					var nicedate = cDate.format(DATE_FORMAT);

					dataIssued[countIssued].issuedon = nicedate;
					dataIssued[countIssued].view = '<center><button class="sbut" title="View Issued Badge" onclick="viewFile(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" /></button></center>';
					dataIssued[countIssued].revoke = '<center><button class="sbut" title="Revoke Issued Badge - The recipient will be notified by email." onclick="revokedAssertion(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/revoke.png" /></button></center>';

					countIssued++;
				} else if (item.status=="revoked") {
					dataRevoked[countRevoked] = {};
					dataRevoked[countRevoked].id = response.items[i].id;
					dataRevoked[countRevoked].recipientname = response.items[i].recipientname;
					dataRevoked[countRevoked].recipientemail = response.items[i].recipientemail;
					dataRevoked[countRevoked].badgename = badges[item.badgeid].title;
					dataRevoked[countRevoked].version = badges[item.badgeid].version;
					dataRevoked[countRevoked].revokereason = item.revokedreason;
					dataRevoked[countRevoked].editreason = '<button class="sbut" title="Edit revocation reason" onclick="editRevokedAssertion(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/edit.png" /></button>';

					recipients[response.items[i].recipientid] = {};
					recipients[response.items[i].recipientid].name = response.items[i].recipientname;
					recipients[response.items[i].recipientid].email = response.items[i].recipientemail;
					countRevoked++;
				}
			}
		}


		if (tableIssued != null) tableIssued.destroy();

		tableIssued = $('#storedListIssued').DataTable({
			"data": dataIssued,
			"stateSave": true,
			"columns": [
				{ "data": "id", "title": "ID", "width": "5%" },
				{ "data": "recipientname", "title": "Recipient Name", "width": "15%" },
				{ "data": "recipientemail", "title": "Recipient Email", "width": "20%" },
				{ "data": "badgename", "title": "Badge Name", "width": "25%" },
				{ "data": "version", "title": "Version", "width": "5%" },
				{ "data": "issuedon", "title": "Issued On", "width": "10%" },
				{ "data": "view" , "title": "View", "width": "10%", "orderable": false },
				{ "data": "revoke" , "title": "Revoke", "width": "10%", "orderable": false }
			],
			"order": [[ 0, "desc" ]]
		});

		if (tableRevoked != null) tableRevoked.destroy();

		tableRevoked = $('#storedListRevoked').DataTable({
			"data": dataRevoked,
			"stateSave": true,
			"columns": [
				{ "data": "id", "title": "ID", "width": "5%" },
				{ "data": "recipientname", "title": "Recipient Name", "width": "15%" },
				{ "data": "recipientemail", "title": "Recipient Email", "width": "20%" },
				{ "data": "badgename", "title": "Badge Name", "width": "25%" },
				{ "data": "version", "title": "Version", "width": "5%" },
				{ "data": "revokereason", "title": "Revocation Reason", "width": "25%" },
				{ "data": "editreason", "title": "Edit", "width": "5%" }
			],
			"order": [[ 0, "desc" ]]
		});

		// get the evidence counts for pending badges
		if ( response && response.items && response.items.length > 0 ) {
			for (i = 0; i < response.items.length; i++) {
				var item = response.items[i];
				if (item.status=="pending") {
					getEvidence(item.id);
				}
			}
		}

	}

	makeRequest("GET", cfg.proxy_path+"/assertions/listclaimed", {}, handler);
}
