/*********************************************************************************
* The MIT License (MIT)                                                          *
*                                                                                *
* Copyright (c) 2016 KMi, The Open University UK                                 *
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

var DATE_FORMAT_PROJECT = 'd mmm yyyy';
var EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

categories = [];
subcategories = {};

function addCell(tr, text, wrapit) {
	var td = tr.insertCell();
	td.textContent = text;
	td.style.fontSize = "10pt";
	if (wrapit) {
		td.className = 'wrapit';
	}
	return td;
}


function addSmallTextCell(tr, text, wrapit) {
	var td = tr.insertCell();
	td.textContent = text;
	if (wrapit) {
		td.className = 'wrapit';
	}
	td.style.fontSize = "10pt";
	return td;
}

function addImageCell(tr, text) {
	var oImg = document.createElement("img");
	oImg.setAttribute('src', text);
	oImg.setAttribute('width', '100px');

	var td = tr.insertCell();
	td.appendChild(oImg);
	return td;
}

function addButtons(tr, uniqueid, contract) {

	var button = document.createElement("button");
	button.style.backgroundColor = "transparent";
	button.style.padding = "0px";
	button.style.margin = "0px";
	button.style.border = "none";
	button.style.marginTop = "5px";
	button.style.width="38px";
	button.style.minWidth = "38px";

	var img = document.createElement("img");
	img.src = "/badges/images/eye_grey-sm.png";
	img.alt = "JSON LD logo";
	img.style.width = "34px";
	img.style.padding = "0px";
	img.style.margin = "0px";
	img.onmouseover = function() {
		img.src = cfg.proxy_path+"/images/eye_dark-sm.png";
	}
	img.onmouseout = function() {
		img.src = cfg.proxy_path+"/images/eye_grey-sm.png";
	}
	button.appendChild(img);
	button.title = "Open a user friendly view of the data for this badge - in a new tab";
	button.onclick = function() {
		var url = cfg.proxy_path+'/badges/view/'+uniqueid;
		var win = window.open(url, '_blank');
		win.focus();
	};

	var button2 = document.createElement("button");
	button2.style.backgroundColor = "transparent";
	button2.title = "Open Badge JSON data view of this badge - in a new tab";
	button2.style.padding = "0px";
	button2.style.margin = "0px";
	button2.style.border = "none";
	button2.style.marginTop = "5px";
	button2.style.width="38px";
	button2.style.minWidth = "38px";

	var img2 = document.createElement("img");
	img2.src = cfg.proxy_path+"/images/json_grey-sm.png";
	img2.alt = "JSON LD logo";
	img2.style.width="34px";
	img2.style.padding = "0px";
	img2.style.margin = "0px";
	img2.onmouseover = function() {
		img2.src = cfg.proxy_path+"/images/json_dark-sm.png";
	}
	img2.onmouseout = function() {
		img2.src = cfg.proxy_path+"/images/json_grey-sm.png";
	}
	button2.appendChild(img2);
	button2.style.marginTop = "5px";
	button2.onclick = function() {
		var url = cfg.proxy_path+'/badges/'+uniqueid;
		var win = window.open(url, '_blank');
		win.focus();
	};

	var button3 = document.createElement("button");
	button3.style.backgroundColor = "transparent";
	button3.title = "Open a Badge blockchain data view of this badge - in a new tab";
	button3.style.padding = "0px";
	button3.style.margin = "0px";
	button3.style.border = "none";
	button3.style.marginTop = "5px";
	button3.style.width="38px";
	button3.style.minWidth = "38px";

	var img3 = document.createElement("img");
	img3.src = cfg.proxy_path+"/images/blockchain_grey-sm.png";
	img3.alt = "view blockchain data icon";
	img3.style.width = "34px";
	img3.style.padding = "0px";
	img3.style.margin = "0px";
	img3.onmouseover = function() {
		img3.src = cfg.proxy_path+"/images/blockchain_dark-sm.png";
	}
	img3.onmouseout = function() {
		img3.src = cfg.proxy_path+"/images/blockchain_grey-sm.png";
	}
	button3.appendChild(img3);
	button3.onclick = function() {
		var url = cfg.proxy_path+'/badges/contract/view/'+contract;
		var win = window.open(url, '_blank');
		win.focus();
	};

	var td = tr.insertCell();
	td.align="center";
	td.style.paddingLeft="0px";
	td.appendChild(button);
	td.appendChild(button2);
	td.appendChild(button3);

	return td;
}

function drawTable(category, subcategory) {
	var table = document.getElementById("thetable");
	table.innerHTML = "";

	// create header
	var thead = table.createTHead();
	var row = thead.insertRow(0);

	var cell = row.insertCell(0);
	cell.width = '120';
	cell.innerHTML = "<b>Image</b>";

	var cell = row.insertCell(1);
	cell.width = '25%';
	cell.innerHTML = "<b>Title</b>";

	var cell = row.insertCell(2);
	//cell.width = '5%';
	cell.innerHTML = "<b>Version</b>";

	var cell = row.insertCell(3);
	//cell.width = '5%';
	cell.innerHTML = "<b>Year</b>";

	var cell = row.insertCell(4);
	//cell.width = '5%';
	cell.innerHTML = "<b>Issued</b>";

	var cell = row.insertCell(5);
	cell.width = '10%';
	cell.innerHTML = "<b>Issuer</b>";

	var cell = row.insertCell(6);
	cell.width = '25%';
	cell.innerHTML = "<b>Issuer Blockchain Account</b>";

	var cell = row.insertCell(7);
	cell.width = '70';
	cell.innerHTML = "<b>View</b>";

	// insert data

	document.getElementById('itemcount').innerHTML = 0;
	var count = 0;

	for (i=0;i<dArray.length;i++){
		var next = dArray[i];
		//console.log(next);

		if ( (category === "all" || next.issuername === category) && (subcategory === "all" || next.year == subcategory)) {

			count++;

			var row = table.insertRow();

			addImageCell(row, next.imageurl);

			addCell(row, next.title, false);
			addCell(row, next.version, true);
			addCell(row, next.year, true);
			addCell(row, next.count, true);
			addCell(row, next.issuername, true);
			addSmallTextCell(row, next.blockchainaddress, true);
			//addCell(row, next.uniqueid, true);

			addButtons(row, next.uniqueid, next.blockchainaddress);
		}
	}

	document.getElementById('itemcount').innerHTML = count;
}

function redrawTable() {

	var categoriesselect = document.getElementById('categories');
	var category = categoriesselect.value;

	var subcategoriesselect = document.getElementById("subcategories");
	var subcategory = subcategoriesselect.value;

	drawTable(category, subcategory);
}

function redrawSubcategories() {
	var subcategoriesselect = document.getElementById("subcategories");
	subcategoriesselect.innerHTML = "";

	var option = document.createElement("option");
	option.textContent = "All";
	option.value = "all";
	subcategoriesselect.appendChild(option);

	var sel = document.getElementById('categories');
	var category = sel.value;

	if (category === "all") {
		subcategoriesselect.value = "all";
	} else {
		subcategoriesfiltered = subcategories[category];

		for (var i=0;i<subcategoriesfiltered.length;i++) {
			var subcategorytitle = subcategoriesfiltered[i];

			var option = document.createElement("option");
			option.textContent = subcategorytitle;
			option.value = subcategorytitle;

			subcategoriesselect.appendChild(option);
		}

		subcategoriesselect.value = "all";
	}

	drawTable(category, 'all');
}

function initPage(){

	// sort by issuer and year
	for (var i=0;i<dArray.length;i++){
		var next = dArray[i];

		if (!categories.includes(next.issuername)) {
			categories.push(next.issuername);
		}
		if (!(next.category in subcategories)) {
			subcategories[next.issuername] = [];
		}
		if (!subcategories[next.issuername].includes(next.year)) {
			subcategories[next.issuername].push(next.year);
		}
	}

	// draw issuer selection list
	var categoriesselect = document.getElementById("categories");
	var option = document.createElement("option");
	option.textContent = "All";
	option.value = "all";
	categoriesselect.appendChild(option);

	for (var i=0;i<categories.length;i++) {
		var categorytitle = categories[i];

		var option = document.createElement("option");
		option.textContent = categorytitle;
		option.value = categorytitle;

		categoriesselect.appendChild(option);
	}

	drawTable("all", "all");

};

document.addEventListener('DOMContentLoaded', function() {
	initPage();
});

