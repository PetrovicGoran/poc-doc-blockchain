//const crypto = require("crypto");
const TxInClass = require("./TxIn_model.js");
const TxOutClass = require("./TxOut_model.js");
const UnspentTxOutClass = require("./UnspentTxOut.js");
//edit
const DiagnosisClass = require("./Diagnosis_model.js");

//const WalletClass = require("./Wallet_model.js");

var CryptoJS = require('crypto-js');
var ecdsa = require('elliptic');
var _ = require('lodash');
const TherapyClass = require("./Therapy_model.js");
const MeasureDataClass = require("./MeasureData_model.js");


const COINBASE_AMOUNT = 1000;
const ec = new ecdsa.ec('secp256k1');


var TransactionClass = class Transaction {
    constructor(jsonFormat = null) {
        if(typeof jsonFormat === "object" && jsonFormat !== null) {
            Object.assign(this, jsonFormat);

            for(var i = 0; i < this.txIns.length; i++)
                this.txIns[i] = new TxInClass(this.txIns[i]);
                
            for(var i = 0; i < this.txOuts.length; i++)
                this.txOuts[i] = new TxOutClass("", 0, this.txOuts[i]);

            //edit
            for(var i = 0; i < this.diagnosis.length; i++)
                this.diagnosis[i] = new DiagnosisClass("", "", "", "", this.diagnosis[i]);

            for(var i = 0; i < this.therapies.length; i++)
                this.therapies[i] = new TherapyClass("", "", "", "", "", "", "", 0, this.therapies[i]);
            
            // TODO - measureData
            for(var i = 0; i < this.measureData.length; i++)
                this.measureData[i] = new MeasureDataClass("", "", "", "", this.measureData[i]);

        }
        else {
            this.id = "";
            this.txIns = [];
            this.txOuts = [];
            //edit
            this.diagnosis = [];
            this.therapies = [];
            this.measureData = [];
        }
        
    }

    getId() {
        return this.id;
    }

    getTxIns() {
        return this.txIns;
    }

    getTxOuts() {
        return this.txOuts;
    }

    //edit
    getDiagnosis() {
        return this.diagnosis;
    }

    getTherapies() {
        return this.therapies;
    }

    getMeasureData() {
        return this.measureData;
    }

    setTxIns(arrTxIns) {
        this.txIns = arrTxIns;
    }

    setTxOuts(arrTxOuts) {
        this.txOuts = arrTxOuts;
    }

    setId(id) {
        this.id = id;
    }

    //edit
    setDiagnosis(diagnosis) {
        this.diagnosis = diagnosis;
    }

    setTherapies(therapies) {
        this.therapies = therapies;
    }

    setMeasureData(measureData) {
        this.measureData = measureData;
    }

    toStringForHash() {
        var retS = "";

        retS += this.id.toString();

        for(var i = 0; i < this.txIns.length; i++) {
            retS += this.txIns[i].toStringForHash();
        }

        for(var i = 0; i < this.txOuts.length; i++) {
            retS += this.txOuts[i].toStringForHash();
        }

        //edit
        for(var i = 0; i < this.diagnosis.length; i++) {
            retS += this.diagnosis[i].toStringForHash();
        }

        for(var i = 0; i < this.therapies.length; i++) {
            retS += this.therapies[i].toStringForHash();
        }

        for(var i = 0; i < this.measureData.length; i++) {
            retS += this.measureData[i].toStringForHash();
        }

        return retS;
    }

    // edited
    static isSameTransaction(tA, tB) {
        return (tA.id === tB.id && TxInClass.isSameTransactionInArray(tA.txIns, tB.txIns) && TxOutClass.isSameTransactionOutArray(tA.txOuts, tB.txOuts)
                && DiagnosisClass.isSameTransactionInArray(tA.diagnosis, tB.diagnosis) && TherapyClass.isSameTransactionInArray(tA.therapies, tB.therapies)
                && MeasureDataClass.isSameTransactionInArray(tA.measureData, tB.measureData));
    }

    //static methods
    static getTransactionId(transaction) {
        
        const txInContent = transaction.txIns
            .map((txIn) => txIn.txOutId + txIn.txOutIndex)
            .reduce((a, b) => a + b, '');

        const txOutContent = transaction.txOuts
            .map((txOut) => txOut.address + txOut.amount)
            .reduce((a, b) => a + b, '');
        
        //edit
        const diagnosisContent = transaction.diagnosis
            .map((diagnose) => diagnose.id + diagnose.doctorPublicKey + diagnose.patientPublicKey + diagnose.name + diagnose.description + diagnose.timestamp)
            .reduce((a, b) => a + b, '');

        const therapyContent = transaction.therapies
            .map((therapy) => therapy.id + therapy.doctorPublicKey + therapy.patientPublicKey + therapy.diagnosisId + therapy.name + therapy.description + therapy.startDate + therapy.endDate + therapy.repetition + therapy.timestamp)
            .reduce((a, b) => a + b, '');
        
        // TODO - measureData
        const measureDataContent = transaction.measureData
            .map((measureData) => measureData.id + measureData.doctorPublicKey + measureData.patientPublicKey + measureData.arrayToString(measureData.bitsPerMinute) + measureData.arrayToString(measureData.spo2) + measureData.timestamp)
            .reduce((a, b) => a + b, '');

        //edit
        return CryptoJS.SHA256(txInContent + txOutContent + diagnosisContent + therapyContent + measureDataContent).toString();
    }

    static validateDiagnosisTransaction(transaction) {
        if (! TransactionClass.isValidTransactionStructure(transaction)) {
            console.log("not valid transaction structure");
            return false;
        }

        if (TransactionClass.getTransactionId(transaction) != transaction.id) {
            console.log('invalid tx (diagnosis) id: ' + transaction.id + "\n" + TransactionClass.getTransactionId(transaction) + "\n" + transaction.id);
            return false;
        }

        return true;
    }

    static validateTherapyTransaction(transaction) {
        if (! TransactionClass.isValidTransactionStructure(transaction)) {
            console.log("not valid transaction structure");
            return false;
        }

        if (TransactionClass.getTransactionId(transaction) != transaction.id) {
            console.log('invalid tx (diagnosis) id: ' + transaction.id + "\n" + TransactionClass.getTransactionId(transaction) + "\n" + transaction.id);
            return false;
        }

        return true;
    }

    static validateMeasureDataTransaction(transaction) {
        if (! TransactionClass.isValidTransactionStructure(transaction)) {
            console.log("not valid transaction structure");
            return false;
        }

        if (TransactionClass.getTransactionId(transaction) != transaction.id) {
            console.log('invalid tx (diagnosis) id: ' + transaction.id + "\n" + MeasureDataClass.getTransactionId(transaction) + "\n" + transaction.id);
            return false;
        }

        return true;
    }

    // TODO - measureData

    static validateTransaction(transaction, aUnspentTxOuts) {

        if (! TransactionClass.isValidTransactionStructure(transaction)) {
            console.log("not valid transaction structure");
            return false;
        }

        if (TransactionClass.getTransactionId(transaction) !== transaction.id) {
            console.log('invalid tx id: ' + transaction.id);
            return false;
        }

        if(! TransactionClass.validateCoinbaseTx(transaction)) {
        
            const hasValidTxIns = transaction.txIns
                .map((txIn) => TxInClass.validateTxIn(txIn, transaction, aUnspentTxOuts))
                .reduce((a, b) => a && b, true);
            
            if (!hasValidTxIns) {
                console.log('some of the txIns are invalid in tx: ' + transaction.id);
                return false;
            }
            
            const totalTxInValues = transaction.txIns
                .map((txIn) => TxInClass.getTxInAmount(txIn, aUnspentTxOuts))
                .reduce((a, b) => (a + b), 0);
            
            const totalTxOutValues = transaction.txOuts
                .map((txOut) => txOut.amount)
                .reduce((a, b) => (a + b), 0);
            
            if (totalTxOutValues !== totalTxInValues) { //za coinbase transaction - dodano naknadno
                console.log('totalTxOutValues !== totalTxInValues in tx: ' + transaction.id);
                return false;
            }
        }
        
        return true;
    }

    static validateBlockTransactions(aTransactions, aUnspentTxOuts) {
        
        //check for duplicate txIns. Each txIn can be included only once
        const txIns = _(aTransactions)
            .map((tx) => tx.txIns)
            .flatten()
            .value();

        if (TransactionClass.hasDuplicates(txIns)) {
            console.log("validateBlockTransactions has duplicates");
            return false;
        }

        for(var i = 0; i < aTransactions.length; i++) {
            if (! TransactionClass.validateCoinbaseTx(aTransactions[i]) && ! TransactionClass.validateTransaction(aTransactions[i], aUnspentTxOuts) 
                && ! TransactionClass.validateDiagnosisTransaction(aTransactions[i]) && ! TransactionClass.validateTherapyTransaction(aTransactions[i])
                && ! MeasureDataClass.validateMeasureDataTransaction(aTransactions[i])) {
                console.log('invalid transaction - not coinbase and normal - in transactionModel->validateBlockTransaction');
                return false;
            }
        }

        return true;
    }

    static hasDuplicates(txIns) {
        const groups = _.countBy(txIns, (txIn) => txIn.txOutId + txIn.txOutIndex);
        
        return _(groups)
            .map((value, key) => {
                if (value > 1 && key != -1) {
                    console.log('duplicate txIn: ' + key);
                    return true;
                }
            
                else {
                    return false;
                }
            })
            .includes(true);
    }

    static validateCoinbaseTx(transaction) {
        if (transaction == null) {
            console.log('the first transaction in the block must be coinbase transaction');
            return false;
        }

        if (TransactionClass.getTransactionId(transaction) !== transaction.id) {
            console.log('invalid coinbase tx id: ' + transaction.id);
            return false;
        }

        if (transaction.txIns.length !== 1) {
            console.log('one txIn must be specified in the coinbase transaction');
            return false;
        }

        if (transaction.txIns[0].txOutIndex !== -1) {
            console.log('the txIn signature in coinbase tx must be the block height ' + transaction.id);
            return false;
        }

        if (transaction.txOuts.length !== 1) {
            console.log('invalid number of txOuts in coinbase transaction');
            return false;
        }

        if (transaction.txOuts[0].amount !== COINBASE_AMOUNT) {
            console.log('invalid coinbase amount in coinbase transaction');
            return false;
        }

        return true;
    }

    static getCoinbaseTransaction(address) {
        const t = new Transaction();
        const txIn = new TxInClass();
        
        txIn.signature = "";
        txIn.txOutId = "";
        txIn.txOutIndex = -1;
        
        t.txIns = [txIn];
        t.txOuts = [new TxOutClass(address, COINBASE_AMOUNT)];
        
        t.id = TransactionClass.getTransactionId(t);
        
        return t;
    }

    static processTransactions(aTransactions, aUnspentTxOuts) {

        var retUnspentTxOuts = aUnspentTxOuts;

        for(var i = 0; i < aTransactions.length; i++) {

            if (! TransactionClass.validateBlockTransactions([aTransactions[i]], retUnspentTxOuts)) {
                console.log('invalid block transactions');
                return null;
            }

            retUnspentTxOuts = UnspentTxOutClass.updateUnspentTxOuts([aTransactions[i]], retUnspentTxOuts);
        }

        return retUnspentTxOuts;
    }

    static toHexString(byteArray) {
        return Array.from(byteArray, (byte) => {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    }

    static getPublicKey(aPrivateKey) {
        return ec.keyFromPrivate(aPrivateKey, 'hex').getPublic().encode('hex', false);
    }

    static isValidTransactionStructure(transaction) {
        if (typeof transaction.id !== 'string') {
            console.log('transactionId missing');
            return false;
        }
        
        if (!(transaction.txIns instanceof Array)) {
            console.log('invalid txIns type in transaction');
            return false;
        }
        
        if (! transaction.txIns
            .map(TxInClass.isValidTxInStructure)
            .reduce((a, b) => (a && b), true)) 
        {
            console.log("invalid txIns structure");
            return false;
        }
        
        if (!(transaction.txOuts instanceof Array)) {
            console.log('invalid txIns type in transaction');
            return false;
        }
        
        if (!transaction.txOuts
            .map(TxOutClass.isValidTxOutStructure)
            .reduce((a, b) => (a && b), true))
        {
            console.log("invalid txOuts structure");
            return false;
        }


        //edit
        if (! (transaction.diagnosis instanceof Array)) {
            console.log('invalid diagnosis type in transaction');
            return false;
        }
        
        if (!transaction.diagnosis
            .map(DiagnosisClass.isValidDiagnosisStructure)
            .reduce((a, b) => (a && b), true))
        {
            console.log("invalid diagnosis structure");
            return false;
        }

        if (! (transaction.therapies instanceof Array)) {
            console.log('invalid therapies type in transaction');
            return false;
        }
        
        if (!transaction.therapies
            .map(TherapyClass.isValidTherapyStructure)
            .reduce((a, b) => (a && b), true))
        {
            console.log("invalid therapy structure");
            return false;
        }

        if (! (transaction.measureData instanceof Array)) {
            console.log('invalid diagnosis type in transaction');
            return false;
        }
        
        if (!transaction.measureData
            .map(MeasureDataClass.isValidMeasureDataStructure)
            .reduce((a, b) => (a && b), true))
        {
            console.log("invalid measureData structure");
            return false;
        }
        

        return true;
    }

    //valid address is a valid ecdsa public key in the 04 + X-coordinate + Y-coordinate format
    static isValidAddress(address) {
        if (address.length !== 130) {
            console.log('invalid public key length');
            return false;
        }

        else if (address.match('^[a-fA-F0-9]+$') === null) {
            console.log('public key must contain only hex characters');
            return false;
        }
        
        else if (!address.startsWith('04')) {
            console.log('public key must start with 04');
            return false;
        }
        
        return true;
    }
}

module.exports = TransactionClass;