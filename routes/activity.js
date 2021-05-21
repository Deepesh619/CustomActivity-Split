'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var util = require('util');
var http = require('https');
var querystring = require('querystring');
const { Console } = require('console');
exports.logExecuteData = [];

// Variables Decleration
var authHost = process.env.authHost;
var authEndpoint = '/v2/token';
var authData = {
  "grant_type": "client_credentials",
  "client_id": process.env.clientId,
  "client_secret":process.env.clientSecret
};
var authHeaders = {
  'Content-Type': 'application/json'
};
var MCHost = process.env.mcHost;

var postMethod="POST";
var getMethod="GET";

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + req.headers);
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    res.send(200, 'Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */

exports.execute = function (req, res) {

  var rowData=[];
  var accesstoken=null;
  var destCompCol="";
  var destCompVal=null;
  var MCEndpoint = '';
    // JSON Web Token is used to read the request from Journey Builder
      JWT(req.body, process.env.jwtSecret, (err, decoded) => {

        // verification error -> unauthorized request
        if (err) {
            console.error(err);
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
          console.log('Decoded Data :'+ JSON.stringify(decoded));
            // decoded in arguments
            destCompCol = decoded.inArguments[0].destCompCol;
            destCompVal = decoded.inArguments[0].destCompVal;
            destCompCol = destCompCol.toLowerCase();
            MCEndpoint = '/data/v1/customobjectdata/key/'+ decoded.inArguments[0].destDEName +'/rowset?$filter=\"'+decoded.inArguments[0].destMappedCol+'\"%20eq%20\"'+decoded.inArguments[0].srcColumnValue+'\"';
            console.log('MC EndPoint :'+ MCEndpoint);
            rowData = '';        
        } else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }
    }); 
    
    
    // Calling performPostRequest to fetch the access token
     performRequest(authEndpoint,authHost,authHeaders, postMethod, authData, function(data) {
        accesstoken = data.access_token;
        console.log('Access Token : ' + accesstoken);
        // After getting access token, calling fetchRecordsfromDE to fetch the records
      fetchRecordsfromDE(rowData,accesstoken,MCEndpoint,function(responseFromDE){
        var rowcount = responseFromDE.count;
        if(rowcount !=0){
          if(responseFromDE.items[0].values[destCompCol] == destCompVal){
            return res.status(200).json({branchResult: 'scheduled'});
          }else{
            return res.status(200).json({branchResult: 'not_scheduled'});
          }
      }
      else{
        return res.status(200).json({branchResult: 'not_scheduled'});
      }
      });
      });
};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    res.send(200, 'Publish');
    console.log('Published');
};

/*
 * POST Handler for /validate/ route of Activity.
 */

exports.validate = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    
    res.send(200, 'Validate');
};

/*
 * Below function is used to perform the rest call.
 */

function  performRequest(endpoint,host,headers, method, data, success) {
  var dataString = JSON.stringify(data);
  
  var options = {
    host: host,
    path: endpoint,
    method: method,
    headers: headers
  };
  console.log('Options are  : ' + options);
  var req = http.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
     var responseObject =  JSON.parse(responseString);
      success(responseObject);
    });
  });
  req.write(dataString);
  req.end();
}

/*
 * Below function is used to fetch records from DE.
 */

function fetchRecordsfromDE(rowData,accesstoken,MCRecordEndpoint,responseFromDE){
  var MCHeaders = {
    'Content-Type': 'application/json',
    'Authorization' : 'Bearer ' + accesstoken
  };  
  performRequest(MCRecordEndpoint,MCHost,MCHeaders, getMethod, rowData, function(data) {
    console.log('DATA IS : ' + data);
    responseFromDE(data);    
  });
}
