/// <reference path="libraries/validate.js"/>
/// <reference path="libraries/underscore.js"/>

Arup = (typeof(Arup) === "undefined" ? {} : Arup);
Arup.validateOppWiz = function() {

// Define constraints using validate.js
    var page4constraints = {
        project_name: {
            presence: { message: "Enter a name for the project" }
        },
        project_city: {
            presence: { message: "Enter a city name" }
        },
        project_country: {
            presence: { message: "Enter a city name" }
        }
    }

    function ValidateForm(form) {
        return new Promise(function(resolve, reject) {
            var errors = validate(form, page4constraints);
            // then we update the form to reflect the results
            showErrors(form, errors || {});
            if (!errors) {
                resolve();
            } else {
                reject();
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
        var formGroup = closestParent(input.parentNode, "form-group")
            // Find where the error messages will be insert into
            ,
            messages = formGroup.querySelector(".messages");
        // First we remove any old messages and resets the classes
        resetFormGroup(formGroup);
        // If we have errors
        if (errors) {
            // we first mark the group has having errors
            formGroup.classList.add("has-error");
            // then we append all the errors
            _.each(errors,
                function(error) {
                    addError(messages, error);
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
    function addError(messages, error) {
        var block = document.createElement("p");
        block.classList.add("help-block");
        block.classList.add("error");
        block.innerText = error;
        messages.appendChild(block);
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


