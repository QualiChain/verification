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
const NodeRSA = require('node-rsa');

// Create web3 instance
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const { matchedData } = require('express-validator/filter');
const contractgas = 6000000;

/**
 * Get the issuer's home page
 * @return HTML of the issuers's home page or error page with error message.
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
				res.render('issuers', { title: 'Educator Administration'});
			}
		}
	});
}

/**
 * Get the Issuer management page for the currently logged in administrator.
 * @return HTML page for managing Issuer records or error page with error message.
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

/**
 * Create a new Issuer record.
 * @param name, Required. A name for the Issuer.
 * @param url, Required. A website url for the Issuer.
 * @param email, Optional. An email address for the Issuer.
 * @param telephone, Optional. A telephone Number for the Issuer.
 * @param description, Optional. A textual description of the Issuer.
 * @param imageurl, Optional. A URL pointing to a logo / image file for the Issuer.
 * @return JSON with the data for new Issuer record, or a JSON error object.
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
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action."});
			} else {

				const key = new NodeRSA({b: 1024});
				privatekey = key.exportKey('pkcs1-private-pem');
				publickey = key.exportKey('pkcs1-public-pem');

				// create the issuer database entry.
				var insertqueryissuer = 'Insert into issuers (userid, timecreated, uniqueid, name, description, url, telephone, email, imageurl, privatekey, publickey) VALUE (?,?,?,?,?,?,?,?,?,?,?)';
				var paramsissuer = [req.user.id, res.locals.timecreated, res.locals.uniqueid, res.locals.name, res.locals.description, res.locals.url, res.locals.telephone, res.locals.email, res.locals.imageurl, privatekey, publickey];
				db.get().query(insertqueryissuer, paramsissuer, function(err3, results3) {
					if (err3) {
						console.log(err3);
						res.status(404).send({error: "Error creating issuer entry."});
					} else {
						res.locals.id = results3.insertId;
						console.log("issuer entry saved");

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
					}
				});
			}
		}
	});
}

/**
 * Create a User record entry to allow an Issuer to login to the system.
 * @param id, Required. The record identifier of the Issuer record you want to add a login account for.
 * @param loginemail, Required. An email address to use the the Issuer login account.
 * @return JSON with the data for new Issuer user account record, or a JSON error object.
 */
exports.createIssuerUserAccount = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id || !data.loginemail) {
		return res.status(400).send({"error": "You must include the issuer id and a login email address for the issuer you want to create a user account for"});
	}

	res.locals.issuerid = data.id;
	res.locals.id = "";
	res.locals.timecreated = null;
	res.locals.fullname = null;
	res.locals.email = data.loginemail;
	res.locals.status = 0;

	res.locals.role = 4;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions."});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action."});
			} else {
				db.get().query('SELECT * from issuers where id=?', [res.locals.issuerid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching issuer by Id"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "There is no issuer record with the given id."});
						} else if (rows2.length > 0) {
							res.locals.fullname = rows2[0].name;

							db.get().query('SELECT * from users where email=?', [res.locals.email], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error user record by email address"});
								} else {
									if (rows3.length > 0) {
										res.status(404).send({error: "An account with the given login email address already exists"});
									} else if (rows3.length == 0) {
										console.log("Creating Blockchain Account");

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
														console.log("issuer user account saved");
														res.locals.id = results4.insertId;

														let completeProcess = function(err2, transferdatareply) {
															if (err2) {
																console.log(err2)
																res.status(404).send({error: "Error transfering funds to blockchain account."});
															} else {
																console.log('Funds transfered to Issuer');

																// give that the user the issuer role.
																var insertqueryroles = 'Insert into user_roles (userid, timecreated, personid, roleid) VALUE (?,?,?,?)';
																var paramsroles = [req.user.id, time, results4.insertId, res.locals.role];
																db.get().query(insertqueryroles, paramsroles, function(err5, results5) {
																	if (err5) {
																		console.log(err5);
																		res.status(404).send({error: "Error creating user account role entry."});
																	} else {
																		console.log("issuer user account role saved");

																		// update the Issuers loginuserid field
																		var updateissuers = 'Update issuers set loginuserid=? where id=?';
																		var paramsissuersupdate = [results4.insertId, res.locals.issuerid];
																		db.get().query(updateissuers, paramsissuersupdate, function(err7, results7) {
																			if (err7) {
																				console.log(err7);
																				res.status(404).send({error: "Error updating Issuer record with new User account number."});
																			} else {
																				console.log("issuer loginuserid updated");

																				// email user
																				const transporter = nodemailer.createTransport({sendmail: true});

																				var message = cfg.emailheader;
																				message += '<p>'+cfg.model_issuers_registrationEmailStart+' '+res.locals.fullname+',</p>';
																				message += '<h3>'+cfg.model_issuers_registrationEmailLine1+'</h3>';
																				message += '<p>'+cfg.model_issuers_registrationEmailLine2+' '+req.user.fullname+'.</p>';
																				message += '<p><b>'+cfg.model_issuers_registrationEmailLine3A+' <a href="'+cfg.protocol+'://'+cfg.domain+cfg.proxy_path+'/issuers/completeregistration/?id='+results4.insertId+'&key='+registrationkey+'">'+cfg.model_issuers_registrationEmailLine3B+'</a></b> '+cfg.model_issuers_registrationEmailLine3C+'</p>';
																				message += '<p>'+cfg.model_issuers_registrationEmailLine4+' <b>'+res.locals.password+'</b><br>';
																				message += '<br>'+cfg.model_issuers_registrationEmailLine5+'<br>';
																				message += cfg.emailfooter;

																				var mailOptions = {
																					from: cfg.fromemailaddress,
																					to: res.locals.email,
																					subject: cfg.model_issuers_registrationEmailSubject,
																					html: message,
																				}

																				transporter.sendMail(mailOptions, (error, info) => {
																					if (error) {
																						return console.log(error);
																						res.status(404).send({error: "Failed to send email to issuer"});
																					} else {
																						console.log('Issuer Email Message sent: ', info.messageId);

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
										accountdata.accountname = "Issuer: "+res.locals.fullname;

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
 * Call from a link in the registration email to complete Issuer account creation.
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
										subject: cfg.model_issuers_registrationCompleteSubject,
									});

									var message = cfg.emailheader;
									message += '<p>'+cfg.model_issuers_registrationCompleteStart+' '+name+',</p>';
									message += '<p>'+cfg.model_issuers_registrationCompleteLine1+'</p>';
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
 * Update an existing Issuer record.
 * @param id, Required. The record identifier of the Issuer record you want to update.
 * @param name, Optional. A name for the Issuer.
 * @param description, Optional. A textual description of the Issuer.
 * @param url, Optional. A website url for the Issuer.
 * @param email, Optional. An email address for the Issuer.
 * @param telephone, Optional. A telephone Number for the Issuer.
 * @param imageurl, Optional. A URL pointing to a logo / image file for the Issuer.
 * @return JSON with the data for the updated Issuer record, or a JSON error object.
 */
exports.updateIssuer = function(req, res, next) {
	var data = matchedData(req);

	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the issuer you want to update"});
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
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT issuers.*, users.status from issuers left join users on issuers.loginuserid = users.id where issuers.userid=? and issuers.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching issuer record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No issuers record found with the given id for the currently logged in user"});
						} else {
							// Checked not used in an badge
							db.get().query('SELECT * from badge_issued left join badges on badges.id = badge_issued.badgeid where badges.userid=? and badges.issuerid=? and badge_issued.status in ("issued","revoked")', [req.user.id, data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error checking issuer record not used to issue a badge"});
								} else {
									if (rows3.length > 0) {
										res.status(404).send({error: "This issuer record has been used and therefore can't be edited"});
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
													res.status(404).send({error: "Error updating issuer record."});
												} else {
													console.log("issuer record updated");
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
 * Delete an existing Issuer record.
 * @param id, Required. The record identifier of the Issuer you wish to delete.
 * @return JSON with the id of the Issuer record that was deleted and a status property of -1, or a JSON error object.
 */
exports.deleteIssuer = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the issuer you want to delete"});
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
				db.get().query('SELECT issuers.*, users.status from issuers left join users on issuers.loginuserid = users.id where issuers.userid=? and issuers.id=?', [req.user.id, data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching issuer record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No issuers record found with the given id for the currently logged in user"});
						} else {
							// Checked not used in an badge
							db.get().query('SELECT * from badge_issued left join badges on badges.id = badge_issued.badgeid where badges.userid=? and badges.issuerid=? and badge_issued.status in ("issued","revoked")', [req.user.id, data.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error checking issuer record not used"});
								} else {
									if (rows3.length > 0) {
										res.status(404).send({error: "This issuer record has been used to issue a badge and therefore can't be deleted"});
									} else {

										var deletequery = "Delete from issuers WHERE userid=? AND id=?";
										var params = [req.user.id, data.id];

										db.get().query(deletequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												res.status(404).send({error: "Error deleting issuer record."});
											} else {
												console.log("issuer record deleted");
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
 * Get a list of all Issuer records for the currently logged in user (issuer).
 * @return JSON with an object with key 'issuers' pointing to an array of the Issuer records, or a JSON error object.
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

								if (next["status"] === null) {
									res.locals.issuers[i].status = -1;
								} else {
									res.locals.issuers[i].status = next["status"];
									if (next["loginemail"]) {
										res.locals.issuers[i].login =  next["loginemail"];
									}
								}

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
 * Get an Issuer record by it's record identifier.
 * @param id, Required. The identifier of the Issuer record you wish to retrieve.
 * @return JSON with Issuer record data or a JSON error object.
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
									res.status(404).send({error: "Error checking issuer record not used to issue a badge"});
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


/**
 * Get a Badge type record in Open Badge JSONLD format used with blockchain verified version by it's record identifier.
 * @param id, Required. The identifier of the Badge record you wish to retrieve.
 * @return Open Badge JSONLD of the Badge data, or a JSON error object.
 */
exports.getIssuerJSONByUniqueId = function(req, res, next) {
	var data = matchedData(req);
	if (!data.id) {
		data.id = req.params.badgeid;
	}

	// check all expected variables exist
	if (!data.id) {
		return res.status(400).send({"error": "You must include the unique id for the issuer you want to view the JSON data for"});
	}

	db.get().query('SELECT distinct * from issuers where issuers.uniqueid=? LIMIT 1', [data.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error retrieving issuer record"});
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
				exports.getIssuerOpenBadgeJSON(rows[0].id, innerhandler);
			} else {
				res.status(404).send({error: "No issuer record found with the given unique id"});
			}
		}
	});
}

/**
 * Get a Badge type record in Open Badge JSONLD format for hosted verification versions by it's record identifier.
 * @param id, Required. The identifier of the Badge record you wish to retrieve.
 * @return Open Badge JSONLD of the Badge data, or a JSON error object.
 */
exports.getHostedIssuerJSONByUniqueId = function(req, res, next) {
	var data = matchedData(req);
	if (!data.id) {
		data.id = req.params.badgeid;
	}

	// check all expected variables exist
	if (!data.id) {
		return res.status(400).send({"error": "You must include the unique id for the issuer you want to view the JSON data for"});
	}

	db.get().query('SELECT distinct * from issuers where issuers.uniqueid=? LIMIT 1', [data.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error retrieving issuer record"});
		} else {
			if (rows.length > 0) {
				var innerhandler = function(err, issuerjson) {
					if (err && err.message != "") {
						res.status(404).send({error: err.message});
					} else {
						//console.log(issuerjson);
						res.send(issuerjson);
					}
				}
				getHostedIssuerOpenBadgeJSON(rows[0].id, innerhandler);
			} else {
				res.status(404).send({error: "No issuer record found with the given id"});
			}
		}
	});
}

exports.getIssuerOpenBadgeJSON = function(issuerid, handler) {
	// check all expected variables exist
	if (!issuerid) {
		handler(new Error("You must provide the issuer id of the issuer JSON you wish to retrieve"));
	}

	db.get().query('SELECT * from issuers where issuers.id=? LIMIT 1', [issuerid], function (err, rows) {
		if (err) {
			console.log(err);
			handler(new Error("Error retrieving issuer record"));
		} else {
			if (rows.length > 0) {
				var row = rows[0];

				// ISSUER
				let issuerjson = {};
				issuerjson["@context"] = "https://w3id.org/openbadges/v2";
				issuerjson["type"] = "Issuer",
				issuerjson["id"] = cfg.uri_stub+"issuers/"+row["uniqueid"];
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
					//badgejson["issuer"]["image"]["caption"] = row.issuerimagecaption;
					//badgejson["issuer"]["image"]["author"] = row.issuerimageauthor;
				}

				handler(null, issuerjson);
			} else {
				handler(new Error("No issuer record found with the given record id"));
			}
		}
	});
}

// called internally from badge model
exports.getIssuerOpenBadgeURI = function(id, hosted, handler) {
	// check all expected variables exist
	if (!id) {
		handler(new Error("You must include the id of the issuer you want the uri for"));
	}

	db.get().query('SELECT uniqueid from issuers where issuers.id=? LIMIT 1', [id], function (err, rows) {
		if (err) {
			console.log(err);
			handler(new Error("Error retrieving issuer record"));
		} else {
			if (rows.length > 0) {
				var row = rows[0];

				let issueruri = "";
				if (hosted == true) {
					issueruri = cfg.uri_stub+"issuers/hosted/"+row["uniqueid"];
				} else {
					issueruri = cfg.uri_stub+"issuers/"+row["uniqueid"];
				}

				handler(null, issueruri);
			} else {
				handler(new Error("No issuer record found with the given record id"));
			}
		}
	});
}

// local helper function
function getHostedIssuerOpenBadgeJSON(issuerid, handler) {
	// check all expected variables exist
	if (!issuerid) {
		handler(new Error("You numst iclude the id of the issuer you want to get the Open Badge JSON for"));
	}

	db.get().query('SELECT * from issuers where issuers.id=? LIMIT 1', [issuerid], function (err, rows) {
		if (err) {
			console.log(err);
			handler(new Error("Error retrieving issuer record"));
		} else {
			if (rows.length > 0) {
				var row = rows[0];

				// ISSUER
				let issuerjson = {};
				issuerjson["@context"] = "https://w3id.org/openbadges/v2";
				issuerjson["type"] = "Issuer",
				issuerjson["id"] = cfg.uri_stub+"issuers/hosted/"+row["uniqueid"];
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

				if (row["telephone"] && row["telephone"] != "") {
					issuerjson["telephone"] = row["telephone"];
				}

				if (row["imageurl"] && row["imageurl"] != "") {
					issuerjson["image"] = {};
					issuerjson["image"]["type"] = "ImageObject";
					issuerjson["image"]["id"] = row["imageurl"];
					//badgejson["issuer"]["image"]["caption"] = row.issuerimagecaption;
					//badgejson["issuer"]["image"]["author"] = row.issuerimageauthor;
				}

				issuerjson.publicKey = cfg.uri_stub + "keys/public/" + row["uniqueid"];
				issuerjson.verification = {};
				issuerjson.verification.type = "hosted";

				handler(null, issuerjson);
			} else {
				handler(new Error("No issuer record found with the given record id"));
			}
		}
	});
}