function DisableAllControlsInTab(formContext,tabName) {
    var tabControl = formContext.ui.tabs.get(tabName);
    if (tabControl != null) {
        formContext.ui.controls.forEach(
            function (control, index) {
                if (control.getParent().getParent() == tabControl && control.getControlType() != "subgrid") {
                    control.setDisabled(true);
                }
            });
    }
}