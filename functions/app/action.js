"use strict";
const db = require("../Database/firebaseInit");
const jwt = require("jsonwebtoken");
const key = require("../credentials/credentals.json");
const functions = require("firebase-functions");

async function registerAction(req, res, next) {
  try {
    const {
      actionNm,
      missionDocId,
      boardDocId,
      cycle,
      goalUnit,
      actionUnit,
      unit,
      timestamp,
    } = req.body;
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, key["jwtKey"]);
    const memberRef = await db
      .collection("cust_MEMBERS")
      .where("email", "==", decoded.email)
      .get();

    const actionCollection = db.collection("cust_ACTIONS");
    const newActionDoc = actionCollection.doc();

    const newActionObj = {
      action_name: actionNm,
      mission_doc_id: missionDocId,
      board_doc_id: boardDocId,
      cycle: cycle,
      goal_unit: goalUnit,
      action_unit: actionUnit,
      unit: unit,
      document_id: newActionDoc.id,
      member_doc_id: memberRef.docs[0].data().member_doc_id,
      member_email: memberRef.docs[0].data().email,
      reg_dt: timestamp,
      mod_dt: timestamp,
      del_dt: 0,
      del_yn: false,
      achievement: 0,
    };

    await newActionDoc.set(newActionObj);
    return res.status(200).send({ actionInfo: newActionObj });
  } catch (err) {
    console.error(err);
    functions.logger.log(
      "registerAction 입력값 : ",
      JSON.stringify(req.body),
      ", 토큰 : ",
      req.get("authorization")
    );
    return next(err);
  }
}

async function getAction(req, res, next) {
  try {
    const docId = req.params;
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, key["jwtKey"]);
    const actionRef = await db
      .collection("cust_ACTIONS")
      .where("document_id", "==", docId)
      .where("member_email", "==", decoded.member_email)
      .orderBy("reg_dt", "DESC")
      .limit(1)
      .get();

    return res.status(200).send({ actionInfo: actionRef.docs[0].data() });
  } catch (err) {
    console.error(err);
    functions.logger.log(
      "getAction 입력값 : ",
      req.params,
      ", 토큰 : ",
      req.get("authorization")
    );
    return next(err);
  }
}

// async function getActionList(req, res, next) {
//   try {
//     const missionDocId = req.params;
//     const token = req.get("authorization");
//     if (token == "" || token == undefined) {
//       throw new Error("INVALID_AUTH");
//     }
//     const decoded = jwt.verify(token, key["jwtKey"]);
//     const actionRef = await db
//       .collection("cust_ACTIONS")
//       .where("member_email", "==", decoded.member_email)
//       .orderBy("reg_dt", "DESC")
//       .get();

//     let result = [];
//     if (actionRef.docs.length > 0) {
//       actionRef.docs.forEach((doc) => {
//         result.push({
//           action_name: doc.data().action_name,
//           mission_doc_id: doc.data().mission_doc_id,
//           cycle: doc.data().cycle,
//           goal_unit: doc.data().goal_unit,
//           action_unit: doc.data().action_unit,
//           unit: doc.data().unit,
//           document_id: doc.data().document_id,
//           member_doc_id: doc.data().member_doc_id,
//           member_email: doc.data().member_email,
//           achievement: doc.data().achievement,
//           reg_dt: doc.data().reg_dt,
//           mod_dt: doc.data().mod_dt,
//           del_dt: doc.data().del_dt,
//           del_yn: doc.data().del_yn,
//         });
//       });
//     }

//     return res.status(200).send({ actionInfo: result });
//   } catch (err) {
//     console.error(err);
//     functions.logger.log("getActionList 입력값 : ", req.get("authorization"));
//     return next(err);
//   }
// }

async function updateAction(req, res, next) {
  try {
    const { documentId, actionNm, cycle, goalUnit, actionUnit, unit } =
      req.body;
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, key["jwtKey"]);
    const actionCollection = db.collection("cust_ACTIONS");

    const beforeActionRef = await actionCollection.doc(documentId).get();
    await actionCollection
      .where("document_id", "==", documentId)
      .where("member_email", "==", decoded.member_email)
      .set({
        action_name: actionNm,
        cycle: cycle,
        goal_unit: goalUnit,
        action_unit: actionUnit,
        unit: unit,
        mod_dt: Math.floor(Date.now()),
      });
    const beforeData = beforeActionRef.data();
    if (
      beforeData.goal_unit != goalUnit ||
      beforeData.action_unit != actionUnit
    ) {
      // 목표설정이 달라졌으면 전체 달성율도 다시 계산
      const missionRef = await db
        .collection("cust_MISSIONS")
        .where("board_doc_id", "==", actionRef.data().board_doc_id)
        .get();

      let goalCnt;
      let achieveCnt;
      // 동일 보드 내의 모든 액션의 목표량, 달성율을 합산
      missionRef.docs.forEach((mission) => {
        goalCnt += mission.goal_unit;
        achieveCnt += mission.achievement;
      });
      const totalPercentage = (achieveCnt / goalCnt) * 100;
      const boardRef = await db
        .collection("cust_BOARDS")
        .where("document_id", "==", actionRef.data().board_doc_id)
        .where("member_email", "==", decoded.member_email)
        .set({
          total_percentage: totalPercentage,
          mod_dt: timestamp,
        });
    }
    const actionRef = await actionCollection.doc(documentId).get();
    const boardInfo = await db
      .collection("cust_BOARDS")
      .where("document_id", "==", actionRef.data().board_doc_id)
      .where("member_email", "==", decoded.member_email)
      .get();
    return res
      .status(200)
      .send({
        actionInfo: actionRef.data(),
        boardInfo: boardInfo.docs[0].data(),
      });
  } catch (err) {
    console.error(err);
    functions.logger.log(
      "updateAction 입력값 : ",
      JSON.stringify(req.body),
      ", 토큰 : ",
      req.get("authorization")
    );
    return next(err);
  }
}

async function deleteAction(req, res, next) {
  try {
    const docId = req.params;
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, key["jwtKey"]);
    const actionRef = await db
      .collection("cust_ACTIONS")
      .where("document_id", "==", docId)
      .where("member_email", "==", decoded.member_email)
      .set({ del_yn: true, del_dt: Math.floor(Date.now()) });

    return res.status(200).send({ msg: "ok" });
  } catch (err) {
    console.error(err);
    functions.logger.log(
      "deleteAction 입력값 : ",
      req.params,
      ", 토큰 : ",
      req.get("authorization")
    );
    return next(err);
  }
}

async function updateActionAchievement(req, res, next) {
  try {
    const { documentId, timestamp } = req.body;
    const token = req.get("authorization");
    if (token == "" || token == undefined) {
      throw new Error("INVALID_AUTH");
    }
    const decoded = jwt.verify(token, key["jwtKey"]);
    const actionCollection = db.collection("cust_ACTIONS");

    let actionRef = await actionCollection.doc(documentId).get();
    const achieve = actionRef.data().achievement + actionRef.data().action_unit;

    await actionCollection
      .where("document_id", "==", documentId)
      .where("member_email", "==", decoded.member_email)
      .set({
        achievement: achieve,
        mod_dt: timestamp,
      });

    const missionRef = await db
      .collection("cust_MISSIONS")
      .where("board_doc_id", "==", actionRef.data().board_doc_id)
      .get();

    let goalCnt;
    let achieveCnt;
    // 동일 보드 내의 모든 액션의 목표량, 달성율을 합산
    missionRef.docs.forEach((mission) => {
      goalCnt += mission.goal_unit;
      achieveCnt += mission.achievement;
    });
    const totalPercentage = (achieveCnt / goalCnt) * 100;
    const boardRef = await db
      .collection("cust_BOARDS")
      .where("document_id", "==", actionRef.data().board_doc_id)
      .where("member_email", "==", decoded.member_email)
      .set({
        total_percentage: totalPercentage,
        mod_dt: timestamp,
      });
    // board = {  //{목표, 달성}
    //   mission1: [{10, 1}, {5, 1}, {15,1}, {10,1}],
    //   mission2: [{10, 1}, {5, 1}, {15,1}, {10,1}],
    //   mission3: [{10, 1}, {5, 1}, {15,1}, {10,1}],
    //   mission4: [{10, 1}, {5, 1}, {15,1}, {10,1}],
    // };

    missionRef = await missionCollection.doc(documentId).get();
    const boardInfo = await db
      .collection("cust_BOARDS")
      .where("document_id", "==", actionRef.data().board_doc_id)
      .where("member_email", "==", decoded.member_email)
      .get();

    return res.status(200).send({
      missionInfo: missionRef.data(),
      boardInfo: boardInfo.docs[0].data(),
    });
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

module.exports = {
  registerAction,
  getAction,
  // getActionList,
  updateAction,
  deleteAction,
  updateActionAchievement,
};
