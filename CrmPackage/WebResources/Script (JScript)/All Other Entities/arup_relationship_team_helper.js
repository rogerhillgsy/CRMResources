//
// Add support for automatically filling in the Relationship team field based on target of an activity
// (i.e. the recipient of a phone call, or the recipients of an invitation.)

ArupRelationshipTeam =  (
    function() {
        var obj = {}
        obj["relationshipTeamAttribute"] = "ccrm_relationshipteam";
        obj["recipientAttribute"] = "to";

        /**
        * Called on load to set up any field change callbacks.
        * @param {any} executionContext
        */
        function onFormLoad(formContext, recipientAttribute, relationshipTeamAttribute) {
            setOptionalAttribute("recipientAttribute", recipientAttribute)
            setOptionalAttribute("relationshipTeamAttribute", relationshipTeamAttribute)

            // Add event listener on to field.
            var toField = formContext.getAttribute("to");
            if (!!toField) {
                toField.addOnChange(onToFieldChange);
            }
        }

        function setOptionalAttribute( attributeName, attributeValue) {
            if (!!attributeValue) {
                obj[attributeName] = attributeValue;
            }
        }

        function onToFieldChange(executionContext) {
            debugger;
            var formContext = executionContext.getFormContext();
            var toField = formContext.getAttribute("to");
            toField = toField == null ? null : toField.getValue();
            if (!!toField && toField.length > 0) {
                var toId = toField[0].id;
                return Xrm.WebApi.retrieveRecord("contact", toId, "?$select=_arup_relationshipteam_value")
                    .then(
                        function whenRetrieved(result) {
                            debugger;
                            var relationshipTeam = formContext.getAttribute("ccrm_relationshipteam");
                            if (!!relationshipTeam) {
                                var teamId = result["_arup_relationshipteam_value"];
                                var teamName =
                                    result["_arup_relationshipteam_value@OData.Community.Display.V1.FormattedValue"] ??
                                        "**Unknown**";
                                if (!!teamId) {
                                    relationshipTeam.setValue([{ id: teamId, entityType : "team", name: teamName }]);
                                }
                            }
                        },
                        function onError(error) {
                            debugger;
                            alert("Error in getting relationship team name " + error);
                        });
            }
        }

        // Add hooks for global services load and change.
        obj.FormLoad = onFormLoad;
        return obj;
})();
