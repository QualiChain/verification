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

const issuer_controller = require('../controllers/issuerController');
const recipient_controller = require('../controllers/recipientController');
const { check } = require('express-validator/check');

/**
 * Get the Issuer management page for the currently logged in administrator.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for managing Issuer records or error page with error message.
 */
router.get('/manage', [
	check('token').optional(),
],	issuer_controller.getIssuerManagementPage);

/**
 * Get the Issuer API documentation page.
 * @return HTML Page of the Issuer API documentation
 */
router.get('/docs', function(req, res, next) {
	res.render('docsissuers', { title: 'Issuer API Documentation' });
});

/**
 * Get the Issuer information page.
 * @return HTML Page of the Issuer information
 */
router.get('/information', function(req, res, next) {
	res.render('infoissuers');
});

/**
 * Get the Issuer user guide page
 * @return Issuer guide page.
 */
router.get('/guide', function(req, res, next) {
	res.render('guideissuers');
});

/**
 * Get an Issuer record by it's record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Issuer record you wish to retrieve.
 * @return JSON with Issuer record data or a JSON error object.
 */
router.get('/id/:id', [
	check('token').optional(),
	check('id', 'You must include the id of the issuer to retrieve').not().isEmpty(),
], issuer_controller.getIssuerById);

/**
 * Get a list of all Issuer records for the currently logged in user.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'issuers' pointing to an array of the Issuer records, or a JSON error object.
 */
router.get('/list', [
	check('token').optional(),
], issuer_controller.listIssuers);

//.isURL({require_tld: false}).withMessage('Please include a valid image url'),

/**
 * Create a new Issuer record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param name, Required. A name for the Issuer.
 * @param url, Required. A website url for the Issuer.
 * @param email, Optional. An email address for the Issuer.
 * @param telephone, Optional. A telephone Number for the Issuer.
 * @param description, Optional. A textual description of the Issuer.
 * @param imageurl, Optional. A URL pointing to a logo / image file for the Issuer.
 * @return JSON with the data for new Issuer record, or a JSON error object.
 */
router.post('/create', [
	check('token').optional(),
    check('name').withMessage('You must include a name for the issuer.'),
	check('url', 'You must include a website url for the issuer to go into the in the badge data').isURL({require_tld: false}),
	check('email').optional(),
    check('telephone').optional(),
    check('description').optional(),
    check('imageurl').optional(),
], issuer_controller.createIssuer);

/**
 * Create a User record entry to allow an Issuer to login to the system.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Issuer record you want to add a login account for.
 * @param loginemail, Required. An email address to use the the Issuer login account.
 * @return JSON with the data for new Issuer user account record, or a JSON error object.
 */
router.post('/createuseraccount', [
	check('token').optional(),
	check('id', 'You must include the id for the issuer you want to create a user account for').not().isEmpty(),
	check('loginemail', 'Please include a valid email address for creating the issuer account.').isEmail(),
], issuer_controller.createIssuerUserAccount);

/**
 * Call from a link in the registration email to complete Issuer account creation.
 * @param id, Required. The record identifier of the Issuer record to complete registration for.
 * @param key, Required. The registration unique key to authorise this account registration completion.
 * @return HTML of the change password page or error page with error message.
 */
router.get('/completeregistration', [
    check('id', 'You must include the id of the user to complete registation for').not().isEmpty(),
    check('key', 'You must include the registration key').not().isEmpty(),
], issuer_controller.completeRegistration);

/**
 * Update an existing Issuer record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Issuer record you want to update.
 * @param name, Optional. A name for the Issuer.
 * @param description, Optional. A textual description of the Issuer.
 * @param url, Optional. A website url for the Issuer.
 * @param email, Optional. An email address for the Issuer.
 * @param telephone, Optional. A telephone Number for the Issuer.
 * @param imageurl, Optional. A URL pointing to a logo / image file for the Issuer.
 * @return JSON with the data for the updated Issuer record, or a JSON error object.
 */
router.post('/update', [
	check('token').optional(),
    check('id', 'You must include the id of the issuer to update').not().isEmpty(),
    check('name').optional(),
    check('url').optional().isURL({require_tld: false}).withMessage('You must include a website url for the issuer to go into the in the badge data'),
    check('description').optional(),
	check('email').optional(),
    check('telephone').optional(),
    check('imageurl').optional(),
], issuer_controller.updateIssuer);

/**
 * Delete an existing Issuer record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Issuer you wish to delete.
 * @return JSON with the id of the Issuer record that was deleted and a status property of -1, or a JSON error object.
 */
router.post('/delete', [
	check('token').optional(),
    check('id', 'You must include the id of the issuer to delete').not().isEmpty(),
], issuer_controller.deleteIssuer);

/** These need to be in this order at the bottom **/

router.get('/hosted/:id', [
	check('id').withMessage('You must include the unique id of the issuer details you want to get the JSON for'),
], issuer_controller.getHostedIssuerJSONByUniqueId);

router.get('/:id', [
	check('id').withMessage('You must include the unique id of the issuer details you want to get the JSON for'),
], issuer_controller.getIssuerJSONByUniqueId);

/**
 * Get the issuer's home page
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML of the issuers's home page or error page with error message.
 */
router.get('/', [
	check('token').optional(),
],	issuer_controller.getIssuerPage);

module.exports = router;