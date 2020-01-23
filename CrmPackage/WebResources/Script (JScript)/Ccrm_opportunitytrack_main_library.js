function Form_onload() {
    //if the name changes
    name_onchange();
}

name_onchange = function () {
    //set the name to be region and track
    if (Xrm.Page.getAttribute("ccrm_arupregionid").getValue() != null && Xrm.Page.getAttribute("ccrm_opportunitytype").getValue() != null) {
        Xrm.Page.getAttribute("ccrm_name").setValue(Xrm.Page.getAttribute("ccrm_opportunitytype").getSelectedOption().text + " - " + Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name);
    }
}

validateXML_onchange = function () {
    var strXML = Xrm.Page.getAttribute("ccrm_opportunitytrackfetchxml").getValue();
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
        Xrm.Page.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
    if (strXML.indexOf(str2) < 0) {
        alert("Validation 2: Please include the text [<entity name='opportunity'>]");
        Xrm.Page.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
    if (strXML.indexOf(str3) < 0) {
        alert("Validation 3: Please include the text [filter type]");
        Xrm.Page.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
    if (strXML.indexOf(str4) < 0) {
        alert("Validation 4: Please include the text [condition attribute]");
        Xrm.Page.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
    if (strXML.indexOf(str5) < 0) {
        alert("Validation 5: Please include the text [<condition attribute='opportunityid' operator='eq' value='{0}'/>]");
        Xrm.Page.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
    if (strXML.indexOf(str6) < 0) {
        alert("Validation 6: Please include the text [</filter>]");
        Xrm.Page.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
    if (strXML.indexOf(str7) < 0) {
        alert("Validation 7: Please include the text [</entity>]");
        Xrm.Page.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
    if (strXML.indexOf(str8) < 0) {
        alert("Validation 8: Please include the text [</fetch>]");
        Xrm.Page.getAttribute("ccrm_opportunitytrackfetchxml").setValue(null);
    }
}