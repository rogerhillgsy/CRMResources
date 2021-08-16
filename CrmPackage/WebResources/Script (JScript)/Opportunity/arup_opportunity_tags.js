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
        var supportedTagFields = [];

        /**
         * Add a tag field that is dependent on other fields on the form
        // ArupTags.AddTagControl( "arup_globalservices", "Advisory Services", "arup_tags", [{tab:"Pre-Bid_Tab",section:"tags_section"},{tab:"Summary",section:"tags_section1"}])
         * @param {string} sourceField The field that controls the tags that are displayed (and whether the tag field is visible)
         * @param {string|string []} sourceValues The values of the source field that trigger the tag field
         * @param {string} targetTagField The tag field that is targeted. If this will always be displayed if it contains data.
         * @param {any} tagSections A list of the tabs/sections that contain the 
         */
        function addTagControl(sourceField, sourceValues, targetTagField, tagSections, sourceChangeCallback, isRequiredCallback ) {
            supportedTagFields.push(
                {
                    source: sourceField,
                    sourceValues: sourceValues.split(","),
                    target: targetTagField,
                    sections: tagSections,
                    sourceChangeCallback : sourceChangeCallback,
                    isRequiredCallback : isRequiredCallback,
                    isRequirementLocked : false
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
         * @param {any} visibility : true/false
         * @param {any} formContext : XRM form context
         * @param {any} tabName : name of the tab that contains the section.
         * @param {any} sectionName : section name to be shown/hidden.
         */
        function setTagSectionVisibility1( visibility, formContext, tabName, sectionName) {
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
         * @param {any} isRequired - boolean
         * @param {any} formContext - XRM form context
         * @param {any} attribute - name of the attribute to be set to require/not requiired.
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
         * Set the visibility and requirement level of the tags field. This takes into account
         * - The state of the source field: whether it contains any of the source values that cause the tag field to be visible (and potentially required)
         * - Other factors, such as the current process stage.
         * @param {any} formContext
         * @param {any} tagContext
         * @param {any} formRequirement - requirement level from form.
         */
        function setTagsVisibilityAndRequirement(formContext, tagContext, formRequirement ) {
            // Get source and target attributes.
            const sourceAttr = formContext.getAttribute(tagContext.source);
            const targetAttr = formContext.getAttribute(tagContext.target);
            const currentTagsValue = targetAttr.getValue();
            const selectedStage = formContext.data.process.getSelectedStage();
            const selectedStageName = selectedStage == null ? "" :  selectedStage.getName();

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

            // Tags also have to be visible if tags have been selected, even if the original source trigger has changed to no longer require it.
            if (( hasSourceValue) || !! currentTagsValue) {
                setTagSectionVisibility(true, formContext, tagContext.sections);
            } else {
                setTagSectionVisibility(false, formContext, tagContext.sections);
            }

            // Evaluate possible external factors in whether the tag control is required (i.e. the process stage)
            const tagControlRequired = (!!tagContext.isRequiredCallback) ? tagContext.isRequiredCallback(formContext, selectedStageName) :  false;

            if ( hasSourceValue && ( tagControlRequired || formRequirement || tagContext.isRequirementLocked )) {
                setTagsControlRequired(true, formContext, tagContext.target);
            } else {
                setTagsControlRequired(false, formContext, tagContext.target);
            }
        }

        /**
         * Called via Promise when a tag source or target field changes.
         * Used to defer execution until after current event processing (avoid issues with multiselect state)
         * @param {any} executionContext
         * @param {any} tagContext
         * @param {boolean} isMandatory
         */
        function onTagFieldsChangePromise(executionContext, tagContext, isMandatory ) {
            const formContext = !!executionContext.getFormContext ? executionContext.getFormContext() : executionContext;

            setTagsVisibilityAndRequirement(formContext, tagContext, isMandatory);
        }
        /**
         * Called when either the source or target field changes.
         * @param {any} executioncontext - CRM execution context
         * @param {any} targetContext - From the supported tag fields array.
         * @param {boolean} isMandatory - Is there a requirement for the field from the form.
         */
        function onTagFieldsChange(executionContext, targetContext, isMandatory) {
            // Use a promise to defer execution of the value checking till after we have finished updating the control..
            // Checking the value of a multiselect from within the onChange event itself is not reliable
            const p = new Promise((resolve) => {
                onTagFieldsChangePromise(executionContext, targetContext, isMandatory);
                resolve();
            });
            return true;
        }

        /**
         * Called on load to set up any field change callbacks.
         * @param {any} executionContext
         */
        function onFormLoad(executionContext) {
            const formContext = executionContext.getFormContext();

            supportedTagFields.forEach((tagContext) => {
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
                    onTagFieldsChange(executionContext, tagContext);

                } catch (ex) {
                    console.log("Error Adding tag callback for source " + tagContext.source + " target " + tagContext.target);
                }
            });

            // Need to tap into the OnSave event to make sure tags are all up to date before saving (to avoid any unsaved changes issues when the opportunity is reopened)
            formContext.data.entity.addOnSave(onSave);
        }

        /**
         * Ensure that the tag field visibility and requirement levels are up to date before the form is saved (this may include making fields)
         * @param {any} executionContext
         */
        function onSave(executionContext) {
            const formContext = executionContext.getFormContext();

            // make sure that tag fields are up to date before saving.
            // Not sure that changing requirement level during on save works.
            //supportedTagFields.forEach((tagContext) => {
            //    setTagsVisibilityAndRequirement(formContext, tagContext);
            //});

            // // Uncomment for useful diagnostics on save mode and what is actually being saved.
            var eventArgs = executionContext.getEventArgs();
            var xml = formContext.data.entity.getDataXml();
            console.log("Saving opportunity mode: " + eventArgs.getSaveMode() + " dataXML: " + xml);
        }

        /**
         * There is a requirement on the opportunity to reevaluate whether tag values are required at various points.
         * This normally happens before moving to a new stage.
         * For example the services tags are only required once we move away from the pre-bid stage, and then only when Global Services include "Advisory Services"
         * @param {any} formContext 
         * @param {boolean} isMandatory - Does the form require the tags?
         */
        function checkTagRequirement(formContext, isMandatory) {
            supportedTagFields.forEach((tagContext) => {
                    onTagFieldsChange(formContext, tagContext,isMandatory);
                }
            );
        }        
        
        /**
         * The MoveNext functionality on the opportunity form is rather "convoluted".
         * It will at some point try to save the opportunity, but will give no indication that it is trying to move to the next stage (and
         * thus that different requirements may apply with respect to whether tag fields are required.)
         * Use this call to lock in the tag requirements as "mandatory"
         * @param {any} formContext 
         * @param {boolean} isMandatory - Does the form require the tags?
         */
        function lockTagRequirement(formContext, isMandatory) {
            supportedTagFields.forEach((tagContext) => {
                    tagContext.isRequirementLocked = isMandatory;
                }
            );
        }

        // Add hooks for global services load and change.
        obj.FormLoad = onFormLoad;
        obj.AddTagControl = addTagControl;
        obj.CheckTagRequirement = checkTagRequirement;
        obj.LockTagRequirement = lockTagRequirement;
        return obj;
    })();

// Configure global services tag control
ArupTags.AddTagControl("arup_globalservices",
    "Advisory Services",
    "arup_tags",
    [{ tab: "Pre-Bid_Tab", section: "sec_service_tags" }, { tab: "Summary", section: "sec_service_tags2" }],
    // The Global services multiselect needs some additional help to transfer it's value to the PCF control.
    // PCF controls cannot react directly to changes in multiselects.
    function sourceChanged(formContext, globalServicesAttr) {
        const currentOptions = globalServicesAttr.getText();
        const tagTriggerFieldAttr = formContext.getAttribute("arup_tagstrigger");
        if (!!currentOptions) {
            tagTriggerFieldAttr.setValue(currentOptions.join(";"));
        } else {
            tagTriggerFieldAttr.setValue("");
        }

        // Only want to make the trigger field submittable on create/update forms.
        const formTypes = { 1: "Create", 2: "Update" };
        if (!formTypes[ formContext.ui.getFormType()]) {
            tagTriggerFieldAttr.setSubmitMode('never');
        } 
        // For PCF control update.
        tagTriggerFieldAttr.fireOnChange();
        return currentOptions;
    },
    function isRequired(formContext, processStage) {
        return processStage !== "PRE-BID";
    });

// Configure business tag control.
// Suppress the Business tags for the July 2021 release.
//ArupTags.AddTagControl("ccrm_arupbusinessid",
//    "Energy",
//    "arup_business_tags",
//    [{ tab: "Pre-Bid_Tab", section: "sec_business_tags" }, {tab:"Summary", section:"sec_business_tags2"}]);
