const {TransactionProcessor} = require('sawtooth-sdk/processor');

const hospitalHandler = require('./hospital-handler');
const nonHospitalHandler = require('./non-hospital-handler');
const patientHandler = require('./patient-handler');

const address = 'tcp://validator:4004';

const processor = new TransactionProcessor(address);
processor.addHandler(new hospitalHandler());
processor.addHandler(new nonHospitalHandler());
processor.addHandler(new patientHandler());
processor.start();