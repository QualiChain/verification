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

/*
	check('id').withMessage('You must include your reference id for the new badge'),
	check('title').withMessage('You must include a title for the new badge'),
	check('description').withMessage('You must include a description for the new badge'),
	check('imageurl').isURL({require_tld: false}).withMessage('You must include an image url for the new badge'),
	check('criteria').optional().isURL({require_tld: false}).withMessage('Your criteria must be a valid url'),
	check('criterianarrative').optional(),
	check('version').optional(),
	check('imagecaption').optional(),
	check('imageauthor').optional(),

	// should check it exists
	check('issueraddress').withMessage('You must include an issuer contract blockchain address for the new badge'),
*/

let assertion_data_no_badge = {
  'recipientid': '4220',
}

let assertion_data_correct = {
  'badgeid': '5106',
  'recipientid': '4220',
}

let assertion_data_update_recipientid = {
  'id': '',
  'recipientid': '4235',
}

let assertion_data_update_badgeid = {
  'id': '',
  'badgeid': '5101',
}

let assertion_data_update = {
  'id': '',
  'badgeid': '5106',
  'recipientid': '4220',
}

let assertion_data_delete = {
  'id': '',
}

// TEST ADDING, REMOVING, LISTING ENDORSERS ON AN ASSERTION

let assertion_endorser_add = {
  'id': '',
  'endorserid': '16',
}

let assertion_endorser_remove = {
  'id': '',
  'endorserid': '16',
}

let assertion_issue = {
  'id': '31',
}

var assertionid = "";
var assertion_endorserid = "";

describe("Assertions", () => {

	    describe("POST "+cfg.proxy_path+"/assertions/issue ", () => {
	        it("sign in and create assertion", (done) => {
				chai.request(app)
				    .post(cfg.proxy_path+'/users/signin')
				    .send(login_details_correct)
	                .end((err, res) => {
						res.should.have.status(201);
						res.body.should.be.a('object');
						res.body.should.have.property('token');

						let token = res.body.token;

						chai.request(app)
							.post(cfg.proxy_path+'/assertions/issue')
							.set('Authorization', token)
							.send(assertion_issue)
							.end((err, res) => {

								if (res.error) {
									console.log(res.error);
									console.log(assertion_issue);
								} else {
									console.log(res.body);
								}

								res.should.have.status(200);

								res.body.should.have.property('id')
								res.body.should.have.property('timecreated')
								res.body.should.have.property('uniqueid')
								res.body.should.have.property('badgeid')
								res.body.should.have.property('recipientid')
								res.body.should.have.property('issuedon')
								res.body.should.have.property('tokenmetadataurl')
								res.body.should.have.property('blockchainaddress')
								res.body.should.have.property('transaction')
								res.body.should.have.property('tokenid')
								res.body.should.have.property('revokedreason')
								res.body.should.have.property('status')

								done();
						});
				});
			}).timeout(100000);
	});

	/*
    describe("POST "+cfg.proxy_path+"/assertions/create with good data", () => {
        it("sign in and create assertion", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/assertions/create')
						.set('Authorization', token)
						.send(assertion_data_correct)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(assertion_data_correct);
							} else {
								console.log(res.body);
							}

							res.should.have.status(200);

							res.body.should.have.property('id')

							assertionid = res.body.id
							assertion_data_update_recipientid.id = res.body.id;
							assertion_data_update_badgeid.id =  res.body.id;
							assertion_data_update.id = res.body.id;
							assertion_data_delete.id = res.body.id;
							assertion_endorser_add.id =  res.body.id;
							assertion_endorser_list =  res.body.id;

							res.body.should.have.property('id')
							res.body.should.have.property('timecreated')
							res.body.should.have.property('uniqueid')
							res.body.should.have.property('badgeid')
							res.body.should.have.property('recipientid')
							res.body.should.have.property('issuedon')
							res.body.should.have.property('tokenmetadataurl')
							res.body.should.have.property('blockchainaddress')
							res.body.should.have.property('transaction')
							res.body.should.have.property('tokenid')
							res.body.should.have.property('revokedreason')
							res.body.should.have.property('status')

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST "+cfg.proxy_path+"/assertions/update recipientid", () => {
        it("should update an assertion record", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/assertions/update')
						.set('Authorization', token)
						.send(assertion_data_update_recipientid)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(assertion_data_update_recipientid);
							}

							res.should.have.status(200);

							res.body.should.have.property('id')
							res.body.should.have.property('timecreated')
							res.body.should.have.property('uniqueid')
							res.body.should.have.property('badgeid')
							res.body.should.have.property('recipientid')
							res.body.should.have.property('issuedon')
							res.body.should.have.property('tokenmetadataurl')
							res.body.should.have.property('blockchainaddress')
							res.body.should.have.property('transaction')
							res.body.should.have.property('tokenid')
							res.body.should.have.property('revokedreason')
							res.body.should.have.property('status')

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST "+cfg.proxy_path+"/assertions/update badgeid", () => {
        it("should update an assertion record", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/assertions/update')
						.set('Authorization', token)
						.send(assertion_data_update_badgeid)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(assertion_data_update_badgeid);
							}

							res.should.have.status(200);

							res.body.should.have.property('id')
							res.body.should.have.property('timecreated')
							res.body.should.have.property('uniqueid')
							res.body.should.have.property('badgeid')
							res.body.should.have.property('recipientid')
							res.body.should.have.property('issuedon')
							res.body.should.have.property('tokenmetadataurl')
							res.body.should.have.property('blockchainaddress')
							res.body.should.have.property('transaction')
							res.body.should.have.property('tokenid')
							res.body.should.have.property('revokedreason')
							res.body.should.have.property('status')

							done();
					});
			});
		}).timeout(100000);
	});

*/

/*
    describe("POST "+cfg.proxy_path+"/assertions/update badgeid and recipient", () => {
        it("should update an assertion record", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/assertions/update')
						.set('Authorization', token)
						.send(assertion_data_update)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(assertion_data_update);
							}

							res.should.have.status(200);

							res.body.should.have.property('id')
							res.body.should.have.property('timecreated')
							res.body.should.have.property('uniqueid')
							res.body.should.have.property('badgeid')
							res.body.should.have.property('recipientid')
							res.body.should.have.property('issuedon')
							res.body.should.have.property('tokenmetadataurl')
							res.body.should.have.property('blockchainaddress')
							res.body.should.have.property('transaction')
							res.body.should.have.property('tokenid')
							res.body.should.have.property('revokedreason')
							res.body.should.have.property('status')

							done();
					});
			});
		}).timeout(100000);
	});
*/
/*
    describe("GET "+cfg.proxy_path+"/assertions/id/:id - to get previously created badge", () => {
        it("sign in and get assertion by id", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get(cfg.proxy_path+'/assertions/id/'+assertionid)
						.set('Authorization', token)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(assertionid);
							}

							res.should.have.status(200);

							res.body.should.have.property('id')
							res.body.should.have.property('timecreated')
							res.body.should.have.property('uniqueid')
							res.body.should.have.property('badgeid')
							res.body.should.have.property('recipientid')
							res.body.should.have.property('issuedon')
							res.body.should.have.property('tokenmetadataurl')
							res.body.should.have.property('blockchainaddress')
							res.body.should.have.property('transaction')
							res.body.should.have.property('tokenid')
							res.body.should.have.property('revokedreason')
							res.body.should.have.property('status')

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET "+cfg.proxy_path+"/assertions/list", () => {
        it("sign in and get a list of all assertions for the current user", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get(cfg.proxy_path+'/assertions/list')
						.set('Authorization', token)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
							}

							res.should.have.status(200);
							res.body.should.have.property('items');

							// EACH ITEM SHOULD BE
							//res.body.should.have.property('id')
							//res.body.should.have.property('timecreated')
							//res.body.should.have.property('uniqueid')
							//res.body.should.have.property('badgeid')
							//res.body.should.have.property('recipientid')
							//res.body.should.have.property('issuedon')
							//res.body.should.have.property('tokenmetadataurl')
							//res.body.should.have.property('blockchainaddress')
							//res.body.should.have.property('transaction')
							//res.body.should.have.property('tokenid')
							//res.body.should.have.property('revokedreason')
							//res.body.should.have.property('status')

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST "+cfg.proxy_path+"/assertions/addendorser with good data", () => {
        it("should add an endorser to an assertion", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/assertions/addendorser')
						.set('Authorization', token)
						.send(assertion_endorser_add)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(assertion_endorser_add);
							}

							res.should.have.status(200);

							res.body.should.have.property('id');

							assertion_endorserid =  res.body.id;

							res.body.should.have.property('timecreated');
							res.body.should.have.property('badgeissuedid');
							res.body.should.have.property('endorserid');
							res.body.should.have.property('status');

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST "+cfg.proxy_path+"/assertions/listendorsers", () => {
        it("should sign in and get a list of endorsers for the given assertion id", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get(cfg.proxy_path+'/assertions/listendorsers/'+assertionid)
						.set('Authorization', token)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(assertionid);
							}

							res.should.have.status(200);
							res.body.should.have.property('items');

							//Each with the following properties

							//res.body.should.have.property('id');
							//res.body.should.have.property('timecreated');
							//res.body.should.have.property('badgeissuedid');
							//res.body.should.have.property('endorserid');
							//res.body.should.have.property('status');

							done();
					});
			});
		}).timeout(100000);
	});
	*/

/* TESTED BUT REMOVED TO KEEP RECORDS

    describe("POST "+cfg.proxy_path+"/assertions/removeendorser", () => {
        it("should remove an endorser from an assertion record", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/assertions/removeendorser')
						.set('Authorization', token)
						.send(assertion_endorser_remove)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(assertion_endorser_remove);
							}

							res.should.have.status(200);

							res.body.should.have.property('id');
							res.body.should.have.property('status'); // should be -1

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST "+cfg.proxy_path+"/assertions/delete with good id", () => {
        it("should delete the assertion with the given id, only if not already issued", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/assertions/delete')
						.set('Authorization', token)
						.send(assertion_data_delete)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(assertion_data_delete);
							}

							res.should.have.status(200);

							res.body.should.have.property('id')
							res.body.should.have.property('status')

							done();
					});
			});
		}).timeout(100000);
	});
*/
});