var expressedConsent;
var isMobile = false;
var businessInterestSaved;

function form_onLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    isMobile = (formContext.context.client.getClient() == "Mobile");

    if (formContext.ui.getFormType() != 1) {

        formContext.ui.tabs.get("HubSpot").setDisplayState('collapsed');

        ccrm_uselocallanguage_onchange(formContext);
        //sync up country with countryid field
        ccrm_countryid_onchange(formContext);

        otherImpliedConsent_onChange(formContext);

        expressedConsent = formContext.getAttribute('arup_expressedconsent').getValue();

        enableAddressFields(formContext.getAttribute("ccrm_syncaddress").getValue(), formContext);

        // this function will change the width of the header tile. It may not be supported
        setInterval(changeHeaderTileFormat, 1000);
    }
    formContext.ui.setFormNotification("A 'Marketing Contact' is only for external marketing purposes while a 'Client Relationship Contact' is for building relationships and delivering projects with their organisation, as well as for sending external marketing.", "INFORMATION", "1");
    setTimeout(function () { Xrm.Page.ui.clearFormNotification("1"); }, 60000);
    contactType_onchange(formContext);
    canadaSectionVisibility(formContext);
    formContext.ui.tabs.get("SUMMARY_TAB").setFocus();
    defaultCustomerToAccount(formContext);
}

function qc_form_onload(executionContext) {
    var formContext = executionContext.getFormContext();
    quick_create_sync_address(formContext);
    quick_create_country_onchange(formContext);
    contactType_onchange(formContext);
    formContext.getAttribute("arup_businessinterest_ms").setRequiredLevel('required');
    formContext.ui.setFormNotification("A 'Marketing Contact' is only for external marketing purposes while a 'Client Relationship Contact' is for building relationships and delivering projects with their organisation, as well as for sending external marketing.", "INFORMATION", "1");
    qc_defaultCustomerToAccount(formContext);
}

// runs on Exit button
function exitForm(primaryControl) {
    var formContext = primaryControl;
    //see if the form is dirty
    var ismodified = formContext.data.entity.getIsDirty();
    if (ismodified == false) {
        formContext.ui.close();
        return;
    }

    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
        '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the contact.</br>Click "Exit Only" button to exit the contact without saving.</font>',
        [
            {
                label: "<b>Save and Exit</b>",
                callback: function () {
                    var contactAttributes = formContext.data.entity.attributes.get();
                    var highlight = true;
                    var cansave = true;
                    if (contactAttributes != null) {
                        for (var i in contactAttributes) {
                            if (contactAttributes[i].getRequiredLevel() == 'required') {
                                highlight = formContext.getAttribute(contactAttributes[i].getName()).getValue() != null;
                                if (highlight == false && cansave == true) { cansave = false; }
                            }
                        }
                    }
                    if (cansave) {
                        expressedConsent = formContext.getAttribute('arup_expressedconsent').getValue();
                        formContext.data.entity.save("saveandclose");
                    }
                },
                setFocus: true,
                preventClose: false
            },
            {
                label: "<b>Exit Only</b>",
                callback: function () {
                    //get list of dirty fields
                    var contactAttributes = formContext.data.entity.attributes.get();
                    if (contactAttributes != null) {
                        for (var i in contactAttributes) {
                            if (contactAttributes[i].getIsDirty()) {
                                formContext.getAttribute(contactAttributes[i].getName()).setSubmitMode("never");
                            }
                        }
                        setTimeout(function () { formContext.ui.close(); }, 1000);
                    }
                },
                setFocus: false,
                preventClose: false
            }
        ],
        'Warning', 600, 250, '', true);
}

function stateRequired(CountryName) {

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

function onchange_quick_create_country(executionContext) {
    var formContext = executionContext.getFormContext();
    quick_create_country_onchange(formContext);
}

function quick_create_country_onchange(formContext) {
    var isVisible = false;
    if (formContext.getAttribute("ccrm_countryid").getValue() == null) {
        formContext.getAttribute("ccrm_countrystate").setValue(null);
        formContext.getAttribute("address1_stateorprovince").setValue(null);
    }
    else {
        var CountryName = formContext.getAttribute("ccrm_countryid").getValue()[0].name;
        isVisible = isCanada(formContext);
        CountryName = CountryName.toUpperCase();
        var states = stateRequired(CountryName);
        var reqLevel = states == false ? 'none' : 'required';

        formContext.getControl("ccrm_countrystate").setVisible(states);
        formContext.getAttribute("ccrm_countrystate").setRequiredLevel(reqLevel);
        formContext.getControl("address1_stateorprovince").setVisible(!states);
    }

    if (isVisible) {
        formContext.getAttribute("arup_expressedconsent").setValue(null);
        formContext.getAttribute("arup_expressedconsent").setRequiredLevel("required");
        formContext.getAttribute("arup_otherimpliedconsent").setRequiredLevel("required");
        PrePopulateCanadaFields(formContext);
    }
    else {
        formContext.getAttribute("arup_expressedconsent").setValue(null);
        formContext.getAttribute("arup_otherimpliedconsent").setValue(null);
        formContext.getAttribute("arup_expressedconsent").setRequiredLevel("none");
        formContext.getAttribute("arup_otherimpliedconsent").setRequiredLevel("none");
    }

    formContext.getControl("arup_expressedconsent").setVisible(isVisible);
    formContext.getControl("arup_organisationconsent").setVisible(isVisible);
    formContext.getControl("arup_otherimpliedconsent").setVisible(isVisible);
    formContext.getControl("arup_receiptdate").setVisible(isVisible);
    formContext.getControl("arup_expirydate").setVisible(isVisible);
}

function resetStatesProvinces(executionContext) {
    var formContext = executionContext.getFormContext();
    formContext.getAttribute("ccrm_countrystate").setValue(null);
    formContext.getAttribute("address1_stateorprovince").setValue(null);
}

function PrePopulateCanadaFields(formContext) {
    if (formContext.getAttribute("parentcustomerid").getValue() == null) return;
    var parentcustomerid = formContext.getAttribute("parentcustomerid").getValue()[0].id;

    Xrm.WebApi.online.retrieveRecord("account", parentcustomerid, "?$select=arup_expressedconsent,arup_impliedconsent").then(
        function success(result) {
            var arup_expressedconsent = result["arup_expressedconsent"];
            var arup_impliedconsent = result["arup_impliedconsent"];

            formContext.getAttribute("arup_organisationconsent").setValue(arup_impliedconsent || arup_expressedconsent);
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
}

function canadaFieldsRequired(executionContext) {
    var formContext = executionContext.getFormContext();
    canadaRequiredFields(formContext);
}

function canadaRequiredFields(formContext) {
    if (!isCanada(formContext)) return;
    var reqLevel = 'none';

    if (formContext.getAttribute("arup_expressedconsent").getValue() == null &&
        formContext.getAttribute("arup_otherimpliedconsent").getValue() == null) reqLevel = 'required';

    formContext.getAttribute("arup_expressedconsent").setRequiredLevel(reqLevel);
    formContext.getAttribute("arup_otherimpliedconsent").setRequiredLevel(reqLevel);
}

function expressedConsent_valueChanged(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute('arup_expressedconsent').getValue() != true || !isCanada(formContext)) return;

    Alert.show('<font size="6" color="#2E74B5"><b>Expressed Consent</b></font>',
        '<font size="3" color="#000000"></br>Are you sure you have received expressed consent?</br>Expressed consent means that a person has clearly agreed to receive Commercial Electronic Messages from Arup (eg. emails, newsletters, events invites), either in writing or orally.</br>If so, upload proof of consent to the notes section</font>',
        [
            new Alert.Button("<b>I made a mistake</b>",
                function () {

                    formContext.getAttribute('arup_expressedconsent').setValue(expressedConsent);

                    if (formContext.getAttribute('arup_organisationconsent').getValue() != true &&
                        (formContext.getAttribute('arup_otherimpliedconsent').getValue() == null ||
                            formContext.getAttribute('arup_otherimpliedconsent').getValue() == 770000005) &&
                        formContext.getAttribute('arup_expressedconsent').getValue() != true &&
                        formContext.getAttribute('arup_allowcommunication').getValue() != false) {
                        formContext.getAttribute('arup_allowcommunication').setValue(false);
                    }
                    canadaRequiredFields(formContext);
                },
                false,
                false),
            new Alert.Button("<b>Yes, I'm sure</b>")
        ],
        "WARNING", 500, 300, '', true);
}

function onChange_otherImpliedConsent(executionContext) {
    var formContext = executionContext.getFormContext();
    otherImpliedConsent_onChange(formContext);
}

function otherImpliedConsent_onChange(formContext) {
    if (!isCanada(formContext)) return;

    var otherImpliedConsent = formContext.getAttribute('arup_otherimpliedconsent').getValue();
    var receiptDate = formContext.getAttribute('arup_receiptdate').getValue();
    var expiryDate;
    var required = 'required';

    if (otherImpliedConsent == null)
        required = 'none';

    switch (otherImpliedConsent) {

        case 770000000: //business card
        case 770000003: //Email Address Publicly Available
            expiryDate = null;
            break;
        case 770000001: //Business Inquiry
            if (receiptDate != null) {
                expiryDate = receiptDate.setMonth(receiptDate.getMonth() + 6);
            }
            break;
        case 770000002: //Written Contract
            if (receiptDate != null) {
                expiryDate = receiptDate.setFullYear(receiptDate.getFullYear() + 2);
            }
            break;
        case 770000004: //Referral
            expiryDate = receiptDate;
            break;
        case 770000005: //Not Applicable
            expiryDate = null;
            required = 'none';
            break;
    }
    formContext.getAttribute("arup_receiptdate").setRequiredLevel(required);
    formContext.getAttribute('arup_expirydate').setValue(expiryDate);

    expressedConsent = formContext.getAttribute('arup_expressedconsent').getValue();
    var now = new Date();

    if (formContext.getAttribute("arup_receiptdate").getValue() != null && formContext.getAttribute("arup_receiptdate").getValue() > now) {

        Alert.show('<font size="6" color="#ca0000"><b>Receipt Date</b></font>',
            '<font size="3" color="#000000"></br>Receipt Date cannot be in the future</font>',
            [
                new Alert.Button("<b>OK</b>")
            ],
            "ERROR", 550, 200, '', true);
        formContext.getAttribute("arup_receiptdate").setValue(null);
    }
}

function isCanada(formContext) {
    if (formContext.getAttribute("ccrm_countryid").getValue() == null) return false;
    return formContext.getAttribute("ccrm_countryid").getValue()[0].name.toUpperCase() == 'CANADA';
}

function quick_create_sync_addressDetails(executionContext) {
    var formContext = executionContext.getFormContext();
    quick_create_sync_address(formContext);
}

function quick_create_sync_address(formContext) {
    var sync = formContext.getAttribute("ccrm_syncaddress").getValue();
    if (sync == null) { return; }

    enableAddressFields(sync, formContext);

    if (sync == false) {

        formContext.getAttribute("address1_addresstypecode").setValue(null);
        formContext.getAttribute("address1_line1").setValue(null);
        formContext.getAttribute("address1_line2").setValue(null);
        formContext.getAttribute("address1_line3").setValue(null);
        formContext.getAttribute("address1_postalcode").setValue(null);
        formContext.getAttribute("ccrm_countryid").setValue(null);
        formContext.getAttribute("address1_city").setValue(null);
        formContext.getAttribute("ccrm_countrystate").setValue(null);
        formContext.getAttribute("address1_stateorprovince").setValue(null);
    }

    if (formContext.getAttribute("ccrm_countryid").getValue() != null) {
        var state = false;
        var CountryName = formContext.getAttribute("ccrm_countryid").getValue()[0].name;
        CountryName = CountryName.toUpperCase();
        state = stateRequired(CountryName);

        if (formContext.getAttribute("ccrm_countrystate").getValue() == null && state && sync) {
            formContext.getAttribute("ccrm_countrystate").setSubmitMode('always');
            formContext.getAttribute("ccrm_countrystate").setRequiredLevel('required');
            formContext.getControl("ccrm_countrystate").setDisabled(false);
        }
    }
}

function changeHeaderTileFormat() {
    //This may not be a supported way to change the header tile width
    var headertiles = window.parent.document.getElementsByClassName("ms-crm-HeaderTileElement");
    if (headertiles != null) {
        for (var i = 0; i < headertiles.length; i++) {
            headertiles[i].style.width = "450px";
            headertiles[i].style.maxWidth = "300px";
        }
    }
}

function onchange_ccrm_uselocallanguage(executionContext) {
    var formContext = executionContext.getFormContext();
    ccrm_uselocallanguage_onchange(formContext);
}

//function to make additional language fields visible
function ccrm_uselocallanguage_onchange(formContext) {

    if (formContext.getAttribute("ccrm_uselocallanguage").getValue() == true) {
        //unhide the additional address section
        formContext.ui.tabs.get("tab_Address").sections.get("tab_additional_address_section").setVisible(true);
        formContext.getAttribute("ccrm_address2countrypicklist").setRequiredLevel('required');
        formContext.getAttribute("address2_line1").setRequiredLevel('required');
    }
    else {
        //hide the additional address section
        formContext.ui.tabs.get("tab_Address").sections.get("tab_additional_address_section").setVisible(false);
        formContext.getAttribute("ccrm_address2countrypicklist").setRequiredLevel('none');
        formContext.getAttribute("ccrm_address2state").setRequiredLevel('none');
        formContext.getAttribute("address2_line1").setRequiredLevel('none');
    }
}

function resetAddr2StatesProvinces(executionContext) {
    var formContext = executionContext.getFormContext();
    formContext.getAttribute("ccrm_address2state").setValue(null);
    formContext.getAttribute("address2_stateorprovince").setValue(null);
    formContext.getAttribute("address2_line1").setValue(null);
}

function onChangeAdditionalCountry(executionContext) {
    var formContext = executionContext.getFormContext();
    var CountryName = formContext.getAttribute("ccrm_address2countrypicklist").getValue();
    if (CountryName != null) {
        CountryName = CountryName[0].name.toUpperCase();
        var states = stateRequired(CountryName);
        var reqLevel = states == false ? 'none' : 'required';

        formContext.getAttribute("ccrm_address2countrypicklist").setRequiredLevel('required');
        formContext.getControl("ccrm_address2state").setVisible(states);
        formContext.getAttribute("ccrm_address2state").setRequiredLevel(reqLevel);
        formContext.getControl("address2_stateorprovince").setVisible(!states);
        formContext.getAttribute("address2_line1").setRequiredLevel('required');
    }
}

function Form_onsave(eventArgs) {
    var formContext = eventArgs.getFormContext();
    if (formContext.ui.getFormType() == 2) {
        setInterval(changeHeaderTileFormat, 1000);
    }

    if (isCanada(formContext)) {
        expressedConsent = formContext.getAttribute('arup_expressedconsent').getValue();
        var now = new Date();

        if (formContext.getAttribute("arup_receiptdate").getValue() != null && formContext.getAttribute("arup_receiptdate").getValue() > now) {

            Alert.show('<font size="6" color="#ca0000"><b>Receipt Date</b></font>',
                '<font size="3" color="#000000"></br>Receipt Date cannot be in the future</font>',
                [
                    new Alert.Button("<b>OK</b>")
                ],
                "ERROR", 550, 200, '', true);

            eventArgs.getEventArgs().preventDefault();
            return false;
        }
    }
    formContext.ui.clearFormNotification("1");
}

function removeFromList(list, value, separator) {
    separator = separator || ",";
    var values = list.split(separator);
    for (var i = 0; i < values.length; i++) {
        if (values[i] == value) {
            values.splice(i, 1);
            return values.join(separator);
        }
    }
    return list;
}

function setDate(date) {
    var formContext = executionContext.getFormContext();
    var field = formContext.data.entity.attributes.get("ccrm_contactlastvalidatedbyid").getValue();

    if (field != null) {
        formContext.getAttribute("ccrm_lastvalidateddate").setValue(new Date());
        formContext.getAttribute("ccrm_lastvalidateddate").setSubmitMode("always");
    }
}

function countryid_onchange() {
    var formContext = executionContext.getFormContext();
    ccrm_countryid_onchange(formContext);
}

function ccrm_countryid_onchange(formContext) {
    //sync up country with countryid field
    if (formContext.ui.getFormType() != 1) {
        syncCountry(formContext);
    }
}

//function to sync up country with countryid field
function syncCountry(formContext) {
    if (formContext.getAttribute("ccrm_countryid").getValue() != null) {
        //sync up country with countryid field
        formContext.getAttribute("address1_country").setValue(formContext.getAttribute("ccrm_countryid").getValue()[0].name);
    }
    else {
        formContext.getAttribute("address1_country").setValue(null);
    }
}

function canadaSection_Visibility(executionContext) {
    var formContext = executionContext.getFormContext();
    canadaSectionVisibility(formContext);
}

function canadaSectionVisibility(formContext) {
    formContext.ui.tabs.get("tab_Details").sections.get("Canada_Privacy_Law_Section").setVisible(isCanada(formContext));
    canadaRequiredFields(formContext);
}

function phoneOnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    var attribute = executionContext.getEventSource();
    if (formContext.getAttribute("ccrm_countryid").getValue() != null) {
        var countryId = formContext.getAttribute("ccrm_countryid").getValue()[0].id;
        var countryName = formContext.getAttribute("ccrm_countryid").getValue()[0].name;

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
                        phoneArray = ccrm_phonearray;
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
                                            if (orgPhone.length == phoneArraySize) {
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

function enableAddressFields(sync, formContext) {

    var submitMode = sync == true ? 'never' : 'dirty';

    formContext.getControl("address1_addresstypecode").setDisabled(sync);
    formContext.getControl("address1_line1").setDisabled(sync);
    formContext.getControl("address1_line2").setDisabled(sync);
    formContext.getControl("address1_line3").setDisabled(sync);
    formContext.getControl("address1_postalcode").setDisabled(sync);
    formContext.getControl("ccrm_countryid").setDisabled(sync);
    formContext.getControl("address1_city").setDisabled(sync);
    formContext.getControl("ccrm_countrystate").setDisabled(sync);
    formContext.getControl("address1_stateorprovince").setDisabled(sync);

    formContext.getAttribute("address1_addresstypecode").setSubmitMode(submitMode);
    formContext.getAttribute("address1_line1").setSubmitMode(submitMode);
    formContext.getAttribute("address1_line2").setSubmitMode(submitMode);
    formContext.getAttribute("address1_line3").setSubmitMode(submitMode);
    formContext.getAttribute("address1_postalcode").setSubmitMode(submitMode);
    formContext.getAttribute("ccrm_countryid").setSubmitMode(submitMode);
    formContext.getAttribute("address1_city").setSubmitMode(submitMode);
    formContext.getAttribute("ccrm_countrystate").setSubmitMode(submitMode);
    formContext.getAttribute("address1_stateorprovince").setSubmitMode(submitMode);
}

function PopulateAddrsOnAddrSync(executionContext) {
    var formContext = executionContext.getFormContext();
    var sync = formContext.getAttribute("ccrm_syncaddress").getValue();

    enableAddressFields(sync, formContext);
    var parentCustId = formContext.getAttribute("parentcustomerid").getValue();
    if (parentCustId != null && parentCustId.length > 0 && sync) {

        formContext.getAttribute("address1_addresstypecode").setValue(null);
        formContext.getAttribute("address1_line1").setValue(null);
        formContext.getAttribute("address1_line2").setValue(null);
        formContext.getAttribute("address1_line3").setValue(null);
        formContext.getAttribute("address1_postalcode").setValue(null);
        formContext.getAttribute("ccrm_countryid").setValue(null);
        formContext.getAttribute("address1_city").setValue(null);
        formContext.getAttribute("ccrm_countrystate").setValue(null);
        formContext.getAttribute("address1_stateorprovince").setValue(null);


        var strId = parentCustId[0].id;
        var Id = strId.replace(/[{}]/g, "");
        var entityName = "accounts";
        var columnSet = "?$select=_ccrm_countrystate_value,_ccrm_countryid_value,address1_addresstypecode,address1_line1,address1_line2,address1_line3,address1_postalcode,address1_stateorprovince,address1_city";
        retrieveEntity(entityName, Id, columnSet, formContext);
    }
}

function gridRowSelected(context) {
    var entityObject = context.getFormContext().getData().getEntity();
    var id = entityObject.getId(); /* GUID of the contact record */
    var Id = id.replace(/[{}]/g, "");

    var syncAddress;
    Xrm.WebApi.online.retrieveRecord("contact", Id, "?$select=ccrm_syncaddress").then(
        function success(result) {
            syncAddress = result["ccrm_syncaddress"];
            entityObject.attributes.forEach(function (attr) {
                if (
                    (attr.getName() === "ccrm_countryid" || attr.getName() === "ccrm_address2countrypicklist" || attr.getName() == "arup_businessinterest_ms" ||
                        attr.getName() === "ccrm_countrystate") ||
                    attr.getName() == 'ccrm_address2state' || attr.getName() == 'ccrm_address2statepicklist' || attr.getName() == 'ccrm_adress2country' ||
                    (syncAddress && (
                        attr.getName() === "address1_addresstypecode" || attr.getName() === "address1_line1" ||
                        attr.getName() === "address1_line2" || attr.getName() === "address1_line3" ||
                        attr.getName() === "address1_postalcode" || attr.getName() === "address1_city" ||
                        attr.getName() === "address1_stateorprovince")
                    )
                ) {
                    attr.controls.forEach(function (c) {
                        c.setDisabled(true);
                    })
                }
            });
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
}

function errorHandler(error) {

    Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
        '<font size="3" color="#000000"></br>' + error.message + '</font>',
        [
            { label: "<b>OK</b>", setFocus: true },
        ], "ERROR", 500, 350, '', true);
}

function retrieveEntity(entityname, id, columnset, formContext) {
    var serverURL = formContext.context.getClientUrl();
    var Query = entityname + "(" + id + ")" + columnset;
    var req = new XMLHttpRequest();
    req.open("GET", serverURL + "/api/data/v9.1/" + Query, true);
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=OData.Community.Display.V1.FormattedValue");
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.timeout = 10000;
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            req.onreadystatechange = null;
            if (this.status == 200) {
                var retrievedreq = JSON.parse(this.response);

                if (retrievedreq != null) {

                    if (retrievedreq._ccrm_countryid_value != null && formContext.getAttribute("ccrm_countryid") != null) {
                        var countryName = retrievedreq["_ccrm_countryid_value@OData.Community.Display.V1.FormattedValue"];
                        formContext.getAttribute("ccrm_countryid").setValue([
                            {

                                id: retrievedreq._ccrm_countryid_value,
                                name: countryName,
                                entityType: "ccrm_country"
                            }
                        ]);
                    }


                    if (retrievedreq._ccrm_countrystate_value != null && formContext.getAttribute("ccrm_countrystate") != null) {
                        var stateName = retrievedreq["_ccrm_countrystate_value@OData.Community.Display.V1.FormattedValue"];
                        formContext.getAttribute("ccrm_countrystate").setValue([
                            {
                                id: retrievedreq._ccrm_countrystate_value,
                                name: stateName,
                                entityType: "ccrm_arupusstate"
                            }
                        ]);
                    }


                    if (retrievedreq.address1_addresstypecode != null && formContext.getAttribute("address1_addresstypecode") != null) {
                        formContext.getAttribute("address1_addresstypecode").setValue(retrievedreq.address1_addresstypecode);
                    }

                    if (retrievedreq.address1_line1 != null && formContext.getAttribute("address1_line1") != null) {
                        formContext.getAttribute("address1_line1").setValue(retrievedreq.address1_line1);
                    }

                    if (retrievedreq.address1_line2 != null && formContext.getAttribute("address1_line2") != null) {
                        formContext.getAttribute("address1_line2").setValue(retrievedreq.address1_line2);
                    }

                    if (retrievedreq.address1_line3 != null && formContext.getAttribute("address1_line3") != null) {
                        formContext.getAttribute("address1_line3").setValue(retrievedreq.address1_line3);
                    }

                    if (retrievedreq.address1_postalcode != null && formContext.getAttribute("address1_postalcode") != null) {
                        formContext.getAttribute("address1_postalcode").setValue(retrievedreq.address1_postalcode);
                    }

                    if (retrievedreq.address1_stateorprovince != null && formContext.getAttribute("address1_stateorprovince") != null) {
                        formContext.getAttribute("address1_stateorprovince").setValue(retrievedreq.address1_stateorprovince);
                    }

                    if (retrievedreq.address1_city != null && formContext.getAttribute("address1_city") != null) {
                        formContext.getAttribute("address1_city").setValue(retrievedreq.address1_city);
                    }
                }

            } else {
                var error = JSON.parse(this.response).error;
                return error;
            }
        }
    };
    req.send();
}

function onChange_ContactType(executionContext) {
    var formContext = executionContext.getFormContext();
    contactType_onchange(formContext);
}

function contactType_onchange(formContext) {
    formContext.ui.setFormNotification("A 'Marketing Contact' is only for external marketing purposes while a 'Client Relationship Contact' is for building relationships and delivering projects with their organisation, as well as for sending external marketing.", "INFORMATION", "1");
    setTimeout(function () { Xrm.Page.ui.clearFormNotification("1"); }, 60000);

    var contactTypeValue = formContext.getAttribute("arup_contacttype");
    if (contactTypeValue == null) return;
    var contacttype = contactTypeValue.getValue();
    var fullform = formContext.ui.getFormType() != 1;

    // marketing contact type
    if (contacttype == 770000001) {
        formContext.getControl("middlename").setVisible(false);
        formContext.getAttribute("jobtitle").setRequiredLevel('none');
        formContext.getAttribute("accountrolecode").setRequiredLevel('none');
        formContext.getControl("ccrm_syncaddress").setVisible(false);
        enableAddressFields(false, formContext);
        formContext.getControl("address1_addresstypecode").setVisible(false);
        formContext.getAttribute("address1_line1").setRequiredLevel('none');
        formContext.getControl("address1_line1").setVisible(false);
        formContext.getControl("address1_line2").setVisible(false);
        formContext.getControl("address1_line3").setVisible(false);
        formContext.getControl("address1_postalcode").setVisible(false);
        formContext.getControl("telephone1").setVisible(false);
        formContext.getControl("mobilephone").setVisible(false);
        formContext.getAttribute("parentcustomerid").setRequiredLevel('none');
        formContext.getControl("parentcustomerid").setVisible(false);
        formContext.getControl("arup_currentorganisation").setVisible(true);
        formContext.getAttribute("arup_currentorganisation").setRequiredLevel('required');

        if (formContext.getControl("header_parentcustomerid") != null) {
            formContext.getControl("header_parentcustomerid").setVisible(false);
        }

        if (fullform) {
            formContext.getControl("department").setVisible(false);
            formContext.getControl("fax").setVisible(false);
            formContext.ui.tabs.get("tab_Address").sections.get("tab_additional_address_section").setVisible(false);
            formContext.ui.tabs.get("tab_Address").sections.get("{fa46a68d-a6b2-4cc1-9d00-4abd1d46c8f4}").setVisible(false);
            formContext.ui.tabs.get("SUMMARY_TAB").sections.get("SUMMARY_TAB_section_6").setVisible(false);
            formContext.getControl("ccrm_uselocallanguage").setVisible(false);
        }

        if (formContext.getAttribute("parentcustomerid").getValue() != null) {
            var organisationName = formContext.getAttribute("parentcustomerid").getValue()[0].name;
            formContext.getAttribute("arup_currentorganisation").setValue(organisationName);
            formContext.getAttribute("parentcustomerid").setValue(null);
        }
    }
    // client relationship contact type
    else if (contacttype == 770000000) {
        formContext.getControl("middlename").setVisible(true);
        formContext.getAttribute("jobtitle").setRequiredLevel('required');
        formContext.getAttribute("accountrolecode").setRequiredLevel('required');
        formContext.getControl("ccrm_syncaddress").setVisible(true);
        enableAddressFields(true, formContext);
        formContext.getControl("address1_addresstypecode").setVisible(true);
        formContext.getControl("address1_line1").setVisible(true);
        formContext.getAttribute("address1_line1").setRequiredLevel('required');
        formContext.getControl("address1_line2").setVisible(true);
        formContext.getControl("address1_line3").setVisible(true);
        formContext.getControl("address1_postalcode").setVisible(true);
        formContext.getControl("telephone1").setVisible(true);
        formContext.getControl("mobilephone").setVisible(true);
        formContext.getControl("parentcustomerid").setVisible(true);
        formContext.getAttribute("arup_currentorganisation").setRequiredLevel('none');
        formContext.getControl("arup_currentorganisation").setVisible(false);
        formContext.getAttribute("parentcustomerid").setRequiredLevel('required');

        if (formContext.getControl("header_parentcustomerid") != null) {
            formContext.getControl("header_parentcustomerid").setVisible(true);
        }

        if (fullform) {
            formContext.getControl("department").setVisible(true);
            formContext.getControl("fax").setVisible(true);
            formContext.ui.tabs.get("tab_Address").sections.get("{fa46a68d-a6b2-4cc1-9d00-4abd1d46c8f4}").setVisible(true);
            formContext.ui.tabs.get("SUMMARY_TAB").sections.get("SUMMARY_TAB_section_6").setVisible(true);
            formContext.getControl("ccrm_uselocallanguage").setVisible(true);
            ccrm_uselocallanguage_onchange(formContext);
        }

        formContext.getAttribute("arup_currentorganisation").setValue("");
    }
    else if (contacttype == null) {
        formContext.getControl("parentcustomerid").setVisible(true);
        formContext.getControl("arup_currentorganisation").setVisible(false);
        if (formContext.getControl("header_parentcustomerid") != null) {
            formContext.getControl("header_parentcustomerid").setVisible(true);
        }
    }
}
function defaultCustomerToAccountOnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    defaultCustomerToAccount(formContext);
}

function qc_defaultCustomerToAccount(formContext) {
    formContext.getControl("parentcustomerid").setEntityTypes(["account"]);
}

function defaultCustomerToAccount(formContext) {
    formContext.getControl("parentcustomerid").setEntityTypes(["account"]);
    formContext.getControl("header_parentcustomerid").setEntityTypes(["account"]);
}


