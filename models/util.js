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
/** Author: Kevin Quick, KMi, The Open University **/

const utilities = require('../utilities.js');

var cfg = require('../config.js');
//var path = require('path');
var fs = require('fs');

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const { matchedData } = require('express-validator/filter');

/**
 * Put the given hash string into a transaction's input field on the blockchain
 *
 * @param token, your authorisation token.
 * @param hash, the hash you want to add to a transaction's input field on the blockchain.
 * @return transactio nnumber for the transaction putting the hash on the blockchain, or error.
 */
exports.putTransactionMessage = function(req, res, next) {
	var data = matchedData(req);
	if (!data.hash) {
		return res.status(400).send({error:"You must include the hash you want to put in a transaction input field"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.transaction = "";

	var createTransaction = function(req, res, next) {
		var handler = function (e, transaction) {
			if (!e) {
				res.locals.transaction = transaction;
			} else {
				console.log("getTransaction error: "+e);
				res.locals.errormsg = e;
			}
		};
		web3.eth.sendTransaction({from: req.user.blockchainaccount, to: req.user.blockchainaccount, data: data.hash}, handler);
	}
	unlockAccount(req, res, next, createTransaction);

	req.flagCheck = setInterval(function() {
		if (res.locals.transaction != "") {
			clearInterval(req.flagCheck);
			if (res.locals.transaction == null) {
				res.status(404).send({error: "Error: invalid transaction number"});
			} else {
				res.send({transactionnumber: res.locals.transaction});
			}
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: ""+res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

/**
 * Get the input hash from the transaction for the given transaction number
 *
 * @param token, your authorisation token.
 * @param transactionnumber, the transaction number whose hash you want to get.
 * @return hash, the hash found in the transaction's input field, or error.
 */
exports.getTransactionMessage = function(req, res, next) {
	var data = matchedData(req);
	if (!data.transactionnumber) {
		return res.status(400).send({error:"You must include the transaction number of the transaction whose message you want to get"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.transaction = "";
	res.locals.message = "";

	var handler = function (e, transaction) {
		if (!e) {
			res.locals.transaction = transaction;
			res.locals.message = transaction.input;
		} else {
			console.log("getTransaction error: "+e);
			res.locals.errormsg = e;
		}
	};
	web3.eth.getTransaction(data.transactionnumber, handler);

	req.flagCheck = setInterval(function() {
		if (res.locals.transaction != "") {
			clearInterval(req.flagCheck);
			if (res.locals.transaction == null) {
				res.status(404).send({error: "Error: invalid transaction number"});
			} else {
				res.send({hash: res.locals.message});
			}
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

/**
 * Get a hash (web.sha3) of the given string.
 *
 * @param token, your authorisation token.
 * @param stringtohash, the string you want to hash.
 * @return hash of the given string.
 */
exports.getStringHash = function(req, res, next) {
	var data = matchedData(req);

	if (!data.stringtohash) {
		return res.status(400).send({error:"You must include the string you want to hash"});
	}

	res.send({hash: "0x"+web3.utils.sha3(data.stringtohash)});
}

/**
 * Get the json transaction object for the given transaction number
 *
 * @param transactionnumber, the transaction number to get the object for.
 * @return json transaction object for the given transaction number, or error.
 */
exports.getTransaction = function(req, res, next) {
	var data = matchedData(req);
	if (!data.transactionnumber) {
		return res.status(400).send({error:"You must include the transaction number of the transaction you want to get"});
	}

	utilities.getTransaction(data.transactionnumber, req, res);
};

/**
 * Get the json transaction receipt object for the given transaction number
 *
 * @param transaction, the transaction number to get the object for.
 * @return json transaction receipt object for the given transaction number, or error.
 */
exports.getTransactionReceipt = function(req, res, next) {
	var data = matchedData(req);
	if (!data.transactionnumber) {
		return res.status(400).send({error: "You must include the transaction number of the transaction receipt you want to get"});
	}

	utilities.getTransactionReceipt(data.transactionnumber, req, res);
};

/**
 * Get the json block object for the given block number
 *
 * @param blocknumber, the block number to get the object for.
 * @return json block object for the given block number, or error.
 */
exports.getBlock = function(req, res, next) {
	var data = matchedData(req);
	if (!data.blocknumber) {
		return res.status(400).send({error:"You must include the block number of the block you want to get"});
	}

	utilities.getBlock(data.blocknumber, req, res);
};

/**
 * Get the block number of the current block
 *
 * @return the block number of the current block, or error.
 */
exports.getCurrentBlockNumber = function(req, res, next) {

	utilities.getCurrentBlockNumber(req, res, next);
};
