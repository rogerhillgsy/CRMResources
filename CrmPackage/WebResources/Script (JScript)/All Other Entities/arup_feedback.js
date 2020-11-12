// runs on Exit button
function exitForm(primaryControl) {
    var formContext = primaryControl;
    //see if the form is dirty
    var ismodified = formContext.data.entity.getIsDirty();
    var clientURL = formContext.context.getClientUrl();
    if (ismodified == false) {
        formContext.ui.close();
        return;
    }

    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
        '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the Appointment.</br>Click "Exit Only" button to exit the Appointment without saving.</font>',
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
                    var attributesList = formContext.data.entity.attributes.get();
                    if (attributesList != null) {
                        for (var i in attributesList) {
                            if (attributesList[i].getIsDirty()) {
                                formContext.getAttribute(attributesList[i].getName()).setSubmitMode("never");
                            }
                        }
                        setTimeout(function () { formContext.ui.close(); }, 1000);
                    }
                },
                setFocus: false,
                preventClose: false
            }
        ],
        'Warning', 600, 250, clientURL, true);
}


function onForm_Load(executionContext) {

    var formContext = executionContext.getFormContext();
    changeLookFor(formContext, 'ownerid', 'systemuser');
}
function changeLookFor(formContext, fieldName, entityname) {

    var control = formContext.getControl(fieldName);
    control.setEntityTypes([entityname]);
}