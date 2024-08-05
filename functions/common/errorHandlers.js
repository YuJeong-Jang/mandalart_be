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
    case "TOO_MANY_MESSAGES":
      statusCode = 400;
      errorMessage =
        "Too many messages; maximum 1000 messages are allowed per request";
      break;
    case "UNALLOWED_ALARM_REQ":
      statusCode = 400;
      errorMessage =
        "Requested alarm is unsuitable. you must assign alarm date and time on request body.";
      break;
    case "INVALID_DATE_FORMAT":
      statusCode = 400;
      errorMessage =
        "The DATE format is wrong. please input yyyymmdd or yyyymmddhhmi format.";
      break;
    case "INVALID_TEST_FLAG":
      statusCode = 400;
      errorMessage =
        "Invalid test flag(s); please check flag options and try again";
      break;
    case "ALREADY_ADDED":
      statusCode = 403;
      errorMessage = "Requested data has been in firestore's; modify instead.";
      break;
    case "ALREADY_ADDED_PREVIOUSLY":
      statusCode = 403;
      errorMessage = "Try 1 year later from the date you applied.";
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
    case "NOT_CALLED_BODYAGE":
      statusCode = 500;
      errorMessage = "BodyAge API call failed";
      break;
    case "NOT_CALLED_DZPRED":
      statusCode = 500;
      errorMessage = "DiseasePrediction API call failed";
      break;
    case "INVALID_GENDER":
      statusCode = 404;
      errorMessage = "Gender is invalid";
      break;
    case "ACCESS_DENIED":
      statusCode = 401;
      errorMessage = "Access denied; invalidated admin account";
      break;
    case "ADMIN_ACCOUNT_MISSING":
      statusCode = 401;
      errorMessage = "Access denied; admin login info missing";
      break;
    case "INVALID_API_KEY":
      statusCode = 401;
      errorMessage = "Invalid API key; please contact AAIHC";
      break;
    case "INVALID_SIGNATURE":
      statusCode = 401;
      errorMessage = "Invalid JWS signature; please contact AAIHC";
      break;
    case "INVALID_ALGORITHM":
      statusCode = 401;
      errorMessage = "Invalid JWS algorithm; please contact AAIHC";
      break;
    case "INVALID_AUTH":
      statusCode = 401;
      errorMessage = "Invalid authorization header";
      break;
    case "MEDICERT_NOT_APPROVED":
      statusCode = 401;
      errorMessage = "Medicert has not been submitted or approved yet";
      break;
    case "MEDICERT_WAS_COMPLETED":
      statusCode = 401;
      errorMessage = "The mediCert was completed.";
      break;
    case "TYPE_ERROR":
      statusCode = 401;
      errorMessage = "Type does not defined or empty.";
      break;
    case "NOT_GENERATE_PDF":
      statusCode = 404;
      errorMessage = "PDF does not generated yet";
      break;
    case "INVALID_PRODUCT_ID":
      statusCode = 404;
      errorMessage = "Unable to call the API using the product id";
      break;
    case "INVALID_CODE":
      statusCode = 404;
      errorMessage =
        "SMS verification code is either invalid or expired; please try again";
      break;
    case "MEMBER_NOT_FOUND":
      statusCode = 404;
      errorMessage =
        "Member not found in AAIHC system; please check member name or mobile number";
      break;
    case "MEMBER_DOC_NOT_FOUND":
      statusCode = 404;
      errorMessage = "Member document not found; please register to continue";
      break;
    case "CHILD_NOT_FOUND":
      statusCode = 404;
      errorMessage = "Child not found; please check child info and try again";
      break;
    case "CATEGORY_NOT_FOUND":
      statusCode = 404;
      errorMessage =
        "category not found; please read the document to find available categories.";
      break;
    case "ID_NOT_FOUND":
      statusCode = 404;
      errorMessage =
        "Serialized id not found; please input correct available id";
      break;
    case "DOC_NOT_FOUND":
      statusCode = 404;
      errorMessage = "Document not found; please try after registration.";
      break;
    case "INVALID_PWD":
      statusCode = 401;
      errorMessage = "Unauthenticated; please check password and try again";
      break;
    case "DUPLICATE_MEMBER_DOCS":
      statusCode = 400;
      errorMessage = "Data Anomaly is not resolved; duplicate member docs";
      break;
    case "SHORT_LINK_NOT_GENERATED":
      statusCode = 500;
      errorMessage = "Unable to generate short link; please try again later";
      break;
    case "EMAIL_NOT_SENT":
      statusCode = 500;
      errorMessage =
        "Something went wrong while tryting to send email; please try again later";
      break;
    case "SMS_NOT_SENT":
    case "SENIOR_SMS_NOT_SENT":
      statusCode = 500;
      errorMessage =
        "Something went wrong while tryting to send sms; please try again later";
      break;
    case "FILE_UPLOAD_FAILD":
      statusCode = 500;
      errorMessage =
        "Something went wrong while tryting to upload file to ncloud; please try again later";
      break;
    case "CRM_FETCH_ERROR":
      statusCode = 500;
      errorMessage =
        "Something went wrong while tryting to fetch data from AAIHC CRM; please try again later";
      break;
    case "INVALID_CRM_MEMBER_DATA":
      statusCode = 500;
      errorMessage = "Invalid CRM member data; please contact AAIHC";
      break;
    case "CRM_ERROR":
      statusCode = 500;
      errorMessage = "Unknown CRM Error; please try again later";
      break;
    case "UNABLE_TO_FETCH_DATA":
      statusCode = 500;
      errorMessage = "Unable to fetch points data; please contact AAIHC";
      break;
    case "APPVERSION_DOC_NOT_FOUND":
      statusCode = 500;
      errorMessage =
        "App version document not found; please register to continue";
      break;
    case "DELETED_MEMBER":
      statusCode = 500;
      errorMessage = "Member document is deleted; please contact AAIHC";
      break;
    case "DELETED_DOCUMENT":
      statusCode = 500;
      errorMessage = "document is deleted; please contact AAIHC";
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
