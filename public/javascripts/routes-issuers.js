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

var maintitle = "Web Service API - Issuers";
var routes = [
	{
		"path": "/id/:id",
		"description": "Get an Issuer record by it's record identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The identifier of the Issuer record you wish to retrieve" }
		],
		"returns": [
			{"name":"id", "description":"The record identifier of the Issuer"},
			{"name":"timecreated", "description":"Time at which the Issuer record was created"},
			{"name":"uniqueid", "description":"Unique hash identification number used in JSONLD"},
			{"name":"name", "description":"Name of the Issuer"},
			{"name":"description", "description":"Description of the Issuer"},
			{"name":"url", "description":"URL of the website of the Issuer"},
			{"name":"email", "description":"Email of the Issuer"},
			{"name":"telephone", "description":"Telephone number of the Issuer"},
			{"name":"imageurl", "description":"URL pointing to a logo / image file for the Issuer"},
			{"name":"status", "description":"Stauts of a Issuer's associated user account"},
			{"name":"loginemail", "description": "If an Issuer login account has been created, the email address used." },
			{"name":"usedInIssuance", "description": "true/false as to whether this Issuer has been used against an issued badge." }
		],
		"permissions" : ["super","admin"],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/issuers/",
		"id": "184",
		"regexp": "/\\/id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/list",
		"description": "Get a list of all Issuer records. Only administrators will be allowed to retrieve Issuer records.",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns": [
			{ "name": "endorsers", "description": "An array of Issuer records (see route '" + cfg.proxy_path + "/issuers/id:id' for full details of the record structure)" }
		],
		"methods": {
			"get": true
		},
		"permissions" : ["super","admin"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/issuers/",
		"id": "185",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/create",
		"description": "Create a new Issuer - creates a new login account if one does not already exists for the given login email address. Only administrators will be allowed to create new Issuers",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "name", "description": "Required. A name for the Issuer." },
			{ "name": "url", "description": "Required. A website url for the Issuer." },
			{ "name": "email", "description": "Optional. An email address for the Issuer." },
			{ "name": "telephone", "description": "Optional. A telephone Number for the Issuer." },
			{ "name": "description", "description": "Optional. A textual description of the Issuer." },
			{ "name": "imageurl", "description": "Optional. A URL pointing to a logo / image file for the Issuer." }
		],
		"returns": [
			{"name":"id", "description":"The record identifier of the Issuer"},
			{"name":"timecreated", "description":"Time at which the Issuer record was created"},
			{"name":"uniqueid", "description":"Unique hash identification number used in JSONLD"},
			{"name":"name", "description":"Name of the Issuer"},
			{"name":"description", "description":"Description of the Issuer"},
			{"name":"url", "description":"URL of the website of the Issuer"},
			{"name":"email", "description":"Email of the Issuer"},
			{"name":"telephone", "description":"Telephone number of the Issuer"},
			{"name":"imageurl", "description":"URL pointing to a logo / image file for the Issuer"},
			{"name":"status", "description":"Stauts of a Issuer's associated user account"},
			{"name":"loginemail", "description": "If an Issuer login account has been created, the email address used." },
			{"name":"usedInIssuance", "description": "true/false as to whether this Issuer has been used against an issued badge." }
		],
		"methods": {
			"post": true
		},
		"permissions" : ["super","admin"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/issuers/",
		"id": "186",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/createuseraccount",
		"description": "Create a User record entry to allow an Issuer to login to the system.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Issuer record you want to add a login account for." },
			{ "name": "loginemail", "description": "Required. An email address to use the the Issuer login account." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Issuer record that this login account is for." },
			{ "name": "timecreated", "description": "Time at which the user account was created." },
			{ "name": "name", "description": "The name of the Issuer used on the Issuer login account record." },
			{ "name": "email", "description": "The login email address used on the Issuer login account record." },
			{ "name": "status", "description": "Status of the login account registration process. It will be '0' at this point." }
		],
		"methods": {
			"post": true
		},
		"permissions" : ["super","admin"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/issuers/",
		"id": "187",
		"regexp": "/\\/createuseraccount(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update an existing Issuer record only if it has not been used to issue a badge.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. You must include an id to update an Issuer" },
			{ "name": "name", "description": "Optional. A name for the Issuer." },
			{ "name": "url", "description": "Optional. A website url for the Issuer." },
			{ "name": "email", "description": "Optional. An email address for the Issuer." },
			{ "name": "telephone", "description": "Optional. A telephone Number for the Issuer." },
			{ "name": "description", "description": "Optional. A textual description of the Issuer." },
			{ "name": "imageurl", "description": "Optional. A URL pointing to a logo / image file for the Issuer." }
		],
		"returns": [
			{"name":"id", "description":"The record identifier of the Issuer"},
			{"name":"timecreated", "description":"Time at which the Issuer record was created"},
			{"name":"uniqueid", "description":"Unique hash identification number used in JSONLD"},
			{"name":"name", "description":"Name of the Issuer"},
			{"name":"description", "description":"Description of the Issuer"},
			{"name":"url", "description":"URL of the website of the Issuer"},
			{"name":"email", "description":"Email of the Issuer"},
			{"name":"telephone", "description":"Telephone number of the Issuer"},
			{"name":"imageurl", "description":"URL pointing to a logo / image file for the Issuer"},
			{"name":"status", "description":"Stauts of a v's associated user account"},
			{"name":"loginemail", "description": "If an Issuer login account has been created, the email address used." },
			{"name":"usedInIssuance", "description": "true/false as to whether this Issuer has been used against an issued badge." }
		],
		"methods": {
			"post": true
		},
		"permissions" : ["super","admin"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/issuers/",
		"id": "189",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete an existing Issuer record only if it has not been used to issue a badge.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Issuer you wish to delete." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Issuer record that was deleted" },
			{ "name": "status", "description": "A status of -1 to show that the Issuer record was deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions" : ["super","admin"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/issuers/",
		"id": "190",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/:id",
		"description": "Get the Issuer Open Badge JSON from the given unique issuer identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The identifier of the Issuer record you wish to retrieve" }
		],
		"returns": [
			{"name":"@context", "description":"The open badge context url"},
			{"name":"type", "description":"Issuer"},
			{"name":"id", "description":"The uri/url representing this issuer"},
			{"name":"name", "description":"Name of the Issuer"},
			{"name":"description", "description":"Optional. Description of the Issuer"},
			{"name":"url", "description":"URL of the website of the Issuer"},
			{"name":"email", "description":"Email of the Issuer"},
			{"name":"telephone", "description":"Optional. Telephone number of the Issuer"},
			{"name":"imageurl", "description":"URL pointing to a logo / image file for the Issuer"}
		],
		"permissions" : ["everyone"],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/issuers/",
		"id": "185",
		"regexp": "/\\/:id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/hosted/:id",
		"description": "Get the hosted Issuer Open Badge JSON from the given unique issuer identifier.",
		"params": [
			{ "name": "id", "description": "Required. the Issuer unique identifier." }
		],
		"returns": [
			{"name":"@context", "description":"The open badge context url"},
			{"name":"type", "description":"Issuer"},
			{"name":"id", "description":"The uri/url representing this issuer"},
			{"name":"name", "description":"Name of the Issuer"},
			{"name":"description", "description":"Optional. Description of the Issuer"},
			{"name":"url", "description":"URL of the website of the Issuer"},
			{"name":"email", "description":"Email of the Issuer"},
			{"name":"telephone", "description":"Optional. Telephone number of the Issuer"},
			{"name":"imageurl", "description":"URL pointing to a logo / image file for the Issuer"},
			{"name":"verification", "description":"hosted"},
			{"name":"publicKey", "description":"The public key url of this issuer"},
		],
		"permissions" : ["everyone"],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/issuers/",
		"id": "186",
		"regexp": "/\\/hosted\\/:id(?:\\?.*)?$/",
		"examplesPresent": false
	}
];