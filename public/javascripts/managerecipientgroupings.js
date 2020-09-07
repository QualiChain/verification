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
var grouprecipients = {};

var grouprecipientids = [];
var recipientids = [];
var filteredrecipientids = [];

var groups = {};

var lefttable = null;
var righttable = null;

document.addEventListener('DOMContentLoaded', function () {
	initializePage();
});

function initializePage() {
	loadGroupData();
}

function loadGroupData() {
	//console.log("IN loadGroupData");

	var handler = function (response) {
		if (response.error) {
			showError(response);
		} else {
			groups = {};

			var thediv = document.getElementById('groupselectlist');

			//console.log(response.badges.length);

			if (response.length == 0) {
				thediv.innerHTML = "Currently there are no active groups to select";
				loadRecipientData();
			} else {
				// create list
				var html = '<select name="groupid" id="groupid" style="width: 95%;" onchange="redrawGroupList()">';
				html += '<option value="" disabled selected>Select a group</option>'

				for (i = 0; i < response.recipientgroups.length; i++) {
					if (response.recipientgroups[i].status == 1) {
						groups[response.recipientgroups[i].id] = response.recipientgroups[i];
						html += '<option value="' + response.recipientgroups[i].id + '">' + response.recipientgroups[i].name + '</option>';
					}
				}

				html += "</select>";
				thediv.innerHTML = html;

				loadRecipientData();
			}
		}
	}

	makeRequest("GET", cfg.proxy_path + "/recipients/groups/list", {}, handler);
}

function loadRecipientData() {

	$('#addBtn').addClass("disabled");
	$('#removeBtn').addClass("disabled");

	//console.log("IN loadGroupData");

	recipients = {};

	var handler = function (response) {
		if (response.error) {
			showError(response);
		} else {
			if (response && response.recipients && response.recipients.length > 0) {
				for (i = 0; i < response.recipients.length; i++) {
					recipients[response.recipients[i].id] = response.recipients[i];
					recipientids.push(response.recipients[i].id);
					filteredrecipientids.push(response.recipients[i].id);
				}
			}
			updateLeftList();
			drawGroupList();
		}
	}

	makeRequest("GET", cfg.proxy_path + "/recipients/list", {}, handler)
}

function redrawGroupList() {

	$('#addBtn').removeClass("disabled");
	$('#removeBtn').removeClass("disabled");

	var groupselect = document.getElementById('groupid');
	var groupid = groupselect.value;

	var groupname = $("#groupid :selected").text();

	$('#selectedGroupName').text('Recipients in ' + groupname);

	//right list
	updateGroupList(groupid);
}

function updateLeftList() {

	var data = new Array();
	for (i = 0; i < filteredrecipientids.length; i++) {

		data[i] = {};
		data[i].id = recipients[filteredrecipientids[i]].id;
		data[i].name = recipients[filteredrecipientids[i]].name;
		data[i].email = '<span title="' + recipients[filteredrecipientids[i]].email + '" >' + recipients[filteredrecipientids[i]].email + '</span>';

		var status = parseInt(recipients[filteredrecipientids[i]].status);
		if (status == -1) {
			data[i].useraccount = '<img title="Unregistered" src="' + cfg.proxy_path +'/images/red-light.png" width="16" />';
		} else if (status == 0) {
			data[i].useraccount = '<img title="Registration Pending" src="' + cfg.proxy_path + '/images/yellow-light.png" width="16" />';
		} else if (status == 1) {
			data[i].useraccount = '<img title="Registration Complete" src="'+cfg.proxy_path+'/images/green-light.png" width="16" />';
		} else {
			data[i].useraccount = "Unknown";
		}
	}

	if (lefttable != null) lefttable.destroy();

	lefttable = $('#fullList').DataTable({
		"data": data,
		"stateSave": true,
		"columns": [
			{ "data": "id", "title": "ID", "width": "10%" },
			{ "data": "name", "title": "Name", "width": "35%" },
			{ "data": "email", "title": "Email", "width": "45%" },
			{ "data": "useraccount", "title": "Account", "width": "10%" }
		],
		dom: 'Bfrtip',
		buttons: [
			'selectAll',
			'selectNone'
		],
		select: true,
		"order": [[0, "desc"]]
	});
}

function addToGroup() {
	//add to grouprecipientids

	let groupselect = document.getElementById('groupid');
	let groupid = groupselect.value;

	let addList = lefttable
		.rows({ selected: true })
		.data()
		.toArray();

	if (addList.length === 0) {
		alert('Please select at least one recipient to add to the group.');
	} else {
		for (let i = 0; i < addList.length; i++) {
			// store to global list by id
			grouprecipientids.push(addList[i].id);
		}

		var handler = function (response) {
			if (response.error) {
				showError(response);
			} else {
				updateGroupList(groupid);
			}
		}

		let send = {};
		send.id = groupid;
		send.recipientids = grouprecipientids.toString();
		// console.log(send.id);
		// console.log(send.recipientids);
		makeRequest("POST", cfg.proxy_path + "/recipients/groups/setrecipients", send, handler);
	}
}


function removeFromGroup() {
	//remove from grouprecipientids
	let groupselect = document.getElementById('groupid');
	let groupid = groupselect.value;

	let removeList = righttable
		.rows({ selected: true })
		.data()
		.toArray();

	if (removeList.length === 0) {
		alert('Please select at least one recipient to remove from the group.');
	} else {
		for (let i = 0; i < removeList.length; i++) {
			var index = grouprecipientids.indexOf(removeList[i].id);
			if (index > -1) {
				grouprecipientids.splice(index, 1);
			}
		}

		var handler = function (response) {
			if (response.error) {
				showError(response);
			} else {
				updateGroupList(groupid);
			}
		}

		let send = {};
		send.id = groupid;
		if (grouprecipientids.length === 0) {
			var message = "Are you sure you want to delete all recipients from the group:\n\n"+groups[groupid].name+"\n";
			var reply = confirm(message);
			if (reply == false) {
				return;
			}
		}

		send.recipientids = grouprecipientids.toString();

		//console.log(send.id);
		//console.log(send.recipientids);
		makeRequest("POST", cfg.proxy_path + "/recipients/groups/setrecipients", send, handler);
	}
}

function drawGroupList() {

	var data = new Array();

	//console.log(recipients);
	//console.log(grouprecipientids);

	for (let i = 0; i < grouprecipientids.length; i++) {
		data[i] = {};
		data[i].id = recipients[grouprecipientids[i]].id;
		data[i].name = recipients[grouprecipientids[i]].name;
		data[i].email = '<span title="' + recipients[grouprecipientids[i]].email + '" >'  + recipients[grouprecipientids[i]].email + '</span>';
		data[i].groupid = recipients[grouprecipientids[i]].groupid;

		var status = parseInt(recipients[grouprecipientids[i]].status);
		if (status == -1) {
			data[i].useraccount = '<img title="Unregistered" src="' + cfg.proxy_path +'/images/red-light.png" width="16" />';
		} else if (status == 0) {
			data[i].useraccount = '<img title="Registration Pending" src="' + cfg.proxy_path + '/images/yellow-light.png" width="16" />';
		} else if (status == 1) {
			data[i].useraccount = '<img title="Registration Complete" src="'+cfg.proxy_path+'/images/green-light.png" width="16" />';
		} else {
			data[i].useraccount = "Unknown";
		}
	}

	if (righttable != null) righttable.destroy();

	righttable = $('#groupList').DataTable({
		"data": data,
		"stateSave": true,
		"columns": [
			{ "data": "id", "title": "ID", "width": "10%" },
			{ "data": "name", "title": "Name", "width": "35%" },
			{ "data": "email", "title": "Email", "width": "45%" },
			{ "data": "useraccount", "title": "Account", "width": "10%" }
		],
		dom: 'Bfrtip',
		buttons: [
			'selectAll',
			'selectNone'
		],
		select: true,
		"order": [[0, "desc"]]
	});

	// update left list
	filteredrecipientids = recipientids.filter(x => !grouprecipientids.includes(x));
	updateLeftList();
}

function updateGroupList(groupid) {

	var handler = function (response) {

		grouprecipientids = [];

		var data = new Array();

		//console.log(response);

		if (response && response.recipients && response.recipients.length > 0) {
			for (let i = 0; i < response.recipients.length; i++) {
				// store to global list by id
				grouprecipientids.push(response.recipients[i].id);
				//console.log(response.recipients[i]);
			}
		}
		drawGroupList();

		// update left list
		filteredrecipientids = recipientids.filter(x => !grouprecipientids.includes(x));
		updateLeftList();
	}

	makeRequest("GET", cfg.proxy_path + "/recipients/groups/listrecipients/" + groupid, {}, handler);
}
