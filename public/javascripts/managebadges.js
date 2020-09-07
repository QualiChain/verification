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

var badges = {};
var table = null;

var badgesArray = [];
var badgealignments = {}
var badgecriteriaevents = {}

var issuers = {}
var alignments = {}
var events = {}

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
	loadIssuerData();
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

function createBadge() {
	var form = document.getElementById('formRec');

	var url = form.imageurl.value;

	if (url != "" && !isValidURI(url)) {
		alert("Please enter a valid url for the badge image");
		return;
	}

	if (!(url.match(/\.(png)$/) != null)) {
		alert("The Image URL does not point to a png file");
		return;
	}

	document.body.style.cursor = 'wait';

	var send = {};
	send.title = demicrosoftize(form.title.value);
	send.description = demicrosoftize(form.description.value);
	send.imageurl = url;
	send.version = demicrosoftize(form.version.value);
	send.issuerid = form.issuerid.value;
	send.criterianarrative = demicrosoftize(form.criterianarrative.value);
	send.parentbadgeid = form.parentbadgeid.value;

	var alignmentobj = 	document.getElementById('selectAlignment');
	var alignmentselection = getSelectValues(alignmentobj);
	if (alignmentselection.length > 0) {
		send.alignmentids = alignmentselection.join();
	}

	var eventobj = document.getElementById('selectEvent');
	eventselection = getSelectValues(eventobj);
	if (eventselection.length > 0) {
		send.eventids = eventselection.join();
	}

	send.tags = demicrosoftize(form.tags.value);

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			var badgeid = response.id;

			clearCreateForm();
			updateList();
			document.body.style.cursor = 'default';
		}
	}

	makeRequest("POST", cfg.proxy_path+cfg.badges_path+"/create", send, handler);
}

function clearCreateForm() {
	var form = document.getElementById('formRec');

	form.title.value = "";
	form.description.value = "";
	form.imageurl.value = "";
	form.version.value = "";

	// will not exist if not loaded - no issuers or no badges yet.
	if (form.issuerid) {
		form.issuerid.value = "";
	}

	if (form.parentbadgeid) {
		form.parentbadgeid.value = "0";
	}

	form.criterianarrative.value = "";
	form.tags.value = "";
	clearSelected("selectAlignment");
	clearSelected("selectEvent");
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

function editBadge(badgeid) {
	var badge = badges[badgeid];
	var form = document.getElementById('formRecEdit');

	form.badgeid.value = badgeid;

	form.title.value = badge.title;
	form.description.value = badge.description;
	form.imageurl.value = badge.imageurl;
	form.imagepath.value = badge.imagepath;
	form.version.value = badge.version;
	form.issueridedit.value = badge.issuerid;

	form.parentbadgeidedit.value = badge.parentbadgeid;
	form.criterianarrative.value = badge.criterianarrative;
	form.tags.value = badge.tags;

	// set event choices.
	if (badgecriteriaevents[badgeid]) {
		var events = badgecriteriaevents[badgeid];
		var eventids = [];
		for (var i=0; i<events.length; i++) {
			eventids.push(parseInt(events[i].id));
		}

		var selectitem = document.getElementById('selectEventEdit');
		selectitem.value = null; // Reset pre-selected options (just in case)

		var count = selectitem.options.length;
		for (var i = 0; i < count; i++) {
			if (eventids.indexOf(parseInt(selectitem.options[i].value)) > -1) {
				selectitem.options[i].selected = true;
			}
		}
	}

	// set alignment choices.
	if (badgealignments[badgeid]) {
		var alignments = badgealignments[badgeid];
		var alignmentids = [];
		for (var i=0; i<alignments.length; i++) {
			alignmentids.push(parseInt(alignments[i].id));
		}

		var selectitem = document.getElementById('selectAlignmentEdit');
		selectitem.value = null; // Reset pre-selected options (just in case)

		var count = selectitem.options.length;
		for (var i = 0; i < count; i++) {
			if (alignmentids.indexOf(parseInt(selectitem.options[i].value)) > -1) {
				selectitem.options[i].selected = true;
			}
		}
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
	form.imageurl.value = "";
	form.version.value = "";

	// will not exist if not loaded - no issuers or no badges yet.
	if (form.issueridedit) {
		form.issueridedit.value = "";
	}
	if (form.parentbadgeidedit) {
		form.parentbadgeidedit.value = "0";
	}

	form.criterianarrative.value = "";
	form.tags.value = "";
	clearSelected("selectAlignmentEdit");
	clearSelected("selectEventEdit");

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function updateBadge() {
	var form = document.getElementById('formRecEdit');

	var url = form.imageurl.value;

	if (url != "" && !isValidURI(url)) {
		alert("Please enter a valid url for the badge image");
		return;
	}

	if (!(url.match(/\.(png)$/) != null)) {
		alert("Image URL does not point to a png file");
		return;
	}

	document.body.style.cursor = 'wait';

	var send = {};
	send.id = form.badgeid.value;
	send.parentbadgeid = form.parentbadgeidedit.value;

	if (send.id == send.parentbadgeid) {
		alert("You cannot set yourself as the parent badge");
		return;
	}

	send.title = demicrosoftize(form.title.value);
	send.description = demicrosoftize(form.description.value);
	send.imageurl = url;
	send.version = demicrosoftize(form.version.value);
	send.issuerid = form.issueridedit.value;
	send.criterianarrative = demicrosoftize(form.criterianarrative.value);
	send.tags = demicrosoftize(form.tags.value);

	var alignmentobj = 	document.getElementById('selectAlignmentEdit');
	var alignmentselection = getSelectValues(alignmentobj);
	if (alignmentselection.length > 0) {
		send.alignmentids = alignmentselection.join();
	}

	var eventobj = document.getElementById('selectEventEdit');
	eventselection = getSelectValues(eventobj);
	if (eventselection.length > 0) {
		send.eventids = eventselection.join();
	}

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			cancelEditForm();
			updateList();
			document.body.style.cursor = 'default';
		}
	}

	makeRequest("POST", cfg.proxy_path+cfg.badges_path+"/update", send, handler);
}

function viewBadge(badgeid) {
	var badge = badges[badgeid];
	var form = document.getElementById('formRecView');

	form.badgeid.value = badgeid;

	form.title.value = badge.title;
	form.description.value = badge.description;
	form.imageurl.value = badge.imageurl;
	form.imagepath.value = badge.imagepath;
	form.version.value = badge.version;
	form.issueridview.value = issuers[badge.issuerid].name;

	if (badge.parentbadgeid && badges[badge.parentbadgeid]) {
		form.parentbadgeidview.value = badges[badge.parentbadgeid].title;
	} else {
		form.parentbadgeidview.value = "No Parent";
	}

	form.criterianarrative.value = badge.criterianarrative;
	form.tags.value = badge.tags;

	// set event choices.
	if (badgecriteriaevents[badgeid]) {
		var events = badgecriteriaevents[badgeid];
		var eventids = [];
		for (var i=0; i<events.length; i++) {
			eventids.push(parseInt(events[i].id));
		}

		var selectitem = document.getElementById('selectEventView');
		selectitem.value = null; // Reset pre-selected options (just in case)

		var count = selectitem.options.length;
		for (var i = 0; i < count; i++) {
			if (eventids.indexOf(parseInt(selectitem.options[i].value)) > -1) {
				selectitem.options[i].selected = true;
			}
		}
	}

	// set alignment choices.
	if (badgealignments[badgeid]) {
		var alignments = badgealignments[badgeid];
		var alignmentids = [];
		for (var i=0; i<alignments.length; i++) {
			alignmentids.push(parseInt(alignments[i].id));
		}

		var selectitem = document.getElementById('selectAlignmentView');
		selectitem.value = null; // Reset pre-selected options (just in case)

		var count = selectitem.options.length;
		for (var i = 0; i < count; i++) {
			if (alignmentids.indexOf(parseInt(selectitem.options[i].value)) > -1) {
				selectitem.options[i].selected = true;
			}
		}
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
	form.imageurl.value = "";
	form.version.value = "";
	form.issueridview.value = "";
	form.parentbadgeidview.value = "0";
	form.criterianarrative.value = "";
	form.tags.value = "";
	clearSelected("selectAlignmentView");
	clearSelected("selectEventView");

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
				clearCreateForm(); // in case it was open
				cancelEditForm(); // in case it was open
				updateList();
			}
		}

		var send = {};
		send.id = badgeid;
		makeRequest("POST", cfg.proxy_path+cfg.badges_path+"/delete", send, handler);
	} else {
	  // do nothing
	}
}

function loadIssuerData(){

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			issuers = {};

			var thediv =document.getElementById('issueridlist');
			var theeditdiv =document.getElementById('issueridlistedit');

			if ( !response || !response.issuers || (response.issuers && response.issuers.length == 0) ) {
				thediv.innerHTML = "Currently you have no stored Issuer records";
				theeditdiv.innerHTML = "Currently you have no stored Issuer records";
				loadEventData();
			} else {
				// create list
				var html = '<select name="issuerid" id="issuerid">';
				html += '<option value="" disabled selected>Select an Issuer ID</option>'

				var html2 = '<select name="issueridedit" id="issueridedit">';
				html2 += '<option value="" disabled selected>Select an Issuer ID</option>'

				for (i = 0; i < response.issuers.length; i++) {
					// only if they have a user account can they be put against a badge
					// as they need a blockchain account number from the user table for permissions
					if (response.issuers[i].login && response.issuers[i].login != "") {
						issuers[response.issuers[i].id] = response.issuers[i];

						var loginemail="Unregistered)";
						if (response.issuers[i].login) {
							loginemail=response.issuers[i].login
						}

						html += '<option value="'+ response.issuers[i].id +'">'+ response.issuers[i].name + "&nbsp;&nbsp;&nbsp;&nbsp;("+loginemail+")"+ '</option>';
						html2 += '<option value="'+ response.issuers[i].id +'">'+ response.issuers[i].name + "&nbsp;&nbsp;&nbsp;&nbsp;("+loginemail+")"+ '</option>';
					}
				}

				html += "</select>";
				thediv.innerHTML = html;

				html2 += "</select>";
				theeditdiv.innerHTML = html2;

				loadEventData();
			}
		}
	}

	makeRequest("GET", cfg.proxy_path+"/issuers/list", {}, handler);
}

function loadEventData(){

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			var thediv = document.getElementById('eventlist');
			var theviewdiv = document.getElementById('eventlistview');
			var theeditdiv = document.getElementById('eventlistedit');

			thediv.innerHTML = "";
			theviewdiv.innerHTML = "";
			theeditdiv.innerHTML = "";

			events = {};

			if ( !response || !response.events || (response.events && response.events.length == 0) ) {

				// create event list
				var html = '<select class="selectmultiple" name="selectEvent" id="selectEvent" multiple="multiple">';

				html += "</select>";
				html += "<span style=\"color:#555;font-size:0.8em;\"><br>Currently you have no stored event records</span>";
				thediv.innerHTML = html;

				// edit event list
				var html2 = '<select class="selectmultiple" name="selectEventEdit" id="selectEventEdit" multiple="multiple">';

				html2 += "</select>";
				html2 += "<span style=\"color:#555;font-size:0.8em;\"><br>Currently you have no stored event records</span>";
				theeditdiv.innerHTML = html2;

				// view event list
				var html3 = '<select readonly class="selectmultiple" name="selectEventView" id="selectEventView" multiple="multiple">';
				html3 += "</select>";
				theviewdiv.innerHTML = html3;

				html3 += "</select>";
				html3 += "<span style=\"color:#555;font-size:0.8em;\"><br>Currently you have no stored event records</span>";
				theviewdiv.innerHTML = html3;

				loadAlignmentData();

			} else {

				console.log("Creating Event lists");

				// create event list
				var html = '<select class="selectmultiple" name="selectEvent" id="selectEvent" multiple="multiple">';
				for (i = 0; i < response.events.length; i++) {
					events[response.events[i].id] = response.events[i];
					html += '<option value="'+ response.events[i].id +'">'+ response.events[i].name + '</option>';
				}

				html += "</select>";
				thediv.innerHTML = html;

				// edit event list
				var html2 = '<select class="selectmultiple" name="selectEventEdit" id="selectEventEdit" multiple="multiple">';
				for (i = 0; i < response.events.length; i++) {
					events[response.events[i]] = response.events[i];
					html2 += '<option value="'+ response.events[i].id +'">'+ response.events[i].name + '</option>';
				}

				html2 += "</select>";
				theeditdiv.innerHTML = html2;

				// view event list
				var html3 = '<select readonly class="selectmultiple" name="selectEventView" id="selectEventView" multiple="multiple">';
				for (i = 0; i < response.events.length; i++) {
					events[response.events[i]] = response.events[i];
					html3 += '<option disabled value="'+ response.events[i].id +'">'+ response.events[i].name + '</option>';
				}
				html3 += "</select>";
				theviewdiv.innerHTML = html3;

				loadAlignmentData();
			}
		}
	}

	makeRequest("GET", cfg.proxy_path+"/events/list", {}, handler);
}

function loadAlignmentData(){

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			var thediv =document.getElementById('alignmentlist');
			var theviewdiv = document.getElementById('alignmentlistview');
			var theeditdiv = document.getElementById('alignmentlistedit');

			thediv.innerHTML = "";
			theviewdiv.innerHTML = "";
			theeditdiv.innerHTML = "";

			alignments = {};

			console.log(response);

			if ( !response || !response.alignments || (response.alignments && response.alignments.length == 0) ) {

				// create alignment list
				var html = '<select class="selectmultiple" name="selectAlignment" id="selectAlignment" multiple="multiple">';

				html += "</select>";
				html += "<span style=\"color:#555;font-size:0.8em;\"><br>Currently you have no stored alignment records</span>";
				thediv.innerHTML = html;

				// edit alignmentlist
				var html2 = '<select class="selectmultiple" name="selectAlignmentEdit" id="selectAlignmentEdit" multiple="multiple">';

				html2 += "</select>";
				html2 += "<span style=\"color:#555;font-size:0.8em;\"><br>Currently you have no stored alignment records</span>";
				theeditdiv.innerHTML = html2;

				// view alignmentlist
				var html3 = '<select readonly class="selectmultiple" name="selectAlignmentView" id="selectAlignmentView" multiple="multiple">';
				html3 += "</select>";
				theviewdiv.innerHTML = html3;

				html3 += "</select>";
				html3 += "<span style=\"color:#555;font-size:0.8em;\"><br>Currently you have no stored alignment records</span>";
				theviewdiv.innerHTML = html3;

				updateList();
			} else {

				console.log("Creating Alignment lists");

				// create alignment list
				var html = '<select class="selectmultiple" name="selectAlignment" id="selectAlignment" multiple="multiple">';
				for (i = 0; i < response.alignments.length; i++) {
					alignments[response.alignments[i].id] = response.alignments[i];
					html += '<option value="'+ response.alignments[i].id +'">'+ response.alignments[i].name + '</option>';
				}

				html += "</select>";
				thediv.innerHTML = html;

				// edit alignmentlist
				var html2 = '<select class="selectmultiple" name="selectAlignmentEdit" id="selectAlignmentEdit" multiple="multiple">';
				for (i = 0; i < response.alignments.length; i++) {
					alignments[response.alignments[i]] = response.alignments[i];
					html2 += '<option value="'+ response.alignments[i].id +'">'+ response.alignments[i].name + '</option>';
				}

				html2 += "</select>";
				theeditdiv.innerHTML = html2;

				// view alignmentlist
				var html3 = '<select readonly class="selectmultiple" name="selectAlignmentView" id="selectAlignmentView" multiple="multiple">';
				for (i = 0; i < response.alignments.length; i++) {
					alignments[response.alignments[i]] = response.alignments[i];
					html3 += '<option disabled value="'+ response.alignments[i].id +'">'+ response.alignments[i].name + '</option>';
				}
				html3 += "</select>";
				theviewdiv.innerHTML = html3;

				updateList();
			}
		}
	}

	makeRequest("GET", cfg.proxy_path+"/alignments/list", {}, handler);
}


function getQualifyingCount(badgeid) {

	var handler = function(response) {
		var count = 0;
		if (response && response.badges && response.badges.length > 0) {
			count = response.badges.length;
			document.getElementById('qualifyingcount-'+badgeid).innerHTML = count;
		}
	}

	makeRequest("GET", cfg.proxy_path + "/qualifying/listall/" + badgeid, {}, handler);
}

function redrawBadgeList() {

	var data = new Array();
	var count = 0

	var thediv = document.getElementById('parentbadgeidlist');
	var theeditdiv = document.getElementById('parentbadgeidlistedit');

	thediv.innerHTML = "";
	theeditdiv.innerHTML = "";

	var html = '<select name="parentbadgeid" id="parentbadgeid">';
	html += '<option value="0" selected>Select a Parent Badge</option>'

	var html2 = '<select name="parentbadgeidedit" id="parentbadgeidedit">';
	html2 += '<option value="0" selected>Select a Parent Badge</option>'

	if (badgesArray && badgesArray.length > 0) {
		var temp=0;

		for (i = 0; i < badgesArray.length; i++) {
			data[count] = {};

			data[count].id = badgesArray[i].id;

			if (badgesArray[i].imageurl) {
				data[count].image = '<img height="50"; src="'+badgesArray[i].imageurl+'"/>';
			} else {
				data[count].image = '&nbsp;';
			}

			data[count].title = badgesArray[i].title;
			data[count].version = badgesArray[i].version;

			var loginemail="Unregistered)";
			if (issuers[badgesArray[i].issuerid].login) {
				loginemail=issuers[badgesArray[i].issuerid].login
			}
			data[count].issuer = issuers[badgesArray[i].issuerid].name + "&nbsp;&nbsp;&nbsp;&nbsp;("+loginemail+")";

			data[count].qualifying = '<div style="float:left;margin-left:20px; margin-top:5px;"><span>Items: </span><span style="padding-right:20px;font-weight:bold" id="qualifyingcount-'+badgesArray[i].id+'">0</span></div>';
			data[count].qualifying += '<button class="sbut" title="Manage Qualifying Badges" onclick="manageQualifyingBadgesTable(\''+badgesArray[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/qualifying.png" /></button>';

			//action buttons
			data[count].actions = '<center><div class="buttons-flex"><button class="sbut" style="align-self:center" title="View" onclick="viewBadge(\''+badgesArray[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" /></button>';

			if (badgesArray[i].usedInIssuance === false) {
			  data[count].actions += '<button class="sbut" style="align-self:center" title="Edit" onclick="editBadge(\''+badgesArray[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/edit.png" /></button>';
			  data[count].actions += '<button class="sbut" style="align-self:center" title="Delete" onclick="deleteBadge(\''+badgesArray[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/delete.png" /></button>';
			} else {
			  data[count].actions += '<span style="align-self:center">Used</span>';
			}
		  	data[count].actions += '</div></center>';

			// create parent lists
			console.log("Creating parnet badge lists");

			html += '<option value="'+ badgesArray[i].id +'">'+ badgesArray[i].title + '</option>';
			html2 += '<option value="'+ badgesArray[i].id +'">'+ badgesArray[i].title + '</option>';

			count ++;
		}

		temp = i;
	}

	html += "</select>";
	thediv.innerHTML = html;

	html2 += "</select>";
	theeditdiv.innerHTML = html2;

	var categoriesselect = document.getElementById("categories");
	categoriesselect.innerHTML = "";
	var option = document.createElement("option");
	option.textContent = "All";
	option.value = "";
	categoriesselect.appendChild(option);

	if (table != null) table.destroy();

	table = $('#storedList').DataTable({
		"data": data,
		"stateSave": true,
		"columns": [
			{ "data": "id", "title": "ID", "width": "5%" },
			{ "data": "image", "title": "Image", "width": "10%", "orderable": false },
			{ "data": "title", "title": "Title", "width": "25%" },
			{ "data": "version", "title": "Version", "width": "10%" },
			{ "data": "issuer", "title": "Issuer", "width": "20%" },
			{ "data": "qualifying" , "title": "Qualifying Badges", "width": "15%", "orderable": true },
			{ "data": "actions" , "title": "Actions", "width": "15%", "orderable": true },
		],
		"order": [[ 0, "desc" ]],
		initComplete: function () {
			this.api().columns([4]).every( function () {
				var column = this;

				// When dropdown changes filter table
				var select = $('#categories')
					.on( 'change', function () {
						var val = $.fn.dataTable.util.escapeRegex(
							$(this).val()
						);

						column
							.search( val ? '^'+val+'$' : '', true, false )
							.draw();
					} );

				// Fill the select dropdown menu at the top from a unique list of the issuer column (column 4 above)
				// Reset any save filter option.
				column.data().unique().sort().each( function ( d, j ) {
					if(column.search() === '^'+d+'$'){
						select.append( '<option selected value="'+d+'">'+d+'</option>' )
					} else {
						select.append( '<option value="'+d+'">'+d+'</option>' )
					}
				} );
			} );
		}
	});

	// get the qualifying badge counts for badges
	if ( badgesArray && badgesArray.length > 0 ) {
		for (i = 0; i < badgesArray.length; i++) {
			var item = badgesArray[i];
			getQualifyingCount(item.id);
		}
	}
}

function loadBadgeAlignment(badgeid){

	badgealignments[badgeid] = [];

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			badgealignments[badgeid] = response.alignments;
		}
	}

	makeRequest("GET", cfg.proxy_path+cfg.badges_path+"/listalignments/"+badgeid, {}, handler);
}

function loadCriteriaEvents(badgeid){

	badgecriteriaevents[badgeid] = [];

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			badgecriteriaevents[badgeid] = response.events;
		}
	}

	makeRequest("GET", cfg.proxy_path+cfg.badges_path+"/listcriteriaevents/"+badgeid, {}, handler);
}

function updateList(){

	var handler = function(response) {

		badges = {};
		badgealignments = {};

		if ( response && response.badges) {

			badgesArray = response.badges;

			var temp=0;
			for (i = 0; i < response.badges.length; i++) {
				badges[response.badges[i].id] = response.badges[i];
				loadBadgeAlignment(response.badges[i].id);
				loadCriteriaEvents(response.badges[i].id);
			}

			redrawBadgeList();
		}
	}

	makeRequest("GET", cfg.proxy_path+cfg.badges_path+"/listall", {}, handler);
}


function manageQualifyingBadges(badgeform) {
	var form = document.getElementById('qualifyingform');
	form.badgeid.value = badgeform.badgeid.value;
	//console.log(form.badgeid.value);
	form.submit();
}

function manageQualifyingBadgesTable(badgeid) {
	var form = document.getElementById('qualifyingform');
	form.badgeid.value = badgeid;
	//console.log(form.badgeid.value);
	form.submit();
}