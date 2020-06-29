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
var teamLog = console.log.bind(window.console);
var teamError = console.error.bind(window.console);

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
    formContext.getControl("Members").addOnLoad(HandleTeamGridUpdate); // Ensure that tabs are updated when member is added to team.
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
                    teamLog(`Was not allowed team member : ${message}`);
                    SetTabVisibilty(formContext, "default");
                }
            );
        MakeAllSectionsVisible(formContext, "Team Set-Up");
        SetClientValues(formContext);
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

function SetClientValues(formContext) {
    var lco = formContext.getAttribute("ccrm_leadclientorganisation").getValue()[0];
    var ccrm_clienttype_formatted;
    var ccrm_clienttype;
    var clientsector;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: formContext.context.getClientUrl() + "/api/data/v9.1/accounts(" + lco.id.replace("{", "").replace("}", "") + ")?$select=ccrm_clienttype,arup_clientsector",
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
            XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        },
        async: false,
        success: function (data, textStatus, xhr) {
            var result = data;
            ccrm_clienttype = result["ccrm_clienttype"];
            ccrm_clienttype_formatted = result["ccrm_clienttype@OData.Community.Display.V1.FormattedValue"];
            clientsector = result["arup_clientsector@OData.Community.Display.V1.FormattedValue"];
        },
        error: function (xhr, textStatus, errorThrown) {
            Xrm.Utility.alertDialog(textStatus + " " + errorThrown);
        }
    });
    formContext.getAttribute("ccrm_clienttype").setValue(ccrm_clienttype);
    formContext.getAttribute("ccrm_client_sustainability").setValue(clientsector);
    LockFields(formContext, ["ccrm_clienttype", "ccrm_client_sustainability"]);
    hideFields(formContext, ["ccrm_clienttype", "ccrm_client_sustainability"], true);
    if (formContext.data.getIsDirty())
        formContext.data.save();
}

// runs on Exit button
function exitForm(primaryControl) {
    var formContext = primaryControl;
    //see if the form is dirty
    var ismodified = formContext.data.entity.getIsDirty();
    if (ismodified == false) {
        formContext.ui.close();
        return;
    }

    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
        '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit.</br>Click "Exit Only" button to exit without saving.</font>',
        [
            {
                label: "<b>Save and Exit</b>",
                callback: function () {
                        formContext.data.entity.save("saveandclose");
                },
                setFocus: true,
                preventClose: false
            },
            {
                label: "<b>Exit Only</b>",
                callback: function () {
                    //get list of dirty fields
                    var acctAttributes = formContext.data.entity.attributes.get();
                    if (acctAttributes != null) {
                        for (var i in acctAttributes) {
                            if (acctAttributes[i].getIsDirty()) {
                                formContext.getAttribute(acctAttributes[i].getName()).setSubmitMode("never");
                            }
                        }
                        setTimeout(function () { formContext.ui.close(); }, 1000);
                    }
                },
                setFocus: false,
                preventClose: false
            }
        ],
        'Warning', 600, 250, '', true);
}