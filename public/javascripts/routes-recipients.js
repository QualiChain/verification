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

var maintitle = "Web Service API - Recipients";
var routes = [
	{
		"path": "/list",
		"description": "Get a list of all Recipient records for the currently logged in user (issuer).",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" }
		],
		"returns": [
			{ "name": "recipients", "description": "An array of Recipient records (see route '"+cfg.proxy_path+"/recipients/id/:id' for more details of record structure)" }
		],
		"methods": {
			"get": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients/",
		"id": "224",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/uniqueid/:id",
		"description": "Get an Recipient record by the issuer's unique identifier for the Recipient.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "uniqueid", "description": "Required. The issuer unique identifier of the Recipient you wish to retrieve." }
		],
		"returns": [
			{"name":"id", "description": "The record indentifier of the Recipient record" },
			{"name":"timecreated", "description": "Time at which the Recipient record was created" },
			{"name":"name", "description": "Name of the Recipient" },
			{"name":"email", "description": "Email address of the Recipient" },
			{"name":"encodedemail", "description": "Encodedemail email address of the Recipient" },
			{"name":"uniqueid", "description": "Unique Isser identifier for the Recipient" },
			{"name":"status", "description":"Status of a Recipients's associated user account"},
		],
		"methods": {
			"get": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients",
		"id": "225",
		"regexp": "/\\/uniqueid\\/:id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/id/:id",
		"description": "Get an Recipient record by it's record identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The identifier of the Recipient record you wish to retrieve." }
		],
		"returns": [
			{"name":"id", "description": "The record indentifier of the Recipient record" },
			{"name":"timecreated", "description": "Time at which the Recipient record was created" },
			{"name":"name", "description": "Name of the Recipient" },
			{"name":"email", "description": "Email address of the Recipient" },
			{"name":"encodedemail", "description": "Encodedemail email address of the Recipient" },
			{"name":"uniqueid", "description": "Unique Isser identifier for the Recipient" },
			{"name":"status", "description":"Status of a Recipients's associated user account"},
		],
		"methods": {
			"get": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients",
		"id": "226",
		"regexp": "/\\/id\\/:id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/create",
		"description": "Create a new Recipient record.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "name", "description": "Required. A name for the Recipient." },
			{ "name": "email", "description": "Required. An email address for the Recipient." },
			{ "name": "issueruniqueid", "description": "Optional. A unique id given by the issuer for this recipient. (internal use only)" }
		],
		"returns": [
			{ "name": "recipients", "description": "An array holding the Recipient record added (see route '"+cfg.proxy_path+"/recipients/id/:id' for more details of record structure)" },
			{ "name": "recipientsmissed", "description": "An array holding the Recipient record if not process for some reason." },
			{ "name": "recipientsduplicate", "description": "An array holding the Recipient record if already in the database so not processed." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients/",
		"id": "227",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/createbulk",
		"description": "Create bulk recepients - creates a new login account if one does not already exists for the given login email address. Only administrators will be allowed to create new Recepients",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "recipientdatafile", "description": "Required. The cvs file with the the recipient data to create Recipient records for, (expected on the req.files object)" }
		],
		"returns": [
			{ "name": "recipients", "description": "An array holding the Recipient records added (see route '"+cfg.proxy_path+"/recipients/id/:id' for more details of record structure)" },
			{ "name": "recipientsmissed", "description": "An array holding the Recipient records not process for some reason." },
			{ "name": "recipientsduplicate", "description": "An array holding the Recipient records already in the database so not processed." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients/",
		"id": "228",
		"regexp": "/\\/createbulk(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update an existing Recepient record only if it has not been used to issue a badge",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Recipient record you want to update." },
			{ "name": "name", "description": "Optional. A name for the Recipient." },
			{ "name": "email", "description": "Optional. An email address for the Recipient." },
			{ "name": "uniqueid", "description": "Optional. A unique id given by the issuer for this Recipient. (internal use only)." },
		],
		"returns": [
			{"name":"id", "description": "The record indentifier of the Recipient record" },
			{"name":"timecreated", "description": "Time at which the Recipient record was created" },
			{"name":"name", "description": "Name of the Recipient" },
			{"name":"email", "description": "Email address of the Recipient" },
			{"name":"encodedemail", "description": "Encodedemail email address of the Recipient" },
			{"name":"uniqueid", "description": "Unique Isser identifier for the Recipient" },
			{"name":"status", "description":"Status of a Recipients's associated user account"},
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients/",
		"id": "229",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/createuseraccount",
		"description": "Create a User record entry to allow an Recipient to login to the system.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Recipient record you want to add a login account for." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Recipient record that this login account is for." },
			{ "name": "timecreated", "description": "Time at which the user account was created." },
			{ "name": "name", "description": "The name of the Recipient used on the Recipient login account record." },
			{ "name": "email", "description": "The login email address used on the Recipient login account record." },
			{ "name": "status", "description": "Status of the login account registration process. It will be '0' at this point." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients/",
		"id": "230",
		"regexp": "/\\/createuseraccount(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete an existing Recepient record only if it has not been used to issue a badge",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Recipient you wish to delete." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Recepient record that was deleted" },
			{ "name": "status", "description": "A status of -1 to show that the Recepient record was deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients/",
		"id": "233",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/groups/create",
		"description": "Create a recipient group record with the given name and status",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "name", "description": "Required. The name of the new Recipient group" },
			{ "name": "status", "description": "Required. 0/1 to indicate if the group is active (1) or inactive (0)" }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Recepient group record" },
			{ "name": "timecreated", "description": "Time at which the Recepient group record was created. (in seconds)" },
			{ "name": "name", "description": "Required. The name of the new Recipient group" },
			{ "name": "status", "description": "Required. The status of the new Recipient group. 0/1 to indicate if the group is active (1) or inactive (0)" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients/",
		"id": "234",
		"regexp": "/\\/groups\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/groups/update",
		"description": "Update an existing recipient group record.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Recepient group record" },
			{ "name": "name", "description": "Required. The name of the new Recipient group" },
			{ "name": "status", "description": "Required. 0/1 to indicate if the group is active (1) or inactive (0)" }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Recepient group record" },
			{ "name": "timecreated", "description": "Time at which the Recepient group record was created. (in seconds)" },
			{ "name": "name", "description": "Required. The name of the Recipient group" },
			{ "name": "status", "description": "Required. The status of the Recipient group. 0/1 to indicate if the group is active (1) or inactive (0)" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients/",
		"id": "235",
		"regexp": "/\\/groups\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/groups/delete",
		"description": "Delete an existing Recepient group record.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Recipient group you wish to delete." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Recepient group record that was deleted" },
			{ "name": "status", "description": "A status of -1 to show that the Recepient group record was deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients/",
		"id": "236",
		"regexp": "/\\/group\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/groups/list",
		"description": "Get a list of all Recipient group records for the currently logged in user (issuer).",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" }
		],
		"returns": [
			{ "name": "recipientgroups", "description": "An array of Recipient group records (see route '"+cfg.proxy_path+"/recipients/groups/create' for more details of record structure)" }
		],
		"methods": {
			"get": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients/",
		"id": "237",
		"regexp": "/\\/groups\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/groups/addrecipient",
		"description": "Add a Recipient to a Recipient group",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Recipient group you wish to add a Recipient to." },
			{ "name": "recipientid", "description": "Required. The record identifier of the Recipient you wish to add to the Recipient group." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the recipient group association record" },
			{ "name": "timecreated", "description": "The time the recipient group association record was created" },
			{ "name": "groupid", "description": "The record identifier of the Recipient group" },
			{ "name": "recipientid", "description": "The record identifier of the Recipient" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients/",
		"id": "238",
		"regexp": "/\\/groups\\/addrecipient(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/groups/removerecipient",
		"description": "Remove a Recipient from a Recipient group",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Recipient group you wish to remove a Recipient from." },
			{ "name": "recipientid", "description": "Required. The record identifier of the Recipient you wish to remove from the Recipient group." }
		],
		"returns": [
			{ "name": "groupid", "description": "The record identifier of the recipient group" },
			{ "name": "recipientid", "description": "The record identifier of the Recipient" },
			{ "name": "status", "description": "A status of -1 to show that the recipient to recipient group association record was deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients/",
		"id": "239",
		"regexp": "/\\/groups\\/removerecipient(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/groups/setrecipients",
		"description": "Replace all the Recipients that are in the group with the list of Recipients given. This replaces all previous settings of recipients for this group with just the given list of recipients.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Recipient group you wish to set Recipients for." },
			{ "name": "recipientids", "description": "Required. A comma separate list of Recipient record identifiers so set as the Recipients for the Recipient group." }
		],
		"returns": [
			{ "name": "groupid", "description": "The record identifier of the recipient group" },
			{ "name": "recipientids", "description": "A comma separate list of Recipient record identifiers so set as the Recipients for the Recipient group." },
			{ "name": "status", "description": "A status of 1 to show that the recipients where added to the recipient group" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients/",
		"id": "240",
		"regexp": "/\\/groups\\/setrecipients(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/groups/listrecipients/:id",
		"description": "Get a list of all the Recipients for the Recipient group with the given record identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Recipient group you wish to get Recipients for." },
		],
		"returns": [
			{ "name": "recipients", "description": "An array or Recipients in the group, (see route '"+cfg.proxy_path+"/recipients/id/:id' for more details of record structure)" },
		],
		"methods": {
			"get": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/recipients\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/recipients/",
		"id": "241",
		"regexp": "/\\/groups\\/listrecipients\\/:id(?:\\?.*)?$/",
		"examplesPresent": false
	}
];