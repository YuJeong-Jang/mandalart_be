"use strict";
const enc = require("crypto-js/enc-utf8");
const AES = require("crypto-js/aes");
const CryptoJS = require("crypto-js");
const { cryptoKey, IV } = require("../credentials/credentals.json");

function encrypt(plainText, key = cryptoKey) {
  return AES.encrypt(plainText, enc.parse(key), {
    iv: enc.parse(IV), // [Enter IV (Optional) 지정 방식]
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC, // [cbc 모드 선택]
  }).toString();
}

function decrypt(cipherText, key = cryptoKey) {
  return AES.decrypt(cipherText, enc.parse(key), {
    iv: enc.parse(IV), // [Enter IV (Optional) 지정 방식]
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC, // [cbc 모드 선택]
  }).toString(enc);
}

module.exports = { encrypt, decrypt };
