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
/** Author: Manoharan Ramachandran, KMi, The Open University **/
/** Author: Kevin Quick, KMi, The Open University **/

var cfg = require('../config.js');
var express = require('express');
var crypto = require('crypto');
var router = express.Router();

var badge_controller = require('../controllers/badgeController');
const { check } = require('express-validator/check');

router.get('/docindex', function(req, res, next) {
	res.render('docindex', { title: 'Badging Service API Documentation' });
});

router.get('/privacy', function(req, res, next) {
	res.render('privacy', { title:"Privacy Policy", domain: cfg.protocol+"://"+cfg.domain+"/badges" });
});

router.get('/validation', function(req, res, next) {
	res.render('validate', { title: 'Validate a Badge', protocol: cfg.protocol, domain: cfg.domain, pdir: __dirname});
});

router.get('/pods', function(req, res, next) {
	res.render('pods', { title: 'Pods Page' });
});

router.get('/docs', function(req, res, next) {
	res.render('docsbadges');
});

/**
 * Return the view all base badges page which will display base badge data for badges that have been issued
 * Public Route
 */
router.get('/issuedbadges', function(req, res, next) {
	badge_controller.getViewAllBaseBadgesPage (req, res, next);
});

router.get('/contract/view/:address', function(req, res, next) {
	res.render('viewbadgecontract', { title: 'Badge Contract View', address: req.params.address });
});

router.get('/contract/:address', [
	check('address').withMessage('You must include the blockchain address of the badge you want to get'),
], badge_controller.getBadgeByAddress);

router.get('/issuer', function(req, res, next) {
	check('token').optional(),
	badge_controller.getViewIssuerBadgesPage (req, res, next);
});

router.get('/manage', [
	check('token').optional(),
], badge_controller.getBadgeManagementPage);

router.get('/id/:id', [
	check('token').optional(),
	check('id').withMessage('You must include the id of the badge you want to get'),
], badge_controller.getBadgeById);

router.get('/list', function(req, res, next) {
	check('token').optional(),
	badge_controller.listBadges(req, res, next);
});

router.get('/listall', [
	check('token').optional(),
], badge_controller.listAllBadges);

router.post('/create', [
	check('token').optional(),

	check('title').withMessage('You must include a title for the badge you want to create'),
	check('description').withMessage('You must include a description for the badge you want to create'),
	check('imageurl').isURL({require_tld: false}).withMessage('You must include an image url for the badge you want to create'),
	check('version').withMessage('You must include the version number of this badge'),
	check('issuerid').withMessage('You must include the id of the issuer of this badge'),
	check('criterianarrative').withMessage('You must include the criteria description for earning this badge'),

	check('tags').optional(),

	// not currently used
	//check('imagecaption').optional(),
	//check('imageauthor').optional(),
	//check('criteria').optional().isURL({require_tld: false}).withMessage('Your criteria must be a valid url'),
	//check('criteriatype').optional(),
], badge_controller.createBadge);

router.post('/update', [
	check('token').optional(),
	check('id').withMessage('You must include the id of the badge you want to add an alignment against'),

	check('title').optional(),
	check('description').optional(),
	check('imageurl').optional(),
	check('version').optional(),
	check('issuerid').optional(),
	check('criterianarrative').optional(),
	check('tags').optional(),

], badge_controller.updateBadge);

router.post('/delete', [
	check('token').optional(),
	check('id').withMessage('You must include the id of the badge you want to delete'),
], badge_controller.deleteBadge);

router.post('/addalignment', [
	check('token').optional(),
	check('id').withMessage('You must include the id of the badge you want to add an alignment to'),
	check('alignmentid').withMessage('You must include the id of the alignment you want to add to the badge'),
], badge_controller.addAlignment);

router.post('/removealignment', [
	check('token').optional(),
	check('id').withMessage('You must include the id of the badge you want to remove an alignment from'),
	check('alignmentid').withMessage('You must include the id of the alignment you want to remove from the badge'),
], badge_controller.removeAlignment);

router.post('/listalignments', [
	check('token').optional(),
	check('id').withMessage('You must include the id of the badge you want to list alignments from'),
], badge_controller.listAlignments);

router.post('/validation/validate', [
	check('badgejson').withMessage('You must include badge data to validate'),
	check('emailtoupload').isEmail().withMessage('You must include a valid email address to validate the badge'),
], badge_controller.validate);


router.get('/view/:id', function(req, res, next) {
	if (!req.params.id || req.params.id == "") {
		res.render('error', {message: 'You must include the unique id of the badge you want to view'});
	} else {
		res.render('viewbasebadge', { title: 'Badge', id: req.params.id });
	}
});

/** These need to be in this order at the bottom **/

router.get('/:id', [
	check('id').withMessage('You must include the unique id of the badge you want to get the JSON for'),
], badge_controller.getBadgeJSONByUniqueId);

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Badging Service'});
});

module.exports = router;
