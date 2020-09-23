var CryptoJS = require('crypto-js');
var ecdsa = require('elliptic');
var _ = require('lodash');

const ec = new ecdsa.ec('secp256k1');

var MyTransactionClass = class MyTransaction {    
    constructor(sender, reciever, points) {
        this.public_sender = sender;
        this.public_reciever = reciever;
        this.points = points;
    }

    getSender() {
        return this.public_sender;
    }

    getReciever() {
        return this.public_reciever;
    }

    getPoints() {
        return this.points;
    }
}

module.exports = MyTransactionClass;