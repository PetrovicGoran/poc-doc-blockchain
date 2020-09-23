var _ = require('lodash');
var TransactionClass = require("./Transaction_model.js");
//import { validateTransaction } from './transaction';

var TransactionPoolClass = class TransactionPool {

    getTransactionPoolArray() {
        return this.transactionPool;
    }

    setTransactionPoolArray(tp) {
        this.transactionPool = tp;
    }


    static getTransactionPool(transactionPool) {
        return _.cloneDeep(transactionPool);
    }

    static addToTransactionPool(tx, unspentTxOuts, transactionPool) {
        if (! TransactionClass.validateTransaction(tx, unspentTxOuts) && ! TransactionClass.validateCoinbaseTx(tx)) {   //moj izmjena && ...
            //unsuccessfulTransactionRequests.push(tx);
            throw Error('Trying to add invalid tx to pool - transaction not valid ' + tx.id);
        }

        if (! TransactionPoolClass.isValidTxForPool(tx, transactionPool) && ! TransactionClass.validateCoinbaseTx(tx)) {    //dodan 2. pogoj
            //unsuccessfulTransactionRequests.push(tx);
            throw Error('Trying to add invalid tx to pool - not valid for pool');
        }

        transactionPool.push(tx);
    }

    static hasTxIn(txIn, unspentTxOuts) {
        const foundTxIn = unspentTxOuts.find((uTxO) => {
            return uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex;
        });

        return foundTxIn !== undefined;
    }

    static updateTransactionPool(unspentTxOuts, transactionPool) {
        const invalidTxs = [];

        for (const tx of transactionPool) {
            for (const txIn of tx.txIns) {
                if (!TransactionPoolClass.hasTxIn(txIn, unspentTxOuts)) {
                    invalidTxs.push(tx);
                    break;
                }
            }
        }

        if (invalidTxs.length > 0) {
            console.log('removing the following transactions from txPool: %s', JSON.stringify(invalidTxs));
            transactionPool = _.without(transactionPool, ...invalidTxs);
        }
    }

    static getTxPoolIns(aTransactionPool) {
        return _(aTransactionPool)
            .map((tx) => tx.txIns)
            .flatten()
            .value();
    }

    static isValidTxForPool(tx, aTtransactionPool) {
        const txPoolIns = TransactionPoolClass.getTxPoolIns(aTtransactionPool);
        
        if(txPoolIns instanceof Array && txPoolIns.length > 0 && txPoolIns[0] != null) {

            const containsTxIn = (txIns, txIn) => {
                
                return _.find(txPoolIns, ((txPoolIn) => {
                    return txIn.txOutIndex === txPoolIn.txOutIndex && txIn.txOutId === txPoolIn.txOutId;
                }));
            };

            for (const txIn of tx.txIns) {
                if (containsTxIn(txPoolIns, txIn)) {
                    console.log('txIn already found in the txPool');
                    return false;
                }
            }
        }

        return true;
    }
}

module.exports = TransactionPoolClass;
