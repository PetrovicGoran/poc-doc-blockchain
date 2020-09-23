const http = require("http");
var ip = require("ip");
var fs = require("fs");
var path = require('path');


function writeToFile() {	//branje blockchaina iz datoteke kjer je shranjen - tisto samo naredi streznik
	
	if(ip.address().toString() === saServerIp && parseInt(serverPortNumber) === saServerPort) {
		console.log("writing blockchain to file...");
		
		fs.writeFile(path.join(__dirname, "../saved_data/blockchain.json"), JSON.stringify(blockchain, null, "\t"), 'utf-8', function(err, cont) {
			if(err){
				console.log("Error in writing file: " + err);
			}
			
			console.log("blockchain structure saved in /saved_data/blockchain.json");
		});
	}
}



var NodeClass = class Node {
	
	constructor(address, port, jsonNode = null) {
		if(typeof jsonNode === "object" && jsonNode !== null) {
			Object.assign(this, jsonNode);
		}
		else {
			this.address = address;
			this.port = parseInt(port);
		}
	}
	
	getAddress() {
		return this.address;
	}
	
	getPort() {
		return this.port;
	}
	
	sendHttpGet(path) {
		const options = {
			hostname: this.address.toString(),
			port: this.port,
			path: path.toString(),
			method: 'GET',
			timeout: 10000
		};
		
		const req = http.request(options, res => {
			
			res.on('data', d => {
				//process.stdout.write(d)
			});
		});
		
		req.on('timeout', function () {
			console.log("timeout! " + (options.timeout / 1000) + " seconds expired");
			req.destroy();
        });

		req.on('error', error => {
			//pomeni, da tista adresa ni dosegljiva --> brisemo je iz seznama
			//ne bomo serverja izklopili iz p2p omrežja
			if(this.address.toString() !== saServerIp || parseInt(this.port) !== parseInt(saServerPort)) {
				connected.removeNode(this.address.toString(), this.port);
				console.log("[[in get]]removed from connection with port: " + this.port.toString());
			}
			
			if(ip.address().toString() === saServerIp && parseInt(serverPortNumber) === saServerPort && connected.getConnectedNodesLength() <= 1) {	//samo server je v p2p omrezju
				writeToFile();
			}
			
			
			//posiljanje spremembe vsemi ostalimi vozlisci
			connected.sendHttpPostToAll(ip.address().toString(), parseInt(serverPortNumber), "/nodes/nodeNetworkChanged", JSON.stringify(connected));
		});

		req.end();
	}
	
	sendHttpPost(path, data) {
		
		const sendData = JSON.stringify({"data": data});
		
		const options = {
			hostname: this.address.toString(),
			port: this.port,
			path: path.toString(),
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': sendData.length
			}
		};
		
		const req = http.request(options, res => {

			res.on('data', d => {
				//process.stdout.write(d)
			});
		});

		req.on('error', error => {
			//pomeni, da tista adresa ni dosegljiva --> brisemo je iz seznama
			/*connected.removeNode(this.address.toString(), this.port);
			console.log("[[in post]]removed from connection with port: " + this.port.toString());
			
			if(ip.address().toString() === saServerIp && parseInt(serverPortNumber) === saServerPort && connected.getConnectedNodesLength() <= 1) {	//samo server je v p2p omrezju
				writeToFile();
			}
		
			//posiljanje spremembe vsemi ostalimi vozlisci
			connected.sendHttpPostToAll(ip.address().toString(), parseInt(serverPortNumber), "/nodes/nodeNetworkChanged", JSON.stringify(connected));
			*/
		});
	
		req.write(sendData);
		req.end();
	}
};

module.exports = NodeClass;