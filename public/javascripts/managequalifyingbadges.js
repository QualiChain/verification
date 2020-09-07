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

var badge = {};
var table = null;

var badgesArray = [];
var starttime = 0;
var endtime = 0;

function initializePage(badgeid) {
	badge.id = badgeid;

	var form = document.getElementById('formRecEdit');
	form["formRecEdit-startdate"].value = "";
	form["formRecEdit-enddate"].value = "";

	getBadgeDetails();

}

//https://stackoverflow.com/questions/12802739/deselect-selected-options-in-select-menu-with-multiple-and-optgroups
function clearSelected(elementName){

	if (document.getElementById(elementName)) {
		document.getElementById(elementName).value = "";
	}

	//var elements = document.getElementById(elementName).options;
	//for(var i = 0; i < elements.length; i++){
	//	elements[i].selected = false;
	//}
}

//https://stackoverflow.com/questions/11821261/how-to-get-all-selected-values-from-select-multiple-multiple
function getSelectValues(select) {
	var result = [];
	var options = select && select.options;
	var opt;

	for (var i=0, iLen=options.length; i<iLen; i++) {
		opt = options[i];
		if (opt.selected) {
		  	result.push(opt.value || opt.text);
		}
	}
	return result;
}

function addBadge() {
	var form = document.getElementById('formRec');

	var issuerurl = form.issuerurl.value;

	if (issuerurl != "" && !isValidURI(issuerurl)) {
		alert("Please enter a valid url for the qualifying badge issuer");
		return;
	}

	var startdatevalue = form["formRec-startdate"].value.trim();
	if (startdatevalue == "") {
		starttime = 0;
	} else {
		var startdate = new Date(startdatevalue);
		starttime = startdate.getTime();
	}

	var enddatevalue = form["formRec-enddate"].value.trim();
	if (enddatevalue == "") {
		endtime = 0;
	} else {
		var enddate = new Date(enddatevalue);
		endtime = enddate.getTime();
	}

	document.body.style.cursor = 'wait';

	var send = {};
	send.badgeid = badge.id;
	send.title = demicrosoftize(form.title.value);
	send.description = demicrosoftize(form.description.value);
	send.domain = demicrosoftize(form.domain.value);
	send.issuername = demicrosoftize(form.issuername.value);
	send.issuerurl = issuerurl;
	send.startdate= starttime;
	send.enddate = endtime;

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			var badgeid = response.id;

			clearAddForm();
			updateList();
			document.body.style.cursor = 'default';
		}
	}

	makeRequest("POST", cfg.proxy_path+"/qualifying/create", send, handler);
}

function clearAddForm() {
	var form = document.getElementById('formRec');

	form.title.value = "";
	form.description.value = "";
	form.domain.value = "";
	form.issuername.value = "";
	form.issuerurl.value = "";
	form["formRec-startdate"].value = "";
	form["formRec-enddate"].value = "";

 	starttime = 0;
 	endtime = 0;

}

function showAddForm() {
	clearAddForm();

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "block";
	document.getElementById('createFormShowButton').style.display = "none";
}

function cancelAddForm() {
	clearAddForm();

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";

}

function editBadge(badgeid) {
	var badge = badges[badgeid];
	var form = document.getElementById('formRecEdit');

	form.badgeid.value = badgeid;

	form.title.value = badge.title;
	form.description.value = badge.description;
	form.domain.value = badge.domain;
	form.issuername.value = badge.issuer;
	form.issuerurl.value = badge.issuerurl;

	var startdatevalue = "";
	if (badge.startdate == 0) {
		form["formRecEdit-startdate"].value = "";
	} else {
		var startdate = new Date(badge.startdate);
		starttime = badge.startdate;
		form["formRecEdit-startdate"].value = startdate.format(DATE_FORMAT_SHORT);
	}

	var enddatevalue = "";
	if (badge.enddate == 0) {
		form["formRecEdit-enddate"].value = "";
	} else {
		console.log(badge.enddate);
		var enddate = new Date(badge.enddate);
		endtime = badge.enddate;
		form["formRecEdit-enddate"].value = enddate.format(DATE_FORMAT_SHORT);
	}

	document.getElementById('createFormShowButton').style.display = "none";
	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "block";
}

function cancelEditForm() {
	var form = document.getElementById('formRecEdit');

	form.badgeid.value = "";

	form.title.value = "";
	form.description.value = "";
	form.domain.value =  "";
	form.issuername.value =  "";
	form.issuerurl.value =  "";

	starttime = 0;
	endtime = 0;
	form["formRecEdit-startdate"].value = "";
	form["formRecEdit-enddate"].value = "";

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function updateBadge() {
	var form = document.getElementById('formRecEdit');

	var issuerurl = form.issuerurl.value;

	if (issuerurl != "" && !isValidURI(issuerurl)) {
		alert("Please enter a valid url for the issuer");
		return;
	}

	var startdatevalue = form["formRecEdit-startdate"].value.trim();
	if (startdatevalue == "") {
		starttime = 0;
	} else {
		var startdate = new Date(startdatevalue);
		starttime = startdate.getTime();
	}

	var enddatevalue = form["formRecEdit-enddate"].value.trim();
	if (enddatevalue == "") {
		endtime = 0;
	} else {
		var enddate = new Date(enddatevalue);
		endtime = enddate.getTime();
	}

	document.body.style.cursor = 'wait';

	var send = {};
	send.badgeid = badge.id
	send.qualifyingbadgeid = form.badgeid.value;
	send.title = demicrosoftize(form.title.value);
	send.description = demicrosoftize(form.description.value);
	send.domain = demicrosoftize(form.domain.value);
	send.issuername = demicrosoftize(form.issuername.value);
	send.issuerurl = issuerurl;
	send.startdate = starttime;
	send.enddate = endtime;
	//console.log(send);

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			cancelEditForm();
			updateList();
			document.body.style.cursor = 'default';
		}
	}

	makeRequest("POST", cfg.proxy_path+"/qualifying/update", send, handler);
}

function viewBadge(badgeid) {
	var badge = badges[badgeid];
	var form = document.getElementById('formRecView');

	form.title.value = badge.title;
	form.description.value = badge.description;
	form.domain.value = badge.domain;
	form.issuername.value = badge.issuer;
	form.issuerurl.value = badge.issuerurl;

	var startdatevalue = "";
	if (badge.startdate == 0) {
		form["formRecView-startdate"].value = "";
	} else {
		var startdate = new Date(badge.startdate);
		starttime = badge.startdate;
		form["formRecView-startdate"].value = startdate.format(DATE_FORMAT_SHORT);
	}

	var enddatevalue = "";
	if (badge.enddate == 0) {
		form["formRecView-enddate"].value = "";
	} else {
		var enddate = new Date(badge.enddate);
		endtime = badge.enddate;
		form["formRecView-enddate"].value = enddate.format(DATE_FORMAT_SHORT);
	}

	document.getElementById('createFormShowButton').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('viewDiv').style.display = "block";
}

function closeViewForm() {
	var form = document.getElementById('formRecView');

	form.title.value = "";
	form.description.value = "";
	form.domain.value =  "";
	form.issuername.value =  "";
	form.issuerurl.value =  "";

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function deleteBadge(badgeid) {
	var badge = badges[badgeid];

	var message = "Are you sure you want to delete the badge titled:\n\n"+badge.title+"\n";
	var reply = confirm(message);
	if (reply == true) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				clearAddForm(); // in case it was open
				cancelEditForm(); // in case it was open
				updateList();
			}
		}

		var send = {};
		send.badgeid = badge.id;
		send.qualifyingbadgeid = badgeid;
		makeRequest("POST", cfg.proxy_path+"/qualifying/delete", send, handler);
	} else {
	  // do nothing
	}
}

function drawList(){
	var data = new Array();
	var count = 0

	if (badgesArray && badgesArray.length > 0) {

		for (i = 0; i < badgesArray.length; i++) {

			data[count] = {};
			data[count].id = badgesArray[i].id;

			data[count].title = badgesArray[i].title;
			data[count].issuer = badgesArray[i].issuer;

			//console.log(badgesArray[i]);

			data[count].view = '<center><button class="sbut" title="View" onclick="viewBadge(\''+badgesArray[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" /></button></center>';

			if (badgesArray[i].usedInIssuance === false) {
				data[count].edit = '<center><button class="sbut" title="Edit" onclick="editBadge(\''+badgesArray[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/edit.png" /></button></center>';
			} else {
				data[count].edit = '<center>Used</center>';
			}

			if (badgesArray[i].usedInIssuance === false) {
				data[count].delete = '<center><button class="sbut" title="Delete" onclick="deleteBadge(\''+badgesArray[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/delete.png" /></button></center>';
			} else {
				data[count].delete = '<center>Used</center>';
			}

			if (badgesArray[i].enabled == 1) {
				data[count].enabled = '<center><input type="checkbox" id="badgeenabled' + badgesArray[i].id +'" checked onclick="enableUpdate(' + badgesArray[i].id +')"></center>';
			} else {
				data[count].enabled = '<center><input type="checkbox" id="badgeenabled' + badgesArray[i].id +'" onclick="enableUpdate(' + badgesArray[i].id +')"></center>';
			}

			count ++;
		}
	}

	if (table != null) table.destroy();

	table = $('#storedList').DataTable({
		"data": data,
		"stateSave": true,
		"columns": [
			{ "data": "id", "title": "ID", "width": "5%" },
			{ "data": "title", "title": "Title", "width": "35%" },
			{ "data": "issuer", "title": "Issuer", "width": "20%" },
			{ "data": "view" , "title": "View", "width": "10%", "orderable": false },
			{ "data": "edit" , "title": "Edit", "width": "10%", "orderable": true },
			{ "data": "delete" , "title": "Delete", "width": "10%", "orderable": true },
			{ "data": "enabled" , "title": "Enabled", "width": "10%", "orderable": true }
		],
		"order": [[ 0, "desc" ]]
	});

}

function getBadgeDetails(){

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			//console.log(response);
			document.body.style.cursor = 'default';
			badge.title = response.title;
			badge.description = response.description;
			badge.usedInIssuance = response.usedInIssuance;
			badge.startdate = response.startdate;
			badge.enddate = response.enddate;

			document.getElementById("badgeSummary").innerHTML = response.title;

			cancelEditForm();
			updateList();
		}
	}
	//console.log(cfg.proxy_path+"/id/" + badge.id);

	makeRequest("GET", cfg.proxy_path+cfg.badges_path+"/id/" + badge.id, {}, handler);
}

function updateList(){

	var handler = function(response) {
		//console.log(response)
		badges = {};
		if ( response && response.badges) {
			badgesArray = response.badges;
			for (i = 0; i < response.badges.length; i++) {
				badges[response.badges[i].id] = response.badges[i];
			}
			drawList();
		}
	}
	//console.log(cfg.proxy_path + "/qualifying/listall/" + badge.id);
	makeRequest("GET", cfg.proxy_path + "/qualifying/listall/" + badge.id, {}, handler);
}

function showCalendar(elementname, url, field, format, type, time, hours) {
	var datepicker = document.getElementById(elementname);
	if (datepicker.value != 0 && datepicker.value != 0) {
		NewCssCal(cfg.proxy_path+url, field, format, type, time, hours);
	}
}

function checkDateChange(formname) {
	var form = document.getElementById(formname);

	var startdatevalue = form[formname + "-startdate"].value.trim();
	var startdate = new Date(startdatevalue);
	starttime = startdate.getTime();
	//console.log(starttime);

	var enddatevalue = form[formname + "-enddate"].value.trim();
	var enddate = new Date(enddatevalue);
	endtime = enddate.getTime();
	//console.log(endtime);

	if (starttime && endtime && starttime > endtime) {
		alert("Your start date and time must be earlier than your end date and time");
		return;
	}
}

function clearStartDate() {
	var form = document.getElementById('formRecEdit');
	form["formRecEdit-startdate"].value = "";
}

function clearEndDate() {
	var form = document.getElementById('formRecEdit');
	form["formRecEdit-enddate"].value = "";
}

function enableUpdate(id) {
	//console.log(id);
	var checkbox = document.getElementById('badgeenabled' + id);

	var send = {};
	send.qualifyingbadgeid = id;
	if (checkbox.checked == false) {
		send.enabled = 0;
	} else {
		send.enabled = 1;
	}
	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			clearAddForm(); // in case it was open
			cancelEditForm(); // in case it was open
			updateList();
		}
	}
	makeRequest("POST", cfg.proxy_path+"/qualifying/enableupdate", send, handler);
}