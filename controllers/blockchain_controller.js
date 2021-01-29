var Blockchain = require('../models/Blockchain_model.js');
var ip = require("ip");
var TransactionClass = require('../models/Transaction_model.js');
var WalletClass = require("../models/Wallet_model.js");

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
	},

	getDiagnosisPatient: function(req, res) {
		var patientPublicKey = req.body.patientPublicKey;
		var chain = blockchain.getBlockchain();

		var toReturn = [];

		for(var i = 0; i < chain.length; i++) {
			// isci skozi vse transakcije v bloku:
			for(var j = 0; j < chain[i].data.length; j++) {
				for(var k = 0; k < chain[i].data[j].diagnosis.length; k++) {
					if(chain[i].data[j].diagnosis[k].getPatientPublicKey() === patientPublicKey)
						toReturn.push(chain[i].data[j].diagnosis[k]);
				}
			}
		}

		return res.json(toReturn);
	},

	getDiagnosisDoctor: function(req, res) {
		var doctorPrivateKey = req.body.doctorPrivateKey;
		var chain = blockchain.getBlockchain();

		var doctorPublicKey = WalletClass.getPublicFromWallet(doctorPrivateKey);

		var toReturn = [];

		for(var i = 0; i < chain.length; i++) {
			// isci skozi vse transakcije v bloku:
			for(var j = 0; j < chain[i].data.length; j++) {
				for(var k = 0; k < chain[i].data[j].diagnosis.length; k++) {
					if(chain[i].data[j].diagnosis[k].getDoctorPublicKey() === doctorPublicKey)
						toReturn.push(chain[i].data[j].diagnosis[k]);
				}
			}
		}

		return res.json(toReturn);
	},

	getDiagnosis: function(req, res) {
		var id = req.params.id
		var chain = blockchain.getBlockchain();

		for(var i = 0; i < chain.length; i++) {
			// isci skozi vse transakcije v bloku:
			for(var j = 0; j < chain[i].data.length; j++) {
				for(var k = 0; k < chain[i].data[j].diagnosis.length; k++) {
					if(chain[i].data[j].diagnosis[k].id === id)
						return res.json(chain[i].data[j].diagnosis[k]);
				}
			}
		}

		return res.json(null);
	},

	// branje terapije
	getTherapiesPatient: function(req, res) {
		var patientPublicKey = req.body.patientPublicKey;
		var chain = blockchain.getBlockchain();

		var toReturn = [];

		for(var i = 0; i < chain.length; i++) {
			// isci skozi vse transakcije v bloku:
			for(var j = 0; j < chain[i].data.length; j++) {
				for(var k = 0; k < chain[i].data[j].therapies.length; k++) {
					if(chain[i].data[j].therapies[k].getPatientPublicKey() === patientPublicKey)
						toReturn.push(chain[i].data[j].therapies[k]);
				}
			}
		}

		return res.json(toReturn);
	},

	getTherapiesDoctor: function(req, res) {
		var doctorPrivateKey = req.body.doctorPrivateKey;
		var chain = blockchain.getBlockchain();

		var doctorPublicKey = WalletClass.getPublicFromWallet(doctorPrivateKey);

		var toReturn = [];

		for(var i = 0; i < chain.length; i++) {
			// isci skozi vse transakcije v bloku:
			for(var j = 0; j < chain[i].data.length; j++) {
				for(var k = 0; k < chain[i].data[j].therapies.length; k++) {
					if(chain[i].data[j].therapies[k].getDoctorPublicKey() === doctorPublicKey)
						toReturn.push(chain[i].data[j].therapies[k]);
				}
			}
		}

		return res.json(toReturn);
	},

	getTherapy: function(req, res) {
		var id = req.params.id
		var chain = blockchain.getBlockchain();

		for(var i = 0; i < chain.length; i++) {
			// isci skozi vse transakcije v bloku:
			for(var j = 0; j < chain[i].data.length; j++) {
				for(var k = 0; k < chain[i].data[j].therapies.length; k++) {
					if(chain[i].data[j].therapies[k].id === id)
						return res.json(chain[i].data[j].therapies[k]);
				}
			}
		}

		return res.json(null);
	},

	// branje measureData
	getMeasureDataPatient: function(req, res) {
		var patientPrivateKey = req.body.patientPrivateKey;
		var chain = blockchain.getBlockchain();

		var patientPublicKey = WalletClass.getPublicFromWallet(patientPrivateKey);

		var toReturn = [];

		for(var i = 0; i < chain.length; i++) {
			// isci skozi vse transakcije v bloku:
			for(var j = 0; j < chain[i].data.length; j++) {
				for(var k = 0; k < chain[i].data[j].measureData.length; k++) {
					if(chain[i].data[j].measureData[k].getPatientPublicKey() === patientPublicKey)
						toReturn.push(chain[i].data[j].measureData[k]);
				}
			}
		}

		return res.json(toReturn);
	},

	getMeasureDataDoctor: function(req, res) {
		var doctorPublicKey = req.body.doctorPublicKey;
		var chain = blockchain.getBlockchain();

		var toReturn = [];

		for(var i = 0; i < chain.length; i++) {
			// isci skozi vse transakcije v bloku:
			for(var j = 0; j < chain[i].data.length; j++) {
				for(var k = 0; k < chain[i].data[j].measureData.length; k++) {
					if(chain[i].data[j].measureData[k].getDoctorPublicKey() === doctorPublicKey)
						toReturn.push(chain[i].data[j].measureData[k]);
				}
			}
		}

		return res.json(toReturn);
	},

	getMeasureData: function(req, res) {
		var id = req.params.id
		var chain = blockchain.getBlockchain();

		for(var i = 0; i < chain.length; i++) {
			// isci skozi vse transakcije v bloku:
			for(var j = 0; j < chain[i].data.length; j++) {
				for(var k = 0; k < chain[i].data[j].measureData.length; k++) {
					if(chain[i].data[j].measureData[k].id === id)
						return res.json(chain[i].data[j].measureData[k]);
				}
			}
		}

		return res.json(null);
	},


	// branje analisys

	getAnalisysPatient: function(req, res) {
		var patientPublicKey = req.body.patientPublicKey;
		var chain = blockchain.getBlockchain();

		var toReturn = [];

		for(var i = 0; i < chain.length; i++) {
			// isci skozi vse transakcije v bloku:
			for(var j = 0; j < chain[i].data.length; j++) {
				for(var k = 0; k < chain[i].data[j].analisys.length; k++) {
					if(chain[i].data[j].analisys[k].getPatientPublicKey() === patientPublicKey)
						toReturn.push(chain[i].data[j].analisys[k]);
				}
			}
		}

		return res.json(toReturn);
	},

	getAnalisysDoctor: function(req, res) {
		var doctorPrivateKey = req.body.doctorPrivateKey;
		var chain = blockchain.getBlockchain();

		var doctorPublicKey = WalletClass.getPublicFromWallet(doctorPrivateKey);

		var toReturn = [];

		for(var i = 0; i < chain.length; i++) {
			// isci skozi vse transakcije v bloku:
			for(var j = 0; j < chain[i].data.length; j++) {
				for(var k = 0; k < chain[i].data[j].analisys.length; k++) {
					if(chain[i].data[j].analisys[k].getDoctorPublicKey() === doctorPublicKey)
						toReturn.push(chain[i].data[j].analisys[k]);
				}
			}
		}

		return res.json(toReturn);
	},

	getAnalisysByDiagnosisId: function(req, res) {
		var diagnosisId = req.body.diagnosisId;
		var chain = blockchain.getBlockchain();

		var toReturn = [];

		for(var i = 0; i < chain.length; i++) {
			// isci skozi vse transakcije v bloku:
			for(var j = 0; j < chain[i].data.length; j++) {
				for(var k = 0; k < chain[i].data[j].analisys.length; k++) {
					if(chain[i].data[j].analisys[k].getDiagnosisId() === diagnosisId)
						toReturn.push(chain[i].data[j].analisys[k]);
				}
			}
		}

		return res.json(toReturn);
	},

	getAnalisys: function(req, res) {
		var id = req.params.id
		var chain = blockchain.getBlockchain();

		for(var i = 0; i < chain.length; i++) {
			// isci skozi vse transakcije v bloku:
			for(var j = 0; j < chain[i].data.length; j++) {
				for(var k = 0; k < chain[i].data[j].analisys.length; k++) {
					if(chain[i].data[j].analisys[k].id === id)
						return res.json(chain[i].data[j].analisys[k]);
				}
			}
		}

		return res.json(null);
	}
	
};