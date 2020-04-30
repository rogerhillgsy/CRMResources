function launchWorkflowMulti(confirmMessage, workflowId, recordIds, reload, objectTypeCode) {

    // Check variables
    if (objectTypeCode == "") { return; }
    if (recordIds == "") { return; }

    // Show confirmation to user
    if (confirmMessage != "") {
        if (!confirm(confirmMessage)) { return; }
    }

    // Split recordID list into array (on comma)
    var aRecords = (recordIds + "").split(",");
    if (aRecords.length == 0) { return; }

    // Open dialog
    var url = prependOrgName("/_grid/cmds/dlg_runworkflow.aspx")
        + "?iObjType=" + CrmEncodeDecode.CrmUrlEncode(objectTypeCode)
        //    + "&amp;iTotal=" + CrmEncodeDecode.CrmUrlEncode(aRecords.length)
        + "&iTotal=" + CrmEncodeDecode.CrmUrlEncode(aRecords.length)
        + "&wfId=" + CrmEncodeDecode.CrmUrlEncode("{" + workflowId + "}") + ""
        + "&sIds=" + CrmEncodeDecode.CrmUrlEncode(recordIds);

    var oresult = openStdDlg(url, aRecords, 500, 200);

    if (reload) { window.location.reload(true); }

}

function OpenContactOverviewReport() {
    var rdlName = "Contact%20Overview.rdl";
    var reportGuid = "eec67984-4624-e211-b0d7-005056af0014";
    var entityType = "2";
    var entityGuid = Xrm.Page.data.entity.getId();
    var url = Xrm.Page.context.getClientUrl() + "/crmreports/viewer/viewer.aspx?action=run&context=records&helpID=" + rdlName + "&id={" + reportGuid + "}&records=" + entityGuid + "&recordstype=" + entityType;
    window.open(url, null, 800, 600, true, false, null);
}