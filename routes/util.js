
var express = require('express');
var path = require('path');
var router = express.Router();

var util_controller = require('../controllers/utilController');
const { check } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

router.get('/docs', function(req, res, next) {
	res.render('docsutil', { title: 'Utilities API Documentation' });
});

/**
 * Put the given hash string into a transaction's input field on the blockchain
 *
 * @param token, your authorisation token.
 * @param hash, the hash you want to add to a transaction's input field on the blockchain.
 * @return transactio nnumber for the transaction putting the hash on the blockchain, or error.
 */
router.post('/addhashtotransaction', [
	check('token').optional(),
	check('hash').withMessage('You must include the hash you want to put on the blockchain')
], util_controller.putTransactionMessage);

/**
 * Get the input hash from the transaction for the given transaction number
 *
 * @param token, your authorisation token.
 * @param transactionnumber, the transaction number whose hash you want to get.
 * @return hash, the hash found in the transaction's input field, or error.
 */
router.post('/transactionhash', [
	check('token').optional(),
	check('transactionnumber').withMessage('You must include the transaction number for the transaction you want to get the hash input from')
], util_controller.getTransactionMessage);


/**
 * Get a hash (web.sha3) of the given string.
 *
 * @param token, your authorisation token.
 * @param stringtohash, the string you want to hash.
 * @return hash of the given string.
 */
router.post('/hashstring', [
	check('token').optional(),
	check('stringtohash').withMessage('You must include the string you want to hash')
], util_controller.getStringHash);

/**
 * Get the json transaction object for the given transaction number
 *
 * @param token, your authorisation token.
 * @param transactionnumber, the transaction number to get the object for.
 * @return json transaction object for the given transaction number, null if number not found, or error.
 */
router.post('/transaction', [
	check('token').optional(),
	check('transactionnumber').withMessage('You must include the transaction number for the transaction you wish to get')
], util_controller.getTransaction);

/**
 * Get the json transaction receipt object for the given transaction number
 *
 * @param token, your authorisation token.
 * @param transactionnumber, the transaction number to get the object for.
 * @return json transaction object for the given transaction number, null if number not found, or error.
 */
router.post('/transactionreceipt', [
	check('token').optional(),
	check('transactionnumber').withMessage('You must include the transaction number for the transaction receipt you wish to get')
], util_controller.getTransactionReceipt);

/**
 * Get the json block object for the given block number
 *
 * @param token, your authorisation token.
 * @param blocknumber, the block number to get the object for.
 * @return json block object for the given block number, null if number not found, or error.
 */
router.post('/block', [
	check('token').optional(),
	check('blocknumber').withMessage('You must include the block number for the block you wish to get')
], util_controller.getBlock);

/**
 * Get the block number of the current block
 *
 * @param token, your authorisation token.
 * @return the block number of the current block, or error.
 */
router.post('/currentblocknumber', [
	check('token').optional()
], util_controller.getCurrentBlockNumber);


module.exports = router;
