var express = require('express');
var router = express.Router();
var walletController = require('../controllers/wallet_controller.js');

router.post("/newWallet", walletController.createNewWallet);
router.post("/balance", walletController.getBalance);


module.exports = router;