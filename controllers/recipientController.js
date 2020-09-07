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

const recipient_model = require('../models/recipients');
const user_model = require('../models/users');

const { validationResult } = require('express-validator/check');


/**
 * Get the badge Recipient home page
 *
 * @return the badge issuer page.
 */
exports.getRecipientPage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.getRecipientPage(req, res, next);
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

/**
 * Get the badge Recipient home page
 *
 * @return the badge issuer page.
 */
exports.getRecipientManagementPage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.getRecipientManagementPage(req, res, next);
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

exports.listRecipients = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.listRecipients(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.getRecipientsByUniqueId = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.getRecipientsByUniqueId(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
};

exports.getRecipientsById = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.getRecipientsById(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
};

exports.createRecipient = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.createRecipient(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.createBulkRecipients = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.createBulkRecipients(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.createRecipientUserAccount = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.createRecipientUserAccount(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.resendRecipientUserAccountEmail = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.resendRecipientUserAccountEmail(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

// public - should come from email links mostly
exports.requestRecipientUserAccount = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	recipient_model.requestRecipientUserAccount(req, res, next);
}

exports.completeRegistration = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	recipient_model.completeRegistration(req, res, next);
}

exports.updateRecipient = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.updateRecipient(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.deleteRecipient = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.deleteRecipient(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}


/** RECIPIENT GROUP ROUTE FUNCTIONS **/

/**
 * Recipient group page
 */
exports.getRecipientGroupsPage = function (req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function (passed, error) {
		if (passed) {
			recipient_model.getRecipientGroupsPage(req, res, next);
		} else {
			//console.log(req);
			let path = req.baseUrl + req._parsedUrl.pathname;
			let query = req._parsedUrl.query;
			res.render('signin', { title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: JSON.stringify(req.query), pdir: __dirname });
		}
	});
};


/**
 * Create a recipient group record with the given name
 */
exports.createRecipientGroup = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.createRecipientGroup(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

/**
 * Update the name of a recipient group record with the the given id to the given name
 */
exports.updateRecipientGroup = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.updateRecipientGroup(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

/**
 * Delete a recipient group record with the given id
 */
exports.deleteRecipientGroup = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.deleteRecipientGroup(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

/**
 * List recipient group record for the logged in user
 */
exports.listRecipientGroups = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.listRecipientGroups(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

/**
 * Add a recipient to a group
 */
exports.addRecipientToGroup = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.addRecipientToGroup(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

/**
 * Recipient group page
 */
exports.getRecipientGroupingsPage = function (req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function (passed, error) {
		if (passed) {
			recipient_model.getRecipientGroupingsPage(req, res, next);
		} else {
			//console.log(req);
			let path = req.baseUrl + req._parsedUrl.pathname;
			let query = req._parsedUrl.query;
			res.render('signin', { title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: JSON.stringify(req.query), pdir: __dirname });
		}
	});
};


/**
 * Set the recipients in the given group.
 * This replaces all previous settings of recipients for this group with just the given list.
 */
exports.setRecipientForGroup = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.setRecipientForGroup(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

/**
 * Remove a recipient from a group
 */
exports.removeRecipientFromGroup = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.removeRecipientFromGroup(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

/**
 * List all the recipients in the given recipient group
 */
exports.listRecipientsInGroup = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			recipient_model.listRecipientsInGroup(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}


