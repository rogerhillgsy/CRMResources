parent.validateUrlProtocol = function () { return 1; }
var globalDQTeam = false;
var cgExists = false;
var parentOrgType;
var SSCTeam = false;
var isDQForm = false;
var userRegion;

var ArupRegionName = {
    'Americas': 'Americas Region',
    'Australasia': 'Australasia Region',
    'CorporateServices': 'Corporate Services',
    'DigitalTechnology': 'Digital Technology',
    'EastAsia': 'East Asia Region',
    'Europe': 'Europe',
    'GroupBoard': 'Group Board',
    'SouthernAfrica': 'Southern Africa Sub-Region',
    'UKMEA': 'UKIMEA Region',
    'Malaysia': 'Malaysia Region'
};

function formAction(formName, action, formContext) {
    var currentForm = formContext.ui.formSelector.getCurrentItem();
    var availableForms = formContext.ui.formSelector.items.get();
    if (currentForm.getLabel().toLowerCase() != formName.toLowerCase()) {
        for (var i in availableForms) {
            var form = availableForms[i];
            if (form.getLabel().toLowerCase() == formName.toLowerCase()) {
                if (action == "hide") {
                    form.setVisible(false);
                }
                if (action == "change") {
                    form.navigate();
                }
                return;
            }
        }
    }
}

function Form_onload(executionContext) {
    var formContext = executionContext.getFormContext();

    globalDQTeam = isUserInTeamCheck(formContext);
    formItem = formContext.ui.formSelector.getCurrentItem();
    var formName = formItem.getLabel();
    //var isDQForm = false;
    if (formName == "Data Quality Form") {
        isDQForm = true;
    }
    if (isDQForm) {
        var wrControl = formContext.getControl("WebResource_Relationship_Interactions");
        if (wrControl) {
            wrControl.getContentWindow().then(
                function (contentWindow) {
                    contentWindow.setClientApiContext(Xrm, formContext);
                }
            )
        }
    }
    if (!globalDQTeam) {
        if (formName == "Data Quality Form") {
            formAction("Organisation", "change", formContext);
        }
        formAction("Data Quality Form", "hide", formContext);
    } else if (globalDQTeam && formName == "Data Quality Form") {
        retreiveTeamDetails(formContext, status, formName);
        HideShowOnDQForm(formContext);
        return;
    }

    if (formContext.context.client.getClient() == "Mobile") {
        formContext.ui.tabs.get("ClientOverview").setVisible(false);
    }

    SSCTeam = isUserInSSCTeam(formContext);

    setCGFields(formContext);

    if (formContext.getAttribute("ccrm_legalentityname").getValue() == null) {
        copyNameToLEN(formContext);
    }

    if (formContext.ui.getFormType() != 1) {

        //function for local language
        uselocaladdress_onchange(formContext);
        //disable form if organisation name is 'unasigned'
        if (formContext.getAttribute("name").getValue() == 'Unassigned') {
            onLoaddisableFormFields(formContext);
        }
        userRegion = GetCurrentUserDetails(formContext);
        // this function will change the width of the header tile. It may not be supported
        changeHeaderTileFormat();

        filterLeadsGrid(formContext);
        country_onChange(executionContext);
        IsRegisteredAddressFromParentRecord(formContext);
        prepareCheckOptions(formContext);
        DisplayCOVID19Section(userRegion, formContext);
        displayRelationshipTab(formContext);
        formContext.getControl('arup_duediligencecheck').removeOption(2);
        //var status = "";
        //retreiveTeamDetails(formContext, status);
        setCompanyRegistrationRequired(formContext);
    }
    formContext.ui.tabs.get("SUMMARY_TAB").setFocus();
}

// runs on Exit button
function exitForm(primaryControl) {
    var formContext = primaryControl;
    //see if the form is dirty
    var ismodified = formContext.data.entity.getIsDirty();
    if (ismodified == false) {
        formContext.ui.close();
        return;
    }

    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
        '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the Organisation.</br>Click "Exit Only" button to exit the Organisation without saving.</font>',
        [
            {
                label: "<b>Save and Exit</b>",
                callback: function () {
                    var acctAttributes = formContext.data.entity.attributes.get();
                    var highlight = true;
                    var cansave = true;
                    if (acctAttributes != null) {
                        for (var i in acctAttributes) {
                            if (acctAttributes[i].getRequiredLevel() == 'required') {
                                highlight = formContext.getAttribute(acctAttributes[i].getName()).getValue() != null;
                                if (highlight == false && cansave == true) { cansave = false; }
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
                    var acctAttributes = formContext.data.entity.attributes.get();
                    if (acctAttributes != null) {
                        for (var i in acctAttributes) {
                            if (acctAttributes[i].getIsDirty()) {
                                formContext.getAttribute(acctAttributes[i].getName()).setSubmitMode("never");
                            }
                        }
                        setTimeout(function () { formContext.ui.close(); }, 1000);
                    }
                },
                setFocus: false,
                preventClose: false
            }
        ],
        'Warning', 600, 250, formContext.context.getClientUrl(), true);
}

function onLoaddisableFormFields(formContext) {
    if (!globalDQTeam) {

        formContext.data.entity.attributes.forEach(function (attribute, index) {
            var control = formContext.getControl(attribute.getName());
            if (control) {
                control.setDisabled(true)
            }
        });

        if (formContext.getControl('header_ccrm_clienttype')) {
            formContext.getControl('header_ccrm_clienttype').setDisabled(true);
        }
        if (formContext.getControl('header_ccrm_keyaccounttype')) {
            formContext.getControl('header_ccrm_keyaccounttype').setDisabled(true);
        }
        if (formContext.getControl('header_statuscode')) {
            formContext.getControl('header_statuscode').setDisabled(true);
        }

        formContext.ui.setFormNotification("This form has been locked down for editing. Please contact Global Data Quality Team to make changes to this record.", "INFORMATION", "UNASSIGNEDLOCKED");
        setTimeout(function () { formContext.ui.clearFormNotification("UNASSIGNEDLOCKED"); }, 15000);
    }
}

function userInTeamCheck(primaryControl) {
    var formContext = primaryControl;
    var userInTeam = isUserInTeamCheck(formContext);
    return userInTeam;
}

//Param - teamm name . This function checks whether the logged in user is a member of the team. Returns true if he/ she is a member.
function isUserInTeamCheck(formContext) {
    var systemUser = formContext.context.getUserId().replace('{', '').replace('}', '');
    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/teammemberships?$filter=systemuserid eq " + systemUser + " and (teamid eq 14E17BE2-0FF3-E411-940C-005056B5174A)", false);
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
                userInTeam = results.value.length > 0;
            } else {
                XrmOpenAlertDialog(this.statusText);
            }
        }
    };
    req.send();
    return userInTeam;
}

function userInSSCTeam(primaryControl) {
    var formContext = primaryControl;
    var userInTeam = isUserInSSCTeam(formContext);
    return userInTeam;
}

function isUserInSSCTeam(formContext) {
    var req = new XMLHttpRequest();
    var userid = formContext.context.getUserId().replace('{', '').replace('}', '');
    var userExists = false;
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/teammemberships?$filter=systemuserid eq " + userid + " and (teamid eq 01886278-29CF-E911-8128-00505690CB20 or teamid eq F469F99A-29CF-E911-8128-00505690CB20 or teamid eq 0F61DA8A-29CF-E911-8128-00505690CB20 or teamid eq 8D568D76-48E5-E911-812B-00505690CB20 or teamid eq A7E35C81-29CF-E911-8128-00505690CB20 or teamid eq 12129B56-29CF-E911-8128-00505690CB20 or teamid eq 2247756B-29CF-E911-8128-00505690CB20)", false);
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
                userExists = results.value.length > 0;
            } else {
                XrmOpenAlertDialog(this.statusText);
            }
        }
    };
    req.send();
    return userExists;
}

function country_onChange(executionContext) {

    var formContext = executionContext.getFormContext();

    canada_visibility(formContext);
    established_government_client_visibility(formContext);
    hideShowAmericasFields(formContext);
    setCompanyRegistrationRequired(formContext);
}

function countryID_onChange(executionContext) {

    country_onChange(executionContext);
}

function canada_visibility(formContext) {

    if (formContext.getAttribute("ccrm_countryid").getValue() != null && formContext.getAttribute("ccrm_countryid").getValue() != "undefined") {
        var isVisible = formContext.getAttribute("ccrm_countryid").getValue()[0].name.toUpperCase() == 'CANADA';

        formContext.ui.tabs.get("SUMMARY_TAB").sections.get("canada_privacy").setVisible(isVisible);
    }
}

function established_government_client_visibility(formContext) {

    var countryID = formContext.getAttribute('ccrm_countryid').getValue();
    if (countryID == null) {
        if (globalDQTeam) {
            formContext.getAttribute('arup_governmentclient').setValue(false);
        }
        return;
    }

    countryID = countryID[0].id.replace('{', '').replace('}', '');
    var isVisible = false;
    if (countryID != null) {

        var req = new XMLHttpRequest();
        req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/ccrm_countries?$select=_ccrm_arupregionid_value&$expand=ccrm_arupregionid($select=ccrm_arupregioncode)&$filter=ccrm_countryid eq " + countryID, true);
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
                    for (var i = 0; i < results.value.length; i++) {
                        var _ccrm_arupregionid_value_formatted = results.value[i]["_ccrm_arupregionid_value@OData.Community.Display.V1.FormattedValue"];
                        if (_ccrm_arupregionid_value_formatted != null) {
                            _ccrm_arupregionid_value_formatted = _ccrm_arupregionid_value_formatted.toUpperCase();
                            isVisible = _ccrm_arupregionid_value_formatted.includes('AUSTRALASIA') || _ccrm_arupregionid_value_formatted.includes('MALAYSIA');
                        }
                        formContext.getControl('arup_governmentclient').setVisible(isVisible);
                        if (!isVisible && formContext.getAttribute('arup_governmentclient').getValue() == true && globalDQTeam) { formContext.getAttribute('arup_governmentclient').setValue(false); }
                    }
                } else {
                    XrmOpenAlertDialog(this.statusText);
                }
            }
        };
        req.send();
    }
}

function changeHeaderTileFormat() {

    //This may not be a supported way to change the header tile width
    var headertiles = document.getElementsByClassName("ms-crm-HeaderTileElement");
    if (headertiles != null) {
        for (var i = 0; i < headertiles.length; i++) {
            headertiles[i].style.width = "350px";
        }
    }
}

function stateRequired(CountryName) {

    CountryName = CountryName.toUpperCase();

    var states = (CountryName == "UNITED STATES" ||
        CountryName == "UNITED STATES OF AMERICA" ||
        CountryName == "CANADA" ||
        CountryName == "AUSTRALIA" ||
        CountryName == "INDONESIA" ||
        CountryName == "NEW ZEALAND" ||
        CountryName == "MALAYSIA" ||
        CountryName == "SINGAPORE");
    return states;
}

function filterLeadsGrid(formContext) {
    //get the subgrid 
    var objSubGrid = window.parent.document.getElementById("Leads");

    //CRM loads subgrid after form is loaded.. so when we are adding script on form load.. need to wait until sub grid is loaded. 
    if (objSubGrid == null) {
        setTimeout(filterLeadsGrid, 2000);
        return;
    }
    else {
        //when subgrid is loaded, get GUID
        var GUIDvalue = formContext.data.entity.getId();

        //Create FetchXML for sub grid to filter records based on GUID
        var FetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' >" +
            "<entity name='lead' >" +
            "<attribute name='fullname' />" +
            "<attribute name='createdon' />" +
            "<attribute name='statecode' />" +
            "<attribute name='ownerid' />" +
            "<attribute name='ccrm_country' />" +
            "<attribute name='ccrm_client' />" +
            "<attribute name='ccrm_arupbusiness' />" +
            "<attribute name='arup_lastactivitytitle' />" +
            "<attribute name='arup_lastactivitydate' />" +
            "<attribute name='arup_lastactivitytype' />" +
            "<attribute name='ccrm_accountingcentreid' />" +
            "<attribute name='leadid' />" +
            "<order attribute='createdon' descending='true' />" +
            "<link-entity name='account' from='accountid' to='ccrm_client' alias='aa' link-type='outer' />" +
            "<filter type='and'>" +
            "<condition entityname = 'lead' attribute='statecode' operator='eq' value='0' />" +
            "<condition entityname = 'lead' attribute='statuscode' operator='eq' value='1' />" +
            "<condition entityname = 'aa' attribute='accountid' operator='eq' value='" + GUIDvalue + "' />" +
            "</filter>" +
            "</entity>" +
            "</fetch>";

        //apply filtered fetchXML
        if (objSubGrid.control != null) {
            objSubGrid.control.SetParameter("fetchXml", FetchXml);
            //Refresh grid to show filtered records only. 
            objSubGrid.control.Refresh();
        }
        else {
            setTimeout(filterLeadsGrid, 2000);
        }
    }
}

//function to output error banner message from the interface
function interfaceErrorBanner(errorType, errorRetries, errorMsg) {
    //SetNotificationAlert("CRITICAL", errorType + " | Number of retries: " + errorRetries + " | " + errorMsg);
    SetNotificationAlert("CRITICAL", errorType + " | Number of retries: " + errorRetries);
}

//create sharepoint button
function fnBtnCreateSharePoint(primaryControl) {
    var formContext = primaryControl;
    alert('Your request to create a Document Store has been sent');

    //set the sharepoint flag
    formContext.getAttribute("ccrm_sys_sharepoint_trigger").setValue(true);
    formContext.getAttribute("ccrm_sys_sharepoint_status").setValue(1);
    //force submit
    formContext.getAttribute("ccrm_sys_sharepoint_trigger").setSubmitMode("always");
    formContext.getAttribute("ccrm_sys_sharepoint_status").setSubmitMode("always");
    //force save
    formContext.data.entity.save();
}

//function is called on change of Addn Addr/Local Language from the form
function uselocaladdressOnchange(executionContext) {
    var formContext = executionContext.getFormContext();
    uselocaladdress_onchange(formContext);
}

//function to make local language fields visible
function uselocaladdress_onchange(formContext) {

    var useLocationAddressAttr = formContext.getAttribute("ccrm_uselocaladdress");
    if (useLocationAddressAttr == null) { return; }

    var isVisible = useLocationAddressAttr.getValue() == true;
    var tabObj = formContext.ui.tabs.get("contact_details");
    var sectionObj = tabObj.sections.get("section_LocalAddress");
    sectionObj.setVisible(isVisible);
}

function setDate(execContext) {
    var formContext = execContext.getFormContext();
    var field = formContext.getAttribute("ccrm_lastvalidatedbyid").getValue();

    if (field != null) {
        formContext.getAttribute("ccrm_lastvalidateddate").setValue(new Date());
        formContext.getAttribute("ccrm_lastvalidateddate").setSubmitMode("always");
    } else {
        formContext.getAttribute("ccrm_lastvalidateddate").setValue(null);
    }
}

function copyNameToLegal(execContext) {
    var formContext = execContext.getFormContext();
    copyNameToLEN(formContext);
}

function copyNameToLEN(formContext) {
    var validated = formContext.getAttribute("ccrm_lastvalidatedbyid").getValue();
    var clientName = formContext.getAttribute("name").getValue();
    if (validated == null && clientName != null) {
        formContext.getAttribute("ccrm_legalentityname").setValue(clientName);
    }
}

function setCGFields(formContext) {
    var validated = formContext.getAttribute("ccrm_lastvalidatedbyid");
    if (!validated || !validated.getValue()) { return; }

    formContext.getControl("ccrm_legalentityname").setDisabled(!SSCTeam);//Took off this part after clarification !globalDQTeam &&
    formContext.getControl("arup_duediligencecheck").setDisabled(!SSCTeam);
    formContext.getControl("ccrm_clienttype").setDisabled(!globalDQTeam);
    formContext.getControl("header_ccrm_clienttype").setDisabled(!globalDQTeam);
    formContext.getControl("arup_clientsector").setDisabled(!globalDQTeam);

    if (!globalDQTeam) {
        formContext.ui.setFormNotification("Some of the fields on this form have been locked down. Please contact Global Data Quality Team to make changes to these fields.", "INFORMATION", "DQLOCKED");
        setTimeout(function () { formContext.ui.clearFormNotification("DQLOCKED"); }, 15000);
    }
}

function arup_expressedconsent_onChange(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute('arup_expressedconsent').getValue() != true) return;

    Alert.show('<font size="6" color="#2E74B5"><b>Expressed Consent</b></font>',
        '<font size="3" color="#000000"></br>Please, make sure to upload the contract in the <b>Notes</b> section</font>',
        [
            new Alert.Button("<b>OK</b>")
        ],
        "INFO", 600, 200, formContext.context.getClientUrl(), true);
}

function OpenClientOverviewReport(accountID, selectedRecCount) {
    if (selectedRecCount > 1) {
        XrmOpenAlertDialog('Please select only one record.');
        return;
    }
    else if (selectedRecCount < 1) {
        XrmOpenAlertDialog('Please select a organization record first and then click.');
        return;
    }
    var parentAccId = '{00000000-0000-0000-0000-000000000000}';
    accountID = accountID.substr(1, accountID.length - 2);
    var customParameters = encodeURIComponent("accountID=" + accountID + "&parentAccID=" + parentAccId);
    Xrm.Navigation.openWebResource('ccrm_/HTML/ClientOverViewReport.html', customParameters, 1100, 800);
}

function checkDueDiligence(primaryControl) {
    var formContext = primaryControl;
    //Update to this field will trigger the DD check plugin
    Alert.show('<font size="6" color="#FF9B1E"><b>Due Diligence Check</b></font>',
        '<font size="3" color="#000000"></br>You are about to request for a Due Diligence check for the organisation.\n Do you want to Continue? </br></br>Click "Proceed Sanctions Check" to confirm, or "Do Not Check" to cancel.</font>',
        [
            {
                label: "<b>Proceed Sanctions Check</b>",
                callback: function () {
                    var ddTrigger = formContext.getAttribute("arup_checkduediligencetrigger").getValue();
                    if (ddTrigger) {
                        formContext.getAttribute("arup_checkduediligencetrigger").setValue(false);
                        formContext.data.save();
                        return;
                    }
                    formContext.getAttribute("arup_checkduediligencetrigger").setValue(true);
                    formContext.data.save();
                },
                setFocus: false,
                preventClose: false
            },
            {
                label: "<b>Do Not Check</b>",
                setFocus: true,
                preventClose: false
            }
        ],
        "WARNING", 500, 300, formContext.context.getClientUrl(), true);

}

function checkOrganisationStatusOnLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    var orgStatus = formContext.getAttribute("statuscode").getValue();
    if (orgStatus != null && orgStatus == 770000000) {
        disableOrgFormFields(formContext, false);
    }
}

function disableFormFields(primaryControl, checkDD) {
    var formContext = primaryControl;
    disableOrgFormFields(formContext, checkDD);
}

function disableOrgFormFields(formContext, checkDD) {
    var tabs = formContext.ui.tabs.get();
    var checkAddressFields = CheckRegisteredAddressFields(formContext);
    if (checkAddressFields) {
        for (var tab in tabs) {
            var tabName = tabs[tab].getName();
            if (tabName == "SUMMARY_TAB" || tabName == "contact_details" || tabName == "tab_Address" || tabName == "tab_Company_Registration" || tabName == "tab_Relationship_management") {
                tab = formContext.ui.tabs.get(tabName);
                var tabsections = tab.sections.get();
                for (var i in tabsections) {
                    if (tabsections[i].getVisible() == true) {
                        var secname = tabsections[i].getName();
                        if (secname != "SUMMARY_TAB_section_7")
                            sectiondisable(secname, true, formContext);
                    }
                }
            }
        }

        if (formContext.getAttribute("statuscode").getValue() != 770000000) {
            formContext.getAttribute("statuscode").setValue(770000000);
        }
        if (checkDD) {
            formContext.getAttribute("arup_checkduediligencetrigger").setValue(true);

            formContext.getAttribute("ccrm_lastvalidatedbyid").setValue([
                {
                    id: formContext.context.getUserId(),
                    name: formContext.context.getUserName(),
                    entityType: "systemuser",
                }
            ]);

            formContext.getAttribute("ccrm_lastvalidateddate").setValue(new Date());
        }

        formContext.data.entity.save();
        formContext.ui.setFormNotification("The Organisation form has been locked by the Shared Service Centre Team. To request any changes on the form, please click on 'Request Change' button on the ribbon menu.", "INFORMATION", "1");
    }
    else {
        Alert.show('<font size="6" color="#FF9B1E"><b>Registered Address Details</b></font>',
            '<font size="3" color="#000000"></br>Please fill in the Registered Address Details before you click "Lock Record" </br></font>',
            [
                {
                    label: "OK", callback: function () {
                        formContext.getControl("ccrm_countryofcoregistrationid").setFocus();
                    }
                }
            ],
            "WARNING", 600, 200, formContext.context.getClientUrl(), true);
    }
}

function enable_FormFields(primaryControl) {
    var formContext = primaryControl;
    enableFormFields(formContext);
}

function enableFormFields(formContext) {
    var tabs = formContext.ui.tabs.get();
    for (var tab in tabs) {
        var tabName = tabs[tab].getName();
        if (tabName == "SUMMARY_TAB" || tabName == "contact_details" || tabName == "tab_Address" || tabName == "tab_Company_Registration" || tabName == "tab_Relationship_management") {
            tab = formContext.ui.tabs.get(tabName);
            var tabsections = tab.sections.get();
            for (var i in tabsections) {
                if (tabsections[i].getVisible() == true) {
                    var secname = tabsections[i].getName();
                    sectiondisable(secname, false, formContext);
                }
            }
        }
    }

    formContext.ui.clearFormNotification("1");
    if (formContext.getAttribute("statuscode").getValue() != 1) {
        formContext.getAttribute("statuscode").setValue(1);
        formContext.data.entity.save();
    }
}

function sectiondisable(sectionname, disablestatus, formContext) {

    var ctrlName = formContext.ui.controls.get();
    for (var j in ctrlName) {
        var ctrl = ctrlName[j];
        var controlType = ctrl.getControlType();
        if (controlType != "iframe" && controlType != "webresource" && controlType != "subgrid" && ctrl.getParent() != null) {
            var ctrlSection = ctrl.getParent().getName();
            if (ctrlSection == sectionname) {
                var defaultElements = ["ccrm_organisationid", "ccrm_lastcreditchecked", "arup_lastddcheckdate", "arup_parentorganisationid", 'arup_creditcheck', 'arup_recommendedcreditlimit', 'arup_creditcurrency'];
                if (defaultElements.indexOf(ctrl.getName()) == -1 && sectionname != 'SUMMARY_TAB_section_6') {
                    ctrl.setDisabled(disablestatus);
                }
                if (disablestatus) {
                    formContext.getControl("ccrm_legalentityname").setDisabled(disablestatus);
                } else {
                    formContext.getControl("ccrm_legalentityname").setDisabled(!SSCTeam);
                }
            }
        }
    }
}

function requestChange(primaryControl) {
    var formContext = primaryControl;
    var orgId = formContext.data.entity.getId().replace(/[{}]/g, "");
    var clientUrl = formContext.context.getClientUrl();

    if (orgId != null) {
        var customParameters = "&orgId=" + orgId + "&clientUrl=" + clientUrl;

        var pageInput = {
            pageType: "webresource",
            webresourceName: "arup_organisationrequestchange",
            data: customParameters

        };
        var navigationOptions = {
            target: 2,
            width: 700,
            height: 500,
            position: 1
        };
        Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
            function success() {
                formContext.data.entity.save();
            },
            function error() {
            }
        );
    }
}

//function to call on 'Pull Data from Parent Record' checkbox
function GetCountryOfCompanyRegistartion(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("arup_pulldatafromparentrecord").getValue() == true) {
        var legalClientName = formContext.getAttribute("ccrm_legalentityname").getValue();
        if (legalClientName != null) {
            formatLegalClientName = legalClientName.replace("'", "''");
            var req = new XMLHttpRequest();
            req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/accounts?$select=_ccrm_countryofcoregistrationid_value,_ccrm_lastvalidatedbyid_value,arup_address3street1,arup_address3street2,arup_address3street3,arup_address3towncity,arup_address3zippostalcode,_arup_address3stateprovince_value,arup_address3statecountyprovince,ccrm_organisationid&$orderby=_parentaccountid_value asc&$filter=(ccrm_legalentityname eq '" + formatLegalClientName + "' and statecode eq 0 and _ccrm_countryofcoregistrationid_value ne null and _ccrm_lastvalidatedbyid_value ne null)", true);
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
                        AssignRegistrationDetails(results, legalClientName, formContext);
                    } else {
                        XrmOpenAlertDialog(this.statusText);
                    }
                }
            };
            req.send();
        }
        else {
            Alert.show('<font size="6" color="#ca0000"><b>Country of Company Registration</b></font>',
                '<font size="3" color="#000000"></br>Legal Client Name should be filled in to pull registration address</font>',
                [
                    new Alert.Button("<b>OK</b>")
                ],
                "ERROR", 600, 200, formContext.context.getClientUrl(), true);
            formContext.getAttribute("arup_pulldatafromparentrecord").setValue(0);
        }
    }
}

function AssignRegistrationDetails(results, legalClientName, formContext) {
    if (results.value.length > 0) {
        var _ccrm_countryofcoregistrationid_value = results.value[0]["_ccrm_countryofcoregistrationid_value"];
        var _ccrm_countryofcoregistrationid_value_formatted = results.value[0]["_ccrm_countryofcoregistrationid_value@OData.Community.Display.V1.FormattedValue"];

        var _arup_address3stateprovince_value = results.value[0]["_arup_address3stateprovince_value"];
        var _arup_address3stateprovince_value_formatted = results.value[0]["_arup_address3stateprovince_value@OData.Community.Display.V1.FormattedValue"];

        if (_ccrm_countryofcoregistrationid_value != null) {
            formContext.getAttribute("ccrm_countryofcoregistrationid").setValue([
                {
                    id: _ccrm_countryofcoregistrationid_value,
                    name: _ccrm_countryofcoregistrationid_value_formatted,
                    entityType: "ccrm_country"
                }
            ]);
            formContext.getAttribute("ccrm_countryofcoregistrationid").fireOnChange();

            formContext.getAttribute("arup_address3street1").setValue(results.value[0]["arup_address3street1"]);
            formContext.getAttribute("arup_address3street2").setValue(results.value[0]["arup_address3street2"]);
            formContext.getAttribute("arup_address3street3").setValue(results.value[0]["arup_address3street3"]);
            formContext.getAttribute("arup_address3towncity").setValue(results.value[0]["arup_address3towncity"]);
            formContext.getAttribute("arup_address3zippostalcode").setValue(results.value[0]["arup_address3zippostalcode"]);
            formContext.getAttribute("arup_address3statecountyprovince").setValue(results.value[0]["arup_address3statecountyprovince"]);
            formContext.getAttribute("arup_parentorganisationid").setValue(results.value[0]["ccrm_organisationid"]);

            if (_arup_address3stateprovince_value != null) {
                formContext.getAttribute("arup_address3stateprovince").setValue([
                    {
                        id: _arup_address3stateprovince_value,
                        name: _arup_address3stateprovince_value_formatted,
                        entityType: "ccrm_arupusstate"
                    }
                ]);
            }
        }
    } else {
        Alert.show('<font size="6" color="#2E74B5"><b>Country of Company Registration</b></font>',
            '<font size="3" color="#000000"></br>There is no active organisation that has been validated with legal client name <b>' + legalClientName + ' </b> </font>',
            [
                new Alert.Button("<b>OK</b>")
            ],
            "INFO", 600, 200, formContext.context.getClientUrl(), true);
        formContext.getAttribute("arup_pulldatafromparentrecord").setValue(0);
    }
}

function MicrosoftTeams(primaryControl) {
    var formContext = primaryControl;
    var orgId = formContext.data.entity.getId().replace(/[{}]/g, "");
    var entityName = formContext.data.entity.getEntityName();
    var microsoftTeamsUrl = formContext.getAttribute("arup_microsoftteamsurl").getValue();
    var clientUrl = formContext.context.getClientUrl();
    if (microsoftTeamsUrl != null) {
        window.open(microsoftTeamsUrl, null, 800, 600, true, false, null);
    } else {
        if (orgId != null) {
            var customParameters = "&entId=" + orgId + "&clientUrl=" + clientUrl + "&entName=" + entityName;

            var pageInput = {
                pageType: "webresource",
                webresourceName: "arup_MicrosoftTeams",
                data: customParameters

            };
            var navigationOptions = {
                target: 2,
                width: 700,
                height: 500,
                position: 1
            };
            Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
                function success() {
                    formContext.data.entity.save();
                },
                function error() {
                }
            );
        }
    }
}

function ShowMicrosoftTeams(primaryControl) {
    var formContext = primaryControl;
    var relationshipFormVisible = formContext.ui.tabs.get("tab_Relationship_management").getVisible();
    if (relationshipFormVisible == true) {
        return true;
    }
    else {
        return false;
    }
}

function CheckRegisteredAddressFields(formContext) {
    var country = formContext.getAttribute("ccrm_countryofcoregistrationid").getValue();
    formContext.getAttribute("ccrm_countryofcoregistrationid").setRequiredLevel('required');
    var town = formContext.getAttribute("arup_address3towncity").getValue();
    formContext.getAttribute("arup_address3towncity").setRequiredLevel('required');
    var street1 = formContext.getAttribute("arup_address3street1").getValue();
    formContext.getAttribute("arup_address3street1").setRequiredLevel('required');

    if (country && town && street1) {
        return true;
    }
    else {
        return false;
    }
}

function EnableDeactivateButton() {
    if (globalDQTeam) {
        return true;
    }
    else {
        return false;
    }
}

function AssignOrganisationAddressToRegisteredAddress(formContext) {
    var ccrm_countryid = formContext.getAttribute("ccrm_countryid");
    if (ccrm_countryid != null) {
        var ccrm_countryidvalue = ccrm_countryid.getValue();
        if (ccrm_countryidvalue != null) {
            formContext.getAttribute("ccrm_countryofcoregistrationid").setValue([
                {
                    id: ccrm_countryidvalue[0].id,
                    name: ccrm_countryidvalue[0].name,
                    entityType: ccrm_countryidvalue[0].entityType
                }
            ]);
        }
    }

    formContext.getAttribute("ccrm_countryofcoregistrationid").fireOnChange();
    formContext.getAttribute("arup_address3street1").setValue(formContext.getAttribute("address1_line1").getValue());
    formContext.getAttribute("arup_address3street2").setValue(formContext.getAttribute("address1_line2").getValue());
    formContext.getAttribute("arup_address3street3").setValue(formContext.getAttribute("address1_line3").getValue());
    formContext.getAttribute("arup_address3towncity").setValue(formContext.getAttribute("address1_city").getValue());
    formContext.getAttribute("arup_address3zippostalcode").setValue(formContext.getAttribute("address1_postalcode").getValue());
    formContext.getAttribute("arup_address3statecountyprovince").setValue(formContext.getAttribute("address1_stateorprovince").getValue());

    var ccrm_countrystate = formContext.getAttribute("ccrm_countrystate");
    if (ccrm_countrystate != null) {
        var ccrm_countrystatevalue = ccrm_countrystate.getValue();
        if (ccrm_countrystatevalue != null) {
            formContext.getAttribute("arup_address3stateprovince").setValue([
                {
                    id: ccrm_countrystatevalue[0].id,
                    name: ccrm_countrystatevalue[0].name,
                    entityType: ccrm_countrystatevalue[0].entityType
                }
            ]);
        }
    }
}

function CopyOrganisationDetails(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("arup_pulldatafromparentrecord").getValue() != "1" && formContext.getAttribute("arup_copyorganisationaddress").getValue() == "1") {
        AssignOrganisationAddressToRegisteredAddress(formContext);
        SetDisabledRegisteredAddressFields('tab_Address_section_2', true, formContext);
    } else {
        SetDisabledRegisteredAddressFields('tab_Address_section_2', false, formContext);
    }
}

function SetDisabledRegisteredAddressFields(sectionname, disablestatus, formContext) {
    var ctrlName = formContext.ui.controls.get();
    for (var j in ctrlName) {
        var ctrl = ctrlName[j];
        var controlType = ctrl.getControlType();
        if (controlType != "iframe" && controlType != "webresource" && controlType != "subgrid" && ctrl.getParent() != null) {
            var ctrlSection = ctrl.getParent().getName();
            if (ctrlSection == sectionname) {
                var defaultElements = ["arup_copyorganisationaddress"];
                if (defaultElements.indexOf(ctrl.getName()) == -1) {
                    ctrl.setDisabled(disablestatus);
                }
            }
        }
    }
}

function IsRegisteredAddressFromParentRecordOnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    IsRegisteredAddressFromParentRecord(formContext);
}

function IsRegisteredAddressFromParentRecord(formContext) {
    if (formContext.getAttribute("arup_pulldatafromparentrecord").getValue() == true) {
        formContext.getAttribute("arup_copyorganisationaddress").setValue(false);//0
        formContext.getControl("arup_copyorganisationaddress").setDisabled(true);
        SetDisabledRegisteredAddressFields('tab_Address_section_2', false, formContext);
    } else {
        formContext.getControl("arup_copyorganisationaddress").setDisabled(false);
    }
}

function setCovidValues(executionContext, attrName, dateAttrName, userAttrName) {
    var formContext = executionContext.getFormContext();
    attrValue = formContext.getAttribute(attrName).getValue();
    makeCovid19FieldsRequired(attrName, userAttrName, formContext);
    if (attrValue == 0) {
        formContext.getAttribute(dateAttrName).setValue(null);
        formContext.getAttribute(userAttrName).setValue(null);
        return;
    }
    formContext.getAttribute(dateAttrName).setValue(new Date());
    formContext.getAttribute(userAttrName).setValue(
        [
            {
                id: formContext.context.getUserId(),
                name: formContext.context.getUserName(),
                entityType: "systemuser",
            }
        ]
    );

    Alert.show('<font size="6" color="#2E74B5"><b>COVID-19 Business Continuity</b></font>',
        '<font size="3" color="#000000"></br>You are required to add a Note, including attaching a copy of the Business Continuity approved communication regarding Arup protocol in response to COVID-19 issued / or the communication received regarding the client???s protocol in response to Covid-19. </br> <b>Please do this now!</b></font>',
        [
            new Alert.Button("<b>OK</b>")
        ], "INFO", 600, 300, formContext.context.getClientUrl(), true);
}

//get Region lookup - from the current user
function GetCurrentUserDetails(formContext) {
    var userId = formContext.context.getUserId().replace('{', '').replace('}', '');
    var userRegion = null;
    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/systemusers(" + userId + ")?$select=_ccrm_arupregionid_value", false);
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
                userRegion = result["_ccrm_arupregionid_value@OData.Community.Display.V1.FormattedValue"];
            } else {
                XrmOpenAlertDialog(this.statusText);
            }
        }
    };
    req.send();
    return userRegion;
}

function DisplayCOVID19Section(userRegion, formContext) {
    formContext.ui.tabs.get("COVID-19").setVisible(userRegion == ArupRegionName.Australasia || userRegion == ArupRegionName.Malaysia || userRegion == ArupRegionName.UKMEA);

    if (formContext.ui.tabs.get("COVID-19").getVisible() == false) { return; }

    makeCovid19FieldsRequired('arup_arupscovid19bcadvised', 'arup_arupscovid19bcadviseduser', formContext);
    makeCovid19FieldsRequired('arup_clientscovid19bcadvised', 'arup_clientscovid19bcadviseduser', formContext);
}

function makeCovid19FieldsRequired(checkboxfield, usernamefield, formContext) {
    var requiredLevel = formContext.getAttribute(checkboxfield).getValue() == true ? 'required' : 'none';
    formContext.getAttribute(usernamefield).setRequiredLevel(requiredLevel);
}

function OpenOverviewReport(primaryControl) {
    var formContext = primaryControl;
    var accId, parentaccountid, clientURL;
    clientURL = formContext.context.getClientUrl();
    var systemUser = formContext.context.getUserId().replace('{', '').replace('}', '');
    if (formContext.data != null) {
        accId = formContext.data.entity.getId().replace('{', '').replace('}', '');
        parentaccountid = formContext.getAttribute("parentaccountid").getValue() != undefined ? formContext.getAttribute("parentaccountid").getValue()[0].id.replace('{', '').replace('}', '') : accId;
    }
    else {
        accId = "29616C21-7745-E011-9CF6-78E7D16510D0";
        parentaccountid = accId;
    }

    var customParameters = encodeURIComponent("accountID=" + accId + "&parentAccID=" + parentaccountid + "&clientURL=" + clientURL + "&systemuser=" + systemUser);
    var windowOptions = { openInNewWindow: true, height: 800, width: 1100 };
    Xrm.Navigation.openWebResource('ccrm_/HTML/ClientOverViewReport.html', windowOptions, customParameters);
}

function OpenConnMatrixReport(primaryControl) {
    var formContext = primaryControl;
    var accId, parentaccountid, clientURL;
    clientURL = formContext.context.getClientUrl();
    if (formContext.data != null) {
        accId = formContext.data.entity.getId().replace('{', '').replace('}', '');
        parentaccountid = formContext.getAttribute("parentaccountid").getValue() != undefined ? formContext.getAttribute("parentaccountid").getValue()[0].id.replace('{', '').replace('}', '') : accId;
    }
    else {
        accId = "29616C21-7745-E011-9CF6-78E7D16510D0";
        parentaccountid = accId;
    }

    var customParameters = encodeURIComponent("accountID=" + accId + "&parentAccID=" + parentaccountid + "&clientURL=" + clientURL);
    var windowOptions = { openInNewWindow: true, height: 800, width: 1200 };
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) // If Internet Explorer, return version number
    {
        Xrm.Navigation.openWebResource('ccrm_/HTML/ConnectionMatrix_old.html', windowOptions, customParameters);
    }
    else  // If another browser, return 0
    {
        Xrm.Navigation.openWebResource('ccrm_/HTML/ConnectionMatrix.html', windowOptions, customParameters);
    }
}

function hideShowAmericasFields(formContext) {

    var country = formContext.getAttribute("ccrm_countryid").getValue();
    var countryName;
    if (country != null) {
        countryName = country[0].name.toUpperCase();
    }
    var isVisible = false;
    isVisible = countryName != null && (countryName == 'UNITED STATES OF AMERICA' || countryName == 'CANADA');

    formContext.ui.tabs.get('SUMMARY_TAB').sections.get('SUMMARY_TAB_section_6').setVisible(isVisible);

}

function displayRelationshipTabOnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    displayRelationshipTab(formContext);
}

function displayRelationshipTab(formContext) {
    var relationshipTeam = formContext.getAttribute("ccrm_managingteamid").getValue();
    if (relationshipTeam == null) {
        formContext.ui.tabs.get("tab_Relationship_management").setVisible(false);
    } else {
        formContext.ui.tabs.get("tab_Relationship_management").setVisible(true);
    }
}

function relationshipTeamOnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    var status = "onchange";
    retreiveTeamDetails(formContext, status, null);
    if (isDQForm) { HideShowOnDQForm(formContext); };
}

function retreiveTeamDetails(formContext, status, formName) {
    var relationshipTeam = formContext.getAttribute("ccrm_managingteamid").getValue();
    if (relationshipTeam != null) {
        if (status == "onchange")
            formContext.getAttribute("ccrm_keyaccount").setValue(true);

        var relTeamId = relationshipTeam[0].id.replace('{', '').replace('}', '');
        var req = new XMLHttpRequest();
        req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/teams(" + relTeamId + ")?$select=ccrm_arup150,_ccrm_arupsponsor_value,ccrm_clientoverview,ccrm_clientprioritisation,_ccrm_relationshipmanager_value,ccrm_relationshiptype,_ccrm_clientgrouping_value,arup_clienttype,arup_clientsectorforteam,_ccrm_clientleadcontact_value", true);
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
                    var ccrm_arup150 = result["ccrm_arup150"];
                    var _ccrm_arupsponsor_value = result["_ccrm_arupsponsor_value"];
                    var _ccrm_arupsponsor_value_formatted = result["_ccrm_arupsponsor_value@OData.Community.Display.V1.FormattedValue"];
                    var ccrm_clientoverview = result["ccrm_clientoverview"];
                    var ccrm_clientprioritisation = result["ccrm_clientprioritisation"];
                    var _ccrm_relationshipmanager_value = result["_ccrm_relationshipmanager_value"];
                    var _ccrm_relationshipmanager_value_formatted = result["_ccrm_relationshipmanager_value@OData.Community.Display.V1.FormattedValue"];
                    var ccrm_relationshiptype = result["ccrm_relationshiptype"];


                    if (ccrm_relationshiptype != null) {
                        switch (ccrm_relationshiptype) {
                            case 100000004:
                                formContext.getAttribute("ccrm_keyaccounttype").setValue(1);
                                break;
                            case 100000006:
                                formContext.getAttribute("ccrm_keyaccounttype").setValue(5);
                                break;
                            case 100000002:
                                formContext.getAttribute("ccrm_keyaccounttype").setValue(2);
                                break;
                            case 100000003:
                                formContext.getAttribute("ccrm_keyaccounttype").setValue(3);
                                break;
                            default:
                                break;
                        }
                    } else {
                        formContext.getAttribute("ccrm_keyaccounttype").setValue(null);
                    }



                    if (ccrm_clientprioritisation != null) {
                        formContext.getAttribute("ccrm_clientprioritisation").setValue(ccrm_clientprioritisation);
                    } else {
                        formContext.getAttribute("ccrm_clientprioritisation").setValue(null);
                    }


                    if (ccrm_arup150 != null && status == "onchange") {
                        formContext.getAttribute("arup_arup150").setValue(ccrm_arup150);
                    }

                    var relationshipSnapshot = formContext.getControl("ccrm_relationshipsnapshot");
                    if (relationshipSnapshot != null) {
                        if (ccrm_clientoverview != null) {
                            formContext.getAttribute("ccrm_relationshipsnapshot").setValue(ccrm_clientoverview);
                        } else {
                            formContext.getAttribute("ccrm_relationshipsnapshot").setValue(null);
                        }
                    }


                    if (_ccrm_relationshipmanager_value != null) {
                        formContext.getAttribute("ccrm_keyaccountmanagerid").setValue([
                            {
                                id: _ccrm_relationshipmanager_value,
                                name: _ccrm_relationshipmanager_value_formatted,
                                entityType: "systemuser"
                            }
                        ]);

                    } else {
                        formContext.getAttribute("ccrm_keyaccountmanagerid").setValue(null);
                    }



                    if (_ccrm_arupsponsor_value != null) {
                        formContext.getAttribute("ccrm_arupboardsponsor").setValue([
                            {
                                id: _ccrm_arupsponsor_value,
                                name: _ccrm_arupsponsor_value_formatted,
                                entityType: "systemuser"
                            }
                        ]);
                    } else {
                        formContext.getAttribute("ccrm_arupboardsponsor").setValue(null);
                    }


                    if (result["_ccrm_clientgrouping_value"] != null) {
                        formContext.getAttribute("ccrm_clientgroupings").setValue([
                            {
                                id: result["_ccrm_clientgrouping_value"],
                                name: result["_ccrm_clientgrouping_value@OData.Community.Display.V1.FormattedValue"],
                                entityType: result["_ccrm_clientgrouping_value@Microsoft.Dynamics.CRM.lookuplogicalname"]
                            }
                        ]);
                    } else {
                        formContext.getAttribute("ccrm_clientgroupings").setValue(null);
                    }

                    var clientLeadContact = formContext.getControl("arup_mostseniorclient");
                    if (clientLeadContact != null) {
                        if (result["_ccrm_clientleadcontact_value"] != null) {
                            formContext.getAttribute("arup_mostseniorclient").setValue([
                                {
                                    id: result["_ccrm_clientleadcontact_value"],
                                    name: result["_ccrm_clientleadcontact_value@OData.Community.Display.V1.FormattedValue"],
                                    entityType: result["_ccrm_clientleadcontact_value@Microsoft.Dynamics.CRM.lookuplogicalname"]
                                }
                            ]);
                        } else {
                            formContext.getAttribute("arup_mostseniorclient").setValue(null);
                        }
                    }

                    if (result["arup_clienttype"] != null) {
                        formContext.getAttribute("ccrm_clienttype").setValue(result["arup_clienttype"]);
                    } else {
                        formContext.getAttribute("ccrm_clienttype").setValue(null);
                    }

                    if (result["arup_clientsectorforteam"] != null) {
                        value = result["arup_clientsectorforteam"].split(",");
                        value = value.map(value => {
                            return parseInt(value)
                        })
                        formContext.getAttribute("arup_clientsector").setValue(value);
                    } else {
                        formContext.getAttribute("arup_clientsector").setValue(null);
                    }

                    if (formName != "Data Quality Form")
                        DisableFields(formContext, true, 'ccrm_clienttype', 'arup_clientsector');

                } else {
                    XrmOpenAlertDialog(this.statusText);
                }
            }
        };
        req.send();
    } else {
        if (status == "onchange") {
            formContext.getAttribute("ccrm_keyaccount").setValue(false);
            ClearFields(formContext, 'ccrm_clienttype', 'arup_clientsector', 'ccrm_clientgroupings', 'ccrm_keyaccounttype', 'ccrm_clientprioritisation', 'ccrm_relationshipsnapshot', 'ccrm_keyaccountmanagerid', 'ccrm_arupboardsponsor', 'arup_mostseniorclient');
            formContext.getAttribute("arup_arup150").setValue(null);
        }
        DisableFields(formContext, false, 'ccrm_clienttype', 'arup_clientsector');
    }
}

function DisableFields(formContext, isDisabled, listOfFields) {
    /// <summary>Disable Fields</summary>
    /// <param name="fieldName">One or more field names that are to be Disable.</param>
    for (var field in arguments) {
        if (field != 0 && field != 1) {
            var control = formContext.getControl(arguments[field]);
            if (control != null) {
                control.setDisabled(isDisabled);
            }
        }
    }
}

function setCompanyRegistrationRequired(formContext) {
    //If Organisation is in Aus region, set Company Registaryion Required
    if (formContext.getAttribute("ccrm_countryid").getValue() != null && formContext.getAttribute("ccrm_countryid").getValue() != "undefined") {
        var countryId = formContext.getAttribute("ccrm_countryid").getValue()[0].id.replace('{', '').replace('}', '');

        var req = new XMLHttpRequest();
        req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/ccrm_countries(" + countryId + ")?$select=_ccrm_arupregionid_value", true);
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
                    var arupRegionName = result["_ccrm_arupregionid_value@OData.Community.Display.V1.FormattedValue"];

                    var requiredLevel = arupRegionName.toUpperCase() == "AUSTRALASIA REGION" ? 'required' : 'none';
                    formContext.getAttribute("ccrm_taxregistrationno").setRequiredLevel(requiredLevel);
                } else {
                    Xrm.Navigation.openAlertDialog(this.statusText);
                }
            }
        };
        req.send();
    }
}

function validateRegistrationCountry(executionContext) {

    var formContext = executionContext.getFormContext();
    var regCountry = formContext.getAttribute('ccrm_countryofcoregistrationid').getValue();
    var addressCountry = formContext.getAttribute('ccrm_countryid').getValue();

    if (regCountry == null || regCountry == 'undefined' || addressCountry == null || addressCountry == 'undefined') { return; }
    regCountry = regCountry[0].id.toUpperCase();
    addressCountry = addressCountry[0].id.toUpperCase();
    if (regCountry == addressCountry) { return; }

    Alert.show('<font size="6" color="#FF9B1E"><b>Country of Company Registration</b></font>',
        '<font size="3" color="#000000"></br>Country of Registration is different to that in the organisation???s address. <br> Is this correct?</br></br>Click "Yes" to continue <br> Click "No" to clear all of the registered company fields.</font>',
        [
            {
                label: "<b>Yes</b>",
                setFocus: true,
                preventClose: false
            },
            {
                label: "<b>No</b>",
                callback: function () {
                    formContext.getAttribute('ccrm_countryofcoregistrationid').setValue(null);
                    formContext.getAttribute('arup_address3street1').setValue(null);
                    formContext.getAttribute('arup_address3street2').setValue(null);
                    formContext.getAttribute('arup_address3street3').setValue(null);
                    formContext.getAttribute('arup_address3towncity').setValue(null);
                    formContext.getAttribute('arup_address3zippostalcode').setValue(null);
                    formContext.getAttribute('arup_address3stateprovince').setValue(null);
                    formContext.getAttribute('arup_address3statecountyprovince').setValue(null);
                },
                setFocus: false,
                preventClose: false
            },
        ],
        "WARNING", 650, 250, formContext.context.getClientUrl(), true);

}


function XrmOpenAlertDialog(message) {
    var alertStrings = { confirmButtonLabel: "Close", text: message, title: "Client Overview Report Error" };
    var alertOptions = { height: 120, width: 260 };
    var promise = Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
    return promise;
}


function ClearFields(formContext, fieldName) {
    for (var field in arguments) {
        if (field != 0) {
            var attrName = arguments[field];
            var controlName = attrName;
            var control = formContext.getAttribute(controlName);
            if (control != null) {
                control.setValue(null);
            }
        }
    }
}
function HideShowOnDQForm(formContext) {
    var relationshipMgmtSection = formContext.ui.tabs.get("SUMMARY_TAB").sections.get("SUMMARY_TAB_section_4");
    var relationshipTeam = formContext.getAttribute("ccrm_managingteamid").getValue();
    if (relationshipTeam != null) {
        relationshipMgmtSection.setVisible(true);
        formContext.getControl("ccrm_keyaccountmanagerid").setVisible(true);
    } else {
        relationshipMgmtSection.setVisible(false);
        formContext.getControl("ccrm_keyaccountmanagerid").setVisible(false);
    }
}