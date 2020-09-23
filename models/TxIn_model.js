const TransactionClass = require("./Transaction_model.js");
const TxOutClass = require("./TxOut_model.js");
const UnspentTxOutClass = require("./UnspentTxOut.js");

var CryptoJS = require('crypto-js');
var ecdsa = require('elliptic');
var _ = require('lodash');

const ec = new ecdsa.ec('secp256k1');

var TxInClass = class TxIn {    

    constructor(jsonFormat = null) {
        if(typeof jsonFormat === "object" && jsonFormat !== null) {
			Object.assign(this, jsonFormat);
        }
        else {
            this.txOutId = "";
            this.txOutIndex = 0;
            this.signature = "";
        }
        
    }

    getTxOutId() {
        return this.txOutId;
    }

    getTxOutIndex() {
        return this.txOutIndex;
    }

    getSignature() {
        return this.signature;
    }

    setSignature(sig) {
        this.signature = sig;
    }

    setTxOutId(txOutId) {
        this.txOutId = txOutId;
    }

    setTxOutIndex(index) {
        this.txOutIndex = index;
    }

    //other methods
    toStringForHash() {
        return this.txOutId + this.txOutIndex.toString() + this.signature;
    }


    static isSameTransactionInArray(tAIn, tBIn) {
        var countSame = 0;

        for(var i = 0; i < tAIn.length; i++) {
            for(var j = 0; j < tBIn.length; j++) {
                if(tAIn[i].txOutId === tBIn[j].txOutId && tAIn[i].txOutIndex === tBIn[j].txOutIndex && tAIn[i].signature === tBIn[j].signature) {
                    countSame++;
                    break;
                }
            }
        }

        if(countSame === tAIn.length && countSame === tBIn.length)
            return true;

        return false;
    }



    static validateTxIn(txIn, transaction, aUnspentTxOuts) {
        const referencedUTxOut = aUnspentTxOuts.find((uTxO) => uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex);
        
        if (referencedUTxOut == null) {
            console.log('referenced txOut not found: ' + JSON.stringify(txIn, null, "\t"));
            return false;
        }
        
        const address = referencedUTxOut.address;
        const key = ec.keyFromPublic(address, 'hex');

        const validSignature = key.verify(transaction.id, txIn.signature);
        
        if (!validSignature) {
            console.log('invalid txIn - signature: %s txId: %s address: %s', txIn.signature, transaction.id, referencedUTxOut.address);
            return false;
        }
        
        return true;
    }

    static getTxInAmount(txIn, aUnspentTxOuts) {
        var unspentTxOutFound = UnspentTxOutClass.findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts);
        
        if (unspentTxOutFound != null)
            return unspentTxOutFound.amount;
        
        return 0;
    }

    static getPublicKey(aPrivateKey) {
        return ec.keyFromPrivate(aPrivateKey, 'hex').getPublic().encode('hex', false);
    }

    static toHexString(byteArray) {
        return Array.from(byteArray, (byte) => {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    }

    static signTxIn(transaction, txInIndex, privateKey, aUnspentTxOuts) {
        const txIn = transaction.txIns[txInIndex];
        const dataToSign = transaction.id;
        const referencedUnspentTxOut = UnspentTxOutClass.findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts);
        
        if (referencedUnspentTxOut == null) {
            console.log('could not find referenced txOut');
            throw Error();
        }
        
        const referencedAddress = referencedUnspentTxOut.address;
        
        if (TxInClass.getPublicKey(privateKey) !== referencedAddress) {
            console.log('trying to sign an input with private' +
                ' key that does not match the address that is referenced in txIn');
            throw Error();
        }
        
        const key = ec.keyFromPrivate(privateKey, 'hex');
        const signature = TxInClass.toHexString(key.sign(dataToSign).toDER());
        
        return signature;
    }

    static isValidTxInStructure(txIn) {
        
        if (txIn == null) {
            console.log('txIn is null');
            return false;
        }

        else if (typeof txIn.signature !== 'string') {
            console.log('invalid signature type in txIn');
            return false;
        }

        else if (typeof txIn.txOutId !== 'string') {
            console.log('invalid txOutId type in txIn');
            return false;
        }
        
        else if (typeof txIn.txOutIndex !== 'number') {
            console.log('invalid txOutIndex type in txIn');
            return false;
        }
        
        else {
            return true;
        }
    }
}

module.exports = TxInClass;