//
// Add support for tags in the opportunity.
// Initially this will be driven by the Global Services multiselect having "Advisory Services" ticked.
// This will use a Power Platform PCF control to display the tags.
// 
// However, as PCF controls cannot be directly linked to Multiselect optionsets (yet) we are using some JavaScript (here) to link
// The optionset value, and changes in the optionset to a third field (arup tags trigger).
// This third field is a text field which can be linked to the PCF control and used to drive the tags displayed.
//
// See the Wiki article for more detail on how this is set up.

ArupTags =  (
    function() {
        var obj = {}

        const globalServices = "arup_globalservices";
        const tagTriggerField = "arup_tagstrigger";
        debugger; 

        function onGlobalServicesChange(executioncontext) {
            const formContext = executioncontext.getFormContext();

            // Dump a list of currently selected options into the trigger field.
            const globalServicesAttr = formContext.getAttribute(globalServices);
            const tagTriggerFieldAttr = formContext.getAttribute(tagTriggerField);

            const currentOptions = globalServicesAttr.getText();
            tagTriggerFieldAttr. setValue(currentOptions.join(";"));
        }

        function onGlobalServicesLoad(executioncontext) {
            const formContext = executioncontext.getFormContext();
            const globalServicesAttr = formContext.getAttribute(globalServices);
            globalServicesAttr.addOnChange(onGlobalServicesChange);
            onGlobalServicesChange(executioncontext);
        }


        // Add hooks for global services load and change.

        obj.GlobalServicesLoad = onGlobalServicesLoad;

        return obj;
    })();

