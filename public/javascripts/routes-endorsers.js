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

var maintitle = "Web Service API - Endorsers";
var routes = [
	{
		"path": "/",
		"description": "Draws the Endorsers home page - if logged in and user has permissions",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/endorsers",
		"id": "20",
		"regexp": "/\\/(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/manage",
		"description": "Draws the Manage Endorser's page - if logged in and user has permissions",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/endorsers",
		"id": "21",
		"regexp": "/\\/manage(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/docs",
		"description": "Draws the Endorser API Documentation page",
		"params": [],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/endorsers",
		"id": "22",
		"regexp": "/\\/docs(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/id",
		"description": "Get an Endorser by it's record identifier. Only administrators will be allowed to retrieve Endorser records.",
		"params": [
			{"name":"id", "description":"Requires the identifier of the Endorser record you wish to retrieve."},
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [
			{"name":"id", "description":"ID of the Endorser"},
			{"name":"timecreated", "description":"Time at which the user account was created"},
			{"name":"name", "description":"Name of the Endorser"},
			{"name":"description", "description":"Description of the Endorser"},
			{"name":"url", "description":"URL of the website of the Endorser"},
			{"name":"email", "description":"Email of the Endorser"},
			{"name":"telephone", "description":"Telephone of the Endorser"},
			{"name":"imageurl", "description":"Image url of the Endorser"},
			{"name":"status", "description":"Status of the Endorser"},
		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/endorsers",
		"id": "23",
		"regexp": "/\\/id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/list",
		"description": "Get a list of all Endorser records. Only administrators will be allowed to retrieve Endorser records.",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [
			{"name":"id", "description":"ID of the Endorser"},
			{"name":"timecreated", "description":"Time at which the user account was created"},
			{"name":"name", "description":"Name of the Endorser"},
			{"name":"description", "description":"Description of the Endorser"},
			{"name":"url", "description":"URL of the website of the Endorser"},
			{"name":"email", "description":"Email of the Endorser"},
			{"name":"telephone", "description":"Telephone of the Endorser"},
			{"name":"imageurl", "description":"Image url of the Endorser"},
			{"name":"status", "description":"Status of the Endorser"},
		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/endorsers/",
		"id": "24",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/create",
		"description": "Create a new Endorser - creates a new login account if one does not already exists for the given login email address. Only administrators will be allowed to create new Endorsers",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"name", "description":"Required. You must include a name for the new Endorser"},
			{"name":"loginemail", "description":"Required. You must include an email address that can be used as the login for the new Endorser. A verification email will be sent to complete registration."},
			{"name":"url", "description":"Required. You must include a website url for the new Endorser"},
			{"name":"telephone", "description":"Optional. You can include a contact telephone number for the new Endorser"},
			{"name":"email", "description":"Required. You must include an email address for the new Endorser"},
			{"name":"description", "description":"Optional. You can include a description for the new Endorser"},
			{"name":"imageurl", "description":"Optional. You can include an image url for the new Endorser"},
		],
		"returns" : [
			{"name":"id", "description":"ID of the Endorser"},
			{"name":"timecreated", "description":"Time at which the user account was created"},
			{"name":"name", "description":"Name of the Endorser"},
			{"name":"description", "description":"Description of the Endorser"},
			{"name":"url", "description":"URL of the website of the Endorser"},
			{"name":"email", "description":"Email of the Endorser"},
			{"name":"telephone", "description":"Telephone of the Endorser"},
			{"name":"imageurl", "description":"Image url of the Endorser"},
			{"name":"status", "description":"Status of the Endorser"},
		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/endorsers/",
		"id": "25",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update an existing Endorser record only if it has not been used to issue a badge",
		"params": [

			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"id", "description":"Required. You must include an id to update an Endorser"},
			{"name":"name", "description":"Optional. You can update the name of an Endorser"},
			{"name":"url", "description":"Optional. You can update website url of an Endorser"},
			{"name":"telephone", "description":"Optional. You can update contact telephone number of an Endorser"},
			{"name":"email", "description":"Optional. You can update an email address of an Endorser"},
			{"name":"description", "description":"Optional. You can update description of an Endorser"},
			{"name":"imageurl", "description":"Optional. You can update imageurl of an Endorser"},

	],
		"returns" : [
			{"name":"id", "description":"ID of the updated Endorser"},
			{"name":"timecreated", "description":"Time at which the Endorser account was created"},
			{"name":"name", "description":"Name of the Updated Endorser"},
			{"name":"description", "description":"Description of the Updated Endorser"},
			{"name":"url", "description":"URL of the website of the Updated Endorser"},
			{"name":"email", "description":"Email of the Updated Endorser"},
			{"name":"telephone", "description":"Telephone of the Updated Endorser"},
			{"name":"imageurl", "description":"Image url of the Updated Endorser"},
			{"name":"status", "description":"Status of the Updated Endorser"}
		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/endorsers/",
		"id": "26",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete an existing Endorser record only if it has not been used to issue a badge",
		"params": [{"name":"id", "description":"Required. You must enter an ID of an Endorser to delete them"}],
		"returns" : [
			{"name":"ID", "description":"returns ID of the deleted Endorser"}
		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/endorsers/",
		"id": "27",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},];
