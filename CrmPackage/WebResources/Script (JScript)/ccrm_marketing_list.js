function form_OnLoad() {

    if (Xrm.Page.ui.getFormType() == 1) {
        getUserDetails();
    }

    //Xrm.Page.getAttribute("ccrm_activemembers").setSubmitMode("never");
    //Xrm.Page.getAttribute("ccrm_inactivemembers").setSubmitMode("never");

    ///* count breakdown between active and inactive members only for static lists and existing records*/
    //if (Xrm.Page.ui.getFormType() != 1 && Xrm.Page.getAttribute("type").getValue() == '0') {

    //    var listGUID = Xrm.Page.data.entity.getId();
    //    SDK.REST.retrieveMultipleRecords("ListMember", "$select=EntityId&$filter=ListId/Id eq (guid'" + listGUID + "')",
    //    function (results) {

    //        var activeNum = 0; inactiveNum = 0;

    //        if (results.length > 0) {

    //            for (var i = 0; i < results.length; i++) {
    //                var result = results[i];
    //                var entity;
    //                var listType = Xrm.Page.getAttribute("createdfromcode").getValue();
    //                switch (listType) {
    //                    case 1: entity = 'Account'; break;
    //                    case 2: entity = 'Contact'; break;
    //                    case 4: entity = 'Lead'; break;
    //                }
    //                if (entity != null) {
    //                    SDK.REST.retrieveRecord(result.EntityId.Id, entity, 'StateCode', null,
    //                        function (retrievedreq) {
    //                            statecode = retrievedreq.StateCode.Value;
    //                            if (statecode == '0') { activeNum++ }
    //                            else { inactiveNum++ };
    //                        }, errorHandler, false);
    //                }
    //            }

    //        }
    //        if (Xrm.Page.getAttribute("ccrm_activemembers").getValue() != activeNum || Xrm.Page.getAttribute("ccrm_inactivemembers").getValue() != inactiveNum) {
    //            Xrm.Page.getAttribute("ccrm_activemembers").setValue(activeNum);
    //            Xrm.Page.getAttribute("ccrm_inactivemembers").setValue(inactiveNum);
    //            //Xrm.Page.data.save();
    //        }
    //    },
    //    errorHandler,
    //    function () { },
    //    false);
    //}        
}

function form_OnSave() {

}

function getUserDetails() {

    var result = new Object();
    SDK.REST.retrieveRecord(Xrm.Page.context.getUserId(),
        "SystemUser", 'Ccrm_ArupRegionId,ccrm_arupofficeid', null,
        function (retrievedreq) {
            if (retrievedreq != null) {
                SetLookupField(retrievedreq.Ccrm_ArupRegionId.Id, retrievedreq.Ccrm_ArupRegionId.Name, 'ccrm_arupregion', 'ccrm_arupregion');
                SetLookupField(retrievedreq.ccrm_arupofficeid.Id, retrievedreq.ccrm_arupofficeid.Name, 'ccrm_arupoffice', 'ccrm_arupoffice');
            }
        },
        errorHandler, false);
}

function SetLookupField(id, name, entity, field) {
    var lookup = new Array();
    lookup[0] = new Object();
    lookup[0].id = id;
    lookup[0].name = name;
    lookup[0].entityType = entity;
    Xrm.Page.getAttribute(field).setValue(lookup);
}

function errorHandler(error) {

    alert("Something went wrong. Please contact CRM Support and note this message: " + error.message);

}

