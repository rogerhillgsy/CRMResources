// To fire  On Change Event of Check Box immediately
function RegisterCheckboxClick(attr) {

    var ctrl = Xrm.Page.getControl(attr);
    var a = ctrl.getAttribute();
    var el = document.getElementById(attr);

    // Build Toggle Function
    var f = "var ef=function() { " +
        "var a = Xrm.Page.data.entity.attributes.get(attr); " +
        "a.setValue(!a.getValue()); a.fireOnChange();" +
        " };";

    eval(f);


    // Attach to click event
    if (myBrowserName() == "Microsoft Internet Explorer" && myIEVersion() <= 8) {
        el.attachEvent('onclick', ef, false);//this one up to IE8 	//  
    }
    else {
        el.addEventListener('onclick', ef, false);  //IE9+ FireFox Chrome //   
    }
}

function form_OnLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    parentOrg(formContext);
    formContext.getAttribute("ccrm_legalentityname").setRequiredLevel("none");
}

function form_OnSave(executionContext) {
    var formContext = executionContext.getFormContext();
    /copy name to legal entity name/
    formContext.getAttribute("ccrm_legalentityname").setValue(formContext.getAttribute("name").getValue());
}

function clear_state(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("ccrm_countryid").getValue() == null || formContext.getAttribute("ccrm_countryid").getValue() == "undefined") {
        formContext.getAttribute("ccrm_countrystate").setValue(null);
        formContext.getAttribute("address1_stateorprovince").setValue(null);
        return;
    }

    if (stateRequired(formContext.getAttribute("ccrm_countryid").getValue()[0].name)) {
        formContext.getAttribute("ccrm_countrystate").setValue(null);
    }
    else {
        formContext.getAttribute("address1_stateorprovince").setValue(null);
    }
}

DoNotContactMethodsPickList = function () {

    ShowAllPickListItems("preferredcontactmethodcode");

    if (Xrm.Page.getAttribute("donotemail").getValue() == true)
        HidePickListItem("preferredcontactmethodcode", "2");

    if (Xrm.Page.getAttribute("donotphone").getValue() == true)
        HidePickListItem("preferredcontactmethodcode", "3");

    if (Xrm.Page.getAttribute("donotfax").getValue() == true)
        HidePickListItem("preferredcontactmethodcode", "4");

    if (Xrm.Page.getAttribute("donotpostalmail").getValue() == true)
        HidePickListItem("preferredcontactmethodcode", "5");

    if (Xrm.Page.getAttribute("donotemail").getValue() == true || Xrm.Page.getAttribute("donotbulkemail").getValue() == true || Xrm.Page.getAttribute("donotphone").getValue() == true || Xrm.Page.getAttribute("donotfax").getValue() == true || Xrm.Page.getAttribute("donotpostalmail").getValue() == true)
        HidePickListItem("preferredcontactmethodcode", "1");
}

function stateVisibility(executionContext) {
    var formContext = executionContext.getFormContext();
    countryname = formContext.getAttribute("ccrm_countryid").getValue() != null ? formContext.getAttribute("ccrm_countryid").getValue()[0].name : null;
    if (countryname != null) {

        var flag;
        var required;
        countryname = countryname.toUpperCase();

        if (stateRequired(countryname)) {

            flag = true;
            required = 'required';

        }
        else {
            flag = false;
            required = 'none';
        }

        formContext.getControl("address1_stateorprovince").setVisible(!flag);
        formContext.getControl("ccrm_countrystate").setVisible(flag);
        formContext.getAttribute("ccrm_countrystate").setRequiredLevel(required);
    }
}

function stateRequired(CountryName) {

    CountryName = CountryName.toUpperCase();

    var states = (CountryName == "UNITED STATES" ||
        CountryName == "UNITED STATES OF AMERICA" ||
        CountryName == "CANADA" ||
        CountryName == "AUSTRALIA" ||
        CountryName == "INDONESIA" ||
        CountryName == "NEW ZEALAND" ||
        CountryName == "MALAYSIA" ||
        CountryName == "SINGAPORE");
    return states;
}

function parent_Org(executionContext) {
    var formContext = executionContext.getFormContext();
    parentOrg(formContext);
}

function parentOrg(formContext) {

    orgType = formContext.getAttribute("ccrm_organisationtype").getValue();

    var flag = false;
    //var required = 'none';

    if (orgType == "5") {
        flag = true;
        //required = 'required';
    }
    formContext.getControl("ccrm_parent2").setVisible(flag)
    formContext.getControl("ccrm_parent3").setVisible(flag)
}

ccrm_countryid_onchange = function () {
    //sync up country with countryid field
    syncCountry()
}

//function to sync up country with countryid field
syncCountry = function () {
    if (Xrm.Page.getAttribute("ccrm_countryid").getValue() != null) {
        //sync up country with countryid field
        Xrm.Page.getAttribute("address1_country").setValue(Xrm.Page.getAttribute("ccrm_countryid").getValue()[0].name);
    }
    else {
        Xrm.Page.getAttribute("address1_country").setValue(null);
    }
}


function HidePickListItem(listID, option) {
    var objList = Xrm.Page.getControl(listID);
    objList.removeOption(option);
}

function ShowAllPickListItems(listID) {

    var optionsetControl = Xrm.Page.getControl(listID);
    if (optionsetControl != null) {

        var options = optionsetControl.getAttribute().getOptions();
        optionsetControl.clearOptions();
        for (var i = 0; i < options.length; i++) {
            optionsetControl.addOption(options[i], i + 1);
        }
    }
}

function phoneOnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    var attribute = executionContext.getEventSource();
    if (formContext.getAttribute("ccrm_countryid").getValue() != null) {
        var countryId = formContext.getAttribute("ccrm_countryid").getValue()[0].id;
        var countryName = formContext.getAttribute("ccrm_countryid").getValue()[0].name;

        //var filter = "Ccrm_countryId eq (guid'" + countryId + "')";
        //var dataset = "Ccrm_countrySet";
        //var retrievedMultiple = ConsultCrm.Sync.RetrieveMultipleRequest(dataset, filter);
        //var results = retrievedMultiple.results;

        Xrm.WebApi.online.retrieveMultipleRecords("ccrm_country", "?$select=ccrm_mobilearray,ccrm_mobiledisplay,ccrm_mobileformat,ccrm_phonearray,ccrm_phonedisplay,ccrm_phoneformat&$filter=ccrm_countryid eq " + countryId + "").then(
            function success(results) {
                for (var i = 0; i < results.entities.length; i++) {
                    var ccrm_mobilearray = results.entities[i]["ccrm_mobilearray"];
                    var ccrm_mobiledisplay = results.entities[i]["ccrm_mobiledisplay"];
                    var ccrm_mobileformat = results.entities[i]["ccrm_mobileformat"];
                    var ccrm_phonearray = results.entities[i]["ccrm_phonearray"];
                    var ccrm_phonedisplay = results.entities[i]["ccrm_phonedisplay"];
                    var ccrm_phoneformat = results.entities[i]["ccrm_phoneformat"];

                    var phoneArray;
                    if (attribute.getName().indexOf("mobile") > -1) {
                        phoneArray = ccrm_mobilearray;
                    } else {
                        phoneArray = ccrm_phonearray
                    }

                    if (phoneArray != null) {
                        var phoneArraySplit = phoneArray.split(",");

                        var specialNumberArray = [];
                        var specialNumberDifference = 0;
                        var specialNumberMax = 0;
                        var specialNumberMin = 0;

                        function returnMaxMin(phoneArraySplit, index) {

                            specialNumberArray = phoneArraySplit[index];
                            specialNumberArray.split("-");
                            specialNumberDifference = +specialNumberArray[2] - +specialNumberArray[0];
                            specialNumberMax = Math.max(specialNumberArray[0], specialNumberArray[2]);
                            specialNumberMin = Math.min(specialNumberArray[0], specialNumberArray[2]);

                            return { max: specialNumberMax, min: specialNumberMin };
                        }

                        var phoneArraySize = 0;
                        var phoneArraySizeMin = 0;

                        for (i = 1; i < phoneArraySplit.length; i++) {
                            if (phoneArraySplit[i].indexOf("-") > -1) {
                                phoneArraySize = +phoneArraySize + +returnMaxMin(phoneArraySplit, i).max;
                                phoneArraySizeMin = +phoneArraySizeMin + +returnMaxMin(phoneArraySplit, i).min;
                            } else {
                                phoneArraySize = +phoneArraySplit[i] + +phoneArraySize;
                                phoneArraySizeMin = +phoneArraySplit[i] + +phoneArraySizeMin;
                            }
                        }

                        var orgPhone = formContext.getAttribute(attribute.getName()).getValue();
                        if (orgPhone != null) {
                            orgPhone = orgPhone.replace(/[^\d\+]/g, '');

                            // checks if the plus sign was used, if yes adds up the extra digits for country code in the phoneArray field
                            if (orgPhone.indexOf("+") > -1) {
                                phoneArraySize = +phoneArraySize + phoneArraySplit[0].length;
                                phoneArraySizeMin = +phoneArraySizeMin + phoneArraySplit[0].length;


                                if (orgPhone.length < phoneArraySizeMin) {
                                    if (attribute.getName().indexOf("mobile") > -1) {
                                        phoneErrorMessage(1, countryName, ccrm_mobileformat, ccrm_mobiledisplay);
                                    } else {
                                        phoneErrorMessage(1, countryName, ccrm_phoneformat, ccrm_phonedisplay);
                                    }
                                } else if (orgPhone.length > phoneArraySize) {
                                    if (attribute.getName().indexOf("mobile") > -1) {
                                        phoneErrorMessage(2, countryName, ccrm_mobileformat, ccrm_mobiledisplay);
                                    } else {
                                        phoneErrorMessage(2, countryName, ccrm_phoneformat, ccrm_phonedisplay);

                                    }
                                } else {

                                    var countryCode = phoneArraySplit[0];
                                    var newPhone = [];

                                    var p = phoneArraySplit[0].length;
                                    for (i = 1; i < phoneArraySplit.length; i++) {

                                        if (phoneArraySplit[i].indexOf("-") > -1) {
                                            if (orgPhone.length <= phoneArraySize) {
                                                newPhone[i] = orgPhone.slice(p, +returnMaxMin(phoneArraySplit, i).max + +p);
                                                p = +p + +returnMaxMin(phoneArraySplit, i).max;
                                            } else {
                                                newPhone[i] = orgPhone.slice(p, +returnMaxMin(phoneArraySplit, i).min + +p);
                                                p = +p + +returnMaxMin(phoneArraySplit, i).min;
                                            }
                                        } else {
                                            newPhone[i] = orgPhone.slice(p, +phoneArraySplit[i] + +p);
                                            p = +p + +phoneArraySplit[i];
                                        }
                                    }

                                    var newPhoneFormat = countryCode;
                                    for (i = 1; i < newPhone.length; i++) {

                                        newPhoneFormat += " " + newPhone[i];

                                    }
                                    formContext.getAttribute(attribute.getName()).setValue(newPhoneFormat);
                                }


                            } else {

                                if (orgPhone.length < phoneArraySizeMin) {
                                    if (attribute.getName().indexOf("mobile") > -1) {
                                        phoneErrorMessage(1, countryName, ccrm_mobileformat, ccrm_mobiledisplay);
                                    } else {
                                        phoneErrorMessage(1, countryName, ccrm_phoneformat, ccrm_phonedisplay);
                                    }
                                } else if (orgPhone.length > phoneArraySize) {
                                    if (attribute.getName().indexOf("mobile") > -1) {
                                        phoneErrorMessage(2, countryName, ccrm_mobileformat, ccrm_mobiledisplay);
                                    } else {
                                        phoneErrorMessage(2, countryName, ccrm_phoneformat, ccrm_phonedisplay);

                                    }
                                } else {

                                    var countryCode = phoneArraySplit[0];
                                    var newPhone = [];

                                    var p = 0;
                                    for (i = 1; i < phoneArraySplit.length; i++) {

                                        if (phoneArraySplit[i].indexOf("-") > -1) {
                                            if (orgPhone.length > phoneArraySizeMin) {
                                                newPhone[i] = orgPhone.slice(p, +returnMaxMin(phoneArraySplit, i).max + +p);
                                                p = +p + +returnMaxMin(phoneArraySplit, i).max;
                                            } else {
                                                newPhone[i] = orgPhone.slice(p, +returnMaxMin(phoneArraySplit, i).min + +p);
                                                p = +p + +returnMaxMin(phoneArraySplit, i).min;
                                            }
                                        } else {
                                            newPhone[i] = orgPhone.slice(p, +phoneArraySplit[i] + +p);
                                            p = +p + +phoneArraySplit[i];
                                        }
                                    }

                                    var newPhoneFormat = countryCode;
                                    for (i = 1; i < newPhone.length; i++) {

                                        newPhoneFormat += " " + newPhone[i];

                                    }
                                    formContext.getAttribute(attribute.getName()).setValue(newPhoneFormat);

                                }
                            }
                        }

                    }
                }
            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        );
    } else {

        alert("Please select a country first");
        formContext.getAttribute(attribute.getName()).setValue(null);
    }
}

function phoneErrorMessage(error, countryName, phoneFormat, phoneDisplay) {

    if (error == 1) {
        alert("You have entered too few characters. For the country of \n" + countryName + ", please enter the number as\n " + phoneFormat + " to have it display as " + phoneDisplay + ".");
    } else {
        alert("You have entered too many characters. For the country of \n" + countryName + ", please enter the number as\n " + phoneFormat + " to have it display as " + phoneDisplay + ".");
    }
}