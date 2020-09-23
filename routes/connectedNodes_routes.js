var express = require('express');
var router = express.Router();
var connectedNodesController = require('../controllers/connectedNode_controller.js');


router.get("/", connectedNodesController.connectedNodesList);
router.get("/numberOfConnectedNodes", connectedNodesController.numberOfConnectedNodes);

router.get("/confirmOnline", connectedNodesController.confirmOnline);

router.post("/newConnection", connectedNodesController.newConnection);
router.post("/nodeNetworkChanged", connectedNodesController.nodeNetworkChanged);

module.exports = router;