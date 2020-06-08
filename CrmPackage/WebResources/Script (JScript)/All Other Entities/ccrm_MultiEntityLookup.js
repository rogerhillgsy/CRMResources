var selectedEntity;

function onsave(executionContext) {
    var formContext = executionContext.getFormContext();
    var entityId;
    var entityId1;
    var guid;
    var guid1;

    switch (selectedEntity) {

        case 'Opportunity':

            entityId = formContext.getAttribute('ccrm_relatingto').getValue();
            entityId1 = formContext.getAttribute('ccrm_relatingto1').getValue();

            switch (entityId) {

                case 3:
                    guid = formContext.getAttribute('ccrm_opportunityid').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('ccrm_opportunityid').getValue() == null ? null : formContext.getAttribute('ccrm_opportunityid').getValue()[0].name);
                    break;

                case 10029:
                    guid = formContext.getAttribute('ccrm_newarupregionid').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('ccrm_newarupregionid').getValue() == null ? null : formContext.getAttribute('ccrm_newarupregionid').getValue()[0].name);
                    break;

                case 8:
                    guid = formContext.getAttribute('ccrm_user').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('ccrm_user').getValue() == null ? null : formContext.getAttribute('ccrm_user').getValue()[0].name);
                    break;

                case 10054:
                    guid = formContext.getAttribute('ccrm_arupaccountingcodeid').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('ccrm_arupaccountingcodeid').getValue() == null ? null : formContext.getAttribute('ccrm_arupaccountingcodeid').getValue()[0].name);
                    break;

                case 10038:
                    guid = formContext.getAttribute('ccrm_countryid').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('ccrm_countryid').getValue() == null ? null : formContext.getAttribute('ccrm_countryid').getValue()[0].name);
                    break;

                case 10043:
                    guid = formContext.getAttribute('ccrm_arupbusinessid').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('ccrm_arupbusinessid').getValue() == null ? null : formContext.getAttribute('ccrm_arupbusinessid').getValue()[0].name);
                    break;

                case 1:
                    guid = formContext.getAttribute('ccrm_organisation').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('ccrm_organisation').getValue() == null ? null : formContext.getAttribute('ccrm_organisation').getValue()[0].name);
                    break;

                case 10047:
                    guid = formContext.getAttribute('ccrm_arupgroupid').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('ccrm_arupgroupid').getValue() == null ? null : formContext.getAttribute('ccrm_arupgroupid').getValue()[0].name);
                    break;

                case 770000000:
                    entityId = 10090;
                    guid = formContext.getAttribute('arup_clientgroupings').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('arup_clientgroupings').getValue() == null ? null : formContext.getAttribute('arup_clientgroupings').getValue()[0].name);
                    break;

                case 770000001:
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('arup_othernetworks').getValue() == null ? null : formContext.getAttribute('arup_othernetworks').getText());
                    break;

                default:
                    formContext.getAttribute('ccrm_lname').setValue(null);

            }

            switch (entityId1) {

                case 3:
                    guid1 = formContext.getAttribute('ccrm_opportunityid1').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname1').setValue(formContext.getAttribute('ccrm_opportunityid1').getValue() == null ? null : formContext.getAttribute('ccrm_opportunityid1').getValue()[0].name);
                    break;

                case 10029:
                    guid1 = formContext.getAttribute('ccrm_arupregionid1').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname1').setValue(formContext.getAttribute('ccrm_arupregionid1').getValue() == null ? null : formContext.getAttribute('ccrm_arupregionid1').getValue()[0].name);
                    break;

                case 8:
                    guid1 = formContext.getAttribute('ccrm_userid1').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname1').setValue(formContext.getAttribute('ccrm_userid1').getValue() == null ? null : formContext.getAttribute('ccrm_userid1').getValue()[0].name);
                    break;

                case 10054:
                    guid1 = formContext.getAttribute('ccrm_arupaccountingcodeid1').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname1').setValue(formContext.getAttribute('ccrm_arupaccountingcodeid1').getValue() == null ? null : formContext.getAttribute('ccrm_arupaccountingcodeid1').getValue()[0].name);
                    break;

                case 10038:
                    guid1 = formContext.getAttribute('ccrm_countryid1').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname1').setValue(formContext.getAttribute('ccrm_countryid1').getValue() == null ? null : formContext.getAttribute('ccrm_countryid1').getValue()[0].name);
                    break;

                case 10043:
                    guid1 = formContext.getAttribute('ccrm_arupbusinessid1').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname1').setValue(formContext.getAttribute('ccrm_arupbusinessid1').getValue() == null ? null : formContext.getAttribute('ccrm_arupbusinessid1').getValue()[0].name);
                    break;

                case 1:
                    guid1 = formContext.getAttribute('ccrm_organisationid1').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname1').setValue(formContext.getAttribute('ccrm_organisationid1').getValue() == null ? null : formContext.getAttribute('ccrm_organisationid1').getValue()[0].name);
                    break;

                case 10047:
                    guid1 = formContext.getAttribute('ccrm_arupgroupid1').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname1').setValue(formContext.getAttribute('ccrm_arupgroupid1').getValue() == null ? null : formContext.getAttribute('ccrm_arupgroupid1').getValue()[0].name);
                    break;

                case 770000000:
                    entityId1 = 10090;
                    guid1 = formContext.getAttribute('arup_clientgrouping1').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname1').setValue(formContext.getAttribute('arup_clientgrouping1').getValue() == null ? null : formContext.getAttribute('arup_clientgrouping1').getValue()[0].name);
                    break;

                case 770000001:
                    formContext.getAttribute('ccrm_lname1').setValue(formContext.getAttribute('arup_othernetworks1').getValue() == null ? null : formContext.getAttribute('arup_othernetworks1').getText());
                    break;

                default:
                    formContext.getAttribute('ccrm_lname1').setValue(null);

            }

            formContext.getAttribute('ccrm_type').setValue(entityId == null ? null : entityId.toString());
            formContext.getAttribute('ccrm_type1').setValue(entityId1 == null ? null : entityId1.toString());
            formContext.getAttribute('ccrm_guid').setValue(guid);
            formContext.getAttribute('ccrm_guid1').setValue(guid1);
            break;

        case 'Lead':

            //entityId = Xrm.Page.getAttribute('arup_relatedtolead').getValue();

            switch (formContext.getAttribute('arup_relatedtolead').getValue()) {

                case 770000005:
                    entityId = 4;
                    guid = formContext.getAttribute('arup_leadleadid').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('arup_leadleadid').getValue() == null ? null : formContext.getAttribute('arup_leadleadid').getValue()[0].name);
                    break;

                case 770000003:
                    entityId = 10029;
                    guid = formContext.getAttribute('arup_leadregionid').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('arup_leadregionid').getValue() == null ? null : formContext.getAttribute('arup_leadregionid').getValue()[0].name);
                    break;

                case 770000009: //procurement
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('arup_leadprocurement').getValue() == null ? null : formContext.getAttribute('arup_leadprocurement').getText());
                    break;

                case 770000000:
                    entityId = 10054;
                    guid = formContext.getAttribute('arup_leadacctcentreid').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('arup_leadacctcentreid').getValue() == null ? null : formContext.getAttribute('arup_leadacctcentreid').getValue()[0].name);
                    break;

                case 770000004:
                    entityId = 10038;
                    guid = formContext.getAttribute('arup_leadcountryid').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('arup_leadcountryid').getValue() == null ? null : formContext.getAttribute('arup_leadcountryid').getValue()[0].name);
                    break;

                case 770000001:
                    entityId = 10043;
                    guid = formContext.getAttribute('arup_leadbusinessid').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('arup_leadbusinessid').getValue() == null ? null : formContext.getAttribute('arup_leadbusinessid').getValue()[0].name);
                    break;

                case 770000006:
                    entityId = 1;
                    guid = formContext.getAttribute('arup_leadclientid').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('arup_leadclientid').getValue() == null ? null : formContext.getAttribute('arup_leadclientid').getValue()[0].name);
                    break;

                case 770000002:
                    entityId = 10047;
                    guid = formContext.getAttribute('arup_leadgroupid').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('arup_leadgroupid').getValue() == null ? null : formContext.getAttribute('arup_leadgroupid').getValue()[0].name);
                    break;

                case 770000007:
                    entityId = 10090;
                    guid = formContext.getAttribute('arup_leadclientgroupid').getValue()[0].id;
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('arup_leadclientgroupid').getValue() == null ? null : formContext.getAttribute('arup_leadclientgroupid').getValue()[0].name);
                    break;

                case 770000008:
                    formContext.getAttribute('ccrm_lname').setValue(formContext.getAttribute('arup_leadnetworksmarkets').getValue() == null ? null : formContext.getAttribute('arup_leadnetworksmarkets').getText());
                    break;

                default:
                    formContext.getAttribute('ccrm_lname').setValue(null);

            }

            formContext.getAttribute('ccrm_type').setValue(entityId == null ? null : entityId.toString());
            formContext.getAttribute('ccrm_guid').setValue(guid);
            formContext.getAttribute('ccrm_type1').setValue(null);
            formContext.getAttribute('ccrm_guid1').setValue(null);
            formContext.getAttribute('ccrm_lname1').setValue(null);
            break;
    }

}

function onload(executionContext) {
    var formContext = executionContext.getFormContext();
    filterEventsBasedOnUserCurrency(formContext);
    onChangeccrm_crmeventid(executionContext);
}

function onChangeccrm_crmeventid(executionContext) {
    debugger;
    var formContext = executionContext.getFormContext();
    var oppRelated = 0;
    var leadRelated = 0;
    var frequency = 0;
    if (formContext.data.entity.attributes.get("ccrm_crmeventid").getValue() == null) { return; }

    var eventID = formContext.data.entity.attributes.get("ccrm_crmeventid").getValue()[0].id;

    Xrm.WebApi.online.retrieveRecord("ccrm_crmevent", eventID, "?$select=arup_relatedentity").then(
        function success(result) {
            var arup_relatedentity = result["arup_relatedentity"];          

            switch (arup_relatedentity) {

                case 770000000: //opportunity
                    selectedEntity = 'Opportunity';
                    oppRelated = true;
                    frequency = true;
                    formContext.getAttribute("ccrm_relatingto").fireOnChange();
                    formContext.getAttribute("ccrm_relatingto1").fireOnChange();
                    break;

                case 770000001: //lead
                    selectedEntity = 'Lead';
                    leadRelated = true;
                    frequency = true;
                    formContext.getAttribute("arup_relatedtolead").fireOnChange();
                    break;

                default: // null
                    break;
            }

            formContext.ui.tabs.get("General_Tab").sections.get("Opportunity_Related").setVisible(oppRelated);
            formContext.ui.tabs.get("General_Tab").sections.get("Opportunity_Related1").setVisible(oppRelated);
            formContext.ui.tabs.get("General_Tab").sections.get("Lead_Related").setVisible(leadRelated);
            formContext.getControl('ccrm_relatingto').setVisible(oppRelated);
            formContext.getControl('arup_relatedtolead').setVisible(leadRelated);
            formContext.getControl('ccrm_addmorecriteria').setVisible(oppRelated);
            formContext.getControl('arup_excludearupinternal').setVisible(oppRelated);
            if (oppRelated) {
                formContext.getAttribute("ccrm_addmorecriteria").fireOnChange();
            }
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );

}

function onChangearup_relatedtolead(executionContext, arrfields) {
    var formContext = executionContext.getFormContext();
    var fields = arrfields;
    var visibleField = null;
    var related = formContext.data.entity.attributes.get("arup_relatedtolead").getValue();

    switch (related) {

        case 770000000: //acct centre
            visibleField = 'arup_leadacctcentreid';
            break;

        case 770000001: //business
            visibleField = 'arup_leadbusinessid';
            break;

        case 770000002: //group
            visibleField = 'arup_leadgroupid';
            break;

        case 770000003: //region
            visibleField = 'arup_leadregionid';
            break;

        case 770000004: //country
            visibleField = 'arup_leadcountryid';
            break;

        case 770000005: //lead
            visibleField = 'arup_leadleadid';
            break;

        case 770000006: //organisations
            visibleField = 'arup_leadclientid';
            client = 1;
            break;

        case 770000007: //client grouping
            visibleField = 'arup_leadclientgroupid';
            break;

        case 770000008: //Related Networks & Markets
            visibleField = 'arup_leadnetworksmarkets';
            break;

        case 770000009: //Procurement
            visibleField = 'arup_leadprocurement';
            break;
    }

    if (visibleField != null) {
        formContext.getAttribute(visibleField).setRequiredLevel('required');
        formContext.getControl(visibleField).setVisible(true);
        fields = removeField(fields, visibleField);
    }
    hideAndNullifyFields(formContext, fields);

}

function onChangeRelatedTo(executionContext, relatingToField, arrfields) {
    var formContext = executionContext.getFormContext();
    var relatingTo = formContext.getAttribute(relatingToField).getValue();
    var fields = arrfields;
    var visibleField = null;

    switch (relatingTo) {

        case 3:
            visibleField = relatingToField == "ccrm_relatingto" ? "ccrm_opportunityid" : "ccrm_opportunityid1";
            break;

        case 10029:
            visibleField = relatingToField == "ccrm_relatingto" ? "ccrm_newarupregionid" : "ccrm_arupregionid1";
            break;

        case 8:
            visibleField = relatingToField == "ccrm_relatingto" ? "ccrm_user" : "ccrm_userid1";
            break;

        case 10054:
            visibleField = relatingToField == "ccrm_relatingto" ? "ccrm_arupaccountingcodeid" : "ccrm_arupaccountingcodeid1";
            break;

        case 10038:
            visibleField = relatingToField == "ccrm_relatingto" ? "ccrm_countryid" : "ccrm_countryid1";
            break;

        case 10043:
            visibleField = relatingToField == "ccrm_relatingto" ? "ccrm_arupbusinessid" : "ccrm_arupbusinessid1";
            break;

        case 1:
            visibleField = relatingToField == "ccrm_relatingto" ? "ccrm_organisation" : "ccrm_organisationid1";
            break;

        case 10047:
            visibleField = relatingToField == "ccrm_relatingto" ? "ccrm_arupgroupid" : "ccrm_arupgroupid1";
            break;

        case 770000000:
            visibleField = relatingToField == "ccrm_relatingto" ? "arup_clientgroupings" : "arup_clientgrouping1";
            break;

        case 770000001:
            visibleField = relatingToField == "ccrm_relatingto" ? "arup_othernetworks" : "arup_othernetworks1";
            break;
    }

    if (visibleField != null) {
        formContext.getAttribute(visibleField).setRequiredLevel('required');
        formContext.getControl(visibleField).setVisible(true);
        fields = removeField(fields, visibleField);
    }
    hideAndNullifyFields(formContext, fields);

}

function hideAndNullifyFields(formContext, fields) {
    var length = fields.length;
    var fieldName = null;
    for (var i = 0; i < length; i++) {
        fieldName = fields[i];
        formContext.getControl(fieldName).setVisible(false);
        formContext.getAttribute(fieldName).setRequiredLevel('none');
        formContext.getAttribute(fieldName).setValue(null);
    }
}

function removeField(fields, fieldName) {
    var index = fields.indexOf(fieldName);
    if (index > -1) {
        fields.splice(index, 1);
    }
    return (fields);
}

function ccrm_addmorecriteria_onChange(executionContext, fields) {
    var formContext = executionContext.getFormContext();
    var addMoreCriteria = formContext.data.entity.attributes.get("ccrm_addmorecriteria").getValue();
    if (addMoreCriteria == 0) {
        hideAndNullifyFields(formContext, fields);
    }
    else {
        formContext.getControl("ccrm_relatingto1").setVisible(true);
        formContext.getAttribute("ccrm_relatingto1").setRequiredLevel('required');
    }
}

function filterEventsBasedOnUserCurrency(formContext) {
    try {
        if (formContext.context.getUserId() != null && formContext.context.getUserId() != undefined) {
            formContext.getControl("ccrm_crmeventid").addPreSearch(function () {
                addCustomCurrencyFilter(formContext);
            })
        }

    } catch (e) {

    }
}

function addCustomCurrencyFilter(formContext) {
    var functionName = "addCustomCurrencyFilter";
    var recordId = formContext.data.entity.getId();
    var userId = formContext.context.getUserId();
    userId = userId.substring(1, userId.length - 1);
    var currencyFetchfromUser = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>\
    <entity name='usersettings' >\
    <attribute name='transactioncurrencyid' />\
    <filter>\
      <condition attribute='systemuserid' operator='eq' value='"+ userId + "' />\
    </filter>\
    <link-entity name='transactioncurrency' from='transactioncurrencyid' to='transactioncurrencyid' link-type='inner' alias='currency' >\
      <attribute name='isocurrencycode' />\
      <attribute name='currencyname' />\
    </link-entity>\
     </entity>\
    </fetch>"
    var currencyRecord = XrmServiceToolkit.Soap.Fetch(currencyFetchfromUser);

    if (currencyRecord.length > 0) {
        if (currencyRecord[0].attributes["currency.isocurrencycode"] != undefined) {
            userCurrency = currencyRecord[0].attributes["currency.isocurrencycode"].value;
            if (userCurrency != "GBP" && userCurrency != "HKD" && userCurrency != "USD" && userCurrency != "AUD" && userCurrency != "EUR")
                userCurrency = "GBP";
        }
    }
    else {
        userCurrency = "GBP";
    }
    //var userCurrency = "GBP";
    var filter = "<filter type='and'>\
      <filter type='or'>\
        <filter type='and'>\
          <condition attribute='ccrm_name' operator='like' value='%(" + userCurrency + ")%' />\
          <filter type='or'>\
            <condition attribute='ccrm_name' operator='like' value='%Possible Job Number has been assigned with a potential total bid cost over%' />\
            <condition attribute='ccrm_name' operator='like' value='%Opportunity has been created with a potential Fee Income over%' />\
          </filter>\
        </filter>\
        <filter type='and'>\
          <condition attribute='ccrm_name' operator='not-like' value='%Opportunity has been created with a potential Fee Income over%' />\
          <condition attribute='ccrm_name' operator='not-like' value='%Possible Job Number has been assigned with a potential total bid cost over%' />\
        </filter>\
      </filter>\
    </filter>"
    if (userId != null && userId != undefined) {
        formContext.getControl("ccrm_crmeventid").addCustomFilter(filter);
    }

}

function calculateRelatedTo() {

    return 'Test Opportunity';

}

function calculateRelatedTo1() {

    return 'Test Lead';

}

function errorHandler(error) {

    Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
        '<font size="3" color="#000000"></br>' + error.message + '</font>',
        [
            { label: "<b>OK</b>", setFocus: true },
        ], "ERROR", 500, 350, '', true);
}