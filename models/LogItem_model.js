const http = require("http");

var LogItemClass = class LogItem {
	
	constructor(calledMethod, callerAddress, parameters) {
		this.calledMethod = calledMethod;
		this.callerAddress = callerAddress;
		this.callerParameters = parameters;
		this.calledDate = new Date();
	}
	
	getCallerMethod() {
		return this.calledMethod.toString();
	}
	
	getCallerAddress() {
		return this.callerAddress.toString();
	}
	
	getCallerParameters() {
		return JSON.stringify(this.callerParameters);
	}
	
	getCalledDate() {
		return this.calledDate;
	}
	
	toString() {
		return "CallerMethod: " + this.getCallerMethod() + " ;; CallerAddress: " + this.getCallerAddress() + " ;; CallerParameters: " + this.getCallerParameters() + " ;; CalledDateTime: " + this.getCalledDate();
	}
};

module.exports = LogItemClass;