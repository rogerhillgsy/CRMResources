function onChangeCheckOrganisationCreditRisk(executionContext) {
    var formContext = executionContext.getFormContext();
    var today = new Date();
    formContext.getAttribute("ccrm_lastcreditchecked").setValue(today);
}

function onChangeCheckOrganisationDiligenceRisk(executionContext) {
    var formContext = executionContext.getFormContext();
    var today = new Date();
    formContext.getAttribute("arup_lastddcheckdate").setValue(today);
}

//display icon for the viewcolumn  
function displayCreditIcon(rowData) {
    var str = JSON.parse(rowData);
    var creditRisk = str.arup_creditcheck_Value;
    switch (creditRisk) {
        case 1:
            resource = "arup_Green_Light";
            break;
        case 2:
            resource = "arup_Amber_Light";
            break;
        case 3:
            resource = "arup_Red_Light";
            break;
        case 4:
            resource = "arup_Grey_Light";
            break;
    }
    var resultarray = [resource];
    return resultarray;
}

function displayDiligenceIcon(rowData) {
    var str = JSON.parse(rowData);
    var diligenceRisk = str.arup_duediligencecheck_Value;
    switch (diligenceRisk) {
        case 1:
            resource = "arup_Green_Light";
            break;
        case 3:
            resource = "arup_Red_Light";
            break;
        case 7:
            resource = "arup_Grey_Light";
            break;
    }
    var resultarray = [resource];
    return resultarray;
}

function onChangeCheckDiligenceRisk(executionContext) {
    var formContext = executionContext.getFormContext();
    var diligenceRisk = formContext.getAttribute("arup_duediligencecheck").getValue();

    if (diligenceRisk != null) {
        var sourceUrl = formContext.getControl("WebResource_Due_Diligence_Check").getSrc();
        var sourceString = sourceUrl.toString();
        var url = sourceString.substring(0, sourceString.lastIndexOf('/'));
        var targetUrl, resource, title = "";
        switch (diligenceRisk) {
            case 1:
                resource = "/arup_Green_Light";
                title = "No Sanctions";
                break;
            case 2:
                resource = "/arup_Green_Light";
                title = "No Sanctions (OOL)";
                break;
            case 3:
                resource = "/arup_Red_Light";
                title = "Sanctioned";
                break;
            case 8:
                resource = "/arup_Grey_Light";
                title = "Manual Check Needed";
                break;
            default:
                break;
        }
        targetUrl = url.concat(resource);
        formContext.getControl("WebResource_Due_Diligence_Check").setSrc(targetUrl);
        formContext.getControl("WebResource_Due_Diligence_Check").getObject().title = title;
    }
}

function onChangeCheckCreditRisk(executionContext) {
    var formContext = executionContext.getFormContext();
    var creditRisk = formContext.getAttribute("arup_creditcheck").getValue();

    if (creditRisk != null) {
        var sourceUrl = formContext.getControl("WebResource_Credit_Check").getSrc();
        var sourceString = sourceUrl.toString();
        var url = sourceString.substring(0, sourceString.lastIndexOf('/'));
        var targetUrl, resource, title = "";
        switch (creditRisk) {
            case 1:
                resource = "/arup_Green_Light";
                title = "Low Risk";
                break;
            case 2:
                resource = "/arup_Amber_Light";
                title = "Medium Risk";
                break;
            case 3:
                resource = "/arup_Red_Light";
                title = "High Risk";
                break;
            case 4:
                resource = "/arup_Grey_Light";
                title = "Credit Check Not Needed";
                break;
            case 5:
                resource = "/arup_Border_Light";
                title = "No Information";
                break;
            default:
                break;
        }
        targetUrl = url.concat(resource);
        formContext.getControl("WebResource_Credit_Check").setSrc(targetUrl);
        formContext.getControl("WebResource_Credit_Check").getObject().title = title;
    }
}
