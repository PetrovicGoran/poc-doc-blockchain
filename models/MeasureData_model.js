const TherapyClass = require("./Therapy_model.js");
const TxInClass = require("./TxIn_model.js");

var CryptoJS = require('crypto-js');
var ecdsa = require('elliptic');
var _ = require('lodash');
const { times } = require("lodash");


const ec = new ecdsa.ec('secp256k1');

var MeasureDataClass = class MeasureData {
	constructor(patientPublicKey, doctorPublicKey, bitsPerMinute, spo2, jsonFormat = null) {
		if(typeof jsonFormat === "object" && jsonFormat !== null) {
            Object.assign(this, jsonFormat);
		}
		else {
            this.id = "";
            this.patientPublicKey = patientPublicKey;
            this.doctorPublicKey = doctorPublicKey;
            this.bitsPerMinute = bitsPerMinute;         // this is array of numbers
            this.spo2 = spo2;                           // this is array of numbers
            this.signature = "";
            this.timestamp = parseInt(Date.now());
        }
        
        this.parseToInt();
    }

    parseToInt() {
        this.timestamp = parseInt(this.timestamp);
    }

    arrayToString(array) {
        var ret = "";

        if(! array instanceof Array)
            console.log("MEASURE DATA: in arrayToString - array is not type of Array!!!");

        for(var i = 0; i < array.length; i++)
            ret += array[i].toString() + ",";

        if(ret.length > 0)
            ret = ret.substr(0, ret.length - 1);

        return ret;
    }

    getMeasureDataId() {        
        //edit
        const measureDataContent = this.patientPublicKey + this.doctorPublicKey + this.arrayToString(this.bitsPerMinute) + this.arrayToString(this.spo2) + this.timestamp;

        //edit
        return CryptoJS.SHA256(measureDataContent).toString();
    }

    getPatientPublicKey() {
        return this.patientPublicKey;
    }
    
    getDoctorPublicKey() {
        return this.doctorPublicKey;
    }
	
	getBitsPerMinute() {
		return this.bitsPerMinute;
	}
	
	getSpo2() {
		return this.spo2;
    }

    getTimestamp() {
        return this.timestamp;
    }
    
    setMeasureDataId() {
        this.id = this.getMeasureDataId();
    }

    setSignature(signature) {
        this.signature = signature;
    }
	
	toString() {
        var ret = "patientPublicKey: " + this.patientPublicKey + " doctorPublicKey: " + this.doctorPublicKey + " bitsPerMinute: " + this.arrayToString(this.bitsPerMinute) + " spo2: " + this.arrayToString(this.spo2)
            + "id: " + this.id + " signature: " + this.signature + " timestamp: " + this.timestamp;

        return ret;
    }

    toStringForHash() {
        return this.toString();
    }

    static signMeasureData(transaction, measureDataIndex, privateKey) {
        const measureData = transaction.measureData[measureDataIndex];
        const dataToSign = transaction.id;
        
        const key = ec.keyFromPrivate(privateKey, 'hex');
        const signature = TxInClass.toHexString(key.sign(dataToSign).toDER());
        
        return signature;
    }

    static isSameTransactionInArray(measureDataA, measureDataB) {
        var countSame = 0;

        for(var i = 0; i < measureDataA.length; i++) {
            for(var j = 0; j < measureDataB.length; j++) {
                if(measureDataA[i].arrayToString(measureDataA[i].bitsPerMinute) === measureDataB[j].arrayToString(measureDataB[j].bitsPerMinute) && measureDataA[i].arrayToString(measureDataA[i].spo2) === measureDataB[j].arrayToString(measureDataB[j].spo2) 
                    && measureDataA[i].doctorPublicKey === measureDataB[j].doctorPublicKey && measureDataA[i].patientPublicKey === measureDataB[j].patientPublicKey
                    && measureDataA[i].id === measureDataB[j].id && measureDataA[i].signature === measureDataB[j].signature 
                    && measureDataA[i].timestamp == measureDataB[j].timestamp) {

                        countSame++;
                        break;
                }
            }
        }

        if(countSame === measureDataA.length && countSame === measureDataB.length)
            return true;

        return false;
    }

    static isValidMeasureDataStructure(measureData) {
        
        if (measureData == null) {
            console.log('measureData is null');
            return false;
        }

        else if (typeof measureData.doctorPublicKey !== 'string') {
            console.log('invalid doctorPublicKey type in measureData');
            return false;
        }

        else if (typeof measureData.patientPublicKey !== 'string') {
            console.log('invalid patientPublicKey type in measureData');
            return false;
        }

        else if (! (measureData.bitsPerMinute instanceof Array)) {
            console.log('invalid bitsPerMinute type in measureData');
            return false;
        }

        else if (! (measureData.spo2 instanceof Array)) {
            console.log('invalid spo2 type in measureData');
            return false;
        }

        else if (typeof measureData.id !== 'string') {
            console.log('invalid id type in measureData');
            return false;
        }

        else if (typeof measureData.signature !== 'string') {
            console.log('invalid signature type in measureData');
            return false;
        }

        else if (typeof measureData.timestamp !== 'number') {
            console.log('invalid signature type in measureData');
            return false;
        }
        
        else {
            return true;
        }
    }
};


module.exports = MeasureDataClass;