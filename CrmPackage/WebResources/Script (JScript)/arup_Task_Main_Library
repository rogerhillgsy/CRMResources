var SSCMember = false;

function Form_onload() {
    //set status to hidden unless category is Finance
    var category = Xrm.Page.getAttribute("category").getValue();
    var originatedFrom = Xrm.Page.getAttribute('arup_originatedfrom').getValue();
    SSCMember = userInSSCTeam();

    if (category == 'Finance' || category == 'Legal' || category == 'Bid Review' || category == 'Decision to Proceed' || category == 'Confirmed Job Approval') {
        Xrm.Page.getControl("ccrm_taskstatus").setVisible(true);
    }
    else {
        Xrm.Page.getControl("ccrm_taskstatus").setVisible(false);
    }

    if (Xrm.Page.getAttribute('statecode').getValue() == 0) {
        originatedFrom_onChange();
        Xrm.Page.getControl("arup_organisationvalidation").setDisabled(!SSCMember);
        Xrm.Page.getControl("arup_creditcheck").setDisabled(!SSCMember);
    }

    //Set Category and Sub-Category read only if category is populated
    if (Xrm.Page.getAttribute("category").getValue() != null)
        Xrm.Page.getControl("category").setDisabled(true);
    if (Xrm.Page.getAttribute("subcategory").getValue() != null)
        Xrm.Page.getControl("subcategory").setDisabled(true);

    //If Exclusivity Request, set fields as non-editable
    if (Xrm.Page.getAttribute("category").getValue() == "Exclusivity") {
        Xrm.Page.getControl("subject").setDisabled(true);
        Xrm.Page.getControl("regardingobjectid").setDisabled(true);
        Xrm.Page.getControl("ownerid").setDisabled(true);
    }

    //If not declined/approved, hide the decline reason
    if (Xrm.Page.getAttribute("ccrm_taskstatus").getValue() == 3 || Xrm.Page.getAttribute("ccrm_taskstatus").getValue() == 2) {
        Xrm.Page.getControl("ccrm_declinereason").setVisible(true);
        Xrm.Page.getControl("description").setVisible(false);
    }
    else {
        Xrm.Page.getControl("ccrm_declinereason").setVisible(false);
    }

    if (Xrm.Page.getAttribute("ccrm_taskstatus").getValue() != 5) {
        //remove the req option from picklist
        Xrm.Page.getControl("ccrm_taskstatus").removeOption(5);
    }

}

function Form_onsave() {

    //set the descsion to blank if not decision reason entered
    if (Xrm.Page.getAttribute("ccrm_declinereason").getValue() == "Please enter a decision reason") {
        Xrm.Page.getAttribute("ccrm_declinereason").setValue("No comments added");
    }

    if (Xrm.Page.getAttribute('arup_originatedfrom').getValue() != null) {
        //autoCompleteTask();
        validateCompletion();
    }
}

function originatedFrom_onChange() {

    var originatedFrom = Xrm.Page.getAttribute('arup_originatedfrom').getValue();

    if (originatedFrom == null) { return; }

    var organisationValidation = Xrm.Page.getControl('arup_organisationvalidation');
    var creditCheck = Xrm.Page.getControl('arup_creditcheck');

    organisationValidation.setDisabled(organisationValidation.getAttribute().getValue() == null);
    creditCheck.setDisabled(creditCheck.getAttribute().getValue() == 770000002);
    //if (creditCheck.getAttribute().getValue() == 770000000) {
    //    creditCheck.removeOption(770000002);
    //}

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

function ccrm_taskstatus_onchange() {
    //Set Decline Reason compulsory if declined/approved
    //bus reqd = 2, non req = 0
    if (Xrm.Page.getAttribute("ccrm_taskstatus").getValue() == 3 || Xrm.Page.getAttribute("ccrm_taskstatus").getValue() == 2) {
        Xrm.Page.getControl("ccrm_declinereason").setVisible(true);
        Xrm.Page.getControl("description").setVisible(false);
        Xrm.Page.getAttribute("ccrm_declinereason").setValue("Please enter a decision reason");
    }
    else {
        Xrm.Page.getControl("ccrm_declinereason").setVisible(false);
        Xrm.Page.getControl("description").setVisible(true);
        Xrm.Page.getAttribute("ccrm_declinereason").setValue(null);
    }
}

function validateCompletion() {
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

    var originatedFrom = Xrm.Page.getAttribute('arup_originatedfrom').getValue();
    if (!SSCMember) { return; }

    var organisationValidation = Xrm.Page.getAttribute('arup_organisationvalidation').getValue();
    var creditCheck = Xrm.Page.getAttribute('arup_creditcheck').getValue();
    var creditCheckChanged = Xrm.Page.getAttribute('arup_creditcheck').getIsDirty();
    var orgValidationChanged = Xrm.Page.getAttribute('arup_organisationvalidation').getIsDirty();

    //console.log('Originated From: ' + originatedFrom.toString() + '| Validation: ' + (organisationValidation == null ? 'Null' : organisationValidation.toString()) +
    //    ' | Credit Check: ' + creditCheck.toString() + ' | Validation Changed? ' + orgValidationChanged.toString() + ' | Credit Check Changed? ' + creditCheckChanged.toString());

    if (
        (organisationValidation == null      && creditCheck == 770000000 && creditCheckChanged) ||
        (organisationValidation == null      && creditCheck == 770000001) ||
        (organisationValidation == 770000002 && creditCheck == 770000000 && creditCheckChanged && orgValidationChanged) ||
        (organisationValidation == 770000002 && creditCheck == 770000001) ||
        (organisationValidation == 770000002 && creditCheck == 770000002) ||
        (organisationValidation == 770000003 && creditCheck == 770000002) ||
        (organisationValidation == 770000000 && creditCheck == 770000001 && creditCheckChanged && orgValidationChanged) ||
        (organisationValidation == 770000000 && creditCheck == 770000002 && orgValidationChanged) ||
        (organisationValidation == 770000001 && creditCheck == 770000002 && orgValidationChanged)
       ) {
        Alert.show('<font size="6" color="#2E74B5"><b>Task completed</b></font>',
                    '<font size="3" color="#000000"></br>The task has been marked as completed.</font>',
                    [new Alert.Button("<b>OK</b>")], "INFO", 600, 200, '', true);
        Xrm.Page.getAttribute('statecode').setValue(1);
        Xrm.Page.getAttribute('statuscode').setValue(5);
        Xrm.Page.getAttribute('percentcomplete').setValue(100);
        Xrm.Page.getAttribute('actualend').setValue(new Date());

        if (organisationValidation == 770000000)
        {
            Xrm.Page.getAttribute('arup_organisationvalidation').setValue(770000002);
        }
        else if (organisationValidation == 770000001) {
            Xrm.Page.getAttribute('arup_organisationvalidation').setValue(770000003);
        }
        if (creditCheck == 770000000) {
            Xrm.Page.getAttribute('arup_creditcheck').setValue(770000001);
        }
    }
 }

function markAsComplete(displayError) {
    //run from Mark Complete button

    SSCMember = userInSSCTeam();

    var originatedFrom = Xrm.Page.getAttribute('arup_originatedfrom').getValue();

    //check if task was created automatically when organisation either requires verification or change was requested or credit check is required */
    if (!SSCMember) { return; }

    var regionName = Xrm.Page.getAttribute('ccrm_relatedregionid').getValue()[0].name;
    var organisationValidation = Xrm.Page.getAttribute('arup_organisationvalidation').getValue();
    var creditCheck = Xrm.Page.getAttribute('arup_creditcheck').getValue();
    var creditCheckChanged = Xrm.Page.getAttribute('arup_creditcheck').getIsDirty();
    var orgValidationChanged = Xrm.Page.getAttribute('arup_organisationvalidation').getIsDirty();
    var errorMessage = null;

    //console.log('Autocomplete Task | Originated from: ' + originatedFrom.toString() + ' | Validation: ' + (organisationValidation == null ? 'Null' : organisationValidation.toString()) +
    //    ' | Credit Check: ' + creditCheck.toString() + ' | Validation Changed? ' + orgValidationChanged.toString() + ' | Credit Check Changed? ' + creditCheckChanged.toString());

    //validate if all data has been entered before marking task as complete */
    switch (originatedFrom) {

        case 770000000: // 1. Opportunity
        case 770000002: // 3. New Organisation

            if (
                (organisationValidation == 770000002 && creditCheck == 770000000) ||
                (organisationValidation == 770000000 && creditCheck == 770000001) ||
                (organisationValidation == 770000000 && creditCheck == 770000000)
                ) {
                errorMessage = 'Organisation must be verified AND credit check must be done before this task can be completed';
            }
            else {

                if (organisationValidation == 770000000) {
                    Xrm.Page.getAttribute('arup_organisationvalidation').setValue(770000002);
                }
                if (creditCheck == 770000000) {
                    Xrm.Page.getAttribute('arup_creditcheck').setValue(770000001);
                }
            }

            break;

        case 770000001: // 2. Organisation Change Request

            Xrm.Page.getAttribute('arup_organisationvalidation').setValue(770000003);
            Alert.show('<font size="6" color="#2E74B5"><b>Task completed</b></font>',
            '<font size="3" color="#000000"></br>The task to update Organisation with requested changes has been marked as completed.</font>',
            [
                new Alert.Button("<b>OK</b>")
            ], "INFO", 600, 200, '', true);
            break;
    }

    // close task as complete if no errors found
    if (errorMessage == null) {

        Xrm.Page.getAttribute('statecode').setValue(1);
        Xrm.Page.getAttribute('statuscode').setValue(5);
        Xrm.Page.getAttribute('percentcomplete').setValue(100);
        Xrm.Page.getAttribute('actualend').setValue(new Date());

        Xrm.Page.data.save().then(function () { // The save prevents "unsaved"-warning.
            Xrm.Page.ui.close();
            //Xrm.Page.data.refresh();
        }, null);

    }
    else if(displayError == true) {

        Alert.show('<font size="6" color="#d80303"><b>Error</b></font>',
               '<font size="3" color="#000000">' + errorMessage + '</font>',
               [
                   new Alert.Button("<b>OK</b>")
               ],
               "ERROR", 500, 200, '', true);
    }

}

function markAsCanceled() {

    SSCMember = userInSSCTeam();

    if (!SSCMember) { return; }

    Xrm.Page.getAttribute('statecode').setValue(2);
    Xrm.Page.getAttribute('statuscode').setValue(6);
    Xrm.Page.getAttribute('actualend').setValue(new Date());

    Xrm.Page.data.save().then(function () { // The save prevents "unsaved"-warning.
        Xrm.Page.data.refresh();
    }, null);

}

function userInSSCTeam() {

    var originatedFrom = Xrm.Page.getAttribute('arup_originatedfrom').getValue();
    if (originatedFrom == null) { return true; }

    var req = new XMLHttpRequest();
    var userid = Xrm.Page.context.getUserId().replace('{', '').replace('}', '');
    var userExists = false;
    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/teammemberships?$filter=systemuserid eq " + userid + " and (teamid eq 01886278-29CF-E911-8128-00505690CB20 or teamid eq F469F99A-29CF-E911-8128-00505690CB20 or teamid eq 0F61DA8A-29CF-E911-8128-00505690CB20 or teamid eq 8D568D76-48E5-E911-812B-00505690CB20 or teamid eq A7E35C81-29CF-E911-8128-00505690CB20 or teamid eq 12129B56-29CF-E911-8128-00505690CB20 or teamid eq 2247756B-29CF-E911-8128-00505690CB20)", false);
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
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
    return userExists;
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
        '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the Task.</br>Click "Exit Only" button to exit the Task without saving.</font>',
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