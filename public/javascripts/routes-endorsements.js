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

/** Author: Michelle Bachler, KMi, The Open University **/
/** Author: Manoharan Ramachandran, KMi, The Open University **/
/** Author: Kevin Quick, KMi, The Open University **/

var maintitle = "Web Service API - Endorsements";
var routes = [
	{
		"path": "/hosted/:id",
		"description": "Get a hosted verification Endorsement record in Open Badge JSONLD format by it's unique record identifier.",
		"params": [
			{ "name": "id", "description": "Required. The unique identifier of the Endorsement record you wish to retrieve." }
		],
		"returns": [
			{"name":"@context", "description": "The open badges context url" },
			{"name":"type", "description": "Endorsement" },
			{"name":"id", "description": "The uri/url for this endorsement" },
			{"name":"issuedOn", "description": "the date the endorsement was made - compatible with ISO 8601" },
			{"name":"issuer", "description": "Object describing the endorsement issuer details - see Open Badge specification" },
			{"name":"verification", "description": "Object describing the verification type - see Open Badge specification" },
			{"name":"claim", "description":"Object describing the claim being made in this endorsement - see Open Badge specification"},
		],
		"methods": {
			"get": true
		},
		"permissions": ["everyone"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/endorsements\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/endorsements",
		"id": "250",
		"regexp": "/\\/hosted\\/:id(?:\\?.*)?$/",
		"examplesPresent": false
	}
]