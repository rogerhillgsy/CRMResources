var globalContext = Xrm.Utility.getGlobalContext();
var connectedFromArray;
var connectedToArray;

function formOnLoad(executionContext) {
    formContext = executionContext.getFormContext();

    //check if the connected From is Filled in
    var connectedFrom = formContext.getAttribute("record1id").getValue();
    if (connectedFrom != null) {
        formContext.ui.tabs.get("info").sections.get("info_section_1").setVisible(false);

        setConnectionValues(formContext);

        if (connectedFrom[0].entityType == "contact")
            filterLookups(formContext);

        displayFormSections(formContext, true);
    } else {
        connectedFromArray = formContext.getControl("record1id").getEntityTypes();
        connectedToArray = formContext.getControl("record2id").getEntityTypes();
        displayFormSections(formContext, false);
    }
}

function displayFormSections(formContext, displayValue) {
    formContext.ui.tabs.get("info").sections.get("info_section_2").setVisible(displayValue);
    formContext.ui.tabs.get("info").sections.get("info_section_3").setVisible(displayValue);
    formContext.ui.tabs.get("info").sections.get("info_section_4").setVisible(displayValue);
    formContext.ui.tabs.get("info").sections.get("description").setVisible(displayValue);
}

function isConnecting_User_to_Contact(executionContext) {
    var formContext = executionContext.getFormContext();

    //if the value is yes, connect user to the Contact
    var connectContacttoUser = formContext.getAttribute("arup_connectingusertocontact").getValue();
    if (connectContacttoUser == 1) {
        setConnectionValues(formContext);
        filterLookups(formContext);
    } else if (connectContacttoUser == 0) {
        removeFilterLookups(formContext);
    }

    displayFormSections(formContext, true);
}

function setConnectionValues(formContext) {
    Xrm.WebApi.online.retrieveRecord("connectionrole", "f42aa3aa-fd3a-e211-8e0f-005056af0014", "?$select=connectionroleid,name").then(
        function success(result) {
            SetLookupField(formContext, result["connectionroleid"], result["name"], 'connectionrole', 'record1roleid');
            SetLookupField(formContext, result["connectionroleid"], result["name"], 'connectionrole', 'record2roleid');
        },
        function (error) {
            Xrm.Navigation.openAlertDialog(error.message);
        }
    );
    SetLookupField(formContext, globalContext.userSettings.userId, globalContext.userSettings.userName, 'systemuser', 'record2id');
}

function filterLookups(formContext) {
    formContext.getControl('record1id').addPreSearch(function () {
        formContext.getControl("record1id").setEntityTypes(["contact"]);
    });
    formContext.getControl('record2id').addPreSearch(function () {
        formContext.getControl("record2id").setEntityTypes(["systemuser"]);
    });
}

function removeFilterLookups(formContext) {
    formContext.getControl('record1id').addPreSearch(function () {
        formContext.getControl("record1id").setEntityTypes(connectedFromArray);
    });
    formContext.getControl('record2id').addPreSearch(function () {
        formContext.getControl("record2id").setEntityTypes(connectedToArray);
    });
}

function SetLookupField(formContext, id, name, entity, field) {
    if (id != null) {
        if (id.indexOf('{') == -1)
            id = '{' + id;
        if (id.indexOf('}') == -1)
            id = id + '}';
        id = id.toUpperCase();

        var lookup = new Array();
        lookup[0] = new Object();
        lookup[0].id = id;
        lookup[0].name = name;
        lookup[0].entityType = entity;
        formContext.getAttribute(field).setValue(lookup);
    } else {
        formContext.getAttribute(field).setValue(null);
    }
}