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
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

var ipfsurl = cfg.ipfs_url_stub;
var ipfs = ipfsAPI(cfg.ipfs_api_domain, cfg.ipfs_api_port, {protocol: cfg.ipfs_api_transport});

const { matchedData } = require('express-validator/filter');
const contractgas = 6000000;

/**
 * Get the issuer's home page
 *
 * @return the issuer's home page or error page.
 */
exports.getIssuerPage = function(req, res, next) {

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action."});
			} else {
				res.render('issuers', { title: 'Manage Badge Issuing'});
			}
		}
	});
}

/**
 * Get the page to manage Issuers
 *
 * @return the page to manage issuers or error page.
 */
exports.getIssuerManagementPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action."});
			} else {
				res.render('manageissuers', { title: 'Manage Issuers'});
			}
		}
	});
}

/** ADMIN FUNCTION FOR LATER **/

/**
 * Create a new Issuer record entry
 *
 * @return a JSON object with the new record entry data in or error message.
 */
exports.createIssuer = function(req, res, next) {
	var data = matchedData(req);

	if (!data.name || !data.url) {
		return res.status(400).send({"error": "You must include at least the name and url for the issuer you want to create"});
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
	res.locals.uniqueid = web3.utils.sha3("issuer_" + time);

	res.locals.name = data.name;
	res.locals.url = url;
	res.locals.email = email;
	res.locals.telephone = telephone;
	res.locals.description = description;
	res.locals.imageurl = imageurl;
	res.locals.status = -1;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action.";
			} else {
				// create the issuer database entry.
				var insertqueryissuer = 'Insert into issuers (userid, timecreated, uniqueid, name, description, url, telephone, email, imageurl) VALUE (?,?,?,?,?,?,?,?,?)';
				var paramsissuer = [req.user.id, res.locals.timecreated, res.locals.uniqueid, res.locals.name, res.locals.description, res.locals.url, res.locals.telephone, res.locals.email, res.locals.imageurl];
				db.get().query(insertqueryissuer, paramsissuer, function(err3, results3) {
					if (err3) {
						console.log(err3);
						res.locals.errormsg = "Error creating issuer entry.";
					} else {
						res.locals.id = results3.insertId;
						console.log("issuer entry saved");
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
			reply.status = res.locals.status;
			reply.usedInIssuance = false;

			res.send(reply);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

/**
 * Create a new Issuer website user account with endorser role
 *
 * @return a JSON object with the new record entry data in or error message.
 */
exports.createIssuerUserAccount = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id || !data.loginemail) {
		return res.status(400).send({"error": "You must include the issuer id and a login email address for the issuer you want to create a user account for"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

	res.locals.id = data.id;
	res.locals.timecreated = null;
	res.locals.fullname = null;
	res.locals.email = data.loginemail;
	res.locals.status = 0;

	res.locals.role = 4;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions.";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action.";
			} else {
				db.get().query('SELECT * from issuers where id=?', [data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error fetching issuer by Id";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "There is no issuer record with the given id.";
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

										res.locals.id = row.id;
										res.locals.timecreated = row.created;
										res.locals.fullname = row.fullname;
										res.locals.email = row.email;
										res.locals.status = row.status;

										res.locals.finished = true;
										//res.locals.errormsg = "Account with this email address already exists";

									} else if (rows3.length == 0) {
										console.log("Creating Blockchain Account");

										data.accountpassword = web3.utils.sha3("The Institute of Coding" + res.locals.email);
										data.accountname = "Issuer: "+res.locals.fullname;

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
												var params = [res.locals.fullname, res.locals.email, res.locals.hashed_password, res.locals.timecreated, registrationkey, data.account, data.accountpassword, data.secretphrase];
												db.get().query(insertquery, params, function(err4, results4) {
													if (err4) {
														console.log(err4);
														res.locals.errormsg = "Error creating user account entry.";
													} else {
														console.log("issuer user account saved");
														res.locals.id = results4.insertId;

														var completeProcess = function(req, res, next, data) {
															console.log('Funds transfered to Issuer');

															// give that the user the issuer role.
															var insertqueryroles = 'Insert into user_roles (userid, timecreated, personid, roleid) VALUE (?,?,?,?)';
															var paramsroles = [req.user.id, time, results4.insertId, res.locals.role];
															db.get().query(insertqueryroles, paramsroles, function(err5, results5) {
																if (err5) {
																	console.log(err5);
																	res.locals.errormsg = "Error creating user account role entry.";
																} else {
																	console.log("issuer user account role saved");

																	// update the Issuers loginuserid field
																	var updateissuers = 'Update issuers set loginuserid=? where id=?';
																	var paramsissuersupdate = [results4.insertId, data.id];
																	db.get().query(updateissuers, paramsissuersupdate, function(err7, results7) {
																		if (err7) {
																			console.log(err7);
																			res.locals.errormsg = "Error updating Issuer record with new User account number.";
																		} else {
																			console.log("issuer loginuserid updated");

																			// email user
																			const transporter = nodemailer.createTransport({sendmail: true});

																			var message = cfg.emailheader;

																			message += '<p>Dear '+res.locals.fullname+',</p>';
																			message += '<h3>Welcome to the Institute of Coding</h3>';
																			message += '<p>You have been registered on our website as a badge issuer by '+req.user.fullname+'.</p>';
																			message += '<p><b>Please <a href="'+cfg.protocol+'://'+cfg.domain+cfg.proxy_path+'/issuers/completeregistration/?id='+results4.insertId+'&key='+registrationkey+'">click here</a></b> to complete your registration.</p>';

																			message += '<p>Please then sign in with this email address and the password: <b>'+res.locals.password+'</b><br>';
																			message += '<br>Once you have signed in you will be redirect to a password change page.<br>';

																			message += cfg.emailfooter;

																			var mailOptions = {
																				from: cfg.fromemailaddress,
																				to: res.locals.email,
																				subject: 'Institute of Coding Badge Issuer Account',
																				html: message,
																			}

																			transporter.sendMail(mailOptions, (error, info) => {
																				if (error) {
																					return console.log(error);
																					res.locals.errormsg = "Failed to send email to issuer";
																				} else {
																					console.log('Issuer Email Message sent: ', info.messageId);
																					res.locals.finished = true;
																				}
																			});
																		}
																	});
																}
															});

															res.locals.finished = true;
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
			console.log(res.locals.errormsg);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

/**
 * Complete Registration of a website user account and forward to change password and then issuer home pages
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
				// name of recipient
				var recipientname = rows[0].fullname;

				db.get().query('UPDATE users set validationkey=?, status=1 where id=? AND registrationkey=?', [data.key, data.id, data.key], function (err2, reply2) {
					if (err) {
						console.log(err2);
						res.render('error', {message: "Error fetching user data"});
					} else {
						var sql = 'select * from users where id=(select issuers.userid from issuers left join users as B on issuers.loginuserid = B.id WHERE issuers.loginuserid=? LIMIT 1)';
						db.get().query(sql, [data.id], function (err3, rows3) {
							if (err3) {
								console.log(err3);
								res.render('error', {message: "Error fetching user data from the database"});
							} else {
								if (rows3.length > 0) {
									// email owner/issuer that the issuer has completed registration and can now have badges added to them
									var email = rows3[0].email;
									var name = rows3[0].fullname

									const transporter = nodemailer.createTransport({sendmail: true}, {
										from: cfg.fromemailaddress,
										to: email,
										subject: 'Institute of Coding Badge Issuers Registration Completed',
									});

									var message = cfg.emailheader;
									message += '<p>Dear '+name+',</p>';
									message += '<p>This is to inform you that the following Issuer has now completed the registation process:</p>';
									message += '<p><b>'+recipientname+'</b><br>';
									message += cfg.emailfooter;

									transporter.sendMail({html: message});
								}
							}
							//Change password page.
							var theurl = cfg.protocol+"://"+cfg.domain+cfg.proxy_path+"/users/changepasswordpage";
							res.render('registrationcomplete', {layout: 'registrationcomplete.hbs', from: 'issuers', url: theurl});
						});
					}
				});
			}
		}
	});
}

/**
 * Update an Issuer record entry for the given id
 *
 * @return a JSON object with the updated record entry data in or error message.
 */
exports.updateIssuer = function(req, res, next) {
	var data = matchedData(req);

	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the issuer you want to update"});
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
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action";
			} else {
				db.get().query('SELECT issuers.*, users.status from issuers left join users on issuers.loginuserid = users.id where issuers.userid=? and issuers.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error fetching issuer record";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "No issuers record found with the given id for the currently logged in user";
						} else {
							// Checked not used in an badge
							db.get().query('SELECT * from badge_issued left join badges on badges.id = badge_issued.badgeid where badges.userid=? and badges.issuerid=? and badge_issued.status in ("issued","revoked")', [req.user.id, data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error checking issuer record not used to issue a badge";
								} else {
									if (rows3.length > 0) {
										res.locals.errormsg = "This issuer record has been used and therefore can't be edited";
									} else {
										res.locals.timecreated = rows2[0].timecreated;
										if (!res.locals.status || res.locals.status === 'null' || res.locals.status === "undefined") {
											res.locals.status = -1;
										}

										res.locals.uniqueid = rows2[0].uniqueid;
										res.locals.usedInIssuance = false;

										var updatequery = "UPDATE issuers";
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

										//console.log(setquery);
										//console.log(params);

										if (setquery != "") {
											updatequery += " SET "+setquery;
											updatequery += " WHERE userid=? AND id=?";

											params.push(req.user.id);
											params.push(data.id);

											db.get().query(updatequery, params, function(err4, results4) {
												if (err4) {
													console.log(err4);
													res.locals.errormsg = "Error updating issuer record.";
												} else {
													console.log("issuer record updated");
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
exports.deleteIssuer = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the issuer you want to delete"});
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
				db.get().query('SELECT issuers.*, users.status from issuers left join users on issuers.loginuserid = users.id where issuers.userid=? and issuers.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error fetching issuer record";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "No issuers record found with the given id for the currently logged in user";
						} else {
							// Checked not used in an badge
							db.get().query('SELECT * from badge_issued left join badges on badges.id = badge_issued.badgeid where badges.userid=? and badges.issuerid=? and badge_issued.status in ("issued","revoked")', [req.user.id, data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error checking issuer record not used";
								} else {
									if (rows3.length > 0) {
										res.locals.errormsg = "This issuer record has been used to issue a badge and therefore can't be deleted";
									} else {

										var deletequery = "Delete from issuers WHERE userid=? AND id=?";
										var params = [req.user.id, data.id];

										db.get().query(deletequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												res.locals.errormsg = "Error deleting issuer record.";
											} else {
												console.log("issuer record deleted");
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
 * Return a list of all Issuer records accessible by the currently logged in user
 *
 * @return a JSON object with the Issuer record entries or error message.
 */
exports.listIssuers = function(req, res, next) {

	res.locals.issuers = [];

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				// get if used?
				db.get().query('SELECT issuers.*, users.email as loginemail, users.status from issuers left join users on issuers.loginuserid = users.id where userid=?', [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving issuer records"});
					} else {
						if (rows2.length > 0) {
							var i=0;
							function loop() {
								var next = rows2[i];

								res.locals.issuers[i] = {};
								res.locals.issuers[i].id = next["id"];
								res.locals.issuers[i].timecreated = next["timecreated"];
								res.locals.issuers[i].uniqueid = next["uniqueid"];
								res.locals.issuers[i].name = next["name"];
								res.locals.issuers[i].description = next["description"];
								res.locals.issuers[i].url = next["url"];
								res.locals.issuers[i].email = next["email"];
								res.locals.issuers[i].telephone = next["telephone"];
								res.locals.issuers[i].imageurl = next["imageurl"];

								console.log(res.locals.issuers[i]);

								if (next["status"] === null) {
									res.locals.issuers[i].status = -1;
								} else {
									res.locals.issuers[i].status = next["status"];
									if (next["loginemail"]) {
										res.locals.issuers[i].login =  next["loginemail"];
									}
								}

								console.log(res.locals.issuers[i].status);

								var sql = 'SELECT * from badge_issued ';
								sql += 'left join badges on badges.id = badge_issued.badgeid ';
								sql += 'where badges.issuerid=? and badge_issued.status in ("issued","revoked")';

								db.get().query(sql, [next["id"]], function (err3, rows3) {
									if (err3) {
										console.log(err3);
										return res.status(404).send("Error checking issuer record not used to issue a badge");
									} else {
										if (rows3.length > 0) {
											res.locals.issuers[i].usedInIssuance = true;
										} else {
											res.locals.issuers[i].usedInIssuance = false;
										}
										i++;
										if( i < rows2.length) {
											loop();
										} else {
											res.send({issuers: res.locals.issuers});
										}
									}
								});
							}
							loop();
						} else {
							res.send({issuers: res.locals.issuers});
						}
					}
				});
			}
		}
	});
}

/**
 * Return the Issuer record for the given id if accessible by the currently logged in user
 *
 * @return a JSON object with the Issuer record or error message.
 */
exports.getIssuerById = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the issuer you want to get the data for"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT issuers.*, users.email as loginemail, users.status from issuers left join users on issuers.loginuserid = users.id where issuers.userid=? and issuers.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error retrieving issuer record"});
					} else {
						if (rows2.length > 0) {
							var next = rows2[0];

							res.locals.issuer = {};
							res.locals.issuer.id = next["id"];
							res.locals.issuer.timecreated = next["timecreated"];
							res.locals.issuer.uniqueid = next["uniqueid"];
							res.locals.issuer.name = next["name"];
							res.locals.issuer.description = next["description"];
							res.locals.issuer.url = next["url"];
							res.locals.issuer.email = next["email"];
							res.locals.issuer.telephone = next["telephone"];
							res.locals.issuer.imageurl = next["imageurl"];

							if (next["status"] == null) {
								res.locals.issuer.status = -1;
							} else {
								res.locals.issuer.status = next["status"];
								if (next["loginemail"]) {
									res.locals.issuer.login =  next["loginemail"];
								}
							}

							var sql = 'SELECT * from badge_issued ';
							sql += 'left join badges on badges.id = badge_issued.badgeid ';
							sql += 'where badges.issuerid=? and badge_issued.status in ("issued","revoked")';

							db.get().query(sql, [data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error checking issuer record not used to issue a badge";
								} else {
									if (rows3.length > 0) {
										res.locals.issuer.usedInIssuance = true;
									} else {
										res.locals.issuer.usedInIssuance = false;
									}
									res.send(res.locals.issuer);
								}
							});
						} else {
							return res.status(404).send({"error": "No issuer record found with the given id for the currently logged in user"});
						}
					}
				});
			}
		}
	});
}
