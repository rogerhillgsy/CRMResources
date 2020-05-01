function onForm_Load(executionContext) {

    filterOnLoad();
    //duedate_onchange();
    addEventHandler();

    if (Xrm.Page.ui.getFormType() == 1) {
        Xrm.Page.getAttribute('arup_isfullform').setValue(true);
    }

}

function onForm_save() {

}

function duedate_onchange() {

    //var enddate = Xrm.Page.getAttribute("scheduledend").getValue();
    //var today = new Date();z`
    //var visible = today > enddate;

    //Xrm.Page.getControl('arup_sentiment').setVisible(visible);
    //Xrm.Page.getControl('arup_outcome').setVisible(visible);

}

function markAsComplete() {

    Xrm.Page.getAttribute('arup_sentiment').setRequiredLevel('required');
    Xrm.Page.getAttribute('arup_outcome').setRequiredLevel('required');

    //Xrm.Page.getControl('arup_sentiment').setVisible(true);
    //Xrm.Page.getControl('arup_outcome').setVisible(true);

    var preventSave = (Xrm.Page.getAttribute('arup_sentiment').getValue() == null || Xrm.Page.getAttribute('arup_outcome').getValue() == null ? true : false);

    if (preventSave == false) {

        Xrm.Page.getControl('arup_sentiment').clearNotification('sentimenterror');
        Xrm.Page.getControl('arup_outcome').clearNotification('outcomeerror');

        Xrm.Page.getAttribute('statecode').setValue(1);
        Xrm.Page.getAttribute('statuscode').setValue(2);

        Xrm.Page.data.save().then(function () {    // The save prevents "unsaved"-warning.
            Xrm.Page.ui.close();
            //Xrm.Page.data.refresh();
        }, null);

    }
    else {

        if (Xrm.Page.getAttribute('arup_sentiment').getValue() == null) {
            Xrm.Page.getControl('arup_sentiment').setNotification('Sentiment must be filled out when closing Phone Call', 'sentimenterror');
        }
        if (Xrm.Page.getAttribute('arup_outcome').getValue() == null) {
            Xrm.Page.getControl('arup_outcome').setNotification('Outcome must be filled out when closing Phone Call', 'outcomeerror');
        }

        setTimeout(function () {

            Xrm.Page.getControl('arup_sentiment').clearNotification('sentimenterror');
            Xrm.Page.getControl('arup_outcome').clearNotification('outcomeerror');
            Xrm.Page.getAttribute('arup_sentiment').setRequiredLevel('none');
            Xrm.Page.getAttribute('arup_outcome').setRequiredLevel('none');

        }, 5000);

    }

}

function markAsCanceled() {

    Xrm.Page.getAttribute('arup_sentiment').setRequiredLevel('none');
    Xrm.Page.getAttribute('arup_outcome').setRequiredLevel('none');
    Xrm.Page.getControl('arup_sentiment').clearNotification('sentimenterror');
    Xrm.Page.getControl('arup_outcome').clearNotification('outcomeerror');

    //Xrm.Page.getControl('arup_sentiment').setVisible(false);
    //Xrm.Page.getControl('arup_outcome').setVisible(false);

    Xrm.Page.getAttribute('statecode').setValue(2);
    Xrm.Page.getAttribute('statuscode').setValue(3);

    Xrm.Page.data.save().then(function () {    // The save prevents "unsaved"-warning.
        Xrm.Page.data.refresh();
    }, null);

}

function reOpen() {

    Xrm.Page.getAttribute('statecode').setValue(0);
    Xrm.Page.getAttribute('statuscode').setValue(1);

    Xrm.Page.data.save().then(function () {    // The save prevents "unsaved"-warning.
        Xrm.Page.data.refresh();
    }, null);

}

function showReopnButton() {

    return Xrm.Page.getAttribute('statecode').getValue() != 0 && Xrm.Page.getAttribute('arup_sentiment').getValue() == null && Xrm.Page.getAttribute('arup_outcome').getValue() == null;

}

function addEventHandler() {

    // add the event handler for PreSearch Event
    changeLookFor('regardingobjectid');
    Xrm.Page.getControl("regardingobjectid").addPreSearch(addFilter);

}

function addFilter() {

    var filter = "<filter type='and'><condition attribute='contactid' operator='not-null'/></filter>";
    //apply the filter  
    Xrm.Page.getControl("regardingobjectid").addCustomFilter(filter, "contact");

}

function changeLookFor(fieldName) {

    var control = Xrm.Page.getControl(fieldName);
    control.setEntityTypes(['contact']);
}

function filterOnLoad(executionContext) {

    var lookupFor = ['contact', 'systemuser'];
    var fieldList = ['from', 'to'];
    filterField(fieldList, lookupFor);

    // Xrm.Page.getAttribute('regardingobjectid').setLookupTypes('contact');
    //filterField(['contact'], ['regardingobjectid']);


    //var lookup = Xrm.Page.getAttribute('regardingobjectid');
    ////check if multiple type dropdowns enabled for this lookup and it is not a partylist. For partylist we might want to select an account and a contact
    //if (lookup.getLookupTypes().length > 1
    //     && !lookup.getIsPartyList()) {
    //    lookup.setLookupTypes(['contact']);
    //}    

}

function filterField(fieldList, lookupFor) {

    fieldList.forEach(
        function (item, index) {
            Xrm.Page.getControl(item).setEntityTypes(lookupFor);
        })
}

function setOrganisation(fieldname) {

    var party = Xrm.Page.getAttribute(fieldname);
    var members = party.getValue();
    var organisation = Xrm.Page.getAttribute('arup_organisationid').getValue();
    var keyPerson = Xrm.Page.getAttribute('regardingobjectid').getValue();
    var lookupOrg = organisation == null;
    var lookupKeyPerson = fieldname == 'to'; /* always overwrite Keyperson as it's a hidden field and cannot be manually set, but only from Call To field */

    if (members == null || (!lookupOrg && !lookupKeyPerson)) { return; }

    //loop in reverse to get the value of the first contact
    if (lookupOrg) {
        for (var i = members.length - 1; i >= 0; i--) {

            // If not Contact type, process next element
            if (members[i].type != 2 || organisation != null) { continue; }

            //fetch contact record and get its Current Organisation to pre-populate Organisation field's value
            orgFound = fetchCurrentOrganisation(members[i].id, members[i].name, 'arup_organisationid');
            organisation = Xrm.Page.getAttribute('arup_organisationid').getValue();
        }
    }

    //loop in reverse to get the value of the first contact
    if (lookupKeyPerson) {
        for (var i = members.length - 1; i >= 0; i--) {

            // If not Contact type, process next element
            if (members[i].type != 2 || keyPerson != null) { continue; }
            setLookupField(members[i].id, members[i].name, 'contact', 'regardingobjectid');
            keyPerson = Xrm.Page.getAttribute('regardingobjectid').getValue();
        }
    }
}

function fetchCurrentOrganisation(contactId, contactName, fieldName) {

    var req = new XMLHttpRequest();
    contactId = contactId.replace('{', '').replace('}', '');
    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/contacts(" + contactId + ")?$select=_parentcustomerid_value", true);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var result = JSON.parse(this.response);
                var _parentcustomerid_value = result["_parentcustomerid_value"];
                var _parentcustomerid_value_formatted = result["_parentcustomerid_value@OData.Community.Display.V1.FormattedValue"];
                var _parentcustomerid_value_lookuplogicalname = result["_parentcustomerid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                if (_parentcustomerid_value != null) {
                    setLookupField(_parentcustomerid_value, _parentcustomerid_value_formatted, _parentcustomerid_value_lookuplogicalname, fieldName);
                }
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
}

function setLookupField(id, name, entity, field) {

    if (id != null) {
        if (id.indexOf('{') == -1) { id = '{' + id; }
        if (id.indexOf('}') == -1) { id = id + '}'; }
        id = id.toUpperCase();

        var lookup = new Array();
        lookup[0] = new Object();
        lookup[0].id = id;
        lookup[0].name = name;
        lookup[0].entityType = entity;
        Xrm.Page.getAttribute(field).setValue(lookup);
    } else {
        Xrm.Page.getAttribute(field).setValue(null);
    }
}

// runs on Exit button
function exitForm() {

    //see if the form is dirty
    var ismodified = Xrm.Page.data.entity.getIsDirty();
    if (ismodified == false) {
        Xrm.Page.ui.close();
        return;
    }

    var attributesList;

    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
        '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the Phone Call.</br>Click "Exit Only" button to exit the Phone Call without saving.</font>',
        [
            {
                label: "<b>Save and Exit</b>",
                callback: function () {
                    attributesList = Xrm.Page.data.entity.attributes.get();
                    var highlight = true;
                    var cansave = true;
                    if (attributesList != null) {
                        for (var i in attributesList) {
                            if (attributesList[i].getRequiredLevel() == 'required') {
                                highlight = Xrm.Page.getAttribute(attributesList[i].getName()).getValue() != null;
                                if (highlight == false && cansave == true) { cansave = false; }
                            }
                        }
                    }
                    if (cansave) { Xrm.Page.data.entity.save("saveandclose"); }
                },
                setFocus: true,
                preventClose: false
            },
            {
                label: "<b>Exit Only</b>",
                callback: function () {
                    //get list of dirty fields
                    attributesList = Xrm.Page.data.entity.attributes.get();
                    if (attributesList != null) {
                        for (var i in attributesList) {
                            if (attributesList[i].getIsDirty()) {
                                Xrm.Page.getAttribute(attributesList[i].getName()).setSubmitMode("never");
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