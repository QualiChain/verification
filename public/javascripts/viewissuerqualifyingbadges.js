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
	getBadgeDetails();
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
			updateList();
		}
	}
	//console.log(cfg.proxy_path+"/id/" + badge.id);

	makeRequest("GET", cfg.proxy_path+cfg.badges_path+"/id/" + badge.id, {}, handler);
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
}

function updateList(){

	var handler = function(response) {
		//console.log(response)
		badges = {};
		var data = new Array();
		var count = 0
		if ( response && response.badges) {
			badgesArray = response.badges;
			for (i = 0; i < response.badges.length; i++) {
				badges[response.badges[i].id] = response.badges[i];

				data[count] = {};
				data[count].id = response.badges[i].id;

				data[count].title = response.badges[i].title;
				data[count].issuer = response.badges[i].issuer;

				//console.log(badgesArray[i]);

				data[count].view = '<center><button class="sbut" title="View" onclick="viewBadge(\''+response.badges[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" /></button></center>';

				if (response.badges[i].enabled == 1) {
					data[count].enabled = '<center>Yes</center>';
				} else {
					data[count].enabled = '<center>No</center>';
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
				{ "data": "enabled" , "title": "Enabled", "width": "10%", "orderable": true }
			],
			"order": [[ 0, "desc" ]]
		});
	}

	//console.log(cfg.proxy_path + "/qualifying/listall/" + badge.id);
	makeRequest("GET", cfg.proxy_path + "/qualifying/listall/" + badge.id, {}, handler);
}