var express = require('express');
var router = express.Router();
var transactionController = require('../controllers/transaction_controller.js');


router.get("/transactionPool", transactionController.returnTransactionPool);
router.post("/newTransaction", transactionController.createTransaction);
router.post("/newDiagnosisTransaction", transactionController.createDiagnosis);
router.post("/newTherapyTransaction", transactionController.createTherapy);
router.post("/newMeasureDataTransaction", transactionController.createMeasureData);
router.post("/synchronyzeTransactionPool", transactionController.synchronize);
router.post("/myTransactions", transactionController.getMyTransactions);


module.exports = router;