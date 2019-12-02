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

/*
	//check('pendingissuanceid').withMessage('You must include the pending issuance id for the badge issuance you want to add evidence to'),

	check('url').withMessage('You must include the url to the evidence item you are adding to the badge'),
	check('name').withMessage('You must include a name for the evidence itemyou want to add to a badge'),

	check('description').optional(),
	check('narrative').optional(),
	check('genre').optional(),
	check('audience').optional(),
*/

let evidence_data_correct = {
  'badgeissuedid': '',
  'url': 'https://somesite.com/myfirstpresenation',
  'name': 'Presentation 1',
  'description': "My first Presentation",
  'narrative': 'This presenation involved a lot of slide preparation and talks in detail about the subject for 20 minutes.',
  'genre': 'Movie',
  'audience': 'everyone'
}

let evidence_data_no_url = {
  'name': 'Presentation 1',
  'description': "My first Presentation",
  'narrative': 'This presenation involved a lot of slide preparation and talks in detail about the subject for 20 minutes.',
  'genre': 'Movie',
  'audience': 'everyone'
}

let evidence_data_update = {
  'id': '',
  'url': 'https://somesite.com/myfirstpresenation44',
  'name': 'Presentation 44'
}

let evidence_data_delete = {
  'id': '',
}

var pendingissuanceid = "";

describe("Evidence", () => {
    describe("POST /badges/evidence/create with good data", () => {
        it("sign in and create an evidence item", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post('/badges/evidence/create')
						.set('Authorization', token)
						.send(evidence_data_correct)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(evidence_data_correct);
							}

							res.should.have.status(200);

							res.body.should.have.property('pendingissuanceid')

							evidenceid = res.body.pendingissuanceid;
							evidence_data_update.id = res.body.pendingissuanceid;
							evidence_data_delete.id = res.body.pendingissuanceid;

							res.body.should.have.property('timecreated');
							res.body.should.have.property('name');
							res.body.should.have.property('url');
							res.body.should.have.property('description');
							res.body.should.have.property('narrative');
							res.body.should.have.property('genre');
							res.body.should.have.property('audience');

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST /badges/evidence/update with good data", () => {
        it("should update an evidence record", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post('/badges/evidence/update')
						.set('Authorization', token)
						.send(evidence_data_update)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(evidence_data_update);
							}

							res.should.have.status(200);

							res.body.should.have.property('pendingissuanceid')
							res.body.should.have.property('timecreated');
							res.body.should.have.property('name');
							res.body.should.have.property('url');
							res.body.should.have.property('description');
							res.body.should.have.property('narrative');
							res.body.should.have.property('genre');
							res.body.should.have.property('audience');

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET /badges/evidence/list", () => {
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
						.get('/badges/evidence/list')
						.set('Authorization', token)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
							}

							res.should.have.status(200);
							res.body.should.have.property('alignments')

							done();
					});
			});
		}).timeout(100000);
	});

/*
    describe("POST /badges/create with missing url", () => {
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
						.post('/badges/evidence/create')
						.set('Authorization', token)
						.send(evidence_data_no_url)
						.end((err, res) => {
							res.should.have.status(404);

							done();
					});
			});
		}).timeout(100000);
	});
*/

/*
    describe("POST /badges/evidence/delete with good id", () => {
        it("should delete the evidence item with the given id, only if not already used to issue a badge", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post('/badges/evidence/delete')
						.set('Authorization', token)
						.send(evidence_data_delete)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(evidence_data_delete);
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