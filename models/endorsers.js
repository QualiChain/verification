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

const ipfsAPI = require('ipfs-http-client');

var db = require('../db.js')
var cfg = require('../config.js');
var utilities = require('../utilities.js');
var nodemailer = require('nodemailer');

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

var ipfsurl = cfg.ipfs_url_stub;
var ipfs = ipfsAPI(cfg.ipfs_api_domain, cfg.ipfs_api_port, {protocol: cfg.ipfs_api_transport});

const { matchedData } = require('express-validator/filter');
const contractgas = 6000000;

/**
 * Get the endorser's home page
 *
 * @return the endorser's home page or error page.
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
 * Get the endorsers mangement page
 *
 * @return the page to manage endorsers or error page.
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

/** ADMIN FUNCTION FOR LATER **/

/**
 * Create a new Endorser record entry
 *
 * @return a JSON object with the new record entry data in or error message.
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

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

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
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action.";
			} else {
				// create the endorser database entry.
				var insertqueryendorser = 'Insert into endorsers (userid, timecreated, uniqueid, name, description, url, telephone, email, imageurl) VALUE (?,?,?,?,?,?,?,?,?)';
				var paramsendorser = [req.user.id, res.locals.timecreated, res.locals.uniqueid, res.locals.name, res.locals.description, res.locals.url, res.locals.telephone, res.locals.email, res.locals.imageurl];
				db.get().query(insertqueryendorser, paramsendorser, function(err3, results3) {
					if (err3) {
						console.log(err3);
						res.locals.errormsg = "Error creating endorser entry.";
					} else {
						res.locals.id = results3.insertId;
						console.log("endorser entry saved");
						res.locals.finished = true;
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
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

/**
 * Create a new Endorser website user account with endorser role
 *
 * @return a JSON object with the new record entry data in or error message.
 */
exports.createEndorserUserAccount = function(req, res, next) {
	var data = matchedData(req);

	if (!data.id || !data.loginemail) {
		return res.status(400).send({"error": "You must include endorser id and login email address for the endorser you want to create a user account for"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

	res.locals.id = data.id;
	res.locals.timecreated = null;
	res.locals.fullname = null;
	res.locals.email = data.loginemail;
	res.locals.status = 0;

	res.locals.role = 5;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action.";
			} else {
				db.get().query('SELECT * from endorsers where id=?', [data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error fetching endorser by Id";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "There is no endorser record with the given id.";
						} else if (rows2.length > 0) {
							res.locals.fullname = rows2[0].name;

							db.get().query('SELECT * from users where email=?', [data.loginemail], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error user record by email address";
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

										res.locals.finished = true;
										//res.locals.errormsg = "Account with this email address already exists";

									} else if (rows3.length == 0) {

										data.accountpassword = web3.utils.sha3("The Institute of Coding" + res.locals.email);
										data.accountname = "Endorser: "+res.locals.fullname;

										handler = function(req, res, next, data){

											if(data.error && data.error.length > 0){
											   console.log("newAccount error: ");
											   console.log(data.error);
											   res.locals.errormsg = "Error creating blockchain account.";
											} else {

												var time = Math.floor((new Date().getTime()) / 1000);
												res.locals.timecreated = time;
												res.locals.fullname = rows2[0].name;
												res.locals.password = utilities.createKey(12);

												var bcrypt = require('bcrypt');
												res.locals.hashed_password = bcrypt.hashSync(res.locals.password, 10);
												var registrationkey = utilities.createKey(20);

												var insertquery = 'Insert into users (fullname, email, hash_password, created, registrationkey, blockchainaccount, blockchainaccountpassword, blockchainaccountseed) VALUE (?,?,?,?,?,?,?,?)';
												var params = [res.locals.fullname, data.loginemail, res.locals.hashed_password, res.locals.timecreated, registrationkey, data.account, data.accountpassword, data.secretphrase];
												db.get().query(insertquery, params, function(err4, results4) {
													if (err4) {
														console.log(err4);
														res.locals.errormsg = "Error creating user account entry.";
													} else {
														console.log("endorser user account saved");
														res.locals.id = results4.insertId;

														var completeProcess = function(req, res, next, data) {
															console.log('Funds transfered to Endorser');

															// give that the user the issuer role.
															var insertqueryroles = 'Insert into user_roles (userid, timecreated, personid, roleid) VALUE (?,?,?,?)';
															var paramsroles = [req.user.id, time, results4.insertId, res.locals.role];
															db.get().query(insertqueryroles, paramsroles, function(err5, results5) {
																if (err5) {
																	console.log(err5);
																	res.locals.errormsg = "Error creating user account role entry.";
																} else {
																	console.log("endorser user account role saved");

																	// update the endorser loginuserid field
																	var updateissuers = 'Update endorsers set loginuserid=? where id=?';
																	var paramsissuersupdate = [results4.insertId, data.id];
																	db.get().query(updateissuers, paramsissuersupdate, function(err7, results7) {
																		if (err7) {
																			console.log(err7);
																			res.locals.errormsg = "Error updating Endorser record with new User account number.";
																		} else {
																			console.log("endorser loginuserid updated");

																			// email user
																			const transporter = nodemailer.createTransport({sendmail: true});

																			var message = cfg.emailheader;

																			message += '<p>Dear '+res.locals.fullname+',</p>';
																			message += '<h3>Welcome to the Institute of Coding</h3>';
																			message += '<p>You have been registered on our website as a badge endorser by '+req.user.fullname+'.</p>';
																			message += '<p><b>Please <a href="'+cfg.protocol+'://'+cfg.domain+cfg.proxy_path+'/endorsers/completeregistration/?id='+results4.insertId+'&key='+registrationkey+'">click here</a></b> to complete your registration.</p>';

																			message += '<p>Please then sign in with this email address and the password: <b>'+res.locals.password+'</b><br>';
																			message += '<br>Once you have signed in you will be redirect to a password change page.<br>';

																			message += cfg.emailfooter;

																			var mailOptions = {
																				from: cfg.fromemailaddress,
																				to: data.loginemail,
																				subject: 'Institute of Coding Badge Endorser Account',
																				html: message,
																			}

																			transporter.sendMail(mailOptions, (error, info) => {
																				if (error) {
																					return console.log(error);
																					res.locals.errormsg = "Failed to send email to issuer";
																				} else {
																					console.log('Endorser Email Message sent: ', info.messageId);
																					res.locals.finished = true;
																				}
																			});
																		}
																	});
																}
															});
														}

														data.from = cfg.systemBankAccount; // unlocked
														data.to = data.account;
														data.amount = 20;

														utilities.transferFunds(req, res, next, data, completeProcess);
													}
												});
											}
										};

										utilities.createAccount(req, res, next, data, handler);
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
			reply.timecreated = res.locals.timecreated;
			reply.name = res.locals.fullname;
			reply.email = res.locals.email;
			reply.status = res.locals.status;

			console.log(reply);

			res.send(reply);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

/**
 * Complete Registration of a website user account and forward to change password and then endorser home pages
 *
 * @return the HTML change password page or error page.
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
										subject: 'Institute of Coding Badge Endorser Registration Completed',
									});

									var message = cfg.emailheader;
									message += '<p>Dear '+name+',</p>';
									message += '<p>This is to inform you that the following Endorser has now completed the registation process:</p>';
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
 * Update an Endorser record entry for the given id
 *
 * @return a JSON object with the updated record entry data in or error message.
 */
exports.updateEndorser = function(req, res, next) {
	var data = matchedData(req);

	if (!data.id) {
		return res.status(400).send({"error": "You must include the record id for the endorser record you want to update"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

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
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action.";
			} else {
				db.get().query('SELECT endorsers.*, users.status from endorsers left join users on endorsers.loginuserid = users.id where endorsers.userid=? and endorsers.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error fetching endorser record";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "No endorser record found with the given id for the currently logged in user";
						} else {
							// Checked not used in an badge
							db.get().query('SELECT * from badge_issued left join endorsements on badge_issued.id = endorsements.itemid where badge_issued.userid=? and badge_issued.status in ("issued","revoked")', [data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error checking endorser record not used";
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

										if (setquery != "") {
											updatequery += " SET "+setquery;
											updatequery += " WHERE userid=? AND id=?";

											params.push(req.user.id);
											params.push(data.id);

											db.get().query(updatequery, params, function(err4, results4) {
												if (err4) {
													console.log(err4);
													res.locals.errormsg = "Error updating endorser record.";
												} else {
													console.log("endorsers record updated");
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
			}
		}
	});

	req.flagCheck = setInterval(function() {
		if (res.locals.finished) {
			clearInterval(req.flagCheck);

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

			res.send(reply);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

/**
 * Delete the Endorser record entry for the given id, if not used in an issuance
 *
 * @return a JSON object with record id and status or error message.
 */
exports.deleteEndorser = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the endorser you want to update"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super","admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action";
			} else {
				db.get().query('SELECT endorsers.*, users.status from endorsers left join users on endorsers.loginuserid = users.id where endorsers.userid=? and endorsers.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error fetching endorser record";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "No endorser record found with the given id for the currently logged in user";
						} else {
							// Checked not used in an badge first
							db.get().query('SELECT * from badge_issued left join endorsements on badge_issued.id = endorsements.itemid where badge_issued.userid=? and badge_issued.status in ("issued","revoked")', [data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error checking endorser record not used";
								} else {
									if (rows3.length > 0) {
										res.locals.errormsg = "This endorser record has been used to issue a badge and therefore can't be deleted";
									} else {
										var updatequery = "DELETE from endorsers WHERE userid=? AND id=?";
										var params = [req.user.id, data.id];

										db.get().query(updatequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												res.locals.errormsg = "Error deleting endorser record.";
											} else {
												console.log("endorsers record deleted");
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

/**
 * Return a list of all Endorser records accessible by the currently logged in user
 *
 * @return a JSON object with the Endorser record entries or error message.
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
 * Return the Endorser record for the given id if accessible by the currently logged in user
 *
 * @return a JSON object with the Endorser record or error message.
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
