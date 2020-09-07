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
const express = require('express');
const router = express.Router();

const badge_controller = require('../controllers/badgeController');
const recipient_controller = require('../controllers/recipientController');
const { check } = require('express-validator/check');

/**
 * Get the API documentation index page.
 * @return HTML Page of the API documentation index or an error page with a error message
 */
router.get('/docindex', function(req, res, next) {
	res.render('docindex', { title: cfg.title_docindex, mailto: cfg.mailto, mailtosubject: cfg.mailtosubject });
});

/**
 * Get the privacy document page.
 * @return HTML Page of the privacy documentation or an error page with a error message
 */
router.get('/privacy', function(req, res, next) {
	res.render('privacy', { title:"Privacy Policy", domain: cfg.protocol+"://"+cfg.domain+cfg.proxy_path });
});

/**
 * Get the Badge validation page.
 * @return HTML Page for the Badge validation or an error page with a error message
 */
router.get('/validation', function(req, res, next) {
	res.render('validate', { title: 'Validate a Badge', protocol: cfg.protocol, domain: cfg.domain, pdir: __dirname});
});

router.get('/claims', function(req, res, next) {
	res.render('claims', { title: 'Claim a Badge', protocol: cfg.protocol, domain: cfg.domain, pdir: __dirname});
});

/*
router.get('/pods', function(req, res, next) {
	res.render('pods', { title: 'Pods Page' });
});
*/

/**
 * Get the Educator information page.
 * @return HTML Page for the Educator information or an error page with a error message
 */
router.get('/educators', function(req, res, next) {
	res.render('educators');
});

/**
 * Get the Badge API documentation page.
 * @return HTML Page of the Badge API documentation or an error page with a error message
 */
router.get('/docs', function(req, res, next) {
	res.render('docsbadges');
});

/**
 * Get the Badge issuance (Assertion) recipient page. This shows a badge recipient all the badges they have been issued.
 * @return HTML page for recipient's badge portfolio or error page with error message.
 */
router.get('/portfolio', function(req, res, next) {
	recipient_controller.getRecipientPage(req, res, next);
});

/**
 * Return the view all base badges page which will display base badge data for badges that have been issued
 * Return a page showing all the Badge Types in the system. This is a publically viewable page.
 */
router.get('/badgetypespage', function(req, res, next) {
	badge_controller.getViewAllBaseBadgesPage (req, res, next);
});

/**
 * Get the Badge type contract view page. This shows all the RDFStore contract data for the given blockchain address.
 * @return HTML page showing the details of the RDFSTore contract for the given blockchain address or error page with error message.
 */
router.get('/contract/view/:address', function(req, res, next) {
	res.render('viewbadgecontract', { title: 'Badge Contract View', address: req.params.address });
});

/**
 * View Badge type RDFStore contract details from blockchain contract address
 * @param address, Required. The blockchain contract address of the badge type you want to get the details for.
 * @return JSON object with address, owner, items; where items are strings of the RDF triples for the JSONLD data of the Badge type this contract is related to, or a JSON error object.
 */
router.get('/contract/:address', [
	check('address', 'You must include the blockchain address of the badge you want to get').not().isEmpty(),
], badge_controller.getBadgeByAddress);

/** ROUTES FOR BADGE IMAGE MANAGEMENT **/

/**
 * Get the Badge image management page for the currently logged in administrator.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for badge image management or error page with error message.
 */
router.get('/images/manage', [
	check('token').optional(),
], badge_controller.getBadgeImageManagementPage);

/**
 * Create a new Badge image.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param name, Required. A title for the new Badge image record.
 * @param json, Required. JSON holding the specification details of the badge image creation.
 * @return JSON with the data for new Badge image record, or a JSON error object.
 */
router.post('/images/create', [
	check('token').optional(),
	check('name', 'You must include a name for the badge image entry you want to create').not().isEmpty(),
	check('json', 'You must include the json datafor the badge image entry you want to create').not().isEmpty(),
], badge_controller.createBadgeImage);

/**
 * Update an existing Badge image.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Badge image record you wish to retrieve.
 * @param name, Optional. A title for the Badge image record.
 * @param json, Optional. JSON holding the specification details of the badge image creation.
 * @return JSON with the data for new Badge image record, or a JSON error object.
 */
router.post('/images/update', [
	check('token').optional(),
	check('id', 'You must include the id of the badge image entry you want to update').not().isEmpty(),
	check('name').optional().not().isEmpty(),
	check('json').optional().not().isEmpty(),
], badge_controller.updateBadgeImage);

/**
 * Delete a Badge image record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Badge image you wish to delete.
 * @return JSON with the id of the Badge image record that was deleted and a status property of -1, or a JSON error object.
 */
router.post('/images/delete', [
	check('token').optional(),
	check('id', 'You must include the id of the badge image entry you want to delete').not().isEmpty(),
], badge_controller.deleteBadgeImage);

/**
 * Publich a Badge image to the server.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Badge image you wish to publish.
 * @param imagedata, Required. The base64 image data for the image you wish to publish.
 * @return JSON with properties: 'id','timecreated','name','json','url' and 'usedInBadge', or a JSON error object.
 */
router.post('/images/publish', [
	check('token').optional(),
	check('id', 'You must include the id of the badge image entry you want to publish').not().isEmpty(),
	check('imagedata', 'You must include the base64 image data for the image you want to publish').not().isEmpty(),
], badge_controller.publishBadgeImage);

/**
 * Get a list of all Badge image records for the currently logged in user.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON object with the property 'badgeimages' pointing to an array containing objects with the properties: 'id','timecreated','name','json','url' and 'usedInBadge', or a JSON error object.
 */
router.get('/images/list', [
	check('token').optional(),
], badge_controller.listBadgeImages);

/****************************************/

/**
 * Get the Badge type page for the currently logged in issuer. This shows them the details of the badges they can issue.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for issuer's allowed badge types or error page with error message.
 */
router.get('/issuer', [
	check('token').optional(),
],	badge_controller.getViewIssuerBadgesPage);

/**
 * Get the Badge management page for the currently logged in administrator.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for badge management badge types or error page with error message.
 */
router.get('/manage', [
	check('token').optional(),
], badge_controller.getBadgeManagementPage);

/**
 * Get a Badge record by it's record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Badge record you wish to retrieve.
 * @return JSON with Badge record data or a JSON error object.
 */
router.get('/id/:id', [
	check('token').optional(),
	check('id', 'You must include the id of the badge you want to get').not().isEmpty(),
], badge_controller.getBadgeById);

/**
 * Get a list of all Badge records for the currently logged in user (issuer).
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'badges' pointing to an array of the Badge records, or a JSON error object.
 */
router.get('/list', [
	check('token').optional(),
], badge_controller.listBadges);

/**
 * Get a list of all badge records (super and admin permissions only).
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'badges' pointing to an array of the Badge records, or a JSON error object.
 */
router.get('/listall', [
	check('token').optional(),
], badge_controller.listAllBadges);

/**
 * Create a new Badge record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param title, Required. A title for the new Badge record.
 * @param description, Required. A description the new Badge record.
 * @param imageurl, Required. An image url for the new Badge record.
 * @param version, Required. A version number for the new Badge record, e.g. '1.0'.
 * @param isuerid, Required. The record identifier of the Issuer for this Badge record.
 * @param criterianarrative, Required. A textual description of the criteria for being awarded this Badge record.
 * @param alignmentids, Optional. A comma separatedlist of Alignment ids to associate with this Badge record.
 * @param eventids, Optional. A comma separated list of Event ids to associate with this Badge record.
 * @param parentbadgeid, Optional. A Badge record identifier for a parent badge to this badge record, for example when a super badge is dependent on obtaining certain child badges first.
 * @param tags, Optional. A comma separated list of tag words or phrases to associate with this Badge record.
 * @return JSON with the data for new Badge record, or a JSON error object.
 */
router.post('/create', [
	check('token').optional(),
	check('title', 'You must include a title for the badge you want to create').not().isEmpty(),
	check('description', 'You must include a description for the badge you want to create').not().isEmpty(),
	check('imageurl', 'You must include an image url for the badge you want to create').isURL({require_tld: false}),
	check('version', 'You must include the version number of this badge').not().isEmpty(),
	check('issuerid', 'You must include the id of the issuer of this badge').not().isEmpty(),
	check('criterianarrative', 'You must include the criteria description for earning this badge').not().isEmpty(),
	check('alignmentids').optional(),
	check('eventids').optional(),
	check('parentbadgeid').optional(),
	check('tags').optional(),
	// not currently used
	//check('imagecaption').optional(),
	//check('imageauthor').optional(),
	//check('criteria').optional().isURL({require_tld: false}).withMessage('Your criteria must be a valid url'),
	//check('criteriatype').optional(),
], badge_controller.createBadge);

/**
 * Update a existing Badge record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Badge record you want to update.
 * @param title, Optional. A title for the Badge record.
 * @param description, Optional. A description the Badge record.
 * @param imageurl, Optional. An image url for the Badge record.
 * @param version, Required. A version number for the Badge record, e.g. '1.0'.
 * @param criterianarrative, Optional. A textual description of the criteria for being awarded this Badge record.
 * @param alignmentids, Optional. A  comma separatedlist of Alignment ids to associate with this Badge record.
 * @param eventids, Optional. A comma separated list of Event ids to associate with this Badge record.
 * @param parentbadgeid, Optional. A Badge record identifier for a parent badge to this badge record, for example when a super badge is dependent on obtaining certain child badges first.
 * @param tags, Optional. A comma separated list of tag words or phrases to associate with this Badge record.
 * @return JSON with the updated data for the Badge record, or a JSON error object.
 */
router.post('/update', [
	check('token').optional(),
	check('id', 'You must include the id of the badge you want to add an alignment against').not().isEmpty(),
	check('title').optional(),
	check('description').optional(),
	check('imageurl').optional(),
	check('version').optional(),
	check('issuerid').optional(),
	check('criterianarrative').optional(),
	check('alignmentids').optional(),
	check('eventids').optional(),
	check('parentbadgeid').optional(),
	check('tags').optional(),
], badge_controller.updateBadge);

/**
 * Delete a Badge record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Badge you wish to delete.
 * @return JSON with the id of the Badge record that was deleted and a status property of -1, or a JSON error object.
 */
router.post('/delete', [
	check('token').optional(),
	check('id', 'You must include the id of the badge you want to delete').not().isEmpty(),
], badge_controller.deleteBadge);

/**
 * Get a list of all Alignment records associated with the given Badge record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Badge you wish to get the Alignments for.
 * @return JSON with an object with key 'alignments' pointing to an array of the Alignment records, or a JSON error object.
 */
router.get('/listalignments/:id', [
	check('token').optional(),
	check('id', 'You must include the id of the badge you want to list alignments from').not().isEmpty(),
], badge_controller.listAlignments);

/**
 * Get a list of all Criteria Event records associated with the given Badge record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Badge you wish to get the  Criteria events for.
 * @return JSON with an object with key 'events' pointing to an array of the Critera Event records, or a JSON error object.
 */
router.get('/listcriteriaevents/:id', [
	check('token').optional(),
	check('id', 'You must include the id of the badge you want to list criteria events for').not().isEmpty(),
], badge_controller.listCriteriaEvents);

/**
 * Validate a Badge issuance (Assertion) from the JSONLD of the badge issuance and the email address of the Badge recipient.
 * @param badgejson, Required. The JSONLD of the badge issuance, as extracted from the Badge issuance file.
 * @param emailtoupload, Required. The email address of the Badge recipient for checking against.
 * @return JSON object containing all the checks performed and their outcomes.
 */
router.post('/validation/validate', [
	check('badgejson', 'You must include badge data to validate').not().isEmpty(),
	check('emailtoupload', 'You must include a valid badge recipient email address to validate the badge').isEmail()
], badge_controller.validate);

/**
 * Validate a signed Badge issuance from the signature code embedded in the badge.
 * @param signature, Required. The Signature string that was embedded in the badge.
 * @param emailtoupload, Required. The email address of the Badge recipient for checking against.
 * @return JSON object containing all the checks performed and their outcomes.
 */
router.post('/validation/validatesigned', [
	check('signature', 'You must include badge signature to validate').not().isEmpty(),
	check('emailtoupload', 'You must include a valid badge recipient email address to validate the badge').isEmail()
], badge_controller.validatesigned);

/**
 * Get the Badge type view page. This shows all the Badge type information for the Badge with the given record identifier.
 * @return HTML page showing the details of the Badge type for the given record identifier or error page with error message.
 */
router.get('/view/:id', function(req, res, next) {
	if (!req.params.id || req.params.id == "") {
		res.render('error', {message: 'You must include the id of the badge you want to view'});
	} else {
		res.render('viewbasebadge', { title: 'Badge Type', id: req.params.id });
	}
});

/** These need to be in this order at the bottom **/

/**
 * Get a Badge type record in Open Badge JSONLD format for use with hosted verification by it's record identifier.
 * @param id, Required. The identifier of the Badge record you wish to retrieve.
 * @return Open Badge JSONLD of the Badge data, or a JSON error object.
 */
router.get('/hosted/:id', [
	check('id', 'You must include the unique id of the badge you want to get the JSON for').not().isEmpty(),
], badge_controller.getHostedBadgeJSONByUniqueId);

/**
 * Get a Badge type record in Open Badge JSONLD format for use with blockchain verification by it's record identifier.
 * @param id, Required. The identifier of the Badge record you wish to retrieve.
 * @return Open Badge JSONLD of the Badge data, or a JSON error object.
 */
router.get('/:id', [
	check('id', 'You must include the unique id of the badge you want to get the JSON for').not().isEmpty(),
], badge_controller.getBadgeJSONByUniqueId);

/**
 * GET site home page.
 * @return HTML Page of site home page
 */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Badging Service'});
});

module.exports = router;
