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

const db = require('../db.js')
const cfg = require('../config.js');
const utilities = require('../utilities.js');
const fs = require( 'fs' );
const request = require('request');
const pngitxt = require('png-itxt');
const crypto = require('crypto');
const readChunk = require('read-chunk');
const imageType = require('image-type');

const jsonld = require('jsonld');
const N3 = require('n3');
const parser1 = new N3.Parser({ format: 'N-Quads' });
const writer1 = new N3.Writer({ format: 'N-Quads' });
const urlExists = require('url-exists');

var count = 0;
var gasPrice = 21000000000;

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const { matchedData } = require('express-validator/filter');

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
 */
exports.getViewAllBaseBadgesPage = function(req, res, next) {

	res.locals.badges = [];

	var sql = "SELECT DISTINCT sum(case badge_issued.status when 'issued' then 1 when 'revoked' then 1 else 0 END) as num2, ";
	sql += "badges.uniqueid, badges.blockchainaddress, badges.timecreated,badges.title, badges.version, badges.imageurl, issuers.name as issuername, users.blockchainaccount ";
	sql += "from badges left join issuers on badges.issuerid = issuers.id left join users on issuers.loginuserid = issuers.id ";
	sql += "left join badge_issued on badges.id = badge_issued.badgeid Group by badges.id";

	db.get().query(sql, [], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error retrieving badge records"});
		} else {
			if (rows.length > 0) {

				var count = rows.length;
				for(var i=0; i<count; i++) {
					var next = rows[i];
					res.locals.badges[i] = {};
					res.locals.badges[i].uniqueid = next["uniqueid"];
					var d = new Date(parseInt(next["timecreated"]*1000));
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

exports.getBadgeJSONByUniqueId = function(req, res, next) {
	var data = matchedData(req);
	if (!data.id) {
		data.id = req.params.badgeid;
	}

	// check all expected variables exist
	if (!data.id) {
		return res.status(400).send({"error": "You must include the id for the badge you want to view the JSON data for"});
	}

	res.locals.badgejson = {};
	res.locals.finished = false;

	db.get().query('SELECT distinct badges.id as badgeid, badges.uniqueid, badges.timecreated,badges.title, badges.version, badges.imageurl, issuers.name as issuername from badges left join issuers on badges.issuerid = issuers.id where badges.uniqueid=? LIMIT 1', [data.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error retrieving badge record";
		} else {
			if (rows.length > 0) {
				data.badgeid = rows[0].badgeid;

				var innerhandler = function(req, res, next, data) {
					//console.log("BACK");
					//console.log(data.badgejson);
					res.locals.badgejson = data.badgejson;
					res.locals.finished = true;
				}
				exports.getBadgeOpenBadgeJSON(req, res, next, data, innerhandler);
			} else {
				res.locals.finished = true;
			}
		}
	});

	req.flagCheck = setInterval(function() {
		if (res.locals.finished) {
			clearInterval(req.flagCheck);
			//console.log(res.locals.badgejson);
			res.send(res.locals.badgejson);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

/*
exports.endorseBadge(req, res, next) {

}
*/

exports.validate = function(req, res, next) {
	res.locals.finished = false;
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	//if (!data.emailtoupload) {
		//return res.status(400).send({"error": "You must include a valid email address to validate the badge"});
	//}

	if (!data.badgejson.badge) {
		return res.status(400).send({"error": "You must include badge data to validate"});
	}else if (!data.badgejson.signature) {
		return res.status(400).send({"error": "You must include valid badge data"});
	}else if (!data.badgejson.recipient) {
		return res.status(400).send({"error": "You must include valid badge data"});
	}else if (!data.badgejson.recipient.salt) {
		return res.status(400).send({"error": "You must include valid badge data"});
	}else if (!data.badgejson.recipient.type) {
		return res.status(400).send({"error": "You must include valid badge data"});
	}else if (!data.badgejson.recipient.identity) {
		return res.status(400).send({"error": "You must include valid badge data"});
	}

	var identityok = false;
	var emout = data.emailtoupload.toLowerCase();

	var hash = crypto.createHash('sha256', data.badgejson.recipient.salt);
    hash.update(emout);
	var hashedemail = 'sha256$' + hash.digest('hex');
	hash = crypto.createHash('sha256', data.badgejson.recipient.salt);
    hash.update(data.emailtoupload);
	var hashedemailassent = 'sha256$' + hash.digest('hex');

	if (hashedemail == data.badgejson.recipient.identity) {
		identityok = true;
	} else if (hashedemailassent == data.badgejson.recipient.identity) {
		identityok = true;
	}

	var temp = JSON.parse(JSON.stringify(data.badgejson));
	delete temp.signature;

	// canonicalize the json again before sha3ing - done on way out to normalise data and elimates odd characters etc.
	var options = {
		algorithm: cfg.canonicalizationAlgorithm
	}
	res.locals.canonicalizationdone = false;
	var processReturn = function(err, canonized) {
		//console.log("IN PROCESS RETURN");
		if (err) {
			//console.log(err);
			res.locals.errormsg = "Error convertin badge JSON to n-triples";
		} else {
			if (res.locals.canonicalizationdone === false) {
				res.locals.canonicalizationdone = true;

				console.log("IN CANONIZED DATA ON WAY IN");
				console.log(canonized);

				var jsonhash = web3.utils.sha3(canonized);

				res.locals.output = {};

				res.locals.output.validationsummary = {};
				res.locals.output.validationsummary.jsonjsonhashmatches = false;
				res.locals.output.validationsummary.jsonmetahashmatches = false;
				res.locals.output.validationsummary.assertionmetadata = false;
				res.locals.output.validationsummary.emailidentitymatches = identityok;
				res.locals.output.validationsummary.contractexists = false;
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
						res.locals.errormsg = error;
					} else {
						res.locals.output.validationsummary.contractexists = exists;
						if (exists) {

							var contracthandler = function(e, tokenuri) {

								if (!e) {
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
															request.get({
																url: res.locals.output.contract.tokenuri,
																json: true,
																headers: {'User-Agent': 'request'}
															}, (ipfsgeterr, ipfsres, metadata) => {
																if (ipfsgeterr) {
																	res.locals.errormsg = ipfsgeterr;
																} else if (ipfsres.statusCode !== 200) {
																	console.log('Status:', ipfsres.statusCode);
																} else {

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

																	res.locals.finished = true;
																}
															});
														} else {
															//res.locals.errormsg = tokencontracterror;
															res.locals.finished = true;
														}
													};
													contractInstance.methods.tokenContractAddress(data.badgejson.signature.tokenId).call(tokencontracthandler);
												} else {
													//res.locals.errormsg = issuererror;
													res.locals.finished = true;
												}
											};
											contractInstance.methods.tokenMinterAddress(data.badgejson.signature.tokenId).call(issuerhandler);
										} else {
											//res.locals.errormsg = ownererror;
											res.locals.finished = true;
										}
									};
									contractInstance.methods.ownerOf(data.badgejson.signature.tokenId).call(ownerhandler);
								} else {
									//res.locals.errormsg = e;
									res.locals.finished = true;
								}
							};
							contractInstance.methods.tokenURI(data.badgejson.signature.tokenId).call(contracthandler);
						} else {
							res.locals.finished = true;
						}
					}
				};

				utilities.contractExists(data.badgejson.signature.anchors[0].sourceId, handler, req, res);

				req.flagCheck = setInterval(function() {
					if (res.locals.finished) {
						clearInterval(req.flagCheck);

						res.send({badgejson: data.badgejson, result: res.locals.output});
					} else if (res.locals.errormsg != "") {
						clearInterval(req.flagCheck);
						res.status(404).send({error: res.locals.errormsg});
					}
				}, 100); // interval set at 100 milliseconds

			}
		}
	}
	jsonld.canonize(temp, options, processReturn);
}

exports.createBadge = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.title || !data.description || !data.imageurl || !data.version || !data.issuerid || !data.criterianarrative) {
		return res.status(400).send({"error": "You must include a title, description, image url, issuerid, version and criteria narrative for this badge"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

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

	res.locals.tags = "";
	if (data.tags) {
		res.locals.tags = data.tags;
	}

	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;
	res.locals.badgeuniqueid = web3.utils.sha3("badge_" + time);
	res.locals.criteriauniqueid = web3.utils.sha3("criteria_" + time);

	res.locals.badgeissued = false;

	// not currently used.
	//if (data.criteria) res.locals.criteria = data.criteria;
	//if (data.criteriatype) res.locals.criteriatype = data.criteriatype;
	//res.locals.criteria = "";
	//res.locals.criteriatype = "";

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND (roles.rolename = "super" OR roles.rolename = "admin") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The logged in user account does not have the correct permissions to perform this action.";
			} else {
				// check issuerid exists in our database.
				var selectqueryissuer = 'SELECT issuers.*, users.blockchainaccount from issuers left join users on issuers.loginuserid = users.id where issuers.id=? AND issuers.userid=?';
				var paramsissuer = [res.locals.issuerid, req.user.id];
				//var selectquery = 'SELECT * from issuers where id=? AND userid=?';
				//var params = [res.locals.issuerid, req.user.id];
				db.get().query(selectqueryissuer, paramsissuer, function(err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error checking issuer id";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "The given issuer id does not exist or does not exists in conjunction with the logged in user.";
						} else {
							data.issueraccount = rows2[0].blockchainaccount;
							if (!data.issueraccount || data.issueraccount == null || data.issueraccount == "") {
								res.locals.errormsg = "The given issuer does not have a blockchain account.";
							} else {
								function returnhandler(req, res, next, data) {
									var insertquery = 'INSERT INTO badges (userid, timecreated, uniqueid, version, title, description, imageurl, imagepath, issuerid) VALUE (?,?,?,?,?,?,?,?,?)';
									var params = [req.user.id, res.locals.timecreated, res.locals.badgeuniqueid, res.locals.version, res.locals.title, res.locals.description, res.locals.imageurl, res.locals.imagepath, res.locals.issuerid];
									db.get().query(insertquery, params, function(err3, result3) {
										if (err3) {
											console.log(err3);
											res.locals.errormsg = "Error saving badge data";
										} else {
											console.log("badge saved");
											res.locals.id = result3.insertId;
											data.badgeid = result3.insertId;
											if (res.locals.criterianarrative != "") {
												var insertquery = 'INSERT INTO criteria (userid, timecreated, uniqueid, badgeid, narrative) VALUE (?,?,?,?,?)';
												var params = [req.user.id, res.locals.timecreated, res.locals.criteriauniqueid, res.locals.id, res.locals.criterianarrative];
												db.get().query(insertquery, params, function(err4, result4) {
													if (err4) {
														console.log(err4);
														res.locals.errormsg = "Error saving criteria data";
													} else {
														console.log("criteria saved");
														res.locals.criteriaid = result4.insertId;

														// add tags
														if (data.tags && data.tags != "") {
															var tags = data.tags.split(",");
															var count = tags.length;
															for (var i=0; i<count; i++) {
																var tag = tags[i];
																tag = tag.trim();
																var insertquery2 = 'INSERT INTO badge_tags (userid, timecreated, badgeid, tag) VALUE (?,?,?,?)';
																var params2 = [req.user.id, res.locals.timecreated, res.locals.id, tag];
																db.get().query(insertquery2, params2, function(err4, result4) {
																	if (err4) {
																		console.log(err4);
																		res.locals.errormsg = "Error saving tag data";
																	} else {
																		console.log("tag saved: "+tag);
																		if (i == count) {
																			//res.locals.finished = true;
																			createRDFStoreForBadge(req, res, next, data);
																		}
																	}
																});
															}
														} else {
															createRDFStoreForBadge(req, res, next, data);
														}
													}
												});
											}
										}
									});
								}

								downloadBadgeImageFile(req,res,next,data, res.locals.imageurl, cfg.badgeimagesfolder+res.locals.badgeuniqueid+".png", returnhandler);
							}
						}
					}
				});
			}
		}
	});

	req.flagCheck = setInterval(function() {
		if (res.locals.finished) {
			clearInterval(req.flagCheck);
			var data = {
				 id: res.locals.id,
				 timecreated: res.locals.timecreated,
				 badgeuniqueid: res.locals.badgeuniqueid,
				 version: res.locals.version,
				 title: res.locals.title,
				 description: res.locals.description,
				 imageurl: res.locals.imageurl,
				 imagepath: res.locals.imagepath,
				 issuerid: res.locals.issuerid,

				 criteriaid: res.locals.criteriaid,
				 criteriauniqueid: res.locals.criteriauniqueid,
				 criterianarrative: res.locals.criterianarrative,

				 tags: res.locals.tags,

				 usedInIssuance: false

			};

			//console.log(data);

			res.send(data);
		} else if (res.locals.errormsg != "") {

			console.log(res.locals.errormsg);

			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds

}

exports.updateBadge = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({"error": "You must include the id of the badge you want to update"});
	}

	data.badgeid = data.id;

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

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

	res.locals.tags = "";
	if (data.tags) {
		res.locals.tags = data.tags;
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
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The logged in user account does not have the correct permissions to perform this action.";
			} else {
				db.get().query('SELECT badges.*, criteria.id as criteriaid, criteria.uniqueid as criteriauniqueid, criteria.narrative, users.blockchainaccount from badges left join issuers on badges.issuerid = issuers.id left join users on issuers.loginuserid = users.id left join criteria on badges.id = criteria.badgeid where badges.userid=? and badges.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error fetching badge record";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "No badge record found with the given id for the currently logged in user";
						} else {

							res.locals.criteriaid = rows2[0].criteriaid;
							res.locals.criteriauniqueid = rows2[0].criteriauniqueid;
							res.locals.badgeuniqueid = rows2[0].uniqueid;
							if (rows2[0].blockchainaddress && rows2[0].blockchainaddress != null && rows2[0].blockchainaddress != "") {
								data.removeIssuerPermissionsAddress = rows2[0].blockchainaddress;
							}

							// Checked not used in an badge of had the rdfstore contract created (issue process underway)
							var query = 'SELECT badge_issued.* from badge_issued left join badges on badges.id = badge_issued.badgeid '
							query += 'where badges.userid=? and badgeid=? and badge_issued.status in ("issued","revoked")';
							db.get().query(query, [req.user.id, data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error checking badge record not used to issue a badge";
								} else {
									if (rows3.length > 0) {
										res.locals.errormsg = "This badge record has been used to issue a badge and therefore can't be edited";
									} else {
										res.locals.timecreated = rows2[0].timecreated;
										res.locals.imagepath = rows[0].imagepath;
										res.locals.issued = false;
										res.locals.usedInIssuance = false;

										var params = [];

										var setquery = "";

										if (data.title && data.title != "") {
											setquery += "title=?"
											params.push(data.title);
											res.locals.title = data.title
										} else {
											res.locals.title = rows2[0].title;
										}

										if (data.version && data.version != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "version=?"
											params.push(data.version);
											res.locals.version = data.version;
										} else {
											res.locals.version = rows2[0].version;
										}

										if (data.description && data.description != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "description=?"
											params.push(data.description);
											res.locals.description = data.description;
										} else {
											res.locals.description = rows2[0].description;
										}

										var imageChanged = false;
										if (data.imageurl && data.imageurl != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "imageurl=?"
											params.push(data.imageurl);
											res.locals.imageurl = data.imageurl;

											if (rows2[0].imageurl != "" && rows2[0].imageurl != null && data.imageurl != rows2[0].imageurl) {
												imageChanged = true;
											}
										} else {
											res.locals.imageurl = rows2[0].imageurl;
										}

										if (data.issuerid && data.issuerid != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "issuerid=?"
											params.push(data.issuerid);

											res.locals.issuerid = data.issuerid;
										} else {
											res.locals.issuerid = rows2[0].issuerid;
										}

										res.locals.setquery = setquery;

										var handleUpdate = function(req, res, next, data) {

											if (res.locals.setquery != "") {
												var updatequery = "UPDATE badges";
												updatequery += " SET "+res.locals.setquery;
												updatequery += " WHERE userid=? AND id=?";

												//console.log(updatequery);

												params.push(req.user.id);
												params.push(data.id);

												// check issuerid exists in our database and get account.
												var selectqueryissuer = 'SELECT issuers.*, users.blockchainaccount from issuers left join users on issuers.loginuserid = users.id where issuers.id=? AND issuers.userid=?';
												var paramsissuer = [res.locals.issuerid, req.user.id];
												db.get().query(selectqueryissuer, paramsissuer, function(err7, rows7) {
													if (err7) {
														console.log(err7);
														res.locals.errormsg = "Error checking issuer id";
													} else {
														if (rows7.length == 0) {
															res.locals.errormsg = "The given issuer id does not exist or does not exists in conjunction with the logged in user.";
														} else {
															data.issueraccount = rows7[0].blockchainaccount;

															// Has the issuer changed - what account to we need to remove old permissions from?
															if (data.issuerid != rows2[0].issuerid && (rows2[0].issuerid != "" && rows2[0].issuerid != null)) {
																data.removeIssuerPermissionsAccount = rows2[0].blockchainaccount;
															} else {
																data.removeIssuerPermissionsAccount = data.issueraccount;
															}

															db.get().query(updatequery, params, function(err4, results4) {
																if (err4) {
																	console.log(err4);
																	res.locals.errormsg = "Error updating badge record.";
																} else {
																	console.log("badge record updated");

																	// update Criteria narrative if required
																	if (data.criterianarrative && data.criterianarrative != "" && data.criterianarrative != rows2[0].narrative) {
																		res.locals.criterianarrative = data.criterianarrative;

																		// updae criteria table
																		var updatequerycriteria = "UPDATE criteria set narrative=? where userid=? and id=?";
																		var params2 = [res.locals.criterianarrative, req.user.id, res.locals.criteriaid];

																		db.get().query(updatequerycriteria, params2, function(err5, results5) {
																			if (err5) {
																				console.log(err5);
																				res.locals.errormsg = "Error updating criteria record.";
																			} else {
																				console.log("criteria record updated");

																				if (data.tags) {
																					// delete  existing tag entries and re add them
																					db.get().query('Delete from badge_tags where userid=? and badgeid=?', [req.user.id, data.id], function(err6, results6) {
																						if (err6) {
																							console.log(err6);
																							res.locals.errormsg = "Error removing tag records.";
																						} else {
																							console.log("tag records removed");
																							// add tags
																							if (data.tags != "") {
																								var tags = data.tags.split(",");
																								var count = tags.length;
																								var time = Math.floor((new Date().getTime()) / 1000);
																								for (var i=0; i<count; i++) {
																									var tag = tags[i];
																									tag = tag.trim();
																									var insertquery = 'INSERT INTO badge_tags (userid, timecreated, badgeid, tag) VALUE (?,?,?,?)';
																									var params = [req.user.id, time, res.locals.id, tag];
																									db.get().query(insertquery, params, function(err4, result4) {
																										if (err4) {
																											console.log(err4);
																											res.locals.errormsg = "Error saving criteria data";
																										} else {
																											console.log("tag saved: "+tag);
																											if (i == count) {
																												createRDFStoreForBadge(req, res, next, data);
																											}
																										}
																									});
																								}
																							} else {
																								createRDFStoreForBadge(req, res, next, data);
																							}
																						}
																					});
																				} else {
																					createRDFStoreForBadge(req, res, next, data);
																				}
																			}
																		});
																	} else {
																		res.locals.criterianarrative = rows2[0].narrative;
																		createRDFStoreForBadge(req, res, next, data);
																	}
																}
															});
														}
													}
												});
											} else {
												// update Criteria narrative if required
												if (data.criterianarrative && data.criterianarrative != "" && data.criterianarrative != rows2[0].narrative) {
													res.locals.criterianarrative = data.criterianarrative;

													// update criteria table
													var updatequerycriteria = "UPDATE criteria set narrative=? where userid=? and id=?";
													var params2 = [res.locals.criterianarrative, req.user.id, res.locals.criteriaid];

													db.get().query(updatequerycriteria, params2, function(err5, results5) {
														if (err5) {
															console.log(err5);
															res.locals.errormsg = "Error updating criteria record.";
														} else {
															console.log("criteria record updated");
															createRDFStoreForBadge(req, res, next, data);
														}
													});
												} else {
													res.locals.criterianarrative = rows2[0].narrative;
													createRDFStoreForBadge(req, res, next, data);
												}
											}
										}

										if (imageChanged) {
											downloadBadgeImageFile(req,res,next,data, res.locals.imageurl, cfg.badgeimagesfolder+res.locals.badgeuniqueid+".png", handleUpdate);
										} else {
											handleUpdate(req,res,next,data);
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

	req.flagCheck = setInterval(function() {
		if (res.locals.finished) {
			clearInterval(req.flagCheck);
			var data = {
				 id: res.locals.id,
				 timecreated: res.locals.timecreated,
				 badgeuniqueid: res.locals.badgeuniqueid,

				 version: res.locals.version,
				 title: res.locals.title,
				 description: res.locals.description,
				 imageurl: res.locals.imageurl,
				 imagepath: res.locals.imagepath,
				 issuerid: res.locals.issuerid,

				 criteriaid: res.locals.criteriaid,
				 criteriauniqueid: res.locals.criteriauniqueid,
				 criterianarrative: res.locals.criterianarrative,
				 usedInIssuance: res.locals.usedInIssuance,

				 tags: res.locals.tags,
			};

			//console.log(data);

			res.send(data);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

exports.deleteBadge = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send({"error": "You must include the id for the badge you want to delete"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;
	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action";
			} else {
				db.get().query('SELECT * from badges WHERE badges.userid=? and badges.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error fetching badge record";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "No badge record found with the given id for the currently logged in user";
						} else {
							// Checked not used in an badge of had the rdfstore contract created (issue process underway)
							var query = 'SELECT badge_issued.* from badge_issued left join badges on badges.id = badge_issued.badgeid '
							query += 'where badges.userid=? and badge_issued.badgeid=? and (badge_issued.status in ("issued","revoked") or badges.blockchainaddress IS NOT NULL)';
							db.get().query(query, [req.user.id, data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error checking badge record not used to issue a badge";
								} else {
									if (rows3.length > 0) {
										res.locals.errormsg = "This badge record has been used to issue a badge and therefore can't be deleted";
									} else {
										var updatequery = "DELETE from badges WHERE userid=? AND id=?";
										var params = [req.user.id, data.id];

										db.get().query(updatequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												res.locals.errormsg = "Error deleting badge record.";
											} else {
												console.log("badge record deleted");
												res.locals.finished = true;
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

	req.flagCheck = setInterval(function() {
		if (res.locals.finished) {
			clearInterval(req.flagCheck);

			var reply = {}
			reply.id = res.locals.id;
			reply.status = -1;

			res.send(reply);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

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
									var i=0;
									function loop() {
										var next = rows2[i];

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

										res.locals.badges[i].criteriaid = next["criteriaid"];
										res.locals.badges[i].criteriauniqueid = next["criteriauniqueid"];
										res.locals.badges[i].criterianarrative = next["narrative"];

										res.locals.badges[i].tags = "";
										if (rows3.length > 0) {
											for (var j=0; j<rows3.length; j++) {
												if (rows3[j].id == next["id"]) {
													res.locals.badges[i].tags = rows3[j].tags;
													break;
												}
											}
										}

										var sql = 'SELECT * from badge_issued where badge_issued.badgeid=? and badge_issued.status in ("issued","revoked")';
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
									var next = rows2[0];

									var badge = {};

									badge.id = next["id"];
									badge.timecreated = next["timecreated"];
									badge.badgeuniqueid = next["uniqueid"];
									badge.version = next["version"];

									badge.title = next["title"];
									badge.description = next["description"];
									badge.imageurl = next["imageurl"];
									badge.imagepath = next["imagepath"];
									badge.issuerid = next["issuerid"];

									badge.criteriaid = next["criteriaid"];
									badge.criteriauniqueid = next["criteriauniqueid"];
									badge.criterianarrative = next["narrative"];

									badge.tags = "";
									if (rows3.length > 0) {
										badge.tags = rows3[0].tags;
									}

									res.send(badge);
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

exports.addAlignment = function(req, res, next) {

	var data = matchedData(req);

	console.log("adding:"+data.alignmentid+" from:"+data.id);

	if (!data.id || !data.alignmentid) {
		return res.status(400).send({"error": "You must include the id for the badge you want to add an alignment to and the alignment id you want to add"});

	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

	res.locals.id = "";
	res.locals.timecreated = "";
	res.locals.badgeid = data.id;
	res.locals.alignmentid = data.alignmentid;

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The logged in user account does not have the correct permissions to perform this action.";
			} else {
				// check badgeid exists and is owned by the current user
				db.get().query('SELECT badges.* from badges where badges.userid=? and badges.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error fetching badge record";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "No badge record found with the given id for the currently logged in user";
						} else {
							// check alignment record exists and is owned by the current user
							db.get().query('SELECT alignments.* from alignments where alignments.userid=? and alignments.id=?', [req.user.id, data.alignmentid], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error fetching alignment record";
								} else {
									if (rows3.length == 0) {
										res.locals.errormsg = "No alignment record found with the given id for the currently logged in user";
									} else {
										db.get().query('SELECT * from badge_issued where userid=? and badgeid=? and status in ("issued","revoked")', [req.user.id, data.id], function (err3, rows3) {
											if (err3) {
												console.log(err3);
												res.locals.errormsg = "Error checking is badge has been issued";
											} else {
												if (rows3.length > 0) {
													res.locals.errormsg = "This badge record has been used to issue a badge and therefore can't be edited";
												} else {
													var time = Math.floor((new Date().getTime()) / 1000);
													res.locals.timecreated = time;

													var insertquery = "INSERT INTO badge_alignments (userid, timecreated, badgeid, alignmentid) VALUES (?,?,?,?)";
													var params = [req.user.id, time, data.id, data.alignmentid];
													console.log("this is the inner value",req.user.id, time, data.id, data.alignmentid);
													db.get().query(insertquery, params, function(err4, results4) {
														if (err4) {
															console.log(err4);
															res.locals.errormsg = "Error created badge alignment association record.";
														} else {
															console.log("badge alignment association record created");

															res.locals.id = results4.insertId;
															res.locals.finished = true;
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

	req.flagCheck = setInterval(function() {
		if (res.locals.finished) {
			clearInterval(req.flagCheck);
			var data = {
				 id: res.locals.id,
				 timecreated: res.locals.timecreated,
				 badgeid: res.locals.badgeid,
				 alignmentid: res.locals.alignmentid,
			};

			//console.log(data);

			res.send(data);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

exports.removeAlignment = function(req, res, next) {

	var data = matchedData(req);

	console.log("removing:"+data.alignmentid+" from:"+data.id);

	if (!data.id || !data.alignmentid) {
		return res.status(400).send({"error": "You must include the id for the badge you want to remove an alignment from and the alignment id you want to remove"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

	res.locals.id = "";
	res.locals.timecreated = "";
	res.locals.badgeid = data.id;
	res.locals.alignmentid = data.alignmentid;

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The logged in user account does not have the correct permissions to perform this action.";
			} else {
				// check badgeid exists and is owned by the current user
				db.get().query('SELECT badges.* from badges where badges.userid=? and badges.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error fetching badge record";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "No badge record found with the given id for the currently logged in user";
						} else {
							// check alignment record exists and is owned by the current user
							db.get().query('SELECT alignments.* from alignments where alignments.userid=? and alignments.id=?', [req.user.id, data.alignmentid], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error fetching alignment record";
								} else {
									if (rows3.length == 0) {
										res.locals.errormsg = "No alignment record found with the given id for the currently logged in user";
									} else {
										// check badge not used
										db.get().query('SELECT * from badge_issued where userid=? and badgeid=? and status in ("issued","revoked")', [req.user.id, data.id], function (err3, rows3) {
											if (err3) {
												console.log(err3);
												res.locals.errormsg = "Error checking if badge has been issued";
											} else {
												if (rows3.length > 0) {
													res.locals.errormsg = "This badge record has been used to issue a badge and therefore can't be changed";
												} else {
													var time = Math.floor((new Date().getTime()) / 1000);
													res.locals.timecreated = time;

													var deletequery = "DELETE from badge_alignments where userid=? and badgeid=? and alignmentid=?";
													var params = [req.user.id, data.id, data.alignmentid];

													db.get().query(deletequery, params, function(err4, results4) {
														if (err4) {
															console.log(err4);
															res.locals.errormsg = "Error removing badge alignment association record.";
														} else {
															console.log("badge alignment association record remove");
															res.locals.finished = true;
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

	req.flagCheck = setInterval(function() {
		if (res.locals.finished) {
			clearInterval(req.flagCheck);
			var data = {
				 id: res.locals.badgeid,
				 alignmentid: res.locals.alignmentid,
				 status: -1
			};

			res.send(data);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

exports.listAlignments = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id || data.id == "") {
		return res.status(400).send({"error": "You must include the id for the badge you want to get the alignments for"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","Issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {

				// Either the owner of the alignments or the badge or the issuer of a badge can see it's alignments
				var query = "SELECT alignments.* FROM alignments ";
				query += "left join badge_alignments on alignments.id = badge_alignments.alignmentid ";
				query += "left join badges on badge_alignments.badgeid = badges.id ";
				query += "left join issuers on issuers.id = badges.issuerid ";
				query += "WHERE badge_alignments.badgeid=? AND ((alignments.userid=? and badge_alignments.userid=?) OR (badges.userid=?) OR (issuers.loginuserid=?))";

				db.get().query(query, [data.id, req.user.id, req.user.id, req.user.id, req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving badge alignment records"});
					} else {
						var alignments = [];
						if (rows2.length > 0) {
							for (var i=0; i<rows2.length; i++) {
								var next = rows2[i];
								var alignment = {};

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
									var i=0;
									function loop() {
										var next = rows2[i];

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

										res.locals.badges[i].criteriaid = next["criteriaid"];
										res.locals.badges[i].criteriauniqueid = next["criteriauniqueid"];
										res.locals.badges[i].criterianarrative = next["narrative"];

										res.locals.badges[i].tags = "";
										if (rows3.length > 0) {
											for (var j=0; j<rows3.length; j++) {
												if (rows3[j].id == next["id"]) {
													res.locals.badges[i].tags = rows3[j].tags;
													break;
												}
											}
										}

										var sql = 'SELECT * from badge_issued where badge_issued.badgeid=? and badge_issued.status in ("issued","revoked")';
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

/** NOT ROUTED HELPER FUNCTIONS TO BE CALLED BY OTHER MODEL FILES **/

// No security checks. Public Data
exports.getBadgeOpenBadgeJSON = function(req, res, next, data, handler) {

	// check all expected variables exist, e.g.
	if (!data.badgeid) {
		return res.locals.errormsg = "You must include the id for the badge you want to get the JSON data for";
	}

	var query = 'SELECT badges.*, criteria.id as criteriaid, criteria.uniqueid as criteriauniqueid, criteria.narrative from badges '
	query += 'left join criteria on badges.id = criteria.badgeid left join issuers on badges.issuerid = issuers.id ';
	query += 'WHERE badges.id=?';

	var params = [data.badgeid];
	db.get().query(query, params, function (err2, rows2) {
		if (err2) {
			console.log(err2);
			return res.locals.errormsg = "Error retrieving badge record";
		} else {
			db.get().query('SELECT badges.id, GROUP_CONCAT(tag) as tags from badges left join badge_tags on badges.id=badge_tags.badgeid where badges.id=? group by badges.id', [data.badgeid], function (err3, rows3) {
				if (err3) {
					console.log(err3);
					return res.status(404).send({"error": "Error retrieving badge tag records"});
				} else {
					if (rows2.length > 0) {
						var row = rows2[0];

						data.badgejson = {};

						data.badgejson["@context"] = "https://w3id.org/openbadges/v2";
						data.badgejson["type"] = "BadgeClass";
						data.badgejson["id"] = cfg.uri_stub+"badges/"+row["uniqueid"];

						if (row["version"] && row["version"] != null && row["version"] != "") {
							data.badgejson["version"]  = row["version"];
						}

						data.badgejson["name"] = row["title"];
						data.badgejson["description"] = row["description"];

						data.badgejson["image"] = row.imageurl;

						// var file = ?
						// var base64image = utilities.base64_encode(file);
						//data.badge.image = "data:image/png;base64," + rows[0]["base64"];

						//data.badgejson["image"]["id"] = row.imageurl;
						//data.badgejson["image"]["type"] = "ImageObject";

						// ADD CRITERIA
						if (row["narrative"] != "") {
							data.badgejson["criteria"] = {};
							data.badgejson["criteria"]["@context"] = "https://w3id.org/openbadges/v2";
							data.badgejson.criteria.type = "Criteria";
							data.badgejson.criteria.id = cfg.uri_stub+"badges/criteria/"+row["criteriauniqueid"];
							data.badgejson.criteria.narrative = row["narrative"];
						}
						// eventually we can add criteria url
						/* else if (row.criteriaurl != "") {
							data.badgejson.criteria.id = row.criteriaurl;
							if (row.criterianarrative != "") {
								data.badgejson.criteria.narrative = row.criterianarrative;
							}
						} */

						// ADD TAGS
						if (rows3.length > 0 && rows3[0]["tags"] && rows3[0]["tags"] != "" && rows3[0]["tags"] != null) {
							data.badgejson["tags"] = [];
							var tagstring  = rows3[0]["tags"];
							var tags = tagstring.split(",");
							var count = tags.length;
							for (var i=0; i<count; i++) {
								var nexttag = tags[i];
								nexttag = nexttag.trim();
								data.badgejson["tags"].push(nexttag);
							}
						}

						var localhandler = function(req, res, next, data) {
							var innerlocalhandler = function(req, res, next, data) {
								//console.log("DATA B");
								//console.log(data);
								//var secondinnerlocalhandler = function() {
									console.log();
									handler(req, res, next, data);
								//}
								//exports.getBadgeIoCEndorsementJSON(req, res, next, data, secondinnerlocalhandler);
							}
							getBadgeAlignmentsOpenBadgeJSON(req, res, next, data, innerlocalhandler);
						}

						// needed further down the chain, just when issuing a badge.
						data.issuerid = row["issuerid"];
						data.imagepath = row["imagepath"];
						exports.getBadgeIssuerOpenBadgeJSON(req, res, next, data, localhandler);

					} else {
						res.locals.errormsg = "No badge record found with the given id";
					}
				}
			});
		}
	});
}

// No security checks. Public Data
exports.getBadgeIoCEndorsementJSON = function(req, res, next, data, handler) {
	/*
	var endorsement = {};
	endorsement["@context"] = "https://w3id.org/openbadges/v2";
	endorsement["type"] = "Endorsement";
	endorsement["id"] = cfg.uri_stub+"badges/endorsements/5b0afeb52309684134bec000bfe7aa8f27de70e528034f0fc603b26e49208471";

	var dateobj = new Date();
	var time = (dateobj.getTime())/1000;
	var datestr = dateobj.toISOString();
	endorsement["issuedon"] = datestr;

	endorsement["issuer"] = {};
	endorsement["issuer"]["@context"] = "https://w3id.org/openbadges/v2";
	endorsement["issuer"]["type"] = "Issuer",
	endorsement["issuer"]["id"] = cfg.uri_stub+"badges/endorsers/7c63368edf5976dd9d8cc4eb5fbd4b245ef4cd0b3428ddac16a117cac2cf380a";
	endorsement["issuer"]["name"] = "Institute of Coding";
	endorsement["issuer"]["description"] = "Our mission is to break down barriers to digital learning and employment. We believe learning should be a lifelong process and that everyone has a right to improve their skills. We want to spread opportunity by offering access to education, providing what you need, when you need it, in a place you can reach.";
	endorsement["issuer"]["url"] = "https://instituteofcoding.org/";
	endorsement["issuer"]["email"] = "ioc-badges@open.ac.uk";
	endorsement["issuer"]["telephone"] = "";

	endorsement["issuer"]["image"] = {};
	endorsement["issuer"]["image"]["type"] = "ImageObject";

	endorsement["issuer"]["image"]["id"] = cfg.uri_stub+"badges/images/logos/ioc-logo.png";
	//data.badgejson["issuer"]["image"]["caption"] = row.issuerimagecaption;
	//data.badgejson["issuer"]["image"]["author"] = row.issuerimageauthor;

	endorsement["claim"] = {};
	endorsement["claim"]["id"] = data.badgejson["id"];
	endorsement["claim"]["endorsementComment"] = "The Institute of Coding endorse this badge and its issuer";
	*/

	// verification object
	/*
	{
	 "@context": "https://w3id.org/openbadges/v2",
	 "type": "Endorsement",
	 "id": "https://example.org/endorsement-123.json",
	 "issuer": "https://example.org/issuer-5.json",
	 "claim": {
	   "id": "https://example.org/organization.json",
	   "email": "contact@example.org",
	 },
	 "verification": {
	   "type": "hosted"
	 }
	}
	*/

	/*
	if (!data.badgejson.endorsement) {
		data.badgejson.endorsement = [];
	}

	data.badgejson.endorsement.push(endorsement);

	handler(req, res, next, data);
	*/
}

// No security checks. Public Data
exports.getBadgeIssuerOpenBadgeJSON = function(req, res, next, data, handler) {

	if (!data.issuerid) {
		res.locals.errormsg = "You must include the id for the issuer you want to get the data for";
	}

	db.get().query('SELECT issuers.* from issuers where issuers.id=?', [data.issuerid], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error retrieving issuer record";
		} else {
			if (rows.length > 0) {
				var row = rows[0];

				// ISSUER
				data.badgejson["issuer"] = {};
				data.badgejson["issuer"]["@context"] = "https://w3id.org/openbadges/v2";
				data.badgejson["issuer"]["type"] = "Issuer",
				data.badgejson["issuer"]["id"] = cfg.uri_stub+"badges/issuers/"+row["uniqueid"];
				data.badgejson["issuer"]["name"] = row["name"];
				data.badgejson["issuer"]["description"] = row["description"];
				data.badgejson["issuer"]["url"] = row["url"];
				data.badgejson["issuer"]["email"] = row["email"];
				data.badgejson["issuer"]["telephone"] = row["telephone"];

				if (row["imageurl"]) {
					data.badgejson["issuer"]["image"] = {};
					data.badgejson["issuer"]["image"]["type"] = "ImageObject";
					data.badgejson["issuer"]["image"]["id"] = row["imageurl"];
					//data.badgejson["issuer"]["image"]["caption"] = row.issuerimagecaption;
					//data.badgejson["issuer"]["image"]["author"] = row.issuerimageauthor;
				} else {
					data.badgejson["issuer"]["image"] = row["imageurl"];
				}

				handler(req, res, next, data);
			} else {
				res.locals.errormsg = "No issuer record found with the given id";
			}
		}
	});
}

// No security checks. Public Data
function getBadgeAlignmentsOpenBadgeJSON(req, res, next, data, handler) {

	if (!data.badgeid) {
		res.locals.errormsg = "You must include the id for the badge you want to get the alignments for";
	}

	var query = "SELECT alignments.* FROM alignments ";
	query += "left join badge_alignments on alignments.id = badge_alignments.alignmentid ";
	query += "left join badges on badge_alignments.badgeid = badges.id ";
	query += "WHERE badge_alignments.badgeid=?";

	db.get().query(query, [data.badgeid], function (err2, rows2) {
		if (err2) {
			console.log(err2);
			res.locals.errormsg = "Error retrieving badge records";
		} else {

			if (rows2.length > 0) {
				data.badgejson.alignment = [];

				for (var i=0; i<rows2.length; i++) {
					var nextalignment = rows2[i];

					var next = {}

					next["@context"] = "https://w3id.org/openbadges/v2";
					next["type"] = "AlignmentObject";
					next["id"] = cfg.uri_stub+"badges/alignments/"+nextalignment["uniqueid"];

					if (nextalignment["targetid"] && nextalignment["targetname"] != "") {
						next.targetName = nextalignment["targetname"];
					}
					if (nextalignment["targetid"] && nextalignment["targetid"] != "") {
						next.targetUrl = nextalignment["targetid"];
					}
					if (nextalignment["targetdescription"] && nextalignment["targetdescription"] != "") {
						next.targetDescription = nextalignment["targetdescription"];
					}
					if (nextalignment["targetcode"] && nextalignment["targetcode"] != "") {
						next.targetCode = nextalignment["targetcode"];
					}
					if (nextalignment["targetframework"] && nextalignment["targetframework"] != "") {
						next.targetFramework = nextalignment["targetframework"];
					}
					data.badgejson.alignment.push(next);
				}

				//console.log(data.badgejson.alignment);

				handler(req, res, next, data);
			} else {
				handler(req, res, next, data);
			}
		}
	});
}

/*** HELPER FUNCTIONS ***/

var downloadBadgeImageFile = function(req, res, next, data, url, filepath, handler){

	//console.log(url);
	//console.log(filepath);

	if(!url || url == "" || !filepath || filepath == "") {
		res.locals.errormsg = "Failed to download badge image file from url. Insufficient data given";
	}

	// check url points to a png
	if (!(url.match(/\.(png)$/) != null)) {
		res.locals.errormsg = "Failed to download badge image file from url. Url does not point to a png file";
	}

	// if there is an image already with the given path - delete it first
	if (fs.existsSync(filepath)) {
		try {
			fs.unlinkSync(filepath);
		} catch(err) {
			res.locals.errormsg = "Failed to delete previous badge image file";
		}
	}

	// check url points at valid file before trying to fetch it
	//urlExists(url, function(err, exists) {
	//	if (err) {
	//		res.locals.errormsg = "Failed to read badge image file from url";
	//	} else if (!exists) {
	//		res.locals.errormsg = "The badge image file url given is invalid";
	//	} else {
			var options = {
				url: url,
				  headers: {
					'User-Agent': 'service_badges'
				}
			};

			var r = request.get(options);
			r.on('error', function(err) {
				console.error(err)
				res.locals.errormsg = "Failed to read badge image file from url";
			})
			.on('response', function (response) {
				//console.log(response.statusCode);
				//console.log(response.headers);
				if (response.statusCode == 200) {
					r.pipe(fs.createWriteStream(filepath))
						.on('error', function(err2) {
							console.error(err2)
							res.locals.errormsg = "Failed to save badge image file from url";
						})
						.on('finish', function () {
							// check that the image file that was actually download is a png
							var buffer = readChunk.sync(filepath, 0, 12);
							var filetype = imageType(buffer);
							if (filetype != null && filetype.mime == "image/png") {
								res.locals.imagepath = filepath;
								handler(req, res, next, data);
							} else {
								if (fs.existsSync(filepath)) {
									try {
										fs.unlinkSync(filepath);
									} catch(err) {
										console.log("Failed to delete duff badge image file");
										//res.locals.errormsg = "Failed to delete previous badge image file";
									}
								}

								res.locals.errormsg = "The file on the given url does not appear to be a png file.";
							}
						})
				} else {
					console.log("Url png file download error:"+response.statusCode);
					res.locals.errormsg = "Failed to read badge image file from url - bad status code";
				}
			});
	//	}
	//});
}


/*** RDFSTORE REALTED FUNCTIONS ***/


/** get Badge RDF Store Contract data*/
exports.getBadgeByAddress = function(req, res) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.address) {
		return res.status(400).send("You must include the address of the badge you want to get");
	}

	db.get().query('SELECT * from badges where blockchainaddress=?', [data.address], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send("Error fetching badge by contract address");
		} else {

			console.log(rows);

			if (rows.length == 0) {
				return res.status(404).send("The badge contract address you have given does not exist.");
			} else {
				getBadgeContractData(data.address,req, res);
			}
		}
	});
}

getBadgeContractData = function(blockchainaddress, req, res) {

	//console.log(blockchainaddress);
	var storeInstance = new web3.eth.Contract(cfg.contracts.rdfdatastore.abi, blockchainaddress);

	if (storeInstance) {

		req.flagCheck = null;
		res.locals.errormsg = "";

		res.locals.address = blockchainaddress;

		res.locals.owner = "";
		res.locals.creationtime = 0;
		res.locals.islocked = false;
		res.locals.lockedtime = 0;

		res.locals.items = [];
		res.locals.dataretrieved = false;

		var handler = function(e, result) {
			if (!e) {
				res.locals.owner = result;
				//console.log("OWNER: "+res.locals.owner);

				var handler2 = function(e2, result2) {
					if (!e2) {
						res.locals.creationtime = parseInt(result2);
						//console.log("createion time: "+res.locals.creationtime);

						var handler3 = function(e3, result3) {
							if (!e2) {
								res.locals.islocked = result3;
								//console.log("islocked: "+res.locals.islocked);

								var handler4 = function(e4, result4) {
									if (!e4) {
										res.locals.lockedtime = parseInt(result4);
										//console.log("lockedtime: "+res.locals.lockedtime);

										var handler5 = function(e5, result5) {
											if (!e5) {
												var count = parseInt(result5);
												//console.log("count: " + count);
												var index=0;
												if (count > 0) {
													getRDFData(storeInstance, index, count, req, res);
												} else {
													res.locals.dataretrieved = true;
												}
											} else {
												res.locals.errormsg = e5;
											}
										};
										storeInstance.methods.counter().call(handler5);
									} else {
										res.locals.errormsg = e4;
									}
								};
								storeInstance.methods.lockedTime().call(handler4);
							} else {
								res.locals.errormsg = e3;
							}
						};
						storeInstance.methods.locked().call(handler3);
					} else {
						res.locals.errormsg = e2;
					}
				};
				storeInstance.methods.creationTime().call(handler2);
			} else {
				res.locals.errormsg = e;
			}
		};
		storeInstance.methods.owner().call(handler);

		req.flagCheck = setInterval(function() {
			if (res.locals.dataretrieved == true) {
				clearInterval(req.flagCheck);
				res.send(
					{
					 address: res.locals.address,
					 owner: res.locals.owner,
					 items: res.locals.items
					}
				);
			} else if (res.locals.errormsg != "") {
				clearInterval(req.flagCheck);
				res.status(404).send({error: res.locals.errormsg});
			}
		}, 100); // interval set at 100 milliseconds
	} else {
		return res.status(401).send("The badge contract cannot be found");
	}
}

function getRDFData(storeInstance, index, count, req, res) {

	if (storeInstance) {
		var handler = function(e, result) {
			if (!e) {
				//console.log(result);
				res.locals.items.push(result);

				index++;
				if (index < count) {
					getRDFData(storeInstance, index, count, req, res);
				} else {
					res.locals.dataretrieved = true;
				}
			} else {
				res.locals.errormsg = e3;
			}
		};
		storeInstance.methods.getQuadByIndex(index).call(handler);
	} else {
		return res.status(401).send("The badge contract instance cannot be found");
	}
}

function createRDFStoreForBadge(req, res, next, data) {

	//console.log("HERE");

	var badgeid = data.id;
	var rdfcontractabi = cfg.contracts.rdfdatastore.abi;
	var rdfcontractbinary = cfg.contracts.rdfdatastore.binary;

	var innerhandler = function(req, res, next, data) {

		//console.log("BACK");
		//console.log(data.badgejson);

		createRDFStore(req, res, next, data);
	}
	exports.getBadgeOpenBadgeJSON(req, res, next, data, innerhandler);
}

function createRDFStore(req, res, next, data) {
	//console.log("HERE 2");
	//console.log(data.badgejson);

	var options = {
		algorithm: cfg.canonicalizationAlgorithm
	}

	data.donethis = false;
	var processReturn = function(err, canonized) {
		//console.log("IN PROCESS RETURN");
		if (err) {
			//console.log("ERROR JSONLD");
			//console.log(err);
			res.locals.errormsg = "Error converting badge JSON to n-triples for RDFStore";
		} else {
			//console.log("HERE AGAIN");
			if (data.donethis === false) {
				data.donethis = true;
				//console.log("IN CANONIZED DATA");
				//console.log(canonized);

				var quads = parser1.parse(canonized);
				data.quads = quads;
				createRDFStoreContract(req, res, next, data);
			}
		}
	}
	jsonld.canonize(data.badgejson, options, processReturn);
}

function createRDFStoreContract(req, res, next, data) {
	//console.log("HERE 3");

	function unlockaccounthandler(req, res, next, data) {
		var tContract = new web3.eth.Contract(cfg.contracts.rdfdatastore.abi);
		tContract.deploy({
			data: cfg.contracts.rdfdatastore.binary
		})
		.send({
			from: req.user.blockchainaccount,
			gas: 3200000,
			gasPrice: gasPrice
		})
		.on('error', function(error){
			console.log(error);
			res.locals.errormsg = "Error creating RDF Store Contract";
		})
		.on('transactionHash', function(transactionHash){
			console.log("RDF Store Contract transaction send: TransactionHash: "+transactionHash + " waiting to be mined...");
		})
		.on('receipt', function(receipt){
			console.log("RDF Store Contract mined - Address: " + receipt.contractAddress);

			var query = 'UPDATE badges set transaction=?, blockchainaddress=? where id=? and userid=?';
			var params = [receipt.transactionHash, receipt.contractAddress, data.badgeid, req.user.id];
			db.get().query(query, params, function(err, result) {
				if (err) {
					console.log(err);
					res.locals.errormsg = "Error saving badge contract address data";
				} else {
					console.log("badge address saved: "+receipt.contractAddress);

					data.rdfstorecontract = receipt.contractAddress;
					data.quadcount = 0;
					data.transactions = new Array();

					var returnhandler = function(req, res, next, data) {
						addQuads(req, res, next, data);
					}

					// remove old issuer permissions
					removeIssuerPermissionsFromRegistry(req, res, next, data, returnhandler);
				}
			});
		})
	}

	utilities.unlockAccount(req, res, next, data, unlockaccounthandler, req.user.blockchainaccount, req.user.blockchainaccountpassword);
}

function addQuads(req, res, next, data) {
	if (data.quadcount < data.quads.length) {
		addQuad(req, res, next, data);
	} else {
		lockRDFStoreContract(req, res, next, data);
	}
}

function addQuad(req, res, next, data) {

	function unlockaccounthandler(req, res, next, data) {

		var subjectString = writer1._encodeIriOrBlank(data.quads[data.quadcount].subject);
		var predicateString = writer1._encodePredicate(data.quads[data.quadcount].predicate);
		var objectString = writer1._encodeObject(data.quads[data.quadcount].object);
		var graphString = data.quads[data.quadcount].graph && data.quads[data.quadcount].graph.value ?  writer1._encodeIriOrBlank(data.quads[data.quadcount].graph) : '';

		//console.log(subjectString);
		//console.log(predicateString);
		//console.log(objectString);
		//console.log(graphString);

		var thisquadcount = data.quadcount;

		var contractInstance = new web3.eth.Contract(cfg.contracts.rdfdatastore.abi, data.rdfstorecontract);
		contractInstance.methods.addQuad(subjectString, predicateString, objectString, graphString).send({from: req.user.blockchainaccount, gasPrice: gasPrice, gas: 1200000})
			.on('transactionHash', function(hash){
				console.log("waiting for addQuad transaction to be mined...:"+hash);
				data.transactions[thisquadcount] = {};
				data.transactions[thisquadcount].thash = hash;
				data.transactions[thisquadcount].success = "unknown";
				data.quadcount++;
				addQuads(req, res, next, data);
			})
			/*
			.on('receipt', function(receipt){
				//console.log(receipt);
				if (receipt.status == "0x0") {
					res.locals.errormsg = "Adding quad to RDFStore transaction failed";
					data.transactions[thisquadcount].success = false;
				} else {
					//console.log("Quad" + (json.quadcount + 1) + ": " + receipt.transactionHash);
					data.transactions[thisquadcount].success = true;
				}
			})
			*/
			.on('error', function(error){
				console.log(error);
				res.locals.errormsg = "Error adding quad to RDFStore Contract";
			});
	}

	utilities.unlockAccount(req, res, next, data, unlockaccounthandler, req.user.blockchainaccount, req.user.blockchainaccountpassword);
}

function lockRDFStoreContract(req, res, next, data) {

	function unlockaccounthandler(req, res, next, data) {

		var contractInstance = new web3.eth.Contract(cfg.contracts.rdfdatastore.abi, data.rdfstorecontract);
		contractInstance.methods.lock().send({from: req.user.blockchainaccount, gasPrice: gasPrice, gas: 60000})
			.on('transactionHash', function(hash){
				console.log("Waiting for RDFStore lock menthod transaction to be mined...:"+hash);
			})
			.on('receipt', function(receipt){
				//console.log(receipt);
				if (receipt.status == "0x0") {
					res.locals.errormsg = "RDFStore lock function transaction failed";
				} else {
					addIssuerPermissionsToRegistry(req, res, next, data);
				}
			})
			.on('error', function(error){
				console.log(error);
				res.locals.errormsg = "Error locking RDFStore Contract";
			});
	}
	utilities.unlockAccount(req, res, next, data, unlockaccounthandler, req.user.blockchainaccount, req.user.blockchainaccountpassword);
}

function removeIssuerPermissionsFromRegistry(req, res, next, data, handler) {

	if (data.removeIssuerPermissionsAddress  && data.removeIssuerPermissionsAddress != null && data.removeIssuerPermissionsAddress != ""
					&& data.removeIssuerPermissionsAccount && data.removeIssuerPermissionsAccount != null && data.removeIssuerPermissionsAccount != "") {

		function unlockaccounthandler(req, res, next, data) {

			var tokenContractAddress = cfg.tokenContractAddress;
			if (db.getMode() === db.MODE_TEST) {
				tokenContractAddress = cfg.testTokenContractAddress;
			}

			var contractInstance = new web3.eth.Contract(cfg.contracts.erc721metadatamintable.abi, tokenContractAddress);
			contractInstance.methods.setStateContractMinter(data.removeIssuerPermissionsAddress, data.removeIssuerPermissionsAccount, false).send({from: cfg.account, gasPrice: gasPrice, gas: 200000})
				.on('transactionHash', function(hash){
					console.log("Waiting for RDFStore lock menthod transaction to be mined...:"+hash);
				})
				.on('receipt', function(receipt){
					//console.log(receipt);
					if (receipt.status == "0x0") {
						res.locals.errormsg = "Removing Issuer permissions from Token Registry transaction failed";
					} else {
						console.log("Issuer Permissions removed from Registry: " + receipt.transactionHash);
						handler(req, res, next, data);
					}
				})
				.on('error', function(error){
					console.log(e);
					res.locals.errormsg = "Error removing old Issuer permissions from Token Registry";
				});
		}
		utilities.unlockAccount(req, res, next, data, unlockaccounthandler, cfg.account, cfg.password);
	} else {
		handler(req, res, next, data);
	}
}

function addIssuerPermissionsToRegistry(req, res, next, data) {

	if (data.issueraccount && data.issueraccount != "" && data.rdfstorecontract && data.rdfstorecontract != "") {

		function unlockaccounthandler(req, res, next, data) {

			var tokenContractAddress = cfg.tokenContractAddress;
			if (db.getMode() === db.MODE_TEST) {
				tokenContractAddress = cfg.testTokenContractAddress;
			}

			var contractInstance = new web3.eth.Contract(cfg.contracts.erc721metadatamintable.abi, tokenContractAddress);
			contractInstance.methods.setStateContractMinter(data.rdfstorecontract, data.issueraccount, true).send({from: cfg.account, gasPrice: gasPrice, gas: 200000})
				.on('transactionHash', function(hash){
					console.log("Waiting for addIssuerPermissionsToRegistry transaction to be mined...:"+hash);
				})
				.on('receipt', function(receipt){
					//console.log(receipt);
					if (receipt.status == "0x0") {
						res.locals.errormsg = "Adding Issuer permissions to Token Registry transaction failed";
					} else {
						console.log("Issuer Permissions added to Registry: " + receipt.transactionHash);
						res.locals.finished = true;
					}
				})
				.on('error', function(error){
					console.log(error);
					res.locals.errormsg = "Error adding Issuer permissions to Token Registry";
				});
		}
		utilities.unlockAccount(req, res, next, data, unlockaccounthandler, cfg.account, cfg.password);

	} else {
		res.locals.errormsg = "Error: Issuer blockchain account or RDFStore Contract data missing. Token Registration unable to proceed";
	}
}