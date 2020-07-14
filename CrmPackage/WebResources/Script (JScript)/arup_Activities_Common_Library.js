// Phone call on save - ""arup_organisationid"", "arup_fieldofplayid"
// Task on save - "ccrm_relatedorganisationid", "arup_fieldofplayid"
function ShowHideFieldOfPlay(executionContext, organisationIdFieldName, fieldOfPlayFieldName) {
    var formContext = executionContext.getFormContext();
    var orgId = formContext.getAttribute(organisationIdFieldName);
    if ( !!orgId && orgId.getValue() != null) {
        var organisationId = orgId.getValue()[0].id.replace(/[{}]/g, '');
        Xrm.WebApi.retrieveMultipleRecords("arup_fieldofplay",
                "?$select=_arup_organsationid_value&$filter=_arup_organsationid_value eq " + organisationId + "")
            .then(function received(results) {
                    if (results.entities.length > 0) {
                        formContext.getControl(fieldOfPlayFieldName).setVisible(true);
                    } else {
                        formContext.getControl(fieldOfPlayFieldName).setVisible(false);
                        formContext.getAttribute(fieldOfPlayFieldName).setValue("");
                    }
            })
            .catch(function error(e) {
                var alertStrings = { confirmButtonLabel: "OK", text: e.message, title: "Alert" };
                var alertOptions = { height: 120, width: 260 };
                Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
            });
    }
}
