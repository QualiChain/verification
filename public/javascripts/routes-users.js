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

var maintitle = "Web Service API - Users";
var routes = [
	{
		"path": "/signin",
		"description": "Sign in to the API and get an authorisation token",
		"params": [{"name":"username", "description":"your username with this API"},{"name":"password", "description":"your password with this API"}],
		"returns" : [{"name":"token", "description":"returns an API token that will expire in 5 hours, or error"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/users\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/users/",
		"id": "30",
		"regexp": "/\\/signin(?:\\?.*)?$/",
		"examplesPresent": true
	}
	/*, {
		"path": "/account",
		"description": "Request your blockchain account number",
		"params": [{"name":"token", "description":"your authorisation token"}],
		"returns" : [{"name":"account", "description":"returns the blockchain account number for the current user, or error"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/users\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/users/",
		"id": "31",
		"regexp": "/\\/account(?:\\?.*)?$/",
		"examplesPresent": true
	}, {
		"path": "/balance",
		"description": "Request the balance of your blockchain account (given in wei and ether)",
		"params": [{"name":"token", "description":"your authorisation token"}],
		"returns" : [
					{"name":"balance-wei", "description":"returns the current balance of the blockchain account for the current user in wei, or error"},
					{"name":"balance-ether", "description":"returns the current balance of the blockchain account for the current user in ether, or error"}
					],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/users\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/users/",
		"id": "32",
		"regexp": "/\\/balance(?:\\?.*)?$/",
		"examplesPresent": true
	}, {
		"path": "/topupaccount",
		"description": "Check to see if account for the logged in user is below 1 ether, if it is, top up the account to equal 5 ether.",
		"params": [{"name":"token", "description":"your authorisation token"}],
		"returns" : [{"name":"transaction", "description":"returns the transaction number of the transaction to top up the current user's account, or error"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/rdf\\/users\\/?(?=\\/|$)/i",
		"prefix": "/rdf/users/",
		"id": "33",
		"regexp": "/\\/topupaccount(?:\\?.*)?$/",
		"examplesPresent": true
	}*/
];
