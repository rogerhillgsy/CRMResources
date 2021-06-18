//
// Ensure that the javascript commands required in arup_opportunitybuttons.html are accessible.
//
// Normally javascript functions are not visible from the Web resource in an iframe.
// By attaching them to Xrm.Page, they are then visible and callable from within the iframe.
//
// The main entry points to the button functionality that are important in this file are: -
// - displayActiveTabForStage
// - OnTabStateChange
//
// displayActiveTabForStage will ensure that the opportunity form only displays the tab(s) apropriate to the current BFP stage.
// This is called when the page first loads (FormOnLoad, as defined in the form properties)
// OnTabStateChange is called when the displayed BPF stage change. It is called to refresh 
//  any buttons that may be displayed are updated(to change visibility, etc.)

Arup = (
    function () {
        function GetAttribute(formContext, attrName) {
            var attr = formContext.getAttribute(attrName);
            if (attr != null) {
                attr = attr.getValue();
            }
            return attr;
        };

        Log = console.log.bind(window.console);
        var tabStateChangeCallbackAdded = false;
        var buttonChangeCallbacks = {};


        var obj = {
            ButtonState: {
                ActiveTab: "Summary"
            },
    
            // Functions related to specific buttons ---------------------

            IsRequestPossibleJobEnabled: function (formContext) {
                var pjnrequired = GetAttribute(formContext, "ccrm_possiblejobnumberrequired");
                var isCreate = formContext.ui.getFormType() == 1;
                var showPJNButton = GetAttribute(formContext, "ccrm_showpjnbutton");
                var statuscode = GetAttribute(formContext, "statuscode");
                var statecode = GetAttribute(formContext, "statecode");
                return pjnrequired != 1 && !isCreate && showPJNButton == 1 && statuscode != 3 && statecode != 1;
            },

            BidDicisionConfirmation: function () {
                BidDicisionConfirmation(formContext);
            },

            IsBidDicisionApprovalEnable: function (formContext) {
                return hideButtonBidDecisionApproval(formContext);
            },

            IsPMPDApprovalEnabled: function (formContext) {
                var statecode = GetAttribute(formContext, "statecode");
                var pmpdApprovalOptions = GetAttribute(formContext, "ccrm_projmgrdirapprovaloptions");

                return statecode == 0 && (pmpdApprovalOptions == 100000000 || pmpdApprovalOptions == 100000002);
            },

            IsAccCentreApprovalEnabled: function (formContext) {
                var statecode = GetAttribute(formContext, "statecode");
                var accCentreApprovalOptions = GetAttribute(formContext, "ccrm_acctcentleadapprovaloptions");

                return statecode == 0 && (accCentreApprovalOptions == 100000000 || accCentreApprovalOptions == 100000002);
            },

            IsFinanceApprovalEnabled: function (formContext) {
                var statecode = GetAttribute(formContext, "statecode");
                var finaceApprovalOptions = GetAttribute(formContext, "ccrm_financeapprovaloptions");

                return statecode == 0 && (finaceApprovalOptions == 100000000 || finaceApprovalOptions == 100000002);
            },

            IsCJNGroupLeaderApprovalEnabled: function (formContext) {

                var statecode = GetAttribute(formContext, "statecode");
                var cjnGrpLeaderApprovalOptions = GetAttribute(formContext, "ccrm_groupleadercjnapprovaloptions");

                return statecode == 0 && (cjnGrpLeaderApprovalOptions == 100000000 || cjnGrpLeaderApprovalOptions == 100000002);
            },

            IsGroupLeaderApprovalEnabled: function (formContext) {
                var statecode = GetAttribute(formContext, "statecode");
                var grpApprovalOptions = GetAttribute(formContext, "ccrm_groupleaderapprovaloptions");

                return statecode == 0 && (grpApprovalOptions == 100000000 || grpApprovalOptions == 100000002);
            },

            PJNApproveGroupLeader: function () {
                ApprovalButtonClick(formContext, "Approve",
                    "GroupLeader",
                    "ccrm_groupleaderapprovaloptions",
                    "ccrm_groupleaderapproval",
                    "ccrm_groupleaderapprovaldate");
            },

            CJNApproveGroupLeader: function () {
                CJNApprovalButtonClick(formContext, "Approve",
                    "GroupLeaderApproval",
                    "ccrm_groupleadercjnapprovaloptions",
                    "ccrm_groupleadercjnapproval",
                    "ccrm_groupleadercjnapprovaldate");
            },

            CJNApprovePMPD: function (formContext) {
                CJNApprovalButtonClick(formContext, "Approve",
                    "ProjectManagerApproval",
                    "ccrm_projmgrdirapprovaloptions",
                    "ccrm_projmgrdirapproval",
                    "ccrm_projmgrdirapprovaldate");
            },

            CJNApproveAccountingCentre: function (formContext) {
                CJNApprovalButtonClick(formContext, "Approve",
                    "AccCenterLeadApproval",
                    "ccrm_acctcentleadapprovaloptions",
                    "ccrm_acctcentleadapproval",
                    "ccrm_acctcentleadapprovaldate");
            },
            CJNApproveFinance: function (formContext) {
                CJNApprovalButtonClick(formContext, "Approve",
                    "FinanceApproval",
                    "ccrm_financeapprovaloptions",
                    "ccrm_financeapproval",
                    "ccrm_financeapprovaldate");
            },

            IsRegionalSectorLeaderApprovalEnabled: function (formContext) {

                var statecode = GetAttribute(formContext, "statecode");
                var sectorApprovalOptions = GetAttribute(formContext, "ccrm_regionalpracticeleaderapprovaloptions");
                var oppType = GetAttribute(formContext, "ccrm_opportunitytype");

                return statecode == 0 &&
                    oppType == 200003 &&
                    (sectorApprovalOptions == 100000000 || sectorApprovalOptions == 100000002);
            },

            IsSectorLeaderApprovalEnabled: function (formContext) {

                var statecode = GetAttribute(formContext, "statecode");
                var sectorApprovalOptions = GetAttribute(formContext, "ccrm_practiceleaderapprovaloptions");
                var oppType = GetAttribute(formContext, "ccrm_opportunitytype");

                return statecode == 0 &&
                    oppType == 200002 &&
                    (sectorApprovalOptions == 100000000 || sectorApprovalOptions == 100000002);
            },

            IsBidDirectorApprovalEnabled: function (formContext) {

                var statecode = GetAttribute(formContext, "statecode");
                var bdApprovalOptions = GetAttribute(formContext, "ccrm_biddirectorapprovaloptions");
                return statecode == 0 &&
                    (bdApprovalOptions == 100000000 || bdApprovalOptions == 100000002);
            },


            PJNApproveBidDirector: function () {
                ApprovalButtonClick(formContext, "Approve",
                    "BidDirector",
                    "ccrm_biddirectorapprovaloptions",
                    "ccrm_biddirectorapproval",
                    "ccrm_biddirectorapprovaldate");
            },

            PJNApproveRegionalSectorLeader: function () {
                ApprovalButtonClick(formContext, "Approve",
                    "RegionalPracticeLeader",
                    "ccrm_regionalpracticeleaderapprovaloptions",
                    "ccrm_regionalpracticeleaderapproval",
                    "ccrm_regionalpracticeleaderapprovaldate");
            },

            PJNApproveSectorLeader: function () {
                ApprovalButtonClick(formContext, "Approve",
                    "PracticeLeader",
                    "ccrm_practiceleaderapprovaloptions",
                    "ccrm_practiceleaderapproval",
                    "ccrm_practiceleaderapprovaldate");
            },

            IsRegionalCOOApprovalEnabled: function (formContext) {
                // ccrm_opportunitytype = 200003 - Risk Level 3
                // statecode = 0 (active)
                //    (
                //          ccrm_regioncooapprovaloptions == 100000000  // Awaiting response
                //       or ccrm_regioncooapprovaloptions == 100000002  // declined
                //     )
                var statecode = GetAttribute(formContext, "statecode");
                var cooApprovalOptions = GetAttribute(formContext, "ccrm_regioncooapprovaloptions");
                var oppType = GetAttribute(formContext, "ccrm_opportunitytype");

                return statecode == 0 &&
                    oppType == 200003 &&
                    (cooApprovalOptions == 100000000 || cooApprovalOptions == 100000002);
            },

            PJNApproveRegionalCOO: function () {
                ApprovalButtonClick(formContext, "Approve",
                    "RegionalCOO",
                    "ccrm_regioncooapprovaloptions",
                    "ccrm_regioncooapproval",
                    "ccrm_regionalcooapprovaldate");
            },

            ApproveRegionalCOO: function (formContext) {
                CJNApprovalButtonClick("Approve",
                    "RegionalCOO",
                    "ccrm_regioncooapprovaloptions",
                    "ccrm_regioncooapproval",
                    "ccrm_regionalcooapprovaldate");
            },

            IsApproveBidReviewEnabled: function (formContext) {
                // ccrm_shwbidreviewappbtn = 1 (Yes)
                // statecode = 0 (active)
                var statecode = GetAttribute(formContext, "statecode");
                var showBidReviewButton = GetAttribute(formContext, "ccrm_shwbidreviewappbtn");

                return statecode == 0 && showBidReviewButton == 1;
            },

            //IsApproveBidReviewApproved: function(formContext) {
            //    // statecode = 0 (active)
            //    // ccrm_bidreviewoutcome == 100000002
            //    var statecode = GetAttribute(formContext, "statecode");
            //    var bidReviewOutcome = GetAttribute(formContext, "ccrm_bidreviewoutcome");

            //    return statecode == 0 && bidReviewOutcome == 100000002;
            //},

            ApproveBidReview: function () {
                BidReviewApprovalClick(formContext);
            },

            IsBidSubmittedEnabled: function (formContext) {
                return hideButtonBidSubmitted(formContext);
            },

            BidSubmitted: function () {
                BidSubmittedClick(formContext);
            },

            RemoveBidSubmittedNotification: function () {
                formContext.ui.clearFormNotification('userNotify');
            },           

            AddProjectParticipant: function () {
                addProjectParticipant(formContext);
            },

            IsAddProjectParticipantEnabled: function (formContext) {
                return hideButtonProjectCollaborator(formContext);
            },

            IsInternalOpportunity: function (formContext) {
                return GetAttribute(formContext, "ccrm_arupinternal");
            },

            HideShowBidDevTab: function (formContext) {
                HideShowBidDevTab(formContext);
            },

            IsPJNCostTabVisible: function (formContext) {              
                return HideShowPJNCostTab(formContext);
            },

            HideShowPJNCostTab: function (formContext) {
                HideShowPJNCostTab(formContext);
            },

            HideShowQualificationTab: function (formContext, activeStage) {
                HideShowQualificationTab(formContext, activeStage);
            },
            AddRemoveQualificationTab: function (formContext, isVisible, addOrRemove) {
                AddRemoveQualificationTab(formContext, isVisible, addOrRemove);
            },

            IsQualificationAdded: function (formContext) {
                return GetAttribute(formContext, "arup_isqualificationadded");
            },

            IsPreBidStage: function (formContext) {
                var activeStageName = formContext.data.process.getActiveStage();
                activeStageName = activeStageName == null ? null : activeStageName.getName();
                return activeStageName == "PRE-BID";
            },

            IsCrossRegion: function (formContext) {
                var crossregionbid = false;
                var regionid;
                var projectRegionid;
                var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();

                if (formContext.getAttribute("ccrm_arupregionid").getValue() != null) {
                    regionid = formContext.getAttribute("ccrm_arupregionid").getValue()[0].id.replace('{', '').replace('}', '').toUpperCase();
                }

                if (formContext.getAttribute("ccrm_projectcountryregionid").getValue() != null) {
                    projectRegionid = formContext.getAttribute("ccrm_projectcountryregionid").getValue()[0].id.replace('{', '').replace('}', '').toUpperCase();
                }
                crossregionbid = regionid != null && projectRegionid != null && regionid != projectRegionid && !arupInternal;
                return crossregionbid;
            },
            
            // General Utility functions ----------------------
            SetupTabsForStage: function (formContext) {

                // And the active BPF stage
                var activeStageName = formContext.data.process.getActiveStage();
                activeStageName = activeStageName == null ? null : activeStageName.getName();
                var activeTabName = obj.stageToTabMapping[activeStageName];               
                Arup.ActiveTabName = activeTabName;
                Arup.MainActiveTabForStage = activeTabName;
                Log("activeTabName :" + activeTabName);

                if (activeStageName != null) {
                    // Decide which tabs should be visible.
                    Log("Displaying tabs for process stage " + activeStageName + " / " + activeTabName);
                    obj.DisplayTab(activeTabName, formContext);                  
                    obj.setVisibleTabs(formContext, obj.staticTabs.concat([activeTabName]));
                    obj.HideShowBidDevTab(formContext);
                    obj.HideShowPJNCostTab(formContext);
                    obj.HideShowQualificationTab(formContext, activeStageName);
                    if (buttonChangeCallbacks[activeTabName] != null) {
                        buttonChangeCallbacks[activeTabName]();
                    }
                }
            },

            setVisibleTabs: function (formContext, tabList) {

                var tabs = formContext.ui.tabs.get();
                for (var t in tabs) {
                    var tab = tabs[t];
                    var tabName = tab.getName();
                    if (tabList.indexOf(tabName) > -1) {
                        tab.setVisible(true);
                    } else {
                        tab.setVisible(false);
                    }
                }
                if (formContext.getAttribute('statecode').getValue() != 0 || formContext.getAttribute('arup_frameworkwon').getValue() == 1) {
                    formContext.ui.tabs.get("Summary").setFocus();
                }
            },

            GetTabNumber: function (formContext, tabName) {
                var tabs = formContext.ui.tabs.get();
                var tabNum = null;
                for (var t in tabs) {
                    var tab = tabs[t];
                    if (tab.getName() == tabName) {
                        tabNum = t;
                    }
                }
                return tabNum;
            },

            BPFMoveNext: function (formContext, successCallback) {
                // BPFMoveNext(); -- existing function does not seem relevant to V9
                var opportunityType = GetAttribute(formContext, "arup_opportunitytype");
                if (opportunityType == '770000005') {
                    return;
                }

                SetFieldRequirementForPreBidStage(formContext);
                SetFieldRequirementForDevelopingBidStage(formContext);
                // Make sure form is saved.
                //  formContext.data.entity.save();
                formContext.data.save().then(
                    function success(status) {
                        Log("success status" + status);
                        var process = formContext.data.process;
                        if (process != null) {
                            process.moveNext(
                                function (result) {
                                    Log("result is " + result);
                                    if (result == "success") {
                                        obj.SetupTabsForStage(formContext);
                                        !!successCallback();
                                    } else {
                                        Xrm.Navigation.openAlertDialog({
                                            title: "Process error",
                                            text: "Unable to move to next stage: " + result
                                        });
                                    }
                                });
                        }
                    },
                    function (status) {
                        Log("failure status " + status);
                    });
            },

            stageToTabMapping: {
                "PRE-BID": "Pre-Bid_Tab",
                "CROSS REGION": "Cross_Region_Tab",
                "PJN APPROVAL": "PJN_Approval_tab",
                "DEVELOPING BID": "Developing_Bid_tab",
                "BID REVIEW/SUBMISSION": "Bid_Review_Submission_tab",
                "CONFIRMED JOB - PROJECT": "Confirmed_Job_Project_Tab",
                "CONFIRMED JOB - COMMERCIAL": "Confirmed_Job_commercial_Tab",
                "CJN APPROVAL": "CJN_Approval_tab",
            },
            TabToWebResourceMapping: {
                "Pre-Bid_Tab": "WebResource_buttonnavigation",
                "Cross_Region_Tab": "WebResource_crossregionnavigation",
                "PJN_Approval_tab": "WebResource_developingbidnavigation",
                "Developing_Bid_tab": "WebResource_developingbidnavigation",
                "Bid_Review_Submission_tab": "WebResource_bidreviewsubmissionnavigation",
                "Confirmed_Job_Project_Tab": "WebResource_confirmedjobprojectnavigation",
                "Confirmed_Job_commercial_Tab": "WebResource_confirmedjobcommercialnavigation",
                "CJN_Approval_tab": "WebResource_cjnapprovalnavigation",
                "PJN_Approval_tab": "WebResource_pjnapprovalnavigation",
                "Project_Financials_Tab": "WebResource_projectfinancialsnavigation",
                "PJN_Costs_Tab": "WebResource_navigation",
            },

            staticTabs: [
                'PJN_Costs_Tab', 'Project_Financials_Tab', 'Project_Details_Tab',
                'Bid_Details_Tab', 'Notes_tab', 'Summary'
            ],
            // Entry point from the form properties.
            // This is set up as en event handler to be called from the main CRM opportunity form.
            // Display the active tab according to the current stage.
            displayActiveTabForStage: function (executionContext) {

                var formContext = executionContext.getFormContext();
                obj.SetupTabsForStage(formContext);
                formContext.data.process.addOnStageChange(function (executionContext) {
                    Log("Process stage Change");
                    var formContext = executionContext.getFormContext();
                    obj.SetupTabsForStage(formContext);
                
                });
            },

            DisplayTab: function (tabName, formContext) {

                var tab = formContext.ui.tabs.get(tabName);
                tab.setFocus();
                tab.setVisible(true);
                var tabDisplayState = tab.getDisplayState();
                if (tabDisplayState != "expanded")
                    tab.setDisplayState("expanded");

                if (buttonChangeCallbacks[tabName] != null) {
                    buttonChangeCallbacks[tabName]();
                }
                Arup.ActiveTabName = tabName;
                return tabName;
            },

            OnDisplayingTab: function (formContext, tabName, callback) {
                buttonChangeCallbacks[tabName] = callback;
                if (!tabStateChangeCallbackAdded) {
                    tabStateChangeCallbackAdded = true;
                    var tabs = formContext.ui.tabs.get();
                    for (var t in tabs) {
                        var tab = tabs[t];
                        tab.addTabStateChange(OnTabStateChange);
                    }
                }

            },
        };

       

        function OnTabStateChange(e) {
            var source = e.getEventSource();
            var formContext = e.getFormContext();
            if (source.getDisplayState() == "collapsed") {
                Arup.PreviousTab = source.getName();
                delete buttonChangeCallbacks[source.getName()];
            }
            if (source.getDisplayState() == "expanded") {
                var tabName = source.getName();
                Log("Tab expanded :" + tabName);
                if (buttonChangeCallbacks[tabName] != null) {
                    buttonChangeCallbacks[tabName]();
                }
            }
        }


   
        return obj;
    })();

parent.Arup = Arup;



