var cachefields = {};

function prepareCheckOptions(formContext) {
    cachefields['arup_duediligencecheck'] = formContext.getAttribute("arup_duediligencecheck").getValue();
    cachefields['arup_creditcheck'] = formContext.getAttribute("arup_creditcheck").getValue();
}

function onChangeCheckOrganisationCreditRisk(executionContext) {
    var formContext = executionContext.getFormContext();
    var creditRisk = formContext.getAttribute("arup_creditcheck").getValue();
    if (creditRisk == 6) {
        formContext.getAttribute("arup_creditcheck").setValue(cachefields['arup_creditcheck']);
    }
    var today = new Date();
    formContext.getAttribute("ccrm_lastcreditchecked").setValue(today);
}

function onChangeCheckOrganisationDiligenceRisk(executionContext) {
    var formContext = executionContext.getFormContext();
    var creditRisk = formContext.getAttribute("arup_duediligencecheck").getValue();
    if (creditRisk == 6) {
        formContext.getAttribute("arup_duediligencecheck").setValue(cachefields['arup_duediligencecheck']);
    }
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