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

var maintitle = "Web Service API - Users";
var routes = [
	{
		"path": "/signin",
		"description": "Sign in to the API and get an authorisation token",
		"params": [
			{ "name": "username", "description": "Required. The username to sign in to this API with - an email address" },
			{ "name": "password", "description": "Required. The pasword to sign in to this API with. Must be at least 8 characters long." }
		],
		"returns": [
			{ "name": "token", "description": "An API token that will expire in 5 hours, or an error object" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["everyone"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/users\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/users/",
		"id": "261",
		"regexp": "/\\/signin(?:\\?.*)?$/",
		"examplesPresent": true
	},
	{
		"path": "/changepassword",
		"description": "Change a password for the currently logged in account.",
		"params": [
			{ "name": "token", "description": "Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used" },
			{ "name": "newpassword", "description": "Required. The new pasword to sign in to this API with. Must be at least 8 characters long." }
		],
		"returns": [
			{ "name": "message", "description": "'Password successfully updated', or an error" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["super","admin","issuer","recipient","endorser"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/users\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/users/",
		"id": "262",
		"regexp": "/\\/changepassword(?:\\?.*)?$/",
		"examplesPresent": true
	},
	{
		"path": "/forgotpassword",
		"description": "Request a new password. Email sent out.",
		"params": [
			{ "name": "email", "description": "Required. The email address of the person that has forgotten their password." }
		],
		"returns": [
			{ "name": "message", "description": "'Forgot Password completed. Email sent'" }
		],
		"methods": {
			"post": true
		},
		"permissions": ["everyone"],
		"prefixRegexp": "/^\\" + cfg.proxy_path + "\\/users\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path + "/users/",
		"id": "263",
		"regexp": "/\\/forgotpassword(?:\\?.*)?$/",
		"examplesPresent": true
	},
];