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

const express = require('express');
const router = express.Router();

const endorser_controller = require('../controllers/endorserController');
const { check } = require('express-validator/check');

/**
 * Get the Endorser management page for the currently logged in administrator.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for managing Endorser records or error page with error message.
 */
router.get('/manage', [
	check('token').optional(),
],	endorser_controller.getEndorserManagementPage);

/**
 * Get the Endorsers API documentation page.
 * @return HTML Page of the Endorsers API documentation
 */
router.get('/docs', function(req, res, next) {
	res.render('docsendorsers', { title: 'Endorser API Documentation' });
});

/**
 * Get an Endorser record by it's record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Endorser record you wish to retrieve.
 * @return JSON with Endorser record data or a JSON error object.
 */
router.get('/id/:id', [
	check('token').optional(),
	check('id', 'You must include the id of the endorser to retrieve').not().isEmpty(),
], endorser_controller.getEndorserById);

/**
 * Get a list of all Endorser records for the currently logged in user.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'endorsers' pointing to an array of the Endorser records, or a JSON error object.
 */
router.get('/list', [
	check('token').optional(),
], endorser_controller.listEndorsers);

//.isURL({require_tld: false}).withMessage('Please include a valid image url.')

/**
 * Create a new Endorser record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param name, Required. A name for the Endorser.
 * @param url, Required. A website url for the Endorser.
 * @param email, Optional. An email address for the Endorser.
 * @param telephone, Optional. A telephone Number for the Endorser.
 * @param description, Optional. A textual description of the Endorser.
 * @param imageurl, Optional. A URL pointing to a logo / image file for the Endorser.
 * @return JSON with the data for new Endorser record, or a JSON error object.
 */
router.post('/create', [
	check('token').optional(),
    check('name', 'You must include a name for the endorser').not().isEmpty(),
	check('url', 'You must include a website url for the endorser to go into the badge data').isURL({require_tld: false}).not().isEmpty(),
	check('email').optional(),
    check('telephone').optional(),
    check('description').optional(),
    check('imageurl').optional(),
], endorser_controller.createEndorser);

/**
 * Create a User record entry to allow an Endorser to login to the system.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Endorser record you want to add a login account for.
 * @param loginemail, Required. An email address to use the the Endorser login account.
 * @return JSON with the data for new Endorser user account record, or a JSON error object.
 */
router.post('/createuseraccount', [
	check('token').optional(),
	check('id', 'You must include the id for the issuer you want to create a user account for').not().isEmpty(),
	check('loginemail', 'Please include a valid email address for creating the endorser account.').isEmail(),
], endorser_controller.createEndorserUserAccount);

/**
 * Call from a link in the registration email to complete Endorser account creation.
 * @param id, Required. The record identifier of the Endorser record to complete registration for.
 * @param key, Required. The registration unique key to authorise this account registration completion.
 * @return HTML of the change password page or error page with error message.
 */
router.get('/completeregistration', [
    check('id', 'You must include the id of the user to complete registation for').not().isEmpty(),
    check('key', 'You must include the key').not().isEmpty(),

], endorser_controller.completeRegistration);

/**
 * Update an existing Endorser record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Endorser record you want to update.
 * @param name, Optional. A name for the Endorser.
 * @param description, Optional. A textual description of the Endorser.
 * @param url, Optional. A website url for the Endorser.
 * @param email, Optional. An email address for the Endorser.
 * @param telephone, Optional. A telephone Number for the Endorser.
 * @param imageurl, Optional. A URL pointing to a logo / image file for the Endorser.
 * @return JSON with the data for the updated Endorser record, or a JSON error object.
 */
router.post('/update', [
	check('token').optional(),
    check('id', 'You must include the id of the endorser to update').not().isEmpty(),
    check('name').optional(),
    check('description').optional(),
	check('url').optional().isURL({require_tld: false}).withMessage('You must include a website url for the endorser in the badge data'),
	check('email').optional(),
    check('telephone').optional(),
    check('imageurl').optional(),
], endorser_controller.updateEndorser);

/**
 * Delete an existing Endorser record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Endorser you wish to delete.
 * @return JSON with the id of the Endorser record that was deleted and a status property of -1, or a JSON error object.
 */
router.post('/delete', [
	check('token').optional(),
    check('id', 'You must include the id of the endorser to delete').not().isEmpty(),
], endorser_controller.deleteEndorser);

/**
 * Get a hosted verification Endorser record in Open Badge JSONLD format by it's unique record identifier.
 * @param id, Required. The unique identifier of the Endorser record you wish to retrieve.
 * @return Open Badge JSONLD of the Endorser data, or a JSON error object.
 */
router.get('/hosted/:id', [
	check('id', 'You must include the unique id of the endorsement you want to get the hosted JSON for').not().isEmpty(),
], endorser_controller.getHostedEndorserJSONByUniqueId);

/**
 * Get a blockchain verified Endorser record in Open Badge JSONLD format by it's unique record identifier.
 * @param id, Required. The unique identifier of the Endorser record you wish to retrieve.
 * @return Open Badge JSONLD of the Endorser data, or a JSON error object.
 */
/*
router.get('/:id', [
	check('id', 'You must include the unique id of the endorsement you want to get the JSON for').not().isEmpty(),
], endorser_controller.getEndorserJSONByUniqueId);
*/

/**
 * Get the endorser's home page
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML of the endorser's home page or error page with error message.
 */
router.get('/', [
	check('token').optional(),
],	endorser_controller.getEndorserPage);

module.exports = router;