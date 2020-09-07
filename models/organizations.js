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
 * Get the Organization management page for the currently logged in administrator.
 * @return HTML page for managing Organization records or error page with error message.
 */
exports.getOrganizationManagementPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				res.render('manageorganizations', { title: 'Manage Event Organizations'});
			}
		}
	});
}

/**
 * Create a new Organization record.
 * @param name, Required. A name for the Organization.
 * @param email, Required. An email address for the Organization.
 * @param pobox, Optional. The post office box number for PO box addresses, if applicable for the Organization.
 * @param streetaddress, Optional. The street address for the Organization. For example, 1600 Amphitheatre Pkwy.
 * @param locality, Optional. The town or city for the Organization's address.
 * @param region, Optional. The county or region for the Organization's address.
 * @param postcode, Optional. The postal code for the Organization's address.
 * @param country, Optional. The country for the Organization's address.
 * @return JSON with the data for new Organization record, or a JSON error object.
 */
exports.createOrganization = function(req, res, next) {

	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.name || !data.email) {
		return res.status(400).send({error: "You must include a name and email address for the organization you are adding"});
	}

	res.locals.id = "";
	res.locals.name = data.name;
	res.locals.email = data.email;

	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;
	res.locals.uniqueid = web3.utils.sha3("organization_" + time);

	// only really needed if address split out into seprate table.
	res.locals.hasOrganizerAddress = false;

	res.locals.pobox = "";
	if (data.pobox && data.pobox != "") {
		res.locals.pobox = data.pobox;
		res.locals.hasOrganizerAddress = true;
	}
	res.locals.streetaddress = "";
	if (data.streetaddress && data.streetaddress != "") {
		res.locals.streetaddress = data.streetaddress;
		res.locals.hasOrganizerAddress = true;
	}
	res.locals.locality = "";
	if (data.locality && data.locality != "") {
		res.locals.locality = data.locality;
		res.locals.hasOrganizerAddress = true;
	}
	res.locals.region = "";
	if (data.region && data.region != "") {
		res.locals.region = data.region;
		res.locals.hasOrganizerAddress = true;
	}
	res.locals.postcode = "";
	if (data.postcode && data.postcode != "") {
		res.locals.postcode = data.postcode;
		res.locals.hasOrganizerAddress = true;
	}
	res.locals.country = "";
	if (data.country && data.country != "") {
		res.locals.country = data.country;
		res.locals.hasOrganizerAddress = true;
	}

	// check the currently logged in user holds the role admin, super or issuer.
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("admin", "super", "issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				var insertquery = 'INSERT INTO organizations (userid, timecreated, uniqueid, name, email, pobox, streetaddress, locality, region, postcode, country) VALUE (?,?,?,?,?,?,?,?,?,?,?)';
				var params = [
					req.user.id,
					res.locals.timecreated,
					res.locals.uniqueid,
					res.locals.name,
					res.locals.email,
					res.locals.pobox,
					res.locals.streetaddress,
					res.locals.locality,
					res.locals.region,
					res.locals.postcode,
					res.locals.country,
				];
				db.get().query(insertquery, params, function(err3, result3) {
					if (err3) {
						console.log(err3);
						res.status(404).send({error: "Error saving organization data"});
					} else {
						console.log("organization saved");

						res.locals.id = result3.insertId;

						var reply = {
							id: res.locals.id,
							timecreated: res.locals.timecreated,
							uniqueid: res.locals.uniqueid,
							name: res.locals.name,
							email: res.locals.email,
							pobox: res.locals.pobox,
							streetaddress: res.locals.streetaddress,
							locality: res.locals.locality,
							region: res.locals.region,
							postcode: res.locals.postcode,
							country: res.locals.country,
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

/**
 * Update an existing Organization record.
 * @param id, Required. The record identifier of the Organization record you want to update.
 * @param name, Optional. A name for the Organization.
 * @param email, Optional. An email address for the Organization.
 * @param pobox, Optional. The post office box number for PO box addresses, if applicable for the Organization.
 * @param streetaddress, Optional. The street address for the Organization. For example, 1600 Amphitheatre Pkwy.
 * @param locality, Optional. The town or city for the Organization's address.
 * @param region, Optional. The county or region for the Organization's address.
 * @param postcode, Optional. The postal code for the Organization's address.
 * @param country, Optional. The country for the Organization's address.
 * @return JSON with the data for new Organization record, or a JSON error object.
 */
exports.updateOrganization = function(req, res, next) {

	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({error: "You must include the id of the organization you want to update"});
	}

	res.locals.id = data.id;

	res.locals.timecreated = "";
	res.locals.uniqueid = "";
	res.locals.usedInIssuance = true;

	res.locals.name = "";
	if (data.name && data.name != "") {
		res.locals.name = data.name;
	}
	res.locals.email = "";
	if (data.email && data.email != "") {
		res.locals.email = data.email;
	}
	res.locals.pobox = "";
	if (data.pobox && data.pobox != "") {
		res.locals.pobox = data.pobox;
	}
	res.locals.streetaddress = "";
	if (data.streetaddress && data.streetaddress != "") {
		res.locals.streetaddress = data.streetaddress;
	}
	res.locals.locality = "";
	if (data.locality && data.locality != "") {
		res.locals.locality = data.locality;
	}
	res.locals.region = "";
	if (data.region && data.region != "") {
		res.locals.region = data.region;
	}
	res.locals.postcode = "";
	if (data.postcode && data.postcode != "") {
		res.locals.postcode = data.postcode;
	}
	res.locals.country = "";
	if (data.country && data.country != "") {
		res.locals.country = data.country;
	}

	// check the currently logged in user holds the role admin, super or issuer.
	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin","issuer") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({error: "The logged in user account does not have the correct permissions to create a badge."});
			} else {
				db.get().query('SELECT organizations.* from organizations where organizations.userid=? and organizations.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error fetching organization record"});
					} else {
						if (rows2.length == 0) {
							return res.status(404).send({error: "No organization record found with the given id for the currently logged in user"});
						} else {
							res.locals.timecreated = rows2[0].timecreated;

							// Checked not used in an issued badge
							var selectquery = 'SELECT badge_issued.id from badge_issued left join criteria on badge_issued.badgeid = criteria.badgeid ';
							selectquery += 'left join criteria_events on criteria.id = criteria_events.criteriaid ';
							selectquery += 'left join events on criteria_events.eventid = events.id ';
							selectquery += 'left join event_organizers on event_organizers.eventid = events.id ';
							selectquery += 'left join event_sponsors on event_sponsors.eventid = events.id ';
							selectquery += 'where (event_organizers.organizationid=? || event_sponsors.organizationid=?) and badge_issued.status in ("issued","revoked")';
							db.get().query(selectquery, [res.locals.id, res.locals.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									return res.status(404).send({error: "Error checking organization record not used to issue a badge"});
								} else {
									if (rows3.length > 0) {
										return res.status(404).send({error: "This organization record has been used to issue a badge and therefore can not be edited"});
									} else {
										res.locals.timecreated = rows2[0].timecreated;
										res.locals.usedInIssuance = false;
										res.locals.uniqueid = rows2[0].uniqueid;

										var updatequery = "UPDATE organizations";
										var params = [];

										var setquery = "";

										// can't be empty
										if (res.locals.name != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "name=?"
											params.push(res.locals.name);
										} else {
											res.locals.name = rows2[0].targetname;
										}

										// can't be empty
										if (res.locals.email != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "email=?"
											params.push(res.locals.email);
										} else {
											res.locals.email = rows2[0].email;
										}

										if (res.locals.pobox != "" || res.locals.pobox != rows2[0].pobox) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "pobox=?"
											params.push(res.locals.pobox);
										} else {
											res.locals.pobox = rows2[0].pobox;
										}

										if (res.locals.streetaddress != "" || res.locals.streetaddress != rows2[0].streetaddress) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "streetaddress=?"
											params.push(res.locals.streetaddress);
										} else {
											res.locals.streetaddress = rows2[0].streetaddress;
										}

										if (res.locals.locality != "" || res.locals.locality != rows2[0].locality) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "locality=?"
											params.push(res.locals.locality);
										} else {
											res.locals.locality = rows2[0].locality;
										}

										if (res.locals.region != "" || res.locals.region != rows2[0].region) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "region=?"
											params.push(res.locals.region);
										} else {
											res.locals.region = rows2[0].region;
										}

										if (res.locals.postcode != "" || res.locals.postcode != rows2[0].postcode) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "postcode=?"
											params.push(res.locals.postcode);
										} else {
											res.locals.postcode = rows2[0].postcode;
										}

										if (res.locals.region != "" || res.locals.region != rows2[0].region) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "country=?"
											params.push(res.locals.region);
										} else {
											res.locals.country = rows2[0].country;
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
													res.status(404).send({error: "Error updating organization record."});
												} else {
													console.log("organization record updated");
													var reply = {
														id: res.locals.id,
														timecreated: res.locals.timecreated,
														uniqueid: res.locals.uniqueid,
														name: res.locals.name,
														email: res.locals.email,
														pobox: res.locals.pobox,
														streetaddress: res.locals.streetaddress,
														locality: res.locals.locality,
														region: res.locals.region,
														postcode: res.locals.postcode,
														country: res.locals.country,
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
												name: res.locals.name,
												email: res.locals.email,
												pobox: res.locals.pobox,
												streetaddress: res.locals.streetaddress,
												locality: res.locals.locality,
												region: res.locals.region,
												postcode: res.locals.postcode,
												country: res.locals.country,
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

/**
 * Delete an existing Organization record.
 * @param id, Required. The record identifier of the Organization you wish to delete.
 * @return JSON with the id of the Organization record that was deleted and a status property of -1, or a JSON error object.
 */
exports.deleteOrganization = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send("You must include id for the organization you want to delete");
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
				db.get().query('SELECT organizations.* FROM organizations WHERE organizations.userid=? and organizations.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error fetching organization record"});
					} else {
						if (rows2.length == 0) {
							return res.status(404).send("No organization record found with the given id for the currently logged in user");
						} else {
							// Checked not used in an issued badge
							var selectquery = 'SELECT badge_issued.id from badge_issued left join criteria on badge_issued.badgeid = criteria.badgeid ';
							selectquery += 'left join criteria_events on criteria.id = criteria_events.criteriaid ';
							selectquery += 'left join events on criteria_events.eventid = events.id ';
							selectquery += 'left join event_organizers on event_organizers.eventid = events.id ';
							selectquery += 'left join event_sponsors on event_sponsors.eventid = events.id ';
							selectquery += 'where (event_organizers.organizationid=? || event_sponsors.organizationid=?) and badge_issued.status in ("issued","revoked")';
							db.get().query(selectquery, [res.locals.id, res.locals.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									return res.status(404).send("Error checking organization record not used in an issued badge");
								} else {
									if (rows3.length > 0) {
										return res.status(403).send({error: "This organization record has been used in an issued badge and therefore can't be deleted"});
									} else {
										var updatequery = "DELETE from organizations WHERE userid=? AND id=?";
										var params = [req.user.id, res.locals.id];

										db.get().query(updatequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												return res.status(403).send({error: "Error deleting organization record."});
											} else {
												console.log("organization record deleted");

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
 * Get a list of all Organization records for the currently logged in user.
 * @return JSON with an object with key 'organizations' pointing to an array of the Organization records, or a JSON error object.
 */
exports.listOrganizations = function(req, res, next) {

	res.locals.organizations = [];

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send("The currently logged in user does not have permissions to perform this action");
			} else {
				// get if used? - count records in issued table as usecount?
				db.get().query('SELECT organizations.* FROM organizations WHERE organizations.userid=?', [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error retrieving organization records"});
					} else {
						if (rows2.length > 0) {
							var i=0;
							function loop() {
								var next = rows2[i];

								res.locals.organizations[i] = {};
								res.locals.organizations[i].id = next["id"];
								res.locals.organizations[i].timecreated = next["timecreated"];
								res.locals.organizations[i].uniqueid = next["uniqueid"];
								res.locals.organizations[i].name = next["name"];
								res.locals.organizations[i].email = next["email"];
								res.locals.organizations[i].pobox = next["pobox"];
								res.locals.organizations[i].streetaddress = next["streetaddress"];
								res.locals.organizations[i].locality = next["locality"];
								res.locals.organizations[i].region = next["region"];
								res.locals.organizations[i].postcode = next["postcode"];
								res.locals.organizations[i].country = next["country"];

								var selectquery = 'SELECT badge_issued.id from badge_issued left join criteria on badge_issued.badgeid = criteria.badgeid ';
								selectquery += 'left join criteria_events on criteria.id = criteria_events.criteriaid ';
								selectquery += 'left join events on criteria_events.eventid = events.id ';
								selectquery += 'left join event_organizers on event_organizers.eventid = events.id ';
								selectquery += 'left join event_sponsors on event_sponsors.eventid = events.id ';
								selectquery += 'where (event_organizers.organizationid=? || event_sponsors.organizationid=?) and badge_issued.status in ("issued","revoked")';

								db.get().query(selectquery, [next["id"], next["id"]], function (err3, rows3) {
									if (err3) {
										console.log(err3);
										return res.status(404).send("Error checking organizations record not used to issue a badge");
									} else {
										if (rows3.length > 0) {
											res.locals.organizations[i].usedInIssuance = true;
										} else {
											res.locals.organizations[i].usedInIssuance = false;
										}
										i++;
										if( i < rows2.length) {
											loop();
										} else {
											res.send({organizations: res.locals.organizations});
										}
									}
								});
							}
							loop();
						} else {
							res.send({organizations: res.locals.organizations});
						}
					}
				});
			}
		}
	});
}

/**
 * Get an Organization record by it's record identifier.
 * @param id, Required. The identifier of the Organization record you wish to retrieve.
 * @return JSON with Organization record data or a JSON error object.
 */
exports.getOrganizationById = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({error: "You must include id for the organization you want to get the data for"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("admin", "super", "issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send("The currently logged in user does not have permissions to perform this action");
			} else {
				db.get().query('SELECT organizations.* FROM organizations WHERE organizations.userid=? and organizations.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error retrieving organization record"});
					} else {
						if (rows2.length > 0) {
							var next = rows2[0];

							var organizationobj = {};

							var selectquery = 'SELECT badge_issued.id from badge_issued left join criteria on badge_issued.badgeid = criteria.badgeid ';
							selectquery += 'left join criteria_events on criteria.id = criteria_events.criteriaid ';
							selectquery += 'left join events on criteria_events.eventid = events.id ';
							selectquery += 'left join event_organizers on event_organizers.eventid = events.id ';
							selectquery += 'left join event_sponsors on event_sponsors.eventid = events.id ';
							selectquery += 'where (event_organizers.organizationid=? || event_sponsors.organizationid=?) and badge_issued.status in ("issued","revoked")';

							db.get().query(selectquery, [data.id, data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									return res.status(404).send({error: "Error checking organization record not used to issue a badge"});
								} else {
									organizationobj.id = next["id"];
									organizationobj.timecreated = next["timecreated"];
									organizationobj.uniqueid = next["uniqueid"];
									organizationobj.name = next["name"];
									organizationobj.email = next["email"];
									organizationobj.pobox = next["pobox"];
									organizationobj.streetaddress = next["streetaddress"];
									organizationobj.locality = next["locality"];
									organizationobj.region = next["region"];
									organizationobj.postcode = next["postcode"];
									organizationobj.country = next["country"];

									if (rows3.length > 0) {
										organizationobj.usedInIssuance = true;
									} else {
										organizationobj.usedInIssuance = false;
									}

									res.send(organizationobj);
								}
							});
						} else {
							return res.status(404).send({error: "No organizations record found with the given id for the currently logged in user"});
						}
					}
				});
			}
		}
	});
}