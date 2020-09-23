const http = require("http");
const LogItem = require("./LogItem_model.js");

var LogClass = class Log {
	
	constructor() {
		this.logLines = [];
	}
	
	addLogItem(calledMethod, callerAddress, parameters) {
		this.logLines.push(new LogItem(calledMethod, callerAddress, parameters));
	}
	
	getLog() {
		return this.logLines;
	}
	
	toString() {
		var ret = "";
		
		for(var i = 0; i < this.logLines.length; i++) {
			ret += this.logLines[i].toString() + "\n";
		}
		
		return ret;
	}
};

module.exports = LogClass;