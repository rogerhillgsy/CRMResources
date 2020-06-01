///* Legacy  - not used? */
//function openFOPForm() {
//    alert("Calling legacy function openFOPForm");
//    var team = {
//        entityType: "team",
//        id: Xrm.Page.data.entity.getId(),
//        name: Xrm.Page.getAttribute("name").getValue()
//    };

//    // Set default values for the FOP form
//    var formParameters = {};
//    formParameters["arup_relationshipteamid"] = team.id;
//    formParameters["arup_relationshipteamidname"] = team.name;

//    var windowOptions = {
//        openInNewWindow: true
//    };

//    //pop up form with default values
//    Xrm.Utility.openEntityForm("arup_fieldofplay", null, formParameters, windowOptions);

//}

///* Legacy - not used? */
//function refreshRibbonOnChange() {
//    alert("Calling legacy function refreshRibbonOnChange");
//    Xrm.Page.ui.refreshRibbon();
//}
function teamLog(s) {
    console.log(s);
}
function teamError(s) {
    console.error(s);
}

function formOnLoadTeams(executionContext) {
    // Ensure that Business unit is set to Arup
    const CREATE_FORM = 1;
    var formContext = executionContext.getFormContext();
    var formType = formContext.ui.getFormType();
    if (formType === CREATE_FORM) {
        SetDefaultBusinessUnit(formContext);
        SetFieldsNotRequired(formContext, ["ccrm_relationshiptype", "ccrm_relationshipmanager"]);
    } else {
        SetupForRelationshipTeam(formContext);
        LockFields(formContext, ["arup_teamcategory"]);
    }
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
    locked = locked|| true;
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
                    teamLog(`Was not allowed team member : ${message}`);
                }
        );
        MakeAllSectionsVisible(formContext, "Team Set-Up");
    }
}

function MakeAllSectionsVisible(formContext, targetTab) {
    debugger;
    const tabs = formContext.ui.tabs.get();
    for (let t in tabs) {
        if (Object.prototype.hasOwnProperty.call(tabs, t)) {
            const tab = tabs[t];
            const tabName = tab.getLabel();
            if (tabName === targetTab) {
                debugger;
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

function IfTeamMember(formContext, teams) {
    var userId = Xrm.Utility.getGlobalContext().userSettings.userId;
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
