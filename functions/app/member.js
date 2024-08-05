"use strict";
const db = require("../Database/firebaseInit");
async function getTest(req, res, next) {
  try {
    const memberRef = await db.collection("cust_MEMBERS").get();

    return res.status(200).send({ msg: memberRef.docs[0].data().id });
  } catch (err) {
    console.error(err);
    return next(err);
  }
}

module.exports = {
  getTest,
};
