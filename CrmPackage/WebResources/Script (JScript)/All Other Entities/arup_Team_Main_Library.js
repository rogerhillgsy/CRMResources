/// <reference path="arup_exitFormFunctions.js"/>"

var teamLog = console.log.bind(window.console);
var teamError = console.error.bind(window.console);
const CREATE_FORM = 1;
String.prototype.normalizeGuid = function () {
    return this.replace(/[{}]/g, '');
}

function formOnLoadTeams(executionContext) {
    // Ensure that Business unit is set to Arup
    var formContext = executionContext.getFormContext();
    var formType = formContext.ui.getFormType();
    if (formType === CREATE_FORM) {
        SetDefaultBusinessUnit(formContext);
        SetFieldsNotRequired(formContext, ["ccrm_relationshiptype", "ccrm_relationshipmanager","ccrm_clientgrouping"]);
    } else {
        SetupForRelationshipTeam(formContext);
        LockFields(formContext, ["arup_teamcategory"]);
        SetFieldsNotRequired(formContext, ["ccrm_relationshiptype", "ccrm_relationshipmanager", "ccrm_clientgrouping"],"required");

    }
    formContext.getControl("Members").addOnLoad(HandleTeamGridUpdate); // Ensure that tabs are updated when member is added to team.

    // Ensure that the Team admin, manager and sponsor are all team members.
    EnsureIsTeamMember(formContext, "administratorid");
    EnsureIsTeamMember(formContext, "ccrm_relationshipmanager");
    EnsureIsTeamMember(formContext, "ccrm_arupsponsor");
    EnsureClientValuesSet(formContext);
    formContext.getControl("ccrm_arupsponsor").setDefaultView("{26B373CD-C7CC-E811-8115-005056B509E1}");    

    DisplayOtherField(formContext, 'arup_sdcommitmentto', 587320006, 'arup_sdcommitmentother');
    //DisplayOtherField(formContext, 'arup_verifiedcommitments', 587320005, 'arup_verifiedcommitmentother');
    //DisplayOtherField(formContext, 'arup_unverifiedcommitments', 587320004, 'arup_unverifiedcommitmentother');
    ClientCommitmentto_onChange(executionContext);
}

function SetDefaultBusinessUnit(formContext) {
    Xrm.WebApi.retrieveMultipleRecords("businessunit", "?$select=businessunitid&$filter=name eq 'Arup'")
        .then(function resolve(results) {
            if (results.entities.length !== 1) teamLog("Expected 1 business unit, not " + results.length);
            var arup = [{ name : "Arup", entityType : "businessunit" }];
            arup[0].id = results.entities[0]["businessunitid"];
            formContext.getAttribute("businessunitid").setValue(arup);
        },
            function reject(xhr) {
                debugger;
                teamError("Failed to get Arup business unit record : " + xhr );
            });
}

function SetFieldsNotRequired(formContext, notRequiredFields, required) {
    required = required || "none";
    for (var f = 0; f < notRequiredFields.length; f++) {
        var field = notRequiredFields[f];
        var attribute = formContext.getAttribute(field);
        if (!attribute) {
            teamError("Not able to find attribute to set required level: " + field);
        } else {
            attribute.setRequiredLevel(required);
        }
    }
}

function LockFields(formContext, lockFields, locked) {
    locked = typeof locked === "undefined" ? true : locked;
    for (var f = 0; f < lockFields.length; f++) {
        var field = lockFields[f];
        var attribute = formContext.getAttribute(field);
        if (!attribute) {
            teamError("Not able to find attribute to lock: " + field);
        } else {
            attribute.controls.forEach(function(e) { e.setDisabled(true) });
        }
    }
}

function hideFields(formContext, fieldsToHide, ishide) {
    ishide = ishide || false;
    for (var f = 0; f < fieldsToHide.length; f++) {
        var field = fieldsToHide[f];
        var attribute = formContext.getControl(field);
        if (!attribute) {
            teamError("Not able to find attribute to hide: " + field);
        } else {
            attribute.setVisible(ishide);
        }
    }
}

function HandleTeamGridUpdate(gridContext) {
    teamLog("Handling Grid Change");
    SetupForRelationshipTeam(gridContext.getFormContext());
}
function SetupForRelationshipTeam(formContext) {
    var teamCategory = formContext.getAttribute("arup_teamcategory").getValue();
    var thisTeam = formContext.getAttribute("name").getValue();
    if (teamCategory === 770000000) { // Relationship Team
        // Set all sections of TeamSetup tab to visible.
        // Set all other tabs visible to apropriate people.
        // Make fields mandatory
        IfTeamMember(formContext, [thisTeam, 'Development', 'Global Data Quality', 'Business Development Staff','Regional and Group board members'])
            .then(function resolve(results) {
                teamLog("Setting all tabs visible for user");
                SetTabVisibilty(formContext, "all");
            },
                function reject(message) {
                    teamLog("Current user is not part of this relationship team - just show team setup tabs.");
                    SetTabVisibilty(formContext, "default");
                }
            );
        MakeAllSectionsVisible(formContext, "Team Set-Up");
    }
    else {
        SetFieldsNotRequired(formContext, ["ccrm_relationshiptype", "ccrm_relationshipmanager", "ccrm_arup150", "ccrm_clientgrouping"]);
    }
}

function MakeAllSectionsVisible(formContext, targetTab) {
    const tabs = formContext.ui.tabs.get();
    for (let t in tabs) {
        if (Object.prototype.hasOwnProperty.call(tabs, t)) {
            const tab = tabs[t];
            const tabName = tab.getLabel();
            if (tabName === targetTab) {
                const sections = tab.sections.get();
                for (let s in sections) {
                    if (Object.prototype.hasOwnProperty.call(sections, s)) {
                        const section = sections[s];
                        section.setVisible(true);
                    }
                }
            }
        }
    }
}

function IfTeamMember(formContext, teams, userId) {
    userId = userId || Xrm.Utility.getGlobalContext().userSettings.userId;
    var p1 = new Promise(function(resolve, reject) {
        Xrm.WebApi.retrieveRecord("systemuser",
            userId,
            "?$select=fullname&$expand=teammembership_association($select=arup_teamcategory,name)")
            .then(
                function resolveInner(result) {
                    var fullName = result["fullname"];
                    // Evaluate if any of the returned teams are in the list of teams we are looking for.
                    if (result.teammembership_association.length === 0) {
                        teamLog("User " + fullName + " was not member of any teams");
                        reject("No Teams");
                    }
                    for (var a = 0; a < result.teammembership_association.length; a++) {
                        var teamName = result.teammembership_association[a]["name"];
                        if (teams.indexOf(teamName) > -1) {
                            // Found a match so resolve the promise.
                            resolve(result);
                            return;
                        }

                    }
                    // No match so reject
                    reject("No Matching team");
                },
                function rejectInner(xhr) {
                    debugger;
                    teamError("Failed to query CRM : " + xhr);
                    reject("Failed " + xhr);
                }
            );
    });
    return p1;
}

function SetTabVisibilty(formContext, scope) {
    if (scope === "all") {
        setTabVisibilityByList(formContext, null, ['Hidden fields']);
    } else {
        setTabVisibilityByList(formContext, ["Team Set-Up"]);
    }
}

function setTabVisibilityByList(formContext, include, exclude) {
    var tabs = formContext.ui.tabs.get();
    for (var t in tabs) {
        if (Object.prototype.hasOwnProperty.call(tabs, t)) {
            const tab = tabs[t];
            const tabName = tab.getLabel();
            if (!!include) {
                if (include.indexOf(tabName) > -1) {
                    tab.setVisible(true);
                } else {
                    tab.setVisible(false);
                }
            } else {
                tab.setVisible(true);
            }
            if (!!exclude && exclude.indexOf(tabName) > -1) {
                tab.setVisible(false);
            }
        }
    }
}

// Ensure that when the lead client organisation attribute is set we update dependent fields.
function EnsureClientValuesSet(formContext) {
    return new Promise(function(resolve, reject) {
            var targetField = formContext.getAttribute("ccrm_leadclientorganisation");
            targetField.addOnChange(
                function onChange(executionContext) {
                    var formContext = executionContext.getFormContext();
                    return SetClientValues(formContext);
                });
        SetClientValues(formContext);
        })
        .catch(function(e) {
            teamError("Failed to set lead client org dependent values \r\n" + e);
        });
}

function SetClientValues(formContext) {
    var lco = formContext.getAttribute("ccrm_leadclientorganisation").getValue();
    if (!lco) return;
    lco = lco[0].id.normalizeGuid();
    Xrm.WebApi.retrieveRecord("account",
            lco,
            "?$select=ccrm_clienttype,arup_clientsector")
        .then(function (result) {
            setField(formContext, result, "arup_clienttype", "ccrm_clienttype");
            setField(formContext, result, "arup_clientsectorforteam", "arup_clientsector");
        })
        .catch(function fail(e) {
            teamError("Error retrieving client values from lead org");
        });
}

function setField(formContext, results, targetAttribute, sourceField) {
    if (!sourceField) sourceField = targetAttribute;
    var attr = formContext.getAttribute(targetAttribute);
    if (!attr) {
        teamError("Target attribute " + targetAttribute + " did not exist");
        return;
    }
    var value;
    if (sourceField == "arup_clientsector") {
        if (!results[sourceField]) {
            value = null;
        }
        else {     
            value = results[sourceField].split(",");
            value = value.map(value => {
                return parseInt(value)
            })                        
        }
    }
    else {
        value = results[sourceField];       
    }

    if (!value) {
        teamError("Source field " + sourceField + " not found");
    }
    teamLog("Set attribute " + targetAttribute + ' to "' + value + '"');
     attr.setValue(value);
}

function EnsureIsTeamMember(formContext, attributeName) {
    // Need to ensure two things.
    // 1. That the user designated by the attribute is currently a member, and add them if they are not. (Deals with create issue)
    // 2. When the attribute value changes. Add the user to the team members grid. (But don't remove the old user from the grid.)
    // Use promises to ensure we don't hold up form load.
    var p = new Promise(function(resolve, reject) {
            var targetUser = formContext.getAttribute(attributeName);
            var thisTeam = formContext.getAttribute("name").getValue();

        if (!targetUser) return;

            // Deal with changes to user field.
            targetUser.addOnChange(
                function onChange(executionContext) {
                    var formContext = executionContext.getFormContext();
                    var formType = formContext.ui.getFormType();
                    if (formType !== CREATE_FORM) {
                        var newUser = executionContext.getEventSource();
                        var thisTeam = formContext.getAttribute("name").getValue();
                        if (!!newUser) newUser = newUser.getValue();
                        if (!!newUser) MakeTeamMember(formContext, newUser, thisTeam);
                    }
                });

            if ( !targetUser.getValue()) return; // No user value set, so ignore.
            var targetUserValue = targetUser.getValue();

            // Deal with creation issue - Team admin will not initially be a member.
            MakeTeamMember(formContext, targetUserValue, thisTeam);
        })
        .catch(function(e) {
            teamError("Failed to set default team member :" + attributeName + "\r\n" + e);
        });
}

function MakeTeamMember(formContext, user, team) {
    IfTeamMember(formContext, [team], user[0].id.normalize()).then(
        function isAlreadyTeamMember() {
            teamLog("OK - " + user[0].name + " is already team member");
        },
        function isNotTeamMember(e) {
            if (e === "No Matching team") {
                teamLog("Add " + user[0].name + " as member of team: " + team);
                return AddTeamMember(formContext, user[0], team);
            } else {
                teamError("Checking if team member :" + e.message);
            }
        });
}

function AddTeamMember(formContext, user, team) {
    var addMembersTeamRequest = {
        entity: formContext.data.entity.getEntityReference(),
        Members: [
            {
                systemuserid: user.id.normalizeGuid(),
                "@odata.type": "Microsoft.Dynamics.CRM.systemuser"
            }
        ],
        getMetadata: function() {
            return {
                boundParameter: "entity",
                parameterTypes: {
                    "entity": {
                        "typeName": "mscrm.team",
                        "structuralProperty": 5
                    },
                    "Members": {
                        "typeName": "Collection(mscrm.systemuser)",
                        "structuralProperty": 4
                    }
                },
                operationType: 0,
                operationName: "AddMembersTeam",
            };

        }
    }
    addMembersTeamRequest.entity.id = addMembersTeamRequest.entity.id.normalizeGuid();
    return Xrm.WebApi.online.execute(addMembersTeamRequest)
        .then(function success() {
                var grid = formContext.getControl("Members");
                grid.refresh();
            },
            function fail(e) {
                debugger;
                // If a user (e.g. owner, manager) has been disabled, then trying to add them automatically as a team member will fail.
                formContext.ui.setFormNotification(
                    "Could not add user " +
                    user.name +
                    " to the team. Check to see if this user has been disabled with a view to replacing them.",
                    "WARNING",
                    user.name);
                teamError("Failed to add user " + user.name + " to team " + team + "\r\n" + e.message);
            });
}


/**
 * @description Called from the command bar exit button
 * @param {any} formContext
 */
function exitForm(formContext) {
    ArupExit.exitForm(formContext, "team");
}


function showhideClientGroupingMatrixButton(formContext) {
    var ccrm_clientgrouping = formContext.getAttribute("ccrm_clientgrouping").getValue();
    if (ccrm_clientgrouping != undefined && ccrm_clientgrouping != null)
        return true;
    else
        return false;
}
function OpenClientGroupingMatrix(primaryControl) {
    var formContext = primaryControl;
    var clientgroupingID;
    if (formContext.data != null && formContext.getAttribute("ccrm_clientgrouping") != undefined && formContext.getAttribute("ccrm_clientgrouping") != null) {
        clientgroupingID = formContext.getAttribute("ccrm_clientgrouping").getValue()[0].id.replace('{', '').replace('}', '');
        var customParameters = encodeURIComponent("clientgroupingID=" + clientgroupingID);
        var windowOptions = { openInNewWindow: true, height: 800, width: 1200 };
        Xrm.Navigation.openWebResource('arup_clientgroupingmatrix', windowOptions, customParameters);
    }
}

// Ribbon function from legacy arup_teams.js
function openFOPForm(primaryControl) {
    var formContext = primaryControl;
    var team = {
        entityType: "team",
        id: formContext.data.entity.getId(),
        name: formContext.getAttribute("name").getValue()
    };

    // Set default values for the FOP form
    var formParameters = {};
    formParameters["arup_relationshipteamid"] = team.id;
    formParameters["arup_relationshipteamidname"] = team.name;

    var windowOptions = {
        openInNewWindow: true
    };

    //pop up form with default values
    Xrm.Utility.openEntityForm("arup_fieldofplay", null, formParameters, windowOptions);

}

function PlannedActivities_OnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    var plannedActivities = formContext.getAttribute("arup_plannedactivitieswithclient").getValue();

    if (plannedActivities != null) {
        formContext.getAttribute("arup_dateupdated").setValue(new Date());
    }
}

function SDActivities_OnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    var SDActivities = formContext.getAttribute("ccrm_actionsonsustainabilitywithclient").getValue();

    if (SDActivities != null) {
        formContext.getAttribute("arup_sddateupdated").setValue(new Date());
    }
}
function DisplayOtherField_ec(executionContext, mainMultiSelectFieldName, otherOptionSetValue, otherFieldName) {
    var formContext = executionContext.getFormContext();
    DisplayOtherField(formContext, mainMultiSelectFieldName, otherOptionSetValue, otherFieldName)
}

function DisplayOtherField(formContext, mainMultiSelectFieldName, otherOptionSetValue, otherFieldName) {
    var mainFieldSelectedValues = formContext.getAttribute(mainMultiSelectFieldName).getValue();
    var requiredLevel;

    if (mainFieldSelectedValues != null) {
        var otherOption = mainFieldSelectedValues.includes(otherOptionSetValue);
        if (otherOption) {
            formContext.getAttribute(otherFieldName).setRequiredLevel('required');
            formContext.getControl(otherFieldName).setDisabled(false);
        } else {
            formContext.getAttribute(otherFieldName).setRequiredLevel('none');
            formContext.getControl(otherFieldName).setDisabled(true);
            formContext.getAttribute(otherFieldName).setValue(null);
        }
    } else {
        formContext.getAttribute(otherFieldName).setRequiredLevel('none');
        formContext.getControl(otherFieldName).setDisabled(true);
        formContext.getAttribute(otherFieldName).setValue(null);
    }
}

function ClientCommitmentto_onChange(executionContext) {
    var formContext = executionContext.getFormContext();
    var commitmenttonetzeroemissions = formContext.getAttribute("ccrm_commitmenttonetzeroemissions").getValue();
    if (commitmenttonetzeroemissions) {
        ShowFields(formContext, true, "arup_verifiedcommitments", "arup_unverifiedcommitments", "arup_scopeofcommitment", "arup_verifiedcommitmentother", "arup_unverifiedcommitmentother");
        DisplayOtherField(formContext, 'arup_verifiedcommitments', 587320005, 'arup_verifiedcommitmentother');
        DisplayOtherField(formContext, 'arup_unverifiedcommitments', 587320004, 'arup_unverifiedcommitmentother');

    } else {
        ShowFields(formContext, false, "arup_verifiedcommitments", "arup_unverifiedcommitments", "arup_scopeofcommitment", "arup_verifiedcommitmentother","arup_unverifiedcommitmentother");
        ClearFields(formContext, "arup_verifiedcommitments", "arup_unverifiedcommitments", "arup_scopeofcommitment", "arup_verifiedcommitmentother", "arup_unverifiedcommitmentother");
    }

}

function ShowFields(formContext, isVisible, listOfFields) {
    /// <summary>Hide Show Fields</summary>
    /// <param name="fieldName">One or more field names that are to be enabled.</param>
    for (var field in arguments) {
        if (field != 0 && field != 1) {
            var control = formContext.getControl(arguments[field]);
            if (control != null) {
                control.setVisible(isVisible);
            }
        }
    }
}

function ClearFields(formContext, fieldName) {
    for (var field in arguments) {
        if (field != 0) {
            var attrName = arguments[field];
            var controlName = attrName;
            var control = formContext.getAttribute(controlName);
            if (control != null) {
                control.setValue(null);
            }
        }
    }
}

function MicrosoftTeams(primaryControl) {
    var formContext = primaryControl;
    var teamId = formContext.data.entity.getId().replace(/[{}]/g, "");
    var entityName = formContext.data.entity.getEntityName();
    var microsoftTeamsUrl = formContext.getAttribute("arup_microsoftteamsurl").getValue();
    var clientUrl = formContext.context.getClientUrl();
    if (microsoftTeamsUrl != null) {
        window.open(microsoftTeamsUrl, null, 800, 600, true, false, null);
    } else {
        if (teamId != null) {
            var customParameters = "&entId=" + teamId + "&clientUrl=" + clientUrl + "&entName=" + entityName;

            var pageInput = {
                pageType: "webresource",
                webresourceName: "arup_MicrosoftTeams",
                data: customParameters

            };
            var navigationOptions = {
                target: 2,
                width: 700,
                height: 500,
                position: 1
            };
            Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
                function success() {
                    formContext.data.entity.save();
                },
                function error() {
                }
            );
        }
    }
}

function clearMicrosoftTeamsUrl(primaryControl) {
    var formContext = primaryControl;
    var teamId = formContext.data.entity.getId().replace(/[{}]/g, "");
    var microsoftTeamsUrl = formContext.getAttribute("arup_microsoftteamsurl").getValue();
    if (microsoftTeamsUrl != null) {
        var entity = {};
        entity.arup_microsoftteamsurl = "";

        Xrm.WebApi.online.updateRecord("team", teamId, entity).then(
            function success(result) {
                var updatedEntityId = result.id;
                if (updatedEntityId)
                    Alert.show('<font size="6" color="#2E74B5"><b>Microsoft Teams</b></font>',
                        '<font size="3" color="#000000"></br>Microsoft Teams URL is now cleared.</br></br>Please click on the "Microsoft Teams" button to re-enter the new URL.</font>',
                        [
                            new Alert.Button("<b>OK</b>")
                        ], "INFO", 600, 220, formContext.context.getClientUrl(), true);
            },
            function (error) {
                XrmOpenAlertDialog(this.statusText);
            }
        );
    } 
}