const TherapyClass = require("./Therapy_model.js");
const TxInClass = require("./TxIn_model.js");

var CryptoJS = require('crypto-js');
var ecdsa = require('elliptic');
var _ = require('lodash');


const ec = new ecdsa.ec('secp256k1');

var DiagnosisClass = class Diagnosis {
	constructor(doctorPublicKey, patientPublicKey, name, description, jsonFormat = null) {
		if(typeof jsonFormat === "object" && jsonFormat !== null) {
            Object.assign(this, jsonFormat);
		}
		else {
            this.id = "";
            this.doctorPublicKey = doctorPublicKey;
            this.patientPublicKey = patientPublicKey;
			this.name = name;
            this.description = description;
            this.signature = "";
            this.timestamp = parseInt(Date.now());
        }
        
        this.parseToInt();
    }

    parseToInt() {
        this.timestamp = parseInt(this.timestamp);
    }

    getDiagnosisId() {        
        //edit
        const diagnosisContent = this.doctorPublicKey + this.patientPublicKey + this.name + this.description + this.timestamp;

        //edit
        return CryptoJS.SHA256(diagnosisContent).toString();
    }
    
    getDoctorPublicKey() {
        return this.doctorPublicKey;
    }

    getPatientPublicKey() {
        return this.patientPublicKey;
    }
	
	getName() {
		return this.name;
	}
	
	getDescription() {
		return this.description;
    }

    getTimestamp() {
        return this.timestamp;
    }
    
    setDiagnosisId() {
        this.id = this.getDiagnosisId();
    }

    setSignature(signature) {
        this.signature = signature;
    }
	
	toString() {
        var ret = "doctorPublicKey: " + this.doctorPublicKey + " patientPublicKey: " + this.patientPublicKey + " name: " + this.name + " description: " + this.description
            + "id: " + this.id + " signature: " + this.signature + " timestamp: " + this.timestamp;

        return ret;
    }

    toStringForHash() {
        return this.toString();
    }

    static signDiagnosis(transaction, diagnosisIndex, privateKey) {
        const diagnosis = transaction.diagnosis[diagnosisIndex];
        const dataToSign = transaction.id;
        
        const key = ec.keyFromPrivate(privateKey, 'hex');
        const signature = TxInClass.toHexString(key.sign(dataToSign).toDER());
        
        return signature;
    }

    static isSameTransactionInArray(diagnosisA, diagnosisB) {
        var countSame = 0;

        for(var i = 0; i < diagnosisA.length; i++) {
            for(var j = 0; j < diagnosisB.length; j++) {
                if(diagnosisA[i].name === diagnosisB[j].name && diagnosisA[i].description === diagnosisB[j].description 
                    && diagnosisA[i].doctorPublicKey === diagnosisB[j].doctorPublicKey && diagnosisA[i].patientPublicKey === diagnosisB[j].patientPublicKey
                    && diagnosisA[i].id === diagnosisB[j].id && diagnosisA[i].signature === diagnosisB[j].signature 
                    && diagnosisA[i].timestamp == diagnosisB[j].timestamp) {
                    //&& TherapyClass.isSameTransactionInArray(diagnosisA[i].therapies, diagnosisB[j].therapies)) {

                        countSame++;
                        break;
                }
            }
        }

        if(countSame === diagnosisA.length && countSame === diagnosisB.length)
            return true;

        return false;
    }

    static isValidDiagnosisStructure(diagnose) {
        
        if (diagnose == null) {
            console.log('diagnose is null');
            return false;
        }

        else if (typeof diagnose.doctorPublicKey !== 'string') {
            console.log('invalid doctorPublicKey type in Diagnosis');
            return false;
        }

        else if (typeof diagnose.patientPublicKey !== 'string') {
            console.log('invalid patientPublicKey type in Diagnosis');
            return false;
        }

        else if (typeof diagnose.name !== 'string') {
            console.log('invalid name type in Diagnosis');
            return false;
        }

        else if (typeof diagnose.description !== 'string') {
            console.log('invalid description type in Diagnosis');
            return false;
        }

        else if (typeof diagnose.id !== 'string') {
            console.log('invalid id type in Diagnosis');
            return false;
        }

        else if (typeof diagnose.signature !== 'string') {
            console.log('invalid signature type in Diagnosis');
            return false;
        }

        else if (typeof diagnose.timestamp !== 'number') {
            console.log('invalid signature type in Diagnosis');
            return false;
        }
        
        else {
            return true;
        }
    }
};


module.exports = DiagnosisClass;