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

var express = require('express');
var router = express.Router();

var user_controller = require('../controllers/userController');
const { check } = require('express-validator/check');

router.get('/docs', function(req, res, next) {
	res.render('docsusers');
});

router.get('/signinpage', function(req, res, next) {
	var path = req.baseUrl + req._parsedUrl.pathname;
	var query = req._parsedUrl.query;
	res.render('signin', { title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: JSON.stringify(req.query), pdir: __dirname});
});

router.post('/signin', [
	check('username').isEmail().withMessage('must be an email'),// .trim().normalizeEmail(),

	// ...or throw your own errors using validators created with .custom()
	//.custom(value => {
	//	return findUserByEmail(value).then(user => {
	//		throw new Error('this email is not in use');
	//	})
	//}),

	// General error messages can be given as a 2nd argument in the check APIs
	check('password', 'passwords must be at least 8 chars long').isLength({ min: 8 })

	// No special validation required? Just check if data exists:
	//check('addresses.*.street').exists(),

	// Wildcards * are accepted!
	//check('addresses.*.postalCode').isPostalCode(),

	// Sanitize the number of each address, making it arrive as an integer
	//sanitize('addresses.*.number').toInt()

], user_controller.user_signin);

router.post('/changepassword', [
	check('newpassword', 'the new passwords must be at least 8 chars long').isLength({ min: 8 }),
	check('token').optional()
], user_controller.changePassword);

router.get('/changepasswordpage', [
	check('from').optional()
], user_controller.changePasswordPage);

router.post('/forgotpassword', [
	check('email').isEmail().withMessage('You must include a valid email address'),
], user_controller.forgotPassword);

router.get('/forgotpasswordpage', function(req, res, next) {
	res.render('forgotpassword');
});

router.get('/completepasswordreset', [
    check('id').withMessage('You must include the id of the user to complete password reset for'),
    check('key').withMessage('You must include the key'),

], user_controller.completePasswordReset);

router.get('/getprofilepage', [
	check('token').optional()
], user_controller.getProfilePage);

module.exports = router;