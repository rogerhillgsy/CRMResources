function Form_onload(executionContext) {
    var formContext = executionContext.getFormContext();
    //start functions
    if (formContext.getAttribute("ccrm_requeststatus").getValue() == 1 && formContext.ui.getFormType() != 1) {
        formContext.ui.setFormNotification("Please click on the Submit Exclusivity Request button to proceed with the submission of this request", "INFO", "DraftExclReq");
    }
    else {
        formContext.ui.clearFormNotification('DraftExclReq');
    }

    ccrm_exclusivityreason_onchange = function (executionContext) {
        var formContext = executionContext.getFormContext();
        //other = 4, non req = 0
        if (formContext.getAttribute("ccrm_exclusivityreason").getValue() == 4)
            formContext.getAttribute("ccrm_reasonforexclusivityrequest").setRequiredLevel("required");
        else
            formContext.getAttribute("ccrm_reasonforexclusivityrequest").setRequiredLevel("none");

    }
    //create exclusivity via button
    fnBtnExclusivityRequest = function (formContext) {
        //set mandatory information
        ccrm_exclusivityreason_onchange();
        formContext.getAttribute("ccrm_exclusivityreason").setRequiredLevel("required");
        //set state to requested
        formContext.getAttribute("ccrm_draft").setValue(false);
        formContext.getAttribute("ccrm_requeststatus").setValue(2);
        formContext.getAttribute("ccrm_requeststatus").setSubmitMode("always");
        if (formContext.getAttribute("ccrm_exclusivityreason").getValue() != null) {
            alert('Your request for Exclusivity has been submitted');
        }
        formContext.ui.clearFormNotification('DraftExclReq');
        //force save
        formContext.data.entity.save();
    }
    //end functions

    //on creation
    if (formContext.ui.getFormType() == 1) {
        formContext.getControl("ccrm_withdrawrequest").setDisabled(true);
    }
    ccrm_exclusivityreason_onchange(executionContext);
    //Disable if no longer in draft status
    if (formContext.getAttribute("ccrm_requeststatus").getValue() != 1) {
        formContext.getControl("ccrm_draft").setDisabled(true);
        formContext.getControl("ccrm_exclusivityreason").setDisabled(true);
        formContext.getControl("ccrm_reasonforexclusivityrequest").setDisabled(true);

    }
    //disable if approved, declined, withdrawn
    if (formContext.getAttribute("ccrm_requeststatus").getValue() == 3 || formContext.getAttribute("ccrm_requeststatus").getValue() == 4 || formContext.getAttribute("ccrm_requeststatus").getValue() == 5) {
        formContext.getControl("ccrm_withdrawrequest").setDisabled(true);
    }
}

function ccrm_requeststatus_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("ccrm_requeststatus").getValue() == 1 && formContext.ui.getFormType() != 1) {
        formContext.ui.setFormNotification("Please click on the Submit Exclusivity Request button to proceed with the submission of this request", "INFO", "DraftExclReq");
    }
    else {
        formContext.ui.clearFormNotification('DraftExclReq');
    }
}