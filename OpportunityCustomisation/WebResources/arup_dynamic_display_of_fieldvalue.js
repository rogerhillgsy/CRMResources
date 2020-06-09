var setDefaultValue = false;
var optionsetReadOnly;
var optionsetDefaultValue;
var isOptionSetSelectedValueValid = false;
var optionsetSelectedValue;

function GetDependentOptionSetFieldValues(executionContext, mainOptionsetFieldName, dependentOptionsetFieldName) {
debugger;
    var formContext = executionContext.getFormContext();
    var mainOptionSetFieldValue = formContext.getAttribute(mainOptionsetFieldName).getValue();

    optionsetDefaultValue = null;
    optionsetReadOnly = true;
    var entityName = formContext.data.entity.getEntityName();
    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/arup_crmfieldconfigurations?$select=arup_dependentfieldvalue,arup_isdependentfielddefaultvalue,arup_isdependentfieldreadonly&$filter=arup_mainoptionsetfieldname eq '" + mainOptionsetFieldName + "' and  arup_dependentfieldname eq '" + dependentOptionsetFieldName + "' and  arup_mainoptionsetfieldvalue eq '" + mainOptionSetFieldValue + "' and arup_isdependentoptionset eq true and arup_entityname eq '" + entityName + "'", true);
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

                    OptionSetAddRemove(dependentOptionsetFieldName, results, formContext);

                    if (setDefaultValue == true) {
                        formContext.getAttribute(dependentOptionsetFieldName).setValue(parseInt(optionsetDefaultValue));
                    }
                    else if (isOptionSetSelectedValueValid)
                        formContext.getAttribute(dependentOptionsetFieldName).setValue(parseInt(optionsetSelectedValue));

                    if (formContext.getAttribute("statecode") == null || formContext.getAttribute("statecode").getValue() == 0)
                        formContext.getControl(dependentOptionsetFieldName).setDisabled(optionsetReadOnly);
                }
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
}

function OptionSetAddRemove(optionsetName, results, formContext) {
    var optionSet = formContext.ui.controls.get(optionsetName);
    var optionSetValues = optionSet.getAttribute().getOptions();
    optionsetSelectedValue = formContext.getAttribute(optionsetName).getValue();
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

function fireOnFormLoad(executionContext, attributename) {
    var formContext = executionContext.getFormContext();
    formContext.getAttribute(attributename).fireOnChange();
}

function GetDependentFieldValues(executionContext) {
    var formContext = executionContext.getFormContext();
    var attribute = executionContext.getEventSource();
    var mainOptionsetFieldName = attribute.getName();
    var mainOptionSetFieldValue = attribute.getValue();

    var entityName = formContext.data.entity.getEntityName();
    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/arup_crmfieldconfigurations?$select=arup_dependentfieldvalue,arup_dependentfieldname&$filter=arup_mainoptionsetfieldname eq '" + mainOptionsetFieldName + "' and  arup_mainoptionsetfieldvalue eq '" + mainOptionSetFieldValue + "' and arup_isdependentoptionset eq false and arup_entityname eq '" + entityName + "'", true);
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
                        formContext.getAttribute(dependentFieldName).setValue(dependentFieldDefaultValue);
                    }
                }
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
}


