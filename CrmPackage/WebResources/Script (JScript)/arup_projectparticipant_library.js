function FormOnload() {

    setup_display_other_field("arup_participantrole_val", "arup_role_other_text", "770000061");
    //setTimeout(function () { WindowSizw(); }, 2000);

}

function setup_display_other_field(otherNetworksVal, otherNetworksDetail, otherCodeValue, isToBeHidden) {
    /// <summary>Setup multi-select picklist so that when "other" is selected, a text field is activated to allow the user to enter the details.</summary>
    var isOtherFieldRequired = otherCodeValue;
    if (typeof (otherCodeValue) != "function") {
        isOtherFieldRequired = function (v) { return typeof (v) == "string" && v.search(otherCodeValue) > -1 || v == otherCodeValue };
    }
    isToBeHidden = isToBeHidden == null ? true : isToBeHidden;
    var attribute = Xrm.Page.getAttribute(otherNetworksVal);
    if (!!attribute) {
        attribute.addOnChange(function () {
            display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
        });

        // Do this twice as header fields get their requirement level set after the onload function runs.
        display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
        setTimeout(function () {
            display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
        },
            1000);
    }
}
function WindowSizw() {
    $(document).ready(function () {
        var _win = window.self;
        _win.resizeTo(4000, 700);

        //resizePage();

    });   //window.moveTo(5, 5);
}

function resizePage() {
    var width = 600;
    var height = 400;
    window.resizeTo(width, height);
    window.moveTo(((screen.width - width) / 2), ((screen.height - height) / 2));
}

function display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden) {
    var value = Xrm.Page.getAttribute(otherNetworksVal).getValue();
    var otherNetworkDetails = Xrm.Page.getControl(otherNetworksDetail);

    if (!!otherNetworkDetails) {
        if (!!value && isOtherFieldRequired(value)) {
            otherNetworkDetails.getAttribute().setRequiredLevel("required");
            otherNetworkDetails.setVisible(true);
        } else {
            otherNetworkDetails.getAttribute().setRequiredLevel("none");
            if (isToBeHidden) {
                otherNetworkDetails.setVisible(false);
            }
        }
    }
}

// runs on Exit button
function exitForm() {

    //see if the form is dirty
    var ismodified = Xrm.Page.data.entity.getIsDirty();
    if (ismodified == false) {
        Xrm.Page.ui.close();
        return;
    }

    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
        '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the Project Collaborator form.</br>Click "Exit Only" button to exit the record without saving.</font>',
        [
            {
                label: "<b>Save and Exit</b>",
                callback: function () {
                    var acctAttributes = Xrm.Page.data.entity.attributes.get();
                    var highlight = true;
                    var cansave = true;
                    if (acctAttributes != null) {
                        for (var i in acctAttributes) {
                            if (acctAttributes[i].getRequiredLevel() == 'required') {
                                highlight = Xrm.Page.getAttribute(acctAttributes[i].getName()).getValue() != null;
                                if (highlight == false && cansave == true) { cansave = false; }
                            }
                        }
                    }
                    if (cansave) { Xrm.Page.data.entity.save("saveandclose"); }
                },
                setFocus: true,
                preventClose: false
            },
            {
                label: "<b>Exit Only</b>",
                callback: function () {
                    //get list of dirty fields
                    var attributesList = Xrm.Page.data.entity.attributes.get();
                    if (attributesList != null) {
                        for (var i in attributesList) {
                            if (attributesList[i].getIsDirty()) {
                                Xrm.Page.getAttribute(attributesList[i].getName()).setSubmitMode("never");
                            }
                        }
                        setTimeout(function () { Xrm.Page.ui.close(); }, 1000);
                    }
                },
                setFocus: false,
                preventClose: false
            }
        ],
        'Warning', 600, 250, '', true);
}

function addNewProjectCollabotor() {
    var opportunity = Xrm.Page.getAttribute("arup_opportunity").getValue();
    if (opportunity[0].id != null) {
        var ismodified = Xrm.Page.data.entity.getIsDirty();
        if (ismodified == false) {
            Xrm.Page.data.entity.save();
        }
        var parameters = {};
        parameters["arup_opportunity"] = opportunity[0].id;
        parameters["arup_opportunityname"] = opportunity[0].name;
        Xrm.Utility.openEntityForm(Xrm.Page.data.entity.getEntityName(), null, parameters);
    }
}
