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
var proctype = $("#contractarrangement");
var onceload = true;

(function (doc, win, add, remove, loaded, load) {
    doc.ready = new Promise(function (resolve) {
        if (doc.readyState === 'complete') {
            resolve();
        } else {
            function onReady() {
                resolve();
                doc[remove](loaded, onReady, true);
                win[remove](load, onReady, true);
            }
            doc[add](loaded, onReady, true);
            win[add](load, onReady, true);
        }
    });
})(document, window, 'addEventListener', 'removeEventListener', 'DOMContentLoaded', 'load');

var loaded = null;
var AllLoaded = function () {
    if (loaded == null) {
        loaded = new Promise(function (resolve, reject) {
            $(window).on('load',
                function () {
                    oppWizLog("All Loaded");
                    resolve("loaded");
                });
        });
    }
    return loaded; // Promise that all files have been loaded.
}

function WizardStepsPanel(divId, buttonDiv, containerDiv, stepPanelClass, config) {
    this.divName = divId;
    this.divButtons = buttonDiv;
    this.currentStep = 0;
    this.container = document.querySelector(containerDiv);
    this.steps = this.container.querySelectorAll(stepPanelClass);
    this.div = document.getElementById(divId);
    if (!this.div) throw Error("Unable to find root element for Wizard Steps Panel: " + divId);
    this.config = config;
    var steps = this.config.steps;
    if (!steps) throw new Error("No Steps were specified");
    this.div.classList.add("steps-quantity-" + steps.length);
    for (var s = 0; s < steps.length; s++) {
        var stepConfig = steps[s];
        var c = document.createElement("div");
        c.classList.add("step-number", "step-" + (s + 1));
        c.innerHTML = '<div class="number" id="num' + (s + 1 ) +
            '"><img src = arup_' + (s+1) + ' alt="MI" title="' + stepConfig.name + '"></div><h5><b><font color=' +
            stepConfig.colour + '>' + stepConfig.name + '</font></b></h5>';
        this.div.append(c);
         stepConfig.div = c;
    }
    this.StepTo(0);
    this.DisplayButtons();
}
WizardStepsPanel.prototype.StepTo = function (stepNum) {
    var currentStep = this.config.steps[this.currentStep];
    if (typeof (currentStep.onLeave) === "function") currentStep.onLeave();
    currentStep.div.classList.remove("doing");
    currentStep.div.classList.add("done");
    this.currentStep = stepNum;
    var nextStep = this.config.steps[stepNum];
    nextStep.div.classList.add("doing");
}
WizardStepsPanel.prototype.StepNext = function () {
    this.StepTo(this.currentStep + 1);
}
WizardStepsPanel.prototype.StepBack = function () {
    this.StepTo(this.currentStep - 1);
}
WizardStepsPanel.prototype.DisplayButtons = function() {
    var buttonDiv = document.getElementById(this.divButtons);
    if (!buttonDiv) throw new Error("Button location not defined :" + this.divButtons);
    buttonDiv.innerHTML = "";
    var buttons = this.config.steps[this.currentStep].buttons;
    var panel = this;
    for (var i = 0; i < buttons.length; i++) {
        var buttonName = buttons[i];
        var buttonConfig = this.config.buttons[buttonName];
        var commandConfig = this.config.commands[buttonConfig.action];
        var newButton = document.createElement('button');
        newButton.classList.add('btn', 'btn-default', 'wizard-button-' + buttonName);
        newButton.innerText = buttonConfig.label;
        newButton.command = commandConfig;
        newButton.addEventListener('click',
            function(e) {
                this.command.apply(panel, e);
            });
        buttonDiv.appendChild(newButton);
    };
}
WizardStepsPanel.prototype.Validate = function () {
    var page = "page" + (this.currentStep+1);
    var errors = ArupPageHasErrors(page);
    if (errors) {
        ArupValidationErrorDialog(errors);
    }
    return !errors;
}
WizardStepsPanel.prototype.ShowCurrentStep = function() {
    $(this.steps).hide();
    $(this.steps[this.currentStep]).show();
    var nextStep = this.config.steps[this.currentStep];
    if (typeof (nextStep.onEnter) === "function") nextStep.onEnter();
}
var wizardStepsPanel;
document.ready.then(function() {
    wizardStepsPanel = new WizardStepsPanel("wizard-steps-panel", "wizard-buttons", ".wizard-content",".wizard-step",
        { steps : [
            {
                name: "Start<br/>&nbsp;",
                colour: "#B2D135",
                onEnter: function () {
                    document.getElementById("external").focus();
                },
                buttons: ['cancel','next' ]
            },
            {
                name: "Opportunity <br/> Details 1",
                colour: "#56BDEA",
                onEnter: function () {
                    Arup_validations.opportunityType.focus();
                },
                buttons: ['back', 'cancel', 'next' ]
            },
            {
                name: "Opportunity <br/> Details 2",
                colour: "#FC5781",
                onEnter: function() {
                    Arup_validations.contractarrangement.setDependentFieldValues();
                    Arup_validations.contractarrangement.focus();
                },
                buttons: ['back', 'cancel', 'next']
            },
            {
                name: "<br>Remaining Details",
                colour: "#FFCD31",
                onEnter: function() {
                    Arup_validations.project_country.focus();
                },
                buttons: ['back','cancel', 'finish']
            }
        ],
            buttons : {
                cancel : { label: "Cancel", action: 'exit' },
                next: { label: "Next", action: 'next' },
                back: { label: "Back", action: 'back' },
                finish : { label: "Finish", action: 'save' },
            },
            commands: {
                exit: function (e) {
                    var pageInput = { pageType: "entitylist", entityName: "opportunity" };
                    Xrm.Navigation.navigateTo(pageInput).catch(function() {
                        throw new Error("Unable to navigate back to opportunity list")
                    });
                },
                next: function(e) {
                    if (!this.Validate()) {
                        return;
                    };
                    // Move next
                    this.StepNext();
                    this.ShowCurrentStep();
                    this.DisplayButtons();
                },
                back: function () {
                    this.StepBack();
                    this.ShowCurrentStep();
                    this.DisplayButtons();
                },
                save: function () {
                    ArupValidateAll().then(
                        function () {
                            saveOpportunity().then(
                                function (result) {
                                    Xrm.Utility.closeProgressIndicator();
                                        // Navigate to new opportunity
                                        var pageInput = {
                                            pageType: "entityrecord",
                                            entityName: "opportunity",
                                            entityId: result.newEntityid,
                                        };
                                        Xrm.Navigation.navigateTo(pageInput);
                                    //});
                                },
                                function (errorDetail) {
                                    Xrm.Utility.closeProgressIndicator();
                                    Xrm.Navigation.openErrorDialog(errorDetail);
                                });
                            Xrm.Utility.showProgressIndicator("Creating Opportunity");
                        },
                        function (errors) {
                            ArupValidationErrorDialog(errors);

                        }
                    );
                },
            }

        });
});

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
                            control.readonly = true;
                            Arup_validations.project_state.hide(true, "invisible");
                        } else {
                            control.readonly = false;
                            Arup_validations.project_state.hide(false, "invisible");
                            setError(control, false);
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

// Use companyPromise to ensure that we only need to fetch company data once in an asynchronous way so that it is available when needed.
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
                var formattedCompanyCode = ccrm_arupcompanycode.length <= 4
                    ? "____".substr(0, 4 - ccrm_arupcompanycode.length) + ccrm_arupcompanycode
                    : ccrm_arupcompanycode;
                var option = '<option value="' +
                    ccrm_name +
                    '" data-value="' +
                    ccrm_arupcompanyid +
                    '" data-accvalue="' +
                    ccrm_acccentrelookupcode +
                    '" data-regionid="' + 
                    ccrm_arupregionid +
                    '" > ' +
                    formattedCompanyCode +
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
            control.innerHTML = companies;
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
    return new Promise(function(resolve, reject) {
        AllLoaded().then(function() {
            var targetEntity = "systemusers(" + parent.Xrm.Page.context.getUserId().replace(/[{}]/g, "") + ")";
            var userDataQuery =
                "$select=_ccrm_arupcompanyid_value,ccrm_staffid,fullname,_ccrm_arupofficeid_value,systemuserid&" +
                    "$expand=ccrm_accountingcentreid($select=ccrm_arupaccountingcode,ccrm_arupaccountingcodeid,ccrm_arupcompanycode,ccrm_arupgroup,ccrm_arupgroupcode,ccrm_name,ccrm_practice," +
                    "ccrm_practicecode,ccrm_subpractice,ccrm_subpracticecode,statecode,statuscode),ccrm_arupcompanyid($select=ccrm_arupcompanyid,ccrm_name,statecode,statuscode,_ccrm_arupregionid_value)";
            FetchCRMData(targetEntity, userDataQuery, null, 0)
                .then(
                    function receive(results) {
                        oppWizLog("Got User Data");
                        resolve(results);
                    },
                    restQueryErrorDialog("Getting initial user data"));
        });
    });
}();

function getUserData(receive) {
    // get data for current user - using Promise to ensure efficient async operation.
    // This will succeed whether or not the underlying webApi call has completed when this function is called.
    userDataPromise.then(receive);
}

function getAccountingCentres() {
    var input = Arup_validations.arup_company.selectedAttribute("data-accvalue");
    if (input != undefined);
    var control = $("#accountingcentre")[0];
    control.value = "";
    var p = FetchCRMData("ccrm_arupaccountingcodes",
            "$select=ccrm_arupaccountingcodeid,ccrm_arupcompanycode,ccrm_name&$filter=ccrm_arupcompanycode" +
            encodeURIComponent(" eq '" + input + "' and  statuscode eq 1 ") +
            "&$orderby=ccrm_name asc",
            control,0)
        .then(function success(results) {
            Arup_validations.accountingcentre.setOptions( results.value);
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
            oppWizLog("Got Accounting centre Data");
            Arup_validations.arup_group.val = result['_ccrm_arupgroupid_value@OData.Community.Display.V1.FormattedValue'];
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
            "') and statecode eq 0 &$orderby=name    asc")}
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
                    "$select=arup_name,arup_frameworkid,arup_region,_arup_client_value&$filter=contains(arup_name,'" +
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
           // oppWizLog("field is " + name);
            var val = field.value();
            if (typeof(val) !== "undefined" && val !== "" ) attrs[name + bind] = val;
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
        parent.Xrm.WebApi.retrieveMultipleRecords("ccrm_arupinterfacesetting",
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
    if (!_this || !_this.valueId || !_this.valueId()) return new Promise(function() {});
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
                field.setValue( value, result);
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
    var p2 = AllLoaded().then(function() {
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
            })
            .catch(function reject(error) {
                oppWizLog("Error in FetchCRM Data " + error);
                oppWizLog("For entity name : " + entityName + " select : " + select);
                if (!!error && !!error.responseJSON) {
                    oppWizLog(" message from server : " + error.responseJSON.message );
                }
                debugger;
            });
        promise.catch(function() { oppWizLog("FetchCRMData failed on " + url) });
        promise.always(function() { !!target && target.classList.remove("waiting-for-crm") });
        if (!!target) target.classList.add("waiting-for-crm");

        return promise;
    });
    return p2;
}

function restQueryErrorDialog(message, url, reject) {
    return function (xhr, textStatus, errorThrown) {
        oppWizLog("Error handler called");
        debugger;
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

var oppWizLog = console.log.bind(window.console);
//function oppWizLog(message) {
//    console.log(message);
//}

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
                var result = hasError.call(validation);
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
        if (typeof Arup_validations[v].setDefault === "function") {
            Arup_validations[v].setDefault();
        }
    }
}

var Arup_validationsByAttribute = {};

function Arup_createAttributeMap() {
    for (var v in Arup_validations) {
        if (Arup_validations.hasOwnProperty(v)) {
            var node = Arup_validations[v];
            if (typeof Arup_validationsByAttribute[node.crmAttribute] === "undefined") {
                Arup_validationsByAttribute[node.crmAttribute] = [];
            }
            Arup_validationsByAttribute[node.crmAttribute].push(node);
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

// base Class definition for configurations defined by ArupFieldConfig.
function ArupFieldConfig(name, crmAttribute, id) {
    this.name = name;
    this.crmAttribute = crmAttribute;
    this.crmAttributeCollection = crmAttribute + "s";
    this.id = id;
    $(document).ready((function () {
        this.htmlNode2 = document.getElementById(this.id);
    }).bind(this));
}

ArupFieldConfig.prototype.htmlNode = function () { return document.getElementById(this.id); }
ArupFieldConfig.prototype.setVal = function(value) { this.val = value };
ArupFieldConfig.prototype.value = function() { return this.val; };
ArupFieldConfig.prototype.focus= function () { this.htmlNode().focus(); };
ArupFieldConfig.prototype.isErrored = function() {
    return this.htmlNode().parentNode.classList.contains("has-error");
}
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

ArupFieldConfig.prototype.ensureSelected = function() {
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
    if (!targetval || !!targetval && !id ) {
        this.setError();
    } else {
        if (!!target) node.value = target.value;
        this.setError(false);
    }
}

ArupFieldConfig.prototype.hide = function(hideMe, className) {
    if (typeof (hideMe) === 'undefined') hideMe = true;
    if (typeof (className) === 'undefined') className = "hidden";
    var node = this.htmlNode();
    if (!node) return;
    if (hideMe) {
        node.parentNode.classList.add(className);
    } else {
        node.parentNode.classList.remove(className);
    }
}

ArupFieldConfig.prototype.isHidden = function() {
    var node = this.htmlNode();
    if (!node) return true;
    return node.parentNode.classList.contains("hidden") ||
        node.parentNode.classList.contains("invisible");
};
ArupFieldConfig.prototype.recordDefaultOptions = function ()
{
    // copy the default option list to a backup.
    this.defaultOptions = [];
    var opts = this.htmlNode().options;
    for (var i = 0; i < opts.length ; i++) {
        var opt = opts[i];
        this.defaultOptions.push({ value: opt.value, title: opt.title, text: opt.innerText });
    }
}
var recordDependentOptions = function (dependentOptionSets, result) {
    var depField = result["arup_dependentfieldname"];
    if (!dependentOptionSets[depField] ) dependentOptionSets[depField] = {};
    var depFieldSettings = dependentOptionSets[depField];
    var value = result["arup_dependentfieldvalue"];
    var isDefault = result["arup_isdependentfielddefaultvalue"];
    var isReadOnly = result["arup_isdependentfieldreadonly"];
    depFieldSettings[value] = { isDefault: isDefault, isReadOnly: isReadOnly };
};
ArupFieldConfig.prototype.updateDependentOptionSets = function(dependentOptionSets) {
    for (var attr in dependentOptionSets) {
        if (dependentOptionSets.hasOwnProperty(attr)) {
            // Get the default list of options for field "attr" and make sure that we only include the ones we want
            var defaultOpts = this.defaultOptions;
            var requiredOpts = dependentOptionSets[attr];
            var targets = Arup_validationsByAttribute[attr];
            for (var j = 0; j < targets.length; j++) {
                var target = targets[j];
                target.setError(false);
                var targetNode = target.htmlNode();
                targetNode.setAttribute("disabled", "false");
                var defaultOpts = target.defaultOptions;
                var onlyOneOption = (Object.keys(requiredOpts).length === 1);
                if (onlyOneOption) {
                    targetNode.setAttribute("disabled", onlyOneOption);
                } else {
                    targetNode.removeAttribute('disabled');
                }

                oppWizLog(" Setting " + Object.keys(requiredOpts).length + " options for " + attr);
                // Clear the current option list and add the ones we want.
                if (!!defaultOpts) {
                    targetNode.innerHTML = "";
                    for (var i = 0; i < defaultOpts.length; i++) {
                        var opt = defaultOpts[i];
                        if (!opt.value || !!requiredOpts[opt.value]) {
                            var newOpt = document.createElement("option");
                            newOpt.setAttribute("value", opt.value);
                            newOpt.setAttribute("title", opt.title);
                            if (opt.isReadOnly) {
                                targetNode.setAttribute("disabled", "true");
                                oppWizLog("Setting Readonly on " + attr + " " + opt.value);
                            }
                            if (opt.isDefault || (onlyOneOption && !!opt.value)) {
                                newOpt.setAttribute("selected", "true");
                                oppWizLog("Setting Default on " + attr + " " + opt.value);
                            }
                            newOpt.innerHTML = opt.text;
                            targetNode.options.add(newOpt);
                        }
                    }
                } else {
                    oppWizLog("No default options defined for " + attr);
                }
            }
        }
    }
};
var setDependentField = function (result) {
    var attribute = result["arup_dependentfieldname"];
    var value = result["arup_dependentfieldvalue"];
    var node = Arup_validationsByAttribute[attribute];
    if (!!attribute && !!node) {
        for (var i = 0; i < node.length; i++) {
            node[i].setVal(value);
        }
    } else {
        oppWizLog("!! no dependent value found for " + this.crmAttribute);
    }
};
ArupFieldConfig.prototype.setDependentFieldValues = function() {
    FetchCRMData("arup_crmfieldconfigurations",
            "$select=arup_dependentfieldvalue,arup_dependentfieldname,arup_isdependentoptionset,arup_isdependentfielddefaultvalue,arup_isdependentfieldreadonly&" +
            "$filter=arup_mainoptionsetfieldname eq '" +
            this.crmAttribute +
            "' and  arup_mainoptionsetfieldvalue eq '" +
            this.value() +
            "' and arup_entityname eq 'opportunity'")
        .then(function resolve(results) {
                $(".dependentField").val(""); // Clear any dependent fields.
                oppWizLog("Retrieved " + results.value.length + " dependent field values");
                var dependentOptionSets = {};
                for (var i = 0; i < results.value.length; i++) {
                    var dependentOptionSet = results.value[i]["arup_isdependentoptionset"];
                    if (dependentOptionSet) {
                        recordDependentOptions(dependentOptionSets, results.value[i]);
                    } else {
                        setDependentField(results.value[i]);
                    }
            }
                this.updateDependentOptionSets(dependentOptionSets);
            }.bind(this),
            restQueryErrorDialog("unable to get dependent data"));
};


// Field configuration that always returns true
function ArupFieldConfigAlwaysTrue(name, crmAttribute, id) {
    ArupFieldConfig.call(this, name, crmAttribute, id);
}
ArupFieldConfigAlwaysTrue.prototype = new ArupFieldConfig();
ArupFieldConfigAlwaysTrue.prototype.value = function () { return true; };


function ArupFieldConfigAlwaysFalse(name, crmAttribute, id) {
    ArupFieldConfig.call(this, name, crmAttribute, id);
}
ArupFieldConfigAlwaysFalse.prototype = new ArupFieldConfig();
ArupFieldConfigAlwaysFalse.prototype.value = function () { return false; };

function ArupFieldConfigTextRequired(name, crmAttribute, id) {
    ArupFieldConfig.call(this, name, crmAttribute, id);
}

ArupFieldConfigTextRequired.prototype = new ArupFieldConfig();
ArupFieldConfigTextRequired.prototype.hasErrors = function () {
    var empty = !this.value();
    var visible = !this.isHidden();
    return visible && empty ? name + " is required" :  false;
}
ArupFieldConfigTextRequired.prototype.value = function() {
    return this.htmlNode().value;
}

function ArupFieldConfigLookup(name, crmAttribute, id, collectionname) {
    ArupFieldConfig.call(this, name, crmAttribute, id);
    this.collectionname = collectionname || !!crmAttribute ? crmAttribute.replace(/id$/,"s") : undefined;
}
ArupFieldConfigLookup.prototype = new ArupFieldConfig();
ArupFieldConfigLookup.prototype.value = function() { return "/" + this.collectionname + "(" + this.val + ")" };

// This is intended for a value read from the user record that needs to be saved with the opportunity (but not edited by the user in any way)
function ArupFieldConfigLookupFromUser(name, crmAttribute, id, collectionname, sysUserAttribute, extendField) {
    ArupFieldConfigLookup.call(this, name, crmAttribute, id, collectionname);
    this.userAttribute = sysUserAttribute || crmAttribute.endsWith("id") ? "_" + crmAttribute + "_value" : crmAttribute;
    this.extendField = extendField;
}
ArupFieldConfigLookupFromUser.prototype = new ArupFieldConfigLookup();
ArupFieldConfigLookupFromUser.prototype.setDefault = function () {
    getUserData(function (result) {
        if (result.hasOwnProperty(this.userAttribute)) {
            // Attribute directly on system user
            this.val = result[this.userAttribute];
        } else {
            if (result.hasOwnProperty(this.extendField)) {
                // Attribute accessed by an extend() clause in the query
                this.val = result[this.extendField][this.userAttribute];
            } else {
                oppWizLog("** User data did not contain " + name + "/" + this.userAttribute+ " / " + this.extendField);
            }
        }
    }.bind(this));
}


function ArupFieldConfigReadOnlyText(name, crmAttribute, id) {
    ArupFieldConfig.call(this, name, crmAttribute, id);
};
ArupFieldConfigReadOnlyText.prototype = new ArupFieldConfig();
ArupFieldConfigReadOnlyText.prototype.setVal = function (value) {
    var node = this.htmlNode();
    if (!!node) node.value = value;
};
ArupFieldConfigReadOnlyText.prototype.value = function() { return; };

function ArupFieldConfigText(name, crmAttribute, id) {
    ArupFieldConfig.call(this, name, crmAttribute, id);
};
ArupFieldConfigText.prototype = new ArupFieldConfigReadOnlyText();
ArupFieldConfigText.prototype.value = function () {
    return this.htmlNode().value;
};


function ArupFieldConfigOptionList( name, crmAttribute, id) {
    ArupFieldConfig.call(this, name, crmAttribute, id);
};
ArupFieldConfigOptionList.prototype = new ArupFieldConfig();
ArupFieldConfigOptionList.prototype.selectedOption = function () {
    var target = this.htmlNode();
    var selected = target.selectedOptions;
    if (!selected) return document.createElement("option");
    return selected[0];
};
ArupFieldConfigOptionList.prototype.selectedAttribute = function(attributeName) {
    var selected = this.selectedOption();
    return selected.getAttribute(attributeName);
};
ArupFieldConfigOptionList.prototype.selectedId = function () {
    return this.selectedAttribute("data-value");
}
ArupFieldConfigOptionList.prototype.isSelected = function () {
    var target = this.htmlNode();
    var selected = target.selectedOptions;
    return (!!selected);
}
ArupFieldConfigOptionList.prototype.setVal = function (value) {
    var target = this.htmlNode();
    target.value = value;
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
                            f.call(validation, e);
                        }
                    );
                }
            }
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
    page1: ['intorext', 'project_name', 'opporigin' ],
    page2: ['opportunityType', 'relatedopportunity', 'leadSource', 'crmframeworkexists', 'contractagreementref','crmframeworkrecord'],
    page3: ['contractarrangement', 'client', 'endclient'],
    page4: ['project_country', 'project_state', 'project_city', 'arup_business', 'arup_subbusiness', 'arup_company', 'accountingcentre',  'global_services','description'],
}

function ArupPage(name, id) {
    this.name = name;
    this.id = id;
}
var Arup_pages = {
    page1: ['intorext', 'project_name', 'opporigin'],
    page2: ['opportunityType', 'relatedopportunity', 'leadSource', 'crmframeworkexists', 'contractagreementref', 'crmframeworkrecord'],
    page3: ['contractarrangement', 'client', 'endclient'],
    page4: ['project_country', 'project_state', 'project_city', 'arup_business', 'arup_subbusiness', 'arup_company', 'accountingcentre', 'global_services', 'globalservices_other','description'],
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
        o.setDefault = function () {
            $("input[name=intorext][value=NOTINT]")[0].checked = true;
            this.setDependentFieldValues();
        };
        $(document).ready(function() {
            $("input[name=intorext]").on('click',
                function click() {
                    // Update supporting text fields.
                    this.setDependentFieldValues();
                }.bind(o));
        });
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
            //    onOpportunityTypeChange(e.target);
            this.setDependentFieldValues();

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
                Arup_validations.crmframeworkexists.required = true;
                break;
            case "770000004": // Existing Framework
                // CRM Framework record exists visible, set to yes and enabled
                frameworkExists.parentNode.classList.remove("hidden");
                frameworkExists.checked = true;
                frameworkExists.disabled = false;
                // unlock procurement type
                Arup_validations.crmframeworkexists.required = true;
                break;
            default:
                // Hide CRM Framework and Contract agreeement. Unlock procurement type
                frameworkExists.parentNode.classList.add("hidden");
                contractref.parentNode.classList.add("hidden");
                frameworkrec.parentNode.classList.add("hidden");
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

        return o;
    }(),
    relatedopportunity: function() {
        var o = new ArupFieldConfig("Related Parent Opportunity",
            "ccrm_parentopportunityid_opportunity",
            "relatedopportunity");

        o.hasErrors =
            function checkSelected() {
                var htmlNode = this.htmlNode();
                this.ensureSelected();
                var oppoType = $("#opportunityType");
                this.ensureSelected();
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

        var OPPTYPE_PROJECT_EXTENSION_NEW = "770000002";
        var OPPTYPE_PROJECT_EXTENSION_EXISTING = "770000001";
        var OPPTYPE_ARCH_COMP_TEAM_OPPO = "770000006";
        var INTERNAL_OPPORTUNITY = 1;
        o.oninput = function(c) {
            debounce(300,
                function() {
                    var intOrExt = Arup_validations.intorext.value();
                    var opptype = Arup_validations.opportunityType.value();
                    if (intOrExt == INTERNAL_OPPORTUNITY) {
                        switch (opptype) {
                        case OPPTYPE_PROJECT_EXTENSION_NEW:
                            getOpportunitiesOpen(c.target);
                            break;
                        case OPPTYPE_PROJECT_EXTENSION_EXISTING:
                            getOpportunitiesOpenWon(c.target);
                            break;
                        case OPPTYPE_ARCH_COMP_TEAM_OPPO:
                            getOpportunitiesOpenWonArchMaster(c.target);
                            break;
                        default:
                            getOpportunitiesOpenWon(c.target);
                            break;
                        }
                    } else {
                        switch (opptype) {
                        case OPPTYPE_PROJECT_EXTENSION_NEW:
                            getOpportunitiesOpenWon(c.target);
                            break;
                        case OPPTYPE_PROJECT_EXTENSION_EXISTING:
                            getOpportunitiesWon(c.target);
                            break;
                        case OPPTYPE_ARCH_COMP_TEAM_OPPO:
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
            this.ensureSelected(e.target);
            var intOrExt = Arup_validations.intorext.value();
            if (intOrExt == INTERNAL_OPPORTUNITY) {
                loadFromParent(_this,
                        [
                            'arup_business', 'arup_subbusiness', 'project_country', 'project_state',
                            'project_city',
                            'contractarrangement', 'client', 'endclient', 'leadSource', 'probProjProceeding',
                            'probOfWin'
                        ])
                    .then(function resolve() {
                        if (this.required && !!this.value()) {
                            //  e.target.disabled = true; // Do not disable parent opportunity field for now.
                        }
                    }.bind(o));
            } else {
                var opptype = Arup_validations.opportunityType.value();
                switch (opptype) {
                case OPPTYPE_PROJECT_EXTENSION_NEW:
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
                                Arup_validations.endclient.setValue(
                                    result[Arup_validations.client.crmAttribute]);
                            });
                    };
                    break;
                case OPPTYPE_PROJECT_EXTENSION_EXISTING:
                    loadFromParent(_this,
                        [
                            'arup_business', 'arup_subbusiness', 'description', 'ArupUniIa', 'project_country',
                            'project_state', 'project_city', 'confidential', 'client', 'arupsrole',
                            'contractarrangement',
                            'limitOfLiability', 'limitOfLiabilityAgreed', 'limitAmount', 'PIRequirement',
                            'PICurrency', 'LolCurrency', 'PILevelAmount'
                        ]);
                    break;
                case OPPTYPE_ARCH_COMP_TEAM_OPPO:
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
    leadSource: function() {
        var o = new ArupFieldConfig("Lead Source", "ccrm_leadsource", "leadSource");
        o.hasErrors = function checkSelected() {
            var v = this.htmlNode();
            return !!v && !!v.value ? false : "Please select Lead Source";
        }.bind(o);
        o.value = function() {
            var target = this.htmlNode();
            return target.value;
        }.bind(o);
        o.setDefault = function() {
            this.recordDefaultOptions();
        }
        return o;
    }(),
    crmframeworkexists: function() {
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
    contractagreementref: function() {
        var o = new ArupFieldConfig("Contract Agreement Reference #", "ccrm_agreementnumber", "contractagreementref");
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
    crmframeworkrecord: function() {
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
        o.oninput = function(e) { getFrameworkRecs(e.target) };
        return o;
    }(),
    contractarrangement: function() {
        var o = new ArupFieldConfig("Project Procurement", "ccrm_contractarrangement", "contractarrangement");
        o.hasErrors = function checkSelected() {
            var v = document.getElementById("contractarrangement");
            return !!v && !!v.value ? false : "Please select Project Procurement Type";
        };
        o.onchange = function() {
            validateField($("#endclient")[0]);
            this.setDependentFieldValues();
        };
        o.value = function() {
            return this.htmlNode().value;
        }.bind(o);
        o.setDefault = function() {
            this.recordDefaultOptions();
        }
        return o;
    }(),
    client: function() {
        var o = new ArupFieldConfig("Client", "ccrm_client", "client");
        var unassignedId = "9c3b9071-4d46-e011-9aa7-78e7d1652028";
        o.hasErrors = function() {
            var target = this.htmlNode();
            this.ensureSelected();
            if (this.isErrored() && target.value != "") {
                return "Specify client";
            }
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
        o.databind = true;
        o.oninput = function(e) { getClients(e.target, true) };
        o.onchange = function(e) {
            // Set the country of client reg from the client
        };
        return o;
    }(),
    endclient: function() {
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
                    this.setError();
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
        o.oninput = function(e) { getClients(e.target, false) };
        o.setValue = function(v) {
            $('#endclient')[0].value = v;
        };
        return o;
    }(),
    project_name: function() {
        var o = new ArupFieldConfig("Project name", "name", "project_name");
        o.hasErrors = function checkSelected() {
            return !$("#project_name")[0].value ? "Project name missing" : false;
        };
        o.value = function() {
            return $("#project_name")[0].value;
        };
        o.onfocusout = function() {
            // Set project name in title
            document.getElementById("projectNameTitle").innerHTML = "Project: " + this.value();
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
        o.onfocusout = function() { countryChanged(); };
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
            if (!target.value && target.list.options.length === 0) return false; // No states to select from
//            this.ensureSelected();
            if (!target.value) {
                return "Project state must be selected";
            } else
                return false;
        }.bind(o);
        o.valueName = function() { return this.htmlNode().value; }.bind(o);
        o.valueId = function() {
            return $("#states option[value='" + this.valueName() + "']")
                .attr("data-value");
        }.bind(o);
        o.value = function() {
            var stateId = this.valueId();
            if (!stateId) return undefined;
            return "/ccrm_arupusstates(" + stateId + ")";
        }.bind(o);
        var updateDependencies = function() {
            var companyId = $("#states option[value='" + this.htmlNode().value + "']").attr("company-id-value");
            var country = $("#project_country").val().toLowerCase();
            if (country == "united states of america" || country == "canada") {
                // Set company from state if available.
                if (companyId != null) {
                    var option =
                        Arup_validations.arup_company.htmlNode2.querySelector("option[data-value='" + companyId + "']");
                    Arup_validations.arup_company.setVal(option.value);
                    Arup_validations.arup_company.oninput();
                }
            }
        }.bind(o);
        o.onchange = function (e) {
            oppWizLog("Changing arup_state to " + this.value());
            updateDependencies();
        }.bind(o);

        o.onfocusout = function() {
            var target = this.htmlNode();
            if (!target.value) {
                var v = target.list.options[0];
                if (!!v) {
                    target.value = v.value;
                    this.setError(false);
                } else {
                    setError();
                }
            } else {
                this.ensureSelected();
            }
            if (!this.isErrored()) updateDependencies();
        }.bind(o);
        return o;
    }(),
    project_city: function() {
        var o = new ArupFieldConfig("Project city", "ccrm_location", "peroject_city");
        o.hasErrors = function checkSelected(htmlNode) {
            return !$("#project_city")[0].value ? "Project City missing" : false;
        };
        o.value = function() {
            return $("#project_city")[0].value;
        };
        return o;
    }(),
    arup_business: function() {
        var o = new ArupFieldConfig("Arup Business", "ccrm_arupbusinessid", "arup_business");
        o.hasErrors = function() {
            var target = this.htmlNode();
            this.ensureSelected(target);
            if (!target.value) {
                return "Arup Business must be selected";
            } else
                return false;
        }.bind(o);
        o.valueName = function() {
            var target = this.htmlNode();
            return target.value;
        };
        o.value = function() {
            return "/ccrm_arupbusinesses(" +
                $("#businesses option[value='" + this.valueName() + "']").attr("data-value") +
                ")";
        }
        o.onfocus = function(e) {
            if (this.isErrored()) {
                this.htmlNode().value = null;
                this.setError(false);
            }
            getBusinesses(e.target);
        }

        o.onfocusout = function(e) {
            this.ensureSelected();
            getSubBusinesses(e.target);
        };
        o.onchange = function(e, _this) {
            Arup_validations.K12.checkK12Status(e, _this);
        };
        return o;
    }(),
    arup_subbusiness: function() {
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
        o.onfocus = function(e) {
            if (this.isErrored()) {
                this.htmlNode().value = null;
                this.setError(false);
            }
        };
        o.onfocusout = function(e) {
            this.ensureSelected();
        };
        o.databind = true;
        return o;
    }(),


    arup_company: function() {
        var o = new ArupFieldConfigOptionList("Arup Company", "ccrm_arupcompanyid", "arup_company");
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
                                    Arup_validations.accountingcentre.setDefault2();
                                });
                        };
                    } else {
                        oppWizLog("** User data did not contain arup company");
                    }
                }.bind(o));

            });
        };
        o.indiaCompanyList = []; // Both set from getUserCompany() on load
        o.globalCompanyList = [];
        o.hasErrors = function() {
            if (!this.isSelected()) {
                return "Arup Company must be selected";
            } else
                return false;
        };
        o.value = function() {
            return "/ccrm_arupcompanies(" + this.selectedId() + ")";
        };

        o.oninput = function (e) {
            var selected = this.selectedOption();
            if (!selected) {
                oppWizLog("Arup Company - no value selected");
                return;
            }
            oppWizLog("Getting accounting centres for " + selected.value + " - " + selected.getAttribute('data-value'));
            if (!selected.value) return;
            getAccountingCentres();
            Arup_validations.arup_region.val = this.selectedAttribute("data-regionid");
            Arup_validations.K12.checkK12Status();
        };
        o.onchange = function(e) {
            debugger;
        }

        o.checkForIndiaCompanyList = function (country) {
            var company = this.htmlNode2;
            var currentSelection = company.value;
            if (country === "India") {
                company.innerHTML = this.indiaCompanyList;
                this.htmlNode2.value = null;
            } else {
                company.innerHTML = this.globalCompanyList;
            }
            company.value = currentSelection;
        };
        return o;
    }(),
    accountingcentre: function() {
        var o = new ArupFieldConfigOptionList("Accounting Centre", "ccrm_accountingcentreid", "accountingcentre");
        o.setDefault2 = function() { // Called from arup_company after accounting centre list is loaded.
            getUserData(function(result) {
                if (result.hasOwnProperty("ccrm_accountingcentreid")) {
                    var target = this.htmlNode();
                    target.value = result["ccrm_accountingcentreid"]["ccrm_name"];
                    this.hasErrors();
                } else {
                    oppWizLog("** User data did not contain arup accounting centre");
                }
            }.bind(o));
        };
        o.hasErrors = function() {
            if (!this.isSelected()) {
                return "Accounting centre must be selected";
            } else
                return false;
        }.bind(o);
        o.value = function() {
            return "/ccrm_arupaccountingcodes(" +
                this.selectedId() +
                ")";
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
            this.htmlNode().innerHTML = acc;
        };
        o.onchange = function(e) {
            // Validate accounting centre and fill in any dependencies.
            if (!this.currentAccountingCentre ||
                !!this.currentAccountingCentre && this.currentAccountingCentre !== e.target.value) {
                ValidateAccountingCentre(this, this.selectedId(), e.target).then(function() {
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
    opporigin: function() {
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
        o.oninput = function(e) { getUsers(e.target) };
        return o;
    }(),
    globalservices: function() {
        var o = new ArupFieldConfig("Global Services", "arup_globalservices", "global_services"); // Multiselect
        o.hasErrors = function() {
            var nodes = document.querySelectorAll("#WC [name='global_services']:checked");
            if (nodes.length === 0) {
                this.setError();
                return "Specify a value for global services (or not Applicable)";
            }
            var hasNotApplicable = false;
            nodes.forEach(
                function(s) {
                    if (s.value === "770000000") // Not applicable.
                        hasNotApplicable = true;
                });
            if (nodes.length > 1 && hasNotApplicable) {
                this.setError();
                return "Cannot specify Not Applicable with other global services values";
            }
            this.setError(false);
            return false;
        }.bind(o);
        o.setError = function(errorOn) {
            if (typeof (errorOn) === 'undefined') errorOn = true;
            var target = document.getElementsByName(this.id)[0];
            if (!target) return;
            var formGroup = closestParent(target, "form-group");
            if (errorOn) {
                formGroup.classList.remove("has-success");
                formGroup.classList.add("has-error");
            } else {
                formGroup.classList.add("has-success");
                formGroup.classList.remove("has-error");
            }
        };

        o.value = function() {
            var globalServices = [];
            document.querySelectorAll("#WC [name='global_services']:checked").forEach(
                function(s) {
                    globalServices.push(s.value);
                });
            return globalServices.join(",");
        };
        o.htmlNode = function() {
            var v = document.getElementsByName(this.id);
            return !v ? null : v[0];
        };
        $(document).ready(function () {
            // Show/hide "Global Services (Other)" field when "Other" optionischecked.
            $("#WC [name='global_services'][value='100000003']").on('change',
                function (e) {
                   if (e.target.checked) {
                       Arup_validations.globalservices_other.hide(false, "invisible");
                   } else {
                       Arup_validations.globalservices_other.hide(true, "invisible");
                   }
                });
        });
        return o;
    }(),
    globalservices_other: new ArupFieldConfigTextRequired("Global Services (Other)", "ccrm_othernetworkdetails", "globalservices_other"),
    customerCopy: function (){
        // This is a hidden field - set from client when we save.pa
        var o = new ArupFieldConfig("Customer (Copy)", "customerid_account");
        o.value = function() {
            return Arup_validations.client.value();
        };
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
                    Arup_validations.arup_group_code.val = result["ccrm_accountingcentreid"]["ccrm_arupgroupcode"];
                    Arup_validations.arup_group_id.val = result["ccrm_accountingcentreid"]["ccrm_arupgroupid"];
                } else {
                    oppWizLog("** User data did not contain arup group");
                }
            }.bind(o));
        };
        return o;
    }(),
    arup_region: new ArupFieldConfigLookupFromUser("Arup region", "ccrm_arupregionid", null, null, null, "ccrm_arupcompanyid"),
    arup_office: new ArupFieldConfigLookupFromUser("Arup Office id", "ccrm_arupofficeid"),
    arup_group_code: new ArupFieldConfig("Arup Group Code", "ccrm_arupgroupcode"),
    arup_group_id: new ArupFieldConfigLookup("Arup Group Id", "ccrm_arupgroupid",null,"ccrm_arupgroups"),
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

        o.checkK12Status = function (e, source) {
            return checkK12Required();
        };
        return o;
    }(),
    valid_accounting_centre: new ArupFieldConfigAlwaysTrue("Valid Accounting Centre", "ccrm_validaccountingcentre"),
    valid_contact: new ArupFieldConfigAlwaysFalse("Valid Contact", "ccrm_validcontact"),
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
    PILevelAmount: new ArupFieldConfig("PI Level Amount", "ccrm_pilevelmoney_num"),
    OpportunityAdmin: function() {
        // This is a hidden field - set from client when we save.pa
        var o = new ArupFieldConfig("Opportunity Administrator", "ccrm_businessadministrator_userid");
        o.value = function() {
            return "/systemusers(" + parent.Xrm.Page.context.getUserId().replace(/[{}]/g,'') + ")";
        };
        o.databind = true;
        return o;
    }(),  
    description: new ArupFieldConfigTextRequired("Description", "description","description"),
    text11: new ArupFieldConfigReadOnlyText("Supporting Text 1", "arup_procurementmessage","ta1-1"),
    text21: new ArupFieldConfigReadOnlyText("Supporting Text 2", "arup_supportingtext2", "ta2-1"),
    text12: new ArupFieldConfigReadOnlyText("Supporting Text 1", "arup_procurementmessage", "ta1-2"),
    text22: new ArupFieldConfigReadOnlyText("Supporting Text 2", "arup_supportingtext2", "ta2-2"),
    text13: new ArupFieldConfigReadOnlyText("Supporting Text 1", "arup_procurementmessage", "ta1-3"),
    text23: new ArupFieldConfigReadOnlyText("Supporting Text 2", "arup_supportingtext2", "ta2-3"),
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
        o.databind =
            true; // databinding normally goes by "id" at the end of the attribute name. This can be overriden by this field.
        o.setValue = function(value, result) {
            // Optional function called to set the value of this field (i.e. when populated from parent.)
        };
        o.onchange =
            function(event,
                _this) { // Any attribute with an on* prefix will be set up as an event handler on the parent element.
                // Event is the triggering event -the Html element is normallyevent.target
                // _this is the current config/validation element - Arup_validations.template in this case.
            }.bind(o);
        return o;
    }()
}

