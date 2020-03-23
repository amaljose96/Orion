let uuidV4 = require("uuid/v4");
let logs = {};
const fs = require("fs");
let { requestAdapter } = require("./config");
const timeInterval = 1000;
let currentFileName = "Hera/logs/log.json";
var colors = require("colors");


/**
 * 
 * V2 Update :
 * Since console logs go to splunk, We are going to introduce a new format for Node Logs.
 * As of now we have the basic ones for API SENT, NODE_INITIATED etc.
 * Following would be the new formats:
 * 
 * 1. NODE_INITIATED:
 *  Time | NODE_INITIATED | HTraceId | Method Url  | Request Headers | Request Body
 * 2. NODE_FAILED : 
 *  Time | NODE_FAILED | HTraceId | Method Url | Response Code | Error Message | Error Stacktrace
 * 3. NODE_COMPLETE:
 *  Time | NODE_COMPLETE | HTraceId | Method Url | Response Code | Response Headers | Response Body
 * 4. API_INITIATED:
 *  Time | API_INITIATED | HTraceId | Method Url | Request Headers | Request Body
 * 5. API_FAILED:
 *  Time | API_FAILED | HTraceId | Method Url | Response Code | Error
 * 6. API_COMPLETE
 *  Time | API_COMPLETE | HTraceId | Method Url | Response Code | Response Body
 * 
 */
function getTime(){
  const hrTime = process.hrtime();
  return hrTime[0]+":"+hrTime[1];
}
function getServiceName(headers){
  let cookieString = headers["Cookie"];
  if(!cookieString || cookieString.split("servicename=").length<=1){
    return "-"
  }
  let serviceName = cookieString.split("servicename=")[1].split(";")[0];
  return serviceName;
}
function addEntry(
  traceId,
  type,
  uuid,
  method,
  url,
  headers = "-",
  request = "-",
  responseCode = "-",
  response = "-"
) {
  let servicename = getServiceName(headers);
  try {
    headers = JSON.stringify(headers);
  } catch (err) {}
  try {
    request = JSON.stringify(request);
  } catch (err) {}
  try {
    response = JSON.stringify(response);
  } catch (err) {}
  let time = Date.now();
  let log = {
    time,
    traceId,
    type,
    uuid,
    method,
    url,
    headers,
    request,
    responseCode,
    response
  };
  switch (type) {
    case "NODE_INITIATED":
      console.log(
        `${getTime()} | ${type} | ${traceId} | ${method} ${url} | ${headers} | ${request}`
          .bgBlue.white
      );
      break;
    case "NODE_FAILED":
      console.log(
        `${getTime()} | ${type} | ${traceId} | ${method} ${url} | ${responseCode} | ${response}`
          .bgRed.white
      );
      break;
    case "NODE_COMPLETE":
      console.log(
        `${getTime()} | ${type} | ${traceId} | ${method} ${url} | ${responseCode} | ${headers} | ${response}`
          .bgGreen.white
      );
      break;
    case "API_INITIATED":
      console.log(
        `${getTime()} | ${type} | ${traceId} | ${method} ${servicename} ${url} | ${headers} | ${request}`
          .bgBlue.yellow
      );
      break;
    case "API_FAILED":
      console.log(
        `${getTime()} | ${type} | ${traceId} | ${method} ${servicename} ${url}  | ${responseCode} | ${response}`
          .bgRed.yellow
      );
      break;
    case "API_COMPLETE":
      console.log(
        `${getTime()} | ${type} | ${traceId} | ${method} ${servicename} ${url} | ${responseCode} | ${headers} | ${response}`
          .bgGreen.yellow
      );
      break;
  }

  // if (traceId) {
  //   if(logs[traceId]){
  //     logs[traceId][time]=log;
  //   }
  //   else{
  //     logs[traceId]={
  //       [time]:log
  //     }
  //   }
  // }
}
function registerNodeAction(req) {
  let { uuid, method, url, request , headers } = requestAdapter(req);
  let traceId = uuidV4();
  addEntry(traceId, "NODE_INITIATED", uuid, method, url, headers, request);
  return traceId;
}
function initiateAPIAction(traceId, uuid, method, url, headers, request) {
  addEntry(traceId, "API_INITIATED", uuid, method, url, headers, request);
}
function completeAPIAction(
  traceId,
  uuid,
  method,
  url,
  headers,
  request,
  responseCode,
  response
) {
  addEntry(
    traceId,
    "API_COMPLETE",
    uuid,
    method,
    url,
    headers,
    request,
    responseCode,
    response
  );
}
function errorAPIAction(
  traceId,
  uuid,
  method,
  url,
  headers,
  request,
  errorCode,
  errorMessage
) {
  addEntry(
    traceId,
    "API_FAILED",
    uuid,
    method,
    url,
    headers,
    request,
    errorCode,
    errorMessage
  );
}
function errorNodeAction(traceId, req, errorCode, errorMessage) {
  let { uuid, method, url, request, headers } = requestAdapter(req);
  addEntry(
    traceId,
    "NODE_FAILED",
    uuid,
    method,
    url,
    headers,
    request,
    errorCode,
    errorMessage
  );
}
function completeNodeAction(traceId, req, responseCode, response) {
  let { uuid, method, url, request, headers } = requestAdapter(req);
  addEntry(
    traceId,
    "NODE_COMPLETE",
    uuid,
    method,
    url,
    headers,
    request,
    responseCode,
    response
  );
}

function syncLogs() {
  if (Object.keys(logs).length === 0) {
    return;
  }
  let existingLogs = {};
  try {
    existingLogs = JSON.parse(fs.readFileSync(currentFileName));
  } catch (e) {}
  var stream = fs.createWriteStream(currentFileName);
  Object.keys(logs).forEach(traceId => {
    if (Object.keys(existingLogs).includes(traceId)) {
      existingLogs[traceId] = Object.assign(
        {},
        existingLogs[traceId],
        logs[traceId]
      );
    } else {
      existingLogs[traceId] = logs[traceId];
    }
  });
  stream.once("open", function(fd) {
    stream.write(JSON.stringify(existingLogs));
    stream.end();
    console.log("Wrote Hera Logs.");
    logs = {};
  });
}

// setInterval(() => {
//   syncLogs();
// }, timeInterval);

module.exports = {
  registerNodeAction,
  initiateAPIAction,
  completeAPIAction,
  errorAPIAction,
  errorNodeAction,
  completeNodeAction
};
