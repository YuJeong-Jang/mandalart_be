"use strict";

const express = require("express");
const router = express.Router();
const { checkInput, removeWhitespace } = require('../common/middlewares');
const memberRouter = require('./memberRouter');

router.use('/member', removeWhitespace, memberRouter);
module.exports = router;
