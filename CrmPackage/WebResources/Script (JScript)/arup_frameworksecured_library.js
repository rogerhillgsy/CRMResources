function form_OnLoad() {

    setInterval(changeHeaderTileFormat, 1000);

    Xrm.Page.getAttribute('arup_affiliateentities').setRequiredLevel('required');
    Xrm.Page.getAttribute('arup_limitofliability').setRequiredLevel('required');
    Xrm.Page.getAttribute('arup_limitofliabilityincorporatedin').setRequiredLevel('required');
    Xrm.Page.getAttribute('arup_additionalservices').setRequiredLevel('required');
    Xrm.Page.getAttribute('arup_scopeobligations').setRequiredLevel('required');
    Xrm.Page.getAttribute('arup_pointstobeagreed').setRequiredLevel('required');
    Xrm.Page.getAttribute('arup_insurancetype').setRequiredLevel('required');
    Xrm.Page.getAttribute('arup_piinsurancerequirement').setRequiredLevel('required');
    Xrm.Page.getAttribute('arup_standardofcare').setRequiredLevel('required');
    Xrm.Page.getAttribute('arup_righttosuspend').setRequiredLevel('required');
    Xrm.Page.getAttribute('arup_extraservices').setRequiredLevel('required');
    Xrm.Page.getAttribute('arup_additionalresources').setRequiredLevel('required');
    Xrm.Page.getAttribute('arup_delaydisruptionacceleration').setRequiredLevel('required');

}

function form_OnSave() {

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
function exitForm() {

    //see if the form is dirty
    var ismodified = Xrm.Page.data.entity.getIsDirty();
    if (ismodified == false) {
        Xrm.Page.ui.close();
        return;
    }

    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
        '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the Framework.</br>Click "Exit Only" button to exit the Framework without saving.</font>',
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
                    var acctAttributes = Xrm.Page.data.entity.attributes.get();
                    if (acctAttributes != null) {
                        for (var i in acctAttributes) {
                            if (acctAttributes[i].getIsDirty()) {
                                Xrm.Page.getAttribute(acctAttributes[i].getName()).setSubmitMode("never");
                            }
                        }
                        setTimeout(function () { Xrm.Page.ui.close(); }, 1000);
                    }
                },
                setFocus: false,
                preventClose: false
            }
        ],
        'Warning',
        600,
        250,
        '',
        true);
}

