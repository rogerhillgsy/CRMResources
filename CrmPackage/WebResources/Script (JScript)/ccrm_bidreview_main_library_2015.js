if (typeof (ARUP) == "undefined") {
    ARUP = {};
}

var bidReviewHappened = false;
var dataChanged = false;

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
    onLoad: function () {
        
        // remove an option from question B9a

        if (Xrm.Page.context.client.getClient() != "Mobile") {
            Xrm.Page.getControl("ccrm_sectionb_data_9_yesno").removeOption(100000002);
            Xrm.Page.getControl("ccrm_sectione_data_3a_new").removeOption(100000002);
        }        

        bidReviewHappened = disableFormFields();
        
        this.tab_SectionH_onLoad();
        
        if (!bidReviewHappened) {
            //load review Panel 
            if (Xrm.Page.getAttribute("ccrm_reviewpanel").getValue() == null) {
                this.loadReviewPanel();
                dataChanged = true;
            }
            dataChanged = this.loadSupplementData(dataChanged);
            dataChanged = this.ultimateClientNL(dataChanged);
            dataChanged = this.prePopulateFields(dataChanged);
            dataChanged = this.isPartofJV(dataChanged);
        }
        
        if (bidReviewHappened) {

            Alert.show('<font size="6" color="#333CFF"><b>Information</b></font>',
            '<font size="3" color="#000000"></br>Bid review approval has been provided for this opportunity.</br>This Bid Review form will no longer be refreshed for changes made to the opportunity.</font>',
            [
                { label: "<b>OK</b>", setFocus: true },
            ],
            "INFO",
            600,
            250,
            '',
            true);

        }
        else if (!bidReviewHappened && dataChanged) {

            Alert.show('<font size="6" color="#333CFF"><b>Information</b></font>',
            '<font size="3" color="#000000"></br>The bid review form has been refreshed for changes made to the opportunity. </br> You should review the bid review form for any new unanswered questions.</font>',
            [
                { label: "<b>OK</b>", setFocus: true },
            ],
            "INFO",
            500,
            250,
            '',
            true);

        }

        //this.twoOptions_onChange("ccrm_managementchanges_yesno", 1);
        Xrm.Page.ui.tabs.get("tab_BackgroundInfo_tickboxes").setDisplayState('collapsed');
        Xrm.Page.ui.tabs.get("tab_Client").setDisplayState('collapsed');
        Xrm.Page.ui.tabs.get("tab_SectionC").setDisplayState('collapsed');
        Xrm.Page.ui.tabs.get("tab_SectionD").setDisplayState('collapsed');
        Xrm.Page.ui.tabs.get("tab_SectionE").setDisplayState('collapsed');
        Xrm.Page.ui.tabs.get("tab_SectionF").setDisplayState('collapsed');
        Xrm.Page.ui.tabs.get("tab_SectionG").setDisplayState('collapsed');
        Xrm.Page.ui.tabs.get("tab_SectionH").setDisplayState('collapsed');
        Xrm.Page.ui.tabs.get("tab_11").setDisplayState('collapsed');
        Xrm.Page.ui.tabs.get("tab_14").setDisplayState('collapsed');

        setInterval(this.changeHeaderTileFormat(), 1000);

    },
    /*
     *********************************************************
     * Form On Save Event
     *********************************************************
     */
    onSave: function (executionObj) {
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

    changeHeaderTileFormat: function () {

        //This may not be a supported way to change the header tile width
        var headertiles = document.getElementsByClassName("ms-crm-HeaderTileElement");
        if (headertiles != null) {
            for (var i = 0; i < headertiles.length; i++) {
                headertiles[i].style.width = "350px";
            }
        }
    },

    /*
     *********************************************************
     * Function to validate that only one bid review exists
     * against the same opportunity
     *********************************************************
     */
    chkBidReviewCount: function () {
        var recordId = Xrm.Page.data.entity.attributes.get("ccrm_opportunityid").getValue()[0].id;
        var RelationshipName = "ccrm_opportunity_ccrm_bidreview";
        var dataSet = "OpportunitySet";
        var retrievedAssociated = ConsultCrm.Sync.RetrieveAssociatedRequest(recordId, dataset, RelationshipName);
        //alert(recordId);
        var bidReviewCount = retrievedAssociated.results.length;
        if (bidReviewCount == '1') return true; //records exists
        else return false; //none returned
    },

    isPartofJV: function (dataChanged) {
        if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return dataChanged;
        var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
        var dataset = "OpportunitySet";
        var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
        if (retrievereq != null) {
            if (retrievereq.Ccrm_ArupBiddingasaJointVenture != null) {

                var changedData = (retrievereq.Ccrm_ArupBiddingasaJointVenture == true && Xrm.Page.getAttribute("ccrm_jvbidding_yesno").getValue() != 1) ||
                                  (retrievereq.Ccrm_ArupBiddingasaJointVenture == false && Xrm.Page.getAttribute("ccrm_jvbidding_yesno").getValue() != 0);
                if (retrievereq.Ccrm_ArupBiddingasaJointVenture == true) {
                    //set drop down to true 
                    Xrm.Page.getAttribute("ccrm_jvbidding_yesno").setValue(1);
                } else if (retrievereq.Ccrm_ArupBiddingasaJointVenture == false) {
                    Xrm.Page.getAttribute("ccrm_jvbidding_yesno").setValue(0);
                }
                Xrm.Page.getAttribute("ccrm_jvbidding_yesno").setSubmitMode("always");
                this.twoOptions_onChange("ccrm_jvbidding_yesno", 1);

                if (!dataChanged) { dataChanged = changedData };

                //changedData = dataChanged = true ? true : changedData;
                //return changedData;
            }
            //return false;
        }
        return dataChanged;
        //return false;
    },

    /*
     *********************************************************
     * Retrieve the Ultimate Client Name & Country
     *********************************************************
     */
    ultimateClientNL: function (dataChanged) {
        if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return dataChanged;
        var changedData;
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
                        changedData = valueChanged('ccrm_client_data_2a_new', Xrm.Page.getAttribute("ccrm_client_data_2a_new").getValue(), fullReference);
                        if (!dataChanged) { dataChanged = changedData };
                        if (changedData && !bidReviewHappened) {
                            Xrm.Page.getAttribute("ccrm_client_data_2a_new").setValue(fullReference);
                            Xrm.Page.getAttribute("ccrm_client_data_2a_new").setSubmitMode("always");
                        }
                    }
                }
            }
        }
        return dataChanged;
    },
    /*
         /*
     *********************************************************
     * Prepopulate Various Fields in the form
     *********************************************************
     */
    prePopulateFields: function (dataChanged) {
        if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return dataChanged;
        var changedData;
        var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
        var dataset = "OpportunitySet";
        var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
        if (retrievereq !== null) {
            if (retrievereq.Ccrm_pjna != null) {
                changedData = valueChanged("PJN", Xrm.Page.getAttribute("ccrm_possiblejobnumber").getValue(), retrievereq.Ccrm_pjna);
                if (!dataChanged) { dataChanged = changedData };
                if (changedData && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_possiblejobnumber").setValue(retrievereq.Ccrm_pjna);
                    Xrm.Page.getAttribute("ccrm_possiblejobnumber").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_possiblejobnumber").setDisabled(true);
            }

            if (retrievereq.ccrm_projectid != null) {
                changedData = valueChanged('PID', Xrm.Page.getAttribute("ccrm_projectid_number").getValue(), retrievereq.Ccrm_Reference);
                if (!dataChanged) { dataChanged = changedData };
                if (changedData && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_projectid_number").setValue(retrievereq.Ccrm_Reference);
                    Xrm.Page.getAttribute("ccrm_projectid_number").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_projectid_number").setDisabled(true);
            }
            if (retrievereq.ccrm_bidmanager_userid != null) {
                //ccrm_bidmanager_userid
                var lookupVal = new Array();
                lookupVal[0] = new Object();
                lookupVal[0].id = retrievereq.ccrm_bidmanager_userid.Id;
                lookupVal[0].name = retrievereq.ccrm_bidmanager_userid.Name;
                lookupVal[0].entityType = retrievereq.ccrm_bidmanager_userid.LogicalName;
                changedData = valueChanged('BM', Xrm.Page.getAttribute("ccrm_bidmanager_userid").getValue() == null ? null : Xrm.Page.getAttribute("ccrm_bidmanager_userid").getValue()[0].id, lookupVal[0].id);
                //console.log('BM: ' + '\n' + changedData.toString() + '\n' + Xrm.Page.getAttribute("ccrm_bidmanager_userid").getValue()[0].id + '\n' + lookupVal[0].id);
                if (!dataChanged) { dataChanged = changedData };
                if (changedData && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_bidmanager_userid").setValue(lookupVal);
                    Xrm.Page.getAttribute("ccrm_bidmanager_userid").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_bidmanager_userid").setDisabled(true);
            }
            if (retrievereq.ccrm_biddirector_userid != null) {
                //ccrm_biddirector_userid
                var lookupVal = new Array();
                lookupVal[0] = new Object();
                lookupVal[0].id = retrievereq.ccrm_biddirector_userid.Id;
                lookupVal[0].name = retrievereq.ccrm_biddirector_userid.Name;
                lookupVal[0].entityType = retrievereq.ccrm_biddirector_userid.LogicalName;
                changedData = valueChanged('BD', Xrm.Page.getAttribute("ccrm_biddirector_userid").getValue() == null ? null : Xrm.Page.getAttribute("ccrm_biddirector_userid").getValue()[0].id, lookupVal[0].id);
                if (!dataChanged) { dataChanged = changedData };
                if (changedData && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_biddirector_userid").setValue(lookupVal);
                    Xrm.Page.getAttribute("ccrm_biddirector_userid").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_biddirector_userid").setDisabled(true);

            }
            if (retrievereq.CloseProbability != null) {
                changedData = valueChanged('Win %', Xrm.Page.getAttribute("ccrm_win_probability").getValue(), retrievereq.CloseProbability);
                if (!dataChanged) { dataChanged = changedData };
                if (changedData && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_win_probability").setValue(retrievereq.CloseProbability);
                    Xrm.Page.getAttribute("ccrm_win_probability").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_win_probability").setDisabled(true);
            }
            if (retrievereq.Ccrm_estimatedvalue_num != null) {
                changedData = valueChanged('Fee', Xrm.Page.getAttribute("ccrm_fee").getValue(), retrievereq.Ccrm_estimatedvalue_num);
                if (!dataChanged) { dataChanged = changedData };
                if (changedData && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_fee").setValue(retrievereq.Ccrm_estimatedvalue_num);
                    Xrm.Page.getAttribute("ccrm_fee").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_fee").setDisabled(true);
            }

            if (retrievereq.ccrm_arupcompanyid != null) {
                //ccrm_bidmanager_userid
                var lookupVal = new Array();
                lookupVal[0] = new Object();
                lookupVal[0].id = retrievereq.ccrm_arupcompanyid.Id;
                lookupVal[0].name = retrievereq.ccrm_arupcompanyid.Name;
                lookupVal[0].entityType = retrievereq.ccrm_arupcompanyid.LogicalName;
                changedData = valueChanged('Company', Xrm.Page.getAttribute("ccrm_arupcompanyid").getValue() == null ? null : Xrm.Page.getAttribute("ccrm_arupcompanyid").getValue()[0].id, lookupVal[0].id);
                if (!dataChanged) { dataChanged = changedData };
                if (changedData && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_arupcompanyid").setValue(lookupVal);
                    Xrm.Page.getAttribute("ccrm_arupcompanyid").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_arupcompanyid").setDisabled(true);
            }

            if (retrievereq.ccrm_bid_transactioncurrencyid != null) {                
                var lookupVal = new Array();
                lookupVal[0] = new Object();
                lookupVal[0].id = retrievereq.ccrm_bid_transactioncurrencyid.Id;
                lookupVal[0].name = retrievereq.ccrm_bid_transactioncurrencyid.Name;
                lookupVal[0].entityType = retrievereq.ccrm_bid_transactioncurrencyid.LogicalName;
                changedData = valueChanged('Currency', Xrm.Page.getAttribute("ccrm_currency").getValue() == null ? null : Xrm.Page.getAttribute("ccrm_currency").getValue()[0].id, lookupVal[0].id);
                if (!dataChanged) { dataChanged = changedData };
                if (changedData && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_currency").setValue(lookupVal);
                    Xrm.Page.getAttribute("ccrm_currency").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_currency").setDisabled(true);
            }
            if (retrievereq.ccrm_projectlocationid != null) {
                var lookupVal = new Array();
                lookupVal[0] = new Object();
                lookupVal[0].id = retrievereq.ccrm_projectlocationid.Id;
                lookupVal[0].name = retrievereq.ccrm_projectlocationid.Name;
                lookupVal[0].entityType = retrievereq.ccrm_projectlocationid.LogicalName;
                changedData = valueChanged('Location', Xrm.Page.getAttribute("ccrm_projectlocationid").getValue() == null ? null : Xrm.Page.getAttribute("ccrm_projectlocationid").getValue()[0].id, lookupVal[0].id);
                if (!dataChanged) { dataChanged = changedData };
                if (changedData && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_projectlocationid").setValue(lookupVal);
                    Xrm.Page.getAttribute("ccrm_projectlocationid").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_projectlocationid").setDisabled(true);
            }
            if (retrievereq.Ccrm_ChargingBasis != null) {
                changedData = valueChanged('Charging basis', Xrm.Page.getAttribute("ccrm_chargingbasis").getValue(), retrievereq.Ccrm_ChargingBasis.Value);
                if (!dataChanged) { dataChanged = changedData };
                if (changedData && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_chargingbasis").setValue(retrievereq.Ccrm_ChargingBasis.Value);
                    Xrm.Page.getAttribute("ccrm_chargingbasis").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_chargingbasis").setDisabled(true);
            }
            if (retrievereq.Ccrm_EstArupInvolvementStart != null) {
                var projectStart = new Date(parseInt(retrievereq.Ccrm_EstArupInvolvementStart.substr(6)));
                if (Xrm.Page.getAttribute("ccrm_projectstartdate").getValue() == null && projectStart == null)
                    changeData = false;
                else if ((Xrm.Page.getAttribute("ccrm_projectstartdate").getValue() != null && projectStart == null) ||
                    (Xrm.Page.getAttribute("ccrm_projectstartdate").getValue() == null && projectStart != null))
                    changedData = true;
                else {
                    changedData = Xrm.Page.getAttribute("ccrm_projectstartdate").getValue().toString().toUpperCase() != projectStart.toString().toUpperCase();
                }
                if (!dataChanged) { dataChanged = changedData };
                if (changedData && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_projectstartdate").setValue(projectStart);
                    Xrm.Page.getAttribute("ccrm_projectstartdate").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_projectstartdate").setDisabled(true);
            }
            if (retrievereq.Ccrm_EstArupInvolvementEnd != null) {
                var projectEnd = new Date(parseInt(retrievereq.Ccrm_EstArupInvolvementEnd.substr(6)));
                if (Xrm.Page.getAttribute("ccrm_projectenddate").getValue() == null && projectEnd == null)
                    changeData = false;
                else if ((Xrm.Page.getAttribute("ccrm_projectenddate").getValue() != null && projectEnd == null) ||
                    (Xrm.Page.getAttribute("ccrm_projectenddate").getValue() == null && projectEnd != null))
                    changedData = true;
                else {
                    changedData = Xrm.Page.getAttribute("ccrm_projectenddate").getValue().toString().toUpperCase() != projectEnd.toString().toUpperCase();
                }
                if (!dataChanged) { dataChanged = changedData };
                if (changedData && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_projectenddate").setValue(projectEnd);
                    Xrm.Page.getAttribute("ccrm_projectenddate").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_projectenddate").setDisabled(true);
            }
            if (retrievereq.ccrm_Client !== null) {
                var lookupValClient = new Array();
                lookupValClient[0] = new Object();
                var clientId = retrievereq.ccrm_Client.Id;
                lookupValClient[0].id = clientId;
                lookupValClient[0].name = retrievereq.ccrm_Client.Name;
                lookupValClient[0].entityType = retrievereq.ccrm_Client.LogicalName;
                changedData = valueChanged('potential client', Xrm.Page.getAttribute("ccrm_potentialclient").getValue() == null ? null : Xrm.Page.getAttribute("ccrm_potentialclient").getValue()[0].id, lookupValClient[0].id);
                if (!dataChanged) { dataChanged = changedData };
                if (changedData && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_potentialclient").setValue(lookupValClient);
                    Xrm.Page.getAttribute("ccrm_potentialclient").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_potentialclient").setDisabled(true);
                if (clientId !== null || undefined) {

                    var dataset = "AccountSet";
                    var retrievereqorg = ConsultCrm.Sync.RetrieveRequest(clientId, dataset);
                    if (retrievereqorg !== null) {
                        if (retrievereqorg.ccrm_keyaccountmanagerid.Id != null) {
                            var lookupValRM = new Array();
                            lookupValRM[0] = new Object();
                            lookupValRM[0].id = retrievereqorg.ccrm_keyaccountmanagerid.Id;
                            lookupValRM[0].name = retrievereqorg.ccrm_keyaccountmanagerid.Name;
                            lookupValRM[0].entityType = retrievereqorg.ccrm_keyaccountmanagerid.LogicalName;
                            changedData = valueChanged('RM', Xrm.Page.getAttribute("ccrm_relationshipmanager").getValue() == null ? null : Xrm.Page.getAttribute("ccrm_relationshipmanager").getValue()[0].id, lookupValRM[0].id);
                            if (!dataChanged) { dataChanged = changedData };
                            if (changedData && !bidReviewHappened) {
                                Xrm.Page.getAttribute("ccrm_relationshipmanager").setValue(lookupValRM);
                                Xrm.Page.getAttribute("ccrm_relationshipmanager").setSubmitMode("always");
                            }
                            //if (retrievereqorg.ccrm_keyaccountmanagerid.Id != null) {
                            //    Xrm.Page.getControl("ccrm_relationshipmanager").setDisabled(true);
                            //    Xrm.Page.getControl("ccrm_sectionb_data_9_yesno").setVisible(false);
                            //    Xrm.Page.getControl("ccrm_sectionb_data_9_comments").setVisible(false);
                            //}
                            //else {
                            //    Xrm.Page.getControl("ccrm_relationshipmanager").setDisabled(true);
                            //    Xrm.Page.getControl("ccrm_sectionb_data_9_yesno").setVisible(true);
                            //    Xrm.Page.getControl("ccrm_sectionb_data_9_comments").setVisible(true);
                            //}
                        }
                        else {
                            changedData = valueChanged('RM1', Xrm.Page.getAttribute("ccrm_relationshipmanager").getValue() == null ? null : Xrm.Page.getAttribute("ccrm_relationshipmanager").getValue()[0].id, null);
                            if (!dataChanged) { dataChanged = changedData };
                            if (changedData && !bidReviewHappened) {
                                Xrm.Page.getAttribute("ccrm_relationshipmanager").setValue(null);
                                Xrm.Page.getAttribute("ccrm_relationshipmanager").setSubmitMode("always");
                            }
                            Xrm.Page.getControl("ccrm_relationshipmanager").setDisabled(true);
                            Xrm.Page.getControl("ccrm_sectionb_data_9_yesno").setVisible(false);
                            Xrm.Page.getControl("ccrm_sectionb_data_9_comments").setVisible(false);
                        }
                        var clientdetails;
                        clientdetails = retrievereqorg.Name;
                        clientdetails += " - " + retrievereqorg.ccrm_countryid.Name;
                        changedData = valueChanged('ccrm_client_data_1', Xrm.Page.getAttribute("ccrm_client_data_1").getValue(), clientdetails);
                        if (!dataChanged) { dataChanged = changedData };
                        if (changedData && !bidReviewHappened) {
                            Xrm.Page.getAttribute("ccrm_client_data_1").setValue(clientdetails);
                            Xrm.Page.getAttribute("ccrm_client_data_1").setSubmitMode("always");
                        }
                        Xrm.Page.getControl("ccrm_client_data_1").setDisabled(true);
                        var clientType = retrievereqorg.ccrm_ClientType.Value;
                        var newClientType;
                        switch (clientType) {
                            case 100000000:
                                newClientType = 100000008
                                break
                            case 100000001:
                                newClientType = 100000009
                                break;
                            case 100000002:
                                newClientType = 100000003
                                break;
                            case 100000003:
                                newClientType = 100000000
                                break;
                            case 100000004:
                                newClientType = 100000010
                                break;
                            case null:
                                newClientType = null;
                                break;
                        }
                        changedData = valueChanged('ccrm_client_data_7_new', Xrm.Page.getAttribute("ccrm_client_data_7_new").getValue(), newClientType);
                        if (!dataChanged) { dataChanged = changedData };
                        if (changedData && !bidReviewHappened) {
                            Xrm.Page.getAttribute("ccrm_client_data_7_new").setValue(newClientType);
                            Xrm.Page.getAttribute("ccrm_client_data_7_new").setSubmitMode("always");
                        }
                        Xrm.Page.getControl("ccrm_client_data_7_new").setDisabled(true);
                    }
                }
            }
        }
        return dataChanged;
    },

    /*
     *********************************************************
     * Load the Bid Review Chair from the Calling Opportunity
     *********************************************************
     */
    loadReviewPanel: function () {
        //get Opportunity id 
        if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return;
        var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
        var dataset = "OpportunitySet";
        var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
        if (retrievereq != null) {
            //Populate review panel with the opportunity bid chair 
            if (retrievereq.ccrm_bidreviewchair_userId != null && !bidReviewHappened) {
                Xrm.Page.getAttribute("ccrm_reviewpanel").setValue(retrievereq.ccrm_bidreviewchair_userId.Name);
                Xrm.Page.getAttribute("ccrm_reviewpanel").setSubmitMode("always");
            }
        }
    },
    showhideSection: function (tabName, sectionName, isVisible) {
        var tab = Xrm.Page.ui.tabs.get(tabName);
        if (tab && tab.sections.get(sectionName)) {
            tab.sections.get(sectionName).setVisible(isVisible);
        }
    },
    //LOAD SUPPLEMENTARY DATA
    loadSupplementData: function (dataChanged) {
        var changedValue;
        if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return dataChanged;
        var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
        var dataset = "OpportunitySet";
        var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
        if (retrievereq != null) {
            //populate submission date
            if (retrievereq.Ccrm_BidSubmission != null) {
                //Parse the JSON Date                     
                var bidSubmissiondate = new Date(parseInt(retrievereq.Ccrm_BidSubmission.substr(6)));

                if (Xrm.Page.getAttribute("ccrm_submission_date").getValue() == null && bidSubmissiondate == null)
                    changedValue = false;
                else if ((Xrm.Page.getAttribute("ccrm_submission_date").getValue() != null && bidSubmissiondate == null) ||
                    (Xrm.Page.getAttribute("ccrm_submission_date").getValue() == null && bidSubmissiondate != null))
                    changedValue = true;
                else {
                    changedValue = Xrm.Page.getAttribute("ccrm_submission_date").getValue().toString().toUpperCase() != bidSubmissiondate.toString().toUpperCase();
                }
                if (!dataChanged) { dataChanged = changedValue };
                if (changedValue && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_submission_date").setValue(bidSubmissiondate);
                    Xrm.Page.getAttribute("ccrm_submission_date").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_submission_date").setDisabled(true);               

            }
            //Populate Scope of work
            if (retrievereq.Ccrm_DescriptionofExtentofArupServices != null) {
                changedValue = valueChanged('SOW', Xrm.Page.getAttribute("ccrm_scopeofwork").getValue(), retrievereq.Ccrm_DescriptionofExtentofArupServices);
                if (!dataChanged) { dataChanged = changedValue };
                if (changedValue && !bidReviewHappened) {
                    Xrm.Page.getAttribute("ccrm_scopeofwork").setValue(retrievereq.Ccrm_DescriptionofExtentofArupServices);
                    Xrm.Page.getAttribute("ccrm_scopeofwork").setSubmitMode("always");
                }
                Xrm.Page.getControl("ccrm_scopeofwork").setDisabled(true);
            }
        }
        return dataChanged;
    },
    /*
     *********************************************************
     * If client != ultimate Client
     * show Questions 2a and 3a else hide them
     *********************************************************
     */
    ultimateClient_onChange: function () {
        //var showSection = false;
        //if (Xrm.Page.getAttribute("ccrm_ultimateclient_yesno").getValue() != 1) //YES 
        var showSection = Xrm.Page.getAttribute("ccrm_ultimateclient_yesno").getValue() == 0;
        this.showhideSection("tab_Client", "tab_Client_section_3a", showSection);
        this.showhideSection("tab_Client", "tab_Client_section_2a", showSection);
    },

    //relationshipManager_onChange: function () {

    //    if (Xrm.Page.getControl("ccrm_relationshipmanager") != null) {

    //        if (Xrm.Page.getAttribute("ccrm_relationshipmanager").getValue() != null) {

    //            Xrm.Page.getControl("ccrm_relationshipmanager").setDisabled(true);
    //            Xrm.Page.getControl("ccrm_sectionb_data_9_yesno").setVisible(true);
    //            Xrm.Page.getControl("ccrm_sectionb_data_9_comments").setVisible(true);
    //        }
    //        else {
    //            Xrm.Page.getControl("ccrm_relationshipmanager").setDisabled(true);
    //            Xrm.Page.getControl("ccrm_sectionb_data_9_yesno").setVisible(false);
    //            Xrm.Page.getControl("ccrm_sectionb_data_9_comments").setVisible(false);
    //        }
    //    }
    //    else {
    //        Xrm.Page.getControl("ccrm_relationshipmanager").setDisabled(true);
    //        Xrm.Page.getControl("ccrm_sectionb_data_9_yesno").setVisible(false);
    //        Xrm.Page.getControl("ccrm_sectionb_data_9_comments").setVisible(false);
    //    }
    //},

    /*
     *********************************************************
     * Compare customerid to Opportunity
     * ultimate client id field
     *********************************************************
     */
    isUltimateClient: function () {
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
                return retrievereq.CustomerId.Id == retrievereq.ccrm_ultimateendclientid.Id;
            } else return false;
        }
    },

    /*
     *********************************************************
     * Retrieve power of attorney value from related
     * Opportunity
     *********************************************************
     */
    isPowerOfAttorney: function () {
        //compare OpportunitySet?$select=Ccrm_PowersofAttorney
        if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return false;
        var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
        var dataset = "OpportunitySet";
        var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
        if (retrievereq == null) return false;
        return retrievereq.Ccrm_PowersofAttorney;
        
    },
    /*
     *********************************************************
     * Toggle hidden question visibility
     *********************************************************
     */
    twoOptions_onChange: function (fieldName, value) {
        var showSection;
        if (Xrm.Page.getAttribute(fieldName).getValue() == value) showSection = true;
        else showSection = false;
        switch (fieldName) {
            case "ccrm_clearbrief_yesno":
                this.showhideSection("tab_SectionC", "tab_SectionC_1a", showSection);
                break;
            case "ccrm_sectiond_data_1_new":
                if (Xrm.Page.getAttribute(fieldName).getValue() == 100000001) { //no
                    this.showhideSection("tab_SectionD", "tab_SectionD_1a", true);
                    this.showhideSection("tab_SectionD", "tab_SectionD_1b", false);
                } else if (Xrm.Page.getAttribute(fieldName).getValue() == 100000000) { //yes
                    this.showhideSection("tab_SectionD", "tab_SectionD_1b", true);
                    this.showhideSection("tab_SectionD", "tab_SectionD_1a", false);
                } else {
                    this.showhideSection("tab_SectionD", "tab_SectionD_1b", false);
                    this.showhideSection("tab_SectionD", "tab_SectionD_1a", false);
                }
                break;
            case "ccrm_jvbidding_yesno":
                //Xrm.Page.getControl('ccrm_sectione_data_2a').setVisible(showSection);
                //console.log("Value: " + Xrm.Page.getAttribute('ccrm_jvbidding_yesno').getValue().toString() + ' visible? ' + Xrm.Page.getControl('ccrm_sectione_data_2a').getVisible());
                this.showhideSection("tab_SectionE", "tab_SectionE_2a", showSection);
                break;
            case "ccrm_sectione_data_5":
                this.showhideSection("tab_SectionE", "tab_SectionE_5a", false);
                this.showhideSection("tab_SectionE", "tab_SectionE_5b", false);                
                this.showhideSection("tab_SectionE", "tab_SectionE_6", false);
                this.showhideSection("tab_SectionE", "tab_SectionE_6a", false);
                this.showhideSection("tab_SectionE", "tab_SectionE_7abc", false);
                this.showhideSection("tab_SectionE", "tab_SectionE_7a", false);
                switch (Xrm.Page.getAttribute("ccrm_sectione_data_5").getValue()) {
                    case 100000006:
                    case 100000007:
                    case 100000008:
                        this.showhideSection("tab_SectionE", "tab_SectionE_5b", true);
                        break;
                    case 100000009:
                    case 100000010:
                        this.showhideSection("tab_SectionE", "tab_SectionE_6a", true);
                        break;
                    case 100000003:
                        this.showhideSection("tab_SectionE", "tab_SectionE_5a", true);
                        break;
                    case 100000004:
                        this.showhideSection("tab_SectionE", "tab_SectionE_6", true);
                        break;
                }
                break;
                //this.showhideSection("tab_SectionE", "tab_SectionE_5b", false);
                //this.showhideSection("tab_SectionE", "tab_SectionE_5a", false);
                //if (Xrm.Page.getAttribute(fieldName).getValue() == 100000003) { //Back to Back 
                //    this.showhideSection("tab_SectionE", "tab_SectionE_5a", true);
                //} else if (Xrm.Page.getAttribute(fieldName).getValue() == 100000004) { //Other
                //    this.showhideSection("tab_SectionE", "tab_SectionE_5b", true);
                //}
                //break;
            //case "ccrm_tcattached_yesno":
            //    this.showhideSection("tab_SectionE", "tab_SectionE_6a", false);
            //    this.showhideSection("tab_SectionE", "tab_SectionE_6b", false);
            //    if (Xrm.Page.getAttribute(fieldName).getValue() == 1) { //Yes
            //        this.showhideSection("tab_SectionE", "tab_SectionE_6a", true);
            //    } else if (Xrm.Page.getAttribute(fieldName).getValue() == 0) {
            //        this.showhideSection("tab_SectionE", "tab_SectionE_6b", true);
            //    }
            //    break;
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
                if (Xrm.Page.getAttribute("ccrm_liabilitylimit_yesno").getValue() == 0) {
                    this.showhideSection("tab_SectionE", "tab_SectionE_13c", true);
                    this.showhideSection("tab_SectionE", "tab_SectionE_13ab", false);
                }
                else if (Xrm.Page.getAttribute("ccrm_liabilitylimit_yesno").getValue() == 1) {
                    this.showhideSection("tab_SectionE", "tab_SectionE_13c", false);
                    this.showhideSection("tab_SectionE", "tab_SectionE_13ab", true);
                }
                else {
                    this.showhideSection("tab_SectionE", "tab_SectionE_13c", false);
                    this.showhideSection("tab_SectionE", "tab_SectionE_13ab", false);
                }
                break;
            case "ccrm_sectione_data_13b":
                this.showhideSection("tab_SectionE", "tab_SectionE_13c", showSection);
                if (showSection == true) Xrm.Page.getControl("ccrm_contract_data_9").setLabel("12c. Why would we accept this?");
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
            //case "ccrm_is_sectionh1_visible":
            //    this.showhideSection("tab_SectionH", "tab_SectionH_h1", showSection);
            //    break;
            //case "ccrm_is_sectionh2_visible":
            //    this.showhideSection("tab_SectionH", "tab_SectionH_h2", showSection);
            //    break;
            default:
        }
    },
    /*
     *********************************************************
     * Load the Relationship Manager from the Organisation / Client
     *********************************************************
     */
    loadRelationshipManager: function () {
        //retrieve the opportunity client
        if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null || bidReviewHappened) return;
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
                        Xrm.Page.getAttribute("ccrm_relationshipmanager").setSubmitMode("always");
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
    chkChargingBasis: function () {
        //retrieve the opportunity client
        if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return;
        var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
        var dataset = "OpportunitySet";
        var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
        if (retrievereq != null) {
            var visible = retrievereq.Ccrm_ChargingBasis.Value == 20;
            this.showhideSection("tab_SectionF", "tab_SectionF_3b", visible);
        }
    },
    /*
     *********************************************************
     * Check related opportunity bonds required and performance
     * guarantee fields. If both checked set bonds guaranteed
     * to Yes
     *********************************************************
     */
    chkBonds_GuaranteeRequirement: function () {
        if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null || bidReviewHappened) return;
        var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
        var dataset = "OpportunitySet";
        var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
        if (retrievereq != null) {
            if (retrievereq.Ccrm_BondsRequired == true && retrievereq.Ccrm_PerformanceGuarantees == true) Xrm.Page.getAttribute("ccrm_bonds_guarantees_yesno").setValue(1);
            else Xrm.Page.getAttribute("ccrm_bonds_guarantees_yesno").setValue(0);
            Xrm.Page.getAttribute("ccrm_bonds_guarantees_yesno").setSubmitMode("always");
        }
    },
    /*
     *********************************************************
     * Section H - Tab expanded
     *********************************************************
     */
    //Function hides the H-Tab and sections based on values selected in Section A Options
    //Can be re-factored
    tab_SectionH_onLoad: function () {

        var h1OptionObject = Xrm.Page.data.entity.attributes.get("ccrm_h1option_new");
        var h2OptionObject = Xrm.Page.data.entity.attributes.get("ccrm_h2option_new");
        var h1Option = null;
        var h2Option = null;
        if (h1OptionObject != null) { h1Option = h1OptionObject.getValue(); }
        if (h2OptionObject != null) { h2Option = h2OptionObject.getValue(); }
        if (h1Option == null || h1Option == 100000000) { h1Option = false; }
        if (h2Option == null || h2Option == 100000000) { h2Option = false; }

        Xrm.Page.ui.tabs.get("tab_SectionH").sections.get("tab_SectionH_h1").setVisible(h1Option);
        Xrm.Page.ui.tabs.get("tab_SectionH").sections.get("tab_SectionH_h2").setVisible(h2Option);
        
    },
    tab_SectionH_onstatechange: function () {

        //handle field toggling when section H is expanded only 
        if (Xrm.Page.ui.tabs.get("tab_SectionH").getDisplayState() == "expanded") {

            this.fieldVisibility_onchange("ccrm_clientvisit_yesno", 1, "ccrm_sectionh_data_1a");
            this.fieldVisibility_onchange("ccrm_exchangeinoperation_yesno", 1, "ccrm_h2_project_data_8");
            this.fieldVisibility_onchange("ccrm_designcertified_yesno", 1, "ccrm_certificationscostcovered_yesno"); //ADM 
            this.fieldVisibility_onchange("ccrm_designcertified_yesno", 1, "ccrm_h5adetails");
            this.fieldVisibility_onchange("ccrm_subconsultantswork_yesno", 1, "ccrm_sectionh2_data_2a"); //ADM 
            this.fieldVisibility_onchange("ccrm_legislativerequirements_yesno", 0, "ccrm_h24details"); //ADM 
            this.fieldVisibility_onchange("ccrm_certificationscostcovered_yesno", 0, "ccrm_h5adetails"); //ADM 
            HideFields("ccrm_sectionh2_data_4a", 100000003, 100000002, "ccrm_h4adetails");
            this.arup_sectioni_questioni2_1_onChange();

            this.tab_SectionH_onLoad();
            
        }
    },
    /*
     *********************************************************
     * Section C - Tab expanded
     *********************************************************
     */
    tab_SectionC_onstatechange: function () {

        //handle field toggling when section E is expanded only 
        if (Xrm.Page.ui.tabs.get("tab_SectionC").getDisplayState() == "expanded") {

            this.ccrm_defineddeliverables_yesno_onChange();
            this.ccrm_unusualreq_yesno_onChange();
            ccrm_sectionc_data_7_onChange();
            this.twoOptions_onChange("ccrm_clearbrief_yesno", 0);
            this.arup_sectiond_question9_onChange();
            this.arup_sectiond_question10_onChange();
            
        }
    },
    /*
     *********************************************************
     * Section D - Tab expanded
     *********************************************************
     */
    tab_SectionD_onstatechange: function () {

        //handle field toggling when section E is expanded only 
        if (Xrm.Page.ui.tabs.get("tab_SectionD").getDisplayState() == "expanded") {

            this.twoOptions_onChange("ccrm_sectiond_data_1_new", 0);
            //this.twoOptions_onChange("ccrm_managementchanges_yesno", 1);
            this.fieldVisibility_onchange("ccrm_sectiond_data_5", 100000001, "ccrm_schedule_data_5");
            this.fieldVisibility_onchange("ccrm_approvalreq_yesno", 1, "ccrm_h1_project_data_9");

        }

    },
    /*
     *********************************************************
     * Section G - Tab expanded
     *********************************************************
     */
    tab_SectionG_onstatechange: function () {

        //handle field toggling when section E is expanded only 
        if (Xrm.Page.ui.tabs.get("tab_SectionG").getDisplayState() == "expanded") {

            //hide sections 3b and 3c 
            this.showhideSection("tab_SectionG", "tab_SectionG_3b", false);
            this.showhideSection("tab_SectionG", "tab_SectionG_3c", false);
            this.twoOptions_onChange("ccrm_otherstaff_yesno", 1);
            this.fieldVisibility_onchange("ccrm_resourcesavailable_yesno", 0, "ccrm_sectiong_data_3a_comments");
            this.fieldVisibility_onchange("ccrm_hsneedsconsidered_yesno", 0, "ccrm_technical_data_9");
            this.fieldVisibility_onchange("ccrm_projecthsneeds_yesno", 1, "ccrm_technical_data_11");
            this.fieldVisibility_onchange("ccrm_sectiong_3bivoptionset", 0, "ccrm_sectiong_3bivoptionsetdetails");
            this.resourcechecked_onchange();
            ShowSections("ccrm_resourceconsultants_yesno", 1, "tab_SectionG", "tab_SectionG_3b", "tab_SectionG_3c"); //ADM
            this.fieldVisibility_onchange("ccrm_sectiong_3bi_optionset", 100000001, "ccrm_sectiong_3bi_name");
            this.fieldVisibility_onchange("ccrm_sectiong_3bii_optionset", 100000001, "ccrm_sectiong_3bii_name");
            this.fieldVisibility_onchange("ccrm_sectiong_3biii_optionset", 100000001, "ccrm_sectiong_3biii_name");
            this.twoOptions_onChange("ccrm_subconsultantsresourced_yesno", 1);

        }
    },
    /*
     *********************************************************
     * Section E - Tab expanded
     *********************************************************
     */
    tab_SectionE_onstatechange: function () {

        //handle field toggling when section E is expanded only 
        if (Xrm.Page.ui.tabs.get("tab_SectionE").getDisplayState() == "expanded") {

            //check if bonds or guarantees are required 
            this.chkBonds_GuaranteeRequirement();
            //setup OTHER field if type of bond required == 'OTHER'
            setup_display_other_field("ccrm_sectione_data_15a_value", "ccrm_sectione_data15a_other", "100000004");
            //check if we are bidding as part of JV 
            //if (Xrm.Page.getAttribute("ccrm_jvbidding_yesno").getValue() == null || Xrm.Page.getAttribute("ccrm_jvbidding_yesno").getValue() == 100000000)
            this.twoOptions_onChange("ccrm_sectione_data_5", 0);
            //this.twoOptions_onChange("ccrm_tcattached_yesno", 0);
            this.twoOptions_onChange("ccrm_contractreviewed_yesno", 0);
            this.twoOptions_onChange("ccrm_liabilitylimit_yesno", 1);
            this.twoOptions_onChange("ccrm_sectione_data_13b", 100000003);
            setTimeout(function () { ARUP.ccrm_bidreview.twoOptions_onChange("ccrm_bonds_guarantees_yesno", 1) }, 2000);
            //show/hide Section E question 3
            var showSection = false;
            if (this.isPowerOfAttorney()) showSection = true;
            this.showhideSection("tab_SectionE", "tab_SectionE_3a", showSection);
            console.log("Show section? " + showSection.toString());
            this.fieldVisibility_onchange("ccrm_onerousrequirements_yesno", 1, "ccrm_contract_data_4a");
            this.fieldVisibility_onchange("ccrm_sectione_data_16", 100000005, "ccrm_sectione_data16_other");

        }
    },
    /*
     *********************************************************
     * Section B - Tab expanded
     *********************************************************
     */
    tab_SectionB_onstatechange: function () {
        //console.log("Executing Function");
        if (Xrm.Page.ui.tabs.get("tab_Client").getDisplayState() == "expanded") {

            if (Xrm.Page.ui.getFormType() != 1) {

                if (Xrm.Page.getAttribute("ccrm_ultimateclient_yesno").getValue() != null && !bidReviewHappened) {
                    if (this.isUltimateClient() == true) Xrm.Page.getAttribute("ccrm_ultimateclient_yesno").setValue(1);
                    else Xrm.Page.getAttribute("ccrm_ultimateclient_yesno").setValue(0);
                    Xrm.Page.getAttribute("ccrm_ultimateclient_yesno").setSubmitMode("always");
                }

                this.ultimateClient_onChange();
                //this.relationshipManager_onChange();
                this.fieldVisibility_onchange("ccrm_client_data_5_new", 100000000, "ccrm_client_data_5a_new");
                this.WebResource_sectionB_question8_onChange();
                this.fieldVisibility_onchange("ccrm_client_payment_performance", 100000001, "ccrm_client_data_3");
                this.securedFunding_onChange();

            }
        }
    },
    /*
     *********************************************************
     * Section F - Tab expanded
     *********************************************************
     */
    tab_SectionF_onstatechange: function () {
        //console.log("Executing Function");
        if (Xrm.Page.ui.tabs.get("tab_SectionF").getDisplayState() == "expanded") {
            //check charging basis 
            this.chkChargingBasis();
            this.twoOptions_onChange("ccrm_resourceconsultants_yesno", 1);
            this.twoOptions_onChange("ccrm_negativeforecast_yesno", 1);
            this.twoOptions_onChange("ccrm_hourlyratesincluded_yesno", 0);
            this.fieldVisibility_onchange("arup_sectiongquestion1a", 1, "arup_sectiongq1b");
            this.fieldVisibility_onchange("arup_sectio0ngq1c", 1, "arup_sectiongq1d");
            this.fieldVisibility_onchange("ccrm_competitivebidtype", 100000002, "ccrm_sectionf_data_1a_multi");
            this.fieldVisibility_onchange("ccrm_bidassessmentbasis", 100000003, "ccrm_sectionf_data_1b_multi");
            this.fieldVisibility_onchange("ccrm_sectionf_data_2c", 100000004, "ccrm_fees_data_5");
            this.fieldVisibility_onchange("ccrm_conditionalpayments_yesno", 1, "ccrm_fees_data_19");
            this.fieldVisibility_onchange("ccrm_netfees_yesno", 0, "ccrm_sectionf_data_4_multi");
            this.fieldVisibility_onchange("ccrm_sectionf_data_5f_yesno", 1, "ccrm_sectionf_data_5f_details"); //ADM
            this.fieldVisibility_onchange("ccrm_similarpayterms_yesno", 0, "ccrm_sectionf_data8d_multi");
            this.fieldVisibility_onchange("ccrm_quotesreceived_yesno", 0, "ccrm_sectionf_data8b_multi");
            this.fieldVisibility_onchange("ccrm_chargingbasis", 20, "ccrm_sectionf_data_3b");
            setup_display_other_field("ccrm_sectionf_data_10_value", "ccrm_h1project_data_4", "100000005");
            this.duediligence_onchange();
            this.twoOptions_onChange("ccrm_paytermsmonthly_yesno", 0);
            //check whether fees and costs are in different currencies 
            this.chkFeesandCostCurrency();
            this.chkKeyIndicators();
        }
    },
    //FUNCTION LIST --------------------------------------------------------------------------------------------------
    //
    chargingbasis_onchange: function () {
        //console.log("Executing Function");
        if (Xrm.Page.getAttribute("ccrm_chargingbasis").getValue() == 20) {
            Xrm.Page.getControl("ccrm_sectionf_data_3b").setVisible(true);
        }
        else {
            Xrm.Page.getControl("ccrm_sectionf_data_3b").setVisible(false);
        }
    },

    ccrm_defineddeliverables_yesno_onChange: function () {

        this.fieldVisibility_onchange("ccrm_defineddeliverables_yesno", 0, "ccrm_technical_data_5");

    },

    arup_sectioni_questioni2_1_onChange: function () {

        var visible = Xrm.Page.getAttribute("arup_sectioni_questioni2_1").getValue() == 1;

        Xrm.Page.getControl("WebResource_sectionH2_question1").setVisible(visible);
        Xrm.Page.getControl("ccrm_sectionh2_data_1a").setVisible(visible);
        Xrm.Page.getControl("ccrm_sectionh2_data_1b").setVisible(visible);

    },

    //ccrm_sectionc_data_7_onChange: function () {

    //    console.log('1');

    //    HideFields("ccrm_sectionc_data_7", 100000001, 100000003, "ccrm_technical_data_8");

    //},

    ccrm_unusualreq_yesno_onChange: function () {

        this.fieldVisibility_onchange("ccrm_unusualreq_yesno", 1, "ccrm_technical_data_4");

    },

    WebResource_sectionB_question8_onChange: function () {

        this.fieldVisibility_onchange("ccrm_sectionb_data_8", 100000000, "ccrm_client_data_5");

    },

    //advancepayment_onchange: function () {
    //    //console.log("Executing Function");
    //    if (Xrm.Page.getAttribute("ccrm_advancepayment_yesno").getValue() == 0 || Xrm.Page.getAttribute("ccrm_advancepayment_yesno").getValue() == 1) {
    //        Xrm.Page.getControl("ccrm_fees_data_18").setVisible(true);
    //    }
    //    else {
    //        Xrm.Page.getControl("ccrm_fees_data_18").setVisible(false);
    //    }
    //},

    resourcechecked_onchange: function () {
        //console.log("Executing Function");

        //this.fieldVisibility_onchange("ccrm_resourceschecked_yesno", 1, "ccrm_h1project_data_2");

        if (Xrm.Page.getAttribute("ccrm_resourceschecked_yesno").getValue() == 0) {
            Xrm.Page.getControl("ccrm_h1project_data_2").setVisible(true);
            this.fieldVisibility_onchange("ccrm_resourceschecked_yesno", 0, "ccrm_h1project_data_2");
            Xrm.Page.getControl("ccrm_h1project_data_2").setLabel("4a. Please provide details");
        }
        else if (Xrm.Page.getAttribute("ccrm_resourceschecked_yesno").getValue() == 1) {
            Xrm.Page.getControl("ccrm_h1project_data_2").setVisible(true);
            this.fieldVisibility_onchange("ccrm_resourceschecked_yesno", 1, "ccrm_h1project_data_2");
            Xrm.Page.getControl("ccrm_h1project_data_2").setLabel("4a. By whom?");
        }
        else Xrm.Page.getControl("ccrm_h1project_data_2").setVisible(false);
    },
    duediligence_onchange: function () {
        //console.log("Executing Function");
        if (Xrm.Page.getAttribute("ccrm_duediligence_yesno").getValue() == 0) {
            this.fieldVisibility_onchange("ccrm_duediligence_yesno", 0, "ccrm_h1_project_data_7");
            Xrm.Page.getControl("ccrm_h1_project_data_7").setLabel("12a.i Please provide details");
        } else if (Xrm.Page.getAttribute("ccrm_duediligence_yesno").getValue() == 1) {
            this.fieldVisibility_onchange("ccrm_duediligence_yesno", 1, "ccrm_h1_project_data_7");
            Xrm.Page.getControl("ccrm_h1_project_data_7").setLabel("12a.i Did the due diligence raise any issues?");
        } else Xrm.Page.getControl("ccrm_h1_project_data_7").setVisible(false);
    },

    securedFunding_onChange: function () {

        if (Xrm.Page.getAttribute("ccrm_client_data_6_new") == null || Xrm.Page.getAttribute("ccrm_client_data_6a_new") == null) { return; }

        var securedValue = Xrm.Page.getAttribute("ccrm_client_data_6_new").getValue();
        var visible = securedValue == 100000002 || securedValue == 100000001;
        Xrm.Page.getControl("ccrm_client_data_6a_new").setVisible(visible);

    },

    fieldVisibility_onchange: function (sourceField, sourceFieldValue, targetField) {
        //console.log("Executing Function");
        if (Xrm.Page.getAttribute(sourceField) == null || Xrm.Page.getAttribute(targetField) == null) { return; }

        var visible = Xrm.Page.getAttribute(sourceField).getValue() == sourceFieldValue;
        Xrm.Page.getControl(targetField).setVisible(visible);

    },
    fieldVisibility_onchange_inv: function (sourceField, sourceFieldValue, targetField) {
        //console.log("Executing Function");
        if (Xrm.Page.getAttribute(sourceField).getValue() == sourceFieldValue || Xrm.Page.getAttribute(sourceField).getValue() == null) Xrm.Page.getControl(targetField).setVisible(false);
        else Xrm.Page.getControl(targetField).setVisible(true);
    },
    chkFeesandCostCurrency: function () {
        //console.log("Executing Function");
        this.showhideSection("tab_SectionF", "tab_SectionF_5", true);
        if (Xrm.Page.getAttribute("ccrm_feepaymentcurrency").getValue() != null && Xrm.Page.getAttribute("ccrm_costcurrency").getValue() != null) {
            if (Xrm.Page.getAttribute("ccrm_feepaymentcurrency").getValue()[0].id == Xrm.Page.getAttribute("ccrm_costcurrency").getValue()[0].id) this.showhideSection("tab_SectionF", "tab_SectionF_5", false);
        }
        if (Xrm.Page.getAttribute("ccrm_feepaymentcurrency").getValue() == null && Xrm.Page.getAttribute("ccrm_costcurrency").getValue() == null) this.showhideSection("tab_SectionF", "tab_SectionF_5", false);
    },
    arup_sectiond_question9_onChange: function () {

        this.showhideSection("tab_SectionC", "tabD_section9", Xrm.Page.getAttribute("arup_sectiond_question9").getValue() == '0');

    },
    arup_sectiond_question10_onChange: function () {

        this.showhideSection("tab_SectionC", "tabD_Section10a", Xrm.Page.getAttribute("arup_sectiond_question10").getValue() == '0');

    },
    chkKeyIndicators: function () {
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
    openBidReviewReport: function () {
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
    getReportId: function (reportName) {
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
    projectstartdate_onChange: function () {
        //console.log("Executing Function");
        this.dateValidator(Xrm.Page.getAttribute("ccrm_projectstartdate").getValue(), Xrm.Page.getAttribute("ccrm_projectenddate").getValue(), "ccrm_projectstartdate",
            "You must specify an Arup Project Start Date that happens before the Arup Project End Date.");
    },
    projectenddate_onChange: function () {
        //console.log("Executing Function");
        this.dateValidator(Xrm.Page.getAttribute("ccrm_projectstartdate").getValue(), Xrm.Page.getAttribute("ccrm_projectenddate").getValue(), "ccrm_projectenddate",
            "You must specify an Arup Project End Date that happens after the Arup Project Start Date.");
    },
    bidsubmitdate_onChange: function () {
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
    dateValidator: function (startdate, enddate, attrname, errorMsg) {
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

function ccrm_sectionc_data_7_onChange() {

    HideFields("ccrm_sectionc_data_7", 100000001, 100000003, "ccrm_technical_data_8");

}

function setup_display_other_field(otherFieldVal, otherFieldDetail, otherCodeValue, isToBeHidden) {
    /// <summary>Setup multi-select picklist so that when "other" is selected, a text field is activated to allow the user to enter the details.</summary>
    var isOtherFieldRequired = otherCodeValue;
    if (typeof (otherCodeValue) != "function") {
        isOtherFieldRequired = function (v) { return typeof (v) == "string" && v.search(otherCodeValue) > -1 || v == otherCodeValue };
    }
    isToBeHidden = isToBeHidden == null ? true : isToBeHidden;
    var attribute = Xrm.Page.getAttribute(otherFieldVal);
    if (!!attribute) {
        attribute.addOnChange(function () {
            display_other_field(otherFieldVal, otherFieldDetail, isOtherFieldRequired, isToBeHidden);
        });
        // Do this twice as header fields get their requirement level set after the onload function runs.
        display_other_field(otherFieldVal, otherFieldDetail, isOtherFieldRequired, isToBeHidden);
        setTimeout(function () {
            display_other_field(otherFieldVal, otherFieldDetail, isOtherFieldRequired, isToBeHidden);
        }, 1000);
    }
}

function display_other_field(otherFieldVal, otherFieldDetail, isOtherFieldRequired, isToBeHidden) {
    var value = Xrm.Page.getAttribute(otherFieldVal).getValue();
    var otherNetworkDetails = Xrm.Page.getControl(otherFieldDetail);

    if (!!otherNetworkDetails) {
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

function disableFormFields() {

    if (Xrm.Page.getAttribute("ccrm_opportunityid").getValue() == null) return false;

    var opportunityId = Xrm.Page.getAttribute("ccrm_opportunityid").getValue()[0].id;
    var bidReviewApproved = false;

    SDK.REST.retrieveRecord(opportunityId, "Opportunity", 'ccrm_BidReviewOutcome', null, function (retrievedreq) {
        bidReviewApproved = retrievedreq.ccrm_BidReviewOutcome.Value;
    }, errorHandler, false);

    //see if either approved or rejected
    return bidReviewApproved == 100000003 || bidReviewApproved == 100000002;

}

function errorHandler(error) {

    Alert.show('<font size="6" color="#FF0000"><b>Stop</b></font>',
        '<font size="3" color="#000000"></br>' + error.message + '</font>',
        [
            { label: "<b>OK</b>", setFocus: true },
        ],
        "ERROR",
        500,
        350,
        '',
        true);
}

function valueChanged(fieldName, originalValue, changedValue) {

    if ((originalValue == null && changedValue != null) ||
        (originalValue != null && changedValue == null)) return true;
    else
        if (originalValue == null && changedValue == null) return false;
        else {
            return originalValue.toString().replace('}', '').replace('{', '').toUpperCase() != changedValue.toString().replace('}', '').replace('{', '').toUpperCase();
        }

}