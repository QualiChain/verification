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

var DATE_FORMAT_PROJECT = 'd mmm yyyy';


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
			evidence = [];
			if (typeof json.evidence === "string") {
				evidence.push(json.evidence);
			}

			var evidence = json.evidence;
			var count = evidence.length;

			var evidencelist = document.getElementById("evidenceitems");

			var html = "";
			for (var i=0; i<count;i++) {

				html += '<tr>';
				var evidenceitem = evidence[i];

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
						html += '<td>'+evidenceitem.id+'</td>';
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
		   document.getElementById("alignmentitems").innerHTML = 'invalid alignment json';
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
			   document.getElementById("databadgedescription").innerHTML = json.badge.description;
			}
			if (json.badge.image) {
			   document.getElementById("databadgeimage").src = json.badge.image;
			}
			if (json.badge.criteria) {
				if (json.badge.criteria.narrative) {
					document.getElementById("criteriaurl").innerHTML = json.badge.criteria.narrative;
				} else {
					document.getElementById("criteriaurl").innerHTML = json.badge.criteria.id;
				}
			}
			if (json.badge.issuer) {
				try {
					if (json.badge.issuer.image) {
						if (json.badge.issuer.image.id) {
							document.getElementById("databadgeissuerimage").src = json.badge.issuer.image.id;
						} else {
							document.getElementById("databadgeissuerimage").src = json.badge.issuer.image;
						}
					}
					if (json.badge.issuer.name) {
					   document.getElementById("dataissuername").innerHTML = json.badge.issuer.name;
					}
					if (json.badge.issuer.description) {
					   document.getElementById("dataissuerdesc").innerHTML = json.badge.issuer.description;
					}
					if (json.badge.issuer.url) {
					   document.getElementById("dataissuerurl").innerHTML = json.badge.issuer.url;
					}
					if (json.badge.issuer.email) {
					   document.getElementById("dataissueremail").innerHTML = json.badge.issuer.email;
					}
					if (json.badge.issuer.telephone) {
					   document.getElementById("dataissuertelephone").innerHTML = json.badge.issuer.telephone;
					}
				}
				catch(e) {
					alert(e);
				   document.getElementById("issuerdata").innerHTML = 'invalid issuer json';
				}
			}

			// add alignments
			if (json.badge.alignment) {
				document.getElementById("alignmentsection").style.display = "block";

				try {
					var alignments = json.badge.alignment;
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

			// add endorsements
			if (json.badge.endorsement) {
				document.getElementById("endorsementsection").style.display = "block";
				try {
					var endorsements = json.badge.endorsement;
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

