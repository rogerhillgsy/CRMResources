//
// Ensure that the javascript commands required in arup_opportunitybuttons.html are accessible.
//
// Normally javascript functions are not visible from the Web resource in an iframe.
// By attaching them to Xrm.Page, they are then visible and callable from within the iframe.


var GetAttribute = function(formContext, attrName) {
    var attr = formContext.getAttribute(attrName);
    if (attr != null) {
        attr = attr.getValue();
    }
    return attr;
};


Xrm.Page.Arup = {
    ButtonState : {
        ActiveTab : "Summary"
    },

    // Functions related to specific buttons ---------------------
    RequestPossibleJob: function () {
        requestPossibleJob();
    },

    RequestPossibleJobEnabled: function (formContext) {
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
        return pjnrequired == 1 && !isCreate && showPJNButton == 1 && statuscode != 3 && statecode != 1;
    },

    BidDicisionConfirmation: function () {
        BidDicisionConfirmation();
    },



    IsGroupLeaderApprovalEnabled : function(formContext) {
        // statecode = 0
        //    (
        //          ccrm_groupleaderapprovaloptions == 100000000  // Awaiting response
        //       or ccrm_groupleaderapprovaloptions == 100000002  // declined
        //     )
        var statecode = GetAttribute(formContext, "statecode");
        var grpApprovalOptions = GetAttribute(formContext, "ccrm_groupleaderapprovaloptions");

        return statecode == 0 && (grpApprovalOptions == 100000000 || grpApprovalOptions == 100000002);
    },

    ApproveGroupLeader: function (formContext) {
        CJNApprovalButtonClick("Approve",
            "GroupLeader",
            "ccrm_groupleadercjnapprovaloptions",
            "ccrm_groupleadercjnapproval",
            "ccrm_groupleadercjnapprovaldate");
    },

    IsSectorLeaderApprovalEnabled: function (formContext) {
        // ccrm_opportunitytype = 200002 - Risk Level 2
        // statecode = 0 (active)
        //    (
        //          ccrm_practiceleaderapprovaloptions == 100000000  // Awaiting response
        //       or ccrm_practiceleaderapprovaloptions == 100000002  // declined
        //     )
        var statecode = GetAttribute(formContext, "statecode");
        var sectorApprovalOptions = GetAttribute(formContext, "ccrm_practiceleaderapprovaloptions");
        var oppType = GetAttribute(formContext, "ccrm_opportunitytype");

        return statecode == 0 && oppType == 200002 && (sectorApprovalOptions == 100000000 || sectorApprovalOptions == 100000002);
    },

    ApproveSectorLeader: function (formContext) {
        CJNApprovalButtonClick("Approve",
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

        return statecode == 0 && oppType == 200003 && (cooApprovalOptions == 100000000 || cooApprovalOptions == 100000002);
    },

    ApproveRegionalCOO : function(formContext) {
        CJNApprovalButtonClick("Approve",
            "RegionalCOO",
            "ccrm_regioncooapprovaloptions",
            "ccrm_regioncooapproval",
            "ccrm_regionalcooapprovaldate");
    },

    IsApproveBidReviewEnabled : function(formContext) {
        // ccrm_shwbidreviewappbtn = 1 (Yes)
        // statecode = 0 (active)
    },

    IsApproveBidReviewApproved: function (formContext) {
        // statecode = 0 (active)
        // ccrm_bidreviewoutcome == 100000002
    },

    ApproveBidReview: function (formContext) {
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
    SetOnProcessStageChange: function (formContext, callback) {
        formContext.data.process.addOnStageChange(callback);
    },

    BPFMoveNext: function (formContext, successCallback) {
        // BPFMoveNext(); -- existing function does not seem relevant to V9
        var opportunityType = GetAttribute(formContext, "arup_opportunitytype");
        if (opportunityType == '770000005') {
            return;
        }

        // Make sure form is saved.
        //  formContext.data.entity.save();
        formContext.data.save().then(
            function success(status) {
                console.log("success status" + status);
                var process = Xrm.Page.data.process;
                if (process != null) {
                    process.moveNext(
                        function (result) {
                            console.log("result is " + result);
                            if (result == "success") {
                                successCallback();
                            }
                        });
                }
            },
            function (status) {
                console.log("failure status " + status);
            });
    },

    SetNow: function (formContext, attr) {
        var now = new Date();
        var attr = formContext.getAttribute(attr);
        if (attr != null) attr.setValue(now);
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

    AddTabChangeCallback: function (formContext, callback) {
        console.log(" add change callbacks");
        var tabs = formContext.ui.tabs.get();
        for (var t in tabs) {
            tab = tabs[t];
            tab.addTabStateChange(callback);
        }
    },

    displayTab: function (tabName, formContext, callback) {
        var tab = formContext.ui.tabs.get(tabName);
        tab.setFocus();
        tab.setVisible(true);
        tab.setDisplayState("expanded");
        if (callback != null) {
            debugger;
        }
        return tabName;
    },

    // Display the active tab according to the current stage.
    displayActiveTabForStage: function (executionContext) {
        var formContext = executionContext.getFormContext();
        this.displayActiveTabForStage2(formContext);
    },
    displayActiveTabForStage2: function (formContext) {
        var activeStageName = formContext.data.process.getActiveStage();
        activeStageName = activeStageName == null ? null : activeStageName.getName();

        var activeTabName = Xrm.Page.Arup.stageToTabMapping[activeStageName];
        if (activeTabName != null) {
            console.log("Displaying tabs for process stage " + activeStageName + " / " + activeTabName);
            Xrm.Page.Arup.displayTab(activeTabName, formContext);
        }
    },

};




