const Block = require("./Block_model.js");
const crypto = require("crypto");


module.exports = class Blockchain {
	constructor(jsonFormat = null) {
		if(typeof jsonFormat === "object" && jsonFormat !== null) {
			Object.assign(this, jsonFormat);
			
			for(var i = 0; i < this.chain.length; i++)
				this.chain[i] = new Block(0, [], 0, 0, this.chain[i]);
		}
		else
			this.chain = [];
	}
	
	getChainLength() {
		return this.chain.length;
	}
	
	blockIsValid(block) {
		
		if(this.getChainLength() === 0) {
			if(block.getIndex() === 0 && block.getHash() === Block.calculateHash(block.getIndex(), block.getData(), block.getTimestamp(), block.getDiff(), block.getNonce(), block.getPrevHash()))
				return true;
			
			return false;
		}
		
		var i = this.getChainLength() - 1;
		
		if(this.chain[i].getIndex() + 1 === block.getIndex() && this.chain[i].getHash() === block.getPrevHash() && block.getHash() === Block.calculateHash(block.getIndex(), block.getData(), block.getTimestamp(), block.getDiff(), block.getNonce(), block.getPrevHash()))
			return true;
		
		return false;
		
	}
	
	createBlock(data = [], nonceStart = 0, nonceIncrement = 1) {
		var block = null;
		
		if(this.getChainLength() === 0) {
			block = new Block(0, data, 5, "", null, nonceStart, nonceIncrement);
		}
		else {
			block = new Block(this.getChainLength(), data, 5, this.chain[this.getChainLength() - 1].getHash(), null, nonceStart, nonceIncrement)
		}

		return block;
		
		/*if(this.blockIsValid(block)) {
			this.chain.push(block);
				
			//console.log("block added successfully: " + JSON.stringify(block, null, "\t"));
			return true;
		}
		
		console.log("block was not valid: " + JSON.stringify(block, null, "\t"));
		
		return false;*/
		
	}

	pushBlock(block) {
		if(this.blockIsValid(block)) {
			this.chain.push(block);
				
			//console.log("block added successfully: " + JSON.stringify(block, null, "\t"));
			return true;
		}
		
		console.log("block was not valid: " + JSON.stringify(block, null, "\t"));
		
		return false;
	}
	
	toString() {
		var ret = "\nBlockchain:\n";
		for(var i = 0; i < (this.chain).length; i++) {
			ret += (this.chain[i]).toString();
		}
		
		ret += "\n-----------------------------------------------\n";
		
		return ret;
	}
	
	getNthBlock(index) {
		if(index >= 0 && index < this.getChainLength())
			return this.chain[parseInt(index)];
		
		return null;
	}
	
	getLastBlock() {
		if(this.chain.length > 0)
			return this.chain[(this.chain).length - 1];
		
		return null
	}
	
	getBlockchain() {
		return this.chain;
	}
	
	validateBlockchain() {
		for(var i = 0; i < this.getChainLength(); i++) {
			
			var myHash = Block.calculateHash(this.chain[i].getIndex(), this.chain[i].getData(), this.chain[i].getTimestamp(), this.chain[i].getDiff(), this.chain[i].getNonce(), this.chain[i].getPrevHash());
			
			if(this.chain[i].getHash().toString() !== myHash.toString()) {
				console.log("hash not valid: \nmymyHash: " + myHash.toString() + "\nRealHash: " + this.chain[i].getHash().toString());
				return false;
			}
			
			if(i === 0) {	
				if(this.chain[i].getIndex() !== i || this.chain[i].getPrevHash() != "") {
					console.log("i==0, index != 0 or prevhash != ''");
					return false;
				}
				else {
					continue;
				}
			}
			
			if(parseInt(this.chain[i].getIndex()) !== (parseInt(this.chain[i - 1].getIndex()) + 1) || this.chain[i].getPrevHash() !== this.chain[i - 1].getHash()) {
				console.log("i!=0");
				return false;
			}
		}
		
		return true;
	}
	
	
	calcCummulativeDiff() {
		var sum = 0;
		
		for(var i = 0; i < this.chain.length; i++)
			sum += this.chain[i].calcCummDiff();
		
		return sum;
	}
	
	static changeBlockchain(chainA, chainB) {			//chainA - moj blockchain; chainB -> blockchain od onega, ki pošilja zahtev za sinhronizaciju
		if(chainA.validateBlockchain()) {
			
			if(chainB.validateBlockchain()) {
				if(chainA.calcCummulativeDiff() > chainB.calcCummulativeDiff())
					return false;
				
				return true;
			}
			
			return false;
		}
		
		//ce chainA ni veljaven:
		if(chainB.validateBlockchain())
			return true;
		
		return false;
	}
};



