// Common set of functions for the exit form.
/**
 * @namespace ArupExit
 */
var ArupExit;

/**
 * Implements common exit functions for Arup CRM.
 */
(function(ArupExit) {
    var exitError = console.error.bind(window.console);
    var exitLog= console.log.bind(window.console);

    function exitForm(primaryControl, entityLogicalName) {
        var formContext = primaryControl;
        if (this.closeIfUnmodifiedOrInactive(formContext, entityLogicalName)) return;

        Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
            '<font size="3" color="#000000"></br>Some fields on the form have been changed.</br>Click "Save and Exit" button to save your changes and exit.</br>Click "Exit Only" button to exit without saving.</font>',
            [
                {
                    label: "<b>Save and Exit</b>",
                    callback: this.saveAndCloseForm(formContext, entityLogicalName),
                    setFocus: true,
                    preventClose: false
                },
                {
                    label: "<b>Exit Only</b>",
                    callback: this.closeForm(formContext, entityLogicalName),
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


    function closeIfUnmodifiedOrInactive(formContext, entityLogicalName) {
        //see if the form is dirty
        var ismodified = formContext.data.entity.getIsDirty();
        if (ismodified == false) {
            closeOrView(formContext, entityLogicalName);
            return true;
        } else {
            var formType = formContext.ui.getFormType();
            if (ismodified == true && (formType === 3 || formType === 4)) { // Readonly or disabled
                closeOrView(formContext, entityLogicalName);

                return true;
            }
        }
        return false;
    }

    function closeOrView(formContext, entityLogicalName) {
        if (!!entityLogicalName) {
            // Simply using formContext.ui.close() tends to leave us on the same form, so navigate to the entity list.
            Xrm.Navigation.navigateTo({
                pageType: "entitylist",
                entityName: entityLogicalName
            });
        } else {
            formContext.ui.close();
        }
    }

    function saveAndCloseForm(formContext, entityLogicalName) {
        return function() {
                // Note parameter this is for info only (for OnSave handlers), does not cause the form to close.
            formContext.data.save({ saveMode: 2 })
                .then(function(e) {
                    exitLog("Saved form...");
                    closeOrView(formContext, entityLogicalName);
                })
                .catch(
                    function error(e) {
                        exitError("Failed to save and close form " + e.message);
                        debugger;
                    });
        }
    }

    function closeForm(formContext, entityLogicalName) {
        return function() {
            new Promise(function(resolve) {
                    formContext.data.entity.attributes.forEach(function(a) {
                        if (a.getIsDirty()) {
                            a.setSubmitMode("never");
                        }
                    });
                    resolve();
                })
                .then(function() { closeOrView(formContext, entityLogicalName)})
                .catch(function (e) { exitError("Error closing form :" + e.message) });
        }
    }
    /**
     * @description Runs on Exit button in ribbon. Primary control must be set as first parameter.
     * @method
     * @param {formContext} formContext - Power App form context (can use primaryControl parameter in ribbon buttons)
     * @param {string} logicalname - Logical name of the current entity. Optional.
     * If specified the window will return to the given entity view. Otherwise it will attempt to close the form.
     */
    ArupExit.exitForm = exitForm;

    /** @description Close the form immediately if it is unmodified or read-only
     * @method
     * @param {formContext} formContext - Power App form context (can be the primaryControl parameter in ribbon buttons)
     * @param {string} logicalname - Logical name of the current entity. Optional.
     */
    ArupExit.closeIfUnmodifiedOrInactive = closeIfUnmodifiedOrInactive;

    /** @description save the current form and close
     * @method
     *  @param {formContext} formContext - Power App form context (can use primaryControl parameter in ribbon buttons)
     * @param {string} logicalname - Logical name of the current entity. Optional.
     */
    ArupExit.saveAndCloseForm = saveAndCloseForm;

    /** @description force close the current form without saving.
     * @method
     * @param {formContext} formContext - Power App form context (can use primaryControl parameter in ribbon buttons)
     * @param {string} logicalname - Logical name of the current entity. Optional.
    */
    ArupExit.closeForm = closeForm;
})( ArupExit || ( ArupExit = {}));