////////////
// Global Variables
///////////
var enquiryTypeValue = { "Other": 100000016 };
var contractStatusValue = { "Other": 100000003 };
var statusCodeName = { "New": 100000000, "Assigned": 100000001 };

function Form_onload() {

    // -- Form Creation
    if (Xrm.Page.ui.getFormType() == 1) {
        //force submit
        forceSubmitOnCreation();

        //set the initial Assigned To to the user creating the record
        var lookupData = new Array();
        var lookupItem = new Object();
        lookupItem.id = Xrm.Page.context.getUserId();
        lookupItem.name = Xrm.Page.context.getUserName();
        lookupItem.entityType = 'systemuser';
        lookupData[0] = lookupItem;
        Xrm.Page.getAttribute('ccrm_assignedtosync_userid').setValue(lookupData);


        //set sharepoint parameters
        //setSharePointParameters();

        if (Xrm.Page.context.client.getFormFactor() != "Mobile") {
            Xrm.Page.ui.tabs.get("tab_tabs").setVisible(false);
        }
    }

    // -- Form Not on Creation
    if (Xrm.Page.ui.getFormType() != 1) {

        //disable the enq clam radio field once saved
        Xrm.Page.getControl("ccrm_enquiryclaim").setDisabled(true);

        // recalculate amounts when the form loads for claims
        var enquiry = Xrm.Page.getAttribute("ccrm_enquiryclaim").getValue();
        if (enquiry == 0) {
            calculateTotalBudget();
        }

    }
    // -- Form On Update
    if (Xrm.Page.ui.getFormType() == 2) {
        //update the assigned to sync field with owner        
        setAssignedToSyncFromConverted();

    }

    //set visibility for joint venture/subcontractors sections
    onChangeArupJointVenture();
    onChangeClientJointVenture();
    onChangeSubcontractors();

    //set enquiryType, contractStatus, procurementRoute visibility
    enquiryType();
    tabBehaviour();

    oldClient = Xrm.Page.getAttribute("customerid").getValue();

    oldArupCompany = Xrm.Page.getAttribute("ccrm_contractingarupcompany").getValue();

    //fn to prevent users from putting legal to confid and back again quickly
    confidentialFlag();

    contractType_onChange();
    //Project ID is locked

}

function Form_onsave(executionObj) {

    //on creation save
    if (Xrm.Page.data.entity.getId() == null) {

        if (Xrm.Page.getAttribute("ccrm_jointventure").getValue() == true ||
            Xrm.Page.getAttribute("ccrm_subcontractor").getValue() == true ||
            Xrm.Page.getAttribute("ccrm_clientinjointventure").getValue == true) {
            var saveMode = executionObj.getEventArgs().getSaveMode();
            //if save mode is saveandclose
            if (saveMode == 2) {
                //cancel save
                executionObj.getEventArgs().preventDefault();
                //has the save been prevented
                if (executionObj.getEventArgs().isDefaultPrevented() == true) {
                    //save record if the save mode was save and close
                    Xrm.Page.data.entity.save();
                }
                //stop save
                return false;
            }
            if (Xrm.Page.getAttribute("ccrm_jointventure").getValue() == true) {
                alert("Please add the Organisations with whom Arup is collaborating on the JV via 'Connections'");
            }
            if (Xrm.Page.getAttribute("ccrm_clientinjointventure").getValue() == true) {
                alert("Please add the Organisations with whom Arup is collaborating on the JV via 'Connections'");
            }
            if (Xrm.Page.getAttribute("ccrm_subcontractor").getValue() == true) {
                alert("Please add the Sub-contractors using sub-grid");
            }
        }

    }

    if (Xrm.Page.ui.getFormType() == 1) {

        if (Xrm.Page.ui.tabs.get("tab_tabs").getVisible() == false) {
            Xrm.Page.ui.tabs.get("tab_tabs").setVisible(true);
        }
        var webResource = Xrm.Page.ui.controls.get("WebResource_tabs");
        webResource.setSrc(webResource.getSrc());

    }

}

// Begin On Change Functions
///////////
function assignedToOwner_onchange() {
    assignedToSync();
}

function enquiryClaim_onchange() {
    tabBehaviour();
}

function enquiryType_onchange() {
    enquiryType();
}

function contractStatus_onchange() {
    contractStatus();
}

function customerid_onchange() {
    clientChange();
}

function arupContractingCompany_onchange() {
    arupCompanyChange();
}

function contractType_onChange() {

    var contractType;
    var contractTypeOther;

    var enquiry = Xrm.Page.getAttribute("ccrm_enquiryclaim").getValue();
    if (enquiry == 0) {
        contractType = 'ccrm_contracttype1';
        contractTypeOther = 'ccrm_contracttypeother1';
    }
    else {
        contractType = 'ccrm_contracttype';
        contractTypeOther = 'ccrm_contracttypeother';
    }

    contractTypeAttr = Xrm.Page.getControl(contractType);
    contractTypeOtherAttr = Xrm.Page.getControl(contractTypeOther);

    if (contractTypeAttr != null && contractTypeOtherAttr != null) {

        contractTypeAttr.setVisible(true);

        var contractTypeValue = Xrm.Page.getAttribute("ccrm_contracttype").getValue();
        if (contractTypeValue == '100000015') {
            contractTypeOtherAttr.setVisible(true);
            Xrm.Page.getAttribute('ccrm_contracttypeother').setRequiredLevel(true);
        }
        else {
            contractTypeOtherAttr.setVisible(false);
            Xrm.Page.getAttribute('ccrm_contracttypeother').setRequiredLevel(false);
        }
    }

}
////////////
// End On Change Functions
///////////

////////////
// Begin General Functions
///////////

function HidePickListItem(listID, value) {

    var objList = Xrm.Page.getControl(listID);
    objList.removeOption(value);

}

function ShowPickListItem(listID, value) {
    var optionsetControl = Xrm.Page.ui.controls.get(listID);
    var options = optionsetControl.getAttribute().getOptions();

    //loop through the options and if it matches the value passed then show it 
    for (var i = 0; i < options.length - 1; i++) {
        //check if the optionsetvalue matches the one passed
        if (options[i].value == value) {
            optionsetControl.addOption(options[i]);
        }
    }
}

//function to set required level
function SetRequiredLevel(field, level) {
    Xrm.Page.getAttribute(field).setRequiredLevel(level);
}

function enquiryType() {
    if (Xrm.Page.getAttribute("casetypecode").getValue() == enquiryTypeValue.Other) {
        //show enquiryType other
        Xrm.Page.getControl("ccrm_otherpleasespecify").setVisible(true);
        //make enquiryType other mandatory
        SetRequiredLevel("ccrm_otherpleasespecify", "required");
    }
    else {
        //hide enquiryType other
        Xrm.Page.getControl("ccrm_otherpleasespecify").setVisible(false);
        //make enquiryType other not mandatory
        SetRequiredLevel("ccrm_otherpleasespecify", "none");
    }
}

function onChangeArupJointVenture() {

    if (Xrm.Page.getAttribute("ccrm_jointventure").getValue() == true) {

        Xrm.Page.ui.tabs.get("tab_Enq_ProjectDetails").sections.get("tab_enquiry_jointventures_arup_details").setVisible(true);
        //Xrm.Page.getControl("ccrm_arupinjointventurelookup").setVisible(true);
    }
    else {

        Xrm.Page.ui.tabs.get("tab_Enq_ProjectDetails").sections.get("tab_enquiry_jointventures_arup_details").setVisible(false);
        //Xrm.Page.getControl("ccrm_arupinjointventurelookup").setVisible(false);
    }

}

function onChangeClientJointVenture() {

    if (Xrm.Page.getAttribute("ccrm_clientinjointventure").getValue() == true) {

        Xrm.Page.ui.tabs.get("tab_Enq_ProjectDetails").sections.get("tab_enquiry_jointventures_client_details").setVisible(true);
        //Xrm.Page.getControl("ccrm_clientinjointventurelookup").setVisible(true);
    }
    else {

        Xrm.Page.ui.tabs.get("tab_Enq_ProjectDetails").sections.get("tab_enquiry_jointventures_client_details").setVisible(false);
        //Xrm.Page.getControl("ccrm_clientinjointventurelookup").setVisible(false);
    }

}

function onChangeSubcontractors() {

    if (Xrm.Page.getAttribute("ccrm_subcontractor").getValue() == true) {

        Xrm.Page.ui.tabs.get("tab_Enq_ProjectDetails").sections.get("tab_enquiry_subcontractors_section").setVisible(true);
    }
    else {

        Xrm.Page.ui.tabs.get("tab_Enq_ProjectDetails").sections.get("tab_enquiry_subcontractors_section").setVisible(false);
    }

}

function tabBehaviour() {

    var enquiryFlag = Xrm.Page.getAttribute("ccrm_enquiryclaim").getValue();

    if (enquiryFlag != null) {

        // Enquiry specific tabs
        Xrm.Page.ui.tabs.get("tab_Enq_GeneralInformation").setVisible(enquiryFlag);
        Xrm.Page.ui.tabs.get("Enquiry_Contract_Details_Tab").setVisible(enquiryFlag);
        Xrm.Page.ui.tabs.get("tab_Enq_ProjectDetails").setVisible(enquiryFlag);

        // claim specific tabs
        Xrm.Page.ui.tabs.get("tab_Cla_GeneralInformation").setVisible(!enquiryFlag);
        Xrm.Page.ui.tabs.get("tab_Clm_ContractInformation").setVisible(!enquiryFlag);
        Xrm.Page.ui.tabs.get("tab_Clm_FinancialInformation").setVisible(!enquiryFlag);
        Xrm.Page.ui.tabs.get("tab_Clm_ClaimInformation").setVisible(!enquiryFlag);
        Xrm.Page.ui.tabs.get("tab_Clm_project_details").setVisible(!enquiryFlag);

        // common tabs should be visible for all
        Xrm.Page.ui.tabs.get("tab_14").setVisible(true);
        Xrm.Page.ui.tabs.get("tab_description").setVisible(true);
        Xrm.Page.ui.tabs.get("tab_Connections").setVisible(true);
        Xrm.Page.ui.tabs.get("tab_Documents").setVisible(true);
        Xrm.Page.ui.tabs.get("tab_LessonLearned").setVisible(true);

        var setRequired = (enquiryFlag == true) ? 'required' : 'none';

        SetRequiredLevel("casetypecode", setRequired);

    }
    else {
        Xrm.Page.ui.tabs.get("tab_Enq_GeneralInformation").setVisible(false);
        Xrm.Page.ui.tabs.get("Enquiry_Contract_Details_Tab").setVisible(false);
        Xrm.Page.ui.tabs.get("tab_Enq_ProjectDetails").setVisible(false);

        Xrm.Page.ui.tabs.get("tab_Cla_GeneralInformation").setVisible(false);
        Xrm.Page.ui.tabs.get("tab_Clm_ContractInformation").setVisible(false);
        Xrm.Page.ui.tabs.get("tab_Clm_FinancialInformation").setVisible(false);
        Xrm.Page.ui.tabs.get("tab_Clm_ClaimInformation").setVisible(false);
        Xrm.Page.ui.tabs.get("tab_Clm_project_details").setVisible(false);

        // common tabs should be not be visible for all
        Xrm.Page.ui.tabs.get("tab_14").setVisible(false);
        Xrm.Page.ui.tabs.get("tab_description").setVisible(false);
        Xrm.Page.ui.tabs.get("tab_Connections").setVisible(false);
        Xrm.Page.ui.tabs.get("tab_Documents").setVisible(false);
        Xrm.Page.ui.tabs.get("tab_LessonLearned").setVisible(false);
    }

}

function contractStatus() {
    if (Xrm.Page.getAttribute("ccrm_contractstatus").getValue() == contractStatusValue.Other) {
        //show contractStatus other
        Xrm.Page.getControl("ccrm_contractstatusother").setVisible(true);
        Xrm.Page.getControl("ccrm_contractstatusother1").setVisible(true);
        //make contractStatus other mandatory
        SetRequiredLevel("ccrm_contractstatusother", "required");
    }
    else {
        //hide contractStatus other
        Xrm.Page.getControl("ccrm_contractstatusother").setVisible(false);
        Xrm.Page.getControl("ccrm_contractstatusother1").setVisible(false);
        //make contractStatus other not mandatory
        SetRequiredLevel("ccrm_contractstatusother", "none");
    }
}

function statusChange() {
    //set the statuscode to assigned for initial change only
    Xrm.Page.getAttribute("statuscode").setValue(statusCodeName.Assigned);
    //disable once changed
    // NC 15/04/2015
    //Xrm.Page.getControl("statuscode").setDisabled(true);
    Xrm.Page.getAttribute("statuscode").setSubmitMode("always");
}

function forceSubmitOnCreation() {
    Xrm.Page.getAttribute("ccrm_business").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_contractingarupcompany").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_projectoffice").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_biddirector").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_bidmanager").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_services").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_confirmedjobnumber").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_projectcitytown").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_possiblejobnumber").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_practice").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_originalprojectdirector").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_projectdirector").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_projectmanager").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_originalprojectmanager").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_projectid").setSubmitMode("always");
    Xrm.Page.getAttribute("ccrm_ultimateclient").setSubmitMode("always");
}

function clientChange() {
    //on creation only
    if (Xrm.Page.ui.getFormType() == 1) {
        var newClient = Xrm.Page.getAttribute("customerid").getValue();
        if (newClient != null && oldClient != null) {
            var response = window.confirm("Please be aware that changing the Client will trigger an email alert to the Bid Manager.\n\n Click OK to continue, or Cancel to roll back the change.");
            if (!response) {
                Xrm.Page.getAttribute("customerid").setValue(oldClient);
            }
        }
    }
}

function arupCompanyChange() {
    //on creation only
    if (Xrm.Page.ui.getFormType() == 1) {
        var newArupCompany = Xrm.Page.getAttribute("ccrm_contractingarupcompany").getValue();
        if (newArupCompany != null && oldArupCompany != null) {
            var response = window.confirm("Please be aware that changing the Contracting Arup Company will trigger an email alert to the Bid Manager.\n\n Click OK to continue, or Cancel to roll back the change.");
            if (!response) {
                Xrm.Page.getAttribute("ccrm_contractingarupcompany").setValue(oldArupCompany);
            }
        }
    }
}

function calculateTotalBudget() {
    var result = 0;
    var budgetAllowance02 = Xrm.Page.getAttribute("ccrm_budgetallowance02").getValue();
    var budgetAllowance03 = Xrm.Page.getAttribute("ccrm_budgetallowance03").getValue();
    var budgetAllowance50 = Xrm.Page.getAttribute("ccrm_budgetallowance50").getValue();
    var liabilityProvision = Xrm.Page.getAttribute("ccrm_claimvalueprobable").getValue();
    var coverageCosts = Xrm.Page.getAttribute("arup_05coveragecostsprovisions").getValue();
    var otherCosts = Xrm.Page.getAttribute("arup_06to98othercostsprovisions").getValue();

    var settlementInsurer = Xrm.Page.getAttribute("arup_settlementsumpaidbyinsurers").getValue();
    var defenceInsurer = Xrm.Page.getAttribute("arup_defencecostspaidbyinsurers").getValue();
    var costsInsurer = Xrm.Page.getAttribute("arup_totalcostspaidbyinsurers").getValue();

    if (budgetAllowance02 == null) {
        budgetAllowance02 = Xrm.Page.getAttribute("ccrm_budgetallowance02").setValue(0);
        budgetAllowance02 = 0;
    }
    if (budgetAllowance03 == null) {
        budgetAllowance03 = Xrm.Page.getAttribute("ccrm_budgetallowance03").setValue(0);
        budgetAllowance03 = 0;
    }
    if (budgetAllowance50 == null) {
        budgetAllowance50 = Xrm.Page.getAttribute("ccrm_budgetallowance50").setValue(0);
        budgetAllowance50 = 0;
    }
    if (liabilityProvision == null) {
        liabilityProvision = Xrm.Page.getAttribute("ccrm_claimvalueprobable").setValue(0);
        liabilityProvision = 0;
    }
    if (coverageCosts == null) {
        coverageCosts = Xrm.Page.getAttribute("arup_05coveragecostsprovisions").setValue(0);
        coverageCosts = 0;
    }
    if (otherCosts == null) {
        otherCosts = Xrm.Page.getAttribute("arup_06to98othercostsprovisions").setValue(0);
        otherCosts = 0;
    }

    result = budgetAllowance02 + budgetAllowance03 + budgetAllowance50 + liabilityProvision + coverageCosts + otherCosts;
    //set total
    Xrm.Page.getAttribute("ccrm_totalbudget").setValue(result);
    Xrm.Page.getAttribute("ccrm_totalbudget").setSubmitMode("always");

    if (settlementInsurer == null) {
        settlementInsurer = Xrm.Page.getAttribute("arup_settlementsumpaidbyinsurers").setValue(0);
    }
    if (defenceInsurer == null) {
        defenceInsurer = Xrm.Page.getAttribute("arup_defencecostspaidbyinsurers").setValue(0);
    }
    if (costsInsurer == null) {
        costsInsurer = Xrm.Page.getAttribute("arup_totalcostspaidbyinsurers").setValue(0);
    }
    calcuTotalForecast();

}

function calcuTotalForecast() {

    //Budget Remaining will be the total in “Total Budget (Old)” minus the combination of  
    var result = 0;
    var totalBudget = Xrm.Page.getAttribute("ccrm_totalbudget").getValue();

    var settlementCost = Xrm.Page.getAttribute("ccrm_01settlementsum").getValue();
    var internalCostBusiness = Xrm.Page.getAttribute("ccrm_02internalcosttodate").getValue();
    var externalCostLegal = Xrm.Page.getAttribute("ccrm_03externalcosttodate").getValue();
    var externalCostOther = Xrm.Page.getAttribute("ccrm_50internallegalcoststodate").getValue();
    var coverageCosts = Xrm.Page.getAttribute("arup_05coveragecostsincurred").getValue();
    var otherCosts = Xrm.Page.getAttribute("arup_06to98othercostsincurred").getValue();

    if (totalBudget == null) { totalBudget = 0; }
    if (internalCostBusiness == null) { internalCostBusiness = 0; }
    if (externalCostLegal == null) { externalCostLegal = 0; }
    if (externalCostOther == null) { externalCostOther = 0; }
    if (settlementCost == null) { settlementCost = 0; }
    if (coverageCosts == null) { coverageCosts = 0; }
    if (otherCosts == null) { otherCosts = 0; }

    result = settlementCost + internalCostBusiness + externalCostLegal + externalCostOther + coverageCosts + otherCosts;
    //set total
    Xrm.Page.getAttribute("ccrm_externalcosttodate_other").setValue(result);
    Xrm.Page.getAttribute("ccrm_externalcosttodate_other").setSubmitMode("always");

    var liabilityProvision = Xrm.Page.getAttribute("ccrm_claimvalueprobable").getValue();
    var budgetAllowance02 = Xrm.Page.getAttribute("ccrm_budgetallowance02").getValue();
    var budgetAllowance03 = Xrm.Page.getAttribute("ccrm_budgetallowance03").getValue();
    var budgetAllowance50 = Xrm.Page.getAttribute("ccrm_budgetallowance50").getValue();
    var coverageProCosts = Xrm.Page.getAttribute("arup_05coveragecostsprovisions").getValue();
    var otherProCosts = Xrm.Page.getAttribute("arup_06to98othercostsprovisions").getValue();

    // set 01
    if (liabilityProvision == null || liabilityProvision == 0) {
        Xrm.Page.getAttribute("arup_01settlementremainingcosts").setValue(0);
    } else {
        Xrm.Page.getAttribute("arup_01settlementremainingcosts").setValue(liabilityProvision - settlementCost);
    }

    //set 02
    if (budgetAllowance02 == null || budgetAllowance02 == 0) {
        Xrm.Page.getAttribute("arup_02internalbusinessremainingcosts").setValue(0);
    } else {
        Xrm.Page.getAttribute("arup_02internalbusinessremainingcosts").setValue(budgetAllowance02 - internalCostBusiness);
    }

    //set 03	
    if (budgetAllowance03 == null || budgetAllowance03 == 0) {
        Xrm.Page.getAttribute("arup_03externallegalremainingcosts").setValue(0);
    } else {
        Xrm.Page.getAttribute("arup_03externallegalremainingcosts").setValue(budgetAllowance03 - externalCostLegal);
    }

    //set 04
    if (budgetAllowance50 == null || budgetAllowance50 == 0) {
        Xrm.Page.getAttribute("arup_04internalrecoverableremainingcosts").setValue(0);
    } else {
        Xrm.Page.getAttribute("arup_04internalrecoverableremainingcosts").setValue(budgetAllowance50 - externalCostOther);
    }

    //set 05
    if (coverageProCosts == null || coverageProCosts == 0) {
        Xrm.Page.getAttribute("arup_05coverageremainingcosts").setValue(0);
    } else {
        Xrm.Page.getAttribute("arup_05coverageremainingcosts").setValue(coverageProCosts - coverageCosts);
    }

    //set 06
    if (otherProCosts == null || otherProCosts == 0) {
        Xrm.Page.getAttribute("arup_06to98otherremainingcosts").setValue(0);
    } else {
        Xrm.Page.getAttribute("arup_06to98otherremainingcosts").setValue(otherProCosts - otherCosts);
    }

    //set budget remaining 
    Xrm.Page.getAttribute("ccrm_totalforecast").setValue(totalBudget - result);
    Xrm.Page.getAttribute("ccrm_totalforecast").setSubmitMode("always");
    Xrm.Page.getAttribute("arup_01settlementremainingcosts").setSubmitMode("always");
    Xrm.Page.getAttribute("arup_02internalbusinessremainingcosts").setSubmitMode("always");
    Xrm.Page.getAttribute("arup_03externallegalremainingcosts").setSubmitMode("always");
    Xrm.Page.getAttribute("arup_04internalrecoverableremainingcosts").setSubmitMode("always");
    Xrm.Page.getAttribute("arup_05coverageremainingcosts").setSubmitMode("always");
    Xrm.Page.getAttribute("arup_06to98otherremainingcosts").setSubmitMode("always");
}

function assignedToSync() {

    //do not re-assign the owner for the newly created records. it will be done in the workflow
    if (Xrm.Page.ui.getFormType() == 1) { return };

    var assignedUserId = Xrm.Page.getAttribute("ccrm_assignedtosync_userid").getValue();
    if (assignedUserId != null && assignedUserId != Xrm.Page.getAttribute("ownerid").getValue()) {
        Xrm.Page.getAttribute("ownerid").setValue(assignedUserId);
    }
}

function setAssignedToSyncFromConverted() {
    var ownerId = Xrm.Page.getAttribute("ownerid").getValue();
    var assignedToSyncUserId = Xrm.Page.getAttribute("ccrm_assignedtosync_userid").getValue();
    if (assignedToSyncUserId == null && assignedToSyncUserId != Xrm.Page.getAttribute("ccrm_assignedtosync_userid").getValue()) {
        Xrm.Page.getAttribute("ccrm_assignedtosync_userid").setValue(ownerId);
        //force save
        Xrm.Page.data.entity.save();
    }
}

function fnSharePoint() {

    //show sharepoint tab when url is defined
    var sharepointUrl = Xrm.Page.getAttribute("ccrm_sys_sharepoint_url").getValue();
    if (sharepointUrl != null) {
        //show tab
        Xrm.Page.ui.tabs.get("tab_Documents").setVisible(true);

        //display the iframe redirect to sharepoint url

        Xrm.Page.getControl("IFRAME_SharePointURL").setSrc(sharepointUrl);
    }
    else {
        //hide tab
        Xrm.Page.ui.tabs.get("tab_Documents").setVisible(false);
    }
}

function confidentialFlag() {
    var confidentialFlag = Xrm.Page.getAttribute("ccrm_confidential").getValue();
    if (confidentialFlag == true) {
        Xrm.Page.getControl("ccrm_confidential").setDisabled(true);
        Xrm.Page.getControl("ccrm_assignedtosync_userid1").setDisabled(true);
        Xrm.Page.getControl("ccrm_assignedtosync_userid").setDisabled(true);
    }
}

//function setSharePointParameters() {
//    //function to set default sharepoint patameters - 1 for create
//    Xrm.Page.getAttribute("ccrm_sys_sharepoint_status").setValue(1);
//    Xrm.Page.getAttribute("ccrm_sys_sharepoint_trigger").setValue(true);
//    //force submit
//    Xrm.Page.getAttribute("ccrm_sys_sharepoint_status").setSubmitMode("always");
//    Xrm.Page.getAttribute("ccrm_sys_sharepoint_trigger").setSubmitMode("always");
//}

////create sharepoint button
//function fnBtnCreateSharePoint() {
//    alert('Your request to create a Document Store has been sent');
//    //set the sharepoint flag
//    Xrm.Page.getAttribute("ccrm_sys_sharepoint_trigger").setValue(true);
//    Xrm.Page.getAttribute("ccrm_sys_sharepoint_status").setValue(1);
//    //force submit
//    Xrm.Page.getAttribute("ccrm_sys_sharepoint_trigger").setSubmitMode("always");
//    Xrm.Page.getAttribute("ccrm_sys_sharepoint_status").setSubmitMode("always");
//    //force save
//    Xrm.Page.data.entity.save();
//}

function OpenDocumentStore() {

    var sharepointUrl = Xrm.Page.getAttribute("ccrm_sys_sharepoint_url").getValue();

    if (sharepointUrl) {
        window.open(sharepointUrl, '_blank');
    } else {
        alert("Document store not set! Please contact the CRM Support");
    }

}
////////////
// End General Functions
///////////