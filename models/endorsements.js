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

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const endorser_model = require('../models/endorsers');

const { matchedData } = require('express-validator/filter');


// EXTERNALL CALLED FROM ROUTES //

/**
 * Add an Endorsement request entry to the database for the given item and endorser
 * @param itemid, Required. The identifier of the item to add an Endorsement request record for.
 * @param itemtype, Required. The identifier of the item type of the item to add an Endorsement request records for.
 * @param endorserid, Required. The identifier of the Endorser to add an Endorsement request records for.
 */
 // Not used yet - will be top level routed function eventually
exports.addEndorsementRequest = function(req, res, next) {

	var data = matchedData(req);

	// check all expected variables exist
	if (!data.itemtype || data.itemtype == "") {
		return res.status(400).send({"error": "You must include the record id for the item you want to add an endorsement request for"});
	}
	if (!data.itemtype || data.itemtype == "") {
		return res.status(400).send({"error": "You must include the item type for the item you want to add an endorsement request for"});
	}
	if (!data.endorserid || data.endorserid == "") {
		return res.status(400).send({"error": "You must include the endorser record id for the item you want to add an endorsement request for"});
	}

	res.locals.record = {};

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error":"Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action."});
			} else {
				var endorsementrequesthandler = function (err, badgeendorsement) {
					if (err && err.message) {
						res.status(404).send({"error": err.message});
					} else {
						res.send(badgeendorsement);
					}
				}
				localAddEndorsementRequest(req.user.id, data.itemid, data.itemtype, data.endorserid, endorsementrequesthandler);
			}
		}
	});
}

/**
 * Get a Endorsement type record in Open Badge JSONLD format by it's record identifier.
 * @param id, Required. The identifier of the Endorsement record you wish to retrieve.
 * @return Open Badge JSONLD of the Endorsement data, or a JSON error object.
 */
exports.getHostedEndorsementJSONByUniqueId = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist
	if (!data.id) {
		return res.status(400).send({"error": "You must include the unique id for the endorsement you want to view the JSON data for"});
	}

	var query = 'SELECT badge_endorsement.*, endorsers.uniqueid as endorseruniqueid, endorsers.id as endorserid, badges.uniqueid as badgesuniqueid FROM badge_endorsement '
	query += 'LEFT JOIN endorsements ON badge_endorsement.endorsementid = endorsements.id ';
	query += 'LEFT JOIN endorsement_claims ON endorsement_claims.endorsementsid = endorsements.id ';
	query += 'LEFT JOIN endorsers ON badge_endorsement.endorserid = endorsers.id ';
	query += 'LEFT JOIN badges ON endorsements.itemid = badges.id ';
	query += 'WHERE badge_endorsement.uniqueid=? LIMIT 1';

	db.get().query(query, [data.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({"error": "Error retrieving endorsement record"});
		} else {
			if (rows.length > 0) {
				var innerhandler = function(err, endorsementjson) {
					if (err && err.message != "") {
						res.status(404).send({"error": err.message});
					} else if (endorsementjson) {
						res.send(endorsementjson);
					} else {
						res.send({});
					}
				}
				createHostedEndorsementJSON(rows[0], true, innerhandler);
			} else {
				res.send({});
			}
		}
	});
}


// CALLED FROM OTHER MODELS //

/**
 * Add the IoC Endorsement entries to the database for the given badgeid
 * @param badgeid, Required. The identifier of the Badge to add an IoC Endorsement for.
 */
 // Not routed, only for other models to call
exports.addIoCEndorsementForBadge = function(userid, badgeid, issuedon, handler) {

	// check all expected variables exist
	if (!badgeid || badgeid == "") {
		handler(new Error("You must include the badge id for the badge you want to add an IoC endorsement for"));
	} else {
		let query = 'SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer","endorser")';
		db.get().query(query, [userid], function (err, rows) {
			if (err) {
				console.log(err);
				handler(new Error("Error fetching user permissions"));
			} else {
				if (rows.length == 0) {
					handler(new Error("The currently logged in user does not have permissions to perform this action."));
				} else {
					// get endorser id from uniqueid
					db.get().query('SELECT * from endorsers where uniqueid=?', [cfg.IoCEndorser], function (err2, rows2) {
						if (err2) {
							console.log(err2);
							handler(new Error("Error fetching endorser by record id"));
						} else {
							if (rows2.length == 0) {
								handler(new Error("There is no endorser record with the given record id."));
							} else if (rows2.length > 0) {
								// check item id exists for the type specified

								var endorserid = rows2[0].id;

								var endorsementrequesthandler = function (err, badgeendorsement) {
									if (err && err.message) {
										handler(err);
									} else {
										var endorsementclaimhandler = function(err2, endorsement) {
											if (err2 && err2.message) {
												handler(err2);
											} else {
												handler(null, endorsement);
											}
										}
										localAddEndorsementClaim(userid, badgeendorsement.id, badgeendorsement.itemid, badgeendorsement.itemtype, issuedon, cfg.VERIFICATION_TYPE_HOSTED, cfg.IoCEndorsementClaim, endorsementclaimhandler);
									}
								}
								localAddEndorsementRequest(userid, badgeid, cfg.ENDORSEMENT_TYPE_BADGE, endorserid, endorsementrequesthandler);
							}
						}
					});
				}
			}
		});
	}
}

/**
 * Add the Endorsement entries from the database for the given badgeid
 * @param badgeid, Required. The identifier of the Badge to remove Endorsements for.
 */
 // Not routed, only for other models to call
exports.removeEndorsementsForBadge = function(userid, badgeid, handler) {

	// check all expected variables exist
	if (!badgeid || badgeid == "") {
		handler(new Error("You must include the badge id for the badge you want to remove badge endorsements for"));
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer","endorser")', [userid], function (err, rows) {
		if (err) {
			console.log(err);
			handler(new Error("Error fetching user permissions"));
		} else {
			if (rows.length == 0) {
				handler(new Error("The currently logged in user does not have permissions to perform this action."));
			} else {
				let localhandler = function(err, reply) {
					if (err && err.message != "") {
						handler(err);
					} else {
						handler(err, reply);
					}
				}

				localRemoveEndorsementRequests(badgeid, cfg.ENDORSEMENT_TYPE_BADGE, localhandler);
			}
		}
	});
}

// to be called by other models not from a route.
exports.getHostedBadgeEndorsementJSONByBadgeID = function(badgeid, badgehosted, handler) {

	// hosted variable needed to create the correct badge callback url.
	// The endorsement might be hosted, but the badge it endorses might be a blockchain badge without /hosted/ in the path for the uri

	// check all expected variables exist
	if (!badgeid || badgeid == "") {
		handler(new Error("You must include the unique id for the endorsement you want to get the JSON data for"));
	}

	console.log("badgehosted:"+badgehosted);

	var query = 'SELECT badge_endorsement.*, endorsers.uniqueid as endorseruniqueid, endorsers.id as endorserid, badges.uniqueid as badgesuniqueid FROM badge_endorsement '
	query += 'LEFT JOIN endorsements ON badge_endorsement.endorsementid = endorsements.id ';
	query += 'LEFT JOIN endorsement_claims ON endorsement_claims.endorsementsid = endorsements.id ';
	query += 'LEFT JOIN endorsers ON badge_endorsement.endorserid = endorsers.id ';
	query += 'LEFT JOIN badges ON endorsements.itemid = badges.id ';
	query += 'WHERE badges.id=?';
	query += ' AND badge_endorsement.itemtype="'+cfg.ENDORSEMENT_TYPE_BADGE+'"';
	//query += '(endorsements.verificationtype = "'+cfg.VERIFICATION_TYPE_HOSTED+'" OR badge_endorsement.status="'+cfg.ISSUED_STATUS_ISSUED+'")';

	db.get().query(query, [badgeid], function (err, rows) {
		if (err) {
			console.log(err);
			handler(new Error("Error retrieving endorsement record"));
		} else {
			if (rows.length > 0) {
				var innerhandler = function(err, endorsementjson) {
					if (err && err.message != "") {
						handler(err)
					} else if (endorsementjson) {
						handler(null, endorsementjson);
					} else {
						handler(null, {});
					}
				}
				createHostedEndorsementJSON(rows[0], badgehosted, innerhandler);

			} else {
				handler(null, {});
			}
		}
	});
}

// HELPER FUNCTIONS //

/**
 * Add an Endorsement request entry to the database for the given item and endorser
 * @param userid, Required. The identifier of the user who will own the record.
 * @param itemid, Required. The identifier of the item to add an Endorsement request record for.
 * @param itemtype, Required. The identifier of the item type of the item to add an Endorsement request records for (badge, recipient, assertion).
 * @param endorserid, Required. The identifier of the Endorser to add an Endorsement request records for.
 * @param handler, Required. The handler to call when complete passing back either an error or a record object.
 */
function localAddEndorsementRequest(userid, itemid, itemtype, endorserid, handler) {

	var types = [cfg.ENDORSEMENT_TYPE_BADGE, cfg.ENDORSEMENT_TYPE_ASSERTION, cfg.ENDORSEMENT_TYPE_RECIPIENT];

	// check all expected variables exist
	if (!userid || userid == "") {
		handler(new Error("You must include the record id for the user who will own the new record"));
	}
	if (!itemid || itemid == "") {
		handler(new Error("You must include the record id for the item you want to add an endorsement request for"));
	}
	if (!itemtype || itemtype == "" || !types.includes(itemtype)) {
		handler(new Error("You must include the item type for the item you want to add an endorsement request for and it must match a known type"));
	}
	if (!endorserid || endorserid == "") {
		handler(new Error("You must include the endorser record id for the item you want to add an endorsement request for"));
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","issuer")', [userid], function (err, rows) {
		if (err) {
			console.log(err);
			handler(new Error("Error fetching user permissions"));
		} else {
			if (rows.length == 0) {
				handler(new Error("The given user does not have permissions to perform this action."));
			} else {
				// check the endorserid exists
				db.get().query('SELECT * from endorsers where id=?', [endorserid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						handler(new Error("Error fetching endorser by record id"));
					} else {
						if (rows2.length == 0) {
							handler(new Error("There is no endorser record with the given record id."));
						} else if (rows2.length > 0) {
							// check item id exists for the type specified
							let query = "";
							if (itemtype == cfg.ENDORSEMENT_TYPE_BADGE) {
								query = 'SELECT * from badges where id=?';
							} else if (itemtype == cfg.ENDORSEMENT_TYPE_ASSERTION) {
								query = 'SELECT * from badge_issued where id=?';
							} else if (itemtype == cfg.ENDORSEMENT_TYPE_RECIPIENT) {
								query = 'SELECT * from recipients where id=?';
							} else {
								// should never get here
								handler(new Error("Error unknown item type given"));
							}

							db.get().query(query, [itemid], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									handler(new Error("Error fetching item by record id"));
								} else {
									if (rows3.length == 0) {
										handler(new Error("There is no item record with the given item record id for the specified item type."));
									} else if (rows3.length > 0) {
										let timecreated = Math.floor((new Date().getTime()) / 1000);
										let uniqueid = web3.utils.sha3("endorsement_" + timecreated);

 										// create the badge_endorsement database entry.
										var insertqueryendorsement = 'Insert into badge_endorsement (userid, timecreated, uniqueid, endorserid, itemid, itemtype) VALUE (?,?,?,?,?,?)';
										var paramsendorsement = [userid, timecreated, uniqueid, endorserid, itemid, itemtype];
										db.get().query(insertqueryendorsement, paramsendorsement, function(err4, results4) {
											if (err4) {
												console.log(err4);
												handler(new Error("Error creating badge endorsement request entry."));
											} else {
												console.log("badge endorsement request entry saved");
												var record = {}
												record.id = results4.insertId;
												record.timecreated = timecreated;
												record.uniqueid = uniqueid;
												record.endorserid = endorserid;
												record.itemid = itemid;
												record.itemtype = itemtype;
												record.status = cfg.ISSUED_STATUS_PENDING;

												handler(null, record);
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
 * Remove an Endorsement request entry from the database for the given item
 * @param userid, Required. The identifier of the user who will own the record.
 * @param itemid, Required. The record identifier of the item to remove endorsements for.
 * @param itemtype, Required. The type of record the item is (cfg.ENDORSEMENT_TYPE_BADGE, cfg.ENDORSEMENT_TYPE_ASSERTION, cfg.ENDORSEMENT_TYPE_RECIPIENT).
 * @param handler, Required. The handler to call when complete passing back either an error or a record object.
 */
function localRemoveEndorsementRequests(itemid, itemtype, handler) {

	if (!itemid || itemid=="" || !itemtype || itemtype == "") {
		handler(new Error("You must include the item id and the item type you want to delete endorsements for"));
	}

	var deletequeryendorsement = 'delete from endorsements where itemid=? and itemtype=?';
	var paramsendorsement = [itemid, itemtype];
	db.get().query(deletequeryendorsement, paramsendorsement, function(err3, results3) {
		if (err3) {
			console.log(err3);
			handler(new Error("Error deleting badge endorsement entry."));
		} else {
			console.log("endorsement entries deleted");

			// These records may not exist for badges that can be deleted (not issued yet),
			// but does not hurt to do it anyway in case.
			// delete the badge_endorsement database entry.
			var deletequerybadgeendorsement = 'delete from badge_endorsement where itemid=? and itemtype=?';
			var paramsbadgeendorsement = [itemid, itemtype];
			db.get().query(deletequerybadgeendorsement, paramsbadgeendorsement, function(err4, results4) {
				if (err4) {
					console.log(err4);
					handler(new Error("Error deleting badge endorsement entries."));
				} else {
					console.log("badge endorsement entries deleted");

					var record = {}
					record.itemid = itemid;
					record.itemtype = itemtype;
					record.status = -1;

					handler(null, record);
				}
			});
		}
	});
}

/**
 * Add an Endorsement claim to a pending endorsement
 * @param userid, Required. The identifier of the user who will own the record - should be the endorser making the claim.
 * @param badgeendorsementid, Required. The identifier of the badge endorsement request record that this claim will go against.
 * @param itemid, Required. The identifier of the item to add an Endorsement claim for.
 * @param itemtype, Required. The identifier of the item type of the item to add an Endorsement claim for (badge, recipient, assertion).
 * @param issuedon, Required. The timestamp to put in the issuedon field.
 * @param verificationtype, Required. The verification type to put in the verificationtype field (cfg.VERIFICATION_TYPE_HOSTED or cfg.VERIFICATION_TYPE_BLOCKCHAIN).
 * @param claim, Required. The claim text of the claim the endorser is making.
 * @param handler, Required. The handler to call when complete passing back either an error or a record object.
 */
function localAddEndorsementClaim(userid, badgeendorsementid, itemid, itemtype, issuedon, verificationtype, claim, handler) {

	var types = [cfg.ENDORSEMENT_TYPE_BADGE, cfg.ENDORSEMENT_TYPE_ASSERTION, cfg.ENDORSEMENT_TYPE_RECIPIENT];

	// check all expected variables exist
	if (!userid || userid == "") {
		handler(new Error("You must include the record id for the user who will own the new record"));
	}
	if (!badgeendorsementid || badgeendorsementid == "") {
		handler(new Error("You must include the identifier of the badge endorsement request record that this claim will go against"));
	}
	if (!itemid || itemid == "") {
		handler(new Error("You must include the record id for the item you want to add an endorsement claim for"));
	}
	if (!itemtype || itemtype == "" || !types.includes(itemtype)) {
		handler(new Error("You must include the item type for the item you want to add an endorsement claim for and it must match a known type"));
	}
	if (!claim || claim == "") {
		handler(new Error("You must include the claim text for the claim that the endorser is making"));
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin","endorser")', [userid], function (err, rows) {
		if (err) {
			console.log(err);
			handler(new Error("Error fetching user permissions"));
		} else {
			if (rows.length == 0) {
				handler(new Error("The given user does not have permissions to perform this action."));
			} else {
				// check the badge endorsement record exists for id given
				db.get().query('SELECT * from badge_endorsement where id=?', [badgeendorsementid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						handler(new Error("Error fetching badge endorsement by record id"));
					} else {
						if (rows2.length == 0) {
							handler(new Error("There is no badge endorsement record with the given record id."));
						} else if (rows2.length > 0) {
							// check item id exists for the type specified
							let query = "";
							if (itemtype == cfg.ENDORSEMENT_TYPE_BADGE) {
								query = 'SELECT * from badges where id=?';
							} else if (itemtype == cfg.ENDORSEMENT_TYPE_ASSERTION) {
								query = 'SELECT * from badge_issued where id=?';
							} else if (itemtype == cfg.ENDORSEMENT_TYPE_RECIPIENT) {
								query = 'SELECT * from recipients where id=?';
							} else {
								// should never get here
								handler(new Error("Error unknown item type given"));
							}

							db.get().query(query, [itemid], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									handler(new Error("Error fetching item by record id"));
								} else {
									if (rows3.length == 0) {
										handler(new Error("There is no item record with the given item record id for the specified item type."));
									} else if (rows3.length > 0) {

										let timecreated = Math.floor((new Date().getTime()) / 1000);

 										// create the badge_endorsement database entry.
										var insertqueryendorsement = 'Insert into endorsements (userid, timecreated, itemid, itemtype, issuedon, verificationtype) VALUE (?,?,?,?,?,?)';
										var paramsendorsement = [userid, timecreated, itemid, itemtype, issuedon, verificationtype];
										db.get().query(insertqueryendorsement, paramsendorsement, function(err4, results4) {
											if (err4) {
												console.log(err4);
												handler(new Error("Error creating badge endorsement entry."));
											} else {
												console.log("badge endorsement entry saved");
												// now add the claim entry

												// at present we are just doing a cliam statement for an endorsement.
												//But in the future this could be extended to do multiple properties of different types.
												var insertqueryendorsementclaim = 'Insert into endorsement_claims (userid, timecreated, endorsementsid, property, value) VALUE (?,?,?,?,?)';
												var paramsendorsementclaim = [userid, timecreated, results4.insertId, "endorsementComment", claim];
												db.get().query(insertqueryendorsementclaim, paramsendorsementclaim, function(err5, results5) {
													if (err5) {
														console.log(err5);
														handler(new Error("Error creating badge endorsement claim entry."));
													} else {
														console.log("badge endorsement claim entry saved");

														// add the endorsementid to the badge_endorsement table.
														var updatequeryendorsement = 'Update badge_endorsement set endorsementid=?, status=? where id=?';
														var updateparamsendorsement = [results4.insertId, cfg.ISSUED_STATUS_ENDORSED, badgeendorsementid];
														db.get().query(updatequeryendorsement, updateparamsendorsement, function(err6, results6) {
															if (err6) {
																console.log(err6);
																handler(new Error("Error updating badge_endorsement for new endorsement id"));
															} else {
																console.log("badge_endorsement record updated for new updateparamsendorsement");

																var record = {}
																record.id = rows2[0].id;
																record.timecreated = rows2[0].timecreated;
																record.uniqueid = rows2[0].uniqueid;
																record.endorserid = rows2[0].endorserid;
																record.itemid = rows2[0].itemid;
																record.itemtype = rows2[0].itemtype;
																record.endorsementid = results4.insertId;
																record.status = cfg.ISSUED_STATUS_ENDORSED;
																handler(null, record);
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
		}
	});
}

function createHostedEndorsementJSON(endorsement, hosted, handler) {

	if (!endorsement.uniqueid || endorsement.uniqueid == ""
			|| !endorsement.id || endorsement.id == ""
			|| !endorsement.timecreated || endorsement.timecreated == ""
			|| !endorsement.endorseruniqueid || endorsement.endorseruniqueid == ""
			|| !endorsement.itemid || endorsement.itemid == ""
		) {
		handler(new Error("Missing endorsement data. Cannot create JSON"));
	} else {
		endorsementjson = {};
		endorsementjson["@context"] = "https://w3id.org/openbadges/v2";
		endorsementjson["type"] = "Endorsement";
		endorsementjson["id"] = cfg.uri_stub+"endorsements/hosted/"+endorsement.uniqueid;

		var dateobj = new Date(endorsement.timecreated*1000);
		var datestr = dateobj.toISOString();
		endorsementjson["issuedOn"] = datestr;

		var issuerhandler = function(err2, issuerjson) {

			//console.log("ISSUER JSON");
			//console.log(issuerjson);
			//console.log("ERROR");
			//console.log(err2);

			if (err2 && err2.message) {
				handler(err2);
			} else if (issuerjson) {
				if (hosted) {
					endorsementjson["issuer"] = cfg.uri_stub+"endorsers/hosted/"+endorsement.endorseruniqueid;
				} else {
					endorsementjson["issuer"] = issuerjson;
				}
			}
			endorsementjson["verification"] = {"type": "hosted"};

			var innerhandler = function(err, claimjson) {
				if (err && err.message) {
					handler(err);
				} else {
					if (claimjson && claimjson != null) {
						if (hosted) {
							claimjson["id"] = cfg.uri_stub+cfg.badges_path_stub+"hosted/"+endorsement.badgesuniqueid;
						} else {
							claimjson["id"] = cfg.uri_stub+cfg.badges_path_stub+endorsement.badgesuniqueid;
						}
						endorsementjson["claim"] = claimjson;
					}

					//console.log(endorsementjson);
					handler(null, endorsementjson);
				}
			}
			createEndorsementClaimJSON(endorsement.endorsementid, innerhandler);
		}
		endorser_model.getHostedEndorserOpenBadgeJSON(endorsement.endorserid, issuerhandler);
	}
}

function createEndorsementClaimJSON(endorsementid, handler) {

	if (!endorsementid || endorsementid == "" ) {
		handler(new Error("You must include the record id of the endrosement you want to get claim properties for"));
	}

	console.log(endorsementid);

	var query = 'SELECT * FROM endorsement_claims WHERE endorsementsid=?';

	db.get().query(query, [endorsementid], function (err, rows) {
		if (err) {
			console.log(err);
			handler(new Error("Error retrieving endorsement claims records"));
		} else {
			var claimjson = {}

			console.log(rows);

			if (rows.length > 0) {
				for (let i=0; i<rows.length; i++) {
					let row = rows[i];
					claimjson[rows[i].property] = rows[i].value;
				}
			}
			handler(null, claimjson);
		}
	});
}

