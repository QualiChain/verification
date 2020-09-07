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

const fs = require( 'fs' );
const csv = require('csv-parser');
var db = require('../db.js')
var cfg = require('../config.js');
var utilities = require('../models/utilities.js')

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const { matchedData } = require('express-validator/filter');

/**
 * Get an Event statistics (used for the Leaderboard page).
 * @param id, Required. The identifier of the Event record you wish to retrieve statistics for.
 * @return JSON with Event statistic data or a JSON error object.
 */
exports.getEventStatistics = function(req, res, next) {

	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({error: "You must include the id of the event you want to get the statistics for"});
	}

	//db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
	//	if (err) {
	//		console.log(err);
	//		return res.status(400).send({error: "There was a problem fetching the statistics from the database"});
	//	} else {
	//		if (rows.length == 0) {
	//
	//		} else {

				// issue count per badge
				var query = "Select badges.title, badges.imageurl, count(badge_issued.badgeid) as issuedcount from events ";
				query += "left join criteria_events on events.id = criteria_events.eventid ";
				query += "left join criteria on criteria_events.criteriaid = criteria.id "
				query += "left join badges on criteria.badgeid = badges.id ";
				query += "left join badge_issued on badge_issued.badgeid = badges.id ";
				query += "left join recipients on badge_issued.recipientid = recipients.id ";
				query += "where events.id=? group by badge_issued.badgeid order by badges.id";

				//Select (case when (event_recipient_permissions.canshowname = TRUE) Then recipients.name Else 'Attendee' End, count(badge_issued.badgeid) as num, DATE_FORMAT(FROM_UNIXTIME(MAX(badge_issued.timecreated)), '%e %b %Y %H:%i:%s'),event_recipient_permissions.canshowname from badge_issued left join recipients on badge_issued.recipientid = recipients.id left join badges on badge_issued.badgeid = badges.id left join criteria on badges.id = criteria.badgeid left join criteria_events on criteria.id = criteria_events.criteriaid left join event_recipient_permissions on event_recipient_permissions.recipientid = recipients.id where criteria_events.eventid = 19 group by badge_issued.recipientid order by num DESC, recipients.name ASC, badge_issued.timecreated DESC

				var query2 = "Select (case when (event_recipient_permissions.canshowname = TRUE) ";
				query2 += "Then recipients.name Else concat('Attendee ', event_recipient_permissions.id) End) as name, ";
				query2 += "count(badge_issued.badgeid) as badgecount, MAX(badge_issued.timecreated) as date from badge_issued ";
				//query2 += "count(badge_issued.badgeid) as badgecount, DATE_FORMAT(FROM_UNIXTIME(MAX(badge_issued.timecreated)), '%e %b %Y %H:%i:%s') as date from badge_issued ";
				query2 += "left join recipients on badge_issued.recipientid = recipients.id ";
				query2 += "left join badges on badge_issued.badgeid = badges.id ";
				query2 += "left join criteria on badges.id = criteria.badgeid ";
				query2 += "left join criteria_events on criteria.id = criteria_events.criteriaid ";
				query2 += "left join event_recipient_permissions on event_recipient_permissions.recipientid = recipients.id ";
				query2 += "where criteria_events.eventid=? group by badge_issued.recipientid ";
				query2 += "order by badgecount DESC, badge_issued.timecreated ASC";

				// Total recipients at event
				query3 = "Select count(event_recipient_permissions.recipientid) as num from event_recipient_permissions where event_recipient_permissions.eventid=?"

				var badgestats = [];
				var peoplestats = [];
				var attendeecount = 0;

				db.get().query(query, [data.id], function (err, rows) {
					if (err) {
						console.log(err);
						res.status(404).send({'error': "Error fetching badge stats"});
					} else {
						if (rows.length > 0) {
							badgestats = rows;
						}
						db.get().query(query2, [data.id], function (err2, rows2) {
							if (err2) {
								console.log(err2);
								res.status(404).send({'error': "Error fetching people stats"});
							} else {
								if (rows2.length > 0) {
									peoplestats = rows2;
								}
								db.get().query(query3, [data.id], function (err3, rows3) {
									if (err3) {
										console.log(err3);
										res.status(404).send({'error': "Error fetching event attendee count"});
									} else {
										if (rows3.length > 0) {
											attendeecount = rows3[0].num;
										}

										reply = {}
										reply.badgestats = badgestats;
										reply.peoplestats = peoplestats;
										reply.attendeecount = attendeecount;
										res.send(reply);
									}
								});
							}
						});
					}
				});
	//		}
	//	}
	//});
}

/**
 * Get the Event leaderboard page.
 * @param id, Required. The identifier of the Event record you wish to get the leaderboard page for.
 * @return HTML page for Event leaderboard or error page with error message.
 */
exports.getEventStatisticsPage = function(req, res, next) {

	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({error: "You must include the id of the event you want to draw the leaderboard for"});
	}

	//db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
	//	if (err) {
	//		console.log(err);
	//		res.render('error', { message: "Error fetching user permissions"});
	//	} else {
	//		if (rows.length == 0) {
	//			res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
	//		} else {
				query = "Select * from events where id=?";
				db.get().query(query, [data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.render('error', { message: "Error fetching event information"});
					} else {
						if (rows2.length == 0) {
							res.render('error', { message: "The event id given could not be found in our system"});
						} else {
							res.render('leaderboard', {
								event: rows2[0]
							});
							/*
							res.render('leaderboard', {
								name: rows2[0].name,
								description: rows2[0].description,
								startdate: rows2[0].startdate,
								enddate: rows2[0].enddate,
								location_name: rows2[0].location_name,
								location_pobox: rows2[0].location_pobox,
								location_streetaddress: rows2[0].location_streetaddress,
								location_locality: rows2[0].location_locality,
								location_region: rows2[0].location_region,
								location_country: rows2[0].location_country,
								location_postcode: rows2[0].location_postcode
							});
							*/
						}
					}
				});
	//		}
	//	}
	//});
}

/**
 * Check if a Recipient with the given name and email address is listed as an attendee for the event with the given record identifier.
 * @param id, Required. The identifier of the Event record you wish to check an attendee for.
 * @param name, Required. The name of the Recipient you wish to check against.
 * @param email, Required. The email address of the Recipient you wish to check against.
 * @return JSON object with property 'found' set to 'true' or 'false' or a JSON error object.
 */
exports.checkEventAttendee = function(req, res, next) {

	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.recipientname || !data.recipientemail || !data.id) {
		return res.status(400).send({error: "You must include an event id, recipientname and recipientemail to check if a given badge recipient has been registered against a given event."});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("admin", "super", "issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				var selectquery = 'Select * from event_recipient_permissions left join recipients on event_recipient_permissions.recipientid = recipients.id where recipients.name=? and recipients.email=? and event_recipient_permissions.eventid=?';
				var params = [
					data.recipientname,
					data.recipientemail,
					data.id
				];
				db.get().query(selectquery, params, function(err3, result3) {
					if (err3) {
						console.log(err3);
						return res.status(404).send({error: "Error checking if an event attendee is a registered badge recipient for the given event"});
					} else {
						var reply = {};
						reply.eventid = data.id;
						reply.recipientname = data.recipientname;
						reply.recipientemail = data.recipientemail
						if (rows2.length == 0) {
							reply.found = false;
						} else {
							reply.found = true;
						}
						res.send(reply);
					}
				});
			}
		}
	});
}

/**
 * Get the Event management page for the currently logged in administrator.
 * @return HTML page for managing Event records or error page with error message.
 */
exports.getEventManagementPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				res.render('manageevents', { title: 'Manage Badging Events'});
			}
		}
	});
}

/**
 * Create a new Event record.
 * @param name, Required. A name for the new Event item.
 * @param startdate, Required. A start date for the new Event item (in seconds).
 * @param enddate, Required. An end date for the new Event item (in seconds).
 * @param description, Optional. An description of the Event.
 * @param location_name, Required. A name for the location of the Event.
 * @param location_pobox, Optional. The post office box number for PO box addresses, if applicable for the Events's location.
 * @param location_streetaddress, Optional. The street address for the Events's location. For example, 1600 Amphitheatre Pkwy.
 * @param location_locality, Optional. The town or city for the Events's location address.
 * @param location_region, Optional. The county or region for the Events's location  address.
 * @param location_postcode, Optional. The postal code for the Events's location  address.
 * @param location_country, Optional. The country for the Events's location  address.
 * @return JSON with the data for new Organization record, or a JSON error object.
 */
exports.createEvent = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.name || !data.startdate || !data.enddate) {
		return res.status(400).send({error: "You must include a name, start date and end date for the event you are adding"});
	}

	//res.locals.locationaddressfinished = false;
	res.locals.organizersfinished = false;
	res.locals.sponsorsfinished = false;

	res.locals.id = "";

	res.locals.name = data.name;
	res.locals.startdate = data.startdate;
	res.locals.enddate = data.enddate;

	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;
	res.locals.uniqueid = web3.utils.sha3("event_" + time);

	res.locals.description = "";
	if (data.description && data.description != "") {
		res.locals.description = data.description;
	}

	// EVENT LOCATION

	res.locals.location_name = "";
	if (data.location_name && data.location_name != "") {
		res.locals.location_name = data.location_name;
	}
	res.locals.location_pobox = "";
	if (data.location_pobox && data.location_pobox != "") {
		res.locals.location_pobox = data.location_pobox;
	}
	res.locals.location_streetaddress = "";
	if (data.location_streetaddress && data.location_streetaddress != "") {
		res.locals.location_streetaddress = data.location_streetaddress;
	}
	res.locals.location_locality = "";
	if (data.location_locality && data.location_locality != "") {
		res.locals.location_locality = data.location_locality;
	}
	res.locals.location_region = "";
	if (data.location_region && data.location_region != "") {
		res.locals.location_region = data.location_region;
	}
	res.locals.location_postcode = "";
	if (data.location_postcode && data.location_postcode != "") {
		res.locals.location_postcode = data.location_postcode;
	}
	res.locals.location_country = "";
	if (data.location_country && data.location_country != "") {
		res.locals.location_country = data.location_country;
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("admin", "super", "issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				var insertquery = 'INSERT INTO events (userid, timecreated, uniqueid, name, description, startdate, enddate, location_name, location_pobox, location_streetaddress, location_locality, location_region, location_country, location_postcode) VALUE (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
				var params = [
					req.user.id,
					res.locals.timecreated,
					res.locals.uniqueid,
					res.locals.name,
					res.locals.description,
					res.locals.startdate,
					res.locals.enddate,
					res.locals.location_name,
					res.locals.location_pobox,
					res.locals.location_streetaddress,
					res.locals.location_locality,
					res.locals.location_region,
					res.locals.location_country,
					res.locals.location_postcode,
				];
				db.get().query(insertquery, params, function(err3, result3) {
					if (err3) {
						console.log(err3);
						return res.status(404).send({error: "Error saving event data"});
					} else {
						console.log("event saved");
						res.locals.id = result3.insertId;

						var reply = {
							id: res.locals.id,
							timecreated: res.locals.timecreated,
							uniqueid: res.locals.uniqueid,

							name: res.locals.name,
							description: res.locals.description,
							startdate: res.locals.startdate,
							enddate: res.locals.enddate,

							location_name: res.locals.location_name,
							location_pobox:	res.locals.location_pobox,
							location_streetaddress: res.locals.location_streetaddress,
							location_locality: res.locals.location_locality,
							location_region: res.locals.location_region,
							location_postcode: res.locals.location_postcode,
							location_country: res.locals.location_country,

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
 * Update an existing Event record.
 * @param name, Required. A name for the new Event item.
 * @param startdate, Required. A start date for the new Event item (in seconds).
 * @param enddate, Required. An end date for the new Event item (in seconds).
 * @param description, Optional. A description of the Event.
 * @param location_name, Required. A name for the location of the Event.
 * @param location_pobox, Optional. The post office box number for PO box addresses, if applicable for the Events's location.
 * @param location_streetaddress, Optional. The street address for the Events's location. For example, 1600 Amphitheatre Pkwy.
 * @param location_locality, Optional. The town or city for the Events's location address.
 * @param location_region, Optional. The county or region for the Events's location  address.
 * @param location_postcode, Optional. The postal code for the Events's location  address.
 * @param location_country, Optional. The country for the Events's location  address.
 * @return JSON with the data for new Organization record, or a JSON error object.
 */
exports.updateEvent = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({error: "You must include the id of the event you want to update"});
	}

	res.locals.id = data.id;
	res.locals.timecreated = "";
	res.locals.uniqueid = "";

	res.locals.name = "";
	if (data.name && data.name != "") {
		res.locals.name = data.name;
	}
	res.locals.description = "";
	if (data.description && data.description != "") {
		res.locals.description = data.description;
	}
	res.locals.startdate = "";
	if (data.startdate && data.startdate != "") {
		res.locals.startdate = data.startdate;
	}
	res.locals.enddate = "";
	if (data.enddate && data.enddate != "") {
		res.locals.enddate = data.enddate;
	}

	// EVENT LOCATION
	res.locals.location_name = "";
	if (data.location_name && data.location_name != "") {
	}
	res.locals.location_pobox = "";
	if (data.location_pobox && data.location_pobox != "") {
		res.locals.location_pobox = data.location_pobox;
	}
	res.locals.location_streetaddress = "";
	if (data.location_streetaddress && data.location_streetaddress != "") {
		res.locals.location_streetaddress = data.location_streetaddress;
	}
	res.locals.location_locality = "";
	if (data.location_locality && data.location_locality != "") {
		res.locals.location_locality = data.location_locality;
	}
	res.locals.location_region = "";
	if (data.location_region && data.location_region != "") {
		res.locals.location_region = data.location_region;
	}
	res.locals.location_postcode = "";
	if (data.location_postcode && data.location_postcode != "") {
		res.locals.location_postcode = data.location_postcode;
	}
	res.locals.location_country = "";
	if (data.location_country && data.location_country != "") {
		res.locals.location_country = data.location_country;
	}

	res.locals.usedInIssuance = true;

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin","issuer") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({error: "The logged in user account does not have the correct permissions to create a badge."});
			} else {
				db.get().query('SELECT events.* from events where events.userid=? and events.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error fetching event record"});
					} else {
						if (rows2.length == 0) {
							return res.status(404).send({error: "No event record found with the given id for the currently logged in user"});
						} else {
							res.locals.timecreated = rows2[0].timecreated;

							// Checked not used in an issued badge
							var selectquery = 'SELECT badge_issued.id from badge_issued left join criteria on badge_issued.badgeid = criteria.badgeid ';
							selectquery += 'left join criteria_events on criteria.id = criteria_events.criteriaid ';
							selectquery += 'left join events on criteria_events.eventid = events.id ';
							selectquery += 'where events.id=? and badge_issued.status in ("issued","revoked")';

							db.get().query(selectquery, [res.locals.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									return res.status(404).send({error: "Error checking event record not used to issue a badge"});
								} else {
									if (rows3.length > 0) {
										return res.status(404).send({error: "This event record has been used to issue a badge and therefore can not be edited"});
									} else {
										res.locals.timecreated = rows2[0].timecreated;
										res.locals.usedInIssuance = false;
										res.locals.uniqueid = rows2[0].uniqueid;

										var updatequery = "UPDATE events";
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
											res.locals.name = rows2[0].name;
										}

										if (res.locals.description || res.locals.description != rows2[0].description) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "description=?"
											params.push(res.locals.description);
										} else {
											res.locals.description = rows2[0].description;
										}

										// can't be empty
										if (res.locals.startdate != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "startdate=?"
											params.push(res.locals.startdate);
										} else {
											res.locals.startdate = rows2[0].startdate;
										}

										// can't be empty
										if (res.locals.enddate != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "enddate=?"
											params.push(res.locals.enddate);
										} else {
											res.locals.enddate = rows2[0].enddate;
										}

										if (res.locals.location_name != "" || res.locals.location_name != rows2[0].location_name) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "location_name=?"
											params.push(res.locals.location_name);
										} else {
											res.locals.location_name = rows2[0].location_name;
										}

										if (res.locals.location_pobox != "" || res.locals.location_pobox != rows2[0].location_pobox) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "location_pobox=?"
											params.push(res.locals.location_pobox);
										} else {
											res.locals.location_pobox = rows2[0].location_pobox;
										}

										if (res.locals.location_streetaddress != "" || res.locals.location_streetaddress != rows2[0].location_streetaddress) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "location_streetaddress=?"
											params.push(res.locals.location_streetaddress);
										} else {
											res.locals.location_streetaddress = rows2[0].location_streetaddress;
										}

										if (res.locals.location_locality != "" || res.locals.location_locality != rows2[0].location_locality) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "location_locality=?"
											params.push(res.locals.location_locality);
										} else {
											res.locals.location_locality = rows2[0].location_locality;
										}

										if (res.locals.location_region != "" || res.locals.location_region != rows2[0].location_region) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "location_region=?"
											params.push(res.locals.location_region);
										} else {
											res.locals.location_region = rows2[0].location_region;
										}

										if (res.locals.location_postcode != "" || res.locals.location_postcode != rows2[0].location_postcode) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "location_postcode=?"
											params.push(res.locals.location_postcode);
										} else {
											res.locals.location_postcode = rows2[0].location_postcode;
										}

										if (res.locals.location_country != "" || res.locals.location_country != rows2[0].location_country) {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "location_country=?"
											params.push(res.locals.location_country);
										} else {
											res.locals.location_country = rows2[0].location_country;
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
													res.status(404).send({error: "Error updating event record."});
												} else {
													console.log("event record updated");
													var reply = {
														id: res.locals.id,
														timecreated: res.locals.timecreated,
														uniqueid: res.locals.uniqueid,
														name: res.locals.name,
														description: res.locals.description,
														startdate: res.locals.startdate,
														enddate: res.locals.enddate,
														location_name: res.locals.location_name,
														location_pobox: res.locals.location_pobox,
														location_streetaddress: res.locals.location_streetaddress,
														location_locality: res.locals.location_locality,
														location_region: res.locals.location_region,
														location_postcode: res.locals.location_postcode,
														location_country: res.locals.location_country,
														usedInIssuance: res.locals.issued
													};
													res.send(reply);
												}
											});
										} else {
											var reply = {
												id: res.locals.id,
												timecreated: res.locals.timecreated,
												uniqueid: res.locals.uniqueid,
												name: res.locals.name,
												description: res.locals.description,
												startdate: res.locals.startdate,
												enddate: res.locals.enddate,
												location_name: res.locals.location_name,
												location_pobox: res.locals.location_pobox,
												location_streetaddress: res.locals.location_streetaddress,
												location_locality: res.locals.location_locality,
												location_region: res.locals.location_region,
												location_postcode: res.locals.location_postcode,
												location_country: res.locals.location_country,
												usedInIssuance: res.locals.issued
											};
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
 * Delete an existing Event record.
 * @param id, Required. The record identifier of the Event you wish to delete.
 * @return JSON with the id of the Event record that was deleted and a status property of -1, or a JSON error object.
 */
exports.deleteEvent = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id) {
		return res.status(400).send({error: "You must include id for the event you want to delete"});
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
				db.get().query('SELECT events.* FROM events WHERE events.userid=? and events.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send("Error fetching event record");
					} else {
						if (rows2.length == 0) {
							return res.status(404).send({error: "No event record found with the given id for the currently logged in user"});
						} else {
							// Checked not used in an issued badge
							var selectquery = 'SELECT badge_issued.id from badge_issued left join criteria on badge_issued.badgeid = criteria.badgeid ';
							selectquery += 'left join criteria_events on criteria.id = criteria_events.criteriaid ';
							selectquery += 'left join events on criteria_events.eventid = events.id ';
							selectquery += 'where events.id=? and badge_issued.status in ("issued","revoked")';

							db.get().query(selectquery, [res.locals.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									return res.status(404).send({error: "Error checking event record not used in an issued badge"});
								} else {
									if (rows3.length > 0) {
										return res.status(404).send({error: "This event record has been used in an issued badge and therefore can't be deleted"});
									} else {
										var updatequery = "DELETE from events WHERE userid=? AND id=?";
										var params = [req.user.id, res.locals.id];

										db.get().query(updatequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												return res.status(404).send({error: "Error deleting event record."});
											} else {
												console.log("event record deleted");

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
 * Get a list of all Event records for the currently logged in user.
 * @return JSON with an object with key 'events' pointing to an array of the Event records, or a JSON error object.
 */
exports.listEvents = function(req, res, next) {

	res.locals.events = [];

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send("The currently logged in user does not have permissions to perform this action");
			} else {
				db.get().query('SELECT events.* FROM events WHERE events.userid=?', [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error retrieving event records"});
					} else {
						if (rows2.length > 0) {
							var i=0;
							function loop() {
								var next = rows2[i];

								res.locals.events[i] = {};
								res.locals.events[i].id = next["id"];
								res.locals.events[i].timecreated = next["timecreated"];
								res.locals.events[i].uniqueid = next["uniqueid"];
								res.locals.events[i].name = next["name"];
								res.locals.events[i].description = next["description"];
								res.locals.events[i].startdate = next["startdate"];
								res.locals.events[i].enddate = next["enddate"];

								res.locals.events[i].location_name = next["location_name"];
								res.locals.events[i].location_pobox = next["location_pobox"];
								res.locals.events[i].location_streetaddress = next["location_streetaddress"];
								res.locals.events[i].location_locality = next["location_locality"];
								res.locals.events[i].location_region = next["location_region"];
								res.locals.events[i].location_country = next["location_country"];
								res.locals.events[i].location_postcode = next["location_postcode"];

								var selectquery = 'SELECT badge_issued.id from badge_issued left join criteria on badge_issued.badgeid = criteria.badgeid ';
								selectquery += 'left join criteria_events on criteria.id = criteria_events.criteriaid ';
								selectquery += 'left join events on criteria_events.eventid = events.id ';
								selectquery += 'where events.id=? and badge_issued.status in ("issued","revoked")';

								db.get().query(selectquery, [next["id"]], function (err3, rows3) {
									if (err3) {
										console.log(err3);
										return res.status(404).send({error: "Error checking event record not used to issue a badge"});
									} else {
										if (rows3.length > 0) {
											res.locals.events[i].usedInIssuance = true;
										} else {
											res.locals.events[i].usedInIssuance = false;
										}
										i++;
										if( i < rows2.length) {
											loop();
										} else {
											res.send({events: res.locals.events});
										}
									}
								});
							}
							loop();
						} else {
							res.send({events: res.locals.events});
						}
					}
				});
			}
		}
	});
}

/**
 * Get an Event record by it's record identifier.
 * @param id, Required. The identifier of the Event record you wish to retrieve.
 * @return JSON with Event record data or a JSON error object.
 */
exports.getEventsById = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({error: "You must include id for the badge you want to get the data for"});
	}

	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("admin", "super", "issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT events.* FROM events WHERE events.userid=? and events.id=?', [req.user.id, res.locals.id ], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error retrieving event record"});
					} else {
						if (rows2.length > 0) {
							var next = rows2[0];

							var eventobj = {};

							var selectquery = 'SELECT badge_issued.id from badge_issued left join criteria on badge_issued.badgeid = criteria.badgeid ';
							selectquery += 'left join criteria_events on criteria.id = criteria_events.criteriaid ';
							selectquery += 'left join events on criteria_events.eventid = events.id ';
							selectquery += 'where events.id=? and badge_issued.status in ("issued","revoked")';

							db.get().query(selectquery, [res.locals.id ], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									return res.status(404).send({error: "Error checking event record not used to issue a badge"});
								} else {

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

									if (rows3.length > 0) {
										eventobj.usedInIssuance = true;
									} else {
										eventobj.usedInIssuance = false;
									}

									res.send(eventobj);
								}
							});
						} else {
							return res.status(404).send({error: "No event record found with the given id for the currently logged in user"});
						}
					}
				});
			}
		}
	});
}


/*** ORGANIZER FUNCTIONS ***/

/**
 * Add an organizer (Organization) to an Event.
 * @param id, Required. The record identifier of the Event you wish to add an organizer to.
 * @param organizationid, Required. The record identifier of the Organization you wish to add as organizer of the Event.
 * @return JSON object representing the new association between the Organization (organizer) and the Event.
 */
exports.addOrganizer = function(req, res, next) {

	var data = matchedData(req);

	console.log("adding:"+data.organizationid+" from:"+data.id);

	if (!data.id || !data.organizationid) {
		return res.status(400).send({"error": "You must include the id for the event you want to add an organizer to and the organization id you want to add as an organizer"});

	}

	res.locals.id = "";
	res.locals.timecreated = "";
	res.locals.eventid = data.id;
	res.locals.organizationid = data.organizationid;

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				// check event id exists and is owned by the current user
				db.get().query('SELECT events.* from events where events.userid=? and events.id=?', [req.user.id, res.locals.eventid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching event record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No event record found with the given id for the currently logged in user"});
						} else {
							// check organization record exists and is owned by the current user
							db.get().query('SELECT organizations.* from organizations where organizations.userid=? and organizations.id=?', [req.user.id, res.locals.organizationid], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error fetching organization record"});
								} else {
									if (rows3.length == 0) {
										res.status(404).send({error: "No organization record found with the given id for the currently logged in user"});
									} else {

										var selectquery = 'SELECT badge_issued.id from badge_issued left join criteria on badge_issued.badgeid = criteria.badgeid ';
										selectquery += 'left join criteria_events on criteria.id = criteria_events.criteriaid ';
										selectquery += 'left join events on criteria_events.eventid = events.id ';
										selectquery += 'where events.id=? and badge_issued.status in ("issued","revoked")';

										db.get().query(selectquery, [res.locals.eventid], function (err3, rows3) {
											if (err3) {
												console.log(err3);
												res.status(404).send({error: "Error checking if event is attached to a badge that has been issued"});
											} else {
												if (rows3.length > 0) {
													res.status(404).send({error: "This event record has been used to issue a badge and therefore can't be edited"});
												} else {
													var time = Math.floor((new Date().getTime()) / 1000);
													res.locals.timecreated = time;

													var insertquery = "INSERT INTO event_organizers (userid, timecreated, eventid, organizationid) VALUES (?,?,?,?)";
													var params = [req.user.id, time, res.locals.eventid, res.locals.organizationid];

													db.get().query(insertquery, params, function(err4, results4) {
														if (err4) {
															console.log(err4);
															res.status(404).send({error: "Error creating event organizer association record."});
														} else {
															console.log("event organizer association record created");

															res.locals.id = results4.insertId;
															var reply = {
																 id: res.locals.id,
																 timecreated: res.locals.timecreated,
																 eventid: res.locals.eventid,
																 organizationid: res.locals.organizationid,
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
 * Remove an organizer (Organization) from an Event.
 * @param id, Required. The record identifier of the Event you wish to remove an organizer from.
 * @param organizationid, Required. The record identifier of the Organization you wish to remove as an organizer of the Event.
 * @return JSON object with the properties, 'id', 'organizationid' and 'status' which is set to -1 to indicate the deletion of the association.
 */
exports.removeOrganizer = function(req, res, next) {

	var data = matchedData(req);

	if (!data.id || !data.organizationid) {
		return res.status(400).send({"error": "You must include the id for the event you want to remove an organizer from and the organization id you want to remove as an organizer"});
	}

	res.locals.id = "";
	res.locals.timecreated = "";
	res.locals.eventid = data.id;
	res.locals.organizationid = data.organizationid;

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				// check eventid exists and is owned by the current user
				db.get().query('SELECT events.* from events where events.userid=? and events.id=?', [req.user.id, res.locals.eventid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching event record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No event record found with the given id for the currently logged in user"});
						} else {
							// check organization record exists and is owned by the current user
							db.get().query('SELECT organizations.* from organizations where organizations.userid=? and organizations.id=?', [req.user.id, res.locals.organizationid], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error fetching organization record"});
								} else {
									if (rows3.length == 0) {
										res.status(404).send({error: "No organization record found with the given id for the currently logged in user"});
									} else {

										// check badge not used
										var selectquery = 'SELECT badge_issued.id from badge_issued left join criteria on badge_issued.badgeid = criteria.badgeid ';
										selectquery += 'left join criteria_events on criteria.id = criteria_events.criteriaid ';
										selectquery += 'left join events on criteria_events.eventid = events.id ';
										selectquery += 'where events.id=? and badge_issued.status in ("issued","revoked")';

										db.get().query(selectquery, [res.locals.eventid], function (err3, rows3) {
											if (err3) {
												console.log(err3);
												res.status(404).send({error: "Error checking if event has been used in an issued badge"});
											} else {
												if (rows3.length > 0) {
													res.status(404).send({error: "This event record has been used in an issued badge and therefore can't be changed"});
												} else {
													var time = Math.floor((new Date().getTime()) / 1000);
													res.locals.timecreated = time;

													var deletequery = "DELETE from event_organizers where userid=? and eventid=? and organizationid=?";
													var params = [req.user.id, res.locals.eventid, res.locals.organizationid];

													db.get().query(deletequery, params, function(err4, results4) {
														if (err4) {
															console.log(err4);
															res.status(404).send({error: "Error removing event organizer association record."});
														} else {
															console.log("event organizer association record remove");
															var reply = {
																 id: res.locals.eventid,
																 organizationid: res.locals.organizationid,
																 status: -1
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
		}
	});
}

/**
 * Get a list of all the orgaizers (Organization records) for the Event with the given record identifier.
 * @param id, Required. The record identifier of the Event you wish to get organizers for.
 * @return JSON with an object with key 'organizers' pointing to an array of the Organization records, or a JSON error object.
 */
exports.listOrganizers = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id || data.id == "") {
		return res.status(400).send({"error": "You must include the id for the event you want to get the organizers for"});
	}

	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				var query = "SELECT organizations.* FROM organizations ";
				query += "left join event_organizers on organizations.id = event_organizers.organizationid ";
				query += "left join events on event_organizers.eventid = events.id ";
				query += "WHERE events.id=?";

				db.get().query(query, [res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error retrieving event organizer records"});
					} else {
						var organizers = [];
						if (rows2.length > 0) {
							for (var i=0; i<rows2.length; i++) {
								var next = rows2[i];

								var organizer = {};
								organizer.id = next["id"];
								organizer.timecreated = next["timecreated"];
								organizer.uniqueid = next["uniqueid"];
								organizer.name = next["name"];
								organizer.email = next["email"];
								organizer.streetaddress = next["streetaddress"];
								organizer.locality = next["locality"];
								organizer.region = next["region"];
								organizer.country = next["country"];
								organizer.postcode = next["postcode"];
								organizer.pobox = next["pobox"];

								organizers.push(organizer);
							}
						}

						res.send({"organizers": organizers});
					}
				});
			}
		}
	});
}

/** EVENT SPONSOR FUNCTIONS **/

/**
 * Add a sponsor (Organization) to an Event record.
 * @param id, Required. The record identifier of the Event you wish to add a sponsor to.
 * @param organizationid, Required. The record identifier of the Organization you wish to add as a sponsor of the Event.
 * @return JSON object representing the new association between the Organization (sponsor) and the Event.
 */
exports.addSponsor = function(req, res, next) {

	var data = matchedData(req);

	if (!data.id || !data.organizationid) {
		return res.status(400).send({"error": "You must include the id for the event you want to add a sponsor to and the organization id you want to add as a sponsor"});

	}

	res.locals.id = "";
	res.locals.timecreated = "";
	res.locals.eventid = data.id;
	res.locals.organizationid = data.organizationid;

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				// check eventid exists and is owned by the current user
				db.get().query('SELECT events.* from events where events.userid=? and events.id=?', [req.user.id, res.locals.eventid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching event record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No event record found with the given id for the currently logged in user"});
						} else {
							// check organization record exists and is owned by the current user
							db.get().query('SELECT organizations.* from organizations where organizations.userid=? and organizations.id=?', [req.user.id, res.locals.organizationid], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error fetching organization record"});
								} else {
									if (rows3.length == 0) {
										res.status(404).send({error: "No organization record found with the given id for the currently logged in user"});
									} else {

										// check badge not used
										var selectquery = 'SELECT badge_issued.id from badge_issued left join criteria on badge_issued.badgeid = criteria.badgeid ';
										selectquery += 'left join criteria_events on criteria.id = criteria_events.criteriaid ';
										selectquery += 'left join events on criteria_events.eventid = events.id ';
										selectquery += 'where events.id=? and badge_issued.status in ("issued","revoked")';

										db.get().query(selectquery, [res.locals.eventid], function (err3, rows3) {
											if (err3) {
												console.log(err3);
												res.status(404).send({error: "Error checking if event has been used in an issued badge"});
											} else {
												if (rows3.length > 0) {
													res.status(404).send({error: "This event record has been used in an issue a badge and therefore can't be edited"});
												} else {
													var time = Math.floor((new Date().getTime()) / 1000);
													res.locals.timecreated = time;

													var insertquery = "INSERT INTO event_sponsors (userid, timecreated, eventid, organizationid) VALUES (?,?,?,?)";
													var params = [req.user.id, time, res.locals.eventid, res.locals.organizationid];

													db.get().query(insertquery, params, function(err4, results4) {
														if (err4) {
															console.log(err4);
															res.status(404).send({error: "Error creating event sponsor association record."});
														} else {
															console.log("event sponsor association record created");
															res.locals.id = results4.insertId;
															var reply = {
																 id: res.locals.id,
																 timecreated: res.locals.timecreated,
																 eventid: res.locals.eventid,
																 organizationid: res.locals.organizationid,
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
		}
	});
}

/**
 * Remove a sponsor (Organization) from an Event.
 * @param id, Required. The record identifier of the Event you wish to remove a sponsor from.
 * @param organizationid, Required. The record identifier of the Organization you wish to remove as a sponsor of the Event.
 * @return JSON object with the properties, 'id', 'organizationid' and 'status' which is set to -1 to indicate the deletion of the association.
 */
exports.removeSponsor = function(req, res, next) {

	var data = matchedData(req);

	if (!data.id || !data.organizationid) {
		return res.status(400).send({"error": "You must include the id for the event you want to remove a sponsor from and the organization id you want to remove as a sponsor"});
	}

	res.locals.id = "";
	res.locals.timecreated = "";
	res.locals.eventid = data.id;
	res.locals.organizationid = data.organizationid;

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				// check eventid exists and is owned by the current user
				db.get().query('SELECT events.* from events where events.userid=? and events.id=?', [req.user.id, res.locals.eventid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching event record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No event record found with the given id for the currently logged in user"});
						} else {
							// check organization record exists and is owned by the current user
							db.get().query('SELECT organizations.* from organizations where organizations.userid=? and organizations.id=?', [req.user.id, res.locals.organizationid], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error fetching organization record"});
								} else {
									if (rows3.length == 0) {
										res.status(404).send({error: "No organization record found with the given id for the currently logged in user"});
									} else {

										// check badge not used
										var selectquery = 'SELECT badge_issued.id from badge_issued left join criteria on badge_issued.badgeid = criteria.badgeid ';
										selectquery += 'left join criteria_events on criteria.id = criteria_events.criteriaid ';
										selectquery += 'left join events on criteria_events.eventid = events.id ';
										selectquery += 'where events.id=? and badge_issued.status in ("issued","revoked")';

										db.get().query(selectquery, [res.locals.eventid], function (err3, rows3) {
											if (err3) {
												console.log(err3);
												res.status(404).send({error: "Error checking if event has been used on an issued badge"});
											} else {
												if (rows3.length > 0) {
													res.status(404).send({error: "This event record has been used on an issued badge and therefore can't be changed"});
												} else {
													var time = Math.floor((new Date().getTime()) / 1000);
													res.locals.timecreated = time;

													var deletequery = "DELETE from event_sponsors where userid=? and eventid=? and organizationid=?";
													var params = [req.user.id, res.locals.eventid, res.locals.organizationid];

													db.get().query(deletequery, params, function(err4, results4) {
														if (err4) {
															console.log(err4);
															res.status(404).send({error: "Error removing event sponsor association record."});
														} else {
															console.log("event sponsor association record remove");

															var reply = {
																 id: res.locals.badgeid,
																 alignmentid: res.locals.alignmentid,
																 status: -1
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
		}
	});
}

/**
 * Get a list of all the sponsors (Organization records) for the Event with the given record identifier.
 * @param id, Required. The record identifier of the Event you wish to get sponsors for.
 * @return JSON with an object with key 'sponsor' pointing to an array of the Organization records, or a JSON error object.
 */
exports.listSponsors = function(req, res, next) {

	var data = matchedData(req);
	if (!data.id || data.id == "") {
		return res.status(400).send({"error": "You must include the id for the event you want to get the sponsors for"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				var query = "SELECT organizations.* FROM organizations ";
				query += "left join event_sponsors on organizations.id = event_sponsors.organizationid ";
				query += "left join events on event_sponsors.eventid = events.id ";
				query += "WHERE events.id=?";

				db.get().query(query, [data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error retrieving event sponsor records"});
					} else {
						var sponsors = [];
						if (rows2.length > 0) {
							for (var i=0; i<rows2.length; i++) {
								var next = rows2[i];

								var sponsor = {};
								sponsor.id = next["id"];
								sponsor.timecreated = next["timecreated"];
								sponsor.uniqueid = next["uniqueid"];
								sponsor.name = next["name"];
								sponsor.email = next["email"];
								sponsor.streetaddress = next["streetaddress"];
								sponsor.locality = next["locality"];
								sponsor.region = next["region"];
								sponsor.country = next["country"];
								sponsor.postcode = next["postcode"];
								sponsor.pobox = next["pobox"];

								sponsors.push(sponsor);
							}
						}

						res.send({sponsors: sponsors});
					}
				});
			}
		}
	});
}



/** EVENT RECIPIENT PERMISSIONS **/

/**
 * Get the page to manage Recipient permissions against an Event.
 * @return HTML Page to manage Recipient permissions against an Event.
 */
exports.getRecipientPermssionsPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				res.render('manageeventpermissions', { protocol: cfg.protocol, domain: cfg.domain, title: "Recipient Event Permissions"});
			}
		}
	});
}

/**
 * Get a list of all Event records for the currently logged in issuer (who is not the owner of the records).
 * @return JSON with an object with key 'events' pointing to an array of the Event records, or a JSON error object.
 */
exports.listIssuerEvents = function(req, res, next) {

	res.locals.events = [];

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send("The currently logged in user does not have permissions to perform this action");
			} else {
				var query = "SELECT DISTINCT events.* FROM events ";
				query += "left join criteria_events on events.id = criteria_events.eventid "
				query += "left join criteria on criteria.id = criteria_events.criteriaid "
				query += "left join badges on badges.id = criteria.badgeid "
				query += "left join issuers on badges.issuerid = issuers.id "
				query += "left join users on issuers.loginuserid = users.id "
				query += "WHERE users.id=?";
				db.get().query(query, [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error retrieving event records"});
					} else {
						if (rows2.length > 0) {
							var i=0;
							function loop() {
								var next = rows2[i];

								res.locals.events[i] = {};
								res.locals.events[i].id = next["id"];
								res.locals.events[i].timecreated = next["timecreated"];
								res.locals.events[i].uniqueid = next["uniqueid"];
								res.locals.events[i].name = next["name"];
								res.locals.events[i].description = next["description"];
								res.locals.events[i].startdate = next["startdate"];
								res.locals.events[i].enddate = next["enddate"];

								res.locals.events[i].location_name = next["location_name"];
								res.locals.events[i].location_pobox = next["location_pobox"];
								res.locals.events[i].location_streetaddress = next["location_streetaddress"];
								res.locals.events[i].location_locality = next["location_locality"];
								res.locals.events[i].location_region = next["location_region"];
								res.locals.events[i].location_country = next["location_country"];
								res.locals.events[i].location_postcode = next["location_postcode"];

								var selectquery = 'SELECT badge_issued.id from badge_issued left join criteria on badge_issued.badgeid = criteria.badgeid ';
								selectquery += 'left join criteria_events on criteria.id = criteria_events.criteriaid ';
								selectquery += 'left join events on criteria_events.eventid = events.id ';
								selectquery += 'where events.id=? and badge_issued.status in ("issued","revoked")';

								db.get().query(selectquery, [next["id"]], function (err3, rows3) {
									if (err3) {
										console.log(err3);
										return res.status(404).send({error: "Error checking event record not used to issue a badge"});
									} else {
										if (rows3.length > 0) {
											res.locals.events[i].usedInIssuance = true;
										} else {
											res.locals.events[i].usedInIssuance = false;
										}
										i++;
										if( i < rows2.length) {
											loop();
										} else {
											res.send({events: res.locals.events});
										}
									}
								});
							}
							loop();
						} else {
							res.send({events: res.locals.events});
						}
					}
				});
			}
		}
	});
}


/**
 * Create multiple Recipient Event permission records for if the Recipients allows their name to be displayed on the Event leaderboard. Using a cvs file uploaded.
 * @param eventid, Required. The record identifier of the Event you wish to add Recipient permissions for.
 * @return JSON object with 'recipients', 'recipientsmissed' and 'recipientsduplicates' properties.
 */
exports.createBulkRecipientPermissions = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.eventid || data.eventid == "") {
		return res.status(400).send({error: "You must include the id of the event you want to upload bulk recipient permissions for"});
	}

	let recipientdata = [];

	if (!req.files) {
		return res.status(400).send('No event recipient premissions data file was uploaded.');
	} else if (!req.files.recipientdatafile) {
		return res.status(400).send({error: "You must include an recipient event permissions data file for the new recipients you wish to add"});
	} else {
		let datafile = req.files.recipientdatafile;

		var folderpath = cfg.directorpath + "uploads/" + "user_" + req.user.id + "/";

		var path = folderpath + datafile.name;
		if (!fs.existsSync(folderpath)) {
			fs.mkdirSync(folderpath);
		}
		datafile.mv(path, function(err) {
			if (err) {
				return res.status(404).send({error: err});
			}

			fs.createReadStream(path)
				.pipe(csv())
				.on('data', (row) => {
					/*
					{
					'name': 'John Snow',
					'email': 'jsnow@open.ac.uk',
					'canshowname': 'Yes/No'
					}
					*/
					//console.log(row);
					recipientdata.push(row);
				})
				.on('headers', (headers) => {
					console.log(headers);
				})
				.on('end', () => {
					console.log('CSV file successfully processed');
					console.log(res.locals.recipientdata);

					var handler = function(err, reply) {
						if (err && err.message && err.message != "") {
							res.status(404).send({error: err.message});
						} if (reply) {
							res.send(reply);
						} else {
							res.status(404).send({error: "Unknown Error"});
						}
					}

					processRecipientPermissions(recipientdata, req.user.id, data.eventid, handler);
				})
				.on('error', (error) => {
					console.log('CSV file error');
					console.log(error);
					return res.status(400).send({error: "An error occurred parsing the recipient event permission data file."});
				});
		});
	}
}


function processRecipientPermissions(recipientdata, userid, eventid, handler) {

	// should never need this as the check is done in the routes
	if (!eventid || eventid == "") {
		handler(new Error("You must include the id of the event you want to upload bulk recipient permissions for"));
	}

	let pendingrecipients = [];

	var count = recipientdata.length;
	for (var i=0; i<count; i++) {
		var item = recipientdata[i];

		pendingrecipients[i] = {};

		pendingrecipients[i].name = "";
		if (item.name) {
			pendingrecipients[i].name = item.name;
		}
		pendingrecipients[i].email = "";
		if (item.email) {
			pendingrecipients[i].email = item.email;
		}
		pendingrecipients[i].canshowname = 0;
		if (item.canshowname) {
			pendingrecipients[i].canshowname = item.canshowname;
		}
	}

	let reply = {}
	reply.recipients = [];
	reply.recipientsmissed = [];
	reply.recipientsduplicates = [];

	//console.log(pendingrecipients[i]);
	var innerhandler = function(err, reply) {
		if (err && err.message && err.message != "") {
			handler(err);
		} else if (reply) {
			handler(null, reply);
		} else {
			handler(new Error("Unknown Error"));
		}
	}
	processRecipientPermission(pendingrecipients, reply, userid, eventid, 0, innerhandler);
}

function processRecipientPermission(pendingrecipients, reply, userid, eventid, index, handler) {

	if (index >= pendingrecipients.length) {
		handler(null, reply);
	} else {

		var item = pendingrecipients[index];

		if (!item || !item.name || !item.email || item.canshowname === 'undefined' || item.name == "" || item.email == "" || item.canshowname == "") {
			reply.recipientsmissed.push(item);
			index++;
			processRecipientPermission(pendingrecipients, reply, userid, eventid, index, handler);
		} else {
			db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("admin", "super", "issuer")', [userid], function (err, rows) {
				if (err) {
					console.log(err);
					handler(new Error("Error fetching user permissions"));
				} else {
					if (rows.length == 0) {
						handler(new Error("The logged in user account does not have the correct permissions to perform this action."));
					} else {
						db.get().query('SELECT * from recipients where name=? AND email=? AND userid=?', [item.name, item.email, userid], function (err3, rows3) {
							if (err3) {
								console.log(err3);
								handler(new Error("Error checking recipient record exists"));
							} else {
								if (rows3.length <= 0) {
									reply.recipientsmissed.push(item);
									index++;
									processRecipientPermission(pendingrecipients, reply, userid, eventid, index, handler);
								} else {
									var recipientid = rows3[0].id;

									db.get().query('SELECT * from event_recipient_permissions where recipientid=? AND eventid=?', [recipientid, eventid], function (err2, rows2) {
										if (err2) {
											console.log(err2);
											handler(new Error("Error checking if record exists"));
										} else {
											if (rows2.length > 0) {
												reply.recipientsduplicates.push(item);
												index++;
												processRecipientPermission(pendingrecipients, reply, userid, eventid, index, handler);
											} else {

												let time = Math.floor((new Date().getTime()) / 1000);
												let canshowname = 0;
												if (item.canshowname == 'Yes' || item.canshowname == 'yes' || item.canshowname == 'true' || item.canshowname == 1) {
													canshowname = 1;
												}

												var insertquery = 'INSERT INTO event_recipient_permissions (userid, timecreated, eventid, recipientid, canshowname) VALUES (?,?,?,?,?)';
												var params = [
													userid,
													time,
													eventid,
													recipientid,
													canshowname
												];
												db.get().query(insertquery, params, function(err4, result4) {
													if (err4) {
														console.log(err4);
														handler(new Error("Error saving event recipient permission"));
													} else {
														console.log("event recipient permission saved");
														//item.id = result4.insertId;
														reply.recipients.push(item);
														index++;
														processRecipientPermission(pendingrecipients, reply, userid, eventid, index, handler)
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
}

/**
 * Create a Recipient Event permission record for if the Recipient allows their name to be displayed on the Event leaderboard.
 * @param eventid, Required. The record identifier of the Event you wish to add Recipient permissions for.
 * @param recipientid, Required. The record identifier of the Recipient you wish to add Recipient permissions for.
 * @param canshowname, Required. 0/1 or true/false. 1/true if the Recipient allows their name on the leaderboard, 0/false if not.
 * @return JSON with an object holding the Recipient Event permission record, or a JSON error object.
 */
exports.addRecipientPermission = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);

	//console.log(data);

	// should never need this as the check is done in the routes
	if (!data.eventid || data.eventid == ""
			|| !data.recipientid || data.recipientid == ""
			|| data.canshowname  === 'undefined') {
		return res.status(400).send({error: "You must include the id of the event, the recipientid and the canshowname properties for the new event recipient permission you want to add"});
	}

	res.locals.eventid = data.eventid;
	res.locals.recipientid = data.recipientid;
	res.locals.canshowname = data.canshowname;
	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;
	res.locals.id = "";

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("admin", "super", "issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				db.get().query('SELECT * from event_recipient_permissions where recipientid=? AND eventid=?', [res.locals.recipientid, res.locals.eventid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error checking if record exists"});
					} else {
						if (rows2.length > 0) {
							return res.status(404).send({error: "The given recipient already has an entry for the given event."});
						} else {
							var insertquery = 'INSERT INTO event_recipient_permissions (userid, timecreated, eventid, recipientid, canshowname) VALUES (?,?,?,?,?)';
							var params = [
								req.user.id,
								res.locals.timecreated,
								res.locals.eventid,
								res.locals.recipientid,
								res.locals.canshowname
							];
							db.get().query(insertquery, params, function(err3, result3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error saving event recipient permission"});
								} else {
									console.log("event recipient permission saved");
									res.locals.id = result3.insertId;

									var reply = {
										id: res.locals.id,
										timecreated: res.locals.timecreated,
										eventid: res.locals.eventid,
										recipientid: res.locals.recipientid,
										canshowname: res.locals.canshowname
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

/**
 * Update a Recipient Event permission record.
 * @param id, Required. The record identifier of the Recipient Event permission record you wish to update.
 * @param canshowname, Required. 0/1 or true/false. 1/true if the Recipient allows their name on the leaderboard, 0/false if not.
 * @return JSON with an object with key 'events' pointing to an array of the Event records, or a JSON error object.
 */
exports.updateRecipientPermission = function(req, res, next) {
	// check the currently logged in user holds the role admin, super or issuer.
	var data = matchedData(req);
	//console.log(data);

	// should never need this as the check is done in the routes
	if (!data.id || data.id == "" || data.canshowname === 'undefined') {
		return res.status(400).send({error: "You must include the id of the record you want to update and the canshowname property you want to change against that record"});
	}

	res.locals.id = data.id;
	res.locals.canshowname = data.canshowname;

	res.locals.timecreated = "";
	res.locals.eventid = "";
	res.locals.recipientid = "";

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("super","admin","issuer") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({error: "The logged in user account does not have the correct permissions to create a badge."});
			} else {
				db.get().query('SELECT event_recipient_permissions.* from event_recipient_permissions where event_recipient_permissions.userid=? and event_recipient_permissions.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error fetching event recipient permission record"});
					} else {
						if (rows2.length == 0) {
							return res.status(404).send({error: "No event recipient permission record found with the given id for the currently logged in user"});
						} else {
							res.locals.timecreated = rows2[0].timecreated;
							res.locals.eventid = rows2[0].eventid;
							res.locals.recipientid = rows2[0].recipientid;

							if (res.locals.canshowname == true || res.locals.canshowname == false) {
								var updatequery = "UPDATE event_recipient_permissions set canshowname=? ";
								updatequery += "WHERE userid=? AND id=?";

								var params = [];
								params.push(res.locals.canshowname);
								params.push(req.user.id);
								params.push(res.locals.id);

								db.get().query(updatequery, params, function(err4, results4) {
									if (err4) {
										console.log(err4);
										res.status(404).send({error: "Error updating event record."});
									} else {
										console.log("event record updated");
										var reply = {
											id: res.locals.id,
											timecreated: res.locals.timecreated,
											eventid: res.locals.eventid,
											recipientid: res.locals.recipientid,
											canshowname: res.locals.canshowname
										};

										res.send(reply);
									}
								});
							} else {
								var reply = {
									id: res.locals.id,
									timecreated: res.locals.timecreated,
									eventid: res.locals.eventid,
									recipientid: res.locals.recipientid,
									canshowname: res.locals.canshowname
								};

								res.send(reply);
							}
						}
					}
				});
			}
		}
	});
}

/**
 * Delete a Recipient Event permission record.
 * @param id, Required. The record identifier of the Recipient Event permission record you wish to delete.
 * @return JSON with the id of the Recipient Event permission record that was deleted and a status property of -1, or a JSON error object.
 */
exports.deleteRecipientPermission = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({error: "You must include the id of the event recipient permission you want to delete"});
	}

	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin", "issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(403).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT event_recipient_permissions.* FROM event_recipient_permissions WHERE event_recipient_permissions.userid=? and event_recipient_permissions.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error fetching event recipient permission record"});
					} else {
						if (rows2.length == 0) {
							return res.status(404).send({error: "No event recipient permission record found with the given id for the currently logged in user"});
						} else {
							var deletequery = "DELETE from event_recipient_permissions WHERE id=?";
							var params = [res.locals.id];

							db.get().query(deletequery, params, function(err4, results4) {
								if (err4) {
									console.log(err4);
									return res.status(404).send({error: "Error deleting event recipient permission record."});
								} else {
									console.log("event recipient permission record deleted");

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
 * Get a list of all Recipient Event permission records for the currently logged in issuer.
 * @return JSON with an object with key 'items' pointing to an array of the Recipient Event permission records, or a JSON error object.
 */
exports.listRecipientPermissions = function(req, res, next) {

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				var query = "SELECT event_recipient_permissions.* FROM event_recipient_permissions ";
				query += "WHERE event_recipient_permissions.userid=? order by id DESC";

				db.get().query(query, [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error retrieving event recipient permission records"});
					} else {
						var records = [];
						if (rows2.length > 0) {
							for (var i=0; i<rows2.length; i++) {
								var next = rows2[i];

								var record = {};
								record.id = next["id"];
								record.timecreated = next["timecreated"];
								record.eventid = next["eventid"];
								record.recipientid = next["recipientid"];
								record.canshowname = next["canshowname"];

								records.push(record);
							}
						}

						res.send({items: records});
					}
				});
			}
		}
	});
}