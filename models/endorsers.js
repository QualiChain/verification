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
var utilities = require('../models/utilities.js');
var nodemailer = require('nodemailer');

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const { matchedData } = require('express-validator/filter');
const contractgas = 6000000;

/**
 * Get the endorser's home page
 * @return HTML of the endorser's home page or error page with error message.
 */
exports.getEndorserPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("endorser")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				res.render('endorsers', { title: 'My Endorsements'});
			}
		}
	});
}

/**
 * Get the Endorser management page for the currently logged in administrator.
 * @return HTML page for managing Endorser records or error page with error message.
 */
exports.getEndorserManagementPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				res.render('manageendorsers', { title: 'Manage Endorsers'});
			}
		}
	});
}

/**
 * Create a new Endorser record.
 * @param name, Required. A name for the Endorser.
 * @param url, Required. A website url for the Endorser.
 * @param email, Optional. An email address for the Endorser.
 * @param telephone, Optional. A telephone Number for the Endorser.
 * @param description, Optional. A textual description of the Endorser.
 * @param imageurl, Optional. A URL pointing to a logo / image file for the Endorser.
 * @return JSON with the data for new Endorser record, or a JSON error object.
 */
exports.createEndorser = function(req, res, next) {
	var data = matchedData(req);

	if (!data.name || !data.url) {
		return res.status(400).send({"error": "You must include at least the name and url for the endorser you want to create"});
	}

	var url = "";
	if (data.url) {
		url = data.url;
	}
	var email = "";
	if (data.email) {
		email = data.email;
	}
	var telephone = "";
	if (data.telephone) {
		telephone = data.telephone;
	}
	var description = "";
	if (data.description) {
		description = data.description;
	}
	var imageurl = "";
	if (data.imageurl) {
		imageurl = data.imageurl;
	}

	res.locals.id = "";
	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;
	res.locals.uniqueid = web3.utils.sha3("endorser_" + time);

	res.locals.name = data.name;
	res.locals.url = url;
	res.locals.email = email;
	res.locals.telephone = telephone;
	res.locals.description = description;
	res.locals.imageurl = imageurl;
	res.locals.status = -1;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action."});
			} else {
				// create the endorser database entry.
				var insertqueryendorser = 'Insert into endorsers (userid, timecreated, uniqueid, name, description, url, telephone, email, imageurl) VALUE (?,?,?,?,?,?,?,?,?)';
				var paramsendorser = [req.user.id, res.locals.timecreated, res.locals.uniqueid, res.locals.name, res.locals.description, res.locals.url, res.locals.telephone, res.locals.email, res.locals.imageurl];
				db.get().query(insertqueryendorser, paramsendorser, function(err3, results3) {
					if (err3) {
						console.log(err3);
						res.status(404).send({error: "Error creating endorser entry."});
					} else {
						res.locals.id = results3.insertId;
						console.log("endorser entry saved");

						var reply = {}
						reply.id = res.locals.id;
						reply.timecreated = res.locals.timecreated;
						reply.uniqueid = res.locals.uniqueid;
						reply.name = res.locals.name;
						reply.description = res.locals.description;
						reply.url = res.locals.url;
						reply.email = res.locals.email;
						reply.telephone = res.locals.telephone;
						reply.imageurl = res.locals.imageurl;
						reply.status = 0;
						reply.usedInIssuance = false;

						res.send(reply);
					}
				});
			}
		}
	});
}

/**
 * Create a User record entry to allow an Endorser to login to the system.
 * @param id, Required. The record identifier of the Endorser record you want to add a login account for.
 * @param loginemail, Required. An email address to use the the Endorser login account.
 * @return JSON with the data for new Endorser user account record, or a JSON error object.
 */
exports.createEndorserUserAccount = function(req, res, next) {
	var data = matchedData(req);

	if (!data.id || !data.loginemail) {
		return res.status(400).send({"error": "You must include endorser id and login email address for the endorser you want to create a user account for"});
	}

	res.locals.endorserid = data.id;

	res.locals.id = "";
	res.locals.timecreated = null;
	res.locals.fullname = null;
	res.locals.email = data.loginemail;
	res.locals.status = 0;

	res.locals.role = 5;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action."});
			} else {
				db.get().query('SELECT * from endorsers where id=?', [res.locals.endorserid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching endorser by Id"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "There is no endorser record with the given id."});
						} else if (rows2.length > 0) {
							res.locals.fullname = rows2[0].name;

							db.get().query('SELECT * from users where email=?', [res.locals.email], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error user record by email address"});
								} else {
									if (rows3.length > 0) {
										// What to do if an account already exists for the given email address?
										// Return the details?
										var row = rows3[0];

										res.locals.id = row3.id;
										res.locals.timecreated = row3.created;
										res.locals.fullname = row3.fullname;
										res.locals.email = row3.email;
										res.locals.status = row3.status;

										var reply = {}
										reply.id = res.locals.id;
										reply.timecreated = res.locals.timecreated;
										reply.name = res.locals.fullname;
										reply.email = res.locals.email;
										reply.status = res.locals.status;

										//console.log(reply);
										res.send(reply);

									} else if (rows3.length == 0) {

										let handler = function(err, accountdatareply){

											if(err && err.message != ""){
											   console.log("newAccount error: ");
											   console.log(err);
											   res.status(404).send({error: "Error creating blockchain account."});
											} else {

												var time = Math.floor((new Date().getTime()) / 1000);
												res.locals.timecreated = time;
												res.locals.fullname = rows2[0].name;
												res.locals.password = utilities.createKey(12);

												var bcrypt = require('bcrypt');
												res.locals.hashed_password = bcrypt.hashSync(res.locals.password, 10);
												var registrationkey = utilities.createKey(20);

												var insertquery = 'Insert into users (fullname, email, hash_password, created, registrationkey, blockchainaccount, blockchainaccountpassword, blockchainaccountseed) VALUE (?,?,?,?,?,?,?,?)';
												var params = [res.locals.fullname, res.locals.email, res.locals.hashed_password, res.locals.timecreated, registrationkey, accountdatareply.account, accountdatareply.accountpassword, accountdatareply.secretphrase];
												db.get().query(insertquery, params, function(err4, results4) {
													if (err4) {
														console.log(err4);
														res.status(404).send({error: "Error creating user account entry."});
													} else {
														console.log("endorser user account saved");
														res.locals.id = results4.insertId;

														let completeProcess = function(err2, transferdatareply) {
															if (err2) {
																console.log(err2)
																res.status(404).send({error: "Error transfering funds to blockchain account."});
															} else {
																console.log('Funds transfered to Endorser');

																// give that the user the issuer role.
																var insertqueryroles = 'Insert into user_roles (userid, timecreated, personid, roleid) VALUE (?,?,?,?)';
																var paramsroles = [req.user.id, time, results4.insertId, res.locals.role];
																db.get().query(insertqueryroles, paramsroles, function(err5, results5) {
																	if (err5) {
																		console.log(err5);
																		res.status(404).send({error: "Error creating user account role entry."});
																	} else {
																		console.log("endorser user account role saved");

																		// update the endorser loginuserid field
																		var updateissuers = 'Update endorsers set loginuserid=? where id=?';
																		var paramsissuersupdate = [results4.insertId, res.locals.endorserid];
																		db.get().query(updateissuers, paramsissuersupdate, function(err7, results7) {
																			if (err7) {
																				console.log(err7);
																				res.status(404).send({error: "Error updating Endorser record with new User account number."});
																			} else {
																				console.log("endorser loginuserid updated");

																				// email user
																				const transporter = nodemailer.createTransport({sendmail: true});

																				var message = cfg.emailheader;
																				message += '<p>'+cfg.model_endorsers_registrationEmailStart+' '+res.locals.fullname+',</p>';
																				message += '<h3>'+cfg.model_endorsers_registrationEmailLine1+'</h3>';
																				message += '<p>'+cfg.model_endorsers_registrationEmailLine2+' '+req.user.fullname+'.</p>';
																				message += '<p><b>'+cfg.model_endorsers_registrationEmailLine3A+' <a href="'+cfg.protocol+'://'+cfg.domain+cfg.proxy_path+'/endorsers/completeregistration/?id='+results4.insertId+'&key='+registrationkey+'">'+cfg.model_endorsers_registrationEmailLine3B+'</a></b> '+cfg.model_endorsers_registrationEmailLine3C+'</p>';
																				message += '<p>'+cfg.model_endorsers_registrationEmailLine4+' <b>'+res.locals.password+'</b><br>';
																				message += '<br>'+cfg.model_endorsers_registrationEmailLine5+'<br>';
																				message += cfg.emailfooter;

																				var mailOptions = {
																					from: cfg.fromemailaddress,
																					to: res.locals.email,
																					subject: cfg.model_endorsers_registrationEmailSubject,
																					html: message,
																				}

																				transporter.sendMail(mailOptions, (error, info) => {
																					if (error) {
																						return console.log(error);
																						res.status(404).send({error: "Failed to send email to issuer"});
																					} else {
																						console.log('Endorser Email Message sent: ', info.messageId);

																						let reply = {}
																						reply.id = res.locals.id;
																						reply.timecreated = res.locals.timecreated;
																						reply.name = res.locals.fullname;
																						reply.email = res.locals.email;
																						reply.status = res.locals.status;

																						//console.log(reply);

																						res.send(reply);
																					}
																				});
																			}
																		});
																	}
																});
															}
														}

														let transferdata = {};
														transferdata.from = cfg.systemBankAccount; // unlocked
														transferdata.to = accountdatareply.account;
														transferdata.amount = 20;

														utilities.transferFunds(transferdata, completeProcess);
													}
												});
											}
										};

										let accountdata = {}
										accountdata.accountpassword = web3.utils.sha3("The Institute of Coding" + res.locals.email);
										accountdata.accountname = "Endorser: "+res.locals.fullname;

										utilities.createAccount(accountdata, handler);
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
 * Call from a link in the registration email to complete Endorser account creation.
 * @param id, Required. The record identifier of the Endorser record to complete registration for.
 * @param key, Required. The registration unique key to authorise this account registration completion.
 * @return HTML of the change password page or error page with error message.
 */
exports.completeRegistration = function(req, res, callback) {
	var data = matchedData(req);

	if (!data.id || !data.key) {
		res.render('error', {message: "Expected id and key properties not present"});
	}

	db.get().query('SELECT * from users where id=? AND registrationkey=? AND status=0', [data.id, data.key], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', {message: "Error fetching user data from the database"});
		} else {
			if (rows.length == 0) {
				res.render('error', {message: "The given id and key do not match data in our records or this account has already completed the registration process"});
			} else {
				var recipientname = rows[0].fullname;

				db.get().query('UPDATE users set validationkey=?, status=1 where id=? AND registrationkey=?', [data.key, data.id, data.key], function (err2, reply2) {
					if (err2) {
						console.log(err);
						res.render('error', {message: "Error fetching user data"});
					} else {
						var sql = 'select * from users where id=(select endorsers.userid from endorsers left join users as B on endorsers.loginuserid = B.id WHERE endorsers.loginuserid=? LIMIT 1)';
						db.get().query(sql, [data.id], function (err3, rows3) {
							if (err3) {
								console.log(err3);
								res.render('error', {message: "Error fetching user data from the database"});
							} else {
								if (rows3.length > 0) {
									// email owner that the endorser has completed registration
									var email = rows3[0].email;
									var name = rows3[0].fullname;

									const transporter = nodemailer.createTransport({sendmail: true}, {
										from: cfg.fromemailaddress,
										to: email,
										subject: cfg.model_endorsers_registrationCompleteSubject,
									});

									var message = cfg.emailheader;
									message += '<p>'+cfg.model_endorsers_registrationCompleteStart+' '+name+',</p>';
									message += '<p>'+cfg.model_endorsers_registrationCompleteLine1+'</p>';
									message += '<p><b>'+recipientname+'</b><br>';
									message += cfg.emailfooter;

									transporter.sendMail({html: message});
								}
							}
							//Change password page.
							var theurl = cfg.protocol+"://"+cfg.domain+cfg.proxy_path+"/users/changepasswordpage";
							res.render('registrationcomplete', {layout: 'registrationcomplete.hbs', from: 'endorsers', url: theurl});
						});
					}
				});
			}
		}
	});
}

/**
 * Update an existing Endorser record.
 * @param id, Required. The record identifier of the Endorser record you want to update.
 * @param name, Optional. A name for the Endorser.
 * @param description, Optional. A textual description of the Endorser.
 * @param url, Optional. A website url for the Endorser.
 * @param email, Optional. An email address for the Endorser.
 * @param telephone, Optional. A telephone Number for the Endorser.
 * @param imageurl, Optional. A URL pointing to a logo / image file for the Endorser.
 * @return JSON with the data for the updated Endorser record, or a JSON error object.
 */
exports.updateEndorser = function(req, res, next) {
	var data = matchedData(req);

	if (!data.id) {
		return res.status(400).send({"error": "You must include the record id for the endorser record you want to update"});
	}

	res.locals.id = data.id;
	res.locals.timecreated = 0;
	res.locals.uniqueid = "";

	res.locals.name = "";
	res.locals.url = "";
	res.locals.email = "";

	res.locals.telephone = "";
	res.locals.description = "";
	res.locals.imageurl = "";
	res.locals.usedInIssuance = true;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action."});
			} else {
				db.get().query('SELECT endorsers.*, users.status from endorsers left join users on endorsers.loginuserid = users.id where endorsers.userid=? and endorsers.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching endorser record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No endorser record found with the given id for the currently logged in user"});
						} else {
							// Checked not used in an badge
							db.get().query('SELECT * from badge_issued left join endorsements on badge_issued.id = endorsements.itemid where badge_issued.userid=? and badge_issued.status in ("issued","revoked")', [data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error checking endorser record not used"});
								} else {
									if (rows3.length > 0) {
										return res.status(404).send("This endorser record has been used to issue a badge and therefore can't be edited");
									} else {
										res.locals.timecreated = rows2[0].timecreated;
										if (!res.locals.status || res.locals.status === 'null' || res.locals.status === "undefined") {
											res.locals.status = -1;
										}
										res.locals.uniqueid = rows2[0].uniqueid;
										res.locals.usedInIssuance = false;

										var updatequery = "UPDATE endorsers";
										var params = [];

										var setquery = "";

										if (data.name && data.name != "") {
											setquery += "name=?"
											params.push(data.name);
											res.locals.name = data.name
										} else {
											res.locals.name = rows2[0].name;
										}

										if (data.url && data.url != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "url=?"
											params.push(data.url);
											res.locals.url = data.url;
										} else {
											res.locals.url = rows2[0].url;
										}

										if (data.email && data.email != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "email=?"
											params.push(data.email);
											res.locals.email = data.email;
										} else {
											res.locals.email = rows2[0].email;
										}

										if (data.telephone && data.telephone != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "telephone=?"
											params.push(data.telephone);
											res.locals.telephone = data.telephone;
										} else {
											res.locals.telephone = rows2[0].telephone;
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

										if (data.imageurl && data.imageurl != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "imageurl=?"
											params.push(data.imageurl);
											res.locals.imageurl = data.imageurl;
										} else {
											res.locals.imageurl = rows2[0].imageurl;
										}

										var reply = {}
										reply.id = res.locals.id;
										reply.timecreated = res.locals.timecreated;
										reply.uniqueid = res.locals.uniqueid;
										reply.name = res.locals.name;
										reply.description = res.locals.description;
										reply.url = res.locals.url;
										reply.email = res.locals.email;
										reply.telephone = res.locals.telephone;
										reply.imageurl = res.locals.imageurl;
										reply.status = res.locals.status;
										reply.usedInIssuance = res.locals.usedInIssuance;

										if (setquery != "") {
											updatequery += " SET "+setquery;
											updatequery += " WHERE userid=? AND id=?";

											params.push(req.user.id);
											params.push(data.id);

											db.get().query(updatequery, params, function(err4, results4) {
												if (err4) {
													console.log(err4);
													res.status(404).send({error: "Error updating endorser record."});
												} else {
													console.log("endorsers record updated");
													res.send(reply);
												}
											});
										} else {
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
 * Delete an existing Endorser record.
 * @param id, Required. The record identifier of the Endorser you wish to delete.
 * @return JSON with the id of the Endorser record that was deleted and a status property of -1, or a JSON error object.
 */
exports.deleteEndorser = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the endorser you want to update"});
	}

	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT endorsers.*, users.status from endorsers left join users on endorsers.loginuserid = users.id where endorsers.userid=? and endorsers.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching endorser record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No endorser record found with the given id for the currently logged in user"});
						} else {
							// Checked not used in an badge first
							db.get().query('SELECT * from badge_issued left join endorsements on badge_issued.id = endorsements.itemid where badge_issued.userid=? and badge_issued.status in ("issued","revoked")', [data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error checking endorser record not used"});
								} else {
									if (rows3.length > 0) {
										res.status(404).send({error: "This endorser record has been used to issue a badge and therefore can't be deleted"});
									} else {
										var updatequery = "DELETE from endorsers WHERE userid=? AND id=?";
										var params = [req.user.id, data.id];

										db.get().query(updatequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												res.status(404).send({error: "Error deleting endorser record."});
											} else {
												console.log("endorsers record deleted");
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
 * Get a list of all Endorser records for the currently logged in user (issuer).
 * @return JSON with an object with key 'endorsers' pointing to an array of the Endorser records, or a JSON error object.
 */
exports.listEndorsers = function(req, res, next) {

	res.locals.endorsers = [];

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				// get if used?
				db.get().query('SELECT endorsers.*, users.email as loginemail, users.status from endorsers left join users on endorsers.loginuserid = users.id where userid=?', [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving endorser records"});
					} else {
						if (rows2.length > 0) {
							var i=0;
							function loop() {
								var next = rows2[i];

								res.locals.endorsers[i] = {};
								res.locals.endorsers[i].id = next["id"];
								res.locals.endorsers[i].timecreated = next["timecreated"];
								res.locals.endorsers[i].uniqueid = res.locals.uniqueid;
								res.locals.endorsers[i].name = next["name"];
								res.locals.endorsers[i].description = next["description"];
								res.locals.endorsers[i].url = next["url"];
								res.locals.endorsers[i].email = next["email"];
								res.locals.endorsers[i].telephone = next["telephone"];
								res.locals.endorsers[i].imageurl = next["imageurl"];

								if (next["status"] === null) {
									res.locals.endorsers[i].status = -1;
								} else {
									res.locals.endorsers[i].status = next["status"];
									if (next["loginemail"]) {
										res.locals.endorsers[i].login =  next["loginemail"];
									}
								}

								var sql = 'SELECT badge_issued.id from badge_issued ';
								sql += 'left join badge_endorsement as A on badge_issued.badgeid = A.itemid ';
								sql += 'left join badge_endorsement as B on badge_issued.id = B.itemid ';
								sql += 'where (A.endorserid=? OR B.endorserid=?) AND badge_issued.status in ("issued","revoked")';

								db.get().query(sql, [next["id"], next["id"]], function (err3, rows3) {
									if (err3) {
										console.log(err3);
										return res.status(404).send("Error checking endorser record not used to issue a badge");
									} else {
										if (rows3.length > 0) {
											res.locals.endorsers[i].usedInIssuance = true;
										} else {
											res.locals.endorsers[i].usedInIssuance = false;
										}
										i++;
										if( i < rows2.length) {
											loop();
										} else {
											res.send({endorsers: res.locals.endorsers});
										}
									}
								});
							}
							loop();
						} else {
							res.send({endorsers: res.locals.endorsers});
						}
					}
				});
			}
		}
	});
}

/**
 * Get an Endorser record by it's record identifier.
 * @param id, Required. The identifier of the Endorser record you wish to retrieve.
 * @return JSON with Endorser record data or a JSON error object.
 */
exports.getEndorserById = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the endorser you want to get the data for"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT endorsers.*, users.email as loginemail, users.status from endorsers left join users on endorsers.loginuserid = users.id where endorsers.userid=? and endorsers.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving endorser record"});
					} else {
						if (rows2.length > 0) {
							var next = rows2[0];

							var endorser = {};
							endorser.id = next["id"];
							endorser.timecreated = next["timecreated"];
							endorser.uniqueid = res.locals.uniqueid;
							endorser.name = next["name"];
							endorser.description = next["description"];
							endorser.url = next["url"];
							endorser.email = next["email"];
							endorser.telephone = next["telephone"];
							endorser.imageurl = next["imageurl"];

							if (next["status"] == null) {
								res.locals.endorser.status = -1;
							} else {
								res.locals.endorser.status = next["status"];
								if (next["loginemail"]) {
									res.locals.endorser.login =  next["loginemail"];
								}
							}

							var sql = 'SELECT badge_issued.id from badge_issued ';
							sql += 'left join badge_endorsement as A on badge_issued.badgeid = A.itemid ';
							sql += 'left join badge_endorsement as B on badge_issued.id = B.itemid ';
							sql += 'where (A.endorserid=? OR B.endorserid=?) AND badge_issued.status in ("issued","revoked")';

							db.get().query(sql, [req.user.id, req.user.id, next["id"], next["id"]], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									return res.status(404).send("Error checking endorser record not used to issue a badge");
								} else {
									if (rows3.length > 0) {
										endorser.usedInIssuance = true;
									} else {
										endorser.usedInIssuance = false;
									}
									res.send(endorser);
								}
							});

						} else {
							return res.status(404).send({"error": "No endorser record found with the given id for the currently logged in user"});
						}
					}
				});
			}
		}
	});
}

exports.getEndorserJSONByUniqueId = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist
	if (!data.id) {
		return res.status(400).send({"error": "You must include the unique id for the endorser you want to view the JSON data for"});
	}

	sql = 'SELECT * FROM endorsers WHERE uniqueid=? LIMIT 1';
	db.get().query(sql, [data.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error retrieving endorser record"});
		} else {
			if (rows.length > 0) {
				row = rows[0];
				let issuerjson = {};
				issuerjson["@context"] = "https://w3id.org/openbadges/v2";
				issuerjson["type"] = "Issuer",
				issuerjson["id"] = cfg.uri_stub+"endorsers/" + data.id;
				issuerjson["name"] = row["name"];

				if (row["description"] && row["description"] != "") {
					issuerjson["description"] = row["description"];
				}

				if (row["url"] && row["url"] != "") {
					issuerjson["url"] = row["url"];
				}

				if (row["email"] && row["email"] != "") {
					issuerjson["email"] = row["email"];
				}

				if (row["telephone"] && row["telephone"] != "" && row["telephone"] != null) {
					issuerjson["telephone"] = row["telephone"];
				}

				if (row["imageurl"] && row["imageurl"] != "" && row["imageurl"] != null) {
					issuerjson["image"] = {};
					issuerjson["image"]["type"] = "ImageObject";
					issuerjson["image"]["id"] = row["imageurl"];
					//issuerjson["issuer"]["image"]["caption"] = row.issuerimagecaption;
					//issuerjson["issuer"]["image"]["author"] = row.issuerimageauthor;
				}
				//issuerjson.publicKey = cfg.uri_stub + "keys/public/" + cfg.IoCEndorser;
				issuerjson.verification = {};
				issuerjson.verification.type = "hosted";

				res.send(issuerjson);
			} else {
				res.send({});
			}
		}
	});
}

exports.getHostedEndorserJSONByUniqueId = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist
	if (!data.id) {
		return res.status(400).send({"error": "You must include the unique id for the endorser you want to view the JSON data for"});
	}

	sql = 'SELECT * FROM endorsers WHERE uniqueid=? LIMIT 1';
	db.get().query(sql, [data.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error retrieving endorser record"});
		} else {
			if (rows.length > 0) {
				var innerhandler = function(err, issuerjson) {
					if (err && err.message != "") {
						res.status(404).send({error: err.message});
					} else if (issuerjson && issuerjson != "" && issuerjson.id) {
						res.send(issuerjson);
					} else {
						res.send({});
					}
				}
				exports.getHostedEndorserOpenBadgeJSON(rows[0].id, innerhandler);
			} else {
				res.status(404).send({error: "No endorser record found with the given unique id"});
			}
		}
	});
}

exports.getHostedEndorserOpenBadgeJSON = function(endorserid, handler) {

	// check all expected variables exist
	if (!endorserid) {
		handler(new Error("You must provide the endorser id of the endorser JSON you wish to retrieve"));
	}

	sql = 'SELECT * FROM endorsers WHERE id=? LIMIT 1';
	db.get().query(sql, [endorserid], function (err, rows) {
		if (err) {
			console.log(err);
			handler(new Error("Error retrieving endorser record"));
		} else {
			if (rows.length > 0) {
				row = rows[0];

				let issuerjson = {};
				issuerjson["@context"] = "https://w3id.org/openbadges/v2";
				issuerjson["type"] = "Issuer",
				issuerjson["id"] = cfg.uri_stub+"endorsers/hosted/"+row["uniqueid"];
				issuerjson["name"] = row["name"];

				if (row["description"] && row["description"] != "") {
					issuerjson["description"] = row["description"];
				}

				if (row["url"] && row["url"] != "") {
					issuerjson["url"] = row["url"];
				}

				if (row["email"] && row["email"] != "") {
					issuerjson["email"] = row["email"];
				}

				if (row["telephone"] && row["telephone"] != "" && row["telephone"] != null) {
					issuerjson["telephone"] = row["telephone"];
				}

				if (row["imageurl"] && row["imageurl"] != "" && row["imageurl"] != null) {
					issuerjson["image"] = {};
					issuerjson["image"]["type"] = "ImageObject";
					issuerjson["image"]["id"] = row["imageurl"];
					//data.badgejson["issuer"]["image"]["caption"] = row.issuerimagecaption;
					//data.badgejson["issuer"]["image"]["author"] = row.issuerimageauthor;
				}

				//data.issuerjson.publicKey = cfg.uri_stub + "keys/public/" + cfg.IoCEndorser;

				// Badgr was happy without verification listed on the Ednorment issuer object
				// as long as the Endorsement iteself was hosted verification
				//issuerjson.verification = {};
				//issuerjson.verification.type = "hosted";

				handler(null, issuerjson);
			} else {
				handler(new Error("No endorser record found with the given record id"));
			}
		}
	});
}