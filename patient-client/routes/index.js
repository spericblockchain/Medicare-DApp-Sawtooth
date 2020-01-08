const express = require("express"),
  router = express.Router(),
  config = require("../config/config.js"),
  fetch = require("node-fetch"),
  { Client, keyGen, hash } = require("./client");
let PatientData = {};

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index");
});

router.get("/doctorLogin", function(req, res, next) {
  res.render("doctorLogin");
});

router.get("/patientLogin", function(req, res, next) {
  res.render("patientLogin");
});

router.get("/addPatient", function(req, res, next) {
  res.render("addPatient");
});

router.get("/doctorView", function(req, res, next) {
  res.render("doctorView");
});

router.get("/doctorMainView", function(req, res, next) {
  res.render("doctorMainView");
});

router.get("/addReport", function(req, res, next) {
  res.render("addReport");
});

router.get("/patientView", function(req, res, next) {
  res.render("patientView");
});

router.get("/reportView", function(req, res, next) {
  res.render("reportView");
});

router.post("/doctor_login", async (req, res, next) => {
  let doctorkey = req.body.doctorkey,
    hospitalkey = req.body.hospitalkey;
  patientkey = req.body.patientkey;
  let isCorrect = 0;
  let msg = "";
  const pubKey = await keyGen(doctorkey);
  const address =
      hash("Patient Record Management").substring(0, 6) +
      "1111" +
      hash(hospitalkey).substring(0, 30) +
      hash(pubKey).substring(0, 30),
    url = "http://rest-api:8008/state/" + address;
  const response = await fetch(url, { method: "GET" });
  if (response.status === 200 || response.status === 202) {
    const responseJson = await response.json(),
      result = new Buffer(responseJson.data, "base64").toString();
    doctorData = JSON.parse(result);
    isCorrect = 1;
    msg = "Successfully Login";
  } else {
    msg = " Doctor for this Key does not Exist!!";
  }
  res.send({
    privatekey: doctorkey,
    pubKey: pubKey,
    patientkey,
    hospitalkey,
    done: isCorrect,
    message: msg,
    doctorData: doctorData
  });
});

router.post("/patient_login", async (req, res, next) => {
  let Key = req.body.pri_key;
  let isCorrect = 0;
  let msg = "";
  const pubKey = await keyGen(Key);
  const address =
      hash("Patient Record Management").substring(0, 6) +
      "0101" +
      hash(pubKey).substring(0, 60),
    url = "http://rest-api:8008/state/" + address;
  const response = await fetch(url, { method: "GET" });
  if (response.status === 200 || response.status === 202) {
    const responseJson = await response.json(),
      result = new Buffer(responseJson.data, "base64").toString();
    patientData = JSON.parse(result);

    isCorrect = 1;
    msg = "Successfully Login";
  } else {
    msg = " Patient Key does not Exist!!";
  }
  res.send({
    privatekey: Key,
    pubKey,
    done: isCorrect,
    message: msg,
    patientData: patientData
  });
});

async function getReceipt(id) {
  try {
    let ReceiptRequest = config.api + "/receipts?id=",
      ReceiptResponse = await fetch((ReceiptRequest += id));
    return await ReceiptResponse.json();
  } catch (error) {
    console.log("TCL: getReceipt -> error", error);
  }
}

router.post("/add", async function(req, res, next) {
  let payload = req.body;
  payload.action = "addNewPatient";
  let client = new Client(payload.id);
  delete payload["id"];
  let msg = "";
  try {
    const sendData = await client.sendData(JSON.stringify(payload));
    console.log("TCL: sendData", sendData);
    if (sendData[0] === 200 || sendData[0] === 202) {
      if (sendData[2] === 1) {
        msg = "This Patient Already exists";
        res.send({ message: msg });
      } else {
        const transactionId = sendData[1].transactionIds[0];
        let idVar = setInterval(check, 10);
        let i = 0;
        async function check() {
          i++;
          console.log("times", i);
          const data = await getReceipt(transactionId);
          console.log("TCL: check -> data", data);
          if (data && data.data) {
            clearInterval(idVar);
            msg = "Patient Added Successfully";
            res.send({ message: msg });
          }
        }
      }
    } else {
      msg = "Adding UnSuccessful";
      res.send({ message: msg });
    }
  } catch (error) {
    console.log("TCL: error", error);
    msg = "Invalid Key";
    res.send({ message: msg });
  }
});

router.post("/rateDoctor", async function(req, res, next) {
  const payload = req.body,
    key = req.body.key;
  patientPubKey = req.body.patientPubKey;
  i = req.body.i;
  let msg = "";
  // console.log("RESULt===========",i)
  const address =
      hash("Patient Record Management").substring(0, 6) +
      "0101" +
      hash(patientPubKey).substring(0, 60),
    url = "http://rest-api:8008/state/" + address;
  const response = await fetch(url, { method: "GET" });
  const responseJson = await response.json(),
    result = new Buffer(responseJson.data, "base64").toString();
  patientData = JSON.parse(result);
  console.log("TCL: patientData", patientData.reports[i]);
  if (patientData.reports[i].flag === 0) {
    delete payload["key"];
    payload.action = "RATE";

    try {
      let client = new Client(key);
      let sendData = await client.sendData(JSON.stringify(payload));
      console.log("TCL: sendData", sendData)
      if (sendData[0] === 200 || sendData[0] === 202) {
        const transactionId = sendData[1].transactionIds[0];
        let idVar = setInterval(check, 10);
        let i = 0;
        async function check() {
          i++;
          console.log("times", i);
          const data = await getReceipt(transactionId);
          console.log("TCL: check -> data", data);
          if (data && data.data) {
            clearInterval(idVar);
            msg = "Rating Successful";
            res.send({ message: msg });
          }
        }
      } else {
        msg = "Rating UnSuccessful";
        res.send({ message: msg });
      }
    } catch (error) {
      console.log("TCL: error", error);
      msg = "Invalid Rating";
    }
  } else {
    msg = "Already Rated";
  }
  res.send({ message: msg });
});

router.post("/addRep", async function(req, res, next) {
  let payload = req.body;
  payload.action = "addReport";
  let client = new Client(payload.doctorPrivateKey);
  delete payload["doctorPrivateKey"];
  let msg = "";
  try {
    const sendData = await client.sendData(JSON.stringify(payload));
    console.log("TCL: sendData", sendData);
    if (sendData[0] === 200 || sendData[0] === 202) {
      const transactionId = sendData[1].transactionIds[0];
      let idVar = setInterval(check, 10);
      let i = 0;
      async function check() {
        i++;
        console.log("times", i);
        const data = await getReceipt(transactionId);
        console.log("TCL: check -> data", data);
        if (data && data.data) {
          clearInterval(idVar);
          msg = "Report Added Successfully";
          res.send({ message: msg });
        }
      }
    } else {
      msg = "Adding UnSuccessful";
      res.send({ message: msg });
    }
  } catch (error) {
    console.log("TCL: error", error);
    msg = "Invalid Key";
    res.send({ message: msg });
  }
});

router.get("/view", function(req, res, next) {
  let hospitalList = [];
  let hospitals = client.getHospitals("");
  hospitals.then(response => {
    let responseObj = JSON.parse(response);
    for (hospital of responseObj.data) {
      let hospitalObj = hospital;
      hospitalList.push(hospitalObj);
    }
    res.render("hospitalView", { hospitals: hospitalList });
  });
});

router.post("/viewPatient", async function(req, res, next) {
  let key = req.body.key;
  const address =
      hash("Patient Record Management").substring(0, 6) +
      "0101" +
      hash(key).substring(0, 60),
    url = "http://rest-api:8008/state/" + address;
  const response = await fetch(url, { method: "GET" });
  const responseJson = await response.json(),
    result = new Buffer(responseJson.data, "base64").toString();
  patientData = JSON.parse(result);
  res.send({ patientData });
});

module.exports = router;
