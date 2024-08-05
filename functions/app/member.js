"use strict";
const db = require("../Database/firebaseInit");
const jwt = require("jsonwebtoken");
const jwtKey = require("../credentials/credentals.json");
const { encrypt, decrypt } = require("../common/crypto");

async function getToken(req, res, next) {
  try {
    const { email: receivedEmail, pwd: receivedPwd, timestamp } = req.body;

    const memberRef = await db
      .collection("cust_MEMBERS")
      .where("email", "==", receivedEmail)
      .where("pwd", "==", receivedPwd)
      .get();

    if (memberRef.empty) {
      throw new Error("MEMBER_NOT_FOUND");
    }

    const memberDoc = memberRef.docs[0].data();
    const token = jwt.sign(memberDoc, jwtKey, { expiresIn: "7d" });

    // 디비에 토큰 정보 업데이트
    return res.status(200).send({ token: token });
  } catch (err) {
    console.error(err);
    return next(err);
  }
}

async function checkUser(req, res, next) {
  try {
    const { email } = req.body;

    const memberRef = await db
      .collection("cust_MEMBERS")
      .where("email", "==", email)
      .get();
    let result = false;
    if (memberRef.empty) {
      throw new Error("MEMBER_NOT_FOUND");
    } else if (memberRef.docs[0].data().del_yn == true) {
      throw new Error("DELETED_MEMBER");
    } else {
      result = true;
    }
    return res.status(200).send({ checkUser: result });
  } catch (err) {
    console.error(err);
    return next(err);
  }
}

async function join(req, res, next) {
  try {
    const {
      email: receivedEmail,
      name: receivedName,
      pwd: receivedPwd,
      timestamp,
    } = req.body;

    const memberCollection = db.collection("cust_MEMBERS");
    const newMemberDoc = memberCollection.doc();

    const newMemberObj = {
      email: receivedEmail,
      name: receivedName,
      pwd: receivedPwd,
      document_id: newMemberDoc.id,
      timestamp,
      pwd_mod_dt: timestamp,
      reg_dt: timestamp,
      mod_dt: timestamp,
      del_dt: 0,
      del_yn: false,
    };

    await newMemberDoc.set(newMemberObj);
    const token = jwt.sign(newMemberObj, jwtKey, { expiresIn: "7d" });

    newMemberObj.token = token;
    return res.status(200).send({ memberInfo: newMemberObj, token: token });
  } catch (err) {
    console.error(err);
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { token } = req.get("Authorization");
    if (token == "") {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, jwtKey);

    const memberRef = await db
      .collection("cust_MEMBERS")
      .where("email", "==", decoded.email)
      .where("pwd", "==", decoded.pwd)
      .get();
    const memberInfo = memberRef.docs[0].data();

    const boardRef = await db
      .collection("cust_BOARDS")
      .where("member_id", "==", memberInfo.document_id)
      .get();
    let boardInfo;
    if (boardRef.empty) {
      throw new Error("BOARD_DOC_NOT_FOUND");
    } else {
      boardInfo = boardRef.docs[0].data();
    }

    return res
      .status(200)
      .send({ memberInfo: memberInfo, boardInfo: boardInfo });
  } catch (err) {
    console.error(err);
    return next(err);
  }
}

async function changeMemberInfo(req, res, next) {
  try {
    const { token } = req.get("Authorization");
    const { name, pwd, type, timestamp } = req.body;
    if (token == "") {
      throw new Error("INVALID_AUTH");
    }

    const decoded = jwt.verify(token, jwtKey);
    // 이름, 이메일, 비밀번호
    const memberCollection = db.collection("cust_MEMBERS");
    if (type == "name") {
      await memberCollection
        .doc(decoded.document_id)
        .set({ name: name, mod_dt: timestamp }, { merge: true });
    } else if (type == "pwd") {
      await memberCollection
        .doc(decoded.document_id)
        .set(
          { pwd: pwd, pwd_mod_dt: timestamp, mod_dt: timestamp },
          { merge: true }
        );
    }

    return res.status(200).send({ msg: memberRef.docs[0].data().id });
  } catch (err) {
    console.error(err);
    return next(err);
  }
}

async function refreshToken(req, res, next) {
  try {
    const { token } = req.get("Authorization");
    if (token == "") {
      throw new Error("INVALID_AUTH");
    }

    const decoded = jwt.verify(token, jwtKey);
    const getNewToken = jwt.sign(db, jwtKey, { expiresIn: "7d" });

    return res.status(200).send({ token: getNewToken });
  } catch (err) {
    console.error(err);
    return next(err);
  }
}

module.exports = {
  getToken,
  checkUser,
  join,
  login,
  changeMemberInfo,
  refreshToken,
};
