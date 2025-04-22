const express = require("express");
const { basicConnection } = require("../controller/basicController");

const router = express.Router();

router.route("/connection").get(basicConnection);

module.exports = router;
