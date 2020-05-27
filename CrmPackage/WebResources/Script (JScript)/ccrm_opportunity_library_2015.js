//<reference path="../Intellisense/formContext.2013.js"/>
///<reference path="../Library/SDK.REST.js"/>
//latest version
var globalContext = Xrm.Utility.getGlobalContext();
var ArupBusinessSaved;
var OpportunityType = { 'Simple': 100000000, 'Full': 100000001 };
var BidRiskLevels = { 'Level1': 200004, 'Level2': 200002, 'Level3': 200003 };
var isCrmForMobile = (globalContext.client.getClient() == "Mobile");
var OPPORTUNITY_STATE = { OPEN: 0, WON: 1, LOST: 2 };
var cachefields = {};
var ArupStages = {
    'Lead': "1feea0ee-6ee4-491d-a8ac-0726e8db2d6b",// [RS-08/05/2017] - No need to change the name here to Pre-Bid as this variable is referred internally
    'CrossRegion': "03b9eb80-d1c8-468c-bf2d-da371067cfb4",
    'BidDevelopment': "011abd87-e117-4bb7-a796-b99a349d5ac3",
    'BidReviewApproval': "8a756906-b291-7e20-b70e-d773cc144da2",
    'BidSubmitted': "9e340cde-0a19-1de6-e360-b5a450a092c7",
    "ConfirmJob": "8e975d43-147e-7c19-c944-08a864d69dbe",
    "ConfirmJobApproval": "212288de-0746-cc9c-9d63-8d8b5597a2c4",
    "ConfirmJobApproval1": "3a4ddcd8-db68-8a8e-9326-cc99ee914ab6",
    "ConfirmJobApproval2": "5a418793-a782-7164-6b52-386381d51cca",
    "ConfirmJobApproval3": "b069abdc-b859-7807-43b7-0aa45d255424",
    "PJNApproval": "181905e7-f7b5-4da2-97eb-22382e1d9ca9",
    "PJNApproval1": "2b84bc43-2261-4942-a2f9-be9b8e5f7e89",
    "PJNApproval2": "8ed9b0a3-bb97-4c6b-a097-ebb7887551a4",
    "PJNApproval3": "50cdd767-4d45-4c38-b7f9-ecb640b60ba8",
    "PJNApproval4": "e5d1931a-b0e2-4cb0-bc5d-f5d1cb483955",
    "PJNApproval5": "e48293a6-9f4e-4eed-bb9f-17c1dac06611",
    "PJNApproval6": "a826a573-1fd4-4977-be5f-68b67004e159",
    "PJNApproval7": "c49cf589-deec-4908-b91b-6a3c4ece9520",
    "PJNApproval8": "35dddae5-d095-4321-8263-7234341037b3",
    "PJNApproval9": "ecf6b38a-c939-4c8f-8c8a-81accb2926b1",
};
var ArupRegionValue = {
    'Americas': 100000000,
    'Australasia': 100000001,
    'CorporateServices': 100000002,
    'DigitalTechnology': 100000009,
    'EastAsia': 100000003,
    'Europe': 100000004,
    'GroupBoard': 100000005,
    'SouthernAfrica': 100000006,
    'UKMEA': 100000007,
    'Malaysia': 100000008
};
var ArupRegionName = {
    'Americas': 'Americas Region',
    'Australasia': 'Australasia Region',
    'CorporateServices': 'Corporate Services',
    'DigitalTechnology': 'Digital Technology',
    'EastAsia': 'East Asia Region',
    'Europe': 'Europe',
    'GroupBoard': 'Group Board',
    'SouthernAfrica': 'Southern Africa Sub-Region',
    'UKMEA': 'UKIMEA Region',
    'Malaysia': 'Malaysia Region'
};
var ApprovalsSection = {
    'PJNApproval4'  :	'PJN_BD_APPROVAL_SECTION',
    'PJNApproval2'	:	'PJN_BD_APPROVAL_SECTION',
    'PJNApproval'	:	'PJN_GROUPLEADER_APPROVAL_SECTION',
    'PJNApproval3'	:	'PJN_GROUPLEADER_APPROVAL_SECTION',
    'PJNApproval1'  :	'PJN_GROUPLEADER_APPROVAL_SECTION',
    'PJNApproval8'  :	'PJN_GROUPLEADER_APPROVAL_SECTION',
    'PJNApproval5'	:	'PJN_GROUPLEADER_APPROVAL_SECTION,PJN_SECTORLEADER_APPROVAL_SECTION',
    'PJNApproval6'	:	'PJN_GROUPLEADER_APPROVAL_SECTION,PJN_SECTORLEADER_APPROVAL_SECTION',
    'PJNApproval9'	:	'PJN_GROUPLEADER_APPROVAL_SECTION,PJN_REGIONALSECTORLEADER_APPROVAL_SECTION,PJN_COO_APPROVAL_SECTION',
    'PJNApproval7'	:   'PJN_GROUPLEADER_APPROVAL_SECTION,PJN_REGIONALSECTORLEADER_APPROVAL_SECTION,PJN_COO_APPROVAL_SECTION',

    'ConfirmJobApproval': 'CJN_PM_APPROVER_SECTION,CJN_ACCCENTRE_APPROVER_SECTION,CJN_FINANCE_APPROVER_SECTION',
    'ConfirmJobApproval3':'CJN_PM_APPROVER_SECTION,CJN_ACCCENTRE_APPROVER_SECTION,CJN_FINANCE_APPROVER_SECTION',

    'ConfirmJobApproval1': 'CJN_PM_APPROVER_SECTION,CJN_GROUPLEADER_APPROVAL_SECTION,CJN_FINANCE_APPROVER_SECTION',
    'ConfirmJobApproval2': 'CJN_PM_APPROVER_SECTION,CJN_GROUPLEADER_APPROVAL_SECTION,CJN_FINANCE_APPROVER_SECTION'



}

var stageFilter = [ArupStages.Lead, ArupStages.CrossRegion, ArupStages.BidDevelopment, ArupStages.BidSubmitted, ArupStages.ConfirmJob];
var oldBidReviewChair;
var moveToNextTrigger = false;
var moveToNextTrigger_PJN = false; //Only used When User has requested Possible Job and Bid is Cross Region
var currUserData;
var acctCentreInvalid;
var currentStage;
var OppoType;
var DirtyFields = {};
if (typeof (FORM_TYPE) === "undefined") FORM_TYPE = { CREATE: 1, UPDATE: 2, QUICK_CREATE: 5, BULK_EDIT: 6 };
if (typeof (PI_REQUIREMENT) === "undefined") PI_REQUIREMENT = { MIN_COVER: 1 };

function HideTabForm(formContext) {
    formContext.ui.tabs.get("tab_9").setVisible(false);
    formContext.ui.tabs.get("tab_8").setVisible(true);
}

function HideTab8(formContext) {
    formContext.ui.tabs.get("tab_9").setVisible(true);
    formContext.ui.tabs.get("tab_8").setVisible(false);
}

// runs on Exit button
function exitForm(formContext) {

    //see if the form is dirty
    var ismodified = formContext.data.entity.getIsDirty();
    if (ismodified == false) {
        formContext.ui.close();
        return;
    }

    if (ismodified == true && formContext.getAttribute("statecode").getValue() != 0) {
        //get list of dirty fields
        var oppAttributes = formContext.data.entity.attributes.get();
        if (oppAttributes != null) {
            for (var i in oppAttributes) {
                if (oppAttributes[i].getIsDirty()) {
                    formContext.getAttribute(oppAttributes[i].getName()).setSubmitMode("never");
                }
            }
            setTimeout(function () { formContext.ui.close(); }, 1000);
        }
        return;
    }

    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
        '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the opportunity.</br>Click "Exit Only" button to exit the opportunity without saving.</font>',
        [
            {
                label: "<b>Save and Exit</b>",
                callback: function () {
                    var oppAttributes = formContext.data.entity.attributes.get();
                    var highlight = true;
                    var cansave = true;
                    if (oppAttributes != null) {
                        for (var i in oppAttributes) {
                            if (oppAttributes[i].getRequiredLevel() == 'required') {
                                highlight = formContext.getAttribute(oppAttributes[i].getName()).getValue() != null;
                                if (highlight == false && cansave == true) { cansave = false; }
                                highlightField(null, '#' + oppAttributes[i].getName(), highlight);
                            }
                        }
                    }
                    if (cansave) { formContext.data.entity.save("saveandclose"); }
                },
                setFocus: true,
                preventClose: false
            },
            {
                label: "<b>Exit Only</b>",
                callback: function () {
                    //get list of dirty fields
                    var oppAttributes = formContext.data.entity.attributes.get();
                    if (oppAttributes != null) {
                        for (var i in oppAttributes) {
                            if (oppAttributes[i].getIsDirty()) {
                                formContext.getAttribute(oppAttributes[i].getName()).setSubmitMode("never");
                            }
                        }
                        setTimeout(function () { formContext.ui.close(); }, 1000);
                    }
                },
                setFocus: false,
                preventClose: false
            }
        ],
        'Warning', 600, 250, '', true);
}

function SetLookupField(formContext,id, name, entity, field) {
    if (id != null) {
        if (id.indexOf('{') == -1)
            id = '{' + id;
        if (id.indexOf('}') == -1)
            id = id + '}';
        id = id.toUpperCase();

        var lookup = new Array();
        lookup[0] = new Object();
        lookup[0].id = id;
        lookup[0].name = name;
        lookup[0].entityType = entity;
        formContext.getAttribute(field).setValue(lookup);
    } else {
        formContext.getAttribute(field).setValue(null);
    }
}

function getStageId(formContext) {
    var activeStage = formContext.data.process.getActiveStage();
    return activeStage.getId();

}

function ArupApprovalType(approvalType) {
    switch (approvalType) {
        case 'ProjectManagerApproval':
            return 'Project Manager/Director Approval';
            break;
        case 'GroupLeaderApproval':
            return 'Group Leader Approval';
            break;
        case 'GroupLeader':
            return 'Group Leader Approval';
            break;
        case 'AccCenterLeadApproval':
            return 'Accounting Center Leader Approval';
            break;
        case 'FinanceApproval':
            return 'Finance Approval';
            break;
        case 'BidDirector':
            return 'Bid Director Approval';
            break;
        case 'PracticeLeader':
            return 'Practice Leader Approval';
            break;
        case 'RegionalPracticeLeader':
            return 'Regional Practice Leader Approval';
            break;
        case 'RegionalCOO':
            return 'Regional COO Approval';
            break;
        default:
            return '';
            break;
    }
}

function ApprovalConfirmationMessage(approvalType) {

    switch (approvalType) {
        case 'ProjectManagerApproval':
            return 'Request Confirmed Job approval is to be provided only by the nominated approver or an agreed delegate.</br></br>If you are not the listed approver or an agreed delegate, please press Do Not Approve button.';
            break;
        case 'GroupLeaderApproval':
        case 'AccCenterLeadApproval':
            var groupLeaderApprovalNeeded = checkGroupLeaderApprovalNeeded(formContext);
            if (groupLeaderApprovalNeeded == false) {
                return 'Confirmed Job Number approval by Accounting Centre Leader can only be completed by the nominated approver or an agreed delegate.';
            }
            else {
                return 'Confirmed Job Number approval by Group Leader can only be completed by the nominated approver or an agreed delegate.';
            }
            break;
        case 'FinanceApproval':
            return 'Only accredited members of the regional finance team can complete financial approvals.';
            break;
        case 'GroupLeader':
        case 'BidDirector':
        case 'PracticeLeader':
        case 'BidDirector':
        case 'RegionalPracticeLeader':
        case 'RegionalCOO':
            return 'Decision to Proceed approval is to be provided only by the nominated approver or an agreed delegate.</br></br>If you are not the listed approver or an agreed delegate, please press Do Not Approve button.';
            break;
        default:
            return '';
            break;
    }
}

function errorHandler(error) {

    Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
        '<font size="3" color="#000000"></br>' + error.message + '</font>',
        [
            { label: "<b>OK</b>", setFocus: true },
        ], "ERROR", 500, 350, '', true);
}

function GetOfficeCountryID(formContext, officeID) {
    var officeCountryResult = new Object();
    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/ccrm_arupoffices(" + officeID +")?$select=_ccrm_officecountryid_value", false);
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
                officeCountryResult.Id = result["_ccrm_officecountryid_value"];
                officeCountryResult.Name = result["_ccrm_officecountryid_value@OData.Community.Display.V1.FormattedValue"];
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
    return officeCountryResult;
}

//get Region lookup - from the current user
function getCurrentUserDetails(formContext) {
  
    var result = new Object();
    var ausCompany = new Object();

    //SDK.REST.retrieveRecord(userId, "SystemUser", 'Ccrm_ArupRegionId,ccrm_arupcompanyid,FullName,ccrm_accountingcentreid,CALType,ccrm_arupofficeid', null,
    //    function (retrievedreq) {
    //        if (retrievedreq != null) {
    //            result.FullName = retrievedreq.FullName;
    //            if (retrievedreq.Ccrm_ArupRegionId != null) {

    //                result.userRegionID = retrievedreq.Ccrm_ArupRegionId.Id;
    //                result.userRegionName = retrievedreq.Ccrm_ArupRegionId.Name;
    //                result.userOfficeID = retrievedreq.ccrm_arupofficeid.Id;
    //                var userCountry;

    //                if (result.userRegionName == 'Australasia Region' && result.userOfficeID != null) {

    //                    SDK.REST.retrieveRecord(result.userOfficeID, 'Ccrm_arupoffice', 'ccrm_officecountryid', null,
    //                        function (retrievedcountry) {

    //                            userCountry = retrievedcountry.ccrm_officecountryid.Name.toUpperCase();

    //                            if (retrievedcountry != null && userCountry == 'AUSTRALIA') {
    //                                ausCompany = getAusCompanyDetails('5002');
    //                            }
    //                        }, errorHandler, false);
    //                }

    //            }
    //            if (retrievedreq.ccrm_arupcompanyid != null || userCountry == 'AUSTRALIA') {
    //                result.arupcompanyid = (userCountry == 'AUSTRALIA') ? ausCompany.companyId : retrievedreq.ccrm_arupcompanyid.Id;
    //                result.arupcompanyname = (userCountry == 'AUSTRALIA') ? ausCompany.CompanyName : retrievedreq.ccrm_arupcompanyid.Name;
    //            }
    //            if (retrievedreq.ccrm_accountingcentreid != null || userCountry == 'AUSTRALIA') {
    //                result.ccrm_accountingcentreid = (userCountry == 'AUSTRALIA') ? null : retrievedreq.ccrm_accountingcentreid.Id;
    //                result.ccrm_accountingcentrename = (userCountry == 'AUSTRALIA') ? null : retrievedreq.ccrm_accountingcentreid.Name;
    //            }
    //            if (retrievedreq.CALType != null) {
    //                result.caltype = retrievedreq.CALType.Value;
    //            }
    //        }
    //    }, errorHandler, false);


    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/systemusers(" + formContext.context.getUserId().replace('{', '').replace('}', '') + ")?$select=caltype,_ccrm_accountingcentreid_value,_ccrm_arupcompanyid_value,_ccrm_arupofficeid_value,_ccrm_arupregionid_value,fullname", false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var retrievedreq = JSON.parse(this.response);
                if (retrievedreq != null) {
                    result.FullName = retrievedreq["fullname"];
                    if (retrievedreq["_ccrm_arupregionid_value"] != null) {

                        result.userRegionID = retrievedreq["_ccrm_arupregionid_value"];
                        result.userRegionName = retrievedreq["_ccrm_arupregionid_value@OData.Community.Display.V1.FormattedValue"];
                        result.userOfficeID = retrievedreq["_ccrm_arupofficeid_value"];
                        var userCountry;

                        if (result.userRegionName == 'Australasia Region' && result.userOfficeID != null) {

                            var retrivedOfficeCountry = GetOfficeCountryID(formContext, result.userOfficeID);
                            userCountry = retrivedOfficeCountry.Name.toUpperCase();
                            if (retrivedOfficeCountry != null && userCountry == 'AUSTRALIA') {
                                        ausCompany = getAusCompanyDetails('5002');
                             }
                               
                        }
                    }
                    if (retrievedreq["_ccrm_arupcompanyid_value"] != null || userCountry == 'AUSTRALIA') {
                        result.arupcompanyid = (userCountry == 'AUSTRALIA') ? ausCompany.companyId : retrievedreq["_ccrm_arupcompanyid_value"];
                        result.arupcompanyname = (userCountry == 'AUSTRALIA') ? ausCompany.CompanyName : retrievedreq["_ccrm_arupcompanyid_value@OData.Community.Display.V1.FormattedValue"];
                    }
                    if (retrievedreq["_ccrm_accountingcentreid_value"] != null || userCountry == 'AUSTRALIA') {
                        result.ccrm_accountingcentreid = (userCountry == 'AUSTRALIA') ? null : retrievedreq["_ccrm_accountingcentreid_value"];
                        result.ccrm_accountingcentrename = (userCountry == 'AUSTRALIA') ? null : retrievedreq["_ccrm_accountingcentreid_value@OData.Community.Display.V1.FormattedValue"];
                }
                    if (retrievedreq["caltype"] != null) {
                        result.caltype = retrievedreq["caltype"];
                }
            }

            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
    //Xrm.WebApi.online.retrieveRecord("systemuser", userId, "?$select=caltype,_ccrm_accountingcentreid_value,_ccrm_arupcompanyid_value,_ccrm_arupofficeid_value,_ccrm_arupregionid_value,fullname").then(
    //    function success(retrievedresults) {
    //        if (retrievedresults != null) {
    //            result.FullName = retrievedresults["fullname"];
    //            if (retrievedresults["_ccrm_arupregionid_value"] != null) {

    //                result.userRegionID = retrievedresults["_ccrm_arupregionid_value"];
    //                result.userRegionName = retrievedresults["_ccrm_arupregionid_value@OData.Community.Display.V1.FormattedValue"];
    //                result.userOfficeID = retrievedresults["_ccrm_arupofficeid_value"];
    //                var userCountry;

    //                if (result.userRegionName == 'Australasia Region' && result.userOfficeID != null) {

    //                    Xrm.WebApi.online.retrieveRecord("ccrm_arupoffice", result.userOfficeID, "?$select=_ccrm_officecountryid_value").then(
    //                        function success(retrievedcountry) {
    //                            userCountry = retrievedcountry["_ccrm_officecountryid_value@OData.Community.Display.V1.FormattedValue"].toUpperCase();

    //                            if (retrievedcountry != null && userCountry == 'AUSTRALIA') {
    //                                ausCompany = getAusCompanyDetails('5002');
    //                            }
    //                        },
    //                        function (error) {
    //                            Xrm.Utility.alertDialog(error.message);
    //                        }
    //                    );
    //                }

    //            }
    //            if (retrievedresults["_ccrm_arupcompanyid_value"] != null || userCountry == 'AUSTRALIA') {
    //                result.arupcompanyid = (userCountry == 'AUSTRALIA') ? ausCompany.companyId : retrievedresults["_ccrm_arupcompanyid_value"];
    //                result.arupcompanyname = (userCountry == 'AUSTRALIA') ? ausCompany.CompanyName : retrievedresults["_ccrm_arupcompanyid_value@OData.Community.Display.V1.FormattedValue"];
    //            }
    //            if (retrievedresults["_ccrm_accountingcentreid_value"] != null || userCountry == 'AUSTRALIA') {
    //                result.ccrm_accountingcentreid = (userCountry == 'AUSTRALIA') ? null : retrievedresults["_ccrm_accountingcentreid_value"];
    //                result.ccrm_accountingcentrename = (userCountry == 'AUSTRALIA') ? null : retrievedresults["_ccrm_accountingcentreid_value@OData.Community.Display.V1.FormattedValue"];
    //            }
    //            if (retrievedresults["caltype"] != null) {
    //                result.caltype = retrievedresults["caltype"];
    //            }
    //        }
           
    //    },
    //    function (error) {
    //        Xrm.Utility.alertDialog(error.message);
    //    }
    //);

    return result;
}

function getAusCompanyDetails(companyCode) {

    var companyDetails = new Object();

    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/XRMServices/2011/OrganizationData.svc/Ccrm_arupcompanySet?$select=Ccrm_arupcompanyId,Ccrm_name&$filter=Ccrm_ArupCompanyCode eq '" + companyCode + "' and statecode/Value eq 0", false);
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {

            this.onreadystatechange = null;

            if (this.status === 200) {
                var returned = JSON.parse(this.responseText).d;
                var results = returned.results;
                if (results.length > 0) {
                    companyDetails.companyId = results[0].Ccrm_arupcompanyId;
                    companyDetails.CompanyName = results[0].Ccrm_name;
                }
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
    return companyDetails;
}

//default the Client to 'Unassigned' record
function setDefaultClientUnassigned(formContext) {
 
    //SDK.REST.retrieveMultipleRecords("Account", "$select=AccountId,Name&$top=1&$filter=Name eq 'Unassigned'", function (results) {
    //    if (results.length > 0) {
    //        SetLookupField(formContext,results[0].AccountId, results[0].Name, 'account', 'customerid');
    //        SetLookupField(formContext,results[0].AccountId, results[0].Name, 'account', 'ccrm_client');
    //    }
    //}, errorHandler, function () { }, false);

    Xrm.WebApi.online.retrieveRecord("account", "9c3b9071-4d46-e011-9aa7-78e7d1652028", "?$select=accountid,name").then(
        function success(result) {
            SetLookupField(formContext, result["accountid"], result["name"], 'account', 'customerid');
            SetLookupField(formContext, result["accountid"], result["name"], 'account', 'ccrm_client');

        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );

}

function SuppressDirtyFields(formContext,formonload) {
   
    if (formonload)
        formContext = formContext.getFormContext(); //1st paramter is executioncontext in case of FormOnload event

    /// Prevent dirty fields from causing the user to be prompted to save the form when navigating away.

    if (formContext.data.entity.getIsDirty()) {
        formContext.data.entity.attributes.forEach(function (a, i) {
            if (formContext.getAttribute(i).getIsDirty()) {
                DirtyFields[a.getName()] = a.getSubmitMode();
                a.setSubmitMode("never");
                a.addOnChange(function () { OnChangeToDirtyField(a); });
            }
        });
    }
}

function RestoreDirtyFields(executionContext) {
    var formContext = executionContext.getFormContext();
    /// Problem: if we update any fields on load to make the Opportunity form appear consistent, 
    /// these changes will then cause the user to be warned try to save the form when they try to leave the page,
    /// even where they are only viewing the record and have not otherwise changed it.
    /// To address this, we mark any fields that are dirty after the "onload" process so that they do nont trigger a save.
    /// Then when we actually come to save, we mark this list of fields to be saved.
    /// Also set an onchange event on each attribute so that if they are modified by the user, they cause a save.
    for (var a in DirtyFields) {
        if (DirtyFields.hasOwnProperty(a)) {
            formContext.getAttribute(a).setSubmitMode(DirtyFields[a]);
        }
    };
}

function OnChangeToDirtyField(a) {
    a.setSubmitMode("dirty");
}

function FormOnload(executionContext) {
    debugger;
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("statecode") != null && formContext.getAttribute("statecode") != "undefined") {
        if (formContext.getAttribute("statecode") != null && formContext.getAttribute("statecode") != "undefined") {
            var state = formContext.getAttribute("statecode").getValue();
            var bpfStatus = formContext.data.process.getStatus();
            if (state == 1 && bpfStatus == 'active') {
                if (currentStage == ArupStages.ConfirmJobApproval ||
                    currentStage == ArupStages.ConfirmJobApproval1 ||
                    currentStage == ArupStages.ConfirmJobApproval2 ||
                    currentStage == ArupStages.ConfirmJobApproval3) {
                    formContext.data.process.setStatus('finished');
                } else {
                    formContext.data.process.setStatus('aborted');
                }
            }
            if (state == 2) {
                if (bpfStatus == 'active') {
                    formContext.data.process.setStatus('aborted');
                }
            }
            if (state == 0) {
                //var bpfStatus = formContext.data.process.getStatus();
                if (bpfStatus != 'active') {
                    formContext.data.process.setStatus('active');
                }
            }
        }

        currUserData = getCurrentUserDetails(formContext);
        var opportunityType = formContext.getAttribute("arup_opportunitytype").getValue();

        if (formContext.ui.getFormType() == 1) {

            if (formContext.getAttribute("customerid").getValue() == null) {
                setDefaultClientUnassigned(formContext);
            }

            formContext.getAttribute("ccrm_accountingcentreid").setRequiredLevel('recommended');
            formContext.getAttribute("ccrm_arupcompanyid").setRequiredLevel('recommended');
            SetLookupField(formContext,currUserData.arupcompanyid,
                currUserData.arupcompanyname,
                'ccrm_arupcompany',
                'ccrm_arupcompanyid');
            SetLookupField(formContext,formContext.context.getUserId(),
                formContext.context.getUserName(),
                'systemuser',
                'ccrm_leadoriginator');
            SetLookupField(formContext,formContext.context.getUserId(),
                formContext.context.getUserName(),
                'systemuser',
                'ccrm_businessadministrator_userid');
            formContext.getAttribute("ccrm_arupcompanyid").fireOnChange();
            SetLookupField(formContext,currUserData.ccrm_accountingcentreid,
                currUserData.ccrm_accountingcentrename,
                'ccrm_arupaccountingcode',
                'ccrm_accountingcentreid');
            formContext.getAttribute("ccrm_accountingcentreid").fireOnChange();
            ccrm_arupbusinessid_onChange(formContext,false);

        } else if (formContext.ui.getFormType() != 1) {

            //set internal opportunity banner
            if (formContext.getAttribute("ccrm_arupinternal").getValue() == true) {
               formContext.ui.setFormNotification("INTERNAL OPPORTUNITY", "INFO", "InternalOpportunity");
            }

            //save Arup Business
            if (formContext.getAttribute("ccrm_arupbusinessid").getValue() != null) {
                ArupBusinessSaved = formContext.getAttribute("ccrm_arupbusinessid").getValue()[0].name;
            }

            //set scroll bar height
            $('#processControlScrollbar').children().height(20);
            customerid_onChange(formContext);
            //ccrm_contractlimitofliability_OnChange();

            feeIncomeCheck(formContext);

            projectcountry_onchange(formContext,'formonload'); // apply filter to state field   

            setCurrentApprovers(formContext);

            stageNotifications(formContext);
       
            calcFactoredNetReturnToArup(formContext);

            ccrm_arupbusinessid_onChange(formContext,false);

            ccrm_confidential_onchange(formContext,0);

            ccrm_bidreviewoutcome_onChange(formContext);

            //client
            checkHighRiskClient(formContext.getAttribute('ccrm_client').getValue() == null
                ? null
                : formContext.getAttribute('ccrm_client').getValue()[0].id,
                '',
                false,
                false, formContext.getAttribute('statecode').getValue());
            //ultimate/end client
            checkHighRiskClient(
                formContext.getAttribute('ccrm_ultimateendclientid').getValue() == null
                ? null
                : formContext.getAttribute('ccrm_ultimateendclientid').getValue()[0].id,
                'Ultimate/End ',
                false,
                false, formContext.getAttribute('statecode').getValue());

            //make sure the current stage process fields are hidden/shown
            if (!!formContext.data.process) {
                hideProcessFields(formContext,formContext.data.process.getSelectedStage().getName());
            }

            oldBidReviewChair = formContext.getAttribute("ccrm_bidreviewchair_userid").getValue();

            currentStage = getStageId(formContext);

            //ensure that the stage toggle flag is set to something other than 2
            if (formContext.getAttribute("ccrm_stagetoggle").getValue() != 0) {
                formContext.getAttribute("ccrm_stagetoggle").setValue(0);
                formContext.getAttribute("ccrm_stagetoggle").setSubmitMode("always");
                formContext.getAttribute("ccrm_stagetoggle").fireOnChange();
            }

            if (getStageId(formContext) == ArupStages.ConfirmJob) { // runs when coming from CJNA form
                if (formContext.getAttribute("ccrm_jobnumberprogression").getValue() == 100009005) {
                    formContext.getAttribute("ccrm_systemcjnarequesttrigger").setValue(false);
                    moveToNextTrigger = true;
                    formContext.data.save();
                }
            }

            if (getStageId(formContext) == ArupStages.BidReviewApproval) {
                if (formContext.getAttribute("ccrm_bidreviewchair_userid").getValue() != null &&
                    formContext.getAttribute("ccrm_currentbidreviewchair").getValue() != null) {
                    if (formContext.getAttribute("ccrm_bidreviewchair_userid").getValue()[0].id !=
                        formContext.getAttribute("ccrm_currentbidreviewchair").getValue()[0].id) {
                        updateBidReviewForm(formContext);
                    }
                }
            }

            if (currentStage == ArupStages.ConfirmJobApproval ||
                currentStage == ArupStages.ConfirmJobApproval1 ||
                currentStage == ArupStages.ConfirmJobApproval2 ||
                currentStage == ArupStages.ConfirmJobApproval3) {
                addEventToProjPartGrid(formContext);
            }

            //lock down Bid Costs fields if either PJN or CJN has been issued or internal opportunities not in UKIMEA region
            setTimeout(function() {

                lockDownBidCosts(formContext,(formContext.getAttribute("ccrm_pjna").getValue() != null ||
                            formContext.getAttribute("ccrm_jna").getValue() != null ||
                            opportunityType == 770000005 ||
                            (formContext.getAttribute("ccrm_arupinternal").getValue() == true &&
                                formContext.getAttribute("ccrm_arupregionid").getValue() != null &&
                                formContext.getAttribute("ccrm_arupregionid").getValue()[0].name.toUpperCase() !=
                                'UKIMEA REGION'))
                        ? true
                        : false);

                    //if (formContext.getAttribute("ccrm_pjna").getValue() != null || formContext.getAttribute("ccrm_jna").getValue() != null) {
                    //    lockDownBidCosts(formContext,true);
                    //}
                    //else if (formContext.getAttribute("ccrm_arupinternal").getValue() == true && formContext.getAttribute("ccrm_arupregionid").getValue() != null && formContext.getAttribute("ccrm_arupregionid").getValue()[0].name.toUpperCase() != 'UKIMEA REGION') {
                    //    lockDownBidCosts(formContext,true);
                    //}
                    //else {
                    //    lockDownBidCosts(formContext,false);
                    //}
                },
                1000);

            cachefields['ccrm_contractarrangement'] = formContext.getAttribute("ccrm_contractarrangement").getValue();
            cachefields['arup_opportunitytype'] = formContext.getAttribute("arup_opportunitytype").getValue();

            //formContext.getAttribute("arup_opportunitytype").fireOnChange();

            if (formContext.getAttribute("ccrm_arupinternal").getValue() &&
                formContext.getAttribute('statecode').getValue() == OPPORTUNITY_STATE.OPEN) {
                ParentOpportunity_Onchange(formContext,"load");
            }
            onSelectOfStage(formContext,currentStage);
            ShowHideOpportunityTypeAndProjectProcurement(formContext);
            if (!!formContext.data.process) {
                formContext.data.process.addOnStageSelected(function () { StageSelected(formContext) });
                formContext.data.process.addOnStageChange(function () { StageChange_event(formContext) });
            }
        }

        // Ensure that when the "Related Networks & Markets" field is set to "Other" that the "Other Network Details" field is made visible and mandatory.
        setup_display_other_field(formContext,"arup_globalservices", "ccrm_othernetworkdetails", "100000003");

        //uncommented the line below to fix the bug 64054
        if (!formContext.getAttribute("ccrm_arupinternal").getValue())
            setup_display_other_field(formContext,"ccrm_pirequirement",
                "header_process_ccrm_pilevelmoney_num",
                function(v) { return v != 2 },
                false);
        setup_display_other_field(formContext,"ccrm_pirequirement",
            "header_process_ccrm_pilevelmoney_num1",
            function(v) { return v != 2 },
            false);

        // Resize certain option set fields so that they display more options when open.
        setup_optionset_size(formContext,"header_process_ccrm_contractconditions", 100, 280);
        setup_optionset_size(formContext,"ccrm_contractarrangement", 179, 380);

        // Make sure that BPF area has tooltips.
        //setup_bpf_tooltip("ccrm_arupuniversityiiaresearchinitiative");

        //    // Set lead Source tooltips
        //    setup_leadsource_tooltips();

        // Look for the notification warning us that a new process flow has been assigned, and if we see it, suppress the BPF.
        // (For historic opportunities there is no BPF)
        var newProcessWarning = $("span.processWarningBar-Text").attr("title");
        if (!!newProcessWarning) {
            formContext.ui.process.setVisible(false);
            formContext.ui.setFormNotification(
                "This opportunity is historic does not have any business process flow associated with it",
                "WARNING",
                "HistoricOppWarning");
        }

        show_hiddenrow("ccrm_limitofliabilityagreement");
        show_hiddenrow("ccrm_limitamount_num");
        if (formContext.ui.getFormType() != 1)
            checkAccountingCentre(formContext);

        //Added code below for D365 upgrade to update the text on BPF
        if (!isCrmForMobile) {
            if (parent.document.getElementById("processDuration") != null &&
                parent.document.getElementById("processDuration") != "undefined") {
                var processText = parent.document.getElementById("processDuration").innerText;

                if (processText != null && processText != undefined) {
                    if (processText.indexOf("Aborted") !== -1) {
                        var newProcessText = processText.replace("Aborted", "Completed");
                        parent.document.getElementById("processDuration").textContent = newProcessText;
                    }
                }
            }
        }

        if (formContext.ui.getFormType() == 1) {
            formContext.getControl('ccrm_leadoriginator').setFocus();
        }
        clearSpace();
    }
}

function arupSubBusiness_onChange_qc(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.ui.getFormType() == 1) { formContext.getControl('ccrm_arupcompanyid').setFocus(); }

}

function opportunityType_onChange(executionContext, trigger) {
    debugger;
   // if (trigger == null)
    formContext = executionContext.getFormContext();

    var typeAttr = formContext.getAttribute("arup_opportunitytype");
    var typeValue = typeAttr.getValue();
    var stageID = formContext.data.process.getActiveStage().getId();
    var newOpportunity = formContext.ui.getFormType() == 1;
    if (typeValue == 770000005 && stageID != ArupStages.Lead && !newOpportunity) {

        var typeText = typeAttr.getText();

        Alert.show('<font size="6" color="#FF0000"><b>Invalid Opportunity Type</b></font>',
            '<font size="3" color="#000000"></br>Opportunity Type: <b>' + typeText + '</b> is not valid for this stage.</font>',
            [
                { label: "<b>OK</b>", setFocus: true },
            ], "ERROR", 500, 250, '', true);

        formContext.getAttribute("arup_opportunitytype").setValue(null);
        return;
    }

    ParentOpportunityFilter(formContext);
    SetUltimateClient(formContext);
    //SetFeeValue();
    VerifyParentOpportunity(formContext);
    ShowHideFrameworkFields(formContext,trigger);
    FormNotificationForOpportunityType(formContext,formContext.getAttribute("arup_opportunitytype").getValue());
    if (trigger == 'change') {
        setTimeoutfn(formContext,'arup_opportunitytype');
        setBidDecisionChairRequired(formContext);
    }
}

function addEventToProjPartGrid(formContext) {

    var stageID = formContext.data.process.getActiveStage().getId();

    if (stageID != ArupStages.ConfirmJobApproval && stageID != ArupStages.ConfirmJobApproval1 && stageID != ArupStages.ConfirmJobApproval2 && stageID != ArupStages.ConfirmJobApproval3) return;

    // retrieve the subgrid
    var grid = formContext.getControl('Project_Participants');
    // if the subgrid still not available we try again after 2 second
    if (grid == null) {
        setTimeout(function (formContext) { addEventToProjPartGrid(); }, 2000);
        return;
    }
    // add the function to the onRefresh event
    grid.addOnLoad(() => setProjectParticipantFlag(formContext));

}

function OnStateChange(formContext) {
    if (formContext.getAttribute("statecode") != null && formContext.getAttribute("statecode") != "undefined") {
        var state = formContext.getAttribute("statecode").getValue();
        var bpfStatus = formContext.data.process.getStatus();
        if (state == 1 && bpfStatus == 'active') {
            if (getStageId(formContext) == ArupStages.ConfirmJobApproval || getStageId(formContext) == ArupStages.ConfirmJobApproval1 || getStageId(formContext) == ArupStages.ConfirmJobApproval2 || getStageId(formContext) == ArupStages.ConfirmJobApproval3) {
                formContext.data.process.setStatus('finished');

            }
            else {
                formContext.data.process.setStatus('aborted');
            }

        }

        if (state == 2) {
            var bpfStatus = formContext.data.process.getStatus();
            if (bpfStatus == 'active') {
                formContext.data.process.setStatus('aborted');
            }
        }

        if (state == 0) {
            var bpfStatus = formContext.data.process.getStatus();
            if (bpfStatus != 'active') {
                formContext.data.process.setStatus('active');
            }
        }
    }
}

function setup_optionset_size(formContext,field, height, width) {
    var control = formContext.getControl(field);
    if (!!control) {
        (formContext.ui.getFormType() == FORM_TYPE.CREATE ||
            formContext.ui.getFormType() == FORM_TYPE.UPDATE ||
            formContext.ui.getFormType() == FORM_TYPE.QUICK_CREATE ||
            formContext.ui.getFormType() == FORM_TYPE.BULK_EDIT) &&
            $(document)
                .ready(function () {
                    window.parent.$("#" + field)
                        .click(function (e) {
                            if (!!height) {
                                window.parent.$("#" + field + "_i").height(height);
                            }
                            if (!!width) {
                                window.parent.$("#" + field + "_i").width(width);
                            }
                        });
                });
    } else {
        // If the stage containng this control is not on the form, it may become available if a different stage is selected
        if (field.startsWith("header_process")) {
            if (!!formContext.data.process) {
                formContext.data.process.addOnStageSelected(function () { setup_optionset_size(formContext,field, height, width); });
            }
        }
    }
}

function setup_bpf_tooltip(formContext,fieldName) {
    /// <summary>By default BPF tooltips are not set correctly (from the field description) This function copies the 
    ///  tooltip text fromo an existing field on the form to the BPF field.</summary>
    var tooltip = $("#" + fieldName + "_c").attr('title');
    var bpfField = $("#header_process_" + fieldName + "_c");
    if (bpfField.length > 0) {
        bpfField.attr('title', tooltip);
    } else {
        if (!!formContext.data.process) {
            formContext.data.process.addOnStageSelected(function () { setup_bpf_tooltip(formContext,fieldName); });
        }
    }
}

//function setup_ontario_tooltips(fieldname) {

//    var tooltips;

//    switch (fieldname) {
//        case 'arup_transitionaryregime':
//            tooltips = {
//                770000000: // old
//                    "Project procurement process started or Prime Contract signed prior to July 1, 2018. Refer to the AMS Procedures for the definition of Procurement Process Start.",
//                770000001: // Interim
//                    "Project procurement process started or Prime Contract signed between to July 01, 2018 and October 1, 2019. Refer to the AMS Procedures for the definition of Procurement Process Start.",
//                770000002: //new
//                    "Project procurement process started or Prime Contract signed after October 1, 2019. Refer to the AMS Procedures for the definition of Procurement Process Start."
//            }
//            break;
//        case 'arup_constructionactapplies':
//            tooltips = {
//                770000000: // Yes
//                    "Select 'YES', if Arup's deliverables include Construction Design (CD) documents.",
//                770000001: // No
//                    "Select 'NO' if Arup's scope and deliverables are reports, studies, Master Planning services, Transaction Advise, PDC, IC, peer reviews, advisory services."
//            }
//            break;       
//    } 
//    setup_leadsource_tooltips_on_control(fieldname, tooltips);
//}

function setup_leadsource_tooltips() {
    ///<summary>Set tooltips on leadsource picklist</summary>
    var tooltips = {
        100000000: // Extension to existing services
            "Arup bid to supply same/further services, as an extension to an existing project. (One Arup team delivering to the client).",
        100000002: // Label: Arup project (idea) creation
            "Arup has identified an opportunity, suggested the project idea, then submitted a bid to a client.",
        5: // Framework/Panel
            "Arup invited to bid, as one of a shortlist previously chosen via a panel, framework agreement or other process.",
        6: // Internal Referral and cross-selling
            "Arup team cross-sell separate expertise, and introduce an additional Arup team.  (More than one Arup team delivering to the client).",
        3: // Invitation - Arup Only
            "Arup is the only firm invited to bid, without competition.",
        8: // Invitation to Compete
            "Arup invited to bid, as one of a limited number of competitors.",
        11: // Long-Term Opportunity
            "Arup bid follows long-term activities to build a relationship with the client, and demonstrate our capabilities, aiming to become the ‘first choice for project’.",
        10: // Public Advertisement/OJEU
            "Arup chose to bid following a public open invitation."
    }
    setup_leadsource_tooltips_on_control("header_process_ccrm_leadsource", tooltips);
    setup_leadsource_tooltips_on_control("ccrm_leadsource", tooltips);

}

function setup_leadsource_tooltips_on_control(fieldName, tooltips) {

    var control = formContext.getControl(fieldName);
    if (!!control) {
        (formContext.ui.getFormType() == FORM_TYPE.CREATE ||
            formContext.ui.getFormType() == FORM_TYPE.UPDATE ||
            formContext.ui.getFormType() == FORM_TYPE.QUICK_CREATE ||
            formContext.ui.getFormType() == FORM_TYPE.BULK_EDIT) &&
            $(document)
                .ready(function () {
                    window.parent.$("#" + fieldName)
                        .click(function (e) {
                            for (var tooltip in tooltips) {
                                var tooltipElement = window.parent.$("#" + fieldName + "_i [value='" + tooltip + "']");
                                tooltipElement.attr('title', tooltips[tooltip]);
                            }
                        });
                });
    } else {
        if (!!formContext.data.process) {
            formContext.data.process.addOnStageSelected(setup_leadsource_tooltips);
        }
    }

}

function setup_display_other_field(formContext,otherNetworksVal, otherNetworksDetail, otherCodeValue, isToBeHidden) {
    /// <summary>Setup multi-select picklist so that when "other" is selected, a text field is activated to allow the user to enter the details.</summary>
    var isOtherFieldRequired = otherCodeValue;
    if (typeof (otherCodeValue) != "function") {
        isOtherFieldRequired = function (v) { return typeof (v) == "string" && v.search(otherCodeValue) > -1 || v == otherCodeValue };
    }
    isToBeHidden = isToBeHidden == null ? true : isToBeHidden;
    var attribute = formContext.getAttribute(otherNetworksVal);
    if (!!attribute) {
        attribute.addOnChange(function () {
            display_other_field(formContext,otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
        });

        // If this is a BPF field that we are targeting. Add an additional on Stage change callback to change the required/visible status.
        if (formContext.ui.getFormType() != FORM_TYPE.CREATE && /^header_process_/.test(otherNetworksDetail)) {
            formContext.data.process.addOnStageSelected(function () {
                display_other_field(formContext,otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
            });
        }
        // Do this twice as header fields get their requirement level set after the onload function runs.
        display_other_field(formContext,otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
        setTimeout(function () {
            display_other_field(formContext,otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
        },
            1000);
    }
}

function display_other_field(formContext,otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden) {
    var value = formContext.getAttribute(otherNetworksVal).getValue();
    var notApplicable = false;
    var otherNetworkDetails = formContext.getControl(otherNetworksDetail);

    if (otherNetworksVal == 'arup_globalservices' && value != null) {
        notApplicable = value.indexOf(770000000) >= 0;
    }

    if (!!otherNetworkDetails) {

        if (otherNetworksVal == 'arup_globalservices') {

            //if (!!value && isOtherFieldRequired(value) && !notApplicable) {
            if (!!value && value.indexOf(100000003) >= 0 && !notApplicable) {
                otherNetworkDetails.getAttribute().setRequiredLevel("required");
                otherNetworkDetails.setVisible(true);
                return;
            } else if (notApplicable) {

                //formContext.getAttribute("ccrm_othernetworksdisp").setValue('Not Applicable');
                //formContext.getAttribute("ccrm_othernetworksval").setValue('770000000');
                formContext.getAttribute("arup_globalservices").setValue([770000000]);
            }

            formContext.getControl("ccrm_othernetworkdetails").setVisible(false);
            formContext.getAttribute("ccrm_othernetworkdetails").setRequiredLevel('none');
            formContext.getAttribute("ccrm_othernetworkdetails").setValue(null);

        }

        else {
            if (!!value && isOtherFieldRequired(value)) {
                otherNetworkDetails.getAttribute().setRequiredLevel("required");
                otherNetworkDetails.setVisible(true);
            } else {
                otherNetworkDetails.getAttribute().setRequiredLevel("none");
                if (isToBeHidden) {
                    otherNetworkDetails.setVisible(false);
                }
            }
        }
    }
}

function lockDownBidCosts(formContext,lockDown) {

    var statecode = formContext.getAttribute('statecode').getValue();

    /* these fields should be locked down at all times for all licenses besides professional */
    lockDown = (currUserData.caltype != 0 || statecode != 0) ? true : lockDown;

    formContext.getControl("ccrm_salarycost_num").setDisabled(lockDown);
    formContext.getControl("ccrm_staffoverheadspercent").setDisabled(lockDown);
    formContext.getControl("ccrm_grossexpenses_num").setDisabled(lockDown);
    formContext.getControl("ccrm_bid_transactioncurrencyid").setDisabled(lockDown);

    if (lockDown) return;

    formContext.getAttribute('ccrm_salarycost_num').setSubmitMode('always');
    formContext.getAttribute('ccrm_staffoverheadspercent').setSubmitMode('always');
    formContext.getAttribute('ccrm_staffoverheads_num').setSubmitMode('always');
    formContext.getAttribute('ccrm_grossexpenses_num').setSubmitMode('always');
    formContext.getAttribute('ccrm_totalbidcost_num').setSubmitMode('always');
    formContext.getAttribute('ccrm_bid_transactioncurrencyid').setSubmitMode('always');

}

function GetCurrentApprover(formContext) {
    
    var resultCurrentApprover;
    //var select = "ccrm_CurrentApprovers";
    //SDK.REST.retrieveRecord(formContext.data.entity.getId(), "Opportunity", select, null,
    //    function (retrievedreq) {
    //        result = retrievedreq.ccrm_CurrentApprovers;
    //    }, errorHandler, false);

    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/opportunities(" + formContext.data.entity.getId().replace(/[{}]/g, "") +")?$select=ccrm_currentapprovers", false);
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
                resultCurrentApprover = result["ccrm_currentapprovers"];
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();

    return resultCurrentApprover;
}


function GetCurrentApproversAsync(formContext,gotCurrentApproversCallback) {
    ///<summary>Asynchronously Fetch a list of current approvers</summary>
    /// <param name="gotCurrentApproversCallback">A callback function to be invoked with a string containing the current approvers.</param>
    var result;
    var select = "ccrm_CurrentApprovers";
    //SDK.REST.retrieveRecord(formContext.data.entity.getId(), "Opportunity", select, null,
    //    function (retrievedreq) {
    //        gotCurrentApproversCallback(retrievedreq.ccrm_CurrentApprovers);
    //    }, errorHandler);

    Xrm.WebApi.online.retrieveRecord("opportunity", formContext.data.entity.getId(), "?$select=ccrm_currentapprovers").then(
        function success(result) {         
            gotCurrentApproversCallback(result["ccrm_currentapprovers"]);
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
}

function SetCurrentApproverNotification(formContext,currentApproverData) {
    if (currentApproverData) {
        var strStage = currentApproverData;
        strStage = strStage.substring(0, strStage.indexOf("-"));
        var strApprovers = currentApproverData;
        strApprovers = strApprovers.substring(strApprovers.indexOf("-") + 1, strApprovers.Length);
        strApprovers = strApprovers.trim();
        var aryApprovers = strApprovers.split(",");
        aryApprovers = aryApprovers.filter(function isNotempty(value) {
            return value != null && value.trim() != "";
        });
        aryApprovers = aryApprovers.sort();
        currUserData.Approvers = aryApprovers;
        if (strStage.indexOf('with') < 0)
            strStage += 'with ';
        if (aryApprovers.length > 0)
            formContext.ui.setFormNotification(strStage + '"' + aryApprovers.join('" or "') + '"',
                'INFO',
                'CurrentApprovers');
        else
            formContext.ui.setFormNotification("No Approver present for the current Approval",
                'INFO',
                'CurrentApprovers');
    }
}

function SetCurrentStatusFromServer(formContext) {
    ///<summary>Get current statuscode value from server and set it on the current form. (Asynchronous)</summary>
    GetFieldAsync(formContext,"statuscode",
        function (value) {
            var status = formContext.getAttribute("statuscode");
            if (!!status && !!value) {
                status.setValue(value);
                // This doesn't actually work in CRM 2015 to set the value displayed in the header field. So set with Jquery below
                status.setSubmitMode("never");
                $("#footer_statuscode1  span").text(status.getText());
            }
        });
}

var currentApproversAsyncCallback = null;
function setCurrentApproversAsync(formContext,delayInterval, totalElapsedTime, maxDelay, maxElapsedTime) {
    /// <summary>Asynchronously set the current approvers notification. The initial delay interval will ramp up till "maxDelay" is reached.
    /// The async process will run until it either gets a new "Approvers" value, or "totalElapsedTime" has passed and it gives up.</summary>
    /// <param name="delayInterval">If the current approvers value is not set, wait this long before retrying. If null then a default delay intervaly will be used.</param>
    /// <param name="totalElapsedTime">Time that has passed so far since starting to set the approvers.</param>
    /// <param name="maxDelay">Longest interval that we will wait for.</param>
    /// <param name="maxElapsedTime">Maximum total time to wait before giving up.</param>

    cancelAsnycApprovalNotification();
    currentApproversAsyncCallback = pollForChangeAsync(formContext,"ccrm_currentapprovers",
        function isComplete(approvers) { return !!approvers; },
        function onComplete(approvers) {
            SetCurrentApproverNotification(formContext,approvers);
            SetCurrentStatusFromServer(formContext);
        });
}

function cancelAsnycApprovalNotification() {
    if (!!currentApproversAsyncCallback && !!currentApproversAsyncCallback.timeout) {
        clearTimeout(currentApproversAsyncCallback.timeout);
        currentApproversAsyncCallback.timeout = null;
    }
}

function pollForChangeAsync(formContext,fieldname, isComplete, onComplete, delayInterval, totalElapsedTime, maxDelay, maxElapsedTime) {
    /// <summary>Asynchronously poll an entity field till a condition is met, then call a completion function.
    /// The async process will run until it either gets a new "Approvers" value, or "totalElapsedTime" has passed and it gives up.</summary>
    /// <param name="fieldname">Name of the field to be polled.</param>
    /// <param name="IsComplete">function to be called with the retreived field value, will return true if the completion condition is met..</param>
    /// <param name="OnComplete">Function to be invoked when the completion condition has been met.</param>
    /// <param name="delayInterval">If null then a default delay intervaly will be used.</param>
    /// <param name="totalElapsedTime">Time that has passed so far since starting to set the approvers.</param>
    /// <param name="maxDelay">Longest interval that we will wait for.</param>
    /// <param name="maxElapsedTime">Maximum total time to wait before giving up.</param>
    /// <returns type="object">Obejct with handle on the timeout used by the polling process. May be used to cancel polling process if required.</returns>

    //if (isCrmForMobile) return;

    var pollingAsyncCallback = { timeout: null };

    if (!delayInterval) delayInterval = 1000;
    if (!totalElapsedTime) totalElapsedTime = 0;
    if (!maxDelay) maxDelay = 5000;
    if (!maxElapsedTime) maxElapsedTime = 90000; // stop after 90s

    //console.log("Polling for " + fieldname + " - Delay Interval = " + delayInterval + "; totalElapsedTime = " + totalElapsedTime);
    GetFieldAsync(formContext,
        fieldname,
        function (fieldValue) {
            if (isComplete(fieldValue)) {
                onComplete(fieldValue);
                pollingAsyncCallback.timeout = null;
            } else {
                if (totalElapsedTime < maxElapsedTime) {
                    if (!!pollingAsyncCallback.timeout) {
                        clearTimeout(pollingAsyncCallback.timeout);
                        pollingAsyncCallback.timeout = null;
                    }
                    pollingAsyncCallback.timeout = setTimeout(function () {
                        pollForChangeAsync(formContext,fieldname,
                            isComplete,
                            onComplete,
                            delayInterval * 1.5 > maxDelay ? maxDelay : delayInterval * 1.5,
                            totalElapsedTime + delayInterval,
                            maxDelay,
                            maxElapsedTime);
                    },
                        delayInterval);
                }
            }
        }
    );
    return pollingAsyncCallback;
}

function GetFieldAsync(formContext,fieldname, gotFieldCallback) {
    ///<summary>Asynchronously Fetch a list of current approvers</summary>
    /// <param name="gotCurrentApproversCallback">A callback function to be invoked with a string containing the current approvers.</param>
    //var result;
    //var select = fieldname;
    //SDK.REST.retrieveRecord(formContext.data.entity.getId(), "Opportunity", select, null,
    //    function (retrievedreq) {
    //        gotFieldCallback(retrievedreq[fieldname]);
    //    }, errorHandler);


    Xrm.WebApi.online.retrieveRecord("opportunity", formContext.data.entity.getId(), "?$select="+ fieldname +"").then(
        function success(resultretrievedreq) {
            gotFieldCallback(resultretrievedreq[fieldname]);
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
}

function setCurrentApprovers(formContext) {

    formContext.ui.clearFormNotification('CurrentApprovers');
    var state = formContext.getAttribute("statecode").getValue();
    if (state == 0) {
        var regionName = "";
        if (formContext.getAttribute("ccrm_arupregionid").getValue() != null)
            regionName = formContext.getAttribute("ccrm_arupregionid").getValue()[0].name;
        var stageid = getStageId(formContext);
        if (stageid != ArupStages.Lead &&
            stageid != ArupStages.CrossRegion &&
            stageid != ArupStages.BidDevelopment &&
            !(stageid == ArupStages.BidReviewApproval && regionName != "Australasia Region" && regionName != "Malaysia Region") &&
            stageid != ArupStages.BidSubmitted) {
            var currentApproverData = GetCurrentApprover(formContext);
            if (currentApproverData) {
                SetCurrentApproverNotification(formContext,currentApproverData);
            } else {
                setCurrentApproversAsync(formContext);
            }
        }
    }
}

function setLookupFiltering(formContext) {
  
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();

    //bid director
    formContext.getControl("ccrm_biddirector_userid").addPreSearch(function () {
        UpdateRegionalLookup(formContext,"ccrm_biddirector_userid", "ccrm_regionaccreditedprojectbiddtrname", false);
        UpdateRegionalLookup(formContext, "ccrm_biddirector_userid1", "ccrm_regionaccreditedprojectbiddtrname", false);

    });

    //bid manager
    formContext.getControl("ccrm_bidmanager_userid").addPreSearch(function () {
        UpdateRegionalLookup(formContext, "ccrm_bidmanager_userid", "ccrm_regionaccreditedprojectbidmanagername", false);
        UpdateRegionalLookup(formContext, "ccrm_bidmanager_userid1", "ccrm_regionaccreditedprojectbidmanagername", false);

    });

    //project mgr
    formContext.getControl("ccrm_projectmanager_userid").addPreSearch(function () {
        UpdateRegionalLookup(formContext,"ccrm_projectmanager_userid", "ccrm_regionaccreditedprojectbidmanagername", false);
        UpdateRegionalLookup(formContext, "ccrm_projectmanager_userid1", "ccrm_regionaccreditedprojectbidmanagername", false);

    });

    //project director
    formContext.getControl("ccrm_projectdirector_userid").addPreSearch(function () {
        UpdateRegionalLookup(formContext,"ccrm_projectdirector_userid", "ccrm_regionaccreditedprojectbiddtrname", false);
        UpdateRegionalLookup(formContext, "ccrm_projectdirector_userid1", "ccrm_regionaccreditedprojectbiddtrname", false);

    });

    //Bid Decision Chair
    if (!arupInternal) {
        formContext.getControl("arup_biddecisionchair").addPreSearch(function () {
            UpdateRegionalLookup(formContext,"arup_biddecisionchair", "ccrm_regionaccreditedprojectbiddtrname", false);
            UpdateRegionalLookup(formContext, "arup_biddecisionchair1", "ccrm_regionaccreditedprojectbiddtrname", false);

        });
    }

    if (formContext.getControl("header_process_ccrm_biddirector_userid") != null)
        formContext.getControl("header_process_ccrm_biddirector_userid").addPreSearch(function () {
            UpdateRegionalLookup(formContext,"header_process_ccrm_biddirector_userid", "ccrm_regionaccreditedprojectbiddtrname", true);
        });

    if (formContext.getControl("header_process_ccrm_bidmanager_userid") != null)
        formContext.getControl("header_process_ccrm_bidmanager_userid").addPreSearch(function () {
            UpdateRegionalLookup(formContext,"header_process_ccrm_bidmanager_userid", "ccrm_regionaccreditedprojectbidmanagername", true);
        });

    // Developed bid stage
    if (formContext.getControl("header_process_ccrm_projectdirector_userid") != null)
        formContext.getControl("header_process_ccrm_projectdirector_userid").addPreSearch(function () {
            UpdateRegionalLookup(formContext,"header_process_ccrm_projectdirector_userid", "ccrm_regionaccreditedprojectbiddtrname", true);
        });

    if (formContext.getControl("header_process_ccrm_projectmanager_userid") != null)
        formContext.getControl("header_process_ccrm_projectmanager_userid").addPreSearch(function () {
            UpdateRegionalLookup(formContext,"header_process_ccrm_projectmanager_userid", "ccrm_regionaccreditedprojectbidmanagername", true);
        });

    if (formContext.getControl("header_process_arup_biddecisionchair") != null && !arupInternal)
        formContext.getControl("header_process_arup_biddecisionchair").addPreSearch(function () {
            UpdateRegionalLookup(formContext,"header_process_arup_biddecisionchair", "ccrm_regionaccreditedprojectbiddtrname", true);
        });

    if (formContext.getControl("header_process_ccrm_bidreviewchair_userid") != null) {
        filterBPFUserLookup("header_process_ccrm_bidreviewchair_userid");
    }

    //bid review approval stage
    if (formContext.getControl("header_process_ccrm_bidreviewchair_userid1") != null) {
        filterBPFUserLookup("header_process_ccrm_bidreviewchair_userid1");
    }

    // confmed job stage
    if (formContext.getControl("header_process_ccrm_projectdirector_userid1") != null)
        formContext.getControl("header_process_ccrm_projectdirector_userid1").addPreSearch(function () {
            UpdateRegionalLookup(formContext,"header_process_ccrm_projectdirector_userid1", "ccrm_regionaccreditedprojectbiddtrname", true);
        });

    if (formContext.getControl("header_process_ccrm_projectmanager_userid1") != null)
        formContext.getControl("header_process_ccrm_projectmanager_userid1").addPreSearch(function () {
            UpdateRegionalLookup(formContext,"header_process_ccrm_projectmanager_userid1", "ccrm_regionaccreditedprojectbidmanagername", true);
        });

}

function UpdateRegionalLookup(formContext,lookupFieldName, filterChkFieldName, isBPFField) {
    addUserLookupFilter(formContext,"ccrm_arupregionid", lookupFieldName, filterChkFieldName);
    if (isBPFField) {
        filterBPFUserLookup(lookupFieldName);
    }
}
//CRM 2016 Known Issues 2.1.1
function filterBPFUserLookup(lookupFieldName) {

    var bpfelementname = lookupFieldName + "_i";
    if (!isCrmForMobile) {
        if (parent.document.getElementById(bpfelementname) != null)
            parent.document.getElementById(bpfelementname).setAttribute("disableViewPicker", "1");
        //parent.document.getElementById("bpfelementname").attributes.disableviewpicker.value = "1"
    }
}

function getArupRegionName(formContext,opportunityFieldName) {
    var region;
    var arupRegionName;

    if (formContext.ui.getFormType() == 1) {

        if (currUserData != undefined || currUserData != null)
            currUserData = getCurrentUserDetails(formContext);

        region = currUserData.userRegionID;
        arupRegionName = currUserData.userRegionName;
    } else {
        region = formContext.getAttribute(opportunityFieldName).getValue();
        if (region != null)
            arupRegionName = region[0].name;
    }
    return [region, arupRegionName];
}

function GetAccLevelFilter(formContext, arupRegionName, lookupFieldName) {
    var acclevel = "";
    var accLevValue = "";
    var accLevType = "";
    var accLevField = "";
    var accLevFilter = "";

    if (lookupFieldName.indexOf("projectmanager") != -1) {
        accLevType = "PM";
    }
    if (lookupFieldName.indexOf("projectdirector") != -1) {
        accLevType = "PD";
    }

    if (arupRegionName != null && arupRegionName.toLowerCase() == (ArupRegionName.EastAsia).toLowerCase() && accLevType != "") {
        switch (accLevType) {
            case "PM":
                accLevField = "arup_eapmaccrlev"
                break;

            case "PD":
                accLevField = "arup_eapdaccrlev"
        }
        acclevel = EAAccreditaionLevRequired(formContext);
    }
    if (acclevel != "") {
        switch (acclevel) {
            case "Level 1":
                accLevValue = 770000000
                break;

            case "Level 2":
                accLevValue = 770000001
                break;

            case "Level 3":
                accLevValue = 770000002
                break;
        }
    }


    if (accLevValue != "") //Filter based on the acc level
    {
        //Find if any users are present with the accreditations...
        var regQuery = "";
        var accLevQuery = "";
        var QueryRegionField = "";
        var queryLevField = "";
        if (accLevType == "PM") {
            //QueryRegionField = "ccrm_RegionAccreditedProjectBidManagerName";
            //queryLevField = "arup_EAPMAccrLev/Value";
            QueryRegionField = "arup_pmregionaccreditation";
            queryLevField = "arup_eapmaccrlev";
        }
        else if (accLevType == "PD") {
            //QueryRegionField = "ccrm_RegionAccreditedProjectBidDtrName";
            //queryLevField = "arup_EAPDAccrLev/Value";
            QueryRegionField = "arup_pdregionaccreditation";
            queryLevField = "arup_eapdaccrlev";
        }

        //  regQuery = " and substringof('" + arupRegionName + "'," + QueryRegionField + ")";
        regQuery = " and Microsoft.Dynamics.CRM.ContainValues(PropertyName='" + QueryRegionField + "',PropertyValues=%5B'100000003'%5D)";

        if (accLevValue == 770000002) //Level 3 filter
        {
            accLevQuery = " and " + queryLevField + " eq 770000002";
        }
        else {
            accLevQuery = " and (" + queryLevField + " eq " + accLevValue.toString() + " or " + queryLevField + " eq 770000002)";
        }

        //   var filter = "$select=SystemUserId&$filter=not endswith(InternalEMailAddress,'%arup.com') and AccessMode/Value ne 3 and arup_EmploymentStatus/Value eq 770000000" + regQuery + accLevQuery;
        var filter = "$select=systemuserid&$filter=not endswith(internalemailaddress,'%25arup.com') and  accessmode ne 3 and  arup_employmentstatus eq 770000000" + regQuery + accLevQuery;

        var req = new XMLHttpRequest();
        req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/systemusers?" + filter, false);
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
                    if (results.value.length > 0) {
                        if (accLevValue == 770000000 || accLevValue == 770000001) //If lev 1 or lev 2 include lev 3 users as well
                        {
                            accLevFilter = "<condition attribute='" + accLevField + "' operator='in'><value>" + accLevValue + "</value><value>770000002</value></condition>";
                        }
                        else {
                            accLevFilter = "<condition attribute='" + accLevField + "' operator='eq' value='" + accLevValue + "' />";
                        }
                    } else {
                        return null;
                    };

                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();
    }
        return accLevFilter;
}

function addUserLookupFilter(formContext,opportunityFieldName, lookupFieldName, filterChkFieldName) {
    var arupRegionData = getArupRegionName(formContext,opportunityFieldName);
    var region;
    var arupRegionName;
    if (arupRegionData[0] != null) {
        region = arupRegionData[0];
        arupRegionName = arupRegionData[1];
    }

    var accLevFilter = GetAccLevelFilter(formContext, arupRegionName, lookupFieldName);

    //var acclevel = "";
    //var accLevValue = "";
    //var accLevType = "";
    //var accLevField = "";

    //if (lookupFieldName.indexOf("projectmanager") != -1) {
    //    accLevType = "PM";
    //}
    //if (lookupFieldName.indexOf("projectdirector") != -1) {
    //    accLevType = "PD";
    //}

    //if (arupRegionName != null && arupRegionName.toLowerCase() == (ArupRegionName.EastAsia).toLowerCase() && accLevType != "") {
    //    switch (accLevType) {
    //        case "PM":
    //            accLevField = "arup_eapmaccrlev"
    //            break;

    //        case "PD":
    //            accLevField = "arup_eapdaccrlev"
    //    }
    //    acclevel = EAAccreditaionLevRequired(formContext);
    //}
    //if (acclevel != "") {
    //    switch (acclevel) {
    //        case "Level 1":
    //            accLevValue = 770000000
    //            break;

    //        case "Level 2":
    //            accLevValue = 770000001
    //            break;

    //        case "Level 3":
    //            accLevValue = 770000002
    //            break;
    //    }
    //}

    //var accLevFilter = "";
    //if (accLevValue != "") //Filter based on the acc level
    //{
    //    //Find if any users are present with the accreditations...
    //    var regQuery = "";
    //    var accLevQuery = "";
    //    var QueryRegionField = "";
    //    var queryLevField = "";
    //    if (accLevType == "PM")
    //    {
    //        //QueryRegionField = "ccrm_RegionAccreditedProjectBidManagerName";
    //        //queryLevField = "arup_EAPMAccrLev/Value";
    //        QueryRegionField = "arup_pmregionaccreditation";
    //        queryLevField = "arup_eapmaccrlev";
    //    }
    //    else if (accLevType == "PD")
    //    {
    //        //QueryRegionField = "ccrm_RegionAccreditedProjectBidDtrName";
    //        //queryLevField = "arup_EAPDAccrLev/Value";
    //        QueryRegionField = "arup_pdregionaccreditation";
    //        queryLevField = "arup_eapdaccrlev";
    //    }

    //  //  regQuery = " and substringof('" + arupRegionName + "'," + QueryRegionField + ")";
    //    regQuery = " and Microsoft.Dynamics.CRM.ContainValues(PropertyName='" + QueryRegionField +"',PropertyValues=%5B'100000003'%5D)";

    //    if (accLevValue == 770000002) //Level 3 filter
    //    {
    //        accLevQuery = " and " + queryLevField + " eq 770000002";
    //    }
    //    else {
    //        accLevQuery = " and (" + queryLevField + " eq " + accLevValue.toString() + " or " + queryLevField + " eq 770000002)";
    //    }

    // //   var filter = "$select=SystemUserId&$filter=not endswith(InternalEMailAddress,'%arup.com') and AccessMode/Value ne 3 and arup_EmploymentStatus/Value eq 770000000" + regQuery + accLevQuery;
    //    var filter = "$select=systemuserid&$filter=not endswith(internalemailaddress,'%25arup.com') and  accessmode ne 3 and  arup_employmentstatus eq 770000000" + regQuery + accLevQuery;

    //    var req = new XMLHttpRequest();
    //    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/systemusers?" + filter, false);
    //    req.setRequestHeader("OData-MaxVersion", "4.0");
    //    req.setRequestHeader("OData-Version", "4.0");
    //    req.setRequestHeader("Accept", "application/json");
    //    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    //    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    //    req.onreadystatechange = function () {
    //        if (this.readyState === 4) {
    //            req.onreadystatechange = null;
    //            if (this.status === 200) {
    //                var results = JSON.parse(this.response);
    //                if (results.value.length > 0) {
    //                    if (accLevValue == 770000000 || accLevValue == 770000001) //If lev 1 or lev 2 include lev 3 users as well
    //                    {
    //                        accLevFilter = "<condition attribute='" + accLevField + "' operator='in'><value>" + accLevValue + "</value><value>770000002</value></condition>";
    //                    }
    //                    else {
    //                        accLevFilter = "<condition attribute='" + accLevField + "' operator='eq' value='" + accLevValue + "' />";
    //                    }
    //                } else {
    //                    return null;
    //                };
                   
    //            } else {
    //                Xrm.Utility.alertDialog(this.statusText);
    //            }
    //        }
    //    };
    //    req.send();

    //    //SDK.REST.retrieveMultipleRecords("SystemUser", filter,
    //    //    function (results) {
    //    //        if (results.length > 0) {
    //    //            if (accLevValue == 770000000 || accLevValue == 770000001) //If lev 1 or lev 2 include lev 3 users as well
    //    //            {
    //    //                accLevFilter = "<condition attribute='" + accLevField + "' operator='in'><value>" + accLevValue + "</value><value>770000002</value></condition>";
    //    //            }
    //    //            else {
    //    //                accLevFilter = "<condition attribute='" + accLevField + "' operator='eq' value='" + accLevValue + "' />";
    //    //            }
    //    //        } else {
    //    //            return null;
    //    //        };
    //    //    },
    //    //    errorHandler,
    //    //    function () { },
    //    //    false);


    //}

    if (region != null) {
        var viewId = "{00000000-0000-0000-0000-000000000001}";
        var viewName = "Users Lookup View";
        var viewFetchXml; //Changes as part of UKMEA to UKIMEA
        if (arupRegionName.match(/UK/gi)) {
            viewFetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                "<entity name='systemuser'>" +
                "<attribute name='fullname' />" +
                "<attribute name='ccrm_arupofficeid' />" +
                "<attribute name='jobtitle' />" +
                "<attribute name='systemuserid' />" +
                "<order attribute='fullname' descending='false' />" +
                "<filter type='and'>" +
                "<condition attribute='accessmode' operator='ne' value='3' />" +
                "<condition attribute='arup_employmentstatus' value='770000000' operator='eq'/>" +
                "<condition attribute='internalemailaddress' operator='like' value='%arup.com%'/>" +
                accLevFilter +
                "<condition attribute='" +
                filterChkFieldName +
                "' value='%UK%' operator='like'/>" +
                "</filter>" +
                "</entity>" +
                "</fetch>";
        }
        else {
            viewFetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                "<entity name='systemuser'>" +
                "<attribute name='fullname' />" +
                "<attribute name='ccrm_arupofficeid' />" +
                "<attribute name='jobtitle' />" +
                "<attribute name='systemuserid' />" +
                "<order attribute='fullname' descending='false' />" +
                "<filter type='and'>" +
                "<condition attribute='accessmode' operator='ne' value='3' />" +
                "<condition attribute='arup_employmentstatus' value='770000000' operator='eq'/>" +
                "<condition attribute='internalemailaddress' operator='like' value='%@arup.com%'/>" +
                accLevFilter +
                "<condition attribute='" +
                filterChkFieldName +
                "' value='%" +
                arupRegionName +
                "%' operator='like'/>" +
                "</filter>" +
                "</entity>" +
                "</fetch>";
        }

        var layoutXml = "<grid name='resultset' object='1' jump='fullname' select='1' icon='1' preview='1'>" +
            "<row name='result' id='systemuserid'>" +
            "<cell name='fullname' width='150' />" +
            "<cell name='jobtitle' width='100' />" +
            "<cell name='ccrm_arupofficeid' width='150' />" +
            "</row>" +
            "</grid>";
        formContext.getControl(lookupFieldName).addCustomView(viewId, "systemuser", viewName, viewFetchXml, layoutXml, true);

    }
}

function EAAccreditaionLevRequired(formContext) {
 
    var qualLevs = "";
    var procType = formContext.getAttribute("ccrm_contractarrangement").getValue();
    // var disciplines = formContext.getAttribute("ccrm_disciplinesname").getValue();
    var disciplines = formContext.getAttribute("arup_disciplines").getValue();
    var feeIncomeValue = formContext.getAttribute("estimatedvalue_base").getValue();
    var projCurr = formContext.getAttribute("ccrm_project_transactioncurrencyid").getValue();
    if (projCurr != null) {
        var projCurrName = projCurr[0].name;
        //if(projCurrName != "Hong Kong Dollar")
        var discLen = 0;
        if (disciplines != null) {
           // var discArray = disciplines.split(',');
           // discLen = discArray.length;
            discLen = disciplines.length;
        }
       // var ftr = "$select=ExchangeRate&$filter=ISOCurrencyCode eq 'HKD'";

        //SDK.REST.retrieveMultipleRecords("TransactionCurrency", ftr,
        //    function (results) {
        //        if (results.length > 0) {
        //            var exRt = results[0].ExchangeRate;
        //            feeIncomeValue = feeIncomeValue * exRt;
        //        } else {
        //            return null;
        //        };
        //    }, errorHandler,
        //    function () { },
        //    false);

        //Xrm.WebApi.online.retrieveMultipleRecords("transactioncurrency", "?$select=exchangerate&$filter=isocurrencycode eq 'HKD'").then(
        //    function success(results) {
        //        for (var i = 0; i < results.entities.length; i++) {
        //            var exRt = results.entities[i]["exchangerate"];
        //            feeIncomeValue = feeIncomeValue * exRt;
        //        }
        //    },
        //    function (error) {
        //        Xrm.Utility.alertDialog(error.message);
        //    }
        //);

        var req = new XMLHttpRequest();
        req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/transactioncurrencies?$select=exchangerate&$filter=isocurrencycode eq 'HKD'", false);
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
                    for (var i = 0; i < results.value.length; i++) {
                        var exRt = results.value[i]["exchangerate"];
                        feeIncomeValue = feeIncomeValue * exRt;
                    }
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();

        if ((procType == 1 || procType == 100000002) && feeIncomeValue >= 25000000 && discLen >= 3) { qualLevs = "Level 3"; }
        else if ((procType != 1 || procType != 100000002) && feeIncomeValue >= 25000000 && discLen >= 3) { qualLevs = "Level 2"; }
        else if ((procType == 1 || procType == 100000002))//&& feeIncomeValue < 25000000)
        { qualLevs = "Level 1"; }

    }
    return qualLevs;
}

function FormOnSave(executionContext) {
    debugger;
    formContext = executionContext.getFormContext();

    var preventSave = false;
    var errormessage;
    var stageID = formContext.data.process.getActiveStage().getId();

    //if (formContext.getAttribute("ccrm_client").getValue()[0].name == 'Unassigned' && formContext.getAttribute("ccrm_arupinternal").getValue() == false && stageID != ArupStages.Lead) {
    //    preventSave = true;
    //    errormessage = 'Client cannot be set to Unassigned for this Opportunity.';
    //}

    if (formContext.getAttribute("ccrm_arupregionid").getValue() == null || formContext.getAttribute("ccrm_arupregionid").getValue()[0].name == null) {
        if (formContext.getAttribute("ccrm_arupgroupid").getValue() == null) {
            preventSave = true;
            errormessage = 'Arup Region is not determined. Please verify the Arup Group.';
        }
        else { formContext.getAttribute('ccrm_arupregionid').setValue(fetchArupRegion(formContext.context.getClientUrl(),formContext.getAttribute("ccrm_arupgroupid").getValue()[0].id)); }
    }

    if (preventSave) {
        formContext.ui.setFormNotification(errormessage, 'WARNING', 'msgReg');
        setTimeout(function () { formContext.ui.clearFormNotification("msgReg"); }, 5000);
        executionContext.getEventArgs().preventDefault();
        return false;
    }

    if (stageID == ArupStages.ConfirmJobApproval || stageID == ArupStages.ConfirmJobApproval1 || stageID == ArupStages.ConfirmJobApproval2 || stageID == ArupStages.ConfirmJobApproval3) {
        setProjectParticipantFlag(formContext);
    }

    if (formContext.getAttribute('ccrm_estimatedvalue_num').getValue() != null && formContext.getAttribute('ccrm_projecttotalincome_num').getValue() == null) {
        calcRecalcIncome(formContext);
    }

    if (formContext.data.entity.getIsDirty()) {
        formContext.getAttribute("ccrm_stagetoggle").setSubmitMode("never");
        formContext.getAttribute("ccrm_stagetoggle").setValue(2);
        formContext.getAttribute("ccrm_stagetoggle").fireOnChange();
    }

    //dirtyfieldsid('Save: ');
    if (
        (formContext.getAttribute("ccrm_arupbusinessid").getValue()[0].name == 'Charity & Community' || formContext.getAttribute("arup_opportunitytype").getValue() == '770000005') &&
        formContext.getAttribute("ccrm_estimatedvalue_num").getValue() != 0) {
        formContext.getAttribute("ccrm_estimatedvalue_num").setValue(0);
        formContext.getAttribute('ccrm_estimatedvalue_num').setSubmitMode('always');
        //the line below doesn't work for some reason
        formContext.getAttribute("ccrm_estimatedvalue_num").fireOnChange();
    }
    if (moveToNextTrigger == true) { // move to next stage logic
        moveToNextTrigger = false;
        setTimeout(function () {
            BPFMoveNext(formContext);
            hideProcessFields(formContext,formContext.data.process.getSelectedStage().getName());
        }, 5000);
        hideProcessFields(formContext,formContext.data.process.getSelectedStage().getName());
    }
}

//calculate project participants
function setProjectParticipantFlag(formContext) {

    var ProjectParticExist = projectParticipantExists(formContext);
    var ProjectParticApplicable = formContext.getAttribute("arup_projparticipants_reqd").getValue();
    var ProjectParticRequired = formContext.getAttribute("arup_projpartreqd").getValue();
    var setProjPartFlag = (ProjectParticExist == true) ? 770000000 : 770000001;

    if (ProjectParticApplicable == null || ProjectParticRequired == null || (ProjectParticApplicable != null && ProjectParticApplicable != ProjectParticExist) || (ProjectParticRequired != null && ProjectParticRequired != setProjPartFlag)) {
        formContext.getAttribute("arup_projparticipants_reqd").setValue(ProjectParticExist);
        formContext.getAttribute("arup_projpartreqd").setValue(setProjPartFlag);
        formContext.getAttribute('arup_projparticipants_reqd').setSubmitMode("always");
        formContext.getAttribute('arup_projpartreqd').setSubmitMode("always");
        formContext.data.save();
    }
}

//Added by Jugal on 21-3-2018 starts
function GetandSetUserinPMPDBMBD(formContext,opportunityId, fieldName) {
    var req = new XMLHttpRequest();
    opportunityId = opportunityId.replace("{", "");
    opportunityId = opportunityId.replace("}", "");
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/opportunities(" + opportunityId + ")?$select=" + fieldName, false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                if (fieldName == "_ccrm_bidmanager_userid_value") {
                    if (results._ccrm_bidmanager_userid_value != null) {
                        formContext.getAttribute("ccrm_bidmanager_userid").setValue([{ id: results._ccrm_bidmanager_userid_value, name: results["_ccrm_bidmanager_userid_value@OData.Community.Display.V1.FormattedValue"], entityType: "systemuser" }]);
                    } else {
                        formContext.getAttribute("ccrm_bidmanager_userid").setValue(null);
                    }
                } else if (fieldName == "_ccrm_biddirector_userid_value") {
                    if (results._ccrm_biddirector_userid_value != null) {
                        formContext.getAttribute("ccrm_biddirector_userid").setValue([{ id: results._ccrm_biddirector_userid_value, name: results["_ccrm_biddirector_userid_value@OData.Community.Display.V1.FormattedValue"], entityType: "systemuser" }]);
                    } else {
                        formContext.getAttribute("ccrm_biddirector_userid").setValue(null);
                    }
                } else if (fieldName == "_ccrm_projectmanager_userid_value") {
                    if (results._ccrm_projectmanager_userid_value != null) {
                        formContext.getAttribute("ccrm_projectmanager_userid").setValue([{ id: results._ccrm_projectmanager_userid_value, name: results["_ccrm_projectmanager_userid_value@OData.Community.Display.V1.FormattedValue"], entityType: "systemuser" }]);
                    } else {
                        formContext.getAttribute("ccrm_projectmanager_userid").setValue(null);
                    }
                } else if (fieldName == "_ccrm_projectdirector_userid_value") {
                    if (results._ccrm_projectdirector_userid_value != null) {
                        formContext.getAttribute("ccrm_projectdirector_userid").setValue([{ id: results._ccrm_projectdirector_userid_value, name: results["_ccrm_projectdirector_userid_value@OData.Community.Display.V1.FormattedValue"], entityType: "systemuser" }]);
                    } else {
                        formContext.getAttribute("ccrm_projectdirector_userid").setValue(null);
                    }
                }
            }
            else {
                alert(this.statusText);
            }
        }
    };
    req.send();
}

//Validate Bid Manager onChange, if there is data in it
function ValidateBidManager_onChange(formContext) {
    if (formContext.getAttribute("ccrm_bidmanager_userid") != null) {
        if (formContext.getAttribute("ccrm_bidmanager_userid").getValue() != null) {
            vrStatus = ValidateUser(formContext,"ccrm_arupregionid", "ccrm_bidmanager_userid", "ccrm_regionaccreditedprojectbidmanagername");
            if (!vrStatus) {
                GetandSetUserinPMPDBMBD(formContext,formContext.data.entity.getId(), "_ccrm_bidmanager_userid_value");
                Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                    '<font size="3" color="#000000"></br>Bid Manager is not an accredited user. Please provide valid user.</font>',
                    [
                        { label: "<b>OK</b>", setFocus: true },
                    ],
                    "WARNING", 400, 250, '', true);
                return false;
            }
        } else if (formContext.getAttribute("ccrm_bidmanager_userid").getValue() == null) {
            GetandSetUserinPMPDBMBD(formContext,formContext.data.entity.getId(), "_ccrm_bidmanager_userid_value");
        }
    }
    return true;
}

//Validate Bid Director onChange, if there is data in it
function ValidateBidDirector_onchange(formContext) {
    if (formContext.getAttribute("ccrm_biddirector_userid") != null) {
        if (formContext.getAttribute("ccrm_biddirector_userid").getValue() != null) {
            vrStatus = ValidateUser(formContext,"ccrm_arupregionid", "ccrm_biddirector_userid", "ccrm_regionaccreditedprojectbiddtrname");
            if (!vrStatus) {
                GetandSetUserinPMPDBMBD(formContext,formContext.data.entity.getId(), "_ccrm_biddirector_userid_value");
                Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                    '<font size="3" color="#000000"></br>Bid Director is not an accredited user. Please provide valid user.</font>',
                    [
                        { label: "<b>OK</b>", setFocus: true },
                    ],
                    "WARNING", 400, 250, '', true);
                return false;
            }
        } else if (formContext.getAttribute("ccrm_biddirector_userid").getValue() == null) {
            GetandSetUserinPMPDBMBD(formContext,formContext.data.entity.getId(), "_ccrm_biddirector_userid_value");
        }
    }
    return true;
}
//Validate Project Manager on save, if there is data in it
function ValidateProjectManager_onchange(executionContext) {
    formContext = executionContext.getFormContext();
    if (formContext.getAttribute("ccrm_projectmanager_userid") != null) {
        if (formContext.getAttribute("ccrm_projectmanager_userid").getValue() != null) {
            vrStatus = ValidateUser(formContext,"ccrm_arupregionid", "ccrm_projectmanager_userid", "ccrm_regionaccreditedprojectbidmanagername");
            if (!vrStatus) {
                GetandSetUserinPMPDBMBD(formContext,formContext.data.entity.getId(), "_ccrm_projectmanager_userid_value");
                Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                    '<font size="3" color="#000000"></br>Project Manager is not an accredited user. Please provide valid user.</font>',
                    [
                        { label: "<b>OK</b>", setFocus: true },
                    ],
                    "WARNING", 400, 250, '', true);
                return false;
            }
        } // Shruti : commented below line of code
        //else if (formContext.getAttribute("ccrm_projectmanager_userid").getValue() == null) {
        //    GetandSetUserinPMPDBMBD(formContext,formContext.data.entity.getId(), "_ccrm_projectmanager_userid_value");
        //}
    }
    return true;
}
//Validate Project Director on save, if there is data in it
function ValidateProjectDirector_onchange(executionContext) {
    formContext = executionContext.getFormContext();
    if (formContext.getAttribute("ccrm_projectdirector_userid") != null) {
        if (formContext.getAttribute("ccrm_projectdirector_userid").getValue() != null) {
            vrStatus = ValidateUser(formContext,"ccrm_arupregionid", "ccrm_projectdirector_userid", "ccrm_regionaccreditedprojectbiddtrname");
            if (!vrStatus) {
                GetandSetUserinPMPDBMBD(formContext,formContext.data.entity.getId(), "_ccrm_projectdirector_userid_value");
                Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                    '<font size="3" color="#000000"></br>Project Director is not an accredited user. Please provide valid user.</font>',
                    [
                        { label: "<b>OK</b>", setFocus: true },
                    ],
                    "WARNING", 400, 250, '', true);
                return false;
            }
        } //Shruti : commented below line of code
        //else if (formContext.getAttribute("ccrm_projectdirector_userid").getValue() == null) {
        //    GetandSetUserinPMPDBMBD(formContext,formContext.data.entity.getId(), "_ccrm_projectdirector_userid_value");
        //}
    }
    return true;
}

//Validate the user details with the access level conditions
function ValidateUser(formContext,opportunityFieldName, lookupFieldName, filterChkFieldName) {
    var vrStatus;
    var userId = formContext.getAttribute(lookupFieldName).getValue()[0].id;
    var arupRegionData = getArupRegionName(formContext,opportunityFieldName);
    var region;
    var arupRegionName;
    if (arupRegionData[0] != null) {
        region = arupRegionData[0];
        arupRegionName = arupRegionData[1];
    }

    var accLevFilter = GetAccLevelFilter(formContext, arupRegionName, lookupFieldName);

    //var acclevel = "";
    //var accLevValue = "";
    //var accLevType = "";
    //var accLevField = "";

    //if (lookupFieldName.indexOf("projectmanager") != -1) {
    //    accLevType = "PM";
    //}
    //if (lookupFieldName.indexOf("projectdirector") != -1) {
    //    accLevType = "PD";
    //}

    //if (arupRegionName != null && arupRegionName.toLowerCase() == (ArupRegionName.EastAsia).toLowerCase() && accLevType != "") {
    //    switch (accLevType) {
    //        case "PM":
    //            accLevField = "arup_eapmaccrlev"
    //            break;

    //        case "PD":
    //            accLevField = "arup_eapdaccrlev"
    //    }
    //    acclevel = EAAccreditaionLevRequired(formContext);
    //}
    //if (acclevel != "") {
    //    switch (acclevel) {
    //        case "Level 1":
    //            accLevValue = 770000000
    //            break;

    //        case "Level 2":
    //            accLevValue = 770000001
    //            break;

    //        case "Level 3":
    //            accLevValue = 770000002
    //            break;
    //    }
    //}

    //var accLevFilter = "";
    //if (accLevValue != "") //Filter based on the acc level
    //{
    //    //Find if any users are present with the accreditations...
    //    var regQuery = "";
    //    var accLevQuery = "";
    //    var QueryRegionField = "";
    //    var queryLevField = "";
    //    if (accLevType == "PM") { QueryRegionField = "ccrm_RegionAccreditedProjectBidManagerName"; queryLevField = "arup_EAPMAccrLev/Value"; }
    //    else if (accLevType == "PD") { QueryRegionField = "ccrm_RegionAccreditedProjectBidDtrName"; queryLevField = "arup_EAPDAccrLev/Value"; }
    //    regQuery = " and substringof('" + arupRegionName + "'," + QueryRegionField + ")";
    //    if (accLevValue == 770000002) //Level 3 filter
    //    {
    //        accLevQuery = " and " + queryLevField + " eq 770000002";
    //    }
    //    else {
    //        accLevQuery = " and (" + queryLevField + " eq " + accLevValue.toString() + " or " + queryLevField + " eq 770000002)";
    //    }

    //    var filter = "$select=SystemUserId&$filter= not endswith(InternalEMailAddress,'%arup.com') and AccessMode/Value ne 3 and arup_EmploymentStatus/Value eq 770000000" + regQuery + accLevQuery;


    //    SDK.REST.retrieveMultipleRecords("SystemUser", filter,
    //        function (results) {
    //            if (results.length > 0) {
    //                if (accLevValue == 770000000 || accLevValue == 770000001) //If lev 1 or lev 2 include lev 3 users as well
    //                {
    //                    accLevFilter = "<condition attribute='" + accLevField + "' operator='in'><value>" + accLevValue + "</value><value>770000002</value></condition>";
    //                }
    //                else {
    //                    accLevFilter = "<condition attribute='" + accLevField + "' operator='eq' value='" + accLevValue + "' />";
    //                }
    //            } else {
    //                return null;
    //            };
    //        }, errorHandler,
    //        function () { },
    //        false);
    //}

    if (region != null) {
        var userFetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
            "<entity name='systemuser'>" +
            "<attribute name='fullname' />" +
            "<attribute name='ccrm_arupofficeid' />" +
            "<attribute name='jobtitle' />" +
            "<attribute name='systemuserid' />" +
            "<order attribute='fullname' descending='false' />" +
            "<filter type='and'>" +
            "<condition attribute='systemuserid' operator='eq' value='" + userId + "' />" +
            "<condition attribute='accessmode' operator='ne' value='3' />" +
            "<condition attribute='arup_employmentstatus' value='770000000' operator='eq'/>" +
            "<condition attribute='internalemailaddress' operator='like' value='%arup.com%'/>" +
            accLevFilter +
            "<condition attribute='" +
            filterChkFieldName +
            "' value='%" +
            arupRegionName +
            "%' operator='like'/>" +
            "</filter>" +
            "</entity>" +
            "</fetch>";

        var encodedFetchXML = encodeURIComponent(userFetchXml);

        var req = new XMLHttpRequest();
        req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/systemusers?fetchXml=" + encodedFetchXML, false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"OData.Community.Display.V1.FormattedValue\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    if (results.value.length == 1) {
                        vrStatus = true;
                    } else {
                        vrStatus = false;
                    }
                }
                else {
                    alert(this.statusText);
                }
            }
        };
        req.send();
        return vrStatus;
    }
}
//Added by Jugal on 21-3-2018 ends

//function dirtyfieldsid(text) {
//    oppAttributes = formContext.data.entity.attributes.get();
//    if (oppAttributes != null) {
//        for (var i in oppAttributes) {
//            if (oppAttributes[i].getIsDirty()) {
//                console.log(text + " : " + oppAttributes[i].getName());
//            }
//        }
//    }
//}

function customerid_onChange(formContext,strSave) {

    if (formContext.ui.getFormType() == 1) {
        return;
    };

    //validate the selected contact. If customer == Unassigned then user is not allowed to progress on the BPF
    var fieldName = 'ccrm_validcontact';
    var warnMsg = 'A valid client needs to be set for Opportunity Progression';//[RS-08/05/2017] - Replaced Lead in the message with Opportunity
    var warnMsgName = 'validcustomer';
    var result = false;
    var tab = formContext.ui.tabs.get("Project_Details_Tab");
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
    if (formContext.getAttribute("customerid").getValue() == null)
        SetValidField(formContext,fieldName, false, warnMsg, warnMsgName);
    else if (formContext.getAttribute("customerid").getValue()[0].name == 'Unassigned' && arupInternal != true) {
        //if (!!tab) {
        //    var section = tab.sections.get("tab_7_section_1");
        //    if (!!section) {
        //        section.setVisible(false);
        //    }
        //}
        if (strSave)
            SetValidField(formContext,fieldName, true, warnMsg, warnMsgName);
        else
            SetValidField(formContext,fieldName, false, warnMsg, warnMsgName);
        result = true;
    } else {
        //if (!!tab) {
        //    var section = tab.sections.get("tab_7_section_1");
        //    if (!!section) {
        //        section.setVisible(false);
        //    }
        //}
        SetValidField(formContext,fieldName, true, null, warnMsgName);
        highlightField(null, '#ccrm_client', true);
    }
    return result;
}

function SetCountryOfReg(formContext, clientId) {

    //this should not apply to closed opportunities
    if (formContext.getAttribute('statecode').getValue() != 0) return;

    formContext.getAttribute("ccrm_countryofclientregistrationid").setValue(null);
    //SDK.REST.retrieveRecord(clientId, 'Account', 'ccrm_countryofcoregistrationid', null, function (retrievedreq) {
    //    if (retrievedreq.ccrm_countryofcoregistrationid.Id != null) {

    //        formContext.getAttribute("ccrm_countryofclientregistrationid").setValue([
    //            {
    //                id: retrievedreq.ccrm_countryofcoregistrationid.Id,
    //                name: retrievedreq.ccrm_countryofcoregistrationid.Name,
    //                entityType: "ccrm_country"
    //            }
    //        ]);
    //    }
    //}, errorHandler, false);

    Xrm.WebApi.online.retrieveRecord("account", clientId, "?$select=_ccrm_countryofcoregistrationid_value").then(
        function success(result) {
            if (result["_ccrm_countryofcoregistrationid_value"] != null) {

                formContext.getAttribute("ccrm_countryofclientregistrationid").setValue([
                    {
                        id: result["_ccrm_countryofcoregistrationid_value"],
                        name: result["_ccrm_countryofcoregistrationid_value@OData.Community.Display.V1.FormattedValue"],
                        entityType: result["_ccrm_countryofcoregistrationid_value@Microsoft.Dynamics.CRM.lookuplogicalname"]
                    }
                ]);
            }
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
}



function checkHighRiskClient(clientid, extra, popup, quickcreate,statecode) {

    if (quickcreate && clientid == null) { return; }

    var messagename = extra == '' ? 'highriskclient' : 'highriskultimateclient';

    if (!quickcreate && (clientid == null || statecode != 0)) {

        Notify.remove(messagename);
        return;

    }

    //SDK.REST.retrieveRecord(clientid, 'Account', 'arup_HighRiskClient,ccrm_keyaccountmanagerid', null, function (retrievedreq) {

    //    var highrisk = retrievedreq.arup_HighRiskClient == null ? false : retrievedreq.arup_HighRiskClient;
    //    var relationshipManager = retrievedreq.ccrm_keyaccountmanagerid == null ? 'Relationship Manager for this client.' : retrievedreq.ccrm_keyaccountmanagerid.Name + ', the Client Relationship manager.'


    //    if (highrisk) {

    //        if (quickcreate == false) {
    //            Notify.addOpp("<span style='font-weight:bold; color: white'>Before pursuing any opportunities with this " + extra + "client, please contact " + relationshipManager + "</span>", "WARNING", messagename);
    //        }
    //        if (popup) {

    //            Alert.show('<font size="6" color="#FF0000"><b>High Risk Client</b></font>',
    //                '<font size="3" color="#000000"></br>Before pursuing any opportunities with this ' + extra + 'client, please contact ' + relationshipManager + '</font>',
    //                [{ label: "<b>OK</b>", setFocus: true },], "ERROR", 400, 250, '', true);
    //        }
    //    }
    //    else if (quickcreate == false) { Notify.remove(messagename); }

    //}, errorHandler, false);

    Xrm.WebApi.online.retrieveRecord("account", clientid, "?$select=arup_highriskclient,_ccrm_keyaccountmanagerid_value").then(
        function success(result) {
            var highrisk = result["arup_highriskclient"] == null ? false : result["arup_highriskclient"];
            var relationshipManager = result["_ccrm_keyaccountmanagerid_value"] == null ? 'Relationship Manager for this client.' : result["_ccrm_keyaccountmanagerid_value@OData.Community.Display.V1.FormattedValue"] + ', the Client Relationship manager.'
            if (highrisk) {

                if (quickcreate == false) {
                    Notify.addOpp("<span style='font-weight:bold; color: white'>Before pursuing any opportunities with this " + extra + "client, please contact " + relationshipManager + "</span>", "WARNING", messagename);
                }
                if (popup) {

                    Alert.show('<font size="6" color="#FF0000"><b>High Risk Client</b></font>',
                        '<font size="3" color="#000000"></br>Before pursuing any opportunities with this ' + extra + 'client, please contact ' + relationshipManager + '</font>',
                        [{ label: "<b>OK</b>", setFocus: true },], "ERROR", 400, 250, '', true);
                }
            }
            else if (quickcreate == false) { Notify.remove(messagename); }
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
}

//Set Hidden client field
function ccrm_client_onChange(executionContext, quickCreate) {
   var  formContext = executionContext.getFormContext();
     var clientVal = formContext.getAttribute('ccrm_client').getValue();

    formContext.getAttribute('customerid').setValue(clientVal);
    formContext.getAttribute('customerid').setSubmitMode("always");

    if (clientVal != null && clientVal.length > 0) {

        if (quickCreate == false) {
            //var tab = formContext.ui.tabs.get("Project_Details_Tab");
            //var visible = clientVal[0].name != 'Unassigned';
            //if (!!tab) {
            //    var section = tab.sections.get("client_details_section");
            //    if (!!section) {
            //        section.setVisible(visible);
            //    }
            //}
            SetCountryOfReg(formContext,clientVal[0].id);
        }
        customerid_onChange(formContext);

    }

    checkHighRiskClient(clientVal == null ? null : clientVal[0].id, '', true, quickCreate, formContext.getAttribute('statecode').getValue());
}

function ccrm_ultimateclient_onchange(executionContext, quickCreate) {
    var formContext = executionContext.getFormContext();
    var clientVal = formContext.getAttribute('ccrm_ultimateendclientid').getValue();

    checkHighRiskClient(clientVal == null ? null : clientVal[0].id, 'Ultimate/End ', true, quickCreate, formContext.getAttribute('statecode').getValue());

}

function ccrm_arupbusinessid_onChange_ec(executionContext, valueChanged) {
    var formContext = executionContext.getFormContext();
    ccrm_arupbusinessid_onChange(formContext, valueChanged);
}

function ccrm_arupbusinessid_onChange(formContext,valueChanged) {

    //if (valueChanged)
    //    formContext = formContext.getFormContext();

    var businessid = formContext.getAttribute('ccrm_arupbusinessid').getValue();

    resetSubBusiness(formContext,valueChanged, businessid);

    if (businessid != null && businessid.length > 0) {
        var business = businessid[0].name;
        addEnergy_ProjectSector(formContext,business);
    }

    if (formContext.ui.getFormType() == 1) return;

    var currentStage = getStageId(formContext);

    if (currentStage == ArupStages.Lead) return;

    var chargingBasis = formContext.getAttribute('ccrm_chargingbasis').getValue();

    if (business == null) {
        highlightField('#header_process_ccrm_chargingbasis', '#ccrm_chargingbasis', true);
        formContext.getAttribute("ccrm_chargingbasis").setRequiredLevel('none');
    }
    else if (business != null &&
        business == 'Charity & Community' &&
        formContext.getAttribute("ccrm_chargingbasis").getRequiredLevel() == 'required') {
        highlightField('#header_process_ccrm_chargingbasis', '#ccrm_chargingbasis', true);
        formContext.getAttribute("ccrm_chargingbasis").setRequiredLevel('none');
    }
    else if (business != null &&
        business != 'Charity & Community' &&
        currentStage == ArupStages.BidReviewApproval) {
        //currentStage != ArupStages.CrossRegion) {
        highlightField('#header_process_ccrm_chargingbasis', '#ccrm_chargingbasis', (chargingBasis != null) ? true : false);
        formContext.getAttribute("ccrm_chargingbasis").setRequiredLevel('required');
    }
}

function addEnergy_ProjectSector(formContext,currentBusinessValue) {
 
        var projectSectorCode = formContext.getAttribute('arup_projectsector').getValue();
        var projectSectorValue = formContext.getAttribute('arup_projectsector').getText();

    //check if project sector already has Energy option in it or value of Arup Business hasn't changed
    if (ArupBusinessSaved == currentBusinessValue) {
        return;
    }

    //check to see if Arup Business used to be Energy and Project Sector has the Energy Project Sector option selected, then it needs to be removed
    if (ArupBusinessSaved == 'Energy' && projectSectorCode != null && projectSectorCode.indexOf(13) != -1) {

        //first remove the value
        //projectSectorCode = projectSectorCode.split(',');
        //projectSectorValue = projectSectorValue.split(', ');
        //var entryNum = projectSectorCode.indexOf('13');
        //var value = removeFromList(formContext.getAttribute('arup_projectsector').getValue(), '13', ',');
        //formContext.getAttribute('arup_projectsector').setValue(value);
        //value = removeFromList(formContext.getAttribute('arup_projectsector').getValue(), 'Energy Project Sector', ', ')
        //formContext.getAttribute("arup_projectsector").setValue(value);

        var updatedValues =  RemoveFromArray(projectSectorCode,[13]);
        formContext.getAttribute("arup_projectsector").setValue(updatedValues);
    }

    //check to see if Arup Business has been changed to Energy and Project Sector doesn't have the Energy Project Sector option selected already
    else if (currentBusinessValue == 'Energy' && (projectSectorCode == null || projectSectorCode.indexOf(13) == -1)) {

        //check to see if multi-select is empty. In this case just push the values into *name & *code fields
        if (projectSectorCode == null) {
            formContext.getAttribute('arup_projectsector').setValue([13]);
         //   formContext.getAttribute('arup_projectsector').setValue('Energy Project Sector');
        }
        else {
            //need to add to the existing values
            var updatedValues = ConcatArrays(projectSectorCode, [13]);
            formContext.getAttribute('arup_projectsector').setValue(updatedValues);
          //  formContext.getAttribute('arup_projectsector').setValue(formContext.getAttribute('arup_projectsector').getValue() + ', Energy Project Sector');
        }

    }
    //Shruti: Project sector is not on BPF. hence commented below code
    //if (formContext.ui.getFormType() != 1) {
    //    formContext.getControl('header_process_arup_projectsector').getAttribute().setValue(formContext.getAttribute('arup_projectsector').getValue());
    //}
   // formContext.getAttribute('arup_projectsector').setSubmitMode("always");
    formContext.getAttribute('arup_projectsector').setSubmitMode("always");
    if (formContext.getAttribute("ccrm_arupbusinessid").getValue != null)
        ArupBusinessSaved = formContext.getAttribute("ccrm_arupbusinessid").getValue()[0].name;
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

function ConcatArrays(existingValues, newValues) {
    if (existingValues === null || Array.isArray(existingValues) === false) {
        return newValues;
    }

    if (newValues === null || Array.isArray(newValues) === false) {
        return existingValues;
    }
    return existingValues.concat(newValues);
}
function removeFromList(list, value, separator) {

    separator = separator || ",";
    var values = list.split(separator);
    for (var i = 0; i < values.length; i++) {
        if (values[i] == value) {
            values.splice(i, 1);
            return values.join(separator);
        }
    }
    return list;
}
function ccrm_opportunitytype_onchange_ec(executionContext) {
    var formContext = executionContext.getFormContext();
    ccrm_opportunitytype_onchange(formContext)
}
// Set Valid Opp Track Code --  Starts
function ccrm_opportunitytype_onchange(formContext) {
    //refresh ribbon when track is small oppo
    formContext.ui.refreshRibbon();
    oppoType(formContext);

    //add extra validation for Lead Progression 
    if (formContext.getAttribute("ccrm_opportunitytype").getValue() == '200000' && formContext.getAttribute("ccrm_validopportunitytrack").getValue() != 0) {
        //set the isValid flag to false        
        SetValidField(formContext,'ccrm_validopportunitytrack', false, 'Opportunity Track needs to be set for Opportunity Progression', 'opportunitytrack');
        //[RS-08/05/2017] - changed the message above to say Opportunity instead of Lead
    } else if (formContext.getAttribute("ccrm_validopportunitytrack").getValue() != 1) {
        //set the isValid flag to true 
        SetValidField(formContext,'ccrm_validopportunitytrack', true, null, 'opportunitytrack');
    }

    if (formContext.getAttribute("ccrm_possiblejobnumberrequired").getValue() == 1) {
        var strStage = formContext.data.process.getActiveStage();
        //alert(strStage.getName());
        if (strStage.getName() == "PJN APPROVAL") {
            onStageChange(formContext);
            hideProcessFields(formContext,formContext.data.process.getSelectedStage().getName());
            setTimeout(function () {
                Xrm.Utility.openEntityForm(formContext.data.entity.getEntityName(), formContext.data.entity.getId());
            }, 200);
            formContext.ui.setFormNotification("Risk Level changed on bid. System is reseting the PJN Approval.", "WARNING", "PJNRiskChsnge");
        }
    }
}

function refreshPage() {
    setTimeout(function () { Xrm.Utility.openEntityForm(formContext.data.entity.getEntityName(), formContext.data.entity.getId()); }, 10);
}

function oppoType(formContext) {
    //200001 = Small Opportunity - small oppo
    if (formContext.getAttribute("ccrm_pjn_opportunitytype").getValue() == OpportunityType.Simple) {
        //collaspe bid tab
        var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
        var bidDevTab = arupInternal ? "Bid_Development_Tab_Internal" : "Bid_Development_Tab_External";
        formContext.ui.tabs.get(bidDevTab).setDisplayState("collapsed");
        formContext.getControl("ccrm_closeprobability_synced").setDisabled(true);
    }
}

// Set Valid Acc Center Code --  Starts 
function ccrm_accountingcentreid_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    validateAccCenter(formContext,true);
}

function validateAccCenter(formContext,checkOHRate) {

    var acctCenterId = formContext.getAttribute('ccrm_accountingcentreid').getValue();

    if (formContext.ui.getFormType() != 1) { // if NOT new record 
        //CRM 2016  Bug #34826
        if (acctCenterId != null && acctCenterId.length > 0 && checkOHRate) {

            if (formContext.getAttribute('ccrm_subaccountingcentreid')) {
                formContext.getAttribute("ccrm_subaccountingcentreid").setValue(null); //default accounting centre details (arup group, practice,sub-practice)        
                formContext.getControl("ccrm_subaccountingcentreid").setDisabled(true); //disable subaccounting        
                formContext.getControl('ccrm_subaccountingcentreid').addPreSearch(function () {
                    SubAccCentreAddLookupFilter(formcontext,acctCenterId[0].id);
                });
            }
            formContext.getAttribute("ccrm_accountingcentreid").setRequiredLevel("required"); //mandatory
        }

    }

    //call getAccountingCentreDetails function
    if (acctCenterId != null && acctCenterId.length > 0) {

        getAccountingCentreDetails(formContext,acctCenterId[0].id, checkOHRate);
        //make the subaccounting avilable
        if (formContext.ui.getFormType() != 1) {
            //CRM2016 Bug 34826
            if (formContext.getAttribute("ccrm_subaccountingcentreid")) {
                formContext.getControl("ccrm_subaccountingcentreid").setDisabled(false);
            }
        }
    }

    acctCentreInvalid = null;
    checkAccountingCentreStatus(formContext,true);
    var validFieldName = 'ccrm_validaccountingcentre';
    var warnMsg = "An accounting centre you have selected is closed. Please, select a valid accounting centre.";
    var warnMsgName = 'accountingcentre';

    if (acctCentreInvalid != null) {

        if (acctCentreInvalid == true) {
            SetValidField(formContext,validFieldName, false, warnMsg, warnMsgName);
            if (formContext.ui.getFormType() == 1) {
                //    //SetLookupField(formContext,null, null, 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid');
                formContext.getAttribute("ccrm_accountingcentreid").setValue(null);
                //SetLookupField(formContext,0, "", 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid');
                //    //formContext.getAttribute("ccrm_accountingcentreid").setSubmitMode("always");               
            }
        } else {
            SetValidField(formContext,validFieldName, true, null, warnMsgName);
        }
    } else {
        SetValidField(formContext,validFieldName, true, null, warnMsgName);
    }
    setTimeout(function () { formContext.ui.clearFormNotification("accountingcentre"); }, 10000);
}

function getAccountingCentreDetails(formContext,accountCentreID, checkOHrate) {
    //check if the Acount Centre field is populated
    if (accountCentreID == null) return;

  //  var select = "Ccrm_ArupGroup, Ccrm_ArupGroupCode,ccrm_arupgroupid,Ccrm_Practice,Ccrm_PracticeCode, Ccrm_SubPractice,Ccrm_SubPracticeCode,Ccrm_estprojectstaffoverheadsrate";
    //SDK.REST.retrieveRecord(accountCentreID, "Ccrm_arupaccountingcode", select, null,
    //    function (retrievedreq) {
    //        //take the Arup group from xml file and copy it to the Arup group field on opportunity
    //        // SetFieldValue(formContext,'ccrm_arupgroupid', retrievedreq.Ccrm_ArupGroup);
    //        //Commenting the above line as the lookup is being set with a text and it is giving error.

    //        //take the Arup group code from xml file and copy it to the Arup group code field on opportunity
    //        SetFieldValue(formContext,'ccrm_arupgroupcode', retrievedreq.Ccrm_ArupGroupCode);

    //        //take the Arupgroupid from xml file and copy it to the Arupgroupid lookup field on opportunity
    //        var arupgroupcode = (retrievedreq.ccrm_arupgroupid != null) ? retrievedreq.ccrm_arupgroupid : null;
    //        if (arupgroupcode != null) {
    //            SetLookupField(formContext,arupgroupcode.Id, arupgroupcode.Name, 'ccrm_arupgroup', 'ccrm_arupgroupid'); //set lookup values;                
    //            formContext.getAttribute('ccrm_arupgroupid').setSubmitMode('always');
    //            //set the regionid if id is not null 
    //            formContext.getAttribute('ccrm_arupregionid').setValue(fetchArupRegion(formContext.context.getClientUrl(),arupgroupcode.Id));
    //            formContext.getAttribute('ccrm_arupregionid').setSubmitMode('always');
    //            formContext.getAttribute("ccrm_arupregionid").fireOnChange();
    //        } else
    //            formContext.getAttribute('ccrm_arupgroupid').setValue(null);

    //        //take the practice from xml file and copy it to the practice field on opportunity
    //        SetFieldValue(formContext,'ccrm_practice', retrievedreq.Ccrm_Practice);
    //        formContext.getAttribute("ccrm_practice").setSubmitMode("always"); //force submit

    //        //take the practice code from xml file and copy it to the practice code field on opportunity
    //        SetFieldValue(formContext,'ccrm_practicecode', retrievedreq.Ccrm_PracticeCode);

    //        //take the sub-practice from xml file and copy it to the sub-practice field on opportunity
    //        SetFieldValue(formContext,'ccrm_subpractice', retrievedreq.Ccrm_SubPractice);

    //        //take the sub-practice code from xml file and copy it to the subpractice code field on opportunity
    //        SetFieldValue(formContext,'ccrm_subpracticecode', retrievedreq.Ccrm_SubPracticeCode);
    //        //get the acct centre's staff overheads rate
    //        if (formContext.ui.getFormType() != 1 && checkOHrate) {
    //            var projStaffOverheadsRate = (retrievedreq.Ccrm_estprojectstaffoverheadsrate != null) ? retrievedreq.Ccrm_estprojectstaffoverheadsrate : null;
    //            if (projStaffOverheadsRate != null) {
    //                formContext.getAttribute("ccrm_estprojectstaffoverheadsrate").setValue(parseFloat(projStaffOverheadsRate));
    //                calcEstProjStaffOverheadsValue(formContext);
    //                calcTotalCosts(formContext);
    //                formContext.getAttribute("ccrm_staffoverheadspercent").setValue(parseFloat(projStaffOverheadsRate));
    //                formContext.getAttribute("ccrm_staffoverheadspercent").setSubmitMode("always");
    //                staffoverheadspercent(formContext);
    //            } else {
    //                formContext.getAttribute("ccrm_estprojectstaffoverheadsrate").setValue(0);
    //                calcEstProjStaffOverheadsValue(formContext);
    //                formContext.getAttribute("ccrm_staffoverheadspercent").setValue(0);
    //                staffoverheadspercent(formContext);
    //            }
    //        }
    //    }, errorHandler, false);

    Xrm.WebApi.online.retrieveRecord("ccrm_arupaccountingcode", accountCentreID, "?$select=ccrm_arupgroup,ccrm_arupgroupcode,_ccrm_arupgroupid_value,ccrm_estprojectstaffoverheadsrate,ccrm_practice,ccrm_practicecode,ccrm_subpractice,ccrm_subpracticecode").then(
        function success(result) {
            //take the Arup group from xml file and copy it to the Arup group field on opportunity
            // SetFieldValue(formContext,'ccrm_arupgroupid', retrievedreq.Ccrm_ArupGroup);
            //Commenting the above line as the lookup is being set with a text and it is giving error.

            //take the Arup group code from xml file and copy it to the Arup group code field on opportunity
            SetFieldValue(formContext, 'ccrm_arupgroupcode', result["ccrm_arupgroupcode"]);

            //take the Arupgroupid from xml file and copy it to the Arupgroupid lookup field on opportunity
            var arupgroupcode = (result["_ccrm_arupgroupid_value"] != null) ? result["_ccrm_arupgroupid_value"] : null;
            if (arupgroupcode != null) {
                SetLookupField(formContext, result["_ccrm_arupgroupid_value"], result["_ccrm_arupgroupid_value@OData.Community.Display.V1.FormattedValue"], 'ccrm_arupgroup', 'ccrm_arupgroupid'); //set lookup values;                
                formContext.getAttribute('ccrm_arupgroupid').setSubmitMode('always');
                //set the regionid if id is not null 
                formContext.getAttribute('ccrm_arupregionid').setValue(fetchArupRegion(formContext.context.getClientUrl(), result["_ccrm_arupgroupid_value"]));
                formContext.getAttribute('ccrm_arupregionid').setSubmitMode('always');
                formContext.getAttribute("ccrm_arupregionid").fireOnChange();
            } else
                formContext.getAttribute('ccrm_arupgroupid').setValue(null);

            //take the practice from xml file and copy it to the practice field on opportunity
            SetFieldValue(formContext, 'ccrm_practice', result["ccrm_practice"]);
            formContext.getAttribute("ccrm_practice").setSubmitMode("always"); //force submit

            //take the practice code from xml file and copy it to the practice code field on opportunity
            SetFieldValue(formContext, 'ccrm_practicecode', result["ccrm_practicecode"]);

            //take the sub-practice from xml file and copy it to the sub-practice field on opportunity
            SetFieldValue(formContext, 'ccrm_subpractice', result["ccrm_subpractice"]);

            //take the sub-practice code from xml file and copy it to the subpractice code field on opportunity
            SetFieldValue(formContext, 'ccrm_subpracticecode', result["ccrm_subpracticecode"]);
            //get the acct centre's staff overheads rate
            if (formContext.ui.getFormType() != 1 && checkOHrate) {
                var projStaffOverheadsRate = (result["ccrm_estprojectstaffoverheadsrate"] != null) ? result["ccrm_estprojectstaffoverheadsrate"] : null;
                if (projStaffOverheadsRate != null) {
                    formContext.getAttribute("ccrm_estprojectstaffoverheadsrate").setValue(parseFloat(projStaffOverheadsRate));
                    calcEstProjStaffOverheadsValue(formContext);
                    calcTotalCosts(formContext);
                    formContext.getAttribute("ccrm_staffoverheadspercent").setValue(parseFloat(projStaffOverheadsRate));
                    formContext.getAttribute("ccrm_staffoverheadspercent").setSubmitMode("always");
                    staffoverheadspercent(formContext);
                } else {
                    formContext.getAttribute("ccrm_estprojectstaffoverheadsrate").setValue(0);
                    calcEstProjStaffOverheadsValue(formContext);
                    formContext.getAttribute("ccrm_staffoverheadspercent").setValue(0);
                    staffoverheadspercent(formContext);
                }
            }
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
}

function staffoverheadspercent(formContext) {
    calcStaffOverheads(formContext);
    calcTotalBidCost(formContext);
}

calcTotalBidCost = function () {
    var salary = formContext.getAttribute("ccrm_salarycost_num").getValue();
    var staffoverheads = formContext.getAttribute("ccrm_staffoverheads_num").getValue();
    var expenses = formContext.getAttribute("ccrm_grossexpenses_num").getValue();
    var result = (salary + staffoverheads + expenses);
    formContext.getAttribute("ccrm_totalbidcost_num").setValue(result);
}

function calcStaffOverheads(formContext) {
    var salary = formContext.getAttribute("ccrm_salarycost_num").getValue();
    var staffoverheadspercent = formContext.getAttribute("ccrm_staffoverheadspercent").getValue();
    var calcSOH = 0;

    if (salary > 0 && staffoverheadspercent > 0)
        calcSOH = (staffoverheadspercent / 100) * salary;

    formContext.getAttribute("ccrm_staffoverheads_num").setValue(calcSOH);
    formContext.getAttribute("ccrm_staffoverheads_num").setSubmitMode("always");
}

function checkAccountingCentreStatus(formContext, newoppcreationflag) {

    acctCentreInvalid = null;

    var acctcentreid = formContext.getAttribute("ccrm_accountingcentreid").getValue();

    if (acctcentreid != null && acctcentreid.length > 0) {
        var accountingCentreID = acctcentreid[0].id.replace(/[{}]/g, "");
        var sys_phasename = "Pre-Bid";//[RS-08/05/2017] - Change sys_phasename from Lead to Pre-Bid
        if (!newoppcreationflag) // new opp getting created from quick create form
        {
            if (formContext.getAttribute("ccrm_sys_phasename").getValue() != null)
                sys_phasename = formContext.getAttribute("ccrm_sys_phasename").getValue();
            else if (formContext.getAttribute("stepname")) {
                if (formContext.getAttribute("stepname").getValue() != null)
                    sys_phasename = formContext.getAttribute("stepname").getValue();
            }
        }

        var req = new XMLHttpRequest();
        req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/ccrm_arupaccountingcodes(" + accountingCentreID +")?$select=ccrm_suppressed,statuscode", false);
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
                    var suppressedFlag = result["ccrm_suppressed"];
                    var statuscodeFlag = result["statuscode"];
                    
                    if (sys_phasename.indexOf("Pre-Bid") > -1) {//[RS-08/05/2017] - Changed Lead to Pre-Bid
                            //check for inactive status and suppressed flag checked
                            if (statuscodeFlag == "2") {
                                acctCentreInvalid = true;
                                return;
                                //return [true, "WARNING:\rYour opportunity has not been progressed as it is listed against an inactive accounting centre.\r\rPlease update the accounting centre on the Administration tab before continuing."];
                            } else if (suppressedFlag != null && suppressedFlag) {
                                acctCentreInvalid = true;
                                return;
                                //return [true, "WARNING:\rYour opportunity has not been progressed as it is listed against a shadow accounting centre.\r\rPlease update the accounting centre on the Administration tab before continuing."];
                            } else {
                                acctCentreInvalid = false;
                                return;
                                //return [false, ""];
                            }
                        } else if (sys_phasename.indexOf("Bid in Development") > -1 ||
                            sys_phasename.indexOf("Bid Submitted") > -1) {
                            //check for inactive status flag checked
                            if (statuscodeFlag == "2") {
                                acctCentreInvalid = true;
                                return;
                                //return [true, "WARNING:\rYour opportunity has not been progressed as it is listed against an inactive accounting centre.\r\rPlease update the accounting centre on the Administration tab before continuing."];
                            } else {
                                acctCentreInvalid = false;
                                return;
                                //return [false, ""];
                            }
                        } else {
                            acctCentreInvalid = false;
                            return;
                            //return [false, ""];
                        }
                    
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();
     
          

            //var select = "statuscode, Ccrm_Suppressed";
            //SDK.REST.retrieveRecord(accountingCentreID,
            //    "Ccrm_arupaccountingcode",
            //    select,
            //    null,
            //    function (retrievedreq) {

            //        if (retrievedreq != null) {

            //            var statuscodeFlag = (retrievedreq.statuscode != null) ? retrievedreq.statuscode.Value : null;
            //            var suppressedFlag = (retrievedreq.Ccrm_Suppressed != null) ? retrievedreq.Ccrm_Suppressed : null;

            //            if (sys_phasename.indexOf("Pre-Bid") > -1) {//[RS-08/05/2017] - Changed Lead to Pre-Bid
            //                //check for inactive status and suppressed flag checked
            //                if (statuscodeFlag == "2") {
            //                    acctCentreInvalid = true;
            //                    return;
            //                    //return [true, "WARNING:\rYour opportunity has not been progressed as it is listed against an inactive accounting centre.\r\rPlease update the accounting centre on the Administration tab before continuing."];
            //                } else if (suppressedFlag != null && suppressedFlag == "true") {
            //                    acctCentreInvalid = true;
            //                    return;
            //                    //return [true, "WARNING:\rYour opportunity has not been progressed as it is listed against a shadow accounting centre.\r\rPlease update the accounting centre on the Administration tab before continuing."];
            //                } else {
            //                    acctCentreInvalid = false;
            //                    return;
            //                    //return [false, ""];
            //                }
            //            } else if (sys_phasename.indexOf("Bid in Development") > -1 ||
            //                sys_phasename.indexOf("Bid Submitted") > -1) {
            //                //check for inactive status flag checked
            //                if (statuscodeFlag == "2") {
            //                    acctCentreInvalid = true;
            //                    return;
            //                    //return [true, "WARNING:\rYour opportunity has not been progressed as it is listed against an inactive accounting centre.\r\rPlease update the accounting centre on the Administration tab before continuing."];
            //                } else {
            //                    acctCentreInvalid = false;
            //                    return;
            //                    //return [false, ""];
            //                }
            //            } else {
            //                acctCentreInvalid = false;
            //                return;
            //                //return [false, ""];
            //            }
            //        }
            //    },
            //    errorHandler,
            //    false);


    }
}

function SetFieldValue(formContext,fieldName, val) {
    if (val)
        formContext.getAttribute(fieldName).setValue(val);
    else
        formContext.getAttribute(fieldName).setValue(null);
}

function fetchArupRegion(ClientUrl,arupGroupId) {

    if (arupGroupId == null) { return; }
    arupGroupId = arupGroupId.replace(/[{}]/g, "");
    var lookup = null;

    var req = new XMLHttpRequest();
    req.open("GET", ClientUrl + "/api/data/v8.2/ccrm_arupgroups?$select=_ccrm_arupregionid_value&$filter=ccrm_arupgroupid eq " + arupGroupId, false);
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
                lookup = new Array();
                lookup[0] = new Object();
                var _ccrm_arupregionid_value = results.value[0]["_ccrm_arupregionid_value"];
                var _ccrm_arupregionid_value_formatted = results.value[0]["_ccrm_arupregionid_value@OData.Community.Display.V1.FormattedValue"];
                lookup[0].id = _ccrm_arupregionid_value;
                lookup[0].name = _ccrm_arupregionid_value_formatted;
                lookup[0].entityType = 'ccrm_arupregion';
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
    return lookup;
}

//set notification lookup - called by the setRegionLookup function and onchange of arup company
function setNotificationLookup(arupRegionID) {
    //var filter = "$select=Ccrm_notificationlistId,Ccrm_name&$top=1&$filter=ccrm_arupregionid/Id eq (guid'" + arupRegionID + "')";
    //SDK.REST.retrieveMultipleRecords("Ccrm_notificationlist", filter,
    //    function (results) {
    //        if (results.length > 0) {
    //            var Id = results[0].Ccrm_notificationlistId;
    //            if (Id.indexOf('{') == -1)
    //                Id = '{' + Id;
    //            if (Id.indexOf('}') == -1)
    //                Id = Id + '}';
    //            Id = Id.toUpperCase();

    //            var lookup = new Array();
    //            lookup[0] = new Object();
    //            lookup[0].id = Id;
    //            lookup[0].name = results[0].Ccrm_name;
    //            lookup[0].entityType = "ccrm_notificationlist";
    //            return lookup;
    //        } else {
    //            return null;
    //        };
    //    },
    //    errorHandler,
    //    function () { },
    //    false);

    Xrm.WebApi.online.retrieveMultipleRecords("ccrm_notificationlist", "?$select=ccrm_name,ccrm_notificationlistid&$filter=_ccrm_arupregionid_value eq "+ arupRegionID +"&$top=1").then(
        function success(results) {
            if (results.length > 0) {
                var Id = results.entities[0]["ccrm_notificationlistid"];
                if (Id.indexOf('{') == -1)
                    Id = '{' + Id;
                if (Id.indexOf('}') == -1)
                    Id = Id + '}';
                Id = Id.toUpperCase();

                var lookup = new Array();
                lookup[0] = new Object();
                lookup[0].id = Id;
                lookup[0].name = results.entities[0]["ccrm_name"];
                lookup[0].entityType = "ccrm_notificationlist";
                return lookup;
            } else {
                return null;
            };
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
}
// Set Valid Acc Center Code --  ends 

// Common Methods - Starts 
function SetValidField(formContext,fieldName, val, warningMsg, warMsgName) {
    formContext.getAttribute(fieldName).setValue(val);
    formContext.getAttribute(fieldName).setSubmitMode('always');
    if (warningMsg != null)
        formContext.ui.setFormNotification(warningMsg, 'WARNING', warMsgName);
    else
        formContext.ui.clearFormNotification(warMsgName);
}
// Common Methods - Ends 

function StageSelected(formContext) {

    //var formContext = executionContext.getFormContext();
   // var eventAgrs = executionContext.getEventArgs();
   // var selectedStage = eventAgrs.getStage();

    var selectedStage =   formContext.data.process.getSelectedStage();

    // optionset flag
    formContext.getAttribute('ccrm_stagetoggle').setSubmitMode('never');
    formContext.getAttribute('ccrm_processflag').setSubmitMode('never');
    if (formContext.getAttribute('ccrm_stagetoggle').getValue() == 1) {
        formContext.getAttribute('ccrm_stagetoggle').setValue(0);
    } else {
        formContext.getAttribute('ccrm_stagetoggle').setValue(1);
    }
    formContext.getAttribute('ccrm_stagetoggle').fireOnChange();
    // text field flag
    formContext.getAttribute('ccrm_processflag').setValue(selectedStage.getName());
    formContext.getAttribute('ccrm_stagetoggle').setSubmitMode('always');
    formContext.getAttribute('ccrm_processflag').setSubmitMode('always');

    setLookupFiltering(formContext);
    hideProcessFields(formContext,selectedStage.getName());
    makeBidReviewApprovalFieldsReadonly(formContext);

    onSelectOfStage(formContext,selectedStage.getId());
}

function makeBidReviewApprovalFieldsReadonly(formContext) {

    var disableBidReviewChair = formContext.getControl("header_process_ccrm_bidreviewoutcome") != null;

    formContext.getControl("header_process_ccrm_bidreviewoutcome").setDisabled(disableBidReviewChair);

    if (formContext.getControl("header_process_ccrm_bidreviewdecisiondate") != null)
        formContext.getControl("header_process_ccrm_bidreviewdecisiondate").setDisabled(true);

    if (formContext.getControl("header_process_ccrm_opportunitytype_2") != null)
        formContext.getControl("header_process_ccrm_opportunitytype_2").setDisabled(true);

    if (formContext.getControl("header_process_arup_bidsubmitteddate") != null)
        formContext.getControl("header_process_arup_bidsubmitteddate").setDisabled(true);

    if (formContext.getControl("header_process_arup_bidsubmissionoutcome") != null)
        formContext.getControl("header_process_arup_bidsubmissionoutcome").setDisabled(true);

}

function ccrm_bidreviewoutcome_onChange_ec(executionContext) {
    ccrm_bidreviewoutcome_onChange(executionContext.getFormContext())
}

function ccrm_bidreviewoutcome_onChange(formContext) {

    var statecode = formContext.getAttribute('statecode').getValue();
    var disableBidReviewChair = (formContext.getAttribute("ccrm_bidreviewoutcome").getValue() == 100000002 || currUserData.caltype != 0 || statecode != 0) ? true : false;

    formContext.getControl("ccrm_bidreviewchair_userid").setDisabled(disableBidReviewChair);

    //formContext.getControl("ccrm_bidreviewoutcome").removeOption(100000001);
    //formContext.getControl("ccrm_bidreviewoutcome").removeOption(100000003);
    //formContext.getControl("header_process_ccrm_bidreviewoutcome").removeOption(100000001);
    //formContext.getControl("header_process_ccrm_bidreviewoutcome").removeOption(100000003);

    setTimeout(function () {
        if (!isCrmForMobile) {

            if (formContext.getControl("header_process_ccrm_bidreviewchair_userid_1") != null) {
                formContext.getControl("header_process_ccrm_bidreviewchair_userid_1").setDisabled(disableBidReviewChair);
            }

            if (formContext.getControl("header_process_ccrm_bidreviewchair_userid") != null) {
                formContext.getControl("header_process_ccrm_bidreviewchair_userid").setDisabled(disableBidReviewChair);
            }

            else if (getStageId(formContext) == ArupStages.BidReviewApproval && formContext.getAttribute("ccrm_bidreviewoutcome").getValue() == 100000000) {
                formContext.getControl("header_process_ccrm_bidreviewoutcome").setDisabled(false);
            }
        }
    }, 1000);
}

// Ribbon possible job no Btn click events 
function highlightField(headerfield, formfield, clear) {
    var bgcolor = 'rgba(255, 179, 179, 1)';
    if (clear == true)
        bgcolor = 'transparent';
    //CRM 2016 Bug 34818
    if (headerfield)
        window.parent.$(headerfield).css('background-color', bgcolor);

    if (formfield)
        window.parent.$(formfield).css('background-color', bgcolor);
}
//This function is called from Ribbon button 'Request Possible JOb' and crmparameter 'prmarycontrol' from the ribbon is the formContext
function requestPossibleJob(formContext) {
    debugger;
    // set focus to avoid issues with in progress changes.
  //  formContext.getControl("ccrm_reference").setFocus();

    //Shruti : to test set focus to required field-pre bid tab by setting focus to one of its field
    if (formContext.getControl("ccrm_client") != null || formContext.getControl("ccrm_client") != 'undefined')
        formContext.getControl("ccrm_client").setFocus();

    customerid_onChange(formContext);
    var stageid = getStageId(formContext);
    var crossregionbid = IsCrossRegionBid(formContext);

    // Validate the opportunity track
    ccrm_opportunitytype_onchange(formContext);

    var arupCompany = formContext.getAttribute('ccrm_arupcompanyid').getValue();

    //validate if PJN request and Arup Company = 56, then do not allow requesting PJN
    if (arupCompany != null) {

        var companyError = denyArupCompanyPJN(formContext,arupCompany[0].id);
        if (companyError) {
            formContext.getAttribute("ccrm_arupcompanyid").setValue(null);
            formContext.getAttribute("ccrm_accountingcentreid").setValue(null);
            formContext.getAttribute('ccrm_accountingcentreid').setValue(null);

            Alert.show('<font size="6" color="#F69922"><b>Invalid Company for PJN</b></font>',
                '<font size="3" color="#000000"></br>' + 'You have selected an Arup Company (Arup Latin America – 056) that is not eligible for a PJN request due to statutory limitations. It will only be available at a Confirmed Job stage. Please replace the company and accounting centre and proceed.' + '</font>',
                [
                    {
                        label: "<b>OK</b>",
                        setFocus: true
                    },
                ], "WARNING", 600, 250, '', true);
        }
    }

  //  if (IsPJNRequest) {
        formContext.getAttribute("ccrm_salarycost_num").setRequiredLevel('required');
        formContext.getAttribute("ccrm_grossexpenses_num").setRequiredLevel('required');
        formContext.getAttribute("ccrm_chargingbasis").setRequiredLevel('required');
        formContext.getAttribute("ccrm_bid_transactioncurrencyid").setRequiredLevel('required');
        formContext.getAttribute("ccrm_totalbidcost_num").setRequiredLevel('required');// moved back to PJN block based on regression test defect
   // }

    formContext.data.save().then(
        function success(status) {
    if (IsFormValid(formContext, 'PJN')) {

        var regionName = formContext.getAttribute('ccrm_arupregionid').getValue()[0].name;
        if (crossregionbid && stageid == ArupStages.Lead && !CrossRegionFieldsFilled(formContext)) {
            moveToNextTrigger_PJN = true;
            moveToNextTrigger = true;
            formContext.data.save();
            return;
        } // Not cross region bid        
        else {
            //set the possible job number required flag to YES    
            if (crossregionbid) {

                if (!CrossRegionFieldsFilled(formContext)) {
                    //HighlightCrossRegionFields();
                    formContext.ui.setFormNotification("This is a Cross Region bid and the Country Manager needs to be consulted.  Please complete the details on the Cross Region stage. ", "WARNING", "msgCrossCountry");
                    setTimeout(function () { formContext.ui.clearFormNotification("msgCrossCountry"); }, 10000);
                    return false;
                }
            }

            // if (formContext.data.entity.getIsDirty()) { formContext.data.save(); }            

            if (regionName != null) {
                if (regionName == 'East Asia Region' || regionName == 'Australasia Region' || regionName == 'Malaysia Region') {
                    formContext.ui.setFormNotification("Your request for a Possible Job Number has been logged. Decision to Proceed approvals are being generated. See the PJN Approvals stage for status of the Approvals", "INFO", "PJNProgress");
                    setTimeout(function () { formContext.ui.clearFormNotification("PJNProgress"); }, 10000);
                    //lockDownBidCosts(formContext,true);
                    setJobNoProgression(formContext, 100009002);
                    moveToDevBid(formContext, stageid);
                    setCurrentApproversAsync(formContext);
                } else {

                    Alert.show('<font size="6" color="#2E74B5"><b>For your information</b></font>',
                        '<font size="3" color="#000000"></br>By clicking OK you will assign a possible job number. No approval requests will be sent.</br></br>You must ensure that you have completed all the requirements of your regional bid policy and attached supporting evidence - such as a Decision to Proceed record signed by a Director.</br></br>If you are not sure if you have complied with your regional requirements please consult a Director before progressing.</font>',
                        [
                            new Alert.Button("<b>OK</b>",
                                function () {
                                    formContext.ui.setFormNotification("A Possible Job Number is being generated. It may take a couple of minutes to appear on the opportunity screen and couple of hours to appear on the financial systems", "INFO", "PJNProgress");
                                    setTimeout(function () { formContext.ui.clearFormNotification("PJNProgress"); }, 10000);
                                    lockDownBidCosts(formContext, true);
                                    setJobNoProgression(formContext, 100009003);
                                   
                                    moveToDevBid(formContext, stageid);
                                   
                                }, false, false),
                            new Alert.Button("Do Not Request",
                                function () {
                                    Alert.show('<font size="6" color="#2E74B5"><b>For your information</b></font>',
                                        '<font size="3" color="#000000"></br>Request for PJN was not sent.</font>',
                                        [
                                            new Alert.Button("OK")
                                        ],
                                        "INFO", 500, 200, '', true);
                                }, true, false)
                        ], "INFO", 700, 400, '', true);
                }
            }

        }
    }

        },
        function (status) {
            Log("failure status " + status);
        });
}

function denyArupCompanyPJN(formContext,companyID) {
    if (companyID == null) { return false };
    var companyCode;
    companyID = companyID.replace('{', '').replace('}', '');

    //SDK.REST.retrieveRecord(companyID, "Ccrm_arupcompany", 'Ccrm_AccCentreLookupCode', null,
    //    function (retrievedreq) {
    //        if (retrievedreq != null) {
    //            companyCode = retrievedreq.Ccrm_AccCentreLookupCode;
    //        }
    //    }, errorHandler, false);

    //Xrm.WebApi.online.retrieveRecord("ccrm_arupcompany", companyID, "?$select=ccrm_acccentrelookupcode").then(
    //    function success(result) {
    //        if (result != null ) {
    //            companyCode = result["ccrm_acccentrelookupcode"];
    //        }
    //    },
    //    function (error) {
    //        Xrm.Utility.alertDialog(error.message);
    //    }
    //);


    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/ccrm_arupcompanies(" + companyID +")?$select=ccrm_acccentrelookupcode", false);
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
                companyCode = result["ccrm_acccentrelookupcode"];
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();

    var validCompany = companyCode == '56' ? true : false;
    return validCompany;

}

function IsFormValid(formContext, IsPJNRequest) {
    debugger;
    /// <summary>Check various mandatory fields on the form to check if they have been filled in. Highlight fields that are not valid.</summary>
    /// <param name="IsPJNRequest">Flag to indicate whether we are in the process of requesting a PJN, in which case certain fields such as the Bid Salary Cost and Bid Gross Expenses need to be mandatory.</param>
    var v1 = formContext.getAttribute('ccrm_validcontact').getValue(); //needs to be 1
    var v2 = formContext.getAttribute('ccrm_validopportunitytrack').getValue(); //needs to be 1    
    var v3 = formContext.getAttribute('ccrm_accountingcentreid').getValue();
    if (v3 != null)
        v3 = formContext.getAttribute('ccrm_accountingcentreid').getValue()[0].id;
    if (v3 != 0) {
        acctCentreInvalid = false;
        validateAccCenter(formContext,false);
    }

    var v4 = formContext.getAttribute('ccrm_bidmanager_userid').getValue();
    var v5 = formContext.getAttribute('ccrm_biddirector_userid').getValue();
    var v6 = formContext.getControl('ccrm_project_transactioncurrencyid').getAttribute().getValue();
    var v7 = formContext.getAttribute('ccrm_estarupinvolvementstart').getValue();
    var v8 = formContext.getAttribute('ccrm_estarupinvolvementend').getValue();
    var v9 = formContext.getAttribute('ccrm_estimatedvalue_num').getValue();
    var v10 = formContext.getAttribute('ccrm_probabilityofprojectproceeding').getValue();
    var v11 = formContext.getAttribute('closeprobability').getValue();
    var v12 = formContext.getAttribute('ccrm_salarycost_num').getValue();
    var v13 = formContext.getAttribute('ccrm_grossexpenses_num').getValue();
    var v14 = formContext.getAttribute('ccrm_totalbidcost_num').getValue();
    var v15 = formContext.getAttribute('ccrm_descriptionofextentofarupservices').getValue();
    var v16 = formContext.getAttribute('ccrm_leadsource').getValue();
    var v17 = formContext.getAttribute('ccrm_accountingcentreid').getValue();
    var v18 = formContext.getAttribute('ccrm_arupcompanyid').getValue();
    // var v19 = formContext.getAttribute('ccrm_disciplinesname').getValue();
    var v19 = formContext.getAttribute('arup_disciplines').getValue();
    var v25 = formContext.getAttribute('ccrm_contractarrangement').getValue();
    // form fields
    var v20 = formContext.getAttribute('description').getValue();
    var v21 = formContext.getAttribute('ccrm_projectlocationid').getValue();
    var v22 = formContext.getAttribute('ccrm_arupbusinessid').getValue();
    var v23 = formContext.getAttribute('name').getValue();
    var v24 = formContext.getAttribute('customerid').getValue();
    var v26 = formContext.getAttribute('ccrm_arupregionid').getValue();
    if (v26 != null)
        v26 = formContext.getAttribute('ccrm_arupregionid').getValue()[0].id;

    var v27 = formContext.getAttribute("ccrm_client").getValue();
    if (v27 != null) {
        v27 = formContext.getAttribute('ccrm_client').getValue()[0].name;
    }

    var v28 = formContext.getAttribute('ccrm_chargingbasis').getValue();

    var v30 = formContext.getAttribute('ccrm_arupusstateid').getValue();
    var v31 = formContext.getAttribute('ccrm_contractarrangement').getValue();
    var v32 = formContext.getAttribute('ccrm_bid_transactioncurrencyid').getValue();
    //   var v33 = formContext.getAttribute('ccrm_othernetworksdisp').getValue();
    var v33 = formContext.getAttribute('arup_globalservices').getValue();
    var v34 = formContext.getAttribute('ccrm_othernetworkdetails').getValue();
    var v35 = formContext.getAttribute('arup_subbusiness').getValue();

    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();

    var validfieldflag = true;
    var mandatoryfieldflag = true;
    var stateFlag = true;
    var arupRegionFlg = true;
    var valClientFlag = true;

    if (IsPJNRequest == 'PJN') {
        if (v1 == 0 || v2 == 0 || v3 == 0)
            validfieldflag = false;

        if (v4 == null ||
            v5 == null ||
            v6 == null ||
            v7 == null ||
            v8 == null ||
            v9 == null ||
            v10 == null ||
            v11 == null ||
            v12 == null ||
            v13 == null ||
            v14 == null ||
            v15 == null ||
            v16 == null ||
            v17 == null ||
            v18 == null ||
           ( v19 == null || v19.length == 0 ) ||
            v20 == null ||
            v21 == null ||
            v22 == null ||
            v23 == null ||
            v24 == null ||
            v28 == null ||
            v31 == null ||
            v32 == null ||
            v35 == null ||
            (v33 == null || v33.length == 0) ||
            (/Other/.test(v33) && v34 == null))

            mandatoryfieldflag = false;
    } else if (IsPJNRequest == 'BDA') {

        if (v1 == 0 || v2 == 0 || v3 == 0)
            validfieldflag = false;

        if (v4 == null ||
            v5 == null ||
            v6 == null ||
            v7 == null ||
            v8 == null ||
            v9 == null ||
            v10 == null ||
            v11 == null ||
            v15 == null ||
            v16 == null ||
            v17 == null ||
            v18 == null ||
            (v19 == null || v19.length == 0) ||
            v20 == null ||
            v21 == null ||
            v22 == null ||
            v23 == null ||
            v24 == null ||
            v31 == null ||
            v35 == null ||
            (v33 == null || v33.length == 0) ||
            (/Other/.test(v33) && v34 == null))
            mandatoryfieldflag = false;
    } else {
        if (v1 == 0 || v3 == 0)
            validfieldflag = false;

        if (v4 == null ||
            v5 == null ||
            v6 == null ||
            v7 == null ||
            v8 == null ||
            v9 == null ||
            v10 == null ||
            v11 == null ||
            v15 == null ||
            v16 == null ||
            v17 == null ||
            v18 == null ||
            (v19 == null || v19.length == 0) ||
            v20 == null ||
            v21 == null ||
            v22 == null ||
            v23 == null ||
            v24 == null ||
            v31 == null ||
            v35 == null ||
            (v33 == null || v33.length == 0) ||
            (/Other/.test(v33) && v34 == null))
            mandatoryfieldflag = false;
    }
    if (v26 == 0)
        arupRegionFlg = false;
    if (formContext.getControl('ccrm_arupusstateid').getVisible() && v30 == null)
        stateFlag = false;
    if ((v27 == 'Unassigned' || v27 == null) && arupInternal != true)
        valClientFlag = false;

    if (!validfieldflag || !mandatoryfieldflag || !stateFlag || !arupRegionFlg || acctCentreInvalid || !valClientFlag) {
        // set notification message - start
        if (!arupRegionFlg)
            formContext.ui.setFormNotification('Arup Region is not determined. Please verify the Arup Group.', 'WARNING', 'msgReg');
        if ((!mandatoryfieldflag && IsPJNRequest != null) || !stateFlag)
            formContext.ui.setFormNotification("Please fill in all mandatory fields", "WARNING", "reqPJNWarnMsg-mandfields");
        // automatically make the message disappear
        setTimeout(function () {
            formContext.ui.clearFormNotification("reqPJNWarnMsg-mandfields");
            formContext.ui.clearFormNotification("reqPJNWarnMsg-validfields");
        }, 10000);
        // set notification message - ends
        HighlightFields(formContext,v4,
            v5,
            v6,
            v7,
            v8,
            v9,
            v10,
            v11,
            v12,
            v13,
            v14,
            v15,
            v16,
            v17,
            v18,
            v19,
            v20,
            v21,
            v22,
            v23,
            v24,
            v25,
            v27,
            v28,
            v30,
            v32,
            v33,
            v34,
            v35,
            (IsPJNRequest == null || IsPJNRequest != 'PJN') ? false : true); {
            return false;
        }
    } else {
        HighlightFields(formContext,v4,
            v5,
            v6,
            v7,
            v8,
            v9,
            v10,
            v11,
            v12,
            v13,
            v14,
            v15,
            v16,
            v17,
            v18,
            v19,
            v20,
            v21,
            v22,
            v23,
            v24,
            v25,
            v27,
            v28,
            v30,
            v32,
            v33,
            v34,
            v35,
            (IsPJNRequest == null || IsPJNRequest != 'PJN') ? false : true);
    }
    return true;
}

function moveToDevBid(formContext,stageid) {
    var arupRegion = formContext.getAttribute('ccrm_arupregionid').getValue();
    if (arupRegion != null) {
        arupRegion = arupRegion[0].name.toLowerCase();
    }
    formContext.getAttribute('ccrm_possiblejobnumberrequired').setValue(1);


        formContext.getAttribute('ccrm_possiblejobnumberrequired').fireOnChange();
   

    formContext.getAttribute('ccrm_possiblejobnumberrequired').setSubmitMode("always");
   // hideRibbonButton(formContext,'ccrm_showpjnbutton', false);
    formContext.getAttribute('ccrm_showpjnbutton').setValue(false);

    if ((stageid == ArupStages.Lead || stageid == ArupStages.CrossRegion) && (arupRegion == ArupRegionName.Australasia.toLowerCase() || arupRegion == ArupRegionName.EastAsia.toLowerCase() || arupRegion == ArupRegionName.Malaysia.toLowerCase())) {
        moveToNextTrigger = true;
    }
    setTimeout(function () { void 0; }, 1000);

  //  setTimeout(function () {
        formContext.data.save();
   // }, 10000);
}

function HighlightFields(formContext,v4,
    v5,
    v6,
    v7,
    v8,
    v9,
    v10,
    v11,
    v12,
    v13,
    v14,
    v15,
    v16,
    v17,
    v18,
    v19,
    v20,
    v21,
    v22,
    v23,
    v24,
    v25,
    v27,
    v28,
    v30,
    v32,
    v33,
    v34,
    v35,
    IsPJNRequest) {
    // highlight incomplete fields 

    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();

    $(document)
        .ready(function () {
            highlightField(null, "#ccrm_arupusstateid", (formContext.getControl('ccrm_arupusstateid').getVisible() && v30 != null) ? true : false);
            highlightField('#header_process_ccrm_bidmanager_userid', '#ccrm_bidmanager_userid', (v4 != null) ? true : false);
            highlightField('#header_process_ccrm_biddirector_userid', '#ccrm_biddirector_userid', (v5 != null) ? true : false);
            highlightField(null, '#ccrm_project_transactioncurrencyid', (v6 != null) ? true : false);

            //CRM 2016-Bug 34819, 34884
            //formContext.getControl("header_ccrm_project_transactioncurrencyid").setRequiredLevel('required');
            highlightField('#header_process_ccrm_estarupinvolvementstart', '#ccrm_estarupinvolvementstart', (v7 != null) ? true : false);
            highlightField('#header_process_ccrm_estarupinvolvementend', '#ccrm_estarupinvolvementend', (v8 != null) ? true : false);
            highlightField('#header_process_ccrm_estimatedvalue_num', '#ccrm_estimatedvalue_num', (v9 != null) ? true : false);
            highlightField(null, "#ccrm_client", ((v27 != null && v27 != 'Unassigned') || arupInternal == true) ? true : false);
            //CRM2016-Bug 34944
            // highlightField('#header_process_ccrm_probabilityofprojectproceeding', '#ccrm_probabilityofprojectproceeding', (v10 != null) ? true : false);
            // highlightField('#header_process_closeprobability', '#closeprobability', (v11 != null) ? true : false);
            // Shruti : moving below if condition to requestPossibleJob function , need to check if this condition is used in BDA request
            //if (IsPJNRequest) {
            //    highlightField('#header_process_ccrm_salarycost_num', '#ccrm_salarycost_num', (v12 != null) ? true : false);
            //    formContext.getAttribute("ccrm_salarycost_num").setRequiredLevel('required');
            //    highlightField('#header_process_ccrm_grossexpenses_num', '#ccrm_grossexpenses_num', (v13 != null) ? true : false);
            //    formContext.getAttribute("ccrm_grossexpenses_num").setRequiredLevel('required');
            //    highlightField('#header_process_ccrm_totalbidcost_num', '#ccrm_totalbidcost_num', (v14 != null) ? true : false);
            //    highlightField(null, '#ccrm_chargingbasis', (v28 != null) ? true : false);
            //    formContext.getAttribute("ccrm_chargingbasis").setRequiredLevel('required');
            //    highlightField(null, "#ccrm_bid_transactioncurrencyid", (v32 != null) ? true : false);
            //    formContext.getAttribute("ccrm_bid_transactioncurrencyid").setRequiredLevel('required');
            //    formContext.getAttribute("ccrm_totalbidcost_num").setRequiredLevel('required');// moved back to PJN block based on regression test defect
            //}

            highlightField('#header_process_ccrm_descriptionofextentofarupservices', '#ccrm_descriptionofextentofarupservices', (v15 != null) ? true : false);
            highlightField(null, '#ccrm_leadsource', (v16 != null) ? true : false);
            highlightField('#header_process_ccrm_accountingcentreid', '#ccrm_accountingcentreid', (v17 != null) ? true : false);
            highlightField('#header_process_ccrm_arupcompanyid', '#ccrm_arupcompanyid', (v18 != null) ? true : false);
            highlightField(null, '#arup_disciplines', (v19 != null) ? true : false);
            highlightField(null, "#description", (v20 != null) ? true : false);
            highlightField(null, "#ccrm_projectlocationid", (v21 != null) ? true : false);
            highlightField(null, "#ccrm_arupbusinessid", (v22 != null) ? true : false);
            highlightField(null, "#name", (v23 != null) ? true : false);
            highlightField(null, "#customerid", (v24 != null) ? true : false);
            highlightField(null, '#ccrm_contractarrangement', (v25 != null) ? true : false);
            highlightField(null, "#arup_globalservices", v33 != null);
            highlightField("#header_process_ccrm_othernetworkdetails", "#ccrm_othernetworkdetails", v33 != null && v34 != null);
            highlightField(null, "#arup_subbusiness", (v35 != null) ? true : false);
        });
}

function CrossRegionFieldsFilled(formContext) {
    var result = true;
    var countrymgrconsulted = formContext.getAttribute("ccrm_geographicmanagerproxyconsulted2").getValue();
    if (countrymgrconsulted == null) {
        highlightField('#header_process_ccrm_geographicmanagerproxyconsulted2',
            "#ccrm_geographicmanagerproxyconsulted2");
        result = false;
    }
    var notconsultval = formContext.getAttribute("ccrm_reasonfornotconsultingcountrymanager").getValue();
    if (countrymgrconsulted == 2 && notconsultval == null) {
        highlightField('#header_process_ccrm_reasonfornotconsultingcountrymanager',
            "#ccrm_reasonfornotconsultingcountrymanager");
        result = false;
    }
    var dtconsulted = formContext.getAttribute("ccrm_dateconsulted").getValue();
    if (countrymgrconsulted == 1 && dtconsulted == null) {
        highlightField('#header_process_ccrm_dateconsulted', "#ccrm_dateconsulted");
        result = false;
    }
    return result;
}

function HighlightCrossRegionFields(formContext,isCrossRegion) {
    var notconsultval = formContext.getAttribute("ccrm_reasonfornotconsultingcountrymanager").getValue();
    var countrymgrconsulted = formContext.getAttribute("ccrm_geographicmanagerproxyconsulted2").getValue();
    var dtconsulted = formContext.getAttribute("ccrm_dateconsulted").getValue();

    $(document)
        .ready(function () {
            var showNotification = false;

            if (countrymgrconsulted == null) {
                highlightField('#header_process_ccrm_geographicmanagerproxyconsulted2',
                    "#ccrm_geographicmanagerproxyconsulted2");
                showNotification = true;
            } else
                highlightField('#header_process_ccrm_geographicmanagerproxyconsulted2',
                    "#ccrm_geographicmanagerproxyconsulted2",
                    true);

            if (countrymgrconsulted == 2 && notconsultval == null) {
                highlightField('#header_process_ccrm_reasonfornotconsultingcountrymanager',
                    "#ccrm_reasonfornotconsultingcountrymanager");
                showNotification = true;
            } else
                highlightField('#header_process_ccrm_reasonfornotconsultingcountrymanager',
                    "#ccrm_reasonfornotconsultingcountrymanager",
                    true);

            if (countrymgrconsulted == 1 && dtconsulted == null) {
                highlightField('#header_process_ccrm_dateconsulted', "#ccrm_dateconsulted");
                showNotification = true;
            } else highlightField('#header_process_ccrm_dateconsulted', "#ccrm_dateconsulted", true);


            if (showNotification) {
                // Please complete the cross country checks before requesting a possible Job number
                var msgCrossRegion =
                    'To complete the Bid Review please fill in the mandatory fields and ensure that the cross country checks have been completed.';
                if (isCrossRegion) {
                    if (moveToNextTrigger_PJN) {
                        msgCrossRegion =
                            'This is a Cross Region bid and the Country Manager needs to be consulted.  Please complete the details before Requesting Possible Job.';
                        moveToNextTrigger_PJN = false;
                    } else
                        msgCrossRegion = 'Please complete the cross country checks before progressing.';
                }

                formContext.ui.setFormNotification(msgCrossRegion, 'WARNING', 'msgcrossbid');
                setTimeout(function () { formContext.ui.clearFormNotification("msgcrossbid"); }, 10000);
            }
        });

}

function InitiateCrossRegionStage(formContext,countrymgrconsulted, isCrossRegion) {
    formContext.getAttribute("ccrm_geographicmanagerproxyconsulted2").setRequiredLevel("required");
    //formContext.getAttribute("ccrm_dateconsulted").setRequiredLevel("required");
    countrymgrconsulted = formContext.getAttribute("ccrm_geographicmanagerproxyconsulted2").getValue();
    if (countrymgrconsulted == 2) {
        formContext.getAttribute("ccrm_reasonfornotconsultingcountrymanager").setRequiredLevel("required");
        formContext.getAttribute("ccrm_dateconsulted").setRequiredLevel("none");
    } else if (countrymgrconsulted == 1) {
        formContext.getAttribute("ccrm_reasonfornotconsultingcountrymanager").setRequiredLevel("none");
        formContext.getAttribute("ccrm_dateconsulted").setRequiredLevel("required");
    }
    HighlightCrossRegionFields(formContext,isCrossRegion);
}

function setJobNoProgression(formContext,val) {
    if (formContext.getAttribute('ccrm_jobnumberprogression').getValue() != val) {
        var jobNoProgField = formContext.getAttribute('ccrm_jobnumberprogression');
        jobNoProgField.setValue(val);
        //jobNoProgField.setSubmitMode("always");
        //jobNoProgField.fireOnChange();
    }
}

function getApproverName(recordid, entity, field) {
    debugger;
    var output = new Object();
    field = "_" + field + "_value";
    //SDK.REST.retrieveRecord(recordid,
    //    entity,
    //    field,
    //    null,
    //    function (retrievedreq) {
    //        if (retrievedreq != null) {
    //            if (retrievedreq[field] != null) {
    //                output.Name = retrievedreq[field].Name;
    //                output.Id = retrievedreq[field].Id;
    //            } else
    //                output.Name = currUserData.FullName; // if null then set to curr user name to satisfy the equal to condition
    //        }
    //    },
    //    errorHandler,
    //    false);


    var filterQuery = "" + entity + "s(" + recordid.replace('{', '').replace('}', '') + ")?$select=" + field +"";
    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/" + filterQuery, false);
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
                var formattedValueFieldName = field + "@OData.Community.Display.V1.FormattedValue";
                output.Name = result[formattedValueFieldName];
                output.Id = result[field];
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();

    return output;
}

function getGroupLeaderApprovers(formContext,groupid, companyid) {
    var check1 = -1;
    var check2 = -1;
    var LoggedUser = formContext.context.getUserId();
    LoggedUser = LoggedUser.replace('{', '');
    LoggedUser = LoggedUser.replace('}', '');
    LoggedUser = LoggedUser.toLowerCase();
    var outputGroup = new Object();
    var outputCompany = new Object();
    var output = new Object();
    outputGroup = getGLApprovers(formContext,groupid);

    if (outputGroup != null) {
        if (outputGroup.Ids != '') {
            check1 = $.inArray(LoggedUser, outputGroup.Ids);
            if (check1 == -1) { return false; }
            else { return true; }
        }
    }

    outputCompany = getFinanceApproverForCompany(formContext,companyid);

    if (outputCompany != null) {
        check2 = $.inArray(LoggedUser, outputCompany.Ids);
        if (check2 == -1) { return false; }
        else { return true; }
    }

    return false;

}

function getGLApprovers(formContext,groupid) {
    var output = new Object();
    var names = new Array();
    var ids = new Array();
    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/ccrm_arupgroups(" + groupid.replace('{', '').replace('}', '') +")?$select=_arup_groupleader_value,_arup_groupleader13id_value,_arup_groupleader14id_value,_arup_groupleader15id_value,_arup_groupleader16id_value,_arup_groupleader17id_value,_arup_groupleader18id_value,_arup_groupleader19id_value,_arup_groupleader20id_value,_ccrm_groupleader10id_value,_ccrm_groupleader11id_value,_ccrm_groupleader12id_value,_ccrm_groupleader1id_value,_ccrm_groupleader2id_value,_ccrm_groupleader3id_value,_ccrm_groupleader4id_value,_ccrm_groupleader5id_value,_ccrm_groupleader6id_value,_ccrm_groupleader7id_value,_ccrm_groupleader8id_value,_ccrm_groupleader9id_value", false);
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
                if (result != null) {
                    if (result["_arup_groupleader_value"] != null) {
                        names.push(result["_arup_groupleader_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_groupleader_value"]);
                    }
                    if (result["_ccrm_groupleader1id_value"] != null) {
                        names.push(result["_ccrm_groupleader1id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_groupleader1id_value"]);
                    }

                    if (result["_ccrm_groupleader2id_value"] != null) {
                        names.push(result["_ccrm_groupleader2id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_groupleader2id_value"]);
                    }
                    if (result["_ccrm_groupleader3id_value"] != null) {
                        names.push(result["_ccrm_groupleader3id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_groupleader3id_value"]);
                    }
                    if (result["_ccrm_groupleader4id_value"] != null) {
                        names.push(result["_ccrm_groupleader4id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_groupleader4id_value"]);
                    }
                    if (result["_ccrm_groupleader5id_value"] != null) {
                        names.push(result["_ccrm_groupleader5id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_groupleader5id_value"]);
                    }

                    if (result["_ccrm_groupleader6id_value"] != null) {
                        names.push(result["_ccrm_groupleader6id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_groupleader6id_value"]);
                    }
                    if (result["_ccrm_groupleader7id_value"] != null) {
                        names.push(result["_ccrm_groupleader7id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_groupleader7id_value"]);
                    }
                    if (result["_ccrm_groupleader8id_value"] != null) {
                        names.push(result["_ccrm_groupleader8id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_groupleader8id_value"]);
                    }
                    if (result["_ccrm_groupleader9id_value"] != null) {
                        names.push(result["_ccrm_groupleader9id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_groupleader9id_value"]);
                    }
                    if (result["_ccrm_groupleader10id_value"] != null) {
                        names.push(result["_ccrm_groupleader10id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_groupleader10id_value"]);
                    }
                    if (result["_ccrm_groupleader11id_value"] != null) {
                        names.push(result["_ccrm_groupleader11id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_groupleader11id_value"]);
                    }
                    if (result["_ccrm_groupleader12id_value"] != null) {
                        names.push(result["_ccrm_groupleader12id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_groupleader12id_value"]);
                    }
                    if (result["_arup_groupleader13id_value"] != null) {
                        names.push(result["_arup_groupleader13id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_groupleader13id_value"]);
                    }
                    if (result["_arup_groupleader14id_value"] != null) {
                        names.push(result["_arup_groupleader14id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_groupleader14id_value"]);
                    }
                    if (result["_arup_groupleader15id_value"] != null) {
                        names.push(result["_arup_groupleader15id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_groupleader15id_value"]);
                    }
                    if (result["_arup_groupleader16id_value"] != null) {
                        names.push(result["_arup_groupleader16id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_groupleader16id_value"]);
                    }
                    if (result["_arup_groupleader17id_value"] != null) {
                        names.push(result["_arup_groupleader17id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_groupleader17id_value"]);
                    }
                    if (result["_arup_groupleader18id_value"] != null) {
                        names.push(result["_arup_groupleader18id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_groupleader18id_value"]);
                    }
                    if (result["_arup_groupleader19id_value"] != null) {
                        names.push(result["_arup_groupleader19id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_groupleader19id_value"]);
                    }
                    if (result["_arup_groupleader20id_value"] != null) {
                        names.push(result["_arup_groupleader20id_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_groupleader20id_value"]);
                    }
                }
               
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();


    //SDK.REST.retrieveRecord(groupid,
    //    "Ccrm_arupgroup",
    //    'arup_GroupLeader,ccrm_groupleader1id,ccrm_groupleader2id,ccrm_groupleader3id,ccrm_groupleader4id,ccrm_groupleader5id,ccrm_groupleader6id,' +
    //    'ccrm_groupleader7id,ccrm_groupleader8id,ccrm_groupleader9id,ccrm_groupleader10id,ccrm_groupleader11id,ccrm_groupleader12id,' +
    //    'arup_GroupLeader13id,arup_GroupLeader14id,arup_GroupLeader15id,arup_GroupLeader16id,arup_GroupLeader17id,arup_GroupLeader18id,arup_GroupLeader19id,arup_GroupLeader20id',
    //    null,
    //    function (retrievedreq) {
    //        if (retrievedreq != null) {
    //            if (retrievedreq.arup_GroupLeader.Id != null) {
    //                names.push(retrievedreq.arup_GroupLeader.Name);
    //                ids.push(retrievedreq.arup_GroupLeader.Id);
    //            }
    //            if (retrievedreq.ccrm_groupleader1id.Id != null) {
    //                names.push(retrievedreq.ccrm_groupleader1id.Name);
    //                ids.push(retrievedreq.ccrm_groupleader1id.Id);
    //            }
    //            if (retrievedreq.ccrm_groupleader2id.Id != null) {
    //                names.push(retrievedreq.ccrm_groupleader2id.Name);
    //                ids.push(retrievedreq.ccrm_groupleader2id.Id);
    //            }
    //            if (retrievedreq.ccrm_groupleader3id.Id != null) {
    //                names.push(retrievedreq.ccrm_groupleader3id.Name);
    //                ids.push(retrievedreq.ccrm_groupleader3id.Id);
    //            }
    //            if (retrievedreq.ccrm_groupleader4id.Id != null) {
    //                names.push(retrievedreq.ccrm_groupleader4id.Name);
    //                ids.push(retrievedreq.ccrm_groupleader4id.Id);
    //            }
    //            if (retrievedreq.ccrm_groupleader5id.Id != null) {
    //                names.push(retrievedreq.ccrm_groupleader5id.Name);
    //                ids.push(retrievedreq.ccrm_groupleader5id.Id);
    //            }
    //            if (retrievedreq.ccrm_groupleader6id.Id != null) {
    //                names.push(retrievedreq.ccrm_groupleader6id.Name);
    //                ids.push(retrievedreq.ccrm_groupleader6id.Id);
    //            }
    //            if (retrievedreq.ccrm_groupleader7id.Id != null) {
    //                names.push(retrievedreq.ccrm_groupleader7id.Name);
    //                ids.push(retrievedreq.ccrm_groupleader7id.Id);
    //            }
    //            if (retrievedreq.ccrm_groupleader8id.Id != null) {
    //                names.push(retrievedreq.ccrm_groupleader8id.Name);
    //                ids.push(retrievedreq.ccrm_groupleader8id.Id);
    //            }
    //            if (retrievedreq.ccrm_groupleader9id.Id != null) {
    //                names.push(retrievedreq.ccrm_groupleader9id.Name);
    //                ids.push(retrievedreq.ccrm_groupleader9id.Id);
    //            }
    //            if (retrievedreq.ccrm_groupleader10id.Id != null) {
    //                names.push(retrievedreq.ccrm_groupleader10id.Name);
    //                ids.push(retrievedreq.ccrm_groupleader10id.Id);
    //            }
    //            if (retrievedreq.ccrm_groupleader11id.Id != null) {
    //                names.push(retrievedreq.ccrm_groupleader11id.Name);
    //                ids.push(retrievedreq.ccrm_groupleader11id.Id);
    //            }
    //            if (retrievedreq.ccrm_groupleader12id.Id != null) {
    //                names.push(retrievedreq.ccrm_groupleader12id.Name);
    //                ids.push(retrievedreq.ccrm_groupleader12id.Id);
    //            }
    //            if (retrievedreq.arup_GroupLeader13id.Id != null) {
    //                names.push(retrievedreq.arup_GroupLeader13id.Name);
    //                ids.push(retrievedreq.arup_GroupLeader13id.Id);
    //            }
    //            if (retrievedreq.arup_GroupLeader14id.Id != null) {
    //                names.push(retrievedreq.arup_GroupLeader14id.Name);
    //                ids.push(retrievedreq.arup_GroupLeader14id.Id);
    //            }
    //            if (retrievedreq.arup_GroupLeader15id.Id != null) {
    //                names.push(retrievedreq.arup_GroupLeader15id.Name);
    //                ids.push(retrievedreq.arup_GroupLeader15id.Id);
    //            }
    //            if (retrievedreq.arup_GroupLeader16id.Id != null) {
    //                names.push(retrievedreq.arup_GroupLeader16id.Name);
    //                ids.push(retrievedreq.arup_GroupLeader16id.Id);
    //            }
    //            if (retrievedreq.arup_GroupLeader17id.Id != null) {
    //                names.push(retrievedreq.arup_GroupLeader17id.Name);
    //                ids.push(retrievedreq.arup_GroupLeader17id.Id);
    //            }
    //            if (retrievedreq.arup_GroupLeader18id.Id != null) {
    //                names.push(retrievedreq.arup_GroupLeader18id.Name);
    //                ids.push(retrievedreq.arup_GroupLeader18id.Id);
    //            }
    //            if (retrievedreq.arup_GroupLeader19id.Id != null) {
    //                names.push(retrievedreq.arup_GroupLeader19id.Name);
    //                ids.push(retrievedreq.arup_GroupLeader19id.Id);
    //            }
    //            if (retrievedreq.arup_GroupLeader20id.Id != null) {
    //                names.push(retrievedreq.arup_GroupLeader20id.Name);
    //                ids.push(retrievedreq.arup_GroupLeader20id.Id);
    //            }
    //        }
    //    },
    //    errorHandler,
    //    false);

    //Xrm.WebApi.online.retrieveRecord("ccrm_arupgroup", groupid, "?$select=_arup_groupleader_value,_arup_groupleader13id_value,_arup_groupleader14id_value,_arup_groupleader15id_value,_arup_groupleader16id_value,_arup_groupleader17id_value,_arup_groupleader18id_value,_arup_groupleader19id_value,_arup_groupleader20id_value,_ccrm_groupleader10id_value,_ccrm_groupleader11id_value,_ccrm_groupleader12id_value,_ccrm_groupleader1id_value,_ccrm_groupleader2id_value,_ccrm_groupleader3id_value,_ccrm_groupleader4id_value,_ccrm_groupleader5id_value,_ccrm_groupleader6id_value,_ccrm_groupleader7id_value,_ccrm_groupleader8id_value,_ccrm_groupleader9id_value").then(
    //    function success(result) {
    //        if (result != null) { 
    //        if (result["_arup_groupleader_value"] != null) {
    //            names.push(result["_arup_groupleader_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_groupleader_value"]);
    //        }
    //        if (result["_ccrm_groupleader1id_value"] != null) {
    //            names.push(result["_ccrm_groupleader1id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_groupleader1id_value"]);
    //        }
    //        if (result["_ccrm_groupleader2id_value"] != null) {
    //            names.push(result["_ccrm_groupleader2id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_groupleader2id_value"]);
    //        }
    //        if (result["_ccrm_groupleader3id_value"] != null) {
    //            names.push(result["_ccrm_groupleader3id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_groupleader3id_value"]);
    //        }
    //        if (result["_ccrm_groupleader4id_value"] != null) {
    //            names.push(result["_ccrm_groupleader4id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_groupleader4id_value"]);
    //        }
    //        if (result["_ccrm_groupleader5id_value"] != null) {
    //            names.push(result["_ccrm_groupleader5id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_groupleader5id_value"]);
    //        }
    //        if (result["_ccrm_groupleader6id_value"] != null) {
    //            names.push(result["_ccrm_groupleader6id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_groupleader6id_value"]);
    //        }
    //        if (result["_ccrm_groupleader7id_value"] != null) {
    //            names.push(result["_ccrm_groupleader7id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_groupleader7id_value"]);
    //        }
    //        if (result["_ccrm_groupleader8id_value"] != null) {
    //            names.push(result["_ccrm_groupleader8id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_groupleader8id_value"]);
    //        }
    //        if (result["_ccrm_groupleader9id_value"] != null) {
    //            names.push(result["_ccrm_groupleader9id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_groupleader9id_value"]);
    //        }
    //        if (result["_ccrm_groupleader10id_value"] != null) {
    //            names.push(result["_ccrm_groupleader10id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_groupleader10id_value"]);
    //        }
    //        if (result["_ccrm_groupleader11id_value"] != null) {
    //            names.push(result["_ccrm_groupleader11id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_groupleader11id_value"]);
    //        }
    //        if (result["_ccrm_groupleader12id_value"] != null) {
    //            names.push(result["_ccrm_groupleader12id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_groupleader12id_value"]);
    //        }
    //        if (result["_arup_groupleader13id_value"] != null) {
    //            names.push(result["_arup_groupleader13id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_groupleader13id_value"]);
    //        }
    //        if (result["_arup_groupleader14id_value"] != null) {
    //            names.push(result["_arup_groupleader14id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_groupleader14id_value"]);
    //        }
    //        if (result["_arup_groupleader15id_value"] != null) {
    //            names.push(result["_arup_groupleader15id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_groupleader15id_value"]);
    //        }
    //        if (result["_arup_groupleader16id_value"] != null) {
    //            names.push(result["_arup_groupleader16id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_groupleader16id_value"]);
    //        }
    //        if (result["_arup_groupleader17id_value"] != null) {
    //            names.push(result["_arup_groupleader17id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_groupleader17id_value"]);
    //        }
    //        if (result["_arup_groupleader18id_value"] != null) {
    //            names.push(result["_arup_groupleader18id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_groupleader18id_value"]);
    //        }
    //        if (result["_arup_groupleader19id_value"] != null) {
    //            names.push(result["_arup_groupleader19id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_groupleader19id_value"]);
    //        }
    //        if (result["_arup_groupleader20id_value"] != null) {
    //            names.push(result["_arup_groupleader20id_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_groupleader20id_value"]);
    //        }
    //    }
    //  },
    //    function (error) {
    //        Xrm.Utility.alertDialog(error.message);
    //    }
    //);

    output.Names = names.filter(function (e) { return e });
    output.Ids = ids.filter(function (e) { return e });
    return output;
}

function getAccountingCentreApprovers(formContext,userId,acccenid, companyid) {
    var LoggedUser = userId;
    var check1 = -1;
    var check2 = -1;
    LoggedUser = LoggedUser.replace('{', '');
    LoggedUser = LoggedUser.replace('}', '');
    LoggedUser = LoggedUser.toLowerCase();
    var outputAccCentre = new Object();
    var outputCompany = new Object();
    outputAccCentre = getAccCenApprovers(formContext,acccenid);

    if (outputAccCentre != null) {
        if (outputAccCentre.Ids != '') {
            check1 = $.inArray(LoggedUser, outputAccCentre.Ids);
            if (check1 == -1) { return false; }
            else { return true; }
        }
    }

    outputCompany = getFinanceApproverForCompany(formContext,companyid);

    if (outputCompany != null) {
        check2 = $.inArray(LoggedUser, outputCompany.Ids);
        if (check2 == -1) { return false; }
        else { return true; }
    }

    return false;

}

function getAccCenApprovers(formContext,acccenid) {
    var output = new Object();
    var names = new Array();
    var ids = new Array();

    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/ccrm_arupaccountingcodes(" + acccenid.replace('{', '').replace('}', '') +")?$select=_arup_accountingcentredelegate10_userid_value,_arup_accountingcentredelegate11_userid_value,_arup_accountingcentredelegate12_userid_value,_arup_accountingcentredelegate13_userid_value,_arup_accountingcentredelegate14_userid_value,_arup_accountingcentredelegate15_userid_value,_arup_accountingcentredelegate16_userid_value,_arup_accountingcentredelegate17_userid_value,_arup_accountingcentredelegate18_userid_value,_arup_accountingcentredelegate19_userid_value,_arup_accountingcentredelegate20_userid_value,_arup_accountingcentredelegate5_userid_value,_arup_accountingcentredelegate6_userid_value,_arup_accountingcentredelegate7_userid_value,_arup_accountingcentredelegate8_userid_value,_arup_accountingcentredelegate9_userid_value,_ccrm_accountingcentredelegate1_userid_value,_ccrm_accountingcentredelegate2_userid_value,_ccrm_accountingcentredelegate3_userid_value,_ccrm_accountingcentredelegate4_userid_value,_ccrm_accountingcentreleaderid_value", false);
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
                if (result != null) {
                    if (result["_ccrm_accountingcentreleaderid_value"] != null) {
                        names.push(result["_ccrm_accountingcentreleaderid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_accountingcentreleaderid_value"]);
                    }
                    if (result["_ccrm_accountingcentredelegate1_userid_value"] != null) {
                        names.push(result["_ccrm_accountingcentredelegate1_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_accountingcentredelegate1_userid_value"]);
                    }
                    if (result["_ccrm_accountingcentredelegate2_userid_value"] != null) {
                        names.push(result["_ccrm_accountingcentredelegate2_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_accountingcentredelegate2_userid_value"]);
                    }
                    if (result["_ccrm_accountingcentredelegate3_userid_value"] != null) {
                        names.push(result["_ccrm_accountingcentredelegate3_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_accountingcentredelegate3_userid_value"]);
                    }
                    if (result["_ccrm_accountingcentredelegate4_userid_value"] != null) {
                        names.push(result["_ccrm_accountingcentredelegate4_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_accountingcentredelegate4_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate5_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate5_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate5_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate6_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate6_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate6_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate7_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate7_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate7_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate8_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate8_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate8_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate9_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate9_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate9_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate10_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate10_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate10_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate11_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate11_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate11_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate12_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate12_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate12_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate13_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate13_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate13_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate14_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate14_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate14_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate15_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate15_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate15_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate16_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate16_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate16_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate17_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate17_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate17_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate18_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate18_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate18_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate19_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate19_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate19_userid_value"]);
                    }
                    if (result["_arup_accountingcentredelegate20_userid_value"] != null) {
                        names.push(result["_arup_accountingcentredelegate20_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_accountingcentredelegate20_userid_value"]);
                    }
                }
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();

    //SDK.REST.retrieveRecord(acccenid, "Ccrm_arupaccountingcode", 'ccrm_accountingcentreleaderid,ccrm_accountingcentredelegate1_userid,ccrm_accountingcentredelegate2_userid,ccrm_accountingcentredelegate3_userid,ccrm_accountingcentredelegate4_userid,' +
    //    'arup_accountingcentredelegate5_userid,arup_accountingcentredelegate6_userid,arup_accountingcentredelegate7_userid,arup_accountingcentredelegate8_userid,arup_accountingcentredelegate9_userid,arup_accountingcentredelegate10_userid,' +
    //    'arup_accountingcentredelegate11_userid,arup_accountingcentredelegate12_userid,arup_accountingcentredelegate13_userid,arup_accountingcentredelegate14_userid,arup_accountingcentredelegate15_userid,arup_accountingcentredelegate16_userid,' +
    //    'arup_accountingcentredelegate17_userid,arup_accountingcentredelegate18_userid,arup_accountingcentredelegate19_userid,arup_accountingcentredelegate20_userid', null,
    //    function (retrievedreq) {
    //        if (retrievedreq != null) {
    //            // accounting centre delegates
    //            if (retrievedreq.ccrm_accountingcentreleaderid.Id != null) {
    //                names.push(retrievedreq.ccrm_accountingcentreleaderid.Name); ids.push(retrievedreq.ccrm_accountingcentreleaderid.Id);
    //            }
    //            if (retrievedreq.ccrm_accountingcentredelegate1_userid.Id != null) {
    //                names.push(retrievedreq.ccrm_accountingcentredelegate1_userid.Name); ids.push(retrievedreq.ccrm_accountingcentredelegate1_userid.Id);
    //            }
    //            if (retrievedreq.ccrm_accountingcentredelegate2_userid.Id != null) {
    //                names.push(retrievedreq.ccrm_accountingcentredelegate2_userid.Name); ids.push(retrievedreq.ccrm_accountingcentredelegate2_userid.Id);
    //            }
    //            if (retrievedreq.ccrm_accountingcentredelegate3_userid.Id != null) {
    //                names.push(retrievedreq.ccrm_accountingcentredelegate3_userid.Name); ids.push(retrievedreq.ccrm_accountingcentredelegate3_userid.Id);
    //            }
    //            if (retrievedreq.ccrm_accountingcentredelegate4_userid.Id != null) {
    //                names.push(retrievedreq.ccrm_accountingcentredelegate4_userid.Name); ids.push(retrievedreq.ccrm_accountingcentredelegate4_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate5_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate5_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate5_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate6_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate6_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate6_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate7_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate7_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate7_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate8_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate8_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate8_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate9_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate9_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate9_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate10_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate10_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate10_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate11_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate11_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate11_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate12_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate12_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate12_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate13_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate13_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate13_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate14_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate14_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate14_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate15_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate15_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate15_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate16_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate16_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate16_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate17_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate17_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate17_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate18_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate18_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate18_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate19_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate19_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate19_userid.Id);
    //            }
    //            if (retrievedreq.arup_accountingcentredelegate20_userid.Id != null) {
    //                names.push(retrievedreq.arup_accountingcentredelegate20_userid.Name); ids.push(retrievedreq.arup_accountingcentredelegate20_userid.Id);
    //            }
    //        }
    //    }, errorHandler, false);

    //Xrm.WebApi.online.retrieveRecord("ccrm_arupaccountingcode", acccenid, "?$select=_arup_accountingcentredelegate10_userid_value,_arup_accountingcentredelegate11_userid_value,_arup_accountingcentredelegate12_userid_value,_arup_accountingcentredelegate13_userid_value,_arup_accountingcentredelegate14_userid_value,_arup_accountingcentredelegate15_userid_value,_arup_accountingcentredelegate16_userid_value,_arup_accountingcentredelegate17_userid_value,_arup_accountingcentredelegate18_userid_value,_arup_accountingcentredelegate19_userid_value,_arup_accountingcentredelegate20_userid_value,_arup_accountingcentredelegate5_userid_value,_arup_accountingcentredelegate6_userid_value,_arup_accountingcentredelegate7_userid_value,_arup_accountingcentredelegate8_userid_value,_arup_accountingcentredelegate9_userid_value,_ccrm_accountingcentredelegate1_userid_value,_ccrm_accountingcentredelegate2_userid_value,_ccrm_accountingcentredelegate3_userid_value,_ccrm_accountingcentredelegate4_userid_value").then(
    //    function success(result) {
    //        if (result != null) { 
    //        if (result["_ccrm_accountingcentreleaderid_value"] != null) {
    //            names.push(result["_ccrm_accountingcentreleaderid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_accountingcentreleaderid_value"]);
    //        }
    //        if (result["_ccrm_accountingcentredelegate1_userid_value"] != null) {
    //            names.push(result["_ccrm_accountingcentredelegate1_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_accountingcentredelegate1_userid_value"]);
    //        }
    //        if (result["_ccrm_accountingcentredelegate2_userid_value"] != null) {
    //            names.push(result["_ccrm_accountingcentredelegate2_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_accountingcentredelegate2_userid_value"]);
    //        }
    //        if (result["_ccrm_accountingcentredelegate3_userid_value"] != null) {
    //            names.push(result["_ccrm_accountingcentredelegate3_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_accountingcentredelegate3_userid_value"]);
    //        }
    //        if (result["_ccrm_accountingcentredelegate4_userid_value"] != null) {
    //            names.push(result["_ccrm_accountingcentredelegate4_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_accountingcentredelegate4_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate5_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate5_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate5_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate6_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate6_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate6_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate7_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate7_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate7_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate8_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate8_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate8_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate9_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate9_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate9_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate10_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate10_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate10_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate11_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate11_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate11_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate12_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate12_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate12_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate13_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate13_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate13_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate14_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate14_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate14_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate15_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate15_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate15_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate16_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate16_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate16_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate17_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate17_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate17_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate18_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate18_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate18_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate19_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate19_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate19_userid_value"]);
    //        }
    //        if (result["_arup_accountingcentredelegate20_userid_value"] != null) {
    //            names.push(result["_arup_accountingcentredelegate20_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_arup_accountingcentredelegate20_userid_value"]);
    //        }
    //    }
    //    },
    //    function (error) {
    //        Xrm.Utility.alertDialog(error.message);
    //    }
    //);

    if (names == '' && ids == '') { return null; }

    output.Names = names.filter(function (e) { return e !== null; });
    output.Ids = ids.filter(function (e) { return e !== null; });
    return output;
}

function getFinanceApprovers(formContext,userId,acccenid, companyid) {
    var LoggedUser = userId;
    LoggedUser = LoggedUser.replace('{', '');
    LoggedUser = LoggedUser.replace('}', '');
    LoggedUser = LoggedUser.toLowerCase();
    var outputAccCentre = new Object();
    var outputCompany = new Object();
    outputAccCentre = getFinanceApproverForAccCentre(formContext,acccenid);
    outputCompany = getFinanceApproverForCompany(formContext,companyid);
    //if (output.Names.length < 1) output = getFinanceApproverForCompany(companyid);

    var check1 = $.inArray(LoggedUser, outputAccCentre.Ids);
    var check2 = $.inArray(LoggedUser, outputCompany.Ids);
    if ((check1 > -1) || (check2 > -1)) {
        return true;
    } else {
        return false;
    }
    //return output;
}

function getFinanceApproverForAccCentre(formContext,acccenid) {
    var output = new Object();
    var names = new Array();
    var ids = new Array();
    //SDK.REST.retrieveRecord(acccenid,
    //    "Ccrm_arupaccountingcode",
    //    'Ccrm_financialapprover1_userid,Ccrm_financialapprover2_userid,Ccrm_financialapprover3_userid,Ccrm_financialapprover4_userid,arup_FinancialApprover5_userid,arup_FinancialApprover6_userid,arup_FinancialApprover7_userid,' +
    //    'arup_FinancialApprover8_userid,arup_FinancialApprover9_userid,arup_FinancialApprover10_userid,arup_FinancialApprover11_userid,arup_FinancialApprover12_userid,arup_FinancialApprover13_userid,arup_FinancialApprover14_userid,' +
    //    'arup_FinancialApprover15_userid,arup_FinancialApprover16_userid,arup_FinancialApprover17_userid,arup_FinancialApprover18_userid,arup_FinancialApprover19_userid,arup_FinancialApprover20_userid', null,
    //    function (retrievedreq) {
    //        if (retrievedreq != null) {

    //            if (retrievedreq.Ccrm_financialapprover1_userid.Id != null) {
    //                names.push(retrievedreq.Ccrm_financialapprover1_userid.Name); ids.push(retrievedreq.Ccrm_financialapprover1_userid.Id);
    //            }

    //            if (retrievedreq.Ccrm_financialapprover2_userid.Id != null) {
    //                names.push(retrievedreq.Ccrm_financialapprover2_userid.Name); ids.push(retrievedreq.Ccrm_financialapprover2_userid.Id);
    //            }

    //            if (retrievedreq.Ccrm_financialapprover3_userid.Id != null) {
    //                names.push(retrievedreq.Ccrm_financialapprover3_userid.Name); ids.push(retrievedreq.Ccrm_financialapprover3_userid.Id);
    //            }

    //            if (retrievedreq.Ccrm_financialapprover4_userid.Id != null) {
    //                names.push(retrievedreq.Ccrm_financialapprover4_userid.Name); ids.push(retrievedreq.Ccrm_financialapprover4_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover5_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover5_userid.Name); ids.push(retrievedreq.arup_FinancialApprover5_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover6_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover6_userid.Name); ids.push(retrievedreq.arup_FinancialApprover6_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover7_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover7_userid.Name); ids.push(retrievedreq.arup_FinancialApprover7_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover8_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover8_userid.Name); ids.push(retrievedreq.arup_FinancialApprover8_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover9_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover9_userid.Name); ids.push(retrievedreq.arup_FinancialApprover9_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover10_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover10_userid.Name); ids.push(retrievedreq.arup_FinancialApprover10_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover11_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover11_userid.Name); ids.push(retrievedreq.arup_FinancialApprover11_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover12_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover12_userid.Name); ids.push(retrievedreq.arup_FinancialApprover12_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover13_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover13_userid.Name); ids.push(retrievedreq.arup_FinancialApprover13_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover14_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover14_userid.Name); ids.push(retrievedreq.arup_FinancialApprover14_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover15_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover15_userid.Name); ids.push(retrievedreq.arup_FinancialApprover15_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover16_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover16_userid.Name); ids.push(retrievedreq.arup_FinancialApprover16_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover17_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover17_userid.Name); ids.push(retrievedreq.arup_FinancialApprover17_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover18_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover18_userid.Name); ids.push(retrievedreq.arup_FinancialApprover18_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover19_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover19_userid.Name); ids.push(retrievedreq.arup_FinancialApprover19_userid.Id);
    //            }

    //            if (retrievedreq.arup_FinancialApprover20_userid.Id != null) {
    //                names.push(retrievedreq.arup_FinancialApprover20_userid.Name); ids.push(retrievedreq.arup_FinancialApprover20_userid.Id);
    //            }
    //        }
    //    },
    //    errorHandler,
    //    false);

    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/ccrm_arupaccountingcodes(" + acccenid.replace('{', '').replace('}', '') + ")?$select=_arup_financialapprover10_userid_value,_arup_financialapprover11_userid_value,_arup_financialapprover12_userid_value,_arup_financialapprover13_userid_value,_arup_financialapprover14_userid_value,_arup_financialapprover15_userid_value,_arup_financialapprover16_userid_value,_arup_financialapprover17_userid_value,_arup_financialapprover18_userid_value,_arup_financialapprover19_userid_value,_arup_financialapprover20_userid_value,_arup_financialapprover5_userid_value,_arup_financialapprover6_userid_value,_arup_financialapprover7_userid_value,_arup_financialapprover8_userid_value,_arup_financialapprover9_userid_value,_ccrm_financialapprover1_userid_value,_ccrm_financialapprover2_userid_value,_ccrm_financialapprover3_userid_value,_ccrm_financialapprover4_userid_value", false);
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
                if (result != null) {

                    if (result["_ccrm_financialapprover1_userid_value"] != null) {
                        names.push(result["_ccrm_financialapprover1_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_financialapprover1_userid_value"]);
                    }

                    if (result["_ccrm_financialapprover2_userid_value"] != null) {
                        names.push(result["_ccrm_financialapprover2_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_financialapprover2_userid_value"]);
                    }

                    if (result["_ccrm_financialapprover3_userid_value"] != null) {
                        names.push(result["_ccrm_financialapprover3_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_financialapprover3_userid_value"]);
                    }

                    if (result["_ccrm_financialapprover4_userid_value"] != null) {
                        names.push(result["_ccrm_financialapprover4_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_ccrm_financialapprover4_userid_value"]);
                    }

                    if (result["_arup_financialapprover5_userid_value"] != null) {
                        names.push(result["_arup_financialapprover5_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover5_userid_value"]);
                    }

                    if (result["_arup_financialapprover6_userid_value"] != null) {
                        names.push(result["_arup_financialapprover6_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover6_userid_value"]);
                    }

                    if (result["_arup_financialapprover7_userid_value"] != null) {
                        names.push(result["_arup_financialapprover7_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover7_userid_value"]);
                    }

                    if (result["_arup_financialapprover8_userid_value"] != null) {
                        names.push(result["_arup_financialapprover8_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover8_userid_value"]);
                    }

                    if (result["_arup_financialapprover9_userid_value"] != null) {
                        names.push(result["_arup_financialapprover9_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover9_userid_value"]);
                    }

                    if (result["_arup_financialapprover10_userid_value"] != null) {
                        names.push(result["_arup_financialapprover10_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover10_userid_value"]);
                    }

                    if (result["_arup_financialapprover11_userid_value"] != null) {
                        names.push(result["_arup_financialapprover11_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover11_userid_value"]);
                    }

                    if (result["_arup_financialapprover12_userid_value"] != null) {
                        names.push(result["_arup_financialapprover12_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover12_userid_value"]);
                    }

                    if (result["_arup_financialapprover13_userid_value"] != null) {
                        names.push(result["_arup_financialapprover13_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover13_userid_value"]);
                    }

                    if (result["_arup_financialapprover14_userid_value"] != null) {
                        names.push(result["_arup_financialapprover14_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover14_userid_value"]);
                    }

                    if (result["_arup_financialapprover15_userid_value"] != null) {
                        names.push(result["_arup_financialapprover15_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover15_userid_value"]);
                    }

                    if (result["_arup_financialapprover16_userid_value"] != null) {
                        names.push(result["_arup_financialapprover16_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover16_userid_value"]);
                    }

                    if (result["_arup_financialapprover17_userid_value"] != null) {
                        names.push(result["_arup_financialapprover17_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover17_userid_value"]);
                    }

                    if (result["_arup_financialapprover18_userid_value"] != null) {
                        names.push(result["_arup_financialapprover18_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover18_userid_value"]);
                    }

                    if (result["_arup_financialapprover19_userid_value"] != null) {
                        names.push(result["_arup_financialapprover19_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover19_userid_value"]);
                    }

                    if (result["_arup_financialapprover20_userid_value"] != null) {
                        names.push(result["_arup_financialapprover20_userid_value@OData.Community.Display.V1.FormattedValue"]);
                        ids.push(result["_arup_financialapprover20_userid_value"]);
                    }
                }
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();

    //Xrm.WebApi.online.retrieveRecord("ccrm_arupaccountingcode", acccenid, "?$select=_arup_financialapprover10_userid_value,_arup_financialapprover11_userid_value,_arup_financialapprover12_userid_value,_arup_financialapprover13_userid_value,_arup_financialapprover14_userid_value,_arup_financialapprover15_userid_value,_arup_financialapprover16_userid_value,_arup_financialapprover17_userid_value,_arup_financialapprover18_userid_value,_arup_financialapprover19_userid_value,_arup_financialapprover20_userid_value,_arup_financialapprover5_userid_value,_arup_financialapprover6_userid_value,_arup_financialapprover7_userid_value,_arup_financialapprover8_userid_value,_arup_financialapprover9_userid_value,ccrm_arupaccountingcode,_ccrm_financialapprover1_userid_value,_ccrm_financialapprover2_userid_value,_ccrm_financialapprover3_userid_value,_ccrm_financialapprover4_userid_value").then(
    //    function success(result) {
    //        if (result != null) {
                    
    //            if (result["_ccrm_financialapprover1_userid_value"] != null) {
    //                names.push(result["_ccrm_financialapprover1_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_ccrm_financialapprover1_userid_value"]);
    //            }

    //            if (result["_ccrm_financialapprover2_userid_value"] != null) {
    //                names.push(result["_ccrm_financialapprover2_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_ccrm_financialapprover2_userid_value"]);
    //            }

    //            if (result["_ccrm_financialapprover3_userid_value"] != null) {
    //                names.push(result["_ccrm_financialapprover3_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_ccrm_financialapprover3_userid_value"]);
    //            }

    //            if (result["_ccrm_financialapprover4_userid_value"] != null) {
    //                names.push(result["_ccrm_financialapprover4_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_ccrm_financialapprover4_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover5_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover5_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover5_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover6_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover6_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover6_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover7_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover7_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover7_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover8_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover8_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover8_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover9_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover9_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover9_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover10_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover10_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover10_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover11_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover11_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover11_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover12_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover12_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover12_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover13_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover13_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover13_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover14_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover14_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover14_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover15_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover15_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover15_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover16_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover16_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover16_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover17_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover17_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover17_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover18_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover18_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover18_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover19_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover19_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover19_userid_value"]);
    //            }

    //            if (result["_arup_financialapprover20_userid_value"] != null) {
    //                names.push(result["_arup_financialapprover20_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //                ids.push(result["_arup_financialapprover20_userid_value"]);
    //            }
    //        }
    //    },
    //    function (error) {
    //        Xrm.Utility.alertDialog(error.message);
    //    }
    //);

    output.Names = names.filter(function (e) { return e });
    output.Ids = ids.filter(function (e) { return e });
    return output;
}

function getFinanceApproverForCompany(formContext,companyid) {
    var output = new Object();
    var names = new Array();
    var ids = new Array();
    //SDK.REST.retrieveRecord(companyid,
    //    "Ccrm_arupcompany",
    //    'ccrm_financialapprover1_userid,ccrm_financialapprover2_userid,ccrm_financialapprover3_userid,ccrm_financialapprover4_userid,ccrm_financialapprover5_userid,ccrm_financialapprover6_userid,ccrm_financialapprover7_userid,ccrm_financialapprover8_userid,ccrm_financialapprover9_userid,ccrm_financialapprover10_userid,ccrm_financialapprover11_userid,ccrm_financialapprover12_userid',
    //    null,
    //    function (retrievedreq) {
    //        if (retrievedreq != null) {
    //            names.push(retrievedreq.ccrm_financialapprover1_userid.Name);
    //            ids.push(retrievedreq.ccrm_financialapprover1_userid.Id);
    //            names.push(retrievedreq.ccrm_financialapprover2_userid.Name);
    //            ids.push(retrievedreq.ccrm_financialapprover2_userid.Id);
    //            names.push(retrievedreq.ccrm_financialapprover3_userid.Name);
    //            ids.push(retrievedreq.ccrm_financialapprover3_userid.Id);
    //            names.push(retrievedreq.ccrm_financialapprover4_userid.Name);
    //            ids.push(retrievedreq.ccrm_financialapprover4_userid.Id);
    //            names.push(retrievedreq.ccrm_financialapprover5_userid.Name);
    //            ids.push(retrievedreq.ccrm_financialapprover5_userid.Id);
    //            names.push(retrievedreq.ccrm_financialapprover6_userid.Name);
    //            ids.push(retrievedreq.ccrm_financialapprover6_userid.Id);
    //            names.push(retrievedreq.ccrm_financialapprover7_userid.Name);
    //            ids.push(retrievedreq.ccrm_financialapprover7_userid.Id);
    //            names.push(retrievedreq.ccrm_financialapprover8_userid.Name);
    //            ids.push(retrievedreq.ccrm_financialapprover8_userid.Id);
    //            names.push(retrievedreq.ccrm_financialapprover9_userid.Name);
    //            ids.push(retrievedreq.ccrm_financialapprover9_userid.Id);
    //            names.push(retrievedreq.ccrm_financialapprover10_userid.Name);
    //            ids.push(retrievedreq.ccrm_financialapprover10_userid.Id);
    //            names.push(retrievedreq.ccrm_financialapprover11_userid.Name);
    //            ids.push(retrievedreq.ccrm_financialapprover11_userid.Id);
    //            names.push(retrievedreq.ccrm_financialapprover12_userid.Name);
    //            ids.push(retrievedreq.ccrm_financialapprover12_userid.Id);
    //        }
    //    },
    //    errorHandler,
    //    false);

    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/ccrm_arupcompanies(" + companyid.replace('{', '').replace('}', '') + ")?$select=_ccrm_financialapprover10_userid_value,_ccrm_financialapprover11_userid_value,_ccrm_financialapprover12_userid_value,_ccrm_financialapprover1_userid_value,_ccrm_financialapprover2_userid_value,_ccrm_financialapprover3_userid_value,_ccrm_financialapprover4_userid_value,_ccrm_financialapprover5_userid_value,_ccrm_financialapprover6_userid_value,_ccrm_financialapprover7_userid_value,_ccrm_financialapprover8_userid_value,_ccrm_financialapprover9_userid_value", false);
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
                if (result != null) {
                    names.push(result["_ccrm_financialapprover1_userid_value@OData.Community.Display.V1.FormattedValue"]);
                    ids.push(result["_ccrm_financialapprover1_userid_value"]);
                    names.push(result["_ccrm_financialapprover2_userid_value@OData.Community.Display.V1.FormattedValue"]);
                    ids.push(result["_ccrm_financialapprover2_userid_value"]);
                    names.push(result["_ccrm_financialapprover3_userid_value@OData.Community.Display.V1.FormattedValue"]);
                    ids.push(result["_ccrm_financialapprover3_userid_value"]);
                    names.push(result["_ccrm_financialapprover4_userid_value@OData.Community.Display.V1.FormattedValue"]);
                    ids.push(result["_ccrm_financialapprover4_userid_value"]);
                    names.push(result["_ccrm_financialapprover5_userid_value@OData.Community.Display.V1.FormattedValue"]);
                    ids.push(result["_ccrm_financialapprover5_userid_value"]);
                    names.push(result["_ccrm_financialapprover6_userid_value@OData.Community.Display.V1.FormattedValue"]);
                    ids.push(result["_ccrm_financialapprover6_userid_value"]);
                    names.push(result["_ccrm_financialapprover7_userid_value@OData.Community.Display.V1.FormattedValue"]);
                    ids.push(result["_ccrm_financialapprover7_userid_value"]);
                    names.push(result["_ccrm_financialapprover8_userid_value@OData.Community.Display.V1.FormattedValue"]);
                    ids.push(result["_ccrm_financialapprover8_userid_value"]);
                    names.push(result["_ccrm_financialapprover9_userid_value@OData.Community.Display.V1.FormattedValue"]);
                    ids.push(result["_ccrm_financialapprover9_userid_value"]);
                    names.push(result["_ccrm_financialapprover10_userid_value@OData.Community.Display.V1.FormattedValue"]);
                    ids.push(result["_ccrm_financialapprover10_userid_value"]);
                    names.push(result["_ccrm_financialapprover11_userid_value@OData.Community.Display.V1.FormattedValue"]);
                    ids.push(result["_ccrm_financialapprover11_userid_value"]);
                    names.push(result["_ccrm_financialapprover12_userid_value@OData.Community.Display.V1.FormattedValue"]);
                    ids.push(result["_ccrm_financialapprover12_userid_value"]);
                }
             
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();

    //Xrm.WebApi.online.retrieveRecord("ccrm_arupcompany", companyid, "?$select=_ccrm_financialapprover10_userid_value,_ccrm_financialapprover11_userid_value,_ccrm_financialapprover12_userid_value,_ccrm_financialapprover1_userid_value,_ccrm_financialapprover2_userid_value,_ccrm_financialapprover3_userid_value,_ccrm_financialapprover4_userid_value,_ccrm_financialapprover5_userid_value,_ccrm_financialapprover6_userid_value,_ccrm_financialapprover7_userid_value,_ccrm_financialapprover8_userid_value,_ccrm_financialapprover9_userid_value").then(
    //    function success(result) {
    //        if (result != null) {
    //            names.push(result["_ccrm_financialapprover1_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_financialapprover1_userid_value"]);
    //            names.push(result["_ccrm_financialapprover2_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_financialapprover2_userid_value"]);
    //            names.push(result["_ccrm_financialapprover3_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_financialapprover3_userid_value"]);
    //            names.push(result["_ccrm_financialapprover4_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_financialapprover4_userid_value"]);
    //            names.push(result["_ccrm_financialapprover5_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_financialapprover5_userid_value"]);
    //            names.push(result["_ccrm_financialapprover6_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_financialapprover6_userid_value"]);
    //            names.push(result["_ccrm_financialapprover7_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_financialapprover7_userid_value"]);
    //            names.push(result["_ccrm_financialapprover8_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_financialapprover8_userid_value"]);
    //            names.push(result["_ccrm_financialapprover9_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_financialapprover9_userid_value"]);
    //            names.push(result["_ccrm_financialapprover10_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_financialapprover10_userid_value"]);
    //            names.push(result["_ccrm_financialapprover11_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_financialapprover11_userid_value"]);
    //            names.push(result["_ccrm_financialapprover12_userid_value@OData.Community.Display.V1.FormattedValue"]);
    //            ids.push(result["_ccrm_financialapprover12_userid_value"]);
    //        }
    
    //    },
    //    function (error) {
    //        Xrm.Utility.alertDialog(error.message);
    //    }
    //);

    output.Names = names.filter(function (e) { return e });
    output.Ids = ids.filter(function (e) { return e });
    return output;
}

function UserNameCheck(fullName) {
    var result = true;
    //SDK.REST.retrieveMultipleRecords("SystemUser",
    //    "$select=FullName&$filter=FullName eq '" + fullName + "'",
    //    function (results) {
    //        if (results.length > 1) {
    //            result = false;
    //        }
    //    },
    //    errorHandler,
    //    function () { },
    //    false);

    Xrm.WebApi.online.retrieveMultipleRecords("systemuser", "?$select=fullname&$filter=fullname eq '" + fullName + "'").then(
        function success(results) {
            if (results.length > 1) {
                result = false;
            }
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
    return result;
}

function ValidateApproval(formContext,msg, approvaltype) {
    debugger;
    var output = new Object();

    output.differentUser = false;
    output.result = true;
    output.approverIDs = new Array();
    switch (approvaltype) {
        case 'ProjectManagerApproval':
            var approvers = new Array();
            approvers.push(formContext.getAttribute('ccrm_projectmanager_userid').getValue()[0].name);
            output.approverIDs.push(formContext.getAttribute('ccrm_projectmanager_userid').getValue()[0].id);
            approvers.push(formContext.getAttribute('ccrm_projectdirector_userid').getValue()[0].name);
            output.approverIDs.push(formContext.getAttribute('ccrm_projectdirector_userid').getValue()[0].id);

            if (approvers.indexOf(currUserData.FullName) < 0) { /*output.result = confirm(msg);*/
                output.differentUser = true;
            } else output.differentUser = false;
            break;

        case 'GroupLeaderApproval':

        case 'GroupLeader':

            var tmp = getGroupLeaderApprovers(formContext,formContext.getAttribute("ccrm_arupgroupid").getValue()[0].id, formContext.getAttribute('ccrm_arupcompanyid').getValue()[0].id);
            return tmp;
            break;

        case 'AccCenterLeadApproval':

            // limit this approval to Group Leader or nominated delegates or approvers for the relevant Arup company
            var groupLeaderApprovalNeeded = checkGroupLeaderApprovalNeeded(formContext);
            if (groupLeaderApprovalNeeded == true) {
                var temp = getGroupLeaderApprovers(formContext,formContext.getAttribute("ccrm_arupgroupid").getValue()[0].id, formContext.getAttribute('ccrm_arupcompanyid').getValue()[0].id);
                return temp;
            }

            var tmp = getAccountingCentreApprovers(formContext,formContext.context.getUserId(),formContext.getAttribute('ccrm_accountingcentreid').getValue()[0].id, formContext.getAttribute('ccrm_arupcompanyid').getValue()[0].id);
            return tmp;
            break;

        case 'FinanceApproval':
            var tmp = getFinanceApprovers(formContext,formContext.context.getUserId(),formContext.getAttribute('ccrm_accountingcentreid').getValue()[0].id, formContext.getAttribute('ccrm_arupcompanyid').getValue()[0].id);
            return tmp;

        case 'BidDirector':
            var approver = formContext.getAttribute('ccrm_biddirector_userid').getValue()[0].name;
            output.approverIDs.push(formContext.getAttribute('ccrm_biddirector_userid').getValue()[0].id);
            if (currUserData.FullName != approver) { /*output.result = confirm(msg);*/
                output.differentUser = true;
            } else output.differentUser = false;
            break;

        case 'PracticeLeader':

        case 'RegionalPracticeLeader':
            if (formContext.getAttribute('ccrm_practiceleaderid').getValue() == null) { output.differentUser = true }
            else {
                var tmp = getApproverName(formContext.getAttribute('ccrm_practiceleaderid').getValue()[0].id, 'ccrm_practiceleader', 'ccrm_practiceleaderidnew');
                if (currUserData.FullName != tmp.Name) {
                    output.approverIDs.push(tmp.Id); /*output.result = confirm(msg);*/
                    output.differentUser = true;
                } else output.differentUser = false;
            }
            break;

        case 'RegionalCOO':
            var tmp = getApproverName(formContext.getAttribute('ccrm_arupregionid').getValue()[0].id, 'ccrm_arupregion', 'ccrm_chiefoperatingofficerid');
            if (currUserData.FullName != tmp.Name) {
                output.approverIDs.push(tmp.Id); /*output.result = confirm(msg);*/
                output.differentUser = true;
            } else output.differentUser = false;
            break;
    }
    if (output.differentUser) {
        //output.result = confirm(msg);
        var strNoLongerRequired = "1";
        if (formContext.getAttribute('ccrm_approvalnolongerrequired').getValue() != "" &&
            formContext.getAttribute('ccrm_approvalnolongerrequired').getValue() != null)
            strNoLongerRequired = strNoLongerRequired + "1";
        formContext.getAttribute('ccrm_approvalnolongerrequired').setValue(strNoLongerRequired);
        formContext.getAttribute('ccrm_approvalnolongerrequired').setSubmitMode("always");

    }
    return output;
}

function checkGroupLeaderApprovalNeeded(formContext) {

    // check Risk Level & Region of the Opportunity for this approval type
    var opportunityRegion = formContext.getAttribute("ccrm_arupregionid").getValue();
    var opportunityRiskLevel = formContext.getAttribute("ccrm_opportunitytype").getValue();

    if (!!opportunityRegion && !!opportunityRiskLevel) {

        //Australasia-Risk Level 3 or East Asia region-all risk levels
        if (
            (
                (opportunityRegion[0].name.toLowerCase() == (ArupRegionName.Australasia).toLowerCase() || opportunityRegion[0].name.toLowerCase() == (ArupRegionName.Malaysia).toLowerCase())
                && opportunityRiskLevel == BidRiskLevels.Level3
            ) ||
            (opportunityRegion[0].name.toLowerCase() == (ArupRegionName.EastAsia).toLowerCase())
        ) {
            return true;
        }
        else return false;
    }
}

function ValidateApprovalIDs(formContext,msg, approvaltype) {
    var output = new Object();
    output.differentUser = false;
    output.result = true;
    var LoggedUser = formContext.context.getUserId();
    if (formContext.getAttribute('arup_approverleader').getValue() != null) {
        if (formContext.getAttribute('arup_approverleader').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('ccrm_approver1').getValue() != null) {
        if (formContext.getAttribute('ccrm_approver1').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('ccrm_approver2').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('ccrm_approver2').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('ccrm_approver3').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('ccrm_approver3').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('ccrm_approver4').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('ccrm_approver4').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('ccrm_approver5').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('ccrm_approver5').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('ccrm_approver6').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('ccrm_approver6').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('arup_approver7').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('arup_approver7').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('arup_approver8').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('arup_approver8').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('arup_approver9').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('arup_approver9').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('arup_approver10').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('arup_approver10').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('arup_approver11').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('arup_approver11').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('arup_approver12').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('arup_approver12').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('arup_approver13').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('arup_approver13').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('arup_approver14').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('arup_approver14').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('arup_approver15').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('arup_approver15').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('arup_approver16').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('arup_approver16').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('arup_approver17').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('arup_approver17').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('arup_approver18').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('arup_approver18').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('arup_approver19').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('arup_approver19').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (formContext.getAttribute('arup_approver20').getValue() != null && output.differentUser) {
        if (formContext.getAttribute('arup_approver20').getValue()[0].id != LoggedUser)
            output.differentUser = true;
        else
            output.differentUser = false;
    }
    if (output.differentUser) {

        output.result = confirm(msg);
        var strNoLongerRequired = "1";
        if (formContext.getAttribute('ccrm_approvalnolongerrequired').getValue() != "" &&
            formContext.getAttribute('ccrm_approvalnolongerrequired').getValue() != null)
            strNoLongerRequired = strNoLongerRequired + "1";
        formContext.getAttribute('ccrm_approvalnolongerrequired').setValue(strNoLongerRequired);
        formContext.getAttribute('ccrm_approvalnolongerrequired').setSubmitMode("always");

    }
    return output;
}

function resetApprovers() {
}

function SetApproverID(formContext,approverIDs) {
    var i = 1;
    var field = '';
    approverIDs.forEach(function (approverID) {
        field = 'ccrm_approver' + i;
        SetLookupField(formContext,approverID, '', 'systemuser', field);
        formContext.getAttribute(field).setSubmitMode("always");
        i++;
    });
}

// Ribbon Approval Btn click events , formCOntext is primaryControl crmparamter passed from ribbon
function ApprovalButtonClick(formContext,type, approvalType, statusField, userField, dateField) {
    debugger;
    var ackMsg = ApprovalConfirmationMessage(approvalType);
    var alertType;
    if (IsFormValid(formContext)) {
        switch (approvalType) {

            case 'FinanceApproval':
                alertType = 'ERROR';
                break;
            case 'AccCenterLeadApproval':
                alertType = 'ERROR';
                break;
            default:
                alertType = 'WARNING';
                break;

        }

        Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
            '<font size="3" color="#000000"></br></br>' + ackMsg + '</font>',
            [
                {
                    label: "<b>Proceed with Approval</b>",
                    callback: function () {
                        var msg = 'You are about to approve a Bid where you are not listed as approver. \n Do you want to Continue ?';
                        var output = ValidateApproval(formContext,msg, approvalType);
                        approveCallbackAction(formContext,approvalType);
                        cancelAsnycApprovalNotification();
                        formContext.ui.clearFormNotification('CurrentApprovers');
                        setCurrentApproversAsync(formContext);
                        if (currUserData.caltype != 2) {
                            if (MoveToBidDevelopment(formContext)) {
                                moveToNextTrigger = true;
                            }
                        }
                        // formContext.data.save().then(function () {

                        // formContext.getAttribute(statusField).setSubmitMode("dirty");
                        // formContext.getAttribute("ccrm_currentapprovers").setSubmitMode("dirty");
                        // });						
                    },
                    setFocus: false,
                    preventClose: false
                },
                {
                    label: "<b>Do Not Approve</b>",
                    setFocus: true,
                    preventClose: false
                }
            ],
            alertType, 500, 350, '', true);
    }

}

function isApproved(formContext,statusField) {
    if (formContext.getAttribute(statusField).getValue() == '100000001')
        return true;
    else return false;
}

function MoveToBidDevelopment(formContext,approveonRiskChange) {
    var result = false;
    var bidDirectorApproved = false,
        grpLeaderApproved = false,
        pracLeaderApproved = false,
        regcooApproved = false,
        regPracLeadApproval = false;
    if (isApproved(formContext,'ccrm_biddirectorapprovaloptions'))
        bidDirectorApproved = true;
    if (isApproved(formContext,'ccrm_groupleaderapprovaloptions'))
        grpLeaderApproved = true;
    if (isApproved(formContext,'ccrm_practiceleaderapprovaloptions'))
        pracLeaderApproved = true;
    if (isApproved(formContext,'ccrm_regioncooapprovaloptions'))
        regcooApproved = true;

    var regionName, oppType;
    oppType = formContext.getAttribute("ccrm_opportunitytype").getValue();

    if (formContext.getAttribute("ccrm_arupregionid").getValue() != null)
        regionName = formContext.getAttribute("ccrm_arupregionid").getValue()[0].name;

    if (regionName == ArupRegionName.EastAsia) {
        if ((oppType == BidRiskLevels.Level1 && bidDirectorApproved) ||
            (oppType == BidRiskLevels.Level1 && approveonRiskChange)) {
            if (approveonRiskChange) {
                if (formContext.getAttribute('ccrm_biddirectorapprovaloptions').getValue() != '100000001') {
                    formContext.getAttribute('ccrm_biddirectorapprovaloptions').setValue(100000001);
                    formContext.getAttribute("ccrm_biddirectorapprovaloptions").setSubmitMode("always");

                    setTimeout(function () { formContext.data.save(null); }, 500);
                }
            }
            result = true;
        }
        if (((oppType == BidRiskLevels.Level2 || oppType == BidRiskLevels.Level3) && grpLeaderApproved) ||
            ((oppType == BidRiskLevels.Level2 || oppType == BidRiskLevels.Level3) && approveonRiskChange)) {
            if (approveonRiskChange) {
                if (formContext.getAttribute('ccrm_groupleaderapprovaloptions').getValue() != '100000001') {
                    formContext.getAttribute('ccrm_groupleaderapprovaloptions').setValue(100000001);
                    formContext.getAttribute("ccrm_groupleaderapprovaloptions").setSubmitMode("always");

                    setTimeout(function () { formContext.data.save(null); }, 500);
                }
            }
            result = true;
        }
    } else if (regionName == ArupRegionName.Australasia || regionName == ArupRegionName.Malaysia) {
        if (oppType == BidRiskLevels.Level1 && grpLeaderApproved) {
            result = true;
        }
        if ((oppType == BidRiskLevels.Level2 && pracLeaderApproved) ||
            (oppType == BidRiskLevels.Level2 && approveonRiskChange)) {
            if (approveonRiskChange) {
                var triggerSave = false;
                if (formContext.getAttribute('ccrm_practiceleaderapprovaloptions').getValue() != '100000001') {
                    formContext.getAttribute('ccrm_practiceleaderapprovaloptions').setValue(100000001);
                    formContext.getAttribute("ccrm_practiceleaderapprovaloptions").setSubmitMode("always");

                    triggerSave = true;
                }
                if (triggerSave)
                    setTimeout(function () { formContext.data.save(null); }, 500);

            }
            result = true;
        }
        if ((oppType == BidRiskLevels.Level3 && regcooApproved) ||
            (oppType == BidRiskLevels.Level3 && approveonRiskChange)) {
            if (approveonRiskChange) {
                var triggerSave = false;
                if (formContext.getAttribute('ccrm_regionalpracticeleaderapprovaloptions').getValue() != '100000001') {
                    formContext.getAttribute('ccrm_regionalpracticeleaderapprovaloptions').setValue(100000001);
                    formContext.getAttribute("ccrm_regionalpracticeleaderapprovaloptions").setSubmitMode("always");

                    triggerSave = true;
                }
                if (formContext.getAttribute('ccrm_regioncooapprovaloptions').getValue() != '100000001') {
                    formContext.getAttribute('ccrm_regioncooapprovaloptions').setValue(100000001);
                    formContext.getAttribute("ccrm_regioncooapprovaloptions").setSubmitMode("always");

                    triggerSave = true;
                }

                if (triggerSave)
                    setTimeout(function () { formContext.data.save(null); }, 500);

            }
            result = true;
        }
    } else {
        result = true;
    }

    return result;
}

// ON CHANGE FUNCTIONS
// FINANCIAL ON CHANGE
function ccrm_confidential_onchange(formContext,mode) {

    if (mode != 0)
        formContext = formContext.getFormContext();

    var isConfidential;

    switch (mode) {

        case 0: // on form load
            isConfidential = (formContext.getAttribute("ccrm_confidentialoptionset").getValue() == 1 ? true : false);
            break;
        case 1: // ccrm_confidentialoptionset change - from BPF
            isConfidential = (formContext.getAttribute("ccrm_confidentialoptionset").getValue() == 1 ? true : false);
            if ((isConfidential && !formContext.getAttribute("ccrm_confidential").getValue()) ||
                (!isConfidential && formContext.getAttribute("ccrm_confidential").getValue())) {
                formContext.getAttribute("ccrm_confidential").setValue(isConfidential);
            }
            break;
        case 2: // ccrm_confidential change - from the form
            isConfidential = (formContext.getAttribute("ccrm_confidential").getValue());
            if (isConfidential && formContext.getAttribute("ccrm_confidentialoptionset").getValue() != 1) {
                formContext.getAttribute("ccrm_confidentialoptionset").setValue(1);
            }
            else if (!isConfidential && formContext.getAttribute("ccrm_confidentialoptionset").getValue() == 1) {
                formContext.getAttribute("ccrm_confidentialoptionset").setValue(2);
            }
            break;
    }

    if (isConfidential) {
        Notify.addOpp("<span style='font-weight:bold; color: white'>Confidential Opportunity</span>", "WARNING", "confidentialopp");
    }
    else { Notify.remove("confidentialopp"); }

    if (mode == 0) return;

    if (isConfidential) {

        Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
            '<font size="3" color="#000000"></br>Does this opportunity definitely need to be marked as confidential?</br></br>Only use the confidential status if Arup has to keep its involvement in this opportunity confidential to external parties.</br></br></b>Confidential opportunities are reported to your Region’s COO and may not appear in Arup Projects, or reports about future workload in your Sector, Group or Business.</font>',
            [
                { label: "<b>Got it</b>", setFocus: true },
            ],
            "WARNING", 600, 380, '', true);
    }
}

function ccrm_estimatedvalue_num_onchange(executionContext) {
   var formContext = executionContext.getFormContext();
    feeIncomeCheck(formContext);
    if (formContext.getAttribute('ccrm_estimatedvalue_num').getValue() != null) {
        calcRecalcIncome(formContext);
    }
}

function ccrm_estexpenseincome_num_onchange(executionContext) {
    debugger;
    var formContext = executionContext.getFormContext();
    calcRecalcIncome(formContext);
}

function closeprobability_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    sync_values_onchange(formContext,'closeprobability', 'ccrm_closeprobability_synced');
    calcRecalcIncome(formContext);
}

function ccrm_probabilityofprojectproceeding_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    calcRecalcIncome(formContext);
}

function ccrm_estprojectresourcecosts_num_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    calcRecalcCosts(formContext);
}

function arup_importedsalarycost_num_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    calcRecalcCosts(formContext);
}

function arup_importedstaffohcost_num_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    calcRecalcCosts(formContext);
}

function SetGrossExpense(formContext) {
    var expenses = formContext.getAttribute("arup_expenses_num").getValue();
    var subConFees = formContext.getAttribute("ccrm_estprojectsubcontractorfees_num").getValue();
    var contingency = formContext.getAttribute("ccrm_contingency").getValue();
    var importedExpense = formContext.getAttribute("arup_importedexpenses_num").getValue();

    var grossExpenses = expenses + subConFees + contingency + importedExpense;
    formContext.getAttribute("ccrm_estprojectexpenses_num").setValue(grossExpenses);
    formContext.getAttribute("ccrm_estprojectexpenses_num").setSubmitMode("always");
}

function ccrm_estprojectsubcontractorfees_num_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    SetGrossExpense(formContext);
    calcRecalcCosts(formContext);
}

function ccrm_contingency_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    SetGrossExpense(formContext);
    calcRecalcCosts(formContext);
}

function ccrm_estprojectstaffoverheadsrate_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    calcRecalcCosts(formContext);
}

function ccrm_anticipatedprojectcashflow_num_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    calcMaxCashFlowDeficit(formContext);
}

function arup_expenses_num_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    SetGrossExpense(formContext);
    calcRecalcCosts(formContext);
}

function arup_importedexpenses_num_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    SetGrossExpense(formContext);
    calcRecalcCosts(formContext);
}

function ccrm_estprojectexpenses_num_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    calcRecalcCosts(formContext);
}

//FINANCIAL FUNCTIONS
//function to calculate income and associated fields if an income related field changes
function calcRecalcIncome(formContext) {
    calcTotalIncome(formContext);
    calcFactoredIncome(formContext); // sets - "ccrm_proj_factoredincome_num"
    calcEstProjectProfit(formContext);
    // sets - "ccrm_estprojectprofit_num", "ccrm_profitasapercentageoffeedec", "ccrm_proj_factoredprofit_num"
    calcFactoredNetReturnToArup(formContext); // sets - "ccrm_factorednetreturntoarup_num"
}

function calcRecalcCosts(formContext) {
    calcEstProjStaffOverheadsValue(formContext); // sets - "ccrm_estprojectoverheads_num"
    calcGrossStaffCost(formContext); // sets- arup_grossstaffcost_num
    calcTotalCosts(formContext); // sets - "ccrm_projecttotalcosts_num"
    calcEstProjectProfit(formContext); // sets - "ccrm_proj_factoredincome_num"
    calcFactoredNetReturnToArup(formContext); // sets - "ccrm_factorednetreturntoarup_num"
}

function calcTotalCosts(formContext) {
    var grossExpenses = formContext.getAttribute("ccrm_estprojectexpenses_num").getValue();
    var grossStaffCost = formContext.getAttribute("arup_grossstaffcost_num").getValue();

    if (grossExpenses == null) grossExpenses = 0;
    if (grossStaffCost == null) grossStaffCost = 0;

    var totalCosts = grossStaffCost + grossExpenses;
    if (formContext.getAttribute("ccrm_projecttotalcosts_num").getValue() != totalCosts) {
        formContext.getAttribute("ccrm_projecttotalcosts_num").setValue(totalCosts);
        formContext.getAttribute("ccrm_projecttotalcosts_num").setSubmitMode("always");
    }
}

function calcGrossStaffCost(formContext) {
    var salaryCosts = formContext.getAttribute("ccrm_estprojectresourcecosts_num").getValue();
    var staffOverheads = formContext.getAttribute("ccrm_estprojectoverheads_num").getValue();
    var importedSalaryCost = formContext.getAttribute("arup_importedsalarycost_num").getValue();
    var importedStaffOHCost = formContext.getAttribute("arup_importedstaffohcost_num").getValue();


    if (salaryCosts == null) salaryCosts = 0;
    if (staffOverheads == null) staffOverheads = 0;
    if (importedSalaryCost == null) importedSalaryCost = 0;
    if (importedStaffOHCost == null) importedStaffOHCost = 0;

    var grossStaffCost = salaryCosts + staffOverheads + importedSalaryCost + importedStaffOHCost;
    if (formContext.getAttribute("arup_grossstaffcost_num").getValue() != grossStaffCost) {
        formContext.getAttribute("arup_grossstaffcost_num").setValue(grossStaffCost);
        formContext.getAttribute("arup_grossstaffcost_num").setSubmitMode("always");
    }
}

function calcBidCosts(executionContext) {
    var formContext = executionContext.getFormContext();
    var salaryCosts = formContext.getAttribute("ccrm_salarycost_num").getValue();
    var staffOverheads = formContext.getAttribute("ccrm_staffoverheadspercent").getValue() / 100;
    var grossExpenses = formContext.getAttribute("ccrm_grossexpenses_num").getValue();
    if (salaryCosts == null) salaryCosts = 0;
    if (staffOverheads == null) staffOverheads = 0;
    if (grossExpenses == null) grossExpenses = 0;

    var totalCosts = salaryCosts + (salaryCosts * staffOverheads) + grossExpenses;
    if (formContext.getAttribute("ccrm_staffoverheads_num").getValue() != (salaryCosts * staffOverheads)) {
        formContext.getAttribute("ccrm_staffoverheads_num").setValue(salaryCosts * staffOverheads);
        formContext.getAttribute("ccrm_staffoverheads_num").setSubmitMode("always");
    }
    if (formContext.getAttribute("ccrm_totalbidcost_num").getValue() != totalCosts) {
        formContext.getAttribute("ccrm_totalbidcost_num").setValue(totalCosts);
        formContext.getAttribute("ccrm_totalbidcost_num").setSubmitMode("always");
    }
    calcFactoredNetReturnToArup(formContext);
}

//function to calculate ProfitAsPercentageFee
function calcEstProjectProfit(formContext) {
    var totalEstProjectProfit = 0;
    var Projectfee = formContext.getAttribute("ccrm_estimatedvalue_num").getValue();
    var Expenses = formContext.getAttribute("ccrm_estprojectexpenses_num").getValue();
    var GrossStaffCosts = formContext.getAttribute("arup_grossstaffcost_num").getValue();
    var ProjectForecastExpenseIncome = formContext.getAttribute("ccrm_estexpenseincome_num").getValue();
    var result = formContext.getAttribute("ccrm_estprojectprofit_num").getValue();

    totalEstProjectProfit = (Projectfee + ProjectForecastExpenseIncome - (GrossStaffCosts + Expenses));
    if (formContext.getAttribute("ccrm_estprojectprofit_num").getValue() != totalEstProjectProfit) {
        formContext.getAttribute("ccrm_estprojectprofit_num").setValue(totalEstProjectProfit);
        formContext.getAttribute("ccrm_estprojectprofit_num").setSubmitMode("always");
    }
    calcProfitAsPercentageFee(formContext,totalEstProjectProfit, Projectfee, ProjectForecastExpenseIncome);
}

//function to calculate the profit as a percentage of Fee
function calcProfitAsPercentageFee(formContext,totalEstProjectProfit, projectFee, expIncome) {
    var result = 0;

    // check if the field is present in the form
    if ((projectFee > 0) || (expIncome > 0)) { // Do the calculation
        result = ((totalEstProjectProfit * 100) / (projectFee + expIncome));
    }
    //set the result value
    if (formContext.getAttribute("ccrm_profitasapercentageoffeedec").getValue() != result) {
        formContext.getAttribute("ccrm_profitasapercentageoffeedec").setValue(result);
        formContext.getAttribute("ccrm_profitasapercentageoffeedec").setSubmitMode("always");
    }
    //set the FactoredProfit
    calcFactoredProfit(formContext,result, formContext.getAttribute("ccrm_proj_factoredincome_num").getValue());
}

function calcFactoredProfit(formContext,profitAsPercentageFee, factoredIncome) {
    var result = 0;
    if (formContext.getAttribute("ccrm_profitasapercentageoffeedec").getValue() > 0 && factoredIncome > 0) {
        result = formContext.getAttribute("ccrm_estprojectprofit_num").getValue() *
            ((formContext.getAttribute("closeprobability").getValue() / 100) *
                (formContext.getAttribute("ccrm_probabilityofprojectproceeding").getValue() / 100));
        if (formContext.getAttribute("ccrm_proj_factoredprofit_num").getValue() != result) {
            formContext.getAttribute("ccrm_proj_factoredprofit_num").setValue(result);
            formContext.getAttribute("ccrm_proj_factoredprofit_num").setSubmitMode("always");
        }
    } else if (formContext.getAttribute("ccrm_proj_factoredprofit_num").getValue() != result) {
        //set the FactoredIncome result
        formContext.getAttribute("ccrm_proj_factoredprofit_num").setValue(result);
        formContext.getAttribute("ccrm_proj_factoredprofit_num").setSubmitMode("always");
    }
}

function calcTotalIncome(formContext) {
    var feeIncome = formContext.getAttribute("ccrm_estimatedvalue_num").getValue();
    var expenseIncome = formContext.getAttribute("ccrm_estexpenseincome_num").getValue();
    if (feeIncome == null) feeIncome = 0;
    if (expenseIncome == null) expenseIncome = 0;
    var totalIncome = feeIncome + expenseIncome;
    if (formContext.getAttribute("ccrm_projecttotalincome_num").getValue() != totalIncome) {
        formContext.getAttribute("ccrm_projecttotalincome_num").setValue(totalIncome);
        formContext.getAttribute("ccrm_projecttotalincome_num").setSubmitMode("always");
    }
}

//function to calcuate Factored Income
function calcFactoredIncome(formContext) {
    var estimatedValue_num = formContext.getAttribute("ccrm_projecttotalincome_num").getValue();
    var probabilityOfProjectProceeding = formContext.getAttribute("ccrm_probabilityofprojectproceeding").getValue();
    var closeProbability = formContext.getAttribute("closeprobability").getValue();
    var result = 0;

    //check for null values
    if (estimatedValue_num == null) {
        estimatedValue_num = 0;
    }
    if (probabilityOfProjectProceeding == null) {
        probabilityOfProjectProceeding = 0;
    }
    if (closeProbability == null) {
        closeProbability = 0;
    }

    probabilityOfProjectProceeding = probabilityOfProjectProceeding / 100;
    closeProbability = closeProbability / 100;
    result = estimatedValue_num * probabilityOfProjectProceeding * closeProbability;
    //set the FactoredIncome result
    if (formContext.getAttribute("ccrm_proj_factoredincome_num").getValue() != result) {
        formContext.getAttribute("ccrm_proj_factoredincome_num").setValue(result);
        formContext.getAttribute("ccrm_proj_factoredincome_num").setSubmitMode("always");
    }
}

function calcFactoredNetReturnToArup_ec(executionContext) {
    var formContext = executionContext.getFormContext();
    calcFactoredNetReturnToArup(formContext);
}

//function to calculate FacturedNetReturnToArup
function calcFactoredNetReturnToArup(formContext) {

    var ProjectFee = formContext.getAttribute("ccrm_estimatedvalue_num").getValue();
    var ProjectProcedingProb = formContext.getAttribute("ccrm_probabilityofprojectproceeding").getValue();
    var ProbWin = formContext.getAttribute("closeprobability").getValue();
    var profitAsPercentOfFee = formContext.getAttribute("ccrm_profitasapercentageoffeedec").getValue();
    var totalIncome = formContext.getAttribute("ccrm_projecttotalincome_num").getValue();
    var totalBidCost = formContext.getAttribute("ccrm_totalbidcost_num").getValue();
    var totalProfit = formContext.getAttribute("ccrm_estprojectprofit_num").getValue();
    var result = 0;
    if (ProjectProcedingProb != null && ProbWin != null && profitAsPercentOfFee != null && totalIncome)
        result = totalProfit * (ProjectProcedingProb / 100) * (ProbWin / 100);

    if (formContext.getAttribute("ccrm_factorednetreturntoarup_num").getValue() != result) {
        formContext.getAttribute("ccrm_factorednetreturntoarup_num").setValue(result);
        formContext.getAttribute("ccrm_factorednetreturntoarup_num").setSubmitMode("always");
    }

    if (totalBidCost != null && totalBidCost != 0 && formContext.getAttribute("ccrm_ratfactnetreturntoarupnetarupbidcost_num").getValue() != (result / totalBidCost)) {
        formContext.getAttribute("ccrm_ratfactnetreturntoarupnetarupbidcost_num").setValue(result / totalBidCost);
        formContext.getAttribute("ccrm_ratfactnetreturntoarupnetarupbidcost_num").setSubmitMode("always");
    }
    else if (formContext.getAttribute("ccrm_ratfactnetreturntoarupnetarupbidcost_num").getValue() != 0) {
        formContext.getAttribute("ccrm_ratfactnetreturntoarupnetarupbidcost_num").setValue(0);
        formContext.getAttribute("ccrm_ratfactnetreturntoarupnetarupbidcost_num").setSubmitMode("always");
    }
}

function calcEstProjStaffOverheadsValue(formContext) {

    var salary = formContext.getAttribute("ccrm_estprojectresourcecosts_num").getValue();
    var staffoverheadspercent = formContext.getAttribute("ccrm_estprojectstaffoverheadsrate").getValue();
    var calcSOH = 0;

    if (salary > 0 && staffoverheadspercent > 0)
        var calcSOH = (staffoverheadspercent / 100) * salary;
    //set the value for Project Staff Overheads
    if (formContext.getAttribute("ccrm_estprojectoverheads_num").getValue() != calcSOH) {
        formContext.getAttribute("ccrm_estprojectoverheads_num").setValue(calcSOH);
        formContext.getAttribute("ccrm_estprojectoverheads_num").setSubmitMode("always");
    }

}

//function to calculate the est proj Staff Overheads Rate
function calcEstProjStaffOverheadsRate(executionContext) {
    var formContext = executionContext.getFormContext();
    var staffoverheads = formContext.getAttribute("ccrm_estprojectoverheads_num");
    var salary = formContext.getAttribute("ccrm_estprojectresourcecosts_num");
    var result = formContext.getAttribute("ccrm_estprojectstaffoverheadsrate");
    // check if the field is present in the form
    if (salary.getValue() > 0 && staffoverheads.getValue() > 0) { // Do the calculation
        var c = (staffoverheads.getValue() / salary.getValue()) * 100;
        if (result.getValue() != c) {
            result.setValue(c);
            formContext.getAttribute("ccrm_estprojectstaffoverheadsrate").setSubmitMode("always");
        }
    } else if (formContext.getAttribute("ccrm_estprojectstaffoverheadsrate").getValue() != 0) {
        formContext.getAttribute("ccrm_estprojectstaffoverheadsrate").setValue(0);
        formContext.getAttribute("ccrm_estprojectstaffoverheadsrate").setSubmitMode("always");
    }
}

function calcMaxCashFlowDeficit(formContext) {
    var cashflow = formContext.getAttribute("ccrm_anticipatedprojectcashflow_num").getValue();
    var feeIncome = formContext.getAttribute("ccrm_projecttotalincome_num").getValue();
    var calcFlowDeficitOption = formContext.getAttribute("ccrm_calccashflowdeficit").getValue();
    // Calculates 25% of Fee Income
    var calcDeficit = feeIncome * 0.25;

    if (Math.abs(cashflow) > calcDeficit &&
        cashflow != null &&
        feeIncome != null &&
        calcFlowDeficitOption != true &&
        formContext.getAttribute("ccrm_calccashflowdeficit").getValue() != true) {
        formContext.getAttribute("ccrm_calccashflowdeficit").setValue(true);
    } else if (calcFlowDeficitOption == true && Math.abs(cashflow) < calcDeficit && formContext.getAttribute("ccrm_calccashflowdeficit").getValue() != false) {
        formContext.getAttribute("ccrm_calccashflowdeficit").setValue(false);
    }
}

//Date: 30/03/2016
//Phase 1.1 - BAU Release sync from October 2015
//Enhancement to allow Fee Income as 0 when Australasia region and Procurement Type is Framework/Panel Appointment
function feeIncomeCheck(formContext) {
    if ((formContext.getAttribute("ccrm_estimatedvalue_num").getValue() == 0) &&
        (formContext.getAttribute("ccrm_charitablework").getValue() == true) &&
        (formContext.getAttribute("ccrm_arupbusinessid").getValue()[0].name == 'Charity & Community')) {
        formContext.ui.clearFormNotification("FEEzerovalcheck");
    } else if ((formContext.getAttribute("ccrm_estimatedvalue_num").getValue() == 0) &&
        (formContext.getAttribute('ccrm_arupregionid').getValue()[0].name == "Australasia Region"
        || formContext.getAttribute('ccrm_arupregionid').getValue()[0].name == "Malaysia Region"
        ) &&
        (formContext.getAttribute('ccrm_contractarrangement').getValue() == 2)) {
        formContext.ui.clearFormNotification("FEEzerovalcheck");
    } else if ((formContext.getAttribute("ccrm_estimatedvalue_num").getValue() == 0) && (formContext.getAttribute('arup_opportunitytype').getValue() == '770000005')) {
        formContext.ui.clearFormNotification("FEEzerovalcheck");
    }
    else {
        if (formContext.getAttribute("ccrm_estimatedvalue_num").getValue() == 0 && formContext.getAttribute("ccrm_estimatedvalue_num").getValue() != null) {
            formContext.ui.setFormNotification("The Fee Income cannot be set to 0, please update the Fee Income", "WARNING", "FEEzerovalcheck");
            formContext.getAttribute("ccrm_estimatedvalue_num").setValue(null);
            formContext.getAttribute("ccrm_estimatedvalue_num").fireOnChange();
        } else {
            formContext.ui.clearFormNotification("FEEzerovalcheck");
        }
    }
}

function FeeValueRisk(formContext) {
    var FeeBase = formContext.getAttribute("ccrm_estimatedvalue_num_synced").getValue();
    var TrackC = '200003';
    var F = '5000000';
    var E = formContext.getAttribute("exchangerate").getValue();
    var R = FeeBase / E;

    if (R >= F) {
        ShowPickListItem(formContext,"ccrm_opportunitytype", "200003");
        formContext.getAttribute("ccrm_opportunitytype").setValue(TrackC);
        formContext.data.entity.attributes.get("ccrm_opportunitytype").setSubmitMode("always");
        formContext.data.entity.attributes.get("ccrm_estimatedvalue_num_synced").setSubmitMode("always");
        formContext.data.entity.attributes.get("estimatedvalue").setSubmitMode("always");
    }
}

// GENERIC FUNCTIONS
function ShowPickListItem(formContext,listID, value) {
    var optionsetControl = formContext.ui.controls.get(listID);
    var options = optionsetControl.getAttribute().getOptions();
    //loop through the options and if it matches the value passed then show it 

    for (var i = 0; i < options.length - 1; i++) {
        //check if the optionsetvalue matches the one passed
        if (options[i].value == value) {
            optionsetControl.addOption(options[i]);
        }
    }
}

function sync_values_onchange(formContext,sourceField, destField) {
    formContext.getAttribute(destField).setValue(formContext.getAttribute(sourceField).getValue());
}

// Similar Bid button,

function SimilarBidsDuplicate() {
    var paramstr = '&business=';
    paramstr += (Xrm.Page.getAttribute('ccrm_arupbusinessid').getValue() != null)
        ? Xrm.Page.getAttribute('ccrm_arupbusinessid').getValue()[0].id
        : '';
    paramstr += '&projcountry=';
    paramstr += (Xrm.Page.getAttribute('ccrm_projectlocationid').getValue() != null)
        ? Xrm.Page.getAttribute('ccrm_projectlocationid').getValue()[0].id
        : '';
    paramstr += '&region=';
    paramstr += (Xrm.Page.getAttribute('ccrm_arupregionid').getValue() != null)
        ? Xrm.Page.getAttribute('ccrm_arupregionid').getValue()[0].id
        : '';
    paramstr += '&id=' + Xrm.Page.data.entity.getId();

    var pageInput = {
        pageType: "webresource",
        webresourceName: "ccrm_duplicatebids",
        data: paramstr

    };
    var navigationOptions = {
        target: 2,
        width: 1000,
        height: 650,
        position: 1
    };
    Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
        function success() {
            formContext.data.entity.save();
        },
        function error() {
        }
    );
}



function CallbackFunction(returnValue) { }

// State Country lookup filter code - starts
function getCountryManagerAndCategory(formContext,countryID) {
    //SDK.REST.retrieveRecord(countryID, "Ccrm_country", 'Ccrm_RiskRating', null,
    //    function (retrievedreq) {
    //        if (retrievedreq != null) {
    //            var countryCatCode = (retrievedreq.Ccrm_RiskRating != null) ? retrievedreq.Ccrm_RiskRating.Value : null;
    //            formContext.getAttribute("ccrm_countrycategory").setValue(countryCatCode);
    //            formContext.getAttribute("ccrm_countrycategory").setSubmitMode("always");
    //        }
    //    }, errorHandler, false);

    Xrm.WebApi.online.retrieveRecord("ccrm_country", countryID, "?$select=ccrm_riskrating").then(
        function success(result) {
            var ccrm_riskrating = result["ccrm_riskrating"]; //(retrievedreq.Ccrm_RiskRating != null) ? retrievedreq.Ccrm_RiskRating.Value : null;
            formContext.getAttribute("ccrm_countrycategory").setValue(ccrm_riskrating);
            formContext.getAttribute("ccrm_countrycategory").setSubmitMode("always");

        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
}

function projectcountry_onchange_ec(executionContext, fromformload) {
    var formContext = executionContext.getFormContext();
    projectcountry_onchange(formContext, fromformload)
}

function projectcountry_onchange(formContext,fromformload) {
     var CountryName = '';

    var coutryid = formContext.getAttribute('ccrm_projectlocationid').getValue();

    if (coutryid != null && coutryid.length > 0) {

        CountryName = coutryid[0].name + '';
        CountryName = CountryName.toUpperCase();

        if (CountryName == 'INDIA' || CountryName == 'CANADA' || CountryName == 'UNITED STATES OF AMERICA') {

            if (!fromformload) {
                formContext.getAttribute("ccrm_arupcompanyid").setValue(null);
                formContext.getAttribute("ccrm_accountingcentreid").setValue(null);
            }
            else if (formContext.getAttribute("ccrm_arupcompanyid").getValue() != null && CountryName == 'INDIA') {

                var companyId = formContext.getAttribute("ccrm_arupcompanyid").getValue()[0].id;

                //var retrievedreq;
                if (companyId != null) {
                    var companyCode = fetchCompanyCode(formContext,companyId);
                    //SDK.REST.retrieveRecord(companyId, "Ccrm_arupcompany", 'Ccrm_ArupCompanyCode', null, function (responseData) { retrievedreq = responseData; }, errorHandler, false);
                }

                setTimeout(function () {
                    if (companyCode != null && companyCode != "55" && companyCode != "75") {
                        formContext.getAttribute("ccrm_arupcompanyid").setValue(null);
                        formContext.getAttribute("ccrm_accountingcentreid").setValue(null);
                        var fieldName = "ccrm_arupcompanyid";
                        formContext.getControl(fieldName).addPreSearch(function () { IndiaCompanyFilter(formContext); });
                    }
                }, 1000);
            }
        }

        getCountryManagerAndCategory(formContext,formContext.getAttribute("ccrm_projectlocationid").getValue()[0].id);
        // set proj country region
        if (!fromformload) {
            var projcountryregion = getCountryregion(formContext.getAttribute("ccrm_projectlocationid").getValue()[0].id);
            //if (projcountryregion != null) {
            //    SetLookupField(formContext,projcountryregion.Id, projcountryregion.Name, 'ccrm_arupregion', 'ccrm_projectcountryregionid');
            //    formContext.getAttribute("ccrm_projectcountryregionid").fireOnChange();
            //}

            formContext.getAttribute("ccrm_arupusstateid").setValue(null);
            var fieldName = "ccrm_arupcompanyid";
            formContext.getControl(fieldName).addPreSearch(function () { IndiaCompanyFilter(formContext); });
        }
    }
}

function fetchCompanyCode(formContext,companyid) {

    var companyCode;
    companyid = companyid.replace('{', '').replace('}', '');

    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v8.2/ccrm_arupcompanies(" + companyid + ")?$select=ccrm_arupcompanycode", true);
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
                var companyCode = result["ccrm_arupcompanycode"];
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
    return companyCode;
}

function isamericaregion(CountryName) {
    var result = false;
    //if (formContext.ui.getFormType() != 1) {
    CountryName = CountryName.toUpperCase();
    if (CountryName == "UNITED STATES" || CountryName == "UNITED STATES OF AMERICA" || CountryName == "CANADA")
        result = true;
    //}
    return result;
}

function getCountryregion(countryID) {
    debugger;
   // var result = null;

    //SDK.REST.retrieveRecord(countryID, 'Ccrm_country', 'ccrm_arupregionid', null,
    //    function (retrievedreq) {
    //        if (retrievedreq != null)
    //            result = (retrievedreq.ccrm_arupregionid != null) ? retrievedreq.ccrm_arupregionid : null;
    //    },
    //    errorHandler,
    //    false
    //);

    Xrm.WebApi.online.retrieveRecord("ccrm_country", countryID, "?$select=_ccrm_arupregionid_value").then(
        function success(result) {
            if (result != null)
                var projcountryregion = result["_ccrm_arupregionid_value"];

            if (projcountryregion != null) {
                SetLookupField(formContext, result["_ccrm_arupregionid_value"], result["_ccrm_arupregionid_value@OData.Community.Display.V1.FormattedValue"], 'ccrm_arupregion', 'ccrm_projectcountryregionid');
                formContext.getAttribute("ccrm_projectcountryregionid").fireOnChange();
            }
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );

   // return result;
}

// project state/province on change event
function USStateLookupPreFilter(executionContext) {
    var formContext = executionContext.getFormContext();

    var stateprovinceid = formContext.getAttribute('ccrm_arupusstateid').getValue();

    if (stateprovinceid != null && stateprovinceid.length > 0) {

        var StateId = stateprovinceid[0].id;
        var StateName = stateprovinceid[0].name + '';
        var fieldName = 'ccrm_arupcompanyid';
        if (isamericaregion(formContext.getAttribute("ccrm_projectlocationid").getValue()[0].name)) {
            //if (StateName.toUpperCase() != 'TEXAS') {
            formContext.getAttribute('ccrm_accountingcentreid').setValue(null);
            //SDK.REST.retrieveRecord(StateId, "Ccrm_arupusstate", 'ccrm_companyid', null,
            //    function (retrievedreq) {
            //        if (retrievedreq.ccrm_companyid.Id != null) {
            //            var Id = retrievedreq.ccrm_companyid.Id;
            //            if (Id.indexOf('{') == -1)
            //                Id = '{' + Id;
            //            if (Id.indexOf('}') == -1)
            //                Id = Id + '}';
            //            Id = Id.toUpperCase();

            //            var lookupValue = new Array();
            //            lookupValue[0] = new Object();
            //            lookupValue[0].id = Id;
            //            lookupValue[0].name = retrievedreq.ccrm_companyid.Name;
            //            lookupValue[0].entityType = 'ccrm_arupcompany';
            //            formContext.getAttribute('ccrm_arupcompanyid').setValue(lookupValue);
            //            formContext.getAttribute("ccrm_arupcompanyid").fireOnChange();
            //            // show noticiation
            //            formContext.ui.setFormNotification('Please select an Accounting Centre for the selected US State', "WARNING", "statechangefieldreq");
            //            setTimeout(function () { formContext.ui.clearFormNotification("statechangefieldreq"); }, 10000);
            //            formContext.getControl('ccrm_accountingcentreid').setFocus(true);
            //        }
            //    }, errorHandler, false);

            Xrm.WebApi.online.retrieveRecord("ccrm_arupusstate", StateId, "?$select=_ccrm_companyid_value").then(
                function success(result) {
                    if (result["_ccrm_companyid_value"] != null) {
                        var Id = result["_ccrm_companyid_value"];
                        if (Id.indexOf('{') == -1)
                            Id = '{' + Id;
                        if (Id.indexOf('}') == -1)
                            Id = Id + '}';
                        Id = Id.toUpperCase();
                        SetLookupField(formContext, Id, result["_ccrm_companyid_value@OData.Community.Display.V1.FormattedValue"], result["_ccrm_companyid_value@Microsoft.Dynamics.CRM.lookuplogicalname"], 'ccrm_arupcompanyid');
                        formContext.getAttribute("ccrm_arupcompanyid").fireOnChange();
                        // show noticiation
                        formContext.ui.setFormNotification('Please select an Accounting Centre for the selected US State', "WARNING", "statechangefieldreq");
                        setTimeout(function () { formContext.ui.clearFormNotification("statechangefieldreq"); }, 10000);
                        formContext.getControl('ccrm_accountingcentreid').setFocus(true);
                    }
                },
                function (error) {
                    Xrm.Utility.alertDialog(error.message);
                }
            );
        }
    }
}

function IndiaCompanyFilter(formContext) {
    var fieldName = "ccrm_arupcompanyid";
    var CountryName = formContext.getAttribute("ccrm_projectlocationid").getValue()[0].name + '';
    if (CountryName.toUpperCase() == 'INDIA') {
        var fetch =
            "<filter type='or'>" +
            "<condition attribute='ccrm_arupcompanycode' operator='like' value='%55%' />" +
            "<condition attribute='ccrm_arupcompanycode' operator='like' value='%75%' />" +
            "</filter>";
        formContext.getControl(fieldName).addCustomFilter(fetch);
    } else {
        var fetch =
            "<filter type='or'>" +
            "<condition attribute='ccrm_arupcompanycode' operator='like' value='%%' />" +
            "</filter>";
        formContext.getControl(fieldName).addCustomFilter(fetch);
    }
}

//Set short title - starts
function name_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("name").getValue() != null) {
        var x = formContext.getAttribute("name").getValue();
        var y = x.replace(/;/g, ' ');
        if (formContext.getAttribute("ccrm_shorttitle").getValue() == null) {
            setShortTitle(formContext,y);
        }
    }
}

function setShortTitle(formContext,s) {
    if (s != null) {
        var strName = s;
        formContext.getAttribute("ccrm_shorttitle").setValue(strName.substring(0, 30));
    }
}

var selectedCompanyCode = '';

// Apply filter to Acc Center  - starts
function ccrm_arupcompanyid_onchange(executionContext) {

    var formContext = executionContext.getFormContext();
    var accCenterFilterCode = '';
    var companyvalid = '';
    var companyval = formContext.getAttribute("ccrm_arupcompanyid").getValue();
    if (companyval != null && companyval.length > 0) {

        formContext.getControl('ccrm_accountingcentreid').removePreSearch(() => AccCentreAddLookupFilter(formContext));
        formContext.getControl('ccrm_accountingcentreid').setDisabled(false);
        if (formContext.ui.getFormType() == 1) {
            companyvalid = companyval[0].id;
            if (companyval[0].id.indexOf("}") > 0) {
                if (currUserData.arupcompanyid != null)
                    companyvalid = "{" + currUserData.arupcompanyid.toUpperCase() + "}";
            }
            else
                companyvalid = currUserData.arupcompanyid;
            if (companyval[0].id != companyvalid || currUserData.arupcompanyid == null)
                formContext.getAttribute("ccrm_accountingcentreid").setValue(null);
            else {
                SetLookupField(formContext,currUserData.ccrm_accountingcentreid, currUserData.ccrm_accountingcentrename, 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid');
                formContext.getAttribute("ccrm_accountingcentreid").fireOnChange();
            }
        }
        else if (formContext.ui.getFormType() != 1) {
            //CRM2016 Bug 34826
            if (formContext.getAttribute("ccrm_subaccountingcentreid")) {
                formContext.getAttribute("ccrm_accountingcentreid").setValue(null);
                formContext.getAttribute("ccrm_subaccountingcentreid").setValue(null);
                formContext.getControl("ccrm_subaccountingcentreid").setDisabled(true);
            }

        }
        //;
        //SDK.REST.retrieveRecord(companyval[0].id, "Ccrm_arupcompany", 'Ccrm_AccCentreLookupCode', null,
        //    function (retrievedreq) {
        //        if (retrievedreq != null) {
        //            accCenterFilterCode = retrievedreq.Ccrm_AccCentreLookupCode;
        //            selectedCompanyCode = retrievedreq.Ccrm_AccCentreLookupCode;
        //        }
        //    }, errorHandler, false);

        Xrm.WebApi.online.retrieveRecord("ccrm_arupcompany", companyval[0].id, "?$select=ccrm_acccentrelookupcode").then(
            function success(result) {
                accCenterFilterCode = result["ccrm_acccentrelookupcode"];
                selectedCompanyCode = result["ccrm_acccentrelookupcode"];
                formContext.getControl('ccrm_accountingcentreid').addPreSearch(function () {
                    AccCentreAddLookupFilter(formContext,accCenterFilterCode);
                });
            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        );

       
    if (formContext.ui.getFormType() != 1)
            setTransactionCurrency(formContext,companyval[0].id);
    }
    else {
        formContext.getControl('ccrm_accountingcentreid').addPreSearch(function () {
            AccCentreResetLookupFilter(formContext);
        });
    }
}

function AccCentreResetLookupFilter(formContext) {
    var fetch =
        "<filter type='and'>" +
        "<condition attribute='ccrm_arupcompanycode' operator='like' value='%%' />" +
        "</filter>";

    formContext.getControl('ccrm_accountingcentreid').addCustomFilter(fetch);
}

function AccCentreAddLookupFilter(formContext,accCenterFilterCode) {
    if (selectedCompanyCode == accCenterFilterCode) {
        var fetch =
            "<filter type='and'>" +
            "<condition attribute='ccrm_arupcompanycode' operator='like' value='" +     //BUG-FIX 63537
            accCenterFilterCode +
            "%' />" +
            "</filter>";
        formContext.getControl('ccrm_accountingcentreid').addCustomFilter(fetch);
    }
}

function SubAccCentreAddLookupFilter(formcontext,subAccCenterFilterCode) {

    var fetch =
        "<filter type='and'>" +
        "<condition attribute='ccrm_arupaccountingcodeid' operator='eq' value='" +
        subAccCenterFilterCode +
        "'/>" +
        "</filter>";
    formContext.getControl('ccrm_subaccountingcentreid').addCustomFilter(fetch);
}

//set currencyid lookups
function setTransactionCurrency(formContext,arupCompanyID) {

    var lookup = new Array();
    //SDK.REST.retrieveRecord(arupCompanyID,
    //    "Ccrm_arupcompany",
    //    'ccrm_currencyid,',
    //    null,
    //    function (retrievedreq) {
    //        if (retrievedreq != null) {
    //            var nodeCurrency = retrievedreq.ccrm_currencyid;

    //            var Id = retrievedreq.ccrm_currencyid.Id;
    //            if (Id.indexOf('{') == -1)
    //                Id = '{' + Id;
    //            if (Id.indexOf('}') == -1)
    //                Id = Id + '}';
    //            Id = Id.toUpperCase();

    //            lookup[0] = new Object();
    //            lookup[0].entityType = "transactioncurrency";
    //            if (nodeCurrency != null) {
    //                lookup[0].id = Id;
    //                lookup[0].name = retrievedreq.ccrm_currencyid.Name;
    //            }
    //        } else {
    //            lookup = GetCurrencyLookup();
    //        }
    //    },
    //    errorHandler,
    //    false);

    Xrm.WebApi.online.retrieveRecord("ccrm_arupcompany", arupCompanyID, "?$select=_ccrm_currencyid_value").then(
        function success(result) {
            if (result != null) {
                if (result["_ccrm_currencyid_value"] != null) {
                var Id = result["_ccrm_currencyid_value"];
                if (Id.indexOf('{') == -1)
                    Id = '{' + Id;
                if (Id.indexOf('}') == -1)
                    Id = Id + '}';
                Id = Id.toUpperCase();

                lookup[0] = new Object();
                lookup[0].entityType = "transactioncurrency";                
                    lookup[0].id = Id;
                    lookup[0].name = result["_ccrm_currencyid_value@OData.Community.Display.V1.FormattedValue"];

                    SetTransactionCurrencyLookUp(formContext, lookup);
                }
                else {
                    GetCurrencyLookup(formContext);
                }
            }
            
           
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
  
}

// Apply filter to Acc Center  - ends
function GetCurrencyLookup(formContext) {
   
    var lookup = new Array();
    lookup[0] = new Object();

    //SDK.REST.retrieveMultipleRecords("TransactionCurrency",
    //    "$select=TransactionCurrencyId,CurrencyName&$top=1&$filter=ISOCurrencyCode eq 'GBP'",
    //    function (results) {
    //        if (results.length > 0) {
    //            var Id = results[0].TransactionCurrencyId;
    //            if (Id.indexOf('{') == -1)
    //                Id = '{' + Id;
    //            if (Id.indexOf('}') == -1)
    //                Id = Id + '}';
    //            Id = Id.toUpperCase();

    //            lookup[0].id = Id;
    //            lookup[0].name = results[0].CurrencyName;
    //            lookup[0].entityType = "transactioncurrency";
    //        }
    //    },
    //    errorHandler,
    //    function () { },
    //    false);


    Xrm.WebApi.online.retrieveMultipleRecords("transactioncurrency", "?$select=currencyname,transactioncurrencyid&$filter=isocurrencycode eq 'GBP'&$top=1").then(
        function success(results) {
            if (results.entities.length > 0) {
                var Id = results.entities[0]["transactioncurrencyid"];
                if (Id.indexOf('{') == -1)
                    Id = '{' + Id;
                if (Id.indexOf('}') == -1)
                    Id = Id + '}';
                Id = Id.toUpperCase();

                lookup[0].id = Id;
                lookup[0].name = results.entities[0]["currencyname"];
                lookup[0].entityType = "transactioncurrency";

                SetTransactionCurrencyLookUp(formContext, lookup)
  
            }
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );

   // return lookup;
}

function SetTransactionCurrencyLookUp(formContext, lookup) {
    //CRM 2016  Bug 34826
    if (formContext.getAttribute("ccrm_pi_transactioncurrencyid"))
        formContext.getAttribute("ccrm_pi_transactioncurrencyid").setValue(lookup);
    if (formContext.getAttribute("ccrm_project_transactioncurrencyid"))
        formContext.getAttribute("ccrm_project_transactioncurrencyid").setValue(lookup);
    if (formContext.getAttribute("ccrm_bid_transactioncurrencyid"))
        formContext.getAttribute("ccrm_bid_transactioncurrencyid").setValue(lookup);
}

function setRequiredFields_DecisionToProceed(formContext) {
    formContext.getAttribute("description").setRequiredLevel("required")
    formContext.getAttribute("ccrm_salarycost_num").setRequiredLevel("required")
    formContext.getAttribute("ccrm_grossexpenses_num").setRequiredLevel("required")
}

function RatFactNetReturnToArupNetArupBidCost(executionContext) {
    var formContext = executionContext.getFormContext();
    var ratFactNetRet = formContext.getAttribute("ccrm_factorednetreturntoarup_num").getValue() / formContext.getAttribute("ccrm_netarupbidcost_num").getValue();
    if (ratFactNetRet < 1.0)
        return false;
    else
        return true;
}

function setRequiredFields_BidSubmitted(executionContext) {
    var formContext = executionContext.getFormContext();
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
    var reqLevel = arupInternal == true ? 'none' : 'required';

    formContext.getAttribute("ccrm_estarupinvolvementstart").setRequiredLevel("required"); //arup start date
    formContext.getAttribute("ccrm_estarupinvolvementend").setRequiredLevel("required"); //arup end date    
    formContext.getAttribute("ccrm_descriptionofextentofarupservices").setRequiredLevel("required"); //Extent of Arup Services
    formContext.getAttribute("arup_services").setRequiredLevel(reqLevel); //Services    
    formContext.getAttribute("arup_projecttype").setRequiredLevel(reqLevel); //The Works    
    formContext.getAttribute("arup_projectsector").setRequiredLevel(reqLevel); //Project Sector
}

function checkOrganisationData(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("customerid").getValue() != null) {
        var clientId = formContext.getAttribute("customerid").getValue()[0].id;

        var req = new XMLHttpRequest();
        req.open("GET", formContext.context.getClientUrl() + "/api/data/v9.1/accounts(" + clientId.replace('{', '').replace('}', '') +")?$select=ccrm_clientsectorpicklistname,_ccrm_countryofcoregistrationid_value,arup_clientsector", false);
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
                    var arup_clientsector = result["arup_clientsector"];
                    if (retrievedreq != null) {
                        var clientSector = (result["arup_clientsector"]!= null)
                            ? result["arup_clientsector"]
                            : null;
                        var countryOfCompanyReg = (result["_ccrm_countryofcoregistrationid_value"] != null)
                            ? result["_ccrm_countryofcoregistrationid_value"]
                            : null;
                        if (clientSector == null) {

                            Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                                '<font size="3" color="#000000"></br>You must provide a value for Client Sector for the Client</font>',
                                [
                                    { label: "<b>OK</b.", setFocus: true },
                                ],
                                "WARNING",
                                400,
                                250,
                                '',
                                true);

                            return false;
                        }
                        if (countryOfCompanyReg == null) {

                            Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                                '<font size="3" color="#000000"></br>You must provide a value for Country of Company Registration for the Client</font>',
                                [
                                    { label: "<b>OK</b>", setFocus: true },
                                ],
                                "WARNING",
                                400,
                                250,
                                '',
                                true);

                            return false;
                        }
                    } else
                        return false;
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();



        //Shruti : check Ccrm_ClientSectorPicklistName should be replaced with arup_clientsector, but it is not available in query
        //SDK.REST.retrieveRecord(clientId,
        //    "Account",
        //    'Ccrm_ClientSectorPicklistName,ccrm_countryofcoregistrationid',
        //    null,
        //    function (retrievedreq) {
        //        if (retrievedreq != null) {
        //            var clientSector = (retrievedreq.Ccrm_ClientSectorPicklistName != null)
        //                ? retrievedreq.Ccrm_ClientSectorPicklistName
        //                : null;
        //            var countryOfCompanyReg = (retrievedreq.ccrm_countryofcoregistrationid != null)
        //                ? retrievedreq.ccrm_countryofcoregistrationid
        //                : null;
        //            if (clientSector == null) {

        //                Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
        //                    '<font size="3" color="#000000"></br>You must provide a value for Client Sector for the Client</font>',
        //                    [
        //                        { label: "<b>OK</b.", setFocus: true },
        //                    ],
        //                    "WARNING",
        //                    400,
        //                    250,
        //                    '',
        //                    true);

        //                return false;
        //            }
        //            if (countryOfCompanyReg.Id == null) {

        //                Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
        //                    '<font size="3" color="#000000"></br>You must provide a value for Country of Company Registration for the Client</font>',
        //                    [
        //                        { label: "<b>OK</b>", setFocus: true },
        //                    ],
        //                    "WARNING",
        //                    400,
        //                    250,
        //                    '',
        //                    true);

        //                return false;
        //            }
        //        } else
        //            return false;
        //    },
        //    errorHandler,
        //    false);
    }
}

function HideApprovalButtonForRiskChange(regionName) {
    var regionName, oppType;
    oppType = formContext.getAttribute("ccrm_opportunitytype").getValue();

    if (formContext.getAttribute("ccrm_arupregionid").getValue() != null)
        regionName = formContext.getAttribute("ccrm_arupregionid").getValue()[0].name;

    if (regionName == ArupRegionName.EastAsia) {
        if (oppType == BidRiskLevels.Level1) { // if GL apporval option --> Waiting response, set it to approved
        }
        if ((oppType == BidRiskLevels.Level2 || oppType == BidRiskLevels.Level3)) {
            // if BD apporval option --> Waiting response, set it to approved 
        }
    } else if (regionName == ArupRegionName.Australasia || regionName == ArupRegionName.Malaysia) {
        if (oppType == BidRiskLevels.Level1) {
        } else if (oppType == BidRiskLevels.Level2) {
        }
        if (oppType == BidRiskLevels.Level3) {
        }
    }
}

function stageNotifications(formContext) {
    debugger;
    setLookupFiltering(formContext); // appy filter to user fields

    var pjnrequested = false;
    var pjnMsg =
        "You are progressing the Opportunity without a Possible Job Number if a PJN is required move back to PRE-BID stage where the PJN can be requested.";//[RS-08/05/2017] - Changed stage name from LEAD to PRE-BID in the message above
    var stageid = getStageId(formContext);
    var regionName;
    var arupInternal = formContext.getAttribute('ccrm_arupinternal').getValue();
    var confidential = formContext.getAttribute('ccrm_confidential').getValue();
    if (confidential == 1) {
        formContext.getAttribute('ccrm_confidentialoptionset').setValue(1);
    } else {
        formContext.getAttribute('ccrm_confidentialoptionset').setValue(2);
    }
    if (formContext.getAttribute("ccrm_possiblejobnumberrequired").getValue() == 1)
        pjnrequested = true;
    if (formContext.getAttribute("ccrm_arupregionid").getValue() != null)
        regionName = formContext.getAttribute("ccrm_arupregionid").getValue()[0].name.toLowerCase();

    if (regionName == ArupRegionName.EastAsia.toLowerCase() || regionName == ArupRegionName.Australasia.toLowerCase() || regionName == ArupRegionName.Malaysia.toLowerCase()) {
        if (arupInternal) { hideRibbonButton(formContext,'ccrm_showpjnbutton', false); }
        if (stageid == ArupStages.Lead || stageid == ArupStages.CrossRegion) {
            if (!pjnrequested && !arupInternal) {
                showRibbonButton(formContext,'ccrm_showpjnbutton', true);
            } else if (pjnrequested && (formContext.getAttribute("ccrm_pjna").getValue() == "" || formContext.getAttribute("ccrm_pjna").getValue() == null)) {
                setTimeout(function () { formContext.ui.clearFormNotification("PJNRiskChsnge"); }, 500);
                setTimeout(function () {
                    BPFMoveNext(formContext);
                    hideProcessFields(formContext,formContext.data.process.getSelectedStage().getName());
                }, 1000);
            }
        } else {
            if (stageid == ArupStages.BidDevelopment) {
                if (!pjnrequested) {

                    hideRibbonButton(formContext,'ccrm_showpjnbutton', false); //Added to hide PJN ribbon button
                    formContext.ui.setFormNotification(pjnMsg, "WARNING", "PJNPPendingMsg");
                    setTimeout(function () { formContext.ui.clearFormNotification("PJNPPendingMsg"); }, 10000);
                }
            }
        }
    } else {
        if (!pjnrequested) {
            if (
                (stageid == ArupStages.Lead ||
                    stageid == ArupStages.CrossRegion ||
                    stageid == ArupStages.BidDevelopment ||
                    stageid == ArupStages.BidSubmitted)
                && (!arupInternal || regionName == ArupRegionName.UKMEA.toLowerCase())
            )
                showRibbonButton(formContext,'ccrm_showpjnbutton', true);
            else
                hideRibbonButton(formContext,'ccrm_showpjnbutton', false); //Added to hide PJN ribbon button
        }

        if (stageid == ArupStages.Lead) {
            //once bid decision is approved - move to next stage
            if (formContext.getAttribute("arup_biddecisionoutcome").getValue() == "770000001") {
                setTimeout(function () {
                    BPFMoveNext(formContext);
                    hideProcessFields(formContext,formContext.data.process.getSelectedStage().getName());
                }, 1000);
            }
        }
    }
    if (stageid != ArupStages.BidReviewApproval) // bid riview approval
    {
        hideRibbonButton(formContext,'ccrm_shwbidreviewappbtn', 0);
    } else if (stageid == ArupStages.BidReviewApproval) // bid riview approval
    {
        if (pjnrequested)
            MoveToBidDevelopment(formContext,true);
        makeBidReviewApprovalFieldsReadonly(formContext);
        if (formContext.getAttribute("ccrm_bidreviewoutcome").getValue() != 100000002)
            showRibbonButton(formContext,'ccrm_shwbidreviewappbtn', 1);
        //setTimeout(function () { formContext.data.entity.save(null); }, 2);
        setCurrentApproversAsync(formContext);
    }
    if (stageid == ArupStages.CrossRegion) {
        formContext.data.process.removeOnStageChange(function () { StageChange_event(formContext) });
        formContext.data.process.addOnStageChange(function (executionContext) {

            var eventArgs = executionContext.getEventArgs();
            if (eventArgs.getDirection() == "Next" && (eventArgs.getStage().getName() == "DEVELOPING BID" || eventArgs.getStage().getName() == "CROSS REGION")) {
                Xrm.Utility.openEntityForm(formContext.data.entity.getEntityName(), formContext.data.entity.getId());
            }
        }
        );
        InitiateCrossRegionStage(formContext,null, true);
    }
    if (customerid_onChange(formContext)) {
        if (stageid != ArupStages.Lead)
            onStageChange(formContext);
    }

    if (stageid == ArupStages.BidDevelopment || stageid == ArupStages.BidReviewApproval) {
        var result = CheckFinanceFields(formContext);
        var financeMsg = "Please complete all required and Project Financials fields to proceed to next stage.";
        if (result)
            formContext.ui.clearFormNotification("FinancePendingMsg");
        else
            formContext.ui.setFormNotification(financeMsg, "WARNING", "FinancePendingMsg");
        setTimeout(function () { formContext.ui.clearFormNotification("FinancePendingMsg"); }, 10000);
    }
    if (stageid == ArupStages.ConfirmJob) {
        var triggerSave = false;

        //Added to give notification about Project Participant addition

        var jobnoprogval = formContext.getAttribute("ccrm_jobnumberprogression").getValue();
        if (jobnoprogval == 100009001 ||
            jobnoprogval == 100009002 ||
            jobnoprogval == 100009003 ||
            jobnoprogval == 100009004 ||
            jobnoprogval == null) {
            formContext.getAttribute("ccrm_sys_confirmedjob_buttonhide").setValue(false);
            formContext.getAttribute("ccrm_systemcjnarequesttrigger").setValue(true);
            triggerSave = true;
        }
        if (triggerSave) {
            setTimeout(function () { formContext.data.save(null); }, 500);
        }
    }

    FormNotificationForOpportunityType(formContext,formContext.getAttribute("arup_opportunitytype").getValue());

    restoreFieldVal(formContext,stageid);

}

//Move Previous Stage
function onStageChange(formContext,result) {
    formContext.ui.clearFormNotification("msgcrossbid");
    formContext.ui.clearFormNotification("FinancePendingMsg");
    setTimeout(function () {
        formContext.getAttribute(function (attribute, index) {
            if (attribute.getRequiredLevel() == "required") {
                if (attribute.getValue() === null) {
                    attribute.setRequiredLevel("none");
                }
            }
        });
        highlightField(null, '#ccrm_estexpenseincome_num', true);
        highlightField(null, '#ccrm_chargingbasis', true);
        highlightField(null, '#ccrm_estprojectresourcecosts_num', true);
        highlightField(null, '#arup_expenses_num', true);
        highlightField(null, '#ccrm_estprojectexpenses_num', true);
        highlightField(null, '#ccrm_projecttotalcosts_num', true);
        if (customerid_onChange(formContext)) {
            highlightField(null, '#ccrm_client', false);
        }
        formContext.data.process.movePrevious(onMovePrevious);
        formContext.ui.clearFormNotification("FinancePendingMsg");
    }, 100);
}

function onMovePrevious(returnStatus) {

    switch (returnStatus) {
        case 'success':
            //alert('Success!');
            break;
        case 'crossEntity':
            //alert('crossEntity!');
            break;
        case 'unreachable':
            //alert('unreachable stage');
            break;
        case 'invalid':
            //alert('invalid stage');
            break;
    }
}

function restoreFieldVal(formContext,stageid) {

    var fields = new Array();
    /* if (stageid == ArupStages.BidDevelopment)
         fields = [
             'ccrm_estimatedvalue_num', 'ccrm_projecttotalincome_num', 'ccrm_projectdirector_userid',
             'ccrm_projectmanager_userid', 'ccrm_estexpenseincome_num', 'ccrm_estprojectresourcecosts_num',
             'ccrm_estprojectoverheads_num', 'ccrm_projecttotalcosts_num', 'ccrm_profitasapercentageoffeedec',
             'ccrm_estarupinvolvementstart', 'ccrm_estarupinvolvementend', 'ccrm_estprojectstaffoverheadsrate',
             'ccrm_estprojectexpenses_num', 'ccrm_estprojectprofit_num', 'ccrm_location', 'ccrm_chargingbasis',
             'ccrm_bidreviewchair_userid'
         ];*/

    //Commented section below as it is not required to reset the fields for CRM 2016 BPF at every stage.
    /*
    if (stageid == ArupStages.ConfirmJob)
        fields = [
            'ccrm_estimatedvalue_num', 'ccrm_projecttotalincome_num', 'ccrm_projectdirector_userid',
            'ccrm_projectmanager_userid', 'ccrm_estexpenseincome_num', 'ccrm_estprojectresourcecosts_num',
            'ccrm_estprojectoverheads_num', 'ccrm_projecttotalcosts_num', 'ccrm_profitasapercentageoffeedec',
            'ccrm_estarupinvolvementstart', 'ccrm_estarupinvolvementend', 'ccrm_pirequirement',
            'ccrm_estprojectstaffoverheadsrate', 'ccrm_estprojectexpenses_num', 'ccrm_estprojectprofit_num',
            'ccrm_location', 'ccrm_chargingbasis', 'ccrm_servicesname', 'ccrm_projectsectorname', 'ccrm_theworksname',
            'ccrm_pilevelmoney_num'
        ];*/
    //CRM2016 Bug 34932
    /*   if (stageid == ArupStages.BidReviewApproval)
           fields = [
               'ccrm_bidreviewchair_userid', 'ccrm_servicesname', 'ccrm_projectsectorname', 'ccrm_theworksname',
               'ccrm_pirequirement', 'ccrm_geographicmanagerproxyconsulted2', 'ccrm_geographicmanagerid',
               'ccrm_pilevelmoney_num', 'ccrm_contractconditions', 'ccrm_bidreview'
           ];*/

    if (stageid == ArupStages.BidSubmitted)
        fields = ['ccrm_bidsubmission'];

    resetAndSetVal(formContext,fields);
}

function resetAndSetVal(formContext,fields) {
    var bid = new Object();
    fields.forEach(function (field) {
        bid[field] = formContext.getAttribute(field).getValue();
        formContext.getAttribute(field).setValue(null);
        formContext.getAttribute(field).setValue(bid[field]);
    });
    bid = null;
}
//SP_09_04_202 : value added as argument because for optionset , it is 0 or 1 and for two options it is true or false
function hideRibbonButton(formContext,field, value) {
    if (formContext.getAttribute(field).getValue() == 1) {
        formContext.getAttribute(field).setValue(value);
        setTimeout(function () { formContext.data.entity.save(); }, 500);
        //formContext.data.entity.save();
    }
}

function showRibbonButton(formContext,field, value) {
    if (formContext.getAttribute(field).getValue() == 0 || formContext.getAttribute(field).getValue() == null) {
        formContext.getAttribute(field).setValue(value);
        //setTimeout(function () { formContext.data.entity.save(null); }, 500);
        formContext.data.entity.save();
    }
}

function BPFMoveNext(formContext) {
    var opportunitytype = formContext.getAttribute("arup_opportunitytype").getValue();
    if (opportunitytype == '770000005') { return; }

    //if (formContext.getAttribute("processid") != null) {
        moveNext(formContext,getStageId(formContext));
   // }
}

function StageChange_event(formContext) {
    debugger;
    var stageid = getStageId(formContext);
    var error = false;

    onSelectOfStage(formContext,stageid);

    if (stageid != ArupStages.Lead &&
        stageid != ArupStages.CrossRegion &&
        stageid != ArupStages.BidDevelopment &&
        stageid != ArupStages.BidSubmitted &&
        stageid != ArupStages.ConfirmJob) {
        setCurrentApprovers(formContext);
    } else {
        formContext.ui.clearFormNotification('CurrentApprovers');
    }

    if (stageid == ArupStages.BidSubmitted) {
        var BidSubmitted = 200020;
        updateStatusCode(formContext,BidSubmitted);
    }

    SetCurrentStatusFromServer(formContext);

    var isPJNApprovalStage = IsPJNApprovalStage(stageid);

    var opportunitytype = formContext.getAttribute("arup_opportunitytype").getValue();
    if (stageid == ArupStages.CrossRegion || stageid == ArupStages.BidDevelopment || isPJNApprovalStage) {

        if (opportunitytype == '770000005') {
            error = true;
            formContext.data.process.setActiveStage(ArupStages.Lead, function () {
                Alert.show('<font size="6" color="#2E74B5"><b>Stage Notification</b></font>',
                    '<font size="3" color="#000000"></br>This opportunity cannot be pushed past Pre-Bid stage because its type is Architectural competition with multiple Arup teams – master record</font>',
                    [
                        new Alert.Button("<b>OK</b>")
                    ],
                    "INFO", 600, 200, '', true);
            })
        } else {

            var arupRegion = formContext.getAttribute("ccrm_arupregionid").getValue();
            var bidDecision = formContext.getAttribute("arup_biddecisionoutcome").getValue();
            var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();

            if (arupRegion != null &&
                (arupRegion[0].name.toLowerCase() == ArupRegionName.Americas.toLowerCase() ||
                    arupRegion[0].name.toLowerCase() == ArupRegionName.Europe.toLowerCase() ||
                    arupRegion[0].name.toLowerCase() == ArupRegionName.UKMEA.toLowerCase()) &&
                (bidDecision != null && bidDecision != 770000001) &&
                (arupInternal != null && arupInternal == false) && !error
            ) {
                error = true;
                formContext.data.process.setActiveStage(ArupStages.Lead, function () {
                    Alert.show('<font size="6" color="#2E74B5"><b>Stage Notification</b></font>',
                        '<font size="3" color="#000000"></br>This opportunity cannot be pushed past Pre-Bid stage without Bid Decision Approval</font>',
                        [
                            new Alert.Button("<b>OK</b>")
                        ],
                        "INFO", 600, 200, '', true);
                })
            }
        }
    }

    stageNotifications(formContext);

    hideProcessFields(formContext,formContext.data.process.getSelectedStage().getName());
    IsFormValid(formContext);
    SuppressDirtyFields(formContext); //Added to handle dirty fields on stage change of turbo forms

    formContext.ui.refreshRibbon();

    //if (stageid == ArupStages.BidDevelopment && currentStage != ArupStages.Lead) {
    //    formContext.data.entity.save();
    //    setTimeout(function () { refreshPage(); }, 3000);
    //}
    //currentStage = stageid
    ShowHideOpportunityTypeAndProjectProcurement(formContext);

}
function IsPJNApprovalStage(stageid) {
    return (stageid == ArupStages.PJNApproval || stageid == ArupStages.PJNApproval1 || stageid == ArupStages.PJNApproval2 || stageid == ArupStages.PJNApproval3 || stageid == ArupStages.PJNApproval4 || stageid == ArupStages.PJNApproval5 || stageid == ArupStages.PJNApproval6 || stageid == ArupStages.PJNApproval7 || stageid == ArupStages.PJNApproval8 || stageid == ArupStages.PJNApproval9);
}

function checkAccountingCentre(formContext) {
    acctCentreInvalid = null;
    checkAccountingCentreStatus(formContext,false);
    var validFieldName = 'ccrm_validaccountingcentre';
    var warnMsg = "An accounting centre you have selected is closed. Please, select a valid accounting centre.";
    var warnMsgName = 'accountingcentre';

    if (acctCentreInvalid != null) {

        if (acctCentreInvalid == true) {

            //  if (formContext.ui.getFormType() == 1) {
            //    //SetLookupField(formContext,null, null, 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid');
            formContext.getAttribute("ccrm_accountingcentreid").setValue(null);
            SetValidField(formContext,validFieldName, false, warnMsg, warnMsgName);
            //formContext.data.process.movePrevious(onMovePrevious)
            //SetLookupField(formContext,0, "", 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid');
            //    //formContext.getAttribute("ccrm_accountingcentreid").setSubmitMode("always");               
            //  }
        } else {
            SetValidField(formContext,validFieldName, true, null, warnMsgName);
        }
    } else {
        SetValidField(formContext,validFieldName, true, null, warnMsgName);
    }
    setTimeout(function () { formContext.ui.clearFormNotification("accountingcentre"); }, 10000);
}

function hideProcessFields(formContext, selectedStage) {
 
    /// <summary>Hide fields that are required by the Bbusiness Process Flow, but which we do not want the user to see.</summary>
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();

    formContext.getAttribute("ccrm_estarupinvolvementstart").setRequiredLevel("required"); //arup start date
    formContext.getAttribute("ccrm_estarupinvolvementend").setRequiredLevel("required"); //arup end date    
    formContext.getAttribute("ccrm_descriptionofextentofarupservices").setRequiredLevel("required"); //Extent of Arup Services

    switch (selectedStage) {
        case "PRE-BID"://[RS-08/05/2017] - Changed the name of stage from LEAD to PRE-BID
            if (arupInternal) {
                hideBPFFields(formContext,"arup_biddecisionchair", "ccrm_arups_role_in_project", "ccrm_arupuniversityiiaresearchinitiative", "ccrm_arupbidstartdate", "ccrm_arupbidfinishdate", "ccrm_confidentialoptionset", "ccrm_arupinternal", "ccrm_possiblejobnumberrequired", "ccrm_arupregionid", "ccrm_projectcountryregionid", "ccrm_opportunitytype");
                    (formContext,"ccrm_estarupinvolvementstart", "ccrm_estarupinvolvementend");
            }
            else {
                hideBPFFields(formContext,"ccrm_arupinternal", "ccrm_possiblejobnumberrequired", "ccrm_arupregionid", "ccrm_projectcountryregionid", "arup_isaccountingcentervalid", "ccrm_opportunitytype");
                setRequiredLevelOfBPFField(formContext,"ccrm_arups_role_in_project", "ccrm_estarupinvolvementstart", "ccrm_estarupinvolvementend");
            }
            break;
        case "CROSS REGION":
            hideBPFFields(formContext,"ccrm_opportunitytype_1", "ccrm_possiblejobnumberrequired_1", "ccrm_arupregionid_1");
            setRequiredLevelOfBPFField(formContext, "ccrm_geographicmanagerid", "ccrm_geographicmanagerproxyconsulted");
            break;
        case "DEVELOPING BID":
            if (arupInternal) {
                hideBPFFields(formContext,"ccrm_contractconditions", "ccrm_pi_transactioncurrencyid", "ccrm_pirequirement", "ccrm_pilevelmoney_num", "ccrm_contractlimitofliability", "ccrm_limitofliabilityagreement", "ccrm_limitamount_num", "ccrm_financedetailscaptured");
                setRequiredLevelOfBPFField(formContext,  "ccrm_projectmanager_userid", "ccrm_projectdirector_userid", "ccrm_bidreviewchair_userid", "ccrm_bidreview", "ccrm_bidsubmission");
            }
            else {
                hideBPFFields(formContext,"ccrm_financedetailscaptured");
                setRequiredLevelOfBPFField(formContext, "ccrm_contractconditions", "ccrm_pi_transactioncurrencyid", "ccrm_pirequirement", "ccrm_contractlimitofliability", "ccrm_projectmanager_userid", "ccrm_projectdirector_userid", "ccrm_bidreviewchair_userid", "ccrm_bidreview", "ccrm_bidsubmission");
            }
            break;
        case "BID REVIEW/SUBMISSION":
            hideBPFFields(formContext, "arup_biddecisiondate", "estimatedclosedate");
            setRequiredLevelOfBPFField(formContext, "ccrm_bidreviewdecisiondate", "arup_bidsubmissionoutcome","arup_bidsubmitteddate");

            break;
        case "CONFIRMED JOB - PROJECT":
            if (arupInternal) {
                hideBPFFields(formContext,"arup_services", "arup_projecttype", "arup_projectsector", "ccrm_estprojectvalue_num", "arup_projpartreqd");
              //  setRequiredLevelOfBPFField(formContext, "ccrm_estarupinvolvementstart_1", "ccrm_estarupinvolvementend_1");
                setRequiredLevelOfBPFField(formContext, "ccrm_projectmanager_userid", "ccrm_projectdirector_userid");

            } else {
                setRequiredLevelOfBPFField(formContext, "ccrm_projectmanager_userid", "ccrm_projectdirector_userid","arup_services", "arup_projecttype", "arup_projectsector", "arup_projpartreqd");
            }
            break;
        case "CONFIRMED JOB - COMMERCIAL":
            if (arupInternal) {
                hideBPFFields(formContext, "ccrm_estprojectprofit_num", "ccrm_profitasapercentageoffeedec", "ccrm_pi_transactioncurrencyid_1", "ccrm_pirequirement_1", "ccrm_pilevelmoney_num_1", "ccrm_contractlimitofliability_1", "ccrm_limitofliabilityagreement_1", "ccrm_limitamount_num_1", "ccrm_jobnumberprogression", "ccrm_arupregionid_2", "ccrm_opportunitytype_2");
                setRequiredLevelOfBPFField(formContext, "ccrm_estexpenseincome_num", "ccrm_projecttotalincome_num", "arup_grossstaffcost_num", "ccrm_estprojectexpenses_num", "ccrm_projecttotalcosts_num","ccrm_chargingbasis");
            }
            else {
                hideBPFFields(formContext, "ccrm_jobnumberprogression", "ccrm_arupregionid_2", "ccrm_opportunitytype_2");
                setRequiredLevelOfBPFField(formContext, "ccrm_estexpenseincome_num", "ccrm_projecttotalincome_num", "arup_grossstaffcost_num", "ccrm_estprojectexpenses_num", "ccrm_projecttotalcosts_num", "ccrm_chargingbasis", "ccrm_estprojectprofit_num", "ccrm_profitasapercentageoffeedec", "ccrm_pi_transactioncurrencyid","ccrm_pirequirement","ccrm_contractlimitofliability");
            }
            break;
        case "CJN APPROVAL":
            HideFieldsOnApprovalTab(formContext, "CJN_Approval_tab", formContext.data.process.getSelectedStage().getId());
            break;
        case "PJN APPROVAL":
            HideFieldsOnApprovalTab(formContext, "PJN_Approval_tab", formContext.data.process.getSelectedStage().getId());
            break;
    }
}
function hideBPFFields(formContext, fieldName) {

    /// <summary>Hide control in Business process panel.</summary>
    /// <param name="fieldName">One or more field names that are to be hidden. First Field is formContext</param>
    for (var field in arguments) {
        if (field != 0) { // first argument is formContext. So do not consider it as field to be hidden
            var attrName = arguments[field];
            var controlName = "header_process_" + attrName;
            var control = formContext.getControl(controlName);
            var attribute = formContext.getAttribute(controlName);

            if (control != null) {
                control.setVisible(false);
            }
            if (attribute != null) {
                attribute.setRequiredLevel('none');
            }
        }
    }
}

function setRequiredLevelOfBPFField(formContext,fieldName) {
    for (var field in arguments) {
        if (field != 0) { // first argument is formContext. So do not consider it as field 
            var attrName = arguments[field];
            var controlName = attrName;
            var control = formContext.getAttribute(controlName);
            if (control != null) {
                control.setRequiredLevel('required');
            }
        }
    }
}

function HideFieldsOnApprovalTab(formContext, tabName, stageId) {
    var sectionsName = GetApproverSectionByStageId(stageId);
    var arraysectionsName = sectionsName.split(",");
    for (var i = 0; i < arraysectionsName.length; i++) {
        formContext.ui.tabs.get(tabName).sections.get(arraysectionsName[i].trim()).setVisible(true);
    }  
}
function GetApproverSectionByStageId(stageId) {
    var sectionsName;
    switch (stageId) {        
        case ArupStages.PJNApproval:
        case ArupStages.PJNApproval8:
            sectionsName = ApprovalsSection.PJNApproval8;
            break;
        case ArupStages.PJNApproval5:
        case ArupStages.PJNApproval6:
            sectionsName = ApprovalsSection.PJNApproval6;
            break;
        case ArupStages.PJNApproval7:
        case ArupStages.PJNApproval9:
            sectionsName = ApprovalsSection.PJNApproval9;
            break;
        case ArupStages.PJNApproval2:
        case ArupStages.PJNApproval4:
            sectionsName = ApprovalsSection.PJNApproval4;
            break;
        case ArupStages.PJNApproval1:
        case ArupStages.PJNApproval3:
            sectionsName = ApprovalsSection.PJNApproval3;
            break; 
        case ArupStages.ConfirmJobApproval:
        case ArupStages.ConfirmJobApproval3:
            sectionsName = ApprovalsSection.ConfirmJobApproval3;
            break;    
        case ArupStages.ConfirmJobApproval1:
        case ArupStages.ConfirmJobApproval2:
            sectionsName = ApprovalsSection.ConfirmJobApproval1;
            break;    
    }
    return sectionsName
}

// Bid Review Approval -  ribbon button click - starts
function BidReviewApprovalClick(formContext) {
    debugger;

    //var ismodified = formContext.data.entity.getIsDirty();
    //if (ismodified == true) {
    //    formContext.data.save();
    //}
    //formContext.data.save().then(
    //    function success(status) {
    if (IsFormValid(formContext)) {
        formContext.data.save();
        setTimeout(function () {

            var approvalType = "BidReviewApproval";
            formContext.ui.clearFormNotification('msgbidreviewchair');
            var newDate = new Date();
            var bidReviewDate = formContext.getAttribute("ccrm_bidreview").getValue();

            var regionName = formContext.getAttribute("ccrm_arupregionid").getValue()[0].name.toUpperCase();
            var currentBidReviewChair = formContext.getAttribute("ccrm_bidreviewchair_userid").getValue();
            var currentUser = formContext.context.getUserId();

            var PMBR = formContext.getAttribute('ccrm_bidmanager_userid').getValue()[0].id,
                PDBR = formContext.getAttribute('ccrm_biddirector_userid').getValue()[0].id;

            if (regionName == "AUSTRALASIA REGION" || regionName == "MALAYSIA REGION") {
                if (currentUser != PMBR && currentUser != PDBR) {
                    Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
                        '<font size="3" color="#000000"></br>Only the Bid Manager or the Bid Director can approve the Bid Review Approval</font>',
                        [
                            { label: "<b>OK</b>", setFocus: true },
                        ],
                        "ERROR", 500, 250, '', true);
                } else {
                    if (BidReviewApprovalValidation(formContext, true)) {
                        if (bidReviewDate != null && bidReviewDate > newDate) {
                            Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                                '<font size="3" color="#000000"></br>The selected Bid Review date is greater than the current date.\n Do you want to Continue? </br></br>Click "Proceed with Approval" to confirm, or "Do Not Approve" to cancel.</font>',
                                [
                                    {
                                        label: "<b>Proceed with Approval</b>",
                                        callback: function () {
                                            BidReviewApprovalConfirmation(formContext, approvalType);
                                            // approveCallbackAction(approvalType);
                                            moveToNextTrigger = false;
                                        },
                                        setFocus: false,
                                        preventClose: false
                                    },
                                    {
                                        label: "<b>Do Not Approve</b>",
                                        setFocus: true,
                                        preventClose: false
                                    }
                                ],
                                "WARNING", 500, 350, '', true);
                        }
                        else {
                            BidReviewApprovalConfirmation(formContext, approvalType);
                            // approveCallbackAction(approvalType);
                            moveToNextTrigger = false;
                        }
                    }
                }
            } else {
                if (BidReviewApprovalValidation(formContext, true)) {
                    if (bidReviewDate != null && bidReviewDate > newDate) {
                        Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                            '<font size="3" color="#000000"></br>The selected Bid Review date is greater than the current date.\n Do you want to Continue? </br></br>Click "Proceed with Approval" to confirm, or "Do Not Approve" to cancel.</font>',
                            [
                                {
                                    label: "<b>Proceed with Approval</b>",
                                    callback: function () {
                                        BidReviewApprovalConfirmation(formContext, approvalType);
                                        // approveCallbackAction(approvalType);
                                        moveToNextTrigger = false;
                                    },
                                    setFocus: false,
                                    preventClose: false
                                },
                                {
                                    label: "<b>Do Not Approve</b>",
                                    setFocus: true,
                                    preventClose: false

                                }
                            ],
                            "WARNING", 500, 350, '', true);
                    }
                    else {
                        BidReviewApprovalConfirmation(formContext, approvalType);
                        //approveCallbackAction(approvalType);
                        moveToNextTrigger = false;
                    }
                }
            }
        }, 1500);
    } else {
        formContext.data.save();
    }
        //},
        //function (status) {
        //    console.log("failure status " + status);
        //});
        
}

function BidReviewApprovalValidation(formContext,showmsg) {
    formContext.ui.clearFormNotification('msgbidreviewmandfield');
    var result = true;

    if (showmsg) {
        var msg = '';
        if (!CheckMandatoryFields(formContext)) {
            msg = 'To complete the Bid Review please fill in the mandatory fields ';
            result = false;
        }
        if (IsCrossRegionBid(formContext)) { // if cross region fields not filled
            var msgCrossRegion =
                'To complete the Bid Review please fill in the mandatory fields and ensure that the cross country checks have been completed.';
            if (!CrossRegionFieldsFilled(formContext))
                msg += "along with all fields required for cross country check.";;
        }
        if (!result)
            formContext.ui.setFormNotification(msg, 'WARNING', 'msgbidreviewmandfield');
    }
    return result;
}

function CheckMandatoryFields(formContext) {
    var result = true;
    var arupInternal = formContext.getAttribute('ccrm_arupinternal').getValue();

    if (formContext.getAttribute('ccrm_bidreview').getValue() == null) {
        result = false;
        highlightField('#header_process_ccrm_bidreview', '#ccrm_bidreview');
    } else highlightField('#header_process_ccrm_bidreview', '#ccrm_bidreview', true);

    if (formContext.getAttribute('ccrm_bidreviewchair_userid').getValue() == null) {
        result = false;
        highlightField('#header_process_ccrm_bidreviewchair_userid', '#ccrm_bidreviewchair_userid');
    } else highlightField('#header_process_ccrm_bidreviewchair_userid', '#ccrm_bidreviewchair_userid', true);

    if (formContext.getAttribute('ccrm_estimatedvalue_num').getValue() == null) {
        result = false;
        highlightField(null, '#ccrm_estimatedvalue_num');
    } else highlightField(null, '#ccrm_estimatedvalue_num', true);

    if (formContext.getAttribute('ccrm_estexpenseincome_num').getValue() == null) {
        result = false;
        highlightField(null, '#ccrm_estexpenseincome_num');
    } else highlightField(null, '#ccrm_estexpenseincome_num', true);

    if (formContext.getAttribute('ccrm_estprojectresourcecosts_num').getValue() == null) {
        result = false;
        highlightField(null, '#ccrm_estprojectresourcecosts_num');
    } else highlightField(null, '#ccrm_estprojectresourcecosts_num', true);

    if (formContext.getAttribute('ccrm_projectmanager_userid').getValue() == null) {
        result = false;
        highlightField(null, '#ccrm_projectmanager_userid');
    } else highlightField(null, '#ccrm_projectmanager_userid', true);

    if (formContext.getAttribute('ccrm_projectdirector_userid').getValue() == null) {
        result = false;
        highlightField(null, '#ccrm_projectdirector_userid');
    } else highlightField(null, '#ccrm_projectdirector_userid', true);

    if (formContext.getAttribute('ccrm_estarupinvolvementstart').getValue() == null) {
        result = false;
        highlightField(null, '#ccrm_estarupinvolvementstart');
    } else highlightField(null, '#ccrm_estarupinvolvementstart', true);

    if (formContext.getAttribute('ccrm_estarupinvolvementend').getValue() == null) {
        result = false;
        highlightField(null, '#ccrm_estarupinvolvementend');
    } else highlightField(null, '#ccrm_estarupinvolvementend', true);

    if (formContext.getAttribute('ccrm_descriptionofextentofarupservices').getValue() == null) {
        result = false;
        highlightField(null, '#ccrm_descriptionofextentofarupservices');
    } else highlightField(null, '#ccrm_descriptionofextentofarupservices', true);
    if (!arupInternal) {

        if (formContext.getAttribute('ccrm_contractconditions').getValue() == null) {
            result = false;
            highlightField('#header_process_ccrm_contractconditions1', '#header_process_ccrm_contractconditions');
        } else highlightField('#header_process_ccrm_contractconditions1', '#header_process_ccrm_contractconditions', true);

        if (formContext.getAttribute('ccrm_pirequirement').getValue() == null) {
            result = false;
            highlightField('#header_process_ccrm_pirequirement', null);
        } else highlightField('#header_process_ccrm_pirequirement', null, true);

        if (formContext.getAttribute('ccrm_pi_transactioncurrencyid').getValue() == null) {
            result = false;
            highlightField('#header_process_ccrm_pi_transactioncurrencyid1', null);
        } else highlightField('#header_process_ccrm_pi_transactioncurrencyid1', null, true);

        if (formContext.getAttribute('ccrm_pirequirement').getValue() == PI_REQUIREMENT.MIN_COVER && formContext.getAttribute('ccrm_pilevelmoney_num').getValue() == null) {
            result = false;
            highlightField('#header_process_ccrm_pilevelmoney_num', null);
        } else highlightField('#header_process_ccrm_pilevelmoney_num', null, true);
    }

    if (formContext.getAttribute('ccrm_chargingbasis').getValue() == null && formContext.getAttribute('ccrm_arupbusinessid').getValue()[0].name != 'Charity & Community') {
        result = false;
        highlightField('#header_process_ccrm_chargingbasis', null);
        highlightField(null, '#ccrm_chargingbasis');
    } else {
        highlightField('#header_process_ccrm_chargingbasis', null, true);
        highlightField(null, '#ccrm_chargingbasis', true);
    }

    return result;
}

function CheckFinanceFields_ec(executionContext) {
    var formContext = executionContext.getFormContext();
    CheckFinanceFields(formContext);
}

//CheckFinanceFields
function CheckFinanceFields(formContext) {

    var result = true;
    var stageid = getStageId(formContext);

    if (stageid == ArupStages.BidDevelopment || stageid == ArupStages.BidReviewApproval) {
        if (formContext.getAttribute('ccrm_estimatedvalue_num').getValue() == null) {
            result = false;
            highlightField(null, '#ccrm_estimatedvalue_num');
        } else highlightField(null, '#ccrm_estimatedvalue_num', true);
        if (formContext.getAttribute('ccrm_estexpenseincome_num').getValue() == null) {
            result = false;
            highlightField(null, '#ccrm_estexpenseincome_num');
            formContext.getAttribute("ccrm_estexpenseincome_num").setRequiredLevel('required');
        } else {
            highlightField(null, '#ccrm_estexpenseincome_num', true);
            formContext.getAttribute("ccrm_estexpenseincome_num").setRequiredLevel('none');
        }

        if (formContext.getAttribute('ccrm_projecttotalincome_num').getValue() == null) {
            result = false;
            highlightField(null, '#ccrm_projecttotalincome_num');
            formContext.getAttribute("ccrm_projecttotalincome_num").setRequiredLevel('required');
        } else {
            highlightField(null, '#ccrm_projecttotalincome_num', true);
            formContext.getAttribute("ccrm_projecttotalincome_num").setRequiredLevel('none');
        }

        if (formContext.getAttribute('ccrm_estprojectresourcecosts_num').getValue() == null) {
            result = false;
            highlightField(null, '#ccrm_estprojectresourcecosts_num');
            formContext.getAttribute("ccrm_estprojectresourcecosts_num").setRequiredLevel('required');
        } else {
            highlightField(null, '#ccrm_estprojectresourcecosts_num', true);
            formContext.getAttribute("ccrm_estprojectresourcecosts_num").setRequiredLevel('none');
        }

        if (formContext.getAttribute('ccrm_estprojectstaffoverheadsrate').getValue() == null) {
            result = false;
            highlightField(null, '#ccrm_estprojectstaffoverheadsrate');
            formContext.getAttribute("ccrm_estprojectstaffoverheadsrate").setRequiredLevel('required');
        } else {
            highlightField(null, '#ccrm_estprojectstaffoverheadsrate', true);
            formContext.getAttribute("ccrm_estprojectstaffoverheadsrate").setRequiredLevel('none');
        }
        /*
                if (formContext.getAttribute('ccrm_estprojectexpenses_num').getValue() == null) {
                    result = false;
                    highlightField(null, '#ccrm_estprojectexpenses_num');
                    formContext.getAttribute("ccrm_estprojectexpenses_num").setRequiredLevel('required');
                } else {
                    highlightField(null, '#ccrm_estprojectexpenses_num', true);
                    formContext.getAttribute("ccrm_estprojectexpenses_num").setRequiredLevel('none');
                }
        */
        if (formContext.getAttribute('arup_expenses_num').getValue() == null) {
            result = false;
            highlightField(null, '#arup_expenses_num');
            formContext.getAttribute("arup_expenses_num").setRequiredLevel('required');
        } else {
            highlightField(null, '#arup_expenses_num', true);
            formContext.getAttribute("arup_expenses_num").setRequiredLevel('none');
        }
        /*
                if (formContext.getAttribute('ccrm_projecttotalcosts_num').getValue() == null) {
                    result = false;
                    highlightField(null, '#ccrm_projecttotalcosts_num');
                    formContext.getAttribute("ccrm_projecttotalcosts_num").setRequiredLevel('required');
                } else {
                    highlightField(null, '#ccrm_projecttotalcosts_num', true);
                    formContext.getAttribute("ccrm_projecttotalcosts_num").setRequiredLevel('none');
                }
        */
        if (formContext.getAttribute('ccrm_chargingbasis').getValue() == null && formContext.getAttribute('ccrm_arupbusinessid').getValue()[0].name != 'Charity & Community') {
            result = false;
            highlightField(null, '#ccrm_chargingbasis');
            highlightField('#header_process_ccrm_chargingbasis', null);
            formContext.getAttribute("ccrm_chargingbasis").setRequiredLevel('required');
        } else {
            highlightField(null, '#ccrm_chargingbasis', true);
            highlightField(null, '#ccrm_chargingbasis', true);
            formContext.getAttribute("ccrm_chargingbasis").setRequiredLevel('none');
        }

        if (result)
            formContext.getAttribute("ccrm_financedetailscaptured").setValue("Completed");
        else
            formContext.getAttribute("ccrm_financedetailscaptured").setValue(null);

        formContext.getAttribute("ccrm_financedetailscaptured").setSubmitMode("always");

        //formContext.data.save();
    }
    return result;
}

// implementation pending
function IsBidReviewChair() {
    var result = false;
    var currUser = formContext.context.getUserId();
    if (formContext.getAttribute('ccrm_bidreviewchair_userid').getValue() != null) {
        if (currUser == formContext.getAttribute('ccrm_bidreviewchair_userid').getValue()[0].id)
            result = true;
    }
    return result;
}

function updateBidReviewForm(formContext) {
    if (getStageId(formContext) == ArupStages.BidReviewApproval) {
        var panelname = formContext.getAttribute('ccrm_bidreviewchair_userid').getValue()[0].name;
        //SDK.REST.retrieveMultipleRecords("Ccrm_bidreview", "$orderby=CreatedOn desc&$select=Ccrm_bidreviewId&$top=1&$filter=Ccrm_OpportunityId/Id eq (guid'" + formContext.data.entity.getId() + "')",
        //    function (results) {
        //        if (results.length > 0) {
        //            updateBidreviewPanel(results[0].Ccrm_bidreviewId, panelname);
        //        }
        //    },
        //    errorHandler,
        //    function () { },
        //    false);


        Xrm.WebApi.online.retrieveMultipleRecords("ccrm_bidreview", "?$select=ccrm_bidreviewid&$filter=_ccrm_opportunityid_value eq '" + formContext.data.entity.getId() + "'&$orderby=createdon desc&$top=1").then(
            function success(results) {
                if (results.length > 0) {
                    updateBidreviewPanel(results.entities[0]["ccrm_bidreviewid"], panelname);
                }

            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        );
    }
}

function updateBidreviewPanel(bidreviewid, panelname) {
    //var bidreview = {};
    //bidreview.Ccrm_ReviewPanel = panelname;
    //SDK.REST.updateRecord(bidreviewid, bidreview, "Ccrm_bidreview", function () { }, errorHandler);

    var entitybidreview = {};
    entitybidreview.ccrm_reviewpanel = panelname;

    Xrm.WebApi.online.updateRecord("ccrm_bidreview", bidreviewid, entitybidreview).then(
        function success(result) {
            var updatedEntityId = result.id;
        },
        function (error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
}

function bidreviewchair_userid_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    var regionName = formContext.getAttribute("ccrm_arupregionid").getValue()[0].name.toUpperCase();
    var newBidReviewChair = formContext.getControl("header_process_ccrm_bidreviewchair_userid1") || formContext.getControl("header_process_ccrm_bidreviewchair_userid");
    var currentbidreviewchair = formContext.getAttribute('ccrm_currentbidreviewchair').getValue();
    var oldBidReviewChair;
    if (newBidReviewChair != null) {
        if (newBidReviewChair.getAttribute() != null) {
            if (newBidReviewChair.getAttribute().getValue() != null) {
                if (newBidReviewChair.getAttribute().getValue().length > 0)
                    newBidReviewChair = newBidReviewChair.getAttribute().getValue()[0].id;
            }
        }
    }

    if (currentbidreviewchair != null && currentbidreviewchair.length > 0) {
        oldBidReviewChair = currentbidreviewchair[0].id;
    }

    if (regionName == "AUSTRALASIA REGION" || regionName == "MALAYSIA REGION") {

        var BMBR = formContext.getAttribute('ccrm_bidmanager_userid').getValue()[0].id,
            BDBR = formContext.getAttribute('ccrm_biddirector_userid').getValue()[0].id;

        if (newBidReviewChair == BMBR || newBidReviewChair == BDBR) {

            if (newBidReviewChair != null && newBidReviewChair.length > 0 && oldBidReviewChair != null && oldBidReviewChair.length > 0) {

                Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                    '<font size="3" color="#000000"></br>Please be aware that changing the Bid Review Chair will update the Review Panel of existing Bid Review Form record and notification will be send to new Bid Review Chair.</br></br>Click Approve to confirm and save the record, or Do Not Approve to stay on the current page.</font>',
                    [
                        {
                            label: "<b>Approve</b>",
                            callback: function () {
                                //Date - 04/04/2016 - To identify whether Bid Review Chair person is changed
                                if (formContext.getAttribute('ccrm_currentbidreviewchair').getValue() != null) {
                                    if (formContext.getAttribute('ccrm_bidreviewchair_userid').getValue()[0].id !=
                                        formContext.getAttribute('ccrm_currentbidreviewchair').getValue()[0].id) {
                                        updateBidReviewForm(formContext);
                                    }
                                }
                                if (formContext.data.entity.getIsDirty()) { formContext.data.save(); }
                            },
                            setFocus: false,
                            preventClose: false
                        },
                        {
                            label: "<b>Do Not Approve</b>",
                            callback: function () { formContext.getAttribute("ccrm_bidreviewchair_userid").setValue(oldBidReviewChair); },
                            setFocus: true,
                            preventClose: false
                        }
                    ],
                    "WARNING", 550, 350, '', true);
            }
        } else {
            Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
                '<font size="3" color="#000000"></br> Please select either the Bid Manager or the Bid Director</font>',
                [
                    { label: "<b>OK</b>", setFocus: true },
                ],
                "ERROR", 500, 250, '', true);
            formContext.getAttribute("ccrm_bidreviewchair_userid").setValue(null);
        }
    } else {

        if (newBidReviewChair != null && newBidReviewChair.length > 0 && oldBidReviewChair != null && oldBidReviewChair.length > 0) {

            Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                '<font size="3" color="#000000"></br>Please be aware that changing the Bid Review Chair will update the Review Panel of existing Bid Review Form record and notification will be send to new Bid Review Chair.</br></br>Click Approve to confirm and save the record, or Do Not Approve to stay on the current page.</font>',
                [
                    {
                        label: "<b>Approve</b>",
                        callback: function () {

                            //Date - 04/04/2016 - To identify whether Bid Review Chair person is changed
                            if (formContext.getAttribute('ccrm_currentbidreviewchair').getValue() != null) {
                                if (formContext.getAttribute('ccrm_bidreviewchair_userid').getValue()[0].id !=
                                    formContext.getAttribute('ccrm_currentbidreviewchair').getValue()[0].id) {
                                    updateBidReviewForm(formContext);
                                }
                            }
                            if (formContext.data.entity.getIsDirty()) { formContext.data.save(); }
                        },
                        setFocus: false,
                        preventClose: false
                    },
                    {
                        label: "<b>Do Not Approve</b>",
                        callback: function () { formContext.getAttribute("ccrm_bidreviewchair_userid").setValue(oldBidReviewChair); },
                        setFocus: true,
                        preventClose: false
                    }
                ], "WARNING", 550, 350, '', true);
        }
    }
}// Bid Review Approval -  ribbon button click - ends

function IsCrossRegionBid(formContext) {

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
}

function ValidatePJNGrpLdr() {

    if (formContext.getAttribute("ccrm_arupregionid").getValue() != null)
        regionName = formContext.getAttribute("ccrm_arupregionid").getValue()[0].name;
    if (regionName == ArupRegionName.EastAsia) {
        if (formContext.getAttribute('ccrm_groupleaderapprovaloptions').getValue() != 100000001) {
            formContext.getAttribute('ccrm_groupleaderapprovaloptions').setValue(100000001);
            formContext.getAttribute("ccrm_groupleaderapprovaloptions").setSubmitMode("always");
            formContext.data.save();
        }
    }
}
//This function is called from Ribbon :ccrm.opportunity.SectorLeaderApproval.Command
function CJNApprovalButtonClick(formContext,type, approvalType, statusField, userField, dateField) {

    if (!IsFormValid(formContext)) { return };

    var ackMsg = ApprovalConfirmationMessage(approvalType);
    var msg = 'You are about to approve a Bid where you are not listed as approver. \n Do you want to Continue ?';
    var output = ValidateApproval(formContext,msg, approvalType);

    if (formContext.data.entity.getIsDirty()) { formContext.data.save(); }

    if (approvalType == "FinanceApproval" ||
        approvalType == "AccCenterLeadApproval" ||
        approvalType == "GroupLeaderApproval") {

        if (output == true) {

            var apprType;

            switch (approvalType) {

                case 'FinanceApproval':
                    apprType = 'Finance';
                    break;
                case 'AccCenterLeadApproval':
                    apprType = 'Accounting Centre Leader';
                    break;
                case 'GroupLeaderApproval':
                    apprType = 'Group Leader';
                    break;
                case 'ProjectManagerApproval':
                    apprType = 'Project Manager/Director';
                    break;
                default:
                    apprType = approvalType;
                    break;
            }

            Alert.show('<font size="6" color="#3175e2"><b>Confirm your selection</b></font>',
                '<font size="3" color="#000000"></br>Are you sure you want to proceed with ' + apprType + ' approval? Click "YES" to confirm your selection or "Do not approve" to cancel it.</font>',
                [
                    { label: "<b>Do not approve</b>", setFocus: true },
                    {
                        label: "<b>Yes</b>", setFocus: false, callback: function () {

                            approveCallbackAction(formContext,approvalType);
                            formContext.getAttribute(statusField).fireOnChange();
                            formContext.ui.clearFormNotification('CurrentApprovers');

                            if (approvalType == 'FinanceApproval') {
                                // Poll for the opportunity to enter the Won state
                                pollForChangeAsync(formContext,
                                    "statecode",
                                    function isWon(statecode) {
                                        return !!statecode && statecode.Value != OPPORTUNITY_STATE.OPEN
                                    },
                                    function reloadForm() {
                                        Xrm.Utility.openEntityForm(formContext.data.entity.getEntityName(), formContext.data.entity.getId());
                                    });
                            } else {
                                setCurrentApproversAsync(formContext);
                            }
                        },
                    }
                ],
                "QUESTION", 500, 250, '', true);
        } else {

            Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
                '<font size="3" color="#000000"></br>' + ackMsg + '</font>',
                [
                    { label: "<b>OK</b>", setFocus: true },
                ],
                "ERROR", 500, 250, '', true);
        }

    } else {

        Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
            '<font size="3" color="#000000"></br>' + ackMsg + '</font>',
            [
                {
                    label: "<b>Proceed with Approval</b>",
                    callback: function () {

                        approveCallbackAction(formContext,approvalType);
                        formContext.getAttribute(statusField).fireOnChange();
                        formContext.ui.clearFormNotification('CurrentApprovers');

                        if (approvalType == 'FinanceApproval' ||
                            approvalType == 'AccCenterLeadApproval' ||
                            approvalType == "GroupLeaderApproval") {
                            Xrm.Utility.openEntityForm(formContext.data.entity.getEntityName(), formContext.data.entity.getId());
                        } else {
                            setCurrentApproversAsync(formContext);
                        }
                    },
                    setFocus: false,
                    preventClose: false
                },
                {
                    label: "<b>Do Not Approve</b>",
                    setFocus: true,
                    preventClose: false
                }
            ],
            "WARNING", 550, 300, '', true);
    }
}

//function for the oppo progress button 
possibleJNRequired_onChange = function (formContext) {
    debugger;
    // Job required = true - we will simulate the get job number button 

    if (formContext.getAttribute("ccrm_possiblejobnumberrequired").getValue() == 1) {
        if (formContext.getAttribute("ccrm_sys_dtp_gateway").getValue() != true) {
            var regionName = formContext.getAttribute("ccrm_arupregionid").getValue()[0].name;
            formContext.getAttribute("ccrm_sys_dtp_gateway").setValue(true);
            //setRequiredFields_DecisionToProceed();
            formContext.getAttribute("ccrm_pjn_opportunitytype").setValue(OpportunityType.Full);
            if (regionName == "East Asia Region" || regionName == "Australasia Region" || regionName == "Malaysia Region"
                && regionName != null) {
                formContext.getAttribute("ccrm_sys_dtb_approval").setValue(false);
            }
            formContext.ui.refreshRibbon();
        }
    }
    // set bid review gateway value from ribbon button Request Bid Review without Possible Job Number (2)
    else if (formContext.getAttribute("ccrm_possiblejobnumberrequired").getValue() == 0) {
        if (formContext.getAttribute("ccrm_sys_bidreview_gateway").getValue() != true) {
            formContext.getAttribute("ccrm_sys_bidreview_gateway").setValue(true);
            formContext.getAttribute("ccrm_pjn_opportunitytype").setValue(OpportunityType.Simple);
            formContext.ui.refreshRibbon();
        }
    }
    if (formContext.getAttribute("ccrm_arupregionid").getValue() != null) {
        var regionName = formContext.getAttribute("ccrm_arupregionid").getValue()[0].name;
        if ((regionName == "UKMEA Region" || regionName == "UKIMEA Region" || regionName == "UKIMEA" || regionName == "UKMEA" ||
            regionName == "Americas Region" ||
            regionName == "Europe" ||
            regionName == "Corporate Services" ||
            regionName == "Digital Technology") &&
            formContext.getAttribute("ccrm_pjna").getValue() != "Requested") {
            var msgOut = "By clicking OK you will assign a possible job number. No approval requests will be sent.\n\nYou must ensure that you have completed all the requirements of your regional bid policy and attached supporting evidence - such as a Decision to Proceed record signed by a Director.\n\nIf you are not sure if you have complied with your regional requirements please consult a Director before progressing.";
            var response = window.confirm(msgOut);
            if (response) {
                formContext.getAttribute("ccrm_sys_dtb_approval").setValue(true);
                formContext.getAttribute("ccrm_sys_pjnrequesteduser_trigger").setValue(true);
                formContext.getAttribute("ccrm_sys_phasename").setValue("Possible Job – Bid in Development");
                formContext.getAttribute("ccrm_pjna").setValue("Requested");

                formContext.ui.setFormNotification("A possible Job number is being generated it may take a couple of minutes to appear on the opportunity screen and couple of hours to appear on the financial systems.", "INFO", "PJNProgress");
                setTimeout(function () { formContext.ui.clearFormNotification("PJNProgress"); }, 10000);
                formContext.data.save();
            } else {
                formContext.getAttribute("ccrm_possiblejobnumberrequired").setValue(null);
                resetSysFlags(formContext);
                formContext.getAttribute("ccrm_showpjnbutton").setValue(1);
                formContext.data.save();
            }
        }
        // All Other regions
        else {
            if (regionName == "East Asia Region" || regionName == "Australasia Region" || regionName == "Malaysia Region") {

                formContext.getAttribute("ccrm_sys_dtb_approval").setValue(false);
                formContext.getAttribute("ccrm_sys_op_trigger").setValue('1'); //opportunity progress workflow trigger - OP: 1.0: Trigger            
                formContext.getAttribute("ccrm_sys_pjnrequesteduser_trigger").setValue(true);
                //sets the trigger to set the pjn user from plugin - also used to lock down the track fields
                formContext.getAttribute("ccrm_sys_pjnrequesteduser_trigger").setSubmitMode("always");
                customerid_onChange(formContext); //check if a valid customer is set and if not set a notification                
                ccrm_opportunitytype_onchange(formContext);
                //check if the opportunity has a valid track and if not set a notification
                formContext.ui.setFormNotification("Your request for a Possible Job Number has been logged. Decision to Proceed approvals are being generated.", "INFO", "PJNProgress");
                setTimeout(function () { formContext.ui.clearFormNotification("PJNProgress"); }, 10000);
                formContext.data.save();
            }
        }
    }
}

//function to reset system flags
function resetSysFlags(formContext) {
    var sysDTP = formContext.getAttribute("ccrm_sys_dtp_gateway").getValue();
    var sysBR = formContext.getAttribute("ccrm_sys_bidreview_gateway").getValue();
    var sysDTPApproved = formContext.getAttribute("ccrm_sys_dtb_approval").getValue();
    var sysBRApproved = formContext.getAttribute("ccrm_sys_br_review").getValue();
    var sysOppotype = formContext.getAttribute("ccrm_pjn_opportunitytype").getValue();
    var statusCode = formContext.getAttribute("statuscode").getValue();

    if (statusCode == 200013) { // Status = Open Lead
        if (sysDTP == true && sysOppotype == OpportunityType.Full) {
            formContext.getAttribute("ccrm_sys_dtp_gateway").setValue(false) //reset the dtp flag
            formContext.getAttribute("ccrm_pjn_opportunitytype").setValue(null);
        } else if (sysBR == true && sysOppotype == OpportunityType.Simple) {
            formContext.getAttribute("ccrm_sys_bidreview_gateway").setValue(false); //reset the br flag
            formContext.getAttribute("ccrm_pjn_opportunitytype").setValue(null);
        }
    } else {
        if (sysDTP == true && sysDTPApproved == false && sysOppotype == OpportunityType.Full) {
            formContext.getAttribute("ccrm_sys_dtp_gateway").setValue(false);
        } else if (sysBR == true && sysBRApproved == false && sysOppotype == OpportunityType.Full) {
            formContext.getAttribute("ccrm_sys_bidreview_gateway").setValue(false);
        } else if (sysBR == true && sysBRApproved == false && sysOppotype == OpportunityType.Simple) {
            formContext.getAttribute("ccrm_sys_bidreview_gateway").setValue(false);
        }
    }
    if (formContext.getAttribute("ccrm_sys_op_trigger").getValue() == 1)
        formContext.getAttribute("ccrm_sys_op_trigger").setValue(null);
}

function moveNext(formContext,currentStage) {
    var pollingAttemptsRemaining = 10;
    var intervalId;
    //Cycle through code every 2 seconds for dirty check
    intervalId = setInterval(function () {
        pollingAttemptsRemaining -= 1;
        if (formContext.data.process.getActiveStage().getId() != currentStage) {
            clearInterval(intervalId);
        }

        if (formContext.data.entity.getIsDirty()) { formContext.data.entity.save(); }

        //Check if form is dirty, if it is not and the stage has not changed then attempt to moveNext
        if (!formContext.data.entity.getIsDirty() && formContext.data.process.getActiveStage().getId() == currentStage) {

            formContext.data.process.moveNext(moveResult);
            pollingAttemptsRemaining = 0;
            clearInterval(intervalId);
        }

        //If number of attempts remaining has passed exit code
        if (pollingAttemptsRemaining <= 0) {
            clearInterval(intervalId);
        }
    }, 1000);
}

function moveResult(args) {
    var a = args;
}

function requestConfirmJob(formContext) {

    var arupInternal = formContext.getAttribute('ccrm_arupinternal').getValue();

    var v1 = formContext.getAttribute('ccrm_chargingbasis').getValue();
    var v2 = formContext.getAttribute('ccrm_estexpenseincome_num').getValue();
    var v3 = formContext.getAttribute('ccrm_projecttotalincome_num').getValue();
    var v4 = formContext.getAttribute('ccrm_projectmanager_userid').getValue();
    var v5 = formContext.getAttribute('ccrm_projectdirector_userid').getValue();
    var v6 = formContext.getAttribute('ccrm_estprojectresourcecosts_num').getValue();
    var v7 = formContext.getAttribute('ccrm_estarupinvolvementstart').getValue();
    var v8 = formContext.getAttribute('ccrm_estarupinvolvementend').getValue();
    var v9 = formContext.getAttribute('ccrm_estimatedvalue_num').getValue();
    var v10 = formContext.getAttribute('ccrm_estprojectoverheads_num').getValue();
    var v11 = formContext.getAttribute('ccrm_estprojectexpenses_num').getValue();
    var v12 = formContext.getAttribute('ccrm_projecttotalcosts_num').getValue();
    var v13 = formContext.getAttribute('ccrm_estprojectprofit_num').getValue();
    var v14 = formContext.getAttribute('ccrm_profitasapercentageoffeedec').getValue();
    var v19 = formContext.getAttribute('ccrm_shorttitle').getValue();
    // the fields below should only be mandatory for external opporutnities for CJN's
    var v15 = formContext.getAttribute('arup_projecttype').getValue();
    var v16 = formContext.getAttribute('arup_services').getValue();
    var v17 = formContext.getAttribute('arup_projectsector').getValue();
    var v18 = formContext.getAttribute('ccrm_pilevelmoney_num').getValue();
    var v21 = formContext.getAttribute('ccrm_pirequirement').getValue();

    var v20 = 0; //needs to be 1
    validateAccCenter(formContext,false);
    v20 = formContext.getAttribute('ccrm_validaccountingcentre').getValue(); //needs to be 1

    var incompleteData = false;

    if (v1 == null ||
        v2 == null ||
        v3 == null ||
        v4 == null ||
        v5 == null ||
        v6 == null ||
        v7 == null ||
        v8 == null ||
        v9 == null ||
        v10 == null ||
        v11 == null ||
        v12 == null ||
        v13 == null ||
        v14 == null ||
        v19 == null) incompleteData = true;

  
    if (!arupInternal && !incompleteData && ((v15 == null || v15.length == 0) ||(v16 == null || v16.length == 0) ||(v17== null || v17.length == 0 ) || (v21 == PI_REQUIREMENT.MIN_COVER && v18 == null)))
        incompleteData = true;

    if (v20 == 0) { }
    else if (incompleteData) {
        formContext.data.save();
        formContext.ui.setFormNotification("Please fill in all mandatory fields", "WARNING", "reqCJNWarnMsg-mandfields");
        setTimeout(function () { formContext.ui.clearFormNotification("reqCJNWarnMsg-mandfields"); }, 10000);

        //highlightField('#header_process_ccrm_chargingbasis', '#ccrm_chargingbasis', (v1 != null) ? true : false);
        //highlightField('#header_process_ccrm_estexpenseincome_num1', '#ccrm_estexpenseincome_num', (v2 != null) ? true : false);
        //highlightField('#header_process_ccrm_projecttotalincome_num', '#ccrm_projecttotalincome_num', (v3 != null) ? true : false);
        //highlightField('#header_process_ccrm_projectmanager_userid1', '#ccrm_projectmanager_userid', (v4 != null) ? true : false);
        //highlightField('#header_process_ccrm_projectdirector_userid1', '#ccrm_projectdirector_userid', (v5 != null) ? true : false);
        //highlightField(null, '#ccrm_estprojectresourcecosts_num', (v6 != null) ? true : false);
        //highlightField('#header_process_ccrm_estarupinvolvementstart', '#ccrm_estarupinvolvementstart', (v7 != null) ? true : false);
        //highlightField('#header_process_ccrm_estarupinvolvementend', '#ccrm_estarupinvolvementend', (v8 != null) ? true : false);
        //highlightField('#header_process_ccrm_estimatedvalue_num2', '#ccrm_estimatedvalue_num', (v9 != null) ? true : false);
        //highlightField(null, '#ccrm_estprojectoverheads_num', (v10 != null) ? true : false);
        //highlightField('#header_process_ccrm_estprojectexpenses_num1', '#ccrm_estprojectexpenses_num', (v11 != null) ? true : false);
        //highlightField('#header_process_ccrm_projecttotalcosts_num', '#ccrm_projecttotalcosts_num', (v12 != null) ? true : false);
        //highlightField('#header_process_ccrm_estprojectprofit_num', '#ccrm_estprojectprofit_num', (v13 != null) ? true : false);
        //highlightField('#header_process_ccrm_profitasapercentageoffeedec', '#ccrm_profitasapercentageoffeedec', (v14 != null) ? true : false);
        //highlightField(null, "#ccrm_shorttitle", (v19 != null) ? true : false);
        formContext.getAttribute("ccrm_shorttitle").setRequiredLevel("required");

        if (!arupInternal) {
            //highlightField('#header_process_arup_projecttype', '', (v15 != null) ? true : false);
            //highlightField('#header_process_arup_services', '', (v16 != null) ? true : false);
            //highlightField('#header_process_arup_projectsector', '', (v17 != null) ? true : false);
            //highlightField('#header_process_ccrm_pilevelmoney_num1', '#ccrm_pilevelmoney_num', (v21 == PI_REQUIREMENT.MIN_COVER && v18 != null) ? true : false);
        }
    } else {
        if (formContext.data.entity.getIsDirty()) { formContext.data.save(); }
        //[RS - Added project participant check for PBI - 39838]
        var projPartApp = formContext.getAttribute("arup_projpartreqd").getValue();
        var currUserId = formContext.context.getUserId();
        var lstCJNUsr = formContext.getAttribute("arup_aruplastcjnclickuser").getValue();
        var lstCJNUsrId = (lstCJNUsr != null) ? lstCJNUsr[0].id : null;
        if (projPartApp == 770000000) {

            var ProjectPartExists = projectParticipantExists(formContext);
            if (ProjectPartExists == true) {
                if (lstCJNUsrId = null || lstCJNUsrId != currUserId) {

                    Alert.show('<font face="Segoe UI Light" font size="6" color="0472C4">Please Review</font>',
                        '<font face="Segoe UI Light" font size="3" color="#000000"></br>Would you like to add more Project Collaborators before requesting a Confirmed Job?</font>',
                        [
                            {
                                label: "<b>Yes - Add More Collaborators</b>",
                                callback: function () { },
                                setFocus: true,
                                preventClose: false
                            },
                            {
                                label: "<b>No - Proceed to CJN</b>",
                                callback: function () { setTimeout(function () { openNewCJNAForm(formContext,true); }, 1500); },
                                setFocus: false,
                                preventClose: false
                            }
                        ], 'INFO', 500, 250, '', true);
                }
                else {
                    setTimeout(function () { openNewCJNAForm(formContext,true); }, 1500);
                }
            }
            else {

                Alert.show('<font face="Segoe UI Light" size="6" color="#FF0000">Add Project Collaborators</font>',
                    '<font face="Segoe UI Light" size="3" color="#000000">You said that Project Collaborators are required.</br>Please add them before requesting a Confirmed Job Number.</font>',
                    [
                        { label: "<b>OK</b>", setFocus: true },
                    ], "ERROR", 500, 230, '', true);
            }
        }
        else {
            Alert.show('<font face="Segoe UI Light" font size="6" color="0472C4">Please Review</font>',
                '<font face="Segoe UI Light" font size="3" color="#000000"></br>Do you have Project Collaborators you want to add before requesting a Confirmed Job?</font>',
                [
                    {
                        label: "<b>Yes - Add Project Collaborators</b>",
                        callback: function () {
                            //set arup_aruplastcjnclickuser field with the current user who is requesting CJN
                            SetLookupField(formContext,formContext.context.getUserId(), formContext.context.getUserName(), 'systemuser', 'arup_aruplastcjnclickuser');
                            formContext.getAttribute("arup_projparticipants_reqd").setValue(true);
                            formContext.getAttribute("arup_projpartreqd").setValue(770000000);
                            formContext.data.save();
                            var parameters = {}; //set null parameters as there is no need to set any other field
                            parameters["arup_opportunity"] = formContext.data.entity.getId();
                            parameters["arup_opportunityname"] = formContext.getAttribute("name").getValue();
                            setTimeout(function () { openProjectParticipantPage(parameters); }, 2500);
                        },
                        setFocus: true,
                        preventClose: false

                    },
                    {
                        label: "<b>No - Proceed to CJN</b>",
                        callback: function () {
                            setTimeout(function () { openNewCJNAForm(formContext,true); }, 2000);
                        },
                        setFocus: false,
                        preventClose: false
                    }
                ], 'QUESTION', 500, 230, '', true);
        }
    }
}

function ccrm_geographicmanagerproxyconsulted2_onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    var countrymgrconsulted = formContext.getAttribute("ccrm_geographicmanagerproxyconsulted2").getValue();
    if (countrymgrconsulted == 2) {
        formContext.getAttribute("ccrm_reasonfornotconsultingcountrymanager").setRequiredLevel("required");
        formContext.getAttribute("ccrm_dateconsulted").setRequiredLevel("none");
        formContext.getAttribute("ccrm_dateconsulted").setValue(null);
        highlightField('#header_process_ccrm_reasonfornotconsultingcountrymanager', '#ccrm_reasonfornotconsultingcountrymanager');
        highlightField('#header_process_ccrm_dateconsulted', '#ccrm_dateconsulted', true);
    } else if (countrymgrconsulted == 1) {
        formContext.getAttribute("ccrm_reasonfornotconsultingcountrymanager").setRequiredLevel("none");
        formContext.getAttribute("ccrm_reasonfornotconsultingcountrymanager").setValue(null);
        formContext.getAttribute("ccrm_dateconsulted").setRequiredLevel("required");
        highlightField('#header_process_ccrm_reasonfornotconsultingcountrymanager', '#ccrm_reasonfornotconsultingcountrymanager', true);
        highlightField('#header_process_ccrm_dateconsulted', '#ccrm_dateconsulted');
    }
}

reasonnotconsulted_onChange = function () {
    if (formContext.getAttribute("ccrm_reasonfornotconsultingcountrymanager").getValue() != null) {
        formContext.getAttribute("ccrm_geographicmanagerproxyconsulted2").setValue(2);
        formContext.getAttribute("ccrm_geographicmanagerproxyconsulted2").fireOnChange();

    } else if (formContext.getAttribute("ccrm_geographicproxyid").getValue() != null ||
        formContext.getAttribute("ccrm_dateconsulted").getValue() != null) {
        formContext.getAttribute("ccrm_geographicmanagerproxyconsulted2").setValue(1);
        formContext.getAttribute("ccrm_geographicmanagerproxyconsulted2").fireOnChange();

    }
}

ccrm_dateconsulted_onChange = function (executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("ccrm_dateconsulted").getValue() != null) {
        formContext.getAttribute("ccrm_geographicmanagerproxyconsulted2").setValue(1);
        formContext.getAttribute("ccrm_geographicmanagerproxyconsulted2").fireOnChange();

    } else if (formContext.getAttribute("ccrm_geographicproxyid").getValue() != null ||
        formContext.getAttribute("ccrm_geographicmanagerproxyconsulted2").getValue() != null) {
        formContext.getAttribute("ccrm_geographicmanagerproxyconsulted2").setValue(2);
        formContext.getAttribute("ccrm_geographicmanagerproxyconsulted2").fireOnChange();

    }
}

function fnBtnAddNewJobNumberSuffix() {
    openNewCJNAForm(false);
}

function openNewCJNAForm(formContext,reserve) {
    var parameters = {};
    parameters["ccrm_name"] = formContext.getAttribute("ccrm_shorttitle").getValue();

    if (formContext.getAttribute("ccrm_projectmanager_userid").getValue() != null) {
        parameters["ccrm_projectmanager_userid"] = formContext.getAttribute("ccrm_projectmanager_userid").getValue()[0].id;
        parameters["ccrm_projectmanager_useridname"] = formContext.getAttribute("ccrm_projectmanager_userid").getValue()[0].name;
    }
    if (formContext.getAttribute("ccrm_projectid").getValue() != null) {
        parameters["ccrm_projectid"] = formContext.getAttribute("ccrm_projectid").getValue()[0].id;
        parameters["ccrm_projectidname"] = formContext.getAttribute("ccrm_projectid").getValue()[0].name;
    }
    if (formContext.getAttribute("ccrm_projectdirector_userid").getValue() != null) {
        parameters["ccrm_projectdirector_userid"] = formContext.getAttribute("ccrm_projectdirector_userid").getValue()[0].id;
        parameters["ccrm_projectdirector_useridname"] = formContext.getAttribute("ccrm_projectdirector_userid").getValue()[0].name;
    }

    if (formContext.getAttribute("ccrm_jna").getValue() != null) {
        parameters["ccrm_opportunitycjn"] = formContext.getAttribute("ccrm_jna").getValue();
    }

    if (formContext.getAttribute("ccrm_arupinternal").getValue() != null) {
        var isArupInternal = 0;
        if (formContext.getAttribute("ccrm_arupinternal").getValue() == true)
            isArupInternal = 1;

        parameters["ccrm_arupinternal"] = isArupInternal;
    }

    if (formContext.getAttribute("ccrm_arupcompanyid").getValue() != null) {
        parameters["ccrm_arupcompanyid"] = formContext.getAttribute("ccrm_arupcompanyid").getValue()[0].id;
        parameters["ccrm_arupcompanyidname"] = formContext.getAttribute("ccrm_arupcompanyid").getValue()[0].name;
    }

    if (formContext.getAttribute("ccrm_accountingcentreid").getValue() != null) {
        parameters["ccrm_arupaccountingcodeid"] = formContext.getAttribute("ccrm_accountingcentreid").getValue()[0].id;
        parameters["ccrm_arupaccountingcodeidname"] = formContext.getAttribute("ccrm_accountingcentreid").getValue()[0].name;
    }

    parameters["ccrm_opportunityid"] = formContext.data.entity.getId();
    parameters["ccrm_opportunityidname"] = formContext.getAttribute("name").getValue();

    if (reserve)
        parameters["ccrm_sys_reservejobnumber"] = 1

    Xrm.Utility.openEntityForm("ccrm_cjnapplication", null, parameters);
}

//sync bid manager with project manager
function Syncbidmanager_userid(executionContext) {
    debugger;
    formContext = executionContext.getFormContext();
    if (formContext.getAttribute("ccrm_bidmanager_userid").getValue() != null) {
        //Added by Jugal on 5-4-2018 for 47489
        var isNewUserValid = ValidateBidManager_onChange(formContext);

        if (formContext.getAttribute("ccrm_bidmanager_userid").getValue() != null &&
            formContext.getAttribute("ccrm_projectmanager_userid").getValue() == null) {
            //get the region name.
            var arupRegionData = getArupRegionName(formContext, "ccrm_arupregionid");
            var region;
            var regName;
            if (arupRegionData[0] != null) {
                region = arupRegionData[0];
                regName = arupRegionData[1];
            }
            // var regName = getArupRegionName();
            //if EAR check accreditation level.
            //isNewUserValid fieldcondition is added by Jugal on 5-4-2018 for 47489
            if (regName != null && regName.toLowerCase() == (ArupRegionName.EastAsia).toLowerCase() && isNewUserValid) {
                var accLevel = EAAccreditaionLevRequired(formContext);
                //if EAR accreditation level is null, then update project manager as bid manager
                if (accLevel == "") {
                    formContext.getAttribute("ccrm_projectmanager_userid")
                        .setValue(formContext.getAttribute("ccrm_bidmanager_userid").getValue());
                }
            }
            //isNewUserValid fieldcondition is added by Jugal on 5-4-2018 for 47489
            else if (isNewUserValid) {
                formContext.getAttribute("ccrm_projectmanager_userid")
                    .setValue(formContext.getAttribute("ccrm_bidmanager_userid").getValue());
            }
        }
    }
}

//sync bid director with projectdirector
function Syncbiddirector_userid(executionContext) {
    formContext = executionContext.getFormContext();

    if (formContext.getAttribute("ccrm_biddirector_userid").getValue() != null) {
        //Added by Jugal on 5-4-2018 for 47489
        var isNewUserValid = ValidateBidDirector_onchange(formContext);

        if (formContext.getAttribute("ccrm_biddirector_userid").getValue() != null &&
            formContext.getAttribute("ccrm_projectdirector_userid").getValue() == null) {
            //get the region name.
            var arupRegionData = getArupRegionName(formContext, "ccrm_arupregionid");
            var region;
            var regName;
            if (arupRegionData[0] != null) {
                region = arupRegionData[0];
                regName = arupRegionData[1];
            }
            //var regName = getArupRegionName("ccrm_arupregionid");
            //if EAR check accreditation level.
            //isNewUserValid fieldcondition is added by Jugal on 5-4-2018 for 47489
            if (regName != null && regName.toLowerCase() == (ArupRegionName.EastAsia).toLowerCase() && isNewUserValid) {
                var accLevel = EAAccreditaionLevRequired(formContext);
                //if EAR accreditation level is null, then update project manager as bid manager
                if (accLevel == "") {
                    formContext.getAttribute("ccrm_projectdirector_userid")
                        .setValue(formContext.getAttribute("ccrm_biddirector_userid").getValue());
                }
            }
            //isNewUserValid fieldcondition is added by Jugal on 5-4-2018 for 47489
            else if (isNewUserValid) {
                formContext.getAttribute("ccrm_projectdirector_userid").setValue(formContext.getAttribute("ccrm_biddirector_userid").getValue());
            }
        }
    }
}

function ProvisionDWBidsSite(formContext) {
    if (formContext.getAttribute("arup_bidsiterequested").getValue() != true) {
        var oppId = formContext.data.entity.getId().replace(/[{}]/g, "");
        if (!isFormValidForBidSite(formContext)) {

            Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
                '<font size="3" color="#000000"></br>Please, fill out all of the mandatory fields for this stage first.</font>',
                [
                    { label: "<b>OK</b>", setFocus: true },
                ],
                "ERROR",
                450,
                200,
                '',
                true);
            return;
        };

        Alert.show('<font size="6" color="#2E74B5"><b>Please Confirm</b></font>',
            '<font size="3" color="#000000"></br>You have requested the creation of a Bid Site to support this opportunity.</br></br>Please click “Proceed” if this is correct, or click “Cancel” to go back to the opportunity form.</font>',
            [
                new Alert.Button("<b>Proceed</b>",
                    function () {
                        var parameters = {};
                        parameters.bidsite = true;

                        var req = new XMLHttpRequest();
                        req.open("POST", formContext.context.getClientUrl() + "/api/data/v9.1/opportunities(" + oppId + ")/Microsoft.Dynamics.CRM.arup_RequestBidSite", false);
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
                        req.send(JSON.stringify(parameters));


                        Alert.show('<font size="6" color="#2E74B5"><b>Information</b></font>',
                            '<font size="3" color="#000000"></br>Please note that it can take a few hours for the Bid Site to be available for use.</br></br>Please contact your local Service Desk if you have any issues.</font>',
                            [
                                {
                                    label: "<b>OK</b>",
                                    callback: function () {
                                        Xrm.Utility.openEntityForm("opportunity", oppId);
                                    },
                                    setFocus: true
                                },
                            ],
                            "INFO",
                            500,
                            250,
                            '',
                            true);
                    },
                    false,
                    false),
                new Alert.Button("Cancel")
            ],
            "INFO",
            500,
            250,
            '',
            true);
    }
}

function isFormValidForBidSite(formContext) {

    var stageid = getStageId(formContext);
    var result;
    var v1 = formContext.getAttribute('ccrm_bidmanager_userid').getValue();
    var v2 = formContext.getAttribute('ccrm_biddirector_userid').getValue();
    var v3 = formContext.getAttribute('name').getValue();
    var v4 = formContext.getAttribute('ccrm_reference').getValue();
    var v5 = formContext.getAttribute("ccrm_client").getValue();
    var v6 = formContext.getAttribute("ccrm_location").getValue();
    var v7 = formContext.getAttribute("arup_subbusiness").getValue();

    /****************CONDITIONALLY MANDATORY FIELDS*************************************************/
    var v8 = '1';
    var v9 = '1';
    var v10 = '1';

    //var procType = formContext.getAttribute("ccrm_contractarrangement").getValue();
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();

    //if (procType == 2) {
    //    v8 = formContext.getAttribute("ccrm_agreementnumber").getValue();
    //}
    //else
    //if (procType == 7) {
    //    v9 = formContext.getAttribute("ccrm_otherprocurementtypedetails").getValue();
    //}

    if (formContext.getAttribute("ccrm_arupregionid").getValue()[0].name.toUpperCase() == 'AMERICAS REGION' && formContext.getAttribute("ccrm_arupbusinessid").getValue()[0].name.toUpperCase() == 'EDUCATION') {
        v10 = formContext.getAttribute("arup_k12school").getValue();
    }

    if (v5 != null)
        v5 = v5[0].name;

    if (v1 == null ||
        v2 == null ||
        v3 == null ||
        v4 == null ||
        v5 == null ||
        (v5 == 'Unassigned' && arupInternal != true) ||
        v6 == null ||
        v7 == null ||
        //v8 == null ||
        v9 == null ||
        v10 == null) {

        formContext.ui.clearFormNotification("validcustomer");
        formContext.ui.setFormNotification("Please fill in all mandatory fields", "WARNING", "reqBidSiteWarnMsg");
        setTimeout(function () { formContext.ui.clearFormNotification("reqBidSiteWarnMsg"); }, 10000);
        if (v5 == 'Unassigned' && arupInternal != true) {
            formContext.ui.setFormNotification("Valid Client Needs to be Set for Bid Site to Be Provisioned", "WARNING", "reqBidSiteClientWarnMsg");
            setTimeout(function () { formContext.ui.clearFormNotification("reqBidSiteClientWarnMsg"); }, 10000);
        }
        highlightFildsBidSite(formContext,v1, v2, v3, v4, v5, v6, v7, v8, v9, v10);
        return false;
    }

    highlightFildsBidSite(formContext,v1, v2, v3, v4, v5, v6, v7, v8, v9, v10);

    if (stageid == ArupStages.BidDevelopment || stageid == ArupStages.BidReviewApproval) {
        var result = CheckFinanceFields(formContext);
        if (!result) {
            return false;
        }
    }
    else if (!IsFormValid(formContext)) {

        return false;

    }

    return true;
}


function highlightFildsBidSite(formContext,v1, v2, v3, v4, v5, v6, v7, v8, v9, v10) {

    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();

    $(document).ready(function () {
        highlightField('#header_process_ccrm_bidmanager_userid', '#ccrm_bidmanager_userid', (v1 != null) ? true : false);
        highlightField('#header_process_ccrm_biddirector_userid', '#ccrm_biddirector_userid', (v2 != null) ? true : false);
        highlightField(null, "#name", (v3 != null) ? true : false);
        highlightField(null, "#ccrm_reference", (v4 != null) ? true : false);
        highlightField(null, "#ccrm_client", ((v5 != null && v5 == 'Unassigned') && arupInternal == true) ? true : false);
        highlightField(null, "#ccrm_location", (v6 != null) ? true : false);
        highlightField(null, "#arup_subbusiness", (v7 != null) ? true : false);
        //highlightField('#header_process_ccrm_agreementnumber', '#ccrm_agreementnumber', (v8 != null) ? true : false);
        //highlightField('#header_process_ccrm_otherprocurementtypedetails', '#ccrm_otherprocurementtypedetails', (v9 != null) ? true : false);
        highlightField(null, "#arup_k12school", (v10 != null) ? true : false);

    })
}

function OpenDWBidsSiteLink(formContext) {

    var pjn = formContext.getAttribute("ccrm_pjna").getValue();
    var projectID = formContext.getAttribute("ccrm_reference").getValue();
    //if (pjn == null || pjn == 'Requested') {
    //    Alert.show('<font size="6" color="#2E74B5"><b>For your informaiton</b></font>',
    //        '<font size="3" color="#000000"></br>This opportunity has not been issued a PJN yet.</font>',
    //        [
    //            { label: "<b>OK</b>", setFocus: true },
    //        ],
    //        "INFO",
    //        400,
    //        250,
    //        '',
    //        true);
    //} else {
    if (pjn != null && pjn != 'Requested')
        projectID = pjn + "," + projectID;
    var baseurl = formContext.context.getClientUrl();
    var url;
    if (baseurl.indexOf("uat") != -1) { url = "https://arupuat.sharepoint.com/sites/bids#k="; }
    else { url = 'https://arup.sharepoint.com/sites/bids#k='; }
    url += 'WORDS(' + projectID + ')';
    formContext.ui.setFormNotification("It may take 15-20 min from the time PJN was issued for the BIDS site to be provisioned", 'INFO', 'BidsSiteProvision');
    window.open(url, '_blank');
    setTimeout(function () { formContext.ui.clearFormNotification("BidsSiteProvision"); }, 10000);
    //}
}

//function ccrm_contractlimitofliability_OnChange() {

//    return;

//    //debugger;
//    var strCLL = formContext.getAttribute('ccrm_contractlimitofliability').getValue();
//    /* 6 - limited; 3 - unlimited */
//    if (strCLL != 6) {
//        formContext.getAttribute("ccrm_limitofliabilityagreement").setRequiredLevel("none");
//        formContext.getAttribute('ccrm_limitofliabilityagreement').setValue(null);
//        formContext.getControl("ccrm_limitofliabilityagreement").setDisabled(true);
//        if (formContext.getControl("header_process_ccrm_limitofliabilityagreement") != null)
//            formContext.getControl("header_process_ccrm_limitofliabilityagreement").setDisabled(true);
//        formContext.getAttribute('ccrm_limitamount_num').setValue(null);
//        formContext.getControl("ccrm_limitamount_num").setDisabled(true);
//        if (formContext.getControl("header_process_ccrm_limitamount_num") != null)
//            formContext.getControl("header_process_ccrm_limitamount_num").setDisabled(true);
//        formContext.getAttribute("ccrm_limitofliabilityagreement").setSubmitMode("always");
//        formContext.getAttribute('ccrm_limitamount_num').setValue(null);
//        formContext.getAttribute("ccrm_limitamount_num").setSubmitMode("always");
//        formContext.getAttribute("ccrm_limitamount_num").setRequiredLevel("none");
//    } else {
//        if (formContext.getAttribute("statecode").getValue() == 0) {
//            formContext.getControl("ccrm_limitofliabilityagreement").setDisabled(false);
//        }
//        formContext.getControl("ccrm_limitofliabilityagreement").setVisible(true);
//        if (formContext.getControl("header_process_ccrm_limitofliabilityagreement") != null && formContext.getAttribute("statecode").getValue() == 0) {
//            formContext.getControl("header_process_ccrm_limitofliabilityagreement").setDisabled(false);
//        }
//        formContext.getAttribute("ccrm_limitofliabilityagreement").setRequiredLevel("required");
//    }
//}

//function ccrm_limitofliabilityagreement_OnChange() {
//    var strLL = formContext.getAttribute('ccrm_limitofliabilityagreement').getValue();
//    if (strLL != 1) {
//        formContext.getControl("ccrm_limitamount_num").setDisabled(true);
//        if (formContext.getControl("header_process_ccrm_limitamount_num") != null)
//            formContext.getControl("header_process_ccrm_limitamount_num").setDisabled(true);
//        formContext.getAttribute('ccrm_limitamount_num').setValue(null);
//        formContext.getAttribute("ccrm_limitamount_num").setSubmitMode("always");
//        formContext.getAttribute("ccrm_limitamount_num").setRequiredLevel("none");
//    } else {
//        formContext.getControl("ccrm_limitamount_num").setDisabled(false);
//        if (formContext.getControl("header_process_ccrm_limitamount_num") != null)
//            formContext.getControl("header_process_ccrm_limitamount_num").setDisabled(false);
//        formContext.getAttribute("ccrm_limitamount_num").setRequiredLevel("required");
//    }
//}

//CRM2016 Needs confirmation
function show_hiddenrow(attributeName, supressTabCallback) {
    /// <summary>Due to a bug, CRM seems to hide certain rows when it should not. Ensure that parent row of a given field is not hidden</summary>
    //var currentRowStyle = $("#" + attributeName + "_d").parent().attr("style");
    var currentRowStyle = $("#" + attributeName + "_d", parent.document).parent().attr("style");
    if (currentRowStyle == "display: none;") {
        $("#" + attributeName + "_d", parent.document).parent().removeAttr("style", "");
    }
    // Also add a callback to the parent tab open event to show this row.
    //if (!supressTabCallback) {
    //    var control = formContext.getControl(attributeName);
    //   if (!!control)
    //        control.getParent()
    //            .getParent()
    //            .add_tabStateChange(
    //               function () {
    //                    show_hiddenrow(attributeName, true);
    //               });
    // }
}

function updateStatusCode(formContext,newStatusCode) {
    /// <summary>Update current record status to required value and redisplay</summary>

    var statuscode = formContext.getAttribute("statuscode");
    if (!!statuscode && statuscode.getValue() != newStatusCode) {
        //SDK.REST.updateRecord(
        //    formContext.data.entity.getId(),
        //    { StatusCode: { Value: newStatusCode } },
        //    "Opportunity",
        //    SetCurrentStatusFromServer,
        //    errorHandler
        //);

        var entity = {};
        entity.statuscode =  newStatusCode;

        Xrm.WebApi.online.updateRecord("opportunity", formContext.data.entity.getId(), entity, SetCurrentStatusFromServer).then(
            function success(result) {
                var updatedEntityId = result.id;
            },
            function (error) {
                Xrm.Utility.alertDialog(error.message);
            }
        );
    }
}

function QuickCreateOnSave(executionContext, args) {
    var formContext = executionContext.getFormContext();
    ///<summary>Suppress error caused by empty accounting centre field on quick create</summary>
    var accCentre = formContext.getAttribute("ccrm_accountingcentreid");
    var arupRegion;

    if (!!accCentre && accCentre.getValue())
        var accCentreVal = accCentre.getValue();
    if (!!accCentreVal && accCentreVal.length > 0 && accCentreVal[0].id == 0) {
        accCentreVal.shift();
        accCentre.setValue(accCentreVal);
    }

    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
    if (formContext.getAttribute("ccrm_arupregionid").getValue() != null)
        arupRegion = formContext.getAttribute("ccrm_arupregionid").getValue()[0].name.toUpperCase();

    if (arupInternal == true && arupRegion != 'UKIMEA REGION') {
        formContext.getAttribute("ccrm_showpjnbutton").setValue(false);
    }
}

//formContext is primaryCOntrol crmparamter
function ReopenOpp(formContext) {
    var overallStatus = formContext.getAttribute("statecode").getValue();
    if (overallStatus == 1) {
        Alert.show('<font face="Segoe UI Light" font size="6" color="0472C4">Information</font>',
            '<font face="Segoe UI Light" font size="3" color="#000000"></br>This Opportunity has been Won and the record has been locked down as read-only.</br>All further modifications to the record will change the historical data and will not update OvaView.</br>Best practice is to not modify Won records</font>',
            [
                {
                    label: "<b>Reopen Opportunity</b>",
                    callback: function () {
                        var organisationUrl = formContext.context.getClientUrl();
                        var opptyId = formContext.data.entity.getId();
                        var opptyStatus = formContext.getAttribute("statuscode").getValue();

                        opptyId = opptyId.replace("{", "");
                        opptyId = opptyId.replace("}", "");

                        var req = new XMLHttpRequest();
                        req.open("PATCH", organisationUrl + "/api/data/v9.1/opportunities(" + opptyId + ")", true);
                        req.setRequestHeader("Accept", "application/json");
                        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                        req.setRequestHeader("OData-MaxVersion", "4.0");
                        req.setRequestHeader("OData-Version", "4.0");

                        var oppty = {};

                        oppty["statecode"] = 0;
                        //oppty["statuscode"] = 1;

                        req.onreadystatechange = function () {
                            if (this.readyState == 4) {
                                req.onreadystatechange = null;
                                if (this.status == 204) {
                                    var _id = formContext.data.entity.getId();
                                    Xrm.Utility.openEntityForm("opportunity", _id);
                                    //formContext.data.refresh();
                                } else {
                                    var error = JSON.parse(this.response).error;
                                    alert(error.message);
                                }
                            }
                        };

                        req.send(window.JSON.stringify(oppty));

                    }
                    ,
                    setFocus: true,
                    preventClose: false

                },
                {
                    label: "<b>Add Suffix</b>",
                    callback: function () {

                        oppoProgressFnCJNSuffix();
                    },
                    setFocus: false,
                    preventClose: false
                },
                {
                    label: "<b>Cancel</b>",
                    callback: function () {

                    },
                    setFocus: false,
                    preventClose: false
                }
            ],
            'INFO',
            800,
            250,
            '',
            true);
    }
    else {
        var organisationUrl = formContext.context.getClientUrl();
        var opptyId = formContext.data.entity.getId();
        var opptyStatus = formContext.getAttribute("statuscode").getValue();

        opptyId = opptyId.replace("{", "");
        opptyId = opptyId.replace("}", "");

        var req = new XMLHttpRequest();
        req.open("PATCH", organisationUrl + "/api/data/v9.1/opportunities(" + opptyId + ")", true);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");

        var oppty = {};

        oppty["statecode"] = 0;
        //oppty["statuscode"] = 1;

        req.onreadystatechange = function () {
            if (this.readyState == 4) {
                req.onreadystatechange = null;
                if (this.status == 204) {
                    var _id = formContext.data.entity.getId();
                    Xrm.Utility.openEntityForm("opportunity", _id);
                    //formContext.data.refresh();
                } else {
                    var error = JSON.parse(this.response).error;
                    alert(error.message);
                }
            }
        };

        req.send(window.JSON.stringify(oppty));
    }
}
//Button :
function fnBtnExclusivityRequest(formContext) {
    //alert('Your request for Exclusivity has been sent');

    //set the exclusivity flag
    formContext.getAttribute("ccrm_exclusivity").setValue(true);
    //set state to requested
    formContext.getAttribute("ccrm_exclusivitystate").setValue(6);
    //force submit
    formContext.getAttribute("ccrm_exclusivity").setSubmitMode("always");
    formContext.getAttribute("ccrm_exclusivitystate").setSubmitMode("always");
    formContext.data.entity.save();
    var serverUrl = formContext.context.getClientUrl();
    var id = formContext.data.entity.getId();
    id = id.replace("{", "");
    id = id.replace("}", "");

    var parameters = {};
    parameters["ccrm_name"] = formContext.getAttribute("ccrm_reference").getValue();

    // if (formContext.getAttribute("ownerid").getValue() != null) {
    //     parameters["ownerid"] = formContext.getAttribute("ownerid").getValue()[0].id;
    //    parameters["owneridname"] = formContext.getAttribute("ownerid").getValue()[0].name;
    // }

    if (formContext.getAttribute("ccrm_biddirector_userid").getValue() != null) {
        parameters["ccrm_biddirectorid"] = formContext.getAttribute("ccrm_biddirector_userid").getValue()[0].id;
        parameters["ccrm_biddirectoridname"] = formContext.getAttribute("ccrm_biddirector_userid").getValue()[0].name;
    }
    if (formContext.getAttribute("ccrm_bidmanager_userid").getValue() != null) {
        parameters["ccrm_bidmanagerid"] = formContext.getAttribute("ccrm_bidmanager_userid").getValue()[0].id;
        parameters["ccrm_bidmanageridname"] = formContext.getAttribute("ccrm_bidmanager_userid").getValue()[0].name;
    }
    if (formContext.getAttribute("ccrm_projectlocationid").getValue() != null) {
        parameters["ccrm_projectcountryid"] = formContext.getAttribute("ccrm_projectlocationid").getValue()[0].id;
        parameters["ccrm_projectcountryidname"] = formContext.getAttribute("ccrm_projectlocationid").getValue()[0].name;
    }
    if (formContext.getAttribute("ccrm_projectlocationid").getValue() != null) {
        parameters["ccrm_projectcountryid"] = formContext.getAttribute("ccrm_projectlocationid").getValue()[0].id;
        parameters["ccrm_projectcountryidname"] = formContext.getAttribute("ccrm_projectlocationid").getValue()[0].name;
    }

    parameters["ccrm_projectlocation"] = formContext.getAttribute("ccrm_location").getValue();

    if (formContext.getAttribute("ccrm_arupbusinessid").getValue() != null) {
        parameters["ccrm_arupbusinessid"] = formContext.getAttribute("ccrm_arupbusinessid").getValue()[0].id;
        parameters["ccrm_arupbusinessidname"] = formContext.getAttribute("ccrm_arupbusinessid").getValue()[0].name;
    }

    if (formContext.getAttribute("ccrm_arupgroupid").getValue() != null) {
        parameters["ccrm_arupgroupid"] = formContext.getAttribute("ccrm_arupgroupid").getValue()[0].id;
        parameters["ccrm_arupgroupidname"] = formContext.getAttribute("ccrm_arupgroupid").getValue()[0].name;
    }

    if (formContext.getAttribute("ccrm_client").getValue() != null) {
        parameters["ccrm_clientid"] = formContext.getAttribute("ccrm_client").getValue()[0].id;
        parameters["ccrm_clientidname"] = formContext.getAttribute("ccrm_client").getValue()[0].name;
    }

    parameters["ccrm_projectsummary"] = formContext.getAttribute("description").getValue();

    parameters["ccrm_maximumpotentialfee_num"] = formContext.getAttribute("ccrm_estimatedvalue_num").getValue();

    if (formContext.getAttribute("ccrm_project_transactioncurrencyid").getValue() != null) {
        parameters["transactioncurrencyid"] = formContext.getAttribute("ccrm_project_transactioncurrencyid").getValue()[0].id;
        parameters["transactioncurrencyidname"] = formContext.getAttribute("ccrm_project_transactioncurrencyid").getValue()[0].name;
    }

    parameters["ccrm_projecttitleid"] = formContext.data.entity.getId();
    parameters["ccrm_projecttitleidname"] = formContext.getAttribute("name").getValue();

    setTimeout(function () { openExclReq(parameters); }, 2000);

}

function openExclReq(parameters) {
    var windowOptions = {
        openInNewWindow: true
    };

    Xrm.Utility.openEntityForm("ccrm_exclusivityrequest", null, parameters);
}

function projectParticipantExists(formContext) {

    var ProjectParticExists = false;
    var optyId = formContext.data.entity.getId().replace('{', '').replace('}', '');

    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v8.2/arup_projectparticipants?$select=arup_name&$filter=_arup_opportunity_value eq " + optyId + "&$count=true", false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\",odata.maxpagesize=1");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var results = JSON.parse(this.response);
                var recordCount = results["@odata.count"];
                ProjectParticExists = (recordCount > 0) ? true : false;
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();
    return ProjectParticExists;
}

function addProjectParticipant(primaryControl) {
    var formContext = primaryControl;
    if (formContext.data.entity.getIsDirty()) { formContext.data.save(); }
    var parameters = {}; //set null parameters as we there is no need to set any other field
    parameters["arup_opportunity"] = formContext.data.entity.getId();
    parameters["arup_opportunityname"] = formContext.getAttribute("name").getValue();
    setTimeout(function () { openProjectParticipantPage(parameters); }, 2000);

}

function openProjectParticipantPage(parameters) {

    var windowOptions = { openInNewWindow: true };
    Xrm.Utility.openEntityForm("arup_projectparticipant", null, parameters);
    var serverUrl = formContext.context.getClientUrl();
    var params = "arup_opportunity=" + parameters["arup_opportunity"] + "&arup_opportunityname=" + parameters["arup_opportunityname"];
    var features = "location=no,menubar=no,status=no,toolbar=no,scrollbars=yes,width=4000,height=700";

}

function resetSubBusiness(formContext,valuechanged, businessid) {

    var statecode = (formContext.ui.getFormType() != 1) ? formContext.getAttribute('statecode').getValue() : 0;

    if (businessid == null || valuechanged || valuechanged == null)
        formContext.getAttribute('arup_subbusiness').setValue(null);

    // disable sub business if either business is NULL or license type is not Professional or opportunity is closed
    formContext.getControl("arup_subbusiness").setDisabled(businessid == null || currUserData.caltype != 0 || statecode != 0);
}

//Common function to refresh ribbon on change of any field
function refreshRibbonOnChange(formContext) {
    formContext.ui.refreshRibbon();
}

function debug() {
    /// <summary>Drop into debugger from ribbon or form events.</summary>
    return true;
}

function canReopenOpportunity(formContext) {

    var state = formContext.getAttribute('statecode').getValue();

    if (state == null || state != 1) return true;

    return isPartOfDQTeam(formContext);

}

function isPartOfDQTeam(formContext) {

    var dqteam = userInTeamCheck(formContext,'Global Data Quality');
    return dqteam;
}

//Param - teamm name . This function checks whether the logged in user is a member of the team. Returns true if he/ she is a member.
function userInTeamCheck(formContext,TeamNameInput) {

    var IsPresentInTeam = false;

    try {

        var req = new XMLHttpRequest();
        req.open("GET", formContext.context.getClientUrl() +
            "/api/data/v8.2/accounts?fetchXml=%3Cfetch%20version%3D%221.0%22%20output-format%3D%22xml-platform%22%20mapping%3D%22logical%22%20distinct%3D%22true%22%3E%3Centity%20name%3D%22team%22%3E%3Cattribute%20name%3D%22name%22%2F%3E%3Cfilter%20type%3D%22and%22%3E%3Ccondition%20attribute%3D%22name%22%20operator%3D%22eq%22%20value%3D%22" +
            TeamNameInput + "%22%2F%3E%3C%2Ffilter%3E%3Clink-entity%20name%3D%22teammembership%22%20from%3D%22teamid%22%20to%3D%22teamid%22%20visible%3D%22false%22%20intersect%3D%22true%22%3E%3Cfilter%20type%3D%22and%22%3E%3Ccondition%20attribute%3D%22systemuserid%22%20operator%3D%22eq%22%20value%3D%22" +
            formContext.context.getUserId().replace('{', '').replace('}', '') + "%22%2F%3E%3C%2Ffilter%3E%3C%2Flink-entity%3E%3C%2Fentity%3E%3C%2Ffetch%3E", false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    if (results.value.length > 0) {
                        IsPresentInTeam = true;
                    }
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();
    }
    catch (err) {
        console.log(TeamNameInput + ' Error: ' + err.message);
    }
    return IsPresentInTeam;
}

function onChange_PJN(executionContext) {
    var formContext = executionContext.getFormContext();
    var opportunityType = formContext.getAttribute('arup_opportunitytype').getValue();
    lockDownBidCosts(formContext,(formContext.getAttribute("ccrm_pjna").getValue() != null || formContext.getAttribute("ccrm_jna").getValue() != null || opportunityType == 770000005 || (formContext.getAttribute("ccrm_arupinternal").getValue() == true && formContext.getAttribute("ccrm_arupregionid").getValue() != null && formContext.getAttribute("ccrm_arupregionid").getValue()[0].name.toUpperCase() != 'UKIMEA REGION')) ? true : false);

}

function approveCallbackAction(formContext,approvalType) {

    var parameters = {};
    var approveruser = {};
    var oppId = formContext.data.entity.getId().replace(/[{}]/g, "");
    var LoggedUser = formContext.context.getUserId().replace(/[{}]/g, "");

    approveruser.systemuserid = LoggedUser;
    approveruser["@odata.type"] = "Microsoft.Dynamics.CRM.systemuser";
    parameters.approverUser = approveruser;
    parameters.approvalType = approvalType;

    var req = new XMLHttpRequest();
    req.open("POST", formContext.context.getClientUrl() + "/api/data/v8.2/opportunities(" + oppId + ")/Microsoft.Dynamics.CRM.arup_ApprovalProcess", false);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                Xrm.Utility.openEntityForm("opportunity", oppId);
            }
        }
    };
    req.send(JSON.stringify(parameters));
}

function confirmUpdate(executionContext, logicalname, displayname) {
    debugger;
    var formContext = executionContext.getFormContext();
    if ((formContext.getAttribute(logicalname).getValue() == 1) && (formContext.getAttribute(logicalname).getIsDirty())) {
        Alert.show('<font face="Segoe UI Light" font size="6" color="0472C4">' + displayname + '</font>',
            '<font face="Segoe UI Light" font size="3" color="#000000"></br>Please confirm the selection of this option. </br> Notifications about this requirement will be sent to leadership when you next save this opportunity</font>',
            [
                {
                    label: "<b>Confirm</b>",
                    callback: function () {
                        if (formContext.data.entity.getIsDirty()) { formContext.data.save(); }
                    }
                    ,
                    setFocus: true,
                    preventClose: false

                },
                {
                    label: "<b>Cancel</b>",
                    callback: function () {
                        var temp = formContext.getAttribute(logicalname).getIsDirty();
                        var tempValue = formContext.getAttribute(logicalname).getValue();
                        var setVal = false;
                        if (temp) {
                            if (!tempValue) {
                                setVal = true;
                            }
                            formContext.getAttribute(logicalname).setValue(setVal);
                        }
                    },
                    setFocus: false,
                    preventClose: false
                }
            ], 'QUESTION', 800, 250, '', true);
    }
}
function ParentOpportunity_Onchange_ec(executionContext, event) {
    var formContext = executionContext.getFormContext();
    ParentOpportunity_Onchange(formContext, event);
}

function ParentOpportunity_Onchange(formContext, event) {
    var parentOpportunity = formContext.getAttribute("ccrm_parentopportunityid").getValue();
    var internalOpportunity = formContext.getAttribute("ccrm_arupinternal").getValue();
    if (internalOpportunity) {
        PullDetailsFromParentOpportunity(formContext,parentOpportunity, event);
    } else {
        PullParentOpportunityDetailsForDiffOpportunityType(formContext,parentOpportunity);
    }
}

function PullParentOpportunityDetailsForDiffOpportunityType(formContext,parentOpportunity) {
    if (parentOpportunity != null && parentOpportunity != "undefined") {
        var opportunitytype = formContext.getAttribute("arup_opportunitytype").getValue();
        if (opportunitytype == null) { return; }
        if (((opportunitytype == '770000001' || opportunitytype == '770000002' || opportunitytype == '770000006') && formContext.ui.getFormType() == 1) || (opportunitytype == '770000001' && formContext.ui.getFormType() != 1)) {

            var parentOpportunityId = parentOpportunity[0].id.replace('{', '').replace('}', '');

            var req = new XMLHttpRequest();
            if (opportunitytype == '770000002') {
                req.open("GET", formContext.context.getClientUrl() + "/api/data/v8.2/opportunities?$select=_arup_subbusiness_value,_ccrm_arupbusinessid_value,description,ccrm_arupuniversityiiaresearchinitiative,_ccrm_arupusstateid_value,_ccrm_client_value,ccrm_confidential,ccrm_location,_ccrm_projectlocationid_value,name&$filter=opportunityid eq " + parentOpportunityId + "", true);
            } else if (opportunitytype == '770000006') {
                req.open("GET", formContext.context.getClientUrl() + "/api/data/v8.2/opportunities?$select=_arup_subbusiness_value,_ccrm_arupbusinessid_value,description,ccrm_arups_role_in_project,ccrm_arupuniversityiiaresearchinitiative,_ccrm_arupusstateid_value,_ccrm_client_value,ccrm_confidential,ccrm_contractarrangement,ccrm_location,_ccrm_projectlocationid_value,name&$filter=opportunityid eq " + parentOpportunityId + "", true);
            } else if (opportunitytype == '770000001') {
                req.open("GET", formContext.context.getClientUrl() + "/api/data/v8.2/opportunities?$select=_arup_subbusiness_value,_ccrm_arupbusinessid_value,description,ccrm_arups_role_in_project,ccrm_arupuniversityiiaresearchinitiative,_ccrm_arupusstateid_value,_ccrm_client_value,ccrm_confidential,ccrm_contractarrangement,ccrm_contractconditions,ccrm_contractlimitofliability,ccrm_limitamount_num,ccrm_limitofliabilityagreement,ccrm_location,_ccrm_pi_transactioncurrencyid_value,ccrm_pilevelmoney_num,ccrm_pirequirement,_ccrm_projectlocationid_value,name&$filter=opportunityid eq " + parentOpportunityId + "", true);
            }

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
                        AssignDetailsFromParentOpportunity(results, opportunitytype);
                    } else {
                        Xrm.Utility.alertDialog(this.statusText);
                    }
                }
            };
            req.send();
        }
    }
}

function PullDetailsFromParentOpportunity(formContext,parentOpportunity, event) {
    if (parentOpportunity != null && parentOpportunity != "undefined") {
        var parentOpportunityId = parentOpportunity[0].id.replace('{', '').replace('}', '');
        var req = new XMLHttpRequest();
        req.open("GET", formContext.context.getClientUrl() + "/api/data/v8.2/opportunities(" + parentOpportunityId + ")?$select=_arup_subbusiness_value,_ccrm_arupbusinessid_value,_ccrm_arupusstateid_value,_ccrm_client_value,ccrm_contractarrangement,ccrm_leadsource,ccrm_location,ccrm_probabilityofprojectproceeding,_ccrm_projectlocationid_value,_ccrm_ultimateendclientid_value,closeprobability", true);
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
                    if (result != null) {
                        UpdateDetailsFromParentOpportunity(formContext,result, event);
                        if (formContext.ui.getFormType() != 1) {
                            formContext.ui.setFormNotification("Information from related parent opportunity has updated this form", "INFORMATION", "OpportunityDetailsFromParent");
                        }
                    }
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();
    } else {
        EnableFields(formContext,"arup_subbusiness", "ccrm_arupbusinessid", "ccrm_accountingcentreid", "ccrm_arupcompanyid", "ccrm_arupusstateid", "ccrm_client", "ccrm_contractarrangement", "ccrm_leadsource", "ccrm_location", "arup_globalservices", "ccrm_othernetworkdetails", "ccrm_probabilityofprojectproceeding", "ccrm_projectlocationid", "ccrm_ultimateendclientid", "closeprobability");
    }
}
function UpdateField(formContext,field, fieldName, fieldValueFromParent, lookUpText, entityName, isOverRide) {

    switch (field.getAttributeType()) {
        case 'lookup':
            if (field != null) {
                if (isOverRide) {
                    if (fieldValueFromParent != null) {
                        if (field.getValue() != null) {
                            if (field.getValue()[0].id.replace('{', '').replace('}', '') != fieldValueFromParent.toUpperCase()) {
                                SetLookupField(formContext,fieldValueFromParent, lookUpText, entityName, fieldName);
                            }
                        } else {
                            SetLookupField(formContext,fieldValueFromParent, lookUpText, entityName, fieldName);
                        }
                    }
                    //else
                    //    field.setValue(null);
                }
                else {
                    if (field.getValue() == null)
                        SetLookupField(formContext,fieldValueFromParent, lookUpText, entityName, fieldName);
                }
            }
            break;
        case 'datetime':
            var fieldValue = field.getValue();
            if (isOverRide) {
                if (fieldValueFromParent != null) {
                    if (fieldValue != fieldValueFromParent) {
                        field.setValue(new Date(fieldValueFromParent));
                    }
                }
            } else {
                if (fieldValue == null) {
                    field.setValue(new Date(fieldValueFromParent));
                }
            }
            break;
        case 'integer':
        case 'double':
        case 'string':
        case 'boolean':
        case 'memo':
        case 'optionset':
            var fieldValue = field.getValue();
            if (isOverRide) {
                if (fieldValueFromParent != null) {
                    if (fieldValue != fieldValueFromParent) {
                        field.setValue(fieldValueFromParent);
                    }
                }
            } else {
                if (fieldValue == null) {
                    field.setValue(fieldValueFromParent);
                }
            }
            break;
    }
}
function EnableFieldsAsPerRequiredLevel(formContext,field, fieldName) {

    var enable = (field.getRequiredLevel() == 'none' || field.getValue() != null);
    formContext.getControl(fieldName).setDisabled(enable);
    enableDisableBPFField(formContext,fieldName, enable);
}

function enableDisableBPFField(formContext,attribute, enable) {
    /* loop up 3 times through the attribute's name to make sure all of the BPF fields are covered. 
    If the same attribute exists in 4+ different places on BPF, then increase this to 4 */

    var i;
    var attributeBPF;

    for (i = 0; i < 3; i++) {
        attributeBPF = 'header_process_' + attribute + (i == 0 ? '' : i.toString());
        if (formContext.getControl(attributeBPF) != null)
            formContext.getControl(attributeBPF).setDisabled(enable);
    }
}

function EnableFields(formContext,listOfFields) {
    /// <summary>Enable Fields</summary>
    /// <param name="fieldName">One or more field names that are to be enabled.</param>
    for (var field in arguments) {
        if (field != 0) {
            var control = formContext.getControl(arguments[field]);
            if (control != null) {
                control.setDisabled(false);
            }
        }
    }
}

function  UpdateFieldFromParentOpportunity(formContext,fieldName, fieldValueFromParent, lookUpText, entityName) {
    var field = formContext.getAttribute(fieldName);
    if (field != null) {
        UpdateField(formContext,field, fieldName, fieldValueFromParent, lookUpText, entityName, true);
        EnableFieldsAsPerRequiredLevel(formContext,field, fieldName);
    }
}

function UpdateDetailsFromParentOpportunity(formContext,result, event) {
  
     UpdateFieldFromParentOpportunity(formContext,"ccrm_projectlocationid", result["_ccrm_projectlocationid_value"], result["_ccrm_projectlocationid_value@OData.Community.Display.V1.FormattedValue"], result["_ccrm_projectlocationid_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);
    //formContext.getAttribute("ccrm_projectlocationid").fireOnChange();
    projectcountry_onchange(formContext,(event == 'load' ? 'formonload' : null));
    if (IsDependentFieldValueValid(formContext.data.entity.getEntityName(),"arup_opportunitytype", formContext.getAttribute("arup_opportunitytype").getValue(), "ccrm_contractarrangement", result["ccrm_contractarrangement"]))
         UpdateFieldFromParentOpportunity(formContext,"ccrm_contractarrangement", result["ccrm_contractarrangement"]);


    if (IsDependentFieldValueValid(formContext.data.entity.getEntityName(),"arup_opportunitytype", formContext.getAttribute("arup_opportunitytype").getValue(), "ccrm_leadsource", result["ccrm_leadsource"]))
         UpdateFieldFromParentOpportunity(formContext,"ccrm_leadsource", result["ccrm_leadsource"]);

     UpdateFieldFromParentOpportunity(formContext,"ccrm_location", result["ccrm_location"]);
     UpdateFieldFromParentOpportunity(formContext,"ccrm_probabilityofprojectproceeding", result["ccrm_probabilityofprojectproceeding"]);
     UpdateFieldFromParentOpportunity(formContext,"closeprobability", result["closeprobability"]);
     UpdateFieldFromParentOpportunity(formContext,"ccrm_arupbusinessid", result["_ccrm_arupbusinessid_value"], result["_ccrm_arupbusinessid_value@OData.Community.Display.V1.FormattedValue"], result["_ccrm_arupbusinessid_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);
     UpdateFieldFromParentOpportunity(formContext,"arup_subbusiness", result["_arup_subbusiness_value"], result["_arup_subbusiness_value@OData.Community.Display.V1.FormattedValue"], result["_arup_subbusiness_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);

    if (formContext.getAttribute("arup_subbusiness").getValue() == null) {
        // if  subbusiness is empty then fire the onchange event of business field to allow selection for Sub Businesss
        formContext.getAttribute("ccrm_arupbusinessid").fireOnChange();
    }

     UpdateFieldFromParentOpportunity(formContext,"ccrm_client", result["_ccrm_client_value"], result["_ccrm_client_value@OData.Community.Display.V1.FormattedValue"], result["_ccrm_client_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);
    if (formContext.getAttribute("ccrm_client").getValue()[0].name == 'Unassigned') {
        formContext.getControl("ccrm_client").setDisabled(false);
    }
     UpdateFieldFromParentOpportunity(formContext,"ccrm_ultimateendclientid", result["_ccrm_ultimateendclientid_value"], result["_ccrm_ultimateendclientid_value@OData.Community.Display.V1.FormattedValue"], result["_ccrm_ultimateendclientid_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);

    setTimeout(function () {
        //debugger;
         UpdateFieldFromParentOpportunity(formContext,"ccrm_arupusstateid", result["_ccrm_arupusstateid_value"], result["_ccrm_arupusstateid_value@OData.Community.Display.V1.FormattedValue"], result["_ccrm_arupusstateid_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);
        // UpdateFieldFromParentOpportunity(formContext,"ccrm_arupcompanyid", result["_ccrm_arupcompanyid_value"], result["_ccrm_arupcompanyid_value@OData.Community.Display.V1.FormattedValue"], result["_ccrm_arupcompanyid_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);
        //if (formContext.getAttribute("ccrm_arupcompanyid").getValue() != null) {
        //     UpdateFieldFromParentOpportunity(formContext,"ccrm_accountingcentreid", result["_ccrm_accountingcentreid_value"], result["_ccrm_accountingcentreid_value@OData.Community.Display.V1.FormattedValue"], result["_ccrm_accountingcentreid_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);
        //    formContext.getAttribute("ccrm_accountingcentreid").fireOnChange();
        //}
    }, 1500);
}


function AssignDetailsFromParentOpportunity(results, opportunityType) {
    if (results.value.length > 0) {

        switch (opportunityType) {
            case 770000002:
                AssignBasicDetailsFromParentOpportunity(formContext,results);
                AssignDetailsWhenOpportunityTypeNewContract(formContext,results);
                break;
            case 770000001:
                AssignBasicDetailsFromParentOpportunity(formContext,results);
                AssignDetailsWhenOpportunityTypeExistingContract(formContext,results);
                break;
            case 770000006:
                AssignBasicDetailsFromParentOpportunity(formContext,results);
                AssignDetailsWhenOpportunityTypeTeamOpportunity(formContext,results);
                break;
        }
    }
}

function AssignFieldValueFromParent(formContext,fieldName, fieldValueFromParent, lookUpText, entityName) {

    var field = formContext.getAttribute(fieldName);
    if (field != null && fieldValueFromParent != null) {
        if (fieldName == 'ccrm_client' && field.getValue()[0].name == 'Unassigned')
            UpdateField(formContext,field, fieldName, fieldValueFromParent, lookUpText, entityName, true);
        else
            UpdateField(formContext,field, fieldName, fieldValueFromParent, lookUpText, entityName, false);
    }
}

function AssignBasicDetailsFromParentOpportunity(formContext,results) {
    if (formContext.getAttribute("ccrm_arupbusinessid").getValue() == null) {
        AssignFieldValueFromParent(formContext,"ccrm_arupbusinessid", results.value[0]["_ccrm_arupbusinessid_value"], results.value[0]["_ccrm_arupbusinessid_value@OData.Community.Display.V1.FormattedValue"], results.value[0]["_ccrm_arupbusinessid_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);
        if (results.value[0]["_arup_subbusiness_value"] != null)
            AssignFieldValueFromParent(formContext,"arup_subbusiness", results.value[0]["_arup_subbusiness_value"], results.value[0]["_arup_subbusiness_value@OData.Community.Display.V1.FormattedValue"], results.value[0]["_arup_subbusiness_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);
        else {
            // if parent doesnt have subbusiness then fire the onchange event of business field to allow selection for Sub Businesss
            formContext.getAttribute("ccrm_arupbusinessid").fireOnChange();
        }
    }
    if (formContext.getAttribute("ccrm_projectlocationid").getValue() == null) {

        AssignFieldValueFromParent(formContext,"ccrm_projectlocationid", results.value[0]["_ccrm_projectlocationid_value"], results.value[0]["_ccrm_projectlocationid_value@OData.Community.Display.V1.FormattedValue"], results.value[0]["_ccrm_projectlocationid_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);
        formContext.getAttribute("ccrm_projectlocationid").fireOnChange();

        if (results.value[0]["_ccrm_arupusstateid_value"] != null)
            AssignFieldValueFromParent(formContext,"ccrm_arupusstateid", results.value[0]["_ccrm_arupusstateid_value"], results.value[0]["_ccrm_arupusstateid_value@OData.Community.Display.V1.FormattedValue"], results.value[0]["_ccrm_arupusstateid_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);
        else
            formContext.getAttribute("ccrm_arupusstateid").setValue(null);

    }
    AssignFieldValueFromParent(formContext,"ccrm_location", results.value[0]["ccrm_location"]);
    AssignFieldValueFromParent(formContext,"ccrm_confidential", results.value[0]["ccrm_confidential"]);
    AssignFieldValueFromParent(formContext,"ccrm_arupuniversityiiaresearchinitiative", results.value[0]["ccrm_arupuniversityiiaresearchinitiative"]);
    AssignFieldValueFromParent(formContext,"description", results.value[0]["description"]);
}

function AssignDetailsWhenOpportunityTypeNewContract(formContext,results) {

    var procurementType = formContext.getAttribute("ccrm_contractarrangement").getValue();

    if (procurementType != null && procurementType != 100000003) {
        AssignFieldValueFromParent(formContext,"ccrm_client", results.value[0]["_ccrm_client_value"], results.value[0]["_ccrm_client_value@OData.Community.Display.V1.FormattedValue"], results.value[0]["_ccrm_client_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);
    }
}

function AssignDetailsWhenOpportunityTypeExistingContract(results) {

    if (formContext.ui.getFormType() != 1) {
        formContext.getAttribute("ccrm_contractarrangement").setValue(results.value[0]["ccrm_contractarrangement"]);
    }

    if (formContext.ui.getFormType() == 1) {

        if (IsDependentFieldValueValid(formContext.data.entity.getEntityName(),"arup_opportunitytype", formContext.getAttribute("arup_opportunitytype").getValue(), "ccrm_contractarrangement", results.value[0]["ccrm_contractarrangement"]))
            AssignFieldValueFromParent(formContext,"ccrm_contractarrangement", results.value[0]["ccrm_contractarrangement"]);

        AssignFieldValueFromParent(formContext,"ccrm_client", results.value[0]["_ccrm_client_value"], results.value[0]["_ccrm_client_value@OData.Community.Display.V1.FormattedValue"], results.value[0]["_ccrm_client_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);
        AssignFieldValueFromParent(formContext,"ccrm_arups_role_in_project", results.value[0]["ccrm_arups_role_in_project"]);
        AssignFieldValueFromParent(formContext,"ccrm_contractconditions", results.value[0]["ccrm_contractconditions"]);
        AssignFieldValueFromParent(formContext,"ccrm_contractlimitofliability", results.value[0]["ccrm_contractlimitofliability"]);
        AssignFieldValueFromParent(formContext,"ccrm_limitamount_num", results.value[0]["ccrm_limitamount_num"]);
        AssignFieldValueFromParent(formContext,"ccrm_limitofliabilityagreement", results.value[0]["ccrm_limitofliabilityagreement"]);
        AssignFieldValueFromParent(formContext,"ccrm_pi_transactioncurrencyid", results.value[0]["_ccrm_pi_transactioncurrencyid_value"], results.value[0]["_ccrm_pi_transactioncurrencyid_value@OData.Community.Display.V1.FormattedValue"], results.value[0]["_ccrm_pi_transactioncurrencyid_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);
        AssignFieldValueFromParent(formContext,"ccrm_pilevelmoney_num", results.value[0]["ccrm_pilevelmoney_num"]);
        AssignFieldValueFromParent(formContext,"ccrm_pirequirement", results.value[0]["ccrm_pirequirement"]);
    }
}

function AssignDetailsWhenOpportunityTypeTeamOpportunity(formContext,results) {

    AssignFieldValueFromParent(formContext,"ccrm_contractarrangement", results.value[0]["ccrm_contractarrangement"]);
    AssignFieldValueFromParent(formContext,"ccrm_arups_role_in_project", results.value[0]["ccrm_arups_role_in_project"]);

    //Assign Client value from Parent to ultimateClient
    var _ccrm_client_value = results.value[0]["_ccrm_client_value"];
    if (_ccrm_client_value != null) {
        AssignFieldValueFromParent(formContext,"ccrm_ultimateendclientid", results.value[0]["_ccrm_client_value"], results.value[0]["_ccrm_client_value@OData.Community.Display.V1.FormattedValue"], results.value[0]["_ccrm_client_value@Microsoft.Dynamics.CRM.lookuplogicalname"]);
    }
}

function SetUltimateClient_ec(executionContext) {
    var formContext = executionContext.getFormContext();
    SetUltimateClient(formContext);
}

function SetUltimateClient(formContext) {

    var opportunitytype = formContext.getAttribute("arup_opportunitytype").getValue();
    var projectProcurement = formContext.getAttribute("ccrm_contractarrangement").getValue();
    if (opportunitytype == '770000002' && projectProcurement == '100000003') {
        var parentOpportunity = formContext.getAttribute("ccrm_parentopportunityid").getValue();
        if (parentOpportunity != null && parentOpportunity != "undefined") {
            var parentOpportunityId = parentOpportunity[0].id.replace('{', '').replace('}', '');
            var req = new XMLHttpRequest();
            req.open("GET", formContext.context.getClientUrl() + "/api/data/v8.2/opportunities?$select=_ccrm_client_value&$filter=opportunityid eq " + parentOpportunityId + "", true);
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
                        if (results.value.length > 0) {
                            var _ccrm_client_value = results.value[0]["_ccrm_client_value"];
                            if (_ccrm_client_value != null) {
                                formContext.getAttribute("ccrm_ultimateendclientid").setValue([
                                    {
                                        id: _ccrm_client_value,
                                        name: results.value[0]["_ccrm_client_value@OData.Community.Display.V1.FormattedValue"],
                                        entityType: results.value[0]["_ccrm_client_value@Microsoft.Dynamics.CRM.lookuplogicalname"]
                                    }
                                ]);
                            }
                        }
                    } else {
                        Xrm.Utility.alertDialog(this.statusText);
                    }
                }
            };
            req.send();
        }
    }
}

function ArupRegion_OnChange(executionContext) {
    var formContext = executionContext.getFormContext();
    SetParentOpportunityRequired(formContext);
    formContext.ui.refreshRibbon();
}

function SetParentOpportunityRequired(formContext) {
    var opportunitytype = formContext.getAttribute("arup_opportunitytype").getValue();
    var arupRegion = formContext.getAttribute("ccrm_arupregionid").getValue();
    var arupRegionName = arupRegion != null ? arupRegion[0].name.toLowerCase() : '';
    var requiredLevel = (opportunitytype == 770000001 || opportunitytype == 770000002 || opportunitytype == 770000006 || (opportunitytype == 770000004 && arupRegionName == ArupRegionName.Australasia.toLowerCase())) ? 'required' : 'none';
    formContext.getAttribute("ccrm_parentopportunityid").setRequiredLevel(requiredLevel);
}

function ParentOpportunityFilter_ec(executionContext) {
    var formContext = executionContext.getFormContext();
    ParentOpportunityFilter(formContext);
}

function ParentOpportunityFilter(formContext) {
    SetParentOpportunityRequired(formContext);
    formContext.getControl("ccrm_parentopportunityid").addPreSearch(() => function () { AddParentOpportunityFilter(formContext); });
}

function AddParentOpportunityFilter(formContext) {
    var opportunitytype = formContext.getAttribute("arup_opportunitytype").getValue();
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
    var fetch;
    switch (opportunitytype) {
        case 770000001: /* existing contract */
            if (!arupInternal) {
                fetch = "<filter type='and'>" +
                    "<condition attribute='statecode' operator='eq' value='1' />" +
                    "</filter>";
            }
            else {
                fetch = "<filter type='and'>" +
                    "<filter type='or'>" +
                    "<condition attribute='statecode' operator='eq' value='0' />" +
                    "<condition attribute='statecode' operator='eq' value='1' />" +
                    "</filter>" +
                    "</filter>";
            }
            break;
        case 770000002: /* new contract */
            if (!arupInternal) {
                fetch = "<filter type='and'>" +
                    "<filter type='or'>" +
                    "<condition attribute='statecode' operator='eq' value='0' />" +
                    "<condition attribute='statecode' operator='eq' value='1' />" +
                    "</filter>" +
                    "</filter>";
            }
            else {
                fetch = "<filter type='and'>" +
                    "<condition attribute='statecode' operator='eq' value='0' />" +
                    "</filter>";
            }
            break;
        case 770000006:
            fetch = "<filter type='and'>" +
                "<condition attribute='arup_opportunitytype' operator='eq' value='770000005' />" +
                "<filter type='or'>" +
                "<condition attribute='statecode' operator='eq' value='0' />" +
                "<condition attribute='statecode' operator='eq' value='1' />" +
                "</filter>" +
                "</filter>";
            break;
        default:
            fetch = "<filter type='and'>" +
                "<filter type='or'>" +
                "<condition attribute='statecode' operator='eq' value='0' />" +
                "<condition attribute='statecode' operator='eq' value='1' />" +
                "</filter>" +
                "</filter>";
            break;       
    }
    formContext.getControl("ccrm_parentopportunityid").addCustomFilter(() => fetch);
}
function VerifyParentOpportunity_ec(executionContext) {
    var formContext = executionContext.getFormContext();
    VerifyParentOpportunity(formContext);
}

function VerifyParentOpportunity(formContext) {

    var opportunitytype = formContext.getAttribute("arup_opportunitytype").getValue();
    if (opportunitytype == '770000001' || opportunitytype == '770000002') {
        var parentOpportunity = formContext.getAttribute("ccrm_parentopportunityid").getValue();
        if (parentOpportunity != null && parentOpportunity != "undefined") {
            var parentOpportunityId = parentOpportunity[0].id.replace('{', '').replace('}', '');

            var req = new XMLHttpRequest();
            req.open("GET", formContext.context.getClientUrl() + "/api/data/v8.2/opportunities(" + parentOpportunityId + ")?$select=statecode,ccrm_contractarrangement", true);
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
                        var statecode = result["statecode"];
                        //if (statecode != 1) {
                        //    formContext.getAttribute("ccrm_parentopportunityid").setValue(null);
                        //}
                        if (opportunitytype == '770000001') {
                            var projectProcurement = formContext.getAttribute("ccrm_contractarrangement").getValue();
                            if (projectProcurement == null) {
                                formContext.getAttribute("ccrm_contractarrangement").setValue(result["ccrm_contractarrangement"])
                            }
                        }
                        // var statecode_formatted = result["statecode@OData.Community.Display.V1.FormattedValue"];
                    } else {
                        Xrm.Utility.alertDialog(this.statusText);
                    }
                }
            };
            req.send();
        }
    }
}

function PullFrameworkDetails(formContext) {
    var framework = formContext.getAttribute("arup_framework").getValue();
    if (framework != null && framework != "undefined") {
        var frameworkId = framework[0].id.replace('{', '').replace('}', '');

        var req = new XMLHttpRequest();
        req.open("GET", formContext.context.getClientUrl() + "/api/data/v8.2/arup_frameworks(" + frameworkId + ")?$select=_arup_client_value&$expand=arup_arup_framework_arup_frameworksecured_FrameworkID($select=arup_limitofliability,arup_limitofliabilityamount,_arup_piinsurancecurrency_value,arup_piinsurancelevelamount,arup_piinsurancerequirement)", true);
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
                    var _arup_client_value = result["_arup_client_value"];

                    if (_arup_client_value != null) {
                        formContext.getAttribute("ccrm_client").setValue([
                            {
                                id: _arup_client_value,
                                name: result["_arup_client_value@OData.Community.Display.V1.FormattedValue"],
                                entityType: result["_arup_client_value@Microsoft.Dynamics.CRM.lookuplogicalname"]
                            }
                        ]);
                    }

                    for (var a = 0; a < result.arup_arup_framework_arup_frameworksecured_FrameworkID.length; a++) {
                        formContext.getAttribute("ccrm_contractlimitofliability").setValue(result.arup_arup_framework_arup_frameworksecured_FrameworkID[a]["arup_limitofliability"]);
                        // var arup_arup_framework_arup_frameworksecured_FrameworkID_arup_limitofliability_formatted = result.arup_arup_framework_arup_frameworksecured_FrameworkID[a]["arup_limitofliability@OData.Community.Display.V1.FormattedValue"];

                        if (formContext.getAttribute("ccrm_contractlimitofliability").getValue() == '6') //if 'Limited' then 'Aggreed'
                            formContext.getAttribute("ccrm_limitofliabilityagreement").setValue(1);

                        formContext.getAttribute("ccrm_limitamount_num").setValue(result.arup_arup_framework_arup_frameworksecured_FrameworkID[a]["arup_limitofliabilityamount"]);

                        //  formContext.getAttribute("").setValue(result.arup_arup_framework_arup_frameworksecured_FrameworkID[a]["arup_limitofliabilitycurrency"]);
                        var _arup_piinsurancecurrency_value = result.arup_arup_framework_arup_frameworksecured_FrameworkID[a]["_arup_piinsurancecurrency_value"];
                        if (_arup_piinsurancecurrency_value != null) {
                            formContext.getAttribute("ccrm_pi_transactioncurrencyid").setValue([
                                {
                                    id: _arup_piinsurancecurrency_value,
                                    name: result.arup_arup_framework_arup_frameworksecured_FrameworkID[a]["_arup_piinsurancecurrency_value@OData.Community.Display.V1.FormattedValue"],
                                    entityType: result.arup_arup_framework_arup_frameworksecured_FrameworkID[a]["_arup_piinsurancecurrency_value@Microsoft.Dynamics.CRM.lookuplogicalname"]
                                }
                            ]);
                        }

                        formContext.getAttribute("ccrm_pilevelmoney_num").setValue(result.arup_arup_framework_arup_frameworksecured_FrameworkID[a]["arup_piinsurancelevelamount"]);
                        // var arup_arup_framework_arup_frameworksecured_FrameworkID_arup_piinsurancelevelamount_formatted = result.arup_arup_framework_arup_frameworksecured_FrameworkID[a]["arup_piinsurancelevelamount@OData.Community.Display.V1.FormattedValue"];
                        formContext.getAttribute("ccrm_pirequirement").setValue(result.arup_arup_framework_arup_frameworksecured_FrameworkID[a]["arup_piinsurancerequirement"]);
                        //  formContext.getAttribute("ccrm_client").setValue(result.arup_arup_framework_arup_frameworksecured_FrameworkID[a]["arup_piinsurancerequirement@OData.Community.Display.V1.FormattedValue"]);
                    }
                } else {
                    Xrm.Utility.alertDialog(this.statusText);
                }
            }
        };
        req.send();
    }
}
function ShowHideFrameworkFields_ec(executionContext, trigger) {
    var formContext = executionContext.getFormContext();
    ShowHideFrameworkFields(formContext, trigger)
}
function ShowHideFrameworkFields(formContext,trigger) {
 
    if (formContext == null || formContext == 'undefined')
        formContext = formContext.getFormContext();

    var opptype = formContext.getAttribute("arup_opportunitytype").getValue();
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
    var newOpportunity = formContext.ui.getFormType() == 1;
    //var existingFramework = (arupInternal == true && !newOpportunity) ? "arup_isthereanexistingcrmframeworkrecord1" : "arup_isthereanexistingcrmframeworkrecord"
    //var frameworkId = (arupInternal == true && !newOpportunity) ? 'arup_framework1' : 'arup_framework';
    //var frameworkAgreement = (arupInternal == true && !newOpportunity) ? 'ccrm_agreementnumber1' : 'ccrm_agreementnumber';

    var existingFramework = "arup_isthereanexistingcrmframeworkrecord";
    var frameworkId = "arup_framework";
    var frameworkAgreement = "ccrm_agreementnumber";

    var tab = formContext.ui.tabs.get("Bid_Development_Tab_Internal");

    if (opptype == '770000004') {

        if (formContext.ui.getFormType() == 1) {
            formContext.getAttribute("arup_isthereanexistingcrmframeworkrecord").setValue(1);
        }
        if (arupInternal && tab != null) { tab.setVisible(true); }
        formContext.getControl(existingFramework).setVisible(true);
        formContext.getControl(existingFramework).setDisabled(false);
        formContext.getAttribute("arup_isthereanexistingcrmframeworkrecord").setRequiredLevel('required');
        existingcrmframework_onchange(formContext,trigger);

    }
    else if (opptype == '770000003') {
        if (arupInternal && tab != null) { tab.setVisible(true); }
        formContext.getAttribute("arup_isthereanexistingcrmframeworkrecord").setValue(false);
        formContext.getControl(existingFramework).setVisible(true);
        formContext.getControl(existingFramework).setDisabled(true);
        formContext.getAttribute("arup_isthereanexistingcrmframeworkrecord").setRequiredLevel('required');
        existingcrmframework_onchange(formContext,trigger);
    }
    else {

        if (trigger == 'change') {
            formContext.getAttribute("arup_isthereanexistingcrmframeworkrecord").setValue(null);
            formContext.getAttribute("ccrm_agreementnumber").setValue(null);
            formContext.getAttribute("arup_framework").setValue(null);
        }

        if (arupInternal && tab != null) {
            tab.setVisible(false);
        }
        formContext.getControl(existingFramework).setVisible(false);
        formContext.getAttribute("arup_isthereanexistingcrmframeworkrecord").setRequiredLevel('none');
        formContext.getControl(frameworkAgreement).setVisible(false);
        formContext.getAttribute("ccrm_agreementnumber").setRequiredLevel("none");
        formContext.getControl(frameworkId).setVisible(false);
        formContext.getAttribute("arup_framework").setRequiredLevel("none");
    }
}

function existingcrmframework_onchange_ec(executionContext, trigger) {
        existingcrmframework_onchange(executionContext.getFormContext(), trigger);
}

function existingcrmframework_onchange(formContext,trigger) {
    var crmframeworkchk = formContext.getAttribute("arup_isthereanexistingcrmframeworkrecord").getValue();
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();
    var newOpportunity = formContext.ui.getFormType() == 1;
    var frameworkId = (arupInternal == true && !newOpportunity) ? 'arup_framework1' : 'arup_framework';
    var frameworkAgreement = (arupInternal == true && !newOpportunity) ? 'ccrm_agreementnumber1' : 'ccrm_agreementnumber';

    if (crmframeworkchk == 1) {

        if (trigger == 'change') {
            formContext.getAttribute("ccrm_agreementnumber").setValue(null);
        }

        formContext.getControl(frameworkId).setVisible(true);
        formContext.getAttribute("arup_framework").setRequiredLevel("required");
        formContext.getControl(frameworkAgreement).setVisible(false);
        formContext.getAttribute("ccrm_agreementnumber").setRequiredLevel("none");
    }
    else if (crmframeworkchk == 0) {
        if (trigger == 'change') {
            formContext.getAttribute("arup_framework").setValue(null);
        }
        formContext.getControl(frameworkId).setVisible(false);
        formContext.getAttribute("arup_framework").setRequiredLevel("none");
        formContext.getControl(frameworkAgreement).setVisible(true);
        formContext.getAttribute("ccrm_agreementnumber").setRequiredLevel("required");
    }
    else if (crmframeworkchk == null) {
        if (trigger == 'change') {
            formContext.getAttribute("arup_framework").setValue(null);
        }
        formContext.getControl(frameworkId).setVisible(false);
        formContext.getAttribute("arup_framework").setRequiredLevel("none");
        formContext.getControl(frameworkAgreement).setVisible(false);
        formContext.getAttribute("ccrm_agreementnumber").setRequiredLevel("none");
    }
}

function clearSpace() {
   
    var corTabP1 = window.parent.document.getElementsByName("Summary_section_4")[0];
    if (corTabP1 != undefined) {
        window.parent.document.getElementsByName("Summary_section_4")[0].style.padding = "0px";
        //   window.parent.document.getElementsByName("Summary_section_4")[0].style.marginTop = "0px";
    }

    var corTabP2 = window.parent.document.getElementsByName("Extend_Arup_Services_Section")[0];
    if (corTabP2 != undefined) {
        window.parent.document.getElementsByName("Extend_Arup_Services_Section")[0].style.padding = "0px";
        //    window.parent.document.getElementsByName("Extend_Arup_Services_Section")[0].style.marginTop = "0px";
    }

    var corTabP3 = window.parent.document.getElementsByName("client_details_section")[0];
    if (corTabP3 != undefined) {
        window.parent.document.getElementsByName("client_details_section")[0].style.padding = "0px";
        //    window.parent.document.getElementsByName("client_details_section")[0].style.marginTop = "0px";
    }

    var corTabP4 = window.parent.document.getElementsByName("Project_Details_Tab_section_4")[0];
    if (corTabP4 != undefined) {
        window.parent.document.getElementsByName("Project_Details_Tab_section_4")[0].style.padding = "0px";
        //    window.parent.document.getElementsByName("Project_Details_Tab_section_4")[0].style.marginTop = "0px";
    }
}

function setTimeoutfn_ec(executionContext, attributeName) {
    var formContext = executionContext.getFormContext();
    setTimeoutfn(formContext, attributeName)
}

function setTimeoutfn(formContext,attributeName) {
    var arupInternal = formContext.getAttribute("ccrm_arupinternal").getValue();

    if (formContext.ui.getFormType() == 1 || arupInternal) { return; }

    setTimeout(procurementTypeFullForm_onChange(attributeName), 500);
}

function procurementTypeFullForm_onChange(attributeName) {

    cachefields['attributename'] = attributeName;

    var confirmButton = new Alert.Button();
    confirmButton.label = "Confirm";
    confirmButton.callback = onConfirmButtonClick;

    var cancelButton = new Alert.Button();
    cancelButton.label = "Cancel";
    cancelButton.callback = onCancelButtonClick;

    var buttonArray = new Array();
    var titleFieldName = "Project Procurement";

    if (attributeName == "arup_opportunitytype") {
        titleFieldName = "Opportunity Type";
    }

    buttonArray.push(confirmButton);
    buttonArray.push(cancelButton);
    Alert.showWebResource("arup_procurementtypesupportingtext", 650, 350, "Please, confirm your selection of " + titleFieldName, buttonArray, null, true, 10);
}

function onConfirmButtonClick(formContext) {

    attrName = cachefields['attributename'];
    if (attrName == "arup_opportunitytype") {
        cachefields["ccrm_contractarrangement"] = formContext.getAttribute("ccrm_contractarrangement").getValue();
    }
    cachefields[attrName] = formContext.getAttribute(attrName).getValue();
    Alert.hide();
}

function onCancelButtonClick(formContext) {

    attrName = cachefields['attributename'];
    if (attrName == "arup_opportunitytype") {
        formContext.getAttribute("ccrm_contractarrangement").setValue(cachefields["ccrm_contractarrangement"]);
    }
    formContext.getAttribute(attrName).setValue(cachefields[attrName]);
    formContext.getAttribute(attrName).fireOnChange();
    Alert.hide();
}

function BidSubmittedClick(formContext) {
    debugger;
    formContext.getAttribute("arup_bidsubmitteddate").setValue(new Date());
    formContext.getAttribute("arup_bidsubmissionoutcome").setValue(770000001);
    formContext.data.entity.save();
   // formContext.ui.refreshRibbon();

   // setTimeout(function () { Xrm.Utility.openEntityForm(formContext.data.entity.getEntityName(), formContext.data.entity.getId()); },100);

   // refreshPage();

    var webResource = formContext.getControl("WebResource_bidreviewsubmissionnavigation");
    var src = webResource.getSrc();

    var aboutBlank = "about:blank";
    webResource.setSrc(aboutBlank);

    setTimeout(function () {
        webResource.setSrc(src);
    }, 1000);

 
}

function FormNotificationForOpportunityType(formContext,opportunityTypeValue) {
    if (opportunityTypeValue == '770000005') {
        formContext.ui.setFormNotification("This opportunity cannot be pushed past Pre-Bid stage because its type is Architectural competition with multiple Arup teams – master record", "INFORMATION", "OpportunityType-MasterRecord");
    } else {
        formContext.ui.clearFormNotification('OpportunityType-MasterRecord');
    }
}

function clearSpace() {
    var corTabP1 = window.parent.document.getElementsByName("Summary_section_4")[0];
    if (corTabP1 != undefined) {
        window.parent.document.getElementsByName("Summary_section_4")[0].style.padding = "0px";
    }

    var corTabP2 = window.parent.document.getElementsByName("Extend_Arup_Services_Section")[0];
    if (corTabP2 != undefined) {
        window.parent.document.getElementsByName("Extend_Arup_Services_Section")[0].style.padding = "0px";
    }

    var corTabP3 = window.parent.document.getElementsByName("client_details_section")[0];
    if (corTabP3 != undefined) {
        window.parent.document.getElementsByName("client_details_section")[0].style.padding = "0px";
    }
}

function IsDependentFieldValueValid(entityName,mainOptionsetFieldName, mainOptionSetFieldValue, dependentOptionsetFieldName, dependentOptionsetFieldValue) {

    var isDependentFieldValueValid = false;
    var req = new XMLHttpRequest();
    req.open("GET", formContext.context.getClientUrl() + "/api/data/v8.2/arup_crmfieldconfigurations?$select=arup_dependentfieldvalue,arup_isdependentfielddefaultvalue,arup_isdependentfieldreadonly&$filter=arup_mainoptionsetfieldname eq '" + mainOptionsetFieldName + "' and  arup_dependentfieldname eq '" + dependentOptionsetFieldName + "' and  arup_mainoptionsetfieldvalue eq '" + mainOptionSetFieldValue + "' and arup_isdependentoptionset eq true and arup_entityname eq '" + entityName + "'", false);
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
                if (results.value.length > 0) {

                    for (var i = 0; i < results.value.length; i++) {
                        if (dependentOptionsetFieldValue == results.value[i]["arup_dependentfieldvalue"]) {
                            isDependentFieldValueValid = true;
                        }
                    }
                }
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    };
    req.send();

    return isDependentFieldValueValid;
}
    
function arupInternal_Onchange(executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("ccrm_parentopportunityid").getValue() != null) {
        ClearFields(formContext,"ccrm_parentopportunityid", "arup_subbusiness", "ccrm_arupbusinessid", "ccrm_accountingcentreid", "ccrm_arupcompanyid", "ccrm_arupusstateid", "ccrm_client", "ccrm_contractarrangement",  "ccrm_leadsource", "ccrm_location", "arup_globalservices", "ccrm_othernetworkdetails", "ccrm_probabilityofprojectproceeding", "ccrm_projectlocationid", "ccrm_ultimateendclientid", "closeprobability");
        EnableFields(formContext,"arup_subbusiness", "ccrm_arupbusinessid", "ccrm_accountingcentreid", "ccrm_arupcompanyid", "ccrm_arupusstateid", "ccrm_client", "ccrm_contractarrangement",  "ccrm_leadsource", "ccrm_location", "arup_globalservices", "ccrm_othernetworkdetails", "ccrm_probabilityofprojectproceeding", "ccrm_projectlocationid", "ccrm_ultimateendclientid", "closeprobability");
    }
    ParentOpportunityFilter(formContext);
}

function ClearFields(formContext,fieldName) {
    for (var field in arguments) {
        if (field != 0) {
            var attrName = arguments[field];
            var controlName = attrName;
            var control = formContext.getAttribute(controlName);
            if (control != null) {
                control.setValue(null);
            }
        }
    }
}
    