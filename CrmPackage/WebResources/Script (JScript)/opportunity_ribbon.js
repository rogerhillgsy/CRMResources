function oppoProgressFnGateway() {
    //generic function call for other gateway buttons
    fnBtnProgressOpportunity("0");
}
function oppoProgressFnDTPGateway() {
    fnBtnProgressOpportunity("1");
}
function oppoProgressFnBRWPJNGateway() {
    fnBtnProgressOpportunity("2");
}
function oppoProgressFnBRGateway() {
    fnBtnProgressOpportunity("3");
}
function oppoProgressFnCJNGateway() {
    fnBtnProgressOpportunity("4");
}
function oppoProgressFnCJN()
{
fnBtnAddNewJobNumber();
}
function oppoProgressFnCJNSuffix()
{
fnBtnAddNewJobNumberSuffix();
}

function oppoProgressFnResetCJNGateway()
{
fnBtnResetConfirmedJobApprovalGateway();
}

function oppoProgressFnJobNumber() {
    fnBtnRequestJobNumber();
}
function oppoSharePointFnCreateSP() {
    fnBtnCreateSharePoint();
}
function oppoExclusivityFnExclusivityRequest() {
    fnBtnExclusivityRequest();
}
function DWBidsButtonVisibility() {
    if (Xrm.Page.getAttribute("arup_bidsiterequested").getValue() == true)
        return true;
    else
        return false;
}

function OpenDWBidsSite() {
    OpenDWBidsSiteLink();
}

function RequestDWBidsSite() {
debugger;
    ProvisionDWBidsSite();
}

function DWBidSiteRequestVisibility() {
    if (Xrm.Page.getAttribute("arup_bidsiterequested").getValue() != null &&
        Xrm.Page.getAttribute("arup_bidsiterequested").getValue() == false &&
        Xrm.Page.getAttribute("statecode").getValue() == 0)
        return true;
    else
        return false;
}

function debug() {
    /// <summary>Drop into debugger from ribbon code.</summary>
    debugger;
}