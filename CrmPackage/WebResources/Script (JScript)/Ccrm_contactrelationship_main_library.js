function onLoad() {
    if (Xrm.Page.ui.getFormType() != 1)
        setActivityInfo();

}
// user id on-change
function userId_onChange() {
    var UserIdlookupObject = Xrm.Page.getAttribute("ccrm_userid");
    if (UserIdlookupObject != null) {
        var lookUpObjectValue = UserIdlookupObject.getValue();
        if ((lookUpObjectValue != null))
            Xrm.Page.getAttribute("ccrm_name").setValue(lookUpObjectValue[0].name);
    }
}


//set Last Activity Information 
function setActivityInfo() {
    //get ContactId
    var UserIdlookupObject = Xrm.Page.getAttribute("ccrm_contactid");
    if (UserIdlookupObject != null) {
        var lookUpObjectValue = UserIdlookupObject.getValue();
        if ((lookUpObjectValue != null))
            var contactId = lookUpObjectValue[0].id;

        //retrieve the Contact with Matching id 
        if (contactId != null) {
            var dataset = "ContactSet"
            var retrievedreq = ConsultCrm.Sync.RetrieveRequest(contactId, dataset);

            if (retrievedreq.Ccrm_LastActivityDate != null) {
                Xrm.Page.getAttribute("ccrm_lastactivitydate").setValue(retrievedreq.Ccrm_LastActivityDate);
                Xrm.Page.getAttribute("ccrm_lastactivitytypesubject").setValue(retrievedreq.Ccrm_LastActivityTypeSubject);
            }
        }
    }
}


function onSave() {
    //force submit on read-only fields
    Xrm.Page.getAttribute("ccrm_contactid").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_lastactivitytypesubject").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_lastactivitydate").setSubmitMode("always");
}
