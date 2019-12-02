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

var maintitle = "Web Service API - Recipients";
var routes = [
	{
		"path": "/",
		"description": "Draws the Recipients home page - if logged in and user has permissions",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/recipients",
		"id": "10",
		"regexp": "/\\/(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/manage",
		"description": "Draws the Manage Recipients's page - if logged in and user has permissions",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/recipients",
		"id": "11",
		"regexp": "/\\/manage(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/docs",
		"description": "Draws the Recipient API Documentation page",
		"params": [],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/recipients",
		"id": "12",
		"regexp": "/\\/docs(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/id",
		"description": "Get a Recipient by it's record identifier. Only administrators and Issuers will be allowed to retrieve Recipients records.",
		"params": [
			{"name":"id", "description":"Requires the identifier of the Recipient record you wish to retrieve."},
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [{"name":"passed", "description":"returns true or false if the badged passed validation or not, or error"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/recipients",
		"id": "13",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
    },
    {
		"path": "/uniqueid/:id",
		"description": "Get a Recipient by it's unique identifier. Only administrators and Issuers will be allowed to retrieve Recipients records.",
		"params": [
			{"name":"uniqueid", "description":"Requires the unique identifier of the Recipient record you wish to retrieve."},
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [{"name":"passed", "description":"returns true or false if the badged passed validation or not, or error"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/recipients",
		"id": "14",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/list",
		"description": "Get a list of all Recepient records. Only administrators and Issuers will be allowed to retrieve Recepients records.",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [{"name":"passed", "description":"returns true or false if the badged passed validation or not, or error"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/recipients/",
		"id": "15",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/create",
		"description": "Create a new Recepient - creates a new login account if one does not already exists for the given login email address. Only administrators will be allowed to create new Recepients",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"name", "description":"Required. You must include a name for the new Recepient"},
			{"name":"email", "description":"Required. You must include an email address for the new Recepient"},
			{"name":"uniqueid", "description":"Optional. You can include an unique id for the new Recepient"},
		],
		"returns" : [
			{"name":"id", "description":"ID of the Recipient"},
			{"name":"timecreated", "description":"Time in which the Recipient account is created"},
			{"name":"name", "description":"Name of the Recipient"},
			{"name":"email", "description":"Email of the Recipient"},
			{"name":"uniqueid", "description":"Unique ID of the Recipient"},
			{"name":"status", "description":"Status of the Recipient"},

		],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/recipients/",
		"id": "16",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update an existing Recepient record only if it has not been used to issue a badge",
		"params": [

			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"id", "description":"Required. You must include an id to update an Recepient"},
			{"name":"name", "description":"Optional. You can update the name of an Recepient"},
			{"name":"email", "description":"Optional. You can update email of an Recepient"},
            {"name":"uniqueid", "description":"Optional. You can update unique id of an Recepient"},
	],
		"returns" : [{"name":"id", "description":"ID of the Recipient"},
		{"name":"timecreated", "description":"Time in which the Recipient account is created"},
		{"name":"name", "description":"Updated Name of the Recipient"},
		{"name":"email", "description":"Updated Email of the Recipient"},
		{"name":"uniqueid", "description":"Updated Unique ID of the Recipient"},
		{"name":"status", "description":"Updated Status of the Recipient"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/recipients/",
		"id": "17",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete an existing Recepient record only if it has not been used to issue a badge",
		"params": [{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},{"name":"id", "description":"Required. You must enter an ID of an Recepient to delete them"}],
		"returns" : [{"name":"ID", "description":"returns ID of the deleted recipient"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/recipients/",
		"id": "18",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},];
