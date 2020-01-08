    const {createHash} = require('crypto');
    const {CryptoFactory, createContext} = require('sawtooth-sdk/signing');
    const protobuf = require('sawtooth-sdk/protobuf');
    const fetch = require('node-fetch');
    const {Secp256k1PrivateKey} = require('sawtooth-sdk/signing/secp256k1');
    const {TextEncoder} = require('text-encoding/lib/encoding');

    const FAMILY_NAME="patient";
    const FAMILY_VERSION="1.0";
    const NAMESPACE = hash("Patient Record Management").substring(0,6);
    function hash(v) {
        return createHash('sha512').update(v).digest('hex');
    }
    function keyGen(key){
        const context = createContext('secp256k1'),
        secp256k1pk = Secp256k1PrivateKey.fromHex(key),
        signer = new CryptoFactory(context).newSigner(secp256k1pk),
        publicKey = signer.getPublicKey().asHex();
        return publicKey;
    }

    class Client {
        constructor(privateKey){
            const context = createContext('secp256k1');
            const secp256k1pk = Secp256k1PrivateKey.fromHex(privateKey);
            this.signer = new CryptoFactory(context).newSigner(secp256k1pk);
            this.publicKey = this.signer.getPublicKey().asHex();
            this.address = NAMESPACE;
        }
            async getDataNew(address) {
            try {
                let url = '';
                if(address) {
                    url = address.length == 70 ? 'http://rest-api:8008/state/' + address : 'http://rest-api:8008/state?address=' + address;
                }
                let response = await fetch(url,{ method: 'GET', });
                let responseJson = await response.json();
                if(Array.isArray(responseJson.data)) {
                    let hospitals = [];
                    for(let hospital of responseJson.data) {
                        if(!Array.isArray(JSON.parse(new Buffer(hospital.data,'base64').toString()))) {
                            let hospitalObj = JSON.parse(new Buffer(hospital.data,'base64').toString());
                            hospitalObj.hospitalStateAddress = hospital.address;
                            hospitals.push(hospitalObj);
                        }
                    }
                    return JSON.stringify({ "data" : hospitals });
                } else {
                    return (responseJson.data ? new Buffer(responseJson.data,'base64').toString() : JSON.stringify(responseJson));
                }            
            }
            catch(error){
                console.error(error);
            }
        }
        async sendData(payload) {
            console.log("TCL: Client -> sendData -> payload", payload)
            let encode =new TextEncoder('utf8');
            const payloadBytes = encode.encode(payload); 
            const p = JSON.parse(payload)
            let flag = 0;
            if(p.action === 'addNewPatient'){
                console.log("TCL: Client -> sendData -> p.id", this.publicKey)
                const patients = await this.getPatients(this.publicKey)
                console.log("TCL: Client -> sendData -> hospitals", patients)
                const data = await JSON.parse(patients);
                console.log("TCL: Client -> sendData -> data", data)
                if(data && data.publickey === this.publicKey){
                    flag = 1
                    console.log("TCL: Client -> sendData -> flag", flag)
                }
            }
            const transactionHeaderBytes = protobuf.TransactionHeader.encode({
                familyName: FAMILY_NAME,
                familyVersion: FAMILY_VERSION,
                inputs: [this.address],
                outputs: [this.address],
                signerPublicKey: this.publicKey,
                nonce: "" + Math.random(),
                batcherPublicKey: this.publicKey,
                dependencies: [],
                payloadSha512: hash(payloadBytes)
            }).finish();
            const transaction = protobuf.Transaction.create({
                header: transactionHeaderBytes,
                headerSignature: this.signer.sign(transactionHeaderBytes),
                payload: payloadBytes
            });
            const transactions = [transaction];
            const batchHeaderBytes = protobuf.BatchHeader.encode({
                signerPublicKey: this.publicKey,
                transactionIds: transactions.map((txn) => txn.headerSignature),
            }).finish();
            const batch = protobuf.Batch.create({
                header: batchHeaderBytes,
                headerSignature: this.signer.sign(batchHeaderBytes),
                transactions: transactions,
            });
            const batchListBytes = protobuf.BatchList.encode({
                batches: [batch]
            }).finish();
            let response = await fetch('http://rest-api:8008/batches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream'
                },
                body: batchListBytes
            });
            return [response.status, protobuf.BatchHeader.decode(batchHeaderBytes),flag]
        }
        async getHospitals(key) {
            let address = hash("Patient Record Management").substring(0,6) + '0000';
            if(key) {
                address = address + hash(key).substring(0,60);
            }
            return this.getDataNew(address);
        }
        async getDoctors(key) {
            let address = hash("Patient Record Management").substring(0,6) + '1111';
            if(key) {
                address = address + hash(this.publicKey).substring(0,30) + hash(key).substring(0,30);
            }
            return this.getDataNew(address);
        }
        async getPatients(key){
            let address = hash("Patient Record Management").substring(0,6) + '0101';
            if(key) {
                address = address + hash(key).substring(0,60);
            }
            return this.getDataNew(address);
        }
    }
    module.exports = {
        Client, keyGen, hash
    };