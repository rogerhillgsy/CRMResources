//var timer = setInterval(function () { GetSubgrid(); }, 1000);

function Form_onload() {

    gridOnLoad();

}

function gridOnLoad() {

    var objSubGrid = document.getElementById("ClientsGroupOrganisations");

    if (objSubGrid == null) {
        setTimeout(gridOnLoad, 2000);
        return;
    }
    else {
        //when subgrid is loaded, get GUID
        var GUIDvalue = Xrm.Page.data.entity.getId();
    }
}

function relationshipTeam_onChange() {

    var teamId = Xrm.Page.getAttribute('ccrm_managingteam').getValue();
    if (teamId == null) {

        Xrm.Page.getAttribute('ccrm_accounttype').setValue(null);
        Xrm.Page.getAttribute('ccrm_relationshipmanager').setValue(null);
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

function OpenClientGroupingMatrixReport(primaryControl) {
    var formContext = primaryControl;
    var accId, parentaccountid;
    if (formContext.data != null) {
        accId = formContext.data.entity.getId().replace('{', '').replace('}', '');
        //parentaccountid = formContext.getAttribute("parentaccountid").getValue() != undefined ? formContext.getAttribute("parentaccountid").getValue()[0].id.replace('{', '').replace('}', '') : accId;
    }
    else {
        accId = "29616C21-7745-E011-9CF6-78E7D16510D0";
        //parentaccountid = accId;
    }

    var customParameters = encodeURIComponent("clientgroupingID=" + accId);
    var windowOptions = { openInNewWindow: true, height: 800, width: 1200 };
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) // If Internet Explorer, return version number
    {
        Xrm.Navigation.openWebResource('arup_clientgroupingmatrix', windowOptions, customParameters);
    }
    else  // If another browser, return 0
    {
        Xrm.Navigation.openWebResource('arup_clientgroupingmatrix', windowOptions, customParameters);
    }
}