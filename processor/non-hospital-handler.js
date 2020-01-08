const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')
const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding')
const { createHash } = require('crypto')

const FAMILY_NAME = 'non-hospital'
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
				case 'addNewHospital': {
					// Validation for required fields
					if (!payload.id) {
						throw new InvalidTransaction('Hospital id required')
					}
					let hospitalAddress =
						NAMESPACE + '0000' + hash(payload.id).substring(0, 60)
					return context.getState([hospitalAddress]).then(async (res) => {
						console.log("TCL: Handler -> apply -> res", res)
						let entries = {}
						entries[hospitalAddress] = encoder.encode(
							JSON.stringify({
								publickey: payload.id,
								registerNo: payload.regNo,
								hospitalName: payload.hospitalName,
								contactNo: payload.contactNo,
								address: payload.address,
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
				case 'updateHospital': {
					// Validation for required fields
					console.log('INSIDE UPDATE________________')
					if (!payload.id) {
						throw new InvalidTransaction('Hospital id required')
					}
					let hospitalAddress =
						NAMESPACE + '0000' + hash(payload.id).substring(0, 60)
					return context.getState([hospitalAddress]).then(async (res) => {
						let hospitalData = JSON.parse(decoder.decode(res[hospitalAddress]))
						hospitalData["publickey"] = payload.id
						hospitalData["registerNo"] = payload.regNo
						hospitalData["hospitalName"] = payload.hospitalName
						hospitalData["contactNo"] = payload.contactNo
						hospitalData["address"] = payload.address
						let dataBytes = encoder.encode(JSON.stringify(hospitalData))
						let entries = {}
						entries[hospitalAddress] = dataBytes
						const Status = await context.setState(entries)
						context.addReceiptData(Buffer.from(Status, 'utf8'))
						return Status;
						// return context.setState(entries)
					})
				}
				case 'deleteHospital': {
					// Validation for required fields
					if (!payload.address) {
						throw new InvalidTransaction('Hospital state address required')
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
