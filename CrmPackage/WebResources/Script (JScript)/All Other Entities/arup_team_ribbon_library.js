/// <reference path="../All Other Entities/arup_exitFormFunctions.js"/>"/>

/**
 * This file contains a javascript ribbon function that will dynamically create a Relationship team/Opportunity view.
 * This view will display opportunities connected to the current relationship team.
 * It will then attempt to open the view (although this not may not always work due to race conditions occurring in the UI)
 *
 * If the view already exists, it will use the existing view rather than creating a new view.
 * The View is created on the user level.
 */

if (typeof (ARUP) == "undefined") {
    ARUP = {};
}
if (typeof (ARUP.ccrm_bidreview ) == "undefined") {
    ARUP.ccrm_bidreview = {};
}

ARUP.ccrm_bidreview.ribbon = function() {
    var me = {};
    var Log = window.console.log.bind(window.console);


    function transform(sourceXml) {
        var rv = sourceXml;
        const parser = new DOMParser();
        const doc = parser.parseFromString(sourceXml, "application/xml");

        // Find "condition" node with an attribute of "teamid"
        const relatedTeamCondition =  doc.querySelector("condition[attribute='teamid'");
        if (!!relatedTeamCondition) {
            // Find the cookie node that we need to replace with the related team condition.
            const cookieNode = doc.querySelector("condition[attribute='name'][value='Relationship Team Opportunity Secret Cookie']");
            if (!!cookieNode) {
                const nodeToRemove = relatedTeamCondition.parentNode.parentNode;
                cookieNode.replaceWith(relatedTeamCondition);
                nodeToRemove.remove();
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

    function navigateTo(viewId) {
        return Xrm.Navigation.navigateTo({
            pageType: "entitylist",
            entityName: "opportunity",
            viewId: result.id,
            viewType: "userquery"
        });
    }

    me.createView = function(formContext, gridContext, primaryEntityLogicalName, secondaryEntityLogicalName) {
        debugger;

        // Get fetchXML of current view
        const fetchXml = gridContext.getFetchXml();
        const derivedXml = transform(fetchXml);
        // Get details of existing view
        const currentViewRef = gridContext.getViewSelector().getCurrentView();
        const targetViewName = formContext.getAttribute("name").getValue() +
            " - " +
            gridContext.getViewSelector().getCurrentView().name;
        var template = {};
        var existingViewId = null; 

        // Start async calls running to retrieve the details of the current view layout and to find 
        // any existing user view with the right name.
        const getTemplate = Xrm.WebApi.retreiveRecord(currentViewRef.entityType, currentViewRef.id).then(
            function success(result) {
                template = result;
            },
            error("Getting template record")
        );

        const getExisting = Xrm.WebApi.retreiveMultipleRecords("userquery", "?$select=userqueryid&$filter=name eq '" + targetViewName + "'")
            .then(function
                success(result) {
                    existingViewId = result.id;
                },
                error("Searching for existing user query")
                );


        // Wait for all async queries to complete.
        Promise.all([getTemplate, getExisting]).then(
            function createNew(result) {
                if (!!existingViewId) {
                    // Already a user view for this one.
                    return navigateTo(existingViewId);
                } else {
                    // Need to create a new view.

                    const userquery = {
                        name: targetViewName,
                        description: "Auto-created relationship group view for " +
                            formContext.getAttribute("name").getValue() +
                            " of the Relationship Groups's " +
                            gridContext.getViewSelector().getCurrentView().name,
                        querytype: 0,
                        returnedtypecode: "opportunity",
                        fetchxml: derivedXml,
                        layoutxml: template.layoutxml,
                        columnsetxml: template.columnsetxml
                    }

                    return Xrm.WebApi.createRecord("userquery", userquery).then((result) => {
                        debugger;
                        navigateTo(result.id);
                    },
                        error("Creating user query"));
                }
            },
            error("waiting for all queries to complete")
        );
    };

    return me;
}();