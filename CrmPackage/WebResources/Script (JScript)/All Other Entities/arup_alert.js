/**
 *  Common set of functions for alerts to replace Xrm.Utility.alertDialog
 * and to act as a shim for Xrm.Navigation.openAlertDialog
 */
/**
 * @namespace ArupAlert
 */
var ArupAlert;

/**
 * Implements common exit functions for Arup CRM.
 */
(function (arupAlert) {
    var alertError = console.error.bind(window.console);
    var alertLog = console.log.bind(window.console);

    /** @description Directly display an alert dialog
     * @param {formContext} formContext - Power App form context (can use primaryControl parameter in ribbon buttons)
     * @param {string} message - Message to display to the user.
     * @returns {promise} - A promise that can be used to call a callback function when the user presses "OK"
    */
    function alertDialog( message, xrmContext ) {
        var alertStrings = { confirmButtonLabel: "OK", text: message, title: "Alert" };
        var alertOptions = { height: 120, width: 260 };
        xrmContext = xrmContext || ( typeof Xrm == 'undefined' ? parent.Xrm : Xrm); // || parent.Xrm;

        if (!xrmContext) {
            alert("Unable to get Xrm context to display message: " + message);
            return new Promise();
        } else {
            return xrmContext.Navigation.openAlertDialog(alertStrings, alertOptions);
        }
    }

    /** @description Returns an alert dialog function that may be used as a callback function
     * @param {formContext} formContext - Power App form context (can use primaryControl parameter in ribbon buttons)
     * @param {string} message - Message to display to the user.
     * @returns {function} - A function that returns a promise that can be used to call a callback function when the user presses "OK"
    */
    function getAlertDialog() {
        return function(message) {
            return alertDialog( message);
        }
    }

    arupAlert.alertDialog = alertDialog;
    arupAlert.getAlertDialog = getAlertDialog;
})(ArupAlert || (ArupAlert = {}));