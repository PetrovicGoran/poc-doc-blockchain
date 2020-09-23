var WalletClass = require('../models/Wallet_model.js');
var TransactionClass = require('../models/Transaction_model.js');
var TransactionPoolClass = require('../models/TransactionPool_model.js');
var ip = require("ip");

module.exports = {
	
	createNewWallet: function(req, res) {   
        var newWallet = WalletClass.initWallet();
        var myAddress = WalletClass.getPublicFromWallet(newWallet);

        var myUnspentTxOuts = unspentTxOutArray;

        var t = TransactionClass.getCoinbaseTransaction(myAddress);

        TransactionPoolClass.addToTransactionPool(t, myUnspentTxOuts, transactionPool);

        var toConcat = TransactionClass.processTransactions([t], unspentTxOutArray);
        unspentTxOutArray = toConcat;

        //send synchronize for transaction pool
        connected.sendHttpPostToAll(ip.address().toString(), parseInt(serverPortNumber), "/transaction/synchronyzeTransactionPool", JSON.stringify(transactionPool));

        return res.json({ "privateKey": newWallet, "publicKey": myAddress });
    },

    getBalance: function(req, res) {
        var privateKey = req.body.prk;
        var address = WalletClass.getPublicFromWallet(privateKey);

        var unspentTxOuts = unspentTxOutArray;
        
        return res.json(WalletClass.getBalance(address, unspentTxOuts));
    }
	
};