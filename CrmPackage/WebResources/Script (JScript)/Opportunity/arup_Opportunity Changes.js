var cacheValueBDC = null;
var cacheValueBM = null;
var cacheValueBD = null;

function onSelectOfStage(formContext, selStageId) {
    if (selStageId == null || selStageId == 'undefined')
        formContext = formContext.getFormContext(); //1st paramter is executioncontext in case of FormOnload event

    cacheValueBDC = formContext.getAttribute("arup_biddecisionchair").getValue();
    cacheValueBM = formContext.getAttribute("ccrm_bidmanager_userid").getValue();
    cacheValueBD = formContext.getAttribute("ccrm_biddirector_userid").getValue();

    setBidDecisionChairRequired(formContext);
}

function ShowHideOpportunityTypeAndProjectProcurement(formContext, stageId) {

    if (formContext.getAttribute("statecode").getValue() != 0) { return; }

    setTimeout(function () {
        if (stageId != null && stageId != undefined) {

            if (stageId == ArupStages.Lead || isPartOfDQTeam(formContext)) {

                formContext.getControl("arup_opportunitytype").setDisabled(false);
                if (!formContext.getControl("ccrm_contractarrangement").getDisabled())
                    formContext.getControl("ccrm_contractarrangement").setDisabled(false);
            } else {
                formContext.getControl("arup_opportunitytype").setDisabled(true);
                if (formContext.getAttribute("ccrm_contractarrangement").getValue() != null)
                    formContext.getControl("ccrm_contractarrangement").setDisabled(true);
                else
                    formContext.getControl("ccrm_contractarrangement").setDisabled(false);
            }
        }
    }, 2000);
}

//This function is called from 'Close as Lost' button and 'Close as lost/no Bid' button
//pass opportunity status as Lost / Won from Ribbon Workbench, formcontext is primarycontrol paramter
function CloseOpportunity(formContext, statusCode) {
    var oppId = formContext.data.entity.getId().replace(/[{}]/g, "");
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
    var clientUrl = formContext.context.getClientUrl();
    var activeStageId = formContext.data.process.getActiveStage().getId();
    var oppDetails = getOpportunityReasons(formContext.context.getClientUrl(), activeStageId, statusCode, arupInternal);

    formContext.getAttribute("arup_biddecisionchair").setRequiredLevel('none');
    formContext.getAttribute("ccrm_bidreviewchair_userid").setRequiredLevel('none');

    formContext.data.save().then(
        function success(status) {

            setTimeout(function () {
                if (oppDetails != null) {
                    var object = JSON.stringify(oppDetails);
                    var customParameters = "&oppId=" + oppId + "&oppDetails=" + object + "&statusCode=" + statusCode + "&clientUrl=" + clientUrl;
                    var pageInput = {
                        pageType: "webresource",
                        webresourceName: "arup_close_Opportunity",
                        data: customParameters

                    };
                    var navigationOptions = {
                        target: 2,
                        width: 600,
                        height: 500,
                        position: 1
                    };
                    Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
                        function success(returnValue) {
                            OpenForm(formContext.data.entity.getEntityName(), formContext.data.entity.getId());
                        },
                        function error() {
                            // Handle errors
                        }
                    );



                }
            }, 1000);
        },
        function (status) {
            console.log("failure status " + status.message);
        });
}

function getOpportunityReasons(ClientUrl, activeStageId, statusCode, arupInternal) {

    var ccrm_lostopp_reason = new String();
    var ccrm_lostopp_resaon_values = new String();
    var ccrm_wonopp_reason = new String();
    var ccrm_wonopp_resaon_values = new String();
    var dictionary = {};
    var req = new XMLHttpRequest();

    req.open("GET", ClientUrl + "/api/data/v9.1/arup_closeopportunityreasons?$select=arup_lostreasons,arup_wonreasons&$filter=ccrm_stageid eq '" + activeStageId + "' and  arup_arupinternalopportunity eq " + arupInternal, false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=OData.Community.Display.V1.FormattedValue");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                if (statusCode == "lost") {
                    ccrm_lostopp_reason = results.value[0]["arup_lostreasons@OData.Community.Display.V1.FormattedValue"]
                    var reasonValue = ccrm_lostopp_reason.split(';');
                    ccrm_lostopp_resaon_values = results.value[0].arup_lostreasons;
                    var reasonkey = ccrm_lostopp_resaon_values.split(',');
                }
                else if (statusCode == "won") {
                    ccrm_wonopp_reason = results.value[0]["arup_wonreasons@OData.Community.Display.V1.FormattedValue"]
                    var reasonValue = ccrm_wonopp_reason.split(';');
                    ccrm_wonopp_resaon_values = results.value[0].arup_wonreasons;
                    var reasonkey = ccrm_wonopp_resaon_values.split(',');
                }

                for (var i = j = 0; i < reasonValue.length && j < reasonkey.length; i++, j++) {
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

//Below function called from Ribbonworkbench: FormCOntext is primarycontrol paramter
function CloseOpportunityConfirmation(formContext, statusCode) {
    formContext.data.save().then(
        function success(status) {

            var client = formContext.getAttribute("ccrm_client").getValue();
            var arupInternal = (formContext.getAttribute("ccrm_arupinternal").getValue() == 1) ? true : false;

            if (client[0].id != null && client[0].id.toLowerCase() == "{9c3b9071-4d46-e011-9aa7-78e7d1652028}") {
                Alert.show('<font size="6" color="#FF0000"><b>Unassigned Client</b></font>',
                    '<font size="3" color="#000000"></br>A valid Client is required.</font>',
                    [
                        { label: "<b>OK</b>", setFocus: true },
                    ], "ERROR", 450, 200, '', true);
            } else {

                if (!arupInternal) {

                    var ackMsg = ConfirmationMessage(formContext);

                    Alert.show('<font size="6" color="#187ACD"><b>Governance Check</b></font>',
                        '<font size="3" color="#000000"></br>' + ackMsg + '</font>',
                        [
                            {
                                label: "<b>Confirm</b>",
                                callback: function () {
                                    if (statusCode == "won") {
                                        CloseOpportunity(formContext, statusCode);
                                    }
                                    if (statusCode == "cjn") {
                                        requestConfirmJob(formContext);
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
                        CloseOpportunity(formContext, statusCode);
                    }
                    if (statusCode == "cjn") {
                        requestConfirmJob(formContext);
                    }

                }
            }
        },
        function (status) {
            console.log("failure status " + status.message);
        });
}

function ConfirmationMessage(formContext) {
    var message = "";

    var clientAtBid = formContext.getAttribute("arup_clientatbidreview").getValue();
    var client = formContext.getAttribute("ccrm_client").getValue();

    var clientChanged = false;
    var NotBidDirector = false;
    if (clientAtBid != null && client != null) {
        if (client[0].id != clientAtBid[0].id) {
            clientChanged = true;
        }
    }

    var bidDirector = formContext.getAttribute("ccrm_biddirector_userid").getValue();
    var userId = globalContext.userSettings.userId;
    var userName = globalContext.userSettings.userName;

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

//Button : Bid Decision Approval, FormCOntext is primarycontrol paramter from ribbon
function BidDicisionConfirmation(formContext) {

    var bidDecisionChair = formContext.getAttribute("arup_biddecisionchair").getValue();
    ccrm_opportunitytype_onchange(formContext);

    if (!checkBidDecionChair(formContext, 'AP')) { return; }

    formContext.data.save().then(
        function success(status) {
            if (IsFormValid(formContext, 'BDA')) {
                setTimeout(function () {

                    var ackMsg = BidConfirmationMessage(formContext, bidDecisionChair);

                    Alert.show('<font size="6" color="#187ACD"><b>Opportunity - Decision to Bid</b></font>',
                        '<font size="3" color="#000000"></br></br>' + ackMsg + '</font>',
                        [
                            {
                                label: "<b>Confirm</b>",
                                callback: function () {
                                    var approvalType = "BidDecisionChairApproval";
                                    approveCallbackAction(formContext, approvalType);
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
            else {
                formContext.data.save();
            }
        },
        function (status) {
            console.log("failure status " + status.message);
        });
}

function BidConfirmationMessage(formContext, bidDecisionChair) {

    var userId = globalContext.userSettings.userId;
    var userName = globalContext.userSettings.userName;

    var opportunityType = formContext.getAttribute("arup_opportunitytype").getValue();

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

function setupArupInternal(executionContext) {
    var formContext = executionContext.getFormContext();
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
    showSDGFields(formContext, arupInternal);
    if (!arupInternal) { return; }

    formContext.getControl("ccrm_countryofclientregistrationid").setVisible(false);
    formContext.getControl("ccrm_opportunitytype").setVisible(false);
    formContext.getControl("ccrm_countrycategory").setVisible(false);
    formContext.getControl("arup_importedsalarycost_num").setVisible(false);
    formContext.getControl("arup_importedstaffohcost_num").setVisible(false);
    formContext.getControl("arup_importedexpenses_num").setVisible(false);
    formContext.getControl("ccrm_arupuniversityiiaresearchinitiative").setVisible(false);
    formContext.getControl("ccrm_estprojectvalue_num").setVisible(false);
    formContext.getControl("arup_projpartreqd").setVisible(false);
}

function setBidDecisionChairRequired_ec(executionContext) {
    var formContext = executionContext.getFormContext();
    setBidDecisionChairRequired(formContext);
}

function setBidDecisionChairRequired(formContext) {

    var regionName;
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
    var opportunityType = formContext.getAttribute("arup_opportunitytype").getValue();
    var stage = getStageId(formContext);
    if (formContext.getAttribute("ccrm_arupregionid").getValue() != null) {
        regionName = formContext.getAttribute("ccrm_arupregionid").getValue()[0].name.toUpperCase();
    }

    var isRegionValidForBidDecision = (regionName == ArupRegionName.UKMEA.toUpperCase() || regionName == ArupRegionName.Americas.toUpperCase() || regionName == ArupRegionName.Europe.toUpperCase()) ? true : false;
    var isHidden = (!isRegionValidForBidDecision || opportunityType == 770000005 || arupInternal) ? true : false;
    var requiredLevel = (!isHidden && stage == ArupStages.Lead) ? 'required' : 'none';

    formContext.getControl("header_process_arup_biddecisionchair").setVisible(!isHidden);
    formContext.getControl("arup_biddecisionchair").setVisible(!isHidden);
    formContext.getControl("arup_biddecisionchair1").setVisible(!isHidden);
    formContext.getControl("arup_biddecisionproxy").setVisible(!isHidden);
    formContext.getControl("arup_biddecisiondate").setVisible(!isHidden);
    formContext.getAttribute("arup_biddecisionchair").setRequiredLevel(requiredLevel);
    if (isHidden) {
        formContext.getAttribute("arup_biddecisionchair").setValue(null);
    }
}

function checkBidDecionChair_ec(executionContext, attribute) {
    var formContext = executionContext.getFormContext();
    checkBidDecionChair(formContext, attribute);
}

function checkBidDecionChair(formContext, attribute) {
    var state = formContext.getAttribute("statecode").getValue();
    var arupRegion = formContext.getAttribute("ccrm_arupregionid").getValue();
    var opportunityType = formContext.getAttribute("arup_opportunitytype").getValue();
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
    var arupRegionName = (arupRegion != null) ? arupRegion[0].name.toLowerCase() : '';
    var stage = getStageId(formContext);

    if (arupRegionName == 'americas region') { return true; }

    if (state != 0 || arupInternal || opportunityType == 770000005 || stage != ArupStages.Lead ||
        (arupRegionName != 'europe' && arupRegionName != 'ukimea region')
    ) { return; }

    var bidDecisionChair = formContext.getAttribute("arup_biddecisionchair").getValue();
    var bidmanager = formContext.getAttribute("ccrm_bidmanager_userid").getValue();
    var biddirector = formContext.getAttribute("ccrm_biddirector_userid").getValue();
    if (bidDecisionChair != null && bidmanager != null && bidDecisionChair[0].id == bidmanager[0].id) {
        var errorMessage = 'Bid Decision Chair cannot be the same as Bid Manager or Bid Director';
        showAlertMessage(formContext, attribute, errorMessage);
        if (attribute == 'AP') { return false; }
    }
    else if (attribute == 'AP') { return true; }
}

function showAlertMessage(formContext, attribute, errorMessage) {

    Alert.show('<font size="6" color="#FF0000"><b>Bid Decision Chair</b></font>',
        '<font size="3" color="#000000"></br>' + errorMessage + '</font>',
        [
            {
                label: "<b>OK</b>",
                callback: function () {
                    if (attribute == 'BDC') {
                        formContext.getAttribute("arup_biddecisionchair").setValue(cacheValueBDC);
                    }
                    else if (attribute == 'BM') {
                        formContext.getAttribute("ccrm_bidmanager_userid").setValue(cacheValueBM);
                    }
                    else if (attribute == 'BD') {
                        formContext.getAttribute("ccrm_biddirector_userid").setValue(cacheValueBD);
                    }
                },
                setFocus: true,
                preventClose: false
            },
        ], "ERROR", 550, 200, '', true);
}

function BidReviewApprovalConfirmation(formContext, approvalType) {
    var ackMsg = BidReviewApprovalConfirmationMessage(formContext);

    Alert.show('<font size="6" color="#1B76D5"><b>Opportunity - Bid Review Approval</b></font>',
        '<font size="3" color="#000000"></br>' + ackMsg + '</font>',
        [
            {
                label: "<b>Confirm</b>",
                callback: function () {
                    approveCallbackAction(formContext, approvalType);
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

function BidReviewApprovalConfirmationMessage(formContext) {
    var bidReviewChair = formContext.getAttribute("ccrm_bidreviewchair_userid").getValue();
    var bidManager = formContext.getAttribute("ccrm_bidmanager_userid").getValue();
    var bidDirector = formContext.getAttribute("ccrm_biddirector_userid").getValue();
    var isBidManager = false;
    var isBidDirector = false;

    var userId = globalContext.userSettings.userId;
    var userName = globalContext.userSettings.userName;

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

function retreiveOrganisationChecks(executionContext) {

    var formContext = executionContext.getFormContext();
    //Check if client is not Unassigned and Not Internal Opportuntiy
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
    var client = formContext.getAttribute("ccrm_client").getValue();
    if (client != null && client[0].name != 'Unassigned' && arupInternal != true) {
        var oppSanctionCheck = formContext.getAttribute("arup_duediligencecheck").getValue();
        var clientDirty = formContext.getAttribute("ccrm_client").getIsDirty();
        if (client != null) {
            var clientId = client[0].id.replace('{', '').replace('}', '');
            var req = new XMLHttpRequest();
            req.open("GET",
                formContext.context.getClientUrl() +
                "/api/data/v9.1/accounts(" +
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
                        var arup_creditValue = result["arup_creditcheck@OData.Community.Display.V1.FormattedValue"];
                        if (arup_creditValue != null) {
                            formContext.getAttribute("arup_creditcheck").setValue(arup_creditcheck);
                        } else {
                            formContext.getAttribute("arup_creditcheck").setValue(null);
                        }
                            
                        var arup_duediligencecheck = result["arup_duediligencecheck"];
                        if (arup_duediligencecheck != null) { // If Sanctions is null on Client
                            formContext.getAttribute("arup_duediligencecheck").setValue(arup_duediligencecheck);
                        } else {
                            formContext.getAttribute("arup_duediligencecheck").setValue(null);
                        }

                        if (oppSanctionCheck != null && !clientDirty) { // If sanctions is null on Opportunity
                            formContext.getAttribute("arup_duediligencecheck").setValue(oppSanctionCheck);
                            formContext.getAttribute("arup_sanctionschecktrigger").setValue(true);
                        } else if (!clientDirty) { // If Client is not dirty //Top right coner in Design                                            
                            formContext.getAttribute("arup_sanctionschecktrigger").setValue(true);
                            formContext.data.save();
                            setTimeout(function () {
                                formContext.getAttribute("arup_sanctionschecktrigger").fireOnChange();
                            }, 3000);
                        }
                        setTimeout(function () {
                            formContext.getAttribute("arup_duediligencecheck").fireOnChange();
                        }, 1000);
                    }
                }
            };
            req.send();
        }
    }
}

function checkOrganisationChecks(executionContext) {

    var formContext = executionContext.getFormContext();
    setTimeout(function () {
        var client = formContext.getAttribute("ccrm_client").getValue();
        if (client != null) {
            var clientId = client[0].id.replace('{', '').replace('}', '');
            var req = new XMLHttpRequest();
            req.open("GET",
                formContext.context.getClientUrl() + "/api/data/v9.1/accounts(" + clientId + ")?$select=arup_duediligencecheck", true);
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
                        var arup_duediligencecheck = formContext.getAttribute("arup_duediligencecheck").getValue();
                        if ((arup_duediligencecheck != org_duediligencecheck))
                            setOrganisationChecks(formContext, arup_duediligencecheck);
                    }
                }
            };
            req.send();
        }
    }, 5000);
}

function setOrganisationChecks(formContext, arup_duediligencecheck) {
    var client = formContext.getAttribute("ccrm_client").getValue();
    if (client != null) {
        var clientId = client[0].id.replace('{', '').replace('}', '');
    } else {
        return;
    }

    var entity = {};
    entity.arup_duediligencecheck = arup_duediligencecheck;
    entity.arup_lastddcheckdate = new Date();

    var req = new XMLHttpRequest();
    req.open("PATCH", formContext.context.getClientUrl() + "/api/data/v9.1/accounts(" + clientId + ")", true);
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

function showSDGFields(formContext, arupInternal) {
    if (arupInternal) {
        formContext.getControl("header_process_arup_keymarkets").setVisible(false);
        formContext.getControl("header_process_arup_sharedvalues").setVisible(false);
        formContext.getControl("header_process_arup_safeguardplanet").setVisible(false);
        formContext.getControl("header_process_arup_partnership").setVisible(false);
        formContext.getControl("header_process_arup_betterway").setVisible(false);

        formContext.getControl("arup_keymarkets").setVisible(false);
        formContext.getControl("arup_sharedvalues").setVisible(false);
        formContext.getControl("arup_safeguardplanet").setVisible(false);
        formContext.getControl("arup_partnership").setVisible(false);
        formContext.getControl("arup_betterway").setVisible(false);
    } else {
        formContext.getAttribute("arup_keymarkets").setRequiredLevel("required");
        formContext.getAttribute("arup_sharedvalues").setRequiredLevel("required");
        formContext.getAttribute("arup_safeguardplanet").setRequiredLevel("required");
        formContext.getAttribute("arup_partnership").setRequiredLevel("required");
        formContext.getAttribute("arup_betterway").setRequiredLevel("required");
    }
}