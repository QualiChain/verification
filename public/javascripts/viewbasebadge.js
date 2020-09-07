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

var DATE_FORMAT_PROJECT = 'd mmm yyyy';
var EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

function viewbadgeinfo(badgeId) {
	var url = cfg.proxy_path+cfg.badges_path+"/"+badgeId;

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
		   if (xmlhttp.status == 200) {
				var i = void 0;
				try {
					i = JSON.parse(xmlhttp.responseText);
				} catch (t) {
					i = xmlhttp.responseText;
				}
			   loadBadge(i);
		   }
		   else if (xmlhttp.status == 400) {
			  alert('There was an error 400');
		   }
		   else {
			   //alert('something else other than 200 was returned:'+xmlhttp.status);
				var t = void 0;
				try {
					t = JSON.parse(xmlhttp.responseText);
				} catch (n) {
					t = xmlhttp.responseText;
				}
				//alert(t);
		   }
		}
	};

	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

function loadBadge(badgedata) {

	document.getElementById("databadgename").innerHTML = "";
	document.getElementById("databadgedescription").innerHTML = "";
	document.getElementById("databadgeimage").src = "";

	if (badgedata) {
		if (badgedata.name) {
			document.getElementById("databadgename").innerHTML = badgedata.name;
		}
		if (badgedata.description) {
			document.getElementById("databadgedescription").innerHTML = nl2br(badgedata.description);
		}
		if (badgedata.image) {
			document.getElementById("databadgeimage").src = badgedata.image;
		}

		if (badgedata.tags)  {
			loadBadgeTagsFromJSON(badgedata.tags);  // in utilities.js
		}

		if (badgedata.issuer) {
			loadIssuerFromJSON(badgedata.issuer);  // in utilities.js
		}

		if (badgedata.criteria) {
			loadCriteriaFromJSON(badgedata.criteria);  // in utilities.js
		}

		if (badgedata.alignment) {
			document.getElementById("alignmentsection").style.display = "block";
			loadAlignmentsFromJSON(badgedata.alignment, "alignmentitems");  // in utilities.js
		} else {
			document.getElementById("alignmentsection").style.display = "none";
		}

		if (badgedata.endorsement) {
			document.getElementById("endorsementsection").style.display = "block";
			loadEndorsementsFromJSON(badgedata.endorsement, "endorsementitems");  // in utilities.js
		} else {
			document.getElementById("endorsementsection").style.display = "none";
		}
	}
}