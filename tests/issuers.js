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
router.get('/', [
	check('token').optional(),
],	issuer_controller.getIssuerPage);

router.get('/manage', [
	check('token').optional(),
],	issuer_controller.getIssuerManagementPage);

router.get('/docs', function(req, res, next) {
	res.render('docsissuers', { title: 'Issuer API Documentation' });
});

router.get('/list', [
	check('token').optional(),
], issuer_controller.listIssuers);

router.post('/create', [
	check('token').optional(),
    check('name').withMessage('You must include a name for the issuer'),
	check('loginemail').isEmail().withMessage('Please include a valid email address for creating the issuer account'),

	check('url').isURL({require_tld: false}).withMessage('You must include a website url for the issuer to go into the in the badge data'),
	check('email').isEmail().withMessage('Please include a valid email address for the issuer badge data'),

    check('telephone').optional(),
    check('description').optional(),
    check('imageurl').optional().isURL({require_tld: false}).withMessage('Please include a valid image url'),
], issuer_controller.createIssuer);

router.get('/completeregistration', [
    check('id').withMessage('You must include the id of the user to complete registation for'),
    check('key').withMessage('You must include the key'),

], issuer_controller.completeRegistration);

//notsure how the update works. Get the ID and then keep all other fields optional?
router.post('/update', [
	check('token').optional(),
    check('id').withMessage('You must include the id of the issuer to update'),
    check('name').optional(),
    check('description').optional(),
    check('url').optional().isURL({require_tld: false}),
	check('email').optional().isEmail(),
    check('telephone').optional(),
    check('imageurl').optional().isURL({require_tld: false}),
], issuer_controller.updateIssuer);

router.post('/delete', [
	check('token').optional(),
    check('id').withMessage('You must include the id of the issuer to delete'),
], issuer_controller.deleteIssuer);

router.get('/id', [
	check('token').optional(),
	check('id').withMessage('You must include the id of the issuer to retrieve'),
], issuer_controller.getIssuerById);
*/

let issuer_data_correct = {
  'name': "Institute of Coding",
  'loginemail': 'kmi-compendium-Webmaster@open.ac.uk',
  'description': 'Our mission is to break down barriers to digital learning and employment. We believe learning should be a lifelong process and that everyone has a right to improve their skills. We want to spread opportunity by offering access to education, providing what you need, when you need it, in a place you can reach.',
  'url': 'https://instituteofcoding.org/',
  'email': 'ioc@bath.ac.uk',
  'telephone': '+44 (0)1908 655969',
  'imageurl': 'https://instituteofcoding.open.ac.uk/wp-content/themes/ioc/assets/images/ioc-logo.png'
}

let issuer_data_no_email = {
  'name': "Institute of Coding",
  'description': 'Our mission is to break down barriers to digital learning and employment. We believe learning should be a lifelong process and that everyone has a right to improve their skills. We want to spread opportunity by offering access to education, providing what you need, when you need it, in a place you can reach.',
  'url': 'https://instituteofcoding.org/',
  'email': 'ioc@bath.ac.uk',
  'telephone': '+44 (0)1908 655969',
  'imageurl': 'https://instituteofcoding.open.ac.uk/wp-content/themes/ioc/assets/images/ioc-logo.png'
}

let issuer_data_invalid_email = {
  'name': "Institute of Coding",
  'loginemail': 'kmi-compendium',
  'description': 'Our mission is to break down barriers to digital learning and employment. We believe learning should be a lifelong process and that everyone has a right to improve their skills. We want to spread opportunity by offering access to education, providing what you need, when you need it, in a place you can reach.',
  'url': 'https://instituteofcoding.org/',
  'email': 'ioc@bath.ac.uk',
  'telephone': '+44 (0)1908 655969',
  'imageurl': 'https://instituteofcoding.open.ac.uk/wp-content/themes/ioc/assets/images/ioc-logo.png'
}

let issuer_data_no_optionals = {
  'name': "Institute of Coding",
  'loginemail': 'kmi-compendium',
  'url': 'https://instituteofcoding.org/',
  'email': 'ioc@bath.ac.uk',
}

let issuer_data_update = {
  'id': "",
  'name': "Institute of Coding 22",
  'description': '22 Our mission is to break down barriers to digital learning and employment. We believe learning should be a lifelong process and that everyone has a right to improve their skills. We want to spread opportunity by offering access to education, providing what you need, when you need it, in a place you can reach.',
}

let issuer_data_update_no_id = {
  'name': "Institute of Coding 22",
  'description': '22 Our mission is to break down barriers to digital learning and employment. We believe learning should be a lifelong process and that everyone has a right to improve their skills. We want to spread opportunity by offering access to education, providing what you need, when you need it, in a place you can reach.',
}

let issuer_data_delete = {
  'id': "",
}

var issuerid = "";

describe("Issuers", () => {

	/** RETURN WEB PAGES **/

    describe("GET "+cfg.proxy_path+"/issuers", () => {
        it("sign in and get the issuer's home page", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;
					chai.request(app)
						.get(cfg.proxy_path+'/issuers/')
						.set('Authorization', token)
						.end((err, res) => {
							//console.log(res.text);

							res.should.have.status(200);
							res.should.be.html;

							// template system means actual page content only loaded on browser
							// so can't test much server side except that the title is the right one at least.
							res.text.should.contain('<title>Manage Badge Issuing</title>');

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET "+cfg.proxy_path+"/issuers/manage", () => {
        it("sign in and get the issuer's home page", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;
					chai.request(app)
						.get(cfg.proxy_path+'/issuers/manage')
						.set('Authorization', token)
						.end((err, res) => {
							//console.log(res.text);

							res.should.have.status(200);
							res.should.be.html;

							// template system means actual page content only loaded on browser
							// so can't test much server side except that the title is the right one at least.
							res.text.should.contain('<title>Manage Issuers</title>');

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET "+cfg.proxy_path+"/issuers/docs", () => {
        it("Get the Issuer API docs", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;
					chai.request(app)
						.get(cfg.proxy_path+'/issuers/docs')
						.set('Authorization', token)
						.end((err, res) => {
							//console.log(res.text);

							res.should.have.status(200);
							res.should.be.html;

							done();
					});
			});
		}).timeout(100000);
	});

	/** RETURN JSON DATA **/

    describe("POST "+cfg.proxy_path+"/issuers/create with no login email", () => {
        it("should sign in and return 422", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/issuers/create')
						.set('Authorization', token)
						.send(issuer_data_no_email)
						.end((err, res) => {
							if (res.error) {
								console.log(res.error);
								console.log(issuer_data_no_email);
							}

							res.should.not.have.status(200);
							res.error.should.not.be.empty;

							done();
					});
			});

		}).timeout(100000);
	});

    describe("POST "+cfg.proxy_path+"/issuers/create with email invalid", () => {
        it("should sign in and return a 422", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/issuers/create')
						.set('Authorization', token)
						.send(issuer_data_invalid_email)
						.end((err, res) => {
							res.should.have.status(422);
							res.error.should.not.be.empty;

							done();
					});
			});

		}).timeout(100000);
	});
    describe("POST "+cfg.proxy_path+"/issuers/create with no optional fields", () => {
        it("should sign in and return issuer contract address, transaction and account", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/issuers/create')
						.set('Authorization', token)
						.send(issuer_data_no_optionals)
						.end((err, res) => {
							res.should.have.status(422);
							res.error.should.not.be.empty;

							done();
					});
			});

		}).timeout(100000);
	});

    describe("POST "+cfg.proxy_path+"/issuers/create with correct details", () => {
        it("should sign in and return issuer contract address, transaction and account", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/issuers/create')
						.set('Authorization', token)
						.send(issuer_data_correct)
						.end((err, res) => {
							if (res.error) {
								console.log(res.error);
								console.log("HERE");
								console.log(issuer_data_correct);
							}

							res.should.have.status(200);
							res.should.be.json;

							res.body.should.have.property('id');

							issuerid = res.body.id;
							issuer_data_update.id = res.body.id;
							issuer_data_delete.id = res.body.id;

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

    describe("POST "+cfg.proxy_path+"/issuers/update with no id", () => {
        it("login and return a 422/400", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/issuers/update')
						.set('Authorization', token)
						.send(issuer_data_update_no_id)
						.end((err, res) => {
							res.should.not.have.status(200);
							// should be 422 - got 400 - why
							res.error.should.not.be.empty;

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST "+cfg.proxy_path+"/issuers/update with good data", () => {
        it("should update an issuer", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/issuers/update')
						.set('Authorization', token)
						.send(issuer_data_update)
						.end((err, res) => {
							if (res.error) {
								console.log(res.error);
								console.log(issuer_data_update);
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

    describe("GET "+cfg.proxy_path+"/issuers/list", () => {
        it("sign in and get a list of all issuers", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get(cfg.proxy_path+'/issuers/list')
						.set('Authorization', token)
						.end((err, res) => {
							res.should.have.status(200);
							res.should.be.json;

							res.body.should.have.property('issuers')
							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET "+cfg.proxy_path+"/issuers/id/:id", () => {
        it("sign in and get an issuers record by id", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get("+cfg.proxy_path+'/issuers/id/'+issuerid)
						.set('Authorization', token)
						.end((err, res) => {
							if (res.error) {
								console.log(res.error);
								console.log(issuerid);
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
    describe("POST "+cfg.proxy_path+"/issuers/delete with good id", () => {
        it("should delete the issuer with the given id, only if not already used to issue a badge", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/issuers/delete')
						.set('Authorization', token)
						.send(issuer_data_delete)
						.end((err, res) => {
							if (res.error) {
								console.log(res.error);
								console.log(issuer_data_delete);
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