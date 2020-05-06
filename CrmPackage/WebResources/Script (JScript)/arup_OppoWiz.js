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
var proctypeOptions = "";
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
            selected = [];
            $('#UR input:checked').each(function () {
                selected.push($(this).attr('value'));
            });
            if (selected.length < 1) {
                // alert("Please select atleast one role to proceed or you can exit if you choose to.");
                Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                    '<font size="3" color="#000000"></br>Please select atleast one role to proceed or you can exit if you choose to.</font>',
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
            else {
                //GET THE SUBSCRIPTIONS FROM JSON static Strings -- Step 2 : MS events selection
                //For each selected role populate the appropriate tables.
                // createTables(step);
                $('input:checkbox').removeAttr('checked');

                //attachEventHandlers();

                return true;
            }
        }

        else {
            //Step 2 - display of the selected fields.
            if (step == 2) {
                selected = [];
                $('#SS select').each(function () {
                    if ($(this).val() != "") {
                        selected.push($(this).val());
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
                else {
                    return true;
                }
            }
            if (step == 3) {
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
                else {
                    return true;
                }
            }
        }
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

            $("#leadSource1").hide();
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
            leadsourceOptions = $("#leadSource1").html();
            $("#leadSource1").hide();
        }

        if (step == 3) {
            var opptype = $("#opportunityType").val();
            proctypeOptions = $("#contractarrangement1").html();
            $("#contractarrangement1").hide();

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

        if (step == 4) {
            //btnConfirm.show();
            btnCancel.show();
            btnNext.hide();
            getUserCompany();
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
        //if (!validateBack(step, steps[step - 1])) {
        //    return;
        //};
        //Back from Opportunity Basic Details.. Destroy the page before leaving.
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
                debugger;
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

                //Xrm.Page.getAttribute(“Fieldname”).setValue(Result.OutputParameter);
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
function onOpportunityTypeChange(type) {
    leadSource = $("#leadSource");
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

function getCountries(input) {
    var num = input.length;
    if (num >= 3) {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            url: Xrm.Page.context.getClientUrl() + "/api/data/v8.2/ccrm_countries?$select=ccrm_arupcountrycode,ccrm_name&$filter=" + encodeURIComponent("statuscode eq 1 and ") + "contains(ccrm_name,'" + input + "')" + "&$orderby=ccrm_name asc",
            beforeSend: function (XMLHttpRequest) {
                XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                XMLHttpRequest.setRequestHeader("Accept", "application/json");
                XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
            },
            async: true,
            success: function (data, textStatus, xhr) {
                var results = data;
                var countries = "";
                for (var i = 0; i < results.value.length; i++) {
                    var ccrm_arupcountrycode = results.value[i]["ccrm_arupcountrycode"];
                    var ccrm_name = results.value[i]["ccrm_name"];
                    var ccrm_countryid = results.value[i]["ccrm_countryid"];
                    countries += '<option value="' + ccrm_name + '" data-value="' + ccrm_countryid + '" > ' + ccrm_arupcountrycode + " - " + ccrm_name + '</option > ';
                }
                document.getElementById('countries').innerHTML = countries;
            },
            error: restQueryErrorDialog("Unable to get countryList")
            });
    }
}

function getStates() {
    var input = $("#countries option[value='" + $('#project_country').val() + "']").attr("data-value");
    if (input === undefined) return; // Autocompletion can cause this.
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: Xrm.Page.context.getClientUrl() + "/api/data/v8.2/ccrm_arupusstates?$select=ccrm_arupusstatecode,ccrm_arupusstateid,ccrm_name,ccrm_usstatecode,statecode&$filter=_ccrm_countryid_value" + encodeURIComponent(" eq ") + input + "&$orderby=ccrm_name asc",
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
            XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        },
        async: true,
        success: function (data, textStatus, xhr) {
            var results = data;
            var states = "";
            for (var i = 0; i < results.value.length; i++) {
               // var ccrm_arupusstatecode = results.value[i]["ccrm_arupusstatecode"];
                var ccrm_arupusstateid = results.value[i]["ccrm_arupusstateid"];
                var ccrm_name = results.value[i]["ccrm_name"];
                var ccrm_usstatecode = results.value[i]["ccrm_usstatecode"];
                var statecode = results.value[i]["statecode"];
                var statecode_formatted = results.value[i]["statecode@OData.Community.Display.V1.FormattedValue"];

                states += '<option value="' + ccrm_name + '" data-value="' + ccrm_arupusstateid + '" > ' + ccrm_usstatecode + " - " + ccrm_name + '</option > ';
            }
            document.getElementById('states').innerHTML = states;
        },
        error: restQueryErrorDialog("Unable to get States List")
    });
}

function getBusinesses() {
    if (onceload) {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            url: Xrm.Page.context.getClientUrl() + "/api/data/v8.2/ccrm_arupbusinesses?$select=ccrm_arupbusinesscode,ccrm_arupbusinessid,_ccrm_arupmarketid_value,ccrm_name&$filter=statuscode" + encodeURIComponent(" eq 1") + "&$orderby=ccrm_name asc",
            beforeSend: function (XMLHttpRequest) {
                XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                XMLHttpRequest.setRequestHeader("Accept", "application/json");
                XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
            },
            async: true,
            success: function (data, textStatus, xhr) {
                var results = data;
                var businesses = "";
                for (var i = 0; i < results.value.length; i++) {
                    var ccrm_arupbusinesscode = results.value[i]["ccrm_arupbusinesscode"];
                    var ccrm_arupbusinessid = results.value[i]["ccrm_arupbusinessid"];
                    var _ccrm_arupmarketid_value = results.value[i]["_ccrm_arupmarketid_value"];
                    var _ccrm_arupmarketid_value_formatted = results.value[i]["_ccrm_arupmarketid_value@OData.Community.Display.V1.FormattedValue"];
                    var _ccrm_arupmarketid_value_lookuplogicalname = results.value[i]["_ccrm_arupmarketid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                    var ccrm_name = results.value[i]["ccrm_name"];

                    businesses += '<option value="' + ccrm_name + '" data-value="' + ccrm_arupbusinessid + '" > ' + ccrm_name + " - " + ccrm_arupbusinesscode + "[" + _ccrm_arupmarketid_value_formatted +"]"+ '</option > ';
                }
                document.getElementById('businesses').innerHTML = businesses;
                onceload = false;
            },
            error: restQueryErrorDialog("Unable to get Arup business list")
        });
    }
}

function getSubBusinesses() {
    var input = $("#businesses option[value='" + $('#arup_business').val() + "']").attr("data-value");
    if (input === undefined) return;
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: Xrm.Page.context.getClientUrl() + "/api/data/v8.2/arup_subbusinesses?$select=arup_name,arup_subbusinessid,statecode,statuscode&$filter=_arup_business_value" + encodeURIComponent(" eq " + input + " and statuscode eq 1") + "&$orderby=arup_name asc",
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
            XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        },
        async: true,
        success: function (data, textStatus, xhr) {
            var results = data;
            var subbusinesses = "";
            for (var i = 0; i < results.value.length; i++) {
                var arup_name = results.value[i]["arup_name"];
                var arup_subbusinessid = results.value[i]["arup_subbusinessid"];
                var statecode = results.value[i]["statecode"];
                var statecode_formatted = results.value[i]["statecode@OData.Community.Display.V1.FormattedValue"];
                var statuscode = results.value[i]["statuscode"];
                subbusinesses += '<option value="' + arup_name + '" data-value="' + arup_subbusinessid + '" > ' + arup_name + '</option > ';
            }
            document.getElementById('subbusinesses').innerHTML = subbusinesses;
        },
        error: restQueryErrorDialog("Unable to get Arup sub-business list")
    });

}

function getUserCompany() {

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: Xrm.Page.context.getClientUrl() + "/api/data/v8.2/ccrm_arupcompanies?$select=ccrm_acccentrelookupcode,ccrm_arupcompanycode,ccrm_arupcompanyid,ccrm_name&$filter=statuscode" + encodeURIComponent(" eq 1") + "&$orderby=ccrm_name asc",
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
            XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        },
        async: true,
        success: function (data, textStatus, xhr) {
            var results = data;
            var companies = "";
            for (var i = 0; i < results.value.length; i++) {
                var ccrm_acccentrelookupcode = results.value[i]["ccrm_acccentrelookupcode"];
                var ccrm_arupcompanycode = results.value[i]["ccrm_arupcompanycode"];
                var ccrm_arupcompanyid = results.value[i]["ccrm_arupcompanyid"];
                var ccrm_name = results.value[i]["ccrm_name"];
                companies += '<option value="' + ccrm_name + '" data-value="' + ccrm_arupcompanyid + '" data-accvalue="' + ccrm_acccentrelookupcode + '" > ' + ccrm_arupcompanycode + " - " + ccrm_name + '</option > ';
            }
            document.getElementById('companies').innerHTML = companies;
        },
        error: restQueryErrorDialog("Unable to get Arup Companies list")
    });

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: Xrm.Page.context.getClientUrl() + "/api/data/v8.2/systemusers(" + Xrm.Page.context.getUserId().replace(/[{}]/g, "") +")?$select=_ccrm_arupcompanyid_value,ccrm_staffid,fullname,systemuserid",
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
            XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        },
        async: true,
        success: function (data, textStatus, xhr) {
            var results = data;
            var _ccrm_arupcompanyid_value = results["_ccrm_arupcompanyid_value"];
            var _ccrm_arupcompanyid_value_formatted = results["_ccrm_arupcompanyid_value@OData.Community.Display.V1.FormattedValue"];
            var _ccrm_arupcompanyid_value_lookuplogicalname = results["_ccrm_arupcompanyid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
            var fullname = results["fullname"];
            var systemuserid = results["systemuserid"];
            document.getElementById("arup_company").value = _ccrm_arupcompanyid_value_formatted;
            document.getElementById('users').innerHTML = '<option value="' + fullname + '" data-value="' + systemuserid + '" > ' + fullname + '</option > ';
            document.getElementById("opporigin").value = fullname;
        },
        error: restQueryErrorDialog("Unable to get User list")
    });
}

function getAccountingCentres() {
    var input = $("#companies option[value='" + $('#arup_company').val() + "']").attr("data-accvalue");
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: Xrm.Page.context.getClientUrl() + "/api/data/v8.2/ccrm_arupaccountingcodes?$select=ccrm_arupaccountingcodeid,ccrm_arupcompanycode,ccrm_name&$filter=ccrm_arupcompanycode" + encodeURIComponent(" eq '" + input + "' and  statuscode eq 1 " + "&$orderby=ccrm_name asc"),
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
            XMLHttpRequest.setRequestHeader("OData-Version", "4.0");''
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\",odata.maxpagesize=50");
        },
        async: true,
        success: function (data, textStatus, xhr) {
            var results = data;
            var acc = "";
            for (var i = 0; i < results.value.length; i++) {
                var ccrm_arupaccountingcodeid = results.value[i]["ccrm_arupaccountingcodeid"];
                var ccrm_arupcompanycode = results.value[i]["ccrm_arupcompanycode"];
                var ccrm_name = results.value[i]["ccrm_name"];

                acc += '<option value="' + ccrm_name + '" data-value="' + ccrm_arupaccountingcodeid + '" > ' + ccrm_name + '</option > ';
            }
            document.getElementById('accountingcentres').innerHTML = acc;
        },
        error: restQueryErrorDialog("Unable to get Accounting Centre list")
    });
}

function getClients(input, flag) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: Xrm.Page.context.getClientUrl() + "/api/data/v8.2/accounts?$select=accountid,name,address1_city&$filter=contains(name,'" + encodeURIComponent(input) + "')" + encodeURIComponent(" and statecode eq 1") + "&$orderby=name asc,address1_city asc",
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
            XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\",odata.maxpagesize=50");
        },
        async: true,
        success: function (data, textStatus, xhr) {
            var results = data;
            if (flag)
                var clients = "";
            else
                var endclients = "";

            for (var i = 0; i < results.value.length; i++) {
                var accountid = results.value[i]["accountid"];
                var name = results.value[i]["name"];
                var city = results.value[i]["address1_city"];
                if (flag)
                    clients += '<option value="' + name + '" data-value="' + accountid + '" > ' + name + ' - ' +  city + '</option > ';
                else
                    endclients += '<option value="' + name + '" data-value="' + accountid + '" > ' + name + ' - ' + city +'</option > ';
            }
            if (flag)
                document.getElementById('clients').innerHTML = clients;
            else
                document.getElementById('endclients').innerHTML = endclients;
        },
        error: restQueryErrorDialog("Unable to get client list")
    });
}

function getUsers(input) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: Xrm.Page.context.getClientUrl() + "/api/data/v8.2/systemusers?$select=ccrm_staffid,fullname,systemuserid&$filter=contains(fullname,'" + encodeURIComponent(input) + "')" + encodeURIComponent(" and  isdisabled eq false") + "&$orderby=fullname asc",
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
            XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\",odata.maxpagesize=50");
        },
        async: true,
        success: function (data, textStatus, xhr) {
            var results = data;
            var users = "";
            for (var i = 0; i < results.value.length; i++) {
                var ccrm_staffid = results.value[i]["ccrm_staffid"];
                var fullname = results.value[i]["fullname"];
                var systemuserid = results.value[i]["systemuserid"];
                users += '<option value="' + fullname + '" data-value="' + systemuserid + '" > ' + fullname + '</option > ';
            }
            document.getElementById('users').innerHTML = users;
        },
        error: restQueryErrorDialog("Unable to get User list")
    });
}

function saveOpportunity() 
{
    var attrs = getAttributes();
    return CreateOpportunity(attrs);
}

function getAttributes() {
    var attrs = {};
    attrs.name = $("#project_name").val();
    attrs.arup_opportunitytype = $("#opportunityType").val();
    attrs.ccrm_parentopportunityid = $("#opportunities option[value='" + $('#relatedopportunity').val() + "']").attr("data-value");
 
    attrs.ccrm_leadsource = $("#leadSource").val();
    attrs.ccrm_contractarrangement = $("#contractarrangement").val();

    attrs["ccrm_projectlocationid@odata.bind"] = "/ccrm_countries(" +  $("#countries option[value='" + $('#project_country').val() + "']").attr("data-value") + ")";
    attrs["ccrm_arupusstateid@odata.bind"] = "/ccrm_arupusstates(" + $("#states option[value='" + $('#project_state').val() + "']").attr("data-value") + ")";
    attrs.ccrm_location = $("#project_city").val();
    attrs["ccrm_arupbusinessid@odata.bind"]= "/ccrm_arupbusinesses(" + $("#businesses option[value='" + $('#arup_business').val() + "']").attr("data-value") + ")";
    attrs["arup_subbusiness@odata.bind"] = "/arup_subbusinesses(" +$("#subbusinesses option[value='" + $('#arup_subbusiness').val() + "']").attr("data-value") + ")";
    attrs["ccrm_arupcompanyid@odata.bind"] = "/ccrm_arupcompanies(" + $("#companies option[value='" + $('#arup_company').val() + "']").attr("data-value") + ")";
    attrs["ccrm_accountingcentreid@odata.bind"] = "/ccrm_arupaccountingcodes(" + $("#accountingcentres option[value='" + $('#accountingcentre').val() + "']").attr("data-value") + ")";
    attrs["ccrm_client@odata.bind"] =  "/accounts(" +  $("#clients option[value='" + $('#client').val() + "']").attr("data-value") + ")";
    attrs["ccrm_ultimateendclientid@odata.bind"] = "/accounts(" + $("#endclients option[value='" + $('#endclient').val() + "']").attr("data-value") + ")";
    attrs["ccrm_leadoriginator@odata.bind"] = "/systemusers(" + $("#users option[value='" + $('#opporigin').val() + "']").attr("data-value") + ")";
    var globalServices = [];
    document.querySelectorAll("#WC [name='global_services[]']:checked").forEach(
        function (s) {
            if (s.value != "770000000") // Not applicable.
                globalServices.push(s.value);
        });
    attrs.arup_globalservices = globalServices.join(",");
    attrs.description = $("#description").val();
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
                    debugger;
                    if (result.entities.length != 1) {
                        reject(
                            { message: "CreateOpportunity Userid not defined in Arup Interface Settings" }
                        );
                        return;
                    }
                    impersonateUserId = result.entities[0].ccrm_setting;
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

function restQueryErrorDialog(message) {
    return function (xhr, textStatus, errorThrown) {
        var errorDetail = {
            details: message + (!!url ? "\r\nQuery: " + url : "") + "\r\n" +   xhr.responseJSON.error.message,
            errorCode: xhr.status,
            message: message
    }
        Xrm.Navigation.openErrorDialog(errorDetail);
    }
}

// Fix issue with error generated by CRM framework in NPSTelemetry.js.
window.Xrm.Page.getUrl = parent.Xrm.page.getClientUrl;
