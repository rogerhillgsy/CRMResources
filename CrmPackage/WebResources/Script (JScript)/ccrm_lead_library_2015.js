var leadOwnerData;
var isMobile;
var relatedNetworksSaved;
var ArupBusinessSaved;
var cachefields = {};

function exitForm() {

    //see if the form is dirty
    var ismodified = Xrm.Page.data.entity.getIsDirty();
    if (ismodified == false) {
        Xrm.Page.ui.close();
        return;
    }

    Alert.show('<font face="Segoe UI Light" font size="6" color="#FF9B1E">Warning</font>',
        '<font face="Segoe UI Light" font size="3" color="#000000">Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the lead.</br>Click "Exit Only" button to exit the lead without saving.</font>',
        [
            {
                label: "<b>Save and Exit</b>",
                callback: function () {
                    var leadAttributes = Xrm.Page.data.entity.attributes.get();
                    var highlight = true;
                    var cansave = true;
                    if (leadAttributes != null) {
                        for (var i in leadAttributes) {
                            if (leadAttributes[i].getRequiredLevel() == 'required') {
                                highlight = Xrm.Page.getAttribute(leadAttributes[i].getName()).getValue() != null;
                                if (highlight == false && cansave == true) { cansave = false; }
                                highlightField(null, '#' + leadAttributes[i].getName(), highlight);
                            }
                        }
                    }
                    if (cansave) { Xrm.Page.data.entity.save("saveandclose"); }
                },
                setFocus: true,
                preventClose: false
            },
            {
                label: "<b>Exit Only</b>",
                callback: function () {
                    //get list of dirty fields
                    var leadAttributes = Xrm.Page.data.entity.attributes.get();
                    if (leadAttributes != null) {
                        for (var i in leadAttributes) {
                            if (leadAttributes[i].getIsDirty()) {
                                Xrm.Page.getAttribute(leadAttributes[i].getName()).setSubmitMode("never");
                            }
                        }
                        setTimeout(function () { Xrm.Page.ui.close(); }, 1000);
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

function QualifyLead() {
    //debugger;
    var populated = true;
    //Check if the recommended and required fields have been populated
    Xrm.Page.getAttribute(function (attribute, index) {
        if (attribute.getRequiredLevel() == "recommended" || attribute.getRequiredLevel() == "required") {
            if (attribute.getValue() === null) {
                populated = false;
                /* if (attribute.getRequiredLevel() == "recommended")
                {
                    attribute.setRequiredLevel("required"); //set required level to required so that users are forced to fill up the fields                        
                }*/
                highlightField(null, '#' + attribute.getName(), false);
            }
        }
    });

    if (populated == false) //Give error message if the required fields are not populated
    {
        Alert.show('<font face="Segoe UI Light" size="6" color="#FF0000">Stop</font>',
            '<font face="Segoe UI Light" size="3" color="#000000">Please fill in the mandatory information before converting this Lead to Opportunity</font>',
            [
                { label: "<b>OK</b>", setFocus: true },
            ],
            "ERROR", 500, 250, '', true);
    }
    else //Give confirmation message box using Alert.js framework for qualification confirmation
    {
        Xrm.Page.data.entity.save();
        Alert.show('<font face="Segoe UI Light" font size="6" color="0472C4">Please Confirm</font>',
            '<font face="Segoe UI Light" font size="3" color="#000000"></br>Are you ready to convert this Lead into an Opportunity?</br></br><b>Be aware that this information is used by other Arup systems and key reports, so it is important that the details are as accurate as possible.</b></br></br>Click "Progress" button to convert the Lead into an Opportunity.</br>Click "Cancel" to return to the Lead form.</font>',
            [
                {
                    label: "<b>Progress</b>",
                    callback: function () {

                        requestLeadQualification();
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

function requestLeadQualification() {
    //debugger;
    //Function to replicate OOTB QualifyLead request generated from the system button
    //var callerId = "9E969E63-93BB-E611-80F4-005056B55B13";
    //Get currency id for creation of Qualify Lead Request
    var currency = Xrm.Page.data.entity.attributes.get('transactioncurrencyid');
    if (currency != null) {
        var currencyValue = currency.getValue();
        if (currencyValue != null) {
            var currencyid = currencyValue[0].id;
            currencyid = currencyid.replace('{', '').replace('}', '');
        }
    }
    var leadId = Xrm.Page.data.entity.getId();
    leadId = leadId.replace('{', '').replace('}', '');

    var client = Xrm.Page.data.entity.attributes.get('ccrm_client');
    if (client != null) {
        var clientValue = client.getValue();
        if (clientValue != null) {
            var clientid = clientValue[0].id;
            clientid = clientid.replace('{', '').replace('}', '');
        }
    }

    var organisationUrl = Xrm.Page.context.getClientUrl();
    var UserId = "";
    var query = "/api/data/v8.1/ccrm_arupinterfacesettings?$select=ccrm_setting&$filter=ccrm_name eq ('Arup.QualifyLead.UserId')";

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
                        req.open("POST", organisationUrl + "/api/data/v8.1/arup_QualifyLead", true);
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

function setShortTitle() {
    if (Xrm.Page.getAttribute("firstname").getValue() != null) {
        var x = Xrm.Page.getAttribute("firstname").getValue();
        var y = x.replace(/;/g, ' ');
        if (Xrm.Page.getAttribute("ccrm_shorttitle").getValue() == null) {
            Xrm.Page.getAttribute("ccrm_shorttitle").setValue(y.substring(0, 30));
        }
    }
}

function changeShortTitle() {
    if (Xrm.Page.getAttribute("firstname").getValue() != null) {
        var x = Xrm.Page.getAttribute("firstname").getValue();
        var y = x.replace(/;/g, ' ');
        Xrm.Page.getAttribute("ccrm_shorttitle").setValue(y.substring(0, 30));
    }
}

function projectcountry_onchange(fromformload) {

    var CountryName = '';
    if (Xrm.Page.getAttribute("ccrm_country").getValue() != null) {
        CountryName = Xrm.Page.getAttribute("ccrm_country").getValue()[0].name + '';
        CountryName = CountryName.toUpperCase();

        if (!fromformload) {
            if (CountryName == 'INDIA' || CountryName == 'CANADA' || CountryName == 'UNITED STATES OF AMERICA') {
                Xrm.Page.getAttribute("ccrm_arupcompanyid").setValue(null);
                Xrm.Page.getAttribute("ccrm_accountingcentreid").setValue(null);
            }
        }

        if (!fromformload) {
            Xrm.Page.getAttribute("ccrm_arupusstateid").setValue(null);
        }
        //Xrm.Page.getControl("ccrm_arupusstateid").addPreSearch(function () { stateCountryLookupAddFilter(); });

        var fieldName = "ccrm_arupcompanyid";
        Xrm.Page.getControl(fieldName).addPreSearch(function () { IndiaCompanyFilter(); });

        if (Xrm.Page.ui.getFormType() != 1) // not for quick create
        {
            if (CountryName == "INDIA") {
                if (Xrm.Page.getAttribute("ccrm_arupcompanyid").getValue() != null) {
                    var companyId = Xrm.Page.getAttribute("ccrm_arupcompanyid").getValue()[0].id;
                    var retrievedreq;
                    if (companyId != null) {
                        SDK.REST.retrieveRecord(companyId, "Ccrm_arupcompany", 'Ccrm_ArupCompanyCode', null, function (responseData) {
                            if (responseData != null) {
                                retrievedreq = responseData;
                                if (retrievedreq.Ccrm_ArupCompanyCode != "55" && retrievedreq.Ccrm_ArupCompanyCode != "75") {
                                    var fieldName = "ccrm_arupcompanyid";
                                    Xrm.Page.getControl(fieldName).addPreSearch(function () { IndiaCompanyFilter(); });
                                }
                            }

                        }, errorHandler, false);
                    }

                }
            }
        }
    }
}

function projectState_onChange() {
    var CountryName = '';
    if (Xrm.Page.getAttribute("ccrm_country").getValue()[0] && Xrm.Page.getAttribute("ccrm_arupusstateid").getValue()[0]) {
        CountryName = Xrm.Page.getAttribute("ccrm_country").getValue()[0].name + '';
        CountryName = CountryName.toUpperCase();

        var fieldName = "ccrm_arupcompanyid";

        if (Xrm.Page.ui.getFormType() != 1) // not for quick create
        {
            if (CountryName == "UNITED STATES OF AMERICA") {
                var stateId = Xrm.Page.getAttribute("ccrm_arupusstateid").getValue()[0].id;
                SDK.REST.retrieveRecord(stateId, "Ccrm_arupusstate", 'ccrm_companyid', null, function (responseData) {
                    if (responseData != null) {
                        if (responseData.ccrm_companyid.Id != null) {
                            var Id = responseData.ccrm_companyid.Id;
                            if (Id.indexOf('{') == -1)
                                Id = '{' + Id;
                            if (Id.indexOf('}') == -1)
                                Id = Id + '}';
                            Id = Id.toUpperCase();

                            var lookupValue = new Array();
                            lookupValue[0] = new Object();
                            lookupValue[0].id = Id;
                            lookupValue[0].name = responseData.ccrm_companyid.Name;
                            lookupValue[0].entityType = 'ccrm_arupcompany';
                            Xrm.Page.getAttribute('ccrm_arupcompanyid').setValue(lookupValue);
                            Xrm.Page.getAttribute("ccrm_arupcompanyid").fireOnChange();
                            // show noticiation
                            Xrm.Page.ui
                                .setFormNotification('Please select an Accounting Centre for the selected US State',
                                    "WARNING",
                                    "statechangefieldreq");
                            setTimeout(function () { Xrm.Page.ui.clearFormNotification("statechangefieldreq"); }, 10000);
                            Xrm.Page.getControl('ccrm_accountingcentreid').setFocus(true);
                        }
                    }
                },
                    errorHandler,
                    false);
            }
        }
    }
}

function FormOnload() {
    //currUserData = getCurrentUserDetails(Xrm.Page.context.getUserId());
    var procurementType = Xrm.Page.getAttribute("ccrm_contractarrangement").getValue();
    //debugger;
    if (procurementType != null) {
        cachefields['procurementType'] = procurementType;
    }

    isMobile = (Xrm.Page.context.client.getClient() == "Mobile");


    if (Xrm.Page.ui.getFormType() == 1) {

        setLeadOwnerDetails();

        if (Xrm.Page.getAttribute("ccrm_client").getValue() == null) {
            setDefaultClientUnassigned();
        }
    }
    else {

        relatedNetworksSaved = Xrm.Page.getAttribute("ccrm_othernetworks").getValue();
        //procurement_type_onchange();
        //save Arup Business
        if (Xrm.Page.getAttribute("ccrm_arupbusiness").getValue() != null) {
            ArupBusinessSaved = Xrm.Page.getAttribute("ccrm_arupbusiness").getValue()[0].name;
        }

    }

    ccrm_arupbusiness_onChange(false);
    projectcountry_onchange('formload');

    setup_optionset_size("ccrm_contractarrangement", 200, 380);
    setup_display_other_field("ccrm_othernetworksval", "arup_othernetworkdetails", "100000003");

    Xrm.Page.getControl("ccrm_othernetworks").setVisible(isMobile);
    Xrm.Page.getControl("ccrm_ccrm_othernetworksdisp").setVisible(!isMobile);
    //Xrm.Page.getControl("ccrm_ccrm_othernetworksdisp").setDisabled(isMobile);
    if (isMobile) {
        Xrm.Page.getAttribute("ccrm_othernetworks").setRequiredLevel('required');
        Xrm.Page.getAttribute("ccrm_ccrm_othernetworksdisp").setRequiredLevel('none');
    }
    else {
        Xrm.Page.getAttribute("ccrm_othernetworks").setRequiredLevel('none');
        Xrm.Page.getAttribute("ccrm_ccrm_othernetworksdisp").setRequiredLevel('required');
    }

}

function FormOnSave() {

    syncRelatedNetworks();
    setShortTitle();

}

function syncRelatedNetworks() {

    var singleSelect = Xrm.Page.getAttribute("ccrm_othernetworks").getValue();
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
function setDefaultClientUnassigned() {
    SDK.REST.retrieveMultipleRecords("Account",
        "$select=AccountId,Name&$top=1&$filter=Name eq 'Unassigned'",
        function (results) {
            if (results.length > 0) {
                SetLookupField(results[0].AccountId, results[0].Name, 'account', 'ccrm_client');
            }
        },
        errorHandler, function () { }, false);
}

function errorHandler(error) {

    Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
        '<font size="3" color="#000000"></br>' + error.message + '</font>',
        [
            { label: "<b>OK</b>", setFocus: true },
        ], "ERROR", 500, 350, '', true);
}

function SetLookupField(id, name, entity, field) {
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
        Xrm.Page.getAttribute(field).setValue(lookup);
    } else {
        Xrm.Page.getAttribute(field).setValue(null);
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

function setLeadOwnerDetails() {

    var ausCompany = new Object();

    //Get details of Lead Owner    
    Xrm.Page.getAttribute("ccrm_accountingcentreid").setRequiredLevel('none');
    Xrm.Page.getAttribute("ccrm_arupcompanyid").setRequiredLevel('none');

    if (Xrm.Page.getAttribute("ownerid").getValue() == null) {
        Xrm.Page.getAttribute("ccrm_arupcompanyid").setValue(null);
        Xrm.Page.getAttribute("ccrm_accountingcentreid").setValue(null);
        Xrm.Page.getAttribute("arup_arupofficeid").setValue(null);
    }
    else {

        var result = new Object();

        SDK.REST.retrieveRecord(Xrm.Page.getAttribute("ownerid").getValue()[0].id, "SystemUser", 'Ccrm_ArupRegionId,ccrm_arupcompanyid,ccrm_accountingcentreid,ccrm_arupofficeid', null, function (retrievedreq) {

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
                    SetLookupField(result.userOfficeID, retrievedreq.ccrm_arupofficeid.Name, 'ccrm_arupoffice', 'arup_arupofficeid');
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

                SetLookupField(result.arupcompanyid, result.arupcompanyname, 'ccrm_arupcompany', 'ccrm_arupcompanyid');
                Xrm.Page.getAttribute("ccrm_arupcompanyid").fireOnChange();
                SetLookupField(result.ccrm_accountingcentreid, result.ccrm_accountingcentrename, 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid');
                SetLookupField(result.ccrm_arupregioneid, result.ccrm_arupregionname, 'ccrm_arupregion', 'arup_arupregion');

                if (leadOwnerData.ccrm_accountingcentreid != null)
                    getArupGroup(leadOwnerData.ccrm_accountingcentreid);

            }
        }, errorHandler, false);
    }
}

function getAusCompanyDetails(companyCode) {

    var companyDetails = new Object();

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
    return companyDetails;
}

function getArupGroup(accountingcentreId) {

    accountingcentreId = accountingcentreId.replace('{', '').replace('}', '');

    var query = "/api/data/v8.1/ccrm_arupaccountingcodes(" + accountingcentreId + ")?$expand=ccrm_arupgroupid($select=ccrm_name)";
    var organisationUrl = Xrm.Page.context.getClientUrl();

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
                    //Call action to conver lead to opportunity
                    SetLookupField(arupgrpID, arupgroupName, 'ccrm_arupgroup', 'arup_arupgroup');
                    getRegion(arupgrpID);
                }
            }
            else {
                var error = JSON.parse(this.response).error;
                alert(error.message);
                getRegion(null);
            }
        }
    };
    grpreq.send(null);
}

function ccrm_arupcompanyid_onchange() {

    var accCenterFilterCode = '';
    var companyvalid = '';
    var companyval = Xrm.Page.getAttribute("ccrm_arupcompanyid").getValue();
    if (companyval != null) {
        Xrm.Page.getControl('ccrm_accountingcentreid').removePreSearch(AccCentreAddLookupFilter);
        if (Xrm.Page.ui.getFormType() == 1) {
            companyvalid = companyval[0].id;
            if (companyvalid != null || companyvalid != undefined) {
                if (companyval[0].id.indexOf("}") > 0)
                    companyvalid = "{" + leadOwnerData.arupcompanyid.toUpperCase() + "}";
                else
                    companyvalid = leadOwnerData.arupcompanyid;
                if (companyval[0].id != companyvalid)
                    Xrm.Page.getAttribute("ccrm_accountingcentreid").setValue(null);
                else {
                    SetLookupField(leadOwnerData.ccrm_accountingcentreid, leadOwnerData.ccrm_accountingcentrename, 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid');
                }
            }

        }
        if (Xrm.Page.ui.getFormType() != 1) {
            //CRM2016 Bug 34826
            if (Xrm.Page.getAttribute("ccrm_accountingcentreid")) {
                Xrm.Page.getAttribute("ccrm_accountingcentreid").setValue(null);

            }
        }
        //;

        if (companyval[0].id != null || companyval[0].id != undefined) {
            SDK.REST.retrieveRecord(companyval[0].id, "Ccrm_arupcompany", 'Ccrm_AccCentreLookupCode', null, function (retrievedreq) {
                if (retrievedreq != null) {
                    accCenterFilterCode = retrievedreq.Ccrm_AccCentreLookupCode;
                    selectedCompanyCode = retrievedreq.Ccrm_AccCentreLookupCode;
                }
            },
                errorHandler, false);

            Xrm.Page.getControl('ccrm_accountingcentreid').addPreSearch(function () {
                AccCentreAddLookupFilter(accCenterFilterCode);
            });
            setTransactionCurrency(companyval[0].id);
        }

    } else {
        Xrm.Page.getControl('ccrm_accountingcentreid').addPreSearch(function () {
            AccCentreResetLookupFilter();
        });
    }
}

function AccCentreResetLookupFilter() {
    var fetch =
        "<filter type='and'>" +
        "<condition attribute='ccrm_arupcompanycode' operator='like' value='%%' />" +
        "</filter>";

    Xrm.Page.getControl('ccrm_accountingcentreid').addCustomFilter(fetch);
}

function AccCentreAddLookupFilter(accCenterFilterCode) {
    if (selectedCompanyCode == accCenterFilterCode) {
        var fetch =
            "<filter type='and'>" +
            "<condition attribute='ccrm_arupcompanycode' operator='like' value='%" +
            accCenterFilterCode +
            "%' />" +
            "</filter>";
        Xrm.Page.getControl('ccrm_accountingcentreid').addCustomFilter(fetch);
    }
}

function setTransactionCurrency(arupCompanyID) {
    var lookup = new Array();
    SDK.REST.retrieveRecord(arupCompanyID, "Ccrm_arupcompany", 'ccrm_currencyid,', null,
        function (retrievedreq) {
            if (retrievedreq != null) {
                var nodeCurrency = retrievedreq.ccrm_currencyid;

                var Id = retrievedreq.ccrm_currencyid.Id;
                if (Id.indexOf('{') == -1)
                    Id = '{' + Id;
                if (Id.indexOf('}') == -1)
                    Id = Id + '}';
                Id = Id.toUpperCase();

                lookup[0] = new Object();
                lookup[0].entityType = "transactioncurrency";
                if (nodeCurrency != null) {
                    lookup[0].id = Id;
                    lookup[0].name = retrievedreq.ccrm_currencyid.Name;
                    if (Xrm.Page.getAttribute("ccrm_projectcurrency"))
                        Xrm.Page.getAttribute("ccrm_projectcurrency").setValue(lookup);
                }
            } else {
                lookup = GetCurrencyLookup();
                if (Xrm.Page.getAttribute("ccrm_projectcurrency"))
                    Xrm.Page.getAttribute("ccrm_projectcurrency").setValue(lookup);
            }
        }, errorHandler, false);
}

function ccrm_accountingcentreid_onchange() {

    var acccentre = Xrm.Page.getAttribute("ccrm_accountingcentreid").getValue();
    if (acccentre != null) {
        var accountingcentreId = acccentre[0].id;
        getArupGroup(accountingcentreId);
        //the timeout is to allow enough time to populate Arup Region from the previous call
        setTimeout(function () { getArupPractice(accountingcentreId, Xrm.Page.getAttribute("arup_arupregion").getValue()[0].id) }, 2000);
    }
    else {
        Xrm.Page.data.entity.attributes.get("arup_arupgroup").setValue(null);
        Xrm.Page.data.entity.attributes.get("arup_aruppracticeid").setValue(null);
        getRegion(null);
    }
}

function getArupPractice(acctCentreId, regionId) {

    if (acctCentreId == null || regionId == null) {
        Xrm.Page.data.entity.attributes.get("arup_aruppracticeid").setValue(null);
        return;
    }

    acctCentreId = acctCentreId.replace("{", "");
    acctCentreId = acctCentreId.replace("}", "");
    regionId = regionId.replace("{", "");
    regionId = regionId.replace("}", "");

    //first get practice code from the Acct. Centre record
    var practiceCode = '';
    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/ccrm_arupaccountingcodes(" + acctCentreId + ")?$select=ccrm_practicecode", true);
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
            Xrm.Page.data.entity.attributes.get("arup_aruppracticeid").setValue(null);
            return;
        }

        //having practice code and region, find the practice
        var practiceId;
        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/ccrm_practiceleaders?$select=ccrm_name,ccrm_practiceleaderid&$filter=_ccrm_arupregionid_value eq " + regionId + " and  ccrm_practicecode eq '" + practiceCode + "'", true);
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
                        SetLookupField(results.value[0]["ccrm_practiceleaderid"], results.value[0]["ccrm_name"], 'ccrm_practiceleader', 'arup_aruppracticeid');
                    }
                    else {

                        Xrm.Page.data.entity.attributes.get("arup_aruppracticeid").setValue(null);
                    }

                } else {
                    Xrm.Page.data.entity.attributes.get("arup_aruppracticeid").setValue(null);
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();
    }, 2000);
}

function IndiaCompanyFilter() {
    var fieldName = "ccrm_arupcompanyid";
    var CountryName = Xrm.Page.getAttribute("ccrm_country").getValue()[0].name + '';
    if (CountryName.toUpperCase() == 'INDIA') {
        var fetch =
            "<filter type='or'>" +
            "<condition attribute='ccrm_arupcompanycode' operator='like' value='%55%' />" +
            "<condition attribute='ccrm_arupcompanycode' operator='like' value='%75%' />" +
            "</filter>";
        Xrm.Page.getControl(fieldName).addCustomFilter(fetch);
    } else {
        var fetch =
            "<filter type='or'>" +
            "<condition attribute='ccrm_arupcompanycode' operator='like' value='%%' />" +
            "</filter>";
        Xrm.Page.getControl(fieldName).addCustomFilter(fetch);
    }
}

function getRegion(groupid) {

    if (groupid == null) {
        Xrm.Page.data.entity.attributes.get("arup_arupregion").setValue(null);
        return;
    }

    var organisationUrl = Xrm.Page.context.getClientUrl();
    groupid = groupid.replace('{', '').replace('}', '');
    var query = "/api/data/v8.1/ccrm_arupgroups(" + groupid + ")?$select=ccrm_arupgroupid,ccrm_name&$expand=ccrm_arupregionid($select=ccrm_name,ccrm_arupregionid)";

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
                    SetLookupField(regionID, regionName, 'ccrm_arupregion', 'arup_arupregion');
                    check_K12();
                    getRegionalCurrency(regionID);
                    Xrm.Page.getAttribute("arup_arupregion").fireOnChange();
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

function getRegionalCurrency(regionId) {
    if (regionId == null) {
        Xrm.Page.data.entity.attributes.get("arup_regionalcurrency").setValue(null);
        return;
    }

    var organisationUrl = Xrm.Page.context.getClientUrl();

    regionId = regionId.replace('{', '').replace('}', '');

    var query = "/api/data/v8.1/ccrm_arupregions(" + regionId + ")?$select=ccrm_arupregionid,ccrm_name&$expand=ccrm_arupregion_transactioncurrencyid($select=currencyname,transactioncurrencyid)";

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
                    SetLookupField(currencyID, currencyName, 'transactioncurrency', 'arup_regionalcurrency');

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

function ccrm_arupbusiness_onChange(valueChanged) {

    var businessid = Xrm.Page.getAttribute('ccrm_arupbusiness').getValue();

    resetSubBusiness(valueChanged, businessid);

    if (businessid != null && businessid.length > 0) {
        var business = businessid[0].name;
        addEnergy_ProjectSector(business);
    }


}

function check_K12() {

    var business = Xrm.Page.getAttribute('ccrm_arupbusiness').getValue() != null ? Xrm.Page.getAttribute('ccrm_arupbusiness').getValue()[0].name : '';
    var region = Xrm.Page.getAttribute('arup_arupregion').getValue() != null ? Xrm.Page.getAttribute('arup_arupregion').getValue()[0].name : '';

    var visible = region == 'Americas Region' && business == 'Education';
    var required = region == 'Americas Region' && business == 'Education' ? 'required' : 'none';

    Xrm.Page.getControl("arup_k12school").setVisible(visible);
    Xrm.Page.getAttribute("arup_k12school").setRequiredLevel(required);

    if (!visible) {
        Xrm.Page.getAttribute('arup_k12school').setValue(null);
    }
}

function addEnergy_ProjectSector(currentBusinessValue) {

    var projectSectorCode = Xrm.Page.getAttribute('arup_projectsectorvalue').getValue();
    var projectSectorValue = Xrm.Page.getAttribute('arup_projectsectorname').getValue();

    //check if project sector already has Energy option in it or value of Arup Business hasn't changed
    if (ArupBusinessSaved == currentBusinessValue) {
        return;
    }

    //check to see if Arup Business used to be Energy and Project Sector has the Energy Project Sector option selected, then it needs to be removed
    if (ArupBusinessSaved == 'Energy' && projectSectorCode != null && projectSectorCode.indexOf('13') != -1) {

        //first remove the value
        projectSectorCode = projectSectorCode.split(',');
        projectSectorValue = projectSectorValue.split(', ');
        var entryNum = projectSectorCode.indexOf('13');
        var value = removeFromList(Xrm.Page.getAttribute('arup_projectsectorvalue').getValue(), '13', ',');
        Xrm.Page.getAttribute('arup_projectsectorvalue').setValue(value);
        value = removeFromList(Xrm.Page.getAttribute('arup_projectsectorname').getValue(), 'Energy Project Sector', ', ')
        Xrm.Page.getAttribute("arup_projectsectorname").setValue(value);

    }

    //check to see if Arup Business has been changed to Energy and Project Sector doesn't have the Energy Project Sector option selected already
    else if (currentBusinessValue == 'Energy' && (projectSectorCode == null || projectSectorCode.indexOf('13') == -1)) {

        //check to see if multi-select is empty. In this case just push the values into *name & *code fields
        if (projectSectorCode == null) {
            Xrm.Page.getAttribute('arup_projectsectorvalue').setValue('13');
            Xrm.Page.getAttribute('arup_projectsectorname').setValue('Energy Project Sector');
        }
        else {
            //need to add to the existing values
            Xrm.Page.getAttribute('arup_projectsectorvalue').setValue(projectSectorCode + ',13');
            Xrm.Page.getAttribute('arup_projectsectorname').setValue(Xrm.Page.getAttribute('arup_projectsectorname').getValue() + ', Energy Project Sector');
        }

    }

    Xrm.Page.getAttribute('arup_projectsectorvalue').setSubmitMode("always");
    Xrm.Page.getAttribute('arup_projectsectorname').setSubmitMode("always");
    if (Xrm.Page.getAttribute("ccrm_arupbusiness").getValue != null)
        ArupBusinessSaved = Xrm.Page.getAttribute("ccrm_arupbusiness").getValue()[0].name;
}

function resetSubBusiness(valuechanged, businessid) {

    if (businessid == null || valuechanged || valuechanged == null)
        Xrm.Page.getAttribute('arup_subbusiness').setValue(null);

    // disable sub business if either business is NULL or license type is not Professional
    Xrm.Page.getControl("arup_subbusiness").setDisabled(businessid == null);

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
}
function ArupRegion_OnChange() {
    SetParentOpportunityRequired();
}

function SetParentOpportunityRequired() {
    var opportunitytype = Xrm.Page.getAttribute("arup_opportunitytype").getValue();
    var arupRegion = Xrm.Page.getAttribute("arup_arupregion").getValue();
    var arupRegionName = arupRegion != null ? arupRegion[0].name.toLowerCase() : '';
    var requiredLevel = (opportunitytype == 770000001 || opportunitytype == 770000002 || opportunitytype == 770000006 || (opportunitytype == 770000004 && arupRegionName == 'australasia region')) ? 'required' : 'none';
    Xrm.Page.getAttribute("arup_parentopportunityid").setRequiredLevel(requiredLevel);
}

function opportunityType_onChange() {
    ParentOpportunityFilter();
    ParentOpportunity_Onchange();
}

function ParentOpportunityFilter() {
    SetParentOpportunityRequired();
    Xrm.Page.getControl("arup_parentopportunityid").addPreSearch(function () { AddParentOpportunityFilter(); });
}

function AddParentOpportunityFilter() {

    var opportunitytype = Xrm.Page.getAttribute("arup_opportunitytype").getValue();
    var arupInternal = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();
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
    Xrm.Page.getControl("arup_parentopportunityid").addCustomFilter(fetch);
}


function ParentOpportunity_Onchange() {
    var parentOpportunity = Xrm.Page.getAttribute("arup_parentopportunityid").getValue();
    if (parentOpportunity != null && parentOpportunity != "undefined") {
        PullParentOpportunityDetailsForDiffOpportunityType(parentOpportunity);
    }
}

function PullParentOpportunityDetailsForDiffOpportunityType(parentOpportunity) {
    var opportunitytype = Xrm.Page.getAttribute("arup_opportunitytype").getValue();
    if (opportunitytype == null) { return; }
    if (opportunitytype == '770000001' && Xrm.Page.ui.getFormType() != 1) {

        var parentOpportunityId = parentOpportunity[0].id.replace('{', '').replace('}', '');

        var req = new XMLHttpRequest();
        if (opportunitytype == '770000001') {
            req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/opportunities?$select=ccrm_contractarrangement&$filter=opportunityid eq " + parentOpportunityId + "", true);
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
                    AssignDetailsFromParentOpportunity(results, opportunitytype);
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();
    }
}

function AssignDetailsFromParentOpportunity(results) {
    if (results.value.length > 0) {
        AssignDetailsWhenOpportunityTypeExistingContract(results);
    }
}

function AssignDetailsWhenOpportunityTypeExistingContract(results) {
    if (Xrm.Page.ui.getFormType() != 1) {
        Xrm.Page.getAttribute("ccrm_contractarrangement").setValue(results.value[0]["ccrm_contractarrangement"]);
    }
}