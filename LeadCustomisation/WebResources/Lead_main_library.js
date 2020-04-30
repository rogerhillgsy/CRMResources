/////////
// Begin: OnLoad
////////
function Form_onload() {
	//filter picklist
	filterPicklist = function()
	{
		var CRM_FORM_TYPE_CREATE = 1;
		var CRM_FORM_TYPE_UPDATE = 2;
		
		switch (Xrm.Page.ui.getFormType())
		{	
			case CRM_FORM_TYPE_CREATE:  //CREATE_FORM
			case CRM_FORM_TYPE_UPDATE:	//UPDATE_FORM
				
				var oRelatedPicklist = Xrm.Page.getAttribute("ccrm_business");			
				oRelatedPicklist.originalPicklistOptions = oRelatedPicklist.getOptions();		
		
				if (Xrm.Page.getAttribute("ccrm_marketsector").getValue() != null)
				{
					var iPicklistValue = oRelatedPicklist.getValue();
					ccrm_marketsector_OnChange();
					oRelatedPicklist.setValue(iPicklistValue);					
				}
		
			break;
		}
	}

	//call ColoredPicklist function
	ColoredPicklist();
	//call to filter business and market filter
	filterPicklist();
}
/////////
// End: OnLoad
////////

/////////
// Begin: OnSave
////////
function Form_onsave() {
	//force submit on all readonly fields
	Xrm.Page.getAttribute("ccrm_countrycategory").setSubmitMode("always");
}
/////////
// End: OnSave
////////

function ColoredPicklist() {
	// function to add color to a picklist
	$('#leadqualitycode_i').children().each(
		function(){
			if ($(this).val() == 1){
				$(this).css({'background': '#FF0000'});
			}
			if ($(this).val() == 2) {
				$(this).css({'background': '#FFCC33'});
			}
			if ($(this).val() == 3) {
				$(this).css({'background': '#009900'})
			}			
		}
	);
}

/////////
// Begin: OnChange Functions 
////////
function ccrm_business_OnChange() {
	//function to set the Market Sector from Business
    switch(Xrm.Page.getAttribute("ccrm_business").getValue())
    {
         case "17":
		 Xrm.Page.getAttribute("ccrm_marketsector").setValue("1");
         break;

         case "18":
		 Xrm.Page.getAttribute("ccrm_marketsector").setValue("1");
         break;
         
		 case "19":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("1");
         break;

         case "1":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("1");
         break;
         
         case "2":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("1");
         break;

         case "3":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("2");
         break;
         
         case "4":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("2");
         break;

         case "5":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("2");
         break;
         
		 case "6":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("2");
         break;

         case "7":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("2");
         break;
        
         case "8":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("3");
         break;

         case "9":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("3");
         break;
         
         case "10":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("3");
         break;

         case "11":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("3");
         break;
         
		 case "12":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("4");
         break;

         case "13":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("4");
         break;
         
         case "14":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("4");
         break;

         case "15":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("4");
         break;
       
         case "16":
         Xrm.Page.getAttribute("ccrm_marketsector").setValue("5");
         break;
         
         default:
         Xrm.Page.getAttribute("ccrm_marketsector").setValue(null);
         break;
      }
}
function leadqualitycode_Onchange() {
	ColoredPicklist();
}
function ccrm_potentialleadlocationid_OnChange() {
	//check if the country field is populated
	if ( Xrm.Page.getAttribute("ccrm_potentialleadlocationid").getValue() != null )
	{
		
		var dataset = "Ccrm_countrySet"
		var countryId = Xrm.Page.getAttribute("ccrm_potentialleadlocationid").getValue()[0].id ;
		
		var retrievedreq = ConsultCrm.Sync.RetrieveRequest(countryid, dataset);
		if (retrievedreq != null) {
			//retrieve the risktaking field from ccrm_country 	- country category and risk rating are both option sets 
			Xrm.Page.getAttribute("ccrm_countrycategory").setValue(retrievedreq.Ccrm_RiskRating.getValue()); 
		} else 
		{
			Xrm.Page.getAttribute("ccrm_countrycategory").setValue(null); 
		}		
	}
}
function ccrm_marketsector_OnChange() {
	// This is the main function that will filter the picklists
	var oPrimaryPicklist = Xrm.Page.getAttribute("ccrm_marketsector");
	var oRelatedPicklist = Xrm.Page.getAttribute("ccrm_business"); 
	var oTempArray = new Array();
	var iLength = oRelatedPicklist.originalPicklistOptions.length;
	var aCurrentType = new Array();		
		
	switch (oPrimaryPicklist.getValue())
	{
		case "1":
		aCurrentType = new Array(17,18,19,1,2);
		break;
		case "2":
		aCurrentType = new Array(3,4,5,6,7);
		break;
		case "3":
		aCurrentType = new Array(8,9,10,11);
		break;
		case "4":
		aCurrentType = new Array(12,13,14,15);
		break;
		case "5":
		aCurrentType.push(16);
		break;
		default: 
		aCurrentType = new Array(17,18,19,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,20);
		break;
	}

	for (var i = 0; i < iLength; i++)
	{		
		if (jQuery.inArray(oRelatedPicklist.originalPicklistOptions[i].value, aCurrentType) != -1)
			oTempArray.push(oRealatedPicklist.originalPicklistOptions[i]);
	}
	
	oRelatedPicklist.Options = oTempArray;
	
	if (oTempArray.length > 0)
	{		
		Xrm.Page.ui.controls.get("ccrm_business").setDisabled(false);		
	}		
	else
	{
		oRelatedPicklist.setValue(null);
		oRelatedPicklist.setSubmitMode("always"); 
		//Xrm.Page.ui.controls.get("ccrm_business").setDisabled(true);				
	}	
}
/////////
// End: OnChange Functions 
////////


