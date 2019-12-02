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

var cfg = require('../config.js');
var fs = require('fs');
var ipfsAPI = require('ipfs-api');

const http = require('http');
const { matchedData } = require('express-validator/filter');

var ipfsurl = cfg.ipfs_url_stub;
var ipfs = ipfsAPI(cfg.ipfs_api_domain, cfg.ipfs_api_port, {protocol: cfg.ipfs_api_transport});

/**
 * Upload a file to IPFS and return the ipfs webpage with the IPFS hash for the file passed in
 */
exports.getUploadToIPFSWeb = function(req, res, next) {
	if (!req.files) {
		return res.status(400).send('No files were uploaded.');
	} else {

		//console.log(req.files);

		// The name of the input field (i.e. "getUploadToIPFS") is used to retrieve the uploaded file
		let ipfsfile = req.files.ipfsfile;

		//console.log(ipfsfile);

		//var appDir = path.dirname(require.main.filename);
		var path = cfg.directorpath+"public/uploads/"+ipfsfile.name;

		// Use the mv() method to place the file somewhere on your server
		ipfsfile.mv(path, function(err) {
			if (err) {
				var reply = {};
				reply.error = err;
				var stringreply = JSON.stringify(reply);
				return res.render('ipfs', { response: stringreply });

				//return res.status(500).send(err);
			}

			// add to ipfs
			ipfs.util.addFromFs(path, { recursive: false }, (err, result) => {
				if (err) {
					var reply = {};
					reply.error = err;
					var stringreply = JSON.stringify(reply);
					return res.render('ipfs', { response: stringreply });
					//return res.status(500).send(err);
				}
				console.log(result);
				console.log("SOURCE FILE HASH = " + result[0].hash);
				deleteFile(path);

				var viewpath = ipfsurl+result[0].hash;
				console.log(viewpath);

				var reply = {};
				reply.hash = result[0].hash;
				reply.url = viewpath;

				var stringreply = JSON.stringify(reply, undefined, 6);

				return res.render('ipfs', { response: stringreply });
				//res.send('File uploaded!');
			});
  		});
	}
}

/**
 * Upload a file to IPFS and return the ipfs hash for the file
 */
exports.getUploadToIPFS = function(req, res, next) {
	if (!req.files) {
		return res.status(400).send('No files were uploaded.');
	} else {

		console.log(req.files);

		// The name of the input field (i.e. "getUploadToIPFS") is used to retrieve the uploaded file
		let ipfsfile = req.files.ipfsfile;

		console.log(ipfsfile);

		//var appDir = path.dirname(require.main.filename);
		var path = cfg.directorpath+"public/uploads/"+ipfsfile.name;

		// Use the mv() method to place the file somewhere on your server
		ipfsfile.mv(path, function(err) {
			if (err) {
				return res.status(404).send({error: err});
			}

			// add to ipfs
			ipfs.util.addFromFs(path, { recursive: false }, (err, result) => {
				if (err) {
					return res.status(404).send({error: err});
				}
				console.log(result);
				console.log("SOURCE FILE HASH = " + result[0].hash);
				deleteFile(path);

				var viewpath = ipfsurl+result[0].hash;
				console.log(viewpath);

				var reply = {};
				reply.hash = result[0].hash;
				reply.url = viewpath;

				res.send(reply);
			});
  		});
	}
}

exports.getFileFromIPFS = function(req, res, next) {
	var data = matchedData(req);
	if (!data.ipfshash) {
		return res.status(400).send({error: "You must include the has of the file want to get from ipfs"});
	}

	req.flagCheck = null;
	res.locals.errormsg = "";
	res.locals.finished = false;
	res.locals.ipfsindexdata = {};

	var url = ipfsurl + data.ipfshash;
	//console.log(url);
	http.get(url, (resp) => {
	  let dat = '';

	  // A chunk of data has been recieved.
	  resp.on('data', (chunk) => {
		dat += chunk;
	  });

	  // The whole response has been received. Print out the result.
	  resp.on('end', () => {
		res.locals.ipfsindexdata = JSON.parse(dat);
		res.locals.finished = true;

	  });

	}).on("error", (err) => {
		return res.status(400).send({error: err.message});
	});


	req.flagCheck = setInterval(function() {
		if (res.locals.finished) {
			clearInterval(req.flagCheck);
			res.send(res.locals.ipfsindexdata);
		} else if (res.locals.errormsg != "") {
			clearInterval(req.flagCheck);
			res.status(404).send({error: res.locals.errormsg});
		}
	}, 100); // interval set at 100 milliseconds
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