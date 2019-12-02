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

var express = require('express');
var router = express.Router();

var assertion_controller = require('../controllers/assertionController');
const { check } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

router.get('/docs', function(req, res, next) {
	res.render('docsassertions');
});

router.get('/download/:id', [
	check('token').optional(),
	check('id').withMessage('You must include the badge issuance id of the badge assertion you want to download'),
], assertion_controller.downloadAssertion);

router.get('/portfolio', function(req, res, next) {
	check('token').optional(),
	assertion_controller.listAssertionsPortfolio(req, res, next);
});

router.get('/view/:id', [
	check('token').optional(),
	check('id').withMessage('You must include the badge issuance id of the badge you want to view'),
], assertion_controller.viewAssertionByID);

router.post('/validate', [
	check('badgejson').withMessage('You must include the badge JSON for the badge you want to validate'),
], assertion_controller.validateAssertion);

router.post('/issue', [
	check('token').optional(),
	check('id').withMessage('You must include the badge issuance id for the badge you want to issue'),
], assertion_controller.issueAssertion);

router.post('/revoke', [
	check('token').optional(),
	check('id').withMessage('You must include the badge issuance id for the badge you want to revoke'),
], assertion_controller.revokeAssertion);

router.post('/endorse', [
	check('id').withMessage('You must include the badge id for the badge you want to issue'),
	check('claims').withMessage('You must include at least one claim for this endorsement'),
], assertion_controller.endorseAssertion);

router.post('/create', [
	check('token').optional(),

	check('badgeid').withMessage('You must include the badge id for the badge you want for this issuance'),
	check('recipientid').withMessage('You must include the id of the recipient you want to give a badge to'),
], assertion_controller.createAssertion);

router.post('/update', [
	check('token').optional(),
	check('id').withMessage('You must include the badge issuance id for the pending badge issuance you want to update'),

	check('badgeid').optional(),
	check('recipientid').optional(),
], assertion_controller.updateAssertion);

router.post('/delete', [
	check('token').optional(),

	check('id').withMessage('You must include the badge issuance id for the pending badge issuance you want to delete'),
], assertion_controller.deleteAssertion);

router.get('/id/:id', [
	check('token').optional(),
	check('id').withMessage('You must include the badge issuance id of the badge assertion you want to get'),
], assertion_controller.getAssertionById);

router.get('/list', function(req, res, next) {
	check('token').optional(),
	assertion_controller.listAssertions(req, res, next);
});

/** MANAGE ADDING REMOVING ENDORSERS ON AN ASSERTION **/

router.post('/addendorser', [
	check('token').optional(),
	check('id').withMessage('You must include the id of the badge issuance you want to add an endorser to'),
	check('endorserid').withMessage('You must include the id of the endorser you want to add'),
], assertion_controller.addEndorser);

router.post('/removeendorser', [
	check('token').optional(),
	check('id').withMessage('You must include the id of the badge issuance you want to remove an endorser from'),
	check('endorserid').withMessage('You must include the id of the endorser you want to remove'),
], assertion_controller.removeEndorser);

router.get('/listendorsers/:id', [
	check('token').optional(),
	check('id').withMessage('You must include the id of the badge issuance you want to list endorsers for'),
], assertion_controller.listEndorsers);

router.get('/', [
	check('token').optional(),
],	assertion_controller.getAssertionPage);

module.exports = router;
