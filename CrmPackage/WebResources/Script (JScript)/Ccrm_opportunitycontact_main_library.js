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

        Xrm.WebApi.online.retrieveRecord("systemuser", formContext.getAttribute("ccrm_userid").getValue()[0].id, "?$select=address1_telephone1,firstname,internalemailaddress,lastname").then(
            function success(result) {
                var nodeTelephone = result["address1_telephone1"];
                var nodeFirstName = result["firstname"];
                var nodeEmail = result["internalemailaddress"];
                var nodeLastName = result["lastname"];

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
            },
            function (error) {
                Xrm.Navigation.openAlertDialog(error.message);
            }
        );   

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

        Xrm.WebApi.online.retrieveRecord("contact", formContext.getAttribute("ccrm_contactid").getValue()[0].id, "?$select=emailaddress1,firstname,lastname,_parentcustomerid_value,telephone1").then(
            function success(result) {
                var nodeEmail = result["emailaddress1"];
                var nodeFirstName = result["firstname"];
                var nodeLastName = result["lastname"];
                var nodeParentOrgId_value = result["_parentcustomerid_value"];
                var nodeParentOrgId_value_formatted = result["_parentcustomerid_value@OData.Community.Display.V1.FormattedValue"];
                var nodeParentOrgId_value_lookuplogicalname = result["_parentcustomerid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                var nodeTelephone = result["telephone1"];


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


                if (nodeParentOrgId_value != null) {
                    formContext.getAttribute("ccrm_organisationid").setValue([
                        {
                            id: nodeParentOrgId_value,
                            name: nodeParentOrgId_value_formatted,
                            entityType: nodeParentOrgId_value_lookuplogicalname
                        }
                    ]);
                }
                else {
                    formContext.getAttribute("ccrm_organisationid").setValue(null);
                }
            },
            function (error) {
                Xrm.Navigation.openAlertDialog(error.message);
            }
        );



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