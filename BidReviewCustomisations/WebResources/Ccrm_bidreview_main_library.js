if (typeof(ARUP) == "undefined") {
    ARUP = {};
}
/*
*********************************************************


* Function Definitions - Bid Review Main 

*********************************************************
*/
ARUP.ccrm_bidreview = {
        /*
         *********************************************************
         * Form On Load Event
         *********************************************************
         */
        onLoad: function() {
            //load review Panel 
            if (Xrm.Page.getAttribute("ccrm_reviewpanel").getValue() == null) this.loadReviewPanel();
            this.loadSupplementData();
            this.tab_SectionH_onLoad();
            this.ultimateClientNL();
            
            //var loadTime = window.performance.timing.domContentLoadedEventEnd- window.performance.timing.navigationStart;
            
            //console.log(loadTime);
        },
        /*
         *********************************************************
         * Form On Save Event
         *********************************************************
         */
        onSave: function(executionObj) {
            //to stop users from creating from adv find        
            if (Xrm.Page.data.entity.attributes.get("ccrm_opportunityid").getValue() == null) {
                alert("Bid Review can only be created from within an Opportunity");
                executionObj.getEventArgs().preventDefault();
            }
            if (Xrm.Page.data.entity.attributes.get("ccrm_opportunityid").getValue() != null && Xrm.Page.data.entity.getId() == null) {
                if (this.chkBidReviewCount() == true) {
                    alert('You cannot create another Bid Review record');
                    executionObj.getEventArgs().preventDefault();
                }
            }
        },
        /*
         *********************************************************
         * Function to validate that only one bid review exists
         * against the same opportunity
         *********************************************************
         */
        chkBidReviewCount: function() {
            var recordId = Xrm.Page.data.entity.attributes.get("ccrm_opportunityid").getValue()[0].id;
            var RelationshipName = "ccrm_opportunity_ccrm_bidreview";
            var dataSet = "OpportunitySet";
            var retrievedAssociated = ConsultCrm.Sync.RetrieveAssociatedRequest(recordId, dataset, RelationshipName);
            //alert(recordId);
            var bidReviewCount = retrievedAssociated.results.length;
            if (bidReviewCount == '1') return true; //records exists
            else return false; //none returned
        },
        /*
         *********************************************************
         * Retrieve the Ultimate Client Name & Country
         *********************************************************
         */
        ultimateClientNL: function() {
            if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return;
            var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
            var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
            if (retrievereq !== null) {
                if (retrievereq.ccrm_ultimateendclientid !== null) {
                    var fullReference = null;
                    var ultimateClientName = retrievereq.ccrm_ultimateendclientid.Name;
                    var ultimateClientId = retrievereq.ccrm_ultimateendclientid.Id;
                    fullReference = ultimateClientName;
                    if (ultimateClientId !== null || undefined) {
                        var dataset = "AccountSet";
                        var retrievereq = ConsultCrm.Sync.RetrieveRequest(ultimateClientId, dataset);
                        if (retrievereq !== null) {
                            var clientName = retrievereq.ccrm_countryid.Name;
                            fullReference = fullReference + " - " + clientName;
                            Xrm.Page.getAttribute("ccrm_client_data_2a_new").setValue(fullReference);
                        }
                    }
                }
            }
        },
        /*
         *********************************************************
         * Load the Bid Review Chair from the Calling Opportunity
         *********************************************************
         */
        loadReviewPanel: function() {
            //get Opportunity id 
            if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return;
            var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
            var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
            if (retrievereq != null) {
                //Populate review panel with the opportunity bid chair 
                if (retrievereq.ccrm_bidreviewchair_userId != null) {
                    Xrm.Page.getAttribute("ccrm_reviewpanel").setValue(retrievereq.ccrm_bidreviewchair_userId.Name);
                }
            }
        },
        showhideSection: function(tabName, sectionName, isVisible) {
            var tab = Xrm.Page.ui.tabs.get(tabName);
            if (tab && tab.sections.get(sectionName)) {
                tab.sections.get(sectionName).setVisible(isVisible);
            }
        },
        //LOAD SUPPLEMENTARY DATA
        loadSupplementData: function() {
            if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return;
            var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
            var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
            if (retrievereq != null) {
                //populate submission date
                if (retrievereq.Ccrm_BidSubmission != null) {
                    //Parse the JSON Date               
                    var submissiondate = new Date(parseInt(retrievereq.Ccrm_BidSubmission.substr(6)));
                    Xrm.Page.getAttribute("ccrm_submission_date").setValue(submissiondate);
                }
                //Populate Scope of work
                if (retrievereq.Ccrm_DescriptionofExtentofArupServices != null) {
                    Xrm.Page.getAttribute("ccrm_scopeofwork").setValue(retrievereq.Ccrm_DescriptionofExtentofArupServices);
                }
            }
        },
        /*
         *********************************************************
         * If client != ultimate Client
         * show Questions 2a and 3a else hide them
         *********************************************************
         */
        ultimateClient_onChange: function() {
            var showSection;
            if (Xrm.Page.getAttribute("ccrm_ultimateclient_yesno").getValue() == 0) //no 
                showSection = true;
            else showSection = false;
            this.showhideSection("tab_Client", "tab_Client_section_3a", showSection);
            this.showhideSection("tab_Client", "tab_Client_section_2a", showSection);
        },
        /*
         *********************************************************
         * Compare customerid to Opportunity
         * ultimate client id field
         *********************************************************
         */
        isUltimateClient: function() {
            //compare OpportunitySet?$select=ccrm_ultimateendclientid,CustomerId
            //get Opportunity id
            if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return;
            var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
            var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
            if (retrievereq != null) {
                //populate review panel with the opportunity bid chair 
                if (retrievereq.ccrm_ultimateendclientid.Id != null) {
                    //compare ultimate client to client
                    if (retrievereq.CustomerId.Id == retrievereq.ccrm_ultimateendclientid.Id) return true;
                    else return false;
                } else return false;
            }
        },
        isPartofJV: function() {
            if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return;
            var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
            var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
            if (retrievereq != null) {
                if (retrievereq.Ccrm_ArupBiddingasaJointVenture != null) {
                    if (retrievereq.Ccrm_ArupBiddingasaJointVenture == true) {
                        //set drop down to true 
                        Xrm.Page.getAttribute("ccrm_jvbidding_yesno").setValue(1);
                        this.twoOptions_onChange("ccrm_jvbidding_yesno", 1);
                    } else if (retrievereq.Ccrm_ArupBiddingasaJointVenture == false) {
                        Xrm.Page.getAttribute("ccrm_jvbidding_yesno").setValue(0);
                        this.twoOptions_onChange("ccrm_jvbidding_yesno", 0);
                    }
                }
            }
        },
        /*
         *********************************************************
         * Retrieve power of attorney value from related
         * Opportunity
         *********************************************************
         */
        isPowerOfAttorney: function() {
            //compare OpportunitySet?$select=Ccrm_PowersofAttorney
            if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return;
            var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
            var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
            if (retrievereq != null) return retrievereq.Ccrm_PowersofAttorney;
            else return false;
        },
        /*
         *********************************************************
         * Toggle hidden question visibility
         *********************************************************
         */
        twoOptions_onChange: function(fieldName, value) {
            var showSection;
            if (Xrm.Page.getAttribute(fieldName).getValue() == value) showSection = true;
            else showSection = false;
            switch (fieldName) {
                case "ccrm_managementchanges_yesno":
                    this.showhideSection("tab_SectionD", "tab_SectionD_7a", showSection);
                    break;
                case "ccrm_clearbrief_yesno":
                    this.showhideSection("tab_SectionC", "tab_SectionC_1a", showSection);
                    break;
                case "ccrm_envobjectives_yesno":
                    this.showhideSection("tab_SectionC", "tab_SectionC_5a", showSection);
                    break;
                case "ccrm_sectiond_data_1_new":
                    this.showhideSection("tab_SectionD", "tab_SectionD_1b", false);
                    this.showhideSection("tab_SectionD", "tab_SectionD_1a", false);
                    if (Xrm.Page.getAttribute(fieldName).getValue() == 100000001) { //no
                        this.showhideSection("tab_SectionD", "tab_SectionD_1a", true);
                    } else if (Xrm.Page.getAttribute(fieldName).getValue() == 100000000) { //yes
                        this.showhideSection("tab_SectionD", "tab_SectionD_1b", true);
                    }
                    break;
                case "ccrm_jvbidding_yesno":
                    this.showhideSection("tab_SectionE", "tab_SectionE_2a", showSection);
                    break;
                case "ccrm_sectione_data_5":
                    this.showhideSection("tab_SectionE", "tab_SectionE_5b", false);
                    this.showhideSection("tab_SectionE", "tab_SectionE_5a", false);
                    if (Xrm.Page.getAttribute(fieldName).getValue() == 100000003) { //Back to Back 
                        this.showhideSection("tab_SectionE", "tab_SectionE_5a", true);
                    } else if (Xrm.Page.getAttribute(fieldName).getValue() == 100000004) { //Other
                        this.showhideSection("tab_SectionE", "tab_SectionE_5b", true);
                    }
                    break;
                case "ccrm_tcattached_yesno":
                    this.showhideSection("tab_SectionE", "tab_SectionE_6a", false);
                    this.showhideSection("tab_SectionE", "tab_SectionE_6b", false);
                    if (Xrm.Page.getAttribute(fieldName).getValue() == 1) { //Yes
                        this.showhideSection("tab_SectionE", "tab_SectionE_6a", true);
                    } else if (Xrm.Page.getAttribute(fieldName).getValue() == 0) {
                        this.showhideSection("tab_SectionE", "tab_SectionE_6b", true);
                    }
                    break;
                case "ccrm_contractreviewed_yesno":
                    this.showhideSection("tab_SectionE", "tab_SectionE_7abc", false);
                    this.showhideSection("tab_SectionE", "tab_SectionE_7a", false);
                    if (Xrm.Page.getAttribute(fieldName).getValue() == 1) { //Yes
                        this.showhideSection("tab_SectionE", "tab_SectionE_7abc", true);
                    } else if (Xrm.Page.getAttribute(fieldName).getValue() == 0) {
                        this.showhideSection("tab_SectionE", "tab_SectionE_7a", true);
                    }
                    break;
                case "ccrm_liabilitylimit_yesno":
                    if (Xrm.Page.getAttribute("ccrm_liabilitylimit_yesno").getValue() == 0)
	{                    
	    this.showhideSection("tab_SectionE", "tab_SectionE_13c", true);
	    this.showhideSection("tab_SectionE", "tab_SectionE_13ab", false);
	}
                 else if (Xrm.Page.getAttribute("ccrm_liabilitylimit_yesno").getValue() == 1)
                    {
                        this.showhideSection("tab_SectionE", "tab_SectionE_13c", false);
                    	   this.showhideSection("tab_SectionE", "tab_SectionE_13ab", true);
                    }
                else
                  {
                      this.showhideSection("tab_SectionE", "tab_SectionE_13c", false);
                    	 this.showhideSection("tab_SectionE", "tab_SectionE_13ab", false);
                  }                       
                    break;
                case "ccrm_sectione_data_13b":
                    this.showhideSection("tab_SectionE", "tab_SectionE_13c", showSection);
                    //change label to 13c. 
                    if (showSection == true) Xrm.Page.getControl("ccrm_contract_data_9").setLabel("12a. Why would we accept this?");
                    break;
                case "ccrm_bonds_guarantees_yesno":
                    this.showhideSection("tab_SectionE", "tab_SectionE_15ab", showSection);
                    break;
                case "ccrm_paytermsmonthly_yesno":
                    this.showhideSection("tab_SectionF", "tab_SectionF_2c", showSection);
                    break;
                case "ccrm_resourceconsultants_yesno":
                    this.showhideSection("tab_SectionF", "tab_SectionF_8", showSection);
                    break;
                case "ccrm_negativeforecast_yesno":
                    this.showhideSection("tab_SectionF", "tab_SectionF_11", showSection);
                    break;
                case "ccrm_hourlyratesincluded_yesno":
                    this.showhideSection("tab_SectionF", "tab_SectionF_13a", false);
                    this.showhideSection("tab_SectionF", "tab_SectionF_13b", false);
                    if (Xrm.Page.getAttribute(fieldName).getValue() == 1) { //Yes
                        this.showhideSection("tab_SectionF", "tab_SectionF_13a", true);
                    } else if (Xrm.Page.getAttribute(fieldName).getValue() == 0) {
                        this.showhideSection("tab_SectionF", "tab_SectionF_13b", true);
                    }
                    break;
                case "ccrm_otherstaff_yesno":
				if (Xrm.Page.getAttribute("ccrm_subconsultantsresourced_yesno").getValue() == false) {
                    this.showhideSection("tab_SectionG", "tab_SectionG_3b", showSection);
					}
                    break;
                case "ccrm_subconsultantsresourced_yesno":
                    this.showhideSection("tab_SectionG", "tab_SectionG_3b", showSection);
                    this.showhideSection("tab_SectionG", "tab_SectionG_3c", showSection);
                    break;
                case "ccrm_is_sectionh1_visible":
                    this.showhideSection("tab_SectionH", "tab_SectionH_h1", showSection);
                    break;
                case "ccrm_is_sectionh2_visible":
                    this.showhideSection("tab_SectionH", "tab_SectionH_h2", showSection);
                    break;
                default:
            }
        },
        /*
         *********************************************************
         * Load the Relationship Manager from the Organisation / Client
         *********************************************************
         */
        loadRelationshipManager: function() {
            //retrieve the opportunity client
            if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return;
            var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
            var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
            if (retrievereq != null)
                if (retrievereq.CustomerId != null) {
                    //load the relationship manager of the customer 
                    dataset = 'AccountSet'
                    retrievereq = ConsultCrm.Sync.RetrieveRequest(retrievereq.CustomerId.Id, dataset);
                    if (retrievereq != null) {
                        if (retrievereq.ccrm_keyaccountmanagerid.Id != null) {
                            var UserLookup = new Array();
                            UserLookup[0] = new Object();
                            UserLookup[0].id = retrievereq.ccrm_keyaccountmanagerid.Id;
                            UserLookup[0].name = retrievereq.ccrm_keyaccountmanagerid.Name;
                            UserLookup[0].entityType = retrievereq.ccrm_keyaccountmanagerid.LogicalName;
                            Xrm.Page.getAttribute("ccrm_relationshipmanager").setValue(UserLookup);
                        }
                    }
                }
        },
        /*
         *********************************************************
         * Check related opportunity charging basis- if basis is time
         * (value = 20) display section F question 3b
         *********************************************************
         */
        chkChargingBasis: function() {
            //retrieve the opportunity client
            if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return;
            var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
            var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
            if (retrievereq != null) {
                if (retrievereq.Ccrm_ChargingBasis.Value == 20) // time basis                         
                    this.showhideSection("tab_SectionF", "tab_SectionF_3b", true);
                else this.showhideSection("tab_SectionF", "tab_SectionF_3b", false);
            }
        },
        /*
         *********************************************************
         * Check related opportunity bonds required and performance
         * guarantee fields. If both checked set bonds guaranteed
         * to Yes
         *********************************************************
         */
        chkBonds_GuaranteeRequirement: function() {
            if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return;
            var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
            var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
            if (retrievereq != null) {
                if (retrievereq.Ccrm_BondsRequired == true && retrievereq.Ccrm_PerformanceGuarantees == true) Xrm.Page.getAttribute("ccrm_bonds_guarantees_yesno").setValue(1);
                else Xrm.Page.getAttribute("ccrm_bonds_guarantees_yesno").setValue(0);
            }
        },
        /*
         *********************************************************
         * Section H - Tab expanded
         *********************************************************
         */
        //Function hides the H-Tab and sections based on values selected in Section A Options
        //Can be re-factored
        tab_SectionH_onLoad: function() {
            //console.log("Executing Function");
            var h1Option = Xrm.Page.data.entity.attributes.get("ccrm_h1option").getValue();
            var h2Option = Xrm.Page.data.entity.attributes.get("ccrm_h2option").getValue();
			if (h1Option == null) { h1Option = false;}
			if (h2Option == null) { h2Option = false;}
			
            //if (h1Option || h1Option !== null || h2Option !== null) {

                if ((h1Option == true) && (h2Option == false)) {
//Xrm.Page.ui.tabs.get("tab_SectionH").setDisplayState('expanded');
                    Xrm.Page.ui.tabs.get("tab_SectionH").setVisible(true);
                    Xrm.Page.ui.tabs.get("tab_SectionH").sections.get("tab_SectionH_h1").setVisible(true);
                    Xrm.Page.ui.tabs.get("tab_SectionH").sections.get("tab_SectionH_h2").setVisible(false);

                    //console.log("H1");
                } else if ((h1Option == false) && (h2Option == true)) {
                    //console.log("H2");
//Xrm.Page.ui.tabs.get("tab_SectionH").setDisplayState('expanded');
                    Xrm.Page.ui.tabs.get("tab_SectionH").setVisible(true);
                    Xrm.Page.ui.tabs.get("tab_SectionH").sections.get("tab_SectionH_h1").setVisible(false);
                    Xrm.Page.ui.tabs.get("tab_SectionH").sections.get("tab_SectionH_h2").setVisible(true);

                } else if ((h1Option == true) && (h2Option == true)) {  
//Xrm.Page.ui.tabs.get("tab_SectionH").setDisplayState('expanded');                 
                    Xrm.Page.ui.tabs.get("tab_SectionH").setVisible(true);
                    Xrm.Page.ui.tabs.get("tab_SectionH").sections.get("tab_SectionH_h1").setVisible(true);
                    Xrm.Page.ui.tabs.get("tab_SectionH").sections.get("tab_SectionH_h2").setVisible(true);

                } else if ((h1Option == false) && (h2Option == false)) {
                    //console.log("H4");
//Xrm.Page.ui.tabs.get("tab_SectionH").setDisplayState('collapsed');
                    Xrm.Page.ui.tabs.get("tab_SectionH").setVisible(false);
                }
            //}
        },
        tab_SectionH_onstatechange: function() {
            //console.log("Executing Function");
            //handle field toggling when section E is expanded only 
            if (Xrm.Page.ui.tabs.get("tab_SectionH").getDisplayState() == "expanded") {
                this.fieldVisibility_onchange("ccrm_clientvisit_yesno", 1, "ccrm_sectionh_data_1a");
                this.fieldVisibility_onchange("ccrm_exchangeinoperation_yesno", 1, "ccrm_h2_project_data_8");
                this.fieldVisibility_onchange("ccrm_designcertified_yesno", 1, "ccrm_certificationscostcovered_yesno"); //ADM 
this.fieldVisibility_onchange("ccrm_designcertified_yesno", 1, "ccrm_h5adetails");
                this.fieldVisibility_onchange("ccrm_subconsultantswork_yesno", 1, "ccrm_sectionh2_data_2a"); //ADM 
                this.fieldVisibility_onchange("ccrm_legislativerequirements_yesno", 0, "ccrm_h24details"); //ADM 
                this.fieldVisibility_onchange("ccrm_certificationscostcovered_yesno", 0, "ccrm_h5adetails"); //ADM 
                HideFields("ccrm_sectionh2_data_4a", 100000003, 100000002, "ccrm_h4adetails");
                //section h1 or h2 visibility 
                //this.twoOptions_onChange("ccrm_is_sectionh1_visible", 1);
                //this.twoOptions_onChange("ccrm_is_sectionh2_visible", 1);
				//Xrm.Page.ui.tabs.get("tab_SectionH").setDisplayState('expanded');
            }
        },
        /*
         *********************************************************
         * Section C - Tab expanded
         *********************************************************
         */
        tab_SectionC_onstatechange: function() {
            //console.log("Executing Function");
            //handle field toggling when section E is expanded only 
            if (Xrm.Page.ui.tabs.get("tab_SectionC").getDisplayState() == "expanded") {
                this.twoOptions_onChange("ccrm_clearbrief_yesno", 0);
                this.twoOptions_onChange("ccrm_envobjectives_yesno", 1);
                this.fieldVisibility_onchange("ccrm_defineddeliverables_yesno", 0, "ccrm_technical_data_5");
                this.fieldVisibility_onchange("ccrm_unusualreq_yesno", 1, "ccrm_technical_data_4");
                HideFields("ccrm_sectionc_data_7", 100000001, 100000003, "ccrm_technical_data_8");
                //this.fieldVisibility_onchange_inv("ccrm_sectionc_data_7", 100000001, "ccrm_technical_data_8") //Hide if value is no
                // this.fieldVisibility_onchange_inv("ccrm_sectionc_data_7", 100000003, "ccrm_technical_data_8")
            }
        },
        /*
         *********************************************************
         * Section D - Tab expanded
         *********************************************************
         */
        tab_SectionD_onstatechange: function() {
            //console.log("Executing Function");
            //handle field toggling when section E is expanded only 
            if (Xrm.Page.ui.tabs.get("tab_SectionD").getDisplayState() == "expanded") {
                this.twoOptions_onChange("ccrm_sectiond_data_1_new", 0);
                this.twoOptions_onChange("ccrm_managementchanges_yesno", 1);
                this.fieldVisibility_onchange("ccrm_sectiond_data_5", 100000001, "ccrm_schedule_data_5");
                this.fieldVisibility_onchange("ccrm_approvalreq_yesno", 1, "ccrm_h1_project_data_9");
            }
        },
        /*
         *********************************************************
         * Section G - Tab expanded
         *********************************************************
         */
        tab_SectionG_onstatechange: function() {
            //console.log("Executing Function");
            //handle field toggling when section E is expanded only 
            if (Xrm.Page.ui.tabs.get("tab_SectionG").getDisplayState() == "expanded") {
                //hide sections 3b and 3c 
                this.showhideSection("tab_SectionG", "tab_SectionG_3b", false);
                this.showhideSection("tab_SectionG", "tab_SectionG_3c", false);
                this.twoOptions_onChange("ccrm_otherstaff_yesno", 1);
                this.twoOptions_onChange("ccrm_subconsultantsresourced_yesno", 1);
                this.fieldVisibility_onchange("ccrm_resourcesavailable_yesno", 0, "ccrm_sectiong_data_3a_comments");
                this.fieldVisibility_onchange("ccrm_hsneedsconsidered_yesno", 0, "ccrm_technical_data_9");
                this.fieldVisibility_onchange("ccrm_projecthsneeds_yesno", 1, "ccrm_technical_data_11");
                this.fieldVisibility_onchange("ccrm_sectiong_3bivoptionset", 0, "ccrm_sectiong_3bivoptionsetdetails");
                this.resourcechecked_onchange();
                ShowSections("ccrm_resourceconsultants_yesno", 1, "tab_SectionG", "tab_SectionG_3b", "tab_SectionG_3c"); //ADM
                this.fieldVisibility_onchange("ccrm_sectiong_3bi_optionset", 100000001, "ccrm_sectiong_3bi_name");
                this.fieldVisibility_onchange("ccrm_sectiong_3bii_optionset", 100000001, "ccrm_sectiong_3bii_name");
                this.fieldVisibility_onchange("ccrm_sectiong_3biii_optionset", 100000001, "ccrm_sectiong_3biii_name");
            }
        },
        /*
         *********************************************************
         * Section E - Tab expanded
         *********************************************************
         */
        tab_SectionE_onstatechange: function() {
            //console.log("Executing Function");
            //handle field toggling when section E is expanded only 
            if (Xrm.Page.ui.tabs.get("tab_SectionE").getDisplayState() == "expanded") {
                //check if we are bidding as part of JV 
                if (Xrm.Page.getAttribute("ccrm_jvbidding_yesno").getValue() == null || Xrm.Page.getAttribute("ccrm_jvbidding_yesno").getValue() == 100000000) this.isPartofJV();
                this.twoOptions_onChange("ccrm_sectione_data_5", 0);
                this.twoOptions_onChange("ccrm_tcattached_yesno", 0);
                this.twoOptions_onChange("ccrm_contractreviewed_yesno", 0);
                this.twoOptions_onChange("ccrm_liabilitylimit_yesno", 1);
                this.twoOptions_onChange("ccrm_sectione_data_13b", 100000003);
                this.twoOptions_onChange("ccrm_bonds_guarantees_yesno", 1);
                //show/hide Section E question 3
                var showSection = false;
                if (this.isPowerOfAttorney()) showSection = true;
                this.showhideSection("tab_SectionE", "tab_SectionE_3a", showSection);
                //check if bonds or guarantees are required 
                this.chkBonds_GuaranteeRequirement();
                this.fieldVisibility_onchange("ccrm_onerousrequirements_yesno", 1, "ccrm_contract_data_4a");
                this.fieldVisibility_onchange("ccrm_similarpayterms_yesno", 0, "ccrm_sectionf_data8d_multi");
                this.fieldVisibility_onchange("ccrm_quotesreceived_yesno", 0, "ccrm_sectionf_data8b_multi");
                this.fieldVisibility_onchange("ccrm_sectione_data_16", 100000005, "ccrm_sectione_data16_other");
				this.fieldVisibility_onchange("ccrm_sectione_data_15a", 100000004, "ccrm_sectione_data15a_other");
            }
        },
        /*
         *********************************************************
         * Section B - Tab expanded
         *********************************************************
         */
        tab_SectionB_onstatechange: function() {
            //console.log("Executing Function");
            if (Xrm.Page.ui.tabs.get("tab_Client").getDisplayState() == "expanded") {
                if (Xrm.Page.ui.getFormType() != 1) {
                    if (Xrm.Page.getAttribute("ccrm_ultimateclient_yesno").getValue() != null) {
                        if (this.isUltimateClient() == true) Xrm.Page.getAttribute("ccrm_ultimateclient_yesno").setValue(1);
                        else Xrm.Page.getAttribute("ccrm_ultimateclient_yesno").setValue(0);
                    }
                    if (Xrm.Page.getAttribute("ccrm_relationshipmanager").getValue() == null) {
                        //load relationship manager
                        this.loadRelationshipManager();
                    }
                    this.ultimateClient_onChange();
                    this.fieldVisibility_onchange("ccrm_client_payment_performance", 100000001, "ccrm_client_data_3");
                    this.fieldVisibility_onchange("ccrm_client_data_7_new", 100000006, "ccrm_client_data_4");
                    //this.fieldVisibility_onchange("ccrm_client_data_5_new", 100000000, "ccrm_client_data_5a_new");    //Syed: Not required
                    this.fieldVisibility_onchange_inv("ccrm_client_data_6_new", 100000000, "ccrm_client_data_6a_new");
					//this.fieldVisibility_onchange("ccrm_client_data_6_new", 100000003, "ccrm_client_data_6a_new");
                    this.fieldVisibility_onchange("ccrm_sectionb_data_8", 100000000, "ccrm_client_data_5");
                    //this.fieldVisibility_onchange_inv("ccrm_sectionb_data_8", 100000003, "ccrm_client_data_5"); //Syed: Disabled, Not required
					this.fieldVisibility_onchange_inv("ccrm_sectionb_data_9_yesno", 100000002,"ccrm_relationshipmanager");
                }
            }
        },
        /*
         *********************************************************
         * Section F - Tab expanded
         *********************************************************
         */
        tab_SectionF_onstatechange: function() {
            //console.log("Executing Function");
            if (Xrm.Page.ui.tabs.get("tab_SectionF").getDisplayState() == "expanded") {
                //check charging basis 
                this.chkChargingBasis();
                this.twoOptions_onChange("ccrm_paytermsmonthly_yesno", 0)
                this.twoOptions_onChange("ccrm_resourceconsultants_yesno", 1);
                this.twoOptions_onChange("ccrm_negativeforecast_yesno", 1);
                this.twoOptions_onChange("ccrm_hourlyratesincluded_yesno", 0);
                this.fieldVisibility_onchange("ccrm_competitivebidtype", 100000002, "ccrm_sectionf_data_1a_multi");
                this.fieldVisibility_onchange("ccrm_bidassessmentbasis", 100000003, "ccrm_sectionf_data_1b_multi");
                this.fieldVisibility_onchange("ccrm_sectionf_data_2c", 100000004, "ccrm_fees_data_5");
                this.fieldVisibility_onchange("ccrm_conditionalpayments_yesno", 1, "ccrm_fees_data_19");
                this.fieldVisibility_onchange("ccrm_netfees_yesno", 0, "ccrm_sectionf_data_4_multi");
                this.fieldVisibility_onchange("ccrm_sectionf_data_5f_yesno", 1, "ccrm_sectionf_data_5f_details"); //ADM
              //  this.fieldVisibility_onchange("ccrm_advancepayment_yesno", 0, "ccrm_fees_data_18");
                // this.fieldVisibility_onchange("ccrm_duediligence_yesno", 0, "ccrm_h1_project_data_7");
this.fieldVisibility_onchange("ccrm_chargingbasis", 20, "ccrm_sectionf_data_3b");
                this.duediligence_onchange();
                //check whether fees and costs are in different currencies 
                this.chkFeesandCostCurrency();
                this.chkKeyIndicators();
            }
        },
        //FUNCTION LIST --------------------------------------------------------------------------------------------------
        //
	chargingbasis_onchange:function()
		{		
		    //console.log("Executing Function");
            if (Xrm.Page.getAttribute("ccrm_chargingbasis").getValue() == 20) 
			{
              Xrm.Page.getControl("ccrm_sectionf_data_3b").setVisible(true);
            } 
            else 
			{
			Xrm.Page.getControl("ccrm_sectionf_data_3b").setVisible(false);
			}
		},
	advancepayment_onchange:function()
		{
		    //console.log("Executing Function");
                  if (Xrm.Page.getAttribute("ccrm_advancepayment_yesno").getValue() == 0 ||                      Xrm.Page.getAttribute("ccrm_advancepayment_yesno").getValue() == 1) 
			{
                            Xrm.Page.getControl("ccrm_fees_data_18").setVisible(true);
                         } 
                 else 
			{
			Xrm.Page.getControl("ccrm_fees_data_18").setVisible(false);
			}
		},

        resourcechecked_onchange: function() {
            //console.log("Executing Function");
            if (Xrm.Page.getAttribute("ccrm_resourceschecked_yesno").getValue() == 0) {
                this.fieldVisibility_onchange("ccrm_resourceschecked_yesno", 0, "ccrm_h1project_data_2");
                Xrm.Page.getControl("ccrm_h1project_data_2").setLabel("Please provide details");
            } else if (Xrm.Page.getAttribute("ccrm_resourceschecked_yesno").getValue() == 1) {
                this.fieldVisibility_onchange("ccrm_resourceschecked_yesno", 1, "ccrm_h1project_data_2");
                Xrm.Page.getControl("ccrm_h1project_data_2").setLabel("By whom?");
            } else Xrm.Page.getControl("ccrm_h1project_data_2").setVisible(false);
        },
        duediligence_onchange: function() {
            //console.log("Executing Function");
            if (Xrm.Page.getAttribute("ccrm_duediligence_yesno").getValue() == 0) {
                this.fieldVisibility_onchange("ccrm_duediligence_yesno", 0, "ccrm_h1_project_data_7");
                Xrm.Page.getControl("ccrm_h1_project_data_7").setLabel("Please provide details");
            } else if (Xrm.Page.getAttribute("ccrm_duediligence_yesno").getValue() == 1) {
                this.fieldVisibility_onchange("ccrm_duediligence_yesno", 1, "ccrm_h1_project_data_7");
                Xrm.Page.getControl("ccrm_h1_project_data_7").setLabel("Did the due diligence raise any issues?");
            } else Xrm.Page.getControl("ccrm_h1_project_data_7").setVisible(false);
        },
        fieldVisibility_onchange: function(sourceField, sourceFieldValue, targetField) {
            //console.log("Executing Function");
            if (Xrm.Page.getAttribute(sourceField).getValue() == sourceFieldValue) Xrm.Page.getControl(targetField).setVisible(true);
            else Xrm.Page.getControl(targetField).setVisible(false);
        },
        fieldVisibility_onchange_inv: function(sourceField, sourceFieldValue, targetField) {
            //console.log("Executing Function");
            if (Xrm.Page.getAttribute(sourceField).getValue() == sourceFieldValue || Xrm.Page.getAttribute(sourceField).getValue() == null) Xrm.Page.getControl(targetField).setVisible(false);
            else Xrm.Page.getControl(targetField).setVisible(true);
        },
        chkFeesandCostCurrency: function() {
            //console.log("Executing Function");
            this.showhideSection("tab_SectionF", "tab_SectionF_5", true);
            if (Xrm.Page.getAttribute("ccrm_feepaymentcurrency").getValue() != null && Xrm.Page.getAttribute("ccrm_costcurrency").getValue() != null) {
                if (Xrm.Page.getAttribute("ccrm_feepaymentcurrency").getValue()[0].id == Xrm.Page.getAttribute("ccrm_costcurrency").getValue()[0].id) this.showhideSection("tab_SectionF",
                    "tab_SectionF_5", false);
            }
            if (Xrm.Page.getAttribute("ccrm_feepaymentcurrency").getValue() == null && Xrm.Page.getAttribute("ccrm_costcurrency").getValue() == null) this.showhideSection("tab_SectionF",
                "tab_SectionF_5", false);
        },
        chkKeyIndicators: function() {
            //console.log("Executing Function");
            var strKeyIndicators = Xrm.Page.getAttribute("ccrm_sectionf_data_10_value").getValue();
            if (strKeyIndicators == null) Xrm.Page.getControl("ccrm_h1project_data_4").setVisible(false);
            else {
                var n = strKeyIndicators.indexOf("100000005");
                if (n >= 0) Xrm.Page.getControl("ccrm_h1project_data_4").setVisible(true);
                else Xrm.Page.getControl("ccrm_h1project_data_4").setVisible(false);
            }
        },
        /*
         *********************************************************
         * Called from the Ribbon button - displays Bid
         * review report
         *********************************************************
         */
        openBidReviewReport: function() {
            //console.log("Executing Function");
            var rdlName = "Bid%20Review.rdl";
            var reportGuid = ARUP.ccrm_bidreview.getReportId("Bid Review");
            if (reportGuid != null) {
                var entityType = "10075"
                var entityGuid = Xrm.Page.data.entity.getId();
                var entityGuid = Xrm.Page.data.entity.getId();
                var url = Xrm.Page.context.getClientUrl() + "/crmreports/viewer/viewer.aspx?action=run&context=records&helpID=" + rdlName + "&id={" + reportGuid + "}&records=" + entityGuid +
                    "&recordstype=" + entityType;
                window.open(url, "Bid Review Report", "toolbar=0,menubar=0,resizable=1");
            }
        },
        /*
         *********************************************************
         * Returns the report id given the Name
         *********************************************************
         */
        getReportId: function(reportName) {
            //console.log("Executing Function");
            //ReportSet?$select=ReportId&$filter=Name eq 'Bid Review'        
            var dataset = "ReportSet";
            var filter = "Name eq '" + reportName + "'";
            var retrievemult = ConsultCrm.Sync.RetrieveMultipleRequest(dataset, filter);
            if (retrievemult != null && retrievemult.results.length > 0) {
                var retrievedreq = retrievemult.results[0];
                return retrievedreq.ReportId
            } else return null;
        },
        projectstartdate_onChange: function() {
            //console.log("Executing Function");
            this.dateValidator(Xrm.Page.getAttribute("ccrm_projectstartdate").getValue(), Xrm.Page.getAttribute("ccrm_projectenddate").getValue(), "ccrm_projectstartdate",
                "You must specify an Arup Project Start Date that happens before the Arup Project End Date.");
        },
        projectenddate_onChange: function() {
            //console.log("Executing Function");
            this.dateValidator(Xrm.Page.getAttribute("ccrm_projectstartdate").getValue(), Xrm.Page.getAttribute("ccrm_projectenddate").getValue(), "ccrm_projectenddate",
                "You must specify an Arup Project End Date that happens after the Arup Project Start Date.");
        },
        bidsubmitdate_onChange: function() {
            //console.log("Executing Function");
            //retrieve ccrm_bidreview and ccrm_arupbidstartdate from Opportunity
            if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return;
            var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
            var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
            if (retrievereq != null) {
                var bidreviewdate = retrievereq.Ccrm_BidReview;
                var bidstartdate = retrievereq.Ccrm_ArupBidStartDate;
                if (bidreviewdate != null) this.dateValidator(bidreviewdate, Xrm.Page.getAttribute("ccrm_submission_date").getValue(), "ccrm_submission_date",
                    "You must specify the Bid Submission Date that happens after the Opportunity Bid Review Date");
                if (bidstartdate != null) this.dateValidator(bidstartdate, Xrm.Page.getAttribute("ccrm_submission_date").getValue(), "ccrm_submission_date",
                    "You must specify the Bid Submission Date that happens after the Opportunity Bid Start Date");
            }
        },
        /*
         *********************************************************
         * Validate two date fields and if invalid
         * show error and blank field
         *********************************************************
         */
        dateValidator: function(startdate, enddate, attrname, errorMsg) {
            if (startdate != null && enddate != null) {
                startdate = new Date(startdate);
                enddate = new Date(enddate);
                if (enddate < startdate) {
                    alert(errorMsg);
                    Xrm.Page.getAttribute(attrname).setValue(null);
                }
            }
        }
    }
    //New Functions added: Charmain as discussed, you have a lot of annonymous functions here, but because they are being re-used multiple times, it didn't make sense so I added this one.

function HideFields(sourcefield, valueA, valueB, targetField) {
        var currentAttribute = Xrm.Page.data.entity.attributes.get(sourcefield).getValue();
        if (currentAttribute !== null) {
            if ((currentAttribute == valueA) || (currentAttribute == valueB)) {
                Xrm.Page.ui.controls.get(targetField).setVisible(false);
            } else {
                Xrm.Page.ui.controls.get(targetField).setVisible(true);
            }
        }
    }
    //Hide 2 SECTIONS

function ShowSections(sourcefield, valueA, tab_Section, sectionA, sectionB) {
        var currentAttribute = Xrm.Page.data.entity.attributes.get(sourcefield).getValue();
        if (currentAttribute != null) {
            if (currentAttribute == valueA) {
                //Show Section
                Xrm.Page.ui.tabs.get(tab_Section).sections.get(sectionA).setVisible(true);
                Xrm.Page.ui.tabs.get(tab_Section).sections.get(sectionB).setVisible(true);
            } else {
                Xrm.Page.ui.tabs.get(tab_Section).sections.get(sectionA).setVisible(false);
                Xrm.Page.ui.tabs.get(tab_Section).sections.get(sectionB).setVisible(false);
            }
        }
    }
    //There is a bug with Q6, investigate further

function QuestionE6() {
    var modelType = Xrm.Page.data.entity.attributes.get("ccrm_sectione_data_5").getValue();
    if (modelType !== null) {
        if ((modelType == '100000009') || (modelType == '100000010')) {
            Xrm.Page.ui.controls.get("ccrm_tcattached_yesno").setVisible(false);
        } else {
            Xrm.Page.ui.controls.get("ccrm_tcattached_yesno").setVisible(true);
        }
    }
}