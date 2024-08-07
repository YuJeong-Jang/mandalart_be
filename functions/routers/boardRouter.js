"use strict";

const express = require("express");
const router = express.Router();
const {
  registerBoard,
  getBoard,
  getBoardList,
  updateBoard,
  deleteBoard,
} = require("../app/board");

router.post("/register", registerBoard);
router.get("/get/:docId", getBoard);
router.get("/getList", getBoardList);
router.post("/update", updateBoard);
router.get("/delete/:docId", deleteBoard);

module.exports = router;
