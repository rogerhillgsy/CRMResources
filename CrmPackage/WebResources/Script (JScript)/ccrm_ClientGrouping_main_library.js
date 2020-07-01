"use strict";

function OpenClientGroupingMatrixReport(primaryControl) {
    var formContext = primaryControl;
    var accId;
    if (formContext.data != null) {
        accId = formContext.data.entity.getId().replace('{', '').replace('}', '');
    }
    else {
        accId = "29616C21-7745-E011-9CF6-78E7D16510D0";
    }

    var customParameters = encodeURIComponent("clientgroupingID=" + accId);
    var windowOptions = { openInNewWindow: true, height: 800, width: 1200 };
    Xrm.Navigation.openWebResource('arup_clientgroupingmatrix', windowOptions, customParameters);
}

//  RBH - 1/7/20 - Not clear if this is still needed - the Client grouping main form still refers to it, but it doesn't seem to do anything.
function relationshipTeam_onChange(executionContext) {
    debugger;
    var formContext = executionContext.getFormContext();
    var teamId = formContext.getAttribute('ccrm_managingteam').getValue();
    if (teamId == null) {
        var a = formContext.getAttribute('ccrm_accounttype');
        !!a && a.setValue(null);
        a = formContext.getAttribute('ccrm_relationshipmanager');
        !!a && a.setValue(null);
        return;
    }

    teamId = teamId[0].id.replace('{', '').replace('}', '');

    Xrm.WebApi.retrieveRecord("team",  teamId,
            "?$select=_ccrm_relationshipmanager_value,ccrm_relationshiptype")
        .then(function success(result) {
            var _ccrm_relationshipmanager_value = result["_ccrm_relationshipmanager_value"];
            var _ccrm_relationshipmanager_value_formatted =
                result["_ccrm_relationshipmanager_value@OData.Community.Display.V1.FormattedValue"];
            var ccrm_relationshiptype = result["ccrm_relationshiptype"];

            var a = formContext.getAttribute('ccrm_accounttype');
            !!a && a.setValue(ccrm_relationshiptype);
            if (_ccrm_relationshipmanager_value == null) {
                a = formContext.getAttribute('ccrm_relationshipmanager');
                !!a && a.setValue(null);
            } else {
                var lookup = new Array();
                lookup[0] = new Object();
                lookup[0].id = _ccrm_relationshipmanager_value;
                lookup[0].name = _ccrm_relationshipmanager_value_formatted;
                lookup[0].entityType = 'systemuser';
                a = formContext.getAttribute('ccrm_relationshipmanager');
                !!a && a.setValue(lookup);
            }

        })
        .catch(function error(e) {
            var alertStrings = { confirmButtonLabel: "OK", text: e.message, title: "Alert" };
            var alertOptions = { height: 120, width: 260 };
            Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
        });
}