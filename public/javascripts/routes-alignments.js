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

var maintitle = "Web Service API - Alignments";
var routes = [
	{
		"path": "/id/:id",
		"description": "Get an Alignment by it's record identifier.",
		"params": [
			{"name":"id", "description":"Requires the identifier of the Alignment record you wish to retrieve."},
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [
			{"name":"id", "description":"Record identifier of the Alignment"},
			{"name":"timecreated", "description":"Time at which the Alignment record was created"},
			{"name":"uniqueid", "description":"Unique Alignment hash number used in the uri for the JSONLD version of the alignment data"},
			{"name":"targetid", "description": "URL linking to the official description of the alignment target, for example an individual standard within an educational framework."},
			{"name":"targetname", "description":"Name of the alignment."},
			{"name":"targetdescription", "description":"Short description of the alignment target."},
			{"name":"targetcode", "description":"If applicable, a locally unique string identifier that identifies the alignment target within its framework and/or targetUrl."},
			{"name":"targetframework", "description":"The framework to which the resource being described is aligned."}
		],
		"methods": {
			"get": true
		},
		"permissions": ["super", "admin", "issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/alignments\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/alignments/",
		"id": "23",
		"regexp": "/\\/id(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/list",
		"description": "Get a list of all alignment records for the currently logged in user",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"}
		],
		"returns" : [
			{"name":"id", "description":"Record identifier of the Alignment"},
			{"name":"timecreated", "description":"Time at which the Alignment record was created"},
			{"name":"uniqueid", "description":"Unique Alignment hash number used in the uri for the JSONLD version of the alignment data"},
			{"name":"targetid", "description": "URL linking to the official description of the alignment, for example an individual standard within an educational framework."},
			{"name":"targetname", "description":"Name of the alignment."},
			{"name":"targetdescription", "description":"Short description of the alignment."},
			{"name":"targetcode", "description":"If applicable, a locally unique string identifier that identifies the alignment within its framework and/or targetUrl."},
			{"name":"targetframework", "description":"The framework to which the resource being described is aligned."}
		],
		"methods": {
			"get": true
		},
		"permissions": ["super", "admin", "issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/alignments\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/alignments/",
		"id": "24",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/create",
		"description": "Create a new Alignment record",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"url", "description": "Required. You must include a valid url for the new alignment item" },
			{"name":"name", "description": "Required. You must include the Name of the Alignment" },
			{"name":"description", "description": "Required. Description of the Alignment" },
			{"name":"code", "description": "Optional. You can include a code, that is a locally unique string identifier that identifies the alignment within its framework" },
			{"name":"framework", "description": "Optional. You can include a Framework of the Alignment" }
		],
		"returns": [
			{"name":"id", "description":"Record identifier of the Alignment"},
			{"name":"timecreated", "description":"Time at which the Alignment record was created"},
			{"name":"uniqueid", "description":"Unique Alignment hash number used in the uri for the JSONLD version of the alignment data"},
			{"name":"targetid", "description": "URL linking to the official description of the alignment, for example an individual standard within an educational framework."},
			{"name":"targetname", "description":"Name of the alignment."},
			{"name":"targetdescription", "description":"Short description of the alignment."},
			{"name":"targetcode", "description":"If applicable, a locally unique string identifier that identifies the alignment within its framework and/or targetUrl."},
			{"name":"targetframework", "description":"The framework to which the resource being described is aligned."},
			{"name":"usedinissuance", "description": "true of false as to whether this alignment has been used against an issued badge, and therefore can't be edited or deleted." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super", "admin", "issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/alignments\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/alignments/",
		"id": "25",
		"regexp": "/\\/create(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/update",
		"description": "Update an existing Alignment, record only if it has not been used on an issued badge",
		"params": [
			{"name":"token", "description":"Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used"},
			{"name":"id", "description": "Required. You must include the id for the alignment you wish to update" },
			{"name":"url", "description": "Optional. You can include a valid url for the new alignment item, if you wish to update it" },
			{"name":"name", "description": "Optional. You can include the Name of the Alignment, if you wish to update it" },
			{"name":"description", "description": "Optional. You can include the description of the Alignment, if you wish to update it" },
			{"name":"code", "description": "Optional. You can include a code, that is a locally unique string identifier that identifies the alignment within its framework, if you wish to update it" },
			{"name":"framework", "description": "Optional. You can include a Framework of the Alignment, if you wish to update it" }
		],
		"returns": [
			{"name":"id", "description":"Record identifier of the Alignment"},
			{"name":"timecreated", "description":"Time at which the Alignment record was created"},
			{"name":"uniqueid", "description":"Unique Alignment hash number used in the uri for the JSONLD version of the alignment data"},
			{"name":"targetid", "description": "URL linking to the official description of the alignment, for example an individual standard within an educational framework."},
			{"name":"targetname", "description":"Name of the alignment."},
			{"name":"targetdescription", "description":"Short description of the alignment."},
			{"name":"targetcode", "description":"If applicable, a locally unique string identifier that identifies the alignment within its framework and/or targetUrl."},
			{"name":"targetframework", "description":"The framework to which the resource being described is aligned."},
			{"name":"usedinissuance", "description": "true of false as to whether this alignment has been used against an issued badge, and therefore can't be edited or deleted." }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super", "admin", "issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/alignments\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/alignments/",
		"id": "26",
		"regexp": "/\\/update(?:\\?.*)?$/",
		"examplesPresent": false
	},
	{
		"path": "/delete",
		"description": "Delete an existing Alignment record, only if it has not been used on an issued badge",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "id", "description": "Required. The record identifier of the Alignment you wish to delete." }
		],
		"returns": [
			{ "name": "id", "description": "the record identifier of the deleted Alignment" },
			{ "name": "status", "description": "a status of -1 to indicated that the record has been deleted" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super", "admin", "issuer"],
		"prefixRegexp": "/^\\"+cfg.proxy_path+"\\/alignments\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/alignments/",
		"id": "27",
		"regexp": "/\\/delete(?:\\?.*)?$/",
		"examplesPresent": false
	}
];
