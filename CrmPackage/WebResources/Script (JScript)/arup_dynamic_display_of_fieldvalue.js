﻿var setDefaultValue = false;
var optionsetReadOnly;
var optionsetDefaultValue;
var isOptionSetSelectedValueValid = false;
var optionsetSelectedValue;

function GetDependentOptionSetFieldValues(mainOptionsetFieldName, dependentOptionsetFieldName) {

    //var attribute = executionContext.getEventSource();
    //var mainOptionsetFieldName = attribute.getName();
    var mainOptionSetFieldValue = Xrm.Page.getAttribute(mainOptionsetFieldName).getValue();

    optionsetDefaultValue = null;
    optionsetReadOnly = true;
    var entityName = Xrm.Page.data.entity.getEntityName();
    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/arup_crmfieldconfigurations?$select=arup_dependentfieldvalue,arup_isdependentfielddefaultvalue,arup_isdependentfieldreadonly&$filter=arup_mainoptionsetfieldname eq '" + mainOptionsetFieldName + "' and  arup_dependentfieldname eq '" + dependentOptionsetFieldName + "' and  arup_mainoptionsetfieldvalue eq '" + mainOptionSetFieldValue + "' and arup_isdependentoptionset eq true and arup_entityname eq '" + entityName + "'", true);
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

                    OptionSetAddRemove(dependentOptionsetFieldName, results);

                    if (setDefaultValue == true) {
                        Xrm.Page.getAttribute(dependentOptionsetFieldName).setValue(optionsetDefaultValue);
                    }
                    else if (isOptionSetSelectedValueValid)
                        Xrm.Page.getAttribute(dependentOptionsetFieldName).setValue(optionsetSelectedValue);

                    if (Xrm.Page.getAttribute("statecode") == null || Xrm.Page.getAttribute("statecode").getValue() == 0)
                        Xrm.Page.getControl(dependentOptionsetFieldName).setDisabled(optionsetReadOnly);
                }
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
}

function OptionSetAddRemove(optionsetName, results) {
    var optionSet = Xrm.Page.ui.controls.get(optionsetName);
    var optionSetValues = optionSet.getAttribute().getOptions();
    optionsetSelectedValue = Xrm.Page.getAttribute(optionsetName).getValue();
    isOptionSetSelectedValueValid = false;
    optionSet.clearOptions();


    optionSetValues.forEach(function (element) {
        for (var i = 0; i < results.value.length; i++) {

            if (element.value == results.value[i]["arup_dependentfieldvalue"]) {

                optionSet.addOption(element);

                setDefaultValue = results.value[i]["arup_isdependentfielddefaultvalue"];

                if (setDefaultValue == true) {
                    optionsetDefaultValue = results.value[i]["arup_dependentfieldvalue"];
                }

                optionsetReadOnly = results.value[i]["arup_isdependentfieldreadonly"];

                if (results.value[i]["arup_dependentfieldvalue"] == optionsetSelectedValue) {
                    isOptionSetSelectedValueValid = true;
                }
            }
            //else {
            //    optionSet.removeOption(element);
            //}

        }

    });

    if (!setDefaultValue) {
        // check whether null (blank) is default value and read only
        for (var i = 0; i < results.value.length; i++) {
            if (results.value[i]["arup_dependentfieldvalue"] == null && results.value[i]["arup_isdependentfielddefaultvalue"]) {
                setDefaultValue = results.value[i]["arup_isdependentfielddefaultvalue"];
                optionsetDefaultValue = results.value[i]["arup_dependentfieldvalue"];
                if (results.value[i]["arup_isdependentfieldreadonly"]) {
                    optionsetReadOnly = results.value[i]["arup_isdependentfieldreadonly"];
                }
            }
        }
    }
}

function fireOnFormLoad(attributename) {


    Xrm.Page.getAttribute(attributename).fireOnChange();

}

function GetDependentFieldValues(executionContext) {

    var attribute = executionContext.getEventSource();
    var mainOptionsetFieldName = attribute.getName();
    var mainOptionSetFieldValue = attribute.getValue();

    var entityName = Xrm.Page.data.entity.getEntityName();
    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/arup_crmfieldconfigurations?$select=arup_dependentfieldvalue,arup_dependentfieldname&$filter=arup_mainoptionsetfieldname eq '" + mainOptionsetFieldName + "' and  arup_mainoptionsetfieldvalue eq '" + mainOptionSetFieldValue + "' and arup_isdependentoptionset eq false and arup_entityname eq '" + entityName + "'", true);
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
                    for (var i = 0; i < results.value.length; i++) {
                        var dependentFieldDefaultValue = results.value[i]["arup_dependentfieldvalue"];
                        var dependentFieldName = results.value[i]["arup_dependentfieldname"];
                        Xrm.Page.getAttribute(dependentFieldName).setValue(dependentFieldDefaultValue);
                    }
                }
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
}


