function form_OnLoad() {

    setInterval(changeHeaderTileFormat, 1000);
    
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

function openSecuredFramework() {

    var frameworkId = Xrm.Page.data.entity.getId().replace('{', '').replace('}', '');
    if (frameworkId == null) return;

    // check if arup_frameworksecured record has already been created
    var frameworkIdSecured = findSecureRecord(frameworkId);
    // open a form with existing record in it
    if (frameworkIdSecured != null) {
        Xrm.Utility.openEntityForm("arup_frameworksecured", frameworkIdSecured);
        return;
    }

    var ownerName = Xrm.Page.getAttribute("ownerid").getValue()[0].name;
    var creatorName = Xrm.Page.getAttribute("createdby").getValue()[0].name;
    var  message = (ownerName == creatorName) ? 'Contact ' + ownerName + ' to request access.' : 'Contact either ' + ownerName + ' or ' + creatorName + ' to request access.';
   
    Alert.show('<font size="6" color="#FF0000"><b>Access Denied</b></font>',
    '<font size="3" color="#000000">You do not have permission to view Framework details. <br><br>' + message + '</font>',
    [
        { label: "<b>OK</b>", setFocus: true },
    ], "ERROR", 500, 200, '', true);

}

function findSecureRecord(frameWorkId) {

    var req = new XMLHttpRequest();
    var arup_frameworksecuredid = null;
    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/arup_frameworksecureds?$select=arup_frameworksecuredid&$filter=_arup_frameworkid_value eq " + frameWorkId, false);
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
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
    return arup_frameworksecuredid;

}

function OpenAttachmentPage() {

    var url = "WebResources/arup_UploadAttachments?id=" + Xrm.Page.data.entity.getId() + "&typename=arup_framework&data=FrameWorkFoldersGrid";
    window.open(url, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=600,height=400");

}

function errorHandler(error) {

    alert("Something went wrong. Please contact CRM Support and note this message: " + error.message);

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