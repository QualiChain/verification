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

var endorser_model = require('../models/endorsers');
var user_model = require('../models/users');

const { validationResult } = require('express-validator/check');


/**
 * Get the badge Endorsers home page
 *
 * @return the badge issuer page.
 */
exports.getEndorserPage = function(req, res, next) {

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.render('error', {message: "All expected properties not present"});
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			endorser_model.getEndorserPage(req, res);
		} else {
			//console.log(req);
			var path = req.baseUrl + req._parsedUrl.pathname;
			var query = req._parsedUrl.query;
			res.render('signin', { title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: JSON.stringify(req.query), pdir: __dirname});
			// render sign in page
			//res.status(401).json({ error: 'Unauthorized user!' });
			//res.status(401).json({ error: req.originalUrl });
		}

	});
};

/**
 * Get the badge Endorsers home page
 *
 * @return the badge issuer page.
 */
exports.getEndorserManagementPage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
		res.render('error', {message: "All expected properties not present"});
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			endorser_model.getEndorserManagementPage(req, res, next);
		} else {
			//console.log(req);
			var path = req.baseUrl + req._parsedUrl.pathname;
			var query = req._parsedUrl.query;
			res.render('signin', { title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: JSON.stringify(req.query), pdir: __dirname});
			// render sign in page
			//res.status(401).json({ error: 'Unauthorized user!' });
			//res.status(401).json({ error: req.originalUrl });
		}
	});
};

exports.createEndorser = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			endorser_model.createEndorser(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.createEndorserUserAccount = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			endorser_model.createEndorserUserAccount(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.completeRegistration = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.render('error', {message: "Expected id and key properties not present 2"});
	}

	endorser_model.completeRegistration(req, res, next);
}

exports.updateEndorser = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			endorser_model.updateEndorser(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.deleteEndorser = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			endorser_model.deleteEndorser(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.listEndorsers = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			endorser_model.listEndorsers(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.getEndorserById = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			endorser_model.getEndorserById(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

