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

const cfg = require('../config.js');
const express = require('express');
const router = express.Router();

const qualifying_controller = require('../controllers/qualifyingController');
const { check } = require('express-validator/check');


/**
 * Get the Qualifying badges api doc page.
 * @return HTML Page or an error page with a error message
 */
router.get('/docs', function(req, res, next) {
	res.render('docsqualifying');
});

/**
 * Get the qualifying badge management page. This shows a page for managing qualifying badges for the given badge id.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML for the admin's qualifying badge view page
 */
router.post('/manage', [
	check('token').optional(),
	check('badgeid', 'You must include the id of the badge').not().isEmpty()
], qualifying_controller.getQualifyingBadgeManagementPage);

/**
 * Get the qualifying badge view page. This shows a badge issuer the qualifying badges for a given badge id.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML for the issuer's qualifying badge view page
 */
router.post('/viewissuer', [
	check('token').optional(),
	check('badgeid', 'You must include the id of the badge').not().isEmpty()
], qualifying_controller.getQualifyingBadgeIssuerPage);

/**
 * Create a new qualifying badge record
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param badgeid, Required. The record identifier of the badge the qualifying badge is being associated with.
 * @param title, Required. The title of the qualifying badge as it will appear in the badge JSON.
 * @param description, Required. The description of the qualifying badge as it will appear in the badge JSON.
 * @param domain, Required. The hosted domain of this qualifying badge as it will appear in the badge JSON.
 * @param issuername, Required. The issuer name for this qualifying badge as it will appear in the badge JSON.
 * @param issuerurl, Required. The issuer url for this qualifying badge, as it will appear in the badge JSON.
 * @param startdate, Optional. The date from which this badge is a qualifying badge, in seconds.
 * @param enddate, Optional. The date up to which this badge is a qualifying badge, in seconds.
 * @return JSON of the qualifying badge or a JSON error object
 */
router.post('/create', [
	check('token').optional(),
	check('badgeid', 'You must include the id of the badge the qualifying badge is being associated with').not().isEmpty(),
	check('title', 'You must include a title for the qualifying badge you want to create').not().isEmpty(),
	check('description', 'You must include a description for the qualifying badge you want to create').not().isEmpty(),
	check('domain', 'You must include the domain of this qualifying badge').not().isEmpty(),
	check('issuername', 'You must include the issuer name of this qualifying badge').not().isEmpty(),
	check('issuerurl', 'You must include the url for the issuer of this qualifying badge').not().isEmpty(),
	check('startdate').optional(),
	check('enddate').optional()
], qualifying_controller.createBadge);

/**
 * Update an existing qualifying badge record
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param qualifyingbadgeid, Required. The record identifier of the qualifying badge you want to update.
 * @param badgeid, Required. The record identifier of the badge the qualifying badge is associated with.
 * @param title, Optional. The title of the qualifying badge as it will appear in the badge JSON.
 * @param description, Optional. The description of the qualifying badge as it will appear in the badge JSON.
 * @param domain, Optional. The hosted domain of this qualifying badge as it will appear in the badge JSON.
 * @param issuername, Optional. The issuer name for this qualifying badge as it will appear in the badge JSON.
 * @param issuerurl, Optional. The issuer url for this qualifying badge, as it will appear in the badge JSON.
 * @param startdate, Optional. The date from which this badge is a qualifying badge, in seconds.
 * @param enddate, Optional. The date up to which this badge is a qualifying badge, in seconds.
 * @return JSON of the qualifying badge or a JSON error object
 */
router.post('/update', [
	check('token').optional(),
	check('qualifyingbadgeid', 'You must include the id of the qualifying badge being updated').not().isEmpty(),
	check('badgeid', 'You must include the id of the badge the qualifying badge is being associated with').not().isEmpty(),
	check('title').optional(),
	check('description').optional(),
	check('domain').optional(),
	check('issuername').optional(),
	check('issuerurl').optional(),
	check('startdate').optional(),
	check('enddate').optional()
], qualifying_controller.updateBadge);

/**
 * Delete a qualifying badge record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param qualifyingbadgeid, Required. The identifier of the qualifying badge record you wish to delete.
 * @return JSON with the id of the deleted qualifying badge and a status of -1 or a JSON error object
 */
router.post('/delete', [
	check('token').optional(),
	check('qualifyingbadgeid', 'You must include the id of the qualifying badge you want to delete').not().isEmpty()
], qualifying_controller.deleteBadge);

/**
 * Get a list of qualifying badge records for the given badge id.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'badges' pointing to an array of the qualifying badge records for the given badge id or a JSON error object.
 */
router.get('/listall/:id', [
	check('token').optional(),
	check('id', 'You must include the id of the badge').not().isEmpty()
], qualifying_controller.listAllBadges);

/**
 * Check if the data given matches a qualifying badge.
 * @param title, Required. The title of the qualifying badge to check against.
 * @param description, Required. The description of the qualifying badge to check against.
 * @param issuedon, Required. The date the qualifying date was issued.
 * @param issuername, Required. The issuer name for the qualifying badge to check again.
 * @param issuerurl, Required. The issuer url for the qualifying badge to check against.
 * @param badgeurl, Required. The url for the hosted qualifying badge data.
 * @return JSON with the property 'qualifies' set to true or false as well as additional properties of the fetched badge data
 */
router.post('/check', [
	check('title', 'You must include badge title to check for qualification').not().isEmpty(),
	check('description', 'You must include badge description to check for qualification').not().isEmpty(),
	check('issuedon', 'You must include the date the qualifying badge was issued').not().isEmpty(),
	check('issuername', 'You must include badge issuer name to check for qualification').not().isEmpty(),
	check('issuerurl', 'You must include badge issuer url to check for qualification').not().isEmpty(),
	check('badgeurl', 'You must include the assertion url for the qualifying badge').isURL({require_tld: false})
], qualifying_controller.qualifyingCheck);

/**
 * Enable or disable a qualifying badge as claimable.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param qualifyingbadgeid, Required. The record identifier of the qualifying badge to change the enable state for.
 * @param enabled, Required. true or false as to whether to enable or disable a qualifying badge as claimable.
 * @return JSON with the given properties above, or a JSON error object.
 */
router.post('/enableupdate', [
	check('token').optional(),
	check('qualifyingbadgeid', 'You must include the id of the qualifying badge').not().isEmpty(),
	check('enabled', 'You must include an enabled state for the qualifying badge').not().isEmpty()
], qualifying_controller.enableUpdate);

/**
 * Check to see if the recipient record and user record exist for the currently logged in user, matching the identity details passed
 * and that the recipient has been issued the badge with the passed id.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param identity, Required. The identity property being checked.
 * @param salt, Required. The encryption salt for encrypting the identity being checked.
 * @param type, Required. The type of identity verification being checked.
 * @param badgeid, Required. The record identifier of the badge claimed.
 * @return JSON with the properties: 'signedon', 'identityok', 'accountexists', 'recipientexists' and 'badgeissued' or a JSON error object.
 */
router.post('/checkusermatch', [
	check('token').optional(),
	check('identity', 'You must include the identity string being checked').not().isEmpty(),
	check('salt', 'You must include the encryption salt').not().isEmpty(),
	check('badgeid', 'You must include the id of the badge being claimed').not().isEmpty(),
	check('type', 'You must include the type of verification').not().isEmpty()
], qualifying_controller.checkUserMatch);

/**
 * Check to see if the given identity for the badge being claimed matches the given email address.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param identity, Required. The identity property being checked.
 * @param salt, Required. The encryption salt for encrypting the identity being checked.
 * @param type, Required. The type of identity verification being checked.
 * @param badgeid, Required. The record identifier of the badge claimed.
 * @param badgeid, Required. The email address to check against.
 * @return JSON with the properties: 'signedon', 'identityok', 'accountexists', 'recipientexists' and 'badgeissued' or a JSON error object.
 */
router.post('/checkuseremailmatch', [
	check('token').optional(),
	check('identity', 'You must include the identity string being checked').not().isEmpty(),
	check('salt', 'You must include the encryption salt').not().isEmpty(),
	check('type', 'You must include the type of verification').not().isEmpty(),
	check('badgeid', 'You must include the id of the badge being claimed').not().isEmpty(),
	check('email', 'The email must be a vaild address').isEmail()
], qualifying_controller.checkUserEmailMatch);

/**
 * Create a Recipient record and user record, if it does not exist for the badge claimant.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param username, Required. The name to use for the Recipient record and login account.
 * @param email, Required. An email address to use for the Recipient record and login account.
 * @return JSON with the record identifier for the new Recipient user account record, or a JSON error object.
 */
router.post('/createaccount', [
	check('username', 'You must include the username that will be used for the new account').not().isEmpty(),
	check('email', 'The email must be a vaild address').isEmail()
], qualifying_controller.createAccount);

/**
 * Call from a link in the registration email to complete Recipient account creation.
 * @param id, Required. The record identifier of the Recipient record to complete registration for.
 * @param key, Optional. The registration unique key to authorise this account registration completion.
 * @return HTML of the change password page or error page with error message.
 */
router.get('/completeregistration', [
    check('id', 'You must include the id of the user to complete registation for').not().isEmpty(),
    check('key', 'You must include the key').not().isEmpty()
], qualifying_controller.completeRegistration);

/**
 * Load data from a remote url of a qualifying badge.
 * @param remoteurl. Required. The qualifying badge url of the remote data to load.
 * @return the remote data or a JSON error object.
 */
router.post('/loadremotedata', [
	check('remoteurl', 'You must include the remote url for the qualifying badge data to be loaded.').isURL({require_tld: false})
], qualifying_controller.loadRemoteData);

module.exports = router;
