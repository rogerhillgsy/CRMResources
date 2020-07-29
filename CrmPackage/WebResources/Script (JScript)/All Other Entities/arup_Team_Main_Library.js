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
        SetFieldsNotRequired(formContext, ["ccrm_relationshiptype", "ccrm_relationshipmanager"]);
    } else {
        SetupForRelationshipTeam(formContext);
        LockFields(formContext, ["arup_teamcategory"]);
    }
    formContext.getControl("Members").addOnLoad(HandleTeamGridUpdate); // Ensure that tabs are updated when member is added to team.

    // Ensure that the Team admin, manager and sponsor are all team members.
    EnsureIsTeamMember(formContext, "administratorid");
    EnsureIsTeamMember(formContext, "ccrm_relationshipmanager");
    EnsureIsTeamMember(formContext, "ccrm_arupsponsor");
    EnsureClientValuesSet(formContext);
    formContext.getControl("ccrm_arupsponsor").setDefaultView("{26B373CD-C7CC-E811-8115-005056B509E1}");    
}

function SetDefaultBusinessUnit(formContext) {
    Xrm.WebApi.retrieveMultipleRecords("businessunit", "?$select=businessunitid&$filter=name eq 'Arup'")
        .then(function resolve(results) {
            if (results.entities.length !== 1) teamLog(`Expected 1 business unit, not ${results.length}`);
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
            attribute.controls.forEach((e) => e.setDisabled(true));
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
        IfTeamMember(formContext, [thisTeam, 'Development', 'Global Data Quality'])
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
        hideFields(formContext, ["ccrm_clienttype", "ccrm_client_sustainability"], false);
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
                        teamLog(`User ${fullName}was not member of any teams`);
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
