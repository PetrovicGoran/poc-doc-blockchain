const TxInClass = require("./TxIn_model.js");

var CryptoJS = require('crypto-js');
var ecdsa = require('elliptic');
var _ = require('lodash');
const { parse } = require("path");


const ec = new ecdsa.ec('secp256k1');

var TherapyClass = class Therapy {
	constructor(doctorPublicKey, patientPublicKey, diagnosisId, name, description, triggerCode, startDate, endDate, repetition, jsonFormat = null) {
		if(typeof jsonFormat === "object" && jsonFormat !== null) {
            Object.assign(this, jsonFormat);
		}
		else {
            this.id = "";
            this.doctorPublicKey = doctorPublicKey;
            this.patientPublicKey = patientPublicKey;
            this.diagnosisId = diagnosisId;
			this.name = name;
            this.description = description;
            this.triggerCode = triggerCode;
            this.startDate = startDate;
            this.endDate = endDate;
            this.repetition = repetition;
            this.signature = "";
            this.timestamp = parseInt(Date.now());
        }
        
        this.parseToInt();
    }

    parseToInt() {
        this.triggerCode = parseInt(this.triggerCode);
        this.repetition = parseInt(this.repetition);
        this.timestamp = parseInt(this.timestamp);
    }

    getTherapyId() {        
        //edit
        const therapyContent = this.doctorPublicKey + this.patientPublicKey + this.diagnosisId + this.name + this.description 
            + this.triggerCode + this.startDate + this.endDate + this.repetition + this.timestamp;

        //edit
        return CryptoJS.SHA256(therapyContent).toString();
    }
    
    getDoctorPublicKey() {
        return this.doctorPublicKey;
    }

    getPatientPublicKey() {
        return this.patientPublicKey;
    }

    getDiagnosisId() {
        return this.diagnosisId;
    }
	
	getName() {
		return this.name;
	}
	
	getDescription() {
		return this.description;
    }

    getTriggerCode() {
		return this.triggerCode;
    }

    getStartDate() {
        return this.startDate;
    }

    getEndDate() {
        return this.endDate;
    }

    getRepetition() {
        return this.repetition;
    }

    getTimestamp() {
        return this.timestamp;
    }
    
    setTherapyId() {
        this.id = this.getTherapyId();
    }

    setSignature(signature) {
        this.signature = signature;
    }
	
	toString() {
        var ret = "doctorPublicKey: " + this.doctorPublicKey + " patientPublicKey: " + this.patientPublicKey + " diagnosisId: " + this.diagnosisId + " name: " + this.name + " description: " + this.description
            "triggerCode: " + this.triggerCode + " startDate: "+ this.startDate + " endDate: " + this.endDate + " repetition: " + this.repetition + " id: " + this.id + " signature: " + this.signature + " timestamp: " + this.timestamp;

        return ret;
    }

    toStringForHash() {
        return this.toString();
    }

    static signTherapy(transaction, therapyIndex, privateKey) {
        const therapy = transaction.therapies[therapyIndex];
        const dataToSign = transaction.id;
        
        const key = ec.keyFromPrivate(privateKey, 'hex');
        const signature = TxInClass.toHexString(key.sign(dataToSign).toDER());
        
        return signature;
    }

    static isSameTransactionInArray(therapyA, therapyB) {
        var countSame = 0;

        for(var i = 0; i < therapyA.length; i++) {
            for(var j = 0; j < therapyB.length; j++) {
                if(therapyA[i].name === therapyB[j].name && therapyA[i].description === therapyB[j].description && therapyA[i].triggerCode === therapyB[j].triggerCode  
                    && therapyA[i].doctorPublicKey === therapyB[j].doctorPublicKey && therapyA[i].patientPublicKey === therapyB[j].patientPublicKey && therapyA[i].diagnosisId === therapyB[j].diagnosisId
                    && therapyA[i].startDate === therapyB[j].startDate && therapyA[i].endDate === therapyB[j].endDate && therapyA[i].repetition == therapyB[j].repetition
                    && therapyA[i].id === therapyB[j].id && therapyA[i].signature === therapyB[j].signature 
                    && therapyA[i].timestamp == therapyB[j].timestamp) {
                    //&& TherapyClass.isSameTransactionInArray(therapyA[i].therapies, therapyB[j].therapies)) {

                        countSame++;
                        break;
                }
            }
        }

        if(countSame === therapyA.length && countSame === therapyB.length)
            return true;

        return false;
    }

    static isValidTherapyStructure(therapy) {
        
        if (therapy == null) {
            console.log('therapy is null');
            return false;
        }

        else if (typeof therapy.doctorPublicKey !== 'string') {
            console.log('invalid doctorPublicKey type in Therapy');
            return false;
        }

        else if (typeof therapy.patientPublicKey !== 'string') {
            console.log('invalid patientPublicKey type in Therapy');
            return false;
        }

        else if (typeof therapy.diagnosisId !== 'string') {
            console.log('invalid diagnosisId type in Therapy');
            return false;
        }

        else if (typeof therapy.name !== 'string') {
            console.log('invalid name type in Therapy');
            return false;
        }

        else if (typeof therapy.description !== 'string') {
            console.log('invalid description type in Therapy');
            return false;
        }

        else if (typeof therapy.triggerCode !== 'number') {
            console.log('invalid triggerCode type in Therapy');
            return false;
        }

        else if (typeof therapy.startDate !== 'string') {
            console.log('invalid startDate type in Therapy');
            return false;
        }

        else if (typeof therapy.endDate !== 'string') {
            console.log('invalid endDate type in Therapy');
            return false;
        }

        else if (typeof therapy.repetition !== 'number') {
            console.log('invalid repetition type in Therapy');
            return false;
        }

        else if (typeof therapy.id !== 'string') {
            console.log('invalid id type in Therapy');
            return false;
        }

        else if (typeof therapy.signature !== 'string') {
            console.log('invalid signature type in Therapy');
            return false;
        }

        else if (typeof therapy.timestamp !== 'number') {
            console.log('invalid signature type in Therapy');
            return false;
        }
        
        else {
            return true;
        }
    }
};


module.exports = TherapyClass;