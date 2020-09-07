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
/** Author: Manoharan Ramachandran, KMi, The Open University **/
/** Author: Kevin Quick, KMi, The Open University **/

var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../apptest.js');
const cfg = require('../config.js');

// Configure chai
chai.use(chaiHttp);
chai.should();
var expect = chai.expect;

describe("Portfolio", () => {

    describe("GET "+cfg.proxy_path+cfg.badges_path+"/portfolio", () => {
        it("sign in and get the recipient's home/portfolio page", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;
					chai.request(app)
						.get(cfg.proxy_path+cfg.badges_path+'/portfolio/')
						.set('Authorization', token)
						.end((err, res) => {
							res.should.have.status(200);
							res.should.be.html;

							// template system means actual page content only loaded on browser
							// so can't test much server side except that the title is the right one at least.
							res.text.should.contain('<title>My Badges</title>');

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET "+cfg.proxy_path+cfg.badges_path+"/portfolio", () => {
        it("try andget the recipient's home/portfolio page without signing in - should get signin page", (done) => {
			chai.request(app)
				.get(cfg.proxy_path+cfg.badges_path+'/portfolio/')
				.end((err, res) => {
					res.should.have.status(200);
					res.should.be.html;

					// template system means actual page content only loaded on browser
					// so can't test much server side except that the title is the right one at least.
					res.text.should.contain('<title>Sign In</title>');

					done();
			});
		}).timeout(100000);
	});
});