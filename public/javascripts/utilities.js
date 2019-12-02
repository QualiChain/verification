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
/** Author: Kevin Quick, KMi, The Open University **/

/**
 * http://www.456bereastreet.com/archive/201105/validate_url_syntax_with_javascript/
 * MB: I modified the original as I could not get it to work as it was.
 */
function isValidURI(uri) {
    if (!uri) uri = "";

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
 * Taken From - http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
 */
function isValidEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
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

function showError(response) {

	console.log(response.error);

	var error = "";
	if (response.error) {
		var count = 0;
		for(var prop in response.error) {
			if (response.error[prop].msg) {
				if(error != "") error += "\n";
				error += response.error[prop].msg;
			} else {
				break;
			}
			count += 1;
		}
		if (count == 0 && error == "") error = response.error;
		if (error != "") alert(error);
	}
}

function makeRequest(method, path, properties, handler) {

	//console.log("PATH: "+path);

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {

		//console.log("responseText:");
		//console.log(this.responseText);

		if (this.readyState == 4 && this.status == 200) {
		   // Action to be performed when the document is read;
		   if (this.readyState == 4) {
				//console.log("RESPONSE from read function = " + this.responseText);
				try {
					var response = JSON.parse(this.responseText);
					handler(response);
				} catch(err) {
					console.log(err);
				}
		   }
		} else if (this.readyState == 4 && this.status != 200) {
			//console.log(this.responseText);
			try {
				var response = JSON.parse(this.responseText);
				handler(response);
			} catch(err) {
				console.log(err);
			}
		}
	};

	xhttp.open(method, path, true);

	if (properties && properties != {}) {
		xhttp.setRequestHeader("Content-type", "application/json");
		xhttp.send(JSON.stringify(properties));
	} else {
		xhttp.send();
	}
}