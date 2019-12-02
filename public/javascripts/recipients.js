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

var badges = [];

document.addEventListener('DOMContentLoaded', function() {
    getPortfolioList();
});

function getPortfolioList(){
	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			drawPortofilioList(response);
		}
	}
	makeRequest("GET", cfg.proxy_path+"/assertions/portfolio", {}, handler);
}

function drawPortofilioList(response) {

	var thediv = document.getElementById('portfoilioList');
	console.log(response.items.length);
	if (response.items.length == 0) {
		thediv.innerHTML = "Currently you have no stored Badge records";
	} else {

		badges = response.items;

		var html = '<center><table style="width:100%;line-height:120%;font-size: 14px; border: 1px solid grey; padding: 6px;color:black;">';
		html += '<tr>';
		html += '<th style="background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;">Image</th>';
		html += '<th style="background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;">Issuer</th>';
		html += '<th style="background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;">Issued On</th>';
		html += '<th style="background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;">Title</th>';
		//html += '<th style="background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;">Description</th>';
		html += '<th style="background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;">View</th>';
		html += '<th style="background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;">Download</th>';
		html += '</tr>';
		var temp=0;

		for (i = 0; i < badges.length; i++) {

			var next  = badges[i];

			html += '<tr>';

			html += '<td style="padding: 6px; border: 1px solid grey;">';
			html += '<img src="'+next.imageurl+'" height="50" />';
			html += '</td>';

			html += '<td style="padding: 6px; border: 1px solid grey;">';
			html += next.issuer;
			html += '</td>';

			html += '<td style="padding: 6px; border: 1px solid grey;">';

			var cDate = new Date(next.issuedon*1000);
			var nicedate = cDate.format(DATE_FORMAT);

			html += nicedate;
			html += '</td>';

			html += '<td style="padding: 6px; border: 1px solid grey;">';
			html += next.title;
			html += '</td>';

			//html += '<td style="padding: 6px; border: 1px solid grey;">';
			//html += next.description;
			//html += '</td>';

			html += '<td style="padding: 6px; border: 1px solid grey;align:center">';
			html += '<button style="min-height:30px;" onclick="viewFile('+next.id+');">View</button>'
			html += '</td>';

			html += '<td style="padding: 6px; border: 1px solid grey;align:center">';
			html += '<button style="min-height:30px;" onclick="downloadFile('+next.id+');">Download</button>'
			html += '</td>';


			html += "</tr>";
			temp = i;
		}

		html += "</table></center> <br> <br>";
		thediv.innerHTML = html;
	}
}


function viewFile(id) {
	window.open( cfg.proxy_path+"/assertions/view/"+id, "View Badge");
}

function downloadFile(id) {

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			//console.log(response);
		}
	}

	//var properties = {};
	//properties.id = id;
	makeRequestDownload("GET", cfg.proxy_path+"/assertions/download/"+id, {}, handler);
}

function makeRequestDownload(method, path, properties, handler) {

	var xhttp = new XMLHttpRequest();
	xhttp.responseType = 'blob';

	xhttp.onreadystatechange = function() {

		//console.log(this.response);
		if (this.readyState == 4 && this.status == 200) {
		   // Action to be performed when the document is read;
		   if (this.readyState == 4) {
				try {
					//From: https://gist.github.com/zynick/12bae6dbc76f6aacedf0

					var filename = "";
					var disposition = xhttp.getResponseHeader('Content-Disposition');
					if (disposition && disposition.indexOf('attachment') !== -1) {
						var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
						var matches = filenameRegex.exec(disposition);
						if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
					}

					filename = filename.split(" ").join("_");
					//console.log(filename);

					var type = xhttp.getResponseHeader('Content-Type');

					var blob = new Blob([this.response], { type: type });
					if (typeof window.navigator.msSaveBlob !== 'undefined') {
						// IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
						window.navigator.msSaveBlob(blob, filename);
					} else {
						var URL = window.URL || window.webkitURL;
						var downloadUrl = URL.createObjectURL(blob);

						if (filename) {
							// use HTML5 a[download] attribute to specify filename
							var a = document.createElement("a");
							// safari doesn't support this yet
							if (typeof a.download === 'undefined') {
								window.location = downloadUrl;
							} else {
								a.href = downloadUrl;
								a.download = filename;
								document.body.appendChild(a);
								a.click();
							}
						} else {
							window.location = downloadUrl;
						}

						setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
					}
				} catch(err) {
					console.log(err);
				}
		   }
		} else if (this.readyState == 4 && this.status != 200) {
			var response = JSON.parse(this.responseText);
			handler(response);
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