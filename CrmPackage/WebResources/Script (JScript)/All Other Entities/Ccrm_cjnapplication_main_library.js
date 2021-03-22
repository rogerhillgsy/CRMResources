    var newCJN;
//var arupInternal;

function Form_onload(executionContext) {
    var formContext = executionContext.getFormContext();
    var project = formContext.getAttribute("ccrm_projectid").getValue();
    var rtnJobNumber = formContext.getAttribute("ccrm_opportunitycjn").getValue();
    var projSuffix = formContext.getAttribute("ccrm_suffix").getValue();
    newCJN = formContext.getAttribute("ccrm_sys_reservejobnumber").getValue();

    //Added suffix check below to prevent recalling of web service when suffix is present
    if (project != null && projSuffix == null) {
        jobNumber = rtnJobNumber;
        jobNumber = jobNumber.substring(0, 6);
        jobNumber = jobNumber + "00";
        callSuffixWebService(jobNumber, formContext)
    }

    //function force submit readonly fields
    fnForceSubmit(formContext);

    //Not on Form Creation 
    if (formContext.ui.getFormType() != 1) {

        if (formContext.getAttribute("ccrm_assignednumber").getValue() == null) {

            //Section hidden until populated with number
            formContext.ui.tabs.get("job_number_tab").setVisible(formContext.getAttribute("ccrm_assignednumber").getValue() == null ? false : true);
        }
        //disable fields on form
        disableFieldsOnForm(formContext);
    }
    else {

        //if came from Request New CJN button then the default create method should be New Project (new number),
        //if came from Request Suffix button then the default create method should be New Suffix (existing project)
        if (formContext.getAttribute("ccrm_createmethod").getValue() == null) {

            var defaultCreateMethod;

            // if CJN request has been originated from clicking Request Suffix button on the opportunity form
            if (!newCJN) {

                defaultCreateMethod = 3;
                formContext.getControl("ccrm_projectsuffixisforintcostmonitoringonly").setDisabled(true);
                //delete new number and extsing prefix
                formContext.getControl("ccrm_createmethod").removeOption(1);
                formContext.getControl("ccrm_createmethod").removeOption(2);
                SetNotificationAlert("INFO", "You are creating a suffix for INTERNAL COST MONITORING only. There is no fee income associated with a cost monitoring suffix.", "OppCr", formContext);
            }
            else defaultCreateMethod = 1;

            if (formContext.getAttribute("arup_opportunitytype").getValue() == 770000003) {
                if (newCJN)// Remove below options if request is for CJN number and not for the Suffix
                {
                    RemoveOptionFromOptionSet(formContext, "ccrm_createmethod", 2, 3, 4);
                }
                RemoveOptionFromOptionSet(formContext, "ccrm_wonreason", 100000007, 100000012, 100000008, 100000011, 100000010, 100000009, 100000013, 100000004);
            } else {
                RemoveOptionFromOptionSet(formContext, "ccrm_wonreason", 770000007, 770000008, 770000009, 770000010, 770000011, 770000012, 770000013);
            }

            formContext.getAttribute("ccrm_createmethod").setValue(defaultCreateMethod);

            //Section hidden 
            formContext.ui.tabs.get("job_number_tab").setVisible(false);
        }

        ccrm_projectid_onchange(formContext);
        ccrm_createmethod_onchange(formContext);

        if (formContext.getAttribute("ccrm_opportunitycjn").getValue() != null) {
            //set to disable when suffix is being requested and oppo cjn is assigned
            formContext.getControl("ccrm_arupcompanyid").setDisabled(true);
            formContext.getControl("ccrm_arupaccountingcodeid").setDisabled(true);
        }

        var wonReasons = formContext.getControl("ccrm_wonreason");
        wonReasons.removeOption(100000004);
    }

    //interface error banner display
    if (formContext.getAttribute("ccrm_interface_type").getValue() != null && formContext.getAttribute("ccrm_interface_retries").getValue() > 0) {
        interfaceErrorBanner(formContext.getAttribute("ccrm_interface_type").getValue(), formContext.getAttribute("ccrm_interface_retries").getValue(), formContext.getAttribute("ccrm_interface_error").getValue());
    }

    //display error code -1
    var interfaceErrorCode = formContext.getAttribute("ccrm_interface_error").getValue();
    if (interfaceErrorCode != null && interfaceErrorCode.indexOf("Error code -1") > -1) {
        var errorMsg = "Warning: The selected suffix has already been allocated. Please select a new suffix by clicking on the Request Job Number button on the Opportunity";
        SetNotificationAlert("WARNING", errorMsg, "Intr", formContext);
    }

}

function Form_onsave(executionObj) {
    var formContext = executionObj.getFormContext();
    if (formContext.getAttribute("ccrm_suffix").getValue() == null) {
        alert("You must provide a value for Suffix.");
        executionObj.getEventArgs().preventDefault();
        return false;
    }
    //to stop users from creating from adv find
    if (formContext.getAttribute("ccrm_opportunityid").getValue() == null) {
        alert("Request for Job Number can only be requested from within an Opportunity.");
        executionObj.getEventArgs().preventDefault();
        return false;
    }
    //to stop users creating if there is an error on the webservice
    if (formContext.getAttribute("ccrm_sys_webservicecheck").getValue() == true) {
        return false;
    }

    //prompt if only form initiated from Opportunity Request Confirmed Job Number button and Create method is not 'Create new project (new number)'.
    if (formContext.getAttribute("ccrm_sys_reservejobnumber").getValue() && formContext.getAttribute("ccrm_createmethod").getValue() != 1) {
        alert("A new Job Number has been requested and the Confirmed Job Approval process has been initiated.");
    }

    //update Opportunity State with Confirmed as Won value at all times
    formContext.getAttribute("ccrm_opportunitystate").setValue(1); //confirmed as won

    // Updates the ccrm_sys_confirmedjob_gateway field on the associated opportunity field. This ensures that the CJNA cannot be created again from the Opportunity ribbon  and Create method is not 'Create new project (new number)'.
    // This code must always execute before the ccrm_sys_reservejobnumber is set to false below.
    //Bug# 31046 Changes Start.

    if (formContext.getAttribute("ccrm_sys_reservejobnumber").getValue() && formContext.getAttribute("ccrm_assignednumber").getValue() == null) {
        var id = formContext.getAttribute("ccrm_opportunityid").getValue()[0].id.replace('{', '').replace('}', '');
        var entity = {};
        entity.ccrm_sys_confirmedjob_buttonhide = true;
        entity.ccrm_jobnumberprogression = 100009005;

        var req = new XMLHttpRequest();
        req.open("PATCH", formContext.context.getClientUrl() + "/api/data/v9.1/opportunities(" + id +")", true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 204) {
                    //Success - No Return Data - Do Something
                } else {
                    Xrm.Navigation.openAlertDialog(this.statusText);
                }
            }
        };
        req.send(JSON.stringify(entity));
    }


}



// SET AvailableSuffixes URL
// CANNOT FIND FUNCTION
function getAvailableSuffixesURL(executionObj, interfaceName) {
    //get the attributes
    var formContext = executionObj.getFormContext();
    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/ccrm_arupinterfacesettings?$filter=ccrm_name eq '" + interfaceName+"'", false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                for (var i = 0; i < results.value.length; i++) {
                    return  results.value[i].Ccrm_Setting;
                }
            } else {
                alert('There has been an error returning the Interface Setting URL. Please contact your System Administrator.');
                return null;
            }
        }
    };
    req.send();
}

//function to set required level
function SetRequiredLevel(field, level, formContext) {
    formContext.getAttribute(field).setRequiredLevel(level);
}

function SetNotificationAlert(errorType, errorMessage, msgID, formContext) {
    //information message
    if (errorType == "INFO") {
        formContext.ui.setFormNotification(errorMessage, 'INFORMATION', msgID);
    }
    //warning message
    else if (errorType == "WARNING") {
        formContext.ui.setFormNotification(errorMessage, 'WARNING', msgID);
    }
    //error message
    else if (errorType == "CRITICAL") {
        formContext.ui.setFormNotification(errorMessage, 'ERROR', msgID);
    }
    //clear form notifications
    else {
        formContext.ui.clearFormNotification(msgID);
    }
}


//function to output error banner message from the interface
function interfaceErrorBanner(errorType, errorRetries, errorMsg, formContext) {
    SetNotificationAlert("CRITICAL", errorType + " | Number of retries: " + errorRetries + " | " + errorMsg, null, formContext);
}

function ccrm_projectsuffix_onChange(executionContext) {
    var formContext = executionContext.getFormContext();
    ccrm_projectsuffixisforintcostmonitoringonly_onChange(formContext);
}

function ccrm_projectsuffixisforintcostmonitoringonly_onChange(formContext) {

    var intCostMonitoring = formContext.getAttribute("ccrm_projectsuffixisforintcostmonitoringonly").getValue();

    interfaceInformationIntCostMonitoringBanner(intCostMonitoring, 'IICM', formContext);

}

//function to output information banner message for int cost monitoring
function interfaceInformationIntCostMonitoringBanner(output, msgID, formContext) {
    var msg = newCJN ? "You are creating a suffix for INTERNAL COST MONITORING only. This will not create a forecast for additional fee income under the base project in PFF." :
        "For a fee forecasting suffix, please cancel this and create a new opportunity and request a suffix at Confirmed Job stage.";
    if (output == true) {
        SetNotificationAlert(null, null, msgID, formContext);
        SetNotificationAlert("WARNING", msg, msgID, formContext);
    }
    else {
        SetNotificationAlert(null, null, msgID, formContext);
    }
}

function fnForceSubmit(formContext) {
    formContext.getAttribute("ccrm_suffix").setSubmitMode("always");
    formContext.getAttribute("ccrm_projectid").setSubmitMode("always");
    formContext.getAttribute("ccrm_createmethod").setSubmitMode("always");
    formContext.getAttribute("ccrm_opportunitystate").setSubmitMode("always");
    formContext.getAttribute("ccrm_wonreason").setSubmitMode("always");
    formContext.getAttribute("ccrm_wondescription").setSubmitMode("always");
    formContext.getAttribute("ccrm_opportunityid").setSubmitMode("always");
    formContext.getAttribute("ccrm_suffixarray").setSubmitMode("always");
    formContext.getAttribute("arup_opportunitytype").setSubmitMode("always");
}

function ccrm_createMethodOnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    ccrm_createmethod_onchange(formContext);
}

function ccrm_createmethod_onchange(formContext) {

    /* CREATE METHOD
       1 = Create new project (new number)
       2 = Create new project (existing prefix)
       3 = Create new suffix (existing project)
       4 = Create new suffix (new prefix) 
    */

    createMethod = formContext.getAttribute("ccrm_createmethod").getValue();

    if (createMethod == null) {

        formContext.getControl('ccrm_name').setLabel('Job Number Description');
        return;

    }

    switch (createMethod) {

        case 1:
            createNewProject(true, 'none', formContext);
            break;

        case 2:
            createNewProject(false, 'required', formContext);
            break;

        case 3:
            createNewSuffixExistingProject(formContext);
            break;

        case 4:
            createNewSuffixNewPrefix(formContext);
            break;
    }

    var required = 'none';
    if (newCJN == false) {

        formContext.getAttribute("ccrm_wonreason").setValue(null);
        formContext.getAttribute("ccrm_wondescription").setValue(null);

    }
    else {
        required = 'required';
    }

    formContext.getControl("ccrm_wonreason").setVisible(newCJN);
    formContext.getControl("ccrm_wondescription").setVisible(newCJN);
    formContext.getControl("ccrm_wonreason").setDisabled(!newCJN);
    formContext.getControl("ccrm_wondescription").setDisabled(!newCJN);
    formContext.getAttribute("ccrm_wonreason").setRequiredLevel(required);

    if (createMethod != 1) {
        ccrm_projectid_onchange(formContext);
    }

    ccrm_projectsuffixisforintcostmonitoringonly_onChange(formContext);
}

function createNewProject(disabled, required, formContext) {
    //1 or 2

    //null values   
    formContext.getAttribute("ccrm_projectprefix").setValue(null);
    formContext.getAttribute("ccrm_parentproject").setValue(null);
    formContext.getAttribute("ccrm_projectid").setValue(null);
    formContext.getAttribute("ccrm_suffixarray").setValue(null);

    SetRequiredLevel("ccrm_projectid", required, formContext);
    formContext.getControl("ccrm_projectid").setDisabled(disabled);

    formContext.getControl("ccrm_createmethod").setDisabled(false);
    formContext.getAttribute("ccrm_suffix").setValue(1);
    formContext.getControl("ccrm_suffix").setDisabled(true);

    formContext.getControl('ccrm_name').setLabel('Job Number Description');

    //hide int cost monitoring
    formContext.getControl("ccrm_projectsuffixisforintcostmonitoringonly").setVisible(false);
    //set the value of false
    formContext.getAttribute("ccrm_projectsuffixisforintcostmonitoringonly").setValue(false);
    //cancel output int cost monitoring information message
    //interfaceInformationIntCostMonitoringBanner(false, "IICM");
}

function createNewSuffixExistingProject(formContext) {
    //3
    formContext.getControl('ccrm_name').setLabel('Suffix Name (for Ovaview)');
    SetRequiredLevel("ccrm_projectid", "required", formContext);
    formContext.getControl("ccrm_createmethod").setDisabled(false);

    //show int cost monitoring
    formContext.getControl("ccrm_projectsuffixisforintcostmonitoringonly").setVisible(true);
    //set the value of true
    formContext.getAttribute("ccrm_projectsuffixisforintcostmonitoringonly").setValue(!newCJN);
    //disable int. cost monitoring when suffix is requested
    formContext.getControl("ccrm_projectsuffixisforintcostmonitoringonly").setDisabled(!newCJN);
    //cancel output int cost monitoring information message
    //interfaceInformationIntCostMonitoringBanner(true, "IICM");

    // coming from Request Suffix button
    if (!newCJN) {
        if (formContext.getAttribute("ccrm_projectid").getValue() != null) {
            webservice_onchange(formContext);
        }
        formContext.getControl("ccrm_suffix").setDisabled(false);
    }
    else {
        { getProject(formContext); }

        formContext.getControl("ccrm_suffix").setDisabled(true);
        formContext.getControl("ccrm_projectid").setDisabled(false);
    }
}

function createNewSuffixNewPrefix(formContext) {

    //4
    if (newCJN) {
        getProject(formContext);
    }

    //null values
    formContext.getAttribute("ccrm_projectprefix").setValue(null);
    formContext.getAttribute("ccrm_parentproject").setValue(null);
    formContext.getAttribute("ccrm_suffixarray").setValue(null);

    formContext.getControl("ccrm_projectid").setDisabled(false);
    SetRequiredLevel("ccrm_projectid", "required", formContext);
    formContext.getControl('ccrm_name').setLabel('Suffix Name (for Ovaview)');

    formContext.getControl("ccrm_createmethod").setDisabled(false);

    formContext.getControl("ccrm_suffix").setDisabled(true); //set to false once project is selected
    var option = new Object();
    option.text = "00";
    option.value = 1;
    formContext.getControl("ccrm_suffix").addOption(option);
    formContext.getAttribute("ccrm_suffix").setValue(1);

    // show int cost monitoring
    formContext.getControl("ccrm_projectsuffixisforintcostmonitoringonly").setVisible(true);
    //set the value of true
    formContext.getAttribute("ccrm_projectsuffixisforintcostmonitoringonly").setValue(!newCJN);
    //disable int. cost monitoring when suffix is requested
    formContext.getControl("ccrm_projectsuffixisforintcostmonitoringonly").setDisabled(!newCJN);
    //cancel output int cost monitoring information message
    //interfaceInformationIntCostMonitoringBanner(true, "IICM");
}

function ccrm_projectIdOnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    ccrm_projectid_onchange(formContext);
}

function ccrm_projectid_onchange(formContext) {

    formContext.getAttribute("ccrm_projectprefix").setValue(null);
    formContext.getAttribute("ccrm_parentproject").setValue(null);

    if (formContext.getAttribute("ccrm_createmethod").getValue() == 4) return;
    else
        formContext.getAttribute("ccrm_suffix").setValue(null);

    if (formContext.getAttribute("ccrm_projectid").getValue() != null) {
        webservice_onchange(formContext);

        formContext.getControl("ccrm_suffix").setDisabled(false);

        var rtnJobNumber = getJobNumber(formContext.getAttribute("ccrm_projectid").getValue()[0].id.replace(/[{}]/g, ""), formContext);
        if (rtnJobNumber.length != 0 && formContext.getAttribute("ccrm_suffixarray").getValue() != null) {
            jobNumber = rtnJobNumber[0];
            jobNumber = jobNumber.substring(0, 6);
            jobNumber = jobNumber + "00";

            formContext.getAttribute("ccrm_projectprefix").setValue(jobNumber.substring(0, 6));
            formContext.getAttribute("ccrm_parentproject").setValue(rtnJobNumber[1]);
            if (formContext.getAttribute("ccrm_createmethod").getValue() == 2) {
                callSuffixWebService(jobNumber, formContext);
            }
        }
        else {
            formContext.getControl("ccrm_suffix").setDisabled(false);
        }
    }
    else {

        formContext.getControl("ccrm_suffix").setDisabled(true);
        SetNotificationAlert(null, null, "OppCr", formContext)
        SetNotificationAlert(null, null, "IICM", formContext)
    }
}

function getProject(formContext) {
    var clientURL = formContext.context.getClientUrl();
    //find if main opportunity has a parent
    var req = new XMLHttpRequest();
    req.open("GET", clientURL + "/api/data/v9.1/opportunities(" + formContext.getAttribute("ccrm_opportunityid").getValue()[0].id.replace('{', '').replace('}', '') + ")?$select=_ccrm_parentopportunityid_value", true);
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

                // if main opportunity has a parent, find if there's a project associated with it
                if (_ccrm_parentopportunityid_value != null) {

                    var reqP = new XMLHttpRequest();
                    reqP.open("GET", clientURL + "/api/data/v9.1/ccrm_projects?$select=ccrm_name,ccrm_projectid&$filter=_ccrm_opportunityid_value eq " + _ccrm_parentopportunityid_value, true);
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

                                        if (formContext.getAttribute('ccrm_projectid').getValue() == null || (formContext.getAttribute('ccrm_projectid').getValue() != null && formContext.getAttribute('ccrm_projectid').getValue()[0].id != ccrm_projectid)) {

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
                                                            formContext.getAttribute('ccrm_projectid').setValue(lookup);
                                                            ccrm_projectid_onchange(formContext);

                                                        }, false, false),
                                                    new Alert.Button("Cancel", function () { }, true, false)
                                                ], "INFO", 600, 250, clientURL, true);
                                        }
                                    }
                                }
                            } else {
                                Xrm.Navigation.openAlertDialog(this.statusText + " : " + this.status.toString() + " 1");
                            }
                        }
                    };
                    reqP.send();
                }
            } else {
                Xrm.Navigation.openAlertDialog(this.statusText + " : " + this.status.toString() + " 2");
            }
        }
    };
    req.send();
}

function disableFieldsOnForm(formContext) {
    //set all fields to readonly when assigned number is set
    formContext.getControl("ccrm_name").setDisabled(true);
    formContext.getControl("ccrm_wonreason").setDisabled(true);
    formContext.getControl("ccrm_wondescription").setDisabled(true);
    formContext.getControl("ccrm_projectid").setDisabled(true);
    formContext.getControl("ccrm_createmethod").setDisabled(true);
    formContext.getControl("ccrm_suffix").setDisabled(true);
    formContext.getControl("ccrm_projectsuffixisforintcostmonitoringonly").setDisabled(true);
    formContext.getControl("ccrm_autocloseopportunitywhennumberreceived").setDisabled(true);
    formContext.getControl("ccrm_projectmanager_userid").setDisabled(true);
    formContext.getControl("ccrm_projectdirector_userid").setDisabled(true);
    formContext.getControl("ccrm_arupcompanyid").setDisabled(true);
    formContext.getControl("ccrm_arupaccountingcodeid").setDisabled(true);
    formContext.getControl("ccrm_opportunityid").setDisabled(true);
    formContext.getControl("arup_opportunitytype").setDisabled(true);
}

function webservice_onchange(formContext) {
    formContext.getAttribute("ccrm_suffixarray").setValue(null);
    if (formContext.getAttribute("ccrm_projectid").getValue() != null) {
        var rtnJobNumber = getJobNumber(formContext.getAttribute("ccrm_projectid").getValue()[0].id.replace(/[{}]/g, ""), formContext);

        if (rtnJobNumber.length != 0) {
            jobNumber = rtnJobNumber[0];
            jobNumber = jobNumber.substring(0, 6);
            jobNumber = jobNumber + "00";
            callSuffixWebService(jobNumber, formContext);

            formContext.getAttribute("ccrm_projectprefix").setValue(jobNumber.substring(0, 6));
            formContext.getAttribute("ccrm_parentproject").setValue(rtnJobNumber[1]);
            formContext.getControl("ccrm_suffix").setDisabled(false);
            //set error flag to false
            formContext.getAttribute("ccrm_sys_webservicecheck").setValue(false);
        }
        else {
            //set error flag to true
            formContext.getAttribute("ccrm_sys_webservicecheck").setValue(true);
            formContext.getControl("ccrm_suffix").setDisabled(false);
        }
    }
}

//function to populate the client when the contact is selected on the customerid Lookup
function getJobNumber(projectId, formContext) {
    var numbers = [];
    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/ccrm_projects(" + projectId+")?$select=ccrm_jobnumber,ccrm_parentproject", false);
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
                var ccrm_jobnumber = result["ccrm_jobnumber"];
                var ccrm_parentproject = result["ccrm_parentproject"];

                var nodeJobNumber = (ccrm_jobnumber != null) ? ccrm_jobnumber : null;
                var nodeParentProject = (ccrm_parentproject != null) ? ccrm_parentproject : null;
                formContext.getAttribute("ccrm_opportunitycjn").setValue(nodeJobNumber);

                if (nodeJobNumber != null) {
                    numbers = [nodeJobNumber, nodeParentProject];                   
                } else {
                    numbers = [];
                }

            } else {
                Xrm.Navigation.openAlertDialog(this.statusText);
            }
        }
    };
    req.send();
    return numbers;
}

//function to call Available Suffixes webservice
function callSuffixWebService(jobNumber, formContext) {

    formContext.getControl("ccrm_suffix").setDisabled(false);

    var parameters = {};
    parameters.CurrentCJN = jobNumber;

    var req = new XMLHttpRequest();
    req.open("POST", formContext.context.getClientUrl() + "/api/data/v9.1/arup_A1GetSuffices", false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                formContext.getAttribute("ccrm_suffixarray").setValue(results.SuffixList);
                showAvailableSuffixes(results.SuffixList, formContext);
            } else {
                Xrm.Navigation.openAlertDialog(this.statusText);
            }
        }
    };
    req.send(JSON.stringify(parameters));
}

//function showAvailableSuffixes(suffixArray) {
function showAvailableSuffixes(suffixArray, formContext) {
    var suffixArray = formContext.getAttribute("ccrm_suffixarray").getValue();
    if (suffixArray != null) {
        //remove all options
        var exist = formContext.getAttribute("ccrm_assignednumber").getValue();
        if (exist == null) {
            formContext.getControl("ccrm_suffix").clearOptions();
            suffixArray = suffixArray.split(",");
            for (i = 0; i < suffixArray.length; i++) {
                var picklistTextOption = parseInt(suffixArray[i], 10) + 1;
                var option = new Object();
                option.text = suffixArray[i];
                option.value = picklistTextOption;
                if (formContext.getAttribute("ccrm_suffix").getValue() != picklistTextOption) {
                    formContext.getControl("ccrm_suffix").addOption(option);
                }
            }
        }
    }
    //remove 00
    if (formContext.getAttribute("ccrm_suffix").getValue() != 1 && formContext.getAttribute("ccrm_createmethod").getValue() != 2) {
        var suffixControl = formContext.getControl("ccrm_suffix");
        suffixControl.removeOption(1);
    }
}

function exitForm(primaryControl) {
    var formContext = primaryControl;
    //see if the form is dirty
    var ismodified = formContext.data.entity.getIsDirty();
    if (ismodified == false || formContext.ui.getFormType() == 1) {
        formContext.ui.close();
        return;
    }

    if (ismodified == true && formContext.getAttribute("statecode").getValue() != 0) {
        //get list of dirty fields
        var cjnAttributes = formContext.data.entity.attributes.get();
        if (cjnAttributes != null) {
            for (var i in cjnAttributes) {
                if (cjnAttributes[i].getIsDirty()) {
                    formContext.getAttribute(cjnAttributes[i].getName()).setSubmitMode("never");
                }
            }
            setTimeout(function () { formContext.ui.close(); }, 1000);
        }
        return;
    }
}