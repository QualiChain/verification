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

const organization_controller = require('../controllers/organizationController');
const { check } = require('express-validator/check');

/**
 * Get the Organization management page for the currently logged in administrator.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for managing Organization records or error page with error message.
 */
router.get('/manage', [
	check('token').optional(),
],	organization_controller.getOrganizationManagementPage);

/**
 * Get the Organization API documentation page.
 * @return HTML Page of the Organization API documentation
 */
router.get('/docs', function(req, res, next) {
	res.render('docsorganizations');
});

/**
 * Get an Organization record by it's record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Organization record you wish to retrieve.
 * @return JSON with Organization record data or a JSON error object.
 */
router.get('/id/:id', [
	check('token').optional(),
	check('id', 'You must the id of the alignment you want to get').not().isEmpty(),
], organization_controller.getOrganizationById);

/**
 * Get a list of all Organization records for the currently logged in user.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'organizations' pointing to an array of the Organization records, or a JSON error object.
 */
router.get('/list', [
	check('token').optional(),
], organization_controller.listOrganizations);

/**
 * Create a new Organization record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param name, Required. A name for the Organization.
 * @param email, Required. An email address for the Organization.
 * @param pobox, Optional. The post office box number for PO box addresses, if applicable for the Organization.
 * @param streetaddress, Optional. The street address for the Organization. For example, 1600 Amphitheatre Pkwy.
 * @param locality, Optional. The town or city for the Organization's address.
 * @param region, Optional. The county or region for the Organization's address.
 * @param postcode, Optional. The postal code for the Organization's address.
 * @param country, Optional. The country for the Organization's address.
 * @return JSON with the data for new Organization record, or a JSON error object.
 */
router.post('/create', [
	check('token').optional(),
	check('name', 'Please include a name for the organization').not().isEmpty(),
	check('email', 'Please include a valid email address for the organization').isEmail(),
	check('pobox').optional(),
	check('streetaddress').optional(),
	check('locality').optional(),
	check('region').optional(),
	check('postcode').optional(),
	check('country').optional(),
], organization_controller.createOrganization);

/**
 * Update an existing Organization record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Organization record you want to update.
 * @param name, Optional. A name for the Organization.
 * @param email, Optional. An email address for the Organization.
 * @param pobox, Optional. The post office box number for PO box addresses, if applicable for the Organization.
 * @param streetaddress, Optional. The street address for the Organization. For example, 1600 Amphitheatre Pkwy.
 * @param locality, Optional. The town or city for the Organization's address.
 * @param region, Optional. The county or region for the Organization's address.
 * @param postcode, Optional. The postal code for the Organization's address.
 * @param country, Optional. The country for the Organization's address.
 * @return JSON with the data for new Organization record, or a JSON error object.
 */
router.post('/update', [
	check('token').optional(),
	check('id', 'You must include the id of the organization you want to update').not().isEmpty(),
	check('name').optional(),
	check('email').optional(),
	check('pobox').optional(),
	check('streetaddress').optional(),
	check('locality').optional(),
	check('region').optional(),
	check('postcode').optional(),
	check('country').optional(),
], organization_controller.updateOrganization);

/**
 * Delete an existing Organization record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Organization you wish to delete.
 * @return JSON with the id of the Organization record that was deleted and a status property of -1, or a JSON error object.
 */
router.post('/delete', [
	check('token').optional(),
	check('id', 'You must include the id of the organization you want to delete').not().isEmpty(),
], organization_controller.deleteOrganization);

//router.get('/:id', [
//	check('id', 'You must include the IoC id of the organization you want to get the JSON for').not().isEmpty(),,
//], organization_controller.getJSONById);

module.exports = router;
