"use strict";

const express = require("express");
const router = express.Router();
const { checkInput, removeWhitespace } = require('../common/middlewares');
const memberRouter = require('./memberRouter');
const boardRouter = require('./boardRouter');
const missionRouter = require('./missionRouter');
const actionRouter = require('./actionRouter');

router.use('/member', removeWhitespace, memberRouter);
router.use('/boards', removeWhitespace, boardRouter);
router.use('/missions', removeWhitespace, missionRouter);
router.use('/actions', removeWhitespace, actionRouter);
module.exports = router;
