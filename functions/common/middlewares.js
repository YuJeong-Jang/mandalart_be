"use strict";

const dayjs = require("dayjs");

function setRequestTime(req, res, next) {
  const { body } = req;
  body.timestamp = dayjs().valueOf();
  return next();
}

// Middleware for Request body in "1-depth" ONLY
function checkInput(object) {
  return function (req, res, next) {
    const { body } = req;

    let requirements = [];
    Object.entries(object).forEach((entry) => {
      if (entry[1] === true) {
        requirements.push(entry[0]);
      }
    });

    const input = Object.keys(body).sort();
    const required = requirements.sort();

    if (required.every((key) => input.includes(key))) {
      return next();
    } else {
      throw new Error("MISSING_INPUT");
    }
  };
}

function removeWhitespace(req, res, next) {
  const { body } = req;
  const whitespace = /\s*/g;
  Object.entries(body).forEach((entry) => {
    const key = entry[0];
    const value = entry[1];
    if (typeof value === "string") {
      body[key] = value.replace(whitespace, "");
    }
  });

  return next();
}

module.exports = {
  setRequestTime,
  checkInput,
  removeWhitespace,
};
