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
    BidDicisionConfirmation: function() {
        BidDicisionConfirmation();
    },

    
    SetOnProcessStageChange : function( formContext, callback) {
        formContext.data.process.addOnStageChange(callback);
    },

    BPFMoveNext: function(formContext, successCallback ) {
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
                      function(result) {
                          console.log("result is " + result);
                          if (result == "success") {
                              successCallback();
                          }
                      });
              }
          },
          function(status) {
              console.log("failure status" + status);

          });

      // Get v9 BPF process object.
    },

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
        return pjnrequired == 1 && !isCreate && showPJNButton == 1 && statuscode != 3 && statecode != 1;
    },

    bidReviewApproved: false, //need to work out which attributes control Bid review 
    ApproveBidReview : function(formContext) {
        alert("Approving bid review");
        this.bidReviewApproved = true;
    },

    IsBidReviewApproved: function(formContext) {
        return this.bidReviewApproved;
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

    displayTab : function (tabName, formContext) {
        var tab = formContext.ui.tabs.get(tabName);
        tab.setDisplayState("expanded");
        tab.setVisible(true);
        tab.setFocus();
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

    PJNApproveGroupLeader: function (formContext) {
        CJNApprovalButtonClick("Approve",
            "GroupLeaderApproval",
            "ccrm_groupleadercjnapprovaloptions",
            "ccrm_groupleadercjnapproval",
            "ccrm_groupleadercjnapprovaldate");
        //formContext.getAttribute("ccrm_groupleaderapprovaloptions").setValue(100000001);
        //this.SetNow(formContext,"ccrm_groupleaderapprovaldate");
    },

    PJNApproveSectorLeader : function(formContext) {
        formContext.getAttribute("ccrm_regionalpracticeleaderapprovaloptions").setValue(100000001);
        this.SetNow(formContext, "ccrm_regionalpracticeleaderapprovaldate");
    },

    PJNApproveRegionalCOO : function(formContext) {
        formContext.getAttribute("ccrm_regioncooapprovaloptions").setValue(100000001);
        this.SetNow(formContext, "ccrm_regionalcooapprovaldate");
    },
    SetNow : function(formContext, attr) {
        var now = new Date();
        var attr = formContext.getAttribute(attr);
        if (attr != null ) attr.setValue(now);
    },

    // CJN Request button.
    IsRequestCJNEnabled: function(formContext) {
        // Formstate == Existing
        // ccrm_sys_confirmedjob_buttonhide != 1
        // ccrm_systemcjnarequesttrigger == 1
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
    }

};




