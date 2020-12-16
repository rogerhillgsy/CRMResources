function onloadSetFieldSecurity(executionContext) {
    var formContext = executionContext.getFormContext();

    formContext.data.entity.attributes.forEach(function (attribute, index) {
        var control = formContext.getControl(attribute.getName());
        if (control) {
            control.setDisabled(true)
        }
    });

    var DQUser = isUserInTeamCheck(formContext);
    if (DQUser) {
        formContext.ui.controls.get("arup_useownaccountingcentreforopportunities").setDisabled(false);
        formContext.ui.controls.get("arup_superuser").setDisabled(false);
    }

    var systemUser = formContext.context.getUserId().replace('{', '').replace('}', '');
    var loadUserId = formContext.data.entity.getId().replace('{', '').replace('}', '');
    if (!DQUser) {
        if (systemUser != loadUserId) {
            formContext.ui.controls.get("arup_useownaccountingcentreforopportunities").setDisabled(true);
            formContext.ui.controls.get("arup_superuser").setDisabled(true);
        } else {
            formContext.ui.controls.get("arup_useownaccountingcentreforopportunities").setDisabled(false);
            formContext.ui.controls.get("arup_superuser").setDisabled(true);
        }
    }
}

function isUserInTeamCheck(formContext) {
    var systemUser = formContext.context.getUserId().replace('{', '').replace('}', '');
    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/teammemberships?$filter=systemuserid eq " + systemUser + " and (teamid eq 14E17BE2-0FF3-E411-940C-005056B5174A)", false);
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
                userInTeam = results.value.length > 0;
            } else {
                Xrm.Navigation.openAlertDialog(this.statusText);
            }
        }
    };
    req.send();
    return userInTeam;
}