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
const utilities = require('../utilities.js')
const nodemailer = require('nodemailer');

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const { matchedData } = require('express-validator/filter');
const contractgas = 4000000;

/**
 * Get the recipients's home page
 *
 * @return the badge portfolio page / recipient's homepage or error page.
 */
exports.getRecipientPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("recipient")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action."});
			} else {
				res.render('recipients', { title: 'My Badges'});
			}
		}
	});
}

/**
 * Get the recipient mangement page
 *
 * @return the page to manage recipients or error page.
 */
exports.getRecipientManagementPage = function(req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action."});
			} else {
				res.render('managerecipients', { title: 'Manage Badge Recipients'});
			}
		}
	});
}

/**
 * Create a new Recipient record entry
 *
 * @return a JSON object with the new record entry data in or error message.
 */
exports.createRecipient = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.name || !data.email) {
		return res.status(400).send({"error": "You must include at least the name and email address for the recipient you want to create"});
	}

	var issueruniqueid = "";
	if (data.issueruniqueid) {
		issueruniqueid = data.issueruniqueid;
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

	res.locals.id = 0;
	res.locals.name = data.name;
	res.locals.email = data.email;

	var crypto = require('crypto');
	var hash = crypto.createHash('sha256', cfg.badgesalt);
	var tempemail = data.email.toLowerCase();
	hash.update(tempemail);
	res.locals.encodedemail = 'sha256$'+hash.digest('hex');

	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;
	res.locals.issueruniqueid = issueruniqueid;

	res.locals.status = -1; // check if an account already exists for the given email address. If it does link it to this account.

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action.";
			} else {
				// create the recipient blockchain account.
				console.log("Creating Blockchain Account");

				data.accountpassword = web3.utils.sha3("The Institute of Coding" + data.email);
				data.accountname = "Recipient: "+data.name;

				handler = function(req, res, next, data){

					if(data.error && data.error.length > 0){
					   console.log("newAccount error: ");
					   console.log(data.error);
					   res.locals.errormsg = "Error creating blockchain account.";
					} else {

						// create the recipient database entry.
						var insertqueryrecipient = 'Insert into recipients (userid, timecreated, name, email, encodedemail, issueruniqueid, blockchainaccount, blockchainaccountpassword, blockchainaccountseed) VALUE (?,?,?,?,?,?,?,?,?)';
						var paramsrecipient = [req.user.id, res.locals.timecreated, res.locals.name, res.locals.email, res.locals.encodedemail, res.locals.issueruniqueid, data.account, data.accountpassword, data.secretphrase];
						db.get().query(insertqueryrecipient, paramsrecipient, function(err3, results3) {
							if (err3) {
								console.log(err3);
								res.locals.errormsg = "Error creating recipient entry.";
							} else {
								console.log("recipient entry saved");
								res.locals.id = results3.insertId;

								db.get().query('SELECT * from users where email=?', [res.locals.email], function (err4, rows4) {
									if (err4) {
										console.log(err4);
										res.locals.errormsg = "Error checking email account exists";
									} else {
										if (rows4.length <= 0) {
											res.locals.finished = true;
										} else if (rows4.length > 0) {
											// update the Recipients loginuserid field
											var updaterecipient = 'Update recipients set loginuserid=? where id=?';
											var paramsrecipientupdate = [rows4[0].id, data.id];
											db.get().query(updaterecipient, paramsrecipientupdate, function(err5, results5) {
												if (err5) {
													console.log(err5);
													res.locals.errormsg = "Error updating Recipient record with new User account number.";
												} else {
													console.log("recipient loginuserid updated");
													res.locals.finished = true;
												}
											});
										}
									}
								});
							}
						});
					}
				};

				utilities.createAccount(req, res, next, data, handler);
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
			reply.encodedemail = res.locals.encodedemail;
			reply.issueruniqueid = res.locals.issueruniqueid;
			reply.status = res.locals.status;
			reply.usedInIssuance = false;

			console.log(reply);

			res.send(reply);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			console.log(res.locals.errormsg);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds

	// check all expected variables exist, e.g.
	if (!data.name || !data.email) {
		return res.status(400).send("You must include  for the recipient you want to create");
	}
}

/**
 * Create a new Recipient website user account with recipient role
 *
 * @return a JSON object with the new record entry data in or error message.
 */
exports.createRecipientUserAccount = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({"error": "You must include the recipient id of the recipient you want to create a user account for"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

	res.locals.id = data.id;
	res.locals.timecreated = null;
	res.locals.fullname = null;
	res.locals.email = null;
	res.locals.status = 0;

	res.locals.role = 3;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions.";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action.";
			} else {

				db.get().query('SELECT * from issuers where loginuserid=?', [req.user.id], function (err6, rows6) {
					if (err6) {
						console.log(err6);
						res.locals.errormsg = "Error fetching issuer by loginuserid.";
					} else {
						if (rows6.length <= 0) {
							res.locals.errormsg = "Error fetching Issuer details for the currently logged in user.";
						} else if (rows6.length > 0) {
							res.locals.issuername = rows6[0].name;
							db.get().query('SELECT * from recipients where id=?', [data.id], function (err2, rows2) {
								if (err2) {
									console.log(err2);
									res.locals.errormsg = "Error fetching recipient by Id";
								} else {
									if (rows2.length == 0) {
										res.locals.errormsg = "There is no recipient record with the given id.";
									} else if (rows2.length > 0) {
										db.get().query('SELECT * from users where email=?', [rows2[0].email], function (err3, rows3) {
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

													var time = Math.floor((new Date().getTime()) / 1000);
													res.locals.timecreated = time;
													res.locals.fullname = rows2[0].name;
													res.locals.email = rows2[0].email;
													res.locals.password = utilities.createKey(12);

													var bcrypt = require('bcrypt');
													res.locals.hashed_password = bcrypt.hashSync(res.locals.password, 10);
													var registrationkey = utilities.createKey(20);

													var insertquery = 'Insert into users (fullname, email, hash_password, created, registrationkey) VALUE (?,?,?,?,?)';
													var params = [res.locals.fullname, res.locals.email, res.locals.hashed_password, res.locals.timecreated, registrationkey];
													db.get().query(insertquery, params, function(err4, results4) {
														if (err4) {
															console.log(err4);
															res.locals.errormsg = "Error creating user account entry.";
														} else {
															console.log("recipient user account saved");

															// give that the user the recipient role.
															var insertqueryroles = 'Insert into user_roles (userid, timecreated, personid, roleid) VALUE (?,?,?,?)';
															var paramsroles = [req.user.id, time, results4.insertId, res.locals.role];
															db.get().query(insertqueryroles, paramsroles, function(err5, results5) {
																if (err5) {
																	console.log(err5);
																	res.locals.errormsg = "Error creating user account role entry.";
																} else {
																	console.log("recipient user account role saved");

																	// update the Recipients loginuserid field
																	var updaterecipient = 'Update recipients set loginuserid=? where id=?';
																	var paramsrecipientupdate = [results4.insertId, data.id];
																	db.get().query(updaterecipient, paramsrecipientupdate, function(err7, results7) {
																		if (err7) {
																			console.log(err7);
																			res.locals.errormsg = "Error updating Recipient record with new User account number.";
																		} else {
																			console.log("recipient loginuserid updated");

																			// email user
																			const transporter = nodemailer.createTransport({sendmail: true});

																			var message = cfg.emailheader;

																			message += '<p>Dear '+res.locals.fullname+',</p>';
																			message += '<h3>Welcome to the Institute of Coding</h3>';
																			message += '<p>You have been registered on our website as a badge recipient by '+res.locals.issuername+'.</p>';
																			message += '<p><b>Please <a href="'+cfg.protocol+'://'+cfg.domain+cfg.proxy_path+'/recipients/completeregistration/?id='+results4.insertId+'&key='+registrationkey+'">click here</a></b> to complete your registration.</p>';

																			message += '<p>Please then sign in with this email address and the password: <b>'+res.locals.password+'</b><br>';
																			message += '<br>Once you have signed in you will be redirect to a password change page.<br>';
																			message += '<br>When you have completed the registration process, '+res.locals.issuername+' will be able to Issue you your Badge(s).</p><br>';

																			message += cfg.emailfooter;

																			var mailOptions = {
																				from: cfg.fromemailaddress,
																				to: res.locals.email,
																				subject: 'Institute of Coding Badge Recipient Account',
																				html: message,
																			}

																			transporter.sendMail(mailOptions, (error, info) => {
																				if (error) {
																					return console.log(error);
																					res.locals.errormsg = "Failed to send email to recipient";
																				} else {
																					console.log('Recipient Email Message sent: ', info.messageId);
																					res.locals.finished = true;
																				}
																			});
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
 * Complete Registration of a website user account and forward to change password and then recipient home pages
 *
 * @return the HTML change password page or error page.
 */
exports.completeRegistration = function(req, res, callback) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
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
					if (err2) {
						console.log(err2);
						res.render('error', {message: "Error fetching user data"});
					} else {
						var sql = 'select * from users where id=(select recipients.userid from recipients left join users as B on recipients.loginuserid = B.id WHERE recipients.loginuserid=? LIMIT 1)';
						db.get().query(sql, [data.id], function (err3, rows3) {
							if (err3) {
								console.log(err3);
								//res.render('error', {message: "Error fetching user data from the database"});
							} else {
								if (rows3.length > 0) {
									// email owner/issuer that the recipient has completed registration and can now have badges issued to them
									var email = rows3[0].email;
									var name = rows3[0].fullname;

									const transporter = nodemailer.createTransport({sendmail: true}, {
										from: cfg.fromemailaddress,
										to: email,
										subject: 'Institute of Coding Badge Recipient Registration Completed',
									});

									var message = cfg.emailheader;
									message += '<p>Dear '+name+',</p>';
									message += '<p>This is to inform you that the following badge Recipient has now completed the registation process:</p>';
									message += '<p><b>'+recipientname+'</b><br>';
									message += '<p>Please <b><a href="'+cfg.protocol+'://'+cfg.domain+cfg.proxy_path+'/assertions/">click here</a></b> and login to issue badges.</p>';
									message += cfg.emailfooter;

									transporter.sendMail({html: message});
								}
							}
							// Redirect Recipient to Change password page.
							var theurl = cfg.protocol+"://"+cfg.domain+cfg.proxy_path+"/users/changepasswordpage";
							res.render('registrationcomplete', {layout: 'registrationcomplete.hbs', from: 'recipients', url: theurl});
						});
					}
				});
			}
		}
	});
}

/**
 * Update a Recipient record entry for the given id
 *
 * @return a JSON object with the updated record entry data in or error message.
 */
exports.updateRecipient = function(req, res, next) {
	var data = matchedData(req);

	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the recipient you want to update"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;

	res.locals.id = data.id;
	res.locals.timecreated = 0;

	res.locals.name = "";
	res.locals.email = "";
	res.locals.issueruniqueid = "";
	res.locals.usedInIssuance = true;
	res.locals.encodedemail = "";

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.locals.errormsg = "Error fetching user permissions";
		} else {
			if (rows.length == 0) {
				res.locals.errormsg = "The currently logged in user does not have permissions to perform this action.";
			} else {
				db.get().query('SELECT recipients.*, users.status from recipients left join users on recipients.loginuserid = users.id where recipients.userid=? and recipients.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error fetching issuer record";
					} else {
						if (rows2.length == 0) {
							return res.status(404).send("No recipient record found with the given id for the currently logged in user");
						} else {
							// Checked not used in an badge
							db.get().query('SELECT * from badge_issued where userid=? and recipientid=? and badge_issued.status in ("issued","revoked")', [req.user.id, data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error checking recipient record not used to issue a badge";
								} else {
									if (rows3.length > 0) {
										res.locals.errormsg = "This recipient record has been used to issue a badge and therefore can't be edited";
									} else {

										res.locals.timecreated = rows2[0].timecreated;
										res.locals.status = rows2[0].status;

										if (!res.locals.status || res.locals.status === 'null' || res.locals.status === "undefined") {
											res.locals.status = -1;
										}
										if (res.locals.status == -1 && data.email) {
											res.locals.email = data.email;
										} else {
											res.locals.email = rows2[0].email;
										}
										res.locals.usedInIssuance = false;

										var updatequery = "UPDATE recipients";
										var params = [];

										var setquery = "";

										if (data.name && data.name != "") {
											setquery += "name=?"
											params.push(data.name);
											res.locals.name = data.name
										} else {
											res.locals.name = rows2[0].name;
										}

										// can still update the email address until they request account creation.
										if (res.locals.status == -1 && data.email && data.email != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "email=?"
											params.push(data.email);
											res.locals.email = data.email;

											if (setquery != "") {
												setquery += ", "
											}

											var crypto = require('crypto');
											var hash = crypto.createHash('sha256', cfg.badgesalt);
											var tempemail = data.email.toLowerCase();
											hash.update(tempemail);
											res.locals.encodedemail = 'sha256$'+hash.digest('hex');
											setquery += "encodedemail=?";
											params.push(res.locals.encodedemail);
										}
										/* else {
											res.locals.email = rows2[0].email;

											if (rows2[0].encodedemail == null || rows2[0].encodedemail == "") {
												if (setquery != "") {
													setquery += ", "
												}
												var crypto = require('crypto');
												var hash = crypto.createHash('sha256', cfg.badgesalt);
												var encodedemail = 'sha256$'+hash.digest('hex');

												setquery += "encodedemail=?";
												params.push(encodedemail);
												res.locals.encodedemail = encodedemail;
											} else {
												res.locals.encodedemail = rows2[0].encodedemail;
											}
										} */

										if (data.issueruniqueid && data.issueruniqueid != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "issueruniqueid=?"
											params.push(data.issueruniqueid);
											res.locals.issueruniqueid = data.issueruniqueid;
										} else {
											res.locals.issueruniqueid = rows2[0].issueruniqueid;
										}

										if (setquery != "") {
											updatequery += " SET "+setquery;
											updatequery += " WHERE userid=? AND id=?";

											params.push(req.user.id);
											params.push(data.id);

											console.log(updatequery);
											console.log(params);

											db.get().query(updatequery, params, function(err4, results4) {
												if (err4) {
													console.log(err4);
													res.locals.errormsg = "Error updating recipient record.";
												} else {
													console.log("recipient record updated");
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
			reply.name = res.locals.name;
			reply.email = res.locals.email;
			reply.encodedemail = res.locals.encodedemail;
			reply.issueruniqueid = res.locals.issueruniqueid;
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
 * Delete the Recipient record entry for the given id if not used in an issuance
 *
 * @return a JSON object with record id and status or error message.
 */
exports.deleteRecipient = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the recipient you want to delete"});
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
				db.get().query('SELECT recipients.*, users.status from recipients left join users on recipients.loginuserid = users.id where recipients.userid=? and recipients.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.locals.errormsg = "Error fetching issuer record";
					} else {
						if (rows2.length == 0) {
							res.locals.errormsg = "No recipient record found with the given id managed by the currently logged in user";
						} else {
							// Checked not used in an badge
							db.get().query('SELECT * from badge_issued where userid=? and recipientid=? and badge_issued.status in ("issued","revoked")', [req.user.id, data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.locals.errormsg = "Error checking recipient record not used to issue a badge";
								} else {
									if (rows3.length > 0) {
										res.locals.errormsg = "This recipient record has been used to issue a badge and therefore can't be deleted";
									} else {
										var updatequery = "DELETE from recipients WHERE userid=? AND id=?";
										var params = [req.user.id, data.id];

										db.get().query(updatequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												res.locals.errormsg = "Error deleting recipient record.";
											} else {
												console.log("recipient record deleted");
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
 * Return a list of all Recipients records accessible by the currently logged in user
 *
 * @return a JSON object with the Recipient record entries or error message.
 */
exports.listRecipients = function(req, res, next) {

	res.locals.recipients = [];

	// list recipients for the currently logged in user.
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else if (rows.length > 0) {

				db.get().query('SELECT recipients.*, users.status from recipients left join users on recipients.loginuserid = users.id where recipients.userid=?', [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error fetching Recipients"});
					} else {
						var recipients = [];
						if (rows2.length > 0) {
							var i=0;
							function loop() {
								var next = rows2[i];

								res.locals.recipients[i] = {};
								res.locals.recipients[i].id = next["id"];
								res.locals.recipients[i].timecreated = next["timecreated"];
								res.locals.recipients[i].name = next["name"];
								res.locals.recipients[i].email = next["email"];
								res.locals.recipients[i].encodedemail = next["encodedemail"];
								res.locals.recipients[i].issueruniqueid = next["issueruniqueid"];

								if (next["status"] === null) {
									res.locals.recipients[i].status = -1;
								} else {
									res.locals.recipients[i].status = next["status"];
								}

								var sql = 'SELECT badge_issued.id from badge_issued ';
								sql += 'where recipientid=? AND badge_issued.status in ("issued","revoked")';

								db.get().query(sql, [next["id"]], function (err3, rows3) {
									if (err3) {
										console.log(err3);
										return res.status(404).send("Error checking recipient record not used to issue a badge");
									} else {
										if (rows3.length > 0) {
											res.locals.recipients[i].usedInIssuance = true;
										} else {
											res.locals.recipients[i].usedInIssuance = false;
										}
										i++;
										if( i < rows2.length) {
											loop();
										} else {
											res.send({recipients: res.locals.recipients});
										}
									}
								});
							}
							loop();
						} else {
							res.send({recipients: res.locals.recipients});
						}
					}
				});
			}
		}
	});
}

/**
 * Return the Recipient record for the given unique issuer id
 *
 * @return a JSON object with the Recipient record or error message.
 */
exports.getRecipientsByUniqueId = function(req, res) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({"error": "You must include your unique id for the recipient you want to get"});
	}

	res.locals.recipients = [];

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else if (rows.length > 0) {

				db.get().query('SELECT recipients.*, users.status from recipients left join users on recipients.loginuserid = users.id where recipients.issueruniqueid=? AND recipients.userid=?', [data.id, req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error fetching recipient by unique id"});
					} else {
						if (rows2.length == 0) {
							return res.status(404).send({"error": "The recipient issuer unique id you have given does not exist in combination with the logged in user account."});
						} else {
							var i=0;
							function loop() {
								var next = rows2[i];

								res.locals.recipients[i] = {
									id:data.id,
									timecreated: next.timecreated,
									name: next.name,
									email: next.email,
									encodedemail: next.encodedemail,
									issueruniqueid: next.issueruniqueid,
								};

								if (next.status == null) {
									res.locals.recipients[i].status = -1;
								} else {
									res.locals.recipients[i].status = next.status;
								}

								var sql = 'SELECT badge_issued.id from badge_issued ';
								sql += 'where recipientid=? AND badge_issued.status in ("issued","revoked")';

								db.get().query(sql, [next["id"]], function (err3, rows3) {
									if (err3) {
										console.log(err3);
										return res.status(404).send("Error checking recipient record not used to issue a badge");
									} else {
										if (rows3.length > 0) {
											res.locals.recipients[i].usedInIssuance = true;
										} else {
											res.locals.recipients[i].usedInIssuance = false;
										}
										i++;
										if( i < rows2.length) {
											loop();
										} else {
											res.send({recipients: res.locals.recipients});
										}
									}
								});
							}
							loop();
						}
					}
				});
			}
		}
	});
}

/**
 * Return the Recipient record for the given id if accessible by the currently logged in user
 *
 * @return a JSON object with the Recipient record or error message.
 */
exports.getRecipientsById = function(req, res) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({"error": "You must include the record id for the recipient you want to get"});
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else if (rows.length > 0) {

				db.get().query('SELECT recipients.*, users.status from recipients left join users on recipients.loginuserid = users.id where recipients.userid=? AND recipients.id=? ', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error fetching recipient by record id"});
					} else {
						if (rows2.length == 0) {
							return res.status(404).send({"error": "The recipient record id you have given does not exist in combination with the logged in user account."});
						} else {
							var next = rows2[0];

							res.locals.item = {}
							res.locals.item.id = next.id;
							res.locals.item.timecreated = next.timecreated;
							res.locals.item.name = next.name;
							res.locals.item.email = next.email;
							res.locals.item.encodedemail = next.encodedemail;
							res.locals.item.issueruniqueid = next.issueruniqueid;

							if (next.status == null) {
								res.locals.item.status = -1;
							} else {
								res.locals.item.status = next.status;
							}

							var sql = 'SELECT badge_issued.id from badge_issued ';
							sql += 'where recipientid=? AND badge_issued.status in ("issued","revoked")';

							db.get().query(sql, [next["id"]], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									return res.status(404).send("Error checking recipient record not used to issue a badge");
								} else {
									if (rows3.length > 0) {
										res.locals.item.usedInIssuance = true;
									} else {
										res.locals.item.usedInIssuance = false;
									}
									res.send(res.locals.item);
								}
							});
						}
					}
				});
			}
		}
	});
}