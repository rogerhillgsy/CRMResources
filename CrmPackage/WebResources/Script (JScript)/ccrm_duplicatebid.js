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
    var clientUrl = decodeURIComponent(oppObj.clientURL);
    GetResultData(clientUrl);
}

function getFilter() {
    var filterStr = "&$filter=statecode eq 0";//'&$filter=StateCode/Value eq 0'; // open opp
    if (oppObj != null) {
        if (oppObj.id != null) {
            filterStr += " and opportunityid ne '" + oppObj.id.replace("%7b", "").replace("%7d", "") + "'";//" and OpportunityId ne (guid'" + oppObj.id + "')";
        }
        if ($('#business').val() == 'yes') {
            if (oppObj.business != null) {
                filterStr += " and  _ccrm_arupbusinessid_value eq '" + oppObj.business.replace("%7b", "").replace("%7d", "") + "'";
            }
        }

        if ($('#disciplines').val()) {
            if ($('#disciplines').val() != 'No')
                filterStr += " and Microsoft.Dynamics.CRM.ContainValues(PropertyName='arup_disciplines',PropertyValues=%5B'" + $('#disciplines').val() + "'%5D)";//(, '" + $('#disciplines').val() + "')";//" and substringof('" + $('#disciplines').val() + "',Ccrm_DisciplinesName)";
        }

        if ($('#scope').val()) {
            if ($('#scope').val() == 'country') {
                filterStr += " and  _ccrm_projectlocationid_value eq '" + oppObj.projcountry + "'";
            }
        }
    }
    return filterStr;
}

function GetResultData(clientUrl) {
    // call our new method
    var retrievedBids;// = getODataRecords(queryUrl);
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: clientUrl + "/api/data/v9.1/opportunities?$select=_ccrm_arupbusinessid_value,_ccrm_bidmanager_userid_value,ccrm_bidreview,arup_disciplines,ccrm_estarupinvolvementstart,ccrm_estimatedvalue_num,_ccrm_project_transactioncurrencyid_value,_customerid_value,name,opportunityid" + getFilter(),
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
            XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
            XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        },
        async: false,
        success: function (data, textStatus, xhr) {
            //var results = data;
            retrievedBids = data.value;
        },
        error: function (xhr, textStatus, errorThrown) {
            Xrm.Navigation.openAlertDialog(textStatus + " " + errorThrown);
        }
    });
    var noResult = false;
    if (retrievedBids != null) {
        if (retrievedBids.length > 0) {
            renderData(clientUrl, retrievedBids);
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

function renderData(clientUrl,json) {

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
    var oppUrl = clientUrl + "/main.aspx?etn=opportunity&pagetype=entityrecord&id=";
    var accUrl = clientUrl + "/main.aspx?etn=account&pagetype=entityrecord&id=";
    for (var i = 0; i < json.length; i++) {
        tr = $('<tr />');
        tr.append("<td class='row'>" + (i + 1) + "</td>");
        tr.append("<td class='row'>" + json[i]["_ccrm_bidmanager_userid_value@OData.Community.Display.V1.FormattedValue"] + "</td>");
        tr.append("<td class='row'><a target='blank' href='" + oppUrl + json[i]["opportunityid"] + "'>" + json[i]["name"] + "</a></td>");
        tr.append("<td class='row'><a target='blank' href='" + accUrl + json[i]["_customerid_value"] + "'>" + json[i]["_customerid_value@OData.Community.Display.V1.FormattedValue"] + "</a></td>");
        tr.append("<td class='row'>" + json[i]["_ccrm_arupbusinessid_value@OData.Community.Display.V1.FormattedValue"] + "</td>");
        if (json[i]["ccrm_estarupinvolvementstart"]) {
            dateValue = json[i]["ccrm_estarupinvolvementstart@OData.Community.Display.V1.FormattedValue"];//new Date(parseInt(json[i]["ccrm_estarupinvolvementstart"].replace("/Date(", "").replace(")/", ""), 10)).format('dd/MM/yyyy');
        }
        else
            dateValue = '';
        tr.append("<td class='row'>" + dateValue + "</td>");
        tr.append("<td class='row'>" + json[i]["ccrm_estimatedvalue_num@OData.Community.Display.V1.FormattedValue"] + "</td>");
        tr.append("<td class='row'>" + json[i]["_ccrm_project_transactioncurrencyid_value@OData.Community.Display.V1.FormattedValue"] + "</td>");
        $('#dataTable').append(tr);
    }
}