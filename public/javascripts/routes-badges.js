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

var maintitle = "Web Service API - Badges";
var routes = [
	{
		"path": "/contract/:address",
		"description": "View Badge type RDFStore contract details from blockchain contract address",
		"params": [
			{ "name": "address", "description": "Required. The blockchain contract address of the badge type you want to get the details for" }
		],
		"returns": [
			{ "name": "address", "description": "The blockchain address of the RDFStore smart contract" },
			{ "name": "owner", "description": "The blockchain account number of the owner of the smart contract" },
			{ "name": "items", "description": "And array of the RDF triples for the JSONLD data of the Badge type this contract is related to" }
		],
		"methods": {
			"get": true
		},
		"permissions": ["everyone"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "79",
		"regexp": "/\\/contract/:address(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/id:id",
		"description": "Get a Badge record by it's record identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The identifier of the Badge record you wish to retrieve." },
		],
		"returns": [
			{ "name": "id", "description": "The identifier of the Badge record" },
			{ "name": "timecreated", "description": "Time at which the Badge record was created" },
			{ "name": "badgeuniqueid", "description": "Unique hash identification number used in JSONLD" },
			{ "name": "version", "description": "Version number of the Badge" },
			{ "name": "title", "description": "Title of the Badge" },
			{ "name": "description", "description": "Description of the Badge" },
			{ "name": "imageurl", "description": "URL of the Badge image" },
			{ "name": "imagepath", "description": "Local path to the Badge image (for administrative use only)" },
			{ "name": "issuerid", "description": "Record identifier of the Issuer" },
			{ "name": "parentbadgeid", "description": "Parent Badge identifier, if applicable" },
			{ "name": "criteriaid", "description": "Identification number of the associated Criteria record" },
			{ "name": "criteriauniqueid", "description": "Unique hash identification number of the Criteria used in JSONLD" },
			{ "name": "criterianarrative", "description": "Criteria narrative text" },
			{ "name": "tags", "description": "Comma separated list of the tags associated with this Badge record" }
		],
		"methods": {
			"get": true
		},
		"permissions": ["super","admin","issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "82",
		"regexp": "/\\/id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/list",
		"description": "Get a list of all badge records for the currently logged in user (issuer).",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" }
		],
		"returns": [
			{ "name": "badges", "description": "And array of Badge records" },
		],
		"methods": {
			"get": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "83",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/listall",
		"description": "Get a list of all badge records (super and admin permissions only).",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" }
		],
		"returns": [
			{ "name": "badges", "description": "And array of Badge records" },
		],
		"methods": {
			"get": true
		},
		"permissions": ["super","admin"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "84",
		"regexp": "/\\/listall(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/create",
		"description": "Create a new Badge record",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Badge record you want to update" },
			{ "name": "title", "description": "Optional. A title for the new Badge record" },
			{ "name": "description", "description": "Optional. A description the new Badge record." },
			{ "name": "imageurl", "description": "Optional. An image url for the new Badge record" },
			{ "name": "version", "description": "Optional. A version number for the new Badge record, e.g. '1.0'" },
			{ "name": "issuerid", "description": "Optional. The record identifier of the Issuer for this Badge record" },
			{ "name": "criterianarrative", "description": "Optional. A textual description of the criteria for being awarded this Badge record" },
			{ "name": "alignmentids", "description": "Optional. A comma separatedlist of Alignment ids to associate with this Badge record" },
			{ "name": "eventids", "description": "Optional. A comma separated list of Event ids to associate with this Badge record" },
			{ "name": "parentbadgeid", "description": "Optional. A Badge record identifier for a parent badge to this badge, for example when a super badge is dependent on obtaining certain child badges first" },
			{ "name": "tags", "description": "Optional. A comma separated list of tag words or phrases to associate with this Badge record" }
		],
		"returns": [
			{ "name": "id", "description": "The identifier of the Badge record" },
			{ "name": "timecreated", "description": "Time at which the Badge record was created" },
			{ "name": "badgeuniqueid", "description": "Unique hash identification number used in JSONLD" },
			{ "name": "version", "description": "Version number of the Badge" },
			{ "name": "title", "description": "Title of the Badge" },
			{ "name": "description", "description": "Description of the Badge" },
			{ "name": "imageurl", "description": "URL of the Badge image" },
			{ "name": "imagepath", "description": "Local path to the Badge image (for administrative use only)" },
			{ "name": "issuerid", "description": "Record identifier of the Issuer" },
			{ "name": "parentbadgeid", "description": "Parent Badge identifier, if applicable" },
			{ "name": "criteriaid", "description": "Identification number of the associated Criteria record" },
			{ "name": "criteriauniqueid", "description": "Unique hash identification number of the Criteria used in JSONLD" },
			{ "name": "criterianarrative", "description": "Criteria narrative text" },
			{ "name": "tags", "description": "Comma separated list of the tags associated with this Badge record" },
			{ "name": "usedInIssuance", "description": "true/false indicating if this Badge type has been issued to anyone. It will currently be 'false'." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super","admin"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "85",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update an existing Badge record. Cannot be updated if this Badge type has been issued. ",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier for the Badge record you want to update" },
			{ "name": "title", "description": "Required. A title for the new Badge record" },
			{ "name": "description", "description": "Required. A description the new Badge record." },
			{ "name": "imageurl", "description": "Required. An image url for the new Badge record" },
			{ "name": "version", "description": "Required. A version number for the new Badge record, e.g. '1.0'" },
			{ "name": "issuerid", "description": "Required. The record identifier of the Issuer for this Badge record" },
			{ "name": "criterianarrative", "description": "Required. A textual description of the criteria for being awarded this Badge record" },
			{ "name": "alignmentids", "description": "Optional. A comma separatedlist of Alignment ids to associate with this Badge record" },
			{ "name": "eventids", "description": "Optional. A comma separated list of Event ids to associate with this Badge record" },
			{ "name": "parentbadgeid", "description": "Optional. A Badge record identifier for a parent badge to this badge, for example when a super badge is dependent on obtaining certain child badges first" },
			{ "name": "tags", "description": "Optional. A comma separated list of tag words or phrases to associate with this Badge record" }
		],
		"returns": [
			{ "name": "id", "description": "The identifier of the Badge record" },
			{ "name": "timecreated", "description": "Time at which the Badge record was created" },
			{ "name": "badgeuniqueid", "description": "Unique hash identification number used in JSONLD" },
			{ "name": "version", "description": "Version number of the Badge" },
			{ "name": "title", "description": "Title of the Badge" },
			{ "name": "description", "description": "Description of the Badge" },
			{ "name": "imageurl", "description": "URL of the Badge image" },
			{ "name": "imagepath", "description": "Local path to the Badge image (for administrative use only)" },
			{ "name": "issuerid", "description": "Record identifier of the Issuer" },
			{ "name": "parentbadgeid", "description": "Parent Badge identifier, if applicable" },
			{ "name": "criteriaid", "description": "Identification number of the associated Criteria record" },
			{ "name": "criteriauniqueid", "description": "Unique hash identification number of the Criteria used in JSONLD" },
			{ "name": "criterianarrative", "description": "Criteria narrative text" },
			{ "name": "tags", "description": "Comma separated list of the tags associated with this Badge record" },
			{ "name": "usedInIssuance", "description": "true/false indicating if this Badge type has been issued to anyone. It will currently be 'false'." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super","admin"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "86",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete a Badge record. Cannot be delete if this Badge type has been issued.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Badge you wish to delete" }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Badge that was delete" },
			{ "name": "status", "description": "Returns status of -1 to indicate that the badge has been deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super","admin"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "87",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/listalignments",
		"description": "Get a list of all Alignment records associated with the given Badge record identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Badge you wish to get the Alignments for." }
		],
		"returns": [
			{ "name": "alignments", "description": "An array of Alignment records (see Alignments Route for details)" },
		],
		"methods": {
			"get": true
		},
		"permissions": ["super","admin","issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "88",
		"regexp": "/\\/listalignments(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/listcriteriaevents",
		"description": "Get a list of all Criteria Event records associated with the given Badge record identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. You must include the id of the badge you want to list criteris events for" }
		],
		"returns": [
			{ "name": "events", "description": "An array of Criteria event records (see Events Route for details)" },
		],
		"methods": {
			"get": true
		},
		"permissions": ["super","admin","issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "89",
		"regexp": "/\\/listcriteriaevents(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/validation/validate",
		"description": "Validate a Badge issuance (Assertion) from the JSONLD of the badge issuance and the email address of the Badge recipient.",
		"params": [
			{ "name": "badgejson", "description": "Required. The JSONLD of the badge issuance, as extracted from the Badge issuance file." },
			{ "name": "emailtoupload", "description": "Required. The email address of the Badge recipient for checking against." }
		],
		"returns": [
			{ "name": "badgejson", "description": " The JSONLD of the badge issuance, as passed in on the call." },
			{ "name": "result", "description": "A result object containing all the checks performed and their outcomes." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["everyone"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "90",
		"regexp": "/\\/validation\\/validate(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/validation/validatesigned",
		"description": "Validate a signed Badge issuance from the signature code embedded in the badge.",
		"params": [
			{ "name": "signature", "description": "Required. The Signature string that was embedded in the badge file." },
			{ "name": "emailtoupload", "description": "Required. The email address of the Badge recipient for checking against." }
		],
		"returns": [
			{ "name": "assertion", "description": " The JSONLD of the badge issuance retieved from the signature verification." },
			{ "name": "decodablesignature", "description": "Result variable for a check performed." },
			{ "name": "validassertionformat", "description": "Result variable for a check performed." },
			{ "name": "publicKeyMatches", "description": "Result variable for a check performed." },
			{ "name": "emailidentitymatches", "description": "Result variable for a check performed." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["everyone"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "91",
		"regexp": "/\\/validation\\/validatesigned(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/hosted/:id",
		"description": "Get a Badge type record in Open Badge JSONLD format for use with hosted verification by it's record identifier.",
		"params": [
			{ "name": "id", "description": "The identifier of the Badge record you wish to retrieve" }
		],
		"returns": [
			{ "name": "badge json object", "description": "The Open Badge JSONLD formatted data of the Badge type" },
		],
		"methods": {
			"get": true
		},
		"permissions": ["everyone"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "92",
		"regexp": "/\\/hosted\\/id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/:id",
		"description": "Get a Badge type record in Open Badge JSONLD format for use with blockchain verification by it's record identifier.",
		"params": [
			{ "name": "id", "description": "The identifier of the Badge record you wish to retrieve" }
		],
		"returns": [
			{ "name": "badge json object", "description": "The Open Badge JSONLD formatted data of the Badge type" },
		],
		"methods": {
			"get": true
		},
		"permissions": ["everyone"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "93",
		"regexp": "/\\/id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/images/create",
		"description": " Create a new Badge image.record",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "name", "description": "Optional. A title for the Badge image record." },
			{ "name": "json", "description": "Optional. JSON holding the specification details of the badge image creation." }
		],
		"returns": [
			{ "name": "id", "description": "The identifier of the Badge image record" },
			{ "name": "timecreated", "description": "Time at which the Badge image record was created" },
			{ "name": "name", "description": "A name for the badge image" },
			{ "name": "json", "description": "The JSON holding the badge image creation property settings" },
			{ "name": "url", "description": "The url of the badge image on the server" },
			{ "name": "usedInBadge", "description": "Whether the badge image has been assigned to a badge" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super","admin"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "94",
		"regexp": "/\\/images\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/images/update",
		"description": "Update an existing Badge image. Cannot be updated if this Badge image has been assigned to a badge.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier for the Badge image record you want to update" },
			{ "name": "name", "description": "Optional. A title for the Badge image record." },
			{ "name": "json", "description": "Optional. JSON holding the specification details of the badge image creation." }
		],
		"returns": [
			{ "name": "id", "description": "The identifier of the Badge image record" },
			{ "name": "timecreated", "description": "Time at which the Badge image record was created" },
			{ "name": "name", "description": "A name for the badge image" },
			{ "name": "json", "description": "The JSON holding the badge image creation property settings" },
			{ "name": "url", "description": "The url of the badge image on the server" },
			{ "name": "usedInBadge", "description": "Whether the badge image has been assigned to a badge" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super","admin"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "95",
		"regexp": "/\\/images\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/images/publish",
		"description": "Publich a Badge image to the server.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier for the Badge image record you want to update" },
			{ "name": "imagedata", "description": "Required. The base64 image data for the image you wish to publish." },
		],
		"returns": [
			{ "name": "id", "description": "The identifier of the Badge image record" },
			{ "name": "timecreated", "description": "Time at which the Badge image record was created" },
			{ "name": "name", "description": "A name for the badge image" },
			{ "name": "json", "description": "The JSON holding the badge image creation property settings" },
			{ "name": "url", "description": "The url of the badge image on the server" },
			{ "name": "usedInBadge", "description": "Whether the badge image has been assigned to a badge" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super","admin"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "96",
		"regexp": "/\\/images\\/publish(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/images/delete",
		"description": "Delete a Badge image record. Cannot be delete if this Badge image has been assigned to a badge.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Badge image you wish to delete" }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Badge image that was delete" },
			{ "name": "status", "description": "Returns status of -1 to indicate that the badge image has been deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super","admin"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + cfg.badges_path + "/",
		"id": "97",
		"regexp": "/\\/images\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
			"path": "/images/list",
			"description": "Get a list of all Badge image records for the currently logged in user.",
			"params": [
				{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			],
			"returns": [
				{ "name": "badgeimages", "description": "An array of badge image records (see route '" + cfg.proxy_path + cfg.badges_path + "/images/create' for full details of the record structure)" },
			],
			"methods": {
				"get": true
			},
			"permissions": ["super","admin"],
			"prefixRegexp": "/^\\" + cfg.proxy_path + cfg.badges_path + "\\/?(?=\\/|$)/i",
			"prefix": cfg.proxy_path + cfg.badges_path + "/",
			"id": "98",
			"regexp": "/\\/images\\/list(?:\\?.*)?$/",
			"examplesPresent": false
	}
];