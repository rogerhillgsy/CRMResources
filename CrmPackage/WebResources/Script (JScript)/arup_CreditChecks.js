function onChangeCheckOrganisationCreditRisk(executionContext) {
    var formContext = executionContext.getFormContext();
    var creditRisk = formContext.getAttribute("arup_creditcheck").getValue();
    var sourceUrl = formContext.getControl("WebResource_Credit_Check").getSrc();
    var sourceString = sourceUrl.toString();
    var url = sourceString.substring(0, sourceString.lastIndexOf('/'));
    var targetUrl = "", resource = "", cTitle = "";
    if (creditRisk != null) {
        switch (creditRisk) {
            case 1:
                resource = "/arup_Green_Light";
                cTitle = "Low Risk";
                break;
            case 2:
                resource = "/arup_Amber_Light";
                cTitle = "Medium Risk";
                break;
            case 3:
                resource = "/arup_Red_Light";
                cTitle = "High Risk";
                break;
            case 4:
                resource = "/arup_Grey_Light";
                cTitle = "Not Performed / No Information";
                break;
            case 6:
                var pTitle = formContext.getControl("WebResource_Credit_Check").getObject().title;
                break;
            default:
                break;
        }

        if (pTitle != undefined && pTitle != "") {
            switch (pTitle) {
                case "Low Risk":
                    resource = "/arup_Green_Light";
                    cTitle = pTitle;
                    formContext.getAttribute("arup_creditcheck").setValue(1);
                    break;
                case "Medium Risk":
                    resource = "/arup_Amber_Light";
                    cTitle = pTitle;
                    formContext.getAttribute("arup_creditcheck").setValue(2);
                    break;
                case "High Risk":
                    resource = "/arup_Red_Light";
                    cTitle = pTitle;
                    formContext.getAttribute("arup_creditcheck").setValue(3);
                    break;
                case "Not Performed / No Information":
                    resource = "/arup_Grey_Light";
                    cTitle = pTitle;
                    formContext.getAttribute("arup_creditcheck").setValue(4);
                    break;
                default:
                    break;
            }
        }
        else if (pTitle == "") {
            resource = "/arup_Grey_Light";
        }

        targetUrl = url.concat(resource);
        formContext.getControl("WebResource_Credit_Check").setSrc(targetUrl);
        formContext.getControl("WebResource_Credit_Check").getObject().title = cTitle;

        var creditRiskIsDirty = formContext.getAttribute("arup_creditcheck").getIsDirty();

        if (creditRiskIsDirty || cTitle == pTitle) {
            var today = new Date();
            formContext.getAttribute("ccrm_lastcreditchecked").setValue(today);
        }
    }
    else {
        targetUrl = url.concat("/arup_Grey_Light");
        formContext.getControl("WebResource_Credit_Check").setSrc(targetUrl);
        formContext.getControl("WebResource_Credit_Check").getObject().title = "Not Performed / No Information";
    }
}

function onChangeCheckOrganisationDiligenceRisk(executionContext) {
    var formContext = executionContext.getFormContext();
    var diligenceRisk = formContext.getAttribute("arup_duediligencecheck").getValue();

    var sourceUrl = formContext.getControl("WebResource_Due_Diligence_Check").getSrc();
    var sourceString = sourceUrl.toString();
    var url = sourceString.substring(0, sourceString.lastIndexOf('/'));
    var targetUrl = "", resource = "", title = "";
    if (diligenceRisk != null) {
        switch (diligenceRisk) {
            case 1:
                resource = "/arup_Green_Light";
                title = "No Sanctions";
                break;
            case 3:
                resource = "/arup_Red_Light";
                title = "Sanctioned";
                break;
            case 7:
                resource = "/arup_Grey_Light";
                title = "Not Checked";
                break;
            case 8:
                resource = "/arup_Grey_Light";
                title = "Manual Check Needed";
                break;
            case 6: formContext.getControl("WebResource_Due_Diligence_Check").getObject().title;
                break;
            default:
                break;
        }

        if (pTitle != undefined && pTitle != "") {
            switch (pTitle) {
                case "No Sanctions":
                    resource = "/arup_Green_Light";
                    title = pTitle;
                    formContext.getAttribute("arup_duediligencecheck").setValue(1);
                    break;
                case "Sanctioned":
                    resource = "/arup_Red_Light";
                    title = pTitle;
                    formContext.getAttribute("arup_duediligencecheck").setValue(3);
                    break;
                case "Not Checked":
                    resource = "/arup_Grey_Light";
                    title = pTitle;
                    formContext.getAttribute("arup_duediligencecheck").setValue(7);
                    break;
                case "Manual Check Needed":
                    resource = "/arup_Grey_Light";
                    title = pTitle;
                    formContext.getAttribute("arup_duediligencecheck").setValue(8);
                    break;
                default:
                    break;
            }
        }
        else if (pTitle == "") {
            resource = "/arup_Grey_Light";
        }

        targetUrl = url.concat(resource);
        formContext.getControl("WebResource_Due_Diligence_Check").setSrc(targetUrl);
        formContext.getControl("WebResource_Due_Diligence_Check").getObject().title = title;

        if (title == pTitle) {
            var today = new Date();
            formContext.getAttribute("arup_lastddcheckdate").setValue(today);
        }

    }
    else {
        targetUrl = url.concat("/arup_Grey_Light");
        formContext.getControl("WebResource_Due_Diligence_Check").setSrc(targetUrl);
        formContext.getControl("WebResource_Due_Diligence_Check").getObject().title = "Not Checked";
    }
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
