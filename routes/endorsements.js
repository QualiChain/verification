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

const endorsement_controller = require('../controllers/endorsementController');
const { check } = require('express-validator/check');

/**
 * Get the Endorsement management page for the currently logged in endorser.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for managing Endorsement records or error page with error message.
 */
//router.get('/manage', [
//	check('token').optional(),
//], endorsement_controller.getEndorserManagementPage);

/**
 * Get the Endorsement API documentation page.
 * @return HTML Page of the Endorsement API documentation
 */
router.get('/docs', function(req, res, next) {
	res.render('docsendorsements', { title: 'Endorsement API Documentation' });
});

/**
 * Get an Endorsement record by it's record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Endorsement record you wish to retrieve.
 * @return JSON with Endorsement record data or a JSON error object.
 */
//router.get('/id/:id', [
//	check('token').optional(),
//	check('id', 'You must include the id of the endorser to retrieve').not().isEmpty(),
//], endorsement_controller.getEndorserById);

/**
 * Get a list of all Endorsement records for the currently logged in user.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'endorsement' pointing to an array of the Endorsement records, or a JSON error object.
 */
//router.get('/list', [
//	check('token').optional(),
//], endorsement_controller.listEndorsers);

//.isURL({require_tld: false}).withMessage('Please include a valid image url.')

/**
 * Create a new Endorsement record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param name, Required. A name for the Endorser.
 * @param url, Required. A website url for the Endorser.
 * @param email, Optional. An email address for the Endorser.
 * @param telephone, Optional. A telephone Number for the Endorser.
 * @param description, Optional. A textual description of the Endorser.
 * @param imageurl, Optional. A URL pointing to a logo / image file for the Endorser.
 * @return JSON with the data for new Endorsement record, or a JSON error object.
 */
/*router.post('/create', [
	check('token').optional(),
    check('name', 'You must include a name for the endorser').not().isEmpty(),
	check('url', 'You must include a website url for the endorser to go into the badge data').isURL({require_tld: false}).not().isEmpty(),
	check('email').optional(),
    check('telephone').optional(),
    check('description').optional(),
    check('imageurl').optional(),
], endorsement_controller.createEndorser);
*/

/**
 * Update an existing Endorsement record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Endorser record you want to update.
 * @param name, Optional. A name for the Endorser.
 * @param description, Optional. A textual description of the Endorser.
 * @param url, Optional. A website url for the Endorser.
 * @param email, Optional. An email address for the Endorser.
 * @param telephone, Optional. A telephone Number for the Endorser.
 * @param imageurl, Optional. A URL pointing to a logo / image file for the Endorser.
 * @return JSON with the data for the updated Endorsement record, or a JSON error object.
 */
/*
router.post('/update', [
	check('token').optional(),
    check('id', 'You must include the id of the endorser to update').not().isEmpty(),
    check('name').optional(),
    check('description').optional(),
	check('url').optional().isURL({require_tld: false}).withMessage('You must include a website url for the endorser in the badge data'),
	check('email').optional(),
    check('telephone').optional(),
    check('imageurl').optional(),
], endorsement_controller.updateEndorser);
*/

/**
 * Delete an existing Endorsement record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Endorsement you wish to delete.
 * @return JSON with the id of the Endorsement record that was deleted and a status property of -1, or a JSON error object.
 */
/*
router.post('/delete', [
	check('token').optional(),
    check('id', 'You must include the id of the endorser to delete').not().isEmpty(),
], endorsement_controller.deleteEndorser);
*/

/** These need to be in this order at the bottom **/

/**
 * Get a hosted verification Endorsement record in Open Badge JSONLD format by it's unique record identifier.
 * @param id, Required. The unique identifier of the Endorsement record you wish to retrieve.
 * @return Open Badge JSONLD of the Endorsement data, or a JSON error object.
 */
router.get('/hosted/:id', [
	check('id', 'You must include the unique id of the endorsement you want to get the hosted JSON for').not().isEmpty(),
], endorsement_controller.getHostedEndorsementJSONByUniqueId);

/**
 * Get a blockchain verified Endorsement record in Open Badge JSONLD format by it's unique record identifier.
 * @param id, Required. The unique identifier of the Endorsement record you wish to retrieve.
 * @return Open Badge JSONLD of the Endorsement data, or a JSON error object.
 */
/*
router.get('/:id', [
	check('id', 'You must include the unique id of the endorsement you want to get the JSON for').not().isEmpty(),
], endorsement_controller.getEndorsementJSONByUniqueId);
*/

/**
 * Get the endorser's home page
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML of the endorser's home page or error page with error message.
 */
/*
router.get('/', [
	check('token').optional(),
],	endorsement_controller.getEndorsementPage);
*/

module.exports = router;