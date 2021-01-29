var express = require('express');
var router = express.Router();
var blockchainController = require('../controllers/blockchain_controller.js');


router.get("/", blockchainController.returnBlockchain);
router.get("/lastBlock", blockchainController.returnLastBlock);

router.post("/newBlock", blockchainController.createNewBlock);
router.post("/synchronyze", blockchainController.synchronize);

// pridobi dijagnoze
router.post("/getDiagnosisPatient", blockchainController.getDiagnosisPatient);
router.post("/getDiagnosisDoctor", blockchainController.getDiagnosisDoctor);
router.get("/getDiagnosis/:id", blockchainController.getDiagnosis);

// pridobi terapije shranjene v blockchainu
router.post("/getTherapiesPatient", blockchainController.getTherapiesPatient);
router.post("/getTherapiesDoctor", blockchainController.getTherapiesDoctor);
router.get("/getTherapy/:id", blockchainController.getTherapy);

// pridobi measureData shranjene v blockchainu
router.post("/getMeasureDataPatient", blockchainController.getMeasureDataPatient);
router.post("/getMeasureDataDoctor", blockchainController.getMeasureDataDoctor);
router.get("/getMeasureData/:id", blockchainController.getMeasureData);


// pridobi analisys shranjene v blockchainu
router.post("/getAnalisysPatient", blockchainController.getAnalisysPatient);
router.post("/getAnalisysDoctor", blockchainController.getAnalisysDoctor);
router.post("/getAnalisysByDiagnosisId", blockchainController.getAnalisysByDiagnosisId);
router.get("/getAnalisys/:id", blockchainController.getAnalisys);


module.exports = router;