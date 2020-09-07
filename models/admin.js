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

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const { matchedData } = require('express-validator/filter');
const contractgas = 6000000;

/**
 * Get the Admin's home page
 *
 * @return the issuer's home page.
 */
exports.getAdminPage = function(req, res, next) {

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.render('error', { message: "Error fetching user permissions"});
		} else {
			if (rows.length == 0) {
				res.render('error', { message: "The currently logged in user does not have permissions to perform this action"});
			} else {
				var isSuper = false;
				for (let i=0; i<rows.length; i++) {
					var rolename = rows[0].rolename
					if (rolename == "super") {
						isSuper = true;
						break;
					}
				}

				var object = {};

				object["Manage Issuers"] = cfg.proxy_path+'/issuers/manage';
				object["Manage Endorsers"] = cfg.proxy_path+'/endorsers/manage';
				object["Manage Alignments"] = cfg.proxy_path+'/alignments/manage';
				object["Manage Organizations"] = cfg.proxy_path+'/organizations/manage';
				object["Manage Events"] = cfg.proxy_path+'/events/manage';
				object["Manage Badges"] = cfg.proxy_path+cfg.badges_path+'/manage';
				object["Create Badge Images"] = cfg.proxy_path+cfg.badges_path+'/images/manage';
				//object["Manage Pods"] = cfg.proxy_path+'/pods/manage';

				if (isSuper) {
					object["Manage Assertions"] = cfg.proxy_path+'/assertions/admin/';
				}

				res.render('admin', { title: 'Administration', sections: JSON.stringify(object)});
			}
		}
	});
}

exports.getIssuerById = function(req, res, next) {
	var data = matchedData(req);

	// check all expected variables exist, e.g.
	if (!data.id) {
		return res.status(400).send("You must include id for the issuer you want to get the data for");
	}

	db.get().query('SELECT rolename from users left join user_roles on users.id = user_roles.personid left join roles on user_roles.roleid = roles.id where users.id=? AND roles.rolename IN ("super", "admin")', [req.user.id], function (err, rows) {
		if (err) {
			console.log(err);
			return res.status(404).send("Error fetching user permissions");
		} else {
			if (rows.length == 0) {
				return res.status(403).send("The currently logged in user does not have permissions to perform this action");
			} else {
				db.get().query('SELECT issuers.*, users.status from issuers left join users on issuers.loginuserid = users.id where issuers.userid=? and issuers.id=?', [req.user.id, data.id], function (err, rows) {
					if (err) {
						console.log(err);
						return res.status(404).send("Error retrieving issuer record");
					} else {
						if (rows.length > 0) {
							var next = rows[0];

							var issuer = {};
							issuer.id = next["id"];
							issuer.timecreated = next["timecreated"];
							issuer.name = next["name"];
							issuer.description = next["description"];
							issuer.url = next["url"];
							issuer.email = next["email"];
							issuer.telephone = next["telephone"];
							issuer.imageurl = next["imageurl"];
							issuer.status = next["status"];

							res.send(issuer);
						} else {
							return res.status(404).send("No issuer record found with the given id for the currently logged in user");
						}
					}
				});
			}
		}
	});
}
