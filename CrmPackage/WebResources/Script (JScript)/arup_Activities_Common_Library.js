function ShowHideFieldOfPlay(organisationIdFieldName, fieldOfPlayFieldName) {

    if (Xrm.Page.getAttribute(organisationIdFieldName).getValue() != null) {
        var organisationId = Xrm.Page.getAttribute(organisationIdFieldName).getValue()[0].id.replace('{', '').replace('}', '');
        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/arup_fieldofplaies?$select=_arup_organsationid_value&$filter=_arup_organsationid_value eq " + organisationId + "", true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    if (results.value.length > 0) {
                        Xrm.Page.getControl(fieldOfPlayFieldName).setVisible(true);
                    } else {
                        Xrm.Page.getControl(fieldOfPlayFieldName).setVisible(false);
                        Xrm.Page.getAttribute(fieldOfPlayFieldName).setValue("");
                    }
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();

    }
}
