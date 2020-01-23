function Form_onload()
{
	//set the online checkbox hidden until record is saved and offline is ticked
	if( Xrm.Page.ui.getFormType() == 1)
	{
		//set owner as name
		var dt = new Date();
		var strName = Xrm.Page.getAttribute("ownerid").getValue()[0].name + " - " + dt.toLocaleString();

		//default values
		Xrm.Page.getAttribute("ccrm_name").setValue(strName);
		Xrm.Page.getAttribute("ccrm_offlinefrom").setValue(dt)

		var outputMessage = "CRM is currently offline for planned maintenance and/or data migration. The system should be treated as read-only.\nAny amendments made will cause Workflows not to work correctly.";
		Xrm.Page.getAttribute("ccrm_outputmessage").setValue(outputMessage);

		//hide the online sections
		Xrm.Page.ui.tabs.get("tab_General").sections.get("section_BringCRMOnline").setVisible(false);
		//hide the entity section
		Xrm.Page.ui.tabs.get("tab_General").sections.get("section_Entities").setVisible(false);
	}
	else
	{
		//show online section
		Xrm.Page.ui.tabs.get("tab_General").sections.get("section_BringCRMOnline").setVisible(true);
		//set the offline fields as disabled
		Xrm.Page.getControl("ccrm_offlinefrom").setDisabled(true);
		Xrm.Page.getControl("ccrm_offlineto").setDisabled(true);
		Xrm.Page.getControl("ccrm_outputmessage").setDisabled(true);
	}
	//once the online is checked - set field to disabled
	 if (Xrm.Page.getAttribute("ccrm_online").getValue() == true)
	 {
		Xrm.Page.getControl("ccrm_online").setDisabled(true);
	 }

	//force submit - as name is readonly
	Xrm.Page.getAttribute("ccrm_name").setSubmitMode("always");
	Xrm.Page.getAttribute("ccrm_offline").setSubmitMode("always");
	Xrm.Page.getAttribute("ccrm_opportunityentity").setSubmitMode("always");
	Xrm.Page.getAttribute("ccrm_organisationentity").setSubmitMode("always");
	Xrm.Page.getAttribute("ccrm_contactentity").setSubmitMode("always");
	Xrm.Page.getAttribute("ccrm_taskentity").setSubmitMode("always");
	Xrm.Page.getAttribute("ccrm_campaignentity").setSubmitMode("always");
}
function Form_onsave(executionObj)
{
	// crm offline settings record does not exists
	if ( chkActiveCRMSettings() >= 1 && Xrm.Page.ui.getFormType() == 1)
	{
		alert('There is an active CRM Offline record. Please review before continuing.');
		executionObj.getEventArgs().preventDefault();
		return false;
	}
}

function chkActiveCRMSettings()
{
	//return number of active offlinesettings 
	var dataset = "Ccrm_crmofflinesettingSet"
	var filter = "statecode/Value eq  0"
	var count = 0; 
	var retrieveMultiple = ConsultCrm.Sync.RetrieveMultipleRequest(dataset,filter);
	
	if (retrieveMultiple != null)
		count = retrieveMultiple.results.length; 
	return count; //records exists
	
}

