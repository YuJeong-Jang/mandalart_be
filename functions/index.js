"use strict";
const express = require("express");
const cors = require("cors");
const functions = require("firebase-functions");
const { setRequestTime } = require("./common/middlewares");
const {
  logErrors,
  clientErrorHandler,
  errorHandler,
} = require("./common/errorHandlers");
const appRouter = require("./routers/appRouter");
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(setRequestTime);
app.use("/app", appRouter);
app.use("*", () => {
  throw new Error("PATH_NOT_FOUND");
});
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

module.exports = {
  v1: functions
    .region("asia-northeast1")
    .runWith({
      timeoutSeconds: 540,
    })
    .https.onRequest(app),
};
