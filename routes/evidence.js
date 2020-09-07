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

const evidence_controller = require('../controllers/evidenceController');
const { check } = require('express-validator/check');

/**
 * Get the Evidence API documentation page.
 * @return HTML Page of the Evidence API documentation
 */
router.get('/docs', function(req, res, next) {
	res.render('docsevidence');
});

/**
 * Get a list of all Evidence records for the Badge issuance (Assertion) record associated with the given identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. Badge issuance record identifier to get associated Evidence for.
 * @return JSON with an object with key 'evidence' pointing to an array of the Evidence records, or a JSON error object.
 */
router.get('/list/:id', [
	check('token').optional(),
	check('id', 'You must include the badge issuance id to list evidence for').not().isEmpty(),
], evidence_controller.listEvidenceForBadge);

/**
 * Create a new Evidence record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param badgeissuedid, Required. The Badge issuance (Assertion) record identitifer that this evidence is associated with.
 * @param url, Required. A url pointing to the Evidence file or page being presented as Evidence for a Badge Issuance (Assertion).
 * @param name, Required. A descriptive title of the evidence.
 * @param description, Optional. A longer description of the evidence.
 * @param narrative, Optional. A narrative that describes the evidence and process of achievement that led to a Badge Issuance (Assertion).
 * @param genre, Optional. What type of evidence is it, e.g. Poerty, Prose, Film, Photography, ePortfolio etc.
 * @param audience, Optional. Who is the Audience for this evidence intended to be.
 * @return JSON with the data for new Evidence record, or a JSON error object.
 */
router.post('/create', [
	check('token').optional(),
	check('badgeissuedid', 'You must include the badge issuance id for the badge issuance you want to add evidence to').not().isEmpty(),
	check('url', 'You must include the url to the evidence item you are adding to the badge').not().isEmpty(),
	check('name', 'You must include a name for the evidence itemyou want to add to a badge').not().isEmpty(),
	check('description').optional(),
	check('narrative').optional(),
	check('genre').optional(),
	check('audience').optional(),
], evidence_controller.createEvidence);

/**
 * Update an existing Evidence record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Evidence record you want to update.
 * @param url, Optional. A url pointing to the Evidence file or page being presented as Evidence for a Badge Issuance (Assertion).
 * @param name, Optional. A descriptive title of the evidence.
 * @param description, Optional. A longer description of the evidence.
 * @param narrative, Optional. A narrative that describes the evidence and process of achievement that led to a Badge Issuance (Assertion).
 * @param genre, Optional. What type of evidence is it, e.g. Poerty, Prose, Film, Photography, ePortfolio etc.
 * @param audience, Optional. Who is the Audience for this evidence intended to be.
 * @return JSON with the data for updated Evidence record, or a JSON error object.
 */
router.post('/update', [
	check('token').optional(),
	check('id', 'You must include the evidence id for the evidence you want to edit').not().isEmpty(),
	check('url').optional(),
	check('name').optional(),
	check('description').optional(),
	check('narrative').optional(),
	check('genre').optional(),
	check('audience').optional(),
], evidence_controller.updateEvidence);

/**
 * Delete an existing Evidence record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Evidence you wish to delete.
 * @return JSON with the id of the Evidence record that was deleted and a status property of -1, or a JSON error object.
 */
router.post('/delete', [
	check('token').optional(),
	check('id', 'You must include the evidence id for the evidence you want to delete').not().isEmpty(),
], evidence_controller.deleteEvidence);

/**
 * Get the evidence management page
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param badgeissuedid, Required. The Badge issuance (Assertion) record identitifer who Evidence records you want to manage with this page.
 * @return HTML of the Evidence management page or error page with error message.
 */
router.get('/', [
	check('token').optional(),
	check('badgeissuedid', 'You must include the badge issuance id for the evidence management page you wish to view').not().isEmpty(),
],	evidence_controller.getEvidencePage);

module.exports = router;
