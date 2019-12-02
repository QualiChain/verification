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

var express = require('express');
var router = express.Router();

var recipient_controller = require('../controllers/recipientController');
const { check } = require('express-validator/check');


router.get('/', [
	check('token').optional(),
],	recipient_controller.getRecipientPage);

router.get('/manage', [
	check('token').optional(),
],	recipient_controller.getRecipientManagementPage);

router.get('/docs', function(req, res, next) {
	res.render('docsrecipients', { title: 'Recipient API Documentation' });
});

router.get('/list', [
	check('token').optional(),
], recipient_controller.listRecipients);

router.get('/uniqueid/:id', [
	check('token').optional(),
	check('id').withMessage('You must include your unique id for the recipient you want to get the data for')
], recipient_controller.getRecipientsByUniqueId);

router.get('/id/:id', [
	check('token').optional(),
	check('id').withMessage('You must include the record id for the recipient you want to get the data for')
], recipient_controller.getRecipientsById);

//check('name', 'You must include triple data for this RDF Merkle Tree record').not().isEmpty()

router.post('/create', [
	check('token').optional(),
	check('name', 'You must include a name for this recipient.').not().isEmpty(),
	check('email', 'You must include the email for this recipient.').not().isEmpty(),
	check('uniqueid').optional()
], recipient_controller.createRecipient);

router.post('/createuseraccount', [
	check('token').optional(),
	check('id').withMessage('You must include the id for the recipient you want to create a user account for'),
], recipient_controller.createRecipientUserAccount);

router.get('/completeregistration', [
    check('id').withMessage('You must include the id of the user to complete registation for'),
    check('key').withMessage('You must include the key'),

], recipient_controller.completeRegistration);

// only change email if not used
router.post('/update', [
	check('token').optional(),
	check('id').withMessage('You must include the id for the recipient you want to update'),
	check('email').optional(),
	check('name').optional(),
	check('uniqueid').optional()
], recipient_controller.updateRecipient);

router.post('/delete', [
	check('token').optional(),
	check('id').withMessage('You must include the id for the recipient you want to delete'),
], recipient_controller.deleteRecipient);


module.exports = router;
