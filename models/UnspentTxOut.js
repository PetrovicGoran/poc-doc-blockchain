const TxInClass = require("./TxIn_model.js");
const TxOutClass = require("./TxOut_model.js");
const TransactionClass = require("./Transaction_model.js");
const WalletClass = require("./Wallet_model.js");

var CryptoJS = require('crypto-js');
var ecdsa = require('elliptic');
var _ = require('lodash');

const ec = new ecdsa.ec('secp256k1');

var UnspentTxOutClass = class UnspentTxOut {
    constructor(txOutId, txOutIndex, address, amount) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.address = address;
        this.amount = amount;
    }

    getTxOutId() {
        return this.txOutId;
    }

    getTxOutIndex() {
        return this.txOutIndex;
    }

    getAddress() {
        return this.address;
    }

    getAmount() {
        return this.amount;
    }


    static findUnspentTxOut(transactionId, index, aUnspentTxOuts) {
        var ret = aUnspentTxOuts.find((uTxO) => uTxO.txOutId === transactionId && uTxO.txOutIndex === index);
        
        if (ret == null)
            return null;
        
        return ret;
    }

    static updateUnspentTxOuts(newTransactions, aUnspentTxOuts) {
        const newUnspentTxOuts = newTransactions
            .map((t) => {
                return t.txOuts.map((txOut, index) => new UnspentTxOut(t.id, index, txOut.address, txOut.amount));
            })
            .reduce((a, b) => a.concat(b), []);

        const consumedTxOuts = newTransactions
            .map((t) => t.txIns)
            .reduce((a, b) => a.concat(b), [])
            .map((txIn) => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0));

        const resultingUnspentTxOuts = aUnspentTxOuts
            .filter(((uTxO) => !UnspentTxOutClass.findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts)))
            .concat(newUnspentTxOuts);
        
        return resultingUnspentTxOuts;
    }
}

module.exports = UnspentTxOutClass;