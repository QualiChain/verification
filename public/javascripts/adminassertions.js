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

var assertions = {};
var table = null;

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
	updateList();
}

function deleteAssertion(assertionid) {
	var assertion = assertions[assertionid];

	var message = "Are you sure you want to delete the assertion entry: "+assertionid+" for\n\nIssuer: "+assertion.issuername+"\n\nissuing badge: "+assertion.badgetitle+"\n\nto recipient: "+assertion.recipientname+"?\n";
	var reply = confirm(message);
	if (reply == true) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				updateList();
			}
		}

		var send = {};
		send.id = assertionid;
		makeRequest("POST", cfg.proxy_path+"/assertions/admin/delete", send, handler);
	} else {
	  // do nothing
	}
}

function updateList(){

	var handler = function(response) {

		assertions = {}
		var data = new Array();

		if ( response && response.items && response.items.length > 0 ) {

			for (i = 0; i < response.items.length; i++) {

				let item = response.items[i];

				assertions[item.id] = response.items[i];

				data[i] = {};
				data[i].id = item.id;

				data[i].issuername = item.issuername;
				data[i].recipientname = item.recipientname;
				data[i].badgetitle = item.badgetitle;
				data[i].version = item.version;
				data[i].status = item.status;

				if (item.status !== 'pending') {
					var cDate = new Date(item.issuedon*1000);
					var nicedate = cDate.format(TIME_FORMAT);
					data[i].issuedon = nicedate;
				} else {
					data[i].issuedon = "";
				}
				data[i].delete = '<center><button class="sbut" title="Delete Issued Badge" onclick="deleteAssertion(\''+item.id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/delete.png" /></button></center>';
			}
		}

		if (table != null) table.destroy();

		table = $('#storedList').DataTable({
			"data": data,
			"stateSave": true,
			"columns": [
				{ "data": "id", "title": "ID", "width": "5%" },
				{ "data": "issuername", "title": "Issuer Name", "width": "20%" },
				{ "data": "issuedon", "title": "Issued On", "width": "10%" },
				{ "data": "badgetitle", "title": "Badge Name", "width": "25%" },
				{ "data": "version", "title": "Version", "width": "10%" },
				{ "data": "recipientname", "title": "Recipient Name", "width": "20%" },
				{ "data": "status", "title": "Status", "width": "20%" },
				{ "data": "delete" , "title": "Delete", "width": "10%", "orderable": false }
			],
			"order": [[ 0, "desc" ]]
		});
	}

	makeRequest("GET", cfg.proxy_path+"/assertions/listall", {}, handler);
}