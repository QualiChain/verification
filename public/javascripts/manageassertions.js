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
var tablePending = null;
var tableIssued = null;
var tableRevoked = null;

var recipients = {};

var recipientids = [];
var currentrecipientaddids = [];
var currentrecipienteditids = [];

var assertions = {};
var protocol = "";
var domain = "";

function initializePage(sprotocol, sdomain) {

	protocol = sprotocol;
	domain = sdomain;

	loadBadgeData();
}

function resetCreateForm() {
	var form = document.getElementById('formRec');

	var recipientidobj = document.getElementById("recipientid");
	var badgerecobj = document.getElementById("badgerec");

	recipientidobj.value = "";
	badgerecobj.value = "";

	hideAllForms();
	document.getElementById('createDiv').style.display = "block";
}

function cancelEditForm() {
	var form = document.getElementById('formRecEdit');
	form.assertionid.value = "";

	var recipientidobj = document.getElementById("recipientidedit");
	var badgerecobj = document.getElementById("badgerecedit");

	recipientidobj.value = "";
	badgerecobj.value = "";

	hideAllForms();
	document.getElementById('createDiv').style.display = "block";
}

function editAssertion(assertionid) {
	var assertion = assertions[assertionid];

	var form = document.getElementById('formRecEdit');
	form.assertionid.value = assertionid;

	var recipientidobj = document.getElementById("recipientidedit");
	var badgerecobj = document.getElementById("badgerecedit");

	recipientidobj.value = assertion.recipientid;
	badgerecobj.value = assertion.badgeid;

	hideAllForms();
	document.getElementById('editDiv').style.display = "block";
}

function createAssertion() {
	var form = document.getElementById('formRec');

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			//code to do if successful here
			document.getElementById('createDiv').style.display = "block";
			document.getElementById('editDiv').style.display = "none";
			resetCreateForm();
			updateList();
		}
	}

	var send = {};

	var recipientidobj = document.getElementById("recipientid");
	var badgerecobj = document.getElementById("badgerec");

	var recipientid = recipientidobj.options[recipientidobj.selectedIndex].value;
	var badgeid = badgerecobj.options[badgerecobj.selectedIndex].value;

	var send = {};
	send.recipientid = recipientid;
	send.badgeid = badgeid;

	makeRequest("POST", cfg.proxy_path+"/assertions/create", send, handler);
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

	makeRequest("GET", cfg.proxy_path+"/evidence/list/"+badgeissuedid, {}, handler);
}

function viewFile(id) {
	window.open( cfg.proxy_path+"/assertions/view/"+id, "View Badge");
}

function updateAssertion() {
	var form = document.getElementById('formRecEdit');

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			cancelEditForm();
			updateList();
		}
	}

	var recipientidobj = document.getElementById("recipientidedit");
	var badgerecobj = document.getElementById("badgerecedit");

	var recipientid = recipientidobj.options[recipientidobj.selectedIndex].value;
	var badgeid = badgerecobj.options[badgerecobj.selectedIndex].value;

	var send = {};
	send.id = form.assertionid.value;
	send.recipientid = recipientid;
	send.badgeid = badgeid;

	makeRequest("POST", cfg.proxy_path+"/assertions/update", send, handler);
}

function issueAssertion(assertionid) {
	var assertion = assertions[assertionid];

	var message = "Are you sure you want to issue the badge:\n\n"+badges[assertion.badgeid].title+"\n\nto:\n\n"+recipients[assertion.recipientid].name;
	var reply = confirm(message);
	if (reply == true) {
		document.body.style.cursor = 'wait';
		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				document.body.style.cursor = 'default';
				updateList();
			}
		}

		var send = {};
		send.id = assertionid;

		makeRequest("POST", cfg.proxy_path+"/assertions/issue", send, handler);
	} else {
	  // do nothing
	}
}

function deleteAssertion(assertionid) {
	var assertion = assertions[assertionid];

	var message = "Are you sure you want to delete the pending badge issuance entry for:\n\n"+badges[assertion.badgeid].title+"\n\nto:\n\n"+recipients[assertion.recipientid].name;
	var reply = confirm(message);
	if (reply == true) {

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
		makeRequest("POST", cfg.proxy_path+"/assertions/delete", send, handler);
	} else {
	  // do nothing
	}
}

function loadBadgeData(){

	//console.log("IN loadBadgeData");

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			badges = {};

			var thediv =document.getElementById('badgelist');
			var theeditdiv =document.getElementById('badgelistedit');

			//console.log(response.badges.length);

			if (response.length == 0) {
				thediv.innerHTML = "Currently you are the issuer on no badge records";
				theeditdiv.innerHTML = "Currently you are the issuer on no badge records";
				loadRecipientGroupData();
			} else {
				// create list
				var html = '<select name="badgerec" id="badgerec">';
				html += '<option value="" disabled selected>Select a Badge</option>'

				var html2 = '<select name="badgerecedit" id="badgerecedit">';
				html2 += '<option value="" disabled selected>Select a Badge</option>'

				for (i = 0; i < response.badges.length; i++) {
					badges[response.badges[i].id] = response.badges[i];
					html += '<option value="'+ response.badges[i].id +'">'+ response.badges[i].title +" - v."+response.badges[i].version+ '</option>';
					html2 += '<option value="'+ response.badges[i].id +'">'+ response.badges[i].title +" - v."+response.badges[i].version+ '</option>';
				}

				html += "</select>";
				thediv.innerHTML = html;

				html2 += "</select>";
				theeditdiv.innerHTML = html2;

				loadRecipientGroupData();
			}
		}
	}

	makeRequest("GET", cfg.proxy_path+cfg.badges_path+"/list", {}, handler);
}

function loadRecipientGroupData() {

	var handler = function (response) {
		if (response.error) {
			showError(response);
		} else {

			var thediv = document.getElementById('groupselectlist');
			var thediv2 = document.getElementById('groupselectlistedit');
			if (response.length == 0) {
				thediv.innerHTML = "Currently there are no active groups to select from";
				thediv2.innerHTML = "Currently there are no active groups to select from";
				loadRecipientData();
			} else {
				// create list
				var html = '<select name="recipientgroups" id="recipientgroups" onchange="loadRecipientGroupList()">';
				html += '<option value="" selected>Select a group to filter recipient list</option>'

				var html2 = '<select name="recipientgroupsedit" id="recipientgroupsedit" onchange="loadRecipientGroupListEdit()">';
				html2 += '<option value="" selected>Select a group to filter recipient list</option>'

				for (i = 0; i < response.recipientgroups.length; i++) {
					if (response.recipientgroups[i].status == 1) {
						html += '<option value="' + response.recipientgroups[i].id + '">' + response.recipientgroups[i].name + '</option>';
						html2 += '<option value="' + response.recipientgroups[i].id + '">' + response.recipientgroups[i].name + '</option>';
					}
				}

				html += "</select>";
				thediv.innerHTML = html;

				html2 += "</select>";
				thediv2.innerHTML = html2;

				loadRecipientData();
			}
		}
	}

	makeRequest("GET", cfg.proxy_path + "/recipients/groups/list", {}, handler);
}

function loadRecipientData(){

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			recipients = {};
			for (i = 0; i < response.recipients.length; i++) {
				recipients[response.recipients[i].id] = response.recipients[i];
				recipientids.push(response.recipients[i].id);
			}

			currentrecipientaddids = [].concat(recipientids);
			currentrecipienteditids = [].concat(recipientids);

			drawRecipientLists();

			updateList();
		}
	}

	makeRequest("GET", cfg.proxy_path+"/recipients/list", {}, handler);
}

function loadRecipientGroupList() {
	let recipientgroups = document.getElementById('recipientgroups');
	let groupid = recipientgroups.options[recipientgroups.selectedIndex].value;

	if (groupid == "") {
		currentrecipientaddids = [].concat(recipientids);
		drawRecipientLists();
	} else {
		currentrecipientaddids = [];
		var innerhandler = function (response) {
			if (response.error) {
				showError(response);
			} else {
				if (response && response.recipients && response.recipients.length > 0) {
					for (i = 0; i < response.recipients.length; i++) {
						currentrecipientaddids.push(response.recipients[i].id);
					}
				}
			}
			drawRecipientLists();
		}
		makeRequest("GET", cfg.proxy_path + "/recipients/groups/listrecipients/" + groupid, {}, innerhandler);
	}
}

function loadRecipientGroupListEdit() {
	let recipientgroupsedit = document.getElementById('recipientgroupsedit');
	let groupid = recipientgroupsedit.options[recipientgroupsedit.selectedIndex].value;

	if (groupid == "") {
		currentrecipientaddids = [].concat(recipientids);
		drawRecipientLists();
	} else {
		currentrecipienteditids = [];

		var innerhandler = function (response) {
			if (response.error) {
				showError(response);
			} else {
				if (response && response.recipients && response.recipients.length > 0) {
					for (i = 0; i < response.recipients.length; i++) {
						currentrecipienteditids.push(response.recipients[i].id);
					}
				}
			}
			drawRecipientLists();
		}

		makeRequest("GET", cfg.proxy_path + "/recipients/groups/listrecipients/" + groupid, {}, innerhandler);
	}
}

function drawRecipientLists(){

	var thediv =document.getElementById('recipientlist');
	var theeditdiv =document.getElementById('recipientlistedit');

	thediv.innerHTML = "";
	theeditdiv.innerHTML = "";

	if (currentrecipientaddids.length == 0) {
		thediv.innerHTML = "No recipients";
	} else if (currentrecipienteditids.length == 0) {
		theeditdiv.innerHTML = "No recipients";
	} else {
		var html = '<select name="recipientid" id="recipientid">';
		html += '<option value="" disabled selected>Select a Recipient</option>'
		var html2 = '<select name="recipientidedit" id="recipientidedit">';
		html2 += '<option value="" disabled selected>Select a Recipient</option>'

		for (i = 0; i < currentrecipientaddids.length; i++) {
			if (recipients[currentrecipientaddids[i]].status == 1) {
				html += '<option value="'+ recipients[currentrecipientaddids[i]].id +'">'+ recipients[currentrecipientaddids[i]].name +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;('+ recipients[currentrecipientaddids[i]].email+ ')</option>';
			}
		}
		for (i = 0; i < currentrecipienteditids.length; i++) {
			if (recipients[currentrecipienteditids[i]].status == 1) {
				html2 += '<option value="'+ recipients[currentrecipienteditids[i]].id +'">'+ recipients[currentrecipienteditids[i]].name +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;('+ recipients[currentrecipienteditids[i]].email+ ')</option>';
			}
		}

		html += "</select>";
		thediv.innerHTML = html;

		html2 += "</select>";
		theeditdiv.innerHTML = html2;
	}
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

				if (item.status=="pending") {

					dataPending[countPending] = {};
					dataPending[countPending].id = response.items[i].id;

					if (recipients[item.recipientid]) {
						dataPending[countPending].recipientname = recipients[item.recipientid].name;
					} else {
						dataPending[countPending].recipientname = "Unknown";
					}

					dataPending[countPending].badgename = badges[item.badgeid].title;
					dataPending[countPending].version = badges[item.badgeid].version;

					dataPending[countPending].edit = '<center><button class="sbut" title="Edit" onclick="editAssertion(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/edit.png" /></button></center>';

					dataPending[countPending].manageevidence = '<div style="float:left;margin-left:20px; margin-top:5px;"><span>Items: </span><span style="padding-right:20px;font-weight:bold" id="evidencecount-'+item.id+'">0</span></div>';
					dataPending[countPending].manageevidence += '<button class="sbut" title="Manage Evidence" onclick="manageEvidence(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/evidence.png" /></button>';

					dataPending[countPending].issue = '<center><button class="sbut" title="Issue" onclick="issueAssertion(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/issue.png" /></button></center>';
					dataPending[countPending].delete = '<center><button class="sbut" title="Delete" onclick="deleteAssertion(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/delete.png" /></button></center>';

					countPending++;
				} else if (item.status=="issued") {

					dataIssued[countIssued] = {};
					dataIssued[countIssued].id = response.items[i].id;
					if (recipients[item.recipientid]) {
						dataIssued[countIssued].recipientname = recipients[item.recipientid].name;
					} else {
						dataIssued[countIssued].recipientname = "Unknown";
					}
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
					dataRevoked[countRevoked].recipientname = recipients[item.recipientid].name;
					dataRevoked[countRevoked].badgename = badges[item.badgeid].title;
					dataRevoked[countRevoked].version = badges[item.badgeid].version;
					dataRevoked[countRevoked].revokereason = item.revokedreason;
					dataRevoked[countRevoked].editreason = '<button class="sbut" title="Edit revocation reason" onclick="editRevokedAssertion(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/edit.png" /></button>';

					countRevoked++;
				}
			}
		}

		if (tablePending != null) tablePending.destroy();

		tablePending = $('#storedListPending').DataTable({
			"data": dataPending,
			"stateSave": true,
			"columns": [
				{ "data": "id", "title": "ID", "width": "5%" },
				{ "data": "recipientname", "title": "Recipient Name", "width": "20%" },
				{ "data": "badgename", "title": "Badge Name", "width": "20%" },
				{ "data": "version", "title": "Version", "width": "10%" },
				{ "data": "edit" , "title": "Edit", "width": "10%", "orderable": false },
				{ "data": "manageevidence" , "title": "Manage Evidence", "width": "15%", "orderable": false },
				{ "data": "issue" , "title": "Issue", "width": "10%", "orderable": false },
				{ "data": "delete", "title": "Delete", "width": "10%", "orderable": false }
			],
			"order": [[ 0, "desc" ]]
		});

		if (tableIssued != null) tableIssued.destroy();

		tableIssued = $('#storedListIssued').DataTable({
			"data": dataIssued,
			"stateSave": true,
			"columns": [
				{ "data": "id", "title": "ID", "width": "5%" },
				{ "data": "recipientname", "title": "Recipient Name", "width": "25%" },
				{ "data": "badgename", "title": "Badge Name", "width": "30%" },
				{ "data": "version", "title": "Version", "width": "10%" },
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
				{ "data": "recipientname", "title": "Recipient Name", "width": "25%" },
				{ "data": "badgename", "title": "Badge Name", "width": "30%" },
				{ "data": "version", "title": "Version", "width": "5%" },
				{ "data": "revokereason", "title": "Revocation Reason", "width": "30%" },
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

	makeRequest("GET", cfg.proxy_path+"/assertions/list", {}, handler);
}

function hideAllForms() {
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
}
