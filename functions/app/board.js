"use strict";
const db = require("../Database/firebaseInit");
const jwt = require("jsonwebtoken");
const key = require("../credentials/credentals.json");
const functions = require("firebase-functions");

async function registerBoard(req, res, next) {
  try {
    const { boardNm, dailyGoal, startAt, endAt, timestamp } = req.body;
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, key["jwtKey"]);
    const memberRef = await db
      .collection("cust_MEMBERS")
      .where("email", "==", decoded.email)
      .get();

    const boardCollection = db.collection("cust_BOARDS");
    const newBoardDoc = boardCollection.doc();

    const newBoardObj = {
      board_name: boardNm,
      daily_goal: dailyGoal,
      start_at: startAt,
      end_at: endAt,
      document_id: newBoardDoc.id,
      member_doc_id: memberRef.docs[0].data().member_doc_id,
      member_email: memberRef.docs[0].data().email,
      reg_dt: timestamp,
      mod_dt: timestamp,
      del_dt: 0,
      del_yn: false,
      total_percentage: 0.0,
    };

    await newBoardDoc.set(newBoardObj);
    return res.status(200).send({ boardInfo: newBoardObj });
  } catch (err) {
    console.error(err);
    functions.logger.log(
      "registerBoard 입력값 : ",
      JSON.stringify(req.body),
      ", 토큰 : ",
      req.get("authorization")
    );
    return next(err);
  }
}

async function getBoard(req, res, next) {
  try {
    const docId = req.params;
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, key["jwtKey"]);
    const boardRef = await db
      .collection("cust_BOARDS")
      .where("document_id", "==", docId)
      .where("member_email", "==", decoded.member_email)
      .orderBy("reg_dt", "DESC")
      .limit(1)
      .get();

    return res.status(200).send({ boardInfo: boardRef.docs[0].data() });
  } catch (err) {
    console.error(err);
    functions.logger.log(
      "getBoard 입력값 : ",
      req.params,
      ", 토큰 : ",
      req.get("authorization")
    );
    return next(err);
  }
}

async function getBoardList(req, res, next) {
  try {
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, key["jwtKey"]);
    const boardRef = await db
      .collection("cust_BOARDS")
      .where("member_email", "==", decoded.member_email)
      .orderBy("reg_dt", "DESC")
      .get();

    let result = [];
    if (boardRef.docs.length > 0) {
      boardRef.docs.forEach((doc) => {
        result.push({
          board_name: doc.data().board_name,
          daily_goal: doc.data().daily_goal,
          start_at: doc.data().start_at,
          end_at: doc.data().end_at,
          document_id: doc.data().document_id,
          member_doc_id: doc.data().member_doc_id,
          member_email: doc.data().member_email,
          reg_dt: doc.data().reg_dt,
          mod_dt: doc.data().mod_dt,
          del_dt: doc.data().del_dt,
          del_yn: doc.data().del_yn,
          total_percentage: doc.data().total_percentage,
        });
      });
    }

    return res.status(200).send({ boardInfo: result });
  } catch (err) {
    console.error(err);
    functions.logger.log("getBoardList 입력값 : ", req.get("authorization"));
    return next(err);
  }
}

async function updateBoard(req, res, next) {
  try {
    const { documentId, boardNm, dailyGoal, startAt, endAt } = req.body;
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, key["jwtKey"]);
    const boardCollection = db.collection("cust_BOARDS");
    await boardCollection
      .where("document_id", "==", documentId)
      .where("member_email", "==", decoded.member_email)
      .set({
        board_name: boardNm,
        daily_goal: dailyGoal,
        start_at: startAt,
        end_at: endAt,
        mod_dt: Math.floor(Date.now()),
      });

    const boardRef = await boardCollection.doc(documentId).get();
    return res.status(200).send({ boardInfo: boardRef.data() });
  } catch (err) {
    console.error(err);
    functions.logger.log(
      "updateBoard 입력값 : ",
      JSON.stringify(req.body),
      ", 토큰 : ",
      req.get("authorization")
    );
    return next(err);
  }
}

async function deleteBoard(req, res, next) {
  try {
    const docId = req.params;
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, key["jwtKey"]);
    const boardRef = await db
      .collection("cust_BOARDS")
      .where("document_id", "==", docId)
      .where("member_email", "==", decoded.member_email)
      .set({ del_yn: true, del_dt: Math.floor(Date.now()) });

    return res.status(200).send({ msg: "ok" });
  } catch (err) {
    console.error(err);
    functions.logger.log(
      "deleteBoard 입력값 : ",
      req.params,
      ", 토큰 : ",
      req.get("authorization")
    );
    return next(err);
  }
}

module.exports = {
  registerBoard,
  getBoard,
  getBoardList,
  updateBoard,
  deleteBoard,
};
