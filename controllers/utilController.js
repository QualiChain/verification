
var util_model = require('../models/util');
var user_model = require('../models/users');

const { validationResult } = require('express-validator/check');

/**
 * Put the given hash string into a transaction's input field on the blockchain
 *
 * @param token, your authorisation token.
 * @param hash, the hash you want to add to a transaction's input field on the blockchain.
 * @return transactio nnumber for the transaction putting the hash on the blockchain, or error.
 */exports.putTransactionMessage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			util_model.putTransactionMessage(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
}

/**
 * Get the input hash from the transaction for the given transaction number
 *
 * @param token, your authorisation token.
 * @param transactionnumber, the transaction number whose hash you want to get.
 * @return hash, the hash found in the transaction's input field, or error.
 */
exports.getTransactionMessage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			util_model.getTransactionMessage(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
}

/**
 * Get a hash (web.sha3) of the given string.
 */
exports.getStringHash = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			util_model.getStringHash(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
};

/**
 * Get the json transaction object for the given transaction number
 *
 * @param transaction, the transaction number to get the object for.
 * @return json transaction object for the given transaction number, null if number not found, or error.
 */
exports.getTransaction = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			util_model.getTransaction(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
};

/**
 * Get the json transaction receipt object for the given transaction number
 *
 * @param transaction, the transaction number to get the object for.
 * @return json transaction object for the given transaction number, null if number not found, or error.
 */
exports.getTransactionReceipt = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			util_model.getTransactionReceipt(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
};

/**
 * Get the json block object for the given block number
 *
 * @param block, the block number to get the object for.
 * @return json block object for the given block number, null if number not found, or error.
 */
exports.getBlock = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			util_model.getBlock(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
};

/**
 * Get the block number of the current block
 *
 * @return the block number of the current block, or error.
 */
exports.getCurrentBlockNumber = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, message) {
		if (passed) {
			util_model.getCurrentBlockNumber(req, res, next);
		} else {
			res.status(401).json({ error: message });
		}
	});
};