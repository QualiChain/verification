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

var mysql = require('mysql');
var cfg = require('./config.js');

var PRODUCTION_DB = cfg.db.database_production;
var TEST_DB = cfg.db.database_test;

exports.MODE_TEST = 'mode_test';
exports.MODE_PRODUCTION = 'mode_production';

var state = {
	pool: null,
	mode: null,
};

exports.connect = function(mode, done) {

	//https://github.com/mysqljs/mysql/issues/708
	var options = {
		host: cfg.db.host,
		user: cfg.db.user,
		password: cfg.db.password,
		database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB
	}

	try {
		state.pool = mysql.createPool(options);
		state.mode = mode;

		state.pool.on('connection', function(connection) {
			console.log('Connected to MySql db');
		});

		state.pool.on('error', function(err) {
			console.log("MySql db error:");
			console.log(err);
			//console.error(new Date(), 'MySql db error', err);
		});

		done();
	} catch(e) {
		console.log("MySql db error catch:");
		console.log(e);
		done(e);
	}
};

exports.get = function() {
	return state.pool;
}

exports.getMode = function() {
	return state.mode;
}
