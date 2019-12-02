
var cfg = require('../config.js');
var express = require('express');
var router = express.Router();

/* GET maintenance page. */
router.get('/', function(req, res, next) {
	res.render('maintenance', { layout: 'maintenance.hbs', title: 'Currently down for Maintenance' });
});

module.exports = router;
