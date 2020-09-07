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
/** Author: Kevin Quick, KMi, The Open University **/

var maintitle = "Web Service API - Util";
var routes = [
	{
		"path": "/addhashtotransaction",
		"description": "Put the given hash string into a transaction input field on the blockchain",
		"params": [{"name":"token", "description":"your authorisation token"}, {"name":"hash", "description":"the hash you want to add to a transaction input field on the blockchain"}],
		"returns" : [{"name":"transactionnumber", "description":"returns the transaction number putting the hash on the blockchain, or error"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/util\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/util/",
		"id": "234",
		"regexp": "/\\/addhashtotransaction(?:\\?.*)?$/",
		"examplesPresent": true,
		"activeitem": true
	}, {
		"path": "/transactionhash",
		"description": "Get the input hash from the transaction for the given transaction number",
		"params": [{"name":"token", "description":"your authorisation token"},{"name":"transactionnumber", "description":"the transaction number to get the hash input for"}],
		"returns" : [{"name":"hash", "description":"returns the hash input from the transaction for the given transaction number, or error"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/util\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/util/",
		"id": "235",
		"regexp": "/\\/transactionhash(?:\\?.*)?$/",
		"examplesPresent": true,
		"activeitem": true
	}, {
		"path": "/hashstring",
		"description": "Get a hash (web.sha3) of the given string",
		"params": [{"name":"token", "description":"your authorisation token"}, {"name":"stringtohash", "description":"the string you want to hash"}],
		"returns" : [{"name":"hash", "description":"returns hash of the given string, or error"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/util\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/util/",
		"id": "233",
		"regexp": "/\\/hashstring(?:\\?.*)?$/",
		"examplesPresent": true,
		"activeitem": true
	}, {
		"path": "/transaction",
		"description": "Get the json transaction object for the given transaction number",
		"params": [{"name":"token", "description":"your authorisation token"},{"name":"transactionnumber", "description":"the transaction number to get the object for"}],
		"returns" : [{"name":"transaction", "description":"returns the json transaction object for the given transaction number (see example for details), or error"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/util\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/util/",
		"id": "244",
		"regexp": "/\\/transaction(?:\\?.*)?$/",
		"examplesPresent": true,
		"activeitem": true
	}, {
		"path": "/transactionreceipt",
		"description": "Get the json transaction receipt object for the given transaction number",
		"params": [{"name":"token", "description":"your authorisation token"},{"name":"transactionnumber", "description":"the transaction number to get the object for"}],
		"returns" : [{"name":"transactionreceipt", "description":"returns the json transaction receipt object for the given transaction number (see example for details), or error"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/util\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/util/",
		"id": "249",
		"regexp": "/\\/transactionreceipt(?:\\?.*)?$/",
		"examplesPresent": true,
		"activeitem": true
	}, {
		"path": "/block",
		"description": "Get the json block object for the given block number",
		"params": [{"name":"token", "description":"your authorisation token"},{"name":"blocknumber", "description":"the block number to get the object for"}],
		"returns" : [{"name":"block", "description":"returns the json blockt object for the given block number (see example for details), or error"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/util\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/util/",
		"id": "252",
		"regexp": "/\\/block(?:\\?.*)?$/",
		"examplesPresent": true,
		"activeitem": true
	}, {
		"path": "/currentblocknumber",
		"description": "Get the block number of the current block on this blockchain",
		"params": [{"name":"token", "description":"your authorisation token"}],
		"returns" : [{"name":"currentblock", "description":"returns the block number of the current block on this blockchain, or error"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/util\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/util/",
		"id": "255",
		"regexp": "/\\/currentblocknumber(?:\\?.*)?$/",
		"examplesPresent": true,
		"activeitem": true
	}
];