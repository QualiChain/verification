/*********************************************************************************
* The MIT License (MIT)                                                          *
*                                                                                *
* Copyright (c) 2016 KMi, The Open University UK                                 *
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
	var url = cfg.proxy_path+"/badges/"+badgeId;

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

function clearbadgeinfo() {

	// BADGE
	document.getElementById("badgecontext").innerHTML = "";
	document.getElementById("badgetype").innerHTML = "";
	document.getElementById("badgeid").innerHTML = "";
	document.getElementById("badgename").innerHTML = "";
	document.getElementById("badgedescription").innerHTML = "";
	document.getElementById("badgeimage").src = "";
	document.getElementById("badgetags").innerHTML = "";

	// ISSUER
	document.getElementById("issuertype").innerHTML = "";
	document.getElementById("issuerid").innerHTML = "";
	document.getElementById("issuername").innerHTML = "";
	document.getElementById("issuerdescription").innerHTML = "";
	document.getElementById("issuerimage").src = "";
	document.getElementById("issuerimagecaption").innerHTML = "";
	document.getElementById("issuerimageauthor").innerHTML = "";
	document.getElementById("issuerurl").innerHTML = "";
	document.getElementById("issuertel").innerHTML = "";
	document.getElementById("issueremail").innerHTML = "";

	// CRITERIA
	document.getElementById("criteriatype").innerHTML = "";
	document.getElementById("criteriaid").innerHTML = "";
	document.getElementById("criterianarrative").innerHTML = "";

	// ALIGNMENT
	document.getElementById("alignmentitems").innerHTML = "";
}

function loadBadge(badgedata) {

	if (badgedata) {
		if (badgedata.name) {
			document.getElementById("badgename").innerHTML = badgedata.name;
		}
		if (badgedata.description) {
			document.getElementById("badgedescription").innerHTML = badgedata.description;
		}
		if (badgedata.image) {
			document.getElementById("badgeimage").src = badgedata.image;
		}

		document.getElementById("badgetags").innerHTML = "";

		if (badgedata.tags)  {
			var count = badgedata.tags.length;
			var list = document.getElementById("badgetags");
			for (var i=0; i<count; i++) {
				var next = document.createElement("li");
				next.innerHTML = badgedata.tags[i];
				list.appendChild(next);
			}
		}

		if (badgedata.issuer) {
			loadIssuer(badgedata.issuer);
		}

		if (badgedata.criteria) {
			loadCriteria(badgedata.criteria)
		}

		if (badgedata.alignment) {
			document.getElementById("alignmentsection").style.display = "block";
			loadAlignments(badgedata.alignment)
		} else {
			document.getElementById("alignmentsection").style.display = "none";
		}

		if (badgedata.endorsement) {
			document.getElementById("endorsementsection").style.display = "block";
			loadEndorsements(badgedata.endorsement)
		} else {
			document.getElementById("endorsementsection").style.display = "none";
		}
	}
}

function loadIssuer(issuerdata) {

	if (issuerdata) {
		if (issuerdata.name) {
			document.getElementById("issuername").innerHTML = issuerdata.name;
		}
		if (issuerdata.description) {
			document.getElementById("issuerdescription").innerHTML = issuerdata.description;
		}

		if (issuerdata.image) {
			document.getElementById("issuerimage").src = issuerdata.image.id;
	    }

		if (issuerdata.url) {
			document.getElementById("issuerurl").innerHTML = issuerdata.url;
		}
		if (issuerdata.telephone) {
			document.getElementById("issuertel").innerHTML = issuerdata.telephone;
		}
		if (issuerdata.email) {
			document.getElementById("issueremail").innerHTML = issuerdata.email;
		}
	}
}

function loadCriteria(criteriadata) {

	if (criteriadata) {
		if (criteriadata.narrative) {
			document.getElementById("criterianarrative").innerHTML = criteriadata.narrative;
		}
	}
}

function loadAlignments(alignmentdata) {

	// add alignments
	if (alignmentdata) {
		try {
			var alignments = alignmentdata;
			var count = alignments.length;

			var tableitems = document.getElementById("alignmentitems");

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
					html += '<td>'+alignment.targetUrl+'</td>';
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
		   document.getElementById("alignmentitems").innerHTML = 'invalid alignment json';
		}
	}
}

function loadEndorsements(endorsementdata) {
	// add endorsements
	if (endorsementdata) {
		document.getElementById("endorsementsection").style.display = "block";
		try {
			var endorsements = endorsementdata;
			var count = endorsements.length;

			var tableitems = document.getElementById("endorsementitems");

			var html = "";
			for (var i=0; i<count;i++) {

				html += '<tr valign="top" style="line-height: 100%;">';
				var endorsement = endorsements[i];

				if (endorsement.claim.endorsementComment) {
					html += '<td>'+endorsement.claim.endorsementComment+'</td>';
				} else {
					html += '<td>&nbsp;</td>';
				}

				if (endorsement.issuer.name) {
					html += '<td>'+endorsement.issuer.name+'</td>';
				} else {
					html += '<td>&nbsp;</td>';
				}

				if (endorsement.issuer.image.id) {
				  html += '<td><img width="80" src="'+endorsement.issuer.image.id+'" /></td>';
				} else {
					html += '<td>&nbsp;</td>';
				}

				if (endorsement.issuer.description) {
					html += '<td>'+endorsement.issuer.description+'</td>';
				} else {
					html += '<td>&nbsp;</td>';
				}
				if (endorsement.issuer.url) {
					html += '<td>'+endorsement.issuer.url+'</td>';
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
		   document.getElementById("endorsementitems").innerHTML = 'invalid alignment json';
		}
}
}
