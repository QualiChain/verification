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

const express = require('express');
const router = express.Router();

const { check } = require('express-validator/check');
const puppeteer = require('puppeteer');

router.get('/issuers/information', function(req, res, next) {
	(async () => {
		const browser = await puppeteer.launch({
			pipe: false,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		//const browser = await puppeteer.launch({pipe: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
		const page = await browser.newPage();-
		await page.goto(cfg.uri_stub+'issuers/information/', {waitUntil: 'networkidle0'});
		buffer = await page.pdf({printBackground: true, displayHeaderFooter:true, format: 'A4'});
        res.type('application/pdf');
        res.send(buffer);
		await browser.close();
	})();
});

router.get('/issuers/guide', function(req, res, next) {
	(async () => {
		const browser = await puppeteer.launch({
			pipe: false,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		//const browser = await puppeteer.launch({pipe: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
		const page = await browser.newPage();-
		await page.goto(cfg.uri_stub+'issuers/guide/', {waitUntil: 'networkidle0'});
		buffer = await page.pdf({printBackground: true, displayHeaderFooter:true, format: 'A4'});
        res.type('application/pdf');
        res.send(buffer);
		await browser.close();
	})();
});

router.get('/recipients/information', function(req, res, next) {
	(async () => {
		const browser = await puppeteer.launch({
			pipe: false,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		//const browser = await puppeteer.launch({pipe: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
		const page = await browser.newPage();-
		await page.goto(cfg.uri_stub+'recipients/information/', {waitUntil: 'networkidle0'});
		buffer = await page.pdf({printBackground: true, displayHeaderFooter:true, format: 'A4'});
        res.type('application/pdf');
        res.send(buffer);
		await browser.close();
	})();
});

module.exports = router;