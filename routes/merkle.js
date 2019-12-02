
/* merkle.js */
/* This file renders the merkle.hbs file. */

var express = require('express');
var router = express.Router();
var path = require('path');

var merkle_controller = require('../controllers/merkleController');
const { check } = require('express-validator/check');

router.get('/docs', function(req, res, next) {
	res.render('docsmerkle', { title: 'Merkle Store API Documentation' });
});

/*Get home page */
router.get('/view', function(req, res, next) {
	res.render('merkle', { title: 'RDF Dataset verification via Merkle Trees and the Blockchain', pdir: __dirname});
});

/**
 * View the page that lists RDF Merkle Trees already stored for user and form to add a new one.
 */
router.get('/list/view', [
	check('token').optional()
], merkle_controller.listView);

/**
 * Display web page for validating RDF data against a specific RDF Merkle Tree for a given user.
 */
router.get('/validate/view', [
	check('token').optional(),
	check('address').optional()
], merkle_controller.validateView);


/**
 * Retrieve a list of stored RDF Merkle Trees for a given user.
 */
router.post('/list', [
	check('token').optional()
], merkle_controller.list);

/**
 * Display web page to show all details relating to a specific RDF Merkle Tree for a given user.
 */
router.get('/store/view', [
	check('token').optional(),
	check('address').optional()
], merkle_controller.storeView);

/**
 * Retrieve contract details relating to a specific RDF Merkle Tree for a given user.
 */
router.post('/store', [
	check('token').optional(),
	check('address', 'You must include the contract address for this RDF Merkle Tree record').not().isEmpty()
], merkle_controller.store);

/**
 * Create RDF Merkle Trees for a given user.
 */
router.post('/list/createMerkle', [
	check('token').optional(),
	check('title', 'You must include the title for this RDF Merkle Tree record').not().isEmpty()
], merkle_controller.createMerkle);

/**
 * Validate an entire RDF dataset against a stored RDF Merkle set.
 */
router.post('/validate/setfromurl', [
	check('token').optional(),
	check('url').isURL({require_tld: false}).withMessage('You must include the url for the triple data you wish to validate'),
	check('contract', 'You must include the blockchain address for the RDF Merkle Tree record the set is being validated against').not().isEmpty()
], merkle_controller.validateSetFromURL);

/**
 * Validate an entire RDF dataset against a stored RDF Merkle set.
 */
router.post('/validate/set', [
	check('token').optional(),
	check('contract', 'You must include the blockchain address for the RDF Merkle Tree record the set is being validated against').not().isEmpty()
], merkle_controller.validateSetFromFile);

/**
 * Retrieve the title of a stored RDF Merkle set.
 */
router.post('/store/title', [
	check('token').optional(),
	check('contract', 'You must include the blockchain address for the RDF Merkle Tree record the set is being validated against').not().isEmpty()
], merkle_controller.storeTitle);

/**
 * Validate a single RDF triple against a stored RDF Merkle set.
 */
router.post('/validate/single', [
	check('token').optional(),
	check('contract', 'You must include the blockchain address for the RDF Merkle Tree record the set is being validated against').not().isEmpty(),
	check('triple', 'You must include RDF data for a single record').not().isEmpty()
], merkle_controller.validateSingle);


/**
 * Validate an entire RDF dataset against a stored RDF Merkle set.
 */
router.post('/validate/subsetfromurl', [
	check('token').optional(),
	check('url').isURL({require_tld: false}).withMessage('You must include the url for the triple data you wish to validate'),
	check('contract', 'You must include the blockchain address for the RDF Merkle Tree record the set is being validated against').not().isEmpty()
], merkle_controller.validateSubsetFromURL);

/**
 * Validate a partial RDF dataset against a stored RDF Merkle set.
 */
router.post('/validate/subset', [
	check('token').optional(),
	check('contract', 'You must include the blockchain address for the RDF Merkle Tree record the set is being validated against').not().isEmpty()
], merkle_controller.validateSubsetFromFile);

router.get('/', [
	check('token').optional()
], merkle_controller.listView);

module.exports = router;