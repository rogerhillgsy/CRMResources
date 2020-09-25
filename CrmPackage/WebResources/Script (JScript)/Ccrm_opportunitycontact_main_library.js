function Form_onsave(executionContext) {
    formContext = executionContext.getFormContext();

    //force submit on readonly fields
    formContext.getAttribute("ccrm_firstname").setSubmitMode("always");
    formContext.getAttribute("ccrm_lastname").setSubmitMode("always");
    formContext.getAttribute("ccrm_phone").setSubmitMode("always");
    formContext.getAttribute("ccrm_email").setSubmitMode("always");
    formContext.getAttribute("ccrm_organisationid").setSubmitMode("always");
}

ccrm_userid_onchange = function (executionContext) {
    formContext = executionContext.getFormContext();
    var userName = '';
    if (formContext.getAttribute("ccrm_contactid").getValue() == null && formContext.getAttribute("ccrm_userid").getValue() != null) {
        var dataset = "SystemUserSet";
        var retrievedreq = CCrm.JSCore.RetrieveRequest(formContext.getAttribute("ccrm_userid").getValue()[0].id, dataset);
        var nodeFirstName = retrievedreq.FirstName;
        var nodeLastName = retrievedreq.LastName;
        var nodeTelephone = retrievedreq.Address1_Telephone1;
        var nodeEmail = retrievedreq.InternalEMailAddress;

        //firstname
        if (nodeFirstName != null) {
            formContext.getAttribute("ccrm_firstname").setValue(nodeFirstName);
            userName += nodeFirstName;
        }
        else {
            formContext.getAttribute("ccrm_firstname").setValue(null);
        }
        //lastname
        if (nodeLastName != null) {
            formContext.getAttribute("ccrm_lastname").setValue(nodeLastName);
            userName += ' ' + nodeLastName;
        }
        else {
            formContext.getAttribute("ccrm_lastname").setValue(null);
        }
        //telephone
        if (nodeTelephone != null) {
            formContext.getAttribute("ccrm_phone").setValue(nodeTelephone);
        }
        else {
            formContext.getAttribute("ccrm_phone").setValue(null);
        }
        //email
        if (nodeEmail != null) {
            formContext.getAttribute("ccrm_email").setValue(nodeEmail);
        }
        else {
            formContext.getAttribute("ccrm_email").setValue(null);
        }
        formContext.getAttribute("ccrm_name").setValue(userName);

    }
    else if (formContext.getAttribute("ccrm_contactid").getValue() != null && formContext.getAttribute("ccrm_userid").getValue() != null) {
        alert("Please select either a User or a Contact. \nRemove the value first before changing to a User or a Contact");
        //null values
        formContext.getAttribute("ccrm_userid").setValue(null);
        formContext.getAttribute("ccrm_name").setValue(formContext.getAttribute("ccrm_name").getValue());
        formContext.getAttribute("ccrm_firstname").setValue(formContext.getAttribute("ccrm_firstname").getValue());
        formContext.getAttribute("ccrm_lastname").setValue(formContext.getAttribute("ccrm_lastname").getValue());
        formContext.getAttribute("ccrm_phone").setValue(formContext.getAttribute("ccrm_phone").getValue());
        formContext.getAttribute("ccrm_email").setValue(formContext.getAttribute("ccrm_email").getValue());
    }

    if (formContext.getAttribute("ccrm_contactid").getValue() == null && formContext.getAttribute("ccrm_userid").getValue() == null) {
        //null values
        formContext.getAttribute("ccrm_name").setValue(null);
        formContext.getAttribute("ccrm_firstname").setValue(null);
        formContext.getAttribute("ccrm_lastname").setValue(null);
        formContext.getAttribute("ccrm_phone").setValue(null);
        formContext.getAttribute("ccrm_email").setValue(null);
        formContext.getAttribute("ccrm_organisationid").setValue(null);
    }
}

ccrm_contactid_onchange = function (executionContext) {
    formContext = executionContext.getFormContext();
    var contactName = '';
    if (formContext.getAttribute("ccrm_userid").getValue() == null && formContext.getAttribute("ccrm_contactid").getValue() != null) {
        var dataset = "ContactSet";
        var retrievedreq = CCrm.JSCore.RetrieveRequest(formContext.getAttribute("ccrm_contactid").getValue()[0].id, dataset);
        var nodeFirstName = retrievedreq.FirstName;
        var nodeLastName = retrievedreq.LastName;
        var nodeParentOrgId = retrievedreq.ParentCustomerId;
        var nodeTelephone = retrievedreq.Telephone1;
        var nodeEmail = retrievedreq.EMailAddress1;

        //firstname
        if (nodeFirstName != null) {
            formContext.getAttribute("ccrm_firstname").setValue(nodeFirstName);
            contactName += nodeFirstName;
        }
        else {
            formContext.getAttribute("ccrm_firstname").setValue(null);
        }
        //lastname
        if (nodeLastName != null) {
            formContext.getAttribute("ccrm_lastname").setValue(nodeLastName);
            contactName += ' ' + nodeLastName;
        }
        else {
            formContext.getAttribute("ccrm_lastname").setValue(null);
        }
        //telephone
        if (nodeTelephone != null) {
            formContext.getAttribute("ccrm_phone").setValue(nodeTelephone);
        }
        else {
            formContext.getAttribute("ccrm_phone").setValue(null);
        }
        //email
        if (nodeEmail != null) {
            formContext.getAttribute("ccrm_email").setValue(nodeEmail);
        }
        else {
            formContext.getAttribute("ccrm_email").setValue(null);
        }
        formContext.getAttribute("ccrm_name").setValue(contactName);

    }
    else if (formContext.getAttribute("ccrm_contactid").getValue() != null && formContext.getAttribute("ccrm_userid").getValue() != null) {
        alert("Please select either a User or a Contact. \nRemove the value first before changing to a User or a Contact.");
        //null values
        formContext.getAttribute("ccrm_contactid").setValue(null);
        formContext.getAttribute("ccrm_name").setValue(formContext.getAttribute("ccrm_name").getValue());
        formContext.getAttribute("ccrm_firstname").setValue(formContext.getAttribute("ccrm_firstname").getValue());
        formContext.getAttribute("ccrm_lastname").setValue(formContext.getAttribute("ccrm_lastname").getValue());
        formContext.getAttribute("ccrm_phone").setValue(formContext.getAttribute("ccrm_phone").getValue());
        formContext.getAttribute("ccrm_email").setValue(formContext.getAttribute("ccrm_email").getValue());
    }
    if (formContext.getAttribute("ccrm_contactid").getValue() == null && formContext.getAttribute("ccrm_userid").getValue() == null) {
        //null values
        formContext.getAttribute("ccrm_name").setValue(null);
        formContext.getAttribute("ccrm_firstname").setValue(null);
        formContext.getAttribute("ccrm_lastname").setValue(null);
        formContext.getAttribute("ccrm_phone").setValue(null);
        formContext.getAttribute("ccrm_email").setValue(null);
        formContext.getAttribute("ccrm_organisationid").setValue(null);
    }

    if (nodeParentOrgId != null && nodeParentOrgId.Id != null) {
        //alert(nodeParentOrgId.Id);
        getOrganisation(nodeParentOrgId.Id);
    }
    else {
        formContext.getAttribute("ccrm_organisationid").setValue(null);
    }
}

getOrganisation = function (executionContext, nodeParentOrgId) {
    formContext = executionContext.getFormContext();
    //get organisation
    var dataset = "AccountSet";
    // use the RetrieveRequest function in the library to retrieve the record
    var retrievedreq = CCrm.JSCore.RetrieveRequest(nodeParentOrgId, dataset);
    var nodeOrgName = retrievedreq.Name;

    var lookupItem = new Array();
    lookupItem[0] = new LookupControlItem(nodeParentOrgId, 1, nodeOrgName);
    formContext.getAttribute("ccrm_organisationid").setValue(lookupItem);
}

ccrm_name_onchange = function (executionContext) {
    formContext = executionContext.getFormContext();
    var fullname = '';
    if (formContext.getAttribute("ccrm_firstname").getValue() != null)
        fullname += formContext.getAttribute("ccrm_firstname").getValue();
    if (formContext.getAttribute("ccrm_lastname").getValue() != null)
        fullname += formContext.getAttribute("ccrm_firstname").getValue();

    formContext.getAttribute("ccrm_name").setValue(fullname);
}