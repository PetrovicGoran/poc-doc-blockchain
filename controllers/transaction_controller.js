var TransactionClass = require('../models/Transaction_model.js');
var TxInClass = require('../models/TxIn_model.js');
var TxOutClass = require('../models/TxOut_model.js');
var TransactionPoolClass = require("../models/TransactionPool_model.js");
var WalletClass = require("../models/Wallet_model.js");
var ip = require("ip");

var MyTransactionClass = require("../models/MyTransaction_model.js");

var _ = require('lodash');

module.exports = {
	
	returnTransactionPool: function(req, res) {
        return res.json(transactionPool);
    },

    createTransaction: function(req, res) {
        var privateKey = req.body.prk;
        var address = req.body.recipantAddress;
        var points = Number(req.body.points);

        var myUnspentTxOuts = unspentTxOutArray;

        var t = WalletClass.createTransaction(address, points, privateKey, myUnspentTxOuts, TransactionPoolClass.getTransactionPool(transactionPool));
        console.log("Created Transaction: " + JSON.stringify(t, null, "\t"));
        
        TransactionPoolClass.addToTransactionPool(t, myUnspentTxOuts, transactionPool);
        console.log("Transaction Pool: " + JSON.stringify(transactionPool, null, "\t"));
        
        var toConcat = TransactionClass.processTransactions([t], unspentTxOutArray);
        
        unspentTxOutArray = toConcat;
        
        console.log("finished making transaction, sending everyone synchronization...");
        
        //poslati synchronyze svima v omrezju za TransactionPool
        connected.sendHttpPostToAll(ip.address().toString(), parseInt(serverPortNumber), "/transaction/synchronyzeTransactionPool", JSON.stringify(transactionPool));
        
        return res.json("success");
    },
	
	synchronize: function(req, res) {

		console.log("synchronyzing transaction pools...");

        var transPoolB = JSON.parse(req.body.data);
        var transPoolRecv = [];

        if(typeof transPoolB === "object" && transPoolB !== null) {
			
			for(var i = 0; i < transPoolB.length; i++) {
                var trx = new TransactionClass();
                trx.id = transPoolB[i].id;
                trx.txIns = [];
                trx.txOuts = [];

                for(var j = 0; j < transPoolB[i].txIns.length; j++) {
                    var txInInside = new TxInClass();
                    txInInside.txOutId = transPoolB[i].txIns[j].txOutId;
                    txInInside.txOutIndex = transPoolB[i].txIns[j].txOutIndex;
                    txInInside.signature = transPoolB[i].txIns[j].signature;

                    trx.txIns.push(txInInside);
                }

                for(var j = 0; j < transPoolB[i].txOuts.length; j++) {
                    var txOutInside = new TxOutClass();
                    txOutInside.address = transPoolB[i].txOuts[j].address;
                    txOutInside.amount = transPoolB[i].txOuts[j].amount;

                    trx.txOuts.push(txOutInside);
                }

                transPoolRecv.push(trx);
            }
        }


        for(var i = 0; i < transPoolRecv.length; i++) {
            var foundT = false;

            for(var j = 0; j < transactionPool.length; j++) {

                if(TransactionClass.isSameTransaction(transPoolRecv[i], transactionPool[j])) {
                    foundT = true;
                    break;
                }
            }

            if(! foundT) {
                transactionPool.push(transPoolRecv[i]);     //dodaj transakciju v transaction pool
                unspentTxOutArray = TransactionClass.processTransactions([transPoolRecv[i]], unspentTxOutArray);  //posodobi unspentTxOutsArray
            }
        }

        //console.log("unspent tx out array: " + JSON.stringify(unspentTxOutArray, null, "\t"));

        //console.log("Transaction pool: " + JSON.stringify(transactionPool, null, "\t"));
    },
    
    getMyTransactions: function(req, res) {
        var privateKey = req.body.privateKey;
        var myTransactions = [];
        var publicKey = WalletClass.getPublicFromWallet(privateKey);
        var chain = blockchain.getBlockchain();


        for(var i = 0; i < blockchain.getChainLength(); i++) {
            var trans = chain[i].getData();

            for(var j = 0; j < trans.length; j++) {
                var referencedTransactionsIn = [];
                
                for(var k = 0; k < trans[j].txIns.length; k++) {
                    if(trans[j].txIns[k].getTxOutId() === "")
                        continue;

                    for(var l = 0; l < chain.length; l++) {
                        var foundTx = false;

                        for(var m = 0; m < chain[l].getData().length; m++) {
                            if(chain[l].getData()[m].getId() === trans[j].txIns[k].txOutId) {
                                referencedTransactionsIn.push(chain[l].getData()[m].txOuts[trans[j].txIns[k].txOutIndex]);
                                foundTx = true;
                                break;
                            }

                        }

                        if(foundTx)
                            break;
                    }
                }

                for(var k = 0; k < trans[j].txOuts.length; k++) {
                    if(trans[j].txOuts[k].address === publicKey) {
                        //check if its me changing my amount or someone else adding amount to me

                        var foundMyChangeAmount = false;
                        var sender = "";

                        for(var l = 0; l < referencedTransactionsIn.length; l++) {
                            sender = referencedTransactionsIn[l].address;

                            if(referencedTransactionsIn[l].address === publicKey) {
                                foundMyChangeAmount = true;
                                break;
                            }

                        }

                        if(!foundMyChangeAmount) {
                            myTransactions.push(new MyTransactionClass(sender, trans[j].txOuts[k].address, trans[j].txOuts[k].amount));
                        }
                    }
                    else {
                        var foundMyChangeAmount = false;

                        for(var l = 0; l < referencedTransactionsIn.length; l++) {
                                
                            if(referencedTransactionsIn[l].address === publicKey) {
                                foundMyChangeAmount = true;
                                break;
                            }
                        }

                        if(foundMyChangeAmount) {
                            myTransactions.push(new MyTransactionClass(publicKey, trans[j].txOuts[k].address, trans[j].txOuts[k].amount));
                        }
                    }
                }
            }
        }

        //console.log("my transactions: " + myTransactions);

        return res.json(myTransactions);
    }
	
};