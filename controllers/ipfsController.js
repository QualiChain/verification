
var ipfs_model = require('../models/ipfs');
var user_model = require('../models/users');

const { validationResult } = require('express-validator/check');


/**
 * Upload a file to IPFS and return the ipfs hash for the file
 */
exports.getUploadToIPFS = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			ipfs_model.getUploadToIPFS(req, res);
		} else {
			res.status(401).json({ error: message });
		}
	});
};
/**
 * Get a file from IPFS and return the the file content
 */
exports.getFileFromIPFS = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			ipfs_model.getFileFromIPFS(req, res);
		} else {
			res.status(401).json({ error: message });
		}
	});
};

/**
 * Upload a file to IPFS and return the ipfs webpage with the IPFS hash for the file passed in
 */
exports.getUploadToIPFSWeb = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			ipfs_model.getUploadToIPFSWeb(req, res);
		} else {
			res.status(401).json({ error: message });
		}
	});
};