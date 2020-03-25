///<reference path="../Intellisense/Xrm.Page.2013.js"/>
///<reference path="../Library/SDK.REST.js"/>
//Call this function on change of source field eg: name in organisation and also on dependent fields.
function DupeDetect(name) {
    dupeChkResOnChange("wait");
    var recordName = Xrm.Page.getAttribute(name).getValue();
    var recordId = "null";
    if (Xrm.Page.ui.getFormType() == 2) { recordId = Xrm.Page.data.entity.getId(); }
    //var accountName = "TESTER";

    if (recordName != null) {
        callAction(recordName, recordId, "Main");
    }
    else {
        dupeChkResOnChange("onChange");
    }
}
var accName = "";
var inputCtryID = "";
var inputCity = "";
var entName = ""
var firN = "";
var LasN = "";
var inputBusinessID = "null";
var ipRecordId = "null";
var leadFormType = "QC";
var clientId = "null";

function QuickDupeDetect() {
    //Make sure Global variables are in their intial values.
    accName = "";
    inputCtryID = "";
    inputCity = "";
    entName = "";
    firN = "";
    LasN = "";
    inputBusinessID = "null";

    //Get entity name of the script:
    entName = Xrm.Page.data.entity.getEntityName();

    //Get the form type by checking the client field in present on the form, QC does not contain it.

    leadFormType = Xrm.Page.data.entity.getId() == "" ? "QC" : "Main";

    //Start Dupe logic

    var recordName = null;
    var firstName = null;
    var lastName = null;

    if (entName == "account") { recordName = Xrm.Page.getAttribute("name").getValue(); }
    if (entName == "contact") {
        firstName = Xrm.Page.getAttribute("firstname").getValue();
        lastName = Xrm.Page.getAttribute("lastname").getValue();
        if (firstName != null && lastName != null) {
            recordName = firstName + " " + lastName;
        }
    }
    if (entName == "lead") {
        recordName = Xrm.Page.getAttribute("firstname").getValue();
    }
    if (recordName != null) {
        //Display waiting
        dispLoadOnQC();
    }
    else {
        Notify.remove("dupesn");
        Notify.remove("dupes");
        Notify.remove("wait");
    }

    var recordId = "null";
    var ctryId = "null";
    var ipCity = "null";
    var bussId = "null";
    var ctry = (entName == "account" || entName == "contact") ? Xrm.Page.getAttribute("ccrm_countryid").getValue()
        : ((entName == "lead" && leadFormType == "QC") ? Xrm.Page.getAttribute("ccrm_projectcurrency").getValue()
            : Xrm.Page.getAttribute("ccrm_country").getValue());
    if (ctry != null) {
        ctryId = ctry[0].id;
        ipCity = (entName == "account" || entName == "contact") ? Xrm.Page.getAttribute("address1_city").getValue()
            : Xrm.Page.getAttribute("ccrm_location").getValue();
        if (ipCity == null) {
            ipCity = "null";
        }
    }
    //set the global variables with calculated values..
    inputCtryID = ctryId;
    inputCity = ipCity;

    //Set the business ID 
    var buss = (entName == "lead") ? Xrm.Page.getAttribute("ccrm_arupbusiness").getValue() : "null";
    if (buss != null && buss != "null") {
        bussId = buss[0].id;
    }

    //set the client id
    var clie = (entName == "lead" && leadFormType != "QC") ? Xrm.Page.getAttribute("ccrm_client").getValue() : "null";
    if (clie != null && clie != "null") {
        clientId = clie[0].id;
    }

    //set the record ID
    recordId = (entName == "lead" && leadFormType != "QC") ? Xrm.Page.data.entity.getId() : "null";
    ipRecordId = recordId;

    if (recordName != null && entName == "account") {
        accName = recordName;
        callAction("arup_DupeDetect", recordName, firstName, lastName, recordId, ctryId, ipCity, bussId, "Quick");
    }
    else { accName = "null" };
    if (recordName != null && entName == "contact") {
        firN = firstName;
        LasN = lastName;
        callAction("arup_DupeDetectContact", recordName, firstName, lastName, recordId, ctryId, ipCity, bussId, "Quick");
    }
    if (recordName != null && entName == "lead") {
        accName = recordName;
        inputBusinessID = bussId;
        callAction("arup_DupeDetectLead", recordName, firstName, lastName, recordId, ctryId, ipCity, bussId, "Quick");
    }
}


function callAction(actName, recordName, FN, LN, recordId, countryId, cityIP, IPbussID, formtype) {
    var actionName = actName;//"arup_DupeDetect";
    recordName = (recordName == "" || recordName == null) ? recordName : htmlSpecialChars(recordName);

    FN = FN == null ? FN : htmlSpecialChars(FN);
    LN = LN == null ? LN : htmlSpecialChars(LN);

    var requestXML = ""
    if (actionName == "arup_DupeDetect") {
        requestXML += "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">";
        requestXML += "  <s:Body>";
        requestXML += "    <Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">";
        requestXML += "      <request xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">";
        requestXML += "        <a:Parameters xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputName</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + recordName + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputGUID</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + recordId + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputCountryId</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + countryId + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputCity</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + cityIP + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "        </a:Parameters>";
        requestXML += "        <a:RequestId i:nil=\"true\" />";
        requestXML += "        <a:RequestName>" + actionName + "</a:RequestName>";
        requestXML += "      </request>";
        requestXML += "    </Execute>";
        requestXML += "  </s:Body>";
        requestXML += "</s:Envelope>";
    }
    else if (actionName == "arup_DupeDetectContact") {
        requestXML += "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">";
        requestXML += "  <s:Body>";
        requestXML += "    <Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">";
        requestXML += "      <request xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">";
        requestXML += "        <a:Parameters xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputFN</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + FN + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputLN</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + LN + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputGUID</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + recordId + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputCountryId</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + countryId + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputCity</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + cityIP + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "        </a:Parameters>";
        requestXML += "        <a:RequestId i:nil=\"true\" />";
        requestXML += "        <a:RequestName>" + actionName + "</a:RequestName>";
        requestXML += "      </request>";
        requestXML += "    </Execute>";
        requestXML += "  </s:Body>";
        requestXML += "</s:Envelope>";
    }
    else if (actionName == "arup_DupeDetectLead") {
        requestXML += "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">";
        requestXML += "  <s:Body>";
        requestXML += "    <Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">";
        requestXML += "      <request xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">";
        requestXML += "        <a:Parameters xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputCity</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + cityIP + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputName</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + recordName + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputCountryId</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + countryId + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputGUID</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + recordId + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputClientID</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + clientId + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "          <a:KeyValuePairOfstringanyType>";
        requestXML += "            <b:key>InputBussID</b:key>";
        requestXML += "            <b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + IPbussID + "</b:value>";
        requestXML += "          </a:KeyValuePairOfstringanyType>";
        requestXML += "        </a:Parameters>";
        requestXML += "        <a:RequestId i:nil=\"true\" />";
        requestXML += "        <a:RequestName>" + actionName + "</a:RequestName>";
        requestXML += "      </request>";
        requestXML += "    </Execute>";
        requestXML += "  </s:Body>";
        requestXML += "</s:Envelope>";
    }

    var url = getClientUrl();
    if (url.substring(url.length - 1) != "/") {
        url = url + "/";
    }
    url = url + "XRMServices/2011/Organization.svc/web";
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader("Accept", "application/xml, text/xml, */*");
    xmlhttp.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
    xmlhttp.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
    xmlhttp.onreadystatechange = function () {

        if (formtype == "Main") {
            parseActionSOAPResponse(xmlhttp, successResponse, errorResponse);
        }
        else {
            if (formtype == "Quick") {
                parseActionSOAPResponse(xmlhttp, successQuickResponse, errorResponse);
            }
            else { if (formtype == "QuickButton") { parseActionSOAPResponse(xmlhttp, successQuickButtonResp, errorResponse); } }
        }

    };
    xmlhttp.send(requestXML);
}

function parseActionSOAPResponse(req, successCallback, errorCallback) {
    if (req.readyState == 4) {
        req.onreadystatechange = null;
        if (req.status == 200) {
            successCallback(req.responseXML);
        }
        else {
            errorCallback(req.responseXML);
        }
    }
}

function successResponse(responseXml) {
    var jsMsg = ProcessSuccess(responseXml);
    if (jsMsg != "No Duplicates") {
        // SAVE THIS VALUE IN A NEW FIELD ON ACCOUNT ENTITY
        Xrm.Page.getAttribute("arup_dupecheckresult").setValue(jsMsg);
        //Call the function dupeChkResOnChange to refresh the web resource
        Xrm.Page.getAttribute("arup_dupecheckresult").fireOnChange();
        // var _pp = JSON.parse(JSONMessage);
    }
    else {
        Xrm.Page.getAttribute("arup_dupecheckresult").setValue(null);
        Xrm.Page.getAttribute("arup_dupecheckresult").fireOnChange();
    }
}

function successQuickResponse(responseXml) {
    var jsMsg2 = ProcessSuccess(responseXml);
    var msg = "No potential similar records found for the entered name.";
    var fieldName1 = "arup_dupecheckresult";

    if (jsMsg2 != "No Duplicates") {
        var list = JSON.parse(jsMsg2);
        var NoOfDupes = list.length;
        // alert("Number of dupes = " + list.length);
        if (NoOfDupes <= 0) {
            msg = msg;
        }
        else {
            if (entName == "account" || entName == "contact") {
                msg = ("We found " + NoOfDupes + " potential similar records. Please fill in or change City and Country fields to refine the search.").toString();
            }
            else if (entName == "lead" && leadFormType == "QC") {
                msg = ("We found " + NoOfDupes + " potential similar records. Please fill in or change Project Currency field to refine or rerun the search.").toString();
            }
            else if (entName == "lead" && leadFormType != "QC") {
                msg = ("We found " + NoOfDupes + " potential similar records. Please fill in or change Client, Project Country, Project City, Arup Business fields to refine or rerun the search.").toString();
            }
        }
        SetValidField(fieldName1, jsMsg2, msg, "dupes", NoOfDupes);
        // Xrm.Page.ui.setFormNotification("Number of potential similar records found = " + list.length, "INFO", "dupeTest");
    }
    else {
        SetValidField(fieldName1, null, msg, "dupes", 0);
    }
}

function successQuickButtonResp(responseXml) {
    //var jsMsg3 = ProcessSuccess(responseXml);
    //jsMsg3 = jsonMsgToRet;
}

function ProcessSuccess(responseXml) {
    var dupesFound = "false";
    var JSONMessage = "No Duplicates";
    if (responseXml != null) {
        try {
            var x = responseXml.getElementsByTagName("a:KeyValuePairOfstringanyType");
            if (x.length == 0) {
                x = responseXml.getElementsByTagName("KeyValuePairOfstringanyType");
            }
            for (var i = 0; i < x.length; i++) {
                if (x[i].childNodes[0].textContent == "DupesFound")/*Output Param set in Custom Activity*/ {
                    dupesFound = x[i].childNodes[1].textContent;
                    // alert(dupesFound);
                }

            }
            if (dupesFound == "true") {
                for (var i = 0; i < x.length; i++) {
                    if (x[i].childNodes[0].textContent == "OutJSONMsg")/*Output Param set in Custom Activity*/ {
                        JSONMessage = x[i].childNodes[1].textContent.toString();
                        JSONMessage = JSONMessage.replace(/\\/g, "");
                    }
                }
            }
        }
        catch (e) {
            alert("Error whilst processing the response :" + e.message.toString());
        }
    }
    return JSONMessage;
}

function dispLoadOnQC() {
    var msg = "Searching for similar records...";
    var fielName = "arup_dupecheckresult";
    SetValidField(fielName, null, msg, "wait", 0);
}

function SetValidField(fieldName, val, warningMsg, warMsgName, lenght) {
    Xrm.Page.getAttribute(fieldName).setValue(val);
    Xrm.Page.getAttribute(fieldName).setSubmitMode('always');
    var crmURL = getClientUrl();
    if (warningMsg != null && warMsgName == "dupes") {
        if (entName != "lead" && leadFormType == "QC") {
            Xrm.Page.ui.setFormNotification(warningMsg, 'INFO', warMsgName);
        }
        if (lenght <= 0) {
            Notify.add(warningMsg, "INFO", warMsgName + "n", null, 5);
        }
        else {
            Notify.add(warningMsg, "QUESTION", warMsgName,
                [{
                    type: "button",
                    text: "View Similar Records",
                    callback: function () {
                        if (entName == "account") {
                            var n = accName.indexOf("&");
                            if (n != -1) {
                                accName = accName.replace("&", "ampAndArup");
                            }
                            var n3 = accName.indexOf("'");
                            if (n3 != -1) {
                                accName = accName.replace("'", "aposArup");
                            }
                            var dataparams = "Name=" + accName + "&ContryId=" + inputCtryID + "&ipCity=" + inputCity + "&entLogicName=" + entName;
                            Alert.showWebResource("arup_DupeCheckHtmlWithQC.htm?Data=" + encodeURIComponent(dataparams), 510, 520, "Similar Records", null, crmURL, false, 20);
                        }
                        else if (entName == "contact") {
                            var n1 = firN.indexOf("&");
                            if (n1 != -1) {
                                firN = firN.replace("&", "ampAndArup");
                            }
                            var n4 = firN.indexOf("'");
                            if (n4 != -1) {
                                firN = firN.replace("'", "aposArup");
                            }
                            var n2 = LasN.indexOf("&");
                            if (n2 != -1) {
                                LasN = LasN.replace("&", "ampAndArup");
                            }
                            var n5 = LasN.indexOf("'");
                            if (n5 != -1) {
                                LasN = LasN.replace("'", "aposArup");
                            }
                            var dataparams = "FirstName=" + firN + "&LastName=" + LasN + "&ContryId=" + inputCtryID + "&ipCity=" + inputCity + "&entLogicName=" + entName;
                            Alert.showWebResource("arup_DupeCheckHtmlWithQC.htm?Data=" + encodeURIComponent(dataparams), 510, 520, "Similar Records", null, crmURL, false, 20);
                        }
                        else if (entName == "lead") {
                            var n6 = accName.indexOf("&");
                            if (n6 != -1) {
                                accName = accName.replace("&", "ampAndArup");
                            }
                            var n7 = accName.indexOf("'");
                            if (n7 != -1) {
                                accName = accName.replace("'", "aposArup");
                            }
                            var dataparams = "Name=" + accName + "&ContryId=" + inputCtryID + "&ipCity=" + inputCity + "&entLogicName=" + entName + "&recordId=" + ipRecordId + "&bussID=" + inputBusinessID + "&cliID=" + clientId;
                            Alert.showWebResource("arup_DupeCheckHtmlWithQC.htm?Data=" + encodeURIComponent(dataparams), 510, 520, "Similar Records", null, crmURL, false, 20);
                        }
                    }
                },
                {
                    type: "link",
                    text: "Not now",
                    callback: function () {
                        Notify.remove("dupes");
                    }
                }]);
            Notify.remove("dupesn");
            //if(leadFormType != "QC")
            //  {
            //  Xrm.Page.ui.clearFormNotification("dupes");

            //  }
        }

        Notify.remove("wait");
        Xrm.Page.ui.clearFormNotification("wait");
    }
    else {
        if (warningMsg != null && warMsgName == "wait") {
            Xrm.Page.ui.setFormNotification(warningMsg, 'INFO', warMsgName);
            Notify.add(warningMsg, "LOADING", warMsgName);
            Notify.remove("dupes");
            Notify.remove("dupesn");
        }
        else
            Xrm.Page.ui.clearFormNotification(warMsgName);
    }
}


//In case of error
function errorResponse(responseXml) {
    if (responseXml != null &&
        responseXml.firstChild != null && responseXml.firstChild.firstChild != null) {
        try {
            var bodyNode = responseXml.firstChild.firstChild;

            for (var i = 0; i < bodyNode.childNodes.length; i++) {
                var node = bodyNode.childNodes[i];
                if ("s:Fault" == node.nodeName) {
                    for (var j = 0; j < node.childNodes.length; j++) {
                        var faultStringNode = node.childNodes[j];
                        if ("faultstring" == faultStringNode.nodeName) {
                            alert("Error: " + faultStringNode.textContent);
                            break;
                        }
                    }
                    break;
                }
            }

        } catch (e) {
            alert("Error while Dupe Check");
        };
    } else {
        alert("Error while Dupe Check");
    }
}

// Return CRM path
function getClientUrl() {
    var strUrl = Xrm.Page.context.getClientUrl();
    if (strUrl.substr(strUrl.length - 1) != "/") {
        strUrl += "/";
    }
    return strUrl;
}

//Call and register on change of the dupeChkResult field containing the JSON.
function dupeChkResOnChange(dataParam) {
    //Refresh the HTML webresource
    var wrControl = Xrm.Page.ui.controls.get("WebResource_DuplicateCheckResult");
    var srcUrl = wrControl.getSrc();
    var changeSrcURl = srcUrl;
    var indData = srcUrl.indexOf("data");
    if (indData != -1 && (dataParam != "" || dataParam != "undefined")) {
        changeSrcURl = srcUrl.substring(0, indData) + "data=" + encodeURI(dataParam);
    }
    else if (indData != -1 && (dataParam == "" || dataParam == "undefined")) {
        changeSrcURl = srcUrl.substring(0, indData);
    }
    wrControl.setSrc(changeSrcURl);
}

function htmlSpecialChars(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}