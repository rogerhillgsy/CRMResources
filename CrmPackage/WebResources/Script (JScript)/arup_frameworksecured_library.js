function form_OnLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    parent.formContext = formContext;
    setInterval(changeHeaderTileFormat, 1000);

    formContext.getAttribute('arup_affiliateentities').setRequiredLevel('required');
    formContext.getAttribute('arup_limitofliability').setRequiredLevel('required');
    formContext.getAttribute('arup_limitofliabilityincorporatedin').setRequiredLevel('required');
    formContext.getAttribute('arup_additionalservices').setRequiredLevel('required');
    formContext.getAttribute('arup_scopeobligations').setRequiredLevel('required');
    formContext.getAttribute('arup_pointstobeagreed').setRequiredLevel('required');
    formContext.getAttribute('arup_insurancetype').setRequiredLevel('required');
    formContext.getAttribute('arup_piinsurancerequirement').setRequiredLevel('required');
    formContext.getAttribute('arup_standardofcare').setRequiredLevel('required');
    formContext.getAttribute('arup_righttosuspend').setRequiredLevel('required');
    formContext.getAttribute('arup_extraservices').setRequiredLevel('required');
    formContext.getAttribute('arup_additionalresources').setRequiredLevel('required');
    formContext.getAttribute('arup_delaydisruptionacceleration').setRequiredLevel('required');

    if (formContext.ui.getFormType() != 1) {
        parent.entityId = formContext.data.entity.getId();
    }
}
function OpenFrameworkRecord(formContext) {

    var frameworkId = formContext.getAttribute('arup_frameworkid').getValue()[0].id;
    
    if (frameworkId != null) {

        var entityFormOptions = {};
        entityFormOptions["entityName"] = "arup_framework";
        entityFormOptions["entityId"] = frameworkId;
        // Set default values for the Contact form
        Xrm.Navigation.openForm(entityFormOptions);
        return;
    }
}

function changeHeaderTileFormat() {

    //This may not be a supported way to change the header tile width
    var headertiles = window.parent.document.getElementsByClassName("ms-crm-HeaderTileElement");
    if (headertiles != null) {
        for (var i = 0; i < headertiles.length; i++) {
            headertiles[i].style.width = "450px";
            headertiles[i].style.maxWidth = "300px";
        }
    }
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
        '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the Framework.</br>Click "Exit Only" button to exit the Framework without saving.</font>',
        [
            {
                label: "<b>Save and Exit</b>",
                callback: function () {
                    var acctAttributes = formContext.data.entity.attributes.get();
                    var highlight = true;
                    var cansave = true;
                    if (acctAttributes != null) {
                        for (var i in acctAttributes) {
                            if (acctAttributes[i].getRequiredLevel() == 'required') {
                                highlight = formContext.getAttribute(acctAttributes[i].getName()).getValue() != null;
                                if (highlight == false && cansave == true) { cansave = false; }

                            }
                        }
                    }
                    if (cansave) { formContext.data.entity.save("saveandclose"); }
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
        'Warning',
        600,
        250,
        formContext.context.getClientUrl(),
        true);
}

