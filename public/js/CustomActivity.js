var connection = new Postmonger.Session();
var eventDefinitionKey;
var payload={};

connection.trigger('ready');

 // Below event is executed any time and is used to get the event definition key
connection.trigger('requestTriggerEventDefinition');
connection.on('requestedTriggerEventDefinition',
function(eventDefinitionModel) {
   if(eventDefinitionModel){
    console.log('eventDefinitionModel : '+ JSON.stringify(eventDefinitionModel));
     eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
     getEntrySourceColumnList(eventDefinitionModel.dataExtensionId);
   }
});

connection.on('initActivity',function(data){
    console.log(data);
    if (data) {
        payload = data;
    }
    document.getElementById('srcColumnName').value= payload['arguments'].execute.inArguments[0].srcColumnName;
    document.getElementById('destMappedCol').value= payload['arguments'].execute.inArguments[0].destMappedCol;
    document.getElementById('destCompCol').value= payload['arguments'].execute.inArguments[0].destCompCol;
    document.getElementById('destCompVal').value= payload['arguments'].execute.inArguments[0].destCompVal;
    getDEList();    
 }); 
// Below event is executed when Done is clicked on UI

connection.on('clickedNext',save);

// save function is used to save the content from the UI

function save () {
    var inArguments = {};
    var sourceColumnName = document.getElementById('srcColumnName').value;
    inArguments["srcColumnName"]=sourceColumnName;
    inArguments["srcColumnValue"]="{{Event."+ eventDefinitionKey +".\""+sourceColumnName+"\"}}";
    inArguments["destDEName"]=document.getElementById('destDEName').value;
    inArguments["destMappedCol"]=document.getElementById('destMappedCol').value;
    inArguments["destCompCol"]=document.getElementById('destCompCol').value;
    inArguments["destCompVal"]=document.getElementById('destCompVal').value;
    console.log("Built inArguments are ::: " + JSON.stringify(inArguments))
   payload['arguments'].execute.inArguments = [inArguments];  
   payload['arguments'].execute.useJwt = true;
   payload['configurationArguments'].save.useJwt = true;
   payload['metaData'].isConfigured = true;
   connection.trigger('updateActivity', payload);
}

function getDEList(){
  var http = new XMLHttpRequest();
  var url = 'https://mcservicecall-prod.herokuapp.com/MCService/getDEList/';
  var data = new FormData();
  http.open('GET', url);
  http.onreadystatechange = function() {//Call a function when the state changes.
      if(http.readyState == 4 && http.status == 200) {
          var obj = {};
          obj = JSON.parse(this.responseText);
          var select = document.getElementById("destDEName");
          for(var index in obj) {
          select.options[select.options.length] = new Option(obj[index], index);// new Option(text-DEName, value-CustomerKey)
          }
          document.getElementById('destDEName').value= payload['arguments'].execute.inArguments[0].destDEName;
          if(document.getElementById('destDEName').selectedIndex >= 0){
          getColumnList(document.getElementById('destDEName'));}
      }
  }
  http.send(data); 
}

function getColumnList(option){
  var http = new XMLHttpRequest();
  var ID = option.value;
  var url = 'https://mcservicecall-prod.herokuapp.com/MCService/getColumnList?ID='+ID+ '&DEName=true';
  var data = new FormData();
  http.open('GET', url);
  http.onreadystatechange = function() {//Call a function when the state changes.
      if(http.readyState == 4 && http.status == 200) {
          var obj = {};
          obj = JSON.parse(this.responseText);
          console.log(obj);
          var select = document.getElementById("destMappedCol");
          select.innerHTML = "";
          for(var index in obj) {
          select.options[select.options.length] = new Option(obj[index], obj[index]);
          }
          document.getElementById('destMappedCol').value= payload['arguments'].execute.inArguments[0].destMappedCol;
          document.getElementById('destCompCol').innerHTML= select.innerHTML;
          document.getElementById('destCompCol').value= payload['arguments'].execute.inArguments[0].destCompCol;
      }
  }
  http.send(data); 
}

function getEntrySourceColumnList(objectID){
  var http = new XMLHttpRequest();
  var ID = objectID;
  var url = 'https://mcservicecall-prod.herokuapp.com/MCService/getColumnList?ID='+ID + '&DEName=false';
  var data = new FormData();
  http.open('GET', url);
  http.onreadystatechange = function() {//Call a function when the state changes.
      if(http.readyState == 4 && http.status == 200) {
          var obj = {};
          obj = JSON.parse(this.responseText);
          console.log(obj);
          var select = document.getElementById("srcColumnName");
          select.innerHTML = "";
          for(var index in obj) {
          select.options[select.options.length] = new Option(obj[index], obj[index]);
          }
          document.getElementById('srcColumnName').value= payload['arguments'].execute.inArguments[0].srcColumnName;
      }
  }
  http.send(data); 
}
