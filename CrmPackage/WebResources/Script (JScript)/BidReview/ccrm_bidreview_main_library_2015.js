/// <reference path="../All Other Entities/arup_exitFormFunctions.js"/>"/>
if (typeof (ARUP) == "undefined") {
    ARUP = {};
}



/*
*********************************************************


* Function Definitions - Bid Review Main 

*********************************************************
*/
ARUP.ccrm_bidreview = function() {

    var bidReviewHappened = false;
    var dataChanged = false;

    var object = {
        /*
         *********************************************************
         * Form On Load Event
         *********************************************************
         */
        onLoad: function(executionContext) {
            var formContext = executionContext.getFormContext();
            // remove an option from question B9a
            var clientURL = formContext.context.getClientUrl();
            if (formContext.context.client.getClient() != "Mobile") {
                formContext.getControl("ccrm_sectionb_data_9_yesno").removeOption(100000002);
                formContext.getControl("ccrm_sectione_data_3a_new").removeOption(100000002);
            }

            this.tab_SectionH_onLoad(executionContext);

            disableFormFields(executionContext)
                .then((bidReviewHappened) => {
                    if (!bidReviewHappened) { // BidReviewHappened
                        //load review Panel 
                        if (formContext.getAttribute("ccrm_reviewpanel").getValue() == null) {
                            this.loadReviewPanel(formContext);
                            dataChanged = true;
                        }
                        dataChanged = this.loadSupplementData(formContext, dataChanged);
                        dataChanged = this.ultimateClientNL(formContext, dataChanged);
                        dataChanged = this.prePopulateFields(formContext, dataChanged);
                        dataChanged = this.isPartofJV(executionContext, dataChanged);
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
                            clientURL,
                            true);

                    } else if (!bidReviewHappened && dataChanged) {

                        Alert.show('<font size="6" color="#333CFF"><b>Information</b></font>',
                            '<font size="3" color="#000000"></br>The bid review form has been refreshed for changes made to the opportunity. </br> You should review the bid review form for any new unanswered questions.</font>',
                            [
                                { label: "<b>OK</b>", setFocus: true },
                            ],
                            "INFO",
                            500,
                            250,
                            clientURL,
                            true);

                    }
                });

            //this.twoOptions_onChange("ccrm_managementchanges_yesno", 1);
            formContext.ui.tabs.get("tab_BackgroundInfo_tickboxes").setDisplayState('collapsed');
            formContext.ui.tabs.get("tab_Client").setDisplayState('collapsed');
            formContext.ui.tabs.get("tab_SectionC").setDisplayState('collapsed');
            formContext.ui.tabs.get("tab_SectionD").setDisplayState('collapsed');
            formContext.ui.tabs.get("tab_SectionE").setDisplayState('collapsed');
            formContext.ui.tabs.get("tab_SectionF").setDisplayState('collapsed');
            formContext.ui.tabs.get("tab_SectionG").setDisplayState('collapsed');
            formContext.ui.tabs.get("tab_SectionH").setDisplayState('collapsed');
            formContext.ui.tabs.get("tab_11").setDisplayState('collapsed');
            formContext.ui.tabs.get("tab_14").setDisplayState('collapsed');

            setInterval(this.changeHeaderTileFormat(), 1000);

        },
        /*
         *********************************************************
         * Form On Save Event
         *********************************************************
         */
        onSave: function(executionObj) {
            var formContext = executionObj.getFormContext();
            //to stop users from creating from adv find        
            if (formContext.data.entity.attributes.get("ccrm_opportunityid").getValue() == null) {
                alertDialog("Bid Review can only be created from within an Opportunity");
                executionObj.getEventArgs().preventDefault();
            }
            if (formContext.data.entity.attributes.get("ccrm_opportunityid").getValue() != null &&
                formContext.data.entity.getId() == null) {
                if (this.chkBidReviewCount(formContext) == true) {
                    alertDialog('You cannot create another Bid Review record');
                    executionObj.getEventArgs().preventDefault();
                }
            }
        },

        changeHeaderTileFormat: function() {

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
        chkBidReviewCount: function(formContext) {
            var recordId = formContext.data.entity.attributes.get("ccrm_opportunityid").getValue()[0].id;
            var bidReviewCount;
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: formContext.context.getClientUrl() +
                    "/api/data/v9.1/opportunities?fetchXml=%3Cfetch%20aggregate%3D%22true%22%20%3E%3Centity%20name%3D%22opportunity%22%20%3E%3Cattribute%20name%3D%22ccrm_bidreview%22%20aggregate%3D%22count%22%20alias%3D%22countofbids%22%20%2F%3E%3Cfilter%3E%3Ccondition%20attribute%3D%22opportunityid%22%20operator%3D%22eq%22%20value%3D%22" +
                    recordId +
                    "%22%20%2F%3E%3C%2Ffilter%3E%3C%2Fentity%3E%3C%2Ffetch%3E",
                beforeSend: function(XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                    XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                    XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                },
                async: false,
                success: function(data, textStatus, xhr) {
                    bidReviewCount = data.value.countofbids;
                },
                error: function(xhr, textStatus, errorThrown) {
                    alertDialog(textStatus + " " + errorThrown);
                }
            });

            /*var RelationshipName = "ccrm_opportunity_ccrm_bidreview";
            var dataSet = "OpportunitySet";
            //var retrievedAssociated = ConsultCrm.Sync.RetrieveAssociatedRequest(recordId, dataset, RelationshipName);
            //alert(recordId);
            //var bidReviewCount = retrievedAssociated.results.length;*/
            if (bidReviewCount == 1) return true; //records exists
            else return false; //none returned
        },

        isPartofJV: function(executionContext, dataChanged) {
            var formContext = executionContext.getFormContext();
            if (formContext.getAttribute("ccrm_opportunityid").getValue() == null) return dataChanged;
            var opportunityId = formContext.getAttribute("ccrm_opportunityid").getValue()[0].id;
            var ccrm_arups_role_in_project;
            var result;
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: formContext.context.getClientUrl() +
                    "/api/data/v9.1/opportunities(" +
                    opportunityId.replace("{", "").replace("}", "") +
                    ")?$select=ccrm_arups_role_in_project",
                beforeSend: function(XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                    XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                    XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                },
                async: false,
                success: function(data, textStatus, xhr) {
                    result = data;
                    ccrm_arups_role_in_project = result["ccrm_arups_role_in_project"];
                    var ccrm_arups_role_in_project_formatted =
                        result["ccrm_arups_role_in_project@OData.Community.Display.V1.FormattedValue"];
                },
                error: function(xhr, textStatus, errorThrown) {
                    alertDialog(textStatus + " " + errorThrown);
                }
            });
            /*var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);*/
            if (result != null) {
                if (ccrm_arups_role_in_project != null) {

                    var changedData = (ccrm_arups_role_in_project == 4 &&
                            formContext.getAttribute("ccrm_jvbidding_yesno").getValue() != 1) ||
                        (ccrm_arups_role_in_project != 4 &&
                            formContext.getAttribute("ccrm_jvbidding_yesno").getValue() != 0);
                    if (ccrm_arups_role_in_project == 4) {
                        //set drop down to true 
                        formContext.getAttribute("ccrm_jvbidding_yesno").setValue(1);
                    } else if (ccrm_arups_role_in_project != 4) {
                        formContext.getAttribute("ccrm_jvbidding_yesno").setValue(0);
                    }
                    formContext.getAttribute("ccrm_jvbidding_yesno").setSubmitMode("always");
                    this.twoOptions_onChange(executionContext, "ccrm_jvbidding_yesno", 1);

                    if (!dataChanged) {
                        dataChanged = changedData
                    };

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
        ultimateClientNL: function(formContext, dataChanged) {
            if (formContext.getAttribute("ccrm_opportunityid").getValue() == null) return dataChanged;
            var changedData;
            var opportunityId = formContext.getAttribute("ccrm_opportunityid").getValue()[0].id.replace("{", "")
                .replace("}", "");
            var result;
            var _ccrm_ultimateendclientid_value;
            var _ccrm_ultimateendclientid_value_formatted;
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: formContext.context.getClientUrl() +
                    "/api/data/v9.1/opportunities(" +
                    opportunityId +
                    ")?$select=_ccrm_ultimateendclientid_value",
                beforeSend: function(XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                    XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                    XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                },
                async: false,
                success: function(data, textStatus, xhr) {
                    result = data;
                    _ccrm_ultimateendclientid_value = result["_ccrm_ultimateendclientid_value"];
                    _ccrm_ultimateendclientid_value_formatted =
                        result["_ccrm_ultimateendclientid_value@OData.Community.Display.V1.FormattedValue"];
                },
                error: function(xhr, textStatus, errorThrown) {
                    alertDialog(textStatus + " " + errorThrown);
                }
            });
            //var dataset = "OpportunitySet";
            //var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);
            if (result !== null) {
                if (_ccrm_ultimateendclientid_value !== null) {
                    var fullReference = null;
                    var ultimateClientName = _ccrm_ultimateendclientid_value_formatted;
                    var ultimateClientId = _ccrm_ultimateendclientid_value;
                    fullReference = ultimateClientName;
                    if (ultimateClientId !== null || undefined) {
                        var retrievereq;
                        var _ccrm_countryid_value;
                        var _ccrm_countryid_value_formatted;
                        $.ajax({
                            type: "GET",
                            contentType: "application/json; charset=utf-8",
                            datatype: "json",
                            url: formContext.context.getClientUrl() +
                                "/api/data/v9.1/accounts(" +
                                ultimateClientId +
                                ")?$select=_ccrm_countryid_value",
                            beforeSend: function(XMLHttpRequest) {
                                XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                                XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                                XMLHttpRequest.setRequestHeader("Accept", "application/json");
                                XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                            },
                            async: false,
                            success: function(data, textStatus, xhr) {
                                retrievereq = data;
                                _ccrm_countryid_value = retrievereq["_ccrm_countryid_value"];
                                _ccrm_countryid_value_formatted =
                                    retrievereq["_ccrm_countryid_value@OData.Community.Display.V1.FormattedValue"];
                            },
                            error: function(xhr, textStatus, errorThrown) {
                                alertDialog(textStatus + " " + errorThrown);
                            }
                        });
                        /*var dataset = "AccountSet";
                        var retrievereq = ConsultCrm.Sync.RetrieveRequest(ultimateClientId, dataset);*/
                        if (retrievereq !== null) {
                            var clientName = _ccrm_countryid_value_formatted;
                            fullReference = fullReference + " - " + clientName;
                            changedData = valueChanged('ccrm_client_data_2a_new',
                                formContext.getAttribute("ccrm_client_data_2a_new").getValue(),
                                fullReference);
                            if (!dataChanged) {
                                dataChanged = changedData
                            };
                            if (changedData && !bidReviewHappened) {
                                formContext.getAttribute("ccrm_client_data_2a_new").setValue(fullReference);
                                formContext.getAttribute("ccrm_client_data_2a_new").setSubmitMode("always");
                            }
                        }
                    }
                }
            }
            return dataChanged;
        },
        /*
        *********************************************************
        * Prepopulate Various Fields in the form
        *********************************************************
        */
        prePopulateFields: function(formContext, dataChanged) {
            if (formContext.getAttribute("ccrm_opportunityid").getValue() == null) return dataChanged;
            var changedData;
            var opportunityId = formContext.getAttribute("ccrm_opportunityid").getValue()[0].id.replace("{", "")
                .replace("}", "");
            var result;
            var _ccrm_arupcompanyid_value;
            var _ccrm_arupcompanyid_value_formatted;
            var _ccrm_arupcompanyid_value_lookuplogicalname;
            var _ccrm_bid_transactioncurrencyid_value;
            var _ccrm_bid_transactioncurrencyid_value_formatted;
            var _ccrm_bid_transactioncurrencyid_value_lookuplogicalname;
            var _ccrm_biddirector_userid_value;
            var _ccrm_biddirector_userid_value_formatted;
            var _ccrm_biddirector_userid_value_lookuplogicalname;
            var _ccrm_bidmanager_userid_value;
            var _ccrm_bidmanager_userid_value_formatted;
            var _ccrm_bidmanager_userid_value_lookuplogicalname;
            var ccrm_chargingbasis;
            var ccrm_chargingbasis_formatted;
            var _ccrm_client_value;
            var _ccrm_client_value_formatted;
            var _ccrm_client_value_lookuplogicalname;
            var ccrm_estarupinvolvementend;
            var ccrm_estarupinvolvementstart;
            var ccrm_estimatedvalue_num;
            var ccrm_pjna;
            var _ccrm_projectid_value;
            var _ccrm_projectlocationid_value;
            var _ccrm_projectlocationid_value_lookuplogicalname;
            var ccrm_reference;
            var closeprobability;
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: formContext.context.getClientUrl() +
                    "/api/data/v9.1/opportunities(" +
                    opportunityId +
                    ")?$select=_ccrm_arupcompanyid_value,_ccrm_bid_transactioncurrencyid_value,_ccrm_biddirector_userid_value,_ccrm_bidmanager_userid_value,ccrm_chargingbasis,_ccrm_client_value,ccrm_estarupinvolvementend,ccrm_estarupinvolvementstart,ccrm_estimatedvalue_num,ccrm_pjna,_ccrm_projectid_value,_ccrm_projectlocationid_value,ccrm_reference,closeprobability",
                beforeSend: function(XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                    XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                    XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                },
                async: false,
                success: function(data, textStatus, xhr) {
                    result = data;
                    _ccrm_arupcompanyid_value = result["_ccrm_arupcompanyid_value"];
                    _ccrm_arupcompanyid_value_formatted =
                        result["_ccrm_arupcompanyid_value@OData.Community.Display.V1.FormattedValue"];
                    _ccrm_arupcompanyid_value_lookuplogicalname =
                        result["_ccrm_arupcompanyid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                    _ccrm_bid_transactioncurrencyid_value = result["_ccrm_bid_transactioncurrencyid_value"];
                    _ccrm_bid_transactioncurrencyid_value_formatted =
                        result["_ccrm_bid_transactioncurrencyid_value@OData.Community.Display.V1.FormattedValue"];
                    _ccrm_bid_transactioncurrencyid_value_lookuplogicalname =
                        result["_ccrm_bid_transactioncurrencyid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                    _ccrm_biddirector_userid_value = result["_ccrm_biddirector_userid_value"];
                    _ccrm_biddirector_userid_value_formatted =
                        result["_ccrm_biddirector_userid_value@OData.Community.Display.V1.FormattedValue"];
                    _ccrm_biddirector_userid_value_lookuplogicalname =
                        result["_ccrm_biddirector_userid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                    _ccrm_bidmanager_userid_value = result["_ccrm_bidmanager_userid_value"];
                    _ccrm_bidmanager_userid_value_formatted =
                        result["_ccrm_bidmanager_userid_value@OData.Community.Display.V1.FormattedValue"];
                    _ccrm_bidmanager_userid_value_lookuplogicalname =
                        result["_ccrm_bidmanager_userid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                    ccrm_chargingbasis = result["ccrm_chargingbasis"];
                    ccrm_chargingbasis_formatted =
                        result["ccrm_chargingbasis@OData.Community.Display.V1.FormattedValue"];
                    _ccrm_client_value = result["_ccrm_client_value"];
                    _ccrm_client_value_formatted =
                        result["_ccrm_client_value@OData.Community.Display.V1.FormattedValue"];
                    _ccrm_client_value_lookuplogicalname =
                        result["_ccrm_client_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                    ccrm_estarupinvolvementend = result["ccrm_estarupinvolvementend"];
                    ccrm_estarupinvolvementstart = result["ccrm_estarupinvolvementstart"];
                    ccrm_estimatedvalue_num = result["ccrm_estimatedvalue_num"];
                    ccrm_estimatedvalue_num_formatted =
                        result["ccrm_estimatedvalue_num@OData.Community.Display.V1.FormattedValue"];
                    ccrm_pjna = result["ccrm_pjna"];
                    _ccrm_projectid_value = result["_ccrm_projectid_value"];
                    _ccrm_projectid_value_formatted =
                        result["_ccrm_projectid_value@OData.Community.Display.V1.FormattedValue"];
                    _ccrm_projectlocationid_value = result["_ccrm_projectlocationid_value"];
                    _ccrm_projectlocationid_value_formatted =
                        result["_ccrm_projectlocationid_value@OData.Community.Display.V1.FormattedValue"];
                    _ccrm_projectlocationid_value_lookuplogicalname =
                        result["_ccrm_projectlocationid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                    ccrm_reference = result["ccrm_reference"];
                    closeprobability = result["closeprobability"];
                    closeprobability_formatted = result["closeprobability@OData.Community.Display.V1.FormattedValue"];
                },
                error: function(xhr, textStatus, errorThrown) {
                    alertDialog(textStatus + " " + errorThrown);
                }
            });
            /*var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);*/
            if (result !== null) {
                if (ccrm_pjna != null) {
                    changedData = valueChanged("PJN",
                        formContext.getAttribute("ccrm_possiblejobnumber").getValue(),
                        ccrm_pjna);
                    if (!dataChanged) {
                        dataChanged = changedData
                    };
                    if (changedData && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_possiblejobnumber").setValue(ccrm_pjna);
                        formContext.getAttribute("ccrm_possiblejobnumber").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_possiblejobnumber").setDisabled(true);
                }

                if (_ccrm_projectid_value != null) {
                    changedData = valueChanged('PID',
                        formContext.getAttribute("ccrm_projectid_number").getValue(),
                        ccrm_reference);
                    if (!dataChanged) {
                        dataChanged = changedData
                    };
                    if (changedData && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_projectid_number").setValue(ccrm_reference);
                        formContext.getAttribute("ccrm_projectid_number").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_projectid_number").setDisabled(true);
                }
                if (_ccrm_bidmanager_userid_value != null) {
                    //ccrm_bidmanager_userid
                    var lookupVal = new Array();
                    lookupVal[0] = new Object();
                    lookupVal[0].id = _ccrm_bidmanager_userid_value;
                    lookupVal[0].name = _ccrm_bidmanager_userid_value_formatted;
                    lookupVal[0].entityType = _ccrm_bidmanager_userid_value_lookuplogicalname;
                    changedData = valueChanged('BM',
                        formContext.getAttribute("ccrm_bidmanager_userid").getValue() == null
                        ? null
                        : formContext.getAttribute("ccrm_bidmanager_userid").getValue()[0].id,
                        lookupVal[0].id);
                    if (!dataChanged) {
                        dataChanged = changedData
                    };
                    if (changedData && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_bidmanager_userid").setValue(lookupVal);
                        formContext.getAttribute("ccrm_bidmanager_userid").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_bidmanager_userid").setDisabled(true);
                }
                if (_ccrm_biddirector_userid_value != null) {
                    //ccrm_biddirector_userid
                    var lookupVal = new Array();
                    lookupVal[0] = new Object();
                    lookupVal[0].id = _ccrm_biddirector_userid_value;
                    lookupVal[0].name = _ccrm_biddirector_userid_value_formatted;
                    lookupVal[0].entityType = _ccrm_biddirector_userid_value_lookuplogicalname;
                    changedData = valueChanged('BD',
                        formContext.getAttribute("ccrm_biddirector_userid").getValue() == null
                        ? null
                        : formContext.getAttribute("ccrm_biddirector_userid").getValue()[0].id,
                        lookupVal[0].id);
                    if (!dataChanged) {
                        dataChanged = changedData
                    };
                    if (changedData && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_biddirector_userid").setValue(lookupVal);
                        formContext.getAttribute("ccrm_biddirector_userid").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_biddirector_userid").setDisabled(true);

                }
                if (closeprobability != null) {
                    changedData = valueChanged('Win %',
                        formContext.getAttribute("ccrm_win_probability").getValue(),
                        closeprobability);
                    if (!dataChanged) {
                        dataChanged = changedData
                    };
                    if (changedData && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_win_probability").setValue(closeprobability);
                        formContext.getAttribute("ccrm_win_probability").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_win_probability").setDisabled(true);
                }
                if (ccrm_estimatedvalue_num != null) {
                    changedData = valueChanged('Fee',
                        formContext.getAttribute("ccrm_fee").getValue(),
                        ccrm_estimatedvalue_num);
                    if (!dataChanged) {
                        dataChanged = changedData
                    };
                    if (changedData && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_fee").setValue(ccrm_estimatedvalue_num);
                        formContext.getAttribute("ccrm_fee").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_fee").setDisabled(true);
                }

                if (_ccrm_arupcompanyid_value != null) {
                    //ccrm_bidmanager_userid
                    var lookupVal = new Array();
                    lookupVal[0] = new Object();
                    lookupVal[0].id = _ccrm_arupcompanyid_value;
                    lookupVal[0].name = _ccrm_arupcompanyid_value_formatted;
                    lookupVal[0].entityType = _ccrm_arupcompanyid_value_lookuplogicalname;
                    changedData = valueChanged('Company',
                        formContext.getAttribute("ccrm_arupcompanyid").getValue() == null
                        ? null
                        : formContext.getAttribute("ccrm_arupcompanyid").getValue()[0].id,
                        lookupVal[0].id);
                    if (!dataChanged) {
                        dataChanged = changedData
                    };
                    if (changedData && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_arupcompanyid").setValue(lookupVal);
                        formContext.getAttribute("ccrm_arupcompanyid").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_arupcompanyid").setDisabled(true);
                }

                if (_ccrm_bid_transactioncurrencyid_value != null) {
                    var lookupVal = new Array();
                    lookupVal[0] = new Object();
                    lookupVal[0].id = _ccrm_bid_transactioncurrencyid_value;
                    lookupVal[0].name = _ccrm_bid_transactioncurrencyid_value_formatted;
                    lookupVal[0].entityType = _ccrm_bid_transactioncurrencyid_value_lookuplogicalname;
                    changedData = valueChanged('Currency',
                        formContext.getAttribute("ccrm_currency").getValue() == null
                        ? null
                        : formContext.getAttribute("ccrm_currency").getValue()[0].id,
                        lookupVal[0].id);
                    if (!dataChanged) {
                        dataChanged = changedData
                    };
                    if (changedData && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_currency").setValue(lookupVal);
                        formContext.getAttribute("ccrm_currency").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_currency").setDisabled(true);
                }
                if (_ccrm_projectlocationid_value != null) {
                    var lookupVal = new Array();
                    lookupVal[0] = new Object();
                    lookupVal[0].id = _ccrm_projectlocationid_value;
                    lookupVal[0].name = _ccrm_projectlocationid_value_formatted;
                    lookupVal[0].entityType = _ccrm_projectlocationid_value_lookuplogicalname;
                    changedData = valueChanged('Location',
                        formContext.getAttribute("ccrm_projectlocationid").getValue() == null
                        ? null
                        : formContext.getAttribute("ccrm_projectlocationid").getValue()[0].id,
                        lookupVal[0].id);
                    if (!dataChanged) {
                        dataChanged = changedData
                    };
                    if (changedData && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_projectlocationid").setValue(lookupVal);
                        formContext.getAttribute("ccrm_projectlocationid").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_projectlocationid").setDisabled(true);
                }
                if (ccrm_chargingbasis != null) {
                    changedData = valueChanged('Charging basis',
                        formContext.getAttribute("ccrm_chargingbasis").getValue(),
                        ccrm_chargingbasis);
                    if (!dataChanged) {
                        dataChanged = changedData
                    };
                    if (changedData && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_chargingbasis").setValue(ccrm_chargingbasis);
                        formContext.getAttribute("ccrm_chargingbasis").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_chargingbasis").setDisabled(true);
                }
                if (ccrm_estarupinvolvementstart != null) {
                    var projectStart =
                        new Date(
                            ccrm_estarupinvolvementstart); //new Date(parseInt(retrievereq.Ccrm_EstArupInvolvementStart.substr(6)));
                    if (formContext.getAttribute("ccrm_projectstartdate").getValue() == null && projectStart == null)
                        changeData = false;
                    else if ((formContext.getAttribute("ccrm_projectstartdate").getValue() != null &&
                            projectStart == null) ||
                        (formContext.getAttribute("ccrm_projectstartdate").getValue() == null && projectStart != null))
                        changedData = true;
                    else {
                        changedData =
                            formContext.getAttribute("ccrm_projectstartdate").getValue().toString().toUpperCase() !=
                            projectStart.toString().toUpperCase();
                    }
                    if (!dataChanged) {
                        dataChanged = changedData
                    };
                    if (changedData && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_projectstartdate").setValue(projectStart);
                        formContext.getAttribute("ccrm_projectstartdate").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_projectstartdate").setDisabled(true);
                }
                if (ccrm_estarupinvolvementend != null) {
                    var projectEnd = new Date(ccrm_estarupinvolvementend);
                    if (formContext.getAttribute("ccrm_projectenddate").getValue() == null && projectEnd == null)
                        changeData = false;
                    else if ((formContext.getAttribute("ccrm_projectenddate").getValue() != null &&
                            projectEnd == null) ||
                        (formContext.getAttribute("ccrm_projectenddate").getValue() == null && projectEnd != null))
                        changedData = true;
                    else {
                        changedData =
                            formContext.getAttribute("ccrm_projectenddate").getValue().toString().toUpperCase() !=
                            projectEnd.toString().toUpperCase();
                    }
                    if (!dataChanged) {
                        dataChanged = changedData
                    };
                    if (changedData && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_projectenddate").setValue(projectEnd);
                        formContext.getAttribute("ccrm_projectenddate").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_projectenddate").setDisabled(true);
                }
                if (_ccrm_client_value !== null) {
                    var lookupValClient = new Array();
                    lookupValClient[0] = new Object();
                    var clientId = _ccrm_client_value;
                    lookupValClient[0].id = clientId;
                    lookupValClient[0].name = _ccrm_client_value_formatted;
                    lookupValClient[0].entityType = _ccrm_client_value_lookuplogicalname;
                    changedData = valueChanged('potential client',
                        formContext.getAttribute("ccrm_potentialclient").getValue() == null
                        ? null
                        : formContext.getAttribute("ccrm_potentialclient").getValue()[0].id,
                        lookupValClient[0].id);
                    if (!dataChanged) {
                        dataChanged = changedData
                    };
                    if (changedData && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_potentialclient").setValue(lookupValClient);
                        formContext.getAttribute("ccrm_potentialclient").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_potentialclient").setDisabled(true);
                    if (clientId !== null || undefined) {
                        var retrievereqorg;
                        var ccrm_clienttype;
                        var ccrm_clienttype_formatted;
                        var _ccrm_countryid_value;
                        var _ccrm_countryid_value_formatted;
                        var _ccrm_countryid_value_lookuplogicalname;
                        var _ccrm_keyaccountmanagerid_value;
                        var _ccrm_keyaccountmanagerid_value_formatted;
                        var _ccrm_keyaccountmanagerid_value_lookuplogicalname;
                        var name;
                        $.ajax({
                            type: "GET",
                            contentType: "application/json; charset=utf-8",
                            datatype: "json",
                            url: formContext.context.getClientUrl() +
                                "/api/data/v9.1/accounts(" +
                                clientId +
                                ")?$select=ccrm_clienttype,_ccrm_countryid_value,_ccrm_keyaccountmanagerid_value,name",
                            beforeSend: function(XMLHttpRequest) {
                                XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                                XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                                XMLHttpRequest.setRequestHeader("Accept", "application/json");
                                XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                            },
                            async: false,
                            success: function(data, textStatus, xhr) {
                                retrievereqorg = data;
                                ccrm_clienttype = retrievereqorg["ccrm_clienttype"];
                                ccrm_clienttype_formatted =
                                    retrievereqorg["ccrm_clienttype@OData.Community.Display.V1.FormattedValue"];
                                _ccrm_countryid_value = retrievereqorg["_ccrm_countryid_value"];
                                _ccrm_countryid_value_formatted =
                                    retrievereqorg["_ccrm_countryid_value@OData.Community.Display.V1.FormattedValue"];
                                _ccrm_countryid_value_lookuplogicalname =
                                    retrievereqorg["_ccrm_countryid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                                _ccrm_keyaccountmanagerid_value = retrievereqorg["_ccrm_keyaccountmanagerid_value"];
                                _ccrm_keyaccountmanagerid_value_formatted =
                                    retrievereqorg[
                                        "_ccrm_keyaccountmanagerid_value@OData.Community.Display.V1.FormattedValue"];
                                _ccrm_keyaccountmanagerid_value_lookuplogicalname =
                                    retrievereqorg[
                                        "_ccrm_keyaccountmanagerid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                                name = retrievereqorg["name"];
                            },
                            error: function(xhr, textStatus, errorThrown) {
                                alertDialog(textStatus + " " + errorThrown);
                            }
                        });
                        /*var dataset = "AccountSet";
                        var retrievereqorg = ConsultCrm.Sync.RetrieveRequest(clientId, dataset);*/
                        if (retrievereqorg !== null) {
                            if (_ccrm_keyaccountmanagerid_value != null) {
                                var lookupValRM = new Array();
                                lookupValRM[0] = new Object();
                                lookupValRM[0].id = _ccrm_keyaccountmanagerid_value;
                                lookupValRM[0].name = _ccrm_keyaccountmanagerid_value_formatted;
                                lookupValRM[0].entityType = _ccrm_keyaccountmanagerid_value_lookuplogicalname;
                                changedData = valueChanged('RM',
                                    formContext.getAttribute("ccrm_relationshipmanager").getValue() == null
                                    ? null
                                    : formContext.getAttribute("ccrm_relationshipmanager").getValue()[0].id,
                                    lookupValRM[0].id);
                                if (!dataChanged) {
                                    dataChanged = changedData
                                };
                                if (changedData && !bidReviewHappened) {
                                    formContext.getAttribute("ccrm_relationshipmanager").setValue(lookupValRM);
                                    formContext.getAttribute("ccrm_relationshipmanager").setSubmitMode("always");
                                }
                            } else {
                                changedData = valueChanged('RM1',
                                    formContext.getAttribute("ccrm_relationshipmanager").getValue() == null
                                    ? null
                                    : formContext.getAttribute("ccrm_relationshipmanager").getValue()[0].id,
                                    null);
                                if (!dataChanged) {
                                    dataChanged = changedData
                                };
                                if (changedData && !bidReviewHappened) {
                                    formContext.getAttribute("ccrm_relationshipmanager").setValue(null);
                                    formContext.getAttribute("ccrm_relationshipmanager").setSubmitMode("always");
                                }
                                formContext.getControl("ccrm_relationshipmanager").setDisabled(true);
                                formContext.getControl("ccrm_sectionb_data_9_yesno").setVisible(false);
                                formContext.getControl("ccrm_sectionb_data_9_comments").setVisible(false);
                            }
                            var clientdetails;
                            clientdetails = name;
                            clientdetails += " - " + _ccrm_countryid_value_formatted;
                            changedData = valueChanged('ccrm_client_data_1',
                                formContext.getAttribute("ccrm_client_data_1").getValue(),
                                clientdetails);
                            if (!dataChanged) {
                                dataChanged = changedData
                            };
                            if (changedData && !bidReviewHappened) {
                                formContext.getAttribute("ccrm_client_data_1").setValue(clientdetails);
                                formContext.getAttribute("ccrm_client_data_1").setSubmitMode("always");
                            }
                            formContext.getControl("ccrm_client_data_1").setDisabled(true);
                            var clientType = ccrm_clienttype;
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
                            changedData = valueChanged('ccrm_client_data_7_new',
                                formContext.getAttribute("ccrm_client_data_7_new").getValue(),
                                newClientType);
                            if (!dataChanged) {
                                dataChanged = changedData
                            };
                            if (changedData && !bidReviewHappened) {
                                formContext.getAttribute("ccrm_client_data_7_new").setValue(newClientType);
                                formContext.getAttribute("ccrm_client_data_7_new").setSubmitMode("always");
                            }
                            formContext.getControl("ccrm_client_data_7_new").setDisabled(true);
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
        loadReviewPanel: function(formContext) {
            //get Opportunity id 
            if (formContext.getAttribute("ccrm_opportunityid").getValue() == null) return;
            var opportunityId = formContext.getAttribute("ccrm_opportunityid").getValue()[0].id.replace("{", "")
                .replace("}", "");
            var result;
            var _ccrm_bidreviewchair_userid_value;
            var _ccrm_bidreviewchair_userid_value_formatted;

            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: formContext.context.getClientUrl() +
                    "/api/data/v9.1/opportunities(" +
                    opportunityId +
                    ")?$select=_ccrm_bidreviewchair_userid_value",
                beforeSend: function(XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                    XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                    XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                },
                async: false,
                success: function(data, textStatus, xhr) {
                    result = data;
                    _ccrm_bidreviewchair_userid_value = result["_ccrm_bidreviewchair_userid_value"];
                    _ccrm_bidreviewchair_userid_value_formatted =
                        result["_ccrm_bidreviewchair_userid_value@OData.Community.Display.V1.FormattedValue"];
                },
                error: function(xhr, textStatus, errorThrown) {
                    alertDialog(textStatus + " " + errorThrown);
                }
            });
            /*var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);*/
            if (result != null) {
                //Populate review panel with the opportunity bid chair 
                if (_ccrm_bidreviewchair_userid_value != null && !bidReviewHappened) {
                    formContext.getAttribute("ccrm_reviewpanel").setValue(_ccrm_bidreviewchair_userid_value_formatted);
                    formContext.getAttribute("ccrm_reviewpanel").setSubmitMode("always");
                }
            }
        },
        showhideSection: function(formContext, tabName, sectionName, isVisible) {
            var tab = formContext.ui.tabs.get(tabName);
            if (tab && tab.sections.get(sectionName)) {
                tab.sections.get(sectionName).setVisible(isVisible);
            }
        },
        //LOAD SUPPLEMENTARY DATA
        loadSupplementData: function(formContext, dataChanged) {
            var changedValue;
            if (formContext.getAttribute("ccrm_opportunityid").getValue() == null) return dataChanged;
            var opportunityId = formContext.getAttribute("ccrm_opportunityid").getValue()[0].id.replace("{", "")
                .replace("}", "");
            var result;
            var ccrm_bidsubmission;
            var ccrm_descriptionofextentofarupservices;
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: formContext.context.getClientUrl() +
                    "/api/data/v9.1/opportunities(" +
                    opportunityId +
                    ")?$select=ccrm_bidsubmission,ccrm_descriptionofextentofarupservices",
                beforeSend: function(XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                    XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                    XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                },
                async: false,
                success: function(data, textStatus, xhr) {
                    result = data;
                    ccrm_bidsubmission = result["ccrm_bidsubmission"];
                    ccrm_descriptionofextentofarupservices = result["ccrm_descriptionofextentofarupservices"];
                },
                error: function(xhr, textStatus, errorThrown) {
                    alertDialog(textStatus + " " + errorThrown);
                }
            });
            /*var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);*/
            if (result != null) {
                //populate submission date
                if (ccrm_bidsubmission != null) {
                    //Parse the JSON Date                     
                    var bidSubmissiondate = new Date(ccrm_bidsubmission);

                    if (formContext.getAttribute("ccrm_submission_date").getValue() == null &&
                        bidSubmissiondate == null)
                        changedValue = false;
                    else if ((formContext.getAttribute("ccrm_submission_date").getValue() != null &&
                            bidSubmissiondate == null) ||
                        (formContext.getAttribute("ccrm_submission_date").getValue() == null &&
                            bidSubmissiondate != null))
                        changedValue = true;
                    else {
                        changedValue =
                            formContext.getAttribute("ccrm_submission_date").getValue().toString().toUpperCase() !=
                            bidSubmissiondate.toString().toUpperCase();
                    }
                    if (!dataChanged) {
                        dataChanged = changedValue
                    };
                    if (changedValue && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_submission_date").setValue(bidSubmissiondate);
                        formContext.getAttribute("ccrm_submission_date").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_submission_date").setDisabled(true);

                }
                //Populate Scope of work
                if (ccrm_descriptionofextentofarupservices != null) {
                    changedValue = valueChanged('SOW',
                        formContext.getAttribute("ccrm_scopeofwork").getValue(),
                        ccrm_descriptionofextentofarupservices);
                    if (!dataChanged) {
                        dataChanged = changedValue
                    };
                    if (changedValue && !bidReviewHappened) {
                        formContext.getAttribute("ccrm_scopeofwork").setValue(ccrm_descriptionofextentofarupservices);
                        formContext.getAttribute("ccrm_scopeofwork").setSubmitMode("always");
                    }
                    formContext.getControl("ccrm_scopeofwork").setDisabled(true);
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
        ultimateClient_onChange: function(executionContext) {
            var formContext = executionContext.getFormContext();
            var showSection = formContext.getAttribute("ccrm_ultimateclient_yesno").getValue() == 0;
            this.showhideSection(formContext, "tab_Client", "tab_Client_section_3a", showSection);
            this.showhideSection(formContext, "tab_Client", "tab_Client_section_2a", showSection);
        },

        /*
         *********************************************************
         * Compare customerid to Opportunity
         * ultimate client id field
         *********************************************************
         */
        isUltimateClient: function(formContext) {
            //compare OpportunitySet?$select=ccrm_ultimateendclientid,CustomerId
            //get Opportunity id
            if (formContext.getAttribute("ccrm_opportunityid").getValue() == null) return;

            var opportunityId = formContext.getAttribute("ccrm_opportunityid").getValue()[0].id.replace("{", "")
                .replace("}", "");
            var result;
            var _ccrm_ultimateendclientid_value;
            var _customerid_value;
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: formContext.context.getClientUrl() +
                    "/api/data/v9.1/opportunities(" +
                    opportunityId +
                    ")?$select=_ccrm_ultimateendclientid_value,_customerid_value",
                beforeSend: function(XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                    XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                    XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                },
                async: false,
                success: function(data, textStatus, xhr) {
                    result = data;
                    _ccrm_ultimateendclientid_value = result["_ccrm_ultimateendclientid_value"];
                    _ccrm_ultimateendclientid_value_formatted =
                        result["_ccrm_ultimateendclientid_value@OData.Community.Display.V1.FormattedValue"];
                    _customerid_value = result["_customerid_value"];
                },
                error: function(xhr, textStatus, errorThrown) {
                    alertDialog(textStatus + " " + errorThrown);
                }
            });
            /*var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);*/
            if (result != null) {
                //populate review panel with the opportunity bid chair 
                if (_ccrm_ultimateendclientid_value != null) {
                    //compare ultimate client to client
                    return _customerid_value == _ccrm_ultimateendclientid_value;
                } else return false;
            }
        },

        /*
         *********************************************************
         * Retrieve power of attorney value from related
         * Opportunity
         *********************************************************
         */
        isPowerOfAttorney: function(formContext) {
            //compare OpportunitySet?$select=Ccrm_PowersofAttorney
            if (formContext.getAttribute("ccrm_opportunityid").getValue() == null) return false;
            var opportunityId = formContext.getAttribute("ccrm_opportunityid").getValue()[0].id.replace("{", "")
                .replace("}", "");
            var result;
            var ccrm_powersofattorney;
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: formContext.context.getClientUrl() +
                    "/api/data/v9.1/opportunities(" +
                    opportunityId +
                    ")?$select=ccrm_powersofattorney",
                beforeSend: function(XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                    XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                    XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                },
                async: false,
                success: function(data, textStatus, xhr) {
                    result = data;
                    ccrm_powersofattorney = result["ccrm_powersofattorney"];
                    var ccrm_powersofattorney_formatted =
                        result["ccrm_powersofattorney@OData.Community.Display.V1.FormattedValue"];
                },
                error: function(xhr, textStatus, errorThrown) {
                    alertDialog(textStatus + " " + errorThrown);
                }
            });
            /*var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);*/
            if (result == null) return false;
            return ccrm_powersofattorney;

        },
        /*
         *********************************************************
         * Toggle hidden question visibility
         *********************************************************
         */
        twoOptions_onChange: function(executionContext, fieldName, value) {
            var formContext = executionContext.getFormContext();
            var showSection;
            if (formContext.getAttribute(fieldName).getValue() == value) showSection = true;
            else showSection = false;
            switch (fieldName) {
            case "ccrm_clearbrief_yesno":
                this.showhideSection(formContext, "tab_SectionC", "tab_SectionC_1a", showSection);
                break;
            case "ccrm_sectiond_data_1_new":
                if (formContext.getAttribute(fieldName).getValue() == 100000001) { //no
                    this.showhideSection(formContext, "tab_SectionD", "tab_SectionD_1a", true);
                    this.showhideSection(formContext, "tab_SectionD", "tab_SectionD_1b", false);
                } else if (formContext.getAttribute(fieldName).getValue() == 100000000) { //yes
                    this.showhideSection(formContext, "tab_SectionD", "tab_SectionD_1b", true);
                    this.showhideSection(formContext, "tab_SectionD", "tab_SectionD_1a", false);
                } else {
                    this.showhideSection(formContext, "tab_SectionD", "tab_SectionD_1b", false);
                    this.showhideSection(formContext, "tab_SectionD", "tab_SectionD_1a", false);
                }
                break;
            case "ccrm_jvbidding_yesno":
                this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_2a", showSection);
                break;
            case "ccrm_sectione_data_5":
                this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_5a", false);
                this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_5b", false);
                this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_6", false);
                this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_6a", false);
                this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_7abc", false);
                this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_7a", false);
                switch (formContext.getAttribute("ccrm_sectione_data_5").getValue()) {
                case 100000006:
                case 100000007:
                case 100000008:
                    this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_5b", true);
                    break;
                case 100000009:
                case 100000010:
                    this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_6a", true);
                    break;
                case 100000003:
                    this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_5a", true);
                    break;
                case 100000004:
                    this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_6", true);
                    break;
                }
                break;
            case "ccrm_contractreviewed_yesno":
                this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_7abc", false);
                this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_7a", false);
                if (formContext.getAttribute(fieldName).getValue() == 1) { //Yes
                    this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_7abc", true);
                } else if (formContext.getAttribute(fieldName).getValue() == 0) {
                    this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_7a", true);
                }
                break;
            case "ccrm_liabilitylimit_yesno":
                if (formContext.getAttribute("ccrm_liabilitylimit_yesno").getValue() == 0) {
                    this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_13c", true);
                    this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_13ab", false);
                } else if (formContext.getAttribute("ccrm_liabilitylimit_yesno").getValue() == 1) {
                    this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_13c", false);
                    this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_13ab", true);
                } else {
                    this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_13c", false);
                    this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_13ab", false);
                }
                break;
            case "ccrm_sectione_data_13b":
                this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_13c", showSection);
                if (showSection == true)
                    formContext.getControl("ccrm_contract_data_9").setLabel("12c. Why would we accept this?");
                break;
            case "ccrm_bonds_guarantees_yesno":
                this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_15ab", showSection);
                break;
            case "ccrm_paytermsmonthly_yesno":
                this.showhideSection(formContext, "tab_SectionF", "tab_SectionF_2c", showSection);
                break;
            case "ccrm_resourceconsultants_yesno":
                this.showhideSection(formContext, "tab_SectionF", "tab_SectionF_8", showSection);
                break;
            case "ccrm_negativeforecast_yesno":
                this.showhideSection(formContext, "tab_SectionF", "tab_SectionF_11", showSection);
                break;
            case "ccrm_hourlyratesincluded_yesno":
                this.showhideSection(formContext, "tab_SectionF", "tab_SectionF_13a", false);
                this.showhideSection(formContext, "tab_SectionF", "tab_SectionF_13b", false);
                if (formContext.getAttribute(fieldName).getValue() == 1) { //Yes
                    this.showhideSection(formContext, "tab_SectionF", "tab_SectionF_13a", true);
                } else if (formContext.getAttribute(fieldName).getValue() == 0) {
                    this.showhideSection(formContext, "tab_SectionF", "tab_SectionF_13b", true);
                }
                break;
            case "ccrm_otherstaff_yesno":
                if (formContext.getAttribute("ccrm_subconsultantsresourced_yesno").getValue() == false) {
                    this.showhideSection(formContext, "tab_SectionG", "tab_SectionG_3b", showSection);
                }
                break;
            case "ccrm_subconsultantsresourced_yesno":
                this.showhideSection(formContext, "tab_SectionG", "tab_SectionG_3b", showSection);
                this.showhideSection(formContext, "tab_SectionG", "tab_SectionG_3c", showSection);
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
        loadRelationshipManager: function(formContext) {
            // Not clear where this is called from - so replace Xrm.Page with formContext, and see if any errors appear.
            // If not - this function is a candidate for removal.
            //retrieve the opportunity client
            if (formContext.getAttribute("ccrm_opportunityid").getValue() == null || bidReviewHappened) return;
            var opportunityId = formContext.getAttribute("ccrm_opportunityid").getValue()[0].id.replace("{", "")
                .replace("}", "");
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
                            formContext.getAttribute("ccrm_relationshipmanager").setValue(UserLookup);
                            formContext.getAttribute("ccrm_relationshipmanager").setSubmitMode("always");
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
        chkChargingBasis: function(formContext) {
            //retrieve the opportunity client
            if (formContext.getAttribute("ccrm_opportunityid").getValue() == null) return;
            var opportunityId = formContext.getAttribute("ccrm_opportunityid").getValue()[0].id.replace("{", "")
                .replace("}", "");
            var result;
            var ccrm_chargingbasis;
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: formContext.context.getClientUrl() +
                    "/api/data/v9.1/opportunities(" +
                    opportunityId +
                    ")?$select=ccrm_chargingbasis",
                beforeSend: function(XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                    XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                    XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                },
                async: false,
                success: function(data, textStatus, xhr) {
                    result = data;
                    ccrm_chargingbasis = result["ccrm_chargingbasis"];
                    var ccrm_chargingbasis_formatted =
                        result["ccrm_chargingbasis@OData.Community.Display.V1.FormattedValue"];
                },
                error: function(xhr, textStatus, errorThrown) {
                    alertDialog(textStatus + " " + errorThrown);
                }
            });
            /*var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);*/
            if (result != null) {
                var visible = ccrm_chargingbasis == 20;
                this.showhideSection(formContext, "tab_SectionF", "tab_SectionF_3b", visible);
            }
        },
        /*
         *********************************************************
         * Check related opportunity bonds required and performance
         * guarantee fields. If both checked set bonds guaranteed
         * to Yes
         *********************************************************
         */
        chkBonds_GuaranteeRequirement: function(formContext) {
            if (formContext.getAttribute("ccrm_opportunityid").getValue() == null || bidReviewHappened) return;
            var opportunityId = formContext.getAttribute("ccrm_opportunityid").getValue()[0].id.replace("{", "")
                .replace("}", "");
            var result;
            var ccrm_bondsrequired;
            var ccrm_performanceguarantees;
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: formContext.context.getClientUrl() +
                    "/api/data/v9.1/opportunities(" +
                    opportunityId +
                    ")?$select=ccrm_bondsrequired,ccrm_performanceguarantees",
                beforeSend: function(XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                    XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                    XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                },
                async: false,
                success: function(data, textStatus, xhr) {
                    result = data;
                    ccrm_bondsrequired = result["ccrm_bondsrequired"];
                    // var ccrm_bondsrequired_formatted = result["ccrm_bondsrequired@OData.Community.Display.V1.FormattedValue"];
                    ccrm_performanceguarantees = result["ccrm_performanceguarantees"];
                    //var ccrm_performanceguarantees_formatted = result["ccrm_performanceguarantees@OData.Community.Display.V1.FormattedValue"];
                },
                error: function(xhr, textStatus, errorThrown) {
                    alertDialog(textStatus + " " + errorThrown);
                }
            });
            /*var dataset = "OpportunitySet";
            var retrievereq = ConsultCrm.Sync.RetrieveRequest(opportunityId, dataset);*/
            if (result != null) {
                if (ccrm_bondsrequired == true && ccrm_performanceguarantees == true)
                    formContext.getAttribute("ccrm_bonds_guarantees_yesno").setValue(1);
                else formContext.getAttribute("ccrm_bonds_guarantees_yesno").setValue(0);
                formContext.getAttribute("ccrm_bonds_guarantees_yesno").setSubmitMode("always");
            }
        },
        /*
         *********************************************************
         * Section H - Tab expanded
         *********************************************************
         */
        //Function hides the H-Tab and sections based on values selected in Section A Options
        //Can be re-factored
        tab_SectionH_onLoad: function(executionContext) {
            var formContext = executionContext.getFormContext();
            var h1OptionObject = formContext.data.entity.attributes.get("ccrm_h1option_new");
            var h2OptionObject = formContext.data.entity.attributes.get("ccrm_h2option_new");
            var h1Option = null;
            var h2Option = null;
            if (h1OptionObject != null) {
                h1Option = h1OptionObject.getValue();
            }
            if (h2OptionObject != null) {
                h2Option = h2OptionObject.getValue();
            }
            if (h1Option == null || h1Option == 100000000) {
                h1Option = false;
            }
            if (h2Option == null || h2Option == 100000000) {
                h2Option = false;
            }

            formContext.ui.tabs.get("tab_SectionH").sections.get("tab_SectionH_h1").setVisible(h1Option);
            formContext.ui.tabs.get("tab_SectionH").sections.get("tab_SectionH_h2").setVisible(h2Option);

        },
        tab_SectionH_onstatechange: function(executionContext) {
            var formContext = executionContext.getFormContext();
            //handle field toggling when section H is expanded only 
            if (formContext.ui.tabs.get("tab_SectionH").getDisplayState() == "expanded") {

                this.fieldVisibility_onchange(executionContext, "ccrm_clientvisit_yesno", 1, "ccrm_sectionh_data_1a");
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_exchangeinoperation_yesno",
                    1,
                    "ccrm_h2_project_data_8");
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_designcertified_yesno",
                    1,
                    "ccrm_certificationscostcovered_yesno"); //ADM 
                this.fieldVisibility_onchange(executionContext, "ccrm_designcertified_yesno", 1, "ccrm_h5adetails");
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_subconsultantswork_yesno",
                    1,
                    "ccrm_sectionh2_data_2a"); //ADM 
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_legislativerequirements_yesno",
                    0,
                    "ccrm_h24details"); //ADM 
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_certificationscostcovered_yesno",
                    0,
                    "ccrm_h5adetails"); //ADM 
                HideFields(executionContext, "ccrm_sectionh2_data_4a", 100000003, 100000002, "ccrm_h4adetails");
                this.arup_sectioni_questioni2_1_onChange(executionContext);

                this.tab_SectionH_onLoad(executionContext);

            }
        },
        /*
         *********************************************************
         * Section C - Tab expanded
         *********************************************************
         */
        tab_SectionC_onstatechange: function(executionContext) {
            var formContext = executionContext.getFormContext();
            //handle field toggling when section E is expanded only 
            if (formContext.ui.tabs.get("tab_SectionC").getDisplayState() == "expanded") {

                this.ccrm_defineddeliverables_yesno_onChange(executionContext);
                this.ccrm_unusualreq_yesno_onChange(executionContext);
                ccrm_sectionc_data_7_onChange(executionContext);
                this.twoOptions_onChange(executionContext, "ccrm_clearbrief_yesno", 0);
                this.arup_sectiond_question9_onChange(executionContext);
                this.arup_sectiond_question10_onChange(executionContext);

            }
        },
        /*
         *********************************************************
         * Section D - Tab expanded
         *********************************************************
         */
        tab_SectionD_onstatechange: function(executionContext) {
            var formContext = executionContext.getFormContext();
            //handle field toggling when section E is expanded only 
            if (formContext.ui.tabs.get("tab_SectionD").getDisplayState() == "expanded") {

                this.twoOptions_onChange(executionContext, "ccrm_sectiond_data_1_new", 0);
                //this.twoOptions_onChange("ccrm_managementchanges_yesno", 1);
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_sectiond_data_5",
                    100000001,
                    "ccrm_schedule_data_5");
                this.fieldVisibility_onchange(executionContext, "ccrm_approvalreq_yesno", 1, "ccrm_h1_project_data_9");

            }

        },
        /*
         *********************************************************
         * Section G - Tab expanded
         *********************************************************
         */
        tab_SectionG_onstatechange: function(executionContext) {
            var formContext = executionContext.getFormContext();
            //handle field toggling when section E is expanded only 
            if (formContext.ui.tabs.get("tab_SectionG").getDisplayState() == "expanded") {

                //hide sections 3b and 3c 
                this.showhideSection(formContext, "tab_SectionG", "tab_SectionG_3b", false);
                this.showhideSection(formContext, "tab_SectionG", "tab_SectionG_3c", false);
                this.twoOptions_onChange(executionContext, "ccrm_otherstaff_yesno", 1);
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_resourcesavailable_yesno",
                    0,
                    "ccrm_sectiong_data_3a_comments");
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_hsneedsconsidered_yesno",
                    0,
                    "ccrm_technical_data_9");
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_projecthsneeds_yesno",
                    1,
                    "ccrm_technical_data_11");
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_sectiong_3bivoptionset",
                    0,
                    "ccrm_sectiong_3bivoptionsetdetails");
                this.resourcechecked_onchange(executionContext);
                ShowSections(executionContext,
                    "ccrm_resourceconsultants_yesno",
                    1,
                    "tab_SectionG",
                    "tab_SectionG_3b",
                    "tab_SectionG_3c"); //ADM
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_sectiong_3bi_optionset",
                    100000001,
                    "ccrm_sectiong_3bi_name");
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_sectiong_3bii_optionset",
                    100000001,
                    "ccrm_sectiong_3bii_name");
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_sectiong_3biii_optionset",
                    100000001,
                    "ccrm_sectiong_3biii_name");
                this.twoOptions_onChange(executionContext, "ccrm_subconsultantsresourced_yesno", 1);

            }
        },
        /*
         *********************************************************
         * Section E - Tab expanded
         *********************************************************
         */
        tab_SectionE_onstatechange: function(executionContext) {
            var formContext = executionContext.getFormContext();
            //handle field toggling when section E is expanded only 
            if (formContext.ui.tabs.get("tab_SectionE").getDisplayState() == "expanded") {

                //check if bonds or guarantees are required 
                this.chkBonds_GuaranteeRequirement(formContext);
                //setup OTHER field if type of bond required == 'OTHER'
                setup_display_other_field(executionContext,
                    "arup_bondstype",
                    "ccrm_sectione_data15a_other",
                    "100000004");
                //check if we are bidding as part of JV 
                this.twoOptions_onChange(executionContext, "ccrm_sectione_data_5", 0);
                this.twoOptions_onChange(executionContext, "ccrm_contractreviewed_yesno", 0);
                this.twoOptions_onChange(executionContext, "ccrm_liabilitylimit_yesno", 1);
                this.twoOptions_onChange(executionContext, "ccrm_sectione_data_13b", 100000003);
                setTimeout(function() {
                        ARUP.ccrm_bidreview.twoOptions_onChange(executionContext, "ccrm_bonds_guarantees_yesno", 1)
                    },
                    2000);
                //show/hide Section E question 3
                var showSection = false;
                if (this.isPowerOfAttorney(formContext)) showSection = true;
                this.showhideSection(formContext, "tab_SectionE", "tab_SectionE_3a", showSection);
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_onerousrequirements_yesno",
                    1,
                    "ccrm_contract_data_4a");
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_sectione_data_16",
                    100000005,
                    "ccrm_sectione_data16_other");
                this.fieldVisibility_onchange(executionContext,
                    "arup_bondstype",
                    100000004,
                    "ccrm_sectione_data15a_other");

            }
        },
        /*
         *********************************************************
         * Section B - Tab expanded
         *********************************************************
         */
        tab_SectionB_onstatechange: function(executionContext) {
            //console.log("Executing Function");
            var formContext = executionContext.getFormContext();
            if (formContext.ui.tabs.get("tab_Client").getDisplayState() == "expanded") {

                if (formContext.ui.getFormType() != 1) {

                    if (formContext.getAttribute("ccrm_ultimateclient_yesno").getValue() != null &&
                        !bidReviewHappened) {
                        if (this.isUltimateClient(formContext) == true)
                            formContext.getAttribute("ccrm_ultimateclient_yesno").setValue(1);
                        else formContext.getAttribute("ccrm_ultimateclient_yesno").setValue(0);
                        formContext.getAttribute("ccrm_ultimateclient_yesno").setSubmitMode("always");
                    }

                    this.ultimateClient_onChange(executionContext);
                    //this.relationshipManager_onChange();
                    this.fieldVisibility_onchange(executionContext,
                        "ccrm_client_data_5_new",
                        100000000,
                        "ccrm_client_data_5a_new");
                    this.WebResource_sectionB_question8_onChange(executionContext);
                    this.fieldVisibility_onchange(executionContext,
                        "ccrm_client_payment_performance",
                        100000001,
                        "ccrm_client_data_3");
                    this.securedFunding_onChange(executionContext);

                }
            }
        },
        /*
         *********************************************************
         * Section F - Tab expanded
         *********************************************************
         */
        tab_SectionF_onstatechange: function(executionContext) {
            var formContext = executionContext.getFormContext();
            //console.log("Executing Function");
            if (formContext.ui.tabs.get("tab_SectionF").getDisplayState() == "expanded") {
                //check charging basis 
                this.chkChargingBasis(formContext);
                this.twoOptions_onChange(executionContext, "ccrm_resourceconsultants_yesno", 1);
                this.twoOptions_onChange(executionContext, "ccrm_negativeforecast_yesno", 1);
                this.twoOptions_onChange(executionContext, "ccrm_hourlyratesincluded_yesno", 0);
                this.fieldVisibility_onchange(executionContext, "arup_sectiongquestion1a", 1, "arup_sectiongq1b");
                this.fieldVisibility_onchange(executionContext, "arup_sectio0ngq1c", 1, "arup_sectiongq1d");
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_competitivebidtype",
                    100000002,
                    "ccrm_sectionf_data_1a_multi");
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_bidassessmentbasis",
                    100000003,
                    "ccrm_sectionf_data_1b_multi");
                this.fieldVisibility_onchange(executionContext, "ccrm_sectionf_data_2c", 100000004, "ccrm_fees_data_5");
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_conditionalpayments_yesno",
                    1,
                    "ccrm_fees_data_19");
                this.fieldVisibility_onchange(executionContext, "ccrm_netfees_yesno", 0, "ccrm_sectionf_data_4_multi");
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_sectionf_data_5f_yesno",
                    1,
                    "ccrm_sectionf_data_5f_details"); //ADM
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_similarpayterms_yesno",
                    0,
                    "ccrm_sectionf_data8d_multi");
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_quotesreceived_yesno",
                    0,
                    "ccrm_sectionf_data8b_multi");
                this.fieldVisibility_onchange(executionContext, "ccrm_chargingbasis", 20, "ccrm_sectionf_data_3b");
                setup_display_other_field(executionContext, "arup_keyindicators", "ccrm_h1project_data_4", "100000005");
                this.duediligence_onchange(executionContext);
                this.twoOptions_onChange(executionContext, "ccrm_paytermsmonthly_yesno", 0);
                //check whether fees and costs are in different currencies 
                this.chkFeesandCostCurrency(executionContext);
                this.chkKeyIndicators(formContext);
            }
        },
        //FUNCTION LIST --------------------------------------------------------------------------------------------------
        //
        chargingbasis_onchange: function(formContext) {
            // This function may no longer be used. 
            // Candidate for removal.
            if (formContext.getAttribute("ccrm_chargingbasis").getValue() == 20) {
                formContext.getControl("ccrm_sectionf_data_3b").setVisible(true);
            } else {
                formContext.getControl("ccrm_sectionf_data_3b").setVisible(false);
            }
        },

        ccrm_defineddeliverables_yesno_onChange: function(executionContext) {

            this.fieldVisibility_onchange(executionContext,
                "ccrm_defineddeliverables_yesno",
                0,
                "ccrm_technical_data_5");

        },

        arup_sectioni_questioni2_1_onChange: function(executionContext) {
            var formContext = executionContext.getFormContext();
            var visible = formContext.getAttribute("arup_sectioni_questioni2_1").getValue() == 1;

            formContext.getControl("WebResource_sectionH2_question1").setVisible(visible);
            formContext.getControl("ccrm_sectionh2_data_1a").setVisible(visible);
            formContext.getControl("ccrm_sectionh2_data_1b").setVisible(visible);

        },

        //ccrm_sectionc_data_7_onChange: function () {

        //    console.log('1');

        //    HideFields("ccrm_sectionc_data_7", 100000001, 100000003, "ccrm_technical_data_8");

        //},

        ccrm_unusualreq_yesno_onChange: function(executionContext) {

            this.fieldVisibility_onchange(executionContext, "ccrm_unusualreq_yesno", 1, "ccrm_technical_data_4");

        },

        WebResource_sectionB_question8_onChange: function(executionContext) {

            this.fieldVisibility_onchange(executionContext, "ccrm_sectionb_data_8", 100000000, "ccrm_client_data_5");

        },

        resourcechecked_onchange: function(executionContext) {
            //console.log("Executing Function");
            var formContext = executionContext.getFormContext();

            //this.fieldVisibility_onchange("ccrm_resourceschecked_yesno", 1, "ccrm_h1project_data_2");

            if (formContext.getAttribute("ccrm_resourceschecked_yesno").getValue() == 0) {
                formContext.getControl("ccrm_h1project_data_2").setVisible(true);
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_resourceschecked_yesno",
                    0,
                    "ccrm_h1project_data_2");
                formContext.getControl("ccrm_h1project_data_2").setLabel("4a. Please provide details");
            } else if (formContext.getAttribute("ccrm_resourceschecked_yesno").getValue() == 1) {
                formContext.getControl("ccrm_h1project_data_2").setVisible(true);
                this.fieldVisibility_onchange(executionContext,
                    "ccrm_resourceschecked_yesno",
                    1,
                    "ccrm_h1project_data_2");
                formContext.getControl("ccrm_h1project_data_2").setLabel("4a. By whom?");
            } else formContext.getControl("ccrm_h1project_data_2").setVisible(false);
        },
        duediligence_onchange: function(executionContext) {
            //console.log("Executing Function");
            var formContext = executionContext.getFormContext();
            if (formContext.getAttribute("ccrm_duediligence_yesno").getValue() == 0) {
                this.fieldVisibility_onchange("ccrm_duediligence_yesno", 0, "ccrm_h1_project_data_7");
                formContext.getControl("ccrm_h1_project_data_7").setLabel("12a.i Please provide details");
            } else if (formContext.getAttribute("ccrm_duediligence_yesno").getValue() == 1) {
                this.fieldVisibility_onchange("ccrm_duediligence_yesno", 1, "ccrm_h1_project_data_7");
                formContext.getControl("ccrm_h1_project_data_7")
                    .setLabel("12a.i Did the due diligence raise any issues?");
            } else formContext.getControl("ccrm_h1_project_data_7").setVisible(false);
        },

        securedFunding_onChange: function(executionContext) {
            var formContext = executionContext.getFormContext();
            if (formContext.getAttribute("ccrm_client_data_6_new") == null ||
                formContext.getAttribute("ccrm_client_data_6a_new") == null) {
                return;
            }

            var securedValue = formContext.getAttribute("ccrm_client_data_6_new").getValue();
            var visible = securedValue == 100000002 || securedValue == 100000001;
            formContext.getControl("ccrm_client_data_6a_new").setVisible(visible);

        },

        fieldVisibility_onchange: function(executionContext, sourceField, sourceFieldValue, targetField) {
            //console.log("Executing Function");
            var formContext = executionContext.getFormContext();
            if (formContext.getAttribute(sourceField) == null || formContext.getAttribute(targetField) == null) {
                return;
            }

            var visible = formContext.getAttribute(sourceField).getValue() == sourceFieldValue;
            formContext.getControl(targetField).setVisible(visible);

        },
        fieldVisibility_onchange_inv: function(executionContext, sourceField, sourceFieldValue, targetField) {
            //console.log("Executing Function");
            var formContext = executionContext.getFormContext();
            if (formContext.getAttribute(sourceField).getValue() == sourceFieldValue ||
                formContext.getAttribute(sourceField).getValue() == null)
                formContext.getControl(targetField).setVisible(false);
            else formContext.getControl(targetField).setVisible(true);
        },
        chkFeesandCostCurrency: function(executionContext) {
            //console.log("Executing Function");
            var formContext = executionContext.getFormContext();
            this.showhideSection(formContext, "tab_SectionF", "tab_SectionF_5", true);
            if (formContext.getAttribute("ccrm_feepaymentcurrency").getValue() != null &&
                formContext.getAttribute("ccrm_costcurrency").getValue() != null) {
                if (formContext.getAttribute("ccrm_feepaymentcurrency").getValue()[0].id ==
                    formContext.getAttribute("ccrm_costcurrency").getValue()[0].id)
                    this.showhideSection(formContext, "tab_SectionF", "tab_SectionF_5", false);
            }
            if (formContext.getAttribute("ccrm_feepaymentcurrency").getValue() == null &&
                formContext.getAttribute("ccrm_costcurrency").getValue() == null)
                this.showhideSection(formContext, "tab_SectionF", "tab_SectionF_5", false);
        },
        arup_sectiond_question9_onChange: function(executionContext) {
            var formContext = executionContext.getFormContext();
            this.showhideSection(formContext,
                "tab_SectionC",
                "tabD_section9",
                formContext.getAttribute("arup_sectiond_question9").getValue() == '0');

        },
        arup_sectiond_question10_onChange: function(executionContext) {
            var formContext = executionContext.getFormContext();
            this.showhideSection(formContext,
                "tab_SectionC",
                "tabD_Section10a",
                formContext.getAttribute("arup_sectiond_question10").getValue() == '0');

        },
        chkKeyIndicators: function(formContext) {
            //console.log("Executing Function");
            var strKeyIndicators = formContext.getAttribute("arup_keyindicators").getValue();
            if (strKeyIndicators == null) formContext.getControl("ccrm_h1project_data_4").setVisible(false);
            else {
                var n = strKeyIndicators.indexOf("100000005");
                if (n >= 0) formContext.getControl("ccrm_h1project_data_4").setVisible(true);
                else formContext.getControl("ccrm_h1project_data_4").setVisible(false);
            }
        },
        /*
         *********************************************************
         * Called from the Ribbon button - displays Bid
         * review report
         *********************************************************
         */
        openBidReviewReport: function(formContext) {
            var rdlName = "Bid%20Review.rdl";
            var reportGuid = ARUP.ccrm_bidreview.getReportId(formContext, "Bid Review");
            if (reportGuid != null) {
                var entityType = "10075"
                var entityGuid = formContext.data.entity.getId();
                var entityGuid = formContext.data.entity.getId();
                var url = formContext.context.getClientUrl() +
                    "/crmreports/viewer/viewer.aspx?action=run&context=records&helpID=" +
                    rdlName +
                    "&id={" +
                    reportGuid +
                    "}&records=" +
                    entityGuid +
                    "&recordstype=" +
                    entityType +
                    "&p:CRM_bidreviewid=" +
                    entityGuid;
                window.open(url, "Bid Review Report", "toolbar=0,menubar=0,resizable=1");
            }
        },
        /*
         *********************************************************
         * Returns the report id given the Name
         *********************************************************
         */
        getReportId: function(formContext, reportName) {
            /*console.log("Executing Function");
            //ReportSet?$select=ReportId&$filter=Name eq 'Bid Review'        
            var dataset = "ReportSet";
            var filter = "Name eq '" + reportName + "'";
            var retrievemult = ConsultCrm.Sync.RetrieveMultipleRequest(dataset, filter);*/
            var results;
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: formContext.context.getClientUrl() +
                    "/api/data/v9.1/reports?fetchXml=%3Cfetch%3E%3Centity%20name%3D%22report%22%3E%3Cattribute%20name%3D%22reportid%22%2F%3E%3Cfilter%3E%3Ccondition%20attribute%3D%22name%22%20operator%3D%22eq%22%20value%3D%22bid%20review%22%2F%3E%3C%2Ffilter%3E%3C%2Fentity%3E%3C%2Ffetch%3E",
                beforeSend: function(XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                    XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                    XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                },
                async: false,
                success: function(data, textStatus, xhr) {
                    results = data.value;
                },
                error: function(xhr, textStatus, errorThrown) {
                    alertDialog(textStatus + " " + errorThrown);
                }
            });
            if (results != null && results.length > 0) {
                var retrievedreq = results[0];
                return retrievedreq.reportid
            } else return null;
        },

        /*
         *********************************************************
         * Validate two date fields and if invalid
         * show error and blank field
         *********************************************************
         */
    }
//New Functions added: Charmain as discussed, you have a lot of annonymous functions here, but because they are being re-used multiple times, it didn't make sense so I added this one.

    function ccrm_sectionc_data_7_onChange(executionContext) {

        HideFields(executionContext, "ccrm_sectionc_data_7", 100000001, 100000003, "ccrm_technical_data_8");

    }

    function setup_display_other_field(executionContext,
        otherFieldVal,
        otherFieldDetail,
        otherCodeValue,
        isToBeHidden) {
        /// <summary>Setup multi-select picklist so that when "other" is selected, a text field is activated to allow the user to enter the details.</summary>
        var formContext = executionContext.getFormContext();
        var isOtherFieldRequired = otherCodeValue;
        if (typeof (otherCodeValue) != "function") {
            isOtherFieldRequired = function(v) {
                return typeof (v) == "string" && v.search(otherCodeValue) > -1 || v == otherCodeValue
            };
        }
        isToBeHidden = isToBeHidden == null ? true : isToBeHidden;
        var attribute = formContext.getAttribute(otherFieldVal);
        if (!!attribute) {
            attribute.addOnChange(function() {
                display_other_field(formContext, otherFieldVal, otherFieldDetail, isOtherFieldRequired, isToBeHidden);
            });
            // Do this twice as header fields get their requirement level set after the onload function runs.
            display_other_field(formContext, otherFieldVal, otherFieldDetail, isOtherFieldRequired, isToBeHidden);
            setTimeout(function() {
                    display_other_field(formContext,
                        otherFieldVal,
                        otherFieldDetail,
                        isOtherFieldRequired,
                        isToBeHidden);
                },
                1000);
        }
    }

    function display_other_field(formContext, otherFieldVal, otherFieldDetail, isOtherFieldRequired, isToBeHidden) {
        var value = formContext.getAttribute(otherFieldVal).getValue();
        var otherNetworkDetails = formContext.getControl(otherFieldDetail);

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

    function HideFields(executionContext, sourcefield, valueA, valueB, targetField) {
        var formContext = executionContext.getFormContext();
        var currentAttribute = formContext.data.entity.attributes.get(sourcefield).getValue();
        if (currentAttribute !== null) {
            if ((currentAttribute == valueA) || (currentAttribute == valueB)) {
                formContext.ui.controls.get(targetField).setVisible(false);
            } else {
                formContext.ui.controls.get(targetField).setVisible(true);
            }
        }
    }
//Hide 2 SECTIONS

    function ShowSections(executionContext, sourcefield, valueA, tab_Section, sectionA, sectionB) {
        var formContext = executionContext.getFormContext();
        var currentAttribute = formContext.data.entity.attributes.get(sourcefield).getValue();
        if (currentAttribute != null) {
            if (currentAttribute == valueA) {
                //Show Section
                formContext.ui.tabs.get(tab_Section).sections.get(sectionA).setVisible(true);
                formContext.ui.tabs.get(tab_Section).sections.get(sectionB).setVisible(true);
            } else {
                formContext.ui.tabs.get(tab_Section).sections.get(sectionA).setVisible(false);
                formContext.ui.tabs.get(tab_Section).sections.get(sectionB).setVisible(false);
            }
        }
    }

    function disableFormFields(executionContext) {
        var formContext = executionContext.getFormContext();
        if (formContext.getAttribute("ccrm_opportunityid").getValue() == null) return false;

        var opportunityId = formContext.getAttribute("ccrm_opportunityid").getValue()[0].id;
        // var bidReviewApproved = false;

        var promise = Xrm.WebApi.retrieveRecord("opportunity", opportunityId, "?$select=ccrm_bidreviewoutcome")
            .then((result) => {
                var bidReviewApproved = result.ccrm_bidreviewoutcome; 
                return bidReviewApproved === 100000003 || bidReviewApproved === 100000002;
            });
        //SDK.REST.retrieveRecord(opportunityId, "Opportunity", 'ccrm_BidReviewOutcome', null, function (retrievedreq) {
        //    bidReviewApproved = retrievedreq.ccrm_BidReviewOutcome.Value;
        //}, errorHandler, false);

        //see if either approved or rejected
//    return bidReviewApproved == 100000003 || bidReviewApproved == 100000002;
        return promise;
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

//There is a bug with Q6, investigate further

    function QuestionE6(executionContext) {
        var formContext = executionContet.getFormContext();
        var modelType = formContext.data.entity.attributes.get("ccrm_sectione_data_5").getValue();
        if (modelType !== null) {
            if ((modelType == '100000009') || (modelType == '100000010')) {
                formContext.ui.controls.get("ccrm_tcattached_yesno").setVisible(false);
            } else {
                formContext.ui.controls.get("ccrm_tcattached_yesno").setVisible(true);
            }
        }
    }

    function valueChanged(fieldName, originalValue, changedValue) {

        if ((originalValue == null && changedValue != null) ||
            (originalValue != null && changedValue == null)) return true;
        else if (originalValue == null && changedValue == null) return false;
        else {
            return originalValue.toString().replace('}', '').replace('{', '').toUpperCase() !=
                changedValue.toString().replace('}', '').replace('{', '').toUpperCase();
        }

    }

    function multiselectfields_onchange(executioncontext, fieldname, fieldothername, othervalue, targetfield) {
        var formcontext = executioncontext.getFormContext();
        var fieldvalue = formcontext.getAttribute(fieldname).getText();
        if (fieldvalue.length > 0) {
            var targetvalue = "";
            for (val of fieldvalue) {
                if (targetvalue == "") {
                    targetvalue = val;
                } else {
                    targetvalue = targetvalue + ", " + val;
                }
            }
            if (fieldvalue.indexOf(othervalue) == -1) {
                formcontext.getAttribute(targetfield).setValue(targetvalue);
            } else {
                var fieldothervalue = formcontext.getAttribute(fieldothername).getValue();
                formcontext.getAttribute(targetfield).setValue(targetvalue + ", " + fieldothervalue);
            }
        }
    }

    function exitForm(primaryControl) {
        ArupExit.exitForm(primaryControl, "ccrm_bidreview");
    }

    function alertDialog(message) {
        var alertStrings = { confirmButtonLabel: "OK", text: message, title: "Alert" };
        var alertOptions = { height: 120, width: 260 };
        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
    }

    //object.exitForm = exitForm;
    //object.QuestionE6 = QuestionE6;
    //object.errorHandler = errorHandler;

    object.setup_display_other_field = setup_display_other_field;
    object.multiselectfields_onchange = multiselectfields_onchange;
    object.HideFields = HideFields;
    return object;
}();
