"use strict";
const db = require("../Database/firebaseInit");
const jwt = require("jsonwebtoken");
const key = require("../credentials/credentals.json");
const functions = require("firebase-functions");

async function registerMission(req, res, next) {
  try {
    const { boardId, missionNm, timestamp } = req.body;
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, key["jwtKey"]);
    // const memberRef = await db
    //   .collection("cust_MEMBERS")
    //   .where("email", "==", decoded.email)
    //   .get();

    const boardRef = await db
      .collection("cust_BOARDS")
      .where("member_email", "==", decoded.email)
      .where("document_id", "==", boardId)
      .get();
    const missionCollection = db.collection("cust_MISSIONS");
    const newMissionDoc = missionCollection.doc();

    const newMissionObj = {
      mission_name: missionNm,
      document_id: newMissionDoc.id,
      member_doc_id: boardRef.docs[0].data().member_doc_id,
      member_email: boardRef.docs[0].data().email,
      board_id: boardId,
      reg_dt: timestamp,
      mod_dt: timestamp,
      del_dt: 0,
      del_yn: false,
    };

    await newMissionDoc.set(newMissionObj);
    return res.status(200).send({ missionInfo: newMissionObj });
  } catch (err) {
    console.error(err);
    functions.logger.log(
      "registerMission 입력값 : ",
      JSON.stringify(req.body),
      ", 토큰 : ",
      req.get("authorization")
    );
    return next(err);
  }
}

async function getMission(req, res, next) {
  try {
    const docId = req.params;
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, key["jwtKey"]);
    const missionRef = await db
      .collection("cust_MISSIONS")
      .where("document_id", "==", docId)
      .where("member_email", "==", decoded.member_email)
      .orderBy("reg_dt", "DESC")
      .limit(1)
      .get();

    return res.status(200).send({ missionInfo: missionRef.docs[0].data() });
  } catch (err) {
    console.error(err);
    functions.logger.log(
      "getMission 입력값 : ",
      req.params,
      ", 토큰 : ",
      req.get("authorization")
    );
    return next(err);
  }
}

// async function getMissionList(req, res, next) {
//   try {
//     const token = req.get("authorization");
//     if (token == "" || token == undefined) {
//       throw new Error("INVALID_AUTH");
//     }
//     const decoded = jwt.verify(token, key["jwtKey"]);
//     const missionRef = await db
//       .collection("cust_MISSIONS")
//       .where("member_email", "==", decoded.member_email)
//       .orderBy("reg_dt", "DESC")
//       .get();

//     let result = [];
//     if (missionRef.docs.length > 0) {
//       missionRef.docs.forEach((doc) => {
//         result.push({
//           mission_name: doc.data().mission_name,
//           document_id: doc.data().document_id,
//           member_doc_id: doc.data().member_doc_id,
//           member_email: doc.data().member_email,
//           board_id: doc.data().board_id,
//           reg_dt: doc.data().reg_dt,
//           mod_dt: doc.data().mod_dt,
//           del_dt: doc.data().del_dt,
//           del_yn: doc.data().del_yn,
//         });
//       });
//     }

//     return res.status(200).send({ missionInfo: result });
//   } catch (err) {
//     console.error(err);
//     functions.logger.log("getMissionList 입력값 : ", req.get("authorization"));
//     return next(err);
//   }
// }

async function updateMission(req, res, next) {
  try {
    const { documentId, missionNm, timestamp } = req.body;
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, key["jwtKey"]);
    const missionCollection = db.collection("cust_MISSIONS");
    await missionCollection
      .where("document_id", "==", documentId)
      .where("member_email", "==", decoded.member_email)
      .set({
        mission_name: missionNm,
        mod_dt: timestamp,
      });

    const missionRef = await missionCollection.doc(documentId).get();
    return res.status(200).send({ missionInfo: missionRef.data() });
  } catch (err) {
    console.error(err);
    functions.logger.log(
      "updateMission 입력값 : ",
      JSON.stringify(req.body),
      ", 토큰 : ",
      req.get("authorization")
    );
    return next(err);
  }
}

async function deleteMission(req, res, next) {
  try {
    const docId = req.params;
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, key["jwtKey"]);
    await db
      .collection("cust_MISSIONS")
      .where("document_id", "==", docId)
      .where("member_email", "==", decoded.member_email)
      .set({
        del_yn: true,
        del_dt: Math.floor(Date.now()),
        mod_dt: Math.floor(Date.now()),
      });

    return res.status(200).send({ msg: "ok" });
  } catch (err) {
    console.error(err);
    functions.logger.log(
      "deleteMission 입력값 : ",
      req.params,
      ", 토큰 : ",
      req.get("authorization")
    );
    return next(err);
  }
}

module.exports = {
  registerMission,
  getMission,
  // getMissionList,
  updateMission,
  deleteMission,
};
