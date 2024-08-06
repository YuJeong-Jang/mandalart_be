"use strict";
const db = require("../Database/firebaseInit");
const jwt = require("jsonwebtoken");
const key = require("../credentials/credentals.json");
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
    const token = jwt.sign(memberDoc, key["jwtKey"], { expiresIn: "7d" });

    // 디비에 토큰 정보 업데이트
    return res.status(200).send({ token: token });
  } catch (err) {
    console.error(err);
    return next(err);
  }
}

async function checkUser(req, res, next) {
  try {
    const result = isMember(req);
    let checkMember = false;
    if (!result.hasJoined) {
      throw new Error("MEMBER_NOT_FOUND");
    } else if (result.hasJoined && result.deleted) {
      throw new Error("DELETED_MEMBER");
    }
    return res.status(200).send({ checkUser: result.hasJoined });
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

    const result = await isMember(req);

    if (result.hasJoined) {
      throw new Error("ALREADY_JOINED");
    } else if (result.hasJoined && result.deleted) {
      throw new Error("DELETED_MEMBER");
    }

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
    const token = jwt.sign(newMemberObj, key["jwtKey"], { expiresIn: "7d" });

    newMemberObj.token = token;
    return res.status(200).send({ memberInfo: newMemberObj, token: token });
  } catch (err) {
    console.error(err);
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }

    const decoded = jwt.verify(token, key["jwtKey"]);

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
    if (!boardRef.empty) {
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
    const token = req.get("authorization");
    const { name, pwd, type, timestamp } = req.body;
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }

    const decoded = jwt.verify(token, key["jwtKey"]);
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

    const memberRef = await memberCollection.doc(decoded.document_id).get();
    return res.status(200).send({ memberInfo: memberRef.data() });
  } catch (err) {
    console.error(err);
    return next(err);
  }
}

async function refreshToken(req, res, next) {
  try {
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }

    const decoded = jwt.verify(token, key["jwtKey"]);
    const getNewToken = jwt.sign(decoded, key["jwtKey"], { expiresIn: "7d" });

    return res.status(200).send({ token: getNewToken });
  } catch (err) {
    console.error(err);
    return next(err);
  }
}

async function isMember(req, res, next) {
  try {
    const { email } = req.body;

    const memberRef = await db
      .collection("cust_MEMBERS")
      .where("email", "==", email)
      .get();

    let response = {};
    if (memberRef.empty) {
      response.hasJoined = false;
    } else if (memberRef.docs[0].del_yn == true) {
      response.hasJoined = false;
      response.deleted = true;
    } else {
      response.hasJoined = true;
      response.member = memberRef.docs[0];
    }
    return response;
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
