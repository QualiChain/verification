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

var maintitle = "Web Service API - Issuers";
var routes = [
	{
		"path": "/",
		"description": "Draws the Issuer home page - if logged in and user has permissions",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/issuers",
		"id": "50",
		"regexp": "/\\/(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/manage",
		"description": "Draws the Manage Issuer's page - if logged in and user has permissions",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/issuers",
		"id": "51",
		"regexp": "/\\/manage(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/docs",
		"description": "Draws the Issuer API Documentation page",
		"params": [],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/issuers",
		"id": "52",
		"regexp": "/\\/docs(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/id",
		"description": "Get an Issuer by it's record identifier. Only administrators will be allowed to retrieve Issuer records.",
		"params": [
			{"name":"id", "description":"Requires the identifier of the Issuer record you wish to retrieve."},
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [
			{"name":"id", "description":"ID of the Issuer"},
			{"name":"timecreated", "description":"Time at which the user account was created"},
			{"name":"name", "description":"Name of the Issuer"},
			{"name":"description", "description":"Description of the Issuer"},
			{"name":"url", "description":"URL of the website of the Issuer"},
			{"name":"email", "description":"Email of the Issuer"},
			{"name":"telephone", "description":"Telephone of the Issuer"},
			{"name":"imageurl", "description":"Image url of the Issuer"},
			{"name":"status", "description":"Status of the Issuer"},
		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/issuers/",
		"id": "53",
		"regexp": "/\\/id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/list",
		"description": "Get a list of all issuer records. Only administrators will be allowed to retrieve Issuer records.",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [
			{"name":"id", "description":"ID of the Issuers"},
			{"name":"timecreated", "description":"Time at which the user account was created"},
			{"name":"name", "description":"Name of the Issuer"},
			{"name":"description", "description":"Description of the Issuer"},
			{"name":"url", "description":"URL of the website of the Issuer"},
			{"name":"email", "description":"Email of the Issuer"},
			{"name":"telephone", "description":"Telephone of the Issuer"},
			{"name":"imageurl", "description":"Image url of the Issuer"},
			{"name":"status", "description":"Status of the Issuer"},
		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/issuers/",
		"id": "54",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/create",
		"description": "Create a new Issuer - creates a new login account if one does not already exists for the given login email address. Only administrators will be allowed to create new Issuers",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"name", "description":"Required. You must include a name for the new Issuer"},
			{"name":"loginemail", "description":"Required. You must include an email address that can be used as the login for the new Issuer. A verification email will be sent to complete registration."},
			{"name":"password", "description":"Required. You must include a temporary login password for the new Issuer"},
			{"name":"url", "description":"Required. You must include a website url for the new Issuer"},
			{"name":"telephone", "description":"Required. You must include a contact telephone number for the new Issuer"},
			{"name":"email", "description":"Required. You must include an email address for the new Issuer"},
			{"name":"description", "description":"Optional. You can include a description for the new Issuer"},
			{"name":"imageurl", "description":"Optional. You can include an image url for the new Issuer"},
		],
		"returns" : [
			{"name":"id", "description":"ID of the Issuer"},
			{"name":"timecreated", "description":"Time at which the Issuer account was created"},
			{"name":"name", "description":"Name of the Issuer"},
			{"name":"description", "description":"Description of the Issuer"},
			{"name":"url", "description":"URL of the website of the Issuer"},
			{"name":"email", "description":"Email of the Issuer"},
			{"name":"telephone", "description":"Telephone of the Issuer"},
			{"name":"imageurl", "description":"Image url of the Issuer"},
			{"name":"status", "description":"Status of the Issuer"},
		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/issuers/",
		"id": "55",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update an existing Issuer record only if it has not been used to issue a badge",
		"params": [

			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"id", "description":"Required. You must include an id to update an Issuer"},
			{"name":"name", "description":"Optional. You can update the name of an Issuer"},
			{"name":"loginemail", "description":"Optional You can update an email address of an Issuer"},

			{"name":"url", "description":"Optional. You can update website url of an Issuer"},
			{"name":"telephone", "description":"Optional. You can update contact telephone number of an Issuer"},
			{"name":"email", "description":"Optional. You can update an email address of an Issuer"},
			{"name":"description", "description":"Optional. You can update description of an Issuer"},
			{"name":"imageurl", "description":"Optional. You can update imageurl of an Issuer"},

	],
		"returns" : [
			{"name":"id", "description":"ID of the updated Issuer"},
			{"name":"timecreated", "description":"Time at which the Issuer account was created"},
			{"name":"name", "description":"Name of the Updated Issuer"},
			{"name":"description", "description":"Description of the Updated Issuer"},
			{"name":"url", "description":"URL of the website of the Updated Issuer"},
			{"name":"email", "description":"Email of the Updated Issuer"},
			{"name":"telephone", "description":"Telephone of the Updated Issuer"},
			{"name":"imageurl", "description":"Image url of the Updated Issuer"},
			{"name":"status", "description":"Status of the Updated Issuer"}
		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/issuers/",
		"id": "56",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete an existing Issuer record only if it has not been used to issue a badge",
		"params": [{"name":"token", "description":"Required. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
		{"name":"id", "description":"Required. You must enter an ID of an Issuer to delete them"}],
		"returns" : [
			{"name":"ID", "description":"returns ID of the deleted `Issuer"}
		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/issuers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/issuers/",
		"id": "57",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},];
