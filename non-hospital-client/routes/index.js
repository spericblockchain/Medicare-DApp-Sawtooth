	const express = require('express'),
		router = express.Router(),
		{Client} = require('./client');
		key = 'b75566cc1d27fe87bda19efc7066e874b13e9d848847a688dfc1912087368528',
		client = new Client(key)
		config = require('../config/config.js')
		fetch = require('node-fetch'),

	/* GET home page. */
	router.get('/', (req, res, next) => {
		res.render('index')
	})

	router.get('/mainView', (req, res, next) => {
		res.render('mainView')
	})

	router.get('/search', (req, res, next) => {
		res.render('search')
	})

	router.get('/hospitalAdd', (req, res, next) => {
		res.render('hospitalAdd')
	})

	router.get('/hospitalView', (req, res, next) => {
		res.render('hospitalView')
	})

	router.post('/login', async (req, res, next) => {
		const Key = req.body.pri_key
		
            console.log("TCL: Key", Key)
			let isCorrect = 0,
			msg = ''
			try {
			if(Key === key){
				isCorrect = 1
				msg = 'Successfully Login'
			}
			else{
				msg = 'Enter a valid private key'
			}
		} catch (error) {
			msg = 'Invalid Key'
		}
		res.send({ privatekey: Key, done: isCorrect, message: msg })
	})
	async function getReceipt(id) {
		try {
			let ReceiptRequest = config.api + '/receipts?id=',
				ReceiptResponse = await fetch((ReceiptRequest += id))
			return await ReceiptResponse.json()
			
		} catch (error) {
            console.log("TCL: getReceipt -> error", error)
			
		}
	}
	router.post('/add', async (req, res, next) => {
		const payload = req.body
        console.log("TCL: payload", payload)
		payload.action = 'addNewHospital'
		let msg = ''
		try {
			const sendData = await client.sendData(JSON.stringify(payload))
            if(sendData[0] === 200 || sendData[0] === 202){
				if(sendData[2] === 1){
					msg = 'This Hospital Already exists'
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
							// const a = data.data[0].state_changes[0].value
							// res.send({
							// 	data: Buffer.from(a, 'base64').toString()
							// })
	
							msg = 'Hospital Added Successfully'
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
	})

	router.post('/update', async (req, res, next) => {
		const payload = req.body
		payload.action = 'updateHospital'
		console.log('TCL: payload', payload)
		let msg = ''
		try {
			const sendData = await client.sendData(JSON.stringify(payload))
			console.log("TCL: sendData", sendData)
			if(sendData[0] === 200 || sendData[0] === 202){
				if(sendData[2] === 1){
					msg = 'This Hospital does not exist to Update'
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
							// const a = data.data[0].state_changes[0].value
							// res.send({
							// 	data: Buffer.from(a, 'base64').toString()
							// })
	
							msg = 'Updated Successfully'
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
	})

	router.get('/view', async (req, res, next) => {
		const hospitalList = []
		try {
			hospitals = await client.getHospitals('')
			console.log('TCL: response', hospitals)
			const responseObj = JSON.parse(hospitals)
			for (hospital of responseObj.data) {
				const hospitalObj = hospital
				hospitalList.push(hospitalObj)
			}
			res.render('hospitalView', { hospitals: hospitalList })
		} catch (error) {
			console.log('Log: error', error)
		}
	})

	router.get('/viewed', async (req, res, next) => {
		const hospitalList = []
		try {
			const hospitals = await client.getDataNew(req.query.address),
				responseObj = JSON.parse(hospitals)
			res.render('modify', { hospitals: responseObj })
		} catch (error) {
			console.log('Log: error', error)
		}
	})

	router.get('/searched', async (req, res, next) => {
		try {
			const hospitals = await client.getHospitals(req.query.id)
			const responseObj = JSON.parse(hospitals)
			res.render('hospitalSearch', { hospitals: responseObj })
		} catch (error) {
			console.log('Log: error', error)
		}
	})

	router.get('/delete', async function(req, res, next) {
		let payload = {};
		payload.action = 'deleteHospital';
		payload.address = req.query.address;
		let deleteHospital = await client.sendData(JSON.stringify(payload));
        console.log("TCL: deleteHospital", deleteHospital)
		res.redirect('/mainView');
		// deleteHospital.then(response=>{
		// 	res.redirect('/mainView');
		// });
	});
	

	module.exports = router
