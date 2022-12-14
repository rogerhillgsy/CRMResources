/// <reference path="arup_exitFormFunctions.js"/>"
var SSCMember = false;
function Form_onload(executionContext) {
    var formContext = executionContext.getFormContext();
    //set status to hidden unless category is Finance
    var category = formContext.getAttribute("category").getValue();
    var originatedFrom = formContext.getAttribute('arup_originatedfrom').getValue();
    SSCMember = userInSSCTeam(formContext);

    if (category == 'Finance' || category == 'Legal' || category == 'Bid Review' || category == 'Decision to Proceed' || category == 'Confirmed Job Approval') {
        formContext.getControl("ccrm_taskstatus").setVisible(true);
    }
    else {
        formContext.getControl("ccrm_taskstatus").setVisible(false);
    }

    if (formContext.getAttribute('statecode').getValue() == 0) {
        originatedFrom_onChange(executionContext);
        formContext.getControl("arup_organisationvalidation").setDisabled(!SSCMember);
        formContext.getControl("arup_creditcheck").setDisabled(!SSCMember);
    }

    //Set Category and Sub-Category read only if category is populated
    if (formContext.getAttribute("category").getValue() != null)
        formContext.getControl("category").setDisabled(true);
    if (formContext.getAttribute("subcategory").getValue() != null)
        formContext.getControl("subcategory").setDisabled(true);

    //If Exclusivity Request, set fields as non-editable
    if (formContext.getAttribute("category").getValue() == "Exclusivity") {
        formContext.getControl("subject").setDisabled(true);
        formContext.getControl("regardingobjectid").setDisabled(true);
        formContext.getControl("ownerid").setDisabled(true);
    }

    //If not declined/approved, hide the decline reason
    if (formContext.getAttribute("ccrm_taskstatus").getValue() == 3 || formContext.getAttribute("ccrm_taskstatus").getValue() == 2) {
        formContext.getControl("ccrm_declinereason").setVisible(true);
        formContext.getControl("description").setVisible(false);
    }
    else {
        formContext.getControl("ccrm_declinereason").setVisible(false);
    }

    if (formContext.getAttribute("ccrm_taskstatus").getValue() != 5) {
        //remove the req option from picklist
        formContext.getControl("ccrm_taskstatus").removeOption(5);
    }

    changeLookFor(formContext, 'regardingobjectid', 'opportunity');

}

function QuickCreateForm_Load(executionContext) {
    var formContext = executionContext.getFormContext();
    changeLookFor(formContext, 'regardingobjectid', 'opportunity');
}
function changeLookFor(formContext, fieldName, entityTypeToSet) {

    var control = formContext.getControl(fieldName);
    control.setEntityTypes([entityTypeToSet]);
}

function Form_onsave(executionContext) {
    var formContext = executionContext.getFormContext();

    //set the descsion to blank if not decision reason entered
    if (formContext.getAttribute("ccrm_declinereason").getValue() == "Please enter a decision reason") {
        formContext.getAttribute("ccrm_declinereason").setValue("No comments added");
    }

    if (formContext.getAttribute('arup_originatedfrom').getValue() != null) {
        //autoCompleteTask();
        validateCompletion(formContext);
    }
}

function originatedFrom_onChange(executionContext) {
    var formContext = executionContext.getFormContext();

    var originatedFrom = formContext.getAttribute('arup_originatedfrom').getValue();

    if (originatedFrom == null) { return; }

    var organisationValidation = formContext.getControl('arup_organisationvalidation');
    var creditCheck = formContext.getControl('arup_creditcheck');

    organisationValidation.setDisabled(organisationValidation.getAttribute().getValue() == null);
    creditCheck.setDisabled(creditCheck.getAttribute().getValue() == 770000002);

    switch (originatedFrom) {

        case 770000000: // 1. Opportunity

            organisationValidation.removeOption(770000001);
            organisationValidation.removeOption(770000003);
            break;

        case 770000001: // 2. Organisation Change Request

            organisationValidation.setLabel('Change Request');
            organisationValidation.removeOption(770000000);
            organisationValidation.removeOption(770000002);
            break;

        case 770000002: // 3. New Organisation

            organisationValidation.removeOption(770000001);
            organisationValidation.removeOption(770000003);
            break;
    }

}

function ccrm_taskstatus_onchange(executionContext) {
    var formContext = executionContext.getFormContext();

    //Set Decline Reason compulsory if declined/approved
    //bus reqd = 2, non req = 0
    if (formContext.getAttribute("ccrm_taskstatus").getValue() == 3 || formContext.getAttribute("ccrm_taskstatus").getValue() == 2) {
        formContext.getControl("ccrm_declinereason").setVisible(true);
        formContext.getControl("description").setVisible(false);
        formContext.getAttribute("ccrm_declinereason").setValue("Please enter a decision reason");
    }
    else {
        formContext.getControl("ccrm_declinereason").setVisible(false);
        formContext.getControl("description").setVisible(true);
        formContext.getAttribute("ccrm_declinereason").setValue(null);
    }
}

function validateCompletion(formContext) {
    //run from onForm_Save funciton

    //credit check:
    //770000000 - pending
    //770000001 - done
    //770000002 - N/A

    //Org. Validation:
    //770000000 - validation pending
    //770000001 - Change Pending
    //770000002 - Verified
    //770000003 - Change Request Completed

    if (!SSCMember) { return; }

    var organisationValidation = formContext.getAttribute('arup_organisationvalidation').getValue();
    var creditCheck = formContext.getAttribute('arup_creditcheck').getValue();
    var creditCheckChanged = formContext.getAttribute('arup_creditcheck').getIsDirty();
    var orgValidationChanged = formContext.getAttribute('arup_organisationvalidation').getIsDirty();

    if (
        (organisationValidation == null && creditCheck == 770000000 && creditCheckChanged) ||
        (organisationValidation == null && creditCheck == 770000001) ||
        (organisationValidation == 770000002 && creditCheck == 770000000 && creditCheckChanged && orgValidationChanged) ||
        (organisationValidation == 770000002 && creditCheck == 770000001) ||
        (organisationValidation == 770000002 && creditCheck == 770000002) ||
        (organisationValidation == 770000003 && creditCheck == 770000002) ||
        (organisationValidation == 770000000 && creditCheck == 770000001 && creditCheckChanged && orgValidationChanged) ||
        (organisationValidation == 770000000 && creditCheck == 770000002 && orgValidationChanged) ||
        (organisationValidation == 770000001 && creditCheck == 770000002 && orgValidationChanged)
    ) {

        formContext.getAttribute('statecode').setValue(1);
        formContext.getAttribute('statuscode').setValue(5);
        formContext.getAttribute('percentcomplete').setValue(100);
        formContext.getAttribute('actualend').setValue(new Date());

        if (organisationValidation == 770000000) {
            formContext.getAttribute('arup_organisationvalidation').setValue(770000002);
        }
        else if (organisationValidation == 770000001) {
            formContext.getAttribute('arup_organisationvalidation').setValue(770000003);
        }
        if (creditCheck == 770000000) {
            formContext.getAttribute('arup_creditcheck').setValue(770000001);
        }

        Alert.show('<font size="6" color="#2E74B5"><b>Task completed</b></font>',
            '<font size="3" color="#000000"></br>The task has been marked as completed.</font>',
            [new Alert.Button("<b>OK</b>")], "INFO", 600, 200, formContext.context.getClientUrl(), true);
    }
}

/**
 * @description Called from command bar button to mark activity as complete
 * @param {any} formContext
 * @param {any} displayError
 */
function markAsComplete(formContext, displayError) {
    //run from Mark Complete button

    var originatedFrom = formContext.getAttribute('arup_originatedfrom').getValue();
    var organisationValidation = formContext.getAttribute('arup_organisationvalidation').getValue();
    var creditCheck = formContext.getAttribute('arup_creditcheck').getValue();
    var clientURL = formContext.context.getClientUrl();
    var errorMessage = null;
    SSCMember = userInSSCTeam(formContext);

    //check if task was created automatically when organisation either requires verification or change was requested or credit check is required */
    if (SSCMember || originatedFrom == null) {

        if (originatedFrom != null) {
            //validate if all data has been entered before marking task as complete */
            switch (originatedFrom) {
                case 770000000: // 1. Opportunity
                case 770000002: // 3. New Organisation

                    if (
                        (organisationValidation == 770000002 && creditCheck == 770000000) ||
                        (organisationValidation == 770000000 && creditCheck == 770000001) ||
                        (organisationValidation == 770000000 && creditCheck == 770000000)
                    ) {
                        errorMessage =
                            'Organisation must be verified AND credit check must be done before this task can be completed';
                    } else {

                        if (organisationValidation == 770000000) {
                            formContext.getAttribute('arup_organisationvalidation').setValue(770000002);
                        }
                        if (creditCheck == 770000000) {
                            formContext.getAttribute('arup_creditcheck').setValue(770000001);
                        }
                    }

                    break;

                case 770000001: // 2. Organisation Change Request

                    formContext.getAttribute('arup_organisationvalidation').setValue(770000003);
                    break;
            }
        }

        // close task as complete if no errors found
        if (errorMessage == null) {

            formContext.getAttribute('statecode').setValue(1);
            formContext.getAttribute('statuscode').setValue(5);
            formContext.getAttribute('ccrm_taskstatus').setValue(2);
            formContext.getAttribute('percentcomplete').setValue(100);
            formContext.getAttribute('actualend').setValue(new Date());

            formContext.data.save().then(function () { // The save prevents "unsaved"-warning.

                Alert.show('<font size="6" color="#2E74B5"><b>Task completed</b></font>',
                    '<font size="3" color="#000000"></br>The task has been marked as completed.</font>',
                    [
                        new Alert.Button("<b>OK</b>",
                            function () { formContext.ui.close(); },
                            true,
                            false)
                    ],
                    "INFO",
                    600,
                    200,
                    '',
                    true);

            },
                null);

        } else if (displayError == true) {

            Alert.show('<font size="6" color="#d80303"><b>Error</b></font>',
                '<font size="3" color="#000000">' + errorMessage + '</font>',
                [
                    new Alert.Button("<b>OK</b>")
                ],
                "ERROR",
                500,
                200,
                clientURL,
                true);
        }
    }
}

function markAsCanceled(formContext) {

    var originatedFrom = formContext.getAttribute('arup_originatedfrom').getValue();
    SSCMember = userInSSCTeam(formContext);

    //check if task was created automatically when organisation either requires verification or change was requested or credit check is required */
    if (!SSCMember && originatedFrom != null) { return; }

    formContext.getAttribute('statecode').setValue(2);
    formContext.getAttribute('statuscode').setValue(6);
    formContext.getAttribute('ccrm_taskstatus').setValue(5);
    formContext.getAttribute('actualend').setValue(new Date());

    formContext.data.save().then(function () { // The save prevents "unsaved"-warning.

        Alert.show('<font size="6" color="#2E74B5"><b>Task canceled</b></font>',
            '<font size="3" color="#000000"></br>The task has been canceled.</font>',
            [
                new Alert.Button("<b>OK</b>",
                    function () { formContext.ui.close(); }, true, false)
            ], "INFO", 600, 200, '', true);

    }, null);
}

function userInSSCTeam(formContext) {

    var originatedFrom = formContext.getAttribute('arup_originatedfrom').getValue();
    if (originatedFrom == null) { return true; }

    var req = new XMLHttpRequest();
    var userid = formContext.context.getUserId().replace('{', '').replace('}', '');
    var userExists = false;
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/teammemberships?$filter=systemuserid eq " + userid + " and (teamid eq 01886278-29CF-E911-8128-00505690CB20 or teamid eq F469F99A-29CF-E911-8128-00505690CB20 or teamid eq 0F61DA8A-29CF-E911-8128-00505690CB20 or teamid eq 8D568D76-48E5-E911-812B-00505690CB20 or teamid eq A7E35C81-29CF-E911-8128-00505690CB20 or teamid eq 12129B56-29CF-E911-8128-00505690CB20 or teamid eq 2247756B-29CF-E911-8128-00505690CB20)", false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                userExists = results.value.length > 0;
            } else {
                Xrm.Navigation.openAlertDialog(this.statusText);
            }
        }
    };
    req.send();
    return userExists;
}

/**
 * @description Called from the command bar exit button
 * @param {any} formContext
 */
function exitForm(formContext) {
    ArupExit.exitForm(formContext,"task");
}

/**
 * @description Called from the command bar On Hold button
 * @param {any} formContext
 */
function MarkOnHold(formContext) {
    formContext.getAttribute('ccrm_taskstatus').setValue(6);
    formContext.data.save().then(function () { // The save prevents "unsaved"-warning.
    Alert.show('<font size="6" color="#2E74B5"><b>Task On Hold</b></font>',
        '<font size="3" color="#000000"></br>The task has been put on hold.</font>',
        [new Alert.Button("<b>OK</b>")], "INFO", 600, 200, formContext.context.getClientUrl(), true);
    }, null);
}