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

const cfg = require('../config.js');
const fs = require( 'fs' );
const crypto = require('crypto');
const jsonld = require('jsonld');

const got = require('got');
const stream = require('stream');
const {promisify} = require('util');
const pipeline = promisify(stream.pipeline);

// define a mapping of context URL => context doc
const ctx = fs.readFileSync(cfg.directorpath+'contexts/schema.org.jsonld', 'utf8');
const CONTEXTS = {'http://schema.org': ctx, 'https://schema.org': ctx};

// grab the built-in Node.js doc loader
const nodeDocumentLoader = jsonld.documentLoaders.node();
// or grab the XHR one: jsonld.documentLoaders.xhr()

// change the default document loader
const customLoader = async (url, options) => {
	if(url in CONTEXTS) {
		return {
		  contextUrl: null, // this is for a context via a link header
		  document: CONTEXTS[url], // this is the actual document that was loaded
		  documentUrl: url // this is the actual context URL after redirects
		};
	}
	return nodeDocumentLoader(url);
};

// Create web3 instance
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));


/**
 * Transfer funds between transferdata.from and transferdata.to accounts, to the value of transferdata.amount (given in ether)
 * Calls the return handler, with new transferdata properties: transferdata.frombalance (before transfer), transferdata.tobalance (before transfer),
 * transferdata.tx (the funds transfer transaction number) or Error object.
 */
exports.transferFunds = function(transferdata, handler) {

	transferdata.wei = web3.utils.toWei(transferdata.amount.toString());

	//console.log(transferdata.wei);
	//console.log(transferdata.from);
	//console.log(transferdata.to);

	web3.eth.getBalance(transferdata.from)
		.then(function(balance){
			var wei = balance;
			transferdata.frombalance = web3.utils.fromWei(wei, "ether");
			console.log("From Balance = " + transferdata.frombalance + " ether");

			if (parseInt(transferdata.frombalance) < parseInt(transferdata.amount)) {
				handler(new Error("insufficient funds in the from address"));
			} else {
				web3.eth.getBalance(transferdata.to)
					.then(function(balance2){
						let weito = balance2;
						transferdata.tobalance = web3.utils.fromWei(weito, "ether");
						console.log("To Balance = " + transferdata.tobalance + " ether");

						web3.eth.sendTransaction({from: transferdata.from, to: transferdata.to, value: transferdata.wei})
						.on('receipt', function(receipt) {
							console.log("Transfer result: ");
							console.log(receipt);

							if (receipt.status == "0x0") {
								console.log("Funds transfer transaction failed");
								handler(new Error("Funds transfer transaction failed"));
							} else {
								transferdata.tx = receipt.transactionHash;
								handler(null, transferdata);
							}
						})
						.on('error', function(error3) {
							console.log("Transfer error: " + error3);
							handler(new Error("Transfer error: " + error3));
						});
					}).catch((error2) => {
						console.log("get to account balance error: "+error2);
						handler(new Error(error2));
					});
			}
		}).catch((error) => {
			console.log("get from account balance error: "+error);
			handler(new Error(error));
		});
}


/**
 * Create a new blockchain account using the given reply.accountname and reply.accountpassword
 * Calls the return handler, with new reply properties: reply.account, reply.secretphrase or reply.error array if things went wrong.
 */
exports.createAccount = function(accountdata, handler) {

	let util = require('util');
	let exec = require('child_process').exec;

	let command = 'curl --data \'{"method":"parity_generateSecretPhrase","params":[],"id":1,"jsonrpc":"2.0"}\' -H "Content-Type: application/json" -X POST '+cfg.rpcapi+':'+cfg.rpcport;
	child = exec(command, function(e, stdout, stderr){
		if(e !== null) {
			//console.log('stderr: ' + stderr);
			//console.log('exec error: ' + e);
			handler(new Error(e));
		} else {
			accountdata.secretphrase = JSON.parse(stdout).result;

			let command2 = 'curl --data \'{"method":"parity_newAccountFromPhrase","params":["'+accountdata.secretphrase+'","'+accountdata.accountpassword+'"],"id":1,"jsonrpc":"2.0"}\' -H "Content-Type: application/json" -X POST '+cfg.rpcapi+':'+cfg.rpcport;
			child2 = exec(command2, function(e2, stdout2, stderr2){
				if(e2 !== null) {
					//console.log('stderr2: ' + stderr2);
					//console.log('exec error2: ' + e2);
					handler(new Error(e2));
				} else {
					let newaccount = JSON.parse(stdout2).result;
					accountdata.account = web3.utils.toChecksumAddress(newaccount); // Parity account creation does not return checksummed accounts yet - 10/10/2019
					//console.log(accountdata.account);

					// single speach marks upset parity or curl
					let accountname = accountdata.accountname.replace(/\'/g, ' ');

					let command3 = 'curl --data \'{"method":"parity_setAccountName","params":["'+accountdata.account+'","'+accountname+'"],"id":1,"jsonrpc":"2.0"}\' -H "Content-Type: application/json" -X POST '+cfg.rpcapi+':'+cfg.rpcport;
					child3 = exec(command3, function(e3, stdout3, stderr3){
						if(e3 !== null) {
							//console.log('stderr3: ' + stderr3);
							//console.log('exec error3: ' + e3);
							handler(new Error(e3));
						} else {
							accountdata.message = JSON.parse(stdout3);
							//console.log(stdout3);

							handler(null, accountdata);
						}
					});
				}
			});
		}
	});
}

/**
 * Check to see if account balance is below minimumAccountBalanceWei,
 * if it is, top up the account to equal optimumAccountBalanceWei.
 * Call return handler with and Error object if something went wrong else just the account number
 */
exports.topUpAccount = function(account, handler){

	let minimumAccountBalanceWei = parseInt(web3.utils.toWei(cfg.minimumAccountBalance.toString(), "ether"));
	let optimumAccountBalanceWei = parseInt(web3.utils.toWei(cfg.optimumAccountBalance.toString(), "ether"));

	web3.eth.getBalance(account)
		.then(function(balance){
			let wei = parseInt(balance);

			if (wei < minimumAccountBalanceWei) {
				//console.log("topUpAccount");
				//console.log(account);
				//console.log(balance);

				let topup = optimumAccountBalanceWei - wei;
				console.log("Topping up account with an extra " + topup + " wei");

				web3.eth.sendTransaction({from: cfg.systemBankAccount, to: account, value: topup.toString()})
					.on('receipt', function(receipt) {
						console.log("TopUp Transfer result: ");
						console.log(receipt);
						if (receipt.status == "0x0") {
							console.log("Funds transfer transaction failed");
							handler(new Error("Funds transfer transaction failed"));
						} else {
							handler(null, account);
						}
					})
					.on('error', function(error) {
						console.log("Transfer error: " + error);
						handler(new Error("Transfer error: " + error));
					});
			} else {
				//console.log("Sufficient balance - no top up needed");
				handler(null, account);
			}
		}).catch((error) => {
			console.log("getBalance error: "+error);
			handler(new Error("getBalance error: " + error));
		});
}

/**
 * Unlock the given account with the given password
 * Call the return handler once account unlocked apssing back and erro object or the account number
 */
exports.unlockAccount = function(account, accountpassword, handler){

	// check if account needs toppping up before unlocking it
	let thishandler = function (err, reply) {
		if (err) {
			handler(err);
		} else {
			//if no password given assume nothing needs unlocking, just continue on.
			if (!accountpassword || accountpassword == "") {
				handler(null, account);
			} else {
				let innerhandler = function (e, result) {
					if (!e) {
						console.log("Unlocked " + account);
						handler(null, account);
					} else {
						console.error("Error unlocking " + account + " = "+e);
						handler(new Error(e));
					}
				};
				web3.eth.personal.unlockAccount(account, accountpassword, innerhandler);
			}
		}
	}

	if (account != cfg.systemBankAccount) {
		exports.topUpAccount(account, thishandler);
	} else {
		thishandler(null, account);
	}
}

/**
 * Function to return the transaction object for a given transaction id.
 */
exports.getTransaction = function(transactionid, req, res) {

	if (transactionid == "") {
		return res.status(401).send("The transaction for that address cannot be found");
	}

	web3.eth.getTransaction(transactionid)
		.then(function(transaction){
			res.send({transaction: transaction});
		}).catch((error) => {
			console.log("getTransaction error: "+error);
			res.status(404).send({error: error});
		});
}

/**
 * Function to return the transaction receipt object for a given transaction id.
 */
exports.getTransactionReceipt = function(transactionid, req, res) {

	if (transactionid == "") {
		return res.status(401).send("The transaction for that address cannot be found");
	}

	web3.eth.getTransactionReceipt(transactionid)
		.then(function(transaction){
			res.send({transactionreceipt: transaction});
		}).catch((error) => {
			console.log("getTransactionReceipt error: "+error);
			res.status(404).send({error: error});
		});
}

/**
 * Get the json block object for the given block number
 *
 * @param blocknumber, the block number to get the object for.
 * @return json block object for the given block number, or error.
 */
exports.getBlock = function(blocknumber, req, res, next) {

	if (blocknumber == "") {
		return res.status(400).send({error:"You must include the block number of the block you want to get"});
	}

	web3.eth.getBlock(blocknumber, true) // true = includes transactions
		.then(function(block){
			if (block == null) {
				res.status(404).send({error: "invalid block number"});
			} else {
				res.send({block: block});
			}
		}).catch((error) => {
			res.status(404).send({error: error});
		});
}

/**
 * Get the block number of the current block
 *
 * @return the block number of the current block, or error.
 */
exports.getCurrentBlockNumber = function(req, res, next) {

	web3.eth.getBlockNumber()
		.then(function(currentblock){
			res.send({currentblock: currentblock});
		}).catch((error) => {
			console.log("currentblock error: "+error);
			res.status(404).send({error: error});
		});
};

/**
 * Function to escape single speeach marks
 * Returns the original passed string with any single speech marks escaped.
 */
exports.escape = function(thestring) {
	return thestring.split("'").join("\\\'");
}

/**
 * Function to check that a contract address exists.
 * Call the handler and passes back true and an empty error string if it exists, false and any error message if it does not.
 */
exports.contractExists = function(address, returnhandler, req, res) {

	let exists = false;
	let error = "";

	web3.eth.getCode(address)
		.then(function(code){
			console.log(code);
			if (code != "0x") {
				exists = true;
			}
			returnhandler(exists, error);
		}).catch((error) => {
			console.log("contractExists error: "+error);
			returnhandler(exists, error);
		});
}

/**
 * Generate a digital random number/letter combination for registration keys and temporary passwords etc.. of the given length
 * - Original code by By Damian Dadswell in PHP
 * @param keylength the length of the key to generate
 * return the random number.
 */
exports.createKey = function(keylength) {

	let registration = "";
	let newlength = 0;
	while(newlength < keylength) {
		let part = rand(1,3);

		let a,b;
		if(part==1){a=48;b=57;}  // Numbers
		if(part==2){a=65;b=90;}  // UpperCase
		if(part==3){a=97;b=122;} // LowerCase

		let code_part=String.fromCharCode(rand(a,b));
		newlength = newlength + 1;
		registration = registration+code_part;
	}

	return registration;
}

/**
 * Taken From - http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
 */
exports.isValidEmail = function(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Function to encode file data to base64 encoded string
 */
function base64_encode(file) {

    // read binary data
    let bitmap = fs.readFileSync(file);

    // convert binary data to base64 encoded string
    //return new Buffer(bitmap).toString('base64');
    //console.log(new Buffer.from(bitmap).toString('base64'));
    return new Buffer.from(bitmap).toString('base64');
}

// must match version in client side untilites for claiming to work
exports.demicrosoftize = function(str) {

    str = str.replace("\x82","'");
    str = str.replace("\x83","f");
    str = str.replace("\x84","\"");
    str = str.replace("\x85","...");
    str = str.replace("\x86","+");
    str = str.replace("\x87","#");
    str = str.replace("\x89","^");
    str = str.replace("\x8a","\xa6");
    str = str.replace("\x8b","<");
    str = str.replace("\x8c","\xbc");
    str = str.replace("\x8e","\xb4");
    str = str.replace("\x91","'");
    str = str.replace("\x92","'");
    str = str.replace("\x93","\"");
    str = str.replace("\x94","\"");
    str = str.replace("\x95","*");
    str = str.replace("\x96","-");
    str = str.replace("\x97","--");
    str = str.replace("\x98","~");
    str = str.replace("\x99","(TM)");
    str = str.replace("\x9a","\xa8");
    str = str.replace("\x9b",">");
    str = str.replace("\x9c","\xbd");
    str = str.replace("\x9e","\xb8");
    str = str.replace("\x9f","\xbe");

	str = str.replace(/[\u2018|\u2019|\u201A]/g, "\'");
	str = str.replace(/[\u201C|\u201D|\u201E]/g, "\"");
	str = str.replace(/\u2026/g, "...");
	str = str.replace(/[\u2013|\u2014]/g, "-");
	str = str.replace(/\u02C6/g, "^");
	str = str.replace(/\u2039/g, "");
	//str = str.replace(/\u2039/g, "<");
	str = str.replace(/\u203A/g, "");
	//str = str.replace(/\u203A/g, ">");
	str = str.replace(/[\u02DC|\u00A0]/g, " ");
	str = str.replace(/[\u2022|\u00B7|\u2024|\u2219|\u25D8|\u25E6]/g, "-");

	return str;
}

exports.encodeEmail = function(email, salt) {
	let hash = crypto.createHash('sha256', salt);
	hash.update(email+salt);
	let encodedemail = 'sha256$'+hash.digest('hex');
	return encodedemail;
}

exports.validateEncodedEmail = function(email, encodedemail, salt) {

	let emailok = false;

	let validatestring = email;
	let validatestringsalt = validatestring + salt;

	let emout = validatestring.toLowerCase();
	let emoutsalt = validatestringsalt.toLowerCase();

	let hash = crypto.createHash('sha256', salt);
	hash.update(emout);
	let hashsalt = crypto.createHash('sha256', salt);
	hashsalt.update(emoutsalt);
	let hashedemail = 'sha256$' + hash.digest('hex');
	let hashedemailsalt = 'sha256$' + hashsalt.digest('hex');

	hash = crypto.createHash('sha256', salt);
	hashsalt = crypto.createHash('sha256', salt);
	hash.update(validatestring);
	hashsalt.update(validatestring);
	let hashedemailassent = 'sha256$' + hash.digest('hex');
	let hashedemailassentsalt = 'sha256$' + hashsalt.digest('hex');

	if (hashedemail == encodedemail) {
		emailok = true;
	} else if (hashedemailassent == encodedemail) {
		emailok = true;
	} else if (hashedemailsalt == encodedemail) {
		emailok = true;
	} else if (hashedemailassentsalt == encodedemail) {
		emailok = true;
	}

	return emailok;
}

exports.canonicalise = async function(json, handler) {
	try {
		let options = {
			algorithm: cfg.canonicalizationAlgorithm,
			documentLoader: customLoader
		}
		const canonicalised = await jsonld.canonize(json, options);
		handler(null, canonicalised);
	} catch(err) {
		console.log(err);
		handler(new Error("Error converting badge JSON to n-triples"));
	}
}

exports.loadUrl = async function(url, handler) {
	try {
		const gotcustom = got.extend({
			headers: {'User-Agent': 'request'}
		});
		const response = await gotcustom.get(url);
		//console.log(response);
		handler(null, response);
	} catch (error) {
		console.log(error);
		handler(error);
	}
}

exports.saveUrlToFile = async function(url, filepath, handler) {
	try {
		const gotcustom = got.extend({
			headers: {'User-Agent': 'request'}
		});
		await pipeline(
		        gotcustom.stream(url),
		        fs.createWriteStream(filepath)
    	);
		//console.log(response);
		handler(null, "OK");
	} catch (error) {
		console.log(error);
		handler(error);
	}
}
