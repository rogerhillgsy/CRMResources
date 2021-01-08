function form_OnLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.ui.getFormType() == 1) {
        getUserDetails(formContext);
    }

    var targetedAtList = formContext.getControl("createdfromcode");

    targetedAtList.removeOption(1);
    targetedAtList.removeOption(4);

    formContext.getAttribute("createdfromcode").setValue(2);
}

function form_OnSave() {

}

function getUserDetails(formContext) {
    // Get Arup Region adn Office values from user record.
    Xrm.WebApi.retrieveRecord("systemuser",
            formContext.context.getUserId(),
            "?$select=_ccrm_arupregionid_value,_ccrm_arupofficeid_value")
        .then(function(result) {
            SetLookupField(formContext,
                result._ccrm_arupregionid_value,
                result["_ccrm_arupregionid_value@OData.Community.Display.V1.FormattedValue"],
                'ccrm_arupregion',
                'ccrm_arupregion');
            SetLookupField(formContext,
                result._ccrm_arupofficeid_value,
                result["_ccrm_arupofficeid_value@OData.Community.Display.V1.FormattedValue"],
                'ccrm_arupoffice',
                'ccrm_arupoffice');
        });
}

function SetLookupField(formContext, id, name, entity, field) {
    var lookup = new Array();
    lookup[0] = new Object();
    lookup[0].id = id;
    lookup[0].name = name;
    lookup[0].entityType = entity;
    formContext.getAttribute(field).setValue(lookup);
}

function errorHandler(error) {

    alert("Something went wrong. Please contact CRM Support and note this message: " + error.message);

}

function ExportMember(formContext) {
    var gridContact = formContext.getControl("contactsUCI");
    gridContact.setFocus(true);
    setTimeout(function () {
        XrmCore.Commands.Export.exportToExcel(gridContact, 'Contacts', 5);
    }, 1000);
}