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

var cfg = require('../config.js');

const { check } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

var user_model = require('../models/users');
//var async = require('async');

const { validationResult } = require('express-validator/check');

exports.user_signin = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}
	user_model.signin(req, res, next);
};

/**
 * Change the password for the currently logged in user
 *
 * @return a message about success or an error.
 */
exports.changePassword = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			user_model.changePassword(req, res);
		} else {
			res.status(401).json({ error: error });
		}

	});
};

/**
 * Redirect to the change password page, after making sure they are logged in
 *
 * @return the change password page after making sure they are logged in.
 */
exports.changePasswordPage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		var data = matchedData(req);
		if (passed) {
			//var path = req._parsedUrl.pathname;
			var path = data.from;
			res.render('changepassword', { title: 'Change Password', protocol: cfg.protocol, domain: cfg.domain, path: path, pdir: __dirname});
		} else {
			var path = req.baseUrl + req._parsedUrl.pathname;
			var query = req._parsedUrl.query;
			//console.log(req);
			res.render('signin', { title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: JSON.stringify(req.query), pdir: __dirname});
		}
	});
};

/**
 * Forgot Password
 *
 * @return a message about success or an error.
 */
exports.forgotPassword = function(req, res, next) {

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.forgotPassword(req, res);
};

exports.completePasswordReset = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.render('error', {message: "Expected id and key properties not present"});
	}

	user_model.completePasswordReset(req, res, next);
}

/**
 * Get the profile page for the current token holder
 *
 * @return a call to the model for the profile page for the current token holder.
 */
exports.getProfilePage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			user_model.getProfilePage(req, res);
		} else {
			res.status(401).json({ error: error });
		}

	});
};