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
const ipfsAPI = require('ipfs-http-client');
const pngitxt = require('png-itxt');
const fs = require( 'fs' );
const nodemailer = require('nodemailer');
const sanitize = require("sanitize-filename");
const jsonld = require('jsonld');

//var stream = require("stream");

// for building the JSON calling functions in the other models
const badge_model = require('../models/badges');

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

var minttokengas = 6000000;

var ipfsurl = cfg.ipfs_url_stub;
var ipfs = ipfsAPI(cfg.ipfs_api_domain, cfg.ipfs_api_port, {protocol: cfg.ipfs_api_transport});

const { matchedData } = require('express-validator/filter');

exports.viewAssertionByID = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({"error": "You must include the badge assertion id for the badge you want to view"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("recipient", "issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The logged in user account does not have the correct permissions to perform this action."});
			} else {

				var sql = 'SELECT badge_issued.*, badges.title, badges.description, badges.imageurl, issuers.name as issuername ';
				sql += 'from badge_issued left join badges on badge_issued.badgeid = badges.id ';
				sql += 'left join issuers on badges.issuerid ';
				sql += 'left join recipients on badge_issued.recipientid = recipients.id ';
				sql += 'where badge_issued.id=? AND (recipients.loginuserid=? OR issuers.loginuserid=?)';

				db.get().query(sql, [data.id, req.user.id, req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving issuance record"});
					} else {
						if (rows2.length == 0) {
							return res.status(404).send({"error": "The assertion id you have given does not exist in combination with the logged in user account."});
						} else {
							var filepath = rows2[0].badgefilepath;
							if (filepath != null && filepath != "") {
								fs.createReadStream(filepath)
									.pipe(pngitxt.get('openbadges',function (err, pngout) {
										if (!err && pngout) {
											try {
												//console.log(pngout.value);
												var json = JSON.parse(pngout.value);
												//console.log(json);
												var jsonstr = JSON.stringify(json)
												//console.log(jsonstr);
												res.render('viewbadge', { json: jsonstr });
											} catch(err) {
												//console.log(err);
												return res.status(404).send({"error": "Error loading JSON from badge file."});
											}
										} else {
											return res.status(404).send({"error": "Error loading badge json."});
										}
									}));
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

exports.revokedAssertion = function(req, res, next) {

	// revoke tokens.
}

exports.endorseAssertion = function(req, res, next) {

	// revoke tokens.
}

exports.issueAssertion = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the badge issuance you want to issue"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;
	res.locals.id = data.id;
	res.locals.lasttokenid = "";

	res.locals.id = data.id;
	res.locals.timecreated = "";
	res.locals.uniqueid = "";
	res.locals.badgeid = "";
	res.locals.recipientid = "";
	res.locals.issuedon = "";
	res.locals.tokenmetadataurl = "";
	res.locals.blockchainaddress = "";
	res.locals.transaction = "";
	res.locals.tokenid = "";
	res.locals.revokedreason = "";
	res.locals.status = "";

	var tokenContractAddress = cfg.tokenContractAddress;
	if (db.getMode() === db.MODE_TEST) {
		tokenContractAddress = cfg.testTokenContractAddress;
	}

 	data.address = tokenContractAddress;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action";
			} else {
				// check this assertion has not already been issued
				var selectquery = 'SELECT * from badge_issued where id=? AND userid=?';
				var params = [data.id, req.user.id];
				db.get().query(selectquery, params, function(err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error checking badge id";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "The given badge assertion id does not exist.";
						} else {
							var handler = function(req, res, next, data) {
								//console.log(JSON.stringify(data.assertionjson));
								//console.log(JSON.stringify(data.assertionjson.badge));
								//console.log(data);

								var options = {
									algorithm: cfg.canonicalizationAlgorithm
								}
								data.canonicalizationdone = false;
								var processReturn = function(err, canonized) {
									//console.log("IN PROCESS RETURN");
									if (err) {
										//console.log(err);
										res.locals.errormsg = "Error convertin badge JSON to n-triples";
									} else {
										if (data.canonicalizationdone === false) {
											data.canonicalizationdone = true;

											console.log("IN CANONIZED DATA ON WAY OUT");
											console.log(canonized);

											data.metadata = {};
											data.metadata.name = data.assertionjson.badge.name;
											data.metadata.description = data.assertionjson.badge.description;
											data.metadata.image = data.assertionjson.badge.image;
											data.metadata.assertionjsonhash = web3.utils.sha3(canonized);
											data.metadata.hashingAlgorithm = cfg.hashingAlgorithm;
											data.metadata.canonicalizationAlgorithm = cfg.canonicalizationAlgorithm;

											//console.log(data.metadata);
											var handler2 = function(req, res, next, data) {
												console.log("about to issueToken with url:"+data.metadataurl);
												issueToken(req, res, next, data);
											}
											console.log("About to createTokenMetadata");
											createTokenMetadata(req, res, next, data, handler2);
										}
									}
								}
								jsonld.canonize(data.assertionjson, options, processReturn);
							}

							createInitialAssertionJSON(req, res, next, data, handler);
						}
					}
				});
			}
		}
	});

	req.flagCheck = setInterval(function() {
		if (res.locals.finished == true) {
			clearInterval(req.flagCheck);

			// Send data back to client
			var data = {
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

			res.send(data);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

exports.createAssertion = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.badgeid || !data.recipientid) {
		return res.status(400).send({"error": "You must include a recipient id and a badge id for this badge issuance"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

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
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The logged in user account does not have the correct permissions to perform this action.";
			} else {
				// check badge exists in our database.
				var selectquery = 'SELECT * from badges left join issuers on badges.issuerid = issuers.id left join users on issuers.loginuserid = users.id where badges.id=? AND issuers.loginuserid=?';
				var params = [res.locals.badgeid, req.user.id];
				db.get().query(selectquery, params, function(err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error checking badge id";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "The given badge id does not exist or does not exists in conjunction with the logged in user.";
						} else {
							// check recipient exists in our database.
							var selectquery2 = 'SELECT * from recipients where id=? AND userid=?';
							var params2 = [res.locals.recipient, req.user.id];
							db.get().query(selectquery2, params2, function(err3, rows3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error checking recipient id";
								} else {
									if (rows2.length == 0) {
										res.locals.errormsg = "The given recipient id does not exist or does not exists in conjunction with the logged in user.";
									} else {

										// check same issuance not added twice
										var selectquery4 = "select * from badge_issued where userid=? and recipientid=? and badgeid=?";
										var params4 = [req.user.id, res.locals.recipientid, res.locals.badgeid];
										db.get().query(selectquery4, params4, function(err4, rows4) {
											if (err4) {
												console.log(err4);
												res.locals.errormsg = "Error checking for existing badge issuance data";
											} else {
												if (rows4.length > 0) {
													res.locals.errormsg = "The current logged in user has already assigned this badge to this recipient.";
												} else {

													// add new record
													var insertquery5 = 'INSERT INTO badge_issued (userid, timecreated, uniqueid, recipientid, badgeid) VALUES (?,?,?,?,?)';
													var params5 = [req.user.id, res.locals.timecreated, res.locals.uniqueid, res.locals.recipientid, res.locals.badgeid];
													db.get().query(insertquery5, params5, function(err5, result5) {
														if (err5) {
															console.log(err5);
															res.locals.errormsg = "Error saving badge issuance data";
														} else {
															console.log("badge issuance saved");
															res.locals.id = result5.insertId;
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

			//get the record out of the database with all data?

			var data = {
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

			//console.log(data);

			res.send(data);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

exports.updateAssertion = function(req, res, next) {
	var data = matchedData(req);

	// check all data as expected - should happen in the route checks - belt and braces
	if (!data.id) {
		return res.status(400).send({"error": "You must include the id of the badge issuance you want to update"});
	}
	if  ((!data.badgeid || (data.badge && data.badgeid != "")) && (!data.recipientid || (data.recipient && data.recipientid != "")) ) {
		return res.status(400).send({"error": "You must include either the badgeid or the recipientid you want to change"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

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
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The logged in user account does not have the correct permissions to perform this action.";
			} else {
				db.get().query('SELECT * from badge_issued where userid=? and id=? and status="pending"', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error fetching badge issuance record";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "No badge issuance record found with the given id for the currently logged in user, or the badge has been issued and cannot be updated";
						} else {

							res.locals.timecreated = rows2[0].timecreated;
							res.locals.status = rows2[0].status;
							res.locals.uniqueid = rows2[0].uniqueid;

							// if both recipient and badge ids have changed
							if (data.badgeid && data.recipientid) {
								// check badge exists in our database.
								var selectquery = 'SELECT * from badges left join issuers on badges.issuerid = issuers.id left join users on issuers.loginuserid = users.id where badges.id=? AND issuers.loginuserid=?';
								var params = [res.locals.badgeid, req.user.id];
								db.get().query(selectquery, params, function(err2, rows2) {
									if (err2) {
										console.log(err2);
										res.locals.errormsg = "Error checking badge id";
									} else {
										if (rows2.length == 0) {
											res.locals.errormsg = "The given badge id does not exist or does not exists in conjunction with the logged in user.";
										} else {
											// check recipient exists in our database.
											var selectquery2 = 'SELECT * from recipients where id=? AND userid=?';
											var params2 = [res.locals.recipient, req.user.id];
											db.get().query(selectquery2, params2, function(err3, rows3) {
												if (err3) {
													console.log(err3);
													res.locals.errormsg = "Error checking recipient id";
												} else {
													if (rows2.length == 0) {
														res.locals.errormsg = "The given recipient id does not exist or does not exists in conjunction with the logged in user.";
													} else {

														// check same issuance not added twice
														var selectquery4 = "select * from badge_issued where userid=? and recipientid=? and badgeid=?";
														var params4 = [req.user.id, res.locals.recipientid, res.locals.badgeid];
														db.get().query(selectquery4, params4, function(err4, rows4) {
															if (err4) {
																console.log(err4);
																res.locals.errormsg = "Error checking for existing badge issuance data";
															} else {
																if (rows4.length > 0) {
																	res.locals.errormsg = "The current logged in user has already assigned this badge to this recipient.";
																} else {

																	// add new record
																	var updatequery5 = 'UPDATE badge_issued set recipientid=?, badgeid=? where id=? and userid=?';
																	var params5 = [res.locals.recipientid, res.locals.badgeid, res.locals.id, req.user.id];
																	db.get().query(updatequery5, params5, function(err5, result5) {
																		if (err4) {
																			console.log(err5);
																			res.locals.errormsg = "Error updating badge issuance record";
																		} else {
																			console.log("badge issuance updated");
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
							} else if (data.badgeid && !data.recipientid) {
								// ONLY BADGE ID CHANGED
								// check recipient exists in our database.
								var selectquery2 = 'SELECT * from badges where id=? AND userid=?';
								var params2 = [res.locals.badgeid, req.user.id];
								db.get().query(selectquery2, params2, function(err3, rows3) {
									if (err3) {
										console.log(err3);
										res.locals.errormsg = "Error checking badge id";
									} else {
										if (rows2.length == 0) {
											res.locals.errormsg = "The given badge id does not exist or does not exists in conjunction with the logged in user.";
										} else {
											res.locals.recipientid = rows2[0].recipientid;

											// check the same issuance not added twice
											var selectquery4 = "select * from badge_issued where userid=? and recipientid=? and badgeid=?";
											var params4 = [req.user.id, res.locals.recipientid, data.badgeid];
											db.get().query(selectquery4, params4, function(err4, rows4) {
												if (err4) {
													console.log(err4);
													res.locals.errormsg = "Error checking for existing badge issuance data";
												} else {
													if (rows4.length > 0) {
														res.locals.errormsg = "The current logged in user has already issued this badge to this recipient.";
													} else {
														// update badgeid
														var insertquery5 = 'UPDATE badge_issued SET badgeid=? where id=?';
														var params5 = [res.locals.badgeid, req.user.id];
														db.get().query(insertquery5, params5, function(err5, result5) {
															if (err4) {
																console.log(err5);
																res.locals.errormsg = "Error updating new badgeid on badge issuance record";
															} else {
																console.log("badge issuance badge id updated");
																res.locals.id = result5.insertId;
																res.locals.finished = true;
															}
														});
													}
												}
											});
										}
									}
								});
							} else if (!data.badgeid && data.recipientid) {

								// ONLY RECIPIENT ID CHANGED
								// check recipient exists in our database.
								var selectquery2 = 'SELECT * from recipients where id=? AND userid=?';
								var params2 = [res.locals.recipientid, req.user.id];
								db.get().query(selectquery2, params2, function(err3, rows3) {
									if (err3) {
										console.log(err3);
										res.locals.errormsg = "Error checking recipient id";
									} else {
										if (rows2.length == 0) {
											res.locals.errormsg = "The given recipient id does not exist or does not exists in conjunction with the logged in user.";
										} else {
											res.locals.badgeid = rows2[0].badgeid;

											// check the same issuance not added twice
											var selectquery4 = "select * from badge_issued where userid=? and recipientid=? and badgeid=?";
											var params4 = [req.user.id, res.locals.recipientid, res.locals.badgeid];
											db.get().query(selectquery4, params4, function(err4, rows4) {
												if (err4) {
													console.log(err4);
													res.locals.errormsg = "Error checking for existing badge issuance data";
												} else {
													if (rows4.length > 0) {
														res.locals.errormsg = "The current logged in user has already issued this badge to this recipient.";
													} else {

														// update recipientid
														var insertquery5 = 'UPDATE badge_issued SET recipientid=? where id=?';
														var params5 = [res.locals.recipientid, req.user.id];
														db.get().query(insertquery5, params5, function(err5, result5) {
															if (err4) {
																console.log(err5);
																res.locals.errormsg = "Error updating new recipient id on badge issuance record";
															} else {
																console.log("badge issuance recipientid updated");
																res.locals.id = result5.insertId;
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

			//console.log(data);

			res.send(data);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

exports.deleteAssertion = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the badge issuance you want to delete"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;
	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action";
			} else {
				db.get().query('SELECT * from badge_issued WHERE userid=? and id=? && status="pending"', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error fetching badge issuance record";
					} else {
						if (rows2.length == 0) {
							return res.status(404).send("No badge issuance record found with the given id for the currently logged in user, or the badge has been issued and cannot be deleted");
						} else {
							var updatequery = "DELETE from badge_issued WHERE userid=? AND id=?";
							var params = [req.user.id, data.id];

							db.get().query(updatequery, params, function(err4, results4) {
								if (err4) {
									console.log(err4);
									res.locals.errormsg = "Error deleting badge issuance record.";
								} else {
									console.log("badge issuance record deleted");
									res.locals.finished = true;
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

exports.listAssertionsPortfolio = function(req, res, next) {

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("recipient")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				db.get().query('SELECT badge_issued.*, badges.title, badges.description, badges.imageurl, issuers.name as issuername from badge_issued left join badges on badge_issued.badgeid = badges.id left join issuers on badges.issuerid = issuers.id left join recipients on badge_issued.recipientid = recipients.id left join users on recipients.loginuserid = users.id where users.id=? AND badge_issued.status IN ("issued","revoked")', [req.user.id], function (err2, rows2) {
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
								data.issuer = next["issuername"];
								data.issuedon = next["issuedon"];
								data.badgeid = next["badgeid"];
								data.title =  next["title"];
								data.description = next["description"];
								data.imageurl = next["imageurl"];
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

exports.listAssertions = function(req, res, next) {

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT * from badge_issued where userid=?', [req.user.id], function (err2, rows2) {
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

/** MANAGE ADDING REMOVING ENDORSERS ON AN ASSERTION **/

exports.addEndorser = function(req, res, next) {

	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id || !data.endorserid) {
		return res.status(400).send({"error": "You must include id for the badge issuance you want to add an endorser to and the endorser id to add"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

	res.locals.id = "";
	res.locals.badgeissueid = data.id;
	res.locals.endorserid = data.endorserid;
	res.locals.status = "pending;"

	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action";
			} else {
				// check badge issuance record exists and is pending
				db.get().query('SELECT * from badge_issued where userid=? and id=? and status="pending"', [req.user.id, res.locals.badgeissueid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error retrieving issuance record";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "No badge issuance record found with the given id for the currently logged in user, or the badge issuance has been issued so can't be modified";
						} else {
							// check endorser record exists
							db.get().query('SELECT * from endorsers where userid=? and id=?', [req.user.id, res.locals.endorserid], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error retrieving issuance record";
								} else {
									if (rows3.length == 0) {
										res.locals.errormsg = "No endorser record found with the given id for the currently logged in user";
									} else {
										// add badge_endorsement record
										db.get().query('Insert into badge_endorsement (userid, timecreated, endorserid, itemid, itemtype) VALUES (?,?,?,?,?) ', [req.user.id, res.locals.timecreated, res.locals.endorserid, res.locals.badgeissueid, "assertion"], function (err4, result4) {
											if (err4) {
												console.log(err4);
												res.locals.errormsg = "Error inserting badge issuance endorser record";
											} else {
												console.log("badge_endorser record saved");
												res.locals.id = result4.insertId;
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
			var data = {
				 id: res.locals.id,
				 timecreated: res.locals.timecreated,
				 badgeissuedid: res.locals.badgeissueid,
				 endorserid: res.locals.endorserid,
				 status: res.locals.status,
			};
			res.send(data);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

exports.removeEndorser = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the badge issuance endorser you want to delete"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;
	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action";
			} else {
				// check badge issuance endorsement record exists and is pending
				db.get().query('SELECT * from badge_endorsement where userid=? and id=? and status="pending"', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error retrieving issuance record";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "No badge endorers record found with the given id for the currently logged in user, or the badge issuance has been issued so can't be modified";
						} else {
							// Check endorser has not already done the endorsement - should they be able to delete the endorser from the badge after the endorser has endorsed?
							db.get().query('SELECT * from badge_endorsement WHERE userid=? and id=? && status="pending"', [req.user.id, data.id], function (err3, rows3) {
								if (err2) {
									console.log(err2);
									res.locals.errormsg = "Error fetching badge issuance record";
								} else {
									if (rows2.length == 0) {
										res.locals.errormsg = "No badge endorsement record found with the given id for the currently logged in user, or the badge endorsement has been endorsed and cannot be removed";
									} else {
										var updatequery = "DELETE from badge_endorsement WHERE userid=? AND id=?";
										var params = [req.user.id, data.id];

										db.get().query(updatequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												res.locals.errormsg = "Error deleting badge endorsement record.";
											} else {
												console.log("badge endorsement record deleted");
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

						console.log("ROWS: ");
						console.log(rows2);

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


/************************************/
/** TOKEN ISSUING RELATED FUNCTION **/
/************************************/

function createInitialAssertionJSON(req, res, next, data, handler) {

	if (!data.id) {
		res.locals.errormsg = "You must include id for the badge issuance you want to get the OpenBadge JSON for";
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action";
			} else {

				var query = 'SELECT badge_issued.*, recipients.email, recipients.name as recipientname, recipients.encodedemail, recipients.	blockchainaccount as recipientaccount, issuerusers.blockchainaccount as issueraccount, badges.blockchainaddress as rdfstoreaddress from badge_issued ';
				query += 'left join recipients on badge_issued.recipientid = recipients.id ';
				query += 'left join badges on badge_issued.badgeid = badges.id ';
				query += 'left join issuers on badges.issuerid = issuers.id ';
				query += 'left join users as issuerusers on issuers.loginuserid = issuerusers.id ';
				query += 'where badge_issued.userid=? and badge_issued.id=?';

				db.get().query(query, [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error retrieving issuance record";
					} else {
						if (rows2.length > 0) {
							var next = rows2[0];

							//console.log(next);

							data.badgeid = next["badgeid"];
							data.recipientid = next["recipientid"];
							data.status = next["status"];
							data.issueraccount = next["blockchainaccount"];
							data.issuerpassword = next["blockchainaccountpassword"];

							data.assertionjson = {};
							data.assertionjson["@context"] = new Array();
							data.assertionjson["@context"][0] = "https://w3id.org/openbadges/v2";
							data.assertionjson["@context"][1] = "https://w3id.org/blockcerts/v2";
							data.assertionjson.type = "Assertion";
							data.assertionjson.id = cfg.uri_stub+"badges/assertions/"+next["uniqueid"];

							var dateobj = new Date();
							var time = (dateobj.getTime())/1000;
							var datestr = dateobj.toISOString();
							data.issuedon = time; // for database later
							data.assertionjson.issuedon = datestr;

							data.assertionjson.recipient = {};
							data.assertionjson.recipient.hashed = true;
							data.assertionjson.recipient.identity = next["encodedemail"];
							data.assertionjson.recipient.type = "email";
							data.assertionjson.recipient.salt = cfg.badgesalt;

							data.assertionjson.recipientProfile = {};
							data.assertionjson.recipientProfile.type = new Array();
							data.assertionjson.recipientProfile.type[0] = "RecipientProfile";
							data.assertionjson.recipientProfile.type[1] = "Extension";
							data.assertionjson.recipientProfile.publicKey = "ecdsa-koblitz-pubkey:"+next["recipientaccount"];

							// Needed for issuing the token later in the process against this Assertion JSON
							data.recipientaccount = next["recipientaccount"];
							data.recipientemail = next["email"];
							data.issueraccount = next["issueraccount"];
							data.rdfstoreaddress = next["rdfstoreaddress"];

							data.assertionjson.verification = {};
							data.assertionjson.verification.type = new Array();
							data.assertionjson.verification.type[0] = "ERC721TokenVerification2018";
							data.assertionjson.verification.type[1] = "Extension";
							data.assertionjson.verification.publicKey = "ecdsa-koblitz-pubkey:"+next["issueraccount"];

							// fill in the existing parts of the return data
							res.locals.timecreated = next["timecreated"];
							res.locals.uniqueid = next["uniqueid"];
							res.locals.badgeid = next["badgeid"];
							res.locals.recipientid = next["recipientid"];
							res.locals.issuedon = time;
							res.locals.status = next["status"];

							// for email
							res.locals.recipientname = next["recipientname"];

							var localhandler = function(req, res, next, data) {
								data.assertionjson.badge = data.badgejson;
								//console.log(data.badgejson);

								var innerlocalhandler = function() {
									data.assertionjson.evidence = data.evidence;
									//console.log(data.evidence);

									handler(req, res, next, data);
								}
								createEvidenceJSON(req, res, next, data, innerlocalhandler);
							}

							badge_model.getBadgeOpenBadgeJSON(req, res, next, data, localhandler);
						} else {
							res.locals.errormsg = "No badge issuance record found with the given id for the currently logged in user";
						}
					}
				});
			}
		}
	});
}


function createEvidenceJSON(req, res, next, data, handler) {

	if (!data.id) {
		res.locals.errormsg = "You must include the id for the badge issuance you want to get the Evidence JSON for";
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action";
			} else {

				var query = 'SELECT evidence.* from evidence ';
				query += 'left join badge_evidence on evidence.id = badge_evidence.evidenceid ';
				query += 'left join badge_issued on badge_evidence.badgeissuedid = badge_issued.id ';
				query += 'where badge_issued.userid=? and badge_issued.id=?';

				db.get().query(query, [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error retrieving evidence records";
					} else {
						if (rows2.length > 0) {
							data.evidence = [];

							var count = rows2.length;
							for (var i=0; i<count; i++) {
								var next = rows2[i];

								var evidence = {};

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

								data.evidence.push(evidence);
							}

							handler(req, res, next, data);
						} else {
							// no evidence added. Just carry on.
							handler(req, res, next, data);
						}
					}
				});
			}
		}
	});
}


function createTokenMetadata(req, res, next, data, returnhandler) {

	console.log("createTokenMetadata");
	console.log(data);

	if (data.metadata) {

		json = {};
		json.name = data.metadata.name;
		json.description = data.metadata.description;
		json.image = data.metadata.image;
		json.meta = {};

		if (data.metadata.assertionjsonhash) {
			json.meta.badgehash = data.metadata.assertionjsonhash;
			json.meta.hashingAlgorithm = data.metadata.hashingAlgorithm;
			json.meta.canonicalizationAlgorithm = data.metadata.canonicalizationAlgorithm;
		}

		// As we are not using SOLID we are not adding files here at present.
		// urls to evidence may not be files and there is no real way of checking
		// reliably so it does not make sense to hash them at present.
		//if (json.meta.files) {
			/*
			json.meta.files = [];
			json.meta.files[0] = {};
			json.meta.files[0].filepath = rows[0]["solidurl"];
			json.meta.files[0].filehash = rows[0]["jsonhash"];
			json.meta.files[0].hashingAlgorithm = rows[0]["jsonhashalgorithm"];
			*/
		//}

		//console.log(JSON.stringify(json));

		var content = Buffer.from(JSON.stringify(data.metadata));
		var ipfshandler = function(e, results) {
			if (!e) {
				var hash = results[0].hash;
				//console.log(hash);
				data.metadataurl = ipfsurl + hash;
				console.log(data.metadataurl);

				// Store metadata url to database
				var updatequery = 'update badge_issued set tokenmetadataurl=?, assertionjsonhash=? where userid=? and id=?';
				var params = [data.metadataurl, data.metadata.assertionjsonhash, req.user.id, data.id];
				db.get().query(updatequery, params, function(err, results) {
					if (err) {
						console.log(err);
						res.locals.errormsg = "Error saving metadataurl url";
					} else {
						// add this element of the return data
						res.locals.tokenmetadataurl = data.metadataurl;

						returnhandler(req, res, next, data);
					}
				});
			} else {
				console.log(e);
				res.locals.errormsg = "Failed to write token metadata file to IPFS";
			}
		}
		ipfs.add(content, ipfshandler);
	} else {
		res.locals.errormsg = "No token metadata object present";
	}
}

function issueToken(req, res, next, data) {

	//console.log("MINT DATA");
	//console.log(data.recipientaccount);
	//console.log(data.metadataurl);
	//console.log(data.rdfstoreaddress);
	//console.log(data.metadata.assertionjsonhash);

	// data expected data there
	if (data.recipientaccount && data.rdfstoreaddress && data.metadataurl && data.metadata.assertionjsonhash &&
				data.recipientaccount != "" && data.rdfstoreaddress != "" && data.metadataurl != "" && data.metadata.assertionjsonhash != "") {

		// check current user = issuer
		if (data.issueraccount == req.user.blockchainaccount) {

			//console.log("issueToken");
			//console.log(data);

			var unlockaccounthandler = function(req, res, next, data) {

				var time = Math.floor((new Date().getTime()) / 1000);
				data.tokenKey = data.metadata.assertionjsonhash+time;

				var tokenInstance = new web3.eth.Contract(cfg.contracts.erc721metadatamintable.abi, data.address);
				tokenInstance.methods.mintWithTokenData(data.recipientaccount, data.metadataurl, data.rdfstoreaddress, data.tokenKey).send({from: req.user.blockchainaccount, gas: minttokengas})
					.on('transactionHash', function(hash){
						data.transaction = hash;
					})
					.on('receipt', function(receipt){
						//console.log(receipt);
						if (receipt.status == "0x0") {
							res.locals.errormsg = "token creation transaction failed";
						} else {
							completeTokenIssuing(req, res, next, data, receipt.transactionHash);
						}
					})
					.on('error', function(error){
						console.log(error);
						res.locals.errormsg = "Error minting token";
					});
			}

			utilities.unlockAccount(req, res, next, data, unlockaccounthandler, req.user.blockchainaccount, req.user.blockchainaccountpassword);

		} else {
			res.locals.errormsg = "The currently logged in user is not the issuer for the badge on this assertion";
		}
	} else {
		res.locals.errormsg = "Missing data to issue this a token. You must have set data.recipientaccount, data.rdfstoreaddress and data.metadataurl";
	}
}

function completeTokenIssuing(req, res, next, data, txhash) {

	if (data.transaction != txhash) {
		res.locals.errormsg = "Error: token issuing transaction missmatch";
	}

	var tokenInstance = new web3.eth.Contract(cfg.contracts.erc721metadatamintable.abi, data.address);
	tokenInstance.methods.getTokenFromKey(data.tokenKey).call()
		.then(function(result) {

			//console.log("getting token id from hash done");
			data.tokenid = result;

			var query = 'Select * from badge_issued where userid=? AND blockchainaddress=? AND recipientid=? AND transaction=? AND tokenid=?';
			var params = [req.user.id, data.address, data.recipientlocalid, data.transaction, data.tokenid];
			db.get().query(query, params, function(err, rows, fields) {
				if (err) {
					console.log(err);
					res.locals.errormsg = "Error saving token issuance";
				} else if (rows.length == 0) {
					//console.log("DO UPDATE");

					var updatequery = 'Update badge_issued set issuedon=?, blockchainaddress=?, transaction=?, tokenid=? where id=? and userid=?';
					var updateparams = [data.issuedon, data.address, data.transaction, data.tokenid, data.id, req.user.id];

					//console.log(updatequery);
					//console.log(updateparams);

					db.get().query(updatequery, updateparams, function(err2, results2) {
						if (err2) {
							console.log(err2);
							res.locals.errormsg = "Error updating token issuance with token data after transaction mined";
						} else {
							console.log("assertion saved");

							// complete the return data elements
							res.locals.blockchainaddress = data.address;
							res.locals.transaction = data.transaction;
							res.locals.tokenid = data.tokenid;
							res.locals.status = "issued";

							// create the file to be used by students and email recipient.
							var returnhandler = function() {
								var returnhandler2 = function() {
									var returnhandler3 = function() {
										res.locals.finished = true;
									}
									notifyRecipientOfBadge(req, res, next, data, returnhandler3);
								}
								createOpenBadgeFile(req, res, next, data, returnhandler2)
							}
							makeSignatureJSON(req, res, next, data, returnhandler);
						}
					});
				} else {
					res.locals.errormsg = "Error issuing token. The database thinks that this token has already been issued";
				}
			});
		}).catch((error) => {
			console.log(error);
			res.locals.errormsg = "Error getting tokenid for the given badge hash from the Token contract";
		});
}

function makeSignatureJSON(req, res, next, data, handler) {
	/*
	data.id
	data.address;
	data.assertionjson
	data.metadata.assertionjsonhash
	data.tokenid

	optional data.endorsements

	cfg.tokencontractaddress
	cfg.tempfolder
	cfg.badgefolder
	*/

	// CREATE SIGNATURE JSON
	//console.log(data.assertionjson);

	if (!data.id || !data.metadata.assertionjsonhash || !data.address || !data.assertionjson || !data.tokenid
			|| data.id == "" || data.metadata.assertionjsonhash == "" || data.address == "" || data.assertionjson == "" || data.tokenid == "") {
		console.log("Mssing Data - JSON for badge");
		console.log(data.id);
		console.log(data.address);
		console.log(data.metadata.assertionjsonhash);
		console.log(data.assertionjson);
		console.log(data.tokenid);

		res.locals.errormsg = "Data missing to create assertion JSON for badge";
	}

	var json = data.assertionjson;

	var signature = {};
	signature.type = new Array();
	signature.type[0] = "ERC721Token2018";
	signature.type[1] = "Extension";
	signature.targetHash = data.metadata.assertionjsonhash;
	signature.hashType = data.metadata.hashingAlgorithm;
	signature.canonicalizationAlgorithm = data.metadata.canonicalizationAlgorithm;
	signature.tokenId = data.tokenid;
	signature.anchors = new Array();
	signature.anchors[0] = {};
	signature.anchors[0].sourceId = data.address;
	signature.anchors[0].type = "ETHData";
	json.signature = signature;

	// Add endorsements if there are any
	/*if (data.endorsements && data.endorsements.length > 0) {
		json.endorsement = [];
		var count = data.endorsements.length;
		for(var i=0; i<count;i++) {
			json.endorsement.push(data.endorsements[i]);
		}
	}*/

	data.fullbadgejson = json;

	var str = JSON.stringify(data.fullbadgejson);

	// update database
	var updatequery = 'UPDATE badge_issued set assertionjson=? WHERE id=?';
	var params = [str, data.id];
	db.get().query(updatequery, params, function(err, results) {
		if (err) {
			res.locals.errormsg = "Failed to save assertion JSON to database";
			console.log(err);
		} else {
			handler(req, res, next, data);
		}
	});
}

function createOpenBadgeFile(req, res, next, data, handler) {
	/*
	data.id
	data.fullbadgejson
	data.metadata.assertionjsonhash
	data.metadata.image
	data.imagepath

	cfg.tokencontractaddress
	cfg.tempfolder
	cfg.badgefolder

	*/

	if (!data.id || !data.fullbadgejson || !data.metadata.assertionjsonhash || !data.metadata.image || !data.imagepath
			|| data.id == "" || data.fullbadgejson == "" || data.imagepath == "" || data.metadata.assertionjsonhash == "" || data.metadata.image == ""
			|| data.id == null || data.fullbadgejson == null || data.imagepath == null || data.metadata.assertionjsonhash == null || data.metadata.image == null) {

		console.log("Mssing Data - Open Badge File");
		console.log(data.id);
		console.log(data.fullbadgejson);
		console.log(data.metadata.assertionjsonhash);
		console.log(data.metadata.image);
		console.log(data.imagepath);

		res.locals.errormsg = "Data missing to create Open Badge file";
	}

	str = JSON.stringify(data.fullbadgejson);

	// ADD TO IMAGE
	//console.log(json);

	typeobj = {};
	typeobj.type = "iTXt";
	typeobj.keyword = "openbadges";
	typeobj.value = str;

	try {
		fs.createReadStream(data.imagepath)
			.pipe(pngitxt.set(typeobj))
			.pipe(fs.createWriteStream(cfg.badgefolder + data.metadata.assertionjsonhash + ".png")
				.on('finish', function () {

					console.log('Completed');
					var badgefilepath = cfg.badgefolder + data.metadata.assertionjsonhash + ".png";
					data.badgefilepath = badgefilepath;

					try {
						if (fs.existsSync(badgefilepath)) {
							var stats = fs.statSync(badgefilepath);
							if (stats.size > 0) {
								//fs.readFile(data.imagepath, function(err, buffer){

								//data.filebufferdata = base64_encode(data.imagepath);
								//console.log(data.filebufferdata);

								//data.filebufferdata = buffer;
								//data.filetype = "image/png";
								//data.filename = data.metadata.assertionjsonhash;
								//data.fileextension = "png";

								// update database
								var query = 'UPDATE badge_issued set badgefilepath=?, status="issued" WHERE id=?';
								var params = [data.badgefilepath, data.id];
								db.get().query(query, params, function(err, results) {
									if (err) {
										res.locals.errormsg = "Failed to save badge file path to database";
										console.log(err);
									} else {
										handler(req, res, next, data);
									}
								});
							} else {
								console.log("Failed to create Open Badge file - file is empty");
								res.locals.errormsg = "Fail to correctly create Open Badge";
							}
						} else {
								console.log("Failed to create Open Badge file - file does not exist");
							res.locals.errormsg = "Failed to create Open Badge file";
						}
					} catch(err2) {
						console.error(err2);
						res.locals.errormsg = "Failed to check Open Badge file exists";
					}
				})
		);
	} catch(err) {
		console.error(err);
		res.locals.errormsg = "Failed to create Open Badge";
	}
}

function notifyRecipientOfBadge(req, res, next, data, handler) {

	// issue email to recipient
	if (data.recipientemail && data.recipientemail != "" && data.badgefilepath && data.badgefilepath != "" && data.metadata.name && data.metadata.name != "") {

		var transporter = nodemailer.createTransport({sendmail: true});

		var message = cfg.emailheader;

		message += '<p>Dear '+res.locals.recipientname+',</p>';
		message += "<p>You have been issued the badge '"+data.metadata.name+"' on the Institute of Coding website.</p>";
		message += '<p>Please find the badge attached to this email.</p>';
		message += '<p><b>You can view or download you badge by going to your <a href="'+cfg.protocol+'://'+cfg.domain+cfg.proxy_path+'/portfolio/">badge portfolio</a></b>.</p>';

		message += cfg.emailfooter;

		var afilename = sanitize(data.metadata.name);
		afilename = afilename.split(" ").join("_");
		afilename = afilename+".png";

		console.log("SEND MAIL");
		console.log(data.recipientemail);
		console.log(afilename);
		console.log(data.badgefilepath);

		var mailOptions = {
			from: cfg.fromemailaddress,
			to: data.recipientemail,
			subject: 'Institute of Coding: You have been issued a Badge',
			html: message,
			attachments: [{
				filename: afilename,
				path: data.badgefilepath
			}]
		}

		transporter.sendMail(mailOptions, (error, info) => {
		    if (error) {
		        return console.log(error);
		        res.locals.errormsg = "Failed to send email to recipient";
		    } else {
		    	console.log('Message sent: ', info.messageId);
		    	handler(req, res, next, data);
			}
		});

		//transporter.sendMail(mailOptions);
	} else {
		console.log("MAIL NOT SENT");
		console.log(data.recipientemail);
		console.log(filename);
		console.log(data.badgefilepath);

		res.locals.errormsg = "Failed to send email to recipient. Missing data";
	}
}

// What to do if it all goes wrong
// function recoverTokenID(data) {}


/** TOKEN RELATED HELPER FUNCTIONS - TAKEN FROM SERVICE_OPENBADGES_1 **/

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

		req.flagCheck = null;
		res.locals.errormsg = "";

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

										} else {
											console.log(e4);
											res.locals.errormsg = "Issuing fetching token recipient";
										}
										return null;
									};
									tokenInstance.methods.ownerOf(res.locals.tokenid).call(handler4);

								} else {
									console.log(e3);
									res.locals.errormsg = "Issuing fetching token associated contract address";
								}
								return null;
							};
							tokenInstance.methods.tokenContractAddress(res.locals.tokenid).call(handler3);
						} else {
							console.log(e2);
							res.locals.errormsg = "Issuing fetching token issuer address";
						}
						return null;
					};
					tokenInstance.methods.tokenMinterAddress(res.locals.tokenid).call(handler2);

				} else {
					console.log(e);
					res.locals.errormsg = "Issuing fetching token metadata url";
				}
				return null;
			};
			tokenInstance.methods.tokenURI(res.locals.tokenid).call(handler1);

			req.flagCheck = setInterval(function() {
				if (res.locals.recipientaccount != "") {
					clearInterval(req.flagCheck);
					var data = {
						 address: res.locals.address,
						 tokenid: res.locals.tokenid,
						 recipientaccount: res.locals.recipientaccount,
						 issueraccount: res.locals.issueraccount,
						 metadataurl: res.locals.metadataurl,
						 relatedcontractaddress: res.locals.contractaddress
					};
					reply.items.push(data);

					//console.log(reply);

					clearInterval(req.flagCheck);
					index++;

					getTokenAssertions(rows, index, reply, req, res);
				} else if (res.locals.errormsg != "") {
					clearInterval(req.flagCheck);
					res.status(404).send({error: res.locals.errormsg});
				}
			}, 100); // interval set at 100 milliseconds
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

	req.flagCheck = null;
	res.locals.errormsg = "";

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

									} else {
										console.log(e4);
										res.locals.errormsg = "Issuing fetching token recipient";
									}
									return null;
								};
								tokenInstance.methods.ownerOf(res.locals.tokenid).call(handler4);
							} else {
								console.log(e3);
								res.locals.errormsg = "Issuing fetching token associated contract address";
							}
							return null;
						};
						tokenInstance.methods.tokenContractAddress(res.locals.tokenid).call(handler3);
					} else {
						console.log(e2);
						res.locals.errormsg = "Issuing fetching token issuer address";
					}
					return null;
				};
				tokenInstance.methods.tokenMinterAddress(res.locals.tokenid).call(handler2);

			} else {
				console.log(e);
				res.locals.errormsg = "Issuing fetching token metadata url";
			}
			return null;
		};
		tokenInstance.methods.tokenURI(res.locals.tokenid).call(handler1);

		req.flagCheck = setInterval(function() {
			if (res.locals.recipientaccount != "") {
				clearInterval(req.flagCheck);
				var data = {
					 address: res.locals.address,
					 tokenid: res.locals.tokenid,
					 recipientaccount: res.locals.recipientaccount,
					 issueraccount: res.locals.issueraccount,
					 metadataurl: res.locals.metadataurl,
					 relatedcontractaddress: res.locals.contractaddress
				};

				//console.log(data);

				res.send(data);
			} else if (res.locals.errormsg != "") {
				clearInterval(req.flagCheck);
				res.status(404).send({error: res.locals.errormsg});
			}
		}, 100); // interval set at 100 milliseconds
	} else {
		return res.status(401).send("The assertion token cannot be found");
	}
}