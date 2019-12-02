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

var maintitle = "Web Service API - RDF Merkle Data Store";
var routes = [
	{
		"path": "/list",
		"description": "Retrieve a list of stored RDF Merkle Trees for a given user",
		"params": [{"name": "token", "description":"your authorisation token"}],
		"returns" : [{"name": "storedrdfs", "description": "returns an array of JSON objects each containing data for a RDF Merkle Dataset stored against the current user (see the examples for further details of the format of the JSON object), or error"}],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/merkle\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/merkle/",
		"id": "500",
		"regexp": "/\\/list(?:\\?.*)?$/",
		"examplesPresent": true,
		"activeitem": true
	},
	{
		"path": "/store",
		"description": "Retrieve blockchain contract details relating to a specific RDF Merkle Tree for a given user",
		"params": [
					{"name": "token", "description":"your authorisation token"},
					{"name": "address", "description":"Address of the blockchain contract containing details relating to an RDF dataset stored against the current user"}
				],
		"returns" : [
						{"name": "address", "description": "returns the blockchain contract address, or error"},
						{"name": "transaction", "description": "returns the transaction hash generated when the contract was added to the blockchain, or error"},
						{"name": "created", "description": "returns the time the blockchain contract was created as a unix timestamp, or error"},
						{"name": "owner", "description": "returns the blockchain account address of the person who created the contract, or error"},
						{"name": "ipfsaddress", "description": "returns the IPFS address hash of the Merkle Tree index file, or error"}
				],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/merkle\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/merkle/",
		"id": "502",
		"regexp": "/\\/store(?:\\?.*)?$/",
		"examplesPresent": true,
		"activeitem": true
	},
	{
		"path": "/createMerkle",
		"description": "Add a new verifiable RDF dataset for a given user",
		"params": [
					{"name": "token", "description":"your authorisation token"},
					{"name": "title", "description":"The title to be associated with the stored RDF dataset"},
					{"name": "tripledatafile", "description":"the file you are uploading containing the RDF triple data for the dataset in N-Triple format"}
				],
		"returns" : [
						{"name": "title", "description": "returns the title associated with the stored RDF dataset, or error"},
						{"name": "contract", "description": "returns the blockchain contract address, or error"},
						{"name": "transaction", "description": "returns the transaction hash generated when the contract was added to the blockchain, or error"}
				],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/merkle\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/merkle/",
		"id": "504",
		"regexp": "/\\/createMerkle(?:\\?.*)?$/",
		"examplesPresent": false,
		"activeitem": false
	},
	{
		"path": "/store/title",
		"description": "Retrieve the title assigned to a given stored RDF dataset",
		"params": [
					{"name": "token", "description":"your authorisation token"},
					{"name": "contract", "description":"The blockchain address for the contract of the stored RDF dataset"}
				],
		"returns" : [
						{"name": "title", "description": "returns the title assigned to a given stored RDF dataset, or error"}
				],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/merkle\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/merkle/",
		"id": "512",
		"regexp": "/\\/store/title(?:\\?.*)?$/",
		"examplesPresent": true,
		"activeitem": true
	},
	{
		"path": "/validate/single",
		"description": "Validate a single RDF triple against a verifiable RDF dataset for a given user",
		"params": [
					{"name": "token", "description":"your authorisation token"},
					{"name": "contract", "description":"The blockchain address for the contract of the stored RDF dataset that the single triple is being validated against"},
					{"name": "triple", "description":"the single RDF triple data item being validated (in N-Triple format)"}
				],
		"returns" : [
						{"name": "status", "description": "returns either 'passed' or 'failed', or error"},
						{"name": "proof", "description": "returns JSON proof object (see example), or error"}
				],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/merkle\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/merkle/",
		"id": "506",
		"regexp": "/\\/validate/single(?:\\?.*)?$/",
		"examplesPresent": true,
		"activeitem": true
	},
	{
		"path": "/validate/subset",
		"description": "Validate multiple RDF triples as being part of a verifiable RDF dataset for a given user",
		"params": [
					{"name": "token", "description":"your authorisation token"},
					{"name": "contract", "description":"The blockchain address for the contract of the stored RDF dataset that the multiple triples are being validated against"},
					{"name": "data", "description":"the file you are uploading containing the RDF triple data being validated in N-Triple format"}
				],
		"returns" : [
						{"name": "status", "description": "returns either 'passed' or 'failed' indicating whether all the triples were part of the verifiable RDF dataset, or error"},
						{"name": "result", "description": "returns an array of JSON objects - one for each triple checked. Each JSON object contains the properties 'triple' having the value of the triple being validated, 'status' with values 'passed' or 'failed' and the property 'proof' having the value of the JSON proof object (see /validate/single for example of proof json), or error"}
				],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/merkle\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/merkle/",
		"id": "508",
		"regexp": "/\\/validate/subset(?:\\?.*)?$/",
		"examplesPresent": false,
		"activeitem": false
	},
	{
		"path": "/validate/set",
		"description": "Validate an RDF dataset matches the verifiable RDF dataset for a given user",
		"params": [
					{"name": "token", "description":"your authorisation token"},
					{"name": "contract", "description":"The blockchain address for the contract of the stored RDF dataset that the uploaded dataset is being validated against"},
					{"name": "data", "description":"the file you are uploading containing the RDF triple dataset being validated in N-Triple format"}
				],
		"returns" : [
						{"name": "status", "description": "returns either 'passed' or 'failed' indicating whether the uploaded dataset matches the stored verifiable RDF dataset, or error"}
				],
		"methods": {
			"post": true
		},
		"prefixRegexp": "/^\\/merkle\\/?(?=\\/|$)/i",
		"prefix": cfg.proxy_path+"/merkle/",
		"id": "510",
		"regexp": "/\\/validate/set(?:\\?.*)?$/",
		"examplesPresent": false,
		"activeitem": false
	}
];

//up to id 512 (last assigned id)