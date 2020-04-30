function onForm_Load() {

    setInterval(changeHeaderTileFormat, 1000);
}

function onForm_save(executionObj) {

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

function arup_confidential_onChange() {

    confidential = Xrm.Page.getAttribute("arup_issecured").getValue();
    message = "You have changed this folder's  access from " + (confidential == 0 ? 'Confidential' : 'Public') + ' to ' + (confidential == 0 ? 'Public' : 'Confidential') + '.</br>' +
        'All of the attached documents will become ' + (confidential == 0 ? 'Public' : 'Confidential') + '.</br></br>' +
        'Press OK to confirm your selection or Cancel to revert this folder back to ' + (confidential == 0 ? 'Confidential.' : 'Public.');

    Alert.show('<font size="6" color="#1979CA"><b>Security Confirmation</b></font>',
        '<font size="3" color="#000000">' + message + '</font>',
        [
            new Alert.Button("<b>OK</b>",
                function () {
                    //Xrm.Page.data.save().then(function () { Xrm.Page.data.refresh(); });
                    //setTimeout(function () { Xrm.Page.data.refresh(); }, 2000);
                    Xrm.Page.data.save();

                    //Xrm.Page.data.save().then(function() { Xrm.Page.data.refresh(false); }, null);

                },
                false, false),
            new Alert.Button("Cancel",
                function () {
                    Xrm.Page.getAttribute("arup_issecured").setValue(!confidential);
                    Alert.show('<font size="6" color="#2E74B5"><b>For your information</b></font>',
                        '<font size="3" color="#000000"></br>This folder has been reverted back to ' + (confidential == 0 ? 'Confidential' : 'Public') + '.</font>',
                        [
                            new Alert.Button("OK")
                        ],
                        "INFO", 500, 200, '', true);
                }, true, false)
        ],
        'QUESTION', 750, 250, '', true);
}