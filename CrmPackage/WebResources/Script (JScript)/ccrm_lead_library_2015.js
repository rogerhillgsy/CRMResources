var leadOwnerData;
var isMobile;
var relatedNetworksSaved;
var ArupBusinessSaved;
var cachefields = {};

function exitForm(primaryControl) {
    var formContext = primaryControl;
    //see if the form is dirty
    var ismodified = formContext.data.entity.getIsDirty();
    if (ismodified == false) {
        formContext.ui.close();
        return;
    }

    Alert.show('<font face="Segoe UI Light" font size="6" color="#FF9B1E">Warning</font>',
        '<font face="Segoe UI Light" font size="3" color="#000000">Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the lead.</br>Click "Exit Only" button to exit the lead without saving.</font>',
        [
            {
                label: "<b>Save and Exit</b>",
                callback: function () {
                    var leadAttributes = formContext.data.entity.attributes.get();
                    var highlight = true;
                    var cansave = true;
                    if (leadAttributes != null) {
                        for (var i in leadAttributes) {
                            if (leadAttributes[i].getRequiredLevel() == 'required') {
                                highlight = formContext.getAttribute(leadAttributes[i].getName()).getValue() != null;
                                if (highlight == false && cansave == true) { cansave = false; }
                                highlightField(null, '#' + leadAttributes[i].getName(), highlight);
                            }
                        }
                    }
                    if (cansave) { formContext.data.entity.save("saveandclose"); }
                },
                setFocus: true,
                preventClose: false
            },
            {
                label: "<b>Exit Only</b>",
                callback: function () {
                    //get list of dirty fields
                    var leadAttributes = formContext.data.entity.attributes.get();
                    if (leadAttributes != null) {
                        for (var i in leadAttributes) {
                            if (leadAttributes[i].getIsDirty()) {
                                formContext.getAttribute(leadAttributes[i].getName()).setSubmitMode("never");
                            }
                        }
                        setTimeout(function () { formContext.ui.close(); }, 1000);
                    }
                },
                setFocus: false,
                preventClose: false
            }
        ],
        'WARNING', 600, 250, '', true);
}

function highlightField(headerfield, formfield, clear) {
    var bgcolor = 'rgba(255, 179, 179, 1)';
    if (clear == true)
        bgcolor = 'transparent';
    if (headerfield)
        window.parent.$(headerfield).css('background-color', bgcolor);
    if (formfield)
        window.parent.$(formfield).css('background-color', bgcolor);
}

function QualifyLead(primaryControl) {
    var formContext = primaryControl;
    var populated = true;
    //Check if the recommended and required fields have been populated
    formContext.getAttribute(function (attribute, index) {
        if (attribute.getRequiredLevel() == "recommended" || attribute.getRequiredLevel() == "required") {
            if (attribute.getValue() === null) {
                populated = false;
                if (attribute.getRequiredLevel() == "recommended") {
                    attribute.setRequiredLevel("required"); //set required level to required so that users are forced to fill up the fields                        
                }
                //highlightField(null, '#' + attribute.getName(), false);
            }
        }
    });

    if (populated == false) //Give error message if the required fields are not populated
    {
        Alert.show('<font face="Segoe UI Light" size="6" color="#FF0000">Stop</font>',
            '<font face="Segoe UI Light" size="3" color="#000000">Please fill in the mandatory information before converting this Lead to Opportunity</font>',
            [
                {
                    label: "<b>OK</b>",
                    callback: function () {
                        formContext.data.entity.save();
                    },
                    setFocus: true
                },
            ],
            "ERROR", 500, 250, '', true);
    }
    else //Give confirmation message box using Alert.js framework for qualification confirmation
    {
        formContext.data.entity.save();
        Alert.show('<font face="Segoe UI Light" font size="6" color="0472C4">Please Confirm</font>',
            '<font face="Segoe UI Light" font size="3" color="#000000"></br>Are you ready to convert this Lead into an Opportunity?</br></br><b>Be aware that this information is used by other Arup systems and key reports, so it is important that the details are as accurate as possible.</b></br></br>Click "Progress" button to convert the Lead into an Opportunity.</br>Click "Cancel" to return to the Lead form.</font>',
            [
                {
                    label: "<b>Progress</b>",
                    callback: function () {

                        requestLeadQualification(formContext);
                        Alert.show('<font face="Segoe UI Light" size="6" color="0472C4">Creating Opportunity</font>',
                            '<font face="Segoe UI Light" size="3" color="#000000">Please wait...</font>',
                            [],
                            "LOADING", 500, 250, '', true);
                    },
                    setFocus: true,
                    preventClose: false
                },
                {
                    label: "<b>Cancel</b>",
                    callback: function () { },
                    setFocus: false,
                    preventClose: false
                }
            ],
            'QUESTION', 850, 300, '', true);
    }
}

function requestLeadQualification(formContext) {
    //Function to replicate OOTB QualifyLead request generated from the system button
    var currency = formContext.data.entity.attributes.get('transactioncurrencyid');
    if (currency != null) {
        var currencyValue = currency.getValue();
        if (currencyValue != null) {
            var currencyid = currencyValue[0].id;
            currencyid = currencyid.replace('{', '').replace('}', '');
        }
    }
    var leadId = formContext.data.entity.getId();
    leadId = leadId.replace('{', '').replace('}', '');

    var client = formContext.data.entity.attributes.get('ccrm_client');
    if (client != null) {
        var clientValue = client.getValue();
        if (clientValue != null) {
            var clientid = clientValue[0].id;
            clientid = clientid.replace('{', '').replace('}', '');
        }
    }

    var organisationUrl = formContext.context.getClientUrl();
    var UserId = "";
    var query = "/api/data/v9.1/ccrm_arupinterfacesettings?$select=ccrm_setting&$filter=ccrm_name eq ('Arup.QualifyLead.UserId')";

    //Query the id of the user to qualify lead
    var usrreq = new XMLHttpRequest();
    usrreq.open("GET", encodeURI(organisationUrl + query), true);
    usrreq.setRequestHeader("Accept", "application/json");
    usrreq.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    usrreq.setRequestHeader("OData-MaxVersion", "4.0");
    usrreq.setRequestHeader("OData-Version", "4.0");
    usrreq.onreadystatechange = function () {
        if (this.readyState == 4) {
            usrreq.onreadystatechange = null;
            if (this.status == 200) {

                usrresult = JSON.parse(this.response);

                if (usrresult && usrresult.value[0]) {
                    var impersonateUserId = usrresult.value[0].ccrm_setting;
                    //Call action to conver lead to opportunity
                    if (impersonateUserId != null || impersonateUserId != undefined) {
                        var data = {
                            "LeadId": leadId,
                            "CurrencyId": currencyid,
                            "ClientId": clientid
                        };

                        var req = new XMLHttpRequest();
                        req.open("POST", organisationUrl + "/api/data/v9.1/arup_QualifyLead", true);
                        req.setRequestHeader("Accept", "application/json");
                        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                        req.setRequestHeader("OData-MaxVersion", "4.0");
                        req.setRequestHeader("OData-Version", "4.0");
                        req.setRequestHeader("MSCRMCallerID", impersonateUserId);
                        req.onreadystatechange = function () {
                            if (this.readyState == 4) {
                                req.onreadystatechange = null;
                                if (this.status == 200) {
                                    //alert("Action called successfully");
                                    result = JSON.parse(this.response);
                                    Xrm.Utility.openEntityForm("opportunity", result["OpportunityId"]);
                                    Alert.hide();

                                } else {
                                    var qualifyerror = JSON.parse(this.response).error;
                                    alert(qualifyerror.message);
                                }
                            }
                        };

                        req.send(window.JSON.stringify(data));
                    }
                    else {
                        Alert.hide();
                        Alert.show('<font face="Segoe UI Light" size="6" color="#FF0000">Stop</font>',
                            '<font face="Segoe UI Light" size="3" color="#000000">Cannot convert Lead to Opportunity as the System User is not configured. Please contact system administrator</font>',
                            [
                                { label: "<b>OK</b>", setFocus: true },
                            ],
                            "ERROR", 500, 250, '', true);
                    }
                }
                else {
                    Alert.hide();
                    Alert.show('<font face="Segoe UI Light" size="6" color="#FF0000">Stop</font>',
                        '<font face="Segoe UI Light" size="3" color="#000000">Cannot convert Lead to Opportunity as the System User is not configured. Please contact system administrator</font>',
                        [
                            { label: "<b>OK</b>", setFocus: true },
                        ],
                        "ERROR", 500, 250, '', true);
                }
            }
            else {
                var error = JSON.parse(this.response).error;
                alert(error.message);
            }
        }
    };
    usrreq.send(null);
}

function setShortTitle(formContext) {
    if (formContext.getAttribute("firstname").getValue() != null) {
        var x = formContext.getAttribute("firstname").getValue();
        var y = x.replace(/;/g, ' ');
        if (formContext.getAttribute("ccrm_shorttitle").getValue() == null) {
            formContext.getAttribute("ccrm_shorttitle").setValue(y.substring(0, 30));
        }
    }
}

function changeShortTitle(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("firstname").getValue() != null) {
        var x = formContext.getAttribute("firstname").getValue();
        var y = x.replace(/;/g, ' ');
        formContext.getAttribute("ccrm_shorttitle").setValue(y.substring(0, 30));
    }
}

function onchange_projectcountry(executionContext) {
    var formContext = executionContext.getFormContext();
    projectcountry_onchange(null, formContext);
}

function projectcountry_onchange(fromformload, formContext) {
    var CountryName = '';
    if (formContext.getAttribute("ccrm_country").getValue() != null) {
        CountryName = formContext.getAttribute("ccrm_country").getValue()[0].name + '';
        CountryName = CountryName.toUpperCase();

        if (!fromformload) {
            if (CountryName == 'INDIA' || CountryName == 'CANADA' || CountryName == 'UNITED STATES OF AMERICA') {
                formContext.getAttribute("ccrm_arupcompanyid").setValue(null);
                formContext.getAttribute("ccrm_accountingcentreid").setValue(null);
            }
        }

        if (!fromformload) {
            formContext.getAttribute("ccrm_arupusstateid").setValue(null);
        }

        var fieldName = "ccrm_arupcompanyid";
        formContext.getControl(fieldName).addPreSearch(function () { IndiaCompanyFilter(formContext); });

        if (formContext.ui.getFormType() != 1) // not for quick create
        {
            if (CountryName == "INDIA") {
                if (formContext.getAttribute("ccrm_arupcompanyid").getValue() != null) {
                    var companyId = formContext.getAttribute("ccrm_arupcompanyid").getValue()[0].id;

                    if (companyId != null) {
                        Xrm.WebApi.online.retrieveRecord("ccrm_arupcompany", companyId, "?$select=ccrm_arupcompanycode").then(
                            function success(result) {
                                var ccrm_arupcompanycode = result["ccrm_arupcompanycode"];
                                if (ccrm_arupcompanycode != "55" && ccrm_arupcompanycode != "75") {
                                    var fieldName = "ccrm_arupcompanyid";
                                    formContext.getControl(fieldName).addPreSearch(function () { IndiaCompanyFilter(formContext); });
                                }
                            },
                            function (error) {
                                Xrm.Utility.alertDialog(error.message);
                            }
                        );

                        /*
                                              var retrievedreq;
                             SDK.REST.retrieveRecord(companyId, "Ccrm_arupcompany", 'Ccrm_ArupCompanyCode', null, function (responseData) {
                            if (responseData != null) {
                                retrievedreq = responseData;
                                if (retrievedreq.Ccrm_ArupCompanyCode != "55" && retrievedreq.Ccrm_ArupCompanyCode != "75") {
                                    var fieldName = "ccrm_arupcompanyid";
                                    Xrm.Page.getControl(fieldName).addPreSearch(function () { IndiaCompanyFilter(); });
                                }
                            }

                        }, errorHandler, false);*/
                    }
                }
            }
        }
    }
}

function onChange_projectState(executionContext) {
    var formContext = executionContext.getFormContext();
    projectState_onChange(formContext);
}

function projectState_onChange(formContext) {
    var CountryName = '';
    var country = formContext.getAttribute("ccrm_country").getValue();
    var state = formContext.getAttribute("ccrm_arupusstateid").getValue();

    if (country != null && state != null) {
        CountryName = country[0].name + '';
        CountryName = CountryName.toUpperCase();

        var fieldName = "ccrm_arupcompanyid";

        if (formContext.ui.getFormType() != 1) // not for quick create
        {
            if (CountryName == "UNITED STATES OF AMERICA") {
                var stateId = state[0].id;

                Xrm.WebApi.online.retrieveRecord("ccrm_arupusstate", stateId, "?$select=_ccrm_companyid_value").then(
                    function success(result) {
                        var _ccrm_companyid_value = result["_ccrm_companyid_value"];
                        var _ccrm_companyid_value_formatted = result["_ccrm_companyid_value@OData.Community.Display.V1.FormattedValue"];

                        if (_ccrm_companyid_value != null) {
                            var Id = _ccrm_companyid_value;
                            if (Id.indexOf('{') == -1)
                                Id = '{' + Id;
                            if (Id.indexOf('}') == -1)
                                Id = Id + '}';
                            Id = Id.toUpperCase();

                            var lookupValue = new Array();
                            lookupValue[0] = new Object();
                            lookupValue[0].id = Id;
                            lookupValue[0].name = _ccrm_companyid_value_formatted;
                            lookupValue[0].entityType = 'ccrm_arupcompany';
                            formContext.getAttribute('ccrm_arupcompanyid').setValue(lookupValue);
                            formContext.getAttribute("ccrm_arupcompanyid").fireOnChange();
                            // show noticiation
                            formContext.ui.setFormNotification('Please select an Accounting Centre for the selected US State',
                                "WARNING",
                                "statechangefieldreq");
                            setTimeout(function () { formContext.ui.clearFormNotification("statechangefieldreq"); }, 10000);
                            formContext.getControl('ccrm_accountingcentreid').setFocus(true);
                        }
                    },
                    function (error) {
                        Xrm.Utility.alertDialog(error.message);
                    }
                );
            }
        }
    }
}

function FormOnload(executionContext) {
    var formContext = executionContext.getFormContext();
    var procurementType = formContext.getAttribute("ccrm_contractarrangement").getValue();
    if (procurementType != null) {
        cachefields['procurementType'] = procurementType;
    }

    isMobile = (formContext.context.client.getClient() == "Mobile");
    if (formContext.ui.getFormType() == 1) {
        setLeadOwnerDetails(formContext);
        if (formContext.getAttribute("ccrm_client").getValue() == null) {
            setDefaultClientUnassigned(formContext);
        }
    }
    else {

        //relatedNetworksSaved = formContext.getAttribute("ccrm_othernetworks").getValue();
        //save Arup Business
        if (formContext.getAttribute("ccrm_arupbusiness").getValue() != null) {
            ArupBusinessSaved = formContext.getAttribute("ccrm_arupbusiness").getValue()[0].name;
        }

    }

    ccrm_arupbusiness_onChange(false, formContext);
    projectcountry_onchange('formload', formContext);

    setup_optionset_size("ccrm_contractarrangement", 200, 380);
    //setup_display_other_field("ccrm_othernetworksval", "arup_othernetworkdetails", "100000003");

    //Below code is commented by Raul
    //Xrm.Page.getControl("ccrm_othernetworks").setVisible(isMobile);
    //Xrm.Page.getControl("ccrm_ccrm_othernetworksdisp").setVisible(!isMobile);
    ////Xrm.Page.getControl("ccrm_ccrm_othernetworksdisp").setDisabled(isMobile);
    //if (isMobile) {
    //    Xrm.Page.getAttribute("ccrm_othernetworks").setRequiredLevel('required');
    //    Xrm.Page.getAttribute("ccrm_ccrm_othernetworksdisp").setRequiredLevel('none');
    //}
    //else {
    //    Xrm.Page.getAttribute("ccrm_othernetworks").setRequiredLevel('none');
    //    Xrm.Page.getAttribute("ccrm_ccrm_othernetworksdisp").setRequiredLevel('required');
    //}

}

function FormOnSave(executionContext) {
    var formContext = executionContext.getFormContext();
    //syncRelatedNetworks(formContext);
    setShortTitle(formContext);
}

// Calling function commented as The multislect fields wil be deleted - Update 07/04/2020
function syncRelatedNetworks(formContext) {

    var singleSelect = formContext.getAttribute("ccrm_othernetworks").getValue();
    var relatedNetworksCode = Xrm.Page.getAttribute("ccrm_othernetworksval").getValue();

    //for mobile form
    if (isMobile) {

        //check to see if the value of the single select optionset has changed. If it hasn't, then nothing needs to be done
        if (!Xrm.Page.getAttribute('ccrm_othernetworks').getIsDirty()) return;

        //check to see if the value selected in single select already exists in multi select. If this is the case, no need to do anything
        if (relatedNetworksCode != null && relatedNetworksCode.indexOf(singleSelect) != -1) {
            relatedNetworksSaved = singleSelect;
            return;
        }

        //check if single select optionset is empty or multiselect optionset is either empty or has just 1 value
        //in this case just push the new value to *disp and *value fields
        if (relatedNetworksSaved == null || relatedNetworksCode == null || (relatedNetworksCode != null && relatedNetworksCode.indexOf(",") == -1)) {
            Xrm.Page.getAttribute("ccrm_othernetworksval").setValue(String(singleSelect));
            Xrm.Page.getAttribute("ccrm_ccrm_othernetworksdisp").setValue(Xrm.Page.getAttribute("ccrm_othernetworks").getText());
        }
        // check to see if multiselect optionset field has more than 1 value
        //if that's the case, the old values in *disp and *val need to be replaced with the new value from the single select
        else {

            var relatedArrayCode = relatedNetworksCode.split(',');
            var relatedArrayValue = Xrm.Page.getAttribute("ccrm_ccrm_othernetworksdisp").getValue().split(',');
            var entryNum = relatedArrayCode.indexOf(String(relatedNetworksSaved));

            relatedArrayCode[entryNum] = String(singleSelect).trim();
            relatedArrayValue[entryNum] = Xrm.Page.getAttribute("ccrm_othernetworks").getText().trim();

            // make sure to remove all trailing/leading spaces from all array elements
            var arrayLength = relatedArrayValue.length;
            for (var i = 0; i < arrayLength; i++) {
                relatedArrayValue[i] = relatedArrayValue[i].trim();
                relatedArrayCode[i] = relatedArrayCode[i].trim();
            }

            Xrm.Page.getAttribute("ccrm_othernetworksval").setValue(relatedArrayCode.join(','));
            Xrm.Page.getAttribute("ccrm_ccrm_othernetworksdisp").setValue(relatedArrayValue.join(', '));
        }
    }
    //Full WEB client
    else {
        //check if single select is NULL or its value is not contained in the list of the multiselect since multi select is a required field on the full form
        if (singleSelect == null || (singleSelect != null && relatedNetworksCode.indexOf(singleSelect) == -1 && relatedNetworksCode != null)) {
            Xrm.Page.getAttribute("ccrm_othernetworks").setValue(relatedNetworksCode.split(",")[0]);
        }
    }
    //save the current single select in case it's changed later
    relatedNetworksSaved = Xrm.Page.getAttribute("ccrm_othernetworks").getValue();
}

//default the Client to 'Unassigned' record
function setDefaultClientUnassigned(formContext) {
    Xrm.WebApi.online.retrieveRecord("account", "9c3b9071-4d46-e011-9aa7-78e7d1652028", "?$select=accountid,name").then(
        function success(result) {
            var accountid = result["accountid"];
            var name = result["name"];
            SetLookupField(accountid, name, 'account', 'ccrm_client', formContext);
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
}

function errorHandler(error) {

    Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
        '<font size="3" color="#000000"></br>' + error.message + '</font>',
        [
            { label: "<b>OK</b>", setFocus: true },
        ], "ERROR", 500, 350, '', true);
}

function SetLookupField(id, name, entity, field, formContext) {
    if (id != null) {
        if (id.indexOf('{') == -1)
            id = '{' + id;
        if (id.indexOf('}') == -1)
            id = id + '}';
        id = id.toUpperCase();

        var lookup = new Array();
        lookup[0] = new Object();
        lookup[0].id = id;
        lookup[0].name = name;
        lookup[0].entityType = entity;
        formContext.getAttribute(field).setValue(lookup);
    } else {
        formContext.getAttribute(field).setValue(null);
    }
}

if (typeof (FORM_TYPE) === "undefined") FORM_TYPE = { CREATE: 1, UPDATE: 2, QUICK_CREATE: 5, BULK_EDIT: 6 };

function setup_optionset_size(field, height, width) {
    var control = Xrm.Page.getControl(field);
    if (!!control) {
        (Xrm.Page.ui.getFormType() == FORM_TYPE.CREATE ||
            Xrm.Page.ui.getFormType() == FORM_TYPE.UPDATE ||
            Xrm.Page.ui.getFormType() == FORM_TYPE.QUICK_CREATE ||
            Xrm.Page.ui.getFormType() == FORM_TYPE.BULK_EDIT) &&
            window.parent.$(document)
                .ready(function () {
                    window.parent.$("#" + field)
                        .click(function (e) {
                            if (!!height) {
                                window.parent.$("#" + field + "_i").height(height);
                            }
                            if (!!width) {
                                window.parent.$("#" + field + "_i").width(width);
                            }
                        });
                });
    }
}

function setup_display_other_field(otherNetworksVal, otherNetworksDetail, otherCodeValue, isToBeHidden) {
    /// <summary>Setup multi-select picklist so that when "other" is selected, a text field is activated to allow the user to enter the details.</summary>
    var isOtherFieldRequired = otherCodeValue;
    if (typeof (otherCodeValue) != "function") {
        isOtherFieldRequired = function (v) { return typeof (v) == "string" && v.search(otherCodeValue) > -1 || v == otherCodeValue };
    }
    isToBeHidden = isToBeHidden == null ? true : isToBeHidden;
    var attribute = Xrm.Page.getAttribute(otherNetworksVal);
    if (!!attribute) {
        attribute.addOnChange(function () {
            display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
        });

        // If this is a BPF field that we are targeting. Add an additional on Stage change callback to change the required/visible status.
        if (Xrm.Page.ui.getFormType() != FORM_TYPE.CREATE && /^header_process_/.test(otherNetworksDetail)) {
            Xrm.Page.data.process.addOnStageSelected(function () {
                display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
            });
        }
        // Do this twice as header fields get their requirement level set after the onload function runs.
        display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
        setTimeout(function () {
            display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
        }, 1000);
    }
}

function display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden) {

    var value = Xrm.Page.getAttribute(otherNetworksVal).getValue();
    var notApplicable = false;
    var otherNetworkDetails = Xrm.Page.getControl(otherNetworksDetail);

    if (otherNetworksVal == 'ccrm_othernetworksval' && value != null) {
        notApplicable = value.indexOf('770000000') >= 0;
    }

    if (!!otherNetworkDetails) {

        if (otherNetworksVal == 'ccrm_othernetworksval') {

            if (!!value && isOtherFieldRequired(value) && !notApplicable) {

                otherNetworkDetails.getAttribute().setRequiredLevel("required");
                otherNetworkDetails.setVisible(true);
                return;
            } else if (notApplicable) {

                Xrm.Page.getAttribute("ccrm_ccrm_othernetworksdisp").setValue('Not Applicable');
                Xrm.Page.getAttribute("ccrm_othernetworksval").setValue('770000000');
            }

            Xrm.Page.getControl("arup_othernetworkdetails").setVisible(false);
            Xrm.Page.getAttribute("arup_othernetworkdetails").setRequiredLevel('none');
            Xrm.Page.getAttribute("arup_othernetworkdetails").setValue(null);

        }
        else {

            if (!!value && isOtherFieldRequired(value)) {
                otherNetworkDetails.getAttribute().setRequiredLevel("required");
                otherNetworkDetails.setVisible(true);
            } else {
                otherNetworkDetails.getAttribute().setRequiredLevel("none");
                if (isToBeHidden) {
                    otherNetworkDetails.setVisible(false);
                }
            }
        }
    }
}

function set_LeadOwner_Details(executionContext) {
    var formContext = executionContext.getFormContext();
    setLeadOwnerDetails(formContext);
}

function setLeadOwnerDetails(formContext) {
    var ausCompany = new Object();
    //Get details of Lead Owner    
    formContext.getAttribute("ccrm_accountingcentreid").setRequiredLevel('none');
    formContext.getAttribute("ccrm_arupcompanyid").setRequiredLevel('none');

    if (formContext.getAttribute("ownerid").getValue() == null) {
        formContext.getAttribute("ccrm_arupcompanyid").setValue(null);
        formContext.getAttribute("ccrm_accountingcentreid").setValue(null);
        formContext.getAttribute("arup_arupofficeid").setValue(null);
    }
    else {
        var res = new Object();
        Xrm.WebApi.online.retrieveRecord("systemuser", formContext.getAttribute("ownerid").getValue()[0].id, "?$select=_ccrm_accountingcentreid_value,_ccrm_arupcompanyid_value,_ccrm_arupofficeid_value,_ccrm_arupregionid_value").then(
            function success(result) {

                res.userOfficeID = result["_ccrm_arupofficeid_value"];
                var _ccrm_arupofficeid_value_formatted = result["_ccrm_arupofficeid_value@OData.Community.Display.V1.FormattedValue"];

                res.ccrm_arupregioneid = result["_ccrm_arupregionid_value"];
                res.ccrm_arupregionname = result["_ccrm_arupregionid_value@OData.Community.Display.V1.FormattedValue"];

                var userCountry;
                if (res.ccrm_arupregionname == 'Australasia Region' && res.userOfficeID != null) {
                    Xrm.WebApi.online.retrieveRecord("ccrm_arupoffice", res.userOfficeID, "?$select=_ccrm_officecountryid_value").then(
                        function success(result) {
                            var _ccrm_officecountryid_value_formatted = result["_ccrm_officecountryid_value@OData.Community.Display.V1.FormattedValue"];

                            userCountry = _ccrm_officecountryid_value_formatted.toUpperCase();

                            if (result != null && userCountry == 'AUSTRALIA') {
                                ausCompany = getAusCompanyDetails('5002');
                            }
                        },
                        function (error) {
                            Xrm.Utility.alertDialog(error.message);
                        }
                    );
                }
                if (res.userOfficeID != null) {
                    SetLookupField(res.userOfficeID, _ccrm_arupofficeid_value_formatted, 'ccrm_arupoffice', 'arup_arupofficeid', formContext);
                }

                if (result["_ccrm_arupcompanyid_value"] != null || userCountry == 'AUSTRALIA') {
                    res.arupcompanyid = (userCountry == 'AUSTRALIA') ? ausCompany.companyId : result["_ccrm_arupcompanyid_value"];
                    res.arupcompanyname = (userCountry == 'AUSTRALIA') ? ausCompany.CompanyName : result["_ccrm_arupcompanyid_value@OData.Community.Display.V1.FormattedValue"];
                }
                if (result["_ccrm_accountingcentreid_value"] != null || userCountry == 'AUSTRALIA') {
                    res.ccrm_accountingcentreid = (userCountry == 'AUSTRALIA') ? null : result["_ccrm_accountingcentreid_value"];
                    res.ccrm_accountingcentrename = (userCountry == 'AUSTRALIA') ? null : result["_ccrm_accountingcentreid_value@OData.Community.Display.V1.FormattedValue"];
                }

                leadOwnerData = res;

                SetLookupField(res.arupcompanyid, res.arupcompanyname, 'ccrm_arupcompany', 'ccrm_arupcompanyid', formContext);
                formContext.getAttribute("ccrm_arupcompanyid").fireOnChange();
                SetLookupField(res.ccrm_accountingcentreid, res.ccrm_accountingcentrename, 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid', formContext);
                SetLookupField(res.ccrm_arupregioneid, res.ccrm_arupregionname, 'ccrm_arupregion', 'arup_arupregion', formContext);

                if (leadOwnerData.ccrm_accountingcentreid != null)
                    getArupGroup(leadOwnerData.ccrm_accountingcentreid, formContext);
            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        );

        /*SDK.REST.retrieveRecord(formContext.getAttribute("ownerid").getValue()[0].id, "SystemUser", 'Ccrm_ArupRegionId,ccrm_arupcompanyid,ccrm_accountingcentreid,ccrm_arupofficeid', null, function (retrievedreq) {
            if (retrievedreq != null) {
                if (retrievedreq.Ccrm_ArupRegionId != null) {
                    result.ccrm_arupregioneid = retrievedreq.Ccrm_ArupRegionId.Id;
                    result.ccrm_arupregionname = retrievedreq.Ccrm_ArupRegionId.Name;
                    result.userOfficeID = retrievedreq.ccrm_arupofficeid.Id;
                    var userCountry;
                    if (result.ccrm_arupregionname == 'Australasia Region' && result.userOfficeID != null) {

                        SDK.REST.retrieveRecord(result.userOfficeID, 'Ccrm_arupoffice', 'ccrm_officecountryid', null,
                            function (retrievedcountry) {
                                userCountry = retrievedcountry.ccrm_officecountryid.Name.toUpperCase();

                                if (retrievedcountry != null && userCountry == 'AUSTRALIA') {
                                    ausCompany = getAusCompanyDetails('5002');
                                }
                            }, errorHandler, false);
                    }
                }
                if (result.userOfficeID != null) {
                    SetLookupField(result.userOfficeID, retrievedreq.ccrm_arupofficeid.Name, 'ccrm_arupoffice', 'arup_arupofficeid', formContext);
                }

                if (retrievedreq.ccrm_arupcompanyid != null || userCountry == 'AUSTRALIA') {
                    result.arupcompanyid = (userCountry == 'AUSTRALIA') ? ausCompany.companyId : retrievedreq.ccrm_arupcompanyid.Id;
                    result.arupcompanyname = (userCountry == 'AUSTRALIA') ? ausCompany.CompanyName : retrievedreq.ccrm_arupcompanyid.Name;
                }
                if (retrievedreq.ccrm_accountingcentreid != null || userCountry == 'AUSTRALIA') {
                    result.ccrm_accountingcentreid = (userCountry == 'AUSTRALIA') ? null : retrievedreq.ccrm_accountingcentreid.Id;
                    result.ccrm_accountingcentrename = (userCountry == 'AUSTRALIA') ? null : retrievedreq.ccrm_accountingcentreid.Name;
                }

                leadOwnerData = result;

                SetLookupField(result.arupcompanyid, result.arupcompanyname, 'ccrm_arupcompany', 'ccrm_arupcompanyid', formContext);
                formContext.getAttribute("ccrm_arupcompanyid").fireOnChange();
                SetLookupField(result.ccrm_accountingcentreid, result.ccrm_accountingcentrename, 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid', formContext);
                SetLookupField(result.ccrm_arupregioneid, result.ccrm_arupregionname, 'ccrm_arupregion', 'arup_arupregion', formContext);

                if (leadOwnerData.ccrm_accountingcentreid != null)
                    getArupGroup(leadOwnerData.ccrm_accountingcentreid);

            }
        }, errorHandler, false);*/
    }
}

function getAusCompanyDetails(companyCode) {
    var companyDetails = new Object();
    Xrm.WebApi.online.retrieveMultipleRecords("ccrm_arupcompany", "?$select=ccrm_arupcompanyid,ccrm_name&$filter=ccrm_arupcompanycode eq '" + companyCode + "' and  statecode eq 0").then(
        function success(results) {
            for (var i = 0; i < results.entities.length; i++) {
                companyDetails.companyId = results.entities[i]["ccrm_arupcompanyid"];
                companyDetails.CompanyName = results.entities[i]["ccrm_name"];
            }
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
    return companyDetails;
    /*
    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Page.context.getClientUrl() + "/XRMServices/2011/OrganizationData.svc/Ccrm_arupcompanySet?$select=Ccrm_arupcompanyId,Ccrm_name&$filter=Ccrm_ArupCompanyCode eq '" + companyCode + "' and statecode/Value eq 0", false);
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {

            this.onreadystatechange = null;

            if (this.status === 200) {
                var returned = JSON.parse(this.responseText).d;
                var results = returned.results;
                if (results.length > 0) {
                    companyDetails.companyId = results[0].Ccrm_arupcompanyId;
                    companyDetails.CompanyName = results[0].Ccrm_name;
                }
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
    return companyDetails;*/
}

function getArupGroup(accountingcentreId, formContext) {
    accountingcentreId = accountingcentreId.replace('{', '').replace('}', '');
    var query = "/api/data/v9.1/ccrm_arupaccountingcodes(" + accountingcentreId + ")?$expand=ccrm_arupgroupid($select=ccrm_name)";
    var organisationUrl = formContext.context.getClientUrl();

    //Query the id of the user to qualify lead
    var grpreq = new XMLHttpRequest();
    grpreq.open("GET", encodeURI(organisationUrl + query), true);
    grpreq.setRequestHeader("Accept", "application/json");
    grpreq.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    grpreq.setRequestHeader("OData-MaxVersion", "4.0");
    grpreq.setRequestHeader("OData-Version", "4.0");
    grpreq.onreadystatechange = function () {
        if (this.readyState == 4) {
            grpreq.onreadystatechange = null;
            if (this.status == 200) {
                grpresult = JSON.parse(this.response);
                if (grpresult) {
                    var arupgrpID = grpresult._ccrm_arupgroupid_value;
                    var arupgroupName = grpresult.ccrm_arupgroupid.ccrm_name;
                    SetLookupField(arupgrpID, arupgroupName, 'ccrm_arupgroup', 'arup_arupgroup', formContext);
                    getRegion(arupgrpID, formContext);
                }
            }
            else {
                var error = JSON.parse(this.response).error;
                alert(error.message);
                getRegion(null, formContext);
            }
        }
    };
    grpreq.send(null);
}

function ccrm_arupcompanyid_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    var accCenterFilterCode = '';
    var companyvalid = '';
    var companyval = formContext.getAttribute("ccrm_arupcompanyid").getValue();
    if (companyval != null) {
        formContext.getControl('ccrm_accountingcentreid').removePreSearch(AccCentreAddLookupFilter);
        if (formContext.ui.getFormType() == 1) {
            companyvalid = companyval[0].id;
            if (companyvalid != null || companyvalid != undefined) {
                if (companyval[0].id.indexOf("}") > 0)
                    companyvalid = "{" + leadOwnerData.arupcompanyid.toUpperCase() + "}";
                else
                    companyvalid = leadOwnerData.arupcompanyid;
                if (companyval[0].id != companyvalid)
                    formContext.getAttribute("ccrm_accountingcentreid").setValue(null);
                else {
                    SetLookupField(leadOwnerData.ccrm_accountingcentreid, leadOwnerData.ccrm_accountingcentrename, 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid', formContext);
                }
            }
        }
        if (formContext.ui.getFormType() != 1) {
            //CRM2016 Bug 34826
            if (formContext.getAttribute("ccrm_accountingcentreid")) {
                formContext.getAttribute("ccrm_accountingcentreid").setValue(null);
            }
        }

        if (companyval[0].id != null || companyval[0].id != undefined) {
            Xrm.WebApi.online.retrieveRecord("ccrm_arupcompany", companyval[0].id, "?$select=ccrm_acccentrelookupcode").then(
                function success(result) {
                    accCenterFilterCode = result["ccrm_acccentrelookupcode"];
                    selectedCompanyCode = result["ccrm_acccentrelookupcode"];
                },
                function (error) {
                    Xrm.Utility.alertDialog(error.message);
                }
            );

            //SDK.REST.retrieveRecord(companyval[0].id, "Ccrm_arupcompany", 'Ccrm_AccCentreLookupCode', null, function (retrievedreq) {
            //    if (retrievedreq != null) {
            //        accCenterFilterCode = retrievedreq.Ccrm_AccCentreLookupCode;
            //        selectedCompanyCode = retrievedreq.Ccrm_AccCentreLookupCode;
            //    }
            //},
            //    errorHandler, false);

            formContext.getControl('ccrm_accountingcentreid').addPreSearch(function () {
                AccCentreAddLookupFilter(accCenterFilterCode, formContext);
            });
            setTransactionCurrency(companyval[0].id, formContext);
        }

    } else {
        formContext.getControl('ccrm_accountingcentreid').addPreSearch(function () {
            AccCentreResetLookupFilter(formContext);
        });
    }
}

function AccCentreResetLookupFilter(formContext) {
    var fetch =
        "<filter type='and'>" +
        "<condition attribute='ccrm_arupcompanycode' operator='like' value='%%' />" +
        "</filter>";

    formContext.getControl('ccrm_accountingcentreid').addCustomFilter(fetch);
}

function AccCentreAddLookupFilter(accCenterFilterCode, formContext) {
    if (selectedCompanyCode == accCenterFilterCode) {
        var fetch =
            "<filter type='and'>" +
            "<condition attribute='ccrm_arupcompanycode' operator='like' value='%" +
            accCenterFilterCode +
            "%' />" +
            "</filter>";
        formContext.getControl('ccrm_accountingcentreid').addCustomFilter(fetch);
    }
}

function setTransactionCurrency(arupCompanyID, formContext) {
    var lookup = new Array();
    Xrm.WebApi.online.retrieveRecord("ccrm_arupcompany", arupCompanyID, "?$select=_ccrm_currencyid_value").then(
        function success(result) {
            if (result != null) {
                var _ccrm_currencyid_value = result["_ccrm_currencyid_value"];
                var _ccrm_currencyid_value_formatted = result["_ccrm_currencyid_value@OData.Community.Display.V1.FormattedValue"];

                Id = _ccrm_currencyid_value.toUpperCase();

                lookup[0] = new Object();
                lookup[0].entityType = "transactioncurrency";
                if (_ccrm_currencyid_value != null) {
                    lookup[0].id = Id;
                    lookup[0].name = _ccrm_currencyid_value_formatted;
                    if (formContext.getAttribute("ccrm_projectcurrency"))
                        formContext.getAttribute("ccrm_projectcurrency").setValue(lookup);
                }
            } else {
                lookup = GetCurrencyLookup();
                if (formContext.getAttribute("ccrm_projectcurrency"))
                    formContext.getAttribute("ccrm_projectcurrency").setValue(lookup);
            }
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );


    //SDK.REST.retrieveRecord(arupCompanyID, "Ccrm_arupcompany", 'ccrm_currencyid,', null,
    //    function (retrievedreq) {
    //        if (retrievedreq != null) {
    //            var nodeCurrency = retrievedreq.ccrm_currencyid;

    //            var Id = retrievedreq.ccrm_currencyid.Id;
    //            if (Id.indexOf('{') == -1)
    //                Id = '{' + Id;
    //            if (Id.indexOf('}') == -1)
    //                Id = Id + '}';
    //            Id = Id.toUpperCase();

    //            lookup[0] = new Object();
    //            lookup[0].entityType = "transactioncurrency";
    //            if (nodeCurrency != null) {
    //                lookup[0].id = Id;
    //                lookup[0].name = retrievedreq.ccrm_currencyid.Name;
    //                if (Xrm.Page.getAttribute("ccrm_projectcurrency"))
    //                    Xrm.Page.getAttribute("ccrm_projectcurrency").setValue(lookup);
    //            }
    //        } else {
    //            lookup = GetCurrencyLookup();
    //            if (Xrm.Page.getAttribute("ccrm_projectcurrency"))
    //                Xrm.Page.getAttribute("ccrm_projectcurrency").setValue(lookup);
    //        }
    //    }, errorHandler, false);
}

function onchange_ccrm_accountingcentreid(executionContext) {
    var formContext = executionContext.getFormContext();
    ccrm_accountingcentreid_onchange(formContext);
}

function ccrm_accountingcentreid_onchange(formContext) {

    var acccentre = formContext.getAttribute("ccrm_accountingcentreid").getValue();
    if (acccentre != null) {
        var accountingcentreId = acccentre[0].id;
        getArupGroup(accountingcentreId, formContext);
        //the timeout is to allow enough time to populate Arup Region from the previous call
        setTimeout(function () { getArupPractice(accountingcentreId, formContext.getAttribute("arup_arupregion").getValue()[0].id, formContext) }, 2000);
    }
    else {
        formContext.data.entity.attributes.get("arup_arupgroup").setValue(null);
        formContext.data.entity.attributes.get("arup_aruppracticeid").setValue(null);
        getRegion(null, formContext);
    }
}

function getArupPractice(acctCentreId, regionId, formContext) {

    if (acctCentreId == null || regionId == null) {
        formContext.data.entity.attributes.get("arup_aruppracticeid").setValue(null);
        return;
    }

    acctCentreId = acctCentreId.replace("{", "");
    acctCentreId = acctCentreId.replace("}", "");
    regionId = regionId.replace("{", "");
    regionId = regionId.replace("}", "");

    //first get practice code from the Acct. Centre record
    var practiceCode = '';
    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/ccrm_arupaccountingcodes(" + acctCentreId + ")?$select=ccrm_practicecode", true);
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
                practiceCode = result["ccrm_practicecode"];
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();

    //need to pause before fetching arup practice record to wait for the previous call to Acct. Centre to return value of practice code
    setTimeout(function () {

        if (practiceCode == '' || practiceCode == null) {
            formContext.data.entity.attributes.get("arup_aruppracticeid").setValue(null);
            return;
        }

        var req = new XMLHttpRequest();
        req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/ccrm_practiceleaders?$select=ccrm_name,ccrm_practiceleaderid&$filter=_ccrm_arupregionid_value eq " + regionId + " and  ccrm_practicecode eq '" + practiceCode + "'", true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    if (results.value.length > 0) {
                        SetLookupField(results.value[0]["ccrm_practiceleaderid"], results.value[0]["ccrm_name"], 'ccrm_practiceleader', 'arup_aruppracticeid', formContext);
                    }
                    else {

                        formContext.data.entity.attributes.get("arup_aruppracticeid").setValue(null);
                    }

                } else {
                    formContext.data.entity.attributes.get("arup_aruppracticeid").setValue(null);
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();
    }, 2000);
}

function IndiaCompanyFilter(formContext) {
    var fieldName = "ccrm_arupcompanyid";
    var CountryName = formContext.getAttribute("ccrm_country").getValue()[0].name + '';
    if (CountryName.toUpperCase() == 'INDIA') {
        var fetch =
            "<filter type='or'>" +
            "<condition attribute='ccrm_arupcompanycode' operator='like' value='%55%' />" +
            "<condition attribute='ccrm_arupcompanycode' operator='like' value='%75%' />" +
            "</filter>";
        formContext.getControl(fieldName).addCustomFilter(fetch);
    } else {
        var fetch =
            "<filter type='or'>" +
            "<condition attribute='ccrm_arupcompanycode' operator='like' value='%%' />" +
            "</filter>";
        formContext.getControl(fieldName).addCustomFilter(fetch);
    }
}

function getRegion(groupid, formContext) {

    if (groupid == null) {
        formContext.data.entity.attributes.get("arup_arupregion").setValue(null);
        return;
    }

    var organisationUrl = formContext.context.getClientUrl();
    groupid = groupid.replace('{', '').replace('}', '');
    var query = "/api/data/v9.1/ccrm_arupgroups(" + groupid + ")?$select=ccrm_arupgroupid,ccrm_name&$expand=ccrm_arupregionid($select=ccrm_name,ccrm_arupregionid)";

    //Query the id of the user to qualify lead
    var grpreq = new XMLHttpRequest();
    grpreq.open("GET", encodeURI(organisationUrl + query), true);
    grpreq.setRequestHeader("Accept", "application/json");
    grpreq.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    grpreq.setRequestHeader("OData-MaxVersion", "4.0");
    grpreq.setRequestHeader("OData-Version", "4.0");
    grpreq.onreadystatechange = function () {
        if (this.readyState == 4) {
            grpreq.onreadystatechange = null;
            if (this.status == 200) {
                grpresult = JSON.parse(this.response);
                if (grpresult) {
                    var regionID = grpresult.ccrm_arupregionid.ccrm_arupregionid;
                    var regionName = grpresult.ccrm_arupregionid.ccrm_name;
                    SetLookupField(regionID, regionName, 'ccrm_arupregion', 'arup_arupregion', formContext);
                    check_K12(formContext);
                    getRegionalCurrency(regionID, formContext);
                    formContext.getAttribute("arup_arupregion").fireOnChange();
                }
            }
            else {
                var error = JSON.parse(this.response).error;
                alert(error.message);
            }
        }
    };
    grpreq.send(null);
}

function getRegionalCurrency(regionId, formContext) {
    if (regionId == null) {
        formContext.data.entity.attributes.get("arup_regionalcurrency").setValue(null);
        return;
    }
    var organisationUrl = formContext.context.getClientUrl();
    regionId = regionId.replace('{', '').replace('}', '');
    var query = "/api/data/v9.1/ccrm_arupregions(" + regionId + ")?$select=ccrm_arupregionid,ccrm_name&$expand=ccrm_arupregion_transactioncurrencyid($select=currencyname,transactioncurrencyid)";

    //Query the id of the user to qualify lead
    var regreq = new XMLHttpRequest();
    regreq.open("GET", encodeURI(organisationUrl + query), true);
    regreq.setRequestHeader("Accept", "application/json");
    regreq.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    regreq.setRequestHeader("OData-MaxVersion", "4.0");
    regreq.setRequestHeader("OData-Version", "4.0");
    regreq.onreadystatechange = function () {
        if (this.readyState == 4) {
            regreq.onreadystatechange = null;
            if (this.status == 200) {
                regresult = JSON.parse(this.response);
                if (regresult) {
                    var currencyID = regresult.ccrm_arupregion_transactioncurrencyid.transactioncurrencyid;
                    var currencyName = regresult.ccrm_arupregion_transactioncurrencyid.currencyname;
                    SetLookupField(currencyID, currencyName, 'transactioncurrency', 'arup_regionalcurrency', formContext);
                }
            }
            else {
                var error = JSON.parse(this.response).error;
                alert(error.message);
            }
        }
    };
    regreq.send(null);
}

function onChange_ccrm_arupbusiness(executionContext, valueChanged) {
    var formContext = executionContext.getFormContext();
    ccrm_arupbusiness_onChange(valueChanged, formContext);
}

function ccrm_arupbusiness_onChange(valueChanged, formContext) {
    var businessid = formContext.getAttribute('ccrm_arupbusiness').getValue();
    resetSubBusiness(valueChanged, businessid, formContext);
    if (businessid != null && businessid.length > 0) {
        var business = businessid[0].name;
        addEnergy_ProjectSector(business, formContext);
    }
}

function K12_check(executionContext) {
    var formContext = executionContext.getFormContext();
    check_K12(formContext);
}

function check_K12(formContext) {
    var business = formContext.getAttribute('ccrm_arupbusiness').getValue() != null ? formContext.getAttribute('ccrm_arupbusiness').getValue()[0].name : '';
    var region = formContext.getAttribute('arup_arupregion').getValue() != null ? formContext.getAttribute('arup_arupregion').getValue()[0].name : '';

    var visible = region == 'Americas Region' && business == 'Education';
    var required = region == 'Americas Region' && business == 'Education' ? 'required' : 'none';

    formContext.getControl("arup_k12school").setVisible(visible);
    formContext.getAttribute("arup_k12school").setRequiredLevel(required);

    if (!visible) {
        formContext.getAttribute('arup_k12school').setValue(null);
    }
}

//Need to remove the old project sector values as the fields are deleted - Updated 07/04/2020
function addEnergy_ProjectSector(currentBusinessValue, formContext) {
    //check if project sector already has Energy option in it or value of Arup Business hasn't changed
    if (ArupBusinessSaved == currentBusinessValue) {
        return;
    }
    var projectSectorCode = formContext.getAttribute('arup_projectsector_ms').getValue();

    //check to see if Arup Business used to be Energy and Project Sector has the Energy Project Sector option selected, then it needs to be removed
    if (ArupBusinessSaved == 'Energy' && projectSectorCode != null && projectSectorCode.indexOf('13') != -1) {
        var removeValues = [13];
        var updatedValues = RemoveFromArray(projectSectorCode, removeValues);
        formContext.getAttribute("arup_projectsector_ms").setValue(updatedValues);
    }
    //check to see if Arup Business has been changed to Energy and Project Sector doesn't have the Energy Project Sector option selected already
    else if (currentBusinessValue == 'Energy' && (projectSectorCode == null || projectSectorCode.indexOf('13') == -1)) {
        //check to see if multi-select is empty. In this case just push the values into *name & *code fields
        if (projectSectorCode == null) {
            formContext.getAttribute("arup_projectsector_ms").setValue([13]);
        }
        else {
            //need to add to the existing values
            var newValues = [13];
            var updatedValues = ConcatArrays(projectSectorCode, newValues);
            formContext.getAttribute("arup_projectsector_ms").setValue(updatedValues);
        }
    }
    if (formContext.getAttribute("ccrm_arupbusiness").getValue != null)
        ArupBusinessSaved = formContext.getAttribute("ccrm_arupbusiness").getValue()[0].name;

    //var projectSectorCode = formContext.getAttribute('arup_projectsector_ms').getValue();
    //var projectSectorValue = formContext.getAttribute('arup_projectsectorname').getValue();

    ////check to see if Arup Business used to be Energy and Project Sector has the Energy Project Sector option selected, then it needs to be removed
    //if (ArupBusinessSaved == 'Energy' && projectSectorCode != null && projectSectorCode.indexOf('13') != -1) {
    //    //first remove the value
    //    projectSectorCode = projectSectorCode.split(',');
    //    projectSectorValue = projectSectorValue.split(', ');
    //    var entryNum = projectSectorCode.indexOf('13');
    //    var value = removeFromList(formContext.getAttribute('arup_projectsectorvalue').getValue(), '13', ',');
    //    formContext.getAttribute('arup_projectsectorvalue').setValue(value);
    //    value = removeFromList(formContext.getAttribute('arup_projectsectorname').getValue(), 'Energy Project Sector', ', ')
    //    formContext.getAttribute("arup_projectsectorname").setValue(value);
    //}
    ////check to see if Arup Business has been changed to Energy and Project Sector doesn't have the Energy Project Sector option selected already
    //else if (currentBusinessValue == 'Energy' && (projectSectorCode == null || projectSectorCode.indexOf('13') == -1)) {
    //    //check to see if multi-select is empty. In this case just push the values into *name & *code fields
    //    if (projectSectorCode == null) {
    //        formContext.getAttribute('arup_projectsectorvalue').setValue('13');
    //        formContext.getAttribute('arup_projectsectorname').setValue('Energy Project Sector');
    //    }
    //    else {
    //        //need to add to the existing values
    //        formContext.getAttribute('arup_projectsectorvalue').setValue(projectSectorCode + ',13');
    //        formContext.getAttribute('arup_projectsectorname').setValue(formContext.getAttribute('arup_projectsectorname').getValue() + ', Energy Project Sector');
    //    }
    //}

    //formContext.getAttribute('arup_projectsectorvalue').setSubmitMode("always");
    //formContext.getAttribute('arup_projectsectorname').setSubmitMode("always");
}

function resetSubBusiness(valuechanged, businessid, formContext) {
    if (businessid == null || valuechanged || valuechanged == null)
        formContext.getAttribute('arup_subbusiness').setValue(null);

    // disable sub business if either business is NULL or license type is not Professional
    formContext.getControl("arup_subbusiness").setDisabled(businessid == null);
}

function removeFromList(list, value, separator) {
    separator = separator || ",";
    var values = list.split(separator);
    for (var i = 0; i < values.length; i++) {
        if (values[i] == value) {
            values.splice(i, 1);
            return values.join(separator);
        }
    }
    return list;
}
/* Function is not used in Lead entity. Need to remove - Updated 07/04/2020
function setTimeoutfn() {
    setTimeout(procurementTypeFullForm_onChange, 1000);
}

function procurementTypeFullForm_onChange() {
    var confirmButton = new Alert.Button();

    confirmButton.label = "Confirm";

    confirmButton.callback = onConfirmButtonClick;

    var cancelButton = new Alert.Button();

    cancelButton.label = "Cancel";

    cancelButton.callback = onCancelButtonClick;

    var buttonArray = new Array();

    buttonArray.push(confirmButton);
    buttonArray.push(cancelButton);
    Alert.showWebResource("arup_procurementtypesupportingtext", 550, 350, "Do you want to confirm?", buttonArray, null, true, 10);
}

function onConfirmButtonClick() {
    Alert.hide();
}

function onCancelButtonClick() {
    Alert.hide();
    Xrm.Page.getAttribute("ccrm_contractarrangement").setValue(cachefields['procurementType']);
}*/

function ArupRegion_OnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    SetParentOpportunityRequired(formContext);
}

function SetParentOpportunityRequired(formContext) {
    var opportunitytype = formContext.getAttribute("arup_opportunitytype").getValue();
    var arupRegion = formContext.getAttribute("arup_arupregion").getValue();
    var arupRegionName = arupRegion != null ? arupRegion[0].name.toLowerCase() : '';
    var requiredLevel = (opportunitytype == 770000001 || opportunitytype == 770000002 || opportunitytype == 770000006 || (opportunitytype == 770000004 && arupRegionName == 'australasia region')) ? 'required' : 'none';
    formContext.getAttribute("arup_parentopportunityid").setRequiredLevel(requiredLevel);
}

function opportunityType_onChange(executionContext) {
    var formContext = executionContext.getFormContext();
    ParentOpportunityFilter(formContext);
    ParentOpportunity_Onchange(formContext);
}

function Parent_Opportunity_Filter(executionContext) {
    var formContext = executionContext.getFormContext();
    ParentOpportunityFilter(formContext);
}

function ParentOpportunityFilter(formContext) {
    SetParentOpportunityRequired(formContext);
    formContext.getControl("arup_parentopportunityid").addPreSearch(function () { AddParentOpportunityFilter(formContext); });
}

function AddParentOpportunityFilter(formContext) {
    var opportunitytype = formContext.getAttribute("arup_opportunitytype").getValue();
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
    var fetch;
    switch (opportunitytype) {
        case 770000001: /* existing contract */
            if (!arupInternal) {
                fetch = "<filter type='and'>" +
                    "<condition attribute='statecode' operator='eq' value='1' />" +
                    "</filter>";
            }
            else {
                fetch = "<filter type='and'>" +
                    "<condition attribute='statecode' operator='eq' value='0' />" +
                    "</filter>";
            }
            break;
        case 770000002: /* new contract */
            if (!arupInternal) {
                fetch = "<filter type='and'>" +
                    "<filter type='or'>" +
                    "<condition attribute='statecode' operator='eq' value='0' />" +
                    "<condition attribute='statecode' operator='eq' value='1' />" +
                    "</filter>" +
                    "</filter>";
            }
            else {
                fetch = "<filter type='and'>" +
                    "<condition attribute='statecode' operator='eq' value='0' />" +
                    "</filter>";
            }
            break;
        case 770000006:
            fetch = "<filter type='and'>" +
                "<condition attribute='arup_opportunitytype' operator='eq' value='770000005' />" +
                "</filter>";
            break;
    }

    if (fetch != "") {
        //formContext.getControl("arup_parentopportunityid").addCustomFilter(fetch);
        formContext.getControl("arup_parentopportunityid").addPreSearch(function () {
            formContext.getControl("arup_parentopportunityid").addCustomFilter(fetch);
        });
    }
}

function Onchange_ParentOpportunity(executionContext) {
    var formContext = executionContext.getFormContext();
    ParentOpportunity_Onchange(formContext);
}

function ParentOpportunity_Onchange(formContext) {
    var parentOpportunity = formContext.getAttribute("arup_parentopportunityid").getValue();
    if (parentOpportunity != null && parentOpportunity != "undefined") {
        PullParentOpportunityDetailsForDiffOpportunityType(parentOpportunity, formContext);
    }
}

function PullParentOpportunityDetailsForDiffOpportunityType(parentOpportunity, formContext) {
    var opportunitytype = formContext.getAttribute("arup_opportunitytype").getValue();
    if (opportunitytype == null) { return; }
    if (opportunitytype == '770000001' && formContext.ui.getFormType() != 1) {

        var parentOpportunityId = parentOpportunity[0].id.replace('{', '').replace('}', '');

        var req = new XMLHttpRequest();
        if (opportunitytype == '770000001') {
            req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/opportunities?$select=ccrm_contractarrangement&$filter=opportunityid eq " + parentOpportunityId + "", true);
        }

        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    AssignDetailsFromParentOpportunity(results, formContext);
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();
    }
}

function AssignDetailsFromParentOpportunity(results, formContext) {
    if (results.value.length > 0) {
        AssignDetailsWhenOpportunityTypeExistingContract(results, formContext);
    }
}

function AssignDetailsWhenOpportunityTypeExistingContract(results, formContext) {
    if (formContext.ui.getFormType() != 1) {
        formContext.getAttribute("ccrm_contractarrangement").setValue(results.value[0]["ccrm_contractarrangement"]);
    }
}

function GetMultiSelect(executionContext) {
    var formContext = executionContext.getFormContext();
    var selectedValues = formContext.getAttribute("arup_globalservices").getValue();
    var otherOption = selectedValues.includes(100000003);
    var notApplicable = selectedValues.includes(770000000);
    var length = selectedValues.length;

    if (notApplicable) {
        if (selectedValues.length > 1) {
            formContext.ui.setFormNotification('You have selected "Not Applicable" option for Global Services. This will not allow you to add more options.', 'WARNING', '3');
            setTimeout(function () { formContext.ui.clearFormNotification('3'); }, 10000);
            formContext.getControl("arup_othernetworkdetails").setVisible(false);
            formContext.getAttribute("arup_othernetworkdetails").setRequiredLevel('none');
        }
        formContext.getAttribute("arup_globalservices").setValue([770000000]);
        return;
    }

    if (length > 3) {
        formContext.getControl("arup_globalservices").setNotification('Selection is limited to 3 choices');
    } else {
        formContext.getControl("arup_globalservices").clearNotification();
    }

    if (otherOption) {
        formContext.getControl("arup_othernetworkdetails").setVisible(true);
        formContext.getAttribute("arup_othernetworkdetails").setRequiredLevel('required');
    } else {
        formContext.getControl("arup_othernetworkdetails").setVisible(false);
        formContext.getAttribute("arup_othernetworkdetails").setRequiredLevel('none');
    }
}