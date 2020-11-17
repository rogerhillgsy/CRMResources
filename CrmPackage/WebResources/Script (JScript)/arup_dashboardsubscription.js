function onSave(executionContext) {
    var formContext = executionContext.getFormContext();
    var ownername = formContext.getAttribute("arup_dashboardowner").getValue()[0].name;
    var dashboard = formContext.getAttribute("arup_subscriptiontype").getSelectedOption().text;
    formContext.getAttribute("arup_name").setValue(dashboard + " - " + ownername);
    formContext.getAttribute("arup_name").setSubmitMode("always");
}