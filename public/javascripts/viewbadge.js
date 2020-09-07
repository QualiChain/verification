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


function clearViewBadgeDetails() {

	document.getElementById("bakedbadgeinfo").innerHTML = "";
	document.getElementById("issuedon").innerHTML = "";

	document.getElementById("evidenceitems").innerHTML = "";
	document.getElementById("alignmentitems").innerHTML = "";

	document.getElementById("recipient").innerHTML = "";
	document.getElementById("recipienttype").innerHTML = "";
	document.getElementById("recipienthashed").innerHTML = "";
	document.getElementById("recipientsalt").innerHTML = "";

	document.getElementById("databadgename").innerHTML = "";
	document.getElementById("databadgedescription").innerHTML = "";
	document.getElementById("databadgeimage").src = "";

	document.getElementById("databadgename").innerHTML = "";
	document.getElementById("databadgedescription").innerHTML = "";
	document.getElementById("databadgeimage").src = "";

	if (document.getElementById("verifytype")) {
	  	document.getElementById("verifytype").innerHTML = "";
	}

	// from Utilities
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

	if (document.getElementById("badgetags")) {
		document.getElementById("badgetags").innerHTML = "";
	}

	if (document.getElementById("datacriterianarrative")) {
		document.getElementById("datacriterianarrative").innerHTML = "";
	}

	if (document.getElementById("endorsementitems")) {
		document.getElementById("endorsementitems").innerHTML = "";
	}
	if (document.getElementById("alignmentitems")) {
		document.getElementById("alignmentitems").innerHTML = "";
	}

	document.getElementById("endorsementsection").style.display = "none";
	document.getElementById("alignmentsection").style.display = "none";
	document.getElementById("evidencearea").style.display = "none";

	document.getElementById('criteriaeventlistview').innerHTML = "";

	// may not be neded as done by closeCriteriaEventFromJSON
	document.getElementById('sponsorlistview').innerHTML = "";
	document.getElementById('organizerlistview').innerHTML = "";

	closeCriteriaEventFromJSON();
}

function processExtractedJSON(json) {

	//console.log(json);
	try {
		var jsonstr = JSON.stringify(json, null, 2);
		jsonstr = jsonstr.replace(/(?:\r\n|\r|\n)/g, '<br>');
		jsonstr = jsonstr.replace(/(  )/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
		document.getElementById("bakedbadgeinfo").innerHTML = jsonstr;
	}
	catch(e) {
	   	document.getElementById("bakedbadgeinfo").innerHTML = 'invalid json';
	}

	if (json.issuedon) {
		var issuedOn = json.issuedon;
		var issueDate = new Date(issuedOn);
		if (issueDate) {
			document.getElementById("issuedon").innerHTML = issueDate.format(DATE_FORMAT_PROJECT);
		} else {
			document.getElementById("issuedon").innerHTML = issuedOn;
		}
	} else if (json.issuedOn) {
		var issuedOn = json.issuedOn;
		var issueDate = new Date(issuedOn);
		if (issueDate) {
			document.getElementById("issuedon").innerHTML = issueDate.format(DATE_FORMAT_PROJECT);
		} else {
			document.getElementById("issuedon").innerHTML = issuedOn;
		}
	}

	if (json.evidence) {
		document.getElementById("evidencearea").style.display = "block";

		try {
			let evidence = [];
			if (typeof json.evidence === "string") { // just a url therefore
				evidence.push(json.evidence);
			} else {
				evidence = json.evidence;
			}

			var count = evidence.length;

			var evidencelist = document.getElementById("evidenceitems");

			var html = "";
			for (var i=0; i<count;i++) {

				html += '<tr>';
				let evidenceitem = evidence[i];

				// if the item is just a string add it to the url and make all the rest blank
				if (typeof evidenceitem === "string") {
						html += '<td>'+evidenceitem+'</td>';
						html += '<td>&nbsp;</td>';
						html += '<td>&nbsp;</td>';
						html += '<td>&nbsp;</td>';
						html += '<td>&nbsp;</td>';
						html += '<td>&nbsp;</td>';
				} else if (typeof evidenceitem === "object") {
					if (evidenceitem.id) {
						html += '<td><a href="'+evidenceitem.id+'">'+evidenceitem.id+'</a></td>';
					} else {
						html += '<td>&nbsp;</td>';
					}
					if (evidenceitem.name) {
						html += '<td>'+evidenceitem.name+'</td>';
					} else {
						html += '<td>&nbsp;</td>';
					}
					if (evidenceitem.description) {
						html += '<td>'+evidenceitem.description+'</td>';
					} else {
						html += '<td>&nbsp;</td>';
					}
					if (evidenceitem.narrative) {
						html += '<td>'+evidenceitem.narrative+'</td>';
					} else {
						html += '<td>&nbsp;</td>';
					}
					if (evidenceitem.genre) {
						html += '<td>'+evidenceitem.genre+'</td>';
					} else {
						html += '<td>&nbsp;</td>';
					}
					if (evidenceitem.audience) {
						html += '<td>'+evidenceitem.audience+'</td>';
					} else {
						html += '<td>&nbsp;</td>';
					}
				}
				html += '</tr>';
			}

			evidencelist.innerHTML = html;
		}
		catch(e) {
		   document.getElementById("evidenceitems").innerHTML = 'invalid evidence json';
		}

	}

	if (json.recipient) {
		var recipient = json.recipient;
		if (recipient.identity) {
			document.getElementById("recipient").innerHTML = recipient.identity;
		}
		if (recipient.type) {
			document.getElementById("recipienttype").innerHTML = recipient.type;
		}
		if (recipient.hashed) {
			document.getElementById("recipienthashed").innerHTML = recipient.hashed;
		}
	   if (recipient.salt) {
			document.getElementById("recipientsalt").innerHTML = recipient.salt;
	   }
   }

   if (json.badge) {
		try {
			//document.getElementById("badgedata").innerHTML = JSON.stringify(json.badge);
			if (json.badge.name) {
			   document.getElementById("databadgename").innerHTML = json.badge.name;
			}
			if (json.badge.description) {
			   document.getElementById("databadgedescription").innerHTML = nl2br(json.badge.description);
			}
			if (json.badge.image) {
			   document.getElementById("databadgeimage").src = json.badge.image;
			}

			if (json.badge.criteria) {
				loadCriteriaFromJSON(json.badge.criteria);  // in utilities.js
			}

			if (json.badge.tags)  {
				loadBadgeTagsFromJSON(json.badge.tags);  // in utilities.js
			}

			if (json.badge.issuer) {
				loadIssuerFromJSON(json.badge.issuer);  // in utilities.js
			}

			// add alignments
			if (json.badge.alignment) {
				document.getElementById("alignmentsection").style.display = "block";
				loadAlignmentsFromJSON(json.badge.alignment, "alignmentitems");  // in utilities.js
			}

			// add endorsements
			if (json.badge.endorsement) {
				// if single element add to an array for utility function to use in table creation.
				let endorsement = [];
				if (Array.isArray(json.badge.endorsement)) {
					endorsement = json.badge.endorsement;
				} else {
					endorsement.push(json.badge.endorsement);
				}

				document.getElementById("endorsementsection").style.display = "block";
				loadEndorsementsFromJSON(endorsement, "endorsementitems");  // in utilities.js
			}
		}
		catch(e) {
			if (document.getElementById("badgedata")) {
		   		document.getElementById("badgedata").innerHTML = 'invalid badge json';
			}
		}
   }
   if (json.verify) {
	   var verify = json.verify;
	   if (verify.type && document.getElementById("verifytype")) {
		   document.getElementById("verifytype").innerHTML = verify.type;
	   }
	   if (verify.url && document.getElementById("verifyurl")) {
		   document.getElementById("verifyurl").innerHTML = verify.url;
	   }
   }
   //if (json.evidence) {
	//	document.getElementById("evidence").innerHTML = json.evidence;
   //}
}

