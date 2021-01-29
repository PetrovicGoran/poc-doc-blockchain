var ec = require('elliptic').ec;
var CryptoJS = require('crypto-js');
var _ = require('lodash');

const TransactionClass = require('./Transaction_model.js');
const TxInClass = require("./TxIn_model.js");
const TxOutClass = require("./TxOut_model.js");


const EC = new ec('secp256k1');

var WalletClass = class Wallet {

    static getPublicFromWallet(privateKey) {
        const key = EC.keyFromPrivate(privateKey, 'hex');
        
        return key.getPublic().encode('hex', false);
    }

    static generatePrivateKey() {
        const keyPair = EC.genKeyPair();
        const privateKey = keyPair.getPrivate();
        return privateKey.toString(16);
    }

    static initWallet() {
        const newPrivateKey = WalletClass.generatePrivateKey();
        
        return newPrivateKey;
    }

    static getBalance(address, unspentTxOuts) {
        var sum = 0;

        for(var i = 0; i < unspentTxOuts.length; i++) {
            if(unspentTxOuts[i].address === address) {
                sum += unspentTxOuts[i].amount;
            }
        }

        return sum;
    }

    static findUnspentTxOuts(ownerAddress, unspentTxOuts) {
        return _.filter(unspentTxOuts, (uTxO) => uTxO.address === ownerAddress);
    }

    static findTxOutsForAmount(amount, myUnspentTxOuts) {
        let currentAmount = 0;
        const includedUnspentTxOuts = [];

        for (const myUnspentTxOut of myUnspentTxOuts) {
            includedUnspentTxOuts.push(myUnspentTxOut);
            currentAmount = currentAmount + myUnspentTxOut.amount;

            if (currentAmount >= amount) {
                const leftOverAmount = currentAmount - amount;
                return { includedUnspentTxOuts, leftOverAmount };
            }
        }

        console.log('Cannot create transaction from the available unspent transaction outputs.' +
            ' Required amount:' + amount + '. Available unspentTxOuts:' + JSON.stringify(myUnspentTxOuts));

        const retErrAmount = -1;
        const retUnspentTxOutsError = [];

        return { retUnspentTxOutsError, retErrAmount };
    }

    static createTxOuts(receiverAddress, myAddress, amount, leftOverAmount) {
        var TxOutClass1 = require("./TxOut_model.js");
        const txOut1 = new TxOutClass1(receiverAddress, amount);
        
        if (leftOverAmount === 0) {
            return [txOut1];
        }
        else {
            const leftOverTx = new TxOutClass1(myAddress, leftOverAmount);
            return [txOut1, leftOverTx];
        }
    }

    static filterTxPoolTxs(unspentTxOuts, transactionPool) {
        const txIns = _(transactionPool)
            .map((tx) => tx.txIns)
            .flatten()
            .value();
        
        const removable = [];
        
        for (const unspentTxOut of unspentTxOuts) {
            const txIn = _.find(txIns, (aTxIn) => {
                return aTxIn.txOutIndex === unspentTxOut.txOutIndex && aTxIn.txOutId === unspentTxOut.txOutId;
            });

            if (txIn !== undefined) {
                removable.push(unspentTxOut);
            }
        }

        return _.without(unspentTxOuts, ...removable);
    }

    static createTransaction(receiverAddress, amount, privateKey, unspentTxOuts, txPool) {
        const myAddress = WalletClass.getPublicFromWallet(privateKey);
        const myUnspentTxOutsA = unspentTxOuts.filter((uTxO) => uTxO.address === myAddress);
        const myUnspentTxOuts = WalletClass.filterTxPoolTxs(myUnspentTxOutsA, txPool);
        
        const { includedUnspentTxOuts, leftOverAmount } = WalletClass.findTxOutsForAmount(amount, myUnspentTxOuts);
        

        if(typeof includedUnspentTxOuts === 'undefined' || typeof leftOverAmount === 'undefined') {
            
            var TxOutClass1 = require("./TxOut_model.js");
            unsuccessfulTransactionRequests.push(new TxOutClass1(receiverAddress, amount));

            throw Error('Cannot create transaction from the available unspent transaction outputs.' +
            ' Required amount:' + amount + '. Available unspentTxOuts:' + JSON.stringify(includedUnspentTxOuts));
        }
        

        const toUnsignedTxIn = (unspentTxOut) => {
            var TxInClass1 = require("./TxIn_model.js");

            var txIn = new TxInClass1();
            txIn.txOutId = unspentTxOut.txOutId;
            txIn.txOutIndex = unspentTxOut.txOutIndex;
            return txIn;
        };

        const unsignedTxIns = includedUnspentTxOuts.map(toUnsignedTxIn);

        var TransactionClass1 = require("./Transaction_model.js");
        const tx = new TransactionClass1();
        
        tx.txIns = unsignedTxIns;
        tx.txOuts = WalletClass.createTxOuts(receiverAddress, myAddress, amount, leftOverAmount);
        tx.id = TransactionClass1.getTransactionId(tx);

        tx.txIns = tx.txIns.map((txIn, index) => {
            var TxInClass1 = require("./TxIn_model.js");

            txIn.signature = TxInClass1.signTxIn(tx, index, privateKey, unspentTxOuts);
            
            return txIn;
        });
        
        return tx;
    }

    // TODO
    static createDiagnosis(doctorPrivateKey, patientPublicKey, name, description, unspentTxOuts, txPool) {
        const doctorPublicKey = WalletClass.getPublicFromWallet(doctorPrivateKey);

        var DiagnosisClass1 = require("./Diagnosis_model.js");

        var diagnosis = new DiagnosisClass1(doctorPublicKey, patientPublicKey, name, description);
        diagnosis.setDiagnosisId();

        var TransactionClass1 = require("./Transaction_model.js");
        const tx = new TransactionClass1();
        
        tx.diagnosis.push(diagnosis);

        tx.id = TransactionClass1.getTransactionId(tx);
        
        // sign diagnosis
        tx.diagnosis[tx.diagnosis.length - 1].signature = DiagnosisClass1.signDiagnosis(tx, tx.diagnosis.length - 1, doctorPrivateKey);
        
        return tx;
    }

    static createTherapy(doctorPrivateKey, patientPublicKey, diagnosisId, name, description, triggerCode, startDate, endDate, repetition, unspentTxOuts, txPool) {
        const doctorPublicKey = WalletClass.getPublicFromWallet(doctorPrivateKey);

        var TherapyClass1 = require("./Therapy_model.js");

        var therapy = new TherapyClass1(doctorPublicKey, patientPublicKey, diagnosisId, name, description, triggerCode, startDate, endDate, repetition);
        therapy.setTherapyId();

        var TransactionClass1 = require("./Transaction_model.js");
        const tx = new TransactionClass1();
        
        tx.therapies.push(therapy);

        tx.id = TransactionClass1.getTransactionId(tx);
        
        // sign therapy
        tx.therapies[tx.therapies.length - 1].signature = TherapyClass1.signTherapy(tx, tx.therapies.length - 1, doctorPrivateKey);

        // TODO add check if diagnosis from diagnosisId exists or not !!!
        
        return tx;
    }

    static createMeasureData(patientPrivateKey, doctorPublicKey, bitsPerMinute, spo2, unspentTxOuts, txPool) {
        const patientPublicKey = WalletClass.getPublicFromWallet(patientPrivateKey);

        var MeasureDataClass1 = require("./MeasureData_model.js");

        var measureDataRec = new MeasureDataClass1(patientPublicKey, doctorPublicKey, bitsPerMinute, spo2);
        measureDataRec.setMeasureDataId();

        var TransactionClass1 = require("./Transaction_model.js");
        const tx = new TransactionClass1();

        tx.measureData.push(measureDataRec);

        tx.id = TransactionClass1.getTransactionId(tx);
        
        // sign measureData
        tx.measureData[tx.measureData.length - 1].signature = MeasureDataClass1.signMeasureData(tx, tx.measureData.length - 1, patientPrivateKey);
        
        return tx;
    }

    static createAnalisys(doctorPrivateKey, patientPublicKey, diagnosisId, base64AsciiImage, title, description, unspentTxOuts, txPool) {
        const doctorPublicKey = WalletClass.getPublicFromWallet(doctorPrivateKey);

        var AnalisysClass = require("./Analisys_model.js");

        var analisys = new AnalisysClass(doctorPublicKey, patientPublicKey, diagnosisId, title, description, base64AsciiImage);
        analisys.setAnalisysId();

        var TransactionClass1 = require("./Transaction_model.js");
        const tx = new TransactionClass1();
        
        tx.analisys.push(analisys);

        tx.id = TransactionClass1.getTransactionId(tx);
        
        // sign diagnosis
        tx.analisys[tx.analisys.length - 1].signature = AnalisysClass.signAnalisys(tx, tx.analisys.length - 1, doctorPrivateKey);
        
        return tx;
    }
}

module.exports = WalletClass;
