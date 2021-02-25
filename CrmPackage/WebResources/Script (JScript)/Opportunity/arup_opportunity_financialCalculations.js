//
// Add support for carrying out the calculation of fiancial values in a single location (Using action A20...)
//
// We need to tap into the onchange event of all financial input fields, collect the financial values into a JSON, 
// then call Action A20, unpack the results and populate the financial output fields.
//

ArupFinancials = (
    function() {
        var obj = {};

        const inputBidValues = ["ccrm_salarycost_num", "ccrm_grossexpenses_num", "ccrm_staffoverheadspercent"];
        const inputProjectValues = [
            "project_name", "ccrm_estimatedvalue_num", "ccrm_estexpenseincome_num",
            "ccrm_anticipatedprojectcashflow_num", "ccrm_estprojectresourcecosts_num",
            "ccrm_estprojectstaffoverheadsrate", "arup_expenses_num", "ccrm_estprojectsubcontractorfees_num",
            "ccrm_contingency", "arup_importedsalarycost_num", "arup_importedstaffohcost_num",
            "arup_importedexpenses_num", "ccrm_probabilityofprojectproceeding", "closeprobability"
            //"ccrm_totalbidcost_num"
        ];
        const inputValues = [...inputBidValues, ...inputProjectValues];
        const outputAttributes = [
            // Bid outputs
            "ccrm_staffoverheads_num", "ccrm_totalbidcost_num", 
            // Project outputs
            "ccrm_projecttotalincome_num", "ccrm_estprojectoverheads_num", "arup_grossstaffcost_num",
            "ccrm_estprojectexpenses_num", "ccrm_projecttotalcosts_num", "ccrm_estprojectprofit_num",
            "ccrm_profitasaprcentageoffeedec", "ccrm_proj_factoredprofit_num", "ccrm_proj_factoredincome_num",
            "ccrm_factorednetreturntoarup_num", "ccrm_ratfactnetreturntoarupnetarupbidcost_num",
            "ccrm_calccashflowdeficit"
        ];

        /**
         * Setup onchange events on the input parameters to the financial calculations.
         * @param {any} executionContext
         */
        function SetupAttributeOnChangeEvents(executionContext ) {
            const formContext = executioncontext.getFormContext();
            inputValues.forEach( (attributeName) => {
                const attribute = formContext.getAttribute(attributeName);
                if (!!attribute) {
                    console.warn("Input attribute not found " + attributeName);
                } else {
                    attribute.addOnChange(onFinancialValueChanged);
                }
            });
            onFinancialValueChanged(executionContext);
        }

        /**
         * Call out to the CRM server to execute the action to carry out the financial values calculations.
         * @param {any} request  Json formatted object contianing the input arguments to the calculations.
         * @returns A promise that will resolve when the action completes.
         */
        function executeFinancialCalculationsAction(request) {
            const arup_A20OpportunityFinancialCalculationsRequest = {
                inputValuesJSON: request,

                getMetadata: function() {
                    return {
                        boundParameter: null,
                        parameterTypes: {
                            "inputValuesJSON": {
                                "typeName": "Edm.String",
                                "structuralProperty": 1
                            }
                        },
                        operationType: 0,
                        operationName: "arup_A20OpportunityFinancialCalculations"
                    };
                }
            };
            return Xrm.WebApi.online.Execute(arup_A20OpportunityFinancialCalculationsRequest);
        }

        /**
         * Update the on-form attributes with the new values in "updates"
         * @param {any} updates - object containing properties to be updated.
         */
        function updateAttributes(formContext, updates) {
            outputAttributes.forEach( (attributeName) => {
                if (updates.hasOwnProperty(attributeName)) {
                    var attribute = formContext.getAttribute(attributeName);
                    attribute.setValue(updates[attributeName]);
                } else {
                    console.log("Update attribute not found " + attributeName);
                }
            } );

            // Check to see there are no "extras" that we are not updating.
            for (const property in updates) {
                if (!outputAttributes.contains(property)) 
                {
                    console.log("Orphan update attribute :" + property + " = " + updates[property]);
                }
            }
        }

        /**
         * Get the required input values for the financial calculations.
         * @param {any} formContext
         */
        function collectInputValues(formContext, inputFields) {
            var rv = {};
            inputValues.every((attributeName) => {
                var attribute = formContext.getAttribute(attributeName);
                if (!!attribute) {
                    rv[attributeName] = a.getValue();
                } else {
                    console.log("Attribute " + attributeName + " not found");
                }
            });

            return rv;
        }

        /**
         * Called when any of the input parameters to the calculations change.
         * @param {any} executionContext - CRM execution context from the environment.
         */
        function onFinancialValueChanged(executionContext) {
            const formContext = executionContext.getFormContext();

            updateFinancialValues(formContext);
        }

        /**
         * Get input parameters form the form, call the server action to recalculate the values and then repopulate the form.
         * @param {any} formContext
         */
        function updateFinancialValues(formContext) {
            const inputs = collectInputValues(formContext, inputValues); // Returns dictionary of values

            // Convert to Json
            var request = JSON.stringify(inputs);

            // Call out to the server based action to carry out the calculations.
            executeFinancialCalculationsAction(request).then(
                function success(result) {
                    // Unpack JSON in result.
                    const updates = JSON.parse(result.responseText);
                    updateAttributes(formContext, updates);
                    // Populate financial fields.
                },
                function error(status) {
                    // Log error data to console
                    console.log("Error calling financial values calculations" + error.message);

                    // Display alert saying that there is an issue with financial values calculations.
                    alert("Error updating financial values");
                });
        }

        // Export a function to allow update of financials to be triggered externally.
        obj.UpdateFinancialValues = updateFinancialValues; // Call with the formContext.
        obj.SetupAttributeOnChangeEvents = SetupAttributeOnChangeEvents; // Setup from UI as "ArupFinancials.SetupAttributeOnChangeEvents". Pass excutioncontext.
    }
    )();