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

var maintitle = "Web Service API - Assertions";
var routes = [
	{
		"path": "/",
		"description": "Draws the Assertion page",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "01",
		"regexp": "/\\/(?:\\?.*)?$/",
		"examplesPresent": false
	},

	{
		"path": "/docs",
		"description": "Draws the assertion documentation page",
		"params": [],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "02",
		"regexp": "/\\/docs(?:\\?.*)?$/",
		"examplesPresent": false
	},

	{
		"path": "/download/:id",
		"description": "Downloads the badge assertion based on the badge issuance id",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"id", "description":"Issuance ID of the Badge"},
		],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "03",
		"regexp": "/\\/download/:id(?:\\?.*)?$/",
		"examplesPresent": false
	},

	{
		"path": "/portfolio",
		"description": "Downloads the badge assertion based on the badge issuance id",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"id", "description":"Issuance ID of the Badge"},
		],
		"returns" : [
			{"name":"id", "description":"ID of the Assertion"},
			{"name":"timecreated", "description":"Time at which the Assertion was created"},
			{"name":"uniqueid", "description":"Unique identification number"},
			{"name":"badgeid", "description":"Badge identification number"},
			{"name":"recipientid", "description":"Identification number of the Recipient"},
			{"name":"issuedon", "description":"Date in which the Badge is issued"},
			{"name":"tokenmetadataurl", "description":"URL of the Token Metadata"},
			{"name":"blockchainaddress", "description":"Address of the Blockchain"},
			{"name":"transaction", "description":"Transaction data"},
			{"name":"tokenid", "description":"Identification Number of the token"},
			{"name":"revokedreason", "description":"Reason for revocation"},
			{"name":"status", "description":"Status of the Assertion"},
		],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "04",
		"regexp": "/\\/portfolio(?:\\?.*)?$/",
		"examplesPresent": false
	},

	{
		"path": "/view/:id",
		"description": "Draws the Manage Badge's page - if logged in and user has permissions",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "05",
		"regexp": "/\\/view/:id(?:\\?.*)?$/",
		"examplesPresent": false
	},

	{
		"path": "/validate",
		"description": "Get a Badge by it's record identifier. Only administrators, issuers and endorsers will be allowed to retrieve Badge records.",
		"params": [{"name":"badgeid", "description":"Requires the identifier of the Badge record you wish to retrieve"},{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}],
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
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "06",
		"regexp": "/\\/validate(?:\\?.*)?$/",
		"examplesPresent": false
	},

	{
		"path": "/issue",
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
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "07",
		"regexp": "/\\/issue(?:\\?.*)?$/",
		"examplesPresent": false
	},

	{
		"path": "/revoke",
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
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "08",
		"regexp": "/\\/revoke(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/endorse",
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
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "09",
		"regexp": "/\\/endorse(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/create",
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
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "110",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
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
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "111",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},

	{
		"path": "/delete",
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
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "112",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},

	{
		"path": "/id/:id",
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
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "113",
		"regexp": "/\\/id/:id(?:\\?.*)?$/",
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
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "114",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/addendorser",
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
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "115",
		"regexp": "/\\/addendorser(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/removeendorser",
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
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "116",
		"regexp": "/\\//removeendorser(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/listendorsers/:id",
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
			"post": true
		},
		"prefixRegexp": "/^\\/badges\\/assertions\\/?(?=\\/|$)/i",
		"prefix": "/badges/assertions",
		"id": "117",
		"regexp": "/\\/listendorsers/:id(?:\\?.*)?$/",
		"examplesPresent": false
	},

];



