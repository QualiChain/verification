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

var badgejson;
var detailsvisible = false;
var t_visible = false;
var showembeddedjson = 1;
var showbadgejson = 0;
var showproofjson = 0;
var showmetajson = 0;
var jsonhash = "";
var validationdata;

form = document.getElementById('validatebadge');
form.onsubmit = function() {
	viewfilebadgeinfo();
	return false; // To avoid actual submission of the form
}

function viewfilebadgeinfo() {
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		var files = document.getElementById('badgetoupload').files;
		if (files.length == 0) {
			alert("Please select a badge file to validate first");
		} else if (files.length > 1) {
			alert("Please select only 1 file");
		} else {
			var fileSelected = files[0];
			var reader = new FileReader();
			reader.onload = function(e) {
				var badgefilebinary = e.target.result;
				var chunks = processbadgedata(badgefilebinary);
				loadbadgeinfo(chunks);
			};
			reader.readAsBinaryString(fileSelected);
		}
	} else {
		alert('The File APIs are not fully supported in this browser.');
	}
}

function reset() {
	//document.getElementById('badegimage').innerHTML = "";
	document.getElementById("embeddedjson").innerHTML = "";
	document.getElementById("thebadgejson").value = "";
	document.getElementById("theproofjson").innerHTML = "";
	document.getElementById("tokencontract").innerHTML = "";
	document.getElementById("tokenid").innerHTML = "";

	document.getElementById("badgehash").innerHTML = "";
	document.getElementById("tokenowner").innerHTML = "";
	document.getElementById("tokenmeta").innerHTML =  "";
	document.getElementById("tokenbadge").innerHTML =  "";
	document.getElementById("tokenissuer").innerHTML =  "";
	document.getElementById("tokenmetadata").innerHTML =  "";
	//document.getElementById("tokenmetabutton").disabled = true;
	//document.getElementById("tokendatabutton").disabled = true;

	document.getElementById("validationissuestitle").style.display =  "none";
	document.getElementById("emailissuediv1").style.display =  "none";
	document.getElementById("emailissuediv2").style.display =  "none";
	document.getElementById("contractissuediv1").style.display =  "none";
	document.getElementById("contractissuediv2").style.display =  "none";
	document.getElementById("tokenvaliddiv1").style.display =  "none";
	document.getElementById("tokenvaliddiv2").style.display =  "none";
	document.getElementById("tokenburntdiv1").style.display =  "none";
	document.getElementById("tokenburntdiv2").style.display =  "none";
	document.getElementById("embeddedjsondiv1").style.display =  "none";
	document.getElementById("embeddedjsondiv2").style.display =  "none";
	document.getElementById("jsonhashissuediv1").style.display =  "none";
	document.getElementById("jsonhashissuediv2").style.display =  "none";
	document.getElementById("jsonhashissuediv3").style.display =  "none";
	document.getElementById("badgejsondiv1").style.display =  "none";
	document.getElementById("badgejsondiv2").style.display =  "none";
	document.getElementById("badgejsondiv3").style.display =  "none";
	document.getElementById("proofjsondiv1").style.display =  "none";
	document.getElementById("proofjsondiv2").style.display =  "none";
	document.getElementById("contractdata1").style.display =  "none";
	document.getElementById("contractdata2").style.display =  "none";
	document.getElementById("contractdata3").style.display =  "none";
	document.getElementById("contractdata4").style.display =  "none";
	document.getElementById("contractdata5").style.display =  "none";
	document.getElementById("contractdata6").style.display =  "none";
	document.getElementById("contractdata7").style.display =  "none";
	document.getElementById("metajson1").style.display =  "none";
	document.getElementById("metajson2").style.display =  "none";
	document.getElementById("recipientissuediv1").style.display =  "none";
	document.getElementById("recipientissuediv2").style.display =  "none";
	document.getElementById("issuerissuediv1").style.display =  "none";
	document.getElementById("issuerissuediv2").style.display =  "none";
	document.getElementById("signaturedecodeablediv1").style.display =  "none";
	document.getElementById("signaturedecodeablediv2").style.display =  "none";
	document.getElementById("validassertiondiv1").style.display =  "none";
	document.getElementById("validassertiondiv2").style.display =  "none";
	document.getElementById("publickeydiv1").style.display =  "none";
	document.getElementById("publickeydiv2").style.display =  "none";

	document.getElementById("t_panel").style.display = "none";
	document.getElementById("t_details").innerHTML = " ...show details";
	t_visible = false;
	clearViewBadgeDetails();
}

function loadbadgeinfo(chunks) {

	reset();

	var badgedata = "";
	var type = "";
	if (chunks.iTXt != undefined) {
		for (i = 0; i < chunks['iTXt'].length; i++) {
			bit = chunks['iTXt'][i];
			check = bit.substr(0, 10);
			if (check == "openbadges") {
				badgedata = bit.substr(15);
				//console.log("Badgedata = " + badgedata);
			    try {
			        badgejson = JSON.parse(badgedata);
			        type = "blockchain";
			    } catch (e) {
			    	res = badgedata.split(".");
			    	if(res.length = 3) {
			        	//console.log("possible signed badge");
			        	type = "signed";
			    	} else {
			        	alert("Badge contains invalid data");
			        	type = false;
			    	}
			    }
			}
		}
	}
	document.getElementById("validationblock").style.display = "block";
	//document.getElementById("t_details").style.display = "none";

	if (type == "blockchain") {
		if (badgedata == "") {
			alert('The badge you have selected does not contain any OpenBadge data');
		} else {
			// draws the detail tab area
			processExtractedJSON(badgejson);

			// validate on server.
			validateExtractedJSONBlockchain(badgejson);
		}
	} else if (type == "signed") {
		validateExtractedJSONSigned(badgedata);
	}
}

function validateExtractedJSONSigned(signature) {
	var handler = function(response) {

		console.log(response);
		processExtractedJSON(response.assertion);

		if(response.assertion.badge.image != undefined  && response.assertion.badge.name) {
			var image = response.assertion.badge.image;
			var newImage = document.createElement('img');
			newImage.src = image;
			newImage.width = "80";
			document.getElementById('badegimage').innerHTML = newImage.outerHTML;
			//document.getElementById('badegimagefile').innerHTML = newImage.outerHTML;
			document.getElementById('badegtitle').innerHTML = response.assertion.badge.name;
		}

		var isvalid = false;
		if (response.decodablesignature &&
				response.validassertionformat &&
				response.publicKeyMatches &&
				response.emailidentitymatches) {

				isvalid = true;
		}


		if (isvalid == true) {
			document.getElementById("validationresult").innerHTML = "<div class=\"bigboxdiv greenb\"><div class=\"bigboxdivtext\">&#10004;</div></div>";
		} else {
			document.getElementById("validationresult").innerHTML = "<div class=\"bigboxdiv redb\"><div class=\"bigboxdivtext\">&#10006;</div></div>";
			document.getElementById("validationissuestitle").style.display =  "table-row";
		}

		//document.getElementById('badegimage').innerHTML = "";
		//document.getElementById('badegtitle').innerHTML = "";

		var html = "";
		var htmltop = "<table width=\"700\">";

		if (response.decodablesignature) {
			html += "<tr>";
			html += "<td>Decodeable Signature:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
			html += "</tr>";
			if (response.validassertionformat) {
				html += "<tr>";
				html += "<td>Valid Assertion Format:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
				html += "</tr>";
				if (response.publicKeyMatches) {
					html += "<tr>";
					html += "<td>Public Key Matches:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
					html += "</tr>";
				} else {
						html += "<tr>";
						html += "<td>Public Key Matches:</td><td><div class=\"boxdiv redb\">&#10006;</div></td>";
						html += "</tr>";

						document.getElementById("publickeydiv1").style.display =  "table-row";
						document.getElementById("publickeydiv2").style.display =  "table-row";
						document.getElementById("publickeytext").innerHTML = "The published public key does not match required by the signature.";
				}
				if (response.emailidentitymatches) {
					html += "<tr>";
					html += "<td>Email Address matches:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
					html += "</tr>";
				} else {
					html += "<tr>";
					html += "<td>Email Address matches:</td><td><div class=\"boxdiv redb\">&#10006;</div></td>";
					html += "</tr>";

					document.getElementById("emailissuediv1").style.display =  "table-row";
					document.getElementById("emailissuediv2").style.display =  "table-row";
					document.getElementById("emailtext").innerHTML = "The email supplied (" + document.getElementById("emailtoupload").value + ") does not match the recipient email encoded in the badge.";
				}
			} else {
					html += "<tr>";
					html += "<td>Valid Assertion Format:</td><td><div class=\"boxdiv redb\">&#10006;</div></td>";
					html += "</tr>";

					document.getElementById("validassertiondiv1").style.display =  "table-row";
					document.getElementById("validassertiondiv2").style.display =  "table-row";
					document.getElementById("validassertiontext").innerHTML = "The assertion json encoded in the signature is not of a valid format.";
			}
		} else {
				html += "<tr>";
				html += "<td>Decodeable Signature:</td><td><div class=\"boxdiv redb\">&#10006;</div></td>";
				html += "</tr>";

				document.getElementById("signaturedecodeablediv1").style.display =  "table-row";
				document.getElementById("signaturedecodeablediv2").style.display =  "table-row";
				document.getElementById("signaturedecodeabletext").innerHTML = "The signature in this badge is not valid and cannot be decoded.";
		}

		html = htmltop + html;
		html += "</table></br>";

		document.body.style.cursor = 'default';
		//console.log(html)

		document.getElementById("validationsummary").innerHTML = html;
	}
	var temp = {};
	temp.signature = signature;
	temp.emailtoupload = document.getElementById("emailtoupload").value;
	makeRequest("POST", cfg.proxy_path+"/validation/validatesigned", temp, handler);

}

function validateExtractedJSONBlockchain(badgejson) {

	if (badgejson.badge == undefined) {
		alert("The badge you have selected contains invalid badge data");
	} else {
		//console.log(badgedata);

		document.body.style.cursor = 'wait';

		console.log(badgejson);
		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				//code to do if successful here
				console.log("RESPONSE");
				console.log(response);

				if (!response.result || response.result === 'undefined') {
					alert("The Validation process is currently experiencing difficulties. Please try again later.");
				}  else {
					document.getElementById("validationblock").style.display = "block";
					//document.getElementById("t_details").style.display = "block";

					validationdata = response;

					isvalid = false;
					var summary = response.result.validationsummary;
					console.log(summary);

					/*
					tokenexists: true
					tokenburnt: true
					contractdataok: true
					jsonjsonhashmatches: true
					jsonmetahashmatches: true
					assertionmetadata: true
					contractexists: true
					tokenissuermatches: true
					tokenmetadataexists: true
					tokenownermatches: true
					emailidentitymatches: true
					*/

					if (summary.tokenexists &&
							!summary.tokenburnt &&
							summary.jsonjsonhashmatches &&
							summary.jsonmetahashmatches &&
							summary.assertionmetadata &&
							summary.contractexists &&
							summary.tokenownermatches &&
							summary.tokenissuermatches &&
							summary.tokenmetadataexists &&
							summary.emailidentitymatches) {

							isvalid = true;
					}

					if (isvalid == true) {
						document.getElementById("validationresult").innerHTML = "<div class=\"bigboxdiv greenb\"><div class=\"bigboxdivtext\">&#10004;</div></div>";
					} else {
						document.getElementById("validationresult").innerHTML = "<div class=\"bigboxdiv redb\"><div class=\"bigboxdivtext\">&#10006;</div></div>";
						document.getElementById("validationissuestitle").style.display =  "table-row";
					}
					var html = "";
					var metahash = "";
					var htmltop = "<table width=\"700\">";
					var jsonhashok = false;
					var recipientok = false;
					var issuerok = false;

					if (summary.emailidentitymatches) {
						html += "<tr>";
						html += "<td>Email Address matches:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
						html += "</tr>";
					} else {
						html += "<tr>";
						html += "<td>Email Address matches:</td><td><div class=\"boxdiv redb\">&#10006;</div></td>";
						html += "</tr>";

						document.getElementById("emailissuediv1").style.display =  "table-row";
						document.getElementById("emailissuediv2").style.display =  "table-row";
						document.getElementById("emailtext").innerHTML = "The email supplied (" + document.getElementById("emailtoupload").value + ") does not match the recipient email encoded in the badge.";

					}

					if (summary.contractexists) {
						html += "<tr>";
						html += "<td>Blockchain contract exists:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
						html += "</tr>";
					} else {
						html += "<tr>";
						html += "<td>Blockchain contract exists:</td><td><div class=\"boxdiv redb\">&#10006;</div></td>";
						html += "</tr>";

						document.getElementById("contractissuediv1").style.display =  "table-row";
						document.getElementById("contractissuediv2").style.display =  "table-row";

						if (badgejson && badgejson.signature.anchors[0].sourceId) {
							document.getElementById("contracttext").innerHTML = "The blockchain contract address detailed in the badge JSON (" + badgejson.signature.anchors[0].sourceId + ") is not a valid address.";
						} else {
							document.getElementById("contracttext").innerHTML = "The blockchain contract address detailed in the badge JSON is not a valid address.";
						}
					}
					var metavalid = false;

					if (summary.tokenburnt === true) {
							html += "<tr>";
							html += "<td>Badge token is NOT burnt:</td><td><div class=\"boxdiv redb\">&#10006;</div></td>";
							html += "</tr>";

							document.getElementById("tokenburntdiv1").style.display =  "table-row";
							document.getElementById("tokenburntdiv2").style.display =  "table-row";
							document.getElementById("burnttext").innerHTML = "The token id given for this Badge has been burnt, indicating that the Badge has been revoked by the issuer.";
					} else {
						html += "<tr>";
						html += "<td>Badge token is NOT burnt:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
						html += "</tr>";

						if (summary.tokenexists === false) {
							html += "<tr>";
							html += "<td>Badge token is valid:</td><td><div class=\"boxdiv redb\">&#10006;</div></td>";
							html += "</tr>";

							document.getElementById("tokenvaliddiv1").style.display =  "table-row";
							document.getElementById("tokenvaliddiv2").style.display =  "table-row";
							document.getElementById("tokenvalidtext").innerHTML = "The token id given for this Badge is not a valid token id for the token contract specified.";
						} else {
							html += "<tr>";
							html += "<td>Badge token is valid:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
							html += "</tr>";

							tmp = "";
							if (summary.tokenmetadataexists) {
								tmp += "<tr>";
								tmp += "<td>Token Metadata exists:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
								tmp += "</tr>";
								if (response.result.tokenmetadata.files != undefined) {
									tmp += "<tr>";
									tmp += "<td>Token Metadata valid JSON:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
									tmp += "</tr>";
									metahash = response.result.tokenmetadata.files[0].filehash;
									metavalid = true;
								} else if (response.result.tokenmetadata.assertionjsonhash != undefined) {
									tmp += "<tr>";
									tmp += "<td>Token Metadata valid JSON:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
									tmp += "</tr>";
									metahash = response.result.tokenmetadata.assertionjsonhash;
									metavalid = true;
								} else {
									tmp += "<tr>";
									tmp += "<td>Token Metadata valid JSON:</td><td><div class=\"boxdiv redb\">&#10006;</div></td>";
									tmp += "</tr>";
								}
							} else {
								tmp += "<tr>";
								tmp += "<td>Token Metadata exists:</td><td><div class=\"boxdiv redb\">&#10006;</div></td>";
								tmp += "</tr>";

								document.getElementById("metaissuediv1").style.display =  "table-row";
								document.getElementById("metaissuediv2").style.display =  "table-row";
								document.getElementById("metatext").innerHTML = "The meatdata file (" + validationdata.result.contract.tokenuri + ") specified in blockchain contract does not exist.";
							}
							html = html + tmp;

							badgeimageok = true;
							var image = response.badgejson.badge.image;
							var newImage = document.createElement('img');
							newImage.src = image;
							newImage.width = "80";
							document.getElementById('badegimage').innerHTML = newImage.outerHTML;
							//document.getElementById('badegimagefile').innerHTML = newImage.outerHTML;
							document.getElementById('badegtitle').innerHTML = response.badgejson.badge.name;

							var temp = JSON.parse(JSON.stringify(response.badgejson));
							temp.recipientProfile.publicKey = "<span class='hashstyle4'>" + temp.recipientProfile.publicKey + "</span>";
							temp.verification.publicKey = "<span class='hashstyle5'>" + temp.verification.publicKey + "</span>";
							temp.signature.targetHash = "<span class='hashstyle1'>" + temp.signature.targetHash + "</span>";
							temp.signature.tokenId = "<span class='hashstyle2'>" + temp.signature.tokenId + "</span>";
							temp.signature.anchors[0].sourceId = "<span class='hashstyle3'>" + temp.signature.anchors[0].sourceId + "</span>";
							badgejsonstr = JSON.stringify(temp, null, 2);
							badgejsonstr = badgejsonstr.replace(/(?:\r\n|\r|\n)/g, '<br>');
							badgejsonstr = badgejsonstr.replace(/(  )/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
							document.getElementById('embeddedjson').innerHTML = badgejsonstr;

							var signature = {};
							signature.signature = response.badgejson.signature;
							signaturejson = JSON.parse(JSON.stringify(response.badgejson.signature));
							var badge = response.badgejson;
							badgejson = JSON.parse(JSON.stringify(badge));
							delete badge.signature;

							badgejsonstr = JSON.stringify(badge);
							document.getElementById('thebadgejson').value = badgejsonstr;

							signatureTargetHash = signature.signature.targetHash;
							signature.signature.targetHash = "<span class='hashstyle1'>" + signature.signature.targetHash + "</span>";
							signature.signature.tokenId = "<span class='hashstyle2'>" + signature.signature.tokenId + "</span>";
							signature.signature.anchors[0].sourceId = "<span class='hashstyle3'>" + signature.signature.anchors[0].sourceId + "</span>";

							var signaturejsonstr = JSON.stringify(signature, null, 2);
							signaturejsonstr = signaturejsonstr.replace(/(?:\r\n|\r|\n)/g, '<br>');
							signaturejsonstr = signaturejsonstr.replace(/(  )/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
							document.getElementById('theproofjson').innerHTML = signaturejsonstr;
							jsonhash = response.result.vaildatehash.jsonhash;

							document.getElementById('tokencontract').innerHTML = signaturejson.anchors[0].sourceId;
							document.getElementById('tokenid').innerHTML = signaturejson.tokenId;

							calculatehash();
							if (summary.contractexists) {
								tokendata();
								if (summary.tokenmetadataexists){
									metahash = tokenmetabutton();
								}
							}

							tmp = "";
							if (summary.jsonjsonhashmatches) {
								jsonhashok = true;
								tmp = "<tr>";
								tmp += "<td>Hash of OpenBadges JSON Data matches hash in badge signature:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
								tmp += "</tr>";
							} else {
								tmp = "<tr>";
								tmp += "<td>Hash of OpenBadges JSON Data matches in badge signature:</td><td><div class=\"boxdiv redb\">&#10006;</div></td>";
								tmp += "</tr>";
								jsonhashok = false;

								document.getElementById("jsonhashissuediv1").style.display =  "table-row";
								document.getElementById("jsonhashissuediv2").style.display =  "table-row";
								document.getElementById("jsonjsonhashissue").innerHTML = "The calculated hash of the OpenBadges JSON '" + jsonhash + "' does not match the value for the hash in the embedded badge JSON '" + signature.signature.targetHash + "'";
							}
							html = html + tmp;

							tmp = "";
							if (summary.assertionmetadata && summary.tokenmetadataexists && metavalid) {
								if (summary.jsonmetahashmatches) {
									jsonhashok = true;
									tmp = "<tr>";
									tmp += "<td>Hash of OpenBadges JSON Data matches hash in token metadata:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
									tmp += "</tr>";
								} else {
									tmp = "<tr>";
									tmp += "<td>Hash of OpenBadges JSON Data matches hash in token metadata:</td><td><div class=\"boxdiv redb\">&#10006;</div></td>";
									tmp += "</tr>";
									jsonhashok = false;

									document.getElementById("jsonhashissuediv1").style.display =  "table-row";
									document.getElementById("jsonhashissuediv3").style.display =  "table-row";
									document.getElementById("jsonmetahashissue").innerHTML = "The hash in the blockchain token metadata '" + metahash + "' does not match the value for the hash in the embedded badge JSON '" + signatureTargetHash + "'";
								}
								html = html + tmp;
							}

							//console.log(response.badgejson.verification.publicKey);
							//console.log(validationdata.result.contract.tokenissuer);

							if (summary.contractdataok) {
								tmp = "";
								if (summary.tokenownermatches) {
									recipientok = true;
									tmp = "<tr>";
									tmp += "<td>Badge Recipient Account matches:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
									tmp += "</tr>";
								} else {
									tmp = "<tr>";
									tmp += "<td>Badge Recipient Account matches:</td><td><div class=\"boxdiv redb\">&#10006;</div></td>";
									tmp += "</tr>";
									recipientok = false;

									document.getElementById("recipientissuediv1").style.display =  "table-row";
									document.getElementById("recipientissuediv2").style.display =  "table-row";
									document.getElementById("reipienttext").innerHTML = "The badge recipient in the OpenBadges JSON '" + response.badgejson.recipientProfile.publicKey + "' does not match the value stored in the blockchain contract '" + validationdata.result.contract.tokenowner + "' for this badge.";
								}
								html = html + tmp;

								tmp = "";
								if (summary.tokenissuermatches) {
									issuerok = true;
									tmp = "<tr>";
									tmp += "<td>Badge Issuer Account matches:</td><td><div class=\"boxdiv greenb\">&#10004;</div></td>";
									tmp += "</tr>";
								} else {
									tmp = "<tr>";
									tmp += "<td>Badge Issuer Account matches:</td><td><div class=\"boxdiv redb\">&#10006;</div></td>";
									tmp += "</tr>";
									issuerok = false;

									document.getElementById("issuerissuediv1").style.display =  "table-row";
									document.getElementById("issuerissuediv2").style.display =  "table-row";
									document.getElementById("issuertext").innerHTML = "The badge issuer in the OpenBadges JSON '" + response.badgejson.verification.publicKey + "' does not match the value stored in the blockchain contract '" + validationdata.result.contract.tokenissuer + "' for this badge.";
								}
								html = html + tmp;
							}
						}
					}

					html = htmltop + html;
					html += "</table></br>";

					document.body.style.cursor = 'default';

					document.getElementById("validationsummary").innerHTML = html;
				}
			}
		}
		var temp = {};
		temp.badgejson = badgejson;
		temp.emailtoupload = document.getElementById("emailtoupload").value;
		makeRequest("POST", cfg.proxy_path+cfg.badges_path+"/validation/validate", temp, handler);

	}
}

function tokendata() {
	document.getElementById("tokenowner").innerHTML = validationdata.result.contract.tokenowner;
	document.getElementById("tokenmeta").innerHTML =  validationdata.result.contract.tokenuri;
	document.getElementById("tokenbadge").innerHTML =  validationdata.result.contract.tokencontract;
	document.getElementById("tokenissuer").innerHTML =  validationdata.result.contract.tokenissuer;
	//if (validationdata.result.validationsummary.tokenmetadataexists) document.getElementById("tokenmetabutton").disabled = false;
}

function tokenmetabutton() {
	var temp = JSON.parse(JSON.stringify(validationdata.result.tokenmetadata));
	var hash = "";
	if (validationdata.result.tokenmetadata.files != undefined) {
		hash = temp.files[0].filehash;
		temp.files[0].filehash = "<span class='hashstyle1'>" + temp.files[0].filehash + "</span>";
	} else if (validationdata.result.tokenmetadata.assertionjsonhash != undefined) {
		hash = temp.assertionjsonhash;
		temp.assertionjsonhash = "<span class='hashstyle1'>" + temp.assertionjsonhash + "</span>";
	}
	var metajsonstr = JSON.stringify(temp, null, 2);
	metajsonstr = metajsonstr.replace(/(?:\r\n|\r|\n)/g, '<br>');
	metajsonstr = metajsonstr.replace(/(  )/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
	document.getElementById('tokenmetadata').innerHTML = metajsonstr;
	return hash;
}

function processbadgedata(content){
	//first character is 137 in file read php version of this code
	var png_signature1 = pack("C8", 137, 80, 78, 71, 13, 10, 26, 10);

	//first character is 63369 seems to be in file read via http
	var png_signature2 = pack("C8", 63369, 80, 78, 71, 13, 10, 26, 10);
	var header = content.substring(0, 8);

	if (header != png_signature1 && header != png_signature2) {
			console.log('This is not a valid PNG image');
	}
	var size = content.length;
	//console.log(size);

	var chunks = new Array();

	// Skip 8 bytes of IHDR image header.
	var position = 8;
	do {
		chunk = unpack('Nsize/a4type', content.substring(position, position + 8));
		if(chunks[chunk['type']] == undefined){
			chunks[chunk['type']]=new Array();
		}
		chunks[chunk['type']][chunks[chunk['type']].length] = content.substring(position + 8, position + 8 + chunk['size']);

		//console.log(chunks[chunk['type']]);
		// Skip 12 bytes chunk overhead.
		position += chunk['size'] + 12;
		//console.log(chunk['type']+" "+chunks[chunk['type']]);
	} while (position < size);

	return chunks
}

function calculatehash() {
	document.getElementById("badgehash").innerHTML = jsonhash;
}

function showhidedetails() {
	document.getElementById("t_panel").style.display = "none";
	document.getElementById("t_details").innerHTML = " ...show details";
	t_visible = false;
	//
	detailsvisible = !detailsvisible;
	if (detailsvisible) {
		document.getElementById("detailspanel").style.display = "block";
		document.getElementById("details").innerHTML = " ...hide validation";
	} else {
		document.getElementById("detailspanel").style.display = "none";
		document.getElementById("details").innerHTML = " ...show validation";
	}
}

function showhidetitle() {
	document.getElementById("detailspanel").style.display = "none";
	document.getElementById("details").innerHTML = " ...show validation";
	detailsvisible = false;
	//
	t_visible = !t_visible;
	if (t_visible) {
		document.getElementById("t_panel").style.display = "block";
		document.getElementById("t_details").innerHTML = " ...hide details";
	} else {
		document.getElementById("t_panel").style.display = "none";
		document.getElementById("t_details").innerHTML = " ...show details";
	}
}

function showhideembeddedjson() {
	if (showembeddedjson == 0) {
		showembeddedjson = 1;
		document.getElementById("embeddedjsonhideshow").src = cfg.proxy_path+"/images/opened_arrow.png";
		document.getElementById("embeddedjson").style.display = "block";
	} else {
		showembeddedjson =0;
		document.getElementById("embeddedjsonhideshow").src = cfg.proxy_path+"/images/closed_arrow.png";
		document.getElementById("embeddedjson").style.display = "none";
	}
}
function showhidebadgejson() {
	if (showbadgejson == 0) {
		showbadgejson = 1;
		document.getElementById("badgejsonhideshow").src = cfg.proxy_path+"/images/opened_arrow.png";
		document.getElementById("thebadgejson").style.display = "block";
	} else {
		showbadgejson =0;
		document.getElementById("badgejsonhideshow").src = cfg.proxy_path+"/images/closed_arrow.png";
		document.getElementById("thebadgejson").style.display = "none";
	}
}

function showhideproofjson() {
	if (showproofjson == 0) {
		showproofjson = 1;
		document.getElementById("proofjsonhideshow").src = cfg.proxy_path+"/images/opened_arrow.png";
		document.getElementById("theproofjson").style.display = "block";
	} else {
		showproofjson =0;
		document.getElementById("proofjsonhideshow").src = cfg.proxy_path+"/images/closed_arrow.png";
		document.getElementById("theproofjson").style.display = "none";
	}
}

function showhidemetajson() {
	if (showmetajson == 0) {
		showmetajson = 1;
		document.getElementById("metajsonhideshow").src = cfg.proxy_path+"/images/opened_arrow.png";
		document.getElementById("tokenmetadata").style.display = "block";
	} else {
		showmetajson =0;
		document.getElementById("metajsonhideshow").src = cfg.proxy_path+"/images/closed_arrow.png";
		document.getElementById("tokenmetadata").style.display = "none";
	}
}
