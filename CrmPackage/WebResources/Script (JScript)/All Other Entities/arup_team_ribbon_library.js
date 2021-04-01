/// <reference path="../All Other Entities/arup_exitFormFunctions.js"/>"/>
if (typeof (ARUP) == "undefined") {
    ARUP = {};
}
if (typeof (ARUP.ccrm_bidreview ) == "undefined") {
    ARUP.ccrm_bidreview = {};
}

ARUP.ccrm_bidreview.ribbon = function() {
    var me = {};
    var Log = window.console.log.bind(window.console);

    /**
     * Tags used in queries to identify ones that need on the fly rewriting.
     */
    const secretCookieNames = {
        contact : "Relationship Team Contacts Secret Cookie",
        opportunity : "Relationship Team Opportunity Secret Cookie",
        lead: "Relationship Team Lead Secret Cookie"
    }

    /**
     * Transform the fetchXMl of the current view into something we can use to create a new user view.
     * @param {string} sourceXml - fetchXMl of current view
     * @param {string } cookie - value of the secret cookie used to mark views that require on the fly rewriting.
     */
    function transform(sourceXml, cookie) {
        var rv = sourceXml;
        const parser = new DOMParser();
        const doc = parser.parseFromString(sourceXml, "application/xml");

        // Find "condition" node with an attribute of "teamid"
        const relatedTeamCondition =  doc.querySelector("condition[attribute='teamid'");
        if (!!relatedTeamCondition) {
            // Find the cookie node that we need to replace with the related team condition.
            const cookieNode = doc.querySelector("condition[attribute='name'][value='" + cookie +"']");
            if (!!cookieNode) {
                const nodeToRemove = relatedTeamCondition.parentNode.parentNode;
                cookieNode.replaceWith(relatedTeamCondition);
                nodeToRemove.remove();

                // Remove any paging attibutes from root fetchNoe.
                doc.firstElementChild.removeAttribute("page");
                doc.firstElementChild.removeAttribute("count");

                const  serializer = new XMLSerializer();
                rv= serializer.serializeToString(doc);
            }
        }

        return rv;
    }

    function error(message) {
        return function(error) {
            Log(message + " - " + error.message);
        };
    }

    /**
     *  Navigate to the given view
     * @param {guid} viewId - Guid of the view
     * @param {string} logicalName - logical name of the entity displayed in the view.
     * @returns {Promise} - completes when the new view has been displayed.
     */
    function navigateTo(formContext, gridContext, viewId, logicalName) {
        return Xrm.Navigation.navigateTo({
            pageType: "entitylist",
            entityName: logicalName,
            viewId: viewId,
            viewType: "userquery"
        }).then(
            function success(r) {
                debugger;
                //Make sure we have actually reached the new view we have just created.
            });
    }

    /**
     * Dynamically create a view (if required) to display the contacts connected to this relationship team.
     * @param {any} formContext
     * @param {any} gridContext
     * @param {any} primaryEntityLogicalName
     * @param {any} secondaryEntityLogicalName
     */
    me.createView = function(formContext, gridContext, primaryEntityLogicalName, secondaryEntityLogicalName) {
        // Get fetchXML of current view
        const fetchXml = gridContext.getFetchXml();
        const derivedXml = transform(fetchXml, secretCookieNames[secondaryEntityLogicalName]);
        // Get details of existing view
        const currentViewRef = gridContext.getViewSelector().getCurrentView();
        const targetViewName = formContext.getAttribute("name").getValue() +
            " - " +
            gridContext.getViewSelector().getCurrentView().name;
        var template = {};
        var existingViewId = null; 
        const getTemplate = Xrm.WebApi.retrieveRecord(currentViewRef.entityType, currentViewRef.id).then(
            function success(result) {
                template = result;
            },
            error("Getting template record")
        );

        const getExisting = Xrm.WebApi.retrieveMultipleRecords("userquery", "?$select=userqueryid&$filter=name eq '" + targetViewName + "'")
            .then(function
                success(result) {
                    if (result.entities.length > 0) {
                        existingViewId = result.entities[0].userqueryid;
                    }
                },
                error("Searching for existing user query")
                );

        Promise.all([getTemplate, getExisting]).then(
            function createNew(result) {
                if (!!existingViewId) {
                    // Already a user view for this one.
                    return navigateTo(formContext, gridContext, existingViewId,secondaryEntityLogicalName);
                } else {
                    // Need to create a new view.

                    const userquery = {
                        name: targetViewName,
                        description: "Auto-created relationship group view for " +
                            formContext.getAttribute("name").getValue() +
                            " of the Relationship Groups's " +
                            gridContext.getViewSelector().getCurrentView().name,
                        querytype: 0,
                        returnedtypecode: secondaryEntityLogicalName,
                        fetchxml: derivedXml,
                        layoutxml: template.layoutxml,
                        layoutjson: template.layoutjson,
                        columnsetxml: template.columnsetxml
                    }

                    return Xrm.WebApi.createRecord("userquery", userquery).then((result) => {
                            gridContext.refresh();
                            navigateTo(formContext, gridContext, result.id, secondaryEntityLogicalName);
                        //    Xrm.Navigation.XrmOpenAlertDialog({
                        //            title: "Creating view",
                        //            text: "This will create a new peronal view for you: " + targetViewName
                        //        })
                        //        .then(function success() {
                        //            navigateTo(formContext, gridContext, result.id, secondaryEntityLogicalName);
                        //        });
                        },
                        error("Creating user query"));
                }
            },
            error("waiting for all queries to complete")
        );
    };

    return me;
}();