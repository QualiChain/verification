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

const event_model = require('../models/events');
const user_model = require('../models/users');

const { validationResult } = require('express-validator/check');


/**
 * Get event badge stats (for leader board refresh)
 */
exports.getEventStatistics = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	// Public page?
	//user_model.verify(req, res, function(passed, error) {
	//	if (passed) {
			event_model.getEventStatistics(req, res, next);
	//	} else {
	//		res.status(401).json({ error: error });
	//	}
	//});
}

/**
 * Check if a badge recipient with the given information has been added to the system and is against the given event.
 */
exports.checkEventAttendee = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	// Public page?
	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.checkEventAttendee(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

/**
 * Draw and Event leader board and stats
 */
exports.getEventStatisticsPage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	// Public page?
	//user_model.verify(req, res, function(passed, error) {
	//	if (passed) {
			event_model.getEventStatisticsPage(req, res, next);
	//	} else {
	//		res.status(401).json({ error: error });
	//	}
	//});
}

/**
 * Get the badge Event management page
 *
 * @return the event management page.
 */
exports.getEventManagementPage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
		res.render('error', {message: "All expected properties not present"});
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.getEventManagementPage(req, res, next);
		} else {
			//console.log(req);
			let path = req.baseUrl + req._parsedUrl.pathname;
			let query = req._parsedUrl.query;
			res.render('signin', { title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: JSON.stringify(req.query), pdir: __dirname});
		}
	});
};

/**
 * Create an event entry in the system
 */
exports.createEvent = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.createEvent(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.updateEvent = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.updateEvent(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.deleteEvent = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.deleteEvent(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.getEventById = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.getEventById(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.listEvents = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.listEvents(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.addOrganizer = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.addOrganizer(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.removeOrganizer = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.removeOrganizer(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.listOrganizers = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.listOrganizers(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.addSponsor = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.addSponsor(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.removeSponsor = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.removeSponsor(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.listSponsors = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.listSponsors(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

/** EVENT RECIPIENT PERMISSIONS **/

exports.getRecipientPermssionsPage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.getRecipientPermssionsPage(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.listIssuerEvents = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.listIssuerEvents(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

/**
 * Create multiple badge recipient event permission records from a cvs file upload.
 */


exports.createBulkRecipientPermissions = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.createBulkRecipientPermissions(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.addRecipientPermission = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.addRecipientPermission(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.updateRecipientPermission = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.updateRecipientPermission(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.deleteRecipientPermission = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.deleteRecipientPermission(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.listRecipientPermissions = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			event_model.listRecipientPermissions(req, res, next);
		} else {
			res.status(401).json({ error: error });
		}
	});
}