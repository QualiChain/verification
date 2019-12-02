
var form;
var domain = "";
var protocol = "";

function getlist(flash) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 201) {
			var response = JSON.parse(this.responseText);
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
				var thediv =document.getElementById("storedlist");
				if (response.storedrdfs.length == 0) {
					thediv.innerHTML = "Currently you have no stored RDF Merkle Trees";
				} else {
					var html = "<table id=\"eventtable\" style='width: 100%;font-size: 16px; border: 1px solid grey; padding: 6px;'>";
					html += "<tr>";
					html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Title</th>";
					html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Created</th>";
					html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Contract</th>";
					html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>View</th>";
					html += "<th style='background-color: lightgrey; padding: 6px; border: 1px solid grey; text-align: center;'>Validate</th>";
					html += "</tr>";
					for (i = 0; i < response.storedrdfs.length; i++) {
						var date = new Date(response.storedrdfs[i].created * 1000);
						var hours = addzero(date.getHours());
						var minutes = addzero(date.getMinutes());
						var day = addzero(date.getDate());
						var month = addzero(date.getMonth() + 1);
						var year = date.getFullYear();

						if (flash && i == 0) {
							html += "<tr id='latest' style='background-color: #fcf4b0'>";

						} else {
							html += "<tr>";
						}
						html += "<td style='padding: 6px; border: 1px solid grey;'>";
						html += response.storedrdfs[i].title;
						html += "</td>";
						html += "<td style='padding: 6px; border: 1px solid grey;'>";
						html += day + "/" + month + "/" + year + " " + hours + ":" + minutes;
						html += "</td>";
						html += "<td style='padding: 6px; border: 1px solid grey;'>";
						html += response.storedrdfs[i].contract;
						html += "</td>";
						html += "<td style='width: 100px; padding: 6px; border: 1px solid grey;' align='center'>";
						//html += "<button style='min-height:30px;border-radius:5px;background-color:#ccc;border:0;' onclick='viewpage(\"" + response.storedrdfs[i].contract + "\");'>view</button>";
						html += "<button class=\"viewBut\" onclick='viewpage(\"" + response.storedrdfs[i].contract + "\");'>view</button>";
						html += "</td>";
						html += "<td style='width: 100px; padding: 6px; border: 1px solid grey;' align='center'>";
						//html += "<button style='min-height:30px;border-radius:5px;background-color:#ccc;border:0;' onclick='validatepage(\"" + response.storedrdfs[i].contract + "\");'>validate</button>";
						html += "<button class=\"viewBut\" onclick='validatepage(\"" + response.storedrdfs[i].contract + "\");'>validate</button>";
						//html += "&nbsp;";
						html += "</td>";
						html += "</tr>";
					}
					html += "</table>";
					thediv.innerHTML = html;
					if (flash) {
						setTimeout(function(){ document.getElementById("latest").style.backgroundColor="white"; }, 3000);
					}
				}
			}
			if (error != "") alert(error);
			return false;
		}
	};
	xhttp.open("POST", protocol +"://"+ domain +cfg.proxy_path+"/merkle/list", true);
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send("{}");
}

function addzero(number) {
	if (number <10) number = "0" + number;
	return number;
}

function viewpage(address) {
	window.location.href = cfg.proxy_path+"/merkle/store/view/?address=" + address;
}

function validatepage(address) {
	window.location.href = cfg.proxy_path+"/merkle/validate/view/?address=" + address;
}

function init(theprotocol, thedomain) {

	protocol = theprotocol;
	domain = thedomain;

	form = document.getElementById('merkle');
	form.onsubmit = function() {
		document.body.style.cursor = "wait";
		document.getElementById("addbutton").disabled = true;
		var formData = new FormData(form);
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 201) {
				var response = JSON.parse(this.responseText);
				document.body.style.cursor = "default";
				document.getElementById("addbutton").disabled = false;
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
					getlist(true);
				}
				if (error != "") alert(error);
				document.body.style.cursor = "default";
				document.getElementById("addbutton").disabled = false;
				return false;
			}
		};
		// Add any event handlers here...
		xhttp.open('POST', protocol +"://"+ domain +cfg.proxy_path+"/merkle/list/createMerkle", true);
		xhttp.send(formData);

		return false; // To avoid actual submission of the form
	}
	getlist(false);
}
