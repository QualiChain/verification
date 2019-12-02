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

var maintitle = "Web Service API - Alignments";
var routes = [
	{
		"path": "/",
		"description": "Draws the Alignment API Documentation page",
		"params": [],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/alignments\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/alignments",
		"id": "90",
		"regexp": "/\\/(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/manage",
		"description": "Draws the Manage Alignments page - if logged in and user has permissions",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/alignments\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/alignments",
		"id": "91",
		"regexp": "/\\/manage(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/docs",
		"description": "Draws the Alignment API Documentation page",
		"params": [],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/alignments\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/alignments",
		"id": "92",
		"regexp": "/\\/docs(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/id",
		"description": "Get an Alignment by it's record identifier.",
		"params": [
			{"name":"id", "description":"Requires the identifier of the Issuer record you wish to retrieve."},
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [
			{"name":"id", "description":"ID of the Badge"},
			{"name":"timecreated", "description":"Time at which the Alignment was created"},
			{"name":"targetid", "description":"URL of the Alignment"},
			{"name":"targetname", "description":"Name of the Alignment"},
			{"name":"targetdescription", "description":"Description of the Alignment"},
			{"name":"targetcode", "description":"Code of the Alignment"},
			{"name":"targetframework", "description":"Framework of the Alignment"},

		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/alignments\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/alignments/",
		"id": "93",
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
			{"name":"id", "description":"ID of the Badge"},
			{"name":"timecreated", "description":"Time at which the Alignment was created"},
			{"name":"targetid", "description":"URL of the Alignment"},
			{"name":"targetname", "description":"Name of the Alignment"},
			{"name":"targetdescription", "description":"Description of the Alignment"},
			{"name":"targetcode", "description":"Code of the Alignment"},
			{"name":"targetframework", "description":"Framework of the Alignment"},

		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/alignments\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/alignments/",
		"id": "94",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/create",
		"description": "Create a new Alignment - creates a new login account if one does not already exists for the given login email address. Only administrators will be allowed to create new Issuers",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},

			{"name":"targetid", "description":"Required. You include enter the URL of the Alignment"},
			{"name":"targetname", "description":"Required. You must include the Name of the Alignment"},
			{"name":"targetdescription", "description":"Description of the Alignment"},
			{"name":"targetcode", "description":"Required. You must include the Code of the Alignment"},
			{"name":"targetframework", "description":"Optional You can include a Framework of the Alignment"},
		],
		"returns" : [{"name":"id", "description":"ID of the Badge"},
		{"name":"timecreated", "description":"Time at which the Alignment was created"},
		{"name":"targetid", "description":"URL of the Alignment"},
		{"name":"targetname", "description":"Name of the Alignment"},
		{"name":"targetdescription", "description":"Description of the Alignment"},
		{"name":"targetcode", "description":"Code of the Alignment"},
		{"name":"targetframework", "description":"Framework of the Alignment"},],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/alignments\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/alignments/",
		"id": "95",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update an existing Alignment record only if it has not been used on an issued badge",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"id", "description":"Requires the identifier of the Issuer record you wish to retrieve."},

	],
		"returns" : [{"name":"id", "description":"ID of the Badge"},
		{"name":"timecreated", "description":"Time at which the Alignment was created"},
		{"name":"targetid", "description":"URL of the Alignment"},
		{"name":"targetname", "description":"Name of the Alignment"},
		{"name":"targetdescription", "description":"Description of the Alignment"},
		{"name":"targetcode", "description":"Code of the Alignment"},
		{"name":"targetframework", "description":"Framework of the Alignment"},],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/alignments\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/alignments/",
		"id": "96",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete an existing Alignment record only if it has not been used on an issued badge",
		"params": [{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
		{"name":"id", "description":"Requires the identifier of the Issuer record you wish to retrieve."},],
		"returns" : [{"name":"ID", "description":"returns ID of the deleted Alignment"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/alignments\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/alignments/",
		"id": "97",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},];
