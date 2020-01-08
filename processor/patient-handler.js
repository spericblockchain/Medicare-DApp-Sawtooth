	const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
	const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')
	const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding')
	const { createHash } = require('crypto')

	const FAMILY_NAME = 'patient'
	const FAMILY_VERSION = '1.0'
	const NAMESPACE = hash('Patient Record Management').substring(0, 6)

	var encoder = new TextEncoder('utf8')
	var decoder = new TextDecoder('utf8')

	function hash(v) {
		return createHash('sha512')
			.update(v)
			.digest('hex')
	}

	class Handler extends TransactionHandler {
		constructor() {
			super(FAMILY_NAME, [FAMILY_VERSION], [NAMESPACE])
		}
		async apply(transactionProcessRequest, context) {
			try {
				let publicKey = transactionProcessRequest.header.signerPublicKey
				let payload = JSON.parse(
					decoder.decode(transactionProcessRequest.payload)
				)
				console.log('TCL: Handler -> apply -> payload', payload)
				console.log('NEWPAYLOADACTION: ' + payload.action)
				switch (payload.action) {
					case 'addNewPatient': {

						payload.id = publicKey
						// Validation for required fields
						if (!payload.id) {
							throw new InvalidTransaction('Doctor id required')
						}
						let patientAddress =
							NAMESPACE + '0101' + hash(publicKey).substring(0, 60)
						return context.getState([patientAddress]).then(async res => {
							// Checking if address already exists
							if (res[patientAddress].length !== 0) {
								throw new InvalidTransaction('This Patient already exists')
							}
							let entries = {}
							entries[patientAddress] = encoder.encode(
								JSON.stringify({
									publickey: payload.id,
									patientName: payload.patientName,
									age: payload.age,
									sex: payload.sex,
									blood: payload.blood,
									address: payload.address,
									contactNo: payload.contactNo,
									reports: []
								})
							)
							const Status = await context.setState(entries)
							await context.addReceiptData(Buffer.from(Status, 'utf8'))
							return Status;
						})
					}
					case 'RATE': {
						let patientAddress =
							NAMESPACE + '0101' + hash(publicKey).substring(0, 60)
						return context.getState([patientAddress]).then(async res => {
							if (res[patientAddress].length === 0) {
								throw new InvalidTransaction(
									'This Patient does not exist to rate'
								)
							}
							let patientData = JSON.parse(decoder.decode(res[patientAddress]))
							// patientData["publickey"] = payload.id
							patientData.reports[payload.i].rating = payload.rating;
							patientData.reports[payload.i].flag = 1;
							console.log("PAAAATTTTT",patientData)
							let dataBytes = encoder.encode(JSON.stringify(patientData))
							let entries = {}
							entries[patientAddress] = dataBytes
							const a = await context.setState(entries)

							const hospitalPubKey = patientData.reports[payload.i].hospitalPubKey,
							doctorPubKey = patientData.reports[payload.i].doctorPubKey;
							let doctorAddress = NAMESPACE + '1111' + hash(hospitalPubKey).substring(0, 30) +hash(doctorPubKey).substring(0, 30),
							hospitalAddress = NAMESPACE + '0000' + hash(hospitalPubKey).substring(0, 60)
						return context.getState([doctorAddress]).then(resu => {
							if (resu[doctorAddress].length === 0) {
								throw new InvalidTransaction(
									'This Doctor does not exist to update'
								)
							}
							let doctorData = JSON.parse(decoder.decode(resu[doctorAddress]))

							console.log("TCL: Handler -> apply -> payload.rating", payload.rating)
							if(doctorData["rating"] === 0){
								doctorData["rating"] = payload.rating
							}
							else{
								let newRate =(parseFloat(doctorData["rating"]) * parseFloat(doctorData["patientCount"]))+ parseFloat(payload.rating)
                console.log("TCL: Handler -> apply -> newRate", newRate)
								doctorData["rating"] = newRate/(parseFloat(doctorData["patientCount"])+1)
                console.log("TCL: Handler -> apply -> doctorData", doctorData)
							}
							
							doctorData["patientCount"]++;
							let dataBytes = encoder.encode(JSON.stringify(doctorData))
							let entry = {}
							entry[doctorAddress] = dataBytes
							const b = context.setState(entry)
							return context.getState([hospitalAddress]).then(resul => {
								// Checking if address already exists
								if (resul[hospitalAddress].length === 0) {
									throw new InvalidTransaction(
										'This hospital does not exist to update'
									)
								}
								let hospitalData = JSON.parse(decoder.decode(resul[hospitalAddress]))
								if(hospitalData["rating"] === 0){
									hospitalData["rating"] = payload.rating
								}
								else{
									let newRate = (parseFloat(hospitalData["rating"]) * parseFloat(hospitalData["patientCount"]))+ parseFloat(payload.rating)
									hospitalData["rating"] = newRate/(parseFloat(hospitalData["patientCount"])+1)
								}
								hospitalData["patientCount"]++;
								let dataBytes = encoder.encode(JSON.stringify(hospitalData))
								let entries = {}
								entries[hospitalAddress] = dataBytes
								context.setState(entries)
								context.addReceiptData(Buffer.from(b, 'utf8'))
							return (a,b)
						})
						})
					})
					}
					
					case 'addReport': {
						// Validation for required fields
						console.log('INSIDE REPORT_______________')
						if (!payload.patientPubKey) {
							throw new InvalidTransaction('Patient id required')
						}

						let patientAddress =
							NAMESPACE + '0101' + hash(payload.patientPubKey).substring(0, 60);
						
						delete payload['patientPubKey'];
						delete payload['action'];
						payload.doctorPubKey = publicKey;
						payload.rating = 0;
						payload.flag = 0;
						return context.getState([patientAddress]).then(async (res) => {
							if (res[patientAddress].length !== 0) {
								let patientData = JSON.parse(decoder.decode(res[patientAddress])) 
								patientData["reports"].push(payload)
								let dataBytes = encoder.encode(JSON.stringify(patientData))
								let entries = {}
								entries[patientAddress] = dataBytes
								context.setState(entries)
								const Status = await context.setState(entries)
								context.addReceiptData(Buffer.from(Status, 'utf8'))
								return Status;
							}
							else{
								throw new InvalidTransaction('This Patient does not exist')
							}
						})
					}
					default:
						throw new InvalidTransaction('Invalid action')
				}
			} catch (err) {
				console.error(err)
			}
		}
	}

	module.exports = Handler
