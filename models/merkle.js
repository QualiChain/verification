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

var db = require('../db.js')
var cfg = require('../config.js');
var utilities = require('../utilities.js');

var fs = require('fs');

var http = require('https');
if (cfg.ipfs_protocol == "http") {
	http = require('http');
}

var stream = require("stream");
var keccak256 = require('js-sha3').keccak_256;
var MerkleTools = require('merkle-tools');
var ipfsClient = require('ipfs-http-client');

const request = require('request');
const N3 = require('n3');
const parser = new N3.Parser({});

var ipfs = ipfsClient(cfg.ipfs_api_domain, cfg.ipfs_api_port, { protocol: cfg.ipfs_api_transport });

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));

const { matchedData } = require('express-validator/filter');
const contractgas = 600000;

var treeOptions = {
	hashType: 'KECCAK256' // optional, defaults to 'sha256'
}

/**
 * Create List View Page.
 *
 */
exports.listView = function(req, res, next) {
	//console.log(req);
	var path = req.baseUrl + req._parsedUrl.pathname;
	var query = req._parsedUrl.query;
	res.render('merklelist', { title: 'List', protocol: cfg.protocol, domain: cfg.domain, path: path, pdir: __dirname});

}

/**
 * Create Individual RDF Dataset Details View Page.
 *
 */
exports.storeView = function(req, res, next) {
	var data = matchedData(req);
	var address = "";
	if (data.address != undefined) address = data.address;

	var path = req.baseUrl + req._parsedUrl.pathname;
	var query = req._parsedUrl.query;
	res.render('merklestore', { title: 'Verifiable RDF Dataset Details', protocol: cfg.protocol, domain: cfg.domain, path: path, address: address, ipfspath: cfg.ipfs_url_stub, pdir: __dirname});

}

/**
 * Display web page for validating RDF data against a specific RDF Merkle Tree for a given user.
 *
 */
exports.validateView = function(req, res, next) {
	var data = matchedData(req);
	var address = "";
	if (data.address != undefined) address = data.address;

	var path = req.baseUrl + req._parsedUrl.pathname;
	var query = req._parsedUrl.query;
	res.render('merklevalidate', { title: 'Validate RDF data against a Verifiable RDF Dataset', protocol: cfg.protocol, domain: cfg.domain, path: path, address: address, ipfspath: cfg.ipfs_url_stub, pdir: __dirname});

}


/**
 * Get a list of all the merkle trees stored for the current user.
 *
 * @return an json object containing data of all the current user's stored merkle trees, or an error.
 */
exports.getMerklesStored = function(req, res, next) {
	// how many stored are they allowed?
	var query = 'SELECT * FROM blockchain_merklestore WHERE userid = ? AND blockchainaddress != ""';
	var params = [req.user.id];
	db.get().query(query, params, function (err, rows) {
		//console.log(err);
		if (err) {
			return res.status(401).send({error: err});
		} else {
			var data = {};
			data.trees = [];

			var addresses = [];
			var count = rows.length;

			//console.log("count:"+count);

			for (var i=0; i<count; i++) {
				data.trees[i] = {};
				data.trees[i].address = rows[i].blockchainaddress;
				data.trees[i].title = rows[i].title;
			}

			res.send(data);
		}
	});
}

/*********************************** MERKLE STORE CONTRACT PUBLIC VARIABLES ***********************************/

/**
 * Returns the blockchain account address of the merkle store contract contract owner for the given contract address.
 * @return owner, the account address of the contract owner for the given contract address.
 */
exports.getOwner = function(req, res, next) {
	var data = matchedData(req);
	if (!data.address) {
		return res.status(400).send({error: "You must include the address of the merkle store contract you want to query"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.owner = "";


	var merklestoreInstance = new web3.eth.Contract(cfg.contracts.ipfsmerkleproof.abi, data.address);
	if (merklestoreInstance){
		var handler = function (e, result) {
			if (!e) {
				if (result == null) {
					res.locals.errormsg = "null returned";
				} else {
					res.locals.owner = result;
				}
			} else {
				console.error(e);
				res.locals.errormsg = e;
			}
			return;
		};
		merklestoreInstance.methods.owner().call(handler);

		req.flagCheck = setInterval(function() {
			if (res.locals.owner != "") {
				clearInterval(req.flagCheck);
				res.send({owner: res.locals.owner});
			} else if (res.locals.errormsg != "") {
				clearInterval(req.flagCheck);
				res.status(404).send({error: res.locals.errormsg});
			}
		}, 100); // interval set at 100 milliseconds

	} else {
		return res.status(401).send({error: "The merkle store contract for the given address cannot be found"});
	}
}

/**
 * Returns the unix timestamp of the date the store was created.
 */
exports.getStoreStartedOn = function(req, res, next) {
	var data = matchedData(req);
	if (!data.address) {
		return res.status(400).send({error: "You must include the address of the merkle store contract you want to query"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.startedon = 0;

	var merklestoreInstance = new web3.eth.Contract(cfg.contracts.ipfsmerkleproof.abi, data.address);
	if (merklestoreInstance){
		var handler = function (e, result) {
			if (!e) {
				if (result == null) {
					res.locals.errormsg = "null returned";
				} else {
					res.locals.startedon = result;
				}
			} else {
				console.error(e);
				res.locals.errormsg = e;
			}
			return;
		};
		merklestoreInstance.methods.creationTime().call(handler);

		req.flagCheck = setInterval(function() {
			if (res.locals.owner != "") {
				clearInterval(req.flagCheck);
				res.send({storeStartedOn: res.locals.startedon});
			} else if (res.locals.errormsg != "") {
				clearInterval(req.flagCheck);
				res.status(404).send({error: res.locals.errormsg});
			}
		}, 100); // interval set at 100 milliseconds

	} else {
		return res.status(401).send({error: "The merkle store contract for the given address cannot be found"});
	}
}

/**
 * Returns the IPFS address of the Merkle Tree index file.
 */
exports.getIPFSAddress = function(req, res, next) {
	var data = matchedData(req);
	if (!data.address) {
		return res.status(400).send({error: "You must include the address of the merkle store contract you want to query"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.ipfsaddress = "";

	var merklestoreInstance = new web3.eth.Contract(cfg.contracts.ipfsmerkleproof.abi, data.address);
	if (merklestoreInstance){
		var handler = function (e, result) {
			if (!e) {
				if (result == null) {
					res.locals.errormsg = "null returned";
				} else {
					res.locals.ipfsaddress = result;
				}
			} else {
				console.error(e);
				res.locals.errormsg = e;
			}
			return;
		};
		merklestoreInstance.methods.IPFSAddress().call(handler);

		req.flagCheck = setInterval(function() {
			if (res.locals.owner != "") {
				clearInterval(req.flagCheck);
				res.send({ipfsaddress: res.locals.ipfsaddress});
			} else if (res.locals.errormsg != "") {
				clearInterval(req.flagCheck);
				res.status(404).send({error: res.locals.errormsg});
			}
		}, 100); // interval set at 100 milliseconds

	} else {
		return res.status(401).send({error: "The merkle store contract for the given address cannot be found"});
	}
}

/**
 * Returns the IPFS address, creation time and owner of the merkle store contract at the given address.
 */
exports.getAllData = function(req, res, next) {
	var data = matchedData(req);
	if (!data.address) {
		return res.status(400).send({error: "You must include the address of the merkle store contract you want to query"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.owner = "";
	res.locals.ipfsaddress = "";
	res.locals.startedon = 0;
	var query = 'SELECT * FROM blockchain_merklestore WHERE userid = ? AND blockchainaddress = ?';
	var params = [req.user.id, data.address];
	db.get().query(query, params, function (err, rows) {
		//console.log(err);
		if (err) {
			return res.status(401).send({error: err});
		} else {
			var count = rows.length;
			if (count == 0) {
				return res.status(409).send({error: "Contract address is not valid for this user"});
			}
			res.locals.transaction = rows[0].transaction;

			var merklestoreInstance = new web3.eth.Contract(cfg.contracts.ipfsmerkleproof.abi, data.address);
			if (merklestoreInstance){
				var handler = function (e, result) {
					if (!e) {
						if (result == null) {
							res.locals.errormsg = "null returned";
						} else {
							res.locals.startedon = result[0];
							res.locals.owner = result[1];
							res.locals.ipfsaddress = result[2];
						}
					} else {
						console.error(e);
						res.locals.errormsg = e;
					}
					return;
				};
				try {
					merklestoreInstance.methods.getData().call(handler);
				}
				catch(err) {
					return res.status(409).send({error: err});
				}

				req.flagCheck = setInterval(function() {
					if (res.locals.owner != "") {
						clearInterval(req.flagCheck);
						res.send({address: data.address, transaction: res.locals.transaction, created: res.locals.startedon, owner: res.locals.owner, ipfsaddress: res.locals.ipfsaddress});
					} else if (res.locals.errormsg != "") {
						clearInterval(req.flagCheck);
						res.status(404).send({error: res.locals.errormsg});
					}
				}, 100); // interval set at 100 milliseconds

			} else {
				return res.status(401).send({error: "The merkle store contract for the given address cannot be found"});
			}
		}
	});
}

/**
 * Returns a list of stored RDF Merkle Trees for a given user.
 */
exports.list = function(req, res, next) {
	var data = matchedData(req);
	res.locals.finished = false;
	res.locals.merkles = new Array();

	var query = 'SELECT * FROM blockchain_merklestore WHERE userid = ? ORDER BY timecreated DESC';
	var params = [req.user.id];
	db.get().query(query, params, function (err, rows) {
		//console.log(err);
		if (err) {
			return res.status(401).send({error: err});
		} else {
			for (i = 0; i < rows.length; i++) {
				res.locals.merkles[i] = {};
				res.locals.merkles[i].title = rows[i]["title"];
				res.locals.merkles[i].contract = rows[i]["blockchainaddress"];
				res.locals.merkles[i].transaction = rows[i]["transaction"];
				res.locals.merkles[i].created = rows[i]["timecreated"];
			}
			res.locals.finished = true;
		}
	});

	req.flagCheck = setInterval(function() {
		if (res.locals.finished) {
			clearInterval(req.flagCheck);
			res.send({storedrdfs: res.locals.merkles});
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}


const promisifiedRequest = function(options) {
	return new Promise((resolve,reject) => {
		request(options, (error, response, body) => {
			if (response) {
				return resolve(response);
			}
			if (error) {
				return reject(error);
			}
		});
	});
};

async function downloadDataFromURL(url) {
	//console.log("DOWNLOAD DATA");
	//console.log("url to download data from: "+url);

	const options = {
		url: url,
		method: 'GET',
		headers: {
			'User-Agent': 'service_linkchain',
			'Accept': 'application/n-triples',
			'Accept': 'text/ntriples'
		}
	};

	var response = await promisifiedRequest(options);
	if(response.statusCode == 200 && !response.error) {
		//console.log(response);
		//console.log(response.headers);
		//console.log(response.body);
		// should be ntriples
		return response.body;
	} else if(response.statusCode == 406) {
		console.log(response.statusCode);
		console.log(response.statusMessage);
		return res.status(406).send({error: "The url you have given cannot return data in n-triples format"});
	} else {
		console.log("error:a problem");
		console.log(response.statusCode);
		console.log(response.statusMessage);
		//console.log(response);
		return res.status(401).send({error: "Error downloading data from URL"});
		return null;
	}
}

/**
 * Validate an entire RDF dataset pulled from a given URL against a stored RDF Merkle set.
 */
exports.validateSetFromURL = function(req, res, next) {
	var data = matchedData(req);

	//console.log(req.user);
	if (!data.url) {
		return res.status(400).send({error: "You must include the url pointing to the triple data you wish to validate"});
	} else if (!data.contract) {
		return res.status(400).send({error: "You must include the blockchain address for the RDF Merkle Tree record the data is being validated against"});
	}

	downloadDataFromURL(data.url)
		.then(function(triples) {
			//console.log("triples: ");
			//console.log(triples);
			data.triples = triples;
			validateSet(req, res, next, data);
		})
		.catch((error) => {
			console.log(error);
			return res.status(401).send({error: "Error downloading data from URL: "+error});
		});
}

/**
 * Validate an entire RDF dataset pulled from a given file against a stored RDF Merkle set.
 */
exports.validateSetFromFile = function(req, res, next) {

	var data = matchedData(req);

	console.log("");

	if (!req.files) {
		return res.status(400).send('No files were uploaded.');
	} else {
		//console.log(req.user);
		if (!req.files.data) {
			return res.status(400).send({error: "You must include a triple data file for this RDF data set"});
		} else if (!data.contract) {
			return res.status(400).send({error: "You must include the blockchain address for the RDF Merkle Tree record the set is being validated against"});
		}

		let tripledatafile = req.files.data;
		var folderpath = cfg.directorpath + "public/uploads/" + "user_" + req.user.id + "/";
		var path = folderpath + data.name;
		if (!fs.existsSync(folderpath)) {
			fs.mkdirSync(folderpath);
		}
		tripledatafile.mv(path, function(err) {
			if (err) {
				return res.status(404).send({error: err});
			}
			fs.readFile(path, 'utf8', function(err, tripledata) {
				deleteFile(path);

				if (err) {
					console.log(err);
					return res.status(401).send({error: "Error fetching triples from file: "+err});
				} else {
					data.triples = tripledata;
					validateSet(req, res, next, data);
				}
			});
  		});
	}
}

function validateSet(req, res, next, data) {

	if (!data.triples) {
		return res.status(400).send({error: "You must include the triple data to validate"});
	} else if (!data.contract) {
		return res.status(400).send({error: "You must include the blockchain address for the RDF Merkle Tree record the data is being validated against"});
	}

	req.flagCheck = null;
	res.locals.finished = false;
	res.locals.merkleroot = "";
	res.locals.errormsg = "";
	res.locals.ipfsaddress = "";
	res.locals.status = "failed";

	var processHandler = function(hasharray, triplearray) {
		//console.log(hasharray);
		if (hasharray.length == 0) return res.status(400).send({error: "You have not posted valid triple data"});

		var makeTreeHandler = function(tree, merkleroot) {
			res.locals.merkleroot = merkleroot;
			//console.log(res.locals.merkleroot);

			var merklestoreInstance = new web3.eth.Contract(cfg.contracts.ipfsmerkleproof.abi, data.contract);
			if (merklestoreInstance){
				var handler = function (e, result) {
					if (!e) {
						if (result == null) {
							res.locals.errormsg = "null returned";
						} else {
							res.locals.ipfsaddress = result;
							//console.log(res.locals.ipfsaddress);

							var url = cfg.ipfs_url_stub + res.locals.ipfsaddress;
							console.log(url);
							http.get(url, (resp) => {
							  let dat = '';

							  // A chunk of data has been recieved.
							  resp.on('data', (chunk) => {
								dat += chunk;
							  });

							  // The whole response has been received. Print out the result.
							  resp.on('end', () => {
								var ipfsindexdata = JSON.parse(dat);
								//console.log(ipfsindexdata);
								if (ipfsindexdata.merkleroot == res.locals.merkleroot) res.locals.status = "passed";
								res.locals.finished = true;
							  });

							}).on("error", (err) => {
								return res.status(400).send({error: err.message});
							});
						}
					} else {
						console.error(e);
						res.locals.errormsg = e;
					}
					return;
				};
				merklestoreInstance.methods.IPFSAddress().call(handler);
			} else {
				return res.status(401).send({error: "The merkle store contract for the given address cannot be found"});
			}
		}
		makeMerkleTree(req, res, hasharray, makeTreeHandler);
	};
	processTriplesData(req, res, data.triples, processHandler);

	req.flagCheck = setInterval(function() {
		if (res.locals.finished) {
			clearInterval(req.flagCheck);
			res.send({status: res.locals.status});
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

/**
 * Validate an entire RDF dataset against a stored RDF Merkle set.
 */
exports.validateSubsetFromURL = function(req, res, next) {
	var data = matchedData(req);

	//console.log(req.user);
	if (!data.url) {
		return res.status(400).send({error: "You must include the url pointing to the triple data you wish to validate"});
	} else if (!data.contract) {
		return res.status(400).send({error: "You must include the blockchain address for the RDF Merkle Tree record the data is being validated against"});
	}

	downloadDataFromURL(data.url)
		.then(function(triples) {
			//console.log("triples: ");
			//console.log(triples);
			data.triples = triples;
			validateSubset(req, res, next, data);
		})
		.catch((error) => {
			console.log(error);
			return res.status(401).send({error: "Error downloading data from URL: "+error});
		});
}


/**
 * Validate an entire RDF dataset against a stored RDF Merkle set.
 */
exports.validateSubsetFromFile = function(req, res, next) {
	var data = matchedData(req);

	if (!req.files) {
		return res.status(400).send('No files were uploaded.');
	} else {
		//console.log(req.user);
		if (!req.files.data) {
			return res.status(400).send({error: "You must include a triple data file for this RDF data set"});
		} else if (!data.contract) {
			return res.status(400).send({error: "You must include the blockchain address for the RDF Merkle Tree record the set is being validated against"});
		}

		let tripledatafile = req.files.data;
		var folderpath = cfg.directorpath + "public/uploads/" + "user_" + req.user.id + "/";
		var path = folderpath + data.name;
		if (!fs.existsSync(folderpath)) {
			fs.mkdirSync(folderpath);
		}
		tripledatafile.mv(path, function(err) {
			if (err) {
				return res.status(404).send({error: err});
			}
			fs.readFile(path, 'utf8', function(err, tripledata) {

				//console.log(tripledata);
				deleteFile(path);

				if (err) {
					console.log(err);
					return res.status(401).send({error: "Error fetching triples from file: "+err});
				} else {
					data.triples = tripledata;
					validateSubset(req, res, next, data);
				}
			});
  		});
	}
}

function validateSubset(req, res, next, data) {

	if (!data.triples) {
		return res.status(400).send({error: "You must include the triple data to validate"});
	} else if (!data.contract) {
		return res.status(400).send({error: "You must include the blockchain address for the RDF Merkle Tree record the data is being validated against"});
	}

	req.flagCheck = null;
	res.locals.finished = false;
	res.locals.merkleroot = "";
	res.locals.errormsg = "";
	res.locals.ipfsaddress = "";
	res.locals.status = "failed";
	res.locals.results = new Array();
	res.locals.triples = new Array();
	res.locals.total = 0;

	var processHandler = function(hasharray, triplearray) {
		//console.log(hasharray);
		if (hasharray.length == 0) return res.status(400).send({error: "You have not posted valid triple data"});

		var merklestoreInstance = new web3.eth.Contract(cfg.contracts.ipfsmerkleproof.abi, data.contract);
		if (merklestoreInstance){
			var handler = function (e, result) {
				if (!e) {
					if (result == null) {
						res.locals.errormsg = "null returned";
					} else {
						res.locals.ipfsaddress = result;
						//console.log(res.locals.ipfsaddress);

						var url = cfg.ipfs_url_stub + res.locals.ipfsaddress;
						//console.log(url);
						http.get(url, (resp) => {
							let dat = '';

							// A chunk of data has been recieved.
							resp.on('data', (chunk) => {
								dat += chunk;
							});

							// The whole response has been received. Print out the result.
							resp.on('end', () => {
								var ipfsindexdata = JSON.parse(dat);
								res.locals.merkleroot = ipfsindexdata.merkleroot;
								res.locals.merkleipfs = ipfsindexdata.merkleipfs;
								//console.log(ipfsindexdata);
								url = cfg.ipfs_url_stub + res.locals.merkleipfs;
								http.get(url, (resp2) => {
									let dat = '';

									// A chunk of data has been recieved.
									resp2.on('data', (chunk) => {
										dat += chunk;
									});

									// The whole response has been received. Print out the result.
									resp2.on('end', () => {
										res.locals.status = "passed";
										var tree = JSON.parse(dat);
										res.locals.total = hasharray.length;

										function validatehandler(status){
											res.locals.status = status;
											res.locals.finished = true

										}
										validationloop(triplearray, hasharray, res.locals.results, res.locals.merkleroot, res.locals.merkleipfs, tree, ipfsindexdata, res.locals.status, 0, validatehandler)

									});
								}).on("error", (err) => {
									return res.status(400).send({error: err.message});
								});
							});
						}).on("error", (err) => {
							return res.status(400).send({error: err.message});
						});
					}
				} else {
					console.error(e);
					res.locals.errormsg = e;
				}
				return;
			};
			merklestoreInstance.methods.IPFSAddress().call(handler);
		} else {
			return res.status(401).send({error: "The merkle store contract for the given address cannot be found"});
		}
	};
	processTriplesData(req, res, data.triples, processHandler);

	req.flagCheck = setInterval(function() {
		if (res.locals.finished) {
			clearInterval(req.flagCheck);
			res.send({status: res.locals.status, result: res.locals.results});
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

/**
 * Retrieve the title of a stored RDF Merkle set.
 */
exports.storeTitle = function(req, res, next) {
	var data = matchedData(req);
	if (!data.contract) {
		return res.status(400).send({error: "You must include the blockchain address for the RDF Merkle Tree record the set is being validated against"});
	}
	res.locals.title = "";
	res.locals.finished = false;
	console.log(req.user.id + " " + data.contract);

	var query = 'SELECT * FROM blockchain_merklestore WHERE userid = ? AND blockchainaddress = ?';
	var params = [req.user.id, data.contract];
	db.get().query(query, params, function (err, rows) {
		//console.log(err);
		if (err) {
			return res.status(401).send({error: err});
		} else {
			if (rows.length == 1) {
				res.locals.title = rows[0]["title"];
	console.log(req.user.id + " " + data.contract + " " + res.locals.title);
				res.locals.finished = true;
				res.send({title: res.locals.title});
			} else {
				return res.status(400).send({error: "No record found"});
			}
		}
	});
}

/**
 * Validate a single RDF triple against a stored RDF Merkle set.
 */
exports.validateSingle = function(req, res, next) {

	var data = matchedData(req);

	req.flagCheck = null;
	res.locals.finished = false;
	res.locals.merkleroot = "";
	res.locals.errormsg = "";
	res.locals.ipfsaddress = "";
	res.locals.leafindex = "";
	res.locals.merkleipfs = "";
	res.locals.status = "failed";
	res.locals.proof = {};

	//console.log(req.user);
	if (!data.triple) {
		return res.status(400).send({error: "You must include RDF data for a single record"});
	} else if (!data.contract) {
		return res.status(400).send({error: "You must include the blockchain address for the RDF Merkle Tree record the set is being validated against"});
	}

	if (typeof data.triple === 'string' || data.triple instanceof String) {
		var triple = data.triple.trim();
	} else {
		return res.status(400).send({error: "The RDF data is of an invalid format. You must include RDF data as Triples/Quads in N-Triple format. "});
	}

	var merklestoreInstance = new web3.eth.Contract(cfg.contracts.ipfsmerkleproof.abi, data.contract);
	if (merklestoreInstance){
		var handler = function (e, result) {
			if (!e) {
				if (result == null) {
					res.locals.errormsg = "null returned";
				} else {
					res.locals.ipfsaddress = result;
					//console.log(res.locals.ipfsaddress);

					var url = cfg.ipfs_url_stub + res.locals.ipfsaddress;
					//console.log(url);
					http.get(url, (resp) => {
						let dat = '';

						// A chunk of data has been recieved.
						resp.on('data', (chunk) => {
							dat += chunk;
						});

						// The whole response has been received. Print out the result.
						resp.on('end', () => {
							var ipfsindexdata = JSON.parse(dat);
							//console.log(ipfsindexdata);
							res.locals.merkleroot = ipfsindexdata.merkleroot;
							res.locals.merkleipfs = ipfsindexdata.merkleipfs;
							try {
								parsedTriple = parser.parse(triple);
								var hash = hashQuads(parsedTriple[0]);
								leafindex = ipfsindexdata.data[hash];
								res.locals.leafindex = leafindex;

								url = cfg.ipfs_url_stub + res.locals.merkleipfs;
								//console.log(url);
								http.get(url, (resp) => {
									let dat = '';

									// A chunk of data has been recieved.
									resp.on('data', (chunk) => {
										dat += chunk;
									});

									// The whole response has been received. Print out the result.
									resp.on('end', () => {
										var tree = JSON.parse(dat);
										//console.log(tree);
										function validatehandler(status, proof){
											res.locals.status = status;
											res.locals.proof = proof;
											res.locals.finished = true;
										}
										validateMerkleTreeLeaf(leafindex, res.locals.merkleroot, res.locals.merkleipfs, tree, validatehandler);

									});
								}).on("error", (err) => {
									return res.status(400).send({error: err.message});
								});
							}
							catch(err) {
								return res.status(409).send({error: err.message});
							}
						});
					}).on("error", (err) => {
						return res.status(400).send({error: err.message});
					});
				}
			} else {
				console.error(e);
				res.locals.errormsg = e;
			}
			return;
		};
		merklestoreInstance.methods.IPFSAddress().call(handler);
	} else {
		return res.status(401).send({error: "The merkle store contract for the given address cannot be found"});
	}

	req.flagCheck = setInterval(function() {
		if (res.locals.finished) {
			clearInterval(req.flagCheck);
			res.send({status: res.locals.status, proof: res.locals.proof});
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

/**
 * Send a transaction to create a new instance of a Merkle Store contract.
 *
 * @return address, the transaction address of the transaction to create new RDF Store contract, or an error.
 */
exports.createMerkle = function(req, res, next) {

	var data = matchedData(req);

	req.flagCheck = null;
	res.locals.finished = false;
	res.locals.transactionAddress = "";
	res.locals.contractAddress = "";
	res.locals.errormsg = "";

	if (!req.files) {
		return res.status(400).send('No files were uploaded.');
	} else {
		//console.log(req.user);
		if (!req.files.tripledatafile) {
			return res.status(400).send({error: "You must include a triple data file for this RDF Merkle Tree record"});
		} else if (!data.title) {
			return res.status(400).send({error: "You must include the title for this RDF Merkle Tree record"});
		}
		let tripledatafile = req.files.tripledatafile;
		var folderpath = cfg.directorpath + "public/uploads/" + "user_" + req.user.id + "/";
		var path = folderpath + tripledatafile.name;
		if (!fs.existsSync(folderpath)) {
			fs.mkdirSync(folderpath);
		}
		tripledatafile.mv(path, function(err) {
			if (err) {
				return res.status(404).send({error: err});
			}
			fs.readFile(path, 'utf8', function(err, tripledata) {
				var processHandler = function(hasharray, triplearray) {
					//console.log(hasharray);

					deleteFile(path);
					if (hasharray.length == 0) return res.status(400).send({error: "You have not posted valid triple data"});

					var makeTreeHandler = function(tree, merkleroot) {
						dat = {};
						dat.total = hasharray.length;
						dat.merkleroot = merkleroot;
						dat.tree = tree.levels;
						var treehandler = function(result) {
							dat.ipfshashtree = result;
							console.log(dat.ipfshashtree);
							//console.log(dat);

							var indexhandler = function(result) {
								dat.ipfshashindex = result;
								//console.log(dat.ipfshashindex);
								//console.log("user account:" + req.user.blockchainaccount);

								var query = 'SELECT * FROM blockchain_merklestore WHERE userid = ? AND ipfshash = ?';
								var params = [req.user.id, dat.ipfshashindex];
								db.get().query(query, params, function (err, rows) {
									//console.log(err);
									if (err) {
										return res.status(401).send({error: err});
									} else {
										var count = rows.length;
										if (count > 0) {
											return res.status(409).send({error: "You have already stored this RDF data under the title " + rows[0].title});
										} else {
											var createContract = function(req, res, next, data) {

												var tContract = new web3.eth.Contract(cfg.contracts.ipfsmerkleproof.abi);
												tContract.deploy({
													data: cfg.contracts.ipfsmerkleproof.binary,
													arguments: [dat.ipfshashindex]
												})
												.send({
													from: req.user.blockchainaccount,
													gas: contractgas
												})
												.on('error', function(error){
													console.log("createMerkle error: " + error);
													res.locals.errormsg = error;
												})
												.on('transactionHash', function(transactionHash){
													console.log("RDF Merkle Store Contract transaction send: TransactionHash: "+transactionHash + " waiting to be mined...");
													console.log("Merkle Store Contract Creation transaction send: TransactionHash: " +transactionHash);
													var insertquery = 'INSERT INTO blockchain_merklestore (title, ipfshash, timecreated, userid, transaction) VALUE (?,?,?,?,?)';
													var time = (new Date().getTime())/1000;
													var params = [data.title, dat.ipfshashindex, time, req.user.id, transactionHash];

													db.get().query(insertquery, params, function(err2, results2) {
														if (err2) {
															console.log(err2);
															res.locals.errormsg = err2;
														} else {
															res.locals.transactionAddress = transactionHash;
														}
													});
												})
												.on('receipt', function(receipt){
													console.log("RDF Merkle Contract mined - Address: " + receipt.contractAddress);
													var insertquery = 'UPDATE blockchain_merklestore SET blockchainaddress=? WHERE userid=? AND transaction=?';
													var params = [receipt.contractAddress, req.user.id, res.locals.transactionAddress];

													db.get().query(insertquery, params, function(err2, results2) {
														if (err2) {
															console.log(err2);
															res.locals.errormsg = err2;
														} else {
															console.log("rdfmerklestore saved");
															res.locals.contractAddress = receipt.contractAddress;
															res.locals.finished = true;
														}
													});
												});
											}
											utilities.unlockAccount(req, res, next, data, createContract, req.user.blockchainaccount, req.user.blockchainaccountpassword);
										}
									}
								});
							};
							writeIndexToTreeToIPFS(req, res, dat, indexhandler);
						};
						writeTreeToIPFS(req, res, dat.tree, treehandler);
					}
					makeMerkleTree(req, res, hasharray, makeTreeHandler);
				};
				processTriplesData(req, res, tripledata, processHandler);
			});
  		});
	}

	req.flagCheck = setInterval(function() {
		if (res.locals.finished) {
			clearInterval(req.flagCheck);
			res.send({title: data.title, contract: res.locals.contractAddress, transaction: res.locals.transactionAddress});
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
}

function validationloop(triplearray, hasharray, resultarray, merkleroot, merkleipfs, tree, ipfsindexdata, overallstatus, current, validatehandler) {

	//console.log(current+" FROM "+hasharray.length);

	if (current == hasharray.length) {
		validatehandler(overallstatus);
	} else {
		resultarray[current] = {};
		resultarray[current].quad = triplearray[hasharray[current]];

		//console.log(current);
		//console.log(hasharray[current]);
		//console.log(triplearray[hasharray[current]]);
		//console.log(resultarray[current]);

		leafindex = ipfsindexdata.data[hasharray[current]];

		function validatereturnhandler(status, proof){
			resultarray[current].status = status;
			if (status == "failed") overallstatus = "failed";
			//console.log(overallstatus);
			resultarray[current].proof = proof;
			current += 1;
			validationloop(triplearray, hasharray, resultarray, merkleroot, merkleipfs, tree, ipfsindexdata, overallstatus, current, validatehandler);
		}
		validateMerkleTreeLeaf(leafindex, merkleroot, merkleipfs, tree, validatereturnhandler);
	}
}

function processTriplesData(req, res, triples, handler) {
	var tarray = {};
	var hasharray = new Array();

	try {
		var parsedTriple = parser.parse(triples);
		console.log(parsedTriple.length);

		for (i = 0; i < parsedTriple.length; i++) {
			hasharray[i] = hashQuads(parsedTriple[i]);
			tarray[hasharray[i]] = parsedTriple[i];
		}
	}
	catch(err) {
		return res.status(409).send({error: err.message});
	}

	console.log(parsedTriple.length);

	/*
	var triples = triples.replace("\r\n", "\n");
	tarray = triples.split("\n");
	var temp = new Array();
	for (i = 0; i < tarray.length; i++) {
		tarray[i] = tarray[i].trim();

		// taken out due to format differences
		//tmp = tarray[i].split(/> <|\" <|> \"|\" \"/);
		//if (tmp.length > 2) {
			temp[temp.length] = tarray[i];
		//}
	}
	tarray = temp;
	// sort triples into alphabetical order so that identical triple stores, but where triples are in a different order equate to the same thing
	tarray.sort();
	*/

	/*
	var parsedTriple;
	for (i = 0; i < tarray.length; i++) {
		try {
			parsedTriple = parser.parse(tarray[i]);
			hasharray[i] = hashQuads(parsedTriple[0]);
		}
		catch(err) {
			return res.status(409).send({error: err.message});
		}
	}
	*/

	//console.log(hasharray[0]);
	handler(hasharray, tarray);
}

function hashQuads(quad ) {
	if (quad) {
		//console.log(JSON.stringify(quad));
		//var quadString = (quad.graph ? (quad.graph.value ? '<' + quad.graph.value + '>' : '') : '') +
		var quadString = (quad.graph.value ? '<' + quad.graph.value + '>' : '') +
		'<' + quad.subject.value + '> <' +
		quad.predicate.value + '> ';
		if (quad.object.termType != "Literal") {
			quadString += '<' + quad.object.value + '>';
		} else {
			quadString += '"' + quad.object.value + '"';
			if (quad.object.language) {
				quadString += '@' + quad.object.language;
			}
			if (quad.object.datatype) {
				quadString += '^^<' + quad.object.datatype.value + '>';
			}
		}
		quadString += ' .';
		//console.log(keccak256(quadString));
		return keccak256(quadString);
	}
}

function makeMerkleTree(req, res, data, handler) {
	var merkleTools = new MerkleTools(treeOptions);

	data.sort();

	merkleTools.addLeaves(data, false);
	merkleTools.makeTree();

	var rootbuffer = merkleTools.getMerkleRoot();
	merkleroot = rootbuffer.toString('hex');
	tree = merkleTools.getMerkleTree();

	for (var x = 0; x < tree.levels.length; x++) {
		//console.log("level " + x + "  = " + tree.levels[x].length);
		for (var y = 0; y < tree.levels[x].length; y++) {
			tree.levels[x][y] = tree.levels[x][y].toString('hex');
		}
	}
	//console.log(tree.levels);
	handler(tree, merkleroot);

}

function writeTreeToIPFS(req, res, tree, handler){
	out = {};
	out.merkletree = tree;
	str = JSON.stringify(out);

	var ipfsjsonstream = new stream.PassThrough();
	ipfsjsonstream.write(str);
	ipfsjsonstream.end();

	ipfs.addFromStream(ipfsjsonstream, (err, result) => {
		if (err) {
			console.log(err);
			throw err
		}
		handler(result[0].hash);
	})
}

function writeIndexToTreeToIPFS(req, res, dat, handler){
	index = {};
	index.merkleipfs = dat.ipfshashtree;
	index.merkleroot = dat.merkleroot;
	//console.log(index);
	leaveslevel = dat.tree.length - 1;
	index.data = {};
	for (var x = 0; x < dat.total; x++) {
		index.data[dat.tree[leaveslevel][x]] = x;
	}
	str = JSON.stringify(index);

	var ipfsjsonstream = new stream.PassThrough();
	ipfsjsonstream.write(str);
	ipfsjsonstream.end();

	ipfs.addFromStream(ipfsjsonstream, (err, result) => {
		if (err) {
			return res.status(409).send({error: err});
		}
		handler(result[0].hash);
	})
}

function validateMerkleTreeLeaf(leafindex, merkleroot, merkleipfs, tree, handler) {
	var status = "failed";
	var proof = {};

	if (leafindex != undefined) {

		var levels = tree.merkletree.length;
		//console.log(levels);
		var runningindex = 1*leafindex;
		proof.merkleRoot = tree.merkletree[0][0];
		proof.targetHash = tree.merkletree[levels - 1][leafindex];
		proof.proof = new Array();

		workingproof = new Array();
		var nexthash = "";
		for (j = levels - 1; j > 0; j--) {
			workingproof[levels - 1 - j] = {};
			if (runningindex === tree.merkletree[j].length - 1 && tree.merkletree[j].length % 2 === 1 ) {
				   runningindex = Math.floor(runningindex / 2);
				   continue;
			} else {
				if (tree.merkletree[j][runningindex] != nexthash && nexthash != ""){
					//proof = {};
					//sortedTriples[processing.id][i].proof = proof;
					break;
				}
				side = runningindex % 2 == 0 ? "right" : "left";
				sign = runningindex % 2 == 0 ? 1 : -1;
				workingproof[levels - 1 - j][side] = tree.merkletree[j][runningindex + sign];
				if (sign == 1) {
					leftbuf = Buffer.from(tree.merkletree[j][runningindex], 'hex');
					rightbuf = Buffer.from(tree.merkletree[j][runningindex + sign], 'hex');
				} else {
					leftbuf = Buffer.from(tree.merkletree[j][runningindex + sign], 'hex');
					rightbuf = Buffer.from(tree.merkletree[j][runningindex], 'hex');
				}

				bufconcat = Buffer.concat([leftbuf, rightbuf]);
				nexthash = keccak256(bufconcat);
				runningindex = Math.floor(runningindex / 2);
			}
		}

		for (i = 0; i < workingproof.length; i++) {
			if (workingproof[i].left == undefined && workingproof[i].right == undefined) {
				//skip
			} else {
				proof.proof[proof.proof.length] = workingproof[i];
			}
		}

		if (nexthash == merkleroot) {
			status = "passed";
		} else {
			status = "failed";
		}
		handler(status, proof);
	} else {
		handler(status, proof);
	}
}

function deleteFile(which){
	if(fileExists(which)){
		fs.unlinkSync(which);
		console.log('successfully deleted file');
	}
}

function fileExists(filePath){
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}