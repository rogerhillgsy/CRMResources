(function () {
    Develop1_RibbonCommands_runDialogGrid = function (ids, objectTypeCode, dialogId) {
        if ((ids == null) || (!ids.length)) {
            alert(window.LOCID_ACTION_NOITEMSELECTED);
            return;
        }
        if (ids.length > 1) {
            alert(window.LOCID_GRID_TOO_MANY_RECORDS_IWF);
            return;
        }
        var rundialog = Mscrm.CrmUri.create('/cs/dialog/rundialog.aspx');
        rundialog.get_query()['DialogId'] = dialogId;
        rundialog.get_query()['ObjectId'] = ids[0];
        rundialog.get_query()['EntityName'] = objectTypeCode;
        openStdWin(rundialog, buildWinName(null), 615, 480, null);
    }
    Develop1_RibbonCommands_runDialogForm = function (objectTypeCode, dialogId) {
        var primaryEntityId = Xrm.Page.data.entity.getId();
        var rundialog = Mscrm.CrmUri.create('/cs/dialog/rundialog.aspx');
        rundialog.get_query()['DialogId'] = dialogId;
        rundialog.get_query()['ObjectId'] = primaryEntityId;
        rundialog.get_query()['EntityName'] = objectTypeCode;
        openStdWin(rundialog, buildWinName(null), 615, 480, null);
    }
})();