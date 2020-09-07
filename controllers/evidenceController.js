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

const cfg = require('../config.js');

const evidence_model = require('../models/evidence');
const user_model = require('../models/users');

const { validationResult } = require('express-validator/check');


exports.getEvidencePage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			evidence_model.getEvidencePage(req, res);
		} else {
			let path = req.baseUrl + req._parsedUrl.pathname;
			let query = req._parsedUrl.query;
			res.render('signin', { layout: 'signin.hbs', title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: JSON.stringify(req.query), pdir: __dirname});
		}
	});
};

exports.createEvidence = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			evidence_model.createEvidence(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.updateEvidence = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			evidence_model.updateEvidence(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.deleteEvidence = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			evidence_model.deleteEvidence(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.getEvidenceById = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			evidence_model.getEvidenceById(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.listEvidenceForBadge = function(req, res, next) {

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			evidence_model.listEvidenceForBadge(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}