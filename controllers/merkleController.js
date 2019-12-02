var cfg = require('../config.js');

var user_model = require('../models/users');
var merkle_model = require('../models/merkle');

const { validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

/**
 * View the page that lists RDF Merkle Trees already stored for user and form to add a new one.
 */
exports.listView = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			merkle_model.listView(req, res, next);
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
 * Retrieve a list of stored RDF Merkle Trees for a given user.
 */
exports.list = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			merkle_model.list(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
};

/**
 * Display web page for validating RDF data against a specific RDF Merkle Tree for a given user.
 */
exports.validateView = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			merkle_model.validateView(req, res, next);
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
 * View the page that lists RDF Merkle Trees already stored for user and form to add a new one.
 */
exports.storeView = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			merkle_model.storeView(req, res, next);
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
 * Retrieve contract details relating to a specific RDF Merkle Tree for a given user.
 */
exports.store = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			merkle_model.getAllData(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
};

/**
 * Create new Merkle Tree data on IPFS and create associated contract.
 */
exports.createMerkle = function(req, res, next) {
	var data = matchedData(req);
	//console.log(data);

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			merkle_model.createMerkle(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
};


/**
 * Validate an entire RDF dataset against a stored RDF Merkle set.
 */
exports.validateSetFromURL = function(req, res, next) {
	var data = matchedData(req);
	//console.log(data);

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			merkle_model.validateSetFromURL(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
};

/**
 * Validate an entire RDF dataset against a stored RDF Merkle set.
 */
exports.validateSetFromFile = function(req, res, next) {
	var data = matchedData(req);
	//console.log(data);

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			merkle_model.validateSetFromFile(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
};

/**
 * Validate a single RDF triple against a stored RDF Merkle set.
 */
exports.validateSingle = function(req, res, next) {
	var data = matchedData(req);
	//console.log(data);

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			merkle_model.validateSingle(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
};

/**
 * Validate a partial RDF dataset against a stored RDF Merkle set.
 */
exports.validateSubsetFromURL = function(req, res, next) {
	var data = matchedData(req);
	//console.log(data);

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			merkle_model.validateSubsetFromURL(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
};

/**
 * Validate a partial RDF dataset against a stored RDF Merkle set.
 */
exports.validateSubsetFromFile = function(req, res, next) {
	var data = matchedData(req);
	//console.log(data);

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			merkle_model.validateSubsetFromFile(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
};

/**
 * Retrieve the title of a stored RDF Merkle set.
 */
exports.storeTitle = function(req, res, next) {
	var data = matchedData(req);
	//console.log(data);

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			merkle_model.storeTitle(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
};

