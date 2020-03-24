form_OnLoad = function() {
	if (Xrm.Page.ui.getFormType() == 1) {
			
		//default the Client to 'Unassigned' record
		if (Xrm.Page.getAttribute("customerid").getValue() == null) {
			Xrm.Page.getAttribute("customerid").setValue(setDefaultClientUnassigned());
		}
	}			
}

//default the Client to 'Unassigned' record
function setDefaultClientUnassigned() {	
	//return Organisation having name ="Unassigned" - replaces guids being declared
	var filter = "Name eq 'Unassigned'"; 
	var dataset = "AccountSet"; 
	var lookup = new Array(); 

	var retrievedMultiple = ConsultCrm.Sync.RetrieveMultipleRequest(dataset, filter);
	if (retrievedMultiple.results.length != 0) {
		var retrievedreq = retrievedMultiple.results[0];
		lookup[0] = new Object();
		lookup[0].id = retrievedreq.AccountId; 
		lookup[0].name = retrievedreq.Name; 
		lookup[0].entityType = "account"; 			
	}
	return lookup;
}

//set opportunity short title 
function name_onchange() {
	if (Xrm.Page.getAttribute("name").getValue() != null) {
		var x = Xrm.Page.getAttribute("name").getValue();
		var y = x.replace(/;/g, ' ');
		if (Xrm.Page.getAttribute("ccrm_shorttitle").getValue() == null) {
			//set first 30 characters
			setShortTitle(y);
		}
	}
}

//function to set the short title
function setShortTitle(s) {
	if (s != null) {
		var strName = s;
		Xrm.Page.getAttribute("ccrm_shorttitle").setValue(strName.substring(0, 30));
	}
}


//function that checks whether the client is 'Unassigned'
function customerid_onChange() {

    //check whether selected type is a contact
    if (Xrm.Page.getAttribute("customerid").getValue() != null) {
        if (Xrm.Page.getAttribute("customerid").getValue()[0].entityType == "contact") {
            alert("The Client selected needs to be an Organisation");
            Xrm.Page.getAttribute("customerid").setValue(null);
            return;
        }
    }
}