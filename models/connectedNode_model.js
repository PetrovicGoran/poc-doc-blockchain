const Node = require("./Node_model.js");

var ConnectedNodeClass = class ConnectedNodes {
	
	constructor(jsonNodeObjects = null) {
		if(typeof jsonNodeObjects === "object" && jsonNodeObjects !== null) {
			Object.assign(this, jsonNodeObjects);
			
			for(var i = 0; i < this.connectedNodes.length; i++)
				this.connectedNodes[i] = new Node("", "", this.connectedNodes[i]);
		}
		else {
			this.connectedNodes = [];
		}
	}
	
	findNode(address, port) {
		for(var i = 0; i < this.connectedNodes.length; i++) {
			if(this.connectedNodes[i].getAddress() === address.toString() && this.connectedNodes[i].getPort() === parseInt(port)) {
				return true;
			}
		}
		
		return false;
	}
	
	addNode(address, port) {
		this.connectedNodes.push(new Node(address, port));
	}
	
	removeNode(address, port) {
		var toRemove = -1;
		
		for(var i = 0; i < this.connectedNodes.length; i++) {
			if(this.connectedNodes[i].getAddress() === address.toString() && this.connectedNodes[i].getPort() === parseInt(port)) {
				toRemove = i;
				break;
			}
		}
		
		if(toRemove > -1) {
			this.connectedNodes[toRemove] = null;
			this.connectedNodes.splice(toRemove, 1);
		}
	}
	
	sendHttpPostToAll(myIp, myPort, path, data) {
		for(var i = 0; i < this.connectedNodes.length; i++) {
			if(this.connectedNodes[i].getAddress().toString() === myIp.toString() && parseInt(this.connectedNodes[i].getPort()) === parseInt(myPort))	//ne pošiljemo sporočilo sebi
				continue;
				
			this.connectedNodes[i].sendHttpPost(path, data);
		}
	}
	
	sendHttpGetToAll(myIp, myPort, path) {
		for(var i = 0; i < this.connectedNodes.length; i++) {
			if(this.connectedNodes[i].getAddress().toString() === myIp.toString() && parseInt(this.connectedNodes[i].getPort()) === parseInt(myPort))	//ne pošiljemo sporočilo sebi
				continue;
				
			this.connectedNodes[i].sendHttpGet(path);
		}
	}
	
	getConnectedNodes() {
		return this.connectedNodes;
	}
	
	getConnectedNodesLength() {
		return this.connectedNodes.length;
	}
};

module.exports = ConnectedNodeClass;