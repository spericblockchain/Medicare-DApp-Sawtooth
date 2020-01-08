const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')
const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding')
const { createHash } = require('crypto')

const FAMILY_NAME = 'hospital'
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
	apply(transactionProcessRequest, context) {
		try {
			let publicKey = transactionProcessRequest.header.signerPublicKey
			let payload = JSON.parse(
				decoder.decode(transactionProcessRequest.payload)
			)
			console.log('TCL: Handler -> apply -> payload', payload)
			console.log('NEWPAYLOADACTION: ' + payload.action)
			switch (payload.action) {
				case 'addNewDoctor': {
					// Validation for required fields
					if (!payload.id) {
						throw new InvalidTransaction('Doctor id required')
					}
					let doctorAddress =
						NAMESPACE +
						'1111' +
						hash(publicKey).substring(0, 30) +
						hash(payload.id).substring(0, 30)
					return context.getState([doctorAddress]).then(async (res) => {
						// Checking if address already exists
						if (res[doctorAddress].length !== 0) {
							throw new InvalidTransaction('This Doctor already exists')
						}
						let entries = {}
						entries[doctorAddress] = encoder.encode(
							JSON.stringify({
								publickey: payload.id,
								registerNo: payload.regNo,
								doctorName: payload.doctorName,
								department: payload.area,
								contactNo: payload.contactNo,
								hospitalName: payload.hospitalName,
								patientCount: 0,
								rating: 0
							})
						)
						const Status = await context.setState(entries)
						context.addReceiptData(Buffer.from(Status, 'utf8'))
						return Status;
						// return context.setState(entries)
					})
				}
				case 'updateDoctor': {
					// Validation for required fields
					console.log('INSIDE UPDATE________________')
					if (!payload.id) {
						throw new InvalidTransaction('Doctor id required')
					}
					let doctorAddress =
						NAMESPACE +
						'1111' +
						hash(publicKey).substring(0, 30) +
						hash(payload.id).substring(0, 30)
					return context.getState([doctorAddress]).then(async (res) => {
						if (res[doctorAddress].length === 0) {
							throw new InvalidTransaction(
								'This Doctor does not exist to update'
							)
						}
						let doctorData = JSON.parse(decoder.decode(res[doctorAddress]))
						doctorData["publickey"] = payload.id
						doctorData["registerNo"] = payload.regNo
						doctorData["doctorName"] = payload.doctorName
						doctorData["department"] = payload.area
						doctorData["contactNo"] = payload.contactNo
						doctorData["hospitalName"] = payload.hospitalName 
						let dataBytes = encoder.encode(JSON.stringify(doctorData))
						let entries = {}
						entries[doctorAddress] = dataBytes
						const Status = await context.setState(entries)
						context.addReceiptData(Buffer.from(Status, 'utf8'))
						return Status;
						// return context.setState(entries)
					})
				}
				case 'deleteDoctor': {
					// Validation for required fields
					if (!payload.address) {
						throw new InvalidTransaction('Doctor state address required')
					}
					return context.deleteState([payload.address])
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
