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

var express = require('express');
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
require('console-stamp')(console, { pattern: 'dd/mm/yyyy HH:MM:ss.l' });

var badges = require('./routes/badges');
var issuers = require('./routes/issuers');
var endorsers = require('./routes/endorsers');
var recipients = require('./routes/recipients');
var alignments = require('./routes/alignments');
var assertions = require('./routes/assertions');
var evidence = require('./routes/evidence');
var users = require('./routes/users');
var admin = require('./routes/admin');
var maintenance = require('./routes/maintenance');

var app = express();

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts', partialsDir: __dirname + '/views/layouts/partials'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/issuers', issuers);
app.use('/endorsers', endorsers);
app.use('/recipients', recipients);
app.use('/alignments', alignments);
app.use('/assertions', assertions);
app.use('/evidence', evidence);
app.use('/users', users);
app.use('/admin', admin);

// needs to be last
app.use('/', badges);

app.use('/images', express.static(__dirname + '/public/images'));
app.use('/view/images', express.static(__dirname + '/public/images'));
app.use('/contract/images', express.static(__dirname + '/public/images'));
app.use('/contract/view/images', express.static(__dirname + '/public/images'));
app.use('/issuers/images', express.static(__dirname + '/public/images'));
app.use('/endorsers/images', express.static(__dirname + '/public/images'));
app.use('/recipients/images', express.static(__dirname + '/public/images'));
app.use('/alignments/images', express.static(__dirname + '/public/images'));
app.use('/assertions/images', express.static(__dirname + '/public/images'));
app.use('/evidence/images', express.static(__dirname + '/public/images'));
app.use('/users/images', express.static(__dirname + '/public/images'));

app.use('/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/view/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/contract/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/contract/view/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/issuers/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/endorsers/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/recipients/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/alignments/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/assertions/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/evidence/javascripts', express.static(__dirname + '/public/javascripts'));
app.use('/users/javascripts', express.static(__dirname + '/public/javascripts'));

app.use('/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/view/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/contract/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/contract/view/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/issuers/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/endorsers/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/recipients/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/alignments/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/assertions/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/evidence/stylesheets', express.static(__dirname + '/public/stylesheets'));
app.use('/users/stylesheets', express.static(__dirname + '/public/stylesheets'));

app.use('/lib', express.static(__dirname + '/public/lib'));

// catch 404 and forward to error handler
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
db.connect(db.MODE_TEST, function(err) {
  if (err) {
    console.log('Unable to connect to MySQL.')
    process.exit(1)
  } else {
    app.listen(7000, function() {
		console.log('Listening on port 7000...')
    })
  }
})

module.exports = app;
