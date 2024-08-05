"use strict";

const express = require("express");
// const { checkInput, removeWhitespace } = require('../common/middlewares');
const router = express.Router();
const { getTest } = require("../app/member");
router.post("/getTest", getTest);
module.exports = router;
