
/* ipfs.js */
/* This file renders the ipfs.hbs file. */

var express = require('express');
var router = express.Router();

var ipfs_controller = require('../controllers/ipfsController');
const { check } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');


/*Get ipfs page page */
router.get('/', function(req, res, next) {
	res.render('ipfs', { response: ""});
});

/**
 * Upload a file to IPFS and return the ipfs webpage with the IPFS hash for the file passed in
 */
router.post('/', [
	check('token').optional(),
	check('ipfsfile').withMessage('You must include the file you want to add to ipfs')
], ipfs_controller.getUploadToIPFSWeb);

/**
 * Upload a file to IPFS and return the ipfs hash for the file
 */
router.post('/upload', [
	check('token').optional(),
	check('ipfsfile').withMessage('You must include the file you want to add to ipfs')
], ipfs_controller.getUploadToIPFS);

module.exports = router;

/**
 * Get a file from IPFS and return the the file content
 */
router.post('/get', [
	check('token').optional(),
	check('ipfshash').withMessage('You must include the hash of the file want to get from ipfs')
], ipfs_controller.getFileFromIPFS);


module.exports = router;


// change to check('token').optional()
// instead of
// check('token').withMessage('You must include an authorisation token')