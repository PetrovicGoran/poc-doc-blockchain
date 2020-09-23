var express = require('express');
var router = express.Router();
var blockchainController = require('../controllers/blockchain_controller.js');


router.get("/", blockchainController.returnBlockchain);
router.get("/lastBlock", blockchainController.returnLastBlock);

router.post("/newBlock", blockchainController.createNewBlock);
router.post("/synchronyze", blockchainController.synchronize);



module.exports = router;