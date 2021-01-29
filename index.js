const express = require("express");
const app = new express();
const http = require("http");
const httpServer = http.Server(app);
const crypto = require("crypto");
var ip = require("ip");
var fs = require("fs");


const ConnectedNode = require("./models/connectedNode_model.js");
const Blockchain = require("./models/Blockchain_model.js");
const Log = require("./models/Log_model.js");
var NodeClass = require("./models/Node_model.js");
const TransactionPool = require("./models/TransactionPool_model.js");
const TransactionClass = require("./models/Transaction_model.js");


saServerIp = "localhost";
saServerPort = 3001;



blockchain = new Blockchain();

nodeLog = new Log();

connected = new ConnectedNode();
connected.addNode(saServerIp, saServerPort);

transactionPool = [];		//transactionPool

unspentTxOutArray = [];

unsuccessfulTransactionRequests = [];

serverPortNumber = process.argv.slice(2)[0];



var cors = require('cors');
var allowedOrigins = ['http://localhost:4200','http://localhost:3000'];

app.use(cors({
	credentials: true,
	origin: function(origin, callback){
	  if(!origin) return callback(null, true);
	  if(allowedOrigins.indexOf(origin) === -1){
		var msg = 'The CORS policy for this site does not ' +
				  'allow access from the specified Origin.';
		return callback(new Error(msg), false);
	  }
	  return callback(null, true);
	}
}));




var syncInterval = setInterval(function() {
	//console.log("checking who is online...");
	
	connected.sendHttpGetToAll(ip.address.toString(), parseInt(serverPortNumber), "/nodes/confirmOnline");
	
}, 5000);

var mineInterval = setInterval(function() {
	//console.log("checking who is online...");
	if(transactionPool.length > 0) {
		console.log("creating new block from timeout 10s");
		blockchain.createBlock(transactionPool);
		transactionPool = [];

		console.log("sending synchronyze to all others...");
		connected.sendHttpPostToAll(ip.address().toString(), parseInt(serverPortNumber), "/blockchain/synchronyze", JSON.stringify(blockchain));
		
	}
	
}, 10000);


//branje blockchaina iz shranjene datoteke (v )
function readFromFile() {	//branje blockchaina iz datoteke kjer je shranjen - tisto samo naredi streznik
	
	if(ip.address().toString() === saServerIp && parseInt(serverPortNumber) === saServerPort && blockchain.getChainLength() < 1) {
		console.log("server reading stored blockchain...");
		
		fs.readFile("./saved_data/blockchain.json", 'utf-8', function(err, cont) {
			if(err){
				console.log("Error in reading file: " + err);
			}
			
			if(cont !== "") {
				blockchain = new Blockchain(JSON.parse(cont));

				//inicijaliziranje unspentTxOutArraya
				unspentTxOutArray = [];
				
				for(var i = 0; i < blockchain.getChainLength(); i++) {

					var trans = blockchain.getNthBlock(i).getData();

					for(var j = 0; j < trans.length; j++) {
						unspentTxOutArray = TransactionClass.processTransactions([trans[j]], unspentTxOutArray);
					}
				}
				
				connected.sendHttpPostToAll(ip.address().toString(), parseInt(serverPortNumber), "/blockchain/synchronyze", JSON.stringify(blockchain));
			}
			
			console.log("blockchain read successfully.");
		});
	}
}


//zazeni server na pravilnem portu
if(!isNaN(serverPortNumber)) {
    const server = httpServer.listen(parseInt(serverPortNumber), ip.address().toString(), function() {
        console.log("streznik za blockchain zagnan na: " + ip.address().toString() + ":" + serverPortNumber + "...");
    });	

	//preberi blockchain iz datoteke, ce je shranjen (in ce sem jaz SA streznik)
	readFromFile();
	
	//posiljanje serveru da smo se vkljucili v omrezje
	if(ip.address().toString() !== saServerIp || parseInt(serverPortNumber) !== saServerPort) {
		var saSrv = new NodeClass(saServerIp, saServerPort);
		const sendData = JSON.stringify({"ipAddress": ip.address().toString(), "port": serverPortNumber});
		
		//pošiljanje strežniku, da smo se vključili v p2p omrežje
		saSrv.sendHttpPost("/nodes/newConnection", JSON.parse(sendData));
	}
}
else {
    console.log("napaka: številku vrat vnesite le s pomočjo številk");
}


//load routers
var blockchainRouter = require("./routes/blockchain_routes.js");
var connectedNodesRouter = require("./routes/connectedNodes_routes.js");
var walletRouter = require("./routes/wallet_routes.js");
var transactiontRouter = require("./routes/transaction_routes.js");


//load html file
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/blockchain', blockchainRouter);
app.use('/nodes', connectedNodesRouter);
app.use('/wallet', walletRouter);
app.use('/transaction', transactiontRouter);


app.use('/log', function(req, res) {
	nodeLog.addLogItem("returnLog", req.connection.remoteAddress, null);

	return res.json(nodeLog);
});


app.use('/unsuccessfulTransactions', function(req, res) {
	return res.json(unsuccessfulTransactionRequests);
});
