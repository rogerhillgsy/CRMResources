///<reference path="../Intellisense/Xrm.Page.2013.js"/>
///<reference path="../Library/SDK.REST.js"/>

if (typeof(arup) == "undefined")
{
    arup = {};
}

arup.OnLoad = function()
{
    arup.ShowHide("arup_isacccentrefromuserprofile", "arup_relatingtoacccentre");
    arup.ShowHide("arup_iscountryfromuserprofile", "arup_relatingtocountry");
    arup.ShowHide("arup_isgroupfromuserprofile", "arup_relatingtogroup");
    arup.ShowHide("arup_isregionfromuserprofile", "arup_relatingtoregion");
    arup.ShowHide("arup_isuserfromuserprofile", "arup_relatingtouser");
    arup.SetEntityTypeAndGuid("arup_relatingtoacccentre");
    arup.SetEntityTypeAndGuid("arup_relatingtogroup");
    arup.SetEntityTypeAndGuid("arup_relatingtocountry");
    arup.SetEntityTypeAndGuid("arup_relatingtoregion");
    arup.SetEntityTypeAndGuid("arup_relatingtoarupbusiness");
    arup.SetEntityTypeAndGuid("arup_relatingtoorganisation");
    arup.SetEntityTypeAndGuid("arup_relatingtouser");
}

arup.ShowHide = function(optionfield,lookupfield)
{
    //if user profile is selected hide the further selection fields and clear it as well
    if (Xrm.Page.getAttribute(optionfield).getValue() == true || Xrm.Page.getAttribute(optionfield).getValue() == null)
    {
        Xrm.Page.getControl(lookupfield).setVisible(false);
        Xrm.Page.getAttribute(lookupfield).setValue(null);
    }
    else
    {
        Xrm.Page.getControl(lookupfield).setVisible(true);
    }
}

arup.SetEntityTypeAndGuid = function(fieldName)
{
    switch(fieldName)
    {
        case "arup_relatingtoacccentre":
            if (Xrm.Page.getAttribute("arup_acccentreentityschemaname").getValue() != "ccrm_arupaccountingcode")
            {
                Xrm.Page.getAttribute("arup_acccentreentityschemaname").setValue("ccrm_arupaccountingcode");
            }
            arup.SetGuid(fieldName, "arup_selectedacccentreguid");
            break;
        case "arup_relatingtogroup":
            if (Xrm.Page.getAttribute("arup_groupentityschemaname").getValue() != "ccrm_arupgroup")
            {
                Xrm.Page.getAttribute("arup_groupentityschemaname").setValue("ccrm_arupgroup");
            }
            arup.SetGuid(fieldName, "arup_selectedgroupguid");
            break;
        case "arup_relatingtocountry":
            if (Xrm.Page.getAttribute("arup_countryentityschemaname").getValue() != "ccrm_country")
            {
                Xrm.Page.getAttribute("arup_countryentityschemaname").setValue("ccrm_country");
            }
            arup.SetGuid(fieldName, "arup_selectedcountryguid");
            break;
        case "arup_relatingtoregion":
            if (Xrm.Page.getAttribute("arup_regionentityschemaname").getValue() != "ccrm_arupregion")
            {
                Xrm.Page.getAttribute("arup_regionentityschemaname").setValue("ccrm_arupregion");
            }
            arup.SetGuid(fieldName, "arup_selectedregionguid");
            break;
        case "arup_relatingtoarupbusiness":
            if (Xrm.Page.getAttribute("arup_arupbusientityschemaname").getValue() != "ccrm_arupbusiness")
            {
                Xrm.Page.getAttribute("arup_arupbusientityschemaname").setValue("ccrm_arupbusiness");
            }
            arup.SetGuid(fieldName, "arup_selectedarupbusiguid");
            break;
        case "arup_relatingtoorganisation":
            if (Xrm.Page.getAttribute("arup_orgentityschemaname").getValue() != "account")
            {
                Xrm.Page.getAttribute("arup_orgentityschemaname").setValue("account");
            }
            arup.SetGuid(fieldName, "arup_selectedorgguid");
            break;
        case "arup_relatingtouser":
            arup.SetGuid(fieldName, "arup_selecteduserguid");
            break;
    }
}

arup.SetGuid = function(fieldName,fieldToSet)
{
    var fieldVal = Xrm.Page.getAttribute(fieldName).getValue();
    if(fieldVal != null)
    {
        var GuidToSet = fieldVal[0].id;
        if (Xrm.Page.getAttribute(fieldToSet).getValue() != GuidToSet)
        {
            Xrm.Page.getAttribute(fieldToSet).setValue(GuidToSet);
        }
    }
    else
    {
        Xrm.Page.getAttribute(fieldToSet).setValue(null);
    }
}