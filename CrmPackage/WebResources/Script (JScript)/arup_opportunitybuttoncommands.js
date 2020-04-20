//
// Ensure that the javascript commands required in arup_opportunitybuttons.html are accessible.
//
// Normally javascript functions are not visible from the Web resource in an iframe.
// By attaching them to Xrm.Page, they are then visible and callable from within the iframe.

Xrm.Page.Arup = {};

Xrm.Page.Arup.BidDicisionConfirmation = function() {
    BidDicisionConfirmation();
}

Xrm.Page.Arup.BPFMoveNext= function () {
    BPFMoveNext();
}


Xrm.Page.Arup.RequestPossibleJob = function () {
    requestPossibleJob();
}

Xrm.Page.Arup.RequestPossibleJobEnabled = function ( formContext ) {
    // ccrm_possiblejobnumberrequired = 1
    // Not in create state
    // ccrm_showpjnbutton != 0
    // statuscode != 3
    // statecode != disabled (1)
    // Has write access to opportunity.

    var pjnrequired = formContext.getAttribute("ccrm_possiblejobnumberrequired");
    pjnrequired = pjnrequired == null ? 0 : pjnrequired.getValue();

    var isCreate = formContext.ui.getFormType() == 1;

    var showPJNButton = formContext.getAttribute("ccrm_showpjnbutton");
    showPJNButton = showPJNButton == null ? 0 : showPJNButton.getValue();

    var statuscode = formContext.getAttribute("statuscode");
    statuscode = statuscode == null ? null : statuscode.getValue();

    var statecode = formContext.getAttribute("statecode");
    statecode = statecode == null ? null : statecode.getValue();

    return pjnrequired == 1 && !isCreate && showPJNButton == 1 && statuscode != 3 && statecode != 1;
}


Xrm.Page.Arup.stageToTabMapping = {
    "PRE-BID": "Prebid_tab",
    "CROSS REGION": "Cross_Region_Tab",
    "PJN APPROVAL": "PJN_Approval_tab",
    "DEVELOPING BID": "Developing_Bid_tab",
    "BID REVIEW/SUBMISSION": "Bid_Review_Submission_tab",
    "CONFIRMED JOB - PROJECT": "Confirmed_Job_Project_Tab",
    "CONFIRMED JOB - COMMERCIAL": "Confirmed_Job_commercial_Tab",
    "CJN APPROVAL": "PJN_Approval_tab",
}

// Display the active tab according to the current stage.
Xrm.Page.Arup.displayActiveTabForStage = function (executionContext) {
    var formContext = executionContext.getFormContext();
    var activeStageName =  formContext.data.process.getActiveStage();
    activeStageName = activeStageName == null ? null : activeStageName.getName();

    
    if (Xrm.Page.Arup.stageToTabMapping[activeStageName] != null) {
        console.log("Displaying tabs for process stage " + activeStageName + " / " + Xrm.Page.Arup.stageToTabMapping[activeStageName]);
        Xrm.Page.Arup.displayTab(Xrm.Page.Arup.stageToTabMapping[activeStageName], formContext);
    }
}



Xrm.Page.Arup.displayTab = function(tabName, formContext) {
    var tab = formContext.ui.tabs.get(tabName);
    tab.setDisplayState("expanded");
    tab.setVisible(true);
    tab.setFocus();
    return tabName;
}