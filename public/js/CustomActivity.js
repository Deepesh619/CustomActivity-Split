var connection = new Postmonger.Session();
var eventDefinitionKey;
var payload={};
connection.trigger('ready');
connection.on('initActivity',function(data){
    console.log(data);
    if (data) {
        payload = data;
    }
    document.getElementById('srcColumnName').value= payload['arguments'].execute.inArguments[0].srcColumnName;
    document.getElementById('destDEName').value= payload['arguments'].execute.inArguments[0].destDEName;
    document.getElementById('destMappedCol').value= payload['arguments'].execute.inArguments[0].destMappedCol;
    document.getElementById('destCompCol').value= payload['arguments'].execute.inArguments[0].destCompCol;
    document.getElementById('destCompVal').value= payload['arguments'].execute.inArguments[0].destCompVal;
    
 }); 


 // Below event is executed any and is used to get the event definition key

connection.trigger('requestTriggerEventDefinition');
connection.on('requestedTriggerEventDefinition',
function(eventDefinitionModel) {
   if(eventDefinitionModel){
     eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
   }
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
   payload['key'] = 'REST-1';
   payload['type'] = 'REST';
   connection.trigger('updateActivity', payload);
}