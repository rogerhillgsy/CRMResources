function onForm_Load(executionContext) {

    if (Xrm.Page.ui.getFormType() == 1) {
        Xrm.Page.getAttribute('requiredattendees').setValue(null);
    }

    //enddate_onchange();
    filterOnLoad();
    addEventHandler();
    
}

function onForm_save(executionObj) {

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
    control.getAttribute().setLookupTypes(['contact']);
}

function markAsComplete() {

    Xrm.Page.getAttribute('arup_sentiment').setRequiredLevel('required');
    Xrm.Page.getAttribute('arup_outcome').setRequiredLevel('required');

    var preventSave = (Xrm.Page.getAttribute('arup_sentiment').getValue() == null || Xrm.Page.getAttribute('arup_outcome').getValue() == null ? true : false);

    if (preventSave == false) {

        Xrm.Page.getControl('arup_sentiment').clearNotification('sentimenterror');
        Xrm.Page.getControl('arup_outcome').clearNotification('outcomeerror');

        Xrm.Page.getAttribute('statecode').setValue(1);
        Xrm.Page.getAttribute('statuscode').setValue(3);

        Xrm.Page.data.save().then(function () {    // The save prevents "unsaved"-warning.
            Xrm.Page.ui.close();
            //Xrm.Page.data.refresh();
        }, null);

    }
    else {

        if (Xrm.Page.getAttribute('arup_sentiment').getValue() == null) {
            Xrm.Page.getControl('arup_sentiment').setNotification('Sentiment must be filled out when closing Appointment', 'sentimenterror');
        }
        if (Xrm.Page.getAttribute('arup_outcome').getValue() == null) {
            Xrm.Page.getControl('arup_outcome').setNotification('Outcome must be filled out when closing Appointment', 'outcomeerror');
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

    Xrm.Page.getAttribute('statecode').setValue(2);
    Xrm.Page.getAttribute('statuscode').setValue(4);

    Xrm.Page.data.save().then(function () {    // The save prevents "unsaved"-warning.
        Xrm.Page.data.refresh();
    }, null);

}


function enddate_onchange() {

    // timeout here is needed to wait till End Date is change by Start Date (if applicable)
    setTimeout(function () { 

        var enddate = Xrm.Page.getAttribute("scheduledend").getValue();
        var today = new Date();
        var visible = today > enddate;

        Xrm.Page.getControl('arup_sentiment').setVisible(visible);
        Xrm.Page.getControl('arup_outcome').setVisible(visible);        

    }, 1000);
}

function filterOnLoad(executionContext) {
   
    var lookupFor = ['contact', 'systemuser'];
    var fieldList = ['requiredattendees', 'optionalattendees'];
    filterField(fieldList, lookupFor);
}

function filterField(fieldList, lookupFor) {

    fieldList.forEach(
        function (item, index) {
            Xrm.Page.getAttribute(item).setLookupTypes(lookupFor);
        })
}

function setOrganisation(fieldname) {

    var party = Xrm.Page.getAttribute(fieldname);
    var members = party.getValue();
    var organisation = Xrm.Page.getAttribute('arup_organisationid').getValue();
    if (organisation != null || members == null) { return };
    
    //loop in reverse to get the vakue of the first contact
    for (var i = members.length - 1; i >= 0; i--) {

        // If not Contact type, process next element
        if (members[i].type != 2 || organisation != null) { continue; }

        //fetch contact record and get its Current Organisation to pre-populate Organisation field's value
        orgFound = fetchCurrentOrganisation(members[i].id, members[i].name);
        organisation = Xrm.Page.getAttribute('arup_organisationid').getValue();
            
    }
}

function fetchCurrentOrganisation(contactId, contactName) {

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
                    setLookupField(_parentcustomerid_value, _parentcustomerid_value_formatted, _parentcustomerid_value_lookuplogicalname, 'arup_organisationid');
                }                
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
}

function getRegarding() {

    var regarding = Xrm.Page.getAttribute('regardingobjectid').getValue();
    if (regarding == null) { return; }
    //console.log('Type: ' + regarding[0].entityType);

}

function setLookupField(id, name, entity, field) {

    if (id != null) {
        if (id.indexOf('{') == -1)
            id = '{' + id;
        if (id.indexOf('}') == -1)
            id = id + '}';
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

    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
        '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the Appointment.</br>Click "Exit Only" button to exit the Appointment without saving.</font>',
        [
            {
                label: "<b>Save and Exit</b>",
                callback: function () {
                    var acctAttributes = Xrm.Page.data.entity.attributes.get();
                    var highlight = true;
                    var cansave = true;
                    if (acctAttributes != null) {
                        for (var i in acctAttributes) {
                            if (acctAttributes[i].getRequiredLevel() == 'required') {
                                highlight = Xrm.Page.getAttribute(acctAttributes[i].getName()).getValue() != null;
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
                    var attributesList = Xrm.Page.data.entity.attributes.get();
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