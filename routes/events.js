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

const event_controller = require('../controllers/eventController');
const { check } = require('express-validator/check');


/**
 * Get an Event statistics (used for the Leaderboard page).
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Event record you wish to retrieve statistics for.
 * @return JSON with Event statistic data or a JSON error object.
 */
router.get('/stats/:id', [
	check('token').optional(),
	check('id', 'You must include the id of the event you want to get statistics for').not().isEmpty(),
], event_controller.getEventStatistics);

/**
 * Get the Event leaderboard page.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Event record you wish to get the leaderboard page for.
 * @return HTML page for Event leaderboard or error page with error message.
 */
router.get('/leaderboard/:id', [
	check('token').optional(),
	check('id', 'You must include the id of the event you want to draw the leader board for').not().isEmpty(),
], event_controller.getEventStatisticsPage);

/**
 * Check if a Recipient with the given name and email address is listed as an attendee for the event with the given record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Event record you wish to check an attendee for.
 * @param name, Required. The name of the Recipient you wish to check against.
 * @param email, Required. The email address of the Recipient you wish to check against.
 * @return JSON object with property 'found' set to 'true' or 'false' or a JSON error object.
 */
router.get('/checkattendee/', [
	check('token').optional(),
	check('id', 'You must include the id of the event you want to check the attendee for').not().isEmpty(),
	check('name', 'You must include a name for this recipient to check').not().isEmpty(),
	check('email', 'You must include the email for this recipient to check').not().isEmpty()
], event_controller.checkEventAttendee);

/**
 * Get the Event management page for the currently logged in administrator.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return HTML page for managing Event records or error page with error message.
 */
router.get('/manage', [
	check('token').optional(),
],	event_controller.getEventManagementPage);

/**
 * Get the Event API documentation page.
 * @return HTML Page of the Event API documentation
 */
router.get('/docs', function(req, res, next) {
	res.render('docsevents');
});

/**
 * Get an Event record by it's record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The identifier of the Event record you wish to retrieve.
 * @return JSON with Event record data or a JSON error object.
 */
router.get('/id/:id', [
	check('token').optional(),
	check('id', 'You must the id of the event you want to get').not().isEmpty(),
], event_controller.getEventById);

/**
 * Get a list of all Event records for the currently logged in user.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'events' pointing to an array of the Event records, or a JSON error object.
 */
router.get('/list', [
	check('token').optional(),
], event_controller.listEvents);

/**
 * Create a new Event record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param name, Required. A name for the new Event item.
 * @param startdate, Required. A start date for the new Event item (in seconds).
 * @param enddate, Required. An end date for the new Event item (in seconds).
 * @param description, Optional. An description of the Event.
 * @param location_name, Required. A name for the location of the Event.
 * @param location_pobox, Optional. The post office box number for PO box addresses, if applicable for the Events's location.
 * @param location_streetaddress, Optional. The street address for the Events's location. For example, 1600 Amphitheatre Pkwy.
 * @param location_locality, Optional. The town or city for the Events's location address.
 * @param location_region, Optional. The county or region for the Events's location  address.
 * @param location_postcode, Optional. The postal code for the Events's location  address.
 * @param location_country, Optional. The country for the Events's location  address.
 * @return JSON with the data for new Organization record, or a JSON error object.
 */
router.post('/create', [
	check('token').optional(),
	check('name', 'You must include a name for the new event item').not().isEmpty(),
	check('startdate', 'You must include a start date for the new event item (in seconds)').not().isEmpty(),
	check('enddate', 'You must include an end date for the new event item (in seconds)').not().isEmpty(),
	check('description').optional(),
	check('location_name').optional(),
	check('location_pobox').optional(),
	check('location_streetaddress').optional(),
	check('location_locality').optional(),
	check('location_region').optional(),
	check('location_postcode').optional(),
	check('location_country').optional(),
], event_controller.createEvent);

/**
 * Update an existing Event record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param name, Required. A name for the new Event item.
 * @param startdate, Required. A start date for the new Event item (in seconds).
 * @param enddate, Required. An end date for the new Event item (in seconds).
 * @param description, Optional. An description of the Event.
 * @param location_name, Required. A name for the location of the Event.
 * @param location_pobox, Optional. The post office box number for PO box addresses, if applicable for the Events's location.
 * @param location_streetaddress, Optional. The street address for the Events's location. For example, 1600 Amphitheatre Pkwy.
 * @param location_locality, Optional. The town or city for the Events's location address.
 * @param location_region, Optional. The county or region for the Events's location  address.
 * @param location_postcode, Optional. The postal code for the Events's location  address.
 * @param location_country, Optional. The country for the Events's location  address.
 * @return JSON with the data for new Organization record, or a JSON error object.
 */
router.post('/update', [
	check('token').optional(),
	check('id', 'You must include the id of the event you want to update').not().isEmpty(),
	check('name').optional(),
	check('description').optional(),
	check('startdate').optional(),
	check('enddate').optional(),
	check('location_name').optional(),
	check('location_addressid').optional(),
	check('location_pobox').optional(),
	check('location_streetaddress').optional(),
	check('location_locality').optional(),
	check('location_region').optional(),
	check('location_postcode').optional(),
	check('location_country').optional(),
], event_controller.updateEvent);

/**
 * Delete an existing Event record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Event you wish to delete.
 * @return JSON with the id of the Event record that was deleted and a status property of -1, or a JSON error object.
 */
router.post('/delete', [
	check('token').optional(),
	check('id', 'You must include the id of the event you want to delete').not().isEmpty(),
], event_controller.deleteEvent);


/** EVENT ORGANIZER ROUTES **/

/**
 * Add an organizer (Organization) to an Event.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Event you wish to add an organizer to.
 * @param organizationid, Required. The record identifier of the Organization you wish to add as organizer of the Event.
 * @return JSON object representing the new association between the Organization (organizer) and the Event.
 */
router.post('/addorganizer', [
	check('token').optional(),
	check('id', 'You must include the id of the event you want to add an organizer to').not().isEmpty(),
	check('organizationid', 'You must include the id of the organization you want to add to the event as an organizer').not().isEmpty(),
], event_controller.addOrganizer);

/**
 * Remove an organizer (Organization) from an Event.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Event you wish to remove an organizer from.
 * @param organizationid, Required. The record identifier of the Organization you wish to remove as an organizer of the Event.
 * @return JSON object with the properties, 'id', 'organizationid' and 'status' which is set to -1 to indicate the deletion of the association.
 */
router.post('/removeorganizer', [
	check('token').optional(),
	check('id', 'You must include the id of the event you want to remove an organizer from').not().isEmpty(),
	check('organizationid', 'You must include the id of the organization you want to remove from the event as an organizer').not().isEmpty(),
], event_controller.removeOrganizer);

/**
 * Get a list of all the orgaizers (Organization records) for the Event with the given record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Event you wish to get organizers for.
 * @return JSON with an object with key 'organizers' pointing to an array of the Organization records, or a JSON error object.
 */
router.get('/listorganizers/:id', [
	check('token').optional(),
	check('id', 'You must include the id of the event you want to list sponsors from').not().isEmpty(),
], event_controller.listOrganizers);


/** EVENT SPONSOR ROUTES **/

/**
 * Add a sponsor (Organization) to an Event record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Event you wish to add a sponsor to.
 * @param organizationid, Required. The record identifier of the Organization you wish to add as a sponsor of the Event.
 * @return JSON object representing the new association between the Organization (sponsor) and the Event.
 */
router.post('/addsponsor', [
	check('token').optional(),
	check('id', 'You must include the id of the event you want to add a sponsor to').not().isEmpty(),
	check('organizationid', 'You must include the id of the organization you want to add to the event as a sponsor').not().isEmpty(),
], event_controller.addSponsor);

/**
 * Remove a sponsor (Organization) from an Event.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Event you wish to remove a sponsor from.
 * @param organizationid, Required. The record identifier of the Organization you wish to remove as a sponsor of the Event.
 * @return JSON object with the properties, 'id', 'organizationid' and 'status' which is set to -1 to indicate the deletion of the association.
 */
router.post('/removesponsor', [
	check('token').optional(),
	check('id', 'You must include the id of the event you want to remove an sponsor from').not().isEmpty(),
	check('organizationid', 'You must include the id of the organization you want to remove from the event as a sponsor').not().isEmpty(),
], event_controller.removeSponsor);

/**
 * Get a list of all the sponsors (Organization records) for the Event with the given record identifier.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Event you wish to get sponsors for.
 * @return JSON with an object with key 'sponsor' pointing to an array of the Organization records, or a JSON error object.
 */
router.get('/listsponsors/:id', [
	check('token').optional(),
	check('id', 'You must include the id of the event you want to list sponsors from').not().isEmpty(),
], event_controller.listSponsors);


/** EVENT RECIPIENT PERMISSIONS **/

/**
 * Get the page to manage Recipient permissions against an Event.
 * @return HTML Page to manage Recipient permissions against an Event.
 */
router.get('/managerecipientpermissions', [
	check('token').optional(),
], event_controller.getRecipientPermssionsPage);

/**
 * Get a list of all Event records for the currently logged in issuer (who is not the owner of the records).
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'events' pointing to an array of the Event records, or a JSON error object.
 */
router.get('/listforissuer', [
	check('token').optional(),
], event_controller.listIssuerEvents);

/**
 * Create multiple Recipient Event permission records for if the Recipients allows their name to be displayed on the Event leaderboard. Using a cvs file uploaded.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param eventid, Required. The record identifier of the Event you wish to add Recipient permissions for.
 * @return JSON object with 'recipients', 'recipientsmissed' and 'recipientsduplicates' properties.
 */
router.post('/addbulkrecipientpermission', [
	check('token').optional(),
	check('eventid', 'You must include the id of the event you want to upload bulk recipient permissions for').not().isEmpty(),
], event_controller.createBulkRecipientPermissions);

/**
 * Create a Recipient Event permission record for if the Recipient allows their name to be displayed on the Event leaderboard.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param eventid, Required. The record identifier of the Event you wish to add Recipient permissions for.
 * @param recipientid, Required. The record identifier of the Recipient you wish to add Recipient permissions for.
 * @param canshowname, Required. 0/1 or true/false. 1/true if the Recipient allows their name on the leaderboard, 0/false if not.
 * @return JSON with an object holding the Recipient Event permission record, or a JSON error object.
 */
router.post('/addrecipientpermission', [
	check('token').optional(),
	check('eventid', 'You must include the id of the event you want to add a recipient display permission for').not().isEmpty(),
	check('recipientid', 'You must include the id of the the recipient you want to add display permissions for').not().isEmpty(),
	check('canshowname', 'You must include the "canshowname" property set to true if they have permissioned displaying their name publically, false if not').not().isEmpty(),
], event_controller.addRecipientPermission);

/**
 * Update a Recipient Event permission record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Recipient Event permission record you wish to update.
 * @param canshowname, Required. 0/1 or true/false. 1/true if the Recipient allows their name on the leaderboard, 0/false if not.
 * @return JSON with an object with key 'events' pointing to an array of the Event records, or a JSON error object.
 */
router.post('/updaterecipientpermission', [
	check('token').optional(),
	check('id', 'You must include the id of the record you want to update the recipient display permission for').not().isEmpty(),
	check('canshowname', 'You must include the "canshowname" property set to true if they have permissioned displaying their name publically, false if not').not().isEmpty(),
], event_controller.updateRecipientPermission);

/**
 * Delete a Recipient Event permission record.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param id, Required. The record identifier of the Recipient Event permission record you wish to delete.
 * @return JSON with the id of the Recipient Event permission record that was deleted and a status property of -1, or a JSON error object.
 */
router.post('/deleterecipientpermission', [
	check('token').optional(),
	check('id', 'You must include the id of the recipient display permission record you want to delete').not().isEmpty(),
], event_controller.deleteRecipientPermission);

/**
 * Get a list of all Recipient Event permission records for the currently logged in issuer.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return JSON with an object with key 'items' pointing to an array of the Recipient Event permission records, or a JSON error object.
 */
router.get('/listrecipientpermissions', [
	check('token').optional()
], event_controller.listRecipientPermissions);

module.exports = router;
