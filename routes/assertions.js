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

const assertion_controller = require('../controllers/assertionController');
const { check } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

/**
 * Delete a Badge issuance (Assertion) record for the given id. Only the super administrator can call this route.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Badge issuance record you wish to retrieve.
 * @return JSON with the id of the badge issuance record that was deleted and a status property of -1, or a JSON error object.
 */
router.post('/admin/delete', [
	check('token').optional(),
	check('id', 'You must include the badge issuance id for the badge issuance you want to delete').not().isEmpty(),
], assertion_controller.deleteAssertionAdmin);

/**
 * Get the Badge issuance (Assertion) super admin page. Only the super administrator can call this route.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for super to administrate assertions or an error page with a message
 */
router.get('/admin', [
	check('token').optional(),
],	assertion_controller.getAssertionAdministrationPage);

/**
 * Get the Badge issuance (Assertion) api doc page.
 * @return HTML docs page for the assertion api
 */
router.get('/docs', function(req, res, next) {
	res.render('docsassertions');
});

/**
 * Get an Badge issuance (Assertion) file by it's record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to retrieve the file for.
 * @return Badge file ('Content-type','image/png') of the Badge issuance (Assertion) requested or a JSON error object
 */
router.get('/download/:id', [
	check('token').optional(),
	check('id', 'You must include the badge issuance id of the badge assertion you want to download').not().isEmpty(),
], assertion_controller.downloadAssertion);

/**
 * Get an Badge issuance (Assertion) file by it's record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to retrieve the file for.
 * @return Badge file ('Content-type','image/png') of the Badge issuance (Assertion) requested or a JSON error object
 */
router.get('/downloadhosted/:id', [
	check('token').optional(),
	check('id', 'You must include the badge issuance id of the badge assertion you want to download').not().isEmpty(),
], assertion_controller.downloadAssertionHosted);


/**
 * Get the Badge issuances (Assertions) for the currently logged in recipient.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'items' pointing to an array of the Badge issuance (Assertion) data for the currently logged in user, or a JSON error object.
 */
router.get('/portfolio', [
	check('token').optional(),
],	assertion_controller.listAssertionsPortfolio);

/**
 * Gets the Badge issuance (Assertion) view page, for a single badge issuance record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to view.
 * @return HTML page for a single Badge issuance (Assertion) record or an error page with a message
 */
router.get('/view/:id', [
	check('token').optional(),
	check('id','You must include the badge issuance id of the badge you want to view').not().isEmpty(),
], assertion_controller.viewAssertionByID);

// Currently validation is on the Badges route - needs moving here really.
/**
 * Validate a Badge issuance (Assertion) from the JSONLD of the badge issuance.
 * @param badgejson, the JSONLD of the badge issuance, as extracted from the Badge issuance file.
 * @return JSON object containing all the checks performed and their outcomes.
 */
/*
router.post('/validate', [
	check('badgejson', 'You must include the badge JSON for the badge you want to validate').not().isEmpty(),
], assertion_controller.validateAssertion);
*/

/**
 * Issue a pending Badge issuance (Assertion). If successful, the resultant badge file will be emailed to the recipient.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to issue.
 * @return JSON for a single Badge issuance (Assertion) record or a JSON error object
 */
router.post('/issue', [
	check('token').optional(),
	check('id', 'You must include the badge issuance id for the badge you want to issue').not().isEmpty(),
], assertion_controller.issueAssertion);

/**
 * Check if the badge with the given badge id can be issued to the recipient with the given recipient id.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param badgeid, Required. The identifier of the Badge record you wish to check against.
 * @param recipientid, Required. The identifier of the Recipient record you wish to check against.
 * @return JSON saying if the badge can be issued to the recipient, or a JSON error object.
 */
router.get('/checkissuability', [
	check('token').optional(),
	check('badgeid', 'You must include the badge id for the badge you want to check the issuability for').not().isEmpty(),
	check('recipientid', 'You must include the recipientid for the recipient you are checking').not().isEmpty(),
], assertion_controller.checkCanIssueBadge);

/**
 * Check if the badge with the given badge id can be issued to the recipient with the given recipient name and email address.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param badgeid, Required. The identifier of the Badge record you wish to check against.
 * @param recipientname, Required. The name of the recipient you wish to check against. Must match an existing name in the recipient table.
 * @param recipientemail, Required. The email address of the recipient you wish to check against. Must match an existing email that goes with the given name in the recipient table.
 * @return JSON saying if the badge can be issued to the recipient, or a JSON error object.
 */
router.get('/autocheckissuability', [
	check('token').optional(),
	check('badgeid', 'You must include the badge id for the badge you want to check the issuability for').not().isEmpty(),
	check('recipientname', 'You must include a name for the recipient you are checking').not().isEmpty(),
	check('recipientemail', 'You must include the email for the recipient you are checking').not().isEmpty(),
], assertion_controller.autoCheckCanIssueBadge);

/**
 * Issue a badge to a recipient with the given name and email address in one process without adding evidence. The recipient must already exist in the database against the current user/issuer. If successful, the recipient will be emailed their badge.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param badgeid, Required. The identifier of the Badge record you wish to issue.
 * @param recipientname, Required. The name of the recipient you wish to issue to. Must match an existing name in the recipient table.
 * @param recipientemail, Required. The email address of the recipient you wish to issue to. Must match an existing email that goes with the given name in the recipient table.
 * @return JSON of the issued badge or a JSON error object
 */
router.post('/autoissue', [
	check('token').optional(),
	check('badgeid', 'You must include the badge id for the badge you want for this issuance').not().isEmpty(),
	check('recipientname', 'You must include a name for this recipient').not().isEmpty(),
	check('recipientemail', 'You must include the email for this recipient').not().isEmpty(),
], assertion_controller.autoIssueAssertion);

/**
 * Revoke a badge issuance.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Badge issuance record you wish to revoke.
 * @param revokedreason, Optional. A textual reason for the revocation. For internal administration use only.
 * @return JSON of the issued badge or a JSON error object
 */
router.post('/revoke', [
	check('token').optional(),
	check('id', 'You must include the badge issuance id for the badge issuance you want to revoke').not().isEmpty(),
	check('revokedreason').optional(),
], assertion_controller.revokeAssertion);

/**
 * Updates the revocation reason for a previously revoked badge.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The Badge issuance id for the badge issuance you want to update the revocation reason for
 * @param revokedreason, Optional. A textual reason for the revocation. For internal administration use only.
 * @return JSON of the issued badge or a JSON error object
 */
router.post('/updaterevocationreason', [
	check('token').optional(),
	check('id', 'You must include the badge issuance id for the badge issuance you want to revoke').not().isEmpty(),
	check('revokedreason', 'You must include the badge issuance revocation reason').not().isEmpty(),
], assertion_controller.updateRevocationReason);

/**
 * Not currently in use
 */
router.post('/endorse', [
	check('id', 'You must include the badge id for the badge you want to issue').not().isEmpty(),
	check('claims', 'You must include at least one claim for this endorsement').not().isEmpty(),
], assertion_controller.endorseAssertion);

/**
 * Create a pending Badge issuance
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param badgeid, Required. The Badge id for the badge you want to update create an issuance for.
 * @param recipientid, Required. The Recipient id for the Recipient you want to issue the badge to.
 * @return JSON of the issued badge or a JSON error object
 */
router.post('/create', [
	check('token').optional(),
	check('badgeid', 'You must include the badge id for the badge you want for this issuance').not().isEmpty(),
	check('recipientid', 'You must include the id of the recipient you want to give a badge to').not().isEmpty(),
], assertion_controller.createAssertion);

/**
 * Update a pending Badge issuance
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to update.
 * @param badgeid, Optional. The Badge id for the badge you want to update create an issuance for.
 * @param recipientid, Optional. The Recipient id for the Recipient you want to issue the badge to.
 * @return JSON of the issued badge or a JSON error object
 */
router.post('/update', [
	check('token').optional(),
	check('id', 'You must include the badge issuance id for the pending badge issuance you want to update').not().isEmpty(),
	check('badgeid').optional(),
	check('recipientid').optional(),
], assertion_controller.updateAssertion);

/**
 * Delete a pending Badge issuance
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to delete.
 * @return JSON with the id of the deleted Badge issuance and a status of -1 or a JSON error object
 */
router.post('/delete', [
	check('token').optional(),
	check('id', 'You must include the badge issuance id for the pending badge issuance you want to delete').not().isEmpty(),
], assertion_controller.deleteAssertion);

/**
 * Get an Badge issuance (Assertion) record by it's record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to retrieve.
 * @return JSON with Badge issuance (Assertion) data, or a JSON error object.
 */
router.get('/id/:id', [
	check('token').optional(),
	check('id', 'You must include the badge issuance id of the badge assertion you want to get').not().isEmpty(),
], assertion_controller.getAssertionById);

/**
 * Get a list of Badge issuance (Assertion) records for the currently logged in user.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'items' pointing to an array of the Badge issuance (Assertion) data for the currently logged in user, or a JSON error object.
 */
router.get('/list', [
	check('token').optional(),
], assertion_controller.listAssertions);

/**
 * Get a list of all Badge issuance (Assertion) record. Only the super administrator can call this route.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'items' pointing to an array of the Badge issuance (Assertion) data for the currently logged in user, or a JSON error object.
 */
router.get('/listall', [
	check('token').optional(),
], assertion_controller.listAllAssertions);


/** MANAGE ADDING REMOVING ENDORSERS ON AN ASSERTION **/

/**
 * Create a pending endorsement record for a pending Badge issuance
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to add an endorsment to.
 * @param endorserid, Required. The Endorser id for the Endorser you want to endorse this Badge issuance.
 * @return JSON of the pending endorsement record or a JSON error object
 */
router.post('/addendorser', [
	check('token').optional(),
	check('id', 'You must include the id of the badge issuance you want to add an endorser to').not().isEmpty(),
	check('endorserid', 'You must include the id of the endorser you want to add').not().isEmpty(),
], assertion_controller.addEndorser);

/**
 * Remove a pending endorsement record
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Badge issuance (Assertion) record you wish to remove an endorsment from.
 * @param endorserid, Required. The Endorser id for the Endorser you want remove endorsement for.
 * @return JSON with the id of the deleted endorsement record and a status of -1 or a JSON error object
 */
router.post('/removeendorser', [
	check('token').optional(),
	check('id', 'You must include the id of the badge issuance you want to remove an endorser from').not().isEmpty(),
	check('endorserid', 'You must include the id of the endorser you want to remove').not().isEmpty(),
], assertion_controller.removeEndorser);

/**
 * List all pending endorsement records for the Badge issuance with the given record identifier
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Badge issuance (Assertion) record you wish to list endorsement for.
 * @return JSON with an object with key 'items' pointing to an array of the pending endorsement records for the given Badge issuance or a JSON error object
 */
router.get('/listendorsers/:id', [
	check('token').optional(),
	check('id', 'You must include the id of the badge issuance you want to list endorsers for').not().isEmpty(),
], assertion_controller.listEndorsers);


/** CLAIMED BADGES ROUTES **/

/**
 * List all the claimed assertions for the currently logged in isser
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'items' pointing to an array of the Badge issuance (Assertion) data for the currently logged in user, or a JSON error object.
 */
router.get('/listclaimed', [
	check('token').optional(),
],	assertion_controller.listAssertionsClaimed);

/**
 * Issue a claimed Badge issuance (Assertion). If successful, the resultant badge file will be emailed to the recipient.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param claimsassertion, Required. The url of the qualifying badge you wish to claim.
 * @return JSON for a single Badge issuance (Assertion) record or a JSON error object
 */
router.post('/qualifyingclaimassertion/', [
	check('token').optional(),
	check('claimsassertion', 'You must include the assertion url of the qualifying badge').not().isEmpty()
], assertion_controller.qualifyingClaimAssertion);

/**
 * Get the Badge Claims (Assertion) issuer management page. This shows a badge issuer the issuances that have been claimed and allwos them to revoke them.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for issuer to manage claimed Badge issuances
 */
router.get('/claims', [
	check('token').optional(),
],	assertion_controller.getClaimsAssertionPage);

/*********************/

/**
 * Get the Badge issuance (Assertion) issuer management page. This shows a badge issuer the issuances they have made and allwos them to make new one.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for issuer Badge issuance management
 */
router.get('/', [
	check('token').optional(),
],	assertion_controller.getAssertionPage);

module.exports = router;
