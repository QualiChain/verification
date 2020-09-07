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
let alignment_data_correct = {
  'url': 'https://www.sfia-online.org/en/framework/sfia-7/skills/strategy-architecture/information-strategy/it-governance',
  'name': 'Enterprise IT governance',
  'description': "The establishment and oversight of an organisation's approach to the use of Information systems and digital services, and associated technology, in line with the needs of the principal stakeholders of the organisation and overall organisational corporate governance requirements. The determination and accountability for evaluation of current and future needs; directing the planning for both supply and demand of these services; the quality, characteristics, and level of IT services; and for monitoring the conformance to obligations (including regulatory, legislation, control, and other standards) to ensure positive contribution of IT to the organisation's goals and objectives.",
  'code': 'GOVN',
  'framework': 'The SFIA framework'
}

/*
let alignment_data_no_desc = {
  'id': '',
  'url': 'https://www.sfia-online.org/en/framework/sfia-7/skills/strategy-architecture/information-strategy/it-governance',
  'name': 'Enterprise IT governance',
  'code': 'GOVN',
  'framework': 'The SFIA framework'
}

let alignment_data_no_optionals = {
  'id': '',
  'url': 'https://www.sfia-online.org/en/framework/sfia-7/skills/strategy-architecture/information-strategy/it-governance',
  'name': 'Enterprise IT governance',
  'description': "The establishment and oversight of an organisation's approach to the use of Information systems and digital services, and associated technology, in line with the needs of the principal stakeholders of the organisation and overall organisational corporate governance requirements. The determination and accountability for evaluation of current and future needs; directing the planning for both supply and demand of these services; the quality, characteristics, and level of IT services; and for monitoring the conformance to obligations (including regulatory, legislation, control, and other standards) to ensure positive contribution of IT to the organisation's goals and objectives."
}
*/

let alignment_data_update = {
  'id': '',
  'url': 'https://www.sfia-online.org/en/framework/sfia-7/skills/strategy-architecture/information-strategy/it-governance44',
  'name': '44 Enterprise IT governance',
  'description': "44 The establishment and oversight of an organisation's approach to the use of Information systems and digital services, and associated technology, in line with the needs of the principal stakeholders of the organisation and overall organisational corporate governance requirements. The determination and accountability for evaluation of current and future needs; directing the planning for both supply and demand of these services; the quality, characteristics, and level of IT services; and for monitoring the conformance to obligations (including regulatory, legislation, control, and other standards) to ensure positive contribution of IT to the organisation's goals and objectives."
}

let alignment_data_delete = {
  'id': '',
}

var alignmentid = "";

describe("Alignments", () => {
    describe("POST "+cfg.proxy_path+"/alignments/create with good data", () => {
        it("sign in and create alignment", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/alignments/create')
						.set('Authorization', token)
						.send(alignment_data_correct)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(alignment_data_correct);
							}

							res.should.have.status(200);

							res.body.should.have.property('id')

							alignmentid = res.body.id;
							alignment_data_update.id = res.body.id;
							alignment_data_delete.id = res.body.id;

							res.body.should.have.property('timecreated')
							res.body.should.have.property('name')
							res.body.should.have.property('description')
							res.body.should.have.property('code')
							res.body.should.have.property('framework')

							done();
					});
			});
		}).timeout(100000);
	});

    describe("POST "+cfg.proxy_path+"/alignments/update with good data", () => {
        it("should update an alignment record", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/alignments/update')
						.set('Authorization', token)
						.send(alignment_data_update)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(alignment_data_update);
							}

							res.should.have.status(200);

							res.body.should.have.property('id')
							res.body.should.have.property('timecreated')
							res.body.should.have.property('name')
							res.body.should.have.property('description')
							res.body.should.have.property('code')
							res.body.should.have.property('framework')

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET "+cfg.proxy_path+"/alignments/id/:id - to get previously created badge", () => {
        it("sign in and get alignment by id", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get(cfg.proxy_path+'/alignments/id/'+alignmentid)
						.set('Authorization', token)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(alignments);
							}

							res.should.have.status(200);

							res.body.should.have.property('id')
							res.body.should.have.property('timecreated')
							res.body.should.have.property('name')
							res.body.should.have.property('description')
							res.body.should.have.property('code')
							res.body.should.have.property('framework')

							done();
					});
			});
		}).timeout(100000);
	});

    describe("GET "+cfg.proxy_path+"/alignments/list", () => {
        it("sign in and get a list of all alignments for the current user", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.get(cfg.proxy_path+'/alignments/list')
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
    describe("POST "+cfg.proxy_path+"/alignments/delete with good id", () => {
        it("should delete the alignment with the given id, only if not already used to issue a badge", (done) => {
			chai.request(app)
			    .post(cfg.proxy_path+'/users/signin')
			    .send(login_details_correct)
                .end((err, res) => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('token');

					let token = res.body.token;

					chai.request(app)
						.post(cfg.proxy_path+'/alignments/delete')
						.set('Authorization', token)
						.send(alignment_data_delete)
						.end((err, res) => {

							if (res.error) {
								console.log(res.error);
								console.log(alignment_data_delete);
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