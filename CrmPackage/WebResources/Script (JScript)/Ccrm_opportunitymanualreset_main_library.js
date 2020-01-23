function Form_onload() {

	disableFieldsOnForm = function()
	{
		Xrm.Page.getControl("ccrm_action").setDisabled(true);
		Xrm.Page.getControl("ccrm_gateway").setDisabled(true);
		Xrm.Page.getControl("ccrm_setreference").setDisabled(true);
		Xrm.Page.getControl("ccrm_referencenumber").setDisabled(true);
	}
	setActionFields = function()
	{
		//set gateway section to hidden
		Xrm.Page.ui.tabs.get(0).sections.get(2).setVisible(false);
		//set reference section to hidden
		Xrm.Page.ui.tabs.get(0).sections.get(3).setVisible(false);
		//on creation
		if (Xrm.Page.ui.getFormType() == 1) 
		{
			//set the values to NULL
			Xrm.Page.getAttribute("ccrm_gateway").setValue(null);
			Xrm.Page.getAttribute("ccrm_setreference").setValue(null);
			Xrm.Page.getAttribute("ccrm_referencenumber").setValue(null);
		}
		else
		{
			//disable fields on form
			disableFieldsOnForm();
		}
		/*
			100,000,000 = Set Gateway
			100,000,001 = Reset Decline Gateway
			100,000,002 = Set Reference Number
			100,000,003 = Clear Reference Number
		*/
		if (Xrm.Page.getAttribute("ccrm_action").getValue() == '100000000' || Xrm.Page.getAttribute("ccrm_action").getValue() == '100000001')
		{
			//show gateway section
			Xrm.Page.ui.tabs.get(0).sections.get(2).setVisible(true);
			//set the gateway required
			Xrm.Page.getAttribute("ccrm_gateway").setRequiredLevel("required");
			//
		}
		else
		{
			//hide gateway section
			Xrm.Page.ui.tabs.get(0).sections.get(2).setVisible(false);
			//set the gateway not required
			Xrm.Page.getAttribute("ccrm_gateway").setRequiredLevel("none");	
		}
		if (Xrm.Page.getAttribute("ccrm_action").getValue() == '100000002')
		{
			//show reference section
			Xrm.Page.ui.tabs.get(0).sections.get(3).setVisible(true);
			Xrm.Page.getControl("ccrm_referencenumber").setVisible(true);
			//set reference required
			Xrm.Page.getAttribute("ccrm_setreference").setRequiredLevel("required");
			Xrm.Page.getAttribute("ccrm_referencenumber").setRequiredLevel("required");
		}
		else if (Xrm.Page.getAttribute("ccrm_action").getValue() == '100000003')
		{
			//show reference section
			Xrm.Page.ui.tabs.get(0).sections.get(3).setVisible(true);
			//set reference required
			Xrm.Page.getAttribute("ccrm_setreference").setRequiredLevel("required");
			Xrm.Page.getAttribute("ccrm_referencenumber").setRequiredLevel("none");
			Xrm.Page.getControl("ccrm_referencenumber").setVisible(false);
		}
		else
		{
			//hide reference section
			Xrm.Page.ui.tabs.get(0).sections.get(3).setVisible(false);
			//set reference not required
			Xrm.Page.getAttribute("ccrm_setreference").setRequiredLevel("none");
			Xrm.Page.getAttribute("ccrm_referencenumber").setRequiredLevel("none");
		
		}
	}

			
	//set owner as name
	var dt = new Date();
	var strName = Xrm.Page.getAttribute("ownerid").getValue()[0].name + " - " + dt.toLocaleString();
	Xrm.Page.getAttribute("ccrm_name").setValue(strName);

	//hide name if null
	if ( Xrm.Page.getAttribute("ccrm_name").getValue() == null)
		Xrm.Page.getControl("ccrm_name").setVisible(true);
	else
		Xrm.Page.getControl("ccrm_name").setVisible(false);

	//show/hide sections
	setActionFields();

	//force submit - as name is readonly
	Xrm.Page.getAttribute("ccrm_name").setSubmitMode("always");
	Xrm.Page.getAttribute("ccrm_opportunityid").setSubmitMode("always");
}
function Form_onsave(executionObj) 
{
    if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) {
        alert("A Manual Reset can only be requested from within an Opportunity.");
		executionObj.getEventArgs().preventDefault();
        return false;
    }
}