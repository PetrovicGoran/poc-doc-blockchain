const crypto = require("crypto");
const TransactionClass = require('./Transaction_model.js');


var BlockClass = class Block {
	constructor(index, data, diff, prevHash, jsonFormat = null) {
		if(typeof jsonFormat === "object" && jsonFormat !== null) {
			Object.assign(this, jsonFormat);

			for(var i = 0; i < this.data.length; i++)
				this.data[i] = new TransactionClass(this.data[i]);
		}
		else {
			this.index = parseInt(index);
			this.data = data;
			this.timestamp = parseInt(Date.now());
			this.diff = parseInt(diff);
			this.nonce = 0;
			this.prevHash = prevHash.toString();
			
			this.hash = BlockClass.calculateHash(this.index.toString(), this.data, this.timestamp.toString(), this.diff.toString(), this.nonce.toString(), this.prevHash.toString());
			
			//this.nonce++;
				
			//} while(! this.isHashValid());
			
			//this.nonce--;
		}
		
		this.parseToInt();
	}
	
	parseToInt() {
		this.index = parseInt(this.index);
		this.timestamp = parseInt(this.timestamp);
		this.diff = parseInt(this.diff);
		this.nonce = parseInt(this.nonce);
	}
	
	getIndex() {
		return this.index;
	}
	
	getData() {
		return this.data;
	}
	
	getTimestamp() {
		return this.timestamp.toString();
	}
	
	getDiff() {
		return this.diff;
	}
	
	getNonce() {
		return this.nonce;
	}
	
	getPrevHash() {
		return this.prevHash.toString();
	}
	
	getHash() {
		return this.hash.toString();
	}
	
	toString() {
		var transData = "";

		for(var i = 0; i < this.data.length; i++) {
			transData += "\n\t\t" + this.data[i].toStringForHash();
		}

		var ret = "\n\tBlock index: " + this.index.toString() + "\n\tData: " + transData + "\n\tTimestamp: " + new Date(this.timestamp).toUTCString() + "\n\tDifficulty: " + this.diff + "\n\tPrevious hash: " + this.prevHash.digest("base64") + "\n\tHash: " + this.hash.digest("base64") + "\n";
		return ret;
	}
	
	static calculateHash(index, data, timestamp, diff, nonce, prevHash) {
		var transString = "";

		for(var i = 0; i < data.length; i++) {
			transString += data[i].toStringForHash();
		}


		var hs = index.toString() + transString + timestamp.toString() + diff.toString() + nonce.toString() + prevHash.toString();
		var ret = crypto.createHash("sha256").update(hs).digest("base64");
		
		return ret;
	}
	
	calcCummDiff() {
		return 1;
	}
};


module.exports = BlockClass;