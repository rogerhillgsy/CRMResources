//var timer = setInterval(function () { GetSubgrid(); }, 1000);

function Form_onload() {

    gridOnLoad();

    //var clientsSubGrid = Xrm.Page.getControl("ClientsGroupOrganisations");

    //var clientSubgridGrid = clientsSubGrid.getGrid().getTotalRecordCount();

    //alert('# of record' + clientSubgridGrid);

}

function gridOnLoad() {

    var objSubGrid = document.getElementById("ClientsGroupOrganisations");

    if (objSubGrid == null) {
        setTimeout(gridOnLoad, 2000);
        return;
    }
    else {
        //when subgrid is loaded, get GUID
        var GUIDvalue = Xrm.Page.data.entity.getId();

        //alert(GUIDvalue);

        //var totalRecords = Xrm.page.getControl("ClientsGroupOrganisations").getGrid().getTotalRecordCount();

        //alert(totalRecords);

    }    

}

//function GetSubgrid() {

//    alert("in");
//    var sgrid = Xrm.Page.getControl("ClientsGroupOrganisations");
//    if (sgrid != null) {
//        var recs = Xrm.Page.getControl("ClientsGroupOrganisations").getGrid().getTotalRecordCount();
//        clearInterval(timer);
//        alert(recs);
//        }
//    else { alert("no luck"); }
//    alert("out");
//}