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

var db = require('../db.js')
var cfg = require('../config.js');
var utilities = require('../utilities.js')

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const { matchedData } = require('express-validator/filter');

exports.getEvidencePage = function(req, res, next) {

	var data = matchedData(req);
	if (!data.badgeissuedid) {
		res.render('error', { message: "You must include the pending issuance id for the evidence you wish to manage"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				res.render('manageevidence', { protocol: cfg.protocol, domain: cfg.domain, title: "Manage Evidence", badgeissuedid: data.badgeissuedid});
			}
		}
	});
}

exports.createEvidence = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);
/*
	check('badgeid').withMessage('You must include the pending badge id for the badge you want to add evidence to'),
	check('url').withMessage('You must include the url to the evidence item you are adding to the badge'),
	check('name').withMessage('You must include a name for the evidence itemyou want to add to a badge'),

	check('description').optional(),
	check('narrative').optional(),
	check('genre').optional(),
	check('audience').optional(),
*/

	// should never need this as the check is done in the routes
	if (!data.badgeissuedid || !data.url || !data.name) {
		return res.status(400).send("You must include a url, a name and the pending issuance id for the evidence you wish to add");
	}

	req.flagCheck = null;
	res.locals.errormsg = "";

	res.locals.badgeissuedid = data.badgeissuedid;

	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;

	res.locals.url = data.url;
	res.locals.name = data.name;

	res.locals.description = "";
	if (data.description) {
		res.locals.description = data.description
	}
	res.locals.narrative = "";
	if (data.narrative) {
		res.locals.narrative = data.narrative
	}
	res.locals.genre = "";
	if (data.genre) {
		res.locals.genre = data.genre
	}
	res.locals.audience = "";
	if (data.audience) {
		res.locals.audience = data.audience
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send("Error fetching user permissions");
		} else {
			if (rows.length == 0) {
				return res.status(404).send("The logged in user account does not have the correct permissions to perform this action.");
			} else {
				// check badgeid exists in our database.
				var selectquery = 'SELECT * from badge_issued where id=? AND userid=?';
				var params = [res.locals.badgeissuedid, req.user.id];
				db.get().query(selectquery, params, function(err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error checking badge id";
					} else {
						if (rows2.length == 0) {
							return res.status(404).send("The given badgeid issuance id does not exist or does not exists in conjunction with the logged in user.");
						} else {
							var insertquery = 'INSERT INTO evidence (userid, timecreated, url, name, description, narrative, genre, audience) VALUE (?,?,?,?,?,?,?,?)';
							var params = [req.user.id, res.locals.timecreated, res.locals.url, res.locals.name, res.locals.description, res.locals.narrative, res.locals.genre, res.locals.audience];
							db.get().query(insertquery, params, function(err3, result3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error saving evidence data";
								} else {
									console.log("evidence saved");
									res.locals.id = result3.insertId;
									if (res.locals.criterianarrative != "") {
										var insertquery = 'INSERT INTO badge_evidence (userid, timecreated, evidenceid, badgeissuedid) VALUE (?,?,?,?)';
										var params = [req.user.id, res.locals.timecreated, res.locals.id, res.locals.badgeissuedid];
										db.get().query(insertquery, params, function(err4, result4) {
											if (err4) {
												console.log(err4);
												res.locals.errormsg = "Error saving badge_evidence data";
											} else {
												console.log("badge_evidence saved");
												//res.locals.pendingevidenceid = result4.insertId;
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
				 url: res.locals.url,
				 name: res.locals.name,
				 description: res.locals.description,
				 narrative: res.locals.narrative,
				 genre: res.locals.genre,
				 audience: res.locals.audience,
				 badgeissuedid: res.locals.badgeissuedid,
				 issued: false
			};

			//console.log(data);

			res.send(data);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

exports.updateEvidence = function(req, res, next) {

	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send("You must include the id of the evidence item you want to update");
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

	res.locals.id = data.id;
	res.locals.timecreated = "";
	res.locals.badgeissuedid = "";

	res.locals.url = "";
	res.locals.name = "";
	res.locals.description = "";
	res.locals.narrative = "";
	res.locals.genre = "";
	res.locals.audience = "";
	res.locals.issued = true;

	//var time = Math.floor((new Date().getTime()) / 1000);

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("issuer") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send("Error fetching user permissions");
		} else {
			if (rows.length == 0) {
				return res.status(404).send("The logged in user account does not have the correct permissions to perform this action.");
			} else {
				// get record if not used in an issued badge
				var query = 'SELECT evidence.*, badge_evidence.badgeissuedid as badgeissuedid from badge_issued '
				query += 'left join badge_evidence on badge_evidence.badgeissuedid = badge_issued.id ';
				query += 'left join evidence on evidence.id = badge_evidence.evidenceid ';
				query += 'where evidence.userid=? and badge_issued.userid=? and evidence.id=? and badge_issued.status in ("pending","revoked")';
				db.get().query(query, [req.user.id, req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send("Error fetching evidence record");
					} else {
						if (rows2.length == 0) {
							return res.status(404).send("No evidence record found with the given id for the currently logged in user for a pending badge");
						} else {
							res.locals.timecreated = rows2[0].timecreated;
							res.locals.badgeissuedid = rows2[0].badgeissuedid;
							res.locals.issued = false;

							//res.locals.issued = false;

							var updatequery = "UPDATE evidence";
							var params = [];

							var setquery = "";

							// name and url are compulsory so can't be emptied out with an edit.

							if (data.url && data.url != "") {
								setquery += "url=?"
								params.push(data.url);
								res.locals.url = data.url
							} else {
								res.locals.url = rows2[0].url;
							}

							if (data.name && data.name != "") {
								if (setquery != "") {
									setquery += ", "
								}
								setquery += "name=?"
								params.push(data.name);
								res.locals.name = data.name;
							} else {
								res.locals.name = rows2[0].name;
							}

							if (data.description) {
								if (setquery != "") {
									setquery += ", "
								}
								setquery += "description=?"
								params.push(data.description);
								res.locals.description = data.description;
							} else {
								res.locals.description = rows2[0].description;
							}

							if (data.narrative) {
								if (setquery != "") {
									setquery += ", "
								}
								setquery += "narrative=?"
								params.push(data.narrative);
								res.locals.narrative = data.narrative;
							} else {
								res.locals.narrative = rows2[0].narrative;
							}

							if (data.genre) {
								if (setquery != "") {
									setquery += ", "
								}
								setquery += "genre=?"
								params.push(data.genre);
								res.locals.genre = data.genre;
							} else {
								res.locals.genre = rows2[0].genre;
							}

							if (data.audience) {
								if (setquery != "") {
									setquery += ", "
								}
								setquery += "audience=?"
								params.push(data.audience);
								res.locals.audience = data.audience;
							} else {
								res.locals.audience = rows2[0].audience;
							}

							if (setquery != "") {
								updatequery += " SET "+setquery;
								updatequery += " WHERE userid=? AND id=?";

								console.log(updatequery);

								params.push(req.user.id);
								params.push(data.id);

								db.get().query(updatequery, params, function(err4, results4) {
									if (err4) {
										console.log(err4);
										res.locals.errormsg = "Error updating evidence record.";
									} else {
										console.log("evidence record updated");
										res.locals.finished = true;
									}
								});
							} else {
								res.locals.finished = true;
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
				 url: res.locals.url,
				 name: res.locals.name,
				 description: res.locals.description,
				 narrative: res.locals.narrative,
				 genre: res.locals.genre,
				 audience: res.locals.audience,
				 badgeissuedid: res.locals.badgeissuedid,
				 issued: res.locals.issued
			};

			//console.log(data);

			res.send(data);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

exports.deleteEvidence = function(req, res, next) {

	var data = matchedData(req);

	if (!data.id) {
		return res.status(400).send("You must include id for the evidence item you want to delete");
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;
	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send("Error fetching user permissions");
		} else {
			if (rows.length == 0) {
				return res.status(403).send("The currently logged in user does not have permissions to perform this action.");
			} else {
				// get record if not used in an issued badge
				var query = 'SELECT evidence.*, badge_evidence.badgeissuedid as badgeissuedid from badge_issued '
				query += 'left join badge_evidence on badge_evidence.badgeissuedid = badge_issued.id ';
				query += 'left join evidence on evidence.id = badge_evidence.evidenceid ';
				query += 'where evidence.userid=? and badge_issued.userid=? and evidence.id=? and badge_issued.status in ("pending","revoked")';
				db.get().query(query, [req.user.id, req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send("Error fetching evidence record");
					} else {
						if (rows2.length == 0) {
							return res.status(404).send("No evidence record found with the given id for the currently logged in user for a pending badge");
						} else {

							var updatequery = "DELETE from evidence WHERE userid=? AND id=?";
							var params = [req.user.id, data.id];

							db.get().query(updatequery, params, function(err4, results4) {
								if (err4) {
									console.log(err4);
									res.locals.errormsg = "Error deleting evidence record.";
								} else {
									console.log("evidence record deleted");
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

exports.listEvidenceForBadge = function(req, res, next) {

	var data = matchedData(req);
	console.log("it came into the evidence model");
	console.log(data);
	if (!data.id) {
		return res.status(400).send("You must include the badge issuance id to list evidence for");
	}

	res.locals.evidence = [];

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send("Error fetching user permissions");
		} else {
			if (rows.length == 0) {
				return res.status(403).send("The currently logged in user does not have permissions to perform this action.");
			} else {
				var query = 'SELECT evidence.*, badge_evidence.badgeissuedid as badgeissuedid from badge_issued '
				query += 'left join badge_evidence on badge_evidence.badgeissuedid = badge_issued.id ';
				query += 'left join evidence on evidence.id = badge_evidence.evidenceid ';
				query += 'where evidence.userid=? and badge_issued.userid=? and badge_issued.id=?';
				db.get().query(query, [req.user.id, req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send("Error retrieving evidence records");
					} else {

						// get data from joining on badge_evidence
						if (rows2.length > 0) {
							var i=0;
							function loop() {
								var next = rows2[i];

								res.locals.evidence[i] = {};
								res.locals.evidence[i].id = next["id"];
								res.locals.evidence[i].timecreated = next["timecreated"];
								res.locals.evidence[i].url = next["url"];
								res.locals.evidence[i].name = next["name"];
								res.locals.evidence[i].description = next["description"];
								res.locals.evidence[i].narrative = next["narrative"];
								res.locals.evidence[i].genre = next["genre"];
								res.locals.evidence[i].audience = next["audience"];
								res.locals.evidence[i].badgeissuedid = data.id;

								var sql = 'SELECT badge_issued.id from badge_issued '
								sql += 'left join badge_evidence on badge_evidence.badgeissuedid = badge_issued.id ';
								sql += 'left join evidence on evidence.id = badge_evidence.evidenceid ';
								sql += 'where evidence.id=? and badge_issued.status in ("issued","revoked")';

								db.get().query(sql, [next["id"]], function (err3, rows3) {
									if (err3) {
										console.log(err3);
										return res.status(404).send("Error checking evidence record not issued");
									} else {
										if (rows3.length > 0) {
											res.locals.evidence[i].issued = true;
										} else {
											res.locals.evidence[i].issued = false;
										}
										i++;
										if( i < rows2.length) {
											loop();
										} else {
											res.send({evidence: res.locals.evidence});
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
		}
	});
}

exports.getEvidenceById = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send("You must include id for the evidence you want to get the data for");
	}

	// only exists in relation to a pending issuance or an issuance record.
	// so does this route make sense?
}