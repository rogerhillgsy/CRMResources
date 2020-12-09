function form_OnLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    parent.formContext = formContext;
    setInterval(changeHeaderTileFormat, 1000);
    multiDiscipline_onChange(executionContext);
    if (formContext.ui.getFormType() != 1) {
        parent.formContext.entityReference.id = formContext.data.entity.getId();
        RefreshWebResource(formContext, "WebResource_FrameworkButton");
    }
}
function OnSave(executionContext) {
    var formContext = executionContext.getFormContext();
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

function openSecuredFramework(primaryControl) {
    var formContext = primaryControl;
    var frameworkId = formContext.entityReference.id.replace('{', '').replace('}', '');
    if (frameworkId == null) return;

    // check if arup_frameworksecured record has already been created
    var frameworkIdSecured = findSecureRecord(frameworkId, formContext);
    // open a form with existing record in it
    if (frameworkIdSecured != null) {

        var entityFormOptions = {};
        entityFormOptions["entityName"] = "arup_frameworksecured";
        entityFormOptions["entityId"] = frameworkIdSecured;
        // Set default values for the Contact form
        Xrm.Navigation.openForm(entityFormOptions);
        return;
    }

    var ownerName = formContext.getAttribute("ownerid").getValue()[0].name;
    var creatorName = formContext.getAttribute("createdby").getValue()[0].name;
    var message = (ownerName == creatorName) ? 'Contact ' + ownerName + ' to request access.' : 'Contact either ' + ownerName + ' or ' + creatorName + ' to request access.';

    Alert.show('<font size="6" color="#FF0000"><b>Access Denied</b></font>',
        '<font size="3" color="#000000">You do not have permission to view Framework details. <br><br>' + message + '</font>',
        [
            { label: "<b>OK</b>", setFocus: true },
        ], "ERROR", 500, 200, formContext.context.getClientUrl(), true);

}

function findSecureRecord(frameWorkId, formContext) {

    var req = new XMLHttpRequest();
    var arup_frameworksecuredid = null;
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/arup_frameworksecureds?$select=arup_frameworksecuredid&$filter=_arup_frameworkid_value eq " + frameWorkId, false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                for (var i = 0; i < results.value.length; i++) {
                    arup_frameworksecuredid = results.value[i]["arup_frameworksecuredid"];
                    break;
                }
            } else {
                Xrm.Navigation.openAlertDialog(this.statusText);
            }
        }
    };
    req.send();
    return arup_frameworksecuredid;

}

function OpenAttachmentPage(primaryControl) {
    var formContext = primaryControl;
    var url = "WebResources/arup_UploadAttachments?id=" + formContext.data.entity.getId() + "&typename=arup_framework&data=FrameWorkFoldersGrid";
    window.open(url, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=600,height=400");

}

function errorHandler(error) {

    alert("Something went wrong. Please contact CRM Support and note this message: " + error.message);

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
        'Warning', 600, 250, formContext.context.getClientUrl(), true);
}

function multiDiscipline_onChange(executionContext) {

    var formContext = executionContext.getFormContext();

    var multiDiscipline = formContext.getAttribute("arup_multidisciplinary").getValue();
    switch (multiDiscipline) {

        case true:
            formContext.getControl("arup_disciplines_ms").setVisible(false);
            formContext.getAttribute("arup_disciplines_ms").setRequiredLevel('none');
            formContext.getAttribute("arup_disciplines_ms").setValue(null);
            break;

        default:
            formContext.getControl("arup_disciplines_ms").setVisible(true);
            formContext.getAttribute("arup_disciplines_ms").setRequiredLevel('required');
            break;
    }

}

function RefreshWebResource(formContext, webResourceName) {
    var webResource = formContext.getControl(webResourceName);
    if (webResource != null) {
        var src = webResource.getSrc();

        var aboutBlank = "about:blank";
        webResource.setSrc(aboutBlank);

        setTimeout(function () {
            webResource.setSrc(src);
        }, 1000);
    }
}