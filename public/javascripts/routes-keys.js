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

var maintitle = "Web Service API - Keys";

var routes = [
	{
		"path": "/public/:id",
		"description": "Get the Public Key for Signatures for Open Badges.",
		"params": [
			{ "name": "issuerid", "description": "Required. The issuer id of the public key you want to get" }
		],
		"returns": [
			{ "name": "@context", "description": "The open badges spec url" },
			{ "name": "type", "description": "CryptographicKey" },
			{ "name": "id", "description": "Pulic Key url" },
			{ "name": "owner", "description": "Issuer profile url" },
			{ "name": "publicKeyPem", "description": "Public key of issuer" }
		],
		"methods": {
			"get": true
		},
		"permissions": ["everyone"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/keys\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/keys/",
		"id": "330",
		"regexp": "/\\/public\\/:id(?:\\?.*)?$/",
		"examplesPresent": false
	}
];