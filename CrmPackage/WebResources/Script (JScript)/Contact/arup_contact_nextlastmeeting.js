/**
 * 21/04/2021 - Probably not needed at the moment, but a useful reference.
 *
 * Display a customised icon for the next/last meeting Contacts view.
 * @param {any} rowData
 * @param {any} userLcid
 */
function displayLastMeetingIcon(rowData, userLcid) {
    return displayMeetingIcon(rowData, userLcid, "arup_lastmeeting");
}
function displayNextMeetingIcon(rowData, userLcid) {
    return displayMeetingIcon(rowData, userLcid, "arup_nextmeeting");
}

function displayMeetingIcon(rowData, userLcid, attribute) {
    var str = JSON.parse(rowData);
    var lastmeeting = str[attribute];
    var imgName = "";
    var tooltip = "";

    if (!!str && !!str.arup_lastmeeting_Value && !! lastmeeting) {
        var data = JSON.parse(lastmeeting);

        switch (str.arup_lastmeeting_Value.LogicalName) {
        case "phonecall":
            imgName = "arup_phonecall_icon.svg";
            tooltip = data[1];
            break;
        case "appointment":
            imgName = "arup_appointment_icon.svg";
            tooltip = data[1];
            break;
        default:
            tooltip = data[1];
            break;
        }
    }
    var resultarray = [imgName, tooltip];
    return resultarray;
}


if (typeof(ArupNextLastMeeting) === "undefined") {
    ArupNextLastMeeting =
        function() {
            var obj = {};

            var attributes = ["arup_nextmeeting", "arup_lastmeeting"];

            /**
             * Setup onchange events on the input parameters to the financial calculations.
             * @param {any} executionContext
             */
            function setupAttributeOnChangeEvents(executioncontext) {
                const formContext = executioncontext.getFormContext();
                attributes.forEach((attributeName) => {
                    const attribute = formContext.getAttribute(attributeName);
                    if (!attribute) {
                        console.warn("Attribute not found " + attributeName);
                    } else {
                        var onChange = getOnChangeFunction(attributeName);
                        attribute.addOnChange(onChange);
                        attribute.controls.forEach((control) => control.setDisabled(true));
                        onChange(executioncontext);
                    }
                });
            }

            function getOnChangeFunction(attributeName) {
                return function(executionContext) {
                    const formContext = executionContext.getFormContext();
                    debugger;
                    // Parse the data in the name. Set the value to the appointment date
                    var attribute = formContext.getAttribute(attributeName);
                    var value  = attribute.getValue()[0];
                    var jsonData = value.name;
                    var data = JSON.parse(jsonData);
                    if (!!data) {
                        var date = new Date(data[0]);
                        var userFormat = Xrm.Utility.getGlobalContext().userSettings.formatInfoCultureName;
                        value.name = date.toLocaleDateString(userFormat);
                        attribute.setValue([value]);
                    }
                    // Set the tooltip to the subject of the appointment
                    // TODO
                    // Make sure the fields is set to not save back to the server.
                    attribute.setSubmitMode("never");
                }
            }

            obj.SetupAttributeOnChangeEvents =
                setupAttributeOnChangeEvents; // Setup from UI as "ArupFinancials.SetupAttributeOnChangeEvents". Pass excutioncontext.
            return obj;
        }();
};

