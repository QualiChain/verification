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

var endorser_controller = require('../controllers/endorserController');
const { check } = require('express-validator/check');

router.get('/', [
	check('token').optional(),
],	endorser_controller.getEndorserPage);

router.get('/manage', [
	check('token').optional(),
],	endorser_controller.getEndorserManagementPage);

router.get('/docs', function(req, res, next) {
	res.render('docsendorsers', { title: 'Endorser API Documentation' });
});

router.get('/id/:id', [
	check('token').optional(),
	check('id').withMessage('You must include the id of the endorser to retrieve'),
], endorser_controller.getEndorserById);

router.get('/list', [
	check('token').optional(),
], endorser_controller.listEndorsers);

//.isURL({require_tld: false}).withMessage('Please include a valid image url.')

router.post('/create', [
	check('token').optional(),
    check('name').withMessage('You must include a name for the endorser.'),
	check('url').isURL({require_tld: false}).withMessage('You must include a website url for the endorser to go into the badge data.'),
	check('email').optional(),
    check('telephone').optional(),
    check('description').optional(),
    check('imageurl').optional(),
], endorser_controller.createEndorser);

router.post('/createuseraccount', [
	check('token').optional(),
	check('id').withMessage('You must include the id for the issuer you want to create a user account for'),
	check('loginemail').isEmail().withMessage('Please include a valid email address for creating the endorser account.'),
], endorser_controller.createEndorserUserAccount);

router.get('/completeregistration', [
    check('id').withMessage('You must include the id of the user to complete registation for'),
    check('key').withMessage('You must include the key'),

], endorser_controller.completeRegistration);

router.post('/update', [
	check('token').optional(),
    check('id').withMessage('You must include the id of the endorser to update'),
    check('name').optional(),
    check('description').optional(),
	check('url').optional().isURL({require_tld: false}).withMessage('You must include a website url for the endorser in the badge data'),
	check('email').optional(),
    check('telephone').optional(),
    check('imageurl').optional(),
], endorser_controller.updateEndorser);

// only if not used in a badge issuance
router.post('/delete', [
	check('token').optional(),
    check('id').withMessage('You must include the id of the endorser to delete')
], endorser_controller.deleteEndorser);

module.exports = router;