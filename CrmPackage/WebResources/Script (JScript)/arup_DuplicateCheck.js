///<reference path="../Intellisense/Xrm.Page.2013.js"/>
///<reference path="../Library/SDK.REST.js"/>

//Call this function on change of source field eg: name in organisation and also on dependent fields.
// Cannot find Function call - Updated 07/04/2020 
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
var globalFormContext;

function QuickDupeDetect(executionContext) {
    var formContext = executionContext.getFormContext();
    globalFormContext = executionContext.getFormContext();
    //Make sure Global variables are in their intial values.
    accName = "";
    inputCtryID = "";
    inputCity = "";
    entName = "";
    firN = "";
    LasN = "";
    inputBusinessID = "null";

    //Get entity name of the script:
    entName = formContext.data.entity.getEntityName();

    //Get the form type by checking the client field in present on the form, QC does not contain it.

    leadFormType = formContext.data.entity.getId() == "" ? "QC" : "Main";

    //Start Dupe logic

    var recordName = null;
    var firstName = null;
    var lastName = null;
    var ccrm_arupbusiness = null;
    var ccrm_countryid = null;
    if (entName == "account") {
        recordName = formContext.getAttribute("name").getValue();
        ccrm_countryid = formContext.getAttribute("ccrm_countryid").getValue();

        if (ccrm_countryid == null) return;
    }
    if (entName == "contact") {
        firstName = formContext.getAttribute("firstname").getValue();
        lastName = formContext.getAttribute("lastname").getValue();
        ccrm_countryid = formContext.getAttribute("ccrm_countryid").getValue();

        if (ccrm_countryid == null) return;
        if (firstName != null && lastName != null) {
            recordName = firstName + " " + lastName;
        }
    }
    if (entName == "lead") {
        recordName = formContext.getAttribute("firstname").getValue();
        ccrm_arupbusiness = formContext.getAttribute("ccrm_arupbusiness").getValue();
        if (ccrm_arupbusiness == null || ccrm_arupbusiness == "") return;
    }
  
    if (recordName != null) {
        //Display waiting
        dispLoadOnQC(formContext);
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
    var ctry = (entName == "account" || entName == "contact") ? formContext.getAttribute("ccrm_countryid").getValue()
        : ((entName == "lead" && leadFormType == "QC") ? formContext.getAttribute("ccrm_projectcurrency").getValue()
            : formContext.getAttribute("ccrm_country").getValue());
    if (ctry != null) {
        ctryId = ctry[0].id;
        ipCity = (entName == "account" || entName == "contact") ? formContext.getAttribute("address1_city").getValue()
            : formContext.getAttribute("ccrm_location").getValue();
        if (ipCity == null) {
            ipCity = "null";
        }
    }
    //set the global variables with calculated values..
    inputCtryID = ctryId;
    inputCity = ipCity;

    //Set the business ID 
    var buss = (entName == "lead") ? formContext.getAttribute("ccrm_arupbusiness").getValue() : "null";
    if (buss != null && buss != "null") {
        bussId = buss[0].id;
    }

    //set the client id
    var clie = (entName == "lead" && leadFormType != "QC") ? formContext.getAttribute("ccrm_client").getValue() : "null";
    if (clie != null && clie != "null") {
        clientId = clie[0].id;
    }

    //set the record ID
    recordId = (entName == "lead" && leadFormType != "QC") ? formContext.data.entity.getId() : "null";
    ipRecordId = recordId;

    if (recordName != null && entName == "account") {
        accName = recordName;
        callAction("arup_DupeDetect", recordName, firstName, lastName, recordId, ctryId, ipCity, bussId, "Quick", formContext);
    }
    else { accName = "null" };
    if (recordName != null && entName == "contact") {
        firN = firstName;
        LasN = lastName;
        callAction("arup_DupeDetectContact", recordName, firstName, lastName, recordId, ctryId, ipCity, bussId, "Quick", formContext);
    }
    if (recordName != null && entName == "lead") {
        accName = recordName;
        inputBusinessID = bussId;
        callAction("arup_DupeDetectLead", recordName, firstName, lastName, recordId, ctryId, ipCity, bussId, "Quick", formContext);
    }
}


function callAction(actName, recordName, FN, LN, recordId, countryId, cityIP, IPbussID, formtype, formContext) {
    var actionName = actName;//"arup_DupeDetect";
    recordName = (recordName == "" || recordName == null) ? recordName : htmlSpecialChars(recordName);

    FN = FN == null ? FN : htmlSpecialChars(FN);
    LN = LN == null ? LN : htmlSpecialChars(LN);

    if (actionName == "arup_DupeDetect") {
        var parameters = {};
        parameters.InputCity = cityIP;
        parameters.InputCountryId = countryId;
        parameters.InputGUID = recordId;
        parameters.InputName = recordName;

        var req = new XMLHttpRequest();
        req.open("POST", formContext.context.getClientUrl() + "/api/data/v9.1/arup_DupeDetect622be8c63365ea11a813000d3a86ab8d", true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    if (formtype == "Main") {
                        parseMainSuccessActionResponse(results);
                    }
                    else if (formtype == "Quick") {
                        parseQuickSuccessActionResponse(results);
                    }
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send(JSON.stringify(parameters));
    }
    else if (actionName == "arup_DupeDetectContact") {
        var parameters = {};
        parameters.InputCity = cityIP;
        parameters.InputCountryId = countryId;
        parameters.InputGUID = recordId;
        parameters.InputFN = FN;
        parameters.InputLN = LN;

        var req = new XMLHttpRequest();
        req.open("POST", formContext.context.getClientUrl() + "/api/data/v9.1/arup_DupeDetectContact", true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    if (formtype == "Main") {
                        parseMainSuccessActionResponse(results);
                    }
                    else if (formtype == "Quick") {
                        parseQuickSuccessActionResponse(results);
                    }
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send(JSON.stringify(parameters));
    }
    else if (actionName == "arup_DupeDetectLead") {
        var parameters = {};
        parameters.InputClientID = clientId;
        parameters.InputCity = cityIP;
        parameters.InputName = recordName;
        parameters.InputCountryId = countryId;
        parameters.InputGUID = recordId;
        parameters.InputBussID = IPbussID;

        var req = new XMLHttpRequest();
        req.open("POST", formContext.context.getClientUrl() + "/api/data/v9.1/arup_DupeDetectLead", true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    if (formtype == "Main") {
                        parseMainSuccessActionResponse(results);
                    }
                    else if (formtype == "Quick") {
                        parseQuickSuccessActionResponse(results);
                    }
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send(JSON.stringify(parameters));
    }
}


function parseMainSuccessActionResponse(results) {
    var jsMsg = ProcessSuccess(results);
    if (jsMsg != "No Duplicates") {
        // SAVE THIS VALUE IN A NEW FIELD ON ACCOUNT ENTITY
        globalFormContext.getAttribute("arup_dupecheckresult").setValue(jsMsg);
        //Call the function dupeChkResOnChange to refresh the web resource
        globalFormContext.getAttribute("arup_dupecheckresult").fireOnChange();
        // var _pp = JSON.parse(JSONMessage);
    }
    else {
        globalFormContext.getAttribute("arup_dupecheckresult").setValue(null);
        globalFormContext.getAttribute("arup_dupecheckresult").fireOnChange();
    }
}

function parseQuickSuccessActionResponse(results) {
    var jsMsg2 = ProcessSuccess(results);
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
        SetValidField(fieldName1, jsMsg2, msg, "dupes", NoOfDupes, globalFormContext);
        // Xrm.Page.ui.setFormNotification("Number of potential similar records found = " + list.length, "INFO", "dupeTest");
    }
    else {
        SetValidField(fieldName1, null, msg, "dupes", 0, globalFormContext);
    }
}

function ProcessSuccess(results) {
    var JSONMessage = "No Duplicates";
    if (results != null) {
        try {
            dupesFound = results.DupesFound;/*Output Param set in Custom Activity*/

            if (dupesFound) {
                if (results.OutJSONMsg != null)/*Output Param set in Custom Activity*/ {
                    JSONMessage = results.OutJSONMsg.toString();
                    JSONMessage = JSONMessage.replace(/\\/g, "");
                }
            }
        }
        catch (e) {
            alert("Error whilst processing the response :" + e.message.toString());
        }
    }
    return JSONMessage;
}

function dispLoadOnQC(formContext) {
    var msg = "Searching for similar records...";
    var fielName = "arup_dupecheckresult";
    SetValidField(fielName, null, msg, "wait", 0, formContext);
}

function SetValidField(fieldName, val, warningMsg, warMsgName, lenght, formContext) {
    formContext.getAttribute(fieldName).setValue(val);
    formContext.getAttribute(fieldName).setSubmitMode('always');
    var crmURL = getClientUrl(formContext);
    if (warningMsg != null && warMsgName == "dupes") {
        if (entName != "lead" && leadFormType == "QC") {
            formContext.ui.setFormNotification(warningMsg, 'INFO', warMsgName);
        }

        if (lenght <= 0) {
            Notify.add(warningMsg, "INFO", warMsgName + "n", null, 5);
        }
        else {
            if (entName == "account") {
                var n = accName.indexOf("&");
                if (n != -1) {
                    accName = accName.replace("&", "ampAndArup");
                }
                var n3 = accName.indexOf("'");
                if (n3 != -1) {
                    accName = accName.replace("'", "aposArup");
                }
                var dataparams = "Name=" + accName + "&ContryId=" + inputCtryID + "&ipCity=" + inputCity + "&entLogicName=" + entName + "&warningMsg=" + warningMsg;
                Alert.showWebResource("arup_DupeCheckHtmlWithQC.htm?Data=" + encodeURIComponent(dataparams), 510, 520, "Potential Duplicates", null, crmURL, false, 20);
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
                var dataparams = "FirstName=" + firN + "&LastName=" + LasN + "&ContryId=" + inputCtryID + "&ipCity=" + inputCity + "&entLogicName=" + entName + "&warningMsg=" + warningMsg;
                Alert.showWebResource("arup_DupeCheckHtmlWithQC.htm?Data=" + encodeURIComponent(dataparams), 510, 520, "Potential Duplicates", null, crmURL, false, 20);
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
                var dataparams = "Name=" + accName + "&ContryId=" + inputCtryID + "&ipCity=" + inputCity + "&entLogicName=" + entName + "&recordId=" + ipRecordId + "&bussID=" + inputBusinessID + "&cliID=" + clientId + "&warningMsg=" + warningMsg;
                Alert.showWebResource("arup_DupeCheckHtmlWithQC.htm?Data=" + encodeURIComponent(dataparams), 510, 520, "Potential Duplicates", null, crmURL, false, 20);
            }
            Notify.remove("dupesn");
        }

        Notify.remove("wait");
        formContext.ui.clearFormNotification("wait");
    }
    else {
        if (warningMsg != null && warMsgName == "wait") {
            formContext.ui.setFormNotification(warningMsg, 'INFO', warMsgName);
            Notify.add(warningMsg, "LOADING", warMsgName);
            Notify.remove("dupes");
            Notify.remove("dupesn");
        }
        else
            formContext.ui.clearFormNotification(warMsgName);
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
function getClientUrl(formContext) {
    var strUrl = formContext.context.getClientUrl();
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