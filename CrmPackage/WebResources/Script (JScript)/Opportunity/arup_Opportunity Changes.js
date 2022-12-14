var cacheValueBDC = null;
var cacheValueBM = null;
var cacheValueBD = null;

function onSelectOfStage(formContext, selStageId) {
    if (selStageId == null || selStageId == 'undefined')
        if (formContext.getAttribute === undefined)
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

            if (stageId == ArupStages.Lead || isPartOfDQTeam(formContext) || isPartOfSuperUser(formContext)) {

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
function CloseOpportunity(formContext, statusCode, isCloseFramework) {
    var oppId = formContext.data.entity.getId().replace(/[{}]/g, "");
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
    var clientUrl = formContext.context.getClientUrl();
    var activeStageId = formContext.data.process.getActiveStage().getId();
    var oppDetails = getOpportunityReasons(formContext.context.getClientUrl(), activeStageId, statusCode, arupInternal, isCloseFramework == true ? true : false);
    var isFrameworkOpty = (formContext.getAttribute("arup_opportunitytype").getValue() == '770000003') ? true : false;

    formContext.getAttribute("arup_biddecisionchair").setRequiredLevel('none');
    formContext.getAttribute("ccrm_bidreviewchair_userid").setRequiredLevel('none');

    //set all fields as non required while closing as lost
    byPassRequiredFields(formContext);

    formContext.data.save().then(
        function success(status) {

            setTimeout(function () {
                if (oppDetails != null) {
                    var object = JSON.stringify(oppDetails);
                    var customParameters = "&oppId=" + oppId + "&oppDetails=" + object + "&statusCode=" + statusCode + "&clientUrl=" + clientUrl + "&isFrameworkOpty=" + isFrameworkOpty;
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
                            if (isFrameworkOpty && statusCode == "won" && parent.buttonEvent == 'UpdateFrameworkWon') {
                                var messageText = 'A Framework record has been created using information from this opportunity.  It can be accessed from the Frameworks/Panels link at the side of the CRM screen.  Please ensure that the record is completed as soon as possible, before any opportunity is taken out for work under the framework. \n\n This opportunity will be kept open so that the fee value and Arup Project End Date(the end date of the framework) can be updated as per regional guidelines.';
                                DisplayFrameworkPopUp(messageText);
                            }

                            formContext.ui.clearFormNotification('userNotify');
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

function byPassRequiredFields(formContext) {
    formContext.data.entity.attributes.forEach(function (attribute, index) {
        if (attribute.getRequiredLevel() == "required") {
            var attributename = attribute.getName();
            formContext.getAttribute(attributename).setRequiredLevel("none");
        }
    });
}

function DisplayFrameworkPopUp(messageText) {
    var customParameters = "&messageText=" + messageText;
    DisplayWebResource("arup_PopUp", customParameters, 400, 800);
}

function getOpportunityReasons(ClientUrl, activeStageId, statusCode, arupInternal, isCloseFrameWork) {

    var ccrm_lostopp_reason = new String();
    var ccrm_lostopp_resaon_values = new String();
    var ccrm_wonopp_reason = new String();
    var ccrm_wonopp_resaon_values = new String();
    var dictionary = {};
    var req = new XMLHttpRequest();
    var isFrameworkOpportunity = (formContext.getAttribute("arup_opportunitytype").getValue() == '770000003') ? true : false;

    //Shruti: Consider the filter of isFrameworkOpportunity and closeframework only when stage is confirmed job-commercial or CJN approval. Otherwise at all other stages framework opportunity can be closed as lost as any other opportunity.
    if (activeStageId == ArupStages.ConfirmJob || IsCJNApprovalStage(activeStageId))
        req.open("GET", ClientUrl + "/api/data/v9.1/arup_closeopportunityreasons?$select=arup_lostreasons,arup_wonreasons,arup_frameworkwonopportunityreason&$filter=ccrm_stageid eq '" + activeStageId + "' and  arup_arupinternalopportunity eq " + arupInternal + " and  arup_isframeworkopportunity eq " + isFrameworkOpportunity + " and  arup_closeframework eq " + isCloseFrameWork, false);
    else
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
                    if (isFrameworkOpportunity) {
                        ccrm_wonopp_reason = results.value[0]["arup_frameworkwonopportunityreason@OData.Community.Display.V1.FormattedValue"]
                        var reasonValue = ccrm_wonopp_reason.split(';');
                        ccrm_wonopp_resaon_values = results.value[0].arup_frameworkwonopportunityreason;
                        var reasonkey = ccrm_wonopp_resaon_values.split(',');
                    } else {
                        ccrm_wonopp_reason = results.value[0]["arup_wonreasons@OData.Community.Display.V1.FormattedValue"]
                        var reasonValue = ccrm_wonopp_reason.split(';');
                        ccrm_wonopp_resaon_values = results.value[0].arup_wonreasons;
                        var reasonkey = ccrm_wonopp_resaon_values.split(',');
                    }
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
    if (statusCode == "cjn") {
        var arupCompany = formContext.getAttribute('ccrm_arupcompanyid').getValue();

        if (arupCompany != null) {
            denyArupCompanyPJN(formContext, arupCompany[0].id);
        }
    }

    formContext.data.save().then(
        function success(status) {
            var clientURL = formContext.context.getClientUrl();
            var client = formContext.getAttribute("ccrm_client").getValue();
            var arupInternal = (formContext.getAttribute("ccrm_arupinternal").getValue() == 1) ? true : false;

            if (client[0].id != null && client[0].id.toLowerCase() == "{9c3b9071-4d46-e011-9aa7-78e7d1652028}") {
                Alert.show('<font size="6" color="#FF0000"><b>Unassigned Client</b></font>',
                    '<font size="3" color="#000000"></br>A valid Client is required.</font>',
                    [
                        { label: "<b>OK</b>", setFocus: true },
                    ], "ERROR", 450, 200, clientURL, true);
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
                        ], 'INFO', 800, 430, clientURL, true);
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
    var clientURL = formContext.context.getClientUrl();
    if (!checkBidDecionChair(formContext, 'AP')) { return; }

    SetFieldRequirementForPreBidStage(formContext);

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
                        ], 'QUESTION', 800, 470, clientURL, true);
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

    ShowFields(formContext, false, "ccrm_countryofclientregistrationid", "ccrm_opportunitytype", "ccrm_countrycategory", "arup_importedsalarycost_num", "arup_importedstaffohcost_num", "arup_importedexpenses_num", "ccrm_arupuniversityiiaresearchinitiative", "ccrm_estprojectvalue_num", "arup_projpartreqd", "arup_services", "arup_services1", "arup_projecttype", "arup_projecttype1", "arup_projectsector", "arup_projectsector1", "ccrm_confidential", "ccrm_arupuniversityiiaresearchinitiative1", "arup_projpartreqd1", "ccrm_estprojectvalue_num1", "arup_creditcheck", "arup_creditcheck1", "arup_creditcheck2", "arup_creditcheck3", "arup_duediligencecheck", "arup_duediligencecheck1", "arup_duediligencecheck2", "arup_duediligencecheck3", "ccrm_arups_role_in_project", "ccrm_arups_role_in_project1", "ccrm_referredby_accountid");
    ShowSections(formContext, false, "Bid_Details_Tab", "Bid_Details_Tab_section_7", "tab_6_section_3", "tab_7_section_5");
    ShowSections(formContext, false, "Developing_Bid_tab", "Developing_Bid_tab_section_4");
    ShowSections(formContext, false, "Confirmed_Job_commercial_Tab", "Confirmed_Job_commercial_Tab_section_3");

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
    //  var requiredLevel = (!isHidden && stage == ArupStages.Lead) ? 'required' : 'none';

    var control = formContext.getControl("header_process_arup_biddecisionchair");
    if (control != null) control.setVisible(!isHidden);
    formContext.getControl("arup_biddecisionchair").setVisible(!isHidden);
    formContext.getControl("arup_biddecisionchair1").setVisible(!isHidden);
    formContext.getControl("arup_biddecisionproxy").setVisible(!isHidden);
    formContext.getControl("arup_biddecisiondate").setVisible(!isHidden);
    //   formContext.getAttribute("arup_biddecisionchair").setRequiredLevel(requiredLevel);
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
        ], "ERROR", 550, 200, formContext.context.getClientUrl(), true);
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
        ], 'QUESTION', 800, 400, formContext.context.getClientUrl(), true);
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

function checkDueDiligenceResults(executionContext) {
    var formContext = executionContext.getFormContext();
    var isWriteable = ({ 1: 'Create', 2: 'Update' }).hasOwnProperty(formContext.ui.getFormType());
    if (isWriteable) {
        retreiveOrganisationChecks(formContext);
    }
}

function retreiveOrganisationChecks(formContext) {

    var clientName = ["ccrm_client", "ccrm_ultimateendclientid"];
    var clientDDCheckResult;
    var ultimateClientDDresult;
    for (var i = 0; i < clientName.length; i++) {

        var client = formContext.getAttribute(clientName[i]).getValue();

        var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
        var isWriteable = ({ 1: 'Create', 2: 'Update' }).hasOwnProperty(formContext.ui.getFormType());
        if (client != null && client[0].name != 'Unassigned' && arupInternal != true && isWriteable) {
            var clientDirty = formContext.getAttribute(clientName[i]).getIsDirty();
            if (client != null) {
                var clientId = client[0].id.replace('{', '').replace('}', '');
                var req = new XMLHttpRequest();
                req.open("GET",
                    formContext.context.getClientUrl() +
                    "/api/data/v9.1/accounts(" +
                    clientId +
                    ")?$select=arup_creditcheck,arup_duediligencecheck",
                    false);
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

                            if (clientName[i] == "ccrm_client") {
                                var arup_creditcheck = result["arup_creditcheck"];
                                var arup_creditValue = result["arup_creditcheck@OData.Community.Display.V1.FormattedValue"];
                                if (arup_creditValue != null) {
                                    formContext.getAttribute("arup_creditcheck").setValue(arup_creditcheck);
                                } else {
                                    formContext.getAttribute("arup_creditcheck").setValue(null);
                                }
                            }

                            var arup_duediligencecheck = result["arup_duediligencecheck"];

                            if (clientName[i] == "ccrm_client") {
                                if (arup_duediligencecheck != null) {
                                    clientDDCheckResult = arup_duediligencecheck;
                                } else {
                                    formContext.getAttribute("arup_sanctionschecktrigger").setValue(true);
                                }
                            }

                            if (clientName[i] == "ccrm_ultimateendclientid") {
                                if (arup_duediligencecheck != null) {
                                    ultimateClientDDresult = arup_duediligencecheck;
                                } else {
                                    formContext.getAttribute("arup_sanctionschecktrigger").setValue(true);
                                }
                            }

                            if (clientDirty) {
                                formContext.getAttribute("arup_sanctionschecktrigger").setValue(true);
                                setTimeout(function () {
                                    formContext.getAttribute("arup_sanctionschecktrigger").fireOnChange();
                                }, 3000);
                            }
                        }
                    }
                };
                req.send();
            }
        }
    }

    setSanctionResultOnOppor(formContext, clientDDCheckResult, ultimateClientDDresult);
}

function setSanctionResultOnOppor(formContext, clientDDCheckResult, ultimateClientDDresult) {
    if (clientDDCheckResult == 3 || ultimateClientDDresult == 3) {
        formContext.getAttribute("arup_duediligencecheck").setValue(3);
    } else if (clientDDCheckResult == 8 || ultimateClientDDresult == 8) {
        formContext.getAttribute("arup_duediligencecheck").setValue(8);
    } else if (clientDDCheckResult == 2 || ultimateClientDDresult == 2) {
        formContext.getAttribute("arup_duediligencecheck").setValue(2);
    } else if (clientDDCheckResult == 1 || ultimateClientDDresult == 1) {
        formContext.getAttribute("arup_duediligencecheck").setValue(1);
    } else {
        formContext.getAttribute("arup_duediligencecheck").setValue(7);
    }
}

function showSDGFields(formContext, arupInternal) {
    if (arupInternal) {
        formContext.ui.tabs.get("Pre-Bid_Tab").sections.get("PreBid_Sustainable_Development").setVisible(false);
        formContext.ui.tabs.get("Confirmed_Job_Project_Tab").sections.get("Confirmed_Job_Project_Sustainable_Development").setVisible(false);
        formContext.ui.tabs.get("Project_Details_Tab").sections.get("Project_Details_Sustainable_Development").setVisible(false);
    }
}

function SetSGDMultiSelect(executionContext, fieldname) {
    var formContext = executionContext.getFormContext();
    if (fieldname == "" || fieldname == null) return;
    var fieldLength = formContext.getAttribute(fieldname).getOptions().length;
    var selectedValues = formContext.getAttribute(fieldname).getValue();
    if (selectedValues == null || selectedValues.length == 0) return;
    var notApplicable = selectedValues.includes(99);

    if (notApplicable) {
        if (selectedValues.length < fieldLength) {
            formContext.getAttribute(fieldname).setValue([99]);
            formContext.ui.setFormNotification('You have selected "None of Above" option for ' + fieldname + ' . This will not allow you to add more options.', 'INFO', '3');
        }
        setTimeout(function () { formContext.ui.clearFormNotification('3'); }, 10000);
    }
}

function saveMultiSelectFields(executionContext) {
    var formContext = executionContext.getFormContext();
    var multiSelectFields = ["arup_keymarkets", "arup_sharedvalues", "arup_betterway", "arup_safeguardplanet"]

    multiSelectFields.forEach(function (fieldname) {
        var isfieldDirty = formContext.getAttribute(fieldname).getIsDirty();

        if (isfieldDirty) {
            var fieldLength = formContext.getAttribute(fieldname).getOptions().length;
            var selectedValues = formContext.getAttribute(fieldname).getValue();
            if (selectedValues == null || selectedValues.length == 0) return;
            var notApplicable = selectedValues.includes(99);

            if (notApplicable) {
                if (selectedValues.length == fieldLength) {
                    var removeValues = [99];
                    updatedValues = RemoveFromArray(selectedValues, removeValues);
                    formContext.getAttribute(fieldname).setValue(updatedValues);
                }
            }
        }
    });
}


function RemoveFromArray(existingValues, removeValues) {
    if (existingValues === null || Array.isArray(existingValues) === false) {
        return removeValues;
    }
    if (removeValues === null || Array.isArray(removeValues) === false) {
        return existingValues;
    }

    return existingValues.filter(function (value, index) {
        return removeValues.indexOf(value) == -1;
    })
}

function QualificationStatus_OnChange_ec(executionContext) {
    var formContext = executionContext.getFormContext();
    QualificationStatusNotification(formContext)
}

function QualificationStatusNotification(formContext) {
    var currentStage = getStageId(formContext);
    var qualificationStatus = formContext.getAttribute("arup_qualificationstatus").getText();
    if (qualificationStatus != null && currentStage == ArupStages.Lead && formContext.getAttribute("arup_isqualificationadded").getValue())
        formContext.ui.setFormNotification(qualificationStatus, 'INFO', 'QualificationStatusMsg');
    else
        formContext.ui.clearFormNotification('QualificationStatusMsg');
}