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
/** Author: Kevin Quick, KMi, The Open University **/

var cfg = require('./config.js');
const fs = require( 'fs' );

// Create web3 instance
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider(cfg.parity_ipc_path));


/**
 * Transfer funds between data.from and data.to accounts, to the value of data.amount (given in ether)
 * Calls the return handler, with new data properties: data.frombalance (before transfer), data.tobalance (before transfer),
 * data.tx (the funds transfer transaction number) and/or res.locals.errormsg is set to a message if somethig went wrong.
 */
exports.transferFunds = function(req, res, callback, data, returnhandler) {

	data.wei = web3.utils.toWei(data.amount.toString());

	//console.log(data.wei);
	//console.log(data.from);
	//console.log(data.to);

	web3.eth.getBalance(data.from)
		.then(function(balance){
			var wei = balance;
			data.frombalance = web3.utils.fromWei(wei, "ether");
			console.log("From Balance = " + data.frombalance + " ether");

			if (parseInt(data.frombalance) < parseInt(data.amount)) {
				res.locals.errormsg = "insufficient funds in the from address";
			} else {
				web3.eth.getBalance(data.to)
					.then(function(balance2){
						var weito = balance2;
						data.tobalance = web3.utils.fromWei(weito, "ether");
						console.log("To Balance = " + data.tobalance + " ether");

						web3.eth.sendTransaction({from: data.from, to: data.to, value: data.wei})
						.on('receipt', function(receipt) {
							console.log("Transfer result: ");
							console.log(receipt);

							if (receipt.status == "0x0") {
								console.log("Funds transfer transaction failed");
								res.locals.errormsg = "Funds transfer transaction failed";
							} else {
								data.tx = receipt.transactionHash;
								returnhandler(req, res, callback, data);
							}
						})
						.on('error', function(error3) {
							console.log("Transfer error: " + error3);
							res.locals.errormsg = "Transfer error: " + error3;
						});
					}).catch((error2) => {
						console.log("get to account balance error: "+error2);
						res.locals.errormsg = error2;
					});
			}
		}).catch((error) => {
			console.log("get from account balance error: "+error);
			res.locals.errormsg = error;
		});
}


/**
 * Create a new blockchain account using the given data.accountname and data.accountpassword
 * Calls the return handler, with new data properties: data.account, data.secretphrase or data.error array if things went wrong.
 */
exports.createAccount = function(req, res, callback, data, handler) {

	var util = require('util');
	var exec = require('child_process').exec;
	data.error = [];

	var command = 'curl --data \'{"method":"parity_generateSecretPhrase","params":[],"id":1,"jsonrpc":"2.0"}\' -H "Content-Type: application/json" -X POST '+cfg.rpcapi+':'+cfg.rpcport;
	child = exec(command, function(e, stdout, stderr){
		if(e !== null) {
			//console.log('stderr: ' + stderr);
			//console.log('exec error: ' + e);
			data.error.push(e);
		} else {
			data.secretphrase = JSON.parse(stdout).result;

			var command2 = 'curl --data \'{"method":"parity_newAccountFromPhrase","params":["'+data.secretphrase+'","'+data.accountpassword+'"],"id":1,"jsonrpc":"2.0"}\' -H "Content-Type: application/json" -X POST '+cfg.rpcapi+':'+cfg.rpcport;
			child2 = exec(command2, function(e2, stdout2, stderr2){
				if(e2 !== null) {
					//console.log('stderr2: ' + stderr2);
					//console.log('exec error2: ' + e2);
					data.error.push(e2);
				} else {
					var newaccount = JSON.parse(stdout2).result;
					data.account = web3.utils.toChecksumAddress(newaccount); // Parity account creation does not return checksummed accounts yet - 10/10/2019
					//console.log(data.account);

					// single speach marks upset parity or curl
					var accountname = data.accountname.replace(/\'/g, ' ');

					var command3 = 'curl --data \'{"method":"parity_setAccountName","params":["'+data.account+'","'+accountname+'"],"id":1,"jsonrpc":"2.0"}\' -H "Content-Type: application/json" -X POST '+cfg.rpcapi+':'+cfg.rpcport;
					child3 = exec(command3, function(e3, stdout3, stderr3){
						if(e3 !== null) {
							//console.log('stderr3: ' + stderr3);
							//console.log('exec error3: ' + e3);
							data.error.push(e3);

						} else {
							data.message = JSON.parse(stdout3);
							//console.log(stdout3);

							handler(req, res, callback, data);
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
 * Call return handler with data.error string set to a message if something went wrong.
 */
exports.topUpAccount = function(req, res, callback, data, handler, account){

	var minimumAccountBalanceWei = parseInt(web3.utils.toWei(cfg.minimumAccountBalance.toString(), "ether"));
	var optimumAccountBalanceWei = parseInt(web3.utils.toWei(cfg.optimumAccountBalance.toString(), "ether"));

	data.error = "";

	web3.eth.getBalance(account)
		.then(function(balance){
			var wei = parseInt(balance);

			if (wei < minimumAccountBalanceWei) {
				//console.log("topUpAccount");
				//console.log(account);
				//console.log(balance);

				req.topup = optimumAccountBalanceWei - wei;
				console.log("Topping up account with an extra " + req.topup + " wei");

				web3.eth.sendTransaction({from: cfg.systemBankAccount, to: account, value: req.topup.toString()})
					.on('receipt', function(receipt) {
						console.log("TopUp Transfer result: ");
						console.log(receipt);
						if (receipt.status == "0x0") {
							console.log("Funds transfer transaction failed");
							data.error = "Funds transfer transaction failed";
							handler(req, res, callback, data);
						} else {
							handler(req, res, callback, data);
						}
					})
					.on('error', function(error) {
						console.log("Transfer error: " + error);
						data.error = "Transfer error: " + error;
						handler(req, res, callback, data);
					});
			} else {
				//console.log("Sufficient balance - no top up needed");
				handler(req, res, callback, data);
			}
		}).catch((error) => {
			console.log("topUpAccount error: "+error);
			data.error = "getBalance error: " + error;
			handler(req, res, callback, data);
		});
}

/**
 * Unlock the given account with the given password
 * Call the return handler once account unlocked
 */
exports.unlockAccount = function(req, res, callback, data, returnhandler, account, accountpassword){

	// check if account needs toppping up before unlocking it
	var thishandler = function (req, res, callback, data) {
		if (data.error === undefined || data.error == "") {

			//if no password given assume nothing needs unlocking, just continue on.
			if (!accountpassword || accountpassword == "") {
				returnhandler(req, res, callback);
			} else {
				var innerhandler = function (e, result) {
					if (!e) {
						console.log("Unlocked " + account);
						returnhandler(req, res, callback, data);
						return;
					} else {
						console.error("Error unlocking " + account + " = "+e);
						res.locals.errormsg = e;
					}
				};
				web3.eth.personal.unlockAccount(account, accountpassword, innerhandler);
			}
		} else {
			res.locals.errormsg = data.error;
		}
	}

	if (account != cfg.systemBankAccount) {
		exports.topUpAccount(req, res, callback, data, thishandler, account);
	} else {
		thishandler(req, res, callback, data);
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

	var exists = false;
	var error = "";

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

	var registration = "";
	var newlength = 0;
	while(newlength < keylength) {
		var part = rand(1,3);

		var a,b;
		if(part==1){a=48;b=57;}  // Numbers
		if(part==2){a=65;b=90;}  // UpperCase
		if(part==3){a=97;b=122;} // LowerCase

		var code_part=String.fromCharCode(rand(a,b));
		newlength = newlength + 1;
		registration = registration+code_part;
	}

	return registration;
}

/**
 * Taken From - http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
 */
exports.isValidEmail = function(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
    var bitmap = fs.readFileSync(file);

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