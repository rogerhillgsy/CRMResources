/// <reference path="arup_exitFormFunctions.js"/>"
/// <reference path="arup_alert.js"/>"

function onForm_Load(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.ui.getFormType() == 1) {
        formContext.getAttribute('requiredattendees').setValue(null);
    }

    filterOnLoad(formContext);
    addEventHandler(formContext);
}

function onForm_save(executionContext) {

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
    return function() {
        var filter = "<filter type='and'><condition attribute='contactid' operator='not-null'/></filter>";
        //apply the filter  
        formContext.getControl("regardingobjectid").addCustomFilter(filter, "contact");
    }
}

function changeLookFor(formContext, fieldName) {

    var control = formContext.getControl(fieldName);
    control.setEntityTypes(['contact']);
}

function markAsComplete(formContext ) {

    formContext.getAttribute('arup_sentiment').setRequiredLevel('required');
    formContext.getAttribute('arup_outcome').setRequiredLevel('required');

    var preventSave = (formContext.getAttribute('arup_sentiment').getValue() == null || formContext.getAttribute('arup_outcome').getValue() == null ? true : false);

    if (preventSave == false) {

        formContext.getControl('arup_sentiment').clearNotification('sentimenterror');
        formContext.getControl('arup_outcome').clearNotification('outcomeerror');

        formContext.getAttribute('statecode').setValue(1);
        formContext.getAttribute('statuscode').setValue(3);

        formContext.data.save().then(function () {    // The save prevents "unsaved"-warning.
            formContext.ui.close();
            //formContext.data.refresh();
        }, null);

    }
    else {

        if (formContext.getAttribute('arup_sentiment').getValue() == null) {
            formContext.getControl('arup_sentiment').setNotification('Sentiment must be filled out when closing Appointment', 'sentimenterror');
        }
        if (formContext.getAttribute('arup_outcome').getValue() == null) {
            formContext.getControl('arup_outcome').setNotification('Outcome must be filled out when closing Appointment', 'outcomeerror');
        }

        setTimeout(function () {

            formContext.getControl('arup_sentiment').clearNotification('sentimenterror');
            formContext.getControl('arup_outcome').clearNotification('outcomeerror');
            formContext.getAttribute('arup_sentiment').setRequiredLevel('none');
            formContext.getAttribute('arup_outcome').setRequiredLevel('none');

        }, 5000);

    }

}

function markAsCanceled(formContext) {

    formContext.getAttribute('statecode').setValue(2);
    formContext.getAttribute('statuscode').setValue(4);

    formContext.data.save().then(function () {    // The save prevents "unsaved"-warning.
        formContext.data.refresh();
    }, null);

}


function filterOnLoad(formContext) {

    var lookupFor = ['contact', 'systemuser'];
    var fieldList = ['requiredattendees', 'optionalattendees'];
    filterField(formContext, fieldList, lookupFor);
}

function filterField(formContext, fieldList, lookupFor) {

    fieldList.forEach(
        function(item, index) {
            formContext.getControl(item).setEntityTypes(lookupFor);
        });
}

function getRegarding(executionContext) {
    var formContext = executionContext.getFormContext();

    var regarding = formContext.getAttribute('regardingobjectid').getValue();
    if (regarding == null) { return; }
    //console.log('Type: ' + regarding[0].entityType);

}

function setLookupField(formContext, id, name, entity, field) {

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
        formContext.getAttribute(field).setValue(lookup);
    } else {
        formContext.getAttribute(field).setValue(null);
    }
}

/**
 * @description Called from the command bar exit button
 * @param {any} formContext
 */
function exitForm(formContext ) {
    ArupExit.exitForm(formContext, "appointment");
}
