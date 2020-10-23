///<reference path="../Intellisense/Xrm.Page.2013.js"/>
///<reference path="../Library/SDK.REST.js"/>

if (typeof (arup) == "undefined") {
    arup = {};
}

arup.OnLoad = function (executionContext) {
    var formContext = executionContext.getFormContext();
    arup.ShowHide(formContext, "arup_isacccentrefromuserprofile", "arup_relatingtoacccentre");
    arup.ShowHide(formContext, "arup_iscountryfromuserprofile", "arup_relatingtocountry");
    arup.ShowHide(formContext, "arup_isgroupfromuserprofile", "arup_relatingtogroup");
    arup.ShowHide(formContext, "arup_isregionfromuserprofile", "arup_relatingtoregion");
    arup.ShowHide(formContext, "arup_isuserfromuserprofile", "arup_relatingtouser");
    arup.SetEntityTypeAndGuid(formContext, "arup_relatingtoacccentre");
    arup.SetEntityTypeAndGuid(formContext, "arup_relatingtogroup");
    arup.SetEntityTypeAndGuid(formContext, "arup_relatingtocountry");
    arup.SetEntityTypeAndGuid(formContext, "arup_relatingtoregion");
    arup.SetEntityTypeAndGuid(formContext, "arup_relatingtoarupbusiness");
    arup.SetEntityTypeAndGuid(formContext, "arup_relatingtoorganisation");
    arup.SetEntityTypeAndGuid(formContext, "arup_relatingtouser");
}

arup.ShowHide = function (formContext, optionfield, lookupfield) {
    //if user profile is selected hide the further selection fields and clear it as well
    if (formContext.getAttribute(optionfield).getValue() == true || formContext.getAttribute(optionfield).getValue() == null) {
        formContext.getControl(lookupfield).setVisible(false);
        formContext.getAttribute(lookupfield).setValue(null);
    }
    else {
        formContext.getControl(lookupfield).setVisible(true);
    }
}

arup.SetEntityTypeAndGuid = function (formContext, fieldName) {
    switch (fieldName) {
        case "arup_relatingtoacccentre":
            if (formContext.getAttribute("arup_acccentreentityschemaname").getValue() != "ccrm_arupaccountingcode") {
                formContext.getAttribute("arup_acccentreentityschemaname").setValue("ccrm_arupaccountingcode");
            }
            arup.SetGuid(formContext, fieldName, "arup_selectedacccentreguid");
            break;
        case "arup_relatingtogroup":
            if (formContext.getAttribute("arup_groupentityschemaname").getValue() != "ccrm_arupgroup") {
                formContext.getAttribute("arup_groupentityschemaname").setValue("ccrm_arupgroup");
            }
            arup.SetGuid(formContext, fieldName, "arup_selectedgroupguid");
            break;
        case "arup_relatingtocountry":
            if (formContext.getAttribute("arup_countryentityschemaname").getValue() != "ccrm_country") {
                formContext.getAttribute("arup_countryentityschemaname").setValue("ccrm_country");
            }
            arup.SetGuid(formContext, fieldName, "arup_selectedcountryguid");
            break;
        case "arup_relatingtoregion":
            if (formContext.getAttribute("arup_regionentityschemaname").getValue() != "ccrm_arupregion") {
                formContext.getAttribute("arup_regionentityschemaname").setValue("ccrm_arupregion");
            }
            arup.SetGuid(formContext, fieldName, "arup_selectedregionguid");
            break;
        case "arup_relatingtoarupbusiness":
            if (formContext.getAttribute("arup_arupbusientityschemaname").getValue() != "ccrm_arupbusiness") {
                formContext.getAttribute("arup_arupbusientityschemaname").setValue("ccrm_arupbusiness");
            }
            arup.SetGuid(formContext, fieldName, "arup_selectedarupbusiguid");
            break;
        case "arup_relatingtoorganisation":
            if (formContext.getAttribute("arup_orgentityschemaname").getValue() != "account") {
                formContext.getAttribute("arup_orgentityschemaname").setValue("account");
            }
            arup.SetGuid(formContext, fieldName, "arup_selectedorgguid");
            break;
        case "arup_relatingtouser":
            arup.SetGuid(formContext, fieldName, "arup_selecteduserguid");
            break;
    }
}

arup.SetGuid = function (formContext, fieldName, fieldToSet) {
    var fieldVal = formContext.getAttribute(fieldName).getValue();
    if (fieldVal != null) {
        var GuidToSet = fieldVal[0].id;
        if (formContext.getAttribute(fieldToSet).getValue() != GuidToSet) {
            formContext.getAttribute(fieldToSet).setValue(GuidToSet);
        }
    }
    else {
        formContext.getAttribute(fieldToSet).setValue(null);
    }
}