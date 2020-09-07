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

var maintitle = "Web Service API - Events";
var routes = [
	{
		"path": "/stats/:id",
		"description": "Get an Event statistics (used for the Leaderboard page)",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The identifier of the Event record you wish to retrieve statistics for." }
		],
		"returns": [
			{ "name": "badgestats", "description": "Stats of the badges at the event" },
			{ "name": "peoplestats", "description": "Stats of the delegates at the event" },
			{ "name": "attendeecount", "description": "Number of delegates at the event" }
		],
		"methods": {
			"get": true
		},
		"permissions": ["everyone"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events",
		"id": "121",
		"regexp": "/\\/stats\\/:id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/checkattendee",
		"description": "Check if a Recipient with the given name and email address is listed as an attendee for the event with the given record identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The identifier of the Event record you wish to check an attendee for." },
			{ "name": "name", "description": "Required. The name of the Recipient you wish to check against." },
			{ "name": "email", "description": "Required. The email address of the Recipient you wish to check against." }
		],
		"returns": [
			{ "name": "found", "description": "true/false as to whether the Recipient was identified and found to be going to the event (Based on having event permissions set)" },
		],
		"methods": {
			"get": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events",
		"id": "122",
		"regexp": "/\\/checkattendee(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/id/:id",
		"description": "Get an event by it's record identifier",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The identifier of the Event record you wish to retrieve." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the event" },
			{ "name": "timecreated", "description": "Time at which the Event record was added" },
			{ "name": "uniqueid", "description":"Unique hash identification number used in JSONLD"},
			{ "name": "name", "description": "The name of the Event item." },
			{ "name": "description", "description": "The description of the Event." },
			{ "name": "startdate", "description": "The start date for the new Event item (in seconds)." },
			{ "name": "enddate", "description": "The end date for the new Event item (in seconds)." },
			{ "name": "location_name", "description": "The name for the location of the Event." },
			{ "name": "location_pobox", "description": "The post office box number for PO box addresses, if applicable for the Events's location" },
			{ "name": "location_streetaddress", "description": "The street address for the Events's location" },
			{ "name": "location_locality", "description": "The town or city for the Events's location address" },
			{ "name": "location_region", "description": "The county or region for the Events's location  address" },
			{ "name": "location_country", "description": "The country for the Events's location  address" },
			{ "name": "location_postcode", "description": "The postal code for the Events's location  address." },
			{ "name": "usedInIssuance", "description": "true/false indicating if this Event has been referenced in an issued Badge." }
		],
		"methods": {
			"get": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events",
		"id": "126",
		"regexp": "/\\/id/:id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/list",
		"description": "Get a list of all Event records for the currently logged in user.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" }
		],
		"returns": [
			{ "name": "events", "description": "An array of Event records (see route '" + cfg.proxy_path + "/events/id:id' for full details of the record structure)" }
		],
		"methods": {
			"get": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events",
		"id": "127",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/create",
		"description": "Create a new Event record.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "name", "description": "Required. The name of the Event item." },
			{ "name": "startdate", "description": "Required. The start date for the new Event item (in seconds)." },
			{ "name": "enddate", "description": "Required. The end date for the new Event item (in seconds)." },
			{ "name": "description", "description": "Optional. The description of the Event." },
			{ "name": "location_name", "description": "Optional. The name for the location of the Event." },
			{ "name": "location_pobox", "description": "Optional. The post office box number for PO box addresses, if applicable for the Events's location" },
			{ "name": "location_streetaddress", "description": "Optional. The street address for the Events's location" },
			{ "name": "location_locality", "description": "Optional. The town or city for the Events's location address" },
			{ "name": "location_region", "description": "Optional. The county or region for the Events's location  address" },
			{ "name": "location_country", "description": "Optional. The country for the Events's location  address" },
			{ "name": "location_postcode", "description": "Optional. The postal code for the Events's location  address." },
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the event" },
			{ "name": "timecreated", "description": "Time at which the Event record was added" },
			{ "name": "uniqueid", "description":"Unique hash identification number used in JSONLD"},
			{ "name": "name", "description": "The name of the Event item." },
			{ "name": "description", "description": "The description of the Event." },
			{ "name": "startdate", "description": "The start date for the new Event item (in seconds)." },
			{ "name": "enddate", "description": "The end date for the new Event item (in seconds)." },
			{ "name": "location_name", "description": "The name for the location of the Event." },
			{ "name": "location_pobox", "description": "The post office box number for PO box addresses, if applicable for the Events's location" },
			{ "name": "location_streetaddress", "description": "The street address for the Events's location" },
			{ "name": "location_locality", "description": "The town or city for the Events's location address" },
			{ "name": "location_region", "description": "The county or region for the Events's location  address" },
			{ "name": "location_country", "description": "The country for the Events's location  address" },
			{ "name": "location_postcode", "description": "The postal code for the Events's location  address." },
			{ "name": "usedInIssuance", "description": "true/false indicating if this Event has been referenced in an issued Badge. It will currently be 'false'." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events",
		"id": "128",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update an existing Event record.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. You must include the id of the event you want to update" },
			{ "name": "name", "description": "Optional. The name of the Event item." },
			{ "name": "description", "description": "Optional. The description of the Event." },
			{ "name": "startdate", "description": "Optional. The start date for the new Event item (in seconds)." },
			{ "name": "enddate", "description": "Optional. The end date for the new Event item (in seconds)." },
			{ "name": "location_name", "description": "Optional. The name for the location of the Event." },
			{ "name": "location_pobox", "description": "Optional. The post office box number for PO box addresses, if applicable for the Events's location" },
			{ "name": "location_streetaddress", "description": "Optional. The street address for the Events's location" },
			{ "name": "location_locality", "description": "Optional. The town or city for the Events's location address" },
			{ "name": "location_region", "description": "Optional. The county or region for the Events's location  address" },
			{ "name": "location_country", "description": "Optional. The country for the Events's location  address" },
			{ "name": "location_postcode", "description": "Optional. The postal code for the Events's location  address." },
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the event" },
			{ "name": "timecreated", "description": "Time at which the Event record was added" },
			{ "name": "uniqueid", "description":"Unique hash identification number used in JSONLD"},
			{ "name": "name", "description": "The name of the Event item." },
			{ "name": "description", "description": "The description of the Event." },
			{ "name": "startdate", "description": "The start date for the new Event item (in seconds)." },
			{ "name": "enddate", "description": "The end date for the new Event item (in seconds)." },
			{ "name": "location_name", "description": "The name for the location of the Event." },
			{ "name": "location_pobox", "description": "The post office box number for PO box addresses, if applicable for the Events's location" },
			{ "name": "location_streetaddress", "description": "The street address for the Events's location" },
			{ "name": "location_locality", "description": "The town or city for the Events's location address" },
			{ "name": "location_region", "description": "The county or region for the Events's location  address" },
			{ "name": "location_country", "description": "The country for the Events's location  address" },
			{ "name": "location_postcode", "description": "The postal code for the Events's location  address." },
			{ "name": "usedInIssuance", "description": "true/false indicating if this Event has been referenced in an issued Badge. It will currently be 'false'." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events/",
		"id": "129",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete an existing Event record.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Event you wish to delete." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Event record that was deleted" },
			{ "name": "status", "description": "A status of -1 to show that the Event record was deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events/",
		"id": "130",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/addorganizer",
		"description": "Add an organizer (Organization) to an Event.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Event you wish to add an organizer to." },
			{ "name": "organizationid", "description": "Required. The record identifier of the Organization you wish to add as organizer of the Event." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the event organiser association record" },
			{ "name": "timecreated", "description": "The time the event organiser association record was created" },
			{ "name": "eventid", "description": "The record identifier of the Event" },
			{ "name": "organizationid", "description": "The record identifier of the organizer (Organization)" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["admin", "super"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events/",
		"id": "131",
		"regexp": "/\\/addorganizer(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/removeorganizer",
		"description": "Remove an organizer (Organization) from an Event.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Event you wish to remove an organizer from." },
			{ "name": "organizationid", "description": "Required. The record identifier of the Organization you wish to remove as an organizer of the Event." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Event" },
			{ "name": "organizationid", "description": "The record identifier of the Organization" },
			{ "name": "status", "description": "A status of -1 to show that the event organiser association record was deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["admin", "super"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events/",
		"id": "132",
		"regexp": "/\\/removeorganizer(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/listorganizers",
		"description": " Get a list of all the orgaizers (Organization records) for the Event with the given record identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Event you wish to get organizers for." }
		],
		"returns": [
			{ "name": "organizers", "description": "An array of Organization records who are the organizers of the event, (see route '" + cfg.proxy_path + "/organizations/id:id' for full details of the record structure)" },
		],
		"methods": {
			"get": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events/",
		"id": "133",
		"regexp": "/\\/listorganizers(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/addsponsor",
		"description": "Add a sponsor (Organization) to an Event record.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Event you wish to add a sponsor to." },
			{ "name": "organizationid", "description": "Required. The record identifier of the organizer (Organization) you wish to add as a sponsor of the Event." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Event event sponsor association record" },
			{ "name": "timecreated", "description": "The time the event sponsor association record was created" },
			{ "name": "eventid", "description": "The record identifier of the Event" },
			{ "name": "organizationid", "description": "The record identifier of the organizer (Organization)" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["admin", "super"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events/",
		"id": "134",
		"regexp": "/\\/addsponsor(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/removesponsor",
		"description": "Remove a sponsor (Organization) from an Event.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Event you wish to remove a sponsor from." },
			{ "name": "organizationid", "description": "Required. The record identifier of the Organization you wish to remove as a sponsor of the Event." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Event" },
			{ "name": "organizationid", "description": "The record identifier of the Organization" },
			{ "name": "status", "description": "A status of -1 to show that the event sponsor association record was deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["admin", "super"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events/",
		"id": "135",
		"regexp": "/\\/removesponsor(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/listsponsors",
		"description": "Get a list of all the sponsors (Organization records) for the Event with the given record identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Event you wish to get sponsors for." }
		],
		"returns": [
			{ "name": "sponsors", "description": "An array of Organization records who are the sponsors of the event, (see route '" + cfg.proxy_path + "/organizations/id:id' for full details)" },
		],
		"methods": {
			"get": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events/",
		"id": "136",
		"regexp": "/\\/listsponsors(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/listforissuer",
		"description": "Get a list of all Event records for the currently logged in issuer (who is not the owner of the records).",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" }
		],
		"returns": [
			{ "name": "events", "description": "An array of Event records (see route '" + cfg.proxy_path + "/events/id:id' for full details)" }
		],
		"methods": {
			"get": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events/",
		"id": "138",
		"regexp": "/\\/listforissuer(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/addbulkrecipientpermission",
		"description": "Create multiple Recipient Event permission records for if the Recipients allows their name to be displayed on the Event leaderboard. Using a cvs file uploaded.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "eventid", "description": "Required. The record identifier of the Event you wish to add Recipient permissions for." }
		],
		"returns": [
			{ "name": "recipients", "description": "An array holding the Recipient permission records added (see route '/"+cfg.proxy_path+"/events/addrecipientpermission' for more details)" },
			{ "name": "recipientsmissed", "description": "An array holding the Recipient permission record if not process for some reason." },
			{ "name": "recipientsduplicate", "description": "An array holding the Recipient permission record if already in the database so not processed." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events/",
		"id": "139",
		"regexp": "/\\/addbulkrecipientpermission(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/addrecipientpermission",
		"description": "Create a Recipient Event permission record for if the Recipient allows their name to be displayed on the Event leaderboard.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "eventid", "description": "Required. The record identifier of the Event you wish to add Recipient permissions for." },
			{ "name": "recipientid", "description": "Required. The record identifier of the Recipient you wish to add Recipient permissions for" },
			{ "name": "canshowname", "description": "Required. 0/1 or true/false. 1/true if the Recipient allows their name on the leaderboard, 0/false if not." }
		],
		"returns": [
			{ "name": "id", "description": "Required. The record identifier of the recipient permissions record" },
			{ "name": "timecreated", "description": "Time at which the Recipient permission record was created" },
			{ "name": "eventid", "description": "Required. The record identifier of the Event" },
			{ "name": "recipientid", "description": "Required. The record identifier of the Recipient" },
			{ "name": "canshowname", "description": "Required. 0/1 or true/false. 1/true if the Recipient allows their name on the leaderboard, 0/false if not." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events/",
		"id": "140",
		"regexp": "/\\/addrecipientpermission(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/updaterecipientpermission",
		"description": "Update a Recipient Event permission record.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Recipient Event permission record you wish to update." },
			{ "name": "canshowname", "description": "Required. 0/1 or true/false. 1/true if the Recipient allows their name on the leaderboard, 0/false if not." }
		],
		"returns": [
			{ "name": "id", "description": "Required. The record identifier of the recipient permissions record" },
			{ "name": "timecreated", "description": "Time at which the Recipient permission record was created" },
			{ "name": "eventid", "description": "Required. The record identifier of the Event" },
			{ "name": "recipientid", "description": "Required. The record identifier of the Recipient" },
			{ "name": "canshowname", "description": "Required. 0/1 or true/false. 1/true if the Recipient allows their name on the leaderboard, 0/false if not." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events/",
		"id": "141",
		"regexp": "/\\/updaterecipientpermission(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/deleterecipientpermission",
		"description": "Delete a Recipient Event permission record.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Recipient Event permission record you wish to delete." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Recepient permission record that was deleted" },
			{ "name": "status", "description": "A status of -1 to show that the Recepient record was deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events/",
		"id": "142",
		"regexp": "/\\/deleterecipientpermission(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/listrecipientpermissions",
		"description": "Get a list of all Recipient Event permission records for the currently logged in issuer.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" }
		],
		"returns": [
			{ "name": "items", "description": "An array of recipient permission records, (see route '/"+cfg.proxy_path+"/events/addrecipientpermission' for more details)" },
		],
		"methods": {
			"get": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/events\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/events/",
		"id": "143",
		"regexp": "/\\/listrecipientpermissions(?:\\?.*)?$/",
		"examplesPresent": false
	}
];
