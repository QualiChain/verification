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

/*
router.get('/', [
	check('token').optional(),
],	endorser_controller.getEndorserPage);

router.get('/manage', [
	check('token').optional(),
],	endorser_controller.getEndorserManagementPage);

router.get('/docs', function(req, res, next) {
	res.render('docsendorsers', { title: 'Endorser API Documentation' });
});

router.get('/list', [
	check('token').optional(),
], endorser_controller.listEndorsers);

router.post('/create', [
	check('token').optional(),
    check('name').withMessage('You must include a name for the endorser'),
	check('loginemail').isEmail().withMessage('Please include a valid email address for creating the endorser account'),

	check('url').isURL({require_tld: false}).withMessage('You must include a website url for the endorser to go into the badge data'),
	check('email').isEmail().withMessage('Please include a valid email address for the endorsement badge data'),

    check('telephone').optional(),
    check('description').optional(),
    check('imageurl').optional().isURL({require_tld: false}).withMessage('Please include a valid image url'),
], endorser_controller.createEndorser);

router.get('/completeregistration', [
    check('id').withMessage('You must include the id of the user to complete registation for'),
    check('key').withMessage('You must include the key'),

], endorser_controller.completeRegistration);

router.post('/update', [
	check('token').optional(),
    check('id').withMessage('You must include the id of the endorser to update'),
    check('name').optional(),
    check('description').optional(),
	check('url').optional().isURL({require_tld: false}).withMessage('You must include a website url for the endorser in the badge data'),
	check('email').optional().isEmail().withMessage('Please include a valid email address for the endorsement badge data'),
    check('telephone').optional(),
    check('imageurl').optional().isURL({require_tld: false}).withMessage('Please include a valid image url'),
], endorser_controller.updateEndorser);

// only if not used in a badge issuance
router.post('/delete', [
	check('token').optional(),
    check('id').withMessage('You must include the id of the endorser to delete')
], endorser_controller.deleteEndorser);

router.get('/id', [
	check('token').optional(),
	check('id').withMessage('You must include the id of the endorser to retrieve'),
], endorser_controller.getEndorserById);

*/

let login_details_correct = {
  'username': 'ioc@kmi.open.ac.uk',
  'password': '10CM00d13b10cKcH@16n'
}

let endorser_data_ioc = {
  'name': "Institute of Coding",
  'loginemail': 'kmi-compendium@open.ac.uk',
  'description': 'Our mission is to break down barriers to digital learning and employment. We believe learning should be a lifelong process and that everyone has a right to improve their skills. We want to spread opportunity by offering access to education, providing what you need, when you need it, in a place you can reach.',
  'url': 'https://instituteofcoding.org/',
  'email': 'ioc@bath.ac.uk',
  'telephone': '',
  'imageurl': 'https://instituteofcoding.open.ac.uk/wp-content/themes/ioc/assets/images/ioc-logo.png'
}

let endorser_data_correct = {
  'name': "OpenLearn",
  'loginemail': 'kmi-compendium@open.ac.uk',
  'description': 'The home of free learning from The Open University',
  'url': 'https://www.open.edu/openlearn/',
  'email': 'openlearn@open.ac.uk',
  'telephone': '+44 (0)1908 655969',
  'imageurl': 'http://blockchain20.kmi.open.ac.uk/endorsers/images/openlearn.png'
}

// 404
let endorser_data_no_email = {
  'name': "OpenLearn",
  'description': 'The home of free learning from The Open University',
  'url': 'https://www.open.edu/openlearn/',
  'email': 'openlearn@open.ac.uk',
  'telephone': '+44 (0)1908 655969',
  'imageurl': 'http://blockchain20.kmi.open.ac.uk/endorsers/images/openlearn.png'
}

let endorser_data_update = {
  'id': "",
  'name': "OpenLearn 2",
  'description': 'The home of free learning from The Open University again',
  'url': 'https://www.open.edu/openlearn/',
  'email': 'openlearn@open.ac.uk',
  'telephone': '+44 (0)1908 655969',
  'imageurl': 'http://blockchain20.kmi.open.ac.uk/endorsers/images/openlearn.png'
}

let endorser_data_update_no_id = {
  'name': "OpenLearn 2",
  'description': 'The home of free learning from The Open University again',
  'url': 'https://www.open.edu/openlearn/',
  'email': 'openlearn@open.ac.uk',
  'telephone': '+44 (0)1908 655969',
  'imageurl': 'http://blockchain20.kmi.open.ac.uk/endorsers/images/openlearn.png'
}

let endorser_data_delete = {
  'id': "",
}

var endorserid = "";

describe("Endorsers", () => {

	/** RETURN WEB PAGES **/

    describe("GET /badges/endorsers", () => {
        it("sign in and get the endorser's home page", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get('/badges/endorsers')
						.set('Authorization', token)
						.end((err, res) => {
							if (res.error) {
								console.log(res.error);
							}

							res.should.have.status(200);
							res.should.be.html;

							// template system means actual page content only loaded on browser
							// so can't test much server side except that the title is the right one at least.
							res.text.should.contain('<title>My Endorsements</title>');

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET /badges/endorsers/manage", () => {
        it("sign in and get the manage endrosers page", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get('/badges/endorsers/manage')
						.set('Authorization', token)
						.end((err, res) => {
							if (res.error) {
								console.log(res.error);
							}

							res.should.have.status(200);
							res.should.be.html;

							// template system means actual page content only loaded on browser
							// so can't test much server side except that the title is the right one at least.
							res.text.should.contain('<title>Manage Endorsers</title>');

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET /badges/endorsers/docs", () => {
        it("Get the Endorsers API docs", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get('/badges/endorsers/docs')
						.set('Authorization', token)
						.end((err, res) => {
							if (res.error) {
								console.log(res.error);
							}

							res.should.have.status(200);
							res.should.be.html;

							done();
					});
			});
		}).timeout(100000);
	});

	/** RETURN JSON DATA **/

    describe("POST /badges/endorsers/create with no email", () => {
        it("login and return a status of not 200", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post('/openbadges/endorsers/create')
						.set('Authorization', token)
						.send(endorser_data_no_email)
						.end((err, res) => {
							res.should.not.have.status(422);
							res.error.should.not.be.empty;

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST /badges/endorsers/create with good data", () => {
        it("should create a new endorser and user entries and email user to complete registration", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post('/badges/endorsers/create')
						.set('Authorization', token)
						.send(endorser_data_correct)
						.end((err, res) => {
							if (res.error) {
								console.log(res.error);
								console.log(endorser_data_correct);
							}

							res.should.have.status(200);
							res.should.be.json;

							res.body.should.have.property('id');

							endorserid = res.body.id;
							endorser_data_update.id = res.body.id;
							endorser_data_delete.id = res.body.id;

							res.body.should.have.property('timecreated');
							res.body.should.have.property('name');
							res.body.should.have.property('description');
							res.body.should.have.property('url');
							res.body.should.have.property('email');
							res.body.should.have.property('telephone');
							res.body.should.have.property('imageurl');
							res.body.should.have.property('status');

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST /badges/endorsers/update with no id", () => {
        it("should update an endorser", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post('/badges/endorsers/update')
						.set('Authorization', token)
						.send(endorser_data_update_no_id)
						.end((err, res) => {
							res.should.have.status(400);
							//res.should.have.status(422); // why no 422?
							res.error.should.not.be.empty;

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST /badges/endorsers/update with good data", () => {
        it("should update an endorser", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post('/badges/endorsers/update')
						.set('Authorization', token)
						.send(endorser_data_update)
						.end((err, res) => {
							if (res.error) {
								console.log(res.error);
								console.log(endorser_data_update);
							}

							res.should.have.status(200);

							res.body.should.have.property('id');
							res.body.should.have.property('timecreated');
							res.body.should.have.property('name');
							res.body.should.have.property('description');
							res.body.should.have.property('url');
							res.body.should.have.property('email');
							res.body.should.have.property('telephone');
							res.body.should.have.property('imageurl');
							res.body.should.have.property('status');

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET /badges/endorsers/list", () => {
        it("sign in and get a list of all endorsers for the current user", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get('/badges/endorsers/list')
						.set('Authorization', token)
						.end((err, res) => {
							if (res.error) {
								console.log(res.error);
							}

							res.should.have.status(200);
							res.should.be.json;

							res.body.should.have.property('endorsers')

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET /badges/endorsers/id/:id", () => {
        it("sign in and get an endorser record by id", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get('/badges/endorsers/id/'+endorserid)
						.set('Authorization', token)
						.end((err, res) => {
							if (res.error) {
								console.log(res.error);
							}

							res.should.have.status(200);

							res.body.should.have.property('id');
							res.body.should.have.property('timecreated');
							res.body.should.have.property('name');
							res.body.should.have.property('description');
							res.body.should.have.property('url');
							res.body.should.have.property('email');
							res.body.should.have.property('telephone');
							res.body.should.have.property('imageurl');
							res.body.should.have.property('status');

							done();
					});
			});
		}).timeout(100000);
	});
/*
    describe("POST /badges/endorsers/delete with unused id", () => {
        it("should delete the endorser with the given id, as not already used to issue a badge", (done) => {
			chai.request(app)
			    .post('/badges/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post('/badges/endorsers/delete')
						.set('Authorization', token)
						.send(endorser_data_delete)
						.end((err, res) => {
							if (res.error) {
								console.log(res.error);
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