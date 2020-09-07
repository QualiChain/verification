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

var maintitle = "Web Service API - Assertions";
var routes = [
	{
		"path": "/download/:id",
		"description": "Get a Badge issuance (Assertion) Open Badge file by it's record identifier",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"id", "description":"Required. The identifier of the Badge issuance (Assertion) record you wish to retrieve the file for"}
		],
		"returns" : [{ "name": "file", "description":"('Content-type','image/png') of the Badge issuance (Assertion) requested or a JSON error object" }],
		"methods": {
			"get": true
		},
		"permissions": ["recipient"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "34",
		"regexp": "/\\/download/:id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/issue",
		"description": "Issue a pending Badge issuance (Assertion). If successful, the resultant badge file will be emailed to the recipient.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The identifier of the Badge issuance (Assertion) record you wish to issue" }
		],
		"returns" : [
			{ "name": "id", "description":"The record identifier of the Badge issuance (Assertion) record" },
			{ "name": "timecreated", "description":"Time at which the Badge issuance (Assertion) record was created" },
			{ "name": "uniqueid", "description": "Unique hash identification number for the Badge issuance (Assertion) record" },
			{ "name": "badgeid", "description":"Record identifier of the Badge that is being issued" },
			{ "name": "recipientid", "description": "Record identifier of the Recipient reciving the badge" },
			{ "name": "issuedon", "description": "Date the Badge was issued to the recipient" },
			{ "name": "tokenmetadataurl", "description": "URL for the token meta data for the Badge issuance" },
			{ "name": "blockchainaddress", "description": "Blockchain address for the Badge token contract used to validate the Badge issuance" },
			{ "name": "transaction", "description": "Blockchain transaction number of the transaction that put the associated token on the blockchain" },
			{ "name": "tokenid", "description": "Blockcahin token identifier" },
			{ "name": "revokedreason", "description": "Reason for revocation of the Badge issuance" },
			{ "name": "status", "description": "Status of the Badge issuance (Assertion) - 'pending/issued/revoked'. In this case, 'issued'" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super","issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "38",
		"regexp": "/\\/issue(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/checkissuability",
		"description": "Check if the badge with the given badge id can be issued to the recipient with the given recipient id.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "badgeid", "description": "Required. The identifier of the Badge record you wish to check against" },
			{ "name": "recipientid", "description": "Required. The identifier of the Recipient record you wish to check against" }
		],
		"returns": [
			{ "name": "badgeid", "description": "The identifier of the Badge record checked" },
			{ "name": "recipientid", "description": "The identifier of the Recipient record checked" },
			{ "name": "canissuebadge", "description": "true/false as to whether the the stated badge can be issued to the stated recipient" },
			{ "name": "message", "description": "If 'canissuebadge' property is false, a message explaining why the stated badge could not be issued to the stated recipient" }
		],
		"methods": {
			"get": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/assertions",
		"id": "39",
		"regexp": "/\\/checkissuability(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/autocheckissuability",
		"description": "Check if the badge with the given badge id can be issued to the recipient with the given recipient name and email address",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "badgeid", "description": "Required. The identifier of the Badge record you wish to check against" },
			{ "name": "recipientname", "description": "Required. The name of the recipient you wish to check against. Must match an existing name in the recipient table" },
			{ "name": "recipientemail", "description": "Required. The email address of the recipient you wish to check against. Must match an existing email that goes with the given name in the recipient table" }
		],
		"returns": [
			{ "name": "badgeid", "description": "The identifier of the Badge record checked" },
			{ "name": "recipientname", "description": "The name of the recipient checked" },
			{ "name": "recipientemail", "description": "The email address of the recipient checked" },
			{ "name": "canissuebadge", "description": "true/false as to whether the the stated badge can be issued to the stated recipient" },
			{ "name": "message", "description": "If 'canissuebadge' property is false, a message explaining why the stated badge could not be issued to the stated recipient" }
		],
		"methods": {
			"get": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/assertions",
		"id": "40",
		"regexp": "/\\/autocheckissuability(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/autoissue",
		"description": "Issue a badge to a recipient with the given name and email address in one process without adding evidence. The recipient must already exist in the database against the current user/issuer. If successful, the recipient will be emailed their badge.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "badgeid", "description": "Required. The identifier of the Badge record you wish to issue." },
			{ "name": "recipientname", "description": "Required. The name of the recipient you wish to issue to. Must match an existing name in the recipient table." },
			{ "name": "recipientemail", "description": "Required. The email address of the recipient you wish to issue to. Must match an existing email that goes with the given name in the recipient table." }
		],
		"returns": [
			{ "name": "id", "description":"The record identifier of the Badge issuance (Assertion) record" },
			{ "name": "timecreated", "description":"Time at which the Badge issuance (Assertion) record was created" },
			{ "name": "uniqueid", "description": "Unique hash identification number for the Badge issuance (Assertion) record" },
			{ "name": "badgeid", "description":"Record identifier of the Badge that is being issued" },
			{ "name": "recipientid", "description": "Record identifier of the Recipient reciving the badge" },
			{ "name": "issuedon", "description": "Date the Badge was issued to the recipient" },
			{ "name": "tokenmetadataurl", "description": "URL for the token meta data for the Badge issuance" },
			{ "name": "blockchainaddress", "description": "Blockchain address for the Badge token contract used to validate the Badge issuance" },
			{ "name": "transaction", "description": "Blockchain transaction number of the transaction that put the associated token on the blockchain" },
			{ "name": "tokenid", "description": "Blockcahin token identifier" },
			{ "name": "revokedreason", "description": "Reason for revocation of the Badge issuance" },
			{ "name": "status", "description": "Status of the Badge issuance (Assertion) - 'pending/issued/revoked'. In this case, 'issued'" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/assertions",
		"id": "41",
		"regexp": "/\\/autoissue(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/revoke",
		"description": "Revoke a Badge issuance.",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{ "name": "id", "description":"Required. Must include the badge issuance id for the badge issuance you want to revoke"},
			{ "name": "revokedreason", "description":"Optional. Badge issuance revocation reason"}
		],
		"returns": [
			{ "name": "id", "description":"The record identifier of the Badge issuance (Assertion) record" },
			{ "name": "timecreated", "description":"Time at which the Badge issuance (Assertion) record was created" },
			{ "name": "uniqueid", "description": "Unique hash identification number for the Badge issuance (Assertion) record" },
			{ "name": "badgeid", "description":"Record identifier of the Badge that is being issued" },
			{ "name": "recipientid", "description": "Record identifier of the Recipient reciving the badge" },
			{ "name": "issuedon", "description": "Date the Badge was issued to the recipient" },
			{ "name": "tokenmetadataurl", "description": "URL for the token meta data for the Badge issuance" },
			{ "name": "blockchainaddress", "description": "Blockchain address for the Badge token contract used to validate the Badge issuance" },
			{ "name": "transaction", "description": "Blockchain transaction number of the transaction that put the associated token on the blockchain" },
			{ "name": "tokenid", "description": "Blockcahin token identifier" },
			{ "name": "revokedreason", "description": "A textual reason for the revocation. For internal administration use only." },
			{ "name": "status", "description": "Status of the Badge issuance (Assertion) - 'pending/issued/revoked'. In this case, 'issued'" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "42",
		"regexp": "/\\/revoke(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/updaterevocationreason",
		"description": "Updates the revocation reason for a previously revoked badge.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. Must include the badge issuance id for the badge issuance you want to update the revocation reason for" },
			{ "name": "revokedreason", "description": "Required. A textual reason for the revocation. For internal administration use only." }
		],
		"returns": [
			{ "name": "id", "description":"The record identifier of the Badge issuance (Assertion) record" },
			{ "name": "timecreated", "description":"Time at which the Badge issuance (Assertion) record was created" },
			{ "name": "uniqueid", "description": "Unique hash identification number for the Badge issuance (Assertion) record" },
			{ "name": "badgeid", "description":"Record identifier of the Badge that is being issued" },
			{ "name": "recipientid", "description": "Record identifier of the Recipient reciving the badge" },
			{ "name": "issuedon", "description": "Date the Badge was issued to the recipient" },
			{ "name": "tokenmetadataurl", "description": "URL for the token meta data for the Badge issuance" },
			{ "name": "blockchainaddress", "description": "Blockchain address for the Badge token contract used to validate the Badge issuance" },
			{ "name": "transaction", "description": "Blockchain transaction number of the transaction that put the associated token on the blockchain" },
			{ "name": "tokenid", "description": "Blockcahin token identifier" },
			{ "name": "revokedreason", "description": "Reason for revocation of the Badge issuance" },
			{ "name": "status", "description": "Status of the Badge issuance (Assertion) - 'pending/issued/revoked'. In this case, 'issued'" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/assertions",
		"id": "43",
		"regexp": "/\\/updaterevocationreason(?:\\?.*)?$/",
		"examplesPresent": false
	},
/*	{
		"path": "/endorse",
		"description": "Endorse a Badge issuance",
		"params": [
			{ "name": "id", "description":"Required. Must include the Badge issuance id for the badge you want to endorse"},
			{ "name": "claims", "description":"Required. Must include at least one claim for this endorsement"}
		],
		"returns" : [],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "44",
		"regexp": "/\\/endorse(?:\\?.*)?$/",
		"examplesPresent": false
	},
*/
	{
		"path": "/create",
		"description": "Create a pending Badge issuance",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "badgeid", "description": "Required. The Badge id for the badge you want to update create an issuance for." },
			{ "name": "recipientid", "description": "Required. The Recipient id for the Recipient you want to issue the badge to." }
		],
		"returns": [
			{ "name": "id", "description":"The record identifier of the Badge issuance (Assertion) record" },
			{ "name": "timecreated", "description":"Time at which the Badge issuance (Assertion) record was created" },
			{ "name": "uniqueid", "description": "Unique hash identification number for the Badge issuance (Assertion) record" },
			{ "name": "badgeid", "description":"Record identifier of the Badge that is being issued" },
			{ "name": "recipientid", "description": "Record identifier of the Recipient reciving the badge" },
			{ "name": "issuedon", "description": "Date the Badge was issued to the recipient" },
			{ "name": "tokenmetadataurl", "description": "URL for the token meta data for the Badge issuance" },
			{ "name": "blockchainaddress", "description": "Blockchain address for the Badge token contract used to validate the Badge issuance" },
			{ "name": "transaction", "description": "Blockchain transaction number of the transaction that put the associated token on the blockchain" },
			{ "name": "tokenid", "description": "Blockcahin token identifier" },
			{ "name": "revokedreason", "description": "Reason for revocation of the Badge issuance" },
			{ "name": "status", "description": "Status of the Badge issuance (Assertion) - 'pending/issued/revoked'. In this case, 'issued'" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "45",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update a pending Badge issuance",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The identifier of the Badge issuance (Assertion) record you wish to update." },
			{ "name": "badgeid", "description": "Required. The Badge id for the badge you want to update create an issuance for." },
			{ "name": "recipientid", "description": "Required. The Recipient id for the Recipient you want to issue the badge to." }
		],
		"returns": [
			{ "name": "id", "description":"The record identifier of the Badge issuance (Assertion) record" },
			{ "name": "timecreated", "description":"Time at which the Badge issuance (Assertion) record was created" },
			{ "name": "uniqueid", "description": "Unique hash identification number for the Badge issuance (Assertion) record" },
			{ "name": "badgeid", "description":"Record identifier of the Badge that is being issued" },
			{ "name": "recipientid", "description": "Record identifier of the Recipient reciving the badge" },
			{ "name": "issuedon", "description": "Date the Badge was issued to the recipient" },
			{ "name": "tokenmetadataurl", "description": "URL for the token meta data for the Badge issuance" },
			{ "name": "blockchainaddress", "description": "Blockchain address for the Badge token contract used to validate the Badge issuance" },
			{ "name": "transaction", "description": "Blockchain transaction number of the transaction that put the associated token on the blockchain" },
			{ "name": "tokenid", "description": "Blockcahin token identifier" },
			{ "name": "revokedreason", "description": "Reason for revocation of the Badge issuance" },
			{ "name": "status", "description": "Status of the Badge issuance (Assertion) - 'pending/issued/revoked'. In this case, 'issued'" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "46",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete a pending Badge issuance",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The identifier of the Badge issuance (Assertion) record you wish to delete." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Badge issuance (Assertion) record" },
			{ "name": "status", "description": "A status of -1 to indicate successful deletion" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "47",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/id/:id",
		"description": "Get an Badge issuance (Assertion) record by it's record identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The identifier of the Badge issuance (Assertion) record you wish to retrieve." }
		],
		"returns": [
			{ "name": "id", "description":"The record identifier of the Badge issuance (Assertion) record" },
			{ "name": "timecreated", "description":"Time at which the Badge issuance (Assertion) record was created" },
			{ "name": "uniqueid", "description": "Unique hash identification number for the Badge issuance (Assertion) record" },
			{ "name": "badgeid", "description":"Record identifier of the Badge that is being issued" },
			{ "name": "recipientid", "description": "Record identifier of the Recipient reciving the badge" },
			{ "name": "issuedon", "description": "Date the Badge was issued to the recipient" },
			{ "name": "tokenmetadataurl", "description": "URL for the token meta data for the Badge issuance" },
			{ "name": "blockchainaddress", "description": "Blockchain address for the Badge token contract used to validate the Badge issuance" },
			{ "name": "transaction", "description": "Blockchain transaction number of the transaction that put the associated token on the blockchain" },
			{ "name": "tokenid", "description": "Blockcahin token identifier" },
			{ "name": "revokedreason", "description": "Reason for revocation of the Badge issuance" },
			{ "name": "status", "description": "Status of the Badge issuance (Assertion) - 'pending/issued/revoked'. In this case, 'issued'" }
		],
		"methods": {
			"get": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "48",
		"regexp": "/\\/id/:id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/list",
		"description": "Get an list of Badge issuance (Assertion) record for the currently logged in user.",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns": [
			{ "name": "items", "description": "An array of Badge issuance records" },
		],
		"methods": {
			"get": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "49",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/addendorser",
		"description": "Create an pending endorsement for a pending Badge issuance",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required.  The identifier of the Badge issuance (Assertion) record you wish to add an endorsment to." },
			{ "name": "endorserid", "description": "Required. The Endorser id for the Endorser you want to endorse this Badge issuance." }
		],
		"returns" : [
			{ "name": "id", "description": "The record identifier of the new endorsement issuance record" },
			{ "name": "timecreated", "description": "Time at which the record was created" },
			{ "name": "badgeissueid", "description": "The record identifier of the Badge issuance" },
			{ "name": "endorserid", "description": "The record idenrifier of the Endorser" },
			{ "name": "status", "description": "(pending/issued/revoked)" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "50",
		"regexp": "/\\/addendorser(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/removeendorser",
		"description": "Remove a pending endorsement record",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The identifier of the Badge issuance (Assertion) record you wish to remove an endorsement from" },
			{ "name": "endorserid", "description": "Required. The Endorser id for the Endorser you want remove endorsement for." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier for the endorsement" },
			{ "name": "status", "description": "-1 to indicate the record was deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "51",
		"regexp": "/\\//removeendorser(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/listendorsers/:id",
		"description": "List all pending endorsement records for the Badge issuance with the given record identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Badge issuance (Assertion) record you wish to list endorsement for" }
		],
		"returns": [
			{ "name": "items", "description": "An array of endorsement records" },
		],
		"permissions": ["issuer"],
		"methods": {
			"get": true
		},
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "52",
		"regexp": "/\\/listendorsers/:id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/qualifyingclaimassertion",
		"description": "Issue a claimed Badge issuance (Assertion). If successful, the resultant badge file will be emailed to the recipient.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "claimsassertion", "description": "Required. The url of the qualifying badge you wish to claim." }
		],
		"returns": [
			{ "name": "id", "description":"The record identifier of the Badge issuance (Assertion) record" },
			{ "name": "timecreated", "description":"Time at which the Badge issuance (Assertion) record was created" },
			{ "name": "uniqueid", "description": "Unique hash identification number for the Badge issuance (Assertion) record" },
			{ "name": "badgeid", "description":"Record identifier of the Badge that is being issued" },
			{ "name": "recipientid", "description": "Record identifier of the Recipient reciving the badge" },
			{ "name": "issuedon", "description": "Date the Badge was issued to the recipient" },
			{ "name": "tokenmetadataurl", "description": "URL for the token meta data for the Badge issuance" },
			{ "name": "blockchainaddress", "description": "Blockchain address for the Badge token contract used to validate the Badge issuance" },
			{ "name": "transaction", "description": "Blockchain transaction number of the transaction that put the associated token on the blockchain" },
			{ "name": "tokenid", "description": "Blockcahin token identifier" },
			{ "name": "revokedreason", "description": "Reason for revocation of the Badge issuance" },
			{ "name": "status", "description": "Status of the Badge issuance (Assertion) - 'pending/issued/revoked'. In this case, 'issued'" }
		],
		"permissions": ["issuer"],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "53",
		"regexp": "/\\/qualifyingclaimassertion(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/listclaimed",
		"description": "Get an list of Calimed Badge issuance (Assertion) record for the currently logged in user.",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns": [
			{ "name": "items", "description": "An array of Claimed Badge issuance records" },
		],
		"methods": {
			"get": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "54",
		"regexp": "/\\/listclaimed(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/portfolio",
		"description": "Get the Badge issuances (Assertions) for the currently logged in recipient.",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns": [
			{ "name": "items", "description": "An array of Badge issuance records" },
		],
		"methods": {
			"get": true
		},
		"permissions": ["recipient"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/assertions\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/assertions",
		"id": "55",
		"regexp": "/\\/porfolio(?:\\?.*)?$/",
		"examplesPresent": false
	}
];
