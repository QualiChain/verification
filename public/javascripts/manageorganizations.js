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

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {

	// setup country lists
	var form = document.getElementById('formRec');
	var create_country = form.country;

	var editform = document.getElementById('formRecEdit');
	var edit_country = editform.country;

	var viewform = document.getElementById('formRecView');
	var view_country = viewform.country;

	for (var prop in COUNTRIES_LIST) {
		if (Object.prototype.hasOwnProperty.call(COUNTRIES_LIST, prop)) {

			// CREATE
			var option = document.createElement("option");
			option.value = prop;
			option.text = COUNTRIES_LIST[prop];
    		create_country.appendChild(option);

			// EDIT
			var option = document.createElement("option");
			option.value = prop;
			option.text = COUNTRIES_LIST[prop];
    		edit_country.appendChild(option);

			// VIEW
			var option = document.createElement("option");
			option.value = prop;
			option.text = COUNTRIES_LIST[prop];
    		view_country.appendChild(option);
		}
	}

	create_country.value = cfg.default_country;

	updateList();
}

function createOrganization() {
	var form = document.getElementById('formRec');

	var send = {};

	send.name = demicrosoftize(form.name.value);
	send.email = demicrosoftize(form.email.value);
	send.pobox = demicrosoftize(form.pobox.value);
	send.streetaddress = demicrosoftize(form.streetaddress.value);
	send.locality = demicrosoftize(form.locality.value);
	send.region = demicrosoftize(form.region.value);
	send.postcode = demicrosoftize(form.postcode.value);
	send.country = form.country.options[form.country.selectedIndex].value

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			clearCreateForm();
			updateList();
		}
	}

	makeRequest("POST", cfg.proxy_path+"/organizations/create", send, handler);
}

function clearCreateForm() {
	var form = document.getElementById('formRec');

	form.name.value = "";
	form.email.value = "";
	form.pobox.value = "";
	form.streetaddress.value = "";
	form.locality.value = "";
	form.region.value = "";
	form.postcode.value = "";
	form.country.value = cfg.default_country;
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

function editOrganization(organizationid) {
	var organization = organizations[organizationid];

	var form = document.getElementById('formRecEdit');

	form.organizationid.value = organizationid;

	form.name.value = organization.name;
	form.email.value = organization.email;

	form.pobox.value = organization.pobox;
	form.streetaddress.value = organization.streetaddress;
	form.locality.value = organization.locality;
	form.region.value = organization.region;
	form.postcode.value = organization.postcode;
	form.country.value = organization.country;

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "block";
	document.getElementById('createFormShowButton').style.display = "none";
}

function updateOrganization() {
	var form = document.getElementById('formRecEdit');

	var send = {};
	send.id = form.organizationid.value;

	send.name = demicrosoftize(form.name.value);
	send.email = demicrosoftize(form.email.value);
	send.pobox = demicrosoftize(form.pobox.value);
	send.streetaddress = demicrosoftize(form.streetaddress.value);
	send.locality = demicrosoftize(form.locality.value);
	send.region = demicrosoftize(form.region.value);
	send.postcode = demicrosoftize(form.postcode.value);
	send.country = form.country.options[form.country.selectedIndex].value

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			cancelEditForm();
			updateList();
		}
	}

	makeRequest("POST", cfg.proxy_path+"/organizations/update", send, handler);
}

function cancelEditForm() {
	var form = document.getElementById('formRecEdit');

	form.name.value = "";
	form.email.value = "";
	form.pobox.value = "";
	form.streetaddress.value = "";
	form.locality.value = "";
	form.region.value = "";
	form.postcode.value = "";
	form.country.value = "";

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function viewOrganization(organizationid) {
	var organization = organizations[organizationid];
	console.log(organization);

	if (organization) {
		var form = document.getElementById('formRecView');

		form.name.value = organization.name;
		form.email.value = organization.email;
		form.pobox.value = organization.pobox;
		form.streetaddress.value = organization.streetaddress;
		form.locality.value = organization.locality;
		form.region.value = organization.region;
		form.postcode.value = organization.postcode;
		form.country.value = organization.country;

		document.getElementById('createDiv').style.display = "none";
		document.getElementById('editDiv').style.display = "none";
		document.getElementById('viewDiv').style.display = "block";
		document.getElementById('createFormShowButton').style.display = "none";
	}
}

function closeViewForm() {
	var form = document.getElementById('formRecView');

	form.name.value = "";
	form.email.value = "";
	form.pobox.value = "";
	form.streetaddress.value = "";
	form.locality.value = "";
	form.region.value = "";
	form.postcode.value = "";
	form.country.value = "";

	document.getElementById('viewDiv').style.display = "none";
	document.getElementById('editDiv').style.display = "none";
	document.getElementById('createDiv').style.display = "none";
	document.getElementById('createFormShowButton').style.display = "block";
}

function deleteOrganization(organizationid) {
	var organization = organizations[organizationid];

	var message = "Are you sure you want to delete the organization entry for:\n\n "+organization.name+"\n";
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
		send.id = organizationid;
		makeRequest("POST", cfg.proxy_path+"/organizations/delete", send, handler);
	} else {
	  // do nothing
	}
}

function updateList(){

	var handler = function(response) {

		organizations = {}
		var data = new Array();

		if ( response && response.organizations && response.organizations.length > 0 ) {

			for (i = 0; i < response.organizations.length; i++) {

				// store to global list by id
				organizations[response.organizations[i].id] = response.organizations[i]

				data[i] = {};

				data[i].id = response.organizations[i].id;
				data[i].name = response.organizations[i].name;

				data[i].view = '<center><button class="sbut" title="View" onclick="viewOrganization(\''+response.organizations[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/view.png" /></button></center>';

				if (response.organizations[i].usedInIssuance === false) {
					data[i].edit = '<center><button class="sbut" title="Edit" onclick="editOrganization(\''+response.organizations[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/edit.png" /></button></center>';
				} else {
					data[i].edit = '<center>Used</center>';
				}

				if (response.organizations[i].usedInIssuance === false) {
					data[i].delete = '<center><button class="sbut" title="Delete" onclick="deleteOrganization(\''+response.organizations[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/delete.png" /></button></center>';
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

	makeRequest("GET", cfg.proxy_path+"/organizations/list", {}, handler);
}