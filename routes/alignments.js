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

var alignment_controller = require('../controllers/alignmentController');
const { check } = require('express-validator/check');

router.get('/manage', [
	check('token').optional(),
],	alignment_controller.getAlignmentManagementPage);

router.get('/docs', function(req, res, next) {
	res.render('docsalignments');
});

router.get('/id/:id', [
	check('token').optional(),
	check('id').withMessage('You must the id of the alignment you want to get'),
], alignment_controller.getAlignmentById);

router.get('/list', [
	check('token').optional(),
], alignment_controller.listAlignments);

router.post('/create', [
	check('token').optional(),

	check('url').isURL({require_tld: false}).withMessage('You must include a valid url for the new alignment item'),
	check('name').withMessage('You must include a name for the new alignment item'),
	check('description').withMessage('You must include a description for the new alignment item'),

	check('code').optional(),
	check('framework').optional()
], alignment_controller.createAlignment);

router.post('/update', [
	check('token').optional(),
	check('id').withMessage('You must include the id of the alignment you want to update'),

	check('url').optional().isURL({require_tld: false}).withMessage('Your alignment url must be a valid url'),
	check('name').optional(),
	check('description').optional(),

	check('code').optional(),
	check('framework').optional()

], alignment_controller.updateAlignment);

router.post('/delete', [
	check('token').optional(),
	check('id').withMessage('You must include the id of the alignment you want to delete'),
], alignment_controller.deleteAlignment);

/** These need to be in this order at the bottom **/

/*
router.get('/:id', [
	check('id').withMessage('You must include the unique id of the alignment you want to get the JSON for'),
], alignment_controller.getJSONById);
*/

router.get('/', function(req, res, next) {
	res.render('docsalignments');
});

module.exports = router;
