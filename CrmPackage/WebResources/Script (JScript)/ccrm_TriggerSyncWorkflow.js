function TriggerWorkflow() {
    var a = new Array(crmFormSubmit.crmFormSubmitId.value);
    var sIds = crmFormSubmit.crmFormSubmitId.value + ";";
    var sEntityTypeCode = "2"; //Replace this with your entity type code
    var sWorkflowId = "{E64111D4-BFF6-4877-92FB-825D3658E7AE}"; //Replace this with your actual workflow ID
    var iWindowPosX = 500; //Modal dialog position X
    var iWindowPosY = 200; //Modal dialog position Y
    var oResult = openStdDlg(prependOrgName("/_grid/cmds/dlg_runworkflow.aspx") + "?iObjType=" + CrmEncodeDecode.CrmUrlEncode(sEntityTypeCode) + "&iTotal=" + CrmEncodeDecode.CrmUrlEncode(a.length) + "&wfId=" + CrmEncodeDecode.CrmUrlEncode(sWorkflowId) + "&sIds=" + CrmEncodeDecode.CrmUrlEncode(sIds), a, iWindowPosX, iWindowPosY);
}