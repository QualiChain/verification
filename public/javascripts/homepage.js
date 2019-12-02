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

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage(){
	var html = "";

	var roles = [];
	var rolesexist = false;
	if (document.cookie.split(';').filter((item) => item.trim().startsWith('roles=')).length) {
		rolesexist = true;
		var result = document.cookie.split(';').filter((item) => item.trim().startsWith('roles='));
		if (result != "") {
			roles = (result[0].substr(7)).split(',');
		}
	}

	if (roles.includes("issuer")) {
		html += '<a href="issuers/"><div class="frontbut"><div class="frontbutdiv"><p>Issuers</p></div></div></a>';
		html += '<a href="merkle/"><div class="frontbut"><div class="frontbutdiv"><p>Verifiable RDF Data Sets</p></div></div></a>';
	}
	if (roles.includes("recipient")) {
		html += '<a href="badges/portfolio/"><div class="frontbut"><div class="frontbutdiv"><p>Badge Portfolios</p></div></div></a>';
		//html += '<a href="merkle/"><div class="frontbut"><div class="frontbutdiv"><p>Verifiable RDF Data Sets</p></div></div></a>';
	}
	if (roles.includes("admin")) {
		html += '<a href="admin/"><div class="frontbut"><div class="frontbutdiv"><p>Admin</p></div></div></a>';
		html += '<a href="merkle/"><div class="frontbut"><div class="frontbutdiv"><p>Verifiable RDF Data Sets</p></div></div></a>';
	}

	html += '<a href="badges/validation/"><div class="frontbut"><div class="frontbutdiv"><p>Validate a Badge</p></div></div></a>';
	html += '<a href="badges/issuedbadges/"><div class="frontbut"><div class="frontbutdiv"><p>Issued Badges</p></div></div></a>';
	//html += '<a href="http://ioc.kmi.open.ac.uk/"><div class="frontbut"><div class="frontbutdiv"><p>SFIA</p></div></div></a>';
	html += '<a href="docindex/"><div class="frontbut"><div class="frontbutdiv"><p>API Documentation</p></div></div></a>';

	if (!rolesexist) {
		html += '<div class="frontbutgray"><div class="frontbutdiv"><p>Issuers</p></div></div>';
		html += '<div class="frontbutgray"><div class="frontbutdiv"><p>Badge Portfolio</p></div></div>';
	}

	document.getElementById("homebuttons").innerHTML = html;
}