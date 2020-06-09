///<reference path="../Intellisense/Xrm.Page.2013.js"/>

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
        var filter = "SystemUserId eq (guid'" + formContext.context.getUserId() + "')";
        var dataset = "TeamMembershipSet";
        var retrievedMultiple = ConsultCrm.Sync.RetrieveMultipleRequest(dataset, filter);
        var results = retrievedMultiple.results;

        for (i = 0; i < results.length; i++) {
            var filterTeam = "TeamId eq (guid'" + results[i].TeamId + "')";
            var datasetTeam = "TeamSet";
            var retrievedMultipleTeam = ConsultCrm.Sync.RetrieveMultipleRequest(datasetTeam, filterTeam);
            var resultsTeam = retrievedMultipleTeam.results;
            if (resultsTeam[0].Name == TeamName) {
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
        req.open("GET", formContext.context.getClientUrl() + "/api/data/v8.2/accounts?$select=name&$filter=(_ccrm_managingteamid_value eq " + teamId + " and statecode eq 0)", true);
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