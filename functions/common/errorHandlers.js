"use strict";

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    return res.status(500).send({ error: "Internal server error" }).end();
  } else {
    return next(err);
  }
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode;
  let errorMessage;
  switch (err.message) {
    case "MISSING_QUERY_PARAM":
      statusCode = 400;
      errorMessage = "Some query parameter is missing";
      break;
    case "MISSING_PATH_PARAM":
      statusCode = 400;
      errorMessage = "Some path parameter is missing";
      break;
    case "MISSING_INPUT":
      statusCode = 400;
      errorMessage = "Some input parameter is missing";
      break;
    case "ALREADY_JOINED":
      statusCode = 400;
      errorMessage = "Member doc already exists; login instead";
      break;
    case "INVALID_DATE_FORMAT":
      statusCode = 400;
      errorMessage =
        "The DATE format is wrong. please input yyyymmdd or yyyymmddhhmi format.";
      break;
    case "ALREADY_ADDED":
      statusCode = 403;
      errorMessage = "Requested data has been in firestore's; modify instead.";
      break;
    case "PATH_NOT_FOUND":
      statusCode = 404;
      errorMessage = "Path not found";
      break;
    case "NOT_ENCRYPTED":
      statusCode = 500;
      errorMessage = "AES encryption failed";
      break;
    case "NOT_DECRYPTED":
      statusCode = 500;
      errorMessage = "AES decryption failed";
      break;
    case "INVALID_AUTH":
      statusCode = 401;
      errorMessage = "Invalid authorization header";
      break;
    case "TYPE_ERROR":
      statusCode = 401;
      errorMessage = "Type does not defined or empty.";
      break;
    case "MEMBER_NOT_FOUND":
      statusCode = 404;
      errorMessage =
        "Member not found in database; please check member pwd or email";
      break;
    case "DOC_NOT_FOUND":
      statusCode = 404;
      errorMessage = "Document not found; please try after registration.";
      break;
      case "BOARD_DOC_NOT_FOUND":
      statusCode = 404;
      errorMessage = "Document not found; please try after registration.";
      break;
    case "INVALID_PWD":
      statusCode = 401;
      errorMessage = "Unauthenticated; please check password and try again";
      break;
    case "EMAIL_NOT_SENT":
      statusCode = 500;
      errorMessage =
        "Something went wrong while tryting to send email; please try again later";
      break;
    case "DELETED_MEMBER":
      statusCode = 500;
      errorMessage = "Member document is deleted;";
      break;
    case "ALREADY_LOGINED":
      statusCode = 403;
      errorMessage = "Requested id is logging in admin; please try again later";
      break;
    default:
      statusCode = 500;
      errorMessage = "Internal server error; please try again later";
  }

  return res.status(statusCode).send({
    status: statusCode,
    errorCode: err.message,
    message: `${errorMessage}`,
  });
}

function logErrors(err, req, res, next) {
  console.log(`req.route.path: ${req.route.path}`);
  console.log(err.stack);
  return next(err);
}

module.exports = {
  clientErrorHandler,
  errorHandler,
  logErrors,
};
