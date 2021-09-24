var isFromContact = false;
var isToContact = false;

function onForm_Load(executionContext) {

    var formContext = executionContext.getFormContext();
    filterOnLoad(formContext, 'from');
    filterOnLoad(formContext, 'to');

    changeLookFor(formContext, 'regardingobjectid');
    // addEventHandler(formContext);

    if (formContext.ui.getFormType() == 1) {
        formContext.getAttribute('arup_isfullform').setValue(true);
    }

}

function QuickCreateForm_OnLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    var lookupFor = ['contact', 'systemuser'];
    var fieldList = ['from', 'to'];
    filterField(formContext, fieldList, lookupFor);

    changeLookFor(formContext, 'regardingobjectid');

    ArupRelationshipTeam.FormLoad(formContext, "to", "ccrm_relationshipteam");
}

function onForm_save(executionContext) {

    var formContext = executionContext.getFormContext();

    if (isFromContact && isToContact) {

        var saveEvent = executionContext.getEventArgs();

        Alert.show('<font size="6" color="#FF9B1E"><b>Error</b></font>',
            '<font size="3" color="#000000">Both To and From cannot be Contacts</font>',
            [
                {
                    label: "<b>OK</b>",
                    setFocus: true,
                    preventClose: false
                }
            ],
            'Error', 500, 250, '', true);

        saveEvent.preventDefault();
    }

    else {
        var lookupValue = new Array();
        var contact = isPartyContact(formContext, 'from');

        formContext.getAttribute('directioncode').setValue(contact == null ? true : false);

        if (contact == null) {
            contact = isPartyContact(formContext, 'to');
        }
        if (contact != null) {
            lookupValue[0] = new Object();
            lookupValue[0].id = contact.id;
            lookupValue[0].name = contact.name;
            lookupValue[0].entityType = "contact";
        }

        formContext.getAttribute('arup_keyperson').setValue(lookupValue);

    }
}

function isPartyContact(formContext, attributeName) {

    var party = formContext.getAttribute(attributeName);
    var members = party.getValue();
    if (members == null) { return; }
    var contact;

    for (var i = members.length - 1; i >= 0; i--) {

        // If not Contact type, process next element
        if (members[i].entityType == 'contact') {
            contact = { id: members[i].id, name: members[i].name };
            return contact;
        }

    }
    return null;
}

function markAsComplete(primaryControl) {

    var formContext = primaryControl;

    formContext.getAttribute('arup_sentiment').setRequiredLevel('required');
    formContext.getAttribute('arup_outcome').setRequiredLevel('required');

    var preventSave = (formContext.getAttribute('arup_sentiment').getValue() == null || formContext.getAttribute('arup_outcome').getValue() == null ? true : false);

    if (preventSave == false) {

        formContext.getControl('arup_sentiment').clearNotification('sentimenterror');
        formContext.getControl('arup_outcome').clearNotification('outcomeerror');

        formContext.getAttribute('statecode').setValue(1);
        formContext.getAttribute('statuscode').setValue(2);

        formContext.data.save().then(function () {    // The save prevents "unsaved"-warning.
            formContext.ui.close();
        }, null);

    }
    else {

        if (formContext.getAttribute('arup_sentiment').getValue() == null) {
            formContext.getControl('arup_sentiment').setNotification('Sentiment must be filled out when closing Phone Call', 'sentimenterror');
        }
        if (formContext.getAttribute('arup_outcome').getValue() == null) {
            formContext.getControl('arup_outcome').setNotification('Outcome must be filled out when closing Phone Call', 'outcomeerror');
        }

        setTimeout(function () {

            formContext.getControl('arup_sentiment').clearNotification('sentimenterror');
            formContext.getControl('arup_outcome').clearNotification('outcomeerror');
            formContext.getAttribute('arup_sentiment').setRequiredLevel('none');
            formContext.getAttribute('arup_outcome').setRequiredLevel('none');

        }, 5000);

    }

}

function markAsCanceled(primaryControl) {

    var formContext = primaryControl;

    formContext.getAttribute('arup_sentiment').setRequiredLevel('none');
    formContext.getAttribute('arup_outcome').setRequiredLevel('none');
    formContext.getControl('arup_sentiment').clearNotification('sentimenterror');
    formContext.getControl('arup_outcome').clearNotification('outcomeerror');

    formContext.getAttribute('statecode').setValue(2);
    formContext.getAttribute('statuscode').setValue(3);

    formContext.data.save().then(function () {    // The save prevents "unsaved"-warning.
        formContext.data.refresh();
    }, null);

}

function reOpen(primaryControl) {

    var formContext = primaryControl;

    formContext.getAttribute('statecode').setValue(0);
    formContext.getAttribute('statuscode').setValue(1);

    formContext.data.save().then(function () {    // The save prevents "unsaved"-warning.
        formContext.data.refresh();
    }, null);

}

function showReopnButton(primaryControl) {

    var formContext = primaryControl;

    return formContext.getAttribute('statecode').getValue() != 0 && formContext.getAttribute('arup_sentiment').getValue() == null && formContext.getAttribute('arup_outcome').getValue() == null;

}

function addEventHandler(formContext) {

    // add the event handler for PreSearch Event
    changeLookFor(formContext, 'regardingobjectid');
    formContext.getControl("regardingobjectid").addPreSearch(addFilter(formContext));

}

/**
 * @description return a presearch filter function.
 * @param {any} formContext - The XRM execution context
 * @returns function to be used with the lookup pre-search function.
 */
function addFilter(formContext) {
    return function () {
        var filter = "<filter type='and'><condition attribute='contactid' operator='not-null'/></filter>";
        //apply the filter  
        formContext.getControl("regardingobjectid").addCustomFilter(filter, "contact");
    }
}

function changeLookFor(formContext, fieldName) {

    var control = formContext.getControl(fieldName);
    control.setEntityTypes(['opportunity']);
}

function filterOnLoad(formContext, attributeName) {

    var lookupFor;
    var fieldList;
    var contactID = isPartyContact(formContext, attributeName);
    if (attributeName == 'from') {
        isFromContact = contactID != null;
    }
    else if (attributeName == 'to') {
        isToContact = contactID != null;
    }
    if (contactID != null) {
        lookupFor = ['systemuser'];
        fieldList = [attributeName == 'from' ? 'to' : 'from'];
        filterField(formContext, fieldList, lookupFor);

        if (attributeName == 'from' && isToContact)
            formContext.getAttribute('to').setValue(null);
        else if (attributeName == 'to' && isFromContact)
            formContext.getAttribute('from').setValue(null);

        lookupFor = ['contact', 'systemuser'];
        fieldList = [attributeName];
        filterField(formContext, fieldList, lookupFor);
        return;
    }
    else {
        lookupFor = ['contact', 'systemuser'];
        if (!isFromContact && !isToContact) {
            fieldList = ['from', 'to'];
        }
        else if (!isFromContact && isToContact) {
            fieldList = ['to'];
        }
        else if (isFromContact && !isToContact) {
            fieldList = ['from'];
        }
        filterField(formContext, fieldList, lookupFor);
    }
}

function filterField(formContext, fieldList, lookupFor) {

    fieldList.forEach(
        function (item, index) {
            formContext.getControl(item).setEntityTypes(lookupFor);
        })
}

function setOrganisation(executionContext, fieldname) {

    var formContext = executionContext.getFormContext();
    filterOnLoad(formContext, 'from');
    var party = formContext.getAttribute(fieldname);
    var members = party.getValue();
    var contact;
    var organisation = null;
    var keyPerson = formContext.getAttribute('regardingobjectid').getValue();
    var lookupOrg = organisation == null;
    var lookupKeyPerson = fieldname == 'to'; /* always overwrite Keyperson as it's a hidden field and cannot be manually set, but only from Call To field */

    filterOnLoad(formContext, fieldname);

    contact = isPartyContact(formContext, fieldname);
    if (contact != null) {
        fetchContactPhones(formContext, contact.id);
        ArupRelationshipTeam.FormLoad(formContext, "to", "ccrm_relationshipteam");
    }

    if (members == null || (!lookupOrg && !lookupKeyPerson)) { return; }

    //loop in reverse to get the value of the first contact
    if (lookupKeyPerson) {
        for (var i = members.length - 1; i >= 0; i--) {

            // If not Contact type, process next element
            if (members[i].type != 2 || keyPerson != null) { continue; }
            setLookupField(formContext, members[i].id, members[i].name, 'contact', 'regardingobjectid');
            keyPerson = formContext.getAttribute('regardingobjectid').getValue();
        }
    }
}

function setLookupField(formContext, id, name, entity, field) {

    if (id != null) {
        if (id.indexOf('{') == -1) { id = '{' + id; }
        if (id.indexOf('}') == -1) { id = id + '}'; }
        id = id.toUpperCase();

        var lookup = new Array();
        lookup[0] = new Object();
        lookup[0].id = id;
        lookup[0].name = name;
        lookup[0].entityType = entity;
        formContext.getAttribute(field).setValue(lookup);
    } else {
        formContext.getAttribute(field).setValue(null);
    }
}

/**
 * Used in Quick Create form to update the (hidden) contact telephone and mobile numbers.
 * @param {any} executionContext
 */
function fetchContactPhones_ex(executionContext) {
    var formContext = executionContext.getFormContext();
    var source = executionContext.getEventSource();
    if (!!source) {
        var ids = source.getValue();
        if (ids.length > 0) {
            var firstContact = ids.filter((a) => a.entityType === "contact").shift();
            if (!!firstContact) {
                fetchContactPhones(formContext, firstContact.id);
            }
        }
    }
}

function fetchContactPhones(formContext, contactID) {

    Xrm.WebApi.online.retrieveRecord("contact", contactID, "?$select=mobilephone,telephone1").then(
        function success(result) {
            var mobilephone = result["mobilephone"] != null ? result["mobilephone"] : null;
            var telephone = result["telephone1"] != null ? result["telephone1"] : null;
            formContext.getAttribute('arup_contact_mobile').setValue(mobilephone);
            formContext.getAttribute('arup_contact_telephone').setValue(telephone);
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
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

    var attributesList;

    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
        '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the Phone Call.</br>Click "Exit Only" button to exit the Phone Call without saving.</font>',
        [
            {
                label: "<b>Save and Exit</b>",
                callback: function () {
                    attributesList = formContext.data.entity.attributes.get();
                    var highlight = true;
                    var cansave = true;
                    if (attributesList != null) {
                        for (var i in attributesList) {
                            if (attributesList[i].getRequiredLevel() == 'required') {
                                highlight = formContext.getAttribute(attributesList[i].getName()).getValue() != null;
                                if (highlight == false && cansave == true) { cansave = false; }
                            }
                        }
                    }
                    if (cansave) { formContext.data.entity.save("saveandclose"); }
                },
                setFocus: true,
                preventClose: false
            },
            {
                label: "<b>Exit Only</b>",
                callback: function () {
                    //get list of dirty fields
                    attributesList = formContext.data.entity.attributes.get();
                    if (attributesList != null) {
                        for (var i in attributesList) {
                            if (attributesList[i].getIsDirty()) {
                                formContext.getAttribute(attributesList[i].getName()).setSubmitMode("never");
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