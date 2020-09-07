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

const fs = require( 'fs' );
var db = require('../db.js')
var cfg = require('../config.js');
var utilities = require('../models/utilities.js');

const { matchedData } = require('express-validator/filter');

/**
 * Get an Event statistics (used for the Leaderboard page).
 * @param id, Required. The identifier of the Event record you wish to retrieve statistics for.
 * @return JSON with Event statistic data or a JSON error object.
 */
exports.getPublicKey = function(req, res, next) {
	var data = matchedData(req);

	// should never need this as the check is done in the routes
	if (!data.id) {
		return res.status(400).send({"error": "You must include the issuer id"});
	}

	var query = 'SELECT * FROM issuers WHERE uniqueid = ?';
	db.get().query(query, [data.id], function (err, rows) {
		if (err) {
			console.log(err);
			res.status(404).send({error: "Error retrieving issuance record"});
		} else {
			if (rows.length > 0) {
				var json = {};
				json["@context"] = "https://w3id.org/openbadges/v2";
				json["type"] = "CryptographicKey";
				json["id"] = cfg.uri_stub + "keys/public/" + data.id;
				//json["owner"] = cfg.uri_stub + "endorsers/hosted/" + data.id;
				json["owner"] = cfg.uri_stub + "issuers/hosted/" + data.id;
				json["publicKeyPem"] = rows[0]["publickey"];

				res.send(json);

			} else {
				console.log("record does not exist");
				res.status(404).send({error: "Error finding matching issuer"});
			}
		}
	});

}

/*
exports.getPublicKeyJSON = function(req, res, next, handler) {
	fs.readFile(cfg.directorpath + 'keys/public-key.pem', function(err, data) {
    	handler(data.toString());
	});
}
*/
