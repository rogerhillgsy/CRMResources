function Form_onsave() {
    //force submit on readonly fields
    Xrm.Page.getAttribute("ccrm_firstname").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_lastname").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_phone").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_email").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_organisationid").setSubmitMode("always");
}

ccrm_userid_onchange = function () {

    var userName = '';
    if (Xrm.Page.getAttribute("ccrm_contactid").getValue() == null && Xrm.Page.getAttribute("ccrm_userid").getValue() != null) {
        var dataset = "SystemUserSet";
        var retrievedreq = CCrm.JSCore.RetrieveRequest(Xrm.Page.getAttribute("ccrm_userid").getValue()[0].id, dataset);
        var nodeFirstName = retrievedreq.FirstName;
        var nodeLastName = retrievedreq.LastName;
        var nodeTelephone = retrievedreq.Address1_Telephone1;
        var nodeEmail = retrievedreq.InternalEMailAddress;

        //firstname
        if (nodeFirstName != null) {
            Xrm.Page.getAttribute("ccrm_firstname").setValue(nodeFirstName);
            userName += nodeFirstName;
        }
        else {
            Xrm.Page.getAttribute("ccrm_firstname").setValue(null);
        }
        //lastname
        if (nodeLastName != null) {
            Xrm.Page.getAttribute("ccrm_lastname").setValue(nodeLastName);
            userName += ' ' + nodeLastName;
        }
        else {
            Xrm.Page.getAttribute("ccrm_lastname").setValue(null);
        }
        //telephone
        if (nodeTelephone != null) {
            Xrm.Page.getAttribute("ccrm_phone").setValue(nodeTelephone);
        }
        else {
            Xrm.Page.getAttribute("ccrm_phone").setValue(null);
        }
        //email
        if (nodeEmail != null) {
            Xrm.Page.getAttribute("ccrm_email").setValue(nodeEmail);
        }
        else {
            Xrm.Page.getAttribute("ccrm_email").setValue(null);
        }
        Xrm.Page.getAttribute("ccrm_name").setValue(userName);

    }
    else if (Xrm.Page.getAttribute("ccrm_contactid").getValue() != null && Xrm.Page.getAttribute("ccrm_userid").getValue() != null) {
        alert("Please select either a User or a Contact. \nRemove the value first before changing to a User or a Contact");
        //null values
        Xrm.Page.getAttribute("ccrm_userid").setValue(null);
        Xrm.Page.getAttribute("ccrm_name").setValue(Xrm.Page.getAttribute("ccrm_name").getValue());
        Xrm.Page.getAttribute("ccrm_firstname").setValue(Xrm.Page.getAttribute("ccrm_firstname").getValue());
        Xrm.Page.getAttribute("ccrm_lastname").setValue(Xrm.Page.getAttribute("ccrm_lastname").getValue());
        Xrm.Page.getAttribute("ccrm_phone").setValue(Xrm.Page.getAttribute("ccrm_phone").getValue());
        Xrm.Page.getAttribute("ccrm_email").setValue(Xrm.Page.getAttribute("ccrm_email").getValue());
    }

    if (Xrm.Page.getAttribute("ccrm_contactid").getValue() == null && Xrm.Page.getAttribute("ccrm_userid").getValue() == null) {
        //null values
        Xrm.Page.getAttribute("ccrm_name").setValue(null);
        Xrm.Page.getAttribute("ccrm_firstname").setValue(null);
        Xrm.Page.getAttribute("ccrm_lastname").setValue(null);
        Xrm.Page.getAttribute("ccrm_phone").setValue(null);
        Xrm.Page.getAttribute("ccrm_email").setValue(null);
        Xrm.Page.getAttribute("ccrm_organisationid").setValue(null);
    }
}

ccrm_contactid_onchange = function () {
    var contactName = '';
    if (Xrm.Page.getAttribute("ccrm_userid").getValue() == null && Xrm.Page.getAttribute("ccrm_contactid").getValue() != null) {
        var dataset = "ContactSet";
        var retrievedreq = CCrm.JSCore.RetrieveRequest(Xrm.Page.getAttribute("ccrm_contactid").getValue()[0].id, dataset);
        var nodeFirstName = retrievedreq.FirstName;
        var nodeLastName = retrievedreq.LastName;
        var nodeParentOrgId = retrievedreq.ParentCustomerId;
        var nodeTelephone = retrievedreq.Telephone1;
        var nodeEmail = retrievedreq.EMailAddress1;

        //firstname
        if (nodeFirstName != null) {
            Xrm.Page.getAttribute("ccrm_firstname").setValue(nodeFirstName);
            contactName += nodeFirstName;
        }
        else {
            Xrm.Page.getAttribute("ccrm_firstname").setValue(null);
        }
        //lastname
        if (nodeLastName != null) {
            Xrm.Page.getAttribute("ccrm_lastname").setValue(nodeLastName);
            contactName += ' ' + nodeLastName;
        }
        else {
            Xrm.Page.getAttribute("ccrm_lastname").setValue(null);
        }
        //telephone
        if (nodeTelephone != null) {
            Xrm.Page.getAttribute("ccrm_phone").setValue(nodeTelephone);
        }
        else {
            Xrm.Page.getAttribute("ccrm_phone").setValue(null);
        }
        //email
        if (nodeEmail != null) {
            Xrm.Page.getAttribute("ccrm_email").setValue(nodeEmail);
        }
        else {
            Xrm.Page.getAttribute("ccrm_email").setValue(null);
        }
        Xrm.Page.getAttribute("ccrm_name").setValue(contactName);

    }
    else if (Xrm.Page.getAttribute("ccrm_contactid").getValue() != null && Xrm.Page.getAttribute("ccrm_userid").getValue() != null) {
        alert("Please select either a User or a Contact. \nRemove the value first before changing to a User or a Contact.");
        //null values
        Xrm.Page.getAttribute("ccrm_contactid").setValue(null);
        Xrm.Page.getAttribute("ccrm_name").setValue(Xrm.Page.getAttribute("ccrm_name").getValue());
        Xrm.Page.getAttribute("ccrm_firstname").setValue(Xrm.Page.getAttribute("ccrm_firstname").getValue());
        Xrm.Page.getAttribute("ccrm_lastname").setValue(Xrm.Page.getAttribute("ccrm_lastname").getValue());
        Xrm.Page.getAttribute("ccrm_phone").setValue(Xrm.Page.getAttribute("ccrm_phone").getValue());
        Xrm.Page.getAttribute("ccrm_email").setValue(Xrm.Page.getAttribute("ccrm_email").getValue());
    }
    if (Xrm.Page.getAttribute("ccrm_contactid").getValue() == null && Xrm.Page.getAttribute("ccrm_userid").getValue() == null) {
        //null values
        Xrm.Page.getAttribute("ccrm_name").setValue(null);
        Xrm.Page.getAttribute("ccrm_firstname").setValue(null);
        Xrm.Page.getAttribute("ccrm_lastname").setValue(null);
        Xrm.Page.getAttribute("ccrm_phone").setValue(null);
        Xrm.Page.getAttribute("ccrm_email").setValue(null);
        Xrm.Page.getAttribute("ccrm_organisationid").setValue(null);
    }

    if (nodeParentOrgId != null && nodeParentOrgId.Id != null) {
        //alert(nodeParentOrgId.Id);
        getOrganisation(nodeParentOrgId.Id);
    }
    else {
        Xrm.Page.getAttribute("ccrm_organisationid").setValue(null);
    }
}

getOrganisation = function (nodeParentOrgId) {
    //get organisation
    var dataset = "AccountSet";
    // use the RetrieveRequest function in the library to retrieve the record
    var retrievedreq = CCrm.JSCore.RetrieveRequest(nodeParentOrgId, dataset);
    var nodeOrgName = retrievedreq.Name;

    var lookupItem = new Array();
    lookupItem[0] = new LookupControlItem(nodeParentOrgId, 1, nodeOrgName);
    Xrm.Page.getAttribute("ccrm_organisationid").setValue(lookupItem);
}

ccrm_name_onchange = function () {
    var fullname = '';
    if (Xrm.Page.getAttribute("ccrm_firstname").getValue() != null)
        fullname += Xrm.Page.getAttribute("ccrm_firstname").getValue();
    if (Xrm.Page.getAttribute("ccrm_lastname").getValue() != null)
        fullname += Xrm.Page.getAttribute("ccrm_firstname").getValue();

    Xrm.Page.getAttribute("ccrm_name").setValue(fullname);
}