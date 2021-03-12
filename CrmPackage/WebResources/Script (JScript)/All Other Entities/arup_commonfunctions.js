function DisableAllControlsInTab(formContext,tabName) {
    var tabControl = formContext.ui.tabs.get(tabName);
    if (tabControl != null) {
        formContext.ui.controls.forEach(
            function (control, index) {
                if (control != null && control.getParent() != null && control.getParent().getParent() != null) {
                    if (control.getParent().getParent() == tabControl && control.getControlType() != "subgrid") {
                        control.setDisabled(true);
                    }
                }
            });
    }
}

function RemoveOptionFromOptionSet(formContext, optionSetName, listOfOptions) {
    for (var field in arguments) {
        if (field != 0 && field != 1) { // first argument is formContext.2nd argument is optionset name. So do not consider it as field 
            var control = formContext.getControl(optionSetName);
            if (control != null) {
                control.removeOption(arguments[field])
            }
        }
    }
}

function DisplayWebResource(webResourceName,customParameters,height,width) {
    var pageInput = {
        pageType: "webresource",
        webresourceName: webResourceName,// "arup_PopUp",
        data: customParameters

    };
    var navigationOptions = {
        target: 2,
        width: width,
        height: height,
        position: 1
    };
    Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
        function success(returnValue) {
        },
        function error() {
            // Handle errors
        }
    );

    return;
}