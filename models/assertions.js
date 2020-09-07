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
const ipfsAPI = require('ipfs-http-client');
const pngitxt = require('png-itxt');
const fs = require( 'fs' );
const nodemailer = require('nodemailer');
const sanitize = require("sanitize-filename");
const jws = require('jws');
const uuidv5 = require('uuidv5');
//var stream = require("stream");

// for building the JSON calling functions in the other models
const badge_model = require('../models/badges');

// Create web3 instance
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const minttokengas = 6000000;

const ipfsurl = cfg.ipfs_url_stub;
const ipfs = ipfsAPI(cfg.ipfs_api_domain, cfg.ipfs_api_port, {protocol: cfg.ipfs_api_transport});

const { matchedData } = require('express-validator/filter');


/**
 * Get the Badge issuance (Assertion) super admin page. Only the super administrator can call this route.
 * @return HTML page for super to administrate assertions or an error page with a message
 */
exports.getAssertionAdministrationPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				res.render('adminassertions', { title: 'Administration of Assertions'});
			}
		}
	});
}

/**
 * Get the Badge issuance (Assertion) issuer management page. This shows a badge issuer the issuances they have made and allwos them to make new one.
 * @return HTML page for issuer Badge issuance management
 */
exports.getAssertionPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				res.render('manageassertions', { protocol: cfg.protocol, domain: cfg.domain, title: "Manage Badge Issuing"});
			}
		}
	});
}

/**
 * Get the Badge Claims (Assertion) issuer management page. This shows a badge issuer the issuances that have been claimed and allwos them to revoke them.
 * @return HTML page for issuer to manage claimed Badge issuances
 */
exports.getClaimsAssertionPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				res.render('manageclaimsassertions', { protocol: cfg.protocol, domain: cfg.domain, title: "Manage Claimed Badges"});
			}
		}
	});
}

/**
 * Gets the Badge issuance (Assertion) view page, for a single badge issuance record.
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to view.
 * @return HTML page for a single Badge issuance (Assertion) record or an error page with a message
 */
exports.viewAssertionByID = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		res.render('error', { message: "You must include the badge assertion id for the badge you want to view"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("recipient", "issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The logged in user account does not have the correct permissions to perform this action."});
			} else {

				let sql = 'SELECT badge_issued.*, badges.title, badges.description, badges.imageurl, issuers.name as issuername ';
				sql += 'from badge_issued left join badges on badge_issued.badgeid = badges.id ';
				sql += 'left join issuers on badges.issuerid ';
				sql += 'left join recipients on badge_issued.recipientid = recipients.id ';
				sql += 'where badge_issued.id=? AND (recipients.loginuserid=? OR issuers.loginuserid=?)';

				db.get().query(sql, [data.id, req.user.id, req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.render('error', { message: "Error retrieving issuance record"});
					} else {
						if (rows2.length == 0) {
							res.render('error', { message: "The assertion id you have given does not exist in combination with the logged in user account."});
						} else {
							let filepath = rows2[0].badgefilepath;
							if (filepath != null && filepath != "") {
								fs.createReadStream(filepath)
									.pipe(pngitxt.get('openbadges',function (err, pngout) {
										if (!err && pngout) {
											try {
												//console.log(pngout.value);
												let json = JSON.parse(pngout.value);
												//console.log(json);
												let jsonstr = JSON.stringify(json)
												//console.log(jsonstr);
												res.render('viewbadge', { json: jsonstr });
											} catch(err) {
												//console.log(err);
												res.render('error', { message: "Error loading JSON from badge file."});
											}
										} else {
											res.render('error', { message: "Error loading badge json."});
										}
									}));
							} else {
								res.render('error', { message: "Badge file path not found."});
							}
						}
					}
				});
			}
		}
	});
}

// Currently in Badge model file
/**
 * Validate the badge with the given json
 *
 * @return the badge validation page.
 */
exports.validateAssertion = function(req, res, next) {
	var data = matchedData(req);
	if (!data.json) {
		return res.status(400).send({"error": "You must include the badge JSON you want to validate"});
	}

	// validation process.
}

/**
 * Revoke a badge issuance.
 * @param id, Required. The identifier of the Badge issuance record you wish to revoke.
 * @param revokedreason, Optional. A textual reason for the revocation. For internal administration use only.
 * @return JSON of the issued badge
 */
exports.revokeAssertion = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send({"error": "You must include the badge issuance id for the badge issuance you want to revoke"});
	}

	res.locals.id = data.id;
	res.locals.revokedreason = "";
	if (data.revokedreason) {
		res.locals.revokedreason = data.revokedreason;
	}

	var tokenContractAddress = cfg.tokenContractAddress;
	if (db.getMode() === db.MODE_TEST) {
		tokenContractAddress = cfg.testTokenContractAddress;
	}

 	data.address = tokenContractAddress;
 	//console.log("CONTRACT = " + tokenContractAddress);

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				// check this assertion exists
				let selectquery = 'SELECT badge_issued.*, badges.blockchainaddress as badgeaddress, recipients.blockchainaccount as recipientaccount, ';
				selectquery += 'badges.title as badgename, recipients.name as recipientname, recipients.email as recipientemail, issuers.name as issuername from badge_issued ';
				selectquery += 'left join badges on badge_issued.badgeid = badges.id ';
				selectquery += 'left join recipients on badge_issued.recipientid = recipients.id ';
				selectquery += 'left join issuers on badges.issuerid = issuers.id ';
				selectquery += 'where badge_issued.id=? AND badge_issued.userid=?';
				let params = [data.id, req.user.id];
				db.get().query(selectquery, params, function(err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error checking badge assertion id"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "The given badge assertion id does not exist."});
						} else {
							res.locals.timecreated = rows2[0].timecreated;
							res.locals.uniqueid = rows2[0].uniqueid;

							res.locals.recipientid = rows2[0].recipientid;
							res.locals.badgeid = rows2[0].badgeid;
							res.locals.issuedOn = rows2[0].issuedon;
							res.locals.tokenmetadataurl = rows2[0].tokenmetadataurl;
							res.locals.blockchainaddress = rows2[0].blockchainaddress;
							res.locals.transaction = rows2[0].transaction;
							res.locals.tokenid = rows2[0].tokenid;

							res.locals.recipientname = rows2[0].recipientname;
							res.locals.recipientemail = rows2[0].recipientemail;
							res.locals.badgename = rows2[0].badgename;
							res.locals.issuername = rows2[0].issuername;

							let unlockaccounthandler = function(err, account) {
								if (err && err.message && err.message != "") {
									res.status(404).send({error: err.message});
								} else if (!account) {
									res.status(404).send({error: "Unknown error unlocking blockchain account"});
								} else {

									let tokenInstance = new web3.eth.Contract(cfg.contracts.erc721metadatamintable.abi, rows2[0].blockchainaddress);
									tokenInstance.methods.burnToken(rows2[0].recipientaccount, res.locals.tokenid, rows2[0].badgeaddress).send({from: req.user.blockchainaccount, gas: minttokengas})
										.on('transactionHash', function(hash){
											data.transaction = hash;
										})
										.on('receipt', function(receipt){
											//console.log(receipt);
											if (receipt.status == "0x0") {
												res.status(404).send({error: "token burning transaction failed"});
											} else {
												let status = 'revoked';
												let updatequery = 'Update badge_issued set status=?, revokedreason=? where id=? and userid=?';
												let updateparams = [status, res.locals.revokedreason, res.locals.id, req.user.id];

												db.get().query(updatequery, updateparams, function(err2, results2) {
													if (err2) {
														console.log(err2);
														res.status(404).send({error: "Error updating token issuance with revoked status after token burned"});
													} else {
														console.log("assertion updated");
														res.locals.status = status;

														let handler = function(err, info) {
															if (err && err.message && err.message != "") {
																res.status(404).send({error: err.message});
															} else if (!info) {
																res.status(404).send({error: "Unknown error sending notification email to recipient"});
															} else {
																// Send data back to client
																let reply = {
																	 id: res.locals.id,
																	 timecreated: res.locals.timecreated,
																	 uniqueid: res.locals.uniqueid,
																	 badgeid: res.locals.badgeid,
																	 recipientid: res.locals.recipientid,
																	 issuedon: res.locals.issuedon,
																	 tokenmetadataurl: res.locals.tokenmetadataurl,
																	 blockchainaddress: res.locals.blockchainaddress,
																	 transaction: res.locals.transaction,
																	 tokenid: res.locals.tokenid,
																	 revokedreason: res.locals.revokedreason,
																	 status: res.locals.status,
																};

																res.send(reply);
															}
														}
														notifyRecipientOfBadgeRevocation(res.locals.recipientemail, res.locals.recipientname, res.locals.badgename, res.locals.issuername, handler);
													}
												});
											}
										})
										.on('error', function(error){
											console.log(error);
											res.status(404).send({error: "Error revoking token"});
										});
								}
							}

							utilities.unlockAccount(req.user.blockchainaccount, req.user.blockchainaccountpassword, unlockaccounthandler);
						}
					}
				});
			}
		}
	});
}

exports.updateRevocationReason = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send({"error": "You must include the badge issuance id and the revocation reason for the badge issuance you want to update the revocation reason for"});
	}

	res.locals.id = data.id;
	res.locals.revokedreason = data.revokedreason;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				// check this assertion exists
				let selectquery = 'SELECT badge_issued.* from badge_issued ';
				selectquery += 'left join badges on badge_issued.badgeid = badges.id ';
				selectquery += 'left join recipients on badge_issued.recipientid = recipients.id ';
				selectquery += 'where badge_issued.id=? AND badge_issued.userid=?';
				let params = [res.locals.id, req.user.id];
				db.get().query(selectquery, params, function(err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error checking badge assertion id"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "The given badge assertion id does not exist."});
						} else {
							res.locals.timecreated = rows2[0].timecreated;
							res.locals.uniqueid = rows2[0].uniqueid;
							res.locals.recipientid = rows2[0].recipientid;
							res.locals.badgeid = rows2[0].badgeid;
							res.locals.issuedon = rows2[0].issuedon;
							res.locals.tokenmetadataurl = rows2[0].tokenmetadataurl;
							res.locals.blockchainaddress = rows2[0].blockchainaddress;
							res.locals.transaction = rows2[0].transaction;
							res.locals.tokenid = rows2[0].tokenid;
							res.locals.status = rows2[0].status;

							var status = 'revoked';
							if (rows2[0].status == status) {
								let updatequery = 'Update badge_issued set revokedreason=? where id=? and userid=?';
								let updateparams = [res.locals.revokedreason, res.locals.id, req.user.id];

								db.get().query(updatequery, updateparams, function(err2, results2) {
									if (err2) {
										console.log(err2);
										res.status(404).send({error: "Error updating revocation reason"});
									} else {
										console.log("assertion updated");
										res.locals.status = status;

										// Send data back to client
										var reply = {
											 id: res.locals.id,
											 timecreated: res.locals.timecreated,
											 uniqueid: res.locals.uniqueid,
											 badgeid: res.locals.badgeid,
											 recipientid: res.locals.recipientid,
											 issuedon: res.locals.issuedon,
											 tokenmetadataurl: res.locals.tokenmetadataurl,
											 blockchainaddress: res.locals.blockchainaddress,
											 transaction: res.locals.transaction,
											 tokenid: res.locals.tokenid,
											 revokedreason: res.locals.revokedreason,
											 status: res.locals.status,
										};

										res.send(reply);
									}
								});
							} else {
								res.status(404).send({error: "You cannot set a revocation reason on a badge issuance that has not been revoked."});
							}
						}
					}
				});
			}
		}
	});
}

exports.endorseAssertion = function(req, res, next) {

	// endorse badge issuance.
}

/**
 * Issue a pending Badge issuance (Assertion). Emails the resultant badge file to the recipient.
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to issue.
 * @return JSON for a single Badge issuance (Assertion) record or a JSON error object
 */
exports.issueAssertion = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the badge issuance you want to issue"});
	}

	res.locals.assertionObject = {};
	res.locals.assertionjson = "";
	res.locals.assertionjsonhash = "";
	res.locals.badgefilepath = "";

	// for return object
	res.locals.id = data.id;
	res.locals.timecreated = "";
	res.locals.uniqueid = "";
	res.locals.badgeid = "";
	res.locals.recipientid = "";
	res.locals.issuedon = "";
	res.locals.tokenmetadataurl = "";
	res.locals.transaction = "";
	res.locals.tokenid = "";
	res.locals.revokedreason = "";
	res.locals.status = "";

	res.locals.tokenContractAddress = cfg.tokenContractAddress;
	if (db.getMode() === db.MODE_TEST) {
		res.locals.tokenContractAddress = cfg.testTokenContractAddress;
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				// check this assertion exists
				let selectquery = 'SELECT * from badge_issued where id=? AND userid=?';
				let params = [res.locals.id, req.user.id];
				db.get().query(selectquery, params, function(err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error checking badge assertion id"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "The given badge assertion id does not exist."});
						} else {
							let row = rows2[0];

							// fill in the existing parts of the return data
							res.locals.timecreated = row["timecreated"];
							res.locals.uniqueid = row["uniqueid"];
							res.locals.recipientid = row["recipientid"];
							res.locals.badgeid = row["badgeid"];
							let time = Math.floor((new Date().getTime()) / 1000);
							res.locals.issuedon = time;
							res.locals.status = row["status"];

							let loadAssertionHandler = function(errAssertion, assertionObject) {

								if (errAssertion && errAssertion.message && errAssertion.message != "") {
									res.status(404).send({error: errAssertion.message});
								} else if (!assertionObject) {
									res.status(404).send({error: "Unknown error fetching assertion data"});
								} else {
									/*
										let assertionObject = {};
										assertionObject.id
										assertionObject.uniqueid
										assertionObject.badgeid
										assertionObject.badgerdfstoreaddress
										assertionObject.recipientid
										assertionObject.recipientuserid
										assertionObject.recipientaccount
										assertionObject.recipientemail
										assertionObject.recipientname
										assertionObject.recipientloginuserid
										assertionObject.issuername
										assertionObject.issueraccount
										assertionObject.issuerpassword
									*/

									res.locals.assertionObject = assertionObject;

									let assertionJSONHandler = function(err, assertionjson) {

										if (err && err.message && err.message != "") {
											res.status(404).send({error: err.message});
										} else if (!assertionjson) {
											res.status(404).send({error: "Unknown error getting badge json"});
										} else {
											res.locals.assertionjson = assertionjson;

											let badgeJSONHandler = function(err2, badgejson) {

												if (err2 && err2.message && err2.message != "") {
													res.status(404).send({error: err2.message});
												} else if (!badgejson) {
													res.status(404).send({error: "Unknown error getting badge json"});
												} else {
													res.locals.assertionjson.badge = badgejson;

													let evidenceJSONHandler = function(err3, evidence) {

														if (err3 && err3.message && err3.message != "") {
															res.status(404).send({error: err3.message});
														} else if (!evidence) {
															res.status(404).send({error: "Unknown error getting badge evidence JSON"});
														} else {
															if (evidence && evidence.length > 0) {
																res.locals.assertionjson.evidence = evidence;
															}

															let canonicaliseJSONHandler = function(err4, canonized) {
																console.log("HERE 1");
																if (err4) {
																	console.log(err4);
																	res.status(404).send({error: "Error converting badge JSON to n-triples"});
																} else {
																	console.log("IN CANONIZED DATA ON WAY OUT - ASSERTION");
																	console.log(canonized);

																	res.locals.assertionjsonhash = web3.utils.sha3(canonized);

																	let createTokenMetadataHandler = function(err5, metadataurl) {

																		if (err5 && err5.message && err5.message != "") {
																			res.status(404).send({error: err5.message});
																		} else if (!evidence) {
																			res.status(404).send({error: "Unknown error creating badge metatdata url"});
																		} else {
																			res.locals.tokenmetadataurl = metadataurl;

																			let issueHandler = function(err6, issuereply) {

																				if (err6 && err6.message && err6.message != "") {
																					res.status(404).send({error: err6.message});
																				} else if (!issuereply) {
																					res.status(404).send({error: "Unknown error issuing badge token"});
																				} else {

																					res.locals.transaction = issuereply.transaction;
																					res.locals.tokenid = issuereply.tokenid;
																					res.locals.status = "issued";

																					// create the file to be used by students and email recipient.
																					let signatureJSONHandler = function(err7, signature) {

																						if (err7 && err7.message && err7.message != "") {
																							res.status(404).send({error: err7.message});
																						} else if (!signature) {
																							res.status(404).send({error: "Unknown error getting signature JSON"});
																						} else {

																							res.locals.assertionjson.signature = signature;

																							// add the final json to the database
																							let updateAssertionJSONHandler = function(err8, saved) {

																								if (err8 && err8.message && err8.message != "") {
																									res.status(404).send({error: err8.message});
																								} else if (!saved) {
																									res.status(404).send({error: "Unknown error updateing assertion json in database"});
																								} else {

																									// create the badge file
																									let badgeFileHandler = function(err9, badgefilepath) {

																										if (err9 && err9.message && err9.message != "") {
																											res.status(404).send({error: err9.message});
																										} else if (!badgefilepath) {
																											res.status(404).send({error: "Unknown error creating badge file"});
																										} else {

																											res.locals.badgefilepath = badgefilepath;

																											// email the recipient
																											let emailRecipientHandler = function(err10, info) {
																												if (err10 && err10.message && err10.message != "") {
																													res.status(404).send({error: err10.message});
																												} else if (!info) {
																													res.status(404).send({error: "Unknown error emailing recipient"});
																												} else {

																													// Send data back to client
																													let reply = {
																														 id: res.locals.id,
																														 timecreated: res.locals.timecreated,
																														 uniqueid: res.locals.uniqueid,
																														 badgeid: res.locals.badgeid,
																														 recipientid: res.locals.recipientid,
																														 issuedon: res.locals.issuedon,
																														 tokenmetadataurl: res.locals.tokenmetadataurl,
																														 blockchainaddress: res.locals.tokenContractAddress,
																														 transaction: res.locals.transaction,
																														 tokenid: res.locals.tokenid,
																														 revokedreason: res.locals.revokedreason,
																														 status: res.locals.status,
																													};
																													res.send(reply);
																												}
																											}

																											notifyRecipientOfBadgeIssuance(
																													res.locals.assertionObject.recipientemail,
																													res.locals.assertionObject.recipientname,
																													res.locals.recipientid,
																													res.locals.assertionjson.badge.name,
																													res.locals.badgefilepath,
																													res.locals.assertionObject.recipientloginuserid,
																													emailRecipientHandler);
																										}
																									}

																									createOpenBadgeFile(
																											res.locals.id,
																											res.locals.assertionjson,
																											res.locals.assertionjsonhash,
																											res.locals.badgeid,
																											badgeFileHandler);
																								}
																							}

																							updateAssertionJSON(
																									res.locals.id,
																									res.locals.assertionjson,
																									updateAssertionJSONHandler);

																						}
																					}

																					makeSignatureJSON(
																							res.locals.tokenContractAddress,
																							res.locals.assertionjsonhash,
																							res.locals.tokenid,
																							cfg.hashingAlgorithm,
																							cfg.canonicalizationAlgorithm,
																							signatureJSONHandler);
																				}
																			}

																			issueToken(
																					res.locals.id,
																					res.locals.tokenContractAddress,
																					res.locals.assertionObject.badgerdfstoreaddress,
																					res.locals.tokenmetadataurl,
																					res.locals.assertionObject.issueraccount,
																					res.locals.assertionObject.issuerpassword,
																					res.locals.assertionObject.recipientaccount,
																					res.locals.assertionjsonhash,
																					req.user.id,
																					res.locals.recipientid,
																					res.locals.issuedon,
																					issueHandler);
																		}
																	}

																	createTokenMetadata(
																			res.locals.id,
																			res.locals.assertionjson.badge.name,
																			res.locals.assertionjson.badge.description,
																			res.locals.assertionjson.badge.image,
																			res.locals.assertionjsonhash,
																			cfg.hashingAlgorithm,
																			cfg.canonicalizationAlgorithm,
																			createTokenMetadataHandler);
																}
															}

															utilities.canonicalise(res.locals.assertionjson, canonicaliseJSONHandler);
														}
													}

													createEvidenceJSON(res.locals.id, evidenceJSONHandler)
												}
											}

											// Only create the RDFStore contract if badge does not have the an rdfstore address already
											// This will create and return the badge JSON as part of the process.
											if (!res.locals.assertionObject.badgerdfstoreaddress
													|| res.locals.assertionObject.badgerdfstoreaddress == ""
														|| res.locals.assertionObject.badgerdfstoreaddress == null) {

												let rdfStoreForBadgeHandler = function(err11, reply) {
													if (err11 && err11.message && err11.message != "") {
														res.status(404).send({error: err11.message});
													} else if (reply) {
														res.locals.assertionObject.badgerdfstoreaddress = reply.rdfstorecontract;
														badgeJSONHandler(null, reply.badgejson);
													} else {
														res.status(404).send({error: "Unknown error creating RDFStore for Badge"});
													}
												}

												badge_model.createRDFStoreForBadge(res.locals.badgeid, res.locals.assertionObject.issueraccount, rdfStoreForBadgeHandler);
											} else {
												badge_model.getBadgeOpenBadgeJSON(res.locals.badgeid, badgeJSONHandler);
											}
										}
									}

									createInitialAssertionJSON(
											res.locals.issuedon,
											res.locals.assertionObject.uniqueid,
											res.locals.assertionObject.issueraccount,
											res.locals.assertionObject.recipientemail,
											res.locals.assertionObject.recipientaccount,
											assertionJSONHandler);
								}
							}

							loadAssertion(req.user.id, res.locals.id, loadAssertionHandler);
						}
					}
				});
			}
		}
	});
}

/**
 * Check if the badge with the given badge id can be issued to the recipient with the given recipient name and email address.
 * Checks if the issuer and the badge exist and for the current user. Returns error they don't.
 * Checks the badge has not already been issued. Returns 'cangetbadge' as false if it has plus a 'message' to explain exactly the reason.
 * Checks if the given badge is the parent to other badges that must first be awarded.
 * If the given badge has no kids, it returns 'cangetbadge' as true.
 * If the given badge has kids and not all the child badges have been earnt, it returns 'cangetbadge' as false and a 'message' as to why.
 * If the given badge has kids and all the child badges have been earnt by the given recipient, it returns 'cangetbadge' as true.
 * @param badgeid, Required. The identifier of the Badge record you wish to check against.
 * @param recipientname, Required. The name of the recipient you wish to check against. Must match an existing name in the recipient table.
 * @param recipientemail, Required. The email address of the recipient you wish to check against. Must match an existing email that goes with the given name in the recipient table.
 * @return JSON saying if the badge can be issued to the recipient
 */
exports.autoCheckCanIssueBadge = function(req, res, next) {

	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.badgeid || !data.recipientname || !data.recipientemail) {
		return res.status(400).send({"error": "You must include a recipient name and email address and a badge id for this badge issuance you want to auto issue any parent badge for"});
	}

	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;
	res.locals.uniqueid = web3.utils.sha3("assertion_" + time);

	res.locals.badgeid = data.badgeid;
	res.locals.recipientname = data.recipientname;
	res.locals.recipientemail = data.recipientemail;
	res.locals.recipientid = "";
	res.locals.canissuebadge = false;
	res.locals.message = "";

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action"});
			} else {

				// check recipient exists in our database for the given issuer/user.
				var selectquery2 = 'SELECT * from recipients where name=? AND email=? AND userid=?';
				var params2 = [res.locals.recipientname, res.locals.recipientemail,  req.user.id];
				db.get().query(selectquery2, params2, function(err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error checking recipient name and email address"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "The given recipient name and email address does not exist or does not exist in conjunction with the logged in user."});
						} else {
							res.locals.recipientid = rows2[0].id;

							var innerhandler = function(err, handlerreply) {
								if (err) {
									res.status(404).send({error: err.message});
								} else if (!handlerreply) {
									res.status(404).send({error: "Unknown error while checking if can issue badge"});
								} else {
									var reply = {
										 badgeid: res.locals.badgeid,
										 recipientname: res.locals.recipientname,
										 recipientemail: res.locals.recipientemail,
										 canissuebadge: handlerreply.canissuebadge,
										 message: handlerreply.message,
									};
									//console.log(reply);
									res.send(reply);
								}
							}
							localCheckCanIssueBadge(req.user.id, res.locals.badgeid, res.locals.recipientid, innerhandler)
						}
					}
				});
			}
		}
	});
}

/**
 * Check if the badge with the given badge id can be issued to the recipient with the given recipient id.
 * Checks if the issuer and the badge exist and for the current user. Returns error they don't.
 * Checks the badge has not already been issued. Returns 'canissuebadge' as false if it has plus a 'message' to explain exactly the reason.
 * Checks if the given badge is the parent to other badges that must first be awarded.
 * If the given badge has no kids, it returns 'canissuebadge' as true.
 * If the given badge has kids and not all the child badges have been earnt, it returns 'canissuebadge' as false and a 'message' as to why.
 * If the given badge has kids and all the child badges have been earnt by the given recipient, it returns 'canissuebadge' as true.
 * @param badgeid, Required. The identifier of the Badge record you wish to check against.
 * @param recipientid, Required. The identifier of the Recipient record you wish to check against.
 * @return JSON saying if the badge can be issued to the recipient
 */
exports.checkCanIssueBadge = function(req, res, next) {

	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.badgeid || !data.recipientid) {
		return res.status(400).send({"error": "You must include a recipientid and a badgeid for this badge issuance you want to check the issuable status for"});
	}

	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;
	res.locals.uniqueid = web3.utils.sha3("assertion_" + time);

	res.locals.badgeid = data.badgeid;
	res.locals.recipientid = data.recipientid;
	res.locals.canissuebadge = false;
	res.locals.message = "";

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action"});
			} else {
				var innerhandler = function(err, handlerreply) {
					if (err) {
						res.status(404).send({error: err.message});
					} else if (!handlerreply) {
						res.status(404).send({error: "Unknown error while checking if can issue badge"});
					} else {
						let reply = {
							 badgeid: res.locals.badgeid,
							 recipientid: res.locals.recipientid,
							 canissuebadge: handlerreply.canissuebadge,
							 message: handlerreply.message,
						};
						console.log(reply);
						res.send(reply);
					}
				}

				localCheckCanIssueBadge(req.user.id, res.locals.badgeid, res.locals.recipientid, innerhandler);
			}
		}
	});
}

/**
 * Local function to check if the recipient with the given recipientid can be issued the badge with the given badgeid
 * Checks if the issuer and the badge exist and for the current user. Returns error they don't.
 * Checks the badge has not already been issued. Returns 'canissuebadge' as false if it has plus a 'message' to explain exactly the reason.
 * Checks if the given badge is the parent to other badges that must first be awarded.
 * If the given badge has no kids, it returns 'canissuebadge' as true.
 * If the given badge has kids and not all the child badges have been earnt, it returns 'canissuebadge' as false and a 'message' as to why.
 * If the given badge has kids and all the child badges have been earnt by the given recipient, it returns 'canissuebadge' as true.
 */
function localCheckCanIssueBadge(userid, badgeid, recipientid, handler) {

	//console.log(data);
	//console.log(req.user.id);

	// should never need this as the check is done in the routes
	if (!badgeid || !recipientid) {
		handler(new Error("You must include a recipientid and a badgeid for this badge issuance you want to check the issuable status for"));
	}

	var reply = {};

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [userid], function (err, rows) {
		if (err) {
			console.log(err);
			handler(new Error("Error fetching user permissions"));
		} else {
			if (rows.length == 0) {
				handler(new Error("The logged in user account does not have the correct permissions to perform this action"));
			} else {
				// check badge exists in our database for the current issuer/user.
				let selectquery3 = 'SELECT * from badges left join issuers on badges.issuerid=issuers.id where badges.id=? AND issuers.loginuserid=?';
				let params3 = [badgeid, userid];
				db.get().query(selectquery3, params3, function(err3, rows3) {
					if (err3) {
						console.log(err3);
						handler(new Error("Error checking badge id"));
					} else {
						if (rows3.length == 0) {
							handler(new Error("The given badge id does not exist or does not exists in conjunction with the logged in user"));
						} else {
							// Check if the badge has been issued already
							let selectquery4 = "select * from badge_issued where userid=? and recipientid=? and badgeid=?";
							let params4 = [userid, recipientid, badgeid];
							db.get().query(selectquery4, params4, function(err4, rows4) {
								if (err4) {
									console.log(err4);
									handler(new Error("Error checking for existing badge issuance data"));
								} else {
									if (rows4.length > 0) {
										if (rows4[0].status == "issued") {
											reply.message = "This recipient already has received the given badge."
											reply.canissuebadge = false;
											handler(null, reply);
										} else if (rows4[0].status == "pending") {
											reply.message = "This recipient already has a pending issuance for this badge."
											reply.canissuebadge = false;
											handler(null, reply);
										} else if (rows4[0].status == "revoked") {
											reply.message = "This recipient already has received the given badge, and it has been revoked."
											reply.canissuebadge = false;
											handler(null, reply);
										}
									} else {
										// get all the child badges, if any of the given badgeid for the given issuer/user
										let selectquery5 = 'SELECT * from badges where parentbadgeid=?';
										let params5 = [badgeid, userid];
										db.get().query(selectquery5, params5, function(err5, rows5) {
											if (err5) {
												console.log(err5);
												handler(new Error("Error checking badge has sub-badges"));
											} else {
												if (rows5.length == 0) {
													// if we already know it has not been issued and it has no child badges, then it can be issued.
													reply.canissuebadge = true;
													handler(null, reply);
												} else {
													// check the issued status of all the child badges.
													let badgeids = "";
													for(let i=0; i<rows5.length; i++) {
														badgeids += "'"+rows5[i].id+"'";
														if (i<rows5.length-1) {
															badgeids += ",";
														}
													}

													let selectquery6 = "select * from badge_issued where userid=? and recipientid=? and badgeid IN ("+badgeids+")";
													let params6 = [req.user.id, data.recipientid];
													db.get().query(selectquery6, params6, function(err6, rows6) {
														if (err6) {
															console.log(err6);
															handler(new Error("Error checking for existing badge issuance data"));
														} else {
															if (rows6.length > 0) {
																// if not all the sub-badges are in the issued tabled then you definately can't be issued this badge yet.
																if (rows6.length < rows5.length) {
																	reply.message = "This recipient has not yet earnt all dependent sub-badges for this badge."
																	reply.canissuebadge = false;
																	handler(null, reply);
																} else {
																	// check the status of all the sub-badges is issued
																	let allissued = true;
																	for (let j=0; j<rows6.length; j++) {
																		if (rows6[j].status != 'issued') {
																			allissued = false;
																		}
																	}

																	if (allissued === false) {
																		reply.message = "All the sub-badge for the given badge are in the issued table but not all have the status 'issued'";
																		reply.canissuebadge = false;
																		handler(null, reply);
																	} else {
																		reply.canissuebadge = true;
																		handler(null, reply);
																	}
																}
															} else {
																reply.message = "This recipient has not yet earnt any depended sub-badges for this badge."
																reply.canissuebadge = false;
																handler(null, reply);
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
}

/**
 * This is for a user to issue a badge based on owning a qualifying badge from another source
 * The recipient must be in the system (with a login).
 */
exports.qualifyingClaimAssertion = function(req, res, next) {

	var data = matchedData(req);

	if (!data.claimsassertion) {
		return res.status(400).send({"error": "You must include an assertion url for the qualifying badge for this badge issuance"});
	}

	res.locals.claimsassertion = data.claimsassertion;

	// To hold the pulled JSON objects
	res.locals.assertion = {};
	res.locals.badge = {};
	res.locals.issuer = {};
	res.locals.recipient = {};

	let loadHandler = function(err, response) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error loading assertion JSON from assertion url."});
		}
		if (!err && response.statusCode == 200) {
			try {
				res.locals.assertion = JSON.parse(response.body);

				if (res.locals.assertion.badge == undefined || res.locals.assertion.recipient == undefined) {
					return res.status(404).send({"error": "Error loading assertion JSON from assertion url."});
				} else {
					res.locals.recipient = res.locals.assertion.recipient;

					let assertionLoadHandler = function(err2, response2) {
						if (err2) {
							console.log(err2);
							return res.status(404).send({"error": "Error loading badge JSON from assertion url."});
						}
						if (!err2 && response2.statusCode == 200) {
							try {
								let badge = JSON.parse(response2.body);

								// need to do same clean as done in form when adding qualifying badge data.
								res.locals.badge.title = utilities.demicrosoftize(badge.name);
								res.locals.badge.description = utilities.demicrosoftize(badge.description);

								//console.log(badge);

								if (badge.issuer == undefined) {
									return res.status(404).send({"error": "Error loading issuer JSON from assertion url."});
								} else {
									let issuerLoadHandler = function(err3, response3) {
										if (err3) {
											console.log(err3);
											return res.status(404).send({"error": "Error loading issuer JSON from assertion url."});
										}
										if (!err3 && response3.statusCode == 200) {
											try {
												var issuer = JSON.parse(response3.body);
												res.locals.issuer = issuer;

												// need to do same clean as done in form when adding qualifying badge data.
												res.locals.issuer.name = utilities.demicrosoftize(res.locals.issuer.name);
												//console.log(issuer);

												let identityok = utilities.validateEncodedEmail(req.user.email, res.locals.recipient.identity, res.locals.recipient.salt);
												if (identityok == false) {
													return res.status(404).send({"error": "Recipient identity does not match the qualifying badge"});
												} else {
													claimAssertion(res, res.locals.assertion.issuedOn, req.user.id, req.user.fullname, req.user.email);
												}
											}
											catch(err) {
												return res.status(404).send({"error": "Error loading issuer JSON from assertion url."});
											}
									    } else {
											return res.status(404).send({"error": "Error loading issuer JSON from assertion url."});
									    }
									}

									utilities.loadUrl(badge.issuer, issuerLoadHandler);
								}
							}
							catch(err) {
								return res.status(404).send({"error": "Error loading badge JSON from assertion url."});
							}
					    } else {
							return res.status(404).send({"error": "Error loading badge JSON from assertion url."});
					    }
					}

					utilities.loadUrl(res.locals.assertion.badge, assertionLoadHandler);
				}
			}
			catch(err) {
				console.log(err);
				return res.status(404).send({"error": "Error loading assertion JSON from assertion url."});
			}
	    } else {
			console.log(response);
			return res.status(404).send({"error": "Error loading assertion JSON from assertion url."});
	    }
	}

	utilities.loadUrl(data.claimsassertion, loadHandler);
}


function claimAssertion(res, qualifyingBadgeIssuedOn, userid, recipientname, recipientemail) {

	// locally used variables on res
	res.locals.assertionObject = {};
	res.locals.assertionjson = "";
	res.locals.assertionjsonhash = "";
	res.locals.badgefilepath = "";

	res.locals.id = "";
	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;
	res.locals.issuedon = time;
	res.locals.uniqueid = web3.utils.sha3("assertion_" + time);
	res.locals.status = "pending";

	res.locals.badgeid = "";
	res.locals.recipientid = "";
	res.locals.tokenmetadataurl = "";
	res.locals.transaction = "";
	res.locals.tokenid = "";
	res.locals.revokedreason = "";

	res.locals.tokenContractAddress = cfg.tokenContractAddress;
	if (db.getMode() === db.MODE_TEST) {
		res.locals.tokenContractAddress = cfg.testTokenContractAddress;
	}

	var query = 'SELECT * FROM badge_claimable WHERE title=? AND description=? AND issuername=? AND issuerurl=? AND enabled=1';
	db.get().query(query, [res.locals.badge.title, res.locals.badge.description, res.locals.issuer.name, res.locals.issuer.url], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error checking badge for qualification for a claim"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The submitted badge details do not match any currently active qualifying badge record"});
			} else {

				res.locals.badgeid = rows[0].badgeid;

				var domain = rows[0].domain;

				console.log("claimsassertion:"+res.locals.claimsassertion);

				if (!res.locals.claimsassertion.includes(domain)) {
					res.status(404).send({error: "Badge assertion url does not match the domain required for the qualifying badge record"});
				} else if (rows[0].startdate > 0 && qualifyingBadgeIssuedOn < rows[0].startdate){
					res.status(404).send({error: "Badge issued date invalid for qualifying badge record"});
				} else if (rows[0].enddate > 0 && qualifyingBadgeIssuedOn > (rows[0].enddate + (24 * 60 * 60 * 1000 -1))){
					res.status(404).send({error: "Badge issued date invalid for qualifying badge record"});
				} else {
					res.locals.badgeclaimableid = rows[0].id;

					let query = 'SELECT b.title, b.description, b.imageurl, i.name, i.url, i.imageurl AS issuerimage, ';
					query += 'i.loginuserid AS theissuer FROM badges AS b, issuers AS i ';
					query += 'WHERE b.id=? AND b.issuerid = i.id';

					db.get().query(query, [rows[0].badgeid], function (err2, rows2) {
						if (err2) {
							console.log(err2);
							res.status(404).send({error: "Error checking badge for qualification for a claim"});
						} else {
							if (rows2.length == 0) {
								res.status(404).send({error: "Database error - no matching badge relating to this qualifying badge record"});
							} else {
								// At this point recipient email matches qualifying badge
								// qualifying badge matches a curernt claimable badge record

								res.locals.issuer.id = rows2[0].theissuer;

								//console.log(res.locals.issuer);

								var tokenContractAddress = cfg.tokenContractAddress;
								if (db.getMode() === db.MODE_TEST) {
									tokenContractAddress = cfg.testTokenContractAddress;
								}
								//data.address = tokenContractAddress;

								//console.log("Issuer id: "+res.locals.issuer.id);

								let issuerquery = 'SELECT rolename FROM users ';
								issuerquery += 'LEFT JOIN user_roles ON users.id = user_roles.personid ';
								issuerquery += 'LEFT JOIN roles ON user_roles.roleid = roles.id ';
								issuerquery += 'WHERE users.id=? AND roles.rolename IN ("issuer")';
								db.get().query(issuerquery, [res.locals.issuer.id], function (err4, rows4) {
									if (err4) {
										console.log(err4);
										res.status(404).send({error: "Error fetching user permissions"});
									} else {
										if (rows4.length == 0) {
											res.status(404).send({error: "Badge issuer account not found"});
										} else {

											let recipientHandler = function(err5, recipientid) {
												if (err5 && err5.message && err5.message != "") {
													res.status(404).send({error: err5.message});
												} else if (recipientid == undefined) {
													res.status(404).send({error: "Unknown error getting issuer account details"});
												} else {
													res.locals.recipientid = recipientid;
													//console.log("Recipient ID = " + res.locals.recipientid);

													let alreadyIssuedHandler = function(err6, pendingid) {
														if (err6 && err6.message && err6.message != "") {
															res.status(404).send({error: err6.message});
														} else if (recipientid == undefined) {
															res.status(404).send({error: "Unknown error checking if badge already issued"});
														} else {
															if (pendingid) {
																res.locals.id = pendingid;
															}

															let loadAssertionHandler = function(errAssertion, assertionObject) {

																if (errAssertion && errAssertion.message && errAssertion.message != "") {
																	res.status(404).send({error: errAssertion.message});
																} else if (!assertionObject) {
																	res.status(404).send({error: "Unknown error fetching assertion data"});
																} else {
																	/*
																		let assertionObject = {};
																		assertionObject.id
																		assertionObject.uniqueid
																		assertionObject.badgeid
																		assertionObject.badgerdfstoreaddress
																		assertionObject.recipientid
																		assertionObject.recipientuserid
																		assertionObject.recipientaccount
																		assertionObject.recipientemail
																		assertionObject.recipientname
																		assertionObject.recipientloginuserid
																		assertionObject.issuername
																		assertionObject.issueraccount
																		assertionObject.issuerpassword
																	*/

																	res.locals.assertionObject = assertionObject;

																	let assertionJSONHandler = function(err1, assertionjson) {

																		if (err1 && err1.message && err1.message != "") {
																			res.status(404).send({error: err1.message});
																		} else if (!assertionjson) {
																			res.status(404).send({error: "Unknown error getting assertion json"});
																		} else {
																			res.locals.assertionjson = assertionjson;

																			let badgeJSONHandler = function(err2, badgejson) {

																				console.log(err);
																				console.log(badgejson);

																				if (err2 && err2.message && err2.message != "") {
																					res.status(404).send({error: err2.message});
																				} else if (!badgejson) {
																					res.status(404).send({error: "Unknown error getting badge json"});
																				} else {
																					res.locals.assertionjson.badge = badgejson;
																					//console.log(badgejson);

																					let evidenceJSONHandler = function(err3, evidence) {

																						if (err3 && err3.message && err.message != "") {
																							res.status(404).send({error: err3.message});
																						} else if (!evidence) {
																							res.status(404).send({error: "Unknown error getting evidence json"});
																						} else {
																							if (evidence && evidence.length > 0) {
																								res.locals.assertionjson.evidence = evidence;
																							}
																							//console.log(evidence);

																							let canonicaliseJSONHandler = function(err4, canonized) {
																								//console.log("IN PROCESS RETURN");
																								if (err4) {
																									//console.log(err);
																									res.status(404).send({error: "Error converting badge JSON to n-triples"});
																								} else {
																									console.log("IN CANONIZED DATA ON WAY OUT - ASSERTION");
																									//console.log(canonized);

																									let createTokenMetadataHandler = function(err5, metadataurl) {

																										if (err5 && err5.message && err5.message != "") {
																											res.status(404).send({error: err5.message});
																										} else if (!evidence) {
																											res.status(404).send({error: "Unknown error creating badge metatdata url"});
																										} else {
																											res.locals.tokenmetadataurl = metadataurl;

																											let issueHandler = function(err6, issuereply) {

																												if (err6 && err6.message && err6.message != "") {
																													res.status(404).send({error: err6.message});
																												} else if (!issuereply) {
																													res.status(404).send({error: "Unknown error issuing badge token"});
																												} else {
																													// complete the return data elements
																													res.locals.transaction = issuereply.transaction;
																													res.locals.tokenid = issuereply.tokenid;
																													res.locals.status = "issued";

																													let creaetBadgeClaimEntryHandler = function(err6a, claimrecordid) {

																														if (err6a && err6a.message && err6a.message != "") {
																															res.status(404).send({error: err6a.message});
																														} else if (!claimrecordid) {
																															res.status(404).send({error: "Unknown error updating badge claim record"});
																														} else {

																															let signatureJSONHandler = function(err7, signature) {

																																if (err7 && err7.message && err7.message != "") {
																																	res.status(404).send({error: err7.message});
																																} else if (!signature) {
																																	res.status(404).send({error: "Unknown error getting signature JSON"});
																																} else {
																																	res.locals.assertionjson.signature = signature;

																																	// add the final json to the database
																																	let updateAssertionJSONHandler = function(err8, saved) {

																																		if (err8 && err8.message && err8.message != "") {
																																			res.status(404).send({error: err8.message});
																																		} else if (!saved) {
																																			res.status(404).send({error: "Unknown error updateing assertion json in database"});
																																		} else {

																																			// create the badge file
																																			let badgeFileHandler = function(err9, badgefilepath) {

																																				if (err9 && err9.message && err9.message != "") {
																																					res.status(404).send({error: err9.message});
																																				} else if (!badgefilepath) {
																																					res.status(404).send({error: "Unknown error creating badge file"});
																																				} else {

																																					res.locals.badgefilepath = badgefilepath;

																																					// email the recipient
																																					let emailRecipientHandler = function(err10, info) {
																																						if (err10 && err10.message && err10.message != "") {
																																							res.status(404).send({error: err10.message});
																																						} else if (!info) {
																																							res.status(404).send({error: "Unknown error emailing recipient"});
																																						} else {

																																							var reply = {
																																								 id: res.locals.id,
																																								 timecreated: res.locals.timecreated,
																																								 uniqueid: res.locals.uniqueid,
																																								 badgeid: res.locals.badgeid,
																																								 recipientid: res.locals.recipientid,
																																								 issuedon: res.locals.issuedon,
																																								 tokenmetadataurl: res.locals.tokenmetadataurl,
																																								 blockchainaddress: res.locals.tokenContractAddress,
																																								 transaction: res.locals.transaction,
																																								 tokenid: res.locals.tokenid,
																																								 revokedreason: res.locals.revokedreason,
																																								 status: res.locals.status,
																																							};

																																							//console.log(reply);
																																							res.send(reply);
																																						}
																																					}

																																					notifyRecipientOfBadgeIssuance(
																																							res.locals.assertionObject.recipientemail,
																																							res.locals.assertionObject.recipientname,
																																							res.locals.recipientid,
																																							res.locals.assertionjson.badge.name,
																																							res.locals.badgefilepath,
																																							res.locals.assertionObject.recipientloginuserid,
																																							emailRecipientHandler);
																																				}
																																			}

																																			createOpenBadgeFile(
																																					res.locals.id,
																																					res.locals.assertionjson,
																																					res.locals.assertionjsonhash,
																																					res.locals.badgeid,
																																					badgeFileHandler);
																																		}
																																	}

																																	updateAssertionJSON(
																																			res.locals.id,
																																			res.locals.assertionjson,
																																			updateAssertionJSONHandler);

																																}
																															}

																															makeSignatureJSON(
																																	res.locals.tokenContractAddress,
																																	res.locals.assertionjsonhash,
																																	res.locals.tokenid,
																																	cfg.hashingAlgorithm,
																																	cfg.canonicalizationAlgorithm,
																																	signatureJSONHandler);
																														}
																													}

																													createBadgeClaimEntry(
																															res.locals.badgeclaimableid,
																															res.locals.recipientid,
																															res.locals.claimsassertion,
																															res.locals.id,
																															creaetBadgeClaimEntryHandler);
																												}
																											}

																											issueToken(
																													res.locals.id,
																													res.locals.tokenContractAddress,
																													res.locals.assertionObject.badgerdfstoreaddress,
																													res.locals.tokenmetadataurl,
																													res.locals.assertionObject.issueraccount,
																													res.locals.assertionObject.issuerpassword,
																													res.locals.assertionObject.recipientaccount,
																													res.locals.assertionjsonhash,
																													res.locals.issuer.id,
																													res.locals.recipientid,
																													res.locals.issuedon,
																													issueHandler);
																										}
																									}

																									res.locals.assertionjsonhash = web3.utils.sha3(canonized);

																									createTokenMetadata(
																											res.locals.id,
																											res.locals.assertionjson.badge.name,
																											res.locals.assertionjson.badge.description,
																											res.locals.assertionjson.badge.image,
																											res.locals.assertionjsonhash,
																											cfg.hashingAlgorithm,
																											cfg.canonicalizationAlgorithm,
																											createTokenMetadataHandler);
																								}
																							}
																							utilities.canonicalise(res.locals.assertionjson, canonicaliseJSONHandler);
																						}
																					}
																					createEvidenceJSON(res.locals.id, evidenceJSONHandler);
																				}
																			}

																			// Only create the RDFStore contract if badge does not have the an rdfstore address already
																			// This will create the badge JSON as part of the procss, so data.badgejson will be on the data object when it returns.
																			if (!res.locals.assertionObject.badgerdfstoreaddress
																					|| res.locals.assertionObject.badgerdfstoreaddress == ""
																						|| res.locals.assertionObject.badgerdfstoreaddress == null) {


																				let rdfStoreForBadgeHandler = function(err11, reply) {
																					if (err11 && err11.message && err11.message != "") {
																						res.status(404).send({error: err11.message});
																					} else if (reply) {
																						res.locals.assertionObject.badgerdfstoreaddress = reply.rdfstorecontract;
																						badgeJSONHandler(null, reply.badgejson);
																					} else {
																						res.status(404).send({error: "Unknown error creating RDFStore for Badge"});
																					}
																				}

																				badge_model.createRDFStoreForBadge(res.locals.badgeid, res.locals.assertionObject.issueraccount, rdfStoreForBadgeHandler);
																			} else {
																				badge_model.getBadgeOpenBadgeJSON(res.locals.badgeid, badgeJSONHandler);
																			}
																		}
																	}

																	createInitialAssertionJSON(
																			res.locals.issuedon,
																			res.locals.assertionObject.uniqueid,
																			res.locals.assertionObject.issueraccount,
																			res.locals.assertionObject.recipientemail,
																			res.locals.assertionObject.recipientaccount,
																			assertionJSONHandler);
																}
															}
															if (!pendingid) {
																var badgeIssuedHandler = function(err, assertionid) {
																	if (err) {
																		res.status(404).send({error: err.message});
																	} else {
																		res.locals.id = assertionid;
																		//data.id = assertionid;
																		loadAssertion(res.locals.issuer.id, res.locals.id, loadAssertionHandler);
																	}
																}
																claimInsertBadgeIssued(res.locals.issuer.id, res.locals.timecreated, res.locals.uniqueid, res.locals.recipientid, res.locals.badgeid, badgeIssuedHandler);
															} else {
																loadAssertion(userid, res.locals.id, loadAssertionHandler);
															}
														}
													}

													claimAlreadyIssuedCheck(res.locals.issuer.id, res.locals.recipientid, res.locals.badgeid, alreadyIssuedHandler);
												}
											}

											res.locals.recipientname = recipientname;
											res.locals.recipientemail = recipientemail;

											claimRecipientCheck(res.locals.recipientname, res.locals.recipientemail, userid, recipientHandler);
										}
									}
								});
							}
						}
					});
				}
			}
		}
	});
}


function claimRecipientCheck(recipientname, recipientemail, userid, handler) {

	if (recipientname && recipientemail && userid &&
			recipientname != "" && recipientemail != "" && userid != "" &&
			recipientname != null && recipientemail != null && userid != null) {

		let selectquery = 'SELECT * FROM recipients WHERE name=? AND email=? AND userid=? AND loginuserid=userid';
		let params = [recipientname, recipientemail, userid];
		db.get().query(selectquery, params, function (err, rows) {
			if (err) {
				console.log(err);
				handler(new Error("Error checking recipient name and email address"));
			} else {
				if (rows.length == 0) {
					handler(new Error("The given recipient name and email address does not exist or does not exist in conjunction with the logged in user."));
				} else {
					handler(null, rows[0].id);
				}
			}
		});
	} else {
		handler(new Error("Missing required parameters checking recipient"));
	}
}

function claimAlreadyIssuedCheck(issuerid, recipientid, badgeid, handler) {

	if (issuerid && recipientid && badgeid &&
			issuerid != "" && recipientid != "" && badgeid != "" &&
			issuerid != null && recipientid != null && badgeid != null) {

		var selectquery = "SELECT * FROM badge_issued WHERE userid=? AND recipientid=? AND badgeid=?";
		var params = [issuerid, recipientid, badgeid];
		db.get().query(selectquery, params, function(err, rows) {
			if (err) {
				console.log(err);
				handler(new Error("Error checking for existing badge issuance data"));
			} else {
				if (rows.length > 0) {
					if (rows[0].status == "pending") {
						handler(null, rows[0].id);
					}else {
						handler(new Error("This badge has already been claimed."));
					}
				} else {
					handler(null, false);
				}
			}
		});
	} else {
		handler(new Error("Missing required parameters checking if badge already issued to recipient"));
	}
}

function claimInsertBadgeIssued (issueruserid, timecreated, uniqueid, recipientid, badgeid, handler) {

	if (issueruserid && timecreated && uniqueid && recipientid && badgeid &&
			issueruserid != "" && timecreated != "" && uniqueid != "" && recipientid != "" && badgeid != "" &&
			issueruserid != null && timecreated != null && uniqueid != null && recipientid != null && badgeid != null) {

		// add new record
		var insertquery = 'INSERT INTO badge_issued (userid, timecreated, uniqueid, recipientid, badgeid) VALUES (?,?,?,?,?)';
		var params = [issueruserid, timecreated, uniqueid, recipientid, badgeid];
		db.get().query(insertquery, params, function(err2, result2) {
			if (err2) {
				console.log(err2);
				handler(new Error("Error saving badge issuance data"));
			} else {
				console.log("Badge issuance saved for claim");
				handler(null, result2.insertId);
			}
		});
	} else {
		handler(new Error("Missing required parameters adding assertion record for claim"));
	}
}

function createBadgeClaimEntry(badgeclaimableid, recipientid, claimsassertion, assertionid, handler) {

	if (badgeclaimableid && badgeclaimableid!= null && badgeclaimableid != "" &&
			recipientid && recipientid!= null && recipientid != "" &&
			claimsassertion && claimsassertion!= null && claimsassertion != "" &&
			assertionid && assertionid!= null && assertionid != "") {

		var time = Math.floor((new Date().getTime()) / 1000);
		var insertquery = 'INSERT INTO badge_claimed (claimableid, recipientid, qualifying_assertion, timecreated, badgeissuedid) VALUES (?,?,?,?,?)';
		var params = [badgeclaimableid, recipientid, claimsassertion, time, assertionid];
		db.get().query(insertquery, params, function(err, result) {
			if (err) {
				console.log(err);
				handler(new Error("Error saving badge claimed data"));
			} else {
				handler(null, result.insertId);
			}
		});
	} else {
		handler(new Error("Missing "));
	}
}

/**
 * This is for an automated issue process to call creating and issuing in one go - where no eveidence is required to be added at the pending state
 * The recipient must be in the system (with or without a login).
 * Issue a badge to a recipient with the given name and email address in one process without adding evidence. The recipient must already exist in the database against the current user/issuer. If successful, the recipient will be emailed their badge.
 * @param badgeid, Required. The identifier of the Badge record you wish to issue.
 * @param recipientname, Required. The name of the recipient you wish to issue to. Must match an existing name in the recipient table.
 * @param recipientemail, Required. The email address of the recipient you wish to issue to. Must match an existing email that goes with the given name in the recipient table.
 * @return JSON of the issued badge or a JSON error object
 */

exports.autoIssueAssertion = function(req, res, next) {

	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.badgeid || !data.recipientname || !data.recipientemail) {
		return res.status(400).send({"error": "You must include a recipient name and email address and a badge id for this badge issuance"});
	}

	res.locals.assertionjson = "";
	res.locals.assertionObject = {};
	res.locals.tokenmetadataurl = "";

	// used for return object
	let time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;
	res.locals.uniqueid = web3.utils.sha3("assertion_" + time);
	res.locals.badgeid = data.badgeid;
	res.locals.recipientname = data.recipientname;
	res.locals.recipientemail = data.recipientemail;
	res.locals.issuedon = time;

	// these will be empty at this stage as record - added for completing return record
	res.locals.id = "";
	res.locals.recipientid = "";
	res.locals.tokenmetadataurl = "";
	res.locals.revokedreason = "";
	res.locals.transaction = "";
	res.locals.tokenid = "";
	res.locals.lasttokenid = "";
	res.locals.revokedreason = "";
	res.locals.status = "pending";

	res.locals.recipient = "";

	res.locals.tokenContractAddress = cfg.tokenContractAddress;
	if (db.getMode() === db.MODE_TEST) {
		res.locals.tokenContractAddress = cfg.testTokenContractAddress;
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action"});
			} else {
				// check badge exists in our database.
				let selectquery = 'SELECT * from badges left join issuers on badges.issuerid = issuers.id left join users on issuers.loginuserid = users.id where badges.id=? AND issuers.loginuserid=?';
				let params = [res.locals.badgeid, req.user.id];
				db.get().query(selectquery, params, function(err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error checking badge id"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "The given badge id does not exist or does not exists in conjunction with the logged in user"});
						} else {
							// check recipient exists in our database.
							let selectquery2 = 'SELECT * from recipients where name=? AND email=? AND userid=?';
							let params2 = [res.locals.recipientname, res.locals.recipientemail,  req.user.id];
							db.get().query(selectquery2, params2, function(err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error checking recipient name and email address"});
								} else {
									if (rows3.length == 0) {
										res.status(404).send({error: "The given recipient name and email address does not exist or does not exist in conjunction with the logged in user."});
										// create recipient
									} else {
										res.locals.recipientid = rows3[0].id;

										// check same issuance not added twice
										var selectquery4 = "select * from badge_issued where userid=? and recipientid=? and badgeid=?";
										var params4 = [req.user.id, res.locals.recipientid, res.locals.badgeid];
										db.get().query(selectquery4, params4, function(err4, rows4) {
											if (err4) {
												console.log(err4);
												res.status(404).send({error: "Error checking for existing badge issuance data"});
											} else {
												if (rows4.length > 0) {
													res.status(404).send({error: "This recipient has already been assigned this badge."});
												} else {

													console.log("ABOUT TO ADD PENDING ISSUANCE");

													// add new record
													var insertquery5 = 'INSERT INTO badge_issued (userid, timecreated, uniqueid, recipientid, badgeid) VALUES (?,?,?,?,?)';
													var params5 = [req.user.id, res.locals.timecreated, res.locals.uniqueid, res.locals.recipientid, res.locals.badgeid];
													db.get().query(insertquery5, params5, function(err5, result5) {
														if (err5) {
															console.log(err5);
															res.status(404).send({error: "Error saving badge issuance data"});
														} else {
															console.log("badge issuance saved");

															// Need both for other function calls and the return;
															res.locals.id = result5.insertId;

															console.log("ISSUANCE ID = "+res.locals.id);

															let loadAssertionHandler = function(errAssertion, assertionObject) {

																if (errAssertion && errAssertion.message && errAssertion.message != "") {
																	res.status(404).send({error: errAssertion.message});
																} else if (!assertionObject) {
																	res.status(404).send({error: "Unknown error fetching assertion data"});
																} else {
																	/*
																		let assertionObject = {};
																		assertionObject.id
																		assertionObject.uniqueid
																		assertionObject.badgeid
																		assertionObject.badgerdfstoreaddress
																		assertionObject.recipientid
																		assertionObject.recipientuserid
																		assertionObject.recipientaccount
																		assertionObject.recipientemail
																		assertionObject.recipientname
																		assertionObject.recipientloginuserid
																		assertionObject.issuername
																		assertionObject.issueraccount
																		assertionObject.issuerpassword
																	*/

																	res.locals.assertionObject = assertionObject;

																	let assertionJSONHandler = function(err, assertionjson) {

																		if (err && err.message && err.message != "") {
																			res.status(404).send({"error": err.message})
																		} else if (!assertionjson) {
																			res.status(404).send({"error": "Unknown error getting initial assertion JSON"});
																		} else {

																			res.locals.assertionjson  = assertionjson;
																			//console.log(assertionjson);

																			let badgeJSONHandler = function(err2, badgejson) {

																				if (err2 && err2.message && err2.message != "") {
																					res.status(404).send({error: err2.message});
																				} else if (!badgejson) {
																					res.status(404).send({error: "Unknown error getting badge json"});
																				} else {
																					res.locals.assertionjson.badge = badgejson;
																					//console.log(badgejson);

																					let evidenceJSONHandler = function(err3, evidence) {

																						if (err3 && err3.message) {
																							res.status(404).send({error: err3.message});
																						} else {
																							if (evidence && evidence.length>0) {
																								res.locals.assertionjson.evidence = evidence;
																							}
																							//console.log(evidence);

																							let canonicaliseJSONHandler = function(err4, canonized) {
																								//console.log("IN PROCESS RETURN");
																								if (err4) {
																									//console.log(err);
																									res.status(404).send({error: "Error converting badge JSON to n-triples"});
																								} else {
																									//console.log("IN CANONIZED DATA ON WAY OUT - ASSERTION");
																									//console.log(canonized);

																									res.locals.assertionjsonhash = web3.utils.sha3(canonized);

																									let createTokenMetadataHandler = function(err5, metadataurl) {

																										if (err5 && err5.message && err5.message != "") {
																											res.status(404).send({error: err5.message});
																										} else if (!evidence) {
																											res.status(404).send({error: "Unknown error creating badge metatdata url"});
																										} else {
																											res.locals.tokenmetadataurl = metadataurl;
																											//console.log("about to issueToken with url:"+metadataurl);

																											let issueHandler = function(err6, issuereply) {
																												if (err6 && err6.message && err6.message != "") {
																													res.status(404).send({error: err6.message});
																												} else if (!issuereply) {
																													res.status(404).send({error: "Unknown error issuing badge token"});
																												} else {

																													// complete the return data elements
																													res.locals.transaction = issuereply.transaction;
																													res.locals.tokenid = issuereply.tokenid;
																													res.locals.status = "issued";

																													// get the signature part of the JSON
																													let signatureJSONHandler = function(err7, signature) {

																														if (err7 && err7.message && err7.message != "") {
																															res.status(404).send({error: err7.message});
																														} else if (!signature) {
																															res.status(404).send({error: "Unknown error updateing assertion json in database"});
																														} else {

																															res.locals.assertionjson.signature = signature;

																															// add the final json to the database
																															let updateAssertionJSONHandler = function(err8, saved) {

																																if (err8 && err8.message && err8.message != "") {
																																	res.status(404).send({error: err8.message});
																																} else if (!saved) {
																																	res.status(404).send({error: "Unknown error updateing assertion json in database"});
																																} else {

																																	// create the badge file
																																	let badgeFileHandler = function(err9, badgefilepath) {

																																		if (err9 && err9.message && err9.message != "") {
																																			res.status(404).send({error: err9.message});
																																		} else if (!badgefilepath) {
																																			res.status(404).send({error: "Unknown error creating badge file"});
																																		} else {

																																			res.locals.badgefilepath = badgefilepath;

																																			// email the recipient
																																			let emailRecipientHandler = function(err10, info) {
																																				if (err10 && err10.message && err10.message != "") {
																																					res.status(404).send({error: err10.message});
																																				} else if (!info) {
																																					res.status(404).send({error: "Unknown error emailing recipient"});
																																				} else {

																																					let reply = {
																																						 id: res.locals.id,
																																						 timecreated: res.locals.timecreated,
																																						 uniqueid: res.locals.uniqueid,
																																						 badgeid: res.locals.badgeid,
																																						 recipientid: res.locals.recipientid,
																																						 issuedon: res.locals.issuedon,
																																						 tokenmetadataurl: res.locals.tokenmetadataurl,
																																						 blockchainaddress: res.locals.tokenContractAddress,
																																						 transaction: res.locals.transaction,
																																						 tokenid: res.locals.tokenid,
																																						 revokedreason: res.locals.revokedreason,
																																						 status: res.locals.status,
																																					};
																																					res.send(reply);
																																				}
																																			}

																																			notifyRecipientOfBadgeIssuance(
																																					res.locals.assertionObject.recipientemail,
																																					res.locals.assertionObject.recipientname,
																																					res.locals.recipientid,
																																					res.locals.assertionjson.badge.name,
																																					res.locals.badgefilepath,
																																					res.locals.assertionObject.recipientloginuserid,
																																					emailRecipientHandler);
																																		}
																																	}

																																	createOpenBadgeFile(
																																			res.locals.id,
																																			res.locals.assertionjson,
																																			res.locals.assertionjsonhash,
																																			res.locals.badgeid,
																																			badgeFileHandler);
																																}
																															}

																															updateAssertionJSON(
																																	res.locals.id,
																																	res.locals.assertionjson,
																																	updateAssertionJSONHandler);
																														}
																													}

																													makeSignatureJSON(
																															res.locals.tokenContractAddress,
																															res.locals.assertionjsonhash,
																															res.locals.tokenid,
																															cfg.hashingAlgorithm,
																															cfg.canonicalizationAlgorithm,
																															signatureJSONHandler);
																												}
																											}

																											issueToken(
																													res.locals.id,
																													res.locals.tokenContractAddress,
																													res.locals.assertionObject.badgerdfstoreaddress,
																													res.locals.tokenmetadataurl,
																													res.locals.assertionObject.issueraccount,
																													res.locals.assertionObject.issuerpassword,
																													res.locals.assertionObject.recipientaccount,
																													res.locals.assertionjsonhash,
																													req.user.id,
																													res.locals.recipientid,
																													res.locals.issuedon,
																													issueHandler);
																										}
																									}

																									createTokenMetadata(
																											res.locals.id,
																											res.locals.assertionjson.badge.name,
																											res.locals.assertionjson.badge.description,
																											res.locals.assertionjson.badge.image,
																											res.locals.assertionjsonhash,
																											cfg.hashingAlgorithm,
																											cfg.canonicalizationAlgorithm,
																											createTokenMetadataHandler);
																								}
																							}

																							utilities.canonicalise(res.locals.assertionjson, canonicaliseJSONHandler);
																						}
																					}
																					createEvidenceJSON(res.locals.id, evidenceJSONHandler);
																				}
																			}

																			// Only create the RDFStore contract if badge does not have the an rdfstore address already
																			// This will create the badge JSON as part of the procss, so data.badgejson will be on the data object when it returns.

																			console.log(res.locals.assertionObject);

																			if (!res.locals.assertionObject.badgerdfstoreaddress
																					|| res.locals.assertionObject.badgerdfstoreaddress == ""
																						|| res.locals.assertionObject.badgerdfstoreaddress == null) {


																				let rdfStoreForBadgeHandler = function(err11, reply) {
																					if (err11 && err11.message && err11.message != "") {
																						res.status(404).send({error: err11.message});
																					} else if (reply) {
																						res.locals.assertionObject.badgerdfstoreaddress = reply.rdfstorecontract;
																						badgeJSONHandler(null, reply.badgejson);
																					} else {
																						res.status(404).send({error: "Unknown error creating RDFStore for Badge"});
																					}
																				}

																				badge_model.createRDFStoreForBadge(res.locals.badgeid, res.locals.assertionObject.issueraccount, rdfStoreForBadgeHandler);
																			} else {
																				badge_model.getBadgeOpenBadgeJSON(res.locals.badgeid, badgeJSONHandler);
																			}
																		}
																	}

																	createInitialAssertionJSON(
																			res.locals.issuedon,
																			res.locals.assertionObject.uniqueid,
																			res.locals.assertionObject.issueraccount,
																			res.locals.assertionObject.recipientemail,
																			res.locals.assertionObject.recipientaccount,
																			assertionJSONHandler);
																	}
															}

															loadAssertion(req.user.id, res.locals.id, loadAssertionHandler);
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

/**
 * Create a pending Badge issuance
 * @param badgeid, Required. The Badge id for the badge you want to update create an issuance for.
 * @param recipientid, Required. The Recipient id for the Recipient you want to issue the badge to.
 * @return JSON of the issued badge or a JSON error object
 */
exports.createAssertion = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if  ((!data.badgeid || (data.badgeid && data.badgeid != "")) && (!data.recipientid || (data.recipient && data.recipientid != "")) ) {
		return res.status(400).send({"error": "You must include a recipient id and a badge id for this badge issuance"});
	}

	res.locals.id = "";

	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;
	res.locals.uniqueid = web3.utils.sha3("assertion_" + time);

	res.locals.badgeid = data.badgeid;
	res.locals.recipientid = data.recipientid;

	// these will be empty at this stage as record - added for completing retun record
	res.locals.issuedon = "";
	res.locals.tokenmetadataurl = "";
	res.locals.revokedreason = "";
	res.locals.blockchainaddress = "";
	res.locals.transaction = "";
	res.locals.tokenid = "";

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				// check badge exists in our database.
				var selectquery = 'SELECT * from badges left join issuers on badges.issuerid = issuers.id left join users on issuers.loginuserid = users.id where badges.id=? AND issuers.loginuserid=?';
				var params = [res.locals.badgeid, req.user.id];
				db.get().query(selectquery, params, function(err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error checking badge id"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "The given badge id does not exist or does not exists in conjunction with the logged in user."});
						} else {
							// check recipient exists in our database.
							var selectquery2 = 'SELECT * from recipients where id=? AND userid=?';
							var params2 = [res.locals.recipient, req.user.id];
							db.get().query(selectquery2, params2, function(err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error checking recipient id"});
								} else {
									if (rows2.length == 0) {
										res.status(404).send({error: "The given recipient id does not exist or does not exists in conjunction with the logged in user."});
									} else {

										// check same issuance not added twice
										var selectquery4 = "select * from badge_issued where userid=? and recipientid=? and badgeid=?";
										var params4 = [req.user.id, res.locals.recipientid, res.locals.badgeid];
										db.get().query(selectquery4, params4, function(err4, rows4) {
											if (err4) {
												console.log(err4);
												res.status(404).send({error: "Error checking for existing badge issuance data"});
											} else {
												if (rows4.length > 0) {
													res.status(404).send({error: "This recipient has already been assigned this badge."});
												} else {

													// add new record
													var insertquery5 = 'INSERT INTO badge_issued (userid, timecreated, uniqueid, recipientid, badgeid) VALUES (?,?,?,?,?)';
													var params5 = [req.user.id, res.locals.timecreated, res.locals.uniqueid, res.locals.recipientid, res.locals.badgeid];
													db.get().query(insertquery5, params5, function(err5, result5) {
														if (err5) {
															console.log(err5);
															res.status(404).send({error: "Error saving badge issuance data"});
														} else {
															console.log("badge issuance saved");
															res.locals.id = result5.insertId;

															var reply = {
																 id: res.locals.id,
																 timecreated: res.locals.timecreated,
																 uniqueid: res.locals.uniqueid,
																 badgeid: res.locals.badgeid,
																 recipientid: res.locals.recipientid,
																 issuedon: res.locals.issuedon,
																 tokenmetadataurl: res.locals.tokenmetadataurl,
																 blockchainaddress: res.locals.blockchainaddress,
																 transaction: res.locals.transaction,
																 tokenid: res.locals.tokenid,
																 revokedreason: res.locals.revokedreason,
																 status: res.locals.status,
															};

															//console.log(reply);
															res.send(reply);
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

/**
 * Update a pending Badge issuance
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to update.
 * @param badgeid, Optional. The Badge id for the badge you want to update create an issuance for.
 * @param recipientid, Optional. The Recipient id for the Recipient you want to issue the badge to.
 * @return JSON of the issued badge or a JSON error object
 */
exports.updateAssertion = function(req, res, next) {
	var data = matchedData(req);

	// check all data as expected - should happen in the route checks - belt and braces
	if (!data.id) {
		return res.status(400).send({"error": "You must include the id of the badge issuance you want to update"});
	}
	if  ((!data.badgeid || (data.badgeid && data.badgeid != "")) && (!data.recipientid || (data.recipient && data.recipientid != "")) ) {
		return res.status(400).send({"error": "You must include either the badgeid or the recipientid you want to change"});
	}

	res.locals.data = data

	res.locals.id = data.id;

	res.locals.badgeid = "";
	if (data.badgeid) {
		res.locals.badgeid = data.badgeid;
	}
	res.locals.recipientid = "";
	if (data.recipientid) {
		res.locals.recipientid = data.recipientid;
	}

	res.locals.timecreated = "";
	res.locals.status = "";
	res.locals.uniqueid = "";

	// these will be empty as record cannot be edited if it has been issued - added for completing return record
	res.locals.issuedon = "";
	res.locals.tokenmetadataurl = "";
	res.locals.revokedreason = "";
	res.locals.blockchainaddress = "";
	res.locals.transaction = "";
	res.locals.tokenid = "";

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				db.get().query('SELECT * from badge_issued where userid=? and id=? and status="pending"', [req.user.id, res.locals.data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching badge issuance record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No badge issuance record found with the given id for the currently logged in user, or the badge has been issued and cannot be updated"});
						} else {

							res.locals.timecreated = rows2[0].timecreated;
							res.locals.status = rows2[0].status;
							res.locals.uniqueid = rows2[0].uniqueid;

							// if both recipient and badge ids have changed
							if (res.locals.data.badgeid && res.locals.data.recipientid) {
								// check badge exists in our database.
								var selectquery = 'SELECT * from badges left join issuers on badges.issuerid = issuers.id left join users on issuers.loginuserid = users.id where badges.id=? AND issuers.loginuserid=?';
								var params = [res.locals.badgeid, req.user.id];
								db.get().query(selectquery, params, function(err2, rows2) {
									if (err2) {
										console.log(err2);
										res.status(404).send({error: "Error checking badge id"});
									} else {
										if (rows2.length == 0) {
											res.status(404).send({error: "The given badge id does not exist or does not exists in conjunction with the logged in user."});
										} else {
											// check recipient exists in our database.
											var selectquery2 = 'SELECT * from recipients where id=? AND userid=?';
											var params2 = [res.locals.recipient, req.user.id];
											db.get().query(selectquery2, params2, function(err3, rows3) {
												if (err3) {
													console.log(err3);
													res.status(404).send({error: "Error checking recipient id"});
												} else {
													if (rows2.length == 0) {
														res.status(404).send({error: "The given recipient id does not exist or does not exists in conjunction with the logged in user."});
													} else {

														// check same issuance not added twice
														var selectquery4 = "select * from badge_issued where userid=? and recipientid=? and badgeid=?";
														var params4 = [req.user.id, res.locals.recipientid, res.locals.badgeid];
														db.get().query(selectquery4, params4, function(err4, rows4) {
															if (err4) {
																console.log(err4);
																res.status(404).send({error: "Error checking for existing badge issuance data"});
															} else {
																if (rows4.length > 0) {
																	res.status(404).send({error: "This recipient has already been assigned this badge."});
																} else {

																	// add new record
																	var updatequery5 = 'UPDATE badge_issued set recipientid=?, badgeid=? where id=? and userid=?';
																	var params5 = [res.locals.recipientid, res.locals.badgeid, res.locals.id, req.user.id];
																	db.get().query(updatequery5, params5, function(err5, result5) {
																		if (err4) {
																			console.log(err5);
																			res.status(404).send({error: "Error updating badge issuance record"});
																		} else {
																			console.log("badge issuance updated");

																			var reply = {
																				 id: res.locals.id,
																				 timecreated: res.locals.timecreated,
																				 uniqueid: res.locals.uniqueid,
																				 badgeid: res.locals.badgeid,
																				 recipientid: res.locals.recipientid,
																				 issuedon: res.locals.issuedon,
																				 tokenmetadataurl: res.locals.tokenmetadataurl,
																				 blockchainaddress: res.locals.metadataurl,
																				 transaction: res.locals.transaction,
																				 tokenid: res.locals.tokenid,
																				 revokedreason: res.locals.revokedreason,
																				 status: res.locals.status,
																			};

																			//console.log(reply);
																			res.send(reply);
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
							} else if (res.locals.data.badgeid && !res.locals.data.recipientid) {
								// ONLY BADGE ID CHANGED
								// check recipient exists in our database.
								var selectquery2 = 'SELECT * from badges where id=? AND userid=?';
								var params2 = [res.locals.badgeid, req.user.id];
								db.get().query(selectquery2, params2, function(err3, rows3) {
									if (err3) {
										console.log(err3);
										res.status(404).send({error: "Error checking badge id"});
									} else {
										if (rows2.length == 0) {
											res.status(404).send({error: "The given badge id does not exist or does not exists in conjunction with the logged in user."});
										} else {
											res.locals.recipientid = rows2[0].recipientid;

											// check the same issuance not added twice
											var selectquery4 = "select * from badge_issued where userid=? and recipientid=? and badgeid=?";
											var params4 = [req.user.id, res.locals.recipientid, res.locals.data.badgeid];
											db.get().query(selectquery4, params4, function(err4, rows4) {
												if (err4) {
													console.log(err4);
													res.status(404).send({error: "Error checking for existing badge issuance data"});
												} else {
													if (rows4.length > 0) {
														res.status(404).send({error: "The current logged in user has already issued this badge to this recipient."});
													} else {
														// update badgeid
														var insertquery5 = 'UPDATE badge_issued SET badgeid=? where id=?';
														var params5 = [res.locals.badgeid, req.user.id];
														db.get().query(insertquery5, params5, function(err5, result5) {
															if (err4) {
																console.log(err5);
																res.status(404).send({error: "Error updating new badgeid on badge issuance record"});
															} else {
																console.log("badge issuance badge id updated");
																res.locals.id = result5.insertId;
																var reply = {
																	 id: res.locals.id,
																	 timecreated: res.locals.timecreated,
																	 uniqueid: res.locals.uniqueid,
																	 badgeid: res.locals.badgeid,
																	 recipientid: res.locals.recipientid,
																	 issuedon: res.locals.issuedon,
																	 tokenmetadataurl: res.locals.tokenmetadataurl,
																	 blockchainaddress: res.locals.metadataurl,
																	 transaction: res.locals.transaction,
																	 tokenid: res.locals.tokenid,
																	 revokedreason: res.locals.revokedreason,
																	 status: res.locals.status,
																};

																//console.log(reply);
																res.send(reply);
															}
														});
													}
												}
											});
										}
									}
								});
							} else if (!res.locals.data.badgeid && res.locals.data.recipientid) {

								// ONLY RECIPIENT ID CHANGED
								// check recipient exists in our database.
								var selectquery2 = 'SELECT * from recipients where id=? AND userid=?';
								var params2 = [res.locals.recipientid, req.user.id];
								db.get().query(selectquery2, params2, function(err3, rows3) {
									if (err3) {
										console.log(err3);
										res.status(404).send({error: "Error checking recipient id"});
									} else {
										if (rows2.length == 0) {
											res.status(404).send({error: "The given recipient id does not exist or does not exists in conjunction with the logged in user."});
										} else {
											res.locals.badgeid = rows2[0].badgeid;

											// check the same issuance not added twice
											var selectquery4 = "select * from badge_issued where userid=? and recipientid=? and badgeid=?";
											var params4 = [req.user.id, res.locals.recipientid, res.locals.badgeid];
											db.get().query(selectquery4, params4, function(err4, rows4) {
												if (err4) {
													console.log(err4);
													res.status(404).send({error: "Error checking for existing badge issuance data"});
												} else {
													if (rows4.length > 0) {
														res.status(404).send({error: "The current logged in user has already issued this badge to this recipient."});
													} else {

														// update recipientid
														var insertquery5 = 'UPDATE badge_issued SET recipientid=? where id=?';
														var params5 = [res.locals.recipientid, req.user.id];
														db.get().query(insertquery5, params5, function(err5, result5) {
															if (err4) {
																console.log(err5);
																res.status(404).send({error: "Error updating new recipient id on badge issuance record"});
															} else {
																console.log("badge issuance recipientid updated");
																res.locals.id = result5.insertId;
																var reply = {
																	 id: res.locals.id,
																	 timecreated: res.locals.timecreated,
																	 uniqueid: res.locals.uniqueid,
																	 badgeid: res.locals.badgeid,
																	 recipientid: res.locals.recipientid,
																	 issuedon: res.locals.issuedon,
																	 tokenmetadataurl: res.locals.tokenmetadataurl,
																	 blockchainaddress: res.locals.metadataurl,
																	 transaction: res.locals.transaction,
																	 tokenid: res.locals.tokenid,
																	 revokedreason: res.locals.revokedreason,
																	 status: res.locals.status,
																};

																//console.log(reply);
																res.send(reply);
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
					}
				});
			}
		}
	});
}

/**
 * Delete a pending Badge issuance
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to delete.
 * @return JSON with the id of the deleted Badge issuance and a status of -1 or a JSON error object
 */
exports.deleteAssertion = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the badge issuance you want to delete"});
	}

	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT * from badge_issued WHERE userid=? and id=? && status="pending"', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching badge issuance record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send("No badge issuance record found with the given id for the currently logged in user, or the badge has been issued and cannot be deleted");
						} else {
							var updatequery = "DELETE from badge_issued WHERE userid=? AND id=?";
							var params = [req.user.id, data.id];

							db.get().query(updatequery, params, function(err4, results4) {
								if (err4) {
									console.log(err4);
									res.status(404).send({error: "Error deleting badge issuance record."});
								} else {
									console.log("badge issuance record deleted");
									var reply = {}
									reply.id = res.locals.id;
									reply.status = -1;

									res.send(reply);
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
 * Delete a Badge issuance (Assertion) record for the given id. Only the super administrator can call this route.
 * @param id, Required. The identifier of the Badge issuance record you wish to retrieve.
 * @return JSON with the id of the badge issuance record that was deleted and a status property of -1.
 */
exports.deleteAssertionAdmin = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the badge issuance you want to delete"});
	}

	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT * from badge_issued WHERE id=?', [data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching badge issuance record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send("No badge issuance record found with the given id");
						} else {
							var updatequery = "DELETE from badge_issued WHERE id=?";
							var params = [data.id];

							db.get().query(updatequery, params, function(err4, results4) {
								if (err4) {
									console.log(err4);
									res.status(404).send({error: "Error deleting badge issuance record."});
								} else {
									console.log("badge issuance record deleted");
									var reply = {}
									reply.id = res.locals.id;
									reply.status = -1;

									res.send(reply);
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
 * Get an Badge issuance (Assertion) record by it's record identifier.
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to retrieve.
 * @return JSON with Badge issuance (Assertion) data
 */
exports.getAssertionById = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the badge issuance you want to get the data for"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT * from badge_issued where userid=? and id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving issuance record"});
					} else {
						if (rows2.length > 0) {
							var next = rows2[0];

							var data = {}
							data.id = next["id"];
							data.timecreated = next["timecreated"];
							data.uniqueid = next["uniqueid"];
							data.badgeid = next["badgeid"];
							data.recipientid = next["recipientid"];
							data.issuedon = next["issuedon"];
				 			data.tokenmetadataurl =  next["tokenmetadataurl"];
							data.blockchainaddress = next["blockchainaddress"];
							data.transaction = next["transaction"];
							data.tokenid = next["tokenid"];
							data.revokedreason = next["revokedreason"];
							data.status = next["status"];

							res.send(data);
						} else {
							return res.status(404).send({"error": "No badge issuance record found with the given id for the currently logged in user"});
						}
					}
				});
			}
		}
	});
}

/**
 * Get the Badge issuances (Assertions) for the currently logged in recipient.
 * @return JSON with an object with key 'items' pointing to an array of the Badge issuance (Assertion) data for the currently logged in user
 */
exports.listAssertionsPortfolio = function(req, res, next) {

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("recipient")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				var sqlquery = 'SELECT badge_issued.*, badges.title, badges.description, badges.imageurl, issuers.name as issuername, badge_issued.uniqueid as uid from badge_issued ';
				sqlquery += 'left join badges on badge_issued.badgeid = badges.id left join issuers on badges.issuerid = issuers.id ';
				sqlquery += 'left join recipients on badge_issued.recipientid = recipients.id ';
				sqlquery += 'left join users on recipients.loginuserid = users.id ';
				sqlquery += 'where users.id=? AND badge_issued.status IN ("issued","revoked")';

				db.get().query(sqlquery, [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error":"Error retrieving badge issuance records"});
					} else {
						var items = [];
						if (rows2.length > 0) {
							for (var i=0; i<rows2.length; i++) {
								var next = rows2[i];

								var data = {}
								data.id = next["id"];
								data.uniqueid = next["uid"];
								data.issuer = next["issuername"];
								data.issuedon = next["issuedon"];
								data.badgeid = next["badgeid"];
								data.title =  next["title"];
								data.description = next["description"];
								data.imageurl = next["imageurl"];
								data.revokedreason = next["revokedreason"];
								data.status = next["status"];;

								items.push(data);
							}
						}
						res.send({items: items});
					}
				});
			}
		}
	});
}

exports.downloadAssertion = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({"error": "You must include the badge assertion id for the badge you want to download"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("recipient")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				db.get().query('SELECT badge_issued.*, badges.title, badges.description, badges.imageurl, issuers.name as issuername from badge_issued left join badges on badge_issued.badgeid = badges.id left join issuers on badges.issuerid left join recipients on badge_issued.recipientid = recipients.id left join users on recipients.loginuserid = users.id where users.id=? AND badge_issued.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving issuance record"});
					} else {
						if (rows2.length == 0) {
							return res.status(404).send({"error": "The assertion id you have given does not exist in combination with the logged in user account."});
						} else {
							var filename = sanitize(rows2[0].title);
							filename = filename.split(" ").join("_");
							filename = filename+".png";
							console.log(filename);

							var filepath = rows2[0].badgefilepath;
							if (filepath != null && filepath != "") {

								//console.log(filepath);
								//console.log(filename);

								res.setHeader('Content-disposition', 'attachment; filename='+filename);
								res.setHeader('Content-type', 'image/png');

								fs.access(filepath, fs.constants.R_OK, (err) => {
									if (err){
										console.log('err', err);
									} else{
										var count = 0
										console.log('reading stream');
										var fReadStream = fs.createReadStream(filepath);
										fReadStream.pipe(res);
									}
								})

								/*res.download(filepath, filename, function (err) {
									if (err) {
										console.log(err);
										if (!res.headersSent) {
											console.log("Error downloading badge file for: "+filepath);
											return res.status(404).send({"error": "There has been an error trying to download this badge file."});
										}
									} else {
										console.log({"error": "Badge file downloaded: "+filepath});
									}
								})*/
							} else {
								return res.status(404).send({"error": "Badge file path not found."});
							}
						}
					}
				});
			}
		}
	});
}

exports.downloadAssertionHosted = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({error: "You must include the badge assertion id for the badge you want to download"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("recipient")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {

				var assertionHandler = function(err, reply) {

					if (err && err.message && err.message != null) {
						return res.status(404).send({error: err.message});
					} else if (!reply) {
						return res.status(404).send({error: "Unknown error getting assertion JSON"});
					} else {

						var filename = sanitize(reply.badgetitle);
						filename = filename.split(" ").join("_");
						filename = filename+"-hosted.png";

						str = JSON.stringify(reply.assertionjson);

						typeobj = {};
						typeobj.type = "iTXt";
						typeobj.keyword = "openbadges";
						//typeobj.value = str;
						typeobj.value = reply.thesignature;

						res.setHeader('Content-disposition', 'attachment; filename=' + filename);
						res.setHeader('Content-type', 'image/png');

						try {
							fs.createReadStream(reply.badgeimage)
								.pipe(pngitxt.set(typeobj))
								.pipe(res);
						} catch(err) {
							console.error(err);
							res.status(404).send({error: "Failed to create Open Badge"});
						}
					}
				}
				createSignedAssertionJSON(data.id, assertionHandler);

				//res.send(assertion);

			}
		}
	});
}
/**
 * Get a list of Badge issuance (Assertion) record for the currently logged in user.
 * @return JSON with an object with key 'items' pointing to an array of the Badge issuance (Assertion) data for the currently logged in user
 */
exports.listAssertions = function(req, res, next) {

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				var sqlquery = 'SELECT badge_issued.* from badge_issued WHERE badge_issued.userid=? and badge_issued.id NOT in (select badge_claimed.badgeissuedid from badge_claimed)';

				db.get().query(sqlquery, [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving badge issuance records"});
					} else {
						var items = [];
						if (rows2.length > 0) {
							for (var i=0; i<rows2.length; i++) {
								var next = rows2[i];

								var data = {}
								data.id = next["id"];
								data.timecreated = next["timecreated"];
								data.uniqueid = next["uniqueid"];
								data.badgeid = next["badgeid"];
								data.recipientid = next["recipientid"];
								data.issuedon = next["issuedon"];
					 			data.tokenmetadataurl = next["tokenmetadataurl"];
								data.blockchainaddress = next["blockchainaddress"];
								data.transaction = next["transaction"];
								data.tokenid = next["tokenid"];
								data.revokedreason = next["revokedreason"];
								data.status = next["status"];

								items.push(data);
							}
						}
						res.send({items: items});
					}
				});
			}
		}
	});
}

/**
 * List all the claimed assertions for the currently logged in isser
 * @return JSON with an object with key 'items' pointing to an array of the Badge issuance (Assertion) data for the currently logged in user, or a JSON error object.
 */
exports.listAssertionsClaimed = function(req, res, next) {

	res.locals.items = [];

	db.get().query('SELECT rolename FROM users LEFT JOIN user_roles ON users.id = user_roles.personid LEFT JOIN roles ON user_roles.roleid = roles.id WHERE users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				var sqlquery = 'SELECT badge_issued.* FROM badge_issued WHERE badge_issued.userid=? AND badge_issued.id IN (select badge_claimed.badgeissuedid FROM badge_claimed)';

				db.get().query(sqlquery, [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving badge issuance records"});
					} else {
						if (rows2.length > 0) {
							var i=0;
							function loop() {
								var next = rows2[i];

								res.locals.items[i] = {}
								res.locals.items[i].id = next["id"];
								res.locals.items[i].timecreated = next["timecreated"];
								res.locals.items[i].uniqueid = next["uniqueid"];
								res.locals.items[i].badgeid = next["badgeid"];
								res.locals.items[i].recipientid = next["recipientid"];
								res.locals.items[i].issuedon = next["issuedon"];
					 			res.locals.items[i].tokenmetadataurl = next["tokenmetadataurl"];
								res.locals.items[i].blockchainaddress = next["blockchainaddress"];
								res.locals.items[i].transaction = next["transaction"];
								res.locals.items[i].tokenid = next["tokenid"];
								res.locals.items[i].revokedreason = next["revokedreason"];
								res.locals.items[i].status = next["status"];

								db.get().query('SELECT recipients.name, recipients.email, users.email as useremail FROM recipients LEFT JOIN users ON recipients.loginuserid = users.id WHERE recipients.id=?', [next["recipientid"]], function (err3, rows3) {
									if (err3) {
										console.log(err3);
										return res.status(404).send({"error": "Error retrieving badge recipient record"});
									} else {
										if (rows3.length > 0) {
											res.locals.items[i].recipientid = next["recipientid"];
											res.locals.items[i].recipientname = rows3[0].name;
											res.locals.items[i].recipientemail = rows3[0].email;
											res.locals.items[i].recipientuseremail = rows3[0].useremail;

											i++;
											if (i < rows2.length) {
												loop();
											} else {
												res.send({items: res.locals.items});
											}
										}
									}
								});
							}
							loop();
						} else {
							res.send({items: res.locals.items});
						}
					}
				});
			}
		}
	});
}

/**
 * Get a list of all Badge issuance (Assertion) record. Only the super administrator can call this route.
 * @return JSON with an object with key 'items' pointing to an array of the Badge issuance (Assertion) data for the currently logged in user
 */
exports.listAllAssertions = function(req, res, next) {

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {

				var query = "SELECT badge_issued.id, badge_issued.issuedon, badge_issued.status, issuers.name as issuername, recipients.name as recipientname, ";
				query += "badges.title as badgetitle, badges.version as version from badge_issued ";
				query += "left join badges on badge_issued.badgeid = badges.id ";
				query += "left join recipients on badge_issued.recipientid = recipients.id ";
				query += "left join issuers on badges.issuerid = issuers.id ";

				db.get().query(query, [], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving all badge issuance records"});
					} else {
						res.send({items: rows2});
					}
				});
			}
		}
	});
}


/** MANAGE ADDING REMOVING ENDORSERS ON AN ASSERTION **/

/**
 * Create a pending endorsement record for a pending Badge issuance
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to add an endorsment to.
 * @param endorserid, Required. The Endorser id for the Endorser you want to endorse this Badge issuance.
 * @return JSON of the pending endorsement record or a JSON error object
 */
exports.addEndorser = function(req, res, next) {

	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id || !data.endorserid) {
		return res.status(400).send({"error": "You must include id for the badge issuance you want to add an endorser to and the endorser id to add"});
	}

	res.locals.id = "";
	res.locals.badgeissueid = data.id;
	res.locals.endorserid = data.endorserid;
	res.locals.status = "pending;"

	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				// check badge issuance record exists and is pending
				db.get().query('SELECT * from badge_issued where userid=? and id=? and status="pending"', [req.user.id, res.locals.badgeissueid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error retrieving issuance record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No badge issuance record found with the given id for the currently logged in user, or the badge issuance has been issued so can't be modified"});
						} else {
							// check endorser record exists
							db.get().query('SELECT * from endorsers where userid=? and id=?', [req.user.id, res.locals.endorserid], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error retrieving issuance record"});
								} else {
									if (rows3.length == 0) {
										res.status(404).send({error: "No endorser record found with the given id for the currently logged in user"});
									} else {
										// add badge_endorsement record
										db.get().query('Insert into badge_endorsement (userid, timecreated, endorserid, itemid, itemtype) VALUES (?,?,?,?,?) ', [req.user.id, res.locals.timecreated, res.locals.endorserid, res.locals.badgeissueid, "assertion"], function (err4, result4) {
											if (err4) {
												console.log(err4);
												res.status(404).send({error: "Error inserting badge issuance endorser record"});
											} else {
												console.log("badge_endorser record saved");
												res.locals.id = result4.insertId;
												var reply = {
													 id: res.locals.id,
													 timecreated: res.locals.timecreated,
													 badgeissuedid: res.locals.badgeissueid,
													 endorserid: res.locals.endorserid,
													 status: res.locals.status,
												};
												res.send(reply);
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
 * Remove a pending endorsement record
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to remove an endorsment from.
 * @param endorserid, Required. The Endorser id for the Endorser you want remove endorsement for.
 * @return JSON with the id of the deleted endorsement record and a status of -1 or a JSON error object
 */
exports.removeEndorser = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the badge issuance endorser you want to delete"});
	}

	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				// check badge issuance endorsement record exists and is pending
				db.get().query('SELECT * from badge_endorsement where userid=? and id=? and status="pending"', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error retrieving issuance record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No badge endorers record found with the given id for the currently logged in user, or the badge issuance has been issued so can't be modified"});
						} else {
							// Check endorser has not already done the endorsement - should they be able to delete the endorser from the badge after the endorser has endorsed?
							db.get().query('SELECT * from badge_endorsement WHERE userid=? and id=? && status="pending"', [req.user.id, data.id], function (err3, rows3) {
								if (err2) {
									console.log(err2);
									res.status(404).send({error: "Error fetching badge issuance record"});
								} else {
									if (rows2.length == 0) {
										res.status(404).send({error: "No badge endorsement record found with the given id for the currently logged in user, or the badge endorsement has been endorsed and cannot be removed"});
									} else {
										var updatequery = "DELETE from badge_endorsement WHERE userid=? AND id=?";
										var params = [req.user.id, data.id];

										db.get().query(updatequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												res.status(404).send({error: "Error deleting badge endorsement record."});
											} else {
												console.log("badge endorsement record deleted");
												var reply = {}
												reply.id = res.locals.id;
												reply.status = -1;
												res.send(reply);
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
 * List all pending endorsement records for the Badge issuance with the given record identifier
 * @param id, Required. The record identifier of the Badge issuance (Assertion) record you wish to list endorsement for.
 * @return JSON with an object with key 'items' pointing to an array of the pending endorsement records for the given Badge issuance or a JSON error object
 */
exports.listEndorsers = function(req, res, next) {

	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the badge issuance you want to list endorsers for"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT * from badge_endorsement where userid=? and itemid=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving badge endorsement records"});
					} else {

						//console.log("ROWS: ");
						//console.log(rows2);

						var items = [];
						if (rows2.length > 0) {
							for (var i=0; i<rows2.length; i++) {
								var next = rows2[i];

								var data = {}

								data.id = next["id"];
								data.timecreated = next["timecreated"];
								data.badgeissuedid = next["badgeissuedid"];
								data.endorserid = next["endorserid"];

								/*
								data.itemtype = next["itemtype"];
								data.endorsementid = next["endorsementid"];
								data.tokenrecipientid = next["tokenrecipientid"];
								data.blockchainadress = next["blockchainadress"];
								data.transaction = next["transaction"];
								data.tokenid = next["tokenid"];
								*/

								data.status = next["status"];

								items.push(data);
							}
						}
						res.send({items: items});
					}
				});
			}
		}
	});
}



/*************************************
    TOKEN RELATED HELPER FUNCTIONS
*************************************/

exports.getAssertionTransaction = function(req, res) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.address || !data.tokenid) {
		return res.status(400).send({"error": "You must include the Token blockchain contract address and the token id for the token you want to get the transaction for"});
	}

	db.get().query('SELECT transaction from badge_issued where blockchainaddress=? AND tokenid=? AND userid=? LIMIT 1', [data.address, data.tokenid, req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching assertion token transaction"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The token contract address or tokenid you have given do not exist in combination with the currently logged in user account."});
			} else {
				var row = rows[0];

				utilities.getTransaction(row.transaction, req, res);
			}
		}
	});
}

exports.getTokenById = function(req, res) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({"error": "You must include your system id for the Token based assertion you want to get"});
	}

	db.get().query('SELECT * from badge_issued where id=? AND userid=? LIMIT 1', [data.id, req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching assertion token by id"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The assertion id you have given does not exist in combination with the logged in user account."});
			} else {
				var replycount = rows.length;
				var reply = {};
				reply.count = replycount;
				reply.items = [];

				getTokenAssertions(rows, 0, reply, req, res);
			}
		}
	});
}

getTokenAssertions = function(rows, index, reply, req, res) {

	if (index >= rows.length) {
		res.send(reply);
	} else {

		//console.log("isencrypted: "+isencrypted);
		var blockchainaddress = rows[index].blockchainaddress

		var tokenInstance = new web3.eth.Contract(cfg.contracts.erc721metadatamintable.abi, blockchainaddress);

		res.locals.address = rows["blockchainaddress"];
		res.locals.tokenid = rows["tokenid"];
		res.locals.metadataurl = "";
		res.locals.issueraccount = "";
		res.locals.contractaddress = "";
		res.locals.recipientaccount = "";

		if (tokenInstance){
			var handler1 = function(e, result) {
				if (!e) {
					res.locals.metadataurl = result;

					var handler2 = function(e2, result2) {
						if (!e2) {
							res.locals.issueraccount = result2;

							var handler3 = function(e3, result3) {
								if (!e3) {
									res.locals.contractaddress = result3;

									var handler4 = function(e4, result4) {
										if (!e4) {
											res.locals.recipientaccount = result4;
											var item = {
												 address: res.locals.address,
												 tokenid: res.locals.tokenid,
												 recipientaccount: res.locals.recipientaccount,
												 issueraccount: res.locals.issueraccount,
												 metadataurl: res.locals.metadataurl,
												 relatedcontractaddress: res.locals.contractaddress
											};
											reply.items.push(item);

											index++;
											getTokenAssertions(rows, index, reply, req, res);

										} else {
											console.log(e4);
											res.status(404).send({error: "Issuing fetching token recipient"});
										}
									};
									tokenInstance.methods.ownerOf(res.locals.tokenid).call(handler4);

								} else {
									console.log(e3);
									res.status(404).send({error: "Issuing fetching token associated contract address"});
								}
							};
							tokenInstance.methods.tokenContractAddress(res.locals.tokenid).call(handler3);
						} else {
							console.log(e2);
							res.status(404).send({error: "Issuing fetching token issuer address"});
						}
					};
					tokenInstance.methods.tokenMinterAddress(res.locals.tokenid).call(handler2);

				} else {
					console.log(e);
					res.status(404).send({error: "Issuing fetching token metadata url"});
				}
			};
			tokenInstance.methods.tokenURI(res.locals.tokenid).call(handler1);
		} else {
			return res.status(401).send("The assertion token cannot be found");
		}
	}
}

/**
 Return all assertion associated to the given user's own uniqueid - (Moodle id)
 Could potentially return multiple items.
 reply object will have a count and an array of items.
*/
exports.getTokenByTokenId = function(req, res) {
	var data = matchedData(req);

	//console.log("In getTokenByTokenId");
	//console.log(data);

	// should never need this as the check is done in the routes
	if (!data.address || !data.tokenid) {
		return res.status(400).send({"error": "You must include the Token blockchain contract address and the token id for the token you want to get"});
	}

	db.get().query('SELECT * from blockchain_badge_issued where blockchainaddress=? and tokenid=? AND userid=? LIMIT 1', [data.address, data.tokenid, req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching token by Id"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The Token address and id you have given do not exist in combination with the logged in user account."});
			} else {
				getTokenAssertion(rows[0], req, res);
			}
		}
	});
}

getTokenAssertion = function(row, req, res) {

	//console.log(row);

	var tokenInstance = new web3.eth.Contract(cfg.contracts.erc721metadatamintable.abi, row["blockchainaddress"]);

	res.locals.address = row["blockchainaddress"];
	res.locals.tokenid = row["tokenid"];
	res.locals.metadataurl = "";
	res.locals.issueraccount = "";
	res.locals.contractaddress = "";
	res.locals.recipientaccount = "";

	if (tokenInstance){
		var handler1 = function(e, result) {
			if (!e) {
				res.locals.metadataurl = result;

				var handler2 = function(e2, result2) {
					if (!e2) {
						res.locals.issueraccount = result2;

						var handler3 = function(e3, result3) {
							if (!e3) {
								res.locals.contractaddress = result3;

								var handler4 = function(e4, result4) {
									if (!e4) {
										res.locals.recipientaccount = result4;
										var reply = {
											 address: res.locals.address,
											 tokenid: res.locals.tokenid,
											 recipientaccount: res.locals.recipientaccount,
											 issueraccount: res.locals.issueraccount,
											 metadataurl: res.locals.metadataurl,
											 relatedcontractaddress: res.locals.contractaddress
										};
										//console.log(reply);
										res.send(reply);

									} else {
										console.log(e4);
										res.status(404).send({error: "Issuing fetching token recipient"});
									}
									return null;
								};
								tokenInstance.methods.ownerOf(res.locals.tokenid).call(handler4);
							} else {
								console.log(e3);
								res.status(404).send({error: "Issuing fetching token associated contract address"});
							}
							return null;
						};
						tokenInstance.methods.tokenContractAddress(res.locals.tokenid).call(handler3);
					} else {
						console.log(e2);
						res.status(404).send({error: "Issuing fetching token issuer address"});
					}
					return null;
				};
				tokenInstance.methods.tokenMinterAddress(res.locals.tokenid).call(handler2);

			} else {
				console.log(e);
				res.status(404).send({error: "Issuing fetching token metadata url"});
			}
			return null;
		};
		tokenInstance.methods.tokenURI(res.locals.tokenid).call(handler1);
	} else {
		return res.status(401).send("The assertion token cannot be found");
	}
}


/************************************************************************
 *                                                                      *
 *               LOCAL HELPER FUNCTION FOR TOKEN ISSUING                *
 *                                                                      *
 ************************************************************************/


function loadAssertion(userid, assertionid, handler) {

	if (!userid || userid == null || userid == "" || ! assertionid || assertionid == null || assertionid == "") {
		handler(new Error("Missing required property getting assertion object"));
	} else {

		var query = 'SELECT badge_issued.*, recipients.loginuserid, recipients.email as recipientemail, recipients.name as recipientname, recipients.blockchainaccount as recipientaccount, ';
		query += 'issuerusers.blockchainaccount as issueraccount, issuerusers.blockchainaccountpassword as issueraccountpassword, issuers.name as issuername,';
		query += 'badges.blockchainaddress as rdfstoreaddress from badge_issued ';
		query += 'left join recipients on badge_issued.recipientid = recipients.id ';
		query += 'left join badges on badge_issued.badgeid = badges.id ';
		query += 'left join issuers on badges.issuerid = issuers.id ';
		query += 'left join users as issuerusers on issuers.loginuserid = issuerusers.id ';
		query += 'where badge_issued.userid=? and badge_issued.id=?';

		db.get().query(query, [userid, assertionid], function (err, rows) {
			if (err) {
				console.log(err);
				handler(new Error("Error retrieving issuance record"));
			} else {
				if (rows.length > 0) {
					let row = rows[0];

					let assertionObject = {};
					assertionObject.id = assertionid;
					assertionObject.uniqueid = row["uniqueid"];
					assertionObject.badgeid = row["badgeid"];
					assertionObject.badgerdfstoreaddress = row["rdfstoreaddress"];
					assertionObject.recipientid = row["recipientid"];
					assertionObject.recipientuserid = row["loginuserid"];
					assertionObject.recipientaccount = row["recipientaccount"];
					assertionObject.recipientemail = row["recipientemail"];
					assertionObject.recipientname = row["recipientname"];
					assertionObject.recipientloginuserid = row["loginuserid"];
					assertionObject.issuername = row["issuername"];
					assertionObject.issueraccount = row["issueraccount"];
					assertionObject.issuerpassword = row["issueraccountpassword"];

					handler(null, assertionObject);
				} else {
					handler(new Error("No issuance record found with the given id"));
				}
			}
		});
	}
}

function createTokenMetadata(assertionid, name, description, imagefilepath, assertionjsonhash, hashingAlgorithm, canonicalizationAlgorithm, handler) {

	if (name && description && imagefilepath) {

		json = {};
		json.name = name;
		json.description = description;
		json.image = imagefilepath;

		if (assertionjsonhash && assertionjsonhash != null && assertionjsonhash != "") {
			json.assertionjsonhash = assertionjsonhash;
		}
		if (hashingAlgorithm && hashingAlgorithm != null && hashingAlgorithm != "") {
			json.hashingAlgorithm = hashingAlgorithm;
		}
		if (canonicalizationAlgorithm && canonicalizationAlgorithm != null && canonicalizationAlgorithm != "") {
			json.canonicalizationAlgorithm = canonicalizationAlgorithm;
		}

		// As we are not using SOLID we are not adding files here at present.
		// urls to evidence may not be files and there is no real way of checking
		// reliably so it does not make sense to hash them at present.
		//if (files) {
			/*
			json.meta = {};
			json.meta.files = [];
			json.meta.files[0] = {};
			json.meta.files[0].filepath = rows[0]["solidurl"];
			json.meta.files[0].filehash = rows[0]["jsonhash"];
			json.meta.files[0].hashingAlgorithm = rows[0]["jsonhashalgorithm"];
			*/
		//}

		//console.log(JSON.stringify(json));

		let content = Buffer.from(JSON.stringify(json));
		let ipfshandler = function(e, results) {
			if (!e) {
				let hash = results[0].hash;
				//console.log(hash);
				var metadataurl = ipfsurl + hash;
				//console.log(data.metadataurl);

				// Store metadata url to database
				let updatequery = 'UPDATE badge_issued SET tokenmetadataurl=?, assertionjsonhash=? WHERE id=?';
				let params = [metadataurl, assertionjsonhash, assertionid];
				db.get().query(updatequery, params, function(err, results) {
					if (err) {
						console.log(err);
						handler(new Error("Error saving metadataurl url"));
					} else {
						// add this element of the return data
						handler(null, metadataurl);
					}
				});
			} else {
				console.log(e);
				handler(new Error("Failed to write token metadata file to IPFS"));
			}
		}
		ipfs.add(content, ipfshandler);
	} else {
		handler(new Error("Missing required parameters for creating token metadata"));
	}
}

function issueToken(assertionid, tokencontractaddress, rdfstoreaddress, metadataurl, issueraccount, issuerpassword, recipientaccount, assertionjsonhash, userid, recipientid, issuedon, handler) {

	console.log("assertionid:"+assertionid);
	console.log("tokencontractaddress:"+tokencontractaddress);
	console.log("rdfstoreaddress:"+rdfstoreaddress);
	console.log("metadataurl:"+metadataurl);
	console.log("issueraccount:"+issueraccount);
	console.log("issuerpassword:"+issuerpassword);
	console.log("recipientaccount:"+recipientaccount);
	console.log("assertionjsonhash:"+assertionjsonhash);
	console.log("userid:"+userid);
	console.log("recipientid:"+recipientid);
	console.log("issuedon:"+issuedon);

	// data expected
	if (assertionid && assertionid != "" && assertionid != null
			&& tokencontractaddress && tokencontractaddress != "" && tokencontractaddress != null
			&& rdfstoreaddress && rdfstoreaddress != "" && rdfstoreaddress != null
			&& metadataurl && metadataurl != "" && metadataurl != null
			&& issueraccount && issueraccount != "" && issueraccount != null
			&& issuerpassword && issuerpassword != "" && issuerpassword != null
			&& recipientaccount && recipientaccount != "" && recipientaccount != null
			&& assertionjsonhash && assertionjsonhash != "" && assertionjsonhash != null
			&& userid && userid != "" && userid != null
			&& recipientid && recipientid != "" && recipientid != null
			&& issuedon && issuedon != "" && issuedon != null
			) {

		var unlockaccounthandler = function(err, account) {
			if (err && err.message && err.message != "") {
				handler(err)
			} else if (!account) {
				handler(new Error("Unknown erro unlocking blockchain account"));
			} else {
				let time = Math.floor((new Date().getTime()) / 1000);
				var tokenKey = assertionjsonhash+time;
				var transaction = "";

				var tokenInstance = new web3.eth.Contract(cfg.contracts.erc721metadatamintable.abi, tokencontractaddress);
				tokenInstance.methods.mintWithTokenData(recipientaccount, metadataurl, rdfstoreaddress, tokenKey).send({from: issueraccount, gas: minttokengas})
					.on('transactionHash', function(hash){
						//console.log(hash);
						transaction = hash;
					})
					.on('receipt', function(receipt){
						//console.log(receipt);
						if (receipt.status == "0x0") {
							handler(new Error("Token creation transaction failed"));
						} else {
							let issuinghandler = function(err2, tokenid) {
								if (err2) {
									handler(err2);
								} else {
									let reply = {};
									reply.tokenid = tokenid;
									reply.transaction = transaction;
									handler(null, reply);
								}
							}
							completeTokenIssuing(assertionid, tokencontractaddress, tokenKey, transaction, receipt.transactionHash, userid, recipientid, issuedon, issuinghandler);
						}
					})
					.on('error', function(error){
						console.log(error);
						handler(new Error("Error minting token"));
					});
			}
		}

		utilities.unlockAccount(issueraccount, issuerpassword, unlockaccounthandler);
	} else {
		handler(new Error("Require data to issue this a token is missing"));
	}
}

function completeTokenIssuing(assertionid, tokencontractaddress, tokenKey, transaction, txhash, userid, recipientid, issuedon, handler) {

	if (transaction != txhash) {
		handler(new Error("Token issuing transaction missmatch"));
	}

	var tokenInstance = new web3.eth.Contract(cfg.contracts.erc721metadatamintable.abi, tokencontractaddress);
	tokenInstance.methods.getTokenFromKey(tokenKey).call()
		.then(function(result) {

			//console.log("getting token id from hash done");
			var tokenid = result;

			// check if entry already exists.
			let query = 'Select * from badge_issued where userid=? AND blockchainaddress=? AND recipientid=? AND transaction=? AND tokenid=?';
			let params = [userid, tokencontractaddress, recipientid, transaction, tokenid];
			db.get().query(query, params, function(err, rows, fields) {
				if (err) {
					console.log(err);
					handler(new Error("Error saving token issuance"));
				} else if (rows.length == 0) {
					//console.log("DO UPDATE");

					var updatequery = 'Update badge_issued set issuedon=?, blockchainaddress=?, transaction=?, tokenid=? where id=? and userid=?';
					var updateparams = [issuedon, tokencontractaddress, transaction, tokenid, assertionid, userid];

					//console.log(updatequery);
					//console.log(updateparams);

					db.get().query(updatequery, updateparams, function(err2, results2) {
						if (err2) {
							console.log(err2);
							handler(new Error("Error updating token issuance with token data after transaction mined"));
						} else {
							console.log("assertion saved");
							handler(null, tokenid);
						}
					});
				} else {
					handler(new Error("Error issuing token. The database thinks that this token has already been issued"));
				}
			});
		}).catch((error) => {
			console.log(error);
			handler(new Error("Error getting tokenid for the given badge hash from the Token contract"));
		});
}

function updateAssertionJSON(assertionid, fullbadgejson, handler) {

	try {
		let str = JSON.stringify(fullbadgejson);

		var updatequery = 'UPDATE badge_issued set assertionjson=? WHERE id=?';
		var params = [str, assertionid];
		db.get().query(updatequery, params, function(err, results) {
			if (err) {
				console.log(err);
				handler(new Error("Failed to save assertion JSON to database"));
			} else {
				handler(null, true);
			}
		});
	} catch(err) {
		handler(err);
	}
}

function createOpenBadgeFile(assertionid, assertionjson, assertionjsonhash, badgeid, handler) {

	if (!assertionid || !assertionjson || !assertionjsonhash || !badgeid
			|| assertionid == "" || assertionjson == "" || badgeid == "" || assertionjsonhash == ""
			|| assertionid == null || assertionjson == null || badgeid == null || assertionjsonhash == null) {

		console.log("Mssing Data - Open Badge File");
		console.log(assertionid);
		console.log(assertionjson);
		console.log(assertionjsonhash);
		console.log(badgeid);

		handler(new Error("Data missing to create Open Badge file"));
	} else {

		let query = 'Select * from badges where id=?';
		let params = [badgeid];
		db.get().query(query, params, function(err, rows, fields) {
			if (err) {
				console.log(err);
				handler(new Error("Error getting badge image path from database"));
			} else if (rows.length == 0) {
				handler(new Error("No badge found with given badgeid when trying to retreive badge image"));
			} else {
				let imagepath = rows[0]["imagepath"];
				let str = JSON.stringify(assertionjson);

				// ADD TO IMAGE

				typeobj = {};
				typeobj.type = "iTXt";
				typeobj.keyword = "openbadges";
				typeobj.value = str;

				try {
					fs.createReadStream(imagepath)
						.pipe(pngitxt.set(typeobj))
						.pipe(fs.createWriteStream(cfg.badgefolder + assertionjsonhash + ".png")
							.on('finish', function () {

								console.log('Completed');
								var badgefilepath = cfg.badgefolder + assertionjsonhash + ".png";

								try {
									if (fs.existsSync(badgefilepath)) {
										var stats = fs.statSync(badgefilepath);
										if (stats.size > 0) {

											// update database
											var query = 'UPDATE badge_issued set badgefilepath=?, status="issued" WHERE id=?';
											var params = [badgefilepath, assertionid];
											db.get().query(query, params, function(err, results) {
												if (err) {
													handler(new Error("Failed to save badge file path to database"));
													console.log(err);
												} else {
													handler(null, badgefilepath);
												}
											});
										} else {
											console.log("Failed to create Open Badge file - file is empty");
											handler(new Error("Fail to correctly create Open Badge"));
										}
									} else {
										console.log("Failed to create Open Badge file - file does not exist");
										handler(new Error("Failed to create Open Badge file"));
									}
								} catch(err2) {
									console.error(err2);
									handler(new Error("Failed to check Open Badge file exists"));
								}
							})
					);
				} catch(err) {
					console.error(err);
					handler(new Error("Failed to create Open Badge"));
				}
			}
		});
	}
}

function notifyRecipientOfBadgeIssuance(recipientemail, recipientname, recipientid, badgename, badgefilepath, recipientloginuserid, handler) {

	// issue email to recipient
	if (recipientemail && recipientemail != null && recipientemail != ""
			&& recipientname && recipientname != null && recipientname != ""
			&& badgename && badgename != null && badgename != ""
			&& badgefilepath && badgefilepath != null && badgefilepath != ""
			&& recipientid && recipientid != null && recipientid != "") {

		var transporter = nodemailer.createTransport({sendmail: true});

		var message = cfg.emailheader;

		message += '<p>'+cfg.model_assertions_badgeIssueEmailStart+' '+recipientname+',</p>';
		message += "<p>"+cfg.model_assertions_badgeIssueEmailLine1A+" '"+badgename+"' "+cfg.model_assertions_badgeIssueEmailLine1B+"</p>";
		message += '<p>'+cfg.model_assertions_badgeIssueEmailLine2+'</p>';

		// if they have an account direct them to their portfolio otherwise let them request an account.
		if (recipientloginuserid && recipientloginuserid != "" && recipientloginuserid != null) {
			message += '<p><b>'+cfg.model_assertions_badgeIssueEmailLine3A+' <a href="'+cfg.protocol+'://'+cfg.domain+cfg.proxy_path+cfg.badges_path+'/portfolio/">'+cfg.model_assertions_badgeIssueEmailLine3B+'</a></b>.</p>';
		} else {
			message += '<p>'+cfg.model_assertions_badgeIssueEmailLine4A+' <a href="'+cfg.protocol+'://'+cfg.domain+cfg.proxy_path+'/recipients/requestaccount/'+recipientid+'">'+cfg.model_assertions_badgeIssueEmailLine4B+'</a>.</p>';
		}

		message += cfg.emailfooter;

		var afilename = sanitize(badgename);
		afilename = afilename.split(" ").join("_");
		afilename = afilename+".png";

		//console.log("SEND MAIL");
		//console.log(recipientemail);
		//console.log(afilename);
		//console.log(badgefilepath);

		var mailOptions = {
			from: cfg.fromemailaddress,
			to: recipientemail,
			subject: cfg.model_assertions_badgeIssueEmailSubject,
			html: message,
			attachments: [{
				filename: afilename,
				path: badgefilepath
			}]
		}

		transporter.sendMail(mailOptions, (error, info) => {
		    if (error) {
		        return console.log(error);
		        handler(new Error("Failed to send email to recipient"));
		    } else {
		    	console.log('Message sent: ', info.messageId);
		    	handler(null, info);
			}
		});

		//transporter.sendMail(mailOptions);
	} else {
		console.log("MAIL NOT SENT");
		console.log(recipientid);
		console.log(recipientemail);
		console.log(recipientname);
		console.log(filename);
		console.log(badgefilepath);

		handler(new Error("Failed to send email to recipient. Missing data"));
	}
}

function notifyRecipientOfBadgeRevocation(recipientemail, recipientname, badgename, issuername, handler) {

	// issue email to recipient
	if (recipientemail && recipientemail != ""
			&& recipientname && recipientname != ""
			&& badgename && badgename != ""
			&& issuername && issuername != "") {

		let transporter = nodemailer.createTransport({sendmail: true});

		let message = cfg.emailheader;

		message += '<p>'+cfg.model_assertions_badgeRevokeEmailStart+' '+recipientname+',</p>';
		message += "<p>"+cfg.model_assertions_badgeRevokeEmailStart+" '"+badgename+"' "+cfg.model_assertions_badgeRevokeEmailLine1B+"</p>";
		message += "<p>"+cfg.model_assertions_badgeRevokeEmailLine2A+" '"+issuername+"' "+cfg.model_assertions_badgeRevokeEmailLine2B+"</p>";

		message += cfg.emailfooter;

		let mailOptions = {
			from: cfg.fromemailaddress,
			to: recipientemail,
			subject: cfg.model_assertions_badgeRevokeEmailSubject,
			html: message,
		}

		transporter.sendMail(mailOptions, (error, info) => {
		    if (error) {
		        return console.log(error);
		        handler(new Error("Failed to send email to recipient about badge revocation"));
		    } else {
		    	console.log('Message sent: ', info.messageId);
		    	handler(null, info);
			}
		});

		//transporter.sendMail(mailOptions);
	} else {
		console.log("MAIL NOT SENT: BADGE REVOCATION");
		console.log(recipientemail);
		console.log(recipientname);
		console.log(badgename);
		console.log(issuername);

		handler(new Error("Failed to send email to recipient. Missing data"));
	}
}


/************************************************************************
 *                                                                      *
 *                 LOCAL HELPER FUNCTIONS TO GET JSON                   *
 *                                                                      *
 ************************************************************************/


function createInitialAssertionJSON(issuedon, uniqueid, issueraccount, recipientemail, recipientaccount, handler) {

	if (!uniqueid || uniqueid == ""
			|| !issuedon || issuedon == ""
			|| !issueraccount || issueraccount == ""
			|| !recipientemail || recipientemail == ""
			|| !recipientaccount || recipientaccount == "") {

		handler(new Error("Required variables missing to create assertion JSON"));
	} else {

		let assertionjson = {};
		assertionjson["@context"] = new Array();
		assertionjson["@context"][0] = "https://w3id.org/openbadges/v2";
		assertionjson["@context"][1] = "https://w3id.org/blockcerts/v2";

		assertionjson.type = "Assertion";
		assertionjson.id = cfg.uri_stub+"assertions/"+uniqueid;

		let dateobj = new Date(issuedon*1000);
		let datestr = dateobj.toISOString();

		assertionjson.issuedOn = datestr;

		let encodedemail = utilities.encodeEmail(recipientemail, cfg.badgesalt);

		assertionjson.recipient = {};
		assertionjson.recipient.hashed = true;
		assertionjson.recipient.identity = encodedemail;
		assertionjson.recipient.type = "email";
		assertionjson.recipient.salt = cfg.badgesalt;

		assertionjson.recipientProfile = {};
		assertionjson.recipientProfile.type = new Array();
		assertionjson.recipientProfile.type[0] = "RecipientProfile";
		assertionjson.recipientProfile.type[1] = "Extension";
		assertionjson.recipientProfile.publicKey = "ecdsa-koblitz-pubkey:"+recipientaccount;

		assertionjson.verification = {};
		assertionjson.verification.type = new Array();
		assertionjson.verification.type[0] = "ERC721TokenVerification2018";
		assertionjson.verification.type[1] = "Extension";
		assertionjson.verification.publicKey = "ecdsa-koblitz-pubkey:"+issueraccount;

		handler(null, assertionjson);
	}
}

function makeEndorsementJSON(assertionid, handler) {

	// Add endorsements if there are any

	// use assertionid to pull endorsements from database.
	/*if (data.endorsements && data.endorsements.length > 0) {
		json.endorsement = [];
		var count = data.endorsements.length;
		for(var i=0; i<count;i++) {
			json.endorsement.push(data.endorsements[i]);
		}
	}*/

}

function makeSignatureJSON(tokenContractAddress, assertionjsonhash, tokenid, hashingAlgorithm, canonicalizationAlgorithm, handler) {

	// CREATE SIGNATURE JSON

	if (!hashingAlgorithm || !canonicalizationAlgorithm || !assertionjsonhash || !tokenContractAddress || !tokenid
			|| hashingAlgorithm == "" || canonicalizationAlgorithm == "" || assertionjsonhash == "" || tokenContractAddress == "" || tokenid == "") {

		console.log("Mssing Data - JSON for badge");
		console.log(tokenContractAddress);
		console.log(assertionjson);
		console.log(tokenid);

		handler(new Error("Data missing to create assertion JSON for badge"));
	}

	let signature = {};
	signature.type = new Array();
	signature.type[0] = "ERC721Token2018";
	signature.type[1] = "Extension";
	signature.targetHash = assertionjsonhash;
	signature.hashType = hashingAlgorithm;
	signature.canonicalizationAlgorithm = canonicalizationAlgorithm;
	signature.tokenId = tokenid;
	signature.anchors = new Array();
	signature.anchors[0] = {};
	signature.anchors[0].sourceId = tokenContractAddress;
	signature.anchors[0].type = "ETHData";

	handler(null, signature);
}

/**
 * Get an Assertion type record in Open Badge JSONLD format with blockchain verification by it's unique id.
 * @param id, Required. The uniqueid of the Badge record you wish to retrieve.
 * @return Open Badge JSONLD of the Badge assertion data, or a JSON error object.
 */
 // NOT CURRENTLY USED
exports.getAssertionJSONByUniqueId = function(req, res, next) {

	var data = matchedData(req);

	if (!data.id) {
		data.id = req.params.assertionid;
	}

	// check all expected variables exist
	if (!data.id) {
		return res.status(400).send({"error": "You must include the unique id for the assertion you want to view the JSON data for"});
	}

	var query = 'SELECT badge_issued.*, badges.uniqueid as badgeuniqueid, recipients.loginuserid, recipients.email, recipients.name as recipientname, recipients.encodedemail, recipients.blockchainaccount as recipientaccount, ';
	query += 'issuerusers.blockchainaccount as issueraccount, issuerusers.blockchainaccountpassword as issueraccountpassword, ';
	query += 'badges.blockchainaddress as rdfstoreaddress from badge_issued ';
	query += 'left join recipients on badge_issued.recipientid = recipients.id ';
	query += 'left join badges on badge_issued.badgeid = badges.id ';
	query += 'left join issuers on badges.issuerid = issuers.id ';
	query += 'left join users as issuerusers on issuers.loginuserid = issuerusers.id ';
	query += 'where badge_issued.uniqueid=?';

	db.get().query(query, [data.id], function (err2, rows2) {
		if (err2) {
			console.log(err2);
			res.status(404).send({error: "Error retrieving issuance record"});
		} else {
			if (rows2.length > 0) {
				var row = rows2[0];
				//console.log(row);

				// CREATE THE ASSERTION JSON
				let assertionjson = {};
				assertionjson["@context"] = "https://w3id.org/openbadges/v2";

				assertionjson.type = "Assertion";
				assertionjson.id = cfg.uri_stub+"assertions/"+row["uniqueid"];

				var dateobj = new Date(row["issuedon"]*1000);
				var datestr = dateobj.toISOString();
        assertionjson.issuedOn = datestr;
				
        let encodedemail = utilities.encodeEmail(row["email"], cfg.badgesalt);

				res.locals.assertionjson.recipient = {};
				res.locals.assertionjson.recipient.hashed = true;
				res.locals.assertionjson.recipient.identity = encodedemail;
				res.locals.assertionjson.recipient.type = "email";
				res.locals.assertionjson.recipient.salt = cfg.badgesalt;

				res.locals.assertionjson.recipientProfile = {};
				res.locals.assertionjson.recipientProfile["@context"] = "https://w3id.org/blockcerts/v2";
				res.locals.assertionjson.recipientProfile.type = new Array();
				res.locals.assertionjson.recipientProfile.type[0] = "RecipientProfile";
				res.locals.assertionjson.recipientProfile.type[1] = "Extension";
				res.locals.assertionjson.recipientProfile.publicKey = "ecdsa-koblitz-pubkey:"+row["recipientaccount"];

				res.locals.assertionjson.verification = {};
				res.locals.assertionjson.verification["@context"] = "https://w3id.org/blockcerts/v2";
				res.locals.assertionjson.verification.type = new Array();
				res.locals.assertionjson.verification.type[0] = "MerkleProofVerification2017";
				res.locals.assertionjson.verification.type[1] = "Extension";
				res.locals.assertionjson.verification.publicKey = "ecdsa-koblitz-pubkey:"+row["issueraccount"];

				res.locals.assertionjson.badge = cfg.uri_stub+cfg.badges_path_stub+row["badgeuniqueid"];

				var evidenceHandler = function(err, evidence) {
					if (err && err.message) {
						res.status(404).send({error: err.message});
					} else {
						if (evidence && evidence.length>0) {
							res.locals.assertionjson.evidence = evidence;
						}
						res.send(res.locals.assertionjson);
					}
				}
				createEvidenceJSON(row["id"], evidenceHandler)
			} else {
				res.status(404).send({error: "No badge issuance record found with the given uniqueid"});
			}
		}
	});
}

/**
 * Get an Assertion type record in Open Badge JSONLD format with hosted verification by it's unique id.
 * @param id, Required. The uniqueid of the Badge record you wish to retrieve.
 * @return Open Badge JSONLD of the Badge assertion data, or a JSON error object.
 */
exports.getHostedAssertionJSONByUniqueId = function(req, res, next) {
	var data = matchedData(req);
	if (!data.id) {
		data.id = req.params.assertionid;
	}

	// check all expected variables exist
	if (!data.id) {
		return res.status(400).send({"error": "You must include the unique id for the assertion you want to view the JSON data for"});
	}

	var assertionHandler = function(err, reply) {
		if (err && err.message && err.message != null) {
			return res.status(404).send({"error": err.message});
		} else if (!reply) {
			return res.status(404).send({"error": "Unknown error getting assertion JSON"});
		} else {
			res.send(reply.assertionjson);
		}
	}

	createSignedAssertionJSON(data.id, assertionHandler);
}

function createSignedAssertionJSON(assertionid, handler) {

	var query = 'SELECT badge_issued.*, badges.uniqueid as badgeuniqueid, badges.title as badgetitle, badges.imagepath as badgeimage, recipients.loginuserid, recipients.email, recipients.name as recipientname, recipients.encodedemail, recipients.blockchainaccount as recipientaccount, ';
	query += 'issuerusers.blockchainaccount as issueraccount, issuerusers.blockchainaccountpassword as issueraccountpassword, issuers.uniqueid as issuersuniqueid, issuers.privatekey as privateKey, ';
	query += 'badges.blockchainaddress as rdfstoreaddress from badge_issued ';
	query += 'left join recipients on badge_issued.recipientid = recipients.id ';
	query += 'left join badges on badge_issued.badgeid = badges.id ';
	query += 'left join issuers on badges.issuerid = issuers.id ';
	query += 'left join users as issuerusers on issuers.loginuserid = issuerusers.id ';
	query += 'where badge_issued.uniqueid=?';
	db.get().query(query, [assertionid], function (err2, rows2) {
		if (err2) {
			console.log(err2);
			res.status(404).send({error: "Error retrieving issuance record"});
		} else {
			if (rows2.length > 0) {
				var row = rows2[0];
				//console.log(row);

				let reply = {}
				reply.badgetitle = row["badgetitle"];
				reply.badgeimage = row["badgeimage"];

				// CREATE THE ASSERTION JSON
				reply.assertionjson = {};
				reply.assertionjson["@context"] = "https://w3id.org/openbadges/v2";

				reply.assertionjson.type = "Assertion";

				var url =cfg.uri_stub+"assertions/hosted/"+row["uniqueid"];
				var urlUUID = uuidv5('url', url);
				//console.log(urlUUID);
				reply.assertionjson.id = "urn:uuid:" + urlUUID;


				var dateobj = new Date(row["issuedon"]*1000);
				var datestr = dateobj.toISOString();
				reply.assertionjson.issuedOn = datestr;

				let encodedemail = utilities.encodeEmail(row["email"], cfg.badgesalt);

				reply.assertionjson.recipient = {};
				reply.assertionjson.recipient.hashed = true;
				reply.assertionjson.recipient.identity = encodedemail;
				reply.assertionjson.recipient.type = "email";
				reply.assertionjson.recipient.salt = cfg.badgesalt;

				reply.assertionjson.badge = cfg.uri_stub+cfg.badges_path_stub+"hosted/"+row["badgeuniqueid"];

				var evidencehandler = function(err, evidence) {
					if (err) {
						handler(err);
					} else {
						if (evidence && evidence.length > 0) {
							reply.assertionjson.evidence = evidence;
						}

						//console.log(json)
						reply.assertionjson.verification = {};
						reply.assertionjson.verification.type = "signedBadge";
						reply.assertionjson.verification.creator = cfg.uri_stub + "keys/public/" + row["issuersuniqueid"];

						//console.log(cfg.uri_stub + "keys/public/" + row["issuersuniqueid"])
	/*
						const signature = jws.sign({
							header: {alg: 'RS256'},
							payload: reply.assertionjson,
							privateKey: fs.readFileSync(cfg.directorpath  + 'keys/private-key.pem')
						});
	*/
						const signature = jws.sign({
							header: {alg: 'RS256'},
							payload: reply.assertionjson,
							privateKey: row["privateKey"]
						});
						reply.thesignature = signature;

						//console.log("SIGNATURE = " + reply.thesignature);
						handler(null, reply);
					}
				}

				createEvidenceJSON(row["id"], evidencehandler)
			} else {
				handler(new Error("No badge issuance record found with the given uniqueid"));
			}
		}
	});
}

function createEvidenceJSON(assertionid, handler) {

	if (!assertionid && assertionid != "") {
		handler(new Error("You must include the id for the badge issuance you want to get the Evidence JSON for"));
	}

	let query = 'SELECT evidence.* from evidence ';
	query += 'left join badge_evidence on evidence.id = badge_evidence.evidenceid ';
	query += 'left join badge_issued on badge_evidence.badgeissuedid = badge_issued.id ';
	query += 'where badge_issued.id=?';

	db.get().query(query, [assertionid], function (err2, rows2) {
		if (err2) {
			console.log(err2);
			handler(new Error("Error retrieving evidence records"));
		} else {
			let evidenceArray = [];

			if (rows2.length > 0) {

				let count = rows2.length;
				for (let i=0; i<count; i++) {
					let next = rows2[i];

					let evidence = {};

					if (next.url && next.url != "") {
						evidence.id = next.url;
					} else {
						continue;
					}

					if (next.name && next.name !="") {
						evidence.name = next.name;
					}
					if (next.description && next.description !="") {
						evidence.description = next.description;
					}
					if (next.narrative && next.narrative !="") {
						evidence.narrative = next.narrative;
					}
					if (next.genre && next.genre !="") {
						evidence.genre = next.genre;
					}
					if (next.audience && next.audience !="") {
						evidence.audience = next.audience;
					}

					evidenceArray.push(evidence);
				}
			}
			handler(null, evidenceArray);
		}
	});
}