"use strict";

function OpenClientGroupingMatrixReport(primaryControl) {
    debugger;
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


function relationshipTeam_onChange(execuionContext) {
    debugger;
    var formContext = primaryControl;
    var teamId = formContext.getAttribute('ccrm_managingteam').getValue();
    if (teamId == null) {
        formContext.getAttribute('ccrm_accounttype').setValue(null);
        formContext.getAttribute('ccrm_relationshipmanager').setValue(null);
        return;
    }

    teamId = teamId[0].id.replace('{', '').replace('}', '');

    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/teams(" + teamId + ")?$select=_ccrm_relationshipmanager_value,ccrm_relationshiptype", true);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var result = JSON.parse(this.response);
                var _ccrm_relationshipmanager_value = result["_ccrm_relationshipmanager_value"];
                var _ccrm_relationshipmanager_value_formatted = result["_ccrm_relationshipmanager_value@OData.Community.Display.V1.FormattedValue"];
                var _ccrm_relationshipmanager_value_lookuplogicalname = result["_ccrm_relationshipmanager_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                var ccrm_relationshiptype = result["ccrm_relationshiptype"];

                Xrm.Page.getAttribute('ccrm_accounttype').setValue(ccrm_relationshiptype);
                if (_ccrm_relationshipmanager_value == null) {
                    Xrm.Page.getAttribute('ccrm_relationshipmanager').setValue(null);
                } else {
                    var lookup = new Array();
                    lookup[0] = new Object();
                    lookup[0].id = _ccrm_relationshipmanager_value;
                    lookup[0].name = _ccrm_relationshipmanager_value_formatted;
                    lookup[0].entityType = 'systemuser';
                    Xrm.Page.getAttribute('ccrm_relationshipmanager').setValue(lookup);
                }

            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();

}