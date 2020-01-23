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

function form_OnLoad() {

    parentOrg();
    Xrm.Page.getAttribute("ccrm_legalentityname").setRequiredLevel("none");

}

function form_OnSave() {

    /copy name to legal entity name/
    Xrm.Page.getAttribute("ccrm_legalentityname").setValue(Xrm.Page.getAttribute("name").getValue());
}

function clear_state() {

    if (Xrm.Page.getAttribute("ccrm_countryid").getValue() == null || Xrm.Page.getAttribute("ccrm_countryid").getValue() == "undefined") {
        Xrm.Page.getAttribute("ccrm_countrystate").setValue(null);
        Xrm.Page.getAttribute("address1_stateorprovince").setValue(null);
        return;
    }

    if (stateRequired(Xrm.Page.getAttribute("ccrm_countryid").getValue()[0].name)) {
        Xrm.Page.getAttribute("ccrm_countrystate").setValue(null);
    }
    else {
        Xrm.Page.getAttribute("address1_stateorprovince").setValue(null);
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

function stateVisibility() {

    countryname = Xrm.Page.getAttribute("ccrm_countryid").getValue() != null ? Xrm.Page.getAttribute("ccrm_countryid").getValue()[0].name : null;
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

        Xrm.Page.getControl("address1_stateorprovince").setVisible(!flag);
        Xrm.Page.getControl("ccrm_countrystate").setVisible(flag);
        Xrm.Page.getAttribute("ccrm_countrystate").setRequiredLevel(required);

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

function parentOrg() {

    orgType = Xrm.Page.getAttribute("ccrm_organisationtype").getValue();

    var flag = false;
    //var required = 'none';

    if (orgType == "5") {
        flag = true;
        //required = 'required';
    }
    Xrm.Page.getControl("ccrm_parent2").setVisible(flag)
    Xrm.Page.getControl("ccrm_parent3").setVisible(flag)
    //Xrm.Page.getControl("parentaccountid").setVisible(flag);
    //Xrm.Page.getControl("parentaccountid").setRequiredLevel(required);

}

ccrm_countryid_onchange = function () {
    //sync up country with countryid field
    syncCountry()

    ////function to get long state code from short
    // getUSStateCode();
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

    var attribute = executionContext.getEventSource();
    if (Xrm.Page.getAttribute("ccrm_countryid").getValue() != null) {
        var countryId = Xrm.Page.getAttribute("ccrm_countryid").getValue()[0].id;
        var countryName = Xrm.Page.getAttribute("ccrm_countryid").getValue()[0].name;

        var filter = "Ccrm_countryId eq (guid'" + countryId + "')";
        var dataset = "Ccrm_countrySet";
        var retrievedMultiple = ConsultCrm.Sync.RetrieveMultipleRequest(dataset, filter);
        var results = retrievedMultiple.results;

        var phoneArray;
        if (attribute.getName().indexOf("mobile") > -1) {
            phoneArray = results[0].ccrm_mobilearray
        } else {
            phoneArray = results[0].ccrm_phonearray;
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

            var orgPhone = Xrm.Page.getAttribute(attribute.getName()).getValue();
            if (orgPhone != null) {
                //removes spaces
                //orgPhone = orgPhone.replace(/\s/g, "");
                orgPhone = orgPhone.replace(/[^\d\+]/g, '');

                // checks if the plus sign was used, if yes adds up the extra digits for country code in the phoneArray field
                if (orgPhone.indexOf("+") > -1) {
                    phoneArraySize = +phoneArraySize + phoneArraySplit[0].length;
                    phoneArraySizeMin = +phoneArraySizeMin + phoneArraySplit[0].length;


                    if (orgPhone.length < phoneArraySizeMin) {
                        if (attribute.getName().indexOf("mobile") > -1) {
                            phoneErrorMessage(1, countryName, results[0].ccrm_mobileformat, results[0].ccrm_mobiledisplay);
                        } else {
                            phoneErrorMessage(1, countryName, results[0].ccrm_phoneformat, results[0].ccrm_phonedisplay);
                        }
                    } else if (orgPhone.length > phoneArraySize) {
                        if (attribute.getName().indexOf("mobile") > -1) {
                            phoneErrorMessage(2, countryName, results[0].ccrm_mobileformat, results[0].ccrm_mobiledisplay);
                        } else {
                            phoneErrorMessage(2, countryName, results[0].ccrm_phoneformat, results[0].ccrm_phonedisplay);

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
                        Xrm.Page.getAttribute(attribute.getName()).setValue(newPhoneFormat);
                    }


                } else {

                    if (orgPhone.length < phoneArraySizeMin) {
                        if (attribute.getName().indexOf("mobile") > -1) {
                            phoneErrorMessage(1, countryName, results[0].ccrm_mobileformat, results[0].ccrm_mobiledisplay);
                        } else {
                            phoneErrorMessage(1, countryName, results[0].ccrm_phoneformat, results[0].ccrm_phonedisplay);
                        }
                    } else if (orgPhone.length > phoneArraySize) {
                        if (attribute.getName().indexOf("mobile") > -1) {
                            phoneErrorMessage(2, countryName, results[0].ccrm_mobileformat, results[0].ccrm_mobiledisplay);
                        } else {
                            phoneErrorMessage(2, countryName, results[0].ccrm_phoneformat, results[0].ccrm_phonedisplay);

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
                        Xrm.Page.getAttribute(attribute.getName()).setValue(newPhoneFormat);

                    }
                }
            }

        }

    } else {

        alert("Please select a country first");
        Xrm.Page.getAttribute(attribute.getName()).setValue(null);

    }
}

function phoneErrorMessage(error, countryName, phoneFormat, phoneDisplay) {

    if (error == 1) {
        alert("You have entered too few characters. For the country of \n" + countryName + ", please enter the number as\n " + phoneFormat + " to have it display as " + phoneDisplay + ".");
    } else {
        alert("You have entered too many characters. For the country of \n" + countryName + ", please enter the number as\n " + phoneFormat + " to have it display as " + phoneDisplay + ".");
    }
}
