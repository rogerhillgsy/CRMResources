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
function oppoProgressFnCJN() {
    fnBtnAddNewJobNumber();
}
function oppoProgressFnCJNSuffix() {
    fnBtnAddNewJobNumberSuffix();
}

function oppoProgressFnResetCJNGateway() {
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

//"Bid Site" button
function DWBidsButtonVisibility() {
    var internalOpportunity = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();
    if (Xrm.Page.getAttribute("arup_bidsiterequested").getValue() == true && !internalOpportunity)
        return true;
    else
        return false;
}

function OpenDWBidsSite() {
    OpenDWBidsSiteLink();
}

function RequestDWBidsSite() {
    ProvisionDWBidsSite();
}

//"Request Bid Site" button 
function DWBidSiteRequestVisibility() {
    var activeStage = Xrm.Page.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var internalOpportunity = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();

    if (Xrm.Page.getAttribute("arup_bidsiterequested").getValue() != null &&
        Xrm.Page.getAttribute("arup_bidsiterequested").getValue() == false &&
        Xrm.Page.getAttribute("statecode").getValue() == 0 && (activeStageId != ArupStages.BidSubmitted) && (activeStageId != ArupStages.ConfirmJob) && !IsCJNApprovalStage(activeStageId))
        return true;
    else
        return false;
}

function debug() {
    /// <summary>Drop into debugger from ribbon code.</summary>
    debugger;
}

//function onFormLoad() {
//    Xrm.Page.data.process.addOnStageSelected(ribbonRefresh);
//}

//function ribbonRefresh() {
//    Xrm.Page.ui.refreshRibbon();
//}

function hideButtonProjectCollaborator() {
    var activeStage = Xrm.Page.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var internalOpportunity = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();
    if (activeStageId == ArupStages.Lead || internalOpportunity) {
        return false;
    }
    else {
        return true;
    }
}

function hideButtonBidDecisionApproval() {
    var regionName, bidDecisionOutcome, internalOpportunity;
    var activeStage = Xrm.Page.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var statecode = Xrm.Page.getAttribute('statecode').getValue();

    if (Xrm.Page.getAttribute("ccrm_arupregionid").getValue() != null)
       regionName = Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name;
    bidDecisionOutcome = Xrm.Page.getAttribute("arup_biddecisionoutcome").getValue();
    internalOpportunity = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();
    var opptype = Xrm.Page.getAttribute("arup_opportunitytype").getValue();

    return (
    (activeStageId == ArupStages.Lead) &&
    (regionName == ArupRegionName.UKMEA || regionName == ArupRegionName.Americas || regionName == ArupRegionName.Europe) &&
    statecode == 0 && !internalOpportunity && opptype != '770000005' && bidDecisionOutcome == '770000000'
        )   
}

function hideButtonSimiliarBids() {
    var statecode = Xrm.Page.getAttribute('statecode').getValue();
    if (statecode > 0)
        return false
    else
        return true;
}

function hideButtonCloseAsWonNoCJN() {
    var activeStage = Xrm.Page.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var statecode = Xrm.Page.getAttribute('statecode').getValue();
    
    if (
        (activeStageId == ArupStages.ConfirmJobApproval || activeStageId == ArupStages.ConfirmJobApproval1 || activeStageId == ArupStages.ConfirmJobApproval2 || activeStageId == ArupStages.ConfirmJobApproval3 || activeStageId == ArupStages.ConfirmJob) && statecode == 0
        
        ) {
        return true;
    }
    return false;
    
}

function hideButtonCloseAsWonCJNNeeded() {
    var arupGroupDetails = GetArupGroupCode();
    var activeStage = Xrm.Page.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var statecode = Xrm.Page.getAttribute('statecode').getValue();
    var internalOpportunity = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();

    if (((activeStageId == ArupStages.Lead) || (activeStageId == ArupStages.CrossRegion) || (IsPJNApprovalStage(activeStageId)) || (activeStageId == ArupStages.BidDevelopment) || (activeStageId == ArupStages.BidReviewApproval) || (activeStageId == ArupStages.BidSubmitted)) || IsCJNApprovalStage(activeStageId) || statecode > 0 || (internalOpportunity && (arupGroupDetails.arupGroupCode != 'GC60' && arupGroupDetails.arupGroupCode !='GC25' ) )) {
        return false;
    }
    else {
        return true;
    }
}

function hideButtonCloseAsLost() {
    var activeStage = Xrm.Page.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var statecode = Xrm.Page.getAttribute('statecode').getValue();
    if ((activeStageId == ArupStages.Lead || activeStageId == ArupStages.CrossRegion || IsPJNApprovalStage(activeStageId) || activeStageId == ArupStages.BidDevelopment || activeStageId == ArupStages.BidReviewApproval) || statecode > 0 )
    {
        return false;
    }
    else {
        return true;
    }
}

function hideButtonCloseAsLostNoBid() {
    var activeStage = Xrm.Page.data.process.getActiveStage();
    var activeStageId = activeStage.getId();  
    var statecode = Xrm.Page.getAttribute('statecode').getValue();

    if ((activeStageId == ArupStages.BidSubmitted || activeStageId == ArupStages.ConfirmJob) || IsCJNApprovalStage(activeStageId) || statecode > 0) {
        return false;
    }
    else {
        return true;
    }
}

function hideButtonBidSubmitted() {
    var activeStage = Xrm.Page.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var statecode = Xrm.Page.getAttribute('statecode').getValue();
    var bidSubmittedDate = Xrm.Page.getAttribute("arup_bidsubmitteddate").getValue(); 
    var shwbidreviewappbtn = Xrm.Page.getAttribute("ccrm_shwbidreviewappbtn").getValue(); 

    if (activeStageId == ArupStages.Lead || activeStageId == ArupStages.CrossRegion || IsPJNApprovalStage(activeStageId) || activeStageId == ArupStages.BidDevelopment || activeStageId == ArupStages.BidSubmitted || activeStageId == ArupStages.ConfirmJob || IsCJNApprovalStage(activeStageId) || statecode > 0 || bidSubmittedDate != null || shwbidreviewappbtn) {
        return false;
    }
    else {
        return true;
    }
}

function hideButtonAddSuffix() {
    var internalOpportunity = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();
    var arupGroupDetails = GetArupGroupCode();
    if ((internalOpportunity && (arupGroupDetails.arupGroupCode != 'GC60' && arupGroupDetails.arupGroupCode != 'GC25'))) {
        return false;
    } else {
        return true;
    }
}

function IsCJNApprovalStage(stageid) {
    return ((stageid == ArupStages.ConfirmJobApproval) || (stageid == ArupStages.ConfirmJobApproval1) || (stageid == ArupStages.ConfirmJobApproval2) || (stageid == ArupStages.ConfirmJobApproval3));
}

function GetArupGroupCode() {
    var arupGroupDetails = new Object();
    var arupGroup = Xrm.Page.getAttribute("ccrm_arupgroupid").getValue(); 
    if (arupGroup != null && arupGroup != "undefined") {
        var arupGroupId = arupGroup[0].id.replace('{', '').replace('}', '');
        var req = new XMLHttpRequest();
        req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/ccrm_arupgroups(" + arupGroupId + ")?$select=ccrm_arupgroupcode", false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var result = JSON.parse(this.response);
                    arupGroupDetails.arupGroupCode = result["ccrm_arupgroupcode"];
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();
        return arupGroupDetails;
    }   
}


