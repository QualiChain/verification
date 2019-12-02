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
/** Author: Manoharan Ramachandran, KMi, The Open University **/
/** Author: Kevin Quick, KMi, The Open University **/

var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../apptest.js');

// Configure chai
chai.use(chaiHttp);
chai.should();
var expect = chai.expect;

let login_details_correct = {
  'username': 'ioc@kmi.open.ac.uk',
  'password': '10CM00d13b10cKcH@16n'
}

let login_details_fail_password_len = {
  'username': 'fred@open.ac.uk',
  'password': 'fred'
};

let login_details_fail_username_email = {
  'username': 'fred',
  'password': 'fredderick'
};

let login_details_fail_account_exists = {
  'username': 'fred@open.ac.uk',
  'password': 'fredderick'
};

describe("Users", () => {

    // Test login that works
    describe("POST /badges/users/signin - with correct data", () => {
        it("should return a login token", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {

					console.log(res.error);

					console.log("STATUS:"+res.status);

                     res.should.have.status(201);
                     res.body.should.be.a('object');
					 res.body.should.have.property('token');
                     done();
                });
         });
    });

    // Test login with no parameters - should be caught by controller checking parameters
    describe("POST /badges/users/signin with good data - Test login with no parameters - should be caught by controller checking parameters", () => {
        it("login and return 422 error", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send({ username: '', password: '' })
                .end((err, res) => {
                     res.should.have.status(422);
                     res.body.should.be.a('object');
                     done();
                });
         });
    });

    // Test login with email address but password too short
    describe("POST /badges/users/signin - login with too short a password", () => {
        it("login and return a 422", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_fail_password_len)
                .end((err, res) => {

                     console.log(res.error);
                     //{"errors":{"password":{"location":"body","param":"password","value":"fred","msg":"passwords must be at least 8 chars long"}}}

                     res.should.have.status(422);
					 res.error.should.not.be.empty;
                     res.body.should.be.a('object');
                     done();
                });
         });
    });

    // Test login with username as not an email address but password correct length
    describe("POST /badges/users/signin - login with non email username but 8 character password", () => {
        it("Login and return a 422", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_fail_username_email)
                .end((err, res) => {

                     console.log(res.error);
                     //{"errors":{"username":{"location":"body","param":"username","value":"fred","msg":"must be an email"}}}

                     res.should.have.status(422);
					 res.error.should.not.be.empty;
                     res.body.should.be.a('object');
                     done();
                });
         });
	});

    // Test login with unregistered user but details correct format
    describe("POST /badges/users/signin - Unregistered login details", () => {
        it("Sign in and return a 401", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_fail_account_exists)
                .end((err, res) => {
                     res.should.have.status(401);

                     console.log(res.error);
                     //{"error":"The username given does not exist"}

					 res.error.should.not.be.empty;
                     res.body.should.be.a('object');
                     done();
                });
         });
    });
});