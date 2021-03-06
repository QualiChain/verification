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

const badge_model = require('../models/badges');
const user_model = require('../models/users');

const { validationResult } = require('express-validator/check');


/******************** Public Routes *********************/

/**
 * Return the JSON of an base badge used with blockchain verification
 */
exports.getBadgeJSONByUniqueId = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	// public page so no login checks
	badge_model.getBadgeJSONByUniqueId(req, res, next);
}

/**
 * Return the JSON of a base badge used with hosted verification
 */
exports.getHostedBadgeJSONByUniqueId = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	// public page so no login checks
	badge_model.getHostedBadgeJSONByUniqueId(req, res, next);
}

/**
 * Return the view all base badges page which will display base badge data for badges that have been issued
 */
exports.getViewAllBaseBadgesPage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	// public page so no login checks
	badge_model.getViewAllBaseBadgesPage(req, res, next);
}

exports.getBadgeByAddress = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	badge_model.getBadgeByAddress(req, res, next);
};

/***********************************************************/

exports.getBadgeById = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			badge_model.getBadgeById(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

/**
 * Get the badge Managment home page
 *
 */
exports.getBadgeManagementPage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			badge_model.getBadgeManagementPage(req, res, next);
		} else {
			//console.log(req);
			let path = req.baseUrl + req._parsedUrl.pathname;
			let query = req._parsedUrl.query;
			res.render('signin', { title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: JSON.stringify(req.query), pdir: __dirname});
			// render sign in page
			//res.status(401).json({ error: 'Unauthorized user!' });
			//res.status(401).json({ error: req.originalUrl });
		}

	});
};

/** FUNCTION FOR BADGE IMAGE MANAGEMENT **/

/**
 * Get the badge image creation/management page
 */
exports.getBadgeImageManagementPage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			badge_model.getBadgeImageManagementPage(req, res, next);
		} else {
			//console.log(req);
			let path = req.baseUrl + req._parsedUrl.pathname;
			let query = req._parsedUrl.query;
			res.render('signin', { title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: JSON.stringify(req.query), pdir: __dirname});
		}
	});
};

exports.createBadgeImage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			badge_model.createBadgeImage(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.updateBadgeImage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			badge_model.updateBadgeImage(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.publishBadgeImage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			badge_model.publishBadgeImage(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.deleteBadgeImage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			badge_model.deleteBadgeImage(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.listBadgeImages = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			badge_model.listBadgeImages(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

/***********************************************************/


exports.listBadges = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			badge_model.listBadges(req, res, next);
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
			badge_model.listAllBadges(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.getViewIssuerBadgesPage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			badge_model.getViewIssuerBadgesPage(req, res, next);
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
			badge_model.createBadge(req, res, next);
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
			badge_model.updateBadge(req, res, next);
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
			badge_model.deleteBadge(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.listAlignments = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			badge_model.listAlignments(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.listCriteriaEvents = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			badge_model.listCriteriaEvents(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.validate = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	badge_model.validate(req, res, next);
};

exports.validatesigned = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	badge_model.validatesigned(req, res, next);
};