var ConnectedNodes = require('../models/connectedNode_model.js');
var NodeClass = require('../models/Node_model.js');
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

module.exports = {
	
	connectedNodesList: function(req, res) {
		nodeLog.addLogItem("listOfConnectedNodes", req.connection.remoteAddress, null);

		return res.json(connected.getConnectedNodes());
	},
	
	numberOfConnectedNodes: function(req, res) {
		nodeLog.addLogItem("numberOfConnectedNodes", req.connection.remoteAddress, null);

		return res.json(connected.getConnectedNodesLength());
	},
	
	confirmOnline: function(req, res) {
		return res.json({"success": true});
	},
	
	newConnection: function(req, res) {
		nodeLog.addLogItem("newNodeConnection", req.connection.remoteAddress, req.body.data);

		var addr = req.body.data.ipAddress.toString(), port = parseInt(req.body.data.port);
		
		if(! connected.findNode(addr, port)) {
			connected.addNode(addr, port);
			connected.sendHttpPostToAll(ip.address().toString(), parseInt(serverPortNumber), "/nodes/nodeNetworkChanged", JSON.stringify(connected));	//vsi tisti ki su ze v omrezju samo dodaju novo vozlisce
			
			console.log("Adding new node to p2p network, because it doesnt exist inside: addr: " + addr + ", port: " + port);
			
			var newToNetwork = new NodeClass(addr, port);
			newToNetwork.sendHttpPost("/blockchain/synchronyze", JSON.stringify(blockchain));
			
			return res.json("new node added to network");
		}
	},
	
	nodeNetworkChanged: function(req, res) {
		nodeLog.addLogItem("nodeNetworkChanged", req.connection.remoteAddress, req.body.data);

		connected = new ConnectedNodes(JSON.parse(req.body.data));
		
		if(ip.address().toString() === saServerIp && parseInt(serverPortNumber) === saServerPort && connected.getConnectedNodesLength() <= 1) {	//samo server je v p2p omrezju
			writeToFile();
		}
	}
	
};