var newCJN;
var arupInternal;

function Form_onload() {

    var project = Xrm.Page.getAttribute("ccrm_projectid").getValue();
    var rtnJobNumber = Xrm.Page.getAttribute("ccrm_opportunitycjn").getValue();
    var projSuffix = Xrm.Page.getAttribute("ccrm_suffix").getValue();
    arupInternal = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();
    newCJN = Xrm.Page.getAttribute("ccrm_sys_reservejobnumber").getValue();

    //Added suffix check below to prevent recalling of web service when suffix is present
    if (project != null && projSuffix == null) {
        jobNumber = rtnJobNumber;
        jobNumber = jobNumber.substring(0, 6);
        jobNumber = jobNumber + "00";
        callSuffixWebService(jobNumber)
    }

    //function force submit readonly fields
    fnForceSubmit();

    //Not on Form Creation 
    if (Xrm.Page.ui.getFormType() != 1) {

        if (Xrm.Page.getAttribute("ccrm_assignednumber").getValue() == null) {

            //Section hidden until populated with number
            Xrm.Page.ui.tabs.get("job_number_tab").setVisible(Xrm.Page.getAttribute("ccrm_assignednumber").getValue() == null ? false : true);
        }
        //disable fields on form
        disableFieldsOnForm();
    }
    else {

        //if came from Request New CJN button then the default create method should be New Project (new number),
        //if came from Request Suffix button then the default create method should be New Suffix (existing project)
        if (Xrm.Page.getAttribute("ccrm_createmethod").getValue() == null) {

            var defaultCreateMethod;

            // if CJN request has been originated from clicking Request Suffix button on the opportunity form
            if (!newCJN) {

                defaultCreateMethod = 3;
                Xrm.Page.getControl("ccrm_projectsuffixisforintcostmonitoringonly").setDisabled(true);
                //delete new number and extsing prefix
                Xrm.Page.getControl("ccrm_createmethod").removeOption(1);
                Xrm.Page.getControl("ccrm_createmethod").removeOption(2);
                SetNotificationAlert("INFO", "You are creating a suffix for INTERNAL COST MONITORING only. There is no fee income associated with a cost monitoring suffix.", "OppCr");
            }
            else if (newCJN && arupInternal) {
                Xrm.Page.getControl("ccrm_createmethod").removeOption(1);
                Xrm.Page.getControl("ccrm_createmethod").removeOption(2);
                Xrm.Page.getControl("ccrm_createmethod").removeOption(4);
                defaultCreateMethod = 3;
            }
            else defaultCreateMethod = 1;

            Xrm.Page.getAttribute("ccrm_createmethod").setValue(defaultCreateMethod);

            //Section hidden 
            Xrm.Page.ui.tabs.get("job_number_tab").setVisible(false);

        }

        ccrm_projectid_onchange();
        ccrm_createmethod_onchange();

        if (Xrm.Page.getAttribute("ccrm_opportunitycjn").getValue() != null) {
            //set to disable when suffix is being requested and oppo cjn is assigned
            Xrm.Page.getControl("ccrm_arupcompanyid").setDisabled(true);
            Xrm.Page.getControl("ccrm_arupaccountingcodeid").setDisabled(true);
        }

        var wonReasons = Xrm.Page.getControl("ccrm_wonreason");
        wonReasons.removeOption(100000004);

        //ccrm_projectid_onchange();        

    }

    //interface error banner display
    if (Xrm.Page.getAttribute("ccrm_interface_type").getValue() != null && Xrm.Page.getAttribute("ccrm_interface_retries").getValue() > 0) {
        interfaceErrorBanner(Xrm.Page.getAttribute("ccrm_interface_type").getValue(), Xrm.Page.getAttribute("ccrm_interface_retries").getValue(), Xrm.Page.getAttribute("ccrm_interface_error").getValue());
    }

    //display error code -1
    var interfaceErrorCode = Xrm.Page.getAttribute("ccrm_interface_error").getValue();
    if (interfaceErrorCode != null && interfaceErrorCode.indexOf("Error code -1") > -1) {
        var errorMsg = "Warning: The selected suffix has already been allocated. Please select a new suffix by clicking on the Request Job Number button on the Opportunity";
        SetNotificationAlert("WARNING", errorMsg, "Intr");
    }

}

function detectBrowser() {
    var g = navigator.userAgent,
        c = navigator.appName,
        j = "" + parseFloat(navigator.appVersion),
        b,
        d = "",
        a = "",
        e = false,
        f,
        h = {};
    if ((f = g.indexOf("MSIE")) != -1) {
        c = "Microsoft Internet Explorer"; b = g.substring(f + 5, f + 8)
    }
    else if ((f = g.indexOf("Chrome")) != -1) {
        c = "Chrome"; b = parseInt(navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10)
    }
    else if ((f = g.indexOf("Safari")) != -1) {
        c = "Safari"; b = parseInt(navigator.appVersion.match(/Version\/(\d+)\./)[1], 10)
    }
    else if ((f = g.indexOf("Firefox")) != -1) { c = "Firefox"; b = g.substring(f + 8) }

    if (navigator.appVersion.indexOf("Win") != -1) {
        d = "Windows";
    }
    else if (navigator.appVersion.indexOf("Mac") != -1) {
        d = "MacOS";
    }

    if (navigator.userAgent.indexOf("Windows NT") != -1) {
        var i = navigator.userAgent.indexOf("Windows NT");
        a = navigator.userAgent.substring(i + 11, i + 14);
    }
    else if (navigator.userAgent.indexOf("Macintosh") != -1) {
        var i = navigator.userAgent.indexOf("Mac OS X");
        a = navigator.userAgent.substring(i + 9, i + 13);
        a = a.replace("_", ".");
        d = "Macintosh"
    }
    else if (navigator.userAgent.indexOf("iPad") != -1) {
        var i = navigator.userAgent.indexOf("CPU OS");
        a = navigator.userAgent.substring(i + 6, i + 10);
        a = a.replace("_", ".");
        d = "iPad";
    }
    if (b >= 7 && b <= 9 && (a >= 5.1 && a <= 6.1) && d == "Windows" && c == "Microsoft Internet Explorer") {
        e = true;
    }
    else if (b == 10 && (a >= 6.1 && a <= 6.2) && d == "Windows" && c == "Microsoft Internet Explorer") {
        e = true;
    }
    else if (b >= 6 && (a >= 5.1 && a <= 6.1) && d == "Windows" && c == "Firefox") {
        e = true;
    }
    else if (b >= 6 && a >= 5 && d == "Macintosh" && c == "Firefox") {
        e = true;
    }
    else if (b >= 5 && a >= 5 && d == "Macintosh" && c == "Safari") {
        e = true;
    }
    else if (b >= 5 && a >= 5 && d == "iPad" && c == "Safari") {
        e = true;
    }
    else if (b >= 13 && (a >= 5.1 && a <= 6.1) && d == "Windows" && c == "Chrome") {
        e = true;
    }

    h.BrowserName = c;
    h.BrowserVersion = b;
    h.OSName = d;
    h.OSVersion = a;
    h.Supported = e;
    return h
}

function Form_onsave(executionObj) {

    if (Xrm.Page.getAttribute("ccrm_suffix").getValue() == null) {
        alert("You must provide a value for Suffix.");
        executionObj.getEventArgs().preventDefault();
        return false;
    }
    //to stop users from creating from adv find
    if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) {
        alert("Request for Job Number can only be requested from within an Opportunity.");
        executionObj.getEventArgs().preventDefault();
        return false;
    }
    //to stop users creating if there is an error on the webservice
    if (Xrm.Page.getAttribute("ccrm_sys_webservicecheck").getValue() == true) {
        return false;
    }

    //prompt if only form initiated from Opportunity Request Confirmed Job Number button and Create method is not 'Create new project (new number)'.
    if (Xrm.Page.getAttribute("ccrm_sys_reservejobnumber").getValue() && Xrm.Page.getAttribute("ccrm_createmethod").getValue() != 1) {
        alert("A new Job Number has been requested and the Confirmed Job Approval process has been initiated.");
    }

    //update Opportunity State with Confirmed as Won value at all times
    Xrm.Page.getAttribute("ccrm_opportunitystate").setValue(1); //confirmed as won

    // Updates the ccrm_sys_confirmedjob_gateway field on the associated opportunity field. This ensures that the CJNA cannot be created again from the Opportunity ribbon  and Create method is not 'Create new project (new number)'.
    // This code must always execute before the ccrm_sys_reservejobnumber is set to false below.
    //Bug# 31046 Changes Start.

    if (Xrm.Page.getAttribute("ccrm_sys_reservejobnumber").getValue() && Xrm.Page.getAttribute("ccrm_assignednumber").getValue() == null) {

        //Bug# 31046 Changes End.
        var changes = new Object();
        changes.ccrm_sys_confirmedjob_buttonhide = true;
        changes.ccrm_jobnumberprogression = { Value: 100009005 };
        var id = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
        var dataSet = "OpportunitySet";
        var updateStatus = ConsultCrm.Sync.UpdateRequest(id, changes, dataSet);
        if (updateStatus) {

        }
    }
}

// SET AvailableSuffixes URL
function getAvailableSuffixesURL(interfaceName) {
    //get the attributes
    var dataset = "Ccrm_arupinterfacesettingSet"
    var filter = "Ccrm_name eq '" + interfaceName + "'";
    var retrievedMultiple = ConsultCrm.Sync.RetrieveMultipleRequest(dataset, filter);
    if (retrievedMultiple.results[0] != null) {
        return retrievedMultiple.results[0].Ccrm_Setting;
    }
    else {
        alert('There has been an error returning the Interface Setting URL. Please contact your System Administrator.');
        return null;
    }
}

//function to set required level
function SetRequiredLevel(field, level) {
    Xrm.Page.getAttribute(field).setRequiredLevel(level);
}

function SetNotificationAlert(errorType, errorMessage, msgID) {
    //information message
    if (errorType == "INFO") {
        Xrm.Page.ui.setFormNotification(errorMessage, 'INFORMATION', msgID);
    }
    //warning message
    else if (errorType == "WARNING") {
        Xrm.Page.ui.setFormNotification(errorMessage, 'WARNING', msgID);
    }
    //error message
    else if (errorType == "CRITICAL") {
        Xrm.Page.ui.setFormNotification(errorMessage, 'ERROR', msgID);
    }
    //clear form notifications
    else {
        Xrm.Page.ui.clearFormNotification(msgID);
    }
}


//function to output error banner message from the interface
function interfaceErrorBanner(errorType, errorRetries, errorMsg) {
    SetNotificationAlert("CRITICAL", errorType + " | Number of retries: " + errorRetries + " | " + errorMsg);
}

function ccrm_projectsuffixisforintcostmonitoringonly_onChange() {

    var intCostMonitoring = Xrm.Page.getAttribute("ccrm_projectsuffixisforintcostmonitoringonly").getValue();

    interfaceInformationIntCostMonitoringBanner(intCostMonitoring, 'IICM');

}

//function to output information banner message for int cost monitoring
function interfaceInformationIntCostMonitoringBanner(output, msgID) {
    var msg = newCJN ? "You are creating a suffix for INTERNAL COST MONITORING only. This will not create a forecast for additional fee income under the base project in PFF." :
        "For a fee forecasting suffix, please cancel this and create a new opportunity and request a suffix at Confirmed Job stage.";
    if (output == true) {
        SetNotificationAlert(null, null, msgID);
        SetNotificationAlert("WARNING", msg, msgID);
    }
    else {
        SetNotificationAlert(null, null, msgID);
    }
}

function fnForceSubmit() {
    Xrm.Page.getAttribute("ccrm_suffix").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_projectid").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_createmethod").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_opportunitystate").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_wonreason").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_wondescription").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_opportunityid").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_suffixarray").setSubmitMode("always");
}

function ccrm_createmethod_onchange() {

    /* CREATE METHOD
       1 = Create new project (new number)
       2 = Create new project (existing prefix)
       3 = Create new suffix (existing project)
       4 = Create new suffix (new prefix) 
    */

    createMethod = Xrm.Page.getAttribute("ccrm_createmethod").getValue();

    if (createMethod == null) {

        Xrm.Page.getControl('ccrm_name').setLabel('Job Number Description');
        return;

    }

    switch (createMethod) {

        case 1:
            createNewProject(true, 'none');
            break;

        case 2:
            createNewProject(false, 'required');
            break;

        case 3:
            createNewSuffixExistingProject();
            break;

        case 4:
            createNewSuffixNewPrefix();
            break;
    }

    var required = 'none';
    if (newCJN == false) {

        Xrm.Page.getAttribute("ccrm_wonreason").setValue(null);
        Xrm.Page.getAttribute("ccrm_wondescription").setValue(null);

    }
    else {
        required = 'required';
    }

    Xrm.Page.getControl("ccrm_wonreason").setVisible(newCJN);
    Xrm.Page.getControl("ccrm_wondescription").setVisible(newCJN);
    Xrm.Page.getControl("ccrm_wonreason").setDisabled(!newCJN);
    Xrm.Page.getControl("ccrm_wondescription").setDisabled(!newCJN);
    Xrm.Page.getAttribute("ccrm_wonreason").setRequiredLevel(required);

    if (createMethod != 1) {
        ccrm_projectid_onchange();
    }

    ccrm_projectsuffixisforintcostmonitoringonly_onChange();

}

function createNewProject(disabled, required) {
    //1 or 2

    //null values   
    Xrm.Page.getAttribute("ccrm_projectprefix").setValue(null);
    Xrm.Page.getAttribute("ccrm_parentproject").setValue(null);
    Xrm.Page.getAttribute("ccrm_projectid").setValue(null);
    Xrm.Page.getAttribute("ccrm_suffixarray").setValue(null);

    SetRequiredLevel("ccrm_projectid", required);
    Xrm.Page.getControl("ccrm_projectid").setDisabled(disabled);

    Xrm.Page.getControl("ccrm_createmethod").setDisabled(false);
    Xrm.Page.getAttribute("ccrm_suffix").setValue(1);
    Xrm.Page.getControl("ccrm_suffix").setDisabled(true);

    Xrm.Page.getControl('ccrm_name').setLabel('Job Number Description');

    //hide int cost monitoring
    Xrm.Page.getControl("ccrm_projectsuffixisforintcostmonitoringonly").setVisible(false);
    //set the value of false
    Xrm.Page.getAttribute("ccrm_projectsuffixisforintcostmonitoringonly").setValue(false);
    //cancel output int cost monitoring information message
    //interfaceInformationIntCostMonitoringBanner(false, "IICM");
}

function createNewSuffixExistingProject() {

    //3

    Xrm.Page.getControl('ccrm_name').setLabel('Suffix Name (for Ovaview)');
    SetRequiredLevel("ccrm_projectid", "required");
    Xrm.Page.getControl("ccrm_createmethod").setDisabled(false);

    //show int cost monitoring
    Xrm.Page.getControl("ccrm_projectsuffixisforintcostmonitoringonly").setVisible(true);
    //set the value of true
    Xrm.Page.getAttribute("ccrm_projectsuffixisforintcostmonitoringonly").setValue(!newCJN);
    //disable int. cost monitoring when suffix is requested
    Xrm.Page.getControl("ccrm_projectsuffixisforintcostmonitoringonly").setDisabled(!newCJN);
    //cancel output int cost monitoring information message
    //interfaceInformationIntCostMonitoringBanner(true, "IICM");

    // coming from Request Suffix button
    if (!newCJN) {
        if (Xrm.Page.getAttribute("ccrm_projectid").getValue() != null) {
            webservice_onchange();
        }
        Xrm.Page.getControl("ccrm_suffix").setDisabled(false);
        Xrm.Page.getControl("ccrm_projectid").setDisabled(arupInternal);
    }
    else {

        if (!arupInternal) { getProject(); }

        Xrm.Page.getControl("ccrm_suffix").setDisabled(true);
        Xrm.Page.getControl("ccrm_projectid").setDisabled(false);
    }
}

function createNewSuffixNewPrefix() {

    //4
    if (newCJN) {
        getProject();
    }

    //null values
    Xrm.Page.getAttribute("ccrm_projectprefix").setValue(null);
    Xrm.Page.getAttribute("ccrm_parentproject").setValue(null);
    Xrm.Page.getAttribute("ccrm_suffixarray").setValue(null);

    Xrm.Page.getControl("ccrm_projectid").setDisabled(false);
    SetRequiredLevel("ccrm_projectid", "required");
    Xrm.Page.getControl('ccrm_name').setLabel('Suffix Name (for Ovaview)');

    Xrm.Page.getControl("ccrm_createmethod").setDisabled(false);

    Xrm.Page.getControl("ccrm_suffix").setDisabled(true); //set to false once project is selected
    var option = new Object();
    option.text = "00";
    option.value = 1;
    Xrm.Page.getControl("ccrm_suffix").addOption(option);
    Xrm.Page.getAttribute("ccrm_suffix").setValue(1);

    // show int cost monitoring
    Xrm.Page.getControl("ccrm_projectsuffixisforintcostmonitoringonly").setVisible(true);
    //set the value of true
    Xrm.Page.getAttribute("ccrm_projectsuffixisforintcostmonitoringonly").setValue(!newCJN);
    //disable int. cost monitoring when suffix is requested
    Xrm.Page.getControl("ccrm_projectsuffixisforintcostmonitoringonly").setDisabled(!newCJN);
    //cancel output int cost monitoring information message
    //interfaceInformationIntCostMonitoringBanner(true, "IICM");

}

function ccrm_projectid_onchange() {

    //null fields
    Xrm.Page.getAttribute("ccrm_projectprefix").setValue(null);
    Xrm.Page.getAttribute("ccrm_parentproject").setValue(null);

    if (Xrm.Page.getAttribute("ccrm_createmethod").getValue() == 4) return;
    else
        Xrm.Page.getAttribute("ccrm_suffix").setValue(null);

    if (Xrm.Page.getAttribute("ccrm_projectid").getValue() != null) {

        //if (Xrm.Page.getAttribute("ccrm_createmethod").getValue() != 4) {
        webservice_onchange();

        Xrm.Page.getControl("ccrm_suffix").setDisabled(false);

        var rtnJobNumber = getJobNumber(Xrm.Page.getAttribute("ccrm_projectid").getValue()[0].id);
        if (rtnJobNumber != null && Xrm.Page.getAttribute("ccrm_suffixarray").getValue() != null) {
            jobNumber = rtnJobNumber[0];
            jobNumber = jobNumber.substring(0, 6);
            jobNumber = jobNumber + "00";

            Xrm.Page.getAttribute("ccrm_projectprefix").setValue(jobNumber.substring(0, 6));
            Xrm.Page.getAttribute("ccrm_parentproject").setValue(rtnJobNumber[1]);
            if (Xrm.Page.getAttribute("ccrm_createmethod").getValue() == 2) {
                callSuffixWebService(jobNumber);
            }
        }
        else {
            Xrm.Page.getControl("ccrm_suffix").setDisabled(false);
        }
        //}
    }
    else {

        Xrm.Page.getControl("ccrm_suffix").setDisabled(true);
        SetNotificationAlert(null, null, "OppCr")
        SetNotificationAlert(null, null, "IICM")
    }
}

function getProject() {

    //find if main opportunity has a parent
    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/opportunities(" + Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id.replace('{', '').replace('}', '') + ")?$select=_ccrm_parentopportunityid_value", true);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var result = JSON.parse(this.response);
                var _ccrm_parentopportunityid_value = result["_ccrm_parentopportunityid_value"];
                var _ccrm_parentopportunityid_value_formatted = result["_ccrm_parentopportunityid_value@OData.Community.Display.V1.FormattedValue"];
                var _ccrm_parentopportunityid_value_lookuplogicalname = result["_ccrm_parentopportunityid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];

                // if main opportunity has a parent, find if there's a project associated with it
                if (_ccrm_parentopportunityid_value != null) {

                    var reqP = new XMLHttpRequest();
                    reqP.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/ccrm_projects?$select=ccrm_name,ccrm_projectid&$filter=_ccrm_opportunityid_value eq " + _ccrm_parentopportunityid_value, true);
                    reqP.setRequestHeader("OData-MaxVersion", "4.0");
                    reqP.setRequestHeader("OData-Version", "4.0");
                    reqP.setRequestHeader("Accept", "application/json");
                    reqP.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                    reqP.setRequestHeader("Prefer", "odata.include-annotations=\"*\",odata.maxpagesize=1");
                    reqP.onreadystatechange = function () {
                        if (this.readyState === 4) {
                            reqP.onreadystatechange = null;
                            if (this.status === 200) {
                                var results = JSON.parse(this.response);
                                for (var i = 0; i < results.value.length; i++) {
                                    var ccrm_name = results.value[i]["ccrm_name"];
                                    var ccrm_projectid = results.value[i]["ccrm_projectid"];

                                    // if main opportunity has a parent and if there's a project associated with it, populate it Associated Project/Prefix with the project #
                                    if (ccrm_projectid != null) {

                                        if (Xrm.Page.getAttribute('ccrm_projectid').getValue() == null || (Xrm.Page.getAttribute('ccrm_projectid').getValue() != null && Xrm.Page.getAttribute('ccrm_projectid').getValue()[0].id != ccrm_projectid)) {

                                            Alert.show('<font size="6" color="#2E74B5"><b>For your information</b></font>',
                                                '<font size="3" color="#000000"></br>This opportunity has a parent project (<b>' + ccrm_name + '</b>) which will be defaulted in the Associated Project/Prefix field<br>Click OK to accept it or Cancel to select another project</font>',
                                                [
                                                    new Alert.Button("<b>OK</b>",
                                                        function () {

                                                            var lookup = new Array();
                                                            lookup[0] = new Object();
                                                            lookup[0].id = ccrm_projectid;
                                                            lookup[0].name = ccrm_name;
                                                            lookup[0].entityType = 'ccrm_project';
                                                            Xrm.Page.getAttribute('ccrm_projectid').setValue(lookup);
                                                            ccrm_projectid_onchange();

                                                        }, false, false),
                                                    new Alert.Button("Cancel", function () { }, true, false)
                                                ], "INFO", 600, 250, '', true);
                                        }
                                    }
                                }
                            } else {
                                Xrm.Utility.alertDialog(this.statusText + " : " + this.status.toString() + " 1");
                            }
                        }
                    };
                    reqP.send();
                }
            } else {
                Xrm.Utility.alertDialog(this.statusText + " : " + this.status.toString() + " 2");
            }
        }
    };
    req.send();
}

function disableFieldsOnForm() {
    //set all fields to readonly when assigned number is set
    Xrm.Page.getControl("ccrm_name").setDisabled(true);
    //Xrm.Page.getControl("ccrm_opportunitystate").setDisabled(true);
    Xrm.Page.getControl("ccrm_wonreason").setDisabled(true);
    Xrm.Page.getControl("ccrm_wondescription").setDisabled(true);
    Xrm.Page.getControl("ccrm_projectid").setDisabled(true);
    Xrm.Page.getControl("ccrm_createmethod").setDisabled(true);
    Xrm.Page.getControl("ccrm_suffix").setDisabled(true);
    Xrm.Page.getControl("ccrm_projectsuffixisforintcostmonitoringonly").setDisabled(true);
    Xrm.Page.getControl("ccrm_autocloseopportunitywhennumberreceived").setDisabled(true);
    Xrm.Page.getControl("ccrm_projectmanager_userid").setDisabled(true);
    Xrm.Page.getControl("ccrm_projectdirector_userid").setDisabled(true);
    Xrm.Page.getControl("ccrm_arupcompanyid").setDisabled(true);
    Xrm.Page.getControl("ccrm_arupaccountingcodeid").setDisabled(true);
    Xrm.Page.getControl("ccrm_opportunityid").setDisabled(true);
}

function webservice_onchange() {

    Xrm.Page.getAttribute("ccrm_suffixarray").setValue(null);
    if (Xrm.Page.getAttribute("ccrm_projectid").getValue() != null) {
        var rtnJobNumber = getJobNumber(Xrm.Page.getAttribute("ccrm_projectid").getValue()[0].id);
        if (rtnJobNumber != null) {
            jobNumber = rtnJobNumber[0];
            jobNumber = jobNumber.substring(0, 6);
            jobNumber = jobNumber + "00";
            callSuffixWebService(jobNumber);

            Xrm.Page.getAttribute("ccrm_projectprefix").setValue(jobNumber.substring(0, 6));
            Xrm.Page.getAttribute("ccrm_parentproject").setValue(rtnJobNumber[1]);
            Xrm.Page.getControl("ccrm_suffix").setDisabled(false);
            //set error flag to false
            Xrm.Page.getAttribute("ccrm_sys_webservicecheck").setValue(false);
        }
        else {
            //set error flag to true
            Xrm.Page.getAttribute("ccrm_sys_webservicecheck").setValue(true);
            Xrm.Page.getControl("ccrm_suffix").setDisabled(false);
        }
    }
}

//function to populate the client when the contact is selected on the customerid Lookup
function getJobNumber(projectId) {
    var dataset = "Ccrm_projectSet";
    var retrievedreq = ConsultCrm.Sync.RetrieveRequest(projectId, dataset)
    if (retrievedreq != null) {
        var nodeJobNumber = (retrievedreq.Ccrm_JobNumber != null) ? retrievedreq.Ccrm_JobNumber : null;
        var nodeParentProject = (retrievedreq.Ccrm_ParentProject != null) ? retrievedreq.Ccrm_ParentProject : null;
        Xrm.Page.getAttribute("ccrm_opportunitycjn").setValue(nodeJobNumber);

        if (nodeJobNumber != null) {
            return [nodeJobNumber, nodeParentProject];
        } else {
            return null;
        }
    }
}

//function to call Available Suffixes webservice
function callSuffixWebService(jobNumber) {

    Xrm.Page.getControl("ccrm_suffix").setDisabled(false);
    var callingFunctionURL = getServiceURL();

    //TD 24/04/2013 cross browser required
    var browserInfo = detectBrowser();
    var myVersion = parseFloat(browserInfo.BrowserVersion);

    if (browserInfo.BrowserName == "Microsoft Internet Explorer" && myVersion <= 8.0) {
        var xml = '<?xml version="1.0" encoding="utf-8"?>';
        xml = xml + '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
        xml = xml + '  <soap:Body>';
        xml = xml + '	<AvailableSuffices xmlns="http://arup.com/crm/progression/">';
        xml = xml + '	  <project>' + jobNumber + '</project>';
        xml = xml + '	</AvailableSuffices>';
        xml = xml + '  </soap:Body>';
        xml = xml + '</soap:Envelope>';

        xmlHttp = new ActiveXObject('Msxml2.XMLHTTP');
        xmlHttp.Open('POST', callingFunctionURL, false);
        xmlHttp.setRequestHeader('Content-Type', 'text/xml; charset=utf-8');
        xmlHttp.setRequestHeader('Content-Length', xml.length);
        xmlHttp.setRequestHeader('SOAPAction', 'http://arup.com/crm/progression/AvailableSuffices');
        xmlHttp.send(xml);

        var resultXml = xmlHttp.responseText;

        resultXml1 = resultXml.replace('<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><AvailableSufficesResponse xmlns="http://arup.com/crm/progression/"><AvailableSufficesResult><status>200</status><result>', '');
        resultXml2 = resultXml1.replace('<message /></AvailableSufficesResult></AvailableSufficesResponse></soap:Body></soap:Envelope>', '');
        resultXml3 = resultXml2.replace('<result>', '');
        resultXml4 = resultXml3.replace('</result>', '');
        resultXml5 = resultXml4.replace('&lt;sxs&gt;&lt;sx&gt;', '');
        resultXml6 = resultXml5.replace('&lt;/sx&gt;&lt;sx&gt;', ',');
        var searchMask = "&lt;/sx&gt;&lt;sx&gt;";
        var regEx = new RegExp(searchMask, "ig");
        var replaceMask = ",";
        var result = resultXml6.replace(regEx, replaceMask);
        resultXml7 = result.replace('&lt;/sx&gt;&lt;/sxs&gt;', '');
        Xrm.Page.getAttribute("ccrm_suffixarray").setValue(resultXml7);
        showAvailableSuffixes(resultXml7);
    }
    else {
        var xml = '<?xml version="1.0" encoding="utf-8"?>';
        xml = xml + '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
        xml = xml + '  <soap:Body>';
        xml = xml + '	<AvailableSuffices xmlns="http://arup.com/crm/progression/">';
        xml = xml + '	  <project>' + jobNumber + '</project>';
        xml = xml + '	</AvailableSuffices>';
        xml = xml + '  </soap:Body>';
        xml = xml + '</soap:Envelope>';

        xmlHttp = new XMLHttpRequest();
        xmlHttp.open('POST', callingFunctionURL, false);
        xmlHttp.setRequestHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
        xmlHttp.setRequestHeader("Access-Control-Allow-Methods", "GET, POST");
        xmlHttp.setRequestHeader("Access-Control-Allow-Credentials", "true");
        xmlHttp.setRequestHeader('Content-Type', 'text/xml');
        xmlHttp.setRequestHeader('SOAPAction', 'http://arup.com/crm/progression/AvailableSuffices');
        xml = xml.replace('\"', '"');
        xmlHttp.send(xml);

        var resultXml = xmlHttp.responseText;

        resultXml1 = resultXml.replace('<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><AvailableSufficesResponse xmlns="http://arup.com/crm/progression/"><AvailableSufficesResult><status>200</status><result>', '');
        resultXml2 = resultXml1.replace('<message /></AvailableSufficesResult></AvailableSufficesResponse></soap:Body></soap:Envelope>', '');
        resultXml3 = resultXml2.replace('<result>', '');
        resultXml4 = resultXml3.replace('</result>', '');
        resultXml5 = resultXml4.replace('&lt;sxs&gt;&lt;sx&gt;', '');
        resultXml6 = resultXml5.replace('&lt;/sx&gt;&lt;sx&gt;', ',');
        var searchMask = "&lt;/sx&gt;&lt;sx&gt;";
        var regEx = new RegExp(searchMask, "ig");
        var replaceMask = ",";
        var result = resultXml6.replace(regEx, replaceMask);
        resultXml7 = result.replace('&lt;/sx&gt;&lt;/sxs&gt;', '');
        Xrm.Page.getAttribute("ccrm_suffixarray").setValue(resultXml7);
        showAvailableSuffixes(resultXml7);
    }
}

function fnCallback(XmlHttpRequest, status) {
    alert(XmlHttpRequest.responseXML);
}


//function showAvailableSuffixes(suffixArray) {
function showAvailableSuffixes(suffixArray) {
    var suffixArray = Xrm.Page.getAttribute("ccrm_suffixarray").getValue();
    if (suffixArray != null) {
        //remove all options
        var exist = Xrm.Page.getAttribute("ccrm_assignednumber").getValue();
        if (exist == null) {
            Xrm.Page.getControl("ccrm_suffix").clearOptions();
            suffixArray = suffixArray.split(",");
            for (i = 0; i < suffixArray.length; i++) {
                var picklistTextOption = parseInt(suffixArray[i], 10) + 1;
                var option = new Object();
                option.text = suffixArray[i];
                option.value = picklistTextOption;
                if (Xrm.Page.getAttribute("ccrm_suffix").getValue() != picklistTextOption) {
                    Xrm.Page.getControl("ccrm_suffix").addOption(option);
                }
            }
        }
    }
    //remove 00
    if (Xrm.Page.getAttribute("ccrm_suffix").getValue() != 1 && Xrm.Page.getAttribute("ccrm_createmethod").getValue() != 2) {
        var suffixControl = Xrm.Page.getControl("ccrm_suffix");
        suffixControl.removeOption(1);
    }
}

function getServiceURL() {
    var orgName = Xrm.Page.context.getOrgUniqueName();

    switch (orgName) {
        case "ArupDev": //dev
            return "https://crmwsp.arup.com/progression.populate.dev/PopulateProgression.asmx";
            break;

        case "ArupTest": //test
            return "https://crmwsp.arup.com/progression.populate.dev/PopulateProgression.asmx";
            break;

        case "ArupUAT": //uat
            return "https://crmwsp.arup.com/progression.populate.dev/PopulateProgression.asmx";
            break;

        case "ArupGroup": //live
            return "https://crmwsp.arup.com/progression.populate/PopulateProgression.asmx"; //UPDATE
            break;
    }
}

function exitForm() {

    //see if the form is dirty
    var ismodified = Xrm.Page.data.entity.getIsDirty();
    if (ismodified == false || Xrm.Page.ui.getFormType() == 1) {
        Xrm.Page.ui.close();
        return;
    }

    if (ismodified == true && Xrm.Page.getAttribute("statecode").getValue() != 0) {
        //get list of dirty fields
        var cjnAttributes = Xrm.Page.data.entity.attributes.get();
        if (cjnAttributes != null) {
            for (var i in cjnAttributes) {
                if (cjnAttributes[i].getIsDirty()) {
                    Xrm.Page.getAttribute(cjnAttributes[i].getName()).setSubmitMode("never");
                }
            }
            setTimeout(function () { Xrm.Page.ui.close(); }, 1000);
        }
        return;
    }
}