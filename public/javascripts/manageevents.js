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

var events = {};
var table = null;

var eventorganizers = {}
var eventsponsors = {}
var organizations = {};

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});


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

function initializePage() {

	// setup country lists
	var form = document.getElementById('formRec');
	var create_location_country = form.location_country;

	var editform = document.getElementById('formRecEdit');
	var edit_location_country = editform.location_country;

	var viewform = document.getElementById('formRecView');
	var view_location_country = viewform.location_country;

	for (var prop in COUNTRIES_LIST) {
		if (Object.prototype.hasOwnProperty.call(COUNTRIES_LIST, prop)) {

			// CREATE
			var option = document.createElement("option");
			option.value = prop;
			option.text = COUNTRIES_LIST[prop];
    		create_location_country.appendChild(option);

			// EDIT
			var option = document.createElement("option");
			option.value = prop;
			option.text = COUNTRIES_LIST[prop];
    		edit_location_country.appendChild(option);

			// VIEW
			var option = document.createElement("option");
			option.value = prop;
			option.text = COUNTRIES_LIST[prop];
    		view_location_country.appendChild(option);
		}
	}

	create_location_country.value = cfg.default_country;

	loadOrganizationData();
}

function showCalendar(elementname, url, field, format, type, time, hours) {
	var datepicker = document.getElementById(elementname);
	if (datepicker.value != 0 && datepicker.value != 0) {
		NewCssCal(cfg.proxy_path+url, field, format, type, time, hours);
	}
}

function checkDateChange(formname) {
	var form = document.getElementById(formname);

	var startdatevalue = form[formname+"-startdate"].value.trim();
	var startdate = new Date(startdatevalue);
	var starttime = startdate.getTime();

	var enddatevalue = form[formname+"-enddate"].value.trim();
	var enddate = new Date(enddatevalue);
	var endtime = enddate.getTime();

	if (starttime && endtime && starttime > endtime) {
		alert("Your start date and time must be earlier than your end date and time");
		return;
	}

	if (starttime && endtime) {
		var durationobj = getDuration(startdate, enddate);
		var formattedDuration = getFormattedDuration(durationobj); // in utilities.js

		form.duration.value = formattedDuration.str;
	}
}

function createBadgeEvent() {
	var form = document.getElementById('formRec');

	var startdatevalue = form["formRec-startdate"].value.trim();
	if (startdatevalue == "") {
		alert("You must enter a start date and time");
		return;
	}
	var startdate = new Date(startdatevalue);
	var starttime = startdate.getTime();

	var enddatevalue = form["formRec-enddate"].value.trim();
	if (enddatevalue == "") {
		alert("You must enter an end date and time");
		return;
	}
	var enddate = new Date(enddatevalue);
	var endtime = enddate.getTime();

	if (starttime > endtime) {
		alert("Your start date and time must be earlier than your end date and time");
		return;
	}

	//var durationobj = getDuration(startdate, enddate);
	//var formattedDuration = getFormattedDuration(durationobj);

	document.body.style.cursor = 'wait';

	var send = {};
	send.name = demicrosoftize(form.name.value);
	send.description = demicrosoftize(form.description.value);
	send.startdate = starttime;
	send.enddate = endtime;

	send.location_name = demicrosoftize(form.location_name.value);
	send.location_pobox = demicrosoftize(form.location_pobox.value);
	send.location_streetaddress = demicrosoftize(form.location_streetaddress.value);
	send.location_locality = demicrosoftize(form.location_locality.value);
	send.location_region = demicrosoftize(form.location_region.value);
	send.location_postcode = demicrosoftize(form.location_postcode.value);
	send.location_country = form.location_country.options[form.location_country.selectedIndex].value

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			var eventid = response.id;

			var organizerobj = document.getElementById('selectOrganizer');
			organizerselection = getSelectValues(organizerobj);

			var innerhandler = function() {
				loadEventOrganizers(eventid);

				var sponsorobj = document.getElementById('selectSponsor');
				sponsorselection = getSelectValues(sponsorobj);

				var innerhandler2 = function() {
					loadEventSponsors(eventid);
					clearCreateForm();
					updateList();
					document.body.style.cursor = 'default';
				}
				addSponsors(eventid, sponsorselection, innerhandler2);
			}
			addOrganizers(eventid, organizerselection, innerhandler);
		}
	}

	makeRequest("POST", cfg.proxy_path+"/events/create", send, handler);
}

function clearCreateForm() {
	var form = document.getElementById('formRec');

	form.name.value = "";
	form.description.value = "";

	form["formRec-startdate"].value = "";
	form["formRec-enddate"].value = "";
	form.duration.value = "";

	form.location_name.value = "";
	form.location_pobox.value = "";
	form.location_streetaddress.value = "";
	form.location_locality.value = "";
	form.location_region.value = "";
	form.location_postcode.value = "";
	form.location_country.value = cfg.default_country;

	document.getElementById('selectOrganizer').value = "";
	document.getElementById('selectSponsor').value = "";
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

function editBadgeEvent(eventid) {
	var event = events[eventid];

	var form = document.getElementById('formRecEdit');

	form.eventid.value = eventid;

	form.name.value = event.name;
	form.description.value = event.description;

	var startdate = new Date(event.startdate);
	var enddate = new Date(event.enddate);

	form["formRecEdit-startdate"].value = startdate.format(TIME_FORMAT_LONG);
	form["formRecEdit-enddate"].value = enddate.format(TIME_FORMAT_LONG);

	checkDateChange('formRecEdit');

	form.location_name.value = event.location_name;
	form.location_pobox.value = event.location_pobox;
	form.location_streetaddress.value = event.location_streetaddress;
	form.location_locality.value = event.location_locality;
	form.location_region.value = event.location_region;
	form.location_postcode.value = event.location_postcode;
	form.location_country.value = event.location_country;

	// set organizer choices.
	if (eventorganizers[eventid]) {
		var organizers = eventorganizers[eventid];
		var organizerids = [];
		for (var i=0; i<organizers.length; i++) {
			organizerids.push(parseInt(organizers[i].id));
		}

		var selectitem = document.getElementById('selectOrganizerEdit');
		selectitem.value = ""; // Reset pre-selected options (just in case)

		var count = selectitem.options.length;
		for (var i = 0; i < count; i++) {
			if (organizerids.indexOf(parseInt(selectitem.options[i].value)) > -1) {
				selectitem.options[i].selected = true;
			}
		}
	}

	// set sponsor choices.
	if (eventsponsors[eventid]) {
		var sponsors = eventsponsors[eventid];
		var sponsorids = [];
		for (var i=0; i<sponsors.length; i++) {
			sponsorids.push(parseInt(sponsors[i].id));
		}

		var selectitem = document.getElementById('selectSponsorEdit');
		selectitem.value = ""; // Reset pre-selected options (just in case)

		var count = selectitem.options.length;
		for (var i = 0; i < count; i++) {
			if (sponsorids.indexOf(parseInt(selectitem.options[i].value)) > -1) {
				selectitem.options[i].selected = true;
			}
		}
	}

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "block";
	document.getElementById('createFormShowButton').style.display = "none";
}

function updateBadgeEvent() {
	var form = document.getElementById('formRecEdit');

	var send = {};
	send.id = form.eventid.value;

	var startdatevalue = form["formRecEdit-startdate"].value.trim();
	if (startdatevalue == "") {
		alert("You must enter a start date and time");
		return;
	}
	var startdate = new Date(startdatevalue);
	var starttime = startdate.getTime();

	var enddatevalue = form["formRecEdit-enddate"].value.trim();
	if (enddatevalue == "") {
		alert("You must enter an end date and time");
		return;
	}
	var enddate = new Date(enddatevalue);
	var endtime = enddate.getTime();

	if (starttime > endtime) {
		alert("Your start date and time must be earlier than your end date and time");
		return;
	}

	send.name = demicrosoftize(form.name.value);
	send.description = demicrosoftize(form.description.value);
	send.startdate = starttime;
	send.enddate = endtime;

	send.location_name = demicrosoftize(form.location_name.value);
	send.location_pobox = demicrosoftize(form.location_pobox.value);
	send.location_streetaddress = demicrosoftize(form.location_streetaddress.value);
	send.location_locality = demicrosoftize(form.location_locality.value);
	send.location_region = demicrosoftize(form.location_region.value);
	send.location_postcode = demicrosoftize(form.location_postcode.value);
	send.location_country = form.location_country.options[form.location_country.selectedIndex].value

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			var organizerobj = document.getElementById('selectOrganizerEdit');
			organizerselection = getSelectValues(organizerobj);

			var innerhandler = function() {
				var sponsorobj = document.getElementById('selectSponsorEdit');
				sponsorselection = getSelectValues(sponsorobj);
				loadEventOrganizers(send.id);

				var innerhandler2 = function() {
					loadEventSponsors(send.id);

					cancelEditForm();
					updateList();
				}
				updateSponsors(send.id, sponsorselection, innerhandler2);
			}
			updateOrganizers(send.id, organizerselection, innerhandler);
		}
	}

	makeRequest("POST", cfg.proxy_path+"/events/update", send, handler);
}

function cancelEditForm() {
	var form = document.getElementById('formRecEdit');

	form.name.value = "";
	form.description.value = "";

	form["formRecEdit-startdate"].value = "";
	form["formRecEdit-enddate"].value = "";
	form.duration.value = "";

	form.location_name.value = "";
	form.location_pobox.value = "";
	form.location_streetaddress.value = "";
	form.location_locality.value = "";
	form.location_region.value = "";
	form.location_postcode.value = "";
	form.location_country.value = "";

	document.getElementById('selectOrganizerEdit').value = "";
	document.getElementById('selectSponsorEdit').value = "";

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function viewBadgeEvent(eventid) {
	var event = events[eventid];

	var form = document.getElementById('formRecView');

	form.name.value = event.name;
	form.description.value = event.description;

	var startdate = new Date(event.startdate);
	var enddate = new Date(event.enddate);

	form["formRecView-startdate"].value = startdate.format(TIME_FORMAT_LONG);
	form["formRecView-enddate"].value = enddate.format(TIME_FORMAT_LONG);

	checkDateChange('formRecView');

	form.location_name.value = event.location_name;
	form.location_pobox.value = event.location_pobox;
	form.location_streetaddress.value = event.location_streetaddress;
	form.location_locality.value = event.location_locality;
	form.location_region.value = event.location_region;
	form.location_postcode.value = event.location_postcode;
	form.location_country.value = event.location_country;

	// set organizer choices.
	if (eventorganizers[eventid]) {
		var organizers = eventorganizers[eventid];
		var organizerids = [];
		for (var i=0; i<organizers.length; i++) {
			organizerids.push(parseInt(organizers[i].id));
		}

		var selectitem = document.getElementById('selectOrganizerView');
		selectitem.value = ""; // Reset pre-selected options (just in case)

		var count = selectitem.options.length;
		for (var i = 0; i < count; i++) {
			if (organizerids.indexOf(parseInt(selectitem.options[i].value)) > -1) {
				selectitem.options[i].selected = true;
			}
		}
	}

	// set sponsor choices.
	if (eventsponsors[eventid]) {
		var sponsors = eventsponsors[eventid];
		var sponsorids = [];
		for (var i=0; i<sponsors.length; i++) {
			sponsorids.push(parseInt(sponsors[i].id));
		}

		var selectitem = document.getElementById('selectSponsorView');
		selectitem.value = ""; // Reset pre-selected options (just in case)

		var count = selectitem.options.length;
		for (var i = 0; i < count; i++) {
			if (sponsorids.indexOf(parseInt(selectitem.options[i].value)) > -1) {
				selectitem.options[i].selected = true;
			}
		}
	}

	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('viewDiv').style.display = "block";
	document.getElementById('createFormShowButton').style.display = "none";
}

function closeViewForm() {
	var form = document.getElementById('formRecView');

	form.name.value = "";
	form.description.value = "";

	form["formRecView-startdate"].value = "";
	form["formRecView-enddate"].value = "";
	form.duration.value = "";

	form.location_name.value = "";
	form.location_pobox.value = "";
	form.location_streetaddress.value = "";
	form.location_locality.value = "";
	form.location_region.value = "";
	form.location_postcode.value = "";
	form.location_country.value = "";

	document.getElementById('selectOrganizerView').value = "";
	document.getElementById('selectSponsorView').value = "";

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function deleteBadgeEvent(eventid) {
	var event = events[eventid];

	var message = "Are you sure you want to delete the event entry for: "+event.name;
	var reply = confirm(message);
	if (reply == true) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				clearCreateForm(); // in case it was open
				cancelEditForm(); // in case it was open
				updateList();
				//alert("The event record has been deleted");
			}
		}

		var send = {};
		send.id = eventid;
		makeRequest("POST", cfg.proxy_path+"/events/delete", send, handler);
	} else {
	  // do nothing
	}
}


function loadEventOrganizers(eventid){

	eventorganizers[eventid] = [];

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			eventorganizers[eventid] = response.organizers;
		}
	}

	makeRequest("GET", cfg.proxy_path+"/events/listorganizers/"+eventid, {}, handler);
}

function addOrganizers(eventid, organizerselection, returnhandler) {

	if (organizerselection.length == 0) {
		returnhandler();
		return;
	}

	for(i=0; i<organizerselection.length; i++) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				returnhandler();
			}
		}

		var send = {};
		send.id = eventid;
		send.organizationid = organizerselection[i];

		makeRequest("POST", cfg.proxy_path+"/events/addorganizer", send, handler);
	}
}

function updateOrganizers(eventid, organizerselection, returnhandler) {

	var organizers = [];
	var localeventorganizers = eventorganizers[eventid];
	if (localeventorganizers) {
		for (var i=0; i<localeventorganizers.length; i++) {
			organizers.push(localeventorganizers[i].id.toString());
		}
	}

	if (!organizerselection) {
		organizerselection = [];
	}

	if (organizerselection.length == 0 && organizers.length == 0) {
		returnhandler();
		return;
	}

	var flags = {};
	var finished = false;
	var errors = "";

	// remove organizers that have been removed in the edit
	for (var i=0; i<organizers.length; i++) {

		if (organizerselection.indexOf(organizers[i]) == -1) {
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
			send.id = eventid;
			send.organizationid = organizers[i];

			//console.log(cfg.proxy_path+"/events/removeorganizer");
			//console.log(send);

			makeRequest("POST", cfg.proxy_path+"/events/removeorganizer", send, handler);

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

	// add new organizers that have been added
	for(i=0; i<organizerselection.length; i++) {

		if (organizers.indexOf(organizerselection[i]) == -1) {

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
			send.id = eventid;
			send.organizationid = organizerselection[i];

			//console.log(cfg.proxy_path+"/events/addorganizer");
			//console.log(send);

			makeRequest("POST", cfg.proxy_path+"/events/addorganizer", send, handler);

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

	returnhandler();
}

function loadEventSponsors(eventid){

	eventsponsors[eventid] = [];

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			eventsponsors[eventid] = response.sponsors;
		}
	}

	makeRequest("GET", cfg.proxy_path+"/events/listsponsors/"+eventid, {}, handler);
}

function addSponsors(eventid, sponsorselection, returnhandler) {

	if (sponsorselection.length == 0) {
		returnhandler();
		return;
	}

	for(i=0; i<sponsorselection.length; i++) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				returnhandler();
			}
		}

		var send = {};
		send.id = eventid;
		send.organizationid = sponsorselection[i];

		makeRequest("POST", cfg.proxy_path+"/events/addsponsor", send, handler);
	}
}

function updateSponsors(eventid, sponsorselection, returnhandler) {

	var sponsors = [];
	var localeventsponsors = eventsponsors[eventid];
	if (localeventsponsors) {
		for (var i=0; i<localeventsponsors.length; i++) {
			sponsors.push(localeventsponsors[i].id.toString());
		}
	}

	if (!sponsorselection) {
		sponsorselection = [];
	}

	if (eventsponsors.length == 0 && sponsors.length == 0) {
		returnhandler();
		return;
	}

	var sponsorids = [];

	var flags = {};
	var finished = false;
	var errors = "";

	// remove sponsors that have been removed in the edit
	for (var i=0; i<sponsors.length; i++) {
		sponsorids.push(sponsors[i].id);
		if (sponsorselection.indexOf(sponsors[i]) == -1) {

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
			send.id = eventid;
			send.organizationid = sponsors[i];

			//console.log(cfg.proxy_path+"/events/removesponsor");
			//console.log(send);

			makeRequest("POST", cfg.proxy_path+"/events/removesponsor", send, handler);

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

	// add new sponsors that have been added
	for(i=0; i<sponsorselection.length; i++) {

		if (sponsors.indexOf(sponsorselection[i]) == -1) {

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
			send.id = eventid;
			send.organizationid = sponsorselection[i];

			//console.log(cfg.proxy_path+"/events/addsponsor");
			//console.log(send);

			makeRequest("POST", cfg.proxy_path+"/events/addsponsor", send, handler);

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

	returnhandler();
}

function loadOrganizationData(){

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			var theorganizerdiv =document.getElementById('organizerlist');
			var theorganizerviewdiv = document.getElementById('organizerlistview');
			var theorganizereditdiv = document.getElementById('organizerlistedit');
			theorganizerdiv.innerHTML = "";
			theorganizerviewdiv.innerHTML = "";
			theorganizereditdiv.innerHTML = "";

			var thesponsordiv =document.getElementById('sponsorlist');
			var thesponsorviewdiv = document.getElementById('sponsorlistview');
			var thesponsoreditdiv = document.getElementById('sponsorlistedit');
			thesponsordiv.innerHTML = "";
			thesponsorviewdiv.innerHTML = "";
			thesponsoreditdiv.innerHTML = "";

			organizations = {};

			if ( !response || !response.organizations || (response.organizations && response.organizations.length == 0) ) {

				// create organizer list
				var html = '<select class="selectmultiple" name="selectOrganizer" id="selectOrganizer" multiple="multiple">';
				html += "</select>";
				html += "<span style=\"color:#555;font-size:0.8em;\"><br>Currently you have no stored organization records</span>";
				theorganizerdiv.innerHTML = html;

				// edit organizer list
				var html2 = '<select class="selectmultiple" name="selectOrganizerEdit" id="selectOrganizerEdit" multiple="multiple">';
				html2 += "</select>";
				html2 += "<span style=\"color:#555;font-size:0.8em;\"><br>Currently you have no stored alignment records</span>";
				theorganizereditdiv.innerHTML = html2;

				// view organizer list
				var html3 = '<select readonly class="selectmultiple" name="selectOrganizerView" id="selectOrganizerView" multiple="multiple">';
				html3 += "</select>";
				html3 += "<span style=\"color:#555;font-size:0.8em;\"><br>Currently you have no stored Organization records</span>";
				theorganizerviewdiv.innerHTML = html3;

				// create sponsor list
				var html = '<select class="selectmultiple" name="selectSponsor" id="selectSponsor" multiple="multiple">';
				html += "</select>";
				html += "<span style=\"color:#555;font-size:0.8em;\"><br>Currently you have no stored organization records</span>";
				thesponsordiv.innerHTML = html;

				// edit sponsor list
				var html2 = '<select class="selectmultiple" name="selectSponsorEdit" id="selectSponsorEdit" multiple="multiple">';
				html2 += "</select>";
				html2 += "<span style=\"color:#555;font-size:0.8em;\"><br>Currently you have no stored organization records</span>";
				thesponsoreditdiv.innerHTML = html2;

				// view sponsor list
				var html3 = '<select readonly class="selectmultiple" name="selectSponsorView" id="selectSponsorView" multiple="multiple">';
				html3 += "</select>";
				html3 += "<span style=\"color:#555;font-size:0.8em;\"><br>Currently you have no stored organization records</span>";
				thesponsorviewdiv.innerHTML = html3;

				updateList();
			} else {
				//console.log("Creating Organization lists");

				// create organizer list
				var html = '<select class="selectmultiple" name="selectOrganizer" id="selectOrganizer" multiple="multiple">';
				for (i = 0; i < response.organizations.length; i++) {
					organizations[response.organizations[i].id] = response.organizations[i];
					html += '<option value="'+ response.organizations[i].id +'">'+ response.organizations[i].name + '</option>';
				}

				html += "</select>";
				html += "<span style=\"color:#555;font-size:0.8em;\"><br>Select Organizer (Shift for multiple choice, Ctrl/Cmd to select/unselect individual choice).</span>";
				theorganizerdiv.innerHTML = html;

				// edit organizer list
				var html2 = '<select class="selectmultiple" name="selectOrganizerEdit" id="selectOrganizerEdit" multiple="multiple">';
				for (i = 0; i < response.organizations.length; i++) {
					organizations[response.organizations[i]] = response.organizations[i];
					html2 += '<option value="'+ response.organizations[i].id +'">'+ response.organizations[i].name + '</option>';
				}

				html2 += "</select>";
				html2 += "<span style=\"color:#555;font-size:0.8em;\"><br>Select Organizer (Shift for multiple choice, Ctrl/Cmd to select/unselect individual choice).</span>";
				theorganizereditdiv.innerHTML = html2;

				// view organizer list
				var html3 = '<select disabled class="selectmultiple" name="selectOrganizerView" id="selectOrganizerView" multiple="multiple">';
				for (i = 0; i < response.organizations.length; i++) {
					organizations[response.organizations[i]] = response.organizations[i];
					html3 += '<option disabled value="'+ response.organizations[i].id +'">'+ response.organizations[i].name + '</option>';
				}
				html3 += "</select>";
				theorganizerviewdiv.innerHTML = html3;

				// create sponsor list
				var html = '<select class="selectmultiple" name="selectSponsor" id="selectSponsor" multiple="multiple">';
				for (i = 0; i < response.organizations.length; i++) {
					organizations[response.organizations[i].id] = response.organizations[i];
					html += '<option value="'+ response.organizations[i].id +'">'+ response.organizations[i].name + '</option>';
				}

				html += "</select>";
				html += "<span style=\"color:#555;font-size:0.8em;\"><br>Select Sponsor (Shift for multiple choice, Ctrl/Cmd to select/unselect individual choice).</span>";
				thesponsordiv.innerHTML = html;

				// edit sponsor list
				var html2 = '<select class="selectmultiple" name="selectSponsorEdit" id="selectSponsorEdit" multiple="multiple">';
				for (i = 0; i < response.organizations.length; i++) {
					organizations[response.organizations[i]] = response.organizations[i];
					html2 += '<option value="'+ response.organizations[i].id +'">'+ response.organizations[i].name + '</option>';
				}

				html2 += "</select>";
				html2 += "<span style=\"color:#555;font-size:0.8em;\"><br>Select Sponsor (Shift for multiple choice, Ctrl/Cmd to select/unselect individual choice).</span>";
				thesponsoreditdiv.innerHTML = html2;

				// view sponsor list
				var html3 = '<select disabled class="selectmultiple" name="selectSponsorView" id="selectSponsorView" multiple="multiple">';
				for (i = 0; i < response.organizations.length; i++) {
					organizations[response.organizations[i]] = response.organizations[i];
					html3 += '<option disabled value="'+ response.organizations[i].id +'">'+ response.organizations[i].name + '</option>';
				}
				html3 += "</select>";
				thesponsorviewdiv.innerHTML = html3;

				updateList();
			}
		}
	}

	makeRequest("GET", cfg.proxy_path+"/organizations/list", {}, handler);
}

function updateList(){

	var handler = function(response) {

		events = {}
		var data = new Array();

		if ( response && response.events && response.events.length > 0 ) {

			for (i = 0; i < response.events.length; i++) {

				// store to global list by id
				events[response.events[i].id] = response.events[i]

				loadEventOrganizers(response.events[i].id);
				loadEventSponsors(response.events[i].id);

				data[i] = {};

				data[i].id = response.events[i].id;
				data[i].name = response.events[i].name;

				data[i].view = '<center><button class="sbut" title="View" onclick="viewBadgeEvent(\''+response.events[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" /></button></center>';

				if (response.events[i].usedInIssuance === false) {
					data[i].edit = '<center><button class="sbut" title="Edit" onclick="editBadgeEvent(\''+response.events[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/edit.png" /></button></center>';
				} else {
					data[i].edit = '<center>Used</center>';
				}

				if (response.events[i].usedInIssuance === false) {
					data[i].delete = '<center><button class="sbut" title="Delete" onclick="deleteBadgeEvent(\''+response.events[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/delete.png" /></button></center>';
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

	makeRequest("GET", cfg.proxy_path+"/events/list", {}, handler);
}