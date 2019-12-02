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

let issuer_data_correct = {
  'name': 'Institute of Coding',
  'websiteurl': 'https://instituteofcoding.org/',
  'email': 'ioc@bath.ac.uk',
  'description': 'Our mission is to break down barriers to digital learning and employment. We believe learning should be a lifelong process and that everyone has a right to improve their skills. We want to spread opportunity by offering access to education, providing what you need, when you need it, in a place you can reach.',
  'imageurl': 'https://instituteofcoding.open.ac.uk/wp-content/themes/ioc/assets/images/ioc-logo.png',
}

let alignment_data_correct = {
  'id': '1'
}

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
let badge_data_correct = {
  'id': '1',
  'title': 'Knowledge of Enterprise IT governance at level 5',
  'description': "Knowledge of the establishment and oversight of an organisation's approach to the use of Information systems and digital services, and associated technology, in line with the needs of the principal stakeholders of the organisation and overall organisational corporate governance requirements. The determination and accountability for evaluation of current and future needs; directing the planning for both supply and demand of these services; the quality, characteristics, and level of IT services; and for monitoring the conformance to obligations (including regulatory, legislation, control, and other standards) to ensure positive contribution of IT to the organisation's goals and objectives.",
  'imageurl': 'https://ioc.kmi.open.ac.uk/images/badges/GOVN_5_K.png',
  'criterianarrative': "The holder of this badge will have gained knowledge sufficient to underpin the activities specified in the following description. Reviews current and proposed information systems for compliance with the organisation's obligations (including legislation, regulatory, contractual and agreed standards/policies) and adherence to overall strategy. Provides specialist advice to those accountable for governance to correct compliance issues.",
  'version': '1',
  'issuerid': '7',
  'tags': 'harry1, george 1, fred1',
}

let badge_data_update = {
  'id': '',
  'title': 'Knowledge of Enterprise IT governance at level 5 44',
  'criterianarrative': "44 The holder of this badge will have gained knowledge sufficient to underpin the activities specified in the following description. Reviews current and proposed information systems for compliance with the organisation's obligations (including legislation, regulatory, contractual and agreed standards/policies) and adherence to overall strategy. Provides specialist advice to those accountable for governance to correct compliance issues.",
  'version': '1.0',
  'tags': 'harry2, george2',
}

let badge_data_delete = {
  'id': '',
}

// 404
let badge_data_incorrect_issuer = {
  'id': '1',
  'title': 'Knowledge of Enterprise IT governance at level 5',
  'description': "Knowledge of the establishment and oversight of an organisation's approach to the use of Information systems and digital services, and associated technology, in line with the needs of the principal stakeholders of the organisation and overall organisational corporate governance requirements. The determination and accountability for evaluation of current and future needs; directing the planning for both supply and demand of these services; the quality, characteristics, and level of IT services; and for monitoring the conformance to obligations (including regulatory, legislation, control, and other standards) to ensure positive contribution of IT to the organisation's goals and objectives.",
  'imageurl': 'https://ioc.kmi.open.ac.uk/images/badges/GOVN_5_K.png',
  'criteria': 'https://ioc.kmi.open.ac.uk/criteria/ioc_criteria_1',
  'criterianarrative': "The holder of this badge will have gained knowledge sufficient to underpin the activities specified in the following description. Reviews current and proposed information systems for compliance with the organisation's obligations (including legislation, regulatory, contractual and agreed standards/policies) and adherence to overall strategy. Provides specialist advice to those accountable for governance to correct compliance issues.",
  'version': '1',
  'issuerid': '1',
}

//var badgeaddress = "";
let badge_alignment_data = {
  'id': '1',
  'badgeaddress': '',
  'alignmentaddress': ''
}


var badgeid = "";

describe("Badges", () => {
    describe("POST /badges/create with good data", () => {
        it("sign in and create badge and criteria", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post('/badges/create')
						.set('Authorization', token)
						.send(badge_data_correct)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(badge_data_correct);
							}

							res.should.have.status(200);

							res.body.should.have.property('id')

							badgeid = res.body.id;
							badge_data_correct.id = res.body.id;
							badge_data_update.id = res.body.id;
							badge_data_delete.id = res.body.id;

							res.body.should.have.property('timecreated')
							res.body.should.have.property('badgeuniqueid')
							res.body.should.have.property('version')
							res.body.should.have.property('title')
							res.body.should.have.property('description')
							res.body.should.have.property('imageurl')
							res.body.should.have.property('issuerid')

							res.body.should.have.property('criteriaid')
							res.body.should.have.property('criteriauniqueid')
							res.body.should.have.property('criterianarrative')

							res.body.should.have.property('tags')

							badgeid = res.body.id;

							done();
					});
			});
		}).timeout(100000);
	});
/*
    describe("POST /badges/update with good data", () => {
        it("should update a badge record", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post('/badges/update')
						.set('Authorization', token)
						.send(badge_data_update)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(badge_data_update);
							}

							res.should.have.status(200);

							res.body.should.have.property('id')
							res.body.should.have.property('timecreated')
							res.body.should.have.property('badgeuniqueid')
							res.body.should.have.property('version')
							res.body.should.have.property('title')
							res.body.should.have.property('description')
							res.body.should.have.property('imageurl')
							res.body.should.have.property('issuerid')

							res.body.should.have.property('criteriaid')
							res.body.should.have.property('criteriauniqueid')
							res.body.should.have.property('criterianarrative')

							res.body.should.have.property('tags')

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET /badges/id/:id - to get previously created badge", () => {
        it("sign in and get badge by id", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get('/badges/id/'+badge_data_correct.id)
						.set('Authorization', token)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(badge_data_correct.id);
							}

							res.should.have.status(200);

							res.body.should.have.property('id')
							res.body.should.have.property('timecreated')
							res.body.should.have.property('badgeuniqueid')
							res.body.should.have.property('version')
							res.body.should.have.property('title')
							res.body.should.have.property('description')
							res.body.should.have.property('imageurl')
							res.body.should.have.property('issuerid')

							res.body.should.have.property('criteriaid')
							res.body.should.have.property('criteriauniqueid')
							res.body.should.have.property('criterianarrative')

							res.body.should.have.property('tags')

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET /badges/list", () => {
        it("sign in and get a list of all badges for the current user", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get('/badges/list')
						.set('Authorization', token)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
							}

							res.should.have.status(200);
							res.body.should.have.property('badges')

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET /badges/listall", () => {
        it("sign in and get a list of all badges in the system", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get('/badges/listall')
						.set('Authorization', token)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
							}

							res.should.have.status(200);
							res.body.should.have.property('badges')

							done();
					});
			});
		}).timeout(100000);
	});
*/

/*
    describe("POST /badges/create with incorrect issuer id", () => {
        it("login and return a 404", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post('/badges/create')
						.set('Authorization', token)
						.send(badge_data_incorrect_issuer)
						.end((err, res) => {
							res.should.have.status(404);

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET /badges/badges/:address with a good address", () => {
        it("sign in and get badges by address", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get('/badges/badges/'+badgeaddress)
						.set('Authorization', token)
						.end((err, res) => {
							res.should.have.status(200);

							res.body.should.have.property('address');
							res.body.should.have.property('owner');
							res.body.should.have.property('title');
							res.body.should.have.property('description');
							res.body.should.have.property('imageurl');
							res.body.should.have.property('imagecaption');
							res.body.should.have.property('imageauthor');
							res.body.should.have.property('issuer');
							res.body.should.have.property('alignment');
							res.body.should.have.property('criteria');
							res.body.should.have.property('criteriaowner');
							res.body.should.have.property('criteriaid');
							res.body.should.have.property('criteriatype');
							res.body.should.have.property('criterianarrative');
							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET /badges/badges/:address with bad address", () => {
        it("sign in and return a 404", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get('/badges/badges/'+badbadgeaddress)
						.set('Authorization', token)
						.end((err, res) => {
							res.should.have.status(404);
							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET /badges/badges/transaction/:address with a good address", () => {
        it("sign in and return transaction details", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get('/badges/badges/transaction/'+badgeaddress)
						.set('Authorization', token)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.have.property('transaction')

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET /badges/badges/transaction/:address with a bad address", () => {
        it("sign in and return a 404", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get('/badges/badges/transaction/'+badbadgeaddress)
						.set('Authorization', token)
						.end((err, res) => {
							res.should.have.status(404);

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST /badges/badges/addalignment", () => {
        it("sign in and add an alignment to the badge", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post('/badges/badges/addalignment')
						.set('Authorization', token)
						.send(badge_alignment_data)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.have.property('transaction')

							done();
					});
			});
		}).timeout(100000);
	});
*/

/*
    describe("POST /badges/delete with good id", () => {
        it("should delete the badge with the given id, only if not already used to issue a badge", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post('/badges/delete')
						.set('Authorization', token)
						.send(badge_data_delete)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(badge_data_delete);
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