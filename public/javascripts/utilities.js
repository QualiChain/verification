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


var DATE_FORMAT = 'd/m/yy';
var DATE_FORMAT_LONG = 'd mmm yyyy';
var TIME_FORMAT = 'd/m/yy - H:MM';
var TIME_FORMAT_LONG = 'd mmm yyyy H:MM';
var DATE_FORMAT_SHORT = 'd mmm yyyy';


/*** FUNCTIONS FOR DRAWING BADGE DATA FROM JSON - USED IN SEVERAL PLACES HENCE HERE  ***/

var badgecriteriaeventorganizers = {};
var badgecriteriaeventsponsors = {};
var criteriaeventscollection = {};
var criteriaeventorganizerscollection = {};
var criteriaeventsponsorscollection = {};

/**
 * Fade a cetner message in and out
 */
function fadeMessage(messageStr) {
	var messagediv = document.getElementById('message');
	if (messagediv) {
		var viewportHeight = getWindowHeight();
		var viewportWidth = getWindowWidth();
		var x = (viewportWidth-300)/2;
		var y = (viewportHeight-100)/2;
		messagediv.style.left = x+getPageOffsetX()+"px";
		messagediv.style.top = y+getPageOffsetY()+"px";
		messagediv.innerHTML = "";
		messagediv.innerHTML = '<div style="display: table-cell;vertical-align:middle;">'+messageStr+'</div>';
		messagediv.style.display = "table";
		fadein();
		setTimeout("fadeout()",2000);
	}
}

function fadein(){
	var messagediv = document.getElementById('message');
	if (messagediv) {
		messagediv.classList.add('fadein');
		messagediv.classList.remove('fadeout');
	}
}

function fadeout(){
	var messagediv = document.getElementById('message');
	if (messagediv) {
		messagediv.classList.add('fadeout');
		messagediv.classList.remove('fadein');

		// wait for css fadeout - the time needs to match css
		setTimeout('hideMessage()',1000);
	}
}

function hideMessage() {
	var messagediv = document.getElementById('message');
	if (messagediv) {
		messagediv.style.left = "0px";
		messagediv.style.top = "0px";
		messagediv.style.display = "none";
	}
}

/**
 * Return the height of the current browser page.
 * Defaults to 500.
 */
function getWindowHeight(){
  	var viewportHeight = 500;
	if (self.innerHeight) {
		// all except Explorer
		viewportHeight = self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) {
	 	// Explorer 6 Strict Mode
		viewportHeight = document.documentElement.clientHeight;
	} else if (document.body)  {
		// other Explorers
		viewportHeight = document.body.clientHeight;
	}
	return viewportHeight;
}

/**
 * Return the width of the current browser page.
 * Defaults to 500.
 */
function getWindowWidth(){
  	var viewportWidth = 500;
	if (self.innerHeight) {
		// all except Explorer
		viewportWidth = self.innerWidth;
	} else if (document.documentElement && document.documentElement.clientHeight) {
	 	// Explorer 6 Strict Mode
		viewportWidth = document.documentElement.clientWidth;
	} else if (document.body)  {
		// other Explorers
		viewportWidth = document.body.clientWidth;
	}
	return viewportWidth;
}

function getPageOffsetX() {
	var x = 0;

    if (typeof(window.pageXOffset) == 'number') {
		x = window.pageXOffset;
	} else {
        if (document.body && document.body.scrollLeft) {
			x = document.body.scrollLeft;
        } else if (document.documentElement && document.documentElement.scrollLeft) {
			x = document.documentElement.scrollLeft;
		}
	}

	return x;
}

function getPageOffsetY() {
	var y = 0;

    if (typeof(window.pageYOffset) == 'number') {
		y = window.pageYOffset;
	} else {
        if (document.body && document.body.scrollTop) {
			y = document.body.scrollTop;
        } else if (document.documentElement && document.documentElement.scrollTop) {
			y = document.documentElement.scrollTop;
		}
	}

	return y;
}

/**
 * Clear the criteria event form
 */
function closeCriteriaEventFromJSON() {

	if (document.getElementById('event_name')) {
		document.getElementById('event_name').innerHTML = "";
	}
	if (document.getElementById('event_description')) {
		document.getElementById('event_description').innerHTML = "";
	}
	if (document.getElementById('event_startdate')) {
		document.getElementById('event_startdate').innerHTML = "";
	}
	if (document.getElementById('event_enddate')) {
		document.getElementById('event_enddate').innerHTML = "";
	}
	if (document.getElementById('location_name')) {
		document.getElementById('location_name').innerHTML = "";
	}
	if (document.getElementById('location_pobox')) {
		document.getElementById('location_pobox').innerHTML = "";
	}
	if (document.getElementById('location_streetaddress')) {
		document.getElementById('location_streetaddress').innerHTML = "";
	}
	if (document.getElementById('location_locality')) {
		document.getElementById('location_locality').innerHTML = "";
	}
	if (document.getElementById('location_region')) {
		document.getElementById('location_region').innerHTML = "";
	}
	if (document.getElementById('location_postcode')) {
		document.getElementById('location_postcode').innerHTML = "";
	}
	if (document.getElementById('location_country')) {
		document.getElementById('location_country').innerHTML = "";
	}

	if (document.getElementById('organizerlistview')) {
		var organizertablebody = document.getElementById('organizerlistview');
		organizertablebody.innerHTML = "";
	}
	if (document.getElementById('sponsorlistview')) {
		var sponsortablebody = document.getElementById('sponsorlistview');
		sponsortablebody.innerHTML = ""
	}

	if (document.getElementById('eventDiv')) {
		var area = document.getElementById('eventDiv');
		area.style.display = "none";
	}

	closeCriteriaEventOrganizerFromJSON();
	closeCriteriaEventSponsorFromJSON();
}

/**
 * Load a given criteria event from the given event id
 */
function loadCriteriaEventJSON(id) {

	var eventjson = criteriaeventscollection[id];

	closeCriteriaEventFromJSON();
	closeCriteriaEventOrganizerFromJSON();
	closeCriteriaEventSponsorFromJSON();

	var enddate = "";
	var startdate = "";

	if (eventjson && document.getElementById('eventDiv')) {

		if (eventjson.name && document.getElementById('event_name')) {
			document.getElementById('event_name').innerHTML = eventjson.name;
		}
		if (eventjson.description && document.getElementById('event_description')) {
			document.getElementById('event_description').innerHTML = eventjson.description;
		}
		if (eventjson.startDate && document.getElementById('event_startdate')) {
			startdate = new Date(eventjson.startDate);
			document.getElementById('event_startdate').innerHTML = startdate.format(TIME_FORMAT_LONG);
		}
		if (eventjson.startdate && document.getElementById('event_startdate')) {
			startdate = new Date(eventjson.startdate);
			document.getElementById('event_startdate').innerHTML = startdate.format(TIME_FORMAT_LONG);
		}
		if (eventjson.endDate && document.getElementById('event_enddate')) {
			enddate = new Date(eventjson.endDate);
			document.getElementById('event_enddate').innerHTML = enddate.format(TIME_FORMAT_LONG);
		}
		if (eventjson.enddate && document.getElementById('event_enddate')) {
			enddate = new Date(eventjson.enddate);
			document.getElementById('event_enddate').innerHTML = enddate.format(TIME_FORMAT_LONG);
		}

		if (startdate != "" && enddate != "" && document.getElementById('event_duration')) {
			var durationobj = getDuration(startdate, enddate);
			var formattedDuration = getFormattedDuration(durationobj); // in utilities.js
			document.getElementById('event_duration').innerHTML = formattedDuration.str;
		}

		if (eventjson.enddate && document.getElementById('event_enddate')) {
			var enddate = new Date(eventjson.enddate);
			document.getElementById('event_enddate').innerHTML = enddate.format(TIME_FORMAT_LONG);
		}
		if (eventjson.location) {
			if (eventjson.location.name && document.getElementById('location_name')) {
				document.getElementById('location_name').innerHTML = eventjson.location.name;
			}
			if (eventjson.location.address) {
				if (eventjson.location.address.postOfficeBoxNumber && document.getElementById('location_pobox')) {
					document.getElementById('location_pobox').innerHTML = eventjson.location.address.postOfficeBoxNumber;
				}
				if (eventjson.location.address.streetAddress && document.getElementById('location_streetaddress')) {
					document.getElementById('location_streetaddress').innerHTML = eventjson.location.address.streetAddress;
				}
				if (eventjson.location.address.addressLocality && document.getElementById('location_locality')) {
					document.getElementById('location_locality').innerHTML = eventjson.location.address.addressLocality;
				}
				if (eventjson.location.address.addressRegion && document.getElementById('location_region')) {
					document.getElementById('location_region').innerHTML = eventjson.location.address.addressRegion;
				}
				if (eventjson.location.address.postalCode && document.getElementById('location_postcode')) {
					document.getElementById('location_postcode').innerHTML = eventjson.location.address.postalCode;
				}
				if (eventjson.location.address.addressCountry && document.getElementById('location_country')) {
					document.getElementById('location_country').innerHTML = COUNTRIES_LIST[eventjson.location.address.addressCountry];
				}
			}
		}

		// draw organizer choices.
		if (eventjson.organizer && eventjson.organizer.length > 0) {
			var organizertablebody = document.getElementById('organizerlistview');
			drawCriteriaEventOrganizers(id);
		}

		// draw sponsor choices.
		if (eventjson.sponsor && eventjson.sponsor.length > 0) {
			var sponsortablebody = document.getElementById('sponsorlistview');
			drawCriteriaEventSponsors(id);
		}

		var area = document.getElementById('eventDiv');
		area.style.display = "block";
	}
}

function drawCriteriaEvents(criteriaevents) {

	criteriaeventscollection = {};
	badgecriteriaeventorganizers = {};
	badgecriteriaeventsponsors = {};

	if (criteriaevents && criteriaevents.length > 0) {
		var thediv = document.getElementById('criteriaeventlistview');

		var html = "";
		for (i = 0; i < criteriaevents.length; i++) {
			criteriaeventscollection[i] = criteriaevents[i];

			if (criteriaevents[i].organizer && criteriaevents[i].organizer.length > 0) {
				badgecriteriaeventorganizers[i] = criteriaevents[i].organizer;
			}

			if (criteriaevents[i].sponsor && criteriaevents[i].sponsor.length > 0) {
				badgecriteriaeventsponsors[i] = criteriaevents[i].sponsor;
			}

			html += "<tr>";

			html += '<td style="padding: 6px; border: 1px solid grey;">';
			if (criteriaevents[i].name) {
				html += criteriaevents[i].name;
			} else {
				html += "&nbsp;";
			}
			html += '</td>';

			html += '<td style="padding: 6px; border: 1px solid grey;" class="wrapit">';
			if (criteriaevents[i].startDate && criteriaevents[i].startDate != "") {
				html += new Date(criteriaevents[i].startDate).format(TIME_FORMAT_LONG);
			} else if (criteriaevents[i].startdate && criteriaevents[i].startdate != "") {
				html += new Date(criteriaevents[i].startdate).format(TIME_FORMAT_LONG);
			} else {
				html += "&nbsp;";
			}
			html += '</td>';

			html += '<td style="padding: 6px; border: 1px solid grey;" class="wrapit">';

			if (criteriaevents[i].endDate && criteriaevents[i].endDate != "") {
				html += new Date(criteriaevents[i].endDate).format(TIME_FORMAT_LONG);
			} if (criteriaevents[i].enddate && criteriaevents[i].enddate != "") {
				html += new Date(criteriaevents[i].enddate).format(TIME_FORMAT_LONG);
			} else {
				html += "&nbsp;";
			}
			html += '</td>';

			html += '<td class="eventtablebutton">';
			html += '<input onclick="loadCriteriaEventJSON('+i+')" type="button" value="View Event" />';

			html += '</td>';

			html += "</tr>";
		}
		thediv.innerHTML = html;
	}
}

function closeCriteriaEventOrganizerFromJSON() {

	if (document.getElementById('organizerDiv')) {
		var area = document.getElementById('organizerDiv');
		area.style.display = "none";
	}

	if (document.getElementById('organizer_name')) {
		document.getElementById('organizer_name').innerHTML = "";
	}
	if (document.getElementById('organizer_email')) {
		document.getElementById('organizer_email').innerHTML = "";
	}
	if (document.getElementById('organizer_pobox')) {
		document.getElementById('organizer_pobox').innerHTML = "";
	}
	if (document.getElementById('organizer_streetaddress')) {
		document.getElementById('organizer_streetaddress').innerHTML = "";
	}
	if (document.getElementById('organizer_locality')) {
		document.getElementById('organizer_locality').innerHTML = "";
	}
	if (document.getElementById('organizer_region')) {
		document.getElementById('organizer_region').innerHTML = "";
	}
	if (document.getElementById('organizer_postcode')) {
		document.getElementById('organizer_postcode').innerHTML = "";
	}
	if (document.getElementById('organizer_country')) {
		document.getElementById('organizer_country').innerHTML = "";
	}
}

function loadCriteriaEventOrganizerFromJSON(id) {

	closeCriteriaEventOrganizerFromJSON();

	var organizerjson = criteriaeventorganizerscollection[id];

	if (document.getElementById('organizer_name') && organizerjson.name) {
		document.getElementById('organizer_name').innerHTML = organizerjson.name;
	}
	if (document.getElementById('organizer_email') && organizerjson.email) {
		document.getElementById('organizer_email').innerHTML = organizerjson.email;
	}
	if (organizerjson.address) {
		if (document.getElementById('organizer_pobox') && organizerjson.address.postOfficeBoxNumber) {
			document.getElementById('organizer_pobox').innerHTML = organizerjson.address.postOfficeBoxNumber;
		}
		if (document.getElementById('organizer_streetaddress') && organizerjson.address.streetAddress) {
			document.getElementById('organizer_streetaddress').innerHTML = organizerjson.address.streetAddress;
		}
		if (document.getElementById('organizer_locality') && organizerjson.address.addressLocality) {
			document.getElementById('organizer_locality').innerHTML = organizerjson.address.addressLocality;
		}
		if (document.getElementById('organizer_region') && organizerjson.address.addressRegion) {
			document.getElementById('organizer_region').innerHTML = organizerjson.address.addressRegion;
		}
		if (document.getElementById('organizer_postcode') && organizerjson.address.postalCode) {
			document.getElementById('organizer_postcode').innerHTML = organizerjson.address.postalCode;
		}
		if (document.getElementById('organizer_country') && organizerjson.address.addressCountry) {
			document.getElementById('organizer_country').innerHTML = COUNTRIES_LIST[organizerjson.address.addressCountry];
		}
	}

	var area = document.getElementById('organizerDiv');
	area.style.display = "block";
}

function drawCriteriaEventOrganizers(id) {

	var criteriaeventorganizers = badgecriteriaeventorganizers[id];
	if (criteriaeventorganizers && criteriaeventorganizers.length > 0) {

		criteriaeventorganizerscollection = {};

		var thediv = document.getElementById('organizerlistview');

		var html = "";
		for (i = 0; i < criteriaeventorganizers.length; i++) {
			criteriaeventorganizerscollection[i] = criteriaeventorganizers[i];

			html += "<tr>";

			html += '<td style="padding: 6px; border: 1px solid grey;background-color:#fff;">';
			html += criteriaeventorganizers[i].name;
			html += '</td>';

			html += '<td style="padding: 6px; border: 1px solid grey;background-color:#fff;">';
			html += criteriaeventorganizers[i].email;
			html += '</td>';

			html += '<td class="eventtablebutton2">';
			html += '<input onclick="loadCriteriaEventOrganizerFromJSON(\''+i+'\')" type="button" value="View Organizer" />';
			html += '</td>';

			html += "</tr>";
		}
		thediv.innerHTML = html;
	}
}

function closeCriteriaEventSponsorFromJSON() {

	if (document.getElementById('sponsorDiv')) {
		var area = document.getElementById('sponsorDiv');
		area.style.display = "none";
	}

	if (document.getElementById('sponsor_name')) {
		document.getElementById('sponsor_name').innerHTML = "";
	}
	if (document.getElementById('sponsor_email')) {
		document.getElementById('sponsor_email').innerHTML = "";
	}
	if (document.getElementById('sponsor_pobox')) {
		document.getElementById('sponsor_pobox').innerHTML = "";
	}
	if (document.getElementById('sponsor_streetaddress')) {
		document.getElementById('sponsor_streetaddress').innerHTML = "";
	}
	if (document.getElementById('sponsor_locality')) {
		document.getElementById('sponsor_locality').innerHTML = "";
	}
	if (document.getElementById('sponsor_region')) {
		document.getElementById('sponsor_region').innerHTML = "";
	}
	if (document.getElementById('sponsor_postcode')) {
		document.getElementById('sponsor_postcode').innerHTML = "";
	}
	if (document.getElementById('sponsor_country')) {
		document.getElementById('sponsor_country').innerHTML = "";
	}
}

function loadCriteriaEventSponsorFromJSON(id) {

	closeCriteriaEventSponsorFromJSON();

	var sponsorjson = criteriaeventsponsorscollection[id];

	if (document.getElementById('sponsor_name') && sponsorjson.name) {
		document.getElementById('sponsor_name').innerHTML = sponsorjson.name;
	}
	if (document.getElementById('sponsor_email') && sponsorjson.email) {
		document.getElementById('sponsor_email').innerHTML = sponsorjson.email;
	}

	if (sponsorjson.address) {
		if (document.getElementById('sponsor_pobox') && sponsorjson.address.postOfficeBoxNumber) {
			document.getElementById('sponsor_pobox').innerHTML = sponsorjson.address.postOfficeBoxNumber;
		}
		if (document.getElementById('sponsor_streetaddress') && sponsorjson.address.streetAddress) {
			document.getElementById('sponsor_streetaddress').innerHTML = sponsorjson.address.streetAddress;
		}
		if (document.getElementById('sponsor_locality') && sponsorjson.address.addressLocality) {
			document.getElementById('sponsor_locality').innerHTML = sponsorjson.address.addressLocality;
		}
		if (document.getElementById('sponsor_region') && sponsorjson.address.addressRegion) {
			document.getElementById('sponsor_region').innerHTML = sponsorjson.address.addressRegion;
		}
		if (document.getElementById('sponsor_postcode') && sponsorjson.address.postalCode) {
			document.getElementById('sponsor_postcode').innerHTML = sponsorjson.address.postalCode;
		}
		if (document.getElementById('sponsor_country') && sponsorjson.address.addressCountry) {
			document.getElementById('sponsor_country').innerHTML = COUNTRIES_LIST[sponsorjson.address.addressCountry];
		}
	}

	var area = document.getElementById('sponsorDiv');
	area.style.display = "block";
}

function drawCriteriaEventSponsors(id) {

	var criteriaeventsponsors = badgecriteriaeventsponsors[id];
	if (criteriaeventsponsors && criteriaeventsponsors.length > 0) {
		criteriaeventsponsorscollection = {};

		var thediv = document.getElementById('sponsorlistview');

		var html = "";
		for (i = 0; i < criteriaeventsponsors.length; i++) {
			criteriaeventsponsorscollection[i] = criteriaeventsponsors[i];

			html += "<tr>";

			html += '<td style="padding: 6px; border: 1px solid grey;background-color:#fff;">';
			html += criteriaeventsponsors[i].name;
			html += '</td>';

			html += '<td style="padding: 6px; border: 1px solid grey;background-color:#fff;">';
			html += criteriaeventsponsors[i].email;
			html += '</td>';

			html += '<td class="eventtablebutton2">';
			html += '<input onclick="loadCriteriaEventSponsorFromJSON(\''+i+'\')" type="button" value="View Sponsor" />';
			html += '</td>';

			html += "</tr>";
		}
		thediv.innerHTML = html;
	}
}

/**
 * Draw badge Criteria data from the passed JSON badge Criteria object expected badge cirteria fields
 */
function loadCriteriaFromJSON(criteriadata) {

	if (document.getElementById("datacriterianarrative")) {
		document.getElementById("datacriterianarrative").innerHTML = "";
	}

	if (criteriadata) {
		if (criteriadata.narrative && document.getElementById("datacriterianarrative")) {
			document.getElementById("datacriterianarrative").innerHTML = nl2br(criteriadata.narrative);
		} else if (criteriadata.id && document.getElementById("datacriterianarrative")) {
			document.getElementById("datacriterianarrative").innerHTML = criteriadata.id;
		}

		if (criteriadata.event) {
			drawCriteriaEvents(criteriadata.event);
		}
	}
}

/**
 * Draw Issuer data from the passed JSON issuer object into expected issuer fields
 */
function loadBadgeTagsFromJSON(badgetags) {

	if (badgetags && document.getElementById("badgetags")) {
		document.getElementById("badgetags").innerHTML = "";
		var count = badgedata.tags.length;
		var list = document.getElementById("badgetags");
		for (var i=0; i<count; i++) {
			var next = document.createElement("li");
			next.innerHTML = badgedata.tags[i];
			list.appendChild(next);
		}
	} else if (document.getElementById("badgetags")) {
		document.getElementById("badgetags").innerHTML = "";
	}
}

/**
 * Draw Issuer data from the passed JSON issuer object into expected issuer fields
 */
function loadIssuerFromJSON(issuerdata) {

	// clear fields if they exist.
	if (document.getElementById("databadgeissuerimage")) {
		document.getElementById("databadgeissuerimage").src = "";
	}
	if (document.getElementById("dataissuername")) {
		document.getElementById("dataissuername").innerHTML = "";
	}
	if (document.getElementById("dataissuerdesc")) {
		document.getElementById("dataissuerdesc").innerHTML = "";
	}
	if (document.getElementById("dataissuerurl")) {
		document.getElementById("dataissuerurl").innerHTML = "";
	}
	if (document.getElementById("dataissuertelephone")) {
		document.getElementById("dataissuertelephone").innerHTML = "";
	}
	if (document.getElementById("dataissueremail")) {
		document.getElementById("dataissueremail").innerHTML = "";
	}

	if (issuerdata) {
		try {
			if (issuerdata.image && document.getElementById("databadgeissuerimage")) {
				document.getElementById("databadgeissuerimage").src = "";
				if (issuerdata.image.id && document.getElementById("databadgeissuerimage")) {
					document.getElementById("databadgeissuerimage").src = issuerdata.image.id;
				} else if (issuerdata.image && document.getElementById("databadgeissuerimage")) {
					document.getElementById("databadgeissuerimage").src = issuerdata.image;
				}
			}

			if (issuerdata.name && document.getElementById("dataissuername")) {
				document.getElementById("dataissuername").innerHTML = issuerdata.name;
			}
			if (issuerdata.description && document.getElementById("dataissuerdesc")) {
				document.getElementById("dataissuerdesc").innerHTML = issuerdata.description;
			}
			if (issuerdata.url && document.getElementById("dataissuerurl")) {
				document.getElementById("dataissuerurl").innerHTML = '<a href="'+issuerdata.url+'">'+issuerdata.url+'</a>';
			}
			if (issuerdata.telephone && document.getElementById("dataissuertelephone")) {
				document.getElementById("dataissuertelephone").innerHTML = issuerdata.telephone;
			}
			if (issuerdata.email && document.getElementById("dataissueremail")) {
				document.getElementById("dataissueremail").innerHTML = issuerdata.email;
			}
		}
		catch(e) {
		   	//alert(e);
		}
	}
}

/**
 * Add alignments from the passed JSON alignment data to the passed table body element
 */
function loadAlignmentsFromJSON(alignmentdata, tablebodyid) {

	if (document.getElementById(tablebodyid)) {
		document.getElementById(tablebodyid).innerHTML = "";
	}

	if (alignmentdata && document.getElementById(tablebodyid)) {
		try {
			var alignments = alignmentdata;
			var count = alignments.length;
			var tableitems = document.getElementById(tablebodyid);

			var html = "";
			for (var i=0; i<count;i++) {

				html += '<tr>';
				var alignment = alignments[i];

				if (alignment.targetName) {
					html += '<td>'+alignment.targetName+'</td>';
				} else {
					html += '<td>&nbsp;</td>';
				}
				if (alignment.targetUrl) {
					html += '<td><a href="'+alignment.targetUrl+'">'+alignment.targetUrl+'</a></td>';
				} else {
					html += '<td>&nbsp;</td>';
				}
				if (alignment.targetDescription) {
					html += '<td>'+alignment.targetDescription+'</td>';
				} else {
					html += '<td>&nbsp;</td>';
				}
				if (alignment.targetFramework) {
					html += '<td>'+alignment.targetFramework+'</td>';
				} else {
					html += '<td>&nbsp;</td>';
				}
				if (alignment.targetCode) {
					html += '<td>'+alignment.targetCode+'</td>';
				} else {
					html += '<td>&nbsp;</td>';
				}

				html += '</tr>';
			}

			tableitems.innerHTML = html;
		}
		catch(e) {
		   document.getElementById(tablebodyid).innerHTML = 'invalid alignment json';
		}
	}
}

/**
 * Add endorsements from the passed JSON endorsement data to the passed table body element
 */
function loadEndorsementsFromJSON(endorsementdata, tablebodyid) {

	if (document.getElementById(tablebodyid)) {
		document.getElementById(tablebodyid).innerHTML = "";
	}

	if (endorsementdata && document.getElementById(tablebodyid)) {
		try {
			var endorsements = endorsementdata;
			var count = endorsements.length;

			var tableitems = document.getElementById(tablebodyid);

			var html = "";
			for (var i=0; i<count;i++) {

				html += '<tr valign="top" style="line-height: 100%;">';
				var endorsement = endorsements[i];

				if (endorsement.claim.endorsementComment) {
					html += '<td>'+endorsement.claim.endorsementComment+'</td>';
				} else {
					html += '<td>&nbsp;</td>';
				}

				/*
				if (endorsement.issuedon) {
					var issuedOn = json.issuedon;
					var issueDate = new Date(issuedOn);
					if (issueDate) {
						html += '<td>'+issueDate.format(DATE_FORMAT_PROJECT)+'</td>';
					} else {
						html += '<td>'+json.issuedon+'</td>';
					}
				} else {
					// due to error in early badges where date was put into id field.
					// Very first issuances of Exeter Summer School 2019 badges affected with this bug
					if (endorsement.id) {
						var issueDate2 = new Date(endorsement.id);
						if (issueDate2) {
							html += '<td>'+issueDate.format(DATE_FORMAT_PROJECT)+'</td>';
						} else {
							html += '<td>&nbsp;</td>';
						}
					} else {
						html += '<td>&nbsp;</td>';
					}
				}
				*/

				if (endorsement.issuer.name) {
					html += '<td>'+endorsement.issuer.name+'</td>';
				} else {
					html += '<td>&nbsp;</td>';
				}

				if (endorsement.issuer.image) {
					if (endorsement.issuer.image.id) {
					  html += '<td><img width="80" src="'+endorsement.issuer.image.id+'" /></td>';
					} else {
						html += '<td>&nbsp;</td>';
					}
				} else {
					html += '<td>&nbsp;</td>';
				}

				if (endorsement.issuer.description) {
					html += '<td>'+endorsement.issuer.description+'</td>';
				} else {
					html += '<td>&nbsp;</td>';
				}
				if (endorsement.issuer.url) {
					html += '<td><a href="'+endorsement.issuer.url+'">'+endorsement.issuer.url+'</a></td>';
				} else {
					html += '<td>&nbsp;</td>';
				}
				if (endorsement.issuer.email) {
					html += '<td>'+endorsement.issuer.email+'</td>';
				} else {
					html += '<td>&nbsp;</td>';
				}
				if (endorsement.issuer.telephone) {
					html += '<td>'+endorsement.issuer.telephone+'</td>';
				} else {
					html += '<td>&nbsp;</td>';
				}

				html += '</tr>';
			}

			tableitems.innerHTML = html;
		}
		catch(e) {
		   document.getElementById(tablebodyid).innerHTML = 'invalid endorsement json';
		}
	}
}

/**
 * Return a json object containing the passed in suration object and the string display version the the duration expressed in that object
 */
function getFormattedDuration(durationobj) {

	var isoduration = "P"
	var durationstr = "";
	if (durationobj.years > 0) {
		isoduration += durationobj.years+"Y";
		if (durationobj.years == 1) {
			durationstr += (durationobj.years+' year ');
		} else {
			durationstr += (durationobj.years+' years ');
		}
	}
	if (durationobj.months > 0) {
		isoduration += durationobj.months+"M";
		if (durationobj.months == 1) {
			durationstr += (durationobj.months+' month ');
		} else {
			durationstr += (durationobj.months+' months ');
		}
	}
	if (durationobj.days > 0) {
		isoduration += durationobj.days+"D";
		if (durationobj.days == 1) {
			durationstr += (durationobj.days+' day ');
		} else {
			durationstr += (durationobj.days+' days ');
		}
	}
	isoduration += "T";
	if (durationobj.hours > 0) {
		isoduration += durationobj.hours+"H";
		if (durationobj.hours == 1) {
			durationstr += (durationobj.hours+' hour ');
		} else {
			durationstr += (durationobj.hours+' hours ');
		}
	}
	isoduration += durationobj.minutes+"M";
	if (durationobj.minutes == 1) {
		durationstr += (durationobj.minutes+' minute ');
	} else {
		durationstr += (durationobj.minutes+' minutes ');
	}

	var returnobj = {}
	returnobj.str = durationstr;
	returnobj.iso = isoduration;

	return returnobj;
}

/**
 * Return a json object detailing the duration between 2 passed Date objects
 */
//https://gist.github.com/spoeken/4705863
function getDuration(start, end) {

		var diff = end - start;
		//Create numbers for dividing to get hour, minute and second diff
		var units = [
		1000 * 60 * 60 *24,
		1000 * 60 * 60,
		1000 * 60,
		1000
		];

		var rv = []; // h, m, s array
		//loop through d, h, m, s. we are not gonna use days, its just there to subtract it from the time
		for (var i = 0; i < units.length; ++i) {
			rv.push(Math.floor(diff / units[i]));
			diff = diff % units[i];
		}

		//Get the year of this year
		var thisFullYear = end.getFullYear();
		//Check how many days there where in last month
		var daysInLastMonth = new Date(thisFullYear, end.getMonth(), 0).getDate();
		//Get this month
		var thisMonth = end.getMonth();
		//Subtract to get differense between years
		thisFullYear = thisFullYear - start.getFullYear();
		//Subtract to get differense between months
		thisMonth = thisMonth - start.getMonth();
		//If month is less than 0 it means that we are some moths before the start date in the year.
		// So we subtract one year, and add the negative number (month) to 12. (12 + -1 = 11)
		subAddDays = daysInLastMonth - start.getDate();
		thisDay = end.getDate();
		thisMonth = thisMonth - 1;
		if(thisMonth < 0){
			thisFullYear = thisFullYear - 1;
			thisMonth = 12 + thisMonth;
			//Get ends day of the month
		}
		//Subtract the start date from the number of days in the last month, add add the result to todays day of the month
		subAddDays = daysInLastMonth - start.getDate();
		subAddDays = thisDay + subAddDays;

		if(subAddDays >= daysInLastMonth){
			subAddDays = subAddDays - daysInLastMonth;
			thisMonth++;
			if (thisMonth > 11){
				thisFullYear++;
				thisMonth = 0;
			}
		}
		return {
			years: thisFullYear,
			months: thisMonth,
			days: subAddDays,
			hours: rv[1],
			minutes: rv[2],
			seconds: rv[3]
		};
}

/**
 * Convert any new lines and carrige returns to html breaks.
 */
function nl2br(dataStr) {
	return dataStr.replace(/(\r\n|\r|\n)/g, "<br />");
}

/**
 * Convert the given UTC timestamp (in seconds) to a local Date object.
 */
function convertUTCTimeToLocalDate(time) {
	if (time == 0) {
		return 0;
	}

	var newDate = new Date();
	newDate.setTime(time*1000);
    return newDate;
}

/**
 * Convert the given local Date object to a UTC timestamp (in seconds).
 */
function convertLocalDateToUTCTime(date) {
	var final = new Date(date.toUTCString());
	var finaltime = final.getTime();
	var utctime = finaltime/1000;
	return utctime;
}

/**
 * http://www.456bereastreet.com/archive/201105/validate_url_syntax_with_javascript/
 * MB: I modified the original as I could not get it to work as it was.
 */
function isValidURI(uri) {
    if (!uri) uri = "";

   	var schemeRE = /^([-a-z0-9]|%[0-9a-f]{2})*$/i;
   	var authorityRE = /^([-a-z0-9.:]|%[0-9a-f]{2})*$/i;
   	var pathRE = /^([-a-z0-9._~:@!$&'()*+,;=\//#]|%[0-9a-f]{2})*$/i;
    var qqRE = /^([-a-z0-9._~:@!$&'\[\]()*+,;=?\/]|%[0-9a-f]{2})*$/i;
    var qfRE = /^([-a-z0-9._~:@!$&#'\[\]()*+,;=?\/]|%[0-9a-f]{2})*$/i;

    var parser = /^(?:([^:\/?]+):)?(?:\/\/([^\/?]*))?([^?]*)(?:\?([^\#]*))?(?:(.*))?/;

    var result = uri.match(parser);

    var scheme    = result[1] || null;
    var authority = result[2] || null;
    var path      = result[3] || null;
    var query     = result[4] || null;
    var fragment  = result[5] || null;

    //console.log("scheme="+scheme);
    //console.log("authority="+authority);
    //console.log("path="+path);
    //console.log("query="+query);
    //console.log("fragment="+fragment);

    if (!scheme || !scheme.match(schemeRE)) {
    	//console.log('scheme failed');
        return false;
    }

    if (!authority || !authority.match(authorityRE)) {
    	//console.log('authority failed');
        return false;
    }
    if (path != null && !path.match(pathRE)) {
    	//console.log('path failed');
        return false;
    }
    if (query && !query.match(qqRE)) {
    	//console.log('query failed');
        return false;
    }
    if (fragment && !fragment.match(qfRE)) {
    	//console.log('fragment failed');
        return false;
    }

    return true;
}

/**
 * Taken From - http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
 */
function isValidEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// must match version in server side untilites for claiming to work
function demicrosoftize(str) {

    str = str.replace("\x82","'");
    str = str.replace("\x83","f");
    str = str.replace("\x84","\"");
    str = str.replace("\x85","...");
    str = str.replace("\x86","+");
    str = str.replace("\x87","#");
    str = str.replace("\x89","^");
    str = str.replace("\x8a","\xa6");
    str = str.replace("\x8b","<");
    str = str.replace("\x8c","\xbc");
    str = str.replace("\x8e","\xb4");
    str = str.replace("\x91","'");
    str = str.replace("\x92","'");
    str = str.replace("\x93","\"");
    str = str.replace("\x94","\"");
    str = str.replace("\x95","*");
    str = str.replace("\x96","-");
    str = str.replace("\x97","--");
    str = str.replace("\x98","~");
    str = str.replace("\x99","(TM)");
    str = str.replace("\x9a","\xa8");
    str = str.replace("\x9b",">");
    str = str.replace("\x9c","\xbd");
    str = str.replace("\x9e","\xb8");
    str = str.replace("\x9f","\xbe");

	str = str.replace(/[\u2018|\u2019|\u201A]/g, "\'");
	str = str.replace(/[\u201C|\u201D|\u201E]/g, "\"");
	str = str.replace(/\u2026/g, "...");
	str = str.replace(/[\u2013|\u2014]/g, "-");
	str = str.replace(/\u02C6/g, "^");
	str = str.replace(/\u2039/g, "");
	//str = str.replace(/\u2039/g, "<");
	str = str.replace(/\u203A/g, "");
	//str = str.replace(/\u203A/g, ">");
	str = str.replace(/[\u02DC|\u00A0]/g, " ");
	str = str.replace(/[\u2022|\u00B7|\u2024|\u2219|\u25D8|\u25E6]/g, "-");

	return str;
}

function showError(response) {

	//console.log(response.error);

	var error = "";
	if (response.error) {
		var count = 0;
		for(var prop in response.error) {
			if (response.error[prop].msg) {
				if(error != "") error += "\n";
				error += response.error[prop].msg;
			} else {
				break;
			}
			count += 1;
		}
		if (count == 0 && error == "") error = response.error;

		if (error != "" && typeof error === 'string') {
			alert(error);
		} else {
			alert("An Unknown Error has occurred.");
		}
	} else {
		alert("An Unknown Error has occurred.");
	}
}

function makeRequest(method, path, properties, handler) {

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {

		console.log("responseText:");
		console.log(this.responseText);

		if (this.readyState == 4 && this.status == 200) {
		   // Action to be performed when the document is read;
		   if (this.readyState == 4) {
				//console.log("RESPONSE from read function = " + this.responseText);
				try {
					var response = JSON.parse(this.responseText);
					handler(response);
				} catch(err) {
					console.log(err);
				}
		   }
		} else if (this.readyState == 4 && this.status != 200) {
			//console.log(this.responseText);
			try {
				//console.log(response)
				var response = JSON.parse(this.responseText);
				handler(response);
			} catch(err) {
				console.log(err);
			}
		}
	};

	xhttp.open(method, path, true);

	if (properties && properties != {}) {
		xhttp.setRequestHeader("Content-type", "application/json");
		xhttp.send(JSON.stringify(properties));
	} else {
		xhttp.send();
	}
}

function makeFileUploadRequest(method, path, formdata, handler) {

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {

		//console.log("responseText:");
		//console.log(this.responseText);

		if (this.readyState == 4 && this.status == 200) {
		   // Action to be performed when the document is read;
		   if (this.readyState == 4) {
				//console.log("RESPONSE from read function = " + this.responseText);
				try {
					var response = JSON.parse(this.responseText);
					handler(response);
				} catch(err) {
					console.log(err);
				}
		   }
		} else if (this.readyState == 4 && this.status != 200) {
			//console.log(this.responseText);
			try {
				var response = JSON.parse(this.responseText);
				handler(response);
			} catch(err) {
				console.log(err);
			}
		}
	};

	xhttp.open(method, path, true);
	xhttp.send(formdata);
}