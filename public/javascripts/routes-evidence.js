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

var maintitle = "Web Service API - Evidence";
var routes = [
	{
		"path": "/list",
		"description": "Get a list of all Evidence records for the Badge issuance (Assertion) record associated with the given identifier.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. Badge issuance record identifier to get associated Evidence for." }
		],
		"returns": [
			{ "name": "id", "description": "Record identifier of the Evidence record" },
			{ "name": "timecreated", "description": "Time at which the Evidence record was created" },
			{ "name": "url", "description": "URL pointing to the Evidence file or page being presented as Evidence for a Badge Issuance (Assertion)." },
			{ "name": "name", "description": "Descriptive title of the evidence" },
			{ "name": "description", "description": "Longer description of the Evidence" },
			{ "name": "narrative", "description": "Narrative that describes the evidence and process of achievement that led to a Badge Issuance (Assertion)." },
			{ "name": "genre", "description": "Genre of the evidence" },
			{ "name": "audience", "description": "Intended audience of the evidence" },
			{ "name": "badgeissuedid", "description": "The Badge issuance (Assertion) record identitifer that this evidence is associated with." },
			{ "name": "issued", "description": "true/false as to whether this Evidence has been used in an issued badge Assertion." }
		],
		"methods": {
			"get": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/evidence",
		"id": "162",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/create",
		"description": "Create a new Evidence record.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "badgeissuedid", "description": "Required. The Badge issuance (Assertion) record identitifer that this evidence is associated with." },
			{ "name": "url", "description": "Required. A url pointing to the Evidence file or page being presented as Evidence for a Badge Issuance (Assertion)." },
			{ "name": "name", "description": "Required. A descriptive title for the evidence." },
			{ "name": "description", "description": "Optional. A longer description of the evidence." },
			{ "name": "narrative", "description": "Optional. A narrative that describes the evidence and process of achievement that led to a Badge Issuance (Assertion)." },
			{ "name": "genre", "description": "Optional. What type of evidence is it, e.g. Poerty, Prose, Film, Photography, ePortfolio etc." },
			{ "name": "audience", "description": "Optional. Who is the audience for this evidence intended to be" }
		],
		"returns": [
			{ "name": "id", "description": "Record identifier of the Evidence record" },
			{ "name": "timecreated", "description": "Time at which the Evidence record was created" },
			{ "name": "url", "description": "URL pointing to the Evidence file or page being presented as Evidence for a Badge Issuance (Assertion)." },
			{ "name": "name", "description": "Descriptive title of the evidence" },
			{ "name": "description", "description": "Longer description of the Evidence" },
			{ "name": "narrative", "description": "Narrative that describes the evidence and process of achievement that led to a Badge Issuance (Assertion)." },
			{ "name": "genre", "description": "Genre of the evidence" },
			{ "name": "audience", "description": "Intended audience of the evidence" },
			{ "name": "badgeissuedid", "description": "The Badge issuance (Assertion) record identitifer that this evidence is associated with." },
			{ "name": "issued", "description": "true/false as to whether this Evidence has been used in an issued badge Assertion. Will be false here" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/evidence/",
		"id": "163",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update an existing Evidence record only if it has not been used to issue a badge",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Evidence record you want to update." },
			{ "name": "url", "description": "Optional. A url pointing to the Evidence file or page being presented as Evidence for a Badge Issuance (Assertion)." },
			{ "name": "name", "description": "Optional. A descriptive title for the evidence." },
			{ "name": "description", "description": "Optional. A longer description of the evidence." },
			{ "name": "narrative", "description": "Optional. A narrative that describes the evidence and process of achievement that led to a Badge Issuance (Assertion)." },
			{ "name": "genre", "description": "Optional. What type of evidence is it, e.g. Poerty, Prose, Film, Photography, ePortfolio etc." },
			{ "name": "audience", "description": "Optional. Who is the audience for this evidence intended to be" }
		],
		"returns": [
			{ "name": "id", "description": "Record identifier of the Evidence record" },
			{ "name": "timecreated", "description": "Time at which the Evidence record was created" },
			{ "name": "url", "description": "URL pointing to the Evidence file or page being presented as Evidence for a Badge Issuance (Assertion)." },
			{ "name": "name", "description": "Descriptive title of the evidence" },
			{ "name": "description", "description": "Longer description of the Evidence" },
			{ "name": "narrative", "description": "Narrative that describes the evidence and process of achievement that led to a Badge Issuance (Assertion)." },
			{ "name": "genre", "description": "Genre of the evidence" },
			{ "name": "audience", "description": "Intended audience of the evidence" },
			{ "name": "badgeissuedid", "description": "The Badge issuance (Assertion) record identitifer that this evidence is associated with." },
			{ "name": "issued", "description": "true/false as to whether this Evidence has been used in an issued badge Assertion. Will be false here" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/evidence/",
		"id": "164",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete an existing Evidence record.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Evidence you wish to delete." }
		],
		"returns": [
			{ "name": "id", "description": "The record identifier of the Evidence that was deleted" },
			{ "name": "status", "description": "set to -1 to indicate that the record was deleted." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["issuer"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/endorsers\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/evidence/",
		"id": "165",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	}
];
