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
function oppoProgressFnCJNSuffix(formContext) {
    fnBtnAddNewJobNumberSuffix(formContext);
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
function DWBidsButtonVisibility(formContext) {
    var internalOpportunity = formContext.getAttribute("ccrm_arupinternal").getValue();
    if (formContext.getAttribute("arup_bidsiterequested").getValue() == true && !internalOpportunity)
        return true;
    else
        return false;
}

function OpenDWBidsSite(formContext) {
    OpenDWBidsSiteLink(formContext);
}

function RequestDWBidsSite(formContext) {
    ProvisionDWBidsSite(formContext);
}

//"Request Bid Site" button 
function DWBidSiteRequestVisibility(formContext) {
    var activeStage = formContext.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var internalOpportunity = formContext.getAttribute("ccrm_arupinternal").getValue();

    if (formContext.getAttribute("arup_bidsiterequested").getValue() != null &&
        formContext.getAttribute("arup_bidsiterequested").getValue() == false &&
        formContext.getAttribute("statecode").getValue() == 0 && (activeStageId != ArupStages.BidSubmitted) && (activeStageId != ArupStages.ConfirmJob) && !IsCJNApprovalStage(activeStageId))
        return true;
    else
        return false;
}

function debug() {
    /// <summary>Drop into debugger from ribbon code.</summary>
}

//function onFormLoad() {
//    formContext.data.process.addOnStageSelected(ribbonRefresh);
//}

//function ribbonRefresh() {
//    formContext.ui.refreshRibbon();
//}

function hideButtonProjectCollaborator(formContext) {
    var activeStage = formContext.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var internalOpportunity = formContext.getAttribute("ccrm_arupinternal").getValue();
    if (activeStageId == ArupStages.Lead || internalOpportunity) {
        return false;
    }
    else {
        return true;
    }
}

function hideButtonBidDecisionApproval(formContext) {
    var regionName, bidDecisionOutcome, internalOpportunity;
    var activeStage = formContext.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var statecode = formContext.getAttribute('statecode').getValue();

    if (formContext.getAttribute("ccrm_arupregionid").getValue() != null)
        regionName = formContext.getAttribute("ccrm_arupregionid").getValue()[0].name;
    bidDecisionOutcome = formContext.getAttribute("arup_biddecisionoutcome").getValue();
    internalOpportunity = formContext.getAttribute("ccrm_arupinternal").getValue();
    var opptype = formContext.getAttribute("arup_opportunitytype").getValue();

    return (
        (activeStageId == ArupStages.Lead) &&
        (regionName == ArupRegionName.UKMEA || regionName == ArupRegionName.Americas || regionName == ArupRegionName.Europe) &&
        statecode == 0 && !internalOpportunity && opptype != '770000005' && bidDecisionOutcome == '770000000'
    )
}

function hideButtonSimiliarBids(formContext) {
    var statecode = formContext.getAttribute('statecode').getValue();
    if (statecode > 0)
        return false
    else
        return true;
}

function hideButtonCloseAsWonNoCJN(formContext) {
    var activeStage = formContext.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var statecode = formContext.getAttribute('statecode').getValue();
    var isCJNApprovalStage = IsCJNApprovalStage(activeStageId);
    var isFrameworkOpportunty = (formContext.getAttribute("arup_opportunitytype").getValue() == '770000003') ? true : false;
    var isFrameworkWon = formContext.getAttribute("arup_frameworkwon").getValue();

    if (
        ((isCJNApprovalStage && !isFrameworkOpportunty) || (activeStageId == ArupStages.ConfirmJob && !isFrameworkOpportunty) || (activeStageId == ArupStages.ConfirmJob && isFrameworkOpportunty && !isFrameworkWon) || (isCJNApprovalStage && isFrameworkOpportunty && !isFrameworkWon)) && statecode == 0

    ) {
        return true;
    }
    return false;

}

function hideButtonCloseAsWonCJNNeeded(formContext) {
    var arupGroupDetails = GetArupGroupCode(formContext);
    var activeStage = formContext.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var statecode = formContext.getAttribute('statecode').getValue();
    var internalOpportunity = formContext.getAttribute("ccrm_arupinternal").getValue();
    var isFrameworkWon = formContext.getAttribute("arup_frameworkwon").getValue();


    if (((activeStageId == ArupStages.Lead) || (activeStageId == ArupStages.CrossRegion) || (IsPJNApprovalStage(activeStageId)) || (activeStageId == ArupStages.BidDevelopment) || (activeStageId == ArupStages.BidReviewApproval) || (activeStageId == ArupStages.BidSubmitted)) || IsCJNApprovalStage(activeStageId) || statecode > 0 || isFrameworkWon || (internalOpportunity && (arupGroupDetails.arupGroupCode != 'GC60' && arupGroupDetails.arupGroupCode != 'GC25'))) {
        return false;
    }
    else {
        return true;
    }
}
function ShowButtonCloseFramework(formContext) {
    //var activeStage = formContext.data.process.getActiveStage();
    //var activeStageId = activeStage.getId();
    var statecode = formContext.getAttribute('statecode').getValue();
   // var isFrameworkOpportunty = (formContext.getAttribute("arup_opportunitytype").getValue() == '770000003') ? true : false;
    var isFrameworkWon = formContext.getAttribute("arup_frameworkwon").getValue();

    if (isFrameworkWon && statecode == 0)
   // if ((IsCJNApprovalStage(activeStageId) && isFrameworkOpportunty && statecode == 0) || (activeStageId == ArupStages.ConfirmJob && isFrameworkOpportunty && isFrameworkWon && statecode == 0))
        return true;
    else
        return false;
}

function hideButtonCloseAsLost(formContext) {
    var activeStage = formContext.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var statecode = formContext.getAttribute('statecode').getValue();
    var isFrameworkOpportunty = (formContext.getAttribute("arup_opportunitytype").getValue() == '770000003') ? true : false;
    var isFrameworkWon = formContext.getAttribute("arup_frameworkwon").getValue();

    if ((activeStageId == ArupStages.Lead || activeStageId == ArupStages.CrossRegion || IsPJNApprovalStage(activeStageId) || activeStageId == ArupStages.BidDevelopment || activeStageId == ArupStages.BidReviewApproval) || statecode > 0 ||  isFrameworkWon) {
        return false;
    }
    else {
        return true;
    }
}

function hideButtonCloseAsLostNoBid(formContext) {
    var activeStage = formContext.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var statecode = formContext.getAttribute('statecode').getValue();

    if ((activeStageId == ArupStages.BidSubmitted || activeStageId == ArupStages.ConfirmJob) || IsCJNApprovalStage(activeStageId) || statecode > 0) {
        return false;
    }
    else {
        return true;
    }
}

function hideButtonBidSubmitted(formContext) {
    var activeStage = formContext.data.process.getActiveStage();
    var activeStageId = activeStage.getId();
    var statecode = formContext.getAttribute('statecode').getValue();
    var bidSubmittedDate = formContext.getAttribute("arup_bidsubmitteddate").getValue();
    var shwbidreviewappbtn = formContext.getAttribute("ccrm_shwbidreviewappbtn").getValue();

    if (activeStageId == ArupStages.Lead || activeStageId == ArupStages.CrossRegion || IsPJNApprovalStage(activeStageId) || activeStageId == ArupStages.BidDevelopment || activeStageId == ArupStages.BidSubmitted || activeStageId == ArupStages.ConfirmJob || IsCJNApprovalStage(activeStageId) || statecode > 0 || bidSubmittedDate != null || shwbidreviewappbtn) {
        return false;
    }
    else {
        return true;
    }
}

function hideButtonAddSuffix(formContext) {
    var internalOpportunity = formContext.getAttribute("ccrm_arupinternal").getValue();
    var arupGroupDetails = GetArupGroupCode(formContext);
    if ((internalOpportunity && (arupGroupDetails.arupGroupCode != 'GC60' && arupGroupDetails.arupGroupCode != 'GC25'))) {
        return false;
    } else {
        return true;
    }
}

function IsCJNApprovalStage(stageid) {
    return ((stageid == ArupStages.ConfirmJobApproval) || (stageid == ArupStages.ConfirmJobApproval1) || (stageid == ArupStages.ConfirmJobApproval2) || (stageid == ArupStages.ConfirmJobApproval3));
}

function GetArupGroupCode(formContext) {
    var arupGroupDetails = new Object();
    var arupGroup = formContext.getAttribute("ccrm_arupgroupid").getValue();
    if (arupGroup != null && arupGroup != "undefined") {
        var arupGroupId = arupGroup[0].id.replace('{', '').replace('}', '');
        var req = new XMLHttpRequest();
        req.open("GET", formContext.context.getClientUrl() + "/api/data/v8.2/ccrm_arupgroups(" + arupGroupId + ")?$select=ccrm_arupgroupcode", false);
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
                    Xrm.Navigation.openAlertDialog(this.statusText);
                }
            }
        };
        req.send();
        return arupGroupDetails;
    }
}

function hideButtonDuplicateOpportunity(formContext) {
    if (!userInTeamCheck(formContext, 'Global Data Quality'))
        return true;
    else
        return false;
}

function CallDuplicateOpportunityFlow(formContext) {
    var flowUrl = "https://prod-04.uksouth.logic.azure.com:443/workflows/57567ec449004fa4b24f9cbb76d4d221/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dNm2Z7TboaKYlhOwCvTzERN_31g7HtijAQlKmti_i30";
    var input = JSON.stringify({
        "id": formContext.data.entity.getId().replace("{", "").replace("}", "")
    });
    var req = new XMLHttpRequest();
    req.open("POST", flowUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');

    ////Response
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var result = JSON.parse(this.response);               
                var newid = result.id;
                    alert("" + newid);
                    OpenForm(formContext.data.entity.getEntityName(), newid);
                
              
            }
            else if (this.status === 400) {
                alert(this.statusText);
                var result = this.response;
                alert("Error" + result);
            }
        }
    };

    ////End
    req.send(input);
}
