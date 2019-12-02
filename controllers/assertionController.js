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

var cfg = require('../config.js');

var assertion_model = require('../models/assertions');
var user_model = require('../models/users');

const { validationResult } = require('express-validator/check');

exports.viewAssertionByID = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.viewAssertionByID(req, res);
		} else {
			//console.log(req);
			var path = req.baseUrl + req._parsedUrl.pathname;
			var query = req._parsedUrl.query;
			res.render('signin', { title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: JSON.stringify(req.query), pdir: __dirname});
			// render sign in page
			//res.status(401).json({ error: 'Unauthorized user!' });
			//res.status(401).json({ error: req.originalUrl });
		}

	});
};

exports.getAssertionPage = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.getAssertionPage(req, res);
		} else {
			//console.log(req);
			var path = req.baseUrl + req._parsedUrl.pathname;
			var query = req._parsedUrl.query;
			res.render('signin', { layout: 'signin.hbs', title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: JSON.stringify(req.query), pdir: __dirname});
			// render sign in page
			//res.status(401).json({ error: 'Unauthorized user!' });
			//res.status(401).json({ error: req.originalUrl });
		}

	});
};

exports.validateAssertion = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	//user_model.verify(req, res, function(passed, error) {
	//	if (passed) {
			assertion_model.validateAssertion(req, res);
	//	} else {
	//		res.status(401).json({ error: error });
	//	}
	//});
}

exports.issueAssertion = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.issueAssertion(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.revokeAssertion = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.revokeAssertion(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.endorseAssertion = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.endorseAssertion(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.createAssertion = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.createAssertion(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.updateAssertion = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.updateAssertion(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.deleteAssertion = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.deleteAssertion(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.getAssertionById = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.getAssertionById(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.downloadAssertion = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.downloadAssertion(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.listAssertions = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.listAssertions(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.listAssertionsPortfolio = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.listAssertionsPortfolio(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

/** MANAGE ADDING REMOVING ENDORSERS ON AN ASSERTION **/

exports.addEndorser = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.addEndorser(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.removeEndorser = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.removeEndorser(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}

exports.listEndorsers = function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ error: errors.mapped() });
	}

	user_model.verify(req, res, function(passed, error) {
		if (passed) {
			assertion_model.listEndorsers(req, res);
		} else {
			res.status(401).json({ error: error });
		}
	});
}