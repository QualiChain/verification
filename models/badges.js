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

const db = require('../db.js')
const cfg = require('../config.js');
const utilities = require('../models/utilities.js');
const fs = require( 'fs' );
const pngitxt = require('png-itxt');
const readChunk = require('read-chunk');
const imageType = require('image-type');

const N3 = require('n3');
const parser1 = new N3.Parser({ format: 'N-Quads' });
const writer1 = new N3.Writer({ format: 'N-Quads' });
const urlExists = require('url-exists');
const jws = require('jws');

var count = 0;
var gasPrice = 21000000000;

// for building the JSON calling functions in the other models
const issuer_model = require('../models/issuers');
const endorsement_model = require('../models/endorsements');

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const { matchedData } = require('express-validator/filter');

/**
 * Get the Badge management page for the currently logged in administrator.
 * @return HTML page for issuer's allowed badge types or error page with error message.
 */
exports.getBadgeManagementPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				res.render('managebadges', { title: 'Manage Badges'});
			}
		}
	});
}

/**
 * Get the Badge type page for the currently logged in issuer. This shows them the details of the pages they can issue.
 * @return HTML page for issuer's allowed badge types or error page with error message.
 */
exports.getViewIssuerBadgesPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				res.render('viewissuerbadges', { title: 'View Badges'});
			}
		}
	});
}

/**
 * Return the view all base badges page which will display base badge data for badges that have been issued
 * Return a page showing all the Badge Types in the system. This is a publically viewable page.
 */
exports.getViewAllBaseBadgesPage = function(req, res, next) {

	res.locals.badges = [];

	let sql = "SELECT DISTINCT sum(case badge_issued.status when 'issued' then 1 when 'revoked' then 1 else 0 END) as num2, ";
	sql += "badges.uniqueid, badges.blockchainaddress, badges.timecreated,badges.title, badges.version, badges.imageurl, issuers.name as issuername, users.blockchainaccount ";
	sql += "from badges left join issuers on badges.issuerid = issuers.id left join users on issuers.loginuserid = issuers.id ";
	sql += "left join badge_issued on badges.id = badge_issued.badgeid Group by badges.id";

	db.get().query(sql, [], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error retrieving badge records"});
		} else {
			if (rows.length > 0) {

				let count = rows.length;
				for(let i=0; i<count; i++) {
					let next = rows[i];
					res.locals.badges[i] = {};
					res.locals.badges[i].uniqueid = next["uniqueid"];
					let d = new Date(parseInt(next["timecreated"]*1000));
					res.locals.badges[i].year = d.getFullYear();
					res.locals.badges[i].title = next["title"];
					res.locals.badges[i].version = next["version"];
					res.locals.badges[i].imageurl = next["imageurl"];
					res.locals.badges[i].issuername = next["issuername"];
					res.locals.badges[i].issueraacount = next["blockchainaccount"];
					res.locals.badges[i].blockchainaddress = next["blockchainaddress"];
					res.locals.badges[i].count = next["num2"];
				}
			}
			res.render('viewallbasebadges', { title: 'Badges', data: JSON.stringify(res.locals.badges) });
		}
	});
}

/*
exports.endorseBadge(req, res, next) {

}
*/

/**
 * Validate a Badge issuance (Assertion) from the JSONLD of the badge issuance and the email address of the Badge recipient.
 * @param badgejson, Required. The JSONLD of the badge issuance, as extracted from the Badge issuance file.
 * @param emailtoupload, Required. The email address of the Badge recipient for checking against.
 * @return JSON 'result' object containing all the checks performed and their outcomes.
 */
exports.validatesigned = function(req, res, next) {
	var data = matchedData(req);
	//data.signature = "eyJhbGciOiJSUzI1NiJ9.eyJAY29udGV4dCI6Imh0dHBzOi8vdzNpZC5vcmcvb3BlbmJhZGdlcy92MiIsInR5cGUiOiJBc3NlcnRpb24iLCJpZCI6InVybjp1dWlkOmFlYzY1OTdmLTcxM2YtNTBhNi05NDdiLTY1Mjg1YTM4NjAxOCIsImlzc3VlZE9uIjoiMjAyMC0wMy0xN1QxMDowNToyOC4wMDBaIiwicmVjaXBpZW50Ijp7Imhhc2hlZCI6dHJ1ZSwiaWRlbnRpdHkiOiJzaGEyNTYkOTM4MDhjNGZhN2I0MmI4NmE0OTBlZWFkNGZkMzAwMDVmYmQ1OGVmYjc1N2Q3MTdhZjc2YjgxNDljYTUwY2RjYiIsInR5cGUiOiJlbWFpbCIsInNhbHQiOiJpb2NiYWRnZXM1NDkzNzIxMDA4NyJ9LCJiYWRnZSI6Imh0dHBzOi8vYmxvY2tjaGFpbjYua21pLm9wZW4uYWMudWsvYmFkZ2VzL2hvc3RlZC8weDIzYjBjMGJkOGNlMjIwOGI3ZWIwNTMxMmI2OTRmOWY2MjkwNzNmMDliNjY1MDE5MzYwZmQwZWI5ZjkyYzE5MzkiLCJ2ZXJpZmljYXRpb24iOnsidHlwZSI6InNpZ25lZEJhZGdlIiwiY3JlYXRvciI6Imh0dHBzOi8vYmxvY2tjaGFpbjYua21pLm9wZW4uYWMudWsvYmFkZ2VzL2tleXMvcHVibGljLzB4NjcxNGQ5OWJiZmRlZWU5NjBjYWU4ZTBlYjRiMzFhMzA4NDc3MTFlZDkzYmJjMzk4YzM2MzNjMGRhYjU3NmQzNiJ9fQ.Aon93WuewW-vJvgo8P_xdEjJqL2iot7GiG8Me0OCmQJvuEORttLhKwUO0T5md_ud03H_l0dyR7rP9hv-4HoXDJPpJ3_vDYEvtHMkmjETVvjO8bA0YK_9t-YgZVsjfkzZEDCvpN6w-HCHse9O0ypaV4A5qMn85uS_PuNSRMLtp6U";

	if (!data.signature) {
		return res.status(400).send({"error": "You must include badge signature to validate"});
	}

	output = {};
	output.decodablesignature = false;
	output.validassertionformat = false;
	output.publicKeyMatches = false;
	output.emailidentitymatches = false;

	var decoded = jws.decode(data.signature);
	if (decoded == null) {
		res.send(output);
	} else {

		//console.log(decoded);
		if (decoded.payload == undefined) {
			output.decodablesignature = false;
		} else {
			output.decodablesignature = true;
			var assertion = JSON.parse(decoded.payload);
			output.assertion = assertion;

			if (assertion["@context"] == undefined || assertion["type"] == undefined || assertion["id"] == undefined || assertion["issuedOn"] == undefined || assertion["recipient"] == undefined || assertion["badge"] == undefined || assertion["verification"] == undefined) {
				output.validassertionformat = false;
				res.send(output);
			} else {
				var recipient = assertion.recipient;
				var verification = assertion.verification;
				if (assertion.type == "Assertion" && recipient.identity != undefined && recipient.type != undefined && verification.type != undefined && verification.creator != undefined) {
					if (verification.type == "signedBadge" && recipient.type == "email" && recipient.salt != undefined) {
						output.validassertionformat = true;

						/*
						{"@context":"https://w3id.org/openbadges/v2","type":"Assertion","id":"urn:uuid:aec6597f-713f-50a6-947b-65285a386018","issuedOn":"2020-03-17T10:05:28.000Z","recipient":{"hashed":true,"identity":"sha256$93808c4fa7b42b86a490eead4fd30005fbd58efb757d717af76b8149ca50cdcb","type":"email","salt":"iocbadges54937210087"},"badge":"https://blockchain6.kmi.open.ac.uk/badges/hosted/0x23b0c0bd8ce2208b7eb05312b694f9f629073f09b665019360fd0eb9f92c1939","verification":{"type":"signedBadge","creator":"https://blockchain6.kmi.open.ac.uk/badges/keys/public/0x6714d99bbfdeee960cae8e0eb4b31a30847711ed93bbc398c3633c0dab576d36"}}
						*/

						var identityok = utilities.validateEncodedEmail(data.emailtoupload, recipient.identity, recipient.salt);

						output.emailidentitymatches = identityok;

						let loadHandler1 = function(err, resp) {
							if (err) {
								console.log(err);
								res.send(output);
							} else {
								response = JSON.parse(resp.body);
								if (response["@context"] == undefined || response["type"] == undefined || response["id"] == undefined || response["owner"] == undefined || response["publicKeyPem"] == undefined) {
									output.publicKeyMatches = false;
									res.send(output);
								} else {
									if (response.type == "CryptographicKey" && response.id == verification.creator) {

										output.publicKeyMatches = jws.verify(data.signature, "RS256", response.publicKeyPem);

										let loadHandler2 = function(err, resp) {
											if (err) {
												console.log(err);
												res.send(output);
											} else {
												response = JSON.parse(resp.body);
												output.assertion.badge = response;
												if (output.assertion.badge.issuer != undefined) {

													let loadHandler3 = function(err, resp) {
														if (err) {
															console.log(err);
															res.send(output);
														} else {
															response = JSON.parse(resp.body);
															output.assertion.badge.issuer = response;

															if (output.assertion.badge.endorsement != undefined) {


																let loadHandler4 = function(err, resp) {
																	if (err) {
																		console.log(err);
																		res.send(output);
																	} else {
																		response = JSON.parse(resp.body);

																		//console.log(response);
																		output.assertion.badge.endorsement = new Array();
																		output.assertion.badge.endorsement[0] = response;

																		if (output.assertion.badge.endorsement[0].issuer != undefined) {

																			let loadHandler5 = function(err, resp) {
																				if (err) {
																					console.log(err);
																					res.send(output);
																				} else {
																					response = JSON.parse(resp.body);
																					//console.log(response);
																					output.assertion.badge.endorsement[0].issuer = response;
																					res.send(output);
																				}
																			}
																			utilities.loadUrl(output.assertion.badge.endorsement[0].issuer, loadHandler5);
																		} else {
																			res.send(output);
																		}
																	}
																}
																utilities.loadUrl(output.assertion.badge.endorsement, loadHandler4);
															} else {
																res.send(output);
															}
														}
													}
													utilities.loadUrl(output.assertion.badge.issuer, loadHandler3);
												} else {
													res.send(output);
												}
											}
										}
										utilities.loadUrl(assertion.badge, loadHandler2);
									} else {
										res.send(output);
									}
								}
							}
						}
						utilities.loadUrl(verification.creator, loadHandler1);
//output.publicKeyMatches

					} else {
						res.send(output);
					}
				} else {
					res.send(output);
				}
			}
		}
		//console.log(output);
	}
}


/**
 * Validate a Badge issuance (Assertion) from the JSONLD of the badge issuance and the email address of the Badge recipient.
 * @param badgejson, Required. The JSONLD of the badge issuance, as extracted from the Badge issuance file.
 * @param emailtoupload, Required. The email address of the Badge recipient for checking against.
 * @return JSON 'result' object containing all the checks performed and their outcomes.
 */
exports.validate = function(req, res, next) {

	var data = matchedData(req);

	// should never need this as the check is done in the routes
	//if (!data.emailtoupload) {
		//return res.status(400).send({"error": "You must include a valid email address to validate the badge"});
	//}

	if (!data.badgejson.badge) {
		return res.status(400).send({"error": "You must include badge data to validate"});
	} else if (!data.badgejson.signature) {
		return res.status(400).send({"error": "You must include valid badge data"});
	} else if (!data.badgejson.recipient) {
		return res.status(400).send({"error": "You must include valid badge data"});
	} else if (!data.badgejson.recipient.salt) {
		return res.status(400).send({"error": "You must include valid badge data"});
	} else if (!data.badgejson.recipient.type) {
		return res.status(400).send({"error": "You must include valid badge data"});
	} else if (!data.badgejson.recipient.identity) {
		return res.status(400).send({"error": "You must include valid badge data"});
	}

	var identityok = utilities.validateEncodedEmail(data.emailtoupload, data.badgejson.recipient.identity, data.badgejson.recipient.salt);

	var temp = JSON.parse(JSON.stringify(data.badgejson));

	delete temp.signature;

	var processReturn = function(err, canonized) {
		//console.log("IN PROCESS RETURN");
		if (err) {
			//console.log(err);
			res.status(404).send({error: "Error converting badge JSON to n-triples"});
		} else {

			var jsonhash = web3.utils.sha3(canonized);

			res.locals.output = {};

			res.locals.output.validationsummary = {};
			res.locals.output.validationsummary.jsonjsonhashmatches = false;
			res.locals.output.validationsummary.jsonmetahashmatches = false;
			res.locals.output.validationsummary.assertionmetadata = false;
			res.locals.output.validationsummary.emailidentitymatches = identityok;
			res.locals.output.validationsummary.contractexists = false;
			res.locals.output.validationsummary.tokenexists = false;
			res.locals.output.validationsummary.tokenburnt = false;
			res.locals.output.validationsummary.contractdataok = false;
			res.locals.output.validationsummary.tokenownermatches = false;
			res.locals.output.validationsummary.tokenissuermatches = false;
			res.locals.output.validationsummary.tokenmetadataexists = false;

			res.locals.output.vaildatehash = {};
			res.locals.output.vaildatehash.jsonhash = jsonhash;
			res.locals.output.vaildatehash.targethash = data.badgejson.signature.targetHash;

			if (res.locals.output.vaildatehash.jsonhash == res.locals.output.vaildatehash.targethash) {
				res.locals.output.validationsummary.jsonjsonhashmatches = true;
			}

			res.locals.output.contract = {};
			res.locals.output.contract.tokenuri = "";
			res.locals.output.contract.tokenowner = "";
			res.locals.output.contract.tokenissuer = "";
			res.locals.output.contract.tokencontract = "";

			res.locals.output.tokenmetadata = {};

			var contractInstance = new web3.eth.Contract(cfg.contracts.erc721metadatamintable.abi, data.badgejson.signature.anchors[0].sourceId);

			var handler = function(exists, error) {
				if (error) {
					res.status(404).send({error: error});
				} else {
					res.locals.output.validationsummary.contractexists = exists;
					if (exists) {
						var tokenexistshandler = function(e1, tokenexists) {
							if (!e1) {
								res.locals.output.validationsummary.tokenexists = tokenexists;
								var burnthandler = function(e2, tokenburnt) {
									if (!e2) {
										res.locals.output.validationsummary.tokenburnt = tokenburnt;
										if (tokenburnt === true) {
											res.send({badgejson: data.badgejson, result: res.locals.output});
										} else {
											var contracthandler = function(e3, tokenuri) {
												if (!e3) {
													res.locals.output.contract.tokenuri = tokenuri;
													var ownerhandler = function(ownererror, ownerresult) {
														if (!ownererror) {

															res.locals.output.contract.tokenowner = ownerresult;

															// publicKey can have type prepended and separated by a comma
															var recipientAccountBits = data.badgejson.recipientProfile.publicKey.split(":");
															var recipientAccount = "";
															if (recipientAccountBits.length > 1) {
																recipientAccount = recipientAccountBits[1];
															} else {
																recipientAccount = recipientAccountBits[0];
															}
															recipientAccount = web3.utils.toChecksumAddress(recipientAccount); // older address went in to JSON not checksummed

															if (res.locals.output.contract.tokenowner == recipientAccount) res.locals.output.validationsummary.tokenownermatches = true;

															var issuerhandler = function(issuererror, issuerresult) {

																if (!issuererror) {

																	res.locals.output.contract.tokenissuer = issuerresult;

																	// publicKey can have type prepended and separated by a comma
																	var issuerAccountBits = data.badgejson.verification.publicKey.split(":");

																	var issuerAccount = "";
																	if (issuerAccountBits.length > 1) {
																		issuerAccount = issuerAccountBits[1];
																	} else {
																		issuerAccount = issuerAccountBits[0];
																	}
																	issuerAccount = web3.utils.toChecksumAddress(issuerAccount); // older address went in to JSON not checksummed

																	if (res.locals.output.contract.tokenissuer == issuerAccount) res.locals.output.validationsummary.tokenissuermatches = true;

																	var tokencontracthandler = function(tokencontracterror, tokencontractresult) {

																		if (!tokencontracterror) {
																			res.locals.output.contract.tokencontract = tokencontractresult;
																			res.locals.output.validationsummary.contractdataok = true;
																			//console.log("IPFS URL");
																			//console.log(res.locals.output.contract.tokenuri);

																			let loadHandler = function(err, response) {
																				if (err) {
																					console.log(err);
																					res.status(404).send({error: err});
																				} else {
																					metadata = JSON.parse(response.body);
																					res.locals.output.tokenmetadata = metadata;
																					res.locals.output.validationsummary.tokenmetadataexists = true;
																					if (res.locals.output.tokenmetadata.files != undefined) {
																						metahash = tokenmeta.meta.files[0].filehash;
																					} else if (res.locals.output.tokenmetadata.assertionjsonhash != undefined) {
																						res.locals.output.validationsummary.assertionmetadata = true;

																						if (res.locals.output.tokenmetadata.assertionjsonhash == res.locals.output.vaildatehash.jsonhash) {
																							res.locals.output.validationsummary.jsonmetahashmatches = true;
																						}
																					}
																					res.send({badgejson: data.badgejson, result: res.locals.output});
																				}
																			}
																			utilities.loadUrl(res.locals.output.contract.tokenuri, loadHandler);

																		} else {
																			console.log(tokencontracterror);
																			res.status(404).send({error: "Error retrieving Badge Contract address from Token Contract"});
																		}
																	};
																	contractInstance.methods.tokenContractAddress(data.badgejson.signature.tokenId).call(tokencontracthandler);
																} else {
																	console.log(ownererror);
																	res.status(404).send({error: "Error retrieving Token issuer account number from Token Contract"});
																}
															};
															contractInstance.methods.tokenMinterAddress(data.badgejson.signature.tokenId).call(issuerhandler);
														} else {
															console.log(ownererror);
															res.status(404).send({error: "Error retrieving Token contract owner account number from Token Contract"});
														}
													};
													contractInstance.methods.ownerOf(data.badgejson.signature.tokenId).call(ownerhandler);
												} else {
													console.log(e3);
													res.status(404).send({error: "Error retrieving Token metadata url from Token contract"});
												}
											};
											contractInstance.methods.tokenURI(data.badgejson.signature.tokenId).call(contracthandler);
										}
									} else {
										console.log(e2);
										res.status(404).send({error: "Error checking if specified Token has been revoked in Token contract"});
									}
								}
								contractInstance.methods.isBurntToken(data.badgejson.signature.tokenId).call(burnthandler);
							} else {
								console.log(e1)
								res.status(404).send({error: "Error checking if specificed Token exists in Token contract"});
							}
						}
						contractInstance.methods.tokenExists(data.badgejson.signature.tokenId).call(tokenexistshandler);
					} else {
						res.status(404).send({error: "The specificed blockchain Token contract does not exist"});
					}
				}
			};

			utilities.contractExists(data.badgejson.signature.anchors[0].sourceId, handler, req, res);
		}
	}

	utilities.canonicalise(temp, processReturn);
}

/**
 * Create a new Badge record.
 * @param title, Required. A title for the new Badge record.
 * @param description, Required. A description the new Badge record.
 * @param imageurl, Required. An image url for the new Badge record.
 * @param version, Required. A version number for the new Badge record, e.g. '1.0'.
 * @param isuerid, Required. The record identifier of the Issuer for this Badge record.
 * @param criterianarrative, Required. A textual description of the criteria for being awarded this Badge record.
 * @param alignmentids, Optional. A comma separatedlist of Alignment ids to associate with this Badge record.
 * @param eventids, Optional. A comma separated list of Event ids to associate with this Badge record.
 * @param parentbadgeid, Optional. A Badge record identifier for a parent badge to this badge record, for example when a super badge is dependent on obtaining certain child badges first.
 * @param tags, Optional. A comma separated list of tag words or phrases to associate with this Badge record.
 * @return JSON with the data for new Badge record, or a JSON error object.
 */
exports.createBadge = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.title || !data.description || !data.imageurl || !data.version || !data.issuerid || !data.criterianarrative) {
		return res.status(400).send({"error": "You must include a title, description, image url, issuerid, version and criteria narrative for this badge"});
	}

	//console.log(data);

	res.locals.id = "";
	res.locals.version = data.version;
	res.locals.title = data.title;
	res.locals.description = data.description;
	res.locals.imageurl = data.imageurl;
	res.locals.imagepath = "";

	// should look up record for currently logged in user - may have more than one if data changes over time - how to manage that?
	res.locals.issuerid = data.issuerid;
	res.locals.criteriaid = "";
	res.locals.criterianarrative = data.criterianarrative;

	res.locals.parentbadgeid = 0;
	if (data.parentbadgeid && data.parentbadgeid != "") {
		try {
			res.locals.parentbadgeid = parseInt(data.parentbadgeid);
		} catch(e) {
			console.log(e);
		}
	}

	res.locals.tags = "";
	if (data.tags && data.tags != "") {
		res.locals.tags = data.tags;
	}

	res.locals.alignmentids = "";
	if (data.alignmentids) {
		res.locals.alignmentids = data.alignmentids;
	}

	res.locals.eventids = "";
	if (data.eventids) {
		res.locals.eventids = data.eventids;
	}

	let time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;
	res.locals.badgeuniqueid = web3.utils.sha3("badge_" + time);
	res.locals.criteriauniqueid = web3.utils.sha3("criteria_" + time);

	res.locals.badgeissued = false;

	// not currently used.
	//if (data.criteria) res.locals.criteria = data.criteria;
	//if (data.criteriatype) res.locals.criteriatype = data.criteriatype;
	//res.locals.criteria = "";
	//res.locals.criteriatype = "";

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				// check issuerid exists in our database.
				let selectqueryissuer = 'SELECT issuers.*, users.blockchainaccount from issuers left join users on issuers.loginuserid = users.id where issuers.id=? AND issuers.userid=?';
				let paramsissuer = [res.locals.issuerid, req.user.id];
				//var selectquery = 'SELECT * from issuers where id=? AND userid=?';
				//var params = [res.locals.issuerid, req.user.id];
				db.get().query(selectqueryissuer, paramsissuer, function(err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error checking issuer id"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "The given issuer id does not exist or does not exists in conjunction with the logged in user."});
						} else {
							if (!rows2[0].blockchainaccount || rows2[0].blockchainaccount == null || rows2[0].blockchainaccount == "") {
								res.status(404).send({error: "The given issuer does not have a blockchain account."});
							} else {
								let returnhandler = function(err, imagepath) {

									console.log("Back from image downloading handler");

									if (err && err.message && err.message != "") {
										res.status(404).send({error: err.message});
									} else if (!imagepath) {
										res.status(404).send({error: err.message});
									} else {
										res.locals.imagepath = imagepath;

										let insertquery = 'INSERT INTO badges (userid, timecreated, uniqueid, version, title, description, imageurl, imagepath, issuerid, parentbadgeid) VALUE (?,?,?,?,?,?,?,?,?,?)';
										let params = [req.user.id, res.locals.timecreated, res.locals.badgeuniqueid, res.locals.version, res.locals.title, res.locals.description, res.locals.imageurl, res.locals.imagepath, res.locals.issuerid, res.locals.parentbadgeid];
										db.get().query(insertquery, params, function(err3, result3) {
											if (err3) {
												console.log(err3);
												res.status(404).send({error: "Error saving badge data"});
											} else {
												console.log("badge saved");
												res.locals.id = result3.insertId;
												data.badgeid = result3.insertId;

												let insertquery = 'INSERT INTO criteria (userid, timecreated, uniqueid, badgeid, narrative) VALUE (?,?,?,?,?)';
												let params = [req.user.id, res.locals.timecreated, res.locals.criteriauniqueid, res.locals.id, res.locals.criterianarrative];
												db.get().query(insertquery, params, function(err4, result4) {
													if (err4) {
														console.log(err4);
														res.status(404).send({error: "Error saving criteria data"});
													} else {
														console.log("criteria saved");
														res.locals.criteriaid = result4.insertId;

														// add any criteria events
														let eventhandler = function(err, eventidarray) {

															if (err && err.message && err.message != "") {
																res.status(404).send({error: err.message});
															} else if (!eventidarray) {
																res.status(404).send({error: "Unknown error saving badge criteria events"});
															} else {

																// add any tags
																let taghandler = function(err2, tagarray) {

																	if (err2 && err2.message && err2.message != "") {
																		res.status(404).send({error: err2.message});
																	} else if (!tagarray) {
																		res.status(404).send({error: "Unknown error saving badge tags"});
																	} else {

																		// add any alignments
																		let alignmenthandler = function(err3, alignmentidarray) {

																			if (err3 && err3.message && err3.message != "") {
																				res.status(404).send({error: err3.message});
																			} else if (!alignmentidarray) {
																				res.status(404).send({error: "Unknown error saving badge alignments"});
																			} else {
																				let reply = {
																					id: res.locals.id,
																					timecreated: res.locals.timecreated,
																					badgeuniqueid: res.locals.badgeuniqueid,
																					version: res.locals.version,
																					title: res.locals.title,
																					description: res.locals.description,
																					imageurl: res.locals.imageurl,
																					imagepath: res.locals.imagepath,
																					issuerid: res.locals.issuerid,
																					parentbadgeid: res.locals.parentbadgeid,

																					criteriaid: res.locals.criteriaid,
																					criteriauniqueid: res.locals.criteriauniqueid,
																					criterianarrative: res.locals.criterianarrative,

																					tags: res.locals.tags,
																					//alignments: alignmentlist,
																					//criteriaevents: eventlist,

																					usedInIssuance: false
																				};

																				//console.log(data);

																				if (cfg.hasIoCEndorsement == true) {

																					let endorsementhandler = function(err, endorsement) {
																						if (err) {
																							res.status(404).send({error: err.message});
																						} else {
																							res.send(reply);
																						}
																					}
																					endorsement_model.addIoCEndorsementForBadge(req.user.id, res.locals.id, res.locals.timecreated, endorsementhandler);
																				} else {
																					res.send(reply);
																				}
																			}
																		}
																		addAlignments(req.user.id, res.locals.id, res.locals.alignmentids, alignmenthandler);
																	}
																}
																addBadgeTags(req.user.id, res.locals.id, res.locals.tags, taghandler);
															}
														}
														addCriteriaEvents(req.user.id, res.locals.id, res.locals.eventids, eventhandler);
													}
												});
											}
										});
									}
								}

								downloadBadgeImageFile(res.locals.imageurl, cfg.badgeimagesfolder+res.locals.badgeuniqueid+".png", returnhandler);
							}
						}
					}
				});
			}
		}
	});
}

/**
 * Update a existing Badge record.
 * @param id, Required. The record identifier of the Badge record you want to update.
 * @param title, Optional. A title for the Badge record.
 * @param description, Optional. A description the Badge record.
 * @param imageurl, Optional. An image url for the Badge record.
 * @param version, Required. A version number for the Badge record, e.g. '1.0'.
 * @param criterianarrative, Optional. A textual description of the criteria for being awarded this Badge record.
 * @param alignmentids, Optional. A  comma separatedlist of Alignment ids to associate with this Badge record.
 * @param eventids, Optional. A comma separated list of Event ids to associate with this Badge record.
 * @param parentbadgeid, Optional. A Badge record identifier for a parent badge to this badge record, for example when a super badge is dependent on obtaining certain child badges first.
 * @param tags, Optional. A comma separated list of tag words or phrases to associate with this Badge record.
 * @return JSON with the updated data for the Badge record, or a JSON error object.
 */
exports.updateBadge = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({"error": "You must include the id of the badge you want to update"});
	}

	//console.log(data);
	res.locals.data = data;

	res.locals.id = data.id;

	res.locals.version = "";
	res.locals.title = "";
	res.locals.description = "";
	res.locals.imageurl = "";
	res.locals.imagepath = "";
	res.locals.issuerid = "";

	res.locals.criteriaid = "";
	res.locals.criterianarrative = "";
	res.locals.criteriauniqueid = "";
	res.locals.usedInIssuance = true;

	res.locals.parentbadgeid = 0;
	if (data.parentbadgeid && data.parentbadgeid != "") {
		try {
			res.locals.parentbadgeid = parseInt(data.parentbadgeid);
		} catch(e) {
			console.log(e);
		}
	}

	res.locals.tags = "";
	if (data.tags && data.tags != "") {
		res.locals.tags = data.tags;
	}

	res.locals.alignmentids = "";
	if (data.alignmentids) {
		res.locals.alignmentids = data.alignmentids;
	}

	res.locals.eventids = "";
	if (data.eventids) {
		res.locals.eventids = data.eventids;
	}

	var time = Math.floor((new Date().getTime()) / 1000);

	// not currently used.
	//if (data.criteria) res.locals.criteria = data.criteria;
	//if (data.criteriatype) res.locals.criteriatype = data.criteriatype;
	//res.locals.criteria = "";
	//res.locals.criteriatype = "";

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				db.get().query('SELECT badges.*, criteria.id as criteriaid, criteria.uniqueid as criteriauniqueid, criteria.narrative, users.blockchainaccount from badges left join issuers on badges.issuerid = issuers.id left join users on issuers.loginuserid = users.id left join criteria on badges.id = criteria.badgeid where badges.userid=? and badges.id=?', [req.user.id, res.locals.data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching badge record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No badge record found with the given id for the currently logged in user"});
						} else {

							res.locals.criteriaid = rows2[0].criteriaid;
							res.locals.criteriauniqueid = rows2[0].criteriauniqueid;
							res.locals.badgeuniqueid = rows2[0].uniqueid;

							// Checked not used in an badge of had the rdfstore contract created (issue process underway)
							let query = 'SELECT badge_issued.* from badge_issued left join badges on badges.id = badge_issued.badgeid '
							query += 'where badges.userid=? and badgeid=? and badge_issued.status in ("issued","revoked")';
							db.get().query(query, [req.user.id, res.locals.data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error checking badge record not used to issue a badge"});
								} else {
									if (rows3.length > 0) {
										res.status(404).send({error: "This badge record has been used to issue a badge and therefore can't be edited"});
									} else {
										res.locals.timecreated = rows2[0].timecreated;
										res.locals.imagepath = rows[0].imagepath;
										res.locals.issued = false;
										res.locals.usedInIssuance = false;

										let params = [];

										let setquery = "";

										if (res.locals.data.title && res.locals.data.title != "") {
											setquery += "title=?"
											params.push(res.locals.data.title);
											res.locals.title = res.locals.data.title
										} else {
											res.locals.title = rows2[0].title;
										}

										if (res.locals.data.version && res.locals.data.version != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "version=?"
											params.push(res.locals.data.version);
											res.locals.version = res.locals.data.version;
										} else {
											res.locals.version = rows2[0].version;
										}

										if (res.locals.data.description && res.locals.data.description != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "description=?"
											params.push(res.locals.data.description);
											res.locals.description = res.locals.data.description;
										} else {
											res.locals.description = rows2[0].description;
										}

										var imageChanged = false;
										if (res.locals.data.imageurl && res.locals.data.imageurl != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "imageurl=?"
											params.push(res.locals.data.imageurl);
											res.locals.imageurl = res.locals.data.imageurl;

											if (rows2[0].imageurl != "" && rows2[0].imageurl != null && data.imageurl != rows2[0].imageurl) {
												imageChanged = true;
											}
										} else {
											res.locals.imageurl = rows2[0].imageurl;
										}

										if (res.locals.data.issuerid && res.locals.data.issuerid != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "issuerid=?"
											params.push(res.locals.data.issuerid);

											res.locals.issuerid = res.locals.data.issuerid;
										} else {
											res.locals.issuerid = rows2[0].issuerid;
										}

										if (res.locals.data.parentbadgeid && res.locals.data.parentbadgeid != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "parentbadgeid=?"
											params.push(res.locals.parentbadgeid);
										} else {
											res.locals.issuerid = rows2[0].parentbadgeid;
										}

										res.locals.setquery = setquery;

										let handleUpdate = function() {

											if (res.locals.setquery != "") {
												let updatequery = "UPDATE badges";
												updatequery += " SET "+res.locals.setquery;
												updatequery += " WHERE userid=? AND id=?";

												//console.log(updatequery);

												params.push(req.user.id);
												params.push(res.locals.data.id);

												// check issuerid exists in our database and get account.
												let selectqueryissuer = 'SELECT issuers.*, users.blockchainaccount from issuers left join users on issuers.loginuserid = users.id where issuers.id=? AND issuers.userid=?';
												let paramsissuer = [res.locals.issuerid, req.user.id];
												db.get().query(selectqueryissuer, paramsissuer, function(err7, rows7) {
													if (err7) {
														console.log(err7);
														res.status(404).send({error: "Error checking issuer id"});
													} else {
														if (rows7.length == 0) {
															res.status(404).send({error: "The given issuer id does not exist or does not exists in conjunction with the logged in user."});
														} else {
															db.get().query(updatequery, params, function(err4, results4) {
																if (err4) {
																	console.log(err4);
																	res.status(404).send({error: "Error updating badge record."});
																} else {
																	console.log("badge record updated");

																	// delete any existing tags before they are then re-added
																	db.get().query('Delete from badge_tags where userid=? and badgeid=?', [req.user.id, res.locals.data.id], function(err6, results6) {
																		if (err6) {
																			console.log(err6);
																			res.status(404).send({error: "Error removing tag records."});
																		} else {
																			console.log("tag records removed");

																			// delete any existing badge alignment associations before they are re-added.
																			db.get().query('Delete from badge_alignments where userid=? and badgeid=?', [req.user.id, res.locals.data.id], function(err7, results7) {
																				if (err7) {
																					console.log(err7);
																					res.status(404).send({error: "Error removing badge alignment association records."});
																				} else {
																					console.log("badge alignment association records removed");

																					// delete any existing badge criteria event associations before they are re-added.
																					db.get().query('Delete from criteria_events where userid=? and criteriaid=(select criteria.id from criteria where badgeid=?)', [req.user.id, res.locals.data.id], function(err7, results7) {
																						if (err7) {
																							console.log(err7);
																							res.status(404).send({error: "Error removing badge alignment association records."});
																						} else {
																							console.log("badge alignment association records removed");

																							// add any criteria events
																							let eventhandler = function(err, eventidarray) {

																								if (err && err.message && err.message != "") {
																									res.status(404).send({error: err.message});
																								} else if (!eventidarray) {
																									res.status(404).send({error: "Unknown error saving badge criteria events"});
																								} else {

																									// add any tags
																									let taghandler = function(err2, tagarray) {
																										if (err2 && err2.message && err2.message != "") {
																											res.status(404).send({error: err2.message});
																										} else if (!tagarray) {
																											res.status(404).send({error: "Unknown error saving badge tags"});
																										} else {

																											// add any alingments
																											let alignmenthandler = function(err3, alignmentidarray) {
																												if (err3 && err3.message && err3.message != "") {
																													res.status(404).send({error: err3.message});
																												} else if (!alignmentidarray) {
																													res.status(404).send({error: "Unknown error saving badge alignments"});
																												} else {

																													let reply = {
																														id: res.locals.id,
																														timecreated: res.locals.timecreated,
																														badgeuniqueid: res.locals.badgeuniqueid,
																														version: res.locals.version,
																														title: res.locals.title,
																														description: res.locals.description,
																														imageurl: res.locals.imageurl,
																														imagepath: res.locals.imagepath,
																														issuerid: res.locals.issuerid,
																														parentbadgeid: res.locals.parentbadgeid,
																														criteriaid: res.locals.criteriaid,
																														criteriauniqueid: res.locals.criteriauniqueid,
																														criterianarrative: res.locals.criterianarrative,
																														usedInIssuance: res.locals.usedInIssuance,
																														//alignments: alignmentlist,
																														//criteriaevents: eventlist,
																														tags: res.locals.tags,
																													};

																													//console.log(reply);

																													// update Criteria narrative if required
																													if (res.locals.data.criterianarrative && res.locals.data.criterianarrative != ""
																																	&& res.locals.data.criterianarrative != rows2[0].narrative) {
																														reply.criterianarrative = res.locals.data.criterianarrative;

																														// updae criteria table
																														let updatequerycriteria = "UPDATE criteria set narrative=? where userid=? and id=?";
																														let params2 = [reply.criterianarrative, req.user.id, res.locals.criteriaid];

																														db.get().query(updatequerycriteria, params2, function(err5, results5) {
																															if (err5) {
																																console.log(err5);
																																res.status(404).send({error: "Error updating criteria record."});
																															} else {
																																console.log("criteria record updated");
																																res.send(reply);
																															}
																														});
																													} else {
																														reply.criterianarrative = rows2[0].narrative;
																														res.send(reply);
																													}
																												}
																											}
																											addAlignments(req.user.id, res.locals.id, res.locals.alignmentids, alignmenthandler);
																										}
																									}
																									addBadgeTags(req.user.id, res.locals.id, res.locals.tags, taghandler);
																								}
																							}
																							addCriteriaEvents(req.user.id, res.locals.id, res.locals.eventids, eventhandler);
																						}
																					});
																				}
																			});
																		}
																	});
																}
															});
														}
													}
												});
											} else {
												let reply = {
													id: res.locals.id,
													timecreated: res.locals.timecreated,
													badgeuniqueid: res.locals.badgeuniqueid,
													version: res.locals.version,
													title: res.locals.title,
													description: res.locals.description,
													imageurl: res.locals.imageurl,
													imagepath: res.locals.imagepath,
													issuerid: res.locals.issuerid,
													parentbadgeid: res.locals.parentbadgeid,
													criteriaid: res.locals.criteriaid,
													criteriauniqueid: res.locals.criteriauniqueid,
													criterianarrative: res.locals.criterianarrative,
													usedInIssuance: res.locals.usedInIssuance,
													//alignments: alignmentlist,
													//criteriaevents: eventlist,
													tags: res.locals.tags,
												};

												//console.log(reply);

												// update Criteria narrative if required
												if (res.locals.data.criterianarrative && res.locals.data.criterianarrative != ""
															&& res.locals.data.criterianarrative != rows2[0].narrative) {
													reply.criterianarrative = res.locals.data.criterianarrative;

													// update criteria table
													let updatequerycriteria = "UPDATE criteria set narrative=? where userid=? and id=?";
													let params2 = [reply.criterianarrative, req.user.id, res.locals.criteriaid];

													db.get().query(updatequerycriteria, params2, function(err5, results5) {
														if (err5) {
															console.log(err5);
															res.status(404).send({error: "Error updating criteria record."});
														} else {
															console.log("criteria record updated");
															res.send(reply);
														}
													});
												} else {
													reply.criterianarrative = rows2[0].narrative;
													res.send(reply);
												}
											}
										}

										if (imageChanged) {
											let imagehandler = function(err, imagepath) {
												if (err && err.message && err.message != "") {
													res.status(404).send({error: err.message});
												} else if (!imagepath) {
													res.status(404).send({error: err.message});
												} else {
													res.locals.imagepath = imagepath;
													handleUpdate();
												}
											}
											downloadBadgeImageFile(res.locals.imageurl, cfg.badgeimagesfolder+res.locals.badgeuniqueid+".png", imagehandler);
										} else {
											handleUpdate();
										}
									}
								}
							});
						}
					}
				});
			}
		}
	});
}

/**
 * Delete a Badge record.
 * @param id, Required. The record identifier of the Badge you wish to delete.
 * @return JSON with the id of the Badge record that was deleted and a status property of -1, or a JSON error object.
 */
exports.deleteBadge = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send({"error": "You must include the id for the badge you want to delete"});
	}

	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT * from badges WHERE badges.userid=? and badges.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching badge record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No badge record found with the given id for the currently logged in user"});
						} else {
							// Checked not used in an badge of had the rdfstore contract created (issue process underway)
							let query = 'SELECT badge_issued.* from badge_issued left join badges on badges.id = badge_issued.badgeid '
							query += 'where badges.userid=? and badge_issued.badgeid=? and (badge_issued.status in ("issued","revoked") or badges.blockchainaddress IS NOT NULL)';
							db.get().query(query, [req.user.id, res.locals.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error checking badge record not used to issue a badge"});
								} else {
									if (rows3.length > 0) {
										res.status(404).send({error: "This badge record has been used to issue a badge and therefore can't be deleted"});
									} else {
										let updatequery = "DELETE from badges WHERE userid=? AND id=?";
										let params = [req.user.id, res.locals.id];

										db.get().query(updatequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												res.status(404).send({error: "Error deleting badge record."});
											} else {
												console.log("badge record deleted");

												let localhandler = function(err, reply) {
													if (err && err.message != "") {
														res.status(404).send({error: err.message});
													} else {
														let reply = {}
														reply.id = res.locals.id;
														reply.status = -1;

														res.send(reply);
													}
												}
												endorsement_model.removeEndorsementsForBadge(req.user.id, data.id, localhandler);
											}
										});
									}
								}
							});
						}
					}
				});
			}
		}
	});
}

/**
 * Get a list of all badge records for the currently logged in user (issuer).
 * @return JSON with an object with key 'badges' pointing to an array of the Badge records, or a JSON error object.
 */
exports.listBadges = function(req, res, next) {

	res.locals.badges = [];

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				// get if used? - count records in badge_issued table as usecount?
				var query = 'SELECT badges.*, criteria.id as criteriaid, criteria.uniqueid as criteriauniqueid, criteria.narrative from badges left join criteria on badges.id = criteria.badgeid left join issuers on badges.issuerid = issuers.id where issuers.loginuserid=?'
				db.get().query(query, [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving badge records"});
					} else {
						db.get().query('SELECT badges.id, GROUP_CONCAT(tag) as tags from badges left join badge_tags on badges.id=badge_tags.badgeid where badges.id in (SELECT badges.id from badges left join issuers on badges.issuerid = issuers.id where issuers.loginuserid=?) group by badges.id', [req.user.id], function (err3, rows3) {
							if (err3) {
								console.log(err3);
								return res.status(404).send({"error": "Error retrieving badge tag records"});
							} else {
								if (rows2.length > 0) {
									let i=0;
									function loop() {
										let next = rows2[i];

										res.locals.badges[i] = {};
										res.locals.badges[i].id = next["id"];
										res.locals.badges[i].timecreated = next["timecreated"];
										res.locals.badges[i].badgeuniqueid = next["uniqueid"];
										res.locals.badges[i].version = next["version"];

										res.locals.badges[i].title = next["title"];
										res.locals.badges[i].description = next["description"];
										res.locals.badges[i].imageurl = next["imageurl"];
										res.locals.badges[i].imagepath = next["imagepath"];
										res.locals.badges[i].issuerid = next["issuerid"];
										res.locals.badges[i].parentbadgeid = next["parentbadgeid"];


										res.locals.badges[i].criteriaid = next["criteriaid"];
										res.locals.badges[i].criteriauniqueid = next["criteriauniqueid"];
										res.locals.badges[i].criterianarrative = next["narrative"];

										res.locals.badges[i].tags = "";
										if (rows3.length > 0) {
											for (let j=0; j<rows3.length; j++) {
												if (rows3[j].id == next["id"]) {
													res.locals.badges[i].tags = rows3[j].tags;
													break;
												}
											}
										}

										let sql = 'SELECT * from badge_issued where badge_issued.badgeid=? and badge_issued.status in ("issued","revoked")';
										db.get().query(sql, [next["id"]], function (err4, rows4) {
											if (err4) {
												console.log(err4);
												return res.status(404).send("Error checking badge record not issued");
											} else {
												if (rows4.length > 0) {
													res.locals.badges[i].usedInIssuance = true;
												} else {
													res.locals.badges[i].usedInIssuance = false;
												}
												i++;
												if( i < rows2.length) {
													loop();
												} else {
													res.send({badges: res.locals.badges});
												}
											}
										});
									}
									loop();
								} else {
									res.send({badges: res.locals.badges});
								}
							}
						});
					}
				});
			}
		}
	});
}

/**
 * Get a Badge record by it's record identifier.
 * @param id, Required. The identifier of the Badge record you wish to retrieve.
 * @return JSON with badge record data or a JSON error object.
 */
exports.getBadgeById = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({"error": "You must include the id for the badge you want to get the data for"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("admin", "super", "issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT badges.*, criteria.id as criteriaid, criteria.uniqueid as criteriauniqueid,criteria.narrative from badges left join criteria on badges.id = criteria.badgeid where badges.id=? and (badges.userid=? or badges.issuerid=(select id from issuers where loginuserid=?) )', [data.id, req.user.id, req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving badge record"});
					} else {
						db.get().query('SELECT badges.id, GROUP_CONCAT(tag) as tags from badges left join badge_tags on badges.id=badge_tags.badgeid where badges.userid=? and badges.id=?', [req.user.id, data.id], function (err3, rows3) {
							if (err3) {
								console.log(err3);
								return res.status(404).send({"error": "Error retrieving badge tag records"});
							} else {
								if (rows2.length > 0) {
									let next = rows2[0];

									let badge = {};

									badge.id = next["id"];
									badge.timecreated = next["timecreated"];
									badge.badgeuniqueid = next["uniqueid"];
									badge.version = next["version"];

									badge.title = next["title"];
									badge.description = next["description"];
									badge.imageurl = next["imageurl"];
									badge.imagepath = next["imagepath"];
									badge.issuerid = next["issuerid"];
									badge.parentbadgeid = next["parentbadgeid"];

									badge.criteriaid = next["criteriaid"];
									badge.criteriauniqueid = next["criteriauniqueid"];
									badge.criterianarrative = next["narrative"];

									badge.tags = "";
									if (rows3.length > 0) {
										badge.tags = rows3[0].tags;
									}

									let sql = 'SELECT * from badge_issued where badge_issued.badgeid=? and badge_issued.status in ("issued","revoked")';
									db.get().query(sql, [next["id"]], function (err4, rows4) {
										if (err4) {
											console.log(err4);
											return res.status(404).send("Error checking badge record not issued");
										} else {
											if (rows4.length > 0) {
												badge.usedInIssuance = true;
											} else {
												badge.usedInIssuance = false;
											}

											res.send(badge);
										}
									});

								} else {
									return res.status(404).send({"error": "No badge record found with the given id for the currently logged in user"});
								}
							}
						});
					}
				});
			}
		}
	});
}

/**
 * View Badge type RDFStore contract details from blockchain contract address
 * @param address, Required. The blockchain contract address of the badge type you want to get the details for.
 * @return JSON object with address, owner, items; where items are strings of the RDF triples for the JSONLD data of the Badge type this contract is related to
 */
exports.getBadgeByAddress = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.address) {
		return res.status(400).send({error: "You must include the address of the badge you want to get"});
	}

	db.get().query('SELECT * from badges where blockchainaddress=?', [data.address], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching badge by contract address"});
		} else {
			//console.log(rows);
			if (rows.length == 0) {
				res.status(404).send({error: "The badge contract address you have given does not exist."});
			} else {
				let handler = function(err, reply) {
					if (err && err.message && err.message != "") {
						res.status(404).send({error: err.message});
					} else if (reply) {
						res.send(reply);
					} else {
						res.status(404).send({error: "Unknown error getting badge blockchain data for address: "+data.address});
					}
				}
				getBadgeContractData(data.address, handler);
			}
		}
	});
}

/**
 * Get a list of all Criteria Event records associated with the given Badge record identifier.
 * @param id, Required. The record identifier of the Badge you wish to get the Criteria events for.
 * @return JSON with an object with key 'events' pointing to an array of the Critera Event records, or a JSON error object.
 */
exports.listCriteriaEvents = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id || data.id == "") {
		return res.status(400).send({"error": "You must include the id for the badge you want to get the criteria events for"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {

				// Either the owner of the events or criteria or the badge or the issuer of a badge can see it's criteria events
				let query = "SELECT events.* FROM events ";
				query += "left join criteria_events on events.id = criteria_events.eventid ";
				query += "left join criteria on criteria.id = criteria_events.criteriaid ";
				query += "left join badges on criteria.badgeid = badges.id ";
				query += "left join issuers on issuers.id = badges.issuerid ";
				query += "WHERE criteria.badgeid=? AND ((events.userid=? and criteria.userid=?) OR (badges.userid=?) OR (issuers.loginuserid=?))";

				db.get().query(query, [data.id, req.user.id, req.user.id, req.user.id, req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving badge criteria event records"});
					} else {
						let events = [];
						if (rows2.length > 0) {
							for (let i=0; i<rows2.length; i++) {
								let next = rows2[i];
								let eventobj = {};

								eventobj.id = next["id"];
								eventobj.timecreated = next["timecreated"];
								eventobj.uniqueid = next["uniqueid"];
								eventobj.name = next["name"];
								eventobj.description = next["description"];
								eventobj.startdate = next["startdate"];
								eventobj.enddate = next["enddate"];

								eventobj.location_name = next["location_name"];
								eventobj.location_pobox = next["location_pobox"];
								eventobj.location_streetaddress = next["location_streetaddress"];
								eventobj.location_locality = next["location_locality"];
								eventobj.location_region = next["location_region"];
								eventobj.location_country = next["location_country"];
								eventobj.location_postcode = next["location_postcode"];

								events.push(eventobj);
							}
						}
						res.send({events: events});
					}
				});
			}
		}
	});
}

/**
 * Get a list of all Alignment records associated with the given Badge record identifier.
 * @param id, Required. The record identifier of the Badge you wish to get the Alignments for.
 * @return JSON with an object with key 'alignments' pointing to an array of the Alignment records, or a JSON error object.
 */
exports.listAlignments = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id || data.id == "") {
		return res.status(400).send({"error": "You must include the id for the badge you want to get the alignments for"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {

				// Either the owner of the alignments or the badge or the issuer of a badge can see it's alignments
				let query = "SELECT alignments.* FROM alignments ";
				query += "left join badge_alignments on alignments.id = badge_alignments.alignmentid ";
				query += "left join badges on badge_alignments.badgeid = badges.id ";
				query += "left join issuers on issuers.id = badges.issuerid ";
				query += "WHERE badge_alignments.badgeid=? AND ((alignments.userid=? and badge_alignments.userid=?) OR (badges.userid=?) OR (issuers.loginuserid=?))";

				db.get().query(query, [data.id, req.user.id, req.user.id, req.user.id, req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving badge alignment records"});
					} else {
						let alignments = [];
						if (rows2.length > 0) {
							for (let i=0; i<rows2.length; i++) {
								let next = rows2[i];
								let alignment = {};

								alignment.id = next["id"];
								alignment.timecreated = next["timecreated"];
								alignment.url = next["targetid"];
								alignment.name = next["targetname"];
								alignment.description = next["targetdescription"];
								alignment.code = next["targetcode"];
								alignment.framework = next["targetframework"];

								alignments.push(alignment);
							}
						}
						res.send({alignments: alignments});
					}
				});
			}
		}
	});
}

/**
 * Get a list of all badge records (super and admin permissions only).
 * @return JSON with an object with key 'badges' pointing to an array of the Badge records, or a JSON error object.
 */
exports.listAllBadges = function(req, res, next) {

	res.locals.badges = [];

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				// get if used? - count records in issued table as usecount?
				db.get().query('SELECT badges.*, criteria.id as criteriaid, criteria.uniqueid as criteriauniqueid,criteria.narrative from badges left join criteria on badges.id = criteria.badgeid where badges.userid=?', [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving badge records"});
					} else {
						db.get().query('SELECT badges.id, GROUP_CONCAT(tag) as tags from badges left join badge_tags on badges.id=badge_tags.badgeid where badges.userid=? group by badges.id', [req.user.id], function (err3, rows3) {
							if (err3) {
								console.log(err3);
								return res.status(404).send({"error": "Error retrieving badge tag records"});
							} else {
								if (rows2.length > 0) {
									let i=0;
									function loop() {
										let next = rows2[i];

										res.locals.badges[i] = {};
										res.locals.badges[i].id = next["id"];
										res.locals.badges[i].timecreated = next["timecreated"];
										res.locals.badges[i].badgeuniqueid = next["uniqueid"];
										res.locals.badges[i].version = next["version"];

										res.locals.badges[i].title = next["title"];
										res.locals.badges[i].description = next["description"];
										res.locals.badges[i].imageurl = next["imageurl"];
										res.locals.badges[i].imagepath = next["imagepath"];
										res.locals.badges[i].issuerid = next["issuerid"];
										res.locals.badges[i].parentbadgeid = next["parentbadgeid"];

										res.locals.badges[i].criteriaid = next["criteriaid"];
										res.locals.badges[i].criteriauniqueid = next["criteriauniqueid"];
										res.locals.badges[i].criterianarrative = next["narrative"];

										res.locals.badges[i].tags = "";
										if (rows3.length > 0) {
											for (let j=0; j<rows3.length; j++) {
												if (rows3[j].id == next["id"]) {
													res.locals.badges[i].tags = rows3[j].tags;
													break;
												}
											}
										}

										let sql = 'SELECT * from badge_issued where badge_issued.badgeid=? and badge_issued.status in ("issued","revoked")';
										db.get().query(sql, [next["id"]], function (err4, rows4) {
											if (err4) {
												console.log(err4);
												return res.status(404).send("Error checking badge record not issued");
											} else {
												if (rows4.length > 0) {
													res.locals.badges[i].usedInIssuance = true;
												} else {
													res.locals.badges[i].usedInIssuance = false;
												}
												i++;
												if( i < rows2.length) {
													loop();
												} else {
													res.send({badges: res.locals.badges});
												}
											}
										});
									}
									loop();
								} else {
									res.send({badges: res.locals.badges});
								}
							}
						});
					}
				});
			}
		}
	});
}

/************************************************************************
 *                                                                      *
 * 							BADGE IMAGE FUNCTIONS                       *
 *                                                                      *
 ************************************************************************/


/**
 * Get the Badge image management page for the currently logged in administrator.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for badge image management or error page with error message.
 */
exports.getBadgeImageManagementPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				res.render('badgeimagecreator', { title: 'Create Badge Images'});
			}
		}
	});
}

/**
 * Create a new Badge image.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param name, Required. A title for the new Badge image record.
 * @param json, Required. JSON holding the specification details of the badge image creation.
 * @return JSON with the data for new Badge image record, or a JSON error object.
 */
exports.createBadgeImage = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.name || !data.json) {
		return res.status(400).send({"error": "You must include the name for this badge image and the json for the badge image you want to save"});
	}
	//console.log(data);

	res.locals.id = "";
	res.locals.name = data.name;
	res.locals.json = data.json;

	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {

				let insertquery = 'INSERT INTO badge_images (userid, timecreated, name, json) VALUE (?,?,?,?)';
				let params = [req.user.id, res.locals.timecreated, res.locals.name, res.locals.json];
				db.get().query(insertquery, params, function(err2, result2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error saving badge image data"});
					} else {
						console.log("badge image saved");
						res.locals.id = result2.insertId;

						let reply = {
							id: res.locals.id,
							timecreated: res.locals.timecreated,
							name: res.locals.name,
							json: res.locals.json,
							url: null,
							usedInBadge: false
						};
						//console.log(reply);

						res.send(reply);
					}
				});
			}
		}
	});
}

/**
 * Update an existing Badge image.
 * @param id, Required. The identifier of the Badge image record you wish to retrieve.
 * @param name, Optional. A title for the Badge image record.
 * @param json, Optional. JSON holding the specification details of the badge image creation.
 * @return JSON with the data for new Badge image record, or a JSON error object.
 */
exports.updateBadgeImage = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({"error": "You must include the id of the badge image you want to update and the json of the badge image data"});
	}

	//console.log(data);

	res.locals.id = data.id;

	res.locals.name = "";
	if (data.name && data.name != null) {
		res.locals.name = data.name;
	}
	res.locals.json = "";
	if (data.json && data.json != null) {
		res.locals.json = data.json;
	}

	res.locals.timecreated = 0;

	res.locals.usedInBadge = false;

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				db.get().query('SELECT badge_images.* FROM badge_images where badge_images.userid=? and badge_images.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching badge image record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No badge image record found with the given id for the currently logged in user"});
						} else {
							res.status(404).send({error: rows2[0].timecreated});

							db.get().query('SELECT * FROM badges where badges.imageurl=?', [rows2[0].url], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error checking is badge image has been used in an issuance"});
								} else {
									if (rows3.length != 0) {
										res.status(404).send({error: "This image has been used in an issued badge and cannot now be modified."});
									} else {

										let params = [];
										let setquery = "";

										if (res.locals.json != ""  && res.locals.json != rows2[0].json) {
											setquery += "json=?";
											params.push(res.locals.json);
										} else {
											res.locals.json = rows2[0].json;
										}

										if (res.locals.name != ""  && res.locals.name != rows2[0].name) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "name=?";
											params.push(res.locals.name);
										} else {
											res.locals.name = rows2[0].name;
										}

										// if they edit the record in some way - unpublish it.
										if (setquery != "" && rows2[0].url && rows2[0].url != "" && rows2[0].url != null) {
											setquery += ", url=NULL";
										}

										let reply = {
											id: res.locals.id,
											timecreated: res.locals.timecreated,
											name: res.locals.name,
											json: res.locals.json,
											url: null,
											usedInBadge: res.locals.usedInBadge,
										};
										//console.log(reply);

										// if no data has changed just end.
										if (setquery == "") {
											res.send(reply);
										} else {
											let updatequery = "UPDATE badge_images SET ";
											updatequery += setquery;
											updatequery += " WHERE userid=? AND id=?";

											params.push(req.user.id);
											params.push(res.locals.id);

											db.get().query(updatequery, params, function(err4, results4) {
												if (err4) {
													console.log(err4);
													res.status(404).send({error: "Error updating badge image record."});
												} else {
													console.log("badge image record updated");

													// clean up published image file, if there is one.
													if (rows2[0].url && rows2[0].url != "" && rows2[0].url != null) {

														let url = rows2[0].url;
														let userdir = req.user.id + req.user.created + "";
														let userfolder = web3.utils.sha3(userdir);
														let path = cfg.directorpath+"public/images/badges/"+userfolder+"/";
														// get filename from url
														let filename = url.split('/').pop().split('#')[0].split('?')[0];
														let file = path + filename;

														//console.log(file);
														if (fs.existsSync(path)){
															fs.unlink(file, function (err) {
																if (err) {
																	console.log("error deleting associed file: "+file);
																}

																// if no error, file has been deleted successfully
																console.log('File deleted!');
																res.send(reply);
															});
														}
													} else {
														res.send(reply);
													}
												}
											});
										}
									}
								}
							});
						}
					}
				});
			}
		}
	});
}

/**
 * Publich a Badge image to the server.
 * @param id, Required. The record identifier of the Badge image you wish to publish.
 * @param imagedata, Required. The base64 image data for the image you wish to publish.
 * @return JSON with properties: 'id','timecreated','name','json','url' and 'usedInBadge', or a JSON error object.
 */
exports.publishBadgeImage = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id || !data.imagedata) {
		return res.status(400).send({"error": "You must include the id and the base64 image data of the badge image you want to publish"});
	}

	//console.log(data);

	res.locals.id = data.id;
	res.locals.imagedata = data.imagedata;

	res.locals.name = "";
	res.locals.json = "";
	res.locals.timecreated = 0;
	res.locals.usedInBadge = false;
	res.locals.url = "";

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				db.get().query('SELECT badge_images.* FROM badge_images where badge_images.userid=? and badge_images.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching badge image record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No badge image record found with the given id for the currently logged in user"});
						} else {
							res.locals.name = rows2[0].name;
							res.locals.json = rows2[0].json;
							res.locals.timecreated = rows2[0].timecreated;

							db.get().query('SELECT * FROM badges where badges.imageurl=?', [rows2[0].url], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error checking is badge image has been used in an issuance"});
								} else {
									if (rows3.length != 0) {
										res.status(404).send({error: "This image has been used in an issued badge and cannot now be re-publised."});
									} else {
										let userdir = req.user.id + req.user.created + "";
										let userfolder = web3.utils.sha3(userdir);
										let path = cfg.directorpath+"public/images/badges/"+userfolder+"/";

										let proceedHandler = function() {
											let base64Image = res.locals.imagedata.split(';base64,').pop();
											let filename = res.locals.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
											filename += "_"+res.locals.id;

											if (!fs.existsSync(path)){
												fs.mkdirSync(path);
											}
											let filepath = path+filename+".png";
											fs.writeFile(filepath, base64Image, {encoding: 'base64'}, function(err) {
												console.log('File created');
												let url = cfg.uri_stub+"images/badges/"+userfolder+"/"+filename+".png";;
												res.locals.url = url;

												let updatequery = "UPDATE badge_images SET url=? WHERE userid=? AND id=?";
												db.get().query(updatequery, [res.locals.url, req.user.id, res.locals.id], function(err4, results4) {
													if (err4) {
														console.log(err4);
														res.status(404).send({error: "Error updating badge image record for new url"});
													} else {
														console.log("badge image record updated");
														let reply = {
															id: res.locals.id,
															timecreated: res.locals.timecreated,
															name: res.locals.name,
															json: res.locals.json,
															url: res.locals.url,
															usedInBadge: res.locals.usedInBadge,
														};
														//console.log(reply);

														res.send(reply);
													}
												});
											});
										}

										// If badge already published remove any published file before proceeding to create a new one
										let url = rows2[0].url;
										if (url && url != "" && url != null) {
											// get filename from url
											let filename = url.split('/').pop().split('#')[0].split('?')[0];
											let file = path + filename;
											if (fs.existsSync(path)) {
												fs.unlinkSync(file);
												// if it fails for some reason I guess we don't pick it up.
												// otherwise hard to do next section of code.
												proceedHandler();
											} else {
												proceedHandler();
											}
										} else {
											proceedHandler();
										}
									}
								}
							});
						}
					}
				});
			}
		}
	});
}

/**
 * Delete a Badge image record.
 * @param id, Required. The record identifier of the Badge image you wish to delete.
 * @return JSON with the id of the Badge image record that was deleted and a status property of -1, or a JSON error object.
 */
exports.deleteBadgeImage = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send({"error": "You must include the id for the badge image you want to delete"});
	}

	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT * from badge_images WHERE badge_images.userid=? and badge_images.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching badge image record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No badge image record found with the given id for the currently logged in user"});
						} else {
							db.get().query('SELECT * FROM badges where badges.imageurl=?', [rows2[0].url], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error checking is badge image has been used in an issuance"});
								} else {
									if (rows3.length != 0) {
										res.status(404).send({error: "This image has been used in an issued badge and cannot now be deleted."});
									} else {
										let updatequery = "DELETE from badge_images WHERE userid=? AND id=?";
										let params = [req.user.id, res.locals.id];

										db.get().query(updatequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												res.status(404).send({error: "Error deleting badge image record."});
											} else {
												console.log("badge record deleted");

												// clean up any published file if there is one.
												let url = rows2[0].url;
												let userdir = req.user.id + req.user.created + "";
												let userfolder = web3.utils.sha3(userdir);
												let path = cfg.directorpath+"public/images/badges/"+userfolder+"/";
												// get filename from url
												let filename = url.split('/').pop().split('#')[0].split('?')[0];
												let file = path + filename;

												if (fs.existsSync(path)){
													fs.unlink(file, function (err) {
													    if (err) {
															console.log("error deleting file: "+file);
														}

													    // if no error, file has been deleted successfully
													    console.log('File deleted');
														let reply = {}
														reply.id = res.locals.id;
														reply.status = -1;
														res.send(reply);
													});
												} else {
													console.log('No File to delete');
													let reply = {}
													reply.id = res.locals.id;
													reply.status = -1;
													res.send(reply);
												}
											}
										});
									}
								}
							});
						}
					}
				});
			}
		}
	});
}

/**
 * Get a list of all Badge image records for the currently logged in user.
 * @return JSON object with the property 'badgeimages' pointing to an array containing objects with the properties: 'id','timecreated','name','json','url' and 'usedInBadge', or a JSON error object.
 */
exports.listBadgeImages = function(req, res, next) {

	res.locals.badgeimages = [];

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				var query = "SELECT badge_images.* FROM badge_images WHERE badge_images.userid=?";
				db.get().query(query, [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving badge image records"});
					} else {
						let badgeimages = [];
						if (rows2.length > 0) {

							let i=0;
							function loop() {
								let next = rows2[i];
								res.locals.badgeimages[i] = {};

								res.locals.badgeimages[i].id = next["id"];
								res.locals.badgeimages[i].timecreated = next["timecreated"];
								res.locals.badgeimages[i].name = next["name"];
								res.locals.badgeimages[i].json = next["json"];
								res.locals.badgeimages[i].url = next["url"];

								db.get().query('SELECT * FROM badges where badges.imageurl=?', [next["url"]], function (err4, rows4) {
									if (err4) {
										console.log(err4);
										return res.status(404).send("Error checking badge record not issued");
									} else {
										if (rows4.length > 0) {
											res.locals.badgeimages[i].usedInBadge = true;
										} else {
											res.locals.badgeimages[i].usedInBadge = false;
										}
										i++;
										if( i < rows2.length) {
											loop();
										} else {
											res.send({badgeimages: res.locals.badgeimages});
										}
									}
								});
							}
							loop();
						} else {
							res.send({badgeimages: res.locals.badgeimages});
						}
					}
				});
			}
		}
	});
}

/************************************************************************
 *                                                                      *
 * NON ROUTED HELPER FUNCTIONS WHICH CAN BE CALLED BY OTHER MODEL FILES *
 *                                                                      *
 ************************************************************************/

/**
 * Create the JSONLD for the badge and store it in an RDFSTore contract on the blockchain
 */
exports.createRDFStoreForBadge = function(badgeid, issueraccount, handler) {

	var rdfcontractabi = cfg.contracts.rdfdatastore.abi;
	var rdfcontractbinary = cfg.contracts.rdfdatastore.binary;

	var innerhandler = function(err, badgejson) {

		if (err && err.message && err.message != "") {
			handler(err);
		} else if (!badgejson) {
			handler(new Error("Unknown error getting badge JSON for: "+badgeid));
		} else {

			let innerhandler2 = function(err, reply) { // object with quads and transactions
				console.log("BACK");
				console.log(badgejson);

				var returnobj = {}
				returnobj.badgejson = badgejson;
				returnobj.rdfstorecontract = reply.rdfstorecontract;

				handler(err, returnobj);
			}
			createRDFStore(badgeid, badgejson, issueraccount, innerhandler2);
		}
	}
	exports.getBadgeOpenBadgeJSON(badgeid, innerhandler);
}

// No security checks. Public Data
exports.getBadgeOpenBadgeJSON = function(badgeid, handler) {

	// check all expected variables exist, e.g.
	if (!badgeid) {
		handler(new Error("You must include the id for the badge you want to get the JSON data for"));
	}

	var badgejson = {};

	let query = 'SELECT badges.*, criteria.id as criteriaid, criteria.uniqueid as criteriauniqueid, criteria.narrative from badges '
	query += 'left join criteria on badges.id = criteria.badgeid left join issuers on badges.issuerid = issuers.id ';
	query += 'WHERE badges.id=?';

	let params = [badgeid];
	db.get().query(query, params, function (err2, rows2) {
		if (err2) {
			console.log(err2);
			handler(new Error("Error retrieving badge record"));
		} else {
			db.get().query('SELECT badges.id, GROUP_CONCAT(tag) as tags from badges left join badge_tags on badges.id=badge_tags.badgeid where badges.id=? group by badges.id', [badgeid], function (err3, rows3) {
				if (err3) {
					console.log(err3);
					handler(new Error("Error retrieving badge tag records"));
				} else {
					if (rows2.length > 0) {
						var row = rows2[0];

						badgejson = {};

						badgejson["@context"] = new Array();
						badgejson["@context"][0] = "https://w3id.org/openbadges/v2";

						badgejson["type"] = "BadgeClass";
						badgejson["id"] = cfg.uri_stub+cfg.badges_path_stub+row["uniqueid"];

						if (row["version"] && row["version"] != null && row["version"] != "") {
							badgejson["version"]  = row["version"];
						}

						badgejson["name"] = row["title"];
						badgejson["description"] = row["description"];

						badgejson["image"] = row.imageurl;

						// var file = ?
						// var base64image = utilities.base64_encode(file);
						//badge.image = "data:image/png;base64," + rows[0]["base64"];

						//badgejson["image"]["id"] = row.imageurl;
						//badgejson["image"]["type"] = "ImageObject";

						// ADD TAGS
						if (rows3.length > 0 && rows3[0]["tags"] && rows3[0]["tags"] != "" && rows3[0]["tags"] != null) {
							badgejson["tags"] = [];
							let tagstring  = rows3[0]["tags"];
							let tags = tagstring.split(",");
							let count = tags.length;
							for (let i=0; i<count; i++) {
								let nexttag = tags[i];
								nexttag = nexttag.trim();
								badgejson["tags"].push(nexttag);
							}
						}

						let localhandler = function(err, issuerjson) {
							if (err) {
								handler(err);
							} else if (issuerjson && issuerjson != "" && issuerjson.id) {
								badgejson.issuer = issuerjson;
							}

							let innerlocalhandler = function(err2, alignmentarray) {

								if (err2) {
									handler(err2);
								} else if (alignmentarray && alignmentarray.length > 0) {
									badgejson.alignment = alignmentarray;
								}

								let secondinnerlocalhandler = function(err3, endorsementjson) {
									if (err3) {
										handler(err3);
									} else if (endorsementjson && endorsementjson != "" && endorsementjson.id) {
										badgejson.endorsement = endorsementjson;
									}

									let innerlocalhandler3 = function(err4, criteria) {

										if (err4) {
											handler(err4);
										} else if (criteria) {
											badgejson.criteria = criteria;
										}

										handler(null, badgejson);
									}

									getBadgeCriteriaOpenBadgeJSON(badgeid, row, innerlocalhandler3);
								}
								// the IoC endorsement is hosted, but possibly not the others?
								// But this is all there will be at present but needs fixing when endorsements added for real.
								endorsement_model.getHostedBadgeEndorsementJSONByBadgeID(badgeid, false, secondinnerlocalhandler)
							}
							getBadgeAlignmentsOpenBadgeJSON(badgeid, innerlocalhandler);
						}

						issuer_model.getIssuerOpenBadgeJSON(row["issuerid"], localhandler);
					} else {
						handler(new Error("No badge record found with the given id"));
					}
				}
			});
		}
	});
}


/************************************************************************
 *                                                                      *
 *                    INTERNAL HELPER FUNCTIONS                         *
 *                                                                      *
 ************************************************************************/


function addCriteriaEvents(userid, badgeid, eventidstring, handler) {

	if (userid && badgeid) {
		if (eventidstring && eventidstring != "") {
			let eventids = eventidstring.split(",");
			//console.log(eventids);
			if (eventids.length > 0) {
				addCriteriaEvent(userid, badgeid, eventids, 0, handler);
			} else {
				handler(null, []);
			}
		} else {
			handler(null, []);
		}
	} else {
		handler(new Error("Cannot process badge criteria events. Missing data."));
	}
}

function addCriteriaEvent(userid, badgeid, eventids, index, handler) {

	if (index >= eventids.length) {
		handler(null, eventids);
	} else {
		let eventid = eventids[index];
		eventid = eventid.trim();

		if (eventid && eventid != "") {
			db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin") AND users.id = ?', [userid], function (err, rows) {
				if (err) {
					console.log(err);
					handler(new Error("Error fetching user permissions"));
				} else {
					if (rows.length == 0) {
						handler(new Error("The given user account does not have the correct permissions to perform this action."));
					} else {
						// check badgeid exists and is owned by the current user
						db.get().query('SELECT badges.* from badges where badges.userid=? and badges.id=?', [userid, badgeid], function (err2, rows2) {
							if (err2) {
								console.log(err2);
								handler(new Error("Error fetching badge record"));
							} else {
								if (rows2.length == 0) {
									handler(new Error("No badge record found with the given id for the given user"));
								} else {
									// check event record exists and is owned by the current user
									db.get().query('SELECT events.* from events where events.userid=? and events.id=?', [userid, eventid], function (err3, rows3) {
										if (err3) {
											console.log(err3);
											handler(new Error("Error fetching event record"));
										} else {
											if (rows3.length == 0) {
												handler(new Error("No event record found with the given id for the given user"));
											} else {
												db.get().query('SELECT * from badge_issued where userid=? and badgeid=? and status in ("issued","revoked")', [userid, badgeid], function (err4, rows4) {
													if (err4) {
														console.log(err4);
														handler(new Error("Error checking is badge has been issued"));
													} else {
														if (rows4.length > 0) {
															handler(new Error("This badge record has been used to issue a badge and therefore can't be edited"));
														} else {

															let selectcrtieria = "SELECT * from criteria where badgeid=?";
															let params = [badgeid];
															db.get().query(selectcrtieria, params, function(err5, rows5) {
																if (err5) {
																	console.log(err5);
																	handler(new Error("Error fetching created badge record."));
																} else {
																	if (rows5.length == 0) {
																		handler(new Error("No criteria record found for the badge with the given id"));
																	} else {
																		// check this combination does not already exists

																		let criteriaid = rows5[0].id;
																		let time = Math.floor((new Date().getTime()) / 1000);
																		let insertquery = "INSERT INTO criteria_events (userid, timecreated, criteriaid, eventid) VALUES (?,?,?,?)";
																		let params = [userid, time, criteriaid, eventid];
																		db.get().query(insertquery, params, function(err6, results6) {
																			if (err6) {
																				console.log(err6);
																				handler(new Error("Error creating badge criteria event association record."));
																			} else {
																				console.log("badge criteria event association record created");
																				index++;
																				addCriteriaEvent(userid, badgeid, eventids, index, handler);
																			}
																		});
																	}
																}
															});
														}
													}
												});
											}
										}
									});
								}
							}
						});
					}
				}
			});
		} else {
			index++;
			addCriteriaEvent(userid, badgeid, eventids, index, handler);
		}
	}
}

function addAlignments(userid, badgeid, alignmentidstring, handler) {
	if (userid, badgeid) {
		if (alignmentidstring && alignmentidstring != "") {
			let alignmentids = alignmentidstring.split(",");
			if (alignmentids.length > 0) {
				addAlignment(userid, badgeid, alignmentids, 0, handler);
			} else {
				handler(null, []);
			}
		} else {
			handler(null, []);
		}
	} else {
		handler(new Error("Cannot process badge alignments. Missing data."));
	}
}

function addAlignment(userid, badgeid, alignmentids, index, handler) {

	if (index >= alignmentids.length) {
		handler(null, alignmentids);
	} else {
		let alignmentid = alignmentids[index];
		alignmentid = alignmentid.trim();

		if (alignmentid && alignmentid != "") {

			db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin") AND users.id = ?', [userid], function (err, rows) {
				if (err) {
					console.log(err);
					handler(new Error("Error fetching user permissions"));
				} else {
					if (rows.length == 0) {
						handler(new Error("The given user account does not have the correct permissions to perform this action."));
					} else {
						// check badgeid exists and is owned by the current user
						db.get().query('SELECT badges.* from badges where badges.userid=? and badges.id=?', [userid, badgeid], function (err2, rows2) {
							if (err2) {
								console.log(err2);
								handler(new Error("Error fetching badge record"));
							} else {
								if (rows2.length == 0) {
									handler(new Error("No badge record found with the given id for the given user"));
								} else {
									// check alignment record exists and is owned by the current user
									db.get().query('SELECT alignments.* from alignments where alignments.userid=? and alignments.id=?', [userid, alignmentid], function (err3, rows3) {
										if (err3) {
											console.log(err3);
											handler(new Error("Error fetching alignment record"));
										} else {
											if (rows3.length == 0) {
												handler(new Error("No alignment record found with the given id for the given user"));
											} else {
												db.get().query('SELECT * from badge_issued where userid=? and badgeid=? and status in ("issued","revoked")', [userid, badgeid], function (err4, rows4) {
													if (err4) {
														console.log(err4);
														handler(new Error("Error checking is badge has been issued"));
													} else {
														if (rows4.length > 0) {
															handler(new Error("This badge record has been used to issue a badge and therefore can't be edited"));
														} else {

															// check this combination does not already exists

															let time = Math.floor((new Date().getTime()) / 1000);
															let insertquery = "INSERT INTO badge_alignments (userid, timecreated, badgeid, alignmentid) VALUES (?,?,?,?)";
															let params = [userid, time, badgeid, alignmentid];
															db.get().query(insertquery, params, function(err5, results5) {
																if (err5) {
																	console.log(err5);
																	handler(new Error("Error creating badge alignment association record."));
																} else {
																	console.log("badge alignment association record created");
																	index++;
																	addAlignment(userid, badgeid, alignmentids, index, handler);
																}
															});
														}
													}
												});
											}
										}
									});
								}
							}
						});
					}
				}
			});
		} else {
			index++;
			addAlignment(userid, badgeid, alignmentids, index, handler);
		}
	}
}

/**
 * Return an array of events for the given badgeid's criteria or an error message string, if something was wrong.
 */
function localListCriteriaEvents(userid, badgeid, handler) {

	if (badgeid && badgeid == "" && userid) {

		db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer")', [userid], function (err, rows) {
			if (err) {
				console.log(err);
				handler(new Error("Error fetching user permissions"));
			} else {
				if (rows.length == 0) {
					handler(new Error("The given user does not have permissions to perform this action"));
				} else {

					// Either the owner of the events or criteria or the badge or the issuer of a badge can see it's criteria events
					let query = "SELECT events.* FROM events ";
					query += "left join criteria_events on events.id = criteria_events.eventid ";
					query += "left join criteria on criteria.id = criteria_events.criteriaid ";
					query += "left join badges on criteria.badgeid = badges.id ";
					query += "left join issuers on issuers.id = badges.issuerid ";
					query += "WHERE criteria.badgeid=? AND ((events.userid=? and criteria.userid=?) OR (badges.userid=?) OR (issuers.loginuserid=?))";

					db.get().query(query, [badgeid, userid, userid, userid, userid], function (err2, rows2) {
						if (err2) {
							console.log(err2);
							handler(new Error("Error retrieving badge criteria event records"));
						} else {
							let events = [];

							if (rows2.length > 0) {
								for (let i=0; i<rows2.length; i++) {
									let next = rows2[i];
									let eventobj = {};

									eventobj.id = next["id"];
									eventobj.timecreated = next["timecreated"];
									eventobj.uniqueid = next["uniqueid"];
									eventobj.name = next["name"];
									eventobj.description = next["description"];
									eventobj.startdate = next["startdate"];
									eventobj.enddate = next["enddate"];
									eventobj.location_name = next["location_name"];
									eventobj.location_pobox = next["location_pobox"];
									eventobj.location_streetaddress = next["location_streetaddress"];
									eventobj.location_locality = next["location_locality"];
									eventobj.location_region = next["location_region"];
									eventobj.location_country = next["location_country"];
									eventobj.location_postcode = next["location_postcode"];

									events.push(eventobj);
								}
							}

							handler(null, events);
						}
					});
				}
			}
		});
	} else {
		handler(new Error("Missing data. Either the badgeid or user was not supplied"));
	}
}

/**
 * Return an array of alignments for the given badgeid or an error message string, if something was wrong.
 */
function localListAlignments(userid, badgeid, handler) {

	if (badgeid && badgeid == "" && userid) {

		db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer")', [userid], function (err, rows) {
			if (err) {
				console.log(err);
				handler(new Error("Error fetching user permissions"));
			} else {
				if (rows.length == 0) {
					handler(new Error("The given user does not have permissions to perform this action"));
				} else {

					// Either the owner of the alignments or the badge or the issuer of a badge can see it's alignments
					let query = "SELECT alignments.* FROM alignments ";
					query += "left join badge_alignments on alignments.id = badge_alignments.alignmentid ";
					query += "left join badges on badge_alignments.badgeid = badges.id ";
					query += "left join issuers on issuers.id = badges.issuerid ";
					query += "WHERE badge_alignments.badgeid=? AND ((alignments.userid=? and badge_alignments.userid=?) OR (badges.userid=?) OR (issuers.loginuserid=?))";

					db.get().query(query, [badgeid, userid, userid, userid, userid], function (err2, rows2) {
						if (err2) {
							console.log(err2);
							handler(new Error("Error retrieving badge alignment records"));
						} else {
							let alignments = [];

							if (rows2.length > 0) {
								for (let i=0; i<rows2.length; i++) {
									let next = rows2[i];
									let alignment = {};

									alignment.id = next["id"];
									alignment.timecreated = next["timecreated"];
									alignment.url = next["targetid"];
									alignment.name = next["targetname"];
									alignment.description = next["targetdescription"];
									alignment.code = next["targetcode"];
									alignment.framework = next["targetframework"];

									alignments.push(alignment);
								}
							}

							handler(null, alignments);
						}
					});
				}
			}
		});
	} else {
		handler(new Error("Missing data. Either the badgeid or user was not supplied"));
	}
}

function addBadgeTags(userid, badgeid, tagstring, handler) {

	if (userid && badgeid) {
		if (tagstring && tagstring != "") {
			let tags = tagstring.split(",");
			if (tags.length > 0) {
				addBadgeTag(userid, badgeid, tags, 0, handler);
			} else {
				handler(null, []);
			}
		} else {
			handler(null, []);
		}
	} else {
		handler(new Error("Cannot process badge tags. Missing data."));
	}
}

function addBadgeTag(userid, badgeid, tags, index, handler) {

	if (index >= tags.length) {
		handler(null, tags);
	} else {
		let  tag = tags[index];
		tag = tag.trim();
		if (tag && tag != "") {
			let time = Math.floor((new Date().getTime()) / 1000);

			let insertquery = 'INSERT INTO badge_tags (userid, timecreated, badgeid, tag) VALUE (?,?,?,?)';
			let params = [userid, time, badgeid, tag];
			db.get().query(insertquery, params, function(err, result) {
				if (err) {
					console.log(err);
					handler(new Error("Error saving tag data"));
				} else {
					console.log("tag saved: "+tag);
					index++;
					addBadgeTag(userid, badgeid, tags, index, handler);
				}
			});
		} else {
			index++;
			addBadgeTag(userid, badgeid, tags, index, handler);
		}
	}
}

var downloadBadgeImageFile = function(url, filepath, handler){

	//console.log(url);
	//console.log(filepath);

	if(!url || url == "" || !filepath || filepath == "") {
		handler(new Error("Failed to download badge image file from url. Insufficient data given"));
	}

	// check url points to a png
	if (!(url.match(/\.(png)$/) != null)) {
		handler(new Error("Failed to download badge image file from url. Url does not point to a png file"));
	}

	// if there is an image already with the given path - delete it first
	if (fs.existsSync(filepath)) {
		try {
			fs.unlinkSync(filepath);
		} catch(err) {
			handler(new Error("Failed to delete previous badge image file"));
		}
	}

	// check url points at valid file before trying to fetch it
	//urlExists(url, function(err, exists) {
	//	if (err) {
	//		handler(new Error("Failed to read badge image file from url"));
	//	} else if (!exists) {
	//		handler(new Error("The badge image file url given is invalid"));
	//	} else {
			let loadHandler = function(err, response) {
				if (err) {
					console.error(err)
					handler(new Error("Failed to read badge image file from url"));
				} else {
					//console.log(response);
					try {
						let buffer = readChunk.sync(filepath, 0, 12);
						let filetype = imageType(buffer);
						if (filetype != null && filetype.mime == "image/png") {
							let imagepath = filepath;
							handler(null, imagepath);
						} else {
							if (fs.existsSync(filepath)) {
								try {
									fs.unlinkSync(filepath);
								} catch(err) {
									console.log("Failed to delete duff badge image file");
									//handler(new Error("Failed to delete previous badge image file"));
								}
							}

							handler(new Error("The file on the given url does not appear to be a png file."));
						}
					} catch (e){
						console.log("Cannot write image file ", e);
					}
				}
			}

			utilities.saveUrlToFile(url, filepath, loadHandler);
	//	}
	//});
}



/************************************************************************
 *                                                                      *
 *                      RDFSTORE RELATED FUNCTIONS                      *
 *                                                                      *
 ************************************************************************/

getBadgeContractData = function(blockchainaddress, handler) {

	//console.log(blockchainaddress);
	var storeInstance = new web3.eth.Contract(cfg.contracts.rdfdatastore.abi, blockchainaddress);

	if (storeInstance) {

		let reply = {
			address: blockchainaddress,
			owner: "",
			creationtime: 0,
			islocked: false,
			lockedtime: 0,
			items: []
		}

		let handler = function(e, result) {
			if (!e) {
				reply.owner = result;
				//console.log("OWNER: "+res.locals.owner);

				let handler2 = function(e2, result2) {
					if (!e2) {
						reply.creationtime = parseInt(result2);
						//console.log("createion time: "+res.locals.creationtime);

						let handler3 = function(e3, result3) {
							if (!e2) {
								reply.islocked = result3;
								//console.log("islocked: "+res.locals.islocked);

								let handler4 = function(e4, result4) {
									if (!e4) {
										reply.lockedtime = parseInt(result4);
										//console.log("lockedtime: "+res.locals.lockedtime);

										let handler5 = function(e5, result5) {
											if (!e5) {
												let count = parseInt(result5);
												//console.log("count: " + count);
												let index=0;
												if (count > 0) {
													let innerhandler = function(err, items) {
														if (err) {
															handler(err);
														} else {
															reply.items = items;
															handler(null, reply);
														}
													}
													getRDFData(storeInstance, [], index, count, innerhandler);
												} else {
													handler(null, reply);
												}
											} else {
												handler(new Error(e5));
											}
										};
										storeInstance.methods.counter().call(handler5);
									} else {
										handler(new Error(e4));
									}
								};
								storeInstance.methods.lockedTime().call(handler4);
							} else {
								handler(new Error(e3));
							}
						};
						storeInstance.methods.locked().call(handler3);
					} else {
						handler(new Error(e2));
					}
				};
				storeInstance.methods.creationTime().call(handler2);
			} else {
				handler(new Error(e));
			}
		};
		storeInstance.methods.owner().call(handler);
	} else {
		handler(new Error("The badge contract cannot be found"));
	}
}

function getRDFData(storeInstance, items, index, count, innerhandler) {

	if (storeInstance) {
		let handler = function(e, result) {
			if (!e) {
				//console.log(result);
				items.push(result);

				index++;
				if (index < count) {
					getRDFData(storeInstance, items, index, count, innerhandler);
				} else {
					handler(null, items);
				}
			} else {
				handler(new Error(e3));
			}
		};
		storeInstance.methods.getQuadByIndex(index).call(handler);
	} else {
		handler(new Error("The badge contract instance cannot be found"));
	}
}

function createRDFStore(badgeid, badgejson, issueraccount, handler) {
	console.log("HERE 22");
	console.log(badgejson);

	var options = {
		algorithm: cfg.canonicalizationAlgorithm
	}

	var processReturn = function(err, canonized) {
		console.log("IN PROCESS RETURN");
		if (err) {
			console.log("ERROR JSONLD");
			console.log(err);
			handler(err);
		} else {
			console.log("IN CANONIZED DATA");
			console.log(canonized);

			let quads = parser1.parse(canonized);
			createRDFStoreContract(badgeid, quads, issueraccount, handler);
		}
	}
	utilities.canonicalise(badgejson, processReturn);
}

function createRDFStoreContract(badgeid, quads, issueraccount, handler) {

	function unlockaccounthandler(err, account) {

		if (err) {
			handler(err);
		} else {

			let tContract = new web3.eth.Contract(cfg.contracts.rdfdatastore.abi);
			tContract.deploy({
				data: cfg.contracts.rdfdatastore.binary
			})
			.send({
				from: cfg.account,
				gas: 3200000,
				gasPrice: gasPrice
			})
			.on('error', function(error){
				console.log(error);
				handler(new Error("Error creating RDF Store Contract"));
			})
			.on('transactionHash', function(transactionHash){
				console.log("RDF Store Contract transaction send: TransactionHash: "+transactionHash + " waiting to be mined...");
			})
			.on('receipt', function(receipt){
				console.log("RDF Store Contract mined - Address: " + receipt.contractAddress);

				let rdfstorecontract = receipt.contractAddress;
				let rdfstorecontracttransaction = receipt.transactionHash;
				// for the assertion - this needs sorting out so there is only one reference used.
				let rdfstoreaddress = receipt.contractAddress;

				//console.log(data);
				let innerhandler2 = function(err3, reply) {
					if (err3) {
						handler(err3);
					} else {

						// If everything else goes OK, only then write to the database.
						let query = 'UPDATE badges set transaction=?, blockchainaddress=? where id=?';
						let params = [rdfstorecontracttransaction, rdfstorecontract, badgeid];
						db.get().query(query, params, function(err, result) {
							if (err) {
								console.log(err);
								handler(new Error("Error saving badge contract address data"));
							} else {
								console.log("badge address saved: "+receipt.contractAddress);
								reply.rdfstorecontract = receipt.contractAddress;
								handler(null, reply);
							}
						});
					}
				}
				addQuad(quads, [], 0, issueraccount, rdfstorecontract, innerhandler2);
			});
		}
	}

	utilities.unlockAccount(cfg.account, cfg.password, unlockaccounthandler);
}

function addQuad(quads, transactions, quadcount, issueraccount, rdfstorecontract, handler) {

	if (quadcount >= quads.length) {
		let innerhandler = function(err, reply) {
			if (err) {
				handler(err);
			} else {
				handler(null, {"quads": quads, "transactions": transactions} );
			}
		}
		lockRDFStoreContract(issueraccount, rdfstorecontract, innerhandler);
	} else {

		function unlockaccounthandler(err, account) {
			if (err) {
				handler(err);
			} else {
				let quad = quads[quadcount];
				let subjectString = writer1._encodeIriOrBlank(quad.subject);
				let predicateString = writer1._encodePredicate(quad.predicate);
				let objectString = writer1._encodeObject(quad.object);
				let graphString = quad.graph && quad.graph.value ?  writer1._encodeIriOrBlank(quad.graph) : '';

				//console.log(subjectString);
				//console.log(predicateString);
				//console.log(objectString);
				//console.log(graphString);

				let thisquadcount = quadcount;

				let contractInstance = new web3.eth.Contract(cfg.contracts.rdfdatastore.abi, rdfstorecontract);
				contractInstance.methods.addQuad(subjectString, predicateString, objectString, graphString).send({from: cfg.account, gasPrice: gasPrice, gas: 1200000})
					.on('transactionHash', function(hash){
						console.log("waiting for addQuad transaction to be mined...:"+hash);
						transactions[thisquadcount] = {};
						transactions[thisquadcount].thash = hash;
						transactions[thisquadcount].success = "unknown";
						quadcount++;
						addQuad(quads, transactions, quadcount, issueraccount, rdfstorecontract, handler);
					})

					// why are we not waiting for them to be mined?
					/*
					.on('receipt', function(receipt){
						//console.log(receipt);
						if (receipt.status == "0x0") {
							res.status(404).send({error: "Adding quad to RDFStore transaction failed"});
							transactions[thisquadcount].success = false;
						} else {
							//console.log("Quad" + (json.quadcount + 1) + ": " + receipt.transactionHash);
							transactions[thisquadcount].success = true;
						}
					})
					*/
					.on('error', function(error){
						console.log(error);
						handler(new Error("Error adding quad to RDFStore Contract"));
					});
			}
		}

		utilities.unlockAccount(cfg.account, cfg.password, unlockaccounthandler);
	}
}

function lockRDFStoreContract(issueraccount, rdfstorecontract, handler) {

	function unlockaccounthandler(err, account) {

		if (err) {
			handler(err);
		} else {
			let contractInstance = new web3.eth.Contract(cfg.contracts.rdfdatastore.abi, rdfstorecontract);
			contractInstance.methods.lock().send({from: cfg.account, gasPrice: gasPrice, gas: 60000})
				.on('transactionHash', function(hash){
					console.log("Waiting for RDFStore lock menthod transaction to be mined...:"+hash);
				})
				.on('receipt', function(receipt){
					//console.log(receipt);
					if (receipt.status == "0x0") {
						res.status(404).send({error: "RDFStore lock function transaction failed"});
					} else {
						let innerhandler = function(err, receipt) {
							handler(err, receipt);
						}
						addIssuerPermissionsToRegistry(issueraccount, rdfstorecontract, innerhandler);
					}
				})
				.on('error', function(error){
					console.log(error);
					res.status(404).send({error: "Error locking RDFStore Contract"});
				});
		}
	}
	utilities.unlockAccount(cfg.account, cfg.password, unlockaccounthandler);
}

function removeIssuerPermissionsFromRegistry(issueraccount, rdfstorecontract, handler) {

	if (rdfstorecontract  && rdfstorecontract != null && rdfstorecontract != ""
					&& issueraccount && issueraccount != null && issueraccount != "") {

		function unlockaccounthandler(err, account) {

			if (err) {
				handler(err);
			} else {

				let tokenContractAddress = cfg.tokenContractAddress;
				if (db.getMode() === db.MODE_TEST) {
					tokenContractAddress = cfg.testTokenContractAddress;
				}

				let contractInstance = new web3.eth.Contract(cfg.contracts.erc721metadatamintable.abi, tokenContractAddress);
				contractInstance.methods.setStateContractMinter(rdfstorecontract, issueraccount, false).send({from: cfg.account, gasPrice: gasPrice, gas: 200000})
					.on('transactionHash', function(hash){
						console.log("Waiting for RDFStore lock menthod transaction to be mined...:"+hash);
					})
					.on('receipt', function(receipt){
						//console.log(receipt);
						if (receipt.status == "0x0") {
							handler(new Error("Removing Issuer permissions from Token Registry transaction failed"));
						} else {
							console.log("Issuer Permissions removed from Registry: " + receipt.transactionHash);
							handler(null, receipt);
						}
					})
					.on('error', function(error){
						console.log(e);
						handler(new Error("Error removing old Issuer permissions from Token Registry"));
					});
			}
		}
		utilities.unlockAccount(cfg.account, cfg.password, unlockaccounthandler);
	} else {
		handler(new Error("Cannot remove issuer permissions. Missing required data."));
	}
}

function addIssuerPermissionsToRegistry(issueraccount, rdfstorecontract, handler) {

	if (issueraccount && issueraccount != "" && issueraccount != null
				&& rdfstorecontract && rdfstorecontract != "" && rdfstorecontract != null) {

		function unlockaccounthandler(err, account) {
			if (err) {
				handler(err);
			} else {
				let tokenContractAddress = cfg.tokenContractAddress;
				if (db.getMode() === db.MODE_TEST) {
					tokenContractAddress = cfg.testTokenContractAddress;
				}

				let contractInstance = new web3.eth.Contract(cfg.contracts.erc721metadatamintable.abi, tokenContractAddress);
				contractInstance.methods.setStateContractMinter(rdfstorecontract, issueraccount, true).send({from: cfg.account, gasPrice: gasPrice, gas: 200000})
					.on('transactionHash', function(hash){
						console.log("Waiting for addIssuerPermissionsToRegistry transaction to be mined...:"+hash);
					})
					.on('receipt', function(receipt){
						//console.log(receipt);
						if (receipt.status == "0x0") {
							res.status(404).send({error: "Adding Issuer permissions to Token Registry transaction failed"});
						} else {
							console.log("Issuer Permissions added to Registry: " + receipt.transactionHash);
							handler(null, receipt);
						}
					})
					.on('error', function(error){
						console.log(error);
						handler(new Error("Error adding Issuer permissions to Token Registry"));
					});
			}
		}
		utilities.unlockAccount(cfg.account, cfg.password, unlockaccounthandler);

	} else {
		handler(new Error("Cannot add issuer permissions. Missing required data."));
	}
}

/**
 * Get a Badge type record in Open Badge JSONLD format by it's record identifier.
 * @param id, Required. The identifier of the Badge record you wish to retrieve.
 * @return Open Badge JSONLD of the Badge data, or a JSON error object.
 */
exports.getBadgeJSONByUniqueId = function(req, res, next) {
	var data = matchedData(req);
	if (!data.id) {
		data.id = req.params.badgeid;
	}

	// check all expected variables exist
	if (!data.id) {
		return res.status(400).send({"error": "You must include the unique id for the badge you want to view the JSON data for"});
	}

	db.get().query('SELECT distinct badges.id as badgeid, badges.uniqueid, badges.timecreated,badges.title, badges.version, badges.imageurl, issuers.name as issuername from badges left join issuers on badges.issuerid = issuers.id where badges.uniqueid=? LIMIT 1', [data.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error retrieving badge record"});
		} else {
			if (rows.length > 0) {
				data.badgeid = rows[0].badgeid;

				let innerhandler = function(err, badgejson) {
					//console.log("BACK");
					//console.log(badgejson);
					if (err && err.message && err.message != "") {
						res.status(404).send({error: err.message});
					} else if (badgejson) {
						res.send(badgejson);
					} else {
						res.status(404).send({error: "Unknown error getting badge JSON for: "+data.id});
					}
				}
				exports.getBadgeOpenBadgeJSON(data.badgeid, innerhandler);
			} else {
				res.send({});
			}
		}
	});
}


/************************************************************************
 *                                                                      *
 *                   BLOCKCHAIN BADGES JSON FUNCTIONS                   *
 *                                                                      *
 ************************************************************************/

// No security checks. Public Data
function getBadgeAlignmentsOpenBadgeJSON(badgeid, handler) {

	if (!badgeid || badgeid == "" || badgeid == null) {
		handler(new Error("You must include the id for the badge you want to get the alignments for"));
	} else {

		let query = "SELECT alignments.* FROM alignments ";
		query += "left join badge_alignments on alignments.id = badge_alignments.alignmentid ";
		query += "left join badges on badge_alignments.badgeid = badges.id ";
		query += "WHERE badge_alignments.badgeid=?";

		db.get().query(query, [badgeid], function (err2, rows2) {
			if (err2) {
				console.log(err2);
				handler(new Error("Error retrieving badge records"));
			} else {
				let alignments = [];

				if (rows2.length > 0) {

					for (let i=0; i<rows2.length; i++) {
						let nextalignment = rows2[i];

						let alignmentobj = {}

						alignmentobj["@context"] = "https://w3id.org/openbadges/v2";
						alignmentobj["type"] = "AlignmentObject";
						alignmentobj["id"] = cfg.uri_stub+"alignments/"+nextalignment["uniqueid"];

						if (nextalignment["targetid"] && nextalignment["targetname"] != "") {
							alignmentobj.targetName = nextalignment["targetname"];
						}
						if (nextalignment["targetid"] && nextalignment["targetid"] != "") {
							alignmentobj.targetUrl = nextalignment["targetid"];
						}
						if (nextalignment["targetdescription"] && nextalignment["targetdescription"] != "") {
							alignmentobj.targetDescription = nextalignment["targetdescription"];
						}
						if (nextalignment["targetcode"] && nextalignment["targetcode"] != "") {
							alignmentobj.targetCode = nextalignment["targetcode"];
						}
						if (nextalignment["targetframework"] && nextalignment["targetframework"] != "") {
							alignmentobj.targetFramework = nextalignment["targetframework"];
						}
						alignments.push(alignmentobj);
					}

					//console.log(data.badgejson.alignment);

					handler(null, alignments);
				} else {
					handler(null, alignments);
				}
			}
		});
	}
}

// No security checks. Public Data
function getBadgeCriteriaOpenBadgeJSON(badgeid, row, handler) {

	if (!badgeid || badgeid == "" || badgeid == null) {
		handler(new Error("You must include the id for the badge you want to get the criteria for"));
	} else {

		var criteria = {}
		criteria["@context"] = new Array();
		criteria["@context"][0] = "https://w3id.org/openbadges/v2";
		criteria["@context"][1] = cfg.linkdata_context;
		criteria.type = "Criteria";
		criteria.id = cfg.uri_stub+"criteria/"+row["criteriauniqueid"];

		if (row["narrative"] != "") {
			criteria.narrative = row["narrative"];
		}
		// eventually we can add criteria url
		/* else if (row.criteriaurl != "") {
			criteria.id = row.criteriaurl;
			if (row.criterianarrative != "") {
				criteria.narrative = row.criterianarrative;
			}
		} */

		let query = "SELECT events.* FROM events ";
		query += "left join criteria_events on events.id = criteria_events.eventid ";
		query += "left join criteria on criteria.id = criteria_events.criteriaid ";
		query += "left join badges on criteria.badgeid = badges.id ";
		query += "WHERE badges.id=?";

		db.get().query(query, [badgeid], function (err2, rows2) {
			if (err2) {
				console.log(err2);
				handler(new Error("Error retrieving badge records"));
			} else {
				if (rows2.length > 0) {
					let eventarray = [];

					let innerhandler = function(err, eventarray) {
						criteria.event = eventarray;
						handler(err, criteria);
					}
					getBadgeCriteriaEventOpenBadgeJSON(eventarray, rows2, 0, innerhandler);
				} else {
					handler(null, criteria);
				}
			}
		});
	}
}

function getBadgeCriteriaEventOpenBadgeJSON(eventarray, rows, index, handler) {

	if (index >= rows.length) {
		handler(null, eventarray);
	} else {
		let event = rows[index];
		let eventid = event["id"]

		let eventobj = {}
		eventobj["@context"] = cfg.linkdata_context;
		eventobj["type"] = "AttendedEvent";
		eventobj["id"] = cfg.uri_stub+"events/"+event["uniqueid"];

		if (event["name"] && event["name"] != "" && event["name"] != null) {
			eventobj.name = event["name"];
		}
		if (event["description"] && event["description"] != "" && event["description"] != null) {
			eventobj.description = event["description"];
		}
		if (event["startdate"] && event["startdate"] != "" && event["startdate"] != null) {
			eventobj.startDate = new Date(event["startdate"]).toISOString();
		}
		if (event["enddate"] && event["enddate"] != "" && event["enddate"] != null) {
			eventobj.endDate = new Date(event["enddate"]).toISOString();
		}
		// are we adding a location address
		if ( (event["location_name"] && event["location_name"] != "" && event["location_name"] != null)
				|| (event["location_pobox"] && event["location_pobox"] != "" && event["location_pobox"] != null)
				|| (event["location_streetaddress"] && event["location_streetaddress"] != "" && event["location_streetaddress"] != null)
				|| (event["location_locality"] && event["location_locality"] != "" && event["location_locality"] != null)
				|| (event["location_region"] && event["location_region"] != "" && event["location_region"] != null)
				|| (event["location_country"] && event["location_country"] != "" && event["location_country"] != null)
				|| (event["location_postcode"] && event["location_postcode"] != "" && event["location_postcode"] != null)
		) {
			eventobj.location = {}
			eventobj.location["type"] = "Place";

			if (event["location_name"] && event["location_name"] != "" && event["location_name"] != null)  {
				eventobj.location.name = event["location_name"];
			}

			if ( (event["location_pobox"] && event["location_pobox"] != "" && event["location_pobox"] != null)
					|| (event["location_streetaddress"] && event["location_streetaddress"] != "" && event["location_streetaddress"] != null)
					|| (event["location_locality"] && event["location_locality"] != "" && event["location_locality"] != null)
					|| (event["location_region"] && event["location_region"] != "" && event["location_region"] != null)
					|| (event["location_country"] && event["location_country"] != "" && event["location_country"] != null)
					|| (event["location_postcode"] && event["location_postcode"] != "" && event["location_postcode"] != null)
			) {

				eventobj.location.address = {};
				eventobj.location.address["type"] = "PostalAddress";

				if (event["location_pobox"] && event["location_pobox"] != "" && event["location_pobox"] != null) {
					eventobj.location.address["postOfficeBoxNumber"] = event["location_pobox"];
				}
				if (event["location_streetaddress"] && event["location_streetaddress"] != "" && event["location_streetaddress"] != null) {
					eventobj.location.address["streetAddress"] = event["location_streetaddress"];
				}
				if (event["location_locality"] && event["location_locality"] != "" && event["location_locality"] != null) {
					eventobj.location.address["addressLocality"] = event["location_locality"];
				}
				if (event["location_region"] && event["location_region"] != "" && event["location_region"] != null) {
					eventobj.location.address["addressRegion"] = event["location_region"];
				}
				if (event["location_country"] && event["location_country"] != "" && event["location_country"] != null) {
					eventobj.location.address["addressCountry"] = event["location_country"];
				}
				if (event["location_postcode"] && event["location_postcode"] != "" && event["location_postcode"] != null) {
					eventobj.location.address["postalCode"] = event["location_postcode"];
				}
			}
		}

		eventarray.push(eventobj);

		let innerhandler = function(err, eventarray) {
			if (err) {
				handler(err);
			} else {
				let innerhandler2 = function(err2, eventarray) {
					if (err2) {
						handler(err2);
					} else {
						index++;
						getBadgeCriteriaEventOpenBadgeJSON(eventarray, rows, index, handler);
					}
				}
				getBadgeCriteriaEventSponsorsOpenBadgeJSON(eventarray, eventid, index, innerhandler2);
			}
		}
		getBadgeCriteriaEventOrganizersOpenBadgeJSON(eventarray, eventid, index, innerhandler);
	}
}


// No security checks. Public Data
function getBadgeCriteriaEventOrganizersOpenBadgeJSON(eventarray, eventid, eventindex, handler) {

	if (!eventid) {
		handler(new Error("You must include the id for the badge criteria event you want to get the organizers for"));
	} else {

		let query = "SELECT organizations.* FROM organizations ";
		query += "left join event_organizers on organizations.id = event_organizers.organizationid ";
		query += "left join events on event_organizers.eventid = events.id ";
		query += "WHERE events.id=?";

		db.get().query(query, [eventid], function (err, rows) {
			if (err) {
				console.log(err);
				handler(new Error("Error retrieving event organizer records"));
			} else {
				if (rows.length > 0) {
					if (eventarray[eventindex]) {
						eventarray[eventindex].organizer = [];

						let innerhandler = function(err, eventarray) {
							handler(err, eventarray);
						}
						getBadgeCriteriaEventOrganizerOpenBadgeJSON(eventarray, eventindex, rows, 0, innerhandler);
					} else {
						handler(null, eventarray);
					}
				} else {
					handler(null, eventarray);
				}
			}
		});
	}
}

function getBadgeCriteriaEventOrganizerOpenBadgeJSON(eventarray, eventindex, rows, index, handler) {

	if (index >= rows.length) {
		handler(null, eventarray);
	} else {
		let organization = rows[index];

		let organizerobj = {}
		organizerobj["@context"] = cfg.linkdata_context;
		organizerobj["type"] = "Organization";
		organizerobj["id"] = cfg.uri_stub+"organizations/"+organization["uniqueid"];

		if (organization["name"] && organization["name"] != "" && organization["name"] != null) {
			organizerobj.name = organization["name"];
		}
		if (organization["email"] && organization["email"] != "" && organization["email"] != null) {
			organizerobj.email = organization["email"];
		}

		// are we adding a location address
		if ( (organization["pobox"] && organization["pobox"] != "" && organization["pobox"] != null)
				|| (organization["streetaddress"] && organization["streetaddress"] != "" && organization["streetaddress"] != null)
				|| (organization["locality"] && organization["locality"] != "" && organization["locality"] != null)
				|| (organization["region"] && organization["region"] != "" && organization["	region	"] != null)
				|| (organization["country"] && organization["country"] != "" && organization["country	"] != null)
				|| (organization["postcode"] && organization["postcode"] != "" && organization["postcode"] != null)
		) {
			organizerobj.address = {};
			organizerobj.address["type"] = "PostalAddress";

			if (organization["pobox"] && organization["pobox"] != "" && organization["pobox"] != null) {
				organizerobj.address["postOfficeBoxNumber"] = organization["pobox"];
			}
			if (organization["streetaddress"] && organization["streetaddress"] != "" && organization["streetaddress"] != null) {
				organizerobj.address["streetAddress"] = organization["streetaddress"];
			}
			if (organization["locality"] && organization["locality"] != "" && organization["locality"] != null) {
				organizerobj.address["addressLocality"] = organization["locality"];
			}
			if (organization["region"] && organization["region"] != "" && organization["region"] != null) {
				organizerobj.address["addressRegion"] = organization["region"];
			}
			if (organization["country"] && organization["location_country"] != "" && organization["country"] != null) {
				organizerobj.address["addressCountry"] = organization["country"];
			}
			if (organization["postcode"] && organization["postcode"] != "" && organization["postcode"] != null) {
				organizerobj.address["postalCode"] = organization["postcode"];
			}
		}
		eventarray[eventindex].organizer.push(organizerobj);
		index++;
		getBadgeCriteriaEventOrganizerOpenBadgeJSON(eventarray, eventindex, rows, index, handler);
	}
}

function getBadgeCriteriaEventSponsorsOpenBadgeJSON(eventarray, eventid, eventindex, handler) {

	if (!eventid) {
		handler(new Error("You must include the id for the badge criteria event you want to get the sponsors for"));
	} else {

		let query = "SELECT organizations.* FROM organizations ";
		query += "left join event_sponsors on organizations.id = event_sponsors.organizationid ";
		query += "left join events on event_sponsors.eventid = events.id ";
		query += "WHERE events.id=?";

		db.get().query(query, [eventid], function (err, rows) {
			if (err) {
				console.log(err);
				handler(new Error("Error retrieving event sponsor records"));
			} else {
				if (rows.length > 0) {
					if (eventarray[eventindex]) {
						eventarray[eventindex].sponsor = [];

						let innerhandler = function(err, eventarray) {
							handler(err, eventarray);
						}
						getBadgeCriteriaEventSponsorOpenBadgeJSON(eventarray, eventindex, rows, 0, innerhandler);
					} else {
						handler(null, eventarray);
					}
				} else {
					handler(null, eventarray);
				}
			}
		});
	}
}

function getBadgeCriteriaEventSponsorOpenBadgeJSON(eventarray, eventindex, rows, index, handler) {

	if (index >= rows.length) {
		handler(null, eventarray);
	} else {
		let organization = rows[index];

		let sponsorobj = {}
		sponsorobj["@context"] = cfg.linkdata_context;
		sponsorobj["type"] = "Organization";
		sponsorobj["id"] = cfg.uri_stub+"organizations/"+organization["uniqueid"];

		if (organization["name"] && organization["name"] != "" && organization["name"] != null) {
			sponsorobj.name = organization["name"];
		}
		if (organization["email"] && organization["email"] != "" && organization["email"] != null) {
			sponsorobj.email = organization["email"];
		}

		// are we adding a location address
		if ( (organization["pobox"] && organization["pobox"] != "" && organization["pobox"] != null)
				|| (organization["streetaddress"] && organization["streetaddress"] != "" && organization["streetaddress"] != null)
				|| (organization["locality"] && organization["locality"] != "" && organization["locality"] != null)
				|| (organization["region"] && organization["region"] != "" && organization["	region	"] != null)
				|| (organization["country"] && organization["country"] != "" && organization["country	"] != null)
				|| (organization["postcode"] && organization["postcode"] != "" && organization["postcode"] != null)
		) {
			sponsorobj.address = {};
			sponsorobj.address["type"] = "PostalAddress";

			if (organization["pobox"] && organization["pobox"] != "" && organization["pobox"] != null) {
				sponsorobj.address["postOfficeBoxNumber"] = organization["pobox"];
			}
			if (organization["streetaddress"] && organization["streetaddress"] != "" && organization["streetaddress"] != null) {
				sponsorobj.address["streetAddress"] = organization["streetaddress"];
			}
			if (organization["locality"] && organization["locality"] != "" && organization["locality"] != null) {
				sponsorobj.address["addressLocality"] = organization["locality"];
			}
			if (organization["region"] && organization["region"] != "" && organization["region"] != null) {
				sponsorobj.address["addressRegion"] = organization["region"];
			}
			if (organization["country"] && organization["location_country"] != "" && organization["country"] != null) {
				sponsorobj.address["addressCountry"] = organization["country"];
			}
			if (organization["postcode"] && organization["postcode"] != "" && organization["postcode"] != null) {
				sponsorobj.address["postalCode"] = organization["postcode"];
			}
		}
		eventarray[eventindex].sponsor.push(sponsorobj);
		index++;
		getBadgeCriteriaEventSponsorOpenBadgeJSON(eventarray, eventindex, rows, index, handler);
	}
}


/************************************************************************
 *                                                                      *
 *                    HOSTED BADGES JSON FUNCTIONS                      *
 *                                                                      *
 ************************************************************************/


/**
 * Get a Badge record in Open Badge JSONLD format with hosted verification by it's record identifier.
 * @param id, Required. The identifier of the Badge record you wish to retrieve.
 * @return Open Badge JSONLD of the Badge data, or a JSON error object.
 */
exports.getHostedBadgeJSONByUniqueId = function(req, res, next) {

	var data = matchedData(req);

	if (!data.id) {
		data.id = req.params.badgeid;
	}

	// check all expected variables exist
	if (!data.id) {
		return res.status(400).send({"error": "You must include the unique id for the badge you want to view the hosted JSON data for"});
	}

	db.get().query('SELECT distinct badges.id as badgeid, badges.uniqueid, badges.timecreated,badges.title, badges.version, badges.imageurl, issuers.name as issuername from badges left join issuers on badges.issuerid = issuers.id where badges.uniqueid=? LIMIT 1', [data.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error retrieving badge record"});
		} else {
			if (rows.length > 0) {
				let innerhandler = function(err, badgejson) {
					if (err && err.message && err.message != "") {
						res.status(404).send({error: err.message});
					} else if (badgejson) {
						res.send(badgejson);
					} else {
						res.status(404).send({error: "Unknown error getting hosted badge JSON for: "+data.id});
					}
				}
				getHostedBadgeOpenBadgeJSON(rows[0].badgeid, innerhandler);
			} else {
				res.send({});
			}
		}
	});
}

function getHostedBadgeOpenBadgeJSON(badgeid, handler) {
	// check all expected variables exist, e.g.
	if (!badgeid || badgeid == "") {
		handler(new Error("You must include the id for the badge you want to get the JSON data for"));
	} else {

		let query = 'SELECT badges.*, criteria.id as criteriaid, criteria.uniqueid as criteriauniqueid, criteria.narrative from badges '
		query += 'left join criteria on badges.id = criteria.badgeid ';
		query += 'left join issuers on badges.issuerid = issuers.id ';
		query += 'WHERE badges.id=?';

		let params = [badgeid];
		db.get().query(query, params, function (err2, rows2) {
			if (err2) {
				console.log(err2);
				handler(new Error("Error retrieving badge record"));
			} else {
				if (rows2.length == 0) {
					handler(new Error("No badge record found with the given record id"));
				} else {
					let query = 'SELECT badges.id, GROUP_CONCAT(tag) as tags from badges ';
					query += 'left join badge_tags on badges.id=badge_tags.badgeid where badges.id=? group by badges.id'

					db.get().query(query, [badgeid], function (err3, rows3) {
						if (err3) {
							console.log(err3);
							handler(new Error("Error retrieving badge tag records"));
						} else {

							let row = rows2[0];

							let badgejson = {};

							badgejson["@context"] = new Array();
							badgejson["@context"][0] = "https://w3id.org/openbadges/v2";

							badgejson["type"] = "BadgeClass";
							badgejson["id"] = cfg.uri_stub+cfg.badges_path_stub+"hosted/"+row["uniqueid"];

							if (row["version"] && row["version"] != null && row["version"] != "") {
								badgejson["version"]  = row["version"];
							}

							badgejson["name"] = row["title"];
							badgejson["description"] = row["description"];

							badgejson["image"] = row.imageurl;

							// var file = ?
							// var base64image = utilities.base64_encode(file);
							//badge.image = "data:image/png;base64," + rows[0]["base64"];

							//badgejson["image"]["id"] = row.imageurl;
							//badgejson["image"]["type"] = "ImageObject";

							// ADD TAGS
							if (rows3.length > 0 && rows3[0]["tags"] && rows3[0]["tags"] != "" && rows3[0]["tags"] != null) {
								badgejson["tags"] = [];
								let tagstring  = rows3[0]["tags"];
								let tags = tagstring.split(",");
								let count = tags.length;
								for (let i=0; i<count; i++) {
									let nexttag = tags[i];
									nexttag = nexttag.trim();
									badgejson["tags"].push(nexttag);
								}
							}

							let issuerhandler = function(err, issueruri) {

								if (err && err.message != "") {
									handler(err);
								} else if (issueruri && issueruri != "") {
									badgejson.issuer = issueruri;
								}

								let alignmenthandler = function(err1, alignmentjson) {

									if (err1 && err1.message != "") {
										handler(err1);
									} else if (alignmentjson && alignmentjson.length > 0) {
										badgejson.alignment = alignmentjson;
									}
									let endorsementhandler = function(err2, endorsementjson) {
										// should this not be returning an array like alignments?

										if (err2 && err2.message != "") {
											handler(err2);
										} else if (endorsementjson && endorsementjson.id && endorsementjson.id != "") {
											badgejson.endorsement = endorsementjson.id;
										}

										let criteriahandler = function(err3, criteriajson) {
											if (err3 && err3.message != "") {
												handler(err3);
											} else if (criteriajson && criteriajson.id && criteriajson.id != "") {
												badgejson.criteria = criteriajson;
											}
											handler(null, badgejson);
										}

										getHostedBadgeCriteriaOpenBadgeJSON(badgeid, row, criteriahandler);
									}

									endorsement_model.getHostedBadgeEndorsementJSONByBadgeID(badgeid, true, endorsementhandler)
								}
								getHostedBadgeAlignmentsOpenBadgeJSON(badgeid, alignmenthandler);
							}

							issuer_model.getIssuerOpenBadgeURI(row["issuerid"], true, issuerhandler);
						}
					});
				}
			}
		});
	}
}

// No security checks. Public Data
function getHostedBadgeAlignmentsOpenBadgeJSON(badgeid, handler) {

	if (!badgeid || badgeid == "" || badgeid == null) {
		handler(new Error("You must include the id for the badge you want to get the alignments for"));
	} else {

		let query = "SELECT alignments.* FROM alignments ";
		query += "left join badge_alignments on alignments.id = badge_alignments.alignmentid ";
		query += "left join badges on badge_alignments.badgeid = badges.id ";
		query += "WHERE badge_alignments.badgeid=?";

		db.get().query(query, [badgeid], function (err2, rows2) {
			if (err2) {
				console.log(err2);
				handler(new Error("Error retrieving badge records"));
			} else {
				let alignments = [];

				if (rows2.length > 0) {

					for (let i=0; i<rows2.length; i++) {
						let nextalignment = rows2[i];

						let alignmentobj = {}

						alignmentobj["@context"] = "https://w3id.org/openbadges/v2";
						alignmentobj["type"] = "AlignmentObject";
						alignmentobj["id"] = cfg.uri_stub+"alignments/"+nextalignment["uniqueid"];

						if (nextalignment["targetid"] && nextalignment["targetname"] != "") {
							alignmentobj.targetName = nextalignment["targetname"];
						}
						if (nextalignment["targetid"] && nextalignment["targetid"] != "") {
							alignmentobj.targetUrl = nextalignment["targetid"];
						}
						if (nextalignment["targetdescription"] && nextalignment["targetdescription"] != "") {
							alignmentobj.targetDescription = nextalignment["targetdescription"];
						}
						if (nextalignment["targetcode"] && nextalignment["targetcode"] != "") {
							alignmentobj.targetCode = nextalignment["targetcode"];
						}
						if (nextalignment["targetframework"] && nextalignment["targetframework"] != "") {
							alignmentobj.targetFramework = nextalignment["targetframework"];
						}
						alignments.push(alignmentobj);
					}

					//console.log(data.badgejson.alignment);

					handler(null, alignments);
				} else {
					handler(null, alignments);
				}
			}
		});
	}
}

function getHostedBadgeCriteriaOpenBadgeJSON(badgeid, row, handler) {
	if (!badgeid || badgeid == "" || badgeid == null) {
		handler(new Error("You must include the id for the badge you want to get the criteria for"));
	} else {

		var criteria = {};
		criteria["@context"] = new Array();
		criteria["@context"][0] = "https://w3id.org/openbadges/v2";
		criteria["@context"][1] = cfg.linkdata_context;

		criteria.type = "Criteria";
		criteria.id = cfg.uri_stub+"criteria/"+row["criteriauniqueid"];
		if (row["narrative"] != "") {
			criteria.narrative = row["narrative"];
		}
		// eventually we can add criteria url
		/* else if (row.criteriaurl != "") {
			criteria.id = row.criteriaurl;
			if (row.criterianarrative != "") {
				criteria.narrative = row.criterianarrative;
			}
		} */

		let query = "SELECT events.* FROM events ";
		query += "left join criteria_events on events.id = criteria_events.eventid ";
		query += "left join criteria on criteria.id = criteria_events.criteriaid ";
		query += "left join badges on criteria.badgeid = badges.id ";
		query += "WHERE badges.id=?";

		db.get().query(query, [badgeid], function (err, rows) {
			if (err) {
				console.log(err);
				handler(new Error("Error retrieving badge records"));
			} else {
				if (rows.length > 0) {
					let events = [];
					let innerhandler = function(err2, events) {
						if (err2) {
							handler(err2);
						} else {
							if (events && events.length > 0) {
								criteria.event = events;
							}
							handler(null, criteria);
						}
					}
					getHostedBadgeCriteriaEventOpenBadgeJSON(events, rows, 0, innerhandler);
				} else {
					handler(null, criteria);
				}
			}
		});
	}
}

function getHostedBadgeCriteriaEventOpenBadgeJSON(events, rows, index, handler) {
	if (index >= rows.length) {
		handler(null, events);
	} else {
		let event = rows[index];
		let eventid = event["id"]

		let eventobj = {}
		eventobj["@context"] = cfg.linkdata_context;
		eventobj["type"] = "AttendedEvent";
		eventobj["id"] = cfg.uri_stub+"events/"+event["uniqueid"];

		if (event["name"] && event["name"] != "" && event["name"] != null) {
			eventobj.name = event["name"];
		}
		if (event["description"] && event["description"] != "" && event["description"] != null) {
			eventobj.description = event["description"];
		}
		if (event["startdate"] && event["startdate"] != "" && event["startdate"] != null) {
			eventobj.startDate = new Date(event["startdate"]).toISOString();
		}
		if (event["enddate"] && event["enddate"] != "" && event["enddate"] != null) {
			eventobj.endDate = new Date(event["enddate"]).toISOString();
		}
		// are we adding a location address
		if ( (event["location_name"] && event["location_name"] != "" && event["location_name"] != null)
				|| (event["location_pobox"] && event["location_pobox"] != "" && event["location_pobox"] != null)
				|| (event["location_streetaddress"] && event["location_streetaddress"] != "" && event["location_streetaddress"] != null)
				|| (event["location_locality"] && event["location_locality"] != "" && event["location_locality"] != null)
				|| (event["location_region"] && event["location_region"] != "" && event["location_region"] != null)
				|| (event["location_country"] && event["location_country"] != "" && event["location_country"] != null)
				|| (event["location_postcode"] && event["location_postcode"] != "" && event["location_postcode"] != null)
		) {
			eventobj.location = {}
			eventobj.location["type"] = "Place";

			if (event["location_name"] && event["location_name"] != "" && event["location_name"] != null)  {
				eventobj.location.name = event["location_name"];
			}

			if ( (event["location_pobox"] && event["location_pobox"] != "" && event["location_pobox"] != null)
					|| (event["location_streetaddress"] && event["location_streetaddress"] != "" && event["location_streetaddress"] != null)
					|| (event["location_locality"] && event["location_locality"] != "" && event["location_locality"] != null)
					|| (event["location_region"] && event["location_region"] != "" && event["location_region"] != null)
					|| (event["location_country"] && event["location_country"] != "" && event["location_country"] != null)
					|| (event["location_postcode"] && event["location_postcode"] != "" && event["location_postcode"] != null)
			) {

				eventobj.location.address = {};
				eventobj.location.address["type"] = "PostalAddress";

				if (event["location_pobox"] && event["location_pobox"] != "" && event["location_pobox"] != null) {
					eventobj.location.address["postOfficeBoxNumber"] = event["location_pobox"];
				}
				if (event["location_streetaddress"] && event["location_streetaddress"] != "" && event["location_streetaddress"] != null) {
					eventobj.location.address["streetAddress"] = event["location_streetaddress"];
				}
				if (event["location_locality"] && event["location_locality"] != "" && event["location_locality"] != null) {
					eventobj.location.address["addressLocality"] = event["location_locality"];
				}
				if (event["location_region"] && event["location_region"] != "" && event["location_region"] != null) {
					eventobj.location.address["addressRegion"] = event["location_region"];
				}
				if (event["location_country"] && event["location_country"] != "" && event["location_country"] != null) {
					eventobj.location.address["addressCountry"] = event["location_country"];
				}
				if (event["location_postcode"] && event["location_postcode"] != "" && event["location_postcode"] != null) {
					eventobj.location.address["postalCode"] = event["location_postcode"];
				}
			}
		}

		events.push(eventobj);

		let innerhandler = function(err, events) {
			if (err && err.message != "") {
				handler(err);
			} else {
				let innerhandler2 = function(err2, events) {
					if (err2 && err2.message != "") {
						handler(err2);
					} else {
						index++;
						getHostedBadgeCriteriaEventOpenBadgeJSON(events, rows, index, handler);
					}
				}
				getHostedBadgeCriteriaEventSponsorsOpenBadgeJSON(events, index, eventid, innerhandler2);
			}
		}
		getHostedBadgeCriteriaEventOrganizersOpenBadgeJSON(events, index, eventid, innerhandler);
	}
}


// No security checks. Public Data
function getHostedBadgeCriteriaEventOrganizersOpenBadgeJSON(events, eventindex, eventid, handler) {
	if (!eventid) {
		handler(new Error("You must include the id for the badge criteria event you want to get the organizers for"));
	} else {

		let query = "SELECT organizations.* FROM organizations ";
		query += "left join event_organizers on organizations.id = event_organizers.organizationid ";
		query += "left join events on event_organizers.eventid = events.id ";
		query += "WHERE events.id=?";

		db.get().query(query, [eventid], function (err, rows) {
			if (err) {
				console.log(err);
				handler(new Error("Error retrieving event organizer records"));
			} else {
				let organizers = [];
				if (rows.length > 0) {
					events[eventindex].organizer = [];

					let innerhandler = function(err2, events) {
						handler(err2, events);
					}
					getHostedBadgeCriteriaEventOrganizerOpenBadgeJSON(events, eventindex, rows, 0, innerhandler)
				} else {
					handler(null, events);
				}
			}
		});
	}
}

function getHostedBadgeCriteriaEventOrganizerOpenBadgeJSON(events, eventindex, rows, index, handler) {
	if (index >= rows.length) {
		handler(null, events);
	} else {
		let organization = rows[index];

		let organizerobj = {}
		organizerobj["@context"] = cfg.linkdata_context;
		organizerobj["type"] = "Organization";
		organizerobj["id"] = cfg.uri_stub+"organizations/"+organization["uniqueid"];

		if (organization["name"] && organization["name"] != "" && organization["name"] != null) {
			organizerobj.name = organization["name"];
		}
		if (organization["email"] && organization["email"] != "" && organization["email"] != null) {
			organizerobj.email = organization["email"];
		}

		// are we adding a location address
		if ( (organization["pobox"] && organization["pobox"] != "" && organization["pobox"] != null)
				|| (organization["streetaddress"] && organization["streetaddress"] != "" && organization["streetaddress"] != null)
				|| (organization["locality"] && organization["locality"] != "" && organization["locality"] != null)
				|| (organization["region"] && organization["region"] != "" && organization["	region	"] != null)
				|| (organization["country"] && organization["country"] != "" && organization["country	"] != null)
				|| (organization["postcode"] && organization["postcode"] != "" && organization["postcode"] != null)
		) {
			organizerobj.address = {};
			organizerobj.address["type"] = "PostalAddress";

			if (organization["pobox"] && organization["pobox"] != "" && organization["pobox"] != null) {
				organizerobj.address["postOfficeBoxNumber"] = organization["pobox"];
			}
			if (organization["streetaddress"] && organization["streetaddress"] != "" && organization["streetaddress"] != null) {
				organizerobj.address["streetAddress"] = organization["streetaddress"];
			}
			if (organization["locality"] && organization["locality"] != "" && organization["locality"] != null) {
				organizerobj.address["addressLocality"] = organization["locality"];
			}
			if (organization["region"] && organization["region"] != "" && organization["region"] != null) {
				organizerobj.address["addressRegion"] = organization["region"];
			}
			if (organization["country"] && organization["location_country"] != "" && organization["country"] != null) {
				organizerobj.address["addressCountry"] = organization["country"];
			}
			if (organization["postcode"] && organization["postcode"] != "" && organization["postcode"] != null) {
				organizerobj.address["postalCode"] = organization["postcode"];
			}
		}
		events[eventindex].organizer.push(organizerobj);
		index++;
		getHostedBadgeCriteriaEventOrganizerOpenBadgeJSON(events, eventindex, rows, index, handler);
	}
}

function getHostedBadgeCriteriaEventSponsorsOpenBadgeJSON(events, eventindex, eventid, handler) {
	if (!eventid) {
		handler(new Error("You must include the id for the badge criteria event you want to get the sponsors for"));
	} else {

		let query = "SELECT organizations.* FROM organizations ";
		query += "left join event_sponsors on organizations.id = event_sponsors.organizationid ";
		query += "left join events on event_sponsors.eventid = events.id ";
		query += "WHERE events.id=?";

		db.get().query(query, [eventid], function (err, rows) {
			if (err) {
				console.log(err);
				handler(new Error("Error retrieving event sponsor records"));
			} else {
				let organizers = [];
				if (rows.length > 0) {
					events[eventindex].sponsor = [];

					let innerhandler = function(err2, events) {
						handler(err2, events);
					}
					getHostedBadgeCriteriaEventSponsorOpenBadgeJSON(events, eventindex, rows, 0, innerhandler)
				} else {
					handler(null, events);
				}
			}
		});
	}
}

function getHostedBadgeCriteriaEventSponsorOpenBadgeJSON(events, eventindex, rows, index, handler) {
	if (index >= rows.length) {
		handler(null, events);
	} else {
		let organization = rows[index];

		let sponsorobj = {}
		sponsorobj["@context"] = cfg.linkdata_context;
		sponsorobj["type"] = "Organization";
		sponsorobj["id"] = cfg.uri_stub+"organizations/"+organization["uniqueid"];

		if (organization["name"] && organization["name"] != "" && organization["name"] != null) {
			sponsorobj.name = organization["name"];
		}
		if (organization["email"] && organization["email"] != "" && organization["email"] != null) {
			sponsorobj.email = organization["email"];
		}

		// are we adding a location address
		if ( (organization["pobox"] && organization["pobox"] != "" && organization["pobox"] != null)
				|| (organization["streetaddress"] && organization["streetaddress"] != "" && organization["streetaddress"] != null)
				|| (organization["locality"] && organization["locality"] != "" && organization["locality"] != null)
				|| (organization["region"] && organization["region"] != "" && organization["	region	"] != null)
				|| (organization["country"] && organization["country"] != "" && organization["country	"] != null)
				|| (organization["postcode"] && organization["postcode"] != "" && organization["postcode"] != null)
		) {
			sponsorobj.address = {};
			sponsorobj.address["type"] = "PostalAddress";

			if (organization["pobox"] && organization["pobox"] != "" && organization["pobox"] != null) {
				sponsorobj.address["postOfficeBoxNumber"] = organization["pobox"];
			}
			if (organization["streetaddress"] && organization["streetaddress"] != "" && organization["streetaddress"] != null) {
				sponsorobj.address["streetAddress"] = organization["streetaddress"];
			}
			if (organization["locality"] && organization["locality"] != "" && organization["locality"] != null) {
				sponsorobj.address["addressLocality"] = organization["locality"];
			}
			if (organization["region"] && organization["region"] != "" && organization["region"] != null) {
				sponsorobj.address["addressRegion"] = organization["region"];
			}
			if (organization["country"] && organization["location_country"] != "" && organization["country"] != null) {
				sponsorobj.address["addressCountry"] = organization["country"];
			}
			if (organization["postcode"] && organization["postcode"] != "" && organization["postcode"] != null) {
				sponsorobj.address["postalCode"] = organization["postcode"];
			}
		}
		events[eventindex].sponsor.push(sponsorobj);
		index++;
		getHostedBadgeCriteriaEventSponsorOpenBadgeJSON(events, eventindex, rows, index, handler);
	}
}