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

var badgesArray = [];
var badges = {};
var badgealignments = {}

var issuers = {}
var alignments = {}

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
	send.tags = demicrosoftize(form.tags.value);

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			var badgeid = response.id;
			var alignmentobj = 	document.getElementById('selectAlignment');
			alignres = getSelectValues(alignmentobj);
			addAlignments(badgeid,alignres);

			cancelCreateForm();
			updateList();

			document.body.style.cursor = 'default';
		}
	}

	makeRequest("POST", cfg.proxy_path+"/badges/create", send, handler);
}

function clearCreateForm() {
	var form = document.getElementById('formRec');

	form.title.value = "";
	form.description.value = "";
	form.imageurl.value = "";
	form.version.value = "";
	form.issuerid.value = "";
	form.criterianarrative.value = "";
	form.tags.value = "";
	clearSelected("selectAlignment");
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
	form.criterianarrative.value = badge.criterianarrative;
	form.tags.value = badge.tags;

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
	form.issueridedit.value = "";
	form.criterianarrative.value = "";
	form.tags.value = "";
	clearSelected("selectAlignmentEdit");

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

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			var badgeid = response.id;
			var alignmentobj = 	document.getElementById('selectAlignmentEdit');
			alignres = getSelectValues(alignmentobj);
			updateAlignments(badgeid,alignres);

			cancelEditForm();
			updateList();

			document.body.style.cursor = 'default';
		}
	}

	var send = {};
	send.id = form.badgeid.value;

	send.title = demicrosoftize(form.title.value);
	send.description = demicrosoftize(form.description.value);
	send.imageurl = url;
	send.version = demicrosoftize(form.version.value);
	send.issuerid = form.issueridedit.value;
	send.criterianarrative = demicrosoftize(form.criterianarrative.value);
	send.tags = demicrosoftize(form.tags.value);

	makeRequest("POST", cfg.proxy_path+"/badges/update", send, handler);
}

function viewBadge(badgeid) {
	var badge = badges[badgeid];
	var form = document.getElementById('formRecView');

	form.title.value = badge.title;
	form.description.value = badge.description;
	form.imageurl.value = badge.imageurl;
	form.imagepath.value = badge.imagepath;
	form.version.value = badge.version;
	form.issueridview.value = issuers[badge.issuerid].name;
	form.criterianarrative.value = badge.criterianarrative;
	form.tags.value = badge.tags;

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
	form.criterianarrative.value = "";
	form.tags.value = "";
	clearSelected("selectAlignmentView");

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function deleteBadge(badgeid) {
	var badge = badges[badgeid];

	var message = "Are you sure you want to delete the badge: "+badge.title;
	var reply = confirm(message);
	if (reply == true) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				clearCreateForm(); // in case it was open
				cancelEditForm(); // in case it was open
				updateList();
				alert("The badge record has been deleted");
			}
		}

		var send = {};
		send.id = badgeid;
		makeRequest("POST", cfg.proxy_path+"/badges/delete", send, handler);
	} else {
	  // do nothing
	}
}

function addAlignments(badgeid,alignres) {
	for(i=0; i<alignres.length; i++) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				loadBadgeAlignment(badgeid);
			}
		}

		var send = {};
		send.id = badgeid;
		send.alignmentid = alignres[i];

		makeRequest("POST", cfg.proxy_path+"/badges/addalignment", send, handler);
	}
	return false;
}

function updateAlignments(badgeid,alignres) {

	var alignments = badgealignments[badgeid];
	if (!alignments) {
		alignments = [];
	}
	if (!alignres) {
		alignres = [];
	}

	if (alignres.length == 0 && alignments.length == 0) {
		cancelEditForm();
		updateList();
		return;
	}

	var alignmentids = [];

	var flags = {};
	var finished = false;
	var errors = "";

	// remove alignments that have been removed in the edit
	for (var i=0; i<alignments.length; i++) {
		alignmentids.push(alignments[i].id);
		if (alignres.indexOf(alignments[i].id) == -1) {

			flags = {};
			finished = false;
			errors = "";

			var handler = function(response) {
				if (response.error) {
					errors = response;
				} else {
					finished = true;
				}
			}

			var send = {};
			send.id = badgeid;
			send.alignmentid = alignments[i].id;
			makeRequest("POST", cfg.proxy_path+"/badges/removealignment", send, handler);

			flags = setInterval(function() {
				if (finished) {
					clearInterval(flags);
				} else if (errors) {
					clearInterval(flags);
					showError(errors);
				}
			}, 100); // interval set at 100 milliseconds
		}
	}

	// add new alignments that have been added
	for(i=0; i<alignres.length; i++) {

		if (alignments.indexOf(alignres[i].id) == -1) {

			flags = {};
			finished = false;
			errors = "";

			var alignmentid = alignres[i];
			var handler = function(response) {
				if (response.error) {
					errors = response;
				} else {
					finished = true;
				}
			}

			var send = {};
			send.id = badgeid;
			send.alignmentid = alignres[i];

			makeRequest("POST", cfg.proxy_path+"/badges/addalignment", send, handler);

			flags = setInterval(function() {
				if (finished) {
					clearInterval(flags);
				} else if (errors != "") {
					clearInterval(flags);
					showError(errors);
				}
			}, 100); // interval set at 100 milliseconds
		}
	}

	loadBadgeAlignment(badgeid);

	cancelEditForm();
	updateList();
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
			} else {
				// create list
				var html = '<select name="issuerid" id="issuerid">';
				html += '<option value="" disabled selected>Select an Issuer ID</option>'

				var html2 = '<select name="issueridedit" id="issueridedit">';
				html2 += '<option value="" disabled selected>Select an Issuer ID</option>'

				var categoriesselect = document.getElementById("categories");
				var option = document.createElement("option");
				option.textContent = "All";
				option.value = "all";
				categoriesselect.appendChild(option);

				for (i = 0; i < response.issuers.length; i++) {
					// only if they have a user account can they be put against a badge
					// as they need a blockchain account number from the user table for permissions
					if (response.issuers[i].login && response.issuers[i].login != "") {
						issuers[response.issuers[i].id] = response.issuers[i];

						html += '<option value="'+ response.issuers[i].id +'">'+ response.issuers[i].name + '</option>';
						html2 += '<option value="'+ response.issuers[i].id +'">'+ response.issuers[i].name + '</option>';

						// filter list
						var option = document.createElement("option");
						option.textContent = response.issuers[i].name;
						option.value = response.issuers[i].id;
						categoriesselect.appendChild(option);
					}
				}

				html += "</select>";
				thediv.innerHTML = html;

				html2 += "</select>";
				theeditdiv.innerHTML = html2;

				loadAlignmentData();
			}
		}
	}

	makeRequest("GET", cfg.proxy_path+"/issuers/list", {}, handler);
}

function loadAlignmentData(){

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			var thediv =document.getElementById('allignmentlist');
			var theviewdiv = document.getElementById('allignmentlistview');
			var theeditdiv = document.getElementById('allignmentlistedit');

			thediv.innerHTML = "";
			theviewdiv.innerHTML = "";
			theeditdiv.innerHTML = "";

			alignments = {};

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
				html += "<span style=\"color:#555;font-size:0.8em;\"><br>Select Alignments (Shift for multiple choice, Ctrl/Cmd to select/unselect individual choice).</span>";
				thediv.innerHTML = html;

				// edit alignmentlist
				var html2 = '<select class="selectmultiple" name="selectAlignmentEdit" id="selectAlignmentEdit" multiple="multiple">';
				for (i = 0; i < response.alignments.length; i++) {
					alignments[response.alignments[i]] = response.alignments[i];
					html2 += '<option value="'+ response.alignments[i].id +'">'+ response.alignments[i].name + '</option>';
				}

				html2 += "</select>";
				html2 += "<span style=\"color:#555;font-size:0.8em;\"><br>Select Alignments (Shift for multiple choice, Ctrl/Cmd to select/unselect individual choice).</span>";
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

function redrawBadgeList() {
	var categoriesselect = document.getElementById('categories');
	var category = categoriesselect.value;

	drawList(category);
}

function drawList(filtercategory){

	if (badgesArray && badgesArray.length > 0) {

		var thediv =document.getElementById('storedList');
		thediv.innerHTML = "";
		document.getElementById('itemcount').innerHTML = 0;

		var html = "<center><table style='width:100%;line-height:120%;font-size: 14px;'>";
		html += "<tr>";
		html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>ID</th>";
		html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Image</th>";
		html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Title</th>";
		html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Issuer</th>";
		html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>View</th>";
		html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Edit</th>";
		html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Delete</th>";
		html += "</tr>";
		var temp=0;
		var count = 0

		for (i = 0; i < badgesArray.length; i++) {

			if (filtercategory == "all" || filtercategory == badgesArray[i].issuerid) {
				count ++;

				html += "<tr>";

				html += "<td style='padding: 6px; border: 1px solid grey;'>";
				html += badgesArray[i].id;
				html += "</td>";

				html += '<td style="padding: 6px; border: 1px solid grey;">';
				if (badgesArray[i].imageurl) {
					html += '<img height="50"; src="'+badgesArray[i].imageurl+'"/>';
				} else {
					html += '&nbsp;';
				}
				html += '</td>';

				html += "<td style='padding: 6px; border: 1px solid grey;'>";
				html += badgesArray[i].title;
				html += "</td>";

				html += "<td style='padding: 6px; border: 1px solid grey;'>";

				var issuername = "Unknown";
				if (issuers[badgesArray[i].issuerid] && issuers[badgesArray[i].issuerid].name) {
					issuername = issuers[badgesArray[i].issuerid].name;
				}

				console.log(issuers[badgesArray[i].issuerid]);

				html += issuername;
				html += "</td>";

				html += '<td style="padding: 6px; border: 1px solid grey;">';
				html += '<center><button class="sbut" title="View" onclick="viewBadge(\''+badgesArray[i].id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/view.png" /></button></center>';
				html += '</td>';

				html += '<td style="padding: 6px; border: 1px solid grey;">';
				if (badgesArray[i].usedInIssuance === false) {
					html += '<center><button class="sbut" title="Edit" onclick="editBadge(\''+badgesArray[i].id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/edit.png" /></button></center>';
				} else {
					html += '<center>Used</center>';
				}
				html += '</td>';

				html += '<td style="padding: 6px; border: 1px solid grey;">';
				if (badgesArray[i].usedInIssuance === false) {
					html += '<center><button class="sbut" title="Delete" onclick="deleteBadge(\''+badgesArray[i].id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/delete.png" /></button></center>';
				} else {
					html += '<center>Used</center>';
				}
				html += '</td>';

				html += "</tr>";
			}
			temp = i;
		}

		document.getElementById('itemcount').style.paddingLeft = "5px";
		document.getElementById('itemcount').innerHTML = count;

		html += "</table></center> <br> <br>";
		thediv.innerHTML = html;
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

	var send = {};
	send.id = badgeid;

	makeRequest("POST", cfg.proxy_path+"/badges/listalignments/", send, handler);
}

function updateList(){

	var handler = function(response) {

		var thediv =document.getElementById('storedList');

		badges = {};
		badgealignments = {};

		if ( !response || !response.badges || (response.badges && response.badges.length == 0) ) {
			thediv.innerHTML = "You have not added any badges yet";
		} else {

			badgesArray = response.badges;

			var temp=0;
			for (i = 0; i < response.badges.length; i++) {
				badges[response.badges[i].id] = response.badges[i];
				loadBadgeAlignment(response.badges[i].id);
			}

			redrawBadgeList();
		}
	}

	makeRequest("GET", cfg.proxy_path+"/badges/listall", {}, handler);
}