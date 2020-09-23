var Blockchain = require('../models/Blockchain_model.js');
var ip = require("ip");
var TransactionClass = require('../models/Transaction_model.js');

module.exports = {
	
	returnBlockchain: function(req, res) {
		nodeLog.addLogItem("returnBlockchain", req.connection.remoteAddress, null);

		return res.json(blockchain);
	},
	
	returnLastBlock: function(req, res) {
		nodeLog.addLogItem("returnLastBlock", req.connection.remoteAddress, null);

		return res.json(blockchain.getLastBlock());
	},
	
	createNewBlock: function(req, res) {
		console.log("creating new block...");
		nodeLog.addLogItem("createNewBlock", req.connection.remoteAddress, req.body.data);

		blockchain.createBlock(transactionPool);
		transactionPool = [];
		
		console.log("sending synchronyze to all others...");
		connected.sendHttpPostToAll(ip.address().toString(), parseInt(serverPortNumber), "/blockchain/synchronyze", JSON.stringify(blockchain));
		
		return res.json(req.body.data);
	},
	
	synchronize: function(req, res) {
		nodeLog.addLogItem("synchronyzeBlockchains", req.connection.remoteAddress, req.body.data);

		console.log("synchronyzing blockchains...");
		
		
		var chainB = new Blockchain(JSON.parse(req.body.data));
		
		if(Blockchain.changeBlockchain(blockchain, chainB)) {
			blockchain = chainB;

			//update transaction pool
			var newTransPool = transactionPool;

			for(var i = 0; i < transactionPool.length; i++) {


				for(var j = blockchain.getChainLength() - 1; j >= 0; j--) {

					var trans = blockchain.getNthBlock(j).getData();
					var found = false;

					for(var k = 0; k < trans.length; k++) {

						if(TransactionClass.isSameTransaction(transactionPool[i], trans[k])) {
							found = true;
							break;
						}
					}

					if(found) {
						transactionPool.splice(i, 1);
						i--;			//ker smo eden element odstranili iz array-ja, moramo vrniti index na prejšnji
						break;
					}

				}

			}

			//update unspentTxOutArray
			
			if(unspentTxOutArray.length === 0) {
				for(var i = 0; i < blockchain.getChainLength(); i++) {

					var trans = blockchain.getNthBlock(i).getData();

					for(var j = 0; j < trans.length; j++) {
						unspentTxOutArray = TransactionClass.processTransactions([trans[j]], unspentTxOutArray);
					}
				}
			}
		}
		
		return res.json("success");
	}
	
};