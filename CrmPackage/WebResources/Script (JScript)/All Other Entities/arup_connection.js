var globalContext = Xrm.Utility.getGlobalContext();

function formOnLoad(executionContext) {
    formContext = executionContext.getFormContext();
    //check if the connected From is Filled in
    var connectedFrom = formContext.getAttribute("record1id").getValue();
    if (connectedFrom != null) {      
        if (connectedFrom[0].entityType == "contact") {
            formContext.ui.tabs.get("info").sections.get("info_section_1").setVisible(false);
            formContext.getControl('record2id').addPreSearch(function () {
                formContext.getControl("record2id").setEntityTypes(["systemuser"]);
            });
            formContext.getControl('record1id').addPreSearch(function () {
                formContext.getControl("record1id").setEntityTypes(["contact"]);
            });
        }

        setConnectionValues(formContext);
    } else {
        displayFormSections(formContext);
    }
}

function displayFormSections(formContext) {
    //Check if the Option set is null, if so, hide the form sections
    var connectContacttoUser = formContext.getAttribute("arup_connectingusertocontact").getValue();
    if (connectContacttoUser == null) {
        formContext.ui.tabs.get("info").sections.get("info_section_2").setVisible(false);
        formContext.ui.tabs.get("info").sections.get("info_section_3").setVisible(false);
        formContext.ui.tabs.get("info").sections.get("info_section_4").setVisible(false);
        formContext.ui.tabs.get("info").sections.get("description").setVisible(false);

    } else {
        formContext.ui.tabs.get("info").sections.get("info_section_2").setVisible(true);
        formContext.ui.tabs.get("info").sections.get("info_section_3").setVisible(true);
        formContext.ui.tabs.get("info").sections.get("info_section_4").setVisible(true);
        formContext.ui.tabs.get("info").sections.get("description").setVisible(true);
    }
}

function isConnecting_User_to_Contact(executionContext) {
    var formContext = executionContext.getFormContext();

    displayFormSections(formContext);
    //if the value is yes, connect user to the Contact
    var connectContacttoUser = formContext.getAttribute("arup_connectingusertocontact").getValue();
    if (connectContacttoUser != null && connectContacttoUser == 1) {
        setConnectionValues(formContext);

        formContext.getControl('record1id').addPreSearch(function () {
            formContext.getControl("record1id").setEntityTypes(["contact"]);
        });
        formContext.getControl('record2id').addPreSearch(function () {
            formContext.getControl("record2id").setEntityTypes(["systemuser"]);
        });
    //} else {
    //    formContext.getControl('record1id').removePreSearch(function () {
    //        formContext.getControl("record1id").setEntityTypes(["account"]);
    //        formContext.getControl("record1id").setEntityTypes(["systemuser"]);
    //    });
    }
}


function setConnectionValues(formContext) {
    Xrm.WebApi.online.retrieveRecord("connectionrole", "f42aa3aa-fd3a-e211-8e0f-005056af0014", "?$select=connectionroleid,name").then(
        function success(result) {
            SetLookupField(formContext, result["connectionroleid"], result["name"], 'connectionrole', 'record1roleid');
            SetLookupField(formContext, result["connectionroleid"], result["name"], 'connectionrole', 'record2roleid');
            formContext.getAttribute("arup_connectingusertocontact").setValue(1);
        },
        function (error) {
            Xrm.Navigation.openAlertDialog(error.message);
        }
    );
    SetLookupField(formContext, globalContext.userSettings.userId, globalContext.userSettings.userName, 'systemuser', 'record2id');
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