function onSave() {
    var ownername = Xrm.Page.getAttribute("arup_dashboardowner").getValue()[0].name;
    var dashboard = Xrm.Page.getAttribute("arup_subscriptiontype").getSelectedOption().text;
    Xrm.Page.getAttribute("arup_name").setValue(dashboard + " - " + ownername);
    Xrm.Page.getAttribute("arup_name").setSubmitMode("always");
}