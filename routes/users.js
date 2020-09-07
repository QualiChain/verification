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

const cfg = require('../config.js');

const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');
const { check } = require('express-validator/check');

/**
 * Get the User API documentation page.
 * @return HTML Page of the User API documentation
 */
router.get('/docs', function(req, res, next) {
	res.render('docsusers');
});

/**
 * Get the User sign in page.
 * @return HTML of the User sign in page
 */
router.get('/signinpage', function(req, res, next) {
	var path = req.baseUrl + req._parsedUrl.pathname;
	var query = req._parsedUrl.query;
	res.render('signin', { title: 'Sign In', protocol: cfg.protocol, domain: cfg.domain, path: path, query: JSON.stringify(req.query), pdir: __dirname});
});

/**
 * Sign in to the API and get an authorisation token
 * @param username, Required. The username to sign in to this API with - an email address.
 * @param password, Required. The pasword to sign in to this API with. Must be at least 8 characters long.
 * @return JSON with a token property and asociated API token that will expire in 5 hours, or an error object
 */
router.post('/signin', [
	check('username', 'Username field must be an email address').isEmail(),// .trim().normalizeEmail(),

	// ...or throw your own errors using validators created with .custom()
	//.custom(value => {
	//	return findUserByEmail(value).then(user => {
	//		throw new Error('this email is not in use');
	//	})
	//}),

	// General error messages can be given as a 2nd argument in the check APIs
	check('password', 'Passwords must be at least 8 chars long').isLength({ min: 8 })

	// No special validation required? Just check if data exists:
	//check('addresses.*.street').exists(),

	// Wildcards * are accepted!
	//check('addresses.*.postalCode').isPostalCode(),

	// Sanitize the number of each address, making it arrive as an integer
	//sanitize('addresses.*.number').toInt()

], user_controller.user_signin);

/**
 * Change a password for the currently logged in account.
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @param newpassword, Required. The new password to change to. Must be at least 8 characters long.
 */
router.post('/changepassword', [
	check('token').optional(),
	check('newpassword', 'the new passwords must be at least 8 chars long').isLength({ min: 8 })
], user_controller.changePassword);

/**
 * Get the Change password page.
 * @return HTML of the Change password page
 */
router.get('/changepasswordpage', [
	check('from').optional()
], user_controller.changePasswordPage);

/**
 * Request a new password. Email sent out.
 * @param, Required. The email address of the person that has forgotten their password.
 * @return JSON message property with message 'Forgot Password completed. Email sent'.
 */
router.post('/forgotpassword', [
	check('email', 'You must include a valid email address').isEmail(),
], user_controller.forgotPassword);

/**
 * Get the Forgot password page.
 * @return HTML of the Forgot password page
 */
router.get('/forgotpasswordpage', function(req, res, next) {
	res.render('forgotpassword', {mailto: cfg.mailto, mailtosubject: cfg.mailtosubject});
});

/**
 * Call from a link in the forgot password email to complete complete password resetting.
 * @param id, Required. The record identifier of the User record to complete password resetting for.
 * @param key, Required. The forgot password unique key to authorise this password resetting completion.
 * @return HTML of the change password page or error page with error message.
 */
router.get('/completepasswordreset', [
    check('id', 'You must include the id of the user to complete password reset for').not().isEmpty(),
    check('key', 'You must include the key').not().isEmpty(),

], user_controller.completePasswordReset);

/**
 * Return the account details and associated profiles for the currently logged in token holder
 * @param token, Optional. This call requires a login token or you will be redirected to the login page. Authorization Bearer, or Cookie with token property can also be used.
 * @return A user profile page.
 */
router.get('/getprofilepage', [
	check('token').optional()
], user_controller.getProfilePage);

module.exports = router;