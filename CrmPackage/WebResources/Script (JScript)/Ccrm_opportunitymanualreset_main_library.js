function Form_onload(executionContext) {

    //set owner as name
    var formContext = executionContext.getFormContext();
    var dt = new Date();
    var strName = formContext.getAttribute("ownerid").getValue()[0].name + " - " + dt.toLocaleString();
    formContext.getAttribute("ccrm_name").setValue(strName);

    //hide name if null
    if (formContext.getAttribute("ccrm_name").getValue() == null)
        formContext.getControl("ccrm_name").setVisible(true);
    else
        formContext.getControl("ccrm_name").setVisible(false);

    //show/hide sections
    setActionFields(executionContext);

    //force submit - as name is readonly
    formContext.getAttribute("ccrm_name").setSubmitMode("always");
    formContext.getAttribute("ccrm_opportunityid").setSubmitMode("always");
}

function setActionFields(executionContext) {
    var formContext = executionContext.getFormContext();
    //set gateway section to hidden
    formContext.ui.tabs.get(0).sections.get(2).setVisible(false);
    //set reference section to hidden
    formContext.ui.tabs.get(0).sections.get(3).setVisible(false);
    //on creation
    if (formContext.ui.getFormType() == 1) {
        //set the values to NULL
        formContext.getAttribute("ccrm_gateway").setValue(null);
        formContext.getAttribute("ccrm_setreference").setValue(null);
        formContext.getAttribute("ccrm_referencenumber").setValue(null);
    }
    else {
        //disable fields on form
        disableFieldsOnForm(formContext);
    }
    /*
        100,000,000 = Set Gateway
        100,000,001 = Reset Decline Gateway
        100,000,002 = Set Reference Number
        100,000,003 = Clear Reference Number
    */
    if (formContext.getAttribute("ccrm_action").getValue() == '100000000' || formContext.getAttribute("ccrm_action").getValue() == '100000001') {
        //show gateway section
        formContext.ui.tabs.get(0).sections.get(2).setVisible(true);
        //set the gateway required
        formContext.getAttribute("ccrm_gateway").setRequiredLevel("required");
        //
    }
    else {
        //hide gateway section
        formContext.ui.tabs.get(0).sections.get(2).setVisible(false);
        //set the gateway not required
        formContext.getAttribute("ccrm_gateway").setRequiredLevel("none");
    }
    if (formContext.getAttribute("ccrm_action").getValue() == '100000002') {
        //show reference section
        formContext.ui.tabs.get(0).sections.get(3).setVisible(true);
        formContext.getControl("ccrm_referencenumber").setVisible(true);
        //set reference required
        formContext.getAttribute("ccrm_setreference").setRequiredLevel("required");
        formContext.getAttribute("ccrm_referencenumber").setRequiredLevel("required");
    }
    else if (formContext.getAttribute("ccrm_action").getValue() == '100000003') {
        //show reference section
        formContext.ui.tabs.get(0).sections.get(3).setVisible(true);
        //set reference required
        formContext.getAttribute("ccrm_setreference").setRequiredLevel("required");
        formContext.getAttribute("ccrm_referencenumber").setRequiredLevel("none");
        formContext.getControl("ccrm_referencenumber").setVisible(false);
    }
    else {
        //hide reference section
        formContext.ui.tabs.get(0).sections.get(3).setVisible(false);
        //set reference not required
        formContext.getAttribute("ccrm_setreference").setRequiredLevel("none");
        formContext.getAttribute("ccrm_referencenumber").setRequiredLevel("none");

    }
}

function disableFieldsOnForm(formContext) {
    formContext.getControl("ccrm_action").setDisabled(true);
    formContext.getControl("ccrm_gateway").setDisabled(true);
    formContext.getControl("ccrm_setreference").setDisabled(true);
    formContext.getControl("ccrm_referencenumber").setDisabled(true);
}

function Form_onsave(executionObj) {
    var formContext = executionObj.getFormContext();

    if (formContext.getAttribute("ccrm_opportunityid").getValue() == null) {
        alert("A Manual Reset can only be requested from within an Opportunity.");
        executionObj.getEventArgs().preventDefault();
        return false;
    }
}