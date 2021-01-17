var Blockchain = require('../models/Blockchain_model.js');
var BlockClass = require('../models/Block_model.js');
var ip = require("ip");
var TransactionClass = require('../models/Transaction_model.js');

const MPI = require('mpi-node');


function calculateHash(block, nonceStart, nonceIncrement) {
    block.nonce = nonceStart;
        
    do {
        block.hash = BlockClass.calculateHash(block.index.toString(), block.data, block.timestamp.toString(), block.diff.toString(), block.nonce.toString(), block.prevHash.toString());
        block.nonce += nonceIncrement;
        
    } while(! block.isHashValid());
    
    block.nonce--;

    return block;
}

function mpiCreateBlock() {
    const tid = MPI.rank();
    const size = MPI.size();
    var nOfResponses = 0;
    //const timeoutTime = 5000;
    //let state = 'Begin';
    //let numOfAnswers = 0;
    //let timeout;

    console.log("MPI RANK: " + tid);
    console.log("CURRENT BLOCKCHAIN: " + JSON.stringify(blockchain, null, "\t"));

    var block = blockchain.createBlock(transactionPool/*, tid, MPI.size()*/);

    // master - send everyone to do work
    if (tid === 0) {
        MPI.broadcast({type: 'StartMining', content: block});

        //blockchain.createBlock(transactionPool/*, tid, MPI.size()*/);
        var res = calculateHash(block, tid, size);

        // if this is 1st response - wrie found hash to blockchain
        if(nOfResponses == 0) {
            console.log("FOUND BLOCK - in hashFound recv: " + JSON.stringify(foundBlock, null, "t"));
            blockchain.pushBlock(foundBlock);
        }

        nOfResponses++;
        transactionPool = [];
        
        // ce 1. najdemo block hash
        MPI.broadcast({type: 'StopMining', content: res});

        MPI.recv('HashFound', (foundBlock) => {
            console.log("FOUND BLOCK - in hashFound recv: " + JSON.stringify(foundBlock, null, "t"));
            MPI.broadcast({type: 'StopMining', content: foundBlock});
            
            // if this is 1st response - wrie found hash to blockchain
            if(nOfResponses == 0) {
                blockchain.pushBlock(foundBlock);
            }

            nOfResponses++;
            transactionPool = [];
        });

        MPI.recv('StopMining', (res) => {
            nOfResponses++;
        });
    }
    else {
        MPI.recv('StartMining', (message) => {
            //blockchain.createBlock(transactionPool/*, tid, MPI.size()*/);
            var res = calculateHash(block, tid, size);

            if(nOfResponses == 0) {
                MPI.send(0, {type: 'HashFound', content: res});
                nOfResponses++;
            }
        });

        MPI.recv('StopMining', (res) => {
            nOfResponses++;
        });
    }

    //blockchain.createBlock(transactionPool);
    //transactionPool = [];
}


MPI.init(mpiCreateBlock);