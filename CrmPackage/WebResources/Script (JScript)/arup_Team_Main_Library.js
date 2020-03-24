function openFOPForm() {
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

function refreshRibbonOnChange() {
    Xrm.Page.ui.refreshRibbon();
}


function ShowHideOrganisationSubGrid() {
    var teamCategory = Xrm.Page.getAttribute("arup_teamcategory").getValue();
    if (teamCategory != null && teamCategory == 770000000) {
        if (Xrm.Page.getControl('Organisation_SubGrid'))
            Xrm.Page.getControl('Organisation_SubGrid').setVisible(true);
        Xrm.Page.getControl('FieldOfPlay_SubGrid').setVisible(true);
    } else {
        if (Xrm.Page.getControl('Organisation_SubGrid'))
            Xrm.Page.getControl('Organisation_SubGrid').setVisible(false);
        Xrm.Page.getControl('FieldOfPlay_SubGrid').setVisible(false);
    }

}


