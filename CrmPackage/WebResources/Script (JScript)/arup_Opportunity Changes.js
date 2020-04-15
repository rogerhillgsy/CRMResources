﻿var cacheValueBDC = null;
var cacheValueBM = null;
var cacheValueBD = null;

function onSelectOfStage(selStageId) {

    debugger;
    cacheValueBDC = Xrm.Page.getAttribute("arup_biddecisionchair").getValue();
    cacheValueBM = Xrm.Page.getAttribute("ccrm_bidmanager_userid").getValue();
    cacheValueBD = Xrm.Page.getAttribute("ccrm_biddirector_userid").getValue();

    var opptype = Xrm.Page.getAttribute("arup_opportunitytype").getValue();
    var arupInternal = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();
    var bidDevTabToShow = arupInternal ? "Bid_Development_Tab_Internal" : "Bid_Development_Tab_External";
    var bidDevTabToHide = !arupInternal ? "Bid_Development_Tab_Internal" : "Bid_Development_Tab_External";
    var isPJNApprovalStage = IsPJNApprovalStage(selStageId);

    switch (selStageId) {
        case ArupStages.BidReviewApproval:
            Xrm.Page.ui.tabs.get("Project_Details_Tab").setDisplayState("collapsed");
            Xrm.Page.ui.tabs.get("Summary").setDisplayState("expanded");
            break;
        case ArupStages.BidSubmitted:
            Xrm.Page.ui.tabs.get("Summary").setDisplayState("collapsed");
            Xrm.Page.ui.tabs.get("Project_Details_Tab").setDisplayState("expanded");
            break;
        case ArupStages.ConfirmJob:
            Xrm.Page.ui.tabs.get("Summary").setDisplayState("expanded");
            Xrm.Page.ui.tabs.get("Project_Details_Tab").setDisplayState("collapsed");
            break;
    }

    if (arupInternal) {

        if (opptype == '770000004') {
            Xrm.Page.ui.tabs.get(bidDevTabToShow).setVisible(true);
        }

        Xrm.Page.ui.tabs.get("Bid_Details_Tab").sections.get("Bid_Details_Tab_section_7").setVisible(false);
        Xrm.Page.ui.tabs.get("Bid_Details_Tab").sections.get("tab_6_section_3").setVisible(false);
        Xrm.Page.ui.tabs.get("Bid_Details_Tab").sections.get("tab_7_section_5").setVisible(false);
        Xrm.Page.ui.tabs.get("Summary").sections.get("Organisation_Checks_Section").setVisible(false);
    }

    if (Xrm.Page.ui.tabs.get(bidDevTabToHide).getVisible() == true) {
        Xrm.Page.ui.tabs.get(bidDevTabToHide).setVisible(false);
    }

    setBidDecisionChairRequired();
}

function ShowHideOpportunityTypeAndProjectProcurement() {

    if (Xrm.Page.getAttribute("statecode").getValue() != 0) { return; }

    setTimeout(function () {
        if (Xrm.Page.getAttribute("stageid") != null && Xrm.Page.getAttribute("stageid") != undefined) {
            var selStageId = Xrm.Page.getAttribute("stageid").getValue();

            if (selStageId == ArupStages.Lead || isPartOfDQTeam()) {

                Xrm.Page.getControl("arup_opportunitytype").setDisabled(false);
                if (!Xrm.Page.getControl("ccrm_contractarrangement").getDisabled())
                    Xrm.Page.getControl("ccrm_contractarrangement").setDisabled(false);
            } else {
                Xrm.Page.getControl("arup_opportunitytype").setDisabled(true);
                if (Xrm.Page.getAttribute("ccrm_contractarrangement").getValue() != null)
                    Xrm.Page.getControl("ccrm_contractarrangement").setDisabled(true);
                else
                    Xrm.Page.getControl("ccrm_contractarrangement").setDisabled(false);
            }
        }
    }, 2000);
}

//pass opportunity status as Lost/Won from Ribbon Workbench
function CloseOpportunity(statusCode) {
    debugger;
    var oppId = Xrm.Page.data.entity.getId().replace(/[{}]/g, "");
    var arupInternal = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();
    var clientUrl = Xrm.Page.context.getClientUrl();
    var stepName = getStepName(oppId);
    var activeStageId = Xrm.Page.data.process.getActiveStage().getId();
    var oppDetails = getOpportunityReasons(activeStageId, statusCode, arupInternal);

    //save the form before popping the dialog
    if (Xrm.Page.data.entity.getIsDirty()) { Xrm.Page.data.save(); }

    //loop through all form attributes and detirmine which visible and required attributes are blank
    setTimeout(function () {
        var oppAttributes = Xrm.Page.data.entity.attributes.get();
        var control;
        var attribute;
        var errors = false;
        if (oppAttributes != null) {
            for (var i in oppAttributes) {

                control = Xrm.Page.getControl(oppAttributes[i].getName());
                if (!!control && control.getVisible() == true) {
                    attribute = Xrm.Page.getAttribute(oppAttributes[i].getName());
                    if (!!attribute && attribute.getRequiredLevel() == 'required' && attribute.getValue() == null) {
                        errors = true;
                        break;
                    }
                }
            }
        }
        if (errors) {

            Alert.show('<font size="6" color="#FF0000"><b>Missing required information</b></font>',
                '<font size="3" color="#000000"></br>Please, fill out all of the the required information on the form.</font>',
                [
                    { label: "<b>OK</b>", setFocus: true },
                ], "ERROR", 550, 250, '', true);

        }
        else {

            setTimeout(function () {
                if (oppDetails != null) {
                    var object = JSON.stringify(oppDetails);
                  //  var customParameters = encodeURIComponent("oppId=" + oppId + "&stepName=" + stepName + "&oppDetails=" + object + "&statusCode=" + statusCode);
                    var customParameters = "oppId=" + oppId + "&stepName=" + stepName + "&oppDetails=" + object + "&statusCode=" + statusCode;

                    var DialogOption = {
                        width: 500,
                        height: 500
                    };
                    // DialogOption.width = 600;
                    // DialogOption.height = 445;
                    //Xrm.Internal.openDialog(Xrm.Page.context.getClientUrl() + "/WebResources/arup_close_Opportunity?Data=" +
                    //    customParameters,
                    //    DialogOption,
                    //    null,
                    //    null,
                    //    function (returnValue) {
                    //        //debugger;
                    //        Xrm.Utility.openEntityForm(Xrm.Page.data.entity.getEntityName(), Xrm.Page.data.entity.getId());
                    //    });

                    var pageInput = {
                        pageType: "webresource",
                        webresourceName: "arup_close_Opportunity",
                        data: customParameters

                    };
                    var navigationOptions = {
                        target: 2,
                        width: 600,
                        height: 445,
                        position: 1
                    };
                    Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
                        //function success(returnValue) {
                        //    debugger;
                        //    Xrm.Utility.openEntityForm(Xrm.Page.data.entity.getEntityName(), Xrm.Page.data.entity.getId());
                        //},
                        //function error() {
                        //    // Handle errors
                        //}
                    );



                }
            }, 1000);
        }
    }, 1500);
}

function getStepName(oppId) {
    var stepname = new String();
    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/ccrm_bpf_b253053047ef4eddbed29e34f6c23731s?fetchXml=%3Cfetch%20version%3D%221.0%22%20output-format%3D%22xml-platform%22%20mapping%3D%22logical%22%20distinct%3D%22false%22%3E%3Centity%20name%3D%22ccrm_bpf_b253053047ef4eddbed29e34f6c23731%22%3E%3Cattribute%20name%3D%22businessprocessflowinstanceid%22%20%2F%3E%3Cfilter%20type%3D%22and%22%3E%3Ccondition%20attribute%3D%22bpf_opportunityid%22%20operator%3D%22eq%22%20uiname%3D%22%26quot%3BPomeroy%26quot%3B%C2%A0-%C2%A014%C2%A0Macleay%C2%A0St%22%20uitype%3D%22opportunity%22%20value%3D%22%7B" +
        oppId + "%7D%22%20%2F%3E%3C%2Ffilter%3E%3Clink-entity%20name%3D%22processstage%22%20from%3D%22processstageid%22%20to%3D%22activestageid%22%20alias%3D%22ab%22%3E%3Cattribute%20name%3D%22stagename%22%20%2F%3E%3C%2Flink-entity%3E%3C%2Fentity%3E%3C%2Ffetch%3E", false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                stepname = results.value[0].ab_x002e_stagename;
            }
        }
    };
    req.send();
    return stepname;
}

function getOpportunityReasons(activeStageId, statusCode, arupInternal) {

    var ccrm_lostopp_reason = new String();
    var ccrm_lostopp_resaon_values = new String();
    var dictionary = {};
    var req = new XMLHttpRequest();

    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/arup_closeopportunityreasons?$select=arup_lostopportunityreasons,arup_lostopportunityreasonvalues,arup_wonopportunityreasons,arup_wonopportunityreasonvalues&$filter=ccrm_stageid eq '" + activeStageId + "' and  arup_arupinternalopportunity eq " + arupInternal, false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                if (statusCode == "lost") {
                    ccrm_lostopp_reason = results.value[0]["arup_lostopportunityreasons"];
                    var reasonValue = ccrm_lostopp_reason.split(',');
                    ccrm_lostopp_resaon_values = results.value[0]["arup_lostopportunityreasonvalues"];
                    var reasonkey = ccrm_lostopp_resaon_values.split(',');
                }
                else if (statusCode == "won") {
                    ccrm_wonopp_reason = results.value[0]["arup_wonopportunityreasons"];
                    var reasonValue = ccrm_wonopp_reason.split(',');
                    ccrm_wonopp_resaon_values = results.value[0]["arup_wonopportunityreasonvalues"];
                    var reasonkey = ccrm_wonopp_resaon_values.split(',');
                }

                for (var i = j = 0; i < reasonValue.length && j < reasonkey.length; i++ , j++) {
                    var key = reasonkey[j];
                    var value = reasonValue[i];
                    dictionary[key] = value;
                }
            } else {
                return null;
            }
        }
    };
    req.send();
    return dictionary;
}

function CloseOpportunityConfirmation(statusCode) {
    debugger;
    var client = Xrm.Page.getAttribute("ccrm_client").getValue();
    var arupInternal = (Xrm.Page.getAttribute("ccrm_arupinternal").getValue() == 1) ? true : false;

    if (client[0].id != null && client[0].id.toLowerCase() == "{9c3b9071-4d46-e011-9aa7-78e7d1652028}") {
        Alert.show('<font size="6" color="#FF0000"><b>Unassigned Client</b></font>',
            '<font size="3" color="#000000"></br>A valid Client is required.</font>',
            [
                { label: "<b>OK</b>", setFocus: true },
            ], "ERROR", 450, 200, '', true);
    } else {

        if (!arupInternal) {

            var ackMsg = ConfirmationMessage();

            Alert.show('<font size="6" color="#187ACD"><b>Governance Check</b></font>',
                '<font size="3" color="#000000"></br>' + ackMsg + '</font>',
                [
                    {
                        label: "<b>Confirm</b>",
                        callback: function () {
                            if (statusCode == "won") {
                                CloseOpportunity(statusCode);
                            }
                            if (statusCode == "cjn") {
                                requestConfirmJob();
                            }
                        },
                        setFocus: true,
                        preventClose: false

                    },
                    {
                        label: "<b>Cancel</b>",
                        callback: function () {

                        },
                        setFocus: false,
                        preventClose: false
                    }
                ], 'INFO', 800, 430, '', true);
        }
        else {

            if (statusCode == "won") {
                CloseOpportunity(statusCode);
            }
            if (statusCode == "cjn") {
                requestConfirmJob();
            }

        }
    }
}

function ConfirmationMessage() {
    var message = "";

    var clientAtBid = Xrm.Page.getAttribute("arup_clientatbidreview").getValue();
    var client = Xrm.Page.getAttribute("ccrm_client").getValue();

    var clientChanged = false;
    var NotBidDirector = false;
    if (clientAtBid != null && client != null) {
        if (client[0].id != clientAtBid[0].id) {
            clientChanged = true;
        }
    }

    var bidDirector = Xrm.Page.getAttribute("ccrm_biddirector_userid").getValue();
    var userId = Xrm.Page.context.getUserId();
    var userName = Xrm.Page.context.getUserName();

    if (bidDirector != null) {
        if (userId != bidDirector[0].id) {
            NotBidDirector = true;
        }
    }

    message =
        "As Bid Director, you confirm that: </br></br>The correct Client name and Arup Company have been selected, and that all information is complete, including the project record information.</br></br> All Arup bidding procedures have been followed.</br></br>";

    if (clientChanged) {
        message +=
            "The Client has changed since the approval of the bid review; please confirm that all appropriate checks have been made and that the Bid Review Chair has agreed to the change.  If the new client is a Contractor, leadership will be notified of the change.</br></br>";
    }

    if (NotBidDirector) {
        message +=
            "You are approving on behalf of the Bid Director.  You confirm that the Bid Director has instructed this opportunity to be closed as won.</br></br>";
    }

    message += "Bid Director &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :&nbsp;<b>" + bidDirector[0].name + "</b></br>";

    if (NotBidDirector) {
        message +=
            "Proxy for Bid Director: <b>" + userName + "</b></br>";
    }
    return message;
}

function BidDicisionConfirmation() {

    var bidDecisionChair = Xrm.Page.getAttribute("arup_biddecisionchair").getValue();

    if (bidDecisionChair == null) {
        errorHandlerBidDecision();
        return;
    }

    ccrm_opportunitytype_onchange();

    var ismodified = Xrm.Page.data.entity.getIsDirty();
    if (ismodified == true) {
        Xrm.Page.data.save();
    }

    if (!IsFormValid('BDA') || !checkBidDecionChair('AP')) { return; }

    setTimeout(function () {

        var ackMsg = BidConfirmationMessage(bidDecisionChair);

        Alert.show('<font size="6" color="#187ACD"><b>Opportunity - Decision to Bid</b></font>',
            '<font size="3" color="#000000"></br></br>' + ackMsg + '</font>',
            [
                {
                    label: "<b>Confirm</b>",
                    callback: function () {
                        var approvalType = "BidDecisionChairApproval";
                        approveCallbackAction(approvalType);
                        moveToNextTrigger = true;
                    },
                    setFocus: true,
                    preventClose: false

                },
                {
                    label: "<b>Cancel</b>",
                    callback: function () {

                    },
                    setFocus: false,
                    preventClose: false
                }
            ], 'QUESTION', 800, 470, '', true);
    }, 2000);
}

function BidConfirmationMessage(bidDecisionChair) {

    var userId = Xrm.Page.context.getUserId();
    var userName = Xrm.Page.context.getUserName();

    var opportunityType = Xrm.Page.getAttribute("arup_opportunitytype").getValue();

    var message = "";
    var proxyUser = false;
    message +=
        "As Bid Decision Chair, you confirm that: </br>This opportunity is to be taken into Developing Bid stage and that any bid costs forecast are at an appropriate level.</br></br>";

    if (opportunityType == 770000001) {
        message +=
            "This opportunity is for a Project Extension � Existing Contract. You confirm that there are no changes to the existing contract under this opportunity.</br></br>";
    }

    if (bidDecisionChair != null) {
        if (userId != bidDecisionChair[0].id) {
            message +=
                "Proxy Approval:</br> You are confirming on behalf of the Bid Decision Chair. You confirm that the Bid Decision Chair has instructed this opportunity to be progressed to the next stage. An e-mail will automatically be sent to the Bid Decision Chair stating this action has been taken on their behalf.</br></br>";
            proxyUser = true;
        }
        message += "Bid Decision Chair &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;: <b>" + bidDecisionChair[0].name + "</b></br>";
    }

    if (proxyUser) {
        message += "Proxy for Bid Decision Chair : <b>" + userName + "</b></br>";
    }
    return message;
}

function setupArupInternal() {

    var arupInternal = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();
    if (!arupInternal) { return; }

    Xrm.Page.getControl("ccrm_countryofclientregistrationid").setVisible(false);
    Xrm.Page.getControl("ccrm_opportunitytype").setVisible(false);
    Xrm.Page.getControl("ccrm_countrycategory").setVisible(false);
    Xrm.Page.getControl("arup_importedsalarycost_num").setVisible(false);
    Xrm.Page.getControl("arup_importedstaffohcost_num").setVisible(false);
    Xrm.Page.getControl("arup_importedexpenses_num").setVisible(false);
    Xrm.Page.getControl("ccrm_arupuniversityiiaresearchinitiative").setVisible(false);
    Xrm.Page.getControl("ccrm_estprojectvalue_num").setVisible(false);
    Xrm.Page.getControl("arup_projpartreqd").setVisible(false);

}

function setBidDecisionChairRequired() {

    var regionName;
    var arupInternal = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();
    var opportunityType = Xrm.Page.getAttribute("arup_opportunitytype").getValue();
    var stage = getStageId();
    if (Xrm.Page.getAttribute("ccrm_arupregionid").getValue() != null) {
        regionName = Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name.toUpperCase();
    }
    var isHidden = (regionName == "AUSTRALASIA REGION" || regionName == "MALAYSIA REGION" || regionName == "EAST ASIA REGION" || opportunityType == 770000005 || arupInternal) ? true : false;
    var requiredLevel = (!isHidden && stage == ArupStages.Lead) ? 'required' : 'none';

    Xrm.Page.getControl("header_process_arup_biddecisionchair").setVisible(!isHidden);
    Xrm.Page.getControl("arup_biddecisionchair").setVisible(!isHidden);
    Xrm.Page.getControl("arup_biddecisionproxy").setVisible(!isHidden);
    Xrm.Page.getControl("arup_biddecisiondate").setVisible(!isHidden);
    Xrm.Page.getAttribute("arup_biddecisionchair").setRequiredLevel(requiredLevel);
    if (isHidden) {
        Xrm.Page.getAttribute("arup_biddecisionchair").setValue(null);
    }
}

function checkBidDecionChair(attribute) {
    var state = Xrm.Page.getAttribute("statecode").getValue();
    var arupRegion = Xrm.Page.getAttribute("ccrm_arupregionid").getValue();
    var opportunityType = Xrm.Page.getAttribute("arup_opportunitytype").getValue();
    var arupInternal = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();
    var arupRegionName = (arupRegion != null) ? arupRegion[0].name.toLowerCase() : '';
    var stage = getStageId();

    if (arupRegionName == 'americas region') { return true; }

    if (state != 0 || arupInternal || opportunityType == 770000005 || stage != ArupStages.Lead ||
        (arupRegionName != 'europe' && arupRegionName != 'ukimea region')
    ) { return; }

    var bidDecisionChair = Xrm.Page.getAttribute("arup_biddecisionchair").getValue();
    var bidmanager = Xrm.Page.getAttribute("ccrm_bidmanager_userid").getValue();
    var biddirector = Xrm.Page.getAttribute("ccrm_biddirector_userid").getValue();
    if (bidDecisionChair != null && bidmanager != null && bidDecisionChair[0].id == bidmanager[0].id) {
        var errorMessage = 'Bid Decision Chair cannot be the same as Bid Manager or Bid Director';
        showAlertMessage(attribute, errorMessage);
        if (attribute == 'AP') { return false; }
    }
    else if (attribute == 'AP') { return true; }
}

function showAlertMessage(attribute, errorMessage) {

    Alert.show('<font size="6" color="#FF0000"><b>Bid Decision Chair</b></font>',
        '<font size="3" color="#000000"></br>' + errorMessage + '</font>',
        [
            {
                label: "<b>OK</b>",
                callback: function () {
                    if (attribute == 'BDC') {
                        Xrm.Page.getAttribute("arup_biddecisionchair").setValue(cacheValueBDC);
                    }
                    else if (attribute == 'BM') {
                        Xrm.Page.getAttribute("ccrm_bidmanager_userid").setValue(cacheValueBM);
                    }
                    else if (attribute == 'BD') {
                        Xrm.Page.getAttribute("ccrm_biddirector_userid").setValue(cacheValueBD);
                    }
                },
                setFocus: true,
                preventClose: false
            },
        ], "ERROR", 550, 200, '', true);
}

function errorHandlerBidDecision() {
    Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
        '<font size="3" color="#000000"></br>Bid Decision Chair cannot be empty.</font>',
        [
            {
                label: "<b>OK</b>",
                setFocus: true,
                preventClose: false
            },
        ], "ERROR", 450, 200, '', true);
}

function BidReviewApprovalConfirmation(approvalType) {
    var ackMsg = BidReviewApprovalConfirmationMessage();

    Alert.show('<font size="6" color="#1B76D5"><b>Opportunity - Bid Review Approval</b></font>',
        '<font size="3" color="#000000"></br>' + ackMsg + '</font>',
        [
            {
                label: "<b>Confirm</b>",
                callback: function () {
                    approveCallbackAction(approvalType);
                    moveToNextTrigger = true;
                },
                setFocus: true,
                preventClose: false

            },
            {
                label: "<b>Cancel</b>",
                callback: function () {

                },
                setFocus: false,
                preventClose: false
            }
        ], 'QUESTION', 800, 400, '', true);
}

function BidReviewApprovalConfirmationMessage() {
    var bidReviewChair = Xrm.Page.getAttribute("ccrm_bidreviewchair_userid").getValue();
    var bidManager = Xrm.Page.getAttribute("ccrm_bidmanager_userid").getValue();
    var bidDirector = Xrm.Page.getAttribute("ccrm_biddirector_userid").getValue();
    var isBidManager = false;
    var isBidDirector = false;

    var userId = Xrm.Page.context.getUserId();
    var userName = Xrm.Page.context.getUserName();

    var message = "";
    var proxyUser = false;
    message +=
        "As Bid Review Chair, you confirm that: </br>This opportunity has been reviewed according to regional bidding policy and that the proposal can be issued, subject to any agreed changes having been incorporated.</br></br>";

    if (bidManager != null) {
        if (userId == bidManager[0].id) {
            isBidManager = true;
        }
    }

    if (bidDirector != null) {
        if (userId == bidDirector[0].id) {
            isBidDirector = true;
        }
    }

    if (bidReviewChair != null) {
        if (userId != bidReviewChair[0].id) {
            message +=
                "Proxy Approval:</br>You are approving on behalf of the Bid Review Chair. You confirm that the Bid Review Chair has concluded the review and agreed that the proposal can be issued, subject to any agreed changes being incorporated. An e-mail will automatically be sent to the Bid Review Chair confirming this action has been taken on their behalf.</br></br>";
            proxyUser = true;
        }
        message += "Bid Review Chair &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; : <b>" + bidReviewChair[0].name + "</b></br>";
    }

    if (proxyUser) {
        message += "Proxy for Bid Review Chair : <b>" + userName + "</b></br>";
    }
    return message;
}

function retreiveOrganisationChecks() {
    //Check if client is not Unassigned and Not Internal Opportuntiy
    var arupInternal = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();
    var client = Xrm.Page.getAttribute("ccrm_client").getValue();
    if (client != null && client[0].name != 'Unassigned' && arupInternal != true) {
        var oppSanctionCheck = Xrm.Page.getAttribute("arup_duediligencecheck").getValue();
        var clientDirty = Xrm.Page.getAttribute("ccrm_client").getIsDirty();
        if (client != null) {
            var clientId = client[0].id.replace('{', '').replace('}', '');
            var req = new XMLHttpRequest();
            req.open("GET",
                Xrm.Page.context.getClientUrl() +
                "/api/data/v8.2/accounts(" +
                clientId +
                ")?$select=arup_creditcheck,arup_duediligencecheck,arup_lastddcheckdate,arup_duediligencetooltip,arup_duediligencemultipleresult",
                true);
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

                        var arup_creditcheck = result["arup_creditcheck"];
                        Xrm.Page.getAttribute("arup_creditcheck").setValue(arup_creditcheck);
                        setCreditCheckLight();

                        var arup_duediligencecheck = result["arup_duediligencecheck"];
                        if (arup_duediligencecheck != null) { // If Sanctions is null on Client
                            Xrm.Page.getAttribute("arup_duediligencecheck").setValue(arup_duediligencecheck);

                            // var arup_duediligencetooltip = result["arup_duediligencetooltip"];
                            // Xrm.Page.getAttribute("arup_duediligencetooltip").setValue(arup_duediligencetooltip);

                            // var arup_duediligencemultipleresult = result["arup_duediligencemultipleresult"];
                            // if (Xrm.Page.getAttribute("arup_duediligencemultipleresult").getValue() != arup_duediligencemultipleresult)
                            //     Xrm.Page.getAttribute("arup_duediligencemultipleresult").setValue(arup_duediligencemultipleresult);

                        } else if (oppSanctionCheck != null && !clientDirty) { // If sanctions is null on Opportunity
                            Xrm.Page.getAttribute("arup_duediligencecheck").setValue(oppSanctionCheck);
                            Xrm.Page.getAttribute("arup_sanctionschecktrigger").setValue(1);
                        } else if (!clientDirty) { // If Client is not dirty //Top right coner in Design                                            
                            Xrm.Page.getAttribute("arup_sanctionschecktrigger").setValue(1);
                            Xrm.Page.data.save();
                            setTimeout(function () {
                                Xrm.Page.getAttribute("arup_sanctionschecktrigger").fireOnChange();
                            }, 3000);
                        }
                        setTimeout(function () {
                            Xrm.Page.getAttribute("arup_duediligencecheck").fireOnChange();
                        }, 1000);
                    }
                }
            };
            req.send();
        }
    }
}

function setCreditCheckLight() {
    var arup_creditcheck = Xrm.Page.getAttribute("arup_creditcheck").getValue();
    var sourceUrl = Xrm.Page.getControl("WebResource_Credit_Check").getSrc();
    var sourceString = sourceUrl.toString();
    var url = sourceString.substring(0, sourceString.lastIndexOf('/'));
    var targetUrl, resource, title = "";
    if (arup_creditcheck != null) {
        switch (arup_creditcheck) {
            case 1:
                resource = "/arup_Green_Light";
                title = "Low Risk";
                break;
            case 2:
                resource = "/arup_Amber_Light";
                title = "Medium Risk";
                break;
            case 3:
                resource = "/arup_Red_Light";
                title = "High Risk";
                break;
            case 4:
                resource = "/arup_Grey_Light";
                title = "Not Performed / No Information";
                break;
            default:
                break;
        }
    } else {
        resource = "/arup_Grey_Light";
        title = "Not Performed / No Information";
    }

    targetUrl = url.concat(resource);
    Xrm.Page.getControl("WebResource_Credit_Check").setSrc(targetUrl);
    Xrm.Page.getControl("WebResource_Credit_Check").getObject().title = title;
}

function setDueDiligenceCheckLight() {
    var arup_duediligencecheck = Xrm.Page.getAttribute("arup_duediligencecheck").getValue();
    var sourceUrl = Xrm.Page.getControl("WebResource_Due_Diligence_Check").getSrc();
    var sourceString = sourceUrl.toString();
    var url = sourceString.substring(0, sourceString.lastIndexOf('/'));
    var targetUrl, resource, title = "";
    if (arup_duediligencecheck != null) {
        switch (arup_duediligencecheck) {
            case 1:
                resource = "/arup_Green_Light";
                title = "No Sanctions";
                break;
            case 2:
                resource = "/arup_Green_Light";
                title = "No Sanctions (OOL)";
                break;
            case 3:
                resource = "/arup_Red_Light";
                title = "Sanctioned";
                break;
            case 7:
                resource = "/arup_Grey_Light";
                title = "Not Checked";
                break;
            case 8:
                resource = "/arup_Grey_Light";
                title = "Manual Check Needed";
                break;
            default:
                break;
        }
    } else {
        resource = "/arup_Grey_Light";
        title = "Not Checked";
    }
    targetUrl = url.concat(resource);
    Xrm.Page.getControl("WebResource_Due_Diligence_Check").setSrc(targetUrl);
    Xrm.Page.getControl("WebResource_Due_Diligence_Check").getObject().title = title;
}

function checkOrganisationChecks() {
    setTimeout(function () {
        var client = Xrm.Page.getAttribute("ccrm_client").getValue();
        if (client != null) {
            var clientId = client[0].id.replace('{', '').replace('}', '');
            var req = new XMLHttpRequest();
            req.open("GET",
                Xrm.Page.context.getClientUrl() + "/api/data/v8.2/accounts(" + clientId + ")?$select=arup_duediligencecheck", true);
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
                        var org_duediligencecheck = result["arup_duediligencecheck"];
                        var arup_duediligencecheck = Xrm.Page.getAttribute("arup_duediligencecheck").getValue();
                        if ((arup_duediligencecheck != org_duediligencecheck))
                            setOrganisationChecks(arup_duediligencecheck);
                    }
                }
            };
            req.send();
        }
    }, 2000);
}

function setOrganisationChecks(arup_duediligencecheck) {
    var client = Xrm.Page.getAttribute("ccrm_client").getValue();
    if (client != null) {
        var clientId = client[0].id.replace('{', '').replace('}', '');
    } else {
        return;
    }

    var entity = {};
    entity.arup_duediligencecheck = arup_duediligencecheck;
    entity.arup_lastddcheckdate = new Date();

    var req = new XMLHttpRequest();
    req.open("PATCH", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/accounts(" + clientId + ")", true);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 204) {
            }
        }
    };
    req.send(JSON.stringify(entity));
}