function Form_onload() {
    
    if (checkStatusCode() == false) {     
        Xrm.Page.ui.setFormNotification("This Review and Approval record has been completed please review the details on this page", "INFO", "actioned");
    }

    //ON CREATION
    if (Xrm.Page.ui.getFormType() == 1) {
        //hide status/decision reason section on creation
        Xrm.Page.ui.tabs.get("tab_General").sections.get("section_Status").setVisible(false);
       //set name to General
        Xrm.Page.getAttribute("ccrm_name").setValue("General")     
        Xrm.Page.getControl("ccrm_type").removeOption(2);
    }

    //NOT ON CREATION
    if (Xrm.Page.ui.getFormType() != 1) {

        //reviewer/approver
        Xrm.Page.getControl("ccrm_reviewerapprover_userid").setDisabled(true);
        //Role
        Xrm.Page.getControl("ccrm_userrole").setDisabled(true);
        //type
        Xrm.Page.getControl("ccrm_type").setDisabled(true);

        //check actioned by
        if (Xrm.Page.getAttribute("ccrm_actionedby_userid").getValue() == null) {
            //hide
            Xrm.Page.getControl("ccrm_actionedby_userid").setVisible(false);
            Xrm.Page.getControl("ccrm_approvaldate").setVisible(false);

        }

        //call function
        decisionReasonVisibility();

        //remove optionset values
        removeStatusOptionSetValues();

        //set fields to disabled once not sent/approved/declined/longer required/close without action
        disableFieldsNotForEdit();
    }
}


//NC 27/10/2014 Release Arup_3_14_10_04

function checkStatusCode() {
    var currentStage = Xrm.Page.getAttribute("statuscode").getValue();    

    if (currentStage == 3 || currentStage == 4 || currentStage == 1) {
        return true;
    } else {
        return false;
}

}


function buttonApprove() {
    //NC CRM-1693
    //var approver = Xrm.Page.getAttribute("ccrm_reviewerapprover_userid").getValue()[0].id;
    //var currentUser = Xrm.Page.context.getUserId();

    if (checkStatusCode() == true) {
    //if (approver == currentUser) {
        Xrm.Page.getAttribute("ccrm_bidreviewstatus").setValue(2);
        Xrm.Page.data.entity.save('saveandclose');

    //} else { alert('Only the Review/Approver can update this record'); }

    } else { alert("This review and approval record has been completed please review the details on this page"); }
 
}

function buttonDecline() {   
    //Xrm.Page.data.entity.save('saveandclose');
    var approver = Xrm.Page.getAttribute("ccrm_reviewerapprover_userid").getValue()[0].id;
    var currentUser = Xrm.Page.context.getUserId();
    
    if (checkStatusCode() == true) {
        if (approver == currentUser) {
        var reason = prompt("Please provide a decline reason:", "");
        if (reason != null && reason != "") {
            Xrm.Page.getAttribute("ccrm_bidreviewstatus").setValue(3);
            Xrm.Page.getAttribute("ccrm_comment").setValue(reason);
            Xrm.Page.data.entity.save('saveandclose');
        } else {
            alert("You need to provide a reason for declining");
        }

    } else { alert('Only the Review/Approver can update this record'); }

    } else { alert("This review and approval record has been completed please review the details on this page"); }
}


function disableFieldsNotForEdit(){
	//set fields to disabled once not sent/approved/declined/longer required/close without action
	var status = Xrm.Page.getAttribute("statuscode").getValue();
	if (status == 1 || status == 5 || status == 6 || status == 7 || status == 8) {
		//reviewer/approver
		Xrm.Page.getControl("ccrm_reviewerapprover_userid").setDisabled(true);
		
		//Role
		Xrm.Page.getControl("ccrm_userrole").setDisabled(true);
		

		//type
		Xrm.Page.getControl("ccrm_type").setDisabled(true);
			
		//status
		Xrm.Page.getControl("statuscode").setDisabled(true);
		Xrm.Page.getAttribute("statuscode").setSubmitMode("always");
		
		//br status 
		Xrm.Page.getControl("ccrm_bidreviewstatus").setDisabled(true); 
		Xrm.Page.getAttribute("ccrm_bidreviewstatus").setSubmitMode("always");
		//decision reason
		Xrm.Page.getControl("ccrm_comment").setDisabled(true);
	}
}
   
function decisionReasonVisibility(){
	var status = Xrm.Page.getAttribute("statuscode").getValue();
	//make mandatory when declined
	if (status == 5) {
		//make decision reason required when delcined
	    Xrm.Page.getAttribute("ccrm_comment").setRequiredLevel("required");
	    Xrm.Page.getAttribute("ccrm_bidreviewstatus").setValue(3);
	}
	else if (status == 6) {
	    //make decision reason required when not delcined
	    Xrm.Page.getAttribute("ccrm_comment").setRequiredLevel("none");
	    Xrm.Page.getAttribute("ccrm_bidreviewstatus").setValue(2);
	}
	else {
	    //make decision reason required when not delcined
	    Xrm.Page.getAttribute("ccrm_comment").setRequiredLevel("none");
	}
}

function removeStatusOptionSetValues() {
	var status = Xrm.Page.getAttribute("statuscode").getValue();
	//alert(status);
	var statusSourceControl = Xrm.Page.getControl("statuscode");
	if (status != 1)
		statusSourceControl.removeOption(1); //notsent
	if (status != 3)
		statusSourceControl.removeOption(3); //Waiting Response
	if (status != 4)
		statusSourceControl.removeOption(4); //Pending
	if (status != 8)
		statusSourceControl.removeOption(8); //No Longer Required
}

function copyTextToNominatedRole() {
	//alert('1= '+ Xrm.Page.getAttribute("ccrm_userrole").getValue());
	if (Xrm.Page.getAttribute("ccrm_userrole").getValue() != null) {
		//alert('2=');
		//get selecetd text value
		var txtListTypeItem = Xrm.Page.data.entity.attributes.get("ccrm_userrole").getText();
		//set the role as teh selected text
		Xrm.Page.getAttribute("ccrm_name").setValue(txtListTypeItem)
	}
}

function statuscode_onchange() {
    //call function onchange of status
    decisionReasonVisibility();
    //removeStatusOptionSetValues();
	
	
}

function type_onchange() {
    copyTextToNominatedRole();
}

function Form_onsave(executionObj) {

	
    //to stop users from creating from adv find
    if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) {
        alert("Review and Approval record can only be created from within an Opportunity.");
        executionObj.getEventArgs().preventDefault();
        return false;
    }
  
}