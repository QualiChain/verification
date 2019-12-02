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
var recipients = {};
var assertions = {};
var protocol = "";
var domain = "";

function initializePage(sprotocol, sdomain) {

	protocol = sprotocol;
	domain = sdomain;

	loadBadgeData();
}

function resetCreateForm() {
	var form = document.getElementById('formRec');

	var recipientidobj = document.getElementById("recipientid");
	var badgerecobj = document.getElementById("badgerec");

	recipientidobj.value = "";
	badgerecobj.value = "";

	hideAllForms();
	document.getElementById('createDiv').style.display = "block";
}

function cancelEditForm() {
	var form = document.getElementById('formRecEdit');
	form.assertionid.value = "";

	var recipientidobj = document.getElementById("recipientidedit");
	var badgerecobj = document.getElementById("badgerecedit");

	recipientidobj.value = "";
	badgerecobj.value = "";

	hideAllForms();
	document.getElementById('createDiv').style.display = "block";
}

function editAssertion(assertionid) {
	var assertion = assertions[assertionid];

	var form = document.getElementById('formRecEdit');
	form.assertionid.value = assertionid;

	var recipientidobj = document.getElementById("recipientidedit");
	var badgerecobj = document.getElementById("badgerecedit");

	recipientidobj.value = assertion.recipientid;
	badgerecobj.value = assertion.badgeid;

	hideAllForms();
	document.getElementById('editDiv').style.display = "block";
}

function createAssertion() {
	var form = document.getElementById('formRec');

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			//code to do if successful here
			document.getElementById('createDiv').style.display = "block";
			document.getElementById('editDiv').style.display = "none";
			resetCreateForm();
			updateList();
		}
	}

	var send = {};

	var recipientidobj = document.getElementById("recipientid");
	var badgerecobj = document.getElementById("badgerec");

	var recipientid = recipientidobj.options[recipientidobj.selectedIndex].value;
	var badgeid = badgerecobj.options[badgerecobj.selectedIndex].value;

	var send = {};
	send.recipientid = recipientid;
	send.badgeid = badgeid;

	makeRequest("POST", cfg.proxy_path+"/assertions/create", send, handler);
}

function manageEvidence(id) {
	var evidencepageurl=protocol+"://"+domain+cfg.proxy_path+"/badges/evidence/?badgeissuedid="+id;
	location.href = evidencepageurl;
}

function viewFile(id) {
	window.open( cfg.proxy_path+"/assertions/view/"+id, "View Badge");
}

function updateAssertion() {
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
	var badgerecobj = document.getElementById("badgerecedit");

	var recipientid = recipientidobj.options[recipientidobj.selectedIndex].value;
	var badgeid = badgerecobj.options[badgerecobj.selectedIndex].value;

	var send = {};
	send.id = form.assertionid.value;
	send.recipientid = recipientid;
	send.badgeid = badgeid;

	makeRequest("POST", cfg.proxy_path+"/assertions/update", send, handler);
}

function issueAssertion(assertionid) {
	var assertion = assertions[assertionid];

	var message = "Are you sure you want to issue the badge : "+badges[assertion.badgeid].title+" to: "+recipients[assertion.recipientid].name;
	var reply = confirm(message);
	if (reply == true) {
		document.body.style.cursor = 'wait';
		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				document.body.style.cursor = 'default';
				updateList();
			}
		}

		var send = {};
		send.id = assertionid;

		makeRequest("POST", cfg.proxy_path+"/assertions/issue", send, handler);
	} else {
	  // do nothing
	}
}

function deleteAssertion(assertionid) {
	var assertion = assertions[assertionid];

	var message = "Are you sure you want to delete the pending badge issuance entry for: "+badges[assertion.badgeid].title+" to: "+recipients[assertion.recipientid].name;
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
		send.id = assertionid;
		makeRequest("POST", cfg.proxy_path+"/assertions/delete", send, handler);
	} else {
	  // do nothing
	}
}

function loadBadgeData(){

	//console.log("IN loadBadgeData");

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			badges = {};

			var thediv =document.getElementById('badgelist');
			var theeditdiv =document.getElementById('badgelistedit');

			//console.log(response.badges.length);

			if (response.length == 0) {
				thediv.innerHTML = "Currently you are the issuer on no badge records";
				theeditdiv.innerHTML = "Currently you are the issuer on no badge records";
			} else {
				// create list
				var html = '<select name="badgerec" id="badgerec">';
				html += '<option value="" disabled selected>Select a Badge</option>'

				var html2 = '<select name="badgerecedit" id="badgerecedit">';
				html2 += '<option value="" disabled selected>Select a Badge</option>'

				for (i = 0; i < response.badges.length; i++) {
					badges[response.badges[i].id] = response.badges[i];
					html += '<option value="'+ response.badges[i].id +'">'+ response.badges[i].title + '</option>';
					html2 += '<option value="'+ response.badges[i].id +'">'+ response.badges[i].title + '</option>';
				}

				html += "</select>";
				thediv.innerHTML = html;

				html2 += "</select>";
				theeditdiv.innerHTML = html2;

				loadRecipientData();
			}
		}
	}

	makeRequest("GET", cfg.proxy_path+"/badges/list", {}, handler);
}

function loadRecipientData(){

	//console.log("IN loadRecipientData");

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
			} else {

				var html = '<select name="recipientid" id="recipientid">';
				html += '<option value="" disabled selected>Select a Recipient</option>'

				var html2 = '<select name="recipientidedit" id="recipientidedit">';
				html2 += '<option value="" disabled selected>Select a Recipient</option>'

				for (i = 0; i < response.recipients.length; i++) {

					if (response.recipients[i].status == 1) {
						recipients[response.recipients[i].id] = response.recipients[i];

						html += '<option value="'+ response.recipients[i].id +'">'+ response.recipients[i].name + '</option>';
						html2 += '<option value="'+ response.recipients[i].id +'">'+ response.recipients[i].name + '</option>';
					}
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

		//code to do if successful here
		var thediv =document.getElementById('storedList');
		var thediv2 =document.getElementById('storedList2');
		//var thediv3 = document.getElementById('storedList3');

		thediv.innerHTML = "";
		thediv2.innerHTML = "";
		//thediv3.innerHTML = "";

		assertions = {};

		//console.log(response.items);
		//console.log(response.items.length);

		if ( !response || !response.items || (response.items && response.items.length == 0) ) {
			thediv.innerHTML = "Currently you have no pending Badge Issuance records";
			thediv2.innerHTML = "Currently you have no issued Badge Issuance records";
			//thediv3.innerHTML = "Currently you have no revoked Badge Issuance records";
		} else {

			var html = "<center><table style='background-color:#efefef; width:100%;line-height:120%;font-size: 14px;'>";
			html += "<tr>";
			html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Recipient Name</th>";
			html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Badge Name</th>";

			html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Edit</th>";

			//html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Add Evidence</th>";
			html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Manage Evidence</th>";

			html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Issue</th>";

			html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Delete</th>";

			html += "</tr>";

			var html2 = "<center><table style='width:100%;line-height:120%;font-size: 14px;'>";
			html2 += "<tr>";
			html2 += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Recipient Name</th>";
			html2 += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Badge Name</th>";
			html2 += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Issued on</th>";
			html2 += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>View Issued Badge</th>";
			html2 += "</tr>";

			for (i = 0; i < response.items.length; i++) {

				var item = response.items[i];

				assertions[item.id] = item;

				if (item.status=="pending") {
					html += "<tr style='background-color:#fff;'>";
					html += "<td style='padding: 6px; border: 1px solid grey;'>";
					html += recipients[item.recipientid].name;
					html += "</td>";

					html += "<td style='padding: 6px; border: 1px solid grey;'>";
					html += badges[item.badgeid].title;
					html += "</td>";

					html += '<td style="padding: 6px; border: 1px solid grey;">';
					html += '<center><button class="sbut" title="Edit" onclick="editAssertion(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/edit.png" /></button></center>';
					html += '</td>';

					html += '<td style="padding: 6px; border: 1px solid grey;">';
					html += '<center><button class="sbut" title="Manage Evidence" onclick="manageEvidence(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/evidence.png" /></button></center>';
					html += '</td>';

					html += '<td style="padding: 6px; border: 1px solid grey;">';
					html += '<center><button class="sbut" title="Issue" onclick="issueAssertion(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/issue.png" /></button></center>';
					html += '</td>';

					html += '<td style="padding: 6px; border: 1px solid grey;">';
					html += '<center><button class="sbut" title="Delete" onclick="deleteAssertion(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/delete.png" /></button></center>';
					html += '</td>';

					html += "</tr>";

					html += "<tr>";
					html += '<td colspan="7" id="evidencerow'+item.id+'" style="display:none; padding: 6px; border: 1px solid grey; background-color: #fafafa">';
					html += '<div id="evidenceList'+ item.id + '"';
					html += 'style="margin-left:auto;margin-right:auto;width:100%;"></div>';
					html += '</td>';
					html += "</tr>";

				} else if (item.status=="issued") {
					html2 += "<tr>";

					html2 += "<td style='padding: 6px; border: 1px solid grey;'>";
					html2 += recipients[item.recipientid].name;
					html2 += "</td>";

					html2 += "<td style='padding: 6px; border: 1px solid grey;'>";
					html2 += badges[item.badgeid].title;
					html2 += "</td>";

					html2 += "<td style='padding: 6px; border: 1px solid grey;'>";

					var cDate = new Date(item.issuedon*1000);
					var nicedate = cDate.format(DATE_FORMAT);

					html2 += nicedate;
					html2 += "</td>";

					html2 += "<td style='padding: 6px; border: 1px solid grey;'>";
					html2 += '<center><button class="sbut" title="View Issued Badge" onclick="viewFile(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/badges/images/issuing_buttons/view.png" /></button></center>';
					html2 += "</td>";

					html2 += "</tr>";
				}
			}
			html += "</table><center><br> <br>";
			thediv.innerHTML = html;

			html2 += "</table><center><br> <br>";
			thediv2.innerHTML = html2;
		}
	}

	makeRequest("GET", cfg.proxy_path+"/assertions/list", {}, handler);
}

function hideAllForms() {
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
}