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

//npm install --save-dev

describe('App basics', () => {

  it('App should exists', () => {
    expect(app).to.be.a('function');
  });

  /*it('GET / should return 200 and message', (done) => {
    chai.request(app)
		.get('/')
		.end((err, res) => {
			 //res.should.have.status(200);
			 res.body.should.to.contain('Blockchain Badges Web Service');
			 done();
		});
	});
	*/
});

//require('./users.js')
/*
require('./portfolios.js')
require('./recipients.js')
require('./endorsers.js')
require('./issuers.js')
require('./alignments.js')
require('./badges.js')
require('./evidence.js')
*/

//require('./badges.js')

//require('./assertions.js')

//require('./evidence.js')

// NOT CURRENTLY USED
//require('./token.js')

/*
var requester = chai.request(app).keepOpen()
Promise.all([
  requester.get('/a'),
  requester.get('/b'),
])
.then(responses => ....)
.then(() => requester.close())

// Send some Form Data
chai.request(app)
  .post('/user/me')
  .type('form')
  .send({
    '_method': 'put',
    'password': '123',
    'confirmPassword': '123'
  })

  // Attach a file
  chai.request(app)
    .post('/user/avatar')
  .attach('imageField', fs.readFileSync('avatar.png'), 'avatar.png')

  // Authenticate with Basic authentication
  chai.request(app)
    .get('/protected')
  .auth('user', 'pass')

  // Chain some GET query parameters
  chai.request(app)
    .get('/search')
  .query({name: 'foo', limit: 10}) // /search?name=foo&limit=10

  chai.request(app)
    .put('/user/me')
    .send({ password: '123', confirmPassword: '123' })
    .end(function (err, res) {
       expect(err).to.be.null;
       expect(res).to.have.status(200);
  });

  // mocha example
	it('fails, as expected', function(done) { // <= Pass in done callback
		chai.request('http://localhost:8080')
		.get('/')
		.end(function(err, res) {
			expect(res).to.have.status(123);
			done();                               // <= Call done to signal callback end
		});
	});
*/