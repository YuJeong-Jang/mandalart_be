"use strict";

const express = require("express");
const router = express.Router();
const {
  registerAction,
  getAction,
  // getActionList,
  updateAction,
  deleteAction,
} = require("../app/action");

router.post("/register", registerAction);
router.get("/get/:docId", getAction);
// router.get("/getList", getActionList);
router.post("/update", updateAction);
router.get("/delete/:docId", deleteAction);

module.exports = router;
