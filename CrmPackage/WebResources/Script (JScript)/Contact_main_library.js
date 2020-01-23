var expressedConsent;
var isMobile = false;
var businessInterestSaved;
var mostSeniorTeam;

function form_onLoad() {

    isMobile = (Xrm.Page.context.client.getClient() == "Mobile");

    if (Xrm.Page.ui.getFormType() != 1) {

        Xrm.Page.ui.tabs.get("HubSpot").setDisplayState('collapsed');

        mostSeniorTeam = userInTeamCheck("Most Senior Contact Update Team");

        Xrm.Page.getControl("arup_mostseniorcontact").setVisible(mostSeniorTeam);

        ccrm_uselocallanguage_onchange();

        //sync up country with countryid field
        ccrm_countryid_onchange();

        otherImpliedConsent_onChange();

        expressedConsent = Xrm.Page.getAttribute('arup_expressedconsent').getValue();

        businessInterestSaved = Xrm.Page.getAttribute("ccrm_businessinterest").getValue();

        Xrm.Page.getControl("ccrm_businessinterest").setVisible(isMobile);
        Xrm.Page.getControl("ccrm_businessinterestpicklistname").setVisible(!isMobile);

        enableAddressFields(Xrm.Page.getAttribute("ccrm_syncaddress").getValue());

        // this function will change the width of the header tile. It may not be supported
        setInterval(changeHeaderTileFormat, 1000);

    }
}

function qc_form_onload() {

    quick_create_sync_address();
    quick_create_country_onchange(1);

}

// runs on Exit button
function exitForm() {

    //see if the form is dirty
    var ismodified = Xrm.Page.data.entity.getIsDirty();
    if (ismodified == false) {
        Xrm.Page.ui.close();
        return;
    }

    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
    '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the contact.</br>Click "Exit Only" button to exit the contact without saving.</font>',
    [
        {
            label: "<b>Save and Exit</b>",
            callback: function () {
                var contactAttributes = Xrm.Page.data.entity.attributes.get();
                var highlight = true;
                var cansave = true;
                if (contactAttributes != null) {
                    for (var i in contactAttributes) {
                        if (contactAttributes[i].getRequiredLevel() == 'required') {
                            highlight = Xrm.Page.getAttribute(contactAttributes[i].getName()).getValue() != null;
                            if (highlight == false && cansave == true) { cansave = false; }
                        }
                    }
                }
                if (cansave) {
                    expressedConsent = Xrm.Page.getAttribute('arup_expressedconsent').getValue();
                    Xrm.Page.data.entity.save("saveandclose");
                }
            },
            setFocus: true,
            preventClose: false
        },
        {
            label: "<b>Exit Only</b>",
            callback: function () {
                //get list of dirty fields
                var contactAttributes = Xrm.Page.data.entity.attributes.get();
                if (contactAttributes != null) {
                    for (var i in contactAttributes) {
                        if (contactAttributes[i].getIsDirty()) {
                            Xrm.Page.getAttribute(contactAttributes[i].getName()).setSubmitMode("never");
                        }
                    }
                    setTimeout(function () { Xrm.Page.ui.close(); }, 1000);
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

function quick_create_country_onchange() {

    var isVisible = false;

    if (Xrm.Page.getAttribute("ccrm_countryid").getValue() == null) {
        Xrm.Page.getAttribute("ccrm_countrystate").setValue(null);
        Xrm.Page.getAttribute("address1_stateorprovince").setValue(null);
    }
    else {

        var CountryName = Xrm.Page.getAttribute("ccrm_countryid").getValue()[0].name;
        isVisible = isCanada();
        CountryName = CountryName.toUpperCase();
        var states = stateRequired(CountryName);
        var reqLevel = states == false ? 'none' : 'required';

        Xrm.Page.getControl("ccrm_countrystate").setVisible(states);
        Xrm.Page.getAttribute("ccrm_countrystate").setRequiredLevel(reqLevel);
        Xrm.Page.getControl("address1_stateorprovince").setVisible(!states);
    }

    if (isVisible) {
        Xrm.Page.getAttribute("arup_expressedconsent").setValue(null);
        Xrm.Page.getAttribute("arup_expressedconsent").setRequiredLevel("required");
        Xrm.Page.getAttribute("arup_otherimpliedconsent").setRequiredLevel("required");
        PrePopulateCanadaFields();
    }
    else {
        Xrm.Page.getAttribute("arup_expressedconsent").setValue(null);
        Xrm.Page.getAttribute("arup_otherimpliedconsent").setValue(null);
        Xrm.Page.getAttribute("arup_expressedconsent").setRequiredLevel("none");
        Xrm.Page.getAttribute("arup_otherimpliedconsent").setRequiredLevel("none");
    }

    Xrm.Page.getControl("arup_expressedconsent").setVisible(isVisible);
    Xrm.Page.getControl("arup_organisationconsent").setVisible(isVisible);
    Xrm.Page.getControl("arup_otherimpliedconsent").setVisible(isVisible);
    Xrm.Page.getControl("arup_receiptdate").setVisible(isVisible);
    Xrm.Page.getControl("arup_expirydate").setVisible(isVisible);
}

function resetStatesProvinces(stateLookup, stateFreeText) {

    Xrm.Page.getAttribute(stateLookup).setValue(null);
    Xrm.Page.getAttribute(stateFreeText).setValue(null);

}

function PrePopulateCanadaFields() {
    if (Xrm.Page.getAttribute("parentcustomerid").getValue() == null) return;
    var parentcustomerid = Xrm.Page.getAttribute("parentcustomerid").getValue()[0].id;
    var dataset = "AccountSet";
    var retrievereq = ConsultCrm.Sync.RetrieveRequest(parentcustomerid, dataset);
    if (retrievereq !== null) {
        Xrm.Page.getAttribute("arup_organisationconsent").setValue(retrievereq.arup_ImpliedConsent || retrievereq.arup_ExpressedConsent);
    }
}
function canadaRequiredFields() {

    if (!isCanada()) return;

    var reqLevel = 'none';

    if (Xrm.Page.getAttribute("arup_expressedconsent").getValue() == null &&
        Xrm.Page.getAttribute("arup_otherimpliedconsent").getValue() == null) reqLevel = 'required';

    Xrm.Page.getAttribute("arup_expressedconsent").setRequiredLevel(reqLevel);
    Xrm.Page.getAttribute("arup_otherimpliedconsent").setRequiredLevel(reqLevel);

}

function expressedConsent_valueChanged() {

    if (Xrm.Page.getAttribute('arup_expressedconsent').getValue() != true || !isCanada()) return;

    Alert.show('<font size="6" color="#2E74B5"><b>Expressed Consent</b></font>',
                '<font size="3" color="#000000"></br>Are you sure you have received expressed consent?</br>Expressed consent means that a person has clearly agreed to receive Commercial Electronic Messages from Arup (eg. emails, newsletters, events invites), either in writing or orally.</br>If so, upload proof of consent to the notes section</font>',
                [
                    new Alert.Button("<b>I made a mistake</b>",
                    function () {

                        Xrm.Page.getAttribute('arup_expressedconsent').setValue(expressedConsent);

                        if (Xrm.Page.getAttribute('arup_organisationconsent').getValue() != true &&
                            (Xrm.Page.getAttribute('arup_otherimpliedconsent').getValue() == null ||
                            Xrm.Page.getAttribute('arup_otherimpliedconsent').getValue() == 770000005) &&
                            Xrm.Page.getAttribute('arup_expressedconsent').getValue() != true &&
                            Xrm.Page.getAttribute('arup_allowcommunication').getValue() != false) {
                            Xrm.Page.getAttribute('arup_allowcommunication').setValue(false);
                        }
                        canadaRequiredFields();
                    },
                    false,
                    false),
                    new Alert.Button("<b>Yes, I'm sure</b>")
                ],
                "WARNING", 500, 300, '', true);
}

function otherImpliedConsent_onChange() {

    if (!isCanada()) return;

    var otherImpliedConsent = Xrm.Page.getAttribute('arup_otherimpliedconsent').getValue();
    var receiptDate = Xrm.Page.getAttribute('arup_receiptdate').getValue();
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
    Xrm.Page.getAttribute("arup_receiptdate").setRequiredLevel(required);
    Xrm.Page.getAttribute('arup_expirydate').setValue(expiryDate);    

    expressedConsent = Xrm.Page.getAttribute('arup_expressedconsent').getValue();
    var now = new Date();

    if (Xrm.Page.getAttribute("arup_receiptdate").getValue() != null && Xrm.Page.getAttribute("arup_receiptdate").getValue() > now) {

        Alert.show('<font size="6" color="#ca0000"><b>Receipt Date</b></font>',
        '<font size="3" color="#000000"></br>Receipt Date cannot be in the future</font>',
        [
            new Alert.Button("<b>OK</b>")
        ],
        "ERROR", 550, 200, '',  true);
        Xrm.Page.getAttribute("arup_receiptdate").setValue(null);

    }
    
}

function isCanada() {

    if (Xrm.Page.getAttribute("ccrm_countryid").getValue() == null) return false;

    return Xrm.Page.getAttribute("ccrm_countryid").getValue()[0].name.toUpperCase() == 'CANADA';

}

function quick_create_sync_address() {

    var sync = Xrm.Page.getAttribute("ccrm_syncaddress").getValue();
    if (sync == null) { return; }

    enableAddressFields(sync);

    if (sync == false) {

        Xrm.Page.getAttribute("address1_addresstypecode").setValue(null);
        Xrm.Page.getAttribute("address1_line1").setValue(null);
        Xrm.Page.getAttribute("address1_line2").setValue(null);
        Xrm.Page.getAttribute("address1_line3").setValue(null);
        Xrm.Page.getAttribute("address1_postalcode").setValue(null);
        Xrm.Page.getAttribute("ccrm_countryid").setValue(null);
        Xrm.Page.getAttribute("address1_city").setValue(null);
        Xrm.Page.getAttribute("ccrm_countrystate").setValue(null);
        Xrm.Page.getAttribute("address1_stateorprovince").setValue(null);

    }

    if (Xrm.Page.getAttribute("ccrm_countryid").getValue() != null) {

        var state = false;
        var CountryName = Xrm.Page.getAttribute("ccrm_countryid").getValue()[0].name;
        CountryName = CountryName.toUpperCase();
        state = stateRequired(CountryName);

        if (Xrm.Page.getAttribute("ccrm_countrystate").getValue() == null && state && sync) {

            Xrm.Page.getAttribute("ccrm_countrystate").setSubmitMode('always');
            Xrm.Page.getAttribute("ccrm_countrystate").setRequiredLevel('required');
            Xrm.Page.getControl("ccrm_countrystate").setDisabled(false);
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

//function to make additional language fields visible
function ccrm_uselocallanguage_onchange() {

    if (Xrm.Page.getAttribute("ccrm_uselocallanguage").getValue() == true) {

        //unhide the additional address section
        Xrm.Page.ui.tabs.get("tab_Address").sections.get("tab_additional_address_section").setVisible(true);
    }
    else {

        //hide the additional address section
        Xrm.Page.ui.tabs.get("tab_Address").sections.get("tab_additional_address_section").setVisible(false);

    }
}

function Form_onsave(eventArgs) {

    if (Xrm.Page.ui.getFormType() == 2) {

        setInterval(changeHeaderTileFormat, 1000);
        syncBusinessInterest();

    }

    if (isCanada()) {

        expressedConsent = Xrm.Page.getAttribute('arup_expressedconsent').getValue();
        var now = new Date();

        if (Xrm.Page.getAttribute("arup_receiptdate").getValue() != null && Xrm.Page.getAttribute("arup_receiptdate").getValue() > now) {

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

}

function syncBusinessInterest() {

    var singleSelect = Xrm.Page.getAttribute("ccrm_businessinterest").getValue();
    var businessInterestCode = Xrm.Page.getAttribute("ccrm_businessinterestpicklistvalue").getValue();
    var businessInterestValue = Xrm.Page.getAttribute("ccrm_businessinterestpicklistname").getValue();

    //for mobile form
    if (isMobile) {

        //check to see if the value of the single select optionset has changed. If it hasn't, then nothing needs to be done
        if (!Xrm.Page.getAttribute('ccrm_businessinterest').getIsDirty()) return;

        // check to see if the value is being removed, so remove it from both *name and *value fields
        if (singleSelect == null) {

            //check if it's the only value in *name & *disp fidls and if it is, put NULL in both of them
            if (businessInterestCode.indexOf(",") == -1) {
                Xrm.Page.getAttribute("ccrm_businessinterestpicklistvalue").setValue(null);
                Xrm.Page.getAttribute("ccrm_businessinterestpicklistname").setValue(null);
            }
            //there's more than 1 entry
            else {

                //first remove the value
                businessInterestCode = businessInterestCode.split(',');
                businessInterestValue = businessInterestValue.split(', ');
                var entryNum = businessInterestCode.indexOf(String(businessInterestSaved));
                Xrm.Page.getAttribute("ccrm_businessinterestpicklistvalue").setValue(removeFromList(Xrm.Page.getAttribute("ccrm_businessinterestpicklistvalue").getValue(), businessInterestSaved.toString(), ','));
                Xrm.Page.getAttribute("ccrm_businessinterestpicklistname").setValue(removeFromList(Xrm.Page.getAttribute("ccrm_businessinterestpicklistname").getValue(), businessInterestValue[entryNum].trim(), ', '));
                //then push the 1st entry in the multi-select list to the single select list
                Xrm.Page.getAttribute("ccrm_businessinterest").setValue(Xrm.Page.getAttribute("ccrm_businessinterestpicklistvalue").getValue().split(',')[0]);

            }
        }
        //the value is being edded or changed
        else {

            //check to see if the value selected in single select already exists in multi select. If this is the case, no need to do anything
            if (businessInterestCode != null && businessInterestCode.indexOf(singleSelect) != -1) {
                businessInterestSaved = singleSelect;
                return;
            }

            //check if single select optionset is empty or multiselect optionset is either empty or has just 1 value
            //in this case just push the new value to *disp and *value fields
            if (businessInterestSaved == null || businessInterestCode == null || (businessInterestCode != null && businessInterestCode.indexOf(",") == -1)) {
                Xrm.Page.getAttribute("ccrm_businessinterestpicklistvalue").setValue(String(singleSelect));
                Xrm.Page.getAttribute("ccrm_businessinterestpicklistname").setValue(Xrm.Page.getAttribute("ccrm_businessinterest").getText());
            }
            //check to see if multiselect optionset field has more than 1 value
            //if that's the case, the old values in *disp and *val need to be replaced with the new value from the single select
            else {

                businessInterestCode = businessInterestCode.split(',');
                businessInterestValue = businessInterestValue.split(', ');
                var entryNum = businessInterestCode.indexOf(String(businessInterestSaved));

                businessInterestCode[entryNum] = String(singleSelect).trim();
                businessInterestValue[entryNum] = Xrm.Page.getAttribute("ccrm_businessinterest").getText().trim();

                // make sure to remove all trailing/leading spaces from all array elements
                var arrayLength = businessInterestValue.length;
                for (var i = 0; i < arrayLength; i++) {
                    businessInterestValue[i] = businessInterestValue[i].trim();
                    businessInterestCode[i] = businessInterestCode[i].trim();
                }

                Xrm.Page.getAttribute("ccrm_businessinterestpicklistvalue").setValue(businessInterestCode.join(','));
                Xrm.Page.getAttribute("ccrm_businessinterestpicklistname").setValue(businessInterestValue.join(', '));
            }
        }
    }
    //Full WEB client
    else {

        //check to see if the value has been blanked out and if it has, remove value from single-select
        var businessInterestValue = Xrm.Page.getAttribute("ccrm_businessinterestpicklistname").getValue();
        if (businessInterestValue == null) {
            Xrm.Page.getAttribute("ccrm_businessinterest").setValue(null);
        }

        //else, push the 1st value of the multi-select into single-select
        else {
            Xrm.Page.getAttribute("ccrm_businessinterest").setValue(businessInterestCode.split(',')[0]);
        }
    }
    //save the current single select in case it's changed later
    businessInterestSaved = Xrm.Page.getAttribute("ccrm_businessinterest").getValue();
}

function removeFromList(list, value, separator) {

    separator = separator || ",";
    var values = list.split(separator);
    for (var i = 0 ; i < values.length ; i++) {
        if (values[i] == value) {
            values.splice(i, 1);
            return values.join(separator);
        }
    }
    return list;
}

function setDate(date) {
    var field = Xrm.Page.data.entity.attributes.get("ccrm_contactlastvalidatedbyid").getValue();

    if (field != null) {
        Xrm.Page.getAttribute("ccrm_lastvalidateddate").setValue(new Date());
        Xrm.Page.getAttribute("ccrm_lastvalidateddate").setSubmitMode("always");
    }
}

//function DoNotContactMethodsPickList() {

//    ShowAllPickListItems("preferredcontactmethodcode");

//    if (Xrm.Page.getAttribute("donotemail").getValue() == true)
//        HidePickListItem("preferredcontactmethodcode", "2");

//    if (Xrm.Page.getAttribute("donotphone").getValue() == true)
//        HidePickListItem("preferredcontactmethodcode", "3");

//    if (Xrm.Page.getAttribute("donotfax").getValue() == true)
//        HidePickListItem("preferredcontactmethodcode", "4");

//    if (Xrm.Page.getAttribute("donotpostalmail").getValue() == true)
//        HidePickListItem("preferredcontactmethodcode", "5");

//    if (Xrm.Page.getAttribute("donotemail").getValue() == true || Xrm.Page.getAttribute("donotbulkemail").getValue() == true || Xrm.Page.getAttribute("donotphone").getValue() == true || Xrm.Page.getAttribute("donotfax").getValue() == true || Xrm.Page.getAttribute("donotpostalmail").getValue() == true)
//        HidePickListItem("preferredcontactmethodcode", "1");

//}

function ccrm_countryid_onchange() {

    //sync up country with countryid field
    if (Xrm.Page.ui.getFormType() != 1) {
        syncCountry()
    }
}

//function to sync up country with countryid field
function syncCountry() {
    if (Xrm.Page.getAttribute("ccrm_countryid").getValue() != null) {
        //sync up country with countryid field
        Xrm.Page.getAttribute("address1_country").setValue(Xrm.Page.getAttribute("ccrm_countryid").getValue()[0].name);
    }
    else {
        Xrm.Page.getAttribute("address1_country").setValue(null);
    }
}

function canadaSectionVisibility() {

    Xrm.Page.ui.tabs.get("tab_Details").sections.get("Canada_Privacy_Law_Section").setVisible(isCanada());
    canadaRequiredFields();

}

//function HidePickListItem(listID, option) {
//    var objList = Xrm.Page.getControl(listID);
//    objList.removeOption(option);
//}

//function ShowAllPickListItems(listID) {

//    var optionsetControl = Xrm.Page.getControl(listID);
//    if (optionsetControl != null) {

//        var options = optionsetControl.getAttribute().getOptions();
//        optionsetControl.clearOptions();
//        for (var i = 0; i < options.length; i++) {
//            optionsetControl.addOption(options[i], i + 1);
//        }
//    }
//}

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

function enableAddressFields(sync) {

    var submitMode = sync == true ? 'never' : 'dirty';

    Xrm.Page.getControl("address1_addresstypecode").setDisabled(sync);
    Xrm.Page.getControl("address1_line1").setDisabled(sync);
    Xrm.Page.getControl("address1_line2").setDisabled(sync);
    Xrm.Page.getControl("address1_line3").setDisabled(sync);
    Xrm.Page.getControl("address1_postalcode").setDisabled(sync);
    Xrm.Page.getControl("ccrm_countryid").setDisabled(sync);
    Xrm.Page.getControl("address1_city").setDisabled(sync);
    Xrm.Page.getControl("ccrm_countrystate").setDisabled(sync);
    Xrm.Page.getControl("address1_stateorprovince").setDisabled(sync);

    Xrm.Page.getAttribute("address1_addresstypecode").setSubmitMode(submitMode);
    Xrm.Page.getAttribute("address1_line1").setSubmitMode(submitMode);
    Xrm.Page.getAttribute("address1_line2").setSubmitMode(submitMode);
    Xrm.Page.getAttribute("address1_line3").setSubmitMode(submitMode);
    Xrm.Page.getAttribute("address1_postalcode").setSubmitMode(submitMode);
    Xrm.Page.getAttribute("ccrm_countryid").setSubmitMode(submitMode);
    Xrm.Page.getAttribute("address1_city").setSubmitMode(submitMode);
    Xrm.Page.getAttribute("ccrm_countrystate").setSubmitMode(submitMode);
    Xrm.Page.getAttribute("address1_stateorprovince").setSubmitMode(submitMode);

}

function PopulateAddrsOnAddrSync() {

    var sync = Xrm.Page.getAttribute("ccrm_syncaddress").getValue();

    enableAddressFields(sync);
    var parentCustId = Xrm.Page.getAttribute("parentcustomerid").getValue();
    if (parentCustId != null && parentCustId.length > 0 && sync) {

        Xrm.Page.getAttribute("address1_addresstypecode").setValue(null);
        Xrm.Page.getAttribute("address1_line1").setValue(null);
        Xrm.Page.getAttribute("address1_line2").setValue(null);
        Xrm.Page.getAttribute("address1_line3").setValue(null);
        Xrm.Page.getAttribute("address1_postalcode").setValue(null);
        Xrm.Page.getAttribute("ccrm_countryid").setValue(null);
        Xrm.Page.getAttribute("address1_city").setValue(null);
        Xrm.Page.getAttribute("ccrm_countrystate").setValue(null);
        Xrm.Page.getAttribute("address1_stateorprovince").setValue(null);


        var strId = parentCustId[0].id;
        var Id = strId.replace(/[{}]/g, "");
        var entityName = "accounts";
        var columnSet = "?$select=_ccrm_countrystate_value,_ccrm_countryid_value,address1_addresstypecode,address1_line1,address1_line2,address1_line3,address1_postalcode,address1_stateorprovince,address1_city";
        retrieveEntity(entityName, Id, columnSet);
    }
}

function gridRowSelected(context) {

    var entityObject = context.getFormContext().getData().getEntity();
    var id = entityObject.getId(); /* GUID of the contact record */

    var syncAddress;
    SDK.REST.retrieveRecord(id, "Contact", 'Ccrm_SyncAddress', null,
        function (retrievedreq) {
            if (retrievedreq != null) {
                syncAddress = retrievedreq.Ccrm_SyncAddress;
                entityObject.attributes.forEach(function (attr) {
                    if (
                            (attr.getName() === "ccrm_countryid" || attr.getName() === "ccrm_address2countrypicklist" || attr.getName() == "ccrm_businessinterestpicklistname" ||
                             attr.getName() == "ccrm_businessinterestpicklistvalue" || attr.getName() == "ccrm_businessinterest" || attr.getName() === "ccrm_countrystate") ||
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
            }
        }, errorHandler, true);
}

function errorHandler(error) {

    Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
        '<font size="3" color="#000000"></br>' + error.message + '</font>',
        [
            { label: "<b>OK</b>", setFocus: true },
        ], "ERROR", 500, 350, '', true);
}

function retrieveEntity(entityname, id, columnset) {
    var serverURL = Xrm.Page.context.getClientUrl();
    var Query = entityname + "(" + id + ")" + columnset;
    var req = new XMLHttpRequest();
    req.open("GET", serverURL + "/api/data/v8.2/" + Query, true);
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

                    if (retrievedreq._ccrm_countryid_value != null && Xrm.Page.getAttribute("ccrm_countryid") != null) {
                        var countryName = retrievedreq["_ccrm_countryid_value@OData.Community.Display.V1.FormattedValue"];
                        Xrm.Page.getAttribute("ccrm_countryid").setValue([
                        {

                            id: retrievedreq._ccrm_countryid_value,
                            name: countryName,
                            entityType: "ccrm_country"
                        }
                        ]);
                    }


                    if (retrievedreq._ccrm_countrystate_value != null && Xrm.Page.getAttribute("ccrm_countrystate") != null) {
                        var stateName = retrievedreq["_ccrm_countrystate_value@OData.Community.Display.V1.FormattedValue"];
                        Xrm.Page.getAttribute("ccrm_countrystate").setValue([
                        {
                            id: retrievedreq._ccrm_countrystate_value,
                            name: stateName,
                            entityType: "ccrm_arupusstate"
                        }
                        ]);
                    }


                    if (retrievedreq.address1_addresstypecode != null && Xrm.Page.getAttribute("address1_addresstypecode") != null) {
                        Xrm.Page.getAttribute("address1_addresstypecode").setValue(retrievedreq.address1_addresstypecode);
                    }

                    if (retrievedreq.address1_line1 != null && Xrm.Page.getAttribute("address1_line1") != null) {
                        Xrm.Page.getAttribute("address1_line1").setValue(retrievedreq.address1_line1);
                    }

                    if (retrievedreq.address1_line2 != null && Xrm.Page.getAttribute("address1_line2") != null) {
                        Xrm.Page.getAttribute("address1_line2").setValue(retrievedreq.address1_line2);
                    }

                    if (retrievedreq.address1_line3 != null && Xrm.Page.getAttribute("address1_line3") != null) {
                        Xrm.Page.getAttribute("address1_line3").setValue(retrievedreq.address1_line3);
                    }

                    if (retrievedreq.address1_postalcode != null && Xrm.Page.getAttribute("address1_postalcode") != null) {
                        Xrm.Page.getAttribute("address1_postalcode").setValue(retrievedreq.address1_postalcode);
                    }

                    if (retrievedreq.address1_stateorprovince != null && Xrm.Page.getAttribute("address1_stateorprovince") != null) {
                        Xrm.Page.getAttribute("address1_stateorprovince").setValue(retrievedreq.address1_stateorprovince);
                    }

                    if (retrievedreq.address1_city != null && Xrm.Page.getAttribute("address1_city") != null) {
                        Xrm.Page.getAttribute("address1_city").setValue(retrievedreq.address1_city);
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

function userInTeamCheck(TeamName) {

    var IsPresentInTeam = false;

    try {
        var filter = "SystemUserId eq (guid'" + Xrm.Page.context.getUserId() + "')";
        var dataset = "TeamMembershipSet";
        var retrievedMultiple = ConsultCrm.Sync.RetrieveMultipleRequest(dataset, filter);
        var results = retrievedMultiple.results;

        for (i = 0; i < results.length; i++) {
            var filterTeam = "TeamId eq (guid'" + results[i].TeamId + "')";
            var datasetTeam = "TeamSet";
            var retrievedMultipleTeam = ConsultCrm.Sync.RetrieveMultipleRequest(datasetTeam, filterTeam);
            var resultsTeam = retrievedMultipleTeam.results;
            if (resultsTeam[0].Name == TeamName) {
                IsPresentInTeam = true;
                break;
            }
        }
    }
    catch (err) {
        console.log('GLobal DQ Error: ' + err.message);
    }
    return IsPresentInTeam;
}