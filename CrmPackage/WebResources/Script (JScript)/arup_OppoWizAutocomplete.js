/// <reference path="./libraries/index.js"/>  - pollyfills
class ArupAutoCompleteField {
    constructor(parentid, fieldid, labelText, attribute, validator, constraint, query) {
        this.arupAutoComplete(parentid, fieldid, labelText, attribute, validator, constraint, query);
    }

// div = id of div to attach input field to.
    arupAutoComplete(parentid, fieldid, labelText, attribute, validator, constraint, query) {
        try {
            var root = document.querySelector("#" + parentid);
            if (!root) {
                console.log("Root element " + parentid + " not defined");
                return;
            }
            var formgroup = document.createElement("div");
            formgroup.classList.add("form-group");
            formgroup.classList.add("col-lg-6");
            root.appendChild(formgroup);
            var label = document.createElement("label");
            label.htmlFor = fieldid;
            label.innerHTML = labelText;
            formgroup.appendChild(label);
            var input = document.createElement("input");
            input.id = fieldid;
            input.className = "form-control input-form";
            input.name = fieldid;
            input.type = "text";
            input.maxlength = 200;
            input.attrname = attribute + " :";
            input.setAttribute( "autocomplete", "off");
            formgroup.appendChild(input);
            var datalist = document.createElement("datalist");
            formgroup.appendChild(datalist);
            validator.AddConstraint(fieldid, constraint);

            input.addEventListener("change",
                function (ev) {
                    validator.ValidateField(this);
                });
        } catch (e) {
            debugger;
        }
    }
}
