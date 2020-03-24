function ChangeDefaultLookupViewOnContactTypeChange()
{
var MyValue = Xrm.Page.getAttribute("stepname").getValue();
if (MyValue == "Lead")
{
 Xrm.Page.getControl("ccrm_accountingcentreid").setDefaultView("DD2CA8B2-364F-4BB5-ACCA-710837F99261");
}
if (MyValue != "Lead")
{
Xrm.Page.getControl("ccrm_accountingcentreid").setDefaultView("45F07848-C04D-4A72-A9DA-FF0BC11CB822");
}
}

function SetDefaultCustomerLookupOnPageLoad()
{
Xrm.Page.getControl("ccrm_accountingcentreid").setDefaultView("DD2CA8B2-364F-4BB5-ACCA-710837F99261");
}