////////////
// Global Variables
///////////
var enquiryTypeValue = { "Other": 100000016 };
var contractStatusValue = { "Other": 100000003 };
var statusCodeName = { "New": 100000000, "Assigned": 100000001 };

function Form_onload(executioncontext) {
    var formContext = executioncontext.getFormContext();
    // -- Form Creation
    if (formContext.ui.getFormType() == 1) {
        //force submit
        forceSubmitOnCreation(formContext);

        //set the initial Assigned To to the user creating the record
        var lookupData = new Array();
        var lookupItem = new Object();
        lookupItem.id = formContext.context.getUserId();
        lookupItem.name = formContext.context.getUserName();
        lookupItem.entityType = 'systemuser';
        lookupData[0] = lookupItem;
        formContext.getAttribute('ccrm_assignedtosync_userid').setValue(lookupData);


        //set sharepoint parameters
        //setSharePointParameters();

        if (formContext.context.client.getFormFactor() != "Mobile") {
            formContext.ui.tabs.get("tab_tabs").setVisible(false);
        }
    }

    // -- Form Not on Creation
    if (formContext.ui.getFormType() != 1) {

        //disable the enq clam radio field once saved
        formContext.getControl("ccrm_enquiryclaim").setDisabled(true);

        // recalculate amounts when the form loads for claims
        var enquiry = formContext.getAttribute("ccrm_enquiryclaim").getValue();
        if (enquiry == 0) {
            calculateTotalBudget(formContext);
        }

    }
    // -- Form On Update
    if (formContext.ui.getFormType() == 2) {
        //update the assigned to sync field with owner        
        setAssignedToSyncFromConverted(formContext);

    }

    //set visibility for joint venture/subcontractors sections
    onChangeArupJointVenture(executioncontext);
    onChangeClientJointVenture(executioncontext);
    onChangeSubcontractors(executioncontext);

    //set enquiryType, contractStatus, procurementRoute visibility
    enquiryType(formContext);
    tabBehaviour(formContext);

    oldClient = formContext.getAttribute("customerid").getValue();

    oldArupCompany = formContext.getAttribute("ccrm_contractingarupcompany").getValue();

    //fn to prevent users from putting legal to confid and back again quickly
    confidentialFlag(formContext);

    contractType_onChange(executioncontext);
    //Project ID is locked

}

function Form_onsave(executionObj) {
    var formContext = executionObj.getFormContext();
    //on creation save
    if (formContext.data.entity.getId() == null) {

        if (formContext.getAttribute("ccrm_jointventure").getValue() == true ||
            formContext.getAttribute("ccrm_subcontractor").getValue() == true ||
            formContext.getAttribute("ccrm_clientinjointventure").getValue == true) {
            var saveMode = executionObj.getEventArgs().getSaveMode();
            //if save mode is saveandclose
            if (saveMode == 2) {
                //cancel save
                executionObj.getEventArgs().preventDefault();
                //has the save been prevented
                if (executionObj.getEventArgs().isDefaultPrevented() == true) {
                    //save record if the save mode was save and close
                    formContext.data.entity.save();
                }
                //stop save
                return false;
            }
            if (formContext.getAttribute("ccrm_jointventure").getValue() == true) {
                alert("Please add the Organisations with whom Arup is collaborating on the JV via 'Connections'");
            }
            if (formContext.getAttribute("ccrm_clientinjointventure").getValue() == true) {
                alert("Please add the Organisations with whom Arup is collaborating on the JV via 'Connections'");
            }
            if (formContext.getAttribute("ccrm_subcontractor").getValue() == true) {
                alert("Please add the Sub-contractors using sub-grid");
            }
        }

    }

    if (formContext.ui.getFormType() == 1) {

        if (formContext.ui.tabs.get("tab_tabs").getVisible() == false) {
            formContext.ui.tabs.get("tab_tabs").setVisible(true);
        }
        var webResource = formContext.ui.controls.get("WebResource_tabs");
        webResource.setSrc(webResource.getSrc());

    }

}

// Begin On Change Functions
///////////
function assignedToOwner_onchange(executioncontext) {
    var formContext = executioncontext.getFormContext();
    assignedToSync(formContext);
}

function enquiryClaim_onchange(executioncontext) {
    var formContext = executioncontext.getFormContext();
    tabBehaviour(formContext);
}

function enquiryType_onchange(executioncontext) {
    var formContext = executioncontext.getFormContext();
    enquiryType(formContext);
}

function contractStatus_onchange(executioncontext) {
    var formContext = executioncontext.getFormContext();
    contractStatus(formContext);
}

function customerid_onchange(executioncontext) {
    var formContext = executioncontext.getFormContext();
    clientChange(formContext);
}

function arupContractingCompany_onchange(executioncontext) {
    var formContext = executioncontext.getFormContext();
    arupCompanyChange(formContext);
}

function contractType_onChange(executioncontext) {
    var formContext = executioncontext.getFormContext();

    var contractType;
    var contractTypeOther;

    var enquiry = formContext.getAttribute("ccrm_enquiryclaim").getValue();
    if (enquiry == 0) {
        contractType = 'ccrm_contracttype1';
        contractTypeOther = 'ccrm_contracttypeother1';
    }
    else {
        contractType = 'ccrm_contracttype';
        contractTypeOther = 'ccrm_contracttypeother';
    }

    contractTypeAttr = formContext.getControl(contractType);
    contractTypeOtherAttr = formContext.getControl(contractTypeOther);

    if (contractTypeAttr != null && contractTypeOtherAttr != null) {

        contractTypeAttr.setVisible(true);

        var contractTypeValue = formContext.getAttribute("ccrm_contracttype").getValue();
        if (contractTypeValue == '100000015') {
            contractTypeOtherAttr.setVisible(true);
            formContext.getAttribute('ccrm_contracttypeother').setRequiredLevel("required");
        }
        else {
            contractTypeOtherAttr.setVisible(false);
            formContext.getAttribute('ccrm_contracttypeother').setRequiredLevel("none");
        }
    }

}
////////////
// End On Change Functions
///////////

////////////
// Begin General Functions
///////////

function HidePickListItem(formContext, listID, value) {

    var objList = formContext.getControl(listID);
    objList.removeOption(value);

}

function ShowPickListItem(formContext, listID, value) {
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

//function to set required level
function SetRequiredLevel(field, level, formContext) {
    formContext.getAttribute(field).setRequiredLevel(level);
}

function enquiryType(formContext) {
    if (formContext.getAttribute("casetypecode").getValue() == enquiryTypeValue.Other) {
        //show enquiryType other
        formContext.getControl("ccrm_otherpleasespecify").setVisible(true);
        //make enquiryType other mandatory
        SetRequiredLevel("ccrm_otherpleasespecify", "required", formContext);
    }
    else {
        //hide enquiryType other
        formContext.getControl("ccrm_otherpleasespecify").setVisible(false);
        //make enquiryType other not mandatory
        SetRequiredLevel("ccrm_otherpleasespecify", "none", formContext);
    }
}

function onChangeArupJointVenture(executioncontext) {
    var formContext = executioncontext.getFormContext();

    if (formContext.getAttribute("ccrm_jointventure").getValue() == true) {

        formContext.ui.tabs.get("tab_Enq_ProjectDetails").sections.get("tab_enquiry_jointventures_arup_details").setVisible(true);
    }
    else {
        formContext.ui.tabs.get("tab_Enq_ProjectDetails").sections.get("tab_enquiry_jointventures_arup_details").setVisible(false);
    }

}

function onChangeClientJointVenture(executioncontext) {
    var formContext = executioncontext.getFormContext();

    if (formContext.getAttribute("ccrm_clientinjointventure").getValue() == true) {

        formContext.ui.tabs.get("tab_Enq_ProjectDetails").sections.get("tab_enquiry_jointventures_client_details").setVisible(true);
    }
    else {

        formContext.ui.tabs.get("tab_Enq_ProjectDetails").sections.get("tab_enquiry_jointventures_client_details").setVisible(false);
    }

}

function onChangeSubcontractors(executioncontext) {
    var formContext = executioncontext.getFormContext();

    if (formContext.getAttribute("ccrm_subcontractor").getValue() == true) {

        formContext.ui.tabs.get("tab_Enq_ProjectDetails").sections.get("tab_enquiry_subcontractors_section").setVisible(true);
    }
    else {

        formContext.ui.tabs.get("tab_Enq_ProjectDetails").sections.get("tab_enquiry_subcontractors_section").setVisible(false);
    }

}

function tabBehaviour(formContext) {

    var enquiryFlag = formContext.getAttribute("ccrm_enquiryclaim").getValue();
    formContext.ui.tabs.get("tab_14").setFocus();
    if (enquiryFlag != null) {

        // Enquiry specific tabs
        formContext.ui.tabs.get("tab_Enq_GeneralInformation").setVisible(enquiryFlag);
        formContext.ui.tabs.get("Enquiry_Contract_Details_Tab").setVisible(enquiryFlag);
        formContext.ui.tabs.get("tab_Enq_ProjectDetails").setVisible(enquiryFlag);

        // claim specific tabs
        formContext.ui.tabs.get("tab_Cla_GeneralInformation").setVisible(!enquiryFlag);
        formContext.ui.tabs.get("tab_Clm_ContractInformation").setVisible(!enquiryFlag);
        formContext.ui.tabs.get("tab_Clm_FinancialInformation").setVisible(!enquiryFlag);
        formContext.ui.tabs.get("tab_Clm_ClaimInformation").setVisible(!enquiryFlag);
        formContext.ui.tabs.get("tab_Clm_project_details").setVisible(!enquiryFlag);

        // common tabs should be visible for all
        formContext.ui.tabs.get("tab_14").setVisible(true);
        formContext.ui.tabs.get("tab_description").setVisible(true);
        formContext.ui.tabs.get("tab_Connections").setVisible(true);
        formContext.ui.tabs.get("tab_Documents").setVisible(true);
        formContext.ui.tabs.get("tab_LessonLearned").setVisible(true);

        var setRequired = (enquiryFlag == true) ? 'required' : 'none';

        SetRequiredLevel("casetypecode", setRequired, formContext);

    }
    else {
        formContext.ui.tabs.get("tab_Enq_GeneralInformation").setVisible(false);
        formContext.ui.tabs.get("Enquiry_Contract_Details_Tab").setVisible(false);
        formContext.ui.tabs.get("tab_Enq_ProjectDetails").setVisible(false);

        formContext.ui.tabs.get("tab_Cla_GeneralInformation").setVisible(false);
        formContext.ui.tabs.get("tab_Clm_ContractInformation").setVisible(false);
        formContext.ui.tabs.get("tab_Clm_FinancialInformation").setVisible(false);
        formContext.ui.tabs.get("tab_Clm_ClaimInformation").setVisible(false);
        formContext.ui.tabs.get("tab_Clm_project_details").setVisible(false);

        // common tabs should be not be visible for all
        formContext.ui.tabs.get("tab_14").setVisible(false);
        formContext.ui.tabs.get("tab_description").setVisible(false);
        formContext.ui.tabs.get("tab_Connections").setVisible(false);
        formContext.ui.tabs.get("tab_Documents").setVisible(false);
        formContext.ui.tabs.get("tab_LessonLearned").setVisible(false);
    }

}

function contractStatus(formContext) {
    if (formContext.getAttribute("ccrm_contractstatus").getValue() == contractStatusValue.Other) {
        //show contractStatus other
        formContext.getControl("ccrm_contractstatusother").setVisible(true);
        formContext.getControl("ccrm_contractstatusother1").setVisible(true);
        //make contractStatus other mandatory
        SetRequiredLevel("ccrm_contractstatusother", "required", formContext);
    }
    else {
        //hide contractStatus other
        formContext.getControl("ccrm_contractstatusother").setVisible(false);
        formContext.getControl("ccrm_contractstatusother1").setVisible(false);
        //make contractStatus other not mandatory
        SetRequiredLevel("ccrm_contractstatusother", "none", formContext);
    }
}

function statusChange(formContext) {
    //set the statuscode to assigned for initial change only
    formContext.getAttribute("statuscode").setValue(statusCodeName.Assigned);
    formContext.getAttribute("statuscode").setSubmitMode("always");
}

function forceSubmitOnCreation(formContext) {
    formContext.getAttribute("ccrm_business").setSubmitMode("always");
    formContext.getAttribute("ccrm_contractingarupcompany").setSubmitMode("always");
    formContext.getAttribute("ccrm_projectoffice").setSubmitMode("always");
    formContext.getAttribute("ccrm_biddirector").setSubmitMode("always");
    formContext.getAttribute("ccrm_bidmanager").setSubmitMode("always");
    formContext.getAttribute("ccrm_services").setSubmitMode("always");
    formContext.getAttribute("ccrm_confirmedjobnumber").setSubmitMode("always");
    formContext.getAttribute("ccrm_projectcitytown").setSubmitMode("always");
    formContext.getAttribute("ccrm_possiblejobnumber").setSubmitMode("always");
    formContext.getAttribute("ccrm_practice").setSubmitMode("always");
    formContext.getAttribute("ccrm_originalprojectdirector").setSubmitMode("always");
    formContext.getAttribute("ccrm_projectdirector").setSubmitMode("always");
    formContext.getAttribute("ccrm_projectmanager").setSubmitMode("always");
    formContext.getAttribute("ccrm_originalprojectmanager").setSubmitMode("always");
    formContext.getAttribute("ccrm_projectid").setSubmitMode("always");
    formContext.getAttribute("ccrm_ultimateclient").setSubmitMode("always");
}

function clientChange(formContext) {
    //on creation only
    if (formContext.ui.getFormType() == 1) {
        var newClient = formContext.getAttribute("customerid").getValue();
        if (newClient != null && oldClient != null) {
            var response = window.confirm("Please be aware that changing the Client will trigger an email alert to the Bid Manager.\n\n Click OK to continue, or Cancel to roll back the change.");
            if (!response) {
                formContext.getAttribute("customerid").setValue(oldClient);
            }
        }
    }
}

function arupCompanyChange(formContext) {
    //on creation only
    if (formContext.ui.getFormType() == 1) {
        var newArupCompany = formContext.getAttribute("ccrm_contractingarupcompany").getValue();
        if (newArupCompany != null && oldArupCompany != null) {
            var response = window.confirm("Please be aware that changing the Contracting Arup Company will trigger an email alert to the Bid Manager.\n\n Click OK to continue, or Cancel to roll back the change.");
            if (!response) {
                formContext.getAttribute("ccrm_contractingarupcompany").setValue(oldArupCompany);
            }
        }
    }
}

function calculateTotalBudget(executioncontext) {
    var formContext;
    if (typeof(executioncontext.getAttribute) != "function") {
        formContext = executioncontext.getFormContext();
    }
    else {
        formContext = executioncontext;
    }
    var result = 0;
    var budgetAllowance02 = formContext.getAttribute("ccrm_budgetallowance02").getValue();
    var budgetAllowance03 = formContext.getAttribute("ccrm_budgetallowance03").getValue();
    var budgetAllowance50 = formContext.getAttribute("ccrm_budgetallowance50").getValue();
    var liabilityProvision = formContext.getAttribute("ccrm_claimvalueprobable").getValue();
    var coverageCosts = formContext.getAttribute("arup_05coveragecostsprovisions").getValue();
    var otherCosts = formContext.getAttribute("arup_06to98othercostsprovisions").getValue();

    var settlementInsurer = formContext.getAttribute("arup_settlementsumpaidbyinsurers").getValue();
    var defenceInsurer = formContext.getAttribute("arup_defencecostspaidbyinsurers").getValue();
    var costsInsurer = formContext.getAttribute("arup_totalcostspaidbyinsurers").getValue();

    if (budgetAllowance02 == null) {
        budgetAllowance02 = formContext.getAttribute("ccrm_budgetallowance02").setValue(0);
        budgetAllowance02 = 0;
    }
    if (budgetAllowance03 == null) {
        budgetAllowance03 = formContext.getAttribute("ccrm_budgetallowance03").setValue(0);
        budgetAllowance03 = 0;
    }
    if (budgetAllowance50 == null) {
        budgetAllowance50 = formContext.getAttribute("ccrm_budgetallowance50").setValue(0);
        budgetAllowance50 = 0;
    }
    if (liabilityProvision == null) {
        liabilityProvision = formContext.getAttribute("ccrm_claimvalueprobable").setValue(0);
        liabilityProvision = 0;
    }
    if (coverageCosts == null) {
        coverageCosts = formContext.getAttribute("arup_05coveragecostsprovisions").setValue(0);
        coverageCosts = 0;
    }
    if (otherCosts == null) {
        otherCosts = formContext.getAttribute("arup_06to98othercostsprovisions").setValue(0);
        otherCosts = 0;
    }

    result = budgetAllowance02 + budgetAllowance03 + budgetAllowance50 + liabilityProvision + coverageCosts + otherCosts;
    //set total
    formContext.getAttribute("ccrm_totalbudget").setValue(result);
    formContext.getAttribute("ccrm_totalbudget").setSubmitMode("always");

    if (settlementInsurer == null) {
        settlementInsurer = formContext.getAttribute("arup_settlementsumpaidbyinsurers").setValue(0);
    }
    if (defenceInsurer == null) {
        defenceInsurer = formContext.getAttribute("arup_defencecostspaidbyinsurers").setValue(0);
    }
    if (costsInsurer == null) {
        costsInsurer = formContext.getAttribute("arup_totalcostspaidbyinsurers").setValue(0);
    }
    calcuTotalForecast(formContext);

}

function calcuTotalForecast(executioncontext) {
    var formContext;
    if (typeof (executioncontext.getAttribute) != "function") {
        formContext = executioncontext.getFormContext();
    }
    else {
        formContext = executioncontext;
    }
    //Budget Remaining will be the total in “Total Budget (Old)” minus the combination of  
    var result = 0;
    var totalBudget = formContext.getAttribute("ccrm_totalbudget").getValue();

    var settlementCost = formContext.getAttribute("ccrm_01settlementsum").getValue();
    var internalCostBusiness = formContext.getAttribute("ccrm_02internalcosttodate").getValue();
    var externalCostLegal = formContext.getAttribute("ccrm_03externalcosttodate").getValue();
    var externalCostOther = formContext.getAttribute("ccrm_50internallegalcoststodate").getValue();
    var coverageCosts = formContext.getAttribute("arup_05coveragecostsincurred").getValue();
    var otherCosts = formContext.getAttribute("arup_06to98othercostsincurred").getValue();

    if (totalBudget == null) { totalBudget = 0; }
    if (internalCostBusiness == null) { internalCostBusiness = 0; }
    if (externalCostLegal == null) { externalCostLegal = 0; }
    if (externalCostOther == null) { externalCostOther = 0; }
    if (settlementCost == null) { settlementCost = 0; }
    if (coverageCosts == null) { coverageCosts = 0; }
    if (otherCosts == null) { otherCosts = 0; }

    result = settlementCost + internalCostBusiness + externalCostLegal + externalCostOther + coverageCosts + otherCosts;
    //set total
    formContext.getAttribute("ccrm_externalcosttodate_other").setValue(result);
    formContext.getAttribute("ccrm_externalcosttodate_other").setSubmitMode("always");

    var liabilityProvision = formContext.getAttribute("ccrm_claimvalueprobable").getValue();
    var budgetAllowance02 = formContext.getAttribute("ccrm_budgetallowance02").getValue();
    var budgetAllowance03 = formContext.getAttribute("ccrm_budgetallowance03").getValue();
    var budgetAllowance50 = formContext.getAttribute("ccrm_budgetallowance50").getValue();
    var coverageProCosts = formContext.getAttribute("arup_05coveragecostsprovisions").getValue();
    var otherProCosts = formContext.getAttribute("arup_06to98othercostsprovisions").getValue();

    // set 01
    if (liabilityProvision == null || liabilityProvision == 0) {
        formContext.getAttribute("arup_01settlementremainingcosts").setValue(0);
    } else {
        formContext.getAttribute("arup_01settlementremainingcosts").setValue(liabilityProvision - settlementCost);
    }

    //set 02
    if (budgetAllowance02 == null || budgetAllowance02 == 0) {
        formContext.getAttribute("arup_02internalbusinessremainingcosts").setValue(0);
    } else {
        formContext.getAttribute("arup_02internalbusinessremainingcosts").setValue(budgetAllowance02 - internalCostBusiness);
    }

    //set 03	
    if (budgetAllowance03 == null || budgetAllowance03 == 0) {
        formContext.getAttribute("arup_03externallegalremainingcosts").setValue(0);
    } else {
        formContext.getAttribute("arup_03externallegalremainingcosts").setValue(budgetAllowance03 - externalCostLegal);
    }

    //set 04
    if (budgetAllowance50 == null || budgetAllowance50 == 0) {
        formContext.getAttribute("arup_04internalrecoverableremainingcosts").setValue(0);
    } else {
        formContext.getAttribute("arup_04internalrecoverableremainingcosts").setValue(budgetAllowance50 - externalCostOther);
    }

    //set 05
    if (coverageProCosts == null || coverageProCosts == 0) {
        formContext.getAttribute("arup_05coverageremainingcosts").setValue(0);
    } else {
        formContext.getAttribute("arup_05coverageremainingcosts").setValue(coverageProCosts - coverageCosts);
    }

    //set 06
    if (otherProCosts == null || otherProCosts == 0) {
        formContext.getAttribute("arup_06to98otherremainingcosts").setValue(0);
    } else {
        formContext.getAttribute("arup_06to98otherremainingcosts").setValue(otherProCosts - otherCosts);
    }

    //set budget remaining 
    formContext.getAttribute("ccrm_totalforecast").setValue(totalBudget - result);
    formContext.getAttribute("ccrm_totalforecast").setSubmitMode("always");
    formContext.getAttribute("arup_01settlementremainingcosts").setSubmitMode("always");
    formContext.getAttribute("arup_02internalbusinessremainingcosts").setSubmitMode("always");
    formContext.getAttribute("arup_03externallegalremainingcosts").setSubmitMode("always");
    formContext.getAttribute("arup_04internalrecoverableremainingcosts").setSubmitMode("always");
    formContext.getAttribute("arup_05coverageremainingcosts").setSubmitMode("always");
    formContext.getAttribute("arup_06to98otherremainingcosts").setSubmitMode("always");
}

function assignedToSync(formContext) {

    //do not re-assign the owner for the newly created records. it will be done in the workflow
    if (formContext.ui.getFormType() == 1) { return };

    var assignedUserId = formContext.getAttribute("ccrm_assignedtosync_userid").getValue();
    if (assignedUserId != null && assignedUserId != formContext.getAttribute("ownerid").getValue()) {
        formContext.getAttribute("ownerid").setValue(assignedUserId);
    }
}

function setAssignedToSyncFromConverted(formContext) {
    var ownerId = formContext.getAttribute("ownerid").getValue();
    var assignedToSyncUserId = formContext.getAttribute("ccrm_assignedtosync_userid").getValue();
    if (assignedToSyncUserId == null && assignedToSyncUserId != formContext.getAttribute("ccrm_assignedtosync_userid").getValue()) {
        formContext.getAttribute("ccrm_assignedtosync_userid").setValue(ownerId);
        //force save
        formContext.data.entity.save();
    }
}

function fnSharePoint(formContext) {

    //show sharepoint tab when url is defined
    var sharepointUrl = formContext.getAttribute("ccrm_sys_sharepoint_url").getValue();
    if (sharepointUrl != null) {
        //show tab
        formContext.ui.tabs.get("tab_Documents").setVisible(true);
        formContext.getControl("IFRAME_SharePointURL").setSrc(sharepointUrl);
    }
    else {
        //hide tab
        formContext.ui.tabs.get("tab_Documents").setVisible(false);
    }
}

function confidentialFlag(formContext) {
    var confidentialFlag = formContext.getAttribute("ccrm_confidential").getValue();
    if (confidentialFlag == true) {
        formContext.getControl("ccrm_confidential").setDisabled(true);
        formContext.getControl("ccrm_assignedtosync_userid1").setDisabled(true);
        formContext.getControl("ccrm_assignedtosync_userid").setDisabled(true);
    }
}

function OpenDocumentStore(formContext) {

    var sharepointUrl = formContext.getAttribute("ccrm_sys_sharepoint_url").getValue();

    if (sharepointUrl) {
        window.open(sharepointUrl, '_blank');
    } else {
        alert("Document store not set! Please contact the CRM Support");
    }

}
////////////
// End General Functions
///////////