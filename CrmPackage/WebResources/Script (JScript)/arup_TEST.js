function tester() {
    debugger;
    var accID = Xrm.Page.getControl("ccrm_client").getVisible();
    var cc = Xrm.Page.data.entity.getId();
    var val = Xrm.Page.getAttribute("ccrm_client");
}