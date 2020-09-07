

var domain = "";
var protocol = "";
var address = "";
var ipfspath= "";

function ajaxcall(parameterjson, path, handler) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			//console.log(this.responseText);
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
		}
	};
	xhttp.open("POST", path, true);
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify(parameterjson));
}

function init(theprotocol, thedomain, theaddress, theipfspath) {

	domain = thedomain;
	protocol = theprotocol;
	address = theaddress;
	ipfspath = theipfspath;

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

		document.getElementById("contract").innerHTML = response.address;
		document.getElementById("transaction").innerHTML = response.transaction;
		document.getElementById("owner").innerHTML = response.owner;
		document.getElementById("ipfsindex").innerHTML = response.ipfsaddress;
		document.getElementById("created").innerHTML = day + "/" + month + "/" + year + " " + hours + ":" + minutes;

		document.getElementById("transactionid").innerHTML = "Contract Transaction: " + response.transaction;
		getTransaction(response.transaction);

		var indexurl = ipfspath + response.ipfsaddress;
		document.getElementById('ipfsindexurl').innerHTML = "IPFS Address: <a href='" + indexurl + "'>" + indexurl + "</a>";
		//indexjson = getIPFSJSON(indexurl);
		//console.log(indexjson);
		getIPFSIndexJSON(response.ipfsaddress);

		var send = {};
		send.contract = address;
		function handler2(response) {
			document.getElementById('title').innerHTML = "Verifiable RDF Dataset: " + response.title;
		}
		ajaxcall(send, protocol+"://"+domain+cfg.proxy_path+"/merkle/store/title", handler2);

	}
	ajaxcall(send, protocol+"://"+domain+cfg.proxy_path+"/merkle/store", handler);
}


function getTransaction(transaction) {
	var send = {};
	if (address != undefined && address != "") {
		send.transactionnumber = transaction;
	}

	function handler(response) {
		var transactionstr = JSON.stringify(response, null, 2);
		transactionstr = transactionstr.replace(/(?:\r\n|\r|\n)/g, '<br>');
		transactionstr = transactionstr.replace(/(  )/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
		document.getElementById('transactiondata').innerHTML = transactionstr;
		getTransactionReceipt(transaction);
	}
	ajaxcall(send, protocol+"://"+domain+cfg.proxy_path+"/util/transaction", handler);
}


function getTransactionReceipt(transaction) {
	var send = {};
	if (address != undefined && address != "") {
		send.transactionnumber = transaction;
	}

	function handler(response) {
		var blocknumber = response.transactionreceipt.blockNumber;
		console.log(blocknumber);
		var transactionstr = JSON.stringify(response, null, 2);
		transactionstr = transactionstr.replace(/(?:\r\n|\r|\n)/g, '<br>');
		transactionstr = transactionstr.replace(/(  )/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
		document.getElementById('transactionreceiptdata').innerHTML = transactionstr;
		getBlockDetails(blocknumber);
	}
	ajaxcall(send, protocol+"://"+domain+cfg.proxy_path+"/util/transactionreceipt", handler);
}

function getBlockDetails(blocknumber) {
	var send = {};
	if (address != undefined && address != "") {
		send.blocknumber = blocknumber;
	}

	function handler(response) {
		var blockstr = JSON.stringify(response, null, 2);
		blockstr = blockstr.replace(/(?:\r\n|\r|\n)/g, '<br>');
		blockstr = blockstr.replace(/(  )/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
		document.getElementById('blockid').innerHTML = "Block Number: " + blocknumber;
		document.getElementById('blockdata').innerHTML = blockstr;
	}
	ajaxcall(send, protocol+"://"+domain+cfg.proxy_path+"/util/block", handler);
}

function getIPFSIndexJSON(hash) {
	var send = {};
	send.ipfshash = hash;

	function handler(response) {
		ipfsstr = JSON.stringify(response);
		if (ipfsstr.length < 3000000) {
			var ipfsstr = JSON.stringify(response, null, 2);
			ipfsstr = ipfsstr.replace(/(?:\r\n|\r|\n)/g, '<br>');
			ipfsstr = ipfsstr.replace(/(  )/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

		} else {
		}
		document.getElementById('ipfsindexdata').innerHTML = ipfsstr;

		document.getElementById('ipfshashid').innerHTML = "IPFS Hash: " + response.merkleipfs;
		var url = ipfspath + response.merkleipfs;
		document.getElementById('ipfsurl').innerHTML = "IPFS Address: <a href='" + url + "'>" + url + "</a>";
		getIPFSJSON(response.merkleipfs);
		//console.log(this.responseText);
	}
	ajaxcall(send, protocol+"://"+domain+cfg.proxy_path+"/ipfs/get", handler);
}

function getIPFSJSON(hash) {
	var send = {};
	send.ipfshash = hash;
	function handler(response) {
		ipfsstr = JSON.stringify(response);
		if (ipfsstr.length < 3000000) {
			var ipfsstr = JSON.stringify(response, null, 2);
			ipfsstr = ipfsstr.replace(/(?:\r\n|\r|\n)/g, '<br>');
			ipfsstr = ipfsstr.replace(/(  )/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

		} else {
		}
		document.getElementById('ipfsdata').innerHTML = ipfsstr;
		//console.log(this.responseText);
	}
	ajaxcall(send, protocol+"://"+domain+cfg.proxy_path+"/ipfs/get", handler);
}

function addzero(number) {
	if (number <10) number = "0" + number;
	return number;
}
