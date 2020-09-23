const TransactionClass = require("./Transaction_model.js");
const TxInClass = require("./TxIn_model.js");
const UnspentTxOutClass = require("./UnspentTxOut.js");

var CryptoJS = require('crypto-js');
var ecdsa = require('elliptic');
var _ = require('lodash');

const ec = new ecdsa.ec('secp256k1');

var TxOutClass = class TxOut {
    constructor(address, amount, jsonFormat = null) {
        if(typeof jsonFormat === "object" && jsonFormat !== null) {
            Object.assign(this, jsonFormat);
        }
        else {
            this.address = address;
            this.amount = amount;
        }
        
    }

    getAddress() {
        return this.address;
    }

    getAmount() {
        return this.amount;
    }

    setAddress(address) {
        this.address = address;
    }

    setAmount(amount) {
        this.amount = amount;
    }

    toStringForHash() {
        return this.address + this.amount.toString();
    }


    static isSameTransactionOutArray(tAOut, tBOut) {
        var countSame = 0;

        for(var i = 0; i < tAOut.length; i++) {
            for(var j = 0; j < tBOut.length; j++) {
                if(tAOut[i].address === tBOut[j].address && tAOut[i].amount === tBOut[j].amount) {
                    countSame++;
                    break;
                }
            }
        }

        if(countSame === tAOut.length && countSame === tBOut.length)
            return true;

        return false;
    }


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


    static isValidTxOutStructure(txOut) {

        if (txOut == null) {
            console.log('txOut is null - not valid txOutStructure');
            return false;
        }

        else if (typeof txOut.address !== 'string') {
            console.log('invalid address type in txOut');
            return false;
        }

        else if (! TxOutClass.isValidAddress(txOut.address)) {
            console.log('invalid TxOut address');
            return false;
        }
        
        else if (typeof txOut.amount !== 'number') {
            console.log('invalid amount type in txOut');
            return false;
        }
        
        else {
            return true;
        }
    }
}

module.exports = TxOutClass;