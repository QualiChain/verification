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

var evidence_controller = require('../controllers/evidenceController');
const { check } = require('express-validator/check');

/*
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Badging Service' });
});

router.get('/id/:id', [
	check('token').optional(),
	check('id').withMessage('You must the id of the badge you want to get'),
], evidence_controller.getEvidenceById);
*/

router.get('/', [
	check('token').optional(),
	check('badgeissuedid').withMessage('You must include the badge issuance id for the evidence management page you wish to view'),
],	evidence_controller.getEvidencePage);

router.get('/docs', function(req, res, next) {
	res.render('docsevidence');
});

router.post('/list', [
	check('token').optional(),
	check('id').withMessage('You must include the badge issuance id to list evidence for'),
], evidence_controller.listEvidenceForBadge);

router.post('/create', [
	check('token').optional(),

	check('badgeissuedid').withMessage('You must include the badge issuance id for the badge issuance you want to add evidence to'),
	check('url').withMessage('You must include the url to the evidence item you are adding to the badge'),
	check('name').withMessage('You must include a name for the evidence itemyou want to add to a badge'),

	check('description').optional(),
	check('narrative').optional(),
	check('genre').optional(),
	check('audience').optional(),

], evidence_controller.createEvidence);

router.post('/update', [
	check('token').optional(),

	check('id').withMessage('You must include the evidence id for the evidence you want to edit'),

	check('url').optional(),
	check('name').optional(),
	check('description').optional(),
	check('narrative').optional(),
	check('genre').optional(),
	check('audience').optional(),

], evidence_controller.updateEvidence);


router.post('/delete', [
	check('token').optional(),

	check('id').withMessage('You must include the evidence id for the evidence you want to delete'),
], evidence_controller.deleteEvidence);


module.exports = router;
