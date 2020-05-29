/* Legacy  - not used? */
function openFOPForm() {
    alert("Calling legacy function openFOPForm");
    var team = {
        entityType: "team",
        id: Xrm.Page.data.entity.getId(),
        name: Xrm.Page.getAttribute("name").getValue()
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

/* Legacy - not used? */
function refreshRibbonOnChange() {
    alert("Calling legacy function refreshRibbonOnChange");
    Xrm.Page.ui.refreshRibbon();
}

function formOnLoadTeams(executionContext) {
    // Ensure that Business unit is set to Arup
    var formContext = executionContext.getFormContext();
    SetDefaultBusinessUnit(formContext);
    SetFieldsNotRequiredOnNew(formContext);
    AddTeamCategoryChangeEvent(formContext);
}

function SetDefaultBusinessUnit(formContext) {
    Xrm.WebApi.retrieveMultipleRecords("businessunit", "?$select=businessunitid&$filter=name eq 'Arup'")
        .then(function resolve(results) {
            if (results.entities.length !== 1) console.log(`Expected 1 business unit, not ${results.length}`);
            var arup = [{ name : "Arup", entityType : "businessunit" }];
            arup[0].id = results.entities[0]["businessunitid"];
            formContext.getAttribute("businessunitid").setValue(arup);
        },
            function reject(xhr) {
                debugger;
                console.error("Failed to get Arup business unit record : " + xhr );
            });
}

function SetFieldsNotRequiredOnNew(formContext, required) {
    reuired = required || "none";
    formContext.getAttribute("ccrm_relationshiptype").setRequiredLevel(required);
    formContext.getAttribute("ccrm_relationshipmanager").setRequiredLevel(required);
}

function AddTeamCategoryChangeEvent(formContext) {
    formContext.getAttribute("arup_teamcategory").addOnChange(OnTeamCategoryChange);
}

function OnTeamCategoryChange(executionContext) {
    debugger;
    var formContext = executionContext.getFormContext();
    var teamCategory = formContext.getAttribute("arup_teamcategory").getValue();
    if (teamCategory === 770000000) { // Relationship Team
        // Set all sections of TeamSetup tab to visible.
        // Set all other tabs visible to apropriate people.
        // Make fields mandatory
        SetFieldsNotRequiredOnNewformContext, "required" );
    }
}