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

var maintitle = "Web Service API - Organizations";
var routes = [
	{
		"path": "/id/:id",
		"description": "Get an organization by it's record identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The identifier of the Organization record you wish to retrieve." }
		],
		"returns": [
			{ "name": "id", "description": "Record identifier of the organization record" },
			{ "name": "timecreated", "description": "Time at which the Organization record was created" },
			{ "name": "uniqueid", "description": "Unique hash identification number used in JSONLD" },
			{ "name": "name", "description": "Name of the Organization" },
			{ "name": "email", "description": "Email of the Organization" },
			{ "name": "pobox", "description": "The post office box number for PO box addresses, if applicable for the Organization" },
			{ "name": "streetaddress", "description": "The street address of the Organization." },
			{ "name": "locality", "description": "The town or city of the Organization's address" },
			{ "name": "region", "description": "The county or region of the Organization's address" },
			{ "name": "postcode", "description": "Postal Code of the organization's address" },
			{ "name": "country", "description": "Country of the organization's address" },
			{ "name": "usedInIssuance", "description": "true/false indicating if this organization has been referenced in an issued Badge." }
		],
		"methods": {
			"get": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/organizations\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/organizations/",
		"id": "202",
		"regexp": "/\\/id/:id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/list",
		"description": "Get a list of all organization records. Only administrators will be allowed to retrieve organization records.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" }
		],
		"returns": [
			{ "name": "organizations", "description": "An array of Organization records (see route '" + cfg.proxy_path + "/organizations/id:id' for full details of the record structure)" }
		],
		"methods": {
			"get": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/organizations\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/organizations/",
		"id": "203",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/create",
		"description": "Create a new organization",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "name", "description": "Required. Please include a name for the organization" },
			{ "name": "email", "description": "Required. Please include a valid email address for the organization" },
			{ "name": "pobox", "description": "Optional. The post office box number for PO box addresses, if applicable for the Organization" },
			{ "name": "streetaddress", "description": "Optional. The street address of the Organization." },
			{ "name": "locality", "description": "Optional. The town or city of the Organization's address" },
			{ "name": "region", "description": "Optional. The county or region of the Organization's address" },
			{ "name": "postcode", "description": "Optional. Postal Code of the organization's address" },
			{ "name": "country", "description": "Optional. Country of the organization's address" }
		],
		"returns": [
			{ "name": "id", "description": "Record identifier of the organization record" },
			{ "name": "timecreated", "description": "Time at which the Organization record was created" },
			{ "name": "uniqueid", "description": "Unique hash identification number used in JSONLD" },
			{ "name": "name", "description": "Name of the Organization" },
			{ "name": "email", "description": "Email of the Organization" },
			{ "name": "pobox", "description": "The post office box number for PO box addresses, if applicable for the Organization" },
			{ "name": "streetaddress", "description": "The street address of the Organization." },
			{ "name": "locality", "description": "The town or city of the Organization's address" },
			{ "name": "region", "description": "The county or region of the Organization's address" },
			{ "name": "postcode", "description": "Postal Code of the organization's address" },
			{ "name": "country", "description": "Country of the organization's address" },
			{ "name": "usedInIssuance", "description": "true/false indicating if this organization has been referenced in an issued Badge.. It will currently be 'false'." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/organizations\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/organizations/",
		"id": "204",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update an existing organization record",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. You must include an id to update an organization" },
			{ "name": "name", "description": "Required. Please include a name for the organization" },
			{ "name": "email", "description": "Required. Please include a valid email address for the organization" },
			{ "name": "pobox", "description": "Optional. The post office box number for PO box addresses, if applicable for the Organization" },
			{ "name": "streetaddress", "description": "Optional. The street address of the Organization." },
			{ "name": "locality", "description": "Optional. The town or city of the Organization's address" },
			{ "name": "region", "description": "Optional. The county or region of the Organization's address" },
			{ "name": "postcode", "description": "Optional. Postal Code of the organization's address" },
			{ "name": "country", "description": "Optional. Country of the organization's address" }
		],
		"returns": [
			{ "name": "id", "description": "Record identifier of the organization record" },
			{ "name": "timecreated", "description": "Time at which the Organization record was created" },
			{ "name": "uniqueid", "description": "Unique hash identification number used in JSONLD" },
			{ "name": "name", "description": "Name of the Organization" },
			{ "name": "email", "description": "Email of the Organization" },
			{ "name": "pobox", "description": "The post office box number for PO box addresses, if applicable for the Organization" },
			{ "name": "streetaddress", "description": "The street address of the Organization." },
			{ "name": "locality", "description": "Locality of the organization" },
			{ "name": "region", "description": "The county or region of the Organization's address" },
			{ "name": "postcode", "description": "Postal Code of the organization's address" },
			{ "name": "country", "description": "Country of the organization's address" },
			{ "name": "usedInIssuance", "description": "true/false indicating if this organization has been referenced in an issued Badge. It will currently be 'false'." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/organizations\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/organizations/",
		"id": "205",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete an existing organization",
		"params": [
			{ "name": "token", "description": "Required. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. You must include the record identifier of the Organization you want to delete" }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Organization record that was deleted" },
			{ "name": "status", "description": "A status of -1 to show that the Organization record was deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["admin", "super", "issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/organizations\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/organizations/",
		"id": "206",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	},];
