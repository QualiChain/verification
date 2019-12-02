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

/** Author: Jon Linney, KMi, The Open University **/
/** Author: Michelle Bachler, KMi, The Open University **/
/** Author: Manoharan Ramachandran, KMi, The Open University **/
/** Author: Kevin Quick, KMi, The Open University **/

var j_toggle=0;
// open and close the menu
function jl_menucontrol(){
	if (j_toggle==0){
		// open menu
		j_toggle=1;
		document.getElementById("j_menu").style.top=0;
		document.getElementById("j_thumb").style.opacity=0;
		document.getElementById("j_cross").style.opacity=1;
	} else {
		// close menu
		j_toggle=0;
		document.getElementById("j_menu").style.top="-"+(document.getElementById("j_menu").clientHeight+5)+"px";
		document.getElementById("j_thumb").style.opacity=1;
		document.getElementById("j_cross").style.opacity=0;
	}
}
// follow the link
function jl_menulink(l){
	// close menu
	j_toggle=0;
	document.getElementById("j_menu").style.top="-"+(document.getElementById("j_menu").clientHeight+5)+"px";
	document.getElementById("j_thumb").style.opacity=1;
	document.getElementById("j_cross").style.opacity=0;
	// follow link
	location.href=l;
}


function signinpage() {
	location.href = cfg.proxy_path+"/users/signinpage";
}

function signout() {
	var message = "Are you sure you want to sign out from this site?";
	var reply = confirm(message);
	if (reply == true) {

		// Null out the cookie.
		var d = new Date();
		d.setTime(0);
		var expires = "expires="+ d.toUTCString();
		document.cookie = "token=;  " + expires + ";path=/";
		document.cookie = "displayname=; " + expires + ";path=/";
		document.cookie = "roles=; " + expires + ";path=/";

		//redirect to home page
		location.href = cfg.proxy_path+"/";
	}
}

function showname() {

	var loginarea = document.getElementById('loginarea');
	var loggedin = false;

	if (document.cookie.split(';').filter((item) => item.trim().startsWith('token=')).length) {
		var result = document.cookie.split(';').filter((item) => item.trim().startsWith('token='));
		if (result != "") {
			if (document.cookie.split(';').filter((item) => item.trim().startsWith('displayname=')).length) {
				var result = document.cookie.split(';').filter((item) => item.trim().startsWith('displayname='));
				loggedin = true;
				loginarea.innerHTML = "sign out: "+result[0].substr(13);
				loginarea.onclick = signout;
				return;
			}
		}
	}

	if (!loggedin) {
		loginarea.onclick = signinpage;
		loginarea.innerHTML = "sign in";
	}
}

function j_menuonload(){
	var html = "<br>";

	var roles = [];
	if (document.cookie.split(';').filter((item) => item.trim().startsWith('roles=')).length) {
		var result = document.cookie.split(';').filter((item) => item.trim().startsWith('roles='));
		if (result != "") {
			roles = (result[0].substr(7)).split(',');
		}
	}

	html += '<a class="j_menulink" onclick="jl_menulink(\''+cfg.proxy_path+'/\')">Home</a><br>';

	// logged in pages - depending on your role(s).
	if (roles.includes("issuer")) {
		html += '<a class="j_menulink" onclick="jl_menulink(\''+cfg.proxy_path+'/issuers/\')">Issuers</a><br>';
		html += '<a class="j_menulink" onclick="jl_menulink(\''+cfg.proxy_path+'/merkle/\')">My RDF Store</a><br>';
	}
	if (roles.includes("recipient")) {
		html += '<a class="j_menulink" onclick="jl_menulink(\''+cfg.proxy_path+'/badges/portfolio/\')">Badge Portfolios</a><br>';
		html += '<a class="j_menulink" onclick="jl_menulink(\''+cfg.proxy_path+'/merkle/\')">My RDF Store</a><br>';
	}
	if (roles.includes("admin")) {
		html += '<a class="j_menulink" onclick="jl_menulink(\''+cfg.proxy_path+'/admin/\')">Admin</a><br>';
		html += '<a class="j_menulink" onclick="jl_menulink(\''+cfg.proxy_path+'/merkle/\')">My RDF Store</a><br>';
	}

	// Public pages
	html += '<a class="j_menulink" onclick="jl_menulink(\''+cfg.proxy_path+'/badges/validation/\')">Validate a Badge</a><br>';
	html += '<a class="j_menulink" onclick="jl_menulink(\''+cfg.proxy_path+'/badges/issuedbadges/\')">View QualiChain Badges</a><br>';
	html += '<a class="j_menulink" onclick="jl_menulink(\'http://ioc.kmi.open.ac.uk/\')">SFIA</a><br>';
	html += '<a class="j_menulink" onclick="jl_menulink(\''+cfg.proxy_path+'/docindex/\')">API Documentation</a><br>';
	html += '<a class="j_menulink" onclick="jl_menulink(\''+cfg.proxy_path+'/privacy/\')">Privacy</a><br>';

	document.getElementById("j_menu").innerHTML = html;

	showname();
}