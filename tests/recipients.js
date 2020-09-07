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
router.get('/list', function(req, res, next) {
	badges_controller.listRecipients(req, res, next);
});

router.get('/uniqueid/:id', [
	check('id').withMessage('you must include your unique id for the recipient(s) you want to get the data for')
], recipient_controller.getRecipientsByUniqueId);

router.get('/id/:id', [
	check('id').withMessage('you must include your system id for the recipient(s) you want to get the data for')
], recipient_controller.getRecipientsBySystemId);

//check('name', 'You must include triple data for this RDF Merkle Tree record').not().isEmpty()

router.post('/create', [
	check('name').withMessage('you must include a name for this recipient'),
	check('email').withMessage('you must include the email for this recipient'),
	check('password').withMessage('you must include the password for this recipient'),
	check('uniqueid').optional()
	], recipient_controller.createRecipient);

// only change email if not used
router.post('/update', [
	check('name').optional(),
	check('uniqueid').optional(),
	check('email').optional()
], recipient_controller.updateRecipient);

// only change email if not used
router.post('/delete', [
	check('id').withMessage('you must include the id for the recipient you want to delete'),
], recipient_controller.deleteRecipient);
*/

let recipient_data_correct = {
  'name': "Michelle Bachler",
  'email': 'michelle_bachler@yahoo.co.uk',
  'uniqueid': 'msb262'
}

let recipient_data_no_email = {
  'name': "Michelle Bachler",
  'uniqueid': 'msb262'
}

let recipient_data_update = {
  'id': "",
  'name': "Michelle Bachler 22",
  'email': 'michelle_bachler@yahoo.co.uk',
  'uniqueid': 'msb26256'
}

let recipient_data_update_no_id = {
  'name': "Michelle Bachler 24",
  'email': 'michelle_bachler@yahoo.co.uk',
  'uniqueid': 'msb26256'
}

let recipient_data_delete = {
  'id': "",
}

let unused_recipient_id = "";
let used_recipient_id = "";

var recipientid = "";

describe("Recipients", () => {

	/** RETURN WEB PAGES **/

    describe("GET "+cfg.proxy_path+"/recipients", () => {
        it("sign in and get the recipient's home page", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;
					chai.request(app)
						.get(cfg.proxy_path+'/recipients/')
						.set('Authorization', token)
						.end((err, res) => {
							//console.log(res.text);

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

    describe("GET "+cfg.proxy_path+"/recipients/manage", () => {
        it("sign in and get the recipient's home page", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;
					chai.request(app)
						.get(cfg.proxy_path+'/recipients/manage')
						.set('Authorization', token)
						.end((err, res) => {
							//console.log(res.text);

							res.should.have.status(200);
							res.should.be.html;

							// template system means actual page content only loaded on browser
							// so can't test much server side except that the title is the right one at least.
							res.text.should.contain('<title>Manage Recipients</title>');

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET "+cfg.proxy_path+"/recipients/docs", () => {
        it("get the recipient API docs", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;
					chai.request(app)
						.get(cfg.proxy_path+'/recipients/docs')
						.set('Authorization', token)
						.end((err, res) => {

							res.should.have.status(200);
							res.should.be.html;

							done();
					});
			});
		}).timeout(100000);
	});

	/** RETURN JSON DATA **/

    describe("POST "+cfg.proxy_path+"/recipients/create with no email", () => {
        it("login and return a status of not 200", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/recipients/create')
						.set('Authorization', token)
						.send(recipient_data_no_email)
						.end((err, res) => {
							res.should.not.have.status(200);
							res.error.should.not.be.empty;

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST "+cfg.proxy_path+"/recipients/create with good data", () => {
        it("should create a new recipient and user entries and email user to complete registration", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/recipients/create')
						.set('Authorization', token)
						.send(recipient_data_correct)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(recipient_data_correct);
							}

							res.should.have.status(200);
							res.should.be.json;

							res.body.should.have.property('id');

							recipientid = res.body.id;
							recipient_data_update.id = res.body.id;
							recipient_data_delete.id = res.body.id;

							res.body.should.have.property('timecreated');
							res.body.should.have.property('name');
							res.body.should.have.property('email');
							res.body.should.have.property('uniqueid');
							res.body.should.have.property('status');

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET "+cfg.proxy_path+"/recipients/uniqueid/:id", () => {
        it("sign in and get recipients by uniqueid", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get(cfg.proxy_path+'/recipients/uniqueid/'+recipient_data_correct.uniqueid)
						.set('Authorization', token)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(recipient_data_correct.uniqueid);
							}

							res.should.have.status(200);
							res.body.should.have.property('items');

							/*
							 id:data.id,
							 timecreated: row.timecreated,
							 name: row.name,
							 email: row.email,
							 uniqueid: row.uniqueid,
							 status: row.status
							*/

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST "+cfg.proxy_path+"/recipients/update with no id", () => {
        it("should update an recipient", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/recipients/update')
						.set('Authorization', token)
						.send(recipient_data_update_no_id)
						.end((err, res) => {
							res.should.not.have.status(200);

							//res.should.have.status(422); - getting 400 why?
							res.error.should.not.be.empty;

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST "+cfg.proxy_path+"/recipients/update with good data", () => {
        it("should update an recipient", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/recipients/update')
						.set('Authorization', token)
						.send(recipient_data_update)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(recipient_data_update);
							}

							res.should.have.status(200);

							res.body.should.have.property('id');
							res.body.should.have.property('timecreated');
							res.body.should.have.property('name');
							res.body.should.have.property('email');
							res.body.should.have.property('uniqueid');
							res.body.should.have.property('status');

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET "+cfg.proxy_path+"/recipients/list", () => {
        it("sign in and get a list of all recipients for the current user", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get(cfg.proxy_path+'/recipients/list')
						.set('Authorization', token)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
							}

							res.should.have.status(200);
							res.should.be.json;

							res.body.should.have.property('recipients')

							/*
								recipient.id = next["id"];
								recipient.timecreated = next["timecreated"];
								recipient.name = next["name"];
								recipient.email = next["email"];
								recipient.uniqueid = next["uniqueid"];
								recipient.status = next["status"];
							*/
							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET "+cfg.proxy_path+"/recipients/id/:id", () => {
        it("sign in and get an recipient record by id", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get(cfg.proxy_path'/recipients/id/'+recipientid)
						.set('Authorization', token)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
							}

							res.should.have.status(200);

							res.body.should.have.property('id');
							res.body.should.have.property('timecreated');
							res.body.should.have.property('name');
							res.body.should.have.property('email');
							res.body.should.have.property('uniqueid');
							res.body.should.have.property('status');

							done();
					});
			});
		}).timeout(100000);
	});

/*
    describe("POST "+cfg.proxy_path+"/recipients/delete with good id", () => {
        it("should delete the recipient with the given id, only if not already used to issue a badge", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/recipients/delete')
						.set('Authorization', token)
						.send(recipient_data_delete)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(recipient_data_delete);
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