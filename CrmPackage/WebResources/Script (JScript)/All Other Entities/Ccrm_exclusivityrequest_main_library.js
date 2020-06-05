function Form_onload() {
    //start functions
    if (Xrm.Page.getAttribute("ccrm_requeststatus").getValue() == 1 && Xrm.Page.ui.getFormType() != 1) {
        Xrm.Page.ui.setFormNotification("Please click on the Submit Exclusivity Request button to proceed with the submission of this request", "INFO", "DraftExclReq");
    }
    else {
        Xrm.Page.ui.clearFormNotification('DraftExclReq');
    }

    ccrm_exclusivityreason_onchange = function () {
        //other = 4, non req = 0
        if (Xrm.Page.getAttribute("ccrm_exclusivityreason").getValue() == 4)
            Xrm.Page.getAttribute("ccrm_reasonforexclusivityrequest").setRequiredLevel("required");
        else
            Xrm.Page.getAttribute("ccrm_reasonforexclusivityrequest").setRequiredLevel("none");

    }
    //create exclusivity via button
    fnBtnExclusivityRequest = function () {
        //set mandatory information
        ccrm_exclusivityreason_onchange();
        Xrm.Page.getAttribute("ccrm_exclusivityreason").setRequiredLevel("required");
        //set state to requested
        Xrm.Page.getAttribute("ccrm_draft").setValue(false);
        Xrm.Page.getAttribute("ccrm_requeststatus").setValue(2);
        Xrm.Page.getAttribute("ccrm_requeststatus").setSubmitMode("always");
        if (Xrm.Page.getAttribute("ccrm_exclusivityreason").getValue() != null) {
            alert('Your request for Exclusivity has been submitted');
        }
        Xrm.Page.ui.clearFormNotification('DraftExclReq');
        //force save
        Xrm.Page.data.entity.save();
    }
    //end functions

    //on creation
    if (Xrm.Page.ui.getFormType() == 1) {
        Xrm.Page.getControl("ccrm_withdrawrequest").setDisabled(true);
    }
    ccrm_exclusivityreason_onchange();
    //Disable if no longer in draft status
    if (Xrm.Page.getAttribute("ccrm_requeststatus").getValue() != 1) {
        Xrm.Page.getControl("ccrm_draft").setDisabled(true);
        Xrm.Page.getControl("ccrm_exclusivityreason").setDisabled(true);
        Xrm.Page.getControl("ccrm_reasonforexclusivityrequest").setDisabled(true);

    }
    //disable if approved, declined, withdrawn
    if (Xrm.Page.getAttribute("ccrm_requeststatus").getValue() == 3 || Xrm.Page.getAttribute("ccrm_requeststatus").getValue() == 4 || Xrm.Page.getAttribute("ccrm_requeststatus").getValue() == 5) {
        Xrm.Page.getControl("ccrm_withdrawrequest").setDisabled(true);
    }
}

function ccrm_requeststatus_onchange() {
    if (Xrm.Page.getAttribute("ccrm_requeststatus").getValue() == 1 && Xrm.Page.ui.getFormType() != 1) {
        Xrm.Page.ui.setFormNotification("Please click on the Submit Exclusivity Request button to proceed with the submission of this request", "INFO", "DraftExclReq");
    }
    else {
        Xrm.Page.ui.clearFormNotification('DraftExclReq');
    }
}