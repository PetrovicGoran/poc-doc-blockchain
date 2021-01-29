const TherapyClass = require("./Therapy_model.js");
const TxInClass = require("./TxIn_model.js");

var CryptoJS = require('crypto-js');
var ecdsa = require('elliptic');
var _ = require('lodash');


const ec = new ecdsa.ec('secp256k1');

var AnalisysClass = class Analisys {
	constructor(doctorPublicKey, patientPublicKey, diagnosisId, title, description, base64AsciiImageString, jsonFormat = null) {
		if(typeof jsonFormat === "object" && jsonFormat !== null) {
            Object.assign(this, jsonFormat);
		}
		else {
            this.id = "";
            this.doctorPublicKey = doctorPublicKey;
            this.patientPublicKey = patientPublicKey;
            this.diagnosisId = diagnosisId;
            this.title = title;
			this.description = description;
            this.base64AsciiImageString = base64AsciiImageString;
            this.signature = "";
            this.timestamp = parseInt(Date.now());
        }
        
        this.parseToInt();
    }

    parseToInt() {
        this.timestamp = parseInt(this.timestamp);
    }

    getAnalisysId() {        
        //edit
        const analisysContent = this.doctorPublicKey + this.patientPublicKey + this.diagnosisId + this.title + this.description + this.base64AsciiImageString + this.timestamp;

        //edit
        return CryptoJS.SHA256(analisysContent).toString();
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

    getTitle() {
		return this.title;
    }
	
	getDescription() {
		return this.description;
    }

    getBase64AsciiImageString() {
		return this.base64AsciiImageString;
    }

    getTimestamp() {
        return this.timestamp;
    }
    
    setAnalisysId() {
        this.id = this.getAnalisysId();
    }

    setSignature(signature) {
        this.signature = signature;
    }
	
	toString() {
        var ret = this.doctorPublicKey + this.patientPublicKey + this.diagnosisId + this.title + this.description + this.base64AsciiImageString +
            + this.id + this.signature + this.timestamp;

        return ret;
    }

    toStringForHash() {
        return this.toString();
    }

    static signAnalisys(transaction, analisysIndex, privateKey) {
        const analisys = transaction.analisys[analisysIndex];
        const dataToSign = transaction.id;
        
        const key = ec.keyFromPrivate(privateKey, 'hex');
        const signature = TxInClass.toHexString(key.sign(dataToSign).toDER());
        
        return signature;
    }

    static isSameTransactionInArray(analisysA, analisysB) {
        var countSame = 0;

        for(var i = 0; i < analisysA.length; i++) {
            for(var j = 0; j < analisysB.length; j++) {
                if(analisysA[i].title === analisysB[j].title && analisysA[i].description === analisysB[j].description && analisysA[i].base64AsciiImageString === analisysB[j].base64AsciiImageString 
                    && analisysA[i].doctorPublicKey === analisysB[j].doctorPublicKey && analisysA[i].patientPublicKey === analisysB[j].patientPublicKey && analisysA[i].diagnosisId === analisysB[j].diagnosisId
                    && analisysA[i].id === analisysB[j].id && analisysA[i].signature === analisysB[j].signature 
                    && analisysA[i].timestamp == analisysB[j].timestamp) {
                    //&& TherapyClass.isSameTransactionInArray(diagnosisA[i].therapies, diagnosisB[j].therapies)) {

                        countSame++;
                        break;
                }
            }
        }

        if(countSame === analisysA.length && countSame === analisysB.length)
            return true;

        return false;
    }

    static isValidAnalisysStructure(analisys) {
        
        if (analisys == null) {
            console.log('diagnose is null');
            return false;
        }

        else if (typeof analisys.doctorPublicKey !== 'string') {
            console.log('invalid doctorPublicKey type in Analisys');
            return false;
        }

        else if (typeof analisys.patientPublicKey !== 'string') {
            console.log('invalid patientPublicKey type in Analisys');
            return false;
        }

        else if (typeof analisys.diagnosisId !== 'string') {
            console.log('invalid diagnosisId type in Analisys');
            return false;
        }

        else if (typeof analisys.base64AsciiImageString !== 'string') {
            console.log('invalid base64AsciiImage type in Analisys');
            return false;
        }

        else if (typeof analisys.title !== 'string') {
            console.log('invalid title type in Analisys');
            return false;
        }

        else if (typeof analisys.description !== 'string') {
            console.log('invalid description type in Analisys');
            return false;
        }

        else if (typeof analisys.id !== 'string') {
            console.log('invalid id type in Analisys');
            return false;
        }

        else if (typeof analisys.signature !== 'string') {
            console.log('invalid signature type in Analisys');
            return false;
        }

        else if (typeof analisys.timestamp !== 'number') {
            console.log('invalid signature type in Analisys');
            return false;
        }
        
        else {
            return true;
        }
    }
};


module.exports = AnalisysClass;