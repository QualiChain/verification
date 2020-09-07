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
const jwt = require('jsonwebtoken');
const cfg = require('../config.js');
const bcrypt = require('bcrypt');
const utilities = require('../models/utilities.js');
const nodemailer = require('nodemailer');

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const { matchedData } = require('express-validator/filter');

comparePassword = function(password, hash_password) {
	return bcrypt.compareSync(password, hash_password);
}

/**
 * Sign in to the API and get an authorisation token
 * @param username, Required. The username to sign in to this API with - an email address.
 * @param password, Required. The pasword to sign in to this API with. Must be at least 8 characters long.
 * @return JSON with a token property and asociated API token that will expire in 5 hours, or an error object
 */
exports.signin = function(req, res, next) {
	var userData = matchedData(req);

	//console.log(userData);

	if (!userData.username || !userData.password) {
		return res.status(400).send({error: "You must send the username and the password"});
	}

	db.get().query('SELECT * from users where email=? and status=1 LIMIT 1', [userData.username], function (err, rows) {
		if (err) {
			return res.status(404).send({error:"Error fetching user record"});
		} else {
			if (rows.length > 0) {
				var user = rows[0];
				if (!comparePassword(userData.password, user.hash_password)) {
					//console.log("password missmatch: ");
					res.status(401).json({ error: "The username or password don't match"});
				} else {
					var claims = {
						userid: parseInt(user.id),
						username: user.fullname,
						email: user.email,
						initialised: Date.now()
					}

					//var expires = Math.floor(Date.now() / 1000) + (60*60*5);  // 5 hours from now?

					var token = jwt.sign(claims, cfg.keys.secret, { expiresIn: '5h'}); //(60*60*5);

					//get user roles
					var query = "SELECT users.id, GROUP_CONCAT(roles.rolename) as roles from users left join user_roles on users.id=user_roles.personid left join roles on roles.id = user_roles.roleid where users.id=?";
					db.get().query(query, [user.id, user.id], function (err4, rows4) {
						if (err4) {
							console.log(err4);
							return res.status(404).send({"error": "Error retrieving user roles"});
						} else {
							var roles = "";
							if (rows4.length > 0) {
								if (rows4[0].id == user.id) {
									roles = rows4[0].roles;
								}
							}

							var selectquery = 'SELECT * from tokens where userid=? AND token=?';
							var params = [user.id, token];
							var fullname = user.fullname;

							db.get().query(selectquery, params, function(err2, rows2) {
								if (err2) {
									console.log(err2);
									res.status(404).send({error: err2});
								} else {
									if (rows2.length > 0) {
										var updatequery = 'UPDATE tokens set created=? WHERE userid=? AND token=?';
										var time = (new Date().getTime())/1000;
										var params2 = [time, user.id, token];

										db.get().query(updatequery, params2, function(err3, results3) {
											if (err3) {
												console.log(err3);
												res.status(404).send({error: err3});
											} else {
												res.status(201).send({token: token, displayname: fullname, roles: roles});
											}
										});
									} else {
										var insertquery = 'INSERT into tokens (userid, token, created) VALUE (?,?,?)';
										var time = (new Date().getTime())/1000;
										var params2 = [user.id, token, time];

										db.get().query(insertquery, params2, function(err3, results3) {
											if (err3) {
												console.log(err3);
												res.status(404).send({error: err3});
											} else {
												res.status(201).send({token: token, displayname: fullname, roles: roles});
											}
										});
									}
								}
							});
						}
					});
				}
			} else {
				return res.status(401).send({error:"The user name given does not exist or the account creation has not yet been completed."});
			}
		}
	});
}

exports.verify = function(req, res, callback) {
	var userData = matchedData(req);

	var token;
	//token = userData.token;
	//console.log(req);
	//console.log(userData);

	//  Extract the Authorization Token
	if (req.headers && req.headers.authorization) {
		var parts = req.headers.authorization.split(' ');
		if (parts.length === 2 && parts[0] === 'Bearer') {
			token = parts[1];
		} else if (parts.length === 1) {
			token = parts[0];
		}
	} else if (req.cookies["token"] != undefined) {
		token = req.cookies["token"];
	} else if (userData.token) {
		token = userData.token;
	}

	if (token) {
		jwt.verify(token, cfg.keys.secret, function(err, decoded) {
			if (err) {
				/*
				  err = {
					name: 'TokenExpiredError',
					message: 'jwt expired',
					expiredAt: 1408621000
				  }
				*/
				if (err.name == "TokenExpiredError") {
					callback(false, "Expired Token. Please sign in again and get a new token.");
				} else {
					callback(false, err);
				}
			} else {
				var user = decoded;
				console.log(user);
				if (!user.userid) {
					callback(false, "UserID unknown or missing");
				} else {
					var values = [user.userid, user.email]
					db.get().query('SELECT * from users where id=? and email=?', values, function (err, rows) {
						if (err) {
							return res(err);
						} else {
							if (rows.length > 0) {
								req.user = rows[0];
								console.log("Returning true");
								callback(true, '');
							} else {
								callback(false, 'Unauthorized User');
							}
						}
					});
				}
			}
		}
	  );
	} else {
		callback(false, 'You must include a valid token');
	}
}

/**
 * Change a password for the currently logged in account.
 * @param newpassword, Required. The new password to change to. Must be at least 8 characters long.
 */
exports.changePassword = function(req, res, callback) {

	var data = matchedData(req);

	if (!data.newpassword) {
		return res.status(400).send("You must include the new password you want to update the currently logged in user for");
	}

	db.get().query('SELECT * from users where id=? LIMIT 1', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error:"Error fetching user record"});
		} else {
			if (rows.length > 0) {
				var user = rows[0];

				var updatequery = 'Update users set hash_password=? where id=?';
				var time = (new Date().getTime())/1000;
				var bcrypt = require('bcrypt');
				var hashed_password = bcrypt.hashSync(data.newpassword, 10);
				var params2 = [hashed_password, req.user.id];

				db.get().query(updatequery, params2, function(err2, results2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: err2});
					} else {
						res.status(200).send({message: "Password successfully updated"});
					}
				});
			}
		}
	});
}

/**
 * Request a new password. Email sent out.
 * @param, Required. The email address of the person that has forgotten their password.
 * @return JSON message property with message 'Forgot Password completed. Email sent'.
 */
exports.forgotPassword = function(req, res, callback) {

	var data = matchedData(req);

	if (!data.email) {
		return res.status(400).send("You must include the email address of the account you want to reset the password for");
	}

	db.get().query('SELECT * from users where email=? and status > 0', [data.email], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send({error:"Error fetching user record"});
		} else {
			if (rows.length > 0) {
				var user = rows[0];

				var temppassword = utilities.createKey(20);
				var hashed_password = bcrypt.hashSync(temppassword, 10);

				var updatequery = 'Update users set hash_password=?, status=2 where id=?';
				var params = [hashed_password, user.id];

				db.get().query(updatequery, params, function(err2, results2) {
					if (err2) {
						console.log(err2);
						res.status(404).send({error: "Error updating user record."});
					} else {

						// email user
						const transporter = nodemailer.createTransport({sendmail: true}, {
							from: cfg.fromemailaddress,
							to: data.email,
							subject: cfg.model_users_passwordResetEmailSubject,
						});

						var message = cfg.emailheader;
						message += '<p>'+cfg.model_users_passwordResetEmailStart+' '+rows[0].fullname+',</p>';
						message += '<p>'+cfg.model_users_passwordResetEmailLine1+'</p>';
						message += '<p><b>'+cfg.model_users_passwordResetEmailLine2A+' <a href="'+cfg.protocol+'://'+cfg.domain+cfg.proxy_path+'/users/completepasswordreset/?id='+user.id+'&key='+user.validationkey+'">'+cfg.model_users_passwordResetEmailLine2B+'</a></b> '+cfg.model_users_passwordResetEmailLine2C+'</p>';
						message += '<p>'+cfg.model_users_passwordResetEmailLine3+' <b>'+temppassword+'</b><br>';
						message += '<br>'+cfg.model_users_passwordResetEmailLine4+'</p><br>';
						message += cfg.emailfooter;

						transporter.sendMail({html: message});

						res.status(200).send({message: "Forgot Password completed. Email sent"});
					}
				});
			} else {
				res.status(404).send({error: "The given email address was not found in our database, or has not completed the registration process."});
			}
		}
	});
}

exports.completePasswordReset = function(req, res, callback) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id || !data.key) {
		res.render('error', {message: "Expected id and key properties not present"});
	}

	db.get().query('SELECT * from users where id=? AND validationkey=?', [data.id, data.key], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', {message: "Error fetching user data from the database"});
		} else {
			if (rows.length == 0) {
				res.render('error', {message: "The given id and key do not match data in our records"});
			} else {
				if (rows[0].status == 2) {
					db.get().query('UPDATE users set status=1 where id=? AND validationkey=?', [data.id, data.key], function (err2, result) {
						if (err2) {
							console.log(err2);
							res.render('error', { message: "Error fetching user data" });
						} else {
							//Change password page.
							var theurl = cfg.protocol + "://" + cfg.domain + cfg.proxy_path + "/users/changepasswordpage";
							res.render('registrationcomplete', { layout: 'registrationcomplete.hbs', from: 'users', url: theurl });
						}
					});
				} else if (rows[0].status == 1) {
					// already completed password reset. Send them to login screen
					var path = "/users/signinpage/";
					res.render('signin', { title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: "{}", pdir: __dirname });
				} else if (rows[0].status == 0) {
					res.render('error', { message: "The given account has not completed registration" });
				}
			}
		}
	});
}

/**
 * Return the account details and associated profiles for the currently logged in token holder
 * @return JSON with the user account details and any associated recipient, issuer or endorser records.
 */
exports.getProfilePage = function(req, res, next) {

	res.locals.user = {};

	db.get().query('SELECT * from users where id=? and status=1 LIMIT 1', [req.user.id], function (err, rows) {
		if (err) {
			res.render('error', { message: "Error fetching user record"});
		} else {
			if (rows.length > 0) {
				var row = rows[0];
				user.fullname = row.fullname;
				user.email = row.email;

				// Issuers
				db.get().query('SELECT issuers.name, issuers.description, issuers.url, issuers.telephone, issuers.email, issuers.imageurl, issuers.uniqueid, users.fullname as recordowner from issuers left join users on issuers.userid = users.id where loginuserid=?', [req.user.id], function (err2, rows2) {
					if (err2) {
						res.render('error', { message: "Error fetching user record - issuers"});
					} else {
						res.locals.user.issuers = [];

						if (rows2.length > 0) {
							var count = rows2.length;


							for (var i=0; i<count; i++) {
								var issuer = {};
								var next = rows2[i];
								issuer.name = rows.name;
								issuer.description = rows.description;
								issuer.url = rows.url;
								issuer.telephone = rows.telephone;
								issuer.email = rows.email;
								issuer.uniqueid = rows.uniqueid;
								issuer.recordowner = rows.recordowner;
								issuers.push(issuer);
							}
						}

						// endorsers
						db.get().query('SELECT endorsers.name, endorsers.description, endorsers.url, endorsers.telephone, endorsers.email, endorsers.imageurl, endorsers.uniqueid, users.fullname as recordowner from endorsers left join users on endorsers.userid = users.id where loginuserid=?', [req.user.id], function (err2, rows2) {
							if (err2) {
								res.render('error', { message: "Error fetching user record - endorsers"});
							} else {
								res.locals.user.endorsers = [];

								if (rows2.length > 0) {
									var count = rows2.length;

									for (var i=0; i<count; i++) {
										var endorser = {};
										var next = rows2[i];
										endorser.name = rows.name;
										endorser.description = rows.description;
										endorser.url = rows.url;
										endorser.telephone = rows.telephone;
										endorser.email = rows.email;
										endorser.uniqueid = rows.uniqueid;
										endorser.recordowner = rows.recordowner;
										endorsers.push(endorser);
									}
								}

								// recipients
								db.get().query('SELECT recipients.name, recipients.email, users.fullname as recordowner from recipients left join users on recipients.userid = users.id where loginuserid=?', [req.user.id], function (err2, rows2) {
									if (err2) {
										res.render('error', { message: "Error fetching user record - recipients"});
									} else {
										res.locals.user.recipients = [];

										if (rows2.length > 0) {
											var count = rows2.length;

											for (var i=0; i<count; i++) {
												var recipient = {};
												var next = rows2[i];
												recipient.name = rows.name;
												recipient.email = rows.email;
												recipient.recordowner = rows.recordowner;
												recipients.push(recipient);
											}
										}
										var reply = {}
										reply.fullname = res.locals.user.fullname;
										reply.email = res.locals.user.email;
										reply.issuers = res.locals.user.issuers;
										reply.endorsers = res.locals.user.endorsers;
										reply.recipients = res.locals.user.recipients;

										res.render('profile', { title: 'Account Details', data: reply});
									}
								});

							}
						});

					}
				});

			} else {
				res.render('error', { message: "The user name given does not exist or the account creation has not yet been completed."});
			}
		}
	});
}

