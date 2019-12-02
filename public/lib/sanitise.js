/*********************************************************************************
* The MIT License (MIT)                                                          *
*                                                                                *
* Copyright (c) 2017 KMi, The Open University UK                                 *
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

/**
 * Sanitise library
 * Functions to santiased passed parameters
 */

/**
 * PARAM_INT - integers only, use when expecting only numbers.
 */
const PARAM_INT = 1;

/**
 * PARAM_ALPHA - contains only english letters.
 */
const PARAM_ALPHA = 2;

 /**
 * PARAM_TEXT - general plain text compatible with multilang filter, no other html tags.
 */
const PARAM_TEXT = 3;

/**
 * PARAM_PATH - safe windows path
 */
const PARAM_PATH_WIN = 4;

/**
 * PARAM_PATH - safe Linux path
 */
const PARAM_PATH_LINUX = 5;

/**
 * PARAM_URL - expected properly formatted URL. Please note that domain part is required, http://localhost/ is not acceppted but http://localhost.localdomain/ is ok.
 */
const PARAM_URL = 6;

/**
 * PARAM_BOOL - converts input into 0 or 1, use for switches in forms and urls.
 */
const PARAM_BOOL = 7;

/**
 * PARAM_HTML - keep the HTML as HTML
 * note: do not forget to addslashes() before storing into database!
 */
const PARAM_HTML = 8;

/**
 * PARAM_ALPHANUM - expected numbers and letters only.
 */
const PARAM_ALPHANUM = 9;

/**
 * PARAM_ALPHAEXT the same contents as PARAM_ALPHA plus the chars in quotes: "/-_" allowed,
 */
const PARAM_ALPHAEXT = 10;

/**
 * PARAM_BOOL - checks input is an allowed boolean type (true,false,yes,no,on,off,0,1).
 */
const PARAM_BOOLTEXT = 11;

/**
 * PARAM_NUMBER - returns float, use when expecting only numbers.
 */
const PARAM_NUMBER = 12;

/**
 * PARAM_EMAIL- checks the string is an email address format.
 */
const PARAM_EMAIL = 13;

 /**
  * PARAM_XML - checks the string is an xml.
  */
const PARAM_XML = 14;

/**
 * PARAM_ALPHANUMEXT the same contents as PARAM_ALPHANUM plus the char: "-" allowed.
 * Used for ids mostly
 */
const PARAM_ALPHANUMEXT = 15;

const PARAM_HEX = 16;

function getQueryVariable(variable) {
	var query = window.location.search.substring(1);

	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		if (decodeURIComponent(pair[0]) == variable) {
			return decodeURIComponent(pair[1]);
		}
	}

	return "";
	console.log('Query variable %s not found', variable);
}

/**
 * Returns a particular value for the named variable, taken from
 * location.search.  If the parameter does not exist then an error is
 * thrown because we require this variable.
 *
 * @param string parname the name of the page parameter we want
 * @param int type expected type of parameter
 * @return mixed
 */
function required_param(parname, type) {
	if (type == undefined) {
		type = PARAM_ALPHAEXT;
	}

	var param = getQueryVariable(parname);
	if (param != "") {
		param = cleanParam(param, type);
	}
	return param;
}

/**
 * Returns a particular value for the named variable, taken from
 * location.search, otherwise returning a given default.
 *
 * @param string parname the name of the page parameter we want
 * @param mixed  defaultvalue the default value to return if nothing is found
 * @param int type expected type of parameter
 * @return mixed
 */
function optional_param(parname, defaultvalue, type) {
	if (type == undefined) {
		type = PARAM_ALPHAEXT;
	}
	if (defaultvalue == undefined) {
		defaultvalue = null;
	}

	var param = getQueryVariable(parname);
	if (param != "") {
		param = cleanParam(param, type);
	} else {
		param = defaultvalue;
	}
	return param;
}

/**
 * Clean the passed parameter
 *
 * @param mixed param the variable we are cleaning
 * @param int type expected format of param after cleaning.
 * @return mixed
 */
function cleanParam(param, type) {

    switch (type) {

        case PARAM_TEXT:    // leave only tags needed for multilang
            if (isNumeric(param)) {
                return param;
            }

            param = stripSlashes(param);
            param = cleanText(param);
			param = stripTags(param,'<lang><span>');

			param.replace(/"/g, '&quot;');
			param.replace(/'/g, '&#039;');
			param.replace(/\+/g, '&#43;');
			param.replace(/\(/g, '&#40;');
			param.replace(/\)/g, '&#41;');

			param.replace(/=/g, '&#61;');

            return param;

        case PARAM_HTML:    // keep as HTML, no processing
            param = stripSlashes(param);
            param = cleanText(param);
            return param.trim();

        case PARAM_INT:
            return parseInt(param); //NaN

        case PARAM_NUMBER:
            return parseFloat(param); //NaN

        case PARAM_ALPHA:        // Remove everything not a-z
        	return parama.replace(/[^a-z]/gi,'');

        case PARAM_ALPHANUM:     // Remove everything not a-z 0-9
        	return parama.replace(/[^a-z0-9]/gi,'');

        case PARAM_ALPHAEXT:     // Remove everything not a-z / _ -
        	return parama.replace(/[^a-z\/_-]/gi,'');

        case PARAM_ALPHANUMEXT:     // Remove everything not a-z 0-9 -
        	return parama.replace(/[^a-z0-9-]/gi,'');

        case PARAM_BOOL:         // Convert to 1 or 0
            var tempstr = param.toLowerCase();
            if (tempstr == 'on' || tempstr == 'yes' || tempstr == 'true') {
                param = 1;
            } else if (tempstr == 'off' || tempstr == 'no' || tempstr == 'false') {
                param = 0;
            } else {
                param = empty(param) ? 0 : 1;
            }
            return param;

        case PARAM_BOOLTEXT:         // check is an allowed text type boolean
            var tempstr = param.toLowerCase();
            if (tempstr == 'on' || tempstr == 'yes' || tempstr == 'true' || tempstr == 'off'
            		|| tempstr == 'no' || tempstr == 'false' || tempstr == '0' | tempstr == '1') {
                param = param;
            } else {
                param = "";
            }
            return param;

        case PARAM_PATH_WIN:     // Strip all suspicious characters from Windows file path
			if (!windowsPathValidation(param)) {
				param = "";
			}
            return param

        case PARAM_PATH_LINUX:     // Strip all suspicious characters from Linux file path
			if (!linuxPathValidation(param) ) {
				param = "";
			}
            return param

        case PARAM_URL:          // allow safe ftp, http, mailto urls

        	console.log("URL:"+param);

           	if (!isValidURI(param)) {
				 param = '';
            }
            return param;

 		case PARAM_EMAIL:
		    if(!validateEmail(param)) {
		        param = '';
		    }
		    return param

 		case PARAM_XML:
 			return parseFromXML(param);

		case PARAM_HEX:
			return cleanForHexNumber(param);

        default:
        	return '';
    }
}

/**
 * http://stackoverflow.com/questions/36042999/javascript-hexadecimal-number-validation-using-regular-expression
 */
function cleanForHexNumber(param) {
    var regExp = /^[-+]?[0-9A-Fa-f]+\.?[0-9A-Fa-f]*?$/;
	if (regExp.test(param)) {
		param = '';
	}
	return param;
}

/**
 * eslint-disable-line camelcase
 * discuss at: http://locutus.io/php/stripTags/
 * original by: Kevin van Zonneveld (http://kvz.io)
 * improved by: Luke Godfrey
 * improved by: Kevin van Zonneveld (http://kvz.io)
 *    input by: Pul
 *    input by: Alex
 *    input by: Marc Palau
 *    input by: Brett Zamir (http://brett-zamir.me)
 *    input by: Bobby Drake
 *    input by: Evertjan Garretsen
 * bugfixed by: Kevin van Zonneveld (http://kvz.io)
 * bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
 * bugfixed by: Kevin van Zonneveld (http://kvz.io)
 * bugfixed by: Kevin van Zonneveld (http://kvz.io)
 * bugfixed by: Eric Nagel
 * bugfixed by: Kevin van Zonneveld (http://kvz.io)
 * bugfixed by: Tomasz Wesolowski
 * revised by: Rafal Kukawski (http://blog.kukawski.pl)
 * 	example 1: stripTags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>')
 * 	returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
 *	example 2: stripTags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>')
 *	returns 2: '<p>Kevin van Zonneveld</p>'
 *	example 3: stripTags("<a href='http://kvz.io'>Kevin van Zonneveld</a>", "<a>")
 *	returns 3: "<a href='http://kvz.io'>Kevin van Zonneveld</a>"
 *	example 4: stripTags('1 < 5 5 > 1')
 *	returns 4: '1 < 5 5 > 1'
 *	example 5: stripTags('1 <br/> 1')
 *	returns 5: '1  1'
 *	example 6: stripTags('1 <br/> 1', '<br>')
 *	returns 6: '1 <br/> 1'
 *	example 7: stripTags('1 <br/> 1', '<br><br/>')
 *	returns 7: '1 <br/> 1'
 *
 *  making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
 */
function stripTags(input, allowed) {
	allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
	var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi
	return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
		return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
	});
}

/**
 *       discuss at: http://locutus.io/php/stripSlashes/
 *      original by: Kevin van Zonneveld (http://kvz.io)
 *      improved by: Ates Goral (http://magnetiq.com)
 *      improved by: marrtins
 *      improved by: rezna
 *         fixed by: Mick@el
 *      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
 *      bugfixed by: Brett Zamir (http://brett-zamir.me)
 *         input by: Rick Waldron
 *         input by: Brant Messenger (http://www.brantmessenger.com/)
 * reimplemented by: Brett Zamir (http://brett-zamir.me)
 *        example 1: stripSlashes('Kevin\'s code')
 *        returns 1: "Kevin's code"
 *        example 2: stripSlashes('Kevin\\\'s code')
 *        returns 2: "Kevin\'s code"
 */
function stripSlashes(str) {
  return (str + '')
    .replace(/\\(.?)/g, function (s, n1) {
      switch (n1) {
        case '\\':
          return '\\'
        case '0':
          return '\u0000'
        case '':
          return ''
        default:
          return n1
      }
    })
}

/**
 * Taken from - http://javascript.about.com/library/bladdslash.htm
 */
/*function stripSlashes(str) {
    str = str.replace(/\\'/g, '\'');
    str = str.replace(/\\"/g, '"');
    str = str.replace(/\\0/g, '\0');
    str = str.replace(/\\\\/g, '\\');
    return str;
}
*/

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Taken from - http://stackoverflow.com/questions/2030285/regex-for-file-path-validation-in-javascript
 */
function linuxPathValidation(contPathLinux) {
    for(var k=0;k<contPathLinux.length;k++){
        if(contPathLinux.charAt(k).match(/^[\\]$/) ){
            return false;
        }
    }
    if(contPathLinux.charAt(0) != "/") {
        return false;
    }
    if(contPathLinux.charAt(0) == "/" && contPathLinux.charAt(1) == "/") {
        return false;
    }
    return true;
}

/**
 * Taken from - http://stackoverflow.com/questions/2030285/regex-for-file-path-validation-in-javascript
 */
function windowsPathValidation(contwinpath) {
    if((contwinpath.charAt(0) != "\\" || contwinpath.charAt(1) != "\\")
    	|| (contwinpath.charAt(0) != "/" || contwinpath.charAt(1) != "/")) {
       if(!contwinpath.charAt(0).match(/^[a-zA-Z]/)) {
            return false;
       }
       if(!contwinpath.charAt(1).match(/^[:]/) || !contwinpath.charAt(2).match(/^[\/\\]/)) {
           return false;
       }
  	}
}

/**
 * Replace XML entities with their character equivalents
 *
 * @param string xmlStr
 * @return string
 */
function parseFromXML(xmlStr) {
    xmlStr.replace('&amp;', '&');
    xmlStr.replace('&lt;', '<');
    xmlStr.replace('&gt;', '>');
    xmlStr.replace('&quot;', '"');
    xmlStr.replace('&#39;', "'");
    return xmlStr;
}

/**
 * Taken From - http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
 */
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/**
 * http://www.456bereastreet.com/archive/201105/validate_url_syntax_with_javascript/
 * MB: I modified the original as I could not get it to work as it was.
 */
function isValidURI(uri) {
    if (!uri) uri = "";

	//SERVER SIDE URL VALIDATION
	//at some point the two should match!
	//'protocol' => '((http|https|ftp|mailto)://)',
	//'access' => '(([a-z0-9_]+):([a-z0-9-_]*)@)?',
	//'sub_domain' => '(([a-z0-9_-]+\.)*)',
	//'domain' => '(([a-z0-9-]{2,})\.)',
	//'tld' =>'([a-z0-9_]+)',
	//'port'=>'(:(\d+))?',
	//'path'=>'((/[a-z0-9-_.%~]*)*)?',
	//'query'=>'(\?[^? ]*)?'

   	var schemeRE = /^([-a-z0-9]|%[0-9a-f]{2})*$/i;

   	var authorityRE = /^([-a-z0-9.:]|%[0-9a-f]{2})*$/i;

   	var pathRE = /^([-a-z0-9._~:@!$&'()*+,;=\//#]|%[0-9a-f]{2})*$/i;

    var qqRE = /^([-a-z0-9._~:@!$&'\[\]()*+,;=?\/]|%[0-9a-f]{2})*$/i;
    var qfRE = /^([-a-z0-9._~:@!$&#'\[\]()*+,;=?\/]|%[0-9a-f]{2})*$/i;

    var parser = /^(?:([^:\/?]+):)?(?:\/\/([^\/?]*))?([^?]*)(?:\?([^\#]*))?(?:(.*))?/;

    var result = uri.match(parser);

    var scheme    = result[1] || null;
    var authority = result[2] || null;
    var path      = result[3] || null;
    var query     = result[4] || null;
    var fragment  = result[5] || null;

    //console.log("scheme="+scheme);
    //console.log("authority="+authority);
    //console.log("path="+path);
    //console.log("query="+query);
    //console.log("fragment="+fragment);

    if (!scheme || !scheme.match(schemeRE)) {
    	//console.log('scheme failed');
        return false;
    }

    if (!authority || !authority.match(authorityRE)) {
    	//console.log('authority failed');
        return false;
    }
    if (path != null && !path.match(pathRE)) {
    	//console.log('path failed');
        return false;
    }
    if (query && !query.match(qqRE)) {
    	//console.log('query failed');
        return false;
    }
    if (fragment && !fragment.match(qfRE)) {
    	//console.log('fragment failed');
        return false;
    }

    return true;
}

/**
 * http://www.wohill.com/javascript-regular-expression-for-url-check/
 */
function urlCheck(str) {
	var v = new RegExp();
	v.compile("^[A-Za-z]+://[A-Za-z0-9-_]+\\.[A-Za-z0-9-_%&\?\/.=]+$");
	if (!v.test(str)) {
		return false;
	}
	return true;
}

/**
 *Code from - https://www.sitepoint.com/testing-for-empty-values/
 */
function empty(data) {
	if(typeof(data) == 'number' || typeof(data) == 'boolean') {
		return false;
	}
	if(typeof(data) == 'undefined' || data === null) {
		return true;
	}
	if(typeof(data.length) != 'undefined') {
		return data.length == 0;
	}
	var count = 0;
	for(var i in data) {
		if(data.hasOwnProperty(i)) {
		  count ++;
		}
	}
	return count == 0;
}

/**
 * Check whether a string looks like a valid email address
 *
 * @param string $email
 * @return boolean
 */
function validEmail($email){
    if(preg_match("/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/i", $email)) {
        return true;
    } else {
        return false;
    }
}

/**
* Taken from - https://gist.github.com/dsheiko/2774533
* strtr() for JavaScript
* Translate characters or replace substrings
*
* @author Dmitry Sheiko
* @version strtr.js, v 1.0
* @license MIT
* @copyright (c) Dmitry Sheiko http://dsheiko.com
**/
String.prototype.strtr = function (replacePairs) {
    "use strict";
    var str = this.toString(), key, re;
    for (key in replacePairs) {
        if (replacePairs.hasOwnProperty(key)) {
            re = new RegExp(key, "g");
            str = str.replace(re, replacePairs[key]);
        }
    }
    return str;
}

function demicrosoftize(str) {

    str = str.replace("\x82","'");
    str = str.replace("\x83","f");
    str = str.replace("\x84","\"");
    str = str.replace("\x85","...");
    str = str.replace("\x86","+");
    str = str.replace("\x87","#");
    str = str.replace("\x89","^");
    str = str.replace("\x8a","\xa6");
    str = str.replace("\x8b","<");
    str = str.replace("\x8c","\xbc");
    str = str.replace("\x8e","\xb4");
    str = str.replace("\x91","'");
    str = str.replace("\x92","'");
    str = str.replace("\x93","\"");
    str = str.replace("\x94","\"");
    str = str.replace("\x95","*");
    str = str.replace("\x96","-");
    str = str.replace("\x97","--");
    str = str.replace("\x98","~");
    str = str.replace("\x99","(TM)");
    str = str.replace("\x9a","\xa8");
    str = str.replace("\x9b",">");
    str = str.replace("\x9c","\xbd");
    str = str.replace("\x9e","\xb8");
    str = str.replace("\x9f","\xbe");

	str = str.replace(/[\u2018|\u2019|\u201A]/g, "\'");
	str = str.replace(/[\u201C|\u201D|\u201E]/g, "\"");
	str = str.replace(/\u2026/g, "...");
	str = str.replace(/[\u2013|\u2014]/g, "-");
	str = str.replace(/\u02C6/g, "^");
	str = str.replace(/\u2039/g, "");
	//str = str.replace(/\u2039/g, "<");
	str = str.replace(/\u203A/g, "");
	//str = str.replace(/\u203A/g, ">");
	str = str.replace(/[\u02DC|\u00A0]/g, " ");

	return str;
}

function cleanIDsInHTML(id) {
	return id;
}

function cleanURLsInHTML(url) {

	var valid = isValidURI(url);
	if (!valid) {
		url="";
	}

	/*var safeurls = '/^(http:|https:)?//('
	safeurls += 'www.youtube.com/embed/';
	safeurls += '|player.vimeo.com/video/';
	safeurls += '|cohere.open.ac.uk/';
	safeurls += '|www.ustream.tv/';
	safeurls += '|www.schooltube.com/';
	safeurls += '|archive.org/';
	safeurls += '|www.blogtv.com/';
	safeurls += '|uk.video.yahoo.com/';
	safeurls += '|www.teachertube.com/';
	safeurls += '|sciencestage.com/';
	safeurls += '|www.flickr.com/';
	safeurls += ')/';
	var found = safeurls.test(url);
	if (!found) {
		url = "";
	}
	*/

	return url;
}

/**
 * Clean up the given text
 *
 * @param string text The text to be cleaned
 * @return string The clean text
 */
function cleanText(text) {
    if (empty(text) || isNumeric(text)) {
       return text.toString();
    }

	text = demicrosoftize(text);
	text = html_sanitize(param, cleanURLsInHTML, cleanIDsInHTML);
	return text;
}
