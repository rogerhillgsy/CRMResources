///<reference path="../Intellisense/Xrm.Page.2013.js"/>
///<reference path="../Library/ccrm_ms_MultiSelect.js"/>

parent.validateUrlProtocol = function () { return 1; }
var globalDQTeam = false;
var cgExists = false;
var parentOrgType;
var SSCTeam = false;
var currUserData;

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

function Form_onload(execContext) {

    if (Xrm.Page.context.client.getClient() == "Mobile") {
        Xrm.Page.ui.tabs.get("ClientOverview").setVisible(false);
    }

    //function for local language
    uselocaladdress_onchange(execContext);

    //var SSCTeams = ['Shared Services Centre Team - Americas', 'Shared Services Centre Team - Australasia', 'Shared Services Centre Team - East Asia (Client Verification)',
    //                'Shared Services Centre Team - East Asia (Credit Checks)', 'Shared Services Centre Team - Europe', 'Shared Services Centre Team - Global', 'Shared Services Centre Team - UKIMEA'];
    //for (var i = 0; i < SSCTeams.length; i++) {
    //    SSCTeam = userInTeamCheck(SSCTeams[i]);
    //    if (SSCTeam == true) { break; }
    //}

    SSCTeam = userInSSCTeam();

    globalDQTeam = userInTeamCheck('Global Data Quality');

    setCGFields();

    //function for managed account fields
    //ccrm_managedclient_onchange();

    //Xrm.Page.ui.tabs.get("tab_client_management").setVisible(false);
    Xrm.Page.ui.tabs.get("tab_Relationship_management").setVisible(false);

    if (Xrm.Page.data.entity.attributes.get("ccrm_legalentityname").getValue() == null) {
        copyNameToLEN();
    }

    if (Xrm.Page.ui.getFormType() != 1) {
        //  filterOpportunitiesGrid();

        //disable form if organisation name is 'unasigned'
        if (Xrm.Page.getAttribute("name").getValue() == 'Unassigned') {
            disableFormFields();
        }

        // this function will change the width of the header tile. It may not be supported
        changeHeaderTileFormat();

        arup_highriskclient_onchange();
        filterLeadsGrid();
        country_onChange();
        IsRegisteredAddressFromParentRecord();
        currUserData = GetCurrentUserDetails(Xrm.Page.context.getUserId());
        DisplayCOVID19Section(currUserData);

    }
}

// runs on Exit button
function exitForm() {

    //see if the form is dirty
    var ismodified = Xrm.Page.data.entity.getIsDirty();
    if (ismodified == false) {
        Xrm.Page.ui.close();
        return;
    }

    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
        '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the Organisation.</br>Click "Exit Only" button to exit the Organisation without saving.</font>',
        [
            {
                label: "<b>Save and Exit</b>",
                callback: function () {
                    var acctAttributes = Xrm.Page.data.entity.attributes.get();
                    var highlight = true;
                    var cansave = true;
                    if (acctAttributes != null) {
                        for (var i in acctAttributes) {
                            if (acctAttributes[i].getRequiredLevel() == 'required') {
                                highlight = Xrm.Page.getAttribute(acctAttributes[i].getName()).getValue() != null;
                                if (highlight == false && cansave == true) { cansave = false; }
                                //highlightField(null, '#' + acctAttributes[i].getName(), highlight);
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
                    var acctAttributes = Xrm.Page.data.entity.attributes.get();
                    if (acctAttributes != null) {
                        for (var i in acctAttributes) {
                            if (acctAttributes[i].getIsDirty()) {
                                Xrm.Page.getAttribute(acctAttributes[i].getName()).setSubmitMode("never");
                            }
                        }
                        setTimeout(function () { Xrm.Page.ui.close(); }, 1000);
                    }
                },
                setFocus: false,
                preventClose: false
            }
        ],
        'Warning', 600, 250, '', true);
}

function disableFormFields() {

    if (!globalDQTeam) {

        Xrm.Page.data.entity.attributes.forEach(function (attribute, index) {
            var control = Xrm.Page.getControl(attribute.getName());
            if (control) {
                control.setDisabled(true)
            }
        });

        if (Xrm.Page.getControl('header_ccrm_clienttype')) {
            Xrm.Page.getControl('header_ccrm_clienttype').setDisabled(true);
        }
        if (Xrm.Page.getControl('header_ccrm_keyaccounttype')) {
            Xrm.Page.getControl('header_ccrm_keyaccounttype').setDisabled(true);
        }
        if (Xrm.Page.getControl('header_statuscode')) {
            Xrm.Page.getControl('header_statuscode').setDisabled(true);
        }


        Xrm.Page.ui.setFormNotification("This form has been locked down for editing. Please contact Global Data Quality Team to make changes to this record.", "INFORMATION", "UNASSIGNEDLOCKED");
        setTimeout(function () { Xrm.Page.ui.clearFormNotification("UNASSIGNEDLOCKED"); }, 15000);
    }
}

//Param - teamm name . This function checks whether the logged in user is a member of the team. Returns true if he/ she is a member.
function userInTeamCheck(TeamName) {

    var IsPresentInTeam = false;

    try {
        var filter = "SystemUserId eq (guid'" + Xrm.Page.context.getUserId() + "')";
        var dataset = "TeamMembershipSet";
        var retrievedMultiple = ConsultCrm.Sync.RetrieveMultipleRequest(dataset, filter);
        var results = retrievedMultiple.results;

        for (i = 0; i < results.length; i++) {
            var filterTeam = "TeamId eq (guid'" + results[i].TeamId + "')";
            var datasetTeam = "TeamSet";
            var retrievedMultipleTeam = ConsultCrm.Sync.RetrieveMultipleRequest(datasetTeam, filterTeam);
            var resultsTeam = retrievedMultipleTeam.results;
            if (resultsTeam[0].Name == TeamName) {
                IsPresentInTeam = true;
                break;
            }
        }
    }
    catch (err) {
        console.log('Team Error: ' + err.message);
    }
    return IsPresentInTeam;
}


function userInSSCTeam() {

    var req = new XMLHttpRequest();
    var userid = Xrm.Page.context.getUserId().replace('{', '').replace('}', '');
    var userExists = false;
    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/teammemberships?$filter=systemuserid eq " + userid + " and (teamid eq 01886278-29CF-E911-8128-00505690CB20 or teamid eq F469F99A-29CF-E911-8128-00505690CB20 or teamid eq 0F61DA8A-29CF-E911-8128-00505690CB20 or teamid eq 8D568D76-48E5-E911-812B-00505690CB20 or teamid eq A7E35C81-29CF-E911-8128-00505690CB20 or teamid eq 12129B56-29CF-E911-8128-00505690CB20 or teamid eq 2247756B-29CF-E911-8128-00505690CB20)", false);
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
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
    return userExists;
}

function country_onChange() {

    canada_visibility();
    //clear_state();
    established_government_client_visibility();

}

function canada_visibility() {

    if (Xrm.Page.getAttribute("ccrm_countryid").getValue() != null && Xrm.Page.getAttribute("ccrm_countryid").getValue() != "undefined") {
        var isVisible = Xrm.Page.getAttribute("ccrm_countryid").getValue()[0].name == 'Canada';

        Xrm.Page.ui.tabs.get("SUMMARY_TAB").sections.get("canada_privacy").setVisible(isVisible);
    }
}

function clear_state() {

    if (Xrm.Page.getAttribute("ccrm_countryid").getValue() == null || Xrm.Page.getAttribute("ccrm_countryid").getValue() == "undefined") {
        Xrm.Page.getAttribute("ccrm_countrystate").setValue(null);
        Xrm.Page.getAttribute("address1_stateorprovince").setValue(null);
        return;
    }

    if (stateRequired(Xrm.Page.getAttribute("ccrm_countryid").getValue()[0].name)) {

        Xrm.Page.getAttribute("ccrm_countrystate").setValue(null);
    }
    else {
        Xrm.Page.getAttribute("address1_stateorprovince").setValue(null);
    }
}

function established_government_client_visibility() {

    var countryID = Xrm.Page.getAttribute('ccrm_countryid').getValue();
    if (countryID == null) {
        //Xrm.Page.getControl('arup_governmentclient').setVisible(true);
        if (globalDQTeam) {
            Xrm.Page.getAttribute('arup_governmentclient').setValue(false);
        }
        return;
    }

    countryID = countryID[0].id.replace('{', '').replace('}', '');
    var isVisible = false;
    if (countryID != null) {

        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/ccrm_countries?$select=_ccrm_arupregionid_value&$expand=ccrm_arupregionid($select=ccrm_arupregioncode)&$filter=ccrm_countryid eq " + countryID, true);
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
                        Xrm.Page.getControl('arup_governmentclient').setVisible(isVisible);
                        if (!isVisible && Xrm.Page.getAttribute('arup_governmentclient').getValue() == true && globalDQTeam) { Xrm.Page.getAttribute('arup_governmentclient').setValue(false); }
                    }
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
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

//Fetch All Opportunity Including all child Organisations belongs to current Organisations
function filterOpportunitiesGrid() {
    //get the subgrid 
    var objSubGrid = document.getElementById("openopportunities");

    //CRM loads subgrid after form is loaded.. so when we are adding script on form load.. need to wait until sub grid is loaded. 
    if (objSubGrid == null) {
        setTimeout(filterOpportunitiesGrid, 2000);
        return;
    }
    else {
        //when subgrid is loaded, get GUID
        var GUIDvalue = Xrm.Page.data.entity.getId();

        //Create FetchXML for sub grid to filter records based on GUID
        var FetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' >" +
            "<entity name='opportunity' >" +
            "<attribute name='name' />" +
            "<attribute name='ccrm_client' />" +
            "<attribute name='statuscode' />" +
            "<attribute name='ccrm_projectlocationid' />" +
            "<attribute name='ccrm_estimatedvalue_num' />" +
            "<attribute name='ccrm_arupbusinessid' />" +
            "<attribute name='ccrm_project_transactioncurrencyid' />" +
            "<attribute name='ccrm_arupregionid' />" +
            "<attribute name='ccrm_projectdirector_userid' />" +
            "<attribute name='closeprobability' />" +
            "<attribute name='ccrm_probabilityofprojectproceeding' />" +
            "<attribute name='ccrm_estarupinvolvementstart' />" +
            "<attribute name='ccrm_arupgroupid' />" +
            "<attribute name='opportunityid' />" +
            "<order attribute='name' descending='false' />" +
            "<link-entity name='account' from='accountid' to='ccrm_client' alias='aa' link-type='outer' />" +
            "<link-entity name='account' from='accountid' to='ccrm_ultimateendclientid' alias='ab' link-type='outer' />" +
            "<filter type='and'>" +
            "<condition attribute='statecode' operator='eq' value='0' />" +
            "<filter type='or'>" +
            "<condition entityname = 'aa' attribute='accountid' operator='eq' value='" + GUIDvalue + "' />" +
            "<condition entityname = 'aa' attribute='accountid' operator='under' value='" + GUIDvalue + "' />" +
            "<condition entityname = 'ab' attribute='accountid' operator='eq' value='" + GUIDvalue + "' />" +
            "<condition entityname = 'ab' attribute='accountid' operator='under' value='" + GUIDvalue + "' />" +
            "</filter>" +
            "</filter>" +
            "</entity>" +
            "</fetch>";

        //apply filtered fetchXML

        objSubGrid.control.SetParameter("fetchXml", FetchXml);

        //Refresh grid to show filtered records only. 
        objSubGrid.control.Refresh();
    }
}

function filterLeadsGrid() {
    //get the subgrid 
    var objSubGrid = window.parent.document.getElementById("Leads");

    //CRM loads subgrid after form is loaded.. so when we are adding script on form load.. need to wait until sub grid is loaded. 
    if (objSubGrid == null) {
        setTimeout(filterLeadsGrid, 2000);
        return;
    }
    else {
        //when subgrid is loaded, get GUID
        var GUIDvalue = Xrm.Page.data.entity.getId();

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

function setSharePointParameters() {
    //function to set default sharepoint patameters - 1 for create
    Xrm.Page.getAttribute("ccrm_sys_sharepoint_status").setValue(1);
    Xrm.Page.getAttribute("ccrm_sys_sharepoint_trigger").setValue(true);
    //force submit
    Xrm.Page.getAttribute("ccrm_sys_sharepoint_status").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_sys_sharepoint_trigger").setSubmitMode("always");
}

function fnSharePoint() {
    //show sharepoint tab when url is defined
    if (Xrm.Page.getAttribute("ccrm_sys_sharepoint_url").getValue() != null) {
        //show tab
        Xrm.Page.ui.tabs.get("tab_Documents").setVisible(true);

        //display the iframe redirect to sharepoint url
        var sharepointUrl = Xrm.Page.getAttribute("ccrm_sys_sharepoint_url").getValue();
        Xrm.Page.getControl("IFRAME_SharePointURL").setSrc(sharepointUrl);
    }
    else {
        //hide tab
        Xrm.Page.ui.tabs.get("tab_Documents").setVisible(false);
    }
}

//create sharepoint button
function fnBtnCreateSharePoint() {
    alert('Your request to create a Document Store has been sent');

    //set the sharepoint flag
    Xrm.Page.getAttribute("ccrm_sys_sharepoint_trigger").setValue(true);
    Xrm.Page.getAttribute("ccrm_sys_sharepoint_status").setValue(1);
    //force submit
    Xrm.Page.getAttribute("ccrm_sys_sharepoint_trigger").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_sys_sharepoint_status").setSubmitMode("always");
    //force save
    Xrm.Page.data.entity.save();
}

//function to make fields in Client Management section visible
function ccrm_managedclient_onchange() {

    debugger;

    var isVisibile = Xrm.Page.getAttribute("ccrm_keyaccount").getValue() == true;

    Xrm.Page.ui.tabs.get("tab_client_management").sections.get("tab_section_client_management").setVisible(isVisibile);

    //arup_highriskclient_onchange();

}

//function to make local language fields visible
function uselocaladdress_onchange(execContext) {

    var isVisible = Xrm.Page.getAttribute("ccrm_uselocaladdress").getValue() == true;
    var formContext = execContext.getFormContext();
    var tabObj = formContext.ui.tabs.get('contact_details');
    var sectionObj = tabObj.sections.get('section_LocalAddress');

    sectionObj.setVisible(isVisible);

    //Xrm.Page.ui.tabs.get("contact_details").sections.get("section_LocalAddress").setVisible(isVisible);

}

function arup_highriskclient_onchange() {

    //var managedClient = Xrm.Page.getAttribute("ccrm_keyaccount").getValue();
    var relationshipManager = Xrm.Page.getAttribute("ccrm_keyaccountmanagerid").getValue() == null ? 'Relationship Manager for this client.' : Xrm.Page.getAttribute("ccrm_keyaccountmanagerid").getValue()[0].name + ', the Client Relationship manager.';

    //if (managedClient != true || Xrm.Page.getAttribute("ccrm_keyaccountmanagerid").getValue() == null || !globalDQTeam) {

    //    Xrm.Page.getAttribute("arup_highriskclient").setValue(false);
    //    Xrm.Page.getControl('arup_highriskclient').setDisabled(true);

    //}
    //else if (managedClient == true && Xrm.Page.getAttribute("ccrm_keyaccountmanagerid").getValue() != null && globalDQTeam) {

    //    Xrm.Page.getControl('arup_highriskclient').setDisabled(false);

    //}

    var highRisk = Xrm.Page.getAttribute("arup_highriskclient").getValue();

    if (highRisk) {
        Notify.addOpp("<span style='font-weight:bold; color: white'>Before pursuing any opportunities with this client, please contact " + relationshipManager + " </span>", "WARNING", "highriskclient");
    }
    else { Notify.remove("highriskclient"); }

}

// Gloogle map url constructor
function tabMap_onclick() {

    DrawMap();
}

//NOT USED
//// Loads map into iframe when called //
function DrawMap() {
    if (Xrm.Page.ui.getFormType() != 1) {
        // Build the address for google maps 
        var mapUrl = "";
        if (Xrm.Page.getAttribute("address1_line1").getValue() != null) { mapUrl = mapUrl + Xrm.Page.getAttribute("address1_line1").getValue() + "+"; }
        if (Xrm.Page.getAttribute("address1_line2").getValue() != null) { mapUrl = mapUrl + Xrm.Page.getAttribute("address1_line3").getValue() + "+"; }
        if (Xrm.Page.getAttribute("address1_line3").getValue() != null) { mapUrl = mapUrl + Xrm.Page.getAttribute("address1_line3").getValue() + "+"; }
        if (Xrm.Page.getAttribute("address1_city").getValue() != null) { mapUrl = mapUrl + Xrm.Page.getAttribute("address1_city").getValue() + "+"; }
        if (Xrm.Page.getAttribute("address1_country").getValue() != null) { mapUrl = mapUrl + Xrm.Page.getAttribute("address1_country").getValue(); }

        //Check if there's no address information
        if (mapUrl != "") {
            mapUrl = "http://maps.google.com/?q=" + mapUrl + "&output=embed&t=m";
            // mapiframe.src = mapUrl;
            Xrm.Page.getControl("IFRAME_GoogleMap").setSrc(mapUrl);
        }
    }
}

function setDate(date) {
    var field = Xrm.Page.data.entity.attributes.get("ccrm_lastvalidatedbyid").getValue();

    if (field != null) {
        Xrm.Page.getAttribute("ccrm_lastvalidateddate").setValue(new Date());
        Xrm.Page.getAttribute("ccrm_lastvalidateddate").setSubmitMode("always");
    }
}

function copyNameToLEN() {
    var validated = Xrm.Page.data.entity.attributes.get("ccrm_lastvalidatedbyid").getValue();
    var clientName = Xrm.Page.data.entity.attributes.get("name").getValue();
    if (validated == null && clientName != null) {
        Xrm.Page.data.entity.attributes.get("ccrm_legalentityname").setValue(clientName);
    }
}

function setCGFields() {

    var validated = Xrm.Page.getAttribute("ccrm_lastvalidatedbyid");
    if (!validated || !validated.getValue()) { return; }

    Xrm.Page.getControl("ccrm_legalentityname").setDisabled(!SSCTeam);//Took off this part after clarification !globalDQTeam &&
    Xrm.Page.getControl("ccrm_clienttype").setDisabled(!globalDQTeam);
    Xrm.Page.getControl("header_ccrm_clienttype").setDisabled(!globalDQTeam);
    Xrm.Page.getControl("ccrm_clientsectorpicklistname").setDisabled(!globalDQTeam);
    Xrm.Page.getControl("arup_highriskclient").setDisabled(!globalDQTeam);

    if (!globalDQTeam) {
        Xrm.Page.ui.setFormNotification("Some of the fields on this form have been locked down. Please contact Global Data Quality Team to make changes to these fields.", "INFORMATION", "DQLOCKED");
        setTimeout(function () { Xrm.Page.ui.clearFormNotification("DQLOCKED"); }, 15000);
    }
}

//Date - 04/04/2016 
//Below function will be executed on save event whenever status changed. 
// if parent Account id associated then will be copy to parent account copy field on deactivation
function Form_onsave(prmContext) {

    //if parent Org field changed or it's a brand new record that has parent Org
    if (Xrm.Page.getAttribute("parentaccountid").getIsDirty() || (Xrm.Page.ui.getFormType == 1 && Xrm.Page.getAttribute("parentaccountid").getValue() != null)) {
        checkParentClientGrouping("parentaccountid");
        if (!cgExists) {
            var acctType = Xrm.Page.getAttribute("ccrm_organisationtype").getValue();
            if (acctType != "1") {
                cgExists = checkParentClientGrouping("ccrm_parent2");
                if (!cgExists) {
                    cgExists = checkParentClientGrouping("ccrm_parent3");
                }
            }
        }
        if (cgExists) {
            alert("You have added an organisation to a Client Group - it will be validated by the Data Quality team");
        }
    }

    if (prmContext != null && prmContext.getEventArgs() != null) {
        // getSaveMode() returns event mode value (5 on Deactivation button click, 6 - on Activate button click)                
        removeParentOrg(prmContext.getEventArgs().getSaveMode());
        removeParents(prmContext.getEventArgs().getSaveMode());
    }

    setInterval(changeHeaderTileFormat, 1000);

}

// check if an ORG is linked to a Client Grouping
function checkParentClientGrouping(parentFieldName) {

    var attr = Xrm.Page.getAttribute(parentFieldName);
    var org = attr.getValue();
    if (org == null) { return false; }
    var orgID = org[0].id;
    if (orgID == null) { return false; }

    SDK.REST.retrieveRecord(orgID, 'Account', "ccrm_ClientGroupings", null, retrieveCG, errorHandler, false);

}

function retrieveCG(account) {

    if (account != null) {
        cgExists = account.ccrm_ClientGroupings.Name != null;
    }
}

function errorHandler(error) {
    alert(error.message);
}

function removeParents(saveMode) {

    var orgType = Xrm.Page.getAttribute("ccrm_organisationtype").getValue();
    if (orgType != 5) {

        setLookupNull("ccrm_parent2");
        setLookupNull("ccrm_parent3");

    }
}

function removeParentOrg(activationMode) {

    // record is being activated
    if (activationMode == 6) {

        getLookupValue(activationMode, 'ccrm_parentaccountcopy', 'parentaccountid');

    }
}

function getLookupValue(activationMode, fieldNameFrom, fieldNameTo) {
    var entityName, entityId, entityType, lookupFieldObject;

    lookupFieldObject = Xrm.Page.data.entity.attributes.get(fieldNameFrom);

    if (lookupFieldObject.getValue() != null) {

        entityId = lookupFieldObject.getValue()[0].id;
        entityType = lookupFieldObject.getValue()[0].entityType;
        entityName = lookupFieldObject.getValue()[0].name;

        if (activationMode == 6 && entityName != null & entityName != '') {

            var x = window.confirm('Do you want Parent Account to be set to: \n' + entityName + "?")
            if (!x)
                return;

        }

        // copy the value
        setLookupValue(entityId, entityType, entityName, fieldNameTo);

        // set the value of the current field to null
        setLookupNull(fieldNameFrom);

    }

}

function setLookupValue(id, type, name, fieldName) {

    var lookupData = new Array();
    var lookupItem = new Object();
    //Set the GUID
    lookupItem.id = id;
    //Set the name
    lookupItem.name = name;
    lookupItem.entityType = type;
    lookupData[0] = lookupItem;

    if (id != null) {
        var lookupVal = new Array();
        lookupVal[0] = new Object();
        lookupVal[0].id = id;
        lookupVal[0].name = name;
        lookupVal[0].entityType = type;

        Xrm.Page.getAttribute(fieldName).setSubmitMode('always');

        // Set the value of the field
        Xrm.Page.getAttribute(fieldName).setValue(lookupVal);

    }
    else {
        alert('ID is NULL');
    }
}

function setLookupNull(fieldName) {

    var lookupObject = Xrm.Page.getAttribute(fieldName);
    if (lookupObject != null) {
        lookupObject.setValue(null);
    }
}

function arup_expressedconsent_onChange() {

    if (Xrm.Page.getAttribute('arup_expressedconsent').getValue() != true) return;

    Alert.show('<font size="6" color="#2E74B5"><b>Expressed Consent</b></font>',
        '<font size="3" color="#000000"></br>Please, make sure to upload the contract in the <b>Notes</b> section</font>',
        [
            new Alert.Button("<b>OK</b>")
        ],
        "INFO", 600, 200, '', true);
}

function OpenOrgOverviewReport() {
    var rdlName = "Client%20Overview.rdl";
    var reportGuid = "2545f84b-6a02-e211-b3a3-005056af0014";
    var entityType = "1";
    var entityGuid = Xrm.Page.data.entity.getId();
    var url = Xrm.Page.context.getClientUrl() + "/crmreports/viewer/viewer.aspx?action=run&context=records&helpID=" + rdlName + "&id={" + reportGuid + "}&records=" + entityGuid + "&recordstype=" + entityType;
    window.open(url, null, 800, 600, true, false, null);
}


function OpenClientOverviewReport(accountID, selectedRecCount) {
    //debugger;
    if (selectedRecCount > 1) {
        Xrm.Utility.alertDialog('Please select only one record.');
        return;
    }
    else if (selectedRecCount < 1) {
        Xrm.Utility.alertDialog('Please select a organization record first and then click.');
        return;
    }
    //alert(accountID);
    var parentAccId = '{00000000-0000-0000-0000-000000000000}';
    accountID = accountID.substr(1, accountID.length - 2);
    var customParameters = encodeURIComponent("accountID=" + accountID + "&parentAccID=" + parentAccId);
    Xrm.Utility.openWebResource('ccrm_/HTML/ClientOverViewReport.html', customParameters, 1100, 800);

}

function checkDueDiligence() {
    //Update to this field will trigger the DD check plugin
    Alert.show('<font size="6" color="#FF9B1E"><b>Due Diligence Check</b></font>',
        '<font size="3" color="#000000"></br>You are about to request for a Due Diligence check for the organisation.\n Do you want to Continue? </br></br>Click "Proceed Sanctions Check" to confirm, or "Do Not Check" to cancel.</font>',
        [
            {
                label: "<b>Proceed Sanctions Check</b>",
                callback: function () {
                    Xrm.Page.getAttribute("arup_checkduediligencetrigger").setValue(1);
                    Xrm.Page.data.save();
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
        "WARNING", 500, 300, '', true);

}

function checkOrganisationStatusOnLoad() {
    var orgStatus = Xrm.Page.getAttribute("statuscode").getValue();
    if (orgStatus != null && orgStatus == 770000000) {
        disableFormFields(false);
    }
}

function checkOrganisationStatus() {

    var orgStatus = Xrm.Page.getAttribute("statuscode").getValue();
    if (orgStatus != null && orgStatus == 770000000) {
        disableFormFields(false);
    } else {
        enableFormFields();
    }
}

function disableFormFields(checkDD) {

    var tabs = Xrm.Page.ui.tabs.get();
    var checkAddressFields = CheckRegisteredAddressFields();
    if (checkAddressFields) {
        for (var tab in tabs) {
            var tabName = tabs[tab].getName();
            if (tabName == "SUMMARY_TAB" || tabName == "contact_details" || tabName == "tab_Address" || tabName == "tab_Company_Registration") {
                tab = Xrm.Page.ui.tabs.get(tabName);
                var tabsections = tab.sections.get();
                for (var i in tabsections) {
                    if (tabsections[i].getVisible() == true) {
                        var secname = tabsections[i].getName();
                        sectiondisable(secname, true);
                    }
                }
            }
        }

        if (Xrm.Page.getAttribute("statuscode").getValue() != 770000000) {
            Xrm.Page.getAttribute("statuscode").setValue(770000000);
        }
        if (checkDD) {
            Xrm.Page.getAttribute("arup_checkduediligencetrigger").setValue(1);

            Xrm.Page.getAttribute("ccrm_lastvalidatedbyid").setValue([
                {
                    id: Xrm.Page.context.getUserId(),
                    name: Xrm.Page.context.getUserName(),
                    entityType: "systemuser",
                }
            ]);

            Xrm.Page.getAttribute("ccrm_lastvalidateddate").setValue(new Date());

        }

        Xrm.Page.data.entity.save();
        Xrm.Page.ui.setFormNotification("The Organisation form has been locked by the Shared Service Centre Team. To request any changes on the form, please click on 'Request Change' button on the ribbon menu.", "INFORMATION", "1");
    }
    else {
        Alert.show('<font size="6" color="#FF9B1E"><b>Registered Address Details</b></font>',
            '<font size="3" color="#000000"></br>Please fill in the Registered Address Details before you click "Lock Record" </br></font>',
            [
                {
                    label: "OK", callback: function () {
                        Xrm.Page.getControl("ccrm_countryofcoregistrationid").setFocus();
                    }
                }
            ],
            "WARNING", 600, 200, '', true);
    }
}

function enableFormFields() {

    var tabs = Xrm.Page.ui.tabs.get();
    for (var tab in tabs) {
        var tabName = tabs[tab].getName();
        if (tabName == "SUMMARY_TAB" || tabName == "contact_details" || tabName == "tab_Address" || tabName == "tab_Company_Registration") {
            tab = Xrm.Page.ui.tabs.get(tabName);
            var tabsections = tab.sections.get();
            for (var i in tabsections) {
                if (tabsections[i].getVisible() == true) {
                    var secname = tabsections[i].getName();
                    sectiondisable(secname, false);
                }
            }
        }
    }

    Xrm.Page.ui.clearFormNotification("1");
    if (Xrm.Page.getAttribute("statuscode").getValue() != 1) {
        Xrm.Page.getAttribute("statuscode").setValue(1);
        Xrm.Page.data.entity.save();
    }
}

function sectiondisable(sectionname, disablestatus) {

    var ctrlName = Xrm.Page.ui.controls.get();
    for (var j in ctrlName) {
        var ctrl = ctrlName[j];
        var controlType = ctrl.getControlType();
        if (controlType != "iframe" && controlType != "webresource" && controlType != "subgrid" && ctrl.getParent() != null) {
            var ctrlSection = ctrl.getParent().getName();
            if (ctrlSection == sectionname) {
                var defaultElements = ["ccrm_organisationid", "ccrm_lastcreditchecked", "arup_lastddcheckdate", "arup_parentorganisationid"];
                if (defaultElements.indexOf(ctrl.getName()) == -1) {
                    ctrl.setDisabled(disablestatus);
                }
                if (disablestatus) {
                    Xrm.Page.getControl("ccrm_legalentityname").setDisabled(disablestatus);
                } else {
                    Xrm.Page.getControl("ccrm_legalentityname").setDisabled(!SSCTeam);
                }
            }
        }
    }
}

function requestChange() {

    var orgId = Xrm.Page.data.entity.getId().replace(/[{}]/g, "");
    var clientUrl = Xrm.Page.context.getClientUrl();
    if (orgId != null) {
        var customParameters = encodeURIComponent("orgId=" + orgId);
        DialogOption = new Xrm.DialogOptions;
        DialogOption.width = 700;
        DialogOption.height = 400;
        Xrm.Internal.openDialog(Xrm.Page.context.getClientUrl() +
            "/WebResources/arup_organisationrequestchange?Data=" +
            customParameters,
            DialogOption,
            null,
            null,
            function (returnValue) {
                Xrm.Page.getAttribute("arup_requestchange").setValue(returnValue);
                Xrm.Page.data.entity.save();
            });
    }
}

function OpenAttachmentPage() {

    var url = "WebResources/arup_UploadAttachments?id=" + Xrm.Page.data.entity.getId() + "&typename=account&data=Documents";
    window.open(url, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=600,height=400");

}

function onChange_showrelform() {

    var staterel = Xrm.Page.getAttribute("arup_showrelationshipform").getValue();
    return staterel == null ? false : staterel;
}


//function to call on 'Pull Data from Parent Record' checkbox
function GetCountryOfCompanyRegistartion() {
    if (Xrm.Page.getAttribute("arup_pulldatafromparentrecord").getValue() == "1") {
        var legalClientName = Xrm.Page.getAttribute("ccrm_legalentityname").getValue();
        if (legalClientName != null) {
            formatLegalClientName = legalClientName.replace("'", "''");
            var req = new XMLHttpRequest();
            req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/accounts?$select=_ccrm_countryofcoregistrationid_value,_ccrm_lastvalidatedbyid_value,arup_address3street1,arup_address3street2,arup_address3street3,arup_address3towncity,arup_address3zippostalcode,_arup_address3stateprovince_value,arup_address3statecountyprovince,ccrm_organisationid&$orderby=_parentaccountid_value asc&$filter=(ccrm_legalentityname eq '" + formatLegalClientName + "' and statecode eq 0 and _ccrm_countryofcoregistrationid_value ne null and _ccrm_lastvalidatedbyid_value ne null)", true);
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
                        AssignRegistrationDetails(results, legalClientName);
                    } else {
                        Xrm.Utility.alertDialog(this.statusText);
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
                "ERROR", 600, 200, '', true);
            Xrm.Page.getAttribute("arup_pulldatafromparentrecord").setValue(0);
        }
    }
}

function AssignRegistrationDetails(results, legalClientName) {

    if (results.value.length > 0) {
        var _ccrm_countryofcoregistrationid_value = results.value[0]["_ccrm_countryofcoregistrationid_value"];
        var _ccrm_countryofcoregistrationid_value_formatted = results.value[0]["_ccrm_countryofcoregistrationid_value@OData.Community.Display.V1.FormattedValue"];

        var _arup_address3stateprovince_value = results.value[0]["_arup_address3stateprovince_value"];
        var _arup_address3stateprovince_value_formatted = results.value[0]["_arup_address3stateprovince_value@OData.Community.Display.V1.FormattedValue"];

        if (_ccrm_countryofcoregistrationid_value != null) {
            Xrm.Page.getAttribute("ccrm_countryofcoregistrationid").setValue([
                {
                    id: _ccrm_countryofcoregistrationid_value,
                    name: _ccrm_countryofcoregistrationid_value_formatted,
                    entityType: "ccrm_country"
                }
            ]);
            Xrm.Page.getAttribute("ccrm_countryofcoregistrationid").fireOnChange();

            Xrm.Page.getAttribute("arup_address3street1").setValue(results.value[0]["arup_address3street1"]);
            Xrm.Page.getAttribute("arup_address3street2").setValue(results.value[0]["arup_address3street2"]);
            Xrm.Page.getAttribute("arup_address3street3").setValue(results.value[0]["arup_address3street3"]);
            Xrm.Page.getAttribute("arup_address3towncity").setValue(results.value[0]["arup_address3towncity"]);
            Xrm.Page.getAttribute("arup_address3zippostalcode").setValue(results.value[0]["arup_address3zippostalcode"]);
            Xrm.Page.getAttribute("arup_address3statecountyprovince").setValue(results.value[0]["arup_address3statecountyprovince"]);
            Xrm.Page.getAttribute("arup_parentorganisationid").setValue(results.value[0]["ccrm_organisationid"]);

            if (_arup_address3stateprovince_value != null) {
                Xrm.Page.getAttribute("arup_address3stateprovince").setValue([
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
            "INFO", 600, 200, '', true);
        Xrm.Page.getAttribute("arup_pulldatafromparentrecord").setValue(0);
    }
}

function toggleSections() {
    var staterel = Xrm.Page.getAttribute("ccrm_enablerelationship").getValue();
    if (staterel) {
        Xrm.Page.ui.tabs.get("tab_Activites").setVisible(true);
        Xrm.Page.ui.tabs.get("Interactions").setVisible(true);
    }
    else {
        Xrm.Page.ui.tabs.get("tab_Activites").setVisible(false);
        Xrm.Page.ui.tabs.get("Interactions").setVisible(false);
    }
}

function MicrosoftTeams() {
    var orgId = Xrm.Page.data.entity.getId().replace(/[{}]/g, "");
    var microsoftTeamsUrl = Xrm.Page.getAttribute("arup_microsoftteamsurl").getValue();
    if (microsoftTeamsUrl != null) {
        window.open(microsoftTeamsUrl, null, 800, 600, true, false, null);
    } else {
        if (orgId != null) {
            var customParameters = encodeURIComponent("orgId=" + orgId);
            DialogOption = new Xrm.DialogOptions;
            DialogOption.width = 700;
            DialogOption.height = 400;
            Xrm.Internal.openDialog(Xrm.Page.context.getClientUrl() +
                "/WebResources/arup_MicrosoftTeams?Data=" +
                customParameters,
                DialogOption,
                null,
                null,
                function (returnValue) {
                    Xrm.Page.getAttribute("arup_microsoftteamsurl").setValue(returnValue);
                    Xrm.Page.data.entity.save();
                });
        }
    }
}

function ShowMicrosoftTeams() {
    var relationshipFormVisible = Xrm.Page.ui.tabs.get("tab_Relationship_management").getVisible();
    if (relationshipFormVisible == true) {
        return true;
    }
    else {
        return false;
    }
}

function CheckRegisteredAddressFields() {
    var country = Xrm.Page.getAttribute("ccrm_countryofcoregistrationid").getValue();
    Xrm.Page.getAttribute("ccrm_countryofcoregistrationid").setRequiredLevel('required');
    var town = Xrm.Page.getAttribute("arup_address3towncity").getValue();
    Xrm.Page.getAttribute("arup_address3towncity").setRequiredLevel('required');
    var street1 = Xrm.Page.getAttribute("arup_address3street1").getValue();
    Xrm.Page.getAttribute("arup_address3street1").setRequiredLevel('required');


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

function AssignOrganisationAddressToRegisteredAddress() {

    var ccrm_countryid = Xrm.Page.getAttribute("ccrm_countryid");
    if (ccrm_countryid != null) {
        var ccrm_countryidvalue = ccrm_countryid.getValue();
        if (ccrm_countryidvalue != null) {
            Xrm.Page.getAttribute("ccrm_countryofcoregistrationid").setValue([
                {
                    id: ccrm_countryidvalue[0].id,
                    name: ccrm_countryidvalue[0].name,
                    entityType: ccrm_countryidvalue[0].entityType
                }
            ]);
        }
    }
    Xrm.Page.getAttribute("ccrm_countryofcoregistrationid").fireOnChange();

    Xrm.Page.getAttribute("arup_address3street1").setValue(Xrm.Page.getAttribute("address1_line1").getValue());
    Xrm.Page.getAttribute("arup_address3street2").setValue(Xrm.Page.getAttribute("address1_line2").getValue());
    Xrm.Page.getAttribute("arup_address3street3").setValue(Xrm.Page.getAttribute("address1_line3").getValue());
    Xrm.Page.getAttribute("arup_address3towncity").setValue(Xrm.Page.getAttribute("address1_city").getValue());
    Xrm.Page.getAttribute("arup_address3zippostalcode").setValue(Xrm.Page.getAttribute("address1_postalcode").getValue());
    Xrm.Page.getAttribute("arup_address3statecountyprovince").setValue(Xrm.Page.getAttribute("address1_stateorprovince").getValue());

    var ccrm_countrystate = Xrm.Page.getAttribute("ccrm_countrystate");
    if (ccrm_countrystate != null) {
        var ccrm_countrystatevalue = ccrm_countrystate.getValue();
        if (ccrm_countrystatevalue != null) {
            Xrm.Page.getAttribute("arup_address3stateprovince").setValue([
                {
                    id: ccrm_countrystatevalue[0].id,
                    name: ccrm_countrystatevalue[0].name,
                    entityType: ccrm_countrystatevalue[0].entityType
                }
            ]);
        }
    }
}

function CopyOrganisationDetails() {
    if (Xrm.Page.getAttribute("arup_pulldatafromparentrecord").getValue() != "1" && Xrm.Page.getAttribute("arup_copyorganisationaddress").getValue() == "1") {
        AssignOrganisationAddressToRegisteredAddress();
        SetDisabledRegisteredAddressFields('tab_Address_section_2', true);
    } else {
        SetDisabledRegisteredAddressFields('tab_Address_section_2', false);
    }

}

function SetDisabledRegisteredAddressFields(sectionname, disablestatus) {
    var ctrlName = Xrm.Page.ui.controls.get();
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

function IsRegisteredAddressFromParentRecord() {
    if (Xrm.Page.getAttribute("arup_pulldatafromparentrecord").getValue() == "1") {
        Xrm.Page.getAttribute("arup_copyorganisationaddress").setValue(0);
        Xrm.Page.getControl("arup_copyorganisationaddress").setDisabled(true);
        SetDisabledRegisteredAddressFields('tab_Address_section_2', false);
    } else {
        Xrm.Page.getControl("arup_copyorganisationaddress").setDisabled(false);
    }
}

function setCovidValues(attrName, dateAttrName, userAttrName) {
    attrValue = Xrm.Page.getAttribute(attrName).getValue();
    if (attrValue == 0) {
        Xrm.Page.getAttribute(dateAttrName).setValue(null);
        Xrm.Page.getAttribute(userAttrName).setValue(null);
        return;
    }
    Xrm.Page.getAttribute(dateAttrName).setValue(new Date());
    Xrm.Page.getAttribute(userAttrName).setValue(
        [
            {
                id: Xrm.Page.context.getUserId(),
                name: Xrm.Page.context.getUserName(),
                entityType: "systemuser",
            }
        ]
    );

    Alert.show('<font size="6" color="#2E74B5"><b>COVID-19 Business Continuity</b></font>',
        '<font size="3" color="#000000"></br>You are required to add a Note, including attaching a copy of the Business Continuity approved communication regarding Arup protocol in response to COVID-19 issued / or the communication received regarding the client’s protocol in response to Covid-19. </br> <b>Please do this now!</b></font>',
        [
            new Alert.Button("<b>OK</b>")
        ], "INFO", 600, 300, '', true);
}

//get Region lookup - from the current user
function GetCurrentUserDetails(userId) {

    var result = new Object();

    SDK.REST.retrieveRecord(userId, "SystemUser", 'Ccrm_ArupRegionId,', null,
        function (retrievedreq) {
            if (retrievedreq != null) {
                result.FullName = retrievedreq.FullName;
                if (retrievedreq.Ccrm_ArupRegionId != null) {

                    result.userRegionID = retrievedreq.Ccrm_ArupRegionId.Id;
                    result.userRegionName = retrievedreq.Ccrm_ArupRegionId.Name;
                }

            }
        }, errorHandler, false);
    return result;
}

function DisplayCOVID19Section(currUserData) {
    Xrm.Page.ui.tabs.get("SUMMARY_TAB").sections.get("covid19_bc").setVisible(currUserData.userRegionName == ArupRegionName.Australasia || currUserData.userRegionName == ArupRegionName.Malaysia);
}