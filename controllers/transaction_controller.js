var TransactionClass = require('../models/Transaction_model.js');
var TxInClass = require('../models/TxIn_model.js');
var TxOutClass = require('../models/TxOut_model.js');
var TransactionPoolClass = require("../models/TransactionPool_model.js");
var WalletClass = require("../models/Wallet_model.js");
var ip = require("ip");

var MyTransactionClass = require("../models/MyTransaction_model.js");

var _ = require('lodash');
const DiagnosisClass = require('../models/Diagnosis_model.js');
const TherapyClass = require('../models/Therapy_model.js');
const MeasureDataClass = require('../models/MeasureData_model.js');
const AnalisysClass = require('../models/Analisys_model.js');

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
        
        TransactionPoolClass.addToTransactionPool(t, myUnspentTxOuts, transactionPool);
        
        var toConcat = TransactionClass.processTransactions([t], unspentTxOutArray);
        
        unspentTxOutArray = toConcat;
        
        console.log("finished making transaction, sending everyone synchronization...");
        
        //poslati synchronyze svima v omrezju za TransactionPool
        connected.sendHttpPostToAll(ip.address().toString(), parseInt(serverPortNumber), "/transaction/synchronyzeTransactionPool", JSON.stringify(transactionPool));
        
        return res.json("success");
    },

    createDiagnosis: function(req, res) {
        var doctorPrivateKey = req.body.doctorPrivateKey;
        var patientPublicKey = req.body.patientPublicKey;
        var name = req.body.diagnosisName;
        var description = req.body.diagnosisDescription;

        var myUnspentTxOuts = unspentTxOutArray;

        // create diagnosis
        var diagnosis = WalletClass.createDiagnosis(doctorPrivateKey, patientPublicKey, name, description, myUnspentTxOuts, TransactionPoolClass.getTransactionPool(transactionPool));

        // add created diagnosis to transaction pool
        TransactionPoolClass.addDiagnosisToTransactionPool(diagnosis, transactionPool);

        console.log("finished making transaction (diagnosis), sending everyone synchronization...");
        
        //poslati synchronyze svima v omrezju za TransactionPool
        connected.sendHttpPostToAll(ip.address().toString(), parseInt(serverPortNumber), "/transaction/synchronyzeTransactionPool", JSON.stringify(transactionPool));
        
        // return id of created diagnosis (to know to which diagnosis to bind therapies)
        return res.json(diagnosis.getId());
    },

    createTherapy: function(req, res) {
        var doctorPrivateKey = req.body.doctorPrivateKey;
        var patientPublicKey = req.body.patientPublicKey;
        var diagnosisId = req.body.diagnosisId;
        var name = req.body.therapyName;
        var description = req.body.therapyDescription;
        var triggerCode = req.body.therapyTriggerCode;
        var startDate = req.body.therapyStartDate;
        var endDate = req.body.therapyEndDate;
        var repetition = req.body.therapyRepetition;

        var myUnspentTxOuts = unspentTxOutArray;

        // create therapy
        var therapy = WalletClass.createTherapy(doctorPrivateKey, patientPublicKey, diagnosisId, name, description, triggerCode, startDate, endDate, repetition, myUnspentTxOuts, TransactionPoolClass.getTransactionPool(transactionPool));

        // add created therapy to transaction pool
        TransactionPoolClass.addTherapyToTransactionPool(therapy, transactionPool);

        console.log("finished making transaction (therapy), sending everyone synchronization...");
        
        //poslati synchronyze svima v omrezju za TransactionPool
        connected.sendHttpPostToAll(ip.address().toString(), parseInt(serverPortNumber), "/transaction/synchronyzeTransactionPool", JSON.stringify(transactionPool));
        

        // return id of created therapy (to know to which therapy was created/inserted in blockchain)
        return res.json(therapy.getId());
    },

    createMeasureData: function(req, res) {
        var patientPrivateKey = req.body.patientPrivateKey;
        var doctorPublicKey = req.body.doctorPublicKey;
        var bitsPerMinute = JSON.parse(req.body.measureDataBitsPerMinuteArrayJson);
        var spo2 = JSON.parse(req.body.measureDataSpo2ArrayJson);

        var myUnspentTxOuts = unspentTxOutArray;

        // create measureData
        var measureData = WalletClass.createMeasureData(patientPrivateKey, doctorPublicKey, bitsPerMinute, spo2, myUnspentTxOuts, TransactionPoolClass.getTransactionPool(transactionPool));

        // add created measureData to transaction pool
        TransactionPoolClass.addMeasureDataToTransactionPool(measureData, transactionPool);

        console.log("finished making transaction (measureData), sending everyone synchronization...");
        
        //poslati synchronyze svima v omrezju za TransactionPool
        connected.sendHttpPostToAll(ip.address().toString(), parseInt(serverPortNumber), "/transaction/synchronyzeTransactionPool", JSON.stringify(transactionPool));
        

        // return id of created measureData (to know to which measureData was inserted in blockchain)
        return res.json(measureData.getId());
    },

    createAnalisys: function(req, res) {
        var doctorPrivateKey = req.body.doctorPrivateKey;
        var patientPublicKey = req.body.patientPublicKey;
        var diagnosisId = req.body.diagnosisId;
        var base64AsciiImageString = req.body.analisysBase64AsciiImageString;
        var title = req.body.analisysTitle;
        var description = req.body.analisysDescription;

        var myUnspentTxOuts = unspentTxOutArray;

        // create diagnosis
        var analisys = WalletClass.createAnalisys(doctorPrivateKey, patientPublicKey, diagnosisId, base64AsciiImageString, title, description, myUnspentTxOuts, TransactionPoolClass.getTransactionPool(transactionPool));

        // add created diagnosis to transaction pool
        TransactionPoolClass.addAnalisysToTransactionPool(analisys, transactionPool);

        console.log("finished making transaction (analisys), sending everyone synchronization...");
        
        //poslati synchronyze svima v omrezju za TransactionPool
        connected.sendHttpPostToAll(ip.address().toString(), parseInt(serverPortNumber), "/transaction/synchronyzeTransactionPool", JSON.stringify(transactionPool));
        
        // return id of created diagnosis (to know to which diagnosis to bind therapies)
        return res.json(analisys.getId());
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
                trx.diagnosis = [];
                trx.therapies = [];
                trx.measureData = [];
                trx.analisys = [];


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

                //edit
                for(var j = 0; j < transPoolB[i].diagnosis.length; j++) {
                    var diagnosis = new DiagnosisClass();
                    diagnosis.id = transPoolB[i].diagnosis[j].id;
                    diagnosis.doctorPublicKey = transPoolB[i].diagnosis[j].doctorPublicKey;
                    diagnosis.patientPublicKey = transPoolB[i].diagnosis[j].patientPublicKey;
                    diagnosis.name = transPoolB[i].diagnosis[j].name;
                    diagnosis.description = transPoolB[i].diagnosis[j].description;
                    diagnosis.timestamp = transPoolB[i].diagnosis[j].timestamp;
                    diagnosis.signature = transPoolB[i].diagnosis[j].signature;

                    trx.diagnosis.push(diagnosis);
                }

                for(var j = 0; j < transPoolB[i].therapies.length; j++) {
                    var therapy = new TherapyClass();
                    therapy.id = transPoolB[i].therapies[j].id;
                    therapy.doctorPublicKey = transPoolB[i].therapies[j].doctorPublicKey;
                    therapy.patientPublicKey = transPoolB[i].therapies[j].patientPublicKey;
                    therapy.diagnosisId = transPoolB[i].therapies[j].diagnosisId;
                    therapy.name = transPoolB[i].therapies[j].name;
                    therapy.description = transPoolB[i].therapies[j].description;
                    therapy.triggerCode = transPoolB[i].therapies[j].triggerCode;
                    therapy.startDate = transPoolB[i].therapies[j].startDate;
                    therapy.endDate = transPoolB[i].therapies[j].endDate;
                    therapy.repetition = transPoolB[i].therapies[j].repetition;
                    therapy.timestamp = transPoolB[i].therapies[j].timestamp;
                    therapy.signature = transPoolB[i].therapies[j].signature;

                    trx.therapies.push(therapy);
                }

                for(var j = 0; j < transPoolB[i].measureData.length; j++) {
                    var measureData = new MeasureDataClass();
                    measureData.id = transPoolB[i].measureData[j].id;
                    measureData.doctorPublicKey = transPoolB[i].measureData[j].doctorPublicKey;
                    measureData.patientPublicKey = transPoolB[i].measureData[j].patientPublicKey;

                    // TODO - change to array type
                    measureData.bitsPerMinute = transPoolB[i].measureData[j].bitsPerMinute;
                    measureData.spo2 = transPoolB[i].measureData[j].spo2;
                    
                    measureData.timestamp = transPoolB[i].measureData[j].timestamp;
                    measureData.signature = transPoolB[i].measureData[j].signature;

                    trx.measureData.push(measureData);
                }

                //for analisys
                for(var j = 0; j < transPoolB[i].analisys.length; j++) {
                    var analisys = new AnalisysClass();
                    analisys.id = transPoolB[i].analisys[j].id;
                    analisys.doctorPublicKey = transPoolB[i].analisys[j].doctorPublicKey;
                    analisys.patientPublicKey = transPoolB[i].analisys[j].patientPublicKey;
                    analisys.diagnosisId = transPoolB[i].analisys[j].diagnosisId;
                    analisys.base64AsciiImageString = transPoolB[i].analisys[j].base64AsciiImageString;
                    analisys.title = transPoolB[i].analisys[j].title;
                    analisys.description = transPoolB[i].analisys[j].description;
                    analisys.timestamp = transPoolB[i].analisys[j].timestamp;
                    analisys.signature = transPoolB[i].analisys[j].signature;

                    trx.analisys.push(analisys);
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

        return res.json(myTransactions);
    }
	
};