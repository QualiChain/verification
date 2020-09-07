
/* index.js */
/* This file renders the index.hbs file. */
var cfg = require('../config.js');
var express = require('express');
var router = express.Router();

var recipient_controller = require('../controllers/recipientController');

/*privacy page */
router.get('/privacy', function(req, res, next) {
	res.render('privacy', { title:"Qualichain Privacy Policy", domain: cfg.protocol+"://"+cfg.domain+"/badges" });
});

router.get('/docindex', function(req, res, next) {
	res.render('docindex', { title: cfg.title_docindex, mailto: cfg.mailto, mailtosubject: cfg.mailtosubject });
});

router.get('/portfolio', function(req, res, next) {
	recipient_controller.getRecipientPage(req, res, next);
});

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Qualichain Service'});
});

module.exports = router;
