function TriggerSync() {
    var a = new Array(crmFormSubmit.crmFormSubmitId.value);
    var sIds = crmFormSubmit.crmFormSubmitId.value + ";";
    var sEntityTypeCode = "3234"; //Replace this with your entity type code
    var sWorkflowId = "{C82DAC83-9F76-4B22-86D3-7A5DB8781EB5}"; //Replace this with your actual workflow ID
    var iWindowPosX = 500; //Modal dialog position X
    var iWindowPosY = 200; //Modal dialog position Y
    var oResult = openStdDlg(prependOrgName("/_grid/cmds/dlg_runworkflow.aspx") + "?iObjType=" + CrmEncodeDecode.CrmUrlEncode(sEntityTypeCode) + "&iTotal=" + CrmEncodeDecode.CrmUrlEncode(a.length) + "&wfId=" + CrmEncodeDecode.CrmUrlEncode(sWorkflowId) + "&sIds=" + CrmEncodeDecode.CrmUrlEncode(sIds), a, iWindowPosX, iWindowPosY);
}