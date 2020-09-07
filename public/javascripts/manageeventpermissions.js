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

//var DATE_FORMAT = 'd mmm yyyy';
//var TIME_FORMAT = 'd/m/yy - H:MM';
//var DATE_FORMAT_PHASE = 'd mmm yyyy H:MM';

var table = null;

var recipients = {};
var events = {};
var records = {};

var protocol = "";
var domain = "";

function initializePage(sprotocol, sdomain) {

	protocol = sprotocol;
	domain = sdomain;

	loadEventData();
}

function showCreateBulkForm() {
	clearCreateBulkForm();

	hideAllForms();
	document.getElementById('createBulkDiv').style.display = "block";
}

function showCreateForm() {
	clearCreateForm();

	hideAllForms();
	document.getElementById('createDiv').style.display = "block";
}

function clearCreateBulkForm() {
	var form = document.getElementById('formRecBulk');

	var eventrecobj = document.getElementById("eventid");
	eventrecobj.value = "";

	form.recipientdatafile.value = "";
}

function clearCreateForm() {
	var form = document.getElementById('formRec');

	var recipientdobj = document.getElementById("recipientid");
	var eventrecobj = document.getElementById("eventrec");
	var displaynameyes = document.getElementById("displaynameaddyes");
	var displaynameno = document.getElementById("displaynameaddno");

	recipientdobj.value = "";
	eventrecobj.value = "";
	displaynameyes.checked = false;
	displaynameno.checked = false;
}

function clearEditForm() {
	var form = document.getElementById('formRecEdit');
	form.recordid.value = recordid;

	var recipientdobj = document.getElementById("recipientidedit");
	var eventrecobj = document.getElementById("eventrecedit");
	var displaynameyes = document.getElementById("displaynameedityes");
	var displaynameno = document.getElementById("displaynameeditno");

	recipientdobj.value = "";
	eventrecobj.value = "";
	displaynameyes.checked = false;
	displaynameno.checked = false;
}


function cancelCreateBulkForm() {
	clearCreateBulkForm();
	hideAllForms();
	document.getElementById('createButtonsDiv').style.display = "block";
}

function cancelCreateForm() {
	clearCreateForm();
	hideAllForms();
	document.getElementById('createButtonsDiv').style.display = "block";
}

function cancelEditForm() {
	clearEditForm();
	hideAllForms();
	document.getElementById('createButtonsDiv').style.display = "block";
}

function editEventRecipientPermission(recordid) {
	var record = records[recordid];

	var form = document.getElementById('formRecEdit');
	form.recordid.value = recordid;

	var recipientdobj = document.getElementById("recipientidedit");
	var eventrecobj = document.getElementById("eventrecedit");
	var displaynameyes = document.getElementById("displaynameedityes");
	var displaynameno = document.getElementById("displaynameeditno");

	recipientdobj.value = record.recipientid;
	eventrecobj.value = record.eventid;

	if (record.canshowname == 1) {
		displaynameyes.checked = true;
	} else {
		displaynameno.checked = true;
	}

	hideAllForms();
	document.getElementById('editDiv').style.display = "block";
}

function importBulkEventRecipientPermissions() {
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
							message += "Name: "+item.name+", Email: "+item.email+", Can Show Name: "+item.canshowname+"\n";
						}
						alert(message);
					}
					if (response.recipientsduplicates.length > 0) {
						var message = "The following entries already existed in the recipients table and where therefore not added through this import:\n\n";
						var count = response.recipientsduplicates.length;
						for (var i=0; i<count; i++) {
							var item  = response.recipientsduplicates[i];
							message += "Name: "+item.name+", Email: "+item.email+", Can Show Name: "+item.canshowname+"\n";
						}
						alert(message);
					}

					document.body.style.cursor = "default";
					document.getElementById("bulkrecipientimportbutton").disabled = false;

					cancelCreateBulkForm();
					updateList();
				}
			}

			makeFileUploadRequest("POST", cfg.proxy_path+"/events/addbulkrecipientpermission", formdata, handler);
		}
	}
}

function createEventRecipientPermission() {
	var form = document.getElementById('formRec');

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			//code to do if successful here
			document.getElementById('createDiv').style.display = "block";
			document.getElementById('editDiv').style.display = "none";
			showCreateForm();
			updateList();
		}
	}

	var recipientidobj = document.getElementById("recipientid");
	var eventrecobj = document.getElementById("eventrec");

	var recipientid = recipientidobj.options[recipientidobj.selectedIndex].value;
	var eventid = eventrecobj.options[eventrecobj.selectedIndex].value;

	var displaynameyes = document.getElementById("displaynameaddyes");

	var canshowname = false;
	if (displaynameyes.checked) {
		canshowname = true;
	}


	var send = {};
	send.recipientid = recipientid;
	send.eventid = eventid;
	send.canshowname = canshowname;

	makeRequest("POST", cfg.proxy_path+"/events/addrecipientpermission", send, handler);
}

function updateEventRecipientPermission() {
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
	var eventrecobj = document.getElementById("eventrecedit");
	var displaynameyes = document.getElementById("displaynameedityes");

	var recipientid = recipientidobj.options[recipientidobj.selectedIndex].value;
	var eventid = eventrecobj.options[eventrecobj.selectedIndex].value;

	var canshowname = false;
	if (displaynameyes.checked) {
		canshowname = true;
	}

	var send = {};
	send.id = form.recordid.value;
	send.canshowname = canshowname;

	makeRequest("POST", cfg.proxy_path+"/events/updaterecipientpermission", send, handler);
}

function deleteEventRecipientPermission(recordid) {
	var record = records[recordid];

	var message = "Are you sure you want to delete the event recipient permission entry for:\n\n"+recipients[record.recipientid].name+"\n\nat:\n\n"+events[record.eventid].name;
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
		send.id = recordid;
		makeRequest("POST", cfg.proxy_path+"/events/deleterecipientpermission", send, handler);
	} else {
	  // do nothing
	}
}

function loadEventData(){

	//console.log("IN loadEventData");

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			events = {};

			var thediv =document.getElementById('eventlist');
			var theeditdiv =document.getElementById('eventlistedit');
			var thebulkdiv =document.getElementById('eventlistbulk');

			//console.log(response.badges.length);

			if (response.length == 0) {
				thediv.innerHTML = "Currently you are the issuer on no badges with event records";
				theeditdiv.innerHTML = "Currently you are the issuer on no badges with event records";
				thebulkdiv.innerHTML = "Currently you are the issuer on no badges with event records";
				loadRecipientData();
			} else {
				// create list
				var html = '<select name="eventrec" id="eventrec">';
				html += '<option value="" disabled selected>Select an Event</option>'

				var html2 = '<select name="eventrecedit" id="eventrecedit">';
				html2 += '<option value="" disabled selected>Select an Event</option>'

				var html3 = '<select name="eventid" id="eventid">';
				html3 += '<option value="" disabled selected>Select an Event</option>'

				for (i = 0; i < response.events.length; i++) {
					events[response.events[i].id] = response.events[i];
					html += '<option value="'+ response.events[i].id +'">'+ response.events[i].name + '</option>';
					html2 += '<option value="'+ response.events[i].id +'">'+ response.events[i].name + '</option>';
					html3 += '<option value="'+ response.events[i].id +'">'+ response.events[i].name + '</option>';
				}

				html += "</select>";
				thediv.innerHTML = html;

				html2 += "</select>";
				theeditdiv.innerHTML = html2;

				html3 += "</select>";
				thebulkdiv.innerHTML = html3;

				loadRecipientData();
			}
		}
	}

	makeRequest("GET", cfg.proxy_path+"/events/listforissuer", {}, handler);
}

function loadRecipientData(){

	console.log("IN loadRecipientData");

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			recipients = {};

			var theeditdiv =document.getElementById('recipientlistedit');
			var thediv =document.getElementById('recipientlist');

			if (response.length == 0) {
				thediv.innerHTML = "Currently you have no stored recipient records";
				theeditdiv.innerHTML = "Currently you have no stored recipient records";
				updateList();
			} else {

				var html = '<select name="recipientid" id="recipientid">';
				html += '<option value="" disabled selected>Select a Recipient</option>'

				var html2 = '<select name="recipientidedit" id="recipientidedit">';
				html2 += '<option value="" disabled selected>Select a Recipient</option>'

				for (i = 0; i < response.recipients.length; i++) {
					recipients[response.recipients[i].id] = response.recipients[i];
					html += '<option value="'+ response.recipients[i].id +'">'+ response.recipients[i].name +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;('+ response.recipients[i].email+ ')</option>';
					html2 += '<option value="'+ response.recipients[i].id +'">'+ response.recipients[i].name +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;('+ response.recipients[i].email+ ')</option>';
				}
				html += "</select>";
				thediv.innerHTML = html;

				html2 += "</select>";
				theeditdiv.innerHTML = html2;

				updateList();
			}
		}
	}

	makeRequest("GET", cfg.proxy_path+"/recipients/list", {}, handler);
}

function updateList(){

	//console.log("IN updateList");

	var handler = function(response) {

		document.getElementById('storedList').innerHTML = "";
		records = {};
		var data = [];
		var count = 0;

		//console.log(response);

		if ( response && response.items && response.items.length > 0 ) {
			for (i = 0; i < response.items.length; i++) {

				var item = response.items[i];
				records[item.id] = item;

				data[count] = {};
				//data[count].id = response.items[i].id;

				if (events[item.eventid]) {
					data[count].eventname = events[item.eventid].name;
				} else {
					data[count].eventname = "Unknown";
				}

				if (recipients[item.recipientid]) {
					data[count].recipientname = recipients[item.recipientid].name;
				} else {
					data[count].recipientname = "Unknown";
				}

				if (recipients[item.recipientid]) {
					data[count].recipientemail = recipients[item.recipientid].email;
				} else {
					data[count].recipientemail = "Unknown";
				}

				if (item.canshowname == true) {
					data[count].canshowname = "Yes";
				} else {
					data[count].canshowname = "No";
				}

				data[count].edit = '<center><button class="sbut" title="Edit" onclick="editEventRecipientPermission(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/edit.png" /></button></center>';
				data[count].delete = '<center><button class="sbut" title="Delete" onclick="deleteEventRecipientPermission(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/delete.png" /></button></center>';

				count++;
			}
		}

		if (table != null) table.destroy();

		table = $('#storedList').DataTable({
			"data": data,
			"stateSave": true,
			"columns": [
				//{ "data": "id", "title": "ID", "width": "10%" },
				{ "data": "recipientname", "title": "Recipient Name", "width": "30%" },
				{ "data": "recipientemail", "title": "Recipient Name", "width": "30%" },
				{ "data": "eventname", "title": "Event Name", "width": "30%" },
				{ "data": "canshowname", "title": "Can Show Name?", "width": "10%" },
				{ "data": "edit" , "title": "Edit", "width": "10%", "orderable": true },
				{ "data": "delete", "title": "Delete", "width": "10%", "orderable": true }
			],
			"order": [[ 0, "desc" ]]
		});
	}

	makeRequest("GET", cfg.proxy_path+"/events/listrecipientpermissions", {}, handler);
}

function hideAllForms() {
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createBulkDiv').style.display = "none";
	document.getElementById('createButtonsDiv').style.display = "none";
}