const express = require('express'),
  router = express.Router();
  config = require('../config/config.js')
  fetch = require('node-fetch'),
  {Client,keyGen,hash} = require('./client'),
  hospitalData = {}
  /* GET home page. */
  router.get("/", function(req, res, next) {
    res.render("index");
  });

  router.get('/mainView', function(req, res, next) {
    res.render('mainView');
  });

  router.get('/search', function(req, res, next) {
    res.render('search');
  });

  router.get('/doctorAdd', function(req, res, next) {
    res.render('doctorAdd');
  });

  router.get('/doctorView', function(req, res, next) {
    res.render('doctorView');
  });

  router.post("/login", async (req, res, next) => {
    let Key = req.body.pri_key;
    let isCorrect = 0;
    let msg = "";
    const pubKey = await keyGen(Key);
    
    console.log("TCL: pubKey", pubKey)
    const address = hash("Patient Record Management").substring(0,6) + '0000' + hash(pubKey).substring(0,60),
    url = 'http://rest-api:8008/state/' + address ;
    const response = await fetch(url,{ method: 'GET', })
    console.log("TCL: response", response.status)
    if(response.status === 200 || response.status === 202){
      const responseJson = await response.json(),
      result = new Buffer(responseJson.data,'base64').toString();
      hospitalData = JSON.parse(result);
      
      isCorrect = 1;
      msg = "Successfully Login";
    }
    else
    {
      msg = " Hospital for this Key does not Exist!!";
    }

    console.log("TCL: hospitalData", hospitalData)
    res.send({ privatekey: Key, done: isCorrect, message: msg, hospData: hospitalData });
  });

	async function getReceipt(id) {
		try {
			let ReceiptRequest = config.api + '/receipts?id=',
				ReceiptResponse = await fetch((ReceiptRequest += id))
			return await ReceiptResponse.json()
			
		} catch (error) {
            console.log("TCL: getReceipt -> error", error)
			
		}
  }
  
  router.post('/add', async function(req, res, next) {
    let payload = req.body;
    const key = payload.key
    payload.action = 'addNewDoctor';
    delete payload['key'];
    console.log("TCL: payload", payload)
    let msg = ''
    try {
      let client = new Client(key);
      let sendData = await client.sendData(JSON.stringify(payload));    
      console.log("TCL: sendData", sendData)
      if(sendData[0] === 200 || sendData[0] === 202){
				if(sendData[2] === 1){
					msg = 'This Doctor Already exists'
					res.send({ message: msg })
        }
        else{
          const transactionId = sendData[1].transactionIds[0]
					let idVar = setInterval(check, 10)
					let i = 0;
					async function check() {
						i++
						console.log("times",i);
						const data = await getReceipt(transactionId)
						console.log("TCL: check -> data", data)
						if (data && data.data) {
							clearInterval(idVar)
							msg = 'Doctor Added Successfully'
							res.send({ message: msg })
						}
					}
        }
      }
			else{
				msg = 'Adding UnSuccessful';
				res.send({ message: msg })
			}
    } catch (error) {
      console.log("TCL: error", error)
      msg = 'Invalid Key'
      res.send({ message: msg })      
    }
  });

  router.post('/update', async function(req, res, next) {
    let payload = req.body
    const key = payload.key;
    payload.action = 'updateDoctor';
    let msg = '';
    delete payload['key'];
    console.log("TCL: payload", payload)
    try {
      let client = new Client(key);
      let sendData = await client.sendData(JSON.stringify(payload));    
      if(sendData[0] === 200 || sendData[0] === 202){
				if(sendData[2] === 1){
					msg = 'This Doctor does not exist to Update'
					res.send({ message: msg })
        }
        else{
          const transactionId = sendData[1].transactionIds[0]
					let idVar = setInterval(check, 10)
					let i = 0;
					async function check() {
						i++
						console.log("times",i);
						const data = await getReceipt(transactionId)
						console.log("TCL: check -> data", data)
						if (data && data.data) {
							clearInterval(idVar)
							msg = 'Doctor Updated Successfully'
							res.send({ message: msg })
						}
					}
        }
      }
			else{
				msg = 'Updating UnSuccessful';
				res.send({ message: msg })
			}
    } catch (error) {
      console.log("TCL: error", error)
      msg = 'Invalid Key'
      res.send({ message: msg })      
    }
  });

  router.post('/view', async function(req, res, next) {
    let key = req.body.key;
    let client = new Client(key);
    let doctorList = [];
    let doctors = await client.getDoctors('');
    console.log("TCL: doctors", doctors)
        let responseObj = JSON.parse(doctors);
        for(doctor of responseObj.data) {
            let doctorObj = doctor;
            doctorList.push(doctorObj);
        }
      console.log("TCL: doctorList", doctorList)
      res.send({ doctors: doctorList });
      
  });


  router.get('/viewed', function(req, res, next) {
    let key = req.query.key,
    address = req.query.address;
    console.log("TCL: address", address)
    console.log("TCL: key", key)
    
    let client = new Client(key);
    let doctors = client.getDataNew(address);
    doctors.then(response=>{
      console.log("TCL: response", response)
          let responseObj = JSON.parse(response);
          console.log("TCL: responseObj", responseObj)
          res.render('modify', { doctors : responseObj });
    });  
  });

  router.get('/delete', function(req, res, next) {
    let payload = {};
    console.log("TCL: req.query", req.query)
    payload.action = 'deleteDoctor';
    payload.address = req.query.address;
    const key = req.query.key;
    let client = new Client(key);
    let deleteDoctor = client.sendData(JSON.stringify(payload));
    deleteDoctor.then(response=>{
        res.redirect('/mainView');
    });
  });


  router.get('/searched', function(req, res, next) {
    const key = req.query.key
    console.log("TCL: key", key)
    let client = new Client(key);
    let doctors = client.getDoctors(req.query.id);
    doctors.then(response=>{
    console.log("TCL: response", response)
        let responseObj = JSON.parse(response);
        console.log("TCL: responseObj", responseObj)
        res.render('doctorSearch', { doctors : responseObj });
    });  
  });

  module.exports = router;
