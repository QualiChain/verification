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

var maintitle = "Web Service API - Qualifying Badges for Claims";
var routes = [
	{
		"path": "/create",
		"description": "Create a new qualifying badge record",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used."},
			{"name":"badgeid", "description": "Required. The record identifier of the badge the qualifying badge is being associated with." },
			{"name":"title", "description": "Required. The title of the qualifying badge as it will appear in the badge JSON." },
			{"name":"description", "description": "Required. The description of the qualifying badge as it will appear in the badge JSON." },
			{"name":"domain", "description": "Required. The hosted domain of this qualifying badge as it will appear in the badge JSON." },
			{"name":"issuername", "description": "Required. The issuer name for this qualifying badge as it will appear in the badge JSON." },
			{"name":"issuerurl", "description": "Required. The issuer url for this qualifying badge, as it will appear in the badge JSON." },
			{"name":"startdate", "description": "Optional. The date from which this badge is a qualifying badge, in seconds." },
			{"name":"enddate", "description": "Optional. The date up to which this badge is a qualifying badge, in seconds." }
		],
		"returns": [
			{"name":"badgeid", "description": "The record identifier of the badge the qualifying badge is associated with." },
			{"name":"timecreated", "description": "The time the record was created." },
			{"name":"title", "description": "The title of the qualifying badge." },
			{"name":"description", "description": "The description of the qualifying badge." },
			{"name":"domain", "description": "The hosted domain of this qualifying badge." },
			{"name":"issuername", "description": "The issuer name for this qualifying badge." },
			{"name":"issuerurl", "description": "The issuer url for this qualifying badge." },
			{"name":"startdate", "description": "The date from which this badge is a qualifying badge, in seconds." },
			{"name":"enddate", "description": "The date up to which this badge is a qualifying badge, in seconds." },
			{"name":"enabled", "description": "true/false as to whether this qualifying badge is enabled for claiming." },
			{"name":"usedInIssuance", "description": "true or false as to whether this qualifying badge has been used against an issued badge." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super", "admin"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/qualifying\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/qualifying/",
		"id": "301",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update an existing qualifying badge record only if it has not been used on an issued badge",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"qualifyingbadgeid", "description": "Required. The record identifier of the qualifying badge you want to update." },
			{"name":"badgeid", "description": "Required. The record identifier of the badge the qualifying badge is being associated with." },
			{"name":"title", "description": "Optional. The title of the qualifying badge as it will appear in the badge JSON." },
			{"name":"description", "description": "Optional. The description of the qualifying badge as it will appear in the badge JSON." },
			{"name":"domain", "description": "Optional. The hosted domain of this qualifying badge as it will appear in the badge JSON." },
			{"name":"issuername", "description": "Optional. The issuer name for this qualifying badge as it will appear in the badge JSON." },
			{"name":"issuerurl", "description": "Optional. The issuer url for this qualifying badge, as it will appear in the badge JSON." },
			{"name":"startdate", "description": "Optional. The date from which this badge is a qualifying badge, in seconds." },
			{"name":"enddate", "description": "Optional. The date up to which this badge is a qualifying badge, in seconds." }
		],
		"returns": [
			{"name":"id", "description":"Record identifier of the qualifying badge record."},
			{"name":"badgeid", "description": "The record identifier of the badge the qualifying badge is associated with." },
			{"name":"timecreated", "description": "The time the record was created." },
			{"name":"title", "description": "The title of the qualifying badge." },
			{"name":"description", "description": "The description of the qualifying badge." },
			{"name":"domain", "description": "The hosted domain of this qualifying badge." },
			{"name":"issuername", "description": "The issuer name for this qualifying badge." },
			{"name":"issuerurl", "description": "The issuer url for this qualifying badge." },
			{"name":"startdate", "description": "The date from which this badge is a qualifying badge, in seconds." },
			{"name":"enddate", "description": "The date up to which this badge is a qualifying badge, in seconds." },
			{"name":"enabled", "description": "true/false as to whether this qualifying badge is enabled for claiming." },
			{"name":"usedInIssuance", "description": "true or false as to whether this qualifying badge has been used against an issued badge." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super", "admin"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/qualifying\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/qualifying/",
		"id": "302",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete an existing qualifying badge record, only if it has not been used on an issued badge",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "qualifyingbadgeid", "description": "Required. The identifier of the qualifying badge record you wish to delete." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the deleted qualifying badge record" },
			{ "name": "status", "description": "A status of -1 to indicated that the record has been deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super", "admin"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/qualifying\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/qualifying/",
		"id": "303",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/listall/:id",
		"description": "Get a list of qualifying badges for the passed badge id.",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"id", "description":"Required. The identifier of the Badge record you wish to retrieve qualifying badges for."}
		],
		"returns" : [
			{"name":"badges", "description":"An array of qualifying badge records, (see route '" + cfg.proxy_path + "/qualifying/create' for full details of the record structure)"},
		],
		"methods": {
			"get": true
		},
		"permissions": ["super", "admin"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/qualifying\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/qualifying/",
		"id": "304",
		"regexp": "/\\/listall\\/:id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/check",
		"description": "Check if the data given matches a qualifying badge.",
		"params": [
			{"name":"title", "description": "Required. The title of the qualifying badge to check against." },
			{"name":"description", "description": "Required. The description of the qualifying badge to check against." },
			{"name":"issuedon", "description": "Required. The date the qualifying date was issued." },
			{"name":"issuername", "description": "Required. The issuer name for the qualifying badge to check again." },
			{"name":"issuerurl", "description": "Required. The issuer url for the qualifying badge to check against." },
			{"name":"badgeurl", "description": "Required. The url for the hosted qualifying badge data." }
		],
		"returns": [
			{"name":"id", "description":"Record identifier of the badge record."},
			{"name":"title", "description": "The title of the qualifying badge." },
			{"name":"description", "description": "The description of the qualifying badge." },
			{"name":"image", "description": "The image url of the qualifying badge." },
			{"name":"issuername", "description": "The issuer name of the qualifying badge." },
			{"name":"issuerurl", "description": "The issuer url of the qualifying badge." },
			{"name":"issuerimageurl", "description": "The image url of the issuer for the qualifying badge" },
			{"name":"qualifies", "description": "true or false as to weather the badge given is a qualifying badge that can be claimed against." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["everyone"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/qualifying\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/qualifying/",
		"id": "305",
		"regexp": "/\\/check(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/enableupdate",
		"description": "Enable or disable a qualifying badge as claimable.",
		"params": [
			{"name":"token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{"name":"qualifyingbadgeid", "description": "Required. The identifier of the qualifying badge record you wish to enable or disable as claimable." },
			{"name":"enabled", "description": "Required. true or false as to whether to enable or disable a qualifying badge as claimable" }
		],
		"returns": [
			{"name":"qualifyingbadgeid", "description": "The identifier of the qualifying badge record you wish to enable or disable as claimable." },
			{"name":"enabled", "description": "true or false as to whether to enable or disable a qualifying badge as claimable" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super", "admin"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/qualifying\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/qualifying/",
		"id": "306",
		"regexp": "/\\/enableupdate(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/checkusermatch",
		"description": "Check to see if the recipient record and user record exist for the currently logged in user, matching the identity details passed and that the recipient has been issued the badge with the passed id.",
		"params": [
			{"name":"token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{"name":"identity", "description": "Required. The identity property being checked." },
			{"name":"salt", "description": "Required. The encryption salt for encrypting the identity being checked." },
			{"name":"type", "description": "Required. The encryption salt for encrypting the identity being checked." },
			{"name":"badgeid", "description": "Required. The record identifier of the badge claimed." },
		],
		"returns": [
			{"name":"signedon", "description": "true or false as to whether the recipient is logged in." },
			{"name":"identityok", "description": "true or false as to whether the identity passed is OK." },
			{"name":"accountexists", "description": "true or false as to whether the user account exists" },
			{"name":"recipientexists", "description": "true or false as to whether the recipient record exists" },
			{"name":"badgeissued", "description": "true or false as to whether the recipient has been issued the badge with the given id" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["everyone"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/qualifying\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/qualifying/",
		"id": "307",
		"regexp": "/\\/checkusermatch(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/checkuseremailmatch",
		"description": "Check to see if the given identity for the badge being claimed matches the given email address.",
		"params": [
			{"name":"token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{"name":"identity", "description": "Required. The identity property being checked." },
			{"name":"salt", "description": "Required. The encryption salt for encrypting the identity being checked." },
			{"name":"type", "description": "Required. The encryption salt for encrypting the identity being checked." },
			{"name":"badgeid", "description": "Required. The record identifier of the badge claimed." },
			{"name":"email", "description": "Required. The email address to check against." },
		],
		"returns": [
			{"name":"signedon", "description": "true or false as to whether the recipient is logged in." },
			{"name":"identityok", "description": "true or false as to whether the identity passed is OK." },
			{"name":"accountexists", "description": "true or false as to whether the user account exists" },
			{"name":"recipientexists", "description": "true or false as to whether the recipient record exists" },
			{"name":"badgeissued", "description": "true or false as to whether the recipient has been issued the badge with the given id" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["everyone"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/qualifying\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/qualifying/",
		"id": "308",
		"regexp": "/\\/checkuseremailmatch(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/loadremotedata",
		"description": "Load data from a remote url of a qualifying badge. These urls are whitelisted against qualifying badge urls known to the system.",
		"params": [
			{"name":"remoteurl", "description": "Required. The qualifying badge url of the remote data to load." },
		],
		"returns": [
			{"name":"**remote data JSON**", "description": "The remote JSON data of a qualifying Open Badge." },
		],
		"methods": {
			"post": true
		},
		"permissions": ["everyone"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/qualifying\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/qualifying/",
		"id": "309",
		"regexp": "/\\/loadremotedata(?:\\?.*)?$/",
		"examplesPresent": false
	}
];
