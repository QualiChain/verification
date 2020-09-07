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
var table = null;

var badgealignments = {}

var badgecriteriaevents = {}
var badgecriteriaeventorganizers = {};
var badgecriteriaeventsponsors = {};

var criteriaeventscollection = {};
var criteriaeventorganizerscollection = {};
var criteriaeventsponsorscollection = {};

var protocol = "";
var domain = "";

function initializePage(sprotocol, sdomain) {

	protocol = sprotocol;
	domain = sdomain;

	loadBadgeData();
}

function loadEventArea(eventid) {

	closeEventArea();

	var event = criteriaeventscollection[eventid];

	document.getElementById('event_name').value = event.name;
	document.getElementById('event_description').value = event.description;

	var startdate = null;
	if (event.startdate && event.startdate != null) {
		var startdate = new Date(event.startdate);
		document.getElementById('event_startdate').value = startdate.format(TIME_FORMAT_LONG);
	}
	var enddate = null;
	if (event.enddate && event.enddate != null) {
		var enddate = new Date(event.enddate);
		document.getElementById('event_enddate').value = enddate.format(TIME_FORMAT_LONG);
	}
	if (startdate != null && enddate != null) {
		var durationobj = getDuration(startdate, enddate);
		var formattedDuration = getFormattedDuration(durationobj); // in utilities.js

		document.getElementById('event_duration').value = formattedDuration.str;
	}

	document.getElementById('location_name').value = event.location_name;
	document.getElementById('location_pobox').value = event.location_pobox;
	document.getElementById('location_streetaddress').value = event.location_streetaddress;
	document.getElementById('location_locality').value = event.location_locality;
	document.getElementById('location_region').value = event.location_region;
	document.getElementById('location_postcode').value = event.location_postcode;
	document.getElementById('location_country').value = COUNTRIES_LIST[event.location_country];

	// draw organizer choices.
	var organizertablebody = document.getElementById('organizerlistview');
	if (badgecriteriaeventorganizers[eventid]) {
		drawCriteriaEventOrganizers(eventid);
	} else {
		loadCriteriaEventOrganizers(eventid);
	}

	// draw sponsor choices.
	var sponsortablebody = document.getElementById('sponsorlistview');
	if (badgecriteriaeventsponsors[eventid]) {
		drawCriteriaEventSponsors(eventid);
	} else {
		loadCriteriaEventSponsors(eventid);
	}

	var area = document.getElementById('eventDiv');
	area.style.display = "block";
}

function closeEventArea() {
	var area = document.getElementById('eventDiv');
	area.style.display = "none";

	closeEventOrganizerArea();
	closeEventSponsorArea();

	document.getElementById('event_name').value = "";
	document.getElementById('event_description').value = "";
	document.getElementById('event_startdate').value = "";
	document.getElementById('event_enddate').value = "";
	document.getElementById('location_name').value = "";
	document.getElementById('location_pobox').value = "";
	document.getElementById('location_streetaddress').value = "";
	document.getElementById('location_locality').value = "";
	document.getElementById('location_region').value = "";
	document.getElementById('location_postcode').value = "";
	document.getElementById('location_country').value = "";

	var organizertablebody = document.getElementById('organizerlistview');
	organizertablebody.innerHTML = "";

	var sponsortablebody = document.getElementById('sponsorlistview');
	sponsortablebody.innerHTML = ""
}


function loadEventOrganizerArea(organizerid) {

	closeEventOrganizerArea();

	var organizer = criteriaeventorganizerscollection[organizerid];

	document.getElementById('organizer_name').value = organizer.name;
	document.getElementById('organizer_email').value = organizer.email;
	document.getElementById('organizer_pobox').value = organizer.pobox;
	document.getElementById('organizer_streetaddress').value = organizer.streetaddress;
	document.getElementById('organizer_locality').value = organizer.locality;
	document.getElementById('organizer_region').value = organizer.region;
	document.getElementById('organizer_postcode').value = organizer.postcode;
	document.getElementById('organizer_country').value = COUNTRIES_LIST[organizer.country];

	var area = document.getElementById('organizerDiv');
	area.style.display = "block";
}

function closeEventOrganizerArea() {
	var area = document.getElementById('organizerDiv');
	area.style.display = "none";

	document.getElementById('organizer_name').value = "";
	document.getElementById('organizer_email').value = "";
	document.getElementById('organizer_pobox').value = "";
	document.getElementById('organizer_streetaddress').value = "";
	document.getElementById('organizer_locality').value = "";
	document.getElementById('organizer_region').value = "";
	document.getElementById('organizer_postcode').value = "";
	document.getElementById('organizer_country').value = "";
}


function loadEventSponsorArea(sponsorid) {

	closeEventSponsorArea();

	var sponsor = criteriaeventsponsorscollection[sponsorid];

	document.getElementById('sponsor_name').value = sponsor.name;
	document.getElementById('sponsor_email').value = sponsor.email;
	document.getElementById('sponsor_pobox').value = sponsor.pobox;
	document.getElementById('sponsor_streetaddress').value = sponsor.streetaddress;
	document.getElementById('sponsor_locality').value = sponsor.locality;
	document.getElementById('sponsor_region').value = sponsor.region;
	document.getElementById('sponsor_postcode').value = sponsor.postcode;
	document.getElementById('sponsor_country').value = COUNTRIES_LIST[sponsor.country];

	var area = document.getElementById('sponsorDiv');
	area.style.display = "block";
}

function closeEventSponsorArea() {
	var area = document.getElementById('sponsorDiv');
	area.style.display = "none";

	document.getElementById('sponsor_name').value = "";
	document.getElementById('sponsor_email').value = "";
	document.getElementById('sponsor_pobox').value = "";
	document.getElementById('sponsor_streetaddress').value = "";
	document.getElementById('sponsor_locality').value = "";
	document.getElementById('sponsor_region').value = "";
	document.getElementById('sponsor_postcode').value = "";
	document.getElementById('sponsor_country').value = "";
}

function viewBadge(badgeid) {

	closeViewForm();

	var badge = badges[badgeid];

	var form = document.getElementById('formRecView');
	form.title.value = badge.title;
	form.description.value = badge.description;
	form.imageurl.value = badge.imageurl;
	form.version.value = badge.version;
	//form.issueridedit.value = badge.issuerid;
	form.criterianarrative.value = badge.criterianarrative;
	form.tags.value = badge.tags;

	if (badgealignments[badgeid]) {
		drawBadgeAlignments(badgeid);
	} else {
		loadBadgeAlignment(badgeid);
	}

	if (badgecriteriaevents[badgeid]) {
		drawCriteriaEvents(badgeid);
	} else {
		loadCriteriaEvents(badgeid);
	}

	document.getElementById('viewDiv').style.display = "block";
}

function closeViewForm() {

	closeEventSponsorArea();
	closeEventOrganizerArea();
	closeEventArea();

	var form = document.getElementById('formRecView');

	form.title.value = "";
	form.description.value = "";
	form.imageurl.value = "";
	form.version.value = "";
	//form.issueridedit.value = "";
	form.criterianarrative.value = "";
	form.tags.value = "";

	var alignmentlist = document.getElementById('alignmentlistview');
	alignmentlist.innerHTML = "";

	document.getElementById('viewDiv').style.display = "none";
}

function loadCriteriaEvents(badgeid){

	badgecriteriaevents[badgeid] = [];

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			badgecriteriaevents[badgeid] = response.events;
			drawCriteriaEvents(badgeid);
		}
	}

	makeRequest("GET", cfg.proxy_path+cfg.badges_path+"/listcriteriaevents/"+badgeid, {}, handler);
}

function drawCriteriaEvents(badgeid) {

	var criteriaevents = badgecriteriaevents[badgeid];

	var thediv =document.getElementById('criteriaeventlistview');

	var html = "";
	for (i = 0; i < criteriaevents.length; i++) {
		criteriaeventscollection[criteriaevents[i].id] = criteriaevents[i];

		html += "<tr>";

		html += '<td style="padding: 6px; border: 1px solid grey;">';
		html += criteriaevents[i].name;
		html += '</td>';

		html += '<td style="padding: 6px; border: 1px solid grey;" class="wrapit">';
		html += new Date(criteriaevents[i].startdate).format(TIME_FORMAT_LONG);
		html += '</td>';

		html += '<td style="padding: 6px; border: 1px solid grey;" class="wrapit">';
		html += new Date(criteriaevents[i].enddate).format(TIME_FORMAT_LONG);
		html += '</td>';

		html += '<td style="padding: 6px; border: 1px solid grey;background-color:#f9f5f8" class="wrapit">';
		html += '<input onclick="loadEventArea(\''+criteriaevents[i].id+'\')" type="button" value="View Event" />';

		//html += '<form> <input type="hidden" name="accion" id="accion"/> <input name="View Event" type="image" src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" alt="View Event" value="View Event" onclick="loadEventArea(\''+criteriaevents[i].id+'\');"/> </form>';

		//html += '<input onclick="loadEventArea(\''+criteriaevents[i].id+'\');" type="button" src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" value="View Event" />';
		//html += '<button onclick="loadEventArea(\''+criteriaevents[i].id+'\');" type="" name="View Event" value="View Event" style="background:none;border:none;padding:0"><img src="'+cfg.proxy_path+'/images/issuing_buttons/view.png"></button>';
		//html += '<center><button class="sbut" title="View Event" onclick="loadEventArea(\''+criteriaevents[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" /></button></center>';

		html += '</td>';

		html += "</tr>";
	}
	thediv.innerHTML = html;
}

function loadCriteriaEventOrganizers(eventid){

	badgecriteriaeventorganizers[eventid] = [];

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			console.log(response);
			badgecriteriaeventorganizers[eventid] = response.organizers;
			drawCriteriaEventOrganizers(eventid);
		}
	}

	makeRequest("GET", cfg.proxy_path+"/events/listorganizers/"+eventid, {}, handler);
}

function drawCriteriaEventOrganizers(eventid) {

	var criteriaeventorganizers = badgecriteriaeventorganizers[eventid];

	var thediv =document.getElementById('organizerlistview');

	var html = "";
	for (i = 0; i < criteriaeventorganizers.length; i++) {
		criteriaeventorganizerscollection[criteriaeventorganizers[i].id] = criteriaeventorganizers[i];

		html += "<tr>";

		html += '<td style="padding: 6px; border: 1px solid grey;background-color:#fff;">';
		html += criteriaeventorganizers[i].name;
		html += '</td>';

		html += '<td style="padding: 6px; border: 1px solid grey;background-color:#fff;">';
		html += criteriaeventorganizers[i].email;
		html += '</td>';

		html += '<td style="text-align:center;padding:6px;border: 1px solid grey;background-color:#f2e9f0;" class="wrapit">';
		html += '<input onclick="loadEventOrganizerArea(\''+criteriaeventorganizers[i].id+'\')" type="button" value="View Organizer" />';
		html += '</td>';

		html += "</tr>";
	}
	thediv.innerHTML = html;
}

function loadCriteriaEventSponsors(eventid){

	badgecriteriaeventsponsors[eventid] = [];

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			console.log(response);
			badgecriteriaeventsponsors[eventid] = response.sponsors;
			drawCriteriaEventSponsors(eventid);
		}
	}

	makeRequest("GET", cfg.proxy_path+"/events/listsponsors/"+eventid, {}, handler);
}

function drawCriteriaEventSponsors(eventid) {

	var criteriaeventsponsors = badgecriteriaeventsponsors[eventid];

	var thediv = document.getElementById('sponsorlistview');

	var html = "";
	for (i = 0; i < criteriaeventsponsors.length; i++) {
		criteriaeventsponsorscollection[criteriaeventsponsors[i].id] = criteriaeventsponsors[i];

		html += "<tr>";

		html += '<td style="padding: 6px; border: 1px solid grey;background-color:#fff;">';
		html += criteriaeventsponsors[i].name;
		html += '</td>';

		html += '<td style="padding: 6px; border: 1px solid grey;background-color:#fff;">';
		html += criteriaeventsponsors[i].email;
		html += '</td>';

		html += '<td style="text-align:center;padding:6px;border: 1px solid grey;background-color:#f2e9f0;" class="wrapit">';
		html += '<input onclick="loadEventSponsorArea(\''+criteriaeventsponsors[i].id+'\')" type="button" value="View Sponsor" />';
		html += '</td>';

		html += "</tr>";
	}
	thediv.innerHTML = html;
}

function loadBadgeAlignment(badgeid){

	badgealignments[badgeid] = [];

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			badgealignments[badgeid] = response.alignments;
			drawBadgeAlignments(badgeid);
		}
	}

	makeRequest("GET", cfg.proxy_path+cfg.badges_path+"/listalignments/"+badgeid, {}, handler);
}

function drawBadgeAlignments(badgeid) {

	var alignments = badgealignments[badgeid];

	var thediv =document.getElementById('alignmentlistview');

	var html = "";
	for (i = 0; i < alignments.length; i++) {

		html += "<tr>";

		html += '<td style="padding: 6px; border: 1px solid grey;">';
		html += alignments[i].name;
		html += '</td>';

		html += '<td style="padding: 6px; border: 1px solid grey;" class="wrapit">';
		html += alignments[i].url;
		html += '</td>';

		html += '<td style="padding: 6px; border: 1px solid grey;">';
		html += alignments[i].description;
		html += '</td>';

		html += '<td style="padding: 6px; border: 1px solid grey;">';
		html += alignments[i].framework;
		html += '</td>';

		html += '<td style="padding: 6px; border: 1px solid grey;">';
		html += alignments[i].code;
		html += '</td>';

		html += "</tr>";
	}
	thediv.innerHTML = html;
}

function viewQualifyingBadges(badgeid) {
	var form = document.getElementById('qualifyingform');
	form.badgeid.value = badgeid;
	//console.log(form.badgeid.value);
	form.submit();
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

function loadBadgeData(){

	var handler = function(response) {

		badges = {};
		badgealignments = {};
		var data = new Array();

		if (response && response.badges && response.badges.length > 0) {
			var temp=0;

			for (i = 0; i < response.badges.length; i++) {

				badges[response.badges[i].id] = response.badges[i];

				data[i] = {};

				data[i].id = response.badges[i].id;

				if (response.badges[i].imageurl) {
					data[i].image = '<img height="50"; src="'+response.badges[i].imageurl+'"/>';
				} else {
					data[i].image = '&nbsp;';
				}

				data[i].title = response.badges[i].title;
				data[i].version = response.badges[i].version;

				data[i].qualifying = '<div style="float:left;margin-left:20px; margin-top:5px;"><span>Items: </span><span style="padding-right:20px;font-weight:bold" id="qualifyingcount-'+response.badges[i].id+'">0</span></div>';
				data[i].qualifying += '<button class="sbut" title="Manage Qualifying Badges" onclick="viewQualifyingBadges(\''+response.badges[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/qualifying.png" /></button>';

				//data[i].view = '<center><button class="sbut" title="View" onclick="viewBadge(\''+response.badges[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" /></button></center>';
				data[i].view = '<center><a title="View Badge details - opens in new tab" target="_blank" href="'+cfg.proxy_path+cfg.badges_path+'/view/'+response.badges[i].badgeuniqueid+'"><img src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" /></a></center>';

				temp = i;
			}
		}

		if (table != null) table.destroy();

		table = $('#storedList').DataTable({
			"data": data,
			"stateSave": true,
			"columns": [
				{ "data": "id", "title": "ID", "width": "10%" },
				{ "data": "image", "title": "Images", "width": "20%", "orderable": false },
				{ "data": "title", "title": "Title", "width": "40%" },
				{ "data": "version" , "title": "Version", "width": "5%" },
				{ "data": "qualifying" , "title": "Qualifying Badges", "width": "15%", "orderable": true },
				{ "data": "view" , "title": "View", "width": "10%", "orderable": false },
			],
			"order": [[ 0, "desc" ]]
		});

		// get the qualifying badge counts for badges
		if (response && response.badges && response.badges.length > 0) {
			for (i = 0; i < response.badges.length; i++) {
				var item = response.badges[i];
				getQualifyingCount(item.id);
			}
		}
	}

	makeRequest("GET", cfg.proxy_path+cfg.badges_path+"/list", {}, handler);
}