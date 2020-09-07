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
	if (document.cookie.split(';').filter((item) => item.trim().startsWith('roles=')).length) {
		var result = document.cookie.split(';').filter((item) => item.trim().startsWith('roles='));
		if (result != "") {
			roles = (result[0].substr(7)).split(',');
		}
	}
	if (roles.includes("admin")) {
		html += '<a href="'+cfg.proxy_path+'/admin/"><div class="frontbut">Admin</div></a>';
		html += '<a href="'+cfg.proxy_path+'/merkle/"><div class="frontbut">Verifiable RDF Data Sets</div></a>';
	}

	if (roles.includes("issuer")) {
		html += '<a href="'+cfg.proxy_path+cfg.badges_path+'/portfolio/"><div class="frontbut">Badge Portfolio</div></a>';
	} else {
		html += '<a href="'+cfg.proxy_path+'/badges/educators/"><div class="frontbut">Educators</div></a>';
	}
	if (roles.includes("recipient")) {
		html += '<a href="'+cfg.proxy_path+'/portfolio/"><div class="frontbut">Badge Portfolio</div></a>';
	} else {
		html += '<a href="'+cfg.proxy_path+'/recipients/information/"><div class="frontbut">Learners</div></a>';
	}

	html += '<a href="'+cfg.proxy_path+cfg.badges_path+'/validation/"><div class="frontbut">Validate a Badge</div></a>';
	html += '<a href="'+cfg.proxy_path+cfg.badges_path+'/claims/"><div class="frontbut">Claim a Badge</div></a>';
	html += '<a href="'+cfg.proxy_path+cfg.badges_path+'/badgetypespage/"><div class="frontbut">IoC Endorsed Badges</div></a>';
	html += '<a href="'+cfg.proxy_path+cfg.badges_path+'/docindex/"><div class="frontbut">API Documentation</div></a>';
	//html += '<a href="http://ioc.kmi.open.ac.uk/"><div class="frontbut">SFIA</div></a>';

	document.getElementById("homebuttons").innerHTML = html;
}