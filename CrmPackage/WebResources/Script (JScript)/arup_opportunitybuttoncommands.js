//
// Ensure that the javascript commands required in arup_opportunitybuttons.html are accessible.
//
// Normally javascript functions are not visible from the Web resource in an iframe.
// By attaching them to Xrm.Page, they are then visible and callable from within the iframe.

Xrm.Page.Arup = (
    function() {
        function GetAttribute(formContext, attrName) {
            var attr = formContext.getAttribute(attrName);
            if (attr != null) {
                attr = attr.getValue();
            }
            return attr;
        };
    
    function Log(s) { console.log(s);};
        var tabStateChangeCallbackAdded = false;
        var buttonChangeCallbacks = {};


        var obj = {
        ButtonState: {
            ActiveTab: "Summary"
        },

        //
        // Functions related to specific buttons ---------------------
        //
        RequestPossibleJob: function() {
            requestPossibleJob();
        },

        RequestPossibleJobEnabled: function(formContext) {
            // ccrm_possiblejobnumberrequired = 1
            // Not in create state
            // ccrm_showpjnbutton != 0
            // statuscode != 3
            // statecode != disabled (1)
            // Has write access to opportunity.

            var pjnrequired = GetAttribute(formContext, "ccrm_possiblejobnumberrequired");
            var isCreate = formContext.ui.getFormType() == 1;
            var showPJNButton = GetAttribute(formContext, "ccrm_showpjnbutton");
            var statuscode = GetAttribute(formContext, "statuscode");
            var statecode = GetAttribute(formContext, "statecode");
            return pjnrequired != 1 && !isCreate && showPJNButton == 1 && statuscode != 3 && statecode != 1;
        },

        BidDicisionConfirmation: function() {
            BidDicisionConfirmation();
        },


        IsGroupLeaderApprovalEnabled: function(formContext) {
            // statecode = 0
            //    (
            //          ccrm_groupleaderapprovaloptions == 100000000  // Awaiting response
            //       or ccrm_groupleaderapprovaloptions == 100000002  // declined
            //     )
            var statecode = GetAttribute(formContext, "statecode");
            var grpApprovalOptions = GetAttribute(formContext, "ccrm_groupleaderapprovaloptions");

            return statecode == 0 && (grpApprovalOptions == 100000000 || grpApprovalOptions == 100000002);
        },

        ApproveGroupLeader: function(formContext) {
            CJNApprovalButtonClick("Approve",
                "GroupLeader",
                "ccrm_groupleadercjnapprovaloptions",
                "ccrm_groupleadercjnapproval",
                "ccrm_groupleadercjnapprovaldate");
        },

        IsSectorLeaderApprovalEnabled: function(formContext) {
            // ccrm_opportunitytype = 200002 - Risk Level 2
            // statecode = 0 (active)
            //    (
            //          ccrm_practiceleaderapprovaloptions == 100000000  // Awaiting response
            //       or ccrm_practiceleaderapprovaloptions == 100000002  // declined
            //     )
            var statecode = GetAttribute(formContext, "statecode");
            var sectorApprovalOptions = GetAttribute(formContext, "ccrm_practiceleaderapprovaloptions");
            var oppType = GetAttribute(formContext, "ccrm_opportunitytype");

            return statecode == 0 &&
                oppType == 200002 &&
                (sectorApprovalOptions == 100000000 || sectorApprovalOptions == 100000002);
        },

        ApproveSectorLeader: function(formContext) {
            CJNApprovalButtonClick("Approve",
                "PracticeLeader",
                "ccrm_practiceleaderapprovaloptions",
                "ccrm_practiceleaderapproval",
                "ccrm_practiceleaderapprovaldate");
        },

        IsRegionalCOOApprovalEnabled: function(formContext) {
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

        ApproveRegionalCOO: function(formContext) {
            CJNApprovalButtonClick("Approve",
                "RegionalCOO",
                "ccrm_regioncooapprovaloptions",
                "ccrm_regioncooapproval",
                "ccrm_regionalcooapprovaldate");
        },

        IsApproveBidReviewEnabled: function(formContext) {
            // ccrm_shwbidreviewappbtn = 1 (Yes)
            // statecode = 0 (active)
            var statecode = GetAttribute(formContext, "statecode");
            var showBidReviewButton = GetAttribute(formContext, "ccrm_shwbidreviewappbtn");

            return statecode == 0 && showBidReviewButton == 1;
        },

        IsApproveBidReviewApproved: function(formContext) {
            // statecode = 0 (active)
            // ccrm_bidreviewoutcome == 100000002
            var statecode = GetAttribute(formContext, "statecode");
            var bidReviewOutcome = GetAttribute(formContext, "ccrm_bidreviewoutcome");

            return statecode == 0 && bidReviewOutcome == 100000002;
        },

        ApproveBidReview: function(formContext) {
            BidReviewApprovalClick("Approve");
        },

        // CJN Request button.
        IsRequestCJNEnabled: function(formContext) {
            // Formstate == Existing
            // ccrm_sys_confirmedjob_buttonhide != 1
            // ccrm_systemcjnarequesttrigger == 1
            // And has write privilege on opportunity???
            var formType = formContext.ui.getFormType();
            var cjnButtonhide = GetAttribute(formContext, "ccrm_sys_confirmedjob_buttonhide");
            cjnButtonhide = cjnButtonhide.getValue();

            var cjnRequestTrigger = GetAttribute(formContext, "ccrm_systemcjnarequesttrigger");
            cjnRequestTrigger = cjnRequestTrigger.getValue();

            return formType != 0 &&
                formType != 1 && // undefined or creating
                cjnButtonhide != 1 &&
                cjnRequestTrigger == 1;
        },
        RequestCJN: function(formContext) {
            requestConfirmJob();
        },


        // General Utility functions ----------------------
        SetupTabsForStage: function(formContext) {
            // And the active BPF stage
            var activeStageName = formContext.data.process.getActiveStage();
            activeStageName = activeStageName == null ? null : activeStageName.getName();
            var activeTabName = obj.stageToTabMapping[activeStageName];

            if (activeStageName != null) {
                // Decide which tabs should be visible.
                Log("Displaying tabs for process stage " + activeStageName + " / " + activeTabName);
                obj.DisplayTab(activeTabName, formContext);
                obj.setVisibleTabs(formContext, obj.staticTabs.concat([activeTabName]));
                if (buttonChangeCallbacks[activeTabName] != null) {
                    buttonChangeCallbacks[activeTabName]();
                } else {
                    buttonChangeCallbacks[activeTabName] = "setup needed";
                }
            }
        },

        setVisibleTabs : function(formContext, tabList) {
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
        },

        GetTabNumber : function(formContext, tabName) {
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

        BPFMoveNext: function(formContext, successCallback) {
            // BPFMoveNext(); -- existing function does not seem relevant to V9
            var opportunityType = GetAttribute(formContext, "arup_opportunitytype");
            if (opportunityType == '770000005') {
                return;
            }

            // Make sure form is saved.
            //  formContext.data.entity.save();
            formContext.data.save().then(
                function success(status) {
                    Log("success status" + status);
                    var process = formContext.data.process;
                    if (process != null) {
                        process.moveNext(
                            function(result) {
                                Log("result is " + result);
                                if (result == "success") {
                                    obj.SetupTabsForStage(formContext);
                                    successCallback();
                                } else {
                                    Xrm.Navigation.openAlertDialog({
                                        title : "Process error",
                                        text: "Unable to move to next stage: " + result
                                    });
                                }
                            });
                    }
                },
                function(status) {
                    Log("failure status " + status);
                });
        },

        stageToTabMapping: {
            "PRE-BID": "Prebid_tab",
            "CROSS REGION": "Cross_Region_Tab",
            "PJN APPROVAL": "PJN_Approval_tab",
            "DEVELOPING BID": "Developing_Bid_tab",
            "BID REVIEW/SUBMISSION": "Bid_Review_Submission_tab",
            "CONFIRMED JOB - PROJECT": "Confirmed_Job_Project_Tab",
            "CONFIRMED JOB - COMMERCIAL": "Confirmed_Job_commercial_Tab",
            "CJN APPROVAL": "PJN_Approval_tab",
        },

        staticTabs: [
            'PJN_Costs_Tab', 'Summary', 'Project_Financials_Tab', 'Project_Details_Tab',
            'Bid_Details_Tab', 'Bid_Development_Tab_External'
        ],
        // Entry point from the form properties.
        // This is set up as en event handler to be called from the main CRM opportunity form.
        // Display the active tab according to the current stage.
        displayActiveTabForStage: function(executionContext) {
            var formContext = executionContext.getFormContext();
            obj.SetupTabsForStage(formContext);
            formContext.data.process.addOnStageChange(function (executionContext) {
                Log("Process stage Change");
                var formContext = executionContext.getFormContext();
                obj.SetupTabsForStage(formContext);
            });
        },

        DisplayTab: function(tabName, formContext) {
            var tab = formContext.ui.tabs.get(tabName);
            tab.setFocus();
            tab.setVisible(true);
            tab.setDisplayState("expanded");
            if ( buttonChangeCallbacks[tabName] != null) {
                buttonChangeCallbacks[tabName]();
            }
            return tabName;
        },

        OnDisplayingTab: function(formContext, tabName, callback) {
            buttonChangeCallbacks[tabName] = callback;
            if (!tabStateChangeCallbackAdded) {
                tabStateChangeCallbackAdded = true;
                var tabs = formContext.ui.tabs.get();
                for (var t in tabs) {
                    var tab = tabs[t];
                    tab.addTabStateChange(OnTabStateChange);
                }
            }

        }
    };

    function OnTabStateChange(e) {
        var source = e.getEventSource();
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





