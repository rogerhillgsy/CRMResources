
function myBrowserName()
{
 return navigator.appName;
}

function myIEVersion()
{
 var strBuffer = navigator.appVersion;
 var IECodeName = "MSIE";
 var Separator = ";";
 var IECodeNameLocation = strBuffer.indexOf(IECodeName);
 
 strBuffer = strBuffer.substr(IECodeNameLocation + 5, strBuffer.length - IECodeNameLocation)

 var SeparatorLocation = strBuffer.indexOf(Separator);
 var StringVersion = strBuffer.substr(0,SeparatorLocation);
 return parseFloat(StringVersion);
}