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

function SetDefaultValueToFieldOfPlay(executionContext) {
    var formContext = executionContext.getFormContext();
    var relationshipTeamId = formContext.getAttribute("ccrm_relationshipteam").getValue();
    if (relationshipTeamId != null) {
        relationshipTeamId = relationshipTeamId[0].id.replace(/[{}]/g, "");

        Xrm.WebApi.online.retrieveMultipleRecords("arup_fieldofplay", "?$select=arup_fieldofplayid,arup_name&$filter=_arup_relationshipteamid_value eq " + relationshipTeamId + " and  contains(arup_name, '%23%20General')").then(
            function success(results) {
                if (results.entities.length > 0) {
                    for (var i = 0; i < results.entities.length; i++) {
                        var arup_fieldofplayid = results.entities[i]["arup_fieldofplayid"];
                        var arup_name = results.entities[i]["arup_name"];
                        formContext.getAttribute("arup_fieldofplayid").setValue([{ id: arup_fieldofplayid, name: arup_name, entityType: "arup_fieldofplay" }]);
                       // formContext.getControl("arup_fieldofplayid").setDisabled(false);
                    }
                } else {
                    formContext.getAttribute("arup_fieldofplayid").setValue(null);
                  //  formContext.getControl("arup_fieldofplayid").setDisabled(true);
                }
            },
            function (error) {
                Xrm.Navigation.openAlertDialog(error.message);
            }
        );
    }
}
