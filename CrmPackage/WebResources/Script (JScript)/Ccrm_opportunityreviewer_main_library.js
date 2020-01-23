function Form_onload()
{
	//function to hide attributes / sections
	hideAttributesSection = function() 
	{
		//hide the hidden section with the hidden fields - ownerid field must be the first on the section
		document.getElementById("ownerid_d").parentNode.parentNode.style.display = "none";
	}


	
	ccrm_userrole_onload = function() 
	{
		//userrole is not general
		if ( Xrm.Page.getAttribute("ccrm_userrole").getValue() != '1' ) 
		{
			//disable field
			Xrm.Page.ui.controls.get("ccrm_name").setDisabled(true); 
			if ( Xrm.Page.ui.getFormType() == 1 ) {
				Xrm.Page.ui.controls.get("ccrm_reviewer_userid").setDisabled(true); 
			}
			else {
				Xrm.Page.ui.contols.get("ccrm_reviewer_userid").setDisabled(false); 
			}
			//not required
			Xrm.Page.getAttribute("ccrm_reviewer_userid").setRequiredLevel("none"); 
			Xrm.Page.getAttribute("ccrm_name").setRequiredLevel("none"); 
			//default the userrole value to name (nominated role)
			Xrm.Page.getAttribute("ccrm_name").setValue(Xrm.Page.getAttribute("ccrm_userrole").getValue());		
		}	
		else 
		{
			Xrm.Page.ui.controls.get("ccrm_name").setDisabled(false);
			Xrm.Page.ui.controls.get("ccrm_reviewer_userid").setDisabled(false); 
					
			//required 2 = recommended			
			Xrm.Page.getAttribute("ccrm_reviewer_userid").setRequiredLevel("recommended"); 
			Xrm.Page.getAttribute("ccrm_name").setRequiredLevel("recommended"); 
		}
	}

	
	fnReviewerApprover = function()
	{
		//oncreate
		if ( Xrm.Page.ui.getFormType() == 1 )
		{
			Xrm.Page.ui.controls.get("ccrm_reviewer_userid").setDisabled(true); 
		}
		else
		{
			Xrm.Page.ui.controls.get("ccrm_reviewer_userid").setDisabled(false); 		
		}
	}


	//function to hide activities and history activity
	//removeBtnsOnload();
	hideNavItems();
	//function to hide attributes / sections
	hideAttributesSection();
	//function to make reviewer/approval readonly
	ccrm_userrole_onload();
	//onsave force submit
	forceSubmit();

	//adds the url of the opportunity into urbuilder field to be used in workflow emails
	if ( Xrm.Page.getAttribute("ccrm_urlbuilder").getValue() == null && Xrm.Page.getAttribute("ccrm_opportunityid").getValue() != null )
	{
		var URLBuilder = FetchXmlUrl + "/" + Xrm.Page.context.getOrgUniqueName() + "/sfa/opps/edit.aspx?id=" + Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
		Xrm.Page.getAttribute("ccrm_urlbuilder").setValue(URLBuilder);		
	}
	//to prevent users from changing the reviewer
	if (Xrm.Page.getAttribute("ccrm_reviewer_userid").getValue() != null)
	{
		Xrm.Page.ui.controls.get("ccrm_reviewer_userid").setDisabled(true);	
	}
}

function hideNavItems() {
	Xrm.Page.ui.navigation.items.forEach(function (item, index) {
		var itemLabel = item.getLabel(); 
		
		if (itemLabel == "Activities" || itemLabel == "History") {
			item.setVisible(false); 
		}
	}); 

}

function forceSubmit()
{
	//force submit on readonly fields
	Xrm.Page.getAttribute("ccrm_opportunityid").setSubmitMode("always"); 
	Xrm.Page.getAttribute("ccrm_reviewer_userid").setSubmitMode("always"); 
	Xrm.Page.getAttribute("ccrm_name").setSubmitMode("always"); 
	Xrm.Page.getAttribute("ccrm_approveddate").setSubmitMode("always"); 
}

function ccrm_approved_onClick() {
   	//review completed checked - set the current date
	if ( Xrm.Page.getAttribute("ccrm_approved").getValue() == true ) 
		Xrm.Page.getAttribute("ccrm_approveddate").setValue(new Date());		
	else
		Xrm.Page.getAttribute("ccrm_approveddate").setValue(null);	
}

function ccrm_userrole_onchange() 
{
	//userrole is not general
	if (Xrm.Page.getAttribute("ccrm_userrole").getValue() != '1' ) 
	{
		//disable field
		Xrm.Page.ui.controls.get("ccrm_name").setDisabled(true);	
		if (Xrm.Page.ui.getFormType() == 1 ) {
			Xrm.Page.ui.controls.get("ccrm_reviewer_userid").setDisabled(true); 
		}
		else {
			Xrm.Page.ui.controls.get("ccrm_reviewer_userid").setDisabled(false); 
		}
		//not required
		Xrm.Page.getAttribute("ccrm_reviewer_userid").setRequiredLevel("none");
		Xrm.Page.getAttribute("ccrm_name").setRequiredLevel("none")
		//default the userrole value to name (nominated role)
		Xrm.Page.getAttribute("ccrm_name").setValue(Xrm.Page.getAttribute("ccrm_userrole"));
		
	}	
	else 
	{
		//undisable field
		Xrm.Page.ui.controls.get("ccrm_name").setDisabled(false); 
		Xrm.Page.ui.controls.get("ccrm_reviewer_userid").setDisabled(false); 
		//required
		Xrm.Page.getAttribute("ccrm_reviewer_userid").setRequiredLevel("recommended"); 
		Xrm.Page.getAttribute("ccrm_name").setRequiredLevel("recommended"); 
		//null value on name (nominated role)
		Xrm.Page.getAttribute("ccrm_name").setValue(null); 
	}
	Xrm.Page.getAttribute("ccrm_reviewer_userid").setValue(null); 
}
