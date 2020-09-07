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

const alignment_controller = require('../controllers/alignmentController');
const { check } = require('express-validator/check');

/**
 * Get the Alignment manage page.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML Page or an error page with a error message
 */
router.get('/manage', [
	check('token').optional(),
],	alignment_controller.getAlignmentManagementPage);

/**
 * Get the Alignment api doc page.
 * @return HTML Page or an error page with a error message
 */
router.get('/docs', function(req, res, next) {
	res.render('docsalignments');
});

/**
 * Get an Alignment record by it's record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, the identifier of the Alignment record you wish to retrieve.
 * @return JSON with Alignment data, or a JSON error object.
 */
router.get('/id/:id', [
	check('token').optional(),
	check('id', 'You must include the id of the alignment you want to get').not().isEmpty(),
], alignment_controller.getAlignmentById);

/**
 * Get a list of all Alignment records for the currently logged in user.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with the data for all the Alignments records accessible by current user, or a JSON error object.
 */
router.get('/list', [
	check('token').optional(),
], alignment_controller.listAlignments);

/**
 * Create a new Alignment record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param url, Required. You must include a valid url for the new alignment item.
 * @param name, Required. You must include the Name of the Alignment.
 * @param description, Required. Description of the Alignment.
 * @param code, Optional. You can include a code, that is a locally unique string identifier that identifies the Alignment within its framework.
 * @param framework, Optional. You can include a Framework of the Alignment.
 * @return JSON with the data for all the Alignments records accessible by current user (see Model level for full details), or a JSON error object.
 */
router.post('/create', [
	check('token').optional(),
	check('url', 'You must include a valid url for the new alignment item').isURL({require_tld: false}),
	check('name', 'You must include a name for the new alignment item').not().isEmpty(),
	check('description', 'You must include a description for the new alignment item').not().isEmpty(),
	check('code').optional(),
	check('framework').optional()
], alignment_controller.createAlignment);

/**
 * Update an existing Alignment record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Alignment you wish to update.
 * @param url, Optional. You can include a valid url for the new alignment item, if you wish to update it.
 * @param name, Optional. You can include the Name of the Alignment, if you wish to update it.
 * @param description, Optional. You can include description of the Alignment, if you wish to update it.
 * @param code, Optional. You can include a code, that is a locally unique string identifier that identifies the Alignment within its framework, if you wish to update it.
 * @param framework, Optional. You can include a Framework of the Alignment, if you wish to update it.
 * @return JSON with the data for all the Alignments records accessible by current user (see Model level for full details), or a JSON error object.
 */
router.post('/update', [
	check('token').optional(),
	check('id', 'You must include the id of the alignment you want to update').not().isEmpty(),
	check('url', 'Your alignment url must be a valid url').optional().isURL({require_tld: false}),
	check('name').optional(),
	check('description').optional(),
	check('code').optional(),
	check('framework').optional()
], alignment_controller.updateAlignment);

/**
 * Delete an Alignment record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Alignment you wish to delete.
 * @return JSON with the id of the Alignment record that was deleted and a status property of -1, or a JSON error object.
 */
router.post('/delete', [
	check('token').optional(),
	check('id', 'You must include the id of the alignment you want to delete').not().isEmpty(),
], alignment_controller.deleteAlignment);

/** These need to be in this order at the bottom **/

/*
router.get('/:id', [
	check('id').withMessage('You must include the unique id of the alignment you want to get the JSON for'),
], alignment_controller.getJSONById);
*/

/**
 * Get the Alignment API documentation page.
 * @return HTML Page of the API Alignment documentation
 */
router.get('/', function(req, res, next) {
	res.render('docsalignments');
});

module.exports = router;
