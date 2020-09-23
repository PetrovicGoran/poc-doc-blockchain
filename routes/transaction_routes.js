var express = require('express');
var router = express.Router();
var transactionController = require('../controllers/transaction_controller.js');


router.get("/transactionPool", transactionController.returnTransactionPool);
router.post("/newTransaction", transactionController.createTransaction);
router.post("/synchronyzeTransactionPool", transactionController.synchronize);
router.post("/myTransactions", transactionController.getMyTransactions);



module.exports = router;