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

const recipient_controller = require('../controllers/recipientController');
const { check } = require('express-validator/check');

/**
 * Get the Recipient management page for the currently logged in issuers.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for managing Recipient records or error page with error message.
 */
router.get('/manage', [
	check('token').optional(),
],	recipient_controller.getRecipientManagementPage);

/**
 * Get the Recipient API documentation page.
 * @return HTML Page of the Recipient API documentation
 */
router.get('/docs', function(req, res, next) {
	res.render('docsrecipients', { title: 'Recipient API Documentation' });
});

/**
 * Get the Recipient information page.
 * @return HTML Page of the Recipient information
 */
router.get('/information', function(req, res, next) {
	res.render('inforecipients');
});

/**
 * Get a list of all Recipient records for the currently logged in user (issuer).
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'recipients' pointing to an array of the Recipient records, or a JSON error object.
 */
router.get('/list', [
	check('token').optional(),
], recipient_controller.listRecipients);

/**
 * Get an Recipient record by the issuer's unique identifier for the Recipient.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The issuer unique identifier of the Recipient you wish to retrieve.
 * @return JSON with Recipient record data or a JSON error object.
 */
router.get('/uniqueid/:id', [
	check('token').optional(),
	check('id', 'You must include the issuer\'s unique id for the recipient you want to get the data for').not().isEmpty(),
], recipient_controller.getRecipientsByUniqueId);

/**
 * Get an Recipient record by it's record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Recipient record you wish to retrieve.
 * @return JSON with Recipient record data or a JSON error object.
 */
router.get('/id/:id', [
	check('token').optional(),
	check('id', 'You must include the record id for the recipient you want to get the data for').not().isEmpty(),
], recipient_controller.getRecipientsById);

//check('name', 'You must include triple data for this RDF Merkle Tree record').not().isEmpty()

/**
 * Create a new Recipient record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param name, Required. A name for the Recipient.
 * @param email, Required. An email address for the Recipient.
 * @param issueruniqueid, Optional. A unique id given by the issuer for this recipient. (internal use only)
 * @return JSON object with 'recipients', 'recipientsmissed' and 'recipientsduplicates' properties.
 */
router.post('/create', [
	check('token').optional(),
	check('name', 'You must include a name for this recipient.').not().isEmpty(),
	check('email', 'You must include the email for this recipient.').not().isEmpty(),
	check('issueruniqueid').optional(),
	check('groupid').optional()
], recipient_controller.createRecipient);

/**
 * Create multiple badge recipient records from a cvs file upload.
 * @param recipientdatafile, Required. The cvs file with the the recipient data to create Recipient records for, (expected on the req.files object)
 * @return JSON object with 'recipients', 'recipientsmissed' and 'recipientsduplicates' properties.
 */
router.post('/createbulk', [
	check('token').optional(),
], recipient_controller.createBulkRecipients);

/**
 * Update an existing Recipient record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Recipient record you want to update.
 * @param name, Required. A name for the Recipient.
 * @param email, Required. An email address for the Recipient.
 * @param issueruniqueid, Optional. A unique id given by the issuer for this Recipient. (internal use only)
 * @return JSON with the data for the updated Recipient record, or a JSON error object.
 */
router.post('/update', [
	check('token').optional(),
	check('id', 'You must include the id for the recipient you want to update').not().isEmpty(),
	check('email').optional(),
	check('name').optional(),
	check('issueruniqueid').optional()
], recipient_controller.updateRecipient);

/**
 * Create a User record entry to allow a Recipient to login to the system.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Recipient record you want to add a login account for.
 * @param loginemail, Optional. An email address to use the the Recipient login account.
 * @return JSON with the data for new Recipient user account record, or a JSON error object.
 */
router.post('/resenduseraccountemail', [
	check('token').optional(),
	check('id', 'You must include the id for the recipient you want to resend the user account creation email for').not().isEmpty(),
], recipient_controller.resendRecipientUserAccountEmail);

router.post('/createuseraccount', [
	check('token').optional(),
	check('id', 'You must include the id for the recipient you want to create a user account for').not().isEmpty(),
], recipient_controller.createRecipientUserAccount);

/**
 * Request a Recipient website user account from the recipient record owner - Issuer
 * @param id, Required. The record identifier of the Recipient record you want to add a login account for.
 * @return a web page showing the reponse - error or sucessful request message
 */
router.get('/requestaccount/:id', [
	check('id', 'You must include the id for the recipient you want to request a user account for').not().isEmpty(),
], recipient_controller.requestRecipientUserAccount);

/**
 * Call from a link in the registration email to complete Recipient account creation.
 * @param id, Required. The record identifier of the Recipient record to complete registration for.
 * @param key, Optional. The registration unique key to authorise this account registration completion.
 * @return HTML of the change password page or error page with error message.
 */
router.get('/completeregistration', [
    check('id', 'You must include the id of the user to complete registation for').not().isEmpty(),
    check('key', 'You must include the key').not().isEmpty(),

], recipient_controller.completeRegistration);

/**
 * Delete an existing Recipient record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Recipient you wish to delete.
 * @return JSON with the id of the Recipient record that was deleted and a status property of -1, or a JSON error object.
 */
router.post('/delete', [
	check('token').optional(),
	check('id', 'You must include the id for the recipient you want to delete').not().isEmpty(),
], recipient_controller.deleteRecipient);



/** RECIPIENT GROUP ROUTES **/

/**
 * Create a Recipient group record with the given name and status
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param name, Required. The name of the new Recipient group.
 * @param status, Required. The status of the new Recipient group. 0/1 to indicate if the group is active (1) or inactive (0).
 * @return JSON object of the newly created Recipient group record or an error object.
 */
router.post('/groups/create', [
	check('token').optional(),
	check('name', 'You must include a name for this recipient group.').not().isEmpty(),
	check('status', 'You must include a status to say if the group is active for this recipient group. ').not().isEmpty(),
], recipient_controller.createRecipientGroup);

/**
 * Update an existing Recipient group record
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Recipient group record you wish to update.
 * @param name, Required. The name of the new Recipient group.
 * @param status, Required. The status of the new Recipient group. 0/1 to indicate if the group is active (1) or inactive (0).
 * @return JSON object of the updated Recipient group record or an error object.
 */
router.post('/groups/update', [
	check('token').optional(),
	check('id', 'You must include the id for the recipient group you want to update').not().isEmpty(),
	check('name', 'You must include a name for this recipient group.').not().isEmpty(),
	check('status', 'You must include a status to say if the group is active for this recipient group. ').not().isEmpty(),
], recipient_controller.updateRecipientGroup);

/**
 * Delete an existing Recipient group record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Recipient group you wish to delete.
 * @return JSON with the id of the Recipient group record that was deleted and a status property of -1, or a JSON error object.
 */
router.post('/groups/delete', [
	check('token').optional(),
	check('id', 'You must include the id for the recipient group you want to delete').not().isEmpty(),
], recipient_controller.deleteRecipientGroup);

/**
 * Get a list of all Recipient group records for the currently logged in user (issuer).
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'recipientgroups' pointing to an array of the Recipient group records, or a JSON error object.
 */
router.get('/groups/list', [
	check('token').optional(),
], recipient_controller.listRecipientGroups);

/**
 * Add a Recipient to a Recipient group.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Recipient group you wish to add a Recipient to.
 * @param recipientid, Required. The record identifier of the Recipient you wish to add to the Recipient group.
 * @return JSON object representing the new association between the Recipient and the Recipient group.
 */
router.post('/groups/addrecipient', [
	check('token').optional(),
	check('id', 'You must include the id for the recipient group you want to add a recipient to').not().isEmpty(),
	check('recipientid', 'You must include the id of the recipient to add to the group.').not().isEmpty(),
], recipient_controller.addRecipientToGroup);

/**
 * Remove a Recipient from a Recipient group.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Recipient you wish to remove a from the Recipient group.
 * @param recipientid, Required. The record identifier of the Recipient group you wish to remove the Recipient from.
 * @return JSON object with the properties, 'id', 'recipientid' and 'status' which is set to -1 to indicate the deletion of the association.
 */
router.post('/groups/removerecipient', [
	check('token').optional(),
	check('id', 'You must include the id for the recipient group you want to remove a recipient from').not().isEmpty(),
	check('recipientid', 'You must include the id of the recipient to add to the group.').not().isEmpty(),
], recipient_controller.removeRecipientFromGroup);

/**
 * Replace all the Recipients that are in the group with the list of Recipients given.
 * This replaces all previous settings of recipients for this group with just the given list of recipients.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Recipient group to set the Recipients for.
 * @param recipientids. Required. A comma separate list of Recipient record identifiers so set as the Recipients for the Recipient group. An empty string will empty the group
 * @return JSON with the 'id' of the Recipient group record, the 'recipientids' added to the group and a status property of 1 to show success, or a JSON error object.
 */
router.post('/groups/setrecipients', [
	check('token').optional(),
	check('id', 'You must include the id for the recipient group to set the recipients for').not().isEmpty(),
	check('recipientids', 'You must include a comma separated string of the ids of the recipients to add to the group, or an empty string to clear the group'),
], recipient_controller.setRecipientForGroup);

/**
 * Get a list of all the Recipients for the Recipient group with the given record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Recipient group you wish to get Recipients for.
 * @return JSON with an object with key 'recipients' pointing to an array of the Recipient records, or a JSON error object.
 */
router.get('/groups/listrecipients/:id', [
	check('token').optional(),
	check('id', 'You must include the id for the recipient group you want to list recipients for').not().isEmpty(),
], recipient_controller.listRecipientsInGroup);

/**
 * Get the Recipient Groups management page.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for managing Recipient groups or error page with error message.
 */
router.get('/groups/members', [
    check('token').optional(),
], recipient_controller.getRecipientGroupingsPage);

/**
 * Get the Recipient Groups management page.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for managing Recipient groups or error page with error message.
 */
router.get('/groups', [
	check('token').optional(),
], recipient_controller.getRecipientGroupsPage);

/**
 * Get the recipients's home page
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML of the recipients's home page or error page with error message.
 */
router.get('/', [
	check('token').optional(),
],	recipient_controller.getRecipientPage);

module.exports = router;
