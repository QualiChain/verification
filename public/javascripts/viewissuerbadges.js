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

var DATE_FORMAT = 'd mmm yyyy';
var TIME_FORMAT = 'd/m/yy - H:MM';
var DATE_FORMAT_PHASE = 'd mmm yyyy H:MM';

var badges = {};
var badgealignments = {}

var protocol = "";
var domain = "";

function initializePage(sprotocol, sdomain) {

	protocol = sprotocol;
	domain = sdomain;

	loadBadgeData();
}

function loadBadgeData(){

	//console.log("IN updateList");

	var handler = function(response) {
		//code to do if successful here
		var thediv =document.getElementById('badgelist');

		if (response.length == 0) {
			thediv.innerHTML = "Currently you have no stored Badge records";
		} else {
			badges = {};
			badgealignments = {};

			var html = "<center><table style='width:100%;line-height:120%;font-size: 14px;'>";
			html += "<tr>";
			//html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>ID</th>";
			html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Image</th>";
			html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Title</th>";
			html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Version</th>";
			html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>View</th>";
			html += "</tr>";
			var temp=0;

			for (i = 0; i < response.badges.length; i++) {

				badges[response.badges[i].id] = response.badges[i];

				html += "<tr>";

				//html += "<td style='padding: 6px; border: 1px solid grey;'>";
				//html += response.badges[i].id;
				//html += "</td>";

				html += '<td style="padding: 6px; border: 1px solid grey;" align="middle">';
				if (response.badges[i].imageurl) {
					html += '<img height="50"; src="'+response.badges[i].imageurl+'"/>';
				} else {
					html += '&nbsp;';
				}
				html += '</td>';

				html += "<td style='padding: 6px; border: 1px solid grey;'>";
				html += response.badges[i].title;
				html += "</td>";

				html += "<td style='padding: 6px; border: 1px solid grey;'>";
				html += response.badges[i].version;
				html += "</td>";

				html += '<td style="padding: 6px; border: 1px solid grey;">';
				html += '<center><button class="sbut" title="View" onclick="viewBadge(\''+response.badges[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" /></button></center>';
				html += '</td>';

				html += "</tr>";
				temp = i;
			}

			html += "</table></center> <br> <br>";
			thediv.innerHTML = html;
		}
	}

	makeRequest("GET", cfg.proxy_path+"/badges/list", {}, handler);
}
function viewBadge(badgeid) {
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

	document.getElementById('viewDiv').style.display = "block";
}

function closeViewForm() {

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

	var send = {};
	send.id = badgeid;

	makeRequest("POST", cfg.proxy_path+"/badges/listalignments/", send, handler);
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

		//html += '<td style="padding: 6px; border: 1px solid grey;">';
		//html += alignments[i].description;
		//html += '</td>';

		//html += '<td style="padding: 6px; border: 1px solid grey;">';
		//html += alignments[i].framework;
		//html += '</td>';

		//html += '<td style="padding: 6px; border: 1px solid grey;">';
		//html += alignments[i].code;
		//html += '</td>';

		html += "</tr>";
	}
	thediv.innerHTML = html;
}