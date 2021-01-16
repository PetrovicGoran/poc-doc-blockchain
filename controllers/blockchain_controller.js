var Blockchain = require('../models/Blockchain_model.js');
var BlockClass = require('../models/Block_model.js');
var ip = require("ip");
var TransactionClass = require('../models/Transaction_model.js');

const MPI = require('mpi-node');

module.exports = {
	
	returnBlockchain: function(req, res) {
		nodeLog.addLogItem("returnBlockchain", req.connection.remoteAddress, null);

		return res.json(blockchain);
	},
	
	returnLastBlock: function(req, res) {
		nodeLog.addLogItem("returnLastBlock", req.connection.remoteAddress, null);

		return res.json(blockchain.getLastBlock());
	},

	calculateHash: function(block, nonceStart, nonceIncrement) {
		block.nonce = nonceStart;
			
		do {
			block.hash = BlockClass.calculateHash(block.index.toString(), block.data, block.timestamp.toString(), block.diff.toString(), block.nonce.toString(), block.prevHash.toString());
			block.nonce += nonceIncrement;
			
		} while(! block.isHashValid());
		
		block.nonce--;

		return block;
	},

	mpiCreateBlock: function() {
		const tid = MPI.rank();
		const size = MPI.size();
		var nOfResponses = 0;
		//const timeoutTime = 5000;
		//let state = 'Begin';
		//let numOfAnswers = 0;
		//let timeout;

		var block = blockchain.createBlock(transactionPool/*, tid, MPI.size()*/);

		// master - send everyone to do work
		if (tid === 0) {
			MPI.broadcast({type: 'StartMining', content: block});

			//blockchain.createBlock(transactionPool/*, tid, MPI.size()*/);
			var res = this.calculateHash(block, tid, size);

			// if this is 1st response - wrie found hash to blockchain
			if(nOfResponses == 0) {
				console.log("FOUND BLOCK - in hashFound recv: " + JSON.stringify(foundBlock, null, "t"));
				blockchain.pushBlock(foundBlock);
			}

			nOfResponses++;
			transactionPool = [];
			
			// ce 1. najdemo block hash
			MPI.broadcast({type: 'StopMining', content: res});

			MPI.recv('HashFound', (foundBlock) => {
				console.log("FOUND BLOCK - in hashFound recv: " + JSON.stringify(foundBlock, null, "t"));
				MPI.broadcast({type: 'StopMining', content: foundBlock});
				
				// if this is 1st response - wrie found hash to blockchain
				if(nOfResponses == 0) {
					blockchain.pushBlock(foundBlock);
				}

				nOfResponses++;
				transactionPool = [];
			});

			MPI.recv('StopMining', (res) => {
				nOfResponses++;
			});
		}
		else {
			MPI.recv('StartMining', (message) => {
				//blockchain.createBlock(transactionPool/*, tid, MPI.size()*/);
				var res = this.calculateHash(block, tid, size);

				if(nOfResponses == 0) {
					MPI.send(0, {type: 'HashFound', content: res});
					nOfResponses++;
				}
			});

			MPI.recv('StopMining', (res) => {
				nOfResponses++;
			});
		}
	
		//blockchain.createBlock(transactionPool);
		//transactionPool = [];
	},

	abortHandler : function(){
		MPI.abort();
    },
	
	createNewBlock: function(req, res) {
		console.log("creating new block...");
		nodeLog.addLogItem("createNewBlock", req.connection.remoteAddress, req.body.data);
		
		// initialize MPI
		MPI.init(this.mpiCreateBlock);
		
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