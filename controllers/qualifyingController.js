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

const qualifying_model = require('../models/qualifying');
const user_model = require('../models/users');

const { validationResult } = require('express-validator/check');


/******************** Public Routes *********************/

exports.getQualifyingBadgeManagementPage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			qualifying_model.getQualifyingBadgeManagementPage(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.getQualifyingBadgeIssuerPage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			qualifying_model.getQualifyingBadgeIssuerPage(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.createBadge = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			qualifying_model.createBadge(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.updateBadge = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			qualifying_model.updateBadge(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.deleteBadge = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			qualifying_model.deleteBadge(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.listAllBadges = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			qualifying_model.listAllBadges(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.qualifyingCheck = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	qualifying_model.qualifyingCheck(req, res, next);
}

exports.enableUpdate = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			qualifying_model.enableUpdate(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.checkUserMatch = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}
	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			qualifying_model.checkUserMatch(req, res, next);
		} else {
			let reply = {};
			reply.signedon = false;
			reply.identityok = false;
			res.send(reply);
		}
	});
}

exports.checkUserEmailMatch = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}
	qualifying_model.checkUserEmailMatch(req, res, next);
}

exports.createAccount = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	qualifying_model.createAccount(req, res, next);
}

exports.completeRegistration = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	qualifying_model.completeRegistration(req, res, next);
}

exports.loadRemoteData = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}
	qualifying_model.loadRemoteData(req, res, next);
}