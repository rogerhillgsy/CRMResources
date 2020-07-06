function DisableFields(executionContext) {
    formContext = executionContext.getFormContext();
    if (formContext.ui.getFormType() == 2) {
        formContext.getControl('arup_relationshipteamid').setDisabled(true);
        if (formContext.getControl('arup_organisationid') != null) {
            formContext.getControl('arup_organsationid').setDisabled(true);
        }
    }
}


//Param - teamm name . This function checks whether the logged in user is a member of the team. Returns true if he/ she is a member.
function userInTeamCheck(formContext, TeamName) {

    var IsPresentInTeam = false;

    try {
        var results;
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            url: formContext.context.getClientUrl() + "/api/data/v9.1/teammemberships?fetchXml=%3Cfetch%3E%3Centity%20name%3D%22teammembership%22%20%3E%3Cattribute%20name%3D%22teamid%22%20%2F%3E%3Cfilter%20type%3D%22or%22%20%3E%3Ccondition%20attribute%3D%22systemuserid%22%20operator%3D%22eq-userid%22%20%2F%3E%3C%2Ffilter%3E%3C%2Fentity%3E%3C%2Ffetch%3E",
            beforeSend: function (XMLHttpRequest) {
                XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                XMLHttpRequest.setRequestHeader("Accept", "application/json");
                XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
            },
            async: false,
            success: function (data, textStatus, xhr) {
                results = data.value;
            },
            error: function (xhr, textStatus, errorThrown) {
                var alertStrings = { confirmButtonLabel: "OK", text: this.statusText, title: "Alert" };
                var alertOptions = { height: 120, width: 260 };
                Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
            }
        });
        for (i = 0; i < results.length; i++) {
            var resultteam;
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: formContext.context.getClientUrl() + "/api/data/v9.1/teams?fetchXml=%3Cfetch%3E%3Centity%20name%3D%22team%22%20%3E%3Cattribute%20name%3D%22name%22%20%2F%3E%3Cfilter%3E%3Ccondition%20attribute%3D%22teamid%22%20operator%3D%22eq%22%20value%3D%22"+results[i].teamid+"%22%20%2F%3E%3C%2Ffilter%3E%3C%2Fentity%3E%3C%2Ffetch%3E",
                beforeSend: function (XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                    XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                    XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                },
                async: false,
                success: function (data, textStatus, xhr) {
                    resultteam = data.value;
                },
                error: function () {
                    var alertStrings = { confirmButtonLabel: "OK", text: this.statusText, title: "Alert" };
                    var alertOptions = { height: 120, width: 260 };
                    Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
                }
            });
            if (resultteam[0].name == TeamName) {
                IsPresentInTeam = true;
                break;
            }
        }
    }
    catch (err) {
        console.log('GLobal DQ Error: ' + err.message);
    }
    return IsPresentInTeam;
}

function ValidateUserBelongsToTeam(context, eventFlag) {
    if (eventFlag == undefined) {
        eventFlag = false;
    }
    var formContext = context.getFormContext();
    var eventArgs = context.getEventArgs();
    var teamName = formContext.getAttribute("arup_relationshipteamid").getValue()[0].name;

    if (!userInTeamCheck(formContext, teamName)) {
        Alert.show('<font size="6" color="#d80303"><b>User not a Part of Team</b></font>',
            '<font size="3" color="#000000"></br>Only members of <b>' + teamName + '</b> can create/edit Field of Play records </font>',
            [
                new Alert.Button("<b>OK</b>")
            ],
            "Error",
            600,
            200,
            '',
            true);
        if (eventFlag) {
           eventArgs.preventDefault();
        }
    }
}

function ClearOrganisation(context) {
    var formContext = context.getFormContext();
    if (formContext.getControl('arup_organisationid') != null) {
        formContext.getAttribute("arup_organsationid").setValue(null);
    }
    GetOrganisations(formContext);
}

function OnLoad(context) {
    var formContext = context.getFormContext();
    var param = formContext.context.getQueryStringParameters();
    var source = param["arup_relationshipteamid"];

    if (source != undefined) {
        formContext.getControl('arup_relationshipteamid').setDisabled(true);
        GetOrganisations(formContext);
    }
}

function GetOrganisations(formContext) {
    if (formContext.getAttribute("arup_relationshipteamid").getValue() != null) {
        var teamId = formContext.getAttribute("arup_relationshipteamid").getValue()[0].id.replace(/[{}]/g, "");
        var req = new XMLHttpRequest();
        req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/accounts?$select=name&$filter=(_ccrm_managingteamid_value eq " + teamId + " and statecode eq 0)", true);
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
                    if (results.value.length === 1) {
                        //If the Team manages only 1 organisation, then pre-populate that organisation in the Organisation lookup
                        var orgId = results.value[0]["accountid"];
                        var orgName = results.value[0]["name"];

                        formContext.getAttribute("arup_organsationid").setValue([
                            {
                                id: orgId,
                                name: orgName,
                                entityType: "account"
                            }
                        ]);

                    }

                } else {
                    var alertStrings = { confirmButtonLabel: "OK", text: this.statusText, title: "Alert" };
                    var alertOptions = { height: 120, width: 260 };
                    Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
                }
            }
        };
        req.send();
    }
}