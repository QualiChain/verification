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
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');

const fileUpload = require('express-fileupload');

var index = require('./routes/index');
var badges = require('./routes/badges');
var issuers = require('./routes/issuers');
var endorsers = require('./routes/endorsers');
var recipients = require('./routes/recipients');
var alignments = require('./routes/alignments');
var evidence = require('./routes/evidence');
var assertions = require('./routes/assertions');
var users = require('./routes/users');
var admin = require('./routes/admin');
var maintenance = require('./routes/maintenance');
var ipfs = require('./routes/ipfs');
var merkle = require('./routes/merkle');
var util = require('./routes/util');

//var pods = require('./routes/badges/pods');

var app = express();

//https://expressjs.com/en/advanced/best-practice-security.html#use-helmet
app.disable('x-powered-by')

/*
CORS STUFF FROM blockcn07 RDF SERVICE - Not sure if needed here - not needed for SERVICE
// allow connections from any browser/domain
// https://github.com/expressjs/cors
//app.use(cors());

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

// enable pre-flight across-the-board
app.options('*', cors()) // include before other routes
*/

app.use(fileUpload({
	limits: { fileSize: 20971520}, //20MB,  5MB=5242880 //
	safeFileNames: true,
	abortOnLimit: true
}));

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts', partialsDir: __dirname + '/views/layouts/partials'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// comment out section below for maintenace mode

app.use('/issuers', issuers);
app.use('/endorsers', endorsers);
app.use('/recipients', recipients);
app.use('/alignments', alignments);
app.use('/evidence', evidence);
app.use('/assertions', assertions);
app.use('/users', users);
app.use('/admin', admin);
app.use('/merkle', merkle);
app.use('/ipfs', ipfs);
app.use('/util', util);
// needs to be last
app.use('/badges', badges);
app.use('/', index);

app.use('/images', express.static(__dirname + '/public/images'));
app.use('/badges/images', express.static(__dirname + '/public/images'));
app.use('/badges/view/images', express.static(__dirname + '/public/images'));
app.use('/badges/contract/images', express.static(__dirname + '/public/images'));
app.use('/badges/contract/view/images', express.static(__dirname + '/public/images'));
app.use('/issuers/images', express.static(__dirname + '/public/images'));
app.use('/endorsers/images', express.static(__dirname + '/public/images'));
app.use('/recipients/images', express.static(__dirname + '/public/images'));
app.use('/alignments/images', express.static(__dirname + '/public/images'));
app.use('/evidence/images', express.static(__dirname + '/public/images'));
app.use('/assertions/images', express.static(__dirname + '/public/images'));
app.use('/users/images', express.static(__dirname + '/public/images'));
app.use('/merkle/images', express.static(__dirname + '/public/images'));
app.use('/ipfs/images', express.static(__dirname + '/public/images'));

app.use('/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/badges/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/badges/view/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/badges/contract/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/badges/contract/view/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/issuers/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/endorsers/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/recipients/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/alignments/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/evidence/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/assertions/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/users/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/merkle/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/ipfs/javascripts', express.static(__dirname + '/public/javascripts'));

app.use('/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/badges/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/badges/view/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/badges/contract/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/badges/contract/view/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/issuers/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/endorsers/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/recipients/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/alignments/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/evidence/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/assertions/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/users/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/merkle/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/ipfs/stylesheets', express.static(__dirname + '/public/stylesheets'));

app.use('/lib', express.static(__dirname + '/public/lib'));

// end comment out section for maintenace mode

// uncomment section for maintenance mode
/*
app.use('/', maintenance);
app.use('/images', express.static(__dirname + '/public/images'));
app.use('/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/stylesheets', express.static(__dirname + '/public/stylesheets'));

app.use(redirectUnmatched);

function redirectUnmatched(req, res) {
  res.redirect("https://blockchain21.kmi.open.ac.uk/qualichain");
}
*/
// end uncomment section mainteance mode


// Falls into this if route not found.
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var db = require('./db')

// Connect to MySQL on start
db.connect(db.MODE_PRODUCTION, function(err) {
  if (err) {
    console.log('Unable to connect to MySQL.')
    process.exit(1)
  } else {
    app.listen(8000, function() {
		console.log('Listening on port 8000...')
    });
    // =  6 minutes?
    app.timeout = 240000;
    //server.timeout = 120000;/ // =  default
  }
})

module.exports = app;
