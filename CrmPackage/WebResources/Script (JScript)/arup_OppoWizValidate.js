/// <reference path="libraries/validate.js"/>
/// <reference path="libraries/underscore.js"/>

class ArupValidateOppoWiz {
    
    constructor(document, formid) {
        this.constraints = {};
        this.formid = formid;
        this.form = document.querySelector( formid);
        this.document = document;
        this.addValidationHooks();
    }

    Validate() {
        return new Promise(function(resolve, reject) {
            debugger;
            var errors = validate(form, this.constraints);
            // then we update the form to reflect the results
            showErrors(form, errors || {});
            if (!errors) {
                resolve();
            } else {
                reject(errors);
            }
        });
    }

    AddConstraint( field, constraint ) {
        this.constraints[field] = constraint;
    }

    // Hook up the inputs to validate on the fly
     addValidationHooks() {
        var inputs = this.form.querySelectorAll("input, textarea, select");
        for (var i = 0; i < inputs.length; ++i) {
            inputs.item(i).addEventListener("change",
                function (ev) {
                    var errors = validate(this.form, this.constraints) || {};
                    this.showErrorsForInput(this, errors[this.name]);
                });
        }
    }

     ValidateField(field ) {
         var errors = validate(field.form, this.constraints) || {};
         this.showErrorsForInput(field, errors[field.name]);
     }

    showErrors( errors) {
        // We loop through all the inputs and show the errors for that input
        _.each(this.form.querySelectorAll("input[name], select[name]"),
            function(input) {
                // Since the errors can be null if no errors were found we need to handle
                // that
                this.showErrorsForInput(input, errors && errors[input.name]);
            });
    }

    showErrorsForInput(input, errors) {
        // This is the root of the input
        var formGroup = closestParent(input.parentNode, "form-group")
            // Find where the error messages will be insert into
            ,
            label = formGroup.querySelector("label");
        // try adding a data-tooltip
        input.setAttribute("data-tooltip", string.join("\r\n", errors));

        // First we remove any old messages and resets the classes
        resetFormGroup(formGroup);
        // If we have errors
        if (errors) {
            // we first mark the group has having errors
            formGroup.classList.add("has-error");
            // then we append all the errors
            _.each(errors,
                function(error) {
                    addError(label, error);
                });
        } else {
            // otherwise we simply mark it as success
            formGroup.classList.add("has-success");
        }
    }

    // Recusively finds the closest parent that has the specified class
    closestParent(child, className) {
        if (!child || child == document) {
            return null;
        }
        if (child.classList.contains(className)) {
            return child;
        } else {
            return closestParent(child.parentNode, className);
        }
    }


    resetFormGroup(formGroup) {
        // Remove the success and error classes
        formGroup.classList.remove("has-error");
        formGroup.classList.remove("has-success");
        // and remove any old messages
        _.each(formGroup.querySelectorAll(".help-block.error"),
            function(el) {
                el.parentNode.removeChild(el);
                el.removeAttribute("data-tooltip");
            });
    }

    // Adds the specified error with the following markup
    // <p class="help-block error">[message]</p>
    addError(label, error) {
        var block = document.createElement("span");
        block.classList.add("help-block");
        block.classList.add("error");
        block.innerText = error;
        label.parentNode.insertBefore(block, label.nextSibling);
    }

}

Arup = (typeof(Arup) === "undefined" ? {} : Arup);
Arup.validateOppWiz = function() {

// Define constraints using validate.js
    var page4constraints = {
        project_name: {
            presence: { message: "- a name is required" }
        },
        project_country: {
            presence: { message: "- select a value" }
        },
        project_state: {
            presence: { message: "- select a value" }
        },
        project_city: {
            presence: { message: "- enter name" }
        },
        arup_business: {
            presence: { message: "- select values" }
        },
        arup_subbusiness: {
            presence: { message: "- select value" }
        },
        arup_company: {
            presence: { message: "- select value" }
        },
        accountingcentre: {
            presence: { message: "- select value" }
        },
        client: {
            presence: { message: "- select value" }
        },
        endclient: {
            presence: { message: "- select value" }
        },
        opporigin: {
            presence: { message: "- enter name" }
        },
        global_services: {
            presence: { message: "- select one" }
        },
        description: {
            presence: { message: "- enter text" }
        },
    };

    function arupValidator(value, options, key, attributes) {
        debugger;
    }

    function ValidateForm(form) {
        return new Promise(function (resolve, reject) {
            try {
                if (!!validate &&
                    !!validate.validators &&
                    typeof(validate.validators.arupAutocomplete) === 'undefined') {
                    validate.validators.arupAutocomplete = arupValidator;
                }
                debugger;
                var errors = validate(form, page4constraints);
                // then we update the form to reflect the results
                showErrors(form, errors || {});
                if (!errors) {
                    resolve();
                } else {
                    reject(errors);
                }
            } catch (e) {
                console.log(e);
                debugger;
            }
        });
    }

    function showErrors(form, errors) {
        // We loop through all the inputs and show the errors for that input
        _.each(form.querySelectorAll("input[name], select[name]"),
            function(input) {
                // Since the errors can be null if no errors were found we need to handle
                // that
                showErrorsForInput(input, errors && errors[input.name]);
            });
    }

    function showErrorsForInput(input, errors) {
        // This is the root of the input
        var formGroup = closestParent(input.parentNode, "form-group");
        if (formGroup == null) return;
             // Find where the error messages will be insert into
        var label = formGroup.querySelector("label");
        // First we remove any old messages and resets the classes
        resetFormGroup(formGroup);
        // If we have errors
        if (errors) {
            // we first mark the group has having errors
            formGroup.classList.add("has-error");
            // then we append all the errors
            _.each(errors,
                function(error) {
                    addError(label, error);
                });
        } else {
            // otherwise we simply mark it as success
            formGroup.classList.add("has-success");
        }
    }

// Recusively finds the closest parent that has the specified class
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


    function resetFormGroup(formGroup) {
        // Remove the success and error classes
        formGroup.classList.remove("has-error");
        formGroup.classList.remove("has-success");
        // and remove any old messages
        _.each(formGroup.querySelectorAll(".help-block.error"),
            function(el) {
                el.parentNode.removeChild(el);
            });
    }

// Adds the specified error with the following markup
// <p class="help-block error">[message]</p>
    function addError(label, error) {
        var block = document.createElement("span");
        block.classList.add("help-block");
        block.classList.add("error");
        block.innerText = error;
        label.parentNode.insertBefore(block, label.nextSibling);
    }

//
// Ensure that dependencies are loaded.
//
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js");
    loadScript("//cdnjs.cloudflare.com/ajax/libs/validate.js/0.13.1/validate.min.js");

    function loadScript(src) {
        var that = this;

        if (!document.getElementById(src)) {
            var script = document.createElement('script');
            script.onerror = function() {
                // handling error when loading script
                console.log('Error in loading script ' + src);
            };

            script.onload = function() {
                console.log(src + ' loaded ');
            };

            script.src = src;
            script.type = "text/javascript";
            script.id = src;
            document.getElementsByTagName('head')[0].appendChild(script);
        } else {
            console.log(src + ' already loaded ');
        }
    }

    // Hook up the inputs to validate on the fly
    function addValidationHooks(form) {
        var inputs = form.querySelectorAll("input, textarea, select");
        for (var i = 0; i < inputs.length; ++i) {
            inputs.item(i).addEventListener("change",
                function(ev) {
                    var errors = validate(form, page4constraints) || {};
                    showErrorsForInput(this, errors[this.name]);
                });
        }
    }

    return { validate: ValidateForm, addValidationHooks: addValidationHooks}
}();


