var SelectedEventsWithFreq = [];
var selected = [];
var checkedRows = [];
var Orgs_selected = [];
var Region_Selected = [];
var AGC_Selected = [];
var selectedRows = [];
var resultJSONRTRM = new Object();
var resultJSONBPMD = new Object();
var resultJSONAGC = new Object();
var dBSelected = [];
var leadsourceOptions = "";
//var proctypeOptions = "";
var proctype = $("#contractarrangement");
var onceload = true;

$.fn.wizard = function (config) {
    if (!config) {
        config = {};
    };
    var containerSelector = config.containerSelector || ".wizard-content";
    var stepSelector = config.stepSelector || ".wizard-step";
    var steps = $(this).find(containerSelector + " " + stepSelector);
    var stepCount = steps.length;
    var exitText = config.exit || 'Exit';
    var backText = config.back || 'Back';
    var nextText = config.next || 'Next';
    var finishText = config.finish || 'Finish';
    var confirmText = config._confirm || 'Confirm';
    var cancelText = config._cancel || 'Cancel';
    var isModal = config.isModal || true;

    var validateNext = config.validateNext || function () {
        if (step == 1) // Move to selection?
        {
            var errors = ArupPageHasErrors("page1");
            if (errors) {
                ArupValidationErrorDialog(errors);
            }
            return !errors;
        }

        else {

            //Step 2 - display of the selected fields.
            if (step == 2) {
                var errors = ArupPageHasErrors("page2");
                if (errors) {
                    ArupValidationErrorDialog(errors);
                }
                return !errors;

                selected = [];
                $('#SS select').each(function (i,s) {
                    if ($(this).val() != "") {
                        selected.push($(this).val());
                        setError(s, false);
                    } else {
                        setError(s);
                    }
                });

                if (selected.length < 1) {

                    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                        '<font size="3" color="#000000"></br>Please select Opportunity Type and/or Lead source.</font>',
                        [
                            {
                                label: "<b>OK</b>",
                                callback: function () {

                                },
                                setFocus: true,
                                preventClose: false
                            }
                        ],
                        'Warning',
                        600,
                        250,
                        '',
                        true);
                    return false;
                }

                // Check that related opportunity is set for Project extension.
                var opportunityType = $("#opportunityType").val();
                var relatedParentOppId = $("#opportunities option[value='" + $('#relatedopportunity').val() + "']").attr("data-value");

                if (opportunityType == "770000001" && relatedParentOppId == null) {
                    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                        '<font size="3" color="#000000"></br>For this opportunity type a related parent opportunity must be given.</font>',
                        [
                            {
                                label: "<b>OK</b>",
                                callback: function () {

                                },
                                setFocus: true,
                                preventClose: false
                            }
                        ],
                        'Warning',
                        600,
                        250,
                        '',
                        true);
                    return false;
                }
                if (hasError( "#opportunities")) {
                    return false;
                }
                return true;
            }
            if (step == 3) {
                var errors = ArupPageHasErrors("page3");
                if (errors) {
                    ArupValidationErrorDialog(errors);
                }
                return !errors;

                selected = [];
                $('#CN select').each(function () {
                    if ($(this).val() != "") {
                        selected.push($(this).val());
                    }
                });
                if (selected.length < 1) {

                    Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                        '<font size="3" color="#000000"></br>Please select Project Procurement Type.</font>',
                        [
                            {
                                label: "<b>OK</b>",
                                callback: function () {

                                },
                                setFocus: true,
                                preventClose: false
                            }
                        ],
                        'Warning',
                        600,
                        250,
                        '',
                        true);
                    return false;
                }
                var clients = $("#client")[0];
                checkSelected(clients);
                var endClients = $("#endclient")[0];
                var opportunityType = $("#opportunityType").val();
                if (opportunityType == "770000005") {
                    checkSelected(endClients);
                }
                if (hasError("#clients")) {
                    return false;
                }
                if (hasError("#endclients")) {
                    return false;
                }
                return true;
            }
        }
        return false;
    };
    var validateFinish = config.validateFinish || function () { return true; };

    var contBack = function () {
        var newName4 = "";
        switch (step) {
            case 1: newName4 = "Opportunity <br/>Category"; break;
            case 2: newName4 = "Opportunity <br/>Basic Details"; break;
            case 3: newName4 = "Opportunity <br/>Further Details"; break;
            case 4: newName4 = "<br/>Remaining Details"; break;
        }
        $(container).find(".wizard-steps-panel .step-" + step).toggleClass("doing");//.append('<div><h3>'+newName4+'</h3></div>');
        step--;
        steps.hide();
        $(steps[step - 1]).show();
        if (step == 2) // Back from confirmation page, clear the table, clear the freq selections
        {
            SelectedEventsWithFreq = [];
            checkedRows = [];
            Orgs_selected = [];
            Region_Selected = [];
            AGC_Selected = [];
            dBSelected = [];

//            $("#leadSource1").hide();
        }

        var newName5 = "";
        switch (step) {
            case 1: newName5 = "Opportunity <br/>Category"; break;
            case 2: newName5 = "Opportunity <br/>Basic Details"; break;
            case 3: newName5 = "Opportunity <br/>Further Details"; break;
            case 4: newName5 = "<br/>Remaining Details"; break;
        }
        $(container).find(".wizard-steps-panel .step-" + step).toggleClass("doing").toggleClass("done");//.remove('<div><h3>'+newName5+'</h3></div>');
        if (step == 1) {
            btnBack.hide();
            btnExit.show();
        }

        if (step == 3) {
            btnConfirm.show();
            btnCancel.show();
            btnNext.hide();
        }
        else { btnConfirm.hide(); btnCancel.hide(); }

        btnFinish.hide();
        btnNext.show();

    };
    //////////////////////
    var step = 1;
    var container = $(this).find(containerSelector);
    steps.hide();
    $(steps[0]).show();
    if (isModal) {
        $(this).on('hidden.bs.modal', function () {
            step = 1;
            $($(containerSelector + " .wizard-steps-panel .step-number")
                .removeClass("done")
                .removeClass("doing")[0])
                .toggleClass("doing");

            $($(containerSelector + " .wizard-step")
                .hide()[0])
                .show();

            btnBack.hide();
            btnExit.show();
            btnFinish.hide();
            btnNext.show();
            btnConfirm.hide();

        });
    };
    $(this).find(".wizard-steps-panel").remove();
    container.prepend('<div class="wizard-steps-panel steps-quantity-' + stepCount + '"></div>');
    var stepsPanel = $(this).find(".wizard-steps-panel");

    for (s = 1; s <= stepCount; s++) {
        var _nam = "";
        var _col = "";
        switch (s) {
            case 1: _nam = "Opportunity <br/>Category"; _col = "#B2D135"; break;
            case 2: _nam = "Opportunity <br/> Basic Details"; _col = "#56BDEA"; break;
            case 3: _nam = "Opportunity <br/> Further Details"; _col = "#FC5781"; break;
            case 4: _nam = "<br>Remaining Details"; _col = "#FFCD31"; break;
        }

        stepsPanel.append('<div class="step-number step-' + s + '"><div class="number" id="num' + s + '"><img src = arup_' + s + ' alt="MI" title="' + _nam + '"></div><h5><b><font color=' + _col + '>' + _nam + '</font></b></h5></div>');
        //stepsPanel.append('');<div id="NN"><h3>'+_nam+'</h3></div>
    }
    var newName = "";
    switch (step) {
        case 1: newName = "Opportunity <br/>Category"; break;
        case 2: newName = "Opportunity <br/>Basic Details"; break;
        case 3: newName = "Opportunity <br/>Further Details"; break;
        case 4: newName = "<br/>Remaining Details"; break;
    }

    $(this).find(".wizard-steps-panel .step-" + step).toggleClass("doing");//.append('<div><h3>'+newName+'</h3></div>');
    //////////////////////
    var contentForModal = "";
    if (isModal) {
        contentForModal = ' data-dismiss="modal"';
    }
    var btns = "";
    btns += '<button type="button" class="btn btn-default wizard-button-exit pull-left"' + contentForModal + ' >' + exitText + '</button>';
    btns += '<button type="button" class="btn btn-default wizard-button-back  pull-left">' + backText + '</button>';
    btns += '<button type="button" class="btn btn-default wizard-button-next pull-right">' + nextText + '</button>';
    btns += '<button type="button" class="btn btn-primary wizard-button-finish pull-right" ' + contentForModal + ' >' + finishText + '</button>';
    btns += '<button type="button" class="btn btn-primary wizard-button-confirm pull-right" ' + contentForModal + ' >' + confirmText + '</button>';
    btns += '<button type="button" class="btn btn-default wizard-button-cancel">' + cancelText + '</button>';
    $(this).find(".wizard-buttons").html("");
    $(this).find(".wizard-buttons").append(btns);
    var btnExit = $(this).find(".wizard-button-exit");
    var btnBack = $(this).find(".wizard-button-back");
    var btnFinish = $(this).find(".wizard-button-finish");
    var btnNext = $(this).find(".wizard-button-next");
    var btnConfirm = $(this).find(".wizard-button-confirm");
    var btnCancel = $(this).find(".wizard-button-cancel");

    //$(".wizard-steps-panel .step-number .number").eq(0).css({ "background-color": "#B2D135", "border": "4px solid #B2D135" });

    btnNext.on("click", function () {
        if (!validateNext(step, steps[step - 1])) {
            return;
        };

        var newName2 = "";
        switch (step) {
            case 1: newName2 = "Opportunity <br/>Category"; break;
            case 2: newName2 = "Opportunity <br/>Basic Details"; break;
            case 3: newName2 = "Opportunity<br/>Further Details"; break;
            case 4: newName2 = "<br/>Remaining Details"; break;
        }
        $(container).find(".wizard-steps-panel .step-" + step).toggleClass("doing").toggleClass("done");//.append('<div><h3>'+newName2+'</h3></div>');
        step++;
        steps.hide();
        $(steps[step - 1]).show();
        var newName3 = "";
        switch (step) {
            case 1: newName3 = "Opportunity<br/>Category"; break;
            case 2: newName3 = "Opportunity <br/>Basic Details"; break;
            case 3: newName3 = "Opportunity <br/>Further Details"; break;
            case 4: newName3 = "<br/>Remaining Details"; break;
        }

        $(container).find(".wizard-steps-panel .step-" + step).toggleClass("doing");//.append('<div id="NN"><h3>'+newName3+'</h3></div>');
        if (step == stepCount) {
            btnFinish.show();
            btnNext.hide();
            btnBack.hide();
        }

        if (step == 2) {
            leadsourceOptions = $("#leadSource").html();
        }


        if (step == 3) {
            var opptype = $("#opportunityType").val();

            switch (opptype) {
                case "770000000":
                    addAllOptions("procType");
                    proctype.css("pointer-events", "auto");
                    break;
                case "770000001":
                    addAllOptions("procType");
                    proctype.val("--");
                    proctype.css("pointer-events", "none");
                    break;
                case "770000002":
                    addAllOptions("procType");
                    proctype.css("pointer-events", "auto");
                    break;
                case "770000003":
                    addAllOptions("procType");
                    proctype.val("2");
                    proctype.css("pointer-events", "none");
                    break;
                case "770000004":
                    addAllOptions("procType");
                    removeOptions(["100000001", "100000003", "2", "8", "6"], "procType");
                    proctype.css("pointer-events", "auto");
                    break;
                case "770000005":
                    addAllOptions("procType");
                    proctype.val("5");
                    proctype.css("pointer-events", "none");
                    break;
                case "770000006":
                    addAllOptions("procType");
                    removeOptions(["100000001","100000003", "2"], "procType");
                    proctype.css("pointer-events", "auto");
                    break;
            }
        }

        switch (step) {
            case 2: $("#opportunityType").focus(); break;
            case 3: $("#contractarrangement").focus(); ; break;
            case 4: $("#project_name").focus(); ; break;
        }


        if (step == 4) {
            //btnConfirm.show();
            btnCancel.show();
            btnNext.hide();
        }
        else {
            btnConfirm.hide();
            btnCancel.hide();
        }
        btnExit.hide();
        btnBack.show();
        $('.multiselect-item .caret-container').click();
    });

    btnExit.on("click", function () { window.close(); });

    btnCancel.on("click", function () { window.close(); });

    btnBack.on("click", function () {
        if (step == 2) {
            //resultJSON = new Object();
            SelectedEventsWithFreq = [];
            checkedRows = [];
            dBSelected = [];
            //alert(step);

            contBack();
        }
        //Back from Opportunity Further Details..  Destroy the page before leaving.
        if (step == 3) {
            Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                '<font size="3" color="#000000"></br>The previously selected events and the relevant data will be lost.</br>Do you want to continue?</font>',
                [
                    {
                        label: "<b>Cancel</b>",
                        callback: function () {
                            return;
                        },
                        setFocus: true,
                        preventClose: false
                    },
                    {
                        label: "<b>OK - Go Back</b>",
                        callback: function () {
                            $("#ConNotiTab").bootstrapTable('destroy');
                            selectedRows = [];
                            contBack();
                        },
                        setFocus: false,
                        preventClose: false
                    }
                ],
                'Warning',
                600,
                250,
                '',
                true);
        }
        if (step == 4) {
            contBack();
            btnConfirm.hide();
            btnCancel.hide();
        }
    });

    btnFinish.on("click", function () {
        if (!validateFinish(step, steps[step - 1])) {
            return;
        };
        if (!!config.onfinish) {
            config.onfinish();
        }
    });

    btnConfirm.on("click", function () {
        //Call the CRM action...
        displayWaiting();
        callAction(container, steps, step);
        $(container).find(".wizard-steps-panel .step-" + step).toggleClass("doing").toggleClass("done");
        step++;
        steps.hide();
        $(steps[step - 1]).show();
        $(container).find(".wizard-steps-panel .step-" + step).toggleClass("doing");//.append('<div id="NN"><h3>'+newName3+'</h3></div>');

        if (step == stepCount) {
            btnFinish.show();
            btnNext.hide();
            btnBack.hide();
        }
        if (step == 3) {
            btnConfirm.show();
            btnCancel.show();
            btnNext.hide();
        }
        else { btnConfirm.hide(); btnCancel.hide(); }
        btnExit.hide();
        $(".wizard-step").hide();
        $(".wizard-buttons").hide();

    });

    btnBack.hide();
    btnFinish.hide();
    btnConfirm.hide();
    btnCancel.hide();
    return this;

};


function freqChange(selObj) {
    var pareRow = selObj.parent().parent();
    var _rowName = pareRow.children()[1].innerHTML;
    //Check if the row name is exisiting in the already selected items to capture scenario of changing the freq by userAgent
    for (var i = 0, l = SelectedEventsWithFreq.length; i < l; i++) {
        if (SelectedEventsWithFreq[i].id.localeCompare(_rowName) == 0) {
            SelectedEventsWithFreq.splice(i, 1);
            break;
        }
    }
    var findSelected;
    var selOptionVal;
    var alloptions = selObj.children();
    for (var i = 0, l = alloptions.length; i < l; i++) {
        if (alloptions[i].selected == true) {
            selOptionVal = alloptions[i].innerHTML;
        }
    }
    var objToAdd = { id: _rowName, name: _rowName, freq: selOptionVal }
    SelectedEventsWithFreq.push(objToAdd);
}

function checkAllWork(tableID, resultJSON) {
    $.each(resultJSON, function (index, value) {
        var _nam = value.name;
        if (checkedRows.length > 0) {
            //checkedRows.push({id: row.name, name: row.name, freq: row.sel.value});
            var addedRow = false;
            for (var i = 0, l = checkedRows.length; i < l; i++) {
                if (checkedRows[i].id.localeCompare(_nam) == 0 && checkedRows[i].tabName.localeCompare(tableID) == 0) {
                    addedRow = true;
                }
            }
            if (!addedRow) { checkedRows.push({ id: _nam, name: _nam, freq: "", tabName: tableID }); }
        } else { checkedRows.push({ id: _nam, name: _nam, freq: "", tabName: tableID }); }
    });
}

function callAction(container, steps, step) {

    var serverURL = Xrm.Page.context.getClientUrl();
    //query to send the request to the global Action 
    var query = "arup_MySubsscriptionWizardAction";
    //set the current loggedin userid in to _inputParameter of the 
    var _userID = getCRMUserID();
    var selectedRowsJSON = JSON.stringify(selectedRows);
    //Pass the input parameters of action
    var data = {
        "UserID": _userID,
        "SelectedJSON": selectedRowsJSON
    };
    //Create the HttpRequestObject to send WEB API Request 
    var req = new XMLHttpRequest();
    //Post the WEB API Request 
    req.open("POST", serverURL + "/api/data/v8.2/" + query, true);
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.onreadystatechange = function () {
        if (this.readyState == 4 /* complete */) {
            req.onreadystatechange = null;
            if (this.status == 200) {
                //You can get the output parameter of the action with name as given below
                result = JSON.parse(this.response);
                var returnedJSON = JSON.parse(result.CUStatus);
                //remove the waiting 
                $("#wait").remove();
                $("#waitmsg").remove();
                $(".wizard-step").show();
                $(".wizard-buttons").show();
                $("#UR_Step").hide();
                $("#SS_Step").hide();
                $("#CN_Step").hide();
                //prepare the table...
                $('#CRMResult').bootstrapTable({

                    data: returnedJSON

                });

            } else {
                if (this.status == 204) {
                    $("#wait").remove();
                    $("#waitmsg").remove();
                    $(".wizard-step").show();
                    $(".wizard-buttons").show();
                    $("#UR_Step").hide();
                    $("#SS_Step").hide();
                    $("#CN_Step").hide();
                    $('body').append("<div id=\"204\"><h3>Completed adding the subscriptions.</h3></div> ");
                }
                else {
                    var error = JSON.parse(this.response).error;
                    alert(error.message);
                }
            }
        }
    };
    //Execute request passing the input parameter of the action 
    req.send(window.JSON.stringify(data));
}
var leadSource;
function onOpportunityTypeChange(htmlElement) {
    oppWizLog("Change from " + htmlElement.value);
    leadSource = $("#leadSource");
    leadSource.attr("disabled", false);
    var type = htmlElement.value;
    switch (type) {
        case "770000000":
            $("#ta1").val("This opportunity is for new work under a new contract.");
            $("#ta2").val("");
            addAllOptions("leadSource");
            leadSource.css("pointer-events", "auto");
            break;
        case "770000001":
            $("#ta1").val("This opportunity is for an extension of an existing project under an existing contract.");
            $("#ta2").val("This opportunity will be pre-populated with appropriate information from the Related Parent Opportunity.");
            addAllOptions("leadSource");
            leadSource.val("100000000");
            leadSource.css("pointer-events", "none");
            leadSource.attr("disabled", true);
            break;
        case "770000002":
            $("#ta1").val("This opportunity is for an extension of an existing project. This requires a new form of contract.");
            $("#ta2").val("This opportunity will be pre-populated with appropriate information from the Related Parent Opportunity.");
            addAllOptions("leadSource");
            removeOptions(["3", "100000002", "5", "8", "11", "10"], "leadSource");
            leadSource.css("pointer-events", "auto");
            break;
        case "770000003":
            $("#ta1").val("This opportunity is to win a place on a new framework, panel, call-off.");
            $("#ta2").val("");
            addAllOptions("leadSource");
            removeOptions(["100000000", "100000002", "5", "6", "11"], "leadSource");
            leadSource.css("pointer-events", "auto");
            break;
        case "770000004":
            $("#ta1").val("This opportunity is for new work or task order that will be governed by an existing framework, panel or call-off agreement.");
            $("#ta2").val("Please confirm if a CRM framework record exists. If yes, select the CRM framework record; otherwise enter the framework/panel reference.");
            addAllOptions("leadSource");
            leadSource.val("5");
            leadSource.css("pointer-events", "none");
            break;
        case "770000005":
            $("#ta1").val("Arup has been asked to support multiple architects who are all bidding for the same architectural competition.");
            $("#ta2").val("This opportunity cannot be progressed past Pre-Bid stage. It will have a fee value set to zero. Each of the competition opportunities will be pre-populated with information from this opportunity.");
            addAllOptions("leadSource");
            removeOptions(["100000000", "5", "6", "11"], "leadSource");
            leadSource.css("pointer-events", "auto");
            break;
        case "770000006":
            $("#ta1").val("This is to be used for each individual entry in an architect competition for which there is a master record.");
            $("#ta2").val("This opportunity will be pre-populated with appropriate information from the architectural competition master record.");
            addAllOptions("leadSource");
            leadSource.val("8");
            leadSource.css("pointer-events", "none");
            break;
    }
    checkSelected(htmlElement);
    validateField(htmlElement);
    validateField(leadSource);
    //ensureRelatedOpportunitySelected("#opporunities");
}

function removeOptions(data,type)
{
    addAllOptions(type);
    if (type == "leadSource") {

        leadSource.children("option").each(function () {
            if ($.inArray(this.value, data) !== -1)
                this.remove();
        });
    }
    else if (type == "procType") {
        proctype.children("option").each(function () {
            if ($.inArray(this.value, data) !== -1)
                this.remove();
        });
    }
}

function addAllOptions(type) {
    removeAllOptions(type);
    if (type == "leadSource") {
        leadSource.html(leadsourceOptions);
    }
    else if (type == "procType") {
        proctype.html(leadsourceOptions);
    }
}

function removeAllOptions(type) {
    if (type == "leadSource") {
        leadSource.html("");
    }
    else if (type == "procType") {
        proctype.html();
    }
}

function getCountries(control, resolve) {
    var input = control.value;
    if (input.length < 3) return;
    debounce(300,
        function() {
            oppWizLog("Start getting countries " + input);
            control.classList.add("fetching-data");
            var p = FetchCRMData("ccrm_countries",
                    "$select=ccrm_arupcountrycode,ccrm_name,ccrm_riskrating&$filter=" +
                    encodeURIComponent("statuscode eq 1 and ") +
                    "contains(ccrm_name,'" +
                    input +
                    "')" +
                    "&$orderby=ccrm_name asc",
                    control)
                .then(function success(results) {
                        var countries = "";
                        for (var i = 0; i < results.value.length; i++) {
                            var ccrm_arupcountrycode = results.value[i]["ccrm_arupcountrycode"];
                            var ccrm_name = results.value[i]["ccrm_name"];
                            var ccrm_countryid = results.value[i]["ccrm_countryid"];
                            var ccrm_riskrating = results.value[i]["ccrm_riskrating"];
                            countries += '<option value="' +
                                ccrm_name +
                                '" data-value="' +
                                ccrm_countryid +
                                '" risk-rating="' +
                                ccrm_riskrating + '"> ' +
                                ccrm_arupcountrycode +
                                " - " +
                                ccrm_name +
                                '</option > ';
                        }
                        control.list.innerHTML = countries;
                        oppWizLog("retrieved " + results.value.length + " countries");
                    },
                    restQueryErrorDialog("Unable to get countryList"));
            p.then(resolve);
        });
}

function getStates() {
    var input = $("#countries option[value='" + $('#project_country').val() + "']").attr("data-value"); // Country name
    if (input === undefined) return; // Autocompletion can cause this.
    var control = $("#project_state")[0];
    if (input.length < 4) return;
    debounce(300,
        function(){
            oppWizLog("Start getting states " + input);
            control.classList.add("fetching-data");
            FetchCRMData("ccrm_arupusstates",
                "$select=ccrm_arupusstatecode,ccrm_arupusstateid,ccrm_name,ccrm_usstatecode,_ccrm_companyid_value,statecode&$filter=_ccrm_countryid_value" + encodeURIComponent(" eq ") + input + "&$orderby=ccrm_name asc",
                    control,0)
                .then(function success(results) {
                        var states = "";
                        for (var i = 0; i < results.value.length; i++) {
                            var ccrm_arupusstateid = results.value[i]["ccrm_arupusstateid"];
                            var ccrm_name = results.value[i]["ccrm_name"];
                            var ccrm_usstatecode = results.value[i]["ccrm_usstatecode"];
                            var ccrm_companyid = results.value[i]["_ccrm_companyid_value"];
                            var statecode = results.value[i]["statecode"];
                            var statecode_formatted = results.value[i]["statecode@OData.Community.Display.V1.FormattedValue"];

                            states += '<option value="' + ccrm_name + '" data-value="' + ccrm_arupusstateid + '" ' + 
                                ( ccrm_companyid == null ? "" : 'company-id-value="' + ccrm_companyid + '"' ) +
                                ' > ' + ccrm_usstatecode + " - " + ccrm_name + '</option > ';
                        }
                        control.list.innerHTML = states;
                        control.value = "";
                        if (results.value.length == 0) {
                            setError(control, false);
                            control.readOnly = true;
                        } else {
                            control.readOnly = false;
                            setError(control, false);
                            control.focus();
                        }
                    },
                    restQueryErrorDialog("Unable to get States List"));
        });
}

function getBusinesses() {
    if (onceload) {
        var control = $("#arup_business")[0];
        FetchCRMData("ccrm_arupbusinesses",
                "$select=ccrm_arupbusinesscode,ccrm_arupbusinessid,_ccrm_arupmarketid_value,ccrm_name&$filter=statuscode" +
                encodeURIComponent(" eq 1") +
                "&$orderby=ccrm_name asc",
                control)
            .then(
                function success(results) {
                    var businesses = "";
                    for (var i = 0; i < results.value.length; i++) {
                        var ccrm_arupbusinesscode = results.value[i]["ccrm_arupbusinesscode"];
                        var ccrm_arupbusinessid = results.value[i]["ccrm_arupbusinessid"];
                        var _ccrm_arupmarketid_value = results.value[i]["_ccrm_arupmarketid_value"];
                        var _ccrm_arupmarketid_value_formatted =
                            results.value[i]["_ccrm_arupmarketid_value@OData.Community.Display.V1.FormattedValue"];
                        var _ccrm_arupmarketid_value_lookuplogicalname =
                            results.value[i]["_ccrm_arupmarketid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                        var ccrm_name = results.value[i]["ccrm_name"];

                        businesses += '<option value="' +
                            ccrm_name +
                            '" data-value="' +
                            ccrm_arupbusinessid +
                            '" > ' +
                            ccrm_name +
                            " - " +
                            ccrm_arupbusinesscode +
                            "[" +
                            _ccrm_arupmarketid_value_formatted +
                            "]" +
                            '</option > ';
                    }
                    control.list.innerHTML = businesses;
                    onceload = false;
                    oppWizLog("retrieved " + results.value.length + " businesses");

                },
                restQueryErrorDialog("Unable to get Arup business list"));
    }
}

function getSubBusinesses() {
    var input = $("#businesses option[value='" + $('#arup_business').val() + "']").attr("data-value");
    if (input === undefined) return;
    var control = $("#arup_subbusiness")[0];
    control.value = "";
    FetchCRMData("arup_subbusinesses",
        "$select=arup_name,arup_subbusinessid,statecode,statuscode&$filter=_arup_business_value" +
        encodeURIComponent(" eq " + input + " and statuscode eq 1") +
        "&$orderby=arup_name asc",
        control
    ).then(
        function success(results) {
            var subbusinesses = "";
            for (var i = 0; i < results.value.length; i++) {
                var arup_name = results.value[i]["arup_name"];
                var arup_subbusinessid = results.value[i]["arup_subbusinessid"];
                subbusinesses += '<option value="' +
                    arup_name +
                    '" data-value="' +
                    arup_subbusinessid +
                    '" > ' +
                    arup_name +
                    '</option > ';
            }
            control.list.innerHTML = subbusinesses;
            oppWizLog("retrieved " + results.value.length + " sub businesses");

        },
        restQueryErrorDialog("Unable to get Arup sub-business list")
    );
}

var companyPromise = function() {
    var p = FetchCRMData("ccrm_arupcompanies",
        "$select=ccrm_acccentrelookupcode,ccrm_arupcompanycode,ccrm_arupcompanyid,ccrm_name,_ccrm_arupregionid_value&$filter=statuscode" +
        encodeURIComponent(" eq 1") +
        "&$orderby=ccrm_name asc",
        null,
        0);
    p.then(
        function success(results) {
            var companies = "";
            var indiaCompanies = "";
            var control = $("#arup_company")[0];
            for (var i = 0; i < results.value.length; i++) {
                var ccrm_acccentrelookupcode = results.value[i]["ccrm_acccentrelookupcode"];
                var ccrm_arupcompanycode = results.value[i]["ccrm_arupcompanycode"];
                var ccrm_arupcompanyid = results.value[i]["ccrm_arupcompanyid"];
                var ccrm_arupregionid = results.value[i]["_ccrm_arupregionid_value"];
                var ccrm_name = results.value[i]["ccrm_name"];
                var option = '<option value="' +
                    ccrm_name +
                    '" data-value="' +
                    ccrm_arupcompanyid +
                    '" data-accvalue="' +
                    ccrm_acccentrelookupcode +
                    '" data-regionid="' + 
                    ccrm_arupregionid +
                    '" > ' +
                    ccrm_arupcompanycode +
                    " - " +
                    ccrm_name +
                    '</option > ';
                companies += option;
                if (ccrm_arupcompanycode == "55" || ccrm_arupcompanycode == "75") {
                    indiaCompanies += option;
                }
            }
            Arup_validations.arup_company.globalCompanyList = companies;
            Arup_validations.arup_company.indiaCompanyList = indiaCompanies;
            control.list.innerHTML = companies;
            oppWizLog("retrieved " + results.value.length + " companies");

        });
    p.catch(restQueryErrorDialog("Unable to get Arup Companies list"));
    return p; // Promise that companies list will be fully populated
}();

// Take some action once the companies list has been loaded.
function getCompanies(receive) {
    companyPromise.then(receive,
        function error(ex) {
            oppWizLog("Error processing companies " + ex);
        });
}

// Create an ajax query/promise to get data for the current user which can then be used
// Asynchronously by calling getUserData() to populate default values.
var userDataPromise = function () {
    var targetEntity = "systemusers(" + parent.Xrm.Page.context.getUserId().replace(/[{}]/g, "") + ")";
    var userDataQuery =
        "$select=_ccrm_arupcompanyid_value,ccrm_staffid,fullname,systemuserid&" +
            "$expand=ccrm_accountingcentreid($select=ccrm_arupaccountingcode,ccrm_arupaccountingcodeid,ccrm_arupcompanycode,ccrm_arupgroup,ccrm_arupgroupcode,ccrm_name,ccrm_practice," +
            "ccrm_practicecode,ccrm_subpractice,ccrm_subpracticecode,statecode,statuscode),ccrm_arupcompanyid($select=ccrm_arupcompanyid,ccrm_name,statecode,statuscode,_ccrm_arupregionid_value)";
    var promise = FetchCRMData(targetEntity, userDataQuery, null, 0);
    promise.then(
        function receive(results) {
            oppWizLog("Got User Data");
        });
    promise.catch(restQueryErrorDialog("Getting initial user data"));
    return promise;
}();

function getUserData(receive) {
    // get data for current user - using Promise to ensure efficient async operation.
    // This will succeed whether or not the underlying webApi call has completed when this function is called.
    userDataPromise.then(receive);
}

function getAccountingCentres() {
    var input = $("#companies option[value='" + $('#arup_company').val() + "']").attr("data-accvalue");
    if (input != undefined);
    var control = $("#accountingcentre")[0];
    control.value = "";
    var p = FetchCRMData("ccrm_arupaccountingcodes",
            "$select=ccrm_arupaccountingcodeid,ccrm_arupcompanycode,ccrm_name&$filter=ccrm_arupcompanycode" +
            encodeURIComponent(" eq '" + input + "' and  statuscode eq 1 ") +
            "&$orderby=ccrm_name asc",
            control)
        .then(function success(results) {
            Arup_validations.accountingcentre.setOptions( results.value);
//            Arup_validations.accountingcentre.setOptions(Arup_validations.accountingcentre, document.getElementById('accountingcentres'), results.value);
                //for (var i = 0; i < results.value.length; i++) {
                //    var ccrm_arupaccountingcodeid = results.value[i]["ccrm_arupaccountingcodeid"];
                //    var ccrm_arupcompanycode = results.value[i]["ccrm_arupcompanycode"];
                //    var ccrm_name = results.value[i]["ccrm_name"];

                //    acc += '<option value="' + ccrm_name + '" data-value="' + ccrm_arupaccountingcodeid + '" > ' + ccrm_name + '</option > ';
                //}
                //document.getElementById('accountingcentres').innerHTML = acc;
                oppWizLog("retrieved " + results.value.length + " accounting centres");
            },
            restQueryErrorDialog("Unable to get Accounting Centre list")
    );
    return p;
}


function ValidateAccountingCentre(configRecord, id, target) {
//    var p = new Promise( function(re))
    var targetEntity = "ccrm_arupaccountingcodes(" + id + ")";
    var accCentreDataQuery =
        "$select=ccrm_arupgroup, ccrm_arupgroupcode,_ccrm_arupgroupid_value,ccrm_arupgroupid,ccrm_practice,ccrm_practicecode,ccrm_subpractice,ccrm_subpracticecode,ccrm_estprojectstaffoverheadsrate" +
        "&$expand=ccrm_arupgroupid($select=_ccrm_arupregionid_value)";
    var promise = FetchCRMData(targetEntity, accCentreDataQuery, target);
    promise.then(
        function receive(result) {
            oppWizLog("Got Accounting centre Data");c
            Arup_validations.arup_group_code.val = result.ccrm_arupgroupcode;
            Arup_validations.arup_group_id.val = result.ccrm_arupgroupid.ccrm_arupgroupid;
            Arup_validations.arup_region.val = result.ccrm_arupgroupid._ccrm_arupregionid_value;
            oppWizLog("Setting arup_region to " + Arup_validations.arup_region.val);
            Arup_validations.parentPractice.val = result.ccrm_practice;
            Arup_validations.parentPracticeCode.val = result.ccrm_practicecode;
            Arup_validations.subPractice.val = result.ccrm_subpractice;
            Arup_validations.subPracticeCode.val = result.ccrm_subpracticecode;

        },
        restQueryErrorDialog("Getting accounting centre data"));
    return promise;
}

var debounceTimers = [];
function debounce(delay, callback) {
    oppWizLog("starting debounce " + delay);
    if (!!debounceTimers[callback]) {
        oppWizLog("Clearing debounce timer");
        clearTimeout(debounceTimers[callback]);
    }
    debounceTimers[callback] = setTimeout(callback, delay);
}

function getClients(control, flag) {
    var input = control.value;
    if (input.length < 4 || input == "Unassigned") return;
    debounce(300,
        function () {
            getClients2(control, "accounts",
            "$select=accountid,name,address1_city,_ccrm_countryofcoregistrationid_value&$filter=contains(name,'" +
            encodeURIComponent(input) +
            "')&$orderby=name    asc")}
    );  
}

function getClients2(control, entity, query) {
    oppWizLog("Start getting clients " + control.value);
    control.classList.add("fetching-data");
    FetchCRMData(entity, query, control)
        .then(function success(results) {
                var clients = "";
                var list = results.value || [results];
                for (var i = 0; i < list.length; i++) {
                    var accountid = list[i]["accountid"];
                    var name = list[i]["name"];
                    var city = list[i]["address1_city"];
                    var country_reg_id = list[i]["_ccrm_countryofcoregistrationid_value"];
                    clients += '<option value="' +
                        name +
                        '" data-value="' +
                        accountid +
                        ( !!country_reg_id ? 
                            '" country-reg-id="' +
                            country_reg_id : "" ) +
                        '" > ' +
                        name +
                        ' - ' +
                        city +
                        '</option > ';
                }
                control.list.innerHTML = clients;
                if (list.length == 1) {
                    control.value = list[0]["name"];
                }
                oppWizLog("Retrieved " + list.length + " client records from server");
            },
            restQueryErrorDialog("Getting Clients"));
}


function getUsers(control) {
    var input = control.value;
    if (input.length < 4) return;
    debounce(300,
        function() {
            oppWizLog("Start getting users" + input);
            control.classList.add("fetching-data");
            FetchCRMData("systemusers",
                    "$select=ccrm_staffid,fullname,systemuserid&$filter=contains(fullname,'" +
                    encodeURIComponent(input) +
                    "')" +
                    encodeURIComponent(" and  isdisabled eq false") +
                    "&$orderby=fullname asc",
                    control)
                .then(function success(results) {
                        var users = "";
                        for (var i = 0; i < results.value.length; i++) {
                            var ccrm_staffid = results.value[i]["ccrm_staffid"];
                            var fullname = results.value[i]["fullname"];
                            var systemuserid = results.value[i]["systemuserid"];
                            users += '<option value="' +
                                fullname +
                                '" data-value="' +
                                systemuserid +
                                '" > ' +
                                fullname +
                                '</option > ';
                        }
                        document.getElementById('users').innerHTML = users;
                        oppWizLog("retrieved " + results.value.length + " users");
                    },
                    restQueryErrorDialog("Unable to get countryList"));
        });
}

function getFrameworkRecs(control) {
    var input = control.value;
    if (input.length < 2) return;
    debounce(300,
        function() {
            oppWizLog("Start getting frameworks" + input);
            control.classList.add("fetching-data");
            FetchCRMData("arup_frameworks",
                    "$select=arup_name,arup_frameworkid,arup_arupregionname,_arup_client_value&$filter=contains(arup_name,'" +
                    encodeURIComponent(input) +
                    "')" +
                    encodeURIComponent(" and statecode eq 0") +
                    "&$orderby=arup_name asc",
                    control)
                .then(function success(results) {
                        var frameworks = "";
                        for (var i = 0; i < results.value.length; i++) {
                            var frameworkname = results.value[i]["arup_name"];
                            var frameworkid = results.value[i]["arup_frameworkid"];
                            var client =
                                results.value[i]["_arup_client_value@OData.Community.Display.V1.FormattedValue"];
                            frameworks += '<option value="' +
                                frameworkname +
                                '" data-value="' +
                                frameworkid +
                                '" > ' +
                                frameworkname + " - " + client +
                                '</option > ';
                        }
                    control.list.innerHTML = frameworks;
                    if (results.value.length == 1) {
                        control.value = results.value[0].arup_name;
                    }
                        oppWizLog("retrieved " + results.value.length + " frameworks");
                    },
                    restQueryErrorDialog("Unable to get Framework"));
        });
}

function saveOpportunity() {
    debugger;
    var attrs = getAttributes();
    oppWizLogObject(attrs, "Saving..");
    return CreateOpportunity(attrs);
}

function getAttributes() {
    var attrs = {};
    for (var f in Arup_validations) {
        if (Arup_validations.hasOwnProperty(f)) {
            var field = Arup_validations[f];
            var name = field.crmAttribute;
            var bind = "";
            if (field.crmAttribute.endsWith("id") || field.hasOwnProperty("databind") && field.databind) {
                bind = "@odata.bind";
            }
            oppWizLog("field is " + name);
            var val = field.value.call(field, document.getElementById(f), field);
            if (typeof(val) !== "undefined") attrs[name + bind] = val;
        }
    }
    return attrs;
}


function CreateOpportunity(attributes) {
    var entity = {};
    for (var attr in attributes) {
        if (attributes.hasOwnProperty(attr)
            && !!attributes[attr]
            && ! /\/.*?\(undefined\)/.test(attributes[attr]))
            entity[attr] = attributes[attr];
    }
    var impersonateUserId;

    var promise = new Promise(function (resolve, reject) {
        Xrm.WebApi.retrieveMultipleRecords("ccrm_arupinterfacesetting",
                "?$select=ccrm_setting&$filter=ccrm_name eq ('Arup.CreateOpportunity.UserId')")
            .then(function(result) {
                    if (result.entities.length != 1) {
                        reject(
                            { message: "CreateOpportunity Userid not defined in Arup Interface Settings" }
                        );
                        return;
                    }
                impersonateUserId = result.entities[0].ccrm_setting;
                oppWizLog("Impersonate UserId =" + impersonateUserId);
                    $.ajax({
                        type: "POST",
                        contentType: "application/json; charset=utf-8",
                        datatype: "json",
                        url: Xrm.Page.context.getClientUrl() + "/api/data/v9.1/opportunities",
                        data: JSON.stringify(entity),
                        beforeSend: function(XMLHttpRequest) {
                            XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                            XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                            XMLHttpRequest.setRequestHeader("Accept", "application/json");
                            XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                            XMLHttpRequest.setRequestHeader("MSCRMCallerID", impersonateUserId);
                        },
                        async: true,
                        success: function(data, textStatus, xhr) {
                            var uri = xhr.getResponseHeader("OData-EntityId");
                            var regExp = /\(([^)]+)\)/;
                            var matches = regExp.exec(uri);
                            var newEntityId = matches[1];
                            resolve({ name: attributes.name, newEntityid: newEntityId }, xhr);
                        },
                        error: function(xhr, textStatus, errorThrown) {
                            reject({
                                details: xhr.responseJSON.error.message,
                                errorCode: xhr.status,
                                message: "Error trying to save opportunity"
                            }, xhr);
                        }
                    });
                },
                function(e) {
                    reject(
                        { details: e.message }
                    );
                });
    });

    return promise;
}

function getOpportunitiesOpen(target) {
    // To DO
    oppWizLog("Get open opportunities");
    getOpportunities(target, "and statecode eq 0");
}
function getOpportunitiesOpenWon(target) {
    // To DO
    oppWizLog("Get open and Won opportunities");
    getOpportunities(target, " and  (statecode eq 0 or  statecode eq 1 )");
}

function getOpportunitiesWon(target) {
    // To DO
    oppWizLog("Get  Won opportunities");
    getOpportunities(target, " and  (statecode eq 1 )");
}

function getOpportunitiesOpenWonArchMaster(target) {
    // To DO
    oppWizLog("Get open and Won architectural master opportunities");
    getOpportunities(target, " and  ((statecode eq 0 or  statecode eq 1 ) and arup_opportunitytype eq 770000005)");
}


function getOpportunities(inputControl, extraFilter) {
    // Do not search if the current value is an exact match for a item in the data list.
    var value = $("#opportunities option[value='" + $('#relatedopportunity').val() + "']");
    if (value.length > 0) return;
    var input = inputControl.value;

    var p = new Promise(function(resolve, reject) {
        inputControl.classList.add("waiting-for-crm");
        var num = input.length;
        oppWizLog("Searching for opportunity: " + input);
        if ($.isNumeric(input)) {
            if (num >= 4) {
                var firstDigit = getFirstDigit(input);
                if (firstDigit == 8) {
                    FetchCRMData("opportunities",
                            "$select=ccrm_jna,ccrm_reference,name,opportunityid&$filter=startswith(ccrm_reference,'" +
                            encodeURIComponent( input ) +
                            "')" +
                            extraFilter +
                            "&$orderby=" +
                            encodeURIComponent("ccrm_jna asc"),
                            inputControl)
                        .then(function(result)  {
                                resolve(result, "ccrm_reference");
                            },
                            restQueryErrorDialog("Getting opportunities by name",null, reject));
                } else {
                    FetchCRMData("opportunities",
                            "$select=ccrm_jna,ccrm_reference,name,opportunityid&$filter=startswith(ccrm_jna,'" +
                            input +
                            "')" +
                            extraFilter +
                            "&$orderby=" +
                            encodeURIComponent("ccrm_jna asc"),
                            inputControl)
                        .then(function(result) {
                                resolve(result, "ccrm_jna");
                            },
                            restQueryErrorDialog("Getting opportunities by ccrm_jna", null, reject));
                }
            }
        } else {
            if (num >= 5) {
                FetchCRMData("opportunities",
                        "$select=ccrm_jna,ccrm_reference,name,opportunityid&$filter=contains(name, '" +
                        input +
                        "')" +
                        extraFilter +
                        "&$orderby=" +
                        encodeURIComponent("ccrm_jna asc"),
                        inputControl)
                    .then(function(result) {
                            resolve(result, "name");
                        },
                        restQueryErrorDialog("Getting opportunities by name", null, reject)
                );
            }
        }
    });
    p = p.then(
        function resolve(result, type) {        
            fillOpportunityResults(result);
            oppWizLog("Found " + result.value.length + " results");
            inputControl.focus();
        },
        function reject() {
        });
    return p;
}

function loadFromParent(_this, fieldsToLoad, fieldsToLoadButIgnore) {
    // Load opportunity fields from parent
    if (!_this || !_this.valueId || !_this.valueId()) return new Promise();
    var retrieveById = _this.value();
    oppWizLog("load fields from parent " + _this.value());
    oppWizLog(" fields to load = " + fieldsToLoad.join(", "));
    //var p = new Promise(function(resolve, reject) {
    //    oppWizLog("Promise to loadFromParent called");
    //});
    var select = "$select=name," + fieldsToLoad.map(function(field) {
        if (!Arup_validations[field]) {
            oppWizLog("loadFromParent did not find field " + field);
        }
        var attr = Arup_validations[field].crmAttribute;
        return attr;
    }).join(",");
    var p = FetchCRMData(retrieveById, select, $("#relatedopportunity")[0]);
    p.then(function(result) { fillFieldsFromParent(result, fieldsToLoad, fieldsToLoadButIgnore) });
    p.catch(restQueryErrorDialog("Loading fields from parent"));
    return p;
}

function fillFieldsFromParent(result, fieldsToLoad, fieldsToLoadButIgnore) {
    fieldsToLoadButIgnore = !!fieldsToLoadButIgnore ? fieldsToLoadButIgnore.reduce(function(a, b) {(a[b] = '', a)}, {}) : {};
    oppWizLog("Filling fields from parent record :" + fieldsToLoad.join(", "));
    oppWizLog("Result name " + result.name);
    oppWizLog("Available result fields :" + Object.keys(result).join(", "));
    // for ( var  f of fieldsToLoad)
    for ( var i=0; i<fieldsToLoad.length;i++) {
        var f = fieldsToLoad[i];
        if (!!fieldsToLoadButIgnore[f]) {
            oppWizLog("Explicitly not filling " + f);
            return;
        }
        if (!Arup_validations[f]) {
            oppWizLog("filelFieldsFromParent did not find field " + f);
            return;
        }
        var field = Arup_validations[f];
        var value = result[field.crmAttribute];
        if (!!value) {
            field.val = value; // Do this all fields.
            // Anything else will have to sort itself out via a setvalue function.
            if (typeof (field.setValue) === "function") {
                field.setValue.call(field, value, result);
            } else {
                // If there is a dom element with id === f, set the value of that
                var htmlNode = $("#" + f)[0];
                if (!!htmlNode) {
                    htmlNode.value = value;
                }
            }
        }
    }
}

function fillOpportunityResults(data) {
    var opp = "";
    var results = data;
    for (var i = 0; i < results.value.length; i++) {
        var ccrm_reference = results.value[i]["ccrm_reference"];
        var ccrm_jna = results.value[i]["ccrm_jna"];
        var name = results.value[i]["name"];
        var opportunityid = results.value[i]["opportunityid"];
        opp += '<option value="' +
            ccrm_reference +
            '-' + 
            name + (ccrm_jna != null ? " CJN: " + ccrm_jna : "") +
            '" data-value="' +
            opportunityid +
            '" > ' +
            name +
            '</option > ';
    }
    document.getElementById('opportunities').innerHTML = opp;
}

function FetchCRMData(entityName, select, target, maxRecords) {
    maxRecords = (typeof(maxRecords) === "undefined") ? 25 : maxRecords;
    var url = parent.Xrm.Page.context.getClientUrl() + "/api/data/v9.1/" + entityName + "?" + select;
    var promise = $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: url,
        beforeSend: function(XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
            XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            if (maxRecords != 0) {
                XMLHttpRequest.setRequestHeader("Prefer",
                    "odata.include-annotations=\"*\",odata.maxpagesize=" + maxRecords);
            }
        },
        async: true,
    });
    promise.catch(function() { oppWizLog("FetchCRMData failed on " + url) });
    promise.always(function() { !!target && target.classList.remove("waiting-for-crm") });
    if (!!target) target.classList.add("waiting-for-crm");
    return promise;
}

function restQueryErrorDialog(message, url, reject) {
    return function (xhr, textStatus, errorThrown) {
        var errorMessage = textStatus;
        if (!!xhr.responseJSON && !!xhr.responseJSON.error ) {
            errorMessage = xhr.responseJSON.error.message
        }
        var errorDetail = {
            //            details: message + (!!url ? "\r\nQuery: " + url : "") + "\r\n" +   xhr.responseJSON.error.message,
            details: "Query error\r\n" + (!!url ? "\r\nQuery: " + url : "") + "\r\n" + errorMessage,
            errorCode: xhr.status,
            message: message
        }
        Xrm.Navigation.openErrorDialog(errorDetail);
        if (typeof(reject) == "function") reject();
    }
}

function getFirstDigit(input) {
    var output = [];
    while (input) {
        output.push(input % 10);
        input = Math.floor(input / 10);
    }
    return output.pop();
}

function nextOnReturn(ev) {
    if (ev.keyCode == 13) {
        var btnNext = $(".wizard-button-next");
        btnNext.click();
    } 
}

function closestParent(child, className) {
    if (!child || child == document) {
        return null;
    }
    if (child.classList.contains(className)) {
        return child;
    } else {
        return closestParent(child.parentNode, className);
    }
}

function ensureUltimateClientSelected(htmlElement) {
    var opportunityType = $("#opportunityType")[0].value;
    if (opportunityType == "770000005") {
        checkSelected(htmlElement);
    }
}

function ensureSelected(htmlElement, isNotRequired ) {
    // Ensure that the selected value is set to the first item in the data list.
    //    var formGroup = closestParent(htmlElement.parentNode, "form-group");
    if (htmlElement.readOnly) return;
    var target = null;
    var targetval = htmlElement.value;
    var id = null;
    if ( !!targetval ) targetval = targetval.toLowerCase();
    if (!!htmlElement.list && htmlElement.list.children.length > 0) {
        var dataVals = htmlElement.list.children;
        for (var i = 0; i < dataVals.length; i++) {
            if (dataVals[i].value.toLowerCase().includes(targetval)) {
                target = dataVals[i];
                id = dataVals[i].getAttribute("data-value");
                break;
            }
        }
    }
    if (!!targetval && !id || (!isNotRequired && target == null)) {
        setError(htmlElement);
    } else {
        if (!!target) htmlElement.value = target.value;
        setError(htmlElement, false);
    }
}

function setError(selector, errorOn) {
    if (typeof(errorOn) === 'undefined') errorOn = true;
    var target = $(selector);
    if (target.length == 0) return true;
    var formGroup = closestParent(target[0], "form-group");
    if (errorOn) {
        formGroup.classList.remove("has-success");
        formGroup.classList.add("has-error");
    } else {
        formGroup.classList.add("has-success");
        formGroup.classList.remove("has-error");
    }
}

function hasError(selector) {
    var target = $(selector);
    if (target.length == 0 ) return true;
    var formGroup = closestParent(target[0], "form-group");
    if (formGroup != null && formGroup.classList.contains("has-error")) {
        return true;
    }
    return false;
}

function oppWizLog(message) {
    console.log(message);
}

function oppWizLogObject(o, name) {
    oppWizLog(name);
    oppWizLog("{");
    for (var r in o) {
        oppWizLog(r + "  :  " + o[r]);
    }
    oppWizLog("}");
}

function checkSelected(htmlElement) {
    if (!!htmlElement.value == "") {
        setError(htmlElement);
    } else {
        setError(htmlElement, false);
    }
}


function checkForError(target) {
    setError(target, !ArupValidate(target));
}

function ArupValidate(target) {
    if (typeof(target) === "string") {
        return ValidateByName(target);
    } else {
        if (typeof(target) === "undefined") {
            ValidateAll();
        }
    }
    ValidateHtmlElement(target);
}

// Top level validation for entire form.
function ArupValidateAll() {
    return new Promise(function (resolve, reject) {
        var errors = {};
        for (var v in Arup_validations) {
            if (Arup_validations.hasOwnProperty(v)) {
                var result = ValidateByName(v);
                if (result) {
                    for (var r in result) {
                        errors[r] = result[r];
                    }
                }
            }
        }

        if (Object.keys(errors).length === 0) {
            resolve();
        } else {
            reject(errors);
        }
    });
}

function ValidateHtmlElement(target) {
    var name = target.id || target.name;
    return ValidateByName(name);
}

function ValidateByName(target) {
    if (!!Arup_validations[target]) {
        var validation = Arup_validations[target];
        var hasErrors = validation.hasErrors;
        if (!!hasErrors) {
            if (typeof (hasErrors) == "function") hasErrors = [hasErrors];
            var errors = [];
            var htmlNode = document.getElementById(target);
            hasErrors.forEach(function(hasError, index) {
                var result = hasError.call(validation, htmlNode, validation );
                if (result) {
                    errors.push(result);
                }
            });
            if (errors.length > 0) {
                var name = validation.hasOwnProperty("name") ? validation.name : target;
                var rv = {};
                rv[name] = errors;
                return rv;
            }
        } else {
            oppWizLog("Failed to find validation for " + target);
        }
    }
    return false;
}

function Arup_setAllDefault() {
    for (var v in Arup_validations) {
        if (Arup_validations.hasOwnProperty(v)) {
            setDefaultByName(v);
        }
    }
}

function Arup_checkIsArupFieldConfig() {
    for (var v in Arup_validations) {
        var x = Arup_validations[v];
        if (!(x instanceof ArupFieldConfig) &&
            !(x instanceof ArupFieldConfigLookup) &&
            !(x instanceof ArupFieldConfigAlwaysTrue)) {
            oppWizLog(v + " is not ArupFieldConfig");
        }
    }
}


// Attach focusout validation to all fields.
function Arup_AddFocusOutValidationAll() {
    for (var v in Arup_validations) {
        if (Arup_validations.hasOwnProperty(v)) {
            $("#" + v).on("focusout",
                function() {
                    validateField(this, Arup_validations[v]);
                });
            $("#" + v).on("change",
                function () {
                    validateField(this, Arup_validations[v]);
                });
        }
    }
}

// Class definition for configurations defined by ArupFieldConfig.
function ArupFieldConfig(name, crmAttribute, id) {
    this.name = name;
    this.crmAttribute = crmAttribute;
    this.crmAttributeCollection = crmAttribute + "s";
    this.id = id;
    this.htmlNode = function () { return document.getElementById(this.id); }
    $(document).ready((function() {
        this.htmlNode2 = this.htmlNode(); 
    }).bind(this));
    if (typeof this.value !== "function") {
        ArupFieldConfig.prototype.setVal = function (value) { this.val = value };
        ArupFieldConfig.prototype.value = function () { return this.val; };
        ArupFieldConfig.prototype.isErrored = function() { return this.htmlNode().parentNode.classList.contains("has-error"); }
        ArupFieldConfig.prototype.setError =
            function(errorOn) {
                if (typeof (errorOn) === 'undefined') errorOn = true;
                var target = this.htmlNode();
                if (target.length === 0) return true;
                var formGroup = closestParent(target, "form-group");
                if (errorOn) {
                    formGroup.classList.remove("has-success");
                    formGroup.classList.add("has-error");
                } else {
                    formGroup.classList.add("has-success");
                    formGroup.classList.remove("has-error");
                }
            };

        ArupFieldConfig.prototype.ensureSelected = function () {
            var node = this.htmlNode();
            if (!node) return; // Html element may not be visible.
            if (node.readOnly) return;
            var target = null;
            var id = null;
            var targetval = node.value;
            if (!!targetval) targetval = targetval.toLowerCase();
            if (!!node.list && node.list.children.length > 0) {
                var dataVals = node.list.children;
                for (var i = 0; i < dataVals.length; i++) {
                    if (dataVals[i].value.toLowerCase().includes(targetval)) {
                        target = dataVals[i];
                        id = dataVals[i].getAttribute("data-value");
                        break;
                    }
                }
            }
            if (!!targetval && !id || (!this.isNotRequired && target == null)) {
                this.setError();
            } else {
                if (!!target) node.value = target.value;
                setError(false);
            }

            ArupFieldConfig.prototype.hide = function( hideMe ) {
                if (typeof (hideMe) === 'undefined') hideMe = true;
                var node = this.htmlNode();
                if (!node) return;
                if (hideMe) {
                    node.parentNode.classList.add("hidden");
                } else {
                    node.parentNode.classList.remove("hidden");
                }
            }
            ArupFieldConfig.prototype.isHidden = function () {
                var node = this.htmlNode();
                if (!node) return true;
                return node.parentNode.classList.contains("hidden");
            };

        }
    }
};

// Field configuration that always returns true
function ArupFieldConfigAlwaysTrue(name, crmAttribute, id) {
    ArupFieldConfig.call(this, name, crmAttribute, id);
    if (!ArupFieldConfigAlwaysTrue.prototype.__constructed) {
        ArupFieldConfigAlwaysTrue.prototype.value = function () { return true; };
        ArupFieldConfigAlwaysTrue.prototype.__constructed = true;
    }
}

function ArupFieldConfigLookup(name, crmAttribute, id, collectionname) {
    var o = ArupFieldConfig.call(this, name, crmAttribute, id);
    if (!ArupFieldConfigLookup.prototype.__constructed) {
        ArupFieldConfigLookup.prototype.value = function () { return "/" + collectionname + "(" + this.val + ")" }.bind(o),
        ArupFieldConfigLookup.prototype.__constructed = true;
    }
}

// For any Arup_validation attributes that appear as "on..." add a corresponding event listener.
function arup_AddAllEvents() {
    for (var v in Arup_validations) {
        if (Arup_validations.hasOwnProperty(v)) {
            for (var p in Arup_validations[v]) {
                if (p.startsWith("on") && Arup_validations[v].hasOwnProperty(p) && 
                    Arup_validations[v][p] instanceof Function ) {
                    var f = Arup_validations[v][p];
                    var  event = p.substr(2);
                    $("#" + v).on(
                        event,
                        null,
                        function (f1, v1) { // Capture validation from enclosing context.
                            return {
                                callback: f1,
                                validation: v1
                            }
                        }(f, Arup_validations[v]),
                        function(e) { // Have
                            var f = e.data.callback;
                            var validation = e.data.validation;
                            f.call(validation, e, validation)
                        }
                    );
                }
            }
        }
    }
}

function setDefaultByName(name) {
    var target = document.getElementById(name) || document.getElementsByName(name)[0];
    if (!!target) {
        setDefaultByElement(target);
    } else {
        // There are some fields that are not displayed on the form. need to allow for these.
        if (!!Arup_validations[name] && typeof (Arup_validations[name].setDefault) === "function") {
            Arup_validations[name].setDefault.call(Arup_validations[name], name, Arup_validations[name]);
        } else {
            oppWizLog("Did not find element to set default by name : " + name);
        }
    }
}

function setDefaultByElement(target) {
    var id = target.id || target.name;
    if (!id) return;
    if (!!Arup_validations[id]) {
        oppWizLog("Set default value for " + id);
        if (typeof (Arup_validations[id].setDefault) == "string") {
            target.value = Arup_validations[id].setDefault;
        } else if (typeof (Arup_validations[id].setDefault) === "function") {
            Arup_validations[id].setDefault.call(Arup_validations[id], target, Arup_validations[id]);
        }
    }
}

function ArupPageHasErrors(pageid) {
    if (Arup_validations_by_page.hasOwnProperty(pageid)) {
        var errors = {};
        Arup_validations_by_page[pageid].forEach(function(id, index) {
            var result = ValidateByName(id);
            if (result) {
                for (var r in result) {
                    errors[r] = result[r];
                }
            }
        });
        if (Object.keys(errors).length > 0) {
            return errors;
        }
    } else {
        oppWizLog("Page " + pageid + "not found");
    }
    return false;
}

var Arup_validations_by_page = {
    page1 : ['intorext'],
    page2: ['opportunityType', 'relatedopportunity', 'leadSource', 'crmframeworkexists', 'contractagreementref2','crmframeworkrecord'],
    page3: ['contractarrangement', 'client', 'endclient'],
    page4: ['project_name', 'project_country', 'project_state', 'project_city', 'arup_business', 'arup_subbusiness', 'arup_company', 'accountingcentre', 'opporigin', 'global_services','description'],
}

function ArupValidationErrorDialog(errors) {
    var errorEntities = [];
    var errorList = "";
    var conjunction = "";
    for (e in errors) {
        if (errors.hasOwnProperty(e)) {
            errorEntities.push(e);
            errorList += conjunction + e + "\r\n   " + errors[e].join("\r\n   ");
            conjunction = "\r\n";

        }
    }
    Xrm.Navigation.openErrorDialog({
        message: "Check value for: "  + errorEntities.join(", "),
        details: errorList,
        title: "Validation error(s)s in " + errorEntities.join(", ")
    });
}

function validateField(htmlElement) {
    oppWizLog("Validating Field " + htmlElement.id);
    var hasErrors = ValidateHtmlElement(htmlElement);
    if (hasErrors) oppWizLog("Field " + htmlElement.id + " has errors");
    setError(htmlElement, hasErrors);
}

var Arup_validations =
{
    intorext: function() {
        var o = new ArupFieldConfig("Internal or External", "ccrm_arupinternal", "intorext");

        o.hasErrors = function() {
            if ($('input[name="intorext"]:checked').length > 0) {
                return false;
            } else {
                return "One of Internal or External must be selected";
            }

        };
        o.value = function() {
            return $('input[name="intorext"]:checked')[0].value == "INT";
        };
        o.setDefault = function() {
            $("input[name=intorext][value=NOTINT]")[0].checked = true;
        };
        return o;
    }(),

    opportunityType: function() {
        var o = new ArupFieldConfig("Opportunity Type", "arup_opportunitytype", "opportunityType");
        o.hasErrors = function checkSelected() {
            var target = this.htmlNode();
            return !!target && !!target.value ? false : "Please select Opportunity Type";
        }.bind(o);

        o.value = function(htmlNode) {
            var target = this.htmlNode();
            return target.value;
            //if (!htmlNode) htmlNode = $("#opportunityType")[0];
            //return htmlNode.value;
        }.bind(o);
        o.onchange = function(e) {
            onOpportunityTypeChange(e.target);

            // Set up for new framework/panel calloff type '03 - or existing Framwork '04
            var oppType = document.getElementById("opportunityType").value;
            var frameworkExists = document.getElementById("crmframeworkexists");
            var contractref = document.getElementById("contractagreementref");
            var frameworkrec = document.getElementById("crmframeworkrecord");
            switch (oppType) {
            case "770000003": // New Framework
                // CRM Framework record exists visible, set to no and disabled
                frameworkExists.parentNode.classList.remove("hidden");
                frameworkExists.checked = false;
                frameworkExists.disabled = true;
                // Procurement type set to Framework/Panel.. (2) and disabled
                Arup_validations.opportunityType.procTypeFramework(true);
                Arup_validations.crmframeworkexists.required = true;
                break;
            case "770000004": // Existing Framework
                // CRM Framework record exists visible, set to yes and enabled
                frameworkExists.parentNode.classList.remove("hidden");
                frameworkExists.checked = true;
                frameworkExists.disabled = false;
                // unlock procurement type
                Arup_validations.opportunityType.procTypeFramework(false);
                Arup_validations.crmframeworkexists.required = true;
                break;
            default:
                // Hide CRM Framework and Contract agreeement. Unlock procurement type
                frameworkExists.parentNode.classList.add("hidden");
                contractref.parentNode.classList.add("hidden");
                frameworkrec.parentNode.classList.add("hidden");
                Arup_validations.opportunityType.procTypeFramework(false);
                Arup_validations.contractagreementref.required = false;
                Arup_validations.crmframeworkrecord.required = false;
                Arup_validations.crmframeworkexists.required = false;
                break;
            }
            Arup_validations.crmframeworkexists.onchange();
            if (oppType == "770000001" || oppType == "770000002" || oppType == "770000006") {
                Arup_validations.relatedopportunity.required = true;
            }
        };
        o.procTypeFramework = function(enable) {
            var procType = document.getElementById("contractarrangement");
            if (enable) {
                // Add Framework option to list.
                procType.disabled = true;
                var opt = document.createElement('option');
                opt.value = 2;
                opt.innerHTML = "Framework/Panel Appointment/On-Call Agreement/Call-Off Order";
                procType.appendChild(opt);
                procType.value = 2;
            } else {
                // procType.value = undefined;
                procType.disabled = false;
                for (var i = procType.options.length - 1; i > 0; i--) {
                    if (procType.options[i].value == "2") {
                        procType.options.remove(i);
                    }
                }
            }
        }
        return o;
    }(),
    relatedopportunity: function() {
        var o = new ArupFieldConfig("Related Parent Opportunity",
            "ccrm_parentopportunityid_opportunity",
            "relatedopportunity");

        o.hasErrors =
            function checkSelected() {
                var htmlNode = this.htmlNode();
                ensureSelected(htmlNode);
                var oppoType = $("#opportunityType");
                ensureSelected(htmlNode);
                var oppType = oppoType[0].value;
                if (!htmlNode.value && (oppType == "770000001" || oppType == "770000002" || oppType == "770000006")) {
                    return "Related Parent Opportunity Required for extension of existing contract";
                }
                setError(htmlNode, false);
                return false;

                // Only needs to be selected for certain opportunity types.
            }.bind(o);
        o.required = false; // Will be set when opportunity type changes.
        o.valueId = function() {
            return $("#opportunities option[value='" + $('#relatedopportunity').val() + "']").attr("data-value");
        };
        o.value = function() {
            return "/opportunities(" +
                $("#opportunities option[value='" + $('#relatedopportunity').val() + "']").attr("data-value") +
                ")";
        };
        o.databind = true;
        o.autocomplete = function(htmlNode) {
            getClients(htmlNode);
        };
        var OPPTYPE_PROJECT_EXTENSION_NEW = "770000002";
        var OPPTYPE_PROJECT_EXTENSION_EXISTING = "770000001";
        var OPPTYPE_ARCH_COMP_TEAM_OPPO = "770000006";
        var INTERNAL_OPPORTUNITY = 1;
        o.oninput = function(c, _this) {
            debounce(300,
                function() {
                    var intOrExt = Arup_validations.intorext.value();
                    var opptype = Arup_validations.opportunityType.value();
                    if (intOrExt == _this.INTERNAL_OPPORTUNITY) {
                        switch (opptype) {
                        case _this.OPPTYPE_PROJECT_EXTENSION_NEW:
                            getOpportunitiesOpen(c.target);
                            break;
                        case _this.OPPTYPE_PROJECT_EXTENSION_EXISTING:
                            getOpportunitiesOpenWon(c.target);
                            break;
                        case _this.OPPTYPE_ARCH_COMP_TEAM_OPPO:
                            getOpportunitiesOpenWonArchMaster(c.target);
                            break;
                        default:
                            getOpportunitiesOpenWon(c.target);
                            break;
                        }
                    } else {
                        switch (opptype) {
                        case _this.OPPTYPE_PROJECT_EXTENSION_NEW:
                            getOpportunitiesOpenWon(c.target);
                            break;
                        case _this.OPPTYPE_PROJECT_EXTENSION_EXISTING:
                            getOpportunitiesWon(c.target);
                            break;
                        case _this.OPPTYPE_ARCH_COMP_TEAM_OPPO:
                            getOpportunitiesOpenWonArchMaster(c.target);
                            break;
                        default:
                            getOpportunitiesOpenWon(c.target);
                            break;
                        }
                    }
                }.bind(o));
        };
        o.onchange = function(e, _this) {
            oppWizLog("Onchange for related opportunity called");
            ensureSelected(e.target);
            var intOrExt = Arup_validations.intorext.value();
            if (intOrExt == _this.INTERNAL_OPPORTUNITY) {
                loadFromParent(_this,
                        [
                            'arup_business', 'arup_subbusiness', 'project_country', 'project_state',
                            'project_city',
                            'contractarrangement', 'client', 'endclient', 'leadSource', 'probProjProceeding',
                            'probOfWin'
                        ])
                    .then(function resolve() {
                        if (_this.required && !!_this.value()) {
                            //  e.target.disabled = true; // Do not disable parent opportunity field for now.
                        }
                    });
            } else {
                var opptype = Arup_validations.opportunityType.value();
                switch (opptype) {
                case _this.OPPTYPE_PROJECT_EXTENSION_NEW:
                    var fieldsToLoad = [
                        'arup_business', 'arup_subbusiness', 'description', 'ArupUniIa', 'project_country',
                        'project_state', 'project_city', 'confidential', 'client'
                    ];
                    var procurementType = $("#contractarrangement")[0].value;
                    var promise = loadFromParent(_this, fieldsToLoad, ['client']);
                    if (procurementType == 100000003) { // Project Extension -  Novation to D&C contractor
                        promise.then(
                            function resolve(result) {
                                // Set endclient from client.
                                debugger;
                                Arup_validations.endclient.setValue(
                                    result[Arup_validations.client.crmAttribute]);
                            });
                    };
                    break;
                case _this.OPPTYPE_PROJECT_EXTENSION_EXISTING:
                    loadFromParent(_this,
                        [
                            'arup_business', 'arup_subbusiness', 'description', 'ArupUniIa', 'project_country',
                            'project_state', 'project_city', 'confidential', 'client', 'arupsrole',
                            'contractarrangement',
                            'limitOfLiability', 'limitOfLiabilityAgreed', 'limitAmount', 'PIRequirement',
                            'PICurrency', 'LolCurrency', 'PILevelAmount'
                        ]);
                    break;
                case _this.OPPTYPE_ARCH_COMP_TEAM_OPPO:
                    loadFromParent(_this,
                        [
                            'arup_business', 'arup_subbusiness', 'description', 'ArupUniIa', 'project_country',
                            'project_state', 'project_city', 'confidential', 'arupsrole', 'contractarrangement',
                            'endclient'
                        ]);
                    break;
                }
            }

        }.bind(o);
        return o;
    }(),
    leadSource: function () {
        var o = new ArupFieldConfig("Lead Source", "ccrm_leadsource", "leadSource");
        o.hasErrors = function checkSelected() {
            var v = this.htmlNode();
            return !!v && !!v.value ? false : "Please select Lead Source";
        }.bind(o);
        o.value = function () {
            var target = this.htmlNode();
            return target.value;
        }.bind(o);
        return o;
    }(),
    crmframeworkexists: function () {
        var o = new ArupFieldConfig("CRM Framework Record Exists",
            "arup_isthereanexistingcrmframeworkrecord",
            "crmframeworkexists");
        o.required = false;
        o.onchange = function() {
            var frameworkExists = document.getElementById("crmframeworkexists");
            var contractref = document.getElementById("contractagreementref");
            var crmframeworkrec = document.getElementById("crmframeworkrecord");
            // contract agreement ref not vis and required.
            if (Arup_validations.crmframeworkexists.required) {
                if (frameworkExists.checked) {
                    // Hide contract agreement and show crm framework
                    contractref.parentNode.classList.add("hidden");
                    crmframeworkrec.parentNode.classList.remove("hidden");
                    Arup_validations.contractagreementref.required = false;
                    Arup_validations.crmframeworkrecord.required = true;
                } else {
                    // Show contract agreement and hide crm framework ref
                    contractref.parentNode.classList.remove("hidden");
                    crmframeworkrec.parentNode.classList.add("hidden");
                    Arup_validations.contractagreementref.required = true;
                    Arup_validations.crmframeworkrecord.required = false;
                }
            }
        }.bind(o);
        o.value = function() {
            var target = this.htmlNode();
            if (this.required) {
                return target.checked ? 1 : 0;
            }
            return undefined;
        }.bind(o);
        return o;
    }(),
    contractagreementref: function () {
        var o = new ArupFieldConfig("Contract Agreement Reference #", "ccrm_agreementnumber","contractagreementref");
        o.required = false;
        o.hasErrors = function() {
                var contractref = document.getElementById("contractagreementref");
                if (this.required && !contractref.value) {
                    return "Contract reference must be given.";
                }
                return false;
            }.bind(o),
            o.value = function(node) {
                if (Arup_validations.contractagreementref.required) {
                    return node.value;
                }
                return undefined;
            };
        return o;
    }(),
    crmframeworkrecord: function () {
        var o = new ArupFieldConfig("CRM Framework Rec", "arup_Framework", "crmframeworkrecord");
        o.required = false;
        hasErrors = function() {
            var frameworkRec = document.getElementById("crmframeworkrecord");
            if (this.required && !frameworkRec.value) {
                return "Framework record must be given.";
            }
            return false;
        }.bind(o);
        o.value = function() {
            if (Arup_validations.crmframeworkrecord.required) {
                return "/arup_frameworks(" +
                    $("#frameworkrecs option[value='" + $('#crmframeworkrecord').val() + "']").attr("data-value") +
                    ")";
            }
            return undefined;
        };
        o.databind = true;
        o.oninput = function (e) { getFrameworkRecs(e.target) };
        return o;
    }(),
    contractarrangement: function () {
        var o = new ArupFieldConfig("Project Procurement", "ccrm_contractarrangement", "contractarrangement");
        o.hasErrors =function checkSelected() {
                var v = document.getElementById("contractarrangement");
                return !!v && !!v.value ? false : "Please select Project Procurement Type";
            };
        o.onchange = function() {
            validateField($("#endclient")[0]);
            // TODO - load from paren
            oppWizLog("****** check contractarrangement -> related opportunity");
            //  Arup_validations.relatedopportunity.loadFieldsFromparent(e, Arup_validations.relatedopportunity);
        };
        o.value = function() {
            if (this.required) {
                return $("#contractagreementref").val();
            }
            return undefined;
        }.bind(o);
        return o;
    }(),
    client: function() {
        var o = new ArupFieldConfig("Client", "ccrm_client", "client");
        var unassignedId = "9c3b9071-4d46-e011-9aa7-78e7d1652028";
        o.hasErrors = function() {
            var target = this.htmlNode();
            this.ensureSelected();

            return false;
        }.bind(o);
        o.value = function() {
            var clientId = unassignedId;
            var clientName = $("#client").val();
            if (!!clientName) {
                var id = $("#clients option[value='" + clientName + "']").attr("data-value");
                if (!!id) {
                    clientId = id;
                }
            }
            return "/accounts(" + clientId + ")";
        };
        o.autocomplete = function(htmlNode) {
            getClients(htmlNode);
        };
        o.databind = true;
        o.oninput = function(e) { getClients(e.target, true) };
        o.onchange = function(e) {
            // Set the country of client reg from the client
        };
        return o;
    }(),
    endclient: function () {
        var o = new ArupFieldConfig("Ultimate/End Client", "ccrm_ultimateendclientid", "endclient");
        o.hasErrors = [
            function() {
                var target = this.htmlNode();
                var opportunityType = $("#opportunityType")[0].value;
                if (opportunityType == "770000005") { // Arhicehctural competition - master rec
                    // checkSelected(htmlNode);
                    if (!target.value) {
                        return "Ultimate Client value must be selected for this opportunity type";
                    }
                } else {
                    this.ensureSelected();
                }
                return false;
            }.bind(o),
            function() {
                var target = this.htmlNode();
                var procType = $("#contractarrangement")[0].value;
                if (!target.value &&
                (procType == "100000000" ||
                    procType == "1" ||
                    procType == "100000001" ||
                    procType == "3" ||
                    procType == "6")) {
                    setError(htmlNode);
                    return "Ultimate Client value must be selected for this project procurement type";
                }
                return false;
            }.bind(o)
        ];
        o.value = function() {
            if (!!$('#endclient').val()) {
                return "/accounts(" +
                    $("#endclients option[value='" + $('#endclient').val() + "']").attr("data-value") +
                    ")";
            } else {
                return undefined;
            }
        };
        o.autocomplete = function(htmlNode) {
                getClients(htmlNode);
            },
            o.oninput = function(e) { getClients(e.target, false) },
            o.setValue = function(v) {
                $('#endclient')[0].value = v;
            };
        return o;
    }(),
    project_name: function () {
        var o = new ArupFieldConfig("Project name","name","project_name");
        o.hasErrors = function checkSelected() {
            return !$("#project_name")[0].value ? "Project name missing" : false;
        };
        o.value = function(htmlNode) {
            return $("#project_name")[0].value;
        };
        return o;
    }(),
    project_country: function() {
        var o = new ArupFieldConfig("Project Country", "ccrm_projectlocationid", "project_country");
        o.hasErrors = function() {
            var htmlNode = this.htmlNode();
            // if (!!htmlNode) htmlNode = $("#project_country")[0];
            this.ensureSelected(htmlNode);
            if (!htmlNode.value) {
                return "Project country must be selected";
            } else
                return false;
        };
        //autocomplete: function (htmlNode) {
        //    getCountries(htmlNode);
        //},
        o.value = function(htmlNode) {
            return "/ccrm_countries(" +
                $("#countries option[value='" + $('#project_country').val() + "']").attr("data-value") +
                ")";;
        };
        var countryChanged = function() {
            getStates();
            // get ccrm_riskrating from ccrm_country and set to ccrm_countrycategory
            Arup_validations.country_category.val =
                $("#countries option[value='" + $('#project_country').val() + "']").attr("risk-rating");
            Arup_validations.arup_company.checkForIndiaCompanyList(this.htmlNode2.value);
        }.bind(o);
        o.onchange = function(e, _this) {
            countryChanged();
        };
        o.oninput = function(e) {
            getCountries(e.target,
                (function fill(result) {
                    if (document.activeElement != this.htmlNode2) {
                        // Field no longer has focus, so autofill with first match
                        this.ensureSelected();
                        if (!this.isErrored()) {
                            countryChanged();
                        }
                    }
                }).bind(o));
        };
        return o;
    }(),
    project_state: function() {
        var o = new ArupFieldConfig("Project State", "ccrm_arupusstateid", "project_state");
        o.hasErrors = function() {
            var target = this.htmlNode();
            if (target.list.options.length == 0) return false; // No states to select from
            this.ensureSelected();
            if (!target.value) {
                return "Project state must be selected";
            } else
                return false;
        }.bind(o);
        o.valueName = function() { this.value }.bind(o);
        o.valueId = function() {
            return $("#states option[value='" + this.valueName() + "']")
                .attr("data-value");
        }.bind(o);
        o.value = function() {
            var target = this.htmlNode();
        var state = this.valueName();
        if (!state) return undefined;
        var stateId = this.valueId();
        if (!stateId) return undefined;
        return "/ccrm_arupusstates(" + stateId + ")";
    }.bind(o);
        o.onchange = function(e) {
            var companyId = $("#states option[value='" + e.target.value + "']").attr("company-id-value");
            var country = $("#project_country").val();
            if (country == "United States of America" || country == "Canada") {
                // Set company from state if available.
                if (companyId != null) {
                    $("#arup_company")[0].value = $("#companies option[data-value='" + companyId + "']").attr('value');
                }
            }
        }.bind(o);
        return o;
    }(),
    project_city: function () {
        var o = new ArupFieldConfig("Project city", "ccrm_location", "peroject_city");
        o.hasErrors = function checkSelected(htmlNode) {
            return !$("#project_city")[0].value ? "Project City missing" : false;
        };
        o.value = function() {
            return $("#project_city")[0].value;
        };
        return o;
    }(),
        arup_business: function () {
            var o = new ArupFieldConfig("Arup Business", "ccrm_arupbusinessid", "arup_business");
            o.hasErrors = function(htmlNode) {
                if (!!htmlNode) htmlNode = $("#arup_business")[0];
                ensureSelected(htmlNode);
                if (!htmlNode.value) {
                    return "Arup Business must be selected";
                } else
                    return false;
            };
        o.valueName=function(target) {
            if (!target) target = $("#arup_business")[0];
            return target.value;
        };
        o.value = function(target, _this) {
            return "/ccrm_arupbusinesses(" +
                $("#businesses option[value='" + _this.valueName(target) + "']").attr("data-value") +
                ")";
        }
        o.onfocus = function(e) { getBusinesses(e.target) };
        o.onfocusout = function(e) {
            ensureSelected(e.target);
            getSubBusinesses(e.target);
        };
        o.onchange = function(e, _this) {
            Arup_validations.K12.checkK12Status(e, _this);
        };
        return o;
        }(),
    arup_subbusiness: function () {
        var o = new ArupFieldConfig("Arup Sub Business", "arup_subbusiness", "arup_subbusiness");
        o.hasErrors = function() {
            var target = this.htmlNode();
            this.ensureSelected();
            if (!target.value) {
                return "Arup Sub Business must be selected";
            } else
                return false;
        }.bind(o);
        o.value = function() {
            return "/arup_subbusinesses(" +
                $("#subbusinesses option[value='" + $('#arup_subbusiness').val() + "']").attr("data-value") +
                ")";
        };
        o.databind= true;
        return o;
    }(),


    arup_company: function() {
        var o = new ArupFieldConfig("Arup Company", "ccrm_arupcompanyid", "arup_company");
        o.setDefault = new function() {
            getCompanies(function(result) {
                getUserData(function(result) {
                    if (result.hasOwnProperty("ccrm_arupcompanyid")) {
                        var target = this.htmlNode();
                        target.value = result["ccrm_arupcompanyid"]["ccrm_name"];
                        // Ensure that the company is valid (not necessarily guaranteed)
                        if (!this.hasErrors()) {
                            getAccountingCentres()
                                .then(function() {
                                    Arup_validations.accountingcentre.setDefault();
                                });
                        };
                    } else {
                        oppWizLog("** User data did not contain arup company");
                    }
                }.bind(o));

            })
        };
        var indiaCompanyList = []; // Both set from getUserCompany() on load
        var globalCompanyList = [];
        o.hasErrors = function() {
            var htmlNode = this.htmlNode();
            this.ensureSelected(htmlNode);
            if (!htmlNode.value) {
                return "Arup Company must be selected";
            } else
                return false;
        };
        o.value = function() {
            return "/ccrm_arupcompanies(" +
                $("#companies option[value='" + $('#arup_company').val() + "']").attr("data-value") +
                ")";
        };
        o.onchange = function(e) {
            var target = this.htmlNode();
            oppWizLog("Getting accounting centres for " + $('#arup_company').val());
            getAccountingCentres(target);
            // Set arup_region from company.
            debugger;
            Arup_validations.arup_region.val =
                $("#companies option[value='" + $('#arup_company').val() + "']").attr("data-regionid");
            Arup_validations.K12.checkK12Status();
        };
        o.checkForIndiaCompanyList = function(country) {
            var companyList = this.htmlNode2.list;
            if (country === "India") {
                companyList.innerHTML = this.indiaCompanyList;
            } else {
                companyList.innerHTML = this.globalCompanyList;
            }
            this.ensureSelected();
        };
        o.onfocus = function(e) {
            if (this.isErrored()) {
                this.htmlNode().value = null;
                this.setError(false);
            }
        }
        return o;
    }(),
    accountingcentre: function() {
        var o = new ArupFieldConfig("Accounting Centre", "ccrm_accountingcentreid", "accountingcentre");
        o.setDefault = function() {
            getUserData(function(result) {
                if (result.hasOwnProperty("ccrm_accountingcentreid")) {
                    var target = this.htmlNode2();
                    target.value = result["ccrm_accountingcentreid"]["ccrm_name"];
                    var htmlNode = document.getElementById('accountingcentre');
                    Arup_validations.accountingcentre.hasErrors(htmlNode);
                } else {
                    oppWizLog("** User data did not contain arup accounting centre");
                }
            }.bind(o));
        };
        o.hasErrors = function() {
            var htmlNode = this.htmlNode();
            this.ensureSelected();
            if (!htmlNode.value) {
                return "Accounting centre must be selected";
            } else
                return false;
        }.bind(o);
        o.value = function() {
            return "/ccrm_arupaccountingcodes(" +
                this.valueId() +
                ")";
        };
        o.valueId = function() {
            return $("#accountingcentres option[value='" + $('#accountingcentre').val() + "']").attr("data-value");
        };
        o.currentAccountingCentre = null;
        o.setOptions = function(results) {
            results = Array.isArray(results) ? results : [results];
            var acc = "";
            for (var i = 0; i < results.length; i++) {
                var ccrm_arupaccountingcodeid = results[i]["ccrm_arupaccountingcodeid"];
                var ccrm_name = results[i]["ccrm_name"];

                acc += '<option value="' +
                    ccrm_name +
                    '" data-value="' +
                    ccrm_arupaccountingcodeid +
                    '" > ' +
                    ccrm_name +
                    '</option > ';
            }
            this.htmlNode().list.innerHTML = acc;
        };
        o.onchange = function(e) {
            debugger;
            // Validate accounting centre and fill in any dependencies.
            if (!this.currentAccountingCentre ||
                !!this.currentAccountingCentre && this.currentAccountingCentre !== e.target.value) {
                ValidateAccountingCentre(this, this.valueId(), e.target).then(function() {
                        this.currentAccountingCentre = e.target.value;
                    })
                    .then(function() {
                        Arup_validations.K12.checkK12Status(e, this);
                    });
            }
        };
        o.onfocus = function(e) {
            if (this.isErrored()) {
                this.htmlNode().value = null;
                this.setError(false);
            }
        };
        return o;
    }(),
    opporigin: function () {
        var o = new ArupFieldConfig("Opportunity Originator", "ccrm_leadoriginator", "opporigin");
        o.hasErrors = function() {
            var target = this.htmlNode();
            this.ensureSelected();
            if (!target.value) {
                return "Accounting centre must be selected";
            } else
                return false;
        }.bind(o);
        o.value = function(target) {
            return "/systemusers(" + $("#users option[value='" + $('#opporigin').val() + "']").attr("data-value") + ")";
        };
        o.databind = true;
        o.setDefault = function() {
            getUserData(function(userData) {
                var target = this.htmlNode();
                var fullname = userData["fullname"];
                var systemuserid = userData["systemuserid"];
                target.value = fullname;
                target.list.innerHTML = '<option value="' +
                    fullname +
                    '" data-value="' +
                    systemuserid +
                    '" > ' +
                    fullname +
                    '</option > ';
                oppWizLog("retrieved opportunity originator user " + fullname);
            }.bind(o));
        };
        o.oninput = function (e) { getUsers(e.target) };
        return o;
    }(),
    globalservices: function () {
        var o = new ArupFieldConfig("Global Services", "arup_globalservices", "globalservices");// Multiselect
        o.value = function() {
            var globalServices = [];
            document.querySelectorAll("#WC [name='global_services']:checked").forEach(
                function(s) {
                    if (s.value != "770000000") // Not applicable.
                        globalServices.push(s.value);
                });
            return globalServices.join(",");
        };
        return o;
    }(),

    customerCopy: function (){
        // This is a hidden field - set from client when we save.pa
        var o = new ArupFieldConfig("Customer (Copy)", "customerid_account");
        o.value = function() {
                return Arup_validations.client.value();
            },
            o.databind = true;
        return o;
    }(),
    shortTitle: function(){
        // This is a hidden field - set from client when we save.
        var o = new ArupFieldConfig("Short Title", "ccrm_shorttitle");
        o.value = function() {
            return Arup_validations.project_name.value().substring(0, 30);
        };
        return o;
    }(),
    CountryOfClientReg: function() {
        // This is a hidden field - set from client when we save.
        var o = new ArupFieldConfig("Country of Client Reg","ccrm_countryofclientregistrationid");
        o.value = function(htmlNode, _this) {
            // Should be set from Account ccrm_countryofclientregistrationid 
            var client = $('#client').val();
            if (!client || client == "Unassigned") return undefined;
            var regCountryId = $("#clients option[value='" + client + "']").attr("country-reg-id");
            if (!regCountryId) return undefined;
            return "/accounts(" + regCountryId + ")";
        }.bind(o);
        return o;
    }(),
    parentPractice: function () {
        // This is a hidden field - set from CRM on load and not displayed to user.
        var o = new ArupFieldConfig("Parent Practice", "ccrm_practice","parentPractice");
        setDefault = function() {
            getUserData(function(result) {
                if (result.hasOwnProperty("ccrm_accountingcentreid")) {
                    this.val = result["ccrm_accountingcentreid"]["ccrm_practice"];
                } else {
                    oppWizLog("** User data did not contain practice code name");
                }
            }.bind(o));
        };
        return o;
    }(),
    parentPracticeCode: function(){
        // This is a hidden field - set from CRM on load and not displayed to user.
        var o = new ArupFieldConfig("Parent Practice Code", "ccrm_practicecode");
        o.setDefault = function() {
            getUserData(function(result) {
                if (result.hasOwnProperty("ccrm_accountingcentreid")) {
                    this.val = result["ccrm_accountingcentreid"]["ccrm_practicecode"];
                } else {
                    oppWizLog("** User data did not contain practice");
                }
            }.bind(o));
        };
        return o;
    }(),
    subPractice:  function() {
        // This is a hidden field - set from CRM on load and not displayed to user.
        var o = new ArupFieldConfig("Sub Practice", "ccrm_subpractice");
        o.setDefault = function(target) {
            getUserData(function(result) {
                if (result.hasOwnProperty("ccrm_accountingcentreid")) {
                    this.val = result["ccrm_accountingcentreid"]["ccrm_practice"];
                } else {
                    oppWizLog("** User data did not contain practice code name");
                }
            }.bind(o));
        };
        return o;
    }(),
    subPracticeCode:  new ArupFieldConfig("Sub Practice Code", "ccrm_subpracticecode"),
    arup_group: function () {
        // This is a hidden field - set from CRM on load and not displayed to user.
        var o = new ArupFieldConfig("Arup Group", "ccrm_arupgroup");
        o.setDefault = function(target) {
            getUserData(function(result) {
                if (result.hasOwnProperty("ccrm_accountingcentreid")) {
                    this.val = result["ccrm_accountingcentreid"]["ccrm_arupgroup"];
                } else {
                    oppWizLog("** User data did not contain arup group");
                }
            }.bind(o));
        };
        return o;
    }(),
    arup_region: function() {
        var o = new ArupFieldConfig("Arup region", "ccrm_arupregionid");
        // This is a hidden field - set from CRM on load and not displayed to user.
        o.value = function() {
            return "/ccrm_arupregions(" + this.val + ")";
        }.bind(o);

        o.setDefault = function() {
            getUserData(function(result) {
                if (result.hasOwnProperty("ccrm_arupcompanyid")) {
                    this.val = result["ccrm_arupcompanyid"]["_ccrm_arupregionid_value"];
                } else {
                    oppWizLog("** User data did not contain arup region");
                }
            }.bind(o));
        };
        return o;
    }(),
        arup_group_code: function () {
          var  o = new ArupFieldConfig("Arup Group Code", "ccrm_arupgroupcode");
            o.setDefault = function(target) {
                getUserData(function(result) {
                    if (result.hasOwnProperty("ccrm_accountingcentreid")) {
                        this.val = result["ccrm_accountingcentreid"]["ccrm_arupgroupcode"];
                    } else {
                        oppWizLog("** User data did not contain arup group code");
                    }
                });
            };
                return o;
            }(),
// This is a hidden field - set from CRM on load and not displayed to user.
    //    name: "Arup Group Code",
    //    value: function(target, _this) { return _this.val },
    //    crmAttribute: "ccrm_arupgroupcode",
    //    setDefault: function(target) {
    //        getUserData(function(result) {
    //            if (result.hasOwnProperty("ccrm_accountingcentreid")) {
    //                this.val = result["ccrm_accountingcentreid"]["ccrm_arupgroupcode"];
    //            } else {
    //                oppWizLog("** User data did not contain arup group code");
    //            }
    //        });
    //    },
    //    val: undefined, // Set dynamically from default or on change of accoutning code.
    //},
    arup_group_id: new ArupFieldConfigLookup("Arup Group Id", "ccrm_arupgroupid",null,"ccrm_arupgroups"),
    //    {
    //    name: "Arup Group Id",
    //    crmAttribute: "ccrm_arupgroupid",
    //    val: undefined, // Set dynamically from Accounting centre
    //    value: function(target, _this) { return "/ccrm_arupgroups(" + _this.val + ")" },
    //},
    K12: function () {
        var o = new ArupFieldConfig("Is it K-12 school?", "arup_k12school","K12");
        o.value = function () {
            var target = this.htmlNode();
            if (! this.isHidden()) {
                return target.checked ? 770000001 : 770000002;
            }
            return undefined;
        };
        var AmericasRegion = "29caaa4f-d139-e011-9cf6-78e7d16510d0";
        var checkK12Required = function() {
            // Needs to be Americas region (29caaa4f-d139-e011-9cf6-78e7d16510d0) and Business area=Education 
            var region = Arup_validations.arup_region.val;
            var business = Arup_validations.arup_business.valueName();
            oppWizLog("region = " + region);
            oppWizLog("business = " + business);
            if (region === AmericasRegion && 
                business === "Education") {
                this.hide( false);
            } else {
                this.hide( );
            }
        }.bind(o);

        o.checkK12Status = function(e, source) {
            return checkK12Required();
        };
        return o;
    }(),
    valid_accounting_centre: new ArupFieldConfigAlwaysTrue("Valid Accounting Centre", "ccrm_validaccountingcentre"),
    valid_contact: new ArupFieldConfigAlwaysTrue("Valid Contact", "ccrm_validcontact"),
    show_pjn: new ArupFieldConfigAlwaysTrue("Show PJN Button","ccrm_showpjnbutton"),

    country_category: new ArupFieldConfig("Country Category Code", "ccrm_countrycategory"),
    probProjProceeding: new ArupFieldConfig("Probability of Project Proceeding", "ccrm_probabilityofprojectproceeding"),
    probOfWin: new ArupFieldConfig("Probability of Win", "closeprobability"),
    ArupUniIa: new ArupFieldConfig("Arup University/IiA Research Initiative","ccrm_arupuniversityiiaresearchinitiative"),
    confidential: new ArupFieldConfig("Confidential Opportunity", "ccrm_confidential"),
    arupsrole: new ArupFieldConfig("Arup's Role in Project", "ccrm_arups_role_in_project"),
    limitOfLiability: new ArupFieldConfig("Limit of Liability?","ccrm_contractlimitofliability"),
    limitOfLiabilityAgreed: new ArupFieldConfig("Limit of Liability Agreed?","ccrm_limitofliabilityagreement"),
    limitAmount: new ArupFieldConfig("Limit of Liability Amount", "ccrm_limitamount_num"),
    PIRequirement: new ArupFieldConfig("PI Requirement", "ccrm_pirequirement"),
    PICurrency: new ArupFieldConfig("PI Currency", "ccrm_pi_transactioncurrencyid"),
    LolCurrency: new ArupFieldConfig("Lol Currency","ccrm_limit_transactioncurrencyid"),
    PILevelAmount: new ArupFieldConfig("PI Level Amount","ccrm_pilevelmoney_num"),
    description: new ArupFieldConfig("Description", "description"),
    template: function () {
        var o = new ArupFieldConfig("Opportunity Type", "arup_opportunitytype", "template");

        o.setDefault = function() {
                // Set default for target HtmlNode
            }.bind(o),
            o.hasErrors = function checkSelected(htmlNode) {
                // Either a single function or an array of functions returning
                // either an error string or false (if there is no error);
            }.bind(o);
        // name: "Opportunity Type", // user friendly name for field in ArupFieldConfig constructor above
        //o.value = function(htmlNode) {
        //    // Return the value of the field - default implementation is available in ArupFieldConfig
        //};
        // crmAttribute: "arup_opportunitytype", // Crm attribute tha this field maps to. Provided in ArupFieldConfig constructor above.
        o.databind = true; // databinding normally goes by "id" at the end of the attribute name. This can be overriden by this field.
        o.setValue = function(value, result) {
            // Optional function called to set the value of this field (i.e. when populated form parent.)
        };
        o.onchange =
            function(event,
                _this) { // Any attribute with an on* prefix will be set up as an event handler on the parent element.
                // Event is the triggering event -the Html element is normallyevent.target
                // _this is the current config/validation element - Arup_validations.template in this case.
            }.bind(o);
        return o;
    }(),
}

