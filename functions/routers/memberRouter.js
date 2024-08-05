"use strict";

const express = require("express");
const router = express.Router();
const {
  getToken,
  checkUser,
  join,
  login,
  changeMemberInfo,
  refreshToken,
} = require("../app/member");

router.post("/token", getToken);
router.post("/checkUser", checkUser);
router.post("/join", join);
router.get("/login", login);
router.post("/changeMemberInfo", changeMemberInfo);
router.get("/refreshToken", refreshToken);

module.exports = router;