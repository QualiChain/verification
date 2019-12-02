/*********************************************************************************
* The MIT License (MIT)                                                          *
*                                                                                *
* Copyright (c) 2019 KMi, The Open University UK                                 *
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

/** Author: Michelle Bachler, KMi, The Open University **/
/** Author: Manoharan Ramachandran, KMi, The Open University **/
/** Author: Kevin Quick, KMi, The Open University **/

var maintitle = "Web Service API - Badges";
var routes = [
	{
		"path": "/",
		"description": "Draws the Badging Service home page",
		"params": [],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "70",
		"regexp": "/\\/(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/docindex",
		"description": "Draws the Badges API Documentation page",
		"params": [],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/?\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "71",
		"regexp": "/\\/docindex(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/validation",
		"description": "Draws Badge Validation page.",
		"params": [],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/?\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "83",
		"regexp": "/\\/validation(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/privacy",
		"description": "Draws privacy statement page.",
		"params": [],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/?\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "84",
		"regexp": "/\\/validation(?:\\?.*)?$/",
		"examplesPresent": false
	},	{
		"path": "/docs",
		"description": "Draws API Documentation page",
		"params": [],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/?\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "72",
		"regexp": "/\\/docs(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/manage",
		"description": "Draws the Manage Badge's page - if logged in and user has permissions",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "73",
		"regexp": "/\\/manage(?:\\?.*)?$/",
		"examplesPresent": false
	},

	{
		"path": "/id:id",
		"description": "Get a Badge by it's record identifier. Only administrators, issuers and endorsers will be allowed to retrieve Badge records.",
		"params": [{"name":"id", "description":"Requires the internal identifier of the Badge record you wish to retrieve"},{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}],
		"returns" : [
			{"name":"id", "description":"ID of the Badge"},
			{"name":"timecreated", "description":"Time at which the Badge was created"},
			{"name":"uniqueid", "description":"Unique identification number"},
			{"name":"version", "description":"Version of the Badge"},
			{"name":"title", "description":"Title of the Badge"},
			{"name":"description", "description":"Description of the Badge"},
			{"name":"imageurl", "description":"URL of the Image"},
			{"name":"issuerid", "description":"Identification number of the Issuer"},
			{"name":"criteriaid", "description":"Identification number of the Criteria"},
			{"name":"criteriauniqueid", "description":"Unique identification number of the Criteria"},
			{"name":"criterianarrative", "description":"Criteria Narrative"},
		],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "74",
		"regexp": "/\\/id(?:\\?.*)?$/",
		"examplesPresent": false
	},

	{
		"path": "/:id",
		"description": "Get the Badge JSON by its external identifier.",
		"params": [{"name":"id", "description":"Requires the external identifier of the Badge record you wish to retrieve"},{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}],
		"returns" : [
			{"name":"id", "description":"ID of the Badge"},
			{"name":"timecreated", "description":"Time at which the Badge was created"},
			{"name":"uniqueid", "description":"Unique identification number"},
			{"name":"version", "description":"Version of the Badge"},
			{"name":"title", "description":"Title of the Badge"},
			{"name":"description", "description":"Description of the Badge"},
			{"name":"imageurl", "description":"URL of the Image"},
			{"name":"issuerid", "description":"Identification number of the Issuer"},
			{"name":"criteriaid", "description":"Identification number of the Criteria"},
			{"name":"criteriauniqueid", "description":"Unique identification number of the Criteria"},
			{"name":"criterianarrative", "description":"Criteria Narrative"},
		],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "85",
		"regexp": "/\\/id(?:\\?.*)?$/",
		"examplesPresent": false
	},

	{
		"path": "/list",
		"description": "Get a list of Badge belong to a particular issuer. Only administrators and Issuers will be allowed to retrieve Badge records for a particular issuer.",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [
			{"name":"id", "description":"ID of the Badge"},
			{"name":"timecreated", "description":"Time at which the Badge was created"},
			{"name":"badgeuniqueid", "description":"Unique identification number"},

			{"name":"title", "description":"Title of the Badge"},
			{"name":"description", "description":"Description of the Badge"},
			{"name":"imageurl", "description":"URL of the Image"},
			{"name":"issuerid", "description":"Identification number of the Issuer"},
			{"name":"criteriaid", "description":"Identification number of the Criteria"},
			{"name":"criteriauniqueid", "description":"Unique identification number of the Criteria"},
			{"name":"criterianarrative", "description":"Criteria Narrative"},
		],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "75",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},

	{
		"path": "/listall",
		"description": "Get a list of all Badge records. Only administrators will be allowed to retrieve all Badge records.",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [
			{"name":"id", "description":"ID of the Badge"},
			{"name":"timecreated", "description":"Time at which the Badge was created"},
			{"name":"badgeuniqueid", "description":"Unique identification number"},

			{"name":"title", "description":"Title of the Badge"},
			{"name":"description", "description":"Description of the Badge"},
			{"name":"imageurl", "description":"URL of the Image"},
			{"name":"issuerid", "description":"Identification number of the Issuer"},
			{"name":"criteriaid", "description":"Identification number of the Criteria"},
			{"name":"criteriauniqueid", "description":"Unique identification number of the Criteria"},
			{"name":"criterianarrative", "description":"Criteria Narrative"},
		],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "76",
		"regexp": "/\\/listall(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/create",
		"description": "Create a new Badge - creates a new login account if one does not already exists for the given login email address. Only administrators and issuers will be allowed to create new Badge",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"title", "description":"Required. You must include a title for the badge you want to create"},
			{"name":"description", "description":"Required. You must include a description for the badge you want to create."},
			{"name":"imageurl", "description":"Required. You must include an image url for the badge you want to create"},
			{"name":"version", "description":"Required. You must include the version number of this badge"},
			{"name":"issuerid", "description":"Required. You must include the id of the issuer of this badge"},
			{"name":"criterianarrative", "description":"Required. You must include the criteria description for earning this badge"},

		],
		"returns" : [
			{"name":"id", "description":"ID of the Badge"},
			{"name":"timecreated", "description":"Time in which the Badge is created"},
			{"name":"badgeuniqueid", "description":"Unique identification number"},
			{"name":"version", "description":"Version of the Badge"},
			{"name":"title", "description":"Title of the Badge"},
			{"name":"description", "description":"Description of the Badge"},
			{"name":"imageurl", "description":"URL of the Image"},
			{"name":"issuerid", "description":"Identification number of the Issuer"},
			{"name":"criteriaid", "description":"Identification number of the Criteria"},
			{"name":"criteriauniqueid", "description":"Unique identification number of the Criteria"},
			{"name":"criterianarrative", "description":"Criteria for earning the Badge"},
		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "77",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update an existing Badge record ",
		"params": [
		{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
		{"name":"id", "description":"Required. You must include the id of the badge you want to update"},
		{"name":"title", "description":"Optional. You can include a title for the badge you want to update"},
		{"name":"description", "description":"Optional. You can include a description for the badge you want to update."},
		{"name":"imageurl", "description":"Optional. You can include an image url for the badge you want to update"},
		{"name":"version", "description":"Optional. You can include the version number of this badge"},
		{"name":"criterianarrative", "description":"Optional. You can update the criteria description for earning this badge"},

	],
		"returns" : [
			{"name":"id", "description":"ID of the Badge"},
			{"name":"timecreated", "description":"Time in which the Badge is created"},
			{"name":"badgeuniqueid", "description":"Unique identification number"},
			{"name":"version", "description":"Version of the Badge"},
			{"name":"title", "description":"Title of the Badge"},
			{"name":"description", "description":"Description of the Badge"},
			{"name":"imageurl", "description":"URL of the Image"},
			{"name":"issuerid", "description":"Identification number of the Issuer"},
			{"name":"criteriaid", "description":"Identification number of the Criteria"},
			{"name":"criteriauniqueid", "description":"Unique identification number of the Criteria"},
			{"name":"criterianarrative", "description":"Criteria for earning the Badge"},

		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "78",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete an existing Alignment record only if it has not been used on an issued badge",
		"params": [
		{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
		{"name":"id", "description":"Required. You must include the id of the Badge you want to delete"}],
		"returns" : [{"name":"id", "description":"returns id of the badge that you deleted"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "79",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/addalignment",
		"description": "Add an Alignment to a Badge ",
		"params": [
		{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
		{"name":"id", "description":"Required. You must include the id of the badge you want to add an alignment to"},
		{"name":"alignmentid", "description":"Required. You must include the id of the alignment you want to add to the badge"},

	],
		"returns" : [
			{"name":"id", "description":"ID of the added Alignment"},
			{"name":"timecreated", "description":"Time in which the new Alignment is added"},
			{"name":"badgeid", "description":"Badge identification number"},
			{"name":"alignmentid", "description":"Alignment identification number"},
		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "80",
		"regexp": "/\\/addalignment(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/removealignment",
		"description": "Remove an Alignment from a Badge ",
		"params": [
		{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
		{"name":"id", "description":"Required. You must include the id of the badge you want to remove an alignment from"},
		{"name":"alignmentid", "description":"Required. You must include the id of the alignment you want to remove from the badge"},
		],
		"returns" : [
			{"name":"id", "description":"ID of the removed alignment"},
			{"name":"alignmentid", "description":"Alignment ID of the removed alignment"},
			{"name":"status", "description":"Status of the removed alignment"},
		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "81",
		"regexp": "/\\/removealignment(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/listalignment",
		"description": "List all Alignments for a Badgeid",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"id", "description":"Required. You must include the id of the badge you want to list alignments for"},
	],
		"returns" : [
			{"name":"id", "description":"ID of the Alignment"},
			{"name":"timecreated", "description":"Time in which the Alignment is added"},
			{"name":"url", "description":"URL of the Alignment"},
			{"name":"name", "description":"Name of the Alignment"},

			{"name":"description", "description":"Description of the Alignment"},
			{"name":"code", "description":"Code of the Alignment"},
			{"name":"framework", "description":"Alignment Framework"},
		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/?(?=\\/|$)/i",
		"prefix": "/badges/",
		"id": "82",
		"regexp": "/\\/listalignment(?:\\?.*)?$/",
		"examplesPresent": false
	},
];

