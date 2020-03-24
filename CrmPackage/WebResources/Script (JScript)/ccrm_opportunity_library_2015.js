//<reference path="../Intellisense/Xrm.Page.2013.js"/>
//<reference path="../Library/SDK.REST.js"/>
//latest version
var ArupBusinessSaved;
var OpportunityType = {
	'Simple': 100000000,
	'Full': 100000001
};
var BidRiskLevels = {
	'Level1': 200004,
	'Level2': 200002,
	'Level3': 200003
};
var isCrmForMobile = (Xrm.Page.context.client.getClient() == "Mobile");
var OPPORTUNITY_STATE = {
	OPEN: 0,
	WON: 1,
	LOST: 2
};
var ArupStages = {
	'Lead': "1feea0ee-6ee4-491d-a8ac-0726e8db2d6b", // [RS-08/05/2017] - No need to change the name here to Pre-Bid as this variable is referred internally
	'CrossRegion': "03b9eb80-d1c8-468c-bf2d-da371067cfb4",
	'BidDevelopment': "011abd87-e117-4bb7-a796-b99a349d5ac3",
	'BidReviewApproval': "8a756906-b291-7e20-b70e-d773cc144da2",
	'BidSubmitted': "9e340cde-0a19-1de6-e360-b5a450a092c7",
	"ConfirmJob": "8e975d43-147e-7c19-c944-08a864d69dbe",
	"ConfirmJobApproval": "212288de-0746-cc9c-9d63-8d8b5597a2c4",
	"ConfirmJobApproval1": "3a4ddcd8-db68-8a8e-9326-cc99ee914ab6",
	"ConfirmJobApproval2": "5a418793-a782-7164-6b52-386381d51cca",
	"ConfirmJobApproval3": "b069abdc-b859-7807-43b7-0aa45d255424",
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
	'UKMEA': 'UKMEA Region',
	'Malaysia': 'Malaysia Region'
};
var stageFilter = [ArupStages.Lead, ArupStages.CrossRegion, ArupStages.BidDevelopment, ArupStages.BidSubmitted, ArupStages.ConfirmJob];
var oldBidReviewChair;
var moveToNextTrigger = false;
var moveToNextTrigger_PJN = false; //Only used When User has requested Possible Job and Bid is Cross Region
var currUserData;
var acctCentreInvalid;
var currentStage;
var DirtyFields = {};
if (typeof (FORM_TYPE) === "undefined") FORM_TYPE = {
	CREATE: 1,
	UPDATE: 2,
	QUICK_CREATE: 5,
	BULK_EDIT: 6
};
if (typeof (PI_REQUIREMENT) === "undefined") PI_REQUIREMENT = {
	MIN_COVER: 1
};
// runs on Exit button

function exitForm()
{
	//see if the form is dirty
	var ismodified = Xrm.Page.data.entity.getIsDirty();
	if (ismodified == false)n
	{
		Xrm.Page.ui.close();
		return;
	}
	if (ismodified == true && Xrm.Page.getAttribute("statecode").getValue() != 0)
	{
		//get list of dirty fields
		var oppAttributes = Xrm.Page.data.entity.attributes.get();
		if (oppAttributes != null)
		{
			for (var i in oppAttributes)
			{
				if (oppAttributes[i].getIsDirty())
				{
					Xrm.Page.getAttribute(oppAttributes[i].getName()).setSubmitMode("never");
				}
			}
			setTimeout(function ()
			{
				Xrm.Page.ui.close();
			}, 1000);
		}
		return;
	}
	Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
		'<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit the opportunity.</br>Click "Exit Only" button to exit the opportunity without saving.</font>', [
	{
		label: "<b>Save and Exit</b>",
		callback: function ()
		{
			var oppAttributes = Xrm.Page.data.entity.attributes.get();
			var highlight = true;
			var cansave = true;
			if (oppAttributes != null)
			{
				for (var i in oppAttributes)
				{
					if (oppAttributes[i].getRequiredLevel() == 'required')
					{
						highlight = Xrm.Page.getAttribute(oppAttributes[i].getName()).getValue() != null;
						if (highlight == false && cansave == true)
						{
							cansave = false;
						}
						highlightField(null, '#' + oppAttributes[i].getName(), highlight);
					}
				}
			}
			if (cansave)
			{
				Xrm.Page.data.entity.save("saveandclose");
			}
		},
		setFocus: true,
		preventClose: false},
	{
		label: "<b>Exit Only</b>",
		callback: function ()
		{
			//get list of dirty fields
			var oppAttributes = Xrm.Page.data.entity.attributes.get();
			if (oppAttributes != null)
			{
				for (var i in oppAttributes)
				{
					if (oppAttributes[i].getIsDirty())
					{
						Xrm.Page.getAttribute(oppAttributes[i].getName()).setSubmitMode("never");
					}
				}
				setTimeout(function ()
				{
					Xrm.Page.ui.close();
				}, 1000);
			}
		},
		setFocus: false,
		preventClose: false}
        ],
		'Warning', 600, 250, '', true);
}

function SetLookupField(id, name, entity, field)
{
	if (id != null)
	{
		if (id.indexOf('{') == -1) id = '{' + id;
		if (id.indexOf('}') == -1) id = id + '}';
		id = id.toUpperCase();
		var lookup = new Array();
		lookup[0] = new Object();
		lookup[0].id = id;
		lookup[0].name = name;
		lookup[0].entityType = entity;
		Xrm.Page.getAttribute(field).setValue(lookup);
	}
	else
	{
		Xrm.Page.getAttribute(field).setValue(null);
	}
}

function getStageId()
{
	if (Xrm.Page.getAttribute("stageid") != null && Xrm.Page.getAttribute("stageid") != undefined)
	{
		return Xrm.Page.getAttribute("stageid").getValue();
	}
}

function ArupApprovalType(approvalType)
{
	switch (approvalType)
	{
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

function ApprovalConfirmationMessage(approvalType)
{
	switch (approvalType)
	{
		case 'ProjectManagerApproval':
			return 'Request Confirmed Job approval is to be provided only by the nominated approver or an agreed delegate.</br></br>If you are not the listed approver or an agreed delegate, please press Do Not Approve button.';
			break;
		case 'GroupLeaderApproval':
		case 'AccCenterLeadApproval':
			var groupLeaderApprovalNeeded = checkGroupLeaderApprovalNeeded();
			if (groupLeaderApprovalNeeded == false)
			{
				return 'Confirmed Job Number approval by Accounting Centre Leader can only be completed by the nominated approver or an agreed delegate.';
			}
			else
			{
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

function errorHandler(error)
{
	Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
		'<font size="3" color="#000000"></br>' + error.message + '</font>', [
	{
		label: "<b>OK</b>",
		setFocus: true},
        ], "ERROR", 500, 350, '', true);
}
//get Region lookup - from the current user

function getCurrentUserDetails(userId)
{
	var result = new Object();
	var ausCompany = new Object();
	SDK.REST.retrieveRecord(userId, "SystemUser", 'Ccrm_ArupRegionId,ccrm_arupcompanyid,FullName,ccrm_accountingcentreid,CALType,ccrm_arupofficeid', null,

	function (retrievedreq)
	{
		if (retrievedreq != null)
		{
			result.FullName = retrievedreq.FullName;
			if (retrievedreq.Ccrm_ArupRegionId != null)
			{
				result.userRegionID = retrievedreq.Ccrm_ArupRegionId.Id;
				result.userRegionName = retrievedreq.Ccrm_ArupRegionId.Name;
				result.userOfficeID = retrievedreq.ccrm_arupofficeid.Id;
				var userCountry;
				if (result.userRegionName == 'Australasia Region' && result.userOfficeID != null)
				{
					SDK.REST.retrieveRecord(result.userOfficeID, 'Ccrm_arupoffice', 'ccrm_officecountryid', null,

					function (retrievedcountry)
					{
						userCountry = retrievedcountry.ccrm_officecountryid.Name.toUpperCase();
						if (retrievedcountry != null && userCountry == 'AUSTRALIA')
						{
							ausCompany = getAusCompanyDetails('5002');
						}
					}, errorHandler, false);
				}
			}
			if (retrievedreq.ccrm_arupcompanyid != null || userCountry == 'AUSTRALIA')
			{
				result.arupcompanyid = (userCountry == 'AUSTRALIA') ? ausCompany.companyId : retrievedreq.ccrm_arupcompanyid.Id;
				result.arupcompanyname = (userCountry == 'AUSTRALIA') ? ausCompany.CompanyName : retrievedreq.ccrm_arupcompanyid.Name;
			}
			if (retrievedreq.ccrm_accountingcentreid != null || userCountry == 'AUSTRALIA')
			{
				result.ccrm_accountingcentreid = (userCountry == 'AUSTRALIA') ? null : retrievedreq.ccrm_accountingcentreid.Id;
				result.ccrm_accountingcentrename = (userCountry == 'AUSTRALIA') ? null : retrievedreq.ccrm_accountingcentreid.Name;
			}
			if (retrievedreq.CALType != null)
			{
				result.caltype = retrievedreq.CALType.Value;
			}
		}
	}, errorHandler, false);
	return result;
}

function getAusCompanyDetails(companyCode)
{
	var companyDetails = new Object();
	var req = new XMLHttpRequest();
	req.open("GET", Xrm.Page.context.getClientUrl() + "/XRMServices/2011/OrganizationData.svc/Ccrm_arupcompanySet?$select=Ccrm_arupcompanyId,Ccrm_name&$filter=Ccrm_ArupCompanyCode eq '" + companyCode + "' and statecode/Value eq 0", false);
	req.setRequestHeader("Accept", "application/json");
	req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
	req.onreadystatechange = function ()
	{
		if (this.readyState === 4)
		{
			this.onreadystatechange = null;
			if (this.status === 200)
			{
				var returned = JSON.parse(this.responseText).d;
				var results = returned.results;
				if (results.length > 0)
				{
					companyDetails.companyId = results[0].Ccrm_arupcompanyId;
					companyDetails.CompanyName = results[0].Ccrm_name;
				}
			}
			else
			{
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return companyDetails;
}
//default the Client to 'Unassigned' record

function setDefaultClientUnassigned()
{
	SDK.REST.retrieveMultipleRecords("Account", "$select=AccountId,Name&$top=1&$filter=Name eq 'Unassigned'", function (results)
	{
		if (results.length > 0)
		{
			SetLookupField(results[0].AccountId, results[0].Name, 'account', 'customerid');
			SetLookupField(results[0].AccountId, results[0].Name, 'account', 'ccrm_client');
		}
	}, errorHandler, function ()
	{}, false);
}

function RestoreDirtyFields()
{
	/// Problem: if we update any fields on load to make the Opportunity form appear consistent, 
	/// these changes will then cause the user to be warned try to save the form when they try to leave the page,
	/// even where they are only viewing the record and have not otherwise changed it.
	/// To address this, we mark any fields that are dirty after the "onload" process so that they do nont trigger a save.
	/// Then when we actually come to save, we mark this list of fields to be saved.
	/// Also set an onchange event on each attribute so that if they are modified by the user, they cause a save.
	for (var a in DirtyFields)
	{
		if (DirtyFields.hasOwnProperty(a))
		{
			Xrm.Page.getAttribute(a).setSubmitMode(DirtyFields[a]);
		}
	};
}

function OnChangeToDirtyField(a)
{
	a.setSubmitMode("dirty");
}

function FormOnload()
{
	if (Xrm.Page.getAttribute("statecode") != null && Xrm.Page.getAttribute("statecode") != "undefined")
	{
		var state = Xrm.Page.getAttribute("statecode").getValue();
		var bpfStatus = Xrm.Page.data.process.getStatus();
		if (state == 1 && bpfStatus == 'active')
		{
			if (currentStage == ArupStages.ConfirmJobApproval || currentStage == ArupStages.ConfirmJobApproval1 || currentStage == ArupStages.ConfirmJobApproval2 || currentStage == ArupStages.ConfirmJobApproval3)
			{
				Xrm.Page.data.process.setStatus('finished');
			}
			else
			{
				Xrm.Page.data.process.setStatus('aborted');
			}
		}
		if (state == 2)
		{
			//var bpfStatus = Xrm.Page.data.process.getStatus();
			if (bpfStatus == 'active')
			{
				Xrm.Page.data.process.setStatus('aborted');
			}
		}
		if (state == 0)
		{
			//var bpfStatus = Xrm.Page.data.process.getStatus();
			if (bpfStatus != 'active')
			{
				Xrm.Page.data.process.setStatus('active');
			}
		}
	}
	currUserData = getCurrentUserDetails(Xrm.Page.context.getUserId());
	if (Xrm.Page.ui.getFormType() == 1)
	{
		if (Xrm.Page.getAttribute("customerid").getValue() == null)
		{
			setDefaultClientUnassigned();
		}
		procurement_type_onchange();
		Xrm.Page.getAttribute("ccrm_accountingcentreid").setRequiredLevel('none');
		Xrm.Page.getAttribute("ccrm_arupcompanyid").setRequiredLevel('none');
		SetLookupField(currUserData.arupcompanyid, currUserData.arupcompanyname, 'ccrm_arupcompany', 'ccrm_arupcompanyid');
		SetLookupField(Xrm.Page.context.getUserId(), Xrm.Page.context.getUserName(), 'systemuser', 'ccrm_leadoriginator');
		SetLookupField(Xrm.Page.context.getUserId(), Xrm.Page.context.getUserName(), 'systemuser', 'ccrm_businessadministrator_userid');
		Xrm.Page.getAttribute("ccrm_arupcompanyid").fireOnChange();
		SetLookupField(currUserData.ccrm_accountingcentreid, currUserData.ccrm_accountingcentrename, 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid');
		Xrm.Page.getAttribute("ccrm_accountingcentreid").fireOnChange();
		ccrm_arupbusinessid_onChange(false);
		Xrm.Page.getControl('name').setFocus();
	}
	else if (Xrm.Page.ui.getFormType() != 1)
	{
		//save Arup Business
		if (Xrm.Page.getAttribute("ccrm_arupbusinessid").getValue() != null)
		{
			ArupBusinessSaved = Xrm.Page.getAttribute("ccrm_arupbusinessid").getValue()[0].name;
		}
		//set scroll bar height
		$('#processControlScrollbar').children().height(20);
		customerid_onChange();
		ccrm_contractlimitofliability_OnChange();
		if ( !! Xrm.Page.data.process)
		{
			Xrm.Page.data.process.addOnStageSelected(StageSelected);
			Xrm.Page.data.process.addOnStageChange(StageChange_event);
		}
		feeIncomeCheck();
		projectcountry_onchange('formload'); // apply filter to state field   
		setCurrentApprovers();
		stageNotifications();
		calcFactoredNetReturnToArup();
		ccrm_arupbusinessid_onChange(false);
		ccrm_confidential_onchange(0);
		ccrm_bidreviewoutcome_onChange();
		//client
		checkHighRiskClient(Xrm.Page.getAttribute('ccrm_client').getValue() == null ? null : Xrm.Page.getAttribute('ccrm_client').getValue()[0].id, '', false, false);
		//ultimate/end client
		checkHighRiskClient(Xrm.Page.getAttribute('ccrm_ultimateendclientid').getValue() == null ? null : Xrm.Page.getAttribute('ccrm_ultimateendclientid').getValue()[0].id, 'Ultimate/End ', false, false);
		//make sure the current stage process fields are hidden/shown
		if ( !! Xrm.Page.data.process)
		{
			hideProcessFields(Xrm.Page.data.process.getSelectedStage().getName());
		}
		oldBidReviewChair = Xrm.Page.getAttribute("ccrm_bidreviewchair_userid").getValue();
		currentStage = getStageId();
		//ensure that the stage toggle flag is set to something other than 2
		Xrm.Page.getAttribute("ccrm_stagetoggle").setValue(0);
		Xrm.Page.getAttribute("ccrm_stagetoggle").setSubmitMode("always");
		Xrm.Page.getAttribute("ccrm_stagetoggle").fireOnChange();
		if (getStageId() == ArupStages.ConfirmJob)
		{ // runs when coming from CJNA form
			if (Xrm.Page.getAttribute("ccrm_jobnumberprogression").getValue() == 100009005)
			{
				Xrm.Page.getAttribute("ccrm_systemcjnarequesttrigger").setValue(0);
				moveToNextTrigger = true;
				Xrm.Page.data.save();
			}
		}
		if (getStageId() == ArupStages.BidReviewApproval)
		{
			if (Xrm.Page.getAttribute("ccrm_bidreviewchair_userid").getValue() != null && Xrm.Page.getAttribute("ccrm_currentbidreviewchair").getValue() != null)
			{
				if (Xrm.Page.getAttribute("ccrm_bidreviewchair_userid").getValue()[0].id != Xrm.Page.getAttribute("ccrm_currentbidreviewchair").getValue()[0].id)
				{
					updateBidReviewForm();
				}
			}
		}
		if (currentStage == ArupStages.ConfirmJobApproval || currentStage == ArupStages.ConfirmJobApproval1 || currentStage == ArupStages.ConfirmJobApproval2 || currentStage == ArupStages.ConfirmJobApproval3)
		{
			addEventToProjPartGrid();
		}
		//lock down Bid Costs fields if either PJN or CJN has been issued
		if (Xrm.Page.getAttribute("ccrm_pjna").getValue() != null || Xrm.Page.getAttribute("ccrm_jna").getValue() != null)
		{
			setTimeout(lockDownBidCosts(true), 2000);
		}
		else
		{
			setTimeout(lockDownBidCosts(false), 2000);
		}
	}
	//visibility of Client Details section
	//CRM 2016 Bug 34821
	//ccrm_client_onChange();
	// Ensure that when the "Related Networks & Markets" field is set to "Other" that the "Other Network Details" field is made visible and mandatory.
	setup_display_other_field("ccrm_othernetworksval", "ccrm_othernetworkdetails", "100000003");
	//setup_display_other_field("ccrm_contractarrangement", "header_process_ccrm_otherprocurementtypedetails", "7");
	//setup_display_other_field("ccrm_contractarrangement", "header_process_ccrm_agreementnumber", "2");
	//setup_display_other_field("ccrm_contractarrangement", "ccrm_otherprocurementtypedetails", "7");
	//setup_display_other_field("ccrm_contractarrangement", "ccrm_agreementnumber", "2");
	//uncommented the line below to fix the bug 64054
	setup_display_other_field("ccrm_pirequirement", "header_process_ccrm_pilevelmoney_num", function (v)
	{
		return v != 2
	}, false);
	setup_display_other_field("ccrm_pirequirement", "header_process_ccrm_pilevelmoney_num1", function (v)
	{
		return v != 2
	}, false);
	setup_display_other_field("ccrm_pirequirement", "header_process_ccrm_pilevelmoney_num2", function (v)
	{
		return v != 2
	}, false);
	// Resize certain option set fields so that they display more options when open.
	setup_optionset_size("header_process_ccrm_leadsource", 160, 220);
	setup_optionset_size("header_process_ccrm_contractarrangement", 250, 380);
	setup_optionset_size("header_process_ccrm_contractconditions", 100, 280);
	setup_optionset_size("header_process_ccrm_arups_role_in_project", 100, 200);
	setup_optionset_size("ccrm_valuebasedfeecategory", 100, 300);
	setup_optionset_size("ccrm_contractarrangement", 179, 380);
	// Make sure that BPF area has tooltips.
	//setup_bpf_tooltip("ccrm_arupuniversityiiaresearchinitiative"); //commented to fix 70014 bug
	// Set lead Source tooltips
	setup_leadsource_tooltips();
	//set Ontario Construction Act Regime Type tooltips
	//setup_ontario_tooltips('arup_constructionactapplies');
	//setup_ontario_tooltips('arup_transitionaryregime');
	// Look for the notification warning us that a new process flow has been assigned, and if we see it, suppress the BPF.
	// (For historic opportunities there is no BPF)
	var newProcessWarning = $("span.processWarningBar-Text").attr("title");
	if ( !! newProcessWarning)
	{
		Xrm.Page.ui.process.setVisible(false);
		Xrm.Page.ui.setFormNotification("This opportunity is historic does not have any business process flow associated with it", "WARNING", "HistoricOppWarning");
	}
	show_hiddenrow("ccrm_limitofliabilityagreement");
	show_hiddenrow("ccrm_limitamount_num");
	if (Xrm.Page.ui.getFormType() != 1) checkAccountingCentre();
	//if (Xrm.Page.getControl("header_process_ccrm_bidreviewchair_userid") != null)
	//    parent.document.getElementById("header_process_ccrm_bidreviewchair_userid").attributes.disableviewpicker.value = "1";
	//Added code below for D365 upgrade to update the text on BPF
	if (!isCrmForMobile)
	{
		if (parent.document.getElementById("processDuration") != null && parent.document.getElementById("processDuration") != "undefined")
		{
			var processText = parent.document.getElementById("processDuration").innerText;
			if (processText != null && processText != undefined)
			{
				if (processText.indexOf("Aborted") !== -1)
				{
					var newProcessText = processText.replace("Aborted", "Completed");
					parent.document.getElementById("processDuration").textContent = newProcessText;
				}
			}
		}
	}
    //Xrm.Page.getControl("header_process_ccrm_bidreviewoutcome").setDisabled(false);
}

function SuppressDirtyFields()
{
	/// Prevent dirty fields from causing the user to be prompted to save the form when navigating away.
	if (Xrm.Page.data.entity.getIsDirty())
	{
		Xrm.Page.data.entity.attributes.forEach(function (a, i)
		{
			if (Xrm.Page.getAttribute(i).getIsDirty())
			{
				DirtyFields[a.getName()] = a.getSubmitMode();
				a.setSubmitMode("never");
				a.addOnChange(function ()
				{
					OnChangeToDirtyField(a);
				});
			}
		});
	}
}

function addEventToProjPartGrid()
{
	var stageID = Xrm.Page.data.process.getActiveStage().getId();
	if (stageID != ArupStages.ConfirmJobApproval && stageID != ArupStages.ConfirmJobApproval1 && stageID != ArupStages.ConfirmJobApproval2 && stageID != ArupStages.ConfirmJobApproval3) return;
	// retrieve the subgrid
	var grid = Xrm.Page.getControl('Project_Participants');
	// if the subgrid still not available we try again after 2 second
	if (grid == null)
	{
		setTimeout(function ()
		{
			addEventToProjPartGrid();
		}, 2000);
		return;
	}
	// add the function to the onRefresh event
	grid.addOnLoad(setProjectParticipantFlag);
}

function OnStateChange()
{
	if (Xrm.Page.getAttribute("statecode") != null && Xrm.Page.getAttribute("statecode") != "undefined")
	{
		var state = Xrm.Page.getAttribute("statecode").getValue();
		var bpfStatus = Xrm.Page.data.process.getStatus();
		if (state == 1 && bpfStatus == 'active')
		{
			if (getStageId() == ArupStages.ConfirmJobApproval || getStageId() == ArupStages.ConfirmJobApproval1 || getStageId() == ArupStages.ConfirmJobApproval2 || getStageId() == ArupStages.ConfirmJobApproval3)
			{
				Xrm.Page.data.process.setStatus('finished');
			}
			else
			{
				Xrm.Page.data.process.setStatus('aborted');
			}
		}
		if (state == 2)
		{
			var bpfStatus = Xrm.Page.data.process.getStatus();
			if (bpfStatus == 'active')
			{
				Xrm.Page.data.process.setStatus('aborted');
			}
		}
		if (state == 0)
		{
			var bpfStatus = Xrm.Page.data.process.getStatus();
			if (bpfStatus != 'active')
			{
				Xrm.Page.data.process.setStatus('active');
			}
		}
	}
}

function setup_optionset_size(field, height, width)
{
	var control = Xrm.Page.getControl(field);
	if ( !! control)
	{
		(Xrm.Page.ui.getFormType() == FORM_TYPE.CREATE || Xrm.Page.ui.getFormType() == FORM_TYPE.UPDATE || Xrm.Page.ui.getFormType() == FORM_TYPE.QUICK_CREATE || Xrm.Page.ui.getFormType() == FORM_TYPE.BULK_EDIT) && $(document)
			.ready(function ()
		{
			window.parent.$("#" + field)
				.click(function (e)
			{
				if ( !! height)
				{
					window.parent.$("#" + field + "_i").height(height);
				}
				if ( !! width)
				{
					window.parent.$("#" + field + "_i").width(width);
				}
			});
		});
	}
	else
	{
		// If the stage containng this control is not on the form, it may become available if a different stage is selected
		if (field.startsWith("header_process"))
		{
			if ( !! Xrm.Page.data.process)
			{
				Xrm.Page.data.process.addOnStageSelected(function ()
				{
					setup_optionset_size(field, height, width);
				});
			}
		}
	}
}

function setup_bpf_tooltip(fieldName)
{
	/// <summary>By default BPF tooltips are not set correctly (from the field description) This function copies the 
	///  tooltip text fromo an existing field on the form to the BPF field.</summary>
	var tooltip = $("#" + fieldName + "_c").attr('title');
	var bpfField = $("#header_process_" + fieldName + "_c");
	if (bpfField.length > 0)
	{
		bpfField.attr('title', tooltip);
	}
	else
	{
		if ( !! Xrm.Page.data.process)
		{
			Xrm.Page.data.process.addOnStageSelected(function ()
			{
				setup_bpf_tooltip(fieldName);
			});
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

function setup_leadsource_tooltips()
{
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

function setup_leadsource_tooltips_on_control(fieldName, tooltips)
{
	var control = Xrm.Page.getControl(fieldName);
	if ( !! control)
	{
		(Xrm.Page.ui.getFormType() == FORM_TYPE.CREATE || Xrm.Page.ui.getFormType() == FORM_TYPE.UPDATE || Xrm.Page.ui.getFormType() == FORM_TYPE.QUICK_CREATE || Xrm.Page.ui.getFormType() == FORM_TYPE.BULK_EDIT) && $(document)
			.ready(function ()
		{
			window.parent.$("#" + fieldName)
				.click(function (e)
			{
				for (var tooltip in tooltips)
				{
					var tooltipElement = window.parent.$("#" + fieldName + "_i [value='" + tooltip + "']");
					tooltipElement.attr('title', tooltips[tooltip]);
				}
			});
		});
	}
	else
	{
		if ( !! Xrm.Page.data.process)
		{
			Xrm.Page.data.process.addOnStageSelected(setup_leadsource_tooltips);
		}
	}
}

function setup_display_other_field(otherNetworksVal, otherNetworksDetail, otherCodeValue, isToBeHidden)
{
	/// <summary>Setup multi-select picklist so that when "other" is selected, a text field is activated to allow the user to enter the details.</summary>
	var isOtherFieldRequired = otherCodeValue;
	if (typeof (otherCodeValue) != "function")
	{
		isOtherFieldRequired = function (v)
		{
			return typeof (v) == "string" && v.search(otherCodeValue) > -1 || v == otherCodeValue
		};
	}
	isToBeHidden = isToBeHidden == null ? true : isToBeHidden;
	var attribute = Xrm.Page.getAttribute(otherNetworksVal);
	if ( !! attribute)
	{
		attribute.addOnChange(function ()
		{
			display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
		});
		// If this is a BPF field that we are targeting. Add an additional on Stage change callback to change the required/visible status.
		if (Xrm.Page.ui.getFormType() != FORM_TYPE.CREATE && /^header_process_/.test(otherNetworksDetail))
		{
			Xrm.Page.data.process.addOnStageSelected(function ()
			{
				display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
			});
		}
		// Do this twice as header fields get their requirement level set after the onload function runs.
		display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
		setTimeout(function ()
		{
			display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden);
		},
		1000);
	}
}

function display_other_field(otherNetworksVal, otherNetworksDetail, isOtherFieldRequired, isToBeHidden)
{
	var value = Xrm.Page.getAttribute(otherNetworksVal).getValue();
	var otherNetworkDetails = Xrm.Page.getControl(otherNetworksDetail);
	if ( !! otherNetworkDetails)
	{
		if ( !! value && isOtherFieldRequired(value))
		{
			otherNetworkDetails.getAttribute().setRequiredLevel("required");
			otherNetworkDetails.setVisible(true);
		}
		else
		{
			otherNetworkDetails.getAttribute().setRequiredLevel("none");
			if (isToBeHidden)
			{
				otherNetworkDetails.setVisible(false);
			}
		}
	}
}

function lockDownBidCosts(lockDown)
{ /* these fields should be locked down at all times for all licenses besides professional */
	lockDown = (currUserData.caltype != 0) ? true : lockDown;
	Xrm.Page.getControl("ccrm_salarycost_num").setDisabled(lockDown);
	Xrm.Page.getControl("ccrm_staffoverheadspercent").setDisabled(lockDown);
	Xrm.Page.getControl("ccrm_grossexpenses_num").setDisabled(lockDown);
	Xrm.Page.getControl("ccrm_bid_transactioncurrencyid").setDisabled(lockDown);
	if (lockDown) return;
	Xrm.Page.getAttribute('ccrm_salarycost_num').setSubmitMode('always');
	Xrm.Page.getAttribute('ccrm_staffoverheadspercent').setSubmitMode('always');
	Xrm.Page.getAttribute('ccrm_staffoverheads_num').setSubmitMode('always');
	Xrm.Page.getAttribute('ccrm_grossexpenses_num').setSubmitMode('always');
	Xrm.Page.getAttribute('ccrm_totalbidcost_num').setSubmitMode('always');
	Xrm.Page.getAttribute('ccrm_bid_transactioncurrencyid').setSubmitMode('always');
}

function GetCurrentApprover()
{
	var result;
	var select = "ccrm_CurrentApprovers";
	SDK.REST.retrieveRecord(Xrm.Page.data.entity.getId(), "Opportunity", select, null,

	function (retrievedreq)
	{
		result = retrievedreq.ccrm_CurrentApprovers;
	}, errorHandler, false);
	return result;
}

function GetCurrentApproversAsync(gotCurrentApproversCallback)
{
	///<summary>Asynchronously Fetch a list of current approvers</summary>
	/// <param name="gotCurrentApproversCallback">A callback function to be invoked with a string containing the current approvers.</param>
	var result;
	var select = "ccrm_CurrentApprovers";
	SDK.REST.retrieveRecord(Xrm.Page.data.entity.getId(), "Opportunity", select, null,

	function (retrievedreq)
	{
		gotCurrentApproversCallback(retrievedreq.ccrm_CurrentApprovers);
	}, errorHandler);
}

function SetCurrentApproverNotification(currentApproverData)
{
	if (currentApproverData)
	{
		var strStage = currentApproverData;
		strStage = strStage.substring(0, strStage.indexOf("-"));
		var strApprovers = currentApproverData;
		strApprovers = strApprovers.substring(strApprovers.indexOf("-") + 1, strApprovers.Length);
		strApprovers = strApprovers.trim();
		var aryApprovers = strApprovers.split(",");
		aryApprovers = aryApprovers.filter(function isNotempty(value)
		{
			return value != null && value.trim() != "";
		});
		aryApprovers = aryApprovers.sort();
		currUserData.Approvers = aryApprovers;
		if (strStage.indexOf('with') < 0) strStage += 'with ';
		if (aryApprovers.length > 0) Xrm.Page.ui.setFormNotification(strStage + '"' + aryApprovers.join('" or "') + '"',
			'INFO',
			'CurrentApprovers');
		else Xrm.Page.ui.setFormNotification("No Approver present for the current Approval",
			'INFO',
			'CurrentApprovers');
	}
}

function SetCurrentStatusFromServer()
{
	///<summary>Get current statuscode value from server and set it on the current form. (Asynchronous)</summary>
	GetFieldAsync("StatusCode",

	function (value)
	{
		var status = Xrm.Page.getAttribute("statuscode");
		if ( !! status && !! value)
		{
			status.setValue(value.Value);
			// This doesn't actually work in CRM 2015 to set the value displayed in the header field. So set with Jquery below
			status.setSubmitMode("never");
			$("#footer_statuscode1  span").text(status.getText());
		}
	});
}
var currentApproversAsyncCallback = null;

function setCurrentApproversAsync(delayInterval, totalElapsedTime, maxDelay, maxElapsedTime)
{
	/// <summary>Asynchronously set the current approvers notification. The initial delay interval will ramp up till "maxDelay" is reached.
	/// The async process will run until it either gets a new "Approvers" value, or "totalElapsedTime" has passed and it gives up.</summary>
	/// <param name="delayInterval">If the current approvers value is not set, wait this long before retrying. If null then a default delay intervaly will be used.</param>
	/// <param name="totalElapsedTime">Time that has passed so far since starting to set the approvers.</param>
	/// <param name="maxDelay">Longest interval that we will wait for.</param>
	/// <param name="maxElapsedTime">Maximum total time to wait before giving up.</param>
	cancelAsnycApprovalNotification();
	currentApproversAsyncCallback = pollForChangeAsync("ccrm_CurrentApprovers",

	function isComplete(approvers)
	{
		return !!approvers;
	},

	function onComplete(approvers)
	{
		SetCurrentApproverNotification(approvers);
		SetCurrentStatusFromServer();
	});
}

function cancelAsnycApprovalNotification()
{
	if ( !! currentApproversAsyncCallback && !! currentApproversAsyncCallback.timeout)
	{
		clearTimeout(currentApproversAsyncCallback.timeout);
		currentApproversAsyncCallback.timeout = null;
	}
}

function pollForChangeAsync(fieldname, isComplete, onComplete, delayInterval, totalElapsedTime, maxDelay, maxElapsedTime)
{
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
	var pollingAsyncCallback = {
		timeout: null
	};
	if (!delayInterval) delayInterval = 1000;
	if (!totalElapsedTime) totalElapsedTime = 0;
	if (!maxDelay) maxDelay = 5000;
	if (!maxElapsedTime) maxElapsedTime = 90000; // stop after 90s
	//console.log("Polling for " + fieldname + " - Delay Interval = " + delayInterval + "; totalElapsedTime = " + totalElapsedTime);
	GetFieldAsync(
	fieldname,

	function (fieldValue)
	{
		if (isComplete(fieldValue))
		{
			onComplete(fieldValue);
			pollingAsyncCallback.timeout = null;
		}
		else
		{
			if (totalElapsedTime < maxElapsedTime)
			{
				if ( !! pollingAsyncCallback.timeout)
				{
					clearTimeout(pollingAsyncCallback.timeout);
					pollingAsyncCallback.timeout = null;
				}
				pollingAsyncCallback.timeout = setTimeout(function ()
				{
					pollForChangeAsync(fieldname,
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
	});
	return pollingAsyncCallback;
}

function GetFieldAsync(fieldname, gotFieldCallback)
{
	///<summary>Asynchronously Fetch a list of current approvers</summary>
	/// <param name="gotCurrentApproversCallback">A callback function to be invoked with a string containing the current approvers.</param>
	var result;
	var select = fieldname;
	SDK.REST.retrieveRecord(Xrm.Page.data.entity.getId(), "Opportunity", select, null,

	function (retrievedreq)
	{
		gotFieldCallback(retrievedreq[fieldname]);
	}, errorHandler);
}

function setCurrentApprovers()
{
	Xrm.Page.ui.clearFormNotification('CurrentApprovers');
	var state = Xrm.Page.getAttribute("statecode").getValue();
	if (state == 0)
	{
		var regionName = "";
		if (Xrm.Page.getAttribute("ccrm_arupregionid").getValue() != null) regionName = Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name;
		var stageid = getStageId();
		if (stageid != ArupStages.Lead && stageid != ArupStages.CrossRegion && stageid != ArupStages.BidDevelopment && !(stageid == ArupStages.BidReviewApproval && regionName != "Australasia Region" && regionName != "Malaysia Region") && stageid != ArupStages.BidSubmitted)
		{
			var currentApproverData = GetCurrentApprover();
			if (currentApproverData)
			{
				SetCurrentApproverNotification(currentApproverData);
			}
			else
			{
				setCurrentApproversAsync();
			}
		}
	}
}

function setLookupFiltering()
{
	//bid director
	Xrm.Page.getControl("ccrm_biddirector_userid").addPreSearch(function ()
	{
		UpdateRegionalLookup("ccrm_biddirector_userid", "ccrm_regionaccreditedprojectbiddtrname", false);
	});
	//bid manager
	Xrm.Page.getControl("ccrm_bidmanager_userid").addPreSearch(function ()
	{
		UpdateRegionalLookup("ccrm_bidmanager_userid", "ccrm_regionaccreditedprojectbidmanagername", false);
	});
	//project mgr
	Xrm.Page.getControl("ccrm_projectmanager_userid").addPreSearch(function ()
	{
		UpdateRegionalLookup("ccrm_projectmanager_userid", "ccrm_regionaccreditedprojectbidmanagername", false);
	});
	//project director
	Xrm.Page.getControl("ccrm_projectdirector_userid").addPreSearch(function ()
	{
		UpdateRegionalLookup("ccrm_projectdirector_userid", "ccrm_regionaccreditedprojectbiddtrname", false);
	});
	if (Xrm.Page.getControl("header_process_ccrm_biddirector_userid") != null) Xrm.Page.getControl("header_process_ccrm_biddirector_userid").addPreSearch(function ()
	{
		UpdateRegionalLookup("header_process_ccrm_biddirector_userid", "ccrm_regionaccreditedprojectbiddtrname", true);
	});
	if (Xrm.Page.getControl("header_process_ccrm_bidmanager_userid") != null) Xrm.Page.getControl("header_process_ccrm_bidmanager_userid").addPreSearch(function ()
	{
		UpdateRegionalLookup("header_process_ccrm_bidmanager_userid", "ccrm_regionaccreditedprojectbidmanagername", true);
	});
	// Developed bid stage
	if (Xrm.Page.getControl("header_process_ccrm_projectdirector_userid") != null) Xrm.Page.getControl("header_process_ccrm_projectdirector_userid").addPreSearch(function ()
	{
		UpdateRegionalLookup("header_process_ccrm_projectdirector_userid", "ccrm_regionaccreditedprojectbiddtrname", true);
	});
	if (Xrm.Page.getControl("header_process_ccrm_projectmanager_userid") != null) Xrm.Page.getControl("header_process_ccrm_projectmanager_userid").addPreSearch(function ()
	{
		UpdateRegionalLookup("header_process_ccrm_projectmanager_userid", "ccrm_regionaccreditedprojectbidmanagername", true);
	});
	if (Xrm.Page.getControl("header_process_ccrm_bidreviewchair_userid") != null)
	{
		filterBPFUserLookup("header_process_ccrm_bidreviewchair_userid");
	}
	//bid review approval stage
	if (Xrm.Page.getControl("header_process_ccrm_bidreviewchair_userid1") != null)
	{
		filterBPFUserLookup("header_process_ccrm_bidreviewchair_userid1");
	}
	// confmed job stage
	if (Xrm.Page.getControl("header_process_ccrm_projectdirector_userid1") != null) Xrm.Page.getControl("header_process_ccrm_projectdirector_userid1").addPreSearch(function ()
	{
		UpdateRegionalLookup("header_process_ccrm_projectdirector_userid1", "ccrm_regionaccreditedprojectbiddtrname", true);
	});
	if (Xrm.Page.getControl("header_process_ccrm_projectmanager_userid1") != null) Xrm.Page.getControl("header_process_ccrm_projectmanager_userid1").addPreSearch(function ()
	{
		UpdateRegionalLookup("header_process_ccrm_projectmanager_userid1", "ccrm_regionaccreditedprojectbidmanagername", true);
	});
}

function UpdateRegionalLookup(lookupFieldName, filterChkFieldName, isBPFField)
{
	addUserLookupFilter("ccrm_arupregionid", lookupFieldName, filterChkFieldName);
	if (isBPFField)
	{
		filterBPFUserLookup(lookupFieldName);
	}
}
//CRM 2016 Known Issues 2.1.1

function filterBPFUserLookup(lookupFieldName)
{
    
//    console.log('Working1:' + lookupFieldName);
//    return;
//	var bpfelementname = lookupFieldName + "_i";
//	if (!isCrmForMobile && Xrm.Page.getControl(lookupFieldName) != null)
//	{
//        return;
//		//parent.document.getElementById(bpfelementname).setAttribute("disableViewPicker", "1");
//		parent.document.getElementById("bpfelementname").attributes.disableviewpicker.value = "1"
//	}
}

function getArupRegionName(opportunityFieldName)
{
	var region;
	var arupRegionName;
	if (Xrm.Page.ui.getFormType() == 1)
	{
		if (currUserData != undefined || currUserData != null) currUserData = getCurrentUserDetails(Xrm.Page.context.getUserId());
		region = currUserData.userRegionID;
		arupRegionName = currUserData.userRegionName;
	}
	else
	{
		region = Xrm.Page.getAttribute(opportunityFieldName).getValue();
		if (region != null) arupRegionName = region[0].name;
	}
	return [region, arupRegionName];
}

function addUserLookupFilter(opportunityFieldName, lookupFieldName, filterChkFieldName)
{
	var arupRegionData = getArupRegionName(opportunityFieldName);
	var region;
	var arupRegionName;
	if (arupRegionData[0] != null)
	{
		region = arupRegionData[0];
		arupRegionName = arupRegionData[1];
	}
	var acclevel = "";
	var accLevValue = "";
	var accLevType = "";
	var accLevField = "";
	if (lookupFieldName.indexOf("projectmanager") != -1)
	{
		accLevType = "PM";
	}
	if (lookupFieldName.indexOf("projectdirector") != -1)
	{
		accLevType = "PD";
	}
	if (arupRegionName != null && arupRegionName.toLowerCase() == (ArupRegionName.EastAsia).toLowerCase() && accLevType != "")
	{
		switch (accLevType)
		{
			case "PM":
				accLevField = "arup_eapmaccrlev"
				break;
			case "PD":
				accLevField = "arup_eapdaccrlev"
		}
		acclevel = EAAccreditaionLevRequired();
	}
	if (acclevel != "")
	{
		switch (acclevel)
		{
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
	var accLevFilter = "";
	if (accLevValue != "") //Filter based on the acc level
	{
		//Find if any users are present with the accreditations...
		var regQuery = "";
		var accLevQuery = "";
		var QueryRegionField = "";
		var queryLevField = "";
		if (accLevType == "PM")
		{
			QueryRegionField = "ccrm_RegionAccreditedProjectBidManagerName";
			queryLevField = "arup_EAPMAccrLev/Value";
		}
		else if (accLevType == "PD")
		{
			QueryRegionField = "ccrm_RegionAccreditedProjectBidDtrName";
			queryLevField = "arup_EAPDAccrLev/Value";
		}
		regQuery = " and substringof('" + arupRegionName + "'," + QueryRegionField + ")";
		if (accLevValue == 770000002) //Level 3 filter
		{
			accLevQuery = " and " + queryLevField + " eq 770000002";
		}
		else
		{
			accLevQuery = " and (" + queryLevField + " eq " + accLevValue.toString() + " or " + queryLevField + " eq 770000002)";
		}
		var filter = "$select=SystemUserId&$filter=not endswith(InternalEMailAddress,'%arup.com') and AccessMode/Value ne 3 and arup_EmploymentStatus/Value eq 770000000" + regQuery + accLevQuery;
		SDK.REST.retrieveMultipleRecords("SystemUser", filter,

		function (results)
		{
			if (results.length > 0)
			{
				if (accLevValue == 770000000 || accLevValue == 770000001) //If lev 1 or lev 2 include lev 3 users as well
				{
					accLevFilter = "<condition attribute='" + accLevField + "' operator='in'><value>" + accLevValue + "</value><value>770000002</value></condition>";
				}
				else
				{
					accLevFilter = "<condition attribute='" + accLevField + "' operator='eq' value='" + accLevValue + "' />";
				}
			}
			else
			{
				return null;
			};
		},
		errorHandler,

		function ()
		{},
		false);
	}
	if (region != null)
	{
		var viewId = "{00000000-0000-0000-0000-000000000001}";
		var viewName = "Users Lookup View";
		var viewFetchXml; //Changes as part of UKMEA to UKIMEA
		if (arupRegionName.match(/UK/gi))
		{
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
				"<condition attribute='internalemailaddress' operator='like' value='%arup.com%'/>" + accLevFilter +
				"<condition attribute='" + filterChkFieldName +
				"' value='%UK%' operator='like'/>" +
				"</filter>" +
				"</entity>" +
				"</fetch>";
		}
		else
		{
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
				"<condition attribute='internalemailaddress' operator='like' value='%@arup.com%'/>" + accLevFilter +
				"<condition attribute='" + filterChkFieldName +
				"' value='%" + arupRegionName +
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
		Xrm.Page.getControl(lookupFieldName).addCustomView(viewId, "systemuser", viewName, viewFetchXml, layoutXml, true);
	}
}

function EAAccreditaionLevRequired()
{
	var qualLevs = "";
	var procType = Xrm.Page.getAttribute("ccrm_contractarrangement").getValue();
	var disciplines = Xrm.Page.getAttribute("ccrm_disciplinesname").getValue();
	var feeIncomeValue = Xrm.Page.getAttribute("estimatedvalue_base").getValue();
	var projCurr = Xrm.Page.getAttribute("ccrm_project_transactioncurrencyid").getValue();
	if (projCurr != null)
	{
		var projCurrName = projCurr[0].name;
		//if(projCurrName != "Hong Kong Dollar")
		var discLen = 0;
		if (disciplines != null)
		{
			var discArray = disciplines.split(',');
			discLen = discArray.length;
		}
		var ftr = "$select=ExchangeRate&$filter=ISOCurrencyCode eq 'HKD'";
		SDK.REST.retrieveMultipleRecords("TransactionCurrency", ftr,

		function (results)
		{
			if (results.length > 0)
			{
				var exRt = results[0].ExchangeRate;
				feeIncomeValue = feeIncomeValue * exRt;
			}
			else
			{
				return null;
			};
		}, errorHandler,

		function ()
		{},
		false);
		if ((procType == 1 || procType == 100000002) && feeIncomeValue >= 25000000 && discLen >= 3)
		{
			qualLevs = "Level 3";
		}
		else if ((procType != 1 || procType != 100000002) && feeIncomeValue >= 25000000 && discLen >= 3)
		{
			qualLevs = "Level 2";
		}
		else if ((procType == 1 || procType == 100000002)) //&& feeIncomeValue < 25000000)
		{
			qualLevs = "Level 1";
		}
	}
	return qualLevs;
}

function FormOnSave(args)
{
	var preventSave = false;
	var errormessage;
	if (Xrm.Page.getAttribute("ccrm_arupregionid").getValue() == null)
	{
		preventSave = true;
		errormessage = 'Arup Region is not determined. Please verify the Arup Group.';
	}
	else if (Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name == null)
	{
		preventSave = true;
		errormessage = 'Arup Region is not determined. Please verify the Arup Group.';
	}
	if (preventSave)
	{
		Xrm.Page.ui.setFormNotification(errormessage, 'WARNING', 'msgReg');
		setTimeout(function ()
		{
			Xrm.Page.ui.clearFormNotification("msgReg");
		}, 5000);
		args.getEventArgs().preventDefault();
		return false;
	}
	var stageID = Xrm.Page.data.process.getActiveStage().getId();
	if (stageID == ArupStages.ConfirmJobApproval || stageID == ArupStages.ConfirmJobApproval1 || stageID == ArupStages.ConfirmJobApproval2 || stageID == ArupStages.ConfirmJobApproval3)
	{
		setProjectParticipantFlag();
	}
	if (Xrm.Page.getAttribute('originatingleadid').getValue() != null)
	{
		if (Xrm.Page.getAttribute('ccrm_estimatedvalue_num').getValue() != null)
		{
			if (Xrm.Page.getAttribute('ccrm_projecttotalincome_num').getValue() == null)
			{
				calcRecalcIncome();
			}
		}
	}
	if (Xrm.Page.data.entity.getIsDirty())
	{
		Xrm.Page.getAttribute("ccrm_stagetoggle").setSubmitMode("never");
		Xrm.Page.getAttribute("ccrm_stagetoggle").setValue(2);
		Xrm.Page.getAttribute("ccrm_stagetoggle").fireOnChange();
	}
	//dirtyfieldsid('Save: ');
	if ((Xrm.Page.getAttribute("ccrm_arupbusinessid").getValue()[0].name == 'Charity & Community' && Xrm.Page.getAttribute("ccrm_estimatedvalue_num").getValue() != 0))
	{
		Xrm.Page.getAttribute("ccrm_estimatedvalue_num").setValue(0);
		Xrm.Page.getAttribute('ccrm_estimatedvalue_num').setSubmitMode('always');
		Xrm.Page.getAttribute("ccrm_estimatedvalue_num").fireOnChange();
	}
    if (moveToNextTrigger == true)
	{ // move to next stage logic
		moveToNextTrigger = false;
        setTimeout(function ()
		{
            BPFMoveNext();
            hideProcessFields(Xrm.Page.data.process.getSelectedStage().getName());
        }, 4500);
		hideProcessFields(Xrm.Page.data.process.getSelectedStage().getName());
	}
}

//calculate project participants
function setProjectParticipantFlag()
{
	var ProjectParticExist = projectParticipantExists();
	var ProjectParticApplicable = Xrm.Page.getAttribute("arup_projparticipants_reqd").getValue();
	var ProjectParticRequired = Xrm.Page.getAttribute("arup_projpartreqd").getValue();
	var setProjPartFlag = (ProjectParticExist == true) ? 770000000 : 770000001;
	if (ProjectParticApplicable == null || ProjectParticRequired == null || (ProjectParticApplicable != null && ProjectParticApplicable != ProjectParticExist) || (ProjectParticRequired != null && ProjectParticRequired != setProjPartFlag))
	{
		Xrm.Page.getAttribute("arup_projparticipants_reqd").setValue(ProjectParticExist);
		Xrm.Page.getAttribute("arup_projpartreqd").setValue(setProjPartFlag);
		Xrm.Page.getAttribute('arup_projparticipants_reqd').setSubmitMode("always");
		Xrm.Page.getAttribute('arup_projpartreqd').setSubmitMode("always");
		Xrm.Page.data.entity.save();
	}
}

//Added by Jugal on 21-3-2018 starts
function GetandSetUserinPMPDBMBD(opportunityId, fieldName)
{
	var req = new XMLHttpRequest();
	opportunityId = opportunityId.replace("{", "");
	opportunityId = opportunityId.replace("}", "");
	req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.1/opportunities(" + opportunityId + ")?$select=" + fieldName, false);
	req.setRequestHeader("OData-MaxVersion", "4.0");
	req.setRequestHeader("OData-Version", "4.0");
	req.setRequestHeader("Accept", "application/json");
	req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
	req.onreadystatechange = function ()
	{
		if (this.readyState === 4)
		{
			req.onreadystatechange = null;
			if (this.status === 200)
			{
				var results = JSON.parse(this.response);
				if (fieldName == "_ccrm_bidmanager_userid_value")
				{
					if (results._ccrm_bidmanager_userid_value != null)
					{
						Xrm.Page.getAttribute("ccrm_bidmanager_userid").setValue([
						{
							id: results._ccrm_bidmanager_userid_value,
							name: results["_ccrm_bidmanager_userid_value@OData.Community.Display.V1.FormattedValue"],
							entityType: "systemuser"}]);
					}
					else
					{
						Xrm.Page.getAttribute("ccrm_bidmanager_userid").setValue(null);
					}
				}
				else if (fieldName == "_ccrm_biddirector_userid_value")
				{
					if (results._ccrm_biddirector_userid_value != null)
					{
						Xrm.Page.getAttribute("ccrm_biddirector_userid").setValue([
						{
							id: results._ccrm_biddirector_userid_value,
							name: results["_ccrm_biddirector_userid_value@OData.Community.Display.V1.FormattedValue"],
							entityType: "systemuser"}]);
					}
					else
					{
						Xrm.Page.getAttribute("ccrm_biddirector_userid").setValue(null);
					}
				}
				else if (fieldName == "_ccrm_projectmanager_userid_value")
				{
					if (results._ccrm_projectmanager_userid_value != null)
					{
						Xrm.Page.getAttribute("ccrm_projectmanager_userid").setValue([
						{
							id: results._ccrm_projectmanager_userid_value,
							name: results["_ccrm_projectmanager_userid_value@OData.Community.Display.V1.FormattedValue"],
							entityType: "systemuser"}]);
					}
					else
					{
						Xrm.Page.getAttribute("ccrm_projectmanager_userid").setValue(null);
					}
				}
				else if (fieldName == "_ccrm_projectdirector_userid_value")
				{
					if (results._ccrm_projectdirector_userid_value != null)
					{
						Xrm.Page.getAttribute("ccrm_projectdirector_userid").setValue([
						{
							id: results._ccrm_projectdirector_userid_value,
							name: results["_ccrm_projectdirector_userid_value@OData.Community.Display.V1.FormattedValue"],
							entityType: "systemuser"}]);
					}
					else
					{
						Xrm.Page.getAttribute("ccrm_projectdirector_userid").setValue(null);
					}
				}
			}
			else
			{
				alert(this.statusText);
			}
		}
	};
	req.send();
}

//Validate Bid Manager onChange, if there is data in it
function ValidateBidManager_onChange()
{
	if (Xrm.Page.getAttribute("ccrm_bidmanager_userid") != null)
	{
		if (Xrm.Page.getAttribute("ccrm_bidmanager_userid").getValue() != null)
		{
			vrStatus = ValidateUser("ccrm_arupregionid", "ccrm_bidmanager_userid", "ccrm_regionaccreditedprojectbidmanagername");
			if (!vrStatus)
			{
				GetandSetUserinPMPDBMBD(Xrm.Page.data.entity.getId(), "_ccrm_bidmanager_userid_value");
				Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
					'<font size="3" color="#000000"></br>Bid Manager is not an accredited user. Please provide valid user.</font>', [
				{
					label: "<b>OK</b>",
					setFocus: true},
                    ],
					"WARNING", 400, 250, '', true);
				return false;
			}
		}
		else if (Xrm.Page.getAttribute("ccrm_bidmanager_userid").getValue() == null)
		{
			GetandSetUserinPMPDBMBD(Xrm.Page.data.entity.getId(), "_ccrm_bidmanager_userid_value");
		}
	}
	return true;
}

function procurement_type_onchange()
{
	var procTypeField = Xrm.Page.getControl("ccrm_contractarrangement");
	var messageField = Xrm.Page.getControl("arup_procurementmessage");
	if (Xrm.Page.ui.getFormType() != 1 || procTypeField == null || messageField == null)
	{
		return
	}
	var messageText;
	var procTypeValue = Xrm.Page.getAttribute("ccrm_contractarrangement").getValue();
	var internalValue = Xrm.Page.getAttribute("ccrm_arupinternal").getValue();
	if (internalValue == 1)
	{
		messageText = 'You are setting up an Internal opportunity.  This is for monitoring staff busyness only and you will not be able to obtain a new confirmed job number at the end of the opportunity process.';
	}
	else
	{
		switch (procTypeValue)
		{
			//case 100000003: // Traditional or Direct Appointment with Potential Future Novation
			//    messageText = 'The Arup appointment might be novated to a contractor at a future point.  Working with contractors brings a unique set of challenges; prior to any novation being agreed, procedures for your region must be followed.  Relevant parties will be notified about this opportunity.';
			//    break;
			case 1:
				// Design+Construct/Design-Build/ECI
			case 4:
				// Public Private Partnership
			case 6:
				// Turnkey
			case 100000000:
				// Alliance
			case 100000002:
				// Design-Build-Operate
			case 100000003:
				// Novation to D&C Contractor
				messageText = 'The contractor is the lead party.  Working with contractors brings a unique set of challenges that should be considered as early as possible.  Arup management will be notified about this opportunity.  Please refer to procedures for your region.';
				break;
			default:
				messageText = "Select the procurement type that best describes the project overall (not Arup's role or contract mechanism).";
				break;
		}
	}
	if (messageText == null)
	{
		return
	};
	Xrm.Page.getAttribute("arup_procurementmessage").setValue(messageText);
}
//Validate Bid Director onChange, if there is data in it

function ValidateBidDirector_onchange()
{
	if (Xrm.Page.getAttribute("ccrm_biddirector_userid") != null)
	{
		if (Xrm.Page.getAttribute("ccrm_biddirector_userid").getValue() != null)
		{
			vrStatus = ValidateUser("ccrm_arupregionid", "ccrm_biddirector_userid", "ccrm_regionaccreditedprojectbiddtrname");
			if (!vrStatus)
			{
				GetandSetUserinPMPDBMBD(Xrm.Page.data.entity.getId(), "_ccrm_biddirector_userid_value");
				Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
					'<font size="3" color="#000000"></br>Bid Director is not an accredited user. Please provide valid user.</font>', [
				{
					label: "<b>OK</b>",
					setFocus: true},
                    ],
					"WARNING", 400, 250, '', true);
				return false;
			}
		}
		else if (Xrm.Page.getAttribute("ccrm_biddirector_userid").getValue() == null)
		{
			GetandSetUserinPMPDBMBD(Xrm.Page.data.entity.getId(), "_ccrm_biddirector_userid_value");
		}
	}
	return true;
}
//Validate Project Manager on save, if there is data in it

function ValidateProjectManager_onchange()
{
	if (Xrm.Page.getAttribute("ccrm_projectmanager_userid") != null)
	{
		if (Xrm.Page.getAttribute("ccrm_projectmanager_userid").getValue() != null)
		{
			vrStatus = ValidateUser("ccrm_arupregionid", "ccrm_projectmanager_userid", "ccrm_regionaccreditedprojectbidmanagername");
			if (!vrStatus)
			{
				GetandSetUserinPMPDBMBD(Xrm.Page.data.entity.getId(), "_ccrm_projectmanager_userid_value");
				Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
					'<font size="3" color="#000000"></br>Project Manager is not an accredited user. Please provide valid user.</font>', [
				{
					label: "<b>OK</b>",
					setFocus: true},
                    ],
					"WARNING", 400, 250, '', true);
				return false;
			}
		}
		else if (Xrm.Page.getAttribute("ccrm_projectmanager_userid").getValue() == null)
		{
			GetandSetUserinPMPDBMBD(Xrm.Page.data.entity.getId(), "_ccrm_projectmanager_userid_value");
		}
	}
	return true;
}
//Validate Project Director on save, if there is data in it

function ValidateProjectDirector_onchange()
{
	if (Xrm.Page.getAttribute("ccrm_projectdirector_userid") != null)
	{
		if (Xrm.Page.getAttribute("ccrm_projectdirector_userid").getValue() != null)
		{
			vrStatus = ValidateUser("ccrm_arupregionid", "ccrm_projectdirector_userid", "ccrm_regionaccreditedprojectbiddtrname");
			if (!vrStatus)
			{
				GetandSetUserinPMPDBMBD(Xrm.Page.data.entity.getId(), "_ccrm_projectdirector_userid_value");
				Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
					'<font size="3" color="#000000"></br>Project Director is not an accredited user. Please provide valid user.</font>', [
				{
					label: "<b>OK</b>",
					setFocus: true},
                    ],
					"WARNING", 400, 250, '', true);
				return false;
			}
		}
		else if (Xrm.Page.getAttribute("ccrm_projectdirector_userid").getValue() == null)
		{
			GetandSetUserinPMPDBMBD(Xrm.Page.data.entity.getId(), "_ccrm_projectdirector_userid_value");
		}
	}
	return true;
}
//Validate the user details with the access level conditions

function ValidateUser(opportunityFieldName, lookupFieldName, filterChkFieldName)
{
	var vrStatus;
	var userId = Xrm.Page.getAttribute(lookupFieldName).getValue()[0].id;
	var arupRegionData = getArupRegionName(opportunityFieldName);
	var region;
	var arupRegionName;
	if (arupRegionData[0] != null)
	{
		region = arupRegionData[0];
		arupRegionName = arupRegionData[1];
	}
	var acclevel = "";
	var accLevValue = "";
	var accLevType = "";
	var accLevField = "";
	if (lookupFieldName.indexOf("projectmanager") != -1)
	{
		accLevType = "PM";
	}
	if (lookupFieldName.indexOf("projectdirector") != -1)
	{
		accLevType = "PD";
	}
	if (arupRegionName != null && arupRegionName.toLowerCase() == (ArupRegionName.EastAsia).toLowerCase() && accLevType != "")
	{
		switch (accLevType)
		{
			case "PM":
				accLevField = "arup_eapmaccrlev"
				break;
			case "PD":
				accLevField = "arup_eapdaccrlev"
		}
		acclevel = EAAccreditaionLevRequired();
	}
	if (acclevel != "")
	{
		switch (acclevel)
		{
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
	var accLevFilter = "";
	if (accLevValue != "") //Filter based on the acc level
	{
		//Find if any users are present with the accreditations...
		var regQuery = "";
		var accLevQuery = "";
		var QueryRegionField = "";
		var queryLevField = "";
		if (accLevType == "PM")
		{
			QueryRegionField = "ccrm_RegionAccreditedProjectBidManagerName";
			queryLevField = "arup_EAPMAccrLev/Value";
		}
		else if (accLevType == "PD")
		{
			QueryRegionField = "ccrm_RegionAccreditedProjectBidDtrName";
			queryLevField = "arup_EAPDAccrLev/Value";
		}
		regQuery = " and substringof('" + arupRegionName + "'," + QueryRegionField + ")";
		if (accLevValue == 770000002) //Level 3 filter
		{
			accLevQuery = " and " + queryLevField + " eq 770000002";
		}
		else
		{
			accLevQuery = " and (" + queryLevField + " eq " + accLevValue.toString() + " or " + queryLevField + " eq 770000002)";
		}
		var filter = "$select=SystemUserId&$filter= not endswith(InternalEMailAddress,'%arup.com') and AccessMode/Value ne 3 and arup_EmploymentStatus/Value eq 770000000" + regQuery + accLevQuery;
		SDK.REST.retrieveMultipleRecords("SystemUser", filter,

		function (results)
		{
			if (results.length > 0)
			{
				if (accLevValue == 770000000 || accLevValue == 770000001) //If lev 1 or lev 2 include lev 3 users as well
				{
					accLevFilter = "<condition attribute='" + accLevField + "' operator='in'><value>" + accLevValue + "</value><value>770000002</value></condition>";
				}
				else
				{
					accLevFilter = "<condition attribute='" + accLevField + "' operator='eq' value='" + accLevValue + "' />";
				}
			}
			else
			{
				return null;
			};
		}, errorHandler,

		function ()
		{},
		false);
	}
	if (region != null)
	{
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
			"<condition attribute='internalemailaddress' operator='like' value='%arup.com%'/>" + accLevFilter +
			"<condition attribute='" + filterChkFieldName +
			"' value='%" + arupRegionName +
			"%' operator='like'/>" +
			"</filter>" +
			"</entity>" +
			"</fetch>";
		var encodedFetchXML = encodeURIComponent(userFetchXml);
		var req = new XMLHttpRequest();
		req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.0/systemusers?fetchXml=" + encodedFetchXML, false);
		req.setRequestHeader("OData-MaxVersion", "4.0");
		req.setRequestHeader("OData-Version", "4.0");
		req.setRequestHeader("Accept", "application/json");
		req.setRequestHeader("Prefer", "odata.include-annotations=\"OData.Community.Display.V1.FormattedValue\"");
		req.onreadystatechange = function ()
		{
			if (this.readyState === 4)
			{
				req.onreadystatechange = null;
				if (this.status === 200)
				{
					var results = JSON.parse(this.response);
					if (results.value.length == 1)
					{
						vrStatus = true;
					}
					else
					{
						vrStatus = false;
					}
				}
				else
				{
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
//    oppAttributes = Xrm.Page.data.entity.attributes.get();
//    if (oppAttributes != null) {
//        for (var i in oppAttributes) {
//            if (oppAttributes[i].getIsDirty()) {
//                console.log(text + " : " + oppAttributes[i].getName());
//            }
//        }
//    }
//}

function customerid_onChange(strSave)
{
	if (Xrm.Page.ui.getFormType() == 1)
	{
		return;
	};
	//validate the selected contact. If customer == Unassigned then user is not allowed to progress on the BPF
	var fieldName = 'ccrm_validcontact';
	var warnMsg = 'A valid client needs to be set for Opportunity Progression'; //[RS-08/05/2017] - Replaced Lead in the message with Opportunity
	var warnMsgName = 'validcustomer';
	var result = false;
	var tab = Xrm.Page.ui.tabs.get("Project_Details_Tab");
	if (Xrm.Page.getAttribute("customerid").getValue() == null) SetValidField(fieldName, 0, warnMsg, warnMsgName);
	else if (Xrm.Page.getAttribute("customerid").getValue()[0].name == 'Unassigned')
	{
		if ( !! tab)
		{
			var section = tab.sections.get("tab_7_section_1");
			if ( !! section)
			{
				section.setVisible(false);
			}
		}
		if (strSave) SetValidField(fieldName, 1, warnMsg, warnMsgName);
		else SetValidField(fieldName, 0, warnMsg, warnMsgName);
		result = true;
	}
	else
	{
		if ( !! tab)
		{
			var section = tab.sections.get("tab_7_section_1");
			if ( !! section)
			{
				section.setVisible(false);
			}
		}
		SetValidField(fieldName, 1, null, warnMsgName);
		highlightField(null, '#ccrm_client', true);
	}
	return result;
}

function SetCountryOfReg(clientId)
{
	//this should not apply to closed opportunities
	if (Xrm.Page.getAttribute('statecode').getValue() != 0) return;
	Xrm.Page.getAttribute("ccrm_countryofclientregistrationid").setValue(null);
	SDK.REST.retrieveRecord(clientId, 'Account', 'ccrm_countryofcoregistrationid', null, function (retrievedreq)
	{
		if (retrievedreq.ccrm_countryofcoregistrationid.Id != null)
		{
			Xrm.Page.getAttribute("ccrm_countryofclientregistrationid").setValue([
			{
				id: retrievedreq.ccrm_countryofcoregistrationid.Id,
				name: retrievedreq.ccrm_countryofcoregistrationid.Name,
				entityType: "ccrm_country"}
            ]);
		}
	}, errorHandler, false);
}

function checkHighRiskClient(clientid, extra, popup, quickcreate)
{
    if (quickcreate || clientid == null)
	{
		return;
	}
	var messagename = extra == '' ? 'highriskclient' : 'highriskultimateclient';
	if (!quickcreate && (clientid == null || Xrm.Page.getAttribute('statecode').getValue() != 0))
	{
		Notify.remove(messagename);
		return;
	}
    SDK.REST.retrieveRecord(clientid, 'Account', 'arup_HighRiskClient,ccrm_keyaccountmanagerid', null, function (retrievedreq)
	{
		var highrisk = retrievedreq.arup_HighRiskClient == null ? false : retrievedreq.arup_HighRiskClient;
		var relationshipManager = retrievedreq.ccrm_keyaccountmanagerid == null ? 'Relationship Manager for this client.' : retrievedreq.ccrm_keyaccountmanagerid.Name + ', the Client Relationship manager.'
		if (highrisk)
		{
			if (quickcreate == false)
			{
                Notify.add("Before pursuing any opportunities with this " + extra + "client, please contact " + relationshipManager, "WARNING", messagename, null, -1, "#cc0000", " #ffffff");
            }
			if (popup)
			{
				Alert.show('<font size="6" color="#FF0000"><b>High Risk Client</b></font>',
					'<font size="3" color="#000000"></br>Before pursuing any opportunities with this ' + extra + 'client, please contact ' + relationshipManager + '</font>', [
				{
					label: "<b>OK</b>",
					setFocus: true}, ], "ERROR", 400, 250, '', true);
			}
		}
		else if (quickcreate == false)
		{
			Notify.remove(messagename);
		}
	}, errorHandler, false);
}

//Set Hidden client field
function ccrm_client_onChange(quickCreate)
{
	var clientVal = Xrm.Page.getAttribute('ccrm_client').getValue();
	Xrm.Page.getAttribute('customerid').setValue(clientVal);
	Xrm.Page.getAttribute('customerid').setSubmitMode("always");
	if (clientVal != null && clientVal.length > 0)
	{
		if (quickCreate == false)
		{
			var tab = Xrm.Page.ui.tabs.get("Project_Details_Tab");
			var visible = clientVal[0].name != 'Unassigned';
			if ( !! tab)
			{
				var section = tab.sections.get("client_details_section");
				if ( !! section)
				{
					section.setVisible(visible);
				}
			}
			SetCountryOfReg(clientVal[0].id);
		}
		customerid_onChange();
	}
	checkHighRiskClient(clientVal == null ? null : clientVal[0].id, '', true, quickCreate);
}

function ccrm_ultimateclient_onchange(quickCreate)
{
	var clientVal = Xrm.Page.getAttribute('ccrm_ultimateendclientid').getValue();
	checkHighRiskClient(clientVal == null ? null : clientVal[0].id, 'Ultimate/End ', true, quickCreate);
}

function ccrm_arupbusinessid_onChange(valueChanged)
{
	var businessid = Xrm.Page.getAttribute('ccrm_arupbusinessid').getValue();
	resetSubBusiness(valueChanged, businessid);
	if (businessid != null && businessid.length > 0)
	{
		var business = businessid[0].name;
		addEnergy_ProjectSector(business);
	}
	if (Xrm.Page.ui.getFormType() == 1) return;
	var currentStage = getStageId();
	if (currentStage == ArupStages.Lead) return;
	var chargingBasis = Xrm.Page.getAttribute('ccrm_chargingbasis').getValue();
	if (business == null)
	{
		highlightField('#header_process_ccrm_chargingbasis', '#ccrm_chargingbasis', true);
		Xrm.Page.getAttribute("ccrm_chargingbasis").setRequiredLevel('none');
	}
	else if (business != null && business == 'Charity & Community' && Xrm.Page.getAttribute("ccrm_chargingbasis").getRequiredLevel() == 'required')
	{
		highlightField('#header_process_ccrm_chargingbasis', '#ccrm_chargingbasis', true);
		Xrm.Page.getAttribute("ccrm_chargingbasis").setRequiredLevel('none');
	}
	else if (business != null && business != 'Charity & Community' && currentStage == ArupStages.BidReviewApproval)
	{
		//currentStage != ArupStages.CrossRegion) {
		highlightField('#header_process_ccrm_chargingbasis', '#ccrm_chargingbasis', (chargingBasis != null) ? true : false);
		Xrm.Page.getAttribute("ccrm_chargingbasis").setRequiredLevel('required');
	}
}

function addEnergy_ProjectSector(currentBusinessValue)
{
	var projectSectorCode = Xrm.Page.getAttribute('ccrm_projectsectorvalue').getValue();
	var projectSectorValue = Xrm.Page.getAttribute('ccrm_projectsectorname').getValue();
	//check if project sector already has Energy option in it or value of Arup Business hasn't changed
	if (ArupBusinessSaved == currentBusinessValue)
	{
		return;
	}
	//check to see if Arup Business used to be Energy and Project Sector has the Energy Project Sector option selected, then it needs to be removed
	if (ArupBusinessSaved == 'Energy' && projectSectorCode != null && projectSectorCode.indexOf('13') != -1)
	{
		//first remove the value
		projectSectorCode = projectSectorCode.split(',');
		projectSectorValue = projectSectorValue.split(', ');
		var entryNum = projectSectorCode.indexOf('13');
		var value = removeFromList(Xrm.Page.getAttribute('ccrm_projectsectorvalue').getValue(), '13', ',');
		Xrm.Page.getAttribute('ccrm_projectsectorvalue').setValue(value);
		value = removeFromList(Xrm.Page.getAttribute('ccrm_projectsectorname').getValue(), 'Energy Project Sector', ', ')
		Xrm.Page.getAttribute("ccrm_projectsectorname").setValue(value);
	}
	//check to see if Arup Business has been changed to Energy and Project Sector doesn't have the Energy Project Sector option selected already
	else if (currentBusinessValue == 'Energy' && (projectSectorCode == null || projectSectorCode.indexOf('13') == -1))
	{
		//check to see if multi-select is empty. In this case just push the values into *name & *code fields
		if (projectSectorCode == null)
		{
			Xrm.Page.getAttribute('ccrm_projectsectorvalue').setValue('13');
			Xrm.Page.getAttribute('ccrm_projectsectorname').setValue('Energy Project Sector');
		}
		else
		{
			//need to add to the existing values
			Xrm.Page.getAttribute('ccrm_projectsectorvalue').setValue(projectSectorCode + ',13');
			Xrm.Page.getAttribute('ccrm_projectsectorname').setValue(Xrm.Page.getAttribute('ccrm_projectsectorname').getValue() + ', Energy Project Sector');
		}
	}
	if (Xrm.Page.ui.getFormType() != 1)
	{
		Xrm.Page.getControl('header_process_ccrm_projectsectorname').getAttribute().setValue(Xrm.Page.getAttribute('ccrm_projectsectorname').getValue());
	}
	Xrm.Page.getAttribute('ccrm_projectsectorvalue').setSubmitMode("always");
	Xrm.Page.getAttribute('ccrm_projectsectorname').setSubmitMode("always");
	if (Xrm.Page.getAttribute("ccrm_arupbusinessid").getValue != null) ArupBusinessSaved = Xrm.Page.getAttribute("ccrm_arupbusinessid").getValue()[0].name;
}

function removeFromList(list, value, separator)
{
	separator = separator || ",";
	var values = list.split(separator);
	for (var i = 0; i < values.length; i++)
	{
		if (values[i] == value)
		{
			values.splice(i, 1);
			return values.join(separator);
		}
	}
	return list;
}
// Set Valid Opp Track Code --  Starts

function ccrm_opportunitytype_onchange()
{
	//refresh ribbon when track is small oppo
	//alert(Xrm.Page.getAttribute("ccrm_opportunitytype").getValue() );
	Xrm.Page.ui.refreshRibbon();
	oppoType();
	//add extra validation for Lead Progression 
	if (Xrm.Page.getAttribute("ccrm_opportunitytype").getValue() == '200000')
	{
		//set the isValid flag to false        
		SetValidField('ccrm_validopportunitytrack', 0, 'Opportunity Track needs to be set for Opportunity Progression', 'opportunitytrack');
		//[RS-08/05/2017] - changed the message above to say Opportunity instead of Lead
	}
	else
	{
		//set the isValid flag to true 
		SetValidField('ccrm_validopportunitytrack', 1, null, 'opportunitytrack');
	}
	if (Xrm.Page.getAttribute("ccrm_possiblejobnumberrequired").getValue() == 1)
	{
		var strStage = Xrm.Page.data.process.getActiveStage();
		//alert(strStage.getName());
		if (strStage.getName() == "PJN APPROVAL")
		{
			onStageChange();
			hideProcessFields(Xrm.Page.data.process.getSelectedStage().getName());
			setTimeout(function ()
			{
				Xrm.Utility.openEntityForm(Xrm.Page.data.entity.getEntityName(), Xrm.Page.data.entity.getId());
			}, 200);
			Xrm.Page.ui.setFormNotification("Risk Level changed on bid. System is reseting the PJN Approval.", "WARNING", "PJNRiskChsnge");
			//Xrm.Page.getAttribute("ccrm_groupleaderapprovaloptions").setValue();
			//Xrm.Page.getAttribute('ccrm_groupleaderapprovaloptions').setSubmitMode('always');
			//Xrm.Page.getAttribute("ccrm_biddirectorapprovaloptions").setValue();
			//Xrm.Page.getAttribute('ccrm_biddirectorapprovaloptions').setSubmitMode('always');
			//Xrm.Page.getAttribute("ccrm_regionalpracticeleaderapprovaloptions").setValue();
			//Xrm.Page.getAttribute('ccrm_regionalpracticeleaderapprovaloptions').setSubmitMode('always');
			//Xrm.Page.getAttribute("ccrm_practiceleaderapprovaloptions").setValue();
			//Xrm.Page.getAttribute('ccrm_practiceleaderapprovaloptions').setSubmitMode('always');
			//setTimeout(function () { BPFMoveNext(); hideProcessFields(Xrm.Page.data.process.getSelectedStage().getName()); }, 300);
			//alert(strStage.getName());
		}
	}
}

function refreshPage()
{
	setTimeout(function ()
	{
		Xrm.Utility.openEntityForm(Xrm.Page.data.entity.getEntityName(), Xrm.Page.data.entity.getId());
	}, 10);
}

function oppoType()
{
	//200001 = Small Opportunity - small oppo
	if (Xrm.Page.getAttribute("ccrm_pjn_opportunitytype").getValue() == OpportunityType.Simple)
	{
		//collaspe bid tab
		Xrm.Page.ui.tabs.get("tab_Bid").setDisplayState("collapsed");
		Xrm.Page.getControl("ccrm_closeprobability_synced").setDisabled(true);
	}
}
// Set Valid Opp Track Code --  ends
// Set Valid Acc Center Code --  Starts 

function ccrm_accountingcentreid_onchange()
{
	validateAccCenter(true);
}

function validateAccCenter(checkOHRate)
{
	var acctCenterId = Xrm.Page.getAttribute('ccrm_accountingcentreid').getValue();
	if (Xrm.Page.ui.getFormType() != 1)
	{ // if NOT new record 
		//CRM 2016  Bug #34826
		if (acctCenterId != null && acctCenterId.length > 0 && checkOHRate)
		{
			if (Xrm.Page.getAttribute('ccrm_subaccountingcentreid'))
			{
				Xrm.Page.getAttribute("ccrm_subaccountingcentreid").setValue(null); //default accounting centre details (arup group, practice,sub-practice)        
				Xrm.Page.getControl("ccrm_subaccountingcentreid").setDisabled(true); //disable subaccounting        
				Xrm.Page.getControl('ccrm_subaccountingcentreid').addPreSearch(function ()
				{
					SubAccCentreAddLookupFilter(acctCenterId[0].id);
				});
			}
			Xrm.Page.getAttribute("ccrm_accountingcentreid").setRequiredLevel("required"); //mandatory
		}
	}
	//call getAccountingCentreDetails function
	if (acctCenterId != null && acctCenterId.length > 0)
	{
		getAccountingCentreDetails(acctCenterId[0].id, checkOHRate);
		//make the subaccounting avilable
		if (Xrm.Page.ui.getFormType() != 1)
		{
			//CRM2016 Bug 34826
			if (Xrm.Page.getAttribute("ccrm_subaccountingcentreid"))
			{
				Xrm.Page.getControl("ccrm_subaccountingcentreid").setDisabled(false);
			}
		}
	}
	acctCentreInvalid = null;
	checkAccountingCentreStatus(true);
	var validFieldName = 'ccrm_validaccountingcentre';
	var warnMsg = "An accounting centre you have selected is closed. Please, select a valid accounting centre.";
	var warnMsgName = 'accountingcentre';
	if (acctCentreInvalid != null)
	{
		if (acctCentreInvalid == true)
		{
			SetValidField(validFieldName, 0, warnMsg, warnMsgName);
			if (Xrm.Page.ui.getFormType() == 1)
			{
				//    //SetLookupField(null, null, 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid');
				Xrm.Page.getAttribute("ccrm_accountingcentreid").setValue(null);
				//SetLookupField(0, "", 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid');
				//    //Xrm.Page.getAttribute("ccrm_accountingcentreid").setSubmitMode("always");               
			}
		}
		else
		{
			SetValidField(validFieldName, 1, null, warnMsgName);
		}
	}
	else
	{
		SetValidField(validFieldName, 1, null, warnMsgName);
	}
	setTimeout(function ()
	{
		Xrm.Page.ui.clearFormNotification("accountingcentre");
	}, 10000);
}

function getAccountingCentreDetails(accountCentreID, checkOHrate)
{
	//check if the Acount Centre field is populated
	if (accountCentreID == null) return;
	var select = "Ccrm_ArupGroup, Ccrm_ArupGroupCode,ccrm_arupgroupid,Ccrm_Practice,Ccrm_PracticeCode, Ccrm_SubPractice,Ccrm_SubPracticeCode,Ccrm_estprojectstaffoverheadsrate";
	SDK.REST.retrieveRecord(accountCentreID, "Ccrm_arupaccountingcode", select, null,

	function (retrievedreq)
	{
		//take the Arup group from xml file and copy it to the Arup group field on opportunity
		// SetFieldValue('ccrm_arupgroupid', retrievedreq.Ccrm_ArupGroup);
		//Commenting the above line as the lookup is being set with a text and it is giving error.
		//take the Arup group code from xml file and copy it to the Arup group code field on opportunity
		SetFieldValue('ccrm_arupgroupcode', retrievedreq.Ccrm_ArupGroupCode);
		//take the Arupgroupid from xml file and copy it to the Arupgroupid lookup field on opportunity
		var arupgroupcode = (retrievedreq.ccrm_arupgroupid != null) ? retrievedreq.ccrm_arupgroupid : null;
		if (arupgroupcode != null)
		{
			SetLookupField(arupgroupcode.Id, arupgroupcode.Name, 'ccrm_arupgroup', 'ccrm_arupgroupid'); //set lookup values;                
			Xrm.Page.getAttribute('ccrm_arupgroupid').setSubmitMode('always');
			//set the regionid if id is not null 
			Xrm.Page.getAttribute('ccrm_arupregionid').setValue(setRegionLookup(arupgroupcode.Id));
			Xrm.Page.getAttribute('ccrm_arupregionid').setSubmitMode('always');
			Xrm.Page.getAttribute("ccrm_arupregionid").fireOnChange();
		}
		else Xrm.Page.getAttribute('ccrm_arupgroupid').setValue(null);
		//take the practice from xml file and copy it to the practice field on opportunity
		SetFieldValue('ccrm_practice', retrievedreq.Ccrm_Practice);
		Xrm.Page.getAttribute("ccrm_practice").setSubmitMode("always"); //force submit
		//take the practice code from xml file and copy it to the practice code field on opportunity
		SetFieldValue('ccrm_practicecode', retrievedreq.Ccrm_PracticeCode);
		//take the sub-practice from xml file and copy it to the sub-practice field on opportunity
		SetFieldValue('ccrm_subpractice', retrievedreq.Ccrm_SubPractice);
		//take the sub-practice code from xml file and copy it to the subpractice code field on opportunity
		SetFieldValue('ccrm_subpracticecode', retrievedreq.Ccrm_SubPracticeCode);
		//get the acct centre's staff overheads rate
		if (Xrm.Page.ui.getFormType() != 1 && checkOHrate)
		{
			var projStaffOverheadsRate = (retrievedreq.Ccrm_estprojectstaffoverheadsrate != null) ? retrievedreq.Ccrm_estprojectstaffoverheadsrate : null;
			if (projStaffOverheadsRate != null)
			{
				Xrm.Page.getAttribute("ccrm_estprojectstaffoverheadsrate").setValue(parseFloat(projStaffOverheadsRate));
				calcEstProjStaffOverheadsValue();
				calcTotalCosts();
				Xrm.Page.getAttribute("ccrm_staffoverheadspercent").setValue(parseFloat(projStaffOverheadsRate));
				Xrm.Page.getAttribute("ccrm_staffoverheadspercent").setSubmitMode("always");
				staffoverheadspercent();
			}
			else
			{
				Xrm.Page.getAttribute("ccrm_estprojectstaffoverheadsrate").setValue(0);
				calcEstProjStaffOverheadsValue();
				Xrm.Page.getAttribute("ccrm_staffoverheadspercent").setValue(0);
				staffoverheadspercent();
			}
		}
	}, errorHandler, false);
}

function staffoverheadspercent()
{
	calcStaffOverheads();
	calcTotalBidCost();
}
calcTotalBidCost = function ()
{
	var salary = Xrm.Page.getAttribute("ccrm_salarycost_num").getValue();
	var staffoverheads = Xrm.Page.getAttribute("ccrm_staffoverheads_num").getValue();
	var expenses = Xrm.Page.getAttribute("ccrm_grossexpenses_num").getValue();
	var result = (salary + staffoverheads + expenses);
	Xrm.Page.getAttribute("ccrm_totalbidcost_num").setValue(result);
}

function calcStaffOverheads()
{
	var salary = Xrm.Page.getAttribute("ccrm_salarycost_num").getValue();
	var staffoverheadspercent = Xrm.Page.getAttribute("ccrm_staffoverheadspercent").getValue();
	var calcSOH = 0;
	if (salary > 0 && staffoverheadspercent > 0) calcSOH = (staffoverheadspercent / 100) * salary;
	Xrm.Page.getAttribute("ccrm_staffoverheads_num").setValue(calcSOH);
	Xrm.Page.getAttribute("ccrm_staffoverheads_num").setSubmitMode("always");
}

function checkAccountingCentreStatus(newoppcreationflag)
{
	acctCentreInvalid = null;
	var acctcentreid = Xrm.Page.getAttribute("ccrm_accountingcentreid").getValue();
	if (acctcentreid != null && acctcentreid.length > 0)
	{
		var accountingCentreID = acctcentreid[0].id;
		var sys_phasename = "Pre-Bid"; //[RS-08/05/2017] - Change sys_phasename from Lead to Pre-Bid
		if (!newoppcreationflag) // new opp getting created from quick create form
		{
			if (Xrm.Page.getAttribute("ccrm_sys_phasename").getValue() != null) sys_phasename = Xrm.Page.getAttribute("ccrm_sys_phasename").getValue();
			else if (Xrm.Page.getAttribute("stepname"))
			{
				if (Xrm.Page.getAttribute("stepname").getValue() != null) sys_phasename = Xrm.Page.getAttribute("stepname").getValue();
			}
		}
		var select = "statuscode, Ccrm_Suppressed";
		SDK.REST.retrieveRecord(accountingCentreID,
			"Ccrm_arupaccountingcode",
		select,
		null,

		function (retrievedreq)
		{
			if (retrievedreq != null)
			{
				var statuscodeFlag = (retrievedreq.statuscode != null) ? retrievedreq.statuscode.Value : null;
				var suppressedFlag = (retrievedreq.Ccrm_Suppressed != null) ? retrievedreq.Ccrm_Suppressed : null;
				if (sys_phasename.indexOf("Pre-Bid") > -1)
				{ //[RS-08/05/2017] - Changed Lead to Pre-Bid
					//check for inactive status and suppressed flag checked
					if (statuscodeFlag == "2")
					{
						acctCentreInvalid = true;
						return;
						//return [true, "WARNING:\rYour opportunity has not been progressed as it is listed against an inactive accounting centre.\r\rPlease update the accounting centre on the Administration tab before continuing."];
					}
					else if (suppressedFlag != null && suppressedFlag == "true")
					{
						acctCentreInvalid = true;
						return;
						//return [true, "WARNING:\rYour opportunity has not been progressed as it is listed against a shadow accounting centre.\r\rPlease update the accounting centre on the Administration tab before continuing."];
					}
					else
					{
						acctCentreInvalid = false;
						return;
						//return [false, ""];
					}
				}
				else if (sys_phasename.indexOf("Bid in Development") > -1 || sys_phasename.indexOf("Bid Submitted") > -1)
				{
					//check for inactive status flag checked
					if (statuscodeFlag == "2")
					{
						acctCentreInvalid = true;
						return;
						//return [true, "WARNING:\rYour opportunity has not been progressed as it is listed against an inactive accounting centre.\r\rPlease update the accounting centre on the Administration tab before continuing."];
					}
					else
					{
						acctCentreInvalid = false;
						return;
						//return [false, ""];
					}
				}
				else
				{
					acctCentreInvalid = false;
					return;
					//return [false, ""];
				}
			}
		},
		errorHandler,
		false);
	}
}

function SetFieldValue(fieldName, val)
{
	if (val) Xrm.Page.getAttribute(fieldName).setValue(val);
	else Xrm.Page.getAttribute(fieldName).setValue(null);
}
//set Region lookup - called by the setCompanyLookup function and onchange of arup company

function setRegionLookup(arupGroupID)
{
	var lookup = null;
	//check if Id passed is null
	if (arupGroupID != null)
	{
		SDK.REST.retrieveRecord(arupGroupID, "Ccrm_arupgroup", 'ccrm_arupregionid', null,

		function (retrievedreq)
		{
			if (retrievedreq != null)
			{
				if (retrievedreq.ccrm_arupregionid != null)
				{
					var Id = retrievedreq.ccrm_arupregionid.Id;
					if (Id.indexOf('{') == -1) Id = '{' + Id;
					if (Id.indexOf('}') == -1) Id = Id + '}';
					Id = Id.toUpperCase();
					lookup = new Array();
					lookup[0] = new Object();
					lookup[0].id = Id;
					lookup[0].name = retrievedreq.ccrm_arupregionid.Name;
					lookup[0].entityType = 'ccrm_arupregion';
					//set notification id
					if (retrievedreq.ccrm_arupregionid.Id != null) Xrm.Page.getAttribute('ccrm_notificationlistid').setValue(setNotificationLookup(retrievedreq.ccrm_arupregionid.Id));
				}
			}
		},
		errorHandler,
		false);
	}
	return lookup;
}
//set notification lookup - called by the setRegionLookup function and onchange of arup company

function setNotificationLookup(arupRegionID)
{
	var filter = "$select=Ccrm_notificationlistId,Ccrm_name&$top=1&$filter=ccrm_arupregionid/Id eq (guid'" + arupRegionID + "')";
	SDK.REST.retrieveMultipleRecords("Ccrm_notificationlist", filter,

	function (results)
	{
		if (results.length > 0)
		{
			var Id = results[0].Ccrm_notificationlistId;
			if (Id.indexOf('{') == -1) Id = '{' + Id;
			if (Id.indexOf('}') == -1) Id = Id + '}';
			Id = Id.toUpperCase();
			var lookup = new Array();
			lookup[0] = new Object();
			lookup[0].id = Id;
			lookup[0].name = results[0].Ccrm_name;
			lookup[0].entityType = "ccrm_notificationlist";
			return lookup;
		}
		else
		{
			return null;
		};
	},
	errorHandler,

	function ()
	{},
	false);
}
// Set Valid Acc Center Code --  ends 
// Common Methods - Starts 

function SetValidField(fieldName, val, warningMsg, warMsgName)
{
	//Xrm.Page.getAttribute(fieldName).setValue(val);
	//Xrm.Page.getAttribute(fieldName).setSubmitMode('always');
	//if (warningMsg != null)
	//    Xrm.Page.ui.setFormNotification(warningMsg, 'WARNING', warMsgName);
	//else
	//    Xrm.Page.ui.clearFormNotification(warMsgName);
}
// Common Methods - Ends 

function StageSelected(args)
{
	var eventAgrs = args.getEventArgs();
	var selectedStage = eventAgrs.getStage();
	// optionset flag
	Xrm.Page.getAttribute('ccrm_stagetoggle').setSubmitMode('never');
	Xrm.Page.getAttribute('ccrm_processflag').setSubmitMode('never');
	if (Xrm.Page.getAttribute('ccrm_stagetoggle').getValue() == 1)
	{
		Xrm.Page.getAttribute('ccrm_stagetoggle').setValue(0);
	}
	else
	{
		Xrm.Page.getAttribute('ccrm_stagetoggle').setValue(1);
	}
	Xrm.Page.getAttribute('ccrm_stagetoggle').fireOnChange();
	// text field flag
	Xrm.Page.getAttribute('ccrm_processflag').setValue(selectedStage.getName());
	Xrm.Page.getAttribute('ccrm_stagetoggle').setSubmitMode('always'); // Added 'always' param to fix 70014 bug
	Xrm.Page.getAttribute('ccrm_processflag').setSubmitMode('always'); // Added 'always' param to fix 70014 bug
	setLookupFiltering();
	hideProcessFields(selectedStage.getName());
	makeBidReviewApprovalFieldsReadonly();
}

function makeBidReviewApprovalFieldsReadonly()
{
	var disableBidReviewChair = Xrm.Page.getControl("header_process_ccrm_bidreviewoutcome") != null;
	Xrm.Page.getControl("header_process_ccrm_bidreviewoutcome").setDisabled(disableBidReviewChair);
	if (Xrm.Page.getControl("header_process_ccrm_bidreviewdecisiondate") != null) Xrm.Page.getControl("header_process_ccrm_bidreviewdecisiondate").setDisabled(true);
	if (Xrm.Page.getControl("header_process_ccrm_opportunitytype_2") != null) Xrm.Page.getControl("header_process_ccrm_opportunitytype_2").setDisabled(true);
}

function ccrm_bidreviewoutcome_onChange()
{
	var disableBidReviewChair = (Xrm.Page.getAttribute("ccrm_bidreviewoutcome").getValue() == 100000002 || currUserData.caltype != 0) ? true : false;
	Xrm.Page.getControl("ccrm_bidreviewchair_userid").setDisabled(disableBidReviewChair);
	Xrm.Page.getControl("ccrm_bidreviewoutcome").removeOption(100000001);
	Xrm.Page.getControl("ccrm_bidreviewoutcome").removeOption(100000003);
	Xrm.Page.getControl("header_process_ccrm_bidreviewoutcome").removeOption(100000001);
	Xrm.Page.getControl("header_process_ccrm_bidreviewoutcome").removeOption(100000003);
	if (!isCrmForMobile)
	{
		if (Xrm.Page.getControl("header_process_ccrm_bidreviewchair_userid_1") != null)
		{
			Xrm.Page.getControl("header_process_ccrm_bidreviewchair_userid_1").setDisabled(disableBidReviewChair);
		}
		if (Xrm.Page.getControl("header_process_ccrm_bidreviewchair_userid") != null)
		{
			Xrm.Page.getControl("header_process_ccrm_bidreviewchair_userid").setDisabled(disableBidReviewChair);
		}
	}
	else if (getStageId() == ArupStages.BidReviewApproval && Xrm.Page.getAttribute("ccrm_bidreviewoutcome").getValue() == 100000000)
	{
		Xrm.Page.getControl("header_process_ccrm_bidreviewoutcome").setDisabled(false);
	}
}
// Ribbon possible job no Btn click events 

function highlightField(headerfield, formfield, clear)
{
	var bgcolor = 'rgba(255, 179, 179, 1)';
	if (clear == true) bgcolor = 'transparent';
	//CRM 2016 Bug 34818
	if (headerfield) window.parent.$(headerfield).css('background-color', bgcolor);
	if (formfield) window.parent.$(formfield).css('background-color', bgcolor);
}

function requestPossibleJob()
{
	// set focus to avoid issues with in progress changes.
	Xrm.Page.getControl("ccrm_reference").setFocus();
	customerid_onChange();
	var stageid = getStageId();
	var crossregionbid = IsCrossRegionBid();
	// Validate the opportunity track
	ccrm_opportunitytype_onchange();
	var arupCompany = Xrm.Page.getAttribute('ccrm_arupcompanyid').getValue();
	//validate if PJN request and Arup Company = 56, then do not allow requesting PJN
	if (arupCompany != null)
	{
		var companyError = denyArupCompanyPJN(arupCompany[0].id);
		if (companyError)
		{
			Xrm.Page.getAttribute("ccrm_arupcompanyid").setValue(null);
			Xrm.Page.getAttribute("ccrm_accountingcentreid").setValue(null);
			Xrm.Page.getAttribute('ccrm_accountingcentreid').setValue(null);
			Alert.show('<font size="6" color="#F69922"><b>Invalid Company for PJN</b></font>',
				'<font size="3" color="#000000"></br>' + 'You have selected an Arup Company (Arup Latin America – 056) that is not eligible for a PJN request due to statutory limitations. It will only be available at a Confirmed Job stage. Please replace the company and accounting centre and proceed.' + '</font>', [
			{
				label: "<b>OK</b>",
				setFocus: true},
                ], "WARNING", 600, 250, '', true);
		}
	}
	if (IsFormValid(true))
	{
		var regionName = Xrm.Page.getAttribute('ccrm_arupregionid').getValue()[0].name;
		if (crossregionbid && stageid != ArupStages.CrossRegion && stageid == ArupStages.Lead && !CrossRegionFieldsFilled())
		{
			moveToNextTrigger_PJN = true;
			moveToNextTrigger = true;
			Xrm.Page.data.save();
			return;
		} // Not cross region bid        
		else
		{
			//set the possible job number required flag to YES    
			if (crossregionbid)
			{
				if (!CrossRegionFieldsFilled())
				{
					//HighlightCrossRegionFields();
					Xrm.Page.ui.setFormNotification("This is a Cross Region bid and the Country Manager needs to be consulted.  Please complete the details on the Cross Region stage. ", "WARNING", "msgCrossCountry");
					setTimeout(function ()
					{
						Xrm.Page.ui.clearFormNotification("msgCrossCountry");
					}, 10000);
					return false;
				}
			}
			if (regionName != null)
			{
				if (regionName == 'East Asia Region' || regionName == 'Australasia Region' || regionName == 'Malaysia Region')
				{
					Xrm.Page.ui.setFormNotification("Your request for a Possible Job Number has been logged. Decision to Proceed approvals are being generated. See the PJN Approvals stage for status of the Approvals", "INFO", "PJNProgress");
					setTimeout(function ()
					{
						Xrm.Page.ui.clearFormNotification("PJNProgress");
					}, 10000);
					//lockDownBidCosts(true);
					setJobNoProgression(100009002);
					moveToDevBid(stageid);
					setCurrentApproversAsync();
				}
				else
				{
					Alert.show('<font size="6" color="#2E74B5"><b>For your information</b></font>',
						'<font size="3" color="#000000"></br>By clicking OK you will assign a possible job number. No approval requests will be sent.</br></br>You must ensure that you have completed all the requirements of your regional bid policy and attached supporting evidence - such as a Decision to Proceed record signed by a Director.</br></br>If you are not sure if you have complied with your regional requirements please consult a Director before progressing.</font>', [
                            new Alert.Button("<b>OK</b>",

					function ()
					{
						Xrm.Page.ui.setFormNotification("A Possible Job Number is being generated. It may take a couple of minutes to appear on the opportunity screen and couple of hours to appear on the financial systems", "INFO", "PJNProgress");
						setTimeout(function ()
						{
							Xrm.Page.ui.clearFormNotification("PJNProgress");
						}, 10000);
						lockDownBidCosts(true);
						setJobNoProgression(100009003);
						moveToDevBid(stageid);
					},
					false,
					false),
                            new Alert.Button("Do Not Request",

					function ()
					{
						Alert.show('<font size="6" color="#2E74B5"><b>For your information</b></font>',
							'<font size="3" color="#000000"></br>Request for PJN was not sent.</font>', [
                                            new Alert.Button("OK")
                                        ],
							"INFO", 500, 200, '', true);
					}, true, false)
                        ],
						"INFO", 700, 400, '', true);
				}
			}
		}
	}
}

function denyArupCompanyPJN(companyID)
{
	if (companyID == null)
	{
		return false
	};
	SDK.REST.retrieveRecord(companyID, "Ccrm_arupcompany", 'Ccrm_AccCentreLookupCode', null,

	function (retrievedreq)
	{
		if (retrievedreq != null)
		{
			companyCode = retrievedreq.Ccrm_AccCentreLookupCode;
		}
	}, errorHandler, false);
	var validCompany = companyCode == '56' ? true : false;
	return validCompany;
}

function IsFormValid(IsPJNRequest)
{
	/// <summary>Check various mandatory fields on the form to check if they have been filled in. Highlight fields that are not valid.</summary>
	/// <param name="IsPJNRequest">Flag to indicate whether we are in the process of requesting a PJN, in which case certain fields such as the Bid Salary Cost and Bid Gross Expenses need to be mandatory.</param>
	var v1 = Xrm.Page.getAttribute('ccrm_validcontact').getValue(); //needs to be 1
	var v2 = Xrm.Page.getAttribute('ccrm_validopportunitytrack').getValue(); //needs to be 1    
	var v3 = Xrm.Page.getAttribute('ccrm_accountingcentreid').getValue();
	if (v3 != null) v3 = Xrm.Page.getAttribute('ccrm_accountingcentreid').getValue()[0].id;
	if (v3 != 0)
	{
		acctCentreInvalid = false;
		validateAccCenter(false);
	}
	var v4 = Xrm.Page.getAttribute('ccrm_bidmanager_userid').getValue();
	var v5 = Xrm.Page.getAttribute('ccrm_biddirector_userid').getValue();
	var v6 = Xrm.Page.getControl('header_ccrm_project_transactioncurrencyid').getAttribute().getValue();
	var v7 = Xrm.Page.getAttribute('ccrm_estarupinvolvementstart').getValue();
	var v8 = Xrm.Page.getAttribute('ccrm_estarupinvolvementend').getValue();
	var v9 = Xrm.Page.getAttribute('ccrm_estimatedvalue_num').getValue();
	var v10 = Xrm.Page.getAttribute('ccrm_probabilityofprojectproceeding').getValue();
	var v11 = Xrm.Page.getAttribute('closeprobability').getValue();
	var v12 = Xrm.Page.getAttribute('ccrm_salarycost_num').getValue();
	var v13 = Xrm.Page.getAttribute('ccrm_grossexpenses_num').getValue();
	var v14 = Xrm.Page.getAttribute('ccrm_totalbidcost_num').getValue();
	var v15 = Xrm.Page.getAttribute('ccrm_descriptionofextentofarupservices').getValue();
	var v16 = Xrm.Page.getAttribute('ccrm_leadsource').getValue();
	var v17 = Xrm.Page.getAttribute('ccrm_accountingcentreid').getValue();
	var v18 = Xrm.Page.getAttribute('ccrm_arupcompanyid').getValue();
	var v19 = Xrm.Page.getAttribute('ccrm_disciplinesname').getValue();
	var v25 = Xrm.Page.getAttribute('ccrm_contractarrangement').getValue();
	// form fields
	var v20 = Xrm.Page.getAttribute('description').getValue();
	var v21 = Xrm.Page.getAttribute('ccrm_projectlocationid').getValue();
	var v22 = Xrm.Page.getAttribute('ccrm_arupbusinessid').getValue();
	var v23 = Xrm.Page.getAttribute('name').getValue();
	var v24 = Xrm.Page.getAttribute('customerid').getValue();
	var v26 = Xrm.Page.getAttribute('ccrm_arupregionid').getValue();
	if (v26 != null) v26 = Xrm.Page.getAttribute('ccrm_arupregionid').getValue()[0].id;
	var v27 = Xrm.Page.getAttribute("ccrm_client").getValue();
	if (v27 != null)
	{
		v27 = Xrm.Page.getAttribute('ccrm_client').getValue()[0].name;
	}
	var v28 = Xrm.Page.getAttribute('ccrm_chargingbasis').getValue();
	var v30 = Xrm.Page.getAttribute('ccrm_arupusstateid').getValue();
	var v31 = Xrm.Page.getAttribute('ccrm_contractarrangement').getValue();
	var v32 = Xrm.Page.getAttribute('ccrm_bid_transactioncurrencyid').getValue();
	var v33 = Xrm.Page.getAttribute('ccrm_othernetworksdisp').getValue();
	var v34 = Xrm.Page.getAttribute('ccrm_othernetworkdetails').getValue();
	var v35 = Xrm.Page.getAttribute('arup_subbusiness').getValue();
	var validfieldflag = true;
	var mandatoryfieldflag = true;
	var stateFlag = true;
	var arupRegionFlg = true;
	var valClientFlag = true;
	if (IsPJNRequest)
	{
		if (v1 == 0 || v2 == 0 || v3 == 0) validfieldflag = false;
		if (v4 == null || v5 == null || v6 == null || v7 == null || v8 == null || v9 == null || v10 == null || v11 == null || v12 == null || v13 == null || v14 == null || v15 == null || v16 == null || v17 == null || v18 == null || v19 == null || v20 == null || v21 == null || v22 == null || v23 == null || v24 == null || v28 == null || v31 == null || v32 == null || v35 == null || v33 == null || (/Other/.test(v33) && v34 == null)) mandatoryfieldflag = false;
	}
	else
	{
		if (v1 == 0 || v3 == 0) validfieldflag = false;
		if (v4 == null || v5 == null || v6 == null || v7 == null || v8 == null || v9 == null || v10 == null || v11 == null || v15 == null || v16 == null || v17 == null || v18 == null || v19 == null || v20 == null || v21 == null || v22 == null || v23 == null || v24 == null || v31 == null || v35 == null || v33 == null || (/Other/.test(v33) && v34 == null)) mandatoryfieldflag = false;
	}
	if (v26 == 0) arupRegionFlg = false;
	if (Xrm.Page.getControl('ccrm_arupusstateid').getVisible() && v30 == null) stateFlag = false;
	if (v27 == 'Unassigned' || v27 == null) valClientFlag = false;
	if (!validfieldflag || !mandatoryfieldflag || !stateFlag || !arupRegionFlg || acctCentreInvalid || !valClientFlag)
	{
		// set notification message - start
		if (!arupRegionFlg) Xrm.Page.ui.setFormNotification('Arup Region is not determined. Please verify the Arup Group.', 'WARNING', 'msgReg');
		if ((!mandatoryfieldflag && IsPJNRequest) || !stateFlag) Xrm.Page.ui.setFormNotification("Please fill in all mandatory fields", "WARNING", "reqPJNWarnMsg-mandfields");
		// automatically make the message disappear
		setTimeout(function ()
		{
			Xrm.Page.ui.clearFormNotification("reqPJNWarnMsg-mandfields");
			Xrm.Page.ui.clearFormNotification("reqPJNWarnMsg-validfields");
		}, 10000);
		// set notification message - ends
		HighlightFields(v4,
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
		v35, (IsPJNRequest == null) ? false : IsPJNRequest);
		return false;
	}
	else
	{
		HighlightFields(v4,
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
		v35, (IsPJNRequest == null) ? false : IsPJNRequest);
	}
	return true;
}

function moveToDevBid(stageid)
{
	Xrm.Page.getAttribute('ccrm_possiblejobnumberrequired').setValue(1);
	Xrm.Page.getAttribute('ccrm_possiblejobnumberrequired').fireOnChange();
	Xrm.Page.getAttribute('ccrm_possiblejobnumberrequired').setSubmitMode("always");
	Xrm.Page.getAttribute('ccrm_showpjnbutton').setValue(0);
	if (stageid == ArupStages.Lead || stageid == ArupStages.CrossRegion)
	{
		moveToNextTrigger = true;
	}
	setTimeout(function ()
	{
		void 0;
	}, 1000);
	Xrm.Page.data.save();
}

function HighlightFields(v4,
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
IsPJNRequest)
{
	// highlight incomplete fields 
	$(document)
		.ready(function ()
	{
		highlightField(null, "#ccrm_arupusstateid", (Xrm.Page.getControl('ccrm_arupusstateid').getVisible() && v30 != null) ? true : false);
		highlightField('#header_process_ccrm_bidmanager_userid', '#ccrm_bidmanager_userid', (v4 != null) ? true : false);
		highlightField('#header_process_ccrm_biddirector_userid', '#ccrm_biddirector_userid', (v5 != null) ? true : false);
		highlightField(null, '#header_ccrm_project_transactioncurrencyid', (v6 != null) ? true : false);
		highlightField(null, '#ccrm_project_transactioncurrencyid', (v6 != null) ? true : false);
		//CRM 2016-Bug 34819, 34884
		//Xrm.Page.getControl("header_ccrm_project_transactioncurrencyid").setRequiredLevel('required');
		highlightField('#header_process_ccrm_estarupinvolvementstart', '#ccrm_estarupinvolvementstart', (v7 != null) ? true : false);
		highlightField('#header_process_ccrm_estarupinvolvementend', '#ccrm_estarupinvolvementend', (v8 != null) ? true : false);
		highlightField('#header_process_ccrm_estimatedvalue_num', '#ccrm_estimatedvalue_num', (v9 != null) ? true : false);
		highlightField(null, "#ccrm_client", (v27 != null && v27 != 'Unassigned') ? true : false);
		//CRM2016-Bug 34944
		// highlightField('#header_process_ccrm_probabilityofprojectproceeding', '#ccrm_probabilityofprojectproceeding', (v10 != null) ? true : false);
		// highlightField('#header_process_closeprobability', '#closeprobability', (v11 != null) ? true : false);
		if (IsPJNRequest)
		{
			highlightField('#header_process_ccrm_salarycost_num', '#ccrm_salarycost_num', (v12 != null) ? true : false);
			Xrm.Page.getAttribute("ccrm_salarycost_num").setRequiredLevel('required');
			highlightField('#header_process_ccrm_grossexpenses_num', '#ccrm_grossexpenses_num', (v13 != null) ? true : false);
			Xrm.Page.getAttribute("ccrm_grossexpenses_num").setRequiredLevel('required');
			highlightField('#header_process_ccrm_totalbidcost_num', '#ccrm_totalbidcost_num', (v14 != null) ? true : false);
			highlightField(null, '#ccrm_chargingbasis', (v28 != null) ? true : false);
			Xrm.Page.getAttribute("ccrm_chargingbasis").setRequiredLevel('required');
			Xrm.Page.getAttribute("ccrm_totalbidcost_num").setRequiredLevel('required'); // moved back to PJN block based on regression test defect
		}
		highlightField('#header_process_ccrm_descriptionofextentofarupservices', '#ccrm_descriptionofextentofarupservices', (v15 != null) ? true : false);
		highlightField('#header_process_ccrm_leadsource', '#ccrm_leadsource', (v16 != null) ? true : false);
		highlightField('#header_process_ccrm_accountingcentreid', '#ccrm_accountingcentreid', (v17 != null) ? true : false);
		highlightField('#header_process_ccrm_arupcompanyid', '#ccrm_arupcompanyid', (v18 != null) ? true : false);
		highlightField('#header_process_ccrm_disciplinesname', '#ccrm_disciplinesname', (v19 != null) ? true : false);
		highlightField(null, "#description", (v20 != null) ? true : false);
		highlightField(null, "#ccrm_projectlocationid", (v21 != null) ? true : false);
		highlightField(null, "#ccrm_arupbusinessid", (v22 != null) ? true : false);
		highlightField(null, "#name", (v23 != null) ? true : false);
		highlightField(null, "#customerid", (v24 != null) ? true : false);
		highlightField(null, "#ccrm_bid_transactioncurrencyid", (v32 != null) ? true : false);
		highlightField('#header_process_ccrm_contractarrangement', '#ccrm_contractarrangement', (v25 != null) ? true : false);
		Xrm.Page.getAttribute("ccrm_bid_transactioncurrencyid").setRequiredLevel('required');
		highlightField("#header_process_ccrm_othernetworksdisp", "#ccrm_othernetworksdisp", v33 != null);
		highlightField("#header_process_ccrm_othernetworkdetails", "#ccrm_othernetworkdetails", v33 != null && v34 != null);
		highlightField(null, "#arup_subbusiness", (v35 != null) ? true : false);
	});
}

function CrossRegionFieldsFilled()
{
	var result = true;
	var countrymgrconsulted = Xrm.Page.getAttribute("ccrm_geographicmanagerproxyconsulted2").getValue();
	if (countrymgrconsulted == null)
	{
		highlightField('#header_process_ccrm_geographicmanagerproxyconsulted2',
			"#ccrm_geographicmanagerproxyconsulted2");
		result = false;
	}
	var notconsultval = Xrm.Page.getAttribute("ccrm_reasonfornotconsultingcountrymanager").getValue();
	if (countrymgrconsulted == 2 && notconsultval == null)
	{
		highlightField('#header_process_ccrm_reasonfornotconsultingcountrymanager',
			"#ccrm_reasonfornotconsultingcountrymanager");
		result = false;
	}
	var dtconsulted = Xrm.Page.getAttribute("ccrm_dateconsulted").getValue();
	if (countrymgrconsulted == 1 && dtconsulted == null)
	{
		highlightField('#header_process_ccrm_dateconsulted', "#ccrm_dateconsulted");
		result = false;
	}
	return result;
}

function HighlightCrossRegionFields(isCrossRegion)
{
	var notconsultval = Xrm.Page.getAttribute("ccrm_reasonfornotconsultingcountrymanager").getValue();
	var countrymgrconsulted = Xrm.Page.getAttribute("ccrm_geographicmanagerproxyconsulted2").getValue();
	var dtconsulted = Xrm.Page.getAttribute("ccrm_dateconsulted").getValue();
	$(document)
		.ready(function ()
	{
		var showNotification = false;
		if (countrymgrconsulted == null)
		{
			highlightField('#header_process_ccrm_geographicmanagerproxyconsulted2',
				"#ccrm_geographicmanagerproxyconsulted2");
			showNotification = true;
		}
		else highlightField('#header_process_ccrm_geographicmanagerproxyconsulted2',
			"#ccrm_geographicmanagerproxyconsulted2",
		true);
		if (countrymgrconsulted == 2 && notconsultval == null)
		{
			highlightField('#header_process_ccrm_reasonfornotconsultingcountrymanager',
				"#ccrm_reasonfornotconsultingcountrymanager");
			showNotification = true;
		}
		else highlightField('#header_process_ccrm_reasonfornotconsultingcountrymanager',
			"#ccrm_reasonfornotconsultingcountrymanager",
		true);
		if (countrymgrconsulted == 1 && dtconsulted == null)
		{
			highlightField('#header_process_ccrm_dateconsulted', "#ccrm_dateconsulted");
			showNotification = true;
		}
		else highlightField('#header_process_ccrm_dateconsulted', "#ccrm_dateconsulted", true);
		if (showNotification)
		{
			// Please complete the cross country checks before requesting a possible Job number
			var msgCrossRegion =
				'To complete the Bid Review please fill in the mandatory fields and ensure that the cross country checks have been completed.';
			if (isCrossRegion)
			{
				if (moveToNextTrigger_PJN)
				{
					msgCrossRegion =
						'This is a Cross Region bid and the Country Manager needs to be consulted.  Please complete the details before Requesting Possible Job.';
					moveToNextTrigger_PJN = false;
				}
				else msgCrossRegion = 'Please complete the cross country checks before progressing.';
			}
			Xrm.Page.ui.setFormNotification(msgCrossRegion, 'WARNING', 'msgcrossbid');
			setTimeout(function ()
			{
				Xrm.Page.ui.clearFormNotification("msgcrossbid");
			}, 10000);
		}
	});
}

function InitiateCrossRegionStage(countrymgrconsulted, isCrossRegion)
{
	Xrm.Page.getAttribute("ccrm_geographicmanagerproxyconsulted2").setRequiredLevel("required");
	//Xrm.Page.getAttribute("ccrm_dateconsulted").setRequiredLevel("required");
	countrymgrconsulted = Xrm.Page.getAttribute("ccrm_geographicmanagerproxyconsulted2").getValue();
	if (countrymgrconsulted == 2)
	{
		Xrm.Page.getAttribute("ccrm_reasonfornotconsultingcountrymanager").setRequiredLevel("required");
		Xrm.Page.getAttribute("ccrm_dateconsulted").setRequiredLevel("none");
	}
	else if (countrymgrconsulted == 1)
	{
		Xrm.Page.getAttribute("ccrm_reasonfornotconsultingcountrymanager").setRequiredLevel("none");
		Xrm.Page.getAttribute("ccrm_dateconsulted").setRequiredLevel("required");
	}
	HighlightCrossRegionFields(isCrossRegion);
}

function setJobNoProgression(val)
{
	if (Xrm.Page.getAttribute('ccrm_jobnumberprogression').getValue() != val)
	{
		var jobNoProgField = Xrm.Page.getAttribute('ccrm_jobnumberprogression');
		jobNoProgField.setValue(val);
		//jobNoProgField.setSubmitMode("always");
		//jobNoProgField.fireOnChange();
	}
}

function getApproverName(recordid, entity, field)
{
	var output = new Object();
	SDK.REST.retrieveRecord(recordid,
	entity,
	field,
	null,

	function (retrievedreq)
	{
		if (retrievedreq != null)
		{
			if (retrievedreq[field] != null)
			{
				output.Name = retrievedreq[field].Name;
				output.Id = retrievedreq[field].Id;
			}
			else output.Name = currUserData.FullName; // if null then set to curr user name to satisfy the equal to condition
		}
	},
	errorHandler,
	false);
	return output;
}

function getGroupLeaderApprovers(groupid, companyid)
{
	var check1 = -1;
	var check2 = -1;
	var LoggedUser = Xrm.Page.context.getUserId();
	LoggedUser = LoggedUser.replace('{', '');
	LoggedUser = LoggedUser.replace('}', '');
	LoggedUser = LoggedUser.toLowerCase();
	var outputGroup = new Object();
	var outputCompany = new Object();
	var output = new Object();
	outputGroup = getGLApprovers(groupid);
	if (outputGroup != null)
	{
		if (outputGroup.Ids != '')
		{
			check1 = $.inArray(LoggedUser, outputGroup.Ids);
			if (check1 == -1)
			{
				return false;
			}
			else
			{
				return true;
			}
		}
	}
	outputCompany = getFinanceApproverForCompany(companyid);
	if (outputCompany != null)
	{
		check2 = $.inArray(LoggedUser, outputCompany.Ids);
		if (check2 == -1)
		{
			return false;
		}
		else
		{
			return true;
		}
	}
	return false;
}

function getGLApprovers(groupid)
{
	var output = new Object();
	var names = new Array();
	var ids = new Array();
	SDK.REST.retrieveRecord(groupid,
		"Ccrm_arupgroup",
		'arup_GroupLeader,ccrm_groupleader1id,ccrm_groupleader2id,ccrm_groupleader3id,ccrm_groupleader4id,ccrm_groupleader5id,ccrm_groupleader6id,' +
		'ccrm_groupleader7id,ccrm_groupleader8id,ccrm_groupleader9id,ccrm_groupleader10id,ccrm_groupleader11id,ccrm_groupleader12id,' +
		'arup_GroupLeader13id,arup_GroupLeader14id,arup_GroupLeader15id,arup_GroupLeader16id,arup_GroupLeader17id,arup_GroupLeader18id,arup_GroupLeader19id,arup_GroupLeader20id',
	null,

	function (retrievedreq)
	{
		if (retrievedreq != null)
		{
			if (retrievedreq.arup_GroupLeader.Id != null)
			{
				names.push(retrievedreq.arup_GroupLeader.Name);
				ids.push(retrievedreq.arup_GroupLeader.Id);
			}
			if (retrievedreq.ccrm_groupleader1id.Id != null)
			{
				names.push(retrievedreq.ccrm_groupleader1id.Name);
				ids.push(retrievedreq.ccrm_groupleader1id.Id);
			}
			if (retrievedreq.ccrm_groupleader2id.Id != null)
			{
				names.push(retrievedreq.ccrm_groupleader2id.Name);
				ids.push(retrievedreq.ccrm_groupleader2id.Id);
			}
			if (retrievedreq.ccrm_groupleader3id.Id != null)
			{
				names.push(retrievedreq.ccrm_groupleader3id.Name);
				ids.push(retrievedreq.ccrm_groupleader3id.Id);
			}
			if (retrievedreq.ccrm_groupleader4id.Id != null)
			{
				names.push(retrievedreq.ccrm_groupleader4id.Name);
				ids.push(retrievedreq.ccrm_groupleader4id.Id);
			}
			if (retrievedreq.ccrm_groupleader5id.Id != null)
			{
				names.push(retrievedreq.ccrm_groupleader5id.Name);
				ids.push(retrievedreq.ccrm_groupleader5id.Id);
			}
			if (retrievedreq.ccrm_groupleader6id.Id != null)
			{
				names.push(retrievedreq.ccrm_groupleader6id.Name);
				ids.push(retrievedreq.ccrm_groupleader6id.Id);
			}
			if (retrievedreq.ccrm_groupleader7id.Id != null)
			{
				names.push(retrievedreq.ccrm_groupleader7id.Name);
				ids.push(retrievedreq.ccrm_groupleader7id.Id);
			}
			if (retrievedreq.ccrm_groupleader8id.Id != null)
			{
				names.push(retrievedreq.ccrm_groupleader8id.Name);
				ids.push(retrievedreq.ccrm_groupleader8id.Id);
			}
			if (retrievedreq.ccrm_groupleader9id.Id != null)
			{
				names.push(retrievedreq.ccrm_groupleader9id.Name);
				ids.push(retrievedreq.ccrm_groupleader9id.Id);
			}
			if (retrievedreq.ccrm_groupleader10id.Id != null)
			{
				names.push(retrievedreq.ccrm_groupleader10id.Name);
				ids.push(retrievedreq.ccrm_groupleader10id.Id);
			}
			if (retrievedreq.ccrm_groupleader11id.Id != null)
			{
				names.push(retrievedreq.ccrm_groupleader11id.Name);
				ids.push(retrievedreq.ccrm_groupleader11id.Id);
			}
			if (retrievedreq.ccrm_groupleader12id.Id != null)
			{
				names.push(retrievedreq.ccrm_groupleader12id.Name);
				ids.push(retrievedreq.ccrm_groupleader12id.Id);
			}
			if (retrievedreq.arup_GroupLeader13id.Id != null)
			{
				names.push(retrievedreq.arup_GroupLeader13id.Name);
				ids.push(retrievedreq.arup_GroupLeader13id.Id);
			}
			if (retrievedreq.arup_GroupLeader14id.Id != null)
			{
				names.push(retrievedreq.arup_GroupLeader14id.Name);
				ids.push(retrievedreq.arup_GroupLeader14id.Id);
			}
			if (retrievedreq.arup_GroupLeader15id.Id != null)
			{
				names.push(retrievedreq.arup_GroupLeader15id.Name);
				ids.push(retrievedreq.arup_GroupLeader15id.Id);
			}
			if (retrievedreq.arup_GroupLeader16id.Id != null)
			{
				names.push(retrievedreq.arup_GroupLeader16id.Name);
				ids.push(retrievedreq.arup_GroupLeader16id.Id);
			}
			if (retrievedreq.arup_GroupLeader17id.Id != null)
			{
				names.push(retrievedreq.arup_GroupLeader17id.Name);
				ids.push(retrievedreq.arup_GroupLeader17id.Id);
			}
			if (retrievedreq.arup_GroupLeader18id.Id != null)
			{
				names.push(retrievedreq.arup_GroupLeader18id.Name);
				ids.push(retrievedreq.arup_GroupLeader18id.Id);
			}
			if (retrievedreq.arup_GroupLeader19id.Id != null)
			{
				names.push(retrievedreq.arup_GroupLeader19id.Name);
				ids.push(retrievedreq.arup_GroupLeader19id.Id);
			}
			if (retrievedreq.arup_GroupLeader20id.Id != null)
			{
				names.push(retrievedreq.arup_GroupLeader20id.Name);
				ids.push(retrievedreq.arup_GroupLeader20id.Id);
			}
		}
	},
	errorHandler,
	false);
	output.Names = names.filter(function (e)
	{
		return e
	});
	output.Ids = ids.filter(function (e)
	{
		return e
	});
	return output;
}

function getAccountingCentreApprovers(acccenid, companyid)
{
	var LoggedUser = Xrm.Page.context.getUserId();
	var check1 = -1;
	var check2 = -1;
	LoggedUser = LoggedUser.replace('{', '');
	LoggedUser = LoggedUser.replace('}', '');
	LoggedUser = LoggedUser.toLowerCase();
	var outputAccCentre = new Object();
	var outputCompany = new Object();
	outputAccCentre = getAccCenApprovers(acccenid);
	if (outputAccCentre != null)
	{
		if (outputAccCentre.Ids != '')
		{
			check1 = $.inArray(LoggedUser, outputAccCentre.Ids);
			if (check1 == -1)
			{
				return false;
			}
			else
			{
				return true;
			}
		}
	}
	outputCompany = getFinanceApproverForCompany(companyid);
	if (outputCompany != null)
	{
		check2 = $.inArray(LoggedUser, outputCompany.Ids);
		if (check2 == -1)
		{
			return false;
		}
		else
		{
			return true;
		}
	}
	return false;
}

function getAccCenApprovers(acccenid)
{
	var output = new Object();
	var names = new Array();
	var ids = new Array();
	SDK.REST.retrieveRecord(acccenid, "Ccrm_arupaccountingcode", 'ccrm_accountingcentreleaderid,ccrm_accountingcentredelegate1_userid,ccrm_accountingcentredelegate2_userid,ccrm_accountingcentredelegate3_userid,ccrm_accountingcentredelegate4_userid,' +
		'arup_accountingcentredelegate5_userid,arup_accountingcentredelegate6_userid,arup_accountingcentredelegate7_userid,arup_accountingcentredelegate8_userid,arup_accountingcentredelegate9_userid,arup_accountingcentredelegate10_userid,' +
		'arup_accountingcentredelegate11_userid,arup_accountingcentredelegate12_userid,arup_accountingcentredelegate13_userid,arup_accountingcentredelegate14_userid,arup_accountingcentredelegate15_userid,arup_accountingcentredelegate16_userid,' +
		'arup_accountingcentredelegate17_userid,arup_accountingcentredelegate18_userid,arup_accountingcentredelegate19_userid,arup_accountingcentredelegate20_userid', null,

	function (retrievedreq)
	{
		if (retrievedreq != null)
		{
			// accounting centre delegates
			if (retrievedreq.ccrm_accountingcentreleaderid.Id != null)
			{
				names.push(retrievedreq.ccrm_accountingcentreleaderid.Name);
				ids.push(retrievedreq.ccrm_accountingcentreleaderid.Id);
			}
			if (retrievedreq.ccrm_accountingcentredelegate1_userid.Id != null)
			{
				names.push(retrievedreq.ccrm_accountingcentredelegate1_userid.Name);
				ids.push(retrievedreq.ccrm_accountingcentredelegate1_userid.Id);
			}
			if (retrievedreq.ccrm_accountingcentredelegate2_userid.Id != null)
			{
				names.push(retrievedreq.ccrm_accountingcentredelegate2_userid.Name);
				ids.push(retrievedreq.ccrm_accountingcentredelegate2_userid.Id);
			}
			if (retrievedreq.ccrm_accountingcentredelegate3_userid.Id != null)
			{
				names.push(retrievedreq.ccrm_accountingcentredelegate3_userid.Name);
				ids.push(retrievedreq.ccrm_accountingcentredelegate3_userid.Id);
			}
			if (retrievedreq.ccrm_accountingcentredelegate4_userid.Id != null)
			{
				names.push(retrievedreq.ccrm_accountingcentredelegate4_userid.Name);
				ids.push(retrievedreq.ccrm_accountingcentredelegate4_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate5_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate5_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate5_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate6_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate6_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate6_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate7_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate7_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate7_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate8_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate8_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate8_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate9_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate9_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate9_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate10_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate10_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate10_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate11_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate11_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate11_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate12_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate12_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate12_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate13_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate13_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate13_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate14_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate14_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate14_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate15_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate15_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate15_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate16_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate16_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate16_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate17_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate17_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate17_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate18_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate18_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate18_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate19_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate19_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate19_userid.Id);
			}
			if (retrievedreq.arup_accountingcentredelegate20_userid.Id != null)
			{
				names.push(retrievedreq.arup_accountingcentredelegate20_userid.Name);
				ids.push(retrievedreq.arup_accountingcentredelegate20_userid.Id);
			}
		}
	}, errorHandler, false);
	if (names == '' && ids == '')
	{
		return null;
	}
	output.Names = names.filter(function (e)
	{
		return e !== null;
	});
	output.Ids = ids.filter(function (e)
	{
		return e !== null;
	});
	return output;
}

function getFinanceApprovers(acccenid, companyid)
{
	var LoggedUser = Xrm.Page.context.getUserId();
	LoggedUser = LoggedUser.replace('{', '');
	LoggedUser = LoggedUser.replace('}', '');
	LoggedUser = LoggedUser.toLowerCase();
	var outputAccCentre = new Object();
	var outputCompany = new Object();
	outputAccCentre = getFinanceApproverForAccCentre(acccenid);
	outputCompany = getFinanceApproverForCompany(companyid);
	//if (output.Names.length < 1) output = getFinanceApproverForCompany(companyid);
	var check1 = $.inArray(LoggedUser, outputAccCentre.Ids);
	var check2 = $.inArray(LoggedUser, outputCompany.Ids);
	if ((check1 > -1) || (check2 > -1))
	{
		return true;
	}
	else
	{
		return false;
	}
	//return output;
}

function getFinanceApproverForAccCentre(acccenid)
{
	var output = new Object();
	var names = new Array();
	var ids = new Array();
	SDK.REST.retrieveRecord(acccenid,
		"Ccrm_arupaccountingcode",
		'Ccrm_financialapprover1_userid,Ccrm_financialapprover2_userid,Ccrm_financialapprover3_userid,Ccrm_financialapprover4_userid,arup_FinancialApprover5_userid,arup_FinancialApprover6_userid,arup_FinancialApprover7_userid,' +
		'arup_FinancialApprover8_userid,arup_FinancialApprover9_userid,arup_FinancialApprover10_userid,arup_FinancialApprover11_userid,arup_FinancialApprover12_userid,arup_FinancialApprover13_userid,arup_FinancialApprover14_userid,' +
		'arup_FinancialApprover15_userid,arup_FinancialApprover16_userid,arup_FinancialApprover17_userid,arup_FinancialApprover18_userid,arup_FinancialApprover19_userid,arup_FinancialApprover20_userid', null,

	function (retrievedreq)
	{
		if (retrievedreq != null)
		{
			if (retrievedreq.Ccrm_financialapprover1_userid.Id != null)
			{
				names.push(retrievedreq.Ccrm_financialapprover1_userid.Name);
				ids.push(retrievedreq.Ccrm_financialapprover1_userid.Id);
			}
			if (retrievedreq.Ccrm_financialapprover2_userid.Id != null)
			{
				names.push(retrievedreq.Ccrm_financialapprover2_userid.Name);
				ids.push(retrievedreq.Ccrm_financialapprover2_userid.Id);
			}
			if (retrievedreq.Ccrm_financialapprover3_userid.Id != null)
			{
				names.push(retrievedreq.Ccrm_financialapprover3_userid.Name);
				ids.push(retrievedreq.Ccrm_financialapprover3_userid.Id);
			}
			if (retrievedreq.Ccrm_financialapprover4_userid.Id != null)
			{
				names.push(retrievedreq.Ccrm_financialapprover4_userid.Name);
				ids.push(retrievedreq.Ccrm_financialapprover4_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover5_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover5_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover5_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover6_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover6_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover6_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover7_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover7_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover7_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover8_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover8_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover8_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover9_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover9_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover9_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover10_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover10_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover10_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover11_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover11_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover11_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover12_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover12_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover12_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover13_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover13_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover13_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover14_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover14_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover14_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover15_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover15_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover15_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover16_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover16_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover16_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover17_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover17_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover17_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover18_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover18_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover18_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover19_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover19_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover19_userid.Id);
			}
			if (retrievedreq.arup_FinancialApprover20_userid.Id != null)
			{
				names.push(retrievedreq.arup_FinancialApprover20_userid.Name);
				ids.push(retrievedreq.arup_FinancialApprover20_userid.Id);
			}
		}
	},
	errorHandler,
	false);
	output.Names = names.filter(function (e)
	{
		return e
	});
	output.Ids = ids.filter(function (e)
	{
		return e
	});
	return output;
}

function getFinanceApproverForCompany(companyid)
{
	var output = new Object();
	var names = new Array();
	var ids = new Array();
	SDK.REST.retrieveRecord(companyid,
		"Ccrm_arupcompany",
		'ccrm_financialapprover1_userid,ccrm_financialapprover2_userid,ccrm_financialapprover3_userid,ccrm_financialapprover4_userid,ccrm_financialapprover5_userid,ccrm_financialapprover6_userid,ccrm_financialapprover7_userid,ccrm_financialapprover8_userid,ccrm_financialapprover9_userid,ccrm_financialapprover10_userid,ccrm_financialapprover11_userid,ccrm_financialapprover12_userid',
	null,

	function (retrievedreq)
	{
		if (retrievedreq != null)
		{
			names.push(retrievedreq.ccrm_financialapprover1_userid.Name);
			ids.push(retrievedreq.ccrm_financialapprover1_userid.Id);
			names.push(retrievedreq.ccrm_financialapprover2_userid.Name);
			ids.push(retrievedreq.ccrm_financialapprover2_userid.Id);
			names.push(retrievedreq.ccrm_financialapprover3_userid.Name);
			ids.push(retrievedreq.ccrm_financialapprover3_userid.Id);
			names.push(retrievedreq.ccrm_financialapprover4_userid.Name);
			ids.push(retrievedreq.ccrm_financialapprover4_userid.Id);
			names.push(retrievedreq.ccrm_financialapprover5_userid.Name);
			ids.push(retrievedreq.ccrm_financialapprover5_userid.Id);
			names.push(retrievedreq.ccrm_financialapprover6_userid.Name);
			ids.push(retrievedreq.ccrm_financialapprover6_userid.Id);
			names.push(retrievedreq.ccrm_financialapprover7_userid.Name);
			ids.push(retrievedreq.ccrm_financialapprover7_userid.Id);
			names.push(retrievedreq.ccrm_financialapprover8_userid.Name);
			ids.push(retrievedreq.ccrm_financialapprover8_userid.Id);
			names.push(retrievedreq.ccrm_financialapprover9_userid.Name);
			ids.push(retrievedreq.ccrm_financialapprover9_userid.Id);
			names.push(retrievedreq.ccrm_financialapprover10_userid.Name);
			ids.push(retrievedreq.ccrm_financialapprover10_userid.Id);
			names.push(retrievedreq.ccrm_financialapprover11_userid.Name);
			ids.push(retrievedreq.ccrm_financialapprover11_userid.Id);
			names.push(retrievedreq.ccrm_financialapprover12_userid.Name);
			ids.push(retrievedreq.ccrm_financialapprover12_userid.Id);
		}
	},
	errorHandler,
	false);
	output.Names = names.filter(function (e)
	{
		return e
	});
	output.Ids = ids.filter(function (e)
	{
		return e
	});
	return output;
}

function UserNameCheck(fullName)
{
	var result = true;
	SDK.REST.retrieveMultipleRecords("SystemUser",
		"$select=FullName&$filter=FullName eq '" + fullName + "'",

	function (results)
	{
		if (results.length > 1)
		{
			result = false;
		}
	},
	errorHandler,

	function ()
	{},
	false);
	return result;
}

function ValidateApproval(msg, approvaltype)
{
	var output = new Object();
	output.differentUser = false;
	output.result = true;
	output.approverIDs = new Array();
	switch (approvaltype)
	{
		case 'ProjectManagerApproval':
			var approvers = new Array();
			approvers.push(Xrm.Page.getAttribute('ccrm_projectmanager_userid').getValue()[0].name);
			output.approverIDs.push(Xrm.Page.getAttribute('ccrm_projectmanager_userid').getValue()[0].id);
			approvers.push(Xrm.Page.getAttribute('ccrm_projectdirector_userid').getValue()[0].name);
			output.approverIDs.push(Xrm.Page.getAttribute('ccrm_projectdirector_userid').getValue()[0].id);
			if (approvers.indexOf(currUserData.FullName) < 0)
			{ /*output.result = confirm(msg);*/
				output.differentUser = true;
			}
			else output.differentUser = false;
			break;
		case 'GroupLeaderApproval':
		case 'GroupLeader':
			var tmp = getGroupLeaderApprovers(Xrm.Page.getAttribute("ccrm_arupgroupid").getValue()[0].id, Xrm.Page.getAttribute('ccrm_arupcompanyid').getValue()[0].id);
			return tmp;
			break;
		case 'AccCenterLeadApproval':
			// limit this approval to Group Leader or nominated delegates or approvers for the relevant Arup company
			var groupLeaderApprovalNeeded = checkGroupLeaderApprovalNeeded();
			if (groupLeaderApprovalNeeded == true)
			{
				var temp = getGroupLeaderApprovers(Xrm.Page.getAttribute("ccrm_arupgroupid").getValue()[0].id, Xrm.Page.getAttribute('ccrm_arupcompanyid').getValue()[0].id);
				return temp;
			}
			var tmp = getAccountingCentreApprovers(Xrm.Page.getAttribute('ccrm_accountingcentreid').getValue()[0].id, Xrm.Page.getAttribute('ccrm_arupcompanyid').getValue()[0].id);
			return tmp;
			break;
		case 'FinanceApproval':
			var tmp = getFinanceApprovers(Xrm.Page.getAttribute('ccrm_accountingcentreid').getValue()[0].id, Xrm.Page.getAttribute('ccrm_arupcompanyid').getValue()[0].id);
			return tmp;
		case 'BidDirector':
			var approver = Xrm.Page.getAttribute('ccrm_biddirector_userid').getValue()[0].name;
			output.approverIDs.push(Xrm.Page.getAttribute('ccrm_biddirector_userid').getValue()[0].id);
			if (currUserData.FullName != approver)
			{ /*output.result = confirm(msg);*/
				output.differentUser = true;
			}
			else output.differentUser = false;
			break;
		case 'PracticeLeader':
		case 'RegionalPracticeLeader':
			if (Xrm.Page.getAttribute('ccrm_practiceleaderid').getValue() == null)
			{
				output.differentUser = true
			}
			else
			{
				var tmp = getApproverName(Xrm.Page.getAttribute('ccrm_practiceleaderid').getValue()[0].id, 'Ccrm_practiceleader', 'ccrm_practiceleaderidnew');
				if (currUserData.FullName != tmp.Name)
				{
					output.approverIDs.push(tmp.Id); /*output.result = confirm(msg);*/
					output.differentUser = true;
				}
				else output.differentUser = false;
			}
			break;
		case 'RegionalCOO':
			var tmp = getApproverName(Xrm.Page.getAttribute('ccrm_arupregionid').getValue()[0].id, 'Ccrm_arupregion', 'ccrm_chiefoperatingofficerid');
			if (currUserData.FullName != tmp.Name)
			{
				output.approverIDs.push(tmp.Id); /*output.result = confirm(msg);*/
				output.differentUser = true;
			}
			else output.differentUser = false;
			break;
	}
	if (output.differentUser)
	{
		//output.result = confirm(msg);
		var strNoLongerRequired = "1";
		if (Xrm.Page.getAttribute('ccrm_approvalnolongerrequired').getValue() != "" && Xrm.Page.getAttribute('ccrm_approvalnolongerrequired').getValue() != null) strNoLongerRequired = strNoLongerRequired + "1";
		Xrm.Page.getAttribute('ccrm_approvalnolongerrequired').setValue(strNoLongerRequired);
		Xrm.Page.getAttribute('ccrm_approvalnolongerrequired').setSubmitMode("always");
	}
	return output;
}

function checkGroupLeaderApprovalNeeded()
{
	// check Risk Level & Region of the Opportunity for this approval type
	var opportunityRegion = Xrm.Page.getAttribute("ccrm_arupregionid").getValue();
	var opportunityRiskLevel = Xrm.Page.getAttribute("ccrm_opportunitytype").getValue();
	if ( !! opportunityRegion && !! opportunityRiskLevel)
	{
		//Australasia-Risk Level 3 or East Asia region-all risk levels
		if (
		(
		(opportunityRegion[0].name.toLowerCase() == (ArupRegionName.Australasia).toLowerCase() || opportunityRegion[0].name.toLowerCase() == (ArupRegionName.Malaysia).toLowerCase()) && opportunityRiskLevel == BidRiskLevels.Level3) || (opportunityRegion[0].name.toLowerCase() == (ArupRegionName.EastAsia).toLowerCase()))
		{
			return true;
		}
		else return false;
	}
}

function ValidateApprovalIDs(msg, approvaltype)
{
	var output = new Object();
	output.differentUser = false;
	output.result = true;
	var LoggedUser = Xrm.Page.context.getUserId();
	if (Xrm.Page.getAttribute('arup_approverleader').getValue() != null)
	{
		if (Xrm.Page.getAttribute('arup_approverleader').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('ccrm_approver1').getValue() != null)
	{
		if (Xrm.Page.getAttribute('ccrm_approver1').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('ccrm_approver2').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('ccrm_approver2').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('ccrm_approver3').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('ccrm_approver3').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('ccrm_approver4').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('ccrm_approver4').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('ccrm_approver5').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('ccrm_approver5').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('ccrm_approver6').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('ccrm_approver6').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('arup_approver7').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('arup_approver7').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('arup_approver8').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('arup_approver8').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('arup_approver9').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('arup_approver9').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('arup_approver10').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('arup_approver10').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('arup_approver11').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('arup_approver11').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('arup_approver12').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('arup_approver12').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('arup_approver13').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('arup_approver13').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('arup_approver14').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('arup_approver14').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('arup_approver15').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('arup_approver15').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('arup_approver16').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('arup_approver16').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('arup_approver17').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('arup_approver17').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('arup_approver18').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('arup_approver18').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('arup_approver19').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('arup_approver19').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (Xrm.Page.getAttribute('arup_approver20').getValue() != null && output.differentUser)
	{
		if (Xrm.Page.getAttribute('arup_approver20').getValue()[0].id != LoggedUser) output.differentUser = true;
		else output.differentUser = false;
	}
	if (output.differentUser)
	{
		output.result = confirm(msg);
		var strNoLongerRequired = "1";
		if (Xrm.Page.getAttribute('ccrm_approvalnolongerrequired').getValue() != "" && Xrm.Page.getAttribute('ccrm_approvalnolongerrequired').getValue() != null) strNoLongerRequired = strNoLongerRequired + "1";
		Xrm.Page.getAttribute('ccrm_approvalnolongerrequired').setValue(strNoLongerRequired);
		Xrm.Page.getAttribute('ccrm_approvalnolongerrequired').setSubmitMode("always");
	}
	return output;
}

function resetApprovers()
{}

function SetApproverID(approverIDs)
{
	var i = 1;
	var field = '';
	approverIDs.forEach(function (approverID)
	{
		field = 'ccrm_approver' + i;
		SetLookupField(approverID, '', 'systemuser', field);
		Xrm.Page.getAttribute(field).setSubmitMode("always");
		i++;
	});
}
// Ribbon Approval Btn click events 

function ApprovalButtonClick(type, approvalType, statusField, userField, dateField)
{
	var ackMsg = ApprovalConfirmationMessage(approvalType);
	var alertType;
	if (IsFormValid())
	{
		switch (approvalType)
		{
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
			'<font size="3" color="#000000"></br></br>' + ackMsg + '</font>', [
		{
			label: "<b>Proceed with Approval</b>",
			callback: function ()
			{
				var msg = 'You are about to approve a Bid where you are not listed as approver. \n Do you want to Continue ?';
				var output = ValidateApproval(msg, approvalType);
				approveCallbackAction(approvalType);
				cancelAsnycApprovalNotification();
				Xrm.Page.ui.clearFormNotification('CurrentApprovers');
				setCurrentApproversAsync();
				if (currUserData.caltype != 2)
				{
					if (MoveToBidDevelopment())
					{
						moveToNextTrigger = true;
					}
				}
				// Xrm.Page.data.save().then(function () {
				// Xrm.Page.getAttribute(statusField).setSubmitMode("dirty");
				// Xrm.Page.getAttribute("ccrm_currentapprovers").setSubmitMode("dirty");
				// });						
			},
			setFocus: false,
			preventClose: false},
		{
			label: "<b>Do Not Approve</b>",
			setFocus: true,
			preventClose: false}
            ],
		alertType, 500, 350, '', true);
	}
}

function isApproved(statusField)
{
	if (Xrm.Page.getAttribute(statusField).getValue() == '100000001') return true;
	else return false;
}

function MoveToBidDevelopment(approveonRiskChange)
{
	var result = false;
	var bidDirectorApproved = false,
		grpLeaderApproved = false,
		pracLeaderApproved = false,
		regcooApproved = false,
		regPracLeadApproval = false;
	if (isApproved('ccrm_biddirectorapprovaloptions')) bidDirectorApproved = true;
	if (isApproved('ccrm_groupleaderapprovaloptions')) grpLeaderApproved = true;
	if (isApproved('ccrm_practiceleaderapprovaloptions')) pracLeaderApproved = true;
	if (isApproved('ccrm_regioncooapprovaloptions')) regcooApproved = true;
	var regionName, oppType;
	oppType = Xrm.Page.getAttribute("ccrm_opportunitytype").getValue();
	if (Xrm.Page.getAttribute("ccrm_arupregionid").getValue() != null) regionName = Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name;
	if (regionName == ArupRegionName.EastAsia)
	{
		if ((oppType == BidRiskLevels.Level1 && bidDirectorApproved) || (oppType == BidRiskLevels.Level1 && approveonRiskChange))
		{
			if (approveonRiskChange)
			{
				if (Xrm.Page.getAttribute('ccrm_biddirectorapprovaloptions').getValue() != '100000001')
				{
					Xrm.Page.getAttribute('ccrm_biddirectorapprovaloptions').setValue('100000001');
					Xrm.Page.getAttribute("ccrm_biddirectorapprovaloptions").setSubmitMode("always");
					setTimeout(function ()
					{
						Xrm.Page.data.entity.save(null);
					}, 500);
				}
			}
			result = true;
		}
		if (((oppType == BidRiskLevels.Level2 || oppType == BidRiskLevels.Level3) && grpLeaderApproved) || ((oppType == BidRiskLevels.Level2 || oppType == BidRiskLevels.Level3) && approveonRiskChange))
		{
			if (approveonRiskChange)
			{
				if (Xrm.Page.getAttribute('ccrm_groupleaderapprovaloptions').getValue() != '100000001')
				{
					Xrm.Page.getAttribute('ccrm_groupleaderapprovaloptions').setValue('100000001');
					Xrm.Page.getAttribute("ccrm_groupleaderapprovaloptions").setSubmitMode("always");
					setTimeout(function ()
					{
						Xrm.Page.data.entity.save(null);
					}, 500);
				}
			}
			result = true;
		}
	}
	else if (regionName == ArupRegionName.Australasia || regionName == ArupRegionName.Malaysia)
	{
		if (oppType == BidRiskLevels.Level1 && grpLeaderApproved)
		{
			result = true;
		}
		if ((oppType == BidRiskLevels.Level2 && pracLeaderApproved) || (oppType == BidRiskLevels.Level2 && approveonRiskChange))
		{
			if (approveonRiskChange)
			{
				var triggerSave = false;
				if (Xrm.Page.getAttribute('ccrm_practiceleaderapprovaloptions').getValue() != '100000001')
				{
					Xrm.Page.getAttribute('ccrm_practiceleaderapprovaloptions').setValue('100000001');
					Xrm.Page.getAttribute("ccrm_practiceleaderapprovaloptions").setSubmitMode("always");
					triggerSave = true;
				}
				if (triggerSave) setTimeout(function ()
				{
					Xrm.Page.data.entity.save(null);
				}, 500);
			}
			result = true;
		}
		if ((oppType == BidRiskLevels.Level3 && regcooApproved) || (oppType == BidRiskLevels.Level3 && approveonRiskChange))
		{
			if (approveonRiskChange)
			{
				var triggerSave = false;
				if (Xrm.Page.getAttribute('ccrm_regionalpracticeleaderapprovaloptions').getValue() != '100000001')
				{
					Xrm.Page.getAttribute('ccrm_regionalpracticeleaderapprovaloptions').setValue('100000001');
					Xrm.Page.getAttribute("ccrm_regionalpracticeleaderapprovaloptions").setSubmitMode("always");
					triggerSave = true;
				}
				if (Xrm.Page.getAttribute('ccrm_regioncooapprovaloptions').getValue() != '100000001')
				{
					Xrm.Page.getAttribute('ccrm_regioncooapprovaloptions').setValue('100000001');
					Xrm.Page.getAttribute("ccrm_regioncooapprovaloptions").setSubmitMode("always");
					triggerSave = true;
				}
				if (triggerSave) setTimeout(function ()
				{
					Xrm.Page.data.entity.save(null);
				}, 500);
			}
			result = true;
		}
	}
	else
	{
		result = true;
	}
	return result;
}
// ON CHANGE FUNCTIONS
// FINANCIAL ON CHANGE

function ccrm_confidential_onchange(mode)
{
	var isConfidential;
	switch (mode)
	{
		case 0:
			isConfidential = (Xrm.Page.getAttribute("ccrm_confidentialoptionset").getValue() == 1 ? true : false);
			break;
		case 1:
			isConfidential = (Xrm.Page.getAttribute("ccrm_confidentialoptionset").getValue() == 1 ? true : false);
			if ((isConfidential && !Xrm.Page.getAttribute("ccrm_confidential").getValue()) || (!isConfidential && Xrm.Page.getAttribute("ccrm_confidential").getValue()))
			{
				Xrm.Page.getAttribute("ccrm_confidential").setValue(isConfidential);
			}
			break;
		case 2:
			isConfidential = (Xrm.Page.getAttribute("ccrm_confidential").getValue());
			if (isConfidential && Xrm.Page.getAttribute("ccrm_confidentialoptionset").getValue() != 1)
			{
				Xrm.Page.getAttribute("ccrm_confidentialoptionset").setValue(1);
			}
			else if (!isConfidential && Xrm.Page.getAttribute("ccrm_confidentialoptionset").getValue() == 1)
			{
				Xrm.Page.getAttribute("ccrm_confidentialoptionset").setValue(2);
			}
			break;
	}
    if (isConfidential)
	{
        var timeout = 3000;
    
        if (mode != 0)
        {
            timeout = 1;
            Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                '<font size="3" color="#000000"></br>Does this opportunity definitely need to be marked as confidential?</br></br>Only use the confidential status if Arup has to keep its involvement in this opportunity confidential to external parties.</br></br></b>Confidential opportunities are reported to your Region’s COO and may not appear in Arup Projects, or reports about future workload in your Practice, Group or Business.</font>', 
                [
            {
                label: "<b>Got it</b>",
                setFocus: true},
                ],
                "WARNING", 600, 380, '', true);
        }
        setTimeout(function ()
			{
				Notify.add("Confidential Opportunity", "INFO", "confidentialopp", null, -1, "#F50B1C", " #ffffff");
			}, timeout);        
	}
	else
	{
		Notify.remove("confidentialopp");
	}
	
}

function ccrm_estimatedvalue_num_onchange()
{
	feeIncomeCheck();
	if (Xrm.Page.getAttribute('ccrm_estimatedvalue_num').getValue() != null)
	{
		calcRecalcIncome();
	}
}

function ccrm_estexpenseincome_num_onchange()
{
	calcRecalcIncome();
}

function closeprobability_onchange()
{
	sync_values_onchange('closeprobability', 'ccrm_closeprobability_synced');
	calcRecalcIncome();
	calcRecalcCosts();
}

function ccrm_probabilityofprojectproceeding_onchange()
{
	calcRecalcIncome();
	calcRecalcCosts();
}

function ccrm_estprojectresourcecosts_num_onchange()
{
	calcRecalcCosts();
}

function ccrm_estprojectsubcontractorfees_num_onchange()
{
	var expenses = Xrm.Page.getAttribute("arup_expenses_num").getValue();
	var subConFees = Xrm.Page.getAttribute("ccrm_estprojectsubcontractorfees_num").getValue();
	var contingency = Xrm.Page.getAttribute("ccrm_contingency").getValue();
	var grossExpenses = expenses + subConFees + contingency;
	Xrm.Page.getAttribute("ccrm_estprojectexpenses_num").setValue(grossExpenses);
	Xrm.Page.getAttribute("ccrm_estprojectexpenses_num").setSubmitMode("always");
	calcRecalcCosts();
}

function ccrm_contingency_onchange()
{
	var expenses = Xrm.Page.getAttribute("arup_expenses_num").getValue();
	var subConFees = Xrm.Page.getAttribute("ccrm_estprojectsubcontractorfees_num").getValue();
	var contingency = Xrm.Page.getAttribute("ccrm_contingency").getValue();
	var grossExpenses = expenses + subConFees + contingency;
	Xrm.Page.getAttribute("ccrm_estprojectexpenses_num").setValue(grossExpenses);
	Xrm.Page.getAttribute("ccrm_estprojectexpenses_num").setSubmitMode("always");
	calcRecalcCosts();
}

function ccrm_estprojectstaffoverheadsrate_onchange()
{
	calcRecalcCosts();
}

function ccrm_anticipatedprojectcashflow_num_onchange()
{
	calcMaxCashFlowDeficit();
}

function arup_expenses_num_onchange()
{
	var expenses = Xrm.Page.getAttribute("arup_expenses_num").getValue();
	var subConFees = Xrm.Page.getAttribute("ccrm_estprojectsubcontractorfees_num").getValue();
	var contingency = Xrm.Page.getAttribute("ccrm_contingency").getValue();
	var grossExpenses = expenses + subConFees + contingency;
	Xrm.Page.getAttribute("ccrm_estprojectexpenses_num").setValue(grossExpenses);
	Xrm.Page.getAttribute("ccrm_estprojectexpenses_num").setSubmitMode("always");
	calcRecalcCosts();
}

function ccrm_estprojectexpenses_num_onchange()
{
	calcRecalcCosts();
} /*****/
//FINANCIAL FUNCTIONS
//function to calculate income and associated fields if an income related field changes

function calcRecalcIncome()
{
	calcTotalIncome();
	calcFactoredIncome(); // sets - "ccrm_proj_factoredincome_num"
	calcEstProjectProfit();
	// sets - "ccrm_estprojectprofit_num", "ccrm_profitasapercentageoffeedec", "ccrm_proj_factoredprofit_num"
	calcFactoredNetReturnToArup(); // sets - "ccrm_factorednetreturntoarup_num"
}

function calcRecalcCosts()
{
	calcEstProjStaffOverheadsValue(); // sets - "ccrm_estprojectoverheads_num"
	calcTotalCosts(); // sets - "ccrm_projecttotalcosts_num"
	calcEstProjectProfit(); // sets - "ccrm_proj_factoredincome_num"
	calcFactoredNetReturnToArup(); // sets - "ccrm_factorednetreturntoarup_num"
}

function calcTotalCosts()
{
	var salaryCosts = Xrm.Page.getAttribute("ccrm_estprojectresourcecosts_num").getValue();
	var staffOverheads = Xrm.Page.getAttribute("ccrm_estprojectoverheads_num").getValue();
	var grossExpenses = Xrm.Page.getAttribute("ccrm_estprojectexpenses_num").getValue();
	//var contingency = Xrm.Page.getAttribute("ccrm_contingency").getValue();
	if (salaryCosts == null) salaryCosts = 0;
	if (staffOverheads == null) staffOverheads = 0;
	if (grossExpenses == null) grossExpenses = 0;
	//if (contingency == null) contingency = 0;
	//var totalCosts = salaryCosts + staffOverheads + grossExpenses + contingency;
	var totalCosts = salaryCosts + staffOverheads + grossExpenses;
	Xrm.Page.getAttribute("ccrm_projecttotalcosts_num").setValue(totalCosts);
	Xrm.Page.getAttribute("ccrm_projecttotalcosts_num").setSubmitMode("always");
}

function calcBidCosts()
{
	var salaryCosts = Xrm.Page.getAttribute("ccrm_salarycost_num").getValue();
	var staffOverheads = Xrm.Page.getAttribute("ccrm_staffoverheadspercent").getValue() / 100;
	var grossExpenses = Xrm.Page.getAttribute("ccrm_grossexpenses_num").getValue();
	if (salaryCosts == null) salaryCosts = 0;
	if (staffOverheads == null) staffOverheads = 0;
	if (grossExpenses == null) grossExpenses = 0;
	var totalCosts = salaryCosts + (salaryCosts * staffOverheads) + grossExpenses;
	Xrm.Page.getAttribute("ccrm_staffoverheads_num").setValue(salaryCosts * staffOverheads);
	Xrm.Page.getAttribute("ccrm_totalbidcost_num").setValue(totalCosts);
	Xrm.Page.getAttribute("ccrm_staffoverheads_num").setSubmitMode("always");
	Xrm.Page.getAttribute("ccrm_totalbidcost_num").setSubmitMode("always");
	calcFactoredNetReturnToArup();
}
//function to calculate ProfitAsPercentageFee

function calcEstProjectProfit()
{
	var totalEstProjectProfit = 0;
	var Projectfee = Xrm.Page.getAttribute("ccrm_estimatedvalue_num").getValue();
	var ResourceCost = Xrm.Page.getAttribute("ccrm_estprojectresourcecosts_num").getValue();
	var Expenses = Xrm.Page.getAttribute("ccrm_estprojectexpenses_num").getValue();
	var SubContractorFee = Xrm.Page.getAttribute("ccrm_estprojectsubcontractorfees_num").getValue();
	var StaffOverheads = Xrm.Page.getAttribute("ccrm_estprojectoverheads_num").getValue();
	var ProjectForecastExpenseIncome = Xrm.Page.getAttribute("ccrm_estexpenseincome_num").getValue();
	var result = Xrm.Page.getAttribute("ccrm_estprojectprofit_num").getValue();
	totalEstProjectProfit = (Projectfee + ProjectForecastExpenseIncome - (ResourceCost + StaffOverheads + Expenses));
	Xrm.Page.getAttribute("ccrm_estprojectprofit_num").setValue(totalEstProjectProfit);
	Xrm.Page.getAttribute("ccrm_estprojectprofit_num").setSubmitMode("always");
	calcProfitAsPercentageFee(totalEstProjectProfit, Projectfee, ProjectForecastExpenseIncome);
}
//function to calculate the profit as a percentage of Fee

function calcProfitAsPercentageFee(totalEstProjectProfit, projectFee, expIncome)
{
	var result = 0;
	// check if the field is present in the form
	if ((projectFee > 0) || (expIncome > 0))
	{ // Do the calculation
		result = ((totalEstProjectProfit * 100) / (projectFee + expIncome));
	}
	//set the result value
	Xrm.Page.getAttribute("ccrm_profitasapercentageoffeedec").setValue(result);
	Xrm.Page.getAttribute("ccrm_profitasapercentageoffeedec").setSubmitMode("always");
	//set the FactoredProfit
	calcFactoredProfit(result, Xrm.Page.getAttribute("ccrm_proj_factoredincome_num").getValue());
}

function calcFactoredProfit(profitAsPercentageFee, factoredIncome)
{
	var result = 0;
	if (Xrm.Page.getAttribute("ccrm_profitasapercentageoffeedec").getValue() > 0 && factoredIncome > 0)
	{
		result = Xrm.Page.getAttribute("ccrm_estprojectprofit_num").getValue() * ((Xrm.Page.getAttribute("closeprobability").getValue() / 100) * (Xrm.Page.getAttribute("ccrm_probabilityofprojectproceeding").getValue() / 100));
		Xrm.Page.getAttribute("ccrm_proj_factoredprofit_num").setValue(result);
		Xrm.Page.getAttribute("ccrm_proj_factoredprofit_num").setSubmitMode("always");
	}
	else
	{
		//set the FactoredIncome result
		Xrm.Page.getAttribute("ccrm_proj_factoredprofit_num").setValue(result);
		Xrm.Page.getAttribute("ccrm_proj_factoredprofit_num").setSubmitMode("always");
	}
}

function calcTotalIncome()
{
	var feeIncome = Xrm.Page.getAttribute("ccrm_estimatedvalue_num").getValue();
	var expenseIncome = Xrm.Page.getAttribute("ccrm_estexpenseincome_num").getValue();
	if (feeIncome == null) feeIncome = 0;
	if (expenseIncome == null) expenseIncome = 0;
	var totalIncome = feeIncome + expenseIncome;
	Xrm.Page.getAttribute("ccrm_projecttotalincome_num").setValue(totalIncome);
	Xrm.Page.getAttribute("ccrm_projecttotalincome_num").setSubmitMode("always");
}
//function to calcuate Factored Income

function calcFactoredIncome()
{
	var estimatedValue_num = Xrm.Page.getAttribute("ccrm_projecttotalincome_num").getValue();
	var probabilityOfProjectProceeding = Xrm.Page.getAttribute("ccrm_probabilityofprojectproceeding").getValue();
	var closeProbability = Xrm.Page.getAttribute("closeprobability").getValue();
	var result = 0;
	//check for null values
	if (estimatedValue_num == null)
	{
		estimatedValue_num = 0;
	}
	if (probabilityOfProjectProceeding == null)
	{
		probabilityOfProjectProceeding = 0;
	}
	if (closeProbability == null)
	{
		closeProbability = 0;
	}
	probabilityOfProjectProceeding = probabilityOfProjectProceeding / 100;
	closeProbability = closeProbability / 100;
	result = estimatedValue_num * probabilityOfProjectProceeding * closeProbability;
	//set the FactoredIncome result
	Xrm.Page.getAttribute("ccrm_proj_factoredincome_num").setValue(result);
	Xrm.Page.getAttribute("ccrm_proj_factoredincome_num").setSubmitMode("always");
}
//function to calculate FacturedNetReturnToArup

function calcFactoredNetReturnToArup()
{
	var ProjectFee = Xrm.Page.getAttribute("ccrm_estimatedvalue_num").getValue();
	var ProjectProcedingProb = Xrm.Page.getAttribute("ccrm_probabilityofprojectproceeding").getValue();
	var ProbWin = Xrm.Page.getAttribute("closeprobability").getValue();
	var profitAsPercentOfFee = Xrm.Page.getAttribute("ccrm_profitasapercentageoffeedec").getValue();
	var totalIncome = Xrm.Page.getAttribute("ccrm_projecttotalincome_num").getValue();
	var totalBidCost = Xrm.Page.getAttribute("ccrm_totalbidcost_num").getValue();
	var totalProfit = Xrm.Page.getAttribute("ccrm_estprojectprofit_num").getValue();
	var result = 0
	if (ProjectProcedingProb != null && ProbWin != null && profitAsPercentOfFee != null && totalIncome) result = totalProfit * (ProjectProcedingProb / 100) * (ProbWin / 100);
	Xrm.Page.getAttribute("ccrm_factorednetreturntoarup_num").setValue(result);
	Xrm.Page.getAttribute("ccrm_factorednetreturntoarup_num").setSubmitMode("always");
	if (totalBidCost != null && totalBidCost != 0)
	{
		Xrm.Page.getAttribute("ccrm_ratfactnetreturntoarupnetarupbidcost_num").setValue(result / totalBidCost);
	}
	else
	{
		Xrm.Page.getAttribute("ccrm_ratfactnetreturntoarupnetarupbidcost_num").setValue(0);
	}
	Xrm.Page.getAttribute("ccrm_ratfactnetreturntoarupnetarupbidcost_num").setSubmitMode("always");
	Xrm.Page.getAttribute("ccrm_ratfactnetreturntoarupnetarupbidcost_num").fireOnChange();
}

function calcEstProjStaffOverheadsValue()
{
	var salary = Xrm.Page.getAttribute("ccrm_estprojectresourcecosts_num").getValue();
	var staffoverheadspercent = Xrm.Page.getAttribute("ccrm_estprojectstaffoverheadsrate").getValue();
	var calcSOH = 0;
	if (salary > 0 && staffoverheadspercent > 0) var calcSOH = (staffoverheadspercent / 100) * salary;
	//set the value for Project Staff Overheads
	Xrm.Page.getAttribute("ccrm_estprojectoverheads_num").setValue(calcSOH);
	Xrm.Page.getAttribute("ccrm_estprojectoverheads_num").setSubmitMode("always");
}
//function to calculate the est proj Staff Overheads Rate

function calcEstProjStaffOverheadsRate()
{
	var staffoverheads = Xrm.Page.getAttribute("ccrm_estprojectoverheads_num");
	var salary = Xrm.Page.getAttribute("ccrm_estprojectresourcecosts_num");
	var result = Xrm.Page.getAttribute("ccrm_estprojectstaffoverheadsrate");
	// check if the field is present in the form
	if (salary.getValue() > 0 && staffoverheads.getValue() > 0)
	{ // Do the calculation
		var c = (staffoverheads.getValue() / salary.getValue()) * 100;
		result.setValue(c);
		Xrm.Page.getAttribute("ccrm_estprojectstaffoverheadsrate").setSubmitMode("always");
	}
	else
	{
		Xrm.Page.getAttribute("ccrm_estprojectstaffoverheadsrate").setValue(0);
		Xrm.Page.getAttribute("ccrm_estprojectstaffoverheadsrate").setSubmitMode("always");
	}
}

function calcMaxCashFlowDeficit()
{
	var cashflow = Xrm.Page.getAttribute("ccrm_anticipatedprojectcashflow_num").getValue();
	var feeIncome = Xrm.Page.getAttribute("ccrm_projecttotalincome_num").getValue();
	var calcFlowDeficitOption = Xrm.Page.getAttribute("ccrm_calccashflowdeficit").getValue();
	// Calculates 25% of Fee Income
	var calcDeficit = feeIncome * 0.25;
	if ((Math.abs(cashflow) > calcDeficit) && (cashflow != null) && (feeIncome != null) && (calcFlowDeficitOption != true))
	{
		Xrm.Page.getAttribute("ccrm_calccashflowdeficit").setValue(true);
	}
	else
	{
		if ((calcFlowDeficitOption == true) && (Math.abs(cashflow) < calcDeficit))
		{
			Xrm.Page.getAttribute("ccrm_calccashflowdeficit").setValue(false);
		}
	}
}
//Date: 30/03/2016
//Phase 1.1 - BAU Release sync from October 2015
//Enhancement to allow Fee Income as 0 when Australasia region and Procurement Type is Framework/Panel Appointment

function feeIncomeCheck()
{
	if ((Xrm.Page.getAttribute("ccrm_estimatedvalue_num").getValue() == 0) && (Xrm.Page.getAttribute("ccrm_charitablework").getValue() == true) && (Xrm.Page.getAttribute("ccrm_arupbusinessid").getValue()[0].name == 'Charity & Community'))
	{
		Xrm.Page.ui.clearFormNotification("FEEzerovalcheck");
	}
	else if ((Xrm.Page.getAttribute("ccrm_estimatedvalue_num").getValue() == 0) && (Xrm.Page.getAttribute('ccrm_arupregionid').getValue()[0].name == "Australasia Region" || Xrm.Page.getAttribute('ccrm_arupregionid').getValue()[0].name == "Malaysia Region") && (Xrm.Page.getAttribute('ccrm_contractarrangement').getValue() == 2))
	{
		Xrm.Page.ui.clearFormNotification("FEEzerovalcheck");
	}
	else
	{
		if ((Xrm.Page.getAttribute("ccrm_estimatedvalue_num").getValue() == 0))
		{
			Xrm.Page.ui.setFormNotification("The Fee Income cannot be set to 0, please update the Fee Income", "WARNING", "FEEzerovalcheck");
			Xrm.Page.getAttribute("ccrm_estimatedvalue_num").setValue(null);
		}
		else
		{
			Xrm.Page.ui.clearFormNotification("FEEzerovalcheck");
		}
	}
}

function FeeValueRisk()
{
	var FeeBase = Xrm.Page.getAttribute("ccrm_estimatedvalue_num_synced").getValue();
	var TrackC = '200003';
	var F = '5000000';
	var E = Xrm.Page.getAttribute("exchangerate").getValue();
	var R = FeeBase / E;
	if (R >= F)
	{
		ShowPickListItem("ccrm_opportunitytype", "200003");
		Xrm.Page.getAttribute("ccrm_opportunitytype").setValue(TrackC);
		Xrm.Page.data.entity.attributes.get("ccrm_opportunitytype").setSubmitMode("always");
		Xrm.Page.data.entity.attributes.get("ccrm_estimatedvalue_num_synced").setSubmitMode("always");
		Xrm.Page.data.entity.attributes.get("estimatedvalue").setSubmitMode("always");
	}
}
// GENERIC FUNCTIONS

function ShowPickListItem(listID, value)
{
	var optionsetControl = Xrm.Page.ui.controls.get(listID);
	var options = optionsetControl.getAttribute().getOptions();
	//loop through the options and if it matches the value passed then show it 
	for (var i = 0; i < options.length - 1; i++)
	{
		//check if the optionsetvalue matches the one passed
		if (options[i].value == value)
		{
			optionsetControl.addOption(options[i]);
		}
	}
}

function sync_values_onchange(sourceField, destField)
{
	Xrm.Page.getAttribute(destField).setValue(Xrm.Page.getAttribute(sourceField).getValue());
}

function SimilarBidsDuplicate()
{
	var paramstr = '&business=';
	paramstr += (Xrm.Page.getAttribute('ccrm_arupbusinessid').getValue() != null) ? Xrm.Page.getAttribute('ccrm_arupbusinessid').getValue()[0].id : '';
	paramstr += '&projcountry=';
	paramstr += (Xrm.Page.getAttribute('ccrm_projectlocationid').getValue() != null) ? Xrm.Page.getAttribute('ccrm_projectlocationid').getValue()[0].id : '';
	paramstr += '&region=';
	paramstr += (Xrm.Page.getAttribute('ccrm_arupregionid').getValue() != null) ? Xrm.Page.getAttribute('ccrm_arupregionid').getValue()[0].id : '';
	paramstr += '&id=' + Xrm.Page.data.entity.getId();
	DialogOption = new Xrm.DialogOptions;
	DialogOption.width = 900;
	DialogOption.height = 620;
	Xrm.Internal.openDialog(Xrm.Page.context.getClientUrl() +
		"/WebResources/ccrm_duplicatebids?Data=" + encodeURIComponent(paramstr),
	DialogOption,
	null,
	null,
	CallbackFunction);
}

function CallbackFunction(returnValue)
{}
// State Country lookup filter code - starts

function getCountryManagerAndCategory(countryID)
{
	SDK.REST.retrieveRecord(countryID,
		"Ccrm_country",
		'Ccrm_RiskRating',
	null,

	function (retrievedreq)
	{
		if (retrievedreq != null)
		{
			var countryCatCode = (retrievedreq.Ccrm_RiskRating != null) ? retrievedreq.Ccrm_RiskRating.Value : null;
			Xrm.Page.getAttribute("ccrm_countrycategory").setValue(countryCatCode);
			Xrm.Page.getAttribute("ccrm_countrycategory").setSubmitMode("always");
		}
	},
	errorHandler,
	false);
}

function projectcountry_onchange(fromformload)
{
	var CountryName = '';
	var coutryid = Xrm.Page.getAttribute('ccrm_projectlocationid').getValue();
	if (coutryid != null && coutryid.length > 0)
	{
		CountryName = coutryid[0].name + '';
		CountryName = CountryName.toUpperCase();
		if (CountryName == 'INDIA' || CountryName == 'CANADA' || CountryName == 'UNITED STATES OF AMERICA')
		{
			if (!fromformload)
			{
				Xrm.Page.getAttribute("ccrm_arupcompanyid").setValue(null);
				Xrm.Page.getAttribute("ccrm_accountingcentreid").setValue(null);
			}
			else
			{
				if (Xrm.Page.getAttribute("ccrm_arupcompanyid").getValue() != null && CountryName == 'INDIA')
				{
					var companyId = Xrm.Page.getAttribute("ccrm_arupcompanyid").getValue()[0].id;
					var retrievedreq;
					if (companyId != null)
					{
						SDK.REST.retrieveRecord(companyId, "Ccrm_arupcompany", 'Ccrm_ArupCompanyCode', null, function (responseData)
						{
							retrievedreq = responseData;
						}, errorHandler, false);
					}
					if (retrievedreq.Ccrm_ArupCompanyCode != "55" && retrievedreq.Ccrm_ArupCompanyCode != "75")
					{
						Xrm.Page.getAttribute("ccrm_arupcompanyid").setValue(null);
						Xrm.Page.getAttribute("ccrm_accountingcentreid").setValue(null);
						var fieldName = "ccrm_arupcompanyid";
						Xrm.Page.getControl(fieldName).addPreSearch(function ()
						{
							IndiaCompanyFilter();
						});
					}
				}
			}
		}
		getCountryManagerAndCategory(Xrm.Page.getAttribute("ccrm_projectlocationid").getValue()[0].id);
		// set proj country region
		if (!fromformload)
		{
			var projcountryregion = getCountryregion(Xrm.Page.getAttribute("ccrm_projectlocationid").getValue()[0].id);
			if (projcountryregion != null)
			{
				SetLookupField(projcountryregion.Id, projcountryregion.Name, 'ccrm_arupregion', 'ccrm_projectcountryregionid');
				Xrm.Page.getAttribute("ccrm_projectcountryregionid").fireOnChange();
			}
		}
		if (!fromformload)
		{
			Xrm.Page.getAttribute("ccrm_arupusstateid").setValue(null);
		}
		//Xrm.Page.getControl("ccrm_arupusstateid").addPreSearch(function () { stateCountryLookupAddFilter(); });
		var fieldName = "ccrm_arupcompanyid";
		Xrm.Page.getControl(fieldName).addPreSearch(function ()
		{
			IndiaCompanyFilter();
		});
		//if (Xrm.Page.ui.getFormType() != 1) // not for quick create
		{
			if (CountryName == "INDIA")
			{
				if (Xrm.Page.getAttribute("ccrm_arupcompanyid").getValue() != null)
				{
					var companyId = Xrm.Page.getAttribute("ccrm_arupcompanyid").getValue()[0].id;
					var retrievedreq;
					if (companyId != null)
					{
						SDK.REST.retrieveRecord(companyId, "Ccrm_arupcompany", 'Ccrm_ArupCompanyCode', null, function (responseData)
						{
							retrievedreq = responseData;
						}, errorHandler, false);
					}
					if (retrievedreq.Ccrm_ArupCompanyCode != "55" && retrievedreq.Ccrm_ArupCompanyCode != "75")
					{
						var fieldName = "ccrm_arupcompanyid";
						Xrm.Page.getControl(fieldName).addPreSearch(function ()
						{
							IndiaCompanyFilter();
						});
					}
				}
			}
		}
	}
}
//function stateCountryLookupAddFilter() {
//    if (Xrm.Page.getAttribute("ccrm_projectlocationid").getValue() != null) {
//        var CountryName = Xrm.Page.getAttribute("ccrm_projectlocationid").getValue()[0].name;
//        var fetch =
//            "<filter type='and'>" +
//                "<condition attribute='ccrm_countryidname' operator='like' value='%" +
//                CountryName +
//                "%' />" +
//                "</filter>";
//        Xrm.Page.getControl("ccrm_arupusstateid").addCustomFilter(fetch);
//    }
//}

function isamericaregion()
{
	var result = false;
	//if (Xrm.Page.ui.getFormType() != 1) {
	var CountryName = Xrm.Page.getAttribute("ccrm_projectlocationid").getValue()[0].name;
	CountryName = CountryName.toUpperCase();
	if (CountryName == "UNITED STATES" || CountryName == "UNITED STATES OF AMERICA" || CountryName == "CANADA") result = true;
	//}
	return result;
}

function getCountryregion(countryID)
{
	var result = null;
	SDK.REST.retrieveRecord(countryID, 'Ccrm_country', 'ccrm_arupregionid', null,

	function (retrievedreq)
	{
		if (retrievedreq != null) result = (retrievedreq.ccrm_arupregionid != null) ? retrievedreq.ccrm_arupregionid : null;
	},
	errorHandler,
	false);
	return result;
}
// project state/province on change event

function USStateLookupPreFilter()
{
	var stateprovinceid = Xrm.Page.getAttribute('ccrm_arupusstateid').getValue();
	if (stateprovinceid != null && stateprovinceid.length > 0)
	{
		var StateId = stateprovinceid[0].id;
		var StateName = stateprovinceid[0].name + '';
		var fieldName = 'ccrm_arupcompanyid';
		if (isamericaregion())
		{
			//if (StateName.toUpperCase() != 'TEXAS') {
			Xrm.Page.getAttribute('ccrm_accountingcentreid').setValue(null);
			SDK.REST.retrieveRecord(StateId,
				"Ccrm_arupusstate",
				'ccrm_companyid',
			null,

			function (retrievedreq)
			{
				if (retrievedreq.ccrm_companyid.Id != null)
				{
					var Id = retrievedreq.ccrm_companyid.Id;
					if (Id.indexOf('{') == -1) Id = '{' + Id;
					if (Id.indexOf('}') == -1) Id = Id + '}';
					Id = Id.toUpperCase();
					var lookupValue = new Array();
					lookupValue[0] = new Object();
					lookupValue[0].id = Id;
					lookupValue[0].name = retrievedreq.ccrm_companyid.Name;
					lookupValue[0].entityType = 'ccrm_arupcompany';
					Xrm.Page.getAttribute('ccrm_arupcompanyid').setValue(lookupValue);
					Xrm.Page.getAttribute("ccrm_arupcompanyid").fireOnChange();
					// show noticiation
					Xrm.Page.ui.setFormNotification('Please select an Accounting Centre for the selected US State',
						"WARNING",
						"statechangefieldreq");
					setTimeout(function ()
					{
						Xrm.Page.ui.clearFormNotification("statechangefieldreq");
					}, 10000);
					Xrm.Page.getControl('ccrm_accountingcentreid').setFocus(true);
				}
			},
			errorHandler,
			false);
			//} else {
			//    Xrm.Page.getAttribute('ccrm_accountingcentreid').setValue(null);
			//    Xrm.Page.getAttribute('ccrm_arupcompanyid').setValue(null);
			//    Xrm.Page.getControl('ccrm_arupcompanyid').setFocus(true);
			//    Xrm.Page.getControl(fieldName)
			//        .addPreSearch(function () {
			//            USStateCompaniesAddLookupFilter(fieldName);
			//        });
			//    Xrm.Page.ui
			//        .setFormNotification('Please select an Arup Company and Accounting Centre for the selected US State', "WARNING", "statechangefieldreq");
			//    setTimeout(function () { Xrm.Page.ui.clearFormNotification("statechangefieldreq"); }, 10000);
			//}
		}
	}
}
//function USStateCompaniesAddLookupFilter(fieldName) {
//    var StateId = Xrm.Page.getAttribute("ccrm_arupusstateid").getValue()[0].id,
//        StateName = Xrm.Page.getAttribute("ccrm_arupusstateid").getValue()[0].name;
//    SDK.REST.retrieveRecord(StateId,
//        "Ccrm_arupusstate",
//        'ccrm_companycode',
//        null,
//        function (retrievedreq) {
//            if (retrievedreq != null) {
//                var splitCode = retrievedreq.ccrm_companycode.split(",");
//                var fetch =
//                    "<filter type='or'>" +
//                        "<condition attribute='ccrm_arupcompanycode' operator='like' value='%" +
//                        splitCode[0] +
//                        "%' />" +
//                        "<condition attribute='ccrm_arupcompanycode' operator='like' value='%" +
//                        splitCode[1] +
//                        "%' />" +
//                        "</filter>";
//                Xrm.Page.getControl(fieldName).addCustomFilter(fetch);
//            }
//        },
//        errorHandler,
//        false);
//}

function IndiaCompanyFilter()
{
	var fieldName = "ccrm_arupcompanyid";
	var CountryName = Xrm.Page.getAttribute("ccrm_projectlocationid").getValue()[0].name + '';
	if (CountryName.toUpperCase() == 'INDIA')
	{
		var fetch =
			"<filter type='or'>" +
			"<condition attribute='ccrm_arupcompanycode' operator='like' value='%55%' />" +
			"<condition attribute='ccrm_arupcompanycode' operator='like' value='%75%' />" +
			"</filter>";
		Xrm.Page.getControl(fieldName).addCustomFilter(fetch);
	}
	else
	{
		var fetch =
			"<filter type='or'>" +
			"<condition attribute='ccrm_arupcompanycode' operator='like' value='%%' />" +
			"</filter>";
		Xrm.Page.getControl(fieldName).addCustomFilter(fetch);
	}
}
// State Country lookup filter code - ends
//Set short title - starts

function name_onchange()
{
	if (Xrm.Page.getAttribute("name").getValue() != null)
	{
		var x = Xrm.Page.getAttribute("name").getValue();
		var y = x.replace(/;/g, ' ');
		if (Xrm.Page.getAttribute("ccrm_shorttitle").getValue() == null)
		{
			setShortTitle(y);
		}
	}
}

function setShortTitle(s)
{
	if (s != null)
	{
		var strName = s;
		Xrm.Page.getAttribute("ccrm_shorttitle").setValue(strName.substring(0, 30));
	}
}
var selectedCompanyCode = '';
// Apply filter to Acc Center  - starts

function ccrm_arupcompanyid_onchange()
{
	var accCenterFilterCode = '';
	var companyvalid = '';
	var companyval = Xrm.Page.getAttribute("ccrm_arupcompanyid").getValue();
	if (companyval != null && companyval.length > 0)
	{
		Xrm.Page.getControl('ccrm_accountingcentreid').removePreSearch(AccCentreAddLookupFilter);
		if (Xrm.Page.ui.getFormType() == 1)
		{
			companyvalid = companyval[0].id;
			if (companyval[0].id.indexOf("}") > 0) companyvalid = "{" + currUserData.arupcompanyid.toUpperCase() + "}";
			else companyvalid = currUserData.arupcompanyid;
			if (companyval[0].id != companyvalid) Xrm.Page.getAttribute("ccrm_accountingcentreid").setValue(null);
			else
			{
				SetLookupField(currUserData.ccrm_accountingcentreid, currUserData.ccrm_accountingcentrename, 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid');
				Xrm.Page.getAttribute("ccrm_accountingcentreid").fireOnChange();
			}
		}
		if (Xrm.Page.ui.getFormType() != 1)
		{
			//CRM2016 Bug 34826
			if (Xrm.Page.getAttribute("ccrm_subaccountingcentreid"))
			{
				Xrm.Page.getAttribute("ccrm_accountingcentreid").setValue(null);
				Xrm.Page.getAttribute("ccrm_subaccountingcentreid").setValue(null);
				Xrm.Page.getControl("ccrm_subaccountingcentreid").setDisabled(true);
			}
		}
		//;
		SDK.REST.retrieveRecord(companyval[0].id, "Ccrm_arupcompany", 'Ccrm_AccCentreLookupCode', null,

		function (retrievedreq)
		{
			if (retrievedreq != null)
			{
				accCenterFilterCode = retrievedreq.Ccrm_AccCentreLookupCode;
				selectedCompanyCode = retrievedreq.Ccrm_AccCentreLookupCode;
			}
		}, errorHandler, false);
		Xrm.Page.getControl('ccrm_accountingcentreid').addPreSearch(function ()
		{
			AccCentreAddLookupFilter(accCenterFilterCode);
		});
		if (Xrm.Page.ui.getFormType() != 1) setTransactionCurrency(companyval[0].id);
	}
	else
	{
		Xrm.Page.getControl('ccrm_accountingcentreid').addPreSearch(function ()
		{
			AccCentreResetLookupFilter();
		});
	}
}

function AccCentreResetLookupFilter()
{
	var fetch =
		"<filter type='and'>" +
		"<condition attribute='ccrm_arupcompanycode' operator='like' value='%%' />" +
		"</filter>";
	Xrm.Page.getControl('ccrm_accountingcentreid').addCustomFilter(fetch);
}

function AccCentreAddLookupFilter(accCenterFilterCode)
{
	if (selectedCompanyCode == accCenterFilterCode)
	{
		var fetch =
			"<filter type='and'>" +
			"<condition attribute='ccrm_arupcompanycode' operator='like' value='" + //BUG-FIX 63537
		accCenterFilterCode +
			"%' />" +
			"</filter>";
		Xrm.Page.getControl('ccrm_accountingcentreid').addCustomFilter(fetch);
	}
}

function SubAccCentreAddLookupFilter(subAccCenterFilterCode)
{
	var fetch =
		"<filter type='and'>" +
		"<condition attribute='ccrm_arupaccountingcodeid' operator='eq' value='" + subAccCenterFilterCode +
		"'/>" +
		"</filter>";
	Xrm.Page.getControl('ccrm_subaccountingcentreid').addCustomFilter(fetch);
}
//set currencyid lookups

function setTransactionCurrency(arupCompanyID)
{
	var lookup = new Array();
	SDK.REST.retrieveRecord(arupCompanyID,
		"Ccrm_arupcompany",
		'ccrm_currencyid,',
	null,

	function (retrievedreq)
	{
		if (retrievedreq != null)
		{
			var nodeCurrency = retrievedreq.ccrm_currencyid;
			var Id = retrievedreq.ccrm_currencyid.Id;
			if (Id.indexOf('{') == -1) Id = '{' + Id;
			if (Id.indexOf('}') == -1) Id = Id + '}';
			Id = Id.toUpperCase();
			lookup[0] = new Object();
			lookup[0].entityType = "transactioncurrency";
			if (nodeCurrency != null)
			{
				lookup[0].id = Id;
				lookup[0].name = retrievedreq.ccrm_currencyid.Name;
			}
		}
		else
		{
			lookup = GetCurrencyLookup();
		}
	},
	errorHandler,
	false);
	//CRM 2016  Bug 34826
	if (Xrm.Page.getAttribute("ccrm_pi_transactioncurrencyid")) Xrm.Page.getAttribute("ccrm_pi_transactioncurrencyid").setValue(lookup);
	if (Xrm.Page.getAttribute("ccrm_project_transactioncurrencyid")) Xrm.Page.getAttribute("ccrm_project_transactioncurrencyid").setValue(lookup);
	if (Xrm.Page.getAttribute("ccrm_bid_transactioncurrencyid")) Xrm.Page.getAttribute("ccrm_bid_transactioncurrencyid").setValue(lookup);
}
// Apply filter to Acc Center  - ends

function GetCurrencyLookup()
{
	var lookup = new Array();
	lookup[0] = new Object();
	SDK.REST.retrieveMultipleRecords("TransactionCurrency",
		"$select=TransactionCurrencyId,CurrencyName&$top=1&$filter=ISOCurrencyCode eq 'GBP'",

	function (results)
	{
		if (results.length > 0)
		{
			var Id = results[0].TransactionCurrencyId;
			if (Id.indexOf('{') == -1) Id = '{' + Id;
			if (Id.indexOf('}') == -1) Id = Id + '}';
			Id = Id.toUpperCase();
			lookup[0].id = Id;
			lookup[0].name = results[0].CurrencyName;
			lookup[0].entityType = "transactioncurrency";
		}
	},
	errorHandler,

	function ()
	{},
	false);
	return lookup;
}

function setRequiredFields_DecisionToProceed()
{
	Xrm.Page.getAttribute("description").setRequiredLevel("required")
	Xrm.Page.getAttribute("ccrm_salarycost_num").setRequiredLevel("required")
	Xrm.Page.getAttribute("ccrm_grossexpenses_num").setRequiredLevel("required")
}

function RatFactNetReturnToArupNetArupBidCost()
{
	var ratFactNetRet = Xrm.Page.getAttribute("ccrm_factorednetreturntoarup_num").getValue() / Xrm.Page.getAttribute("ccrm_netarupbidcost_num").getValue();
	if (ratFactNetRet < 1.0) return false;
	else return true;
}

function setRequiredFields_BidSubmitted()
{
	Xrm.Page.getAttribute("ccrm_estarupinvolvementstart").setRequiredLevel("required"); //arup start date
	Xrm.Page.getAttribute("ccrm_estarupinvolvementend").setRequiredLevel("required"); //arup end date    
	Xrm.Page.getAttribute("ccrm_descriptionofextentofarupservices").setRequiredLevel("required"); //Extent of Arup Services
	Xrm.Page.getAttribute("ccrm_servicesname").setRequiredLevel("required"); //Services    
	Xrm.Page.getAttribute("ccrm_theworksname").setRequiredLevel("required"); //The Works    
	Xrm.Page.getAttribute("ccrm_projectsectorname").setRequiredLevel("required"); //Project Sector
}

function checkOrganisationData()
{
	if (Xrm.Page.getAttribute("customerid").getValue() != null)
	{
		var clientId = Xrm.Page.getAttribute("customerid").getValue()[0].id;
		SDK.REST.retrieveRecord(clientId,
			"Account",
			'Ccrm_ClientSectorPicklistName,ccrm_countryofcoregistrationid',
		null,

		function (retrievedreq)
		{
			if (retrievedreq != null)
			{
				var clientSector = (retrievedreq.Ccrm_ClientSectorPicklistName != null) ? retrievedreq.Ccrm_ClientSectorPicklistName : null;
				var countryOfCompanyReg = (retrievedreq.ccrm_countryofcoregistrationid != null) ? retrievedreq.ccrm_countryofcoregistrationid : null;
				if (clientSector == null)
				{
					Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
						'<font size="3" color="#000000"></br>You must provide a value for Client Sector for the Client</font>', [
					{
						label: "<b>OK</b.",
						setFocus: true},
                            ],
						"WARNING",
					400,
					250,
						'',
					true);
					return false;
				}
				if (countryOfCompanyReg.Id == null)
				{
					Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
						'<font size="3" color="#000000"></br>You must provide a value for Country of Company Registration for the Client</font>', [
					{
						label: "<b>OK</b>",
						setFocus: true},
                            ],
						"WARNING",
					400,
					250,
						'',
					true);
					return false;
				}
			}
			else return false;
		},
		errorHandler,
		false);
	}
}

function HideApprovalButtonForRiskChange(regionName)
{
	var regionName, oppType;
	oppType = Xrm.Page.getAttribute("ccrm_opportunitytype").getValue();
	if (Xrm.Page.getAttribute("ccrm_arupregionid").getValue() != null) regionName = Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name;
	if (regionName == ArupRegionName.EastAsia)
	{
		if (oppType == BidRiskLevels.Level1)
		{ // if GL apporval option --> Waiting response, set it to approved
		}
		if ((oppType == BidRiskLevels.Level2 || oppType == BidRiskLevels.Level3))
		{
			// if BD apporval option --> Waiting response, set it to approved 
		}
	}
	else if (regionName == ArupRegionName.Australasia || regionName == ArupRegionName.Malaysia)
	{
		if (oppType == BidRiskLevels.Level1)
		{}
		else if (oppType == BidRiskLevels.Level2)
		{}
		if (oppType == BidRiskLevels.Level3)
		{}
	}
}
// function setRequiredFieldsOnDevBidStage(){
// var stageid = getStageId();
// if (stageid == ArupStages.BidDevelopment) {
// var result = CheckFinanceFields();
// var financeMsg = "Please complete all required and Project Financials fields to proceed to next stage.";
// if (result)
// Xrm.Page.ui.clearFormNotification("FinancePendingMsg");
// else
// Xrm.Page.ui.setFormNotification(financeMsg, "WARNING", "FinancePendingMsg");
// }
// }

function stageNotifications()
{
	setLookupFiltering(); // appy filter to user fields
	var pjnrequested = false;
	var pjnMsg =
		"You are progressing the Opportunity without a Possible Job Number if a PJN is required move back to PRE-BID stage where the PJN can be requested."; //[RS-08/05/2017] - Changed stage name from LEAD to PRE-BID in the message above
	var stageid = getStageId();
	var regionName;
	var confidential = Xrm.Page.getAttribute('ccrm_confidential').getValue();
	if (confidential == 0)
	{
		Xrm.Page.getAttribute('ccrm_confidentialoptionset').setValue(2);
	}
	else if (confidential == 1)
	{
		Xrm.Page.getAttribute('ccrm_confidentialoptionset').setValue(1);
	}
	else
	{
		Xrm.Page.getAttribute('ccrm_confidentialoptionset').setValue(2);
	}
	if (Xrm.Page.getAttribute("ccrm_possiblejobnumberrequired").getValue() == 1) pjnrequested = true;
	if (Xrm.Page.getAttribute("ccrm_arupregionid").getValue() != null) regionName = Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name;
	if (regionName == "East Asia Region" || regionName == "Australasia Region" || regionName == "Malaysia Region")
	{
		if (stageid == ArupStages.Lead || stageid == ArupStages.CrossRegion)
		{
			if (!pjnrequested)
			{
				showRibbonButton('ccrm_showpjnbutton');
			}
			else
			{
				// Added to check Risk level changes
				if (Xrm.Page.getAttribute("ccrm_pjna").getValue() == "" || Xrm.Page.getAttribute("ccrm_pjna").getValue() == null)
				{
					setTimeout(function ()
					{
						Xrm.Page.ui.clearFormNotification("PJNRiskChsnge");
					}, 500);
					setTimeout(function ()
					{
						BPFMoveNext();
						hideProcessFields(Xrm.Page.data.process.getSelectedStage().getName());
					},
					1000);
				}
			}
		}
		else
		{
			if (stageid == ArupStages.BidDevelopment)
			{
				if (!pjnrequested)
				{
					hideRibbonButton('ccrm_showpjnbutton'); //Added to hide PJN ribbon button
					Xrm.Page.ui.setFormNotification(pjnMsg, "WARNING", "PJNPPendingMsg");
					setTimeout(function ()
					{
						Xrm.Page.ui.clearFormNotification("PJNPPendingMsg");
					}, 10000);
				}
			}
		}
	}
	else
	{
		if (!pjnrequested)
		{
			if (stageid == ArupStages.Lead || stageid == ArupStages.CrossRegion || stageid == ArupStages.BidDevelopment || stageid == ArupStages.BidReviewApproval || stageid == ArupStages.BidSubmitted) showRibbonButton('ccrm_showpjnbutton');
			else hideRibbonButton('ccrm_showpjnbutton'); //Added to hide PJN ribbon button
		}
	}
	if (stageid != ArupStages.BidReviewApproval) // bid riview approval
	{
		hideRibbonButton('ccrm_shwbidreviewappbtn');
	}
	else if (stageid == ArupStages.BidReviewApproval) // bid riview approval
	{
		if (pjnrequested) MoveToBidDevelopment(true);
		makeBidReviewApprovalFieldsReadonly();
		if (Xrm.Page.getAttribute("ccrm_bidreviewoutcome").getValue() != 100000002) showRibbonButton('ccrm_shwbidreviewappbtn');
		//setTimeout(function () { Xrm.Page.data.entity.save(null); }, 2);
		setCurrentApproversAsync();
	}
	if (stageid == ArupStages.CrossRegion)
	{
		Xrm.Page.data.process.removeOnStageChange(StageChange_event);
		Xrm.Page.data.process.addOnStageChange(function (executionContext)
		{
			// setTimeout(function () {
			// var eventArgs = executionContext.getEventArgs();
			// if (eventArgs.getDirection() == "next ") {
			// Xrm.Utility.openEntityForm(Xrm.Page.data.entity.getEntityName(), Xrm.Page.data.entity.getId());
			// }
			// },
			// 10);
			// }
			var eventArgs = executionContext.getEventArgs();
			if (eventArgs.getDirection() == "Next" && (eventArgs.getStage().getName() == "DEVELOPING BID" || eventArgs.getStage().getName() == "CROSS REGION"))
			{
				Xrm.Utility.openEntityForm(Xrm.Page.data.entity.getEntityName(), Xrm.Page.data.entity.getId());
			}
		});
		InitiateCrossRegionStage(null, true);
	}
	if (customerid_onChange())
	{
		if (stageid != ArupStages.Lead) onStageChange();
	}
	if (stageid == ArupStages.BidDevelopment || stageid == ArupStages.BidReviewApproval)
	{
		var result = CheckFinanceFields();
		var financeMsg = "Please complete all required and Project Financials fields to proceed to next stage.";
		if (result) Xrm.Page.ui.clearFormNotification("FinancePendingMsg");
		else Xrm.Page.ui.setFormNotification(financeMsg, "WARNING", "FinancePendingMsg");
		setTimeout(function ()
		{
			Xrm.Page.ui.clearFormNotification("FinancePendingMsg");
		}, 10000);
	}
	if (stageid == ArupStages.ConfirmJob)
	{
		var triggerSave = false;
		//Added to give notification about Project Participant addition
		//Xrm.Page.ui.setFormNotification("Please review the Project Participants for completeness", "INFO", "ProjPartInfo");
		//setTimeout(function () { Xrm.Page.ui.clearFormNotification("ProjPartInfo"); }, 10000);
		var jobnoprogval = Xrm.Page.getAttribute("ccrm_jobnumberprogression").getValue();
		if (jobnoprogval == 100009001 || jobnoprogval == 100009002 || jobnoprogval == 100009003 || jobnoprogval == 100009004 || jobnoprogval == null)
		{
			Xrm.Page.getAttribute("ccrm_sys_confirmedjob_buttonhide").setValue(0);
			Xrm.Page.getAttribute("ccrm_systemcjnarequesttrigger").setValue(1);
			triggerSave = true;
		}
		if (triggerSave) setTimeout(function ()
		{
			Xrm.Page.data.entity.save(null);
		}, 500);
	}
	restoreFieldVal(stageid);
}
//Move Previous Stage

function onStageChange(result)
{
	Xrm.Page.ui.clearFormNotification("msgcrossbid");
	Xrm.Page.ui.clearFormNotification("FinancePendingMsg");
	setTimeout(function ()
	{
		Xrm.Page.getAttribute(function (attribute, index)
		{
			if (attribute.getRequiredLevel() == "required")
			{
				if (attribute.getValue() === null)
				{
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
		if (customerid_onChange())
		{
			highlightField(null, '#ccrm_client', false);
		}
		Xrm.Page.data.process.movePrevious(onMovePrevious);
		Xrm.Page.ui.clearFormNotification("FinancePendingMsg");
	},
	100);
}

function onMovePrevious(returnStatus)
{
	switch (returnStatus)
	{
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

function restoreFieldVal(stageid)
{
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
	if (stageid == ArupStages.BidSubmitted) fields = ['ccrm_bidsubmission'];
	resetAndSetVal(fields);
}

function resetAndSetVal(fields)
{
	var bid = new Object();
	fields.forEach(function (field)
	{
		bid[field] = Xrm.Page.getAttribute(field).getValue();
		Xrm.Page.getAttribute(field).setValue(null);
		Xrm.Page.getAttribute(field).setValue(bid[field]);
	});
	bid = null;
}

function hideRibbonButton(field)
{
	if (Xrm.Page.getAttribute(field).getValue() == 1)
	{
		Xrm.Page.getAttribute(field).setValue(false);
		setTimeout(function ()
		{
			Xrm.Page.data.entity.save(null);
		}, 500);
	}
}

function showRibbonButton(field)
{
	if (Xrm.Page.getAttribute(field).getValue() == 0 || Xrm.Page.getAttribute(field).getValue() == null)
	{
		Xrm.Page.getAttribute(field).setValue(1);
		setTimeout(function ()
		{
			Xrm.Page.data.entity.save(null);
		}, 500);
	}
}

function BPFMoveNext()
{
	if (Xrm.Page.getAttribute("processid") != null)
	{
		moveNext(getStageId());
	}
}

function StageChange_event(args)
{
	var stageid = getStageId();
	if (stageid != ArupStages.Lead && stageid != ArupStages.CrossRegion && stageid != ArupStages.BidDevelopment &&
	//stageid != ArupStages.BidReviewApproval &&
	stageid != ArupStages.BidSubmitted && stageid != ArupStages.ConfirmJob)
	{
		setCurrentApprovers();
	}
	else
	{
		Xrm.Page.ui.clearFormNotification('CurrentApprovers');
	}
	if (stageid == ArupStages.BidSubmitted)
	{
		var BidSubmitted = 200020;
		updateStatusCode(BidSubmitted);
	}
	//if (stageid == ArupStages.BidDevelopment) {
	//    Xrm.Page.getControl("header_process_ccrm_contractlimitofliability").getAttribute().setValue(Xrm.Page.getAttribute("ccrm_contractlimitofliability").getValue());
	//    Xrm.Page.getControl("header_process_ccrm_limitamount_num").getAttribute().setValue(Xrm.Page.getAttribute("ccrm_limitamount_num").getValue());
	//    Xrm.Page.getControl("header_process_ccrm_limitofliabilityagreement").getAttribute().setValue(Xrm.Page.getAttribute("ccrm_limitofliabilityagreement").getValue());
	//    Xrm.Page.getControl("header_process_ccrm_contractlimitofliability").getAttribute().setSubmitMode("always");
	//    Xrm.Page.getControl("header_process_ccrm_limitamount_num").getAttribute().setSubmitMode("always");
	//    Xrm.Page.getControl("header_process_ccrm_limitofliabilityagreement").getAttribute().setSubmitMode("always");
	//    //Xrm.Page.getAttribute("ccrm_contractlimitofliability").setSubmitMode("always");
	//    //Xrm.Page.getAttribute("ccrm_limitamount_num").setSubmitMode("always");
	//    //Xrm.Page.getAttribute("ccrm_limitofliabilityagreement").setSubmitMode("always");
	//    console.log('LoL Header: ' + Xrm.Page.getControl("header_process_ccrm_contractlimitofliability").getAttribute().getValue().toString());
	//    console.log('LoL agreed Header: ' + Xrm.Page.getControl("header_process_ccrm_limitofliabilityagreement").getAttribute().getValue().toString());
	//    console.log('LoL amount Header: ' + Xrm.Page.getControl("header_process_ccrm_limitamount_num").getAttribute().getValue().toString());
	//    //setTimeout(function () {
	//    //    Xrm.Utility.openEntityForm(Xrm.Page.data.entity.getEntityName(), Xrm.Page.data.entity.getId());
	//    //},
	//    //10);
	//}
	SetCurrentStatusFromServer();
	stageNotifications();
	hideProcessFields(Xrm.Page.data.process.getSelectedStage().getName());
	IsFormValid();
	SuppressDirtyFields(); //Added to handle dirty fields on stage change of turbo forms
	//if (stageid == ArupStages.BidDevelopment && currentStage != ArupStages.Lead) {
	//    Xrm.Page.data.entity.save();
	//    setTimeout(function () { refreshPage(); }, 3000);
	//}
	//currentStage = stageid;
}

function checkAccountingCentre()
{
	acctCentreInvalid = null;
	checkAccountingCentreStatus(false);
	var validFieldName = 'ccrm_validaccountingcentre';
	var warnMsg = "An accounting centre you have selected is closed. Please, select a valid accounting centre.";
	var warnMsgName = 'accountingcentre';
	if (acctCentreInvalid != null)
	{
		if (acctCentreInvalid == true)
		{
			//  if (Xrm.Page.ui.getFormType() == 1) {
			//    //SetLookupField(null, null, 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid');
			Xrm.Page.getAttribute("ccrm_accountingcentreid").setValue(null);
			SetValidField(validFieldName, 0, warnMsg, warnMsgName);
			//Xrm.Page.data.process.movePrevious(onMovePrevious)
			//SetLookupField(0, "", 'ccrm_arupaccountingcode', 'ccrm_accountingcentreid');
			//    //Xrm.Page.getAttribute("ccrm_accountingcentreid").setSubmitMode("always");               
			//  }
		}
		else
		{
			SetValidField(validFieldName, 1, null, warnMsgName);
		}
	}
	else
	{
		SetValidField(validFieldName, 1, null, warnMsgName);
	}
	setTimeout(function ()
	{
		Xrm.Page.ui.clearFormNotification("accountingcentre");
	}, 10000);
}

function hideProcessFields(selectedStage)
{
	/// <summary>Hide fields that are required by the Bbusiness Process Flow, but which we do not want the user to see.</summary>
	switch (selectedStage)
	{
		case "PRE-BID":
			//[RS-08/05/2017] - Changed the name of stage from LEAD to PRE-BID
			hideBPFFields("ccrm_opportunitytype", "ccrm_possiblejobnumberrequired", "ccrm_arupregionid", "ccrm_projectcountryregionid", "arup_isaccountingcentervalid");
			var procurementType = Xrm.Page.getControl("ccrm_contractarrangement");
			if ( !! procurementType && procurementType.getAttribute().getText() != "Other")
			{
				hideBPFFields("ccrm_otherprocurementtypedetails");
			}
			if ( !! procurementType)
			{
				var requiredlevel = 'none';
				var referencenumber = Xrm.Page.getAttribute("header_process_ccrm_agreementnumber");
				if ( !! referencenumber)
				{
					if (procurementType.getAttribute().getSelectedOption() != "2")
					{
						hideBPFFields("ccrm_agreementnumber");
					}
					else
					{
						requiredlevel = 'required';
					}
					referencenumber.setRequiredLevel(requiredlevel);
				}
			}
			break;
		case "CROSS REGION":
			hideBPFFields("ccrm_opportunitytype_1", "ccrm_possiblejobnumberrequired_1", "ccrm_arupregionid_1");
			break;
		case "DEVELOPING BID":
			hideBPFFields("ccrm_financedetailscaptured");
			break;
		case "CONFIRMED JOB":
			hideBPFFields("ccrm_jobnumberprogression", "ccrm_arupregionid_2", "ccrm_opportunitytype_3");
			break;
	}
}

function hideBPFFields(fieldName)
{
	/// <summary>Hide control in Business process panel.</summary>
	/// <param name="fieldName">One or more field names that are to be hidden.</param>
	for (var field in arguments)
	{
		var controlName = "header_process_" + arguments[field];
		var control = Xrm.Page.getControl(controlName);
		if (control != null)
		{
			control.setVisible(false);
		}
	}
}
// Bid Review Approval -  ribbon button click - starts

function BidReviewApprovalClick()
{
	if (IsFormValid())
	{
		var approvalType = "BidReviewApproval";
		Xrm.Page.ui.clearFormNotification('msgbidreviewchair');
		var newDate = new Date();
		var bidReviewDate = Xrm.Page.getAttribute("ccrm_bidreview").getValue();
		var regionName = Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name.toUpperCase();
		var currentBidReviewChair = Xrm.Page.getAttribute("ccrm_bidreviewchair_userid").getValue();
		var currentUser = Xrm.Page.context.getUserId();
		var PMBR = Xrm.Page.getAttribute('ccrm_bidmanager_userid').getValue()[0].id,
			PDBR = Xrm.Page.getAttribute('ccrm_biddirector_userid').getValue()[0].id;
		if (regionName == "AUSTRALASIA REGION" || regionName == "MALAYSIA REGION")
		{
			if (currentUser != PMBR && currentUser != PDBR)
			{
				Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
					'<font size="3" color="#000000"></br>Only the Bid Manager or the Bid Director can approve the Bid Review Approval</font>', [
				{
					label: "<b>OK</b>",
					setFocus: true},
                    ],
					"ERROR", 500, 250, '', true);
			}
			else
			{
				if (BidReviewApprovalValidation(true))
				{
					if (bidReviewDate != null && bidReviewDate > newDate)
					{
						Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
							'<font size="3" color="#000000"></br>The selected Bid Review date is greater than the current date.\n Do you want to Continue? </br></br>Click "Proceed with Approval" to confirm, or "Do Not Approve" to cancel.</font>', [
						{
							label: "<b>Proceed with Approval</b>",
							callback: function ()
							{
								approveCallbackAction(approvalType);
								moveToNextTrigger = false;
							},
							setFocus: false,
							preventClose: false},
						{
							label: "<b>Do Not Approve</b>",
							setFocus: true,
							preventClose: false}
                            ],
							"WARNING", 500, 350, '', true);
					}
					else
					{
						approveCallbackAction(approvalType);
						moveToNextTrigger = false;
					}
				}
			}
		}
		else
		{
			if (!IsBidReviewChair())
			{
				// set notification
				var bidReviewChair = Xrm.Page.getAttribute('ccrm_bidreviewchair_userid').getValue();
				var msgbidreviewchair = 'Only a Bid Review Chair can approve the Bid Review';
				if (bidReviewChair != null) msgbidreviewchair = 'The Bid Review Chair ' + bidReviewChair[0].name +
					' is the only person that can approve the Bid Review';
				Xrm.Page.ui.setFormNotification(msgbidreviewchair, 'WARNING', 'msgbidreviewchair');
				BidReviewApprovalValidation(false);
			}
			else
			{
				if (BidReviewApprovalValidation(true))
				{
					if (bidReviewDate != null && bidReviewDate > newDate)
					{
						Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
							'<font size="3" color="#000000"></br>The selected Bid Review date is greater than the current date.\n Do you want to Continue? </br></br>Click "Proceed with Approval" to confirm, or "Do Not Approve" to cancel.</font>', [
						{
							label: "<b>Proceed with Approval</b>",
							callback: function ()
							{
								approveCallbackAction(approvalType);
								moveToNextTrigger = false;
							},
							setFocus: false,
							preventClose: false},
						{
							label: "<b>Do Not Approve</b>",
							setFocus: true,
							preventClose: false}
                            ],
							"WARNING", 500, 350, '', true);
					}
					else
					{
						approveCallbackAction(approvalType);
						moveToNextTrigger = false;
					}
				}
			}
		}
	}
}

function BidReviewApprovalValidation(showmsg)
{
	Xrm.Page.ui.clearFormNotification('msgbidreviewmandfield');
	var result = true;
	if (showmsg)
	{
		var msg = '';
		if (!CheckMandatoryFields())
		{
			msg = 'To complete the Bid Review please fill in the mandatory fields ';
			result = false;
		}
		if (IsCrossRegionBid())
		{ // if cross region fields not filled
			var msgCrossRegion =
				'To complete the Bid Review please fill in the mandatory fields and ensure that the cross country checks have been completed.';
			if (!CrossRegionFieldsFilled()) msg += "along with all fields required for cross country check.";;
		}
		if (!result) Xrm.Page.ui.setFormNotification(msg, 'WARNING', 'msgbidreviewmandfield');
	}
	return result;
}

function CheckMandatoryFields()
{
	var result = true;
	if (Xrm.Page.getAttribute('ccrm_bidreview').getValue() == null)
	{
		result = false;
		highlightField('#header_process_ccrm_bidreview', '#ccrm_bidreview');
	}
	else highlightField('#header_process_ccrm_bidreview', '#ccrm_bidreview', true);
	if (Xrm.Page.getAttribute('ccrm_contractconditions').getValue() == null)
	{
		result = false;
		highlightField('#header_process_ccrm_contractconditions1', '#header_process_ccrm_contractconditions');
	}
	else highlightField('#header_process_ccrm_contractconditions1', '#header_process_ccrm_contractconditions', true);
	if (Xrm.Page.getAttribute('ccrm_bidreviewchair_userid').getValue() == null)
	{
		result = false;
		highlightField('#header_process_ccrm_bidreviewchair_userid', '#ccrm_bidreviewchair_userid');
	}
	else highlightField('#header_process_ccrm_bidreviewchair_userid', '#ccrm_bidreviewchair_userid', true);
	if (Xrm.Page.getAttribute('ccrm_estimatedvalue_num').getValue() == null)
	{
		result = false;
		highlightField(null, '#ccrm_estimatedvalue_num');
	}
	else highlightField(null, '#ccrm_estimatedvalue_num', true);
	if (Xrm.Page.getAttribute('ccrm_estexpenseincome_num').getValue() == null)
	{
		result = false;
		highlightField(null, '#ccrm_estexpenseincome_num');
	}
	else highlightField(null, '#ccrm_estexpenseincome_num', true);
	if (Xrm.Page.getAttribute('ccrm_estprojectresourcecosts_num').getValue() == null)
	{
		result = false;
		highlightField(null, '#ccrm_estprojectresourcecosts_num');
	}
	else highlightField(null, '#ccrm_estprojectresourcecosts_num', true);
	if (Xrm.Page.getAttribute('ccrm_projectmanager_userid').getValue() == null)
	{
		result = false;
		highlightField(null, '#ccrm_projectmanager_userid');
	}
	else highlightField(null, '#ccrm_projectmanager_userid', true);
	if (Xrm.Page.getAttribute('ccrm_projectdirector_userid').getValue() == null)
	{
		result = false;
		highlightField(null, '#ccrm_projectdirector_userid');
	}
	else highlightField(null, '#ccrm_projectdirector_userid', true);
	if (Xrm.Page.getAttribute('ccrm_estarupinvolvementstart').getValue() == null)
	{
		result = false;
		highlightField(null, '#ccrm_estarupinvolvementstart');
	}
	else highlightField(null, '#ccrm_estarupinvolvementstart', true);
	if (Xrm.Page.getAttribute('ccrm_estarupinvolvementend').getValue() == null)
	{
		result = false;
		highlightField(null, '#ccrm_estarupinvolvementend');
	}
	else highlightField(null, '#ccrm_estarupinvolvementend', true);
	if (Xrm.Page.getAttribute('ccrm_descriptionofextentofarupservices').getValue() == null)
	{
		result = false;
		highlightField(null, '#ccrm_descriptionofextentofarupservices');
	}
	else highlightField(null, '#ccrm_descriptionofextentofarupservices', true);
	if (Xrm.Page.getAttribute('ccrm_pirequirement').getValue() == null)
	{
		result = false;
		highlightField('#header_process_ccrm_pirequirement', null);
	}
	else highlightField('#header_process_ccrm_pirequirement', null, true);
	if (Xrm.Page.getAttribute('ccrm_pi_transactioncurrencyid').getValue() == null)
	{
		result = false;
		highlightField('#header_process_ccrm_pi_transactioncurrencyid1', null);
	}
	else highlightField('#header_process_ccrm_pi_transactioncurrencyid1', null, true);
	if (Xrm.Page.getAttribute('ccrm_pirequirement').getValue() == PI_REQUIREMENT.MIN_COVER && Xrm.Page.getAttribute('ccrm_pilevelmoney_num').getValue() == null)
	{
		result = false;
		highlightField('#header_process_ccrm_pilevelmoney_num', null);
	}
	else highlightField('#header_process_ccrm_pilevelmoney_num', null, true);
	if (Xrm.Page.getAttribute('ccrm_chargingbasis').getValue() == null && Xrm.Page.getAttribute('ccrm_arupbusinessid').getValue()[0].name != 'Charity & Community')
	{
		result = false;
		highlightField('#header_process_ccrm_chargingbasis', null);
		highlightField(null, '#ccrm_chargingbasis');
	}
	else
	{
		highlightField('#header_process_ccrm_chargingbasis', null, true);
		highlightField(null, '#ccrm_chargingbasis', true);
	}
	return result;
}
//CheckFinanceFields

function CheckFinanceFields()
{
	var result = true;
	var stageid = getStageId();
	if (stageid == ArupStages.BidDevelopment || stageid == ArupStages.BidReviewApproval)
	{
		if (Xrm.Page.getAttribute('ccrm_estimatedvalue_num').getValue() == null)
		{
			result = false;
			highlightField(null, '#ccrm_estimatedvalue_num');
		}
		else highlightField(null, '#ccrm_estimatedvalue_num', true);
		if (Xrm.Page.getAttribute('ccrm_estexpenseincome_num').getValue() == null)
		{
			result = false;
			highlightField(null, '#ccrm_estexpenseincome_num');
			Xrm.Page.getAttribute("ccrm_estexpenseincome_num").setRequiredLevel('required');
		}
		else
		{
			highlightField(null, '#ccrm_estexpenseincome_num', true);
			Xrm.Page.getAttribute("ccrm_estexpenseincome_num").setRequiredLevel('none');
		}
		if (Xrm.Page.getAttribute('ccrm_projecttotalincome_num').getValue() == null)
		{
			result = false;
			highlightField(null, '#ccrm_projecttotalincome_num');
			Xrm.Page.getAttribute("ccrm_projecttotalincome_num").setRequiredLevel('required');
		}
		else
		{
			highlightField(null, '#ccrm_projecttotalincome_num', true);
			Xrm.Page.getAttribute("ccrm_projecttotalincome_num").setRequiredLevel('none');
		}
		if (Xrm.Page.getAttribute('ccrm_estprojectresourcecosts_num').getValue() == null)
		{
			result = false;
			highlightField(null, '#ccrm_estprojectresourcecosts_num');
			Xrm.Page.getAttribute("ccrm_estprojectresourcecosts_num").setRequiredLevel('required');
		}
		else
		{
			highlightField(null, '#ccrm_estprojectresourcecosts_num', true);
			Xrm.Page.getAttribute("ccrm_estprojectresourcecosts_num").setRequiredLevel('none');
		}
		if (Xrm.Page.getAttribute('ccrm_estprojectstaffoverheadsrate').getValue() == null)
		{
			result = false;
			highlightField(null, '#ccrm_estprojectstaffoverheadsrate');
			Xrm.Page.getAttribute("ccrm_estprojectstaffoverheadsrate").setRequiredLevel('required');
		}
		else
		{
			highlightField(null, '#ccrm_estprojectstaffoverheadsrate', true);
			Xrm.Page.getAttribute("ccrm_estprojectstaffoverheadsrate").setRequiredLevel('none');
		}
		/*
                if (Xrm.Page.getAttribute('ccrm_estprojectexpenses_num').getValue() == null) {
                    result = false;
                    highlightField(null, '#ccrm_estprojectexpenses_num');
                    Xrm.Page.getAttribute("ccrm_estprojectexpenses_num").setRequiredLevel('required');
                } else {
                    highlightField(null, '#ccrm_estprojectexpenses_num', true);
                    Xrm.Page.getAttribute("ccrm_estprojectexpenses_num").setRequiredLevel('none');
                }
        */
		if (Xrm.Page.getAttribute('arup_expenses_num').getValue() == null)
		{
			result = false;
			highlightField(null, '#arup_expenses_num');
			Xrm.Page.getAttribute("arup_expenses_num").setRequiredLevel('required');
		}
		else
		{
			highlightField(null, '#arup_expenses_num', true);
			Xrm.Page.getAttribute("arup_expenses_num").setRequiredLevel('none');
		}
		/*
                if (Xrm.Page.getAttribute('ccrm_projecttotalcosts_num').getValue() == null) {
                    result = false;
                    highlightField(null, '#ccrm_projecttotalcosts_num');
                    Xrm.Page.getAttribute("ccrm_projecttotalcosts_num").setRequiredLevel('required');
                } else {
                    highlightField(null, '#ccrm_projecttotalcosts_num', true);
                    Xrm.Page.getAttribute("ccrm_projecttotalcosts_num").setRequiredLevel('none');
                }
        */
		if (Xrm.Page.getAttribute('ccrm_chargingbasis').getValue() == null && Xrm.Page.getAttribute('ccrm_arupbusinessid').getValue()[0].name != 'Charity & Community')
		{
			result = false;
			highlightField(null, '#ccrm_chargingbasis');
			highlightField('#header_process_ccrm_chargingbasis', null);
			Xrm.Page.getAttribute("ccrm_chargingbasis").setRequiredLevel('required');
		}
		else
		{
			highlightField(null, '#ccrm_chargingbasis', true);
			highlightField(null, '#ccrm_chargingbasis', true);
			Xrm.Page.getAttribute("ccrm_chargingbasis").setRequiredLevel('none');
		}
		if (result) Xrm.Page.getAttribute("ccrm_financedetailscaptured").setValue("Completed");
		else Xrm.Page.getAttribute("ccrm_financedetailscaptured").setValue(null);
		Xrm.Page.getAttribute("ccrm_financedetailscaptured").setSubmitMode("always");
		//Xrm.Page.data.save();
	}
	return result;
}
// implementation pending

function IsBidReviewChair()
{
	var result = false;
	var currUser = Xrm.Page.context.getUserId();
	if (Xrm.Page.getAttribute('ccrm_bidreviewchair_userid').getValue() != null)
	{
		if (currUser == Xrm.Page.getAttribute('ccrm_bidreviewchair_userid').getValue()[0].id) result = true;
	}
	return result;
}

function updateBidReviewForm()
{
	if (getStageId() == ArupStages.BidReviewApproval)
	{
		var panelname = Xrm.Page.getAttribute('ccrm_bidreviewchair_userid').getValue()[0].name;
		SDK.REST.retrieveMultipleRecords("Ccrm_bidreview", "$orderby=CreatedOn desc&$select=Ccrm_bidreviewId&$top=1&$filter=Ccrm_OpportunityId/Id eq (guid'" + Xrm.Page.data.entity.getId() + "')",

		function (results)
		{
			if (results.length > 0)
			{
				updateBidreviewPanel(results[0].Ccrm_bidreviewId, panelname);
			}
		},
		errorHandler,

		function ()
		{},
		false);
	}
}

function updateBidreviewPanel(bidreviewid, panelname)
{
	var bidreview = {};
	bidreview.Ccrm_ReviewPanel = panelname;
	SDK.REST.updateRecord(bidreviewid, bidreview, "Ccrm_bidreview", function ()
	{}, errorHandler);
}

function bidreviewchair_userid_onchange()
{
	var regionName = Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name.toUpperCase();
	var newBidReviewChair = Xrm.Page.getControl("header_process_ccrm_bidreviewchair_userid1") || Xrm.Page.getControl("header_process_ccrm_bidreviewchair_userid");
	var currentbidreviewchair = Xrm.Page.getAttribute('ccrm_currentbidreviewchair').getValue();
	var oldBidReviewChair;
	if (newBidReviewChair != null)
	{
		if (newBidReviewChair.getAttribute() != null)
		{
			if (newBidReviewChair.getAttribute().getValue() != null)
			{
				if (newBidReviewChair.getAttribute().getValue().length > 0) newBidReviewChair = newBidReviewChair.getAttribute().getValue()[0].id;
			}
		}
	}
	if (currentbidreviewchair != null && currentbidreviewchair.length > 0)
	{
		oldBidReviewChair = currentbidreviewchair[0].id;
	}
	if (regionName == "AUSTRALASIA REGION" || regionName == "MALAYSIA REGION")
	{
		var BMBR = Xrm.Page.getAttribute('ccrm_bidmanager_userid').getValue()[0].id,
			BDBR = Xrm.Page.getAttribute('ccrm_biddirector_userid').getValue()[0].id;
		if (newBidReviewChair == BMBR || newBidReviewChair == BDBR)
		{
			if (newBidReviewChair != null && newBidReviewChair.length > 0 && oldBidReviewChair != null && oldBidReviewChair.length > 0)
			{
				Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
					'<font size="3" color="#000000"></br>Please be aware that changing the Bid Review Chair will update the Review Panel of existing Bid Review Form record and notification will be send to new Bid Review Chair.</br></br>Click Approve to confirm and save the record, or Do Not Approve to stay on the current page.</font>', [
				{
					label: "<b>Approve</b>",
					callback: function ()
					{
						//Date - 04/04/2016 - To identify whether Bid Review Chair person is changed
						if (Xrm.Page.getAttribute('ccrm_currentbidreviewchair').getValue() != null)
						{
							if (Xrm.Page.getAttribute('ccrm_bidreviewchair_userid').getValue()[0].id != Xrm.Page.getAttribute('ccrm_currentbidreviewchair').getValue()[0].id)
							{
								updateBidReviewForm();
							}
						}
						Xrm.Page.data.save();
					},
					setFocus: false,
					preventClose: false},
				{
					label: "<b>Do Not Approve</b>",
					callback: function ()
					{
						Xrm.Page.getAttribute("ccrm_bidreviewchair_userid").setValue(oldBidReviewChair);
					},
					setFocus: true,
					preventClose: false}
                    ],
					"WARNING", 550, 350, '', true);
			}
		}
		else
		{
			Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
				'<font size="3" color="#000000"></br> Please select either the Bid Manager or the Bid Director</font>', [
			{
				label: "<b>OK</b>",
				setFocus: true},
                ],
				"ERROR", 500, 250, '', true);
			Xrm.Page.getAttribute("ccrm_bidreviewchair_userid").setValue(null);
		}
	}
	else
	{
		if (newBidReviewChair != null && newBidReviewChair.length > 0 && oldBidReviewChair != null && oldBidReviewChair.length > 0)
		{
			Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
				'<font size="3" color="#000000"></br>Please be aware that changing the Bid Review Chair will update the Review Panel of existing Bid Review Form record and notification will be send to new Bid Review Chair.</br></br>Click Approve to confirm and save the record, or Do Not Approve to stay on the current page.</font>', [
			{
				label: "<b>Approve</b>",
				callback: function ()
				{
					//Date - 04/04/2016 - To identify whether Bid Review Chair person is changed
					if (Xrm.Page.getAttribute('ccrm_currentbidreviewchair').getValue() != null)
					{
						if (Xrm.Page.getAttribute('ccrm_bidreviewchair_userid').getValue()[0].id != Xrm.Page.getAttribute('ccrm_currentbidreviewchair').getValue()[0].id)
						{
							updateBidReviewForm();
						}
					}
					Xrm.Page.data.save();
				},
				setFocus: false,
				preventClose: false},
			{
				label: "<b>Do Not Approve</b>",
				callback: function ()
				{
					Xrm.Page.getAttribute("ccrm_bidreviewchair_userid").setValue(oldBidReviewChair);
				},
				setFocus: true,
				preventClose: false}
                ],
				"WARNING", 550, 350, '', true);
		}
	}
}
// Bid Review Approval -  ribbon button click - ends

function IsCrossRegionBid()
{
	var crossregionbid = false;
	var regionName;
	if (Xrm.Page.getAttribute("ccrm_arupregionid").getValue() != null) if (Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name != null) regionName = Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name.toUpperCase();
	if (Xrm.Page.getAttribute("ccrm_projectcountryregionid").getValue() != null)
	{
		if (Xrm.Page.getAttribute("ccrm_projectcountryregionid").getValue()[0].name != null)
		{
			if (Xrm.Page.getAttribute("ccrm_projectcountryregionid").getValue()[0].name != null)
			{
				var projcountry = Xrm.Page.getAttribute("ccrm_projectcountryregionid").getValue()[0].name.toUpperCase();
				if (projcountry != regionName) crossregionbid = true;
			}
		}
	}
	return crossregionbid;
}

function ValidatePJNGrpLdr()
{
	if (Xrm.Page.getAttribute("ccrm_arupregionid").getValue() != null) regionName = Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name;
	if (regionName == ArupRegionName.EastAsia)
	{
		if (Xrm.Page.getAttribute('ccrm_groupleaderapprovaloptions').getValue() != 100000001)
		{
			Xrm.Page.getAttribute('ccrm_groupleaderapprovaloptions').setValue(100000001);
			Xrm.Page.getAttribute("ccrm_groupleaderapprovaloptions").setSubmitMode("always");
			Xrm.Page.data.save();
		}
	}
}

function CJNApprovalButtonClick(type, approvalType, statusField, userField, dateField)
{
	if (!IsFormValid())
	{
		return
	};
	var ackMsg = ApprovalConfirmationMessage(approvalType);
	var msg = 'You are about to approve a Bid where you are not listed as approver. \n Do you want to Continue ?';
	var output = ValidateApproval(msg, approvalType);
	if (approvalType == "FinanceApproval" || approvalType == "AccCenterLeadApproval" || approvalType == "GroupLeaderApproval")
	{
		if (output == true)
		{
			var apprType;
			switch (approvalType)
			{
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
				'<font size="3" color="#000000"></br>Are you sure you want to proceed with ' + apprType + ' approval? Click "YES" to confirm your selection or "Do not approve" to cancel it.</font>', [
			{
				label: "<b>Do not approve</b>",
				setFocus: true},
			{
				label: "<b>Yes</b>",
				setFocus: false,
				callback: function ()
				{
					approveCallbackAction(approvalType);
					Xrm.Page.getAttribute(statusField).fireOnChange();
					Xrm.Page.ui.clearFormNotification('CurrentApprovers');
					if (approvalType == 'FinanceApproval')
					{
						// Poll for the opportunity to enter the Won state
						pollForChangeAsync(
							"StateCode",

						function isWon(statecode)
						{
							return !!statecode && statecode.Value != OPPORTUNITY_STATE.OPEN
						},

						function reloadForm()
						{
							Xrm.Utility.openEntityForm(Xrm.Page.data.entity.getEntityName(), Xrm.Page.data.entity.getId());
						});
					}
					else
					{
						setCurrentApproversAsync();
					}
				},
				}
                ],
				"QUESTION",
			500,
			250,
				'',
			true);
		}
		else
		{
			Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
				'<font size="3" color="#000000"></br>' + ackMsg + '</font>', [
			{
				label: "<b>OK</b>",
				setFocus: true},
                ],
				"ERROR",
			500,
			250,
				'',
			true);
		}
	}
	else
	{
		Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
			'<font size="3" color="#000000"></br>' + ackMsg + '</font>', [
		{
			label: "<b>Proceed with Approval</b>",
			callback: function ()
			{
				approveCallbackAction(approvalType);
				Xrm.Page.getAttribute(statusField).fireOnChange();
				Xrm.Page.ui.clearFormNotification('CurrentApprovers');
				if (approvalType == 'FinanceApproval' || approvalType == 'AccCenterLeadApproval' || approvalType == "GroupLeaderApproval")
				{
					Xrm.Utility.openEntityForm(Xrm.Page.data.entity.getEntityName(), Xrm.Page.data.entity.getId());
				}
				else
				{
					setCurrentApproversAsync();
				}
			},
			setFocus: false,
			preventClose: false},
		{
			label: "<b>Do Not Approve</b>",
			setFocus: true,
			preventClose: false}
            ],
			"WARNING", 550, 300, '', true);
	}
}
//function for the oppo progress button 
possibleJNRequired_onChange = function ()
{
	// Job required = true - we will simulate the get job number button 
	if (Xrm.Page.getAttribute("ccrm_possiblejobnumberrequired").getValue() == 1)
	{
		if (Xrm.Page.getAttribute("ccrm_sys_dtp_gateway").getValue() != true)
		{
			var regionName = Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name;
			Xrm.Page.getAttribute("ccrm_sys_dtp_gateway").setValue(true);
			//setRequiredFields_DecisionToProceed();
			Xrm.Page.getAttribute("ccrm_pjn_opportunitytype").setValue(OpportunityType.Full);
			if (regionName == "East Asia Region" || regionName == "Australasia Region" || regionName == "Malaysia Region" && regionName != null)
			{
				Xrm.Page.getAttribute("ccrm_sys_dtb_approval").setValue(false);
			}
			Xrm.Page.ui.refreshRibbon();
		}
	}
	// set bid review gateway value from ribbon button Request Bid Review without Possible Job Number (2)
	else if (Xrm.Page.getAttribute("ccrm_possiblejobnumberrequired").getValue() == 0)
	{
		if (Xrm.Page.getAttribute("ccrm_sys_bidreview_gateway").getValue() != true)
		{
			Xrm.Page.getAttribute("ccrm_sys_bidreview_gateway").setValue(true);
			Xrm.Page.getAttribute("ccrm_pjn_opportunitytype").setValue(OpportunityType.Simple);
			Xrm.Page.ui.refreshRibbon();
		}
	}
	if (Xrm.Page.getAttribute("ccrm_arupregionid").getValue() != null)
	{
		var regionName = Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name;
		if ((regionName == "UKMEA Region" || regionName == "UKIMEA Region" || regionName == "UKIMEA" || regionName == "UKMEA" || regionName == "Americas Region" || regionName == "Europe" || regionName == "Corporate Services" || regionName == "Digital Technology") && Xrm.Page.getAttribute("ccrm_pjna").getValue() != "Requested")
		{
			var msgOut = "By clicking OK you will assign a possible job number. No approval requests will be sent.\n\nYou must ensure that you have completed all the requirements of your regional bid policy and attached supporting evidence - such as a Decision to Proceed record signed by a Director.\n\nIf you are not sure if you have complied with your regional requirements please consult a Director before progressing.";
			var response = window.confirm(msgOut);
			if (response)
			{
				Xrm.Page.getAttribute("ccrm_sys_dtb_approval").setValue(true);
				Xrm.Page.getAttribute("ccrm_sys_pjnrequesteduser_trigger").setValue(true);
				Xrm.Page.getAttribute("ccrm_sys_phasename").setValue("Possible Job – Bid in Development");
				Xrm.Page.getAttribute("ccrm_pjna").setValue("Requested");
				Xrm.Page.ui.setFormNotification("A possible Job number is being generated it may take a couple of minutes to appear on the opportunity screen and couple of hours to appear on the financial systems.", "INFO", "PJNProgress");
				setTimeout(function ()
				{
					Xrm.Page.ui.clearFormNotification("PJNProgress");
				}, 10000);
				Xrm.Page.data.save();
			}
			else
			{
				Xrm.Page.getAttribute("ccrm_possiblejobnumberrequired").setValue(null);
				resetSysFlags();
				Xrm.Page.getAttribute("ccrm_showpjnbutton").setValue(1);
				Xrm.Page.data.save();
			}
		}
		// All Other regions
		else
		{
			if (regionName == "East Asia Region" || regionName == "Australasia Region" || regionName == "Malaysia Region")
			{
				Xrm.Page.getAttribute("ccrm_sys_dtb_approval").setValue(false);
				Xrm.Page.getAttribute("ccrm_sys_op_trigger").setValue('1'); //opportunity progress workflow trigger - OP: 1.0: Trigger            
				Xrm.Page.getAttribute("ccrm_sys_pjnrequesteduser_trigger").setValue(true);
				//sets the trigger to set the pjn user from plugin - also used to lock down the track fields
				Xrm.Page.getAttribute("ccrm_sys_pjnrequesteduser_trigger").setSubmitMode("always");
				customerid_onChange(); //check if a valid customer is set and if not set a notification                
				ccrm_opportunitytype_onchange();
				//check if the opportunity has a valid track and if not set a notification
				Xrm.Page.ui.setFormNotification("Your request for a Possible Job Number has been logged. Decision to Proceed approvals are being generated.", "INFO", "PJNProgress");
				setTimeout(function ()
				{
					Xrm.Page.ui.clearFormNotification("PJNProgress");
				}, 10000);
				Xrm.Page.data.save();
			}
		}
	}
}
//function to reset system flags

function resetSysFlags()
{
	var sysDTP = Xrm.Page.getAttribute("ccrm_sys_dtp_gateway").getValue();
	var sysBR = Xrm.Page.getAttribute("ccrm_sys_bidreview_gateway").getValue();
	var sysDTPApproved = Xrm.Page.getAttribute("ccrm_sys_dtb_approval").getValue();
	var sysBRApproved = Xrm.Page.getAttribute("ccrm_sys_br_review").getValue();
	var sysOppotype = Xrm.Page.getAttribute("ccrm_pjn_opportunitytype").getValue();
	var statusCode = Xrm.Page.getAttribute("statuscode").getValue();
	if (statusCode == 200013)
	{ // Status = Open Lead
		if (sysDTP == true && sysOppotype == OpportunityType.Full)
		{
			Xrm.Page.getAttribute("ccrm_sys_dtp_gateway").setValue(false) //reset the dtp flag
			Xrm.Page.getAttribute("ccrm_pjn_opportunitytype").setValue(null);
		}
		else if (sysBR == true && sysOppotype == OpportunityType.Simple)
		{
			Xrm.Page.getAttribute("ccrm_sys_bidreview_gateway").setValue(false); //reset the br flag
			Xrm.Page.getAttribute("ccrm_pjn_opportunitytype").setValue(null);
		}
	}
	else
	{
		if (sysDTP == true && sysDTPApproved == false && sysOppotype == OpportunityType.Full)
		{
			Xrm.Page.getAttribute("ccrm_sys_dtp_gateway").setValue(false);
		}
		else if (sysBR == true && sysBRApproved == false && sysOppotype == OpportunityType.Full)
		{
			Xrm.Page.getAttribute("ccrm_sys_bidreview_gateway").setValue(false);
		}
		else if (sysBR == true && sysBRApproved == false && sysOppotype == OpportunityType.Simple)
		{
			Xrm.Page.getAttribute("ccrm_sys_bidreview_gateway").setValue(false);
		}
	}
	if (Xrm.Page.getAttribute("ccrm_sys_op_trigger").getValue() == 1) Xrm.Page.getAttribute("ccrm_sys_op_trigger").setValue(null);
}

function moveNext(currentStage)
{

    var pollingAttemptsRemaining = 10;
	var intervalId;
	//Cycle through code every 2 seconds for dirty check
	intervalId = setInterval(function ()
	{
		pollingAttemptsRemaining -= 1;
		if (Xrm.Page.data.process.getActiveStage().getId() != currentStage)
		{
			clearInterval(intervalId);
		}
		//Check if form is dirty, if it is not and the stage has not changed then attempt to moveNext
		if (!Xrm.Page.data.entity.getIsDirty() && Xrm.Page.data.process.getActiveStage().getId() == currentStage)
		{
			Xrm.Page.data.process.moveNext(moveResult);
			pollingAttemptsRemaining = 0;
			clearInterval(intervalId);
		}
		//If number of attempts remaining has passed exit code
		if (pollingAttemptsRemaining <= 0)
		{
			clearInterval(intervalId);
		}
	},
	200);
}

function moveResult(args)
{
	var a = args;
}

function requestConfirmJob()
{
	var v1 = Xrm.Page.getAttribute('ccrm_chargingbasis').getValue();
	var v2 = Xrm.Page.getAttribute('ccrm_estexpenseincome_num').getValue();
	var v3 = Xrm.Page.getAttribute('ccrm_projecttotalincome_num').getValue();
	var v4 = Xrm.Page.getAttribute('ccrm_projectmanager_userid').getValue();
	var v5 = Xrm.Page.getAttribute('ccrm_projectdirector_userid').getValue();
	var v6 = Xrm.Page.getAttribute('ccrm_estprojectresourcecosts_num').getValue();
	var v7 = Xrm.Page.getAttribute('ccrm_estarupinvolvementstart').getValue();
	var v8 = Xrm.Page.getAttribute('ccrm_estarupinvolvementend').getValue();
	var v9 = Xrm.Page.getAttribute('ccrm_estimatedvalue_num').getValue();
	var v10 = Xrm.Page.getAttribute('ccrm_estprojectoverheads_num').getValue();
	var v11 = Xrm.Page.getAttribute('ccrm_estprojectexpenses_num').getValue();
	var v12 = Xrm.Page.getAttribute('ccrm_projecttotalcosts_num').getValue();
	var v13 = Xrm.Page.getAttribute('ccrm_estprojectprofit_num').getValue();
	var v14 = Xrm.Page.getAttribute('ccrm_profitasapercentageoffeedec').getValue();
	var v15 = Xrm.Page.getAttribute('ccrm_theworksvalue').getValue();
	var v16 = Xrm.Page.getAttribute('ccrm_servicesvalue').getValue();
	var v17 = Xrm.Page.getAttribute('ccrm_projectsectorvalue').getValue();
	var v18 = Xrm.Page.getAttribute('ccrm_pilevelmoney_num').getValue();
	var v19 = Xrm.Page.getAttribute('ccrm_shorttitle').getValue();
	var v21 = Xrm.Page.getAttribute('ccrm_pirequirement').getValue();
	var v20 = 0; //needs to be 1
	validateAccCenter(false);
	v20 = Xrm.Page.getAttribute('ccrm_validaccountingcentre').getValue(); //needs to be 1
	var v15, v16, v17;
	if (v20 == 0)
	{}
	else if (v1 == null || v2 == null || v3 == null || v4 == null || v5 == null || v6 == null || v7 == null || v8 == null || v9 == null || v10 == null || v11 == null || v12 == null || v13 == null || v14 == null || v15 == null || v16 == null || v17 == null || (v21 == PI_REQUIREMENT.MIN_COVER && v18 == null) || v19 == null)
	{
		Xrm.Page.ui.setFormNotification("Please fill in all mandatory fields", "WARNING", "reqCJNWarnMsg-mandfields");
		setTimeout(function ()
		{
			Xrm.Page.ui.clearFormNotification("reqCJNWarnMsg-mandfields");
		}, 10000);
		highlightField('#header_process_ccrm_chargingbasis', '#ccrm_chargingbasis', (v1 != null) ? true : false);
		highlightField('#header_process_ccrm_estexpenseincome_num1',
			'#ccrm_estexpenseincome_num', (v2 != null) ? true : false);
		highlightField('#header_process_ccrm_projecttotalincome_num',
			'#ccrm_projecttotalincome_num', (v3 != null) ? true : false);
		highlightField('#header_process_ccrm_projectmanager_userid1',
			'#ccrm_projectmanager_userid', (v4 != null) ? true : false);
		highlightField('#header_process_ccrm_projectdirector_userid1',
			'#ccrm_projectdirector_userid', (v5 != null) ? true : false);
		highlightField('#header_process_ccrm_estprojectresourcecosts_num1',
			'#ccrm_estprojectresourcecosts_num', (v6 != null) ? true : false);
		highlightField('#header_process_ccrm_estarupinvolvementstart',
			'#ccrm_estarupinvolvementstart', (v7 != null) ? true : false);
		highlightField('#header_process_ccrm_estarupinvolvementend',
			'#ccrm_estarupinvolvementend', (v8 != null) ? true : false);
		highlightField('#header_process_ccrm_estimatedvalue_num2',
			'#ccrm_estimatedvalue_num', (v9 != null) ? true : false);
		highlightField('#header_process_ccrm_estprojectoverheads_num',
			'#ccrm_estprojectoverheads_num', (v10 != null) ? true : false);
		highlightField('#header_process_ccrm_estprojectexpenses_num1',
			'#ccrm_estprojectexpenses_num', (v11 != null) ? true : false);
		highlightField('#header_process_ccrm_projecttotalcosts_num',
			'#ccrm_projecttotalcosts_num', (v12 != null) ? true : false);
		highlightField('#header_process_ccrm_estprojectprofit_num',
			'#ccrm_estprojectprofit_num', (v13 != null) ? true : false);
		highlightField('#header_process_ccrm_profitasapercentageoffeedec',
			'#ccrm_profitasapercentageoffeedec', (v14 != null) ? true : false);
		highlightField('#header_process_ccrm_pilevelmoney_num2', '#ccrm_pilevelmoney_num', (v18 != null) ? true : false);
		highlightField('#header_process_ccrm_theworksname', '', (v15 != null) ? true : false);
		highlightField('#header_process_ccrm_servicesname', '', (v16 != null) ? true : false);
		highlightField('#header_process_ccrm_projectsectorname', '', (v17 != null) ? true : false);
		highlightField(null, "#ccrm_shorttitle", (v19 != null) ? true : false);
		Xrm.Page.getAttribute("ccrm_shorttitle").setRequiredLevel("required");
		if (v19 == null && Xrm.Page.ui.tabs.get("tab_7").getDisplayState() == "collapsed")
		{
			Xrm.Page.ui.tabs.get("tab_7").setDisplayState('expanded');
		}
	}
	else
	{
		Xrm.Page.data.save();
		//[RS - Added project participant check for PBI - 39838]
		var projPartApp = Xrm.Page.getAttribute("arup_projpartreqd").getValue();
		var currUserId = Xrm.Page.context.getUserId();
		var lstCJNUsr = Xrm.Page.getAttribute("arup_aruplastcjnclickuser").getValue();
		var lstCJNUsrId = (lstCJNUsr != null) ? lstCJNUsr[0].id : null;
		if (projPartApp == 770000000)
		{
			var ProjectPartExists = projectParticipantExists();
			if (ProjectPartExists == true)
			{
				if (lstCJNUsrId = null || lstCJNUsrId != currUserId)
				{
					Alert.show('<font face="Segoe UI Light" font size="6" color="0472C4">Please Review</font>',
						'<font face="Segoe UI Light" font size="3" color="#000000"></br>Would you like to add more Project Collaborators before requesting a Confirmed Job?</font>', [
					{
						label: "<b>Yes - Add More Collaborators</b>",
						callback: function ()
						{},
						setFocus: true,
						preventClose: false},
					{
						label: "<b>No - Proceed to CJN</b>",
						callback: function ()
						{
							setTimeout(function ()
							{
								openNewCJNAForm(true);
							}, 1500);
						},
						setFocus: false,
						preventClose: false}
                        ], 'INFO', 500, 250, '', true);
				}
				else
				{
					setTimeout(function ()
					{
						openNewCJNAForm(true);
					}, 1500);
				}
			}
			else
			{
				Alert.show('<font face="Segoe UI Light" size="6" color="#FF0000">Add Project Collaborators</font>',
					'<font face="Segoe UI Light" size="3" color="#000000">You said that Project Collaborators are required.</br>Please add them before requesting a Confirmed Job Number.</font>', [
				{
					label: "<b>OK</b>",
					setFocus: true},
                    ], "ERROR", 500, 230, '', true);
			}
		}
		//    var organisationUrl = Xrm.Page.context.getClientUrl();
		//    var optyId = Xrm.Page.data.entity.getId();
		//    optyId = optyId.replace('{', '').replace('}', '');
		//    var query = "/api/data/v8.1/arup_projectparticipants?$select=arup_projectparticipantid&$filter=arup_opportunity/opportunityid eq (" + optyId + ")";
		//    //Query the project participant records for the selected opportunity
		//    var ppreq = new XMLHttpRequest();
		//    ppreq.open("GET", encodeURI(organisationUrl + query), true);
		//    ppreq.setRequestHeader("Accept", "application/json");
		//    ppreq.setRequestHeader("Content-Type", "application/json; charset=utf-8");
		//    ppreq.setRequestHeader("OData-MaxVersion", "4.0");
		//    ppreq.setRequestHeader("OData-Version", "4.0");
		//    ppreq.onreadystatechange = function () {
		//        if (this.readyState == 4) {
		//            ppreq.onreadystatechange = null;
		//            if (this.status == 200) {
		//                ppresult = JSON.parse(this.response);
		//                if (ppresult && ppresult.value[0]) { //If record found then check if alert has already been given
		//                    if (lstCJNUsrId = null || lstCJNUsrId != currUserId) {
		//                        Alert.show('<font face="Segoe UI Light" font size="6" color="0472C4">Please Review</font>',
		//                            '<font face="Segoe UI Light" font size="3" color="#000000"></br>Please review the Project Participants before proceeding to Confirmed Job</br>Click "Cancel" to return to the Opportunity form and add more project participants.</font>',
		//                            [
		//                                {
		//                                    label: "<b>Request Confirmed Job</b>",
		//                                    callback: function () {
		//                                        setTimeout(function () { openNewCJNAForm(true); }, 1500);
		//                                    }
		//                                    ,
		//                                    setFocus: true,
		//                                    preventClose: false
		//                                },
		//                                {
		//                                    label: "<b>Cancel</b>",
		//                                    callback: function () {
		//                                    },
		//                                    setFocus: false,
		//                                    preventClose: false
		//                                }
		//                            ],
		//                            'INFO',
		//                            650,
		//                            250,
		//                            '',
		//                            true);
		//                    }
		//                    else {
		//                        setTimeout(function () { openNewCJNAForm(true); }, 1500);
		//                    }
		//                }
		//                else {
		//                    Alert.show('<font face="Segoe UI Light" size="6" color="#FF0000"></font>',
		//                        '<font face="Segoe UI Light" size="3" color="#000000">You said that Project Participants are required.</br>Please add them before requesting a Confirmed Job Number.</font>',
		//                        [
		//                            { label: "<b>OK</b>", setFocus: true },
		//                        ],
		//                        "ERROR",
		//                        550,
		//                        200,
		//                        '',
		//                        true);
		//                }
		//            } else {
		//                var error = JSON.parse(this.response).error;
		//                alert(error.message);
		//            }
		//        }
		//    };
		//    ppreq.send(null);
		//}
		else
		{
			Alert.show('<font face="Segoe UI Light" font size="6" color="0472C4">Please Review</font>',
				'<font face="Segoe UI Light" font size="3" color="#000000"></br>Do you have Project Collaborators you want to add before requesting a Confirmed Job?</font>', [
			{
				label: "<b>Yes - Add Project Collaborators</b>",
				callback: function ()
				{
					//set arup_aruplastcjnclickuser field with the current user who is requesting CJN
					SetLookupField(Xrm.Page.context.getUserId(), Xrm.Page.context.getUserName(), 'systemuser', 'arup_aruplastcjnclickuser');
					Xrm.Page.getAttribute("arup_projparticipants_reqd").setValue(true);
					Xrm.Page.getAttribute("arup_projpartreqd").setValue(770000000);
					Xrm.Page.data.save();
					var parameters = {}; //set null parameters as there is no need to set any other field
					parameters["arup_opportunity"] = Xrm.Page.data.entity.getId();
					parameters["arup_opportunityname"] = Xrm.Page.getAttribute("name").getValue();
					setTimeout(function ()
					{
						openProjectParticipantPage(parameters);
					}, 2500);
				},
				setFocus: true,
				preventClose: false},
			{
				label: "<b>No - Proceed to CJN</b>",
				callback: function ()
				{
					setTimeout(function ()
					{
						openNewCJNAForm(true);
					}, 2000);
				},
				setFocus: false,
				preventClose: false}
                ], 'QUESTION', 500, 230, '', true);
		}
	}
}

function ccrm_geographicmanagerproxyconsulted2_onchange()
{
	var countrymgrconsulted = Xrm.Page.getAttribute("ccrm_geographicmanagerproxyconsulted2").getValue();
	if (countrymgrconsulted == 2)
	{
		Xrm.Page.getAttribute("ccrm_reasonfornotconsultingcountrymanager").setRequiredLevel("required");
		Xrm.Page.getAttribute("ccrm_dateconsulted").setRequiredLevel("none");
		Xrm.Page.getAttribute("ccrm_dateconsulted").setValue(null);
		highlightField('#header_process_ccrm_reasonfornotconsultingcountrymanager', '#ccrm_reasonfornotconsultingcountrymanager');
		highlightField('#header_process_ccrm_dateconsulted', '#ccrm_dateconsulted', true);
	}
	else if (countrymgrconsulted == 1)
	{
		Xrm.Page.getAttribute("ccrm_reasonfornotconsultingcountrymanager").setRequiredLevel("none");
		Xrm.Page.getAttribute("ccrm_reasonfornotconsultingcountrymanager").setValue(null);
		Xrm.Page.getAttribute("ccrm_dateconsulted").setRequiredLevel("required");
		highlightField('#header_process_ccrm_reasonfornotconsultingcountrymanager', '#ccrm_reasonfornotconsultingcountrymanager', true);
		highlightField('#header_process_ccrm_dateconsulted', '#ccrm_dateconsulted');
	}
}
reasonnotconsulted_onChange = function ()
{
	if (Xrm.Page.getAttribute("ccrm_reasonfornotconsultingcountrymanager").getValue() != null)
	{
		Xrm.Page.getAttribute("ccrm_geographicmanagerproxyconsulted2").setValue(2);
		Xrm.Page.getAttribute("ccrm_geographicmanagerproxyconsulted2").fireOnChange();
	}
	else if (Xrm.Page.getAttribute("ccrm_geographicproxyid").getValue() != null || Xrm.Page.getAttribute("ccrm_dateconsulted").getValue() != null)
	{
		Xrm.Page.getAttribute("ccrm_geographicmanagerproxyconsulted2").setValue(1);
		Xrm.Page.getAttribute("ccrm_geographicmanagerproxyconsulted2").fireOnChange();
	}
}
ccrm_dateconsulted_onChange = function ()
{
	if (Xrm.Page.getAttribute("ccrm_dateconsulted").getValue() != null)
	{
		Xrm.Page.getAttribute("ccrm_geographicmanagerproxyconsulted2").setValue(1);
		Xrm.Page.getAttribute("ccrm_geographicmanagerproxyconsulted2").fireOnChange();
	}
	else if (Xrm.Page.getAttribute("ccrm_geographicproxyid").getValue() != null || Xrm.Page.getAttribute("ccrm_geographicmanagerproxyconsulted2").getValue() != null)
	{
		Xrm.Page.getAttribute("ccrm_geographicmanagerproxyconsulted2").setValue(2);
		Xrm.Page.getAttribute("ccrm_geographicmanagerproxyconsulted2").fireOnChange();
	}
}

function fnBtnAddNewJobNumberSuffix()
{
	openNewCJNAForm(false);
}

function openNewCJNAForm(reserve)
{
	var parameters = {};
	parameters["ccrm_name"] = Xrm.Page.getAttribute("ccrm_shorttitle").getValue();
	if (Xrm.Page.getAttribute("ccrm_projectmanager_userid").getValue() != null)
	{
		parameters["ccrm_projectmanager_userid"] = Xrm.Page.getAttribute("ccrm_projectmanager_userid").getValue()[0].id;
		parameters["ccrm_projectmanager_useridname"] = Xrm.Page.getAttribute("ccrm_projectmanager_userid").getValue()[0].name;
	}
	if (Xrm.Page.getAttribute("ccrm_projectid").getValue() != null)
	{
		parameters["ccrm_projectid"] = Xrm.Page.getAttribute("ccrm_projectid").getValue()[0].id;
		parameters["ccrm_projectidname"] = Xrm.Page.getAttribute("ccrm_projectid").getValue()[0].name;
	}
	if (Xrm.Page.getAttribute("ccrm_projectdirector_userid").getValue() != null)
	{
		parameters["ccrm_projectdirector_userid"] = Xrm.Page.getAttribute("ccrm_projectdirector_userid").getValue()[0].id;
		parameters["ccrm_projectdirector_useridname"] = Xrm.Page.getAttribute("ccrm_projectdirector_userid").getValue()[0].name;
	}
	if (Xrm.Page.getAttribute("ccrm_jna").getValue() != null)
	{
		parameters["ccrm_opportunitycjn"] = Xrm.Page.getAttribute("ccrm_jna").getValue();
	}
	if (Xrm.Page.getAttribute("ccrm_arupinternal").getValue() != null)
	{
		var isArupInternal = 0;
		if (Xrm.Page.getAttribute("ccrm_arupinternal").getValue() == true) isArupInternal = 1;
		parameters["ccrm_arupinternal"] = isArupInternal;
	}
	if (Xrm.Page.getAttribute("ccrm_arupcompanyid").getValue() != null)
	{
		parameters["ccrm_arupcompanyid"] = Xrm.Page.getAttribute("ccrm_arupcompanyid").getValue()[0].id;
		parameters["ccrm_arupcompanyidname"] = Xrm.Page.getAttribute("ccrm_arupcompanyid").getValue()[0].name;
	}
	if (Xrm.Page.getAttribute("ccrm_accountingcentreid").getValue() != null)
	{
		parameters["ccrm_arupaccountingcodeid"] = Xrm.Page.getAttribute("ccrm_accountingcentreid").getValue()[0].id;
		parameters["ccrm_arupaccountingcodeidname"] = Xrm.Page.getAttribute("ccrm_accountingcentreid").getValue()[0].name;
	}
	parameters["ccrm_opportunityid"] = Xrm.Page.data.entity.getId();
	parameters["ccrm_opportunityidname"] = Xrm.Page.getAttribute("name").getValue();
	if (reserve) parameters["ccrm_sys_reservejobnumber"] = 1
	Xrm.Utility.openEntityForm("ccrm_cjnapplication", null, parameters);
}
//sync bid manager with project manager

function Syncbidmanager_userid()
{
	//Added by Jugal on 5-4-2018 for 47489
	var isNewUserValid = ValidateBidManager_onChange();
	if (Xrm.Page.getAttribute("ccrm_bidmanager_userid").getValue() != null && Xrm.Page.getAttribute("ccrm_projectmanager_userid").getValue() == null)
	{
		//get the region name.
		var arupRegionData = getArupRegionName("ccrm_arupregionid");
		var region;
		var regName;
		if (arupRegionData[0] != null)
		{
			region = arupRegionData[0];
			regName = arupRegionData[1];
		}
		// var regName = getArupRegionName();
		//if EAR check accreditation level.
		//isNewUserValid fieldcondition is added by Jugal on 5-4-2018 for 47489
		if (regName != null && regName.toLowerCase() == (ArupRegionName.EastAsia).toLowerCase() && isNewUserValid)
		{
			var accLevel = EAAccreditaionLevRequired();
			//if EAR accreditation level is null, then update project manager as bid manager
			if (accLevel == "")
			{
				Xrm.Page.getAttribute("ccrm_projectmanager_userid")
					.setValue(Xrm.Page.getAttribute("ccrm_bidmanager_userid").getValue());
			}
		}
		//isNewUserValid fieldcondition is added by Jugal on 5-4-2018 for 47489
		else if (isNewUserValid)
		{
			Xrm.Page.getAttribute("ccrm_projectmanager_userid")
				.setValue(Xrm.Page.getAttribute("ccrm_bidmanager_userid").getValue());
		}
	}
}
//sync bid director with projectdirector

function Syncbiddirector_userid()
{
	//Added by Jugal on 5-4-2018 for 47489
	var isNewUserValid = ValidateBidDirector_onchange();
	if (Xrm.Page.getAttribute("ccrm_biddirector_userid").getValue() != null && Xrm.Page.getAttribute("ccrm_projectdirector_userid").getValue() == null)
	{
		//get the region name.
		var arupRegionData = getArupRegionName("ccrm_arupregionid");
		var region;
		var regName;
		if (arupRegionData[0] != null)
		{
			region = arupRegionData[0];
			regName = arupRegionData[1];
		}
		//var regName = getArupRegionName("ccrm_arupregionid");
		//if EAR check accreditation level.
		//isNewUserValid fieldcondition is added by Jugal on 5-4-2018 for 47489
		if (regName != null && regName.toLowerCase() == (ArupRegionName.EastAsia).toLowerCase() && isNewUserValid)
		{
			var accLevel = EAAccreditaionLevRequired();
			//if EAR accreditation level is null, then update project manager as bid manager
			if (accLevel == "")
			{
				Xrm.Page.getAttribute("ccrm_projectdirector_userid")
					.setValue(Xrm.Page.getAttribute("ccrm_biddirector_userid").getValue());
			}
		}
		//isNewUserValid fieldcondition is added by Jugal on 5-4-2018 for 47489
		else if (isNewUserValid)
		{
			Xrm.Page.getAttribute("ccrm_projectdirector_userid").setValue(Xrm.Page.getAttribute("ccrm_biddirector_userid").getValue());
		}
	}
}

function ProvisionDWBidsSite()
{
	if (Xrm.Page.getAttribute("arup_bidsiterequested").getValue() != true)
	{
		var oppId = Xrm.Page.data.entity.getId().replace(/[{}]/g, "");
		if (!isFormValidForBidSite())
		{
			Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
				'<font size="3" color="#000000"></br>Please, fill out all of the mandatory fields for this stage first.</font>', [
			{
				label: "<b>OK</b>",
				setFocus: true},
                ],
				"ERROR",
			450,
			200,
				'',
			true);
			return;
		};
		Alert.show('<font size="6" color="#2E74B5"><b>Please Confirm</b></font>',
			'<font size="3" color="#000000"></br>You have requested the creation of a Bid Site to support this opportunity.</br></br>Please click “Proceed” if this is correct, or click “Cancel” to go back to the opportunity form.</font>', [
                new Alert.Button("<b>Proceed</b>",

		function ()
		{
			var parameters = {};
			parameters.bidsite = true;
			var req = new XMLHttpRequest();
			req.open("POST", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/opportunities(" + oppId + ")/Microsoft.Dynamics.CRM.arup_RequestBidSite", false);
			req.setRequestHeader("OData-MaxVersion", "4.0");
			req.setRequestHeader("OData-Version", "4.0");
			req.setRequestHeader("Accept", "application/json");
			req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
			req.onreadystatechange = function ()
			{
				if (this.readyState === 4)
				{
					req.onreadystatechange = null;
					if (this.status === 204)
					{}
				}
			};
			req.send(JSON.stringify(parameters));
			Alert.show('<font size="6" color="#2E74B5"><b>Information</b></font>',
				'<font size="3" color="#000000"></br>Please note that it can take a few hours for the Bid Site to be available for use.</br></br>Please contact your local Service Desk if you have any issues.</font>', [
			{
				label: "<b>OK</b>",
				callback: function ()
				{
					Xrm.Utility.openEntityForm("opportunity", oppId);
				},
				setFocus: true},
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

function isFormValidForBidSite()
{
	var stageid = getStageId();
	var result;
	var v1 = Xrm.Page.getAttribute('ccrm_bidmanager_userid').getValue();
	var v2 = Xrm.Page.getAttribute('ccrm_biddirector_userid').getValue();
	var v3 = Xrm.Page.getAttribute('name').getValue();
	var v4 = Xrm.Page.getAttribute('ccrm_reference').getValue();
	var v5 = Xrm.Page.getAttribute("ccrm_client").getValue();
	var v6 = Xrm.Page.getAttribute("ccrm_location").getValue();
	var v7 = Xrm.Page.getAttribute("arup_subbusiness").getValue(); /****************CONDITIONALLY MANDATORY FIELDS*************************************************/
	var v8 = '1';
	var v9 = '1';
	var v10 = '1';
	var procType = Xrm.Page.getAttribute("ccrm_contractarrangement").getValue();
	if (procType == 2)
	{
		v8 = Xrm.Page.getAttribute("ccrm_agreementnumber").getValue();
	}
	else if (procType == 7)
	{
		v9 = Xrm.Page.getAttribute("ccrm_otherprocurementtypedetails").getValue();
	}
	if (Xrm.Page.getAttribute("ccrm_arupregionid").getValue()[0].name.toUpperCase() == 'AMERICAS REGION' && Xrm.Page.getAttribute("ccrm_arupbusinessid").getValue()[0].name.toUpperCase() == 'EDUCATION')
	{
		v10 = Xrm.Page.getAttribute("arup_k12school").getValue();
	}
	if (v5 != null) v5 = v5[0].name;
	if (v1 == null || v2 == null || v3 == null || v4 == null || v5 == null || v5 == 'Unassigned' || v6 == null || v7 == null || v8 == null || v9 == null || v10 == null)
	{
		Xrm.Page.ui.clearFormNotification("validcustomer");
		Xrm.Page.ui.setFormNotification("Please fill in all mandatory fields", "WARNING", "reqBidSiteWarnMsg");
		setTimeout(function ()
		{
			Xrm.Page.ui.clearFormNotification("reqBidSiteWarnMsg");
		}, 10000);
		if (v5 == 'Unassigned')
		{
			Xrm.Page.ui.setFormNotification("Valid Client Needs to be Set for Bid Site to Be Provisioned", "WARNING", "reqBidSiteClientWarnMsg");
			setTimeout(function ()
			{
				Xrm.Page.ui.clearFormNotification("reqBidSiteClientWarnMsg");
			}, 10000);
		}
		highlightFildsBidSite(v1, v2, v3, v4, v5, v6, v7, v8, v9, v10);
		return false;
	}
	highlightFildsBidSite(v1, v2, v3, v4, v5, v6, v7, v8, v9, v10);
	if (stageid == ArupStages.BidDevelopment || stageid == ArupStages.BidReviewApproval)
	{
		var result = CheckFinanceFields();
		if (!result)
		{
			return false;
		}
	}
	else if (!IsFormValid(false))
	{
		return false;
	}
	return true;
}

function highlightFildsBidSite(v1, v2, v3, v4, v5, v6, v7, v8, v9, v10)
{
	$(document).ready(function ()
	{
		highlightField('#header_process_ccrm_bidmanager_userid', '#ccrm_bidmanager_userid', (v1 != null) ? true : false);
		highlightField('#header_process_ccrm_biddirector_userid', '#ccrm_biddirector_userid', (v2 != null) ? true : false);
		highlightField(null, "#name", (v3 != null) ? true : false);
		highlightField(null, "#ccrm_reference", (v4 != null) ? true : false);
		highlightField(null, "#ccrm_client", (v5 != null && v5 != 'Unassigned') ? true : false);
		highlightField(null, "#ccrm_location", (v6 != null) ? true : false);
		highlightField(null, "#arup_subbusiness", (v7 != null) ? true : false);
		highlightField('#header_process_ccrm_agreementnumber', '#ccrm_agreementnumber', (v8 != null) ? true : false);
		highlightField('#header_process_ccrm_otherprocurementtypedetails', '#ccrm_otherprocurementtypedetails', (v9 != null) ? true : false);
		highlightField(null, "#arup_k12school", (v10 != null) ? true : false);
	})
}

function OpenDWBidsSiteLink()
{
	var pjn = Xrm.Page.getAttribute("ccrm_pjna").getValue();
	var projectID = Xrm.Page.getAttribute("ccrm_reference").getValue();
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
	if (pjn != null && pjn != 'Requested') projectID = pjn + "," + projectID;
	var baseurl = Xrm.Page.context.getClientUrl();
	var url;
	if (baseurl.indexOf("uat") != -1)
	{
		url = "https://arupuat.sharepoint.com/sites/bids#k=";
	}
	else
	{
		url = 'https://arup.sharepoint.com/sites/bids#k=';
	}
	url += 'WORDS(' + projectID + ')';
	Xrm.Page.ui.setFormNotification("It may take 15-20 min from the time PJN was issued for the BIDS site to be provisioned", 'INFO', 'BidsSiteProvision');
	window.open(url, '_blank');
	setTimeout(function ()
	{
		Xrm.Page.ui.clearFormNotification("BidsSiteProvision");
	}, 10000);
	//}
}

function ccrm_contractlimitofliability_OnChange()
{
	var strCLL = Xrm.Page.getAttribute('ccrm_contractlimitofliability').getValue();
	if (strCLL != 6)
	{
		Xrm.Page.getAttribute("ccrm_limitofliabilityagreement").setRequiredLevel("none");
		Xrm.Page.getAttribute('ccrm_limitofliabilityagreement').setValue(null);
		Xrm.Page.getControl("ccrm_limitofliabilityagreement").setDisabled(true);
		if (Xrm.Page.getControl("header_process_ccrm_limitofliabilityagreement") != null) Xrm.Page.getControl("header_process_ccrm_limitofliabilityagreement").setDisabled(true);
		Xrm.Page.getAttribute('ccrm_limitamount_num').setValue(null);
		Xrm.Page.getControl("ccrm_limitamount_num").setDisabled(true);
		if (Xrm.Page.getControl("header_process_ccrm_limitamount_num") != null) Xrm.Page.getControl("header_process_ccrm_limitamount_num").setDisabled(true);
		Xrm.Page.getAttribute("ccrm_limitofliabilityagreement").setSubmitMode("always");
		Xrm.Page.getAttribute("ccrm_limitamount_num").setSubmitMode("always");
	}
	else
	{
		Xrm.Page.getControl("ccrm_limitofliabilityagreement").setDisabled(false);
		Xrm.Page.getControl("ccrm_limitofliabilityagreement").setVisible(true);
		if (Xrm.Page.getControl("header_process_ccrm_limitofliabilityagreement") != null) Xrm.Page.getControl("header_process_ccrm_limitofliabilityagreement").setDisabled(false);
		Xrm.Page.getAttribute("ccrm_limitofliabilityagreement").setRequiredLevel("required");
	}
}

function ccrm_limitofliabilityagreement_OnChange()
{
	var strLL = Xrm.Page.getAttribute('ccrm_limitofliabilityagreement').getValue();
	if (strLL != 1)
	{
		Xrm.Page.getControl("ccrm_limitamount_num").setDisabled(true);
		if (Xrm.Page.getControl("header_process_ccrm_limitamount_num") != null) Xrm.Page.getControl("header_process_ccrm_limitamount_num").setDisabled(true);
		Xrm.Page.getAttribute('ccrm_limitamount_num').setValue(null);
		Xrm.Page.getAttribute("ccrm_limitamount_num").setSubmitMode("always");
		Xrm.Page.getAttribute("ccrm_limitamount_num").setRequiredLevel("none");
	}
	else
	{
		Xrm.Page.getControl("ccrm_limitamount_num").setDisabled(false);
		if (Xrm.Page.getControl("header_process_ccrm_limitamount_num") != null) Xrm.Page.getControl("header_process_ccrm_limitamount_num").setDisabled(false);
		Xrm.Page.getAttribute("ccrm_limitamount_num").setRequiredLevel("required");
	}
}
//CRM2016 Needs confirmation

function show_hiddenrow(attributeName, supressTabCallback)
{
	/// <summary>Due to a bug, CRM seems to hide certain rows when it should not. Ensure that parent row of a given field is not hidden</summary>
	//var currentRowStyle = $("#" + attributeName + "_d").parent().attr("style");
	var currentRowStyle = $("#" + attributeName + "_d", parent.document).parent().attr("style");
	if (currentRowStyle == "display: none;")
	{
		$("#" + attributeName + "_d", parent.document).parent().removeAttr("style", "");
	}
	// Also add a callback to the parent tab open event to show this row.
	//if (!supressTabCallback) {
	//    var control = Xrm.Page.getControl(attributeName);
	//   if (!!control)
	//        control.getParent()
	//            .getParent()
	//            .add_tabStateChange(
	//               function () {
	//                    show_hiddenrow(attributeName, true);
	//               });
	// }
}

function updateStatusCode(newStatusCode)
{
	/// <summary>Update current record status to required value and redisplay</summary>
	var statuscode = Xrm.Page.getAttribute("statuscode");
	if ( !! statuscode && statuscode.getValue().Value != newStatusCode)
	{
		SDK.REST.updateRecord(
		Xrm.Page.data.entity.getId(),
		{
			StatusCode: {
				Value: newStatusCode
			}
		},
			"Opportunity",
		SetCurrentStatusFromServer,
		errorHandler);
	}
}

function QuickCreateOnSave(args)
{
	///<summary>Suppress error caused by empty accounting centre field on quick create</summary>
	var accCentre = Xrm.Page.getAttribute("ccrm_accountingcentreid");
	if ( !! accCentre && accCentre.getValue()) var accCentreVal = accCentre.getValue();
	if ( !! accCentreVal && accCentreVal.length > 0 && accCentreVal[0].id == 0)
	{
		accCentreVal.shift();
		accCentre.setValue(accCentreVal);
	}
	//    if (preventSave) {
	//        args.getEventArgs().preventDefault();
	//        return false;
	//    }
	//}
}

function ReopenOpp()
{
	var overallStatus = Xrm.Page.getAttribute("statecode").getValue();
	if (overallStatus == 1)
	{
		Alert.show('<font face="Segoe UI Light" font size="6" color="0472C4">Information</font>',
			'<font face="Segoe UI Light" font size="3" color="#000000"></br>This Opportunity has been Won and the record has been locked down as read-only.</br>All further modifications to the record will change the historical data and will not update OvaView.</br>Best practice is to not modify Won records</font>', [
		{
			label: "<b>Reopen Opportunity</b>",
			callback: function ()
			{
				var organisationUrl = Xrm.Page.context.getClientUrl();
				var opptyId = Xrm.Page.data.entity.getId();
				var opptyStatus = Xrm.Page.getAttribute("statuscode").getValue();
				opptyId = opptyId.replace("{", "");
				opptyId = opptyId.replace("}", "");
				var req = new XMLHttpRequest();
				req.open("PATCH", organisationUrl + "/api/data/v8.1/opportunities(" + opptyId + ")", true);
				req.setRequestHeader("Accept", "application/json");
				req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
				req.setRequestHeader("OData-MaxVersion", "4.0");
				req.setRequestHeader("OData-Version", "4.0");
				var oppty = {};
				oppty["statecode"] = 0;
				//oppty["statuscode"] = 1;
				req.onreadystatechange = function ()
				{
					if (this.readyState == 4)
					{
						req.onreadystatechange = null;
						if (this.status == 204)
						{
							var _id = Xrm.Page.data.entity.getId();
							Xrm.Utility.openEntityForm("opportunity", _id);
							//Xrm.Page.data.refresh();
						}
						else
						{
							var error = JSON.parse(this.response).error;
							alert(error.message);
						}
					}
				};
				req.send(window.JSON.stringify(oppty));
			},
			setFocus: true,
			preventClose: false},
		{
			label: "<b>Add Suffix</b>",
			callback: function ()
			{
				oppoProgressFnCJNSuffix();
			},
			setFocus: false,
			preventClose: false},
		{
			label: "<b>Cancel</b>",
			callback: function ()
			{},
			setFocus: false,
			preventClose: false}
            ],
			'INFO',
		800,
		250,
			'',
		true);
	}
	else
	{
		var organisationUrl = Xrm.Page.context.getClientUrl();
		var opptyId = Xrm.Page.data.entity.getId();
		var opptyStatus = Xrm.Page.getAttribute("statuscode").getValue();
		opptyId = opptyId.replace("{", "");
		opptyId = opptyId.replace("}", "");
		var req = new XMLHttpRequest();
		req.open("PATCH", organisationUrl + "/api/data/v8.1/opportunities(" + opptyId + ")", true);
		req.setRequestHeader("Accept", "application/json");
		req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
		req.setRequestHeader("OData-MaxVersion", "4.0");
		req.setRequestHeader("OData-Version", "4.0");
		var oppty = {};
		oppty["statecode"] = 0;
		//oppty["statuscode"] = 1;
		req.onreadystatechange = function ()
		{
			if (this.readyState == 4)
			{
				req.onreadystatechange = null;
				if (this.status == 204)
				{
					var _id = Xrm.Page.data.entity.getId();
					Xrm.Utility.openEntityForm("opportunity", _id);
					//Xrm.Page.data.refresh();
				}
				else
				{
					var error = JSON.parse(this.response).error;
					alert(error.message);
				}
			}
		};
		req.send(window.JSON.stringify(oppty));
	}
}

function fnBtnExclusivityRequest()
{
	//alert('Your request for Exclusivity has been sent');
	//set the exclusivity flag
	Xrm.Page.getAttribute("ccrm_exclusivity").setValue(true);
	//set state to requested
	Xrm.Page.getAttribute("ccrm_exclusivitystate").setValue(6);
	//force submit
	Xrm.Page.getAttribute("ccrm_exclusivity").setSubmitMode("always");
	Xrm.Page.getAttribute("ccrm_exclusivitystate").setSubmitMode("always");
	Xrm.Page.data.entity.save();
	var serverUrl = Xrm.Page.context.getClientUrl();
	var id = Xrm.Page.data.entity.getId();
	id = id.replace("{", "");
	id = id.replace("}", "");
	var parameters = {};
	parameters["ccrm_name"] = Xrm.Page.getAttribute("ccrm_reference").getValue();
	// if (Xrm.Page.getAttribute("ownerid").getValue() != null) {
	//     parameters["ownerid"] = Xrm.Page.getAttribute("ownerid").getValue()[0].id;
	//    parameters["owneridname"] = Xrm.Page.getAttribute("ownerid").getValue()[0].name;
	// }
	if (Xrm.Page.getAttribute("ccrm_biddirector_userid").getValue() != null)
	{
		parameters["ccrm_biddirectorid"] = Xrm.Page.getAttribute("ccrm_biddirector_userid").getValue()[0].id;
		parameters["ccrm_biddirectoridname"] = Xrm.Page.getAttribute("ccrm_biddirector_userid").getValue()[0].name;
	}
	if (Xrm.Page.getAttribute("ccrm_bidmanager_userid").getValue() != null)
	{
		parameters["ccrm_bidmanagerid"] = Xrm.Page.getAttribute("ccrm_bidmanager_userid").getValue()[0].id;
		parameters["ccrm_bidmanageridname"] = Xrm.Page.getAttribute("ccrm_bidmanager_userid").getValue()[0].name;
	}
	if (Xrm.Page.getAttribute("ccrm_projectlocationid").getValue() != null)
	{
		parameters["ccrm_projectcountryid"] = Xrm.Page.getAttribute("ccrm_projectlocationid").getValue()[0].id;
		parameters["ccrm_projectcountryidname"] = Xrm.Page.getAttribute("ccrm_projectlocationid").getValue()[0].name;
	}
	if (Xrm.Page.getAttribute("ccrm_projectlocationid").getValue() != null)
	{
		parameters["ccrm_projectcountryid"] = Xrm.Page.getAttribute("ccrm_projectlocationid").getValue()[0].id;
		parameters["ccrm_projectcountryidname"] = Xrm.Page.getAttribute("ccrm_projectlocationid").getValue()[0].name;
	}
	parameters["ccrm_projectlocation"] = Xrm.Page.getAttribute("ccrm_location").getValue();
	if (Xrm.Page.getAttribute("ccrm_arupbusinessid").getValue() != null)
	{
		parameters["ccrm_arupbusinessid"] = Xrm.Page.getAttribute("ccrm_arupbusinessid").getValue()[0].id;
		parameters["ccrm_arupbusinessidname"] = Xrm.Page.getAttribute("ccrm_arupbusinessid").getValue()[0].name;
	}
	if (Xrm.Page.getAttribute("ccrm_arupgroupid").getValue() != null)
	{
		parameters["ccrm_arupgroupid"] = Xrm.Page.getAttribute("ccrm_arupgroupid").getValue()[0].id;
		parameters["ccrm_arupgroupidname"] = Xrm.Page.getAttribute("ccrm_arupgroupid").getValue()[0].name;
	}
	if (Xrm.Page.getAttribute("ccrm_client").getValue() != null)
	{
		parameters["ccrm_clientid"] = Xrm.Page.getAttribute("ccrm_client").getValue()[0].id;
		parameters["ccrm_clientidname"] = Xrm.Page.getAttribute("ccrm_client").getValue()[0].name;
	}
	parameters["ccrm_projectsummary"] = Xrm.Page.getAttribute("description").getValue();
	parameters["ccrm_maximumpotentialfee_num"] = Xrm.Page.getAttribute("ccrm_estimatedvalue_num").getValue();
	if (Xrm.Page.getAttribute("ccrm_project_transactioncurrencyid").getValue() != null)
	{
		parameters["transactioncurrencyid"] = Xrm.Page.getAttribute("ccrm_project_transactioncurrencyid").getValue()[0].id;
		parameters["transactioncurrencyidname"] = Xrm.Page.getAttribute("ccrm_project_transactioncurrencyid").getValue()[0].name;
	}
	parameters["ccrm_projecttitleid"] = Xrm.Page.data.entity.getId();
	parameters["ccrm_projecttitleidname"] = Xrm.Page.getAttribute("name").getValue();
	setTimeout(function ()
	{
		openExclReq(parameters);
	}, 2000);
}

function openExclReq(parameters)
{
	var windowOptions = {
		openInNewWindow: true
	};
	Xrm.Utility.openEntityForm("ccrm_exclusivityrequest", null, parameters);
}

function projectParticipantExists()
{
	var ProjectParticExists = false;
	var optyId = Xrm.Page.data.entity.getId().replace('{', '').replace('}', '');
	var req = new XMLHttpRequest();
	req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/arup_projectparticipants?$select=arup_name&$filter=_arup_opportunity_value eq " + optyId + "&$count=true", false);
	req.setRequestHeader("OData-MaxVersion", "4.0");
	req.setRequestHeader("OData-Version", "4.0");
	req.setRequestHeader("Accept", "application/json");
	req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
	req.setRequestHeader("Prefer", "odata.include-annotations=\"*\",odata.maxpagesize=1");
	req.onreadystatechange = function ()
	{
		if (this.readyState === 4)
		{
			req.onreadystatechange = null;
			if (this.status === 200)
			{
				var results = JSON.parse(this.response);
				var recordCount = results["@odata.count"];
				ProjectParticExists = (recordCount > 0) ? true : false;
			}
			else
			{
				Xrm.Utility.alertDialog(this.statusText);
			}
		}
	};
	req.send();
	return ProjectParticExists;
}

function addProjectParticipant()
{
	Xrm.Page.data.save();
	var parameters = {}; //set null parameters as we there is no need to set any other field
	parameters["arup_opportunity"] = Xrm.Page.data.entity.getId();
	parameters["arup_opportunityname"] = Xrm.Page.getAttribute("name").getValue();
	setTimeout(function ()
	{
		openProjectParticipantPage(parameters);
	}, 2000);
}

function openProjectParticipantPage(parameters)
{
	var windowOptions = {
		openInNewWindow: true
	};
	Xrm.Utility.openEntityForm("arup_projectparticipant", null, parameters);
	var serverUrl = Xrm.Page.context.getClientUrl();
	var params = "arup_opportunity=" + parameters["arup_opportunity"] + "&arup_opportunityname=" + parameters["arup_opportunityname"];
	var features = "location=no,menubar=no,status=no,toolbar=no,scrollbars=yes,width=4000,height=700";
}

function resetSubBusiness(valuechanged, businessid)
{
	if (businessid == null || valuechanged || valuechanged == null) Xrm.Page.getAttribute('arup_subbusiness').setValue(null);
	// disable sub business if either business is NULL or license type is not Professional
	Xrm.Page.getControl("arup_subbusiness").setDisabled(businessid == null || currUserData.caltype != 0);
}
//Common function to refresh ribbon on change of any field

function refreshRibbonOnChange()
{
	Xrm.Page.ui.refreshRibbon();
}

function debug()
{
	/// <summary>Drop into debugger from ribbon or form events.</summary>
	return true;
}

function canReopenOpportunity()
{
	var state = Xrm.Page.getAttribute('statecode').getValue();
	if (state == null || state != 1) return true;
	return isPartOfDQTeam();
}

function isPartOfDQTeam()
{
	var dqteam = userInTeamCheck('Global Data Quality');
	return dqteam;
}
//Param - teamm name . This function checks whether the logged in user is a member of the team. Returns true if he/ she is a member.

function userInTeamCheck(TeamNameInput)
{
	var IsPresentInTeam = false;
	try
	{
		var req = new XMLHttpRequest();
		req.open("GET", Xrm.Page.context.getClientUrl() +
			"/api/data/v8.2/accounts?fetchXml=%3Cfetch%20version%3D%221.0%22%20output-format%3D%22xml-platform%22%20mapping%3D%22logical%22%20distinct%3D%22true%22%3E%3Centity%20name%3D%22team%22%3E%3Cattribute%20name%3D%22name%22%2F%3E%3Cfilter%20type%3D%22and%22%3E%3Ccondition%20attribute%3D%22name%22%20operator%3D%22eq%22%20value%3D%22" + TeamNameInput + "%22%2F%3E%3C%2Ffilter%3E%3Clink-entity%20name%3D%22teammembership%22%20from%3D%22teamid%22%20to%3D%22teamid%22%20visible%3D%22false%22%20intersect%3D%22true%22%3E%3Cfilter%20type%3D%22and%22%3E%3Ccondition%20attribute%3D%22systemuserid%22%20operator%3D%22eq%22%20value%3D%22" + Xrm.Page.context.getUserId().replace('{', '').replace('}', '') + "%22%2F%3E%3C%2Ffilter%3E%3C%2Flink-entity%3E%3C%2Fentity%3E%3C%2Ffetch%3E", false);
		req.setRequestHeader("OData-MaxVersion", "4.0");
		req.setRequestHeader("OData-Version", "4.0");
		req.setRequestHeader("Accept", "application/json");
		req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
		req.onreadystatechange = function ()
		{
			if (this.readyState === 4)
			{
				req.onreadystatechange = null;
				if (this.status === 200)
				{
					var results = JSON.parse(this.response);
					if (results.value.length > 0)
					{
						IsPresentInTeam = true;
					}
				}
				else
				{
					Xrm.Utility.alertDialog(this.statusText);
				}
			}
		};
		req.send();
	}
	catch (err)
	{
		console.log(TeamNameInput + ' Error: ' + err.message);
	}
	return IsPresentInTeam;
}

function onChange_PJN()
{
	lockDownBidCosts((Xrm.Page.getAttribute("ccrm_pjna").getValue() != null || Xrm.Page.getAttribute("ccrm_jna").getValue() != null) ? true : false);
}

function approveCallbackAction(approvalType)
{
	var parameters = {};
	var approveruser = {};
	var oppId = Xrm.Page.data.entity.getId().replace(/[{}]/g, "");
	var LoggedUser = Xrm.Page.context.getUserId().replace(/[{}]/g, "");
	approveruser.systemuserid = LoggedUser;
	approveruser["@odata.type"] = "Microsoft.Dynamics.CRM.systemuser";
	parameters.approverUser = approveruser;
	parameters.approvalType = approvalType;
	var req = new XMLHttpRequest();
	req.open("POST", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/opportunities(" + oppId + ")/Microsoft.Dynamics.CRM.arup_ApprovalProcess", false);
	req.setRequestHeader("OData-MaxVersion", "4.0");
	req.setRequestHeader("OData-Version", "4.0");
	req.setRequestHeader("Accept", "application/json");
	req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
	req.onreadystatechange = function ()
	{
		if (this.readyState === 4)
		{
			req.onreadystatechange = null;
			if (this.status === 200)
			{
				Xrm.Utility.openEntityForm("opportunity", oppId);
			}
		}
	};
	req.send(JSON.stringify(parameters));
}