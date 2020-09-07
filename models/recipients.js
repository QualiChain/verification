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
const nodemailer = require('nodemailer');
const fs = require('fs');
const csv = require('csv-parser');

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const { matchedData } = require('express-validator/filter');
const contractgas = 4000000;

/**
 * Get the recipients's home page
 * @return HTML of the recipients's home page or error page with error message.
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
 * Get the Recipient management page for the currently logged in issuers.
 * @return HTML page for managing Recipient records or error page with error message.
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
 * Create a new Recipient record.
 * @param name, Required. A name for the Recipient.
 * @param email, Required. An email address for the Recipient.
 * @param issueruniqueid, Optional. A unique id given by the issuer for this recipient. (internal use only)
 * @return JSON object with 'recipients', 'recipientsmissed' and 'recipientsduplicates' properties.
 */
/**
 * Create a new Recipient record entry
 *
 * @return a JSON object with the new record entry data in or an error message.
 */
exports.createRecipient = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.name || !data.email) {
		return res.status(400).send({"error": "You must include at least the name and email address for the recipient you want to create"});
	}

	res.locals.issueruniqueid = "";
	if (data.issueruniqueid) {
		res.locals.issueruniqueid = data.issueruniqueid;
	}

	res.locals.groupid = "";
	if (data.groupid) {
		res.locals.groupid = data.groupid;
	}

	var reply = {}
	reply.recipients = [];
	reply.recipientsmissed = [];
	reply.recipientsduplicate = [];

	let pendingrecipients = [];
	pendingrecipients[0] = {};
	pendingrecipients[0].name = data.name;
	pendingrecipients[0].email = data.email;
	pendingrecipients[0].issueruniqueid = res.locals.issueruniqueid;
	pendingrecipients[0].usedInIssuance = false;
	pendingrecipients[0].groupid = res.locals.groupid;

	var handler = function(err, reply) {
		if (err && err.message && err.message != "") {
			res.status(404).send({error: err.message});
		} else if (reply){

			//console.log(reply);
			res.send(reply);
		} else {
			return res.status(400).send({"error": "Unknown error creating recipient"});
		}
	}
	processRecipient(pendingrecipients, reply, req.user.id, 0, handler);
}

/**
 * Create multiple badge recipient records from a cvs file upload.
 * @param recipientdatafile, Required. The cvs file with the the recipient data to create Recipient records for, (expected on the req.files object)
 * @return JSON object with 'recipients', 'recipientsmissed' and 'recipientsduplicates' properties.
 */
exports.createBulkRecipients = function(req, res, next) {

	var data = matchedData(req);

	var recipientdata = [];

	if (!req.files) {
		return res.status(400).send('No recipient data file was uploaded.');
	} else if (!req.files.recipientdatafile) {
		return res.status(400).send({error: "You must include a recipient data file for the new recipients you wish to add"});
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
					'uniqueid': '26345'
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
							res.status(404).send({error: "Unknown Error creating recipients"});
						}
					}

					processRecipients(recipientdata, req.user.id, handler);
				})
				.on('error', (error) => {
					console.log('CSV file error');
					console.log(error);
					return res.status(400).send({error: "An error occurred parsing the recipient data file."});
				});
		});
	}
}

/**
 * Internal function to process a batch of recipient record creations.
 */
function processRecipients(recipientdata, userid, handler) {

	//console.log("IN processRecipients");

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
		pendingrecipients[i].issueruniqueid = "";
		if (item.uniqueid) {
			pendingrecipients[i].issueruniqueid = item.uniqueid;
		}
		pendingrecipients[i].groupid = "";
		if (item.groupid) {
			pendingrecipients[i].groupid = item.groupid;
		}

		pendingrecipients[i].usedInIssuance = false;
	}

	var reply = {}
	reply.recipients = [];
	reply.recipientsmissed = [];
	reply.recipientsduplicate = [];

	var innerhandler = function(err, reply) {
		if (err && err.message && err.message != "") {
			handler(err);
		} else if (reply) {
			handler(null, reply);
		} else {
			handler(new Error("Unknown Error"));
		}
	}
	processRecipient(pendingrecipients, reply, userid, 0, innerhandler);
}

/**
 * Internal function to process a recipient record creation.
 */
function processRecipient(pendingrecipients, reply, userid, index, handler) {

	if (index >= pendingrecipients.length) {
		handler(null, reply);
	} else {

		var item = pendingrecipients[index];

		//console.log("IN processRecipient");

		if (!item.name || !item.email || item.name == "" || item.email == "") {
			reply.recipientsmissed.push(item);
			index++;
			processRecipient(pendingrecipients, reply, userid, index, handler);
		} else if (!utilities.isValidEmail(item.email)) {
			reply.recipientsmissed.push(item);
			index++;
			processRecipient(pendingrecipients, reply, userid, index, handler);
		} else {
			item.id = 0;
			item.encodedemail = utilities.encodeEmail(item.email, cfg.badgesalt);
			var time = Math.floor((new Date().getTime()) / 1000);
			item.timecreated = time;
			item.status = -1; // check if an account already exists for the given email address. If it does link it to this account.

			db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [userid], function (err, rows) {
				if (err) {
					console.log(err);
					handler(new Error("Error fetching user permissions"));
				} else {
					if (rows.length == 0) {
						handler(new Error("The currently logged in user does not have permissions to perform this action."));
					} else {
						// check they have not entered this exact recipient set of details before
						db.get().query('SELECT * from recipients where name=? AND email=? AND issueruniqueid=? AND userid=?', [item.name,item.email,item.issueruniqueid,userid], function (err2, rows2) {
							if (err2) {
								console.log(err2);
								handler(new Error("Error checking if recipient already exists"));
							} else {
								if (rows2.length > 0) {
									reply.recipientsduplicates.push(item);
									index++;
									processRecipient(pendingrecipients, reply, userid, index, handler);
								} else {
									// create the recipient blockchain account.
									//console.log("Creating Blockchain Account");

									var accounthandler = function(err, accountdatareply) {

										if(err && err.message != ""){
										   console.log("newAccount error: ");
										   console.log(err);
										   handler(new Error("Error creating blockchain account."));
										} else {

		  									// create the recipient database entry.
											var insertqueryrecipient = 'Insert into recipients (userid, timecreated, name, email, encodedemail, issueruniqueid, blockchainaccount, blockchainaccountpassword, blockchainaccountseed) VALUE (?,?,?,?,?,?,?,?,?)';
											var paramsrecipient = [userid, item.timecreated, item.name, item.email, item.encodedemail, item.issueruniqueid, accountdatareply.account, accountdatareply.accountpassword, accountdatareply.secretphrase];
											db.get().query(insertqueryrecipient, paramsrecipient, function(err3, results3) {
												if (err3) {
													console.log(err3);
													handler(new Error("Error creating recipient entry."));
												} else {
													console.log("recipient entry saved");
													item.id = results3.insertId;

													// check for existing user
													db.get().query('SELECT * from users where email=?', [item.email], function (err4, rows4) {
														if (err4) {
															console.log(err4);
															handler(new Error("Error checking if user account with email already exists"));
														} else {
															if (rows4.length > 0) {
																item.status = rows4[0].status;

																db.get().query('SELECT * from issuers where loginuserid=?', [userid], function (err6, rows6) {
																	if (err6) {
																		console.log(err6);
																		handler(new Error("Error fetching issuer by loginuserid."));
																	} else {
																		if (rows6.length <= 0) {
																			handler(new Error("Error fetching Issuer details for the currently logged in user."));
																		} else if (rows6.length > 0) {
																			item.issuername = rows6[0].name;

																			// update the Recipients loginuserid field
																			var updaterecipient = 'Update recipients set loginuserid=? where id=?';
																			var paramsrecipientupdate = [rows4[0].id, item.id];

																			db.get().query(updaterecipient, paramsrecipientupdate, function(err7, results7) {
																				if (err7) {
																					console.log(err7);
																					handler(new Error("Error updating Recipient record with an existing User account number."));
																				} else {
																					console.log("recipient existing loginuserid updated");

																					// email user
																					const transporter = nodemailer.createTransport({sendmail: true});

																					// Tell them a new Issuer has added them to the system
																					var message = cfg.emailheader;
																					message += '<p>'+cfg.model_recipients_newIssuerEmailStart+' '+rows4[0].fullname+',</p>';
																					message += '<p>'+cfg.model_recipients_newIssuerEmailLine1+' '+item.issuername+'.</p>';
																					message += '<p>'+cfg.model_recipients_newIssuerEmailLine2+'</p><br>';
																					message += cfg.emailfooter;

																					var mailOptions = {
																						from: cfg.fromemailaddress,
																						to: item.email,
																						subject: cfg.model_recipients_newIssuerEmailSubject,
																						html: message,
																					}

																					transporter.sendMail(mailOptions, (error, info) => {
																						if (error) {
																							return console.log(error);
																							handler(new Error("Failed to send email to recipient"));
																						} else {
																							console.log('Recipient Email Message sent: ', info.messageId);
																							reply.recipients.push(item);

																							if (item.groupid && item.groupid != "") {
																								let innerhandler = function(err, recordid) {
																									if (err && err.message && err.message != "") {
																										res.status(404).send({error: err.message});
																									} else if (recordid) {
																										reply.recipients.push(item);
																										index++;
																										processRecipient(pendingrecipients, reply, userid, index, handler);
																									} else {
																										res.status(404).send({error: "Unknown error adding recipient to group"});
																									}
																								}
																								localAddRecipientToGroup(userid, item.timecreated, item.id, item.groupid, innerhandler);
																							} else {
																								reply.recipients.push(item);
																								index++;
																								processRecipient(pendingrecipients, reply, userid, index, handler)
																							}
																						}
																					});
																				}
																			});
																		}
																	}
																});
															} else {
																reply.recipients.push(item);

																if (item.groupid && item.groupid != "") {
																	let innerhandler = function(err, recordid) {
																		if (err && err.message && err.message != "") {
																			res.status(404).send({error: err.message});
																		} else if (recordid) {
																			reply.recipients.push(item);
																			index++;
																			processRecipient(pendingrecipients, reply, userid, index, handler);
																		} else {
																			res.status(404).send({error: "Unknown error adding recipient to group"});
																		}
																	}
																	localAddRecipientToGroup(userid, item.timecreated, item.id, item.groupid, innerhandler);
																} else {
																	reply.recipients.push(item);
																	index++;
																	processRecipient(pendingrecipients, reply, userid, index, handler)
																}
															}
														}
													});
												}
											});
										}
									};

									var accountdatareply = {};
									accountdatareply.accountpassword = web3.utils.sha3("The Institute of Coding" + item.email);
									accountdatareply.accountname = "Recipient: "+item.name;

									utilities.createAccount(accountdatareply, accounthandler);
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
 * Create a User record entry to allow an Recipient to login to the system.
 * @param id, Required. The record identifier of the Recipient record you want to add a login account for.
 * @param loginemail, Optional. An email address to use the the Recipient login account.
 * @return JSON with the data for new Recipient user account record, or a JSON error object.
 */
exports.createRecipientUserAccount = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({"error": "You must include the recipient id of the recipient you want to create a user account for"});
	}

	res.locals.id = data.id;
	res.locals.loginuserid = null;
	res.locals.timecreated = null;
	res.locals.fullname = null;
	res.locals.email = null;
	res.locals.status = 0;

	res.locals.role = 3;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions."});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action."});
			} else {

				db.get().query('SELECT * from issuers where loginuserid=?', [req.user.id], function (err6, rows6) {
					if (err6) {
						console.log(err6);
						res.status(404).send({error: "Error fetching issuer by loginuserid."});
					} else {
						if (rows6.length <= 0) {
							res.status(404).send({error: "Error fetching Issuer details for the currently logged in user."});
						} else if (rows6.length > 0) {
							res.locals.issuername = rows6[0].name;
							db.get().query('SELECT * from recipients where id=?', [res.locals.id], function (err2, rows2) {
								if (err2) {
									console.log(err2);
									res.status(404).send({error: "Error fetching recipient by Id"});
								} else {
									if (rows2.length == 0) {
										res.status(404).send({error: "There is no recipient record with the given id."});
									} else if (rows2.length > 0) {
										db.get().query('SELECT * from users where email=?', [rows2[0].email], function (err3, rows3) {
											if (err3) {
												console.log(err3);
												res.status(404).send({error: "Error user record by email address"});
											} else {
												if (rows3.length > 0) {
													// What to do if an account already exists for the given email address?
													// Update the recipient record and email the recipient
													var row = rows3[0];

													res.locals.loginuserid = row.id;
													res.locals.timecreated = row.created;
													res.locals.fullname = row.fullname;
													res.locals.email = row.email;
													res.locals.status = row.status;

													// update the Recipients loginuserid field
													var updaterecipient = 'Update recipients set loginuserid=? where id=?';
													var paramsrecipientupdate = [res.locals.loginuserid, res.locals.id];
													db.get().query(updaterecipient, paramsrecipientupdate, function(err7, results7) {
														if (err7) {
															console.log(err7);
															res.status(404).send({error: "Error updating Recipient record with an existing User account number."});
														} else {
															console.log("recipient existing loginuserid updated");

															// email user
															const transporter = nodemailer.createTransport({sendmail: true});

															// Tell them a new Issuer has added them to the system
															var message = cfg.emailheader;
															message += '<p>'+cfg.model_recipients_newIssuerEmailStart+' '+res.locals.fullname+',</p>';
															message += '<p>'+cfg.model_recipients_newIssuerEmailLine1+' '+res.locals.issuername+'.</p>';
															message += '<p>'+cfg.model_recipients_newIssuerEmailLine2+'</p><br>';
															message += cfg.emailfooter;

															var mailOptions = {
																from: cfg.fromemailaddress,
																to: res.locals.email,
																subject: cfg.model_recipients_newIssuerEmailSubject,
																html: message,
															}

															transporter.sendMail(mailOptions, (error, info) => {
																if (error) {
																	return console.log(error);
																	res.status(404).send({error: "Failed to send email to recipient"});
																} else {
																	console.log('Recipient Email Message sent: ', info.messageId);
																	let reply = {}
																	reply.id = res.locals.loginuserid;
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
															res.status(404).send({error: "Error creating user account entry."});
														} else {
															console.log("recipient user account saved");

															// give that the user the recipient role.
															var insertqueryroles = 'Insert into user_roles (userid, timecreated, personid, roleid) VALUE (?,?,?,?)';
															var paramsroles = [req.user.id, time, results4.insertId, res.locals.role];
															db.get().query(insertqueryroles, paramsroles, function(err5, results5) {
																if (err5) {
																	console.log(err5);
																	res.status(404).send({error: "Error creating user account role entry."});
																} else {
																	console.log("recipient user account role saved");

																	// update the Recipients loginuserid field
																	var updaterecipient = 'Update recipients set loginuserid=? where id=?';
																	var paramsrecipientupdate = [results4.insertId, res.locals.id];
																	db.get().query(updaterecipient, paramsrecipientupdate, function(err7, results7) {
																		if (err7) {
																			console.log(err7);
																			res.status(404).send({error: "Error updating Recipient record with new User account number."});
																		} else {
																			console.log("recipient loginuserid updated");

																			// email user
																			const transporter = nodemailer.createTransport({sendmail: true});

																			var message = cfg.emailheader;
																			message += '<p>'+cfg.model_recipients_registrationEmailStart+' '+res.locals.fullname+',</p>';
																			message += '<h3>'+cfg.model_recipients_registrationEmailLine1+'</h3>';
																			message += '<p>'+cfg.model_recipients_registrationEmailLine2+' '+res.locals.issuername+'.</p>';
																			message += '<p><b>'+cfg.model_recipients_registrationEmailLine3A+' <a href="'+cfg.protocol+'://'+cfg.domain+cfg.proxy_path+'/recipients/completeregistration/?id='+results4.insertId+'&key='+registrationkey+'">'+cfg.model_recipients_registrationEmailLine3B+'</a></b> '+cfg.model_recipients_registrationEmailLine3C+'</p>';
																			message += '<p>'+cfg.model_recipients_registrationEmailLine4+' <b>'+res.locals.password+'</b><br>';
																			message += '<br>'+cfg.model_recipients_registrationEmailLine5+'<br>';
																			message += '<br>'+cfg.model_recipients_registrationEmailLine6A+' '+res.locals.issuername+' '+cfg.model_recipients_registrationEmailLine6B+'</p><br>';
																			message += cfg.emailfooter;

																			var mailOptions = {
																				from: cfg.fromemailaddress,
																				to: res.locals.email,
																				subject: cfg.model_recipients_registrationEmailSubject,
																				html: message,
																			}

																			transporter.sendMail(mailOptions, (error, info) => {
																				if (error) {
																					return console.log(error);
																					res.status(404).send({error: "Failed to send email to recipient"});
																				} else {
																					console.log('Recipient Email Message sent: ', info.messageId);
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
 * Resend the email to invite someone to the website
 *
 * @return a JSON object with the new record entry data in or error message.
 */
exports.resendRecipientUserAccountEmail = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({"error": "You must include the recipient id of the recipient you want to create a user account for"});
	}

	res.locals.id = data.id;
	res.locals.timecreated = null;
	res.locals.fullname = null;
	res.locals.email = null;
	res.locals.status = 0;

	res.locals.role = 3;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions."});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action."});
			} else {

				db.get().query('SELECT * from issuers where loginuserid=?', [req.user.id], function (err6, rows6) {
					if (err6) {
						console.log(err6);
						res.status(404).send({error: "Error fetching issuer by loginuserid."});
					} else {
						if (rows6.length <= 0) {
							res.status(404).send({error: "Error fetching Issuer details for the currently logged in user."});
						} else if (rows6.length > 0) {
							res.locals.issuername = rows6[0].name;
							db.get().query('SELECT * from recipients where id=?', [res.locals.id], function (err2, rows2) {
								if (err2) {
									console.log(err2);
									res.status(404).send({error: "Error fetching recipient by Id"});
								} else {
									if (rows2.length == 0) {
										res.status(404).send({error: "There is no recipient record with the given id."});
									} else if (rows2.length > 0) {
										db.get().query('SELECT * from users where id=?', [rows2[0].loginuserid], function (err3, rows3) {
											if (err3) {
												console.log(err3);
												res.status(404).send({error: "Error user record does not exist"});
											} else {
												if (rows3.length == 0) {
													res.status(404).send({error: "Error user record does not exist so user can't be re-emailed."});
												} else if (rows3.length > 0) {
													res.locals.fullname = rows3[0].fullname;
													res.locals.email = rows3[0].email;

													res.locals.password = utilities.createKey(12);
													var bcrypt = require('bcrypt');
													res.locals.hashed_password = bcrypt.hashSync(res.locals.password, 10);
													var registrationkey = utilities.createKey(20);

													db.get().query('UPDATE users set hash_password=?, registrationkey=?, status=0 where id=?', [res.locals.hashed_password, registrationkey, rows3[0].id], function (err4, rows4) {
														if (err4) {
															console.log(err4);
															res.status(404).send({error: "Error updating password in user record"});
														} else {

															// email user
															const transporter = nodemailer.createTransport({sendmail: true});

															var message = cfg.emailheader;
															message += '<p>'+cfg.model_recipients_registrationEmailStart+' '+res.locals.fullname+',</p>';
															message += '<h3>'+cfg.model_recipients_registrationEmailLine1+'</h3>';
															message += '<p>'+cfg.model_recipients_registrationEmailLine2+' '+res.locals.issuername+'.</p>';
															message += '<p><b>' + cfg.model_recipients_registrationEmailLine3A + ' <a href="' + cfg.protocol + '://' + cfg.domain + cfg.proxy_path + '/recipients/completeregistration/?id=' + rows3[0].id + '&key=' + registrationkey+'">'+cfg.model_recipients_registrationEmailLine3B+'</a></b> '+cfg.model_recipients_registrationEmailLine3C+'</p>';
															message += '<p>'+cfg.model_recipients_registrationEmailLine4+' <b>'+res.locals.password+'</b><br>';
															message += '<br>'+cfg.model_recipients_registrationEmailLine5+'<br>';
															message += '<br>'+cfg.model_recipients_registrationEmailLine6A+' '+res.locals.issuername+' '+cfg.model_recipients_registrationEmailLine6B+'</p><br>';
															message += cfg.emailfooter;

															var mailOptions = {
																from: cfg.fromemailaddress,
																to: res.locals.email,
																subject: cfg.model_recipients_registrationEmailSubject,
																html: message,
															}

															transporter.sendMail(mailOptions, (error, info) => {
																if (error) {
																	return console.log(error);
																	res.status(404).send({error: "Failed to send email to recipient"});
																} else {
																	console.log('Recipient Email Message sent: ', info.messageId);
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
 * Request a Recipient website user account from the recipient record owner - Issuer
 * @param id, Required. The record identifier of the Recipient record you want to add a login account for.
 * @return a web page showing the reponse - error or sucessful request message
 */
exports.requestRecipientUserAccount = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		res.render('error', { message: "You must include the recipient id of the recipient you want to request a user account for"});
	}

	res.locals.id = data.id;

	// check not already requested
	db.get().query('SELECT * from recipientaccountrequests where recipientid=?', [res.locals.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching recipient account requests record."});
		} else {
			if (rows.length > 0) {
				res.render('error', { message: "You have already requested an account. Your badge issuer has been notifed and should deal with your request shortly."});
			} else {
				db.get().query('SELECT * from recipients where id=?', [res.locals.id], function (err1, rows1) {
					if (err1) {
						console.log(err1);
						res.render('error', { message: "Error fetching recipient record from id given."});
					} else {
						if (rows1.length == 0) {
							res.render('error', { message: "A recipient record cannot be found for the given id."});
						} else if (rows1.length > 0) {

							var recipientname = rows1[0].name;

							db.get().query('SELECT * from users where id=?', [rows1[0]["userid"]], function (err2, rows2) {
								if (err2) {
									console.log(err2);
									res.render('error', { message: "Error fetching issuer user account record"});
								} else {
									if (rows2.length == 0) {
										res.render('error', { message: "There is no issuer user account record for the given recipient."});
									} else if (rows2.length > 0) {
										var issuername = rows2[0].fullname;
										var issueremail = rows2[0].email;

										// insert record into recipientaccountrequests table
										var time = Math.floor((new Date().getTime()) / 1000);

										var inertquery = 'Insert into recipientaccountrequests (recipientid, timerequested) VALUES (?,?)';
										var paramsinertquery = [res.locals.id, time];
										db.get().query(inertquery, paramsinertquery, function(err7, results7) {
											if (err7) {
												console.log(err7);
												res.render('error', { message: "Error account insert request record."});
											} else {
												console.log("recipientaccountrequests added");

												// email issuer account request
												const transporter = nodemailer.createTransport({sendmail: true});

												// Tell them a new Issuer has added them to the system
												var message = cfg.emailheader;
												message += '<p>'+cfg.model_recipients_accountRequestEmailStart+' '+issuername+',</p>';
												message += '<p>'+cfg.model_recipients_accountRequestEmailLine1A+' <b>'+recipientname+'</b> '+cfg.model_recipients_accountRequestEmailLine1B+'</p>';
												message += '<p>'+cfg.model_recipients_accountRequestEmailLine2A+'<a href="'+cfg.protocol+'://'+cfg.domain+cfg.proxy_path+'/recipients/manage"/>'+cfg.model_recipients_accountRequestEmailLine2B+'</a> '+cfg.model_recipients_accountRequestEmailLine2C+'</p><br>';
												message += cfg.emailfooter;

												var mailOptions = {
													from: cfg.fromemailaddress,
													to: issueremail,
													subject: cfg.model_recipients_accountRequestEmailSubject,
													html: message,
												}

												transporter.sendMail(mailOptions, (error, info) => {
													if (error) {
														return console.log(error);
														res.render('error', { message: "Failed to send recipient account request email to issuer"});
													} else {
														console.log('Recipient Acount Request Email Message sent: ', info.messageId);
														var message = "Your badge issuer has been sent an account request email. You should receive an account completion email when your Issuer deals with your request."
														res.render('recipientrequestaccount', { title: 'Request Account', message: message });
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


/**
 * Call from a link in the registration email to complete Recipient account creation.
 * @param id, Required. The record identifier of the Recipient record to complete registration for.
 * @param key, Optional. The registration unique key to authorise this account registration completion.
 * @return HTML of the change password page or error page with error message.
 */
exports.completeRegistration = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id || !data.key) {
		res.render('error', {message: "Expected id and key properties not present"});
	}

	db.get().query('SELECT * from users where id=? AND registrationkey=?', [data.id, data.key], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', {message: "Error fetching user data from the database"});
		} else {
			if (rows.length == 0) {
				res.render('error', {message: "The given id and key do not match data in our records. You may have been sent a newer registraion email with a new key. Please check your emails."});
			} else {
				if (rows[0].status == 1) {
					// They have completed registration so redirect Recipient to login page.
					var path = "/users/signinpage/";
					res.render('signin', { title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: "{}", pdir: __dirname });
				} else if (rows[0].status == 2) {
					// they have requested a password reset but have possibly clicked an older email to complete registration.
					// just take them to the login and they can request again? / or give them an error message?
					res.render('error', { message: "You have completed registration already and have then requested a password reset. Please check if you have an 'Institute of Coding Account Password Reset' email." });
				} else if (rows[0].status == 0) {
					// name of recipient
					var recipientname = rows[0].fullname;

					db.get().query('UPDATE users set validationkey=?, status=1 where id=? AND registrationkey=?', [data.key, data.id, data.key], function (err2, reply2) {
						if (err2) {
							console.log(err2);
							res.render('error', { message: "Error fetching user data" });
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

										const transporter = nodemailer.createTransport({ sendmail: true }, {
											from: cfg.fromemailaddress,
											to: email,
											subject: cfg.model_recipients_registrationCompleteSubject,
										});

										var message = cfg.emailheader;
										message += '<p>' + cfg.model_recipients_registrationCompleteStart + ' ' + name + ',</p>';
										message += '<p>' + cfg.model_recipients_registrationCompleteLine1 + '</p>';
										message += '<p><b>' + recipientname + '</b><br>';
										message += '<p>' + cfg.model_recipients_registrationCompleteLine2A + ' <b><a href="' + cfg.protocol + '://' + cfg.domain + cfg.proxy_path + '/assertions/">' + cfg.model_recipients_registrationCompleteLine2B + '</a></b> ' + cfg.model_recipients_registrationCompleteLine2C + '</p>';
										message += cfg.emailfooter;

										transporter.sendMail({ html: message });
									}
								}
								// Redirect Recipient to Change password page.
								var theurl = cfg.protocol + "://" + cfg.domain + cfg.proxy_path + "/users/changepasswordpage";
								res.render('registrationcomplete', { layout: 'registrationcomplete.hbs', from: 'recipients', url: theurl });
							});
						}
					});
				}
			}
		}
	});
}

/**
 * Update an existing Recipient record.
 * @param id, Required. The record identifier of the Recipient record you want to update.
 * @param name, Required. A name for the Recipient.
 * @param email, Required. An email address for the Recipient.
 * @param issueruniqueid, Optional. A unique id given by the issuer for this Recipient. (internal use only).
 * @return JSON with the data for the updated Recipient record, or a JSON error object.
 */
exports.updateRecipient = function(req, res, next) {
	var data = matchedData(req);

	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the recipient you want to update"});
	}

	// shortcut to store data and keep scope
	res.locals.data = data;

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
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action."});
			} else {
				db.get().query('SELECT recipients.*, users.status from recipients left join users on recipients.loginuserid = users.id where recipients.userid=? and recipients.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching issuer record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No recipient record found with the given id for the currently logged in user"});
						} else {
							// Checked not used in an badge
							db.get().query('SELECT * from badge_issued where userid=? and recipientid=? and badge_issued.status in ("issued","revoked")', [req.user.id, res.locals.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error checking recipient record not used to issue a badge"});
								} else {
									if (rows3.length > 0) {
										res.status(404).send({error: "This recipient record has been used to issue a badge and therefore can't be edited"});
									} else {

										res.locals.timecreated = rows2[0].timecreated;
										res.locals.status = rows2[0].status;

										if (!res.locals.status || res.locals.status === 'null' || res.locals.status === "undefined") {
											res.locals.status = -1;
										}
										if (res.locals.status == -1 && res.locals.data.email) {
											res.locals.email = res.locals.data.email;
										} else {
											res.locals.email = rows2[0].email;
										}
										res.locals.usedInIssuance = false;

										var updatequery = "UPDATE recipients";
										var params = [];

										var setquery = "";

										if (res.locals.data.name && res.locals.data.name != "") {
											setquery += "name=?"
											params.push(res.locals.data.name);
											res.locals.name = res.locals.data.name
										} else {
											res.locals.name = rows2[0].name;
										}

										// can still update the email address until they request account creation.
										if (res.locals.status == -1 && res.locals.data.email && res.locals.data.email != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "email=?"
											params.push(res.locals.data.email);
											res.locals.email = res.locals.data.email;

											if (setquery != "") {
												setquery += ", "
											}

											res.locals.encodedemail = utilities.encodeEmail(res.locals.data.email, cfg.badgesalt);
											setquery += "encodedemail=?";
											params.push(res.locals.encodedemail);
										}

										if (res.locals.data.issueruniqueid && res.locals.data.issueruniqueid != "") {
											if (setquery != "") {
												setquery += ", "
											}
											setquery += "issueruniqueid=?"
											params.push(res.locals.data.issueruniqueid);
											res.locals.issueruniqueid = res.locals.data.issueruniqueid;
										} else {
											res.locals.issueruniqueid = rows2[0].issueruniqueid;
										}

										var reply = {}
										reply.id = res.locals.id;
										reply.timecreated = res.locals.timecreated;
										reply.name = res.locals.name;
										reply.email = res.locals.email;
										reply.encodedemail = res.locals.encodedemail;
										reply.issueruniqueid = res.locals.issueruniqueid;
										reply.status = res.locals.status;
										reply.usedInIssuance = res.locals.usedInIssuance;

										if (setquery != "") {
											updatequery += " SET "+setquery;
											updatequery += " WHERE userid=? AND id=?";

											params.push(req.user.id);
											params.push(res.locals.data.id);

											//console.log(updatequery);
											//console.log(params);

											db.get().query(updatequery, params, function(err4, results4) {
												if (err4) {
													console.log(err4);
													res.status(404).send({error: "Error updating recipient record."});
												} else {
													console.log("recipient record updated");
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
 * Delete an existing Recipient record.
 * @param id, Required. The record identifier of the Recipient you wish to delete.
 * @return JSON with the id of the Recipient record that was deleted and a status property of -1, or a JSON error object.
 */
exports.deleteRecipient = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send({"error": "You must include id for the recipient you want to delete"});
	}

	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT recipients.*, users.status from recipients left join users on recipients.loginuserid = users.id where recipients.userid=? and recipients.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error checking recipient record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No recipient record found with the given id managed by the currently logged in user"});
						} else {
							// Checked not used in an badge
							db.get().query('SELECT * from badge_issued where userid=? and recipientid=? and badge_issued.status in ("issued","revoked")', [req.user.id, res.locals.id], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error checking recipient record not used to issue a badge"});
								} else {
									if (rows3.length > 0) {
										res.status(404).send({error: "This recipient record has been used to issue a badge and therefore can't be deleted"});
									} else {
										var updatequery = "DELETE from recipients WHERE userid=? AND id=?";
										var params = [req.user.id, res.locals.id];

										db.get().query(updatequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												res.status(404).send({error: "Error deleting recipient record."});
											} else {
												console.log("recipient record deleted");
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
 * Get a list of all Recipient records for the currently logged in user (issuer).
 * @return JSON with an object with key 'recipients' pointing to an array of the Recipient records, or a JSON error object.
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
				var sqlquery = 'SELECT recipients.*, recipientaccountrequests.id as requestedaccount, users.status from recipients ';
				sqlquery += 'left join users on recipients.loginuserid = users.id ';
				sqlquery += 'left join recipientaccountrequests on recipientaccountrequests.recipientid = recipients.id ';
				sqlquery += 'where recipients.userid=? order by recipients.name';
				db.get().query(sqlquery, [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error fetching Recipients"});
					} else {
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

								if (next["requestedaccount"] === null) {
									res.locals.recipients[i].requestedaccount = false;
								} else {
									res.locals.recipients[i].requestedaccount = true;
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
 * Get an Recipient record by the issuer's unique identifier for the Recipient.
 * @param id, Required. The issuer unique identifier of the Recipient you wish to retrieve.
 * @return JSON with Recipient record data or a JSON error object.
 */
exports.getRecipientsByIssuerUniqueId = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({"error": "You must include your Issuer's unique id for the recipient you want to get"});
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
							return res.status(404).send({"error": "The recipient issueruniqueid you have given does not exist in combination with the logged in user account."});
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
 * Get an Recipient record by it's record identifier.
 * @param id, Required. The identifier of the Recipient record you wish to retrieve.
 * @return JSON with Recipient record data or a JSON error object.
 */
exports.getRecipientsById = function(req, res, next) {
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


/** RECIPIENT GROUP FUNCTIONS **/

/**
 * Get the Recipient Groups management page.
 * @return HTML page for managing Recipient groups or error page with error message.
 */
exports.getRecipientGroupsPage = function (req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions" });
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action." });
			} else {
				res.render('managerecipientgroups', { title: 'Manage Recipient Groups' });
			}
		}
	});
}

/**
 * Create a Recipient group record with the given name and status
 * @param name, Required. The name of the new Recipient group.
 * @param status, Required. The status of the new Recipient group. 0/1 to indicate if the group is active (1) or inactive (0).
 * @return JSON object of the newlt created Recipient group record or an error object.
 */
exports.createRecipientGroup = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.name || data.name == "" || data.status === 'undefined') {
		return res.status(400).send({"error": "You must include the name for the recipient group you want to create, and the status to say if the group is active"});
	}

	res.locals.id = "";
	res.locals.name = data.name;
	res.locals.status = data.status;

	var time = Math.floor((new Date().getTime()) / 1000);
	res.locals.timecreated = time;
	res.locals.uniqueid = web3.utils.sha3("alignment_" + time);

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send("Error fetching user permissions");
		} else {
			if (rows.length == 0) {
				return res.status(404).send("The logged in user account does not have the correct permissions to perform this action.");
			} else {
				var insertquery = 'INSERT INTO recipient_groups (userid, timecreated, name, status) VALUE (?,?,?,?)';
				var params = [req.user.id, res.locals.timecreated, res.locals.name, res.locals.status];
				db.get().query(insertquery, params, function(err3, result3) {
					if (err3) {
						console.log(err3);
						res.status(404).send({error: "Error saving recipient group data"});
					} else {
						console.log("recipient group saved");
						res.locals.id = result3.insertId;
						var reply = {
							 id: res.locals.id,
							 timecreated: res.locals.timecreated,
							 name: res.locals.name,
							 status: res.locals.status,
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
 * Update an existing Recipient group record
 * @param id, Required. The record identifier of the Recipient group record you wish to update.
 * @param name, Required. The name of the new Recipient group.
 * @param status, Required. The status of the new Recipient group. 0/1 to indicate if the group is active (1) or inactive (0).
 * @return JSON object of the updated Recipient group record or an error object.
 */
exports.updateRecipientGroup = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id || data.id == "" || !data.name || data.name == "" || data.status === 'undefined') {
		return res.status(400).send({"error": "You must include the id for the recipient group you want to update and the new name and status to update it to."});
	}

	res.locals.data = data;

	res.locals.id = data.id;
	res.locals.timecreated = "";
	res.locals.name = "";
	res.locals.status = 0;

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("issuer") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send("Error fetching user permissions");
		} else {
			if (rows.length == 0) {
				res.status(404).send("The logged in user account does not have the correct permissions to create a badge.");
			} else {
				db.get().query('SELECT recipient_groups.* from recipient_groups where recipient_groups.userid=? and recipient_groups.id=?', [req.user.id, res.locals.data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send("Error fetching recipient group record");
					} else {
						if (rows2.length == 0) {
							res.status(404).send("No recipient group record found with the given id for the currently logged in user");
						} else {
							res.locals.timecreated = rows2[0].timecreated;

							var updatequery = "UPDATE recipient_groups";
							var params = [];
							var setquery = "";

							if (res.locals.data.name && res.locals.data.name != "" && res.locals.data.name != rows2[0].name) {
								setquery += "name=?"
								params.push(res.locals.data.name);
								res.locals.name = res.locals.data.name;
							} else {
								res.locals.name = rows2[0].name;
							}

							if (res.locals.data.status && res.locals.data.status !== 'undefined' && res.locals.data.status != rows2[0].status) {
								setquery += "status=?"
								params.push(res.locals.data.status);
								res.locals.status = res.locals.data.status;
							} else {
								res.locals.status = rows2[0].status;
							}

							var reply = {
								 id: res.locals.id,
								 timecreated: res.locals.timecreated,
								 name: res.locals.name,
								 status: res.locals.status
							};

							if (setquery != "") {
								updatequery += " SET "+setquery;
								updatequery += " WHERE userid=? AND id=?";

								//console.log(updatequery);

								params.push(req.user.id);
								params.push(res.locals.data.id);

								db.get().query(updatequery, params, function(err4, results4) {
									if (err4) {
										console.log(err4);
										res.status(404).send({error: "Error updating recipient group record."});
									} else {
										console.log("recipient group record updated");
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

/**
 * Delete an existing Recipient group record.
 * @param id, Required. The record identifier of the Recipient group you wish to delete.
 * @return JSON with the id of the Recipient group record that was deleted and a status property of -1, or a JSON error object.
 */
exports.deleteRecipientGroup = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({"error": "You must include the id for the recipient group you want to delete"});
	}

	res.locals.id = data.id;

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The currently logged in user does not have permissions to perform this action"});
			} else {
				db.get().query('SELECT recipient_groups.* from recipient_groups where recipient_groups.userid=? and recipient_groups.id=?', [req.user.id, res.locals.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error checking recipient group record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No recipient group record found with the given id managed by the currently logged in user"});
						} else {
							var updatequery = "DELETE from recipient_groups WHERE userid=? AND id=?";
							var params = [req.user.id, res.locals.id];

							db.get().query(updatequery, params, function(err4, results4) {
								if (err4) {
									console.log(err4);
									res.status(404).send({error: "Error deleting recipient group record."});
								} else {
									console.log("recipient group record deleted");
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
 * Get the Recipient Groups management page.
 * @return HTML page for managing Recipient groups or error page with error message.
 */
exports.getRecipientGroupingsPage = function (req, res, next) {
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions" });
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action." });
			} else {
				res.render('managerecipientgroupings', { title: 'Manage Recipient Groupings' });
			}
		}
	});
}

/**
 * Get a list of all Recipient group records for the currently logged in user (issuer).
 * @return JSON with an object with key 'recipientgroups' pointing to an array of the Recipient group records, or a JSON error object.
 */
exports.listRecipientGroups = function(req, res, next) {

	res.locals.recipientgroups = [];

	// list recipient groups for the currently logged in user.
	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else if (rows.length > 0) {
				var sqlquery = 'SELECT recipient_groups.* from recipient_groups where recipient_groups.userid=?';
				db.get().query(sqlquery, [req.user.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({"error": "Error fetching Recipient groups"});
					} else {
						if (rows2.length > 0) {
							for (let i=0; i<rows2.length; i++) {
								let next = rows2[i];

								res.locals.recipientgroups[i] = {};
								res.locals.recipientgroups[i].id = next["id"];
								res.locals.recipientgroups[i].timecreated = next["timecreated"];
								res.locals.recipientgroups[i].name = next["name"];
								res.locals.recipientgroups[i].status = next["status"];
							}
						}
						res.send({recipientgroups: res.locals.recipientgroups});
					}
				});
			}
		}
	});
}

/**
 * local function called by other functions in this library to add a recipient to a group.
 * logged in user permissions should be checked by the calling function please.
 */
function localAddRecipientToGroup(userid, timecreated, recipientid, groupid, handler) {

	if (!userid || userid == ""
			|| !timecreated || timecreated == ""
			|| !recipientid || recipientid == ""
			|| !groupid || groupid == "") {
		handler(new Error("You must include the userid, the time, the recipientid and the groupid properties for this new recipient grouping record"));
	}

	// check groupid exists and is owned by the current user
	db.get().query('SELECT recipient_groups.* from recipient_groups where recipient_groups.userid=? and recipient_groups.id=?', [userid, groupid], function (err2, rows2) {
		if (err2) {
			console.log(err2);
			handler(new Error("Error checking recipient group record"));
		} else {
			if (rows2.length == 0) {
				handler(new Error("No recipient group record found with the given id for the currently logged in user"));
			} else {
				// check recipient record exists and is owned by the current user
				db.get().query('SELECT recipients.* from recipients where recipients.userid=? and recipients.id=?', [userid, recipientid], function (err3, rows3) {
					if (err3) {
						console.log(err3);
						handler(new Error("Error checking recipient record"));
					} else {
						if (rows3.length == 0) {
							handler(new Error("No recipient record found with the given recipient id for the currently logged in user"));
						} else {
							var insertquery = 'INSERT INTO recipient_grouping (userid, timecreated, recipientid, groupid) VALUE (?,?,?,?)';
							var params = [userid, timecreated, recipientid, groupid];
							db.get().query(insertquery, params, function(err, result) {
								if (err) {
									console.log(err);
									handler(new Error("Error adding recipient to group: "+recipientid));
								} else {
									console.log("Recipient added to group: "+recipientid);
									let newid = result.insertId;
									handler(null, newid);
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
 * Add a Recipient to a Recipient group.
 * @param id, Required. The record identifier of the Recipient group you wish to add a Recipient to.
 * @param recipientid, Required. The record identifier of the Recipient you wish to add to the Recipient group.
 * @return JSON object representing the new association between the Recipient and the Recipient group.
 */
exports.addRecipientToGroup = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id || data.id == "" || !data.recipientid || data.recipientid == "") {
		return res.status(400).send({"error": "You must include the id of the recipient group you want add a recipient to and the recipient id of the recipient to add."});
	}

	res.locals.id  = "";
	res.locals.groupid  = data.id;
	res.locals.recipientid  = data.recipientid;
	res.locals.timecreated  = "";

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("issuer") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				let time = Math.floor((new Date().getTime()) / 1000);
				let innerhandler = function(err, recordid) {
					if (err && err.message && err.message != "") {
						res.status(404).send({error: err.message});
					} else if (recordid) {
						res.locals.id = recordid;
						var reply = {}
						reply.id = res.locals.id;
						reply.timecreated = res.locals.timecreated;
						reply.groupid = res.locals.groupid;
						reply.recipientid = res.locals.recipientid;
						res.send(reply);
					} else {
						res.status(404).send({error: "Unknown error adding recipient to group"});
					}
				}
				localAddRecipientToGroup(req.user.id, time, res.locals.recipientid, res.locals.groupid, innerhandler);
			}
		}
	});
}

/**
 * Remove a Recipient from a Recipient group.
 * @param id, Required. The record identifier of the Recipient you wish to remove a from the Recipient group.
 * @param recipientid, Required. The record identifier of the Recipient group you wish to remove the Recipient from.
 * @return JSON object with the properties, 'id', 'recipientid' and 'status' which is set to -1 to indicate the deletion of the association.
 */
exports.removeRecipientFromGroup = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id || data.id == "" || !data.recipientid || data.recipientid == "") {
		return res.status(400).send({"error": "You must include the id of the recipient group you want remove a recipient from and the recipient id of the recipient to remove."});
	}

	res.locals.groupid  = data.id;
	res.locals.recipientid  = data.recipientid;

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("issuer") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				// check groupid exists and is owned by the current user
				db.get().query('SELECT recipient_groups.* from recipient_groups where recipient_groups.userid=? and recipient_groups.id=?', [req.user.id, res.locals.groupid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching recipient group record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No recipient group record found with the given id for the currently logged in user"});
						} else {
							// check recipient record exists and is owned by the current user
							db.get().query('SELECT recipients.* from recipients where recipients.userid=? and recipients.id=?', [req.user.id, res.locals.recipientid], function (err3, rows3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error fetching recipient record"});
								} else {
									if (rows3.length == 0) {
										res.status(404).send({error: "No recipient record found with the given id for the currently logged in user"});
									} else {
										var deletequery = "DELETE from recipient_grouping where userid=? and recipientid=? and groupid=?";
										var params = [req.user.id, res.locals.recipientid, res.locals.groupid];

										db.get().query(deletequery, params, function(err4, results4) {
											if (err4) {
												console.log(err4);
												res.status(404).send({error: "Error removing recipient from group."});
											} else {
												console.log("Recipient removed from group");
												var reply = {
													 groupid: res.locals.groupid,
													 recipientid: res.locals.recipientid,
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

/**
 * Replace all the Recipients that are in the group with the list of Recipients given.
 * This replaces all previous settings of recipients for this group with just the given list of recipients.
 * @param id, Required. The record identifier of the Recipient group to set the Recipients for
 * @param recipientids. Required. A comma separate list of Recipient record identifiers so set as the Recipients for the Recipient group. An empty string will empty the group
 */
exports.setRecipientForGroup = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id || data.id == "" || data.recipientids === undefined) {
		return res.status(400).send({ "error": "You must include the id of the recipient group you want to set the recipients for and a comma separated list of the recipient ids of the recipient to set."});
	}

	res.locals.id  = "";
	res.locals.groupid  = data.id;
	res.locals.recipientids  = data.recipientids;

	db.get().query('SELECT roles.rolename FROM users, roles, user_roles WHERE users.id = user_roles.personid AND user_roles.roleid = roles.id AND roles.rolename IN ("issuer") AND users.id = ?', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.status(404).send({error: "The logged in user account does not have the correct permissions to perform this action."});
			} else {
				// check groupid exists and is owned by the current user
				db.get().query('SELECT recipient_groups.* from recipient_groups where recipient_groups.userid=? and recipient_groups.id=?', [req.user.id, res.locals.groupid], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error fetching recipient group record"});
					} else {
						if (rows2.length == 0) {
							res.status(404).send({error: "No recipient group record found with the given id for the currently logged in user"});
						} else {
							// remove existing group to recipient relationships
							db.get().query('Delete from recipient_grouping where userid=? and groupid=?', [req.user.id, res.locals.groupid], function(err3, results3) {
								if (err3) {
									console.log(err3);
									res.status(404).send({error: "Error removing recipients from group."});
								} else {
									console.log("Recipients removed from group");

									if (res.locals.recipientids != "") {
										var returnhandler = function(err, recipientids) {
											if (err && err.message && err.message != "") {
												res.status(404).send({error: err.message});
											} else if (recipientids) {
												var reply = {}
												reply.groupid = res.locals.groupid;
												reply.recipientids = res.locals.recipientids;
												reply.status = 1;

												res.send(reply);
											} else {
												res.status(404).send({error: "Unknown error adding recipients to group"});
											}
										}
										addRecipientsToGroup(req.user.id, res.locals.recipientids, res.locals.groupid, returnhandler);
									} else {
										var reply = {}
										reply.groupid = res.locals.groupid;
										reply.recipientids = res.locals.recipientids;
										reply.status = 1;

										res.send(reply);
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


function addRecipientsToGroup(userid, recipientids, groupid, handler) {

	if (groupid && groupid != "" && groupid !== -1 && recipientids && recipientids != "") {
		let localrecipientids = recipientids.split(",");

		if (localrecipientids.length > 0) {
			addRecipientToGroupRecursive(localrecipientids, userid, groupid, 0, handler);
		} else {
			handler(null, recipientids);
		}
	} else {
		handler(null, recipientids);
	}
}

function addRecipientToGroupRecursive(recipientids, userid, groupid, index, handler) {

	if (index >= recipientids.length) {
		handler(null, recipientids);
	} else {
		var  recipientid = recipientids[index];
		recipientid = recipientid.trim();
		if (recipientid && recipientid != "") {
			var time = Math.floor((new Date().getTime()) / 1000);

			var innerhandler = function(err, recordid) {
				if (err && err.message && err.message != "") {
					handler(new Error(err.message));
				} else if (recordid) {
					index++;
					addRecipientToGroupRecursive(recipientids, userid, groupid, index, handler);
				} else {
					handler(new Error("Unknown error adding recipient to group"));
				}
			}
			localAddRecipientToGroup(userid, time, recipientid, groupid, innerhandler);
		} else {
			index++;
			addRecipientToGroupRecursive(recipientids, userid, groupid, index, handler);
		}
	}
}

/**
 * Get a list of all the Recipients for the Recipient group with the given record identifier.
 * @param id, Required. The record identifier of the Recipient group you wish to get Recipients for.
 * @return JSON with an object with key 'recipients' pointing to an array of the Recipient records, or a JSON error object.
 */
exports.listRecipientsInGroup = function(req, res, next) {
	var data = matchedData(req);

	//console.log(data);

	// should never need this as the check is done in the routes
	if (!data.id || data.id == "") {
		return res.status(400).send({"error": "You must include the id of the recipient group you want to list recipients for"});
	}

	res.locals.recipients = [];

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("issuer")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({"error": "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				return res.status(404).send({"error": "The currently logged in user does not have permissions to perform this action"});
			} else {
				var query = "SELECT recipients.* FROM recipients ";
				query += "left join recipient_grouping on recipients.id = recipient_grouping.recipientid ";
				query += "left join recipient_groups on recipient_grouping.groupid = recipient_groups.id ";
				query += "WHERE recipient_groups.id=? order by recipients.name";

				db.get().query(query, [data.id], function (err2, rows2) {
					if (err2) {
						console.log(err2);
						return res.status(404).send({error: "Error retrieving recipient in group"});
					} else {
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

								if (next["requestedaccount"] === null) {
									res.locals.recipients[i].requestedaccount = false;
								} else {
									res.locals.recipients[i].requestedaccount = true;
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