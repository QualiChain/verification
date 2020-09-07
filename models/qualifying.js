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
const nodemailer = require('nodemailer');

const urlExists = require('url-exists');

var count = 0;
var gasPrice = 21000000000;

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const { matchedData } = require('express-validator/filter');

exports.getQualifyingBadgeManagementPage = function(req, res, next) {
	var data = matchedData(req);
	if (!data.id) {
		data.id = req.body.badgeid;
	}
	//console.log(req.params);

	// check all expected variables exist
	if (!data.id) {
		return res.status(400).send({"error": "You must include the unique id for the badge you want to manage the qualifying badges for"});
	}

	db.get().query('SELECT rolename FROM users LEFT JOIN user_roles ON users.id = user_roles.personid LEFT JOIN roles ON user_roles.roleid = roles.id WHERE users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				res.render('managequalifyingbadges', { title: 'Manage Qualifying Badges', badgeid: data.id});
			}
		}
	});
}

exports.getQualifyingBadgeIssuerPage = function(req, res, next) {
	var data = matchedData(req);
	if (!data.id) {
		data.id = req.body.badgeid;
	}
	//console.log(req.params);

	// check all expected variables exist
	if (!data.id) {
		return res.status(400).send({"error": "You must include the unique id for the badge you want to view qualifying badges for"});
	}

	db.get().query('SELECT rolename FROM users LEFT JOIN user_roles ON users.id = user_roles.personid LEFT JOIN roles ON user_roles.roleid = roles.id WHERE users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				res.render('viewissuerqualifyingbadges', { title: 'View Qualifying Badges', badgeid: data.id});
			}
		}
	});
}

/**
 * Create a new qualifying badge record
 * @param badgeid, Required. The record identifier of the badge the qualifying badge is being associated with.
 * @param title, Required. The title of the qualifying badge as it will appear in the badge JSON.
 * @param description, Required. The description of the qualifying badge as it will appear in the badge JSON.
 * @param domain, Required. The Required. The hosted domain of this qualifying badge as it will appear in the badge JSON.
 * @param issuername, Required. The issuer name for this qualifying badge as it will appear in the badge JSON.
 * @param issuerurl, Required. The issuer url for this qualifying badge, as it will appear in the badge JSON.
 * @param startdate, Optional. The date from which this badge is a qualifying badge, in seconds.
 * @param enddate, Optional. The date up to which this badge is a qualifying badge, in seconds.
 * @return JSON of the qualifying badge or a JSON error object
 */
exports.createBadge = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	if (!data.badgeid) {
		return res.status(400).send({"error": "You must include the id of the badge associated with this qualifying badge"});
	}
	// should never need this as the check is done in the routes
	if (!data.title || !data.description || !data.domain || !data.issuername || !data.issuerurl) {
		return res.status(400).send({"error": "You must include a title, description, domain, issuer name and issuer url this qualifying badge"});
	}

	//console.log(data);

	res.locals.badgeid = data.badgeid;
	res.locals.title = data.title;
	res.locals.description = data.description;
	res.locals.domain = data.domain;
	res.locals.issuername = data.issuername;
	res.locals.issuerurl = data.issuerurl;
	res.locals.startdate = data.startdate;
	res.locals.enddate = data.enddate;
	res.locals.enabled = 1;
	res.locals.timecreated = Math.floor((new Date().getTime()) / 1000);

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND (roles.rolename = "super" OR roles.rolename = "admin") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({"error": "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				db.get().query('SELECT badges.*, users.blockchainaccount FROM badges left join issuers ON badges.issuerid = issuers.id LEFT JOIN users ON issuers.loginuserid = users.id WHERE badges.userid=? AND badges.id=?', [req.user.id, data.badgeid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({"error": "Error fetching badge record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({"error": "No badge record found with the given id for the currently logged in user"});
						} else {
							var insertquery = 'INSERT INTO badge_claimable (userid, timecreated, badgeid, title, description, domain, issuername, issuerurl, startdate, enddate, enabled) VALUE (?,?,?,?,?,?,?,?,?,?,?)';
							var params = [req.user.id, res.locals.timecreated, res.locals.badgeid, res.locals.title, res.locals.description, res.locals.domain, res.locals.issuername, res.locals.issuerurl, res.locals.startdate, res.locals.enddate, res.locals.enabled];
							db.get().query(insertquery, params, function(err3, result3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({"error": "Error saving qualifying badge data"});
								} else {
									console.log("qualifying badge saved");
									res.locals.qualifyingbadgeid = result3.insertId;
									var data = {
										id: res.locals.qualifyingbadgeid,
										badgeid: res.locals.badgeid,
										timecreated: res.locals.timecreated,
										title: res.locals.title,
										description: res.locals.description,
										domain: res.locals.domain,
										issuername: res.locals.issuername,
										issuerurl: res.locals.issuerurl,
										startdate: res.locals.startdate,
										enddate: res.locals.enddate,
										enabled: res.locals.enabled,
										usedInIssuance: false
									};

									//console.log(data);

									res.send(data);
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
 * Update an existing qualifying badge record
 * @param qualifyingbadgeid, Required. The record identifier of the qualifying badge you want to update.
 * @param badgeid, Required. The record identifier of the badge the qualifying badge is associated with.
 * @param title, Optional. The title of the qualifying badge as it will appear in the badge JSON.
 * @param description, Optional. The description of the qualifying badge as it will appear in the badge JSON.
 * @param domain, Optional. The hosted domain of this qualifying badge as it will appear in the badge JSON.
 * @param issuername, Optional. The issuer name for this qualifying badge as it will appear in the badge JSON.
 * @param issuerurl, Optional. The issuer url for this qualifying badge, as it will appear in the badge JSON.
 * @param startdate, Optional. The date from which this badge is a qualifying badge, in seconds.
 * @param enddate, Optional. The date up to which this badge is a qualifying badge, in seconds.
 * @return JSON of the qualifying badge or a JSON error object
 */
exports.updateBadge = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.qualifyingbadgeid) {
		return res.status(400).send({"error": "You must include the id of the badge you want to update"});
	}
	if (!data.badgeid) {
		return res.status(400).send({"error": "You must include the id of the badge associated with this qualifying badge"});
	}

	//console.log(data);

	res.locals.qualifyingbadgeid = data.qualifyingbadgeid;
	res.locals.badgeid = data.badgeid;

	res.locals.timecreated = "";
	res.locals.title = "";
	res.locals.description = "";
	res.locals.domain = "";
	res.locals.issuername = "";
	res.locals.issuerurl = "";
	res.locals.startdate = 0;
	res.locals.enddate = 0;
	res.locals.enabled = "";
	res.locals.usedInIssuance = true;

	var time = Math.floor((new Date().getTime()) / 1000);

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({"error": "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				db.get().query('SELECT badges.*, users.blockchainaccount FROM badges left join issuers ON badges.issuerid = issuers.id LEFT JOIN users ON issuers.loginuserid = users.id WHERE badges.userid=? AND badges.id=?', [req.user.id, data.badgeid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error fetching badge record"});
					} else {
						if (rows2.length == 0) {
							return res.status(404).send({"error": "No badge record found with the given id for the currently logged in user"});
						} else {

							// Checked not used in an badge of had the rdfstore contract created (issue process underway)
							var query = 'SELECT badge_issued.* FROM badge_issued LEFT JOIN badges ON badges.id = badge_issued.badgeid '
							query += 'WHERE badges.userid=? AND badgeid=? AND badge_issued.status IN ("issued","revoked")';
							db.get().query(query, [req.user.id, data.badgeid], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									return res.status(404).send({"error": "Error checking badge record not used to issue a badge"});
								} else {
									if (rows3.length > 0) {
										return res.status(404).send({"error": "This badge record has been used to issue a badge and therefore can't be edited"});
									} else {
										res.locals.usedInIssuance = false;
										// check qualifying record exist
										console.log("data = " + data.qualifyingbadgeid + " " + data.badgeid);
										db.get().query('SELECT * FROM badge_claimable WHERE userid=? AND id=? AND badgeid=?', [req.user.id, data.qualifyingbadgeid, data.badgeid], function (err4, rows4) {
											if (err4) {
												console.log(err4);
												return res.status(404).send({"error": "Error checking qualifying badge record"});
											} else {
												if (rows4.length == 0) {
													return res.status(404).send({"error": "No qualifying badge record found with the given id for the currently logged in user"});
												} else {

													res.locals.timecreated = rows4[0].timecreated;
													res.locals.enabled = rows4[0].enabled;

													var params = [];

													var setquery = "";
													if (data.title && data.title != "") {
														setquery += "title=?"
														params.push(data.title);
														res.locals.title = data.title
													} else {
														res.locals.title = rows4[0].title;
													}

													if (data.description && data.description != "") {
														if (setquery != "") {
															setquery += ", "
														}
														setquery += "description=?"
														params.push(data.description);
														res.locals.description = data.description;
													} else {
														res.locals.description = rows4[0].description;
													}

													if (data.domain && data.domain != "") {
														if (setquery != "") {
															setquery += ", "
														}
														setquery += "domain=?"
														params.push(data.domain);
														res.locals.domain = data.domain;
													} else {
														res.locals.domain = rows4[0].domain;
													}

													if (data.issuername && data.issuername != "") {
														if (setquery != "") {
															setquery += ", "
														}
														setquery += "issuername=?"
														params.push(data.issuername);
														res.locals.issuername = data.issuername;
													} else {
														res.locals.issuername = rows4[0].issuername;
													}

													if (data.issuerurl && data.issuerurl != "") {
														if (setquery != "") {
															setquery += ", "
														}
														setquery += "issuerurl=?"
														params.push(data.issuerurl);
														res.locals.issuerurl = data.issuerurl;
													} else {
														res.locals.issuerurl = rows4[0].issuerurl;
													}
													//console.log("startdate = " + data.startdate)
													//console.log("enddate = " + data.enddate)
													if (data.startdate != undefined) {
														if (setquery != "") {
															setquery += ", "
														}
														setquery += "startdate=?"
														params.push(data.startdate);
														res.locals.startdate = data.startdate;
													} else {
														res.locals.startdate = rows4[0].startdate;
													}

													if (data.enddate != undefined) {
														if (setquery != "") {
															setquery += ", "
														}
														setquery += "enddate=?"
														params.push(data.enddate);
														res.locals.enddate = data.enddate;
													} else {
														res.locals.enddate = rows4[0].enddate;
													}

													res.locals.setquery = setquery;

													var returndata = {
														id: res.locals.qualifyingbadgeid,
														badgeid: res.locals.badgeid,
														timecreated: res.locals.timecreated,
														title: res.locals.title,
														description: res.locals.description,
														domain: res.locals.domain,
														issuername: res.locals.issuername,
														issuerurl: res.locals.issuerurl,
														startdate: res.locals.startdate,
														enddate: res.locals.enddate,
														enabled: res.locals.enabled,
														usedInIssuance: res.locals.usedInIssuance,
													};

													if (res.locals.setquery != "") {
														var updatequery = "UPDATE badge_claimable";
														updatequery += " SET "+res.locals.setquery;
														updatequery += " WHERE userid=? AND id=? AND badgeid=?";

														//console.log(updatequery);

														params.push(req.user.id);
														params.push(data.qualifyingbadgeid);
														params.push(data.badgeid);

														db.get().query(updatequery, params, function(err5, results4) {
															if (err5) {
																console.log(err5);
																return res.status(404).send({"error": "Error updating qualifying badge record."});
															} else {
																console.log("qualifying badge record updated");
																res.send(returndata);
															}
														});
													} else {
														res.send(returndata);
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
		}
	});
}

/**
 * Delete a qualifying badge record.
 * @param qualifyingbadgeid, Required. The identifier of the qualifying badge record you wish to delete.
 * @return JSON with the id of the deleted qualifying badge and a status of -1 or a JSON error object
 */
exports.deleteBadge = function(req, res, next) {

	var data = matchedData(req);
	if (!data.qualifyingbadgeid) {
		return res.status(400).send({"error": "You must include the id for the qualifying badge you want to delete"});
	}

	res.locals.qualifyingbadgeid = data.qualifyingbadgeid;

	db.get().query('SELECT rolename FROM users LEFT JOIN user_roles ON users.id = user_roles.personid LEFT JOIN roles ON user_roles.roleid = roles.id WHERE users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT * FROM badge_claimable WHERE userid=? AND id=?', [req.user.id, data.qualifyingbadgeid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error fetching qualifying badge record"});
					} else {
						if (rows2.length == 0) {
							return res.status(404).send({"error": "No qualifying badge record found with the given id for the currently logged in user"});
						} else {
							badgeid = rows2[0].badgeid;
							// Checked not used in an badge of had the rdfstore contract created (issue process underway)
							var query = 'SELECT badge_issued.* FROM badge_issued LEFT JOIN badges ON badges.id = badge_issued.badgeid '
							query += 'WHERE badges.userid=? AND badge_issued.badgeid=? AND (badge_issued.status IN ("issued","revoked") OR badges.blockchainaddress IS NOT NULL)';
							db.get().query(query, [req.user.id, badgeid], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									return res.status(404).send({"error": "Error checking badge record not used to issue a badge"});
								} else {
									if (rows3.length > 0) {
										return res.status(404).send({"error": "This badge record has been used to issue a badge and therefore the qualifying badge can't be deleted"});
									} else {
										var updatequery = "DELETE FROM badge_claimable WHERE userid=? AND id=?";
										var params = [req.user.id, data.qualifyingbadgeid];

										db.get().query(updatequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												return res.status(404).send({"error": "Error deleting qualifying badge record."});
											} else {
												console.log("qualifying badge record deleted");
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
 * Get a list of qualifying badge records for the given badge id.
 * @return JSON with an object with key 'badges' pointing to an array of the qualifying badge records for the given badge id or a JSON error object.
 */
exports.listAllBadges = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({"error": "You must include the id for the badge"});
	}

	res.locals.qualifyingbadges = [];

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {

				// Either the owner of the qualifying badge record or the badge or the issuer of a badge can see it's qualifying badge data
				var query = "SELECT badge_claimable.*, badges.id as badgeid FROM badge_claimable ";
				query += "left join badges on badge_claimable.badgeid = badges.id ";
				query += "left join issuers on issuers.id = badges.issuerid ";
				query += "WHERE badge_claimable.badgeid=? AND ((badge_claimable.userid=?) OR (badges.userid=?) OR (issuers.loginuserid=?))";

				db.get().query(query, [data.id, req.user.id, req.user.id, req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving qualifiying badge records"});
					} else {
						if (rows2.length > 0) {

							var i=0;
							function loop() {
								var next = rows2[i];

								res.locals.qualifyingbadges[i] = {};
								res.locals.qualifyingbadges[i].id = next["id"];
								res.locals.qualifyingbadges[i].badgeid = data.id;
								res.locals.qualifyingbadges[i].timecreated = next["created"];
								res.locals.qualifyingbadges[i].title = next["title"];
								res.locals.qualifyingbadges[i].description = next["description"];
								res.locals.qualifyingbadges[i].issuer = next["issuername"];
								res.locals.qualifyingbadges[i].issuerurl = next["issuerurl"];
								res.locals.qualifyingbadges[i].domain = next["domain"];
								res.locals.qualifyingbadges[i].startdate = next["startdate"];
								res.locals.qualifyingbadges[i].enddate = next["enddate"];
								res.locals.qualifyingbadges[i].enabled = next["enabled"];

								var sql = 'SELECT badge_issued.id from badge_issued where badge_issued.badgeid=? AND badge_issued.status in ("issued","revoked")';

								db.get().query(sql, [next["badgeid"]], function (err3, rows3) {
									if (err3) {
										console.log(err3);
										return res.status(404).send("Error checking evidence record not issued");
									} else {
										if (rows3.length > 0) {
											res.locals.qualifyingbadges[i].usedInIssuance = true;
										} else {
											res.locals.qualifyingbadges[i].usedInIssuance = false;
										}
										i++;
										if( i < rows2.length) {
											loop();
										} else {
											res.send({badges: res.locals.qualifyingbadges});
										}
									}
								});
							}
							loop();
						} else {
							res.send({badges: res.locals.qualifyingbadges});
						}
					}
				});
			}
		}
	});
}

/**
 * Enable or disable a qualifying badge as claimable.
 * @param qualifyingbadgeid, Required. The record identifier of the qualifying badge to change the enable state for.
 * @param enabled, Required. true or false as to whether to enable or disable a qualifying badge as claimable.
 * @return JSON with the given properties above, or a JSON error object.
 */
exports.enableUpdate = function(req, res, next) {

	var data = matchedData(req);
	if (!data.qualifyingbadgeid) {
		return res.status(400).send({"error": "You must include the id for the qualifying badge"});
	}
	if (data.enabled == undefined) {
		return res.status(400).send({"error": "You must include the enabled state for the qualifying badge"});
	}

	res.locals.qualifyingbadgeid = data.qualifyingbadgeid;

	db.get().query('SELECT rolename FROM users LEFT JOIN user_roles ON users.id = user_roles.personid LEFT JOIN roles ON user_roles.roleid = roles.id WHERE users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT * FROM badge_claimable WHERE userid=? AND id=?', [req.user.id, data.qualifyingbadgeid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error fetching qualifying badge record"});
					} else {
						if (rows2.length == 0) {
							return res.status(404).send({"error": "No qualifying badge record found with the given id for the currently logged in user"});
						} else {
							badgeid = rows2[0].badgeid;
							var updatequery = "UPDATE badge_claimable SET enabled = ? WHERE userid = ? AND id = ?";
							db.get().query(updatequery, [data.enabled, req.user.id, data.qualifyingbadgeid], function(err3, results3) {
								if (err3) {
									console.log(err4);
									return res.status(404).send({"error": "Error updating enabled status of the qualifying badge record."});
								} else {
									console.log("qualifying badge record updated");
									res.send(data);
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
 * Check if the data given matches a qualifying badge.
 * @param title, Required. The title of the qualifying badge to check against.
 * @param description, Required. The description of the qualifying badge to check against.
 * @param issuedon, Required. The date the qualifying date was issued.
 * @param issuername, Required. The issuer name for the qualifying badge to check again.
 * @param issuerurl, Required. The issuer url for the qualifying badge to check against.
 * @param badgeurl, Required. The url for the hosted qualifying badge data.
 * @return JSON with the property 'qualifies' set to true or false as well as additional properties of the fetched badge data
 */
exports.qualifyingCheck = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.title) {
		return res.status(400).send({"error": "You must include badge title to check for qualification"});
	}
	if (!data.description) {
		return res.status(400).send({"error": "You must include badge description to check for qualification"});
	}
	if (!data.issuedon) {
		return res.status(400).send({"error": "You must include the date the qualifying badge was issued"});
	}
	if (!data.issuername) {
		return res.status(400).send({"error": "You must include the badge issuers name to check for qualification"});
	}
	if (!data.issuerurl) {
		return res.status(400).send({"error": "You must include the badge issuers url to check for qualification"});
	}
	if (!data.badgeurl) {
		return res.status(400).send({"error": "You must include the assertion url for the qualifying badge"});
	}

	// convert to match properties as saved to database
	data.title = utilities.demicrosoftize(data.title);
	data.description = utilities.demicrosoftize(data.description);
	data.issuername = utilities.demicrosoftize(data.issuername);

	//console.log(data.title);
	//console.log(data.description);
	//console.log(data.issuername);
	//console.log(data.issuerurl);

	var query = 'SELECT * FROM badge_claimable WHERE title=? AND description=? AND issuername=? AND issuerurl=? AND enabled=1';
	db.get().query(query, [data.title, data.description, data.issuername, data.issuerurl], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({"error": "Error checking badge for qualification for a claim"});
		} else {
			if (rows.length == 0) {
				var reply = {};
				reply.qualifies = false;
				reply.message = "The submitted badge details do not match any currently active qualifying badge record";
				res.send(reply);
			} else {
				var domain = rows[0].domain;
				//console.log(data.issuedon);
				//console.log(rows[0].startdate);
				//console.log(rows[0].enddate);
				if (!data.badgeurl.includes(domain)) {
					var reply = {};
					reply.qualifies = false;
					reply.message = "Badge assertion url does not match the domain required for the qualifying badge record";
					res.send(reply);
				} else if (rows[0].startdate > 0 && data.issuedon < rows[0].startdate){
					var reply = {};
					reply.qualifies = false;
					reply.message = "Badge issued date invalid for qualifying badge record";
					res.send(reply);
				} else if (rows[0].enddate > 0 && data.issuedon > (rows[0].enddate + (24 * 60 * 60 * 1000 -1))){
					var reply = {};
					reply.qualifies = false;
					reply.message = "Badge issued date invalid for qualifying badge record";
					res.send(reply);
				} else {
					var query = 'SELECT b.title, b.description, b.imageurl, i.name, i.url, i.imageurl AS issuerimage FROM badges AS b, issuers AS i WHERE b.id=? AND b.issuerid = i.id';
					db.get().query(query, [rows[0].badgeid], function (err2, rows2) {
						if (err) {
							console.log(err);
							res.status(404).send({"error": "Error checking badge for qualification for a claim"});
						} else {
							if (rows2.length == 0) {
								var reply = {};
								reply.qualifies = false;
								reply.message = "Database error - no matching badge relating to this qualifying badge record";
								res.send(reply);
							} else {
								var reply = {};
								reply.id = rows[0].badgeid;
								reply.title = rows2[0].title;
								reply.description = rows2[0].description;
								reply.image = rows2[0].imageurl;
								reply.issuername = rows2[0].name;
								reply.issuerurl = rows2[0].url;
								reply.issuerimageurl = rows2[0].issuerimage;
								reply.qualifies = true;
								res.send(reply);
							}
						}
					});
				}
			}
		}
	});
}

/**
 * Check to see if the recipient record and user record exist for the currently logged in user, matching the identity details passed
 * and that the recipient has been issued the badge with the passed id.
 * @param identity, Required. The identity property being checked.
 * @param salt, Required. The encryption salt for encrypting the identity being checked.
 * @param type, Required. The type of identity verification being checked.
 * @param badgeid, Required. The record identifier of the badge claimed.
 * @return JSON with the properties: 'signedon', 'identityok', 'accountexists', 'recipientexists' and 'badgeissued' or a JSON error object.
 */
exports.checkUserMatch = function(req, res, next) {
	var data = matchedData(req);

	if (!data.salt) {
		return res.status(400).send({"error": "You must include the encryption salt"});
	} else if (!data.type) {
		return res.status(400).send({"error": "You must include the type of verification"});
	} else if (!data.identity) {
		return res.status(400).send({"error": "You must include the identity string being checked"});
	} else if (!data.badgeid) {
		return res.status(400).send({"error": "You must include the id of the badge being claimed"});
	}

	var emaillower = req.user.email.toLowerCase();
	let identityok = utilities.validateEncodedEmail(req.user.email, data.identity, data.salt);

	var reply = {};
	reply.signedon = true;
	reply.identityok = identityok;
	reply.accountexists = true;
	reply.recipientexists = false;
	reply.badgeissued = false;

	db.get().query('SELECT * FROM recipients WHERE userid=? AND loginuserid=userid AND LOWER(email=?)', [req.user.id, emaillower], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error:"Error fetching recipient record"});
		} else {
			if (rows.length > 0) {
				reply.recipientexists = true;
				db.get().query('SELECT * FROM badge_issued WHERE recipientid=? AND badgeid=? AND status<>"pending"', [rows[0].id, data.badgeid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error:"Error fetching badge issued record"});
					} else {
						if (rows2.length > 0) {
							reply.badgeissued = true;
						}
						res.send(reply);
					}
				});
			} else {
				res.send(reply);
			}
		}
	});
}

/**
 * Check to see if the given identity for the badge being claimed matches the given email address.
 * @param identity, Required. The identity property being checked.
 * @param salt, Required. The encryption salt for encrypting the identity being checked.
 * @param type, Required. The type of identity verification being checked.
 * @param badgeid, Required. The record identifier of the badge claimed.
 * @param badgeid, Required. The email address to check against.
 * @return JSON with the properties: 'signedon', 'identityok', 'accountexists', 'recipientexists' and 'badgeissued' or a JSON error object.
 */
exports.checkUserEmailMatch = function(req, res, next) {
	var data = matchedData(req);
	if (!data.salt) {
		return res.status(400).send({"error": "You must include the encryption salt"});
	} else if (!data.type) {
		return res.status(400).send({"error": "You must include the type of verification"});
	} else if (!data.identity) {
		return res.status(400).send({"error": "You must include the identity string being checked"});
	} else if (!data.email) {
		return res.status(400).send({"error": "You must include the email address being checked"});
	} else if (!data.badgeid) {
		return res.status(400).send({"error": "You must include the id of the badge being claimed"});
	}

	let identityok = utilities.validateEncodedEmail(data.email, data.identity, data.salt);

	var reply = {};
	if (req.user != undefined) {
		reply.signedon = true;
	} else {
		reply.signedon = false;
	}
	reply.identityok = identityok;
	reply.accountexists = false;
	reply.badgeissued = false;
	reply.recipientexists = false;

	if (identityok == true) {

		var emout = data.email.toLowerCase();

		db.get().query('SELECT * FROM users WHERE LOWER(email)=?', [emout], function (err, rows) {
			if (err) {
				console.log(err);
				return res.status(404).send({error:"Error fetching user record"});
			} else {
				if (rows.length > 0) {
					reply.accountexists = true;
					//console.log(rows[0].id);
					db.get().query('SELECT * FROM recipients WHERE userid=? AND loginuserid=userid AND LOWER(email)=?', [rows[0].id, emout], function (err2, rows2) {
						if (err2) {
							console.log(err2);
							return res.status(404).send({error:"Error fetching recipient record"});
						} else {
							if (rows2.length > 0) {
								reply.recipientexists = true;
								db.get().query('SELECT * FROM badge_issued WHERE recipientid=? AND badgeid=? AND status<>"pending"', [rows2[0].id, data.badgeid], function (err3, rows3) {
									if (err3) {
										console.log(err3);
										return res.status(404).send({error:"Error fetching badge issued record"});
									} else {
										if (rows3.length > 0) {
											reply.badgeissued = true;
										}
										res.send(reply);
									}
								});
							} else {
								res.send(reply);
							}
						}
					});
				} else {
					res.send(reply);
				}
			}
		});
	} else {
		res.send(reply);
	}
}

/**
 * Create a Recipient record and user record, if it does not exist for the badge claimant.
 * @param username, Required. The name to use for the Recipient record and login account.
 * @param email, Required. An email address to use for the Recipient record and login account.
 * @return JSON with the record identifier for the new Recipient user account record, or a JSON error object.
 */
exports.createAccount = function(req, res, next) {
	var data = matchedData(req);
	if (!data.username) {
		return res.status(400).send({"error": "You must include the username that will be used for the new account"});
	} else if (!data.email) {
		return res.status(400).send({"error": "You must include the email address being checked"});
	}

	res.locals.timecreated = null;
	res.locals.fullname = data.username;
	res.locals.email = data.email;
	res.locals.role = 3;

	res.locals.encodedemail = utilities.encodeEmail(res.locals.email, cfg.badgesalt);

	var emaillowercase = data.email.toLowerCase();

	// check first suitable account doesn't already exist
	db.get().query('SELECT * FROM recipients AS r, users AS u WHERE r.loginuserid = r.userid AND u.id = r.userid AND LOWER(r.email) = ? AND LOWER(u.email) = ?', [emaillowercase, emaillowercase], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error:"Error fetching user recipient record"});
		} else {
			if (rows.length > 0) {
				return res.status(400).send({"error": "A suitable user account already exists for your email address"});
			} else {
				db.get().query('SELECT * FROM users WHERE LOWER(email) = ?', [emaillowercase], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error:"Error fetching user record"});
					} else {
						if (rows2.length > 0) {
							// just create recipient record
							res.locals.userid= rows2[0].id;
							res.locals.timecreated = Math.floor((new Date().getTime()) / 1000);

							// need to check user role exists and if not add it
							db.get().query('SELECT * FROM user_roles WHERE personid = ? AND roleid = ?', [emaillowercase, res.locals.role], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									return res.status(404).send({error:"Error fetching user role record"});
								} else {
									if (rows3.length == 0) {
										// create user role record
										var insertqueryroles = 'INSERT INTO user_roles (userid, timecreated, personid, roleid) VALUE (?,?,?,?)';
										var paramsroles = [res.locals.userid, res.locals.timecreated, res.locals.userid, res.locals.role];
										db.get().query(insertqueryroles, paramsroles, function(err4, results4) {
											if (err4) {
												console.log(err4);
												res.status(404).send({error: "Error creating user account role entry."});
											} else {
												let handler = function(err, recipientid) {
													if (err && err.message && err.message != "") {
														res.status(404).send({error: err.message});
													} else if (recipientid) {
														console.log("Recipient record created");
														var reply = {}
														reply.recipientid = recipientid;
														res.send(reply);
													} else {
														res.status(404).send({error: "Unknown error creating recipient"});
													}
												}
												createRecipient(res.locals.userid, res.locals.email, res.locals.fullname, res.locals.encodedemail, res.locals.timecreated, handler)
											}
										});

									} else {
										// create recipient entry
										let handler = function(err, recipientid) {
											if (err && err.message && err.message != "") {
												res.status(404).send({error: err.message});
											} else if (recipientid) {
												console.log("Recipient record created");
												var reply = {}
												reply.recipientid = recipientid;
												res.send(reply);
											} else {
												res.status(404).send({error: "Unknown error creating recipient"});
											}
										}
										createRecipient(res.locals.userid, res.locals.email, res.locals.fullname, res.locals.encodedemail, res.locals.timecreated, handler)
									}
								}
							});
						} else {
							// create user account, user_role and recipient record

							res.locals.timecreated = Math.floor((new Date().getTime()) / 1000);
							res.locals.password = utilities.createKey(12);
							var bcrypt = require('bcrypt');
							res.locals.hashed_password = bcrypt.hashSync(res.locals.password, 10);
							var registrationkey = utilities.createKey(20);

							var insertquery = 'INSERT INTO users (fullname, email, hash_password, created, registrationkey) VALUE (?,?,?,?,?)';
							var params = [res.locals.fullname, res.locals.email, res.locals.hashed_password, res.locals.timecreated, registrationkey];
							db.get().query(insertquery, params, function(err3, results3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error creating user account entry."});
								} else {
									console.log("recipient user account saved");
									res.locals.userid = results3.insertId;
									// give that the user the recipient role.
									var insertqueryroles = 'INSERT INTO user_roles (userid, timecreated, personid, roleid) VALUE (?,?,?,?)';
									var paramsroles = [res.locals.userid, res.locals.timecreated, res.locals.userid, res.locals.role];
									db.get().query(insertqueryroles, paramsroles, function(err4, results4) {
										if (err4) {
											console.log(err4);
											res.status(404).send({error: "Error creating user account role entry."});
										} else {
											console.log("recipient user account role saved");

											// email user
											const transporter = nodemailer.createTransport({sendmail: true});

											var message = cfg.emailheader;
											message += '<p>' + cfg.model_qualifying_registrationEmailStart + ' ' + res.locals.fullname + ',</p>';
											message += '<h3>' + cfg.model_qualifying_registrationEmailLine1 + '</h3>';
											message += '<p>' + cfg.model_qualifying_registrationEmailLine2+'</p>';
											message += '<p><b>' + cfg.model_qualifying_registrationEmailLine3A + ' <a href="' + cfg.protocol + '://' + cfg.domain + cfg.proxy_path + '/qualifying/completeregistration/?id=' + res.locals.userid + '&key=' + registrationkey + '">' + cfg.model_qualifying_registrationEmailLine3B + '</a></b> ' + cfg.model_qualifying_registrationEmailLine3C + '</p>';
											message += '<p>' + cfg.model_qualifying_registrationEmailLine4 + ' <b>' + res.locals.password + '</b><br>';
											message += '<br>' + cfg.model_qualifying_registrationEmailLine5 + '<br>';
											message += '<br>' + cfg.model_qualifying_registrationEmailLine6 + '</p><br>';
											message += cfg.emailfooter;

											var mailOptions = {
												from: cfg.fromemailaddress,
												to: res.locals.email,
												subject: cfg.model_qualifying_registrationEmailSubject,
												html: message,
											}

											transporter.sendMail(mailOptions, (error, info) => {
												if (error) {
													return console.log(error);
													res.status(404).send({"error": "Failed to send email to recipient"});
												} else {
													console.log('Recipient Email Message sent: ', info.messageId);

													let handler = function(err, recipientid) {
														if (err && err.message && err.message != "") {
															res.status(404).send({error: err.message});
														} else if (recipientid) {
															console.log("Recipient record created");
															var reply = {}
															reply.recipientid = recipientid;
															//console.log(reply);
															res.send(reply);
														} else {
															res.status(404).send({error: "Unknown error creating recipient"});
														}
													}

													createRecipient(res.locals.userid, res.locals.email, res.locals.fullname, res.locals.encodedemail, res.locals.timecreated, handler)
												}
											});
										}
									});
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
 * Call from a link in the registration email to complete Recipient account creation.
 * @param id, Required. The record identifier of the Recipient record to complete registration for.
 * @param key, Optional. The registration unique key to authorise this account registration completion.
 * @return HTML of the change password page or error page with error message.
 */
exports.completeRegistration = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id || !data.key) {
		res.render('error', {message: "Expected id and key properties not present"});
	}

	db.get().query('SELECT * FROM users WHERE id=? AND registrationkey=? AND status=0', [data.id, data.key], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', {message: "Error fetching user data from the database"});
		} else {
			if (rows.length == 0) {
				res.render('error', {message: "The given id and key do not match data in our records or this account has already completed the registration process"});
			} else {
				// name of recipient
				var recipientname = rows[0].fullname;

				db.get().query('UPDATE users SET validationkey=?, status=1 WHERE id=? AND registrationkey=?', [data.key, data.id, data.key], function (err2, reply2) {
					if (err2) {
						console.log(err2);
						res.render('error', {message: "Error fetching user data"});
					} else {
						// Redirect Recipient to Change password page.
						var theurl = cfg.protocol+"://"+cfg.domain+cfg.proxy_path+"/users/changepasswordpage";
						res.render('registrationcomplete', {layout: 'registrationcomplete.hbs', from: 'recipients', url: theurl});
					}
				});
			}
		}
	});
}

/**
 * Create a Recipient record.
 */
function createRecipient (userid, email, fullname, encodedemail, timecreated, handler) {

	var accounthandler = function(err, replyaccountdata) {
		if(err){
		   console.log(err);
		   handler(new Error("Error creating blockchain account."));
		} else {
			// create the recipient database entry.
			var insertqueryrecipient = 'INSERT INTO recipients (userid, loginuserid, timecreated, name, email, encodedemail, blockchainaccount, blockchainaccountpassword, blockchainaccountseed) VALUE (?,?,?,?,?,?,?,?,?)';
			var paramsrecipient = [userid, userid, timecreated, fullname, email, encodedemail, replyaccountdata.account, replyaccountdata.accountpassword, replyaccountdata.secretphrase];
			db.get().query(insertqueryrecipient, paramsrecipient, function(err, results) {
				if (err) {
					console.log(err);
					handler(new Error("Error creating recipient entry."));
				} else {
					console.log("recipient entry saved");
					let recipientid = results.insertId;
					handler(null, recipientid);
				}
			});
		}
	};

	var accountdata = {};
	accountdata.accountpassword = web3.utils.sha3("The Institute of Coding" + email);
	accountdata.accountname = "Recipient: " + fullname;
	//console.log(localdata);

	utilities.createAccount(accountdata, accounthandler);
}

/**
 * Load data from a remote url of a qualifying badge.
 * @param remoteurl you must include the url of the remote data to load.
 * @return the remote data or a JSON error object.
 */
exports.loadRemoteData = function(req, res, next) {
	var data = matchedData(req);
	if (!data.remoteurl) {
		return res.status(400).send({"error": "You must include the remote URL for the badge data to be loaded"});
	}

	console.log(data.remoteurl);

	res.locals.remoteurl = data.remoteurl;
	res.locals.remotedata = {};

	db.get().query('Select DISTINCT domain FROM badge_claimable', [], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error checking qualifying badge domains"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "No qualifying badge record found"});
			} else {
				let proceed = false;
				let count = rows.length;
				for (let i=0; i<count; i++) {
					var domain = rows[i].domain;
					if (res.locals.remoteurl.includes(domain)) {
						proceed = true;
						break;
					}
				}
				if (proceed) {
					let loadHandler = function(err, response) {
						if (err) {
							console.log(err);
							res.send(res.locals.remotedata);
						} else {
							res.locals.remotedata = JSON.parse(response.body);
							//res.status(404).send({error: "There was an error retrieving the data from the url"});
							res.send(res.locals.remotedata);
						}
					}
					utilities.loadUrl(res.locals.remoteurl, loadHandler);
				} else {
					res.status(404).send({error: "The given URL is not an approved domain."});
				}
			}
		}
	});
}
