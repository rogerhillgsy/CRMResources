function Form_onload(executionContext) {
    //if the name changes
    name_onchange(executionContext);
}

function name_onchange (executionContext) {
    //set the name to be region and track
    var formContext = executionContext.getFormContext();

    if (formContext.getAttribute("ccrm_arupregionid").getValue() != null && formContext.getAttribute("ccrm_opportunitytype").getValue() != null) {
        formContext.getAttribute("ccrm_name").setValue(formContext.getAttribute("ccrm_opportunitytype").getSelectedOption().text + " - " + formContext.getAttribute("ccrm_arupregionid").getValue()[0].name);
    }
}

function validateXML_onchange(executionContext) {
    var formContext = executionContext.getFormContext();

    var strXML = formContext.getAttribute("ccrm_opportunitytrackfetchxml").getValue();
    var str1 = "<fetch mapping='logical'>";
    var str2 = "<entity name='opportunity'>";
    var str3 = "<filter type=";
    var str4 = "<condition attribute=";
    var str5 = "<condition attribute='opportunityid' operator='eq' value='{0}'/>"
    var str6 = "</filter>";
    var str7 = "</entity>";
    var str8 = "</fetch>";

    if (strXML.indexOf(str1) < 0) {
        alert("Validation 1: Please include the text [<fetch mapping='logical'>]");
        formContext.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
    if (strXML.indexOf(str2) < 0) {
        alert("Validation 2: Please include the text [<entity name='opportunity'>]");
        formContext.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
    if (strXML.indexOf(str3) < 0) {
        alert("Validation 3: Please include the text [filter type]");
        formContext.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
    if (strXML.indexOf(str4) < 0) {
        alert("Validation 4: Please include the text [condition attribute]");
        formContext.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
    if (strXML.indexOf(str5) < 0) {
        alert("Validation 5: Please include the text [<condition attribute='opportunityid' operator='eq' value='{0}'/>]");
        formContext.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
    if (strXML.indexOf(str6) < 0) {
        alert("Validation 6: Please include the text [</filter>]");
        formContext.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
    if (strXML.indexOf(str7) < 0) {
        alert("Validation 7: Please include the text [</entity>]");
        formContext.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
    if (strXML.indexOf(str8) < 0) {
        alert("Validation 8: Please include the text [</fetch>]");
        formContext.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
}