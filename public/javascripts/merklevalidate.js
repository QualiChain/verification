
var transaction = "";
var datecreated = 0;
var datecreatedstr = "";
var owner = "";
var ipfsindexhash  = "";
var ipfspath  = ""
var domain = "";
var protocol = "";
var address = "";

function ajaxcall(parameterjson, path, handler) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			console.log(this.responseText);
			try {
				response = JSON.parse(this.responseText);
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
				} else {
					handler(response);
				}
			} catch (e) {
				var respone = {};
				response.error = e;
				handler(response);
			}
		}
	};
	xhttp.open("POST", path, true);
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify(parameterjson));
}

function addzero(number) {
	if (number <10) number = "0" + number;
	return number;
}

function hashQuads(quad) {
	//console.log(quad);
	if (quad) {
		//console.log(JSON.stringify(quad));
		//var quadString = (quad.graph ? (quad.graph.value ? '<' + quad.graph.value + '>' : '') : '') +
		var quadString = (quad.graph.value ? '<' + quad.graph.value + '>' : '') +
		'<' + quad.subject.value + '> <' +
		quad.predicate.value + '> ';
		if (quad.object.termType != "Literal") {
			quadString += '<' + quad.object.value + '>';
		} else {
			quadString += '"' + quad.object.value + '"';
			if (quad.object.language) {
				quadString += '@' + quad.object.language;
			}
			if (quad.object.datatype) {
				quadString += '^^<' + quad.object.datatype.value + '>';
			}
		}
		quadString += ' .';
		return quadString;
	}
}

function init(theprotocol, thedomain, theaddress, theipfspath) {

	domain = thedomain;
	protocol = theprotocol;
	address = theaddress;
	ipfspath = theipfspath;

	var send = {};
	send.contract = address;
	function handler2(response) {
		console.log(response);
		document.getElementById('title').innerHTML = "Title: " + response.title;
	}
	ajaxcall(send, protocol+"://"+domain+cfg.proxy_path+"/merkle/store/title", handler2);


	var send = {};
	if (address != undefined && address != "") {
		send.address = address;
	}

	function handler(response) {
		var date = new Date(response.created * 1000);
		var hours = addzero(date.getHours());
		var minutes = addzero(date.getMinutes());
		var day = addzero(date.getDate());
		var month = addzero(date.getMonth() + 1);
		var year = date.getFullYear();

		transaction = response.transaction;
		datecreated = response.created;
		datecreatedstr = day + "/" + month + "/" + year + " " + hours + ":" + minutes;
		owner = response.owner;
		ipfsindexhash = response.ipfsaddress;
		ipfsindexurl = ipfspath;
		document.getElementById("indexurl").innerHTML = "URL to Merkle Tree Index: <a href='" + ipfsindexurl + ipfsindexhash + "'>" + ipfsindexurl + ipfsindexhash + "</a>";

		//indexjson = getIPFSJSON(indexurl);
		//console.log(indexjson);
		//getIPFSIndexJSON(response.ipfsaddress);
	}
	ajaxcall(send, protocol+"://"+domain+cfg.proxy_path+"/merkle/store", handler);

	var formset = document.getElementById('merkleset');
	formset.onsubmit = function() {
		document.body.style.cursor = "wait";
		document.getElementById("validatesetbutton").disabled = true;
		document.getElementById("validatesetresult").style.display = "none";
		var formData = new FormData(formset);

		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 201) {
				var response = JSON.parse(this.responseText);
				document.body.style.cursor = "default";
				document.getElementById("validatesetbutton").disabled = false;
				//if (response.token != undefined) token = response.token;
			} else if (this.readyState == 4) {
				try {
					console.log(this.responseText);
					var response = JSON.parse(this.responseText);
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
					} else {
						//act on response
						var validdiv = document.getElementById("validatesetresult");
						if (response.status == "passed") {
							validdiv.innerHTML = "<div class=\"bigboxdiv greenb\">&#10004;</div>";
							validdiv.style.display = "block";
						} else {
							validdiv.innerHTML = "<div class=\"bigboxdiv redb\">&#10006;</div>";
							validdiv.style.display = "block";
						}
					}
				} catch (e) {
					error = e;
				}

				if (error != "") alert(error);
				document.body.style.cursor = "default";
				document.getElementById("validatesetbutton").disabled = false;
				return false;
			}
		};

		// Add any event handlers here...
		xhttp.open('POST', protocol+"://"+domain+cfg.proxy_path+"/merkle/validate/set", true);
		xhttp.send(formData);
		return false; // To avoid actual submission of the form
	}

	form = document.getElementById('merklesetfromurl');
	form.onsubmit = function() {
		document.body.style.cursor = "wait";
		document.getElementById("validatesetfromurlbutton").disabled = true;
		document.getElementById("validatesetresult").style.display = "none";
		var formData = new FormData(form);
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 201) {
				var response = JSON.parse(this.responseText);
				document.body.style.cursor = "default";
				document.getElementById("validatesetfromurlbutton").disabled = false;
				//if (response.token != undefined) token = response.token;
			} else if (this.readyState == 4) {
				try {
					console.log(this.responseText);
					var response = JSON.parse(this.responseText);
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
					} else {
						//act on response
						var validdiv = document.getElementById("validatesetresult");
						if (response.status == "passed") {
							validdiv.innerHTML = "<div class=\"bigboxdiv greenb\">&#10004;</div>";
							validdiv.style.display = "block";
						} else {
							validdiv.innerHTML = "<div class=\"bigboxdiv redb\">&#10006;</div>";
							validdiv.style.display = "block";
						}
					}
				} catch (e) {
					error = e;
				}
				if (error != "") alert(error);
				document.body.style.cursor = "default";
				document.getElementById("validatesetfromurlbutton").disabled = false;
				return false;
			}
		};
		// Add any event handlers here...
		xhttp.open('POST', protocol+"://"+domain+cfg.proxy_path+"/merkle/validate/setfromurl", true);
		xhttp.send(formData);

		return false; // To avoid actual submission of the form
	}

	formsingle = document.getElementById('validatesingle');
	formsingle.onsubmit = function() {
		document.body.style.cursor = "wait";
		document.getElementById("validatesinglebutton").disabled = true;
		//document.getElementById("validatesetresult").style.display = "none";
		var postdata = {};
		postdata.contract = formsingle.contract.value;
		postdata.triple = formsingle.triple.value;
		console.log(postdata);
		var xhttpsingle = new XMLHttpRequest();
		xhttpsingle.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 201) {
				var response = JSON.parse(this.responseText);
				document.body.style.cursor = "default";
				document.getElementById("validatesinglebutton").disabled = false;
				//if (response.token != undefined) token = response.token;
			} else if (this.readyState == 4) {
				console.log(this.responseText);
				var response = JSON.parse(this.responseText);
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
				} else {
					//act on response
					var validdiv = document.getElementById("validatesingleresult");
					if (response.status == "passed") {
						validdiv.innerHTML = "<div class=\"bigboxdiv greenb\">&#10004;</div>";
						validdiv.style.display = "block";
					} else {
						validdiv.innerHTML = "<div class=\"bigboxdiv redb\">&#10006;</div>";
						validdiv.style.display = "block";
					}
				}
				if (error != "") alert(error);
				document.body.style.cursor = "default";
				document.getElementById("validatesinglebutton").disabled = false;
				return false;
			}
		};
		// Add any event handlers here...
		xhttpsingle.open('POST', protocol+"://"+domain+cfg.proxy_path+"/merkle/validate/single", true);
		xhttpsingle.setRequestHeader("Content-type", "application/json");
		console.log(JSON.stringify(postdata));
		xhttpsingle.send(JSON.stringify(postdata));

		return false; // To avoid actual submission of the form
	}

	formsubset = document.getElementById('merklesubset');
	formsubset.onsubmit = function() {
		document.body.style.cursor = "wait";
		document.getElementById("validatesubsetbutton").disabled = true;
		document.getElementById("validatesubsetresult").style.display = "none";
		var formSubData = new FormData(formsubset);
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 201) {
				var response = JSON.parse(this.responseText);
				document.body.style.cursor = "default";
				document.getElementById("validatesubsetbutton").disabled = false;
				//if (response.token != undefined) token = response.token;
			} else if (this.readyState == 4) {
				console.log(this.responseText);
				try {
					var response = JSON.parse(this.responseText);
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
					} else {
						//act on response
						var validdiv = document.getElementById("validatesubsetresult");
						if (response.status == "passed") {
							validdiv.innerHTML = "<div class=\"bigboxdiv greenb\">&#10004;</div>";
							validdiv.style.display = "block";
						} else {
							validdiv.innerHTML = "<div class=\"bigboxdiv redb\">&#10006;</div>";
							validdiv.style.display = "block";
						}

						var html = "Per triple validation detail:</br></br>";
						html += "<table style='font-size: 16px; border: 1px solid black; padding: 6px;'>";
						for (i = 0; i < response.result.length; i++) {
							if (i%2==1){
								html += "<tr style=\"background-color:#eee\">";
							} else {
								html += "<tr>";
							}
							html += "<td style='padding: 6px; border: 1px solid black;'>";
							html += HTMLEncode(hashQuads(response.result[i].quad));
							html += "</td>";

							html += "<td style='padding: 6px; border: 1px solid black;'>";

							if (response.result[i].status == "passed") {
								html += "<div class=\"boxdiv greenb\">&#10004;</div>";
							} else {
								html += "<div class=\"boxdiv redb\">&#10006;</div>";
							}
							html += "</td>";
							html += "</tr>";

						}
						html += "</table>";
						document.getElementById("validatesubsetrecordresult").innerHTML = html;
						document.getElementById("validatesubsetrecordresult").style.display = "block";
					}
				} catch (e) {
					error = e;
				}
				if (error != "") alert(error);
				document.body.style.cursor = "default";
				document.getElementById("validatesubsetbutton").disabled = false;
				return false;
			}
		};
		// Add any event handlers here...
		xhttp.open('POST', protocol+"://"+domain+cfg.proxy_path+"/merkle/validate/subset", true);
		xhttp.send(formSubData);
		return false; // To avoid actual submission of the form
	}

	var formsubsetfromurl = document.getElementById('merklesubsetfromurl');
	formsubsetfromurl.onsubmit = function() {
		document.body.style.cursor = "wait";
		document.getElementById("validatesubsetfromurlbutton").disabled = true;
		document.getElementById("validatesubsetresult").style.display = "none";
		var formSubData = new FormData(formsubsetfromurl);
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 201) {
				var response = JSON.parse(this.responseText);
				document.body.style.cursor = "default";
				document.getElementById("validatesubsetfromurlbutton").disabled = false;
				//if (response.token != undefined) token = response.token;
			} else if (this.readyState == 4) {
				console.log(this.responseText);
				try {
					var response = JSON.parse(this.responseText);
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
					} else {
						//act on response
						var validdiv = document.getElementById("validatesubsetresult");
						if (response.status == "passed") {
							validdiv.innerHTML = "<div class=\"bigboxdiv greenb\">&#10004;</div>";
							validdiv.style.display = "block";
						} else {
							validdiv.innerHTML = "<div class=\"bigboxdiv redb\">&#10006;</div>";
							validdiv.style.display = "block";
						}

						var html = "Per triple validation detail:</br></br>";
						html += "<table style='font-size: 16px; border: 1px solid black; padding: 6px;'>";
						for (i = 0; i < response.result.length; i++) {
							if (i%2==1){
								html += "<tr style=\"background-color:#eee\">";
							} else {
								html += "<tr>";
							}
							html += "<td style='padding: 6px; border: 1px solid black;'>";
							html += HTMLEncode(hashQuads(response.result[i].quad));
							html += "</td>";

							html += "<td style='padding: 6px; border: 1px solid black;'>";

							if (response.result[i].status == "passed") {
								html += "<div class=\"boxdiv greenb\">&#10004;</div>";
							} else {
								html += "<div class=\"boxdiv redb\">&#10006;</div>";
							}
							html += "</td>";
							html += "</tr>";

						}
						html += "</table>";
						document.getElementById("validatesubsetrecordresult").innerHTML = html;
						document.getElementById("validatesubsetrecordresult").style.display = "block";
					}
				} catch (e) {
					error = e;
				}
				if (error != "") alert(error);
				document.body.style.cursor = "default";
				document.getElementById("validatesubsetfromurlbutton").disabled = false;
				return false;
			}
		};
		// Add any event handlers here...
		xhttp.open('POST', protocol+"://"+domain+cfg.proxy_path+"/merkle/validate/subsetfromurl", true);
		xhttp.send(formSubData);

		return false; // To avoid actual submission of the form
	}

}

function HTMLEncode(str) {
	var i = str.length,
	aRet = [];

	while (i--) {
		var iC = str[i].charCodeAt();
		if (iC < 65 || iC > 127 || (iC>90 && iC<97)) {
			aRet[i] = '&#'+iC+';';
		} else {
			aRet[i] = str[i];
		}
	}
	return aRet.join('');
}
