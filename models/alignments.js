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

var db = require('../db.js')
var cfg = require('../config.js');
var utilities = require('../models/utilities.js')

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const { matchedData } = require('express-validator/filter');


/**
 * Get the alignment mangement page
 *
 * @return the page to manage alignments
 */
exports.getAlignmentManagementPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				res.render('managealignments', { title: 'Manage Alignments'});
			}
		}
	});
}

exports.createAlignment = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	/*
	check('url').isURL({require_tld: false}).withMessage('You must include a valid url for the new alignment item'),
	check('name').withMessage('You must include a name for the new alignment item'),
	check('description').withMessage('You must include a description for the new alignment item'),

	check('code').optional(),
	check('framework').optional()
	*/

	// should never need this as the check is done in the routes
	if (!data.url || !data.name || !data.description) {
		return res.status(400).send({error: "You must include a url and the name and description for the alignment you re adding"});
	}

	res.locals.id = "";

	res.locals.url = data.url;
	res.locals.name = data.name;
	res.locals.description = data.description;

	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;
	res.locals.uniqueid = web3.utils.sha3("alignment_" + time);

	res.locals.code = "";
	if (data.code) {
		res.locals.code = data.code
	}
	res.locals.framework = "";
	if (data.framework) {
		res.locals.framework = data.framework
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("admin", "super", "issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				var insertquery = 'INSERT INTO alignments (userid, timecreated, uniqueid, targetid, targetname, targetdescription, targetcode, targetframework) VALUE (?,?,?,?,?,?,?,?)';
				var params = [req.user.id, res.locals.timecreated, res.locals.uniqueid, res.locals.url, res.locals.name, res.locals.description, res.locals.code, res.locals.framework];
				db.get().query(insertquery, params, function(err3, result3) {
					if (err3) {
						console.log(err3);
						res.status(404).send({error: "Error saving alignment data"});
					} else {
						console.log("alignment saved");
						res.locals.id = result3.insertId;

						var reply = {
							 id: res.locals.id,
							 timecreated: res.locals.timecreated,
							 url: res.locals.url,
							 name: res.locals.name,
							 description: res.locals.description,
							 code: res.locals.code,
							 framework: res.locals.framework,
							 usedInIssuance: false
						};

						//console.log(reply);
						res.send(reply);
					}
				});
			}
		}
	});
}

exports.updateAlignment = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({error: "You must include the id of the alignment you want to update"});
	}

	res.locals.id = data.id;
	res.locals.timecreated = "";
	res.locals.uniqueid = "";

	res.locals.url = "";
	if (data.url && data.url != "") {
		res.locals.url = data.url;
	}

	res.locals.name = "";
	if (data.name && data.name != "") {
		res.locals.name = data.name;
	}

	res.locals.description = "";
	if (data.description && data.description != "") {
		res.locals.description = data.description;
	}

	res.locals.code = "";
	if (data.code && data.code != "") {
		res.locals.code = data.code;
	}

	res.locals.framework = "";
	if (data.framework && data.framework != "") {
		res.locals.framework = data.framework;
	}

	res.locals.usedInIssuance = true;

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin","issuer") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error:"Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({error: "The logged in user account does not have the correct permissions to create a badge."});
			} else {
				db.get().query('SELECT alignments.* from alignments where alignments.userid=? and alignments.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error fetching alignment record"});
					} else {
						if (rows2.length == 0) {
							return res.status(404).send({error: "No alignment record found with the given id for the currently logged in user"});
						} else {
							res.locals.timecreated = rows2[0].timecreated;

							// Checked not used in an issued badge
							var sql = 'SELECT * from badge_issued left join badge_alignments on badge_issued.badgeid = badge_alignments.badgeid where badge_alignments.userid=? and badge_alignments.alignmentid=? and badge_issued.status in ("issued","revoked")';
							db.get().query(sql, [req.user.id, res.locals.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									return res.status(404).send({error: "Error checking alignment record not used to issue a badge"});
								} else {
									if (rows3.length > 0) {
										return res.status(404).send({error: "This alignment record has been used to issue a badge and therefore can not be edited"});
									} else {
										res.locals.timecreated = rows2[0].timecreated;
										res.locals.usedInIssuance = false;
										res.locals.uniqueid = rows2[0].uniqueid;

										var updatequery = "UPDATE alignments";
										var params = [];

										var setquery = "";

										// can't be empty
										if (res.locals.url != "") {
											setquery += "targetid=?"
											params.push(res.locals.url);
										} else {
											res.locals.url = rows2[0].targetid;
										}

										// can't be empty
										if (res.locals.name != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "targetname=?"
											params.push(res.locals.name);
										} else {
											res.locals.name = rows2[0].targetname;
										}

										// can't be empty
										if (res.locals.description != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "targetdescription=?"
											params.push(res.locals.description);
										} else {
											res.locals.description = rows2[0].targetdescription;
										}

										if (res.locals.code != "" || res.locals.code != rows2[0].targetcode) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "targetcode=?"
											params.push(res.locals.code);
										} else {
											res.locals.code = rows2[0].targetcode;
										}

										if (res.locals.framework != "" || res.locals.framework != rows2[0].targetframework) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "targetframework=?"
											params.push(res.locals.framework);
										} else {
											res.locals.framework = rows2[0].targetframework;
										}

										if (setquery != "") {
											updatequery += " SET "+setquery;
											updatequery += " WHERE userid=? AND id=?";

											//console.log(updatequery);

											params.push(req.user.id);
											params.push(res.locals.id);

											db.get().query(updatequery, params, function(err4, results4) {
												if (err4) {
													console.log(err4);
													return res.status(404).send({error: "Error updating alignment record."});
												} else {
													console.log("alignment record updated");
													var reply = {
														 id: res.locals.id,
														 timecreated: res.locals.timecreated,
														 uniqueid: res.locals.uniqueid,
														 url: res.locals.url,
														 name: res.locals.name,
														 description: res.locals.description,
														 code: res.locals.code,
														 framework: res.locals.framework,
														 usedInIssuance: res.locals.issued
													};
													//console.log(reply);
													res.send(reply);
												}
											});
										} else {
											var reply = {
												 id: res.locals.id,
												 timecreated: res.locals.timecreated,
												 uniqueid: res.locals.uniqueid,
												 url: res.locals.url,
												 name: res.locals.name,
												 description: res.locals.description,
												 code: res.locals.code,
												 framework: res.locals.framework,
												 usedInIssuance: res.locals.issued
											};
											//console.log(reply);
											res.send(reply);
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

exports.deleteAlignment = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send({error: "You must include id for the alignment you want to delete"});
	}

	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin", "issuers")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT alignments.* FROM alignments WHERE alignments.userid=? and alignments.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error fetching alignment record"});
					} else {
						if (rows2.length == 0) {
							return res.status(404).send({error: "No alignment record found with the given id for the currently logged in user"});
						} else {
							// Checked not used in an issued badge
							db.get().query('SELECT * from badge_issued left join badge_alignments on badge_issued.badgeid = badge_alignments.badgeid where badge_alignments.userid=? and badge_alignments.badgeid=? and badge_issued.status in ("issued","revoked")', [req.user.id, res.locals.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									return res.status(404).send({error: "Error checking alignment record not used in an issued badge"});
								} else {
									if (rows3.length > 0) {
										return res.status(404).send({error: "This badge record has been used in an issued badge and therefore can't be deleted"});
									} else {
										var updatequery = "DELETE from alignments WHERE userid=? AND id=?";
										var params = [req.user.id, res.locals.id];

										db.get().query(updatequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												return res.status(404).send({error: "Error deleting alignment record."});
											} else {
												console.log("alignment record deleted");

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

exports.listAlignments = function(req, res, next) {

	res.locals.alignments = [];

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				// get if used? - count records in issued table as usecount?
				db.get().query('SELECT alignments.* FROM alignments WHERE alignments.userid=?', [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error retrieving alignment records"});
					} else {
						if (rows2.length > 0) {
							var i=0;
							function loop() {
								var next = rows2[i];

								res.locals.alignments[i] = {};
								res.locals.alignments[i].id = next["id"];
								res.locals.alignments[i].timecreated = next["timecreated"];
								res.locals.alignments[i].uniqueid = next["uniqueid"];
								res.locals.alignments[i].url = next["targetid"];
								res.locals.alignments[i].name = next["targetname"];
								res.locals.alignments[i].description = next["targetdescription"];
								res.locals.alignments[i].code = next["targetcode"];
								res.locals.alignments[i].framework = next["targetframework"];

								var sql = 'SELECT badge_issued.badgeid from badge_issued left join badge_alignments on badge_issued.badgeid = badge_alignments.badgeid where badge_alignments.userid=? and badge_alignments.alignmentid=? and badge_issued.status in ("issued","revoked")';
								db.get().query(sql, [req.user.id, next["id"]], function (err3, rows3) {
									if (err3) {
										console.log(err3);
										return res.status(404).send({error: "Error checking alignment record not used to issue a badge"});
									} else {
										if (rows3.length > 0) {
											res.locals.alignments[i].usedInIssuance = true;
										} else {
											res.locals.alignments[i].usedInIssuance = false;
										}
										i++;
										if( i < rows2.length) {
											loop();
										} else {
											res.send({alignments: res.locals.alignments});
										}
									}
								});
							}
							loop();
						} else {
							res.send({alignments: res.locals.alignments});
						}
					}
				});
			}
		}
	});
}

exports.getAlignmentById = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({error: "You must include id for the alignment you want to get the data for"});
	}

	res.locals.id = data.id

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("admin", "super", "issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT alignments.* FROM alignments WHERE alignments.userid=? and alignments.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error retrieving alignment record"});
					} else {
						if (rows2.length > 0) {
							var next = rows2[0];

							var alignment = {};

							var sql = 'SELECT * from badge_issued left join badge_alignments on badge_issued.badgeid = badge_alignments.badgeid where badge_alignments.userid=? and badge_alignments.alignmentid=? and badge_issued.status in ("issued","revoked")';
							db.get().query(sql, [req.user.id, res.locals.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									return res.status(404).send({error: "Error checking alignment record not used to issue a badge"});
								} else {

									alignment.id = next["id"];
									alignment.timecreated = next["timecreated"];
									alignment.uniqueid = next["uniqueid"];
									alignment.url = next["targetid"];
									alignment.name = next["targetname"];
									alignment.description = next["targetdescription"];
									alignment.code = next["targetcode"];
									alignment.framework = next["targetframework"];

									if (rows3.length > 0) {
										alignment.usedInIssuance = true;
									} else {
										alignment.usedInIssuance = false;
									}

									res.send(alignment);
								}
							});
						} else {
							return res.status(404).send({error: "No alignment records found with the given id for the currently logged in user"});
						}
					}
				});
			}
		}
	});
}