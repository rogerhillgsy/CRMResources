//
// Add support for tags in the opportunity.
// Initially this will be driven by the Global Services multiselect having "Advisory Services" ticked.
// This will use a Power Platform PCF control to display the tags.
// 
// However, as PCF controls cannot be directly linked to Multiselect optionsets (yet) we are using some JavaScript (here) to link
// The optionset value, and changes in the optionset to a third field (arup tags trigger).
// This third field is a text field which can be linked to the PCF control and used to control the tags displayed.
//
// See the Wiki article for more detail on how this is set up.
//
// Note that this file is concerned with whether the tag controls should be displayed and whether they should be business required.
// The actual tag implementation is in a PCF control (TSMultiTagComponent)
//

ArupTags =  (
    function() {
        var obj = {}

        // A list of tag fields to trigger on.
        obj.supportedTagFields = [];

        /**
         * Add a tag field that is dependent on other fields on the form
        // ArupTags.AddTagControl( "arup_globalservices", "Advisory Services", "arup_tags", [{tab:"Pre-Bid_Tab",section:"tags_section"},{tab:"Summary",section:"tags_section1"}])
         * @param {string} sourceField The field that controls the tags that are displayed (and whether the tag field is visible)
         * @param {string|string []} sourceValues The values of the source field that trigger the tag field
         * @param {string} targetTagField The tag field that is targeted. If this will always be displayed if it contains data.
         * @param {any} tagSections A list of the tabs/sections that contain the 
         */
        function addTagControl(sourceField, sourceValues, targetTagField, tagSections, sourceChangeCallback) {
            obj.supportedTagFields.push(
                {
                    source: sourceField,
                    sourceValues: sourceValues.split(","),
                    target: targetTagField,
                    sections: tagSections,
                    sourceChangeCallback : sourceChangeCallback
                });
        }

        /**
         * Set visibility of all sections listed in the targetSections array.
         * @param {any} visibility
         * @param {any} formContext
         * @param {any} targetSections
         */
        function setTagSectionVisibility(visibility, formContext, targetSections) {
            targetSections.forEach((target) => {
                setTagSectionVisibility1(visibility, formContext, target.tab, target.section);
            });
        }

        /**
         * Set visibility of a specific section on the form.
         * @param {any} visibility
         * @param {any} formContext
         * @param {any} tabName
         * @param {any} sectionName
         */
        function setTagSectionVisibility1( visibility, formContext, tabName, sectionName) {
            console.log("Set visibility " + visibility + " tab " + tabName + " section " + sectionName);
            const tab = formContext.ui.tabs.get(tabName);
            if (!!tab) {
                const tagSection = tab.sections.get(sectionName);
                if (!!tagSection) {
                    tagSection.setVisible(visibility);
                }
            }
        }

        /**
         * Target Tag control attribute is only required when the source control has relevant values.
         * @param {any} isRequired
         * @param {any} formContext
         * @param {any} attribute
         */
        function setTagsControlRequired(isRequired, formContext, attribute) {
            var attr = formContext.getAttribute(attribute);
            if (!!attr) {
                attr.setRequiredLevel(isRequired ? "required" : "none");
            }
        };

        /**
         * Return an array of text value for the given attribute.
         * @param {any} attribute
         */
        function getAttributeValues(attribute) {
            switch (attribute.getAttributeType()) {
            case "lookup":
                var val = attribute.getValue();
                return val == null ? [] : val.map(a => a.name);
            default:
                return [attribute.getValue()];
            }
        }

        /**
         * Called via Promise when a tag source or target field changes.
         * @param {any} executioncontext
         * @param {any} tagContext
         */
        function onTagFieldsChangePromise(executioncontext, tagContext) {
            const formContext = executioncontext.getFormContext();

            // Get source and target attributes.
            const sourceAttr = formContext.getAttribute(tagContext.source);
            const targetAttr = formContext.getAttribute(tagContext.target);
            const currentTagsValue = targetAttr.getValue();

            // Call any source change callback (do any extra stuff that some fields require (i.e. multiselects))
            // This may optionally return the current set of options as an array.
            var currentSourceOptions = !! tagContext.sourceChangeCallback
                ? tagContext.sourceChangeCallback(formContext, sourceAttr)
                : null;
            currentSourceOptions = currentSourceOptions || getAttributeValues( sourceAttr);

            // Determine if the current options contain any of the source values that we are targeting
            var hasSourceValue = tagContext.sourceValues.reduce((accumulator, sourceValue) => {
                    return accumulator || currentSourceOptions.includes( sourceValue);
                },
                false);

            if (( hasSourceValue) || !! currentTagsValue) {
                setTagSectionVisibility(true, formContext, tagContext.sections);
            } else {
                setTagSectionVisibility(false, formContext, tagContext.sections);
            }

            if (( hasSourceValue)) {
                setTagsControlRequired(true, formContext, tagContext.target);
            } else {
                setTagsControlRequired(false, formContext, tagContext.target);
            }
        }

        /**
         * Called when either the source or target field changes.
         * @param {any} executioncontext
         * @param {any} targetContext
         */
        function onTagFieldsChange(executioncontext, targetContext) {
            // Use a promise to defer execution of the value checking till after we have finished updating the control..
            // Checking the value of a multiselects from within the onChange event itself is not reliable
            const p = new Promise((resolve, reject) => {
                onTagFieldsChangePromise(executioncontext, targetContext);
                resolve();
            });
            return true;
        }

        /**
         * Called on load to set up any field change callbacks.
         * @param {any} executioncontext
         */
        function onFormLoad(executioncontext) {
            const formContext = executioncontext.getFormContext();

            obj.supportedTagFields.forEach((tagContext) => {
                try {
                    // Local onchange function
                    const onChange = (executionContext) => onTagFieldsChange(executionContext, tagContext);
                    // Track changes to the source field
                    const sourceAttr = formContext.getAttribute(tagContext.source);
                    sourceAttr.addOnChange(onChange);
                    // Track changes to the target tag field.
                    const targetAttr = formContext.getAttribute(tagContext.target);
                    targetAttr.addOnChange(onChange);

                    // Make sure everything is initially up to date.
                    onTagFieldsChange(executioncontext, tagContext);

                } catch (ex) {
                    console.log("Error Adding tag callback for source " + tagContext.source + " target " + tagContext.target);
                }
            });

        }

        // Add hooks for global services load and change.
        obj.GlobalServicesLoad = onFormLoad;
        obj.AddTagControl = addTagControl;
        return obj;
    })();

// Configure global services tag control
ArupTags.AddTagControl("arup_globalservices",
    "Advisory Services",
    "arup_tags",
    [{ tab: "Pre-Bid_Tab", section: "sec_service_tags" }, { tab: "Summary", section: "sec_service_tags2" }],
    function sourceChanged(formContext, globalServicesAttr) {
        const currentOptions = globalServicesAttr.getText();
        const tagTriggerFieldAttr = formContext.getAttribute("arup_tagstrigger");
        if (!!currentOptions) {
            tagTriggerFieldAttr.setValue(currentOptions.join(";"));
        } else {
            tagTriggerFieldAttr.setValue("");
        }
        tagTriggerFieldAttr.setSubmitMode('never');
        tagTriggerFieldAttr.fireOnChange();
        return currentOptions;
    });

// Configure business tag control.
ArupTags.AddTagControl("ccrm_arupbusinessid",
    "Energy",
    "arup_business_tags",
    [{ tab: "Pre-Bid_Tab", section: "sec_business_tags" }, {tab:"Summary", section:"sec_business_tags2"}]);
