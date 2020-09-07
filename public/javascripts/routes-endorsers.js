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

var maintitle = "Web Service API - Endorsers";
var routes = [
	{
		"path": "/id/:id",
		"description": "Get an Endorser record by it's record identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The identifier of the Endorser record you wish to retrieve" }
		],
		"returns" : [
			{"name":"id", "description":"The record identifier of the Endorser"},
			{"name":"timecreated", "description":"Time at which the Endorser record was created"},
			{"name":"uniqueid", "description":"Unique hash identification number used in JSONLD"},
			{"name":"name", "description":"Name of the Endorser"},
			{"name":"description", "description":"Description of the Endorser"},
			{"name":"url", "description":"URL of the website of the Endorser"},
			{"name":"email", "description":"Email of the Endorser"},
			{"name":"telephone", "description":"Telephone number of the Endorser"},
			{"name":"imageurl", "description":"URL pointing to a logo / image file for the Endorser"},
			{"name":"status", "description":"Stauts of a Endorsers's associated user account"},
			{"name":"loginemail", "description": "If an Endorser login account has been created, the email address used." },
			{"name":"usedInIssuance", "description": "true/false as to whether this Endorser has been used against an issued badge." }
		],
		"methods": {
			"get": true
		},
		"permissions" : ["super","admin"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/endorsers",
		"id": "103",
		"regexp": "/\\/id/:id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/list",
		"description": "Get a list of all Endorser records. Only administrators will be allowed to retrieve Endorser records.",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns": [
			{ "name": "endorsers", "description": "An array of Endorser records (see route '" + cfg.proxy_path + "/endorsers/id:id' for full details of the record structure)" }
		],
		"methods": {
			"get": true
		},
		"permissions" : ["super","admin"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/endorsers/",
		"id": "104",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/create",
		"description": "Create a new Endorser - creates a new login account if one does not already exists for the given login email address. Only administrators will be allowed to create new Endorsers",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "name", "description": "Required. A name for the Endorser." },
			{ "name": "url", "description": "Required. A website url for the Endorser." },
			{ "name": "email", "description": "Optional. An email address for the Endorser." },
			{ "name": "telephone", "description": "Optional. A telephone Number for the Endorser." },
			{ "name": "description", "description": "Optional. A textual description of the Endorser." },
			{ "name": "imageurl", "description": "Optional. A URL pointing to a logo / image file for the Endorser." }
		],
		"returns": [
			{"name":"id", "description":"The record identifier of the Endorser"},
			{"name":"timecreated", "description":"Time at which the Endorser record was created"},
			{"name":"uniqueid", "description":"Unique hash identification number used in JSONLD"},
			{"name":"name", "description":"Name of the Endorser"},
			{"name":"description", "description":"Description of the Endorser"},
			{"name":"url", "description":"URL of the website of the Endorser"},
			{"name":"email", "description":"Email of the Endorser"},
			{"name":"telephone", "description":"Telephone number of the Endorser"},
			{"name":"imageurl", "description":"URL pointing to a logo / image file for the Endorser"},
			{"name":"status", "description":"Stauts of a Endorsers's associated user account"},
			{"name":"loginemail", "description": "If an Endorser login account has been created, the email address used." },
			{"name":"usedInIssuance", "description": "true/false as to whether this Endorser has been used against an issued badge." }
		],
		"methods": {
			"post": true
		},
		"permissions" : ["super","admin"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/endorsers/",
		"id": "105",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/createuseraccount",
		"description": "Create a User record entry to allow an Endorser to login to the system.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Endorser record you want to add a login account for." },
			{ "name": "loginemail", "description": "Required. An email address to use the the Endorser login account." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Endorser record that this login account is for." },
			{ "name": "timecreated", "description": "Time at which the user account was created." },
			{ "name": "name", "description": "The name of the Endorser used on the Endorser login account record." },
			{ "name": "email", "description": "The login email address used on the Endorser login account record." },
			{ "name": "status", "description": "Status of the login account registration process. It will be '0' at this point." }
		],
		"methods": {
			"post": true
		},
		"permissions" : ["super","admin"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/endorsers/",
		"id": "106",
		"regexp": "/\\/createuseraccount(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update an existing Endorser record only if it has not been used to issue a badge.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. You must include an id to update an Endorser" },
			{ "name": "name", "description": "Optional. A name for the Endorser." },
			{ "name": "url", "description": "Optional. A website url for the Endorser." },
			{ "name": "email", "description": "Optional. An email address for the Endorser." },
			{ "name": "telephone", "description": "Optional. A telephone Number for the Endorser." },
			{ "name": "description", "description": "Optional. A textual description of the Endorser." },
			{ "name": "imageurl", "description": "Optional. A URL pointing to a logo / image file for the Endorser." }
		],
		"returns": [
			{"name":"id", "description":"The record identifier of the Endorser"},
			{"name":"timecreated", "description":"Time at which the Endorser record was created"},
			{"name":"uniqueid", "description":"Unique hash identification number used in JSONLD"},
			{"name":"name", "description":"Name of the Endorser"},
			{"name":"description", "description":"Description of the Endorser"},
			{"name":"url", "description":"URL of the website of the Endorser"},
			{"name":"email", "description":"Email of the Endorser"},
			{"name":"telephone", "description":"Telephone number of the Endorser"},
			{"name":"imageurl", "description":"URL pointing to a logo / image file for the Endorser"},
			{"name":"status", "description":"Stauts of a Endorsers's associated user account"},
			{"name":"loginemail", "description": "If an Endorser login account has been created, the email address used." },
			{"name":"usedInIssuance", "description": "true/false as to whether this Endorser has been used against an issued badge." }
		],
		"methods": {
			"post": true
		},
		"permissions" : ["super","admin"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/endorsers/",
		"id": "108",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete an existing Endorser record only if it has not been used to issue a badge.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Endorser you wish to delete." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Endorser record that was deleted" },
			{ "name": "status", "description": "A status of -1 to show that the Endorser record was deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions" : ["super","admin"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/endorsers/",
		"id": "109",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/hosted/:id",
		"description": "Get the hosted Endorser Open Badge JSON from the given unique issuer identifier.",
		"params": [
			{ "name": "id", "description": "Required. the Endorser unique identifier." }
		],
		"returns": [
			{"name":"@context", "description":"The open badge context url"},
			{"name":"type", "description":"Issuer"},
			{"name":"id", "description":"The uri/url representing this Endorser"},
			{"name":"name", "description":"Name of the Endorser"},
			{"name":"description", "description":"Optional. Description of the Endorser"},
			{"name":"url", "description":"URL of the website of the Endorser"},
			{"name":"email", "description":"Email of the Endorser"},
			{"name":"telephone", "description":"Optional. Telephone number of the Endorser"},
			{"name":"imageurl", "description":"URL pointing to a logo / image file for the Endorser"}
		],
		"permissions" : ["everyone"],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/endorsers/",
		"id": "110",
		"regexp": "/\\/hosted\\/:id(?:\\?.*)?$/",
		"examplesPresent": false
	}
];
