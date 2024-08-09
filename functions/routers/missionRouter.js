"use strict";

const express = require("express");
const router = express.Router();
const {
  registerMission,
  getMission,
  // getMissionList,
  updateMission,
  deleteMission,
} = require("../app/mission");

router.post("/register", registerMission);
router.get("/get/:docId", getMission);
// router.get("/getList", getMissionList);
router.post("/update", updateMission);
router.get("/delete/:docId", deleteMission);

module.exports = router;
