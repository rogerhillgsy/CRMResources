function Form_onload(executionContext) {
    var formContext = executionContext.getFormContext();
    if (checkStatusCode(formContext) == false) {
        formContext.ui.setFormNotification("This Review and Approval record has been completed please review the details on this page", "INFO", "actioned");
    }

    //ON CREATION
    if (formContext.ui.getFormType() == 1) {
        //hide status/decision reason section on creation
        formContext.ui.tabs.get("tab_General").sections.get("section_Status").setVisible(false);
        //set name to General
        formContext.getAttribute("ccrm_name").setValue("General")
        formContext.getControl("ccrm_type").removeOption(2);
    }

    //NOT ON CREATION
    if (formContext.ui.getFormType() != 1) {

        //reviewer/approver
        formContext.getControl("ccrm_reviewerapprover_userid").setDisabled(true);
        //Role
        formContext.getControl("ccrm_userrole").setDisabled(true);
        //type
        formContext.getControl("ccrm_type").setDisabled(true);

        //check actioned by
        if (formContext.getAttribute("ccrm_actionedby_userid").getValue() == null) {
            //hide
            formContext.getControl("ccrm_actionedby_userid").setVisible(false);
            formContext.getControl("ccrm_approvaldate").setVisible(false);

        }

        //call function
        decisionReasonVisibility(formContext);

        //remove optionset values
        removeStatusOptionSetValues(formContext);

        //set fields to disabled once not sent/approved/declined/longer required/close without action
        disableFieldsNotForEdit(formContext);
    }
}


//NC 27/10/2014 Release Arup_3_14_10_04

function checkStatusCode(formContext) {
    var currentStage = formContext.getAttribute("statuscode").getValue();

    if (currentStage == 3 || currentStage == 4 || currentStage == 1) {
        return true;
    } else {
        return false;
    }

}


function buttonApprove(primaryControl) {
    var formContext = primaryControl;
    //NC CRM-1693
    //var approver = formContext.getAttribute("ccrm_reviewerapprover_userid").getValue()[0].id;
    //var currentUser = formContext.context.getUserId();

    if (checkStatusCode(formContext) == true) {
        //if (approver == currentUser) {
        formContext.getAttribute("ccrm_bidreviewstatus").setValue(2);
        formContext.data.entity.save('saveandclose');

        //} else { alert('Only the Review/Approver can update this record'); }

    } else { alert("This review and approval record has been completed please review the details on this page"); }

}

function buttonDecline(primaryControl) {
    var formContext = primaryControl;
    //formContext.data.entity.save('saveandclose');
    var approver = formContext.getAttribute("ccrm_reviewerapprover_userid").getValue()[0].id;
    var currentUser = formContext.context.getUserId();

    if (checkStatusCode(formContext) == true) {
        if (approver == currentUser) {
            var reason = prompt("Please provide a decline reason:", "");
            if (reason != null && reason != "") {
                formContext.getAttribute("ccrm_bidreviewstatus").setValue(3);
                formContext.getAttribute("ccrm_comment").setValue(reason);
                formContext.data.entity.save('saveandclose');
            } else {
                alert("You need to provide a reason for declining");
            }

        } else { alert('Only the Review/Approver can update this record'); }

    } else { alert("This review and approval record has been completed please review the details on this page"); }
}


function disableFieldsNotForEdit(formContext) {
    //set fields to disabled once not sent/approved/declined/longer required/close without action
    var status = formContext.getAttribute("statuscode").getValue();
    if (status == 1 || status == 5 || status == 6 || status == 7 || status == 8) {
        //reviewer/approver
        formContext.getControl("ccrm_reviewerapprover_userid").setDisabled(true);

        //Role
        formContext.getControl("ccrm_userrole").setDisabled(true);


        //type
        formContext.getControl("ccrm_type").setDisabled(true);

        //status
        formContext.getControl("statuscode").setDisabled(true);
        formContext.getAttribute("statuscode").setSubmitMode("always");

        //br status 
        formContext.getControl("ccrm_bidreviewstatus").setDisabled(true);
        formContext.getAttribute("ccrm_bidreviewstatus").setSubmitMode("always");
        //decision reason
        formContext.getControl("ccrm_comment").setDisabled(true);
    }
}

function decisionReasonVisibility(formContext) {
    var status = formContext.getAttribute("statuscode").getValue();
    //make mandatory when declined
    if (status == 5) {
        //make decision reason required when delcined
        formContext.getAttribute("ccrm_comment").setRequiredLevel("required");
        formContext.getAttribute("ccrm_bidreviewstatus").setValue(3);
    }
    else if (status == 6) {
        //make decision reason required when not delcined
        formContext.getAttribute("ccrm_comment").setRequiredLevel("none");
        formContext.getAttribute("ccrm_bidreviewstatus").setValue(2);
    }
    else {
        //make decision reason required when not delcined
        formContext.getAttribute("ccrm_comment").setRequiredLevel("none");
    }
}

function removeStatusOptionSetValues(formContext) {
    var status = formContext.getAttribute("statuscode").getValue();
    //alert(status);
    var statusSourceControl = formContext.getControl("statuscode");
    if (status != 1)
        statusSourceControl.removeOption(1); //notsent
    if (status != 3)
        statusSourceControl.removeOption(3); //Waiting Response
    if (status != 4)
        statusSourceControl.removeOption(4); //Pending
    if (status != 8)
        statusSourceControl.removeOption(8); //No Longer Required
}

function copyTextToNominatedRole(formContext) {
    //alert('1= '+ formContext.getAttribute("ccrm_userrole").getValue());
    if (formContext.getAttribute("ccrm_userrole").getValue() != null) {
        //alert('2=');
        //get selecetd text value
        var txtListTypeItem = formContext.data.entity.attributes.get("ccrm_userrole").getText();
        //set the role as teh selected text
        formContext.getAttribute("ccrm_name").setValue(txtListTypeItem)
    }
}

function statuscode_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    //call function onchange of status
    decisionReasonVisibility(formContext);
    //removeStatusOptionSetValues();


}

function type_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    copyTextToNominatedRole(formContext);
}

function Form_onsave(executionObj) {
    var formContext = executionObj.getFormContext();

    //to stop users from creating from adv find
    if (formContext.getAttribute("ccrm_opportunityid").getValue() == null) {
        alert("Review and Approval record can only be created from within an Opportunity.");
        executionObj.getEventArgs().preventDefault();
        return false;
    }

}