"use strict";

const express = require("express");
const router = express.Router();
const { checkInput, removeWhitespace } = require('../common/middlewares');
const memberRouter = require('./memberRouter');
const boardRouter = require('./boardRouter');

router.use('/member', removeWhitespace, memberRouter);
router.use('/board', removeWhitespace, boardRouter);
module.exports = router;
