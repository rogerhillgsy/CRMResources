var oppObj = new Object();

function getDataParam() {
    //Get the any query string parameters and load them
    //into the vals array

    var vals = new Array();
    if (location.search != "") {
        vals = location.search.substr(1).split("&");
        for (var i in vals) {
            vals[i] = vals[i].replace(/\+/g, " ").split("=");
        }
        for (var i in vals) {
            if (vals[i][0].toLowerCase() == "data") {
                var aaa = vals[i][1];
                var allparams = aaa.split('%26');
                for (var j in allparams) {
                    oppObj[allparams[j].split('%3d')[0]] = allparams[j].split('%3d')[1];
                }
                break;
            }
        }
    }
}

function RunReportClick() {
    $('#dataTable').html('');
    getDataParam();
    GetResultData();
}

function getFilter() {
    var filterStr = '&$filter=StateCode/Value eq 0'; // open opp
    if (oppObj != null) {
        if (oppObj.id != null) {
            filterStr += " and OpportunityId ne (guid'" + oppObj.id + "')";
        }
        if ($('#business').val() == 'yes') {
            if (oppObj.business != null) {
                filterStr += " and ccrm_arupbusinessid/Id eq (guid'" + oppObj.business + "')";
            }
        }

        if ($('#disciplines').val()) {
            if ($('#disciplines').val() != 'No')
                filterStr += " and substringof('" + $('#disciplines').val() + "',Ccrm_DisciplinesName)";
        }

        if ($('#scope').val()) {
            if ($('#scope').val() == 'country') {
                filterStr += " and ccrm_projectlocationid/Id eq (guid'" + oppObj.projcountry + "')";
            }
        }
    }
    return filterStr;
}

function GetResultData() {
    var serverUrl;
    serverUrl = Xrm.Page.context.getClientUrl();
    var ODataPath = serverUrl + "/XRMServices/2011/OrganizationData.svc";
    var queryUrl = ODataPath + "/OpportunitySet?$select=Ccrm_DisciplinesName,Ccrm_estimatedvalue_num,ccrm_project_transactioncurrencyid,OpportunityId,Name,ccrm_bidmanager_userid,CustomerId,ccrm_arupbusinessid,Ccrm_EstArupInvolvementStart" + getFilter();

    // call our new method
    var retrievedBids = getODataRecords(queryUrl);

    var noResult = false;
    if (retrievedBids != null) {
        if (retrievedBids.results.length > 0) {
            renderData(retrievedBids.results);
        }
        else
            noResult = true;
    }
    else
        noResult = true;

    if (noResult) {
        $('#divResult').hide();
        $('#dataTable').html('');
        $("#divnoResult").show();
    }
    else {
        $('#divResult').show();
        $("#divnoResult").hide();
    }

}

function renderData(json) {

    var tr, th;

    th = $('<tr/>');
    th.append("<td class='header'>#</td>");
    th.append("<td class='header'>Bid Manager</td>");
    th.append("<td class='header'>Project Name</td>");
    th.append("<td class='header'>Organization</td>");
    th.append("<td class='header'>Arup Business</td>");
    th.append("<td class='header'>Project Start Date</td>");
    th.append("<td class='header'>Fee Income</td>");
    th.append("<td class='header'>Project Currency</td>");
    $('#dataTable').append(th);
    var dateValue;
    var oppUrl = Xrm.Page.context.getClientUrl() + "/main.aspx?etn=opportunity&pagetype=entityrecord&id=";
    var accUrl = Xrm.Page.context.getClientUrl() + "/main.aspx?etn=account&pagetype=entityrecord&id=";
    for (var i = 0; i < json.length; i++) {
        tr = $('<tr />');
        tr.append("<td class='row'>" + (i + 1) + "</td>");
        tr.append("<td class='row'>" + json[i].ccrm_bidmanager_userid.Name + "</td>");
        tr.append("<td class='row'><a target='blank' href='" + oppUrl + json[i].OpportunityId + "'>" + json[i].Name + "</a></td>");
        tr.append("<td class='row'><a target='blank' href='" + accUrl + json[i].CustomerId.Id + "'>" + json[i].CustomerId.Name + "</a></td>");
        tr.append("<td class='row'>" + json[i].ccrm_arupbusinessid.Name + "</td>");
        if (json[i].Ccrm_EstArupInvolvementStart) {
            dateValue = new Date(parseInt(json[i].Ccrm_EstArupInvolvementStart.replace("/Date(", "").replace(")/", ""), 10)).format('dd/MM/yyyy');
        }
        else
            dateValue = '';
        tr.append("<td class='row'>" + dateValue + "</td>");
        tr.append("<td class='row'>" + json[i].Ccrm_estimatedvalue_num + "</td>");
        tr.append("<td class='row'>" + json[i].ccrm_project_transactioncurrencyid.Name + "</td>");
        $('#dataTable').append(tr);


    }
}

function getODataRecords(ODataUrl) {
    var resultLimit = 990;
    //  return an object with a similar structure as the OData endpoint
    var allRecords = new Object();
    allRecords.results = new Array();

    //  loop until we have an url to query
    var queryUrl = ODataUrl;
    while (queryUrl != null) {

        //  build the request
        var ODataRequest = new XMLHttpRequest();
        ODataRequest.open("GET", queryUrl, false); // false = synchronous request
        ODataRequest.setRequestHeader("Accept", "application/json");
        ODataRequest.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        ODataRequest.send();

        if (ODataRequest.status === 200) {
            var parsedResults = JSON.parse(ODataRequest.responseText).d;
            if (parsedResults != null && parsedResults.results != null) {

                console.log(parsedResults.results.length);
                //  add the results to our object
                for (var i = 0; i < parsedResults.results.length; i++) {
                    allRecords.results.push(parsedResults.results[i]);
                }

                // check if there are more records and set the new url, otherwise  set to null the url
                if (parsedResults.__next != null && allRecords.results.length < resultLimit) {
                    queryUrl = parsedResults.__next;
                }
                else {
                    queryUrl = null;
                }
            }
        } else {
            // if the request has errors  stop and return a null result
            queryUrl = null;
            allRecords = null;
        }
    }
    return allRecords;
}